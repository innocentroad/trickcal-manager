'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  discoverProductionSourceFiles,
  scanStorageAnalysis,
  validateStorageAnalyses
} = require('./storage-access-detector');

const OPERATION_TO_LEDGER_OPERATION = {
  getItem: 'read',
  setItem: 'write',
  removeItem: 'delete'
};

function asSet(value) {
  return value instanceof Set ? value : new Set(Array.isArray(value) ? value : []);
}

function isInsideRoot(root, relativePath) {
  const absoluteRoot = path.resolve(root);
  const absolutePath = path.resolve(root, relativePath);
  const relative = path.relative(absoluteRoot, absolutePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function normalizeRelativePath(relativePath) {
  return String(relativePath).split(path.sep).join('/');
}

function makeIssue(code, message, extra = {}) {
  return { code, message, ...extra };
}

function addError(errors, code, message, extra = {}) {
  errors.push(makeIssue(code, message, extra));
}

function readRootFile(root, relativePath) {
  if (!isInsideRoot(root, relativePath)) {
    throw new Error(`path is outside inspection root: ${relativePath}`);
  }
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readRootJson(root, relativePath) {
  return JSON.parse(readRootFile(root, relativePath));
}

function sourceOverrideFor(sourceOverrides, relativePath) {
  if (sourceOverrides instanceof Map) return sourceOverrides.get(relativePath);
  if (sourceOverrides && Object.prototype.hasOwnProperty.call(sourceOverrides, relativePath)) {
    return sourceOverrides[relativePath];
  }
  return undefined;
}

function parseLineFromMessage(message) {
  const match = String(message).match(/:([0-9]+)(?:\s|$)/);
  return match ? Number(match[1]) : undefined;
}

function inspectStorageProject({ root, sourceOverrides = new Map() } = {}) {
  const inspectionRoot = path.resolve(root || path.resolve(__dirname, '..'));
  const errors = [];
  let inventory;
  try {
    inventory = readRootJson(inspectionRoot, 'tools/storage-inventory.json');
  } catch (error) {
    addError(errors, 'INSPECTION_INPUT', `保存台帳を読めません: ${error.message}`);
    return {
      ok: false,
      errors: errors.map(item => item.message),
      diagnostics: errors,
      summary: { discoveredSources: 0, storageAccesses: 0, keys: 0, channels: 0 }
    };
  }

  const requireArray = (value, label, minimum = 0) => {
    if (!Array.isArray(value) || value.length < minimum) {
      addError(errors, 'INSPECTION_LEDGER', `${label}が不足しています`);
      return false;
    }
    return true;
  };
  if (inventory.schemaVersion !== 1) addError(errors, 'INSPECTION_LEDGER', '保存台帳のschemaVersionが想定外です');
  requireArray(inventory.productionSources, '本番参照元', 1);
  requireArray(inventory.verificationSources, '検証参照元', 1);
  requireArray(inventory.entries, '保存キー', 19);
  requireArray(inventory.channels, '保存関連チャネル', 5);
  requireArray(inventory.dynamicAccessExceptions, '動的storageアクセス例外');
  requireArray(inventory.helperContracts, 'helper契約');
  requireArray(inventory.storageParameterContracts, 'storage引数契約');
  requireArray(inventory.failureMatrix, '失敗経路');
  if (!inventory.productionDiscovery || typeof inventory.productionDiscovery !== 'object') {
    addError(errors, 'INSPECTION_LEDGER', '本番探索設定がありません');
  }

  const productionFiles = new Map();
  const verificationFiles = new Map();
  const discoveredProductionSources = [];
  let discoveredAnalyses = [];
  let discoveredStorageAccesses = new Map();
  let pagesWorkflow = '';

  const productionDiscovery = inventory.productionDiscovery || {};
  let discovered = [];
  try {
    discovered = discoverProductionSourceFiles(inspectionRoot, {
      extensions: productionDiscovery.extensions,
      excludeDirectories: productionDiscovery.excludeDirectories
    });
  } catch (error) {
    addError(errors, 'DISCOVERY_FAILED', `本番候補探索に失敗しました: ${error.message}`);
  }

  for (const relativePath of discovered) {
    const override = sourceOverrideFor(sourceOverrides, relativePath);
    let source;
    try {
      source = override === undefined ? readRootFile(inspectionRoot, relativePath) : override;
      if (typeof source !== 'string') throw new Error('source override must be a string');
    } catch (error) {
      addError(errors, 'INSPECTION_INPUT', `${relativePath}を読めません: ${error.message}`, { file: relativePath });
      continue;
    }
    discoveredProductionSources.push(relativePath);
    productionFiles.set(relativePath, source);
    try {
      const analysis = scanStorageAnalysis(source, relativePath, {
        storageParameterContracts: inventory.storageParameterContracts || []
      });
      discoveredAnalyses.push({ file: relativePath, ...analysis });
      if (analysis.accesses.length) discoveredStorageAccesses.set(relativePath, analysis.accesses);
    } catch (error) {
      addError(errors, 'AST_PARSE_FAILED', error.message, { file: relativePath });
    }
  }

  for (const [relativePath, value] of sourceOverrides instanceof Map
    ? sourceOverrides
    : Object.entries(sourceOverrides || {})) {
    if (!discovered.includes(relativePath)) {
      addError(errors, 'INSPECTION_OVERRIDE_NOT_DISCOVERED', `overlay対象が本番候補探索にありません: ${relativePath}`, { file: relativePath });
    }
    if (typeof value !== 'string') {
      addError(errors, 'INSPECTION_INPUT', `overlayのソースが文字列ではありません: ${relativePath}`, { file: relativePath });
    }
  }

  const registeredProductionSources = asSet(inventory.productionSources);
  const discoveredSet = new Set(discovered);
  for (const source of registeredProductionSources) {
    if (!discoveredSet.has(source)) {
      addError(errors, 'DISCOVERY_MISSING_REGISTERED_SOURCE', `台帳の本番参照元を候補探索できません: ${source}`, { file: source });
    }
  }
  const keyRegistry = asSet((inventory.entries || []).map(entry => entry.key));
  const areasByKey = new Map((inventory.entries || []).map(entry => [entry.key, new Set([entry.area])]));
  const detectorResult = validateStorageAnalyses(discoveredAnalyses, {
    registeredSources: registeredProductionSources,
    keys: keyRegistry,
    areasByKey,
    allowedParameterAccesses: inventory.storageParameterContracts || [],
    exceptions: inventory.dynamicAccessExceptions || [],
    helperContracts: inventory.helperContracts || []
  });
  for (const message of detectorResult.errors) {
    addError(errors, 'STORAGE_REFERENCE', message, { file: message.split(':')[0], line: parseLineFromMessage(message) });
  }
  if (detectorResult.accessValidation.unresolved.length) {
    addError(errors, 'STORAGE_UNRESOLVED', `未解決storageアクセスが残っています: ${detectorResult.accessValidation.unresolved.length}`);
  }

  if (inventory.productionSources?.some(source => source.startsWith('tools/'))) {
    addError(errors, 'DISCOVERY_SCOPE', 'tools/が本番公開範囲へ混入しています');
  }
  if (!inventory.verificationSources?.includes('tools/max-growth-verification.html')) {
    addError(errors, 'DISCOVERY_SCOPE', '表示検証ページが検証範囲にありません');
  }
  if (inventory.productionSources?.includes('tools/max-growth-verification.html')) {
    addError(errors, 'DISCOVERY_SCOPE', '検証ページを本番範囲へ分類しています');
  }

  for (const relativePath of inventory.verificationSources || []) {
    try {
      verificationFiles.set(relativePath, readRootFile(inspectionRoot, relativePath));
    } catch (error) {
      addError(errors, 'INSPECTION_INPUT', `検証参照元を読めません: ${relativePath} (${error.message})`, { file: relativePath });
    }
  }
  if (productionDiscovery.workflow) {
    try {
      pagesWorkflow = readRootFile(inspectionRoot, productionDiscovery.workflow);
    } catch (error) {
      addError(errors, 'INSPECTION_INPUT', `Pages工程を読めません: ${productionDiscovery.workflow} (${error.message})`, { file: productionDiscovery.workflow });
    }
  }
  const workflowExclusions = Array.from(pagesWorkflow.matchAll(/--exclude\s+'([^']+)\//g), match => match[1]).sort();
  const configuredExclusions = [...asSet(productionDiscovery.excludeDirectories)].sort();
  if (pagesWorkflow && JSON.stringify(workflowExclusions) !== JSON.stringify(configuredExclusions)) {
    addError(errors, 'PAGES_SCOPE_MISMATCH', '検出器の本番除外ディレクトリとPages工程の除外が一致しません');
  }
  for (const directory of configuredExclusions) {
    if (pagesWorkflow && !pagesWorkflow.includes(`--exclude '${directory}/'`)) {
      addError(errors, 'PAGES_SCOPE_MISMATCH', `探索除外ディレクトリがPages工程と一致しません: ${directory}`);
    }
  }

  const entriesByKey = new Map((inventory.entries || []).map(entry => [entry.key, entry]));
  const failureByEntryId = new Map((inventory.failureMatrix || []).map(item => [item.entryId, item]));
  const keys = new Set();
  for (const entry of inventory.entries || []) {
    if (!entry.id || typeof entry.id !== 'string') addError(errors, 'LEDGER_ENTRY', '保存entryにidがありません');
    if (!entry.key || typeof entry.key !== 'string') addError(errors, 'LEDGER_ENTRY', `保存entryにkeyがありません: ${entry.id || '(unknown)'}`);
    if (keys.has(entry.key)) addError(errors, 'LEDGER_ENTRY', `保存キーが重複しています: ${entry.key}`);
    keys.add(entry.key);
    if (!Array.isArray(entry.evidence) || entry.evidence.length === 0) addError(errors, 'LEDGER_ENTRY', `根拠がありません: ${entry.id}`);
    const declaredSources = new Set([entry.owner, ...(entry.readers || []), ...(entry.writers || [])]);
    let sourceText = '';
    for (const source of declaredSources) {
      if (!productionFiles.has(source)) {
        addError(errors, 'LEDGER_SOURCE', `${entry.id}の参照元が本番候補にありません: ${source}`, { file: source });
      } else {
        sourceText += `\n${productionFiles.get(source)}`;
      }
    }
    if (entry.key && !sourceText.includes(entry.key)) {
      addError(errors, 'LEDGER_ENTRY', `${entry.id}のキーが参照元にありません: ${entry.key}`);
    }
    if (!Array.isArray(entry.operations) || !entry.operations.includes('read')) {
      addError(errors, 'LEDGER_ENTRY', `${entry.id}にread操作がありません`);
    }
  }

  const failureEntryIds = new Set((inventory.failureMatrix || []).map(item => item.entryId));
  if (failureEntryIds.size !== (inventory.failureMatrix || []).length) addError(errors, 'FAILURE_LEDGER', '失敗経路台帳のentryIdが重複しています');
  if (failureEntryIds.size !== (inventory.entries || []).length) addError(errors, 'FAILURE_LEDGER', '失敗経路台帳の件数と保存キー台帳の件数が一致しません');
  for (const entry of inventory.entries || []) {
    const failure = failureByEntryId.get(entry.id);
    if (!failure) {
      addError(errors, 'FAILURE_LEDGER', `失敗経路台帳がありません: ${entry.id}`);
      continue;
    }
    for (const field of ['successBehavior', 'readFailure', 'writeFailure', 'deleteFailure', 'callerOutcome', 'startupWrites', 'accessSites']) {
      if (!Object.prototype.hasOwnProperty.call(failure, field)) addError(errors, 'FAILURE_LEDGER', `${entry.id}の失敗経路項目が不足しています: ${field}`);
    }
    if (!Array.isArray(failure.accessSites) || failure.accessSites.length === 0) {
      addError(errors, 'FAILURE_LEDGER', `${entry.id}のaccessSitesが空です`);
    }
    for (const site of failure.accessSites || []) {
      if (!productionFiles.has(site.file)) addError(errors, 'FAILURE_LEDGER', `${entry.id}のaccessSitesに未登録ファイルがあります: ${site.file}`, { file: site.file });
      if (!Array.isArray(site.operations) || site.operations.length === 0) addError(errors, 'FAILURE_LEDGER', `${entry.id}のaccessSites操作が空です`);
      if (!site.function || !site.keyResolution || !site.evidence) addError(errors, 'FAILURE_LEDGER', `${entry.id}のaccessSites根拠が不足しています`);
    }
  }
  for (const exception of inventory.dynamicAccessExceptions || []) {
    if (!exception.file || !productionFiles.has(exception.file)) addError(errors, 'HELPER_CONTRACT', `動的アクセス例外の参照元がありません: ${exception.file}`);
    if (!exception.helper || !exception.base || !exception.operation || !exception.argument || !exception.area || !exception.reason) {
      addError(errors, 'HELPER_CONTRACT', `動的アクセス例外の契約が不足しています: ${exception.file || '(unknown)'}`);
    }
    if (!(inventory.helperContracts || []).some(contract => contract.file === exception.file && contract.helper === exception.helper)) {
      addError(errors, 'HELPER_CONTRACT', `動的アクセス例外に対応するhelper契約がありません: ${exception.file}:${exception.helper}`);
    }
  }
  for (const contract of inventory.storageParameterContracts || []) {
    if (!contract.file || !productionFiles.has(contract.file)) addError(errors, 'STORAGE_PARAMETER_CONTRACT', `storage引数契約の参照元がありません: ${contract.file}`);
    if (!contract.function || !contract.parameter || !contract.operation) addError(errors, 'STORAGE_PARAMETER_CONTRACT', `storage引数契約の識別情報が不足しています: ${contract.file}`);
    if (!contract.key || !keys.has(contract.key)) addError(errors, 'STORAGE_PARAMETER_CONTRACT', `storage引数契約のキーが台帳にありません: ${contract.file}:${contract.function}`);
    if (!contract.area || !contract.reason) addError(errors, 'STORAGE_PARAMETER_CONTRACT', `storage引数契約の領域・理由が不足しています: ${contract.file}:${contract.function}`);
    if (entriesByKey.get(contract.key)?.area !== contract.area) addError(errors, 'STORAGE_PARAMETER_CONTRACT', `storage引数契約の既定領域が台帳と不一致です: ${contract.file}:${contract.function}`);
  }
  for (const contract of inventory.helperContracts || []) {
    if (!contract.file || !productionFiles.has(contract.file)) addError(errors, 'HELPER_CONTRACT', `helper契約の参照元がありません: ${contract.file}`);
    if (!contract.helper || !contract.keyParameter) addError(errors, 'HELPER_CONTRACT', `helper契約の識別情報が不足しています: ${contract.file}`);
    if (!Array.isArray(contract.allowedCalls) || contract.allowedCalls.length === 0) addError(errors, 'HELPER_CONTRACT', `helper契約の許可呼出元が空です: ${contract.file}:${contract.helper}`);
    for (const allowed of contract.allowedCalls || []) {
      if (!allowed.caller || !allowed.area || !allowed.key) addError(errors, 'HELPER_CONTRACT', `helper契約の許可呼出元が不完全です: ${contract.file}:${contract.helper}`);
      if (!keys.has(allowed.key)) addError(errors, 'HELPER_CONTRACT', `helper契約のキーが台帳にありません: ${allowed.key}`);
    }
  }

  for (const channel of inventory.channels || []) {
    if (!channel.name || typeof channel.name !== 'string') addError(errors, 'CHANNEL_LEDGER', `チャネル名がありません: ${channel.id}`);
    let channelText = '';
    for (const source of channel.sourceFiles || []) {
      if (!productionFiles.has(source)) addError(errors, 'CHANNEL_LEDGER', `${channel.id}の参照元が本番候補にありません: ${source}`, { file: source });
      else channelText += `\n${productionFiles.get(source)}`;
    }
    const marker = (channel.name || '').split(/[*#]/)[0].replace(/[-_]+$/, '');
    if (marker && !channelText.includes(marker)) addError(errors, 'CHANNEL_LEDGER', `${channel.id}の識別子が参照元にありません`);
  }

  // Storage calls must be checked through the same parsed analysis as the
  // production path above. A raw-text regex would turn comments into access
  // sites (including a commented-out HTML script) and would duplicate the
  // detector's literal/dynamic-key handling.
  for (const analysis of discoveredAnalyses) {
    const source = analysis.file;
    const text = productionFiles.get(source) || '';
    if (analysis.accesses.some(access => access.operation === 'clear')) {
      addError(errors, 'STORAGE_POLICY', `${source}が保存領域全体をclearします`, { file: source });
    }
    if (/\bindexedDB\b/i.test(text)) addError(errors, 'STORAGE_POLICY', `${source}がS1対象外のIndexedDBを使用します`, { file: source });
  }

  const operationToEntry = new Map((inventory.entries || []).map(entry => [entry.key, entry]));
  for (const [file, accesses] of discoveredStorageAccesses) {
    for (const access of accesses) {
      const operation = OPERATION_TO_LEDGER_OPERATION[access.operation];
      if (!operation || access.resolvedKey == null) continue;
      const entry = operationToEntry.get(access.resolvedKey);
      if (!entry) {
        addError(errors, 'LEDGER_ACCESS', `${file}:${access.line}のキーが台帳にありません: ${access.resolvedKey}`, { file, line: access.line });
        continue;
      }
      if (!entry.operations.includes(operation)) addError(errors, 'LEDGER_ACCESS', `${file}:${access.line}の${operation}操作が台帳にありません: ${access.resolvedKey}`, { file, line: access.line });
      const declaredSources = operation === 'read' ? (entry.readers || []) : (entry.writers || []);
      if (!declaredSources.includes(file)) addError(errors, 'LEDGER_ACCESS', `${file}:${access.line}の${operation}参照元が台帳にありません: ${access.resolvedKey}`, { file, line: access.line });
      const parameterAreaIsDeclared = access.helperParameter && (inventory.storageParameterContracts || []).some(rule => (
        rule.file === file
        && (!rule.function || rule.function === access.functionName)
        && (!rule.parameter || rule.parameter === access.base)
        && (!rule.operation || rule.operation === access.operation)
        && (!rule.key || rule.key === access.resolvedKey)
        && rule.area === entry.area
      ));
      if (entry.area !== access.area && !parameterAreaIsDeclared) addError(errors, 'LEDGER_ACCESS', `${file}:${access.line}の保存領域が台帳と不一致です: ${access.area} / ${entry.area} (${access.resolvedKey})`, { file, line: access.line });
      const failure = failureByEntryId.get(entry.id);
      if (!failure || !failure.accessSites.some(site => site.file === file && site.operations.includes(access.operation))) {
        addError(errors, 'FAILURE_LEDGER', `${file}:${access.line}の${access.operation} access siteが失敗経路台帳にありません: ${access.resolvedKey}`, { file, line: access.line });
      }
      if (!failure || !failure.accessSites.some(site => (
        site.file === file
        && site.operations.includes(access.operation)
        && String(site.function).split('/').includes(access.functionName)
      ))) {
        addError(errors, 'FAILURE_LEDGER', `${file}:${access.line}の関数が失敗経路台帳のaccess siteにありません: ${access.functionName} (${access.resolvedKey})`, { file, line: access.line });
      }
    }
  }

  const staticChecks = [
    ['stat-prototype.js', /const EXPORT_SCHEMA = 'trickcal-stat-state'/, 'ステータスexport schemaが変わっています'],
    ['stat-prototype.js', /const EXPORT_VERSION = 2/, 'ステータスexport versionが変わっています'],
    ['stat-prototype.js', /kind: 'slot'/, 'ステータスexportのkindが変わっています'],
    ['stat-prototype.js', value => (
      /function saveState\(options = \{\}\)/.test(value)
      && /const persisted = options\.flush \? flushPendingStateSave\(\) : true;/.test(value)
      && /if \(!options\.flush\) scheduleStateSave\(\);/.test(value)
      && /return persisted;/.test(value)
    ), 'saveStateのflush/debounce境界が変わっています'],
    ['stat-prototype.js', value => (
      /function scheduleStateSave\(\)/.test(value)
      && /window\.setTimeout\([\s\S]*?safePersistState\(\);[\s\S]*?\}, 120\);/.test(value)
    ), '保存debounceの120ms契約が変わっています'],
    ['stat-prototype.js', /function persistState\(\)[\s\S]*?appState\.syncRevision[\s\S]*?persistStateWorkspace\(\);[\s\S]*?publishLiveState\(\);/, 'persistStateのworkspace/live順序が変わっています'],
    ['stat-prototype.js', /sharedStateSlotStore = loadSharedStateSlotStore\(legacy\.savedStates\)/, '旧savedStatesからslot storeへ移行する起動経路が変わっています'],
    ['stat-prototype.js', /const parsed = initialWorkspaceState\?\.draft[\s\S]*?\? initialWorkspaceState\.draft[\s\S]*?: legacy/, 'workspace draft優先の起動経路が変わっています'],
    ['stat-prototype.js', /if \(!options\.force && currentRevision !== Math\.max\(0, Number\(expectedRevision\) \|\| 0\)\)/, 'スロット競合検知の基準が変わっています'],
    ['stat-prototype.js', value => value.includes('navigator.locks?.request') && value.includes('trickcal-stat-slots-v2'), 'スロット排他名が変わっています'],
    ['stat-prototype.js', /return Promise\.resolve\(\)\.then\(task\)/, 'Navigator Lock非対応時の現行fallbackが変わっています'],
    ['formation-damage-calc.js', /const CALC_SETTINGS_KEY = 'trickcal_formation_damage_settings_v1'/, '計算設定キーが変わっています'],
    ['formation-damage-calc.js', /const CALC_RESULT_SAVES_KEY = 'trickcal_formation_damage_result_saves_v1'/, '計算保存キーが変わっています'],
    ['formation-damage-calc.js', /const CUSTOM_ENEMY_PRESETS_KEY = 'trickcal_formation_damage_enemy_presets_v1'/, '敵プリセットキーが変わっています'],
    ['formation-damage-calc.js', /\.slice\(0, 50\)/, '計算保存の最大50件制限が変わっています'],
    ['formation-damage-calc.js', /enemyCorrectionSchema: 6/, '敵補正schemaの基準が変わっています'],
    ['formation-damage-dps-prototype.js', /const DPS_SETTINGS_SCHEMA_VERSION = 2/, 'DPS設定schemaが変わっています'],
    ['formation-damage-dps-prototype.js', /highSkillMode: 'disabled',[\s\S]*formationTimelineMode: 'supportEstimate'/, 'DPS設定の初期値が変わっています'],
    ['formation-damage-dps-prototype.js', value => value.includes('persistDpsSettingsForTarget(targetId'), 'DPS対象別保存経路がなくなっています'],
    ['formation-dps-calc.js', /DPS_RUNTIME_OVERRIDE_STORAGE_KEY = 'trickcal:dps-runtime-effect-overrides:v1'/, '旧DPS controllerの共有overrideキーが変わっています'],
    ['combat-scenario.js', /const COMPARISON_SESSION_VERSION = 3/, '比較session versionが変わっています'],
    [productionDiscovery.workflow, /--exclude 'tools\//, 'Pagesの検証用tools除外が変わっています'],
    ['service-worker.js', /const CACHE_PREFIX = 'trickcal-manager'/, '表示Cacheのprefixが変わっています']
  ];
  for (const [file, predicate, message] of staticChecks) {
    const text = file === productionDiscovery.workflow ? pagesWorkflow : productionFiles.get(file);
    if (typeof text !== 'string') {
      addError(errors, 'STATIC_CONTRACT', `静的契約の対象がありません: ${file}`, { file });
    } else if (!(typeof predicate === 'function' ? predicate(text) : predicate.test(text))) {
      addError(errors, 'STATIC_CONTRACT', `${file}: ${message}`, { file });
    }
  }

  let growthFixture;
  try {
    growthFixture = readRootJson(inspectionRoot, 'tools/fixtures/max-growth-verification-state.json');
  } catch (error) {
    addError(errors, 'VERIFICATION_FIXTURE', `最大育成fixtureを読めません: ${error.message}`);
  }
  if (growthFixture) {
    if (growthFixture.schema !== 'trickcal-stat-state') addError(errors, 'VERIFICATION_FIXTURE', '最大育成fixtureのschemaが変わっています');
    if (growthFixture.version !== 2) addError(errors, 'VERIFICATION_FIXTURE', '最大育成fixtureのversionが変わっています');
    if (growthFixture.kind !== 'slot') addError(errors, 'VERIFICATION_FIXTURE', '最大育成fixtureのkindが変わっています');
    if (!growthFixture.snapshot || typeof growthFixture.snapshot !== 'object') addError(errors, 'VERIFICATION_FIXTURE', '最大育成fixtureのsnapshotがありません');
    for (const field of ['apostles', 'research', 'cards', 'formation', 'savedFormations']) {
      if (!Object.prototype.hasOwnProperty.call(growthFixture.snapshot || {}, field)) addError(errors, 'VERIFICATION_FIXTURE', `最大育成fixtureに${field}がありません`);
    }
  }
  if (!verificationFiles.get('tools/max-growth-verification.html')?.includes('trickcal_codex_max_growth_backup_v1')) {
    addError(errors, 'VERIFICATION_FIXTURE', '検証ページの一時backup領域を識別できません');
  }

  const diagnostics = errors;
  return {
    ok: diagnostics.length === 0,
    errors: diagnostics.map(item => item.message),
    diagnostics,
    summary: {
      discoveredSources: discoveredProductionSources.length,
      registeredSources: registeredProductionSources.size,
      storageAccesses: Array.from(discoveredStorageAccesses.values()).reduce((sum, accesses) => sum + accesses.length, 0),
      keys: inventory.entries?.length || 0,
      channels: inventory.channels?.length || 0
    },
    inventory,
    productionFiles,
    verificationFiles,
    discoveredProductionSources,
    discoveredAnalyses,
    discoveredStorageAccesses,
    pagesWorkflow
  };
}

module.exports = { inspectStorageProject };
