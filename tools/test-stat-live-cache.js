'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../stat-prototype.js'), 'utf8');
const names = ['stableStringify', 'stableValue', 'omitDuplicateFinalStats', 'restoreOmittedFinalStats'];
const ctx = { cloneJson: value => JSON.parse(JSON.stringify(value)) };
for (const name of names) {
  const start = source.indexOf(`  function ${name}(`);
  assert.ok(start >= 0, name);
  vm.runInNewContext(source.slice(start, source.indexOf('\n  function ', start + 1)), ctx);
}
const state = { apostles: {
  same: { finalStats: { attack: 1.25, hp: 42 }, statSnapshots: { current: { calculationVersion: 4, stats: { hp: 42, attack: 1.25 }, internalTotals: { hp: 42.5 } }, planned: { stats: { hp: 45 } } } },
  different: { finalStats: { hp: 20 }, statSnapshots: { current: { stats: { hp: 21 } } } },
  old: { finalStats: { hp: 30 } },
  explicitNull: { finalStats: null, statSnapshots: { current: { stats: { hp: 0 } } } }
} };
const original = JSON.stringify(state);
const draft = JSON.parse(original);
ctx.omitDuplicateFinalStats(draft);
assert.equal('finalStats' in draft.apostles.same, false);
assert.deepEqual(draft.apostles.different.finalStats, { hp: 20 });
assert.deepEqual(draft.apostles.old.finalStats, { hp: 30 });
assert.equal(draft.apostles.explicitNull.finalStats, null);
assert.equal(JSON.stringify(state), original);
assert.ok(JSON.stringify(draft).length < original.length);
ctx.restoreOmittedFinalStats(draft);
assert.equal(ctx.stableStringify(draft), ctx.stableStringify(state));
draft.apostles.same.finalStats.hp = 99;
assert.equal(draft.apostles.same.statSnapshots.current.stats.hp, 42);
assert.match(source, /const snapshot = createStateWorkspaceDraft\(\);\s+omitDuplicateFinalStats\(snapshot\)/);
assert.match(source, /restoreOmittedFinalStats\(parsed\)/);
console.log('stat live cache: exact duplicate removal, lossless restoration and historical fallbacks passed');
