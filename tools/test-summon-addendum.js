'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const sim = require('../dps-simulator.js');
const keys = ['physicalAtk', 'magicAtk', 'physicalDef', 'magicDef', 'crit', 'critDmg', 'critRes', 'critDmgRes'];
const vector = value => Object.fromEntries(keys.map(key => [key, value]));
function assembly() {
  return { inputStage: 'growth-composed-base', ownerBaseStats: vector(100), multipliers: vector(1),
    attackSpeedBase: 150, attackSpeedLowerFactor: Math.fround(.2), attackSpeedUpperFactor: 10, hpFixed: 3 };
}
let a = assembly(); a.ownerBaseStats.magicAtk = 550;
assert.equal(sim.assembleSummonAbilities(a, [{ fixed: { magicAtk: 10 }, rateP: { magicAtk: 25 } },
  { fixed: { magicAtk: 20 }, rateP: { magicAtk: 15 } }]).magicAtk, 812);
a.ownerBaseStats.magicAtk = 100.25;
assert.equal(sim.assembleSummonAbilities(a, [{ rateP: { magicAtk: 50 } }]).magicAtk, 150.375);
a.ownerBaseStats.magicAtk = 1.0625;
assert.equal(sim.assembleSummonAbilities(a).magicAtk, 1.062, 'Round3 ties to even, not integer or away rounding');
assert.equal(sim.assembleSummonAbilities(a, [{ attackSpeedP: 1200 }]).attackSpeed, 1500);
assert.equal(sim.assembleSummonAbilities(a).hp, 3);
assert.throws(() => sim.assembleSummonAbilities({ ...a, inputStage: 'battle-final' }), /基礎/);
assert.throws(() => sim.assembleSummonAbilities(a, [{ fixed: { unknown: 10 } }]), /未対応/);
const definition = { id: 'clone', executionMode: '召喚ユニット', spawnFrame: 0, spawnCount: 3,
  summonActions: [{ id: 'attack', motionFrames: 58 }], attackSpeedBase: 150,
  endConditions: [{ conditionType: '生成後経過時間', conditionFrames: 720 }],
  timingEvents: [
    ...[1, 2, 3].map(instanceOrder => ({ recordPurpose: '実行', actionId: 'attack', instanceOrder,
      eventType: '行動開始', timeOrigin: '生成時', frame: 0 })),
    { recordPurpose: '実行', actionId: 'attack', eventType: '攻撃', timeOrigin: '召喚ユニット行動開始',
      frame: 20, effectKind: '魔法ダメージ', effectId: 'hit' },
    { recordPurpose: '実行', eventType: '自爆', timeOrigin: '終了時', frame: 0,
      effectKind: '魔法ダメージ', effectId: 'explode' }
  ] };
const hit = coefficientP => ({ coefficientP, effectDamage: 1, personalityRate: 1,
  damageRate: 1, endCorrection: 0, additionalCoefficient: 0 });
function data() {
  const ability = assembly(); ability.ownerBaseStats.magicAtk = 1000;
  return { schemaVersion: 1, policyVersion: 2, unresolved: [], ownerAliveIntervals: [{ startFrame: 0, endFrame: null }],
    sharedValues: {}, definitions: { clone: { assemblyMode: 'momo-abilities-v2', abilityAssembly: ability,
      enemyTimeline: [{ startFrame: 0, stats: { magicDef: 2000, critRes: 100, critDmgRes: 100 } },
        { startFrame: 100, stats: { magicDef: 1000, critRes: 100, critDmgRes: 100 } }],
      speed: { attackSpeedP: 0, selfSpeed: 1, otherSpeed: 1 }, hitInputs: { hit: hit(30), explode: hit(45) },
      contributions: [], executionRules: { initialDelayFrames: 24, generationIntervalSeconds: .2,
        generationClock: 'unityScaledSeconds', gamePlaySpeed: 1, deathOwnerSpRequest: 10,
        ownerSpRecoveryMultiplier: 1.5, maxInstances: 10, overflowPolicy: 'skip' } } } };
}
function config(instanceCount = 3) {
  const built = sim.buildCombatantConfig({ id: 'fixture', skills: [{ skillId: 'fixture_basic',
    skillType: '普通攻撃_基本', effects: [] }] }, { normalAttackIntervalFrames: 9999,
    actions: { basicAttack: { motionFrames: 1 } } });
  built.maxSp = 100; built.spRegen = 0; built.initialSp = 0;
  const activeDefinition = { ...definition, spawnCount: instanceCount, timingEvents: [
    ...Array.from({ length: instanceCount }, (_, i) => ({ recordPurpose: '実行', actionId: 'attack',
      instanceOrder: i + 1, eventType: '行動開始', timeOrigin: '生成時', frame: 0 })),
    ...definition.timingEvents.filter(event => event.eventType !== '行動開始')
  ] };
  built.actions.basicAttack.summonUnits = [activeDefinition];
  built.actions.basicAttack.generatedEvents = Array.from({ length: instanceCount }, (_, i) => i + 1).flatMap(order => {
    const common = { summonDefinition: activeDefinition, generatedObjectId: 'clone', generatedInstanceOrder: order,
      generatedInstanceKey: `clone:${order}` };
    const frame = (order - 1) * 50; // deliberately differs from native-derived Unity interval
    return [{ ...common, frame, type: 'generatedEffect', generatedEventType: '生成' },
      { ...common, frame: frame + 720, type: 'damage', effectId: 'explode', generatedEventType: '自爆' },
      { ...common, frame: frame + 720, type: 'generatedEffect', generatedEventType: '状態付与',
        statusApplication: { status: '感電', durationFrames: 120, stackable: false, maxStacks: 1,
          stackGroupId: '感電', dealsPeriodicDamage: false } }];
  });
  return built;
}
function run(input = data(), seconds = 12.5, instanceCount = 3, initialFrames = null) {
  const built = config(instanceCount);
  if (initialFrames) built.actions.basicAttack.summonUnits[0].timingEvents
    .filter(event => event.eventType === '行動開始')
    .forEach((event, index) => { event.frame = initialFrames[index]; });
  return sim.simulate(built, { summonCalculationInput: input, durationSeconds: seconds,
    initialActionDelayFrames: 0, recordTimeline: true, maxTimelineEvents: 10000 });
}
const before = data(); const unchanged = JSON.stringify(before);
const result = run(before);
assert.equal(JSON.stringify(before), unchanged);
assert.deepEqual(result.timeline.filter(x => x.type === 'summonSpawn').map(x => x.frame), [0, 12, 24]);
assert.deepEqual(result.timeline.filter(x => x.type === 'summonActionStart').slice(0, 3).map(x => x.frame), [24, 36, 48]);
const sheetDelayInput = data();
delete sheetDelayInput.definitions.clone.executionRules.initialDelayFrames;
const sheetDelayResult = run(sheetDelayInput, 2, 3, [24, 30, 36]);
assert.deepEqual(sheetDelayResult.timeline.filter(x => x.type === 'summonActionStart').slice(0, 3)
  .map(x => x.frame), [24, 42, 60], 'individual starts use the generated sheet values');
assert.deepEqual(sheetDelayResult.timeline.filter(x => x.type === 'hit').slice(0, 3)
  .map(x => x.frame), [44, 62, 80], 'hit remains 20 frames after the sheet-defined start');
assert.deepEqual(run(data(), 1, 3, [30, 36, 42]).timeline.filter(x => x.type === 'summonActionStart')
  .slice(0, 3).map(x => x.frame), [24, 36, 48], 'explicit legacy override remains compatible');
const hits = result.timeline.filter(x => x.type === 'hit');
assert.deepEqual(hits.filter(x => x.generatedInstanceOrder === 1 && x.generatedEventType !== '自爆')
  .map(x => x.frame), [44, 164, 284, 404, 524, 644]);
assert.equal(hits[0].expectedDamage, 220.5, 'independent 180 normal / 315 crit / 30% example');
assert.ok(Math.abs(hits.find(x => x.frame === 164).expectedDamage - 357.7) < 1e-10, 'enemy defense is read at hit time');
assert.equal(result.timeline.filter(x => x.type === 'spRecoveryEvent' && /death-sp/.test(x.effectId)).length, 3);
assert.deepEqual(result.timeline.filter(x => x.type === 'spRecoveryEvent' && /death-sp/.test(x.effectId))
  .map(x => x.requestedAmount), [15, 15, 15]);
assert.equal(hits.filter(x => x.generatedEventType === '自爆').length, 3);
assert.ok(!result.timeline.some(x => x.type === 'statusTick'), 'shock creates no DoT');
const firstExplosion = result.timeline.findIndex(x => x.type === 'hit' && x.frame === 720);
const firstShock = result.timeline.findIndex(x => x.type === 'statusApplied' && x.status === '感電');
assert.ok(firstExplosion >= 0 && firstShock > firstExplosion, 'new shock is applied after explosion damage');
const fastClock = data(); fastClock.definitions.clone.executionRules.gamePlaySpeed = 2;
assert.deepEqual(run(fastClock).timeline.filter(x => x.type === 'summonSpawn').map(x => x.frame), [0, 24, 48]);
// Recording suggests four lifetime expiries, not three-hit deaths. The 1.3
// clock is a comparison hypothesis, not a measured current-game constant.
const recordingClock = data();
recordingClock.definitions.clone.executionRules.gamePlaySpeed = 1.3;
recordingClock.definitions.clone.executionRules.ownerSpRecoveryMultiplier = 1;
const fourClones = run(recordingClock, 13, 4);
const fourSpawns = fourClones.timeline.filter(x => x.type === 'summonSpawn');
const fourExplosions = fourClones.timeline.filter(x => x.type === 'hit' && x.generatedEventType === '自爆');
assert.equal(fourSpawns.length, 4);
assert.equal(fourExplosions.length, 4);
for (const spawn of fourSpawns) {
  const explosion = fourExplosions.find(x => x.generatedInstanceOrder === spawn.generatedInstanceOrder);
  assert.ok(explosion, 'each individual expires once');
  assert.equal(explosion.frame - spawn.frame, 720, 'Unity spawn spacing must not shorten individual game-time lifetime');
}
const fourRecoveries = fourClones.timeline.filter(x => x.type === 'spRecoveryEvent' && /death-sp/.test(x.effectId));
assert.deepEqual(fourRecoveries.map(x => x.requestedAmount), [10, 10, 10, 10]);
assert.deepEqual(fourRecoveries.map(x => x.frame), fourExplosions.map(x => x.frame),
  'death SP occurs on each individual expiry, without waiting for the whole group');
const capped = data(); capped.definitions.clone.executionRules.maxInstances = 1;
assert.equal(run(capped).timeline.filter(x => x.type === 'summonSpawnSkipped').length, 2);
assert.equal(run(capped).timeline.filter(x => x.type === 'hit' && x.generatedEventType === '自爆').length, 1);
const copied = data(); copied.definitions.clone.contributions = [{ id: 'origin', sourceKind: 'status', nativeKind: 1,
  evidence: 'independent fixture', inheritance: 'copyAtSpawn', valueStage: 'origin', lifetimePolicy: 'detachedOrigin',
  startFrame: 0, endFrame: 30, abilityModifiers: { rateP: { magicAtk: 40 } } }];
assert.ok(run(copied, 4).timeline.find(x => x.type === 'hit' && x.frame === 164).expectedDamage > 357.7,
  'copied origin is not expired by the owner timer');
copied.definitions.clone.contributions[0].valueStage = 'currentStackTuple';
assert.throws(() => run(copied), /原値/);
const shared = data(); shared.sharedValues.spell = [{ startFrame: 0, value: .1 }, { startFrame: 100, value: .2 }];
shared.ownerAliveIntervals = [{ startFrame: 0, endFrame: 200 }];
shared.definitions.clone.contributions = [{ id: 'spell', sourceKind: 'spell', evidence: 'explicit resolved mapping',
  inheritance: 'copyAtSpawn', lifetimePolicy: 'permanent', startFrame: 0, endFrame: null,
  requiresOwnerAlive: true, sharedHitModifiers: [{ referenceId: 'spell', field: 'damageRate', multiplier: 2 }] }];
const spellHits = run(shared, 6).timeline.filter(x => x.type === 'hit' && x.generatedInstanceOrder === 1);
assert.ok(spellHits.find(x => x.frame === 164).expectedDamage > 357.7);
assert.ok(Math.abs(spellHits.find(x => x.frame === 284).expectedDamage - 357.7) < 1e-10, 'spell gate follows owner life, not all copied statuses');
// Child hits query their own type: ordinary attack=Normal, explosion=AutoTrigger/Skill.
const scoped = data();
scoped.definitions.clone.hitContexts = {
  hit: { actionKind: 'normalAttack', attackType: 'magic' },
  explode: { actionKind: 'autoTrigger', attackType: 'magic' }
};
scoped.definitions.clone.contributions = [{ id: 'skill-only', sourceKind: 'artifact',
  evidence: 'resolved independent hit condition', inheritance: 'copyAtSpawn',
  lifetimePolicy: 'permanent', startFrame: 0, endFrame: null,
  queryCondition: { actionKinds: ['skill'], attackTypes: ['magic'] }, hitModifiers: { damageRate: .5 } }];
const scopedHits = run(scoped).timeline.filter(x => x.type === 'hit');
scopedHits.forEach((row, index) => {
  if (row.generatedEventType === '自爆') assert.ok(row.expectedDamage > hits[index].expectedDamage);
  else assert.equal(row.expectedDamage, hits[index].expectedDamage, 'Skill bonus cannot leak into normal summon hits');
});
scoped.definitions.clone.contributions[0].queryCondition.actionKinds = ['normalAttack'];
run(scoped).timeline.filter(x => x.type === 'hit').forEach((row, index) => {
  if (row.generatedEventType === '自爆') assert.equal(row.expectedDamage, hits[index].expectedDamage);
  else assert.ok(row.expectedDamage > hits[index].expectedDamage);
});
scoped.definitions.clone.contributions[0].queryCondition.attackTypes = ['physical'];
assert.deepEqual(run(scoped).timeline.filter(x => x.type === 'hit').map(x => x.expectedDamage), hits.map(x => x.expectedDamage));
for (const mutate of [
  x => { delete x.definitions.clone.hitContexts.explode; },
  x => { x.definitions.clone.contributions[0].queryCondition.actionKinds = ['lowSkill']; },
  x => { x.definitions.clone.contributions[0].queryCondition.enemyStatus = '感電'; },
  x => { x.definitions.clone.contributions[0].abilityModifiers = { rateP: { magicAtk: 10 } }; }
]) {
  const invalid = JSON.parse(JSON.stringify(scoped)); mutate(invalid);
  assert.throws(() => run(invalid), RangeError, 'unknown conditions must not become unconditional bonuses');
}
// Run the actual Worker entrypoint with the new contract, not a worker replica.
const messages = []; const worker = { URL, location: { href: 'https://fixture.invalid/dps-simulator-worker.js' },
  addEventListener: (_type, fn) => { worker.deliver = fn; }, postMessage: value => messages.push(value) };
worker.self = worker; vm.createContext(worker);
worker.importScripts = () => vm.runInContext(fs.readFileSync(require.resolve('../dps-simulator.js'), 'utf8'), worker);
vm.runInContext(fs.readFileSync(require.resolve('../dps-simulator-worker.js'), 'utf8'), worker);
worker.request = JSON.stringify({ requestId: 1, mode: 'single', config: config(), options: {
  summonCalculationInput: data(), durationSeconds: 12.5, initialActionDelayFrames: 0 } });
vm.runInContext('deliver({data: JSON.parse(request)})', worker);
assert.equal(messages[0].error, undefined);
assert.equal(messages[0].result.damage.totalExpectedDamage, result.damage.totalExpectedDamage);
scoped.definitions.clone.contributions[0].queryCondition = { actionKinds: ['skill'], attackTypes: ['magic'] };
worker.request = JSON.stringify({ requestId: 2, mode: 'single', config: config(), options: {
  summonCalculationInput: scoped, durationSeconds: 12.5, initialActionDelayFrames: 0 } });
vm.runInContext('deliver({data: JSON.parse(request)})', worker);
assert.equal(messages[1].error, undefined);
assert.equal(messages[1].result.damage.totalExpectedDamage, run(scoped).damage.totalExpectedDamage,
  'Worker must preserve child hit conditions instead of applying them to every hit');
const sum = sim.simulateMany(config(), { summonCalculationInput: data(), durationSeconds: 12.5,
  initialActionDelayFrames: 0, trials: 2, exactTrials: true });
assert.equal(sum.totalExpectedDamage, result.damage.totalExpectedDamage);
for (const mutate of [
  x => { x.definitions.clone.abilityAssembly.inputStage = 'battle-final'; },
  x => { delete x.definitions.clone.abilityAssembly.ownerBaseStats.magicAtk; },
  x => { x.definitions.clone.enemyTimeline[0].startFrame = 1; },
  x => { x.definitions.clone.executionRules.generationClock = 'gameSeconds'; },
  x => { x.definitions.clone.executionRules.initialDelayFrames = -1; },
  x => { x.definitions.clone.executionRules.initialDelayFrames = null; },
  x => { delete x.ownerAliveIntervals; },
  x => { x.definitions.clone.speed.attackSpeedP = 50; }
]) {
  const invalid = data(); mutate(invalid); assert.throws(() => run(invalid), RangeError);
}
// Real UI extraction keeps fractions and never reverse-engineers display integers.
const uiSource = fs.readFileSync(require.resolve('../formation-damage-calc.js'), 'utf8');
const start = uiSource.indexOf('  function getDpsSummonGrowthBase(');
const end = uiSource.indexOf('\n  function ', start + 1);
const totals = { patk: 100.25, matk: 550.125, pdef: 10, mdef: 11,
  crit: 12, critDmg: 13, critRes: 14, critDmgRes: 15 };
const growthContext = { window: {} };
vm.runInNewContext(fs.readFileSync(require.resolve('../stat-engine.js'), 'utf8'), growthContext);
const growthEngine = growthContext.window.TRICKCAL_SHARED_STAT_ENGINE;
const growthData = { sheets: {} };
const growthBasic = { id: 'Momo', レア度: 3 };
const growthState = { level: 1, star: 1, grade: 1, rank: 1, bond: 1, asideRank: 0, follow: false };
const snapshotKeys = { hp: 'hp', patk: 'physicalAtk', matk: 'magicAtk', pdef: 'physicalDef', mdef: 'magicDef',
  crit: 'crit', critDmg: 'critDmg', critRes: 'critRes', critDmgRes: 'critDmgRes', spRegen: 'spRegen' };
const emptyVector = () => Object.fromEntries(Object.keys(snapshotKeys).map(key => [key, 0]));
const growthSnapshot = { calculationVersion: 4,
  stats: Object.fromEntries(Object.values(snapshotKeys).map(key => [key, 0])),
  internalTotals: emptyVector(), globalPercentRates: Object.fromEntries(Object.values(snapshotKeys).map(key => [key, 0])),
  breakdown: Object.fromEntries(['base', 'rankUp', 'equipment', 'rankGlobal', 'research', 'boardBasic',
    'boardAdvanced', 'bond', 'asideManifest', 'asideLevel', 'globalPercent'].map(source => [source, emptyVector()])) };
['crit', 'critDmg', 'critRes', 'critDmgRes'].forEach(key => { growthSnapshot.breakdown.bond[key] = 31; });
Object.entries(totals).forEach(([key, value]) => {
  // Independent totals: no base/rank/equipment/aside; each crit bond value is 31.
  growthSnapshot.breakdown.boardBasic[key] = value - (key.startsWith('crit') ? 31 : 0);
  growthSnapshot.internalTotals[key] = value;
});
growthSnapshot.stats.magicAtk = 99999;
const growthBefore = JSON.stringify(growthSnapshot);
const growthAudit = growthEngine.auditSummonGrowthSnapshot(growthData, growthBasic, growthState, growthSnapshot);
assert.deepEqual(JSON.parse(JSON.stringify(growthAudit.stats)), {
  physicalAtk: 100.25, magicAtk: 550.125, physicalDef: 10, magicDef: 11,
  crit: 12, critDmg: 13, critRes: 14, critDmgRes: 15
});
assert.equal(growthAudit.nativeEquivalent, false);
assert.equal(growthAudit.nativeBaseCandidate.stats.magicAtk, 550.125);
assert.equal(growthAudit.nativeBaseCandidate.completeness, 'known-site-components-only');
assert.ok(growthAudit.nativeBaseCandidate.missingSources.includes('gather'));
assert.equal(JSON.stringify(growthSnapshot), growthBefore, 'audit must not write saved snapshots');
const commonGrowth = JSON.parse(growthBefore);
commonGrowth.breakdown.research.matk = 4.75;
commonGrowth.breakdown.rankGlobal.matk = 2.25;
commonGrowth.breakdown.boardAdvanced.matk = 3;
commonGrowth.globalPercentRates.magicAtk = 12.5;
commonGrowth.internalTotals.matk = 630.140625; // (550.125 + 4.75 + 2.25 + 3) * 1.125
commonGrowth.breakdown.globalPercent.matk = 70.015625;
const commonCandidate = growthEngine.auditSummonGrowthSnapshot(growthData, growthBasic, growthState, commonGrowth);
assert.equal(commonCandidate.nativeBaseCandidate.stats.magicAtk, 630.140625,
  'research/common flat and rate are each applied once, retaining fractional aggregates');
assert.equal(commonCandidate.nativeBaseCandidate.commonFlatEntryProvenance, 'unavailable',
  'an aggregate is not proof of per-entry integerization');
const stale = JSON.parse(growthBefore); stale.internalTotals.matk += 1;
assert.equal(growthEngine.auditSummonGrowthSnapshot(growthData, growthBasic, growthState, stale), null);
const mismatchedState = JSON.parse(growthBefore); delete mismatchedState.overrideState;
assert.equal(growthEngine.auditSummonGrowthSnapshot(growthData, growthBasic, { ...growthState, bond: 2 }, mismatchedState), null);
const incomplete = JSON.parse(growthBefore); delete incomplete.breakdown.research.matk;
assert.equal(growthEngine.auditSummonGrowthSnapshot(growthData, growthBasic, growthState, incomplete), null);
const ui = { DPS_TIMING_DATA: { apostles: { momo: { actions: { lowSkill: { generatedObjects: [definition] } } } } },
  TRICKCAL_SHARED_STAT_ENGINE: growthEngine, TRICKCAL_STAT_DATA: growthData, view: { statMode: 'planned' },
  getApostle: () => growthBasic, getEffectiveGradeOverride: () => 'saved', getExtraCrayonRates: () => ({ atkP: 5 }),
  getGradeAdjustedSnapshot: (_state, _basic, _grade, mode) => {
    assert.equal(mode, 'planned'); return growthSnapshot;
  } };
vm.createContext(ui); vm.runInContext(`${uiSource.slice(start, end)}\nglobalThis.readBase = getDpsSummonGrowthBase`, ui);
const owner = { id: 'Momo', stats: { magicAtk: 999999 } };
const base = ui.readBase(owner, { target: owner, state: { apostles: { Momo: growthState } } });
assert.equal(base.stats.magicAtk, 550.125);
assert.equal(base.siteAdjustments.atkP, 5, 'unclassified corrections remain separate from owner H');
assert.equal(base.inputStage, 'site-growth-snapshot', 'do not claim native input-stage equivalence without checking');

const builderStart = uiSource.indexOf('  function createDpsSummonCalculationInput(');
const builderEnd = uiSource.indexOf('\n  function ', builderStart + 1);
ui.normalizeArray = value => Array.isArray(value) ? value : [];
vm.runInContext(`${uiSource.slice(builderStart, builderEnd)}\nglobalThis.buildSummonInput = createDpsSummonCalculationInput`, ui);
const boundTiming = { actions: { lowSkill: { generatedObjects: [{ ...definition, id: 'Momo_low_clone' }] },
  highSkill: { generatedObjects: [{ ...definition, id: 'Momo_high_clone' }] } } };
const bound = ui.buildSummonInput(owner, boundTiming, {}, base);
for (const id of ['Momo_low_clone', 'Momo_high_clone']) {
  const prepared = bound.definitions[id];
  assert.equal(prepared.abilityAssembly.ownerBaseStats.magicAtk, 550.125, 'not owner.stats.magicAtk');
  assert.equal(prepared.abilityAssembly.hpFixed, 3);
  assert.equal(prepared.abilityAssembly.attackSpeedBase, 150);
  assert.equal(prepared.hitContexts.hit.actionKind, 'normalAttack');
  assert.equal(prepared.hitContexts.explode.actionKind, 'autoTrigger');
  assert.throws(() => sim.assembleSummonAbilities(prepared.abilityAssembly), /基礎/,
    'candidate input remains rejected even when unresolved warnings are stripped');
}
assert.equal(Object.keys(ui.buildSummonInput(owner, { actions: { lowSkill: { generatedObjects: [definition] } } }, {}, base)
  .definitions).length, 0, 'do not assign Momo rules to unrelated summons');
assert.equal(Object.keys(ui.buildSummonInput(owner, boundTiming, {}, null).definitions).length, 0);
assert.ok(bound.unresolved.some(row => /独立命中入力/.test(row.reason)));

// The opt-in provisional adapter still recomputes clone damage from its own
// abilities. It accepts scalar suppliers, not an owner's expected damage.
const actualTiming = require('../dps-timing-data.js').apostles.momo;
const actualApostle = {};
vm.runInNewContext(fs.readFileSync(require.resolve('../apostles.js'), 'utf8')
  + ';this.momo = APOSTLE_INDEX.momo;', actualApostle);
function provisionalProfiles() {
  const profile = (id, coefficient) => ({ effectId: id, damageResult: { expected: 999999999,
    runtimeBase: { baseAtk: 550, baseCrit: 12, baseCritDmg: 13,
      attackP: 25, critP: 0, critDmgP: 0, finalDef: 2000, finalCritRes: 100,
      finalCritDmgRes: 100, finalActionMultiplierP: coefficient, rawAddRate: 1, personalityRate: 1,
      specialP: 100, otherP: 100, critRateP: 0, critResAddP: 0, critDmgAddP: 0, critDmgResAddP: 0 } } });
  return { normal: profile('Momo_low_e01', 30), explosion: profile('Momo_low_e02', 45),
    highNormal: profile('Momo_high_e04', 40), highExplosion: profile('Momo_high_e05', 60) };
}
const provisional = JSON.parse(JSON.stringify(ui.buildSummonInput(owner, actualTiming, {}, base,
  { profiles: provisionalProfiles(), skillLevels: { asideRank: 2 } })));
assert.equal(provisional.provisionalModel, 'momo-site-snapshot-v1');
assert.equal(provisional.definitions.Momo_low_clone.abilityAssembly.ownerBaseStats.magicAtk, 550.125,
  'an agreeing displayed integer must not discard the audited fraction');
const editedProfiles = provisionalProfiles();
editedProfiles.normal.damageResult.runtimeBase.baseAtk = 600;
const editedInput = ui.buildSummonInput(owner, actualTiming, {}, base,
  { profiles: editedProfiles, skillLevels: { asideRank: 2 } });
assert.equal(editedInput.definitions.Momo_low_clone.abilityAssembly.ownerBaseStats.magicAtk, 600);
assert.equal(editedInput.definitions.Momo_low_clone.sourceBoundary.preBattleOverrides.magicAtk.input, 600);
const realDefinitions = Object.values(actualTiming.actions).flatMap(action => (action.generatedObjects || [])
  .filter(object => object.executionMode === '召喚ユニット'));
assert.deepEqual(sim.getSummonCalculationIssues(provisional, realDefinitions), []);
assert.equal(provisional.definitions.Momo_high_clone.hitInputs.Momo_low_e01.coefficientP, 40,
  'high clone uses high-skill level suppliers, not low coefficients');
const realConfig = sim.buildCombatantConfig(actualApostle.momo, actualTiming, { skillLevels: { low: 15, high: 15 } });
realConfig.initialSp = realConfig.maxSp;
const provisionalOptions = { summonCalculationInput: provisional, durationSeconds: 20, highSkillMode: 'disabled',
  recordTimeline: true, maxTimelineEvents: 10000 };
const realResult = sim.simulate(realConfig, provisionalOptions);
const cloneHits = realResult.timeline.filter(row => row.type === 'hit' && row.generatedObjectId);
assert.ok(cloneHits.length > 4);
assert.ok(cloneHits.every(row => row.expectedDamage < 10000), 'owner expected damage is never used');
assert.ok(realResult.timeline.some(row => row.type === 'spRecoveryEvent' && /death-sp/.test(row.effectId)));
assert.ok(!realConfig.warnings.some(row => /感電をモーション終了/.test(row)),
  'shock cannot be applied early by the owner fallback');
assert.equal(sim.simulate(realConfig, { ...provisionalOptions, enableFastForward: false }).damage.totalExpectedDamage,
  realResult.damage.totalExpectedDamage);
const noA2 = JSON.parse(JSON.stringify(ui.buildSummonInput(owner, actualTiming, {}, base,
  { profiles: provisionalProfiles(), skillLevels: { asideRank: 1 } })));
assert.ok(!sim.simulate(realConfig, { ...provisionalOptions, summonCalculationInput: noA2 }).timeline
  .some(row => row.type === 'spRecoveryEvent' && /death-sp/.test(row.effectId)));
const malformedProfiles = provisionalProfiles(); malformedProfiles.normal.damageResult.runtimeBase.finalDef = NaN;
assert.notEqual(ui.buildSummonInput(owner, actualTiming, {}, base,
  { profiles: malformedProfiles, skillLevels: { asideRank: 2 } }).provisionalModel, 'momo-site-snapshot-v1');
worker.request = JSON.stringify({ requestId: 50, mode: 'single', config: realConfig, options: provisionalOptions });
vm.runInContext('deliver({data: JSON.parse(request)})', worker);
assert.equal(messages.at(-1).error, undefined);
assert.equal(messages.at(-1).result.damage.totalExpectedDamage, realResult.damage.totalExpectedDamage);
delete growthSnapshot.internalTotals.matk;
assert.equal(ui.readBase(owner, { target: owner, state: { apostles: { Momo: {} } } }), null);
console.log('Summon native-addendum ability, origin/spell, clock, cap, death SP, shock and Worker tests passed');
