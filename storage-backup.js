// 全体バックアップのv1形式を扱う純粋なcodec/validator。
// 保存先への書込みや復元は行わず、採取側と将来の復元側で同じ検証結果を使う。
(function initStorageBackup(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_STORAGE_BACKUP = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createStorageBackupApi(root) {
  'use strict';

  const FORMAT = 'trickcal-manager-backup';
  const VERSION = 1;
  const SCHEMA_SET = 1;
  const MAX_BYTES = 8 * 1024 * 1024;
  const MAX_JSON_DEPTH = 64;
  const MAX_JSON_NODES = 1_000_000;
  const SOURCE_MODES = new Set(['current-tab', 'stored-only']);
  const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
  const OUTER_KEYS = new Set(['format', 'version', 'payloadJson', 'sha256']);
  const PAYLOAD_KEYS = new Set(['schemaSet', 'sourceRelease', 'createdAt', 'sourceMode', 'datasets']);
  const RESCUE_FORMAT = 'trickcal-manager-rescue';
  const RESCUE_PAYLOAD_KEYS = new Set(['schemaSet', 'sourceRelease', 'createdAt', 'entries']);
  const AUXILIARY_DATASET_KEYS = new Set([
    'calc.settings',
    'dps.settings',
    'dps.runtimeOverrides'
  ]);
  const AUXILIARY_EXCLUSION_CODES = new Set(['invalid-data', 'recovery-required', 'unsupported']);

  const DATASET_SPECS = Object.freeze([
    Object.freeze({ key: 'stat.slots', ids: Object.freeze(['stat.slotStore']) }),
    Object.freeze({ key: 'stat.current', ids: Object.freeze(['stat.workspaceDraft', 'stat.liveMirror', 'stat.legacyCurrent']) }),
    Object.freeze({ key: 'calc.settings', ids: Object.freeze(['calc.settings']) }),
    Object.freeze({ key: 'calc.resultSaves', ids: Object.freeze(['calc.resultSaves']) }),
    Object.freeze({ key: 'calc.enemyPresets', ids: Object.freeze(['calc.enemyPresets']) }),
    Object.freeze({ key: 'dps.settings', ids: Object.freeze(['dps.settings']) }),
    Object.freeze({ key: 'dps.runtimeOverrides', ids: Object.freeze(['dps.runtimeOverrides']) }),
    Object.freeze({ key: 'preference.theme', ids: Object.freeze([
      'preference.commonTheme',
      'preference.statThemeLegacy',
      'preference.calcThemeLegacy',
      'preference.boardPreviewThemeLegacy'
    ]) }),
    Object.freeze({ key: 'preference.boardShortcutOffMode', ids: Object.freeze(['preference.boardShortcutOffMode']) }),
    Object.freeze({ key: 'preference.boardOrientation', ids: Object.freeze(['preference.boardOrientation']) }),
    Object.freeze({ key: 'preference.boardPreviewScale', ids: Object.freeze(['preference.boardPreviewScale']) }),
    Object.freeze({ key: 'sharePrototype.globalEnhancements', ids: Object.freeze(['sharePrototype.globalEnhancements']) })
  ]);

  const DATASET_BY_KEY = new Map(DATASET_SPECS.map(spec => [spec.key, spec]));
  const INCLUDED_ENTRY_IDS = new Set(DATASET_SPECS.flatMap(spec => spec.ids));
  const RESCUE_ENTRY_SPECS = Object.freeze([
    Object.freeze({ id: 'stat.slotStore', area: 'localStorage' }),
    Object.freeze({ id: 'stat.legacyCurrent', area: 'localStorage' }),
    Object.freeze({ id: 'stat.liveMirror', area: 'localStorage' }),
    Object.freeze({ id: 'stat.workspaceDraft', area: 'sessionStorage' }),
    Object.freeze({ id: 'stat.reloadContext', area: 'sessionStorage' }),
    Object.freeze({ id: 'preference.commonTheme', area: 'localStorage' }),
    Object.freeze({ id: 'preference.statThemeLegacy', area: 'localStorage' }),
    Object.freeze({ id: 'preference.calcThemeLegacy', area: 'localStorage' }),
    Object.freeze({ id: 'preference.boardShortcutOffMode', area: 'localStorage' }),
    Object.freeze({ id: 'preference.boardOrientation', area: 'localStorage' }),
    Object.freeze({ id: 'calc.settings', area: 'localStorage' }),
    Object.freeze({ id: 'calc.resultSaves', area: 'localStorage' }),
    Object.freeze({ id: 'calc.enemyPresets', area: 'localStorage' }),
    Object.freeze({ id: 'dps.settings', area: 'localStorage' }),
    Object.freeze({ id: 'dps.runtimeOverrides', area: 'localStorage' }),
    Object.freeze({ id: 'comparison.session', area: 'sessionStorage' }),
    Object.freeze({ id: 'sharePrototype.globalEnhancements', area: 'localStorage' }),
    Object.freeze({ id: 'preference.boardPreviewThemeLegacy', area: 'localStorage' }),
    Object.freeze({ id: 'preference.boardPreviewScale', area: 'localStorage' })
  ]);
  const RESCUE_ENTRY_BY_ID = new Map(RESCUE_ENTRY_SPECS.map(spec => [spec.id, spec]));
  const RESCUE_STATES = new Set(['present', 'absent', 'read-failed']);
  const RESCUE_FAILURE_CODES = new Set([
    'read-failed',
    'write-failed',
    'remove-failed',
    'quota',
    'unsupported',
    'recovery-required',
    'invalid-data',
    'stale',
    'busy',
    'not-ready'
  ]);

  class BackupValidationError extends Error {
    constructor(code, message, details = {}) {
      super(message);
      this.name = 'BackupValidationError';
      this.code = code;
      this.details = details;
    }
  }

  function failure(code, message, details = {}) {
    const result = { ok: false, code, retryable: false };
    if (details.operation) result.operation = details.operation;
    if (details.id) result.id = details.id;
    if (details.dataset) result.dataset = details.dataset;
    if (message) result.message = message;
    return result;
  }

  function success(value) {
    return { ok: true, value };
  }

  function isPlainObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function utf8Bytes(value) {
    const text = String(value);
    if (typeof TextEncoder === 'function') return new TextEncoder().encode(text);
    if (typeof Buffer !== 'undefined') return Uint8Array.from(Buffer.from(text, 'utf8'));
    const encoded = unescape(encodeURIComponent(text));
    const bytes = new Uint8Array(encoded.length);
    for (let index = 0; index < encoded.length; index += 1) bytes[index] = encoded.charCodeAt(index);
    return bytes;
  }

  function byteLength(value) {
    return utf8Bytes(value).byteLength;
  }

  async function sha256Hex(value) {
    const bytes = utf8Bytes(value);
    const cryptoObject = root?.crypto;
    if (cryptoObject?.subtle?.digest) {
      const digest = await cryptoObject.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    }
    if (typeof require === 'function') {
      try {
        const cryptoModule = require('node:crypto');
        return cryptoModule.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
      } catch {
        // Fall through to an explicit unsupported result below.
      }
    }
    throw new BackupValidationError('unsupported', 'SHA-256を利用できません。');
  }

  function assertJsonSafe(value, depth = 0, state = { nodes: 0 }) {
    state.nodes += 1;
    if (state.nodes > MAX_JSON_NODES) throw new BackupValidationError('oversize', 'JSONの要素数が上限を超えています。');
    if (depth > MAX_JSON_DEPTH) throw new BackupValidationError('oversize', 'JSONの深さが上限を超えています。');
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) throw new BackupValidationError('invalid-data', '有限でない数値があります。');
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(item => assertJsonSafe(item, depth + 1, state));
      return;
    }
    if (!isPlainObject(value)) throw new BackupValidationError('invalid-data', 'JSONオブジェクトの型が不正です。');
    Object.entries(value).forEach(([key, child]) => {
      if (DANGEROUS_KEYS.has(key)) {
        throw new BackupValidationError('invalid-data', '危険なプロパティ名があります。', { dangerous: true });
      }
      assertJsonSafe(child, depth + 1, state);
    });
  }

  function parseJsonValue(raw, id) {
    if (typeof raw !== 'string' || !raw.length) {
      throw new BackupValidationError('invalid-data', '保存値がJSON文字列ではありません。', { id });
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new BackupValidationError('recovery-required', '保存値のJSONを解析できません。', { id });
    }
    assertJsonSafe(parsed);
    return parsed;
  }

  function validateRawEntry(id, raw) {
    if (raw == null) return;
    if (typeof raw !== 'string') {
      throw new BackupValidationError('invalid-data', '保存値の型が不正です。', { id });
    }
    if (byteLength(raw) > MAX_BYTES) {
      throw new BackupValidationError('oversize', '保存値が入力上限を超えています。', { id });
    }
    if (id === 'preference.commonTheme'
      || id === 'preference.statThemeLegacy'
      || id === 'preference.calcThemeLegacy'
      || id === 'preference.boardPreviewThemeLegacy') {
      if (!['light', 'dark'].includes(raw)) {
        throw new BackupValidationError('invalid-data', 'テーマ値が不正です。', { id });
      }
      return;
    }
    if (id === 'preference.boardShortcutOffMode' && !['node', 'route'].includes(raw)) {
      throw new BackupValidationError('invalid-data', 'ボードショートカット設定が不正です。', { id });
    }
    if (id === 'preference.boardShortcutOffMode') return;
    if (id === 'preference.boardOrientation' && !['horizontal', 'vertical'].includes(raw)) {
      throw new BackupValidationError('invalid-data', 'ボード向き設定が不正です。', { id });
    }
    if (id === 'preference.boardOrientation') return;
    if (id === 'preference.boardPreviewScale') {
      const scale = Number(raw);
      if (!Number.isFinite(scale) || scale < 0.6 || scale > 1.6) {
        throw new BackupValidationError('invalid-data', 'ボード倍率が不正です。', { id });
      }
      return;
    }

    const parsed = parseJsonValue(raw, id);
    if (id === 'stat.slotStore') {
      if (!isPlainObject(parsed) || Number(parsed.schemaVersion) !== 2
        || !isPlainObject(parsed.slots) || !Number.isInteger(Number(parsed.storeRevision))
        || Number(parsed.storeRevision) < 0) {
        throw new BackupValidationError('recovery-required', '保存slotの形式が不正です。', { id });
      }
      Object.entries(parsed.slots).forEach(([slot, entry]) => {
        if (!/^[1-6]$/.test(slot) || !isPlainObject(entry) || !isPlainObject(entry.snapshot)
          || !Number.isInteger(Number(entry.slotRevision)) || Number(entry.slotRevision) < 1) {
          throw new BackupValidationError('recovery-required', '保存slotの内容が不正です。', { id });
        }
      });
      return;
    }
    if (id === 'stat.workspaceDraft') {
      if (!isPlainObject(parsed) || Number(parsed.workspaceVersion) !== 2 || !isPlainObject(parsed.draft)) {
        throw new BackupValidationError('recovery-required', '現在タブの下書き形式が不正です。', { id });
      }
      return;
    }
    if (id === 'stat.liveMirror') {
      if (!isPlainObject(parsed) || Number(parsed.schemaVersion) !== 2
        || !Number.isInteger(Number(parsed.revision)) || Number(parsed.revision) < 0
        || !isPlainObject(parsed.snapshot)) {
        throw new BackupValidationError('recovery-required', 'live保存の形式が不正です。', { id });
      }
      return;
    }
    if (id === 'stat.legacyCurrent' && !isPlainObject(parsed)) {
      throw new BackupValidationError('recovery-required', '互換保存の形式が不正です。', { id });
    }
    if (AUXILIARY_DATASET_KEYS.has(id)) {
      validateAuxiliaryValue(parsed, id);
      return;
    }
    if ((id === 'calc.enemyPresets' || id === 'sharePrototype.globalEnhancements')
      && !(isPlainObject(parsed) || Array.isArray(parsed))) {
      throw new BackupValidationError('invalid-data', '保存設定のJSON型が不正です。', { id });
    }
    if (id === 'calc.resultSaves') validateCalculationResultSaves(parsed, id);
  }

  function validateCalculationResultSaves(value, id = 'calc.resultSaves') {
    if (!Array.isArray(value) || value.length > 50) {
      throw new BackupValidationError('invalid-data', '計算保存の件数またはJSON型が不正です。', { id });
    }
    value.forEach(item => {
      if (!isPlainObject(item) || typeof item.id !== 'string' || !item.id.trim()
        || !isPlainObject(item.snapshot) || Number(item.snapshot.version) !== 4
        || (Object.prototype.hasOwnProperty.call(item, 'name') && typeof item.name !== 'string')
        || (Object.prototype.hasOwnProperty.call(item, 'savedAt')
          && !isValidSavedAt(item.savedAt))) {
        throw new BackupValidationError('invalid-data', '計算保存の項目が不正です。', { id });
      }
    });
  }

  function isValidSavedAt(value) {
    // production loadDamageCalculationSaves() stores Number(item.savedAt) || 0.
    // Do not accept a value that the reader would silently turn into 0.
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  }

  function normalizeEntryMap(entries) {
    if (entries instanceof Map) return Object.fromEntries(entries.entries());
    if (isPlainObject(entries)) return entries;
    throw new BackupValidationError('invalid-data', 'バックアップ対象の保存値一覧が不正です。');
  }

  function readEntryValue(entryMap, id) {
    if (!Object.prototype.hasOwnProperty.call(entryMap, id)) return null;
    const candidate = entryMap[id];
    if (candidate && typeof candidate === 'object' && candidate.ok === false) {
      throw new BackupValidationError(candidate.code || 'read-failed', '保存値を読み取れません。', { id });
    }
    if (candidate && typeof candidate === 'object' && candidate.ok === true && 'value' in candidate) {
      return candidate.value == null ? null : String(candidate.value);
    }
    return candidate == null ? null : String(candidate);
  }

  function cloneJsonValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeBackupSlot(value, id) {
    const slot = Number(value);
    if (!Number.isInteger(slot) || slot < 1 || slot > 6) {
      throw new BackupValidationError('recovery-required', '現在slotの値が不正です。', { id });
    }
    return slot;
  }

  function normalizeBackupSnapshot(value, id) {
    if (!isPlainObject(value)) {
      throw new BackupValidationError('recovery-required', 'snapshotの形式が不正です。', { id });
    }
    const snapshot = cloneJsonValue(value);
    // 保存slotと現在状態の運用フィールドは復元先で再構成する。
    delete snapshot.savedStates;
    delete snapshot.syncRevision;
    delete snapshot.activeStateSlot;
    return snapshot;
  }

  function parseBackupRaw(id, raw) {
    if (raw == null) return null;
    validateRawEntry(id, raw);
    return parseJsonValue(raw, id);
  }

  function validateAuxiliaryValue(value, id) {
    if (id === 'calc.settings' && !isPlainObject(value)) {
      throw new BackupValidationError('invalid-data', '計算設定のJSON型が不正です。', { id });
    }
    if (id === 'dps.settings') {
      if (!isPlainObject(value)) {
        throw new BackupValidationError('invalid-data', 'DPS設定のJSON型が不正です。', { id });
      }
      if (Object.prototype.hasOwnProperty.call(value, 'settingsVersion')
        && Number(value.settingsVersion) !== 2) {
        throw new BackupValidationError('unsupported', 'DPS設定の版に対応していません。', { id });
      }
      Object.entries(value).forEach(([targetId, setting]) => {
        if (targetId === 'settingsVersion') return;
        if (!isPlainObject(setting)) {
          throw new BackupValidationError('invalid-data', 'DPS対象設定の型が不正です。', { id });
        }
        if (Object.prototype.hasOwnProperty.call(setting, 'settingsVersion')
          && setting.settingsVersion != null
          && Number(setting.settingsVersion) !== 2) {
          throw new BackupValidationError('unsupported', 'DPS対象設定の版に対応していません。', { id });
        }
      });
    }
    if (id === 'dps.runtimeOverrides' && !isPlainObject(value)) {
      throw new BackupValidationError('invalid-data', 'DPS実行時設定のJSON型が不正です。', { id });
    }
  }

  function createExcludedAuxiliaryValue(error, datasetKey) {
    if (!(error instanceof BackupValidationError)
      || !AUXILIARY_DATASET_KEYS.has(datasetKey)
      || !AUXILIARY_EXCLUSION_CODES.has(error.code)
      || error.code === 'oversize'
      || error.details?.dangerous) {
      throw error;
    }
    return { state: 'excluded', reason: error.code };
  }

  function rejectLegacySavedStatesFallback(entryMap) {
    const raw = readEntryValue(entryMap, 'stat.legacyCurrent');
    if (raw == null) return;
    const legacy = parseBackupRaw('stat.legacyCurrent', raw);
    if (!Object.prototype.hasOwnProperty.call(legacy, 'savedStates')) return;
    const savedStates = legacy.savedStates;
    if (savedStates == null) return;
    if (!isPlainObject(savedStates)) {
      throw new BackupValidationError(
        'recovery-required',
        '旧形式の保存枠を通常バックアップへ変換できません。救出バックアップを利用してください。',
        { id: 'stat.legacyCurrent' }
      );
    }
    if (Object.keys(savedStates).length > 0) {
      throw new BackupValidationError(
        'recovery-required',
        '旧形式の保存枠を通常バックアップへ変換できません。救出バックアップを利用してください。',
        { id: 'stat.legacyCurrent' }
      );
    }
  }

  function createCanonicalSlotValue(raw) {
    const parsed = parseBackupRaw('stat.slotStore', raw);
    const slots = {};
    Object.entries(parsed.slots).forEach(([slot, entry]) => {
      if (!isPlainObject(entry) || !isPlainObject(entry.snapshot)) {
        throw new BackupValidationError('recovery-required', '保存slotの内容が不正です。', { id: 'stat.slotStore' });
      }
      slots[slot] = {
        savedAt: String(entry.savedAt || entry.snapshot.savedAt || ''),
        snapshot: normalizeBackupSnapshot(entry.snapshot, 'stat.slotStore')
      };
    });
    return { slots };
  }

  function createCanonicalCurrentValue(entryMap, sourceMode) {
    const candidates = sourceMode === 'stored-only'
      ? ['stat.liveMirror', 'stat.legacyCurrent']
      : ['stat.workspaceDraft', 'stat.liveMirror', 'stat.legacyCurrent'];
    const parsedEntries = new Map();
    for (const id of candidates) {
      const raw = readEntryValue(entryMap, id);
      if (raw != null) parsedEntries.set(id, parseBackupRaw(id, raw));
    }
    for (const id of candidates) {
      const parsed = parsedEntries.get(id);
      if (!parsed) continue;
      if (id === 'stat.workspaceDraft') {
        return {
          activeSlot: normalizeBackupSlot(parsed.activeSlot ?? parsed.draft.activeStateSlot, id),
          snapshot: normalizeBackupSnapshot(parsed.draft, id)
        };
      }
      if (id === 'stat.liveMirror') {
        return {
          activeSlot: normalizeBackupSlot(parsed.sourceSlot ?? parsed.snapshot.activeStateSlot, id),
          snapshot: normalizeBackupSnapshot(parsed.snapshot, id)
        };
      }
      return {
        activeSlot: normalizeBackupSlot(parsed.activeStateSlot ?? 1, id),
        snapshot: normalizeBackupSnapshot(parsed, id)
      };
    }
    return null;
  }

  function createCanonicalThemeValue(entryMap) {
    const ids = [
      'preference.commonTheme',
      'preference.statThemeLegacy',
      'preference.calcThemeLegacy',
      'preference.boardPreviewThemeLegacy'
    ];
    ids.forEach(id => {
      const raw = readEntryValue(entryMap, id);
      if (raw != null) validateRawEntry(id, raw);
    });
    const selected = ids
      .map(id => readEntryValue(entryMap, id))
      .find(raw => raw != null);
    return selected == null ? null : selected;
  }

  function createCanonicalScalarValue(id, raw) {
    if (raw == null) return null;
    validateRawEntry(id, raw);
    return id === 'preference.boardPreviewScale' ? Number(raw) : raw;
  }

  function createDatasetValue(spec, entryMap, sourceMode) {
    if (spec.key === 'stat.slots') {
      const raw = readEntryValue(entryMap, 'stat.slotStore');
      if (raw == null) {
        rejectLegacySavedStatesFallback(entryMap);
        return { state: 'absent' };
      }
      return { state: 'present', value: createCanonicalSlotValue(raw) };
    }
    if (spec.key === 'stat.current') {
      const value = createCanonicalCurrentValue(entryMap, sourceMode);
      return value == null ? { state: 'absent' } : { state: 'present', value };
    }
    if (spec.key === 'preference.theme') {
      const value = createCanonicalThemeValue(entryMap);
      return value == null ? { state: 'absent' } : { state: 'present', value };
    }
    const id = spec.ids[0];
    const raw = readEntryValue(entryMap, id);
    if (raw == null) return { state: 'absent' };
    if (id === 'preference.boardShortcutOffMode'
      || id === 'preference.boardOrientation'
      || id === 'preference.boardPreviewScale') {
      return { state: 'present', value: createCanonicalScalarValue(id, raw) };
    }
    if (AUXILIARY_DATASET_KEYS.has(spec.key)) {
      try {
        return { state: 'present', value: parseBackupRaw(id, raw) };
      } catch (error) {
        return createExcludedAuxiliaryValue(error, spec.key);
      }
    }
    return { state: 'present', value: parseBackupRaw(id, raw) };
  }

  function getDefaultSourceRelease() {
    const script = root?.document?.querySelector?.('script[src*="storage-backup.js"]');
    if (script) {
      try {
        const url = new URL(script.src, root.location?.href || undefined);
        const release = url.searchParams.get('v');
        if (release) return release;
      } catch {
        // Use the explicit fallback below.
      }
    }
    return 'unknown';
  }

  function buildPayload(entries, options = {}) {
    const sourceMode = options.sourceMode || 'current-tab';
    if (!SOURCE_MODES.has(sourceMode)) throw new BackupValidationError('invalid-data', '採取範囲が不正です。');
    const sourceRelease = String(options.sourceRelease || getDefaultSourceRelease()).trim();
    if (!sourceRelease || sourceRelease.length > 128) {
      throw new BackupValidationError('invalid-data', '資材版文字列が不正です。');
    }
    const createdAt = options.createdAt || new Date().toISOString();
    if (typeof createdAt !== 'string' || Number.isNaN(Date.parse(createdAt))) {
      throw new BackupValidationError('invalid-data', '作成日時が不正です。');
    }
    const entryMap = normalizeEntryMap(entries);
    Object.keys(entryMap).forEach(id => {
      if (!INCLUDED_ENTRY_IDS.has(id)) {
        throw new BackupValidationError('invalid-data', '対象外の保存IDがあります。', { id });
      }
    });
    const datasets = Object.fromEntries(DATASET_SPECS.map(spec => [
      spec.key,
      createDatasetValue(spec, entryMap, sourceMode)
    ]));
    const payload = { schemaSet: SCHEMA_SET, sourceRelease, createdAt, sourceMode, datasets };
    assertJsonSafe(payload);
    return payload;
  }

  function validateDatasetValue(datasetKey, dataset) {
    const spec = DATASET_BY_KEY.get(datasetKey);
    if (!spec || !isPlainObject(dataset)) throw new BackupValidationError('invalid-data', 'datasetが不正です。', { dataset: datasetKey });
    if (dataset.state === 'absent') {
      if (Object.keys(dataset).length !== 1) throw new BackupValidationError('invalid-data', '不在datasetに余計な値があります。', { dataset: datasetKey });
      return;
    }
    if (dataset.state === 'excluded') {
      if (!AUXILIARY_DATASET_KEYS.has(datasetKey)
        || Object.keys(dataset).length !== 2
        || !AUXILIARY_EXCLUSION_CODES.has(dataset.reason)) {
        throw new BackupValidationError('invalid-data', '除外datasetの形式または対象が不正です。', { dataset: datasetKey });
      }
      return;
    }
    if (dataset.state !== 'present' || Object.keys(dataset).length !== 2
      || !Object.prototype.hasOwnProperty.call(dataset, 'value')) {
      throw new BackupValidationError('invalid-data', 'datasetの存在形式が不正です。', { dataset: datasetKey });
    }
    const value = dataset.value;
    if (datasetKey === 'stat.slots') {
      if (!isPlainObject(value) || Object.keys(value).length !== 1
        || !isPlainObject(value.slots)) {
        throw new BackupValidationError('invalid-data', '正規化slotの形式が不正です。', { dataset: datasetKey });
      }
      Object.entries(value.slots).forEach(([slot, entry]) => {
        if (!/^[1-6]$/.test(slot) || !isPlainObject(entry)
          || Object.keys(entry).some(key => !['savedAt', 'snapshot'].includes(key))
          || !Object.prototype.hasOwnProperty.call(entry, 'savedAt')
          || typeof entry.savedAt !== 'string'
          || !Object.prototype.hasOwnProperty.call(entry, 'snapshot')
          || !isPlainObject(entry.snapshot)) {
          throw new BackupValidationError('invalid-data', '正規化slotの内容が不正です。', { dataset: datasetKey, id: slot });
        }
        validateCanonicalSnapshot(entry.snapshot, datasetKey);
      });
      return;
    }
    if (datasetKey === 'stat.current') {
      if (!isPlainObject(value) || Object.keys(value).length !== 2
        || !Object.prototype.hasOwnProperty.call(value, 'activeSlot')
        || !Object.prototype.hasOwnProperty.call(value, 'snapshot')) {
        throw new BackupValidationError('invalid-data', '正規化currentの形式が不正です。', { dataset: datasetKey });
      }
      normalizeBackupSlot(value.activeSlot, datasetKey);
      validateCanonicalSnapshot(value.snapshot, datasetKey);
      return;
    }
    if (datasetKey === 'preference.theme') {
      if (!['light', 'dark'].includes(value)) {
        throw new BackupValidationError('invalid-data', '正規化テーマ値が不正です。', { dataset: datasetKey });
      }
      return;
    }
    if (datasetKey === 'preference.boardShortcutOffMode'
      && !['node', 'route'].includes(value)) {
      throw new BackupValidationError('invalid-data', '正規化ボードショートカット設定が不正です。', { dataset: datasetKey });
    }
    if (datasetKey === 'preference.boardOrientation'
      && !['horizontal', 'vertical'].includes(value)) {
      throw new BackupValidationError('invalid-data', '正規化ボード向き設定が不正です。', { dataset: datasetKey });
    }
    if (datasetKey === 'preference.boardPreviewScale'
      && (!Number.isFinite(value) || value < 0.6 || value > 1.6)) {
      throw new BackupValidationError('invalid-data', '正規化ボード倍率が不正です。', { dataset: datasetKey });
    }
    if (datasetKey === 'calc.resultSaves') validateCalculationResultSaves(value, datasetKey);
    if (datasetKey === 'calc.settings' || datasetKey === 'calc.enemyPresets'
      || datasetKey === 'dps.settings' || datasetKey === 'dps.runtimeOverrides'
      || datasetKey === 'sharePrototype.globalEnhancements') {
      if (!isPlainObject(value) && !Array.isArray(value)) {
        throw new BackupValidationError('invalid-data', '正規化設定のJSON型が不正です。', { dataset: datasetKey });
      }
    }
    if (AUXILIARY_DATASET_KEYS.has(datasetKey)) {
      validateAuxiliaryValue(value, DATASET_BY_KEY.get(datasetKey).ids[0]);
    }
    assertJsonSafe(value);
  }

  function validateCanonicalSnapshot(snapshot, datasetKey) {
    if (!isPlainObject(snapshot)
      || Object.prototype.hasOwnProperty.call(snapshot, 'savedStates')
      || Object.prototype.hasOwnProperty.call(snapshot, 'syncRevision')
      || Object.prototype.hasOwnProperty.call(snapshot, 'activeStateSlot')) {
      throw new BackupValidationError('invalid-data', 'snapshotの正規化形式が不正です。', { dataset: datasetKey });
    }
    assertJsonSafe(snapshot);
  }

  function validatePayload(payload) {
    validatePayloadEnvelope(payload);
    const datasetKeys = Object.keys(payload.datasets);
    datasetKeys.forEach(key => validateDatasetValue(key, payload.datasets[key]));
    assertJsonSafe(payload);
    return payload;
  }

  function validatePayloadEnvelope(payload) {
    if (!isPlainObject(payload)) throw new BackupValidationError('invalid-data', 'payloadがオブジェクトではありません。');
    if (!Object.keys(payload).every(key => PAYLOAD_KEYS.has(key))
      || PAYLOAD_KEYS.size !== Object.keys(payload).length
      || payload.schemaSet !== SCHEMA_SET
      || typeof payload.sourceRelease !== 'string'
      || !payload.sourceRelease.trim()
      || payload.sourceRelease.length > 128
      || typeof payload.createdAt !== 'string'
      || Number.isNaN(Date.parse(payload.createdAt))
      || !SOURCE_MODES.has(payload.sourceMode)
      || !isPlainObject(payload.datasets)) {
      throw new BackupValidationError('invalid-data', 'payloadの基本形式が不正です。');
    }
    const datasetKeys = Object.keys(payload.datasets);
    if (datasetKeys.length !== DATASET_SPECS.length
      || !DATASET_SPECS.every(spec => Object.prototype.hasOwnProperty.call(payload.datasets, spec.key))) {
      throw new BackupValidationError('invalid-data', 'datasetの数または種類が不正です。');
    }
    datasetKeys.forEach(key => validateDatasetEnvelope(key, payload.datasets[key]));
  }

  function validateDatasetEnvelope(datasetKey, dataset) {
    const spec = DATASET_BY_KEY.get(datasetKey);
    if (!spec || !isPlainObject(dataset)) {
      throw new BackupValidationError('invalid-data', 'datasetが不正です。', { dataset: datasetKey });
    }
    if (dataset.state === 'absent') {
      if (Object.keys(dataset).length !== 1) {
        throw new BackupValidationError('invalid-data', '不在datasetに余計な値があります。', { dataset: datasetKey });
      }
      return;
    }
    if (dataset.state === 'excluded') {
      if (!AUXILIARY_DATASET_KEYS.has(datasetKey)
        || Object.keys(dataset).length !== 2
        || !AUXILIARY_EXCLUSION_CODES.has(dataset.reason)) {
        throw new BackupValidationError('invalid-data', '除外datasetの形式または対象が不正です。', { dataset: datasetKey });
      }
      return;
    }
    if (dataset.state !== 'present' || Object.keys(dataset).length !== 2
      || !Object.prototype.hasOwnProperty.call(dataset, 'value')) {
      throw new BackupValidationError('invalid-data', 'datasetの存在形式が不正です。', { dataset: datasetKey });
    }
  }

  async function encodePayload(payload) {
    validatePayload(payload);
    const payloadJson = JSON.stringify(payload);
    if (byteLength(payloadJson) > MAX_BYTES) throw new BackupValidationError('oversize', 'payloadが入力上限を超えています。');
    const sha256 = await sha256Hex(payloadJson);
    const outer = { format: FORMAT, version: VERSION, payloadJson, sha256 };
    const outerJson = JSON.stringify(outer);
    if (byteLength(outerJson) > MAX_BYTES) throw new BackupValidationError('oversize', 'バックアップファイルが入力上限を超えています。');
    return outer;
  }

  async function createBackupPackageFromEntries(entries, options = {}) {
    try {
      const payload = buildPayload(entries, options);
      return success(await encodePayload(payload));
    } catch (error) {
      if (error instanceof BackupValidationError) return failure(error.code, error.message, error.details);
      return failure('unsupported', 'バックアップを作成できません。');
    }
  }

  function normalizeRescueEntries(entries) {
    if (Array.isArray(entries)) return entries;
    if (!isPlainObject(entries)) {
      throw new BackupValidationError('invalid-data', '救出対象の保存値一覧が不正です。');
    }
    return Object.entries(entries).map(([id, value]) => ({ id, ...value }));
  }

  function validateRescuePayload(payload) {
    if (!isPlainObject(payload)
      || !Object.keys(payload).every(key => RESCUE_PAYLOAD_KEYS.has(key))
      || Object.keys(payload).length !== RESCUE_PAYLOAD_KEYS.size
      || payload.schemaSet !== SCHEMA_SET
      || typeof payload.sourceRelease !== 'string'
      || !payload.sourceRelease.trim()
      || payload.sourceRelease.length > 128
      || typeof payload.createdAt !== 'string'
      || Number.isNaN(Date.parse(payload.createdAt))
      || !Array.isArray(payload.entries)
      || payload.entries.length !== RESCUE_ENTRY_SPECS.length) {
      throw new BackupValidationError('invalid-data', '救出payloadの基本形式が不正です。');
    }
    const seen = new Set();
    payload.entries.forEach(item => {
      if (!isPlainObject(item)
        || typeof item.id !== 'string'
        || seen.has(item.id)
        || !RESCUE_ENTRY_BY_ID.has(item.id)) {
        throw new BackupValidationError('invalid-data', '救出対象IDが不正です。');
      }
      const spec = RESCUE_ENTRY_BY_ID.get(item.id);
      if (item.area !== spec.area || !RESCUE_STATES.has(item.state)) {
        throw new BackupValidationError('invalid-data', '救出対象の領域または状態が不正です。', { id: item.id });
      }
      if (item.state === 'present') {
        if (Object.keys(item).length !== 4 || typeof item.raw !== 'string' || byteLength(item.raw) > MAX_BYTES) {
          throw new BackupValidationError('invalid-data', '救出raw値が不正です。', { id: item.id });
        }
      } else if (item.state === 'absent') {
        if (Object.keys(item).length !== 3) {
          throw new BackupValidationError('invalid-data', '救出不在値が不正です。', { id: item.id });
        }
      } else if (Object.keys(item).length !== 4
        || typeof item.code !== 'string'
        || !RESCUE_FAILURE_CODES.has(item.code)) {
        throw new BackupValidationError('invalid-data', '救出失敗値が不正です。', { id: item.id });
      }
      seen.add(item.id);
    });
    assertJsonSafe(payload);
    return payload;
  }

  async function createRescuePackageFromEntries(entries, options = {}) {
    try {
      const supplied = new Map();
      for (const candidate of normalizeRescueEntries(entries)) {
        if (!isPlainObject(candidate) || typeof candidate.id !== 'string' || supplied.has(candidate.id)) {
          throw new BackupValidationError('invalid-data', '救出対象IDが不正です。');
        }
        const spec = RESCUE_ENTRY_BY_ID.get(candidate.id);
        if (!spec || candidate.area !== spec.area) {
          throw new BackupValidationError('invalid-data', '救出対象の領域が不正です。', { id: candidate.id });
        }
        const state = candidate.state || (candidate.raw == null ? 'absent' : 'present');
        const item = { id: candidate.id, area: spec.area, state };
        if (state === 'present') {
          if (typeof candidate.raw !== 'string') {
            throw new BackupValidationError('invalid-data', '救出raw値が不正です。', { id: candidate.id });
          }
          item.raw = candidate.raw;
        } else if (state === 'read-failed') {
          if (!RESCUE_FAILURE_CODES.has(candidate.code)) {
            throw new BackupValidationError('invalid-data', '救出失敗コードが不正です。', { id: candidate.id });
          }
          item.code = candidate.code;
        } else if (state !== 'absent') {
          throw new BackupValidationError('invalid-data', '救出状態が不正です。', { id: candidate.id });
        }
        supplied.set(candidate.id, item);
      }
      const sourceRelease = String(options.sourceRelease || getDefaultSourceRelease()).trim();
      const createdAt = options.createdAt || new Date().toISOString();
      const payload = {
        schemaSet: SCHEMA_SET,
        sourceRelease,
        createdAt,
        entries: RESCUE_ENTRY_SPECS.map(spec => supplied.get(spec.id) || {
          id: spec.id,
          area: spec.area,
          state: 'absent'
        })
      };
      validateRescuePayload(payload);
      const payloadJson = JSON.stringify(payload);
      if (byteLength(payloadJson) > MAX_BYTES) {
        throw new BackupValidationError('oversize', '救出payloadが入力上限を超えています。');
      }
      const sha256 = await sha256Hex(payloadJson);
      const outer = { format: RESCUE_FORMAT, version: VERSION, payloadJson, sha256 };
      if (byteLength(JSON.stringify(outer)) > MAX_BYTES) {
        throw new BackupValidationError('oversize', '救出ファイルが入力上限を超えています。');
      }
      return success(outer);
    } catch (error) {
      if (error instanceof BackupValidationError) return failure(error.code, error.message, error.details);
      return failure('unsupported', '救出ファイルを作成できません。');
    }
  }

  async function decodeRescuePackage(input) {
    try {
      const inputJson = typeof input === 'string' ? input : JSON.stringify(input);
      if (typeof inputJson !== 'string' || byteLength(inputJson) > MAX_BYTES) {
        throw new BackupValidationError('oversize', '救出ファイルが入力上限を超えています。');
      }
      const outer = typeof input === 'string' ? JSON.parse(input) : input;
      if (!isPlainObject(outer)
        || Object.keys(outer).length !== OUTER_KEYS.size
        || !Object.keys(outer).every(key => OUTER_KEYS.has(key))
        || outer.format !== RESCUE_FORMAT
        || outer.version !== VERSION
        || typeof outer.payloadJson !== 'string'
        || typeof outer.sha256 !== 'string'
        || !/^[0-9a-f]{64}$/.test(outer.sha256)) {
        throw new BackupValidationError('invalid-data', '救出外側形式が不正です。');
      }
      if (byteLength(outer.payloadJson) > MAX_BYTES) {
        throw new BackupValidationError('oversize', '救出payloadが入力上限を超えています。');
      }
      if (await sha256Hex(outer.payloadJson) !== outer.sha256) {
        throw new BackupValidationError('invalid-data', '救出ファイルのdigestが一致しません。');
      }
      const payload = JSON.parse(outer.payloadJson);
      validateRescuePayload(payload);
      return success({ package: outer, payload });
    } catch (error) {
      if (error instanceof BackupValidationError) return failure(error.code, error.message, error.details);
      if (error instanceof SyntaxError) return failure('invalid-data', '救出JSONを解析できません。');
      return failure('unsupported', '救出ファイルを確認できません。');
    }
  }

  function isRescuePackage(input) {
    try {
      const value = typeof input === 'string' ? JSON.parse(input) : input;
      return isPlainObject(value) && value.format === RESCUE_FORMAT;
    } catch {
      return false;
    }
  }

  function normalizeDecodedAuxiliaryDatasets(payload) {
    if (!isPlainObject(payload) || !isPlainObject(payload.datasets)) return payload;
    AUXILIARY_DATASET_KEYS.forEach(datasetKey => {
      const dataset = payload.datasets[datasetKey];
      if (!isPlainObject(dataset)
        || dataset.state !== 'present'
        || !Object.prototype.hasOwnProperty.call(dataset, 'value')) return;
      const sourceId = DATASET_BY_KEY.get(datasetKey)?.ids?.[0] || datasetKey;
      try {
        validateAuxiliaryValue(dataset.value, sourceId);
        assertJsonSafe(dataset.value);
      } catch (error) {
        payload.datasets[datasetKey] = createExcludedAuxiliaryValue(error, datasetKey);
      }
    });
    return payload;
  }

  async function decodeBackupPackage(input) {
    try {
      const inputJson = typeof input === 'string' ? input : JSON.stringify(input);
      if (typeof inputJson !== 'string' || byteLength(inputJson) > MAX_BYTES) {
        throw new BackupValidationError('oversize', 'バックアップファイルが入力上限を超えています。');
      }
      const outer = typeof input === 'string' ? JSON.parse(input) : input;
      if (!isPlainObject(outer)
        || Object.keys(outer).length !== OUTER_KEYS.size
        || !Object.keys(outer).every(key => OUTER_KEYS.has(key))
        || outer.format !== FORMAT
        || outer.version !== VERSION
        || typeof outer.payloadJson !== 'string'
        || typeof outer.sha256 !== 'string'
        || !/^[0-9a-f]{64}$/.test(outer.sha256)) {
        throw new BackupValidationError('invalid-data', 'バックアップ外側形式が不正です。');
      }
      if (byteLength(JSON.stringify(outer)) > MAX_BYTES || byteLength(outer.payloadJson) > MAX_BYTES) {
        throw new BackupValidationError('oversize', 'バックアップファイルが入力上限を超えています。');
      }
      const actualDigest = await sha256Hex(outer.payloadJson);
      if (actualDigest !== outer.sha256) throw new BackupValidationError('invalid-data', 'バックアップのdigestが一致しません。');
      const payload = JSON.parse(outer.payloadJson);
      // Global JSON safety and dataset envelopes must be checked before an
      // auxiliary semantic failure can be converted into an exclusion.
      assertJsonSafe(payload);
      validatePayloadEnvelope(payload);
      normalizeDecodedAuxiliaryDatasets(payload);
      validatePayload(payload);
      return success({ package: outer, payload, summary: summarizePayload(payload) });
    } catch (error) {
      if (error instanceof BackupValidationError) return failure(error.code, error.message, error.details);
      if (error instanceof SyntaxError) return failure('invalid-data', 'JSONを解析できません。');
      return failure('unsupported', 'バックアップを確認できません。');
    }
  }

  function summarizePayload(payload) {
    const datasets = DATASET_SPECS.map(spec => ({
      key: spec.key,
      state: payload.datasets[spec.key].state,
      entries: payload.datasets[spec.key].state === 'present'
        ? summarizeDatasetEntries(spec, payload.datasets[spec.key].value)
        : []
    }));
    return {
      totalDatasets: datasets.length,
      presentDatasets: datasets.filter(dataset => dataset.state === 'present').length,
      absentDatasets: datasets.filter(dataset => dataset.state === 'absent').length,
      excludedDatasets: datasets.filter(dataset => dataset.state === 'excluded').length,
      datasets
    };
  }

  function summarizeDatasetEntries(spec, value) {
    if (spec.key === 'stat.slots') {
      return Object.keys(value.slots).map(slot => `${spec.ids[0]}:${slot}`);
    }
    if (spec.key === 'stat.current') return ['stat.current'];
    if (spec.key === 'preference.theme') return spec.ids.slice();
    return [spec.ids[0]];
  }

  const DISPLAY_DATASET_KEYS = new Set([
    'preference.theme',
    'preference.boardShortcutOffMode',
    'preference.boardOrientation',
    'preference.boardPreviewScale',
    'sharePrototype.globalEnhancements'
  ]);

  function buildRestoreEntries(payload, options = {}) {
    validatePayload(payload);
    const includeDisplaySettings = options.includeDisplaySettings !== false;
    const allowAuxiliaryExclusion = options.allowAuxiliaryExclusion === true;
    const transactionId = String(options.transactionId || 'restore-import').trim() || 'restore-import';
    const restoredAt = String(options.restoredAt || new Date().toISOString());
    const entries = [];
    for (const spec of DATASET_SPECS) {
      if (!includeDisplaySettings && DISPLAY_DATASET_KEYS.has(spec.key)) continue;
      const dataset = payload.datasets[spec.key];
      if (dataset.state === 'excluded') {
        if (!allowAuxiliaryExclusion) {
          throw new BackupValidationError('invalid-data', '補助設定の除外には明示確認が必要です。', { dataset: spec.key });
        }
        continue;
      }
      if (spec.key === 'stat.slots') {
        entries.push(Object.freeze({
          dataset: spec.key,
          id: 'stat.slotStore',
          raw: dataset.state === 'present'
            ? JSON.stringify({
              schemaVersion: 2,
              storeRevision: Object.keys(dataset.value.slots).length ? 1 : 0,
              slots: Object.fromEntries(Object.entries(dataset.value.slots).map(([slot, value]) => [slot, {
                slotRevision: 1,
                savedAt: value.savedAt,
                savedBy: transactionId,
                snapshot: cloneJsonValue(value.snapshot)
              }]))
            })
            : null
        }));
        continue;
      }
      if (spec.key === 'stat.current') {
        const current = dataset.state === 'present' ? dataset.value : null;
        const activeSlot = current?.activeSlot || 1;
        const currentSnapshot = current ? cloneJsonValue(current.snapshot) : null;
        const runtimeSnapshot = currentSnapshot
          ? { ...currentSnapshot, activeStateSlot: activeSlot }
          : null;
        const slotDataset = payload.datasets['stat.slots'];
        const baseSlotRevision = slotDataset?.state === 'present'
          && slotDataset.value.slots[String(activeSlot)] ? 1 : 0;
        const currentEntries = {
          'stat.workspaceDraft': current
            ? JSON.stringify({
              workspaceVersion: 2,
              workspaceId: `workspace-${transactionId}`,
              activeSlot,
              baseSlotRevision,
              draft: runtimeSnapshot
            })
            : null,
          'stat.liveMirror': current
            ? JSON.stringify({
              schemaVersion: 2,
              revision: 1,
              sourceTabInstanceId: `restore-tab-${transactionId}`,
              sourceSlot: String(activeSlot),
              publishedAt: restoredAt,
              snapshot: runtimeSnapshot
            })
            : null,
          'stat.legacyCurrent': current
            ? JSON.stringify({
              ...runtimeSnapshot,
              syncRevision: 1,
              activeStateSlot: activeSlot
            })
            : null
        };
        spec.ids.forEach(id => entries.push(Object.freeze({
          dataset: spec.key,
          id,
          raw: currentEntries[id]
        })));
        continue;
      }
      if (spec.key === 'preference.theme') {
        const raw = dataset.state === 'present' ? dataset.value : null;
        spec.ids.forEach(id => entries.push(Object.freeze({
          dataset: spec.key,
          id,
          raw
        })));
        continue;
      }
      const id = spec.ids[0];
      entries.push(Object.freeze({
        dataset: spec.key,
        id,
        raw: dataset.state === 'present'
          ? (id === 'preference.boardShortcutOffMode'
            || id === 'preference.boardOrientation'
            || id === 'preference.boardPreviewScale'
            ? String(dataset.value)
            : JSON.stringify(dataset.value))
          : null
      }));
    }
    return Object.freeze(entries);
  }

  function isIncludedEntryId(id) {
    return INCLUDED_ENTRY_IDS.has(String(id));
  }

  return Object.freeze({
    version: VERSION,
    format: FORMAT,
    schemaSet: SCHEMA_SET,
    limits: Object.freeze({ maxBytes: MAX_BYTES, maxJsonDepth: MAX_JSON_DEPTH, maxJsonNodes: MAX_JSON_NODES }),
    datasetSpecs: DATASET_SPECS,
    isIncludedEntryId,
    getDefaultSourceRelease,
    sha256Hex,
    buildPayload,
    validatePayload,
    summarizePayload,
    encodePayload,
    createBackupPackageFromEntries,
    decodeBackupPackage,
    buildRestoreEntries,
    rescueFormat: RESCUE_FORMAT,
    rescueEntrySpecs: RESCUE_ENTRY_SPECS,
    createRescuePackageFromEntries,
    decodeRescuePackage,
    isRescuePackage
  });
});
