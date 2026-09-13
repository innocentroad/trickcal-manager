#!/usr/bin/env node
'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const displayDataPath = path.join(root, 'formation-share-display-data.js');
const catalog = require(path.join(root, 'formation-share-catalog.js'));
const manifest = require(path.join(__dirname, 'formation-share-asset-manifest.json'));
const {
  buildDisplayData,
  renderDisplayData
} = require(path.join(__dirname, 'generate-formation-share-display-data.js'));
const {
  assertPrefix,
  main: checkCatalog,
  normalizeCatalogLists
} = require(path.join(__dirname, 'sync-formation-share-catalog.js'));
const { buildSyncPlan } = require(path.join(__dirname, 'sync-formation-share-assets.js'));

function parseArgs(argv) {
  const options = {
    baseCatalogPath: String(process.env.TRICKCAL_SHARE_BASE_CATALOG || '').trim()
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-catalog') {
      const value = argv[++index];
      if (!value || value.startsWith('--')) throw new Error('--base-catalogの値がありません');
      options.baseCatalogPath = value;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`不明な引数です: ${arg}`);
    }
  }
  return options;
}

function printHelp() {
  console.log([
    'Usage: node tools/validate-formation-share-maintenance.js [options]',
    '',
    '  --base-catalog PATH  比較元共有辞書を明示する（Gitの親コミットを使う場合は省略）'
  ].join('\n'));
}

function normalizeText(value) {
  return value.replace(/\r\n?/g, '\n');
}

function runCheck(label, callback, failures) {
  try {
    callback();
  } catch (error) {
    failures.push(`${label}: ${error.message}`);
  }
}

function checkDisplayData() {
  if (!fs.existsSync(displayDataPath)) throw new Error('formation-share-display-data.jsがありません');
  const current = fs.readFileSync(displayDataPath, 'utf8');
  const expected = renderDisplayData(buildDisplayData({ checkImages: true }));
  if (normalizeText(current) !== normalizeText(expected)) {
    throw new Error('生成済み共有表示データがstatData.js/cards.jsと一致しません');
  }
}

function getBaseRef() {
  const configured = String(process.env.TRICKCAL_SHARE_BASE_REF || '').trim();
  if (configured) return configured;
  const eventName = String(process.env.GITHUB_EVENT_NAME || '').trim();
  if (eventName === 'push') {
    const before = String(process.env.GITHUB_EVENT_BEFORE || '').trim();
    if (before) return before;
  }
  if (eventName === 'workflow_dispatch') {
    try {
      return execFileSync('git', ['rev-parse', 'HEAD^'], { cwd: root, encoding: 'utf8' }).trim();
    } catch (error) {
      throw new Error(`比較元コミットを取得できません: ${error.message}`);
    }
  }
  return 'HEAD';
}

function assertSafeGitRef(ref) {
  if (!/^(?:HEAD(?:~[0-9]+)?|[0-9a-f]{7,64})$/.test(ref)) {
    throw new Error(`比較元コミットの指定が不正です: ${ref}`);
  }
}

function loadCatalogSource(source, label) {
  if (label.toLowerCase().endsWith('.json')) {
    try {
      const parsed = JSON.parse(source);
      return parsed.lists || parsed;
    } catch (error) {
      throw new Error(`比較元共有辞書を読み込めません: ${error.message}`);
    }
  }
  const context = {};
  vm.createContext(context);
  try {
    vm.runInContext(`${source}\n;globalThis.__catalog = globalThis.TRICKCAL_FORMATION_SHARE_CATALOG;`, context, {
      filename: label,
      timeout: 30_000
    });
  } catch (error) {
    throw new Error(`比較元共有辞書を読み込めません: ${error.message}`);
  }
  return context.__catalog;
}

function checkCatalogHistory(options) {
  if (options.baseCatalogPath) {
    const basePath = path.resolve(root, options.baseCatalogPath);
    if (!fs.existsSync(basePath)) throw new Error(`比較元共有辞書がありません: ${basePath}`);
    const source = fs.readFileSync(basePath, 'utf8');
    const baseCatalog = loadCatalogSource(source, basePath.toLowerCase().endsWith('.json') ? basePath : `catalog:${basePath}`);
    assertPrefix(
      normalizeCatalogLists(baseCatalog, `base:${basePath}`),
      normalizeCatalogLists(catalog, 'current catalog'),
      `比較元catalog:${basePath}`
    );
    return;
  }
  const baseRef = getBaseRef();
  assertSafeGitRef(baseRef);
  let source;
  try {
    source = execFileSync('git', ['show', `${baseRef}:formation-share-catalog.js`], {
      cwd: root,
      encoding: 'utf8'
    });
  } catch (error) {
    throw new Error(`比較元コミットの共有辞書を取得できません（${baseRef}）: ${error.message}`);
  }
  const baseCatalog = loadCatalogSource(source, `catalog:${baseRef}`);
  assertPrefix(
    normalizeCatalogLists(baseCatalog, `base:${baseRef}`),
    normalizeCatalogLists(catalog, 'current catalog'),
    `比較元catalog:${baseRef}`
  );
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    printHelp();
    return true;
  }
  const failures = [];
  runCheck('共有辞書', () => checkCatalog(['--check']), failures);
  runCheck('共有辞書の履歴', () => checkCatalogHistory(options), failures);
  runCheck('共有表示データ', checkDisplayData, failures);
  runCheck('共有資材版', () => {
    const plan = buildSyncPlan(manifest);
    if (plan.changedFiles.length) {
      throw new Error(`内容ハッシュ参照が未同期です: ${plan.changedFiles.join(', ')}`);
    }
  }, failures);

  if (failures.length) {
    console.error('[ERROR] 編成共有の公開前検査に失敗しました。');
    failures.forEach(message => console.error(`  ${message}`));
    process.exitCode = 1;
    return false;
  }
  console.log(`OK: 編成共有の公開前検査に成功しました（apostles=${catalog.apostles.length}）`);
  return true;
}

if (require.main === module) main();

module.exports = { checkDisplayData, main, normalizeText };
