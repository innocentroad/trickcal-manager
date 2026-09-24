'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const personality = require('../formation-personality.js');
const source = fs.readFileSync(require.resolve('../formation-damage-calc.js'), 'utf8');
const start = source.indexOf('  function collectSynergyCounts(');
const end = source.indexOf('  function applyPersonalityExtraCounts(', start);
assert.ok(start >= 0 && end > start, '実集計関数を読み込めること');
const basics = {
  Joanne: { id: 'Joanne', 性格: '裏面', personalityOptions: ['憂鬱', '純粋'], 種族: '妖精' },
  Fixed: { id: 'Fixed', 性格: '純粋', 種族: '妖精' },
  Resonance: { id: 'Resonance', 性格: '共鳴', 種族: '妖精' }
};
const context = {
  formationPersonality: personality,
  getApostle: id => basics[id],
  applyPersonalityExtraCounts: () => {}
};
vm.runInNewContext(source.slice(start, end) + '\n;globalThis.count = collectSynergyCounts;', context);
const counts = (ids, selections) => JSON.parse(JSON.stringify(context.count({
  rows: [{ apostles: ids, resonancePersonalities: selections }]
}).personality));
assert.deepEqual(counts(['Joanne'], ['純粋']), { 純粋: 1 });
assert.deepEqual(counts(['Joanne'], ['憂鬱']), { 憂鬱: 1 });
assert.deepEqual(counts(['Joanne'], [null]), {});
assert.deepEqual(counts(['Joanne'], ['冷静']), {});
assert.deepEqual(counts(['Fixed', 'Joanne'], [null, '純粋']), { 純粋: 2 });
assert.deepEqual(counts(['Resonance'], ['狂気']), { 狂気: 1 });
console.log('FDC actual synergy count fixture: OK');
