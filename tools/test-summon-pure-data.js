'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const simulator = require('../dps-simulator.js');
const definition = {
  id: 'clone', executionMode: '召喚ユニット', attackSpeedBase: 150,
  summonActions: [{ id: 'attack', motionFrames: 58 }],
  timingEvents: [
    { actionId: 'attack', recordPurpose: '実行', eventType: '行動開始', instanceOrder: 1, frame: 0 },
    { actionId: 'attack', recordPurpose: '実行', eventType: '攻撃', timeOrigin: '召喚ユニット行動開始',
      frame: 20, effectKind: '魔法ダメージ', effectId: 'hit' },
    { recordPurpose: '実行', eventType: '自爆', timeOrigin: '終了時', frame: 0,
      effectKind: '魔法ダメージ', effectId: 'explode' }
  ],
  endConditions: [{ conditionType: '生成後経過時間', conditionFrames: 140 }]
};
const effect = (id, inheritance, startFrame = 0, endFrame = null, amount = 0.1) => ({
  id, sourceKind: 'status', nativeKind: 1, evidence: 'independent fixture', inheritance,
  startFrame, endFrame, lifetimePolicy: endFrame === null ? 'permanent' : 'remaining',
  hitModifiers: { damageRate: amount }
});
const hit = coefficientP => ({ baseDamage: 1000, coefficientP, effectDamage: 1,
  personalityRate: 1, damageRate: 1, endCorrection: 0, critMult: 1.5, critRate: 0, additionalCoefficient: 0 });
function input() {
  return { schemaVersion: 1, policyVersion: 1, unresolved: [], definitions: {
    clone: { assemblyMode: 'resolved-hit-v1', speed: { attackSpeedP: 0, selfSpeed: 1, otherSpeed: 1 },
      hitInputs: { hit: hit(30), explode: hit(45) }, contributions: [
        effect('copied', 'copyAtSpawn', 0, 100),
        effect('late-owner', 'copyAtSpawn', 30, null, 1),
        effect('excluded', 'excludeFromOwnerCopy', 0, null, 100),
        { ...effect('direct-world-rule', 'directToSummon', 40), nativeKind: 4 }
      ] }
  } };
}
function config(secondSpawn = false) {
  const spawn = (instanceId, frame) => ({ frame, type: 'generatedEffect', generatedEventType: '生成',
    generatedObjectId: 'clone', generatedInstanceOrder: 1, generatedInstanceKey: instanceId, summonDefinition: definition });
  const terminal = (type, effectId, instanceId, frame) => ({ frame, type, effectId,
    generatedEventType: type === 'damage' ? '自爆' : '状態付与', generatedObjectId: 'clone',
    generatedInstanceKey: instanceId, summonDefinition: definition,
    ...(type === 'damage' ? {} : { statusApplication: { status: 'fixture-status', applicationEffectId: effectId,
      stackGroupId: 'fixture-status', durationFrames: 120, stackable: false, maxStacks: 1,
      dealsPeriodicDamage: false, sourceSelf: false, reactionOnly: true } }) });
  const built = simulator.buildCombatantConfig({ id: 'fixture', skills: [{ skillId: 'fixture_basic',
    skillType: '普通攻撃_基本', effects: [] }] }, { normalAttackIntervalFrames: 9999,
    actions: { basicAttack: { motionFrames: 1 } } });
  built.actions.basicAttack.summonUnits = [definition];
  built.actions.basicAttack.generatedEvents = [spawn('first', 0), terminal('damage', 'explode', 'first', 140),
        terminal('generatedEffect', 'status', 'first', 140),
        ...(secondSpawn ? [spawn('second', 50), terminal('damage', 'explode', 'second', 190),
          terminal('generatedEffect', 'status', 'second', 190)] : [])];
  return built;
}
function run(data = input(), two = false) {
  return simulator.simulate(config(two), { summonCalculationInput: data, durationSeconds: 4,
    initialActionDelayFrames: 0, recordTimeline: true, recordDamageSeries: true,
    damageProfiles: { basicAttack: { totalExpectedDamage: 99999999 } } });
}
assert.deepEqual(simulator.getSummonCalculationIssues(input(), [definition]), []);
const data = input();
const before = JSON.stringify(data);
const result = run(data);
assert.equal(JSON.stringify(data), before, 'simulation must not mutate transported input');
const hits = result.timeline.filter(e => e.type === 'hit');
assert.deepEqual(hits.map(e => e.frame), [20, 140], 'lifetime endpoint excludes ordinary hit but emits explosion once');
assert.deepEqual(hits.map(e => e.expectedDamage), [330, 495], 'late owner effect is not synchronized; direct rule remains valid');
assert.equal(result.timeline.filter(e => e.type === 'summonEnd').length, 1);
assert.ok(result.timeline.some(e => e.type === 'effectStateChanged' && e.status === 'fixture-status'),
  'terminal status is applied before unit removal');
const two = run(input(), true).timeline.filter(e => e.type === 'hit');
assert.equal(two.find(e => e.frame === 70).expectedDamage, 660,
  'a later spawn independently captures the owner effect now active');
assert.equal(two.filter(e => e.generatedEventType === '自爆').length, 2);
for (const mutate of [
  x => { x.unresolved.push({ reason: 'unknown coefficient' }); },
  x => { delete x.definitions.clone.hitInputs.hit.baseDamage; },
  x => { x.definitions.clone.contributions[0].nativeKind = 4; },
  x => { x.definitions.clone.contributions[0].inheritance = 'unknown'; },
  x => { x.definitions.clone.contributions[0].lifetimePolicy = 'unknown'; },
  x => { x.definitions.clone.contributions[0].runtimeEffectId = 'unbound'; },
  x => { x.definitions.clone.contributions.push(x.definitions.clone.contributions[0]); },
  x => { x.definitions.clone.speed.selfSpeed = 0; },
  x => { x.callback = () => {}; }
]) {
  const invalid = input(); mutate(invalid);
  assert.ok(simulator.getSummonCalculationIssues(invalid, [definition]).length);
  assert.throws(() => run(invalid), RangeError);
}
assert.throws(() => simulator.simulate(config(), { summonCalculationInput: input(), resolveSummonUnit: () => {} }),
  /同時指定/);
const periodic = config();
periodic.actions.basicAttack.generatedEvents[2].statusApplication.dealsPeriodicDamage = true;
assert.throws(() => simulator.simulate(periodic, { summonCalculationInput: input() }), /継続ダメージ/);
// The real Worker script receives a JSON-cloned message in its own realm.
const messages = [];
let listener;
const worker = { self: { location: { href: 'https://fixture.invalid/dps-simulator-worker.js' },
  addEventListener: (_name, callback) => { listener = callback; }, postMessage: message => messages.push(message) }, URL };
Object.assign(worker, worker.self);
worker.self = worker;
vm.createContext(worker);
worker.importScripts = () => vm.runInContext(fs.readFileSync(require.resolve('../dps-simulator.js'), 'utf8'), worker);
vm.runInContext(fs.readFileSync(require.resolve('../dps-simulator-worker.js'), 'utf8'), worker);
const message = { requestId: 1, mode: 'single', config: config(), options: {
  summonCalculationInput: input(), durationSeconds: 4, initialActionDelayFrames: 0,
  recordTimeline: true, recordDamageSeries: true } };
worker.messageJson = JSON.stringify(message);
worker.deliver = listener;
vm.runInContext('deliver({data: JSON.parse(messageJson)})', worker);
assert.equal(messages.length, 1);
assert.equal(messages[0].error, undefined);
assert.equal(messages[0].result.damage.totalExpectedDamage, result.damage.totalExpectedDamage);
const aggregate = simulator.simulateMany(config(), { ...message.options, trials: 2, exactTrials: true });
assert.equal(aggregate.totalExpectedDamage, result.damage.totalExpectedDamage);
// Exercise the actual UI input builder and comparison projection, not replicas.
function extractFunction(file, name) {
  const source = fs.readFileSync(require.resolve(file), 'utf8');
  const start = source.indexOf(`  function ${name}(`);
  assert.ok(start >= 0);
  const end = source.indexOf('\n  function ', start + 1);
  return source.slice(start, end < 0 ? undefined : end);
}
const buildInput = new Function('normalizeArray', `${extractFunction('../formation-damage-calc.js',
  'createDpsSummonCalculationInput')}\nreturn createDpsSummonCalculationInput;`)(value => Array.isArray(value) ? value : []);
assert.equal(buildInput({ id: 'owner' }, { actions: {} }, {}), null);
const row = { ownerId: 'owner', sourceId: 'card', effectId: 'buff', bonuses: { attackSpeedP: 10 } };
const prepared = buildInput({ id: 'owner', stats: { magicAttack: 999999 } },
  { actions: { low: { generatedObjects: [definition] } } }, { basic: { rows: [row,
    { ...row, effectId: 'disabled', sourceDisabled: true },
    { ...row, effectId: 'defense', perspective: 'defense' }] }, power: { rows: [row] } });
assert.equal(prepared.ownerBaseStats, null, 'never substitute the owner displayed stats');
assert.equal(prepared.contributions.length, 1, 'deduplicate the same source across actions');
assert.equal(prepared.contributions[0].inheritance, 'unknown');
assert.ok(simulator.getSummonCalculationIssues(prepared, [definition]).length,
  'actual UI remains blocked until native assembly and source mapping are resolved');
const project = new Function('window', 'normalizeDpsExternalEvents',
  `${extractFunction('../formation-damage-dps-prototype.js', 'createDpsInputProjection')}\nreturn createDpsInputProjection;`)(
  { TRICKCAL_DPS_SIMULATOR: simulator }, value => value);
const changed = input(); changed.policyVersion = 2;
assert.notEqual(JSON.stringify(project({ summonCalculationInput: input() })),
  JSON.stringify(project({ summonCalculationInput: changed })), 'policy changes invalidate comparisons');
assert.notEqual(JSON.stringify(project({ summonCalculationInput: input() })),
  JSON.stringify(project({})), 'legacy comparison without summon input is a different input');
console.log('Summon pure-data transport, inheritance, lifetime, explosion/status, Worker parity and rejection tests passed');
