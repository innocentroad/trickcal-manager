'use strict';

const assert = require('node:assert/strict');
const simulator = require('../dps-simulator.js');
const hit = simulator.evaluateSingleHitDamage;
const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-10, `${message || ''}: ${actual} != ${expected}`);

// Independent binary-exact boundary examples from the selected native path.
assert.equal(hit({ baseDamage: 99.5, coefficientP: 100, endCorrection: 1 }).normal, 198);
assert.equal(hit({ baseDamage: 99.75, coefficientP: 100, endCorrection: .5 }).normal, 148);
const critical = hit({ baseDamage: 99.75, coefficientP: 100, critMult: 1.5, critRate: .25 });
assert.equal(critical.normal, 99);
assert.equal(critical.crit, 149);
assert.equal(critical.expected, 111.5);
assert.equal(hit({ baseDamage: 49.75, coefficientP: 100 }).normal * 2, 98);
assert.equal(hit({ baseDamage: 150, coefficientP: 75, additionalCoefficient: 1, endCorrection: 1 }).normal, 228);
assert.equal(hit({ baseDamage: 1, coefficientP: 16777216, additionalCoefficient: 1 }).stages.coefficientP, 16777217,
  'single field is widened then added to the double coefficient, not accumulated with it in single');
assert.equal(hit({ baseDamage: 10, coefficientP: 100, effectDamage: 1.00000001 }).stages.effectDamage, 1);
const limited = hit({ baseDamage: 1000, coefficientP: 100, damageRate: 0, endCorrection: -1 });
assert.equal(limited.normal, 40);
assert.equal(limited.stages.damageRate, Math.fround(.2));
assert.equal(limited.stages.endFactor, Math.fround(.2));
assert.equal(simulator.roundDamageRateToEven(1.0625), 1.062);
assert.equal(simulator.roundDamageRateToEven(1.1875), 1.188);
assert.equal(simulator.roundDamageRateToEven(-1.0625), -1.062);
for (const input of [
  { baseDamage: Infinity, coefficientP: 100 },
  { baseDamage: Number.MAX_SAFE_INTEGER * 2, coefficientP: 100 },
  { baseDamage: 10, coefficientP: NaN },
  { baseDamage: 10, coefficientP: 100, critRate: 2 }
]) {
  assert.equal(hit(input).supported, false);
  assert.equal(hit(input).expected, null, 'invalid inputs are not successful zero damage');
}

// At atk/def=0.5 the existing defense curve is exactly 0.6; crit stats equal
// their resistance yield rate .3 and multiplier 1.75. No copied curve helper.
const runtimeBase = {
  baseAtk: 100, baseDef: 200, finalAtk: 100, finalDef: 200, defRate: .6,
  damageType: 'physical', attackP: 0, defenseP: 0, rawAddRate: 1, addRate: 1,
  baseActionMultiplierP: 166.25, finalActionMultiplierP: 166.25, actionMultiplierBonusP: 0,
  specialP: 100, otherP: 100,
  baseCrit: 100, baseCritRes: 100, finalCritRes: 100, baseCritDmg: 100,
  baseCritDmgRes: 100, finalCritDmgRes: 100, critP: 0, critDmgP: 0,
  critResP: 0, critDmgResP: 0, critRateP: 0, critDmgAddP: 0,
  critResAddP: 0, critDmgResAddP: 0, critRate: .3, critMult: 1.75,
  hitInput: { baseDamage: 60, coefficientP: 166.25, damageRate: 1, personalityRate: 1,
    effectDamage: 1, endCorrection: 0, critRate: .3, critMult: 1.75 }
};
const evaluate = delta => simulator.evaluateDamageAtHit({
  expectedDamage: 12345, actionKey: 'basicAttack', runtimeBase, modifierDelta: delta
});
assert.equal(evaluate({}).expectedDamage, 121.5, 'even without modifiers re-evaluate the hit, not cached expected damage');
near(evaluate({ addP: 10 }).expectedDamage, 133.9);
assert.equal(evaluate({}).expectedDamage, 121.5, 'expiry restores the original raw input without rounding drift');
assert.equal(evaluate({ specialP: 20 }).calculationMode, 'legacy-continuous', 'untraced special bucket is not guessed to be End');
assert.equal(simulator.evaluateDamageAtHit({ expectedDamage: 100 }).calculationMode, 'legacy-continuous');
assert.equal(simulator.evaluateDamageAtHit({ expectedDamage: 0, runtimeBase, actionKey: 'basicAttack' }).expectedDamage, 121.5,
  'a rounded-to-zero baseline does not suppress recalculation');
assert.equal(simulator.evaluateDamageAtHit({ expectedDamage: 10, actionKey: 'basicAttack',
  runtimeBase: { ...runtimeBase, baseAtk: Number.MAX_VALUE } }).unavailable, true);

function simulate(events, effects, changes = {}) {
  const config = simulator.buildCombatantConfig({ id: 'rounding_fixture', skills: [{
    skillId: 'fixture_basic', skillType: '普通攻撃_基本', effects: [
      { effectId: 'damage', effectType: '攻撃', valueClass: '倍率', fixedValue: 166.25 }
    ]
  }] }, { normalAttackIntervalFrames: 120, actions: { basicAttack: {
    motionFrames: 5, timingEvents: [{ frame: 1, effectKind: 'ダメージ', effectId: 'damage' }]
  } } });
  config.actions.basicAttack.variants.default = events;
  if (changes.runtimeEffects) config.runtimeEffects = { ...config.runtimeEffects, ...changes.runtimeEffects };
  return simulator.simulate(config, {
    durationSeconds: 1, initialActionDelayFrames: 0, highSkillMode: 'disabled', recordTimeline: true,
    damageProfiles: { basicAttack: { variants: { default: { effects, totalExpectedDamage: 12345 } } } },
    enableFastForward: changes.fastForward !== false
  });
}
const effect = { effectId: 'damage', expectedDamage: 12345, damageResult: { runtimeBase } };
const damageEvents = [1, 2].map(frame => ({ frame, type: 'damage', hitCount: 1, effectId: 'damage', coefficientShare: .5 }));
const split = simulate(damageEvents, { damage: effect });
near(split.damage.totalExpectedDamage, 120.8, 'round each split coefficient before summation');
assert.deepEqual(split.timeline.filter(e => e.type === 'hit').map(e => e.damageEvaluation.hitResults[0].normal), [49, 49]);
assert.equal(split.hits.basicAttack, 2);
near(simulate(damageEvents, { damage: effect }, { fastForward: false }).damage.totalExpectedDamage, 120.8);
const perHitBase = { ...runtimeBase, hitInput: { ...runtimeBase.hitInput, perHitDefinition: true } };
const grouped = simulate([{ frame: 1, type: 'damage', hitCount: 2, effectId: 'damage', repeatDamageCount: 3 }], {
  damage: { ...effect, damageResult: { runtimeBase: perHitBase } }
});
assert.equal(grouped.damage.totalExpectedDamage, 729, '2 hits repeated 3 times, not twice-applied count allocation');
const multiple = simulate([{ frame: 1, type: 'damage', hitCount: 1 }], {
  damage: effect,
  second: { ...effect, effectId: 'second', damageResult: { runtimeBase: { ...runtimeBase,
    hitInput: { ...runtimeBase.hitInput, coefficientP: 83.125 } } } }
});
near(multiple.damage.totalExpectedDamage, 181.9, 'different effects have different coefficients, not a single representative base');
const unknown = simulate(damageEvents.map(({ coefficientShare, ...event }) => event), { damage: effect });
assert.ok(unknown.timeline.filter(e => e.type === 'hit').every(e => e.damageEvaluation.calculationMode === 'legacy-continuous'),
  'unproven equal hit distribution is explicitly legacy');
assert.equal(simulate([{ frame: 1, type: 'damage', hitCount: 1, coefficientShare: 1, effectId: 'damage' }], {
  damage: { ...effect, damageResult: { runtimeBase: { ...runtimeBase, hitInput: null } } }
}).damage.totalExpectedDamage, 12345, 'excluded paths preserve their old damage instead of adopting normal-hit rounding');

const timedEvents = [1, 4].map(frame => ({ frame, type: 'damage', hitCount: 1, effectId: 'damage', coefficientShare: 1 }));
const timedEffects = { damageBuffEffects: [{ id: 'timed-add', mode: 'initialTimed', durationFrames: 2,
  maxStacks: 1, stackable: false, modifiers: { addP: 10 }, baselineModifiersByAction: {} }] };
const timed = simulate(timedEvents, { damage: effect }, { runtimeEffects: timedEffects });
const timedHits = timed.timeline.filter(event => event.type === 'hit');
near(timedHits[0].expectedDamage, 133.9, 'buff is recomputed before integerization');
near(timedHits[1].expectedDamage, 121.5, 'expiry rebuilds the baseline from fractional inputs');
assert.ok(timed.timeline.some(event => event.type === 'runtimeBuffExpired'));
assert.equal(timed.damage.calculation.roundedEvents, 2);
assert.equal(unknown.damage.calculation.legacyEvents, 2);
assert.deepEqual(simulate(timedEvents, { damage: effect }, {
  runtimeEffects: timedEffects, fastForward: false
}).timeline, timed.timeline);
const oldFallback = simulator.evaluateDamageAtHit({ expectedDamage: 121.5, legacyExpectedDamage: 122.19375,
  actionKey: 'basicAttack', runtimeBase, modifierDelta: { otherP: 10 } });
near(oldFallback.expectedDamage, 134.413125, 'legacy fallback uses unrounded baseline, not ratios of rounded damage');
assert.equal(oldFallback.calculationMode, 'legacy-continuous');
assert.throws(() => simulate([{ frame: 1, type: 'damage', hitCount: 1, effectId: 'damage', coefficientShare: 1 }], {
  damage: { ...effect, damageResult: { runtimeBase: { ...runtimeBase, baseAtk: Number.MAX_VALUE } } }
}), RangeError, 'unsupported magnitude stops the simulation rather than producing successful 0 damage');

// Execute the production cache accessors: old results are rejected, saved inputs stay intact.
const fs = require('node:fs');
const vm = require('node:vm');
const fdcSource = fs.readFileSync(require.resolve('../formation-damage-calc.js'), 'utf8');
const cacheSandbox = { TRICKCAL_SHARED_STAT_ENGINE: { snapshotCalculationVersion: 4 } };
const productionFunction = name => {
  const start = fdcSource.indexOf(`  function ${name}(`);
  assert.ok(start >= 0, `production function ${name} exists`);
  const end = fdcSource.indexOf('\n  }', start) + '\n  }'.length;
  return fdcSource.slice(start, end);
};
vm.runInNewContext(`${fdcSource.match(/const DAMAGE_CALCULATION_VERSION = \d+;/)[0]}
${productionFunction('isCurrentDamageCalculation')}
${productionFunction('getPinnedSingleActionCache')}
${productionFunction('getPinnedDpsCache')}
this.single = getPinnedSingleActionCache; this.dps = getPinnedDpsCache;`, cacheSandbox);
const saved = { baseline: { scenario: { sourceMeta: { statCalculationVersion: 4 }, actors: { self: { id: 'epica' } } },
  singleActionResult: { expected: 123 }, dpsSnapshot: { targetId: 'epica' } } };
const original = JSON.stringify(saved);
assert.equal(cacheSandbox.single(saved), null);
assert.equal(cacheSandbox.dps(saved), null);
assert.equal(JSON.stringify(saved), original, 'version check never rewrites saved input conditions');
saved.baseline.scenario.sourceMeta.damageCalculationVersion = 1;
assert.equal(cacheSandbox.single(saved), saved.baseline.singleActionResult);
assert.equal(cacheSandbox.dps(saved), saved.baseline.dpsSnapshot);
saved.baseline.scenario.sourceMeta.statCalculationVersion = 3;
assert.equal(cacheSandbox.single(saved), null, 'stat calculation compatibility remains independent');

console.log('Normal-hit rounding, event integration and saved-cache version tests passed');
