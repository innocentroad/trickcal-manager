#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = {
  console,
  window: {
    TRICKCAL_PUBLIC_RELEASE: {
      isAsideEnabled: () => true
    }
  }
};
vm.createContext(context);
for (const filename of ['statData.js', 'apostles.js', 'stat-engine.js', 'dps-timing-data.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, filename), 'utf8'), context, { filename });
}
vm.runInContext('globalThis.__apostles = APOSTLE_LIBRARY', context);

const data = context.window.TRICKCAL_STAT_DATA;
const sheets = data?.sheets;
const apostles = context.__apostles;
const engine = context.window.TRICKCAL_SHARED_STAT_ENGINE;
const dps = context.DPS_TIMING_DATA;
assert.ok(sheets && apostles && engine && dps, 'generated data and shared engines are loaded');

const definitions = [
  {
    id: 'Epica', libraryId: 'epica', name: 'エピカ', attackType: '物理', attackKey: 'patk',
    attackBase: 216, attackGrowth: 30,
    global: { 物理攻撃力: 4, 物理防御力: 4 },
    rowTargets: { '味方/中列': { 与ダメージ量増加: 19.5, 被ダメージ量減少: 8.8 } },
    asideName: 'エピカン',
    dpsAsideStatus: '暫定',
    images: [
      'img/Chara/Aside/AsideIcon_Epica.webp',
      'img/Chara/Aside/Aside_Skill_Epica_1.webp',
      'img/Chara/Aside/Aside_Skill_Epica_2.webp',
      'img/Chara/Aside/Aside_Skill_Epica_3.webp'
    ]
  },
  {
    id: 'Belita', libraryId: 'belita', name: 'ベリータ', attackType: '魔法', attackKey: 'matk',
    attackBase: 216, attackGrowth: 30,
    global: { 会心ダメージ: 3, 会心ダメージ抵抗: 3 },
    rowTargets: { '味方/後列': { 与ダメージ量増加: 13.6, 被ダメージ量減少: 5.9 } },
    asideName: 'わらわの心の中の妹',
    dpsAsideStatus: '未',
    images: [
      'img/Chara/Aside/AsideIcon_Belita.webp',
      'img/Chara/Aside/Aside_Skill_Belita_1.webp',
      'img/Chara/Aside/Aside_Skill_Belita_2.webp',
      'img/Chara/Aside/Aside_Skill_Belita_3.webp'
    ]
  }
];

const closeTo = (actual, expected, label) =>
  assert.ok(Math.abs(Number(actual) - expected) < 1e-9, `${label}: expected ${expected}, got ${actual}`);
const byEffectId = (effects, effectId) => effects.find(effect => effect.effectId === effectId);

for (const item of definitions) {
  const apostle = apostles.find(row => row.id.toLowerCase() === item.libraryId);
  const basic = sheets.basicInfo.find(row => row.id === item.id);
  const tier = sheets.asideTiers.find(row => row.id === item.id);
  assert.ok(apostle, `${item.id}: generated apostle entry`);
  assert.ok(basic, `${item.id}: generated basic info`);
  assert.ok(tier, `${item.id}: generated aside tier row`);
  assert.equal(apostle.name, item.name);
  assert.equal(apostle.aside.name, item.asideName);
  assert.deepEqual(Object.keys(apostle.aside.levels).sort(), ['1', '2', '3']);
  assert.equal(basic.攻撃タイプ, item.attackType);

  for (const image of item.images) {
    const file = path.join(root, image);
    assert.ok(fs.existsSync(file) && fs.statSync(file).size > 0, `${item.id}: image exists: ${image}`);
  }

  const attackStatName = item.attackKey === 'patk' ? '物理攻撃力' : '魔法攻撃力';
  assert.equal(Number(tier[`${attackStatName}基礎値`]), item.attackBase, `${item.id}: attack base uses its own attack type`);
  assert.equal(Number(tier[`${attackStatName}_A1成長値`]), item.attackGrowth, `${item.id}: attack growth uses its own attack type`);
  assert.equal(tier[`${item.attackKey === 'patk' ? '魔法攻撃力' : '物理攻撃力'}基礎値`], '', `${item.id}: opposite attack stat remains blank`);

  for (const [rank, level, multiplier] of [[1, 1, 1], [2, 2, 1.03], [3, 3, 1.06]]) {
    const contribution = engine.calculateAsideContribution(data, basic, { asideRank: rank, asideLevel: level });
    const expectedAttack = (item.attackBase + item.attackGrowth * (level - 1)) * multiplier;
    closeTo(contribution.total[item.attackKey], expectedAttack, `${item.id}: A${rank} attack total`);
    closeTo(contribution.total.hp, (3804 + 378 * (level - 1)) * multiplier, `${item.id}: A${rank} HP total`);
    closeTo(contribution.total.pdef, (396 + 54 * (level - 1)) * multiplier, `${item.id}: A${rank} physical defense total`);
    closeTo(contribution.total.mdef, (396 + 54 * (level - 1)) * multiplier, `${item.id}: A${rank} magic defense total`);
  }

  const a1 = apostle.aside.levels['1'].effects;
  const expectedA1Stats = item.attackKey === 'patk'
    ? ['最大HP増加', '物理攻撃力増加', '会心増加', '会心ダメージ増加']
    : ['最大HP増加', '魔法攻撃力増加', '会心増加', '会心ダメージ増加'];
  for (const stat of expectedA1Stats) {
    const effect = a1.find(row => row.valueKind === stat);
    assert.ok(effect, `${item.id}: A1 self effect ${stat}`);
    assert.equal(Number(effect.fixedValue), 6, `${item.id}: A1 ${stat} value`);
    assert.equal(effect.effectTarget, '自身');
  }

  const globals = sheets.asideStatEffects.filter(row => row.id === item.id);
  const globalValues = Object.fromEntries(globals.map(row => [row.ステ能力値, Number(row['上昇%'])]));
  assert.deepEqual(globalValues, item.global, `${item.id}: A3 global stats`);
  const a3Stats = apostle.aside.levels['3'].stats;
  assert.deepEqual(Object.fromEntries(a3Stats.map(row => [row.statName, Number(row.increaseP)])), item.global,
    `${item.id}: A3 stats retained for display/runtime`);

  const a3Effects = apostle.aside.levels['3'].effects;
  for (const [target, values] of Object.entries(item.rowTargets)) {
    const targeted = a3Effects.filter(effect => effect.effectTarget === target);
    assert.deepEqual(Object.fromEntries(targeted.map(effect => [effect.valueKind, Number(effect.fixedValue)])), values,
      `${item.id}: A3 row-target battle effects`);
  }

  const status = dps.supportStatuses?.[item.libraryId]?.statuses;
  assert.ok(status, `${item.id}: existing DPS status`);
  assert.equal(status.aside, item.dpsAsideStatus, `${item.id}: skillmotion status remains the workbook's declared status`);
}

const epica = apostles.find(row => row.id === 'epica');
const epicaEffects = epica.aside.levels['2'].effects;
const epicaExtraTarget = epicaEffects.find(effect => effect.valueKind === '普通攻撃対象追加');
assert.equal(Number(epicaExtraTarget?.fixedValue), 1, 'Epica adds a target rather than doubling damage on one target');
assert.match(String(epicaExtraTarget?.condition || ''), /敵が1体.*同じ敵.*追加分.*命中/,
  'Epica one-enemy same-target hit is present in generated data');
assert.ok(epicaEffects.some(effect => effect.valueKind === '強化攻撃発動確率増加' && Number(effect.fixedValue) === 15));
assert.ok(epicaEffects.some(effect => effect.valueKind === '自分現在高学年クールタイム減少' && Number(effect.fixedValue) === 3));

const epicaShieldRows = sheets.asideSpecialEffects.filter(row => /^Epica_aside_2_e0[78]$/.test(row.effectId));
assert.equal(epicaShieldRows.length, 2, 'Epica shield value and duration remain distinct rows');
for (const row of epicaShieldRows) {
  assert.equal(row.conditionType, '状態保有', 'shield requires the protection state');
  assert.equal(row.conditionValue, '保護');
  assert.equal(String(row.triggerType || ''), '', 'lethal direct-damage event is not guessed into a trigger');
}
assert.equal(Number(byEffectId(epicaShieldRows, 'Epica_aside_2_e07')?.固定値), 46);
assert.equal(Number(byEffectId(epicaShieldRows, 'Epica_aside_2_e08')?.固定値), 8);

const belita = apostles.find(row => row.id === 'belita');
const belitaA2 = belita.aside.levels['2'].effects;
assert.ok(belitaA2.some(effect => effect.valueKind === '自分現在高学年クールタイム減少' && Number(effect.fixedValue) === 1));
assert.ok(belitaA2.some(effect => effect.valueKind === '自分現在高学年クールタイム減少' && Number(effect.fixedValue) === 2));
const extraHighUse = belitaA2.find(effect => effect.valueKind === '高学年スキル追加使用');
assert.equal(Number(extraHighUse?.fixedValue), 1, 'Belita additional high-skill use remains a discrete extra use');
assert.equal(extraHighUse?.damageModifierCategory || '', '', 'Belita extra use is not converted to a damage multiplier');

console.log(JSON.stringify({
  result: 'ok',
  apostles: definitions.map(({ id, images }) => ({ id, images: images.length })),
  asideRanks: [1, 2, 3],
  epicaSingleEnemyAdditionalHit: { count: epicaExtraTarget.fixedValue, condition: epicaExtraTarget.condition },
  epicaLethalShield: 'condition retained; event trigger not inferred',
  dpsAsideStatus: Object.fromEntries(definitions.map(item => [item.libraryId, dps.supportStatuses[item.libraryId].statuses.aside]))
}, null, 2));
