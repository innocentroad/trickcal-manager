#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const backup = require('../storage-backup.js');
const registryApi = require('../storage-registry.js');
const runtimeApi = require('../storage-runtime.js');

const CONTROL_KEYS = {
  meta: 'trickcal_storage_meta_v1',
  journal: 'trickcal_storage_journal_v1',
  sessionEpoch: 'trickcal_storage_session_epoch_v1',
  workspace: 'trickcal_stat_workspace_v2',
  reloadContext: 'trickcal_dashboard_reload_context_v1',
  comparison: 'trickcal_combat_comparison_session_v1'
};
const UNRELATED_KEYS = {
  local: 'unrelated-tool-local-key',
  session: 'unrelated-tool-session-key'
};

const ROOT = path.resolve(__dirname, '..');

function loadProductionCalculationSaves(raw) {
  const source = fs.readFileSync(path.join(ROOT, 'formation-damage-calc.js'), 'utf8');
  const start = source.indexOf('  function loadDamageCalculationSaves()');
  const end = source.indexOf('\n  function writeDamageCalculationSaves', start);
  assert.ok(start >= 0 && end > start, '実計算保存loaderの境界を取得できません');
  const context = vm.createContext({
    storageLocal: { getItem() { return raw; } },
    CALC_RESULT_SAVES_KEY: 'trickcal_formation_damage_result_saves_v1',
    console: { warn() {} }
  });
  vm.runInContext(`${source.slice(start, end)}\nthis.__load = loadDamageCalculationSaves;`, context);
  return context.__load();
}

function projectProductionCalculationSaves(items) {
  return JSON.parse(JSON.stringify((items || []).map(item => ({
    id: item.id,
    name: item.name,
    savedAt: item.savedAt,
    snapshot: item.snapshot
  }))));
}

function assertProductionCalculationSavesMatch(actualRaw, expectedRaw, message) {
  const actual = projectProductionCalculationSaves(loadProductionCalculationSaves(actualRaw));
  const expected = projectProductionCalculationSaves(loadProductionCalculationSaves(expectedRaw));
  assert.deepEqual(actual, expected, message);
  return actual;
}

class FakeStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial).map(([key, value]) => [String(key), String(value)]));
    this.failures = new Map();
    this.calls = [];
  }

  failNext(method, key, error = new Error(`injected ${method}:${key}`)) {
    const failureKey = `${method}:${String(key)}`;
    const failures = this.failures.get(failureKey) || [];
    failures.push({ remaining: 0, error });
    this.failures.set(failureKey, failures);
  }

  failAfter(method, key, successfulCallsBeforeFailure, error = new Error(`injected ${method}:${key}`)) {
    const failureKey = `${method}:${String(key)}`;
    const failures = this.failures.get(failureKey) || [];
    failures.push({
      remaining: Math.max(0, Number(successfulCallsBeforeFailure) || 0),
      error
    });
    this.failures.set(failureKey, failures);
  }

  maybeFail(method, key) {
    const failureKey = `${method}:${String(key)}`;
    const failures = this.failures.get(failureKey);
    if (!failures?.length) return;
    const failure = failures[0];
    if (failure.remaining > 0) {
      failure.remaining -= 1;
      return;
    }
    failures.shift();
    if (!failures.length) this.failures.delete(failureKey);
    throw failure.error;
  }

  getItem(key) {
    const safeKey = String(key);
    this.calls.push({ method: 'getItem', key: safeKey });
    this.maybeFail('getItem', safeKey);
    return this.values.has(safeKey) ? this.values.get(safeKey) : null;
  }

  setItem(key, value) {
    const safeKey = String(key);
    this.calls.push({ method: 'setItem', key: safeKey });
    this.maybeFail('setItem', safeKey);
    this.values.set(safeKey, String(value));
  }

  removeItem(key) {
    const safeKey = String(key);
    this.calls.push({ method: 'removeItem', key: safeKey });
    this.maybeFail('removeItem', safeKey);
    this.values.delete(safeKey);
  }
}

class FakeLocks {
  constructor() {
    this.shared = 0;
    this.exclusive = false;
    this.queue = [];
  }

  request(name, options, callback) {
    if (options.ifAvailable && !this.canAcquire(options.mode)) {
      return Promise.resolve().then(() => callback(null));
    }
    return new Promise((resolve, reject) => {
      this.queue.push({ name, options: { ...options }, callback, resolve, reject });
      this.pump();
    });
  }

  canAcquire(mode) {
    return mode === 'exclusive'
      ? !this.exclusive && this.shared === 0
      : !this.exclusive;
  }

  pump() {
    for (let index = 0; index < this.queue.length;) {
      const job = this.queue[index];
      if (!this.canAcquire(job.options.mode)) {
        index += 1;
        continue;
      }
      this.queue.splice(index, 1);
      this.start(job);
      if (job.options.mode === 'exclusive') break;
    }
  }

  start(job) {
    if (job.options.mode === 'exclusive') this.exclusive = true;
    else this.shared += 1;
    Promise.resolve()
      .then(() => job.callback({ name: job.name, mode: job.options.mode }))
      .then(job.resolve, job.reject)
      .finally(() => {
        if (job.options.mode === 'exclusive') this.exclusive = false;
        else this.shared -= 1;
        this.pump();
      });
  }
}

function json(value) {
  return JSON.stringify(value);
}

function createEntries(label) {
  const snapshot = { selected: label, apostles: [label] };
  const resultSnapshot = {
    version: 4,
    view: { targetId: 'Momo', durationSeconds: label === 'before' ? 30 : 90 },
    result: { expected: label === 'before' ? 1 : 2, totalDamage: label === 'before' ? 1 : 2 },
    comparison: { dpsSnapshot: { durationSeconds: label === 'before' ? 30 : 90 } }
  };
  return {
    'stat.slotStore': json({
      schemaVersion: 2,
      storeRevision: label === 'before' ? 1 : 2,
      slots: {
        '1': {
          slotRevision: 1,
          savedAt: '2026-09-13T00:00:00.000Z',
          savedBy: `test-${label}`,
          snapshot
        }
      }
    }),
    'stat.workspaceDraft': json({
      workspaceVersion: 2,
      workspaceId: `workspace-${label}`,
      activeSlot: 1,
      baseSlotRevision: 1,
      draft: snapshot
    }),
    'stat.liveMirror': json({
      schemaVersion: 2,
      revision: label === 'before' ? 1 : 2,
      sourceTabInstanceId: `tab-${label}`,
      sourceSlot: '1',
      publishedAt: '2026-09-13T00:01:00.000Z',
      snapshot
    }),
    'stat.legacyCurrent': json({
      ...snapshot,
      syncRevision: label === 'before' ? 1 : 2,
      activeStateSlot: 1
    }),
    'calc.settings': json({ schemaVersion: 1, durationSeconds: label === 'before' ? 30 : 90 }),
    'calc.resultSaves': json([{
      id: `result-${label}`,
      name: `保存-${label}`,
      savedAt: label === 'before' ? 1726185600000 : 1726189200000,
      snapshot: resultSnapshot
    }]),
    'calc.enemyPresets': json({ [label]: { name: `敵-${label}`, hp: label === 'before' ? 100 : 200 } }),
    'dps.settings': json({ settingsVersion: 2, Momo: { durationSeconds: label === 'before' ? 30 : 90 } }),
    'dps.runtimeOverrides': json({ Momo: { effects: [label] } }),
    'preference.commonTheme': label === 'before' ? 'light' : 'dark',
    'preference.statThemeLegacy': label === 'before' ? 'light' : 'dark',
    'preference.calcThemeLegacy': label === 'before' ? 'light' : 'dark',
    'preference.boardPreviewThemeLegacy': label === 'before' ? 'light' : 'dark',
    'preference.boardShortcutOffMode': label === 'before' ? 'node' : 'route',
    'preference.boardOrientation': label === 'before' ? 'horizontal' : 'vertical',
    'preference.boardPreviewScale': label === 'before' ? '1' : '1.2',
    'sharePrototype.globalEnhancements': json({ version: 1, label })
  };
}

function seedEnvironment(label = 'before') {
  const entries = createEntries(label);
  const local = {};
  const session = {
    [CONTROL_KEYS.sessionEpoch]: 'epoch-old',
    [CONTROL_KEYS.workspace]: entries['stat.workspaceDraft'],
    [CONTROL_KEYS.reloadContext]: json({ label: 'reload-before' }),
    [CONTROL_KEYS.comparison]: json({ label: 'comparison-before' })
  };
  for (const entry of registryApi.userEntries) {
    if (entry.area === 'localStorage' && entries[entry.id] !== undefined) {
      local[entry.key] = entries[entry.id];
    }
  }
  local[CONTROL_KEYS.meta] = json({
    version: 1,
    epoch: 'epoch-old',
    restoreSerial: 0,
    lastRestore: null
  });
  local[UNRELATED_KEYS.local] = 'keep-local-tool-value';
  session[UNRELATED_KEYS.session] = 'keep-session-tool-value';
  return { entries, local, session };
}

function createEnvironment(seed) {
  const localStorage = new FakeStorage(seed.local);
  const sessionStorage = new FakeStorage(seed.session);
  const locks = new FakeLocks();
  const logs = [];
  const runtime = runtimeApi.createStorageRuntime({
    localStorage,
    sessionStorage,
    locks,
    epoch: 'unused',
    createEpoch: (() => {
      let counter = 0;
      return () => `epoch-created-${++counter}`;
    })(),
    logger: event => logs.push(event)
  });
  return { localStorage, sessionStorage, locks, runtime, logs };
}

async function createBackup(entries) {
  const result = await backup.createBackupPackageFromEntries(entries, {
    sourceMode: 'current-tab',
    sourceRelease: 'restore-test',
    createdAt: '2026-09-13T00:00:00.000Z'
  });
  assert.equal(result.ok, true);
  return result.value;
}

function localUserRawSnapshot(storage) {
  return Object.fromEntries(
    registryApi.userEntries
      .filter(entry => entry.area === 'localStorage')
      .map(entry => [entry.id, storage.getItem(entry.key)])
  );
}

function expectedLocalSnapshot(entries) {
  return Object.fromEntries(
    registryApi.userEntries
      .filter(entry => entry.area === 'localStorage')
      .map(entry => [entry.id, entries[entry.id] ?? null])
  );
}

function canonicalUserDatasetsFromEntries(entries, sourceMode = 'current-tab') {
  return backup.buildPayload(entries, {
    sourceMode,
    sourceRelease: 'restore-test',
    createdAt: '2026-09-13T00:00:00.000Z'
  }).datasets;
}

function canonicalUserDatasetsFromStorage(storage) {
  const entries = Object.fromEntries(
    registryApi.userEntries
      .filter(entry => entry.area === 'localStorage')
      .map(entry => [entry.id, storage.getItem(entry.key)])
  );
  return canonicalUserDatasetsFromEntries(entries);
}

function assertCanonicalLocalState(environment, expectedEntries) {
  assert.deepEqual(
    canonicalUserDatasetsFromStorage(environment.localStorage),
    canonicalUserDatasetsFromEntries(expectedEntries),
    '復元後の正規化datasetが期待値と一致しません'
  );
}

function snapshotStorage(environment) {
  const entries = registryApi.entries.concat(registryApi.controlEntries);
  const read = (storage, area) => Object.fromEntries(
    entries
      .filter(entry => entry.area === area)
      .map(entry => [entry.key, storage.getItem(entry.key)])
  );
  return {
    local: {
      ...read(environment.localStorage, 'localStorage'),
      [UNRELATED_KEYS.local]: environment.localStorage.getItem(UNRELATED_KEYS.local)
    },
    session: {
      ...read(environment.sessionStorage, 'sessionStorage'),
      [UNRELATED_KEYS.session]: environment.sessionStorage.getItem(UNRELATED_KEYS.session)
    }
  };
}

function assertNoSensitiveRestoreLogs(environment) {
  assert.ok(environment.logs.every(event => !Object.prototype.hasOwnProperty.call(event, 'raw')));
  assert.ok(environment.logs.every(event => !Object.prototype.hasOwnProperty.call(event, 'value')));
  assert.ok(environment.logs.every(event => !Object.prototype.hasOwnProperty.call(event, 'snapshot')));
}

function quotaError() {
  const error = new Error('quota injected');
  error.name = 'QuotaExceededError';
  return error;
}

async function boot(environment) {
  const result = await environment.runtime.boot({ role: 'app' });
  assert.equal(result.ok, true, JSON.stringify(result));
}

async function beginRestore(environment, packageValue) {
  const begun = await environment.runtime.beginMaintenance('restore');
  assert.equal(begun.ok, true, JSON.stringify(begun));
  const plan = await begun.value.planRestore(packageValue);
  assert.equal(plan.ok, true, JSON.stringify(plan));
  return { handle: begun.value, plan: plan.value };
}

async function testApplyAndSessionRebuild() {
  const seed = seedEnvironment('before');
  const environment = createEnvironment(seed);
  const packageValue = await createBackup(createEntries('after'));
  await boot(environment);
  const beforePlan = localUserRawSnapshot(environment.localStorage);
  const restore = await beginRestore(environment, packageValue);
  assert.equal(environment.localStorage.getItem(CONTROL_KEYS.journal), null);
  assert.deepEqual(localUserRawSnapshot(environment.localStorage), beforePlan);

  const applied = await restore.handle.applyRestore(restore.plan);
  assert.equal(applied.ok, true, JSON.stringify(applied));
  assert.equal(applied.value.phase, 'complete');
  assert.equal(applied.value.reloadRequired, true);
  assert.equal(environment.localStorage.getItem(CONTROL_KEYS.journal), null);
  assertCanonicalLocalState(environment, createEntries('after'));
  const meta = JSON.parse(environment.localStorage.getItem(CONTROL_KEYS.meta));
  assert.equal(meta.restoreSerial, 1);
  assert.notEqual(meta.epoch, 'epoch-old');
  const restoredWorkspace = JSON.parse(environment.sessionStorage.getItem(CONTROL_KEYS.workspace));
  assert.equal(restoredWorkspace.workspaceVersion, 2);
  assert.equal(restoredWorkspace.activeSlot, 1);
  assert.match(restoredWorkspace.workspaceId, /^workspace-restore-/);
  assert.equal(restoredWorkspace.draft.selected, 'after');
  assert.equal(environment.sessionStorage.getItem(CONTROL_KEYS.reloadContext), null);
  assert.equal(environment.sessionStorage.getItem(CONTROL_KEYS.comparison), null);
  assert.equal(environment.sessionStorage.getItem(CONTROL_KEYS.sessionEpoch), meta.epoch);
  assert.equal(environment.runtime.getState().lifecycle, 'restore-complete');
  assert.equal(environment.runtime.getState().permission, 'blocked');
  await environment.runtime.shutdown();
}

async function testAuxiliaryExclusionThroughRuntime() {
  const afterEntries = createEntries('after');
  afterEntries['calc.settings'] = '[]';
  const baseResult = JSON.parse(afterEntries['calc.resultSaves'])[0];
  afterEntries['calc.resultSaves'] = json(Array.from({ length: 3 }, (_, index) => {
    const item = JSON.parse(JSON.stringify(baseResult));
    item.id = `result-after-${index + 1}`;
    item.name = `保存-after-${index + 1}`;
    item.savedAt += index * 1000;
    item.snapshot.result.expected += index;
    item.snapshot.result.totalDamage += index;
    return item;
  }));
  const packageValue = await createBackup(afterEntries);

  const deniedSeed = seedEnvironment('before');
  const deniedEnvironment = createEnvironment(deniedSeed);
  await boot(deniedEnvironment);
  const deniedBefore = snapshotStorage(deniedEnvironment);
  const deniedMaintenance = await deniedEnvironment.runtime.beginMaintenance('restore');
  assert.equal(deniedMaintenance.ok, true, JSON.stringify(deniedMaintenance));
  const denied = await deniedMaintenance.value.planRestore(packageValue);
  assert.equal(denied.ok, false, '補助設定除外の明示確認なしを拒否できません');
  assert.equal(denied.code, 'invalid-data');
  assert.equal(denied.id, 'calc.settings');
  assert.deepEqual(snapshotStorage(deniedEnvironment), deniedBefore, '計画拒否時に保存値が変わりました');
  assert.equal((await deniedMaintenance.value.cancel()).ok, true);
  await deniedEnvironment.runtime.shutdown();

  const seed = seedEnvironment('before');
  const environment = createEnvironment(seed);
  await boot(environment);
  const begun = await environment.runtime.beginMaintenance('restore');
  assert.equal(begun.ok, true, JSON.stringify(begun));
  const planned = await begun.value.planRestore(packageValue, {
    allowAuxiliaryExclusion: true
  });
  assert.equal(planned.ok, true, JSON.stringify(planned));
  assert.deepEqual(planned.value.excludedAuxiliaryKeys, ['calc.settings']);
  assert.equal(planned.value.datasetKeys.includes('calc.settings'), false);
  assert.equal(planned.value.datasetKeys.includes('calc.resultSaves'), true);

  const applied = await begun.value.applyRestore(planned.value);
  assert.equal(applied.ok, true, JSON.stringify(applied));
  assert.equal(environment.localStorage.getItem(registryKey('calc.settings')), seed.entries['calc.settings']);
  assert.equal(environment.localStorage.getItem(registryKey('calc.resultSaves')), afterEntries['calc.resultSaves']);
  const expectedEntries = { ...afterEntries, 'calc.settings': seed.entries['calc.settings'] };
  assertCanonicalLocalState(environment, expectedEntries);

  const resultKey = registryKey('calc.resultSaves');
  const restoredRaw = environment.localStorage.getItem(resultKey);
  assertProductionCalculationSavesMatch(
    restoredRaw,
    afterEntries['calc.resultSaves'],
    '実保存先を読んだ新context loaderで保存計算結果が変わりました'
  );

  // Applyを省略したstorageと、読込みを省略した実行の両方を、成功系と
  // 同じ本番loader→一致assertへ通す。反例が通るなら実保存の証拠にならない。
  const saveOmittedEnvironment = createEnvironment(seedEnvironment('before'));
  const saveOmittedRaw = saveOmittedEnvironment.localStorage.getItem(resultKey);
  assert.throws(
    () => assertProductionCalculationSavesMatch(
      saveOmittedRaw,
      afterEntries['calc.resultSaves'],
      '保存省略反例'
    ),
    /保存省略反例/,
    '保存を省略したstorageが同じloader比較を通過しました'
  );
  assert.throws(
    () => assertProductionCalculationSavesMatch(
      null,
      afterEntries['calc.resultSaves'],
      '読込み省略反例'
    ),
    /読込み省略反例/,
    '保存計算結果の読込みを省略した実行が同じloader比較を通過しました'
  );
  assert.equal(environment.runtime.getState().lifecycle, 'restore-complete');
  await environment.runtime.shutdown();
}

async function testLegacySavedStatesRefuseBeforeRestore() {
  const seed = seedEnvironment('before');
  const environment = createEnvironment(seed);
  const before = snapshotStorage(environment);
  const legacyEntries = {
    'stat.legacyCurrent': json({
      activeStateSlot: 2,
      apostles: { Momo: { rank: 6 } },
      savedStates: {
        '2': { apostles: { Momo: { rank: 6 } } }
      }
    }),
    'calc.resultSaves': '[]'
  };
  const rejected = await backup.createBackupPackageFromEntries(legacyEntries, {
    sourceMode: 'stored-only',
    sourceRelease: 'legacy-slot-restore-test'
  });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.code, 'recovery-required');
  assert.match(rejected.message, /救出/);
  assert.deepEqual(snapshotStorage(environment), before, '旧形式拒否で復元先の保存値が変わりました');
  assert.equal(
    environment.localStorage.calls.some(call => ['setItem', 'removeItem'].includes(call.method)),
    false,
    '旧形式拒否で復元先への書込み・削除が発生しました'
  );
}

function extractProductionFunction(source, name) {
  const signature = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`);
  const match = signature.exec(source);
  assert.ok(match, `本番関数を抽出できません: ${name}`);
  const openParen = source.indexOf('(', match.index);
  let parameterDepth = 0;
  let closeParen = -1;
  let quote = '';
  for (let index = openParen; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '(') parameterDepth += 1;
    if (char === ')' && --parameterDepth === 0) {
      closeParen = index;
      break;
    }
  }
  assert.ok(closeParen >= 0, `本番関数の引数が閉じていません: ${name}`);
  const openBrace = source.indexOf('{', closeParen);
  assert.ok(openBrace >= 0, `本番関数の本体がありません: ${name}`);
  let depth = 0;
  let stringQuote = '';
  let template = false;
  for (let index = openBrace; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (stringQuote) {
      if (char === '\\') index += 1;
      else if (char === stringQuote) stringQuote = '';
      continue;
    }
    if (template) {
      if (char === '\\') index += 1;
      else if (char === '`') template = false;
      continue;
    }
    if (char === '/' && next === '/') {
      const lineEnd = source.indexOf('\n', index + 2);
      index = lineEnd < 0 ? source.length : lineEnd;
      continue;
    }
    if (char === '/' && next === '*') {
      const commentEnd = source.indexOf('*/', index + 2);
      index = commentEnd < 0 ? source.length : commentEnd + 1;
      continue;
    }
    if (char === "'" || char === '"') {
      stringQuote = char;
      continue;
    }
    if (char === '`') {
      template = true;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}' && --depth === 0) return source.slice(match.index, index + 1);
  }
  assert.fail(`本番関数の閉じ括弧がありません: ${name}`);
}

function createUiTestElement() {
  return {
    hidden: false,
    disabled: false,
    checked: false,
    value: '',
    textContent: '',
    children: [],
    replaceChildren() {
      this.children = [];
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    }
  };
}

async function testRollbackPreviewControlPath() {
  const source = fs.readFileSync(path.join(ROOT, 'stat-prototype.js'), 'utf8');
  const functionNames = [
    'renderBackupPreview',
    'resetBackupRestoreControls',
    'restorePendingBackupPreview',
    'renderRestorePlan',
    'prepareBackupRestore',
    'showRecoveryControls',
    'applyBackupRestore',
    'retryBackupRecovery',
    'cancelBackupPreview'
  ];
  const elements = Object.fromEntries([
    'backupPreview',
    'backupPreviewSummary',
    'backupPreviewDatasets',
    'backupIncludeDisplay',
    'backupAllowAuxiliaryExcludeWrap',
    'backupAllowAuxiliaryExclude',
    'backupAuxiliaryExcludeNote',
    'backupRestorePlan',
    'backupRestorePlanSummary',
    'backupRestorePlanDatasets',
    'backupPrepareRestore',
    'backupApplyRestore',
    'backupRetryRecovery',
    'backupReload',
    'backupRecoveryLink',
    'backupCancel',
    'backupImportFile'
  ].map(key => [key, createUiTestElement()]));
  elements.backupIncludeDisplay.checked = true;
  const statuses = [];
  let planCalls = 0;
  let applyCalls = 0;
  let cancelCalls = 0;
  const maintenance = {
    async planRestore() {
      planCalls += 1;
      if (planCalls === 1) return { ok: false, code: 'invalid-data', id: 'calc.settings' };
      return {
        ok: true,
        value: {
          summary: packageValue.summary,
          includeDisplaySettings: true,
          excludedAuxiliaryKeys: ['calc.settings'],
          affectedEntryCount: 1,
          datasetKeys: ['calc.resultSaves']
        }
      };
    },
    async applyRestore() {
      applyCalls += 1;
      return applyCalls === 1
        ? { ok: false, code: 'write-failed', operation: 'applyRestore' }
        : { ok: true, value: { phase: 'complete', reloadRequired: true } };
    },
    async cancel() {
      cancelCalls += 1;
      return { ok: true };
    },
    async recover() {
      return { ok: false, code: 'unsupported' };
    }
  };
  const context = {
    console: { error() {}, warn() {} },
    document: {
      createElement() {
        return createUiTestElement();
      }
    },
    window: {},
    elements,
    storageRuntime: {
      async beginMaintenance() {
        return { ok: true, value: maintenance };
      }
    },
    showBackupStatus(message, isError = false) {
      statuses.push({ message, isError });
    },
    backupFailureMessage(result) {
      return String(result?.code || 'failed');
    }
  };
  const packageValue = {
    summary: {
      presentDatasets: 1,
      totalDatasets: 2,
      datasets: [
        { key: 'calc.resultSaves', state: 'present', entries: ['calc.resultSaves'] },
        { key: 'calc.settings', state: 'excluded', entries: ['calc.settings'] }
      ]
    }
  };
  vm.createContext(context);
  const definitions = functionNames.map(name => extractProductionFunction(source, name));
  vm.runInContext(`
    let pendingBackupPackage = ${JSON.stringify(packageValue)};
    let pendingRestoreMaintenance = null;
    let pendingRestorePlan = null;
    ${definitions.join('\n\n')}
    this.__ui = { prepareBackupRestore, applyBackupRestore };
    this.__getPending = () => ({
      backup: pendingBackupPackage,
      maintenance: pendingRestoreMaintenance,
      plan: pendingRestorePlan
    });
  `, context, { filename: 'storage-restore-ui-control.js' });

  const ui = context.__ui;
  await ui.prepareBackupRestore();
  assert.equal(planCalls, 1, '明示同意なしでもplan入口が実行されていません');
  assert.equal(cancelCalls, 1, 'plan拒否後のmaintenance解放がありません');
  assert.equal(context.__getPending().maintenance, null, 'plan拒否後にmaintenanceが残っています');
  assert.equal(elements.backupAllowAuxiliaryExclude.checked, false, '拒否後に除外同意が残っています');
  assert.equal(elements.backupPreview.hidden, false, 'plan拒否後にpreviewが消えています');

  elements.backupAllowAuxiliaryExclude.checked = true;
  await ui.prepareBackupRestore();
  assert.equal(planCalls, 2, '明示同意後のplan再確認がありません');
  assert.ok(context.__getPending().maintenance, 'plan成功後にmaintenanceが保持されていません');
  await ui.applyBackupRestore();
  assert.equal(applyCalls, 1, '実apply入口が実行されていません');
  assert.equal(cancelCalls, 2, 'apply失敗後のrollback解放がありません');
  assert.equal(elements.backupPreview.hidden, false, 'rollback後にpreviewが再表示されていません');
  assert.equal(elements.backupAllowAuxiliaryExclude.checked, false, 'rollback後に除外同意が自動復元されています');
  assert.equal(elements.backupPrepareRestore.hidden, false, 'rollback後に再確認操作が表示されていません');
  assert.equal(context.__getPending().backup.summary.presentDatasets, 1, 'rollback後にpackageが失われました');

  elements.backupAllowAuxiliaryExclude.checked = true;
  await ui.prepareBackupRestore();
  await ui.applyBackupRestore();
  assert.equal(applyCalls, 2, '同意後の再適用が実行されていません');
  assert.equal(elements.backupReload.hidden, false, '再適用成功後のreload導線がありません');
  assert.match(statuses.at(-1)?.message || '', /完了/);
}

async function testRollbackAndPreparedRecovery() {
  const seed = seedEnvironment('before');
  const environment = createEnvironment(seed);
  const packageValue = await createBackup(createEntries('after'));
  await boot(environment);
  const restore = await beginRestore(environment, packageValue);
  environment.localStorage.failNext('setItem', CONTROL_KEYS.meta);
  const failed = await restore.handle.applyRestore(restore.plan);
  assert.equal(failed.ok, false);
  assert.equal(failed.code, 'write-failed');
  assert.equal(failed.rolledBack, true);
  assert.equal(environment.localStorage.getItem(CONTROL_KEYS.journal), null);
  assert.deepEqual(localUserRawSnapshot(environment.localStorage), expectedLocalSnapshot(seed.entries));
  await restore.handle.cancel();
  await environment.runtime.shutdown();

  const recoverySeed = seedEnvironment('before');
  const recovery = createEnvironment(recoverySeed);
  await boot(recovery);
  const recoveryRestore = await beginRestore(recovery, packageValue);
  recovery.localStorage.failNext('setItem', CONTROL_KEYS.meta);
  recovery.localStorage.failNext('removeItem', CONTROL_KEYS.journal);
  const rollbackFailed = await recoveryRestore.handle.applyRestore(recoveryRestore.plan);
  assert.equal(rollbackFailed.ok, false);
  assert.equal(rollbackFailed.code, 'remove-failed');
  assert.notEqual(recovery.localStorage.getItem(CONTROL_KEYS.journal), null);
  await recovery.runtime.shutdown();

  const recoveryEntry = runtimeApi.createStorageRuntime({
    localStorage: recovery.localStorage,
    sessionStorage: recovery.sessionStorage,
    locks: recovery.locks,
    createEpoch: () => 'epoch-recovery-entry'
  });
  const inspected = await recoveryEntry.inspectPendingRecovery();
  assert.equal(inspected.ok, true, JSON.stringify(inspected));
  assert.equal(inspected.value.present, true);
  assert.equal(inspected.value.phase, 'applying');
  const recovered = await recoveryEntry.recoverPendingJournal();
  assert.equal(recovered.ok, true, JSON.stringify(recovered));
  assert.equal(recovered.value.phase, 'rolled-back');
  assert.equal(recovery.localStorage.getItem(CONTROL_KEYS.journal), null);

  const afterBoot = runtimeApi.createStorageRuntime({
    localStorage: recovery.localStorage,
    sessionStorage: recovery.sessionStorage,
    locks: recovery.locks,
    createEpoch: () => 'epoch-reboot'
  });
  const reboot = await afterBoot.boot({ role: 'app' });
  assert.equal(reboot.ok, true, JSON.stringify(reboot));
  assert.equal(recovery.localStorage.getItem(CONTROL_KEYS.journal), null);
  assert.deepEqual(localUserRawSnapshot(recovery.localStorage), expectedLocalSnapshot(recoverySeed.entries));
  await afterBoot.shutdown();
}

async function testCommittedSessionPendingRecovery() {
  const seed = seedEnvironment('before');
  const environment = createEnvironment(seed);
  const packageValue = await createBackup(createEntries('after'));
  await boot(environment);
  const restore = await beginRestore(environment, packageValue);
  environment.sessionStorage.failNext('setItem', CONTROL_KEYS.workspace);
  const pending = await restore.handle.applyRestore(restore.plan);
  assert.equal(pending.ok, false);
  assert.equal(pending.code, 'write-failed');
  const pendingJournal = JSON.parse(environment.localStorage.getItem(CONTROL_KEYS.journal));
  assert.equal(pendingJournal.phase, 'session-pending');
  const committedMeta = JSON.parse(environment.localStorage.getItem(CONTROL_KEYS.meta));
  await environment.runtime.shutdown();

  const reboot = runtimeApi.createStorageRuntime({
    localStorage: environment.localStorage,
    sessionStorage: environment.sessionStorage,
    locks: environment.locks,
    createEpoch: () => 'epoch-session-reboot'
  });
  const result = await reboot.boot({ role: 'app' });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(environment.localStorage.getItem(CONTROL_KEYS.journal), null);
  const restoredWorkspace = JSON.parse(environment.sessionStorage.getItem(CONTROL_KEYS.workspace));
  assert.equal(restoredWorkspace.workspaceVersion, 2);
  assert.match(restoredWorkspace.workspaceId, /^workspace-restore-/);
  assert.equal(restoredWorkspace.draft.selected, 'after');
  assert.equal(environment.sessionStorage.getItem(CONTROL_KEYS.reloadContext), null);
  assert.equal(environment.sessionStorage.getItem(CONTROL_KEYS.comparison), null);
  assert.equal(environment.sessionStorage.getItem(CONTROL_KEYS.sessionEpoch), committedMeta.epoch);
  await reboot.shutdown();
}

async function testCorruptJournalStopsBoot() {
  const seed = seedEnvironment('before');
  seed.local[CONTROL_KEYS.journal] = json({ version: 1, phase: 'prepared' });
  const environment = createEnvironment(seed);
  const result = await environment.runtime.boot({ role: 'app' });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'recovery-required');
  assert.equal(environment.localStorage.getItem(CONTROL_KEYS.journal), json({ version: 1, phase: 'prepared' }));
}

function registryKey(id) {
  return registryApi.registry.get(id).key;
}

async function createPreparedRestore(afterEntries = createEntries('after')) {
  const seed = seedEnvironment('before');
  const environment = createEnvironment(seed);
  const packageValue = await createBackup(afterEntries);
  await boot(environment);
  const restore = await beginRestore(environment, packageValue);
  return { seed, environment, restore, afterEntries };
}

function assertOriginalStorage(environment, beforeSnapshot) {
  assert.deepEqual(snapshotStorage(environment), beforeSnapshot, '失敗後に保存値または他領域が変化しました');
  assert.equal(environment.localStorage.getItem(CONTROL_KEYS.journal), null);
  assertNoSensitiveRestoreLogs(environment);
}

async function testRestoreFailureBoundaries() {
  const journalKey = registryKey('control.journal');
  const metaKey = registryKey('control.meta');
  const calcKey = registryKey('calc.settings');
  const enemyKey = registryKey('calc.enemyPresets');
  const cases = [
    {
      label: 'prepared journal write',
      configure: environment => environment.localStorage.failAfter('setItem', journalKey, 0),
      code: 'write-failed',
      rolledBack: false
    },
    {
      label: 'prepared journal readback',
      configure: environment => environment.localStorage.failAfter('getItem', journalKey, 1),
      code: 'read-failed',
      rolledBack: true
    },
    {
      label: 'applying journal write',
      configure: environment => environment.localStorage.failAfter('setItem', journalKey, 1),
      code: 'write-failed',
      rolledBack: true
    },
    {
      label: 'applying journal readback',
      configure: environment => environment.localStorage.failAfter('getItem', journalKey, 2),
      code: 'read-failed',
      rolledBack: true
    },
    {
      label: 'local set',
      configure: environment => environment.localStorage.failAfter('setItem', calcKey, 0),
      code: 'write-failed',
      rolledBack: true
    },
    {
      label: 'local set readback',
      configure: environment => environment.localStorage.failAfter('getItem', calcKey, 1),
      code: 'read-failed',
      rolledBack: true
    },
    {
      label: 'local readback verification',
      configure: environment => environment.localStorage.failAfter('getItem', calcKey, 2),
      code: 'read-failed',
      rolledBack: true
    },
    {
      label: 'meta set',
      configure: environment => environment.localStorage.failAfter('setItem', metaKey, 0),
      code: 'write-failed',
      rolledBack: true
    },
    {
      label: 'meta set readback',
      configure: environment => environment.localStorage.failAfter('getItem', metaKey, 1),
      code: 'read-failed',
      rolledBack: true
    },
    {
      label: 'meta readback verification',
      configure: environment => environment.localStorage.failAfter('getItem', metaKey, 2),
      code: 'read-failed',
      rolledBack: true
    },
    {
      label: 'local remove',
      afterEntries: (() => {
        const entries = createEntries('after');
        delete entries['calc.enemyPresets'];
        return entries;
      })(),
      configure: environment => environment.localStorage.failAfter('removeItem', enemyKey, 0),
      code: 'remove-failed',
      rolledBack: true
    },
    {
      label: 'local remove readback',
      afterEntries: (() => {
        const entries = createEntries('after');
        delete entries['calc.enemyPresets'];
        return entries;
      })(),
      configure: environment => environment.localStorage.failAfter('getItem', enemyKey, 1),
      code: 'read-failed',
      rolledBack: true
    },
    {
      label: 'local remove verification',
      afterEntries: (() => {
        const entries = createEntries('after');
        delete entries['calc.enemyPresets'];
        return entries;
      })(),
      configure: environment => environment.localStorage.failAfter('getItem', enemyKey, 2),
      code: 'read-failed',
      rolledBack: true
    },
    {
      label: 'quota on local set',
      configure: environment => environment.localStorage.failAfter('setItem', calcKey, 0, quotaError()),
      code: 'quota',
      rolledBack: true
    },
    {
      label: 'commit journal write',
      configure: environment => environment.localStorage.failAfter('setItem', journalKey, 2),
      code: 'write-failed',
      rolledBack: true
    }
  ];

  for (const testCase of cases) {
    const prepared = await createPreparedRestore(testCase.afterEntries || createEntries('after'));
    const beforeSnapshot = snapshotStorage(prepared.environment);
    testCase.configure(prepared.environment);
    const result = await prepared.restore.handle.applyRestore(prepared.restore.plan);
    assert.equal(result.ok, false, `${testCase.label}が成功扱いになりました`);
    assert.equal(result.code, testCase.code, `${testCase.label}の失敗コード`);
    assert.equal(!!result.rolledBack, testCase.rolledBack, `${testCase.label}のrollback結果`);
    assertOriginalStorage(prepared.environment, beforeSnapshot);
    await prepared.environment.runtime.shutdown();
  }
}

function assertCompletedStorage(environment, afterEntries) {
  assert.equal(environment.localStorage.getItem(CONTROL_KEYS.journal), null);
  assertCanonicalLocalState(environment, afterEntries);
  const meta = JSON.parse(environment.localStorage.getItem(CONTROL_KEYS.meta));
  const workspaceRaw = environment.sessionStorage.getItem(CONTROL_KEYS.workspace);
  if (afterEntries['stat.workspaceDraft']) {
    const workspace = JSON.parse(workspaceRaw);
    assert.equal(workspace.workspaceVersion, 2);
    assert.match(workspace.workspaceId, /^workspace-restore-/);
    assert.equal(workspace.draft.selected, 'after');
  } else {
    assert.equal(workspaceRaw, null);
  }
  assert.equal(environment.sessionStorage.getItem(CONTROL_KEYS.reloadContext), null);
  assert.equal(environment.sessionStorage.getItem(CONTROL_KEYS.comparison), null);
  assert.equal(environment.sessionStorage.getItem(CONTROL_KEYS.sessionEpoch), meta.epoch);
  assert.equal(environment.localStorage.getItem(UNRELATED_KEYS.local), 'keep-local-tool-value');
  assert.equal(environment.sessionStorage.getItem(UNRELATED_KEYS.session), 'keep-session-tool-value');
}

async function rebootAndAssertCompleted(prepared) {
  await prepared.environment.runtime.shutdown();
  const reboot = runtimeApi.createStorageRuntime({
    localStorage: prepared.environment.localStorage,
    sessionStorage: prepared.environment.sessionStorage,
    locks: prepared.environment.locks,
    createEpoch: () => 'epoch-post-restore-reboot'
  });
  const bootResult = await reboot.boot({ role: 'app' });
  assert.equal(bootResult.ok, true, JSON.stringify(bootResult));
  assertCompletedStorage(rebootEnvironment(reboot, prepared.environment), prepared.afterEntries);
  await reboot.shutdown();
}

function rebootEnvironment(runtime, environment) {
  return {
    runtime,
    localStorage: environment.localStorage,
    sessionStorage: environment.sessionStorage,
    locks: environment.locks
  };
}

async function testPostCommitFailureBoundaries() {
  const journalKey = registryKey('control.journal');
  const workspaceKey = registryKey('stat.workspaceDraft');
  const sessionEpochKey = registryKey('control.sessionEpoch');
  const reloadContextKey = registryKey('stat.reloadContext');
  const comparisonKey = registryKey('comparison.session');
  const cases = [
    {
      label: 'commit journal readback',
      configure: environment => environment.localStorage.failAfter('getItem', journalKey, 3),
      completesDuringApply: true
    },
    {
      label: 'session workspace write',
      configure: environment => environment.sessionStorage.failAfter('setItem', workspaceKey, 0),
      completesDuringApply: false
    },
    {
      label: 'session workspace readback',
      configure: environment => environment.sessionStorage.failAfter('getItem', workspaceKey, 1),
      completesDuringApply: false
    },
    {
      label: 'session reload-context remove',
      configure: environment => environment.sessionStorage.failAfter('removeItem', reloadContextKey, 0),
      completesDuringApply: false
    },
    {
      label: 'session comparison remove',
      configure: environment => environment.sessionStorage.failAfter('removeItem', comparisonKey, 0),
      completesDuringApply: false
    },
    {
      label: 'session epoch write',
      configure: environment => environment.sessionStorage.failAfter('setItem', sessionEpochKey, 0),
      completesDuringApply: false
    },
    {
      label: 'journal remove',
      configure: environment => environment.localStorage.failAfter('removeItem', journalKey, 0),
      completesDuringApply: false
    },
    {
      label: 'journal remove readback retry',
      configure: environment => environment.localStorage.failAfter('getItem', journalKey, 5),
      completesDuringApply: true
    }
  ];

  for (const testCase of cases) {
    const prepared = await createPreparedRestore();
    testCase.configure(prepared.environment);
    const result = await prepared.restore.handle.applyRestore(prepared.restore.plan);
    if (testCase.completesDuringApply) {
      assert.equal(result.ok, true, `${testCase.label}が完了しませんでした: ${JSON.stringify(result)}`);
      assert.equal(result.value.phase, 'complete');
      assertCompletedStorage(prepared.environment, prepared.afterEntries);
      await prepared.environment.runtime.shutdown();
      continue;
    }
    assert.equal(result.ok, false, `${testCase.label}が成功扱いになりました`);
    assert.equal(result.code === 'quota' || result.code.endsWith('failed') || result.code === 'recovery-required', true);
    const journal = JSON.parse(prepared.environment.localStorage.getItem(CONTROL_KEYS.journal));
    assert.equal(journal.phase, 'session-pending', testCase.label);
    assert.deepEqual(
      canonicalUserDatasetsFromStorage(prepared.environment.localStorage),
      canonicalUserDatasetsFromEntries(prepared.afterEntries)
    );
    assertNoSensitiveRestoreLogs(prepared.environment);
    await rebootAndAssertCompleted(prepared);
  }
}

async function testJournalSizeLimit() {
  const seed = seedEnvironment('before');
  const environment = createEnvironment(seed);
  const packageValue = await createBackup(createEntries('after'));
  for (const entry of registryApi.userEntries) {
    if (entry.area === 'localStorage') {
      environment.localStorage.values.set(entry.key, 'x'.repeat(1_200_000));
    }
  }
  await boot(environment);
  const restore = await beginRestore(environment, packageValue);
  const before = snapshotStorage(environment);
  const result = await restore.handle.applyRestore(restore.plan);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'oversize');
  assertOriginalStorage(environment, before);
  await environment.runtime.shutdown();
}

(async () => {
  await testApplyAndSessionRebuild();
  await testAuxiliaryExclusionThroughRuntime();
  await testLegacySavedStatesRefuseBeforeRestore();
  testRollbackPreviewControlPath();
  await testRollbackAndPreparedRecovery();
  await testCommittedSessionPendingRecovery();
  await testCorruptJournalStopsBoot();
  await testRestoreFailureBoundaries();
  await testPostCommitFailureBoundaries();
  await testJournalSizeLimit();
  console.log('storage restore tests passed: apply, rollback, boot recovery, session pending, corrupt journal, failure matrix, quota, journal limit');
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
