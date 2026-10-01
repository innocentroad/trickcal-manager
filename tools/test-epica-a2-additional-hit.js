#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'formation-damage-calc.js'), 'utf8');
function extractTopLevelFunction(name) {
  const marker = `  function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} exists in production source`);
  const next = source.indexOf('\n  function ', start + marker.length);
  assert.notEqual(next, -1, `${name} function boundary exists`);
  return source.slice(start + 2, next);
}

const statContext = { window: {} };
vm.createContext(statContext);
vm.runInContext(fs.readFileSync(path.join(root, 'statData.js'), 'utf8'), statContext);
const asideEffects = statContext.window.TRICKCAL_STAT_DATA.sheets.asideSpecialEffects;
const sourceEffect = asideEffects.find(row => row.effectId === 'Epica_aside_2_e01');
assert.ok(sourceEffect, 'generated A2 target-add effect exists');
assert.equal(sourceEffect.値の種類, '普通攻撃対象追加');
assert.equal(sourceEffect.効果タイプ, 'スキル変更');
assert.equal(sourceEffect.対象スキル, '普通攻撃');
assert.equal(Number(sourceEffect.固定値), 1);
assert.match(String(sourceEffect.condition || ''), /敵が1体.*同じ敵.*追加分.*命中/);

const inputs = {
  atk: { value: '1000' }, crit: { value: '100' }, 'crit-dmg': { value: '100' },
  def: { value: '100' }, 'crit-res': { value: '100' }, 'crit-dmg-res': { value: '100' },
  'enemy-hp': { value: '10000' }, 'enemy-atk': { value: '100' },
  'enemy-crit': { value: '100' }, 'enemy-crit-dmg': { value: '100' },
  'self-def': { value: '100' }, 'self-crit-res-base': { value: '100' },
  'self-crit-dmg-res-base': { value: '100' }, 'self-hp': { value: '10000' }
};
const context = {
  window: { TRICKCAL_STAT_DATA: statContext.window.TRICKCAL_STAT_DATA },
  view: { perspective: 'self', epicaA2EnemyCount: 1, enemySelectedSkillCategory: '' },
  el: { inputs },
  asideEnabled: true,
  clamp(value, min, max) { return Math.min(max, Math.max(min, value)); },
  readNumber(input) { return Number(input?.value) || 0; },
  getFdcEffectiveSkillLevels(target) { return { asideRank: target.asideRank }; },
  isPublicAsideEnabled() { return context.asideEnabled; },
  isFdcSkillActionCategory(value) { return /低学年|高学年/.test(String(value)); },
  isFdcUnclassifiedAttackCategory() { return false; },
  getAttackMods() {
    return {
      skill: 100, atkP: 0, atkDownP: 0, critP: 0, critDmgP: 0, critRateP: 0,
      critDmgAddP: 0, addP: 0, type: 100, special: 100, other: 100,
      actionMultiplierBonusP: 0
    };
  },
  getDefenseMods() {
    return {
      defP: 0, defDownP: 0, takenDmgP: 0, critResP: 0, critResDownP: 0,
      critDmgResP: 0, critDmgResDownP: 0, critResAddP: 0, critDmgResAddP: 0
    };
  },
  getEnemyPresetStatusTakenDamageWeaknessAdd() { return 0; },
  getEnemyPresetBreakDebuffTakenDmgP() { return 0; },
  getEnemyPresetStatusDamageWeaknessOtherP() { return 0; },
  getWeaknessDamageP() { return 0; },
  applyEffectSummaryToDamageMods() {},
  resolveEnemyDamageType() { return 'physical'; },
  getActiveHpBonusP() { return 0; },
  calcBaseDamageRate(atk, def) { return atk / (atk + def); },
  calcCritRate() { return 0.5; },
  calcCritMultiplier() { return 2; },
  createPlacementRequiredDamageResult() { return { normal: 0, crit: 0, expected: 0, detail: { stats: {}, mods: {}, caps: {} } }; },
  createResonanceRequiredDamageResult() { return { normal: 0, crit: 0, expected: 0, detail: { stats: {}, mods: {}, caps: {} } }; },
  resolveSelectedSelfSkillOption(context) { return context.selectedSkillOption || null; }
};
vm.createContext(context);
vm.runInContext([
  `const view = globalThis.view;`,
  `const el = globalThis.el;`,
  extractTopLevelFunction('normalizeEpicaA2EnemyCount'),
  extractTopLevelFunction('getFdcDeclaredAttackCategories'),
  extractTopLevelFunction('getFdcActionCategories'),
  extractTopLevelFunction('getEpicaA2AdditionalHitInfo'),
  extractTopLevelFunction('renderEpicaA2EnemyCountControl'),
  extractTopLevelFunction('calculateDamage'),
  `this.api = { view, calculateDamage, getEpicaA2AdditionalHitInfo, renderEpicaA2EnemyCountControl };`
].join('\n'), context);

const baseContext = (asideRank, category = '基本攻撃', targetId = 'Epica') => ({
  target: { id: targetId, asideRank },
  actionCategory: category,
  selectedSkillOption: { value: 100, category, sourceCategory: category, targetSkill: category },
  summary: {}, enemySummary: {}, damageType: 'physical'
});
function calc(input) { return context.api.calculateDamage(input); }

context.api.view.perspective = 'self';
context.api.view.epicaA2EnemyCount = 1;
const a1 = calc(baseContext(1));
const a2Single = calc(baseContext(2));
assert.equal(a1.hitBreakdown, null, 'A1 has no extra hit');
assert.match(context.api.renderEpicaA2EnemyCountControl(baseContext(2), baseContext(2).selectedSkillOption),
  /1体（追加分も同じ敵に命中）/);
assert.equal(a2Single.hitBreakdown.appliedAdditionalHitCount, 1);
assert.equal(a2Single.hitBreakdown.hitCount, 2);
for (const field of ['normal', 'crit', 'expected']) {
  assert.equal(a2Single[field], a1[field] * 2, `A2 single enemy totals two per-hit ${field} results`);
  assert.equal(a2Single.hitBreakdown.oneHit[field], a1[field], `A2 per-hit ${field} is preserved`);
}
assert.equal(a2Single.detail.mods.finalActionMultiplierP, a1.detail.mods.finalActionMultiplierP,
  'the skill multiplier is not rewritten to conceal the extra hit');

context.api.view.epicaA2EnemyCount = 2;
const a2Multiple = calc(baseContext(2));
assert.match(context.api.renderEpicaA2EnemyCountControl(baseContext(2), baseContext(2).selectedSkillOption),
  /2体以上（追加対象は選択敵へ加算しない）/);
assert.equal(a2Multiple.hitBreakdown.appliedAdditionalHitCount, 0);
assert.equal(a2Multiple.hitBreakdown.sameEnemy, false);
assert.equal(a2Multiple.normal, a1.normal, 'a random extra target is not assigned to the selected target');

context.api.view.epicaA2EnemyCount = 1;
for (const rank of [0, 1]) {
  assert.equal(calc(baseContext(rank)).normal, a1.normal, `A${rank} does not receive the A2 hit`);
}
context.asideEnabled = false;
assert.equal(calc(baseContext(2)).normal, a1.normal, 'disabled/publicly unavailable aside has no added hit');
context.asideEnabled = true;

for (const category of ['強化攻撃', '低学年スキル', '高学年スキル']) {
  const unaffected = calc(baseContext(2, category));
  assert.equal(unaffected.hitBreakdown, null, `${category} is outside the confirmed basic-attack scope`);
  assert.equal(unaffected.normal, a1.normal, `${category} is not multiplied`);
}
context.api.view.perspective = 'enemy';
const enemyA1 = calc(baseContext(1));
assert.equal(calc(baseContext(2)).normal, enemyA1.normal, 'enemy-side attacks do not inherit Epica self effect');
context.api.view.perspective = 'self';
assert.equal(calc(baseContext(2, '基本攻撃', 'Other')).normal, a1.normal, 'other apostles are unchanged');

assert.match(source, /epicaA2EnemyCount:\s*normalizeEpicaA2EnemyCount\(view\.epicaA2EnemyCount\)/,
  'the target-count premise is serialized into calculation snapshots and settings');
assert.match(source, /view\.epicaA2EnemyCount = normalizeEpicaA2EnemyCount\(savedView\.epicaA2EnemyCount\)/,
  'older saves without the optional field safely default to one enemy');
assert.match(source, /view\.epicaA2EnemyCount = normalizeEpicaA2EnemyCount\(battleConditions\.epicaA2EnemyCount\)/,
  'comparison scenarios restore their own enemy-count premise');

const originalCondition = sourceEffect.condition;
sourceEffect.condition = 'ランダムな敵を目標対象に追加';
assert.equal(calc(baseContext(2)).normal, a1.normal, 'missing single-enemy condition fails closed');
sourceEffect.condition = originalCondition;

console.log(JSON.stringify({
  result: 'ok',
  cases: ['A1/A2', 'single/multiple enemy', 'aside off', 'basic/enhanced/low/high', 'enemy perspective', 'condition validation'],
  oneHit: a1.normal,
  singleEnemyTotal: a2Single.normal,
  multipleEnemySelectedTarget: a2Multiple.normal
}, null, 2));
