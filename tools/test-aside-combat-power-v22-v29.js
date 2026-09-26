#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../stat-engine.js'), 'utf8'), context);
const engine = context.window.TRICKCAL_SHARED_STAT_ENGINE;
const makeData = row => ({ getById: (sheet, id) => sheet === 'asideTiers' && row.id === id ? row : null });
const kyarot = makeData({ id: 'Kyarot', HP基礎値: 2055, HP_A1成長値: 204,
  魔法攻撃力基礎値: 216, 魔法攻撃力_A1成長値: 30,
  物理防御力基礎値: 324, 物理防御力_A1成長値: 45,
  魔法防御力基礎値: 324, 魔法防御力_A1成長値: 45,
  HP星上昇値: 9999 }); // Deprecated field must never affect the result.
const basicKyarot = { id: 'Kyarot', 攻撃タイプ: '魔法', HPタイプ: 4 };
const aside = (data, basic, rank, level) => engine.calculateAsideContribution(data, basic, { asideRank: rank, asideLevel: level });
assert.equal(aside(kyarot, basicKyarot, 1, 1).total.hp, 2055);
assert.equal(aside(kyarot, basicKyarot, 1, 30).total.hp, 7971);
assert.equal(aside(kyarot, basicKyarot, 3, 1).total.hp, 2178.3);
assert.equal(aside(kyarot, basicKyarot, 3, 1).total.matk, 228.96);
assert.ok(Math.abs(aside(kyarot, basicKyarot, 3, 50).total.hp - 12774.06) < 1e-9);
assert.equal(aside(kyarot, basicKyarot, 2, 1).total.hp, 2116.65);
assert.ok(Math.abs(aside(kyarot, basicKyarot, 2, 40).total.hp - 10311.33) < 1e-9);
assert.equal(aside(kyarot, basicKyarot, 0, 1).total.hp, 0);
assert.equal(aside(makeData({ id: 'Kyarot', HP基礎値: 0, HP_A1成長値: 0,
  魔法攻撃力基礎値: 0, 魔法攻撃力_A1成長値: 0,
  物理防御力基礎値: 0, 物理防御力_A1成長値: 0,
  魔法防御力基礎値: 0, 魔法防御力_A1成長値: 0 }), basicKyarot, 1, 1).total.hp, 0);
assert.equal(aside(makeData({ id: 'Kyarot', HP基礎値: '', HP_A1成長値: 204 }), basicKyarot, 1, 1), null);
const ui = makeData({ id: 'Ui', HP基礎値: 4680, HP_A1成長値: 465,
  魔法攻撃力基礎値: 162, 魔法攻撃力_A1成長値: 21,
  物理防御力基礎値: 432, 物理防御力_A1成長値: 60,
  魔法防御力基礎値: 432, 魔法防御力_A1成長値: 60 });
assert.equal(aside(ui, { id: 'Ui', 攻撃タイプ: '魔法', HPタイプ: 3 }, 1, 1).total.hp, 4680);
assert.equal(aside(ui, { id: 'Ui', 攻撃タイプ: '魔法', HPタイプ: 3 }, 3, 1).total.hp, 4960.8);
context.window.TRICKCAL_PUBLIC_RELEASE = { isAsideEnabled: () => false };
assert.equal(aside(kyarot, basicKyarot, 3, 50).total.hp, 0);
context.window.TRICKCAL_PUBLIC_RELEASE = { isAsideEnabled: () => true };

assert.equal(engine.round3AwayFromZero(1.2345), 1.235);
assert.equal(engine.round3AwayFromZero(-1.2345), -1.235);
const porsher = JSON.parse(fs.readFileSync(path.join(__dirname, '../../Analyze/Trickcal_v29_combat_power/sources/porsher_display_example.json'), 'utf8'));
const s = porsher.stats, w = porsher.weights;
const basic = { id: 'Porsher', 攻撃タイプ: '魔法', 攻撃速度基礎: s.attack_speed,
  戦闘力補正値: w.weight_value_a, 戦闘力低学年係数: w.active,
  戦闘力高学年係数: w.ultimate, 戦闘力パッシブ係数: w.passive,
  戦闘力アサイド係数: w.aside_value_a };
const stats = { hp: s.hp, patk: 0, matk: s.primary_attack,
  pdef: s.physical_defense, mdef: s.magic_defense, crit: s.critical,
  critDmg: s.critical_damage, critRes: s.critical_resist,
  critDmgRes: s.critical_damage_resist };
const state = { skillLevels: { low: 1, high: 1, passive: 1 }, asideRank: 0 };
assert.equal(engine.calculateCombatPower(basic, state, stats), 117709); // Display-integer diagnostic, not observed 117714.
assert.equal(engine.calculateCombatPower({ ...basic, 攻撃速度基礎: undefined, 戦闘力補正値A: 105 }, state, stats), null);
assert.equal(engine.calculateCombatPower({ ...basic, 戦闘力補正値: undefined, 戦闘力補正値B: w.weight_value_a }, state, stats), 117709);
assert.equal(engine.calculateCombatPower({ ...basic, 戦闘力低学年係数: null }, state, stats), null);
assert.throws(() => engine.calculateCombatPower({ ...basic, 戦闘力補正値B: 9 }, state, stats), /矛盾/);
assert.equal(engine.calculateCombatPower(basic, { ...state, asideRank: 1 }, stats), 117709);
assert.equal(engine.calculateCombatPower(basic, { ...state, asideRank: 2 }, stats),
  engine.calculateCombatPower(basic, { ...state, asideRank: 3 }, stats));
const distinctWeights = { ...basic, 戦闘力高学年係数: 0.03, 戦闘力パッシブ係数: 0.04 };
const lowChanged = engine.calculateCombatPower(distinctWeights, { ...state, skillLevels: { low: 2, high: 1, passive: 1 } }, stats);
const highChanged = engine.calculateCombatPower(distinctWeights, { ...state, skillLevels: { low: 1, high: 2, passive: 1 } }, stats);
const passiveChanged = engine.calculateCombatPower(distinctWeights, { ...state, skillLevels: { low: 1, high: 1, passive: 2 } }, stats);
assert.ok(lowChanged < highChanged && highChanged < passiveChanged);
const fractional = { hp: 12.75, patk: 0, matk: 0, pdef: 0, mdef: 0,
  crit: 0, critDmg: 0, critRes: 0, critDmgRes: 0 };
const onlyHp = { ...basic, 攻撃速度基礎: 0, 戦闘力補正値: 9,
  戦闘力低学年係数: 0, 戦闘力高学年係数: 0,
  戦闘力パッシブ係数: 0, 戦闘力アサイド係数: 0 };
assert.equal(engine.calculateCombatPower(onlyHp, state, fractional), 10);
assert.equal(engine.calculateCombatPower(onlyHp, state, { ...fractional, hp: 12 }), 9);
const defense = { ...fractional, hp: 0, pdef: 0.0005, mdef: 0.0005 };
const amplified = { ...onlyHp, 戦闘力補正値: 999 };
assert.equal(engine.calculateCombatPower(amplified, state, defense), 1);
const oldVector = [Array(11).fill(42), [], [], []];
const saved = engine.decodeComparisonStatSnapshots({ v: 1, a: { Porsher: [oldVector, oldVector] } });
assert.equal(saved.Porsher.current.stats.combatPower, null);
assert.equal(saved.Porsher.current.calculationVersion, 0, 'versionless compact snapshots stay legacy');
assert.equal(saved.Porsher.planned.calculationVersion, 0, 'old planned snapshot stays legacy too');
assert.equal(engine.hasCompleteBreakdown(saved.Porsher.current), false, 'v1 compact snapshot lacks calculation inputs');
assert.equal(Object.keys(engine.encodeComparisonStatSnapshots({ Porsher: { statSnapshots: { current: saved.Porsher.current } } }).a).length,
  0, 'incomplete old snapshot is never mislabeled as v2');
const sources = ['base', 'rankUp', 'equipment', 'rankGlobal', 'research', 'boardBasic', 'boardAdvanced', 'bond', 'asideManifest', 'asideLevel'];
const keys = ['hp', 'patk', 'matk', 'pdef', 'mdef', 'crit', 'critDmg', 'critRes', 'critDmgRes', 'spRegen'];
const snapshotKeys = ['hp', 'physicalAtk', 'magicAtk', 'physicalDef', 'magicDef', 'crit', 'critDmg', 'critRes', 'critDmgRes', 'spRegen'];
const full = { calculationVersion: engine.snapshotCalculationVersion, stats: { hp: 5011, combatPower: 123 },
  breakdown: Object.fromEntries(sources.map(source => [source, Object.fromEntries(keys.map(key => [key, key === 'hp' && source === 'asideManifest' ? 2178.3 : 0]))])),
  globalPercentRates: Object.fromEntries(snapshotKeys.map(key => [key, 0])) };
full.breakdown.asideLevel.hp = 648.72;
full.breakdown.base.hp = 2184;
full.breakdown.globalPercent = Object.fromEntries(keys.map(key => [key, 0]));
const plannedFull = JSON.parse(JSON.stringify(full));
plannedFull.kind = 'planned';
plannedFull.stats.hp = 5012;
plannedFull.breakdown.boardBasic.hp = 1;
const compact = engine.encodeComparisonStatSnapshots({ Kyarot: { statSnapshots: { current: full, planned: plannedFull } } });
assert.equal(compact.v, 2);
const restored = engine.decodeComparisonStatSnapshots(JSON.parse(JSON.stringify(compact))).Kyarot.current;
assert.equal(restored.calculationVersion, 2);
assert.equal(restored.breakdown.asideManifest.hp, 2178.3);
assert.equal(restored.breakdown.asideLevel.hp, 648.72);
assert.equal(engine.hasCompleteBreakdown(restored), true);
assert.equal(engine.hasCompleteBreakdown({ ...full, breakdown: { ...full.breakdown, base: { hp: 2184 } } }), false,
  'missing vector dimensions are not a complete breakdown');
assert.equal(engine.hasCompleteBreakdown({ ...full, breakdown: { ...full.breakdown,
  base: { ...full.breakdown.base, hp: null } } }), false,
  'null is not a recorded zero');
assert.equal(engine.canRebuildLegacySnapshot({}, basicKyarot, { level: 1 }, full), false,
  'legacy snapshot without saved growth settings cannot be certified');
assert.equal(engine.canRebuildLegacySnapshot({}, basicKyarot, { level: null, star: 3,
  grade: 1, rank: 1, bond: 1, asideRank: 3, asideLevel: 1 }, full), false,
  'missing saved level is not normalized to zero');
assert.equal(engine.canRebuildLegacySnapshot({}, basicKyarot, { level: 1, star: 3, grade: 1,
  rank: 1, bond: 1, asideRank: 3, asideLevel: 1 }, plannedFull, { mode: 'planned' }), false,
  'a planned snapshot without the saved board plan is not certified');
const a3Effect = { SLv: 3, ステ適用: '全体', ステ能力値: 'HP', '上昇%': 3 };
const a3Data = { sheets: { asideStatEffects: [a3Effect] },
  getById: table => table === 'asideStatEffects' ? [a3Effect] : [] };
const noA3Data = { sheets: { asideStatEffects: [] }, getById: () => [] };
assert.equal(engine.requiresAsideGlobalRecalculation(a3Data, basicKyarot, 3, 2), true,
  'A3 downshift cannot retain its old global rate');
assert.equal(engine.requiresAsideGlobalRecalculation(a3Data, basicKyarot, 2, 3), true,
  'A3 upshift cannot omit its new global rate');
assert.equal(engine.requiresAsideGlobalRecalculation(a3Data, basicKyarot, 3, 3), false);
assert.equal(engine.requiresAsideGlobalRecalculation(noA3Data, basicKyarot, 3, 2), false,
  'an apostle with no A3 global effect can use the saved external rates');
const restoredPlanned = engine.decodeComparisonStatSnapshots(JSON.parse(JSON.stringify(compact))).Kyarot.planned;
assert.equal(restoredPlanned.stats.hp, 5012, 'planned snapshot retains its own value');
assert.equal(restoredPlanned.breakdown.boardBasic.hp, 1, 'planned board breakdown is not replaced by current');
const noPower = { ...full, stats: { ...full.stats, combatPower: null } };
const noPowerStore = engine.encodeComparisonStatSnapshots({ Kyarot: { statSnapshots: { current: noPower } } });
assert.equal(engine.decodeComparisonStatSnapshots(noPowerStore).Kyarot.current.stats.combatPower, null,
  'unknown combat power is not serialized as a valid zero');
console.log('v22 aside / v29 combat-power fixture checks passed');
