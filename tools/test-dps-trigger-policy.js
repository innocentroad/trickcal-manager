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
assert.equal(policy.isUnsupported({ ...kidianHpRecovery, externalActionRequired: true }), false,
  '既知のHP条件は外部イベント入力へ委ねられる');
assert.deepEqual(policy.getExternalEventClassification({ triggerType: '被ダメージ回数' }), {
  eventType: '被弾時',
  eventClass: 'damage-taken-count',
  label: '被弾回数',
  timingMode: 'event',
  repeatability: 'counted',
  inputMode: 'occurrence'
}, '被ダメージ回数をカウント型の被弾イベントへ分類する');
assert.equal(policy.normalizeExternalEventType('竜巻ダメージ発生時'), '竜巻ダメージ発生時',
  '固有の効果発生トリガーは発動元と照合できる名称を保持する');
assert.equal(policy.getExternalEventClassification({ triggerType: '攻撃対象未撃破時' })?.eventClass, 'target-condition',
  '攻撃対象未撃破を撃破イベントへ誤分類しない');
assert.equal(policy.getExternalEventClassification({ triggerType: '敵撃破時' })?.repeatability, 'once',
  '敵撃破を一回型として分類する');
[
  'シールド終了時',
  '状態発動時',
  '回復時',
  '生成物生成時',
  '攻撃対象変更時',
  '味方戦闘不能時'
].forEach(triggerType => {
  assert.equal(policy.isExternalOccurrenceOnly({ triggerType }), true,
    `${triggerType}を外部発生のみの条件として分類する`);
  assert.equal(policy.isUnsupported({ triggerType }), true,
    `${triggerType}を時刻推測で自動発動しない`);
  assert.equal(policy.isUnsupported({ triggerType, externalActionRequired: true }), false,
    `${triggerType}は明示された外部イベント入力へ委ねられる`);
});
assert.equal(policy.isUnsupported({ triggerType: '状態終了時' }), false,
  '状態終了時は共通状態遷移フックで扱える');
assert.equal(policy.isUnsupported({ triggerType: 'リソース変化時' }), false,
  'リソース変化時は実際の増減フックで扱える');
assert.equal(policy.isUnsupported({ triggerType: '将来追加される条件', externalActionRequired: true }), true,
  '未登録の外部条件は候補へ自動採用しない');
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
assert.deepEqual(
  policy.getActionKeys({ triggerType: '低学年スキル最終ヒット命中時' }),
  ['lowSkill'],
  '低学年最終ヒット条件を低学年行動へ結び付ける'
);
assert.equal(policy.isUnsupported({ triggerType: '低学年スキル最終ヒット命中時' }), false,
  '低学年最終ヒット条件を対応済みトリガーとして扱う');

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

assert.equal(policy.isHighSkillRuntimeEffect({ triggerActionKeys: ['highSkill'] }), true,
  '構造化された高学年行動キーを高学年関連効果として判定する');
assert.equal(policy.isHighSkillRuntimeEffect({
  triggerType: 'n秒ごと',
  targetActionKeys: ['highSkill'],
  targetSkill: '高学年スキル'
}), false, '効果対象の高学年だけでは発動元を高学年扱いしない');
assert.deepEqual(policy.getStructuredTriggerActionKeys({
  triggerType: 'n秒ごと',
  targetActionKeys: ['highSkill'],
  targetSkill: '高学年スキル'
}), [], '構造化された発動元と効果対象を分離する');
assert.deepEqual(policy.getRuntimeEffectPolicy({ triggerActionKeys: ['highSkill'] }, { supportsFixed: true }), {
  capability: 'exact',
  defaultMode: 'off',
  supportsFixed: true,
  triggerDomain: 'selfAction',
  reasonCode: 'highSkillOptIn',
  quality: 'generated',
  highSkill: true,
  highSkillOnly: true,
  mixedSkill: false,
  status: 'optIn'
}, '高学年関連効果は共通policyで個別初期OFFへ分類する');
assert.deepEqual(policy.getRuntimeEffectPolicy({
  ownerId: 'Aya',
  triggerType: '低学年スキル効果発生時',
  triggerActionKeys: ['lowSkill'],
  externalActionRequired: true,
  triggerSourceId: 'Aya_low_e01'
}), {
  capability: 'estimated',
  defaultMode: 'auto',
  supportsFixed: false,
  triggerDomain: 'formationAction',
  reasonCode: 'deterministicTrigger',
  quality: 'generated',
  highSkill: false,
  highSkillOnly: false,
  mixedSkill: false,
  status: 'automatic'
}, '編成行動に連動する効果は外部入力ではなく周期推定へ分類する');
assert.equal(policy.getRuntimeEffectPolicy({
  triggerActionKeys: ['lowSkill', 'highSkill'],
  externalActionRequired: true
}).defaultMode, 'auto', '低学年・高学年共通の旧binding全体を初期OFFにしない');
assert.deepEqual(policy.getRuntimeEffectPolicy({
  triggerType: 'シールド終了時',
  externalActionRequired: true
}), {
  capability: 'external',
  defaultMode: 'auto',
  supportsFixed: false,
  triggerDomain: 'external',
  reasonCode: 'externalOccurrence',
  quality: 'generated',
  highSkill: false,
  highSkillOnly: false,
  mixedSkill: false,
  status: 'externalWaiting'
}, '外部入力待ち効果を自動発火と分離して分類する');
assert.equal(policy.getRuntimeEffectPolicy({ triggerType: '将来追加される条件' }).status, 'unsupported',
  '未知トリガーを未対応として分類する');
assert.deepEqual(policy.getRuntimeEffectPolicyPresentation(
  policy.getRuntimeEffectPolicy({ triggerActionKeys: ['highSkill'] }),
  { mode: 'off', explicit: false }
), {
  mode: 'off',
  label: '初期OFF',
  statusCode: 'opt-in',
  className: 'is-opt-in',
  reasonLabel: '高学年関連',
  qualityLabel: '暫定',
  detailLabel: '高学年関連 / 暫定'
}, '高学年関連の初期OFFを利用者向け状態へ変換する');
assert.equal(policy.getRuntimeEffectPolicyPresentation(
  policy.getRuntimeEffectPolicy({ triggerType: 'シールド終了時', externalActionRequired: true }),
  { mode: 'auto' }
).label, '外部入力待ち', '外部発生型は自動ではなく外部入力待ちとして表示する');
assert.equal(policy.getRuntimeEffectPolicyPresentation(
  policy.getRuntimeEffectPolicy({ triggerType: '低学年スキル使用時', triggerActionKeys: ['lowSkill'], externalActionRequired: true }),
  { mode: 'auto' }
).label, '自動（推定）', '推定型は自動と区別して自動（推定）として表示する');
assert.equal(policy.getRuntimeEffectPolicyPresentation(
  policy.getRuntimeEffectPolicy({ triggerType: '将来追加される条件' }),
  { mode: 'off' }
).label, '未対応', '未対応条件はOFFと区別して表示する');
assert.equal(policy.normalizeExternalEventType('shieldBreak'), 'シールド破壊時',
  '外部イベントUIの短縮値を共通トリガー種別へ正規化する');
assert.deepEqual(policy.getRuntimeExternalEventMatchState({
  triggerType: 'シールド破壊時',
  externalActionRequired: true,
  ownerId: 'vivi'
}, [{ type: 'shieldBreak' }]), {
  required: true,
  matched: true,
  count: 1,
  expectedType: 'シールド破壊時',
  expectedLabel: 'シールド破壊'
}, '発動元ID省略の同種外部イベントをワイルドカードとして対応付ける');
assert.equal(policy.getRuntimeExternalEventMatchState({
  triggerType: 'シールド破壊時',
  externalActionRequired: true,
  ownerId: 'vivi'
}, [{ type: 'shieldEnded', sourceId: 'snorky' }]).matched, false,
  '種別または発動元が異なる外部イベントを対応済みにしない');

const formationLowSkillEffect = {
  ownerId: 'Aya',
  triggerType: '低学年スキル効果発生時',
  triggerActionKeys: ['lowSkill'],
  externalActionRequired: true,
  triggerSourceId: 'Aya_low_e01'
};
const formationLowSchedule = policy.getRuntimeEffectSchedulePolicy(formationLowSkillEffect);
assert.equal(formationLowSchedule.actionLinked, true,
  '編成低学年効果を外部条件ではなく行動連動bindingとして分類する');
assert.equal(formationLowSchedule.externalCondition, false,
  '編成行動連動効果を外部条件入力へ重複表示しない');
assert.equal(formationLowSchedule.supportsPeriodic, true,
  '編成行動連動効果を周期指定可能として扱う');
assert.match(formationLowSchedule.capabilityLabel, /周期指定対応/,
  '編成行動連動効果に周期指定対応を表示する');

const shieldBreakSchedule = policy.getRuntimeEffectSchedulePolicy({
  ownerId: 'Aya',
  triggerType: 'シールド破壊時',
  externalActionRequired: true
});
assert.equal(shieldBreakSchedule.actionLinked, false,
  'シールド破壊を行動連動bindingへ誤分類しない');
assert.equal(shieldBreakSchedule.externalCondition, true,
  'シールド破壊を外部条件bindingとして分類する');
assert.equal(shieldBreakSchedule.supportsExternalInput, true,
  'シールド破壊を外部入力対応として扱う');
assert.equal(shieldBreakSchedule.capabilityLabel, '外部入力対応',
  '外部条件の対応能力ラベルを固定する');

assert.equal(
  policy.getRuntimeEffectBindingKey({
    ownerId: 'Aya',
    triggerType: '低学年スキル効果発生時',
    triggerSourceId: 'Aya_low_e01',
    conditionType: '凍傷スタック'
  }),
  'Aya::低学年スキル効果発生時::Aya_low_e01::凍傷スタック',
  'binding keyはowner・trigger・source・conditionから安定生成する'
);
assert.deepEqual(policy.getDpsFormationCandidateSchedulePolicy({ timingMode: 'periodic' }), {
  mode: 'periodic',
  actionLinked: true,
  capability: 'periodic',
  capabilityLabel: '周期指定対応',
  inputLabel: '時系列効果・発動タイミング',
  eventClass: '',
  reason: '編成行動に連動する効果。初期値は行動間隔・SP・CTからの推定値。'
}, '周期候補を時系列効果設定へ分類する');
assert.equal(policy.getDpsFormationCandidateSchedulePolicy({ timingMode: 'event' }).mode, 'external',
  '非周期候補を外部条件イベントへ分類する');
const periodicCandidate = {
  id: 'formation:ally-low',
  type: '低学年スキル使用時',
  label: '味方A / 低学年',
  ownerId: 'AllyA',
  timingMode: 'periodic',
  periodicActionLabel: '低学年',
  startSeconds: 8,
  intervalSeconds: 12,
  repeatCount: 0,
  bindingKey: 'AllyA::低学年スキル使用時'
};
assert.equal(policy.isDpsFormationCandidateAutoEnabled(periodicCandidate, {
  formationTimelineMode: 'supportEstimate', formationHighSkillMode: 'disabled'
}), true, '共通policyは周期候補を自動推定対象として判定する');
assert.equal(policy.createDpsFormationEstimatedEvents([periodicCandidate], {
  formationTimelineMode: 'supportEstimate', formationHighSkillMode: 'disabled'
})[0].intervalFrames, 720, '共通policyは周期候補を秒からフレームへ変換する');
assert.equal(policy.createDpsFormationEstimatedEvents([periodicCandidate], {
  formationTimelineMode: 'supportEstimate', formationHighSkillMode: 'disabled'
}, [{ candidateId: periodicCandidate.id, bindingKey: periodicCandidate.bindingKey }]).length, 0,
  '共通policyは手動周期bindingがある候補を自動推定しない');
assert.equal(policy.createDpsFormationEstimatedEvents([{
  ...periodicCandidate,
  id: 'formation:ally-high',
  type: '高学年スキル使用時',
  periodicActionLabel: '高学年'
}], { formationTimelineMode: 'supportEstimate', formationHighSkillMode: 'disabled' }).length, 0,
  '共通policyは高学年初期OFFを自動推定へ流さない');
assert.equal(policy.isDpsFormationCandidateAutoEnabled({
  ...periodicCandidate,
  id: 'formation:ally-high-binding',
  type: '高学年スキル使用時',
  periodicActionLabel: '高学年',
  bindingKey: 'AllyA::高学年スキル使用時'
}, {
  formationTimelineMode: 'off',
  formationHighSkillMode: 'disabled',
  bindingModes: { 'AllyA::高学年スキル使用時::highSkill': 'auto' }
}), true, 'binding単位で高学年を明示AUTOにした場合は全体設定に関係なく推定する');
assert.equal(policy.isDpsFormationCandidateAutoEnabled({
  ...periodicCandidate,
  bindingKey: 'AllyA::低学年スキル使用時'
}, {
  formationTimelineMode: 'supportEstimate',
  bindingModes: { 'AllyA::低学年スキル使用時::lowSkill': 'off' }
}), false, 'binding単位の明示OFFは低学年の推定も止める');

console.log('DPS trigger policy tests passed');
