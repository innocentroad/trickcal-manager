(function () {
  'use strict';

  const DATA = window.TRICKCAL_STAT_DATA;
  if (!DATA) {
    document.body.innerHTML = '<main class="stat-shell"><p>statData.jsを読み込めませんでした。</p></main>';
    return;
  }

  const STORAGE_KEY = 'trickcal_stat_prototype_v1';
  const COMMON_THEME_STORAGE_KEY = 'trickcal_theme';
  const THEME_STORAGE_KEY = 'trickcal_stat_theme';
  const BOARD_SHORTCUT_OFF_MODE_STORAGE_KEY = 'trickcal_board_shortcut_off_mode';
  const EXPORT_SCHEMA = 'trickcal-stat-state';
  const EXPORT_VERSION = 1;
  const APOSTLE_IMAGE_FALLBACK = 'img/Chara/null.webp';
  const BOARD_START_DIRECTION = 'Right';
  const LEVEL_CAP_BY_STAR = {
    1: 120,
    2: 120,
    3: 125,
    4: 135,
    5: 145
  };
  const APOSTLE_STAR_MAX = 5;
  const GRADE_MAX = 6;
  const COMBAT_POWER_BASE_BY_RARITY = {
    1: 0.6477,
    2: 0.7212,
    3: 0.7425
  };
  const COMBAT_POWER_CORRECTION_RATE = 0.7;
  const COMBAT_POWER_SKILL_RATE = 0.7;
  const COMBAT_POWER_ASIDE_BONUS = 0.49;
  const COMBAT_POWER_SKILL_VALUE_BY_RARITY = {
    1: 0.01,
    2: 0.01,
    3: 0.02
  };
  const FORMATION_COIN_BASE = 216;
  const FORMATION_COIN_BONUS = 30;
  const FORMATION_COIN_CP_RATE = 0.000012;

  const STAT_GROUPS = [
    { key: 'HP', label: 'HP', total: 'hp', tone: 'hp' },
    { key: '物理攻撃', lookup: '物理攻撃力', label: '物攻', total: 'patk', tone: 'attack' },
    { key: '魔法攻撃', lookup: '魔法攻撃力', label: '魔攻', total: 'matk', tone: 'attack' },
    { key: '物理防御', lookup: '物理防御力', label: '物防', total: 'pdef', tone: 'defense' },
    { key: '魔法防御', lookup: '魔法防御力', label: '魔防', total: 'mdef', tone: 'defense' },
    { key: '会心/会心DMG', label: '会心/会心DMG', total: 'critPair', tone: 'crit' },
    { key: '会心抵抗/会心DMG抵抗', label: '会心抵抗/会心DMG抵抗', total: 'critResPair', tone: 'crit-res' }
  ];

  const TOTAL_LABELS = [
    { key: 'hp', label: 'HP', tone: 'hp', icon: 'HP.webp' },
    { key: 'patk', label: '物理攻撃', tone: 'attack', icon: '物理攻撃力.webp' },
    { key: 'matk', label: '魔法攻撃', tone: 'attack', icon: '魔法攻撃力.webp' },
    { key: 'pdef', label: '物理防御', tone: 'defense', icon: '物理防御力.webp' },
    { key: 'mdef', label: '魔法防御', tone: 'defense', icon: '魔法防御力.webp' },
    { key: 'crit', label: '会心', tone: 'crit', icon: '会心.webp' },
    { key: 'critDmg', label: '会心DMG', tone: 'crit', icon: '会心ダメージ.webp' },
    { key: 'critRes', label: '会心抵抗', tone: 'crit-res', icon: '会心抵抗.webp' },
    { key: 'critDmgRes', label: '会心DMG抵抗', tone: 'crit-res', icon: '会心DMG抵抗.webp' },
    { key: 'spRegen', label: '毎秒SP回復', tone: 'sp', icon: 'SP回復.webp' }
  ];

  const FOLLOW_BONUS_KEYS = TOTAL_LABELS
    .map(item => item.key)
    .filter(key => key !== 'spRegen');

  const BOARD_GLOBAL_STAT_GROUPS = [
    { key: 'hp', label: 'HP', stats: ['hp'], icon: 'Tile_Hp_On.webp' },
    { key: 'attack', label: '攻撃', stats: ['patk', 'matk'], icon: 'Tile_AtkBoth_On.webp', parts: ['物', '魔'] },
    { key: 'defense', label: '防御', stats: ['pdef', 'mdef'], icon: 'Tile_DefBoth_On.webp', parts: ['物', '魔'] },
    { key: 'crit', label: '会心系', stats: ['crit', 'critDmg'], icon: 'Tile_CritBoth_On.webp', parts: ['会', 'DMG'] },
    { key: 'critRes', label: '会心抵抗系', stats: ['critRes', 'critDmgRes'], icon: 'Tile_CritResBoth_On.webp', parts: ['抵', 'DMG'] }
  ];

  const BREAKDOWN_SOURCES = [
    { key: 'base', label: '基礎' },
    { key: 'rankUp', label: 'Rank補正' },
    { key: 'equipment', label: '装備' },
    { key: 'rankGlobal', label: 'Rank全体' },
    { key: 'research', label: '研究' },
    { key: 'board', label: 'ボード' },
    { key: 'globalPercent', label: '全体補正' },
    { key: 'bond', label: '好感度' },
    { key: 'asideManifest', label: 'アサイド発現' },
    { key: 'asideLevel', label: 'アサイドLv' }
  ];

  const ASIDE_LEVEL_STAT_MULTIPLIERS = {
    1: 3,
    2: 3.09,
    3: 3.18
  };

  const STAT_ALIASES = {
    HP: 'hp',
    '最大HP': 'hp',
    '物理攻撃力': 'patk',
    '魔法攻撃力': 'matk',
    '攻撃力': 'attackAll',
    '攻撃': 'attackAll',
    '全体攻撃力': 'attackAll',
    '全体攻撃': 'attackAll',
    '物理防御力': 'pdef',
    '魔法防御力': 'mdef',
    '防御力': 'defenseAll',
    '防御': 'defenseAll',
    '全体防御力': 'defenseAll',
    '全体防御': 'defenseAll',
    '会心': 'crit',
    '会心ダメージ': 'critDmg',
    '会心DMG': 'critDmg',
    '会心抵抗': 'critRes',
    '会心DMG抵抗': 'critDmgRes',
    '会心ダメージ抵抗': 'critDmgRes',
    '毎秒SP回復量': 'spRegen',
    '毎秒SP回復': 'spRegen',
    '全体会心': 'crit',
    '全体会心DMG': 'critDmg',
    '全体会心ダメージ': 'critDmg',
    '全体会心抵抗': 'critRes',
    '全体会心DMG抵抗': 'critDmgRes',
    '全体会心ダメージ抵抗': 'critDmgRes',
    '全体HP': 'hp'
  };

  const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    themeToggles: Array.from(document.querySelectorAll('#theme-toggle, [data-dashboard-theme-toggle]')),
    topReload: document.getElementById('dashboard-top-reload'),
    apostleSelect: document.getElementById('apostle-select'),
    apostlePickerButton: document.getElementById('apostle-picker-button'),
    apostlePickerCurrent: document.getElementById('apostle-picker-current'),
    apostlePickerDialog: document.getElementById('apostle-picker-dialog'),
    apostlePickerClose: document.getElementById('apostle-picker-close'),
    apostlePickerSearch: document.getElementById('apostle-picker-search'),
    apostlePickerSort: document.getElementById('apostle-picker-sort'),
    apostleFilterCount: document.getElementById('apostle-filter-count'),
    apostlePickerFilters: document.getElementById('apostle-picker-filters'),
    apostlePickerGrid: document.getElementById('apostle-picker-grid'),
    rankSelect: document.getElementById('rank-select'),
    levelSelect: document.getElementById('level-select'),
    starSelect: document.getElementById('star-select'),
    bondSelect: document.getElementById('bond-select'),
    asideRankSelect: document.getElementById('aside-rank-select'),
    asideLevelSelect: document.getElementById('aside-level-select'),
    followToggle: document.getElementById('follow-toggle'),
    lowSkillLevelSelect: document.getElementById('low-skill-level-select'),
    highSkillLevelSelect: document.getElementById('high-skill-level-select'),
    passiveSkillLevelSelect: document.getElementById('passive-skill-level-select'),
    lowSkillLevelOutput: document.getElementById('low-skill-level-output'),
    highSkillLevelOutput: document.getElementById('high-skill-level-output'),
    passiveSkillLevelOutput: document.getElementById('passive-skill-level-output'),
    skillLevelCapNote: document.getElementById('skill-level-cap-note'),
    skillInfoList: document.getElementById('skill-info-list'),
    asideInfoList: document.getElementById('aside-info-list'),
    asideTierList: document.getElementById('aside-tier-list'),
    stateSlotList: document.getElementById('state-slot-list'),
    stateSlotSection: document.getElementById('state-slot-list')?.closest('.bottom-save-section'),
    stateSlotSectionTitle: document.getElementById('state-slot-section-title'),
    stateSlotButtons: Array.from(document.querySelectorAll('[data-state-slot]')),
    saveStateSlot: document.getElementById('save-state-slot'),
    loadStateSlot: document.getElementById('load-state-slot'),
    deleteStateSlot: document.getElementById('delete-state-slot'),
    stateSlotCancel: document.getElementById('state-slot-cancel'),
    stateSaveNameWrap: document.getElementById('state-save-name-wrap'),
    stateSaveName: document.getElementById('state-save-name'),
    exportState: document.getElementById('export-state'),
    importState: document.getElementById('import-state'),
    importStateFile: document.getElementById('import-state-file'),
    stateSlotIndicator: document.getElementById('state-slot-indicator'),
    stateCurrentSlot: document.getElementById('state-current-slot'),
    stateStatus: document.getElementById('state-status'),
    image: document.getElementById('apostle-image'),
    profileAsideIcon: document.getElementById('profile-aside-icon'),
    name: document.getElementById('apostle-name'),
    meta: document.getElementById('apostle-meta'),
    profileChipRow: document.getElementById('profile-chip-row'),
    profileCard: document.querySelector('.dashboard-persistent-profile'),
    dashboardViewButtons: Array.from(document.querySelectorAll('[data-dashboard-view]')),
    dashboardPanels: Array.from(document.querySelectorAll('[data-dashboard-panel]')),
    totals: document.getElementById('stat-total-grid'),
    breakdown: document.getElementById('stat-breakdown-table'),
    activeEffects: document.getElementById('active-effect-list'),
    equipment: document.getElementById('equipment-grid'),
    equipAllOn: document.getElementById('equip-all-on'),
    equipAllOff: document.getElementById('equip-all-off'),
    equipBulkEnhance: document.getElementById('equip-bulk-enhance'),
    equipApplyEnhance: document.getElementById('equip-apply-enhance'),
    baseTypes: document.getElementById('base-type-list'),
    rankBonuses: document.getElementById('rank-bonus-list'),
    globalSettingTabs: Array.from(document.querySelectorAll('#global-setting-tabs button')),
    globalSettingPanels: Array.from(document.querySelectorAll('[data-setting-panel]')),
    cardManagerTabs: Array.from(document.querySelectorAll('#card-manager-tabs button')),
    cardManagerSearch: document.getElementById('card-manager-search'),
    cardManagerRarity: document.getElementById('card-manager-rarity'),
    cardManagerEffect: document.getElementById('card-manager-effect'),
    cardManagerOwnedOnly: document.getElementById('card-manager-owned-only'),
    cardManagerOwnVisible: document.getElementById('card-manager-own-visible'),
    cardManagerBulkStar: document.getElementById('card-manager-bulk-star'),
    cardManagerBulkSolder: document.getElementById('card-manager-bulk-solder'),
    cardManagerSummary: document.getElementById('card-manager-summary'),
    cardManagerGrid: document.getElementById('card-manager-grid'),
    formationBoard: document.getElementById('formation-board'),
    formationSynergySummary: document.getElementById('formation-synergy-summary'),
    formationClear: document.getElementById('formation-clear'),
    formationSaveName: document.getElementById('formation-save-name'),
    formationSaveTags: document.getElementById('formation-save-tags'),
    formationTagPresets: Array.from(document.querySelectorAll('[data-formation-tag-preset]')),
    formationSaveCurrent: document.getElementById('formation-save-current'),
    formationSaveEditor: document.getElementById('formation-save-editor'),
    formationSaveConfirm: document.getElementById('formation-save-confirm'),
    formationSaveCancel: document.getElementById('formation-save-cancel'),
    formationOverwriteCurrent: document.getElementById('formation-overwrite-current'),
    formationActivePreset: document.getElementById('formation-active-preset'),
    formationSaveList: document.getElementById('formation-save-list'),
    formationPickerDialog: document.getElementById('formation-picker-dialog'),
    formationPickerTitle: document.getElementById('formation-picker-title'),
    formationPickerClose: document.getElementById('formation-picker-close'),
    formationPickerSearch: document.getElementById('formation-picker-search'),
    formationPickerSort: document.getElementById('formation-picker-sort'),
    formationPickerSortWrap: document.getElementById('formation-picker-sort-wrap'),
    formationFilterDetails: document.getElementById('formation-filter-details'),
    formationFilterCount: document.getElementById('formation-filter-count'),
    formationPickerFilters: document.getElementById('formation-picker-filters'),
    formationPickerGrid: document.getElementById('formation-picker-grid'),
    formationCostSummary: document.getElementById('formation-cost-summary'),
    formationMemberSummary: document.getElementById('formation-member-summary'),
    formationSpellList: document.getElementById('formation-spell-list'),
    researchProgressSelect: document.getElementById('research-progress-select'),
    researchLevelSelect: document.getElementById('research-level-select'),
    researchGrid: document.getElementById('research-grid'),
    activeResearch: document.getElementById('active-research-list'),
    rankOverviewSummary: document.getElementById('rank-overview-summary'),
    rankOverviewGrid: document.getElementById('rank-overview-grid'),
    rankOverviewSort: document.getElementById('rank-overview-sort'),
    rankOverviewFilters: document.getElementById('rank-overview-filters'),
    rankFilterCount: document.getElementById('rank-filter-count'),
    bondOverviewSummary: document.getElementById('bond-overview-summary'),
    bondOverviewGrid: document.getElementById('bond-overview-grid'),
    bondOverviewSort: document.getElementById('bond-overview-sort'),
    bondOverviewFilters: document.getElementById('bond-overview-filters'),
    bondFilterCount: document.getElementById('bond-filter-count'),
    asideOverviewSummary: document.getElementById('aside-overview-summary'),
    asideOverviewGrid: document.getElementById('aside-overview-grid'),
    asideOverviewSort: document.getElementById('aside-overview-sort'),
    asideOverviewFilters: document.getElementById('aside-overview-filters'),
    asideFilterCount: document.getElementById('aside-filter-count'),
    boardGlobalOverviewSummary: document.getElementById('board-global-overview-summary'),
    boardGlobalOverviewList: document.getElementById('board-global-overview-list'),
    boardGlobalBottomSummary: document.getElementById('board-global-bottom-summary'),
    boardGlobalModeCurrent: document.getElementById('board-global-mode-current'),
    boardGlobalModePlan: document.getElementById('board-global-mode-plan'),
    boardGlobalSearch: document.getElementById('board-global-search'),
    boardGlobalSort: document.getElementById('board-global-sort'),
    boardGlobalProgressSummary: document.getElementById('board-global-progress-summary'),
    boardGlobalFilters: document.getElementById('board-global-filters'),
    boardGlobalFilterCount: document.getElementById('board-global-filter-count'),
    boardGlobalCancel: document.getElementById('board-global-cancel'),
    boardGlobalSavePlan: document.getElementById('board-global-save-plan'),
    boardGlobalConfirm: document.getElementById('board-global-confirm'),
    boardGlobalDiscardPlan: document.getElementById('board-global-discard-plan'),
    boardTabs: Array.from(document.querySelectorAll('#board-tabs button')),
    boardStage: document.getElementById('board-stage'),
    fillBoard: document.getElementById('fill-board'),
    clearBoard: document.getElementById('clear-board'),
    confirmBoardDraft: document.getElementById('confirm-board-draft'),
    cancelBoardDraft: document.getElementById('cancel-board-draft'),
    saveBoardPlan: document.getElementById('save-board-plan'),
    boardModeCurrent: document.getElementById('board-mode-current'),
    boardModePlan: document.getElementById('board-mode-plan'),
    boardShortcutOffToggle: document.getElementById('board-shortcut-off-toggle'),
    boardDraftSummary: document.getElementById('board-draft-summary'),
    boardFloatingSummary: document.getElementById('board-floating-summary'),
    boardSelectionSummary: document.getElementById('board-selection-summary'),
    boardSpecial: document.getElementById('board-special-list'),
    boardGrid: document.getElementById('board-grid')
  };

  const appState = loadState();
  let boardDraft = null;
  let globalBoardDrafts = {};
  let snapshotBoardOverride = null;
  let snapshotBoardMode = null;
  const view = {
    id: '',
    board: 1,
    boardEditMode: 'current',
    stateSlot: 1,
    stateSlotMode: '',
    apostleFilters: {
      personality: new Set(),
      species: new Set(),
      role: new Set(),
      position: new Set()
    },
    apostleSort: 'name',
    rankFilters: {
      personality: new Set(),
      species: new Set(),
      role: new Set(),
      position: new Set()
    },
    rankSort: 'name',
    bondFilters: {
      personality: new Set(),
      species: new Set(),
      role: new Set(),
      position: new Set()
    },
    bondSort: 'name',
    asideFilters: {
      personality: new Set(),
      species: new Set(),
      role: new Set(),
      position: new Set()
    },
    asideSort: 'name',
    boardGlobalMode: 'current',
    boardShortcutOffMode: loadBoardShortcutOffMode(),
    boardGlobalSort: 'name',
    boardGlobalSortTouched: false,
    boardGlobalFilters: {
      layers: new Set(),
      stats: new Set()
    },
    cardManager: {
      kind: 'artifact',
      search: '',
      rarity: '',
      effect: '',
      ownedOnly: false
    },
    formationPicker: null,
    formationSort: 'name',
    formationFilters: {
      personality: new Set(),
      species: new Set(),
      role: new Set()
    },
    formationSpellDetailsOpen: false
  };
  let stateStatusTimer = 0;
  let isRefreshingStatSnapshots = false;
  let stateSaveTimer = 0;
  let statSnapshotRefreshTimer = 0;
  let stateManagerRenderTimer = 0;
  let renderTimer = 0;

  init();

  function init() {
    document.addEventListener('error', handleApostleImageError, true);
    setTheme(loadSavedTheme());
    populateControls();
    view.id = appState.activeId || DATA.sheets.basicInfo[0]?.id || '';
    elements.apostleSelect.value = view.id;
    ensureApostleState(view.id);
    restoreSavedBoardPlan();
    syncControlsFromState();
    bindEvents();
    installStatEngineApi();
    window.addEventListener('beforeunload', flushPendingStateSave);
    renderStateManager();
    render();
    applyInitialDashboardRoute();
    saveState();
  }

  function getCurrentTheme() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function loadSavedTheme() {
    const saved = localStorage.getItem(COMMON_THEME_STORAGE_KEY)
      || localStorage.getItem(THEME_STORAGE_KEY)
      || 'dark';
    return saved === 'dark' ? 'dark' : 'light';
  }

  function setTheme(theme) {
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = safeTheme;
    localStorage.setItem(COMMON_THEME_STORAGE_KEY, safeTheme);
    localStorage.setItem(THEME_STORAGE_KEY, safeTheme);
    syncThemeToggle();
  }

  function loadBoardShortcutOffMode() {
    return localStorage.getItem(BOARD_SHORTCUT_OFF_MODE_STORAGE_KEY) === 'route' ? 'route' : 'node';
  }

  function setBoardShortcutOffMode(mode) {
    view.boardShortcutOffMode = mode === 'route' ? 'route' : 'node';
    localStorage.setItem(BOARD_SHORTCUT_OFF_MODE_STORAGE_KEY, view.boardShortcutOffMode);
    syncBoardShortcutOffToggle();
    renderBoardGlobalOverview();
  }

  function toggleBoardShortcutOffMode() {
    setBoardShortcutOffMode(view.boardShortcutOffMode === 'route' ? 'node' : 'route');
  }

  function syncBoardShortcutOffToggle() {
    const label = view.boardShortcutOffMode === 'route'
      ? 'OFF時: 経路整理'
      : 'OFF時: マスのみ';
    document.querySelectorAll('[data-board-shortcut-off-toggle]').forEach(button => {
      button.textContent = label;
      button.classList.toggle('is-route', view.boardShortcutOffMode === 'route');
      button.setAttribute('aria-pressed', String(view.boardShortcutOffMode === 'route'));
      button.title = view.boardShortcutOffMode === 'route'
        ? '特殊マスOFF時に不要な経路も整理します'
        : '特殊マスOFF時に特殊マスだけ外します';
    });
  }

  function syncThemeToggle() {
    const isDark = getCurrentTheme() === 'dark';
    elements.themeToggles.forEach(button => {
      button.textContent = button.matches('[data-dashboard-theme-toggle]') ? (isDark ? '☾' : '☀') : '';
      button.setAttribute('aria-pressed', String(isDark));
      button.setAttribute('aria-label', isDark ? 'ダークモード。ライトモードに切替' : 'ライトモード。ダークモードに切替');
      button.title = isDark ? 'ライトモードに切替' : 'ダークモードに切替';
    });
  }

  function populateControls() {
    elements.apostleSelect.innerHTML = DATA.sheets.basicInfo
      .map(row => `<option value="${escapeAttr(row.id)}">${escapeHtml(row.使徒名 || row.id)}</option>`)
      .join('');

    elements.rankSelect.innerHTML = Array.from({ length: 9 }, (_, index) => {
      const rank = index + 1;
      return `<option value="${rank}">Rank ${rank}</option>`;
    }).join('');

    elements.starSelect.innerHTML = Array.from({ length: APOSTLE_STAR_MAX }, (_, index) => {
      const star = index + 1;
      return `<option value="${star}">★${star}</option>`;
    }).join('');
    renderLevelOptions(1);

    elements.bondSelect.innerHTML = Array.from({ length: 30 }, (_, index) => {
      const level = index + 1;
      return `<option value="${level}">Lv ${level}</option>`;
    }).join('');

    elements.asideRankSelect.innerHTML = [
      ['0', '未発現'],
      ['1', 'A1'],
      ['2', 'A2'],
      ['3', 'A3']
    ].map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
    renderAsideLevelOptions(0);

    elements.researchProgressSelect.innerHTML = Array.from({ length: 46 }, (_, index) => {
      const label = index === 0 ? 'OFF' : `${index}回目`;
      return `<option value="${index}">${label}</option>`;
    }).join('');

    elements.researchLevelSelect.innerHTML = Array.from({ length: 11 }, (_, index) => {
      const label = index === 0 ? 'OFF' : `${index}段階`;
      return `<option value="${index}">${label}</option>`;
    }).join('');

    renderResearchControls();
    renderRankOverviewControls();
    renderBondOverviewControls();
    renderAsideOverviewControls();
    renderApostlePickerFilters();
    renderApostlePicker();
  }

  function bindEvents() {
    elements.themeToggles.forEach(button => button.addEventListener('click', () => {
      setTheme(getCurrentTheme() === 'dark' ? 'light' : 'dark');
    }));

    elements.topReload?.addEventListener('click', () => {
      flushPendingStateSave();
      window.location.reload();
    });

    elements.apostlePickerButton.addEventListener('click', () => {
      elements.apostlePickerSearch.value = '';
      renderApostlePicker();
      elements.apostlePickerDialog.showModal();
      elements.apostlePickerSearch.focus();
    });

    elements.apostlePickerClose.addEventListener('click', () => {
      elements.apostlePickerDialog.close();
    });

    elements.apostlePickerDialog.addEventListener('click', event => {
      if (event.target === elements.apostlePickerDialog) elements.apostlePickerDialog.close();
    });

    elements.apostlePickerSearch.addEventListener('input', renderApostlePicker);
    elements.apostlePickerSort.addEventListener('change', () => {
      view.apostleSort = elements.apostlePickerSort.value || 'name';
      renderApostlePicker();
    });

    elements.apostlePickerFilters.addEventListener('click', event => {
      const clearButton = event.target.closest('button[data-apostle-filter-clear]');
      if (clearButton) {
        Object.values(view.apostleFilters).forEach(values => values.clear());
        renderApostlePickerFilters();
        renderApostlePicker();
        return;
      }

      const button = event.target.closest('button[data-apostle-filter-group]');
      if (!button) return;
      const values = view.apostleFilters[button.dataset.apostleFilterGroup];
      const value = button.dataset.apostleFilterValue;
      if (!values || !value) return;
      if (values.has(value)) values.delete(value);
      else values.add(value);
      renderApostlePickerFilters();
      renderApostlePicker();
    });

    elements.apostlePickerGrid.addEventListener('click', event => {
      const card = event.target.closest('button[data-apostle-picker-id]');
      if (!card) return;
      elements.apostleSelect.value = card.dataset.apostlePickerId;
      elements.apostleSelect.dispatchEvent(new Event('change', { bubbles: true }));
      elements.apostlePickerDialog.close();
    });

    elements.stateSlotList.addEventListener('click', event => {
      const button = event.target.closest('button[data-state-slot]');
      if (!button) return;
      handleStateSlotClick(Number(button.dataset.stateSlot) || 1);
    });

    elements.saveStateSlot.addEventListener('click', () => {
      setStateSlotMode('save');
    });

    elements.loadStateSlot.addEventListener('click', () => {
      setStateSlotMode('load');
    });

    elements.deleteStateSlot.addEventListener('click', () => {
      setStateSlotMode('delete');
    });

    elements.stateSlotCancel?.addEventListener('click', () => {
      setStateSlotMode('');
      showStateStatus('スロット操作をキャンセルしました');
    });

    elements.exportState.addEventListener('click', exportStateFile);

    elements.importState.addEventListener('click', () => {
      elements.importStateFile.click();
    });

    elements.importStateFile.addEventListener('change', async () => {
      const file = elements.importStateFile.files?.[0];
      elements.importStateFile.value = '';
      if (!file) return;
      try {
        const payload = JSON.parse(await file.text());
        const imported = parseImportedState(payload);
        const slotLabel = `スロット${view.stateSlot}`;
        const overwriteNote = appState.savedStates[String(view.stateSlot)]
          ? `${slotLabel}の保存内容を上書きします。`
          : `${slotLabel}に保存します。`;
        if (!window.confirm(`インポートした状態を読み込み、${overwriteNote}\n他の保存スロットは変更しません。`)) return;
        applyImportedState(imported);
        showStateStatus(`${slotLabel}にインポートしました`);
      } catch (error) {
        console.error(error);
        window.alert('読み込める状態ファイルではありません。');
        showStateStatus('インポートに失敗しました', true);
      }
    });

    elements.apostleSelect.addEventListener('change', () => {
      persistCurrentControls();
      syncBoardDraftToGlobalDraft();
      const shouldRestoreBoardDraft = isDashboardPanelActive('board');
      boardDraft = null;
      view.id = elements.apostleSelect.value;
      appState.activeId = view.id;
      ensureApostleState(view.id);
      restoreSavedBoardPlan();
      if (shouldRestoreBoardDraft) syncGlobalDraftToBoardDraft(view.id);
      syncControlsFromState();
      saveState();
      render();
    });

    window.addEventListener('trickcal-stat-active-apostle-sync', event => {
      const id = getValidApostleId(event.detail?.id);
      if (!id || id === view.id) return;
      elements.apostleSelect.value = id;
      elements.apostleSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    elements.rankSelect.addEventListener('change', () => {
      currentApostleState().rank = Number(elements.rankSelect.value) || 1;
      saveState();
      render();
    });

    elements.levelSelect.addEventListener('change', () => {
      const state = currentApostleState();
      state.level = normalizeApostleLevel(Number(elements.levelSelect.value) || 1, state.star);
      saveState({ renderStateManager: false });
      renderProfileQuick();
      scheduleRender();
    });

    elements.starSelect.addEventListener('change', () => {
      const state = currentApostleState();
      state.star = normalizeApostleStar(elements.starSelect.value);
      state.level = normalizeApostleLevel(state.level, state.star);
      renderLevelOptions(state.star);
      elements.levelSelect.value = String(state.level);
      saveState({ renderStateManager: false });
      renderProfileQuick();
      scheduleRender();
    });

    elements.bondSelect.addEventListener('change', () => {
      const basic = DATA.getById('basicInfo', view.id);
      const state = currentApostleState();
      state.bond = normalizeBondForApostle(basic, elements.bondSelect.value);
      elements.bondSelect.value = String(state.bond);
      saveState({ renderStateManager: false });
      renderProfileQuick();
      scheduleRender();
    });

    elements.asideRankSelect.addEventListener('change', () => {
      const state = currentApostleState();
      state.asideRank = Number(elements.asideRankSelect.value) || 0;
      state.asideLevel = normalizeAsideLevelForRank(state.asideLevel, state.asideRank);
      state.skillLevels = normalizeSkillLevels(state.skillLevels, state.asideRank);
      ensureStarForAsideManifest(state);
      syncAsideControlsFromState(state);
      syncSkillLevelControlsFromState(state);
      saveState();
      render();
    });

    elements.asideLevelSelect.addEventListener('change', () => {
      const state = currentApostleState();
      state.asideLevel = normalizeAsideLevelForRank(Number(elements.asideLevelSelect.value) || 0, state.asideRank);
      saveState({ renderStateManager: false });
      renderProfileQuick();
      scheduleRender();
    });

    elements.followToggle.addEventListener('change', () => {
      currentApostleState().follow = !!elements.followToggle.checked;
      saveState({ renderStateManager: false });
      renderProfileQuick();
      scheduleRender();
    });

    elements.profileCard?.addEventListener('click', event => {
      const followButton = event.target.closest('#profile-follow-button');
      if (followButton) {
        const basic = DATA.getById('basicInfo', view.id);
        if (isEldainApostle(basic)) return;
        const state = currentApostleState();
        state.follow = !state.follow;
        elements.followToggle.checked = state.follow;
        saveState({ renderStateManager: false });
        renderProfileQuick();
        scheduleRender();
        return;
      }

      const gradeButton = event.target.closest('[data-profile-grade-cycle]');
      if (gradeButton) {
        cycleProfileGrade();
        return;
      }

      const starButton = event.target.closest('button[data-profile-star]');
      if (starButton) {
        setProfileStar(Number(starButton.dataset.profileStar) || 1);
      }
    });

    elements.profileAsideIcon?.addEventListener('click', () => {
      toggleProfileAsideRank();
    });

    elements.profileAsideIcon?.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleProfileAsideRank();
    });

    elements.profileCard?.addEventListener('change', event => {
      const select = event.target.closest('select[data-profile-field]');
      if (!select) return;
      updateProfileField(select.dataset.profileField, select.value);
    });

    elements.dashboardViewButtons.forEach(button => {
      button.addEventListener('click', () => activateDashboardView(button.dataset.dashboardView));
    });

    document.querySelectorAll('[data-dashboard-profile-top]').forEach(button => {
      button.addEventListener('click', () => {
        activateDashboardView('settings');
        elements.profileCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    document.querySelectorAll('[data-open-global]').forEach(button => {
      button.addEventListener('click', () => {
        closeBottomMenus(button.closest('.bottom-global-menu'));
        openGlobalSettingPanel(button.dataset.openGlobal || 'research');
        button.closest('.bottom-global-menu')?.removeAttribute('open');
      });
    });

    document.querySelectorAll('[data-open-card-manager]').forEach(button => {
      button.addEventListener('click', () => {
        closeBottomMenus();
        openCardManagerPanel(button.dataset.openCardManager === 'spell' ? 'spell' : 'artifact');
      });
    });

    [
      ['low', elements.lowSkillLevelSelect, elements.lowSkillLevelOutput],
      ['high', elements.highSkillLevelSelect, elements.highSkillLevelOutput],
      ['passive', elements.passiveSkillLevelSelect, elements.passiveSkillLevelOutput]
    ].forEach(([group, select, output]) => {
      const updateSkillLevelOutput = () => {
        if (output) output.textContent = String(Number(select.value) || 1);
      };
      const commitSkillLevelInput = () => {
        updateSkillLevelOutput();
        const state = currentApostleState();
        state.skillLevels = normalizeSkillLevels({
          ...state.skillLevels,
          [group]: Number(select.value) || 1
        }, state.asideRank);
        saveState({ renderStateManager: false });
        renderSkillLevelChange();
        scheduleRender();
      };
      select.addEventListener('input', updateSkillLevelOutput);
      select.addEventListener('change', commitSkillLevelInput);
    });

    elements.globalSettingTabs.forEach(button => {
      button.addEventListener('click', () => {
        const tab = button.dataset.settingTab;
        elements.globalSettingTabs.forEach(item => item.classList.toggle('is-active', item === button));
        elements.globalSettingPanels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.settingPanel === tab));
        updateGlobalOpenActiveButton(tab);
        scrollGlobalSettingIntoView(tab, { block: 'start' });
      });
    });

    elements.cardManagerTabs.forEach(button => {
      button.addEventListener('click', () => {
        view.cardManager.kind = button.dataset.cardKind || 'artifact';
        renderCardManager();
      });
    });

    elements.cardManagerSearch?.addEventListener('input', () => {
      view.cardManager.search = elements.cardManagerSearch.value.trim();
      renderCardManager();
    });

    elements.cardManagerRarity?.addEventListener('change', () => {
      view.cardManager.rarity = elements.cardManagerRarity.value || '';
      renderCardManager();
    });

    elements.cardManagerEffect?.addEventListener('change', () => {
      view.cardManager.effect = elements.cardManagerEffect.value || '';
      renderCardManager();
    });

    elements.cardManagerOwnedOnly?.addEventListener('change', () => {
      view.cardManager.ownedOnly = !!elements.cardManagerOwnedOnly.checked;
      renderCardManager();
    });

    elements.cardManagerOwnVisible?.addEventListener('click', () => {
      getVisibleCardManagerCards().forEach(card => {
        ensureCardState(card.id).owned = true;
      });
      persistCardManagerChange();
    });

    elements.cardManagerBulkStar?.addEventListener('change', () => {
      if (elements.cardManagerBulkStar.value === '') return;
      const star = normalizeCardStar(elements.cardManagerBulkStar.value);
      getVisibleCardManagerCards().forEach(card => {
        const entry = ensureCardState(card.id);
        entry.star = star;
        if (entry.star < 5) entry.solder = 0;
      });
      elements.cardManagerBulkStar.value = '';
      persistCardManagerChange();
    });

    elements.cardManagerBulkSolder?.addEventListener('change', () => {
      if (elements.cardManagerBulkSolder.value === '') return;
      const solder = normalizeCardSolder(elements.cardManagerBulkSolder.value);
      getVisibleCardManagerCards().forEach(card => {
        const entry = ensureCardState(card.id);
        if (normalizeCardStar(entry.star) >= 5) entry.solder = solder;
      });
      elements.cardManagerBulkSolder.value = '';
      persistCardManagerChange();
    });

    elements.cardManagerGrid?.addEventListener('change', event => {
      const control = event.target.closest('[data-card-control]');
      if (!control) return;
      const cardId = control.dataset.cardId;
      const entry = ensureCardState(cardId);
      if (control.dataset.cardControl === 'owned') entry.owned = !!control.checked;
      if (control.dataset.cardControl === 'star') entry.star = normalizeCardStar(control.value);
      if (control.dataset.cardControl === 'solder') entry.solder = normalizeCardSolder(control.value);
      persistCardManagerChange(cardId);
    });

    elements.cardManagerGrid?.addEventListener('click', event => {
      const starButton = event.target.closest('[data-card-star]');
      const solderButton = event.target.closest('[data-card-solder-overlay]');
      const effectButton = event.target.closest('[data-card-effect-overlay]');
      const cardElement = event.target.closest('.resource-card[data-card-id]');
      if (!starButton && !solderButton && !effectButton && !cardElement) return;
      const cardId = (starButton || solderButton || effectButton)?.dataset.cardId || cardElement?.dataset.cardId;
      const entry = ensureCardState(cardId);
      if (starButton) {
        event.preventDefault();
        entry.star = normalizeCardStar(starButton.dataset.cardStar);
        if (entry.star < 5) entry.solder = 0;
      } else if (solderButton) {
        event.preventDefault();
        if (normalizeCardStar(entry.star) < 5) return;
        entry.solder = normalizeCardSolder(((Number(entry.solder) || 0) + 1) % 3);
      } else {
        if (effectButton) {
          openCardManagerEffectPopover(effectButton.dataset.cardId, effectButton);
          return;
        }
        if (event.target.closest('input, select, button, a')) return;
        event.preventDefault();
        entry.owned = !entry.owned;
      }
      persistCardManagerChange(cardId);
    });

    elements.formationBoard?.addEventListener('click', event => {
      const clearButton = event.target.closest('[data-formation-clear-row]');
      if (clearButton) {
        clearFormationRow(Number(clearButton.dataset.formationClearRow) || 0);
        return;
      }

      const apostleButton = event.target.closest('[data-formation-apostle-row]');
      if (apostleButton) {
        openFormationPicker(
          'apostle',
          Number(apostleButton.dataset.formationApostleRow) || 0,
          Number(apostleButton.dataset.formationLine) || 0
        );
        return;
      }

      const artifactButton = event.target.closest('[data-formation-artifact-row]');
      if (artifactButton) {
        openFormationPicker(
          'artifact',
          Number(artifactButton.dataset.formationArtifactRow) || 0,
          Number(artifactButton.dataset.formationArtifactLine) || 0,
          Number(artifactButton.dataset.formationArtifactSlot) || 0
        );
      }
    });

    elements.formationBoard?.addEventListener('dragstart', event => {
      const slot = event.target.closest('[data-formation-apostle-row]');
      if (!slot) return;
      const rowIndex = Number(slot.dataset.formationApostleRow) || 0;
      const lineIndex = Number(slot.dataset.formationLine) || 0;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `${rowIndex}:${lineIndex}`);
      elements.formationBoard.classList.add('is-dragging-apostle');
      elements.formationBoard.dataset.dragFormationRow = String(rowIndex);
      slot.classList.add('is-dragging');
      elements.formationBoard.querySelectorAll(`[data-formation-apostle-row="${rowIndex}"]`).forEach(button => {
        if (button !== slot) button.classList.add('is-drop-compatible');
      });
    });

    elements.formationBoard?.addEventListener('dragover', event => {
      const slot = event.target.closest('[data-formation-apostle-row]');
      if (!slot) return;
      const sourceRow = Number(elements.formationBoard.dataset.dragFormationRow);
      const targetRow = Number(slot.dataset.formationApostleRow) || 0;
      if (Number.isFinite(sourceRow) && sourceRow === targetRow) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        slot.classList.add('is-drop-target');
      }
    });

    elements.formationBoard?.addEventListener('dragleave', event => {
      const slot = event.target.closest('[data-formation-apostle-row]');
      if (slot) slot.classList.remove('is-drop-target');
    });

    elements.formationBoard?.addEventListener('drop', event => {
      const slot = event.target.closest('[data-formation-apostle-row]');
      if (!slot) return;
      event.preventDefault();
      const [sourceRow, sourceLine] = String(event.dataTransfer.getData('text/plain') || '').split(':').map(Number);
      const targetRow = Number(slot.dataset.formationApostleRow) || 0;
      const targetLine = Number(slot.dataset.formationLine) || 0;
      clearFormationDragState();
      swapFormationApostlesInRow(sourceRow, sourceLine, targetRow, targetLine);
    });

    elements.formationBoard?.addEventListener('dragend', clearFormationDragState);

    elements.formationCostSummary?.addEventListener('click', event => {
      const openButton = event.target.closest('[data-formation-coin-open]');
      if (openButton) {
        const popover = elements.formationCostSummary.querySelector('[data-formation-coin-popover]');
        const expanded = openButton.getAttribute('aria-expanded') === 'true';
        if (popover) popover.hidden = expanded;
        openButton.setAttribute('aria-expanded', String(!expanded));
        if (!expanded) popover?.querySelector('[data-formation-coin-input]')?.focus();
        return;
      }
      const autoButton = event.target.closest('[data-formation-coin-auto]');
      if (autoButton) {
        const formation = ensureFormationState();
        formation.coinMode = 'auto';
        formation.coins = calculateFormationAutoCoins();
        saveState();
        updateFormationCoinSummary(formation);
        renderFormationActivePreset();
        return;
      }
      const manualButton = event.target.closest('[data-formation-coin-manual]');
      if (manualButton) {
        const formation = ensureFormationState();
        formation.coinMode = 'manual';
        saveState();
        updateFormationCoinSummary(formation);
        return;
      }
      if (event.target.closest('[data-formation-coin-close]')) {
        closeFormationCoinPopover();
      }
    });

    document.addEventListener('click', event => {
      if (!elements.formationCostSummary || elements.formationCostSummary.contains(event.target)) return;
      closeFormationCoinPopover();
    });

    elements.formationCostSummary?.addEventListener('input', event => {
      const input = event.target.closest('[data-formation-coin-input]');
      if (!input) return;
      const formation = ensureFormationState();
      formation.coinMode = 'manual';
      formation.coins = normalizeFormationCoins(input.value);
      saveState();
      updateFormationCoinSummary(formation);
      renderFormationActivePreset();
    });

    elements.formationSpellList?.addEventListener('click', event => {
      const detailsButton = event.target.closest('[data-formation-spell-details]');
      if (detailsButton) {
        view.formationSpellDetailsOpen = !view.formationSpellDetailsOpen;
        renderFormationSpells();
        return;
      }

      const removeButton = event.target.closest('[data-formation-spell-remove-id]');
      if (removeButton) {
        removeFormationSpell(removeButton.dataset.formationSpellRemoveId || '');
        return;
      }

      const stepButton = event.target.closest('[data-formation-spell-step]');
      if (!stepButton) return;
      event.preventDefault();
      adjustFormationSpellCount(
        stepButton.dataset.formationSpellCard || '',
        Number(stepButton.dataset.formationSpellStep) || 0
      );
    });

    elements.formationSynergySummary?.addEventListener('click', event => {
      const target = event.target.closest('[data-formation-synergy-kind]');
      if (!target) return;
      openFormationSynergyPopover(target, target.dataset.formationSynergyKind);
    });

    elements.formationSynergySummary?.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = event.target.closest('[data-formation-synergy-kind]');
      if (!target) return;
      event.preventDefault();
      openFormationSynergyPopover(target, target.dataset.formationSynergyKind);
    });

    elements.formationSynergySummary?.addEventListener('pointermove', event => {
      const popover = document.getElementById('formation-synergy-popover');
      if (!popover || popover.hidden) return;
      if (event.target.closest('[data-formation-synergy-kind]')) return;
      popover.hidden = true;
    });

    elements.formationClear?.addEventListener('click', () => {
      if (!window.confirm('編成をすべてクリアしますか？')) return;
      appState.formation = createDefaultFormation();
      saveState();
      renderFormation();
    });

    elements.formationSaveCurrent?.addEventListener('click', openFormationSaveEditor);
    elements.formationSaveConfirm?.addEventListener('click', saveCurrentFormationPreset);
    elements.formationSaveCancel?.addEventListener('click', closeFormationSaveEditor);
    elements.formationOverwriteCurrent?.addEventListener('click', overwriteCurrentFormationPreset);

    elements.formationTagPresets.forEach(button => {
      button.addEventListener('click', () => addFormationTagPreset(button.dataset.formationTagPreset || button.textContent || ''));
    });

    elements.formationSaveList?.addEventListener('click', event => {
      const loadButton = event.target.closest('[data-formation-preset-load]');
      if (loadButton) {
        loadFormationPreset(loadButton.dataset.formationPresetLoad || '');
        return;
      }
      const favoriteButton = event.target.closest('[data-formation-preset-favorite]');
      if (favoriteButton) {
        toggleFormationPresetFavoritePicker(favoriteButton.dataset.formationPresetFavorite || '');
        return;
      }
      const slotButton = event.target.closest('[data-formation-preset-slot]');
      if (slotButton) {
        setFormationPresetFavoriteSlot(
          slotButton.dataset.formationPresetId || '',
          slotButton.dataset.formationPresetSlot || ''
        );
        return;
      }
      const deleteButton = event.target.closest('[data-formation-preset-delete]');
      if (deleteButton) {
        deleteFormationPreset(deleteButton.dataset.formationPresetDelete || '');
      }
    });

    document.addEventListener('click', event => {
      const clickedBottomMenu = event.target.closest('.bottom-save-menu, .bottom-global-menu');
      const clickedBottomButton = event.target.closest('.dashboard-bottom-bar button');
      if (clickedBottomMenu) {
        closeBottomMenus(clickedBottomMenu);
        return;
      }
      if (clickedBottomButton || !clickedBottomMenu) closeBottomMenus();
    });

    elements.formationPickerClose?.addEventListener('click', () => {
      elements.formationPickerDialog.close();
    });

    elements.formationPickerDialog?.addEventListener('click', event => {
      if (event.target === elements.formationPickerDialog) {
        elements.formationPickerDialog.close();
        return;
      }
      const effectButton = event.target.closest('[data-formation-picker-effect]');
      if (effectButton) {
        event.stopPropagation();
        openCardManagerEffectPopover(effectButton.dataset.formationPickerEffect || '', effectButton);
        return;
      }
      const option = event.target.closest('[data-formation-picker-value]');
      if (!option) return;
      applyFormationPickerValue(option.dataset.formationPickerValue || '');
    });

    elements.formationPickerSearch?.addEventListener('input', renderFormationPickerOptions);

    elements.formationPickerSort?.addEventListener('change', () => {
      view.formationSort = elements.formationPickerSort.value || 'name';
      renderFormationPickerOptions();
    });

    elements.formationPickerFilters?.addEventListener('click', event => {
      const clearButton = event.target.closest('[data-formation-filter-clear]');
      if (clearButton) {
        Object.values(view.formationFilters).forEach(values => values.clear());
        renderFormationPickerFilters();
        renderFormationPickerOptions();
        return;
      }
      const button = event.target.closest('[data-formation-filter-group]');
      if (!button) return;
      const group = button.dataset.formationFilterGroup;
      const value = button.dataset.formationFilterValue;
      const selected = view.formationFilters[group];
      if (!selected || !value) return;
      if (selected.has(value)) selected.delete(value);
      else selected.add(value);
      renderFormationPickerFilters();
      renderFormationPickerOptions();
    });

    elements.boardTabs.forEach(button => {
      button.addEventListener('click', () => {
        const nextBoard = Number(button.dataset.board) || 1;
        view.board = nextBoard;
        render();
      });
    });

    elements.fillBoard.addEventListener('click', () => {
      beginBoardDraftForLayer(view.board);
      const board = currentBoardState();
      board.targets = [];
      getCurrentBoardRows().forEach(row => board.filled[boardKey(row)] = true);
      render();
    });

    elements.clearBoard.addEventListener('click', () => {
      beginBoardDraftForLayer(view.board);
      const board = currentBoardState();
      board.filled = {};
      board.targets = [];
      render();
    });

    elements.confirmBoardDraft.addEventListener('click', () => {
      if (!hasBoardDraft()) return;
      const state = currentApostleState();
      const newBoards = cloneJson(boardDraft.boards);
      const rebasedPlan = rebaseSavedBoardPlan(state, newBoards);
      state.boards = newBoards;
      if (rebasedPlan) {
        state.plannedBoards = rebasedPlan.boards;
        state.plannedBoardShortcutTargets = rebasedPlan.shortcutTargets;
      } else {
        delete state.plannedBoards;
        delete state.plannedBoardShortcutTargets;
      }
      boardDraft = null;
      delete globalBoardDrafts[view.id];
      saveState();
      render();
    });

    elements.saveBoardPlan.addEventListener('click', () => {
      if (!hasBoardDraftChanges()) return;
      const state = currentApostleState();
      if (view.boardEditMode === 'plan') {
        state.plannedBoards = cloneJson(boardDraft.boards);
        state.plannedBoardShortcutTargets = cloneJson(boardDraft.shortcutTargets || {});
      } else {
        mergeBoardDraftIntoSavedPlan(state);
      }
      boardDraft = null;
      delete globalBoardDrafts[view.id];
      saveState();
      render();
    });

    elements.boardModeCurrent.addEventListener('click', () => switchBoardEditMode('current'));
    elements.boardModePlan.addEventListener('click', () => switchBoardEditMode('plan'));
    elements.boardShortcutOffToggle?.addEventListener('click', toggleBoardShortcutOffMode);

    elements.cancelBoardDraft.addEventListener('click', () => {
      const state = currentApostleState();
      if (hasBoardDraft()) {
        boardDraft = null;
        delete globalBoardDrafts[view.id];
      } else if (view.boardEditMode === 'plan' && hasSavedBoardPlan()) {
        delete state.plannedBoards;
        delete state.plannedBoardShortcutTargets;
      } else {
        return;
      }
      saveState();
      render();
    });

    elements.boardFloatingSummary?.addEventListener('click', event => {
      const shortcutModeButton = event.target.closest('[data-board-shortcut-off-toggle]');
      if (shortcutModeButton) {
        toggleBoardShortcutOffMode();
        return;
      }

      const modeButton = event.target.closest('button[data-board-floating-mode]');
      if (modeButton) {
        switchBoardEditMode(modeButton.dataset.boardFloatingMode === 'plan' ? 'plan' : 'current');
        return;
      }

      const actionButton = event.target.closest('button[data-board-floating-action]');
      if (!actionButton || actionButton.disabled) return;
      const action = actionButton.dataset.boardFloatingAction;
      if (action === 'cancel') elements.cancelBoardDraft.click();
      if (action === 'plan') elements.saveBoardPlan.click();
      if (action === 'current') elements.confirmBoardDraft.click();
      if (action === 'apply-plan-current') applyDisplayedBoardPlanToCurrent();
    });

    elements.equipment.addEventListener('change', event => {
      const target = event.target;
      const cell = target.closest('.equip-cell');
      if (!cell) return;
      const key = cell.dataset.equipKey;
      const equip = currentApostleState().equipment[key] || { enabled: false, enhance: 0 };
      if (target.matches('.equip-enabled')) equip.enabled = target.checked;
      if (target.matches('.equip-enhance')) equip.enhance = Number(target.value) || 0;
      currentApostleState().equipment[key] = equip;
      saveState();
      render();
    });

    elements.equipAllOn?.addEventListener('click', () => {
      setCurrentEquipmentEnabled(true);
    });

    elements.equipAllOff?.addEventListener('click', () => {
      setCurrentEquipmentEnabled(false);
    });

    elements.equipApplyEnhance?.addEventListener('click', () => {
      setCurrentEquipmentEnhance(Number(elements.equipBulkEnhance?.value) || 0);
    });

    document.querySelector('.equipment-bulk-actions')?.addEventListener('click', event => {
      const button = event.target.closest('[data-equip-bulk-action]');
      if (!button) return;
      event.preventDefault();
      const action = button.dataset.equipBulkAction || '';
      if (action === 'off') setCurrentEquipmentBulk({ enabled: false });
      if (action === 'on') setCurrentEquipmentBulk({ enabled: true });
      if (action === 'enhance') {
        setCurrentEquipmentBulk({
          enabled: true,
          enhance: Number(button.dataset.equipBulkEnhance) || 0
        });
      }
      button.closest('details')?.removeAttribute('open');
    });

    elements.researchProgressSelect.addEventListener('change', () => {
      appState.research.progress = Number(elements.researchProgressSelect.value) || 0;
      saveState();
      render();
    });

    elements.researchLevelSelect.addEventListener('change', () => {
      appState.research.level = Number(elements.researchLevelSelect.value) || 0;
      saveState();
      render();
    });

    elements.rankOverviewGrid.addEventListener('change', event => {
      const target = event.target;
      if (!target.matches('select[data-rank-apostle-id]')) return;
      const id = target.dataset.rankApostleId;
      ensureApostleState(id).rank = Number(target.value) || 1;
      if (id === view.id) elements.rankSelect.value = String(ensureApostleState(id).rank);
      saveState();
      render();
    });

    elements.rankOverviewGrid.addEventListener('click', event => {
      if (event.target.closest('select, button')) return;
      const card = event.target.closest('[data-rank-card-id]');
      if (!card) return;
      const select = card.querySelector('select[data-rank-apostle-id]');
      if (!select) return;
      select.focus();
      if (typeof select.showPicker === 'function') select.showPicker();
    });

    elements.rankOverviewSort.addEventListener('change', () => {
      view.rankSort = elements.rankOverviewSort.value || 'name';
      renderRankOverview();
    });

    elements.rankOverviewFilters.addEventListener('click', event => {
      const clearButton = event.target.closest('button[data-rank-filter-clear]');
      if (clearButton) {
        Object.values(view.rankFilters).forEach(values => values.clear());
        renderRankOverview();
        return;
      }

      const button = event.target.closest('button[data-rank-filter-group]');
      if (!button) return;
      const values = view.rankFilters[button.dataset.rankFilterGroup];
      const value = button.dataset.rankFilterValue;
      if (!values || !value) return;
      if (values.has(value)) values.delete(value);
      else values.add(value);
      renderRankOverview();
    });

    elements.bondOverviewGrid.addEventListener('change', event => {
      const target = event.target;
      if (!target.matches('select[data-bond-apostle-id]')) return;
      const id = target.dataset.bondApostleId;
      const basic = DATA.getById('basicInfo', id);
      ensureApostleState(id).bond = normalizeBondForApostle(basic, target.value);
      if (id === view.id) elements.bondSelect.value = String(ensureApostleState(id).bond);
      saveState();
      render();
    });

    elements.bondOverviewGrid.addEventListener('click', event => {
      if (event.target.closest('select, button')) return;
      const card = event.target.closest('[data-bond-card-id]');
      if (!card) return;
      if (card.classList.contains('is-bond-locked')) return;
      const select = card.querySelector('select[data-bond-apostle-id]');
      if (!select) return;
      select.focus();
      if (typeof select.showPicker === 'function') select.showPicker();
    });

    elements.bondOverviewSort.addEventListener('change', () => {
      view.bondSort = elements.bondOverviewSort.value || 'name';
      renderBondOverview();
    });

    elements.bondOverviewFilters.addEventListener('click', event => {
      const clearButton = event.target.closest('button[data-bond-filter-clear]');
      if (clearButton) {
        Object.values(view.bondFilters).forEach(values => values.clear());
        renderBondOverview();
        return;
      }

      const button = event.target.closest('button[data-bond-filter-group]');
      if (!button) return;
      const values = view.bondFilters[button.dataset.bondFilterGroup];
      const value = button.dataset.bondFilterValue;
      if (!values || !value) return;
      if (values.has(value)) values.delete(value);
      else values.add(value);
      renderBondOverview();
    });

    elements.asideOverviewGrid.addEventListener('change', event => {
      const target = event.target;
      if (!target.matches('select[data-aside-apostle-id]')) return;
      const id = target.dataset.asideApostleId;
      const state = ensureApostleState(id);
      state.asideRank = Number(target.value) || 0;
      state.asideLevel = normalizeAsideLevelForRank(state.asideLevel, state.asideRank);
      state.skillLevels = normalizeSkillLevels(state.skillLevels, state.asideRank);
      if (id === view.id) {
        syncAsideControlsFromState(state);
        syncSkillLevelControlsFromState(state);
      }
      saveState();
      render();
    });

    elements.asideOverviewGrid.addEventListener('click', event => {
      if (event.target.closest('select, button')) return;
      const card = event.target.closest('[data-aside-card-id]');
      if (!card) return;
      const select = card.querySelector('select[data-aside-apostle-id]');
      if (!select) return;
      select.focus();
      if (typeof select.showPicker === 'function') select.showPicker();
    });

    elements.asideOverviewSort.addEventListener('change', () => {
      view.asideSort = elements.asideOverviewSort.value || 'name';
      renderAsideOverview();
    });

    elements.asideOverviewFilters.addEventListener('click', event => {
      const clearButton = event.target.closest('button[data-aside-filter-clear]');
      if (clearButton) {
        Object.values(view.asideFilters).forEach(values => values.clear());
        renderAsideOverview();
        return;
      }

      const button = event.target.closest('button[data-aside-filter-group]');
      if (!button) return;
      const values = view.asideFilters[button.dataset.asideFilterGroup];
      const value = button.dataset.asideFilterValue;
      if (!values || !value) return;
      if (values.has(value)) values.delete(value);
      else values.add(value);
      renderAsideOverview();
    });

    elements.boardGlobalModeCurrent.addEventListener('click', () => switchGlobalBoardMode('current'));
    elements.boardGlobalModePlan.addEventListener('click', () => switchGlobalBoardMode('plan'));

    elements.boardGlobalSearch.addEventListener('input', () => {
      renderBoardGlobalOverview();
    });

    elements.boardGlobalSort.addEventListener('change', () => {
      view.boardGlobalSort = elements.boardGlobalSort.value || 'name';
      view.boardGlobalSortTouched = true;
      renderBoardGlobalOverview();
    });

    elements.boardGlobalOverviewList.addEventListener('click', event => {
      const apostleLink = event.target.closest('[data-board-global-open-apostle]');
      if (apostleLink) {
        const apostleId = apostleLink.dataset.boardGlobalOpenApostle;
        if (!apostleId) return;
        const globalDraft = globalBoardDrafts[apostleId];
        elements.apostleSelect.value = apostleId;
        elements.apostleSelect.dispatchEvent(new Event('change', { bubbles: true }));
        if (globalDraft) {
          view.boardEditMode = globalDraft.mode || view.boardGlobalMode;
          boardDraft = {
            apostleId,
            mode: view.boardEditMode,
            boards: cloneJson(globalDraft.boards),
            shortcutTargets: cloneJson(globalDraft.shortcutTargets || {})
          };
          view.board = findGlobalBoardDraftChangedLayer(apostleId, globalDraft) || view.board;
          render();
        }
        const boardViewButton = document.querySelector('[data-dashboard-view="board"]');
        if (boardViewButton) boardViewButton.click();
        else elements.boardGrid.scrollIntoView({ block: 'start', behavior: 'smooth' });
        return;
      }
      const button = event.target.closest('button[data-board-global-key]');
      if (!button) return;
      toggleGlobalBoardSpecial(
        button.dataset.boardGlobalApostleId,
        Number(button.dataset.boardGlobalLayer) || 1,
        button.dataset.boardGlobalKey
      );
      render();
    });

    elements.boardGlobalOverviewSummary.addEventListener('click', event => {
      const shortcutModeButton = event.target.closest('[data-board-shortcut-off-toggle]');
      if (shortcutModeButton) {
        toggleBoardShortcutOffMode();
        return;
      }

      const modeButton = event.target.closest('button[data-board-global-floating-mode]');
      if (modeButton) {
        switchGlobalBoardMode(modeButton.dataset.boardGlobalFloatingMode);
        return;
      }

      const button = event.target.closest('button[data-board-global-summary-action]');
      if (!button || button.disabled) return;
      handleBoardGlobalAction(button.dataset.boardGlobalSummaryAction);
    });

    elements.boardGlobalFilters.addEventListener('click', event => {
      const button = event.target.closest('button[data-board-global-filter-group]');
      if (!button) return;
      const group = button.dataset.boardGlobalFilterGroup;
      const value = button.dataset.boardGlobalFilterValue;
      const selected = view.boardGlobalFilters[group];
      if (!selected) return;
      if (selected.has(value)) selected.delete(value);
      else selected.add(value);
      renderBoardGlobalOverview();
    });

    elements.boardGlobalCancel.addEventListener('click', () => {
      handleBoardGlobalAction('cancel');
    });

    elements.boardGlobalSavePlan.addEventListener('click', () => {
      handleBoardGlobalAction('plan');
    });

    elements.boardGlobalConfirm.addEventListener('click', () => {
      handleBoardGlobalAction('current');
    });

    elements.boardGlobalDiscardPlan.addEventListener('click', discardAllSavedBoardPlans);

    elements.boardGrid.addEventListener('click', event => {
      const node = event.target.closest('.board-node[data-node-key]');
      if (!node) return;
      const key = node.dataset.nodeKey;
      const rows = getCurrentBoardRows();
      const row = rows.find(item => boardKey(item) === key);
      if (!row || row.マス_type === 'スタート') return;
      beginBoardDraftForLayer(view.board);
      const board = currentBoardState();
      board.targets = [];
      if (board.filled[key]) {
        delete board.filled[key];
        pruneDisconnectedBoardNodes(rows, board);
        pruneLockedBoardLayers();
      } else {
        const path = findBestBoardPath(rows, key);
        path.forEach(pathKey => {
          board.filled[pathKey] = true;
        });
      }
      render();
    });

    elements.boardSpecial.addEventListener('click', event => {
      const button = event.target.closest('button[data-board-shortcut-key]');
      if (!button || button.disabled) return;
      const layer = Number(button.dataset.boardShortcutLayer) || 1;
      const rows = getBoardRowsForLayer(layer);
      const key = button.dataset.boardShortcutKey;
      const target = rows.find(row => boardKey(row) === key);
      if (!target) return;
      beginBoardDraftForLayer(layer);
      applyBoardShortcutFromCurrentState(layer, key);
      view.board = layer;
      render();
    });
  }

  function closeBottomMenus(exceptMenu = null) {
    document.querySelectorAll('.bottom-save-menu[open], .bottom-global-menu[open]').forEach(menu => {
      if (exceptMenu && menu === exceptMenu) return;
      menu.removeAttribute('open');
    });
  }

  function syncControlsFromState() {
    const state = currentApostleState();
    const basic = DATA.getById('basicInfo', view.id);
    elements.rankSelect.value = String(state.rank);
    elements.starSelect.value = String(state.star);
    state.level = normalizeApostleLevel(state.level, state.star);
    renderLevelOptions(state.star);
    elements.levelSelect.value = String(state.level);
    state.bond = normalizeBondForApostle(basic, state.bond);
    elements.bondSelect.value = String(state.bond);
    elements.bondSelect.disabled = isBondLockedApostle(basic);
    syncAsideControlsFromState(state);
    syncSkillLevelControlsFromState(state);
    normalizeFollowForApostle(basic);
    elements.followToggle.checked = !!state.follow;
    const followLabel = elements.followToggle.closest('.follow-toggle');
    if (followLabel) followLabel.hidden = isEldainApostle(basic);
    renderCurrentApostlePicker();
  }

  function renderApostlePicker() {
    const query = elements.apostlePickerSearch.value.trim().toLocaleLowerCase('ja');
    const rows = DATA.sheets.basicInfo.filter(row => {
      const matchesQuery = !query || [row.使徒名, row.id, row.性格, row.種族, row.役割, row.配列]
        .filter(Boolean)
        .some(value => String(value).toLocaleLowerCase('ja').includes(query));
      const matchesFilters = [
        ['personality', row.性格],
        ['species', row.種族],
        ['role', row.役割],
        ['position', row.配列]
      ].every(([group, value]) => {
        const selected = view.apostleFilters[group];
        return selected.size === 0 || selected.has(value);
      });
      return matchesQuery && matchesFilters;
    }).sort(compareApostlePickerRows);
    elements.apostlePickerGrid.innerHTML = rows.map(renderApostlePickerCard).join('')
      || '<p class="empty-note">一致する使徒がいません。</p>';
  }

  function compareApostlePickerRows(a, b) {
    return compareApostleRowsBySort(a, b, view.apostleSort);
  }

  function compareApostleRowsBySort(a, b, sortKey) {
    const nameOrder = String(a.使徒名 || a.id).localeCompare(
      String(b.使徒名 || b.id),
      'ja',
      { sensitivity: 'base' }
    );
    if (sortKey === 'level') {
      const difference = ensureApostleState(b.id).level - ensureApostleState(a.id).level;
      return difference || nameOrder;
    }
    if (sortKey === 'rank') {
      const difference = ensureApostleState(b.id).rank - ensureApostleState(a.id).rank;
      return difference || nameOrder;
    }
    if (sortKey === 'combatPower') {
      const difference = getApostleCombatPowerForSort(b.id) - getApostleCombatPowerForSort(a.id);
      return difference || nameOrder;
    }
    return nameOrder;
  }

  function getApostleCombatPowerForSort(id) {
    const state = ensureApostleState(id);
    return Number(state.statSnapshots?.current?.stats?.combatPower ?? state.finalStats?.combatPower) || 0;
  }

  function formatCompactCombatPower(value) {
    const num = Math.max(0, Math.floor(Number(value) || 0));
    if (num >= 1000000) return `${(num / 1000000).toFixed(num >= 10000000 ? 0 : 1).replace(/\.0$/, '')}m`;
    if (num >= 10000) return `${(num / 1000).toFixed(num >= 100000 ? 0 : 1).replace(/\.0$/, '')}k`;
    return formatNumber(num);
  }

  function renderApostlePickerFilters() {
    const groups = getApostleFilterGroups();
    const activeCount = Object.values(view.apostleFilters)
      .reduce((total, values) => total + values.size, 0);
    elements.apostleFilterCount.textContent = activeCount ? `${activeCount}件選択中` : '';
    elements.apostlePickerFilters.innerHTML = renderApostleFilterControls(
      groups,
      view.apostleFilters,
      'apostle'
    );
  }

  function getApostleFilterGroups() {
    return [
      {
        key: 'personality',
        label: '性格',
        values: ['純粋', '冷静', '狂気', '活発', '憂鬱'],
        icon: value => `img/性格_${value}.webp`
      },
      {
        key: 'species',
        label: '種族',
        values: ['妖精', '獣人', 'エルフ', '精霊', '幽霊', '竜族', '魔女', '？？？'],
        icon: value => `img/種族_${value}.webp`
      },
      {
        key: 'role',
        label: '役割',
        values: ['守備', '攻撃', '支援'],
        icon: value => `img/役割_${getRoleAssetName(value)}.webp`
      },
      {
        key: 'position',
        label: '配置',
        values: ['前列', '中列', '後列'],
        icon: value => `img/配置列_${value}.webp`
      }
    ];
  }

  function renderApostleFilterControls(groups, filters, prefix) {
    const activeCount = Object.values(filters).reduce((total, values) => total + values.size, 0);
    return `
      <div class="apostle-filter-head">
        <span>条件を複数選択できます</span>
        <button type="button" data-${prefix}-filter-clear ${activeCount ? '' : 'disabled'}>解除</button>
      </div>
      ${groups.map(group => `
        <div class="apostle-filter-row">
          <span class="apostle-filter-label">${escapeHtml(group.label)}</span>
          <div class="apostle-filter-options">
            ${group.values.map(value => {
              const active = filters[group.key].has(value);
              return `
                <button
                  type="button"
                  class="apostle-filter-button ${active ? 'is-active' : ''}"
                  data-${prefix}-filter-group="${escapeAttr(group.key)}"
                  data-${prefix}-filter-value="${escapeAttr(value)}"
                  aria-label="${escapeAttr(group.label)}: ${escapeAttr(value)}"
                  aria-pressed="${active ? 'true' : 'false'}"
                  title="${escapeAttr(value)}"
                >
                  <img src="${escapeAttr(group.icon(value))}" alt="">
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    `;
  }

  function renderCurrentApostlePicker() {
    const basic = DATA.getById('basicInfo', view.id);
    if (!basic) {
      elements.apostlePickerCurrent.innerHTML = '<span>使徒を選択</span>';
      return;
    }
    elements.apostlePickerCurrent.innerHTML = `
      <span class="apostle-picker-current-image">
        <img data-apostle-image src="${escapeAttr(getApostleImagePath(basic.id))}" alt="">
      </span>
      <span class="apostle-picker-current-text">
        <strong>${escapeHtml(basic.使徒名 || basic.id)}</strong>
        <span class="apostle-current-badges">${renderApostleInfoBadges(basic, false)}</span>
      </span>
    `;
  }

  function renderApostlePickerCard(basic) {
    const state = ensureApostleState(basic.id);
    const selected = basic.id === view.id;
    const sortValue = view.apostleSort === 'level'
      ? `Lv ${state.level}`
      : view.apostleSort === 'rank'
        ? `Rank ${state.rank}`
        : view.apostleSort === 'combatPower'
          ? `CP ${formatCompactCombatPower(getApostleCombatPowerForSort(basic.id))}`
          : '';
    return `
      <button
        type="button"
        class="apostle-picker-card personality-${escapeAttr(basic.性格 || '')} ${selected ? 'is-selected' : ''}"
        data-apostle-picker-id="${escapeAttr(basic.id)}"
        aria-pressed="${selected ? 'true' : 'false'}"
      >
        <span class="apostle-picker-art">
          <img data-apostle-image src="${escapeAttr(getApostleImagePath(basic.id))}" alt="">
          ${renderApostleInfoBadges(basic, true)}
          ${state.follow ? '<img class="apostle-picker-follow-icon" src="img/フォロー.webp" alt="フォロー中" title="フォロー中">' : ''}
          ${sortValue ? `<span class="apostle-picker-sort-value">${escapeHtml(sortValue)}</span>` : ''}
        </span>
        <span class="apostle-picker-stars" aria-label="星${escapeAttr(state.star)}">${renderStarRating(state.star, basic.レア度)}</span>
        <strong>${escapeHtml(basic.使徒名 || basic.id)}</strong>
      </button>
    `;
  }

  function renderApostleInfoBadges(basic, overlay) {
    const personality = basic.性格 || '';
    const species = basic.種族 || '';
    const position = basic.配列 || '';
    const roleAsset = getRoleAssetName(basic.役割);
    const mode = overlay ? ' overlay' : '';
    return `
      ${personality ? `<img class="apostle-info-badge personality${mode}" src="img/性格_${escapeAttr(personality)}.webp" alt="${escapeAttr(personality)}" title="${escapeAttr(personality)}">` : ''}
      ${species ? `<img class="apostle-info-badge species${mode}" src="img/種族_${escapeAttr(species)}.webp" alt="${escapeAttr(species)}" title="${escapeAttr(species)}">` : ''}
      ${roleAsset ? `<img class="apostle-info-badge role${mode}" src="img/役割_${escapeAttr(roleAsset)}.webp" alt="${escapeAttr(basic.役割 || '')}" title="${escapeAttr(basic.役割 || '')}">` : ''}
      ${position ? `<img class="apostle-info-badge position${mode}" src="img/配置列_${escapeAttr(position)}.webp" alt="${escapeAttr(position)}" title="${escapeAttr(position)}">` : ''}
    `;
  }

  function renderStarRating(star, baseRarity) {
    const count = normalizeApostleStar(star);
    const onImage = Number(baseRarity) <= 2 ? 'Grade_on_1_2.webp' : 'Grade_on.webp';
    return Array.from({ length: APOSTLE_STAR_MAX }, (_, index) =>
      `<img src="img/${index < count ? onImage : 'Grade_off.webp'}" alt="" class="${index < count ? 'is-on' : ''}">`
    ).join('');
  }

  function getRoleAssetName(role) {
    if (role === '守備') return '防御';
    if (role === '支援') return '支援';
    if (role === '攻撃') return '攻撃';
    return '';
  }

  function getApostleImagePath(id) {
    return `img/Chara/${getApostleAssetId(id)}.webp`;
  }

  function getApostleAssetId(id) {
    const aliases = {
      ED: 'Ed',
      Cuee: 'Kyuri',
      Kyui: 'Kyuri',
      Kyuui: 'Kyuri',
      Kiwi: 'Kyuri',
      Lazy: 'Layze',
      Razy: 'Layze',
      Reizy: 'Layze',
      Selline: 'Selene',
      Shady: 'Shaydi',
      Rudd: 'Rude',
      RenewaAwaken: 'Renewa',
      Sion: 'Xion',
      sion: 'Xion',
      xion: 'Xion',
      xXionx: 'Xion'
    };
    return aliases[id] || id;
  }

  function handleApostleImageError(event) {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || !image.hasAttribute('data-apostle-image')) return;
    if (image.dataset.fallback === 'true') return;
    image.dataset.fallback = 'true';
    image.onload = () => image.classList.add('is-loaded');
    image.src = APOSTLE_IMAGE_FALLBACK;
  }

  function syncAsideControlsFromState(state) {
    state.asideRank = Number(state.asideRank) || 0;
    state.asideLevel = normalizeAsideLevelForRank(state.asideLevel, state.asideRank);
    elements.asideRankSelect.value = String(state.asideRank);
    renderAsideLevelOptions(state.asideRank);
    elements.asideLevelSelect.value = String(state.asideLevel || 0);
  }

  function renderLevelOptions(star) {
    const cap = getLevelCapForStar(star);
    elements.levelSelect.innerHTML = Array.from({ length: cap }, (_, index) => {
      const level = index + 1;
      return `<option value="${level}">Lv ${level}</option>`;
    }).join('');
  }

  function normalizeApostleLevel(level, star) {
    const cap = getLevelCapForStar(star);
    const value = Number(level) || 1;
    return Math.max(1, Math.min(cap, value));
  }

  function getLevelCapForStar(star) {
    return LEVEL_CAP_BY_STAR[normalizeApostleStar(star)] || 120;
  }

  function normalizeApostleStar(value) {
    return Math.max(1, Math.min(APOSTLE_STAR_MAX, Number(value) || 1));
  }

  function normalizeGrade(value) {
    return Math.max(1, Math.min(GRADE_MAX, Number(value) || 1));
  }

  function renderAsideLevelOptions(rank) {
    const cap = getAsideLevelCap(rank);
    if (!cap) {
      elements.asideLevelSelect.innerHTML = '<option value="0">-</option>';
      elements.asideLevelSelect.disabled = true;
      return;
    }
    elements.asideLevelSelect.disabled = false;
    elements.asideLevelSelect.innerHTML = Array.from({ length: cap }, (_, index) => {
      const level = index + 1;
      return `<option value="${level}">Lv ${level}</option>`;
    }).join('');
  }

  function normalizeAsideLevelForRank(level, rank) {
    const cap = getAsideLevelCap(rank);
    if (!cap) return 0;
    const value = Number(level) || 0;
    return Math.min(Math.max(value, 1), cap);
  }

  function getAsideLevelCap(rank) {
    return [0, 30, 40, 50][Number(rank) || 0] || 0;
  }

  function syncSkillLevelControlsFromState(state) {
    const maxLevel = getMaxSkillLevel(state.asideRank);
    state.skillLevels = normalizeSkillLevels(state.skillLevels, state.asideRank);
    [
      ['low', elements.lowSkillLevelSelect, elements.lowSkillLevelOutput],
      ['high', elements.highSkillLevelSelect, elements.highSkillLevelOutput],
      ['passive', elements.passiveSkillLevelSelect, elements.passiveSkillLevelOutput]
    ].forEach(([group, control, output]) => {
      if (!control) return;
      if (control.tagName === 'SELECT') {
        control.innerHTML = Array.from({ length: maxLevel }, (_, index) => {
          const level = index + 1;
          return `<option value="${level}">${level}</option>`;
        }).join('');
      } else {
        control.min = '1';
        control.max = String(maxLevel);
        control.step = '1';
      }
      control.value = String(state.skillLevels[group]);
      if (output) output.textContent = String(state.skillLevels[group]);
    });
    if (elements.skillLevelCapNote) elements.skillLevelCapNote.textContent = state.asideRank
      ? `A${state.asideRank}上限: ${maxLevel}`
      : `上限: ${maxLevel}`;
  }

  function normalizeSkillLevels(levels, asideRank) {
    const maxLevel = getMaxSkillLevel(asideRank);
    const source = levels && typeof levels === 'object' ? levels : {};
    return {
      low: clampSkillLevel(source.low, maxLevel),
      high: clampSkillLevel(source.high, maxLevel),
      passive: clampSkillLevel(source.passive, maxLevel)
    };
  }

  function clampSkillLevel(level, maxLevel) {
    const value = Number(level);
    return Math.max(1, Math.min(maxLevel, Number.isFinite(value) && value > 0 ? value : 1));
  }

  function getMaxSkillLevel(asideRank) {
    return 12 + Math.max(0, Math.min(3, Number(asideRank) || 0));
  }

  function normalizeBondLevel(level) {
    const value = Number(level);
    return Math.max(1, Math.min(30, Number.isFinite(value) && value > 0 ? value : 1));
  }

  function isBondLockedApostle(basic = null) {
    return Number(basic?.レア度) === 1;
  }

  function normalizeBondForApostle(basic = null, level = 1) {
    return isBondLockedApostle(basic) ? 1 : normalizeBondLevel(level);
  }

  function persistCurrentControls() {
    if (!view.id) return;
    const state = currentApostleState();
    const basic = DATA.getById('basicInfo', view.id);
    state.rank = Number(elements.rankSelect.value) || 1;
    state.star = normalizeApostleStar(elements.starSelect.value);
    state.level = normalizeApostleLevel(Number(elements.levelSelect.value) || 1, state.star);
    state.bond = normalizeBondForApostle(basic, elements.bondSelect.value);
    state.asideRank = Number(elements.asideRankSelect.value) || 0;
    state.asideLevel = normalizeAsideLevelForRank(Number(elements.asideLevelSelect.value) || 0, state.asideRank);
    state.skillLevels = normalizeSkillLevels({
      low: elements.lowSkillLevelSelect.value,
      high: elements.highSkillLevelSelect.value,
      passive: elements.passiveSkillLevelSelect.value
    }, state.asideRank);
    state.follow = !!elements.followToggle.checked;
    normalizeFollowForApostle(DATA.getById('basicInfo', view.id));
  }

  function renderStateManager() {
    const slotKey = String(view.stateSlot);
    const dirty = isCurrentStateDirty();
    const mode = getStateSlotMode();
    const modeLabels = { save: '保存先を選択', load: '読み込む状態を選択', delete: '削除する状態を選択' };
    elements.stateSlotButtons.forEach(button => {
      const key = button.dataset.stateSlot;
      const snapshot = appState.savedStates[key];
      const slotName = getStateSlotDisplayName(key, snapshot);
      const savedAt = snapshot ? formatSavedAt(snapshot.savedAt) : '未保存';
      button.classList.toggle('is-selected', key === slotKey);
      button.classList.toggle('is-current', key === slotKey);
      button.classList.toggle('is-dirty', key === slotKey && dirty);
      button.classList.toggle('has-data', !!snapshot);
      button.disabled = (mode === 'load' || mode === 'delete') && !snapshot;
      button.innerHTML = `<span class="state-slot-number">${escapeHtml(key)}</span><span class="state-slot-main"><strong>${escapeHtml(slotName)}</strong><small>${escapeHtml(savedAt)}</small></span>`;
      button.title = snapshot
        ? `${key === slotKey && dirty ? '未保存変更あり / ' : ''}${slotName} / ${formatSavedAt(snapshot.savedAt)}`
        : `スロット${key}: 空`;
    });
    const saveMenu = document.querySelector('.bottom-save-menu');
    saveMenu?.classList.toggle('is-dirty', dirty);
    if (saveMenu) {
      if (mode) saveMenu.dataset.slotMode = mode;
      else delete saveMenu.dataset.slotMode;
    }
    if (elements.stateSlotSection) elements.stateSlotSection.hidden = !mode;
    if (elements.stateSlotSectionTitle) elements.stateSlotSectionTitle.textContent = modeLabels[mode] || '操作を選択';
    if (elements.stateSaveNameWrap) elements.stateSaveNameWrap.hidden = mode !== 'save';
    if (elements.stateSlotIndicator) {
      elements.stateSlotIndicator.textContent = dirty ? `${slotKey}*` : slotKey;
      elements.stateSlotIndicator.title = dirty ? `スロット${slotKey}: 未保存変更あり` : `スロット${slotKey}`;
    }
    if (elements.stateCurrentSlot) {
      elements.stateCurrentSlot.textContent = `${dirty ? '編集中' : '読み込み中'}: ${slotKey}`;
      elements.stateCurrentSlot.classList.toggle('is-dirty', dirty);
    }
    [elements.saveStateSlot, elements.loadStateSlot, elements.deleteStateSlot].forEach(button => {
      button?.classList.toggle('is-selected', button.dataset.stateSlotMode === mode);
    });
    elements.loadStateSlot.disabled = false;
    elements.deleteStateSlot.disabled = false;
  }

  function getStateSlotMode() {
    return ['save', 'load', 'delete'].includes(view.stateSlotMode) ? view.stateSlotMode : '';
  }

  function setStateSlotMode(mode) {
    view.stateSlotMode = ['save', 'load', 'delete'].includes(mode) ? mode : '';
    if (view.stateSlotMode === 'save' && elements.stateSaveName) {
      elements.stateSaveName.value = '';
      setTimeout(() => elements.stateSaveName?.focus(), 0);
    }
    renderStateManager();
    const labels = { save: '保存する番号を選択', load: '読み込む番号を選択', delete: '削除する番号を選択' };
    if (getStateSlotMode()) showStateStatus(labels[getStateSlotMode()]);
  }

  function handleStateSlotClick(targetSlot) {
    persistCurrentControls();
    const mode = getStateSlotMode();
    if (mode === 'save') {
      saveCurrentStateToSlot(targetSlot, elements.stateSaveName?.value || '');
      return;
    }
    if (mode === 'load') {
      if (!appState.savedStates[String(targetSlot)]) {
        showStateStatus(`スロット${targetSlot}は空です`, true);
        return;
      }
      if (isCurrentStateDirty() && !window.confirm(`現在のスロット${view.stateSlot}に未保存変更があります。\n保存せずにスロット${targetSlot}を読み込みますか？`)) {
        return;
      }
      loadStateSlot(targetSlot);
      return;
    }
    if (mode === 'delete') {
      if (!appState.savedStates[String(targetSlot)]) {
        showStateStatus(`スロット${targetSlot}は空です`, true);
        return;
      }
      deleteStateSlot(targetSlot);
    }
  }

  function saveCurrentStateToSlot(slot, slotName = '') {
    persistCurrentControls();
    appState.activeId = view.id;
    const safeSlot = Number(slot) || 1;
    const previousName = appState.savedStates[String(safeSlot)]?.slotName || '';
    const normalizedName = String(slotName || '').trim() || previousName;
    view.stateSlot = safeSlot;
    appState.savedStates[String(view.stateSlot)] = createStateSnapshot(normalizedName);
    saveState();
    setStateSlotMode('');
    renderStateManager();
    showStateStatus(`スロット${view.stateSlot}に保存しました`);
  }

  function loadStateSlot(slot) {
    const safeSlot = Number(slot) || 1;
    const snapshot = appState.savedStates[String(safeSlot)];
    if (!snapshot) return;
    view.stateSlot = safeSlot;
    setStateSlotMode('');
    applyStateSnapshot(snapshot);
    showStateStatus(`スロット${safeSlot}を読み込みました`);
  }

  function deleteStateSlot(slot) {
    const safeSlot = Number(slot) || 1;
    if (!appState.savedStates[String(safeSlot)]) return;
    if (!window.confirm(`スロット${safeSlot}の保存内容を削除しますか？\nこの操作は元に戻せません。`)) return;
    delete appState.savedStates[String(safeSlot)];
    saveState();
    setStateSlotMode('');
    renderStateManager();
    showStateStatus(`スロット${safeSlot}を削除しました`);
  }

  function isCurrentStateDirty() {
    const snapshot = appState.savedStates[String(view.stateSlot)];
    if (!snapshot) return false;
    try {
      return stableStringify(createComparableCurrentState()) !== stableStringify(createComparableSnapshot(snapshot));
    } catch (_) {
      return true;
    }
  }

  function createComparableCurrentState() {
    return {
      activeId: getValidApostleId(view.id || appState.activeId),
      apostles: cloneJson(appState.apostles),
      research: cloneJson(appState.research),
      cards: cloneJson(appState.cards),
      formation: normalizeFormationState(appState.formation || createDefaultFormation()),
      totalCombatPower: normalizeFormationCoins(appState.totalCombatPower),
      activeFormationPresetId: appState.activeFormationPresetId || '',
      savedFormations: normalizeFormationPresetList(appState.savedFormations || [])
    };
  }

  function createComparableSnapshot(snapshot) {
    const normalized = normalizeStateSnapshot(snapshot);
    return {
      activeId: normalized.activeId,
      apostles: normalized.apostles,
      research: normalized.research,
      cards: normalized.cards,
      formation: normalized.formation,
      totalCombatPower: normalizeFormationCoins(normalized.totalCombatPower),
      activeFormationPresetId: normalized.activeFormationPresetId || '',
      savedFormations: normalizeFormationPresetList(normalized.savedFormations || [])
    };
  }

  function stableStringify(value) {
    return JSON.stringify(stableValue(value));
  }

  function stableValue(value) {
    if (Array.isArray(value)) return value.map(stableValue);
    if (!value || typeof value !== 'object') return value;
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = stableValue(value[key]);
      return acc;
    }, {});
  }

  function getStateSlotDisplayName(slot, snapshot) {
    if (!snapshot) return `スロット${slot}`;
    return snapshot.slotName || snapshot.apostleName || snapshot.activeId || `スロット${slot}`;
  }

  function createStateSnapshot(slotName = '') {
    const basic = DATA.getById('basicInfo', view.id);
    return {
      savedAt: new Date().toISOString(),
      slotName: String(slotName || '').trim(),
      apostleName: basic?.使徒名 || '',
      activeId: view.id || appState.activeId || '',
      apostles: cloneJson(appState.apostles),
      research: cloneJson(appState.research),
      cards: cloneJson(appState.cards),
      formation: cloneJson(appState.formation || createDefaultFormation()),
      totalCombatPower: normalizeFormationCoins(appState.totalCombatPower),
      activeFormationPresetId: appState.activeFormationPresetId || '',
      savedFormations: cloneJson(appState.savedFormations || [])
    };
  }

  function applyStateSnapshot(snapshot) {
    const normalized = normalizeStateSnapshot(snapshot);
    boardDraft = null;
    appState.activeId = normalized.activeId;
    appState.apostles = normalized.apostles;
    appState.research = normalized.research;
    appState.cards = normalized.cards;
    appState.formation = normalized.formation;
    appState.totalCombatPower = normalizeFormationCoins(normalized.totalCombatPower);
    appState.activeFormationPresetId = normalized.activeFormationPresetId || '';
    if (Array.isArray(normalized.savedFormations)) {
      appState.savedFormations = normalized.savedFormations;
    }
    view.id = getValidApostleId(appState.activeId);
    appState.activeId = view.id;
    view.board = 1;
    ensureApostleState(view.id);
    restoreSavedBoardPlan();
    elements.apostleSelect.value = view.id;
    syncControlsFromState();
    renderResearchControls();
    saveState();
    renderStateManager();
    render();
    document.dispatchEvent(new CustomEvent('stat-state-applied'));
  }

  function exportStateFile() {
    persistCurrentControls();
    appState.activeId = view.id;
    saveState();
    const payload = {
      schema: EXPORT_SCHEMA,
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      state: {
        current: createStateSnapshot(),
        savedStates: cloneJson(appState.savedStates)
      }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `trickcal-stat-state-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showStateStatus('状態を書き出しました');
  }

  function parseImportedState(payload) {
    if (!payload || typeof payload !== 'object') throw new Error('Invalid payload');
    if (payload.schema && payload.schema !== EXPORT_SCHEMA) throw new Error('Unknown schema');
    if (Number(payload.version || 1) > EXPORT_VERSION) throw new Error('Unsupported version');
    const source = payload.state?.current || payload.current || payload.state || payload;
    const current = normalizeStateSnapshot(source);
    return { current };
  }

  function applyImportedState(imported) {
    const basic = DATA.getById('basicInfo', imported.current.activeId);
    const snapshot = {
      ...cloneJson(imported.current),
      savedAt: new Date().toISOString(),
      slotName: appState.savedStates[String(view.stateSlot)]?.slotName || '',
      apostleName: basic?.使徒名 || ''
    };
    appState.savedStates[String(view.stateSlot)] = snapshot;
    applyStateSnapshot(snapshot);
  }

  function normalizeStateSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') throw new Error('Invalid state');
    const apostles = snapshot.apostles && typeof snapshot.apostles === 'object'
      ? cloneJson(snapshot.apostles)
      : {};
    const research = snapshot.research && typeof snapshot.research === 'object'
      ? cloneJson(snapshot.research)
      : {};
    const cards = snapshot.cards && typeof snapshot.cards === 'object'
      ? cloneJson(snapshot.cards)
      : {};
    const formation = snapshot.formation && typeof snapshot.formation === 'object'
      ? normalizeFormationState(snapshot.formation)
      : createDefaultFormation();
    if (!Object.keys(apostles).length && !snapshot.activeId) throw new Error('Empty state');
    return {
      slotName: snapshot.slotName || snapshot.name || '',
      activeId: getValidApostleId(snapshot.activeId),
      apostles,
      research,
      cards,
      formation,
      totalCombatPower: normalizeFormationCoins(snapshot.totalCombatPower),
      activeFormationPresetId: snapshot.activeFormationPresetId || '',
      savedFormations: Array.isArray(snapshot.savedFormations)
        ? normalizeFormationPresetList(snapshot.savedFormations)
        : null
    };
  }

  function normalizeFormationPresetList(value) {
    if (!Array.isArray(value)) return [];
    const usedLegacySlots = new Set();
    return value
      .filter(item => item && typeof item === 'object' && item.formation)
      .map(item => {
        let favoriteSlot = normalizeFavoriteSlot(item.favoriteSlot);
        if (!favoriteSlot && item.favorite) {
          favoriteSlot = createNumberOptions(1, 6).find(option => !usedLegacySlots.has(option.value))?.value || 0;
        }
        if (favoriteSlot) usedLegacySlots.add(favoriteSlot);
        return {
          id: item.id || `formation_${Math.random().toString(36).slice(2, 9)}`,
          name: item.name || '無題の編成',
          tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : parseFormationTags(item.tags || ''),
          favoriteSlot,
          savedAt: item.savedAt || '',
          formation: normalizeFormationState(item.formation)
        };
      });
  }

  function normalizeFavoriteSlot(value) {
    const num = Number(value);
    if (!Number.isInteger(num) || num < 1 || num > 6) return 0;
    return num;
  }

  function getValidApostleId(id) {
    return DATA.getById('basicInfo', id)?.id || DATA.sheets.basicInfo[0]?.id || '';
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function formatSavedAt(value) {
    if (!value) return '日時不明';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '日時不明';
    return date.toLocaleString('ja-JP');
  }

  function showStateStatus(message, isError = false) {
    window.clearTimeout(stateStatusTimer);
    elements.stateStatus.textContent = message;
    elements.stateStatus.classList.toggle('is-error', isError);
    stateStatusTimer = window.setTimeout(() => {
      elements.stateStatus.textContent = '';
      elements.stateStatus.classList.remove('is-error');
    }, 3200);
  }

  function render() {
    if (renderTimer) {
      window.clearTimeout(renderTimer);
      renderTimer = 0;
    }
    const basic = DATA.getById('basicInfo', view.id);
    const equipment = DATA.getById('equipment', view.id);
    const rankBonus = DATA.getById('rankGlobalBonuses', view.id);
    const boardRows = DATA.getById('board', view.id) || [];
    const totals = createEmptyTotals();
    const breakdown = createBreakdownTotals();
    const globalPercentBonuses = createEmptyTotals();
    const globalPercentRates = createEmptyTotals();
    const activeEffects = [];
    normalizeFollowForApostle(basic);

    elements.boardTabs.forEach(button => {
      const board = Number(button.dataset.board) || 1;
      const unlocked = isBoardLayerUnlocked(board);
      button.classList.toggle('is-active', board === view.board);
      button.classList.toggle('is-locked', !unlocked);
      button.disabled = false;
      button.title = unlocked ? `ボード${board}` : `ボード${board}（未解放・閲覧のみ）`;
    });
    elements.boardStage.classList.remove('board-layer-1', 'board-layer-2', 'board-layer-3');
    elements.boardStage.classList.add(`board-layer-${view.board}`);
    elements.boardStage.classList.toggle('is-plan-mode', view.boardEditMode === 'plan');
    elements.boardStage.classList.toggle('is-preview', !isBoardLayerUnlocked(view.board));
    elements.fillBoard.disabled = false;
    elements.clearBoard.disabled = false;
    const draftChanged = hasBoardDraftChanges();
    const planMode = view.boardEditMode === 'plan';
    elements.boardModeCurrent.classList.toggle('is-active', !planMode);
    elements.boardModePlan.classList.toggle('is-active', planMode);
    elements.confirmBoardDraft.hidden = planMode;
    elements.confirmBoardDraft.disabled = planMode || !draftChanged;
    elements.saveBoardPlan.disabled = !draftChanged;
    elements.saveBoardPlan.textContent = planMode ? '予定を保存' : (hasSavedBoardPlan() ? '予定に追加保存' : '予定として保存');
    elements.cancelBoardDraft.disabled = !hasBoardDraft() && !(planMode && hasSavedBoardPlan());
    elements.cancelBoardDraft.textContent = hasBoardDraft() ? '編集を取消' : '予定を削除';
    syncBoardShortcutOffToggle();

    renderProfile(basic);
    renderSkillInfoList(basic);
    renderAsideInfoList(basic);
    renderAsideTierList(basic);
    applyBaseStats(basic, totals, activeEffects, breakdown);
    applyRankUpBonuses(basic, totals, activeEffects, breakdown);
    renderEquipment(equipment, totals, breakdown);
    applyBondBonus(totals, currentApostleState().bond, activeEffects, breakdown);
    applyAsideManifestBonus(basic, totals, activeEffects, breakdown);
    renderBaseTypes(basic);
    renderRankBonuses(rankBonus);
    applyAllRankGlobalBonuses(totals, activeEffects, breakdown);
    renderActiveResearch(basic, totals, activeEffects, breakdown);
    renderRankOverview();
    renderBondOverview();
    renderAsideOverview();
    if (isCardManagerPanelActive()) renderCardManager();
    if (isDashboardPanelActive('formation')) renderFormation();
    renderBoardGlobalOverview();
    renderBoardSpecial(boardRows);
    renderBoard(boardRows, totals, activeEffects, breakdown, globalPercentBonuses);
    collectBoardEffects(totals, activeEffects, breakdown, globalPercentBonuses);
    collectAsideLevel3GlobalEffects(globalPercentBonuses, activeEffects);
    collectFollowGlobalPercent(globalPercentBonuses, activeEffects);
    applyGlobalPercentBonuses(totals, globalPercentBonuses, activeEffects, breakdown, globalPercentRates);
    updateStatSnapshots(basic, totals, breakdown, globalPercentRates);
    renderTotals(totals, activeEffects);
    renderStatBreakdown(breakdown, totals, globalPercentRates);
  }

  function scheduleRender(delay = 80) {
    if (renderTimer) window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(() => {
      renderTimer = 0;
      render();
    }, Math.max(0, Number(delay) || 0));
  }

  function renderProfileQuick() {
    const basic = DATA.getById('basicInfo', view.id);
    renderProfile(basic);
  }

  function renderSkillLevelChange() {
    const basic = DATA.getById('basicInfo', view.id);
    renderProfile(basic);
    renderSkillInfoList(basic);
  }

  function persistCardManagerChange(cardId = '') {
    saveState({ refreshSnapshots: false });
    if (cardId && updateCardManagerCardInPlace(cardId)) return;
    renderCardManager();
  }

  function updateCardManagerCardInPlace(cardId) {
    const kind = view.cardManager.kind === 'spell' ? 'spell' : 'artifact';
    if (view.cardManager.ownedOnly) return false;
    const grid = elements.cardManagerGrid?.querySelector(`[data-card-manager-kind-grid="${kind}"]`);
    const cardElement = Array.from(grid?.querySelectorAll('.resource-card[data-card-id]') || [])
      .find(element => element.dataset.cardId === cardId);
    const cards = getCardManagerCards(kind);
    const rows = getVisibleCardManagerCards(kind);
    const card = rows.find(item => item.id === cardId);
    if (!grid || !cardElement || !card) return false;
    const index = rows.findIndex(item => item.id === cardId);
    const anchorTop = cardElement.getBoundingClientRect().top;
    cardElement.outerHTML = renderCardManagerCard(card, Math.max(0, index));
    grid.dataset.renderKey = getCardManagerRenderKey(kind, rows);
    renderCardManagerSummary(kind, cards, rows);
    requestAnimationFrame(() => {
      const nextCard = Array.from(grid.querySelectorAll('.resource-card[data-card-id]') || [])
        .find(element => element.dataset.cardId === cardId);
      if (!nextCard) return;
      const nextTop = nextCard.getBoundingClientRect().top;
      if (!Number.isFinite(nextTop)) return;
      window.scrollBy(0, nextTop - anchorTop);
    });
    return true;
  }

  function renderProfile(basic) {
    if (!basic) return;
    const eldain = String(basic.エルダイン || '').trim();
    const state = currentApostleState();
    elements.name.innerHTML = `
      <span class="profile-name-stack">
        <button type="button" class="profile-grade-name-row" data-profile-grade-cycle aria-label="学年 ${escapeAttr(normalizeGrade(state.grade))}年生。クリックで変更" title="学年 ${escapeAttr(normalizeGrade(state.grade))}年生">
          ${renderGradeIcons(state.grade)}
        </button>
        <span class="profile-name-line">
          <span>${escapeHtml(basic.使徒名 || basic.id)}</span>
          ${eldain ? `<span class="apostle-name-tag">${escapeHtml(eldain)}</span>` : ''}
        </span>
        ${renderProfileCombatPower(currentApostleCombatPower())}
      </span>
    `;
    setProfileVisualClasses(basic, state);
    elements.meta.innerHTML = `
      <span class="profile-meta-main">
        <span class="profile-meta-icons">
          ${renderApostleInfoBadges(basic, false)}
          ${basic.攻撃タイプ ? `<img class="apostle-info-badge attack-type" src="img/Attack_${basic.攻撃タイプ === '物理' ? 'phys' : 'mag'}.webp" alt="${escapeAttr(basic.攻撃タイプ)}攻撃" title="${escapeAttr(basic.攻撃タイプ)}攻撃">` : ''}
        </span>
        <span class="profile-star-follow-row">
          <span class="profile-stars profile-stars-editable" aria-label="星${escapeAttr(state.star)}">${renderProfileStarButtons(state.star, basic.レア度)}</span>
          ${renderProfileFollowButton(basic, state)}
        </span>
      </span>
    `;
    const chipHtml = `<span class="profile-meta-bottomline">${renderProfileMetaChips(state)}</span>`;
    if (elements.profileChipRow) {
      elements.profileChipRow.innerHTML = chipHtml;
    } else {
      elements.meta.insertAdjacentHTML('beforeend', chipHtml);
    }

    const imagePath = getApostleImagePath(basic.id);
    if (elements.image.getAttribute('src') !== imagePath) {
      elements.image.dataset.fallback = 'false';
      elements.image.src = imagePath;
    }
    elements.image.alt = basic.使徒名 || basic.id;
    renderProfileFollowIcon(basic, state);
    renderProfileAsideIcon(basic, state);
  }

  function setProfileVisualClasses(basic, state) {
    const personalityClasses = ['純粋', '冷静', '狂気', '活発', '憂鬱'].map(name => `personality-${name}`);
    const equipmentPanel = elements.equipment?.closest('[data-dashboard-panel="equipment"]');
    elements.profileCard?.classList.remove(...personalityClasses);
    if (basic?.性格) elements.profileCard?.classList.add(`personality-${basic.性格}`);
    if (!equipmentPanel) return;
    const rankClasses = ['rank-gray', 'rank-green', 'rank-blue', 'rank-purple', 'rank-gold'];
    equipmentPanel.classList.remove(...personalityClasses, ...rankClasses);
    if (basic?.性格) equipmentPanel.classList.add(`personality-${basic.性格}`);
    const rank = Number(state?.rank) || 1;
    const rankTone = rank >= 9
      ? 'rank-gold'
      : rank >= 7
        ? 'rank-purple'
        : rank >= 5
          ? 'rank-blue'
          : rank >= 3
            ? 'rank-green'
            : 'rank-gray';
    equipmentPanel.classList.add(rankTone);
  }

  function renderProfileFollowButton(basic, state) {
    if (isEldainApostle(basic)) return '';
    const enabled = !!state.follow;
    return `
      <button type="button" id="profile-follow-button" class="profile-follow-button ${enabled ? 'is-active' : ''}" aria-pressed="${enabled ? 'true' : 'false'}" title="${enabled ? 'フォロー中: クリックで解除' : 'フォローなし: クリックで適用'}">
        <img id="profile-follow-icon" src="img/フォロー.webp" alt="">
        <span>フォロー</span>
      </button>
    `;
  }

  function renderProfileMetaChips(state) {
    const basic = DATA.getById('basicInfo', view.id);
    const bondLocked = isBondLockedApostle(basic);
    const skills = state.skillLevels || {};
    const chips = [
      renderProfileMetaSelectChip('Lv', 'level', state.level, createNumberOptions(1, getLevelCapForStar(state.star)), 'level'),
      renderProfileMetaSelectChip('Rank', 'rank', state.rank, createNumberOptions(1, 9), 'rank'),
      renderProfileMetaSelectChip('好感度Lv', 'bond', state.bond, createNumberOptions(1, 30), 'bond', bondLocked)
    ];
    if (Number(state.asideRank) || 0) {
      chips.push(renderProfileMetaSelectChip('アサイド', 'asideRank', state.asideRank, [
        { value: 0, label: '未' },
        { value: 1, label: 'A1' },
        { value: 2, label: 'A2' },
        { value: 3, label: 'A3' }
      ], 'aside'));
      chips.push(renderProfileMetaSelectChip(
        'アサイドLv',
        'asideLevel',
        state.asideLevel,
        createNumberOptions(1, getAsideLevelCap(state.asideRank)),
        'aside-level'
      ));
    }
    chips.push(`
      <span class="profile-meta-chip profile-meta-chip-skill">
        <small>SLv</small>
        <strong class="profile-skill-levels">
          ${renderProfileMiniSelect('低', 'skillLow', skills.low ?? 1, createNumberOptions(1, getMaxSkillLevel(state.asideRank)))}
          ${renderProfileMiniSelect('高', 'skillHigh', skills.high ?? 1, createNumberOptions(1, getMaxSkillLevel(state.asideRank)))}
          ${renderProfileMiniSelect('P', 'skillPassive', skills.passive ?? 1, createNumberOptions(1, getMaxSkillLevel(state.asideRank)))}
        </strong>
      </span>
    `);
    return `<span class="profile-meta-values">${chips.join('')}</span>`;
  }

  function renderProfileMetaSelectChip(label, field, value, options, tone = '', disabled = false) {
    return `
      <span class="profile-meta-chip${tone ? ` profile-meta-chip-${escapeAttr(tone)}` : ''}${disabled ? ' is-disabled' : ''}">
        <small>${escapeHtml(disabled ? `${label}固定` : label)}</small>
        <select class="profile-meta-select" data-profile-field="${escapeAttr(field)}" aria-label="${escapeAttr(label)}" ${disabled ? 'disabled' : ''}>
          ${renderOptions(options, value)}
        </select>
      </span>
    `;
  }

  function renderProfileGradeChip(value) {
    const grade = normalizeGrade(value);
    return `
      <span class="profile-meta-chip profile-meta-chip-grade">
        <small>学年</small>
        <span class="profile-grade-icons" aria-hidden="true">${renderGradeIcons(grade)}</span>
        <select class="profile-meta-select" data-profile-field="grade" aria-label="学年">
          ${renderOptions(createGradeOptions(), grade)}
        </select>
      </span>
    `;
  }

  function cycleProfileGrade() {
    const state = currentApostleState();
    state.grade = normalizeGrade((Number(state.grade) || 1) + 1 > GRADE_MAX ? 1 : (Number(state.grade) || 1) + 1);
    state.gradeConfigured = true;
    saveState({ renderStateManager: false });
    renderProfileQuick();
    scheduleRender();
  }

  function renderProfileCombatPower(value) {
    return `
      <span class="profile-combat-power" title="戦闘力">
        <img src="img/c_pow.webp" alt="戦闘力">
        <strong data-profile-combat-power-value>${escapeHtml(formatNumber(value))}</strong>
      </span>
    `;
  }

  function updateProfileCombatPowerDisplay(value = currentApostleCombatPower()) {
    elements.name?.querySelectorAll('[data-profile-combat-power-value]')
      .forEach(node => { node.textContent = formatNumber(value); });
  }

  function renderGradeIcons(value) {
    const grade = normalizeGrade(value);
    const image = grade >= 6 ? '学年_2.webp' : '学年_1.webp';
    return `<span class="grade-icon-set ${grade >= 6 ? 'is-grade-max' : ''}">${Array.from({ length: grade }, () => `<img src="img/${image}" alt="">`).join('')}</span>`;
  }

  function renderProfileMiniSelect(label, field, value, options) {
    return `
      <label>
        <span>${escapeHtml(label)}</span>
        <select data-profile-field="${escapeAttr(field)}" aria-label="SLv ${escapeAttr(label)}">
          ${renderOptions(options, value)}
        </select>
      </label>
    `;
  }

  function createNumberOptions(start, end) {
    const first = Number(start) || 0;
    const last = Math.max(first, Number(end) || first);
    return Array.from({ length: last - first + 1 }, (_, index) => {
      const value = first + index;
      return { value, label: String(value) };
    });
  }

  function createGradeOptions() {
    return Array.from({ length: GRADE_MAX }, (_, index) => {
      const grade = index + 1;
      return { value: grade, label: `${grade}年生` };
    });
  }

  function renderOptions(options, selectedValue) {
    return (options || []).map(option => {
      const value = typeof option === 'object' ? option.value : option;
      const label = typeof option === 'object' ? option.label : option;
      return `<option value="${escapeAttr(value)}" ${String(value) === String(selectedValue) ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    }).join('');
  }

  function renderProfileStarButtons(star, baseRarity) {
    const count = normalizeApostleStar(star);
    const onImage = Number(baseRarity) <= 2 ? 'Grade_on_1_2.webp' : 'Grade_on.webp';
    return Array.from({ length: APOSTLE_STAR_MAX }, (_, index) => {
      const value = index + 1;
      return `
        <button type="button" data-profile-star="${value}" aria-label="★${value}に変更" aria-pressed="${value <= count ? 'true' : 'false'}">
          <img src="img/${index < count ? onImage : 'Grade_off.webp'}" alt="" class="${index < count ? 'is-on' : ''}">
        </button>
      `;
    }).join('');
  }

  function setProfileStar(star) {
    const state = currentApostleState();
    state.star = normalizeApostleStar(star);
    state.level = normalizeApostleLevel(state.level, state.star);
    renderLevelOptions(state.star);
    elements.starSelect.value = String(state.star);
    elements.levelSelect.value = String(state.level);
    saveState({ renderStateManager: false });
    renderProfileQuick();
    scheduleRender();
  }

  function ensureStarForAsideManifest(state) {
    if (!state || !(Number(state.asideRank) || 0)) return;
    if (normalizeApostleStar(state.star) >= APOSTLE_STAR_MAX) return;
    state.star = APOSTLE_STAR_MAX;
    state.level = normalizeApostleLevel(state.level, state.star);
    renderLevelOptions(state.star);
    elements.starSelect.value = String(state.star);
    elements.levelSelect.value = String(state.level);
  }

  function updateProfileField(field, rawValue) {
    const state = currentApostleState();
    const value = Number(rawValue) || 0;
    if (field === 'level') {
      state.level = normalizeApostleLevel(value, state.star);
      elements.levelSelect.value = String(state.level);
    } else if (field === 'grade') {
      state.grade = normalizeGrade(value);
      state.gradeConfigured = true;
    } else if (field === 'rank') {
      state.rank = Math.max(1, Math.min(9, value));
      elements.rankSelect.value = String(state.rank);
    } else if (field === 'bond') {
      state.bond = normalizeBondForApostle(DATA.getById('basicInfo', view.id), value);
      elements.bondSelect.value = String(state.bond);
    } else if (field === 'asideRank') {
      state.asideRank = Math.max(0, Math.min(3, value));
      state.asideLevel = normalizeAsideLevelForRank(state.asideLevel, state.asideRank);
      state.skillLevels = normalizeSkillLevels(state.skillLevels, state.asideRank);
      ensureStarForAsideManifest(state);
      syncAsideControlsFromState(state);
      syncSkillLevelControlsFromState(state);
    } else if (field === 'asideLevel') {
      state.asideLevel = normalizeAsideLevelForRank(value, state.asideRank);
      elements.asideLevelSelect.value = String(state.asideLevel || 0);
    } else if (field === 'skillLow' || field === 'skillHigh' || field === 'skillPassive') {
      const key = field === 'skillLow' ? 'low' : field === 'skillHigh' ? 'high' : 'passive';
      state.skillLevels = normalizeSkillLevels({
        ...state.skillLevels,
        [key]: value
      }, state.asideRank);
      syncSkillLevelControlsFromState(state);
      saveState({ renderStateManager: false });
      renderSkillLevelChange();
      scheduleRender();
      return;
    } else {
      return;
    }
    saveState({ renderStateManager: false });
    renderProfileQuick();
    scheduleRender();
  }

  function toggleProfileAsideRank() {
    const basic = DATA.getById('basicInfo', view.id);
    if (!basic || !hasAsideEffects(basic.id)) return;
    const state = currentApostleState();
    if (Number(state.asideRank) || 0) {
      if (!window.confirm('アサイド発現をOFFにしますか？\nアサイドLvは0に戻ります。')) return;
      state.asideRank = 0;
      state.asideLevel = 0;
    } else {
      state.asideRank = 1;
      state.asideLevel = Math.max(1, normalizeAsideLevelForRank(state.asideLevel, state.asideRank));
      ensureStarForAsideManifest(state);
    }
    state.skillLevels = normalizeSkillLevels(state.skillLevels, state.asideRank);
    syncAsideControlsFromState(state);
    syncSkillLevelControlsFromState(state);
    saveState();
    render();
  }

  function activateDashboardView(name) {
    const viewName = name || 'settings';
    if (viewName === 'global') syncBoardDraftToGlobalDraft();
    if (viewName === 'board') syncGlobalDraftToBoardDraft(view.id);
    elements.dashboardViewButtons.forEach(button => {
      button.classList.toggle('is-active', button.dataset.dashboardView === viewName);
    });
    elements.dashboardPanels.forEach(panel => {
      panel.classList.toggle('is-active', panel.dataset.dashboardPanel === viewName);
    });
    if (viewName !== 'global') {
      updateGlobalOpenActiveButton('');
      updateCardManagerQuickButtons('');
    }
    if (viewName === 'formation') renderFormation();
    if (viewName === 'global' && isGlobalSettingPanelActive('cards')) renderCardManager();
  }

  function openGlobalSettingPanel(tab = 'research', options = {}) {
    syncBoardDraftToGlobalDraft();
    activateDashboardView('global');
    elements.globalSettingTabs.forEach(item => item.classList.toggle('is-active', item.dataset.settingTab === tab));
    elements.globalSettingPanels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.settingPanel === tab));
    updateGlobalOpenActiveButton(tab);
    if (tab === 'board-global') renderBoardGlobalOverview();
    if (tab === 'cards') renderCardManager();
    if (options.scroll !== false) scrollGlobalSettingIntoView(tab);
  }

  function openCardManagerPanel(kind = 'artifact', options = {}) {
    const safeKind = kind === 'spell' ? 'spell' : 'artifact';
    view.cardManager.kind = safeKind;
    elements.cardManagerTabs.forEach(item => item.classList.toggle('is-active', item.dataset.cardKind === safeKind));
    openGlobalSettingPanel('cards', { scroll: false });
    updateGlobalOpenActiveButton('');
    updateCardManagerQuickButtons(safeKind);
    renderCardManager();
    if (options.scroll !== false) scrollGlobalSettingIntoView('cards');
  }

  function applyInitialDashboardRoute() {
    const params = new URLSearchParams(window.location.search);
    const card = params.get('card');
    const global = params.get('global');
    const targetView = params.get('view');
    if (card) {
      openCardManagerPanel(card, { scroll: true });
    } else if (global) {
      openGlobalSettingPanel(global, { scroll: true });
    } else if (targetView) {
      activateDashboardView(targetView);
      if (targetView === 'formation') {
        document.querySelector('[data-dashboard-panel="formation"]')?.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
      }
    }
  }

  function isDashboardPanelActive(name) {
    return !!document.querySelector(`[data-dashboard-panel="${name}"]`)?.classList.contains('is-active');
  }

  function isGlobalSettingPanelActive(name) {
    return !!document.querySelector(`[data-setting-panel="${name}"]`)?.classList.contains('is-active');
  }

  function isCardManagerPanelActive() {
    return isDashboardPanelActive('global') && isGlobalSettingPanelActive('cards');
  }

  function updateGlobalOpenActiveButton(tab) {
    document.querySelectorAll('[data-open-global]').forEach(button => {
      button.classList.toggle('is-active', !!tab && button.dataset.openGlobal === tab);
    });
    document.querySelectorAll('.bottom-global-menu').forEach(menu => {
      menu.classList.toggle('is-active', ['rank', 'aside', 'research'].includes(tab));
    });
    if (tab !== 'cards') updateCardManagerQuickButtons('');
  }

  function updateCardManagerQuickButtons(kind = '') {
    document.querySelectorAll('[data-open-card-manager]').forEach(button => {
      button.classList.toggle('is-active', !!kind && button.dataset.openCardManager === kind && isDashboardPanelActive('global'));
    });
  }

  function scrollGlobalSettingIntoView(tab, options = {}) {
    const panel = elements.globalSettingPanels.find(item => item.dataset.settingPanel === tab)
      || document.querySelector('.global-settings-panel');
    if (!panel) return;
    window.requestAnimationFrame(() => {
      panel.scrollIntoView({
        block: options.block || 'start',
        inline: 'nearest',
        behavior: 'smooth'
      });
    });
  }

  function renderProfileFollowIcon(basic, state) {
    const followButton = elements.meta?.querySelector('#profile-follow-button');
    if (!followButton || isEldainApostle(basic)) return;
    const enabled = !!state.follow;
    followButton.classList.toggle('is-active', enabled);
    followButton.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    followButton.title = enabled ? 'フォロー中: クリックで解除' : 'フォローなし: クリックで適用';
  }

  function renderProfileAsideIcon(basic, state) {
    if (!elements.profileAsideIcon || !basic) return;
    const hasAside = hasAsideEffects(basic.id);
    elements.profileAsideIcon.hidden = !hasAside;
    if (!hasAside) return;
    const src = `img/Chara/Aside/AsideIcon_${escapeAttr(getApostleAssetId(basic.id))}.webp`;
    elements.profileAsideIcon.classList.remove('is-loaded');
    elements.profileAsideIcon.onload = () => {
      elements.profileAsideIcon.classList.add('is-loaded');
    };
    elements.profileAsideIcon.dataset.fallback = 'false';
    elements.profileAsideIcon.src = src;
    if (elements.profileAsideIcon.complete && elements.profileAsideIcon.naturalWidth) {
      elements.profileAsideIcon.classList.add('is-loaded');
    }
    elements.profileAsideIcon.alt = `${basic.使徒名 || basic.id} アサイド`;
    elements.profileAsideIcon.tabIndex = 0;
    elements.profileAsideIcon.setAttribute('role', 'button');
    elements.profileAsideIcon.setAttribute('aria-pressed', state.asideRank ? 'true' : 'false');
    elements.profileAsideIcon.classList.toggle('is-inactive', !(Number(state.asideRank) || 0));
    elements.profileAsideIcon.title = state.asideRank
      ? `A${state.asideRank} 発現中: クリックでOFF`
      : 'アサイド未発現: クリックでA1発現';
  }

  function normalizeFollowForApostle(basic) {
    if (!basic || !isEldainApostle(basic)) return;
    currentApostleState().follow = false;
  }

  function isEldainApostle(basic) {
    return !!String(basic?.エルダイン || '').trim();
  }

  function renderSkillInfoList(basic) {
    if (!elements.skillInfoList || !basic) return;
    const rows = DATA.getById('skills', basic.id) || [];
    if (!rows.length) {
      elements.skillInfoList.innerHTML = '<p class="muted-line">スキル情報がありません。</p>';
      return;
    }

    const state = currentApostleState();
    const grouped = groupRowsBy(rows, row => `${row.スキル種別 || 'その他'}\u0001${row.スキル名 || ''}`);
    const entries = Array.from(grouped.entries()).sort(([a], [b]) => getSkillKindOrder(a) - getSkillKindOrder(b));
    elements.skillInfoList.innerHTML = entries.map(([key, items]) => {
      const [kind, name] = key.split('\u0001');
      const first = items[0] || {};
      const level = getSkillLevelForKind(kind, state);
      const label = getSkillKindLabel(kind);
      const iconHtml = getSkillInfoIconHtml(kind, basic);
      const effectRows = items
        .map(row => formatEffectSummary(row, level))
        .filter(Boolean)
        .slice(0, 4);
      return `
        <article class="skill-info-card">
          <div class="skill-info-icon">${iconHtml}</div>
          <div class="skill-info-body">
            <div class="skill-info-title">
              <strong>${escapeHtml(label || 'スキル')}</strong>
              ${name && name !== label ? `<span>${escapeHtml(name)}</span>` : ''}
              ${level ? `<em>SLv ${level}</em>` : ''}
            </div>
            ${first.説明 ? `<p>${escapeHtml(first.説明)}</p>` : ''}
            ${effectRows.length ? `<div class="skill-info-effects">${effectRows.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  function renderAsideInfoList(basic) {
    if (!elements.asideInfoList || !basic) return;
    const statRows = DATA.getById('asideStatEffects', basic.id) || [];
    const specialRows = DATA.getById('asideSpecialEffects', basic.id) || [];
    const rows = [...statRows, ...specialRows];
    if (!rows.length) {
      elements.asideInfoList.innerHTML = '<p class="muted-line">アサイド情報がありません。</p>';
      return;
    }

    const asideName = rows.find(row => row.アサイド名)?.アサイド名 || 'アサイド';
    const assetId = getApostleAssetId(basic.id);
    const grouped = groupRowsBy(rows, row => String(row.SLv ?? row.Lv ?? ''));
    elements.asideInfoList.innerHTML = `
      <article class="aside-info-card aside-info-overview">
        <div class="aside-info-icon">
          <img data-apostle-image src="img/Chara/Aside/AsideIcon_${escapeAttr(assetId)}.webp" alt="">
        </div>
        <div class="aside-info-body">
          <strong>${escapeHtml(asideName)}</strong>
          <span>${escapeHtml(basic.使徒名 || basic.id)}のアサイド情報</span>
        </div>
      </article>
      ${[1, 2, 3].map(rank => renderAsideRankInfoCard(rank, grouped.get(String(rank)) || [], assetId)).join('')}
    `;
  }

  function renderAsideRankInfoCard(rank, rows, assetId) {
    const iconHtml = `
      <div class="aside-info-icon aside-rank-icon">
        <img data-apostle-image src="img/Chara/Aside/Aside_Skill_${escapeAttr(assetId)}_${rank}.webp" alt="">
        <span>A${rank}</span>
      </div>
    `;
    if (!rows.length) {
      return `
        <article class="aside-info-card is-empty">
          ${iconHtml}
          <div class="aside-info-body"><strong>A${rank}</strong><span>情報なし</span></div>
        </article>
      `;
    }
    const first = rows[0] || {};
    const effectRows = rows
      .map(row => formatEffectSummary(row))
      .filter(Boolean)
      .slice(0, 4);
    return `
      <article class="aside-info-card">
        ${iconHtml}
        <div class="aside-info-body">
          <strong>${escapeHtml(first.Lv内名前 || `A${rank}`)}</strong>
          ${first.効果説明 ? `<p>${escapeHtml(first.効果説明)}</p>` : ''}
          ${effectRows.length ? `<div class="skill-info-effects">${effectRows.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : ''}
        </div>
      </article>
    `;
  }

  function renderAsideTierList(basic) {
    if (!elements.asideTierList) return;
    if (!basic || !hasAsideEffects(basic.id)) {
      elements.asideTierList.innerHTML = '<p class="empty-note">アサイド情報なし</p>';
      return;
    }

    const tier = DATA.getById('asideTiers', basic.id);
    if (!tier) {
      elements.asideTierList.innerHTML = '<p class="empty-note">アサイドTier未設定</p>';
      return;
    }

    const attackType = String(basic.攻撃タイプ || basic['攻撃Type'] || '').trim();
    const attackLabel = attackType === '魔法' ? '魔法攻撃' : '物理攻撃';
    const rows = [
      ['HP', getFirstRowValue(tier, ['HPタイプ', 'HPTier', 'HP AsideTier', 'HP\nAsideTier'])],
      [attackLabel, getFirstRowValue(tier, ['攻撃力タイプ', 'ATKTier', 'ATK AsideTier', 'ATK\nAsideTier'])],
      ['物理防御', getFirstRowValue(tier, ['物理防御力タイプ', 'DEFTier', 'DEF AsideTier', 'DEF\nAsideTier'])],
      ['魔法防御', getFirstRowValue(tier, ['魔法防御力タイプ', 'MDEFTier', 'DEF AsideTier', 'DEF\nAsideTier'])]
    ];

    elements.asideTierList.innerHTML = `
      <table class="compact-table aside-tier-table">
        <thead><tr><th>ステータス</th><th>Tier</th></tr></thead>
        <tbody>
          ${rows.map(([label, value]) => `
            <tr>
              <th>${escapeHtml(label)}</th>
              <td>${value ? `Tier ${escapeHtml(value)}` : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function getFirstRowValue(row, keys) {
    for (const key of keys) {
      const value = row?.[key];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    const entries = Object.entries(row || {});
    for (const [key, value] of entries) {
      if (value === undefined || value === null || value === '') continue;
      const normalized = key.replace(/\s+/g, '').toLowerCase();
      if (keys.some(candidate => normalized === String(candidate).replace(/\s+/g, '').toLowerCase())) return value;
    }
    return '';
  }

  function getSkillIconCode(kind) {
    if (String(kind).includes('低学年')) return 'F';
    if (String(kind).includes('高学年')) return 'S';
    if (String(kind).includes('パッシブ')) return 'P';
    return '';
  }

  function getSkillInfoIconHtml(kind, basic) {
    const iconCode = getSkillIconCode(kind);
    if (iconCode) {
      return `<img data-apostle-image src="img/Chara/Skill/Skill_${iconCode}_${escapeAttr(getApostleAssetId(basic.id))}.webp" alt="">`;
    }
    if (String(kind).includes('普通攻撃')) {
      const attackAsset = basic.攻撃タイプ === '物理' ? 'Physic' : 'Magic';
      return `<img src="img/NormalAttack_${attackAsset}.webp" alt="${escapeAttr(basic.攻撃タイプ || '')}通常攻撃">`;
    }
    return `<span class="skill-info-icon-placeholder">${escapeHtml(String(kind || ''))[0] || '?'}</span>`;
  }

  function getSkillKindLabel(kind) {
    const value = String(kind || '');
    if (value.includes('普通攻撃_基本')) return '基本';
    if (value.includes('普通攻撃_強化')) return '強化';
    if (value.includes('低学年')) return '低学年';
    if (value.includes('高学年')) return '高学年';
    if (value.includes('パッシブ')) return 'パッシブ';
    return value;
  }

  function getSkillKindOrder(key) {
    const kind = String(key || '');
    if (kind.includes('普通攻撃_基本')) return 10;
    if (kind.includes('普通攻撃_強化')) return 20;
    if (kind.includes('低学年')) return 30;
    if (kind.includes('高学年')) return 40;
    if (kind.includes('パッシブ')) return 50;
    return 90;
  }

  function getSkillLevelForKind(kind, state) {
    const value = String(kind || '');
    if (value.includes('低学年')) return Number(state.skillLevels?.low) || 1;
    if (value.includes('高学年')) return Number(state.skillLevels?.high) || 1;
    if (value.includes('パッシブ')) return Number(state.skillLevels?.passive) || 1;
    return 0;
  }

  function groupRowsBy(rows, keyGetter) {
    return rows.reduce((map, row) => {
      const key = keyGetter(row);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
      return map;
    }, new Map());
  }

  function formatEffectSummary(row, level = 0) {
    const label = row.値の種類 || row.ステ能力値 || '';
    if (!label) return '';
    const value = formatEffectValue(row, level);
    const parts = [
      label,
      value,
      row.値分類 && row.値分類 !== '倍率' ? row.値分類 : '',
      row.効果タイプ || row.ステ適用 || ''
    ].filter(Boolean);
    return parts.join(' ');
  }

  function formatEffectValue(row, level = 0) {
    const fixed = row.固定値;
    if (fixed !== '' && fixed != null) return formatEffectValueUnit(row, Number(fixed) || 0);
    if (row['上昇%'] !== '' && row['上昇%'] != null) return `+${formatBoardSummaryValue(Number(row['上昇%']) || 0)}%`;
    if (level) {
      const current = Number(row[`Lv${level}`]);
      if (Number.isFinite(current) && current) return formatEffectValueUnit(row, current);
    }
    const lvValues = Array.from({ length: 15 }, (_, index) => row[`Lv${index + 1}`])
      .map(value => Number(value))
      .filter(value => Number.isFinite(value) && value);
    if (!lvValues.length) return '';
    return `${formatEffectValueUnit(row, lvValues[0])}→${formatEffectValueUnit(row, lvValues[lvValues.length - 1])}`;
  }

  function formatEffectValueUnit(row, value) {
    const formatted = formatBoardSummaryValue(value);
    const kind = String(row.値分類 || '');
    const name = String(row.値の種類 || row.ステ能力値 || '');
    if (kind.includes('倍率') || name.includes('ダメージ量') || name.includes('回復量') || name.includes('確率') || name.includes('率') || name.includes('割合')) {
      return `${formatted}%`;
    }
    if (kind.includes('持続時間')) return `${formatted}秒`;
    if (kind.includes('ヒット数') || kind.includes('対象数') || kind.includes('回数')) return `${formatted}`;
    return formatted;
  }

  function renderEquipment(equipment, totals, breakdown) {
    if (!equipment) {
      elements.equipment.innerHTML = '<p class="muted-line">装備情報がありません。</p>';
      return;
    }

    const rank = currentApostleState().rank;
    const state = currentApostleState();
    const visibleGroups = STAT_GROUPS.filter(group => hasEquipmentTier(equipment, rank, group.key));
    const equipmentItems = visibleGroups.map(group => {
      const tier = equipment[`Equip_Rank${rank}_${group.key}`];
      const normalizedTier = Number(tier);
      const lookupGroup = group.lookup || group.key;
      const key = group.key;
      const saved = state.equipment[key] || { enabled: false, enhance: 0 };
      state.equipment[key] = saved;
      const empty = !Number.isFinite(normalizedTier);
      const equipValue = !empty ? findEquipmentValue(rank, lookupGroup, normalizedTier, saved.enhance) : null;
      if (!empty && saved.enabled && equipValue) {
        addStatValue(totals, group.total, equipValue.value);
        addSourceStat(breakdown, 'equipment', group.total, equipValue.value);
      }
      const iconPath = !empty ? getEquipmentIconPath(rank, lookupGroup, normalizedTier) : '';

      return { group, normalizedTier, key, saved, empty, equipValue, iconPath };
    });

    if (document.body.classList.contains('dashboard-page')) {
      renderDashboardEquipment(equipmentItems, rank);
      return;
    }

    elements.equipment.innerHTML = equipmentItems.map(item => {
      const { group, normalizedTier, key, saved, empty, equipValue, iconPath } = item;
      return `
        <div class="equip-cell ${empty ? 'is-empty' : ''} ${saved.enabled ? '' : 'is-disabled'}" data-equip-key="${escapeAttr(key)}">
          ${iconPath ? `<img class="equip-icon" src="${escapeAttr(iconPath)}" alt="">` : ''}
          <div class="kind">${escapeHtml(group.label)}</div>
          <div class="tier">${empty ? '-' : `tier ${normalizedTier}`}</div>
          <div class="name">${equipValue ? `${escapeHtml(equipValue.name)} / ${formatNumber(equipValue.value)}` : '未装備'}</div>
          <div class="equip-controls">
            <label><input type="checkbox" class="equip-enabled" ${saved.enabled ? 'checked' : ''} ${empty ? 'disabled' : ''}> 装備</label>
            <select class="equip-enhance" ${empty ? 'disabled' : ''}>
              ${Array.from({ length: 6 }, (_, index) => `<option value="${index}" ${saved.enhance === index ? 'selected' : ''}>+${index}</option>`).join('')}
            </select>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderDashboardEquipment(items, rank) {
    const basic = DATA.getById('basicInfo', view.id);
    const slotPositions = {
      HP: 1,
      '物理防御': 2,
      '物理攻撃': 3,
      '魔法攻撃': 3,
      '会心/会心DMG': 4,
      '会心抵抗/会心DMG抵抗': 5,
      '魔法防御': 6
    };
    const slots = items.map((item, index) => {
      const { group, normalizedTier, key, saved, empty, iconPath } = item;
      const slotPosition = slotPositions[group.key] || index + 1;
      const slotLabel = group.key === '会心/会心DMG'
        ? '会心'
        : group.key === '会心抵抗/会心DMG抵抗'
          ? '会心抵抗'
          : group.label;
      return `
        <div class="equip-cell equipment-orbit-slot slot-${slotPosition} ${empty ? 'is-empty' : ''} ${saved.enabled ? '' : 'is-disabled'}"
          data-equip-key="${escapeAttr(key)}">
          <span class="kind">${escapeHtml(slotLabel)}</span>
          ${iconPath ? `<img class="equip-icon" src="${escapeAttr(iconPath)}" alt="${escapeAttr(group.label)}">` : ''}
          <span class="tier">T${empty ? '-' : normalizedTier}</span>
          <div class="equip-controls">
            <label class="equip-toggle" title="装備の着脱">
              <input type="checkbox" class="equip-enabled" ${saved.enabled ? 'checked' : ''} ${empty ? 'disabled' : ''}>
              <span>装備</span>
            </label>
            <select class="equip-enhance" aria-label="${escapeAttr(group.label)} 強化値" ${empty ? 'disabled' : ''}>
              ${Array.from({ length: 6 }, (_, enhance) => `<option value="${enhance}" ${Number(saved.enhance) === enhance ? 'selected' : ''}>+${enhance}</option>`).join('')}
            </select>
          </div>
        </div>
      `;
    }).join('');

    const rows = items.map(item => {
      const { group, normalizedTier, saved, empty, equipValue } = item;
      return `
        <tr class="${saved.enabled ? '' : 'is-disabled'}">
          <th>${escapeHtml(group.label)}</th>
          <td>${empty ? '-' : `T${normalizedTier}`}</td>
          <td>${empty ? '-' : `+${Number(saved.enhance) || 0}`}</td>
          <td class="value">${equipValue ? formatNumber(equipValue.value) : '-'}</td>
          <td>${empty ? 'なし' : saved.enabled ? '装備中' : '解除'}</td>
        </tr>
      `;
    }).join('');

    elements.equipment.innerHTML = `
      <div class="equipment-orbit">
        <div class="equipment-center-apostle">
          <div class="equipment-center-portrait">
            <img data-apostle-image src="${escapeAttr(getApostleImagePath(view.id))}" alt="${escapeAttr(basic?.使徒名 || view.id)}">
          </div>
          <strong>${escapeHtml(basic?.使徒名 || view.id)}</strong>
          <span>Rank ${rank}</span>
        </div>
        ${slots}
      </div>
      <div class="equipment-value-table">
        <table>
          <thead><tr><th>部位</th><th>tier</th><th>強化</th><th>上昇値</th><th>状態</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function getVisibleEquipmentKeys() {
    const equipment = DATA.getById('equipment', view.id);
    if (!equipment) return [];
    const rank = currentApostleState().rank;
    return STAT_GROUPS
      .filter(group => hasEquipmentTier(equipment, rank, group.key))
      .map(group => group.key);
  }

  function setCurrentEquipmentEnabled(enabled) {
    setCurrentEquipmentBulk({ enabled });
  }

  function setCurrentEquipmentEnhance(enhance) {
    setCurrentEquipmentBulk({ enhance });
  }

  function setCurrentEquipmentBulk({ enabled = null, enhance = null } = {}) {
    const normalizedEnhance = enhance === null ? null : Math.max(0, Math.min(5, Number(enhance) || 0));
    const state = currentApostleState();
    getVisibleEquipmentKeys().forEach(key => {
      const saved = state.equipment[key] || { enabled: false, enhance: 0 };
      state.equipment[key] = {
        ...saved,
        ...(enabled === null ? {} : { enabled: !!enabled }),
        ...(normalizedEnhance === null ? {} : { enhance: normalizedEnhance })
      };
    });
    saveState();
    render();
  }

  function applyBaseStats(basic, totals, activeEffects, breakdown, state = currentApostleState()) {
    if (!basic) return;
    const level = Number(state.level) || 1;
    const star = normalizeApostleStar(state.star || basic.レア度 || 1);
    const grade = normalizeGrade(state.grade || 1);
    const entries = [
      ['hp', basic.HPタイプ, 'hp'],
      ['patk', basic.物理攻撃力タイプ, 'attack'],
      ['matk', basic.魔法攻撃力タイプ, 'attack'],
      ['pdef', basic.物理防御力タイプ, 'defense'],
      ['mdef', basic.魔法防御力タイプ, 'defense'],
      ['crit', basic.会心タイプ, 'crit'],
      ['critDmg', basic.会心DMGタイプ, 'crit'],
      ['critRes', basic.会心抵抗タイプ, 'crit'],
      ['critDmgRes', basic.会心DMG抵抗タイプ, 'crit'],
      ['spRegen', basic.毎秒SP回復量 ? 'spRegen' : 0, 'sp']
    ];
    entries.forEach(([totalKey, tier, group]) => {
      const base = totalKey === 'spRegen'
        ? { base: basic.毎秒SP回復量, coeff: 0 }
        : findBaseStatValue(tier, group);
      if (!base) return;
      const value = calculateBaseStat(base.base, base.coeff, level, star, grade, totalKey, basic);
      totals[totalKey] += value;
      addSourceStat(breakdown, 'base', totalKey, value);
    });
    activeEffects.push(`基礎ステ Lv${level} ★${star} / ${grade}年生 / ${formatGradeBonusSummary(grade, basic)}`);
  }

  function calculateBaseStat(base, coeff, level, star, grade, statKey = '', basic = null) {
    const baseValue = Number(base) || 0;
    const coeffValue = Number(coeff) || 0;
    const levelValue = Math.max(1, Number(level) || 1);
    const starValue = normalizeApostleStar(star);
    const gradeRate = getGradeStatBonusRate(grade, statKey, basic);
    const starRate = statKey === 'spRegen' ? 0 : 0.2 * (starValue - 1);
    return Math.floor((baseValue + coeffValue * (levelValue - 1)) * (1 + starRate) * (1 + gradeRate));
  }

  function getGradeStatBonusRate(star, statKey = '', basic = null) {
    const row = findGradeBonusRow(star);
    if (!row) return 0.2 * (normalizeGrade(star) - 1);
    const role = String(basic?.役割 || '');
    const key = (() => {
      if (role === '守備' && statKey === 'hp') return '守備タイプHP補正';
      if (role === '攻撃' && (statKey === 'patk' || statKey === 'matk')) return '攻撃タイプ攻撃力補正';
      if (role === '支援' && statKey === 'spRegen') return '支援タイプ毎秒SP回復量補正';
      if (statKey === 'spRegen') return '毎秒SP回復量補正';
      return '基本ステータス補正';
    })();
    const value = normalizeGradeBonusValue(row[key]);
    if (value !== null) return value;
    return normalizeGradeBonusValue(row.基本ステータス補正) ?? 0;
  }

  function formatGradeBonusSummary(star, basic = null) {
    const baseRate = getGradeStatBonusRate(star, 'hp', basic ? { ...basic, 役割: '' } : { 役割: '' });
    const role = String(basic?.役割 || '');
    const roleItems = [];
    if (role === '守備') {
      const rate = getGradeStatBonusRate(star, 'hp', basic);
      if (rate !== baseRate) roleItems.push(`HP+${formatPercentValue(rate)}%`);
    } else if (role === '攻撃') {
      const attackType = String(basic?.攻撃タイプ || '');
      const rate = getGradeStatBonusRate(star, attackType === '魔法' ? 'matk' : 'patk', basic);
      if (rate !== baseRate) roleItems.push(`攻撃+${formatPercentValue(rate)}%`);
    } else if (role === '支援') {
      const rate = getGradeStatBonusRate(star, 'spRegen', basic);
      if (rate) roleItems.push(`毎秒SP+${formatPercentValue(rate)}%`);
    }
    return `学年補正+${formatPercentValue(baseRate)}%${roleItems.length ? `（${roleItems.join(' / ')}）` : ''}`;
  }

  function findGradeBonusRow(star) {
    const grade = normalizeGrade(star);
    const rows = DATA.sheets.gradeBonuses || [];
    return rows.find(row => extractGradeNumber(row.学年 ?? row.grade ?? row.star ?? row['★']) === grade) || null;
  }

  function extractGradeNumber(value) {
    if (typeof value === 'number') return value;
    const text = String(value || '').trim();
    if (!text) return 0;
    const starCount = (text.match(/★/g) || []).length;
    if (starCount) return starCount;
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function normalizeGradeBonusValue(value) {
    if (value === '' || value === null || value === undefined) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return numeric > 2 ? numeric / 100 : numeric;
  }

  function formatPercentValue(value) {
    const percent = (Number(value) || 0) * 100;
    return Number.isInteger(percent) ? String(percent) : percent.toFixed(1).replace(/\.0$/, '');
  }

  function applyRankUpBonuses(basic, totals, activeEffects, breakdown) {
    if (!basic || !DATA.sheets.rankUpBonuses?.length) return;
    const rank = Math.max(1, Number(currentApostleState().rank) || 1);
    if (rank <= 1) return;

    const attackType = String(basic.攻撃タイプ || '');
    const attackKey = attackType === '物理' ? 'patk' : 'matk';
    const attackTier = attackType === '物理' ? basic.物理攻撃力タイプ : basic.魔法攻撃力タイプ;
    const steps = Array.from({ length: rank - 1 }, (_, index) => index + 1);

    steps.forEach(rankFrom => {
      addRankUpValue(totals, breakdown, rankFrom, basic.HPタイプ, 'HP', 'hp');
      addRankUpValue(totals, breakdown, rankFrom, attackTier, '攻撃力', attackKey);
      addRankUpValue(totals, breakdown, rankFrom, basic.物理防御力タイプ, '防御力', 'pdef');
      addRankUpValue(totals, breakdown, rankFrom, basic.魔法防御力タイプ, '防御力', 'mdef');
      addRankUpValue(totals, breakdown, rankFrom, basic.会心タイプ, '会心系', 'crit');
      addRankUpValue(totals, breakdown, rankFrom, basic.会心DMGタイプ, '会心系', 'critDmg');
      addRankUpValue(totals, breakdown, rankFrom, basic.会心抵抗タイプ, '会心系', 'critRes');
      addRankUpValue(totals, breakdown, rankFrom, basic.会心DMG抵抗タイプ, '会心系', 'critDmgRes');
    });

    activeEffects.push(`Rankアップ補正 Rank${rank}`);
  }

  function renderTotals(totals, activeEffects) {
    elements.totals.innerHTML = TOTAL_LABELS.map(item => `
      <div class="stat-inline ${item.tone}" title="${escapeAttr(item.label)}">
        <img src="img/${escapeAttr(item.icon)}" alt="">
        <span class="label">${escapeHtml(item.label)}</span>
        <strong class="value">${formatNumber(totals[item.key] || 0)}</strong>
      </div>
    `).join('');
    elements.activeEffects.innerHTML = activeEffects.length
      ? renderCompactTable(['適用中の効果'], activeEffects.map(effect => [effect]), { firstColumnHeader: true })
      : '<p class="empty-note">全体効果なし</p>';
  }

  function renderStatBreakdown(breakdown, totals, globalPercentRates = createEmptyTotals()) {
    const additiveSources = BREAKDOWN_SOURCES.filter(source => source.key !== 'globalPercent');
    const head = `
      <thead>
        <tr>
          <th>ステータス</th>
          ${additiveSources.map(source => `<th>${escapeHtml(source.label)}</th>`).join('')}
          <th>加算合計</th>
          <th>全体%補正</th>
          <th>最終</th>
        </tr>
      </thead>
    `;
    const body = TOTAL_LABELS.map(item => {
      const globalIncrease = Number(breakdown.globalPercent?.[item.key]) || 0;
      const globalPercent = Number(globalPercentRates[item.key]) || 0;
      const additiveTotal = (Number(totals[item.key]) || 0) - globalIncrease;
      return `
        <tr class="${item.tone}">
          <th>${escapeHtml(item.label)}</th>
          ${additiveSources.map(source => `<td>${formatBreakdownValue(breakdown[source.key]?.[item.key])}</td>`).join('')}
          <td class="total">${formatBreakdownValue(additiveTotal)}</td>
          <td>${formatGlobalPercentBreakdownValue(globalIncrease, globalPercent)}</td>
          <td class="total">${formatBreakdownValue(totals[item.key])}</td>
        </tr>
      `;
    }).join('');
    elements.breakdown.innerHTML = `<table>${head}<tbody>${body}</tbody></table>`;
  }

  function renderBaseTypes(basic) {
    if (!basic) return;
    const rows = [
      ['HP', basic.HPタイプ, 'hp'],
      ['物攻', basic.物理攻撃力タイプ, 'attack'],
      ['魔攻', basic.魔法攻撃力タイプ, 'attack'],
      ['物防', basic.物理防御力タイプ, 'defense'],
      ['魔防', basic.魔法防御力タイプ, 'defense'],
      ['会心', basic.会心タイプ, 'crit'],
      ['会心DMG', basic.会心DMGタイプ, 'crit'],
      ['会心抵抗', basic.会心抵抗タイプ, 'crit'],
      ['会心DMG抵抗', basic.会心DMG抵抗タイプ, 'crit']
    ];
    elements.baseTypes.innerHTML = renderCompactTable(
      ['項目', 'tier', '基礎', '係数'],
      rows.map(([label, value, group]) => {
      const base = findBaseStatValue(value, group);
        return [label, value || '-', base?.base ?? '-', base?.coeff ?? '-'];
      })
    );
  }

  function renderRankBonuses(rankBonus) {
    if (!rankBonus) {
      elements.rankBonuses.innerHTML = '<p class="empty-note">Rank効果なし</p>';
      return;
    }
    const rankTotals = createEmptyTotals();
    const rankLimit = Math.min(currentApostleState().rank - 1, 9);
    for (let rank = 1; rank <= rankLimit; rank++) {
      for (let index = 1; index <= 2; index++) {
        const type = rankBonus[`Rank${rank}to${rank + 1}_type${index}`];
        const value = Number(rankBonus[`Rank${rank}to${rank + 1}_value${index}`]) || 0;
        if (!type || !value) continue;
        addNamedStat(rankTotals, type, value);
      }
    }
    elements.rankBonuses.innerHTML = renderStatTotalsTable(rankTotals, '現在Rankでは未適用');
  }

  function applyAllRankGlobalBonuses(totals, activeEffects, breakdown) {
    const effects = createEmptyTotals();
    DATA.sheets.rankGlobalBonuses.forEach(row => {
      const state = ensureApostleState(row.id);
      applyRankBonusToTotals(row, state.rank, effects);
    });
    TOTAL_LABELS.forEach(item => {
      const value = Number(effects[item.key]) || 0;
      if (!value) return;
      addStatValue(totals, item.key, value);
      addSourceStat(breakdown, 'rankGlobal', item.key, value);
    });
    const summary = formatStatSummary(effects, '');
    if (summary) activeEffects.push(`Rank全体効果 ${summary}`);
  }

  function applyRankBonusToTotals(rankBonus, rankValue, totals) {
    if (!rankBonus) return;
    const rankLimit = Math.min(Number(rankValue) - 1, 9);
    for (let rank = 1; rank <= rankLimit; rank++) {
      for (let index = 1; index <= 2; index++) {
        const type = rankBonus[`Rank${rank}to${rank + 1}_type${index}`];
        const value = Number(rankBonus[`Rank${rank}to${rank + 1}_value${index}`]) || 0;
        if (!type || !value) continue;
        addNamedStat(totals, type, value);
      }
    }
  }

  function renderResearchControls() {
    elements.researchGrid.innerHTML = '';
  }

  function renderActiveResearch(basic, totals, activeEffects, breakdown) {
    if (!basic) return;
    const progress = Number(appState.research.progress) || 0;
    const level = Number(appState.research.level) || 0;
    elements.researchProgressSelect.value = String(progress);
    elements.researchLevelSelect.value = String(level);

    const rows = getActiveResearchRows().filter(row => row.種族 === basic.種族);
    const entries = [];
    rows.forEach(row => {
      const value = getResearchValue(row, level, progress);
      if (!value) return;
      addNamedStat(totals, row.ステータス, value);
      addSourceNamedStat(breakdown, 'research', row.ステータス, value);
      activeEffects.push(`研究${level}段階${progress}回目 ${row.ステータス}+${value}`);
      entries.push({
        count: row.id,
        stage: getResearchAppliedStage(row, level, progress),
        species: row.種族,
        stat: row.ステータス,
        value
      });
    });
    elements.activeResearch.innerHTML = renderResearchTable(entries, '選択使徒に適用中の研究なし', false);
    renderResearchOverview();
  }

  function getActiveResearchRows() {
    const progress = Number(appState.research.progress) || 0;
    const level = Number(appState.research.level) || 0;
    if (!progress || !level) return [];
    return DATA.sheets.research.filter(isResearchStatRow);
  }

  function isResearchStatRow(row) {
    return Boolean(row?.種族 && row?.ステータス);
  }

  function renderResearchOverview() {
    const level = Number(appState.research.level) || 0;
    const progress = Number(appState.research.progress) || 0;
    const rows = getActiveResearchRows();
    if (!rows.length) {
      elements.researchGrid.innerHTML = '<p class="empty-note">研究効果OFF</p>';
      return;
    }
    const entries = rows
      .map(row => ({ row, value: getResearchValue(row, level, progress) }))
      .filter(item => item.value)
      .map(({ row, value }) => ({
        count: row.id,
        stage: getResearchAppliedStage(row, level, progress),
        species: row.種族,
        stat: row.ステータス,
        value
      }));
    elements.researchGrid.innerHTML = renderResearchTable(entries, '研究効果なし', true);
  }

  function renderResearchTable(entries, emptyText, showSpecies) {
    if (!entries.length) return `<p class="empty-note">${escapeHtml(emptyText)}</p>`;
    const speciesHeader = showSpecies ? '<th>種族</th>' : '';
    const rows = entries.map(entry => `
      <tr>
        <td>${escapeHtml(entry.count)}回目</td>
        <td>${escapeHtml(entry.stage)}</td>
        ${showSpecies ? `<td>${escapeHtml(entry.species || '')}</td>` : ''}
        <td>${escapeHtml(entry.stat || '')}</td>
        <td class="value">+${escapeHtml(entry.value)}</td>
      </tr>
    `).join('');
    return `
      <table class="research-table">
        <thead>
          <tr>
            <th>回目</th>
            <th>反映段階</th>
            ${speciesHeader}
            <th>ステータス</th>
            <th>上昇値</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function renderCompactTable(headers, rows, options = {}) {
    if (!rows.length) return `<p class="empty-note">${escapeHtml(options.emptyText || '表示なし')}</p>`;
    const body = rows.map(row => `
      <tr>
        ${row.map((cell, index) => {
          const tag = index === 0 && options.firstColumnHeader ? 'th' : 'td';
          const className = options.valueColumn === index ? ' class="value"' : '';
          return `<${tag}${className}>${escapeHtml(cell)}</${tag}>`;
        }).join('')}
      </tr>
    `).join('');
    return `
      <table class="compact-table">
        <thead>
          <tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  function renderStatTotalsTable(totals, emptyText) {
    const rows = TOTAL_LABELS.map(item => [
      item.label,
      totals[item.key] ? `+${formatNumber(totals[item.key])}` : '-'
    ]);
    const hasValue = rows.some(([, value]) => value !== '-');
    if (!hasValue) return `<p class="empty-note">${escapeHtml(emptyText)}</p>`;
    return renderCompactTable(['ステータス', '上昇値'], rows, { firstColumnHeader: true, valueColumn: 1 });
  }

  function renderStatPercentTotalsTable(totals, emptyText) {
    const rows = TOTAL_LABELS.map(item => [
      item.label,
      totals[item.key] ? `+${formatBoardSummaryValue(totals[item.key])}%` : '-'
    ]);
    const hasValue = rows.some(([, value]) => value !== '-');
    if (!hasValue) return `<p class="empty-note">${escapeHtml(emptyText)}</p>`;
    return renderCompactTable(['ステータス', '全体補正'], rows, { firstColumnHeader: true, valueColumn: 1 });
  }

  function formatStatSummary(totals, suffix) {
    return TOTAL_LABELS
      .map(item => ({ label: item.label, value: Number(totals[item.key]) || 0 }))
      .filter(item => item.value)
      .map(item => `${item.label}+${formatBoardSummaryValue(item.value)}${suffix}`)
      .join(' / ');
  }

  function getResearchAppliedStage(row, stage, count) {
    const stageValue = Math.max(0, Number(stage) || 0);
    const countValue = Math.max(0, Number(count) || 0);
    if (!stageValue || !countValue) return '-';
    const rowCount = Number(row.id) || 0;
    const maxStageForRow = rowCount <= countValue ? stageValue : stageValue - 1;
    if (maxStageForRow <= 0) return '-';
    return maxStageForRow === 1 ? '1' : `1-${maxStageForRow}`;
  }

  function getResearchValue(row, stage, count) {
    const stageValue = Math.max(0, Number(stage) || 0);
    const countValue = Math.max(0, Number(count) || 0);
    if (!stageValue || !countValue) return 0;
    const rowCount = Number(row.id) || 0;
    const maxStageForRow = rowCount <= countValue ? stageValue : stageValue - 1;
    let total = 0;
    for (let index = 1; index <= maxStageForRow; index++) {
      total += Number(row[`段階${index}`]) || 0;
    }
    return total;
  }

  function renderRankOverviewControls() {
    renderRankOverviewFilters();
    renderRankOverviewCards();
  }

  function renderRankOverview() {
    renderRankOverviewFilters();
    renderRankOverviewCards();

    const effects = createEmptyTotals();
    DATA.sheets.rankGlobalBonuses.forEach(row => {
      const state = ensureApostleState(row.id);
      applyRankBonusToTotals(row, state.rank, effects);
    });
    elements.rankOverviewSummary.innerHTML = renderRankOverviewSummary(effects);
  }

  function renderRankOverviewFilters() {
    const activeCount = Object.values(view.rankFilters)
      .reduce((total, values) => total + values.size, 0);
    elements.rankFilterCount.textContent = activeCount ? `${activeCount}件選択中` : '';
    elements.rankOverviewFilters.innerHTML = renderApostleFilterControls(
      getApostleFilterGroups(),
      view.rankFilters,
      'rank'
    );
    elements.rankOverviewSort.value = view.rankSort;
  }

  function renderRankOverviewCards() {
    const rows = DATA.sheets.basicInfo
      .filter(row => [
        ['personality', row.性格],
        ['species', row.種族],
        ['role', row.役割],
        ['position', row.配列]
      ].every(([group, value]) => {
        const selected = view.rankFilters[group];
        return selected.size === 0 || selected.has(value);
      }))
      .sort((a, b) => {
        const nameOrder = String(a.使徒名 || a.id).localeCompare(
          String(b.使徒名 || b.id),
          'ja',
          { sensitivity: 'base' }
        );
        if (view.rankSort !== 'rank') return nameOrder;
        return ensureApostleState(b.id).rank - ensureApostleState(a.id).rank || nameOrder;
      });

    elements.rankOverviewGrid.innerHTML = rows.map(row => {
      const state = ensureApostleState(row.id);
      const assetId = getApostleAssetId(row.id);
      const rankTone = state.rank >= 9
        ? 'rank-gold'
        : state.rank >= 7
          ? 'rank-purple'
          : state.rank >= 5
            ? 'rank-blue'
            : state.rank >= 3
              ? 'rank-green'
              : 'rank-gray';
      return `
        <label class="rank-overview-card personality-${escapeAttr(row.性格 || '')} ${rankTone}" data-rank-card-id="${escapeAttr(row.id)}" title="${escapeAttr(row.使徒名 || row.id)}の装備Rankを変更">
          <img data-apostle-image class="rank-overview-icon" src="img/Chara/Skill/Skill_P_${escapeAttr(assetId)}.webp" alt="">
          <span class="rank-overview-name">${escapeHtml(row.使徒名 || row.id)}</span>
          <strong class="rank-overview-value">R${state.rank}</strong>
          <select data-rank-apostle-id="${escapeAttr(row.id)}" aria-label="${escapeAttr(row.使徒名 || row.id)} 装備Rank">
            ${Array.from({ length: 9 }, (_, index) => {
              const rank = index + 1;
              return `<option value="${rank}" ${state.rank === rank ? 'selected' : ''}>Rank ${rank}</option>`;
            }).join('')}
          </select>
        </label>
      `;
    }).join('') || '<p class="empty-note">一致する使徒がいません。</p>';
  }

  function renderRankOverviewSummary(totals) {
    const groups = [
      [
        ['HP', 'hp'],
        ['物理攻撃', 'patk'],
        ['魔法攻撃', 'matk'],
        ['物理防御', 'pdef'],
        ['魔法防御', 'mdef']
      ],
      [
        ['会心', 'crit'],
        ['会心DMG', 'critDmg'],
        ['会心抵抗', 'critRes'],
        ['会心DMG抵抗', 'critDmgRes']
      ]
    ];
    const hasValue = groups.flat().some(([, key]) => Number(totals[key]));
    if (!hasValue) return '<p class="empty-note">Rank全体効果なし</p>';
    return `<div class="rank-summary-tables">${groups.map(rows =>
      renderCompactTable(
        ['ステータス', '上昇値'],
        rows.map(([label, key]) => [label, totals[key] ? `+${formatNumber(totals[key])}` : '-']),
        { firstColumnHeader: true, valueColumn: 1 }
      )
    ).join('')}</div>`;
  }

  function renderBondOverviewControls() {
    renderBondOverviewFilters();
    renderBondOverviewCards();
  }

  function renderBondOverview() {
    renderBondOverviewFilters();
    renderBondOverviewCards();
    renderBondOverviewSummary();
  }

  function renderBondOverviewFilters() {
    const activeCount = Object.values(view.bondFilters)
      .reduce((total, values) => total + values.size, 0);
    elements.bondFilterCount.textContent = activeCount ? `${activeCount}件選択中` : '';
    elements.bondOverviewFilters.innerHTML = renderApostleFilterControls(
      getApostleFilterGroups(),
      view.bondFilters,
      'bond'
    );
    elements.bondOverviewSort.value = view.bondSort;
  }

  function renderBondOverviewCards() {
    const rows = DATA.sheets.basicInfo
      .filter(row => [
        ['personality', row.性格],
        ['species', row.種族],
        ['role', row.役割],
        ['position', row.配列]
      ].every(([group, value]) => {
        const selected = view.bondFilters[group];
        return selected.size === 0 || selected.has(value);
      }))
      .sort((a, b) => {
        const nameOrder = String(a.使徒名 || a.id).localeCompare(
          String(b.使徒名 || b.id),
          'ja',
          { sensitivity: 'base' }
        );
        if (view.bondSort !== 'bond') return nameOrder;
        return ensureApostleState(b.id).bond - ensureApostleState(a.id).bond || nameOrder;
      });

    elements.bondOverviewGrid.innerHTML = rows.map(row => {
      const state = ensureApostleState(row.id);
      state.bond = normalizeBondForApostle(row, state.bond);
      const locked = isBondLockedApostle(row);
      const bondTone = getBondOverviewTone(state.bond);
      return `
        <label class="rank-overview-card bond-overview-card personality-${escapeAttr(row.性格 || '')} ${bondTone} ${locked ? 'is-bond-locked' : ''}" data-bond-card-id="${escapeAttr(row.id)}" title="${escapeAttr(locked ? `${row.使徒名 || row.id}は好感度Lv1固定` : `${row.使徒名 || row.id}の好感度Lvを変更`)}">
          <img data-apostle-image class="rank-overview-icon" src="img/Chara/Skill/Skill_P_${escapeAttr(getApostleAssetId(row.id))}.webp" alt="">
          <span class="rank-overview-name">${escapeHtml(row.使徒名 || row.id)}</span>
          <strong class="rank-overview-value bond-overview-value"><span>❤</span> Lv.${state.bond}${locked ? '<small>固定</small>' : ''}</strong>
          <select data-bond-apostle-id="${escapeAttr(row.id)}" aria-label="${escapeAttr(row.使徒名 || row.id)} 好感度Lv" ${locked ? 'disabled' : ''}>
            ${Array.from({ length: 30 }, (_, index) => {
              const level = index + 1;
              return `<option value="${level}" ${state.bond === level ? 'selected' : ''}>Lv ${level}</option>`;
            }).join('')}
          </select>
        </label>
      `;
    }).join('') || '<p class="empty-note">一致する使徒がいません。</p>';
  }

  function getBondOverviewTone(level) {
    const value = Number(level) || 1;
    if (value >= 30) return 'bond-max';
    if (value >= 25) return 'bond-pink';
    if (value >= 11) return 'bond-orange';
    if (value >= 6) return 'bond-yellow';
    return 'bond-none';
  }

  function renderBondOverviewSummary() {
    const states = DATA.sheets.basicInfo.map(row => ensureApostleState(row.id));
    const levels = states.map(state => Number(state.bond) || 1);
    const thresholds = [6, 10, 15, 20, 21, 30];
    elements.bondOverviewSummary.innerHTML = renderCompactTable(
      ['項目', '値'],
      thresholds.map(level => [
        `Lv${level}到達`,
        `${levels.filter(value => value >= level).length} / ${levels.length}`
      ]),
      { firstColumnHeader: true, valueColumn: 1 }
    );
  }

  function renderAsideOverviewControls() {
    renderAsideOverviewFilters();
    renderAsideOverviewCards();
  }

  function renderAsideOverview() {
    renderAsideOverviewFilters();
    renderAsideOverviewCards();

    const effects = createEmptyTotals();
    DATA.sheets.basicInfo.filter(row => hasAsideEffects(row.id)).forEach(row => {
      const state = ensureApostleState(row.id);
      if ((Number(state.asideRank) || 0) < 3) return;
      collectAsideLevel3Entries(row.id).forEach(entry => addNamedStat(effects, entry.name, entry.value));
    });
    elements.asideOverviewSummary.innerHTML = renderStatPercentTotalsTable(effects, 'A3全体効果なし');
  }

  function renderAsideOverviewFilters() {
    const activeCount = Object.values(view.asideFilters)
      .reduce((total, values) => total + values.size, 0);
    elements.asideFilterCount.textContent = activeCount ? `${activeCount}件選択中` : '';
    elements.asideOverviewFilters.innerHTML = renderApostleFilterControls(
      getApostleFilterGroups(),
      view.asideFilters,
      'aside'
    );
    elements.asideOverviewSort.value = view.asideSort;
  }

  function renderAsideOverviewCards() {
    const rows = DATA.sheets.basicInfo
      .filter(row => hasAsideEffects(row.id))
      .filter(row => [
        ['personality', row.性格],
        ['species', row.種族],
        ['role', row.役割],
        ['position', row.配列]
      ].every(([group, value]) => {
        const selected = view.asideFilters[group];
        return selected.size === 0 || selected.has(value);
      }))
      .sort((a, b) => {
        const nameOrder = String(a.使徒名 || a.id).localeCompare(
          String(b.使徒名 || b.id),
          'ja',
          { sensitivity: 'base' }
        );
        if (view.asideSort !== 'aside') return nameOrder;
        return ensureApostleState(b.id).asideRank - ensureApostleState(a.id).asideRank || nameOrder;
      });

    elements.asideOverviewGrid.innerHTML = rows.map(row => {
      const state = ensureApostleState(row.id);
      const asideRank = Number(state.asideRank) || 0;
      const asideTone = asideRank >= 3
        ? 'aside-a3'
        : asideRank === 2
          ? 'aside-a2'
          : asideRank === 1
            ? 'aside-a1'
            : 'aside-off';
      return `
        <label class="rank-overview-card aside-overview-card personality-${escapeAttr(row.性格 || '')} ${asideTone}" data-aside-card-id="${escapeAttr(row.id)}" title="${escapeAttr(row.使徒名 || row.id)}のアサイド段階を変更">
          <img data-apostle-image class="rank-overview-icon" src="img/Chara/Aside/AsideIcon_${escapeAttr(getApostleAssetId(row.id))}.webp" alt="">
          <span class="rank-overview-name">${escapeHtml(row.使徒名 || row.id)}</span>
          <strong class="rank-overview-value">${asideRank ? `A${asideRank}` : '未発現'}</strong>
          <select data-aside-apostle-id="${escapeAttr(row.id)}" aria-label="${escapeAttr(row.使徒名 || row.id)} アサイド段階">
            <option value="0" ${asideRank === 0 ? 'selected' : ''}>未発現</option>
            <option value="1" ${asideRank === 1 ? 'selected' : ''}>A1</option>
            <option value="2" ${asideRank === 2 ? 'selected' : ''}>A2</option>
            <option value="3" ${asideRank === 3 ? 'selected' : ''}>A3</option>
          </select>
        </label>
      `;
    }).join('') || '<p class="empty-note">一致する使徒がいません。</p>';
  }

  function renderCardManager() {
    if (!elements.cardManagerGrid) return;
    const kind = view.cardManager.kind === 'spell' ? 'spell' : 'artifact';
    const cards = getCardManagerCards(kind);
    const rows = getVisibleCardManagerCards(kind);
    elements.cardManagerTabs.forEach(button => {
      button.classList.toggle('is-active', button.dataset.cardKind === kind);
    });
    if (elements.cardManagerSearch && elements.cardManagerSearch.value !== view.cardManager.search) {
      elements.cardManagerSearch.value = view.cardManager.search;
    }
    if (elements.cardManagerRarity && elements.cardManagerRarity.value !== view.cardManager.rarity) {
      elements.cardManagerRarity.value = view.cardManager.rarity;
    }
    if (elements.cardManagerEffect && elements.cardManagerEffect.value !== view.cardManager.effect) {
      elements.cardManagerEffect.value = view.cardManager.effect;
    }
    if (elements.cardManagerOwnedOnly) elements.cardManagerOwnedOnly.checked = !!view.cardManager.ownedOnly;
    renderCardManagerSummary(kind, cards, rows);
    warmCardManagerImages(rows);
    const activeGrid = getCardManagerKindGrid(kind);
    if (!activeGrid) return;
    elements.cardManagerGrid.querySelectorAll('[data-card-manager-kind-grid]').forEach(grid => {
      grid.hidden = grid !== activeGrid;
    });
    const renderKey = getCardManagerRenderKey(kind, rows);
    if (activeGrid.dataset.renderKey === renderKey) return;
    activeGrid.innerHTML = rows.map((card, index) => renderCardManagerCard(card, index)).join('')
      || '<p class="empty-note">一致するカードがありません。</p>';
    activeGrid.dataset.renderKey = renderKey;
    revealCardManagerGridWhenReady(activeGrid);
  }

  function renderCardManagerSummary(kind, cards = getCardManagerCards(kind), rows = getVisibleCardManagerCards(kind)) {
    if (!elements.cardManagerSummary) return;
    const ownedCount = cards.filter(card => getCardState(card.id).owned).length;
    elements.cardManagerSummary.innerHTML = `
      <span>${kind === 'artifact' ? '遺物' : 'スペル'} ${ownedCount}/${cards.length} 所持</span>
      <span>表示 ${rows.length}件</span>
    `;
  }

  function getCardManagerKindGrid(kind) {
    const cardKind = kind === 'spell' ? 'spell' : 'artifact';
    let grid = elements.cardManagerGrid.querySelector(`[data-card-manager-kind-grid="${cardKind}"]`);
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'card-manager-kind-grid';
      grid.dataset.cardManagerKindGrid = cardKind;
      elements.cardManagerGrid.appendChild(grid);
    }
    return grid;
  }

  function getCardManagerRenderKey(kind, rows) {
    return stableStringify({
      kind,
      search: view.cardManager.search || '',
      rarity: view.cardManager.rarity || '',
      effect: view.cardManager.effect || '',
      ownedOnly: !!view.cardManager.ownedOnly,
      cards: rows.map(card => {
        const state = getCardState(card.id);
        return {
          id: card.id,
          owned: !!state.owned,
          star: normalizeCardStar(state.star),
          solder: normalizeCardSolder(state.solder)
        };
      })
    });
  }

  function warmCardManagerImages(rows) {
    const cache = warmCardManagerImages.cache || (warmCardManagerImages.cache = new Map());
    const warmOne = (card, index) => {
      const priority = getCardManagerImagePriority(index);
      [getCardManagerRarityFrame(card), getCardManagerImagePath(card)].filter(Boolean).forEach(src => {
        if (cache.has(src)) return;
        const image = new Image();
        image.decoding = 'async';
        image.fetchPriority = priority.fetchPriority;
        image.src = src;
        cache.set(src, image);
      });
    };
    rows.slice(0, 24).forEach(warmOne);
    const rest = rows.slice(24);
    if (!rest.length) return;
    const warmRest = () => rest.forEach((card, offset) => warmOne(card, offset + 24));
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(warmRest, { timeout: 1200 });
    } else {
      window.setTimeout(warmRest, 160);
    }
  }

  function getCardManagerImagePriority(index) {
    const isPriority = index < 24;
    return {
      isPriority,
      loading: isPriority ? 'eager' : 'lazy',
      fetchPriority: isPriority ? 'high' : 'low'
    };
  }

  function revealCardManagerGridWhenReady(grid) {
    const priorityImages = Array.from(grid.querySelectorAll('img[data-card-manager-priority="true"]'));
    const images = priorityImages.length ? priorityImages : Array.from(grid.querySelectorAll('img'));
    if (!images.length) {
      grid.classList.remove('is-preparing');
      return;
    }
    grid.classList.add('is-preparing');
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      requestAnimationFrame(() => grid.classList.remove('is-preparing'));
    };
    Promise.allSettled(images.map(image => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      if (typeof image.decode === 'function') return image.decode().catch(() => undefined);
      return new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    })).then(finish);
    window.setTimeout(finish, 700);
  }

  function getVisibleCardManagerCards(kind = view.cardManager.kind) {
    const cardKind = kind === 'spell' ? 'spell' : 'artifact';
    const query = String(view.cardManager.search || '').toLocaleLowerCase('ja');
    return getCardManagerCards(cardKind).filter(card => {
      const entry = getCardState(card.id);
      if (view.cardManager.ownedOnly && !entry.owned) return false;
      if (!cardMatchesManagerRarity(card, view.cardManager.rarity)) return false;
      if (!cardMatchesManagerEffect(card, view.cardManager.effect)) return false;
      if (!query) return true;
      return [card.name, card.favoriteCharacter, card.rarity, card.id]
        .filter(Boolean)
        .some(value => String(value).toLocaleLowerCase('ja').includes(query));
    }).sort(compareCardManagerCards);
  }

  function renderCardManagerCard(card, index = 0) {
    const entry = getCardState(card.id);
    const star = normalizeCardStar(entry.star);
    const solder = star >= 5 ? normalizeCardSolder(entry.solder) : 0;
    const rarityFrame = card.kind === 'artifact' ? getCardManagerRarityFrame(card) : '';
    const rarityClass = getCardManagerRarityClass(card);
    const priority = getCardManagerImagePriority(index);
    const priorityAttrs = `loading="${priority.loading}" decoding="async" fetchpriority="${priority.fetchPriority}" data-card-manager-priority="${priority.isPriority ? 'true' : 'false'}"`;
    return `
      <article class="resource-card ${card.kind === 'spell' ? 'resource-card-spell' : 'resource-card-artifact'} ${rarityClass} ${entry.owned ? 'is-owned' : ''}" data-card-id="${escapeAttr(card.id)}">
        <div class="resource-card-image-wrap">
          ${rarityFrame ? `<img class="resource-card-bg" src="${escapeAttr(rarityFrame)}" alt="" ${priorityAttrs}>` : ''}
          <img class="resource-card-image" src="${escapeAttr(getCardManagerImagePath(card))}" alt="${escapeAttr(card.name)}" ${priorityAttrs}>
          <span class="resource-card-cost">
            <img src="img/Card/cost.webp" alt="" class="resource-card-cost-img">
            <span class="resource-card-cost-value-fill">${escapeHtml(getCardManagerCost(card, star))}</span>
            <span class="resource-card-cost-value">${escapeHtml(getCardManagerCost(card, star))}</span>
          </span>
          <button type="button" class="resource-effect-overlay ${getCardManagerEffectCount(card) ? 'has-effect' : ''}" data-card-id="${escapeAttr(card.id)}" data-card-effect-overlay>
            ${getCardManagerEffectCount(card) ? '効果' : 'Info'}
          </button>
          <div class="resource-card-star-overlay" aria-label="★${star}">
            ${renderCardManagerStars(card.id, star)}
          </div>
          <button type="button" class="resource-solder-overlay ${star >= 5 ? '' : 'is-disabled'}" data-card-id="${escapeAttr(card.id)}" data-card-solder-overlay aria-label="はんだ+${solder}" ${star >= 5 ? '' : 'disabled'}>
            ${renderCardManagerSolderToken(solder)}
          </button>
          <div class="resource-card-name-panel">
            <span style="font-size: ${getCardManagerNameFontSize(card.name)}">${escapeHtml(card.name)}</span>
          </div>
        </div>
      </article>
    `;
  }

  function renderCardManagerStars(cardId, star) {
    return createNumberOptions(1, 5).map(option => `
      <button type="button" class="resource-grade-btn" data-card-id="${escapeAttr(cardId)}" data-card-star="${option.value}" aria-label="★${option.value}">
        <img src="img/${option.value <= star ? 'Grade_on.webp' : 'Grade_off.webp'}" alt="">
      </button>
    `).join('');
  }

  function renderCardManagerSolderToken(solder) {
    const level = normalizeCardSolder(solder);
    return `
      <img src="img/Card/sunshine_token.webp" alt="" class="resource-solder-token-icon">
      <span class="resource-solder-token-value-fill"><span class="resource-solder-token-plus">+</span><span class="resource-solder-token-number">${level}</span></span>
      <span class="resource-solder-token-value"><span class="resource-solder-token-plus">+</span><span class="resource-solder-token-number">${level}</span></span>
    `;
  }

  function openCardManagerEffectPopover(cardId, anchorEl) {
    const card = getCardManagerCards('artifact').concat(getCardManagerCards('spell')).find(item => item.id === cardId);
    if (!card || !anchorEl) return;
    const popover = ensureCardManagerEffectPopover();
    const hostDialog = anchorEl.closest('dialog[open]');
    if (hostDialog && popover.parentElement !== hostDialog) {
      hostDialog.appendChild(popover);
    } else if (!hostDialog && popover.parentElement !== document.body) {
      document.body.appendChild(popover);
    }
    const rect = anchorEl.getBoundingClientRect();
    const star = normalizeCardStar(getCardState(cardId).star);
    const solder = normalizeCardSolder(getCardState(cardId).solder);
    popover.innerHTML = `
      <div class="resource-effect-popover-head">
        <strong>${escapeHtml(card.name)}</strong>
        <button type="button" data-close-card-effect>×</button>
      </div>
      <div class="resource-effect-popover-body">
        ${getCardManagerEffectSummary(card, star, solder).map(text => `<p>${escapeHtml(text)}</p>`).join('')}
      </div>
    `;
    popover.querySelector('[data-close-card-effect]')?.addEventListener('click', () => {
      popover.hidden = true;
    });
    popover.hidden = false;
    const popRect = popover.getBoundingClientRect();
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - popRect.width - 12);
    const top = Math.min(rect.bottom + 8, window.innerHeight - popRect.height - 12);
    popover.style.left = `${left}px`;
    popover.style.top = `${Math.max(12, top)}px`;
  }

  function ensureCardManagerEffectPopover() {
    let popover = document.getElementById('resource-effect-popover');
    if (!popover) {
      popover = document.createElement('div');
      popover.id = 'resource-effect-popover';
      popover.className = 'resource-effect-popover';
      popover.hidden = true;
      document.body.appendChild(popover);
      document.addEventListener('click', event => {
        if (popover.hidden) return;
        if (popover.contains(event.target) || event.target.closest('[data-card-effect-overlay]')) return;
        popover.hidden = true;
      });
    }
    return popover;
  }

  function renderFormation() {
    if (!elements.formationBoard) return;
    const formation = ensureFormationState();
    elements.formationBoard.innerHTML = formation.rows.map((row, rowIndex) => renderFormationColumn(row, rowIndex)).join('');
    renderFormationSpells(formation);
    renderFormationCostSummary(formation);
    renderFormationMemberSummary(formation);
    renderFormationSynergySummary(formation);
    renderFormationPresetList();
    renderFormationActivePreset();
  }

  function saveCurrentFormationPreset() {
    ensureFormationPresetStore();
    const now = new Date();
    const name = (elements.formationSaveName?.value || '').trim()
      || `編成 ${now.toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`;
    const tags = parseFormationTags(elements.formationSaveTags?.value || '');
    const id = `formation_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    appState.savedFormations.unshift({
      id,
      name,
      tags,
      favoriteSlot: 0,
      savedAt: now.toISOString(),
      formation: cloneJson(ensureFormationState())
    });
    appState.activeFormationPresetId = id;
    saveState();
    closeFormationSaveEditor();
    renderFormationActivePreset();
    renderFormationPresetList();
  }

  function openFormationSaveEditor() {
    if (!elements.formationSaveEditor) return;
    elements.formationSaveEditor.hidden = false;
    if (elements.formationSaveName && !elements.formationSaveName.value.trim()) {
      const now = new Date();
      elements.formationSaveName.value = `編成 ${now.toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`;
    }
    elements.formationSaveName?.focus();
    elements.formationSaveName?.select();
  }

  function closeFormationSaveEditor() {
    if (elements.formationSaveEditor) elements.formationSaveEditor.hidden = true;
  }

  function loadFormationPreset(id) {
    const preset = ensureFormationPresetStore().find(item => item.id === id);
    if (!preset) return;
    appState.formation = normalizeFormationState(preset.formation);
    appState.activeFormationPresetId = preset.id;
    if (elements.formationSaveName) elements.formationSaveName.value = preset.name || '';
    if (elements.formationSaveTags) elements.formationSaveTags.value = (preset.tags || []).join(', ');
    saveState();
    renderFormation();
  }

  function overwriteCurrentFormationPreset() {
    const presets = ensureFormationPresetStore();
    const id = appState.activeFormationPresetId || '';
    const preset = presets.find(item => item.id === id);
    if (!preset) return;
    const name = (elements.formationSaveName?.value || '').trim() || preset.name || '無題の編成';
    preset.name = name;
    preset.tags = parseFormationTags(elements.formationSaveTags?.value || '');
    preset.savedAt = new Date().toISOString();
    preset.formation = cloneJson(ensureFormationState());
    saveState();
    renderFormationActivePreset();
    renderFormationPresetList();
  }

  function toggleFormationPresetFavoritePicker(id) {
    const presets = ensureFormationPresetStore();
    const preset = presets.find(item => item.id === id);
    if (!preset) return;
    appState.openFormationFavoritePickerId = appState.openFormationFavoritePickerId === id ? '' : id;
    renderFormationPresetList();
  }

  function setFormationPresetFavoriteSlot(id, slotValue) {
    const presets = ensureFormationPresetStore();
    const preset = presets.find(item => item.id === id);
    if (!preset) return;
    const slot = normalizeFavoriteSlot(slotValue);
    if (!slot || preset.favoriteSlot === slot) {
      preset.favoriteSlot = 0;
    } else {
      presets.forEach(item => {
        if (item.id !== id && item.favoriteSlot === slot) item.favoriteSlot = 0;
      });
      preset.favoriteSlot = slot;
    }
    appState.openFormationFavoritePickerId = '';
    saveState();
    renderFormationPresetList();
  }

  function deleteFormationPreset(id) {
    const presets = ensureFormationPresetStore();
    const preset = presets.find(item => item.id === id);
    if (!preset) return;
    if (!window.confirm(`編成「${preset.name}」を削除しますか？`)) return;
    appState.savedFormations = presets.filter(item => item.id !== id);
    if (appState.activeFormationPresetId === id) appState.activeFormationPresetId = '';
    if (appState.openFormationFavoritePickerId === id) appState.openFormationFavoritePickerId = '';
    saveState();
    renderFormationActivePreset();
    renderFormationPresetList();
  }

  function renderFormationActivePreset() {
    if (!elements.formationActivePreset) return;
    const preset = ensureFormationPresetStore().find(item => item.id === appState.activeFormationPresetId);
    const isDirty = !!preset && isFormationPresetDirty(preset);
    elements.formationActivePreset.classList.toggle('is-active', !!preset);
    elements.formationActivePreset.classList.toggle('is-dirty', isDirty);
    elements.formationActivePreset.innerHTML = preset
      ? `
        <span>${isDirty ? '変更あり' : '編集中'}</span>
        <strong>${escapeHtml(preset.name)}</strong>
        ${isDirty ? '<em>未保存</em>' : ''}
        ${preset.tags?.length ? `<small>${preset.tags.map(tag => `<b>${escapeHtml(tag)}</b>`).join('')}</small>` : ''}
      `
      : '<span>編集中の保存編成なし</span>';
    if (elements.formationOverwriteCurrent) {
      elements.formationOverwriteCurrent.disabled = !preset;
      elements.formationOverwriteCurrent.classList.toggle('is-dirty', isDirty);
      elements.formationOverwriteCurrent.title = preset ? `「${preset.name}」へ上書き` : '保存済み編成を読み込むと上書きできます';
    }
  }

  function isFormationPresetDirty(preset) {
    if (!preset?.formation) return false;
    return JSON.stringify(normalizeFormationStateForCompare(preset.formation)) !== JSON.stringify(normalizeFormationStateForCompare(ensureFormationState()));
  }

  function normalizeFormationStateForCompare(formation) {
    const normalized = normalizeFormationState(formation);
    normalized.spells = normalizeFormationSpells(normalized.spells).slice().sort(compareFormationSpellIdsForCompare);
    return normalized;
  }

  function compareFormationSpellIdsForCompare(a, b) {
    const cardA = getCardManagerCards('spell').find(card => card.id === a);
    const cardB = getCardManagerCards('spell').find(card => card.id === b);
    if (cardA && cardB) return compareCardManagerCards(cardA, cardB);
    return String(a || '').localeCompare(String(b || ''), 'ja');
  }

  function renderFormationPresetList() {
    if (!elements.formationSaveList) return;
    const keepDetailsOpen = !!elements.formationSaveList.querySelector('.formation-preset-details[open]');
    const presets = ensureFormationPresetStore();
    if (!presets.length) {
      elements.formationSaveList.innerHTML = '<p class="formation-save-empty">保存済み編成はありません</p>';
      return;
    }
    const favorites = createNumberOptions(1, 6)
      .map(option => presets.find(preset => preset.favoriteSlot === option.value) || null)
      .filter(Boolean);
    const favoriteHtml = favorites.length
      ? `
        <div class="formation-preset-shortcuts" aria-label="お気に入り編成">
          ${favorites.map(preset => `
            <button type="button" class="${preset.id === appState.activeFormationPresetId ? 'is-selected' : ''}" data-formation-preset-load="${escapeAttr(preset.id)}" title="${escapeAttr(preset.name)}">
              <span>${preset.favoriteSlot}</span>
              <strong>${escapeHtml(preset.name)}</strong>
            </button>
          `).join('')}
        </div>
      `
      : '<p class="formation-save-empty">☆から番号を選ぶと 1-6 に表示されます</p>';
    elements.formationSaveList.innerHTML = `
      ${favoriteHtml}
      <details class="formation-preset-details">
        <summary>保存リスト <span>${presets.length}件</span></summary>
        <div class="formation-preset-list">
          ${presets.map(renderFormationPresetCard).join('')}
        </div>
      </details>
    `;
    const details = elements.formationSaveList.querySelector('.formation-preset-details');
    if (details) details.open = keepDetailsOpen;
  }

  function renderFormationPresetCard(preset) {
    const memberCount = getFormationMemberCount(preset.formation);
    const cost = calculateFormationCost(normalizeFormationState(preset.formation));
    return `
      <article class="formation-preset-card ${preset.id === appState.activeFormationPresetId ? 'is-selected' : ''}">
        <div>
          <strong>${escapeHtml(preset.name)}</strong>
          <span>${escapeHtml(memberCount)}人 / コスト ${escapeHtml(cost)}</span>
          ${preset.tags?.length ? `<small>${preset.tags.map(tag => `<b>${escapeHtml(tag)}</b>`).join('')}</small>` : ''}
        </div>
        <div class="formation-preset-actions">
          <button type="button" class="favorite ${preset.favoriteSlot ? 'is-on' : ''}" data-formation-preset-favorite="${escapeAttr(preset.id)}" aria-label="お気に入り番号選択">${preset.favoriteSlot ? preset.favoriteSlot : '☆'}</button>
          <button type="button" data-formation-preset-load="${escapeAttr(preset.id)}">読込</button>
          <button type="button" class="danger" data-formation-preset-delete="${escapeAttr(preset.id)}">削除</button>
        </div>
        ${appState.openFormationFavoritePickerId === preset.id ? renderFormationPresetSlotPicker(preset) : ''}
      </article>
    `;
  }

  function renderFormationPresetSlotPicker(preset) {
    return `
      <div class="formation-preset-slot-picker" aria-label="お気に入り番号">
        ${createNumberOptions(1, 6).map(option => `
          <button type="button" class="${preset.favoriteSlot === option.value ? 'is-selected' : ''}" data-formation-preset-id="${escapeAttr(preset.id)}" data-formation-preset-slot="${option.value}">${option.value}</button>
        `).join('')}
      </div>
    `;
  }

  function ensureFormationPresetStore() {
    appState.savedFormations = normalizeFormationPresetList(appState.savedFormations);
    return appState.savedFormations;
  }

  function parseFormationTags(value) {
    return String(value || '')
      .split(/[,、，\n]+/)
      .map(tag => tag.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  function addFormationTagPreset(tag) {
    if (!elements.formationSaveTags) return;
    const value = String(tag || '').trim();
    if (!value) return;
    const tags = parseFormationTags(elements.formationSaveTags.value);
    if (!tags.includes(value)) tags.push(value);
    elements.formationSaveTags.value = tags.slice(0, 8).join(', ');
    elements.formationSaveTags.focus();
  }

  function renderFormationSynergySummary(formation) {
    if (!elements.formationSynergySummary) return;
    const personalitySynergies = Array.isArray(window.PERSONALITY_SYNERGIES) ? window.PERSONALITY_SYNERGIES : [];
    const raceSynergies = Array.isArray(window.RACE_SYNERGIES) ? window.RACE_SYNERGIES : [];
    if (!personalitySynergies.length && !raceSynergies.length) {
      elements.formationSynergySummary.innerHTML = '';
      return;
    }
    const state = collectFormationSynergyState(formation);
    elements.formationSynergySummary.innerHTML = `
      <section class="formation-synergy-group formation-synergy-personality" aria-label="性格シナジー">
        ${renderFormationSynergySlots('personality', personalitySynergies, state.personality, state.personalityExtras)}
      </section>
      <section class="formation-synergy-group formation-synergy-race" aria-label="種族シナジー">
        ${renderFormationRaceSynergies(raceSynergies, state.race, state.raceExtras)}
      </section>
    `;
  }

  function getFormationMemberCount(formation = ensureFormationState()) {
    return (formation.rows || []).reduce((total, row) =>
      total + (row.apostles || []).filter(Boolean).length
    , 0);
  }

  function renderFormationMemberSummary(formation) {
    if (!elements.formationMemberSummary) return;
    const count = getFormationMemberCount(formation);
    elements.formationMemberSummary.innerHTML = `
      <span class="formation-member-count">
        <span>編成</span>
        <strong>${escapeHtml(count)}</strong>
      </span>
    `;
  }

  function collectFormationSynergyState(formation) {
    const state = {
      personality: {},
      race: {},
      personalityExtras: {},
      raceExtras: {}
    };
    const selectedBasics = [];
    (formation.rows || []).forEach(row => {
      (row.apostles || []).forEach(id => {
        const basic = id ? DATA.getById('basicInfo', id) : null;
        if (!basic) return;
        selectedBasics.push(basic);
        if (basic.性格) state.personality[basic.性格] = (state.personality[basic.性格] || 0) + 1;
        if (basic.種族) state.race[basic.種族] = (state.race[basic.種族] || 0) + 1;
      });
    });
    applyFormationSynergyExtraCounts(state, selectedBasics, formation);
    return state;
  }

  function applyFormationSynergyExtraCounts(state, selectedBasics, formation) {
    const hasUi = selectedBasics.some(basic => basic.id === 'Ui' || basic.id === 'ui' || basic.使徒名 === 'ウイ');
    if (hasUi && (Number(ensureApostleState('Ui').asideRank) || 0) >= 2) {
      state.personality['活発'] = (state.personality['活発'] || 0) + 1;
      state.personalityExtras['活発'] = (state.personalityExtras['活発'] || 0) + 1;
    }
    getFormationSpellPersonalityExtras(formation).forEach(personality => {
      state.personality[personality] = (state.personality[personality] || 0) + 1;
      state.personalityExtras[personality] = (state.personalityExtras[personality] || 0) + 1;
    });
  }

  function getFormationSpellPersonalityExtras(formation = ensureFormationState()) {
    const personalities = ['純粋', '冷静', '狂気', '活発', '憂鬱'];
    const selectedSpellIds = new Set(normalizeFormationSpells(formation.spells));
    const extras = new Set();
    getCardManagerCards('spell').forEach(card => {
      if (!selectedSpellIds.has(card.id)) return;
      const text = [
        card.name,
        ...(card.conditionalEffects || []).flatMap(effect => [
          effect.id,
          effect.label,
          effect.shortLabel,
          effect.description,
          ...(effect.descriptionByStar || [])
        ])
      ].filter(Boolean).join(' ');
      const personality = personalities.find(name => text.includes(`性格『${name}』`) || text.includes(`【${name}】`));
      if (personality) extras.add(personality);
    });
    return Array.from(extras);
  }

  function renderFormationSynergySlots(type, items, counts, extras) {
    const maxSlots = type === 'personality' ? 15 : 9;
    const topCount = type === 'personality' ? 8 : 5;
    const sortedItems = type === 'personality'
      ? sortFormationPersonalitySynergies(items)
      : items;
    const filled = sortedItems.flatMap(item => {
      const count = Math.max(0, Number(counts[item.name]) || 0);
      const extraCount = Math.max(0, Number(extras[item.name]) || 0);
      const baseCount = Math.max(0, count - extraCount);
      return Array.from({ length: count }, (_, index) => ({
        item,
        isExtra: index >= baseCount,
        count,
        memberCount: index + 1
      }));
    }).slice(0, maxSlots);
    return `
      <div class="formation-synergy-slot-grid formation-synergy-slot-grid-${type}" data-formation-synergy-kind="${escapeAttr(type)}" role="button" tabindex="0" aria-label="${type === 'personality' ? '性格シナジー補正を表示' : '種族シナジー補正を表示'}">
        ${Array.from({ length: maxSlots }, (_, index) => {
          const fillOrder = index < topCount ? index * 2 + 1 : (index - topCount) * 2 + 2;
          return renderFormationSynergySlot(type, index, topCount, filled[fillOrder - 1]);
        }).join('')}
      </div>
    `;
  }

  function sortFormationPersonalitySynergies(items) {
    const priority = ['冷静', '憂鬱', '活発', '狂気', '純粋'];
    return items.slice().sort((a, b) => {
      const aIndex = priority.indexOf(a.name);
      const bIndex = priority.indexOf(b.name);
      const aPriority = aIndex >= 0 ? aIndex : priority.length;
      const bPriority = bIndex >= 0 ? bIndex : priority.length;
      return aPriority - bPriority;
    });
  }

  function renderFormationRaceSynergies(items, counts, extras) {
    const activeItems = items
      .map(item => {
        const count = Math.max(0, Number(counts[item.name]) || 0);
        const extraCount = Math.max(0, Number(extras[item.name]) || 0);
        const effect = getFormationSynergyEffectForCount(item, count);
        return { item, count, extraCount, effect };
      })
      .filter(entry => entry.count && entry.effect);

    if (!activeItems.length) {
      return '<div class="formation-race-synergy-list is-empty" data-formation-synergy-kind="race" role="button" tabindex="0" aria-label="種族シナジー補正を表示"></div>';
    }

    return `
      <div class="formation-race-synergy-list" data-formation-synergy-kind="race" role="button" tabindex="0" aria-label="種族シナジー補正を表示">
        ${activeItems.map(({ item, count, extraCount, effect }) => {
          const effectText = formatFormationSynergyEffect(effect);
          const titleParts = [
            item.name,
            `判定 ${count}`,
            extraCount ? `追加判定 +${extraCount}` : '',
            effectText
          ].filter(Boolean);
          return `
            <span class="formation-race-synergy-item" title="${escapeAttr(titleParts.join(' / '))}">
              <img src="${escapeAttr(item.icon)}" alt="${escapeAttr(item.name)}">
              <span class="formation-race-count">×${count}</span>
              ${extraCount ? `<span class="formation-race-extra">+${extraCount}</span>` : ''}
            </span>
          `;
        }).join('')}
      </div>
    `;
  }

  function openFormationSynergyPopover(anchorEl, kind = '') {
    if (!anchorEl) return;
    const popover = ensureFormationSynergyPopover();
    const formation = ensureFormationState();
    const lines = getFormationSynergySummaryLines(formation, kind);
    const title = kind === 'race' ? '種族シナジー補正' : '性格シナジー補正';
    popover.innerHTML = `
      <div class="resource-effect-popover-head">
        <strong>${escapeHtml(title)}</strong>
        <button type="button" data-close-formation-synergy>×</button>
      </div>
      <div class="resource-effect-popover-body formation-synergy-popover-body">
        ${lines.length
          ? lines.map(line => `<p><b>${escapeHtml(line.name)}</b><span>${escapeHtml(line.text)}</span></p>`).join('')
          : '<p>発動中のシナジー補正はありません</p>'}
      </div>
    `;
    popover.querySelector('[data-close-formation-synergy]')?.addEventListener('click', () => {
      popover.hidden = true;
    });
    popover.hidden = false;
    const rect = anchorEl.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - popRect.width - 12);
    const top = Math.min(rect.bottom + 8, window.innerHeight - popRect.height - 12);
    popover.style.left = `${left}px`;
    popover.style.top = `${Math.max(12, top)}px`;
  }

  function ensureFormationSynergyPopover() {
    let popover = document.getElementById('formation-synergy-popover');
    if (!popover) {
      popover = document.createElement('div');
      popover.id = 'formation-synergy-popover';
      popover.className = 'resource-effect-popover formation-synergy-popover';
      popover.hidden = true;
      document.body.appendChild(popover);
      popover.addEventListener('mouseleave', () => {
        popover.hidden = true;
      });
      document.addEventListener('click', event => {
        if (popover.hidden) return;
        if (popover.contains(event.target) || event.target.closest('#formation-synergy-summary')) return;
        popover.hidden = true;
      });
    }
    return popover;
  }

  function getFormationSynergySummaryLines(formation, kind = '') {
    const personalitySynergies = Array.isArray(window.PERSONALITY_SYNERGIES) ? window.PERSONALITY_SYNERGIES : [];
    const raceSynergies = Array.isArray(window.RACE_SYNERGIES) ? window.RACE_SYNERGIES : [];
    const state = collectFormationSynergyState(formation);
    const personalityLines = sortFormationPersonalitySynergies(personalitySynergies).map(item => ({
      item,
      count: Math.max(0, Number(state.personality[item.name]) || 0),
      extraCount: Math.max(0, Number(state.personalityExtras[item.name]) || 0)
    }));
    const raceLines = raceSynergies.map(item => ({
      item,
      count: Math.max(0, Number(state.race[item.name]) || 0),
      extraCount: Math.max(0, Number(state.raceExtras[item.name]) || 0)
    }));
    const sourceLines = kind === 'race'
      ? raceLines
      : kind === 'personality'
        ? personalityLines
        : [
          ...personalityLines,
          ...raceLines
        ];
    const lines = sourceLines.map(({ item, count, extraCount }) => {
      const effect = getFormationSynergyEffectForCount(item, count);
      const text = effect ? formatFormationSynergyEffect(effect) : '';
      return {
        name: `${item.name} ${count}${extraCount ? `(+${extraCount})` : ''}`,
        effect,
        text
      };
    }).filter(line => line.text);
    if (!lines.length) return [];
    const totalEffect = lines.reduce((total, line) => {
      Object.entries(line.effect || {}).forEach(([key, value]) => {
        total[key] = (Number(total[key]) || 0) + (Number(value) || 0);
      });
      return total;
    }, {});
    return [
      { name: '合計', text: formatFormationSynergyEffect(totalEffect) },
      ...lines.map(({ name, text }) => ({ name, text }))
    ];
  }

  function renderFormationSynergySlot(type, index, topCount, entry) {
    const row = index < topCount ? 'top' : 'bottom';
    const fillOrder = index < topCount ? index * 2 + 1 : (index - topCount) * 2 + 2;
    const gridColumn = fillOrder;
    if (!entry) {
      return `
        <span class="formation-synergy-slot" data-row="${row}" style="grid-column:${gridColumn}" title="空きスロット"></span>
      `;
    }
    const { item, isExtra, count, memberCount } = entry;
    const isEffectStep = isFormationSynergyMemberEffective(item, count, memberCount);
    const effect = getFormationSynergyEffectForCount(item, count);
    const effectText = effect ? formatFormationSynergyEffect(effect) : '';
    const nextCount = getFormationSynergyNextCount(item, count);
    const titleParts = [
      item.name,
      `判定 ${count}`,
      isEffectStep ? '' : 'この枠では効果更新なし',
      isExtra ? '追加判定' : '',
      effectText || (nextCount ? `次: ${nextCount}` : '未発動')
    ].filter(Boolean);
    return `
      <span class="formation-synergy-slot is-filled ${isEffectStep ? '' : 'is-redundant'} ${isExtra ? 'is-extra' : ''}" data-row="${row}" style="grid-column:${gridColumn}" title="${escapeAttr(titleParts.join(' / '))}">
        <img class="formation-synergy-slot-icon" src="${escapeAttr(item.icon)}" alt="${escapeAttr(item.name)}">
        ${isExtra ? '<span class="formation-synergy-extra">+</span>' : ''}
      </span>
    `;
  }

  function isFormationSynergyMemberEffective(synergy, totalCount, memberCount) {
    const effectsByCount = synergy?.effectsByCount || {};
    const activeThreshold = Object.keys(effectsByCount)
      .map(key => Number.parseInt(key, 10))
      .filter(value => Number.isFinite(value) && value <= totalCount)
      .sort((a, b) => b - a)[0] || 0;
    return memberCount <= activeThreshold;
  }

  function getFormationSynergyEffectForCount(synergy, count) {
    const effectsByCount = synergy?.effectsByCount || {};
    const direct = effectsByCount[String(count)] || effectsByCount[count];
    if (direct) return direct;
    const threshold = Object.keys(effectsByCount)
      .map(key => Number.parseInt(key, 10))
      .filter(value => Number.isFinite(value) && value <= count)
      .sort((a, b) => b - a)[0];
    return threshold ? (effectsByCount[String(threshold)] || effectsByCount[threshold] || null) : null;
  }

  function getFormationSynergyNextCount(synergy, count) {
    return Object.keys(synergy?.effectsByCount || {})
      .map(key => Number.parseInt(key, 10))
      .filter(value => Number.isFinite(value) && value > count)
      .sort((a, b) => a - b)[0] || 0;
  }

  function formatFormationSynergyEffect(effect = {}) {
    const labels = [
      ['hpP', 'HP'],
      ['addP', '与ダメ'],
      ['atkP', '攻撃'],
      ['hasteP', '攻速'],
      ['skillAddP', 'スキル'],
      ['basicAddP', '通常'],
      ['damageTakenDownP', '被ダメ減'],
      ['critRateP', '会心'],
      ['critDmgP', '会心DMG'],
      ['critRateTakenDownP', '被会心減'],
      ['critDmgTakenDownP', '被会心DMG減'],
      ['spRecoveryP', 'SP回復'],
      ['hpRecoveryP', 'HP回復']
    ];
    return labels
      .filter(([key]) => Number(effect[key]) || 0)
      .map(([key, label]) => `${label}+${formatBoardSummaryValue(Number(effect[key]) || 0)}%`)
      .join(' / ');
  }

  function renderFormationColumn(row, rowIndex) {
    const position = getFormationColumnPosition(rowIndex);
    return `
      <section class="formation-column formation-column-${rowIndex + 1}">
        <div class="formation-column-head">
        <button type="button" data-formation-clear-row="${rowIndex}" title="この列をクリア" aria-label="${escapeAttr(position)}をクリア">×</button>
        </div>
        ${Array.from({ length: 3 }, (_, index) => renderFormationLine(row, rowIndex, index)).join('')}
      </section>
    `;
  }

  function renderFormationLine(row, rowIndex, lineIndex) {
    const apostleId = row.apostles?.[lineIndex] || '';
    const basic = apostleId ? DATA.getById('basicInfo', apostleId) : null;
    const artifacts = Array.isArray(row.artifacts?.[lineIndex]) ? row.artifacts[lineIndex] : [];
    const roleAsset = getRoleAssetName(basic?.役割);
    const attackIcon = basic?.攻撃タイプ ? `img/Attack_${basic.攻撃タイプ === '物理' ? 'phys' : 'mag'}.webp` : '';
    return `
      <div class="formation-line">
        <button type="button" class="formation-apostle-slot ${basic ? 'is-filled' : ''} personality-${escapeAttr(basic?.性格 || '')}" data-formation-apostle-row="${rowIndex}" data-formation-line="${lineIndex}" draggable="true" title="${escapeAttr(basic?.使徒名 || '使徒を選択')}">
          ${basic ? '' : '<img class="formation-slot-bg" src="img/使徒bg.png" alt="">'}
          ${basic ? `<span class="formation-apostle-clip"><img data-apostle-image class="formation-apostle-img" src="${escapeAttr(getApostleImagePath(basic.id))}" alt="${escapeAttr(basic.使徒名 || basic.id)}"></span>` : '<span class="formation-empty-icon">?</span>'}
          ${basic?.性格 ? `<img class="formation-apostle-badge formation-personality-badge" src="img/性格_${escapeAttr(basic.性格)}.webp" alt="${escapeAttr(basic.性格)}" title="${escapeAttr(basic.性格)}">` : ''}
          ${roleAsset ? `<img class="formation-apostle-badge formation-role-badge" src="img/役割_${escapeAttr(roleAsset)}.webp" alt="${escapeAttr(basic.役割 || '')}" title="${escapeAttr(basic.役割 || '')}">` : ''}
          ${attackIcon ? `<img class="formation-apostle-badge formation-attack-badge" src="${escapeAttr(attackIcon)}" alt="${escapeAttr(basic.攻撃タイプ)}" title="${escapeAttr(basic.攻撃タイプ)}">` : ''}
        </button>
        <div class="formation-artifact-list">
          ${Array.from({ length: 3 }, (_, artifactSlot) => renderFormationArtifactSlot(artifacts[artifactSlot] || '', rowIndex, lineIndex, artifactSlot)).join('')}
        </div>
      </div>
    `;
  }

  function renderFormationArtifactSlot(artifactId, rowIndex, lineIndex, artifactSlot) {
    const artifact = artifactId ? getCardManagerCards('artifact').find(card => card.id === artifactId) : null;
    const apostleId = ensureFormationState().rows?.[rowIndex]?.apostles?.[lineIndex] || '';
    const basic = apostleId ? DATA.getById('basicInfo', apostleId) : null;
    const isFavoriteEquipped = !!artifact?.signature
      && !!basic
      && String(artifact.favoriteCharacter || '') === String(basic.使徒名 || '');
    return `
      <button type="button" class="formation-artifact-slot ${artifact ? 'is-filled' : ''} ${artifact ? getCardManagerRarityClass(artifact) : ''} ${isFavoriteEquipped ? 'is-favorite-equipped' : ''}" data-formation-artifact-row="${rowIndex}" data-formation-artifact-line="${lineIndex}" data-formation-artifact-slot="${artifactSlot}" title="${escapeAttr(artifact?.name || '遺物を選択')}">
        <img class="formation-slot-bg" src="${escapeAttr(getFormationArtifactBg(artifact))}" alt="">
        ${artifact ? `<img class="formation-artifact-img" src="${escapeAttr(getCardManagerImagePath(artifact))}" alt="${escapeAttr(artifact.name)}">` : '<span class="formation-empty-icon">+</span>'}
      </button>
    `;
  }

  function renderFormationSpells(formation = ensureFormationState(), options = {}) {
    if (!elements.formationSpellList) return;
    const deferCatalog = options.deferCatalog !== false;
    const spells = normalizeFormationSpells(formation.spells);
    const cards = getCardManagerCards('spell').slice().sort(compareCardManagerCards);
    const cardById = new Map(cards.map(card => [card.id, card]));
    const counts = countFormationSpellIds(spells);
    const selectedRows = getSortedFormationSpellRows(spells, cardById);
    elements.formationSpellList.innerHTML = `
      <div class="formation-spell-head">
        <span>スペル</span>
        <div class="formation-spell-head-actions">
          <small>${spells.length ? `${spells.length}枚選択中` : '未選択'}</small>
          <button type="button" class="formation-spell-detail-toggle" data-formation-spell-details ${spells.length ? '' : 'disabled'}>
            詳細を${view.formationSpellDetailsOpen ? '閉じる' : '表示'}
          </button>
        </div>
      </div>
      <div class="formation-spell-selected" aria-label="選択中スペル">
        ${spells.length
          ? selectedRows.map(row => renderFormationSelectedSpell(row.card, row.id, row.count)).join('')
          : '<span class="formation-spell-empty">下のカードを押すと追加されます</span>'}
      </div>
      ${spells.length && view.formationSpellDetailsOpen ? renderFormationSpellDetails(selectedRows) : ''}
      <div class="formation-spell-catalog" aria-label="スペル一覧">
        ${deferCatalog ? '<span class="formation-spell-empty">スペル一覧を準備中...</span>' : cards.map((card, index) => renderFormationSpellCard(card, counts[card.id] || 0, index)).join('')}
      </div>
    `;
    if (deferCatalog) scheduleFormationSpellCatalogRender(cards, counts);
  }

  function scheduleFormationSpellCatalogRender(cards, counts) {
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    scheduleFormationSpellCatalogRender.token = token;
    const renderCatalog = () => {
      if (scheduleFormationSpellCatalogRender.token !== token) return;
      const catalog = elements.formationSpellList?.querySelector('.formation-spell-catalog');
      if (!catalog) return;
      catalog.innerHTML = cards.map((card, index) => renderFormationSpellCard(card, counts[card.id] || 0, index)).join('');
    };
    requestAnimationFrame(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(renderCatalog, { timeout: 280 });
      } else {
        window.setTimeout(renderCatalog, 40);
      }
    });
  }

  function renderFormationSelectedSpell(card, index, count = 1) {
    if (!card) return '';
    return `
      <button type="button" class="formation-spell-selected-card ${getCardManagerRarityClass(card)}" data-formation-spell-remove-id="${escapeAttr(index)}" title="${escapeAttr(`${card.name}を外す`)}">
        <img class="formation-spell-img" src="${escapeAttr(getCardManagerImagePath(card))}" alt="${escapeAttr(card.name)}" loading="eager" decoding="async" fetchpriority="high">
        ${count > 1 ? `<span class="formation-spell-count">x${escapeHtml(count)}</span>` : ''}
      </button>
    `;
  }

  function getSortedFormationSpellRows(spells, cardById) {
    const counts = countFormationSpellIds(spells);
    return Object.keys(counts)
      .map(id => ({ id, count: counts[id], card: cardById.get(id) }))
      .filter(row => row.card)
      .sort((a, b) => compareCardManagerCards(a.card, b.card));
  }

  function renderFormationSpellDetails(rows) {
    return `
      <div class="formation-spell-detail-list">
        ${rows.map(row => {
          const { id, card, count } = row;
          if (!card) return '';
          const state = getCardState(id);
          const star = normalizeCardStar(state.star);
          const solder = normalizeCardSolder(state.solder);
          const lines = getCardManagerEffectSummary(card, star, solder);
          return `
            <section class="formation-spell-detail-card ${getCardManagerRarityClass(card)}">
              <div class="formation-spell-detail-title">
                <img src="${escapeAttr(getCardManagerImagePath(card))}" alt="" loading="lazy" decoding="async" fetchpriority="low">
                <strong>${escapeHtml(card.name)}</strong>
                <span>${escapeHtml(`x${count || 1}`)}</span>
              </div>
              <div class="formation-spell-detail-body">
                ${lines.map(line => `<p>${escapeHtml(line)}</p>`).join('')}
              </div>
            </section>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderFormationSpellCard(card, count, index = 0) {
    const priority = getCardManagerImagePriority(index);
    return `
      <div class="formation-spell-card ${getCardManagerRarityClass(card)} ${count ? 'is-selected' : ''}" title="${escapeAttr(card.name)}">
        <span class="formation-spell-card-art">
          <img class="formation-spell-img" src="${escapeAttr(getCardManagerImagePath(card))}" alt="${escapeAttr(card.name)}" loading="${priority.loading}" decoding="async" fetchpriority="${priority.fetchPriority}">
          ${renderFormationCostBadge(card.cost)}
        </span>
        <span class="formation-spell-name">${escapeHtml(card.name)}</span>
        <span class="formation-spell-qty" aria-label="${escapeAttr(`${card.name}の選択枚数`)}">
          <button type="button" class="formation-spell-qty-btn" data-formation-spell-card="${escapeAttr(card.id)}" data-formation-spell-step="-1" ${count ? '' : 'disabled'}>−</button>
          <span class="formation-spell-qty-value ${count ? 'is-on' : ''}">${escapeHtml(count)}</span>
          <button type="button" class="formation-spell-qty-btn" data-formation-spell-card="${escapeAttr(card.id)}" data-formation-spell-step="1">+</button>
        </span>
      </div>
    `;
  }

  function countFormationSpellIds(spells = []) {
    return spells.reduce((counts, id) => {
      if (!id) return counts;
      counts[id] = (counts[id] || 0) + 1;
      return counts;
    }, {});
  }

  function addFormationSpell(spellId) {
    if (!spellId) return;
    const formation = ensureFormationState();
    formation.spells = normalizeFormationSpells(formation.spells);
    formation.spells.push(spellId);
    saveState({ refreshSnapshots: false });
    renderFormationAfterSpellChange(formation, { anchorSpellId: spellId });
  }

  function adjustFormationSpellCount(spellId, step) {
    if (!spellId || !step) return;
    if (step > 0) {
      addFormationSpell(spellId);
      return;
    }
    removeFormationSpell(spellId);
  }

  function removeFormationSpell(spellId) {
    if (!spellId) return;
    const formation = ensureFormationState();
    const spells = normalizeFormationSpells(formation.spells);
    const index = spells.indexOf(spellId);
    if (index < 0) return;
    spells.splice(index, 1);
    formation.spells = spells;
    saveState({ refreshSnapshots: false });
    renderFormationAfterSpellChange(formation, { anchorSpellId: spellId });
  }

  function renderFormationAfterSpellChange(formation = ensureFormationState(), options = {}) {
    const anchorSpellId = options.anchorSpellId || '';
    const catalogScrollTop = getFormationSpellCatalogElement()?.scrollTop ?? 0;
    const anchorTop = anchorSpellId
      ? getFormationSpellCatalogCardElement(anchorSpellId)?.getBoundingClientRect().top
      : null;
    renderFormationSpells(formation, { deferCatalog: false });
    const nextCatalog = getFormationSpellCatalogElement();
    if (nextCatalog) nextCatalog.scrollTop = catalogScrollTop;
    renderFormationCostSummary(formation);
    renderFormationSynergySummary(formation);
    renderFormationActivePreset();
    renderFormationPresetList();
    requestAnimationFrame(() => {
      const catalog = getFormationSpellCatalogElement();
      if (catalog) catalog.scrollTop = catalogScrollTop;
      if (anchorTop === null || anchorTop === undefined) return;
      const anchor = getFormationSpellCatalogCardElement(anchorSpellId);
      if (!anchor) return;
      const nextTop = anchor.getBoundingClientRect().top;
      if (!Number.isFinite(nextTop)) return;
      window.scrollBy(0, nextTop - anchorTop);
    });
  }

  function getFormationSpellCatalogElement() {
    return elements.formationSpellList?.querySelector('.formation-spell-catalog') || null;
  }

  function getFormationSpellCatalogCardElement(spellId) {
    if (!spellId || !elements.formationSpellList) return null;
    return Array.from(elements.formationSpellList.querySelectorAll('.formation-spell-card')).find(card => {
      const button = card.querySelector('[data-formation-spell-card]');
      return button?.dataset.formationSpellCard === spellId;
    }) || null;
  }

  function renderFormationKeepingScroll() {
    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    renderFormation();
    requestAnimationFrame(() => window.scrollTo(scrollX, scrollY));
  }

  function renderFormationCostBadge(cost) {
    const value = Number(cost) || 0;
    return `
      <span class="formation-cost-badge" title="コスト ${value}">
        <img src="img/Card/cost.webp" alt="">
        <span class="formation-cost-text formation-cost-text-stroke">${escapeHtml(value)}</span>
        <span class="formation-cost-text formation-cost-text-fill">${escapeHtml(value)}</span>
      </span>
    `;
  }

  function renderFormationCostSummary(formation) {
    if (!elements.formationCostSummary) return;
    const totalCost = calculateFormationCost(formation);
    ensureFormationCoinState(formation);
    const ownedCoins = normalizeFormationCoins(formation.coins);
    const remainingCoins = ownedCoins - totalCost;
    const totalCombatPower = getSavedTotalCombatPower();
    const autoCoins = calculateFormationAutoCoins(totalCombatPower);
    const isAuto = formation.coinMode === 'auto';
    elements.formationCostSummary.innerHTML = `
      <div class="formation-coin-box ${remainingCoins < 0 ? 'is-short' : ''} ${isAuto ? 'is-auto' : 'is-manual'}">
        <span class="formation-coin-owned">
          <span>所持${isAuto ? '<em>自動</em>' : ''}</span>
          <button type="button" class="formation-coin-input-wrap" data-formation-coin-open aria-expanded="false" title="クリックして所持コインを入力">
            <img src="img/Card/ef_coin.webp" alt="">
            <span class="formation-coin-display formation-coin-display-stroke" data-formation-coin-display>${escapeHtml(formatNumber(ownedCoins))}</span>
            <span class="formation-coin-display formation-coin-display-fill" data-formation-coin-display>${escapeHtml(formatNumber(ownedCoins))}</span>
          </button>
          <span class="formation-coin-popover" data-formation-coin-popover hidden>
            <span class="formation-coin-auto-note">総合CP ${escapeHtml(formatNumber(totalCombatPower))} → ${escapeHtml(formatNumber(autoCoins))}枚</span>
            <label>
              <span>所持コイン</span>
              <input type="number" min="0" step="1" inputmode="numeric" data-formation-coin-input value="${escapeAttr(ownedCoins)}" aria-label="所持コイン数">
            </label>
            <button type="button" data-formation-coin-auto>自動算出を反映</button>
            <button type="button" data-formation-coin-manual>手動入力にする</button>
            <button type="button" data-formation-coin-close>閉じる</button>
          </span>
        </span>
        <span class="formation-total-cost">
          <span>使用</span>
          <span class="formation-cost-badge formation-cost-badge-total" title="総コスト ${totalCost}">
            <img src="img/Card/cost.webp" alt="">
            <span class="formation-cost-text formation-cost-text-stroke">${escapeHtml(totalCost)}</span>
            <span class="formation-cost-text formation-cost-text-fill">${escapeHtml(totalCost)}</span>
          </span>
        </span>
        <span class="formation-coin-remain">
          <span>残り</span>
          <strong class="formation-metric-number ${remainingCoins < 0 ? 'is-negative' : ''}" data-formation-coin-remain aria-label="${escapeAttr(`残り${formatNumber(remainingCoins)}`)}">
            <span class="formation-metric-number-stroke">${escapeHtml(formatNumber(remainingCoins))}</span>
            <span class="formation-metric-number-fill">${escapeHtml(formatNumber(remainingCoins))}</span>
          </strong>
        </span>
      </div>
    `;
  }

  function updateFormationCoinSummary(formation = ensureFormationState()) {
    const box = elements.formationCostSummary?.querySelector('.formation-coin-box');
    const remain = elements.formationCostSummary?.querySelector('[data-formation-coin-remain]');
    const displays = elements.formationCostSummary?.querySelectorAll('[data-formation-coin-display]');
    const input = elements.formationCostSummary?.querySelector('[data-formation-coin-input]');
    const note = elements.formationCostSummary?.querySelector('.formation-coin-auto-note');
    if (!box || !remain) return;
    ensureFormationCoinState(formation);
    const ownedCoins = normalizeFormationCoins(formation.coins);
    const remainingCoins = ownedCoins - calculateFormationCost(formation);
    const totalCombatPower = getSavedTotalCombatPower();
    const autoCoins = calculateFormationAutoCoins(totalCombatPower);
    box.classList.toggle('is-short', remainingCoins < 0);
    box.classList.toggle('is-auto', formation.coinMode === 'auto');
    box.classList.toggle('is-manual', formation.coinMode !== 'auto');
    displays?.forEach(display => { display.textContent = formatNumber(ownedCoins); });
    if (input && document.activeElement !== input) input.value = String(ownedCoins);
    if (note) note.textContent = `総合CP ${formatNumber(totalCombatPower)} → ${formatNumber(autoCoins)}枚`;
    remain.classList.toggle('is-negative', remainingCoins < 0);
    remain.setAttribute('aria-label', `残り${formatNumber(remainingCoins)}`);
    remain.querySelectorAll('.formation-metric-number-stroke, .formation-metric-number-fill')
      .forEach(node => { node.textContent = formatNumber(remainingCoins); });
  }

  function closeFormationCoinPopover() {
    const popover = elements.formationCostSummary?.querySelector('[data-formation-coin-popover]');
    const button = elements.formationCostSummary?.querySelector('[data-formation-coin-open]');
    if (popover) popover.hidden = true;
    button?.setAttribute('aria-expanded', 'false');
  }

  function calculateFormationCost(formation = ensureFormationState()) {
    const artifacts = getCardManagerCards('artifact');
    const spells = getCardManagerCards('spell');
    const artifactCost = (formation.rows || []).reduce((total, row) => {
      const artifactIds = (row.artifacts || []).flat();
      return total + artifactIds.reduce((sum, id) => {
        const card = id ? artifacts.find(item => item.id === id) : null;
        return sum + (Number(card?.cost) || 0);
      }, 0);
    }, 0);
    const spellCost = (formation.spells || []).reduce((sum, id) => {
      const card = id ? spells.find(item => item.id === id) : null;
      return sum + (Number(card?.cost) || 0);
    }, 0);
    return artifactCost + spellCost;
  }

  function getFormationApostleFilterGroups() {
    return getApostleFilterGroups().filter(group => group.key !== 'position');
  }

  function renderFormationPickerFilters() {
    if (!elements.formationPickerFilters || !elements.formationFilterCount) return;
    const groups = getFormationApostleFilterGroups();
    const activeCount = Object.values(view.formationFilters)
      .reduce((total, values) => total + values.size, 0);
    elements.formationFilterCount.textContent = activeCount ? `${activeCount}件選択中` : '';
    elements.formationPickerFilters.innerHTML = renderApostleFilterControls(
      groups,
      view.formationFilters,
      'formation'
    );
  }

  function matchesFormationPickerFilters(basic) {
    return [
      ['personality', basic.性格],
      ['species', basic.種族],
      ['role', basic.役割]
    ].every(([group, value]) => {
      const selected = view.formationFilters[group];
      return !selected || selected.size === 0 || selected.has(value);
    });
  }

  function getFormationApostleSubText(basic) {
    const state = ensureApostleState(basic.id);
    const main = view.formationSort === 'level'
      ? `Lv ${state.level}`
      : view.formationSort === 'rank'
        ? `Rank ${state.rank}`
        : view.formationSort === 'combatPower'
          ? `CP ${formatCompactCombatPower(getApostleCombatPowerForSort(basic.id))}`
        : basic.配列 || '';
    return [main, basic.性格, basic.種族, basic.役割]
      .filter(Boolean)
      .join(' / ');
  }

  function openFormationPicker(type, rowIndex, lineIndex = 0, artifactSlot = 0) {
    if (!elements.formationPickerDialog) return;
    view.formationPicker = { type, rowIndex, lineIndex, artifactSlot };
    elements.formationPickerSearch.value = '';
    elements.formationPickerTitle.textContent = type === 'apostle'
      ? `${getFormationColumnPosition(rowIndex)}の使徒を選択`
      : type === 'spell'
        ? 'スペルを選択'
        : '遺物を選択';
    if (elements.formationPickerSortWrap) elements.formationPickerSortWrap.hidden = type !== 'apostle';
    if (elements.formationFilterDetails) elements.formationFilterDetails.hidden = type !== 'apostle';
    if (type === 'apostle') {
      if (elements.formationPickerSort) elements.formationPickerSort.value = view.formationSort;
      renderFormationPickerFilters();
    }
    renderFormationPickerOptions();
    elements.formationPickerDialog.showModal();
    elements.formationPickerSearch.focus();
  }

  function renderFormationPickerOptions() {
    if (!elements.formationPickerGrid || !view.formationPicker) return;
    const query = String(elements.formationPickerSearch?.value || '').toLocaleLowerCase('ja');
    const { type, rowIndex } = view.formationPicker;
    const targetPosition = type === 'apostle' ? getFormationColumnPosition(rowIndex) : '';
    const items = type === 'apostle'
      ? DATA.sheets.basicInfo
        .filter(basic => !targetPosition || (basic.配列 || basic.配置列 || '') === targetPosition)
        .filter(matchesFormationPickerFilters)
        .sort((a, b) => compareApostleRowsBySort(a, b, view.formationSort))
        .map(basic => ({
          id: basic.id,
          label: basic.使徒名 || basic.id,
          sub: getFormationApostleSubText(basic),
          image: getApostleImagePath(basic.id),
          imageAttrs: 'data-apostle-image',
          apostle: basic,
          personality: basic.性格 || ''
        }))
      : getCardManagerCards(type === 'spell' ? 'spell' : 'artifact').slice().sort(compareCardManagerCards).map(card => ({ id: card.id, label: card.name, sub: `${card.rarity || ''}${card.signature ? ' / 愛用' : ''}`, image: getCardManagerImagePath(card), card }));
    const filtered = items.filter(item => !query || [item.label, item.sub, item.id]
      .filter(Boolean)
      .some(value => String(value).toLocaleLowerCase('ja').includes(query)));
    elements.formationPickerGrid.innerHTML = `
      <button type="button" class="formation-picker-option is-clear" data-formation-picker-value="">
        <span class="formation-picker-option-empty">×</span>
        <span><strong>未選択</strong><small>この枠を空にする</small></span>
      </button>
      ${filtered.map(item => `
        <button type="button" class="formation-picker-option ${item.card ? getCardManagerRarityClass(item.card) : ''} ${item.apostle ? `personality-${escapeAttr(item.personality)}` : ''}" data-formation-picker-value="${escapeAttr(item.id)}">
          <span class="formation-picker-option-image-wrap">
            ${item.card && item.card.kind === 'artifact' ? `<img class="formation-picker-option-bg" src="${escapeAttr(getFormationArtifactBg(item.card))}" alt="">` : ''}
            <img ${item.imageAttrs || ''} src="${escapeAttr(item.image)}" alt="">
            ${item.card ? renderFormationCostBadge(item.card.cost) : ''}
          </span>
          <span class="formation-picker-option-text">
            <strong>${escapeHtml(item.label)}</strong>
            <small>${escapeHtml(item.sub || '')}</small>
          </span>
          ${item.card ? `
            <span class="formation-picker-option-tools">
              <span class="formation-picker-effect-btn ${getCardManagerEffectCount(item.card) ? 'has-effect' : ''}" role="button" tabindex="0" data-formation-picker-effect="${escapeAttr(item.card.id)}" aria-label="${escapeAttr(`${item.card.name}の効果`)}">i</span>
            </span>
          ` : ''}
        </button>
      `).join('')}
    `;
  }

  function applyFormationPickerValue(value) {
    if (!view.formationPicker) return;
    const formation = ensureFormationState();
    const { type, rowIndex, lineIndex, artifactSlot } = view.formationPicker;
    if (type === 'spell') {
      formation.spells = normalizeFormationSpells(formation.spells);
      if (value) formation.spells.push(value);
    } else if (type === 'apostle') {
      const row = formation.rows[rowIndex];
      if (!row) return;
      row.apostles[lineIndex] = value;
    } else {
      const row = formation.rows[rowIndex];
      if (!row) return;
      if (!Array.isArray(row.artifacts[lineIndex])) row.artifacts[lineIndex] = ['', '', ''];
      row.artifacts[lineIndex][artifactSlot] = value;
    }
    saveState({ refreshSnapshots: false });
    renderFormation();
    elements.formationPickerDialog.close();
  }

  function swapFormationApostlesInRow(sourceRow, sourceLine, targetRow, targetLine) {
    if (![sourceRow, sourceLine, targetRow, targetLine].every(Number.isFinite)) return;
    if (sourceRow !== targetRow || sourceLine === targetLine) return;
    const formation = ensureFormationState();
    const row = formation.rows[sourceRow];
    if (!row) return;
    const apostles = row.apostles || ['', '', ''];
    const artifacts = row.artifacts || [[], [], []];
    [apostles[sourceLine], apostles[targetLine]] = [apostles[targetLine] || '', apostles[sourceLine] || ''];
    [artifacts[sourceLine], artifacts[targetLine]] = [artifacts[targetLine] || ['', '', ''], artifacts[sourceLine] || ['', '', '']];
    row.apostles = apostles;
    row.artifacts = artifacts;
    saveState({ refreshSnapshots: false });
    renderFormation();
  }

  function clearFormationDragState() {
    if (!elements.formationBoard) return;
    elements.formationBoard.classList.remove('is-dragging-apostle');
    delete elements.formationBoard.dataset.dragFormationRow;
    elements.formationBoard.querySelectorAll('.is-dragging, .is-drop-compatible, .is-drop-target').forEach(node => {
      node.classList.remove('is-dragging', 'is-drop-compatible', 'is-drop-target');
    });
  }

  function clearFormationRow(rowIndex) {
    const formation = ensureFormationState();
    if (!formation.rows[rowIndex]) return;
    formation.rows[rowIndex] = createDefaultFormationRow();
    saveState({ refreshSnapshots: false });
    renderFormation();
  }

  function ensureFormationState() {
    if (!appState.formation || typeof appState.formation !== 'object') appState.formation = createDefaultFormation();
    if (!Array.isArray(appState.formation.rows)) appState.formation.rows = [];
    while (appState.formation.rows.length < 3) appState.formation.rows.push(createDefaultFormationRow());
    appState.formation.rows = appState.formation.rows.slice(0, 3).map(row => normalizeFormationRow(row));
    appState.formation.spells = normalizeFormationSpells(appState.formation.spells);
    ensureFormationCoinState(appState.formation);
    return appState.formation;
  }

  function normalizeFormationState(formation) {
    const normalized = {
      cardKind: formation?.cardKind === 'spell' ? 'spell' : 'artifact',
      rows: Array.isArray(formation?.rows) ? formation.rows.slice(0, 3).map(row => normalizeFormationRow(row)) : [],
      spells: normalizeFormationSpells(formation?.spells),
      coins: normalizeFormationCoins(formation?.coins),
      coinMode: formation?.coinMode === 'auto' ? 'auto' : 'manual'
    };
    while (normalized.rows.length < 3) normalized.rows.push(createDefaultFormationRow());
    return normalized;
  }

  function createDefaultFormation() {
    return { cardKind: 'artifact', rows: Array.from({ length: 3 }, createDefaultFormationRow), spells: [], coins: 0, coinMode: 'manual' };
  }

  function createDefaultFormationRow() {
    return { apostles: ['', '', ''], artifacts: Array.from({ length: 3 }, () => ['', '', '']) };
  }

  function normalizeFormationRow(row) {
    const sourceArtifacts = Array.isArray(row?.artifacts) ? row.artifacts : [];
    return {
      apostles: Array.from({ length: 3 }, (_, index) => row?.apostles?.[index] || ''),
      artifacts: Array.from({ length: 3 }, (_, lineIndex) => {
        const line = sourceArtifacts[lineIndex];
        if (Array.isArray(line)) return Array.from({ length: 3 }, (_, artifactSlot) => line[artifactSlot] || '');
        return [line || '', '', ''];
      })
    };
  }

  function normalizeFormationSpells(spells) {
    return Array.isArray(spells) ? spells.filter(Boolean) : [];
  }

  function normalizeFormationCoins(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
  }

  function ensureFormationCoinState(formation = ensureFormationState()) {
    formation.coinMode = formation.coinMode === 'auto' ? 'auto' : 'manual';
    if (formation.coinMode === 'auto') formation.coins = calculateFormationAutoCoins();
    else formation.coins = normalizeFormationCoins(formation.coins);
    return formation;
  }

  function calculateFormationAutoCoins(totalCombatPower = getSavedTotalCombatPower()) {
    return Math.floor((Number(totalCombatPower) || 0) * FORMATION_COIN_CP_RATE + FORMATION_COIN_BONUS) + FORMATION_COIN_BASE;
  }

  function currentApostleCombatPower() {
    return Number(currentApostleState()?.statSnapshots?.current?.stats?.combatPower) || 0;
  }

  function getSavedTotalCombatPower() {
    const saved = Number(appState.totalCombatPower);
    if (Number.isFinite(saved) && saved > 0) return Math.floor(saved);
    return calculateTotalCombatPowerFromSnapshots();
  }

  function calculateTotalCombatPowerFromSnapshots() {
    return (DATA.sheets.basicInfo || []).reduce((total, basic) => {
      const state = ensureApostleState(basic.id);
      return total + (Number(state.statSnapshots?.current?.stats?.combatPower) || 0);
    }, 0);
  }

  function updateTotalCombatPowerFromSnapshots() {
    appState.totalCombatPower = calculateTotalCombatPowerFromSnapshots();
    if (appState.formation?.coinMode === 'auto') {
      appState.formation.coins = calculateFormationAutoCoins(appState.totalCombatPower);
    }
  }

  function getFormationColumnPosition(rowIndex) {
    return ['後列', '中列', '前列'][Number(rowIndex) || 0] || '後列';
  }

  function getFormationArtifactBg(card) {
    if (!card) return 'img/遺物bg_0.png';
    if (card.signature) return 'img/遺物bg_4.png';
    if (card.rarity === '伝説') return 'img/遺物bg_4.png';
    if (card.rarity === '希少') return 'img/遺物bg_3.png';
    if (card.rarity === '高級') return 'img/遺物bg_2.png';
    return 'img/遺物bg_0.png';
  }

  function getCardManagerEffectSummary(card, star, solder) {
    const lines = [];
    const baseBonus = Array.isArray(card.bonusesByStar) ? card.bonusesByStar[star - 1] : null;
    lines.push(`★${star}: ${formatCardManagerBonuses(baseBonus)}`);
    const solderBonus = card.solderBonuses?.[solder];
    lines.push(`はんだ+${solder}: ${solder > 0 ? formatCardManagerBonuses(solderBonus) : '追加効果なし'}`);
    (card.conditionalEffects || []).forEach(effect => {
      const label = effect.label || effect.shortLabel || effect.id || '特殊効果';
      const bonus = Array.isArray(effect.bonusesByStar) ? effect.bonusesByStar[star - 1] : null;
      const desc = Array.isArray(effect.descriptionByStar) ? effect.descriptionByStar[star - 1] : effect.description;
      const parts = [label];
      const bonusText = formatCardManagerBonuses(bonus);
      if (bonusText !== '補正なし') parts.push(bonusText);
      if (desc) parts.push(String(desc).replace(/\s+/g, ' '));
      lines.push(parts.join(': '));
    });
    return lines.length ? lines : ['効果データなし'];
  }

  function getCardManagerEffectCount(card) {
    const hasBaseBonus = (card.bonusesByStar || []).some(bonus => (
      bonus
      && typeof bonus === 'object'
      && Object.values(bonus).some(value => value !== undefined && value !== null && value !== '' && Number(value) !== 0)
    ));
    return (hasBaseBonus ? 1 : 0) + (card.conditionalEffects || []).length + (card.solderBonuses ? 1 : 0);
  }

  function getCardManagerNameFontSize(name) {
    const length = Array.from(String(name || '')).length;
    if (length >= 18) return '0.58rem';
    if (length >= 14) return '0.64rem';
    if (length >= 10) return '0.72rem';
    return '0.82rem';
  }

  function getCardManagerCards(kind) {
    if (typeof CARD_LIBRARY === 'undefined') return [];
    return CARD_LIBRARY[kind === 'spell' ? 'spells' : 'artifacts'] || [];
  }

  function cardMatchesManagerRarity(card, rarity) {
    if (!rarity) return true;
    if (rarity === 'signature') return !!card.signature;
    return card.rarity === rarity && !card.signature;
  }

  function cardMatchesManagerEffect(card, effect) {
    if (!effect) return true;
    if (effect === 'toggle') return (card.conditionalEffects || []).length > 0;
    const statKeyGroups = {
      hp: ['hpP'],
      attack: ['atkP'],
      haste: ['hasteP'],
      crit: ['critRateP', 'critDmgP'],
      defense: ['defP', 'critResP', 'critDmgResP'],
      'hp-recovery': ['hpRecoveryP'],
      healing: ['healingP']
    };
    if (statKeyGroups[effect]) return cardHasAnyBaseOrSolderBonusKey(card, statKeyGroups[effect]);
    if (effect === 'sp-recovery') {
      return cardHasAnyBonusKey(card, ['spRecoveryP', 'spRegenP', 'spP'])
        || cardHasConditionalEffectText(card, ['SP回復', '毎秒SP', 'SP+', 'SPを']);
    }
    if (effect === 'damage-up') return cardHasAnyBonusKey(card, ['addP']);
    if (effect === 'damage-taken') return cardHasAnyBonusKey(card, ['takenDmgP']);
    return true;
  }

  function cardHasAnyBaseOrSolderBonusKey(card, keys) {
    const hasKeys = bonus => keys.some(key => Number(bonus?.[key] || 0) !== 0);
    if ((card.bonusesByStar || []).some(hasKeys)) return true;
    return !!card.solderBonuses && Object.values(card.solderBonuses).some(hasKeys);
  }

  function cardHasAnyBonusKey(card, keys) {
    const hasKeys = bonus => keys.some(key => Number(bonus?.[key] || 0) !== 0);
    if ((card.bonusesByStar || []).some(hasKeys)) return true;
    if (card.solderBonuses && Object.values(card.solderBonuses).some(hasKeys)) return true;
    return (card.conditionalEffects || []).some(effect => (effect.bonusesByStar || []).some(hasKeys));
  }

  function cardHasConditionalEffectText(card, patterns) {
    return (card.conditionalEffects || []).some(effect => {
      const texts = [
        effect.id,
        effect.label,
        effect.shortLabel,
        effect.description,
        ...(effect.descriptionByStar || [])
      ].filter(Boolean);
      return texts.some(text => patterns.some(pattern => String(text).includes(pattern)));
    });
  }

  function compareCardManagerCards(a, b) {
    const rarityDiff = getCardManagerRarityRank(b) - getCardManagerRarityRank(a);
    if (rarityDiff) return rarityDiff;
    const costDiff = Number(getCardManagerCost(b, 5) || 0) - Number(getCardManagerCost(a, 5) || 0);
    if (costDiff) return costDiff;
    return String(a.name || '').localeCompare(String(b.name || ''), 'ja');
  }

  function getCardManagerRarityRank(card) {
    if (card.signature) return 5;
    if (card.rarity === '伝説') return 4;
    if (card.rarity === '希少') return 3;
    if (card.rarity === '高級') return 2;
    return 1;
  }

  function getCardManagerImagePath(card) {
    const folder = card.kind === 'artifact' ? 'Artifact' : 'Spell';
    return `img/Card/${folder}/${card.imageFile || `${card.name}.webp`}`;
  }

  function getCardManagerRarityFrame(card) {
    if (card.signature) return 'img/Card/Card_Signature.webp';
    if (card.rarity === '伝説') return 'img/Card/Card_Legendary.webp';
    if (card.rarity === '希少') return 'img/Card/Card_Unique.webp';
    if (card.rarity === '高級') return 'img/Card/Card_Rare.webp';
    return '';
  }

  function getCardManagerRarityClass(card) {
    if (card.signature) return 'rarity-signature';
    if (card.rarity === '伝説') return 'rarity-legendary';
    if (card.rarity === '希少') return 'rarity-unique';
    if (card.rarity === '高級') return 'rarity-rare';
    return '';
  }

  function getCardManagerCost(card, star) {
    if (Array.isArray(card.costByStar) && card.costByStar.length) {
      return card.costByStar[Math.min(Math.max(star, 1), card.costByStar.length) - 1] ?? card.costByStar[0];
    }
    return card.cost ?? '-';
  }

  function formatCardManagerBonuses(bonuses) {
    if (!bonuses || typeof bonuses !== 'object') return '補正なし';
    const labels = {
      hpP: 'HP',
      atkP: '攻撃',
      defP: '防御',
      critStatP: '会心ステ',
      critDmgStatP: '会心DMGステ',
      critRateP: '会心',
      critDmgP: '会心DMG',
      critResStatP: '会心抵抗ステ',
      critDmgResStatP: '会心DMG抵抗ステ',
      critResP: '会心抵抗',
      critDmgResP: '会心DMG抵抗',
      enemyDefDownP: '敵防御減',
      enemyCritResDownP: '敵会心抵抗減',
      enemyCritDmgResDownP: '敵会心DMG抵抗減',
      hasteP: '攻速',
      healingP: 'HP治癒',
      hpRecoveryP: 'HP回復',
      spRecoveryP: 'SP回復',
      spRegenP: '毎秒SP',
      spP: 'SP',
      addP: '与ダメ',
      takenDmgP: '被ダメ',
      specialP: '特殊',
      otherP: 'その他',
      basicAddP: '普通攻撃ダメージ',
      skillAddP: 'スキルダメージ'
    };
    const text = Object.entries(bonuses)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${labels[key] || key}+${value}%`)
      .join(' / ');
    return text || '補正なし';
  }

  function getCardState(cardId) {
    return appState.cards?.[cardId] || { owned: false, star: 1, solder: 0 };
  }

  function ensureCardState(cardId) {
    if (!appState.cards || typeof appState.cards !== 'object') appState.cards = {};
    if (!appState.cards[cardId]) appState.cards[cardId] = { owned: false, star: 1, solder: 0 };
    appState.cards[cardId].star = normalizeCardStar(appState.cards[cardId].star);
    appState.cards[cardId].solder = normalizeCardSolder(appState.cards[cardId].solder);
    if (appState.cards[cardId].star < 5) appState.cards[cardId].solder = 0;
    appState.cards[cardId].owned = !!appState.cards[cardId].owned;
    return appState.cards[cardId];
  }

  function normalizeCardStar(value) {
    return Math.min(5, Math.max(1, Number(value) || 1));
  }

  function normalizeCardSolder(value) {
    return Math.min(2, Math.max(0, Number(value) || 0));
  }

  function renderBoardGlobalOverview() {
    if (!isDashboardPanelActive('global')) syncBoardDraftToGlobalDraft();
    const query = elements.boardGlobalSearch.value.trim().toLocaleLowerCase('ja');
    renderBoardGlobalFilters();
    elements.boardGlobalProgressSummary.innerHTML = renderBoardGlobalProgressSummary();
    const rows = DATA.sheets.basicInfo
      .filter(basic => !query || [basic.使徒名, basic.id, basic.性格, basic.種族, basic.役割]
        .filter(Boolean)
        .some(value => String(value).toLocaleLowerCase('ja').includes(query)))
      .map(basic => ({
        basic,
        result: collectBoardGlobalEffectsForApostle(basic.id, getGlobalBoardDisplayBoards(basic.id))
      }))
      .filter(({ result }) => result.nodes.some(({ row }) =>
        row.マス_type === '特殊' && matchesBoardGlobalFilters(row)
      ))
      .sort((a, b) => {
        const nameOrder = String(a.basic.使徒名 || a.basic.id).localeCompare(
          String(b.basic.使徒名 || b.basic.id),
          'ja',
          { sensitivity: 'base' }
        );
        if (view.boardGlobalSort === 'planned') {
          const plannedOrder = Number(hasBoardGlobalPlannedChange(b.basic.id)) - Number(hasBoardGlobalPlannedChange(a.basic.id));
          if (plannedOrder) return plannedOrder;
          return nameOrder;
        }
        if (view.boardGlobalSort !== 'progress') return nameOrder;
        return b.result.filledSpecialCount - a.result.filledSpecialCount || nameOrder;
      });

    const hasChanges = Object.keys(globalBoardDrafts).length > 0;
    const planMode = view.boardGlobalMode === 'plan';
    const savedPlanCount = getSavedBoardPlanApostleIds().length;
    elements.boardGlobalModeCurrent.classList.toggle('is-active', !planMode);
    elements.boardGlobalModePlan.classList.toggle('is-active', planMode);
    elements.boardGlobalSort.value = view.boardGlobalSort;
    elements.boardGlobalCancel.disabled = !hasChanges;
    elements.boardGlobalSavePlan.disabled = !hasChanges;
    elements.boardGlobalConfirm.hidden = planMode;
    elements.boardGlobalConfirm.disabled = planMode || !hasChanges;
    elements.boardGlobalSavePlan.textContent = planMode ? '予定を保存' : '予定として保存';
    elements.boardGlobalDiscardPlan.hidden = !planMode;
    elements.boardGlobalDiscardPlan.disabled = !savedPlanCount;
    elements.boardGlobalDiscardPlan.textContent = savedPlanCount
      ? `保存予定を破棄 (${savedPlanCount})`
      : '保存予定を破棄';
    elements.boardGlobalOverviewSummary.innerHTML = renderGlobalBoardChangeSummary();
    elements.boardGlobalOverviewList.innerHTML = rows
      .map(({ basic, result }) => renderBoardGlobalApostleCard(basic, result))
      .join('') || '<p class="empty-note">一致する使徒がいません。</p>';
    if (elements.boardGlobalBottomSummary) {
      elements.boardGlobalBottomSummary.innerHTML = renderBoardGlobalBottomSummary(rows);
    }
  }

  function hasBoardGlobalPlannedChange(id) {
    const draft = globalBoardDrafts[id];
    if (draft?.mode === 'plan') {
      return hasBoardSnapshotDiff(ensureApostleState(id).boards || {}, draft.boards || {});
    }
    const state = ensureApostleState(id);
    if (!state.plannedBoards || typeof state.plannedBoards !== 'object') return false;
    return hasBoardSnapshotDiff(state.boards || {}, state.plannedBoards || {});
  }

  function renderBoardGlobalBottomSummary(rows) {
    if (!rows.length) return '';
    const summary = collectBoardGlobalBottomSummary(rows);
    const selected = summary.counts.lower + summary.counts.advanced + summary.counts.special;
    return `
      <section class="board-global-stat-summary">
        <div class="board-global-stat-summary-head">
          <strong>表示中の統計</strong>
          <span>${formatNumber(rows.length)}使徒 / ${formatNumber(selected)}マス選択中</span>
        </div>
        <div class="board-global-stat-summary-counts">
          <span><img src="img/Board/Tileicon_1.webp" alt="">通常 ${formatNumber(summary.counts.lower)}</span>
          <span><img src="img/Board/Tileicon_2.webp" alt="">上級 ${formatNumber(summary.counts.advanced)}</span>
          <span><img src="img/Board/Tileicon_3.webp" alt="">特殊 ${formatNumber(summary.counts.special)}</span>
        </div>
        <div class="summary-table-grid board-global-stat-summary-grid">
          ${renderGlobalBoardCostSummary(summary.costs, { signed: false, emptyText: 'コストなし' })}
          ${renderBoardDraftEffectMatrix(summary.effectGroups, { title: '合計' })}
        </div>
      </section>
    `;
  }

  function collectBoardGlobalBottomSummary(rows) {
    const costs = {
      gold: 0,
      lower: 0,
      middle: 0,
      upper: 0,
      special: 0,
      sharedToken: 0,
      apostleToken: 0
    };
    const effectGroups = {
      special: new Map(),
      advanced: new Map(),
      lower: new Map()
    };
    const counts = { lower: 0, advanced: 0, special: 0 };
    rows.forEach(({ basic }) => {
      const boards = getGlobalBoardDisplayBoards(basic.id);
      (DATA.getById('board', basic.id) || []).forEach(row => {
        if (row.マス_type === 'スタート') return;
        if (!boards?.[String(row.ボード階層)]?.filled?.[boardKey(row)]) return;
        const tileGroup = getBoardSummaryTileGroup(row.マス_type);
        if (tileGroup) counts[tileGroup] += 1;
        costs.gold += Number(row.ゴールド) || 0;
        costs.lower += Number(row.下級) || 0;
        costs.middle += Number(row.中級) || 0;
        costs.upper += Number(row.上級) || 0;
        costs.special += Number(row.特級) || 0;
        costs.sharedToken += Number(row['★1共同教団証']) || 0;
        costs.apostleToken += Number(row.使徒証) || 0;
        addBoardSummaryEffect(effectGroups, row.効果1_type, row.効果1_value, row.マス_type);
        addBoardSummaryEffect(effectGroups, row.効果2_type, row.効果2_value, row.マス_type);
      });
    });
    return { costs, effectGroups, counts };
  }

  function getBoardSummaryTileGroup(tileType) {
    if (tileType === '特殊') return 'special';
    if (tileType === '上級') return 'advanced';
    return 'lower';
  }

  function getSavedBoardPlanApostleIds() {
    return DATA.sheets.basicInfo
      .map(basic => basic.id)
      .filter(id => {
        const state = ensureApostleState(id);
        return state.plannedBoards
          && typeof state.plannedBoards === 'object'
          && hasBoardSnapshotDiff(state.boards || {}, state.plannedBoards);
      });
  }

  function discardAllSavedBoardPlans() {
    const savedIds = getSavedBoardPlanApostleIds();
    if (!savedIds.length) return;
    const draftCount = Object.values(globalBoardDrafts).filter(draft => draft?.mode === 'plan').length;
    const editingNote = draftCount || boardDraft?.mode === 'plan'
      ? '\n予定モードで編集中の変更も破棄されます。'
      : '';
    if (!window.confirm(`${savedIds.length}使徒分の保存予定をすべて破棄しますか？\n現在状態は変更されません。${editingNote}`)) return;

    Object.values(appState.apostles || {}).forEach(state => {
      delete state.plannedBoards;
      delete state.plannedBoardShortcutTargets;
    });
    Object.keys(globalBoardDrafts).forEach(id => {
      if (globalBoardDrafts[id]?.mode === 'plan') delete globalBoardDrafts[id];
    });
    if (boardDraft?.mode === 'plan') boardDraft = null;
    saveState();
    render();
  }

  function collectBoardGlobalEffectsForApostle(id, boards) {
    const flat = createEmptyTotals();
    const percent = createEmptyTotals();
    const nodes = [];
    let count = 0;
    (DATA.getById('board', id) || []).forEach(row => {
      if (row.マス_type !== '上級' && row.マス_type !== '特殊') return;
      const board = boards?.[String(row.ボード階層)];
      const filled = !!board?.filled?.[boardKey(row)];
      nodes.push({ row, filled });
      if (filled) {
        addBoardRowToSummary(row, flat, percent);
        count += 1;
      }
    });
    const specialNodes = nodes.filter(({ row }) => row.マス_type === '特殊');
    return {
      flat,
      percent,
      count,
      nodes,
      filledSpecialCount: specialNodes.filter(item => item.filled).length,
      specialCount: specialNodes.length
    };
  }

  function renderBoardGlobalApostleCard(basic, result) {
    if (!result.nodes.length) return '';
    const specialNodes = result.nodes.filter(({ row }) =>
      row.マス_type === '特殊' && matchesBoardGlobalFilters(row)
    );
    if (!specialNodes.length) return '';
    const nodes = [1, 2, 3].map(layer => {
      const layerNodes = specialNodes.filter(({ row }) => Number(row.ボード階層) === layer);
      if (!layerNodes.length) return '';
      const tiles = layerNodes.map(({ row }) => renderBoardGlobalTile(basic.id, row)).join('');
      return `
        <div class="board-global-layer board-global-layer-${layer}">
          <span class="board-global-layer-label">B${layer}</span>
          <span class="board-global-layer-tiles">${tiles}</span>
        </div>
      `;
    }).join('');
    const assetId = getApostleAssetId(basic.id);
    return `
      <section class="board-global-card personality-${escapeAttr(basic.性格 || '')}">
        <div class="board-global-card-head">
          <button
            type="button"
            class="board-global-apostle-link"
            data-board-global-open-apostle="${escapeAttr(basic.id)}"
            title="${escapeAttr(`${basic.使徒名 || basic.id}のボードを開く`)}"
          >
            <img data-apostle-image class="board-global-apostle-icon" src="img/Chara/Skill/Skill_P_${escapeAttr(assetId)}.webp" alt="">
            <span class="board-global-apostle-meta">
              <span class="board-global-apostle-name">${escapeHtml(basic.使徒名 || basic.id)}</span>
              <span class="board-global-apostle-traits">${escapeHtml(basic.性格 || '')} / ${escapeHtml(basic.種族 || '')}</span>
            </span>
          </button>
          <strong>${escapeHtml(result.filledSpecialCount)} / ${escapeHtml(result.specialCount)}</strong>
        </div>
        <div class="board-global-tiles">${nodes || '<span class="empty-note">特殊マスなし</span>'}</div>
      </section>
    `;
  }

  function renderBoardGlobalFilters() {
    const layerOptions = [1, 2, 3];
    const statOptions = BOARD_GLOBAL_STAT_GROUPS;
    const activeCount = view.boardGlobalFilters.layers.size + view.boardGlobalFilters.stats.size;
    elements.boardGlobalFilterCount.textContent = activeCount ? `${activeCount}件選択中` : '';
    elements.boardGlobalFilters.innerHTML = `
      <div class="board-global-filter-row">
        <strong>ボード</strong>
        ${layerOptions.map(layer => renderBoardGlobalFilterButton('layers', String(layer), `B${layer}`)).join('')}
      </div>
      <div class="board-global-filter-row board-global-stat-filter-row">
        <strong>特殊マス</strong>
        ${statOptions.map(stat => `
          <button
            type="button"
            class="${view.boardGlobalFilters.stats.has(stat.key) ? 'is-active' : ''}"
            data-board-global-filter-group="stats"
            data-board-global-filter-value="${escapeAttr(stat.key)}"
            title="${escapeAttr(stat.label)}"
          >
            <img src="img/Board/${escapeAttr(stat.icon)}" alt="">
          </button>
        `).join('')}
      </div>
    `;
  }

  function renderBoardGlobalFilterButton(group, value, label) {
    return `
      <button
        type="button"
        class="${view.boardGlobalFilters[group].has(value) ? 'is-active' : ''}"
        data-board-global-filter-group="${escapeAttr(group)}"
        data-board-global-filter-value="${escapeAttr(value)}"
      >${escapeHtml(label)}</button>
    `;
  }

  function matchesBoardGlobalFilters(row) {
    const layerFilters = view.boardGlobalFilters.layers;
    const statFilters = view.boardGlobalFilters.stats;
    if (layerFilters.size && !layerFilters.has(String(row.ボード階層))) return false;
    if (!statFilters.size) return true;
    return getBoardRowStatGroupKeys(row).some(key => statFilters.has(key));
  }

  function getBoardRowStatKeys(row) {
    const flat = createEmptyTotals();
    const percent = createEmptyTotals();
    addBoardRowToSummary(row, flat, percent);
    return TOTAL_LABELS
      .filter(stat => (Number(flat[stat.key]) || 0) || (Number(percent[stat.key]) || 0))
      .map(stat => stat.key);
  }

  function getBoardRowStatGroupKeys(row) {
    const statKeys = new Set(getBoardRowStatKeys(row));
    return BOARD_GLOBAL_STAT_GROUPS
      .filter(group => group.stats.some(key => statKeys.has(key)))
      .map(group => group.key);
  }

  function renderBoardGlobalProgressSummary() {
    const createLayerSummary = () => ({
      filled: 0,
      total: 0,
      flat: createEmptyTotals(),
      percent: createEmptyTotals(),
      specialCounts: Object.fromEntries(BOARD_GLOBAL_STAT_GROUPS.map(group => [group.key, { filled: 0, total: 0 }]))
    });
    const layers = {
      1: createLayerSummary(),
      2: createLayerSummary(),
      3: createLayerSummary()
    };
    DATA.sheets.basicInfo.forEach(basic => {
      const boards = getGlobalBoardDisplayBoards(basic.id);
      (DATA.getById('board', basic.id) || []).forEach(row => {
        const layer = layers[Number(row.ボード階層)];
        if (!layer || (row.マス_type !== '上級' && row.マス_type !== '特殊')) return;
        const filled = !!boards?.[String(row.ボード階層)]?.filled?.[boardKey(row)];
        if (row.マス_type === '特殊') {
          layer.total += 1;
          if (filled) layer.filled += 1;
          getBoardRowStatGroupKeys(row).forEach(key => {
            layer.specialCounts[key].total += 1;
            if (filled) layer.specialCounts[key].filled += 1;
          });
        }
        if (filled) addBoardRowToSummary(row, layer.flat, layer.percent);
      });
    });
    const totalFilled = Object.values(layers).reduce((sum, layer) => sum + layer.filled, 0);
    const totalCount = Object.values(layers).reduce((sum, layer) => sum + layer.total, 0);
    return `
      <div class="board-global-ratio-list">
        ${renderBoardGlobalRatio('全体', totalFilled, totalCount)}
        ${Object.entries(layers).map(([layer, value]) =>
          renderBoardGlobalRatio(`B${layer}`, value.filled, value.total)
        ).join('')}
      </div>
      <div class="board-global-stat-matrices">
        ${Object.entries(layers).map(([layer, value]) => renderBoardGlobalStatMatrix(layer, value)).join('')}
      </div>
    `;
  }

  function renderBoardGlobalRatio(label, filled, total) {
    const percent = total ? Math.round(filled / total * 100) : 0;
    const layerClass = /^B[123]$/.test(label) ? ` board-global-ratio-layer-${label.slice(1)}` : '';
    return `
      <div class="board-global-ratio${layerClass}">
        <span>${escapeHtml(label)}</span>
        <strong>${formatNumber(filled)} / ${formatNumber(total)}</strong>
        <small>${percent}%</small>
      </div>
    `;
  }

  function renderBoardGlobalStatMatrix(layer, values) {
    return `
      <table class="board-global-stat-matrix board-global-stat-matrix-${escapeAttr(layer)}">
        <thead>
          <tr>
            <th>B${escapeHtml(layer)}</th>
            <th title="上級マス"><img src="img/Board/Tileicon_2.webp" alt="上級"></th>
            <th title="特殊マス"><img src="img/Board/Tileicon_3.webp" alt="特殊"></th>
          </tr>
        </thead>
        <tbody>
          ${BOARD_GLOBAL_STAT_GROUPS.map(group => `
            <tr>
              <th title="${escapeAttr(group.label)}"><img src="img/Board/${escapeAttr(group.icon)}" alt="${escapeAttr(group.label)}"></th>
              <td>${renderBoardGlobalGroupedValue(values.flat, group, '')}</td>
              <td class="board-global-special-value">
                <strong>${renderBoardGlobalGroupedValue(values.percent, group, '%')}</strong>
                <small title="特殊マス達成数">${values.specialCounts[group.key].filled}/${values.specialCounts[group.key].total}</small>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function renderBoardGlobalGroupedValue(totals, group, suffix) {
    const values = group.stats.map(key => Number(totals[key]) || 0);
    if (values.length === 1 || values.every(value => value === values[0])) {
      return `${formatNumber(values[0])}${suffix}`;
    }
    return values
      .map((value, index) => `${group.parts?.[index] || ''}${formatNumber(value)}${suffix}`)
      .join(' / ');
  }

  function renderBoardGlobalTile(apostleId, row) {
    const state = ensureApostleState(apostleId);
    const currentFilled = !!state.boards?.[String(row.ボード階層)]?.filled?.[boardKey(row)];
    const baselineBoards = getGlobalBoardBaselineBoards(apostleId);
    const targetBoards = getGlobalBoardDisplayBoards(apostleId);
    const baselineFilled = !!baselineBoards?.[String(row.ボード階層)]?.filled?.[boardKey(row)];
    const filled = !!targetBoards?.[String(row.ボード階層)]?.filled?.[boardKey(row)];
    const pending = filled !== baselineFilled;
    const pendingType = pending ? (filled ? 'is-pending-add' : 'is-pending-remove') : '';
    const planned = view.boardGlobalMode === 'plan' && filled !== currentFilled;
    const iconPath = getBoardIconPath(row, filled);
    const key = boardKey(row);
    return `
      <button
        type="button"
        class="board-shortcut board-global-tile ${boardNodeClass(row)} ${filled ? 'is-filled' : 'is-locked'} ${planned ? 'is-planned' : ''} ${pending ? 'is-pending' : ''} ${pendingType}"
        data-board-global-apostle-id="${escapeAttr(apostleId)}"
        data-board-global-layer="${escapeAttr(row.ボード階層)}"
        data-board-global-key="${escapeAttr(key)}"
        title="${escapeAttr(`ボード${row.ボード階層} ${formatBoardEffect(row)}`)}"
        style="--tile-base: url('${escapeAttr(getBoardTileBasePath(row, filled))}');"
      >
        ${iconPath ? `<img src="${escapeAttr(iconPath)}" alt="">` : ''}
      </button>
    `;
  }

  function getGlobalBoardBaselineBoards(id) {
    const state = ensureApostleState(id);
    if (view.boardGlobalMode === 'plan') return state.plannedBoards || state.boards || {};
    return state.boards || {};
  }

  function getGlobalBoardDisplayBoards(id) {
    return globalBoardDrafts[id]?.boards || getGlobalBoardBaselineBoards(id);
  }

  function findGlobalBoardDraftChangedLayer(id, draft) {
    const baseline = getGlobalBoardBaselineBoards(id);
    const changed = (DATA.getById('board', id) || [])
      .filter(row => row.マス_type !== 'スタート')
      .find(row => {
        const layer = String(row.ボード階層);
        const key = boardKey(row);
        return !!baseline?.[layer]?.filled?.[key] !== !!draft.boards?.[layer]?.filled?.[key];
      });
    return changed ? Number(changed.ボード階層) : 0;
  }

  function switchGlobalBoardMode(mode) {
    if (mode === view.boardGlobalMode) return;
    if (Object.keys(globalBoardDrafts).length
      && !window.confirm('全体ボードの未保存変更を取り消してモードを切り替えますか？')) return;
    globalBoardDrafts = {};
    view.boardGlobalMode = mode;
    if (!view.boardGlobalSortTouched) {
      view.boardGlobalSort = mode === 'plan' ? 'planned' : 'name';
    }
    render();
  }

  function toggleGlobalBoardSpecial(id, layer, key) {
    const rows = DATA.getById('board', id) || [];
    const target = rows.find(row => Number(row.ボード階層) === Number(layer) && boardKey(row) === key);
    if (!target || target.マス_type !== '特殊') return;

    if (!globalBoardDrafts[id]) {
      const baselineBoards = cloneJson(getGlobalBoardBaselineBoards(id));
      globalBoardDrafts[id] = {
        mode: view.boardGlobalMode,
        boards: baselineBoards,
        shortcutTargets: view.boardGlobalMode === 'plan'
          ? mergeShortcutTargetMaps(
            collectFilledSpecialTargetsForApostle(id, baselineBoards),
            ensureApostleState(id).plannedBoardShortcutTargets || {}
          )
          : collectFilledSpecialTargetsForApostle(id, baselineBoards)
      };
    }

    const previous = {
      id: view.id,
      board: view.board,
      mode: view.boardEditMode,
      draft: boardDraft
    };
    try {
      view.id = id;
      view.board = Number(layer);
      view.boardEditMode = view.boardGlobalMode;
      boardDraft = {
        apostleId: id,
        mode: view.boardGlobalMode,
        boards: cloneJson(globalBoardDrafts[id].boards),
        shortcutTargets: cloneJson(globalBoardDrafts[id].shortcutTargets || {})
      };
      const layerKey = String(layer);
      const selectedTargets = new Set(boardDraft.shortcutTargets[layerKey] || []);
      const removing = selectedTargets.has(key);
      if (removing) {
        selectedTargets.delete(key);
        boardDraft.shortcutTargets[layerKey] = Array.from(selectedTargets);
      } else {
        selectedTargets.add(key);
        boardDraft.shortcutTargets[layerKey] = Array.from(selectedTargets);
      }
      boardDraft.shortcutTargets = normalizeShortcutTargets(boardDraft.shortcutTargets);
      rebuildBoardShortcutDraftFromTargets(
        boardDraft.shortcutTargets,
        removing && view.boardShortcutOffMode === 'route'
      );
      globalBoardDrafts[id] = {
        mode: view.boardGlobalMode,
        boards: cloneJson(boardDraft.boards),
        shortcutTargets: cloneJson(boardDraft.shortcutTargets || {})
      };
    } finally {
      view.id = previous.id;
      view.board = previous.board;
      view.boardEditMode = previous.mode;
      boardDraft = previous.draft;
    }

    if (!hasGlobalBoardDraftChanges(id)) delete globalBoardDrafts[id];
  }

  function hasGlobalBoardDraftChanges(id) {
    const draft = globalBoardDrafts[id];
    if (!draft) return false;
    const baseline = getGlobalBoardBaselineBoards(id);
    return (DATA.getById('board', id) || []).some(row => {
      if (row.マス_type === 'スタート') return false;
      const layer = String(row.ボード階層);
      const key = boardKey(row);
      return !!baseline?.[layer]?.filled?.[key] !== !!draft.boards?.[layer]?.filled?.[key];
    });
  }

  function applyGlobalBoardDrafts(destination) {
    const appliedIds = new Set(Object.keys(globalBoardDrafts));
    Object.entries(globalBoardDrafts).forEach(([id, draft]) => {
      const state = ensureApostleState(id);
      if (destination === 'plan') {
        state.plannedBoards = cloneJson(draft.boards);
        state.plannedBoardShortcutTargets = cloneJson(draft.shortcutTargets || {});
        return;
      }
      const newBoards = cloneJson(draft.boards);
      const previousId = view.id;
      view.id = id;
      const rebasedPlan = rebaseSavedBoardPlan(state, newBoards);
      view.id = previousId;
      state.boards = newBoards;
      if (rebasedPlan) {
        state.plannedBoards = rebasedPlan.boards;
        state.plannedBoardShortcutTargets = rebasedPlan.shortcutTargets;
      } else {
        delete state.plannedBoards;
        delete state.plannedBoardShortcutTargets;
      }
    });
    if (boardDraft && appliedIds.has(boardDraft.apostleId)) boardDraft = null;
    globalBoardDrafts = {};
    saveState();
  }

  function applyDisplayedGlobalBoardPlansToCurrent() {
    const changedIds = DATA.sheets.basicInfo
      .map(basic => basic.id)
      .filter(id => hasBoardSnapshotDiff(ensureApostleState(id).boards || {}, getGlobalBoardDisplayBoards(id) || {}));
    if (!changedIds.length) return;
    const draftCount = Object.values(globalBoardDrafts).filter(draft => draft?.mode === 'plan').length;
    const draftNote = draftCount ? `\n予定モードで編集中の${draftCount}使徒分も現在に反映します。` : '';
    if (!window.confirm(`${changedIds.length}使徒分の予定ボードを現在状態に反映しますか？\n反映後、対象使徒の保存予定は削除されます。${draftNote}`)) return;

    changedIds.forEach(id => {
      const state = ensureApostleState(id);
      state.boards = cloneJson(getGlobalBoardDisplayBoards(id) || state.boards || {});
      delete state.plannedBoards;
      delete state.plannedBoardShortcutTargets;
      delete globalBoardDrafts[id];
    });
    if (boardDraft && changedIds.includes(boardDraft.apostleId)) boardDraft = null;
    saveState();
  }

  function handleBoardGlobalAction(action) {
    if (action === 'cancel') {
      globalBoardDrafts = {};
      render();
      return;
    }
    if (action === 'plan') {
      applyGlobalBoardDrafts('plan');
      render();
      return;
    }
    if (action === 'current') {
      applyGlobalBoardDrafts('current');
      render();
      return;
    }
    if (action === 'apply-plan-current') {
      applyDisplayedGlobalBoardPlansToCurrent();
      render();
    }
  }

  function renderGlobalBoardChangeSummary() {
    const costs = {
      gold: 0,
      lower: 0,
      middle: 0,
      upper: 0,
      special: 0,
      sharedToken: 0,
      apostleToken: 0
    };
    const flat = createEmptyTotals();
    const percent = createEmptyTotals();
    let changedApostles = 0;
    let added = 0;
    let removed = 0;

    DATA.sheets.basicInfo.forEach(basic => {
      const state = ensureApostleState(basic.id);
      const current = state.boards || {};
      const target = getGlobalBoardDisplayBoards(basic.id);
      let apostleChanged = false;
      (DATA.getById('board', basic.id) || []).forEach(row => {
        if (row.マス_type === 'スタート') return;
        const layer = String(row.ボード階層);
        const key = boardKey(row);
        const currentFilled = !!current?.[layer]?.filled?.[key];
        const targetFilled = !!target?.[layer]?.filled?.[key];
        if (currentFilled === targetFilled) return;
        const direction = targetFilled ? 1 : -1;
        apostleChanged = true;
        if (direction > 0) added += 1;
        else removed += 1;
        costs.gold += (Number(row.ゴールド) || 0) * direction;
        costs.lower += (Number(row.下級) || 0) * direction;
        costs.middle += (Number(row.中級) || 0) * direction;
        costs.upper += (Number(row.上級) || 0) * direction;
        costs.special += (Number(row.特級) || 0) * direction;
        costs.sharedToken += (Number(row['★1共同教団証']) || 0) * direction;
        costs.apostleToken += (Number(row.使徒証) || 0) * direction;
        if (row.マス_type === '上級' || row.マス_type === '特殊') {
          addSignedBoardGlobalEffect(row, direction, flat, percent);
        }
      });
      if (apostleChanged) changedApostles += 1;
    });

    if (!changedApostles) {
      return `
        <div class="board-global-floating-host">
          ${renderBoardGlobalFloatingSummary(0, 0, 0, costs, flat, percent)}
        </div>
      `;
    }

    return `
      <div class="board-global-floating-host">
        ${renderBoardGlobalFloatingSummary(changedApostles, added, removed, costs, flat, percent)}
      </div>
    `;
  }

  function renderBoardGlobalFloatingSummary(changedApostles, added, removed, costs, flat, percent) {
    const hasChanges = Number(changedApostles) > 0;
    return `
      <div class="board-global-floating-dock ${hasChanges ? 'has-changes' : 'is-empty'}">
        <span class="board-global-floating-mode" aria-label="全体ボード編集モード">
          <button type="button" class="${view.boardGlobalMode === 'current' ? 'is-active' : ''}" data-board-global-floating-mode="current">現在</button>
          <button type="button" class="${view.boardGlobalMode === 'plan' ? 'is-active' : ''}" data-board-global-floating-mode="plan">予定</button>
        </span>
        <button type="button" class="board-shortcut-off-toggle board-global-shortcut-off-toggle ${view.boardShortcutOffMode === 'route' ? 'is-route' : ''}" data-board-shortcut-off-toggle>
          ${view.boardShortcutOffMode === 'route' ? 'OFF時: 経路整理' : 'OFF時: マスのみ'}
        </button>
        <details class="board-global-floating-summary">
          <summary title="変更内容">i</summary>
          <div class="board-global-floating-panel">
            ${hasChanges ? `
              <div class="board-global-change-head">
                <strong>${view.boardGlobalMode === 'plan' ? '変更予定' : '編集中'}</strong>
                <span>${changedApostles}使徒 / 追加${added}マス${removed ? ` / 解除${removed}マス` : ''}</span>
              </div>
              <div class="rank-summary-tables">
                ${renderGlobalBoardCostSummary(costs)}
                ${renderGlobalBoardEffectChangeMatrix(flat, percent)}
              </div>
            ` : '<p class="empty-note board-global-no-change">現在状態からの変更はありません。</p>'}
          </div>
        </details>
        <details class="board-global-floating-save">
          <summary title="保存・反映" aria-label="保存・反映">💾</summary>
          <div class="board-global-floating-save-panel">
            ${renderBoardGlobalSummaryActions('floating', !hasChanges)}
          </div>
        </details>
      </div>
    `;
  }

  function renderBoardGlobalSummaryActions(placement = 'inline', disabled = false) {
    const planMode = view.boardGlobalMode === 'plan';
    const disabledAttr = disabled ? ' disabled' : '';
    return `
      <div class="board-global-summary-actions board-global-summary-actions-${escapeAttr(placement)}" aria-label="全体ボード変更操作">
        <button type="button" class="secondary" data-board-global-summary-action="cancel"${disabledAttr}>変更を取消</button>
        <button type="button" class="plan" data-board-global-summary-action="plan"${disabledAttr}>${planMode ? '予定を保存' : '予定として保存'}</button>
        ${planMode
          ? `<button type="button" class="primary" data-board-global-summary-action="apply-plan-current"${disabledAttr}>予定を現在に反映</button>`
          : `<button type="button" class="primary" data-board-global-summary-action="current"${disabledAttr}>現在状態に反映</button>`}
      </div>
    `;
  }

  function renderGlobalBoardCostSummary(costs, options = {}) {
    const signed = options.signed !== false;
    const emptyText = options.emptyText || 'コスト変更なし';
    const items = [
      ['gold', 'ゴールド', 'img/ゴールド.webp'],
      ['lower', '下級くれよん', 'img/下級くれよん.webp'],
      ['middle', '中級くれよん', 'img/中級くれよん.webp'],
      ['upper', '上級くれよん', 'img/上級くれよん.webp'],
      ['special', '特級くれよん', 'img/特級くれよん.webp'],
      ['sharedToken', '★1共同教団証', 'img/★1共同教団証.webp'],
      ['apostleToken', '使徒証', 'img/使徒証.webp']
    ].filter(([key]) => costs[key]);
    if (!items.length) return `<p class="empty-note board-global-cost-empty">${escapeHtml(emptyText)}</p>`;
    return `
      <div class="board-global-cost-summary" aria-label="消費アイテム差分">
        ${items.map(([key, label, icon]) => `
          <span class="board-global-cost-chip ${costs[key] < 0 ? 'is-negative' : ''}" title="${escapeAttr(label)}">
            <img src="${escapeAttr(icon)}" alt="${escapeAttr(label)}">
            <strong>${escapeHtml(signed ? formatSignedBoardValue(costs[key]) : formatNumber(costs[key]))}</strong>
          </span>
        `).join('')}
      </div>
    `;
  }

  function renderGlobalBoardEffectChangeMatrix(flat, percent) {
    const hasChange = BOARD_GLOBAL_STAT_GROUPS.some(group =>
      group.stats.some(key => (Number(flat[key]) || 0) || (Number(percent[key]) || 0))
    );
    if (!hasChange) return '<p class="empty-note board-global-cost-empty">全体効果変更なし</p>';
    return `
      <table class="board-global-stat-matrix board-global-change-matrix">
        <thead>
          <tr>
            <th>差分</th>
            <th title="上級マス"><img src="img/Board/Tileicon_2.webp" alt="上級"></th>
            <th title="特殊マス"><img src="img/Board/Tileicon_3.webp" alt="特殊"></th>
          </tr>
        </thead>
        <tbody>
          ${BOARD_GLOBAL_STAT_GROUPS.map(group => `
            <tr>
              <th title="${escapeAttr(group.label)}"><img src="img/Board/${escapeAttr(group.icon)}" alt="${escapeAttr(group.label)}"></th>
              <td>${renderSignedBoardGlobalGroupedValue(flat, group, '')}</td>
              <td>${renderSignedBoardGlobalGroupedValue(percent, group, '%')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function renderSignedBoardGlobalGroupedValue(totals, group, suffix) {
    const values = group.stats.map(key => Number(totals[key]) || 0);
    if (values.length === 1 || values.every(value => value === values[0])) {
      return values[0] ? `${formatSignedBoardValue(values[0])}${suffix}` : '0';
    }
    return values
      .map((value, index) => `${group.parts?.[index] || ''}${value ? formatSignedBoardValue(value) : '0'}${suffix}`)
      .join(' / ');
  }

  function addSignedBoardGlobalEffect(row, direction, flatTotals, percentTotals) {
    [['効果1_type', '効果1_value'], ['効果2_type', '効果2_value']].forEach(([typeKey, valueKey]) => {
      const type = row[typeKey];
      const value = (Number(row[valueKey]) || 0) * direction;
      if (!type || !value) return;
      addNamedStat(row.マス_type === '特殊' ? percentTotals : flatTotals, type, value);
    });
  }

  function formatSignedStatSummary(totals, suffix) {
    return TOTAL_LABELS
      .map(item => {
        const value = Number(totals[item.key]) || 0;
        return value ? `${item.label}${formatSignedBoardValue(value)}${suffix}` : '';
      })
      .filter(Boolean)
      .join(' / ');
  }

  function renderBoardSpecial(rows) {
    if (!rows?.length) {
      elements.boardSpecial.innerHTML = '';
      return;
    }
    const html = [1, 2, 3].map(layer => {
      const unlocked = isBoardLayerUnlocked(layer);
      const shortcuts = rows
        .filter(row => Number(row.ボード階層) === layer)
        .filter(row => row.マス_type === '特殊')
        .sort((a, b) => Number(a.Y_pos) - Number(b.Y_pos) || Number(a.X_pos) - Number(b.X_pos));
      if (!shortcuts.length) return '';
      const buttons = shortcuts.map(row => {
        const typeClass = boardNodeClass(row);
        const board = getBoardStateForLayer(layer);
        const key = boardKey(row);
        const selected = (board.targets || []).includes(key) || !!board.filled?.[key];
        const committed = isCommittedBoardRowFilled(row);
        const baseline = isBoardBaselineRowFilled(row);
        const pending = selected !== baseline;
        const pendingType = pending ? (selected ? 'is-pending-add' : 'is-pending-remove') : '';
        const planned = view.boardEditMode === 'plan' && isPlannedBoardRowChanged(row);
        const iconPath = getBoardIconPath(row, selected);
        return `
          <button
            type="button"
            class="board-shortcut ${typeClass} ${selected ? 'is-filled' : 'is-locked'} ${planned ? 'is-planned' : ''} ${pending ? 'is-pending' : ''} ${pendingType} ${unlocked ? '' : 'will-unlock'}"
            data-board-shortcut-layer="${layer}"
            data-board-shortcut-key="${escapeAttr(key)}"
            title="${escapeAttr(formatBoardEffect(row))}"
            style="--tile-base: url('${escapeAttr(getBoardTileBasePath(row, selected))}');"
          >
            ${iconPath ? `<img src="${escapeAttr(iconPath)}" alt="">` : ''}
          </button>
        `;
      }).join('');
      return `
        <div class="board-shortcut-group shortcut-layer-${layer}">
          <div class="board-shortcut-title">
            <span class="board-shortcut-layer">B${layer}</span>
            <span class="board-shortcut-rate">効果 ${layer + 2}%</span>
          </div>
          <div class="board-shortcut-list">${buttons}</div>
        </div>
      `;
    }).join('');
    elements.boardSpecial.innerHTML = html || '<p class="empty-note">ボードショートカットなし</p>';
  }

  function renderBoard(rows, totals, activeEffects, breakdown, globalPercentBonuses) {
    const filtered = getCurrentBoardRows(rows);
    if (!filtered.length) {
      elements.boardGrid.innerHTML = '<p class="muted-line">ボード情報がありません。</p>';
      return;
    }
    const boardState = currentBoardState();
    const xValues = rows.map(row => Number(row.X_pos)).filter(Number.isFinite);
    const yValues = rows.map(getBoardDisplayY).filter(Number.isFinite);
    const minX = 1;
    const maxX = Math.max(7, ...xValues);
    const minY = 1;
    const maxY = Math.max(...yValues);
    const entry = getBoardEntryRow(filtered);
    const hasVirtualStart = Number(view.board) > 1 && entry;
    const boardUnlocked = isBoardLayerUnlocked(view.board);
    const byPos = new Map(filtered.map(row => [`${Number(row.X_pos)}:${getBoardDisplayY(row)}`, row]));
    const nodes = [];
    for (let x = maxX; x >= minX; x--) {
      for (let y = minY; y <= maxY; y++) {
        if (hasVirtualStart && x === Number(entry.X_pos) && y === minY) {
          nodes.push(`
            <div class="board-node type-gate ${boardUnlocked ? 'is-filled' : 'is-locked'} is-virtual-start" title="${boardUnlocked ? '前階層ゲート' : '前階層ゲート（未解放）'}" style="--tile-base: url('img/Board/Tile_gate.webp');">
            </div>
          `);
          continue;
        }
        const row = byPos.get(`${x}:${y}`);
        if (!row) {
          nodes.push('<div class="board-node is-empty"></div>');
          continue;
        }
        const key = boardKey(row);
        const filled = row.マス_type === 'スタート' || !!boardState.filled[key];
        const committed = isCommittedBoardRowFilled(row);
        const baseline = isBoardBaselineRowFilled(row);
        const pending = filled !== baseline;
        const pendingType = pending ? (filled ? 'is-pending-add' : 'is-pending-remove') : '';
        const planned = view.boardEditMode === 'plan' && isPlannedBoardRowChanged(row);
        const text = row.表示用 || formatBoardEffect(row);
        const displayOn = filled;
        const baseIcon = getBoardTileBasePath(row, displayOn);
        const icon = getBoardIconPath(row, displayOn);
        nodes.push(`
          <button type="button" class="board-node ${boardNodeClass(row)} ${filled ? 'is-filled' : 'is-locked'} ${planned ? 'is-planned' : ''} ${pending ? 'is-pending' : ''} ${pendingType}" data-node-key="${escapeAttr(key)}" title="${escapeAttr(text)}" style="--tile-base: url('${escapeAttr(baseIcon)}'); ${icon ? `--tile-icon: url('${escapeAttr(icon)}');` : ''}">
            <span class="board-node-label">${escapeHtml(shortBoardLabel(row))}</span>
          </button>
        `);
      }
    }
    elements.boardGrid.style.gridTemplateColumns = `repeat(${maxY - minY + 1}, var(--board-cell-size))`;
    elements.boardGrid.style.gridTemplateRows = `repeat(${maxX - minX + 1}, var(--board-cell-size))`;
    elements.boardGrid.innerHTML = nodes.join('');
    renderBoardDraftSummary(rows);
    renderBoardFloatingSummary(rows);
    renderBoardSelectionSummary(rows);
  }

  function getBoardDisplayY(row) {
    const y = Number(row?.Y_pos);
    if (!Number.isFinite(y)) return y;
    return y + (Number(row?.ボード階層) > 1 ? 1 : 0);
  }

  function applyBondBonus(totals, level, activeEffects, breakdown) {
    const values = getBondBonusValues(level);
    if (!values) return;
    [
      ['crit', values.crit],
      ['critDmg', values.critDmg],
      ['critRes', values.critRes],
      ['critDmgRes', values.critDmgRes]
    ].forEach(([key, value]) => {
      addStatValue(totals, key, value);
      addSourceStat(breakdown, 'bond', key, value);
    });
    activeEffects.push(`好感度Lv${level} 会心+${values.crit} / 会心DMG+${values.critDmg} / 会心抵抗+${values.critRes} / 会心DMG抵抗+${values.critDmgRes}`);
  }

  function getBondBonusValues(level) {
    const levelValue = Number(level) || 0;
    if (!levelValue) return null;
    const row = DATA.sheets.bondBonuses.find(item => {
      const rawLevel = String(item.好感度Lv || '').replace(/[^\d]/g, '');
      return Number(rawLevel) === levelValue;
    });
    if (row) {
      return {
        crit: Number(row.会心) || 0,
        critDmg: Number(row.会心DMG) || 0,
        critRes: Number(row.会心抵抗) || 0,
        critDmgRes: Number(row.会心DMG抵抗) || 0
      };
    }
    const fallback = 31 * levelValue;
    return {
      crit: fallback,
      critDmg: fallback,
      critRes: fallback,
      critDmgRes: fallback
    };
  }

  function applyAsideManifestBonus(basic, totals, activeEffects, breakdown) {
    const state = currentApostleState();
    const rank = Number(state.asideRank) || 0;
    const level = Number(state.asideLevel) || 0;
    if (!rank) return;
    const result = getAsideManifestBonus(basic);
    if (!result) {
      activeEffects.push(`A${rank} ステータス補正(詳細未設定)`);
      return;
    }

    const attackKey = basic?.攻撃タイプ === '物理' ? 'patk' : 'matk';
    const values = [
      ['hp', result.hp],
      [attackKey, result.attack],
      ['pdef', result.pdef],
      ['mdef', result.mdef]
    ];
    values.forEach(([key, value]) => {
      addStatValue(totals, key, value);
      addSourceStat(breakdown, 'asideManifest', key, value);
    });

    const attackLabel = basic?.攻撃タイプ === '物理' ? '物理攻撃' : '魔法攻撃';
    activeEffects.push(`A${rank}発現(${result.source}) HP+${result.hp} / ${attackLabel}+${result.attack} / 物防+${result.pdef} / 魔防+${result.mdef}`);
    const levelBonus = calculateAsideLevelBonus(basic, level, rank);
    if (levelBonus) {
      const levelValues = [
        ['hp', levelBonus.hp],
        [attackKey, levelBonus.attack],
        ['pdef', levelBonus.pdef],
        ['mdef', levelBonus.mdef]
      ];
      levelValues.forEach(([key, value]) => {
        addStatValue(totals, key, value);
        addSourceStat(breakdown, 'asideLevel', key, value);
      });
      activeEffects.push(`アサイドLv${level}(A${rank} ×${levelBonus.multiplier}, Lv成長${levelBonus.growthLevels}) HP+${levelBonus.hp} / ${attackLabel}+${levelBonus.attack} / 物防+${levelBonus.pdef} / 魔防+${levelBonus.mdef}`);
    }
  }

  function getAsideManifestBonus(basic) {
    if (!basic) return null;
    const asideTier = DATA.getById('asideTiers', basic.id);
    if (asideTier) {
      const sheetValues = {
        hp: Number(asideTier.HP発現値) || 0,
        attack: Number(asideTier.攻撃力発現値) || 0,
        pdef: Number(asideTier.物理防御力発現値) || 0,
        mdef: Number(asideTier.魔法防御力発現値) || 0
      };
      if (Object.values(sheetValues).some(Boolean)) {
        return { ...sheetValues, source: 'シート値' };
      }
    }
    const calculated = calculateAsideManifestBonus(basic);
    return calculated ? { ...calculated, source: '計算値' } : null;
  }

  function calculateAsideManifestBonus(basic) {
    const tiers = getAsideStatTiers(basic);
    const hpBase = Number(findBaseStatValue(tiers.hp, 'hp')?.base) || 0;
    const attackBase = Number(findBaseStatValue(tiers.attack, 'attack')?.base) || 0;
    const pdefBase = Number(findBaseStatValue(tiers.pdef, 'defense')?.base) || 0;
    const mdefBase = Number(findBaseStatValue(tiers.mdef, 'defense')?.base) || 0;
    if (!hpBase && !attackBase && !pdefBase && !mdefBase) return null;
    return {
      hp: hpBase * 3,
      attack: attackBase * 3,
      pdef: pdefBase * 3,
      mdef: mdefBase * 3
    };
  }

  function calculateAsideLevelBonus(basic, level, rank) {
    const growthLevels = Math.max(0, (Number(level) || 0) - 1);
    if (!basic) return null;
    const multiplier = ASIDE_LEVEL_STAT_MULTIPLIERS[Number(rank)] || 0;
    if (!multiplier) return null;
    const tiers = getAsideStatTiers(basic);
    const starBonusCount = Math.max(0, Math.min(2, (Number(rank) || 0) - 1));
    const starBonus = getAsideStarBonus(basic);
    const hpCoeff = Number(findBaseStatValue(tiers.hp, 'hp')?.coeff) || 0;
    const attackCoeff = Number(findBaseStatValue(tiers.attack, 'attack')?.coeff) || 0;
    const pdefCoeff = Number(findBaseStatValue(tiers.pdef, 'defense')?.coeff) || 0;
    const mdefCoeff = Number(findBaseStatValue(tiers.mdef, 'defense')?.coeff) || 0;
    const bonus = {
      hp: Math.floor(hpCoeff * multiplier * growthLevels) + starBonus.hp * starBonusCount,
      attack: Math.floor(attackCoeff * multiplier * growthLevels) + starBonus.attack * starBonusCount,
      pdef: Math.floor(pdefCoeff * multiplier * growthLevels) + starBonus.pdef * starBonusCount,
      mdef: Math.floor(mdefCoeff * multiplier * growthLevels) + starBonus.mdef * starBonusCount,
      multiplier,
      growthLevels
    };
    return bonus.hp || bonus.attack || bonus.pdef || bonus.mdef ? bonus : null;
  }

  function getAsideStarBonus(basic) {
    const asideTier = DATA.getById('asideTiers', basic?.id);
    return {
      hp: Number(asideTier?.HP星上昇値) || 0,
      attack: Number(asideTier?.攻撃力星上昇値) || 0,
      pdef: Number(asideTier?.物理防御力星上昇値) || 0,
      mdef: Number(asideTier?.魔法防御力星上昇値) || 0
    };
  }

  function getAsideStatTiers(basic) {
    const override = DATA.getById('asideTiers', basic?.id);
    const baseAttackTier = basic?.攻撃タイプ === '物理'
      ? basic?.物理攻撃力タイプ
      : basic?.魔法攻撃力タイプ;
    return {
      hp: Number(override?.HPタイプ) || Number(basic?.HPタイプ) || 0,
      attack: Number(override?.攻撃力タイプ) || Number(baseAttackTier) || 0,
      pdef: Number(override?.物理防御力タイプ) || Number(basic?.物理防御力タイプ) || 0,
      mdef: Number(override?.魔法防御力タイプ) || Number(basic?.魔法防御力タイプ) || 0
    };
  }

  function renderBoardDraftSummary(rows) {
    elements.boardDraftSummary.innerHTML = getBoardDraftSummarySections(rows).join('');
  }

  function getBoardDraftSummarySections(rows) {
    const sections = [];
    const state = currentApostleState();
    if (view.boardEditMode === 'plan' && hasSavedBoardPlan()) {
      const summary = collectBoardChangeSummary(rows, state.plannedBoards, state.boards);
      if (summary.changed.length) {
        sections.push(renderBoardChangeSection('変更予定', '保存済み', 'saved', summary));
      }
    }
    if (hasBoardDraft()) {
      const summary = collectBoardChangeSummary(rows, boardDraft.boards, getBoardEditBaselineBoards());
      if (summary.changed.length) {
        sections.push(renderBoardChangeSection('編集中', '未保存', 'editing', summary));
      }
    }
    return sections;
  }

  function renderBoardFloatingSummary(rows) {
    if (!elements.boardFloatingSummary) return;
    const sections = getBoardDraftSummarySections(rows);
    const draftChanged = hasBoardDraftChanges();
    const canCancel = hasBoardDraft() || (view.boardEditMode === 'plan' && hasSavedBoardPlan());
    const hasChanges = sections.length > 0;
    elements.boardFloatingSummary.innerHTML = `
      <div class="board-global-floating-host board-floating-host">
        <div class="board-global-floating-dock board-floating-dock ${hasChanges ? 'has-changes' : 'is-empty'}">
          <span class="board-global-floating-mode" aria-label="ボード編集モード">
            <button type="button" class="${view.boardEditMode === 'current' ? 'is-active' : ''}" data-board-floating-mode="current">現在</button>
            <button type="button" class="${view.boardEditMode === 'plan' ? 'is-active' : ''}" data-board-floating-mode="plan">予定</button>
          </span>
          <button type="button" class="board-shortcut-off-toggle board-global-shortcut-off-toggle ${view.boardShortcutOffMode === 'route' ? 'is-route' : ''}" data-board-shortcut-off-toggle>
            ${view.boardShortcutOffMode === 'route' ? 'OFF時: 経路整理' : 'OFF時: マスのみ'}
          </button>
          <details class="board-global-floating-summary">
            <summary title="変更内容">i</summary>
            <div class="board-global-floating-panel">
              ${hasChanges ? sections.join('') : '<p class="empty-note board-global-no-change">現在状態からの変更はありません。</p>'}
            </div>
          </details>
          <details class="board-global-floating-save">
            <summary title="保存・反映" aria-label="保存・反映">💾</summary>
            <div class="board-global-floating-save-panel">
              ${renderBoardFloatingActions({ draftChanged, canCancel })}
            </div>
          </details>
        </div>
      </div>
    `;
  }

  function renderBoardFloatingActions({ draftChanged, canCancel }) {
    const planMode = view.boardEditMode === 'plan';
    const cancelDisabled = canCancel ? '' : ' disabled';
    const saveDisabled = draftChanged ? '' : ' disabled';
    const currentDisabled = !planMode && draftChanged ? '' : ' disabled';
    const applyPlanDisabled = planMode && (draftChanged || hasSavedBoardPlan()) ? '' : ' disabled';
    return `
      <div class="board-global-summary-actions board-global-summary-actions-floating" aria-label="ボード変更操作">
        <button type="button" class="secondary" data-board-floating-action="cancel"${cancelDisabled}>${hasBoardDraft() ? '編集を取消' : '予定を削除'}</button>
        <button type="button" class="plan" data-board-floating-action="plan"${saveDisabled}>${planMode ? '予定を保存' : (hasSavedBoardPlan() ? '予定に追加保存' : '予定として保存')}</button>
        ${planMode
          ? `<button type="button" class="primary" data-board-floating-action="apply-plan-current"${applyPlanDisabled}>予定を現在に反映</button>`
          : `<button type="button" class="primary" data-board-floating-action="current"${currentDisabled}>現在状態に反映</button>`}
      </div>
    `;
  }

  function collectBoardChangeSummary(rows, targetBoards, baselineBoards = currentApostleState().boards) {
    const changed = rows
      .filter(row => row.マス_type !== 'スタート')
      .map(row => {
        const layer = String(row.ボード階層);
        const committed = !!baselineBoards?.[layer]?.filled?.[boardKey(row)];
        const target = !!targetBoards?.[layer]?.filled?.[boardKey(row)];
        return committed === target ? null : { row, direction: target ? 1 : -1 };
      })
      .filter(Boolean);
    const costs = {
      gold: 0,
      lower: 0,
      middle: 0,
      upper: 0,
      special: 0,
      sharedToken: 0,
      apostleToken: 0
    };
    const effectGroups = {
      special: new Map(),
      advanced: new Map(),
      lower: new Map()
    };
    let added = 0;
    let removed = 0;

    changed.forEach(({ row, direction }) => {
      if (direction > 0) added += 1;
      else removed += 1;
      costs.gold += (Number(row.ゴールド) || 0) * direction;
      costs.lower += (Number(row.下級) || 0) * direction;
      costs.middle += (Number(row.中級) || 0) * direction;
      costs.upper += (Number(row.上級) || 0) * direction;
      costs.special += (Number(row.特級) || 0) * direction;
      costs.sharedToken += (Number(row['★1共同教団証']) || 0) * direction;
      costs.apostleToken += (Number(row.使徒証) || 0) * direction;
      addBoardSummaryEffect(effectGroups, row.効果1_type, (Number(row.効果1_value) || 0) * direction, row.マス_type);
      addBoardSummaryEffect(effectGroups, row.効果2_type, (Number(row.効果2_value) || 0) * direction, row.マス_type);
    });
    return { changed, costs, effectGroups, added, removed };
  }

  function renderBoardChangeSection(title, status, type, summary) {
    return `
      <section class="board-change-section is-${type}">
      <div class="board-draft-head">
        <div class="board-draft-title">
            <strong>${title}</strong>
            <span class="${type === 'saved' ? 'board-plan-saved' : 'board-plan-unsaved'}">${status}</span>
        </div>
          <span>追加 ${summary.added}マス${summary.removed ? ` / 解除 ${summary.removed}マス` : ''}</span>
      </div>
      <div class="summary-table-grid">
          ${renderBoardDraftCostSummary(summary.costs)}
          ${renderBoardDraftEffectMatrix(summary.effectGroups)}
      </div>
      </section>
    `;
  }

  function renderBoardDraftCostSummary(costs) {
    const basic = DATA.getById('basicInfo', view.id);
    const apostleName = basic?.使徒名 || view.id;
    const normalized = {
      gold: costs.gold,
      lower: costs.lower,
      middle: costs.middle,
      upper: costs.upper,
      special: costs.special,
      sharedToken: costs.sharedToken,
      apostleToken: costs.apostleToken
    };
    const html = renderGlobalBoardCostSummary(normalized);
    if (!costs.apostleToken) return html;
    return html.replace('title="使徒証"', `title="使徒証（${escapeAttr(apostleName)}）"`);
  }

  function renderBoardDraftEffectMatrix(effectGroups, options = {}) {
    const title = options.title || '差分';
    const lower = createEmptyTotals();
    const advanced = createEmptyTotals();
    const special = createEmptyTotals();
    addBoardEffectGroupToTotals(lower, effectGroups.lower);
    addBoardEffectGroupToTotals(advanced, effectGroups.advanced);
    addBoardEffectGroupToTotals(special, effectGroups.special);
    const hasChange = BOARD_GLOBAL_STAT_GROUPS.some(group =>
      group.stats.some(key => (Number(lower[key]) || 0) || (Number(advanced[key]) || 0) || (Number(special[key]) || 0))
    );
    if (!hasChange) return '<p class="empty-note board-global-cost-empty">ステータス変更なし</p>';
    return `
      <table class="board-global-stat-matrix board-global-change-matrix board-draft-change-matrix">
        <thead>
          <tr>
            <th>${escapeHtml(title)}</th>
            <th title="通常マス"><img src="img/Board/Tileicon_1.webp" alt="通常"></th>
            <th title="上級マス"><img src="img/Board/Tileicon_2.webp" alt="上級"></th>
            <th title="特殊マス"><img src="img/Board/Tileicon_3.webp" alt="特殊"></th>
          </tr>
        </thead>
        <tbody>
          ${BOARD_GLOBAL_STAT_GROUPS.map(group => `
            <tr>
              <th title="${escapeAttr(group.label)}"><img src="img/Board/${escapeAttr(group.icon)}" alt="${escapeAttr(group.label)}"></th>
              <td>${renderSignedBoardGlobalGroupedValue(lower, group, '')}</td>
              <td>${renderSignedBoardGlobalGroupedValue(advanced, group, '')}</td>
              <td>${renderSignedBoardGlobalGroupedValue(special, group, '%')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function addBoardEffectGroupToTotals(totals, group) {
    if (!group) return;
    Array.from(group.entries()).forEach(([type, value]) => {
      addNamedStat(totals, type, Number(value) || 0);
    });
  }

  function renderBoardDraftCostTable(costs) {
    const basic = DATA.getById('basicInfo', view.id);
    const items = [
      ['ゴールド', costs.gold],
      ['下級くれよん', costs.lower],
      ['中級くれよん', costs.middle],
      ['上級くれよん', costs.upper],
      ['特級くれよん', costs.special],
      ['★1共同教団証', costs.sharedToken],
      [`使徒証（${basic?.使徒名 || view.id}）`, costs.apostleToken]
    ].filter(([, value]) => value);
    return renderCompactTable(
      ['消費アイテム', '変更分'],
      items.map(([label, value]) => [label, formatSignedBoardValue(value)]),
      { firstColumnHeader: true, valueColumn: 1, emptyText: 'コスト変更なし' }
    );
  }

  function renderBoardDraftEffectTable(effectGroups) {
    const groups = [
      { key: 'special', label: '特殊マス効果', className: 'is-special', suffix: '%' },
      { key: 'advanced', label: '上級マス効果', className: 'is-advanced', suffix: '' },
      { key: 'lower', label: '下級マス効果', className: 'is-lower', suffix: '' }
    ];
    const rows = groups.map(group => {
      const effects = Array.from(effectGroups[group.key].entries()).filter(([, value]) => value);
      if (!effects.length) return '';
      return `
        <tr class="board-effect-group ${group.className}">
          <th colspan="2">${group.label}</th>
        </tr>
        ${effects.map(([type, value]) => `
          <tr>
            <th>${escapeHtml(type)}</th>
            <td class="value">${formatSignedBoardValue(value)}${group.suffix}</td>
          </tr>
        `).join('')}
      `;
    }).join('');
    return rows
      ? `<table class="compact-table board-effect-table"><thead><tr><th>ステータス</th><th>変更分</th></tr></thead><tbody>${rows}</tbody></table>`
      : '<p class="empty-note">ステータス変更なし</p>';
  }

  function formatSignedBoardValue(value) {
    const numeric = Number(value) || 0;
    return `${numeric > 0 ? '+' : ''}${formatBoardSummaryValue(numeric)}`;
  }

  function renderBoardSelectionSummary(rows) {
    const selected = rows.filter(row => row.マス_type !== 'スタート' && isBoardRowFilled(row));
    if (!selected.length) {
      elements.boardSelectionSummary.innerHTML = '<p class="empty-note">選択中マスなし</p>';
      return;
    }

    const costs = {
      gold: 0,
      lower: 0,
      middle: 0,
      upper: 0,
      special: 0,
      sharedToken: 0,
      apostleToken: 0
    };
    const effectGroups = {
      special: new Map(),
      advanced: new Map(),
      lower: new Map()
    };

    selected.forEach(row => {
      costs.gold += Number(row.ゴールド) || 0;
      costs.lower += Number(row.下級) || 0;
      costs.middle += Number(row.中級) || 0;
      costs.upper += Number(row.上級) || 0;
      costs.special += Number(row.特級) || 0;
      costs.sharedToken += Number(row['★1共同教団証']) || 0;
      costs.apostleToken += Number(row.使徒証) || 0;
      addBoardSummaryEffect(effectGroups, row.効果1_type, row.効果1_value, row.マス_type);
      addBoardSummaryEffect(effectGroups, row.効果2_type, row.効果2_value, row.マス_type);
    });

    elements.boardSelectionSummary.innerHTML = `
      <div class="summary-count">ボード1～3 合計 ${selected.length}マス選択中</div>
      <div class="summary-table-grid">
        ${renderBoardCostTable(costs)}
        ${renderBoardEffectTable(effectGroups)}
      </div>
    `;
  }

  function renderBoardCostTable(costs) {
    const basic = DATA.getById('basicInfo', view.id);
    const apostleName = basic?.使徒名 || view.id;
    const items = [
      { label: 'ゴールド', value: costs.gold, icon: 'img/ゴールド.webp' },
      { label: '下級くれよん', value: costs.lower, icon: 'img/下級くれよん.webp' },
      { label: '中級くれよん', value: costs.middle, icon: 'img/中級くれよん.webp' },
      { label: '上級くれよん', value: costs.upper, icon: 'img/上級くれよん.webp' },
      { label: '特級くれよん', value: costs.special, icon: 'img/特級くれよん.webp' },
      { label: '★1共同教団証', value: costs.sharedToken, icon: 'img/★1共同教団証.webp' },
      {
        label: `使徒証（${apostleName}）`,
        value: costs.apostleToken,
        apostleToken: true
      }
    ].filter(item => item.value);

    if (!items.length) return '<p class="empty-note">コストなし</p>';
    return `
      <table class="compact-table board-cost-table">
        <thead><tr><th>消費アイテム</th><th>必要数</th></tr></thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <th>
                <span class="board-cost-item">
                  ${item.apostleToken
                    ? `<span class="board-apostle-token" aria-hidden="true">
                        <img class="board-apostle-token-bg" src="img/使徒証_背景.webp" alt="">
                        <img data-apostle-image class="board-apostle-token-chara" src="${escapeAttr(getApostleImagePath(view.id))}" alt="">
                      </span>`
                    : `<img class="board-cost-icon" src="${escapeAttr(item.icon)}" alt="">`}
                  <span>${escapeHtml(item.label)}</span>
                </span>
              </th>
              <td class="value">${formatNumber(item.value)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function addBoardSummaryEffect(effectGroups, type, value, tileType) {
    const numeric = Number(value) || 0;
    if (!type || !numeric || type === 'ゲート') return;
    const groupKey = tileType === '特殊' ? 'special' : tileType === '上級' ? 'advanced' : 'lower';
    const effects = effectGroups[groupKey];
    effects.set(type, (effects.get(type) || 0) + numeric);
  }

  function renderBoardEffectTable(effectGroups) {
    const groups = [
      { key: 'special', label: '特殊マス効果', className: 'is-special', suffix: '%' },
      { key: 'advanced', label: '上級マス効果', className: 'is-advanced', suffix: '' },
      { key: 'lower', label: '下級マス効果', className: 'is-lower', suffix: '' }
    ];
    const rows = groups.map(group => {
      const effects = Array.from(effectGroups[group.key].entries());
      const effectRows = effects.length
        ? effects.map(([type, value]) => `
            <tr>
              <th>${escapeHtml(type)}</th>
              <td class="value">+${formatBoardSummaryValue(value)}${group.suffix}</td>
            </tr>
          `).join('')
        : `
            <tr class="board-effect-empty">
              <td colspan="2">効果なし</td>
            </tr>
          `;
      return `
        <tr class="board-effect-group ${group.className}">
          <th colspan="2">${group.label}</th>
        </tr>
        ${effectRows}
      `;
    }).join('');

    return `
      <table class="compact-table board-effect-table">
        <thead><tr><th>ステータス</th><th>上昇値</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function formatBoardSummaryValue(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function applyBoardRow(totals, row, activeEffects, breakdown, globalPercentBonuses) {
    [['効果1_type', '効果1_value'], ['効果2_type', '効果2_value']].forEach(([typeKey, valueKey]) => {
      const type = row[typeKey];
      const value = Number(row[valueKey]) || 0;
      if (!type || !value) return;
      if (row.マス_type === '特殊') {
        addNamedStat(globalPercentBonuses, type, value);
        if (activeEffects) activeEffects.push(`ボード${row.ボード階層} ${type}+${value}%`);
        return;
      }
      addNamedStat(totals, type, value);
      addSourceNamedStat(breakdown, 'board', type, value);
      if (activeEffects && (row.マス_type === '上級' || row.マス_type === '特殊')) {
        activeEffects.push(`ボード${row.ボード階層} ${type}+${value}`);
      }
    });
  }

  function collectBoardEffects(totals, activeEffects, breakdown, globalPercentBonuses) {
    const otherGlobalFlat = createEmptyTotals();
    const otherGlobalPercent = createEmptyTotals();
    let otherCount = 0;
    const boardMode = getBoardEffectMode();
    DATA.sheets.basicInfo.forEach(basic => {
      const rows = DATA.getById('board', basic.id) || [];
      let hasOtherGlobal = false;
      rows.forEach(row => {
        const board = getBoardEffectStateForApostle(basic.id, row.ボード階層, boardMode);
        const filled = row.マス_type === 'スタート' || !!board?.filled?.[boardKey(row)];
        if (!filled) return;
        const isCurrent = basic.id === view.id;
        const isGlobalBoardEffect = row.マス_type === '上級' || row.マス_type === '特殊';
        if (!isCurrent && !isGlobalBoardEffect) return;
        applyBoardRow(totals, row, isCurrent ? activeEffects : null, breakdown, globalPercentBonuses);
        if (!isCurrent && isGlobalBoardEffect) {
          hasOtherGlobal = true;
          addBoardRowToSummary(row, otherGlobalFlat, otherGlobalPercent);
        }
      });
      if (hasOtherGlobal) otherCount += 1;
    });

    const flatSummary = formatStatSummary(otherGlobalFlat, '');
    const percentSummary = formatStatSummary(otherGlobalPercent, '%');
    const summary = [flatSummary, percentSummary].filter(Boolean).join(' / ');
    if (summary) activeEffects.push(`他使徒ボード全体効果(${otherCount}使徒) ${summary}`);
  }

  function getBoardEffectMode() {
    if (snapshotBoardMode) return snapshotBoardMode;
    return isBoardGlobalPanelActive() ? view.boardGlobalMode : view.boardEditMode;
  }

  function isBoardGlobalPanelActive() {
    const globalPanel = document.querySelector('[data-dashboard-panel="global"]');
    const boardPanel = document.querySelector('[data-setting-panel="board-global"]');
    return !!globalPanel?.classList.contains('is-active') && !!boardPanel?.classList.contains('is-active');
  }

  function getBoardEffectStateForApostle(id, layer, mode) {
    const state = ensureApostleState(id);
    const layerKey = String(layer);
    if (id === view.id && !isBoardGlobalPanelActive()) {
      return getBoardStateForLayer(layer);
    }
    if (globalBoardDrafts[id]?.mode === mode) {
      return globalBoardDrafts[id].boards?.[layerKey];
    }
    const boards = mode === 'plan'
      ? state.plannedBoards || state.boards || {}
      : state.boards || {};
    return boards[layerKey];
  }

  function addBoardRowToSummary(row, flatTotals, percentTotals) {
    [['効果1_type', '効果1_value'], ['効果2_type', '効果2_value']].forEach(([typeKey, valueKey]) => {
      const type = row[typeKey];
      const value = Number(row[valueKey]) || 0;
      if (!type || !value) return;
      addNamedStat(row.マス_type === '特殊' ? percentTotals : flatTotals, type, value);
    });
  }

  function collectFollowGlobalPercent(globalPercentBonuses, activeEffects) {
    if (!currentApostleState().follow) return;
    const followPercent = 3;
    FOLLOW_BONUS_KEYS.forEach(key => addStatValue(globalPercentBonuses, key, followPercent));
    activeEffects.push(`フォロー 全ステータス+${followPercent}%`);
  }

  function collectAsideLevel3GlobalEffects(globalPercentBonuses, activeEffects) {
    const effectTotals = createEmptyTotals();
    let count = 0;
    DATA.sheets.basicInfo.forEach(basic => {
      const state = ensureApostleState(basic.id);
      if ((Number(state.asideRank) || 0) < 3) return;
      const entries = collectAsideLevel3Entries(basic.id);
      if (!entries.length) return;
      count += 1;
      entries.forEach(entry => {
        addNamedStat(globalPercentBonuses, entry.name, entry.value);
        addNamedStat(effectTotals, entry.name, entry.value);
      });
    });
    if (!count) return;

    const summary = TOTAL_LABELS
      .map(item => ({ label: item.label, value: Number(effectTotals[item.key]) || 0 }))
      .filter(item => item.value)
      .map(item => `${item.label}+${formatBoardSummaryValue(item.value)}%`)
      .join(' / ');
    activeEffects.push(`A3全体効果(${count}使徒) ${summary}`);
  }

  function collectAsideLevel3Entries(id) {
    const rows = DATA.getById('asideStatEffects', id) || [];
    return rows
      .filter(row => getAsideEffectRank(row) === 3 && String(row.ステ適用 || '').includes('全体'))
      .map(row => ({
        name: String(row.ステ能力値 || '').trim(),
        value: Number(row['上昇%']) || 0
      }))
      .filter(entry => entry.name && entry.value);
  }

  function hasAsideEffects(id) {
    return !!(DATA.getById('asideStatEffects', id) || []).length
      || !!(DATA.getById('asideSpecialEffects', id) || []).length;
  }

  function getAsideEffectRank(row) {
    return Number(row.SLv ?? row.Lv) || 0;
  }

  function applyGlobalPercentBonuses(totals, globalPercentBonuses, activeEffects, breakdown, globalPercentRates) {
    const entries = TOTAL_LABELS
      .map(item => ({ key: item.key, label: item.label, percent: Number(globalPercentBonuses[item.key]) || 0 }))
      .filter(item => item.percent);
    if (!entries.length) return;

    entries.forEach(item => {
      addStatValue(globalPercentRates, item.key, item.percent);
      const increase = Math.floor((totals[item.key] || 0) * item.percent / 100);
      if (!increase) return;
      totals[item.key] += increase;
      addSourceStat(breakdown, 'globalPercent', item.key, increase);
    });

    const summary = entries.map(item => `${item.label}+${formatBoardSummaryValue(item.percent)}%`).join(' / ');
    activeEffects.push(`全体補正 ${summary}`);
  }

  function updateStatSnapshots(basic, totals, breakdown, globalPercentRates) {
    if (!basic?.id) return;
    const state = currentApostleState();
    if (!state.statSnapshots || typeof state.statSnapshots !== 'object') state.statSnapshots = {};
    state.statSnapshots.current = createStatSnapshot('current', totals, breakdown, globalPercentRates);
    const planned = createPlannedStatSnapshotIfNeeded(basic, state);
    if (planned) state.statSnapshots.planned = planned;
    else delete state.statSnapshots.planned;
    state.finalStats = state.statSnapshots.current.stats;
    updateTotalCombatPowerFromSnapshots();
    updateProfileCombatPowerDisplay(state.statSnapshots.current.stats.combatPower);
    updateFormationCoinSummary();
  }

  function refreshAllStatSnapshots() {
    if (isRefreshingStatSnapshots) return;
    isRefreshingStatSnapshots = true;
    const originalId = view.id;
    const hasAnyPlan = hasAnySavedBoardPlan();
    try {
      (DATA.sheets.basicInfo || []).forEach(basic => {
        const state = ensureApostleState(basic.id);
        const current = calculateStatSnapshotForApostle(basic, state, null, 'current');
        if (!state.statSnapshots || typeof state.statSnapshots !== 'object') state.statSnapshots = {};
        state.statSnapshots.current = current;
        const planned = hasAnyPlan ? createPlannedStatSnapshot(basic, state, current) : null;
        if (planned) state.statSnapshots.planned = planned;
        else delete state.statSnapshots.planned;
        state.finalStats = current.stats;
      });
      updateTotalCombatPowerFromSnapshots();
    } finally {
      view.id = originalId;
      isRefreshingStatSnapshots = false;
    }
  }

  function createPlannedStatSnapshotIfNeeded(basic, state, currentSnapshot = state.statSnapshots?.current) {
    if (!hasAnySavedBoardPlan()) return null;
    return createPlannedStatSnapshot(basic, state, currentSnapshot);
  }

  function createPlannedStatSnapshot(basic, state, currentSnapshot = state.statSnapshots?.current) {
    const currentBoards = cloneJson(state.boards || {});
    const draftBoards = cloneJson(state.plannedBoards || state.boards || {});
    const snapshot = calculateStatSnapshotForApostle(basic, state, draftBoards, 'planned');
    snapshot.diff = diffTotals(snapshot.stats, currentSnapshot?.stats);
    snapshot.boardDiff = createBoardSnapshotDiff(currentBoards, draftBoards, basic.id);
    return snapshot;
  }

  function hasAnySavedBoardPlan() {
    return (DATA.sheets.basicInfo || []).some(basic => {
      const state = ensureApostleState(basic.id);
      return !!state.plannedBoards && typeof state.plannedBoards === 'object';
    });
  }

  function calculateStatSnapshotForApostle(basic, state, boardOverride, kind, options = {}) {
    const boardMode = kind === 'planned' ? 'plan' : kind === 'current' ? 'current' : null;
    return withTemporaryViewId(basic.id, () => withTemporaryApostleState(basic.id, state, () => withTemporaryApostleBoards(state, boardOverride || state.boards || {}, boardMode, () => {
      const totals = createEmptyTotals();
      const breakdown = createBreakdownTotals();
      const globalPercentBonuses = createEmptyTotals();
      const globalPercentRates = createEmptyTotals();
      const activeEffects = [];
      const equipment = DATA.getById('equipment', basic.id);

      applyBaseStats(basic, totals, activeEffects, breakdown);
      applyRankUpBonuses(basic, totals, activeEffects, breakdown);
      applyEquipmentStatsForSnapshot(equipment, state, totals, breakdown);
      applyBondBonus(totals, state.bond, activeEffects, breakdown);
      applyAsideManifestBonus(basic, totals, activeEffects, breakdown);
      applyAllRankGlobalBonuses(totals, activeEffects, breakdown);
      applyResearchForSnapshot(basic, totals, breakdown);
      collectBoardEffects(totals, activeEffects, breakdown, globalPercentBonuses);
      collectAsideLevel3GlobalEffects(globalPercentBonuses, activeEffects);
      if (state.follow) {
        const followPercent = 3;
        FOLLOW_BONUS_KEYS.forEach(key => addStatValue(globalPercentBonuses, key, followPercent));
      }
      applyGlobalPercentBonuses(totals, globalPercentBonuses, activeEffects, breakdown, globalPercentRates);
      return createStatSnapshot(kind, totals, breakdown, globalPercentRates, basic, state, {
        ...options,
        boardOverride: boardOverride || state.boards || {}
      });
    })));
  }

  function createApostleCalculationState(id, overrides = {}) {
    const base = cloneJson(ensureApostleState(id));
    const patch = cloneJson(overrides);
    const state = {
      ...base,
      ...patch
    };
    if (patch.equipment && typeof patch.equipment === 'object') {
      state.equipment = { ...(base.equipment || {}), ...patch.equipment };
    }
    if (patch.skillLevels && typeof patch.skillLevels === 'object') {
      state.skillLevels = { ...(base.skillLevels || {}), ...patch.skillLevels };
    }
    if (patch.boards) state.boards = cloneJson(patch.boards);
    if (patch.plannedBoards) state.plannedBoards = cloneJson(patch.plannedBoards);
    if (Object.prototype.hasOwnProperty.call(patch, 'grade')) state.gradeConfigured = true;
    return normalizeApostleCalculationState(id, state);
  }

  function normalizeApostleCalculationState(id, state) {
    const basic = DATA.getById('basicInfo', id);
    state.rank = Math.max(1, Number(state.rank) || 1);
    state.star = normalizeApostleStar(state.star || basic?.レア度 || 1);
    state.grade = normalizeGrade(state.grade || 1);
    state.level = normalizeApostleLevel(state.level, state.star);
    state.bond = normalizeBondLevel(state.bond);
    state.asideRank = Math.max(0, Math.min(3, Number(state.asideRank) || 0));
    state.asideLevel = normalizeAsideLevelForRank(state.asideLevel, state.asideRank);
    state.skillLevels = normalizeSkillLevels(state.skillLevels, state.asideRank);
    state.equipment = state.equipment && typeof state.equipment === 'object' ? state.equipment : {};
    state.boards = state.boards && typeof state.boards === 'object' ? state.boards : {};
    if (state.plannedBoards && typeof state.plannedBoards !== 'object') delete state.plannedBoards;
    state.statSnapshots = state.statSnapshots && typeof state.statSnapshots === 'object' ? state.statSnapshots : {};
    return state;
  }

  function resolveSnapshotBoardOverride(state, options = {}) {
    if (options.boards) return options.boards;
    if (options.boardMode === 'planned') return state.plannedBoards || state.boards || {};
    if (options.boardMode === 'current') return state.boards || {};
    return null;
  }

  function calculateApostleStatsForEngine(id = view.id, overrides = {}, options = {}) {
    const safeId = getValidApostleId(id);
    const basic = DATA.getById('basicInfo', safeId);
    if (!basic) return null;
    const state = createApostleCalculationState(safeId, overrides);
    const snapshot = calculateStatSnapshotForApostle(
      basic,
      state,
      resolveSnapshotBoardOverride(state, options),
      options.kind || 'override',
      options
    );
    return {
      apostleId: safeId,
      basic: cloneJson(basic),
      state: cloneJson(state),
      snapshot
    };
  }

  function createStatSnapshot(kind, totals, breakdown, globalPercentRates, basic = DATA.getById('basicInfo', view.id), state = currentApostleState(), options = {}) {
    const stats = mapTotalsForSnapshot(totals);
    const combatPowerTotals = options.combatPowerTotals === true
      ? totals
      : (options.combatPowerTotals || createCombatPowerTotalsAtGradeOne(basic, state, options.boardOverride));
    stats.combatPower = calculateCombatPower(basic, state, combatPowerTotals || totals);
    return {
      kind,
      stats,
      breakdown: cloneJson(breakdown),
      globalPercentRates: mapTotalsForSnapshot(globalPercentRates),
      updatedAt: new Date().toISOString()
    };
  }

  function createCombatPowerTotalsAtGradeOne(basic, state, boardOverride = null) {
    if (!basic?.id || !state) return null;
    const cpState = {
      ...cloneJson(state),
      grade: 1,
      gradeConfigured: true
    };
    const snapshot = calculateStatSnapshotForApostle(
      basic,
      cpState,
      boardOverride || cpState.boards || {},
      'combatPower',
      { combatPowerTotals: true }
    );
    return snapshot?.stats ? snapshotTotalsFromStats(snapshot.stats) : null;
  }

  function snapshotTotalsFromStats(stats = {}) {
    return {
      hp: Number(stats.hp) || 0,
      patk: Number(stats.physicalAtk) || 0,
      matk: Number(stats.magicAtk) || 0,
      pdef: Number(stats.physicalDef) || 0,
      mdef: Number(stats.magicDef) || 0,
      crit: Number(stats.crit) || 0,
      critDmg: Number(stats.critDmg) || 0,
      critRes: Number(stats.critRes) || 0,
      critDmgRes: Number(stats.critDmgRes) || 0
    };
  }

  function calculateCombatPower(basic, state, totals) {
    if (!basic || !totals) return 0;
    const activeAttack = basic.攻撃タイプ === '魔法'
      ? Number(totals.matk) || 0
      : Number(totals.patk) || 0;
    const weightedStats = (Number(totals.hp) || 0) * 4 / 35
      + activeAttack * 3
      + (Number(totals.pdef) || 0)
      + (Number(totals.mdef) || 0)
      + (Number(totals.crit) || 0)
      + (Number(totals.critDmg) || 0)
      + (Number(totals.critRes) || 0)
      + (Number(totals.critDmgRes) || 0);
    const rarity = Number(basic.レア度) || 3;
    const baseRate = COMBAT_POWER_BASE_BY_RARITY[rarity] ?? COMBAT_POWER_BASE_BY_RARITY[3];
    const correction = Number(basic.戦闘力補正 ?? basic.combatPowerCorrection ?? basic.weight_value_a) || 0;
    const skillValue = COMBAT_POWER_SKILL_VALUE_BY_RARITY[rarity] ?? COMBAT_POWER_SKILL_VALUE_BY_RARITY[3];
    const skills = state?.skillLevels || {};
    const skillSum = ['low', 'high', 'passive']
      .map(key => Math.max(0, (Number(skills[key]) || 1) - 1) * skillValue)
      .reduce((total, value) => total + value, 0);
    const asideBonus = (Number(state?.asideRank) || 0) >= 2 ? COMBAT_POWER_ASIDE_BONUS : 0;
    return Math.max(0, Math.floor(weightedStats * (
      baseRate
      + correction * COMBAT_POWER_CORRECTION_RATE
      + skillSum * COMBAT_POWER_SKILL_RATE
      + asideBonus
    )));
  }

  function mapTotalsForSnapshot(totals) {
    return {
      hp: Math.floor(Number(totals?.hp) || 0),
      physicalAtk: Math.floor(Number(totals?.patk) || 0),
      magicAtk: Math.floor(Number(totals?.matk) || 0),
      physicalDef: Math.floor(Number(totals?.pdef) || 0),
      magicDef: Math.floor(Number(totals?.mdef) || 0),
      crit: Math.floor(Number(totals?.crit) || 0),
      critDmg: Math.floor(Number(totals?.critDmg) || 0),
      critRes: Math.floor(Number(totals?.critRes) || 0),
      critDmgRes: Math.floor(Number(totals?.critDmgRes) || 0),
      spRegen: Math.floor(Number(totals?.spRegen) || 0)
    };
  }

  function diffTotals(next = {}, base = {}) {
    return Object.fromEntries(Object.keys(mapTotalsForSnapshot({})).map(key => [
      key,
      (Number(next?.[key]) || 0) - (Number(base?.[key]) || 0)
    ]));
  }

  function withTemporaryApostleBoards(state, boards, mode, callback) {
    const originalBoards = state.boards;
    const originalSnapshotBoardOverride = snapshotBoardOverride;
    const originalSnapshotBoardMode = snapshotBoardMode;
    state.boards = cloneJson(boards || {});
    snapshotBoardOverride = state.boards;
    snapshotBoardMode = mode || null;
    try {
      return callback();
    } finally {
      state.boards = originalBoards;
      snapshotBoardOverride = originalSnapshotBoardOverride;
      snapshotBoardMode = originalSnapshotBoardMode;
    }
  }

  function withTemporaryApostleState(id, state, callback) {
    const hadOriginalState = Object.prototype.hasOwnProperty.call(appState.apostles, id);
    const originalState = appState.apostles[id];
    appState.apostles[id] = state;
    try {
      return callback();
    } finally {
      if (hadOriginalState) appState.apostles[id] = originalState;
      else delete appState.apostles[id];
    }
  }

  function withTemporaryViewId(id, callback) {
    const originalId = view.id;
    view.id = id;
    try {
      return callback();
    } finally {
      view.id = originalId;
    }
  }

  function applyEquipmentStatsForSnapshot(equipment, state, totals, breakdown) {
    if (!equipment) return;
    const rank = Number(state.rank) || 1;
    STAT_GROUPS.forEach(group => {
      const tier = Number(equipment[`Equip_Rank${rank}_${group.key}`]) || 0;
      if (!tier) return;
      const equip = state.equipment?.[group.key] || { enabled: false, enhance: 0 };
      if (!equip.enabled) return;
      const equipValue = findEquipmentValue(rank, group.lookup || group.key, tier, equip.enhance || 0);
      if (!equipValue) return;
      if (group.total === 'critPair') {
        addStatValue(totals, 'crit', equipValue.value);
        addStatValue(totals, 'critDmg', equipValue.value);
        addSourceStat(breakdown, 'equipment', 'crit', equipValue.value);
        addSourceStat(breakdown, 'equipment', 'critDmg', equipValue.value);
      } else if (group.total === 'critResPair') {
        addStatValue(totals, 'critRes', equipValue.value);
        addStatValue(totals, 'critDmgRes', equipValue.value);
        addSourceStat(breakdown, 'equipment', 'critRes', equipValue.value);
        addSourceStat(breakdown, 'equipment', 'critDmgRes', equipValue.value);
      } else {
        addStatValue(totals, group.total, equipValue.value);
        addSourceStat(breakdown, 'equipment', group.total, equipValue.value);
      }
    });
  }

  function applyResearchForSnapshot(basic, totals, breakdown) {
    const progress = Number(appState.research.progress) || 0;
    const level = Number(appState.research.level) || 0;
    if (!progress || !level) return;
    (DATA.sheets.research || [])
      .filter(row => isResearchStatRow(row) && row.種族 === basic.種族)
      .forEach(row => {
        const value = getResearchValue(row, level, progress);
        if (value) addSourceNamedStat(breakdown, 'research', row.ステータス, value);
      });
    mergeTotals(totals, breakdown.research);
  }

  function hasBoardSnapshotDiff(currentBoards = {}, plannedBoards = {}) {
    return Object.keys(createBoardSnapshotDiff(currentBoards, plannedBoards).changed || {}).length > 0;
  }

  function createBoardSnapshotDiff(currentBoards = {}, plannedBoards = {}, id = '') {
    const changed = {};
    const costDiff = createEmptyBoardCostSummary();
    const keys = new Set([...Object.keys(currentBoards || {}), ...Object.keys(plannedBoards || {})]);
    keys.forEach(layer => {
      const currentFilled = currentBoards?.[layer]?.filled || {};
      const plannedFilled = plannedBoards?.[layer]?.filled || {};
      const nodeKeys = new Set([...Object.keys(currentFilled), ...Object.keys(plannedFilled)]);
      nodeKeys.forEach(key => {
        const before = !!currentFilled[key];
        const after = !!plannedFilled[key];
        if (before === after) return;
        changed[key] = after ? 1 : -1;
        const row = findBoardRowByKey(id || view.id, key);
        addBoardCostSummary(costDiff, row, after ? 1 : -1);
      });
    });
    return { changed, costDiff };
  }

  function findBoardRowByKey(id, key) {
    const [layer, x, y] = String(key).split(':');
    return (DATA.getById('board', id) || []).find(row =>
      String(row.ボード階層) === layer
      && String(row.X_pos) === x
      && String(row.Y_pos) === y
    ) || null;
  }

  function createEmptyBoardCostSummary() {
    return { gold: 0, low: 0, mid: 0, high: 0, special: 0, commonTicket: 0, apostleTicket: 0 };
  }

  function addBoardCostSummary(summary, row, sign) {
    if (!row) return;
    summary.gold += (Number(row.ゴールド) || 0) * sign;
    summary.low += (Number(row.下級) || 0) * sign;
    summary.mid += (Number(row.中級) || 0) * sign;
    summary.high += (Number(row.上級) || 0) * sign;
    summary.special += (Number(row.特級) || 0) * sign;
    summary.commonTicket += (Number(row['★1共同教団証']) || 0) * sign;
    summary.apostleTicket += (Number(row.使徒証) || 0) * sign;
  }

  function findEquipmentValue(rank, statGroup, tier, enhance) {
    const row = DATA.sheets.equipmentValues.find(item =>
      Number(item.rank) === Number(rank)
      && String(item.statGroup) === String(statGroup)
      && Number(item.tier) === Number(tier)
    );
    if (!row) return null;
    return {
      name: row.equipName || `${statGroup} tier${tier}`,
      value: Number(row[`enhance${enhance}`]) || 0
    };
  }

  function addRankUpValue(totals, breakdown, rankFrom, tier, valueKey, totalKey) {
    const row = DATA.sheets.rankUpBonuses.find(item =>
      Number(item.rank_from) === Number(rankFrom)
      && Number(item.tier) === Number(tier)
    );
    if (!row) return;
    const value = Number(row[valueKey]) || 0;
    addStatValue(totals, totalKey, value);
    addSourceStat(breakdown, 'rankUp', totalKey, value);
  }

  function hasEquipmentTier(equipment, rank, key) {
    const value = Number(equipment[`Equip_Rank${rank}_${key}`]);
    return Number.isFinite(value) && value > 0;
  }

  function getEquipmentIconPath(rank, statGroup, tier) {
    const category = statGroup === '会心/会心DMG' || statGroup === '会心抵抗/会心DMG抵抗'
      ? 'Accessory'
      : statGroup.includes('攻撃')
        ? 'Weapon'
        : 'Armor';
    const variantBase = (() => {
      if (statGroup === 'HP') return 0;
      if (statGroup === '物理攻撃力') return 0;
      if (statGroup === '魔法攻撃力') return 5;
      if (statGroup === '物理防御力') return 5;
      if (statGroup === '魔法防御力') return 10;
      if (statGroup === '会心/会心DMG') return 0;
      if (statGroup === '会心抵抗/会心DMG抵抗') return 5;
      return 0;
    })();
    const variant = variantBase + (6 - Number(tier));
    return `img/equipicons/Equip_${category}${String(rank).padStart(2, '0')}${String(variant).padStart(2, '0')}.webp`;
  }

  function findBaseStatValue(type, group) {
    const row = DATA.sheets.baseStatValues.find(item => String(item.col1) === `tier${type}`);
    if (!row) return null;
    const columns = {
      hp: ['HP基礎', 'HP係数'],
      attack: ['攻撃系基礎', '攻撃系係数'],
      defense: ['防御系基礎', '防御系係数'],
      crit: ['会心系基礎', '会心系係数']
    };
    const [baseKey, coeffKey] = columns[group] || [];
    return {
      base: row[baseKey],
      coeff: row[coeffKey]
    };
  }

  function addNamedStat(totals, name, value) {
    const key = STAT_ALIASES[name] || STAT_ALIASES[String(name).replace(/全体/g, '')] || '';
    addStatValue(totals, key, value);
  }

  function addSourceNamedStat(breakdown, source, name, value) {
    const key = STAT_ALIASES[name] || STAT_ALIASES[String(name).replace(/全体/g, '')] || '';
    addSourceStat(breakdown, source, key, value);
  }

  function addSourceStat(breakdown, source, key, value) {
    if (!breakdown?.[source] || !key || !value) return;
    addStatValue(breakdown[source], key, value);
  }

  function addStatValue(totals, key, value) {
    if (!key || !value) return;
    if (key === 'attackAll') {
      totals.patk += value;
      totals.matk += value;
      return;
    }
    if (key === 'defenseAll') {
      totals.pdef += value;
      totals.mdef += value;
      return;
    }
    if (key === 'critPair') {
      totals.crit += value;
      totals.critDmg += value;
      return;
    }
    if (key === 'critResPair') {
      totals.critRes += value;
      totals.critDmgRes += value;
      return;
    }
    if (Object.prototype.hasOwnProperty.call(totals, key)) totals[key] += value;
  }

  function mergeTotals(target, source) {
    TOTAL_LABELS.forEach(item => {
      const value = Number(source?.[item.key]) || 0;
      if (value) addStatValue(target, item.key, value);
    });
  }

  function createEmptyTotals() {
    return { hp: 0, patk: 0, matk: 0, pdef: 0, mdef: 0, crit: 0, critDmg: 0, critRes: 0, critDmgRes: 0, spRegen: 0 };
  }

  function createBreakdownTotals() {
    return Object.fromEntries(BREAKDOWN_SOURCES.map(source => [source.key, createEmptyTotals()]));
  }

  function getCurrentBoardRows(rows = DATA.getById('board', view.id) || []) {
    return rows.filter(row => Number(row.ボード階層) === view.board);
  }

  function getBoardRowsForLayer(layer) {
    return (DATA.getById('board', view.id) || []).filter(row => Number(row.ボード階層) === Number(layer));
  }

  function beginBoardDraft() {
    if (hasBoardDraft()) return;
    const baselineBoards = getBoardEditBaselineBoards();
    boardDraft = {
      apostleId: view.id,
      mode: view.boardEditMode,
      boards: cloneJson(baselineBoards),
      shortcutTargets: view.boardEditMode === 'plan'
        ? mergeShortcutTargetMaps(
          collectFilledSpecialTargetsByLayer(baselineBoards),
          currentApostleState().plannedBoardShortcutTargets || {}
        )
        : collectFilledSpecialTargetsByLayer(baselineBoards)
    };
  }

  function beginBoardDraftForLayer(layer) {
    beginBoardDraft();
    ensureBoardLayerGatePath(layer);
  }

  function syncBoardDraftToGlobalDraft() {
    if (!hasBoardDraft()) return;
    const draftMode = boardDraft.mode || view.boardEditMode || view.boardGlobalMode;
    view.boardGlobalMode = draftMode;
    globalBoardDrafts[view.id] = {
      mode: draftMode,
      boards: cloneJson(boardDraft.boards),
      shortcutTargets: mergeShortcutTargetMaps(
        collectFilledSpecialTargetsByLayer(boardDraft.boards),
        boardDraft.shortcutTargets || {}
      )
    };
  }

  function syncGlobalDraftToBoardDraft(id) {
    const draft = globalBoardDrafts[id];
    if (!draft) return;
    view.boardEditMode = draft.mode || view.boardGlobalMode;
    boardDraft = {
      apostleId: id,
      mode: view.boardEditMode,
      boards: cloneJson(draft.boards),
      shortcutTargets: cloneJson(draft.shortcutTargets || {})
    };
  }

  function ensureBoardLayerGatePath(layer) {
    const targetLayer = Number(layer) || 1;
    if (targetLayer <= 1) return;
    const originalBoard = view.board;
    try {
      for (let currentLayer = 1; currentLayer < targetLayer; currentLayer++) {
        view.board = currentLayer;
        const rows = getBoardRowsForLayer(currentLayer);
        const gate = rows.find(row => row.マス_type === 'ゲート');
        if (!gate) continue;
        const gateKey = boardKey(gate);
        const board = getBoardStateForLayer(currentLayer);
        if (board.filled?.[gateKey]) continue;
        const path = findBestBoardPath(rows, gateKey);
        path.forEach(pathKey => {
          board.filled[pathKey] = true;
        });
        board.filled[gateKey] = true;
      }
    } finally {
      view.board = originalBoard;
    }
  }

  function restoreSavedBoardPlan() {
    boardDraft = null;
    view.boardEditMode = 'current';
  }

  function applyDisplayedBoardPlanToCurrent() {
    if (view.boardEditMode !== 'plan') return;
    const state = currentApostleState();
    const targetBoards = hasBoardDraft()
      ? boardDraft.boards
      : state.plannedBoards;
    if (!targetBoards || !hasBoardSnapshotDiff(state.boards || {}, targetBoards || {})) return;
    const basic = DATA.getById('basicInfo', view.id);
    const name = basic?.使徒名 || view.id;
    const editingNote = hasBoardDraft() ? '\n予定モードで編集中の内容も現在に反映します。' : '';
    if (!window.confirm(`${name}の予定ボードを現在状態に反映しますか？\n反映後、この使徒の保存予定は削除されます。${editingNote}`)) return;

    state.boards = cloneJson(targetBoards);
    delete state.plannedBoards;
    delete state.plannedBoardShortcutTargets;
    boardDraft = null;
    delete globalBoardDrafts[view.id];
    saveState();
    render();
  }

  function hasBoardDraft() {
    return boardDraft?.apostleId === view.id && boardDraft?.mode === view.boardEditMode;
  }

  function hasSavedBoardPlan() {
    const state = currentApostleState();
    return !!state.plannedBoards && typeof state.plannedBoards === 'object';
  }

  function mergeBoardDraftIntoSavedPlan(state) {
    const plannedBoards = cloneJson(state.plannedBoards || state.boards || {});
    const rows = DATA.getById('board', view.id) || [];

    rows.forEach(row => {
      if (row.マス_type === 'スタート') return;
      const layer = String(row.ボード階層);
      const key = boardKey(row);
      const committed = !!state.boards?.[layer]?.filled?.[key];
      const draft = !!boardDraft.boards?.[layer]?.filled?.[key];
      if (committed === draft) return;

      if (!plannedBoards[layer]) plannedBoards[layer] = { filled: {}, targets: [] };
      if (!plannedBoards[layer].filled) plannedBoards[layer].filled = {};
      if (draft) plannedBoards[layer].filled[key] = true;
      else delete plannedBoards[layer].filled[key];
    });

    Object.entries(boardDraft.boards || {}).forEach(([layer, board]) => {
      if (!plannedBoards[layer]) plannedBoards[layer] = { filled: {}, targets: [] };
      plannedBoards[layer].targets = Array.from(new Set([
        ...(plannedBoards[layer].targets || []),
        ...(board.targets || [])
      ]));
    });

    const shortcutTargets = cloneJson(state.plannedBoardShortcutTargets || {});
    Object.entries(boardDraft.shortcutTargets || {}).forEach(([layer, targets]) => {
      shortcutTargets[layer] = Array.from(new Set([
        ...(shortcutTargets[layer] || []),
        ...(targets || [])
      ]));
    });

    state.plannedBoards = plannedBoards;
    state.plannedBoardShortcutTargets = shortcutTargets;
  }

  function rebaseSavedBoardPlan(state, newBoards) {
    if (!state.plannedBoards || typeof state.plannedBoards !== 'object') return null;
    const oldBoards = state.boards || {};
    const rebasedBoards = cloneJson(newBoards);
    const rows = DATA.getById('board', view.id) || [];
    let hasDifference = false;

    rows.forEach(row => {
      if (row.マス_type === 'スタート') return;
      const layer = String(row.ボード階層);
      const key = boardKey(row);
      const oldCommitted = !!oldBoards[layer]?.filled?.[key];
      const planned = !!state.plannedBoards[layer]?.filled?.[key];
      const newCommitted = !!newBoards[layer]?.filled?.[key];
      const rebased = planned !== oldCommitted ? planned : newCommitted;

      if (!rebasedBoards[layer]) rebasedBoards[layer] = { filled: {}, targets: [] };
      if (!rebasedBoards[layer].filled) rebasedBoards[layer].filled = {};
      if (rebased) rebasedBoards[layer].filled[key] = true;
      else delete rebasedBoards[layer].filled[key];
      if (rebased !== newCommitted) hasDifference = true;
    });

    if (!hasDifference) return null;

    const shortcutTargets = {};
    Object.entries(state.plannedBoardShortcutTargets || {}).forEach(([layer, targets]) => {
      const remaining = (targets || []).filter(key => {
        const planned = !!rebasedBoards[layer]?.filled?.[key];
        const committed = !!newBoards[layer]?.filled?.[key];
        return planned !== committed;
      });
      if (remaining.length) shortcutTargets[layer] = remaining;
    });

    return { boards: rebasedBoards, shortcutTargets };
  }

  function isPlannedBoardRowChanged(row) {
    if (!hasSavedBoardPlan() || row.マス_type === 'スタート') return false;
    const committed = isCommittedBoardRowFilled(row);
    const planned = !!currentApostleState().plannedBoards?.[String(row.ボード階層)]?.filled?.[boardKey(row)];
    return committed !== planned;
  }

  function hasBoardDraftChanges() {
    if (!hasBoardDraft()) return false;
    const baselineBoards = getBoardEditBaselineBoards();
    return (DATA.getById('board', view.id) || []).some(row => {
      if (row.マス_type === 'スタート') return false;
      const committed = !!baselineBoards?.[String(row.ボード階層)]?.filled?.[boardKey(row)];
      const draft = !!boardDraft.boards?.[String(row.ボード階層)]?.filled?.[boardKey(row)];
      return committed !== draft;
    });
  }

  function getBoardEditBaselineBoards() {
    const state = currentApostleState();
    if (view.boardEditMode === 'plan') return state.plannedBoards || state.boards || {};
    return state.boards || {};
  }

  function switchBoardEditMode(mode) {
    if (mode === view.boardEditMode) return;
    if (hasBoardDraftChanges() && !window.confirm('未保存のボード編集を取り消してモードを切り替えますか？')) return;
    boardDraft = null;
    view.boardEditMode = mode;
    render();
  }

  function getBoardStateForLayer(layer, useDraft = true) {
    let boards = snapshotBoardOverride;
    if (!boards) {
      boards = useDraft && hasBoardDraft()
        ? boardDraft.boards
        : getBoardEditBaselineBoards();
    }
    const key = String(layer);
    if (!boards[key]) boards[key] = { filled: {}, targets: [] };
    if (!boards[key].filled) boards[key].filled = {};
    if (!Array.isArray(boards[key].targets)) boards[key].targets = [];
    return boards[key];
  }

  function isCommittedBoardRowFilled(row) {
    if (row.マス_type === 'スタート') return true;
    return !!currentApostleState().boards?.[String(row.ボード階層)]?.filled?.[boardKey(row)];
  }

  function isBoardBaselineRowFilled(row) {
    if (row.マス_type === 'スタート') return true;
    return !!getBoardEditBaselineBoards()?.[String(row.ボード階層)]?.filled?.[boardKey(row)];
  }

  function applyBoardShortcutFromCurrentState(layer, key) {
    const layerKey = String(layer);
    const targetSet = new Set(boardDraft.shortcutTargets?.[layerKey] || []);
    const removing = targetSet.has(key);
    if (removing) {
      targetSet.delete(key);
    } else {
      targetSet.add(key);
    }
    if (!boardDraft.shortcutTargets) boardDraft.shortcutTargets = {};
    boardDraft.shortcutTargets[layerKey] = Array.from(targetSet);
    rebuildBoardShortcutDraft(removing && view.boardShortcutOffMode === 'route');
  }

  function rebuildBoardShortcutDraft(cleanupRoutes = false) {
    const shortcutTargets = normalizeShortcutTargets(boardDraft.shortcutTargets || {});
    boardDraft.boards = createBoardShortcutBaseBoards(shortcutTargets, cleanupRoutes);
    const originalBoard = view.board;
    try {
      for (let currentLayer = 1; currentLayer <= 3; currentLayer++) {
        view.board = currentLayer;
        const rows = getBoardRowsForLayer(currentLayer);
        const board = getBoardStateForLayer(currentLayer);
        const layerKey = String(currentLayer);
        const selectedTargets = shortcutTargets[layerKey] || [];
        board.targets = selectedTargets.slice();
        const needsGate = Object.entries(shortcutTargets).some(([targetLayer, targets]) =>
          Number(targetLayer) > currentLayer && targets.length
        );
        const gate = rows.find(row => row.マス_type === 'ゲート');
        const targets = Array.from(new Set([
          ...selectedTargets,
          ...(needsGate && gate ? [boardKey(gate)] : [])
        ])).filter(targetKey => rows.some(row => boardKey(row) === targetKey));
        if (!targets.length) continue;
        const bestKeys = findBestBoardPathSet(currentLayer, rows, targets);
        board.filled = Object.fromEntries(bestKeys.map(pathKey => [pathKey, true]));
      }
    } finally {
      view.board = originalBoard;
    }
    boardDraft.shortcutTargets = shortcutTargets;
  }

  function collectFilledSpecialTargetsByLayer(boards) {
    const targetsByLayer = {};
    (DATA.getById('board', view.id) || []).forEach(row => {
      if (row.マス_type !== '特殊') return;
      const layer = String(row.ボード階層);
      const key = boardKey(row);
      if (!boards?.[layer]?.filled?.[key]) return;
      if (!targetsByLayer[layer]) targetsByLayer[layer] = [];
      targetsByLayer[layer].push(key);
    });
    return targetsByLayer;
  }

  function collectFilledSpecialTargetsForApostle(id, boards) {
    const previousId = view.id;
    view.id = id;
    try {
      return collectFilledSpecialTargetsByLayer(boards);
    } finally {
      view.id = previousId;
    }
  }

  function normalizeShortcutTargets(shortcutTargets = {}) {
    const normalized = {};
    for (let layer = 1; layer <= 3; layer++) {
      const layerKey = String(layer);
      const targets = Array.from(new Set(shortcutTargets?.[layerKey] || []));
      if (targets.length) normalized[layerKey] = targets;
    }
    return normalized;
  }

  function mergeShortcutTargetMaps(...maps) {
    const merged = {};
    for (let layer = 1; layer <= 3; layer++) {
      const layerKey = String(layer);
      const targets = Array.from(new Set(maps.flatMap(map => map?.[layerKey] || [])));
      if (targets.length) merged[layerKey] = targets;
    }
    return merged;
  }

  function createBoardShortcutBaseBoards(shortcutTargets = {}, cleanupRoutes = false) {
    if (cleanupRoutes) return {};
    const baseBoards = cloneJson(boardDraft?.boards || currentApostleState().boards || {});
    const selectedByLayer = normalizeShortcutTargets(shortcutTargets);
    (DATA.getById('board', view.id) || []).forEach(row => {
      if (row.マス_type !== '特殊') return;
      const layerKey = String(row.ボード階層);
      const key = boardKey(row);
      if ((selectedByLayer[layerKey] || []).includes(key)) return;
      if (baseBoards[layerKey]?.filled) delete baseBoards[layerKey].filled[key];
    });
    return baseBoards;
  }

  function rebuildBoardShortcutDraftFromTargets(shortcutTargets = {}, cleanupRoutes = false) {
    const normalizedTargets = normalizeShortcutTargets(shortcutTargets);
    boardDraft.boards = createBoardShortcutBaseBoards(normalizedTargets, cleanupRoutes);
    const originalBoard = view.board;
    try {
      for (let currentLayer = 1; currentLayer <= 3; currentLayer++) {
        view.board = currentLayer;
        const rows = getBoardRowsForLayer(currentLayer);
        const board = getBoardStateForLayer(currentLayer);
        const layerKey = String(currentLayer);
        const selectedTargets = normalizedTargets[layerKey] || [];
        board.targets = selectedTargets.slice();
        const needsGate = Object.entries(normalizedTargets).some(([targetLayer, targets]) =>
          Number(targetLayer) > currentLayer && targets.length
        );
        const gate = rows.find(row => row.マス_type === 'ゲート');
        const targets = Array.from(new Set([
          ...selectedTargets,
          ...(needsGate && gate ? [boardKey(gate)] : [])
        ])).filter(targetKey => rows.some(row => boardKey(row) === targetKey));
        if (!targets.length) continue;
        findBestBoardPathSet(currentLayer, rows, targets).forEach(pathKey => {
          board.filled[pathKey] = true;
        });
      }
    } finally {
      view.board = originalBoard;
    }
    boardDraft.shortcutTargets = normalizedTargets;
  }

  function findBestBoardPathSet(layer, rows, targets) {
    if (!targets.length) return [];
    if (targets.length <= 7) {
      return findBestBoardPathSetByPermutations(layer, rows, targets);
    }
    return findBestBoardPathSetGreedy(layer, rows, targets);
  }

  function findBestBoardPathSetByPermutations(layer, rows, targets) {
    let best = null;
    forEachPermutation(targets, order => {
      const result = simulateBoardTargetOrder(layer, rows, order);
      if (!best || comparePathScore(result.score, best.score) < 0) best = result;
    });
    return best?.keys || [];
  }

  function forEachPermutation(items, callback, start = 0) {
    if (start >= items.length) {
      callback(items.slice());
      return;
    }
    for (let index = start; index < items.length; index++) {
      [items[start], items[index]] = [items[index], items[start]];
      forEachPermutation(items, callback, start + 1);
      [items[start], items[index]] = [items[index], items[start]];
    }
  }

  function simulateBoardTargetOrder(layer, rows, order) {
    const originalBoard = view.board;
    const board = getBoardStateForLayer(layer);
    const savedFilled = board.filled;
    const baseFilled = cloneJson(savedFilled);
    const baseKeys = new Set(Object.keys(baseFilled));
    view.board = Number(layer);
    board.filled = cloneJson(baseFilled);
    try {
      let failed = false;
      order.forEach(targetKey => {
        const path = findBestBoardPath(rows, targetKey);
        if (!path.length && !isBoardTargetAlreadyFilled(targetKey)) {
          failed = true;
          return;
        }
        path.forEach(pathKey => {
          board.filled[pathKey] = true;
        });
      });
      if (failed) return { keys: [], score: { gold: Number.POSITIVE_INFINITY, steps: Number.POSITIVE_INFINITY } };
      const keys = Object.keys(board.filled);
      return { keys, score: scoreBoardPath(keys.filter(key => !baseKeys.has(key))) };
    } finally {
      board.filled = savedFilled;
      view.board = originalBoard;
    }
  }

  function findBestBoardPathSetGreedy(layer, rows, targets) {
    const originalBoard = view.board;
    const board = getBoardStateForLayer(layer);
    const savedFilled = board.filled;
    const baseFilled = cloneJson(savedFilled);
    view.board = Number(layer);
    board.filled = cloneJson(baseFilled);
    try {
      const remaining = targets.slice();
      while (remaining.length) {
        const best = remaining
          .map(targetKey => ({ targetKey, path: findBestBoardPath(rows, targetKey) }))
          .filter(item => item.path.length || isBoardTargetAlreadyFilled(item.targetKey))
          .sort(compareTargetPath)[0];
        if (!best) break;
        best.path.forEach(pathKey => {
          board.filled[pathKey] = true;
        });
        const index = remaining.indexOf(best.targetKey);
        if (index >= 0) remaining.splice(index, 1);
      }
      return Object.keys(board.filled);
    } finally {
      board.filled = savedFilled;
      view.board = originalBoard;
    }
  }

  function isBoardTargetAlreadyFilled(targetKey) {
    return !!currentBoardState().filled[targetKey];
  }

  function compareTargetPath(a, b) {
    const scoreDiff = scoreBoardPath(a.path).gold - scoreBoardPath(b.path).gold
      || scoreBoardPath(a.path).steps - scoreBoardPath(b.path).steps;
    return scoreDiff || compareBoardKeys(a.targetKey, b.targetKey);
  }

  function scoreBoardPath(path) {
    const rows = getBoardRowsForLayer(view.board);
    return path.reduce((score, key) => {
      const row = rows.find(item => boardKey(item) === key);
      return {
        gold: score.gold + (Number(row?.ゴールド) || 0),
        steps: score.steps + 1
      };
    }, { gold: 0, steps: 0 });
  }

  function compareBoardKeys(a, b) {
    const [aLayer, aX, aY] = String(a).split(':').map(Number);
    const [bLayer, bX, bY] = String(b).split(':').map(Number);
    return aLayer - bLayer || aY - bY || aX - bX;
  }

  function pruneLockedBoardLayers() {
    for (let layer = 2; layer <= 3; layer++) {
      if (isBoardLayerUnlocked(layer)) continue;
      const board = getBoardStateForLayer(layer);
      board.filled = {};
      board.targets = [];
    }
  }

  function findBestBoardPath(rows, targetKey) {
    const target = rows.find(row => boardKey(row) === targetKey);
    if (!target) return [];

    const starts = getBoardPathStartKeys(rows);
    const best = new Map();
    const prev = new Map();
    const queue = starts.map(key => ({ key, score: createPathScore() }));
    starts.forEach(key => best.set(key, createPathScore()));

    while (queue.length) {
      queue.sort(compareQueuedPath);
      const current = queue.shift();
      const currentBest = best.get(current.key);
      if (!currentBest || comparePathScore(current.score, currentBest) > 0) continue;
      if (current.key === targetKey) break;
      getNeighborBoardRowsForKey(rows, current.key).forEach(next => {
        const nextKey = boardKey(next);
        const nextScore = addPathScore(current.score, next);
        const saved = best.get(nextKey);
        if (saved && comparePathScore(nextScore, saved) >= 0) return;
        best.set(nextKey, nextScore);
        prev.set(nextKey, current.key);
        queue.push({ key: nextKey, score: nextScore });
      });
    }

    if (!best.has(targetKey)) return [];
    const path = [];
    let cursor = targetKey;
    while (cursor && !starts.includes(cursor)) {
      path.push(cursor);
      cursor = prev.get(cursor);
    }
    return path.reverse();
  }

  function createPathScore() {
    return { gold: 0, steps: 0 };
  }

  function addPathScore(score, row) {
    return {
      gold: score.gold + (Number(row.ゴールド) || 0),
      steps: score.steps + 1
    };
  }

  function compareQueuedPath(a, b) {
    return comparePathScore(a.score, b.score);
  }

  function comparePathScore(a, b) {
    return a.gold - b.gold || a.steps - b.steps;
  }

  function pruneDisconnectedBoardNodes(rows, board) {
    const connected = getConnectedFilledBoardKeys(rows);
    Object.keys(board.filled).forEach(key => {
      if (!connected.has(key)) delete board.filled[key];
    });
  }

  function getConnectedFilledBoardKeys(rows) {
    const starts = getBoardConnectionStartKeys(rows);
    const connected = new Set(starts);
    const queue = [...starts];
    while (queue.length) {
      const key = queue.shift();
      getNeighborBoardRowsForKey(rows, key).forEach(next => {
        const nextKey = boardKey(next);
        if (connected.has(nextKey) || !isBoardRowFilled(next)) return;
        connected.add(nextKey);
        queue.push(nextKey);
      });
    }
    return connected;
  }

  function getNeighborBoardRows(rows, row) {
    const x = Number(row.X_pos);
    const y = Number(row.Y_pos);
    return rows.filter(item => {
      const dx = Math.abs(Number(item.X_pos) - x);
      const dy = Math.abs(Number(item.Y_pos) - y);
      return dx + dy === 1;
    });
  }

  function getNeighborBoardRowsForKey(rows, key) {
    if (key === virtualBoardStartKey()) {
      const entry = getBoardEntryRow(rows);
      return entry ? [entry] : [];
    }
    const row = rows.find(item => boardKey(item) === key);
    return row ? getNeighborBoardRows(rows, row) : [];
  }

  function isBoardRowFilled(row) {
    return row.マス_type === 'スタート' || !!getBoardStateForLayer(row.ボード階層).filled[boardKey(row)];
  }

  function getBoardPathStartKeys(rows) {
    const starts = rows.filter(row => isBoardRowFilled(row)).map(boardKey);
    if (!starts.length && Number(view.board) > 1 && isBoardLayerUnlocked(view.board)) {
      starts.push(virtualBoardStartKey());
    }
    return starts;
  }

  function getBoardConnectionStartKeys(rows) {
    const starts = rows.filter(row => row.マス_type === 'スタート').map(boardKey);
    if (!starts.length && Number(view.board) > 1 && isBoardLayerUnlocked(view.board)) {
      starts.push(virtualBoardStartKey());
    }
    return starts;
  }

  function getBoardEntryRow(rows) {
    const minY = Math.min(...rows.map(row => Number(row.Y_pos)).filter(Number.isFinite));
    const candidates = rows
      .filter(row => Number(row.Y_pos) === minY)
      .sort((a, b) => Number(a.X_pos) - Number(b.X_pos));
    const previousGate = getPreviousBoardGateRow();
    if (previousGate) {
      const gateX = Number(previousGate.X_pos);
      return candidates.find(row => Number(row.X_pos) === gateX)
        || candidates.slice().sort((a, b) => Math.abs(Number(a.X_pos) - gateX) - Math.abs(Number(b.X_pos) - gateX))[0]
        || null;
    }
    return candidates[0] || null;
  }

  function getPreviousBoardGateRow() {
    const previousLayer = Number(view.board) - 1;
    if (previousLayer < 1) return null;
    const rows = DATA.getById('board', view.id) || [];
    return rows.find(row => Number(row.ボード階層) === previousLayer && row.マス_type === 'ゲート') || null;
  }

  function virtualBoardStartKey() {
    return `virtual-start:${view.board}`;
  }

  function isBoardLayerUnlocked(layer) {
    if (Number(layer) <= 1) return true;
    return isBoardGateFilled(Number(layer) - 1);
  }

  function getMaxUnlockedBoardLayer() {
    for (let layer = 3; layer >= 1; layer--) {
      if (isBoardLayerUnlocked(layer)) return layer;
    }
    return 1;
  }

  function isBoardGateFilled(layer) {
    const rows = DATA.getById('board', view.id) || [];
    const gate = rows.find(row => Number(row.ボード階層) === Number(layer) && row.マス_type === 'ゲート');
    if (!gate) return false;
    const board = getBoardStateForLayer(layer);
    return !!board?.filled?.[boardKey(gate)];
  }

  function currentBoardState() {
    return getBoardStateForLayer(view.board);
  }

  function ensureBoardState(layer) {
    const state = currentApostleState();
    const key = String(layer);
    if (!state.boards[key]) state.boards[key] = { filled: {}, targets: [] };
    if (!state.boards[key].filled) state.boards[key].filled = {};
    if (!Array.isArray(state.boards[key].targets)) state.boards[key].targets = [];
    return state.boards[key];
  }

  function boardKey(row) {
    return `${row.ボード階層}:${row.X_pos}:${row.Y_pos}`;
  }

  function formatBoardEffect(row) {
    const parts = [];
    if (row.効果1_type) parts.push(`${row.効果1_type}+${row.効果1_value}`);
    if (row.効果2_type) parts.push(`${row.効果2_type}+${row.効果2_value}`);
    return parts.join('\n') || row.マス_type || '';
  }

  function shortBoardLabel(row) {
    if (row.マス_type === 'スタート') return '';
    const suffix = row.マス_type === '特殊' ? '%' : '';
    const value = [row.効果1_value, row.効果2_value]
      .find(value => value !== '' && value !== null && value !== undefined);
    return value ? `+${value}${suffix}` : '';
  }

  function getBoardTileBasePath(row, enabled = false) {
    if (row.マス_type === 'ゲート') return 'img/Board/Tile_gate.webp';
    if (row.マス_type === '上級') return `img/Board/Tile_2_${enabled ? 'On' : 'Off'}.webp`;
    if (row.マス_type === '特殊') return `img/Board/Tile_3_${enabled ? 'On' : 'Off'}.webp`;
    return `img/Board/Tile_1_${enabled ? 'On' : 'Off'}.webp`;
  }

  function getBoardIconPath(row, enabled = false) {
    const types = [row.効果1_type, row.効果2_type].filter(Boolean).join('/');
    const state = enabled ? 'On' : 'Off';
    if (row.マス_type === 'スタート') return `img/Board/Tile_Start_${BOARD_START_DIRECTION}.webp`;
    if (row.マス_type === 'ゲート') return '';
    if (types.includes('HP')) return `img/Board/Tile_Hp_${state}.webp`;
    if (types.includes('物理攻撃') && types.includes('魔法攻撃')) return `img/Board/Tile_AtkBoth_${state}.webp`;
    if (types.includes('物理攻撃')) return `img/Board/Tile_AtkP_${state}.webp`;
    if (types.includes('魔法攻撃')) return `img/Board/Tile_AtkM_${state}.webp`;
    if (types.includes('物理防御') && types.includes('魔法防御')) return `img/Board/Tile_DefBoth_${state}.webp`;
    if (types.includes('物理防御')) return `img/Board/Tile_DefP_${state}.webp`;
    if (types.includes('魔法防御')) return `img/Board/Tile_DefM_${state}.webp`;
    if ((types.includes('会心DMG抵抗') || types.includes('会心ダメージ抵抗')) && types.includes('会心抵抗')) return `img/Board/Tile_CritResBoth_${state}.webp`;
    if (types.includes('会心DMG抵抗') || types.includes('会心ダメージ抵抗')) return `img/Board/Tile_CritiDMGRes_${state}.webp`;
    if (types.includes('会心抵抗')) return `img/Board/Tile_CritiRes_${state}.webp`;
    if ((types.includes('会心DMG') || types.includes('会心ダメージ')) && types.includes('会心')) return `img/Board/Tile_CritBoth_${state}.webp`;
    if (types.includes('会心DMG') || types.includes('会心ダメージ')) return `img/Board/Tile_CritDMG_${state}.webp`;
    if (types.includes('会心')) return `img/Board/Tile_Crit_${state}.webp`;
    if (types.includes('回復') || types.includes('治癒')) return `img/Board/Tile_Healing_${state}.webp`;
    return '';
  }

  function boardNodeClass(row) {
    if (row.マス_type === 'スタート') return 'type-start';
    if (row.マス_type === 'ゲート') return 'type-gate';
    if (row.マス_type === '上級') return 'type-advanced';
    if (row.マス_type === '特殊') return 'type-special';
    return '';
  }

  function ensureApostleState(id) {
    if (!appState.apostles[id]) {
      const basic = DATA.getById('basicInfo', id);
      appState.apostles[id] = {
        rank: 1,
        level: 1,
        star: Number(basic?.レア度) || 1,
        grade: 1,
        gradeConfigured: false,
        bond: 1,
        asideRank: 0,
        asideLevel: 0,
        skillLevels: { low: 1, high: 1, passive: 1 },
        follow: false,
        equipment: {},
        boards: {},
        statSnapshots: {}
      };
    }
    const state = appState.apostles[id];
    if (!state.star) {
      const basic = DATA.getById('basicInfo', id);
      state.star = Number(basic?.レア度) || 1;
    }
    const basic = DATA.getById('basicInfo', id);
    state.star = normalizeApostleStar(state.star);
    if (state.gradeConfigured !== true) {
      state.grade = 1;
      state.gradeConfigured = false;
    } else {
      state.grade = normalizeGrade(state.grade);
    }
    state.level = normalizeApostleLevel(state.level, state.star);
    state.bond = normalizeBondForApostle(basic, state.bond);
    if (state.asideRank === undefined) state.asideRank = inferAsideRankFromLevel(state.asideLevel);
    if (state.asideLevel === undefined) state.asideLevel = 0;
    state.asideLevel = normalizeAsideLevelForRank(state.asideLevel, state.asideRank);
    state.skillLevels = normalizeSkillLevels(state.skillLevels, state.asideRank);
    if (!state.statSnapshots || typeof state.statSnapshots !== 'object') state.statSnapshots = {};
    return appState.apostles[id];
  }

  function inferAsideRankFromLevel(level) {
    const value = Number(level) || 0;
    if (!value) return 0;
    if (value <= 30) return 1;
    if (value <= 40) return 2;
    return 3;
  }

  function currentApostleState() {
    return ensureApostleState(view.id);
  }

  function installStatEngineApi() {
    window.TRICKCAL_STAT_ENGINE = {
      version: 1,
      getActiveApostleId: () => view.id,
      getState: () => cloneJson(appState),
      getApostleState: (id = view.id) => cloneJson(ensureApostleState(getValidApostleId(id))),
      getCurrentSnapshot: (id = view.id) => {
        const safeId = getValidApostleId(id);
        return cloneJson(ensureApostleState(safeId).statSnapshots?.current || {});
      },
      getPlannedSnapshot: (id = view.id) => {
        const safeId = getValidApostleId(id);
        return cloneJson(ensureApostleState(safeId).statSnapshots?.planned || {});
      },
      calculateApostleStats: calculateApostleStatsForEngine,
      refreshSnapshots: refreshAllStatSnapshots
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        activeId: parsed.activeId || '',
        apostles: parsed.apostles && typeof parsed.apostles === 'object' ? parsed.apostles : {},
        research: parsed.research && typeof parsed.research === 'object' ? parsed.research : {},
        cards: parsed.cards && typeof parsed.cards === 'object' ? parsed.cards : {},
        formation: parsed.formation && typeof parsed.formation === 'object' ? normalizeFormationState(parsed.formation) : createDefaultFormation(),
        totalCombatPower: normalizeFormationCoins(parsed.totalCombatPower),
        activeFormationPresetId: parsed.activeFormationPresetId || '',
        savedStates: parsed.savedStates && typeof parsed.savedStates === 'object' ? parsed.savedStates : {},
        savedFormations: normalizeFormationPresetList(parsed.savedFormations)
      };
    } catch (error) {
      return { activeId: '', apostles: {}, research: {}, cards: {}, formation: createDefaultFormation(), totalCombatPower: 0, activeFormationPresetId: '', savedStates: {}, savedFormations: [] };
    }
  }

  function saveState(options = {}) {
    if (options.renderStateManager === false) scheduleStateManagerRender();
    else renderStateManager();
    scheduleStateSave();
    if (options.refreshSnapshots === false) return;
    scheduleStatSnapshotRefresh();
  }

  function scheduleStateManagerRender() {
    if (stateManagerRenderTimer) window.clearTimeout(stateManagerRenderTimer);
    stateManagerRenderTimer = window.setTimeout(() => {
      stateManagerRenderTimer = 0;
      renderStateManager();
    }, 120);
  }

  function scheduleStateSave() {
    if (stateSaveTimer) window.clearTimeout(stateSaveTimer);
    stateSaveTimer = window.setTimeout(() => {
      stateSaveTimer = 0;
      persistState();
    }, 120);
  }

  function flushPendingStateSave() {
    if (stateSaveTimer) {
      window.clearTimeout(stateSaveTimer);
      stateSaveTimer = 0;
    }
    persistState();
  }

  function persistState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }

  function scheduleStatSnapshotRefresh() {
    if (statSnapshotRefreshTimer) window.clearTimeout(statSnapshotRefreshTimer);
    statSnapshotRefreshTimer = window.setTimeout(() => {
      statSnapshotRefreshTimer = 0;
      refreshAllStatSnapshots();
      persistState();
    }, 350);
  }

  function formatNumber(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return '-';
    return Math.round(num).toLocaleString();
  }

  function formatBreakdownValue(value) {
    const num = Number(value) || 0;
    return num ? formatNumber(num) : '';
  }

  function formatGlobalPercentBreakdownValue(increase, percent) {
    const increaseValue = Number(increase) || 0;
    const percentValue = Number(percent) || 0;
    if (!increaseValue && !percentValue) return '';
    const percentLabel = `${formatBoardSummaryValue(percentValue)}%`;
    return increaseValue ? `${formatNumber(increaseValue)} (${percentLabel})` : `0 (${percentLabel})`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }
})();
