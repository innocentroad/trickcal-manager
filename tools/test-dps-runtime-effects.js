'use strict';

const assert = require('node:assert/strict');
const simulator = require('../dps-simulator.js');

function createFixture({
  initialTargetStatuses = [],
  damageBuffEffects = [],
  attackSpeedEffects = [],
  spRecoveryEffects = [],
  eventEffects = [],
  resources = [],
  timingEvents = null,
  generatedObjects = [],
  durationSeconds = 1
} = {}) {
  const apostle = {
    id: 'RuntimeEffectTest',
    basic: { spRecoveryPerSecond: 0 },
    skills: [{
      skillId: 'RuntimeEffectTest_basic',
      skillType: '普通攻撃_基本',
      effects: [
        { effectId: 'damage', valueKind: '物理ダメージ', valueClass: '倍率', effectType: '攻撃', fixedValue: 100 },
        { effectId: 'poison', processGroupId: 'poison_proc', valueKind: '毒', valueClass: '状態付与', effectType: 'デバフ', effectStack: true, maxStack: 9 },
        { effectId: 'poison_duration', processGroupId: 'poison_proc', valueKind: '毒', valueClass: '持続時間', effectType: 'デバフ', fixedValue: 10 }
      ]
    }]
  };
  const timing = {
    id: 'runtime-effect-test',
    initialActionDelayFrames: 0,
    normalAttackIntervalFrames: 10,
    actions: {
      basicAttack: {
        motionFrames: 2,
        motionVariants: [{ branch: '', gameFrames: 2 }],
        timingEvents: timingEvents || [
          { frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' },
          { frame: 1, order: 2, effectKind: '効果', effectId: 'poison' }
        ],
        generatedObjects
      }
    }
  };
  const config = simulator.buildCombatantConfig(apostle, timing, {
    runtimeEffects: {
      initialTargetStatuses,
      damageBuffEffects,
      attackSpeedEffects,
      spRecoveryEffects,
      eventEffects,
      resources
    }
  });
  const damageProfiles = {
    basicAttack: {
      variants: {
        default: {
          effects: { damage: { effectId: 'damage', expectedDamage: 100 } },
          totalExpectedDamage: 100
        }
      }
    }
  };
  return simulator.simulate(config, {
    durationSeconds,
    initialActionDelayFrames: 0,
    damageProfiles,
    recordTimeline: true,
    maxTimelineEvents: 500
  });
}

const poisonResult = createFixture({
  damageBuffEffects: [{
    id: 'target-poison-bonus',
    label: '毒状態対象への与ダメージ増加',
    mode: 'conditionalStatus',
    conditionType: '対象状態',
    requiredStatus: '毒',
    modifiers: { addP: 50 },
    baselineModifiersByAction: {}
  }]
});
const poisonHits = poisonResult.timeline.filter(event => event.type === 'hit');
assert.equal(poisonHits[0].expectedDamage, 100, '状態を付与するヒットには状態条件補正を適用しない');
assert.equal(poisonHits[1].expectedDamage, 150, '状態付与後のヒットには状態条件補正を適用する');

const targetResult = createFixture({
  initialTargetStatuses: [{ status: 'Leets_target', sourceSelf: true }],
  damageBuffEffects: [{
    id: 'leets-target-bonus',
    label: '目標への与ダメージ増加',
    mode: 'conditionalStatus',
    conditionType: '攻撃対象状態',
    requiredStatus: 'Leets_target',
    requireSelfSource: true,
    modifiers: { addP: 60 },
    baselineModifiersByAction: {}
  }]
});
const targetHits = targetResult.timeline.filter(event => event.type === 'hit');
assert.equal(targetHits[0].expectedDamage, 160, '現在の攻撃対象へ付与する固有状態を初回ヒットから適用する');
assert.ok(targetHits[0].damageEvaluation.activeEffects.some(effect => effect.id === 'leets-target-bonus'));

const sourceEventResult = createFixture({
  timingEvents: [
    { frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' },
    { frame: 1, order: 2, effectKind: '効果', effectId: 'buff_source' },
    { frame: 1, order: 3, effectKind: 'ダメージ', effectId: 'damage' }
  ],
  damageBuffEffects: [{
    id: 'source-event-bonus',
    label: '発生元イベント後の与ダメージ増加',
    mode: 'sourceEventTimed',
    triggerSourceId: 'buff_source',
    triggerActionKeys: ['basicAttack'],
    sourceEventFallbackMode: 'actionTimed',
    durationFrames: 60,
    modifiers: { addP: 50 },
    baselineModifiersByAction: {}
  }]
});
const sourceEventHits = sourceEventResult.timeline.filter(event => event.type === 'hit');
assert.equal(sourceEventHits[0].expectedDamage, 100, '発動元より前の同一フレーム攻撃には補正しない');
assert.equal(sourceEventHits[1].expectedDamage, 150, '発動元より後の同一フレーム攻撃には補正する');
assert.ok(sourceEventResult.timeline.some(event => (
  event.type === 'runtimeBuffApplied' && event.reason === 'buff_source発生時'
)));

const sourceUtilityResult = createFixture({
  timingEvents: [
    { frame: 1, order: 1, effectKind: '効果', effectId: 'utility_source' }
  ],
  attackSpeedEffects: [{
    id: 'source-event-haste',
    label: '発生元イベント後の攻撃速度増加',
    mode: 'sourceEventTimed',
    triggerSourceId: 'utility_source',
    triggerActionKeys: ['basicAttack'],
    sourceEventFallbackMode: 'actionTimed',
    hasteP: 20,
    durationFrames: 60
  }],
  spRecoveryEffects: [{
    id: 'source-event-sp',
    effectId: 'source-event-sp',
    label: '発生元イベント時のSP回復',
    mode: 'sourceEvent',
    triggerSourceId: 'utility_source',
    triggerActionKeys: ['basicAttack'],
    sourceEventFallbackMode: 'action',
    fixed: 4
  }]
});
assert.ok(sourceUtilityResult.timeline.some(event => (
  event.type === 'attackSpeedApplied' && event.reason === 'utility_source発生時'
)), '発動元イベントで攻撃速度効果を起動する');
assert.ok(sourceUtilityResult.timeline.some(event => (
  event.type === 'spRecoveryEvent' && event.reason === 'utility_source発生時' && event.requestedAmount === 4
)), '発動元イベントでSP回復効果を起動する');

const fallbackResult = createFixture({
  damageBuffEffects: [{
    id: 'missing-source-bonus',
    label: '未調査発動元の与ダメージ増加',
    mode: 'sourceEventTimed',
    triggerSourceId: 'missing_source_e01',
    triggerActionKeys: ['basicAttack'],
    sourceEventFallbackMode: 'actionTimed',
    durationFrames: 60,
    modifiers: { addP: 50 },
    baselineModifiersByAction: {}
  }]
});
assert.equal(fallbackResult.timeline.find(event => event.type === 'hit').expectedDamage, 150,
  '発動元タイミング未登録時は行動開始時近似へ戻す');
assert.ok(fallbackResult.warnings.some(warning => warning.includes('missing_source_e01')),
  '発動元タイミング未登録を警告する');

const periodicStatusResult = createFixture({
  durationSeconds: 1,
  eventEffects: [{
    id: 'favorite-periodic',
    label: '10秒ごとの雪の花（試験短縮）',
    triggerType: 'n秒ごと',
    intervalFrames: 10,
    steps: [
      { type: 'damage', order: 1, effectId: 'favorite_damage', expectedDamage: 500 },
      {
        type: 'status',
        order: 2,
        application: {
          status: '凍傷',
          durationFrames: 20,
          stackable: true,
          maxStacks: 9,
          stackGroupId: 'favorite_frostbite',
          dealsPeriodicDamage: true,
          tickFrames: 60,
          tickMultiplier: 9
        }
      }
    ]
  }]
});
assert.ok(periodicStatusResult.timeline.some(event => (
  event.type === 'runtimeEffectHit' && event.runtimeEffectId === 'favorite-periodic' && event.expectedDamage === 500
)), '周期効果の独立ダメージを評価する');
assert.ok(periodicStatusResult.timeline.some(event => event.type === 'statusApplied' && event.status === '凍傷'),
  '周期効果と同じ処理グループで凍傷を付与する');
assert.ok(periodicStatusResult.damage.byRuntimeEffect['favorite-periodic'] >= 500,
  '周期効果のダメージを行動ダメージと分離して集計する');

const chargeProcResult = createFixture({
  durationSeconds: 1,
  resources: [{ id: '雪の花満開チャージ', name: '雪の花満開チャージ', initialStacks: 0, maxStacks: 1 }],
  eventEffects: [
    {
      id: 'aya-charge',
      label: '雪の花満開チャージ',
      triggerType: 'n秒ごと',
      intervalFrames: 4,
      conditionResource: { id: '雪の花満開チャージ', max: 0 },
      steps: [{ type: 'resource', order: 1, resourceId: '雪の花満開チャージ', operation: 'gain', amount: 1 }]
    },
    {
      id: 'aya-normal-proc',
      label: '雪の花満開追加攻撃',
      triggerType: '普通攻撃命中時',
      triggerActionKeys: ['basicAttack', 'enhancedAttack'],
      oncePerAction: true,
      conditionResource: { id: '雪の花満開チャージ', min: 1 },
      steps: [
        { type: 'resource', order: 1, resourceId: '雪の花満開チャージ', operation: 'consume', amount: 1 },
        { type: 'damage', order: 2, effectId: 'aya_extra_damage', expectedDamage: 650 },
        {
          type: 'status',
          order: 3,
          application: {
            status: '気絶', durationFrames: 90, stackable: false, maxStacks: 1,
            stackGroupId: 'aya_stun', dealsPeriodicDamage: false, tickFrames: 0, tickMultiplier: 0
          }
        }
      ]
    }
  ]
});
assert.ok(chargeProcResult.timeline.some(event => (
  event.type === 'resourceChange' && event.operation === 'gain' && event.resourceName === '雪の花満開チャージ'
)), '周期的にチャージを獲得する');
assert.ok(chargeProcResult.timeline.some(event => (
  event.type === 'runtimeEffectHit' && event.runtimeEffectId === 'aya-normal-proc' && event.expectedDamage === 650
)), 'チャージ所持中の次の普通攻撃命中時に追加攻撃する');
assert.ok(chargeProcResult.timeline.some(event => event.type === 'statusApplied' && event.status === '気絶'),
  '追加攻撃と同時に気絶を付与する');

const generatedTriggerResult = createFixture({
  durationSeconds: 1,
  generatedObjects: [{
    id: 'Aya_low_butterfly',
    name: '蝶',
    spawnFrame: 0,
    timingEvents: [
      { frame: 1, timeOrigin: '生成時', eventType: '命中', effectKind: 'ダメージ', effectId: 'damage' },
      { frame: 3, timeOrigin: '生成時', eventType: '帰還', effectKind: '帰還', effectId: '' }
    ]
  }],
  eventEffects: [
    {
      id: 'aya-butterfly-frostbite',
      label: '蝶の凍傷',
      triggerType: '生成物命中時',
      triggerSourceId: 'Aya_low_butterfly',
      steps: [{
        type: 'status',
        order: 1,
        application: {
          status: '凍傷', durationFrames: 600, stackable: true, maxStacks: 9,
          stackGroupId: 'aya-butterfly-frostbite', dealsPeriodicDamage: true, tickFrames: 60, tickMultiplier: 9
        }
      }]
    },
    {
      id: 'aya-butterfly-heal',
      label: '蝶の帰還回復',
      triggerType: '生成物帰還時',
      triggerSourceId: 'Aya_low_butterfly',
      steps: [{ type: 'healing', order: 1, value: 20, reference: '最大HP' }]
    }
  ]
});
assert.ok(generatedTriggerResult.timeline.some(event => (
  event.type === 'statusApplied' && event.status === '凍傷'
)), '生成物の命中イベントから凍傷を付与する');
assert.ok(generatedTriggerResult.timeline.some(event => (
  event.type === 'runtimeHealingEvent' && event.runtimeEffectId === 'aya-butterfly-heal' && event.value === 20
)), '生成物の帰還イベントから最大HP参照回復を記録する');

console.log('DPS runtime effect tests passed');
