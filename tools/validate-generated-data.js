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
    'ダメージ補正区分',
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

function validateLifeJobs(value) {
  const failLifeJobs = (message) => fail(`statData.js: アルバイトデータ ${message}`);
  if (value?.schemaVersion === 5) {
    if (!Array.isArray(value.materials) || !Array.isArray(value.apostles)
      || !Array.isArray(value.resumeMaterialSlots) || Object.hasOwn(value, 'jobs')
      || Object.hasOwn(value, 'materialApostleLinks')) failLifeJobs('のschema 5が不正です');
    const materials = new Set();
    const names = new Set();
    for (const material of value.materials) {
      if (!material?.id || !material?.name || material.category !== '素材'
        || !Number.isInteger(material.itemGrade) || material.itemGrade < 1 || material.itemGrade > 5
        || materials.has(material.id) || names.has(material.name)
        || (material.imageFileName && !/^[^<>:"/\\|?*\x00-\x1f]+\.(?:png|webp)$/i.test(material.imageFileName))) {
        failLifeJobs(`素材が不正です: ${material?.name || 'unknown'}`);
      }
      materials.add(material.id);
      names.add(material.name);
    }
    const apostles = new Set();
    for (const apostle of value.apostles) {
      if (!apostle?.name || apostles.has(apostle.name)) failLifeJobs(`使徒が不正です: ${apostle?.name || 'unknown'}`);
      apostles.add(apostle.name);
    }
    const pairs = new Set();
    const positions = new Set();
    for (const slot of value.resumeMaterialSlots) {
      const pair = `${slot?.apostleName}\u0000${slot?.materialId}`;
      const position = `${slot?.apostleName}\u0000${slot?.order}`;
      if (!apostles.has(slot?.apostleName) || !materials.has(slot?.materialId)
        || typeof slot.isBest !== 'boolean' || !Number.isSafeInteger(slot.order) || slot.order < 1
        || !Array.isArray(slot.sources) || !slot.sources.length
        || slot.sources.some(source => !['job', 'rest'].includes(source))
        || new Set(slot.sources).size !== slot.sources.length
        || pairs.has(pair) || positions.has(position)) failLifeJobs(`履歴書素材が不正です: ${slot?.apostleName || 'unknown'}`);
      pairs.add(pair);
      positions.add(position);
    }
    return;
  }
  if (!value || ![2, 3, 4].includes(value.schemaVersion) || value.quantitySemantics !== 'configured_min_max_before_result_adjustment'
    || !Array.isArray(value.materials) || !Array.isArray(value.jobs)) {
    failLifeJobs('のschemaが不正です');
  }
  const materialIds = new Set();
  const materialNames = new Set();
  for (const material of value.materials) {
    if (!material?.id || !material?.name || material.category !== '素材'
      || !Number.isInteger(material.itemGrade) || material.itemGrade < 1 || material.itemGrade > 5) {
      failLifeJobs(`素材の項目が不正です: ${material?.name || material?.id || 'unknown'}`);
    }
    if (materialIds.has(material.id) || materialNames.has(material.name)) failLifeJobs(`素材ID／名称が重複しています: ${material.name}`);
    materialIds.add(material.id);
    materialNames.add(material.name);
    if (material.imageFileName && !/^[^<>:"/\\|?*\x00-\x1f]+\.(?:png|webp)$/i.test(material.imageFileName)) {
      failLifeJobs(`画像名が不正です: ${material.name}`);
    }
  }
  const jobIds = new Set();
  const expectedLinks = new Map();
  const forbidden = new Set(['参照枠', '同一系統参照回数', '設定上のスキル一致', '__sourceRow', 'sourcePath']);
  for (const job of value.jobs) {
    if (!job?.id || !job?.name || !Array.isArray(job.requiredLifeSkills)
      || !Array.isArray(job.relatedApostleNames) || !Array.isArray(job.grades)) {
      failLifeJobs(`仕事の項目が不正です: ${job?.name || job?.id || 'unknown'}`);
    }
    if (jobIds.has(job.id)) failLifeJobs(`仕事IDが重複しています: ${job.name}`);
    jobIds.add(job.id);
    if (new Set(job.requiredLifeSkills).size !== job.requiredLifeSkills.length
      || job.requiredLifeSkills.some(skill => typeof skill !== 'string' || !skill)) {
      failLifeJobs(`要求生活スキルが不正です: ${job.name}`);
    }
    const grades = new Set();
    for (const profile of job.grades) {
      if (!Number.isInteger(profile.grade) || profile.grade < 1 || profile.grade > 5 || grades.has(profile.grade)
        || !Array.isArray(profile.directRewards)) {
        failLifeJobs(`等級別報酬が不正です: ${job.name}`);
      }
      grades.add(profile.grade);
      const rewards = new Set();
      for (const reward of profile.directRewards) {
        if (!materialIds.has(reward.materialId) || !Number.isSafeInteger(reward.minQuantity)
          || !Number.isSafeInteger(reward.maxQuantity) || reward.minQuantity < 1
          || reward.maxQuantity < reward.minQuantity || rewards.has(reward.materialId)) {
          failLifeJobs(`報酬参照または数量が不正です: ${job.name} 等級${profile.grade}`);
        }
        rewards.add(reward.materialId);
      }
    }
    const names = new Set(job.relatedApostleNames);
    if (names.size !== job.relatedApostleNames.length || job.relatedApostleNames.some(name => typeof name !== 'string' || !name)) {
      failLifeJobs(`関連使徒名が重複または不正です: ${job.name}`);
    }
    for (const portrait of job.relatedApostlePortraits || []) {
      if (!names.has(portrait.name) || !portrait.assetId) failLifeJobs(`関連使徒画像の対応が不正です: ${job.name}`);
    }
    const rewardedMaterialIds = new Set(job.grades.flatMap(profile => profile.directRewards.map(reward => reward.materialId)));
    for (const apostleName of job.relatedApostleNames) {
      for (const materialId of rewardedMaterialIds) {
        const key = `${apostleName}\u0000${materialId}`;
        const linkedJobs = expectedLinks.get(key) || new Set();
        linkedJobs.add(job.id);
        expectedLinks.set(key, linkedJobs);
      }
    }
    walk(job, item => Object.keys(item).forEach(key => {
      if (forbidden.has(key)) failLifeJobs(`不要な入力列が公開データへ残っています: ${key}`);
    }));
  }
  if (!Array.isArray(value.apostles) || !Array.isArray(value.materialApostleLinks)) {
    failLifeJobs('の使徒一覧または素材逆引きがありません');
  }
  const apostlesByName = new Map();
  for (const apostle of value.apostles) {
    if (!apostle?.name || apostlesByName.has(apostle.name)) failLifeJobs(`使徒名が空または重複しています: ${apostle?.name || 'unknown'}`);
    apostlesByName.set(apostle.name, apostle);
  }
  if (value.schemaVersion >= 3) {
    if (!Array.isArray(value.resumeMaterialSlots)) failLifeJobs('の履歴書素材候補がありません');
    const slotPairs = new Set();
    const slotPositions = new Set();
    for (const slot of value.resumeMaterialSlots) {
      const pair = `${slot?.apostleName || ''}\u0000${slot?.materialId || ''}`;
      const position = value.schemaVersion === 3
        ? `${slot?.apostleName || ''}\u0000${slot?.role || ''}\u0000${slot?.order || ''}`
        : `${slot?.apostleName || ''}\u0000${slot?.order || ''}`;
      if (!slot || !apostlesByName.has(slot.apostleName) || !materialIds.has(slot.materialId)
        || (value.schemaVersion === 3 && (!['main', 'sub', 'third'].includes(slot.role) || (slot.role === 'main' && slot.order !== 1)))
        || (value.schemaVersion === 4 && (typeof slot.isBest !== 'boolean'
          || !Array.isArray(slot.sources) || !slot.sources.length
          || slot.sources.some(source => !['job', 'rest'].includes(source))
          || new Set(slot.sources).size !== slot.sources.length))
        || !Number.isSafeInteger(slot.order) || slot.order < 1
        || slotPairs.has(pair) || slotPositions.has(position)) {
        failLifeJobs(`履歴書素材候補が不正です: ${slot?.apostleName || 'unknown'}`);
      }
      slotPairs.add(pair);
      slotPositions.add(position);
    }
    if (value.schemaVersion === 3) {
      for (const slot of value.resumeMaterialSlots) {
        const previous = `${slot.apostleName}\u0000${slot.role}\u0000${slot.order - 1}`;
        if (slot.order > 1 && !slotPositions.has(previous)) {
          failLifeJobs(`履歴書素材の表示順が欠けています: ${slot.apostleName}`);
        }
      }
    }
  }
  const roleOrder = ['main', 'sub', 'other', 'unconfirmed'];
  const roleKeys = new Set(roleOrder);
  const normalizeRoles = (roles, context) => {
    if (!Array.isArray(roles) || !roles.length || roles.some(role => !roleKeys.has(role))
      || new Set(roles).size !== roles.length
      || JSON.stringify(roles) !== JSON.stringify(roleOrder.filter(role => roles.includes(role)))) {
      failLifeJobs(`生活スキル分類が不正です: ${context}`);
    }
    return roles;
  };
  const actualLinks = new Set();
  for (const link of value.materialApostleLinks) {
    const key = `${link?.apostleName || ''}\u0000${link?.materialId || ''}`;
    const expected = expectedLinks.get(key);
    if (!expected || actualLinks.has(key) || !materialIds.has(link.materialId)
      || Object.hasOwn(link, 'resumeCategory') || !Array.isArray(link.jobIds)
      || !Array.isArray(value.schemaVersion >= 3 ? link.jobSkillMatchEvidence : link.jobClassificationEvidence)) {
      failLifeJobs(`素材・使徒逆引きの項目が不正です: ${link?.apostleName || 'unknown'}`);
    }
    actualLinks.add(key);
    const expectedJobIds = [...expected].sort();
    if (JSON.stringify(link.jobIds) !== JSON.stringify(expectedJobIds)) {
      failLifeJobs(`逆引き先の仕事一覧が一致しません: ${link.apostleName}`);
    }
    const evidenceByJob = new Map();
    for (const evidence of (value.schemaVersion >= 3 ? link.jobSkillMatchEvidence : link.jobClassificationEvidence)) {
      if (!evidence?.jobId || !expected.has(evidence.jobId) || evidenceByJob.has(evidence.jobId)) {
        failLifeJobs(`仕事別分類根拠が不正です: ${link.apostleName}`);
      }
      evidenceByJob.set(evidence.jobId, normalizeRoles(evidence.categories,
        `${link.apostleName}/${evidence.jobId}`));
    }
    if (JSON.stringify([...evidenceByJob.keys()].sort()) !== JSON.stringify(expectedJobIds)) {
      failLifeJobs(`仕事別分類根拠が欠落しています: ${link.apostleName}`);
    }
    const union = roleOrder.filter(role => [...evidenceByJob.values()].some(roles => roles.includes(role)));
    const linkRoles = normalizeRoles(value.schemaVersion >= 3 ? link.lifeSkillMatchCategories : link.lifeSkillCategories,
      `${link.apostleName}/${link.materialId}`);
    if (JSON.stringify(linkRoles) !== JSON.stringify(union)) {
      failLifeJobs(`素材・使徒分類が仕事別根拠と一致しません: ${link.apostleName}`);
    }
    const apostle = apostlesByName.get(link.apostleName);
    if (!apostle) failLifeJobs(`逆引き先の使徒が使徒一覧にありません: ${link.apostleName}`);
    if (link.apostleAssetId && apostle.assetId !== link.apostleAssetId) {
      failLifeJobs(`逆引きの使徒画像IDが一致しません: ${link.apostleName}`);
    }
  }
  if (actualLinks.size !== expectedLinks.size) failLifeJobs('素材・使徒逆引きの欠落があります');
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
  validateLifeJobs(statData.sheets.lifeJobs);

  const equipmentValues = statData.sheets.equipmentValues;
  if (!equipmentValues?.length) fail('statData.js: 装備効果がありません');
  for (const row of equipmentValues) {
    if (typeof row.enhance0 !== 'number' || !Number.isFinite(row.enhance0) || row.enhance0 < 0) {
      fail(`statData.js: 装備基礎値が不正: ${row.equipName}`);
    }
    for (let level = 1; level <= 5; level += 1) {
      const multiplier = Number(row[`強化倍率+${level}`]);
      if (!Number.isFinite(multiplier) || multiplier < 1
        || !Number.isFinite(row[`enhance${level}`])
        || row[`enhance${level}`] !== row.enhance0 * multiplier) {
        fail(`statData.js: 装備倍率/小数値が不正: ${row.equipName} +${level}`);
      }
    }
  }

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
  const ayaFavoriteFlower = findEffect(apostles, 'Aya_favorite_1_e03');
  if (ayaFavoriteFlower?.attackCategory !== '無分類') {
    fail('apostles.js: アヤ愛用品の小さな雪の花が攻撃分類=無分類で生成されていません');
  }
  const ayaFavoriteFlowerStat = findEffect(statData.sheets, 'Aya_favorite_1_e03');
  if (ayaFavoriteFlowerStat?.attackCategory !== '無分類') {
    fail('statData.js: アヤ愛用品の小さな雪の花が攻撃分類=無分類で生成されていません');
  }

  const pira = apostles.find(apostle => apostle.id === 'pira');
  const piraWealth = pira?.uniqueStates?.find(state => state.stateId === 'Pira_wealth');
  if (!piraWealth || piraWealth.ownerId !== 'pira' || piraWealth.maxValue !== 30) {
    fail('apostles.js: ピラの富豪固有状態が生成されていません');
  }
  const piraWealthStat = statData.getById('uniqueStates', 'Pira_wealth');
  if (!piraWealthStat || piraWealthStat.ownerId !== 'Pira' || piraWealthStat.maxValue !== 30) {
    fail('statData.js: ピラの富豪固有状態が生成または索引化されていません');
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
    + ` lifeJobSlots=${statData.sheets.lifeJobs.resumeMaterialSlots.length} lifeJobMaterials=${statData.sheets.lifeJobs.materials.length}`
  );
}

try {
  main();
} catch (error) {
  console.error(`[ERROR] ${error.message}`);
  process.exitCode = 1;
}
