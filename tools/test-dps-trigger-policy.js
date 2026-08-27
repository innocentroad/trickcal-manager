'use strict';

const assert = require('node:assert/strict');
const policy = require('../dps-trigger-policy.js');

const kidianHpRecovery = {
  triggerType: '自身HP以下到達時',
  triggerValue: 50,
  condition: '自分HP50%以下時',
  valueKind: 'SP回復'
};
const kidianDescription = '低学年スキルの基本攻撃回数が増加する。自身のSPを回復する。';
assert.deepEqual(
  policy.getActionKeys(kidianHpRecovery, kidianDescription),
  [],
  '明示されたHP条件に説明文中の基本攻撃を混入させない'
);
assert.equal(policy.isUnsupported(kidianHpRecovery, kidianDescription), true,
  'HPタイムライン未実装中はHP条件を自動発動させない');
assert.equal(policy.getIntervalSeconds(kidianHpRecovery, '1秒ごとに回復'), 0,
  '別種の明示条件を説明文の周期条件で上書きしない');
assert.equal(policy.getTriggerCount(kidianHpRecovery, '3回ごとに回復'), 0,
  '別種の明示条件を説明文の回数条件で上書きしない');

const lowSkillTrigger = {
  triggerType: '低学年スキル使用時',
  targetSkill: '低学年スキル'
};
assert.deepEqual(
  policy.getActionKeys(lowSkillTrigger, '高学年スキルと基本攻撃も強化する'),
  ['lowSkill'],
  '明示された低学年条件だけを行動判定へ使う'
);

assert.equal(policy.getIntervalSeconds({ triggerType: 'n秒ごと', triggerValue: 4 }, '1秒ごと'), 4,
  '周期値は発動条件値を優先する');
assert.equal(policy.getTriggerCount({ triggerType: 'n回ごと', triggerValue: 3, targetSkill: '普通攻撃' }, '1回ごと'), 3,
  '回数値は発動条件値を優先する');
assert.equal(policy.isUnsupported({ triggerType: '状態異常付与時' }), false,
  '状態異常付与時は本人の状態付与フックで処理できる');
assert.deepEqual(
  policy.getActionKeys({ triggerType: 'n回ごと', triggerValue: 3, targetSkill: '普通攻撃' }),
  ['basicAttack', 'enhancedAttack'],
  'n回ごとの対象行動は対象スキル列から解決する'
);

assert.deepEqual(
  policy.getActionKeys({}, '普通攻撃命中時にSPを回復する'),
  ['basicAttack', 'enhancedAttack'],
  '発動条件種別が空の旧データだけは説明文フォールバックを維持する'
);
assert.equal(policy.isUnsupported({ triggerType: '将来追加される条件' }, '普通攻撃命中時'), true,
  '未知の明示条件は説明文から推測せず保留する');
assert.equal(policy.isUnsupported({ triggerType: '生成物命中時', triggerSourceId: 'Aya_low_butterfly' }), false,
  '対応済み生成物条件は利用できる');

const syllaTornado = {
  triggerType: '普通攻撃命中時一定確率',
  triggerValue: 75,
  triggerSourceId: '普通攻撃'
};
assert.equal(policy.isUnsupported(syllaTornado), false,
  '普通攻撃命中時一定確率をランタイム追加攻撃として扱う');
assert.equal(policy.getProbability(syllaTornado), 75,
  '普通攻撃の確率条件を0〜100へ正規化する');
assert.equal(policy.getProbability({ ...syllaTornado, triggerValue: -10 }), 0,
  '普通攻撃の確率下限を0へ丸める');
assert.equal(policy.getProbability({ ...syllaTornado, triggerValue: 150 }), 100,
  '普通攻撃の確率上限を100へ丸める');
assert.deepEqual(policy.getActionKeys(syllaTornado), ['basicAttack', 'enhancedAttack'],
  '普通攻撃の確率条件を基本・強化の両行動へ結び付ける');
const syllaTornadoChain = {
  triggerType: '竜巻ダメージ発生時',
  triggerSourceId: 'Sylla_aside_2_e02',
  conditionType: '追加対象存在',
  conditionValue: 1
};
assert.equal(policy.isEffectSourceTrigger(syllaTornadoChain), true,
  'effectIdを発生元にする竜巻連鎖を汎用判定する');
assert.equal(policy.isUnsupported(syllaTornadoChain), false,
  'effectId連鎖条件を未知条件として捨てない');
assert.equal(policy.isEffectSourceTrigger({
  triggerType: '将来追加される条件',
  triggerSourceId: 'Sylla_aside_2_e02'
}), false, '未知条件はeffectIdだけでは推測対応しない');

const legacyHighSkillBuff = {
  category: '高学年',
  durationSeconds: 10,
  valueKind: '普通攻撃ダメージ量増加'
};
assert.deepEqual(
  policy.getActionKeys(legacyHighSkillBuff, '一定時間、普通攻撃のダメージ量がアップする'),
  ['highSkill'],
  '旧データの持続効果は説明中の効果対象ではなく所属スキルを発動元にする'
);

console.log('DPS trigger policy tests passed');
