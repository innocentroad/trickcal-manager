#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const research = require('../research-progress.js');

const fixture = [
  { id: 7, 種族: '妖精', ステータス: '物理攻撃力', 段階1: 5, 段階2: 10,
    段階11: 54, 取得順11: 7, 段階12: 54, 取得順12: 7 },
  { id: 1, 種族: '', ステータス: '', 段階1: '説明', 段階11: '説明', 取得順11: 1,
    段階12: '説明', 取得順12: 1 }
];

assert.equal(research.getValue(fixture[0], 11, 6), 15);
assert.equal(research.getValue(fixture[0], 11, 7), 69);
assert.equal(research.getValue(fixture[0], 12, 6), 69);
assert.equal(research.getValue(fixture[0], 12, 7), 123);
assert.equal(research.getValue(fixture[0], 12, 0), 0);
assert.equal(research.getValue(fixture[0], 0, 7), 0);
assert.deepEqual(research.normalizeState({ level: 12, progress: 0 }, { maxLevel: 12, progressByStage: { 12: 47 } }), { level: 12, progress: 0 });
assert.deepEqual(research.normalizeState({ level: 10, progress: 47 }, { maxLevel: 12, progressByStage: { 10: 45 } }), { level: 10, progress: 45 });
assert.deepEqual(research.getAppliedStages({ id: 1, 段階1: 5, 段階3: 9 }, 3, 1), [1, 3]);
assert.equal(research.getCurrentOrder(fixture[0], 11, 6), null);
assert.equal(research.getCurrentOrder(fixture[0], 11, 7), 7);
assert.equal(research.getValue(fixture[1], 12, 7), 0, '説明行を数値計算へ加えない');

const source = fs.readFileSync(require.resolve('../formation-damage-calc.js'), 'utf8');
const start = source.indexOf('  function calculateEnemyResearchPreset(context) {');
const end = source.indexOf('\n  function sumEnemyCorrectionMaps', start);
assert.ok(start >= 0 && end > start);
const fdcContext = {
  ENEMY_GLOBAL_PERCENT_CONFIG: [{ statKey: 'patk' }],
  getEnemyBoardPresetStatKey: name => name === '物理攻撃力' ? 'patk' : '',
  TRICKCAL_STAT_DATA: { sheets: { research: fixture } },
  view: { enemyResearchPreset: { level: 12, progress: 7 } },
  researchProgress: research,
  researchLimits: research.getLimits(fixture)
};
vm.createContext(fdcContext);
vm.runInContext(`${source.slice(start, end)}\nthis.calculate = calculateEnemyResearchPreset;`, fdcContext);
assert.equal(fdcContext.calculate({ enemyMember: { race: '妖精' } }).patk, 123);
fdcContext.view.enemyResearchPreset = { level: 11, progress: 6 };
assert.equal(fdcContext.calculate({ enemyMember: { race: '妖精' } }).patk, 15);
fdcContext.view.enemyResearchPreset = { level: 0, progress: 0 };
assert.equal(fdcContext.calculate({ enemyMember: { race: '妖精' } }).patk, 0);

// Once standard generation has run, check the real stage totals against known game values.
const generated = { window: {} };
vm.runInNewContext(fs.readFileSync(require.resolve('../statData.js'), 'utf8'), generated);
const rows = generated.window.TRICKCAL_STAT_DATA.sheets.research;
if (rows.some(row => Object.hasOwn(row, '段階12'))) {
  const limits = research.getLimits(rows);
  assert.equal(limits.maxLevel, 12);
  assert.equal(limits.progressByStage[10], 45);
  assert.equal(limits.progressByStage[11], 47);
  assert.equal(limits.progressByStage[12], 47);
  assert.equal(research.getValue(rows.find(row => row.id === 47), 12, 47), 0, 'コイン説明行を加算しない');
  for (const species of new Set(rows.map(row => row.種族).filter(Boolean))) {
    const totals = Object.create(null);
    const statRows = rows.filter(row => row.種族 === species && row.ステータス);
    const totalAt = (level, progress) => statRows.reduce((sum, row) => sum + research.getValue(row, level, progress), 0);
    assert.equal(totalAt(11, 6), totalAt(10, 45), species);
    assert.equal(totalAt(12, 6), totalAt(11, 47), species);
    statRows.forEach(row => {
      totals[row.ステータス] = (totals[row.ステータス] || 0) + research.getValue(row, 12, 47);
    });
    assert.equal(totals.物理攻撃力, 389, species);
    assert.equal(totals.魔法攻撃力, 389, species);
    assert.equal(totals.物理防御力, 775, species);
    assert.equal(totals.魔法防御力, 775, species);
    assert.equal(totals.HP, 5564, species);
  }
  const spiritAttack = (level, progress) => rows
    .filter(row => row.種族 === '精霊' && row.ステータス === '物理攻撃力')
    .reduce((sum, row) => sum + research.getValue(row, level, progress), 0);
  assert.equal(spiritAttack(10, 45), 281);
  assert.equal(spiritAttack(11, 6), 281);
  assert.equal(spiritAttack(11, 7), 335);
  assert.equal(spiritAttack(11, 47), 335);
  assert.equal(spiritAttack(12, 6), 335);
  assert.equal(spiritAttack(12, 7), 389);
  fdcContext.TRICKCAL_STAT_DATA.sheets.research = rows;
  fdcContext.researchLimits = limits;
  fdcContext.view.enemyResearchPreset = { level: 12, progress: 47 };
  assert.equal(fdcContext.calculate({ enemyMember: { race: '精霊' } }).patk, 389);
  const statTotal = progress => rows.filter(row => row.種族 === '妖精' && row.ステータス)
    .reduce((sum, row) => sum + research.getValue(row, 12, progress), 0);
  assert.equal(statTotal(46), statTotal(47));
}

console.log('research runtime and enemy preset: OK');
