'use strict';

const assert = require('node:assert/strict');
const simulator = require('../dps-simulator.js');

const multiActionFavorite = {
  skillId: 'favorite_rewrite_test',
  effects: [
    { effectId: 'basic_damage', effectType: '攻撃', valueClass: '倍率', fixedValue: 200, targetSkill: '普通攻撃_基本' },
    { effectId: 'enhanced_damage', effectType: '攻撃', valueClass: '倍率', fixedValue: 444, targetSkill: '普通攻撃_強化' }
  ]
};
assert.deepEqual(
  simulator.createActionSkillOverride(multiActionFavorite, 'basicAttack').effects.map(effect => effect.effectId),
  ['basic_damage'],
  '複数行動を書き換える愛用品は基本攻撃へ強化攻撃の倍率を混在させない'
);
assert.deepEqual(
  simulator.createActionSkillOverride(multiActionFavorite, 'enhancedAttack').effects.map(effect => effect.effectId),
  ['enhanced_damage'],
  '複数行動を書き換える愛用品は強化攻撃へ基本攻撃の倍率を混在させない'
);
const rewriteTimingConfig = simulator.buildCombatantConfig({
  id: 'rewrite_test',
  skills: [{
    skillId: 'base_basic',
    skillType: '普通攻撃_基本',
    effects: [{ effectId: 'base_damage', effectType: '攻撃', valueClass: '倍率', fixedValue: 100 }]
  }]
}, {
  normalAttackIntervalFrames: 60,
  actions: {
    basicAttack: {
      motionFrames: 30,
      timingEvents: [{ frame: 15, order: 1, effectKind: 'ダメージ', effectId: 'base_damage' }]
    }
  }
}, {
  skillOverrides: {
    basicAttack: simulator.createActionSkillOverride(multiActionFavorite, 'basicAttack')
  }
});
assert.equal(
  rewriteTimingConfig.actions.basicAttack.variants.default[0].effectId,
  'basic_damage',
  '元スキルの発生フレームを流用してもDPS倍率は置換後effectIdから取得する'
);

assert.equal(simulator.selectEnemySizeVariantBranch(
  ['小型敵', '中型敵', '大型敵', '超大型敵'], 'small', 2
), '小型敵', '小型プリセットは小型敵分岐を選ぶ');
assert.equal(simulator.selectEnemySizeVariantBranch(
  ['小型敵', '中型敵', '大型敵', '超大型敵'], 'extraLarge', 5
), '超大型敵', '超大型プリセットは超大型敵分岐を選ぶ');
assert.equal(simulator.selectEnemySizeVariantBranch(
  ['小型敵', '中型敵', '大型敵', '超大型敵'], 'extraSmall', 1
), '小型敵', '未調査の超小型は最も近い小型敵分岐で近似する');

assert.equal(
  simulator.evaluateDamageAtHit({
    expectedDamage: 100,
    actionKey: 'lowSkill',
    generatedEventType: '自爆',
    modifierDelta: { selfDestructMultiplierBonusP: 200 }
  }).expectedDamage,
  300,
  '低学年に属する生成物の自爆にも自爆専用行動倍率を適用する'
);

function createFixture({
  initialTargetStatuses = [],
  damageBuffEffects = [],
  attackSpeedEffects = [],
  spRecoveryEffects = [],
  cooldownEffects = [],
  eventEffects = [],
  externalEvents = [],
  resources = [],
  timingEvents = null,
  lowTimingEvents = [],
  highTimingEvents = [],
  generatedObjects = [],
  movementTransitions = [],
  durationSeconds = 1,
  highSkillCooldownSeconds = 0,
  highSkillMode = 'disabled',
  initialHighSkillCooldownMultiplier = 1,
  includePoison = true,
  baseSpRegen = 0,
  spRecoveryIntervalFrames = 60,
  statusDamageProfiles = null,
  statusDamageWeaknessP = 0,
  statusReactions = [],
  runtimeWarnings = [],
  basicRuntimeBase = null,
  normalAttackIntervalFrames = 10,
  enableFastForward = true
} = {}) {
  const apostle = {
    id: 'RuntimeEffectTest',
    basic: { spRecoveryPerSecond: baseSpRegen },
    skills: [{
      skillId: 'RuntimeEffectTest_basic',
      skillType: '普通攻撃_基本',
      effects: [
        { effectId: 'damage', valueKind: '物理ダメージ', valueClass: '倍率', effectType: '攻撃', fixedValue: 100 },
        ...(includePoison ? [
          { effectId: 'poison', processGroupId: 'poison_proc', valueKind: '毒', valueClass: '状態付与', effectType: 'デバフ', effectStack: true, maxStack: 9 },
          { effectId: 'poison_duration', processGroupId: 'poison_proc', valueKind: '毒', valueClass: '持続時間', effectType: 'デバフ', fixedValue: 10 }
        ] : [])
      ]
    }, {
      skillId: 'RuntimeEffectTest_low',
      skillType: '低学年',
      effects: []
    }, {
      skillId: 'RuntimeEffectTest_high',
      skillType: '高学年',
      cooldownSeconds: highSkillCooldownSeconds,
      effects: []
    }]
  };
  const timing = {
    id: 'runtime-effect-test',
    initialActionDelayFrames: 0,
    normalAttackIntervalFrames,
    spRecoveryIntervalFrames,
    movementTransitions,
    actions: {
      basicAttack: {
        motionFrames: 2,
        motionVariants: [{ branch: '', gameFrames: 2 }],
        timingEvents: timingEvents || [
          { frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' },
          { frame: 1, order: 2, effectKind: '効果', effectId: 'poison' }
        ],
        generatedObjects
      },
      lowSkill: {
        motionFrames: 2,
        motionVariants: [{ branch: '', gameFrames: 2 }],
        timingEvents: lowTimingEvents
      },
      highSkill: {
        motionFrames: 2,
        motionVariants: [{ branch: '', gameFrames: 2 }],
        timingEvents: highTimingEvents
      }
    }
  };
  const config = simulator.buildCombatantConfig(apostle, timing, {
    runtimeEffects: {
      initialTargetStatuses,
      damageBuffEffects,
      attackSpeedEffects,
      spRecoveryEffects,
      cooldownEffects,
      eventEffects,
      externalEvents,
      resources,
      statusDamageWeaknessP,
      statusReactions,
      warnings: runtimeWarnings
    }
  });
  const damageProfiles = {
    basicAttack: {
      variants: {
        default: {
          effects: { damage: { effectId: 'damage', expectedDamage: 100, damageResult: basicRuntimeBase ? { runtimeBase: basicRuntimeBase } : undefined } },
          totalExpectedDamage: 100
        }
      }
    }
  };
  return simulator.simulate(config, {
    durationSeconds,
    initialActionDelayFrames: 0,
    damageProfiles,
    highSkillMode,
    initialHighSkillCooldownMultiplier,
    recordTimeline: true,
    maxTimelineEvents: 500,
    statusDamageProfiles: statusDamageProfiles || {},
    enableFastForward
  });
}

const runtimeWarningResult = createFixture({
  includePoison: false,
  runtimeWarnings: ['DPSランタイム効果の重複: test']
});
assert.ok(runtimeWarningResult.warnings.includes('DPSランタイム効果の重複: test'),
  '変換段階の重複監査警告をシミュレーション結果へ引き継ぐ');

const fixedCooldownResult = createFixture({
  durationSeconds: 2,
  highSkillCooldownSeconds: 1,
  highSkillMode: 'auto',
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }]
});
const fixedHighStart = fixedCooldownResult.timeline.find(event => (
  event.type === 'actionStart' && event.actionKey === 'highSkill'
));
const fixedCooldownResultWithoutFastForward = createFixture({
  durationSeconds: 2,
  highSkillCooldownSeconds: 1,
  highSkillMode: 'auto',
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  enableFastForward: false
});
const fixedHighStartWithoutFastForward = fixedCooldownResultWithoutFastForward.timeline.find(event => (
  event.type === 'actionStart' && event.actionKey === 'highSkill'
));
assert.ok(fixedHighStartWithoutFastForward, '低速基準でも高学年を発動する');
assert.equal(fixedHighStart?.frame, fixedHighStartWithoutFastForward.frame, '待機中の高速化で高学年発動時刻を変えない');
assert.ok(fixedHighStart && fixedHighStart.frame >= 60,
  'CT変更がない場合は従来どおり基礎CT経過後に高学年を発動する');

const reducedCooldownResult = createFixture({
  durationSeconds: 2,
  highSkillCooldownSeconds: 1,
  highSkillMode: 'auto',
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  cooldownEffects: [{
    id: 'basic-hit-ct-reduction',
    label: '基本攻撃命中時CT減少',
    mode: 'actionHit',
    triggerActionKeys: ['basicAttack'],
    targetActionKey: 'highSkill',
    operation: 'subtract',
    amountFrames: 6
  }]
});
const firstCooldownChange = reducedCooldownResult.timeline.find(event => event.type === 'cooldownChanged');
const reducedHighStart = reducedCooldownResult.timeline.find(event => (
  event.type === 'actionStart' && event.actionKey === 'highSkill'
));
assert.equal(firstCooldownChange.beforeFrames, 59, '命中時点の残りCTを基準にする');
assert.equal(firstCooldownChange.afterFrames, 53, '指定フレーム分だけ残りCTを減少する');
assert.ok(reducedHighStart.frame < fixedHighStart.frame, '命中時CT減少により高学年発動を前倒しする');

const simultaneousReadyResult = createFixture({
  durationSeconds: 1,
  highSkillCooldownSeconds: 1,
  highSkillMode: 'auto',
  initialHighSkillCooldownMultiplier: 0,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  spRecoveryEffects: [{
    id: 'initial-full-sp',
    label: '初期SP満タン',
    mode: 'initial',
    fixed: 300
  }]
});
const firstReadySkill = simultaneousReadyResult.timeline.find(event => (
  event.type === 'actionStart' && ['lowSkill', 'highSkill'].includes(event.actionKey)
));
assert.equal(firstReadySkill.actionKey, 'lowSkill', 'SP満タンと高学年CT完了が同時なら低学年を優先する');

const externalEventResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  externalEvents: [{
    id: 'shield-break-1',
    type: 'shieldBreak',
    frame: 12,
    sourceId: 'snoozy_shield',
    reason: '豆乳シールド破壊'
  }],
  eventEffects: [{
    id: 'shield-break-status',
    label: 'シールド破壊時の検証状態',
    triggerType: 'シールド破壊時',
    triggerSourceId: 'snoozy_shield',
    steps: [{
      type: 'status',
      order: 1,
      application: {
        status: '検証状態', durationFrames: 60, stackable: false, maxStacks: 1,
        stackGroupId: 'shield-break-status', dealsPeriodicDamage: false,
        tickFrames: 0, tickMultiplier: 0
      }
    }]
  }]
});
assert.equal(externalEventResult.timeline.find(event => event.type === 'externalEvent')?.frame, 12,
  '外部イベントを指定フレームに投入する');
assert.equal(externalEventResult.timeline.find(event => event.type === 'statusApplied' && event.status === '検証状態')?.frame, 12,
  'シールド破壊イベントから効果処理グループを起動する');
const sourceLessShieldEndedResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  externalEvents: [{
    id: 'shield-ended-without-id',
    type: 'シールド終了時',
    frame: 12,
    reason: 'シールド終了（発動元IDなし）'
  }],
  eventEffects: [{
    id: 'shield-ended-status',
    label: 'シールド終了時の検証状態',
    triggerType: 'シールド終了時',
    triggerSourceId: 'vivi_shield_effect',
    steps: [{
      type: 'status',
      order: 1,
      application: {
        status: 'シールド終了状態', durationFrames: 60, stackable: false, maxStacks: 1,
        stackGroupId: 'shield-ended-status', dealsPeriodicDamage: false,
        tickFrames: 0, tickMultiplier: 0
      }
    }]
  }]
});
assert.equal(sourceLessShieldEndedResult.timeline.find(event => (
  event.type === 'statusApplied' && event.status === 'シールド終了状態'
))?.frame, 12, '発動元IDを入力しないシールド終了イベントでも連鎖効果を起動する');
const directExternalStatusResult = createFixture({
  durationSeconds: 2,
  includePoison: false,
  externalEvents: [{
    id: 'direct-status-1',
    type: 'statusApplied',
    frame: 12,
    sourceId: 'status-source',
    status: '毒',
    statusDurationFrames: 90,
    reason: '外部状態を直接付与'
  }],
  eventEffects: [{
    id: 'direct-status-chain',
    label: '直接付与状態の連鎖',
    triggerType: '状態付与時',
    triggerSourceId: '毒',
    conditionType: '付与者',
    conditionValue: 'status-source',
    steps: [{
      type: 'status',
      order: 1,
      application: {
        status: '直接付与連鎖状態', durationFrames: 60, stackable: false, maxStacks: 1,
        stackGroupId: 'direct-status-chain', dealsPeriodicDamage: false,
        tickFrames: 0, tickMultiplier: 0
      }
    }]
  }],
  statusDamageProfiles: { 毒: { expectedDamage: 1 } }
});
assert.equal(directExternalStatusResult.timeline.find(event => (
  event.type === 'statusApplied' && event.status === '毒'
))?.frame, 12, '外部イベントのstatus値から状態を直接付与する');
assert.equal(directExternalStatusResult.timeline.filter(event => (
  event.type === 'statusApplied' && event.status === '直接付与連鎖状態'
)).length, 1, '外部から直接付与した状態を状態付与時の連鎖へ一度だけ接続する');
assert.equal(directExternalStatusResult.timeline.find(event => (
  event.type === 'statusTick' && event.status === '毒'
))?.frame, 72, '外部から直接付与したDoT状態も既存の周期処理へ接続する');
assert.equal(directExternalStatusResult.timeline.find(event => (
  event.type === 'statusExpired' && event.status === '毒'
))?.frame, 102, '外部から直接付与した状態の持続時間を処理する');
assert.equal(directExternalStatusResult.finalState.activeStatuses.毒, 0,
  '外部状態の期限後はアクティブ状態から除外する');
const hpThresholdEventResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  externalEvents: [{ id: 'hp-50', type: 'hpThreshold', frame: 18, value: 50 }],
  eventEffects: [{
    id: 'hp-threshold-status',
    label: 'HP50%条件',
    triggerType: 'HP閾値',
    triggerValue: 50,
    steps: [{
      type: 'status',
      order: 1,
      application: {
        status: 'HP条件成立', durationFrames: 60, stackable: false, maxStacks: 1,
        stackGroupId: 'hp-threshold-status', dealsPeriodicDamage: false,
        tickFrames: 0, tickMultiplier: 0
      }
    }]
  }]
});
assert.equal(hpThresholdEventResult.timeline.find(event => (
  event.type === 'statusApplied' && event.status === 'HP条件成立'
))?.frame, 18, '手動HP閾値イベントは発動条件値と一致した効果だけを起動する');
const hpThresholdMismatchResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  externalEvents: [{ id: 'hp-40', type: 'hpThreshold', frame: 18, value: 40 }],
  eventEffects: [{
    id: 'hp-threshold-mismatch',
    label: 'HP50%条件',
    triggerType: 'HP閾値',
    triggerValue: 50,
    steps: [{
      type: 'status', order: 1,
      application: {
        status: 'HP条件誤発動', durationFrames: 60, stackable: false, maxStacks: 1,
        stackGroupId: 'hp-threshold-mismatch', dealsPeriodicDamage: false,
        tickFrames: 0, tickMultiplier: 0
      }
    }]
  }]
});
assert.equal(hpThresholdMismatchResult.timeline.some(event => event.status === 'HP条件誤発動'), false,
  '異なるHP閾値の手動イベントで効果を誤発動しない');
const periodicExternalEventResult = createFixture({
  durationSeconds: 3,
  includePoison: false,
  externalEvents: [{
    id: 'periodic-damage-taken', type: 'damageTaken', frame: 12,
    intervalFrames: 30, repeatCount: 3, reason: '周期被弾'
  }],
  eventEffects: [{
    id: 'periodic-damage-taken-effect', label: '周期被弾効果', triggerType: '被弾時',
    steps: [{ type: 'healing', order: 1, value: 1, reference: '最大HP' }]
  }]
});
assert.deepEqual(
  periodicExternalEventResult.timeline.filter(event => event.type === 'externalEvent').map(event => event.frame),
  [12, 42, 72],
  '外部イベントを指定間隔・指定回数で繰り返す'
);
assert.equal(periodicExternalEventResult.timeline.filter(event => (
  event.type === 'runtimeHealingEvent' && event.runtimeEffectId === 'periodic-damage-taken-effect'
)).length, 3, '周期外部イベントの各回で効果処理を起動する');
const estimatedFormationEventResult = createFixture({
  durationSeconds: 4,
  includePoison: false,
  externalEvents: [{
    id: 'auto:formation:ally-low', type: '低学年スキル使用時', frame: 60,
    intervalFrames: 120, repeatCount: 2, sourceId: 'AllyA',
    triggerSourceId: 'AllyA_low_skill', reason: '味方A / 低学年（自動推定）'
  }],
  eventEffects: [{
    id: 'formation-low-effect', label: '編成低学年連動状態',
    triggerType: '低学年スキル使用時', triggerSourceId: 'AllyA_low_skill',
    steps: [{
      type: 'status', order: 1,
      application: {
        status: '編成低学年状態', durationFrames: 90, stackable: false, maxStacks: 1,
        stackGroupId: 'formation-low-effect', dealsPeriodicDamage: false,
        tickFrames: 0, tickMultiplier: 0
      }
    }]
  }]
});
assert.deepEqual(
  estimatedFormationEventResult.timeline.filter(event => event.type === 'externalEvent').map(event => event.frame),
  [60, 180],
  '自動推定の編成周期イベントを指定秒・間隔でシミュレーターへ渡す'
);
assert.deepEqual(
  estimatedFormationEventResult.timeline.filter(event => event.type === 'statusApplied' && event.status === '編成低学年状態').map(event => event.frame),
  [60, 180],
  '自動推定の編成周期イベントを対応bindingの効果へ一度ずつ届ける'
);
const openEndedExternalEventResult = createFixture({
  durationSeconds: 2,
  includePoison: false,
  externalEvents: [{
    id: 'open-ended-status', type: 'statusApplied', frame: 0,
    intervalFrames: 60, repeatCount: 0, reason: '終了まで周期'
  }]
});
assert.deepEqual(
  openEndedExternalEventResult.timeline.filter(event => event.type === 'externalEvent').map(event => event.frame),
  [0, 60, 120],
  '回数0の周期外部イベントは計測終了フレームまで繰り返す'
);
const externalEventFastResult = createFixture({
  durationSeconds: 2,
  includePoison: false,
  // 外部イベント以外の周期イベントが待機先にならないケースを検証する。
  baseSpRegen: 0,
  externalEvents: [{
    id: 'shield-break-queued',
    type: 'shieldBreak',
    frame: 72,
    sourceId: 'snoozy_shield',
    reason: 'キュー検証'
  }],
  eventEffects: [{
    id: 'shield-break-queued-status',
    label: 'キュー検証状態',
    triggerType: 'シールド破壊時',
    triggerSourceId: 'snoozy_shield',
    steps: [{
      type: 'status',
      order: 1,
      application: {
        status: 'キュー検証状態', durationFrames: 60, stackable: false, maxStacks: 1,
        stackGroupId: 'shield-break-queued-status', dealsPeriodicDamage: false,
        tickFrames: 0, tickMultiplier: 0
      }
    }]
  }]
});
const externalEventSlowResult = createFixture({
  durationSeconds: 2,
  includePoison: false,
  baseSpRegen: 0,
  externalEvents: [{
    id: 'shield-break-queued',
    type: 'shieldBreak',
    frame: 72,
    sourceId: 'snoozy_shield',
    reason: 'キュー検証'
  }],
  eventEffects: [{
    id: 'shield-break-queued-status',
    label: 'キュー検証状態',
    triggerType: 'シールド破壊時',
    triggerSourceId: 'snoozy_shield',
    steps: [{
      type: 'status',
      order: 1,
      application: {
        status: 'キュー検証状態', durationFrames: 60, stackable: false, maxStacks: 1,
        stackGroupId: 'shield-break-queued-status', dealsPeriodicDamage: false,
        tickFrames: 0, tickMultiplier: 0
      }
    }]
  }]
});
assert.deepEqual(
  externalEventFastResult.timeline,
  externalEventSlowResult.timeline,
  '外部イベントと基礎SP回復を待機キュー化しても時系列を変えない'
);
assert.ok(externalEventFastResult.performance.fastForwardCount > 0,
  '外部イベント・基礎SP回復の待機中に高速化する');

const pausedSpFastResult = createFixture({
  durationSeconds: 4,
  includePoison: false,
  baseSpRegen: 300,
  spRecoveryIntervalFrames: 60
});
const pausedSpSlowResult = createFixture({
  durationSeconds: 4,
  includePoison: false,
  baseSpRegen: 300,
  spRecoveryIntervalFrames: 60,
  enableFastForward: false
});
assert.deepEqual(
  pausedSpFastResult.timeline,
  pausedSpSlowResult.timeline,
  '低学年中に停止した基礎SP回復を再開しても時系列を変えない'
);

const movementResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  movementTransitions: [{
    id: 'basic-to-low',
    fromActionKey: 'basicAttack',
    toActionKey: 'lowSkill',
    frames: 5,
    note: '射程調整'
  }],
  baseSpRegen: 10,
  spRecoveryIntervalFrames: 2,
  spRecoveryEffects: [{ id: 'initial-full-sp', mode: 'initial', fixed: 300 }]
});
const movementStart = movementResult.timeline.find(event => event.type === 'movementStart');
const movementEnd = movementResult.timeline.find(event => event.type === 'movementEnd');
const movementLowStart = movementResult.timeline.find(event => (
  event.type === 'actionStart' && event.actionKey === 'lowSkill'
));
assert.equal(movementStart.frame, 2, '遷移元行動の終了時に行動間移動を開始する');
assert.equal(movementEnd.frame, 7, '登録した移動時間を独立フェーズとして消化する');
assert.equal(movementLowStart.frame, 9, '移動後に通常の2Fスキル移行を挟んで行動を開始する');
assert.ok(movementResult.timeline.some(event => event.type === 'spRecovery' && event.frame === 4),
  '行動間移動中も毎秒SP回復の時計を進める');

const attackCountStatusResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  eventEffects: [{
    id: 'normal-attack-count-status',
    label: '普通攻撃5回ごとの目くらまし',
    triggerType: '普通攻撃命中時',
    triggerSourceId: '普通攻撃',
    triggerActionKeys: ['basicAttack', 'enhancedAttack'],
    triggerEveryCount: 5,
    oncePerAction: true,
    steps: [{
      type: 'status',
      order: 1,
      application: {
        status: '目くらまし',
        durationFrames: 150,
        stackable: false,
        maxStacks: 1,
        stackGroupId: 'normal-attack-count-status',
        dealsPeriodicDamage: false,
        tickFrames: 0,
        tickMultiplier: 0
      }
    }]
  }]
});
const countStatusApplied = attackCountStatusResult.timeline.filter(event => (
  event.type === 'statusApplied' && event.status === '目くらまし'
));
assert.equal(countStatusApplied.length, 1, '普通攻撃5回ごとに非DoT状態を1回付与する');
assert.equal(countStatusApplied[0].frame, 41, '5回目の普通攻撃命中フレームを付与起点にする');
assert.equal(countStatusApplied[0].durationFrames, 150, 'カード記載の2.5秒を150ゲームFとして保持する');

const multiHitCountStatusResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  timingEvents: [
    { frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' },
    { frame: 2, order: 2, effectKind: 'ダメージ', effectId: 'damage' }
  ],
  eventEffects: [{
    id: 'normal-attack-count-status-multihit',
    label: '普通攻撃3回ごとの状態付与',
    triggerType: '普通攻撃命中時',
    triggerSourceId: '普通攻撃',
    triggerActionKeys: ['basicAttack', 'enhancedAttack'],
    triggerEveryCount: 3,
    oncePerAction: true,
    steps: [{
      type: 'status',
      order: 1,
      application: {
        status: '検証状態', durationFrames: 60, stackable: false, maxStacks: 1,
        stackGroupId: 'normal-attack-count-status-multihit', dealsPeriodicDamage: false,
        tickFrames: 0, tickMultiplier: 0
      }
    }]
  }]
});
const multiHitCountStatusApplied = multiHitCountStatusResult.timeline.filter(event => (
  event.type === 'statusApplied' && event.status === '検証状態'
));
assert.equal(multiHitCountStatusApplied.length, 2,
  '多段普通攻撃でもn回ごとのカウンターは1行動につき1回だけ進める');
assert.equal(multiHitCountStatusApplied[0].frame, 21,
  '多段普通攻撃の指定回数目では最初の命中を付与起点にする');
assert.equal(multiHitCountStatusApplied[1].frame, 51,
  '次の指定回数目でもヒット数ではなく行動数を基準にする');

const initialTimedDamageResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  damageBuffEffects: [{
    id: 'wave-start-damage',
    label: 'ウェーブ開始時与ダメージ増加',
    mode: 'initialTimed',
    durationFrames: 15,
    stackable: false,
    maxStacks: 1,
    modifiers: { addP: 50 },
    baselineModifiersByAction: {}
  }]
});
const initialTimedHits = initialTimedDamageResult.timeline.filter(event => event.type === 'hit');
assert.equal(initialTimedHits[0].expectedDamage, 150, 'ウェーブ開始時の時限補正を0Fから適用する');
assert.equal(initialTimedHits[1].expectedDamage, 150, '持続時間内は時限補正を維持する');
assert.equal(initialTimedHits[2].expectedDamage, 100, '期限後は時限補正を除外する');
assert.ok(initialTimedDamageResult.timeline.some(event => (
  event.type === 'runtimeBuffExpired' && event.frame === 15
)), '時限ダメージ補正を指定フレームで終了する');
const initialTimedTickResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  damageBuffEffects: [{
    id: 'wave-start-damage',
    label: 'ウェーブ開始時与ダメージ増加',
    mode: 'initialTimed',
    durationFrames: 15,
    stackable: false,
    maxStacks: 1,
    modifiers: { addP: 50 },
    baselineModifiersByAction: {}
  }],
  enableFastForward: false
});
assert.deepEqual(
  initialTimedDamageResult.timeline,
  initialTimedTickResult.timeline,
  '時限バフ期限をキュー化しても旧tick方式と同じ時系列になる'
);

const highNormalBuffResult = createFixture({
  durationSeconds: 1,
  highSkillCooldownSeconds: 1,
  highSkillMode: 'auto',
  initialHighSkillCooldownMultiplier: 0,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  damageBuffEffects: [{
    id: 'high-normal-damage',
    label: '高学年後の普通攻撃ダメージ増加',
    mode: 'actionTimed',
    triggerActionKeys: ['highSkill'],
    triggerPhase: 'start',
    durationFrames: 20,
    stackable: false,
    maxStacks: 1,
    modifiers: { normalAttackAddP: 100 },
    baselineModifiersByAction: {}
  }]
});
const highNormalFirstHit = highNormalBuffResult.timeline.find(event => event.type === 'hit');
assert.equal(highNormalFirstHit.expectedDamage, 200,
  '高学年開始時の時限補正を後続の基本・強化攻撃だけへ適用する');

const actionTimedSpeedResult = createFixture({
  durationSeconds: 1,
  highSkillCooldownSeconds: 1,
  highSkillMode: 'auto',
  initialHighSkillCooldownMultiplier: 0,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  attackSpeedEffects: [{
    id: 'high-action-haste',
    label: '高学年後の攻撃速度増加',
    mode: 'actionTimed',
    triggerActionKeys: ['highSkill'],
    triggerPhase: 'start',
    hasteP: 100,
    durationFrames: 10,
    stackable: false,
    maxStacks: 1
  }]
});
assert.ok(actionTimedSpeedResult.timeline.some(event => (
  event.type === 'attackSpeedApplied' && event.normalAttackIntervalFrames === 5
)), '行動起点の攻撃速度バフで次回普通攻撃間隔を再計算する');
assert.ok(actionTimedSpeedResult.timeline.some(event => event.type === 'attackSpeedExpired'),
  '行動起点の攻撃速度バフを個別期限で終了する');
assert.ok(actionTimedSpeedResult.timeline.some(event => (
  event.type === 'effectStateChanged' && event.kind === 'attackSpeed' && event.label === '高学年後の攻撃速度増加'
)), '攻撃速度の状態遷移を共通ログへ記録する');
assert.ok(actionTimedSpeedResult.publicTimeline.some(event => (
  event.type === 'effectStateChanged' && event.kind === 'attackSpeed' && event.operation === 'apply'
)), '公開タイムラインへ攻撃速度の共通状態遷移を渡す');
assert.equal(actionTimedSpeedResult.publicTimeline.some(event => event.type === 'attackSpeedApplied'), false,
  '公開タイムラインでは共通状態遷移と重複する攻撃速度専用行を省略する');

const deduplicatedPublicTimeline = simulator.createDpsPublicTimeline([
  { tick: 10, type: 'effectStateChanged', kind: 'debuff', effectId: 'poison', label: '毒', status: '毒', operation: 'apply' },
  { tick: 10, type: 'statusApplied', status: '毒' },
  { tick: 10, type: 'actionStart', actionLabel: '基本攻撃' },
  { tick: 20, type: 'statusApplied', status: '毒' }
]);
assert.deepEqual(deduplicatedPublicTimeline.map(event => event.type), [
  'effectStateChanged', 'actionStart', 'statusApplied'
], '共通状態遷移と同一時刻の旧ログだけを公開表示から重複除去する');

const refreshedSpeedResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  attackSpeedEffects: [{
    id: 'refreshing-haste',
    label: '更新型攻撃速度増加',
    mode: 'actionTimed',
    triggerActionKeys: ['basicAttack'],
    triggerPhase: 'start',
    hasteP: 10,
    durationFrames: 15,
    stackable: false,
    maxStacks: 1
  }]
});
assert.ok(refreshedSpeedResult.timeline.filter(event => event.type === 'attackSpeedApplied').every(event => (
  event.stackCount === 1
)), '非スタック時限速度バフは重ねずに期限だけ更新する');
assert.equal(refreshedSpeedResult.timeline.filter(event => event.type === 'attackSpeedExpired').length, 0,
  '再付与が続く間は更新型速度バフを失効させない');

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
assert.ok(poisonResult.timeline.some(event => (
  event.type === 'statusApplied' && event.status === '毒' && event.stackCount > 1
)), 'effectStack=trueを明示した状態異常は従来どおりスタックする');
const poisonHits = poisonResult.timeline.filter(event => event.type === 'hit');
assert.equal(poisonHits[0].expectedDamage, 100, '状態を付与するヒットには状態条件補正を適用しない');
assert.equal(poisonHits[1].expectedDamage, 150, '状態付与後のヒットには状態条件補正を適用する');

const statusWeaknessResult = createFixture({
  durationSeconds: 2,
  includePoison: true,
  statusDamageWeaknessP: 100,
  statusDamageProfiles: {
    毒: {
      expectedDamage: 100,
      damageResult: { runtimeBase: { otherP: 100 } }
    }
  }
});
const statusWeaknessTick = statusWeaknessResult.timeline.find(event => event.type === 'statusTick');
assert.ok(statusWeaknessTick, '状態異常ダメージのTickを生成する');
assert.equal(statusWeaknessTick.expectedDamage, 200,
  '状態異常ダメージ弱点はDoT Tickだけに適用する');
assert.equal(statusWeaknessResult.timeline.find(event => event.type === 'hit').expectedDamage, 100,
  '状態異常ダメージ弱点を通常攻撃へ二重適用しない');

const cerberusStatusWeaknessResult = createFixture({
  durationSeconds: 2,
  includePoison: true,
  statusDamageWeaknessP: 1000,
  statusDamageProfiles: {
    毒: {
      expectedDamage: 100,
      damageResult: { runtimeBase: { otherP: 100 } }
    }
  }
});
const cerberusStatusWeaknessTick = cerberusStatusWeaknessResult.timeline.find(event => event.type === 'statusTick');
assert.equal(cerberusStatusWeaknessTick.expectedDamage, 1100,
  'ケルベロスの状態異常+1000%はDoTを基礎値の11倍として適用する');
assert.equal(cerberusStatusWeaknessTick.statusDamageP, 1000,
  '状態異常弱点の内訳をタイムラインへ保持する');
assert.equal(cerberusStatusWeaknessTick.damageEvaluation.ratios.attackDefense, 1,
  '状態異常弱点は攻防・防御係数カテゴリを変更しない');
assert.equal(cerberusStatusWeaknessTick.damageEvaluation.ratios.other, 11,
  'その他倍率100%に+1000%した場合のカテゴリ倍率は11倍になる');

const noStatusWeaknessResult = createFixture({
  durationSeconds: 2,
  includePoison: true,
  statusDamageWeaknessP: 0,
  statusDamageProfiles: {
    毒: {
      expectedDamage: 100,
      damageResult: { runtimeBase: { otherP: 100 } }
    }
  }
});
const noStatusWeaknessTick = noStatusWeaknessResult.timeline.find(event => event.type === 'statusTick');
assert.equal(cerberusStatusWeaknessTick.expectedDamage / noStatusWeaknessTick.expectedDamage, 11,
  '防御計算後の同一基礎DoTに対し、状態異常+1000%を独立した11倍補正として適用する');

const existingOtherMultiplierResult = createFixture({
  durationSeconds: 2,
  includePoison: true,
  statusDamageWeaknessP: 1000,
  statusDamageProfiles: {
    毒: {
      // 弱点適用前からその他倍率150%を含み、期待値150になっている状態。
      expectedDamage: 150,
      damageResult: { runtimeBase: { otherP: 150 } }
    }
  }
});
const existingOtherMultiplierTick = existingOtherMultiplierResult.timeline.find(event => event.type === 'statusTick');
assert.equal(existingOtherMultiplierTick.expectedDamage, 1150,
  '既存のその他倍率がある場合は+1000ポイントを同カテゴリへ加え、固定11倍として重ねない');
assert.equal(existingOtherMultiplierTick.damageEvaluation.ratios.attackDefense, 1,
  '既存のその他倍率があっても状態異常弱点は防御係数を変更しない');

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

const statusTakenWeaknessResult = createFixture({
  includePoison: false,
  initialTargetStatuses: [{ status: '感電', sourceSelf: true }],
  statusReactions: [{
    id: 'enemy-shock-weakness', status: '感電', takenDmgP: 30, perStack: false, maxStacks: 1
  }]
});
assert.equal(statusTakenWeaknessResult.timeline.find(event => event.type === 'hit').expectedDamage, 130,
  '状態異常弱点による敵被ダメージ増加を状態付与済みの攻撃へ適用する');

const defenseDownResult = createFixture({
  includePoison: false,
  basicRuntimeBase: {
    damageType: 'physical',
    baseAtk: 100, finalAtk: 100, attackP: 0,
    baseDef: 100, finalDef: 100, defenseP: 0, defRate: 0.5,
    rawAddRate: 1, addRate: 1, otherP: 100
  },
  damageBuffEffects: [{
    id: 'enemy-defense-down',
    label: '敵防御力低下',
    mode: 'fixed',
    fixedStacks: 1,
    modifiers: { enemyDefDownP: 50 },
    baselineModifiersByAction: {}
  }]
});
assert.ok(defenseDownResult.timeline.find(event => event.type === 'hit').expectedDamage > 100,
  '敵防御低下をヒット時の防御係数へ反映する');

const countDamageBuffResult = createFixture({
  durationSeconds: 1,
  damageBuffEffects: [{
    id: 'counted-normal-buff',
    label: '普通攻撃3回ごとの追加補正',
    mode: 'actionTimed',
    triggerActionKeys: ['basicAttack', 'enhancedAttack'],
    triggerPhase: 'start',
    triggerEveryCount: 3,
    durationFrames: 600,
    modifiers: { addP: 50 },
    baselineModifiersByAction: {}
  }]
});
const countBuffHits = countDamageBuffResult.timeline.filter(event => event.type === 'hit');
assert.equal(countBuffHits[0].expectedDamage, 100, '回数条件未達ではバフを発動しない');
assert.equal(countBuffHits[1].expectedDamage, 100, '回数条件未達では2回目も発動しない');
assert.equal(countBuffHits[2].expectedDamage, 150, '指定回数の普通攻撃でダメージバフを発動する');

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

const directTimingSourceResult = createFixture({
  timingEvents: [
    { frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' },
    { frame: 2, order: 2, effectKind: '効果', effectId: 'direct_timing_source' },
    { frame: 3, order: 3, effectKind: 'ダメージ', effectId: 'damage' }
  ],
  damageBuffEffects: [{
    id: 'direct-timing-bonus',
    label: 'skillmotion直結バフ',
    mode: 'sourceEventTimed',
    triggerSourceId: 'direct_timing_source',
    triggerActionKeys: [],
    sourceEventFallbackMode: 'actionTimed',
    durationFrames: 60,
    modifiers: { addP: 50 },
    baselineModifiersByAction: {}
  }]
});
const directTimingHits = directTimingSourceResult.timeline.filter(event => event.type === 'hit');
const firstDirectTimingHits = directTimingHits.slice(0, 2);
assert.equal(firstDirectTimingHits.length, 2, 'skillmotion直結テストは前後2ヒットを生成する');
assert.equal(
  firstDirectTimingHits[1].expectedDamage / firstDirectTimingHits[0].expectedDamage,
  1.5,
  'skillmotion直結バフは発生元イベント後のヒットだけを1.5倍にする'
);
assert.ok(directTimingSourceResult.timeline.some(event => (
  event.type === 'runtimeBuffApplied' && event.reason === 'direct_timing_source発生時'
)), 'skillmotion直結バフを効果IDイベントで発動する');
assert.ok(!directTimingSourceResult.timeline.some(event => (
  event.type === 'runtimeBuffApplied' && /発動時$/.test(event.reason || '')
)), 'skillmotion直結バフを行動開始時に重ねて発動しない');

const directTimingSelfStateResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  timingEvents: [
    { frame: 1, order: 1, effectKind: '固有状態', effectId: 'Tig_favorite_1_e08' },
    { frame: 2, order: 2, effectKind: 'ダメージ', effectId: 'damage', hitCount: 2 }
  ],
  eventEffects: [{
    id: 'tig-favorite-overdrive',
    label: 'オーバードラ火ブ',
    triggerType: '対象スキル使用時',
    triggerSourceId: 'Tig_favorite_1_e08',
    timingSourceEffectId: 'Tig_favorite_1_e08',
    triggerActionKeys: [],
    steps: [{
      type: 'selfState',
      order: 1,
      application: {
        stateId: 'Tig_favorite_1_e08',
        status: 'オーバードラ火ブ',
        durationFrames: 60
      }
    }]
  }, {
    id: 'tig-favorite-burn',
    label: 'オーバードラ火ブ中の火傷',
    triggerType: '普通攻撃命中時',
    triggerSourceId: '普通攻撃_強化',
    triggerActionKeys: ['basicAttack'],
    triggerValue: '各ヒット',
    perHitTrigger: true,
    conditionType: '固有状態中',
    conditionValue: 'Tig_favorite_1_e08',
    steps: [{
      type: 'status',
      order: 1,
      application: {
        status: '火傷',
        durationFrames: 240,
        stackable: true,
        maxStacks: 4,
        stackGroupId: 'Tig_favorite_1_proc01',
        dealsPeriodicDamage: true,
        tickFrames: 60,
        tickMultiplier: 30
      }
    }]
  }]
});
assert.ok(directTimingSelfStateResult.timeline.some(event => (
  event.type === 'effectStateChanged'
    && event.kind === 'selfState'
    && event.effectId === 'Tig_favorite_1_e08'
    && event.frame === 1
)), 'skillmotionの効果ID発生時にオーバードラ火ブを固有状態として付与する');
assert.equal(directTimingSelfStateResult.timeline.filter(event => (
  event.type === 'statusApplied' && event.status === '火傷' && event.frame === 2
)).length, 2, 'オーバードラ火ブ中の強化攻撃は各ヒットで火傷を付与する');

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

const supplementalDamageModifierResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  eventEffects: [{
    id: 'supplemental-damage',
    label: '追加ダメージ',
    triggerType: 'n秒ごと',
    intervalFrames: 10,
    steps: [{ type: 'damage', order: 1, effectId: 'supplemental_damage', expectedDamage: 500 }]
  }],
  damageBuffEffects: [{
    id: 'supplemental-damage-buff',
    label: '追加ダメージ用与ダメージ増加',
    mode: 'fixed',
    fixedStacks: 1,
    modifiers: { addP: 50 },
    baselineModifiersByAction: {}
  }]
});
const supplementalHit = supplementalDamageModifierResult.timeline.find(event => (
  event.type === 'runtimeEffectHit' && event.runtimeEffectId === 'supplemental-damage'
));
assert.equal(supplementalHit.expectedDamage, 750,
  '独立した追加ダメージにも現在の与ダメージ補正を適用する');
const supplementalHits = supplementalDamageModifierResult.timeline.filter(event => (
  event.type === 'runtimeEffectHit' && event.runtimeEffectId === 'supplemental-damage'
));
assert.ok(supplementalHits.length > 1 && supplementalHits.every(event => event.expectedDamage === 750),
  '独立した追加ダメージを発生回ごとに同じ補正で評価する');
assert.equal(supplementalDamageModifierResult.damage.byRuntimeEffect['supplemental-damage'], supplementalHits.length * 750,
  '追加ダメージを通常行動の合計へ混ぜず独立寄与として集計する');

const statusEndAdditionalDamageResult = createFixture({
  durationSeconds: 12,
  normalAttackIntervalFrames: 1000,
  eventEffects: [{
    id: 'mayo-poison-expired-damage',
    label: '毒終了時追加物理ダメージ',
    triggerType: '状態終了時',
    triggerSourceId: '毒',
    conditionType: '付与者',
    conditionValue: 'runtime-effect-test',
    steps: [{ type: 'damage', order: 1, effectId: 'mayo_poison_expired_damage', expectedDamage: 300 }]
  }]
});
const statusEndAdditionalHit = statusEndAdditionalDamageResult.timeline.find(event => (
  event.type === 'runtimeEffectHit' && event.runtimeEffectId === 'mayo-poison-expired-damage'
));
assert.ok(statusEndAdditionalHit && statusEndAdditionalHit.frame >= 600,
  '状態終了時の追加ダメージを独立イベントとして発生させる');

const actionAdditionalDamageResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  highSkillCooldownSeconds: 0,
  spRecoveryEffects: [{ id: 'initial-full-sp', mode: 'initial', fixed: 300 }],
  eventEffects: [{
    id: 'low-skill-additional-damage',
    label: '低学年使用時追加ダメージ',
    triggerType: '低学年スキル使用時',
    triggerActionKeys: ['lowSkill'],
    oncePerAction: true,
    steps: [{ type: 'damage', order: 1, effectId: 'low_skill_additional_damage', expectedDamage: 200 }]
  }]
});
assert.ok(actionAdditionalDamageResult.timeline.some(event => (
  event.type === 'runtimeEffectHit'
    && event.runtimeEffectId === 'low-skill-additional-damage'
    && event.expectedDamage === 200
)), '低学年スキル使用時の追加ダメージを行動開始時に発生させる');

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

const resourceTransitionHookResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  resources: [{ id: 'test-charge', name: '検証チャージ', initialStacks: 0, maxStacks: 3 }],
  damageBuffEffects: [{
    id: 'test-charge-buff',
    label: '検証チャージ時バフ',
    mode: 'resourceChanged',
    triggerType: 'リソース獲得時',
    triggerSourceId: 'test-charge',
    durationFrames: 10,
    modifiers: { atkP: 10 }
  }],
  eventEffects: [
    {
      id: 'test-charge-gain',
      triggerType: '普通攻撃使用時',
      triggerActionKeys: ['basicAttack'],
      oncePerAction: true,
      steps: [{ type: 'resource', order: 1, resourceId: 'test-charge', operation: 'gain', amount: 1 }]
    },
    {
      id: 'test-charge-state',
      triggerType: 'リソース獲得時',
      triggerSourceId: 'test-charge',
      steps: [{
        type: 'status',
        order: 1,
        application: {
          status: 'チャージ状態',
          applicationEffectId: 'test-charge-state',
          durationFrames: 5,
          stackable: false,
          maxStacks: 1,
          stackGroupId: 'test-charge-state',
          dealsPeriodicDamage: false,
          tickFrames: 0,
          tickMultiplier: 0
        }
      }]
    }
  ]
});
assert.equal(resourceTransitionHookResult.finalState.resources['test-charge'], 3,
  '実際に増加したリソースだけを上限まで積む');
assert.equal(resourceTransitionHookResult.timeline.filter(event => (
  event.type === 'resourceChange'
    && event.resourceId === 'test-charge'
    && event.amount > 0
)).length, 3, 'リソース上限到達後は変化イベントを追加発火しない');
assert.equal(resourceTransitionHookResult.timeline.filter(event => (
  event.type === 'statusApplied' && event.status === 'チャージ状態'
)).length, 3, 'リソース獲得時の状態付与を実際の増加ごとに一度だけ処理する');
assert.equal(resourceTransitionHookResult.timeline.filter(event => (
  event.type === 'runtimeBuffApplied' && event.effectId === 'test-charge-buff'
)).length, 3, 'リソース獲得時のダメージバフを実際の増加ごとに処理する');

const statusEndHookResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  resources: [{ id: 'status-end-count', name: '状態終了回数', initialStacks: 0, maxStacks: 10 }],
  eventEffects: [
    {
      id: 'short-status-apply',
      triggerType: '普通攻撃使用時',
      triggerActionKeys: ['basicAttack'],
      oncePerAction: true,
      steps: [{
        type: 'status',
        order: 1,
        application: {
          status: '短時間状態',
          applicationEffectId: 'short-status',
          durationFrames: 5,
          stackable: false,
          maxStacks: 1,
          stackGroupId: 'short-status',
          dealsPeriodicDamage: false,
          tickFrames: 0,
          tickMultiplier: 0
        }
      }]
    },
    {
      id: 'short-status-expired',
      triggerType: '状態終了時',
      triggerSourceId: 'short-status',
      steps: [{ type: 'resource', order: 1, resourceId: 'status-end-count', operation: 'gain', amount: 1 }]
    }
  ]
});
assert.deepEqual(
  statusEndHookResult.timeline
    .filter(event => event.type === 'resourceChange' && event.resourceId === 'status-end-count')
    .map(event => event.frame),
  [5, 15, 25, 35, 45, 55],
  '状態終了時の効果を状態インスタンスごとに一度だけ発火する'
);

const skillBoundaryHookResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  spRecoveryEffects: [{ id: 'initial-full-sp-for-boundary', mode: 'initial', fixed: 300 }],
  lowTimingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  resources: [
    { id: 'low-hit-count', name: '低学年命中回数', initialStacks: 0, maxStacks: 10 },
    { id: 'low-end-count', name: '低学年終了回数', initialStacks: 0, maxStacks: 10 }
  ],
  eventEffects: [
    {
      id: 'low-skill-hit-hook',
      triggerType: '低学年スキル命中時',
      triggerActionKeys: ['lowSkill'],
      oncePerAction: true,
      steps: [{ type: 'resource', order: 1, resourceId: 'low-hit-count', operation: 'gain', amount: 1 }]
    },
    {
      id: 'low-skill-end-hook',
      triggerType: '低学年スキル終了時',
      triggerActionKeys: ['lowSkill'],
      oncePerAction: true,
      steps: [{ type: 'resource', order: 1, resourceId: 'low-end-count', operation: 'gain', amount: 1 }]
    }
  ]
});
assert.equal(skillBoundaryHookResult.finalState.resources['low-hit-count'], 1,
  '低学年スキル命中時の効果を一度だけ発火する');
assert.equal(skillBoundaryHookResult.finalState.resources['low-end-count'], 1,
  '低学年スキル終了時の効果を一度だけ発火する');
const lowSkillEndFrame = skillBoundaryHookResult.timeline.find(event => (
  event.type === 'actionEnd' && event.actionKey === 'lowSkill'
))?.frame;
assert.equal(
  skillBoundaryHookResult.timeline.find(event => (
    event.type === 'resourceChange' && event.resourceId === 'low-end-count'
  ))?.frame,
  lowSkillEndFrame,
  '低学年終了時効果をactionEndと同じフレームで処理する'
);

const finalHitHookResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  spRecoveryEffects: [{ id: 'initial-full-sp-for-final-hit', mode: 'initial', fixed: 300 }],
  lowTimingEvents: [
    { frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' },
    { frame: 2, order: 2, effectKind: 'ダメージ', effectId: 'damage' }
  ],
  resources: [{ id: 'low-final-hit-count', name: '低学年最終命中回数', initialStacks: 0, maxStacks: 10 }],
  eventEffects: [{
    id: 'low-final-hit-hook',
    triggerType: '低学年スキル最終ヒット命中時',
    triggerActionKeys: ['lowSkill'],
    oncePerAction: true,
    finalHitOnly: true,
    steps: [{ type: 'resource', order: 1, resourceId: 'low-final-hit-count', operation: 'gain', amount: 1 }]
  }]
});
const finalHitResourceChanges = finalHitHookResult.timeline.filter(event => (
  event.type === 'resourceChange' && event.resourceId === 'low-final-hit-count'
));
const finalHitActionStart = finalHitHookResult.timeline.find(event => (
  event.type === 'actionStart' && event.actionKey === 'lowSkill'
));
assert.equal(finalHitResourceChanges.length, 1,
  '低学年最終ヒット時の効果を行動ごとに一度だけ発火する');
assert.equal(finalHitResourceChanges[0]?.frame, finalHitActionStart?.frame + 2,
  '低学年最終ヒット時の効果を最後のダメージイベントへ結び付ける');

const generatedTriggerResult = createFixture({
  durationSeconds: 2,
  statusDamageProfiles: { '凍傷': { expectedDamage: 90 } },
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
assert.equal(
  generatedTriggerResult.damage.byStatusSource['凍傷']['runtimeEffect:aya-butterfly-frostbite'].expectedDamage,
  generatedTriggerResult.damage.byStatus['凍傷'],
  'DoTダメージを付与元の動的効果別にも集計する'
);
assert.equal(
  generatedTriggerResult.damage.byStatusSource['凍傷']['runtimeEffect:aya-butterfly-frostbite'].label,
  '蝶の凍傷',
  'DoT付与元の表示名を保持する'
);

const generatedEventFastForwardResult = createFixture({
  durationSeconds: 2,
  includePoison: false,
  generatedObjects: [{
    id: 'queue-test-object',
    name: 'キュー検証生成物',
    spawnFrame: 0,
    timingEvents: [
      { frame: 1, timeOrigin: '生成時', eventType: '命中', effectKind: '効果', effectId: 'queue-hit' },
      { frame: 3, timeOrigin: '生成時', eventType: '帰還', effectKind: '帰還', effectId: '' }
    ]
  }],
  eventEffects: [{
    id: 'queue-test-effect',
    label: '生成物キュー検証効果',
    triggerType: '生成物命中時',
    triggerSourceId: 'queue-test-object',
    steps: [{ type: 'healing', order: 1, value: 1, reference: '最大HP' }]
  }],
  enableFastForward: true
});
const generatedEventTickResult = createFixture({
  durationSeconds: 2,
  includePoison: false,
  generatedObjects: [{
    id: 'queue-test-object',
    name: 'キュー検証生成物',
    spawnFrame: 0,
    timingEvents: [
      { frame: 1, timeOrigin: '生成時', eventType: '命中', effectKind: '効果', effectId: 'queue-hit' },
      { frame: 3, timeOrigin: '生成時', eventType: '帰還', effectKind: '帰還', effectId: '' }
    ]
  }],
  eventEffects: [{
    id: 'queue-test-effect',
    label: '生成物キュー検証効果',
    triggerType: '生成物命中時',
    triggerSourceId: 'queue-test-object',
    steps: [{ type: 'healing', order: 1, value: 1, reference: '最大HP' }]
  }],
  enableFastForward: false
});
assert.deepEqual(
  generatedEventFastForwardResult.timeline,
  generatedEventTickResult.timeline,
  '生成物イベントをキューから取り出しても旧tick方式と同じ時系列になる'
);
assert.equal(
  generatedEventFastForwardResult.damage.totalExpectedDamage,
  generatedEventTickResult.damage.totalExpectedDamage,
  '生成物イベントのキュー化でダメージ結果を変更しない'
);
assert.ok(
  generatedEventFastForwardResult.performance.skippedTickCount > 0,
  '生成物イベントの次回時刻まで待機区間をスキップする'
);

const periodicFastForwardResult = createFixture({
  durationSeconds: 4,
  statusDamageProfiles: { 毒: { expectedDamage: 1 } },
  enableFastForward: true
});
const periodicTickResult = createFixture({
  durationSeconds: 4,
  statusDamageProfiles: { 毒: { expectedDamage: 1 } },
  enableFastForward: false
});
assert.deepEqual(
  periodicFastForwardResult.timeline,
  periodicTickResult.timeline,
  '周期SP・DoTの次回時刻をキュー化しても旧tick方式と同じ時系列になる'
);
assert.equal(
  periodicFastForwardResult.damage.totalExpectedDamage,
  periodicTickResult.damage.totalExpectedDamage,
  '周期効果のキュー化でダメージ結果を変更しない'
);
assert.ok(
  periodicFastForwardResult.performance.processedTickCount
    < periodicTickResult.performance.processedTickCount,
  '周期効果の待機区間をキューの次回時刻までスキップする'
);

const fixedRuntimeResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  attackSpeedEffects: [{
    id: 'fixed-haste', label: '固定攻撃速度', mode: 'fixed', fixedStacks: 2,
    hasteP: 50, maxStacks: 3, stackable: true
  }],
  damageBuffEffects: [{
    id: 'fixed-damage', label: '固定与ダメージ', mode: 'fixed', fixedStacks: 2,
    durationFrames: 0, stackable: true, maxStacks: 3,
    modifiers: { addP: 50 }, baselineModifiersByAction: {}
  }]
});
const fixedRuntimeFirstHit = fixedRuntimeResult.timeline.find(event => event.type === 'hit');
assert.equal(fixedRuntimeFirstHit.expectedDamage, 200,
  '固定モードは指定スタック数のダメージ補正を戦闘開始時から常時適用する');
assert.ok(fixedRuntimeResult.timeline.some(event => (
  event.type === 'attackSpeedInitial' && event.stackCount === 2 && event.normalAttackIntervalFrames === 5
)), '固定モードは指定スタック数の攻撃速度を戦闘開始時から常時適用する');
assert.equal(fixedRuntimeResult.timeline.filter(event => (
  event.type === 'runtimeBuffExpired' || event.type === 'attackSpeedExpired'
)).length, 0, '固定モードの時系列効果は計測中に失効しない');

const disabledRuntimeResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  damageBuffEffects: [{
    id: 'disabled-damage', label: 'OFF与ダメージ', mode: 'off',
    durationFrames: 0, stackable: false, maxStacks: 1,
    modifiers: { addP: 50 }, baselineModifiersByAction: { basicAttack: { addP: 50 } }
  }]
});
assert.equal(disabledRuntimeResult.timeline.find(event => event.type === 'hit').expectedDamage, 50,
  'OFFモードでも単発プロファイルに含まれた動的補正の差し引き定義は維持する');
assert.equal(disabledRuntimeResult.timeline.filter(event => event.type === 'runtimeBuffApplied').length, 0,
  'OFFモードの時系列効果は発動しない');

const favoriteRewriteStateResult = createFixture({
  durationSeconds: 3,
  highSkillCooldownSeconds: 5,
  highSkillMode: 'auto',
  initialHighSkillCooldownMultiplier: 0,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  statusDamageProfiles: { '火傷': { expectedDamage: 30 } },
  attackSpeedEffects: [{
    id: 'favorite-high-haste', label: '愛用品高学年攻撃速度', mode: 'actionTimed',
    triggerActionKeys: ['highSkill'], triggerPhase: 'start', durationFrames: 600,
    hasteP: 200, stackable: false, maxStacks: 1
  }],
  damageBuffEffects: [{
    id: 'favorite-high-normal-buff', label: '愛用品高学年普通攻撃バフ', mode: 'actionTimed',
    triggerActionKeys: ['highSkill'], triggerPhase: 'start', durationFrames: 600,
    stackable: false, maxStacks: 1, modifiers: { normalAttackAddP: 100 }, baselineModifiersByAction: {}
  }],
  eventEffects: [{
    id: 'favorite-high-state', label: 'オーバードラ火ブ', triggerType: '対象スキル使用時',
    triggerActionKeys: ['highSkill'], oncePerAction: true,
    steps: [{
      type: 'selfState', order: 1,
      application: { stateId: 'favorite-high-state-row', status: 'オーバードラ火ブ', durationFrames: 600 }
    }]
  }, {
    id: 'favorite-enhanced-burn', label: '強化攻撃火傷', triggerType: '普通攻撃命中時',
    triggerActionKeys: ['basicAttack'], oncePerAction: true,
    conditionType: '固有状態中', conditionValue: 'favorite-high-state-row',
    steps: [{
      type: 'status', order: 1,
      application: {
        status: '火傷', durationFrames: 240, stackable: true, maxStacks: 4,
        stackGroupId: 'favorite-burn', dealsPeriodicDamage: true, tickFrames: 60, tickMultiplier: 30
      }
    }]
  }]
});
const favoriteRewriteHighStartCount = favoriteRewriteStateResult.timeline.filter(event => (
  event.type === 'actionStart' && event.actionKey === 'highSkill'
)).length;
assert.equal(favoriteRewriteStateResult.timeline.filter(event => (
  event.type === 'attackSpeedApplied' && event.effectId === 'favorite-high-haste'
)).length, favoriteRewriteHighStartCount, '愛用品高学年の攻撃速度バフは高学年発動ごとに一度だけ付与する');
assert.equal(favoriteRewriteStateResult.timeline.filter(event => (
  event.type === 'runtimeBuffApplied' && event.effectId === 'favorite-high-normal-buff'
)).length, favoriteRewriteHighStartCount, '愛用品高学年の普通攻撃バフは通常攻撃命中ごとに再付与しない');
assert.ok(favoriteRewriteStateResult.timeline.some(event => (
  event.type === 'statusApplied' && event.status === '火傷'
)), '愛用品高学年の固有状態中は普通攻撃命中から火傷を付与する');

const perHitResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage', hitCount: 2 }],
  eventEffects: [{
    id: 'per-hit-status',
    label: '多段ごとの状態異常',
    triggerType: 'ダメージ命中時',
    triggerSourceId: 'damage',
    triggerActionKeys: ['basicAttack'],
    perHitTrigger: true,
    steps: [{
      type: 'status', order: 1,
      application: {
        status: '火傷', durationFrames: 240, stackable: true, maxStacks: 4,
        stackGroupId: 'per-hit-burn', dealsPeriodicDamage: true, tickFrames: 60, tickMultiplier: 30
      }
    }]
  }]
});
const perHitStatusApplied = perHitResult.timeline.filter(event => (
  event.type === 'statusApplied' && event.status === '火傷'
));
const firstPerHitFrame = perHitStatusApplied[0]?.frame;
assert.equal(perHitStatusApplied.filter(event => event.frame === firstPerHitFrame).length, 2,
  '各ヒット指定は1つの多段イベントをヒット数分処理する');

// ギデオン低学年: 遺物数分岐とアサイド2の追加攻撃回数を同時に評価する。
const fs = require('node:fs');
const vm = require('node:vm');
const apostleContext = {};
vm.runInNewContext(
  `${fs.readFileSync(require.resolve('../apostles.js'), 'utf8')}\nthis.__apostles = APOSTLE_LIBRARY;`,
  apostleContext
);
const kidian = apostleContext.__apostles.find(apostle => apostle.id === 'kidian');
const timingData = require('../dps-timing-data.js');
assert.ok(kidian, 'ギデオンの生成データが存在する');
for (const [artifactCount, expectedHits] of [[0, 4], [1, 5], [2, 6], [3, 7]]) {
  const kidianConfig = simulator.buildCombatantConfig(
    kidian,
    timingData.apostles.kidian,
    { artifactCount, asideRank: 2, skillLevels: { low: 1, high: 1, default: 1 } }
  );
  const lowSkill = kidianConfig.actions.lowSkill;
  const branch = `遺物装備${artifactCount}`;
  const damageEvents = lowSkill.variants[branch].filter(event => event.type === 'damage');
  assert.equal(lowSkill.variantSelection.type, 'fixed', `ギデオン遺物${artifactCount}は固定分岐を選ぶ`);
  assert.equal(lowSkill.variantSelection.branch, branch, `ギデオン遺物${artifactCount}の分岐を選ぶ`);
  assert.equal(damageEvents.length, expectedHits, `ギデオン遺物${artifactCount}の攻撃回数`);
  assert.ok(
    lowSkill.motionFramesByVariant[branch] >= damageEvents.at(-1).frame,
    `ギデオン遺物${artifactCount}は最終ヒットまで行動を維持する`
  );
}
const kidianScenarioConfig = simulator.buildCombatantConfig(
  kidian,
  timingData.apostles.kidian,
  {
    scenario: {
      actors: { self: { id: 'Kidian' } },
      formationState: {
        formation: {
          rows: [{
            apostles: ['Kidian', '', ''],
            artifacts: [['artifact-id-1', 'artifact-id-2', 'artifact-id-3'], ['', '', ''], ['', '', '']]
          }]
        }
      },
      cardState: { tempArtifacts: { target: {} } },
      characterState: { apostles: { Kidian: { asideRank: 2 } } }
    },
    skillLevels: { low: 1, high: 1, default: 1 }
  }
);
assert.equal(kidianScenarioConfig.actions.lowSkill.variantSelection.branch, '遺物装備3',
  '大文字混在シナリオの編成遺物数からギデオン分岐を選ぶ');
assert.equal(
  kidianScenarioConfig.actions.lowSkill.variants['遺物装備3'].filter(event => event.type === 'damage').length,
  7,
  '大文字混在シナリオのアサイド2追加攻撃回数を反映する'
);
assert.equal(
  kidianScenarioConfig.actions.lowSkill.motionFramesByVariant['遺物装備3'],
  366,
  'アサイド追加分を含むギデオン低学年の最終ヒットまでモーションを延長する'
);

const kidianNoAsideOverrideConfig = simulator.buildCombatantConfig(
  kidian,
  timingData.apostles.kidian,
  {
    scenario: {
      actors: { self: { id: 'Kidian' } },
      characterState: { apostles: { Kidian: { asideRank: 2 } } }
    },
    skillLevels: { low: 1, high: 1, default: 1, asideRank: 0 },
    artifactCount: 0
  }
);
assert.equal(
  kidianNoAsideOverrideConfig.actions.lowSkill.variants['遺物装備0'].filter(event => event.type === 'damage').length,
  2,
  '一時設定のアサイドなしをシナリオ側のA2より優先する'
);

// シオン愛用Lv1: 基本攻撃の弾種は34/66の排他的候補であり、強化攻撃は置換しない。
const xion = apostleContext.__apostles.find(apostle => apostle.id === 'xion');
assert.ok(xion, 'シオンの生成データが存在する');
const xionFavoriteLv1 = xion.favoriteCard.levels['1'][0];
const xionBasicOverride = simulator.createActionSkillOverride(xionFavoriteLv1, 'basicAttack');
assert.deepEqual(
  xionBasicOverride.dpsExclusiveDamageCandidates,
  [
    { effectId: 'Xion_favorite_1_e01', weight: 34 },
    { effectId: 'Xion_favorite_1_e02', weight: 66 }
  ],
  'シオン愛用Lv1の基本攻撃は34/66の排他的な弾種候補として保持する'
);
const blanchet = apostleContext.__apostles.find(apostle => apostle.id === 'blanchet');
assert.ok(blanchet, 'ブランセの生成データが存在する');
assert.deepEqual(
  simulator.createActionSkillOverride(blanchet.favoriteCard.levels['1'][0], 'lowSkill')
    .dpsExclusiveDamageCandidates,
  [],
  '同一processGroupIdで連続するブランセ愛用品Lv1の攻撃行は確率合計100%でも4択にしない'
);
const xionDpsApostle = {
  id: xion.id,
  basic: { initialSp: 0 },
  skills: xion.skills.filter(skill => (
    skill.skillType === '普通攻撃_基本' || skill.skillType === '普通攻撃_強化'
  ))
};
const xionDpsTiming = {
  normalAttackIntervalFrames: 60,
  actions: {
    basicAttack: {
      motionFrames: 2,
      timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'Xion_basic_e01' }]
    },
    enhancedAttack: {
      motionFrames: 2,
      timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'Xion_enhanced_e01' }]
    }
  }
};
const xionWithoutFavorite = simulator.buildCombatantConfig(xionDpsApostle, xionDpsTiming);
assert.deepEqual(
  xionWithoutFavorite.actions.basicAttack.variants.default
    .filter(event => event.type === 'damage').map(event => event.effectId),
  ['Xion_basic_e01'],
  '愛用品なしのシオン基本攻撃は元の基本攻撃だけを使用する'
);
const xionWithFavorite = simulator.buildCombatantConfig(xionDpsApostle, xionDpsTiming, {
  skillOverrides: { basicAttack: xionBasicOverride }
});
assert.equal(xionWithFavorite.actions.basicAttack.variantSelection.type, 'weighted',
  '愛用品Lv1の基本攻撃は確率重み付きの候補選択になる');
assert.deepEqual(
  xionWithFavorite.actions.basicAttack.variantSelection.choices,
  [
    { branch: '__exclusive:Xion_favorite_1_e01', weight: 34 },
    { branch: '__exclusive:Xion_favorite_1_e02', weight: 66 }
  ],
  '基本攻撃ごとに選べる弾種と確率を保持する'
);
assert.deepEqual(
  xionWithFavorite.actions.basicAttack.variantLabels,
  {
    '__exclusive:Xion_favorite_1_e01': '物理ダメージ',
    '__exclusive:Xion_favorite_1_e02': '強化の弾丸物理ダメージ'
  },
  '確率分岐の表示用ラベルは効果種別を使い、内部IDを表示層へ渡さない'
);
assert.deepEqual(
  Object.fromEntries(xionWithFavorite.actions.basicAttack.variantSelection.choices.map(choice => [
    choice.branch,
    xionWithFavorite.actions.basicAttack.variants[choice.branch]
      .filter(event => event.type === 'damage').map(event => event.effectId)
  ])),
  {
    '__exclusive:Xion_favorite_1_e01': ['Xion_favorite_1_e01'],
    '__exclusive:Xion_favorite_1_e02': ['Xion_favorite_1_e02']
  },
  '各基本攻撃候補は元の基本攻撃を加算せず、候補effectIdを1つだけ発生する'
);
assert.deepEqual(
  xionWithFavorite.actions.enhancedAttack.variants.default
    .filter(event => event.type === 'damage').map(event => event.effectId),
  ['Xion_enhanced_e01'],
  'シオン愛用Lv1は強化攻撃を書き換えない'
);
const xionWeightedMean = simulator.simulateMany(xionWithFavorite, {
  durationSeconds: 120,
  trials: 512,
  seed: 20260826,
  damageProfiles: {
    basicAttack: {
      variants: {
        '__exclusive:Xion_favorite_1_e01': {
          effects: { Xion_favorite_1_e01: { effectId: 'Xion_favorite_1_e01', expectedDamage: 200 } },
          totalExpectedDamage: 200
        },
        '__exclusive:Xion_favorite_1_e02': {
          effects: { Xion_favorite_1_e02: { effectId: 'Xion_favorite_1_e02', expectedDamage: 444 } },
          totalExpectedDamage: 444
        }
      }
    }
  }
});
assert.ok(
  Math.abs(
    xionWeightedMean.byAction.basicAttack.averageDamagePerDamagingAction - (200 * 0.34 + 444 * 0.66)
  ) < 2,
  'simulateManyの平均はシオン愛用Lv1の34/66加重期待値へ収束する'
);

// シオンの魔弾は生成済みの実データ・実モーションで検証する。低学年は
// 事前4発から+2で上限6発になり、各射撃直前の消費後残数を与ダメージへ使う。
const xionRuntimeBase = {
  damageType: '物理',
  baseAtk: 1000,
  finalAtk: 1000,
  baseDef: 1000,
  finalDef: 1000,
  defRate: 0.975,
  addRate: 1,
  rawAddRate: 1,
  specialP: 100,
  otherP: 100
};
const xionRuntimeConfig = simulator.buildCombatantConfig(xion, timingData.apostles.xion, {
  skillLevels: { low: 1, high: 1, passive: 1, default: 1 },
  runtimeEffects: {
    damageEffectIds: ['Xion_passive_e01', 'Xion_passive_e04'],
    resources: [{ id: '魔弾', initialStacks: 4, maxStacks: 6 }]
  }
});
xionRuntimeConfig.initialSp = 300;
const xionLowRuntimeVariants = Object.fromEntries(
  ['魔弾2', '魔弾3', '魔弾4', '魔弾5', '魔弾6'].map(branch => [branch, {
    effects: {
      Xion_low_e01: {
        effectId: 'Xion_low_e01',
        expectedDamage: 100,
        damageResult: { runtimeBase: xionRuntimeBase }
      }
    },
    totalExpectedDamage: 100
  }])
);
const xionRuntimeResult = simulator.simulate(xionRuntimeConfig, {
  durationSeconds: 12,
  highSkillMode: 'disabled',
  recordTimeline: true,
  damageProfiles: { lowSkill: { variants: xionLowRuntimeVariants } }
});
const xionLowHits = xionRuntimeResult.timeline.filter(event => (
  event.type === 'hit' && event.actionKey === 'lowSkill'
));
assert.deepEqual(
  xionLowHits.map(event => event.damageEvaluation.heldAddP),
  [25, 20, 15, 10, 5, 0],
  '事前魔弾4発から低学年で+2した6射は、消費後の5→0発に応じて所持補正を段階的に減らす'
);
assert.deepEqual(
  xionLowHits.map(event => event.damageEvaluation.modifierDelta.atkP),
  [40, 40, 40, 40, 40, 40],
  '低学年で獲得した魔弾2発は物理攻撃力+20%を2スタックして全射へ反映する'
);
assert.ok(
  xionLowHits.every(event => event.damageEvaluation.ratios.attackDefense > 1),
  '魔弾獲得時の物理攻撃力スタックは実際の攻防倍率へ反映する'
);
assert.ok(
  xionLowHits.every((event, index) => (
    index === 0 || event.expectedDamage < xionLowHits[index - 1].expectedDamage
  )),
  '物理攻撃力スタックが維持されても、魔弾所持の与ダメージ補正だけが射撃ごとに低下する'
);

// 同じ実データの獲得効果を高頻度に発生させ、9スタック上限と個別10秒失効を確認する。
const xionRapidHighTiming = structuredClone(timingData.apostles.xion);
xionRapidHighTiming.initialActionDelayFrames = 0;
xionRapidHighTiming.actions.highSkill = {
  motionFrames: 2,
  timingEvents: [
    { frame: 1, order: 1, effectKind: '魔弾獲得', effectId: 'Xion_high_e02' },
    { frame: 1, order: 2, effectKind: '魔弾消費', effectId: '' }
  ]
};
const xionRapidHighConfig = simulator.buildCombatantConfig(xion, xionRapidHighTiming, {
  skillLevels: { low: 1, high: 1, passive: 1, default: 1 },
  runtimeEffects: { damageEffectIds: ['Xion_passive_e01', 'Xion_passive_e04'] }
});
xionRapidHighConfig.actions.highSkill.cooldownSeconds = 0.01;
const xionRapidHighResult = simulator.simulate(xionRapidHighConfig, {
  durationSeconds: 2,
  highSkillMode: 'auto',
  initialHighSkillCooldownMultiplier: 0,
  recordTimeline: true,
  damageProfiles: {}
});
const xionGainBuffApplications = xionRapidHighResult.timeline.filter(event => (
  event.type === 'runtimeBuffApplied' && event.attackPPerStack === 20
));
assert.ok(xionGainBuffApplications.some(event => event.stackCount === 9),
  '魔弾を繰り返し獲得しても物理攻撃力バフは最大9スタックで止まる');
assert.ok(xionGainBuffApplications.every(event => event.stackCount <= 9),
  '魔弾獲得物理攻撃力バフは9スタックを超えない');

const xionSlowHighTiming = structuredClone(xionRapidHighTiming);
const xionSlowHighConfig = simulator.buildCombatantConfig(xion, xionSlowHighTiming, {
  skillLevels: { low: 1, high: 1, passive: 1, default: 1 },
  runtimeEffects: { damageEffectIds: ['Xion_passive_e01', 'Xion_passive_e04'] }
});
xionSlowHighConfig.actions.highSkill.cooldownSeconds = 4;
const xionSlowHighResult = simulator.simulate(xionSlowHighConfig, {
  durationSeconds: 15,
  highSkillMode: 'auto',
  initialHighSkillCooldownMultiplier: 0,
  recordTimeline: true,
  damageProfiles: {}
});
const xionSlowGainFrames = xionSlowHighResult.timeline.filter(event => (
  event.type === 'resourceChange' && event.operation === 'gain' && event.resourceId === '魔弾'
)).map(event => event.frame);
const xionSlowExpireFrames = xionSlowHighResult.timeline.filter(event => (
  event.type === 'runtimeBuffExpired' && event.label === '物理攻撃力増加'
)).map(event => event.frame);
assert.ok(xionSlowGainFrames.length >= 2 && xionSlowExpireFrames.length >= 1,
  '高学年の実魔弾獲得でも物理攻撃力バフの付与と失効を記録する');
assert.equal(xionSlowExpireFrames[0], xionSlowGainFrames[0] + 600,
  '魔弾獲得ごとの物理攻撃力スタックは10秒後に個別失効する');

// 行動倍率は「その他倍率」と別カテゴリで、対象行動の基礎倍率へ一度だけ適用する。
const actionMultiplierWithoutBase = simulator.evaluateDamageAtHit({
  expectedDamage: 100,
  actionKey: 'lowSkill',
  modifierDelta: { skillActionMultiplierBonusP: 100 }
});
assert.equal(actionMultiplierWithoutBase.expectedDamage, 200,
  '基礎プロファイルなしの行動倍率+100%はダメージを2倍にする');
assert.equal(actionMultiplierWithoutBase.ratios.actionMultiplier, 2,
  '基礎プロファイルなしでも行動倍率をその他倍率へ混ぜない');
assert.equal(actionMultiplierWithoutBase.ratios.other, 1,
  '行動倍率だけではその他倍率を変更しない');

const actionMultiplierWithBase = simulator.evaluateDamageAtHit({
  expectedDamage: 200,
  actionKey: 'lowSkill',
  modifierDelta: { skillActionMultiplierBonusP: 100 },
  runtimeBase: {
    baseActionMultiplierP: 200,
    actionMultiplierBonusP: 0,
    finalActionMultiplierP: 200
  }
});
assert.equal(actionMultiplierWithBase.expectedDamage, 400,
  '基礎行動倍率200%への行動倍率+100%を正しい比率で適用する');
assert.equal(actionMultiplierWithBase.ratios.actionMultiplier, 2,
  '基礎プロファイルありの行動倍率比率を保持する');
assert.equal(actionMultiplierWithBase.ratios.other, 1,
  '基礎プロファイルありでも行動倍率をその他倍率へ二重適用しない');

const scopedAttackMultiplier = simulator.evaluateDamageAtHit({
  expectedDamage: 100,
  actionKey: 'basicAttack',
  modifierDelta: { basicMultiplierBonusP: 50 }
});
assert.equal(scopedAttackMultiplier.expectedDamage, 150,
  '基本攻撃行動倍率は基本攻撃にだけ適用する');
const nonMatchingAttackMultiplier = simulator.evaluateDamageAtHit({
  expectedDamage: 100,
  actionKey: 'enhancedAttack',
  modifierDelta: { basicMultiplierBonusP: 50 }
});
assert.equal(nonMatchingAttackMultiplier.expectedDamage, 100,
  '基本攻撃行動倍率を強化攻撃へ誤適用しない');

const lowOnlyMultiplier = simulator.evaluateDamageAtHit({
  expectedDamage: 100,
  actionKey: 'lowSkill',
  modifierDelta: { lowSkillMultiplierBonusP: 50 }
});
assert.equal(lowOnlyMultiplier.expectedDamage, 150,
  '低学年専用の行動倍率を低学年へ適用する');
const highExcludedMultiplier = simulator.evaluateDamageAtHit({
  expectedDamage: 100,
  actionKey: 'highSkill',
  modifierDelta: { lowSkillMultiplierBonusP: 50 }
});
assert.equal(highExcludedMultiplier.expectedDamage, 100,
  '低学年専用の行動倍率を高学年へ誤適用しない');

const lowOnlyDamageAmount = simulator.evaluateDamageAtHit({
  expectedDamage: 100,
  actionKey: 'lowSkill',
  modifierDelta: { lowSkillAddP: 33 }
});
assert.equal(lowOnlyDamageAmount.expectedDamage, 133,
  '低学年専用の与ダメージ量補正を低学年へ適用する');
const lowDamageAmountExcludedFromBasic = simulator.evaluateDamageAtHit({
  expectedDamage: 100,
  actionKey: 'basicAttack',
  modifierDelta: { lowSkillAddP: 33 }
});
assert.equal(lowDamageAmountExcludedFromBasic.expectedDamage, 100,
  '低学年専用の与ダメージ量補正を基本攻撃へ誤適用しない');
const lowDamageAmountExcludedFromHigh = simulator.evaluateDamageAtHit({
  expectedDamage: 100,
  actionKey: 'highSkill',
  modifierDelta: { lowSkillAddP: 33 }
});
assert.equal(lowDamageAmountExcludedFromHigh.expectedDamage, 100,
  '低学年専用の与ダメージ量補正を高学年へ誤適用しない');

const unclassifiedScopedModifiers = simulator.evaluateDamageAtHit({
  expectedDamage: 100,
  actionKey: '',
  modifierDelta: {
    normalAttackAddP: 50,
    skillAddP: 50,
    lowSkillAddP: 50,
    normalAttackMultiplierBonusP: 50,
    skillActionMultiplierBonusP: 50,
    lowSkillMultiplierBonusP: 50
  }
});
assert.equal(unclassifiedScopedModifiers.expectedDamage, 100,
  '無分類ダメージへ普通攻撃・スキル・低学年専用補正を適用しない');

const unclassifiedGenericModifiers = simulator.evaluateDamageAtHit({
  expectedDamage: 100,
  actionKey: '',
  modifierDelta: { addP: 50 }
});
assert.equal(unclassifiedGenericModifiers.expectedDamage, 150,
  '無分類ダメージには汎用与ダメージ補正を適用する');

const triggeredUnclassifiedDamage = createFixture({
  durationSeconds: 1,
  includePoison: false,
  spRecoveryEffects: [{ id: 'initial-full-sp-unclassified', mode: 'initial', fixed: 300 }],
  damageBuffEffects: [{
    id: 'unclassified-runtime-buffs',
    label: '無分類検証補正',
    mode: 'fixed',
    fixedStacks: 1,
    modifiers: { addP: 50, skillAddP: 100 },
    baselineModifiersByAction: {}
  }],
  eventEffects: [{
    id: 'low-triggered-unclassified-damage',
    label: '低学年に付随する無分類ダメージ',
    triggerType: '低学年スキル使用時',
    triggerActionKeys: ['lowSkill'],
    oncePerAction: true,
    steps: [{
      type: 'damage',
      order: 1,
      effectId: 'unclassified_damage',
      unclassifiedDamage: true,
      expectedDamage: 100
    }]
  }]
});
const triggeredUnclassifiedHit = triggeredUnclassifiedDamage.timeline.find(event => (
  event.type === 'runtimeEffectHit' && event.runtimeEffectId === 'low-triggered-unclassified-damage'
));
assert.equal(triggeredUnclassifiedHit?.expectedDamage, 150,
  '行動に付随して発生した無分類ダメージも発動元のスキル専用補正を継承しない');

const formationExternalBuff = createFixture({
  durationSeconds: 1,
  includePoison: false,
  externalEvents: [{
    id: 'formation-low-skill',
    type: '低学年スキル使用時',
    frame: 0,
    sourceId: 'SupportA',
    reason: 'サポートA低学年'
  }],
  damageBuffEffects: [{
    id: 'support-low-buff',
    sourceId: 'SupportA_passive',
    externalSourceId: 'SupportA',
    externalTriggerType: '低学年スキル使用時',
    label: '編成使徒の低学年バフ',
    mode: 'externalTimed',
    durationFrames: 60,
    modifiers: { addP: 50 },
    baselineModifiersByAction: {}
  }]
});
assert.equal(
  formationExternalBuff.timeline.find(event => event.type === 'hit')?.expectedDamage,
  150,
  '編成候補から追加した外部行動で編成使徒の時限ダメージバフを発火する'
);

// バロン: 呪いは未指定時に単一枠で更新され、対象に残っている間だけ強化攻撃へ切り替わる。
const barong = apostleContext.__apostles.find(apostle => apostle.id === 'barong');
assert.ok(barong, 'バロンの生成データが存在する');
const barongTiming = timingData.apostles.barong;
assert.ok(barongTiming, 'バロンのskillmotion生成データが存在する');
const barongEnhancedTimingDamageEffectId = barongTiming.actions.enhancedAttack.timingEvents
  .find(event => !event.branch && event.effectKind === 'ダメージ')?.effectId || 'Barong_enhanced_e01';
const barongEnhancedTimingDamageIds = barongTiming.actions.enhancedAttack.timingEvents
  .filter(event => !event.branch && event.effectKind === 'ダメージ')
  .map(event => event.effectId);
assert.deepEqual(barongEnhancedTimingDamageIds, ['Barong_enhanced_e01', 'Barong_enhanced_e01'],
  'バロン強化攻撃の通常分岐はBarong_enhanced_e01だけを参照する');
assert.equal(barongEnhancedTimingDamageIds.includes('Renewa_enhanced_e01'), false,
  'バロン強化攻撃の通常分岐にRenewaのeffectIdを混在させない');

function buildBarongConfig(runtimeEffects = {}, buildOptions = {}) {
  return simulator.buildCombatantConfig(barong, barongTiming, {
    skillLevels: { low: 1, high: 1, default: 1 },
    runtimeEffects,
    ...buildOptions
  });
}

const barongAside2Effects = barong.aside?.levels?.['2']?.effects || [];
const barongAsideEffect = effectId => barongAside2Effects.find(effect => effect.effectId === effectId);
const barongAsidePoison = barongAsideEffect('Barong_aside_2_e05');
const barongAsidePoisonDuration = barongAsideEffect('Barong_aside_2_e06');
const barongAsideHeal = barongAsideEffect('Barong_aside_2_e07');
const barongAsidePoisonTiming = barongTiming.actions.lowSkill.timingEvents.find(event => (
  event.effectId === 'Barong_aside_2_e05' && event.branch === 'アサイド2'
));
const barongAsideHealTiming = barongTiming.actions.lowSkill.timingEvents.find(event => (
  event.effectId === 'Barong_aside_2_e07' && event.branch === 'アサイド2'
));
assert.equal(barongAsidePoison?.effectStack, true,
  '生成済みBarong A2毒は明示的にスタック可能である');
assert.equal(barongAsidePoison?.maxStack, 9,
  '生成済みBarong A2毒の最大スタックは9である');
assert.equal(barongAsidePoisonDuration?.effectStack, true,
  'Barong A2毒の持続時間行もスタック設定を保持する');
assert.equal(barongAsidePoisonDuration?.maxStack, 9,
  'Barong A2毒の持続時間行も最大スタック9を保持する');
assert.equal(barongAsidePoisonTiming?.frame, 166,
  'Barong A2毒の実測命中フレームは166である');
assert.equal(barongAsideHealTiming?.frame, 166,
  'Barong A2回復の実測命中フレームは166である');

const cardContext = {};
vm.runInNewContext(
  `${fs.readFileSync(require.resolve('../cards.js'), 'utf8')}\nthis.__cards = CARD_LIBRARY;`,
  cardContext
);
const barongCursedDoll = cardContext.__cards.artifacts.find(card => card.id === 'artifact_barong_cursed_doll');
const barongCursedDollEffect = barongCursedDoll?.conditionalEffects?.find(effect => (
  effect.id === 'artifact_barong_cursed_doll_e01'
));
assert.equal(barongCursedDollEffect?.triggerType, '状態異常付与時',
  '生成済みバロンの呪いのぬいぐるみは状態異常付与時を発動条件にする');
assert.equal(barongCursedDollEffect?.effectStack, false,
  '生成済みバロンの呪いのぬいぐるみは非スタックである');
assert.deepEqual(
  Array.from(barongCursedDollEffect?.bonusesByStar || [], bonus => bonus.addP),
  [50, 56.5, 63, 69.5, 76],
  'バロンの呪いのぬいぐるみはStar1〜5を50〜76%へマッピングする'
);

function createBarongAsideRuntimeEffects(enhancedAddP) {
  const poisonDurationFrames = Number(barongAsidePoisonDuration?.fixedValue || 0) * 60;
  const poisonEvent = {
    id: 'barong-aside-poison-runtime',
    label: 'バロンA2毒',
    triggerType: '対象スキル使用時',
    triggerSourceId: 'Barong_aside_2_e05',
    timingSourceEffectId: 'Barong_aside_2_e05',
    steps: [{
      type: 'status',
      order: Number(barongAsidePoison?.processOrder) || 1,
      application: {
        status: barongAsidePoison?.valueKind || '毒',
        durationFrames: poisonDurationFrames,
        stackable: barongAsidePoison?.effectStack === true,
        maxStacks: Number(barongAsidePoison?.maxStack) || 1,
        stackGroupId: '毒:stack:9',
        dealsPeriodicDamage: true,
        tickFrames: 60,
        tickMultiplier: 6
      }
    }]
  };
  const curseEffect = barongAsideEffect('Barong_aside_2_e03');
  const curseDuration = barongAsideEffect('Barong_aside_2_e04');
  const curseEvent = {
    id: 'barong-aside-curse-runtime',
    label: 'バロンA2霧呪い',
    triggerType: '対象スキル使用時',
    triggerSourceId: 'Barong_aside_2_e03',
    timingSourceEffectId: 'Barong_aside_2_e03',
    steps: [{
      type: 'status',
      order: Number(curseEffect?.processOrder) || 1,
      application: {
        status: curseEffect?.valueKind || '呪い',
        durationFrames: Number(curseDuration?.fixedValue || 0) * 60,
        stackable: false,
        maxStacks: 1,
        stackGroupId: '呪い:single:1',
        dealsPeriodicDamage: false,
        tickFrames: 0,
        tickMultiplier: 0
      }
    }]
  };
  const healEvent = {
    id: 'barong-aside-heal-runtime',
    label: 'バロンA2回復',
    triggerType: '対象スキル使用時',
    triggerSourceId: 'Barong_aside_2_e07',
    timingSourceEffectId: 'Barong_aside_2_e07',
    steps: [{
      type: 'healing',
      order: Number(barongAsideHeal?.processOrder) || 1,
      effectId: barongAsideHeal?.effectId || 'Barong_aside_2_e07',
      value: Number(barongAsideHeal?.fixedValue) || 15,
      reference: barongAsideHeal?.reference || '最大HP'
    }]
  };
  return {
    eventEffects: [curseEvent, poisonEvent, healEvent],
    damageBuffEffects: [{
      id: barongCursedDollEffect?.id || 'artifact_barong_cursed_doll_e01',
      label: barongCursedDollEffect?.shortLabel || '強化攻撃 与ダメージ増加',
      mode: 'statusApplicationTimed',
      triggerType: barongCursedDollEffect?.triggerType || '状態異常付与時',
      durationFrames: Number(barongCursedDollEffect?.duration || 6) * 60,
      stackable: barongCursedDollEffect?.effectStack === true,
      maxStacks: 1,
      modifiers: { enhancedAddP },
      baselineModifiersByAction: {}
    }]
  };
}

const barongAsideRuntimeConfig = buildBarongConfig(createBarongAsideRuntimeEffects(50), {
  timingBranches: { lowSkill: 'アサイド2' }
});
const barongAsideExplicitModeConfig = buildBarongConfig({}, {
  timingBranches: { lowSkill: 'アサイド2' },
  timingBranchModes: { lowSkill: { アサイド2: 'additive' } }
});
assert.ok(Object.values(barongAsideExplicitModeConfig.actions.lowSkill.variants)
  .flat()
  .some(event => event.type === 'damage' && event.effectId === 'Barong_low_e01'),
  '明示timingBranchModesでもA2分岐へ共通のBarong低学年本体を合成する');
barongAsideRuntimeConfig.spRegen = 300;
const barongAsideRuntimeResult = simulator.simulate(barongAsideRuntimeConfig, {
  durationSeconds: 8,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  recordTimeline: true,
  damageProfiles: {
    basicAttack: { variants: { default: { effects: { Barong_basic_e01: { effectId: 'Barong_basic_e01', expectedDamage: 100 } }, totalExpectedDamage: 100 } } },
    enhancedAttack: { variants: { default: { effects: { [barongEnhancedTimingDamageEffectId]: { effectId: barongEnhancedTimingDamageEffectId, expectedDamage: 100 } }, totalExpectedDamage: 200 } } },
    lowSkill: { variants: { アサイド2: { effects: { Barong_low_e01: { effectId: 'Barong_low_e01', expectedDamage: 100 } }, totalExpectedDamage: 100 } } }
  },
  statusDamageProfiles: { 毒: { expectedDamage: 1 } }
});
const barongAsideLowStart = barongAsideRuntimeResult.timeline.find(event => (
  event.type === 'actionStart' && event.actionKey === 'lowSkill'
));
const barongAsideLowHits = barongAsideRuntimeResult.timeline.filter(event => (
  event.type === 'hit' && event.actionKey === 'lowSkill' && event.effectId === 'Barong_low_e01'
));
assert.equal(barongAsideLowHits.length, 1,
  'Barong A2低学年の本体ダメージは共通行から1回だけ発生する');
assert.equal(barongAsideLowHits[0]?.frame, barongAsideLowStart?.frame + 166,
  'Barong A2低学年の本体ダメージは開始から166Fで発生する');
assert.ok(barongAsideLowHits[0]?.expectedDamage > 0,
  'Barong A2低学年の本体ダメージは0にならない');
const barongAsidePoisonApplications = barongAsideRuntimeResult.timeline.filter(event => (
  event.type === 'statusApplied' && event.status === '毒'
));
assert.equal(barongAsidePoisonApplications.length, 1,
  'Barong A2毒は1回の低学年スキルに対して一度だけ発動する');
assert.equal(barongAsidePoisonApplications[0]?.frame, barongAsideLowStart?.frame + 166,
  'Barong A2毒は低学年開始時ではなく開始から166Fで付与する');
assert.equal(barongAsidePoisonApplications[0]?.durationFrames, 180,
  'Barong A2毒の持続時間は3秒=180Fである');
assert.equal(barongAsidePoisonApplications[0]?.maxStacks, 9,
  'Barong A2毒の実行時最大スタックは9である');
assert.ok(barongAsidePoisonApplications[0]?.stackCount <= 9,
  'Barong A2毒の実行時スタック数は上限9を超えない');
const barongAsideHealing = barongAsideRuntimeResult.timeline.find(event => (
  event.type === 'runtimeHealingEvent' && event.runtimeEffectId === 'barong-aside-heal-runtime'
));
assert.equal(barongAsideHealing?.frame, barongAsideLowStart?.frame + 166,
  'Barong A2回復も開始から166Fで一度だけ発動する');
const barongAsideBuffApplications = barongAsideRuntimeResult.timeline.filter(event => (
  event.type === 'runtimeBuffApplied' && event.effectId === 'artifact_barong_cursed_doll_e01'
));
assert.ok(barongAsideBuffApplications.some(event => event.reason === '毒付与時'),
  '状態異常付与後にバロンの呪いのぬいぐるみを発動する');
assert.ok(barongAsideBuffApplications.every(event => event.stackCount === 1),
  'バロンの呪いのぬいぐるみは状態異常を再付与しても1スタックへ更新する');
assert.equal(barongAsideBuffApplications.at(-1)?.durationFrames, 360,
  'バロンの呪いのぬいぐるみは6秒=360Fで期限を更新する');
const barongAsideEnhancedHits = barongAsideRuntimeResult.timeline.filter(event => (
  event.type === 'hit' && event.actionKey === 'enhancedAttack'
));
assert.ok(barongAsideEnhancedHits.length > 0 && barongAsideEnhancedHits.every(event => (
  event.damageEvaluation?.modifierDelta?.enhancedAddP === 50
  && event.damageEvaluation?.ratios?.add === 1.5
)),
  '状態異常付与後の強化攻撃だけにStar1の+50%を適用する');
const barongAsideBasicHits = barongAsideRuntimeResult.timeline.filter(event => (
  event.type === 'hit' && event.actionKey === 'basicAttack'
));
assert.ok(barongAsideBasicHits.some(event => event.expectedDamage === 100),
  'バロンの呪いのぬいぐるみを基本攻撃へ適用しない');
const barongAsideDotTicks = barongAsideRuntimeResult.timeline.filter(event => event.type === 'statusTick' && event.status === '毒');
assert.ok(barongAsideDotTicks.length > 0 && barongAsideDotTicks.every(event => event.expectedDamage === 1),
  'バロンの呪いのぬいぐるみを毒DoTへ適用しない');
const barongAsideStar5Config = buildBarongConfig(createBarongAsideRuntimeEffects(76), {
  timingBranches: { lowSkill: 'アサイド2' }
});
barongAsideStar5Config.spRegen = 300;
const barongAsideStar5Result = simulator.simulate(barongAsideStar5Config, {
  durationSeconds: 8,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  recordTimeline: true,
  damageProfiles: {
    basicAttack: { variants: { default: { effects: { Barong_basic_e01: { effectId: 'Barong_basic_e01', expectedDamage: 100 } }, totalExpectedDamage: 100 } } },
    enhancedAttack: { variants: { default: { effects: { [barongEnhancedTimingDamageEffectId]: { effectId: barongEnhancedTimingDamageEffectId, expectedDamage: 100 } }, totalExpectedDamage: 200 } } },
    lowSkill: { variants: { アサイド2: { effects: { Barong_low_e01: { effectId: 'Barong_low_e01', expectedDamage: 100 } }, totalExpectedDamage: 100 } } }
  },
  statusDamageProfiles: { 毒: { expectedDamage: 1 } }
});
const barongAsideStar5Enhanced = barongAsideStar5Result.timeline.find(event => (
  event.type === 'hit' && event.actionKey === 'enhancedAttack'
));
assert.equal(barongAsideStar5Enhanced?.damageEvaluation?.modifierDelta?.enhancedAddP, 76,
  '状態異常付与後の強化攻撃へStar5の+76%を適用する');
assert.equal(barongAsideStar5Enhanced?.damageEvaluation?.ratios?.add, 1.76,
  '状態異常付与後の強化攻撃はStar5の+76%倍率になる');

const barongBeforeCurse = simulator.simulate(buildBarongConfig(), {
  durationSeconds: 2,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  recordTimeline: true,
  damageProfiles: {}
});
const barongNoAsideLowEvents = Object.values(buildBarongConfig().actions.lowSkill.variants)
  .flat()
  .filter(event => event.effectId === 'Barong_aside_2_e05' || event.effectId === 'Barong_aside_2_e07');
assert.equal(barongNoAsideLowEvents.length, 0,
  'アサイド未選択時にBarong A2の毒・回復タイミングを低学年へ混入しない');
assert.equal(barongBeforeCurse.timeline.find(event => event.type === 'actionStart')?.actionKey, 'basicAttack',
  '呪い付与前のバロンは基本攻撃を使う');

const barongLowConfig = buildBarongConfig({
  spRecoveryEffects: [{ id: 'barong-initial-sp', mode: 'initial', fixed: 300 }]
});
barongLowConfig.spRegen = 0;
assert.equal(barongLowConfig.actions.lowSkill.statusDefinitions.find(item => item.status === '呪い')?.stackable, false,
  'effectStack未指定の低学年呪いは非スタックとして構成する');
assert.equal(barongLowConfig.actions.highSkill.statusDefinitions.find(item => item.status === '呪い')?.stackable, false,
  'effectStack未指定の高学年呪いも非スタックとして構成する');
assert.equal(barongLowConfig.actions.enhancedAttack.triggerStatus, '呪い',
  '「呪い状態の敵が存在」を構造化した強化攻撃条件として解決する');
const barongLowResult = simulator.simulate(barongLowConfig, {
  durationSeconds: 23,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  recordTimeline: true,
  damageProfiles: {}
});
const barongLowCurse = barongLowResult.timeline.find(event => (
  event.type === 'statusApplied' && event.actionKey === 'lowSkill' && event.status === '呪い'
));
assert.ok(barongLowCurse, 'バロン低学年で呪いを付与する');
const barongLowEnhanced = barongLowResult.timeline.find(event => (
  event.type === 'actionStart' && event.actionKey === 'enhancedAttack' && event.frame > barongLowCurse.frame
));
assert.ok(barongLowEnhanced, '低学年の呪いが有効な間は強化攻撃を選ぶ');
const barongCurseExpired = barongLowResult.timeline.find(event => (
  event.type === 'statusExpired' && event.status === '呪い'
));
assert.ok(barongCurseExpired, '15秒後にバロンの呪いが失効する');
assert.ok(barongLowResult.timeline.some(event => (
  event.type === 'actionStart' && event.actionKey === 'basicAttack' && event.frame >= barongCurseExpired.frame
)), '呪い失効後は基本攻撃へ戻る');

const barongHighConfig = buildBarongConfig();
barongHighConfig.spRegen = 0;
const barongHighResult = simulator.simulate(barongHighConfig, {
  durationSeconds: 12,
  initialActionDelayFrames: 0,
  highSkillMode: 'auto',
  initialHighSkillCooldownMultiplier: 0,
  recordTimeline: true,
  damageProfiles: {}
});
const barongHighCurse = barongHighResult.timeline.find(event => (
  event.type === 'statusApplied' && event.actionKey === 'highSkill' && event.status === '呪い'
));
assert.ok(barongHighCurse, 'バロン高学年でも呪いを付与する');
assert.ok(barongHighResult.timeline.some(event => (
  event.type === 'actionStart' && event.actionKey === 'enhancedAttack' && event.frame > barongHighCurse.frame
)), '高学年の呪いが有効な間も強化攻撃を選ぶ');

const barongRefreshConfig = buildBarongConfig({
  spRecoveryEffects: [
    { id: 'barong-initial-sp', mode: 'initial', fixed: 300 },
    { id: 'barong-low-repeat-sp', mode: 'action', triggerActionKeys: ['lowSkill'], fixed: 300 }
  ]
});
barongRefreshConfig.spRegen = 0;
const barongRefreshResult = simulator.simulate(barongRefreshConfig, {
  durationSeconds: 16,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  recordTimeline: true,
  damageProfiles: {}
});
const barongCurseApplications = barongRefreshResult.timeline.filter(event => (
  event.type === 'statusApplied' && event.status === '呪い'
));
assert.ok(barongCurseApplications.length >= 2, '低学年の再使用で呪いを再付与する');
assert.ok(barongCurseApplications.every(event => event.stackCount === 1),
  '同名の未指定呪いを低学年で再付与しても1スタックを超えない');
assert.ok(barongRefreshResult.timeline.some(event => (
  event.type === 'effectStateChanged' && event.kind === 'debuff' && event.status === '呪い' && event.operation === 'update'
)), '非スタック呪いの再付与は新しい期限へ更新する');

const barongFavoriteLv1 = barong.favoriteCard.levels['1'][0];
const barongFavoriteConfig = buildBarongConfig({
  spRecoveryEffects: [{ id: 'barong-initial-sp', mode: 'initial', fixed: 300 }]
}, {
  skillOverrides: {
    enhancedAttack: simulator.createActionSkillOverride(barongFavoriteLv1, 'enhancedAttack')
  },
  timingBranches: { enhancedAttack: barong.favoriteCard.name }
});
barongFavoriteConfig.spRegen = 0;
assert.equal(barongFavoriteConfig.actions.enhancedAttack.triggerStatus, '呪い',
  '愛用品Lv1の強化攻撃も元の呪い条件を継承する');
assert.deepEqual(
  barongFavoriteConfig.actions.enhancedAttack.variants[barong.favoriteCard.name]
    .filter(event => event.type === 'damage').map(event => event.effectId),
  ['Barong_favorite_1_e01', 'Barong_favorite_1_e01', 'Barong_favorite_1_e01'],
  '愛用品Lv1の強化攻撃は専用タイミングの3ヒットを使う'
);
const barongFavoriteResult = simulator.simulate(barongFavoriteConfig, {
  durationSeconds: 10,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  recordTimeline: true,
  damageProfiles: {}
});
const barongFavoriteEnhancedStart = barongFavoriteResult.timeline.find(event => (
  event.type === 'actionStart' && event.actionKey === 'enhancedAttack'
));
assert.ok(barongFavoriteEnhancedStart, '愛用品Lv1でも呪い中に強化攻撃を選ぶ');
assert.equal(barongFavoriteResult.timeline.filter(event => (
  event.type === 'hit' && event.actionKey === 'enhancedAttack' && event.effectId === 'Barong_favorite_1_e01'
)).length >= 3, true, '愛用品Lv1の強化攻撃はBarong_favorite_1_e01を3ヒット発生する');

// effectId連鎖は実ダメージの発生だけを発火元にし、状態などの補助stepを
// 「ダメージ発生」と誤認しない。
const nonDamageEffectSourceResult = createFixture({
  durationSeconds: 1,
  includePoison: false,
  timingEvents: [{ frame: 1, order: 1, effectKind: 'ダメージ', effectId: 'damage' }],
  eventEffects: [{
    id: 'non-damage-effect-source',
    triggerType: '普通攻撃命中時',
    triggerActionKeys: ['basicAttack'],
    oncePerAction: true,
    effectIds: ['non_damage_effect_e01'],
    steps: [{
      type: 'status',
      application: {
        status: '連鎖しない補助状態', durationFrames: 60, stackable: false, maxStacks: 1,
        stackGroupId: 'non-damage-effect-source', dealsPeriodicDamage: false, tickFrames: 0, tickMultiplier: 0
      }
    }]
  }, {
    id: 'non-damage-effect-followup',
    triggerType: '補助効果発生時',
    triggerSourceId: 'non_damage_effect_e01',
    steps: [{ type: 'damage', effectId: 'non_damage_followup_e01', expectedDamage: 999 }]
  }]
});
assert.equal(nonDamageEffectSourceResult.timeline.some(event => (
  event.type === 'runtimeEffectHit' && event.runtimeEffectId === 'non-damage-effect-followup'
)), false, '状態・リソース・回復など非ダメージstepのeffectIdからダメージ連鎖を発火しない');

// シーラA2竜巻: 普通攻撃の通常ヒットを残したまま、行動ごとに一度だけ
// e02の確率抽選を行い、成功したruntime effectからe03を連鎖させる。
const sylla = apostleContext.__apostles.find(apostle => apostle.id === 'sylla');
const syllaTiming = timingData.apostles.sylla;
assert.ok(sylla && syllaTiming, 'シーラの生成データとskillmotionが存在する');

function createSyllaTornadoEvents(probability = 75, extraEvents = []) {
  return [{
    id: 'focused:sylla:e02',
    label: 'シーラ竜巻',
    triggerType: '普通攻撃命中時一定確率',
    triggerValue: probability,
    triggerProbability: probability,
    triggerSourceId: '普通攻撃',
    effectIds: ['Sylla_aside_2_e02'],
    triggerActionKeys: ['basicAttack', 'enhancedAttack'],
    oncePerAction: true,
    steps: [{
      type: 'damage',
      effectId: 'Sylla_aside_2_e02',
      expectedDamage: 120
    }]
  }, {
    id: 'focused:sylla:e03',
    label: 'シーラ竜巻追加',
    triggerType: '竜巻ダメージ発生時',
    triggerSourceId: 'Sylla_aside_2_e02',
    effectIds: ['Sylla_aside_2_e03'],
    conditionType: '追加対象存在',
    conditionValue: '1',
    steps: [{
      type: 'damage',
      effectId: 'Sylla_aside_2_e03',
      expectedDamage: 120
    }]
  }, ...extraEvents];
}

function buildSyllaTornadoConfig({ asideRank = 2, probability = 75, enemyCount = 1, extraEvents = [] } = {}) {
  return simulator.buildCombatantConfig(sylla, syllaTiming, {
    asideRank,
    skillLevels: { low: 1, high: 1, passive: 1, default: 1, asideRank },
    enemyCount,
    runtimeEffects: {
      eventEffects: asideRank >= 2 ? createSyllaTornadoEvents(probability, extraEvents) : []
    }
  });
}

const syllaDamageProfiles = {
  basicAttack: {
    variants: {
      default: {
        effects: {
          Sylla_basic_e01: { effectId: 'Sylla_basic_e01', expectedDamage: 100 }
        },
        totalExpectedDamage: 100
      }
    }
  }
};
const syllaSingleTarget = simulator.simulate(buildSyllaTornadoConfig(), {
  durationSeconds: 5,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  seed: 1,
  recordTimeline: true,
  damageProfiles: syllaDamageProfiles
});
const syllaBaseHits = syllaSingleTarget.timeline.filter(event => (
  event.type === 'hit' && event.actionKey === 'basicAttack' && event.effectId === 'Sylla_basic_e01'
));
const syllaSingleE02Hits = syllaSingleTarget.timeline.filter(event => (
  event.type === 'runtimeEffectHit' && event.effectId === 'Sylla_aside_2_e02'
));
const syllaSingleE03Hits = syllaSingleTarget.timeline.filter(event => (
  event.type === 'runtimeEffectHit' && event.effectId === 'Sylla_aside_2_e03'
));
assert.ok(syllaBaseHits.length > 0, 'シーラ普通攻撃の通常ダメージを維持する');
assert.ok(syllaSingleE02Hits.length > 0, 'シーラA2 e02竜巻を成功時に発生させる');
assert.equal(syllaSingleE03Hits.length, 0, '単体対象ではシーラe03追加竜巻を発生させない');
assert.equal(
  syllaSingleTarget.damage.byAction.basicAttack,
  syllaBaseHits.reduce((sum, event) => sum + event.expectedDamage, 0),
  'シーラe02を基本攻撃の静的ダメージへ二重加算しない'
);
const syllaBaseHitIndex = syllaSingleTarget.timeline.findIndex(event => (
  event.type === 'hit' && event.effectId === 'Sylla_basic_e01'
));
const syllaE02Index = syllaSingleTarget.timeline.findIndex(event => (
  event.type === 'runtimeEffectHit' && event.effectId === 'Sylla_aside_2_e02'
));
assert.ok(syllaE02Index > syllaBaseHitIndex,
  'シーラe02竜巻runtimeEffectHitは通常攻撃ヒット後へ記録する');
assert.equal(
  syllaSingleTarget.runtimeEffects.eventEffects.find(effect => effect.id === 'focused:sylla:e02')?.triggerCount,
  syllaSingleE02Hits.length,
  'シーラe02の発生回数とruntimeEffectHitを区別して集計する'
);

const syllaMultiHitConfig = buildSyllaTornadoConfig({ probability: 100 });
syllaMultiHitConfig.actions.basicAttack.variants.default[0].hitCount = 4;
const syllaMultiHit = simulator.simulate(syllaMultiHitConfig, {
  durationSeconds: 1.5,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  seed: 1,
  recordTimeline: true,
  damageProfiles: syllaDamageProfiles
});
assert.equal(syllaMultiHit.hits.basicAttack, 4,
  'シーラmulti-hit通常攻撃のヒット数を維持する');
assert.equal(syllaMultiHit.timeline.filter(event => event.type === 'runtimeEffectProbability').length, 1,
  'シーラmulti-hitでもe02の確率抽選は1行動1回だけ行う');
assert.equal(syllaMultiHit.timeline.filter(event => (
  event.type === 'runtimeEffectHit' && event.effectId === 'Sylla_aside_2_e02'
)).length, 1, 'シーラmulti-hitでもe02竜巻は1行動1回だけ発生する');

const syllaZeroProbability = simulator.simulate(buildSyllaTornadoConfig({ probability: 0 }), {
  durationSeconds: 5,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  seed: 1,
  recordTimeline: true,
  damageProfiles: syllaDamageProfiles
});
assert.equal(syllaZeroProbability.timeline.some(event => (
  event.type === 'runtimeEffectHit' && event.effectId === 'Sylla_aside_2_e02'
)), false, 'シーラe02発動率0%では竜巻を発生させない');
const syllaHundredProbability = simulator.simulate(buildSyllaTornadoConfig({ probability: 100 }), {
  durationSeconds: 5,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  seed: 1,
  recordTimeline: true,
  damageProfiles: syllaDamageProfiles
});
assert.equal(
  syllaHundredProbability.timeline.filter(event => (
    event.type === 'runtimeEffectHit' && event.effectId === 'Sylla_aside_2_e02'
  )).length,
  syllaHundredProbability.timeline.filter(event => (
    event.type === 'hit' && event.actionKey === 'basicAttack' && event.effectId === 'Sylla_basic_e01'
  )).length,
  'シーラe02発動率100%では各普通攻撃後に竜巻を発生させる'
);

const syllaMultiTarget = simulator.simulate(buildSyllaTornadoConfig({ enemyCount: 2 }), {
  durationSeconds: 5,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  seed: 1,
  recordTimeline: true,
  damageProfiles: syllaDamageProfiles
});
const syllaMultiTargetE02Count = syllaMultiTarget.timeline.filter(event => (
  event.type === 'runtimeEffectHit' && event.effectId === 'Sylla_aside_2_e02'
)).length;
const syllaMultiTargetE03Count = syllaMultiTarget.timeline.filter(event => (
  event.type === 'runtimeEffectHit' && event.effectId === 'Sylla_aside_2_e03'
)).length;
assert.ok(syllaMultiTargetE02Count > 0, '敵2体のシーラe02竜巻を発生させる');
assert.equal(syllaMultiTargetE03Count, syllaMultiTargetE02Count,
  '敵2体ではシーラe02成功1回につきe03を1回だけ連鎖させる');

const syllaAggregate = simulator.simulateMany(buildSyllaTornadoConfig(), {
  durationSeconds: 12,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  seed: 7,
  trials: 128,
  adaptiveTrials: false,
  damageProfiles: syllaDamageProfiles
});
assert.equal(syllaAggregate.deterministic, false,
  'シーラe02の確率イベントをsimulateManyで非決定として扱う');
assert.equal(syllaAggregate.evaluatedTrials, 128,
  'シーラe02の確率イベントでsimulateManyを1試行へ固定しない');
const syllaExactConfig = buildSyllaTornadoConfig();
const syllaExactOptions = {
  durationSeconds: 12,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  seed: 31,
  trials: 7,
  exactTrials: true,
  // exactTrials が収束短縮より優先することも確認する。
  adaptiveTrials: true,
  damageProfiles: syllaDamageProfiles
};
const syllaExactAggregate = simulator.simulateMany(syllaExactConfig, syllaExactOptions);
const syllaExactSingles = Array.from({ length: 7 }, (_, index) => simulator.simulate(syllaExactConfig, {
  ...syllaExactOptions,
  seed: syllaExactOptions.seed + index,
  recordTimeline: false,
  recordDamageSeries: false
}));
assert.equal(syllaExactAggregate.evaluatedTrials, 7,
  'exactTrialsでは確率の収束短縮をせず指定した統計試行数をすべて実行する');
assert.deepEqual(syllaExactAggregate.trialSeeds, [31, 32, 33, 34, 35, 36, 37],
  '統計試行は初期seedから連番の異なるseedを使う');
assert.equal(new Set(syllaExactAggregate.trialSeeds).size, 7,
  '統計試行で同一seedを繰り返さない');
const syllaExactTotalDamage = syllaExactSingles.reduce((sum, result) => sum + result.damage.totalExpectedDamage, 0) / syllaExactSingles.length;
assert.ok(Math.abs(syllaExactAggregate.totalExpectedDamage - syllaExactTotalDamage) < 1e-9,
  'aggregate平均総ダメージは全trialの平均から算出する');
assert.ok(Math.abs(syllaExactAggregate.meanDps - syllaExactTotalDamage / syllaExactOptions.durationSeconds) < 1e-9,
  'aggregate平均DPSは全trial平均総ダメージを計測時間で割る');
const syllaExactBasicDamage = syllaExactSingles.reduce((sum, result) => sum + result.damage.byAction.basicAttack, 0) / syllaExactSingles.length;
assert.ok(Math.abs(syllaExactAggregate.byAction.basicAttack.expectedDamage - syllaExactBasicDamage) < 1e-9,
  '行動別DPS内訳も単一seedではなく全trial平均から算出する');
const syllaAverageStarts = syllaAggregate.byAction.basicAttack.averageStarts;
const syllaAverageTornadoes = syllaAggregate.byRuntimeEffect['focused:sylla:e02']?.averageTriggers || 0;
assert.ok(syllaAverageStarts > 0 && syllaAverageTornadoes / syllaAverageStarts > 0.6
  && syllaAverageTornadoes / syllaAverageStarts < 0.9,
  'シーラe02の複数seed平均発動率が75%付近になる');

const syllaCycleEvents = [
  {
    id: 'focused:sylla:cycle-a',
    triggerType: '竜巻連鎖A',
    triggerSourceId: 'Sylla_aside_2_e03',
    effectIds: ['sylla_cycle_a_e01'],
    steps: [{ type: 'damage', effectId: 'sylla_cycle_a_e01', expectedDamage: 1 }]
  },
  {
    id: 'focused:sylla:cycle-b',
    triggerType: '竜巻連鎖B',
    triggerSourceId: 'sylla_cycle_a_e01',
    // e02 IDを再出力してe03へ戻る経路を作る。chainPathで循環を止める。
    effectIds: ['Sylla_aside_2_e02'],
    steps: [{ type: 'damage', effectId: 'Sylla_aside_2_e02', expectedDamage: 1 }]
  }
];
const syllaCycleResult = simulator.simulate(buildSyllaTornadoConfig({
  enemyCount: 2,
  extraEvents: syllaCycleEvents
}), {
  durationSeconds: 5,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  seed: 1,
  recordTimeline: true,
  damageProfiles: syllaDamageProfiles
});
assert.ok(syllaCycleResult.timeline.length < 1000, 'シーラのeffectId連鎖循環を再帰的に増殖させない');
assert.ok(syllaCycleResult.timeline.some(event => (
  event.type === 'runtimeEffectHit' && event.runtimeEffectId === 'focused:sylla:cycle-a'
)), 'シーラe03からeffectId連鎖イベントを1回処理する');

function buildChloeDollWillConfig({ favorite = false } = {}) {
  const apostle = {
    id: 'ChloeRuntimeFixture',
    basic: { initialSp: 998, spRecoveryPerSecond: 1 },
    skills: [{
      skillId: 'Chloe_low', skillType: '低学年', requiredSp: 999,
      effects: [
        { effectId: 'Chloe_low_e01', processGroupId: 'will', processOrder: 1, valueKind: 'ぬいぐるみの意志', valueClass: '状態付与', effectType: '固有状態', triggerType: '低学年スキル使用時', effectTarget: '自身' },
        { effectId: 'Chloe_low_e06', processGroupId: 'will', processOrder: 2, valueKind: 'ぬいぐるみの意志', valueClass: '持続時間', effectType: '固有状態', triggerType: '低学年スキル使用時', effectTarget: '自身', fixedValue: 12 },
        { effectId: 'Chloe_low_e04', processGroupId: 'basic-buff', valueKind: '普通攻撃ダメージ量増加', valueClass: '倍率', effectType: 'バフ', effectStack: true, maxStack: 9, triggerType: '普通攻撃使用時', conditionType: '固有状態中', conditionValue: 'Chloe_low_e01', targetSkill: '基本攻撃', fixedValue: 7 },
        { effectId: 'Chloe_low_e05', processGroupId: 'basic-buff', valueKind: '普通攻撃ダメージ量増加', valueClass: '持続時間', effectType: 'バフ', effectStack: true, maxStack: 9, triggerType: '普通攻撃使用時', conditionType: '固有状態中', conditionValue: 'Chloe_low_e01', targetSkill: '基本攻撃', fixedValue: 10 }
      ]
    }, {
      skillId: 'Chloe_basic', skillType: '普通攻撃_基本', effects: [
        { effectId: 'Chloe_basic_e01', valueKind: '魔法ダメージ', valueClass: '倍率', effectType: '攻撃', conditionType: '固有状態外', conditionValue: 'Chloe_low_e01', fixedValue: 125 },
        { effectId: 'Chloe_basic_e02', processOrder: 1, valueKind: 'ぬいぐるみの意志の魔法ダメージ', valueClass: '倍率', effectType: '攻撃', conditionType: '固有状態中', conditionValue: 'Chloe_low_e01', condition: 'ぬいぐるみの意志発動中', fixedValue: 192 },
        { effectId: 'Chloe_basic_e03', processOrder: 2, valueKind: 'ぬいぐるみの意志の魔法ダメージ', valueClass: 'ヒット数', effectType: '攻撃', conditionType: '固有状態中', conditionValue: 'Chloe_low_e01', condition: 'ぬいぐるみの意志発動中', fixedValue: 2 },
        { effectId: 'Chloe_basic_e04', processOrder: 3, valueKind: 'ぬいぐるみの意志の最後の魔法ダメージ', valueClass: '倍率', effectType: '攻撃', conditionType: '固有状態中', conditionValue: 'Chloe_low_e01', condition: 'ぬいぐるみの意志発動中', fixedValue: 288 }
      ]
    }, {
      skillId: 'Chloe_enhanced', skillType: '普通攻撃_強化', triggerType: 'n回ごと', triggerValue: 3,
      effects: [{ effectId: 'Chloe_enhanced_e01', valueKind: '魔法ダメージ', valueClass: '倍率', effectType: '攻撃', conditionType: '固有状態外', conditionValue: 'Chloe_low_e01', fixedValue: 300 }]
    }]
  };
  const timing = {
    id: 'chloe-runtime-fixture', initialActionDelayFrames: 0, normalAttackIntervalFrames: 60,
    spRecoveryIntervalFrames: 1,
    actions: {
      lowSkill: { motionFrames: 1, motionVariants: [{ branch: '', gameFrames: 1 }], timingEvents: [] },
      basicAttack: {
        motionFrames: 45, motionVariants: [{ branch: '', gameFrames: 45 }],
        timingEvents: [
          { frame: 10, order: 1, effectKind: 'ダメージ', effectId: '' },
          { frame: 5, order: 1, branch: 'ぬいぐるみの意志', effectKind: 'ダメージ', effectId: '' },
          { frame: 10, order: 2, branch: 'ぬいぐるみの意志', effectKind: 'ダメージ', effectId: '' },
          { frame: 20, order: 3, branch: 'ぬいぐるみの意志', effectKind: 'ダメージ', effectId: '' }
        ]
      },
      enhancedAttack: { motionFrames: 30, motionVariants: [{ branch: '', gameFrames: 30 }], timingEvents: [{ frame: 10, order: 1, effectKind: 'ダメージ', effectId: '' }] }
    }
  };
  const eventEffects = [{
    id: 'chloe-will', label: 'ぬいぐるみの意志', triggerType: '低学年スキル使用時', triggerActionKeys: ['lowSkill'],
    steps: [{ type: 'selfState', order: 1, application: { stateId: 'Chloe_low_e01', status: 'ぬいぐるみの意志', durationFrames: 720 } }]
  }];
  if (favorite) eventEffects.push({
    id: 'chloe-thread-tick', label: '糸爆弾付与', triggerType: 'n秒ごと', intervalFrames: 120,
    startOnSelfStateId: 'Chloe_low_e01', conditionType: '固有状態中', conditionValue: 'Chloe_low_e01',
    steps: [
      { type: 'damage', order: 2, effectId: 'Chloe_favorite_1_e03', expectedDamage: 230 },
      { type: 'status', order: 3, application: { status: '糸爆弾', applicationEffectId: 'Chloe_favorite_1_e04', durationFrames: Infinity, stackable: true, maxStacks: 5, stackGroupId: 'chloe-thread-bomb' } }
    ]
  }, {
    id: 'chloe-thread-explode', label: '糸爆弾爆発', triggerType: '状態最大スタック到達時', triggerSourceId: 'Chloe_favorite_1_e04', consumeMaxStacks: true,
    steps: [{ type: 'damage', order: 1, effectId: 'Chloe_favorite_1_e06', expectedDamage: 346 }]
  });
  return simulator.buildCombatantConfig(apostle, timing, {
    runtimeEffects: {
      eventEffects,
      damageBuffEffects: [{
        id: 'chloe-basic-buff', label: '普通攻撃ダメージ量増加', mode: 'actionTimed', triggerActionKeys: ['basicAttack'],
        conditionType: '固有状態中', conditionValue: 'Chloe_low_e01', durationFrames: 600, stackable: true, maxStacks: 9,
        modifiers: { normalAttackAddP: 7 }
      }]
    }
  });
}

const chloeWithoutFavorite = simulator.simulate(buildChloeDollWillConfig(), {
  durationSeconds: 16, initialActionDelayFrames: 0, highSkillMode: 'disabled', recordTimeline: true,
  damageProfiles: {
    basicAttack: { variants: { default: { effects: { Chloe_basic_e01: { effectId: 'Chloe_basic_e01', expectedDamage: 125 } } }, 'ぬいぐるみの意志': { effects: { Chloe_basic_e02: { effectId: 'Chloe_basic_e02', expectedDamage: 192 }, Chloe_basic_e04: { effectId: 'Chloe_basic_e04', expectedDamage: 288 } } } } },
    enhancedAttack: { variants: { default: { effects: { Chloe_enhanced_e01: { effectId: 'Chloe_enhanced_e01', expectedDamage: 300 } } } } }
  }
});
const chloeWillHits = chloeWithoutFavorite.timeline.filter(event => event.type === 'hit' && event.variant === 'ぬいぐるみの意志');
assert.ok(chloeWillHits.length > 0 && chloeWillHits.every(event => ['Chloe_basic_e02', 'Chloe_basic_e04'].includes(event.effectId)),
  'ぬいぐるみの意志中は変更後の基本攻撃だけを選び、通常基本攻撃を二重加算しない');
const chloeWillState = chloeWithoutFavorite.timeline.find(event => (
  event.type === 'effectStateChanged' && event.kind === 'selfState' && event.effectId === 'Chloe_low_e01'
));
assert.equal(chloeWithoutFavorite.timeline.filter(event => (
  event.type === 'actionStart' && event.actionKey === 'enhancedAttack'
  && event.frame >= chloeWillState.appliedFrame && event.frame < chloeWillState.expireFrame
)).length, 0, 'ぬいぐるみの意志中は3回目でも強化攻撃を開始しない');
const chloeBasicBuffApplications = chloeWithoutFavorite.timeline.filter(event => (
  event.type === 'runtimeBuffApplied' && event.effectId === 'chloe-basic-buff'
));
assert.ok(chloeBasicBuffApplications.some(event => event.stackCount === 9)
  && chloeBasicBuffApplications.every(event => event.stackCount <= 9),
  'クロエ通常攻撃バフは9スタックまで到達し、それを超えない');
const chloeBasicBuffStateChanges = chloeWithoutFavorite.timeline.filter(event => (
  event.type === 'effectStateChanged' && event.kind === 'buff' && event.effectId === 'chloe-basic-buff'
  && event.operation === 'apply'
));
assert.ok(chloeBasicBuffStateChanges.some(event => event.expireFrame > chloeWillState.expireFrame),
  'ぬいぐるみの意志終了後も、すでに得た通常攻撃バフは残り時間中維持する');
assert.equal(chloeWithoutFavorite.timeline.some(event => event.type === 'runtimeEffectHit' && /chloe-thread/.test(event.runtimeEffectId || '')), false,
  '愛用品なしでは糸爆弾の周期ダメージ・爆発を発生させない');

const chloeWithFavorite = simulator.simulate(buildChloeDollWillConfig({ favorite: true }), {
  durationSeconds: 16, initialActionDelayFrames: 0, highSkillMode: 'disabled', recordTimeline: true,
  damageProfiles: {
    basicAttack: { variants: { default: { effects: { Chloe_basic_e01: { effectId: 'Chloe_basic_e01', expectedDamage: 125 } } }, 'ぬいぐるみの意志': { effects: { Chloe_basic_e02: { effectId: 'Chloe_basic_e02', expectedDamage: 192 }, Chloe_basic_e04: { effectId: 'Chloe_basic_e04', expectedDamage: 288 } } } } },
    enhancedAttack: { variants: { default: { effects: { Chloe_enhanced_e01: { effectId: 'Chloe_enhanced_e01', expectedDamage: 300 } } } } }
  }
});
const chloeThreadTicks = chloeWithFavorite.timeline.filter(event => event.type === 'runtimeEffectHit' && event.runtimeEffectId === 'chloe-thread-tick');
const chloeThreadExplosion = chloeWithFavorite.timeline.filter(event => event.type === 'runtimeEffectHit' && event.runtimeEffectId === 'chloe-thread-explode');
assert.equal(chloeThreadTicks.length, 5, 'ぬいぐるみの意志開始から2秒ごとに5回、糸爆弾付与ダメージを発生させる');
assert.equal(chloeThreadExplosion.length, 1, '糸爆弾5スタック到達時に346%爆発を即時に1回だけ発生させる');
assert.ok(chloeWithFavorite.timeline.some(event => event.type === 'effectStateChanged' && event.status === '糸爆弾'
  && event.operation === 'remove' && /最大スタック到達効果/.test(event.reason || '')),
  '糸爆弾爆発後に5スタックを消費してリセットする');
assert.equal(chloeWithFavorite.timeline.filter(event => event.type === 'runtimeEffectHit' && event.runtimeEffectId === 'chloe-thread-tick'
  && event.frame > 13 * 60).length, 0, 'ぬいぐるみの意志終了後は2秒周期を停止する');

console.log('DPS runtime effect tests passed');
