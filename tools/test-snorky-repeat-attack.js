#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const simulator = require('../dps-simulator.js');

const REPEAT_GROUP = 'Snorky_enhanced_repeat01';

function repeatRows(initialProbabilityP = 70, decrementPoints = 20, condition = '説明文は参照しない') {
  return [
    {
      effectId: 'Snorky_enhanced_e02',
      processGroupId: REPEAT_GROUP,
      processOrder: 1,
      valueKind: '連続発動確率',
      valueClass: '倍率',
      effectType: '攻撃',
      effectTarget: '自身',
      targetSkill: '普通攻撃_強化',
      triggerType: '強化攻撃終了時',
      triggerSourceId: '強化攻撃',
      effectStack: false,
      condition,
      fixedValue: initialProbabilityP
    },
    {
      effectId: 'Snorky_enhanced_e03',
      processGroupId: REPEAT_GROUP,
      processOrder: 2,
      valueKind: '連続発動確率減少',
      valueClass: '倍率',
      effectType: '攻撃',
      effectTarget: '自身',
      targetSkill: '普通攻撃_強化',
      triggerType: '強化攻撃終了時',
      triggerSourceId: '強化攻撃',
      effectStack: false,
      condition,
      fixedValue: decrementPoints
    }
  ];
}

function createApostle({ repeat = true, initialProbabilityP = 70, decrementPoints = 20, condition, lowRequiredSp = 1, initialSp = 0, spRecoveryPerSecond = 0 } = {}) {
  const enhancedEffects = [
    {
      effectId: 'Snorky_enhanced_e01',
      valueKind: '物理ダメージ',
      valueClass: '倍率',
      effectType: '攻撃',
      effectTarget: '敵/範囲',
      targetSkill: '普通攻撃_強化',
      fixedValue: 350
    },
    ...(repeat ? repeatRows(initialProbabilityP, decrementPoints, condition) : [])
  ];
  return {
    id: 'Snorky',
    name: 'スノキー',
    basic: {
      initialSp,
      spRecoveryPerSecond,
      personality: '憂鬱'
    },
    skills: [
      {
        skillId: 'Snorky_basic',
        skillType: '普通攻撃_基本',
        effects: [{
          effectId: 'Snorky_basic_e01',
          valueKind: '物理ダメージ',
          valueClass: '倍率',
          effectType: '攻撃',
          effectTarget: '敵',
          fixedValue: 100
        }]
      },
      {
        skillId: 'Snorky_enhanced',
        skillType: '普通攻撃_強化',
        triggerType: 'n回ごと',
        triggerValue: 3,
        effects: enhancedEffects
      },
      {
        skillId: 'Snorky_low',
        skillType: '低学年',
        requiredSp: lowRequiredSp,
        effects: []
      }
    ]
  };
}

const timing = {
  id: 'Snorky',
  name: 'スノキー',
  initialActionDelayFrames: 0,
  normalAttackIntervalFrames: 20,
  actions: {
    basicAttack: { motionFrames: 1 },
    enhancedAttack: { motionFrames: 10 },
    lowSkill: { motionFrames: 4 }
  }
};

const damageProfiles = {
  basicAttack: {
    variants: {
      default: {
        totalExpectedDamage: 100,
        effects: { Snorky_basic_e01: { effectId: 'Snorky_basic_e01', expectedDamage: 100 } }
      }
    }
  },
  enhancedAttack: {
    variants: {
      default: {
        totalExpectedDamage: 350,
        effects: { Snorky_enhanced_e01: { effectId: 'Snorky_enhanced_e01', expectedDamage: 350 } }
      }
    }
  },
  lowSkill: { variants: { default: { totalExpectedDamage: 0, effects: {} } } }
};

const favoriteDamageProfiles = {
  ...damageProfiles,
  enhancedAttack: {
    variants: {
      default: {
        totalExpectedDamage: 700,
        effects: { Snorky_favorite_1_e01: { effectId: 'Snorky_favorite_1_e01', expectedDamage: 700 } }
      }
    }
  }
};

function buildConfig(options = {}) {
  return simulator.buildCombatantConfig(
    options.apostle || createApostle(options),
    options.timing || timing,
    {
      skillLevels: { default: 1, low: 1, high: 1, passive: 1 },
      skillOverrides: options.skillOverrides || {},
      runtimeEffects: options.runtimeEffects ?? {
        spRecoveryEffects: [{
          id: 'fixture-repeat-sp',
          label: 'fixture 強化攻撃SP',
          mode: 'action',
          triggerActionKeys: ['enhancedAttack'],
          triggerPhase: 'start',
          fixed: 1
        }],
        damageBuffEffects: [{
          id: 'fixture-repeat-passive',
          label: 'fixture 強化攻撃パッシブ',
          mode: 'actionTimed',
          triggerActionKeys: ['enhancedAttack'],
          triggerPhase: 'start',
          durationFrames: 1,
          modifiers: { enhancedAddP: 1 }
        }]
      }
    }
  );
}

function simulate(config, seed, options = {}) {
  return simulator.simulate(config, {
    durationSeconds: 10,
    initialActionDelayFrames: 0,
    highSkillMode: 'disabled',
    seed,
    damageProfiles,
    recordTimeline: true,
    recordDamageSeries: true,
    enableFastForward: false,
    ...options
  });
}

function firstEnhancedChain(result) {
  const starts = result.timeline.filter(event => event.type === 'actionStart' && event.actionKey === 'enhancedAttack');
  const end = starts.findIndex((event, index) => index > 0 && event.repeatIndex === 1);
  return end >= 0 ? starts.slice(0, end) : starts;
}

function repeatRollsForChain(result, chain) {
  const nextRegularStart = result.timeline.find(event => (
    event.type === 'actionStart'
      && event.actionKey === 'enhancedAttack'
      && Number(event.repeatIndex) === 1
      && Number(event.frame) > Number(chain[0]?.frame ?? -1)
  ));
  const endFrame = nextRegularStart?.frame ?? Infinity;
  return result.timeline.filter(event => (
    event.type === 'enhancedRepeatProbability'
    && Number(event.frame) < Number(endFrame)
  ));
}

const config = buildConfig({ condition: 'この文字列は計算根拠ではない' });
const repeatPolicy = config.actions.enhancedAttack.repeatPolicy;
assert.deepEqual(repeatPolicy, {
  initialProbabilityP: 70,
  decrementPoints: 20,
  sourceEffectIds: ['Snorky_enhanced_e02', 'Snorky_enhanced_e03'],
  estimated: true,
  maxActions: 5
}, '数値effectから70/20のrepeatPolicyを構築できません');
assert.equal(config.actions.enhancedAttack.triggerEveryCount, 3, '強化攻撃の周期3回が保持されません');
const lowercaseConfig = buildConfig({ apostle: { ...createApostle(), id: 'snorky' } });
assert.deepEqual(lowercaseConfig.actions.enhancedAttack.repeatPolicy, repeatPolicy, '実生成物の小文字使徒IDでrepeatPolicyを解決できません');

const changedConfig = buildConfig({ initialProbabilityP: 62, decrementPoints: 17, condition: '別の説明' });
assert.equal(changedConfig.actions.enhancedAttack.repeatPolicy.initialProbabilityP, 62, '確率数値の変更がpolicyへ届きません');
assert.equal(changedConfig.actions.enhancedAttack.repeatPolicy.decrementPoints, 17, '減少数値の変更がpolicyへ届きません');
assert.equal(changedConfig.actions.enhancedAttack.repeatPolicy.maxActions, 5, '数値から最大回数を計算できません');

const missingRowConfig = buildConfig({ repeat: false });
assert.equal(missingRowConfig.actions.enhancedAttack.repeatPolicy, null, '設定なしでrepeatPolicyが有効化されています');
assert.ok(missingRowConfig.warnings.every(warning => !/連続発動/.test(warning)), '設定なしの他使徒経路へ警告が混入しています');

const duplicateApostle = createApostle();
const duplicateEnhanced = duplicateApostle.skills.find(skill => skill.skillId === 'Snorky_enhanced');
duplicateEnhanced.effects.push({ ...duplicateEnhanced.effects.find(effect => effect.effectId === 'Snorky_enhanced_e02') });
const duplicateConfig = buildConfig({ apostle: duplicateApostle });
assert.equal(duplicateConfig.actions.enhancedAttack.repeatPolicy, null, '重複確率行でrepeatPolicyが有効化されています');
assert.ok(duplicateConfig.warnings.some(warning => /重複/.test(warning)), '重複確率行の警告がありません');

const favoriteSkill = {
  skillId: 'Snorky_favorite_1',
  skillType: '普通攻撃_強化',
  effects: [{
    effectId: 'Snorky_favorite_1_e01',
    valueKind: '物理ダメージ',
    valueClass: '倍率',
    effectType: '攻撃',
    effectTarget: '敵/範囲',
    targetSkill: '普通攻撃_強化',
    fixedValue: 700
  }]
};
const favoriteOverride = simulator.createActionSkillOverride(favoriteSkill, 'enhancedAttack');
const favoriteConfig = buildConfig({ skillOverrides: { enhancedAttack: favoriteOverride } });
assert.deepEqual(favoriteConfig.actions.enhancedAttack.repeatPolicy, repeatPolicy, '愛用品置換後へ基礎repeatPolicyを一度だけ接続できません');

const failed = simulate(config, 1198);
const failedChain = firstEnhancedChain(failed);
assert.deepEqual(failedChain.map(event => event.repeatIndex), [1], '初回失敗後に強化攻撃が連続しています');
assert.deepEqual(repeatRollsForChain(failed, failedChain).map(event => ({ probability: event.probability, success: event.success, roll: event.roll != null })), [
  { probability: 70, success: false, roll: true }
], '初回70%失敗の抽選記録が不正です');

const midFailure = simulate(config, 3);
const midFailureChain = firstEnhancedChain(midFailure);
assert.deepEqual(midFailureChain.map(event => event.repeatIndex), [1, 2], '途中失敗の連続回数が不正です');
assert.deepEqual(repeatRollsForChain(midFailure, midFailureChain).map(event => [event.probability, event.success]), [[70, true], [50, false]], '70→50%の抽選順が不正です');

const maximum = simulate(config, 119);
const maximumChain = firstEnhancedChain(maximum);
assert.deepEqual(maximumChain.map(event => event.repeatIndex), [1, 2, 3, 4, 5], '最大5回の連続発動になっていません');
const repeatOnlyMaximum = simulate(buildConfig({ runtimeEffects: {} }), 119);
const repeatOnlyChain = firstEnhancedChain(repeatOnlyMaximum);
assert.deepEqual(repeatOnlyChain.map(event => event.repeatIndex), [1, 2, 3, 4, 5], '資源効果なしの最大連続回数が不正です');
assert.deepEqual(repeatOnlyChain.slice(1).map((event, index) => event.frame - repeatOnlyChain[index].frame), [10, 10, 10, 10], '連続攻撃へ通常待ち間隔が混入しています');
assert.deepEqual(repeatRollsForChain(maximum, maximumChain).map(event => [event.probability, event.success]), [[70, true], [50, true], [30, true], [10, true], [0, false]], '70→50→30→10%の境界または上限記録が不正です');
assert.equal(repeatRollsForChain(maximum, maximumChain).at(-1).roll, undefined, '最大回数到達時に不要な乱数を消費しています');
assert.equal(maximum.finalState.normalAttackSequence, maximum.counts.basicAttack + maximum.timeline.filter(event => event.type === 'actionStart' && event.actionKey === 'enhancedAttack' && event.repeatIndex === 1).length, '連続分でnormalAttackSequenceが進んでいます');
assert.equal(maximum.timeline.filter(event => event.type === 'spRecoveryEvent' && event.effectId === 'fixture-repeat-sp').length, maximum.counts.enhancedAttack, '連続actionごとのSP処理が通っていません');
assert.equal(maximum.runtimeEffects.damageBuffEffects.find(effect => effect.id === 'fixture-repeat-passive')?.triggerCount, maximum.counts.enhancedAttack, '連続actionごとのパッシブ通知が通っていません');
const firstLowStart = maximum.timeline.find(event => event.type === 'actionStart' && event.actionKey === 'lowSkill');
assert.ok(firstLowStart && firstLowStart.frame < maximumChain.at(-1).frame, 'SP充足時に低学年が連続終了まで待機しています');
assert.ok(maximum.timeline.some(event => event.type === 'enhancedRepeatProbability' && event.reason === '低学年を優先して保留'), '低学年優先のpending記録がありません');

const zeroConfig = buildConfig({ initialProbabilityP: 0, decrementPoints: 20 });
const zeroA = simulate(zeroConfig, 3);
const zeroB = simulate(zeroConfig, 1198);
assert.deepEqual(zeroA.counts, zeroB.counts, '0%設定がseedに依存しています');
assert.ok(zeroA.timeline.filter(event => event.type === 'enhancedRepeatProbability').every(event => event.roll == null), '0%設定で乱数を消費しています');

const noRepeat = simulate(missingRowConfig, 119);
assert.equal(noRepeat.timeline.some(event => event.type === 'enhancedRepeatProbability'), false, 'repeatPolicyなしで連続発動イベントが出ています');
assert.equal(noRepeat.timeline.some(event => Number(event.repeatIndex) > 1), false, 'repeatPolicyなしで連続actionが出ています');

const repeatedFavorite = simulate(favoriteConfig, 119, { damageProfiles: favoriteDamageProfiles });
assert.deepEqual(firstEnhancedChain(repeatedFavorite).map(event => event.repeatIndex), [1, 2, 3, 4, 5], '愛用品置換で連続回数が二重化または消失しています');
assert.ok(repeatedFavorite.damage.byAction.enhancedAttack > maximum.damage.byAction.enhancedAttack, '愛用品の有効強化攻撃倍率が置換後actionへ届いていません');

function actionEvents(result, actionKey, type = 'actionStart') {
  return result.timeline.filter(event => event.type === type && event.actionKey === actionKey);
}

function timelineSignature(result) {
  return result.timeline
    .filter(event => ['actionStart', 'actionEnd', 'movementStart', 'movementEnd', 'skillTransition', 'enhancedRepeatProbability'].includes(event.type))
    .map(event => ({
      type: event.type,
      frame: event.frame,
      actionKey: event.actionKey,
      repeatIndex: event.repeatIndex,
      probability: event.probability,
      success: event.success,
      nextProbability: event.nextProbability,
      reason: event.reason,
      fromActionKey: event.fromActionKey,
      toActionKey: event.toActionKey,
      movementId: event.movementId
    }));
}

const sameTickSpRuntime = {
  spRecoveryEffects: [{
    id: 'fixture-low-same-tick-sp',
    label: 'fixture 同tick SP',
    mode: 'action',
    triggerActionKeys: ['enhancedAttack'],
    triggerPhase: 'end',
    fixed: 1
  }]
};
const sameTickConfig = buildConfig({
  lowRequiredSp: 300,
  initialSp: 299,
  runtimeEffects: sameTickSpRuntime
});
const sameTick = simulate(sameTickConfig, 119);
const firstEnhancedEnd = sameTick.timeline.find(event => event.type === 'actionEnd' && event.actionKey === 'enhancedAttack');
const sameTickReady = sameTick.timeline.find(event => event.type === 'lowSkillReady');
const sameTickLowStart = actionEvents(sameTick, 'lowSkill')[0];
const sameTickRepeatStart = actionEvents(sameTick, 'enhancedAttack').find(event => event.repeatIndex === 2);
assert.ok(firstEnhancedEnd && sameTickReady && firstEnhancedEnd.frame === sameTickReady.frame, '強化攻撃終了と同tickのSP300到達を記録できません');
assert.ok(sameTickLowStart && sameTickRepeatStart && sameTickLowStart.frame < sameTickRepeatStart.frame, 'SP充足時に低学年が連続強化より先行していません');
assert.ok(sameTick.timeline.some(event => event.type === 'enhancedRepeatProbability' && event.reason === '低学年を優先して保留'), '同tick低学年優先のpendingが記録されていません');
assert.equal(sameTickRepeatStart.repeatProbabilityP, 50, '低学年後の連鎖確率がリセットされています');
assert.equal(sameTick.finalState.normalAttackSequence, sameTick.counts.basicAttack + actionEvents(sameTick, 'enhancedAttack').filter(event => event.repeatIndex === 1).length, '低学年割込みで周期カウントが不正に加算されています');
assert.equal(sameTick.timeline.filter(event => event.type === 'enhancedRepeatProbability').length > 1, true, '低学年後の強化終了時に再抽選できていません');

const midActionSpRuntime = {
  spRecoveryEffects: [{
    id: 'fixture-low-mid-action-sp',
    label: 'fixture 行動中SP',
    mode: 'actionPeriodic',
    triggerActionKeys: ['enhancedAttack'],
    intervalFrames: 5,
    durationFrames: 10,
    fixed: 1
  }]
};
const midAction = simulate(buildConfig({
  lowRequiredSp: 300,
  initialSp: 299,
  runtimeEffects: midActionSpRuntime
}), 119);
const midReady = midAction.timeline.find(event => event.type === 'lowSkillReady');
const midEnhancedEnd = midAction.timeline.find(event => event.type === 'actionEnd' && event.actionKey === 'enhancedAttack');
assert.ok(midReady && midEnhancedEnd && midReady.frame < midEnhancedEnd.frame, '行動中のSP300到達を低学年queueへ反映できません');
assert.ok(actionEvents(midAction, 'lowSkill')[0]?.frame < actionEvents(midAction, 'enhancedAttack').find(event => event.repeatIndex === 2)?.frame, '行動中SP到達後も低学年が連鎖より後になります');

const favoriteLow = simulate(buildConfig({
  lowRequiredSp: 300,
  initialSp: 299,
  runtimeEffects: sameTickSpRuntime,
  skillOverrides: { enhancedAttack: favoriteOverride }
}), 119, { damageProfiles: favoriteDamageProfiles });
assert.ok(actionEvents(favoriteLow, 'lowSkill')[0], '愛用置換時の低学年割込みがありません');
assert.equal(actionEvents(favoriteLow, 'enhancedAttack').find(event => event.repeatIndex === 2)?.repeatProbabilityP, 50, '愛用置換後に連鎖確率がリセットされています');
assert.ok(favoriteLow.timeline.filter(event => event.type === 'hit').every(event => event.effectId !== 'Snorky_enhanced_e01'), '愛用置換時に基礎350%のdamageが混入しています');

const longLowTiming = {
  ...timing,
  actions: { ...timing.actions, lowSkill: { motionFrames: 70 } }
};
const timeEnded = simulate(buildConfig({
  timing: longLowTiming,
  lowRequiredSp: 300,
  initialSp: 299,
  runtimeEffects: sameTickSpRuntime
}), 119, { durationSeconds: 1 });
assert.equal(actionEvents(timeEnded, 'enhancedAttack').filter(event => event.repeatIndex === 1).length, 1, '計測終了前に新しい強化chainが開始されました');
assert.equal(timeEnded.counts.enhancedAttack, 1, '低学年中の予約強化が実行回数へ加算されています');
assert.equal(timeEnded.damage.byAction.enhancedAttack, 350, '低学年中の予約強化damageが加算されています');
assert.equal(timeEnded.finalState.enhancedRepeatChain?.pending, true, '計測終了までpendingを保持できていません');

const movementTiming = {
  ...timing,
  movementTransitions: [
    { id: 'fixture-enhanced-to-low', fromActionKey: 'enhancedAttack', toActionKey: 'lowSkill', frames: 3, researchStatus: 'fixture' },
    { id: 'fixture-low-to-enhanced', fromActionKey: 'lowSkill', toActionKey: 'enhancedAttack', frames: 4, researchStatus: 'fixture' }
  ]
};
const moved = simulate(buildConfig({
  timing: movementTiming,
  lowRequiredSp: 300,
  initialSp: 299,
  runtimeEffects: sameTickSpRuntime
}), 119);
assert.ok(moved.timeline.some(event => event.type === 'movementStart' && event.movementId === 'fixture-enhanced-to-low'), '強化→低学年の移動遷移を通っていません');
assert.ok(moved.timeline.some(event => event.type === 'movementStart' && event.movementId === 'fixture-low-to-enhanced'), '低学年→強化の移動遷移を通っていません');
assert.ok(actionEvents(moved, 'enhancedAttack').some(event => event.repeatIndex === 2), '移動／遷移後にpending連鎖を再開できません');
const movedFast = simulate(buildConfig({
  timing: movementTiming,
  lowRequiredSp: 300,
  initialSp: 299,
  runtimeEffects: sameTickSpRuntime
}), 119, { enableFastForward: true });
const movedStep = simulate(buildConfig({
  timing: movementTiming,
  lowRequiredSp: 300,
  initialSp: 299,
  runtimeEffects: sameTickSpRuntime
}), 119, { enableFastForward: false });
assert.deepEqual(timelineSignature(movedFast), timelineSignature(movedStep), 'fast-forward有無で行動順／pending連鎖が変化しています');
assert.deepEqual(movedFast.counts, movedStep.counts, 'fast-forward有無で行動回数が変化しています');
assert.deepEqual(movedFast.damage.byAction, movedStep.damage.byAction, 'fast-forward有無でdamageが変化しています');

console.log(JSON.stringify({
  ok: true,
  policy: repeatPolicy,
  fixture: 'isolated-snorky',
  chains: {
    initialFailure: failedChain.map(event => event.repeatIndex),
    midFailure: midFailureChain.map(event => event.repeatIndex),
    maximum: maximumChain.map(event => event.repeatIndex),
    favorite: firstEnhancedChain(repeatedFavorite).map(event => event.repeatIndex),
    lowSkillInterruption: {
      sameTick: {
        enhanced: sameTickRepeatStart?.repeatIndex,
        lowSkill: sameTickLowStart?.frame,
        repeat: sameTickRepeatStart?.frame,
        ready: sameTickReady?.frame
      },
      midAction: midReady?.frame,
      favorite: actionEvents(favoriteLow, 'enhancedAttack').find(event => event.repeatIndex === 2)?.repeatIndex,
      timeEnded: timeEnded.counts.enhancedAttack,
      movement: moved.timeline.filter(event => event.type === 'movementStart').map(event => event.movementId),
      fastForwardEquivalent: true
    }
  },
  maximum: {
    enhancedActions: maximum.counts.enhancedAttack,
    normalAttackSequence: maximum.finalState.normalAttackSequence,
    spEvents: maximum.timeline.filter(event => event.type === 'spRecoveryEvent' && event.effectId === 'fixture-repeat-sp').length,
    passiveTriggers: maximum.runtimeEffects.damageBuffEffects.find(effect => effect.id === 'fixture-repeat-passive')?.triggerCount || 0
  }
}, null, 2));
