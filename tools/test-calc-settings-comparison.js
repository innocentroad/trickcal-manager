'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../formation-damage-calc.js'), 'utf8');
function extract(name) {
  const start = source.indexOf(`  function ${name}(`);
  assert.ok(start >= 0);
  return source.slice(start, source.indexOf('\n  function ', start + 1));
}
const clone = value => JSON.parse(JSON.stringify(value));
let inputs = { atk: '90', def: '10', enemyFuryPlus: '-1' };
const context = {
  view: { targetId: 'live', statDirty: false, effectSources: { card: true },
    conditionalEffectStackCounts: { live: 3 }, enemyStatDirty: false },
  clonePlain: clone, normalizeFormation: clone,
  sanitizeFdcTempCardStates: value => clone(value || {}), sanitizeSkillLevelOverrides: value => clone(value || {}),
  normalizePvpRank: value => value || 0, normalizeEpicaA2EnemyCount: value => value || 1,
  readDamageCalculationInputs: () => clone(inputs),
  writeDamageCalculationInputs: value => { inputs = { ...inputs, ...value }; },
  writeSelfStatInputsForStats: (_, stats) => { inputs.atk = String(stats.atk); },
  buildContext: () => ({ target: { id: context.view.targetId, stats: { atk: 120 } } }),
  calculateDamage: () => ({ expected: Number(inputs.atk) - Number(inputs.def) }),
  createDpsEvaluationInput: () => ({ atk: inputs.atk, enemyFury: inputs.enemyFuryPlus,
    effectSources: clone(context.view.effectSources) }),
  createPinnedDpsSnapshot: clone
};
vm.runInNewContext(extract('evaluateComparisonScenario'), context);
const scenario = {
  actors: { self: { id: 'saved' } },
  characterState: { apostles: { saved: { asideLevel: 2 } } },
  battleConditions: { statDirty: true, enemyStatDirty: true,
    inputs: { atk: '500', def: '200', enemyFuryPlus: '10' } },
  effectAssumptions: { effectSources: { card: false }, conditionalEffectStackCounts: { saved: 2 } }
};
const before = clone(context.view);
const beforeInputs = clone(inputs);
let evaluation = context.evaluateComparisonScenario(scenario);
assert.equal(evaluation.result.expected, 300, 'manual saved stats and enemy inputs are used');
assert.equal(evaluation.dpsSnapshot.enemyFury, '10');
assert.equal(evaluation.dpsSnapshot.effectSources.card, false);
assert.deepEqual(context.view, before);
assert.deepEqual(inputs, beforeInputs);
scenario.battleConditions.statDirty = false;
evaluation = context.evaluateComparisonScenario(scenario);
assert.equal(evaluation.result.expected, -80, 'non-manual stats are rebuilt, not copied from stale result');
assert.deepEqual(context.view, before);
assert.deepEqual(inputs, beforeInputs);
context.calculateDamage = () => { throw new Error('calculation failed'); };
assert.throws(() => context.evaluateComparisonScenario(scenario), /calculation failed/);
assert.deepEqual(context.view, before);
assert.deepEqual(inputs, beforeInputs);
console.log('Saved settings comparison: saved inputs, effect settings, rebuild and restoration passed');
