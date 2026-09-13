#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_OUTPUT = path.join(ROOT, 'formation-share-display-data.js');
const IMAGE_HASH_LENGTH = 16;

const APOSTLE_IMAGE_ALIASES = {
  ED: 'Ed',
  Rudd: 'Rude',
  Sion: 'Xion',
  sion: 'Xion',
  xion: 'Xion',
  Shady: 'Shaydi',
  Lazy: 'Layze',
  Razy: 'Layze',
  Reizy: 'Layze'
};

const COMMON_SHARE_ASSETS = [
  'img/Grade_on.webp',
  'img/Grade_off.webp',
  'img/Card/cost.webp',
  'img/Card/Card_Signature.webp',
  'img/Card/Card_Legendary.webp',
  'img/Card/Card_Unique.webp',
  'img/Card/Card_Rare.webp',
  'img/性格_純粋.webp',
  'img/性格_冷静.webp',
  'img/性格_狂気.webp',
  'img/性格_活発.webp',
  'img/性格_憂鬱.webp',
  'img/HP.webp',
  'img/物理攻撃力.webp',
  'img/魔法攻撃力.webp',
  'img/物理防御力.webp',
  'img/魔法防御力.webp',
  'img/会心.webp',
  'img/会心ダメージ.webp',
  'img/会心抵抗.webp',
  'img/会心DMG抵抗.webp',
  'img/SP回復.webp'
];

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const options = { outputPath: DEFAULT_OUTPUT, checkImages: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--output') {
      const value = argv[++index];
      if (!value || value.startsWith('--')) fail('--outputの値がありません');
      options.outputPath = path.resolve(ROOT, value);
    } else if (arg === '--check-images') {
      options.checkImages = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      fail(`不明な引数です: ${arg}`);
    }
  }
  return options;
}

function printHelp() {
  console.log([
    'Usage: node tools/generate-formation-share-display-data.js [options]',
    '',
    '  --output PATH       出力先（既定: formation-share-display-data.js）',
    '  --check-images      画像ファイルの存在も確認して警告する',
  ].join('\n'));
}

function loadGenerated(fileName, expression) {
  const filePath = path.join(ROOT, fileName);
  if (!fs.existsSync(filePath)) fail(`生成データがありません: ${fileName}`);
  const source = fs.readFileSync(filePath, 'utf8');
  const context = { console };
  context.window = context;
  vm.createContext(context);
  try {
    vm.runInContext(`${source}\n;globalThis.__shareDisplayValue = (${expression});`, context, {
      filename: filePath,
      timeout: 30_000,
    });
  } catch (error) {
    fail(`${fileName}を読み込めません: ${error.message}`);
  }
  return context.__shareDisplayValue;
}

function requiredString(value, label) {
  if (typeof value !== 'string' || !value.trim()) fail(`${label}がありません`);
  return value;
}

function requiredNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) fail(`${label}が不正です`);
  return number;
}

function getContentHash(filePath) {
  return crypto.createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex')
    .slice(0, IMAGE_HASH_LENGTH);
}

function getImagePath(relativePath, label, options, missingImages) {
  const absolutePath = path.join(ROOT, relativePath.replaceAll('/', path.sep));
  if (!fs.existsSync(absolutePath)) {
    missingImages.push(`${label}: ${relativePath}`);
    return relativePath;
  }
  return `${relativePath}?v=${getContentHash(absolutePath)}`;
}

function buildDisplayData(options) {
  const statData = loadGenerated('statData.js', 'TRICKCAL_STAT_DATA');
  const cards = loadGenerated('cards.js', `({
    artifacts: typeof CARD_LIBRARY === 'undefined' ? [] : (CARD_LIBRARY.artifacts || []),
    spells: typeof CARD_LIBRARY === 'undefined' ? [] : (CARD_LIBRARY.spells || [])
  })`);
  const basicInfo = statData?.sheets?.basicInfo;
  const powers = statData?.sheets?.masterPowers;
  if (!Array.isArray(basicInfo)) fail('statData.js: basicInfoがありません');
  if (!Array.isArray(powers)) fail('statData.js: masterPowersがありません');
  if (!Array.isArray(cards.artifacts) || !Array.isArray(cards.spells)) fail('cards.js: カード配列がありません');

  const missingImages = [];
  const apostles = {};
  for (const row of basicInfo) {
    const id = requiredString(row?.id, '使徒ID');
    const name = requiredString(row?.使徒名, `${id}の使徒名`);
    const personality = requiredString(row?.性格, `${id}の性格`);
    const imageFile = `${APOSTLE_IMAGE_ALIASES[id] || id}.webp`;
    apostles[id] = {
      name,
      personality,
      position: typeof row?.配置列 === 'string' ? row.配置列 : '',
      role: typeof row?.役割 === 'string' ? row.役割 : '',
      imagePath: getImagePath(`img/Chara/${imageFile}`, `${id}の画像`, options, missingImages)
    };
  }

  function buildCards(rows, kind) {
    const result = {};
    for (const card of rows) {
      const id = requiredString(card?.id, `${kind}ID`);
      const name = requiredString(card?.name, `${id}のカード名`);
      const rarity = requiredString(card?.rarity, `${id}のレア度`);
      const cost = requiredNumber(card?.cost, `${id}のコスト`);
      const imageFile = card.imageFile || `${name}.webp`;
      result[id] = {
        name,
        rarity,
        cost,
        ...(Array.isArray(card.costByStar) && card.costByStar.length
          ? { costByStar: card.costByStar.map((value, index) => requiredNumber(value, `${id}の★${index + 1}コスト`)) }
          : {}),
        ...(card.signature ? { signature: true } : {}),
        ...(card.favoriteCharacter ? { favoriteCharacter: String(card.favoriteCharacter) } : {}),
        kind,
        imagePath: getImagePath(
          `img/Card/${kind === 'spell' ? 'Spell' : 'Artifact'}/${imageFile}`,
          `${id}の画像`,
          options,
          missingImages
        )
      };
    }
    return result;
  }

  const artifactMap = buildCards(cards.artifacts, 'artifact');
  const spellMap = buildCards(cards.spells, 'spell');
  const masterPowers = {};
  for (const power of powers) {
    const id = requiredString(power?.id, '権能ID');
    const name = requiredString(power?.権能名, `${id}の権能名`);
    const cost = requiredNumber(power?.コスト ?? 30, `${id}のコスト`);
    masterPowers[id] = {
      name,
      cost,
      imagePath: getImagePath(`img/Card/権能_${name}.webp`, `${id}の画像`, options, missingImages)
    };
  }

  const assets = {};
  for (const relativePath of COMMON_SHARE_ASSETS) {
    assets[relativePath] = getImagePath(relativePath, `共有共通画像 ${relativePath}`, options, missingImages);
  }

  if (options.checkImages && missingImages.length) {
    console.warn(`[WARN] 共有表示用画像が${missingImages.length}件見つかりません。`);
    missingImages.slice(0, 12).forEach(item => console.warn(`[WARN] ${item}`));
    if (missingImages.length > 12) console.warn(`[WARN] その他${missingImages.length - 12}件`);
  }
  return {
    version: 1,
    apostles,
    artifacts: artifactMap,
    spells: spellMap,
    masterPowers,
    assets,
    sourceCounts: {
      apostles: Object.keys(apostles).length,
      artifacts: Object.keys(artifactMap).length,
      spells: Object.keys(spellMap).length,
      masterPowers: Object.keys(masterPowers).length
    }
  };
}

function renderDisplayData(data) {
  return [
    '// Trickcal Manager - Formation share display data (generated)',
    '// Source: statData.js and cards.js. Do not edit this file by hand.',
    '',
    `const FORMATION_SHARE_DISPLAY_DATA = ${JSON.stringify(data, null, 2)};`,
    '',
    'if (typeof globalThis !== \'undefined\') {',
    '  globalThis.TRICKCAL_FORMATION_SHARE_DISPLAY_DATA = FORMATION_SHARE_DISPLAY_DATA;',
    '}',
    "if (typeof module !== 'undefined' && module.exports) module.exports = FORMATION_SHARE_DISPLAY_DATA;",
    ''
  ].join('\n');
}

function writeOutput(filePath, content) {
  const directory = path.dirname(filePath);
  const temporaryPath = path.join(directory, `.${path.basename(filePath)}.${process.pid}.tmp`);
  fs.writeFileSync(temporaryPath, content, 'utf8');
  try {
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    if (error.code !== 'EEXIST' && error.code !== 'EPERM') throw error;
    fs.rmSync(filePath, { force: true });
    fs.renameSync(temporaryPath, filePath);
  }
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    printHelp();
    return;
  }
  const data = buildDisplayData(options);
  writeOutput(options.outputPath, renderDisplayData(data));
  console.log(`OK: 共有表示データを生成しました（${Object.entries(data.sourceCounts).map(([key, value]) => `${key}=${value}`).join(', ')}）`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { buildDisplayData, main, renderDisplayData };
