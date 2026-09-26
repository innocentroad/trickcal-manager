#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  discoverProductionSourceFiles,
  scanStorageAnalysis,
  scanStorageAccesses,
  validateStorageAnalyses,
  validateStorageAccesses
} = require('./storage-access-detector');
const { inspectStorageProject } = require('./storage-inspection');

const ROOT = path.resolve(__dirname, '..');
const INVENTORY_PATH = path.join(__dirname, 'storage-inventory.json');

function readText(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  assert.ok(fs.existsSync(absolutePath), `参照元が存在しません: ${relativePath}`);
  return fs.readFileSync(absolutePath, 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

const inventory = readJson('tools/storage-inventory.json');
assert.equal(inventory.schemaVersion, 1, '保存台帳のschemaVersionが想定外です');
assert.ok(Array.isArray(inventory.productionSources) && inventory.productionSources.length > 0, '本番参照元が空です');
assert.ok(Array.isArray(inventory.localPrototypeSources), 'ローカル試作の保存範囲がありません');
assert.ok(Array.isArray(inventory.verificationSources) && inventory.verificationSources.length > 0, '検証参照元が空です');
assert.ok(Array.isArray(inventory.entries) && inventory.entries.length >= 19, '保存キー台帳が不足しています');
assert.ok(Array.isArray(inventory.channels) && inventory.channels.length >= 5, '保存関連チャネル台帳が不足しています');
assert.ok(inventory.productionDiscovery && typeof inventory.productionDiscovery === 'object', '本番探索設定がありません');
assert.ok(Array.isArray(inventory.dynamicAccessExceptions), '動的storageアクセスの例外台帳がありません');
assert.ok(Array.isArray(inventory.helperContracts), 'helper契約台帳がありません');
assert.ok(Array.isArray(inventory.storageParameterContracts), 'storage引数契約台帳がありません');
assert.ok(Array.isArray(inventory.failureMatrix), '保存失敗経路の台帳がありません');

assert.ok(inventory.productionSources.every(relativePath => !relativePath.startsWith('tools/')), 'tools/が本番公開範囲へ混入しています');
assert.ok(inventory.verificationSources.some(relativePath => relativePath === 'tools/max-growth-verification.html'), '表示検証ページが検証範囲にありません');
assert.ok(!inventory.productionSources.includes('tools/max-growth-verification.html'), '検証ページを本番範囲へ分類しています');

// 本番と反例が同じ探索・解析・契約・台帳照合を通る共通入口。
const projectInspection = inspectStorageProject({ root: ROOT });
assert.deepEqual(
  projectInspection.errors,
  [],
  `本番storage検査に失敗しました:\n${projectInspection.errors.join('\n')}`
);
const productionFiles = projectInspection.productionFiles;
const verificationFiles = projectInspection.verificationFiles;
const discoveredProductionSources = projectInspection.discoveredProductionSources;
const discoveredAnalyses = projectInspection.discoveredAnalyses;
const discoveredStorageAccesses = projectInspection.discoveredStorageAccesses;
const pagesWorkflow = projectInspection.pagesWorkflow;
const keyRegistry = new Set(inventory.entries.map(entry => entry.key));
const areasByKey = new Map(inventory.entries.map(entry => [entry.key, new Set([entry.area])]));
const entriesByKey = new Map(inventory.entries.map(entry => [entry.key, entry]));
assert.ok(discoveredStorageAccesses.size > 0, '本番storageアクセスを1件も検出できません');

// 検出器の受入fixture。実ファイルを台帳へ足すだけの回避を防ぎ、
// 定数・optional chaining・alias・HTML・コメント・動的キーの扱いを固定する。
const fixtureSource = `
  <!-- localStorage.getItem('comment-only') -->
  <script>
    // localStorage.getItem('comment-only')
    const FIXTURE_KEY = 'fixture-storage-key';
    const fixtureStore = window.localStorage;
    localStorage.getItem(FIXTURE_KEY);
    window.localStorage?.setItem(FIXTURE_KEY, 'value');
    fixtureStore['removeItem'](FIXTURE_KEY);
  </script>
`;
const fixtureAccesses = scanStorageAccesses(fixtureSource, 'fixture.html');
assert.equal(fixtureAccesses.length, 3, 'fixtureのstorageアクセス検出件数が想定外です');
assert.ok(fixtureAccesses.every(access => access.resolvedKey === 'fixture-storage-key'), 'fixtureの定数解決に失敗しました');
assert.equal(
  scanStorageAccesses("<!-- <script>localStorage.getItem('fixture-storage-key')</script> -->", 'commented-script.html').length,
  0,
  'HTMLコメント内のscriptをstorageアクセスとして検出しています'
);
const dynamicFixture = scanStorageAccesses('localStorage.getItem(dynamicKey);', 'new-file.js');
const fixtureAnalyses = [
  { file: 'fixture.html', ...scanStorageAnalysis(fixtureSource, 'fixture.html') },
  { file: 'new-file.js', ...scanStorageAnalysis('localStorage.getItem(dynamicKey);', 'new-file.js') }
];
const fixtureValidation = validateStorageAnalyses(fixtureAnalyses, {
  registeredSources: new Set(['fixture.html']),
  keys: new Set(['fixture-storage-key']),
  areasByKey: new Map([['fixture-storage-key', new Set(['localStorage'])]]),
  exceptions: [],
  helperContracts: []
});
const cleanFixtureValidation = validateStorageAnalyses([
  { file: 'fixture.html', ...scanStorageAnalysis(fixtureSource, 'fixture.html') }
], {
  registeredSources: new Set(['fixture.html']),
  keys: new Set(['fixture-storage-key']),
  areasByKey: new Map([['fixture-storage-key', new Set(['localStorage'])]]),
  exceptions: [],
  helperContracts: []
});
assert.deepEqual(cleanFixtureValidation.errors, [], '正常fixtureを共通検査入口で通せません');
assert.ok(fixtureValidation.errors.some(error => error.includes('new-file.js') && error.includes('not registered')), '未登録ファイルを失敗にできません');
assert.ok(fixtureValidation.errors.some(error => error.includes('unresolved storage key')), '動的キーを未解決一覧へ出せません');

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-storage-baseline-'));
try {
  const newCandidate = path.join(temporaryRoot, 'new-storage-file.js');
  fs.writeFileSync(newCandidate, "localStorage.setItem('fixture-storage-key', 'v');", 'utf8');
  const discoveredCandidates = discoverProductionSourceFiles(temporaryRoot, {
    extensions: ['.js'],
    excludeDirectories: []
  });
  assert.deepEqual(discoveredCandidates, ['new-storage-file.js'], '隔離候補探索が新規本番候補を拾えていません');
  const candidateAnalysis = discoveredCandidates.map(file => ({
    file,
    ...scanStorageAnalysis(fs.readFileSync(path.join(temporaryRoot, file), 'utf8'), file)
  }));
  const candidateValidation = validateStorageAnalyses(candidateAnalysis, {
    registeredSources: new Set(),
    keys: new Set(['fixture-storage-key']),
    areasByKey: new Map([['fixture-storage-key', new Set(['localStorage'])]]),
    exceptions: [],
    helperContracts: []
  });
  assert.ok(
    candidateValidation.errors.some(error => error.includes('not registered in productionSources')),
    '隔離で発見した未登録候補を共通検査入口で失敗にできません'
  );
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

const detectorCounterexamples = [
  {
    name: 'optional computed method',
    source: "localStorage?.['setItem']('fixture-storage-key', 'v');",
    expectedOperation: 'setItem',
    expectedKey: 'fixture-storage-key'
  },
  {
    name: 'window computed storage',
    source: "window['localStorage'].setItem('fixture-storage-key', 'v');",
    expectedOperation: 'setItem',
    expectedKey: 'fixture-storage-key'
  },
  {
    name: 'template expression',
    source: "const value = `${localStorage.setItem('fixture-storage-key', 'v')}`;",
    expectedOperation: 'setItem',
    expectedKey: 'fixture-storage-key'
  }
];
for (const fixture of detectorCounterexamples) {
  const accesses = scanStorageAccesses(fixture.source, `${fixture.name}.js`);
  assert.equal(accesses.length, 1, `${fixture.name}のstorageアクセスを検出できません`);
  assert.equal(accesses[0].operation, fixture.expectedOperation, `${fixture.name}の操作が解決されません`);
  assert.equal(accesses[0].resolvedKey, fixture.expectedKey, `${fixture.name}のキーが解決されません`);
}
const concatAccess = scanStorageAccesses(
  "const KEY = 'fixture-storage-key' + suffix; localStorage.setItem(KEY, 'v');",
  'concatenation.js'
);
assert.equal(concatAccess.length, 1, '動的連結のstorageアクセスを検出できません');
assert.equal(concatAccess[0].resolvedKey, null, '動的連結を既知キーへ丸めています');
const reassignedAccess = scanStorageAccesses(
  "const KEY = 'fixture-storage-key'; KEY = otherKey; localStorage.setItem(KEY, 'v');",
  'reassignment.js'
);
assert.equal(reassignedAccess[0].resolvedKey, null, '再代入されたキーを解決しています');
const shadowedAccess = scanStorageAccesses(
  "function save(localStorage) { localStorage.setItem('fixture-storage-key', 'v'); }",
  'shadowing.js'
);
assert.equal(shadowedAccess.length, 1, 'shadowing内のstorage参照を検出できません');
assert.equal(shadowedAccess[0].storageResolved, false, 'shadowingされたstorageをグローバルとして扱っています');
const dynamicMethodAccess = scanStorageAccesses(
  "localStorage[method]('fixture-storage-key', 'v');",
  'dynamic-method.js'
);
assert.equal(dynamicMethodAccess[0].operation, 'dynamic', '動的methodを未解決として検出できません');
const reassignedStorageAccesses = scanStorageAccesses(
  'let s = localStorage; s = sessionStorage; s.setItem("unknown-storage-key", "v");',
  'reassigned-storage-alias.js'
);
assert.equal(reassignedStorageAccesses.length, 1, '再代入されたstorage別名を検出できません');
assert.equal(reassignedStorageAccesses[0].storageResolved, false, '再代入されたstorage別名を既知領域として扱っています');
const reassignedStorageValidation = validateStorageAccesses(new Map([
  ['reassigned-storage-alias.js', reassignedStorageAccesses]
]), {
  registeredSources: new Set(['reassigned-storage-alias.js']),
  keys: new Set(['fixture-storage-key']),
  areasByKey: new Map([['fixture-storage-key', new Set(['localStorage'])]]),
  exceptions: []
});
assert.ok(reassignedStorageValidation.errors.some(error => error.includes('unresolved storage object')), '再代入storage別名を検査エラーにできません');
const assignedStorageAccesses = scanStorageAccesses(
  'let s; s = localStorage; s.setItem("unknown-storage-key", "v");',
  'assigned-storage-alias.js'
);
assert.equal(assignedStorageAccesses.length, 1, '代入形式のstorage別名を検出できません');
assert.equal(assignedStorageAccesses[0].storageResolved, false, '代入形式のstorage別名を既知領域として扱っています');
const parameterStorageAccesses = scanStorageAccesses(
  'function f(s) { s.setItem("unknown-storage-key", "v"); } f(localStorage);',
  'unknown-storage-parameter.js'
);
assert.equal(parameterStorageAccesses.length, 1, 'storage引数のアクセスを検出できません');
const parameterStorageValidation = validateStorageAccesses(new Map([
  ['unknown-storage-parameter.js', parameterStorageAccesses]
]), {
  registeredSources: new Set(['unknown-storage-parameter.js']),
  keys: new Set(['fixture-storage-key']),
  areasByKey: new Map([['fixture-storage-key', new Set(['localStorage'])]]),
  exceptions: []
});
assert.ok(parameterStorageValidation.errors.some(error => error.includes('unregistered storage key')), '未知storage引数のキーを検査エラーにできません');

function assertFullInspectionRejects(source, name, expectedMessage) {
  // Keep the real production candidate, inventory and normal helper calls.
  // Only the in-memory source overlay is changed, so this is the same project
  // inspection entry used by the production run.
  const base = readText('image-preload.js');
  const result = inspectStorageProject({
    root: ROOT,
    sourceOverrides: new Map([['image-preload.js', `${base}\n${source}`]])
  });
  assert.ok(
    result.errors.some(error => error.includes(expectedMessage)),
    `${name}を本番と同じ全検査入口で失敗にできません:\n${result.errors.join('\n')}`
  );
}

assertFullInspectionRejects(
  'function f(s) { s.clear(); } f(localStorage);',
  'storage-parameter-clear',
  'clear()'
);
assertFullInspectionRejects(
  'unknownConsumer(localStorage);',
  'storage-unknown-consumer',
  'storage reference is outside a declared contract'
);
assertFullInspectionRejects(
  "const box = { store: localStorage }; box.store.setItem('fixture-storage-key', 'v');",
  'storage-object-container',
  'storage reference is outside a declared contract'
);
assertFullInspectionRejects(
  'function expose() { return localStorage; }',
  'storage-return',
  'storage reference is outside a declared contract'
);
assertFullInspectionRejects(
  'export default localStorage;',
  'storage-default-export',
  'storage reference is outside a declared contract'
);

const fullCounterexampleSource = [
  "const dynamicKey = 'trickcal_stat_prototype_v1' + suffix; localStorage.setItem(dynamicKey, 'v');",
  "let reassignedStore; reassignedStore = localStorage; reassignedStore.setItem('trickcal_stat_prototype_v1', 'v');",
  "function unknownStorageParameter(store) { store.setItem('trickcal_stat_prototype_v1', 'v'); } unknownStorageParameter(localStorage);",
  "localStorage[method]('trickcal_stat_prototype_v1', 'v');"
].join('\n');
const fullCounterexampleResult = inspectStorageProject({
  root: ROOT,
  sourceOverrides: new Map([['image-preload.js', `${readText('image-preload.js')}\n${fullCounterexampleSource}`]])
});
for (const [message, label] of [
  ['unresolved storage key', '動的storageキー'],
  ['unresolved storage object', '再代入storage別名'],
  ['storage parameter outside a declared helper contract', '未知storage引数'],
  ['unsupported storage operation', '動的storage操作']
]) {
  assert.ok(
    fullCounterexampleResult.errors.some(error => error.includes(message)),
    `${label}を本番と同じ全検査入口で失敗にできません:\n${fullCounterexampleResult.errors.join('\n')}`
  );
}

// Raw source regexではなく、コメントを除いたAST解析だけを本番入口が
// 利用していることを、正常なsource overlayとして確認する。
const commentOnlyInspection = inspectStorageProject({
  root: ROOT,
  sourceOverrides: new Map([[
    'image-preload.js',
    `${readText('image-preload.js')}\n// localStorage.getItem('comment-only-storage-key');\n`
  ]])
});
assert.deepEqual(commentOnlyInspection.errors, [], 'コメント内のstorage文字列を本番検査で誤検出しています');
if (productionFiles.has('enemy-research.js')) {
  const prototypeMutation = inspectStorageProject({
    root: ROOT,
    sourceOverrides: new Map([['enemy-research.js',
      `${readText('enemy-research.js')}\nlocalStorage.setItem('trickcal.enemyResearch.unregistered.v1', 'x');\n`]])
  });
  assert.ok(prototypeMutation.errors.some(error => error.includes('trickcal.enemyResearch.unregistered.v1')),
    'ローカル試作の未登録キーを見逃しています');
}

assert.throws(
  () => scanStorageAccesses('localStorage.setItem(', 'parse-error.js'),
  /could not be parsed as JavaScript/,
  '構文エラーを検出器が見逃しています'
);

function copyInspectionFixtureRoot(targetRoot) {
  const inspectionInventory = readJson('tools/storage-inventory.json');
  const files = new Set([
    ...inspectionInventory.productionSources,
    ...inspectionInventory.verificationSources,
    'tools/storage-inventory.json',
    inspectionInventory.productionDiscovery.workflow,
    'tools/fixtures/max-growth-verification-state.json'
  ]);
  for (const relativePath of files) {
    const sourcePath = path.join(ROOT, relativePath);
    const targetPath = path.join(targetRoot, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
  }
}

// The isolated candidate check uses the full project inspector, not the
// detector-only validator. First prove the copied normal project is clean so
// a missing fixture cannot be the reason the mutant fails.
const isolatedInspectionRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-storage-inspection-'));
try {
  copyInspectionFixtureRoot(isolatedInspectionRoot);
  const cleanIsolatedResult = inspectStorageProject({ root: isolatedInspectionRoot });
  assert.deepEqual(cleanIsolatedResult.errors, [], '隔離した正常プロジェクトが共通検査入口を通りません');
  fs.writeFileSync(
    path.join(isolatedInspectionRoot, 'new-storage-writer.js'),
    "localStorage.setItem('trickcal_stat_prototype_v1', 'candidate');",
    'utf8'
  );
  const candidateResult = inspectStorageProject({ root: isolatedInspectionRoot });
  assert.ok(
    candidateResult.diagnostics.some(diagnostic => (
      diagnostic.code === 'STORAGE_REFERENCE'
      && diagnostic.file === 'new-storage-writer.js'
      && diagnostic.message.includes('not registered in productionSources')
    )),
    `全検査入口が未登録候補を拒否しません:\n${candidateResult.errors.join('\n')}`
  );
  assert.ok(
    candidateResult.diagnostics.some(diagnostic => (
      diagnostic.code === 'LEDGER_ACCESS'
      && diagnostic.file === 'new-storage-writer.js'
      && diagnostic.message.includes('write参照元が台帳にありません')
    )),
    `既知キーの新writerを台帳照合で拒否しません:\n${candidateResult.errors.join('\n')}`
  );
} finally {
  fs.rmSync(isolatedInspectionRoot, { recursive: true, force: true });
}

const clearValidation = validateStorageAccesses(new Map([
  ['clear.js', scanStorageAccesses('localStorage.clear();', 'clear.js')]
]), {
  registeredSources: new Set(['clear.js']),
  keys: new Set(),
  exceptions: []
});
assert.ok(clearValidation.errors.some(error => error.includes('.clear()')), 'storage.clear()を失敗にできません');

const imagePreloadSource = readText('image-preload.js');
const imagePreloadAnalysis = scanStorageAnalysis(imagePreloadSource, 'image-preload.js');
const imagePreloadContracts = inventory.helperContracts.filter(contract => contract.file === 'image-preload.js');
const helperValidationOptions = {
  registeredSources: new Set(['image-preload.js']),
  keys: keyRegistry,
  areasByKey,
  allowedParameterAccesses: inventory.storageParameterContracts.filter(contract => contract.file === 'image-preload.js'),
  exceptions: inventory.dynamicAccessExceptions.filter(exception => exception.file === 'image-preload.js'),
  helperContracts: imagePreloadContracts
};
assert.deepEqual(
  validateStorageAnalyses([{ file: 'image-preload.js', ...imagePreloadAnalysis }], helperValidationOptions).errors,
  [],
  'readJsonの現行Facade呼出元契約が不正です'
);
const changedHelperSource = imagePreloadSource.replace(
  'readJson(STAT_STORAGE_KEY)',
  "readJson('unregistered-storage-key')"
);
const changedHelperAnalysis = scanStorageAnalysis(changedHelperSource, 'image-preload.js');
const changedHelperErrors = validateStorageAnalyses([{ file: 'image-preload.js', ...changedHelperAnalysis }], helperValidationOptions).errors;
assert.ok(changedHelperErrors.some(error => error.includes('許可されていない')), 'helperの未登録キーを失敗にできません');
const dynamicHelperSource = imagePreloadSource.replace(
  'readJson(STAT_STORAGE_KEY)',
  'readJson(dynamicStorageKey)'
);
const dynamicHelperAnalysis = scanStorageAnalysis(dynamicHelperSource, 'image-preload.js');
const dynamicHelperErrors = validateStorageAnalyses([{ file: 'image-preload.js', ...dynamicHelperAnalysis }], helperValidationOptions).errors;
assert.ok(dynamicHelperErrors.some(error => error.includes('静的に解決できません')), 'helperの動的キーを失敗にできません');
const escapedHelperSource = imagePreloadSource.replace(
  'function collectSavedImages() {',
  'function collectSavedImages() { const escaped = readJson; escaped("unregistered-storage-key");'
);
const escapedHelperAnalysis = scanStorageAnalysis(escapedHelperSource, 'image-preload.js');
const escapedHelperErrors = validateStorageAnalyses([{ file: 'image-preload.js', ...escapedHelperAnalysis }], helperValidationOptions).errors;
assert.ok(escapedHelperErrors.some(error => error.includes('許可されていない') || error.includes('流出')), 'helper別名経由の未登録キーを失敗にできません');
const passedHelperSource = imagePreloadSource.replace(
  'function collectSavedImages() {',
  'function collectSavedImages() { unknownConsumer(readJson);'
);
const passedHelperAnalysis = scanStorageAnalysis(passedHelperSource, 'image-preload.js');
const passedHelperErrors = validateStorageAnalyses([{ file: 'image-preload.js', ...passedHelperAnalysis }], helperValidationOptions).errors;
assert.ok(passedHelperErrors.some(error => error.includes('流出')), '未知関数へ渡したhelperを失敗にできません');
const objectHelperSource = imagePreloadSource.replace(
  'function collectSavedImages() {',
  'function collectSavedImages() { const box = { read: readJson }; box.read("unregistered-storage-key");'
);
const objectHelperAnalysis = scanStorageAnalysis(objectHelperSource, 'image-preload.js');
const objectHelperErrors = validateStorageAnalyses([{ file: 'image-preload.js', ...objectHelperAnalysis }], helperValidationOptions).errors;
assert.ok(objectHelperErrors.some(error => error.includes('流出')), 'object property経由のhelperを失敗にできません');
const callHelperSource = imagePreloadSource.replace(
  'function collectSavedImages() {',
  'function collectSavedImages() { const escaped = readJson; escaped.call(null, "unregistered-storage-key");'
);
const callHelperAnalysis = scanStorageAnalysis(callHelperSource, 'image-preload.js');
const callHelperErrors = validateStorageAnalyses([{ file: 'image-preload.js', ...callHelperAnalysis }], helperValidationOptions).errors;
assert.ok(callHelperErrors.some(error => error.includes('流出')), 'helper.call経由のhelperを失敗にできません');
const defaultExportHelperSource = 'function readJson(key) { return null; } export default readJson;';
const defaultExportHelperAnalysis = scanStorageAnalysis(defaultExportHelperSource, 'image-preload.js');
const defaultExportHelperErrors = validateStorageAnalyses([{ file: 'image-preload.js', ...defaultExportHelperAnalysis }], {
  ...helperValidationOptions,
  helperContracts: [{
    file: 'image-preload.js',
    helper: 'readJson',
    keyParameter: 'key',
    keyArgumentIndex: 0,
    implicitStorageArea: 'localStorage',
    allowedCalls: []
  }]
}).errors;
assert.ok(defaultExportHelperErrors.some(error => error.includes('流出')), 'default export経由のhelperを失敗にできません');
const nativeBypassSource = imagePreloadSource.replace(
  'storageLocal.getItem(key)',
  "localStorage.getItem('trickcal_unregistered_storage_key')"
);
const nativeBypassResult = inspectStorageProject({
  root: ROOT,
  sourceOverrides: new Map([['image-preload.js', nativeBypassSource]])
});
assert.ok(
  nativeBypassResult.errors.some(error => error.includes('unregistered storage key') || error.includes('キーが台帳にありません')),
  `image-preloadのnative bypassを本番と同じ検査入口で拒否できません:\n${nativeBypassResult.errors.join('\n')}`
);
const mismatchedArea = scanStorageAccesses(
  "sessionStorage.getItem('fixture-storage-key');",
  'area-mismatch.js'
);
const mismatchedAreaValidation = validateStorageAccesses(new Map([['area-mismatch.js', mismatchedArea]]), {
  registeredSources: new Set(['area-mismatch.js']),
  keys: new Set(['fixture-storage-key']),
  areasByKey: new Map([['fixture-storage-key', new Set(['localStorage'])]]),
  exceptions: []
});
assert.ok(mismatchedAreaValidation.errors.some(error => error.includes('ledger requires')), '保存領域の不一致を失敗にできません');
const sharePrototypeSource = readText('formation-share-prototype.js');
const sharePrototypeAnalysis = scanStorageAnalysis(sharePrototypeSource, 'formation-share-prototype.js');
const sharePrototypeContracts = inventory.helperContracts.filter(contract => contract.file === 'formation-share-prototype.js');
const shareHelperValidationOptions = {
  registeredSources: new Set(['formation-share-prototype.js']),
  keys: keyRegistry,
  areasByKey,
  allowedParameterAccesses: inventory.storageParameterContracts.filter(contract => contract.file === 'formation-share-prototype.js'),
  exceptions: inventory.dynamicAccessExceptions.filter(exception => exception.file === 'formation-share-prototype.js'),
  helperContracts: sharePrototypeContracts
};
assert.deepEqual(
  validateStorageAnalyses([{ file: 'formation-share-prototype.js', ...sharePrototypeAnalysis }], shareHelperValidationOptions).errors,
  [],
  'parseJsonの現行呼出元契約が不正です'
);
const changedSharePrototypeSource = sharePrototypeSource.replace(
  "parseJson(storageLocal, 'trickcal_stat_live_v2')",
  "parseJson(storageSession, 'unregistered-storage-key')"
);
const changedSharePrototypeAnalysis = scanStorageAnalysis(changedSharePrototypeSource, 'formation-share-prototype.js');
const changedSharePrototypeErrors = validateStorageAnalyses([{ file: 'formation-share-prototype.js', ...changedSharePrototypeAnalysis }], shareHelperValidationOptions).errors;
assert.ok(changedSharePrototypeErrors.some(error => error.includes('許可されていない')), 'parseJsonの領域・キー変更を失敗にできません');
const mismatchedSharePrototypeSource = sharePrototypeSource.replace(
  "parseJson(storageLocal, 'trickcal_stat_live_v2')",
  "parseJson(storageSession, 'trickcal_stat_live_v2')"
);
const mismatchedSharePrototypeAnalysis = scanStorageAnalysis(mismatchedSharePrototypeSource, 'formation-share-prototype.js');
const mismatchedSharePrototypeErrors = validateStorageAnalyses(
  [{ file: 'formation-share-prototype.js', ...mismatchedSharePrototypeAnalysis }],
  shareHelperValidationOptions
).errors;
assert.ok(
  mismatchedSharePrototypeErrors.some(error => error.includes('許可されていない')),
  'helper経由の保存領域不一致を失敗にできません'
);

// N2反例は正規呼出しを残した実ファイルoverlayで、N1の全検査入口へ通す。
const n2ImageSource = imagePreloadSource.replace(
  'function collectSavedImages() {',
  'function collectSavedImages() {\n'
    + '  const invoke = readJson.call; unknownConsumer(invoke);\n'
    + '  const applied = readJson.apply; unknownConsumer(applied);\n'
    + '  const bound = readJson.bind(null); unknownConsumer(bound);\n'
    + '  const alias = readJson; alias("trickcal_stat_prototype_v1");\n'
    + '  const box = { read: readJson }; box.read("trickcal_stat_prototype_v1");\n'
    + '  const list = [readJson]; unknownConsumer(list);\n'
    + '  const spread = { ...readJson }; unknownConsumer(spread);\n'
    + '  unknownConsumer(readJson);\n'
    + '  function expose() { return readJson; }\n'
    + '  const method = localStorage.setItem; unknownConsumer(method);\n'
    + '  const storageBox = { store: localStorage }; unknownConsumer(storageBox);\n'
    + '  function unrelated(storage) { return storage.getItem("ordinary"); }'
);
const n2CombatSource = readText('combat-scenario.js').replace(
  'function loadComparisonSession(storage = getSessionStorage()) {',
  'function loadComparisonSession(storage = getSessionStorage()) { unknownConsumer(storage);'
);
const n2Result = inspectStorageProject({
  root: ROOT,
  sourceOverrides: new Map([
    ['image-preload.js', n2ImageSource],
    ['combat-scenario.js', n2CombatSource]
  ])
});
assert.ok(
  n2Result.diagnostics.some(diagnostic => (
    diagnostic.code === 'STORAGE_REFERENCE'
    && diagnostic.file === 'image-preload.js'
    && diagnostic.message.includes('readJsonが契約範囲外へ流出しています')
    && diagnostic.message.includes('readJson.call')
  )),
  `helperメンバー参照の流出を全検査入口で拒否できません:\n${n2Result.errors.join('\n')}`
);
assert.ok(
  n2Result.diagnostics.some(diagnostic => (
    diagnostic.code === 'STORAGE_REFERENCE'
    && diagnostic.file === 'combat-scenario.js'
    && diagnostic.message.includes('storage reference is outside a declared contract')
    && diagnostic.message.includes('storage')
  )),
  `契約storage引数の流出を全検査入口で拒否できません:\n${n2Result.errors.join('\n')}`
);
const assertN2Diagnostic = (predicate, label) => {
  assert.ok(n2Result.diagnostics.some(predicate), `${label}を全検査入口で拒否できません:\n${n2Result.errors.join('\n')}`);
};
assertN2Diagnostic(
  diagnostic => diagnostic.code === 'STORAGE_REFERENCE'
    && diagnostic.file === 'image-preload.js'
    && diagnostic.message.includes('readJsonの許可されていない呼出元・領域・キーです'),
  'helperの既知キー別名呼出し'
);
assertN2Diagnostic(
  diagnostic => diagnostic.code === 'STORAGE_REFERENCE'
    && diagnostic.file === 'image-preload.js'
    && diagnostic.message.includes('readJsonが契約範囲外へ流出しています (argument)'),
  'helperの未知関数引渡し'
);
assertN2Diagnostic(
  diagnostic => diagnostic.code === 'STORAGE_REFERENCE'
    && diagnostic.file === 'image-preload.js'
    && diagnostic.message.includes('readJsonが契約範囲外へ流出しています (return)'),
  'helperのreturn流出'
);
assertN2Diagnostic(
  diagnostic => diagnostic.code === 'STORAGE_REFERENCE'
    && diagnostic.file === 'image-preload.js'
    && diagnostic.message.includes('storage reference is outside a declared contract (member-reference): localStorage.setItem'),
  'storageメソッド切出し'
);
assertN2Diagnostic(
  diagnostic => diagnostic.code === 'STORAGE_REFERENCE'
    && diagnostic.file === 'image-preload.js'
    && diagnostic.message.includes('storage reference is outside a declared contract (reference): localStorage'),
  'storageのcontainer格納'
);
const cleanShadowingResult = inspectStorageProject({
  root: ROOT,
  sourceOverrides: new Map([['image-preload.js', imagePreloadSource + '\nfunction unrelated(storage) { return storage.getItem("ordinary"); }']])
});
assert.deepEqual(cleanShadowingResult.errors, [], '無関係な同名storage引数を誤検出しています');

// exportはIIFE内の既存helperへ無理に付加せず、同じ実ファイルへ独立した
// module helperを追加した一時rootで、正常版→named export変異を検査する。
const exportInspectionRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-storage-export-'));
try {
  copyInspectionFixtureRoot(exportInspectionRoot);
  const exportInventory = readJson('tools/storage-inventory.json');
  exportInventory.helperContracts.push({
    file: 'image-preload.js',
    helper: 'n2ExportableReader',
    keyParameter: 'key',
    keyArgumentIndex: 0,
    implicitStorageArea: 'localStorage',
    allowedCalls: [{ caller: '<top-level>', area: 'localStorage', key: 'trickcal_stat_prototype_v1' }]
  });
  exportInventory.dynamicAccessExceptions.push({
    file: 'image-preload.js',
    helper: 'n2ExportableReader',
    base: 'localStorage',
    operation: 'getItem',
    argument: 'key',
    area: 'localStorage',
    reason: 'N2のnamed export反例を一時rootで検証するためのhelper契約'
  });
  fs.writeFileSync(
    path.join(exportInspectionRoot, 'tools/storage-inventory.json'),
    `${JSON.stringify(exportInventory, null, 2)}\n`,
    'utf8'
  );
  const exportBase = readText('image-preload.js')
    + '\nfunction n2ExportableReader(key) { return localStorage.getItem(key); }\n'
    + "n2ExportableReader('trickcal_stat_prototype_v1');\n";
  const cleanExportResult = inspectStorageProject({
    root: exportInspectionRoot,
    sourceOverrides: new Map([['image-preload.js', exportBase]])
  });
  assert.deepEqual(cleanExportResult.errors, [], '正常named export helper fixtureの準備に失敗しました');
  const exportedResult = inspectStorageProject({
    root: exportInspectionRoot,
    sourceOverrides: new Map([['image-preload.js', exportBase + 'export { n2ExportableReader };\n']])
  });
  assert.ok(
    exportedResult.diagnostics.some(diagnostic => (
      diagnostic.code === 'STORAGE_REFERENCE'
      && diagnostic.file === 'image-preload.js'
      && diagnostic.message.includes('n2ExportableReaderが契約範囲外へ流出しています')
    )),
    `named export helperを全検査入口で拒否できません:\n${exportedResult.errors.join('\n')}`
  );
} finally {
  fs.rmSync(exportInspectionRoot, { recursive: true, force: true });
}

const keys = new Set();
for (const entry of inventory.entries) {
  assert.ok(entry.id && typeof entry.id === 'string', '保存entryにidがありません');
  assert.ok(entry.key && typeof entry.key === 'string', `保存entryにkeyがありません: ${entry.id}`);
  assert.ok(!keys.has(entry.key), `保存キーが重複しています: ${entry.key}`);
  keys.add(entry.key);
  assert.ok(Array.isArray(entry.evidence) && entry.evidence.length > 0, `根拠がありません: ${entry.id}`);
  const declaredSources = new Set([
    entry.owner,
    ...(entry.readers || []),
    ...(entry.writers || [])
  ]);
  for (const source of declaredSources) {
    assert.ok(productionFiles.has(source), `${entry.id}の参照元が本番台帳にありません: ${source}`);
  }
  const sourceText = Array.from(declaredSources)
    .map(source => productionFiles.get(source) || '')
    .join('\n');
  assert.ok(sourceText.includes(entry.key), `${entry.id}のキーが参照元にありません: ${entry.key}`);
  assert.ok(Array.isArray(entry.operations) && entry.operations.includes('read'), `${entry.id}にread操作がありません`);
}
for (const prototype of inventory.localPrototypeSources) {
  assert.ok(!inventory.productionSources.includes(prototype.file), `${prototype.file}を公開参照元として誤分類しています`);
  assert.ok(Array.isArray(prototype.keys) && prototype.keys.length > 0, `${prototype.file}の試作保存キーがありません`);
  for (const entry of prototype.keys) {
    assert.ok(!keys.has(entry.key), `保存キーが本番または試作内で重複しています: ${entry.key}`);
    keys.add(entry.key);
    assert.ok(entry.purpose && entry.readFailure && entry.writeFailure, `${entry.key}の用途・失敗経路が不足しています`);
  }
}

const failureEntryIds = new Set(inventory.failureMatrix.map(item => item.entryId));
assert.equal(failureEntryIds.size, inventory.failureMatrix.length, '失敗経路台帳のentryIdが重複しています');
assert.equal(failureEntryIds.size, inventory.entries.length, '失敗経路台帳の件数が保存キー台帳と一致しません');
for (const entry of inventory.entries) {
  const failure = inventory.failureMatrix.find(item => item.entryId === entry.id);
  assert.ok(failure, `失敗経路台帳がありません: ${entry.id}`);
  for (const field of ['successBehavior', 'readFailure', 'writeFailure', 'deleteFailure', 'callerOutcome', 'startupWrites', 'accessSites']) {
    assert.ok(Object.prototype.hasOwnProperty.call(failure, field), `${entry.id}の失敗経路項目が不足しています: ${field}`);
  }
  assert.ok(Array.isArray(failure.accessSites) && failure.accessSites.length > 0, `${entry.id}のaccessSitesが空です`);
  for (const site of failure.accessSites) {
    assert.ok(productionFiles.has(site.file), `${entry.id}のaccessSitesに未登録ファイルがあります: ${site.file}`);
    assert.ok(Array.isArray(site.operations) && site.operations.length > 0, `${entry.id}のaccessSites操作が空です`);
    assert.ok(site.function && site.keyResolution && site.evidence, `${entry.id}のaccessSites根拠が不足しています`);
  }
}
for (const exception of inventory.dynamicAccessExceptions) {
  assert.ok(exception.file && productionFiles.has(exception.file), `動的アクセス例外の参照元がありません: ${exception.file}`);
  assert.ok(exception.helper && exception.base && exception.operation && exception.argument && exception.area, `動的アクセス例外の契約が不足しています: ${exception.file}`);
  assert.ok(exception.reason, `動的アクセス例外の理由がありません: ${exception.file}`);
  assert.ok(
    inventory.helperContracts.some(contract => contract.file === exception.file && contract.helper === exception.helper),
    `動的アクセス例外に対応するhelper契約がありません: ${exception.file}:${exception.helper}`
  );
}
for (const contract of inventory.storageParameterContracts) {
  assert.ok(contract.file && productionFiles.has(contract.file), `storage引数契約の参照元がありません: ${contract.file}`);
  assert.ok(contract.function && contract.parameter && contract.operation, `storage引数契約の識別情報が不足しています: ${contract.file}`);
  assert.ok(contract.key && keys.has(contract.key), `storage引数契約のキーが台帳にありません: ${contract.file}:${contract.function}`);
  assert.ok(contract.area && contract.reason, `storage引数契約の領域・理由が不足しています: ${contract.file}:${contract.function}`);
  assert.equal(
    entriesByKey.get(contract.key)?.area,
    contract.area,
    `storage引数契約の既定領域が台帳と不一致です: ${contract.file}:${contract.function}`
  );
}
for (const contract of inventory.helperContracts) {
  assert.ok(contract.file && productionFiles.has(contract.file), `helper契約の参照元がありません: ${contract.file}`);
  assert.ok(contract.helper && contract.keyParameter, `helper契約の識別情報が不足しています: ${contract.file}`);
  assert.ok(Array.isArray(contract.allowedCalls) && contract.allowedCalls.length > 0, `helper契約の許可呼出元が空です: ${contract.file}:${contract.helper}`);
  for (const allowed of contract.allowedCalls) {
    assert.ok(allowed.caller && allowed.area && allowed.key, `helper契約の許可呼出元が不完全です: ${contract.file}:${contract.helper}`);
    assert.ok(keys.has(allowed.key), `helper契約のキーが台帳にありません: ${allowed.key}`);
  }
}

for (const channel of inventory.channels) {
  assert.ok(channel.name && typeof channel.name === 'string', `チャネル名がありません: ${channel.id}`);
  let channelText = '';
  for (const source of channel.sourceFiles || []) {
    assert.ok(productionFiles.has(source), `${channel.id}の参照元が本番台帳にありません: ${source}`);
    channelText += `\n${productionFiles.get(source)}`;
  }
  const marker = channel.name.split(/[*#]/)[0].replace(/[-_]+$/, '');
  assert.ok(channelText.includes(marker), `${channel.id}の識別子が参照元にありません`);
}

// 直接リテラルを含むstorageアクセスも、コメントを除いた本番と同じ
// AST解析結果で台帳照合する。生テキスト正規表現は使わない。
for (const [source, accesses] of discoveredStorageAccesses) {
  for (const access of accesses) {
    if (access.resolvedKey != null) assert.ok(keys.has(access.resolvedKey), `${source}のstorageキーが台帳にありません: ${access.resolvedKey}`);
  }
}

const stat = productionFiles.get('stat-prototype.js');
const calc = productionFiles.get('formation-damage-calc.js');
const dps = productionFiles.get('formation-damage-dps-prototype.js');
const legacyDps = productionFiles.get('formation-dps-calc.js');
const combat = productionFiles.get('combat-scenario.js');
const pages = readText('.github/workflows/pages.yml');
const serviceWorker = productionFiles.get('service-worker.js');
const appCache = productionFiles.get('app-cache.js');

const storageBootPages = [
  ['stat-dashboard.html', 'stat-prototype.js'],
  ['formation-damage-calc.html', 'formation-damage-calc.js'],
  ['formation-damage-dps-prototype.html', 'formation-damage-dps-prototype.js'],
  ['formation-dps-calc.html', 'formation-dps-calc.js'],
  ['enemy-status.html', 'enemy-status.js'],
  ['formation-share-prototype.html', 'formation-share-prototype.js'],
  ['public/board-layout-preview.html', 'board-layout-preview.js']
];
for (const [page, appScript] of storageBootPages) {
  const pageSource = productionFiles.get(page);
  const bootIndex = pageSource?.indexOf('storage-bootstrap.js') ?? -1;
  const appIndex = pageSource?.indexOf(appScript) ?? -1;
  assert.ok(bootIndex >= 0, `${page}がstorage-bootstrap.jsを読み込みません`);
  assert.ok(appIndex > bootIndex, `${page}がstorage boot前に${appScript}を読み込みます`);
}
for (const route of ['manager', 'calc', 'dps']) {
  const assets = appCache.match(new RegExp(`\\b${route}: \\[((?:.|\\n)*?)\\]`))?.[1] || '';
  for (const asset of ['storage-registry.js', 'storage-runtime.js', 'storage-bootstrap.js']) {
    assert.ok(assets.includes(`'${asset}'`), `app-cache.jsの${route}に${asset}が登録されていません`);
  }
}
assert.match(serviceWorker, /const CACHE_VERSION = ["'][^"']+["']/, '表示Cache版がありません');
assert.match(serviceWorker, /const RUNTIME_CACHE = `\$\{OWNED_CACHE_PREFIX\}\$\{CACHE_VERSION\}`/,
  '表示Cache版をprofile別namespaceへ接続していません');

assert.match(stat, /const EXPORT_SCHEMA = 'trickcal-stat-state'/, 'ステータスexport schemaが変わっています');
assert.match(stat, /const EXPORT_VERSION = 2/, 'ステータスexport versionが変わっています');
assert.match(stat, /kind: 'slot'/, 'ステータスexportのkindが変わっています');
assert.ok(
  /function saveState\(options = \{\}\)/.test(stat)
    && /const persisted = options\.flush \? flushPendingStateSave\(\) : true;/.test(stat)
    && /if \(!options\.flush\) scheduleStateSave\(\);/.test(stat)
    && /return persisted;/.test(stat),
  'saveStateのflush/debounce境界が変わっています'
);
assert.ok(
  /function scheduleStateSave\(\)/.test(stat)
    && /window\.setTimeout\([\s\S]*?safePersistState\(\);[\s\S]*?\}, 120\);/.test(stat),
  '保存debounceの120ms契約が変わっています'
);
assert.match(stat, /function persistState\(\)[\s\S]*?appState\.syncRevision[\s\S]*?persistStateWorkspace\(\);[\s\S]*?publishLiveState\(\);/, 'persistStateのworkspace/live順序が変わっています');
assert.match(stat, /sharedStateSlotStore = loadSharedStateSlotStore\(legacy\.savedStates\)/, '旧savedStatesからslot storeへ移行する起動経路が変わっています');
assert.match(stat, /const parsed = initialWorkspaceState\?\.draft[\s\S]*?\? initialWorkspaceState\.draft[\s\S]*?: legacy/, 'workspace draft優先の起動経路が変わっています');
assert.match(stat, /if \(!options\.force && currentRevision !== Math\.max\(0, Number\(expectedRevision\) \|\| 0\)\)/, 'スロット競合検知の基準が変わっています');
assert.ok(stat.includes('navigator.locks?.request') && stat.includes('trickcal-stat-slots-v2'), 'スロット排他名が変わっています');
assert.match(stat, /return Promise\.resolve\(\)\.then\(task\)/, 'Navigator Lock非対応時の現行fallbackが変わっています');

assert.match(calc, /const CALC_SETTINGS_KEY = 'trickcal_formation_damage_settings_v1'/, '計算設定キーが変わっています');
assert.match(calc, /const CALC_RESULT_SAVES_KEY = 'trickcal_formation_damage_result_saves_v1'/, '計算保存キーが変わっています');
assert.match(calc, /const CUSTOM_ENEMY_PRESETS_KEY = 'trickcal_formation_damage_enemy_presets_v1'/, '敵プリセットキーが変わっています');
assert.match(calc, /\.slice\(0, 50\)/, '計算保存の最大50件制限が変わっています');
assert.match(calc, /enemyCorrectionSchema: 6/, '敵補正schemaの基準が変わっています');

assert.match(dps, /const DPS_SETTINGS_SCHEMA_VERSION = 2/, 'DPS設定schemaが変わっています');
assert.match(dps, /highSkillMode: 'disabled',[\s\S]*formationTimelineMode: 'supportEstimate'/, 'DPS設定の初期値が変わっています');
assert.ok(dps.includes('persistDpsSettingsForTarget(targetId'), 'DPS対象別保存経路がなくなっています');
assert.match(legacyDps, /DPS_RUNTIME_OVERRIDE_STORAGE_KEY = 'trickcal:dps-runtime-effect-overrides:v1'/, '旧DPS controllerの共有overrideキーが変わっています');
assert.match(combat, /const COMPARISON_SESSION_VERSION = 3/, '比較session versionが変わっています');
assert.match(pages, /--exclude 'tools\//, 'Pagesの検証用tools除外が変わっています');
assert.match(serviceWorker, /const PROFILE_KEY = BASE_PATH === '\/' \? 'new-root' : 'legacy-trickcal-manager'/,
  '表示Cacheのprofile別識別が変わっています');
assert.match(serviceWorker, /const CACHE_NAMESPACE = `\$\{APP_ID\}-\$\{PROFILE_KEY\}`/,
  '表示Cacheのprofile別namespaceが変わっています');
assert.match(serviceWorker, /key\.startsWith\(OWNED_CACHE_PREFIX\) \|\| KNOWN_OLD_CACHE_NAMES\.includes\(key\)/,
  '所有cache以外を削除対象にしています');

const fixture = readJson('tools/fixtures/max-growth-verification-state.json');
assert.equal(fixture.schema, 'trickcal-stat-state', '最大育成fixtureのschemaが変わっています');
assert.equal(fixture.version, 2, '最大育成fixtureのversionが変わっています');
assert.equal(fixture.kind, 'slot', '最大育成fixtureのkindが変わっています');
assert.ok(fixture.snapshot && typeof fixture.snapshot === 'object', '最大育成fixtureのsnapshotがありません');
for (const field of ['apostles', 'research', 'cards', 'formation', 'savedFormations']) {
  assert.ok(Object.prototype.hasOwnProperty.call(fixture.snapshot, field), `最大育成fixtureに${field}がありません`);
}
assert.ok(verificationFiles.get('tools/max-growth-verification.html').includes('trickcal_codex_max_growth_backup_v1'), '検証ページの一時backup領域を識別できません');

for (const [source, text] of productionFiles) {
  assert.doesNotMatch(text, /\b(?:localStorage|sessionStorage)\.clear\s*\(/, `${source}が保存領域全体をclearします`);
  assert.doesNotMatch(text, /\bindexedDB\b/i, `${source}がS1対象外のIndexedDBを使用します`);
}

console.log(`storage baseline checks passed (${inventory.entries.length} keys, ${inventory.channels.length} channels, ${Array.from(discoveredStorageAccesses.values()).reduce((sum, accesses) => sum + accesses.length, 0)} accesses)`);
