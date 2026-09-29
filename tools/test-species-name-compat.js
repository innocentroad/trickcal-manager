#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const legacyText = '？？？';
const mysticText = 'ミスティック';
const data = {
  sheets: {
    basicInfo: [
      { id: 'old', 種族: legacyText, 備考: `${legacyText}は種族名ではない` },
      { id: 'new', 種族: mysticText },
      { id: 'other', 種族: '未登録種族' }
    ],
    research: [
      { id: 1, 種族: legacyText, ステータス: '物理攻撃力', 増加値: 2 },
      { id: 2, 種族: mysticText, ステータス: '物理攻撃力', 増加値: 3 },
      { id: 3, 種族: '未登録種族', ステータス: '物理攻撃力', 増加値: 100 },
      { id: 4, 種族: '', 内容: `説明文中の${legacyText}` }
    ]
  }
};
const runtime = { window: { TRICKCAL_STAT_DATA: data } };
vm.createContext(runtime);
vm.runInContext(fs.readFileSync(path.join(root, 'synergy.js'), 'utf8'), runtime);

const species = runtime.window.TRICKCAL_SPECIES;
assert.equal(species.normalizeName(legacyText), mysticText);
assert.equal(species.normalizeName(mysticText), mysticText);
assert.equal(species.normalizeName('未登録種族'), '未登録種族');
assert.equal(species.normalizeName(null), null);
assert.equal(data.sheets.basicInfo[0].種族, mysticText);
assert.equal(data.sheets.basicInfo[0].備考, `${legacyText}は種族名ではない`);
assert.equal(data.sheets.basicInfo[2].種族, '未登録種族');
assert.equal(data.sheets.research[0].種族, mysticText);
assert.equal(data.sheets.research[3].内容, `説明文中の${legacyText}`);

const iconPath = species.iconPath(mysticText);
assert.equal(species.iconPath(legacyText), iconPath, '旧名と新名は同じ既存画像へ解決');
assert.equal(iconPath, 'img/種族_？？？.webp', '追跡済み画像名を維持');
assert.ok(fs.existsSync(path.join(root, iconPath)), `種族画像が実在する: ${iconPath}`);
assert.equal(species.iconPath('未登録種族'), '', '未知値の画像URLを生成しない');

const raceSynergies = runtime.window.RACE_SYNERGIES.filter(item => item.name === mysticText);
assert.equal(raceSynergies.length, 1, '新旧名称のシナジーを二重登録しない');
assert.equal(raceSynergies[0].id, 'unknown', '既存の安定IDを維持');

const oldGenerated = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'statData.js'), 'utf8'), oldGenerated);
const generatedData = oldGenerated.window.TRICKCAL_STAT_DATA;
assert.ok(generatedData.sheets.basicInfo.some(row => row.使徒名 === 'ヨミ' && row.種族 === mysticText),
  '現行生成データは新しい種族表記を出力');
vm.runInNewContext(fs.readFileSync(path.join(root, 'synergy.js'), 'utf8'), oldGenerated);
const generatedBasicRows = generatedData.sheets.basicInfo;
const generatedResearchRows = generatedData.sheets.research;
assert.equal(generatedBasicRows.find(row => row.使徒名 === 'ヨミ')?.種族, mysticText);
assert.equal(generatedBasicRows.some(row => row.種族 === legacyText), false);
assert.equal(generatedResearchRows.some(row => row.種族 === legacyText), false);

const apostleRuntime = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'apostles.js'), 'utf8'), apostleRuntime);
vm.runInNewContext(fs.readFileSync(path.join(root, 'synergy.js'), 'utf8'), apostleRuntime);
apostleRuntime.window.library = vm.runInNewContext('APOSTLE_LIBRARY', apostleRuntime);
assert.equal(apostleRuntime.window.library.find(row => row.id === 'yomi')?.basic?.race, mysticText,
  '旧使徒ライブラリの種族欄も実行時に正規化');

const source = fs.readFileSync(path.join(root, 'formation-damage-calc.js'), 'utf8');
const start = source.indexOf('  function collectSynergyCounts(formation, state = {}) {');
const end = source.indexOf('\n  function applyPersonalityExtraCounts', start);
assert.ok(start >= 0 && end > start, '計算画面の種族集計関数を特定');
const apostles = new Map([
  ['old', { id: 'old', 種族: legacyText, 性格: '純粋' }],
  ['new', { id: 'new', 種族: mysticText, 性格: '純粋' }],
  ['other', { id: 'other', 種族: '未登録種族', 性格: '純粋' }]
]);
const counter = {
  normalizeSpeciesName: species.normalizeName,
  getApostle: id => apostles.get(id),
  formationPersonality: { resolveFormationPersonality: basic => ({ effectivePersonality: basic.性格 }) },
  applyPersonalityExtraCounts() {}
};
vm.createContext(counter);
vm.runInContext(`${source.slice(start, end)}\nthis.collect = collectSynergyCounts;`, counter);
const counts = counter.collect({ rows: [{ apostles: ['old', 'new', 'other'] }] });
assert.equal(counts.race[mysticText], 2, '旧名と新名の編成員を同じ種族として一度ずつ集計');
assert.equal(counts.race[legacyText], undefined, '旧名の別集計を作らない');
assert.equal(counts.race['未登録種族'], 1, '未知値はそのまま別扱い');

console.log('species name compatibility: OK');
