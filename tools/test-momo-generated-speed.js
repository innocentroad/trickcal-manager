'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const simulator = require('../dps-simulator.js');
const timing = require('../dps-timing-data.js');
const sandbox = {};
vm.runInNewContext(fs.readFileSync(require.resolve('../apostles.js'), 'utf8')
  + ';this.momo = APOSTLE_INDEX.momo;', sandbox);
const momo = sandbox.momo;
const real = simulator.buildCombatantConfig(momo, timing.apostles.momo, { skillLevels: { low: 15, high: 15 } });
for (const key of ['lowSkill', 'highSkill']) {
  const object = timing.apostles.momo.actions[key].generatedObjects[0];
  assert.equal(object.attackSpeedBase, 150);
  assert.equal(object.repeatIntervalFrames, 121, 'source observation is not overwritten');
  assert.equal(object.summonActions[0].motionName, 'Attack1_1');
  assert.equal(object.summonActions[0].motionFrames, 58);
  const hit = object.timingEvents.find(e => e.actionId && e.recordPurpose === '実行' && e.eventType === '攻撃');
  assert.equal(hit.frame, 20, 'attack occurrence is provisionally treated as the hit');
  assert.equal(hit.researchStatus, '暫定');
  assert.ok(simulator.getSummonUnitIssues(object).every(issue => !issue.includes('命中時刻')),
    'the remaining guard must not claim the supplied hit timing is missing');
  const events = real.actions[key].generatedEvents.filter(e => e.generatedObjectId === object.id);
  assert.ok(events.length);
  assert.ok(events.every(e => e.generatedAttackSpeedBase === 150));
  assert.ok(events.every(e => !e.generatedUsesOwnerAttackSpeedAtSpawn));
  assert.ok(events.filter(e => e.generatedRepeatSeriesKey).every(e => e.generatedRepeatIntervalFrames === 120));
  assert.ok(events.filter(e => e.type === 'damage').every(e => e.generatedIndependentStatsUnresolved));
  assert.ok(events.every(e => !e.generatedRepeatSeriesKey), 'observations cannot schedule repeated attacks');
  assert.equal(real.actions[key].summonUnits.length, 1);
  assert.deepEqual(simulator.getSummonUnitIssues(object), []);
  assert.ok(object.timingEvents.filter(e => e.recordPurpose === '実行' && e.eventType === '行動開始')
    .every(e => e.frame === 24 && e.researchStatus === '暫定'));
}
assert.throws(() => simulator.simulate(real), /能力・状態継承.*未接続/);

const actor = { id: 'fixture', skills: [{ skillId: 'fixture_basic', skillType: '普通攻撃_基本',
  effects: [{ effectId: 'damage', valueKind: '魔法ダメージ', valueClass: '倍率', effectType: '攻撃', fixedValue: 100 }] }] };
function makeConfig(reference = '生成物自身', base = 150, haste = 0) {
  return simulator.buildCombatantConfig(actor, { normalAttackIntervalFrames: 9999, actions: { basicAttack: {
    motionFrames: 1, generatedObjects: [{ id: 'fixture_clone', spawnFrame: 0, cancelPolicy: '継続',
      statReference: '分身自身（主人の選択的継承）', attackSpeedReference: reference, attackSpeedBase: base,
      attackSpeedScope: '反復周期', repeatIntervalFrames: 121,
      endConditions: [{ conditionType: '生成後経過時間', conditionFrames: 360 }],
      timingEvents: [{ frame: 10, timeOrigin: '生成時', eventType: '攻撃', effectKind: 'ダメージ',
        effectId: 'damage', repeatTarget: true }] }]
  } } }, { runtimeEffects: { attackSpeedEffects: haste ? [{ id: 'owner-haste', mode: 'initial', percent: haste }] : [] } });
}
const runtimeBase = { legacyExpectedDamage: 99.5, hitInput: { baseDamage: 99.5, coefficientP: 100,
  singleHitDefinition: true }, finalAtk: 100, baseAtk: 100, finalDef: 1, baseDef: 1, defRate: 1 };
const profiles = { basicAttack: { variants: { default: { totalExpectedDamage: 99.5,
  effects: { damage: { effectId: 'damage', expectedDamage: 99.5, damageResult: { runtimeBase } } } } } } };
function run(config, fastForward = true) {
  return simulator.simulate(config, { initialActionDelayFrames: 0, durationSeconds: 6,
    highSkillMode: 'disabled', damageProfiles: profiles, recordTimeline: true, enableFastForward: fastForward });
}
const baseline = run(makeConfig());
const frames = result => result.timeline.filter(e => e.type === 'hit' && e.generatedObjectId).map(e => e.frame);
assert.deepEqual(frames(baseline), [10, 130, 250]);
assert.deepEqual(frames(run(makeConfig('生成物自身', 150, 100))), frames(baseline),
  'owner haste never shortens the independently configured clone period');
assert.deepEqual(frames(run(makeConfig(), false)), frames(baseline));
assert.equal(baseline.damage.totalExpectedDamage, 298.5, 'do not report owner-based fallback as correctly rounded clone damage');
assert.ok(baseline.timeline.filter(e => e.type === 'hit').every(e => e.damageEvaluation.roundingReason.includes('選択的能力継承')));
assert.ok(baseline.warnings.some(w => w.includes('選択的能力継承')));
assert.ok(baseline.warnings.some(w => w.includes('120F')));
assert.equal(makeConfig('生成物自身', 300).actions.basicAttack.generatedEvents.find(e => e.generatedRepeatSeriesKey).generatedRepeatIntervalFrames, 60);
for (const base of [0, -1, NaN, Infinity, null, '150']) {
  assert.throws(() => makeConfig('生成物自身', base), RangeError);
}
assert.equal(makeConfig('本人・生成時', undefined).actions.basicAttack.generatedEvents.find(e => e.generatedRepeatSeriesKey).generatedRepeatIntervalFrames, 121,
  'other generated objects retain their legacy source-period policy');
console.log('Momo generated base speed / provisional period / explicit unresolved inheritance tests passed');
