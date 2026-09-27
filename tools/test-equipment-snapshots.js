'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../stat-engine.js'), 'utf8'), context);
const engine = context.window.TRICKCAL_SHARED_STAT_ENGINE;
const keys = ['hp', 'patk', 'matk', 'pdef', 'mdef', 'crit', 'critDmg', 'critRes', 'critDmgRes', 'spRegen'];
const snapshotKeys = ['hp', 'physicalAtk', 'magicAtk', 'physicalDef', 'magicDef', 'crit', 'critDmg', 'critRes', 'critDmgRes', 'spRegen'];
const sources = ['base', 'rankUp', 'equipment', 'rankGlobal', 'research', 'boardBasic', 'boardAdvanced', 'bond', 'asideManifest', 'asideLevel', 'globalPercent'];
const zero = () => Object.fromEntries(keys.map(key => [key, 0]));
const copy = value => JSON.parse(JSON.stringify(value));
const basic = { id: 'fixture', 攻撃タイプ: '物理', 攻撃速度基礎: 0,
  戦闘力補正値: 999, 戦闘力低学年係数: 0, 戦闘力高学年係数: 0,
  戦闘力パッシブ係数: 0, 戦闘力アサイド係数: 0 };
const data = { sheets: {
  equipment: [{ id: 'fixture', Equip_Rank1_HP: 1 }],
  equipmentValues: [{ rank: 1, statGroup: 'HP', tier: 1, enhance0: 1707,
    enhance1: 1826.49, enhance2: 1945.98 }],
  bondBonuses: [{ 好感度Lv: 1, 会心: 0, 会心DMG: 0, 会心抵抗: 0, 会心DMG抵抗: 0 }],
  asideStatEffects: []
} };
const state = { level: 1, star: 1, grade: 1, rank: 1, bond: 1, asideRank: 0,
  equipment: { HP: { enabled: true, enhance: 1 } } };
const original = { calculationVersion: 2, stats: {},
  breakdown: Object.fromEntries(sources.map(source => [source, zero()])),
  globalPercentRates: Object.fromEntries(snapshotKeys.map(key => [key, 0])) };
original.breakdown.equipment.hp = 1826;
const oldCopy = JSON.stringify(original);
assert.equal(engine.canRebuildLegacySnapshot(data, basic, state, original), false,
  'old truncated equipment cannot be certified against new fractional data');
original.breakdown.boardBasic.hp = 0.75;
const calculate = (snapshot, enhance) => engine.applyApostleOverridesToSnapshot(data, basic, state,
  { snapshot, overrides: { equipment: { HP: { enabled: true, enhance } } } });
const current = calculate(original, 1);
assert.equal(current.calculationVersion, engine.snapshotCalculationVersion);
assert.equal(current.breakdown.equipment.hp, 1826.49);
assert.equal(current.internalTotals.hp, 1827.24);
assert.equal(current.stats.hp, 1827, 'equipment is not truncated before the total');
assert.equal(engine.calculateCombatPower(basic, state, current.internalTotals), 146179,
  'v29 receives the internal equipment fraction');
const changed = calculate(current, 2);
assert.equal(changed.stats.hp, 1946);
assert.equal(calculate(changed, 1).internalTotals.hp, current.internalTotals.hp, 'no enhance/revert drift');
const planned = calculate({ ...copy(current), kind: 'planned', breakdown: {
  ...copy(current.breakdown), boardBasic: { ...zero(), hp: 1.75 }
} }, 1);
const compact = engine.encodeComparisonStatSnapshots({ fixture: { statSnapshots: { current, planned } } });
const restored = engine.decodeComparisonStatSnapshots(copy(compact)).fixture;
assert.equal(restored.current.breakdown.equipment.hp, 1826.49);
assert.equal(restored.current.internalTotals.hp, 1827.24, 'comparison storage retains the fractional input');
assert.equal(calculate(restored.current, 1).stats.hp, 1827);
assert.equal(calculate(restored.planned, 1).stats.hp, 1828);
assert.equal(engine.encodeComparisonStatSnapshots({ fixture: { statSnapshots: { current: JSON.parse(oldCopy) } } }).a.fixture,
  undefined, 'cannot save a legacy value under the new calculation version');
const legacyCompact = copy(compact);
legacyCompact.v = 2;
legacyCompact.a.fixture[0][4] = 2;
legacyCompact.a.fixture[0].length = 6;
legacyCompact.a.fixture[0][0][10] = 1234;
assert.equal(engine.decodeComparisonStatSnapshots(legacyCompact).fixture.current.stats.combatPower, null,
  'a v2 power is not current power');
assert.equal(engine.decodeComparisonStatSnapshots(legacyCompact).fixture.current.internalTotals, undefined,
  'v2 storage is not presented as a precise internal vector');
assert.equal(original.breakdown.equipment.hp, 1826, 'rebuilding does not overwrite the source snapshot');
console.log('Equipment: fractional totals/power, enhance/revert, current/planned, compact and old-save checks passed');
