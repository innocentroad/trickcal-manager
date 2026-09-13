#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const registryApi = require('../storage-registry.js');
const runtimeApi = require('../storage-runtime.js');

const ROOT = path.resolve(__dirname, '..');
const CONTROL_KEYS = {
  meta: 'trickcal_storage_meta_v1',
  journal: 'trickcal_storage_journal_v1',
  sessionEpoch: 'trickcal_storage_session_epoch_v1'
};

class FakeStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial).map(([key, value]) => [String(key), String(value)]));
    this.failures = new Map();
    this.calls = [];
  }

  setFailure(method, key, error = new Error(`injected ${method}:${key}`)) {
    this.failures.set(`${method}:${String(key)}`, error);
  }

  clearFailure(method, key) {
    this.failures.delete(`${method}:${String(key)}`);
  }

  maybeFail(method, key) {
    const error = this.failures.get(`${method}:${String(key)}`);
    if (error) throw error;
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
    this.requests = [];
  }

  request(name, options, callback) {
    const job = { name, options: { ...options }, callback, resolve: null, reject: null };
    this.requests.push({ name, options: { ...options } });
    if (options.ifAvailable && !this.canAcquire(options.mode)) {
      return Promise.resolve().then(() => callback(null));
    }
    const result = new Promise((resolve, reject) => {
      job.resolve = resolve;
      job.reject = reject;
      this.queue.push(job);
    });
    this.pump();
    return result;
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

function createEnvironment(options = {}) {
  const localStorage = Object.prototype.hasOwnProperty.call(options, 'localStorage')
    ? options.localStorage
    : new FakeStorage(options.local || {});
  const sessionStorage = Object.prototype.hasOwnProperty.call(options, 'sessionStorage')
    ? options.sessionStorage
    : new FakeStorage(options.session || {});
  const locks = options.locks === undefined ? null : options.locks;
  const logs = [];
  const runtime = runtimeApi.createStorageRuntime({
    localStorage,
    sessionStorage,
    locks,
    createEpoch: options.createEpoch || (() => options.epoch || 'epoch-test'),
    logger: event => logs.push(event)
  });
  return { localStorage, sessionStorage, locks, logs, runtime };
}

function assertFailure(result, code, operation = undefined) {
  assert.equal(result.ok, false);
  assert.equal(result.code, code);
  if (operation) assert.equal(result.operation, operation);
  assert.equal(typeof result.retryable, 'boolean');
  return result;
}

async function testRegistry() {
  const inventory = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/storage-inventory.json'), 'utf8'));
  const registry = registryApi.registry;
  assert.equal(registry.userEntries.length, inventory.entries.length);
  assert.deepEqual(
    registry.userEntries.map(entry => ({ id: entry.id, area: entry.area, key: entry.key })),
    inventory.entries.map(entry => ({ id: entry.id, area: entry.area, key: entry.key }))
  );
  assert.equal(registry.controlEntries.length, 3);
  assert.equal(registry.get('control.meta').key, CONTROL_KEYS.meta);
  assert.equal(registry.get('control.journal').key, CONTROL_KEYS.journal);
  assert.equal(registry.get('control.sessionEpoch').key, CONTROL_KEYS.sessionEpoch);
  assert.equal(registry.resolve('localStorage', 'trickcal_stat_slots_v2').id, 'stat.slotStore');
  assert.equal(registry.get('unknown.id'), null);
  assert.equal(registry.isControl('control.meta'), true);
  assert.equal(registry.isControl('stat.slotStore'), false);
  assert.throws(() => registryApi.codec.encode(10), /raw storage value/);
  assert.equal(registryApi.codec.decode(null), null);
  assert.equal(registryApi.codec.decode(10), '10');
}

async function testCompatibilityRuntime() {
  const env = createEnvironment({ locks: null, epoch: 'epoch-compat' });
  const { runtime, localStorage, sessionStorage, logs } = env;

  assertFailure(runtime.writeRaw('calc.settings', '{}'), 'not-ready', 'write');
  assertFailure(runtime.readRaw('calc.settings'), 'not-ready', 'read');

  const boot = await runtime.boot({ role: 'app' });
  assert.equal(boot.ok, true);
  assert.equal(boot.value.compatibility, true);
  assert.equal(runtime.getState().lifecycle, 'ready');
  assert.equal(sessionStorage.getItem(CONTROL_KEYS.sessionEpoch), 'epoch-compat');

  assert.deepEqual(runtime.readRaw('calc.settings'), { ok: true, value: null });
  assert.deepEqual(runtime.writeRaw('calc.settings', '{"value":1}'), { ok: true });
  assert.deepEqual(runtime.readRaw('calc.settings'), { ok: true, value: '{"value":1}' });
  assert.deepEqual(runtime.removeRaw('calc.settings'), { ok: true });
  assertFailure(runtime.writeRaw('control.meta', '{}'), 'unsupported', 'write');
  assertFailure(runtime.writeRaw('unknown.id', '{}'), 'unsupported', 'write');
  assertFailure(await runtime.beginMaintenance('export'), 'unsupported', 'beginMaintenance');

  localStorage.setFailure('setItem', 'trickcal_formation_damage_settings_v1');
  assertFailure(runtime.writeRaw('calc.settings', '{}'), 'write-failed', 'write');
  localStorage.clearFailure('setItem', 'trickcal_formation_damage_settings_v1');

  const quotaError = new Error('quota');
  quotaError.name = 'QuotaExceededError';
  localStorage.setFailure('setItem', 'trickcal_formation_damage_settings_v1', quotaError);
  assertFailure(runtime.writeRaw('calc.settings', '{}'), 'quota', 'write');
  localStorage.clearFailure('setItem', 'trickcal_formation_damage_settings_v1');

  localStorage.setFailure('getItem', 'trickcal_formation_damage_settings_v1');
  assertFailure(runtime.readRaw('calc.settings'), 'read-failed', 'read');
  localStorage.clearFailure('getItem', 'trickcal_formation_damage_settings_v1');

  localStorage.setItem('trickcal_formation_damage_settings_v1', '{}');
  localStorage.setFailure('removeItem', 'trickcal_formation_damage_settings_v1');
  assertFailure(runtime.removeRaw('calc.settings'), 'remove-failed', 'remove');
  localStorage.clearFailure('removeItem', 'trickcal_formation_damage_settings_v1');

  localStorage.setItem(CONTROL_KEYS.meta, JSON.stringify({
    version: 1,
    epoch: 'epoch-other',
    restoreSerial: 0,
    lastRestore: null
  }));
  assertFailure(runtime.writeRaw('calc.settings', '{}'), 'stale', 'write');

  localStorage.setItem(CONTROL_KEYS.meta, JSON.stringify({
    version: 1,
    epoch: 'epoch-compat',
    restoreSerial: 0,
    lastRestore: null
  }));
  localStorage.setItem(CONTROL_KEYS.journal, JSON.stringify({ version: 9 }));
  assertFailure(runtime.writeRaw('calc.settings', '{}'), 'recovery-required', 'write');
  assert.equal(localStorage.getItem(CONTROL_KEYS.journal), JSON.stringify({ version: 9 }));

  assert.ok(logs.every(event => !Object.prototype.hasOwnProperty.call(event, 'value')));
  assert.ok(logs.every(event => !Object.prototype.hasOwnProperty.call(event, 'snapshot')));
  await runtime.shutdown();
}

async function testDirectRescueWithoutBoot() {
  const localStorage = new FakeStorage({
    trickcal_stat_slots_v2: JSON.stringify({ schemaVersion: 2, storeRevision: 1, slots: {} }),
    trickcal_formation_damage_result_saves_v1: JSON.stringify([]),
    trickcal_storage_journal_v1: JSON.stringify({ version: 99, phase: 'unknown' })
  });
  const sessionStorage = new FakeStorage({
    trickcal_stat_workspace_v2: '{broken-workspace'
  });
  const env = createEnvironment({ localStorage, sessionStorage, locks: null });
  const localBefore = new Map(localStorage.values);
  const sessionBefore = new Map(sessionStorage.values);
  const result = await env.runtime.exportRescueDirect({
    sourceRelease: 'runtime-rescue-test',
    createdAt: '2026-09-13T00:00:00.000Z'
  });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.value.format, 'trickcal-manager-rescue');
  const decoded = await require('../storage-backup.js').decodeRescuePackage(JSON.stringify(result.value));
  assert.equal(decoded.ok, true, JSON.stringify(decoded));
  assert.deepEqual(
    decoded.value.payload.entries.find(entry => entry.id === 'stat.slotStore'),
    {
      id: 'stat.slotStore',
      area: 'localStorage',
      state: 'present',
      raw: JSON.stringify({ schemaVersion: 2, storeRevision: 1, slots: {} })
    }
  );
  assert.equal(
    decoded.value.payload.entries.find(entry => entry.id === 'stat.workspaceDraft').state,
    'present'
  );
  assert.equal(env.runtime.getState().lifecycle, 'new', 'direct救出が通常bootへ依存しました');
  assert.deepEqual(new Map(localStorage.values), localBefore, 'direct救出がlocal保存値を変更しました');
  assert.deepEqual(new Map(sessionStorage.values), sessionBefore, 'direct救出がsession保存値を変更しました');
  assert.equal(localStorage.calls.some(call => ['setItem', 'removeItem'].includes(call.method)), false);
  assert.equal(sessionStorage.calls.some(call => ['setItem', 'removeItem'].includes(call.method)), false);

  const failedReadStorage = new FakeStorage();
  failedReadStorage.setFailure('getItem', 'trickcal_stat_slots_v2');
  const failedReadEnv = createEnvironment({
    localStorage: failedReadStorage,
    sessionStorage: new FakeStorage(),
    locks: null
  });
  const failedRead = await failedReadEnv.runtime.exportRescueDirect();
  assert.equal(failedRead.ok, true, '個別read失敗で救出全体を失敗扱いにしました');
  const failedReadDecoded = await require('../storage-backup.js').decodeRescuePackage(JSON.stringify(failedRead.value));
  assert.equal(failedReadDecoded.ok, true);
  assert.deepEqual(
    failedReadDecoded.value.payload.entries.find(entry => entry.id === 'stat.slotStore'),
    { id: 'stat.slotStore', area: 'localStorage', state: 'read-failed', code: 'read-failed' }
  );
}

async function testFacadeAndLifecycle() {
  const env = createEnvironment({ locks: null, epoch: 'epoch-facade' });
  const { runtime } = env;
  assert.equal((await runtime.boot({ role: 'app' })).ok, true);

  const facade = runtime.createStorageFacade();
  assert.ok(facade);
  facade.localStorage.setItem('trickcal_formation_damage_settings_v1', '{"facade":true}');
  assert.equal(
    facade.localStorage.getItem('trickcal_formation_damage_settings_v1'),
    '{"facade":true}'
  );
  facade.localStorage.removeItem('trickcal_formation_damage_settings_v1');
  assert.equal(facade.localStorage.getItem('trickcal_formation_damage_settings_v1'), null);
  assert.throws(
    () => facade.localStorage.getItem('trickcal_unregistered_storage_key'),
    error => error?.name === 'StorageRuntimeError' && error.result?.code === 'unsupported'
  );
  assert.throws(
    () => facade.localStorage.setItem(CONTROL_KEYS.meta, '{}'),
    error => error?.name === 'StorageRuntimeError' && error.result?.code === 'unsupported'
  );

  let flushCount = 0;
  let resumeCount = 0;
  let draftValue = 'first';
  let persistedValue = '';
  const participant = runtime.registerParticipant({
    flush: () => {
      flushCount += 1;
      persistedValue = draftValue;
      facade.localStorage.setItem('trickcal_formation_damage_settings_v1', JSON.stringify({ persistedValue }));
      return { ok: true };
    },
    resume: () => {
      resumeCount += 1;
      return { ok: true };
    }
  });
  assert.equal(participant.ok, true);

  const directPagehide = await runtime.suspendForPagehide();
  assert.equal(directPagehide.ok, true);
  assert.equal(flushCount, 1);
  assert.equal(persistedValue, 'first');
  assert.equal(
    env.localStorage.getItem('trickcal_formation_damage_settings_v1'),
    '{"persistedValue":"first"}'
  );
  assert.equal(runtime.getState().lifecycle, 'suspended');

  const pageshow = await runtime.resumeAfterPageshow();
  assert.equal(pageshow.ok, true);
  assert.equal(resumeCount, 1);
  assert.equal(runtime.getState().lifecycle, 'ready');

  assert.equal(runtime.flushParticipants().ok, true);
  assert.equal(flushCount, 2);
  assert.equal(persistedValue, 'first');
  const hiddenPagehide = await runtime.suspendForPagehide();
  assert.equal(hiddenPagehide.ok, true);
  assert.equal(flushCount, 2);
  assert.equal(runtime.getState().lifecycle, 'suspended');
  const resumedAgain = await runtime.resumeAfterPageshow();
  assert.equal(resumedAgain.ok, true);
  assert.equal(resumeCount, 2);
  draftValue = 'latest-after-resume';
  const resumedPagehide = await runtime.suspendForPagehide();
  assert.equal(resumedPagehide.ok, true);
  assert.equal(flushCount, 3, '復帰後pagehideが古いhidden flush成功を再利用しました');
  assert.equal(persistedValue, 'latest-after-resume');
  assert.equal(
    env.localStorage.getItem('trickcal_formation_damage_settings_v1'),
    '{"persistedValue":"latest-after-resume"}'
  );
  assert.equal(participant.value.unregister(), true);
  await runtime.shutdown();
}

async function testBootGuards() {
  const malformedMeta = createEnvironment({
    locks: null,
    local: { [CONTROL_KEYS.meta]: '{bad' },
    epoch: 'epoch-malformed'
  });
  assertFailure(await malformedMeta.runtime.boot(), 'recovery-required', 'boot');
  assert.equal(malformedMeta.localStorage.getItem(CONTROL_KEYS.meta), '{bad');

  const unknownJournal = createEnvironment({
    locks: null,
    local: { [CONTROL_KEYS.journal]: JSON.stringify({ version: 99 }) },
    epoch: 'epoch-journal'
  });
  assertFailure(await unknownJournal.runtime.boot(), 'recovery-required', 'boot');
  assert.equal(
    unknownJournal.localStorage.getItem(CONTROL_KEYS.journal),
    JSON.stringify({ version: 99 })
  );

  const oldSession = createEnvironment({
    locks: null,
    local: {
      [CONTROL_KEYS.meta]: JSON.stringify({
        version: 1,
        epoch: 'epoch-old',
        restoreSerial: 1,
        lastRestore: {}
      })
    },
    session: {
      [CONTROL_KEYS.sessionEpoch]: 'epoch-before-restore',
      'trickcal_stat_workspace_v2': '{"workspaceVersion":2}',
      'trickcal_dashboard_reload_context_v1': '{"reload":true}',
      'trickcal_combat_comparison_session_v1': '{"comparison":true}',
      'unrelated-session-key': 'keep-me'
    },
    epoch: 'epoch-old'
  });
  assert.equal((await oldSession.runtime.boot()).ok, true);
  assert.equal(oldSession.sessionStorage.getItem(CONTROL_KEYS.sessionEpoch), 'epoch-old');
  assert.equal(oldSession.sessionStorage.getItem('trickcal_stat_workspace_v2'), null);
  assert.equal(oldSession.sessionStorage.getItem('trickcal_dashboard_reload_context_v1'), null);
  assert.equal(oldSession.sessionStorage.getItem('trickcal_combat_comparison_session_v1'), null);
  assert.equal(oldSession.sessionStorage.getItem('unrelated-session-key'), 'keep-me');
  assert.equal(oldSession.runtime.getState().lifecycle, 'ready');
  await oldSession.runtime.shutdown();

  const failedSessionReset = createEnvironment({
    locks: null,
    local: {
      [CONTROL_KEYS.meta]: JSON.stringify({
        version: 1,
        epoch: 'epoch-failed-reset',
        restoreSerial: 1,
        lastRestore: {}
      })
    },
    session: {
      'trickcal_stat_workspace_v2': '{"workspaceVersion":2}'
    },
    epoch: 'epoch-failed-reset'
  });
  failedSessionReset.sessionStorage.setFailure('removeItem', 'trickcal_stat_workspace_v2');
  assertFailure(await failedSessionReset.runtime.boot(), 'remove-failed', 'boot-session-rebuild');
  assert.equal(failedSessionReset.runtime.getState().lifecycle, 'blocked');
  assert.equal(failedSessionReset.localStorage.getItem(CONTROL_KEYS.meta) !== null, true);

  const lockedRestoredSession = createEnvironment({
    locks: new FakeLocks(),
    local: {
      [CONTROL_KEYS.meta]: JSON.stringify({
        version: 1,
        epoch: 'epoch-locked-restore',
        restoreSerial: 1,
        lastRestore: {}
      })
    },
    epoch: 'epoch-locked-restore'
  });
  assert.equal((await lockedRestoredSession.runtime.boot()).ok, true);
  assert.equal(
    lockedRestoredSession.sessionStorage.getItem(CONTROL_KEYS.sessionEpoch),
    'epoch-locked-restore'
  );
  assert.equal(lockedRestoredSession.runtime.getState().hasSharedLock, true);
  await lockedRestoredSession.runtime.shutdown();

  const unsupported = createEnvironment({ locks: null, sessionStorage: null });
  assertFailure(await unsupported.runtime.boot(), 'unsupported', 'boot');
}

async function testOldRuntimeCannotSaveAfterRestoreEpoch() {
  const oldMeta = JSON.stringify({
    version: 1,
    epoch: 'epoch-old-runtime',
    restoreSerial: 0,
    lastRestore: null
  });
  const localStorage = new FakeStorage({
    [CONTROL_KEYS.meta]: oldMeta,
    'trickcal_formation_damage_settings_v1': '{"before":"keep"}'
  });
  const sessionStorage = new FakeStorage();
  const env = createEnvironment({
    localStorage,
    sessionStorage,
    locks: null,
    epoch: 'epoch-old-runtime'
  });
  assert.equal((await env.runtime.boot()).ok, true);
  localStorage.calls.length = 0;
  localStorage.setItem(CONTROL_KEYS.meta, JSON.stringify({
    version: 1,
    epoch: 'epoch-restored',
    restoreSerial: 1,
    lastRestore: { transactionId: 'restore-old-runtime', packageDigest: '0'.repeat(64) }
  }));
  const result = env.runtime.writeRaw(
    'calc.settings',
    '{"after":"must-not-overwrite"}'
  );
  assertFailure(result, 'stale', 'write');
  assert.equal(
    localStorage.getItem('trickcal_formation_damage_settings_v1'),
    '{"before":"keep"}',
    '復元後の旧runtimeが保存値を上書きしました'
  );
  assert.equal(
    localStorage.calls.some(call => call.method === 'setItem'
      && call.key === 'trickcal_formation_damage_settings_v1'),
    false,
    'stale拒否前に旧runtimeの保存を試行しました'
  );
  await env.runtime.shutdown();
}

async function testLocksAndMaintenance() {
  const locks = new FakeLocks();
  const a = createEnvironment({ locks, epoch: 'epoch-lock' });
  const bootA = await a.runtime.boot();
  assert.equal(bootA.ok, true);
  assert.equal(bootA.value.compatibility, false);
  assert.equal(a.runtime.getState().hasSharedLock, true);
  assert.equal(locks.shared, 1);

  const events = [];
  const facade = a.runtime.createStorageFacade();
  assert.ok(facade);
  const participant = a.runtime.registerParticipant({
    freeze: async () => events.push('freeze'),
    flush: () => {
      events.push('flush');
      facade.localStorage.setItem(
        'trickcal_formation_damage_settings_v1',
        '{"maintenanceFlush":true}'
      );
      return { ok: true };
    },
    resume: () => events.push('resume')
  });
  assert.equal(participant.ok, true);
  assert.equal(a.runtime.getState().participantCount, 1);

  const b = createEnvironment({
    locks,
    localStorage: a.localStorage,
    sessionStorage: new FakeStorage(),
    epoch: 'epoch-lock-b'
  });
  assert.equal((await b.runtime.boot()).ok, true);
  assert.equal(locks.shared, 2);

  const busy = await a.runtime.beginMaintenance('export');
  assertFailure(busy, 'busy', 'lock');
  assert.deepEqual(events, ['freeze', 'flush', 'resume']);
  assert.equal(a.runtime.getState().hasSharedLock, true);
  assert.equal(a.runtime.getState().hasExclusiveLock, false);

  await b.runtime.shutdown();
  assert.equal(locks.shared, 1);

  const maintenance = await a.runtime.beginMaintenance('export');
  assert.equal(maintenance.ok, true);
  assert.equal(a.runtime.getState().hasExclusiveLock, true);
  assert.equal(a.runtime.getState().hasSharedLock, false);
  assert.deepEqual(events, ['freeze', 'flush', 'resume', 'freeze', 'flush']);
  const backup = await maintenance.value.export({ sourceMode: 'stored-only', sourceRelease: 'runtime-test' });
  assert.equal(backup.ok, true);
  const backupPayload = JSON.parse(backup.value.payloadJson);
  assert.equal(backupPayload.sourceMode, 'stored-only');
  assert.equal(backupPayload.sourceRelease, 'runtime-test');
  assert.equal(backupPayload.datasets['calc.settings'].state, 'present');
  assert.equal(backupPayload.datasets['stat.current'].state, 'absent');
  const rescue = await maintenance.value.rescue({ sourceRelease: 'runtime-test' });
  assert.equal(rescue.ok, true);
  assert.equal(rescue.value.format, 'trickcal-manager-rescue');
  const rescueDecoded = require('../storage-backup.js').decodeRescuePackage(JSON.stringify(rescue.value));
  assert.equal((await rescueDecoded).ok, true);
  assert.equal((await maintenance.value.cancel()).ok, true);
  assert.equal(a.runtime.getState().hasSharedLock, true);
  assert.equal(a.runtime.getState().hasExclusiveLock, false);
  assert.deepEqual(events, ['freeze', 'flush', 'resume', 'freeze', 'flush', 'resume']);
  assert.equal(
    a.localStorage.getItem('trickcal_formation_damage_settings_v1'),
    '{"maintenanceFlush":true}'
  );

  const failing = a.runtime.registerParticipant({
    flush: () => ({ ok: false, code: 'write-failed', retryable: true }),
    freeze: () => events.push('freeze-failing'),
    resume: () => events.push('resume-failing')
  });
  assert.equal(failing.ok, true);
  const flushFailure = await a.runtime.beginMaintenance('restore');
  assertFailure(flushFailure, 'write-failed', 'flush');
  assert.equal(a.runtime.getState().hasSharedLock, true);
  assert.equal(a.runtime.getState().lifecycle, 'ready');
  assert.equal(events.includes('resume-failing'), true);
  assert.equal(failing.value.unregister(), true);
  assert.equal(participant.value.unregister(), true);
  await a.runtime.shutdown();
  assert.equal(locks.shared, 0);
}

async function testLockRejectionCompatibility() {
  const rejectedLocks = { request: () => Promise.reject(new Error('locks unavailable')) };
  const env = createEnvironment({ locks: rejectedLocks, epoch: 'epoch-fallback' });
  const boot = await env.runtime.boot();
  assert.equal(boot.ok, true);
  assert.equal(boot.value.compatibility, true);
  assert.deepEqual(env.runtime.writeRaw('calc.settings', '{}'), { ok: true });
  await env.runtime.shutdown();
}

(async () => {
  await testRegistry();
  await testCompatibilityRuntime();
  await testDirectRescueWithoutBoot();
  await testFacadeAndLifecycle();
  await testBootGuards();
  await testOldRuntimeCannotSaveAfterRestoreEpoch();
  await testLocksAndMaintenance();
  await testLockRejectionCompatibility();
  console.log('storage runtime tests passed: registry, compatibility, guards, locks, maintenance, rejection fallback');
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
