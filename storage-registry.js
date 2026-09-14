// Trickcal Manager の保存項目台帳と制御項目を固定する共通registry。
// 通常画面からも同じregistryを参照する。Nodeの基準検査でも利用できる
// ように副作用を持たないUMD形式にしておく。
(function initStorageRegistry(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_STORAGE_REGISTRY = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createStorageRegistryApi() {
  'use strict';

  const RAW_CODEC = Object.freeze({
    name: 'raw-string',
    encode(value) {
      if (typeof value !== 'string') throw new TypeError('raw storage value must be a string');
      return value;
    },
    decode(value) {
      return value == null ? null : String(value);
    }
  });

  const WHOLE_STORAGE_LOCK_NAME = 'trickcal-storage-access-v1';
  const CONTROL_CHANNEL_NAME = 'trickcal-storage-control-v1';

  const STORAGE_ENTRIES = [
    ['stat.slotStore', 'localStorage', 'trickcal_stat_slots_v2', 'slot', 'canonical-user-state', 'stat-prototype.js'],
    ['stat.legacyCurrent', 'localStorage', 'trickcal_stat_prototype_v1', 'current-state', 'compatibility-mirror', 'stat-prototype.js'],
    ['stat.liveMirror', 'localStorage', 'trickcal_stat_live_v2', 'current-state', 'derived-live-mirror', 'stat-prototype.js'],
    ['stat.workspaceDraft', 'sessionStorage', 'trickcal_stat_workspace_v2', 'current-draft', 'tab-scoped-draft', 'stat-prototype.js'],
    ['stat.reloadContext', 'sessionStorage', 'trickcal_dashboard_reload_context_v1', 'display', 'one-shot-navigation-context', 'stat-prototype.js'],
    ['preference.commonTheme', 'localStorage', 'trickcal_theme', 'display', 'shared-preference', 'stat-prototype.js'],
    ['preference.statThemeLegacy', 'localStorage', 'trickcal_stat_theme', 'display', 'legacy-preference', 'stat-prototype.js'],
    ['preference.calcThemeLegacy', 'localStorage', 'trickcal_damage_calc_theme', 'display', 'legacy-preference', 'formation-damage-calc.js'],
    ['preference.boardShortcutOffMode', 'localStorage', 'trickcal_board_shortcut_off_mode', 'display', 'user-preference', 'stat-prototype.js'],
    ['preference.boardOrientation', 'localStorage', 'trickcal_board_orientation', 'display', 'user-preference', 'stat-prototype.js'],
    ['calc.settings', 'localStorage', 'trickcal_formation_damage_settings_v1', 'calculation', 'user-working-settings', 'formation-damage-calc.js'],
    ['calc.resultSaves', 'localStorage', 'trickcal_formation_damage_result_saves_v1', 'calculation', 'named-user-snapshots', 'formation-damage-calc.js'],
    ['calc.enemyPresets', 'localStorage', 'trickcal_formation_damage_enemy_presets_v1', 'enemy', 'user-authored-data', 'formation-damage-calc.js'],
    ['dps.settings', 'localStorage', 'trickcal:dps-settings:v1', 'dps', 'per-target-user-settings', 'formation-damage-dps-prototype.js'],
    ['dps.runtimeOverrides', 'localStorage', 'trickcal:dps-runtime-effect-overrides:v1', 'dps', 'runtime-effect-user-settings', 'formation-damage-dps-prototype.js'],
    ['comparison.session', 'sessionStorage', 'trickcal_combat_comparison_session_v1', 'calculation', 'tab-scoped-comparison-session', 'combat-scenario.js'],
    ['sharePrototype.globalEnhancements', 'localStorage', 'trickcal_share_global_enhancement_sources_v2', 'display', 'legacy-share-preference', 'formation-share-prototype.js'],
    ['preference.boardPreviewThemeLegacy', 'localStorage', 'trickcal-board-preview-theme', 'display', 'legacy-preference', 'public/board-layout-preview.js'],
    ['preference.boardPreviewScale', 'localStorage', 'trickcal-board-preview-scale', 'display', 'user-preference', 'public/board-layout-preview.js']
  ].map(([id, area, key, category, role, owner]) => ({
    id,
    area,
    key,
    category,
    role,
    owner,
    control: false,
    writable: true,
    codec: RAW_CODEC
  }));

  const CONTROL_ENTRIES = [
    {
      id: 'control.meta',
      area: 'localStorage',
      key: 'trickcal_storage_meta_v1',
      category: 'control',
      role: 'runtime-control',
      owner: 'storage-runtime.js',
      control: true,
      writable: false,
      codec: RAW_CODEC
    },
    {
      id: 'control.journal',
      area: 'localStorage',
      key: 'trickcal_storage_journal_v1',
      category: 'control',
      role: 'runtime-control',
      owner: 'storage-runtime.js',
      control: true,
      writable: false,
      codec: RAW_CODEC
    },
    {
      id: 'control.sessionEpoch',
      area: 'sessionStorage',
      key: 'trickcal_storage_session_epoch_v1',
      category: 'control',
      role: 'runtime-control',
      owner: 'storage-runtime.js',
      control: true,
      writable: false,
      codec: RAW_CODEC
    }
  ];

  function freezeEntry(entry) {
    return Object.freeze({ ...entry });
  }

  const ALL_ENTRIES = Object.freeze(
    STORAGE_ENTRIES.concat(CONTROL_ENTRIES).map(freezeEntry)
  );
  const ENTRY_BY_ID = new Map(ALL_ENTRIES.map(entry => [entry.id, entry]));
  const ENTRY_BY_AREA_AND_KEY = new Map(
    ALL_ENTRIES.map(entry => [`${entry.area}\u0000${entry.key}`, entry])
  );

  function createStorageRegistry() {
    return Object.freeze({
      version: 1,
      entries: ALL_ENTRIES,
      userEntries: Object.freeze(ALL_ENTRIES.filter(entry => !entry.control)),
      controlEntries: Object.freeze(ALL_ENTRIES.filter(entry => entry.control)),
      get(id) {
        return ENTRY_BY_ID.get(String(id)) || null;
      },
      resolve(area, key) {
        return ENTRY_BY_AREA_AND_KEY.get(`${String(area)}\u0000${String(key)}`) || null;
      },
      isKnown(id) {
        return ENTRY_BY_ID.has(String(id));
      },
      isControl(id) {
        return !!ENTRY_BY_ID.get(String(id))?.control;
      },
      list() {
        return ALL_ENTRIES.slice();
      }
    });
  }

  const defaultRegistry = createStorageRegistry();

  return Object.freeze({
    version: 1,
    codec: RAW_CODEC,
    wholeStorageLockName: WHOLE_STORAGE_LOCK_NAME,
    controlChannelName: CONTROL_CHANNEL_NAME,
    controlIds: Object.freeze({
      meta: 'control.meta',
      journal: 'control.journal',
      sessionEpoch: 'control.sessionEpoch'
    }),
    createStorageRegistry,
    registry: defaultRegistry,
    entries: ALL_ENTRIES,
    userEntries: defaultRegistry.userEntries,
    controlEntries: defaultRegistry.controlEntries
  });
});
