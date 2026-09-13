#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const backup = require('../storage-backup.js');

const ROOT = path.resolve(__dirname, '..');

function readSource(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function extractFunction(source, name) {
  const signature = new RegExp(`function\\s+${name}\\s*\\(`);
  const match = signature.exec(source);
  assert.ok(match, `関数を抽出できません: ${name}`);
  const openParen = source.indexOf('(', match.index);
  let parameterDepth = 0;
  let closeParen = -1;
  let parameterQuote = '';
  for (let index = openParen; index < source.length; index += 1) {
    const char = source[index];
    if (parameterQuote) {
      if (char === '\\') index += 1;
      else if (char === parameterQuote) parameterQuote = '';
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      parameterQuote = char;
      continue;
    }
    if (char === '(') parameterDepth += 1;
    if (char === ')') {
      parameterDepth -= 1;
      if (parameterDepth === 0) {
        closeParen = index;
        break;
      }
    }
  }
  assert.ok(closeParen >= 0, `関数引数の閉じ括弧がありません: ${name}`);
  const openBrace = source.indexOf('{', closeParen);
  assert.ok(openBrace >= 0, `関数本体がありません: ${name}`);
  const functionStart = source.slice(Math.max(0, match.index - 6), match.index) === 'async '
    ? match.index - 6
    : match.index;

  let depth = 0;
  let quote = '';
  let template = false;
  for (let index = openBrace; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quote) {
      if (char === '\\') {
        index += 1;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (template) {
      if (char === '\\') {
        index += 1;
      } else if (char === '`') {
        template = false;
      }
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
      quote = char;
      continue;
    }
    if (char === '`') {
      template = true;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(functionStart, index + 1);
    }
  }
  assert.fail(`関数の閉じ括弧を抽出できません: ${name}`);
}

function extractClass(source, name) {
  const signature = new RegExp(`class\\s+${name}\\s*`);
  const match = signature.exec(source);
  assert.ok(match, `classを抽出できません: ${name}`);
  const openBrace = source.indexOf('{', match.index + match[0].length);
  assert.ok(openBrace >= 0, `class本体がありません: ${name}`);

  let depth = 0;
  let quote = '';
  let template = false;
  for (let index = openBrace; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = '';
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
      quote = char;
      continue;
    }
    if (char === '`') {
      template = true;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(match.index, index + 1);
    }
  }
  assert.fail(`classの閉じ括弧を抽出できません: ${name}`);
}

class RecordingStorage {
  constructor(initial = {}, options = {}) {
    this.values = new Map(Object.entries(initial).map(([key, value]) => [String(key), String(value)]));
    this.calls = [];
    this.failMethods = new Set();
    this.failKeys = new Set();
    this.failOperations = new Set();
    this.area = options.area || 'unknown';
    this.trace = options.trace || null;
  }

  traceEvent(event) {
    if (this.trace) this.trace.push({
      source: 'storage',
      area: this.area,
      ...event
    });
  }

  maybeFail(method, key) {
    const operation = `${method}:${key == null ? '' : String(key)}`;
    if (
      this.failMethods.has(method)
      || (key != null && this.failKeys.has(String(key)))
      || this.failOperations.has(operation)
    ) {
      throw new Error(`injected ${method} failure for ${key || '(none)'}`);
    }
  }

  getItem(key) {
    const safeKey = String(key);
    this.calls.push({ method: 'getItem', key: safeKey });
    this.traceEvent({ phase: 'attempt', method: 'getItem', key: safeKey });
    try {
      this.maybeFail('getItem', safeKey);
      const value = this.values.has(safeKey) ? this.values.get(safeKey) : null;
      this.traceEvent({ phase: 'success', method: 'getItem', key: safeKey, value });
      return value;
    } catch (error) {
      this.traceEvent({ phase: 'failure', method: 'getItem', key: safeKey, error: error.message });
      throw error;
    }
  }

  setItem(key, value) {
    const safeKey = String(key);
    this.calls.push({ method: 'setItem', key: safeKey });
    const stringValue = String(value);
    this.traceEvent({ phase: 'attempt', method: 'setItem', key: safeKey, value: stringValue });
    try {
      this.maybeFail('setItem', safeKey);
      this.values.set(safeKey, stringValue);
      this.traceEvent({ phase: 'success', method: 'setItem', key: safeKey, value: stringValue });
    } catch (error) {
      this.traceEvent({ phase: 'failure', method: 'setItem', key: safeKey, value: stringValue, error: error.message });
      throw error;
    }
  }

  removeItem(key) {
    const safeKey = String(key);
    this.calls.push({ method: 'removeItem', key: safeKey });
    this.traceEvent({ phase: 'attempt', method: 'removeItem', key: safeKey });
    try {
      this.maybeFail('removeItem', safeKey);
      this.values.delete(safeKey);
      this.traceEvent({ phase: 'success', method: 'removeItem', key: safeKey });
    } catch (error) {
      this.traceEvent({ phase: 'failure', method: 'removeItem', key: safeKey, error: error.message });
      throw error;
    }
  }

  raw(key) {
    return this.values.has(String(key)) ? this.values.get(String(key)) : null;
  }
}

function loadFunctions(source, names, contextValues = {}) {
  const context = {
    console: { warn() {}, log() {} },
    isStorageRuntimeError(error) {
      return error?.name === 'StorageRuntimeError';
    },
    createStorageRuntimeError(code, operation = 'read', id = '') {
      const error = new Error(`storage ${code}`);
      error.name = 'StorageRuntimeError';
      error.result = {
        ok: false,
        code,
        operation,
        ...(id ? { id } : {}),
        retryable: ['busy', 'read-failed', 'write-failed', 'remove-failed'].includes(code)
      };
      return error;
    },
    createDpsStorageRuntimeError(code, operation = 'read', id = '') {
      const error = new Error(`storage ${code}`);
      error.name = 'StorageRuntimeError';
      error.result = {
        ok: false,
        code,
        operation,
        id,
        retryable: ['busy', 'read-failed', 'write-failed', 'remove-failed'].includes(code)
      };
      return error;
    },
    parseStorageJson(raw, id) {
      try {
        return JSON.parse(raw);
      } catch {
        throw context.createStorageRuntimeError('recovery-required', 'read', id);
      }
    },
    validateSharedStateSlotStorePayload(value) {
      if (!value || typeof value !== 'object' || Array.isArray(value)
        || Number(value.schemaVersion) !== 2
        || !value.slots || typeof value.slots !== 'object' || Array.isArray(value.slots)
        || !Number.isInteger(Number(value.storeRevision)) || Number(value.storeRevision) < 0) {
        throw context.createStorageRuntimeError('recovery-required', 'read', 'stat.slotStore');
      }
      Object.entries(value.slots).forEach(([slot, entry]) => {
        if (!/^[1-6]$/.test(slot)
          || !entry || typeof entry !== 'object' || Array.isArray(entry)
          || !entry.snapshot || typeof entry.snapshot !== 'object' || Array.isArray(entry.snapshot)
          || !Number.isInteger(Number(entry.slotRevision)) || Number(entry.slotRevision) < 1) {
          throw context.createStorageRuntimeError('recovery-required', 'read', 'stat.slotStore');
        }
      });
      return value;
    },
    reportDpsStorageFailure() {
      return false;
    },
    reportStorageFailure() {},
    ...contextValues
  };
  if (!Object.prototype.hasOwnProperty.call(context, 'storageLocal') && context.localStorage) {
    context.storageLocal = context.localStorage;
  }
  if (!Object.prototype.hasOwnProperty.call(context, 'storageSession') && context.sessionStorage) {
    context.storageSession = context.sessionStorage;
  }
  if (context.window && !context.window.TRICKCAL_STORAGE_FACADE) {
    const local = context.storageLocal || context.localStorage || context.window.localStorage;
    const session = context.storageSession || context.sessionStorage || context.window.sessionStorage;
    if (local || session) {
      context.window.TRICKCAL_STORAGE_FACADE = { localStorage: local, sessionStorage: session };
    }
  }
  if (!Object.prototype.hasOwnProperty.call(context, 'storageLocal') && context.window?.TRICKCAL_STORAGE_FACADE?.localStorage) {
    context.storageLocal = context.window.TRICKCAL_STORAGE_FACADE.localStorage;
  }
  if (!Object.prototype.hasOwnProperty.call(context, 'storageSession') && context.window?.TRICKCAL_STORAGE_FACADE?.sessionStorage) {
    context.storageSession = context.window.TRICKCAL_STORAGE_FACADE.sessionStorage;
  }
  vm.createContext(context);
  const definitions = names.map(name => extractFunction(source, name));
  definitions.forEach((definition, index) => {
    try {
      vm.runInContext(definition, context, { filename: `storage-baseline-extracted-${names[index]}.js` });
    } catch (error) {
      error.message = `${names[index]}の抽出結果を評価できません: ${error.message}`;
      throw error;
    }
  });
  const references = names.map(name => `${name}: ${name}`).join(',\n');
  vm.runInContext(`this.__functions = { ${references} };`, context, {
    filename: 'storage-baseline-extracted.js'
  });
  return { context, functions: context.__functions };
}

function extractEventRegistration(source, marker) {
  const start = source.indexOf(marker);
  assert.ok(start >= 0, `イベント登録を抽出できません: ${marker}`);
  let parentheses = 0;
  let braces = 0;
  let brackets = 0;
  let quote = '';
  let template = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = '';
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
    if (char === "'" || char === '"') quote = char;
    else if (char === '`') template = true;
    else if (char === '(') parentheses += 1;
    else if (char === ')') parentheses -= 1;
    else if (char === '{') braces += 1;
    else if (char === '}') braces -= 1;
    else if (char === '[') brackets += 1;
    else if (char === ']') brackets -= 1;
    else if (char === ';' && parentheses === 0 && braces === 0 && brackets === 0) {
      return source.slice(start, index + 1);
    }
  }
  assert.fail(`イベント登録の終端を抽出できません: ${marker}`);
}

function countOccurrences(source, needle) {
  let count = 0;
  let offset = 0;
  while (true) {
    const index = source.indexOf(needle, offset);
    if (index < 0) return count;
    count += 1;
    offset = index + needle.length;
  }
}

async function testStatBootCatchScope() {
  const errors = [];
  const bootPromise = Promise.resolve({ ok: true });
  const context = {
    window: { TRICKCAL_STORAGE_BOOT: bootPromise },
    console: {
      error(error) {
        errors.push(error);
      }
    }
  };
  vm.runInNewContext(readSource('stat-prototype.js'), context, {
    filename: 'stat-prototype-boot-catch.js'
  });
  await bootPromise;
  await Promise.resolve();
  assert.equal(errors.length, 1, 'stat起動失敗が共通catchへ到達しません');
  assert.notEqual(errors[0]?.name, 'ReferenceError', 'stat起動失敗catchのreportStorageFailureがスコープ外です');
  const source = readSource('stat-prototype.js');
  assert.ok(
    source.indexOf('function reportStorageFailure') < source.indexOf('const storageBoot'),
    '起動catchのreportStorageFailureがboot promiseの外へ定義されていません'
  );
}

async function testStatStorageBehavior() {
  const slotKey = 'trickcal_stat_slots_v2';
  const workspaceKey = 'trickcal_stat_workspace_v2';
  const liveKey = 'trickcal_stat_live_v2';
  const legacyKey = 'trickcal_stat_prototype_v1';
  const slotStore = new RecordingStorage({
    [slotKey]: JSON.stringify({ schemaVersion: 2, storeRevision: 0, slots: {} })
  });
  const sessionStorage = new RecordingStorage();
  const messages = [];
  const lockCalls = [];
  const cardMigration = loadFunctions(readSource('cards.js'), [
    'resolveCardIdAlias',
    'migrateCardStateMap'
  ], {
    CARD_ID_ALIASES: {
      relic_yomi_flower: 'artifact_yomi_moonflower'
    }
  }).functions.migrateCardStateMap;
  const loaded = loadFunctions(readSource('stat-prototype.js'), [
    'normalizeStateSlot',
    'cloneJson',
    'migrateSavedStateSlots',
    'normalizeSharedStateSlotStore',
    'loadSharedStateSlotStore',
    'readLatestSharedStateSlotStore',
    'getSharedStateSnapshots',
    'getSharedSlotRevision',
    'syncSharedStateSlotStore',
    'loadStateWorkspace',
    'createStateWorkspaceDraft',
    'persistStateWorkspace',
    'publishLiveState',
    'postStateSyncMessage',
    'withStateSlotStoreLock',
    'writeSharedStateSlot',
    'removeSharedStateSlot'
  ], {
    localStorage: slotStore,
    sessionStorage,
    window: { localStorage: slotStore, sessionStorage },
    navigator: {
      locks: {
        request(name, options, task) {
          lockCalls.push({ name, options });
          return Promise.resolve(task());
        }
      }
    },
    stateSyncChannel: {
      postMessage(message) {
        messages.push(message);
      }
    },
    TAB_INSTANCE_ID: 'tab-baseline',
    STATE_SLOT_STORAGE_KEY: slotKey,
    STATE_WORKSPACE_STORAGE_KEY: workspaceKey,
    STATE_LIVE_STORAGE_KEY: liveKey,
    STORAGE_KEY: legacyKey,
    sharedStateSlotStore: { schemaVersion: 2, storeRevision: 0, slots: {} },
    appState: { savedStates: {}, activeId: 'baseline' },
    view: { stateSlot: 1, id: 'baseline' },
    initialWorkspaceState: { workspaceId: 'workspace-baseline' },
    stateSlotBaseRevision: 0,
    migrateCardStateMap: cardMigration
  });
  const stat = loaded.functions;

  const savedOther = await stat.withStateSlotStoreLock(() => stat.writeSharedStateSlot(
    2,
    { savedAt: '2026-09-11T00:00:00.000Z', value: 'other-slot' },
    0
  ));
  assert.equal(savedOther.ok, true, '別slot保存が成功しません');
  const saved = await stat.withStateSlotStoreLock(() => stat.writeSharedStateSlot(
    1,
    { savedAt: '2026-09-12T00:00:00.000Z', value: 'saved' },
    0
  ));
  assert.equal(saved.ok, true, 'slot保存が成功しません');
  assert.equal(JSON.parse(slotStore.raw(slotKey)).slots['1'].slotRevision, 1, 'slotRevisionが進みません');
  assert.equal(lockCalls[0].name, 'trickcal-stat-slots-v2', 'Navigator Lock名が変わっています');

  const reloaded = loadFunctions(readSource('stat-prototype.js'), [
    'normalizeStateSlot',
    'cloneJson',
    'migrateSavedStateSlots',
    'normalizeSharedStateSlotStore',
    'loadSharedStateSlotStore'
  ], {
    localStorage: slotStore,
    STATE_SLOT_STORAGE_KEY: slotKey,
    migrateCardStateMap: cardMigration
  });
  const reloadedStore = reloaded.functions.loadSharedStateSlotStore({});
  assert.equal(reloadedStore.slots['1'].snapshot.value, 'saved', '新contextからslotを再読込できません');

  const conflict = await stat.withStateSlotStoreLock(() => stat.writeSharedStateSlot(
    1,
    { savedAt: '2026-09-12T00:00:01.000Z', value: 'stale' },
    0
  ));
  assert.equal(conflict.ok, false, 'stale revisionが拒否されません');
  assert.equal(conflict.conflict, true, 'stale revisionが競合として返りません');
  assert.equal(JSON.parse(slotStore.raw(slotKey)).slots['1'].snapshot.value, 'saved', '競合で保存値が上書きされました');

  slotStore.failMethods.add('setItem');
  assert.throws(
    () => stat.writeSharedStateSlot(1, { value: 'write-failure' }, 1),
    /injected setItem failure/
  );
  assert.equal(JSON.parse(slotStore.raw(slotKey)).slots['1'].snapshot.value, 'saved', 'slot書込失敗で既存値が変わりました');
  assert.throws(
    () => stat.removeSharedStateSlot(2, 1),
    /injected setItem failure/
  );
  assert.equal(JSON.parse(slotStore.raw(slotKey)).slots['2'].snapshot.value, 'other-slot', 'slot削除失敗で既存値が消えました');
  slotStore.failMethods.clear();

  const removed = await stat.withStateSlotStoreLock(() => stat.removeSharedStateSlot(1, 1));
  assert.equal(removed.ok, true, 'slot削除が成功しません');
  assert.equal(JSON.parse(slotStore.raw(slotKey)).slots['1'], undefined, 'slot項目がstoreから削除されません');
  assert.equal(JSON.parse(slotStore.raw(slotKey)).slots['2'].snapshot.value, 'other-slot', '対象外slotが削除で変わりました');
  slotStore.failMethods.add('getItem');
  assert.throws(
    () => stat.readLatestSharedStateSlotStore(),
    error => error?.name === 'StorageRuntimeError' && error.result?.code === 'read-failed',
    'slot読込失敗をメモリfallbackへ変換しません'
  );
  slotStore.failMethods.clear();

  // 破損slotは不存在と区別し、生データを保持したまま起動を止める。
  const corruptSlotStore = new RecordingStorage({ [slotKey]: '{broken' });
  const migrationLoaded = loadFunctions(readSource('stat-prototype.js'), [
    'normalizeStateSlot',
    'cloneJson',
    'migrateSavedStateSlots',
    'normalizeSharedStateSlotStore',
    'loadSharedStateSlotStore'
  ], {
    localStorage: corruptSlotStore,
    STATE_SLOT_STORAGE_KEY: slotKey,
    migrateCardStateMap: cardMigration
  });
  assert.throws(
    () => migrationLoaded.functions.loadSharedStateSlotStore({
      2: {
        savedAt: 'legacy',
        activeId: 'Momo',
        cards: { relic_yomi_flower: { star: 5 } },
        value: 'fallback'
      }
    }),
    error => error?.name === 'StorageRuntimeError' && error.result?.code === 'recovery-required',
    '破損slotを旧savedStatesの移行へ流す反例が失敗しません'
  );
  assert.equal(corruptSlotStore.raw(slotKey), '{broken', '破損slotの生データを上書きしました');

  loaded.context.sessionStorage = sessionStorage;
  loaded.context.storageSession = sessionStorage;
  loaded.context.window.sessionStorage = sessionStorage;
  loaded.context.localStorage = slotStore;
  loaded.context.storageLocal = slotStore;
  loaded.context.window.localStorage = slotStore;
  loaded.context.appState = { savedStates: { stale: true }, activeId: 'before', payload: 'draft' };
  loaded.context.view = { stateSlot: 1, id: 'after' };
  loaded.context.stateSlotBaseRevision = 7;
  stat.persistStateWorkspace();
  const workspace = JSON.parse(sessionStorage.raw(workspaceKey));
  assert.equal(workspace.workspaceVersion, 2, 'workspace versionが変わっています');
  assert.equal(workspace.baseSlotRevision, 7, 'workspace base revisionが保存されません');
  assert.equal(workspace.draft.activeId, 'after', 'workspaceのactiveIdが保存されません');
  assert.equal(Object.prototype.hasOwnProperty.call(workspace.draft, 'savedStates'), false, 'workspaceへsavedStatesが混入しています');
  assert.equal(stat.loadStateWorkspace().draft.activeId, 'after', 'workspaceを再読込できません');
  sessionStorage.setItem(workspaceKey, '{broken');
  assert.throws(
    () => stat.loadStateWorkspace(),
    error => error?.name === 'StorageRuntimeError' && error.result?.code === 'recovery-required',
    '破損workspaceを不存在へfallbackしません'
  );
  assert.equal(sessionStorage.raw(workspaceKey), '{broken', '破損workspaceの生データを上書きしました');
  sessionStorage.failMethods.add('setItem');
  assert.throws(
    () => stat.persistStateWorkspace(),
    error => error?.name === 'StorageRuntimeError' && error.result?.code === 'write-failed',
    'workspace保存失敗を握りつぶしています'
  );
  sessionStorage.failMethods.clear();

  const publishStorage = new RecordingStorage();
  const publishMessages = [];
  loaded.context.localStorage = publishStorage;
  loaded.context.storageLocal = publishStorage;
  loaded.context.window.localStorage = publishStorage;
  loaded.context.stateSyncChannel = { postMessage(message) { publishMessages.push(message); } };
  loaded.context.appState = { savedStates: { 1: { value: 'published' } }, activeId: 'publisher' };
  loaded.context.view = { stateSlot: 1, id: 'publisher' };
  stat.publishLiveState();
  assert.deepEqual(
    publishStorage.calls.map(call => `${call.method}:${call.key}`),
    [`getItem:${liveKey}`, `setItem:${liveKey}`, `setItem:${legacyKey}`],
    'live/legacyの書込順が変わっています'
  );
  assert.equal(publishMessages.length, 1, 'live publish通知が発行されません');

  const partialStorage = new RecordingStorage();
  partialStorage.failKeys.add(legacyKey);
  loaded.context.localStorage = partialStorage;
  loaded.context.storageLocal = partialStorage;
  loaded.context.window.localStorage = partialStorage;
  loaded.context.stateSyncChannel = { postMessage(message) { publishMessages.push(message); } };
  assert.throws(
    () => stat.publishLiveState(),
    error => error?.name === 'StorageRuntimeError' && error.result?.code === 'write-failed',
    'live/legacy片側失敗を握りつぶしています'
  );
  assert.ok(partialStorage.raw(liveKey), '片側失敗時にlive mirrorまで失われています');
  assert.equal(partialStorage.raw(legacyKey), null, '片側失敗のlegacy書込が残っています');
  assert.equal(publishMessages.length, 1, '片側失敗後にlive通知を発行しました');
}

function runPersistStateCase({
  failSession = false,
  failLiveRead = false,
  failLiveWrite = false,
  failLegacy = false,
  source = null
} = {}) {
  const workspaceKey = 'trickcal_stat_workspace_v2';
  const liveKey = 'trickcal_stat_live_v2';
  const legacyKey = 'trickcal_stat_prototype_v1';
  const trace = [];
  const sessionStorage = new RecordingStorage({ [workspaceKey]: 'previous-workspace' }, {
    area: 'sessionStorage',
    trace
  });
  const localStorage = new RecordingStorage({
    [liveKey]: JSON.stringify({ revision: 4, snapshot: { value: 'previous-live' } }),
    [legacyKey]: 'previous-legacy'
  }, { area: 'localStorage', trace });
  const messages = [];
  if (failSession) sessionStorage.failOperations.add(`setItem:${workspaceKey}`);
  if (failLiveRead) localStorage.failOperations.add(`getItem:${liveKey}`);
  if (failLiveWrite) localStorage.failOperations.add(`setItem:${liveKey}`);
  if (failLegacy) localStorage.failOperations.add(`setItem:${legacyKey}`);
  const loaded = loadFunctions(source || readSource('stat-prototype.js'), [
    'cloneJson',
    'createStateWorkspaceDraft',
    'persistStateWorkspace',
    'postStateSyncMessage',
    'publishLiveState',
    'persistState'
  ], {
    localStorage,
    sessionStorage,
    appState: { syncRevision: 5, savedStates: { 1: { value: 'saved' } }, activeId: 'Momo', payload: 'draft' },
    view: { stateSlot: 1, id: 'Momo' },
    initialWorkspaceState: { workspaceId: 'workspace-baseline' },
    stateSlotBaseRevision: 3,
    isLiveStatePublisher: true,
    document: { visibilityState: 'visible' },
    stateSyncChannel: {
      postMessage(message) {
        trace.push({ source: 'notification', phase: 'attempt', message });
        try {
          messages.push(message);
          trace.push({ source: 'notification', phase: 'success', message });
        } catch (error) {
          trace.push({ source: 'notification', phase: 'failure', message, error: error.message });
          throw error;
        }
      }
    },
    TAB_INSTANCE_ID: 'persist-baseline',
    STATE_WORKSPACE_STORAGE_KEY: workspaceKey,
    STATE_LIVE_STORAGE_KEY: liveKey,
    STORAGE_KEY: legacyKey
  });
  let persistReturn;
  let persistError = null;
  trace.push({ source: 'persistState', method: 'call', phase: 'attempt' });
  try {
    persistReturn = loaded.functions.persistState();
    trace.push({ source: 'persistState', method: 'call', phase: 'return', value: persistReturn });
  } catch (error) {
    persistError = error;
    trace.push({ source: 'persistState', method: 'call', phase: 'throw', error: error.message });
  }
  assert.equal(persistError, null, 'persistStateの現行例外境界が変わっています');
  const live = localStorage.raw(liveKey);
  return {
    ...loaded,
    localStorage,
    sessionStorage,
    messages,
    trace,
    persistReturn,
    persistError,
    live: live ? JSON.parse(live) : null,
    legacy: localStorage.raw(legacyKey),
    liveUpdated: live !== JSON.stringify({ revision: 4, snapshot: { value: 'previous-live' } }),
    legacyUpdated: localStorage.raw(legacyKey) !== 'previous-legacy',
    workspaceUpdated: sessionStorage.raw(workspaceKey) !== 'previous-workspace'
  };
}

function testPersistStateBehavior() {
  const cases = [
    { name: 'normal', options: {}, expectedLive: true, expectedLegacy: true, expectedWorkspace: true, expectedLocalCalls: 3 },
    { name: 'session failure', options: { failSession: true }, expectedLive: true, expectedLegacy: true, expectedWorkspace: false, expectedLocalCalls: 3 },
    {
      name: 'live read failure',
      options: { failLiveRead: true },
      expectedLive: false,
      expectedLegacy: false,
      expectedWorkspace: true,
      expectedLocalCalls: 1
    },
    {
      name: 'live write failure',
      options: { failLiveWrite: true },
      expectedLive: false,
      expectedLegacy: false,
      expectedWorkspace: true,
      expectedLocalCalls: 2
    },
    { name: 'legacy failure', options: { failLegacy: true }, expectedLive: true, expectedLegacy: false, expectedWorkspace: true, expectedLocalCalls: 3 }
  ];
  for (const testCase of cases) {
    const result = runPersistStateCase(testCase.options);
    const expectedTrace = [
      ['persistState', 'call', 'attempt'],
      ...[
        ['sessionStorage', 'setItem', testCase.options.failSession ? 'failure' : 'success'],
        ['localStorage', 'getItem', testCase.options.failLiveRead ? 'failure' : 'success'],
        ...(!testCase.options.failLiveRead
          ? [['localStorage', 'setItem', testCase.options.failLiveWrite ? 'failure' : 'success']]
          : []),
        ...(!testCase.options.failLiveRead && !testCase.options.failLiveWrite
          ? [['localStorage', 'setItem', testCase.options.failLegacy ? 'failure' : 'success']]
          : []),
      ].flatMap(([area, method, resultPhase]) => [
        [area, method, 'attempt'],
        [area, method, resultPhase]
      ]),
      ...(!testCase.options.failLiveRead && !testCase.options.failLiveWrite && !testCase.options.failLegacy
        ? [
            ['notification', 'publish', 'attempt'],
            ['notification', 'publish', 'success']
          ]
        : []),
      ['persistState', 'call', 'return']
    ];
    assert.deepEqual(
      result.trace.map(event => [event.area || event.source, event.method || 'publish', event.phase]),
      expectedTrace,
      `${testCase.name}: Storage・通知をまたぐ実行順が変わりました`
    );
    assert.equal(result.context.appState.syncRevision, 6, `${testCase.name}: persistStateのrevision更新がありません`);
    assert.equal(
      result.persistReturn,
      !testCase.options.failSession && !testCase.options.failLiveRead
        && !testCase.options.failLiveWrite && !testCase.options.failLegacy,
      `${testCase.name}: persistStateの保存結果が変わりました`
    );
    assert.deepEqual(
      result.sessionStorage.calls.map(call => `${call.method}:${call.key}`),
      ['setItem:trickcal_stat_workspace_v2'],
      `${testCase.name}: workspace保存の試行順が変わりました`
    );
    const expectedLocalCalls = testCase.options.failLiveRead
      ? ['getItem:trickcal_stat_live_v2']
      : [
          'getItem:trickcal_stat_live_v2',
          'setItem:trickcal_stat_live_v2',
          'setItem:trickcal_stat_prototype_v1'
        ].slice(0, testCase.expectedLocalCalls);
    assert.deepEqual(
      result.localStorage.calls.map(call => `${call.method}:${call.key}`),
      expectedLocalCalls,
      `${testCase.name}: live／legacy保存の試行順が変わりました`
    );
    assert.equal(result.workspaceUpdated, testCase.expectedWorkspace, `${testCase.name}: workspace結果が想定外です`);
    assert.equal(result.liveUpdated, testCase.expectedLive, `${testCase.name}: live結果が想定外です`);
    assert.equal(result.legacyUpdated, testCase.expectedLegacy, `${testCase.name}: legacy結果が想定外です`);
    const expectedMessageCount = testCase.options.failLiveRead || testCase.options.failLiveWrite || testCase.options.failLegacy ? 0 : 1;
    assert.equal(result.messages.length, expectedMessageCount, `${testCase.name}: live通知の回数が想定外です`);
    if (expectedMessageCount) {
      assert.equal(result.messages[0].type, 'live-published', `${testCase.name}: live通知種別が変わりました`);
      assert.equal(result.messages[0].revision, 5, `${testCase.name}: live通知revisionが想定外です`);
    }
    if (testCase.expectedWorkspace) {
      const workspace = JSON.parse(result.sessionStorage.raw('trickcal_stat_workspace_v2'));
      assert.equal(workspace.draft.activeId, 'Momo', `${testCase.name}: workspaceの保存内容が変わりました`);
      assert.equal(Object.prototype.hasOwnProperty.call(workspace.draft, 'savedStates'), false, `${testCase.name}: workspaceへsavedStatesが混入しました`);
    }
    if (testCase.expectedLive) {
      assert.equal(result.live?.revision, testCase.expectedLiveRevision || 5, `${testCase.name}: live revisionが想定外です`);
    }
    if (!testCase.expectedLegacy) assert.equal(result.legacy, 'previous-legacy', `${testCase.name}: legacy失敗で既存値が変わりました`);
    if (!testCase.expectedWorkspace) assert.equal(result.sessionStorage.raw('trickcal_stat_workspace_v2'), 'previous-workspace', `${testCase.name}: workspace失敗で既存値が変わりました`);
  }

  const persistSource = readSource('stat-prototype.js');
  const original = runPersistStateCase({ source: persistSource });
  const originalTrace = original.trace.map(event => [
    event.area || event.source,
    event.method || 'publish',
    event.phase
  ]);
  const mutatedSource = persistSource.replace(
    /(function persistState\(\) \{[\s\S]*?)persistStateWorkspace\(\);/,
    '$1publishLiveState();'
  );
  assert.notEqual(mutatedSource, persistSource, 'persistState保存順序の変異を作成できません');
  const mutated = runPersistStateCase({ source: mutatedSource });
  assert.throws(
    () => assert.deepEqual(
      mutated.trace.map(event => [event.area || event.source, event.method || 'publish', event.phase]),
      originalTrace
    ),
    /保存|deep/i,
    '保存順序を変えた反例が共通ログassertionで失敗しません'
  );
}

function runLoadStateStartupCase({ workspace, legacy, includeSlotStore = true }) {
  const slotKey = 'trickcal_stat_slots_v2';
  const legacyKey = 'trickcal_stat_prototype_v1';
  const workspaceKey = 'trickcal_stat_workspace_v2';
  const localValues = {
    [legacyKey]: JSON.stringify(legacy),
    'trickcal_formation_damage_settings_v1': 'startup-local-keep'
  };
  if (includeSlotStore) {
    localValues[slotKey] = JSON.stringify({ schemaVersion: 2, storeRevision: 1, slots: {
      '2': { slotRevision: 1, snapshot: { activeId: 'slot' } }
    } });
  }
  const localStorage = new RecordingStorage(localValues);
  const workspaceRaw = workspace == null
    ? null
    : (typeof workspace === 'string' ? workspace : JSON.stringify(workspace));
  const sessionValues = { 'trickcal:dps-settings:v1': 'startup-session-keep' };
  if (workspaceRaw != null) sessionValues[workspaceKey] = workspaceRaw;
  const sessionStorage = new RecordingStorage(sessionValues);
  const cardMigration = loadFunctions(readSource('cards.js'), [
    'resolveCardIdAlias',
    'migrateCardStateMap'
  ], { CARD_ID_ALIASES: {} }).functions.migrateCardStateMap;
  const loaded = loadFunctions(readSource('stat-prototype.js'), [
    'normalizeStateSlot',
    'cloneJson',
    'migrateSavedStateSlots',
    'normalizeFormationCoins',
    'createDefaultFormationRow',
    'createDefaultFormation',
    'normalizeFormationState',
    'normalizeFormationPresetList',
    'normalizeSharedStateSlotStore',
    'loadSharedStateSlotStore',
    'loadStateWorkspace',
    'getSharedStateSnapshots',
    'getSharedSlotRevision',
    'loadState'
  ], {
    localStorage,
    sessionStorage,
    STATE_SLOT_STORAGE_KEY: slotKey,
    STATE_WORKSPACE_STORAGE_KEY: workspaceKey,
    STORAGE_KEY: legacyKey,
    migrateCardStateMap: cardMigration,
    sharedStateSlotStore: { schemaVersion: 2, storeRevision: 0, slots: {} }
  });
  return {
    state: loaded.functions.loadState(),
    localStorage,
    sessionStorage,
    otherLocal: localStorage.raw('trickcal_formation_damage_settings_v1'),
    otherSession: sessionStorage.raw('trickcal:dps-settings:v1')
  };
}

function testLoadStateStartupBehavior() {
  const workspace = runLoadStateStartupCase({
    workspace: {
      workspaceVersion: 2,
      activeSlot: 2,
      draft: { activeId: 'workspace', syncRevision: 8, apostles: {}, research: {}, cards: {} }
    },
    legacy: { activeId: 'legacy', savedStates: {} }
  });
  assert.equal(workspace.state.activeId, 'workspace', '起動時workspace draftがlegacyより優先されません');
  assert.equal(workspace.state.activeStateSlot, 2, '起動時workspaceのactiveSlotが復元されません');
  assert.equal(workspace.state.syncRevision, 8, 'workspace draftのsyncRevisionが復元されません');
  assert.equal(workspace.state.savedStates['2'].activeId, 'slot', 'workspace起動で明示slotが変わりました');
  assert.equal(workspace.otherLocal, 'startup-local-keep', 'workspace起動で他local領域が変わりました');
  assert.equal(workspace.otherSession, 'startup-session-keep', 'workspace起動で他session領域が変わりました');

  const legacy = runLoadStateStartupCase({
    legacy: { activeId: 'legacy', syncRevision: 4, savedStates: {} }
  });
  assert.equal(legacy.state.activeId, 'legacy', 'workspaceなしでlegacy stateへfallbackしません');
  assert.equal(legacy.state.syncRevision, 4, 'legacy stateのsyncRevisionが復元されません');
  assert.equal(legacy.state.savedStates['2'].activeId, 'slot', 'legacy fallbackで明示slotが変わりました');
  assert.equal(legacy.otherLocal, 'startup-local-keep', 'legacy fallbackで他local領域が変わりました');
  assert.equal(legacy.otherSession, 'startup-session-keep', 'legacy fallbackで他session領域が変わりました');

  assert.throws(
    () => runLoadStateStartupCase({
      workspace: '{broken',
      legacy: { activeId: 'legacy-after-broken-workspace', savedStates: {} }
    }),
    error => error?.name === 'StorageRuntimeError' && error.result?.code === 'recovery-required',
    '起動時の破損workspaceをlegacy fallbackへ流す反例が失敗しません'
  );

  const oldSavedStates = runLoadStateStartupCase({
    includeSlotStore: false,
    legacy: {
      activeId: 'legacy-old-format',
      savedStates: {
        3: { activeId: 'Momo', apostles: { Momo: { rank: 4 } }, research: {}, cards: {} }
      }
    }
  });
  assert.equal(oldSavedStates.state.activeId, 'legacy-old-format', '旧savedStates形式のactiveIdが変わりました');
  assert.equal(oldSavedStates.state.savedStates['3'].activeStateSlot, 3, '旧savedStatesが実起動移行されません');
  assert.equal(oldSavedStates.localStorage.raw('trickcal_stat_slots_v2') != null, true, '旧savedStates移行storeが起動時に生成されません');
  assert.equal(oldSavedStates.otherLocal, 'startup-local-keep', '旧形式移行で他local領域が変わりました');
  assert.equal(oldSavedStates.otherSession, 'startup-session-keep', '旧形式移行で他session領域が変わりました');
}

function testDebounceAndFlushBehavior() {
  const timers = new Map();
  const cleared = [];
  const persistCalls = [];
  let nextTimerId = 1;
  let now = 0;
  function advance(milliseconds) {
    now += milliseconds;
    const dueTimers = Array.from(timers.entries())
      .filter(([, timer]) => timer.due <= now)
      .sort(([, left], [, right]) => left.due - right.due);
    dueTimers.forEach(([id, timer]) => {
      timers.delete(id);
      timer.callback();
    });
  }
  const loaded = loadFunctions(readSource('stat-prototype.js'), [
    'scheduleStateSave',
    'flushPendingStateSave'
  ], {
    stateSaveTimer: 0,
    safePersistState() {
      persistCalls.push('persist');
    },
    window: {
      setTimeout(callback, delay) {
        const id = nextTimerId++;
        timers.set(id, { callback, delay, due: now + delay });
        return id;
      },
      clearTimeout(id) {
        cleared.push(id);
        timers.delete(id);
      }
    }
  });
  loaded.functions.scheduleStateSave();
  const firstTimer = loaded.context.stateSaveTimer;
  loaded.functions.scheduleStateSave();
  const secondTimer = loaded.context.stateSaveTimer;
  assert.equal(timers.get(secondTimer).delay, 120, '保存debounceの待機時間が120msではありません');
  assert.ok(cleared.includes(firstTimer), '連続編集時に前回のdebounceが解除されません');
  advance(119);
  assert.deepEqual(persistCalls, [], '119ms時点でdebounce保存が実行されました');
  advance(1);
  assert.deepEqual(persistCalls, ['persist'], 'debounce後の保存回数が不正です');

  loaded.functions.scheduleStateSave();
  const pendingTimer = loaded.context.stateSaveTimer;
  loaded.functions.flushPendingStateSave();
  assert.deepEqual(persistCalls, ['persist', 'persist'], 'flushがpending保存を実行しません');
  assert.ok(cleared.includes(pendingTimer), 'flushがpending debounceを解除しません');
  advance(120);
  assert.deepEqual(persistCalls, ['persist', 'persist'], 'flush後に解除済みdebounceが二重保存しました');
}

function testDebounceWithRealPersistState() {
  const timers = new Map();
  const trace = [];
  const messages = [];
  let nextTimerId = 1;
  let now = 0;
  const workspaceKey = 'trickcal_stat_workspace_v2';
  const liveKey = 'trickcal_stat_live_v2';
  const legacyKey = 'trickcal_stat_prototype_v1';
  const sessionStorage = new RecordingStorage({ [workspaceKey]: 'previous-workspace' }, {
    area: 'sessionStorage',
    trace
  });
  const localStorage = new RecordingStorage({
    [liveKey]: JSON.stringify({ revision: 4, snapshot: { value: 'previous-live' } }),
    [legacyKey]: 'previous-legacy'
  }, { area: 'localStorage', trace });
  const window = {
    setTimeout(callback, delay) {
      const id = nextTimerId++;
      timers.set(id, { callback, delay, due: now + delay });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    }
  };
  const document = { visibilityState: 'visible' };
  const loaded = loadFunctions(readSource('stat-prototype.js'), [
    'cloneJson',
    'createStateWorkspaceDraft',
    'persistStateWorkspace',
    'postStateSyncMessage',
    'publishLiveState',
    'persistState',
    'safePersistState',
    'scheduleStateSave',
    'flushPendingStateSave'
  ], {
    window,
    document,
    localStorage,
    sessionStorage,
    appState: { syncRevision: 5, savedStates: {}, activeId: 'Momo', payload: 'draft' },
    view: { stateSlot: 1, id: 'Momo' },
    initialWorkspaceState: { workspaceId: 'workspace-real-timer' },
    stateSlotBaseRevision: 3,
    stateSaveTimer: 0,
    stateSyncChannel: {
      postMessage(message) {
        trace.push({ source: 'notification', phase: 'attempt', message });
        messages.push(message);
        trace.push({ source: 'notification', phase: 'success', message });
      }
    },
    isLiveStatePublisher: true,
    STATE_WORKSPACE_STORAGE_KEY: workspaceKey,
    STATE_LIVE_STORAGE_KEY: liveKey,
    STORAGE_KEY: legacyKey,
    TAB_INSTANCE_ID: 'real-timer-baseline'
  });
  const advance = milliseconds => {
    now += milliseconds;
    const dueTimers = Array.from(timers.entries())
      .filter(([, timer]) => timer.due <= now)
      .sort(([, left], [, right]) => left.due - right.due);
    dueTimers.forEach(([id, timer]) => {
      timers.delete(id);
      timer.callback();
    });
  };
  const storageAttempts = () => trace.filter(event => event.source === 'storage' && event.phase === 'attempt');

  loaded.functions.scheduleStateSave();
  const firstTimer = loaded.context.stateSaveTimer;
  assert.equal(timers.get(firstTimer).delay, 120, '実persistState経路のdebounceが120msではありません');
  advance(119);
  assert.equal(storageAttempts().length, 0, '実persistStateが119msで保存しました');
  advance(1);
  assert.equal(storageAttempts().length, 4, 'debounce満了時の実保存試行数が不正です');
  assert.equal(sessionStorage.raw(workspaceKey) !== 'previous-workspace', true, 'debounce満了時にworkspaceが保存されません');
  assert.equal(loaded.context.stateSaveTimer, 0, '実timer callback後もpending timerが残っています');

  trace.length = 0;
  loaded.functions.scheduleStateSave();
  const pendingTimer = loaded.context.stateSaveTimer;
  advance(119);
  assert.equal(storageAttempts().length, 0, '2回目の実persistStateが119msで保存しました');
  loaded.functions.flushPendingStateSave();
  const attemptsAfterFlush = storageAttempts().length;
  assert.equal(attemptsAfterFlush, 4, 'flushが実persistStateを1回実行しません');
  assert.equal(loaded.context.stateSaveTimer, 0, 'flush後に実timerが残っています');
  assert.equal(timers.has(pendingTimer), false, 'flushしたtimerが仮想時計へ残っています');
  advance(1);
  assert.equal(storageAttempts().length, attemptsAfterFlush, 'flush後に解除済みtimerが実保存を二重実行しました');
  assert.equal(messages.length, 2, '実persistStateの通知回数が保存回数と一致しません');
}

function testStateLifecycleHandlerBehavior() {
  const listeners = new Map();
  const timers = new Map();
  const clearedTimers = [];
  const trace = [];
  const messages = [];
  let nextTimerId = 1;
  let now = 0;
  const workspaceKey = 'trickcal_stat_workspace_v2';
  const liveKey = 'trickcal_stat_live_v2';
  const legacyKey = 'trickcal_stat_prototype_v1';
  const sessionStorage = new RecordingStorage({ [workspaceKey]: 'previous-workspace' }, {
    area: 'sessionStorage',
    trace
  });
  const localStorage = new RecordingStorage({
    [liveKey]: JSON.stringify({ revision: 4, snapshot: { value: 'previous-live' } }),
    [legacyKey]: 'previous-legacy'
  }, { area: 'localStorage', trace });
  const document = {
    visibilityState: 'visible',
    hasFocus() { return true; },
    addEventListener(type, handler) { listeners.set(`document:${type}`, handler); }
  };
  const window = {
    addEventListener(type, handler) { listeners.set(`window:${type}`, handler); },
    setTimeout(callback, delay) {
      const id = nextTimerId++;
      timers.set(id, { callback, delay, due: now + delay });
      return id;
    },
    clearTimeout(timer) {
      clearedTimers.push(timer);
      timers.delete(timer);
    }
  };
  const loaded = loadFunctions(readSource('stat-prototype.js'), [
    'cloneJson',
    'createStateWorkspaceDraft',
    'persistStateWorkspace',
    'postStateSyncMessage',
    'publishLiveState',
    'setupMultiTabStateSync',
    'claimLiveStatePublisher',
    'scheduleStateSave',
    'flushPendingStateSave',
    'persistState',
    'safePersistState'
  ], {
    window,
    document,
    localStorage,
    sessionStorage,
    appState: { syncRevision: 4, savedStates: { 1: { value: 'saved' } }, activeId: 'Momo', payload: 'draft' },
    view: { stateSlot: 1, id: 'Momo' },
    initialWorkspaceState: { workspaceId: 'workspace-lifecycle' },
    stateSlotBaseRevision: 3,
    stateSaveTimer: 0,
    stateSyncChannel: {
      postMessage(message) {
        trace.push({ source: 'notification', phase: 'attempt', message });
        messages.push(message);
        trace.push({ source: 'notification', phase: 'success', message });
      }
    },
    isLiveStatePublisher: true,
    STATE_SLOT_STORAGE_KEY: 'trickcal_stat_slots_v2',
    STATE_WORKSPACE_STORAGE_KEY: workspaceKey,
    STATE_LIVE_STORAGE_KEY: liveKey,
    STORAGE_KEY: legacyKey,
    STATE_SYNC_CHANNEL_NAME: 'channel',
    handleExternalStateSlotStore() {},
    readLatestSharedStateSlotStore() { return {}; },
    normalizeSharedStateSlotStore(value) { return value; },
    TAB_INSTANCE_ID: 'lifecycle-baseline'
  });
  loaded.functions.setupMultiTabStateSync();
  assert.ok(listeners.has('window:focus'), 'focus handlerが登録されません');
  assert.ok(listeners.has('window:blur'), 'blur handlerが登録されません');
  assert.ok(listeners.has('window:storage'), 'storage handlerが登録されません');

  const initSource = extractFunction(readSource('stat-prototype.js'), 'init');
  const lifecycleMarkers = [
    "window.addEventListener('beforeunload'",
    "window.addEventListener('pagehide'",
    "document.addEventListener('visibilitychange'"
  ];
  lifecycleMarkers.forEach(marker => {
    assert.equal(countOccurrences(initSource, marker), 0, `実initへ共通lifecycle外のイベント登録が残っています: ${marker}`);
  });
  assert.match(initSource, /storageRuntime\?\.registerParticipant/, 'statの保存participant接続がありません');

  const lifecycleWindow = window;
  lifecycleWindow.document = document;
  const lifecycleLoaded = loadFunctions(readSource('storage-bootstrap.js'), ['installLifecycle'], {
    root: lifecycleWindow,
    lifecycleRuntimes: new WeakSet(),
    showLifecycleFailure() {}
  });
  const lifecycleRuntime = {
    flushParticipants() {
      const flushed = loaded.functions.flushPendingStateSave();
      loaded.context.isLiveStatePublisher = false;
      return flushed ? { ok: true } : { ok: false, code: 'write-failed', retryable: true };
    },
    resumeParticipants() {
      loaded.functions.claimLiveStatePublisher();
      return { ok: true };
    },
    suspendForPagehide() {
      return this.flushParticipants();
    },
    resumeAfterPageshow() {
      this.resumeParticipants();
      return { ok: true };
    }
  };
  lifecycleLoaded.functions.installLifecycle(lifecycleRuntime);
  assert.ok(listeners.has('window:beforeunload'), 'beforeunload handlerが登録されません');
  assert.ok(listeners.has('window:pagehide'), 'pagehide handlerが登録されません');
  assert.ok(listeners.has('document:visibilitychange'), 'visibilitychange handlerが登録されません');
  assert.ok(listeners.has('window:pageshow'), 'pageshow handlerが登録されません');

  const traceShape = () => trace.map(event => [
    event.area || event.source,
    event.method || 'publish',
    event.phase
  ]);
  const fullPersistTrace = [
    ['sessionStorage', 'setItem', 'attempt'],
    ['sessionStorage', 'setItem', 'success'],
    ['localStorage', 'getItem', 'attempt'],
    ['localStorage', 'getItem', 'success'],
    ['localStorage', 'setItem', 'attempt'],
    ['localStorage', 'setItem', 'success'],
    ['localStorage', 'setItem', 'attempt'],
    ['localStorage', 'setItem', 'success'],
    ['notification', 'publish', 'attempt'],
    ['notification', 'publish', 'success']
  ];
  const liveOnlyTrace = fullPersistTrace.slice(2);

  loaded.functions.scheduleStateSave();
  const blurTimer = loaded.context.stateSaveTimer;
  assert.equal(timers.get(blurTimer).delay, 120, 'イベント経路のdebounceが120msではありません');
  now += 119;
  assert.equal(trace.length, 0, 'blur前の119msで実保存が実行されました');
  listeners.get('window:blur')();
  assert.deepEqual(clearedTimers, [blurTimer], 'blur時に実pending debounceを解除しません');
  assert.deepEqual(traceShape(), fullPersistTrace, 'blur時の実persistStateの保存・通知順が変わりました');
  assert.equal(JSON.parse(sessionStorage.raw(workspaceKey)).draft.activeId, 'Momo', 'blur時のworkspace保存内容が変わりました');
  assert.equal(loaded.context.isLiveStatePublisher, false, 'blur後にlive publisherを解除しません');
  assert.equal(loaded.context.appState.syncRevision, 5, 'blur時のpersistState回数が変わりました');
  assert.equal(messages.length, 1, 'blur時のlive通知回数が変わりました');
  now += 1;
  assert.equal(traceShape().length, fullPersistTrace.length, 'blurで解除したtimerが120ms後に再保存しました');

  trace.length = 0;
  document.visibilityState = 'visible';
  listeners.get('window:focus')();
  assert.equal(loaded.context.isLiveStatePublisher, true, 'focus復帰でlive publisherをclaimしません');
  assert.deepEqual(traceShape(), liveOnlyTrace, 'focus復帰時の実live保存・通知順が変わりました');
  assert.equal(messages.length, 2, 'focus復帰時のlive通知回数が変わりました');

  trace.length = 0;
  loaded.functions.scheduleStateSave();
  const hiddenTimer = loaded.context.stateSaveTimer;
  document.visibilityState = 'hidden';
  listeners.get('document:visibilitychange')();
  assert.deepEqual(clearedTimers, [blurTimer, hiddenTimer], 'hidden時に実pending debounceを解除しません');
  assert.deepEqual(traceShape(), [
    ['sessionStorage', 'setItem', 'attempt'],
    ['sessionStorage', 'setItem', 'success']
  ], 'hidden時の実persistState保存順が変わりました');
  assert.equal(loaded.context.isLiveStatePublisher, false, 'hidden後にlive publisherを解除しません');
  assert.equal(loaded.context.appState.syncRevision, 6, 'hidden時のpersistState回数が変わりました');

  trace.length = 0;
  document.visibilityState = 'visible';
  listeners.get('document:visibilitychange')();
  assert.deepEqual(traceShape(), liveOnlyTrace, 'visible復帰時の実live保存・通知順が変わりました');
  assert.equal(loaded.context.isLiveStatePublisher, true, 'visible復帰でlive publisherをclaimしません');

  trace.length = 0;
  loaded.functions.scheduleStateSave();
  const pagehideTimer = loaded.context.stateSaveTimer;
  listeners.get('window:pagehide')();
  assert.deepEqual(clearedTimers, [blurTimer, hiddenTimer, pagehideTimer], 'pagehide時に実pending debounceを解除しません');
  assert.deepEqual(traceShape(), fullPersistTrace, 'pagehide時の実flush保存・通知順が変わりました');
  assert.equal(loaded.context.stateSaveTimer, 0, 'pagehide後もpending timerが残っています');
  assert.equal(loaded.context.isLiveStatePublisher, false, 'pagehide後にlive publisherを解除しません');

  trace.length = 0;
  document.visibilityState = 'visible';
  // beforeunloadはpagehide後の連続イベントではなく、pending状態を持つ独立経路として確認する。
  // lexical stateは公開contextへ直接代入できないため、現行のclaim処理を通して復帰させる。
  loaded.functions.claimLiveStatePublisher();
  trace.length = 0;
  loaded.functions.scheduleStateSave();
  const beforeunloadTimer = loaded.context.stateSaveTimer;
  listeners.get('window:beforeunload')();
  assert.deepEqual(clearedTimers, [blurTimer, hiddenTimer, pagehideTimer, beforeunloadTimer], 'beforeunload時に実pending debounceを解除しません');
  assert.deepEqual(traceShape(), fullPersistTrace, 'beforeunload時の実flush保存・通知順が変わりました');
}

function testCalculationSaveBehavior() {
  const key = 'trickcal_formation_damage_result_saves_v1';
  const storage = new RecordingStorage();
  const loaded = loadFunctions(readSource('formation-damage-calc.js'), ['writeDamageCalculationSaves'], {
    localStorage: storage,
    CALC_RESULT_SAVES_KEY: key
  });
  const items = Array.from({ length: 55 }, (_, index) => ({ id: `save-${index}`, snapshot: { index } }));
  loaded.functions.writeDamageCalculationSaves(items);
  assert.equal(JSON.parse(storage.raw(key)).length, 50, '計算保存の50件上限が変わっています');
  storage.failMethods.add('setItem');
  assert.doesNotThrow(
    () => loaded.functions.writeDamageCalculationSaves(items),
    '計算保存失敗が現行の握りつぶし境界を越えました'
  );
  assert.equal(storage.raw(key), JSON.stringify(items.slice(0, 50)), '計算保存失敗で永続値が変わりました');

  const readFailureStorage = new RecordingStorage();
  readFailureStorage.failMethods.add('getItem');
  const readFailureLoaded = loadFunctions(readSource('formation-damage-calc.js'), ['loadDamageCalculationSaves'], {
    localStorage: readFailureStorage,
    CALC_RESULT_SAVES_KEY: key
  });
  assert.equal(JSON.stringify(readFailureLoaded.functions.loadDamageCalculationSaves()), '[]', '計算保存読込失敗が空配列へfallbackしません');

  const deleteStorage = new RecordingStorage({
    [key]: JSON.stringify([{ id: 'calc:one', name: 'One', savedAt: 1, snapshot: { result: { expected: 10 } } }])
  });
  const deleteCalls = [];
  const deleteLoaded = loadFunctions(readSource('formation-damage-calc.js'), [
    'loadDamageCalculationSaves',
    'writeDamageCalculationSaves',
    'getDamageSaveById',
    'deleteSelectedDamageCalculation'
  ], {
    localStorage: deleteStorage,
    CALC_RESULT_SAVES_KEY: key,
    window: { confirm() { return true; } },
    view: { loadedDamageSaveId: 'calc:one' },
    renderLoadedDamageSaveLabel(value) { deleteCalls.push(['label', value]); },
    closeDamageSaveMenu() { deleteCalls.push(['close']); }
  });
  deleteStorage.failMethods.add('setItem');
  assert.doesNotThrow(() => deleteLoaded.functions.deleteSelectedDamageCalculation('calc:one'), '計算保存削除失敗がcatch境界を越えました');
  assert.ok(deleteStorage.raw(key).includes('calc:one'), '計算保存削除失敗で永続値が消えました');
  assert.equal(deleteLoaded.context.view.loadedDamageSaveId, '', '計算保存削除失敗時のメモリ状態が変わりました');
  assert.deepEqual(deleteCalls, [['label', null], ['close']], '計算保存削除失敗時のUI結果が変わりました');

  const enemyKey = 'trickcal_formation_damage_enemy_presets_v1';
  const enemyStorage = new RecordingStorage({
    [enemyKey]: JSON.stringify({ 'custom:one': { name: 'One', hp: 100 } })
  });
  const enemyLoaded = loadFunctions(readSource('formation-damage-calc.js'), ['getCustomEnemyPresets'], {
    localStorage: enemyStorage,
    CUSTOM_ENEMY_PRESETS_KEY: enemyKey
  });
  assert.equal(enemyLoaded.functions.getCustomEnemyPresets()['custom:one'].name, 'One', '敵プリセットを再読込できません');
  enemyStorage.setItem(enemyKey, '{broken');
  assert.equal(JSON.stringify(enemyLoaded.functions.getCustomEnemyPresets()), '{}', '破損敵プリセットが空へfallbackしません');
  enemyStorage.failMethods.add('getItem');
  assert.equal(JSON.stringify(enemyLoaded.functions.getCustomEnemyPresets()), '{}', '敵プリセット読込失敗が空objectへfallbackしません');
  enemyStorage.failMethods.clear();

  const saveEnemyStorage = new RecordingStorage();
  const saveEnemyLoaded = loadFunctions(readSource('formation-damage-calc.js'), [
    'getCustomEnemyPresets',
    'saveCustomEnemyPreset'
  ], {
    localStorage: saveEnemyStorage,
    CUSTOM_ENEMY_PRESETS_KEY: enemyKey,
    el: {
      enemyPresetName: { value: 'Test enemy' },
      inputs: {
        enemyHp: { value: '100' },
        enemyAtk: { value: '20' },
        def: { value: '10' },
        enemySpecial: { value: '100' }
      }
    },
    view: { enemyPresetKey: '', enemyPersonality: '冷静' },
    getSelectedEnemyPreset() {
      return { name: 'Base', size: 'medium', content: {}, modifiers: {}, weakness: {}, skills: [] };
    },
    getEnemyPresetMetadata(value) {
      return { name: value?.name || 'Base' };
    },
    readNumber(input) {
      return Number(input?.value) || 0;
    },
    resolveEnemyDamageType() {
      return 'physical';
    },
    normalizeEnemySize(value) {
      return value || '';
    },
    normalizePersonalityName(value) {
      return value || '';
    },
    populateEnemyPresets() {},
    populateEnemyPhases() {},
    applyEnemyPreset() {},
    syncEnemyPresetManagement() {}
  });
  assert.doesNotThrow(() => saveEnemyLoaded.functions.saveCustomEnemyPreset(), '敵プリセット保存の成功経路が壊れています');
  const savedEnemyPayload = saveEnemyStorage.raw(enemyKey);
  assert.ok(savedEnemyPayload && Object.keys(JSON.parse(savedEnemyPayload)).length === 1, '敵プリセット保存値が生成されません');
  saveEnemyStorage.failMethods.add('setItem');
  assert.doesNotThrow(() => saveEnemyLoaded.functions.saveCustomEnemyPreset(), '敵プリセット保存失敗がcatch境界を越えました');

  const deleteEnemyStorage = new RecordingStorage({
    [enemyKey]: JSON.stringify({ 'custom:one': { name: 'One', hp: 100 } })
  });
  const deleteEnemyLoaded = loadFunctions(readSource('formation-damage-calc.js'), [
    'getCustomEnemyPresets',
    'deleteCustomEnemyPreset'
  ], {
    localStorage: deleteEnemyStorage,
    CUSTOM_ENEMY_PRESETS_KEY: enemyKey,
    view: { enemyPresetKey: 'custom:one', enemyPhaseIndex: 2, enemySkillIndex: 3 },
    el: { enemyPreset: { value: 'custom:one' } },
    window: { confirm() { return true; } },
    getEnemyPresets() { return { 'custom:one': { name: 'One', hp: 100 } }; },
    getEnemyPresetMetadata(value) { return { name: value?.name || 'One' }; },
    populateEnemyPresets() {},
    populateEnemyPhases() {},
    applyEnemyPreset() {},
    syncEnemyPresetManagement() {}
  });
  deleteEnemyStorage.failMethods.add('setItem');
  assert.doesNotThrow(() => deleteEnemyLoaded.functions.deleteCustomEnemyPreset(), '敵プリセット削除失敗がcatch境界を越えました');
  assert.ok(deleteEnemyStorage.raw(enemyKey).includes('custom:one'), '敵プリセット削除失敗で永続値が消えました');
  assert.equal(deleteEnemyLoaded.context.view.enemyPresetKey, 'custom:one', '敵プリセット削除失敗時のメモリ状態が変わりました');
}

async function testBackupCalculationResultRoundTrip() {
  const key = 'trickcal_formation_damage_result_saves_v1';
  const items = Array.from({ length: 3 }, (_, index) => ({
    id: `backup-result-${index + 1}`,
    name: `復元計算${index + 1}`,
    savedAt: 1726185600000 + index * 1000,
    snapshot: {
      version: 4,
      view: { targetId: index === 0 ? 'Momo' : 'Sylla' },
      result: { expected: 100 + index, totalDamage: 900 + index },
      comparison: { dpsSnapshot: { durationSeconds: 90 } },
      opaqueSavedCalculationState: { index }
    }
  }));
  const created = await backup.createBackupPackageFromEntries({
    'calc.resultSaves': JSON.stringify(items)
  }, { sourceMode: 'current-tab', sourceRelease: 'behavior-test' });
  assert.equal(created.ok, true, JSON.stringify(created));
  const decoded = await backup.decodeBackupPackage(JSON.stringify(created.value));
  assert.equal(decoded.ok, true, JSON.stringify(decoded));
  const restoredRaw = backup.buildRestoreEntries(decoded.value.payload, {
    transactionId: 'behavior-result-restore'
  }).find(entry => entry.id === 'calc.resultSaves')?.raw;
  assert.equal(typeof restoredRaw, 'string', '保存計算結果のrestore入口がありません');
  assert.deepEqual(JSON.parse(restoredRaw), items, '保存計算結果がcodecで欠落しました');

  // Evaluate the production loader in a fresh VM with only the restored raw
  // value. This is the restart boundary, not a direct object hand-off.
  const restartedStorage = new RecordingStorage({ [key]: restoredRaw });
  const restarted = loadFunctions(readSource('formation-damage-calc.js'), [
    'loadDamageCalculationSaves'
  ], {
    storageLocal: restartedStorage,
    CALC_RESULT_SAVES_KEY: key
  });
  const loaded = restarted.functions.loadDamageCalculationSaves();
  assert.equal(loaded.length, items.length, '新contextの実loaderで保存計算結果件数が変わりました');
  assert.deepEqual(
    JSON.parse(JSON.stringify(loaded.map(item => ({
      id: item.id,
      name: item.name,
      savedAt: item.savedAt,
      snapshot: item.snapshot
    })))),
    items.slice().sort((a, b) => b.savedAt - a.savedAt),
    '新contextの実loaderで保存計算結果が変わりました'
  );

  const tooManyItems = Array.from({ length: 51 }, (_, index) => ({
    ...items[index % items.length],
    id: `backup-result-over-${index + 1}`
  }));
  const tooMany = await backup.createBackupPackageFromEntries({
    'calc.resultSaves': JSON.stringify(tooManyItems)
  }, { sourceRelease: 'behavior-test' });
  assert.equal(tooMany.ok, false, '50件超の保存計算結果を適用前に拒否できません');
  const unsupported = await backup.createBackupPackageFromEntries({
    'calc.resultSaves': JSON.stringify([{ ...items[0], snapshot: { version: 3 } }])
  }, { sourceRelease: 'behavior-test' });
  assert.equal(unsupported.ok, false, '未対応snapshot版を適用前に拒否できません');
}

function createStateExportImportContext({ savePath = 'real', publishLive = true } = {}) {
  const source = readSource('stat-prototype.js');
  const slotKey = 'trickcal_stat_slots_v2';
  const workspaceKey = 'trickcal_stat_workspace_v2';
  const liveKey = 'trickcal_stat_live_v2';
  const legacyKey = 'trickcal_stat_prototype_v1';
  const otherLocalKey = 'trickcal_formation_damage_settings_v1';
  const otherSessionKey = 'trickcal:dps-settings:v1';
  const slotOne = {
    savedAt: '2026-09-13T00:00:00.000Z',
    slotName: '保存済みMomo',
    activeId: 'Momo',
    apostles: { Momo: { rank: 1 } },
    research: {},
    cards: {}
  };
  const slotTwo = {
    savedAt: '2026-09-13T00:00:01.000Z',
    slotName: '保存済みTig',
    activeId: 'Tig',
    apostles: { Tig: { rank: 2 } },
    research: {},
    cards: {}
  };
  const initialStore = {
    schemaVersion: 2,
    storeRevision: 4,
    slots: {
      '1': { slotRevision: 2, savedAt: slotOne.savedAt, savedBy: 'seed', snapshot: { ...slotOne, activeStateSlot: 1 } },
      '2': { slotRevision: 4, savedAt: slotTwo.savedAt, savedBy: 'seed', snapshot: { ...slotTwo, activeStateSlot: 2 } }
    }
  };
  const workspace = {
    workspaceVersion: 2,
    activeSlot: 1,
    draft: { activeId: 'Momo', draftOnlyValue: 'not-exported' }
  };
  const initialLive = JSON.stringify({ revision: 8, snapshot: { activeId: 'Momo' } });
  const localStorage = new RecordingStorage({
    [slotKey]: JSON.stringify(initialStore),
    [otherLocalKey]: 'keep-calc-settings',
    [liveKey]: initialLive,
    [legacyKey]: 'keep-legacy-mirror'
  }, { area: 'localStorage' });
  const sessionStorage = new RecordingStorage({
    [workspaceKey]: JSON.stringify(workspace),
    [otherSessionKey]: 'keep-dps-session'
  }, { area: 'sessionStorage' });
  const trace = localStorage.trace || sessionStorage.trace || [];
  // Both storage areas must use the same sequence so the import order can be
  // asserted across workspace -> live -> legacy, not just per-area.
  localStorage.trace = trace;
  sessionStorage.trace = trace;
  const messages = [];
  const downloads = [];
  const uiEvents = [];
  const elements = {
    dashboardPanels: [],
    globalSettingPanels: [],
    apostleSelect: { value: '' }
  };
  const cardMigration = loadFunctions(readSource('cards.js'), [
    'resolveCardIdAlias',
    'migrateCardStateMap'
  ], { CARD_ID_ALIASES: {} }).functions.migrateCardStateMap;
  const context = {
    localStorage,
    sessionStorage,
    window: { localStorage, sessionStorage, confirm() { return true; } },
    document: {
      visibilityState: publishLive ? 'visible' : 'hidden',
      dispatchEvent(event) {
        uiEvents.push({ type: event.type });
      }
    },
    navigator: {
      locks: {
        request(_name, _options, task) {
          return Promise.resolve(task());
        }
      }
    },
    DATA: {
      sheets: { basicInfo: [{ id: 'Momo' }, { id: 'Tig' }] },
      getById(sheet, id) {
        if (sheet !== 'basicInfo') return null;
        return ['Momo', 'Tig'].includes(String(id)) ? { id, '使徒名': id } : null;
      }
    },
    elements,
    appState: {
      activeId: 'Momo',
      activeStateSlot: 1,
      savedStates: { '1': slotOne, '2': slotTwo },
      apostles: { Momo: { rank: 1 } },
      research: {},
      cards: {},
      formation: {},
      totalCombatPower: 0,
      draftOnlyValue: 'not-exported'
    },
    view: { stateSlot: 1, id: 'Momo', board: 1 },
    sharedStateSlotStore: initialStore,
    stateSlotBaseRevision: 2,
    stateExternalConflict: null,
    stateSaveTimer: 0,
    initialWorkspaceState: { workspaceId: 'p1b-import-workspace' },
    isLiveStatePublisher: publishLive,
    stateSyncChannel: {
      postMessage(message) {
        trace.push({ source: 'notification', phase: 'attempt', message });
        messages.push(message);
        trace.push({ source: 'notification', phase: 'success', message });
      }
    },
    TAB_INSTANCE_ID: 'p1b-export-import',
    STATE_SLOT_STORAGE_KEY: slotKey,
    STATE_WORKSPACE_STORAGE_KEY: workspaceKey,
    STATE_LIVE_STORAGE_KEY: liveKey,
    STORAGE_KEY: legacyKey,
    EXPORT_SCHEMA: 'trickcal-stat-state',
    EXPORT_VERSION: 2,
    migrateCardStateMap: cardMigration,
    setStateSlotMode(mode) {
      loaded.context.view.stateSlotMode = mode;
    },
    downloadStateJson(payload, filenamePrefix) {
      downloads.push({ payload: JSON.parse(JSON.stringify(payload)), filenamePrefix });
    },
    ensureApostleState(id) {
      return loaded.context.appState.apostles[id] || {};
    },
    restoreSavedBoardPlan() {},
    applyDashboardViewSnapshot(snapshot) {
      uiEvents.push({ type: 'view', snapshot: { ...snapshot } });
    },
    syncControlsFromState() {},
    renderResearchControls() {},
    renderStateManager() {
      uiEvents.push({ type: 'render-state-manager' });
    },
    render() {},
    scheduleStatSnapshotRefresh() {
      uiEvents.push({ type: 'schedule-snapshot-refresh' });
    },
    // In the negative control this is deliberately left as a no-op. The
    // positive context replaces it with the extracted production saveState.
    saveState() {
      uiEvents.push({ type: 'save-state-omitted' });
    },
    CustomEvent: function CustomEvent(type) {
      this.type = type;
    }
  };
  const names = [
    'normalizeStateSlot',
    'cloneJson',
    'migrateSavedStateSlots',
    'normalizeDashboardViewName',
    'normalizeGlobalSettingPanelName',
    'normalizeFormationCoins',
    'createDefaultFormationRow',
    'createDefaultFormation',
    'applyComparisonStatsStore',
    'getValidApostleId',
    'normalizeStateSnapshot',
    'normalizeSharedStateSlotStore',
    'readLatestSharedStateSlotStore',
    'getSharedStateSnapshots',
    'getSharedSlotRevision',
    'syncSharedStateSlotStore',
    'postStateSyncMessage',
    'withStateSlotStoreLock',
    'writeSharedStateSlot',
    'parseImportedState',
    'applyImportedState',
    'applyStateSnapshot'
  ];
  if (savePath === 'real') {
    names.push(
      'createStateWorkspaceDraft',
      'persistStateWorkspace',
      'publishLiveState',
      'persistState',
      'safePersistState',
      'flushPendingStateSave',
      'saveState'
    );
  }
  names.push('exportStateFile');
  const loaded = loadFunctions(source, names, context);
  return {
    ...loaded,
    keys: { slotKey, workspaceKey, liveKey, legacyKey, otherLocalKey, otherSessionKey },
    values: { initialStore, workspace, initialLive },
    slotOne,
    slotTwo,
    localStorage,
    sessionStorage,
    messages,
    downloads,
    uiEvents,
    trace,
    stat: loaded.functions
  };
}

function assertImportedPersistence(result, { publishLive = true } = {}) {
  const {
    slotKey, workspaceKey, liveKey, legacyKey, otherLocalKey, otherSessionKey
  } = result.keys;
  const afterStore = JSON.parse(result.localStorage.raw(slotKey));
  assert.deepEqual(afterStore.slots['1'], result.values.initialStore.slots['1'], 'importで対象外slotが変わりました');
  assert.equal(afterStore.storeRevision, 5, 'importのstoreRevisionが進みません');
  assert.equal(afterStore.slots['2'].snapshot.activeId, 'Tig', 'import対象slotへ保存されません');
  assert.equal(afterStore.slots['2'].slotRevision, 5, 'import対象slotのrevisionが進みません');
  assert.equal(result.context.view.stateSlot, 2, 'import後のactive slotが変わりません');
  assert.equal(result.context.appState.activeStateSlot, 2, 'import後のappState slotが変わりません');
  assert.ok(result.uiEvents.some(event => event.type === 'view' && event.snapshot.activeId === 'Tig'), 'import後の実applyStateSnapshot経路を通っていません');
  assert.ok(result.uiEvents.some(event => event.type === 'stat-state-applied'), 'import後の実DOM通知経路を通っていません');
  assert.equal(result.localStorage.raw(otherLocalKey), 'keep-calc-settings', 'importで他local領域が変わりました');
  assert.equal(result.sessionStorage.raw(otherSessionKey), 'keep-dps-session', 'importで他session領域が変わりました');

  const workspaceRaw = result.sessionStorage.raw(workspaceKey);
  assert.notEqual(
    workspaceRaw,
    JSON.stringify(result.values.workspace),
    'importでworkspaceが更新されません'
  );
  const workspace = JSON.parse(workspaceRaw);
  assert.equal(workspace.activeSlot, 2, 'import後workspaceのactive slotが変わりません');
  assert.equal(workspace.draft.activeId, 'Tig', 'import後workspaceのdraftが変わりません');
  assert.equal(workspace.draft.draftOnlyValue, 'not-exported', 'workspaceの既存draft情報が失われました');

  const expectedMessages = publishLive ? ['slots-changed', 'live-published'] : ['slots-changed'];
  assert.deepEqual(result.messages.map(message => message.type), expectedMessages, 'importの通知順・回数が変わりました');
  if (publishLive) {
    const live = JSON.parse(result.localStorage.raw(liveKey));
    assert.equal(live.revision, 9, 'import後live revisionが変わりません');
    assert.equal(live.sourceSlot, '2', 'import後liveのsource slotが変わりません');
    assert.equal(live.snapshot.activeId, 'Tig', 'import後live snapshotが変わりません');
    const legacy = JSON.parse(result.localStorage.raw(legacyKey));
    assert.equal(legacy.activeId, 'Tig', '公開担当時のlegacy mirrorが更新されません');
    assert.equal(legacy.activeStateSlot, 2, 'legacy mirrorのactive slotが変わりません');
  } else {
    assert.equal(result.localStorage.raw(liveKey), result.values.initialLive, '非公開担当・hidden時にliveが変わりました');
    assert.equal(result.localStorage.raw(legacyKey), 'keep-legacy-mirror', '非公開担当・hidden時にlegacyが変わりました');
  }
}

async function testStateExportImportBehavior() {
  const result = createStateExportImportContext();
  const { stat, downloads, localStorage, sessionStorage, uiEvents, keys, values } = result;
  const { slotKey, workspaceKey, otherLocalKey } = keys;
  const statState = stat;

  statState.exportStateFile(2);
  assert.equal(downloads.length, 1, '保存slotのexportが実関数から呼び出されません');
  assert.equal(downloads[0].payload.schema, 'trickcal-stat-state', 'export schemaが変わっています');
  assert.equal(downloads[0].payload.version, 2, 'export versionが変わっています');
  assert.equal(downloads[0].payload.sourceSlot, 2, 'export対象slotが変わっています');
  assert.equal(downloads[0].payload.snapshot.activeId, 'Tig', 'exportが保存slotではなく現在draftを取り込みました');
  assert.equal(downloads[0].payload.snapshot.draftOnlyValue, undefined, 'exportへ未保存draftが混入しました');
  assert.equal(sessionStorage.raw(workspaceKey), JSON.stringify(values.workspace), 'exportでworkspace draftが変わりました');
  assert.equal(localStorage.raw(otherLocalKey), 'keep-calc-settings', 'exportで他local領域が変わりました');
  assert.deepEqual(
    localStorage.calls.map(call => `${call.method}:${call.key}`),
    [`getItem:${slotKey}`],
    'exportがslot読込以外の保存操作を発生させました'
  );

  const imported = statState.parseImportedState(downloads[0].payload);
  assert.equal(imported.kind, 'slot', 'export結果をimport parserへ渡せません');
  assert.equal(imported.current.activeId, 'Tig', 'export→importでactiveIdが変わりました');
  const fixtureImported = statState.parseImportedState(JSON.parse(readSource('tools/fixtures/storage-s1-import.json')));
  assert.equal(fixtureImported.kind, 'slot', '既存import fixtureを実import parserへ渡せません');
  assert.equal(fixtureImported.current.activeId, 'Tig', '既存import fixtureのactiveIdが変わりました');
  const oldFormat = statState.parseImportedState({
    activeId: 'Momo',
    apostles: { Momo: { rank: 3 } },
    research: {},
    cards: {}
  });
  assert.equal(oldFormat.kind, 'slot', '旧unwrapped形式を既存import parserへ渡せません');
  assert.equal(oldFormat.current.activeId, 'Momo', '旧形式のactiveIdが変わりました');
  assert.throws(
    () => statState.parseImportedState({ schema: 'trickcal-stat-state', version: 3, snapshot: result.slotTwo }),
    /Unsupported version/,
    '未知export versionを拒否できません'
  );
  assert.throws(
    () => statState.parseImportedState({ schema: 'other-schema', version: 2, snapshot: result.slotTwo }),
    /Unknown schema/,
    '未知export schemaを拒否できません'
  );

  localStorage.calls.length = 0;
  sessionStorage.calls.length = 0;
  result.trace.length = 0;
  const appliedResult = await statState.applyImportedState(imported, 2);
  assert.equal(appliedResult, true, 'import適用が成功しません');
  assertImportedPersistence(result, { publishLive: true });
  assert.deepEqual(
    localStorage.calls.map(call => `${call.method}:${call.key}`),
    [
      `getItem:${slotKey}`,
      `setItem:${slotKey}`,
      `getItem:${keys.liveKey}`,
      `setItem:${keys.liveKey}`,
      `setItem:${keys.legacyKey}`
    ],
    'importのslot→workspace→live→legacy保存順が変わりました'
  );
  assert.deepEqual(
    sessionStorage.calls.map(call => `${call.method}:${call.key}`),
    [`setItem:${workspaceKey}`],
    'importのworkspace保存試行が変わりました'
  );
  assert.ok(uiEvents.some(event => event.type === 'schedule-snapshot-refresh'), '実saveStateの後段処理を通っていません');

  const hidden = createStateExportImportContext({ publishLive: false });
  const hiddenImported = hidden.stat.parseImportedState(downloads[0].payload);
  assert.equal(await hidden.stat.applyImportedState(hiddenImported, 2), true, '非公開担当時のimportが失敗しました');
  assertImportedPersistence(hidden, { publishLive: false });

  // The negative control uses exactly the same parser/import/apply entry but
  // replaces only saveState with a no-op. The required persistence assertion
  // must then fail; a passing test here would be the old false-positive.
  const omitted = createStateExportImportContext({ savePath: 'omitted' });
  const omittedImported = omitted.stat.parseImportedState(downloads[0].payload);
  assert.equal(await omitted.stat.applyImportedState(omittedImported, 2), true, '保存省略反例のimport入口が実行されません');
  assert.throws(
    () => assertImportedPersistence(omitted, { publishLive: true }),
    /workspace|live|legacy|保存/,
    '保存処理を抜いた反例が同じimport検証経路で失敗しません'
  );
}

function testDpsSaveBehavior() {
  const overrideKey = 'trickcal:dps-runtime-effect-overrides:v1';
  const settingsKey = 'trickcal:dps-settings:v1';
  const storage = new RecordingStorage();
  const loaded = loadFunctions(readSource('formation-damage-dps-prototype.js'), [
    'saveDpsRuntimeEffectOverrides',
    'saveDpsSettingsStore'
  ], {
    window: { localStorage: storage },
    DPS_RUNTIME_OVERRIDE_STORAGE_KEY: overrideKey,
    DPS_SETTINGS_STORAGE_KEY: settingsKey,
    dpsRuntimeEffectOverrides: {},
    dpsSettingsStore: {}
  });
  assert.equal(loaded.functions.saveDpsRuntimeEffectOverrides({ Momo: { effect: 'fixed' } }), true, 'DPS override保存成功を返しません');
  assert.deepEqual(JSON.parse(storage.raw(overrideKey)), { Momo: { effect: 'fixed' } }, 'DPS overrideが保存されません');
  storage.failMethods.add('setItem');
  assert.equal(loaded.functions.saveDpsRuntimeEffectOverrides({ Momo: { effect: 'off' } }), false, 'DPS override保存失敗を成功扱いしました');
  assert.deepEqual(loaded.context.dpsRuntimeEffectOverrides, { Momo: { effect: 'off' } }, 'DPS override保存失敗時のタブ内設定維持が変わっています');
  assert.equal(loaded.functions.saveDpsSettingsStore({ Momo: { durationSeconds: 90 } }), false, 'DPS設定保存失敗を成功扱いしました');
  assert.deepEqual(loaded.context.dpsSettingsStore, { Momo: { durationSeconds: 90 } }, 'DPS保存失敗時のタブ内設定維持が変わっています');

  const malformed = new RecordingStorage({ [settingsKey]: '{broken' });
  const malformedLoaded = loadFunctions(readSource('formation-damage-dps-prototype.js'), ['loadDpsSettingsStore'], {
    window: { localStorage: malformed },
    DPS_SETTINGS_STORAGE_KEY: settingsKey
  });
  assert.throws(
    () => malformedLoaded.functions.loadDpsSettingsStore(),
    error => error?.name === 'StorageRuntimeError' && error.result?.code === 'recovery-required',
    '破損DPS設定を空objectへfallbackする反例が失敗しません'
  );
  assert.equal(malformed.raw(settingsKey), '{broken', '破損DPS設定を上書きしました');

  const readFailure = new RecordingStorage();
  readFailure.failMethods.add('getItem');
  const readFailureLoaded = loadFunctions(readSource('formation-damage-dps-prototype.js'), ['loadDpsSettingsStore'], {
    window: { localStorage: readFailure },
    DPS_SETTINGS_STORAGE_KEY: settingsKey
  });
  assert.throws(
    () => readFailureLoaded.functions.loadDpsSettingsStore(),
    error => error?.name === 'StorageRuntimeError' && error.result?.code === 'read-failed',
    'DPS設定読込失敗を空objectへfallbackする反例が失敗しません'
  );

  const legacyStorage = new RecordingStorage();
  const legacyLoaded = loadFunctions(readSource('formation-dps-calc.js'), ['saveRuntimeEffectOverrides'], {
    localStorage: legacyStorage,
    DPS_RUNTIME_OVERRIDE_STORAGE_KEY: overrideKey,
    runtimeEffectOverrides: { Momo: { effect: 'fixed' } }
  });
  legacyLoaded.functions.saveRuntimeEffectOverrides();
  legacyStorage.failMethods.add('setItem');
  assert.equal(legacyLoaded.functions.saveRuntimeEffectOverrides(), false, '旧DPSの保存失敗を成功扱いしました');
  assert.deepEqual(legacyLoaded.context.runtimeEffectOverrides, { Momo: { effect: 'fixed' } }, '旧DPS保存失敗時のタブ内設定が変わっています');
}

function testDpsTargetSettingsBehavior() {
  const source = readSource('formation-damage-dps-prototype.js');
  const storage = new RecordingStorage();
  const settingsKey = 'trickcal:dps-settings:v1';
  let activeTargetId = 'Momo';
  const context = {
    window: {
      localStorage: storage,
      TRICKCAL_DPS_SUPPORT_REGISTRY: {
        evaluate(snapshot) {
          return { supported: true, label: snapshot.targetId, configuration: '基準構成' };
        }
      }
    },
    createDpsSnapshotWithRuntimeOverrides() {
      return { targetId: activeTargetId, externalEvents: [] };
    },
    DPS_SETTINGS_STORAGE_KEY: settingsKey,
    DPS_SETTINGS_SCHEMA_VERSION: 2,
    DEFAULT_DPS_SETTINGS: {
      durationSeconds: 90,
      highSkillMode: 'disabled',
      formationTimelineMode: 'supportEstimate',
      formationHighSkillMode: 'disabled',
      seed: 1,
      trials: 16,
      autoRun: true,
      externalEvents: [],
      settingsVersion: 2
    },
    DPS_DURATION_OPTIONS: [30, 60, 90, 120, 180],
    DPS_TRIAL_OPTIONS: [16, 64, 256],
    DPS_HIGH_MODE_OPTIONS: ['disabled', 'auto'],
    DPS_FORMATION_TIMELINE_OPTIONS: ['off', 'supportEstimate'],
    DPS_FORMATION_HIGH_MODE_OPTIONS: ['disabled', 'auto'],
    dpsSettingsStore: {},
    totalDelta: {
      hidden: true,
      textContent: '',
      removeAttribute() {},
      setAttribute() {},
      dataset: {}
    },
    baselineSave: { disabled: false },
    baselineClear: { disabled: false }
  };
  const loaded = loadFunctions(source, [
    'loadDpsSettingsStore',
    'dedupeDpsExternalEventsByBinding',
    'normalizeDpsExternalEvents',
    'chooseDpsSetting',
    'normalizeDpsSettings',
    'saveDpsSettingsStore',
    'getDpsTargetChangeTransition'
  ], context);
  vm.runInContext(extractClass(source, 'PrototypeDpsController'), loaded.context, {
    filename: 'storage-baseline-extracted-PrototypeDpsController.js'
  });
  vm.runInContext('this.PrototypeDpsController = PrototypeDpsController;', loaded.context);
  const elements = {
    duration: { value: '90' },
    highMode: { value: 'disabled' },
    formationTimelineMode: { value: 'supportEstimate' },
    formationHighMode: { value: 'disabled' },
    seed: { value: '1' },
    trials: { value: '16' },
    autoRun: { checked: true },
    totalDelta: {
      hidden: true,
      textContent: '',
      removeAttribute() {},
      setAttribute() {},
      dataset: {}
    },
    baselineSave: { disabled: false },
    baselineClear: { disabled: false }
  };
  const controller = new loaded.context.PrototypeDpsController({}, elements);
  const initialAvailability = controller.refreshAvailability({ render: false });
  assert.equal(initialAvailability?.support?.supported, true, 'DPS起動時のavailability確認に失敗しました');
  assert.equal(controller.currentTargetId, 'momo', 'DPS起動時の対象IDが同期されません');
  elements.duration.value = '30';
  elements.highMode.value = 'auto';
  controller.refreshAvailability({ render: false });
  activeTargetId = 'Sylla';
  const switchedAvailability = controller.refreshAvailability({ render: false });
  assert.equal(
    switchedAvailability?.snapshot?.targetId,
    'Sylla',
    `DPS対象切替時のsnapshotが更新されません: ${controller.availability.error?.stack || 'unknown error'}`
  );
  assert.equal(elements.duration.value, '90', '別対象へ切り替えた際に既定設定へ戻りません');
  assert.equal(elements.highMode.value, 'disabled', '別対象へ切り替えた際の高学年設定が分離されていません');
  activeTargetId = 'Momo';
  controller.refreshAvailability({ render: false });
  assert.equal(elements.duration.value, '30', '対象MomoのDPS設定が復元されません');
  assert.equal(elements.highMode.value, 'auto', '対象Momoの高学年設定が復元されません');
  const saved = JSON.parse(storage.raw('trickcal:dps-settings:v1'));
  assert.equal(saved.momo.durationSeconds, 30, '対象MomoのDPS設定が保存されません');
  assert.equal(saved.sylla.durationSeconds, 90, '対象SyllaのDPS設定が独立保存されません');

  const createDpsElements = () => ({
    duration: { value: '90' },
    highMode: { value: 'disabled' },
    formationTimelineMode: { value: 'supportEstimate' },
    formationHighMode: { value: 'disabled' },
    seed: { value: '1' },
    trials: { value: '16' },
    autoRun: { checked: true },
    totalDelta: {
      hidden: true,
      textContent: '',
      removeAttribute() {},
      setAttribute() {},
      dataset: {}
    },
    baselineSave: { disabled: false },
    baselineClear: { disabled: false }
  });
  const loadControllerClass = (loadedContext, filename) => {
    vm.runInContext(extractClass(source, 'PrototypeDpsController'), loadedContext, { filename });
    vm.runInContext('this.PrototypeDpsController = PrototypeDpsController;', loadedContext);
  };

  // Simulate a new page/controller execution. The persisted result is passed
  // through the production load function before the controller is created.
  const persistedSettingsRaw = storage.raw(settingsKey);
  const restartStorage = new RecordingStorage({ [settingsKey]: persistedSettingsRaw });
  const restarted = loadFunctions(source, [
    'loadDpsSettingsStore',
    'dedupeDpsExternalEventsByBinding',
    'normalizeDpsExternalEvents',
    'chooseDpsSetting',
    'normalizeDpsSettings',
    'saveDpsSettingsStore',
    'getDpsTargetChangeTransition'
  ], {
    ...context,
    window: {
      ...context.window,
      localStorage: restartStorage
    },
    dpsSettingsStore: {}
  });
  restarted.context.dpsSettingsStore = restarted.functions.loadDpsSettingsStore();
  assert.deepEqual(
    JSON.parse(JSON.stringify(restarted.context.dpsSettingsStore)),
    saved,
    '新しい実行環境へ保存済みDPS設定を渡せません'
  );
  loadControllerClass(restarted.context, 'storage-baseline-extracted-PrototypeDpsController-restart.js');
  const restartedElements = createDpsElements();
  const restartedController = new restarted.context.PrototypeDpsController({}, restartedElements);
  activeTargetId = 'Momo';
  restartedController.refreshAvailability({ render: false });
  assert.equal(restartedElements.duration.value, '30', '再起動後に対象Momoの保存時間を復元できません');
  assert.equal(restartedElements.highMode.value, 'auto', '再起動後に対象Momoの高学年設定を復元できません');
  activeTargetId = 'Sylla';
  restartedController.refreshAvailability({ render: false });
  assert.equal(restartedElements.duration.value, '90', '再起動後に対象Syllaの既定設定が分離されていません');
  assert.equal(restartedElements.highMode.value, 'disabled', '再起動後に対象Syllaの高学年設定が分離されていません');
  activeTargetId = 'Momo';
  restartedController.refreshAvailability({ render: false });
  assert.equal(restartedElements.duration.value, '30', '再起動後のMomo設定がSylla切替で失われました');
  assert.equal(restartedElements.highMode.value, 'auto', '再起動後のMomo高学年設定がSylla切替で失われました');

  // Negative control: use the same refresh/controller path but intentionally
  // skip the production load. It must not look like a successful restart.
  const noReadStorage = new RecordingStorage({ [settingsKey]: persistedSettingsRaw });
  const noRead = loadFunctions(source, [
    'dedupeDpsExternalEventsByBinding',
    'normalizeDpsExternalEvents',
    'chooseDpsSetting',
    'normalizeDpsSettings',
    'saveDpsSettingsStore',
    'getDpsTargetChangeTransition'
  ], {
    ...context,
    window: {
      ...context.window,
      localStorage: noReadStorage
    },
    dpsSettingsStore: {}
  });
  loadControllerClass(noRead.context, 'storage-baseline-extracted-PrototypeDpsController-no-read.js');
  const noReadElements = createDpsElements();
  const noReadController = new noRead.context.PrototypeDpsController({}, noReadElements);
  activeTargetId = 'Momo';
  noReadController.refreshAvailability({ render: false });
  assert.equal(noReadElements.duration.value, '90', '読込み省略反例が既定値へ戻りません');
  assert.throws(
    () => {
      assert.equal(noReadElements.duration.value, '30', '再起動後の保存時間が復元されません');
      assert.equal(noReadElements.highMode.value, 'auto', '再起動後の高学年設定が復元されません');
    },
    /復元されません/,
    'DPS設定の読込みを省いた反例が同じcontroller検証経路で失敗しません'
  );
}

function testComparisonSessionBehavior() {
  const api = require(path.join(ROOT, 'combat-scenario.js'));
  const tabA = new RecordingStorage();
  const tabB = new RecordingStorage();
  const scenario = {
    actors: { self: { id: 'Momo' }, enemy: { id: 'Dummy' } },
    characterState: { level: 1 },
    formationState: { rows: [] },
    cardState: {},
    battleConditions: {},
    effectAssumptions: {}
  };
  const saved = api.savePinnedComparison({ scenario, singleActionResult: { expected: 123 } }, tabA);
  assert.equal(saved.version, 3, 'comparison session versionが変わっています');
  assert.equal(api.loadComparisonSession(tabA).baseline.scenario.actors.self.id, 'Momo', 'comparison sessionを再読込できません');
  assert.equal(api.loadComparisonSession(tabB), null, 'sessionStorageがタブ間で共有されています');

  const futureVersion = api.normalizeComparisonSession({
    version: 999,
    mode: 'pinned',
    baseline: { scenario }
  });
  assert.equal(futureVersion.version, 3, '比較sessionの未知versionに対する現行正規化挙動が変わっています');

  tabA.setItem(api.comparisonSessionKey, '{broken');
  assert.equal(api.loadComparisonSession(tabA), null, '破損comparison sessionがnullへfallbackしません');
  tabA.failMethods.add('getItem');
  assert.equal(api.loadComparisonSession(tabA), null, 'comparison session読込失敗がnullへfallbackしません');
  tabA.failMethods.clear();
  tabA.failMethods.add('setItem');
  assert.equal(api.savePinnedComparison({ scenario }, tabA), null, 'comparison session書込失敗がnullになりません');
  tabA.failMethods.clear();
  api.clearComparisonSession(tabA);
  assert.equal(tabA.raw(api.comparisonSessionKey), null, 'comparison sessionを削除できません');
  api.savePinnedComparison({ scenario }, tabA);
  tabA.failMethods.add('removeItem');
  assert.doesNotThrow(() => api.clearComparisonSession(tabA), 'comparison session削除失敗が例外になりました');
  assert.ok(tabA.raw(api.comparisonSessionKey), 'comparison session削除失敗で永続値が消えました');
}

(async () => {
  await testStatBootCatchScope();
  await testStatStorageBehavior();
  testPersistStateBehavior();
  testLoadStateStartupBehavior();
  testDebounceAndFlushBehavior();
  testDebounceWithRealPersistState();
  testStateLifecycleHandlerBehavior();
  testCalculationSaveBehavior();
  await testBackupCalculationResultRoundTrip();
  await testStateExportImportBehavior();
  testDpsSaveBehavior();
  testDpsTargetSettingsBehavior();
  testComparisonSessionBehavior();
console.log('storage behavior baseline checks passed (stat slot/workspace/live, persistState/startup, export/import, calc/enemy/DPS saves/target switch, comparison session)');
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
