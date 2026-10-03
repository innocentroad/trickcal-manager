'use strict';
const assert = require('node:assert/strict');
const sim = require('../dps-simulator.js');
const config = sim.buildCombatantConfig({ id: 'fixture', skills: [
  { skillId: 'fixture_basic', skillType: '普通攻撃_基本', effects: [] },
  { skillId: 'fixture_enhanced', skillType: '普通攻撃_強化', effects: [] }
] }, { normalAttackIntervalFrames: 60, actions: {
  basicAttack: { motionFrames: 30 }, enhancedAttack: { motionFrames: 40, triggerProbability: 35 }
} });
config.spRegen = 0;
const options = { durationSeconds: 90, seed: 7, trials: 8, exactTrials: true,
  initialActionDelayFrames: 0, enableFastForward: false,
  damageProfiles: { basicAttack: { expectedDamage: 100 }, enhancedAttack: { expectedDamage: 300 } },
  recordTimeline: true, recordDamageSeries: true, maxTimelineEvents: 10000 };
const withoutPerformance = value => {
  const copy = JSON.parse(JSON.stringify(value));
  delete copy.performance;
  return copy;
};
function summonFixture() {
  const keys = ['physicalAtk', 'magicAtk', 'physicalDef', 'magicDef', 'crit', 'critDmg', 'critRes', 'critDmgRes'];
  const vector = value => Object.fromEntries(keys.map(key => [key, value]));
  const definition = { id: 'cache-fixture', executionMode: '召喚ユニット', repeatRule: '通常攻撃を繰り返す',
    attackSpeedBase: 150, spawnCount: 1,
    endConditions: [{ conditionType: '生成後経過時間', conditionFrames: 720 }],
    summonActions: [{ id: 'attack', motionFrames: 58 }],
    timingEvents: [
      { eventType: '行動開始', timeOrigin: '生成時', frame: 0, actionId: 'attack', recordPurpose: '実行' },
      { eventType: '攻撃', timeOrigin: '召喚ユニット行動開始', frame: 20,
        actionId: 'attack', effectKind: '魔法ダメージ', effectId: 'hit', recordPurpose: '実行' }
    ] };
  const built = sim.buildCombatantConfig({ id: 'fixture', skills: [
    { skillId: 'fixture_basic', skillType: '普通攻撃_基本', effects: [] }
  ] }, { normalAttackIntervalFrames: 9999, actions: { basicAttack: { motionFrames: 1 } } });
  built.spRegen = 0;
  built.actions.basicAttack.summonUnits = [definition];
  built.actions.basicAttack.generatedEvents = [{ frame: 0, type: 'generatedEffect', generatedEventType: '生成',
    summonDefinition: definition, generatedObjectId: definition.id, generatedInstanceOrder: 1, generatedInstanceKey: 'clone:1' }];
  const input = { schemaVersion: 1, policyVersion: 2, unresolved: [],
    ownerAliveIntervals: [{ startFrame: 0, endFrame: 170 }, { startFrame: 320, endFrame: null }],
    sharedValues: { spell: [{ startFrame: 0, value: 0 }, { startFrame: 100, value: .5 }] },
    definitions: { [definition.id]: {
      assemblyMode: 'momo-abilities-v2',
      abilityAssembly: { inputStage: 'growth-composed-base', ownerBaseStats: vector(1000), multipliers: vector(1),
        hpFixed: 3, attackSpeedBase: 150, attackSpeedLowerFactor: .2, attackSpeedUpperFactor: 10 },
      speed: { attackSpeedP: 0, selfSpeed: 1, otherSpeed: 1 },
      enemyTimeline: [{ startFrame: 0, stats: { magicDef: 2000, critRes: 1000, critDmgRes: 1000 } },
        { startFrame: 400, stats: { magicDef: 1000, critRes: 1000, critDmgRes: 1000 } }],
      hitInputs: { hit: { coefficientP: 100, effectDamage: 1, personalityRate: 1,
        damageRate: 1, endCorrection: 0, additionalCoefficient: 0 } },
      contributions: [
        { id: 'direct', sourceKind: 'spell', evidence: 'independent fixture', inheritance: 'directToSummon',
          lifetimePolicy: 'remaining', startFrame: 100, endFrame: 300, requiresOwnerAlive: true,
          abilityModifiers: { rateP: { magicAtk: 100 } } },
        { id: 'shared', sourceKind: 'spell', evidence: 'independent fixture', inheritance: 'copyAtSpawn',
          lifetimePolicy: 'permanent', startFrame: 0, endFrame: null, requiresOwnerAlive: true,
          sharedHitModifiers: [{ referenceId: 'spell', field: 'damageRate', multiplier: 1 }] }
      ]
    } } };
  return { config: built, options: { ...options, durationSeconds: 12, summonCalculationInput: input } };
}
async function run() {
  let heartbeats = 0;
  const heartbeat = setInterval(() => heartbeats++, 0);
  try {
    const original = JSON.stringify({ config, options });
    const sync = sim.simulate(config, options);
    const asyncResult = await sim.simulateAsync(config, options, { budgetMs: 1 });
    assert.deepEqual(withoutPerformance(asyncResult), withoutPerformance(sync), 'yielding must preserve the complete timeline');
    assert.ok(heartbeats > 0, 'single trial must yield to a task, not only microtasks');
    const progress = [];
    const aggregate = await sim.simulateManyAsync(config, {
      ...options, onProgress: row => progress.push(row.completed)
    }, { budgetMs: 1 });
    assert.deepEqual(withoutPerformance(aggregate), withoutPerformance(sim.simulateMany(config, options)),
      'seed order, summation order and exact trial count must agree');
    assert.equal(aggregate.evaluatedTrials, 8);
    assert.equal(progress.at(-1), 8);
    assert.equal(JSON.stringify({ config, options }), original, 'async execution must not mutate inputs');
    const fixture = summonFixture();
    const summon = sim.simulate(fixture.config, fixture.options);
    assert.deepEqual(withoutPerformance(await sim.simulateAsync(fixture.config, fixture.options, { budgetMs: 1 })),
      withoutPerformance(summon), 'summon cache boundaries must agree in sync and chunked execution');
    const hits = summon.timeline.filter(row => row.type === 'hit' && row.generatedObjectId);
    const damageAt = frame => hits.find(row => row.frame === frame).damageEvaluation.normal;
    assert.ok(damageAt(140) > damageAt(20), 'direct ability and shared value changes are applied');
    assert.equal(damageAt(260), damageAt(20), 'owner death invalidates cached spell abilities and hit gates');
    assert.ok(damageAt(380) > damageAt(260), 'owner revival restores shared hit values after direct ability expiry');
    assert.ok(damageAt(500) > damageAt(380), 'enemy defense is still evaluated at the hit');
    let cancelled = false;
    const cancellationTimer = setTimeout(() => { cancelled = true; }, 0);
    await assert.rejects(sim.simulateAsync(config, { ...options, durationSeconds: 600 }, {
      budgetMs: 1, isCancelled: () => cancelled
    }), { name: 'DpsRunCancelledError' }, 'cancellation is handled inside a single trial');
    clearTimeout(cancellationTimer);
    let completed = 0;
    await assert.rejects(sim.simulateManyAsync(config, {
      ...options, onProgress: row => { completed = row.completed; }
    }, { isCancelled: () => true }), { name: 'DpsRunCancelledError' });
    assert.equal(completed, 0, 'already-cancelled input must not begin any trial');
    const restarted = await sim.simulateAsync(config, { ...options, durationSeconds: 1 });
    assert.deepEqual(withoutPerformance(restarted), withoutPerformance(sim.simulate(config, { ...options, durationSeconds: 1 })),
      'cancelled runs must not leak state into a subsequent run');
    const malformed = { ...options, summonCalculationInput: { schemaVersion: -1 } };
    // Existing calculation errors must still reject, not appear as partial success.
    await assert.rejects(sim.simulateAsync({ ...config, actions: null }, malformed));
    console.log('DPS cooperative single/aggregate parity, heartbeat, cancellation and restart passed');
  } finally { clearInterval(heartbeat); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
