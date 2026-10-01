#!/usr/bin/env node
// Independent screenshot expectations: analysis/naia_taida_screenshot_comparison.tsv.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'statData.js'), 'utf8');
const data = JSON.parse(JSON.stringify(vm.runInNewContext(`${source}\nTRICKCAL_STAT_DATA`, { window: {} }).sheets.lifeJobs));
assert.equal(data.schemaVersion, 5);
assert.equal(Object.hasOwn(data, 'jobs'), false);
assert.equal(Object.hasOwn(data, 'materialApostleLinks'), false);
const names = new Map(data.materials.map(material => [material.id, material.name]));
const cases = new Map([
  ['ナイア', ['パリパリの金箔', 'ウィンクウィンク', 'チーズ']],
  ['タイダー', ['蜜', '砂糖', '加工しやすい木', '睡眠アイマスク', '野菜']]
]);
for (const [apostle, expected] of cases) {
  const slots = data.resumeMaterialSlots.filter(slot => slot.apostleName === apostle)
    .sort((a, b) => a.order - b.order);
  assert.deepEqual(slots.map(slot => names.get(slot.materialId)), expected);
  assert.deepEqual(slots.map(slot => slot.isBest), [true, ...expected.slice(1).map(() => false)]);
}
const taida = data.resumeMaterialSlots.filter(slot => slot.apostleName === 'タイダー');
assert.deepEqual(taida.filter(slot => slot.sources.includes('rest')).map(slot => names.get(slot.materialId)).sort(),
  ['加工しやすい木', '睡眠アイマスク'].sort());
assert.equal(data.resumeMaterialSlots.every(slot => !Object.hasOwn(slot, 'referenceCount')), true);
const published = new Set(data.apostles.map(apostle => apostle.name));
assert.equal(data.resumeMaterialSlots.every(slot => published.has(slot.apostleName)), true);
for (const name of ['グウィン', 'コミー（水着）', 'レーテー']) assert.equal(published.has(name), false);
const pairs = new Set(data.resumeMaterialSlots.map(slot => `${slot.apostleName}\u0000${slot.materialId}`));
assert.equal(pairs.size, data.resumeMaterialSlots.length);
console.log(JSON.stringify({ result: 'ok', publicApostles: published.size,
  resumeSlots: data.resumeMaterialSlots.length, examples: [...cases] }));
