#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function fail(message) {
  throw new Error(message);
}

function loadGenerated(fileName, expression) {
  const filePath = path.join(ROOT, fileName);
  const source = fs.readFileSync(filePath, 'utf8');
  if (/ã‚|ãƒ|ä½¿å¾’|åŠ¹æžœ/.test(source)) {
    fail(`${fileName}: UTF-8文字列が文字化けしている可能性があります`);
  }
  const context = { console };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(`${source}\n;globalThis.__validationExport = (${expression});`, context, {
    filename: filePath,
    timeout: 30_000,
  });
  return context.__validationExport;
}

function walk(value, visitor, pathParts = []) {
  if (!value || typeof value !== 'object') return;
  visitor(value, pathParts);
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visitor, [...pathParts, index]));
    return;
  }
  Object.entries(value).forEach(([key, item]) => walk(item, visitor, [...pathParts, key]));
}

function countStructuredEffects(value) {
  let count = 0;
  walk(value, (item) => {
    if (item.effectId && (
      item.processGroupId
      || item.triggerSourceId
      || item.conditionType
      || item.conditionValue
    )) count += 1;
  });
  return count;
}

function rejectRawHeaders(value, label) {
  const forbidden = new Set([
    '効果処理グループID', '処理順', '発動条件種別', '発動条件値',
    '発動元ID', '適用条件種別', '適用条件値',
  ]);
  const hits = [];
  walk(value, (item, pathParts) => {
    Object.keys(item).forEach((key) => {
      if (forbidden.has(key)) hits.push(`${pathParts.join('.')}.${key}`);
    });
  });
  if (hits.length) fail(`${label}: 未変換の日本語列が残っています: ${hits.slice(0, 5).join(', ')}`);
}

function findEffect(value, effectId) {
  let found = null;
  walk(value, (item) => {
    if (!found && item.effectId === effectId) found = item;
  });
  return found;
}

function main() {
  const apostles = loadGenerated('apostles.js', 'APOSTLE_LIBRARY');
  const cardData = loadGenerated('cards.js', `({
    library: CARD_LIBRARY,
    randomDefinitions: typeof CARD_RANDOM_DEFINITIONS === 'undefined' ? {} : CARD_RANDOM_DEFINITIONS,
    effectAliases: typeof CARD_EFFECT_ID_ALIASES === 'undefined' ? {} : CARD_EFFECT_ID_ALIASES
  })`);
  const cards = cardData.library;
  const statData = loadGenerated('statData.js', 'TRICKCAL_STAT_DATA');

  if (!Array.isArray(apostles) || apostles.length < 70) fail('apostles.js: 使徒件数が不足しています');
  if (!Array.isArray(cards?.artifacts) || !Array.isArray(cards?.spells)) fail('cards.js: カード配列がありません');
  if ((cards.artifacts.length + cards.spells.length) < 80) fail('cards.js: カード件数が不足しています');
  if (!statData?.sheets || !statData?.indexes) fail('statData.js: sheets/indexesがありません');

  rejectRawHeaders(apostles, 'apostles.js');
  rejectRawHeaders(cards, 'cards.js');

  const structuredApostleEffects = countStructuredEffects(apostles);
  const structuredStatEffects = countStructuredEffects(statData.sheets);
  if (structuredApostleEffects < 100) fail(`apostles.js: 新書式効果が少なすぎます (${structuredApostleEffects})`);
  if (structuredStatEffects < 100) fail(`statData.js: 新書式効果が少なすぎます (${structuredStatEffects})`);

  const ayaCharge = findEffect(apostles, 'Aya_aside_2_e01');
  if (!ayaCharge?.processGroupId || !ayaCharge?.triggerType) {
    fail('apostles.js: アヤA2の処理グループまたは発動条件が生成されていません');
  }

  const cardEffects = [...cards.artifacts, ...cards.spells]
    .flatMap(card => card.conditionalEffects || []);
  if (cardEffects.length < 70) fail(`cards.js: カード特殊効果が少なすぎます (${cardEffects.length})`);
  const unresolvedRandomIds = cardEffects
    .map(effect => effect.randomId)
    .filter(randomId => randomId && !cardData.randomDefinitions[randomId]);
  if (unresolvedRandomIds.length) {
    fail(`cards.js: 未解決のrandomIdがあります: ${[...new Set(unresolvedRandomIds)].join(', ')}`);
  }
  const aliceHpRandom = cardData.randomDefinitions.spell_alice_fake_magic_hp;
  if (!aliceHpRandom || Object.keys(aliceHpRandom.stages || {}).length !== 5) {
    fail('cards.js: アリススペルHP乱数の★別設定が生成されていません');
  }
  const viviStack = cardEffects.find(effect => effect.id === 'artifact_vivi_silver_staff_e01');
  if (!viviStack?.effectStack || viviStack.maxStack !== 20) {
    fail('cards.js: ヴィヴィ遺物のスタック設定が生成されていません');
  }
  if (cardEffects.some(effect => effect.id === 'artifact_vivi_silver_staff_e02')) {
    fail('cards.js: 統合前の最大スタック専用行が残っています');
  }

  console.log(
    `OK: apostles=${apostles.length} cards=${cards.artifacts.length + cards.spells.length}`
    + ` cardEffects=${cardEffects.length} randomDefinitions=${Object.keys(cardData.randomDefinitions).length}`
    + ` structuredEffects(apostles/statData)=${structuredApostleEffects}/${structuredStatEffects}`
  );
}

try {
  main();
} catch (error) {
  console.error(`[ERROR] ${error.message}`);
  process.exitCode = 1;
}
