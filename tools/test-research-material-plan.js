#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const research = require('../research-progress.js');

const catalog = ['A', 'B', 'C', 'R'].map(name => ({ name }));
const recipes = [
  { name: 'A', outputCount: 2, materials: [{ name: 'R', count: 3 }] },
  { name: 'B', outputCount: 1, materials: [{ name: 'A', count: 2 }, { name: 'R', count: 1 }] },
  { name: 'C', outputCount: 1, materials: [{ name: 'A', count: 1 }] }
];
const rows = [
  { 段階: 11, 取得順: 1, 素材: [{ name: 'B', count: 1 }] },
  { 段階: 12, 取得順: 1, 素材: [{ name: 'C', count: 1 }] },
  { 段階: 12, 取得順: 2, 素材: [{ name: 'A', count: 1 }] }
];
const plan = (state, end, inventory = {}, mode = 'total') =>
  research.planRemainingResearch(rows, recipes, catalog, state, end, inventory, mode);
const initial = plan({ level: 0, progress: 0 }, 12);
assert.equal(initial.researchCount, 3);
assert.equal(initial.direct.get('A'), 1);
assert.equal(initial.entries.get('A').demand, 4, 'direct and both branches meet before expansion');
assert.equal(initial.entries.get('A').batches, 2);
assert.equal(initial.entries.get('R').demand, 7);
assert.deepEqual([...initial.byStage.get(12)], [['C', 1], ['A', 1]]);
const short = plan({ level: 0, progress: 0 }, 12, { A: 1, R: 2 }, 'shortfall');
assert.equal(short.entries.get('A').owned, 1);
assert.equal(short.entries.get('A').missing, 3);
assert.equal(short.entries.get('A').batches, 2);
assert.equal(short.entries.get('A').surplus, 1, 'outputCount 2, surplus is not hidden');
assert.equal(short.entries.get('R').demand, 7);
assert.equal(short.entries.get('R').missing, 5, 'shared raw stock subtracted once');
const ownedFinal = plan({ level: 0, progress: 0 }, 12, { B: 1, C: 1, A: 1 }, 'shortfall');
assert.equal(ownedFinal.entries.get('A').demand, 1);
assert.equal(ownedFinal.entries.get('R').demand, 0);
assert.equal(plan({ level: 11, progress: 1 }, 12).researchCount, 2);
assert.equal(plan({ level: 11, progress: 1 }, 11).researchCount, 0);
assert.equal(plan({ level: 12, progress: 2 }, 12).entries.size, 0);
assert.equal(plan({ level: 12, progress: 0 }, 12).researchCount, 3, 'research OFF starts at stage 1');
assert.throws(() => research.createMaterialPlanner([{ name: 'A', outputCount: 0, materials: [{ name: 'R', count: 1 }] }], catalog), /完成数/);
assert.throws(() => research.createMaterialPlanner([{ name: 'A', outputCount: 1, materials: [{ name: 'A', count: 1 }] }], catalog), /循環/);
assert.throws(() => research.createMaterialPlanner([{ name: 'A', outputCount: 1, materials: [{ name: 'unknown', count: 1 }] }], catalog), /未登録/);
assert.throws(() => plan({ level: 0, progress: 0 }, 12, { A: -1 }, 'shortfall'), /所持数/);
assert.throws(() => plan({ level: 0, progress: 0 }, 12, { A: 0.5 }, 'shortfall'), /所持数/);

const generated = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'statData.js'), 'utf8'), generated);
const data = generated.window.TRICKCAL_STAT_DATA.sheets;
const real = research.planRemainingResearch(data.research, data.researchRecipes,
  data.researchMaterialCatalog, { level: 0, progress: 0 }, 12);
assert.equal(data.researchMaterialCatalog.length, 28);
assert.equal(real.researchCount, data.research.length);
assert.ok(real.direct.size > 0 && real.entries.size >= real.direct.size);
console.log('research material aggregation, stock, stages, batches, errors and actual graph: OK');
