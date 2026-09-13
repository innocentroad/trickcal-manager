#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_CATALOG = path.join(ROOT, 'formation-share-catalog.js');
const DEFAULT_FIXTURE = path.join(ROOT, 'tools', 'fixtures', 'formation-share-catalog-v1.json');
const KINDS = ['apostles', 'artifacts', 'spells', 'masterPowers'];
const CATALOG_VERSION = 1;

function fail(message) {
  const error = new Error(message);
  error.code = 'CATALOG_CHECK_FAILED';
  throw error;
}

function parseArgs(argv) {
  const options = {
    mode: 'check',
    catalogPath: DEFAULT_CATALOG,
    fixturePath: DEFAULT_FIXTURE,
    baseCatalogPath: '',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') options.mode = 'check';
    else if (arg === '--write') options.mode = 'write';
    else if (arg === '--catalog') options.catalogPath = resolvePath(argv[++index], '--catalog');
    else if (arg === '--fixture') options.fixturePath = resolvePath(argv[++index], '--fixture');
    else if (arg === '--base-catalog') options.baseCatalogPath = resolvePath(argv[++index], '--base-catalog');
    else if (arg === '--help' || arg === '-h') options.help = true;
    else fail(`不明な引数です: ${arg}`);
  }
  return options;
}

function resolvePath(value, optionName) {
  if (!value || value.startsWith('--')) fail(`${optionName} の値がありません`);
  return path.resolve(ROOT, value);
}

function printHelp() {
  console.log([
    'Usage: node tools/sync-formation-share-catalog.js [--check|--write]',
    '',
    '  --check          生成データと共有辞書を照合する（既定）',
    '  --write          不足IDだけを各配列の末尾へ追加して照合する',
    '  --catalog PATH   対象catalog.js（Manager rootからの相対パス）',
    '  --fixture PATH   公開済み番号fixture（既定: tools/fixtures/formation-share-catalog-v1.json）',
    '  --base-catalog PATH  比較元catalog.js。指定時は公開済み番号のprefixを検査する',
  ].join('\n'));
}

function loadCatalog(filePath) {
  if (!fs.existsSync(filePath)) fail(`共有辞書がありません: ${filePath}`);
  const resolved = require.resolve(filePath);
  delete require.cache[resolved];
  const catalog = require(resolved);
  if (!catalog || Number(catalog.version) !== CATALOG_VERSION) {
    fail(`共有辞書版が不正です（${filePath}）`);
  }
  return catalog;
}

function loadGenerated(fileName, expression) {
  const filePath = path.join(ROOT, fileName);
  if (!fs.existsSync(filePath)) fail(`生成データがありません: ${fileName}`);
  const source = fs.readFileSync(filePath, 'utf8');
  const context = { console };
  context.window = context;
  vm.createContext(context);
  try {
    vm.runInContext(`${source}\n;globalThis.__shareCatalogValue = (${expression});`, context, {
      filename: filePath,
      timeout: 30_000,
    });
  } catch (error) {
    fail(`${fileName}を読み込めません: ${error.message}`);
  }
  return context.__shareCatalogValue;
}

function getSourceLists() {
  const statData = loadGenerated('statData.js', 'TRICKCAL_STAT_DATA');
  const cardData = loadGenerated('cards.js', `({
    artifacts: typeof CARD_LIBRARY === 'undefined' ? [] : (CARD_LIBRARY.artifacts || []),
    spells: typeof CARD_LIBRARY === 'undefined' ? [] : (CARD_LIBRARY.spells || [])
  })`);
  const lists = {
    apostles: statData?.sheets?.basicInfo?.map(row => row?.id),
    artifacts: cardData?.artifacts?.map(card => card?.id),
    spells: cardData?.spells?.map(card => card?.id),
    masterPowers: statData?.sheets?.masterPowers?.map(power => power?.id),
  };
  for (const kind of KINDS) {
    if (!Array.isArray(lists[kind])) fail(`生成データの${kind}配列がありません`);
    validateUniqueList(lists[kind], `生成データ/${kind}`);
  }
  return lists;
}

function normalizeCatalogLists(catalog, label) {
  const lists = {};
  for (const kind of KINDS) {
    const raw = catalog?.[kind];
    if (!Array.isArray(raw)) fail(`${label}/${kind}配列がありません`);
    lists[kind] = raw.map(item => typeof item === 'string' ? item : item?.id);
    validateUniqueList(lists[kind], `${label}/${kind}`);
  }
  return lists;
}

function validateUniqueList(list, label) {
  const seen = new Set();
  list.forEach((id, index) => {
    if (typeof id !== 'string' || !id) fail(`${label}[${index}]のIDが不正です`);
    if (seen.has(id)) fail(`${label}にIDが重複しています: ${id}`);
    seen.add(id);
  });
}

function loadFixture(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  let fixture;
  try {
    fixture = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`共有辞書fixtureを読めません: ${error.message}`);
  }
  if (Number(fixture.catalogVersion ?? fixture.version) !== CATALOG_VERSION) {
    fail(`共有辞書fixture版が不正です: ${filePath}`);
  }
  const lists = fixture.lists || fixture;
  return { lists: normalizeCatalogLists(lists, `fixture:${filePath}`), sourceCommit: fixture.sourceCommit || '' };
}

function assertPrefix(baseLists, candidateLists, label) {
  for (const kind of KINDS) {
    const base = baseLists[kind] || [];
    const candidate = candidateLists[kind] || [];
    if (candidate.length < base.length) {
      fail(`${label}/${kind}が短くなっています（${base.length} -> ${candidate.length}）`);
    }
    base.forEach((id, index) => {
      if (candidate[index] !== id) {
        fail(`${label}/${kind}[${index}]の公開番号が変更されています: ${id} -> ${candidate[index] || '(欠落)'}`);
      }
    });
  }
}

function compareLists(sourceLists, catalogLists) {
  const result = { missing: {}, retired: {}, unchanged: true };
  for (const kind of KINDS) {
    const sourceSet = new Set(sourceLists[kind]);
    const catalogSet = new Set(catalogLists[kind]);
    result.missing[kind] = sourceLists[kind].filter(id => !catalogSet.has(id));
    result.retired[kind] = catalogLists[kind].filter(id => !sourceSet.has(id));
    if (result.missing[kind].length || result.retired[kind].length) result.unchanged = false;
  }
  return result;
}

function appendMissing(catalogLists, missing) {
  const next = {};
  for (const kind of KINDS) {
    next[kind] = [...catalogLists[kind], ...missing[kind].slice().sort((a, b) => a.localeCompare(b))];
  }
  return next;
}

function renderCatalog(lists) {
  const lines = [
    '(() => {',
    "  'use strict';",
    '',
    '  // 共有URLのIDは追記専用。既存の番号を並べ替えたり再利用したりしない。',
    '  // 新しいIDは各配列の末尾へ追加し、CATALOG_VERSIONを変更しない。',
    '  const catalog = {',
    '    version: 1,',
  ];
  KINDS.forEach((kind, kindIndex) => {
    lines.push(`    ${kind}: [`);
    const values = lists[kind];
    for (let index = 0; index < values.length; index += 10) {
      const chunk = values.slice(index, index + 10)
        .map(id => `'${id.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`)
        .join(', ');
      lines.push(`      ${chunk}${index + 10 < values.length ? ',' : ''}`);
    }
    lines.push(`    ]${kindIndex + 1 < KINDS.length ? ',' : ''}`);
  });
  lines.push(
    '  };',
    '',
    '  Object.values(catalog).forEach(value => {',
    '    if (Array.isArray(value)) Object.freeze(value);',
    '  });',
    '  Object.freeze(catalog);',
    "  const globalObject = typeof globalThis !== 'undefined' ? globalThis : {};",
    '  globalObject.TRICKCAL_FORMATION_SHARE_CATALOG = catalog;',
    "  if (typeof module !== 'undefined' && module.exports) module.exports = catalog;",
    '})();',
    ''
  );
  return lines.join('\n');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function appendCatalogText(source, missing) {
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  let result = source;
  for (const kind of KINDS) {
    const additions = missing[kind] || [];
    if (!additions.length) continue;
    const expression = new RegExp(`(\\n\\s{4}${escapeRegExp(kind)}\\s*:\\s*\\[[\\s\\S]*?)(\\n\\s{4}\\])`, 'm');
    let count = 0;
    result = result.replace(expression, (_match, body, closing) => {
      count += 1;
      const trimmedBody = body.trimEnd();
      const separator = trimmedBody.endsWith('[') || trimmedBody.endsWith(',') ? '' : ',';
      const values = additions
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .map(id => `'${id.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`)
        .join(', ');
      return trimmedBody + separator + newline + '      ' + values + closing;
    });
    if (count !== 1) fail(`共有辞書の${kind}配列を追記できませんでした`);
  }
  return result;
}

function writeCatalog(filePath, source, missing) {
  const directory = path.dirname(filePath);
  const temporaryPath = path.join(directory, `.${path.basename(filePath)}.${process.pid}.tmp`);
  fs.writeFileSync(temporaryPath, appendCatalogText(source, missing), 'utf8');
  try {
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    if (error.code !== 'EEXIST' && error.code !== 'EPERM') throw error;
    fs.rmSync(filePath, { force: true });
    fs.renameSync(temporaryPath, filePath);
  }
}

function formatEntries(entries) {
  return KINDS
    .filter(kind => entries[kind]?.length)
    .map(kind => `${kind}: ${entries[kind].join(', ')}`)
    .join('\n');
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    printHelp();
    return;
  }
  const catalog = loadCatalog(options.catalogPath);
  const catalogLists = normalizeCatalogLists(catalog, `catalog:${options.catalogPath}`);
  const fixture = loadFixture(options.fixturePath);
  if (fixture) assertPrefix(fixture.lists, catalogLists, '公開済みfixture');
  if (options.baseCatalogPath) {
    const baseCatalog = loadCatalog(options.baseCatalogPath);
    assertPrefix(normalizeCatalogLists(baseCatalog, `base:${options.baseCatalogPath}`), catalogLists, '比較元catalog');
  }

  const sourceLists = getSourceLists();
  const comparison = compareLists(sourceLists, catalogLists);
  const hasRetired = KINDS.some(kind => comparison.retired[kind].length > 0);
  if (hasRetired) {
    fail(`生成データから消えたIDがあります。削除・改名を自動処理しません。\n${formatEntries(comparison.retired)}`);
  }

  const missingCount = KINDS.reduce((total, kind) => total + comparison.missing[kind].length, 0);
  if (options.mode === 'check') {
    if (missingCount) {
      fail(`共有辞書に未登録のIDがあります。--writeで追記できます。\n${formatEntries(comparison.missing)}`);
    }
    console.log(`OK: 共有辞書と生成データが一致しました（${KINDS.map(kind => `${kind}=${catalogLists[kind].length}`).join(', ')}）`);
    return;
  }

  if (!missingCount) {
    console.log('OK: 追記対象はありません。共有辞書は変更していません。');
    return;
  }
  const nextLists = appendMissing(catalogLists, comparison.missing);
  if (fixture) assertPrefix(fixture.lists, nextLists, '追記後の公開済みfixture');
  const source = fs.readFileSync(options.catalogPath, 'utf8');
  writeCatalog(options.catalogPath, source, comparison.missing);
  console.log(`OK: 共有辞書へ${missingCount}件を追記しました。`);
  console.log(formatEntries(comparison.missing));
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
  appendMissing,
  assertPrefix,
  compareLists,
  main,
  normalizeCatalogLists,
  appendCatalogText,
  renderCatalog,
};
