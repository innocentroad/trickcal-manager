#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_MANIFEST = path.join(__dirname, 'formation-share-asset-manifest.json');

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const options = { mode: 'check', manifestPath: DEFAULT_MANIFEST };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') {
      options.mode = 'check';
    } else if (arg === '--write') {
      options.mode = 'write';
    } else if (arg === '--manifest') {
      const value = argv[++index];
      if (!value || value.startsWith('--')) fail('--manifestの値がありません');
      options.manifestPath = path.resolve(ROOT, value);
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
    'Usage: node tools/sync-formation-share-assets.js [--check|--write] [options]',
    '',
    '  --check             参照版を検査する（既定・書込なし）',
    '  --write             内容ハッシュを参照へ反映する',
    '  --manifest PATH     管理リスト（既定: tools/formation-share-asset-manifest.json）'
  ].join('\n'));
}

function loadManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) fail(`管理リストがありません: ${manifestPath}`);
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`管理リストを読み込めません: ${error.message}`);
  }
  if (manifest?.version !== 1) fail('対応していない管理リストの版です');
  if (manifest?.hashAlgorithm !== 'sha256') fail('ハッシュ方式はsha256で固定です');
  if (manifest?.hashLength !== 16) fail('ハッシュ長は16桁で固定です');
  if (!Array.isArray(manifest.directAssets) || !manifest.directAssets.length) {
    fail('directAssetsがありません');
  }
  if (!manifest.pageVersion || !Array.isArray(manifest.derivedAssets)) {
    fail('pageVersionまたはderivedAssetsがありません');
  }
  return manifest;
}

function resolveRootPath(relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath)) {
    fail(`相対パスが不正です: ${relativePath}`);
  }
  const resolved = path.resolve(ROOT, relativePath);
  const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (resolved !== ROOT && !resolved.startsWith(rootPrefix)) {
    fail(`管理対象がリポジトリ外です: ${relativePath}`);
  }
  return resolved;
}

function normalizeText(value) {
  return value.replace(/\r\n?/g, '\n');
}

function hashText(value, hashLength = 16) {
  return crypto.createHash('sha256')
    .update(normalizeText(value), 'utf8')
    .digest('hex')
    .slice(0, hashLength);
}

function readText(relativePath) {
  const filePath = resolveRootPath(relativePath);
  if (!fs.existsSync(filePath)) fail(`管理対象ファイルがありません: ${relativePath}`);
  return fs.readFileSync(filePath, 'utf8');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceVersionedReferences(text, relativePath, version, ownerLabel) {
  const expression = new RegExp(`(${escapeRegExp(relativePath)}\\?v=)[A-Za-z0-9._-]+`, 'g');
  let count = 0;
  const replaced = text.replace(expression, (_match, prefix) => {
    count += 1;
    return prefix + version;
  });
  if (!count) fail(`${ownerLabel}に${relativePath}?v=の参照がありません`);
  return replaced;
}

function replaceConstant(text, constantName, version, ownerLabel) {
  const expression = new RegExp(`(${escapeRegExp(constantName)}\\s*=\\s*['"])[^'"]*(['"])`, 'g');
  let count = 0;
  const replaced = text.replace(expression, (_match, prefix, suffix) => {
    count += 1;
    return prefix + version + suffix;
  });
  if (count !== 1) fail(`${ownerLabel}の${constantName}参照数が${count}件です`);
  return replaced;
}

function collectTargetPaths(manifest) {
  const paths = new Set();
  const addReferences = entry => (entry.references || []).forEach(relativePath => paths.add(relativePath));
  manifest.directAssets.forEach(addReferences);
  addReferences(manifest.pageVersion);
  manifest.derivedAssets.forEach(addReferences);
  paths.add(manifest.pageVersion.path);
  paths.add(manifest.pageVersion.constantFile);
  manifest.directAssets.forEach(entry => paths.add(entry.path));
  manifest.derivedAssets.forEach(entry => paths.add(entry.path));
  return paths;
}

function buildSyncPlan(manifest = loadManifest(DEFAULT_MANIFEST)) {
  const texts = new Map([...collectTargetPaths(manifest)].map(relativePath => [relativePath, readText(relativePath)]));
  const planned = new Map(texts);
  const directVersions = {};

  function updateReferences(relativePath, assetPath, version, label) {
    const current = planned.get(relativePath);
    planned.set(relativePath, replaceVersionedReferences(current, assetPath, version, label));
  }

  for (const asset of manifest.directAssets) {
    const version = hashText(readText(asset.path), manifest.hashLength);
    directVersions[asset.id] = version;
    for (const target of asset.references) {
      updateReferences(target, asset.path, version, `${asset.id} -> ${target}`);
    }
  }

  const page = manifest.pageVersion;
  const pageVersion = hashText(planned.get(page.path), manifest.hashLength);
  planned.set(
    page.constantFile,
    replaceConstant(planned.get(page.constantFile), page.constantName, pageVersion, page.constantFile)
  );
  for (const target of page.references) {
    updateReferences(target, page.path, pageVersion, `${page.id} -> ${target}`);
  }

  const derivedVersions = {};
  const createAsset = manifest.derivedAssets.find(entry => entry.id === 'formation-share-create');
  if (!createAsset) fail('derivedAssetsにformation-share-createがありません');
  const createVersion = hashText(planned.get(createAsset.path), manifest.hashLength);
  derivedVersions[createAsset.id] = createVersion;
  for (const target of createAsset.references) {
    updateReferences(target, createAsset.path, createVersion, `${createAsset.id} -> ${target}`);
  }

  const appCacheAsset = manifest.derivedAssets.find(entry => entry.id === 'app-cache');
  if (!appCacheAsset) fail('derivedAssetsにapp-cacheがありません');
  const appCacheVersion = hashText(planned.get(appCacheAsset.path), manifest.hashLength);
  derivedVersions[appCacheAsset.id] = appCacheVersion;
  for (const target of appCacheAsset.references) {
    updateReferences(target, appCacheAsset.path, appCacheVersion, `${appCacheAsset.id} -> ${target}`);
  }

  const changedFiles = [...planned.keys()].filter(relativePath => planned.get(relativePath) !== texts.get(relativePath));
  return {
    texts,
    planned,
    changedFiles,
    directVersions,
    pageVersion,
    derivedVersions
  };
}

function writeText(relativePath, content) {
  const filePath = resolveRootPath(relativePath);
  const temporaryPath = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.tmp`);
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
  const manifest = loadManifest(options.manifestPath);
  const plan = buildSyncPlan(manifest);
  if (options.mode === 'check') {
    if (plan.changedFiles.length) {
      console.error('[ERROR] 共有資材の内容ハッシュ参照が古いか不足しています。--writeで同期できます。');
      plan.changedFiles.forEach(relativePath => console.error(`  ${relativePath}`));
      process.exitCode = 1;
      return;
    }
    console.log(`OK: 共有資材の内容ハッシュ参照が一致しました（${plan.pageVersion}）`);
    return;
  }
  plan.changedFiles.forEach(relativePath => writeText(relativePath, plan.planned.get(relativePath)));
  console.log(plan.changedFiles.length
    ? `OK: 共有資材の内容ハッシュを同期しました（${plan.changedFiles.length}ファイル）`
    : 'OK: 共有資材の内容ハッシュは同期済みです（変更なし）');
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  buildSyncPlan,
  hashText,
  loadManifest,
  main,
  normalizeText,
  replaceConstant,
  replaceVersionedReferences
};
