#!/usr/bin/env node
'use strict';

// Independent finite-input examples from Analyze/Trickcal_v33_stat_rounding.
// The 1730 flat input and 8% rate are discriminating fixtures, not game records.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'stat-engine.js'), 'utf8'), context);
const engine = context.window.TRICKCAL_SHARED_STAT_ENGINE;
const keys = ['hp', 'patk', 'matk', 'pdef', 'mdef', 'crit', 'critDmg', 'critRes', 'critDmgRes', 'spRegen'];
const sources = ['base', 'rankUp', 'equipment', 'rankGlobal', 'research', 'boardBasic', 'boardAdvanced', 'bond', 'asideManifest', 'asideLevel', 'globalPercent'];
const zero = () => Object.fromEntries(keys.map(key => [key, 0]));
const breakdown = () => Object.fromEntries(sources.map(source => [source, zero()]));
const asideRow = { id: 'fixture', HP基礎値: 216, HP_A1成長値: 0,
  物理攻撃力基礎値: 0, 物理攻撃力_A1成長値: 0,
  物理防御力基礎値: 0, 物理防御力_A1成長値: 0,
  魔法防御力基礎値: 0, 魔法防御力_A1成長値: 0 };
const data = { sheets: {
  baseStatValues: [{ col1: 'tier1', HP基礎: 72, HP係数: 10 }],
  gradeBonuses: [], asideTiers: [asideRow]
}, getById: (sheet, id) => sheet === 'asideTiers' && id === 'fixture' ? asideRow : null };
const basic = { id: 'fixture', 攻撃タイプ: '物理', HPタイプ: 1, レア度: 5 };
const state = { level: 61, star: 5, grade: 1, asideRank: 2, asideLevel: 1, follow: false };
const body = engine.calculateBaseTotals(data, basic, state);
assert.ok(Math.abs(body.hp - 1209.6) < 1e-9, 'body keeps the star product fraction');
const parts = breakdown();
parts.base.hp = body.hp;
parts.asideManifest.hp = 222.48;
parts.rankGlobal.hp = 1730;
const combined = engine.calculateFinalInternalTotals(data, basic, state, parts, { hp: 8 });
assert.ok(Math.abs(combined.totals.hp - 3415.0464) < 1e-9, '3162.08 * 1.08, not floor of the increase');
assert.equal(Math.floor(combined.totals.hp), 3415);
parts.equipment.hp = 1826.49;
const withEquipment = engine.calculateFinalInternalTotals(data, basic, state, parts, { hp: 8 });
assert.ok(Math.abs(withEquipment.totals.hp - (3162.08 + 1826.49) * 1.08) < 1e-9);
const withFollow = engine.calculateFinalInternalTotals(data, basic, { ...state, follow: true }, parts, { hp: 8 });
assert.equal(engine.followFraction({ follow: true }, 'hp'), 0.030000001192092896);
assert.ok(Math.abs(withFollow.totals.hp - (3162.08 + 1826.49) * (1.08 + 0.030000001192092896)) < 1e-9);
assert.notEqual(withFollow.totals.hp, (3162.08 + 1826.49) * 1.08 * (1 + 0.030000001192092896));
assert.equal(engine.followFraction({ follow: true }, 'spRegen'), 0);
assert.equal(engine.commonFlatValue(0.6) + engine.commonFlatValue(0.6), 0);
assert.equal(engine.commonFlatValue(1.8) + engine.commonFlatValue(2.8), 3);

const uiAside = { ...asideRow, HP基礎値: 4680, HP_A1成長値: 465 };
const uiData = { sheets: { asideTiers: [uiAside] }, getById: () => uiAside };
const uiState = { asideRank: 3, asideLevel: 2, follow: false };
const uiPart = engine.calculateAsideContribution(uiData, basic, uiState);
assert.equal(uiPart.total.hp, 5453.700000000001);
assert.notEqual(uiPart.total.hp, uiPart.base.hp + uiPart.growth.hp);
const uiCombined = engine.calculateFinalInternalTotals(uiData, basic, uiState, breakdown(), { hp: 0 });
assert.equal(uiCombined.totals.hp, uiPart.total.hp, 'display breakdown is not re-summed for calculation');

const saved = { calculationVersion: engine.snapshotCalculationVersion,
  stats: { hp: 3415, physicalAtk: 0, magicAtk: 0, physicalDef: 0, magicDef: 0,
    crit: 0, critDmg: 0, critRes: 0, critDmgRes: 0, spRegen: 0, combatPower: 0 }, breakdown: parts,
  globalPercentRates: { hp: 12.5, physicalAtk: 0, magicAtk: 0, physicalDef: 0, magicDef: 0,
    crit: 0, critDmg: 0, critRes: 0, critDmgRes: 0, spRegen: 0 },
  internalTotals: { ...zero(), hp: withEquipment.totals.hp } };
const compact = engine.encodeComparisonStatSnapshots({ fixture: { statSnapshots: { current: saved } } });
assert.equal(compact.v, 3);
const restored = engine.decodeComparisonStatSnapshots(JSON.parse(JSON.stringify(compact))).fixture.current;
assert.equal(restored.globalPercentRates.hp, 12.5);
assert.equal(restored.internalTotals.hp, withEquipment.totals.hp);
assert.equal(engine.hasCompleteBreakdown(restored), true);
assert.equal(engine.hasCompleteBreakdown({ ...restored, internalTotals: null }), false);

// A v3 result with verifiable saved growth inputs may be rebuilt; the old
// integer body and old follow-in-common rate must not become v4 inputs.
const previous = { level: 61, star: 5, grade: 1, rank: 1, bond: 1,
  asideRank: 2, asideLevel: 1, follow: true, equipment: {} };
data.sheets.bondBonuses = [{ 好感度Lv: 1, 会心: 0, 会心DMG: 0, 会心抵抗: 0, 会心DMG抵抗: 0 }];
const oldBreakdown = breakdown();
oldBreakdown.base.hp = 1209;
oldBreakdown.asideManifest.hp = 222.48;
const oldRates = Object.fromEntries(Object.keys(saved.globalPercentRates).map(key => [
  key, key === 'hp' ? 11 : key === 'spRegen' ? 0 : 3
]));
const old = { calculationVersion: 3, stats: { hp: 3414 },
  breakdown: oldBreakdown, globalPercentRates: oldRates };
assert.equal(engine.canRebuildLegacySnapshot(data, basic, previous, old), true);
const migrated = engine.applyApostleOverridesToSnapshot(data, basic, previous, { snapshot: old });
assert.equal(migrated.calculationVersion, 4);
assert.equal(migrated.globalPercentRates.hp, 8);
assert.ok(Math.abs(migrated.internalTotals.hp - 1432.08 * (1.08 + 0.030000001192092896)) < 1e-9);
assert.equal(engine.applyApostleOverridesToSnapshot(data, basic, previous,
  { snapshot: migrated }).internalTotals.hp, migrated.internalTotals.hp, 'no repeat drift');
const inconsistent = JSON.parse(JSON.stringify(old));
inconsistent.breakdown.asideManifest.hp = 999;
assert.equal(engine.canRebuildLegacySnapshot(data, basic, previous, inconsistent), false);
console.log('v33 body, ordered final rate, aside, follow, AllValue and compact fractions: OK');
