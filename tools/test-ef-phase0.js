'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'formation-damage-calc.js'), 'utf8');
function extract(name) {
  const start = source.indexOf(`  function ${name}(`);
  assert.notEqual(start, -1);
  const end = source.indexOf('\n  function ', start + 1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}
const preset = { content: { type: 'eliasFrontier', stage: 8 }, phases: Array.from({ length: 6 }, () => ({})) };
let selected = preset;
const field = { hidden: true };
const context = {
  view: { enemyPhaseIndex: 5, perspective: 'self' },
  el: { enemyFuryField: field, inputs: { enemyFuryPlus: { value: '-1' }, enemyTakenDmgP: { value: '10' } } },
  getSelectedEnemyPreset: () => selected,
  clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
  readNumber: input => Number(input?.value) || 0,
  isEnemyDamageInputKey: () => true
};
vm.runInNewContext([
  'getEnemyPresetFuryConfig', 'normalizeEnemyFuryPlus', 'syncEnemyPresetFuryField',
  'getEnemyPresetFuryTakenDamageP', 'getDefenseMods',
  'readDamageCalculationInputs', 'writeDamageCalculationInputs'
].map(extract).join('\n'), context);

context.syncEnemyPresetFuryField();
assert.equal(field.hidden, false);
assert.equal(context.getDefenseMods('enemy').takenDmgP, 10, 'なしは既存入力を維持');
for (const [plus, expected] of [[0, 20], [1, 25], [5, 45], [10, 70], [11, 70]]) {
  context.el.inputs.enemyFuryPlus.value = String(plus);
  assert.equal(context.getEnemyPresetFuryTakenDamageP(), expected);
  assert.equal(context.getDefenseMods('enemy').takenDmgP, 10 + expected, '既存軽減へポイント加算');
  assert.equal(context.getDefenseMods('self').takenDmgP, 0, '味方の被ダメージには作用しない');
}
context.el.inputs.enemyFuryPlus.value = '10';
const saved = context.readDamageCalculationInputs();
context.el.inputs.enemyFuryPlus.value = '-1';
context.writeDamageCalculationInputs(saved, { enemy: true, settings: false });
assert.equal(context.el.inputs.enemyFuryPlus.value, '10', '保存入力から復元');
context.writeDamageCalculationInputs({}, { enemy: true, settings: false });
assert.equal(context.el.inputs.enemyFuryPlus.value, '-1', '旧保存では残存選択を消す');
context.writeDamageCalculationInputs({ enemyFuryPlus: 999 }, { enemy: true, settings: false });
assert.equal(context.el.inputs.enemyFuryPlus.value, '10', '上限へ丸める');
context.writeDamageCalculationInputs({}, { enemy: false, settings: false });
assert.equal(context.el.inputs.enemyFuryPlus.value, '10', '敵条件を読まない場合は保持');
for (const value of ['', null, undefined, 'bad', -1]) assert.equal(context.normalizeEnemyFuryPlus(value), -1);

context.view.enemyPhaseIndex = 4;
context.syncEnemyPresetFuryField();
assert.equal(field.hidden, true);
assert.equal(context.getEnemyPresetFuryTakenDamageP(), 0, '通常phaseでは未適用');
context.view.enemyPhaseIndex = 5;
context.view.perspective = 'enemy';
context.syncEnemyPresetFuryField();
assert.equal(field.hidden, true, '敵の攻撃側では表示しない');
context.view.perspective = 'self';
for (const other of [null, { ...preset, content: { type: 'dimension', stage: 8 } }, { ...preset, content: { type: 'eliasFrontier', stage: 7 } }]) {
  selected = other;
  context.syncEnemyPresetFuryField();
  assert.equal(field.hidden, true);
  assert.equal(context.getEnemyPresetFuryTakenDamageP(), 0, '対象外敵へ漏らさない');
}
console.log('EF phase0: stage gating, additive reduction, UI options, saved inputs and legacy reset passed.');
