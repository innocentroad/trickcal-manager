// 保存共通層。各画面の保存入口へ渡す起動許可・保存アクセス・世代保護・
// 全体排他を提供し、既存の保存順やデータ形式は画面側で維持する。
(function initStorageRuntime(root, factory) {
  const registryApi = root?.TRICKCAL_STORAGE_REGISTRY
    || (typeof require === 'function' ? require('./storage-registry.js') : null);
  const api = factory(root, registryApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_STORAGE_RUNTIME = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createStorageRuntimeApi(root, registryApi) {
  'use strict';

  const DEFAULT_LOCK_NAME = 'trickcal-storage-access-v1';
  const VALID_ROLES = new Set(['app', 'maintenance']);
  const CONTROL_FALLBACK_IDS = Object.freeze({
    meta: 'control.meta',
    journal: 'control.journal',
    sessionEpoch: 'control.sessionEpoch'
  });
  const RESTORE_PHASES = new Set(['prepared', 'applying', 'committed', 'session-pending']);
  const RESTORE_JOURNAL_KEYS = new Set([
    'version',
    'transactionId',
    'phase',
    'before',
    'afterHashes',
    'newEpoch',
    'receipt',
    'pendingWorkspace',
    'createdAt',
    'digest'
  ]);
  const RESTORE_SESSION_IDS = Object.freeze([
    'stat.workspaceDraft',
    'stat.reloadContext',
    'comparison.session'
  ]);
  const MAX_RESTORE_JOURNAL_BYTES = 16 * 1024 * 1024;

  function ok(value) {
    const result = { ok: true };
    if (arguments.length > 0) result.value = value;
    return result;
  }

  function errorResult(code, details = {}) {
    const result = { ok: false, code };
    if (details.operation) result.operation = details.operation;
    if (details.id) result.id = details.id;
    result.retryable = details.retryable !== undefined
      ? !!details.retryable
      : ['busy', 'read-failed', 'write-failed', 'remove-failed'].includes(code);
    return result;
  }

  function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  function isPromiseLike(value) {
    return value && typeof value.then === 'function';
  }

  function utf8ByteLength(value) {
    const text = String(value);
    if (typeof TextEncoder === 'function') return new TextEncoder().encode(text).byteLength;
    if (typeof Buffer !== 'undefined') return Buffer.byteLength(text, 'utf8');
    return unescape(encodeURIComponent(text)).length;
  }

  function defaultEpoch() {
    const cryptoObject = root?.crypto;
    if (typeof cryptoObject?.randomUUID === 'function') return cryptoObject.randomUUID();
    if (typeof require === 'function') {
      try {
        const nodeCrypto = require('node:crypto');
        if (typeof nodeCrypto.randomUUID === 'function') return nodeCrypto.randomUUID();
      } catch {
        // Fall through to a non-cryptographic value for unsupported test hosts.
      }
    }
    return `epoch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function classifyStorageException(error, operation) {
    const name = String(error?.name || '');
    const numberCode = Number(error?.code);
    if (name === 'QuotaExceededError' || numberCode === 22 || numberCode === 1014) {
      return 'quota';
    }
    if (operation === 'read') return 'read-failed';
    if (operation === 'remove') return 'remove-failed';
    return 'write-failed';
  }

  function createStorageRuntime(options = {}) {
    const registry = options.registry
      || registryApi?.registry
      || registryApi?.createStorageRegistry?.();
    const controlIds = registryApi?.controlIds || CONTROL_FALLBACK_IDS;
    const lockName = options.lockName
      || registryApi?.wholeStorageLockName
      || DEFAULT_LOCK_NAME;
    const nativeLocalStorage = options.localStorage !== undefined
      ? options.localStorage
      : root?.localStorage;
    const nativeSessionStorage = options.sessionStorage !== undefined
      ? options.sessionStorage
      : root?.sessionStorage;
    const locks = options.locks !== undefined
      ? options.locks
      : root?.navigator?.locks;
    const now = typeof options.now === 'function' ? options.now : () => Date.now();
    const createEpoch = typeof options.createEpoch === 'function' ? options.createEpoch : defaultEpoch;
    const logger = typeof options.logger === 'function' ? options.logger : null;

    const state = {
      lifecycle: 'new',
      permission: 'none',
      role: null,
      compatibility: false,
      epoch: null,
      shared: null,
      sharedCompletion: null,
      maintenance: null,
      participants: new Map(),
      nextParticipantId: 1,
      bootPromise: null,
      hiddenFlushed: false,
      participantFlushInProgress: false
    };

    function record(event, details = {}) {
      if (!logger) return;
      const safeDetails = {};
      for (const key of ['operation', 'id', 'area', 'mode', 'code', 'retryable', 'phase']) {
        if (details[key] !== undefined) safeDetails[key] = details[key];
      }
      try {
        logger({ event, ...safeDetails });
      } catch {
        // Logging must not change storage behavior.
      }
    }

    function entryFor(id, operation) {
      const normalizedId = String(id);
      const entry = registry?.get?.(normalizedId);
      if (!entry) {
        const result = errorResult('unsupported', {
          operation,
          id: normalizedId,
          retryable: false
        });
        record('storage-error', result);
        return result;
      }
      return entry;
    }

    function storageFor(entry) {
      if (entry.area === 'localStorage') return nativeLocalStorage;
      if (entry.area === 'sessionStorage') return nativeSessionStorage;
      return null;
    }

    function hasStorageMethod(storage, method) {
      return !!storage && typeof storage[method] === 'function';
    }

    function readEntry(entry, operation = 'read') {
      const storage = storageFor(entry);
      if (!hasStorageMethod(storage, 'getItem')) {
        const result = errorResult('unsupported', { operation, id: entry.id, retryable: false });
        record('storage-error', result);
        return result;
      }
      try {
        const value = storage.getItem(entry.key);
        record('storage-read', { operation, id: entry.id, area: entry.area });
        return ok(value == null ? null : String(value));
      } catch (error) {
        const result = errorResult(classifyStorageException(error, 'read'), {
          operation,
          id: entry.id
        });
        record('storage-error', result);
        return result;
      }
    }

    function writeEntry(entry, value, operation = 'write') {
      const storage = storageFor(entry);
      if (!hasStorageMethod(storage, 'setItem')) {
        const result = errorResult('unsupported', { operation, id: entry.id, retryable: false });
        record('storage-error', result);
        return result;
      }
      try {
        entry.codec.encode(value);
      } catch {
        const result = errorResult('invalid-data', { operation, id: entry.id, retryable: false });
        record('storage-error', result);
        return result;
      }
      try {
        storage.setItem(entry.key, value);
        record('storage-write', { operation, id: entry.id, area: entry.area });
        return ok();
      } catch (error) {
        const result = errorResult(classifyStorageException(error, 'write'), { operation, id: entry.id });
        record('storage-error', result);
        return result;
      }
    }

    function removeEntry(entry, operation = 'remove') {
      const storage = storageFor(entry);
      if (!hasStorageMethod(storage, 'removeItem')) {
        const result = errorResult('unsupported', { operation, id: entry.id, retryable: false });
        record('storage-error', result);
        return result;
      }
      try {
        storage.removeItem(entry.key);
        record('storage-remove', { operation, id: entry.id, area: entry.area });
        return ok();
      } catch (error) {
        const result = errorResult(classifyStorageException(error, 'remove'), { operation, id: entry.id });
        record('storage-error', result);
        return result;
      }
    }

    function controlEntry(name) {
      return registry?.get?.(controlIds[name]) || null;
    }

    function parseMeta(raw) {
      if (raw == null) return ok(null);
      let value;
      try {
        value = JSON.parse(raw);
      } catch {
        return errorResult('recovery-required', { operation: 'boot', retryable: false });
      }
      if (!isObject(value)
        || value.version !== 1
        || typeof value.epoch !== 'string'
        || !value.epoch
        || !Number.isInteger(value.restoreSerial)
        || value.restoreSerial < 0
        || (value.lastRestore !== null && !isObject(value.lastRestore))) {
        return errorResult('recovery-required', { operation: 'boot', retryable: false });
      }
      return ok(value);
    }

    function parseJournal(raw) {
      if (raw == null) return ok(null);
      let value;
      try {
        value = JSON.parse(raw);
      } catch {
        return errorResult('recovery-required', { operation: 'boot', retryable: false });
      }
      // G2ではjournalを解釈・削除・復旧しない。version不明を含め、
      // 存在が観測された時点でP3の復旧可能環境へ止める。
      return ok({ present: true, knownVersion: isObject(value) && value.version === 1 });
    }

    function readControls() {
      const metaEntry = controlEntry('meta');
      const journalEntry = controlEntry('journal');
      if (!metaEntry || !journalEntry) {
        return errorResult('unsupported', { operation: 'boot', retryable: false });
      }
      const metaRaw = readEntry(metaEntry, 'boot');
      if (!metaRaw.ok) return metaRaw;
      const journalRaw = readEntry(journalEntry, 'boot');
      if (!journalRaw.ok) return journalRaw;
      const meta = parseMeta(metaRaw.value);
      if (!meta.ok) return meta;
      const journal = parseJournal(journalRaw.value);
      if (!journal.ok) return journal;
      return ok({ meta: meta.value, journal: journal.value });
    }

    function checkStorageAvailability() {
      const localOk = hasStorageMethod(nativeLocalStorage, 'getItem')
        && hasStorageMethod(nativeLocalStorage, 'setItem')
        && hasStorageMethod(nativeLocalStorage, 'removeItem');
      const sessionOk = hasStorageMethod(nativeSessionStorage, 'getItem')
        && hasStorageMethod(nativeSessionStorage, 'setItem')
        && hasStorageMethod(nativeSessionStorage, 'removeItem');
      return localOk && sessionOk;
    }

    function createHeldLock(mode, ifAvailable) {
      if (!locks || typeof locks.request !== 'function') {
        return { ready: Promise.resolve(errorResult('unsupported', { operation: 'lock', retryable: false })) };
      }
      let releaseResolver;
      let releaseRequested = false;
      let readyResolver;
      let readySettled = false;
      const ready = new Promise(resolve => { readyResolver = resolve; });
      const releasePromise = new Promise(resolve => { releaseResolver = resolve; });
      const requestOptions = { mode };
      if (ifAvailable) requestOptions.ifAvailable = true;
      const completion = Promise.resolve().then(() => locks.request(
        lockName,
        requestOptions,
        async lock => {
          if (!lock) {
            if (!readySettled) {
              readySettled = true;
              readyResolver(errorResult('busy', { operation: 'lock', retryable: true }));
            }
            return undefined;
          }
          if (!readySettled) {
            readySettled = true;
            readyResolver(ok({ mode }));
          }
          await releasePromise;
          return undefined;
        }
      )).catch(() => {
        if (!readySettled) {
          readySettled = true;
          readyResolver(errorResult('unsupported', { operation: 'lock', retryable: true }));
        }
        return null;
      });
      completion.catch(() => {});
      return {
        ready,
        completion,
        release() {
          if (releaseRequested) return;
          releaseRequested = true;
          releaseResolver();
        }
      };
    }

    async function releaseHeldLock(held) {
      if (!held) return;
      held.release?.();
      try {
        await held.completion;
      } catch {
        // The lock request already reports a structured result at acquisition.
      }
    }

    async function acquireShared() {
      if (state.compatibility) return ok();
      const held = createHeldLock('shared', false);
      const ready = await held.ready;
      if (!ready.ok) return ready;
      state.shared = held;
      state.sharedCompletion = held.completion;
      record('lock-acquired', { mode: 'shared' });
      return ok();
    }

    async function releaseShared() {
      if (!state.shared) return ok();
      const held = state.shared;
      state.shared = null;
      state.sharedCompletion = null;
      await releaseHeldLock(held);
      record('lock-released', { mode: 'shared' });
      return ok();
    }

    async function acquireExclusive() {
      const held = createHeldLock('exclusive', true);
      const ready = await held.ready;
      if (!ready.ok) {
        await releaseHeldLock(held);
        return ready;
      }
      record('lock-acquired', { mode: 'exclusive' });
      return ok(held);
    }

    function createInitialMeta() {
      return {
        version: 1,
        epoch: String(createEpoch()),
        restoreSerial: 0,
        lastRestore: null
      };
    }

    function metaRaw(meta) {
      try {
        return JSON.stringify(meta);
      } catch {
        return null;
      }
    }

    function persistInitialMeta(meta) {
      const entry = controlEntry('meta');
      const raw = metaRaw(meta);
      if (!entry || raw == null) return errorResult('invalid-data', { operation: 'boot', retryable: false });
      const write = writeEntry(entry, raw, 'boot');
      if (!write.ok) return write;
      const readback = readEntry(entry, 'boot');
      if (!readback.ok) return readback;
      if (readback.value !== raw) return errorResult('write-failed', { operation: 'boot', retryable: true });
      return ok();
    }

    function persistSessionEpoch(epoch) {
      const entry = controlEntry('sessionEpoch');
      if (!entry) return errorResult('unsupported', { operation: 'boot', retryable: false });
      const raw = String(epoch);
      const write = writeEntry(entry, raw, 'boot');
      if (!write.ok) return write;
      const readback = readEntry(entry, 'boot');
      if (!readback.ok) return readback;
      if (readback.value !== raw) {
        return errorResult('write-failed', {
          operation: 'boot',
          id: controlIds.sessionEpoch,
          retryable: true
        });
      }
      return ok();
    }

    function readSessionEpoch() {
      const entry = controlEntry('sessionEpoch');
      if (!entry) return errorResult('unsupported', { operation: 'boot', retryable: false });
      return readEntry(entry, 'boot');
    }

    function validateSessionMarker(meta) {
      const marker = readSessionEpoch();
      if (!marker.ok) return marker;
      if (marker.value == null) {
        if (meta.restoreSerial > 0) {
          return errorResult('stale', { operation: 'boot', id: controlIds.sessionEpoch, retryable: false });
        }
        const write = persistSessionEpoch(meta.epoch);
        return write.ok ? ok() : write;
      }
      if (marker.value !== meta.epoch) {
        return errorResult('stale', { operation: 'boot', id: controlIds.sessionEpoch, retryable: false });
      }
      return ok();
    }

    function rebuildSessionForBoot(meta, markerValue = undefined) {
      if (!meta || typeof meta.epoch !== 'string' || !meta.epoch) {
        return errorResult('recovery-required', { operation: 'boot', retryable: false });
      }
      let marker = markerValue;
      if (marker === undefined) {
        const read = readSessionEpoch();
        if (!read.ok) return read;
        marker = read.value;
      }
      if (marker === meta.epoch) return ok();
      // 初回起動ではsessionの既存値を消さず、markerだけを作成する。
      // restore後、またはepochが変わった新runtimeでは旧tab固有値を
      // 保存へ戻さないため、許可されたsession項目を再構成する。
      if (marker == null && meta.restoreSerial === 0) {
        return persistSessionEpoch(meta.epoch);
      }
      for (const id of RESTORE_SESSION_IDS) {
        const entry = registry?.get?.(id);
        if (!entry || entry.area !== 'sessionStorage') {
          return errorResult('unsupported', { operation: 'boot', id, retryable: false });
        }
        const removed = removeEntry(entry, 'boot-session-rebuild');
        if (!removed.ok) return removed;
        const readback = readEntry(entry, 'boot-session-rebuild');
        if (!readback.ok) return readback;
        if (readback.value !== null) {
          return errorResult('remove-failed', { operation: 'boot', id, retryable: true });
        }
      }
      const persisted = persistSessionEpoch(meta.epoch);
      if (!persisted.ok) return persisted;
      record('session-rebuilt', { operation: 'boot', phase: 'reinitialized' });
      return ok();
    }

    async function bootstrapWithLocks(initialControls) {
      const needsInitialization = initialControls.meta == null;
      const needsRecovery = initialControls.journal?.present;
      if (!needsInitialization && !needsRecovery) {
        const marker = readSessionEpoch();
        if (!marker.ok) return marker;
        const rebuilt = rebuildSessionForBoot(initialControls.meta, marker.value);
        return rebuilt.ok ? ok(initialControls) : rebuilt;
      }

      await releaseShared();
      const exclusive = await acquireExclusive();
      if (!exclusive.ok) return exclusive;
      const held = exclusive.value;
      try {
        let recheck = readControls();
        if (!recheck.ok) return recheck;
        if (recheck.value.journal?.present) {
          const recovered = await recoverJournalUnderExclusive();
          if (!recovered.ok) return recovered;
          recheck = readControls();
          if (!recheck.ok) return recheck;
          if (recheck.value.journal?.present) {
            return errorResult('recovery-required', { operation: 'boot', retryable: false });
          }
        }
        let meta = recheck.value.meta;
        if (meta == null) {
          meta = createInitialMeta();
          const persisted = persistInitialMeta(meta);
          if (!persisted.ok) return persisted;
        }
        const marker = readSessionEpoch();
        if (!marker.ok) return marker;
        const rebuilt = rebuildSessionForBoot(meta, marker.value);
        if (!rebuilt.ok) return rebuilt;
        return ok({ meta, journal: null });
      } finally {
        await releaseHeldLock(held);
      }
    }

    async function bootWithoutLocks() {
      state.compatibility = true;
      const controls = readControls();
      if (!controls.ok) return controls;
      if (controls.value.journal?.present) {
        return errorResult('recovery-required', { operation: 'boot', retryable: false });
      }
      let meta = controls.value.meta;
      if (meta == null) {
        meta = createInitialMeta();
        const persisted = persistInitialMeta(meta);
        if (!persisted.ok) return persisted;
      }
      const marker = readSessionEpoch();
      if (!marker.ok) return marker;
      const rebuilt = rebuildSessionForBoot(meta, marker.value);
      if (!rebuilt.ok) return rebuilt;
      return ok({ meta, journal: null });
    }

    async function boot({ role = 'app' } = {}) {
      if (!VALID_ROLES.has(role)) return errorResult('invalid-data', { operation: 'boot', retryable: false });
      if (state.lifecycle === 'ready') return ok({ compatibility: state.compatibility, role: state.role });
      if (state.lifecycle === 'booting' && state.bootPromise) return state.bootPromise;
      if (state.lifecycle === 'closed') return errorResult('not-ready', { operation: 'boot', retryable: false });
      if (!checkStorageAvailability()) {
        state.lifecycle = 'blocked';
        state.permission = 'blocked';
        return errorResult('unsupported', { operation: 'boot', retryable: false });
      }

      state.lifecycle = 'booting';
      state.role = role;
      state.bootPromise = (async () => {
        const usesLocks = !!locks && typeof locks.request === 'function';
        let controls;
        if (usesLocks) {
          state.compatibility = false;
          const shared = await acquireShared();
          if (!shared.ok) {
            // LockManager自体が使えない環境だけは、meta/journalを読める
            // 場合に限って互換保存へ降格する。busyやjournal検出は降格しない。
            if (shared.code !== 'unsupported') {
              state.lifecycle = 'blocked';
              state.permission = 'blocked';
              return shared;
            }
            state.compatibility = true;
            controls = await bootWithoutLocks();
            if (!controls.ok) {
              state.lifecycle = 'blocked';
              state.permission = 'blocked';
              return controls;
            }
          } else {
            controls = readControls();
            if (!controls.ok) {
              await releaseShared();
              state.lifecycle = 'blocked';
              state.permission = 'blocked';
              return controls;
            }
            const bootstrapped = await bootstrapWithLocks(controls.value);
            if (!bootstrapped.ok) {
              await releaseShared();
              state.lifecycle = 'blocked';
              state.permission = 'blocked';
              return bootstrapped;
            }
            controls = bootstrapped;
            // 初回作成後もsharedを取り直し、metaを再読込してからreadyへ進む。
            if (!state.shared) {
              const reacquired = await acquireShared();
              if (!reacquired.ok) {
                state.lifecycle = 'blocked';
                state.permission = 'blocked';
                return reacquired;
              }
            }
            controls = readControls();
            if (!controls.ok || controls.value.journal?.present || !controls.value.meta) {
              await releaseShared();
              state.lifecycle = 'blocked';
              state.permission = 'blocked';
              return controls.ok
                ? errorResult('recovery-required', { operation: 'boot', retryable: false })
                : controls;
            }
          }
        } else {
          controls = await bootWithoutLocks();
          if (!controls.ok) {
            state.lifecycle = 'blocked';
            state.permission = 'blocked';
            return controls;
          }
        }

        const meta = controls.value.meta;
        const marker = validateSessionMarker(meta);
        if (!marker.ok) {
          await releaseShared();
          state.lifecycle = 'blocked';
          state.permission = 'blocked';
          return marker;
        }
        state.epoch = meta.epoch;
        state.permission = 'allowed';
        state.lifecycle = 'ready';
        record('boot-ready', { mode: state.compatibility ? 'compatibility' : 'shared' });
        return ok({ compatibility: state.compatibility, role: state.role });
      })();
      try {
        return await state.bootPromise;
      } finally {
        state.bootPromise = null;
      }
    }

    function readyFor(operation, id) {
      const canFlushStorage = state.participantFlushInProgress
        && state.permission === 'allowed';
      if ((!canFlushStorage && state.lifecycle !== 'ready') || state.permission !== 'allowed') {
        const result = errorResult('not-ready', { operation, id, retryable: true });
        record('storage-error', result);
        return result;
      }
      return null;
    }

    function verifyEpochAndJournal(operation, id) {
      const journalEntry = controlEntry('journal');
      const metaEntry = controlEntry('meta');
      const markerEntry = controlEntry('sessionEpoch');
      if (!journalEntry || !metaEntry || !markerEntry) {
        return errorResult('unsupported', { operation, id, retryable: false });
      }
      const journal = readEntry(journalEntry, operation);
      if (!journal.ok) return journal;
      if (journal.value != null) {
        return errorResult('recovery-required', { operation, id, retryable: false });
      }
      const metaRaw = readEntry(metaEntry, operation);
      if (!metaRaw.ok) return metaRaw;
      const meta = parseMeta(metaRaw.value);
      if (!meta.ok) return meta;
      if (!meta.value || meta.value.epoch !== state.epoch) {
        return errorResult('stale', { operation, id, retryable: false });
      }
      const marker = readEntry(markerEntry, operation);
      if (!marker.ok) return marker;
      if (marker.value !== state.epoch) {
        return errorResult('stale', { operation, id, retryable: false });
      }
      return ok();
    }

    function readRaw(id) {
      const notReady = readyFor('read', String(id));
      if (notReady) return notReady;
      const entry = entryFor(id, 'read');
      if (!entry || !entry.key) return entry;
      return readEntry(entry, 'read');
    }

    function writeRaw(id, value) {
      const normalizedId = String(id);
      const notReady = readyFor('write', normalizedId);
      if (notReady) return notReady;
      const entry = entryFor(normalizedId, 'write');
      if (!entry || !entry.key) return entry;
      if (entry.control || entry.writable === false) {
        const result = errorResult('unsupported', { operation: 'write', id: normalizedId, retryable: false });
        record('storage-error', result);
        return result;
      }
      if (typeof value !== 'string') {
        const result = errorResult('invalid-data', { operation: 'write', id: normalizedId, retryable: false });
        record('storage-error', result);
        return result;
      }
      const guard = verifyEpochAndJournal('write', normalizedId);
      if (!guard.ok) {
        record('storage-error', guard);
        return guard;
      }
      return writeEntry(entry, value, 'write');
    }

    function removeRaw(id) {
      const normalizedId = String(id);
      const notReady = readyFor('remove', normalizedId);
      if (notReady) return notReady;
      const entry = entryFor(normalizedId, 'remove');
      if (!entry || !entry.key) return entry;
      if (entry.control || entry.writable === false) {
        const result = errorResult('unsupported', { operation: 'remove', id: normalizedId, retryable: false });
        record('storage-error', result);
        return result;
      }
      const guard = verifyEpochAndJournal('remove', normalizedId);
      if (!guard.ok) {
        record('storage-error', guard);
        return guard;
      }
      return removeEntry(entry, 'remove');
    }

    function createStorageFacade() {
      if (state.lifecycle !== 'ready' || state.permission !== 'allowed') {
        return null;
      }

      function facadeError(result) {
        const error = new Error(`storage ${result.code}`);
        error.name = 'StorageRuntimeError';
        error.result = result;
        return error;
      }

      function resolveFacadeEntry(area, key, operation) {
        const entry = registry?.resolve?.(area, key);
        if (!entry) {
          throw facadeError(errorResult('unsupported', {
            operation,
            id: String(key),
            retryable: false
          }));
        }
        return entry;
      }

      function createAreaFacade(area) {
        return Object.freeze({
          getItem(key) {
            const entry = resolveFacadeEntry(area, key, 'read');
            const result = readRaw(entry.id);
            if (!result.ok) throw facadeError(result);
            return result.value;
          },
          setItem(key, value) {
            const entry = resolveFacadeEntry(area, key, 'write');
            const result = writeRaw(entry.id, String(value));
            if (!result.ok) throw facadeError(result);
          },
          removeItem(key) {
            const entry = resolveFacadeEntry(area, key, 'remove');
            const result = removeRaw(entry.id);
            if (!result.ok) throw facadeError(result);
          }
        });
      }

      return Object.freeze({
        ['localStorage']: createAreaFacade('localStorage'),
        ['sessionStorage']: createAreaFacade('sessionStorage')
      });
    }

    function registerParticipant(participant = {}) {
      if (!isObject(participant) || typeof participant.flush !== 'function') {
        return errorResult('invalid-data', { operation: 'registerParticipant', retryable: false });
      }
      const id = `participant-${state.nextParticipantId++}`;
      state.participants.set(id, {
        flush: participant.flush,
        freeze: typeof participant.freeze === 'function' ? participant.freeze : null,
        resume: typeof participant.resume === 'function' ? participant.resume : null
      });
      return ok(Object.freeze({
        id,
        unregister() {
          return state.participants.delete(id);
        }
      }));
    }

    function participantFailure(value, operation) {
      if (value && value.ok === false && typeof value.code === 'string') {
        return errorResult(value.code, {
          operation,
          id: value.id,
          retryable: value.retryable
        });
      }
      return errorResult('invalid-data', { operation, retryable: false });
    }

    async function runFreeze() {
      const frozen = [];
      for (const participant of state.participants.values()) {
        if (!participant.freeze) {
          frozen.push(participant);
          continue;
        }
        try {
          const result = participant.freeze();
          if (isPromiseLike(result)) await result;
          frozen.push(participant);
        } catch {
          return { result: errorResult('write-failed', { operation: 'freeze', retryable: true }), frozen };
        }
      }
      return { result: ok(), frozen };
    }

    function runFlush() {
      const previous = state.participantFlushInProgress;
      state.participantFlushInProgress = true;
      try {
        for (const participant of state.participants.values()) {
          try {
            const result = participant.flush();
            if (isPromiseLike(result)) {
              return errorResult('invalid-data', { operation: 'flush', retryable: false });
            }
            if (!result || result.ok !== true) return participantFailure(result, 'flush');
          } catch {
            return errorResult('write-failed', { operation: 'flush', retryable: true });
          }
        }
        return ok();
      } finally {
        state.participantFlushInProgress = previous;
      }
    }

    async function resumeParticipants() {
      // hidden中のflush済み状態は、visible復帰後に新しい編集境界へ移る。
      // これを残すと、復帰後に編集してからpagehideした場合でも、古い
      // hidden時の成功を再利用して最新値のflushを省略してしまう。
      state.hiddenFlushed = false;
      for (const participant of state.participants.values()) {
        if (!participant.resume) continue;
        try {
          const result = participant.resume();
          if (isPromiseLike(result)) await result;
        } catch {
          // Resume is best effort; permission remains controlled by runtime state.
        }
      }
    }

    function flushParticipants() {
      const notReady = readyFor('flush');
      if (notReady) return notReady;
      const result = runFlush();
      state.hiddenFlushed = result.ok;
      return result;
    }

    async function suspendForPagehide() {
      if (state.lifecycle === 'closed') return errorResult('not-ready', { operation: 'pagehide', retryable: false });
      const flush = state.lifecycle === 'ready'
        ? (state.hiddenFlushed ? ok() : runFlush())
        : ok();
      state.hiddenFlushed = false;
      state.permission = 'none';
      state.lifecycle = 'suspended';
      await releaseShared();
      record('page-suspended', { phase: flush.ok ? 'flushed' : 'flush-failed', code: flush.code });
      return flush;
    }

    async function resumeAfterPageshow() {
      if (state.lifecycle !== 'suspended') {
        return state.lifecycle === 'ready'
          ? ok()
          : errorResult('not-ready', { operation: 'pageshow', retryable: true });
      }
      state.lifecycle = 'resuming';
      state.permission = 'none';
      if (!state.compatibility) {
        const shared = await acquireShared();
        if (!shared.ok) {
          state.lifecycle = 'blocked';
          state.permission = 'blocked';
          return shared;
        }
      }
      const controls = readControls();
      if (!controls.ok || controls.value.journal?.present || !controls.value.meta) {
        await releaseShared();
        state.lifecycle = 'blocked';
        state.permission = 'blocked';
        return controls.ok
          ? errorResult('recovery-required', { operation: 'pageshow', retryable: false })
          : controls;
      }
      if (state.epoch && controls.value.meta.epoch !== state.epoch) {
        await releaseShared();
        state.lifecycle = 'blocked';
        state.permission = 'blocked';
        return errorResult('stale', { operation: 'pageshow', retryable: false });
      }
      const marker = validateSessionMarker(controls.value.meta);
      if (!marker.ok) {
        await releaseShared();
        state.lifecycle = 'blocked';
        state.permission = 'blocked';
        return marker;
      }
      state.epoch = controls.value.meta.epoch;
      state.lifecycle = 'ready';
      state.permission = 'allowed';
      state.hiddenFlushed = false;
      await resumeParticipants();
      record('page-resumed', { phase: state.compatibility ? 'compatibility' : 'shared' });
      return ok();
    }

    async function reacquireAfterMaintenance() {
      const shared = await acquireShared();
      if (!shared.ok) {
        state.lifecycle = 'blocked';
        state.permission = 'blocked';
        return shared;
      }
      state.lifecycle = 'ready';
      state.permission = 'allowed';
      return ok();
    }

    function unsupportedMaintenance(operation) {
      return errorResult('unsupported', { operation, retryable: false });
    }

    function resolveBackupApi() {
      if (root?.TRICKCAL_STORAGE_BACKUP) return root.TRICKCAL_STORAGE_BACKUP;
      if (typeof require === 'function') {
        try {
          return require('./storage-backup.js');
        } catch {
          return null;
        }
      }
      return null;
    }

    function restoreFailure(code, operation, id, retryable) {
      const result = errorResult(code, { operation, id, retryable });
      record('restore-error', result);
      return result;
    }

    async function decodeRestoreInput(input) {
      const backupApi = resolveBackupApi();
      if (!backupApi?.decodeBackupPackage) {
        return restoreFailure('unsupported', 'planRestore', undefined, false);
      }
      let candidate = input;
      if (candidate && candidate.ok === true && candidate.value !== undefined) {
        candidate = candidate.value;
      }
      if (candidate && isObject(candidate) && candidate.package && candidate.payload) {
        candidate = candidate.package;
      }
      try {
        const decoded = await backupApi.decodeBackupPackage(candidate);
        if (!decoded?.ok) {
          return restoreFailure(
            decoded?.code || 'invalid-data',
            'planRestore',
            decoded?.id,
            decoded?.retryable
          );
        }
        return decoded;
      } catch {
        return restoreFailure('unsupported', 'planRestore', undefined, false);
      }
    }

    function restoreJournalCore(journal) {
      return {
        version: journal.version,
        transactionId: journal.transactionId,
        before: journal.before,
        afterHashes: journal.afterHashes,
        newEpoch: journal.newEpoch,
        receipt: journal.receipt,
        pendingWorkspace: journal.pendingWorkspace,
        createdAt: journal.createdAt
      };
    }

    async function serializeRestoreJournal(journal) {
      const backupApi = resolveBackupApi();
      if (!backupApi?.sha256Hex) {
        return restoreFailure('unsupported', 'restore-journal', 'control.journal', false);
      }
      try {
        const core = restoreJournalCore(journal);
        const digest = await backupApi.sha256Hex(JSON.stringify(core));
        const value = { ...core, phase: journal.phase, digest };
        const raw = JSON.stringify(value);
        if (typeof raw !== 'string') {
          return restoreFailure('invalid-data', 'restore-journal', 'control.journal', false);
        }
        if (utf8ByteLength(raw) > MAX_RESTORE_JOURNAL_BYTES) {
          return restoreFailure('oversize', 'restore-journal', 'control.journal', false);
        }
        return ok({ raw, digest });
      } catch {
        return restoreFailure('unsupported', 'restore-journal', 'control.journal', false);
      }
    }

    async function writeRestoreJournal(journal) {
      const entry = controlEntry('journal');
      if (!entry) return restoreFailure('unsupported', 'restore-journal', 'control.journal', false);
      const serialized = await serializeRestoreJournal(journal);
      if (!serialized.ok) return serialized;
      journal.digest = serialized.value.digest;
      const write = writeEntry(entry, serialized.value.raw, 'restore-journal');
      if (!write.ok) return write;
      const readback = readEntry(entry, 'restore-journal');
      if (!readback.ok) return readback;
      if (readback.value !== serialized.value.raw) {
        return restoreFailure('write-failed', 'restore-journal', 'control.journal', true);
      }
      record('restore-journal-written', { operation: 'restore-journal', phase: journal.phase });
      return ok();
    }

    function exactKeys(value, keys) {
      if (!isObject(value)) return false;
      const actual = Object.keys(value);
      return actual.length === keys.size && actual.every(key => keys.has(key));
    }

    async function parseRestoreJournal(raw) {
      if (typeof raw !== 'string' || !raw) {
        return restoreFailure('recovery-required', 'restore-journal', 'control.journal', false);
      }
      let journal;
      try {
        journal = JSON.parse(raw);
      } catch {
        return restoreFailure('recovery-required', 'restore-journal', 'control.journal', false);
      }
      if (!exactKeys(journal, RESTORE_JOURNAL_KEYS)
        || journal.version !== 1
        || typeof journal.transactionId !== 'string'
        || !journal.transactionId
        || !RESTORE_PHASES.has(journal.phase)
        || !Array.isArray(journal.before)
        || !Array.isArray(journal.afterHashes)
        || typeof journal.newEpoch !== 'string'
        || !journal.newEpoch
        || !exactKeys(journal.receipt, new Set(['transactionId', 'packageDigest']))
        || journal.receipt.transactionId !== journal.transactionId
        || typeof journal.receipt.packageDigest !== 'string'
        || !/^[0-9a-f]{64}$/.test(journal.receipt.packageDigest)
        || (journal.pendingWorkspace !== null
          && !exactKeys(journal.pendingWorkspace, new Set(['workspaceRaw'])))
        || typeof journal.createdAt !== 'string'
        || Number.isNaN(Date.parse(journal.createdAt))
        || typeof journal.digest !== 'string'
        || !/^[0-9a-f]{64}$/.test(journal.digest)) {
        return restoreFailure('recovery-required', 'restore-journal', 'control.journal', false);
      }
      if (journal.pendingWorkspace
        && journal.pendingWorkspace.workspaceRaw !== null
        && typeof journal.pendingWorkspace.workspaceRaw !== 'string') {
        return restoreFailure('recovery-required', 'restore-journal', 'control.journal', false);
      }

      const beforeIds = new Set();
      for (const item of journal.before) {
        if (!exactKeys(item, new Set(['id', 'raw']))
          || typeof item.id !== 'string'
          || beforeIds.has(item.id)
          || (item.raw !== null && typeof item.raw !== 'string')) {
          return restoreFailure('recovery-required', 'restore-journal', 'control.journal', false);
        }
        const entry = registry?.get?.(item.id);
        if (!entry || entry.area !== 'localStorage'
          || (entry.control && item.id !== controlIds.meta)) {
          return restoreFailure('recovery-required', 'restore-journal', 'control.journal', false);
        }
        beforeIds.add(item.id);
      }
      const afterIds = new Set();
      for (const item of journal.afterHashes) {
        if (!exactKeys(item, new Set(['id', 'sha256']))
          || typeof item.id !== 'string'
          || afterIds.has(item.id)
          || (item.sha256 !== null && !/^[0-9a-f]{64}$/.test(item.sha256))) {
          return restoreFailure('recovery-required', 'restore-journal', 'control.journal', false);
        }
        const entry = registry?.get?.(item.id);
        if (!entry || entry.area !== 'localStorage'
          || (entry.control && item.id !== controlIds.meta)) {
          return restoreFailure('recovery-required', 'restore-journal', 'control.journal', false);
        }
        afterIds.add(item.id);
      }
      if (beforeIds.size !== afterIds.size || !Array.from(beforeIds).every(id => afterIds.has(id))) {
        return restoreFailure('recovery-required', 'restore-journal', 'control.journal', false);
      }

      const backupApi = resolveBackupApi();
      if (!backupApi?.sha256Hex) {
        return restoreFailure('unsupported', 'restore-journal', 'control.journal', false);
      }
      try {
        const expectedDigest = await backupApi.sha256Hex(JSON.stringify(restoreJournalCore(journal)));
        if (expectedDigest !== journal.digest) {
          return restoreFailure('recovery-required', 'restore-journal', 'control.journal', false);
        }
      } catch {
        return restoreFailure('unsupported', 'restore-journal', 'control.journal', false);
      }
      return ok(journal);
    }

    async function readRestoreJournal() {
      const entry = controlEntry('journal');
      if (!entry) return restoreFailure('unsupported', 'restore-journal', 'control.journal', false);
      const raw = readEntry(entry, 'restore-journal');
      if (!raw.ok) return raw;
      if (raw.value === null) return ok(null);
      return parseRestoreJournal(raw.value);
    }

    async function removeRestoreJournal() {
      const entry = controlEntry('journal');
      if (!entry) return restoreFailure('unsupported', 'restore-journal', 'control.journal', false);
      const removed = removeEntry(entry, 'restore-journal');
      if (!removed.ok) return removed;
      const readback = readEntry(entry, 'restore-journal');
      if (!readback.ok) {
        // removeItemが成功した後の一時的なread失敗を、未確認の成功や
        // 復元失敗に即時変換しない。再読込で削除を確認できた場合だけ完了へ進む。
        const retry = readEntry(entry, 'restore-journal');
        if (!retry.ok) return restoreFailure('remove-failed', 'restore-journal', 'control.journal', true);
        if (retry.value !== null) {
          return restoreFailure('remove-failed', 'restore-journal', 'control.journal', true);
        }
      }
      if (readback.ok && readback.value !== null) {
        return restoreFailure('remove-failed', 'restore-journal', 'control.journal', true);
      }
      record('restore-journal-removed', { operation: 'restore-journal' });
      return ok();
    }

    function applyRestoreRaw(id, raw, operation) {
      const entry = registry?.get?.(String(id));
      if (!entry) return restoreFailure('unsupported', operation, String(id), false);
      const result = raw === null
        ? removeEntry(entry, operation)
        : writeEntry(entry, raw, operation);
      if (!result.ok) return result;
      const readback = readEntry(entry, operation);
      if (!readback.ok) return readback;
      if (readback.value !== raw) {
        return restoreFailure('write-failed', operation, entry.id, true);
      }
      return ok();
    }

    async function verifyRestoreAfterHashes(journal) {
      const backupApi = resolveBackupApi();
      if (!backupApi?.sha256Hex) {
        return restoreFailure('unsupported', 'restore-readback', undefined, false);
      }
      for (const expected of journal.afterHashes) {
        const entry = registry?.get?.(expected.id);
        if (!entry) return restoreFailure('unsupported', 'restore-readback', expected.id, false);
        const actual = readEntry(entry, 'restore-readback');
        if (!actual.ok) return actual;
        if (expected.sha256 === null) {
          if (actual.value !== null) {
            return restoreFailure('recovery-required', 'restore-readback', expected.id, false);
          }
          continue;
        }
        try {
          if (actual.value === null || await backupApi.sha256Hex(actual.value) !== expected.sha256) {
            return restoreFailure('recovery-required', 'restore-readback', expected.id, false);
          }
        } catch {
          return restoreFailure('unsupported', 'restore-readback', expected.id, false);
        }
      }
      return ok();
    }

    async function rollbackRestoreJournal(journal) {
      if (!journal || !['prepared', 'applying'].includes(journal.phase)) {
        return restoreFailure('invalid-data', 'rollback', 'control.journal', false);
      }
      for (const item of journal.before.slice().reverse()) {
        const restored = applyRestoreRaw(item.id, item.raw, 'rollback');
        if (!restored.ok) return restored;
      }
      const removed = await removeRestoreJournal();
      if (!removed.ok) return removed;
      record('restore-rolled-back', { operation: 'rollback', phase: journal.phase });
      return ok({ phase: 'rolled-back', transactionId: journal.transactionId });
    }

    async function resumeRestoreSession(journal) {
      if (!journal || !['committed', 'session-pending'].includes(journal.phase)) {
        return restoreFailure('invalid-data', 'restore-session', 'control.journal', false);
      }
      const verified = await verifyRestoreAfterHashes(journal);
      if (!verified.ok) return verified;
      if (journal.phase === 'committed') {
        journal.phase = 'session-pending';
        const marked = await writeRestoreJournal(journal);
        if (!marked.ok) return marked;
      }

      const workspaceRaw = journal.pendingWorkspace?.workspaceRaw ?? null;
      const workspace = applyRestoreRaw('stat.workspaceDraft', workspaceRaw, 'restore-session');
      if (!workspace.ok) return workspace;
      for (const id of ['stat.reloadContext', 'comparison.session']) {
        const removed = applyRestoreRaw(id, null, 'restore-session');
        if (!removed.ok) return removed;
      }
      const epoch = applyRestoreRaw(controlIds.sessionEpoch, journal.newEpoch, 'restore-session');
      if (!epoch.ok) return epoch;
      const removed = await removeRestoreJournal();
      if (!removed.ok) return removed;
      record('restore-complete', { operation: 'restore-session', phase: 'complete' });
      return ok({ phase: 'complete', transactionId: journal.transactionId, newEpoch: journal.newEpoch });
    }

    async function recoverJournalUnderExclusive() {
      const journal = await readRestoreJournal();
      if (!journal.ok) {
        return journal.code === 'read-failed'
          ? restoreFailure('recovery-required', 'boot', 'control.journal', false)
          : journal;
      }
      if (!journal.value) return ok({ phase: 'none' });
      if (['prepared', 'applying'].includes(journal.value.phase)) {
        return rollbackRestoreJournal(journal.value);
      }
      if (['committed', 'session-pending'].includes(journal.value.phase)) {
        return resumeRestoreSession(journal.value);
      }
      return restoreFailure('recovery-required', 'boot', 'control.journal', false);
    }

    async function planRestoreTransaction(input, options = {}) {
      if (!state.maintenance || state.maintenance.kind !== 'restore') {
        return restoreFailure('unsupported', 'planRestore', undefined, false);
      }
      if (state.maintenance.restorePlan) {
        return restoreFailure('busy', 'planRestore', undefined, true);
      }
      const decoded = await decodeRestoreInput(input);
      if (!decoded.ok) return decoded;
      const backupApi = resolveBackupApi();
      if (!backupApi?.buildRestoreEntries) {
        return restoreFailure('unsupported', 'planRestore', undefined, false);
      }

      const existingJournal = await readRestoreJournal();
      if (!existingJournal.ok) return existingJournal;
      if (existingJournal.value) {
        return restoreFailure('recovery-required', 'planRestore', 'control.journal', false);
      }

      let transactionSeed;
      let newEpoch;
      try {
        transactionSeed = String(createEpoch());
        newEpoch = String(createEpoch());
      } catch {
        return restoreFailure('unsupported', 'planRestore', undefined, false);
      }
      if (!transactionSeed || !newEpoch) {
        return restoreFailure('unsupported', 'planRestore', undefined, false);
      }
      if (newEpoch === state.epoch) newEpoch = `${newEpoch}-restore-${String(now())}`;
      const transactionId = `restore-${transactionSeed}-${String(now())}`;

      let restoreEntries;
      try {
        restoreEntries = backupApi.buildRestoreEntries(decoded.value.payload, {
          includeDisplaySettings: options.includeDisplaySettings !== false,
          allowAuxiliaryExclusion: options.allowAuxiliaryExclusion === true,
          transactionId,
          restoredAt: new Date().toISOString()
        });
      } catch (error) {
        return restoreFailure(
          error?.code || 'invalid-data',
          'planRestore',
          error?.details?.dataset,
          false
        );
      }
      const excludedAuxiliaryKeys = decoded.value.summary?.datasets
        ?.filter(dataset => dataset.state === 'excluded')
        .map(dataset => dataset.key)
        || [];
      const targetEntries = [];
      for (const source of restoreEntries) {
        const entry = registry?.get?.(source.id);
        if (!entry || entry.control || entry.writable === false) {
          return restoreFailure('unsupported', 'planRestore', source.id, false);
        }
        const current = readEntry(entry, 'restore-validate');
        if (!current.ok) return current;
        targetEntries.push({
          dataset: source.dataset,
          id: source.id,
          desiredRaw: source.raw,
          beforeRaw: current.value
        });
      }

      const metaEntry = controlEntry('meta');
      if (!metaEntry) return restoreFailure('unsupported', 'planRestore', 'control.meta', false);
      const metaRead = readEntry(metaEntry, 'restore-validate');
      if (!metaRead.ok) return metaRead;
      const currentMeta = parseMeta(metaRead.value);
      if (!currentMeta.ok) return currentMeta;
      if (!currentMeta.value || currentMeta.value.epoch !== state.epoch) {
        return restoreFailure('stale', 'planRestore', 'control.meta', false);
      }
      const plan = {
        transactionId,
        packageDigest: decoded.value.package.sha256,
        sourceMode: decoded.value.payload.sourceMode,
        summary: decoded.value.summary,
        includeDisplaySettings: options.includeDisplaySettings !== false,
        allowAuxiliaryExclusion: options.allowAuxiliaryExclusion === true,
        excludedAuxiliaryKeys,
        entries: targetEntries,
        metaBeforeRaw: metaRead.value,
        newEpoch
      };
      state.maintenance.restorePlan = plan;
      record('restore-planned', { operation: 'planRestore', phase: 'validated' });
      return ok({
        transactionId,
        packageDigest: plan.packageDigest,
        sourceMode: plan.sourceMode,
        summary: plan.summary,
        includeDisplaySettings: plan.includeDisplaySettings,
        allowAuxiliaryExclusion: plan.allowAuxiliaryExclusion,
        excludedAuxiliaryKeys: plan.excludedAuxiliaryKeys,
        affectedEntryCount: plan.entries.length,
        datasetKeys: Array.from(new Set(plan.entries.map(entry => entry.dataset)))
      });
    }

    async function verifyRestorePlanCurrent(plan) {
      const journal = await readRestoreJournal();
      if (!journal.ok) return journal;
      if (journal.value) return restoreFailure('recovery-required', 'applyRestore', 'control.journal', false);
      for (const target of plan.entries) {
        const entry = registry?.get?.(target.id);
        if (!entry) return restoreFailure('unsupported', 'applyRestore', target.id, false);
        const current = readEntry(entry, 'restore-validate');
        if (!current.ok) return current;
        if (current.value !== target.beforeRaw) {
          return restoreFailure('stale', 'applyRestore', target.id, false);
        }
      }
      const metaEntry = controlEntry('meta');
      if (!metaEntry) return restoreFailure('unsupported', 'applyRestore', 'control.meta', false);
      const metaRead = readEntry(metaEntry, 'restore-validate');
      if (!metaRead.ok) return metaRead;
      if (metaRead.value !== plan.metaBeforeRaw) {
        return restoreFailure('stale', 'applyRestore', 'control.meta', false);
      }
      const meta = parseMeta(metaRead.value);
      if (!meta.ok) return meta;
      if (!meta.value || meta.value.epoch !== state.epoch) {
        return restoreFailure('stale', 'applyRestore', 'control.meta', false);
      }
      return ok(meta.value);
    }

    async function createRestoreAfterHashes(items) {
      const backupApi = resolveBackupApi();
      if (!backupApi?.sha256Hex) {
        return restoreFailure('unsupported', 'restore-journal', undefined, false);
      }
      const afterHashes = [];
      try {
        for (const item of items) {
          afterHashes.push({
            id: item.id,
            sha256: item.raw === null ? null : await backupApi.sha256Hex(item.raw)
          });
        }
      } catch {
        return restoreFailure('unsupported', 'restore-journal', undefined, false);
      }
      return ok(afterHashes);
    }

    async function restoreApplyFailure(journal, original) {
      const observed = await readRestoreJournal();
      if (!observed.ok) {
        return restoreFailure('recovery-required', 'applyRestore', 'control.journal', false);
      }
      if (!observed.value) return original;
      if (['committed', 'session-pending'].includes(observed.value.phase)) {
        return resumeRestoreSession(observed.value);
      }
      if (['prepared', 'applying'].includes(observed.value.phase)) {
        const rolledBack = await rollbackRestoreJournal(observed.value);
        if (!rolledBack.ok) return rolledBack;
        const result = errorResult(original?.code || 'write-failed', {
          operation: original?.operation || 'applyRestore',
          id: original?.id,
          retryable: original?.retryable
        });
        result.rolledBack = true;
        record('restore-failed-rolled-back', result);
        return result;
      }
      return restoreFailure('recovery-required', 'applyRestore', 'control.journal', false);
    }

    async function finishRestoreRuntime(result, held) {
      if (!result?.ok || result.value?.phase !== 'complete') return result;
      state.epoch = result.value.newEpoch;
      state.permission = 'blocked';
      state.lifecycle = 'restore-complete';
      state.maintenance = null;
      await releaseHeldLock(held);
      record('restore-runtime-blocked', { operation: 'applyRestore', phase: 'complete' });
    return ok({
        transactionId: result.value.transactionId,
        phase: 'complete',
        reloadRequired: true,
        epoch: result.value.newEpoch
      });
    }

    async function applyRestorePlan(planInput) {
      if (!state.maintenance || state.maintenance.kind !== 'restore') {
        return restoreFailure('unsupported', 'applyRestore', undefined, false);
      }
      const plan = state.maintenance.restorePlan;
      if (!plan) return restoreFailure('not-ready', 'applyRestore', undefined, true);
      const requestedId = planInput?.transactionId || planInput;
      if (requestedId !== undefined && requestedId !== plan.transactionId) {
        return restoreFailure('invalid-data', 'applyRestore', undefined, false);
      }
      const current = await verifyRestorePlanCurrent(plan);
      if (!current.ok) return current;

      const meta = {
        ...current.value,
        epoch: plan.newEpoch,
        restoreSerial: current.value.restoreSerial + 1,
        lastRestore: {
          transactionId: plan.transactionId,
          packageDigest: plan.packageDigest
        }
      };
      const newMetaRaw = metaRaw(meta);
      if (!newMetaRaw) return restoreFailure('invalid-data', 'applyRestore', 'control.meta', false);
      const localTargets = plan.entries.filter(target => registry?.get?.(target.id)?.area === 'localStorage');
      const before = localTargets.map(target => ({ id: target.id, raw: target.beforeRaw }));
      before.push({ id: controlIds.meta, raw: plan.metaBeforeRaw });
      const afterItems = localTargets.map(target => ({ id: target.id, raw: target.desiredRaw }));
      afterItems.push({ id: controlIds.meta, raw: newMetaRaw });
      const afterHashes = await createRestoreAfterHashes(afterItems);
      if (!afterHashes.ok) return afterHashes;

      const workspace = plan.entries.find(target => target.id === 'stat.workspaceDraft');
      const journal = {
        version: 1,
        transactionId: plan.transactionId,
        phase: 'prepared',
        before,
        afterHashes: afterHashes.value,
        newEpoch: plan.newEpoch,
        receipt: {
          transactionId: plan.transactionId,
          packageDigest: plan.packageDigest
        },
        pendingWorkspace: {
          workspaceRaw: workspace?.desiredRaw ?? null
        },
        createdAt: new Date(now()).toISOString(),
        digest: ''
      };
      let result = await writeRestoreJournal(journal);
      if (!result.ok) return restoreApplyFailure(journal, result);

      journal.phase = 'applying';
      result = await writeRestoreJournal(journal);
      if (!result.ok) {
        const failed = await restoreApplyFailure(journal, result);
        return failed.ok ? finishRestoreRuntime(failed, state.maintenance?.held) : failed;
      }

      for (const target of localTargets) {
        result = applyRestoreRaw(target.id, target.desiredRaw, 'restore-apply');
        if (!result.ok) {
          const failed = await restoreApplyFailure(journal, result);
          return failed.ok ? finishRestoreRuntime(failed, state.maintenance?.held) : failed;
        }
      }
      result = applyRestoreRaw(controlIds.meta, newMetaRaw, 'restore-apply');
      if (!result.ok) {
        const failed = await restoreApplyFailure(journal, result);
        return failed.ok ? finishRestoreRuntime(failed, state.maintenance?.held) : failed;
      }
      result = await verifyRestoreAfterHashes(journal);
      if (!result.ok) {
        const failed = await restoreApplyFailure(journal, result);
        return failed.ok ? finishRestoreRuntime(failed, state.maintenance?.held) : failed;
      }

      journal.phase = 'committed';
      result = await writeRestoreJournal(journal);
      if (!result.ok) {
        const failed = await restoreApplyFailure(journal, result);
        return failed.ok ? finishRestoreRuntime(failed, state.maintenance?.held) : failed;
      }
      result = await resumeRestoreSession(journal);
      return result.ok
        ? finishRestoreRuntime(result, state.maintenance?.held)
        : result;
    }

    async function recoverRestoreInMaintenance() {
      if (!state.maintenance || state.maintenance.kind !== 'restore') {
        return restoreFailure('unsupported', 'recoverRestore', undefined, false);
      }
      const recovered = await recoverJournalUnderExclusive();
      if (!recovered.ok) return recovered;
      if (recovered.value?.phase === 'complete') {
        return finishRestoreRuntime(recovered, state.maintenance.held);
      }
      if (recovered.value?.phase === 'rolled-back') {
        state.maintenance.restorePlan = null;
      }
      return recovered;
    }

    async function inspectPendingRecovery() {
      const journal = await readRestoreJournal();
      if (!journal.ok) return journal;
      if (!journal.value) return ok({ present: false, phase: 'none' });
      return ok({
        present: true,
        phase: journal.value.phase,
        transactionId: journal.value.transactionId,
        receipt: { ...journal.value.receipt }
      });
    }

    async function recoverPendingJournal() {
      if (state.shared || state.maintenance) {
        return restoreFailure('busy', 'recoverPendingJournal', undefined, true);
      }
      if (!locks || typeof locks.request !== 'function') {
        return restoreFailure('unsupported', 'recoverPendingJournal', undefined, false);
      }
      const existing = await readRestoreJournal();
      if (!existing.ok) return existing;
      if (!existing.value) return ok({ phase: 'none' });
      const exclusive = await acquireExclusive();
      if (!exclusive.ok) return exclusive;
      state.lifecycle = 'recovery';
      state.permission = 'blocked';
      state.maintenance = { kind: 'recovery', held: exclusive.value };
      let result;
      try {
        result = await recoverJournalUnderExclusive();
      } finally {
        state.maintenance = null;
        await releaseHeldLock(exclusive.value);
        state.lifecycle = 'closed';
      }
      return result;
    }

    async function exportBackup(options = {}) {
      const backupApi = resolveBackupApi();
      if (!backupApi?.createBackupPackageFromEntries || !backupApi.isIncludedEntryId) {
        return unsupportedMaintenance('export');
      }
      const sourceMode = options?.sourceMode || 'current-tab';
      const entries = {};
      for (const entry of registry?.userEntries || []) {
        if (!backupApi.isIncludedEntryId(entry.id)) continue;
        // stored-only is also used by an independent recovery entry point;
        // do not read a tab-local draft in that mode.
        if (sourceMode === 'stored-only' && entry.id === 'stat.workspaceDraft') continue;
        const read = readEntry(entry, 'backup-export');
        if (!read.ok) return read;
        entries[entry.id] = read.value;
      }
      try {
        const result = await backupApi.createBackupPackageFromEntries(entries, {
          sourceMode,
          sourceRelease: options?.sourceRelease,
          createdAt: options?.createdAt
        });
        if (!result?.ok) {
          record('backup-error', {
            operation: 'export',
            id: result?.id,
            code: result?.code,
            retryable: result?.retryable
          });
          return errorResult(result?.code || 'invalid-data', {
            operation: 'export',
            id: result?.id,
            retryable: result?.retryable
          });
        }
        record('backup-exported', { operation: 'export', mode: sourceMode });
        return result;
      } catch {
        const result = errorResult('unsupported', { operation: 'export', retryable: false });
        record('backup-error', result);
        return result;
      }
    }

    async function exportRescueFromRawEntries(options = {}) {
      const backupApi = resolveBackupApi();
      if (!backupApi?.createRescuePackageFromEntries || !Array.isArray(backupApi.rescueEntrySpecs)) {
        return unsupportedMaintenance('rescue');
      }
      const entries = {};
      for (const spec of backupApi.rescueEntrySpecs) {
        const entry = registry?.get?.(spec.id);
        if (!entry || entry.area !== spec.area) {
          entries[spec.id] = { area: spec.area, state: 'read-failed', code: 'unsupported' };
          continue;
        }
        const read = readEntry(entry, 'rescue-export');
        if (!read.ok) {
          entries[spec.id] = { area: spec.area, state: 'read-failed', code: read.code || 'read-failed' };
        } else if (read.value === null) {
          entries[spec.id] = { area: spec.area, state: 'absent' };
        } else {
          entries[spec.id] = { area: spec.area, state: 'present', raw: read.value };
        }
      }
      try {
        const result = await backupApi.createRescuePackageFromEntries(entries, {
          sourceRelease: options?.sourceRelease,
          createdAt: options?.createdAt
        });
        if (!result?.ok) {
          record('rescue-error', {
            operation: 'rescue',
            id: result?.id,
            code: result?.code,
            retryable: result?.retryable
          });
          return errorResult(result?.code || 'invalid-data', {
            operation: 'rescue',
            id: result?.id,
            retryable: result?.retryable
          });
        }
        record('rescue-exported', { operation: 'rescue' });
        return result;
      } catch {
        return restoreFailure('unsupported', 'rescue', undefined, false);
      }
    }

    async function exportRescue(options = {}) {
      return exportRescueFromRawEntries(options);
    }

    // 起動失敗・壊れたjournal・Web Locks非対応でも、通常bootやmaintenanceの
    // flushへ依存せず、現在読める保存値を救出できる独立入口。
    async function exportRescueDirect(options = {}) {
      return exportRescueFromRawEntries(options);
    }

    async function beginMaintenance(kind) {
      if (state.lifecycle !== 'ready' || state.permission !== 'allowed') {
        return errorResult('not-ready', { operation: 'beginMaintenance', retryable: true });
      }
      if (state.compatibility) return unsupportedMaintenance('beginMaintenance');
      if (state.maintenance) return errorResult('busy', { operation: 'beginMaintenance', retryable: true });
      if (typeof kind !== 'string' || !kind.trim()) {
        return errorResult('invalid-data', { operation: 'beginMaintenance', retryable: false });
      }

      state.lifecycle = 'freezing';
      const freeze = await runFreeze();
      if (!freeze.result.ok) {
        await resumeParticipants();
        state.lifecycle = 'ready';
        return freeze.result;
      }
      const flush = runFlush();
      if (!flush.ok) {
        await resumeParticipants();
        state.lifecycle = 'ready';
        return flush;
      }
      await releaseShared();
      const exclusive = await acquireExclusive();
      if (!exclusive.ok) {
        const reacquired = await reacquireAfterMaintenance();
        await resumeParticipants();
        return exclusive.ok ? reacquired : exclusive;
      }

      state.lifecycle = 'maintenance';
      state.maintenance = { kind, held: exclusive.value };
      const handle = {
        kind,
        async export(options = {}) {
          if (kind !== 'backup' && kind !== 'export') {
            return unsupportedMaintenance('export');
          }
          return exportBackup(options);
        },
        async rescue(options = {}) {
          if (kind !== 'backup' && kind !== 'export') {
            return unsupportedMaintenance('rescue');
          }
          return exportRescue(options);
        },
        async planRestore() {
          if (kind !== 'restore') return unsupportedMaintenance('planRestore');
          return planRestoreTransaction(...arguments);
        },
        async applyRestore(planInput) {
          if (kind !== 'restore') return unsupportedMaintenance('applyRestore');
          return applyRestorePlan(planInput);
        },
        async recover() {
          if (kind !== 'restore') return unsupportedMaintenance('recoverRestore');
          return recoverRestoreInMaintenance();
        },
        async cancel() {
          if (!state.maintenance || state.maintenance.held !== exclusive.value) {
            return errorResult('invalid-data', { operation: 'cancel', retryable: false });
          }
          if (kind === 'restore') {
            const journal = await readRestoreJournal();
            if (!journal.ok) return journal;
            if (journal.value) {
              return restoreFailure('recovery-required', 'cancel', 'control.journal', false);
            }
          }
          state.maintenance = null;
          await releaseHeldLock(exclusive.value);
          const reacquired = await reacquireAfterMaintenance();
          await resumeParticipants();
          return reacquired;
        }
      };
      return ok(handle);
    }

    async function shutdown() {
      state.permission = 'blocked';
      state.lifecycle = 'closed';
      if (state.maintenance?.held) {
        await releaseHeldLock(state.maintenance.held);
        state.maintenance = null;
      }
      await releaseShared();
      return ok();
    }

    function getState() {
      return Object.freeze({
        lifecycle: state.lifecycle,
        permission: state.permission,
        role: state.role,
        compatibility: state.compatibility,
        hasSharedLock: !!state.shared,
        hasExclusiveLock: !!state.maintenance,
        participantCount: state.participants.size
      });
    }

    return Object.freeze({
      boot,
      readRaw,
      writeRaw,
      remove: removeRaw,
      removeRaw,
      createStorageFacade,
      registerParticipant,
      flushParticipants,
      resumeParticipants,
      suspendForPagehide,
      resumeAfterPageshow,
      beginMaintenance,
      exportRescueDirect,
      inspectPendingRecovery,
      recoverPendingJournal,
      shutdown,
      getState
    });
  }

  return Object.freeze({
    version: 1,
    createStorageRuntime,
    result: Object.freeze({ ok, error: errorResult })
  });
});
