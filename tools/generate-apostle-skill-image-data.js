#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_IMAGE_DIR = path.join(ROOT, 'img', 'Chara', 'Skill');
const DEFAULT_OUTPUT = path.join(ROOT, 'apostle-skill-image-data.js');

function fail(message) {
  throw new Error(message);
}

function buildImageData(imageDir = DEFAULT_IMAGE_DIR) {
  if (!fs.existsSync(imageDir) || !fs.statSync(imageDir).isDirectory()) {
    fail(`使徒スキル画像フォルダがありません: ${imageDir}`);
  }
  const files = fs.readdirSync(imageDir).filter(file => file.endsWith('.webp')).sort();
  const result = {};
  const assign = (assetId, kind, relativePath, prefer = false) => {
    if (!assetId) return;
    result[assetId] ||= {};
    if (prefer || !result[assetId][kind]) result[assetId][kind] = relativePath;
  };
  for (const file of files) {
    let match = file.match(/^Skill_P_(.+)\.webp$/);
    if (match) {
      assign(match[1], 'passive', `img/Chara/Skill/${file}`);
      continue;
    }
    match = file.match(/^Skill_F_(.+)\.webp$/);
    if (match) {
      assign(match[1], 'low', `img/Chara/Skill/${file}`, true);
      continue;
    }
    match = file.match(/^Icon_AdmissionSkill_(.+)\.webp$/);
    if (match) {
      assign(match[1], 'low', `img/Chara/Skill/${file}`);
      continue;
    }
    match = file.match(/^Skill_S_(.+)\.webp$/);
    if (match) {
      assign(match[1], 'high', `img/Chara/Skill/${file}`, true);
      continue;
    }
    match = file.match(/^Icon_GraduateSkill_(.+)\.webp$/);
    if (match) assign(match[1], 'high', `img/Chara/Skill/${file}`);
  }
  return Object.fromEntries(Object.entries(result)
    .sort(([left], [right]) => left.localeCompare(right, 'en'))
    .map(([assetId, images]) => [assetId, Object.fromEntries(
      Object.entries(images).sort(([left], [right]) => left.localeCompare(right, 'en'))
    )]));
}

function renderSource(imageData) {
  return `(() => {\n  'use strict';\n  const imageData = Object.freeze(${JSON.stringify(imageData, null, 2)});\n  if (typeof globalThis !== 'undefined') globalThis.TRICKCAL_APOSTLE_SKILL_IMAGE_DATA = imageData;\n  if (typeof module !== 'undefined' && module.exports) module.exports = imageData;\n})();\n`;
}

function parseArgs(argv) {
  const options = { imageDir: DEFAULT_IMAGE_DIR, outputPath: DEFAULT_OUTPUT, check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--image-dir' || arg === '--output') {
      const value = argv[++index];
      if (!value || value.startsWith('--')) fail(`${arg}の値がありません`);
      options[arg === '--image-dir' ? 'imageDir' : 'outputPath'] = path.resolve(ROOT, value);
    } else if (arg === '--check') {
      options.check = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      fail(`不明な引数です: ${arg}`);
    }
  }
  return options;
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log('Usage: node tools/generate-apostle-skill-image-data.js [--image-dir PATH] [--output PATH] [--check]');
    return;
  }
  const output = renderSource(buildImageData(options.imageDir));
  if (options.check) {
    if (!fs.existsSync(options.outputPath) || fs.readFileSync(options.outputPath, 'utf8') !== output) {
      fail(`生成済み使徒スキル画像表が最新ではありません: ${options.outputPath}`);
    }
  } else {
    fs.writeFileSync(options.outputPath, output, 'utf8');
  }
  console.log(`${options.check ? '確認' : '生成'}しました: ${path.relative(ROOT, options.outputPath)}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { buildImageData, renderSource, parseArgs };
