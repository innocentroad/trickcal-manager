(() => {
  document.documentElement?.classList?.add('fdc-root');
  const STAT_STORAGE_KEY = 'trickcal_stat_prototype_v1';
  const STAT_SLOT_STORAGE_KEY = 'trickcal_stat_slots_v2';
  const CALC_SETTINGS_KEY = 'trickcal_formation_damage_settings_v1';
  const CALC_RESULT_SAVES_KEY = 'trickcal_formation_damage_result_saves_v1';
  const CUSTOM_ENEMY_PRESETS_KEY = 'trickcal_formation_damage_enemy_presets_v1';
  const THEME_KEY = 'trickcal_theme';
  const LEGACY_THEME_KEY = 'trickcal_damage_calc_theme';
  const FALLBACK_IMAGE = 'img/Chara/null.webp';
  const POSITIONS = ['後列', '中列', '前列'];
  const FDC_STATUS_SKILL_MULTIPLIERS = Object.freeze({
    '火傷': 30,
    '毒': 6,
    '苦痛': 12,
    '凍傷': 9
  });
  const PVP_ELIPH_REWARD_TIERS = Object.freeze([
    { minRank: 1001, maxRank: 3000, perRank: 0.8 },
    { minRank: 501, maxRank: 1000, perRank: 1 },
    { minRank: 201, maxRank: 500, perRank: 1.5 },
    { minRank: 51, maxRank: 200, perRank: 3 },
    { minRank: 1, maxRank: 50, perRank: 7 }
  ]);
  const PERSONALITY_ADVANTAGE = {
    '純粋': '冷静',
    '冷静': '狂気',
    '狂気': '純粋',
    '憂鬱': '活発',
    '活発': '憂鬱'
  };
  const APOSTLE_IMAGE_ALIASES = {
    ED: 'Ed',
    Kyuri: 'Kyuri',
    Kyui: 'Kyuri',
    Kyuui: 'Kyuri',
    Kiwi: 'Kyuri',
    Cuee: 'Kyuri',
    Shaydi: 'Shaydi',
    Shady: 'Shaydi',
    Lazy: 'Layze',
    Layze: 'Layze',
    Razy: 'Layze',
    Reizy: 'Layze',
    Selline: 'Selene',
    Selene: 'Selene',
    Rude: 'Rude',
    Rudd: 'Rude',
    Lude: 'Rude',
    RenewaAwaken: 'Renewa',
    Xion: 'Xion',
    xion: 'Xion',
    xXionx: 'Xion',
    Sion: 'Xion',
    sion: 'Xion',
    'シオン': 'Xion',
    'シオン・ザ・DB': 'Xion'
  };

  const el = {
    reload: document.getElementById('fdc-reload'),
    themeToggle: document.getElementById('fdc-theme-toggle'),
    saveMenu: document.getElementById('fdc-save-menu'),
    loadedSaveLabel: document.getElementById('fdc-loaded-save-label'),
    saveActionButtons: Array.from(document.querySelectorAll('[data-fdc-save-action]')),
    saveList: document.getElementById('fdc-save-list'),
    loadOptionsPanel: document.getElementById('fdc-load-options-panel'),
    loadPartInputs: Array.from(document.querySelectorAll('[data-fdc-load-part]')),
    perspectiveToggle: document.getElementById('fdc-perspective-toggle'),
    perspectiveLabel: document.getElementById('fdc-perspective-label'),
    mobileSideSwitch: document.getElementById('fdc-mobile-side-switch'),
    mobileSideButtons: Array.from(document.querySelectorAll('.fdc-mobile-side-switch button[data-fdc-mobile-side]')),
    damageType: document.getElementById('fdc-damage-type'),
    enemyDamageType: document.getElementById('fdc-enemy-damage-type'),
    gradeOverride: document.getElementById('fdc-grade-override'),
    statMode: document.getElementById('fdc-stat-mode'),
    statModeChoices: Array.from(document.querySelectorAll('[data-fdc-stat-mode-choice]')),
    boardPlanBonus: document.getElementById('fdc-board-plan-bonus'),
    boardPlanSpecial: document.getElementById('fdc-board-plan-special'),
    boardPlanAdvanced: document.getElementById('fdc-board-plan-advanced'),
    selfRoleChip: document.getElementById('fdc-self-role-chip'),
    enemyRoleChip: document.getElementById('fdc-enemy-role-chip'),
    selfAttackTypeChip: document.getElementById('fdc-self-attack-type-chip'),
    enemyAttackTypeChip: document.getElementById('fdc-enemy-attack-type-chip'),
    enemySourceMode: document.getElementById('fdc-enemy-source-mode'),
    pvpAffinityEnabled: document.getElementById('fdc-pvp-affinity-enabled'),
    pvpRankCalculator: document.getElementById('fdc-pvp-rank-calculator'),
    pvpRankInfo: document.getElementById('fdc-pvp-rank-info'),
    pvpRankInput: document.getElementById('fdc-pvp-rank-input'),
    pvpRankSlider: document.getElementById('fdc-pvp-rank-slider'),
    pvpMaxRank: document.getElementById('fdc-pvp-max-rank'),
    pvpChallengeEliph: document.getElementById('fdc-pvp-challenge-eliph'),
    enemyApostle: document.getElementById('fdc-enemy-apostle'),
    enemyApostleImage: document.getElementById('fdc-enemy-apostle-image'),
    enemySourcePresetFields: Array.from(document.querySelectorAll('.fdc-enemy-source-preset')),
    enemySourceApostleFields: Array.from(document.querySelectorAll('.fdc-enemy-source-apostle')),
    enemyPreset: document.getElementById('fdc-enemy-preset'),
    enemyStatusLink: document.getElementById('fdc-enemy-status-link'),
    enemyPresetName: document.getElementById('fdc-enemy-preset-name'),
    enemyPresetSave: document.getElementById('fdc-enemy-preset-save'),
    enemyPresetDelete: document.getElementById('fdc-enemy-preset-delete'),
    enemyPersonality: document.getElementById('fdc-enemy-personality'),
    enemyPersonalityIcon: document.getElementById('fdc-enemy-personality-icon'),
    enemyPhase: document.getElementById('fdc-enemy-phase'),
    enemyPhaseField: document.getElementById('fdc-enemy-phase-field'),
    enemySkill: document.getElementById('fdc-enemy-skill'),
    enemySkillChoices: document.getElementById('fdc-enemy-skill-choices'),
    selfWeaknessField: document.getElementById('fdc-self-weakness-field'),
    selfWeaknessLabel: document.getElementById('fdc-self-weakness-label'),
    enemyWeaknessField: document.getElementById('fdc-enemy-weakness-field'),
    enemyWeaknessLabel: document.getElementById('fdc-enemy-weakness-label'),
    enemyStatusDamageWeaknessField: document.getElementById('fdc-enemy-status-damage-weakness-field'),
    enemyStatusDamageWeaknessLabel: document.getElementById('fdc-enemy-status-damage-weakness-label'),
    enemyStatusDamageWeaknessValue: document.getElementById('fdc-enemy-status-damage-weakness-value'),
    enemyStatusTakenDamageWeaknessField: document.getElementById('fdc-enemy-status-taken-damage-weakness-field'),
    enemyStatusTakenDamageWeaknessLabel: document.getElementById('fdc-enemy-status-taken-damage-weakness-label'),
    selfTargetDebuffLabel: document.getElementById('fdc-self-target-debuff-label'),
    selfBreakField: document.getElementById('fdc-self-break-field'),
    selfBreakLabel: document.getElementById('fdc-self-break-label'),
    enemyAngerField: document.getElementById('fdc-enemy-anger-field'),
    enemyFinalStats: document.getElementById('fdc-enemy-final-stats'),
    enemyFinalStatsHeading: document.getElementById('fdc-enemy-final-stats-heading'),
    enemyIndividualSettings: document.getElementById('fdc-enemy-individual-settings'),
    enemyGlobalPercentGroup: document.getElementById('fdc-enemy-global-percent-group'),
    enemyGlobalAdditiveGroup: document.getElementById('fdc-enemy-global-additive-group'),
    enemyGlobalPercentEnabled: document.getElementById('fdc-enemy-global-percent-enabled'),
    enemyGlobalAdditiveEnabled: document.getElementById('fdc-enemy-global-additive-enabled'),
    enemyBoardPreset: document.getElementById('fdc-enemy-board-preset'),
    enemyRankPreset: document.getElementById('fdc-enemy-rank-preset'),
    enemyResearchLevel: document.getElementById('fdc-enemy-research-level'),
    enemyResearchProgress: document.getElementById('fdc-enemy-research-progress'),
    enemyAdditivePresetApply: document.getElementById('fdc-enemy-additive-preset-apply'),
    selfBuffCategory: document.getElementById('fdc-self-buff-category'),
    enemyBuffCategory: document.getElementById('fdc-enemy-buff-category'),
    enemyPresetBuffLabel: document.getElementById('fdc-enemy-preset-buff-label'),
    formationPreset: document.getElementById('fdc-formation-preset'),
    targetPreview: document.getElementById('fdc-target-preview'),
    floatingTarget: document.getElementById('fdc-floating-target'),
    formationPicker: document.getElementById('fdc-formation-picker'),
    skillPopover: document.getElementById('fdc-skill-popover'),
    selfSkillEffects: document.getElementById('fdc-self-skill-effects'),
    synergyCategory: document.getElementById('fdc-synergy-category'),
    artifactCategory: document.getElementById('fdc-artifact-category'),
    artifactEffectsToggle: document.getElementById('fdc-artifact-effects-toggle'),
    spellCategory: document.getElementById('fdc-spell-category'),
    cardCostController: document.getElementById('fdc-card-cost-controller'),
    cardCost: document.getElementById('fdc-card-cost'),
    cardCostPanel: document.getElementById('fdc-card-cost-panel'),
    applyFloat: document.getElementById('fdc-apply-float-controller'),
    applyFloatPanel: document.getElementById('fdc-apply-float-panel'),
    applyFloatToggle: document.getElementById('fdc-apply-float-toggle'),
    compareFloatPanel: document.getElementById('fdc-compare-float-panel'),
    compareFloatToggle: document.getElementById('fdc-compare-float-toggle'),
    compareFloatToggleLabel: document.querySelector('[data-fdc-compare-toggle-label]'),
    compareFloatHelp: document.getElementById('fdc-compare-float-help'),
    compareSource: document.getElementById('fdc-compare-source'),
    compareScopeFieldset: document.getElementById('fdc-compare-scope-fieldset'),
    compareScopeInputs: Array.from(document.querySelectorAll('[data-fdc-compare-scope]')),
    applyFloatInputs: Array.from(document.querySelectorAll('[data-fdc-apply-source]')),
    categorySourceInputs: Array.from(document.querySelectorAll('[data-fdc-category-source]')),
    resultDisplayInputs: Array.from(document.querySelectorAll('[data-fdc-result-display]')),
    applyFloatDots: Array.from(document.querySelectorAll('[data-fdc-apply-dot]')),
    applyFloatBulk: Array.from(document.querySelectorAll('[data-fdc-apply-bulk]')),
    pinnedCompareSave: document.getElementById('fdc-pinned-compare-save'),
    pinnedCompareClear: document.getElementById('fdc-pinned-compare-clear'),
    pinnedCompareNote: document.getElementById('fdc-pinned-compare-note'),
    selfSkillChoices: document.getElementById('fdc-self-skill-choices'),
    inputs: {
      selfHp: document.getElementById('fdc-self-hp'),
      atk: document.getElementById('fdc-atk'),
      selfDef: document.getElementById('fdc-self-def'),
      crit: document.getElementById('fdc-crit'),
      critDmg: document.getElementById('fdc-crit-dmg'),
      selfCritResBase: document.getElementById('fdc-self-crit-res-base'),
      selfCritDmgResBase: document.getElementById('fdc-self-crit-dmg-res-base'),
      enemyHp: document.getElementById('fdc-enemy-hp'),
      enemyAtk: document.getElementById('fdc-enemy-atk'),
      enemyCrit: document.getElementById('fdc-enemy-crit'),
      enemyCritDmg: document.getElementById('fdc-enemy-crit-dmg'),
      enemySkill: document.getElementById('fdc-enemy-skill-value'),
      def: document.getElementById('fdc-def'),
      critRes: document.getElementById('fdc-crit-res'),
      critDmgRes: document.getElementById('fdc-crit-dmg-res'),
      selfAtkP: document.getElementById('fdc-self-atk-p'),
      selfCritP: document.getElementById('fdc-self-crit-p'),
      selfCritDmgP: document.getElementById('fdc-self-crit-dmg-p'),
      selfSkill: document.getElementById('fdc-self-skill'),
      selfType: document.getElementById('fdc-self-type'),
      selfOther: document.getElementById('fdc-self-other'),
      selfAddP: document.getElementById('fdc-self-add-p'),
      selfPoisonStack: document.getElementById('fdc-self-poison-stack'),
      selfNoise: document.getElementById('fdc-self-noise'),
      selfWeaknessP: document.getElementById('fdc-self-weakness-p'),
      selfBreakStack: document.getElementById('fdc-self-break-stack'),
      selfCritRateP: document.getElementById('fdc-self-crit-rate-p'),
      selfCritDmgAddP: document.getElementById('fdc-self-crit-dmg-add-p'),
      selfAttackerDmgDownP: document.getElementById('fdc-self-attacker-dmg-down-p'),
      selfDefDownP: document.getElementById('fdc-self-def-down-p'),
      selfCritResDownP: document.getElementById('fdc-self-crit-res-down-p'),
      selfCritDmgResDownP: document.getElementById('fdc-self-crit-dmg-res-down-p'),
      selfDefP: document.getElementById('fdc-self-def-p'),
      selfTakenDmgP: document.getElementById('fdc-self-taken-dmg-p'),
      selfCritResP: document.getElementById('fdc-self-crit-res-p'),
      selfCritDmgResP: document.getElementById('fdc-self-crit-dmg-res-p'),
      extraCrayonHpP: document.getElementById('fdc-extra-crayon-hp-p'),
      extraCrayonAtkP: document.getElementById('fdc-extra-crayon-atk-p'),
      extraCrayonDefP: document.getElementById('fdc-extra-crayon-def-p'),
      extraCrayonCritP: document.getElementById('fdc-extra-crayon-crit-p'),
      extraCrayonCritDmgP: document.getElementById('fdc-extra-crayon-crit-dmg-p'),
      extraCrayonCritResP: document.getElementById('fdc-extra-crayon-crit-res-p'),
      extraCrayonCritDmgResP: document.getElementById('fdc-extra-crayon-crit-dmg-res-p'),
      enemyGlobalHpP: document.getElementById('fdc-enemy-global-hp-p'),
      enemyGlobalPatkP: document.getElementById('fdc-enemy-global-patk-p'),
      enemyGlobalMatkP: document.getElementById('fdc-enemy-global-matk-p'),
      enemyGlobalPdefP: document.getElementById('fdc-enemy-global-pdef-p'),
      enemyGlobalMdefP: document.getElementById('fdc-enemy-global-mdef-p'),
      enemyGlobalCritP: document.getElementById('fdc-enemy-global-crit-p'),
      enemyGlobalCritDmgP: document.getElementById('fdc-enemy-global-crit-dmg-p'),
      enemyGlobalCritResP: document.getElementById('fdc-enemy-global-crit-res-p'),
      enemyGlobalCritDmgResP: document.getElementById('fdc-enemy-global-crit-dmg-res-p'),

      enemyGlobalAdditiveHp: document.getElementById('fdc-enemy-global-additive-hp'),
      enemyGlobalAdditivePatk: document.getElementById('fdc-enemy-global-additive-patk'),
      enemyGlobalAdditiveMatk: document.getElementById('fdc-enemy-global-additive-matk'),
      enemyGlobalAdditivePdef: document.getElementById('fdc-enemy-global-additive-pdef'),
      enemyGlobalAdditiveMdef: document.getElementById('fdc-enemy-global-additive-mdef'),
      enemyGlobalAdditiveCrit: document.getElementById('fdc-enemy-global-additive-crit'),
      enemyGlobalAdditiveCritDmg: document.getElementById('fdc-enemy-global-additive-crit-dmg'),
      enemyGlobalAdditiveCritRes: document.getElementById('fdc-enemy-global-additive-crit-res'),
      enemyGlobalAdditiveCritDmgRes: document.getElementById('fdc-enemy-global-additive-crit-dmg-res'),
      enemyDefP: document.getElementById('fdc-enemy-def-p'),
      enemyTakenDmgP: document.getElementById('fdc-enemy-taken-dmg-p'),
      enemyCritResP: document.getElementById('fdc-enemy-crit-res-p'),
      enemyCritDmgResP: document.getElementById('fdc-enemy-crit-dmg-res-p'),
      enemyAtkP: document.getElementById('fdc-enemy-atk-p'),
      enemyCritP: document.getElementById('fdc-enemy-crit-p'),
      enemyCritDmgP: document.getElementById('fdc-enemy-crit-dmg-p'),
      enemyType: document.getElementById('fdc-enemy-type'),
      enemySpecial: document.getElementById('fdc-enemy-special'),
      enemyOther: document.getElementById('fdc-enemy-other'),
      enemyAddP: document.getElementById('fdc-enemy-add-p'),
      enemyPoisonStack: document.getElementById('fdc-enemy-poison-stack'),
      enemyNoise: document.getElementById('fdc-enemy-noise'),
      enemyAngerStack: document.getElementById('fdc-enemy-anger-stack'),
      enemyWeaknessP: document.getElementById('fdc-enemy-weakness-p'),
      enemyStatusTakenDamageWeakness: document.getElementById('fdc-enemy-status-taken-damage-weakness'),
      enemyCritRateP: document.getElementById('fdc-enemy-crit-rate-p'),
      enemyCritDmgAddP: document.getElementById('fdc-enemy-crit-dmg-add-p'),
      enemyAttackerDmgDownP: document.getElementById('fdc-enemy-attacker-dmg-down-p'),
      enemyDefDownP: document.getElementById('fdc-enemy-def-down-p'),
      enemyCritResDownP: document.getElementById('fdc-enemy-crit-res-down-p'),
      enemyCritDmgResDownP: document.getElementById('fdc-enemy-crit-dmg-res-down-p')
    },
    result: {
      bar: document.querySelector('.fdc-result-bar'),
      normal: document.getElementById('fdc-result-normal'),
      crit: document.getElementById('fdc-result-crit'),
      expected: document.getElementById('fdc-result-expected'),
      critRate: document.getElementById('fdc-result-crit-rate'),
      metricCard: document.getElementById('fdc-result-metric-card'),
      metricLabel: document.getElementById('fdc-result-metric-label'),
      metricToggle: document.getElementById('fdc-result-metric-toggle'),
      hpRates: {
        normal: document.getElementById('fdc-result-normal-hp'),
        expected: document.getElementById('fdc-result-expected-hp'),
        crit: document.getElementById('fdc-result-crit-hp')
      },
      detailToggle: document.getElementById('fdc-result-detail-toggle'),
      detailPanel: document.getElementById('fdc-result-detail-panel'),
      detailNote: document.getElementById('fdc-result-detail-note'),
      detailTabs: document.getElementById('fdc-result-detail-tabs'),
      detailTabButtons: Array.from(document.querySelectorAll('[data-fdc-result-detail-tab]')),
      detailGrid: document.getElementById('fdc-result-detail-grid')
    }
  };

  const view = {
    targetId: '',
    damageType: 'auto',
    enemyDamageType: 'auto',
    gradeOverride: 'saved',
    statMode: 'current',
    resultMetric: 'critRate',
    resultDetailTab: 'calculation',
    perspective: 'self',
    mobileVisibleSide: 'self',
    enemyPersonality: '',
    enemySourceMode: 'preset',
    pvpAffinityEnabled: false,
    pvpRank: 3001,
    enemyApostleId: '',
    enemyPresetKey: '',
    enemySelectedSkillCategory: '',
    enemyStatDirty: false,
    enemyGlobalPercentDirty: false,
    enemyGlobalPercentEnabled: true,
    enemyGlobalAdditiveEnabled: true,
    enemyBoardPresetSelections: { 1: [], 2: [], 3: [] },
    enemyIndividualOverrides: {},
    enemyIndividualSectionOpen: { skills: true, equipment: false, artifacts: false, spells: false },
    enemyRankPreset: 'current',
    enemyResearchPreset: { level: 0, progress: 0, dirty: false },
    formationPresetId: '',
    enemyPhaseIndex: 0,
    enemySkillIndex: -1,
    pickerMode: 'formation',
    pickerSearch: '',
    pickerSort: 'name',
    pickerFilters: {
      personality: '',
      position: '',
      role: ''
    },
    statDirty: false,
    selectedSkillCategory: '',
    selectedSkillOptionKey: '',
    skillLevelOverrides: {},
    selfSkillEffectEnabled: {},
    conditionalEffectEnabled: {},
    conditionalEffectStackCounts: {},
    tempMembers: {},
    tempSpells: null,
    pendingTempMemberId: '',
    spellDetailsOpen: false,
    tempArtifacts: {
      formation: {},
      target: {}
    },
    tempCardStates: {},
    artifactPicker: null,
    effectSources: {
      synergy: true,
      artifact: true,
      spell: true,
      globalStats: true
    },
    resultDisplays: {
      hp: true
    },
    damageSaveAction: '',
    loadedDamageSaveId: '',
    comparisonSource: 'current',
    comparisonScopes: {
      characterState: true,
      formationState: false,
      cardState: false
    },
    referenceState: null,
    referenceOptions: { cards: false, global: false, apostles: false }
  };
  const ENEMY_GLOBAL_PERCENT_CONFIG = [
    { inputKey: 'enemyGlobalHpP', additiveInputKey: 'enemyGlobalAdditiveHp', statKey: 'hp', memberKey: 'hp', aliases: ['hp', 'HP'] },
    { inputKey: 'enemyGlobalPatkP', additiveInputKey: 'enemyGlobalAdditivePatk', statKey: 'patk', memberKey: 'physicalAtk', aliases: ['physicalAtk', 'patk', '物理攻撃', '物理攻撃力'] },
    { inputKey: 'enemyGlobalMatkP', additiveInputKey: 'enemyGlobalAdditiveMatk', statKey: 'matk', memberKey: 'magicAtk', aliases: ['magicAtk', 'matk', '魔法攻撃', '魔法攻撃力'] },
    { inputKey: 'enemyGlobalPdefP', additiveInputKey: 'enemyGlobalAdditivePdef', statKey: 'pdef', memberKey: 'physicalDef', aliases: ['physicalDef', 'pdef', '物理防御', '物理防御力'] },
    { inputKey: 'enemyGlobalMdefP', additiveInputKey: 'enemyGlobalAdditiveMdef', statKey: 'mdef', memberKey: 'magicDef', aliases: ['magicDef', 'mdef', '魔法防御', '魔法防御力'] },
    { inputKey: 'enemyGlobalCritP', additiveInputKey: 'enemyGlobalAdditiveCrit', statKey: 'crit', memberKey: 'crit', aliases: ['crit', '会心'] },
    { inputKey: 'enemyGlobalCritDmgP', additiveInputKey: 'enemyGlobalAdditiveCritDmg', statKey: 'critDmg', memberKey: 'critDmg', aliases: ['critDmg', '会心DMG', '会心ダメージ'] },
    { inputKey: 'enemyGlobalCritResP', additiveInputKey: 'enemyGlobalAdditiveCritRes', statKey: 'critRes', memberKey: 'critRes', aliases: ['critRes', '会心抵抗'] },
    { inputKey: 'enemyGlobalCritDmgResP', additiveInputKey: 'enemyGlobalAdditiveCritDmgRes', statKey: 'critDmgRes', memberKey: 'critDmgRes', aliases: ['critDmgRes', '会心DMG抵抗'] }
  ];
  const ENEMY_EQUIPMENT_GROUPS = [
    { key: 'HP', label: 'HP' },
    { key: '物理攻撃', label: '物攻' },
    { key: '魔法攻撃', label: '魔攻' },
    { key: '物理防御', label: '物防' },
    { key: '魔法防御', label: '魔防' },
    { key: '会心/会心DMG', label: '会心系' },
    { key: '会心抵抗/会心DMG抵抗', label: '会心抵抗系' }
  ];
  const ENEMY_BOARD_PRESET_GROUPS = [
    { key: 'hp', label: 'HP', statKeys: ['hp'] },
    { key: 'attack', label: '攻撃', statKeys: ['patk', 'matk'] },
    { key: 'defense', label: '防御', statKeys: ['pdef', 'mdef'] },
    { key: 'crit', label: '会心系', statKeys: ['crit', 'critDmg'] },
    { key: 'critRes', label: '会心抵抗系', statKeys: ['critRes', 'critDmgRes'] }
  ];
  restoreCalcSettings();

  initTheme();
  setupCollapsibleStatCategories();
  bindEvents();
  setupResultBarOffsetSync();
  populateEnemyPresets();
  populateEnemyApostles();
  renderDamageSaveActionPanel();
  applyEnemyPreset();
  render();

  function setupResultBarOffsetSync() {
    if (!el.result.bar) return;
    const sync = () => {
      const height = Math.ceil(el.result.bar.getBoundingClientRect().height || 0);
      document.documentElement.style.setProperty('--fdc-result-bar-height', `${height}px`);
    };
    sync();
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(sync);
      observer.observe(el.result.bar);
    } else {
      window.addEventListener('resize', sync, { passive: true });
    }
  }

  function bindEvents() {
    window.addEventListener('trickcal:comparison-session-ui', () => syncPinnedComparisonUi(buildContext()));
    window.addEventListener('storage', event => {
      if (event.key === THEME_KEY && ['light', 'dark'].includes(event.newValue)) {
        setTheme(event.newValue, false);
        return;
      }
      if (event.key !== STAT_STORAGE_KEY) return;
      view.enemyStatDirty = false;
      view.enemyGlobalPercentDirty = false;
      view.enemyResearchPreset.dirty = false;
      view.enemyIndividualOverrides = {};
      const hadSkillOverrides = Object.keys(view.skillLevelOverrides || {}).length > 0;
      syncFdcSkillLevelOverridesFromManager();
      if (!hadSkillOverrides) render();
    });
    el.reload?.addEventListener('click', () => {
      view.statDirty = false;
      view.enemyStatDirty = false;
      view.enemyGlobalPercentDirty = false;
      view.enemyResearchPreset.dirty = false;
      view.enemyIndividualOverrides = {};
      render();
    });
    el.themeToggle?.addEventListener('click', toggleTheme);
    el.saveMenu?.addEventListener('toggle', () => {
      view.damageSaveAction = '';
      renderDamageSaveActionPanel();
      if (el.saveMenu.open) {
        closeApplyFloatPanel();
        closeCompareFloatPanel();
      }
    });
    el.saveActionButtons.forEach(button => button.addEventListener('click', () => {
      const action = button.dataset.fdcSaveAction || '';
      view.damageSaveAction = view.damageSaveAction === action ? '' : action;
      renderDamageSaveActionPanel();
    }));
    el.result.detailToggle?.addEventListener('click', () => {
      const open = el.result.detailPanel?.hidden !== false;
      setResultDetailOpen(open);
      const context = buildContext();
      renderResultDetail(context, calculateDamage(context));
    });
    el.result.detailTabButtons.forEach(button => button.addEventListener('click', () => {
      const tab = button.dataset.fdcResultDetailTab;
      if (tab !== 'calculation' && tab !== 'comparison') return;
      view.resultDetailTab = tab;
      const context = buildContext();
      renderResultDetail(context, calculateDamage(context));
    }));
    el.result.metricToggle?.addEventListener('click', event => {
      event.stopPropagation();
      const metrics = ['critRate', 'critDmg', 'defRate'];
      const index = metrics.indexOf(view.resultMetric);
      view.resultMetric = metrics[(index + 1) % metrics.length];
      saveCalcSettings();
      renderResult(buildContext());
    });
    el.cardCost?.addEventListener('click', () => toggleCardCostPanel());
    el.applyFloatToggle?.addEventListener('click', () => toggleApplyFloatPanel());
    el.compareFloatToggle?.addEventListener('click', () => toggleCompareFloatPanel());
    el.compareSource?.addEventListener('change', () => {
      view.comparisonSource = el.compareSource.value || 'current';
      syncComparisonScopeControls();
    });
    el.compareScopeInputs.forEach(input => input.addEventListener('change', () => {
      view.comparisonScopes[input.dataset.fdcCompareScope] = !!input.checked;
    }));
    el.pinnedCompareSave?.addEventListener('click', savePinnedComparisonBaseline);
    el.pinnedCompareClear?.addEventListener('click', clearPinnedComparisonBaseline);
    el.applyFloatInputs.forEach(input => {
      input.addEventListener('change', () => {
        view.effectSources[input.dataset.fdcApplySource] = !!input.checked;
        saveCalcSettings();
        syncApplyFloatUi();
        render();
      });
    });
    el.categorySourceInputs.forEach(input => {
      input.addEventListener('change', () => {
        view.effectSources[input.dataset.fdcCategorySource] = !!input.checked;
        saveCalcSettings();
        syncApplyFloatUi();
        render();
      });
    });
    el.resultDisplayInputs.forEach(input => {
      input.addEventListener('change', () => {
        view.resultDisplays[input.dataset.fdcResultDisplay] = !!input.checked;
        saveCalcSettings();
        syncApplyFloatUi();
        renderResult(buildContext());
      });
    });
    el.applyFloatBulk.forEach(button => {
      button.addEventListener('click', () => {
        const enabled = button.dataset.fdcApplyBulk === 'on';
        Object.keys(view.effectSources).forEach(key => { view.effectSources[key] = enabled; });
        saveCalcSettings();
        syncApplyFloatUi();
        render();
      });
    });
    document.addEventListener('click', event => {
      const toggle = event.target.closest('[data-fdc-category-toggle]');
      if (!toggle) return;
      const category = toggle.closest('.stat-category');
      if (!category) return;
      setStatCategoryCollapsed(category, !category.classList.contains('is-collapsed'));
    });
    document.addEventListener('click', event => {
      if (!el.cardCostController || el.cardCostController.contains(event.target)) return;
      closeCardCostPanel();
    });
    document.addEventListener('click', event => {
      if (!el.applyFloat || el.applyFloat.contains(event.target)) return;
      closeApplyFloatPanel();
      closeCompareFloatPanel();
    });
    document.addEventListener('click', event => {
      if (!el.saveMenu?.open || el.saveMenu.contains(event.target)) return;
      el.saveMenu.open = false;
    });
    document.addEventListener('click', event => {
      if (!el.skillPopover || el.skillPopover.hidden) return;
      if (el.skillPopover.contains(event.target) || event.target.closest('.fdc-skill-choice-info, #fdc-pvp-rank-info, [data-fdc-spell-details-toggle], [data-fdc-spell-edit-toggle]')) return;
      hideFdcSkillPopover();
    });
    document.addEventListener('click', event => {
      const resetCard = event.target.closest('[data-fdc-temp-card-reset]');
      if (resetCard) {
        event.preventDefault();
        event.stopImmediatePropagation();
        resetFdcTempCardState(resetCard.dataset.fdcTempCardReset || '');
        return;
      }
      const spellPopoverClose = event.target.closest('[data-fdc-spell-details-close], [data-fdc-spell-editor-close]');
      if (spellPopoverClose) {
        event.preventDefault();
        hideFdcSkillPopover();
        return;
      }
      const spellEditorReset = event.target.closest('[data-fdc-spell-editor-reset]');
      if (spellEditorReset) {
        event.preventDefault();
        resetFdcTempSpells();
        return;
      }
      const spellStepButton = event.target.closest('[data-fdc-spell-edit-step]');
      if (spellStepButton) {
        event.preventDefault();
        adjustFdcTempSpellCount(
          spellStepButton.dataset.fdcSpellId || '',
          Number(spellStepButton.dataset.fdcSpellEditStep) || 0,
          buildContext()
        );
        return;
      }
      const spellEditButton = event.target.closest('[data-fdc-spell-edit-toggle]');
      if (spellEditButton) {
        event.preventDefault();
        toggleFdcSpellEditorPopover(spellEditButton, buildContext());
        return;
      }
      const spellDetailsButton = event.target.closest('[data-fdc-spell-details-toggle]');
      if (spellDetailsButton) {
        event.preventDefault();
        toggleFdcSpellDetailsPopover(spellDetailsButton, buildContext());
        return;
      }
      const button = event.target.closest('[data-fdc-artifact-detail]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      showFdcArtifactPopover(button);
    });
    document.addEventListener('click', event => {
      const slot = event.target.closest('[data-fdc-temp-artifact-slot], [data-fdc-temp-artifact-row]');
      if (!slot) return;
      event.preventDefault();
      event.stopPropagation();
      openTempArtifactPickerFromElement(slot, buildContext());
    });
    document.addEventListener('click', event => {
      const picker = getTempArtifactPicker(false);
      if (!picker || picker.hidden) return;
      if (picker.contains(event.target) || event.target.closest('[data-fdc-temp-artifact-slot], [data-fdc-temp-artifact-row]')) return;
      closeTempArtifactPicker();
    });
    document.addEventListener('click', event => {
      if (!el.formationPicker || el.formationPicker.hidden) return;
      if (el.formationPicker.contains(event.target) || event.target.closest('#fdc-target-preview, #fdc-floating-target')) return;
      closeFormationPicker();
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (el.formationPicker && !el.formationPicker.hidden) closeFormationPicker();
    });
    document.addEventListener('change', event => {
      const cardInput = event.target.closest('[data-fdc-temp-card-field]');
      if (cardInput) {
        updateFdcTempCardState(
          cardInput.dataset.fdcTempCardId || '',
          cardInput.dataset.fdcTempCardField || '',
          cardInput.value
        );
        return;
      }
      const stackInput = event.target.closest('[data-fdc-stack-count]');
      if (stackInput) {
        const key = stackInput.dataset.fdcStackCount || '';
        const max = Math.max(1, Number(stackInput.dataset.fdcStackMax) || 1);
        const value = Math.min(max, Math.max(1, Math.floor(Number(stackInput.value) || 1)));
        stackInput.value = String(value);
        if (key) view.conditionalEffectStackCounts[key] = value;
        saveCalcSettings();
        render();
        return;
      }
      const groupInput = event.target.closest('[data-fdc-condition-toggle-group]');
      if (groupInput) {
        decodeConditionToggleGroupKeys(groupInput.dataset.fdcConditionToggleGroup).forEach(key => {
          view.conditionalEffectEnabled[key] = !!groupInput.checked;
        });
        saveCalcSettings();
        render();
        return;
      }
      const input = event.target.closest('[data-fdc-condition-toggle]');
      if (!input) return;
      view.conditionalEffectEnabled[input.dataset.fdcConditionToggle] = !!input.checked;
      saveCalcSettings();
      render();
    });
    el.perspectiveToggle?.addEventListener('click', () => {
      view.perspective = view.perspective === 'self' ? 'enemy' : 'self';
      saveCalcSettings();
      render();
    });
    el.mobileSideButtons.forEach(button => button.addEventListener('click', () => {
      view.mobileVisibleSide = button.dataset.fdcMobileSide === 'enemy' ? 'enemy' : 'self';
      saveCalcSettings();
      syncMobileSideUi();
    }));
    el.targetPreview?.addEventListener('click', () => toggleFormationPicker());
    el.floatingTarget?.addEventListener('click', () => toggleFormationPicker(true));
    el.formationPicker?.addEventListener('click', event => event.stopPropagation());
    window.addEventListener('scroll', updateFloatingTargetVisibility, { passive: true });
    window.addEventListener('resize', updateFloatingTargetVisibility, { passive: true });
    el.formationPreset?.addEventListener('change', () => {
      view.formationPresetId = el.formationPreset.value || '';
      view.tempMembers = {};
      view.tempArtifacts = { formation: {}, target: {} };
      view.tempSpells = null;
      view.pendingTempMemberId = '';
      const state = loadStatState();
      const formation = normalizeFormation(getSelectedFormationSource(state).formation);
      view.targetId = getFirstFormationApostleId(formation) || view.targetId;
      syncSelectedApostleToStatManager(view.targetId);
      saveCalcSettings();
      render();
    });
    el.enemySourceMode?.addEventListener('change', () => {
      view.enemySourceMode = el.enemySourceMode.value === 'apostle' ? 'apostle' : 'preset';
      view.enemyStatDirty = false;
      view.enemyGlobalPercentDirty = false;
      view.enemyResearchPreset.dirty = false;
      view.enemySkillIndex = -1;
      view.enemySelectedSkillCategory = '';
      if (el.inputs.enemySkill) el.inputs.enemySkill.value = '100';
      if (view.enemySourceMode === 'apostle' && el.inputs.enemySpecial) el.inputs.enemySpecial.value = '100';
      if (view.enemySourceMode === 'apostle' && !view.enemyApostleId) {
        view.enemyApostleId = el.enemyApostle?.value || '';
      }
      applyEnemyPreset();
      saveCalcSettings();
      render();
    });
    el.pvpAffinityEnabled?.addEventListener('change', () => {
      view.pvpAffinityEnabled = !!el.pvpAffinityEnabled.checked;
      saveCalcSettings();
      render();
    });
    el.pvpRankInput?.addEventListener('input', () => {
      if (el.pvpRankInput.value === '') return;
      setPvpRank(el.pvpRankInput.value);
    });
    el.pvpRankInput?.addEventListener('change', () => setPvpRank(el.pvpRankInput.value));
    el.pvpRankSlider?.addEventListener('input', () => setPvpRank(el.pvpRankSlider.value));
    el.pvpRankInfo?.addEventListener('click', event => {
      event.stopPropagation();
      showPvpRankInfoPopover();
    });
    el.enemyApostle?.addEventListener('change', () => {
      view.enemyApostleId = el.enemyApostle.value || '';
      view.enemyStatDirty = false;
      view.enemyGlobalPercentDirty = false;
      view.enemyResearchPreset.dirty = false;
      view.enemySkillIndex = -1;
      view.enemySelectedSkillCategory = '';
      if (el.inputs.enemySkill) el.inputs.enemySkill.value = '100';
      applyEnemyPreset();
      saveCalcSettings();
      render();
    });
    el.enemyIndividualSettings?.addEventListener('change', event => {
      const target = event.target;
      const context = buildContext();
      const settings = ensureEnemyIndividualOverride(context);
      if (!settings) return;
      const field = target.dataset.fdcEnemyIndividualField || '';
      const skill = target.dataset.fdcEnemySkillLevel || '';
      const equipmentEnabled = target.dataset.fdcEnemyEquipmentEnabled || '';
      const equipmentEnhance = target.dataset.fdcEnemyEquipmentEnhance || '';
      const artifactField = target.dataset.fdcEnemyArtifactField || '';
      const artifactSlot = target.dataset.fdcEnemyArtifactSlot;
      const spellField = target.dataset.fdcEnemySpellField || '';
      const spellId = target.dataset.fdcEnemySpellId || '';
      if (field === 'follow') settings.follow = !!target.checked;
      else if (field === 'asideRank') settings.asideRank = Math.max(0, Math.min(3, Number(target.value) || 0));
      else if (field) settings[field] = Number(target.value) || 1;
      else if (skill) settings.skillLevels[skill] = Number(target.value) || 1;
      else if (equipmentEnabled) {
        const item = settings.equipment[equipmentEnabled] || { enabled: false, enhance: 0 };
        settings.equipment[equipmentEnabled] = { ...item, enabled: !!target.checked };
      } else if (equipmentEnhance) {
        const item = settings.equipment[equipmentEnhance] || { enabled: false, enhance: 0 };
        settings.equipment[equipmentEnhance] = { ...item, enhance: Math.max(0, Math.min(5, Number(target.value) || 0)) };
      } else if (artifactField && artifactSlot !== undefined) {
        const index = Math.max(0, Math.min(2, Number(artifactSlot) || 0));
        const item = settings.artifactSettings?.[index] || { star: 1, solder: 0 };
        if (artifactField === 'star') {
          item.star = Math.max(1, Math.min(5, Number(target.value) || 1));
          if (item.star < 5) item.solder = 0;
        } else if (artifactField === 'solder') {
          item.solder = Math.max(0, Math.min(2, Number(target.value) || 0));
        }
        settings.artifactSettings[index] = item;
      } else if (target.matches('[data-fdc-enemy-spell-add]')) {
        const id = String(target.value || '');
        if (!id) return;
        settings.spellIds.push(id);
        target.value = '';
      } else if (spellField && spellId) {
        const item = settings.spellSettings?.[spellId] || { star: 1, solder: 0 };
        if (spellField === 'count') {
          const count = Math.max(0, Math.min(99, Number(target.value) || 0));
          settings.spellIds = settings.spellIds.filter(id => id !== spellId);
          settings.spellIds.push(...Array.from({ length: count }, () => spellId));
        } else if (spellField === 'star') {
          item.star = Math.max(1, Math.min(5, Number(target.value) || 1));
          if (item.star < 5) item.solder = 0;
          settings.spellSettings[spellId] = item;
        } else if (spellField === 'solder') {
          item.solder = Math.max(0, Math.min(2, Number(target.value) || 0));
          settings.spellSettings[spellId] = item;
        }
      } else return;
      view.enemyIndividualOverrides[view.enemyApostleId] = normalizeEnemyIndividualSettings(settings, context);
      view.enemyStatDirty = false;
      view.enemyGlobalPercentDirty = false;
      saveCalcSettings();
      render();
    });
    el.enemyIndividualSettings?.addEventListener('click', event => {
      const followToggle = event.target.closest('[data-fdc-enemy-follow-toggle]');
      if (followToggle) {
        const context = buildContext();
        const settings = ensureEnemyIndividualOverride(context);
        if (!settings) return;
        settings.follow = !settings.follow;
        view.enemyIndividualOverrides[view.enemyApostleId] = normalizeEnemyIndividualSettings(settings, context);
        view.enemyStatDirty = false;
        view.enemyGlobalPercentDirty = false;
        saveCalcSettings();
        render();
        return;
      }
      const removeSpell = event.target.closest('[data-fdc-enemy-spell-remove]')?.dataset?.fdcEnemySpellRemove || '';
      if (removeSpell) {
        const context = buildContext();
        const settings = ensureEnemyIndividualOverride(context);
        if (!settings) return;
        settings.spellIds = settings.spellIds.filter(id => id !== removeSpell);
        delete settings.spellSettings[removeSpell];
        view.enemyIndividualOverrides[view.enemyApostleId] = normalizeEnemyIndividualSettings(settings, context);
        saveCalcSettings();
        render();
        return;
      }
      const action = event.target.closest('[data-fdc-enemy-individual-action]')?.dataset?.fdcEnemyIndividualAction || '';
      if (!action) return;
      const context = buildContext();
      if (action === 'reset') {
        delete view.enemyIndividualOverrides[view.enemyApostleId];
      } else {
        const settings = ensureEnemyIndividualOverride(context);
        const equipmentRow = getEnemyEquipmentRow(view.enemyApostleId);
        if (!settings) return;
        const visibleKeys = ENEMY_EQUIPMENT_GROUPS
          .filter(group => Number(equipmentRow?.[`Equip_Rank${settings.rank}_${group.key}`]) > 0)
          .map(group => group.key);
        if (action === 'equipment-on' || action === 'equipment-off') {
          visibleKeys.forEach(key => {
            const item = settings.equipment[key] || { enabled: false, enhance: 0 };
            settings.equipment[key] = { ...item, enabled: action === 'equipment-on' };
          });
        } else if (action === 'equipment-enhance') {
          const enhance = Math.max(0, Math.min(5, Number(el.enemyIndividualSettings.querySelector('[data-fdc-enemy-equipment-bulk-enhance]')?.value) || 0));
          visibleKeys.forEach(key => {
            const item = settings.equipment[key] || { enabled: false, enhance: 0 };
            settings.equipment[key] = { ...item, enhance };
          });
        }
        view.enemyIndividualOverrides[view.enemyApostleId] = normalizeEnemyIndividualSettings(settings, context);
      }
      view.enemyStatDirty = false;
      view.enemyGlobalPercentDirty = false;
      saveCalcSettings();
      render();
    });
    el.enemyBoardPreset?.addEventListener('click', event => {
      const choice = event.target.closest('[data-fdc-board-preset-layer][data-fdc-board-preset-group]');
      if (choice) {
        const layer = String(Math.max(1, Math.min(3, Number(choice.dataset.fdcBoardPresetLayer) || 1)));
        const group = choice.dataset.fdcBoardPresetGroup || '';
        const selected = new Set(view.enemyBoardPresetSelections?.[layer] || []);
        if (selected.has(group)) selected.delete(group);
        else selected.add(group);
        view.enemyBoardPresetSelections[layer] = ENEMY_BOARD_PRESET_GROUPS.map(item => item.key).filter(key => selected.has(key));
        renderEnemyBoardPresetUi(buildContext());
        saveCalcSettings();
        return;
      }
      const action = event.target.closest('[data-fdc-board-preset-action]')?.dataset?.fdcBoardPresetAction;
      if (action === 'clear') {
        view.enemyBoardPresetSelections = { 1: [], 2: [], 3: [] };
        renderEnemyBoardPresetUi(buildContext());
        saveCalcSettings();
        return;
      }
      if (action === 'apply') {
        const context = buildContext();
        writeEnemyGlobalPercentInputs(calculateEnemyBoardPresetRates());
        view.enemyGlobalPercentDirty = true;
        view.enemyStatDirty = false;
        syncStatsFromEnemyApostle(context);
        saveCalcSettings();
        renderEnemyBoardPresetUi(context);
        renderResult(context);
      }
    });
    el.enemyRankPreset?.addEventListener('change', () => {
      view.enemyRankPreset = normalizeEnemyRankPreset(el.enemyRankPreset.value);
      renderEnemyBoardPresetUi(buildContext());
      saveCalcSettings();
    });
    [el.enemyResearchLevel, el.enemyResearchProgress].forEach(select => {
      select?.addEventListener('change', () => {
        view.enemyResearchPreset = {
          level: Math.max(0, Math.min(10, Number(el.enemyResearchLevel?.value) || 0)),
          progress: Math.max(0, Math.min(45, Number(el.enemyResearchProgress?.value) || 0)),
          dirty: true
        };
        renderEnemyBoardPresetUi(buildContext());
        saveCalcSettings();
      });
    });
    el.enemyAdditivePresetApply?.addEventListener('click', () => {
      const context = buildContext();
      writeEnemyCorrectionInputs('additiveInputKey', calculateEnemyGlobalAdditivePreset(context));
      view.enemyGlobalPercentDirty = true;
      view.enemyStatDirty = false;
      syncStatsFromEnemyApostle(context);
      saveCalcSettings();
      renderResult(context);
    });
    [
      [el.enemyGlobalPercentEnabled, 'enemyGlobalPercentEnabled'],
      [el.enemyGlobalAdditiveEnabled, 'enemyGlobalAdditiveEnabled']
    ].forEach(([input, viewKey]) => {
      input?.addEventListener('change', () => {
        view[viewKey] = !!input.checked;
        view.enemyGlobalPercentDirty = true;
        view.enemyStatDirty = false;
        const context = buildContext();
        syncStatsFromEnemyApostle(context);
        renderEnemyCorrectionEnabledUi();
        saveCalcSettings();
        renderResult(context);
      });
    });
    el.enemyPersonality?.addEventListener('change', () => {
      view.enemyPersonality = el.enemyPersonality.value || '';
      saveCalcSettings();
      render();
    });
    el.damageType?.addEventListener('change', () => {
      view.damageType = el.damageType.value || 'auto';
      view.statDirty = false;
      applyEnemyPreset();
      saveCalcSettings();
      render();
    });
    el.enemyDamageType?.addEventListener('change', () => {
      view.enemyDamageType = el.enemyDamageType.value || 'auto';
      view.enemyStatDirty = false;
      applyEnemyPreset();
      saveCalcSettings();
      render();
    });
    el.gradeOverride?.addEventListener('change', () => {
      view.gradeOverride = el.gradeOverride.value || 'saved';
      view.statDirty = false;
      view.enemyStatDirty = false;
      view.enemyGlobalPercentDirty = false;
      saveCalcSettings();
      render();
    });
    el.statMode?.addEventListener('change', () => {
      view.statMode = el.statMode.value === 'planned' ? 'planned' : 'current';
      view.statDirty = false;
      view.enemyStatDirty = false;
      view.enemyGlobalPercentDirty = false;
      saveCalcSettings();
      render();
    });
    el.statModeChoices.forEach(button => {
      button.addEventListener('click', () => {
        view.statMode = button.dataset.fdcStatModeChoice === 'planned' ? 'planned' : 'current';
        view.statDirty = false;
        view.enemyStatDirty = false;
        view.enemyGlobalPercentDirty = false;
        if (el.statMode) el.statMode.value = view.statMode;
        saveCalcSettings();
        syncApplyFloatUi();
        render();
      });
    });
    el.enemyStatusLink?.addEventListener('click', () => {
      const url = new URL('enemy-status.html', location.href);
      const key = view.enemyPresetKey || el.enemyPreset?.value || '';
      const isBuiltInPreset = typeof ENEMY_PRESETS !== 'undefined' && !!ENEMY_PRESETS[key];
      if (isBuiltInPreset) {
        url.searchParams.set('preset', key);
        if (view.enemyPhaseIndex > 0) url.searchParams.set('phase', String(view.enemyPhaseIndex));
      }
      el.enemyStatusLink.href = `${url.pathname.split('/').pop()}${url.search}`;
    });
    el.enemyPreset?.addEventListener('change', () => {
      view.enemyPresetKey = el.enemyPreset.value || '';
      view.enemyPersonality = normalizePersonalityName(getSelectedEnemyPreset()?.personality);
      syncEnemyPersonalityUi();
      view.enemyPhaseIndex = 0;
      view.enemySkillIndex = -1;
      syncEnemyPresetManagement();
      populateEnemyPhases();
      applyEnemyPreset();
      syncDamageTypeUi(buildContext());
      saveCalcSettings();
      render();
    });
    el.enemyPresetSave?.addEventListener('click', () => {
      saveCustomEnemyPreset();
      saveCalcSettings();
      render();
    });
    el.enemyPresetDelete?.addEventListener('click', () => {
      deleteCustomEnemyPreset();
      saveCalcSettings();
      render();
    });
    el.enemyPhase?.addEventListener('change', () => {
      view.enemyPhaseIndex = Number(el.enemyPhase.value) || 0;
      applyEnemyPreset();
      syncDamageTypeUi(buildContext());
      saveCalcSettings();
      renderResult(buildContext());
    });
    el.enemySkill?.addEventListener('change', () => {
      view.enemySkillIndex = Number(el.enemySkill.selectedOptions?.[0]?.dataset?.fdcEnemySkillIndex ?? -1);
      renderEnemySkillChoices();
      saveCalcSettings();
      renderResult(buildContext());
    });
    [el.inputs.selfHp, el.inputs.atk, el.inputs.selfDef, el.inputs.crit, el.inputs.critDmg, el.inputs.selfCritResBase, el.inputs.selfCritDmgResBase].forEach(input => {
      input?.addEventListener('input', () => {
        view.statDirty = true;
        renderResult(buildContext());
      });
    });
    [el.inputs.enemyHp, el.inputs.enemyAtk, el.inputs.enemyCrit, el.inputs.enemyCritDmg, el.inputs.def, el.inputs.critRes, el.inputs.critDmgRes].forEach(input => {
      input?.addEventListener('input', () => {
        if (view.enemySourceMode === 'apostle') view.enemyStatDirty = true;
        renderResult(buildContext());
      });
    });
    getEnemyCorrectionInputKeys().forEach(inputKey => {
      el.inputs[inputKey]?.addEventListener('input', () => {
        if (view.enemySourceMode !== 'apostle') return;
        const context = buildContext();
        view.enemyGlobalPercentDirty = true;
        view.enemyStatDirty = false;
        syncStatsFromEnemyApostle(context);
        saveCalcSettings();
        renderResult(context);
      });
    });
    Object.values(el.inputs).forEach(input => {
      if (!input || isEnemyCorrectionInput(input) || [el.inputs.selfHp, el.inputs.atk, el.inputs.selfDef, el.inputs.crit, el.inputs.critDmg, el.inputs.selfCritResBase, el.inputs.selfCritDmgResBase].includes(input)) return;
      input.addEventListener('input', () => {
        if (input === el.inputs.selfSkill) {
          view.selectedSkillCategory = '';
          view.selectedSkillOptionKey = '';
        }
        if (input === el.inputs.enemyStatusTakenDamageWeakness) {
          syncWeaknessFields(resolveSelfDamageType(buildContext().target));
        }
        if (input === el.inputs.selfBreakStack) {
          syncWeaknessFields(resolveSelfDamageType(buildContext().target));
        }
        if (input === el.inputs.enemySkill) {
          view.enemySkillIndex = -2;
          view.enemySelectedSkillCategory = '';
          if (el.enemySkill) el.enemySkill.value = input.value || '';
          renderEnemySkillChoices();
        }
        if (isExtraCrayonInput(input) && !view.statDirty) {
          syncStatsFromTarget(buildContext());
        }
        saveCalcSettings();
        renderResult(buildContext());
      });
    });
  }

  function render(options = {}) {
    const context = buildContext();
    syncApplyFloatUi();
    renderBoardPlanBonus(context);
    syncPinnedComparisonUi(context);
    syncPerspectiveUi();
    syncMobileSideUi();
    syncEnemySourceUi(context);
    if (el.damageType) el.damageType.value = view.damageType;
    if (el.enemyDamageType) el.enemyDamageType.value = view.enemyDamageType;
    syncDamageTypeUi(context);
    syncWeaknessFields(context.damageType);
    if (el.gradeOverride) {
      const fixedGrade = Number(getActiveEnemyContentRules().fixedGrade) || 0;
      el.gradeOverride.value = getEffectiveGradeOverride();
      el.gradeOverride.disabled = fixedGrade > 0;
      el.gradeOverride.title = fixedGrade ? `敵コンテンツにより${fixedGrade}年生固定` : '';
    }
    if (el.statMode) el.statMode.value = view.statMode;
    populateEnemyPhases();
    syncEnemyGlobalPercentInputs(context);
    syncStatsFromTarget(context);
    syncStatsFromEnemyApostle(context);
    syncEnemyPersonalityUi();
    syncPersonalityTypeAffinity(context);
    renderEnemySkillChoices(undefined, context);
    renderFormationPresetLoader(context);
    renderTarget(context);
    renderSelfSkillChoices(context);
    renderSelfSkillEffects(context);
    renderSynergyCategory(context);
    renderFormationPicker(context);
    renderArtifactCategory(context);
    renderSpellCategory(context, { keepPopover: !!options.keepSpellPopover });
    syncCardCostUi(context);
    renderResult(context);
  }

  function getEnemyIndividualBaseState(context, id = view.enemyApostleId) {
    const apostleState = context?.state?.apostles?.[id] || {};
    const basic = getApostle(id) || {};
    return {
      level: Number(apostleState.level) || 1,
      star: Number(apostleState.star) || Number(basic.レア度) || 1,
      grade: Number(apostleState.grade) || 1,
      rank: Number(apostleState.rank) || 1,
      bond: Number(basic.レア度) === 1 ? 1 : Number(apostleState.bond) || 1,
      asideRank: Math.max(0, Math.min(3, Number(apostleState.asideRank) || 0)),
      asideLevel: Number(apostleState.asideLevel) || 0,
      follow: basic.エルダイン ? false : !!apostleState.follow,
      skillLevels: clonePlain(apostleState.skillLevels || apostleState.skills || { low: 1, high: 1, passive: 1 }),
      equipment: clonePlain(apostleState.equipment || {}),
      artifactIds: ['', '', ''],
      artifactSettings: [{}, {}, {}],
      spellIds: [],
      spellSettings: {}
    };
  }

  function normalizeEnemyIndividualSettings(settings = {}, context = buildContext(), id = view.enemyApostleId) {
    const base = getEnemyIndividualBaseState(context, id);
    const basic = getApostle(id) || {};
    const star = Math.max(1, Math.min(5, Number(settings.star ?? base.star) || 1));
    const levelCap = ({ 1: 120, 2: 120, 3: 125, 4: 135, 5: 145 })[star] || 120;
    const asideRank = Math.max(0, Math.min(3, Number(settings.asideRank ?? base.asideRank) || 0));
    const asideLevelCap = [0, 30, 40, 50][asideRank] || 0;
    const asideLevel = asideLevelCap
      ? Math.max(1, Math.min(asideLevelCap, Number(settings.asideLevel ?? base.asideLevel) || 1))
      : 0;
    const skillCap = 12 + Math.max(0, Math.min(3, asideRank));
    const skillSource = { ...base.skillLevels, ...(settings.skillLevels || {}) };
    const equipment = clonePlain(base.equipment);
    Object.entries(settings.equipment || {}).forEach(([key, value]) => {
      equipment[key] = {
        enabled: !!value?.enabled,
        enhance: Math.max(0, Math.min(5, Number(value?.enhance) || 0))
      };
    });
    const artifactIds = Array.from(
      { length: 3 },
      (_, index) => resolveCardIdAlias(String(settings.artifactIds?.[index] ?? base.artifactIds?.[index] ?? ''))
    );
    const cards = context?.state?.cards || {};
    const artifactSettings = artifactIds.map((artifactId, index) => {
      const manager = cards[artifactId] || {};
      const saved = settings.artifactSettings?.[index] || {};
      const artifactStar = Math.max(1, Math.min(5, Number(saved.star ?? manager.star) || 1));
      return {
        star: artifactStar,
        solder: artifactStar >= 5 ? Math.max(0, Math.min(2, Number(saved.solder ?? manager.solder) || 0)) : 0
      };
    });
    const spellIds = Array.isArray(settings.spellIds)
      ? settings.spellIds.map(id => resolveCardIdAlias(String(id))).filter(spellId => getCard(spellId)?.kind === 'spell')
      : [];
    const savedSpellSettings = migrateCardStateMap(settings.spellSettings);
    const spellSettings = {};
    new Set(spellIds).forEach(spellId => {
      const manager = cards[spellId] || {};
      const saved = savedSpellSettings[spellId] || {};
      const spellStar = Math.max(1, Math.min(5, Number(saved.star ?? manager.star) || 1));
      spellSettings[spellId] = {
        star: spellStar,
        solder: spellStar >= 5 ? Math.max(0, Math.min(2, Number(saved.solder ?? manager.solder) || 0)) : 0
      };
    });
    return {
      level: Math.max(1, Math.min(levelCap, Number(settings.level ?? base.level) || 1)),
      star,
      grade: Math.max(1, Math.min(6, Number(settings.grade ?? base.grade) || 1)),
      rank: Math.max(1, Math.min(10, Number(settings.rank ?? base.rank) || 1)),
      bond: Number(basic.レア度) === 1 ? 1 : Math.max(1, Math.min(30, Number(settings.bond ?? base.bond) || 1)),
      asideRank,
      asideLevel,
      follow: basic.エルダイン ? false : !!(settings.follow ?? base.follow),
      skillLevels: {
        low: Math.max(1, Math.min(skillCap, Number(skillSource.low) || 1)),
        high: Math.max(1, Math.min(skillCap, Number(skillSource.high) || 1)),
        passive: Math.max(1, Math.min(skillCap, Number(skillSource.passive) || 1))
      },
      equipment,
      artifactIds,
      artifactSettings,
      spellIds,
      spellSettings
    };
  }

  function getEnemyIndividualOverride(context = buildContext(), id = view.enemyApostleId) {
    const saved = view.enemyIndividualOverrides?.[id];
    return saved && typeof saved === 'object' ? normalizeEnemyIndividualSettings(saved, context, id) : null;
  }

  function ensureEnemyIndividualOverride(context = buildContext(), id = view.enemyApostleId) {
    if (!id) return null;
    const current = getEnemyIndividualOverride(context, id) || normalizeEnemyIndividualSettings({}, context, id);
    view.enemyIndividualOverrides[id] = current;
    return current;
  }

  function getEnemyEquipmentRow(id) {
    const data = typeof TRICKCAL_STAT_DATA === 'undefined' ? null : TRICKCAL_STAT_DATA;
    return data?.getById?.('equipment', id)
      || (data?.sheets?.equipment || []).find(row => row.id === id)
      || null;
  }

  function renderEnemyIndividualOptions(max, selected, label) {
    return Array.from({ length: max }, (_, index) => index + 1)
      .map(value => `<option value="${value}" ${value === Number(selected) ? 'selected' : ''}>${escapeHtml(label(value))}</option>`)
      .join('');
  }

  function renderEnemyIndividualSettings(context = buildContext()) {
    if (!el.enemyIndividualSettings) return;
    el.enemyIndividualSettings.querySelectorAll('[data-fdc-enemy-individual-section]').forEach(section => {
      const key = section.dataset.fdcEnemyIndividualSection;
      if (key) view.enemyIndividualSectionOpen[key] = section.open;
    });
    const id = view.enemyApostleId;
    if (!id || view.enemySourceMode !== 'apostle') {
      el.enemyIndividualSettings.innerHTML = '<p class="fdc-category-note">敵使徒を選択してください。</p>';
      return;
    }
    const basic = getApostle(id) || {};
    const settings = getEnemyIndividualOverride(context, id) || normalizeEnemyIndividualSettings({}, context, id);
    const levelCap = ({ 1: 120, 2: 120, 3: 125, 4: 135, 5: 145 })[settings.star] || 120;
    const asideRank = settings.asideRank;
    const asideLevelCap = [0, 30, 40, 50][asideRank] || 0;
    const skillCap = 12 + asideRank;
    const equipmentRow = getEnemyEquipmentRow(id);
    const cards = context?.state?.cards || {};
    const artifactRows = Array.from({ length: 3 }, (_, index) => {
      const artifactId = settings.artifactIds?.[index] || '';
      return createArtifactDisplayRow(artifactId, 1, { ...(cards[artifactId] || {}), ...(settings.artifactSettings?.[index] || {}) }, {
        owner: basic.使徒名 || id,
        scope: 'enemy',
        slot: index + 1
      });
    });
    const enemyArtifactEffects = [
      ...(context?.enemyEffects?.applied || []),
      ...(context?.enemyEffects?.conditional || [])
    ].filter(item => hasAnySourceTag(item, ['遺物', '愛用遺物']));
    const enemySpellEffects = [
      ...(context?.enemyEffects?.applied || []),
      ...(context?.enemyEffects?.conditional || [])
    ].filter(item => hasAnySourceTag(item, ['スペル', '愛用スペル']));
    const spellRows = countIds(settings.spellIds)
      .map(({ id: spellId, qty }) => {
        const card = getCard(spellId);
        const row = createCardRow(spellId, qty, { ...(cards[spellId] || {}), ...(settings.spellSettings?.[spellId] || {}) });
        return { ...row, card, image: getCardImagePath(card), rarity: card?.rarity || '', signature: !!card?.signature };
      })
      .sort(compareArtifactOption);
    const spellOptions = (typeof CARD_LIBRARY === 'undefined' ? [] : CARD_LIBRARY.spells || [])
      .slice()
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'ja'));
    const equipmentItems = ENEMY_EQUIPMENT_GROUPS.map(group => {
      const tier = Number(equipmentRow?.[`Equip_Rank${settings.rank}_${group.key}`]) || 0;
      if (!tier) return '';
      const item = settings.equipment[group.key] || { enabled: false, enhance: 0 };
      return `
        <div class="fdc-enemy-equipment-item">
          <label><input type="checkbox" data-fdc-enemy-equipment-enabled="${escapeAttr(group.key)}" ${item.enabled ? 'checked' : ''}><span>${escapeHtml(group.label)} <small>T${tier}</small></span></label>
          <select data-fdc-enemy-equipment-enhance="${escapeAttr(group.key)}" aria-label="${escapeAttr(group.label)} 強化値">
            ${Array.from({ length: 6 }, (_, enhance) => `<option value="${enhance}" ${enhance === Number(item.enhance) ? 'selected' : ''}>+${enhance}</option>`).join('')}
          </select>
        </div>`;
    }).join('');
    el.enemyIndividualSettings.innerHTML = `
      <div class="fdc-enemy-individual-toolbar"><button type="button" data-fdc-enemy-individual-action="reset">管理側の設定に戻す</button></div>
      <div class="fdc-enemy-individual-grid">
        <label class="fdc-enemy-individual-control"><span>Rank</span><select data-fdc-enemy-individual-field="rank">${renderEnemyIndividualOptions(10, settings.rank, value => `Rank ${value}`)}</select></label>
        <label class="fdc-enemy-individual-control"><span>Lv</span><select data-fdc-enemy-individual-field="level">${renderEnemyIndividualOptions(levelCap, settings.level, value => `Lv ${value}`)}</select></label>
        <label class="fdc-enemy-individual-control"><span>★</span><select data-fdc-enemy-individual-field="star">${renderEnemyIndividualOptions(5, settings.star, value => `★${value}`)}</select></label>
        <label class="fdc-enemy-individual-control"><span>学年</span><select data-fdc-enemy-individual-field="grade">${renderEnemyIndividualOptions(6, settings.grade, value => `${value}年生`)}</select></label>
        <label class="fdc-enemy-individual-control"><span>好感度</span><select data-fdc-enemy-individual-field="bond" ${Number(basic.レア度) === 1 ? 'disabled' : ''}>${renderEnemyIndividualOptions(30, settings.bond, value => `Lv ${value}`)}</select></label>
        <div class="fdc-enemy-individual-control"><span>フォロー</span><button type="button" class="fdc-enemy-follow-control ${settings.follow ? 'is-on' : ''}" data-fdc-enemy-follow-toggle aria-pressed="${settings.follow ? 'true' : 'false'}" ${basic.エルダイン ? 'disabled' : ''}><span class="fdc-enemy-follow-indicator"></span><span>${settings.follow ? 'ON' : 'OFF'}</span></button></div>
        <label class="fdc-enemy-individual-control"><span>アサイド</span><select data-fdc-enemy-individual-field="asideRank">
          <option value="0" ${asideRank === 0 ? 'selected' : ''}>未発現</option>
          ${renderEnemyIndividualOptions(3, asideRank, value => `A${value}`)}
        </select></label>
        <label class="fdc-enemy-individual-control"><span>アサイドLv</span><select data-fdc-enemy-individual-field="asideLevel" ${asideRank ? '' : 'disabled'}>
          ${asideRank ? renderEnemyIndividualOptions(asideLevelCap, settings.asideLevel, value => `Lv ${value}`) : '<option value="0">-</option>'}
        </select></label>
      </div>
      <details class="fdc-enemy-individual-section" data-fdc-enemy-individual-section="skills" ${view.enemyIndividualSectionOpen.skills !== false ? 'open' : ''}>
        <summary>スキルレベル</summary>
        <div class="fdc-enemy-individual-grid">
          <label class="fdc-enemy-individual-control"><span>低学年</span><select data-fdc-enemy-skill-level="low">${renderEnemyIndividualOptions(skillCap, settings.skillLevels.low, String)}</select></label>
          <label class="fdc-enemy-individual-control"><span>高学年</span><select data-fdc-enemy-skill-level="high">${renderEnemyIndividualOptions(skillCap, settings.skillLevels.high, String)}</select></label>
          <label class="fdc-enemy-individual-control"><span>パッシブ</span><select data-fdc-enemy-skill-level="passive">${renderEnemyIndividualOptions(skillCap, settings.skillLevels.passive, String)}</select></label>
        </div>
      </details>
      <details class="fdc-enemy-individual-section" data-fdc-enemy-individual-section="equipment" ${view.enemyIndividualSectionOpen.equipment ? 'open' : ''}>
        <summary>装備</summary>
        <div class="fdc-enemy-equipment-body">
          <div class="fdc-enemy-equipment-actions">
            <button type="button" data-fdc-enemy-individual-action="equipment-on">全装備ON</button>
            <button type="button" data-fdc-enemy-individual-action="equipment-off">全装備OFF</button>
            <select data-fdc-enemy-equipment-bulk-enhance>${Array.from({ length: 6 }, (_, value) => `<option value="${value}">+${value}</option>`).join('')}</select>
            <button type="button" data-fdc-enemy-individual-action="equipment-enhance">強化値を一括適用</button>
          </div>
          <div class="fdc-enemy-equipment-grid">${equipmentItems || '<p class="fdc-category-note">このRankの装備情報はありません。</p>'}</div>
        </div>
      </details>
      <details class="fdc-enemy-individual-section" data-fdc-enemy-individual-section="artifacts" ${view.enemyIndividualSectionOpen.artifacts ? 'open' : ''}>
        <summary>遺物</summary>
        <div class="fdc-enemy-artifact-slots">
          ${artifactRows.map((row, index) => `
            <div class="fdc-enemy-artifact-item">
              <button type="button" class="fdc-artifact-slot ${row ? `is-filled ${getCardRarityClass(row)}` : 'is-empty'}"
                data-fdc-temp-artifact-row="enemy" data-fdc-temp-artifact-slot="${index}"
                title="${escapeAttr(row ? `${row.name}を入替` : '遺物を選択')}">
                ${renderArtifactIcon(row, index)}
              </button>
              <div class="fdc-enemy-artifact-controls">
                <select data-fdc-enemy-artifact-slot="${index}" data-fdc-enemy-artifact-field="star" aria-label="遺物${index + 1} ★" ${row ? '' : 'disabled'}>
                  ${renderEnemyIndividualOptions(5, row?.star || 1, value => `★${value}`)}
                </select>
                <select data-fdc-enemy-artifact-slot="${index}" data-fdc-enemy-artifact-field="solder" aria-label="遺物${index + 1} はんだ" ${row?.star >= 5 ? '' : 'disabled'}>
                  <option value="0" ${!row?.solder ? 'selected' : ''}>はんだなし</option>
                  <option value="1" ${row?.solder === 1 ? 'selected' : ''}>+1</option>
                  <option value="2" ${row?.solder === 2 ? 'selected' : ''}>+2</option>
                </select>
                ${row ? `<button type="button" class="fdc-enemy-artifact-info" data-fdc-artifact-detail="${escapeAttr(row.id)}" data-fdc-artifact-star="${row.star}" data-fdc-artifact-solder="${row.solder || 0}">効果</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="fdc-enemy-artifact-effects">
          ${enemyArtifactEffects.length
            ? renderGroupedArtifactEffectChips(enemyArtifactEffects, isEffectSourceActive('artifact'))
            : '<p class="fdc-empty">遺物効果なし</p>'}
        </div>
      </details>
      <details class="fdc-enemy-individual-section" data-fdc-enemy-individual-section="spells" ${view.enemyIndividualSectionOpen.spells ? 'open' : ''}>
        <summary>スペル</summary>
        <div class="fdc-enemy-spell-body">
          <label class="fdc-enemy-spell-add"><span>スペルを追加</span><select data-fdc-enemy-spell-add>
            <option value="">選択してください</option>
            ${spellOptions.map(card => `<option value="${escapeAttr(card.id)}">${escapeHtml(card.name)}</option>`).join('')}
          </select></label>
          <div class="fdc-enemy-spell-list">
            ${spellRows.length ? spellRows.map(row => `
              <div class="fdc-enemy-spell-item ${getCardRarityClass(row)}">
                <img src="${escapeAttr(row.image)}" alt="">
                <span class="fdc-enemy-spell-name"><strong>${escapeHtml(row.name)}</strong><small>${escapeHtml(row.rarity)}</small></span>
                <button type="button" data-fdc-enemy-spell-remove="${escapeAttr(row.id)}" aria-label="${escapeAttr(row.name)}を削除">${renderUiIcon('close')}</button>
                <div class="fdc-enemy-spell-controls">
                  <label><span>枚数</span><input type="number" min="1" max="99" value="${row.qty}" data-fdc-enemy-spell-id="${escapeAttr(row.id)}" data-fdc-enemy-spell-field="count"></label>
                  <label><span>★</span><select data-fdc-enemy-spell-id="${escapeAttr(row.id)}" data-fdc-enemy-spell-field="star">${renderEnemyIndividualOptions(5, row.star, value => `★${value}`)}</select></label>
                  <label><span>はんだ</span><select data-fdc-enemy-spell-id="${escapeAttr(row.id)}" data-fdc-enemy-spell-field="solder" ${row.star >= 5 ? '' : 'disabled'}>
                    <option value="0" ${!row.solder ? 'selected' : ''}>なし</option><option value="1" ${row.solder === 1 ? 'selected' : ''}>+1</option><option value="2" ${row.solder === 2 ? 'selected' : ''}>+2</option>
                  </select></label>
                </div>
              </div>`).join('') : '<p class="fdc-empty">スペルなし</p>'}
          </div>
          <div class="fdc-enemy-artifact-effects">
            ${enemySpellEffects.length ? renderGroupedArtifactEffectChips(enemySpellEffects, isEffectSourceActive('spell')) : '<p class="fdc-empty">スペル効果なし</p>'}
          </div>
        </div>
      </details>`;
  }

  function populateEnemyApostles() {
    if (!el.enemyApostle) return;
    const data = typeof TRICKCAL_STAT_DATA === 'undefined' ? null : TRICKCAL_STAT_DATA;
    const rows = (data?.sheets?.basicInfo || []).slice().sort((a, b) =>
      String(a.使徒名 || a.id || '').localeCompare(String(b.使徒名 || b.id || ''), 'ja')
    );
    el.enemyApostle.innerHTML = [
      '<option value="">使徒を選択</option>',
      ...rows.map(row => `<option value="${escapeAttr(row.id)}">${escapeHtml(row.使徒名 || row.id)}</option>`)
    ].join('');
    el.enemyApostle.value = rows.some(row => row.id === view.enemyApostleId) ? view.enemyApostleId : '';
    view.enemyApostleId = el.enemyApostle.value;
  }

  function syncEnemySourceUi(context = buildContext()) {
    const apostleMode = view.enemySourceMode === 'apostle';
    if (apostleMode) view.enemyStatDirty = false;
    if (el.enemySourceMode) el.enemySourceMode.value = apostleMode ? 'apostle' : 'preset';
    if (el.pvpAffinityEnabled) el.pvpAffinityEnabled.checked = !!view.pvpAffinityEnabled;
    el.enemySourcePresetFields.forEach(field => { field.hidden = apostleMode; });
    el.enemySourceApostleFields.forEach(field => { field.hidden = !apostleMode; });
    renderPvpRankCalculator();
    if (el.enemyApostle) el.enemyApostle.value = view.enemyApostleId || '';
    const member = context?.enemyMember || null;
    if (el.enemyApostleImage) {
      el.enemyApostleImage.src = member ? getApostleImage(member.id, member.name) : FALLBACK_IMAGE;
      el.enemyApostleImage.alt = member?.name || '';
    }
    if (el.enemyPersonality) el.enemyPersonality.disabled = apostleMode;
    const finalStatInputs = [el.inputs.enemyHp, el.inputs.enemyAtk, el.inputs.enemyCrit, el.inputs.enemyCritDmg, el.inputs.def, el.inputs.critRes, el.inputs.critDmgRes];
    finalStatInputs.forEach(input => {
      if (input) input.readOnly = apostleMode;
    });
    if (el.enemyFinalStats) el.enemyFinalStats.classList.toggle('is-final-output', apostleMode);
    if (el.enemyFinalStatsHeading) el.enemyFinalStatsHeading.textContent = apostleMode ? '最終ステータス' : 'ステータス';
    renderEnemyIndividualSettings(context);
    syncEnemyResearchPresetFromState(context);
    renderEnemyBoardPresetUi(context);
    syncEnemyPresetManagement();
  }

  function normalizePvpRank(value) {
    const rank = Math.floor(Number(value));
    return Math.max(1, Math.min(3001, Number.isFinite(rank) ? rank : 3001));
  }

  function getPvpMaxChallengeRank(rankValue) {
    const rank = normalizePvpRank(rankValue);
    const ratio = rank >= 100 ? 0.92 : 0.35;
    return {
      rank: Math.max(1, Math.floor(rank * ratio)),
      ratio
    };
  }

  function calculatePvpEliphBetween(fromRankValue, toRankValue) {
    const fromRank = normalizePvpRank(fromRankValue);
    const toRank = Math.min(fromRank, normalizePvpRank(toRankValue));
    return PVP_ELIPH_REWARD_TIERS.reduce((total, tier) => {
      const firstRank = Math.max(toRank, tier.minRank);
      const lastRank = Math.min(fromRank - 1, tier.maxRank);
      const rankCount = Math.max(0, lastRank - firstRank + 1);
      return total + rankCount * tier.perRank;
    }, 0);
  }

  function setPvpRank(value, options = {}) {
    view.pvpRank = normalizePvpRank(value);
    renderPvpRankCalculator();
    if (options.save !== false) saveCalcSettings();
  }

  function renderPvpRankCalculator() {
    if (!el.pvpRankCalculator) return;
    const currentRank = normalizePvpRank(view.pvpRank);
    view.pvpRank = currentRank;
    const challenge = getPvpMaxChallengeRank(currentRank);
    const challengeEliph = Math.floor(calculatePvpEliphBetween(currentRank, challenge.rank) + 1e-9);
    if (el.pvpRankInput && el.pvpRankInput.value !== String(currentRank)) el.pvpRankInput.value = String(currentRank);
    if (el.pvpRankSlider && el.pvpRankSlider.value !== String(currentRank)) el.pvpRankSlider.value = String(currentRank);
    if (el.pvpMaxRank) el.pvpMaxRank.textContent = `${formatNumber(challenge.rank)}位`;
    if (el.pvpChallengeEliph) el.pvpChallengeEliph.textContent = formatPlainNumber(challengeEliph);
  }

  function showPvpRankInfoPopover() {
    if (!el.pvpRankInfo) return;
    const currentRank = normalizePvpRank(view.pvpRank);
    const challenge = getPvpMaxChallengeRank(currentRank);
    const rawChallengeRank = currentRank * challenge.ratio;
    const rawEliph = calculatePvpEliphBetween(currentRank, challenge.rank);
    const finalEliph = Math.floor(rawEliph + 1e-9);
    showFdcInfoPopover(el.pvpRankInfo, 'PvP挑戦可能範囲', [
      '挑戦可能順位: 3001～100位は現在順位×92%、99～1位は現在順位×35%',
      '順位計算: 掛け算後の小数点以下を切り捨て、最低1位まで',
      '獲得エリーフ: 現在順位から挑戦可能順位まで上昇する各順位を、到達順位帯ごとの単価で合算',
      '順位帯単価: 3000～1001位=0.8 / 1000～501位=1 / 500～201位=1.5 / 200～51位=3 / 50～1位=7',
      'エリーフ計算: 順位帯をまたぐ場合も全区間を合算してから、小数点以下を切り捨て',
      `現在の順位計算: ${formatNumber(currentRank)}×${formatPlainNumber(challenge.ratio * 100)}%=${formatPlainNumber(rawChallengeRank)} → ${formatNumber(challenge.rank)}位`,
      `現在の獲得計算: ${formatPlainNumber(rawEliph)} → ${formatNumber(finalEliph)}エリーフ`
    ]);
  }

  function populateEnemyPresets() {
    if (!el.enemyPreset) return;
    const previous = view.enemyPresetKey || el.enemyPreset.value;
    const presets = getEnemyPresets();
    el.enemyPreset.innerHTML = [
      '<option value="">手動入力</option>',
      ...Object.entries(presets).map(([key, preset]) => `<option value="${escapeAttr(key)}">${escapeHtml(formatEnemyPresetDisplayName(preset, key))}</option>`)
    ].join('');
    el.enemyPreset.value = presets[previous] ? previous : '';
    view.enemyPresetKey = el.enemyPreset.value;
    syncEnemyPresetManagement();
  }

  function populateEnemyPhases() {
    if (!el.enemyPhase || !el.enemyPhaseField) return;
    const preset = getSelectedEnemyPreset();
    const phases = Array.isArray(preset?.phases) ? preset.phases : [];
    el.enemyPhaseField.hidden = phases.length === 0;
    if (!phases.length) {
      el.enemyPhase.innerHTML = '';
      view.enemyPhaseIndex = 0;
      return;
    }
    const previous = Math.min(view.enemyPhaseIndex, phases.length - 1);
    el.enemyPhase.innerHTML = phases.map((phase, index) => `<option value="${index}">${escapeHtml(phase.name || `Phase ${index + 1}`)}</option>`).join('');
    el.enemyPhase.value = String(previous);
    view.enemyPhaseIndex = previous;
  }

  function populateEnemySkills(preset) {
    if (!el.enemySkill) return;
    const skills = Array.isArray(preset?.skills) ? preset.skills : [];
    el.enemySkill.innerHTML = [
      '<option value="" data-fdc-enemy-skill-index="-1">なし</option>',
      ...skills.map((skill, index) => {
        const name = [skill.action, skill.name, skill.note ? `(${skill.note})` : ''].filter(Boolean).join(' ');
        return `<option value="${escapeAttr(skill.mult || 100)}" data-fdc-enemy-skill-index="${index}">${escapeHtml(name || `Skill ${index + 1}`)} / ${escapeHtml(formatPlainNumber(skill.mult || 100))}%</option>`;
      })
    ].join('');
    renderEnemySkillChoices(preset);
  }

  function applyEnemyPreset() {
    syncEnemyPresetBuffFields(view.enemySourceMode === 'apostle' ? null : getSelectedEnemyPreset());
    if (view.enemySourceMode === 'apostle') {
      const context = buildContext();
      syncEnemyGlobalPercentInputs(context);
      syncStatsFromEnemyApostle(context);
      renderEnemySkillChoices(undefined, context);
      return;
    }
    const preset = getSelectedEnemyPreset();
    populateEnemySkills(preset);
    if (!preset) {
      if (el.inputs.enemyWeaknessP) el.inputs.enemyWeaknessP.value = '0';
      syncWeaknessFields();
      return;
    }
    if (!view.enemyPersonality && preset.personality) {
      view.enemyPersonality = normalizePersonalityName(preset.personality);
      syncEnemyPersonalityUi();
    }
    const scaled = scaleEnemyPresetByPhase(preset, view.enemyPhaseIndex);
    const contextTarget = buildContext().target;
    const selfType = resolveSelfDamageType(contextTarget);
    const enemyType = resolveEnemyDamageType(preset);
    const enemyIsMagic = enemyType === 'magic';
    const selfIsMagic = selfType === 'magic';
    el.inputs.enemyHp.value = Math.round(Number(scaled.hp) || 0);
    el.inputs.enemyAtk.value = Math.round(Number(enemyIsMagic ? scaled.atk_m : scaled.atk_p) || 0);
    el.inputs.enemyCrit.value = Math.round(Number(scaled.crit) || 0);
    el.inputs.enemyCritDmg.value = Math.round(Number(scaled.critDmg) || 0);
    el.inputs.def.value = Math.round(Number(selfIsMagic ? scaled.def_m : scaled.def_p) || 1);
    el.inputs.critRes.value = Math.round(Number(scaled.critRes) || 1);
    el.inputs.critDmgRes.value = Math.round(Number(scaled.critDmgRes) || 1);
    if (scaled.special != null) el.inputs.enemySpecial.value = formatPlainNumber(scaled.special);
    const weaknessInfo = getEnemyPresetWeaknessInfo(preset, selfType);
    if (el.inputs.enemyWeaknessP) el.inputs.enemyWeaknessP.value = formatPlainNumber(weaknessInfo.add);
    syncWeaknessFields(selfType);
    syncAttackTypeChip(el.selfAttackTypeChip, selfType);
    syncAttackTypeChip(el.enemyAttackTypeChip, enemyType);
    syncPersonalityTypeAffinity(buildContext());
    const skills = Array.isArray(preset.skills) ? preset.skills : [];
    let skillIndex = Number.isFinite(Number(view.enemySkillIndex)) ? Number(view.enemySkillIndex) : -1;
    if (skillIndex >= skills.length) skillIndex = skills.length ? 0 : -1;
    if (skillIndex >= 0 && skills[skillIndex]?.mult) {
      el.enemySkill.value = String(skills[skillIndex].mult);
      if (el.inputs.enemySkill) el.inputs.enemySkill.value = String(skills[skillIndex].mult);
      view.enemySkillIndex = skillIndex;
    } else {
      if (el.inputs.enemySkill) el.inputs.enemySkill.value = '100';
      view.enemySkillIndex = -1;
    }
    renderEnemySkillChoices(preset);
  }

  function getEnemyPresetAngerConfig(preset = getSelectedEnemyPreset()) {
    const anger = preset?.modifiers?.buffs?.anger;
    if (!anger || typeof anger !== 'object') return null;
    const perStack = Math.max(0, Number(anger.perStack) || 0);
    const maxStacks = Math.max(0, Math.floor(Number(anger.maxStacks) || 0));
    return perStack && maxStacks ? { perStack, maxStacks } : null;
  }

  function syncEnemyPresetBuffFields(preset = getSelectedEnemyPreset()) {
    const anger = getEnemyPresetAngerConfig(preset);
    const showAnger = !!anger && view.perspective === 'enemy';
    if (el.enemyPresetBuffLabel) el.enemyPresetBuffLabel.hidden = !showAnger;
    if (el.enemyAngerField) el.enemyAngerField.hidden = !showAnger;
    if (!el.inputs.enemyAngerStack) return;
    if (!anger) {
      el.inputs.enemyAngerStack.value = '0';
      return;
    }
    const current = clamp(Math.floor(readNumber(el.inputs.enemyAngerStack)), 0, anger.maxStacks);
    el.inputs.enemyAngerStack.innerHTML = [
      '<option value="0">なし</option>',
      ...Array.from({ length: anger.maxStacks }, (_, index) => {
        const stacks = index + 1;
        return `<option value="${stacks}">${stacks}スタック / 与ダメージ+${formatPlainNumber(anger.perStack * stacks)}%</option>`;
      })
    ].join('');
    el.inputs.enemyAngerStack.value = String(current);
  }

  function getEnemyPresetWeaknessAdd(preset, damageType = '') {
    return getEnemyPresetWeaknessInfo(preset, damageType).add;
  }

  function getEnemyPresetWeaknessInfo(preset, damageType = '') {
    const key = damageType === 'magic' ? 'mag' : damageType === 'physical' ? 'phys' : '';
    const weakness = key ? preset?.weakness?.[key] : null;
    const weaknessEntries = Object.entries(preset?.weakness || {})
      .filter(([weaknessKey]) => weaknessKey === 'phys' || weaknessKey === 'mag');
    const availableLabel = weaknessEntries
      .filter(([, value]) => Number(value?.add) > 0)
      .map(([weaknessKey]) => weaknessKey === 'mag' ? '魔法弱点' : weaknessKey === 'phys' ? '物理弱点' : '弱点')
      .join('・') || '弱点';
    return {
      key,
      label: key === 'mag' ? '魔法弱点' : key === 'phys' ? '物理弱点' : '弱点',
      attackLabel: key === 'mag' ? '魔法攻撃' : key === 'phys' ? '物理攻撃' : '現在の攻撃',
      availableLabel,
      add: Number(weakness?.add) || 0,
      hasAny: weaknessEntries.length > 0
    };
  }

  function getEnemyPresetStatusDamageWeaknessInfo(preset = getSelectedEnemyPreset(), actionCategory = view.selectedSkillCategory) {
    const otherP = Math.max(0, Number(preset?.weakness?.statusDamage?.otherP) || 0);
    return {
      otherP,
      hasAny: otherP > 0,
      active: otherP > 0 && String(actionCategory || '').startsWith('状態異常::')
    };
  }

  function getEnemyPresetStatusDamageWeaknessOtherP(actionCategory = view.selectedSkillCategory) {
    const info = getEnemyPresetStatusDamageWeaknessInfo(getSelectedEnemyPreset(), actionCategory);
    return info.active ? info.otherP : 0;
  }

  function getEnemyPresetStatusTakenDamageWeaknessInfo(preset = getSelectedEnemyPreset()) {
    const weakness = preset?.weakness?.statusTakenDamage;
    const status = String(weakness?.status || '').trim();
    const add = Math.max(0, Number(weakness?.add) || 0);
    const hasAny = !!status && add > 0;
    return {
      status,
      add,
      hasAny,
      active: hasAny && readNumber(el.inputs.enemyStatusTakenDamageWeakness) > 0
    };
  }

  function getEnemyPresetStatusTakenDamageWeaknessAdd() {
    const info = getEnemyPresetStatusTakenDamageWeaknessInfo();
    return info.active ? info.add : 0;
  }

  function getEnemyPresetBreakDebuffConfig(preset = getSelectedEnemyPreset()) {
    const breakTakenDmg = preset?.modifiers?.targetDebuffs?.breakTakenDmg;
    if (!breakTakenDmg || typeof breakTakenDmg !== 'object') return null;
    const perStack = Math.max(0, Number(breakTakenDmg.perStack) || 0);
    const maxStacks = Math.max(0, Math.floor(Number(breakTakenDmg.maxStacks) || 0));
    return perStack > 0 && maxStacks > 0 ? { perStack, maxStacks } : null;
  }

  function getEnemyPresetBreakDebuffTakenDmgP() {
    const config = getEnemyPresetBreakDebuffConfig();
    if (!config || view.perspective !== 'enemy') return 0;
    const stacks = clamp(Math.floor(readNumber(el.inputs.selfBreakStack)), 0, config.maxStacks);
    return config.perStack * stacks;
  }

  function syncWeaknessFields(damageType = resolveSelfDamageType(buildContext().target)) {
    if (el.selfWeaknessField) {
      el.selfWeaknessField.hidden = true;
      el.selfWeaknessField.classList.remove('is-active', 'is-inactive');
      if (el.inputs.selfWeaknessP) el.inputs.selfWeaknessP.value = '0';
    }
    const weaknessInfo = getEnemyPresetWeaknessInfo(getSelectedEnemyPreset(), damageType);
    if (el.enemyWeaknessLabel) {
      el.enemyWeaknessLabel.textContent = weaknessInfo.add
        ? `${weaknessInfo.label} 適用`
        : `${weaknessInfo.availableLabel}（${weaknessInfo.attackLabel}では非適用）`;
    }
    if (el.enemyWeaknessField) {
      el.enemyWeaknessField.hidden = !weaknessInfo.hasAny;
      el.enemyWeaknessField.classList.toggle('is-active', weaknessInfo.add > 0);
      el.enemyWeaknessField.classList.toggle('is-inactive', weaknessInfo.hasAny && weaknessInfo.add <= 0);
    }
    const statusDamageWeaknessInfo = getEnemyPresetStatusDamageWeaknessInfo();
    if (el.enemyStatusDamageWeaknessLabel) {
      el.enemyStatusDamageWeaknessLabel.textContent = statusDamageWeaknessInfo.active
        ? '状態異常ダメージ弱点 適用'
        : '状態異常ダメージ弱点（状態異常行動選択時）';
    }
    if (el.enemyStatusDamageWeaknessValue) {
      el.enemyStatusDamageWeaknessValue.textContent = `その他倍率 +${formatPlainNumber(statusDamageWeaknessInfo.otherP)}%`;
    }
    if (el.enemyStatusDamageWeaknessField) {
      el.enemyStatusDamageWeaknessField.hidden = !statusDamageWeaknessInfo.hasAny;
      el.enemyStatusDamageWeaknessField.classList.toggle('is-active', statusDamageWeaknessInfo.active);
      el.enemyStatusDamageWeaknessField.classList.toggle('is-inactive', statusDamageWeaknessInfo.hasAny && !statusDamageWeaknessInfo.active);
    }
    let statusTakenDamageWeaknessInfo = getEnemyPresetStatusTakenDamageWeaknessInfo();
    const statusTakenDamageKey = statusTakenDamageWeaknessInfo.hasAny
      ? `${statusTakenDamageWeaknessInfo.status}:${statusTakenDamageWeaknessInfo.add}`
      : '';
    if (el.inputs.enemyStatusTakenDamageWeakness) {
      const previousKey = el.inputs.enemyStatusTakenDamageWeakness.dataset.weaknessKey || '';
      if (previousKey !== statusTakenDamageKey) {
        el.inputs.enemyStatusTakenDamageWeakness.dataset.weaknessKey = statusTakenDamageKey;
        el.inputs.enemyStatusTakenDamageWeakness.innerHTML = statusTakenDamageWeaknessInfo.hasAny
          ? `<option value="0">なし</option><option value="1">${escapeHtml(statusTakenDamageWeaknessInfo.status)}状態 / 被ダメージ量+${escapeHtml(formatPlainNumber(statusTakenDamageWeaknessInfo.add))}%</option>`
          : '<option value="0">なし</option>';
        el.inputs.enemyStatusTakenDamageWeakness.value = '0';
        statusTakenDamageWeaknessInfo = getEnemyPresetStatusTakenDamageWeaknessInfo();
      }
    }
    if (el.enemyStatusTakenDamageWeaknessLabel) {
      el.enemyStatusTakenDamageWeaknessLabel.textContent = `${statusTakenDamageWeaknessInfo.status || '状態'}弱点${statusTakenDamageWeaknessInfo.active ? ' 適用' : ''}`;
    }
    if (el.enemyStatusTakenDamageWeaknessField) {
      el.enemyStatusTakenDamageWeaknessField.hidden = !statusTakenDamageWeaknessInfo.hasAny;
      el.enemyStatusTakenDamageWeaknessField.classList.toggle('is-active', statusTakenDamageWeaknessInfo.active);
      el.enemyStatusTakenDamageWeaknessField.classList.toggle('is-inactive', statusTakenDamageWeaknessInfo.hasAny && !statusTakenDamageWeaknessInfo.active);
    }
    const breakDebuffConfig = getEnemyPresetBreakDebuffConfig();
    const breakDebuffKey = breakDebuffConfig ? `${breakDebuffConfig.perStack}:${breakDebuffConfig.maxStacks}` : '';
    if (el.inputs.selfBreakStack) {
      const previousKey = el.inputs.selfBreakStack.dataset.debuffKey || '';
      if (previousKey !== breakDebuffKey) {
        el.inputs.selfBreakStack.dataset.debuffKey = breakDebuffKey;
        el.inputs.selfBreakStack.innerHTML = breakDebuffConfig
          ? [
              '<option value="0">なし</option>',
              ...Array.from({ length: breakDebuffConfig.maxStacks }, (_, index) => {
                const stacks = index + 1;
                return `<option value="${stacks}">${stacks}スタック / 被ダメージ量+${formatPlainNumber(breakDebuffConfig.perStack * stacks)}%</option>`;
              })
            ].join('')
          : '<option value="0">なし</option>';
        el.inputs.selfBreakStack.value = '0';
      }
    }
    const breakTakenDmgP = getEnemyPresetBreakDebuffTakenDmgP();
    if (el.selfTargetDebuffLabel) el.selfTargetDebuffLabel.hidden = !breakDebuffConfig;
    if (el.selfBreakLabel) el.selfBreakLabel.textContent = `破壊${breakTakenDmgP > 0 ? ' 適用' : ''}`;
    if (el.selfBreakField) {
      el.selfBreakField.hidden = !breakDebuffConfig;
      el.selfBreakField.classList.toggle('is-active', breakTakenDmgP > 0);
      el.selfBreakField.classList.toggle('is-inactive', !!breakDebuffConfig && breakTakenDmgP <= 0);
    }
    if (!getSelectedEnemyPreset() && el.inputs.enemyWeaknessP) el.inputs.enemyWeaknessP.value = '0';
    syncBuffDebuffCategoryVisibility(weaknessInfo, statusDamageWeaknessInfo, statusTakenDamageWeaknessInfo, breakDebuffConfig);
  }

  function syncBuffDebuffCategoryVisibility(
    enemyWeaknessInfo = getEnemyPresetWeaknessInfo(getSelectedEnemyPreset(), resolveSelfDamageType(buildContext().target)),
    enemyStatusDamageWeaknessInfo = getEnemyPresetStatusDamageWeaknessInfo(),
    enemyStatusTakenDamageWeaknessInfo = getEnemyPresetStatusTakenDamageWeaknessInfo(),
    enemyBreakDebuffConfig = getEnemyPresetBreakDebuffConfig()
  ) {
    const selfIsAttacker = view.perspective !== 'enemy';
    const enemyIsAttacker = view.perspective === 'enemy';
    if (el.selfBuffCategory) el.selfBuffCategory.hidden = !selfIsAttacker && !enemyBreakDebuffConfig;
    const enemyHasRelevantDefenseEffect = enemyWeaknessInfo.hasAny
      || enemyStatusDamageWeaknessInfo.hasAny
      || enemyStatusTakenDamageWeaknessInfo.hasAny;
    if (el.enemyBuffCategory) el.enemyBuffCategory.hidden = !enemyIsAttacker && !enemyHasRelevantDefenseEffect;
    const showAnger = enemyIsAttacker && !!getEnemyPresetAngerConfig();
    if (el.enemyPresetBuffLabel) el.enemyPresetBuffLabel.hidden = !showAnger;
    if (el.enemyAngerField) el.enemyAngerField.hidden = !showAnger;
  }

  function getSelectedEnemyPreset() {
    if (view.enemySourceMode === 'apostle') return null;
    return getEnemyPresets()[view.enemyPresetKey || el.enemyPreset?.value || ''] || null;
  }

  function getActiveEnemyContentRules() {
    const preset = getSelectedEnemyPreset();
    if (!preset || typeof getEnemyPresetMetadata !== 'function') return {};
    return getEnemyPresetMetadata(preset, view.enemyPresetKey || el.enemyPreset?.value || '').rules || {};
  }

  function isEffectSourceBlockedByContent(key) {
    return !!key && (getActiveEnemyContentRules().disabledEffectSources || []).includes(key);
  }

  function isEffectSourceActive(key) {
    return !key || (!isEffectSourceBlockedByContent(key) && view.effectSources[key] !== false);
  }

  function getEffectiveGradeOverride() {
    const fixedGrade = Number(getActiveEnemyContentRules().fixedGrade) || 0;
    return fixedGrade ? String(fixedGrade) : view.gradeOverride;
  }

  function getEnemyPresets() {
    return {
      ...(typeof ENEMY_PRESETS === 'undefined' ? {} : ENEMY_PRESETS),
      ...getCustomEnemyPresets()
    };
  }

  function getCustomEnemyPresets() {
    try {
      const raw = localStorage.getItem(CUSTOM_ENEMY_PRESETS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      return Object.fromEntries(Object.entries(parsed)
        .filter(([, preset]) => preset && typeof preset === 'object')
        .map(([key, preset]) => [key.startsWith('custom:') ? key : `custom:${key}`, {
          ...preset,
          name: String(preset.name || key).replace(/^\[保存\]\s*/, ''),
          isCustom: true
        }]));
    } catch (error) {
      console.warn('Failed to load custom enemy presets', error);
      return {};
    }
  }

  function saveCustomEnemyPreset() {
    const base = getSelectedEnemyPreset();
    const rawName = (el.enemyPresetName?.value || '').trim();
    const name = rawName || getEnemyPresetMetadata(base || {}).name || '敵プリセット';
    const id = `custom:${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const damageType = resolveEnemyDamageType(base);
    const enemyAtk = readNumber(el.inputs.enemyAtk);
    const enemyDef = readNumber(el.inputs.def);
    const preset = {
      name,
      hp: readNumber(el.inputs.enemyHp),
      atk_p: enemyAtk,
      atk_m: enemyAtk,
      def_p: enemyDef,
      def_m: enemyDef,
      dmgType: damageType === 'magic' ? 'mag' : 'phys',
      crit: readNumber(el.inputs.enemyCrit),
      critDmg: readNumber(el.inputs.enemyCritDmg),
      critRes: readNumber(el.inputs.critRes),
      critDmgRes: readNumber(el.inputs.critDmgRes),
      special: readNumber(el.inputs.enemySpecial) || 100,
      personality: normalizePersonalityName(view.enemyPersonality || base?.personality),
      content: base?.content ? JSON.parse(JSON.stringify(base.content)) : undefined,
      modifiers: base?.modifiers ? JSON.parse(JSON.stringify(base.modifiers)) : undefined,
      weakness: base?.weakness ? JSON.parse(JSON.stringify(base.weakness)) : undefined,
      skills: Array.isArray(base?.skills) ? JSON.parse(JSON.stringify(base.skills)) : []
    };
    try {
      const current = getCustomEnemyPresets();
      const stored = Object.fromEntries(Object.entries(current).map(([key, value]) => {
        const { isCustom, ...preset } = value;
        return [key, { ...preset, name: String(preset.name || key).replace(/^\[保存\]\s*/, '') }];
      }));
      stored[id] = preset;
      localStorage.setItem(CUSTOM_ENEMY_PRESETS_KEY, JSON.stringify(stored));
      view.enemyPresetKey = id;
      if (el.enemyPresetName) el.enemyPresetName.value = '';
      populateEnemyPresets();
      populateEnemyPhases();
      applyEnemyPreset();
      syncEnemyPresetManagement();
    } catch (error) {
      console.warn('Failed to save custom enemy preset', error);
    }
  }

  function deleteCustomEnemyPreset() {
    const key = view.enemyPresetKey || el.enemyPreset?.value || '';
    if (!key.startsWith('custom:')) return;
    const preset = getEnemyPresets()[key];
    const name = getEnemyPresetMetadata(preset || {}, key).name || '保存プリセット';
    if (!window.confirm(`${name} を削除しますか？`)) return;
    try {
      const current = getCustomEnemyPresets();
      const stored = Object.fromEntries(Object.entries(current)
        .filter(([customKey]) => customKey !== key)
        .map(([customKey, value]) => {
          const { isCustom, ...presetValue } = value;
          return [customKey, { ...presetValue, name: String(presetValue.name || customKey).replace(/^\[保存\]\s*/, '') }];
        }));
      localStorage.setItem(CUSTOM_ENEMY_PRESETS_KEY, JSON.stringify(stored));
      view.enemyPresetKey = '';
      view.enemyPhaseIndex = 0;
      view.enemySkillIndex = -1;
      populateEnemyPresets();
      populateEnemyPhases();
      applyEnemyPreset();
      syncEnemyPresetManagement();
    } catch (error) {
      console.warn('Failed to delete custom enemy preset', error);
    }
  }

  function syncEnemyPresetManagement() {
    const key = view.enemyPresetKey || el.enemyPreset?.value || '';
    if (el.enemyPresetDelete) el.enemyPresetDelete.disabled = !key.startsWith('custom:');
  }

  function getEnemyApostleSkillOptions(context = buildContext()) {
    const member = context?.enemyMember;
    if (!member) return [];
    const enemyContext = {
      ...context,
      target: member,
      damageType: resolveEnemyDamageType(),
      actionCategory: view.enemySelectedSkillCategory || ''
    };
    return buildFdcApostleSkillOptions(member, enemyContext);
  }

  function renderEnemySkillChoices(preset = getSelectedEnemyPreset(), context = null) {
    if (!el.enemySkillChoices) return;
    if (view.perspective !== 'enemy') {
      el.enemySkillChoices.hidden = true;
      el.enemySkillChoices.innerHTML = '';
      return;
    }
    el.enemySkillChoices.hidden = false;
    const apostleMode = view.enemySourceMode === 'apostle';
    if (apostleMode) view.enemyStatDirty = false;
    const currentIndex = Number.isFinite(view.enemySkillIndex) ? view.enemySkillIndex : -1;
    const rows = [{
      index: -1,
      value: '',
      category: '',
      action: 'なし',
      name: '通常入力',
      note: 'スキル倍率を使わない'
    }];
    if (apostleMode) {
      getEnemyApostleSkillOptions(context || buildContext()).forEach((option, index) => {
        const classificationLabel = getFdcApostleSkillClassificationLabel(option);
        rows.push({
          index,
          value: option.value || 100,
          category: option.category || '',
          action: getFdcApostleSkillActionLabel(option.sourceCategory || option.category),
          name: option.skillName || option.sourceCategory || option.category || '',
          note: [
            classificationLabel ? `攻撃分類: ${classificationLabel}` : '',
            option.kind || '',
            option.cooldownSeconds ? `CT ${formatPlainNumber(option.cooldownSeconds)}秒` : ''
          ].filter(Boolean).join(' / ')
        });
      });
    } else {
      const skills = Array.isArray(preset?.skills) ? preset.skills : [];
      skills.forEach((skill, index) => rows.push({
        index,
        value: skill.mult || 100,
        category: '',
        // preset の action は大半が汎用の「攻撃」なので、固有の行動名を優先する。
        action: skill.name || skill.action || `Skill ${index + 1}`,
        name: skill.name && skill.action && skill.name !== skill.action ? skill.action : '',
        note: skill.note || ''
      }));
    }
    el.enemySkillChoices.innerHTML = `
      <div class="fdc-skill-choice-header fdc-enemy-skill-choice-header">
        <span>行動</span>
        <span>倍率</span>
        <span>補足</span>
      </div>
      ${rows.map(row => `
        <button type="button" class="fdc-skill-choice fdc-enemy-skill-choice ${row.index === currentIndex ? 'is-active' : ''}" data-fdc-enemy-skill-index="${row.index}" data-fdc-enemy-skill-value="${escapeAttr(row.value)}" data-fdc-enemy-skill-category="${escapeAttr(row.category)}">
          <span class="fdc-skill-choice-action ${row.index < 0 ? 'tone-basic' : apostleMode ? getFdcApostleSkillTone(row.category) : 'tone-extra'}">${escapeHtml(row.action)}</span>
          <span class="fdc-skill-choice-mult">${row.value === '' ? '-' : `${escapeHtml(formatPlainNumber(row.value))}%`}</span>
          <span class="fdc-skill-choice-kind">${escapeHtml([row.name, row.note].filter(Boolean).join(' / ') || '-')}</span>
        </button>
      `).join('')}
    `;
    const activeRow = rows.find(row => row.index === currentIndex);
    if (activeRow && currentIndex >= 0) {
      if (el.enemySkill) el.enemySkill.value = String(activeRow.value || '');
      if (el.inputs.enemySkill) el.inputs.enemySkill.value = String(activeRow.value || '100');
    }
    el.enemySkillChoices.querySelectorAll('[data-fdc-enemy-skill-index]').forEach(button => {
      button.addEventListener('click', () => {
        view.enemySkillIndex = Number(button.dataset.fdcEnemySkillIndex);
        view.enemySelectedSkillCategory = button.dataset.fdcEnemySkillCategory || '';
        const value = button.dataset.fdcEnemySkillValue || '';
        if (el.enemySkill) {
          el.enemySkill.value = value;
          Array.from(el.enemySkill.options || []).forEach(option => {
            option.selected = Number(option.dataset.fdcEnemySkillIndex) === view.enemySkillIndex;
          });
        }
        if (el.inputs.enemySkill) el.inputs.enemySkill.value = value || '100';
        el.enemySkillChoices.querySelectorAll('.fdc-enemy-skill-choice').forEach(row => row.classList.remove('is-active'));
        button.classList.add('is-active');
        saveCalcSettings();
        renderResult(buildContext());
      });
    });
  }
  function scaleEnemyPresetByPhase(preset, phaseIndex) {
    const phase = Array.isArray(preset?.phases) ? preset.phases[phaseIndex] : null;
    if (!phase?.mult) return { ...preset };
    const scaled = { ...preset };
    const keys = Array.isArray(phase.scaleStats) ? phase.scaleStats : [];
    keys.forEach(key => {
      if (scaled[key] != null) scaled[key] = Number(scaled[key]) * Number(phase.mult);
    });
    return scaled;
  }

  function buildContext(overrides = {}) {
    const state = getEffectiveStatState();
    const formationSource = getSelectedFormationSource(state);
    const formation = applyTempSpellOverrides(applyTempArtifactOverrides(applyTempMemberOverrides(normalizeFormation(formationSource.formation))));
    const members = getFormationMembers(formation, state);
    const allMembers = getAllApostleMembers(state);
    if (formationSource.preset && !members.some(member => member.id === view.targetId)) {
      view.targetId = members[0]?.id || view.targetId;
    }
    if (!view.targetId || !allMembers.some(member => member.id === view.targetId)) view.targetId = members[0]?.id || allMembers[0]?.id || '';
    const target = getCurrentTargetMember(members, allMembers);
    const enemyMember = getSelectedEnemyApostleMember(allMembers, state);
    const damageType = resolveActiveDamageType(target);
    const cards = state.cards && typeof state.cards === 'object' ? state.cards : {};
    const actionCategory = typeof overrides.actionCategory === 'string'
      ? overrides.actionCategory
      : view.selectedSkillCategory || '';
    if (!overrides.detached && view._selfSkillEffectActionCategory !== actionCategory) {
      view.selfSkillEffectEnabled = {};
      view._selfSkillEffectActionCategory = actionCategory;
    }
    const effects = collectEffects({ target, formation, cards, damageType, state, actionCategory });
    const skillEffectStateOverrides = overrides.skillEffectStateOverrides || null;
    applyEnabledSelfSkillEffects(effects, { target, formation, cards, damageType, state, actionCategory, members, allMembers, skillEffectStateOverrides });
    const summary = summarizeEffects(getEnabledEffectRows(effects));
    const enemyAttackEffects = collectEnemyCardEffects({
      target: enemyMember,
      cards,
      damageType: resolveEnemyDamageType(),
      actionCategory: view.enemySelectedSkillCategory || ''
    });
    const enemyDefenseEffects = collectEnemyCardEffects({
      target: enemyMember,
      cards,
      damageType,
      actionCategory
    });
    const enemyAttackSummary = summarizeEffects([
      ...(enemyAttackEffects.applied || []),
      ...(enemyAttackEffects.globalStats || [])
    ].filter(isEffectSourceEnabled));
    const enemyDefenseSummary = summarizeEffects([
      ...(enemyDefenseEffects.applied || []),
      ...(enemyDefenseEffects.globalStats || [])
    ].filter(isEffectSourceEnabled));
    return {
      state,
      formation,
      formationPreset: formationSource.preset,
      members,
      allMembers,
      target,
      enemyMember,
      damageType,
      actionCategory,
      skillEffectStateOverrides,
      effects,
      summary,
      enemyEffects: view.perspective === 'enemy' ? enemyAttackEffects : enemyDefenseEffects,
      enemySummary: view.perspective === 'enemy' ? enemyAttackSummary : enemyDefenseSummary
    };
  }

  function getSelectedEnemyApostleMember(allMembers = [], state = {}) {
    if (view.enemySourceMode !== 'apostle' || !view.enemyApostleId) return null;
    const member = allMembers.find(item => item.id === view.enemyApostleId) || null;
    if (!member) return null;
    const settings = getEnemyIndividualOverride({ state }, member.id) || normalizeEnemyIndividualSettings({}, { state }, member.id);
    return {
      ...member,
      level: settings.level,
      star: settings.star,
      grade: settings.grade,
      rank: settings.rank,
      bond: settings.bond,
      asideRank: settings.asideRank,
      asideLevel: settings.asideLevel,
      follow: settings.follow,
      artifactIds: settings.artifactIds.slice(),
      artifactSettings: settings.artifactSettings.map(item => ({ ...item })),
      spellIds: settings.spellIds.slice(),
      spellSettings: clonePlain(settings.spellSettings),
      skillLevels: { ...member.skillLevels, ...settings.skillLevels },
      hasEnemyIndividualSkillLevels: true
    };
  }

  function getCurrentTargetMember(members, allMembers) {
    const tempSlot = Object.entries(view.tempMembers || {}).find(([, id]) => id === view.targetId);
    if (tempSlot) {
      const [rowIndex, lineIndex] = tempSlot[0].split(':').map(Number);
      const tempMember = members.find(member =>
        member.id === view.targetId
        && member.position === POSITIONS[rowIndex]
        && member.line === lineIndex + 1
      );
      if (tempMember) return tempMember;
    }
    return members.find(member => member.id === view.targetId) || allMembers.find(member => member.id === view.targetId) || null;
  }

  function getSelectedFormationSource(state = {}) {
    const presets = getSavedFormationPresets(state);
    const preset = presets.find(item => item.id === view.formationPresetId);
    if (view.formationPresetId && !preset) view.formationPresetId = '';
    return {
      preset: preset || null,
      formation: preset?.formation || state.formation || {}
    };
  }

  function getSavedFormationPresets(state = {}) {
    return Array.isArray(state.savedFormations)
      ? state.savedFormations
        .filter(item => item && item.id && item.formation && typeof item.formation === 'object')
        .map(item => ({
          ...item,
          name: item.name || '無題の編成',
          tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
          favoriteSlot: Number(item.favoriteSlot) || 0
        }))
      : [];
  }

  function getFirstFormationApostleId(formation = {}) {
    return (formation.rows || [])
      .flatMap(row => row.apostles || [])
      .find(Boolean) || '';
  }

  function applyTempSpellOverrides(formation) {
    const next = normalizeFormation(formation);
    if (Array.isArray(view.tempSpells)) next.spells = view.tempSpells.filter(Boolean);
    return next;
  }
  function applyTempArtifactOverrides(formation) {
    const next = normalizeFormation(formation);
    Object.entries(view.tempArtifacts.formation || {}).forEach(([key, id]) => {
      const [rowIndex, lineIndex, slotIndex] = key.split(':').map(Number);
      const row = next.rows[rowIndex];
      if (!row || !Array.isArray(row.artifacts?.[lineIndex])) return;
      row.artifacts[lineIndex][slotIndex] = id || '';
    });
    return next;
  }

  function applyTempMemberOverrides(formation) {
    const next = normalizeFormation(formation);
    Object.entries(view.tempMembers || {}).forEach(([key, id]) => {
      const [rowIndex, lineIndex] = key.split(':').map(Number);
      const row = next.rows[rowIndex];
      if (!row || lineIndex < 0 || lineIndex >= 3) return;
      const memberId = id || '';
      if (memberId) {
        next.rows.forEach(otherRow => {
          otherRow.apostles = otherRow.apostles.map(existingId => existingId === memberId ? '' : existingId);
        });
      }
      row.apostles[lineIndex] = memberId;
    });
    return next;
  }

  function loadDamageCalculationSaves() {
    try {
      const raw = localStorage.getItem(CALC_RESULT_SAVES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(item => item && typeof item === 'object' && item.id && item.snapshot)
        .map(item => ({
          id: String(item.id),
          name: String(item.name || '無題の計算'),
          savedAt: Number(item.savedAt) || 0,
          snapshot: item.snapshot
        }))
        .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    } catch (error) {
      console.warn('Failed to load damage calculation saves', error);
      return [];
    }
  }

  function writeDamageCalculationSaves(items) {
    try {
      const normalized = (Array.isArray(items) ? items : [])
        .filter(item => item && item.id && item.snapshot)
        .slice(0, 50);
      localStorage.setItem(CALC_RESULT_SAVES_KEY, JSON.stringify(normalized));
    } catch (error) {
      console.warn('Failed to save damage calculation saves', error);
    }
  }

  function renderDamageSaveActionPanel() {
    const action = view.damageSaveAction;
    const saves = loadDamageCalculationSaves();
    el.saveActionButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.fdcSaveAction === action));
    });
    if (el.loadOptionsPanel) el.loadOptionsPanel.hidden = action !== 'load';
    if (!el.saveList) return;
    el.saveList.hidden = !action;
    el.saveList.dataset.action = action;
    if (!action) {
      el.saveList.innerHTML = '';
      return;
    }
    const items = [];
    if (action === 'save') {
      items.push('<button type="button" class="fdc-save-list-item is-new" data-fdc-save-id=""><strong>新規保存</strong><span>新しい保存データを作成</span></button>');
    }
    saves.forEach(item => {
      items.push(`<button type="button" class="fdc-save-list-item" data-fdc-save-id="${escapeAttr(item.id)}"><strong>${escapeHtml(item.name || '無題の計算')}</strong><span>${escapeHtml(formatDamageSaveOptionLabel(item, false))}</span></button>`);
    });
    if (!items.length) {
      el.saveList.innerHTML = '<p class="fdc-save-list-empty">保存データはありません</p>';
      return;
    }
    el.saveList.innerHTML = items.join('');
    el.saveList.querySelectorAll('[data-fdc-save-id]').forEach(button => {
      button.addEventListener('click', () => executeDamageSaveAction(action, button.dataset.fdcSaveId || ''));
    });
  }

  function executeDamageSaveAction(action, id) {
    if (action === 'save') saveCurrentDamageCalculation(id);
    if (action === 'load') loadSelectedDamageCalculation(id);
    if (action === 'compare') compareSelectedDamageCalculation(id);
    if (action === 'delete') deleteSelectedDamageCalculation(id);
  }

  function formatDamageSaveOptionLabel(item, includeName = true) {
    const date = item.savedAt ? new Date(item.savedAt) : null;
    const stamp = date && !Number.isNaN(date.getTime())
      ? `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      : '';
    const expected = Number(item.snapshot?.result?.expected);
    const expectedText = Number.isFinite(expected) && expected > 0 ? `期待値 ${formatCompactDamage(expected)}` : '';
    return [includeName ? item.name || '無題の計算' : '', expectedText, stamp].filter(Boolean).join(' / ');
  }

  function getDamageSaveById(id) {
    if (!id) return null;
    return loadDamageCalculationSaves().find(item => item.id === id) || null;
  }

  function closeDamageSaveMenu() {
    view.damageSaveAction = '';
    renderDamageSaveActionPanel();
    if (el.saveMenu) el.saveMenu.open = false;
  }

  function saveCurrentDamageCalculation(selectedId = '') {
    const saves = loadDamageCalculationSaves();
    const existing = saves.find(item => item.id === selectedId) || null;
    const context = buildContext();
    const defaultName = existing?.name || createDamageSaveDefaultName(context);
    const enteredName = window.prompt(existing ? '保存名を変更して上書き' : '保存名', defaultName);
    if (enteredName === null) return;
    const now = Date.now();
    const item = {
      id: existing?.id || `calc:${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      name: enteredName.trim() || defaultName,
      savedAt: now,
      snapshot: createDamageCalculationSnapshot(context)
    };
    writeDamageCalculationSaves([item, ...saves.filter(saved => saved.id !== item.id)]);
    closeDamageSaveMenu();
  }

  function loadSelectedDamageCalculation(id) {
    const selected = getDamageSaveById(id);
    if (!selected) return;
    if (!window.confirm(`「${selected.name || '無題の計算'}」を読み込みますか？`)) return;
    applyDamageCalculationSnapshot(selected.snapshot, getDamageLoadOptions());
    view.loadedDamageSaveId = selected.id;
    renderLoadedDamageSaveLabel(selected);
    closeDamageSaveMenu();
  }

  function compareSelectedDamageCalculation(id) {
    const selected = getDamageSaveById(id);
    const scenarioApi = getCombatScenarioApi();
    if (!selected || !scenarioApi?.savePinnedComparison) return;
    const scenario = createCombatScenarioFromDamageSave(selected);
    const session = scenarioApi.savePinnedComparison({
      scenario,
      singleActionResult: selected.snapshot?.result || {},
      dpsSnapshot: selected.snapshot?.comparison?.dpsSnapshot || {}
    });
    if (!session) return;
    closeDamageSaveMenu();
    const context = buildContext();
    syncPinnedComparisonUi(context);
    renderResult(context);
    window.dispatchEvent(new CustomEvent('trickcal:comparison-session-changed', { detail: { mode: 'pinned', source: 'damageSave', id: selected.id } }));
  }

  function createCombatScenarioFromDamageSave(item = {}) {
    const snapshot = item.snapshot || {};
    const savedView = snapshot.view || {};
    const referenceState = snapshot.referenceState || {};
    const targetId = savedView.targetId || referenceState.activeId || '';
    const enemyId = savedView.enemyApostleId || '';
    const targetBasic = getApostle(targetId) || {};
    const enemyBasic = getApostle(enemyId) || {};
    const source = {
      capturedAt: Number(snapshot.savedAt || item.savedAt) || 0,
      sourceMeta: {
        type: 'damageSave',
        id: item.id || '',
        name: item.name || '無題の計算',
        calculatorVersion: Number(snapshot.version) || 0
      },
      actors: {
        self: { id: targetId, name: targetBasic.使徒名 || targetId },
        enemy: {
          sourceMode: savedView.enemySourceMode === 'apostle' ? 'apostle' : 'preset',
          id: enemyId,
          name: enemyBasic.使徒名 || '',
          presetKey: savedView.enemyPresetKey || ''
        }
      },
      characterState: {
        targetId,
        enemyApostleId: enemyId,
        statMode: savedView.statMode === 'planned' ? 'planned' : 'current',
        resultMetric: normalizeResultMetric(savedView.resultMetric),
        gradeOverride: savedView.gradeOverride || 'saved',
        apostles: clonePlain(referenceState.apostles || {}),
        research: clonePlain(referenceState.research || {})
      },
      formationState: {
        presetId: savedView.formationPresetId || '',
        formation: clonePlain(referenceState.formation || {}),
        tempMembers: clonePlain(savedView.tempMembers || {})
      },
      cardState: {
        cards: clonePlain(referenceState.cards || {}),
        tempArtifacts: clonePlain(savedView.tempArtifacts || { formation: {}, target: {} }),
        tempSpells: Array.isArray(savedView.tempSpells) ? savedView.tempSpells.slice() : null,
        tempCardStates: sanitizeFdcTempCardStates(savedView.tempCardStates)
      },
      battleConditions: {
        perspective: savedView.perspective === 'enemy' ? 'enemy' : 'self',
        damageType: savedView.damageType || 'auto',
        enemyDamageType: savedView.enemyDamageType || 'auto',
        actionCategory: savedView.selectedSkillCategory || '',
        selectedSkillCategory: savedView.selectedSkillCategory || '',
        selectedSkillOptionKey: savedView.selectedSkillOptionKey || '',
        enemySelectedSkillCategory: savedView.enemySelectedSkillCategory || '',
        enemySourceMode: savedView.enemySourceMode === 'apostle' ? 'apostle' : 'preset',
        enemyPresetKey: savedView.enemyPresetKey || '',
        enemyPhaseIndex: Number(savedView.enemyPhaseIndex) || 0,
        enemySkillIndex: Number.isFinite(Number(savedView.enemySkillIndex)) ? Number(savedView.enemySkillIndex) : -1,
        enemyPersonality: savedView.enemyPersonality || '',
        pvpAffinityEnabled: !!savedView.pvpAffinityEnabled,
        pvpRank: normalizePvpRank(savedView.pvpRank),
        inputs: clonePlain(snapshot.inputs || {})
      },
      effectAssumptions: {
        effectSources: pickBooleanMap(savedView.effectSources || {}),
        selfSkillEffectEnabled: pickBooleanMap(savedView.selfSkillEffectEnabled || {}),
        conditionalEffectEnabled: pickBooleanMap(savedView.conditionalEffectEnabled || {}),
        conditionalEffectStackCounts: pickNumberMap(savedView.conditionalEffectStackCounts || {}),
        skillLevelOverrides: sanitizeSkillLevelOverrides(savedView.skillLevelOverrides || {}),
        enemyGlobalPercentEnabled: savedView.enemyGlobalPercentEnabled !== false,
        enemyGlobalAdditiveEnabled: savedView.enemyGlobalAdditiveEnabled !== false,
        enemyBoardPresetSelections: clonePlain(savedView.enemyBoardPresetSelections || {}),
        enemyIndividualOverrides: clonePlain(savedView.enemyIndividualOverrides || {}),
        enemyRankPreset: normalizeEnemyRankPreset(savedView.enemyRankPreset),
        enemyResearchPreset: clonePlain(savedView.enemyResearchPreset || {})
      }
    };
    const scenario = getCombatScenarioApi()?.createScenario?.(source) || clonePlain(source);
    if (getCombatScenarioApi()?.fingerprint) scenario.sourceMeta.fingerprint = getCombatScenarioApi().fingerprint(scenario);
    return scenario;
  }

  function deleteSelectedDamageCalculation(id) {
    const selected = getDamageSaveById(id);
    if (!selected) return;
    if (!window.confirm(`「${selected.name || '無題の計算'}」を削除しますか？`)) return;
    writeDamageCalculationSaves(loadDamageCalculationSaves().filter(item => item.id !== selected.id));
    if (view.loadedDamageSaveId === selected.id) {
      view.loadedDamageSaveId = '';
      renderLoadedDamageSaveLabel(null);
    }
    closeDamageSaveMenu();
  }

  function renderLoadedDamageSaveLabel(item) {
    if (!el.loadedSaveLabel) return;
    el.loadedSaveLabel.hidden = !item;
    if (!item) {
      el.loadedSaveLabel.innerHTML = '';
      el.loadedSaveLabel.title = '';
      return;
    }
    const result = item.snapshot?.result || {};
    el.loadedSaveLabel.innerHTML = `<strong>${escapeHtml(item.name || '無題の計算')}</strong><span>期待値 ${escapeHtml(formatCompactDamage(Number(result.expected) || 0))}</span>`;
    el.loadedSaveLabel.title = formatDamageSaveOptionLabel(item);
  }
  function createDamageSaveDefaultName(context = buildContext()) {
    const target = context.target?.name || '使徒未選択';
    const preset = getSelectedEnemyPreset();
    const enemy = view.enemySourceMode === 'apostle'
      ? context.enemyMember?.name || '敵使徒未選択'
      : preset ? formatEnemyPresetDisplayName(preset, view.enemyPresetKey || '') : '手動敵';
    return `${target} vs ${enemy}`;
  }

  function createDamageCalculationSnapshot(context = buildContext()) {
    const result = calculateDamage(context);
    const dpsSnapshot = createPinnedDpsSnapshot(createDpsPrototypeSnapshot(context));
    return {
      version: 4,
      savedAt: Date.now(),
      view: clonePlain({
        targetId: view.targetId || '',
        formationPresetId: view.formationPresetId || '',
        damageType: view.damageType || 'auto',
        enemyDamageType: view.enemyDamageType || 'auto',
        gradeOverride: view.gradeOverride || 'saved',
        statMode: view.statMode === 'planned' ? 'planned' : 'current',
        resultMetric: normalizeResultMetric(view.resultMetric),
        perspective: view.perspective === 'enemy' ? 'enemy' : 'self',
        mobileVisibleSide: view.mobileVisibleSide === 'enemy' ? 'enemy' : 'self',
        enemyPersonality: view.enemyPersonality || '',
        enemySourceMode: view.enemySourceMode === 'apostle' ? 'apostle' : 'preset',
        pvpAffinityEnabled: !!view.pvpAffinityEnabled,
        pvpRank: normalizePvpRank(view.pvpRank),
        enemyApostleId: view.enemyApostleId || '',
        enemyPresetKey: view.enemyPresetKey || '',
        enemySelectedSkillCategory: view.enemySelectedSkillCategory || '',
        enemyStatDirty: !!view.enemyStatDirty,
        enemyGlobalPercentDirty: !!view.enemyGlobalPercentDirty,
        enemyGlobalPercentEnabled: view.enemyGlobalPercentEnabled !== false,
        enemyGlobalAdditiveEnabled: view.enemyGlobalAdditiveEnabled !== false,
        enemyBoardPresetSelections: clonePlain(view.enemyBoardPresetSelections),
        enemyIndividualOverrides: clonePlain(view.enemyIndividualOverrides),
        enemyCorrectionSchema: 6,
        enemyRankPreset: normalizeEnemyRankPreset(view.enemyRankPreset),
        enemyGlobalPercent: readEnemyGlobalPercentInputs(),
        enemyGlobalAdditive: readEnemyCorrectionInputs('additiveInputKey'),
        enemyResearchPreset: clonePlain(view.enemyResearchPreset),
        enemyPhaseIndex: Number(view.enemyPhaseIndex) || 0,
        enemySkillIndex: Number.isFinite(Number(view.enemySkillIndex)) ? Number(view.enemySkillIndex) : -1,
        selectedSkillCategory: view.selectedSkillCategory || '',
        selectedSkillOptionKey: view.selectedSkillOptionKey || '',
        statDirty: !!view.statDirty,
        effectSources: pickBooleanMap(view.effectSources),
        resultDisplays: pickBooleanMap(view.resultDisplays),
        selfSkillEffectEnabled: pickBooleanMap(view.selfSkillEffectEnabled),
        conditionalEffectEnabled: pickBooleanMap(view.conditionalEffectEnabled),
        conditionalEffectStackCounts: pickNumberMap(view.conditionalEffectStackCounts),
        skillLevelOverrides: sanitizeSkillLevelOverrides(view.skillLevelOverrides),
        tempMembers: view.tempMembers || {},
        tempArtifacts: view.tempArtifacts || { formation: {}, target: {} },
        tempSpells: Array.isArray(view.tempSpells) ? view.tempSpells.slice() : null,
        tempCardStates: sanitizeFdcTempCardStates(view.tempCardStates),
        spellDetailsOpen: !!view.spellDetailsOpen
      }),
      inputs: readDamageCalculationInputs(),
      referenceState: createReferenceStateSnapshot(context),
      comparison: {
        dpsSnapshot
      },
      result: {
        normal: Math.round(Number(result.normal) || 0),
        crit: Math.round(Number(result.crit) || 0),
        expected: Math.round(Number(result.expected) || 0),
        hp: Math.round(Number(result.hp) || 0),
        critRate: Number(result.critRate) || 0,
        defRate: Number(result.defRate) || 0
      }
    };
  }

  function applyDamageCalculationSnapshot(snapshot = {}, options = getDamageLoadOptions()) {
    if (!snapshot || typeof snapshot !== 'object') return;
    const loadOptions = {
      settings: true,
      enemy: true,
      cards: !!options.cards,
      global: !!options.global,
      apostles: !!options.apostles
    };
    const savedView = snapshot.view && typeof snapshot.view === 'object' ? snapshot.view : {};
    view.referenceState = snapshot.referenceState && typeof snapshot.referenceState === 'object'
      ? clonePlain(snapshot.referenceState)
      : null;
    if (view.referenceState) {
      view.referenceState.cards = migrateCardStateMap(view.referenceState.cards);
      view.referenceState.formation = normalizeFormation(view.referenceState.formation || {});
      if (Array.isArray(view.referenceState.savedFormations)) {
        view.referenceState.savedFormations = view.referenceState.savedFormations.map(item => ({
          ...item,
          formation: normalizeFormation(item?.formation || {})
        }));
      }
    }
    view.referenceOptions = { cards: loadOptions.cards, global: loadOptions.global, apostles: loadOptions.apostles };
    applyDamageSnapshotView(savedView, loadOptions);
    view.pendingTempMemberId = '';
    closeTempArtifactPicker();
    closeFormationPicker();
    populateEnemyPresets();
    populateEnemyApostles();
    render();
    const snapshotInputs = { ...(snapshot.inputs || {}) };
    if (Number(savedView.enemyCorrectionSchema) !== 6) {
      getEnemyCorrectionInputKeys().forEach(inputKey => { delete snapshotInputs[inputKey]; });
    }
    writeDamageCalculationInputs(snapshotInputs, loadOptions);
    saveCalcSettings();
    renderResult(buildContext());
  }

  function applyDamageSnapshotView(savedView = {}, options = {}) {
    if (options.settings) {
      if (typeof savedView.targetId === 'string') view.targetId = savedView.targetId;
      if (typeof savedView.formationPresetId === 'string') view.formationPresetId = savedView.formationPresetId;
      if (['auto', 'physical', 'magic'].includes(savedView.damageType)) view.damageType = savedView.damageType;
      if (['saved', '1', '2', '3', '4', '5', '6'].includes(String(savedView.gradeOverride))) view.gradeOverride = String(savedView.gradeOverride);
      if (['current', 'planned'].includes(savedView.statMode)) view.statMode = savedView.statMode;
      if (savedView.resultMetric) view.resultMetric = normalizeResultMetric(savedView.resultMetric);
      if (['self', 'enemy'].includes(savedView.perspective)) view.perspective = savedView.perspective;
      if (['self', 'enemy'].includes(savedView.mobileVisibleSide)) view.mobileVisibleSide = savedView.mobileVisibleSide;
      if (typeof savedView.selectedSkillCategory === 'string') view.selectedSkillCategory = savedView.selectedSkillCategory;
      if (typeof savedView.selectedSkillOptionKey === 'string') view.selectedSkillOptionKey = savedView.selectedSkillOptionKey;
      if (savedView.effectSources && typeof savedView.effectSources === 'object') view.effectSources = { ...view.effectSources, ...pickBooleanMap(savedView.effectSources, Object.keys(view.effectSources)) };
      if (savedView.resultDisplays && typeof savedView.resultDisplays === 'object') view.resultDisplays = { ...view.resultDisplays, ...pickBooleanMap(savedView.resultDisplays, Object.keys(view.resultDisplays)) };
      view.selfSkillEffectEnabled = savedView.selfSkillEffectEnabled && typeof savedView.selfSkillEffectEnabled === 'object' ? pickBooleanMap(savedView.selfSkillEffectEnabled) : {};
      view.conditionalEffectEnabled = savedView.conditionalEffectEnabled && typeof savedView.conditionalEffectEnabled === 'object' ? migrateCardEffectStateMap(pickBooleanMap(savedView.conditionalEffectEnabled)) : {};
      view.conditionalEffectStackCounts = savedView.conditionalEffectStackCounts && typeof savedView.conditionalEffectStackCounts === 'object' ? migrateCardEffectStateMap(pickNumberMap(savedView.conditionalEffectStackCounts)) : {};
      view.skillLevelOverrides = savedView.skillLevelOverrides && typeof savedView.skillLevelOverrides === 'object' ? sanitizeSkillLevelOverrides(savedView.skillLevelOverrides) : {};
      view.tempMembers = savedView.tempMembers && typeof savedView.tempMembers === 'object' ? clonePlain(savedView.tempMembers) : {};
      view.tempArtifacts = savedView.tempArtifacts && typeof savedView.tempArtifacts === 'object'
        ? migrateTempArtifactOverrides(savedView.tempArtifacts)
        : { formation: {}, target: {} };
      view.tempSpells = Array.isArray(savedView.tempSpells) ? savedView.tempSpells.filter(Boolean).map(resolveCardIdAlias) : null;
      view.tempCardStates = sanitizeFdcTempCardStates(savedView.tempCardStates);
      view.spellDetailsOpen = !!savedView.spellDetailsOpen;
    }
    if (options.enemy) {
      if (['auto', 'physical', 'magic'].includes(savedView.enemyDamageType)) view.enemyDamageType = savedView.enemyDamageType;
      if (typeof savedView.enemyPersonality === 'string') view.enemyPersonality = savedView.enemyPersonality;
      if (['preset', 'apostle'].includes(savedView.enemySourceMode)) view.enemySourceMode = savedView.enemySourceMode;
      view.pvpAffinityEnabled = !!savedView.pvpAffinityEnabled;
      if (savedView.pvpRank != null) view.pvpRank = normalizePvpRank(savedView.pvpRank);
      if (typeof savedView.enemyApostleId === 'string') view.enemyApostleId = savedView.enemyApostleId;
      if (typeof savedView.enemySelectedSkillCategory === 'string') view.enemySelectedSkillCategory = savedView.enemySelectedSkillCategory;
      view.enemyStatDirty = !!savedView.enemyStatDirty;
      const hasCurrentEnemyCorrectionSchema = Number(savedView.enemyCorrectionSchema) === 6;
      view.enemyGlobalPercentDirty = hasCurrentEnemyCorrectionSchema && !!savedView.enemyGlobalPercentDirty;
      view.enemyGlobalPercentEnabled = savedView.enemyGlobalPercentEnabled !== false;
      view.enemyGlobalAdditiveEnabled = savedView.enemyGlobalAdditiveEnabled !== false;
      view.enemyBoardPresetSelections = normalizeEnemyBoardPresetSelections(savedView.enemyBoardPresetSelections);
      view.enemyIndividualOverrides = savedView.enemyIndividualOverrides && typeof savedView.enemyIndividualOverrides === 'object' ? clonePlain(savedView.enemyIndividualOverrides) : {};
      view.enemyRankPreset = normalizeEnemyRankPreset(savedView.enemyRankPreset);
      if (savedView.enemyResearchPreset && typeof savedView.enemyResearchPreset === 'object') view.enemyResearchPreset = { level: Number(savedView.enemyResearchPreset.level) || 0, progress: Number(savedView.enemyResearchPreset.progress) || 0, dirty: !!savedView.enemyResearchPreset.dirty };
      if (typeof savedView.enemyPresetKey === 'string') view.enemyPresetKey = savedView.enemyPresetKey;
      if (Number.isFinite(Number(savedView.enemyPhaseIndex))) view.enemyPhaseIndex = Math.max(0, Number(savedView.enemyPhaseIndex));
      if (Number.isFinite(Number(savedView.enemySkillIndex))) view.enemySkillIndex = Number(savedView.enemySkillIndex);
    }
    view.statDirty = true;
  }
  function readDamageCalculationInputs() {
    return Object.fromEntries(Object.entries(el.inputs || {})
      .filter(([, input]) => input && 'value' in input)
      .map(([key, input]) => [key, input.value]));
  }

  function writeDamageCalculationInputs(values = {}, options = { settings: true, enemy: true }) {
    Object.entries(values || {}).forEach(([key, value]) => {
      const input = el.inputs?.[key];
      if (!input || !('value' in input)) return;
      const enemyInput = isEnemyDamageInputKey(key);
      if (enemyInput && !options.enemy) return;
      if (!enemyInput && !options.settings) return;
      input.value = value == null ? '' : String(value);
    });
    if (options.settings) {
      if (el.damageType) el.damageType.value = view.damageType;
      if (el.gradeOverride) el.gradeOverride.value = view.gradeOverride;
      if (el.statMode) el.statMode.value = view.statMode;
      if (el.formationPreset) el.formationPreset.value = view.formationPresetId || '';
    }
    if (options.enemy) {
      if (el.enemyDamageType) el.enemyDamageType.value = view.enemyDamageType;
      if (el.enemySourceMode) el.enemySourceMode.value = view.enemySourceMode;
      if (el.enemyApostle) el.enemyApostle.value = view.enemyApostleId || '';
      if (el.enemyPersonality) el.enemyPersonality.value = view.enemyPersonality || '';
      if (el.enemyPreset) el.enemyPreset.value = view.enemyPresetKey || '';
    }
  }

  function isEnemyDamageInputKey(key) {
    return String(key || '').startsWith('enemy') || ['def', 'critRes', 'critDmgRes'].includes(key);
  }

  function getDamageLoadOptions() {
    const defaults = { cards: false, global: false, apostles: false };
    el.loadPartInputs.forEach(input => {
      const key = input.dataset.fdcLoadPart;
      if (Object.prototype.hasOwnProperty.call(defaults, key)) defaults[key] = !!input.checked;
    });
    return defaults;
  }

  function createReferenceStateSnapshot(context = buildContext()) {
    const state = context.state || loadStatState();
    const ids = new Set([
      context.target?.id,
      context.enemyMember?.id,
      ...(context.members || []).map(member => member.id),
      ...Object.values(view.tempMembers || {})
    ].filter(Boolean));
    const apostles = {};
    ids.forEach(id => {
      if (state.apostles?.[id]) apostles[id] = clonePlain(state.apostles[id]);
    });
    const selectedPreset = Array.isArray(state.savedFormations)
      ? state.savedFormations.find(item => item?.id === view.formationPresetId)
      : null;
    return {
      found: true,
      activeId: state.activeId || view.targetId || '',
      apostles,
      research: clonePlain(state.research || {}),
      cards: clonePlain(state.cards || {}),
      formation: clonePlain(normalizeFormation(getSelectedFormationSource(state).formation)),
      savedFormations: selectedPreset ? [clonePlain(selectedPreset)] : []
    };
  }

  function formatCompactDamage(value) {
    const number = Math.round(Number(value) || 0);
    if (number >= 100000000) return `${formatPlainNumber(number / 100000000)}億`;
    if (number >= 10000) return `${formatPlainNumber(number / 10000)}万`;
    return formatNumber(number);
  }
  function clonePlain(value) {
    try {
      return JSON.parse(JSON.stringify(value || {}));
    } catch {
      return {};
    }
  }
  function restoreCalcSettings() {
    try {
      const raw = localStorage.getItem(CALC_SETTINGS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') return;
      if (typeof saved.targetId === 'string') view.targetId = saved.targetId;
      if (typeof saved.formationPresetId === 'string') view.formationPresetId = saved.formationPresetId;
      if (['auto', 'physical', 'magic'].includes(saved.damageType)) view.damageType = saved.damageType;
      if (['auto', 'physical', 'magic'].includes(saved.enemyDamageType)) view.enemyDamageType = saved.enemyDamageType;
      if (['saved', '1', '2', '3', '4', '5', '6'].includes(String(saved.gradeOverride))) view.gradeOverride = String(saved.gradeOverride);
      if (['current', 'planned'].includes(saved.statMode)) view.statMode = saved.statMode;
      if (saved.resultMetric) view.resultMetric = normalizeResultMetric(saved.resultMetric);
      if (['self', 'enemy'].includes(saved.perspective)) view.perspective = saved.perspective;
      if (['self', 'enemy'].includes(saved.mobileVisibleSide)) view.mobileVisibleSide = saved.mobileVisibleSide;
      if (typeof saved.enemyPersonality === 'string') view.enemyPersonality = saved.enemyPersonality;
      if (['preset', 'apostle'].includes(saved.enemySourceMode)) view.enemySourceMode = saved.enemySourceMode;
      view.pvpAffinityEnabled = !!saved.pvpAffinityEnabled;
      if (saved.pvpRank != null) view.pvpRank = normalizePvpRank(saved.pvpRank);
      if (typeof saved.enemyApostleId === 'string') view.enemyApostleId = saved.enemyApostleId;
      if (typeof saved.enemySelectedSkillCategory === 'string') view.enemySelectedSkillCategory = saved.enemySelectedSkillCategory;
      view.enemyStatDirty = !!saved.enemyStatDirty;
      const hasCurrentEnemyCorrectionSchema = Number(saved.enemyCorrectionSchema) === 6;
      view.enemyBoardPresetSelections = normalizeEnemyBoardPresetSelections(saved.enemyBoardPresetSelections);
      view.enemyIndividualOverrides = saved.enemyIndividualOverrides && typeof saved.enemyIndividualOverrides === 'object' ? clonePlain(saved.enemyIndividualOverrides) : {};
      view.enemyRankPreset = normalizeEnemyRankPreset(saved.enemyRankPreset);
      view.enemyGlobalPercentDirty = hasCurrentEnemyCorrectionSchema && !!saved.enemyGlobalPercentDirty;
      view.enemyGlobalPercentEnabled = saved.enemyGlobalPercentEnabled !== false;
      view.enemyGlobalAdditiveEnabled = saved.enemyGlobalAdditiveEnabled !== false;
      if (hasCurrentEnemyCorrectionSchema && saved.enemyGlobalPercent && typeof saved.enemyGlobalPercent === 'object') writeEnemyGlobalPercentInputs(saved.enemyGlobalPercent);
      if (hasCurrentEnemyCorrectionSchema && saved.enemyGlobalAdditive && typeof saved.enemyGlobalAdditive === 'object') writeEnemyCorrectionInputs('additiveInputKey', saved.enemyGlobalAdditive);
      if (hasCurrentEnemyCorrectionSchema && saved.enemyResearchPreset && typeof saved.enemyResearchPreset === 'object') view.enemyResearchPreset = { level: Number(saved.enemyResearchPreset.level) || 0, progress: Number(saved.enemyResearchPreset.progress) || 0, dirty: !!saved.enemyResearchPreset.dirty };
      if (typeof saved.enemyPresetKey === 'string') view.enemyPresetKey = saved.enemyPresetKey;
      if (Number.isFinite(Number(saved.enemyPhaseIndex))) view.enemyPhaseIndex = Math.max(0, Number(saved.enemyPhaseIndex));
      if (Number.isFinite(Number(saved.enemySkillIndex))) view.enemySkillIndex = Number(saved.enemySkillIndex);
      if (typeof saved.selectedSkillCategory === 'string') view.selectedSkillCategory = saved.selectedSkillCategory;
      if (typeof saved.selectedSkillOptionKey === 'string') view.selectedSkillOptionKey = saved.selectedSkillOptionKey;
      if (saved.effectSources && typeof saved.effectSources === 'object') {
        view.effectSources = { ...view.effectSources, ...pickBooleanMap(saved.effectSources, Object.keys(view.effectSources)) };
      }
      if (saved.resultDisplays && typeof saved.resultDisplays === 'object') {
        view.resultDisplays = { ...view.resultDisplays, ...pickBooleanMap(saved.resultDisplays, Object.keys(view.resultDisplays)) };
      }
      if (saved.selfSkillEffectEnabled && typeof saved.selfSkillEffectEnabled === 'object') {
        view.selfSkillEffectEnabled = pickBooleanMap(saved.selfSkillEffectEnabled);
      }
      if (saved.conditionalEffectEnabled && typeof saved.conditionalEffectEnabled === 'object') {
        view.conditionalEffectEnabled = migrateCardEffectStateMap(pickBooleanMap(saved.conditionalEffectEnabled));
      }
      if (saved.conditionalEffectStackCounts && typeof saved.conditionalEffectStackCounts === 'object') {
        view.conditionalEffectStackCounts = migrateCardEffectStateMap(pickNumberMap(saved.conditionalEffectStackCounts));
      }
      if (saved.skillLevelOverrides && typeof saved.skillLevelOverrides === 'object') {
        view.skillLevelOverrides = sanitizeSkillLevelOverrides(saved.skillLevelOverrides);
      }
      view.tempSpells = Array.isArray(saved.tempSpells) ? saved.tempSpells.filter(Boolean).map(resolveCardIdAlias) : null;
      view.tempCardStates = sanitizeFdcTempCardStates(saved.tempCardStates);
      if (saved.extraCrayon && typeof saved.extraCrayon === 'object') {
        writeExtraCrayonInputs(saved.extraCrayon);
      }
    } catch (error) {
      console.warn('Failed to restore formation damage settings', error);
    }
  }

  function saveCalcSettings() {
    try {
      localStorage.setItem(CALC_SETTINGS_KEY, JSON.stringify({
        targetId: view.targetId || '',
        formationPresetId: view.formationPresetId || '',
        damageType: view.damageType || 'auto',
        enemyDamageType: view.enemyDamageType || 'auto',
        gradeOverride: view.gradeOverride || 'saved',
        statMode: view.statMode === 'planned' ? 'planned' : 'current',
        resultMetric: normalizeResultMetric(view.resultMetric),
        perspective: view.perspective === 'enemy' ? 'enemy' : 'self',
        mobileVisibleSide: view.mobileVisibleSide === 'enemy' ? 'enemy' : 'self',
        enemyPersonality: view.enemyPersonality || '',
        enemySourceMode: view.enemySourceMode === 'apostle' ? 'apostle' : 'preset',
        pvpAffinityEnabled: !!view.pvpAffinityEnabled,
        pvpRank: normalizePvpRank(view.pvpRank),
        enemyApostleId: view.enemyApostleId || '',
        enemyPresetKey: view.enemyPresetKey || '',
        enemySelectedSkillCategory: view.enemySelectedSkillCategory || '',
        enemyStatDirty: !!view.enemyStatDirty,
        enemyGlobalPercentDirty: !!view.enemyGlobalPercentDirty,
        enemyGlobalPercentEnabled: view.enemyGlobalPercentEnabled !== false,
        enemyGlobalAdditiveEnabled: view.enemyGlobalAdditiveEnabled !== false,
        enemyBoardPresetSelections: clonePlain(view.enemyBoardPresetSelections),
        enemyIndividualOverrides: clonePlain(view.enemyIndividualOverrides),
        enemyCorrectionSchema: 6,
        enemyRankPreset: normalizeEnemyRankPreset(view.enemyRankPreset),
        enemyGlobalPercent: readEnemyGlobalPercentInputs(),
        enemyGlobalAdditive: readEnemyCorrectionInputs('additiveInputKey'),
        enemyResearchPreset: clonePlain(view.enemyResearchPreset),
        enemyPhaseIndex: Number(view.enemyPhaseIndex) || 0,
        enemySkillIndex: Number.isFinite(Number(view.enemySkillIndex)) ? Number(view.enemySkillIndex) : -1,
        selectedSkillCategory: view.selectedSkillCategory || '',
        selectedSkillOptionKey: view.selectedSkillOptionKey || '',
        effectSources: pickBooleanMap(view.effectSources),
        resultDisplays: pickBooleanMap(view.resultDisplays),
        selfSkillEffectEnabled: pickBooleanMap(view.selfSkillEffectEnabled),
        conditionalEffectEnabled: pickBooleanMap(view.conditionalEffectEnabled),
        conditionalEffectStackCounts: pickNumberMap(view.conditionalEffectStackCounts),
        skillLevelOverrides: sanitizeSkillLevelOverrides(view.skillLevelOverrides),
        tempSpells: Array.isArray(view.tempSpells) ? view.tempSpells.slice() : null,
        tempCardStates: sanitizeFdcTempCardStates(view.tempCardStates),
        extraCrayon: readExtraCrayonInputs()
      }));
    } catch (error) {
      console.warn('Failed to save formation damage settings', error);
    }
  }

  function normalizeResultMetric(value) {
    return ['critRate', 'critDmg', 'defRate'].includes(value) ? value : 'critRate';
  }

  function pickBooleanMap(source = {}, allowedKeys = null) {
    const result = {};
    Object.entries(source || {}).forEach(([key, value]) => {
      if (allowedKeys && !allowedKeys.includes(key)) return;
      result[key] = !!value;
    });
    return result;
  }

  function pickNumberMap(source = {}) {
    const result = {};
    Object.entries(source || {}).forEach(([key, value]) => {
      const numeric = Number(value);
      if (key && Number.isFinite(numeric)) result[key] = numeric;
    });
    return result;
  }

  function sanitizeSkillLevelOverrides(source = {}) {
    const result = {};
    Object.entries(source || {}).forEach(([id, levels]) => {
      if (!id || !levels || typeof levels !== 'object') return;
      result[id] = {};
      Object.entries(levels).forEach(([key, value]) => {
        const numeric = Number(value);
        if (Number.isFinite(numeric)) result[id][key] = numeric;
      });
      if (!Object.keys(result[id]).length) delete result[id];
    });
    return result;
  }

  function getEffectiveStatState() {
    const current = loadStatState();
    if (!view.referenceState || typeof view.referenceState !== 'object') return applyFdcTempCardStates(current);
    const reference = clonePlain(view.referenceState);
    const options = view.referenceOptions || {};
    const next = {
      ...current,
      found: true,
      formation: reference.formation || current.formation || {},
      savedFormations: Array.isArray(reference.savedFormations) && reference.savedFormations.length
        ? reference.savedFormations
        : (current.savedFormations || [])
    };
    next.cards = options.cards ? (reference.cards || {}) : (current.cards || {});
    next.research = options.global ? (reference.research || {}) : (current.research || {});
    next.apostles = mergeReferenceApostleStates(current.apostles || {}, reference.apostles || {}, options);
    return applyFdcTempCardStates(next);
  }

  function applyFdcTempCardStates(state = {}) {
    const overrides = sanitizeFdcTempCardStates(view.tempCardStates);
    if (!Object.keys(overrides).length) return state;
    const next = { ...state, cards: { ...(state.cards || {}) } };
    Object.entries(overrides).forEach(([id, override]) => {
      const base = next.cards[id] && typeof next.cards[id] === 'object' ? next.cards[id] : {};
      next.cards[id] = { ...base, star: override.star, solder: override.solder };
    });
    return next;
  }

  function sanitizeFdcTempCardStates(source = {}) {
    const result = {};
    Object.entries(source || {}).forEach(([rawId, value]) => {
      const id = resolveCardIdAlias(rawId);
      if (!id || !getCard(id) || !value || typeof value !== 'object') return;
      const star = Math.max(1, Math.min(5, Number(value.star) || 1));
      result[id] = {
        star,
        solder: star >= 5 ? Math.max(0, Math.min(2, Number(value.solder) || 0)) : 0
      };
    });
    return result;
  }

  function mergeReferenceApostleStates(currentApostles = {}, referenceApostles = {}, options = {}) {
    const result = clonePlain(currentApostles || {});
    Object.entries(referenceApostles || {}).forEach(([id, savedState]) => {
      const currentState = result[id] && typeof result[id] === 'object' ? result[id] : {};
      if (options.apostles && options.global) {
        result[id] = clonePlain(savedState);
        return;
      }
      const nextState = { ...currentState };
      if (options.apostles) {
        Object.entries(savedState || {}).forEach(([key, value]) => {
          if (['boards', 'plannedBoards'].includes(key)) return;
          nextState[key] = clonePlain(value);
        });
      }
      if (options.global) {
        ['boards', 'plannedBoards', 'statSnapshots'].forEach(key => {
          if (savedState && Object.prototype.hasOwnProperty.call(savedState, key)) nextState[key] = clonePlain(savedState[key]);
        });
      }
      result[id] = nextState;
    });
    return result;
  }
  function loadStatState() {
    try {
      const raw = localStorage.getItem(STAT_STORAGE_KEY);
      if (!raw) return { found: false };
      const state = JSON.parse(raw);
      state.cards = migrateCardStateMap(state.cards);
      state.formation = normalizeFormation(state.formation || {});
      if (Array.isArray(state.savedFormations)) {
        state.savedFormations = state.savedFormations.map(item => ({
          ...item,
          formation: normalizeFormation(item?.formation || {})
        }));
      }
      return { ...state, found: true };
    } catch {
      return { found: false };
    }
  }

  function syncSelectedApostleToStatManager(id) {
    if (!id) return;
    try {
      const raw = localStorage.getItem(STAT_STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      if (!state || typeof state !== 'object') return;
      if (state.activeId === id) return;
      state.activeId = id;
      localStorage.setItem(STAT_STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent('trickcal-stat-active-apostle-sync', { detail: { id } }));
    } catch (error) {
      console.warn('Failed to sync selected apostle to stat manager', error);
    }
  }

  function normalizeFormation(formation = {}) {
    return {
      rows: Array.from({ length: 3 }, (_, rowIndex) => normalizeFormationRow(formation.rows?.[rowIndex])),
      spells: Array.isArray(formation.spells) ? formation.spells.filter(Boolean).map(resolveCardIdAlias) : [],
      masterPowers: normalizeFormationMasterPowers(formation.masterPowers || formation.masterPowerId)
    };
  }

  function normalizeFormationMasterPowers(value) {
    const powers = typeof TRICKCAL_STAT_DATA === 'undefined'
      ? []
      : (TRICKCAL_STAT_DATA?.sheets?.masterPowers || []);
    const validIds = new Set(powers.map(power => String(power.id || '')).filter(Boolean));
    const limits = powers
      .map(power => Number(power['最大選択数']))
      .filter(limit => Number.isFinite(limit) && limit > 0);
    const limit = Math.max(1, limits.length ? Math.max(...limits) : 1);
    const source = Array.isArray(value) ? value : (value ? [value] : []);
    return Array.from(new Set(source.map(String).filter(id => validIds.has(id)))).slice(0, limit);
  }

  function normalizeFormationRow(row = {}) {
    return {
      apostles: Array.from({ length: 3 }, (_, index) => row.apostles?.[index] || ''),
      artifacts: Array.from({ length: 3 }, (_, lineIndex) => {
        const line = row.artifacts?.[lineIndex];
        if (Array.isArray(line)) return Array.from({ length: 3 }, (_, index) => resolveCardIdAlias(line[index] || ''));
        return [resolveCardIdAlias(line || ''), '', ''];
      })
    };
  }

  function migrateTempArtifactOverrides(source) {
    const migrated = clonePlain(source || { formation: {}, target: {} });
    migrated.formation = Object.fromEntries(
      Object.entries(migrated.formation || {}).map(([key, id]) => [key, resolveCardIdAlias(id)])
    );
    migrated.target = Object.fromEntries(Object.entries(migrated.target || {}).map(([apostleId, slots]) => [
      apostleId,
      Object.fromEntries(Object.entries(slots || {}).map(([slot, id]) => [slot, resolveCardIdAlias(id)]))
    ]));
    return migrated;
  }

  function getFormationMembers(formation, state = {}) {
    return formation.rows.flatMap((row, rowIndex) =>
      row.apostles.map((id, lineIndex) => createMember(id, rowIndex, lineIndex, state, row.artifacts[lineIndex])).filter(Boolean)
    );
  }

  function getAllApostleMembers(state = {}) {
    const data = typeof TRICKCAL_STAT_DATA === 'undefined' ? null : TRICKCAL_STAT_DATA;
    return (data?.sheets?.basicInfo || []).map(row => createMember(row.id, getPreferredPositionIndex(row), null, state, [])).filter(Boolean);
  }

  function getPreferredPositionIndex(source = {}) {
    const position = source.position || source.配置列 || source.配列 || '';
    const index = POSITIONS.indexOf(position);
    return index >= 0 ? index : 1;
  }

  function createMember(id, rowIndex, lineIndex, state = {}, artifactIds = []) {
    const basic = getApostle(id);
    if (!id || !basic) return null;
    const apostleState = state.apostles?.[id] || {};
    const hasPlannedSnapshot = !!apostleState.statSnapshots?.planned;
    return {
      id,
      name: basic.使徒名 || id,
      position: POSITIONS[rowIndex],
      line: lineIndex == null ? null : lineIndex + 1,
      personality: basic.性格 || '',
      race: basic.種族 || '',
      role: basic.役割 || '',
      attackType: basic.攻撃タイプ || basic.攻撃Type || '',
      level: Number(apostleState.level) || 1,
      star: Number(apostleState.star) || Number(basic.レア度) || 1,
      grade: getDisplayGrade(apostleState),
      gradeOverride: getEffectiveGradeOverride(),
      statMode: view.statMode,
      hasPlannedSnapshot,
      rank: Number(apostleState.rank) || 1,
      stats: readMemberStats(apostleState, basic, getEffectiveGradeOverride(), view.statMode),
      artifactIds: getEffectiveMemberArtifactIds(id, artifactIds),
      managerSyncRevision: Math.max(0, Number(state.syncRevision) || 0),
      skillLevels: apostleState.skillLevels || apostleState.skills || {},
      asideRank: Number(apostleState.asideRank) || 0,
      asideLevel: Number(apostleState.asideLevel) || 0
    };
  }

  function getEffectiveMemberArtifactIds(id, artifactIds = []) {
    const base = Array.from({ length: 3 }, (_, index) => artifactIds?.[index] || '');
    const overrides = view.tempArtifacts.target?.[id] || {};
    Object.entries(overrides).forEach(([slot, artifactId]) => {
      const index = Number(slot);
      if (index >= 0 && index < 3) base[index] = artifactId || '';
    });
    return base;
  }

  function normalizeEnemyBoardPresetSelections(value = {}) {
    const validGroups = new Set(ENEMY_BOARD_PRESET_GROUPS.map(group => group.key));
    return Object.fromEntries([1, 2, 3].map(layer => [String(layer), Array.from(new Set(Array.isArray(value?.[layer]) ? value[layer] : []))
      .filter(group => validGroups.has(group))]));
  }

  function getEnemyBoardPresetStatKey(effectType) {
    const text = String(effectType || '').replace(/^全体/, '');
    if (text === 'HP' || text === '最大HP') return 'hp';
    if (text.includes('物理攻撃')) return 'patk';
    if (text.includes('魔法攻撃')) return 'matk';
    if (text.includes('物理防御')) return 'pdef';
    if (text.includes('魔法防御')) return 'mdef';
    if (text.includes('会心DMG抵抗')) return 'critDmgRes';
    if (text.includes('会心抵抗')) return 'critRes';
    if (text.includes('会心DMG') || text.includes('会心ダメージ')) return 'critDmg';
    if (text.includes('会心')) return 'crit';
    return '';
  }

  function getEnemyBoardPresetStatLabel(statKey) {
    return ({
      hp: 'HP',
      patk: '物理攻撃',
      matk: '魔法攻撃',
      pdef: '物理防御',
      mdef: '魔法防御',
      crit: '会心',
      critDmg: '会心DMG',
      critRes: '会心抵抗',
      critDmgRes: '会心DMG抵抗'
    })[statKey] || statKey;
  }
  function calculateEnemyBoardPresetBonuses(tileType) {
    const totals = Object.fromEntries(ENEMY_GLOBAL_PERCENT_CONFIG.map(config => [config.statKey, 0]));
    const rows = typeof TRICKCAL_STAT_DATA === 'undefined' ? [] : TRICKCAL_STAT_DATA?.sheets?.board || [];
    rows.forEach(row => {
      const layer = String(Number(row.ボード階層) || 0);
      if (row.マス_type !== tileType || !view.enemyBoardPresetSelections?.[layer]?.length) return;
      [['効果1_type', '効果1_value'], ['効果2_type', '効果2_value']].forEach(([typeKey, valueKey]) => {
        const statKey = getEnemyBoardPresetStatKey(row[typeKey]);
        const group = ENEMY_BOARD_PRESET_GROUPS.find(item => item.statKeys.includes(statKey));
        if (!statKey || !group || !view.enemyBoardPresetSelections[layer].includes(group.key)) return;
        totals[statKey] += Number(row[valueKey]) || 0;
      });
    });
    return totals;
  }

  function calculateEnemyBoardPresetRates() {
    return calculateEnemyBoardPresetBonuses('特殊');
  }

  function calculateEnemyResearchPreset(context) {
    const totals = Object.fromEntries(ENEMY_GLOBAL_PERCENT_CONFIG.map(config => [config.statKey, 0]));
    const race = context?.enemyMember?.race || '';
    const stage = Math.max(0, Math.min(10, Number(view.enemyResearchPreset?.level) || 0));
    const progress = Math.max(0, Math.min(45, Number(view.enemyResearchPreset?.progress) || 0));
    if (!race || !stage || !progress || typeof TRICKCAL_STAT_DATA === 'undefined') return totals;
    (TRICKCAL_STAT_DATA?.sheets?.research || []).forEach(row => {
      if (row.種族 !== race || !row.ステータス) return;
      const rowCount = Number(row.id) || 0;
      const maxStage = rowCount <= progress ? stage : stage - 1;
      if (maxStage <= 0) return;
      const statKey = getEnemyBoardPresetStatKey(row.ステータス);
      if (!statKey) return;
      for (let index = 1; index <= maxStage; index += 1) totals[statKey] += Number(row[`段階${index}`]) || 0;
    });
    return totals;
  }

  function sumEnemyCorrectionMaps(...maps) {
    return Object.fromEntries(ENEMY_GLOBAL_PERCENT_CONFIG.map(config => [config.statKey, maps.reduce((total, map) => total + (Number(map?.[config.statKey]) || 0), 0)]));
  }

  function normalizeEnemyRankPreset(value) {
    return ['rare3-rank9', 'all-rank9'].includes(value) ? value : 'current';
  }

  function calculateEnemyRankGlobalPreset(context, snapshot = getEnemyApostleStatSnapshot(context)) {
    const mode = normalizeEnemyRankPreset(view.enemyRankPreset);
    if (mode === 'current') return getCurrentEnemyRankGlobal(context, snapshot);
    const totals = Object.fromEntries(ENEMY_GLOBAL_PERCENT_CONFIG.map(config => [config.statKey, 0]));
    const data = typeof TRICKCAL_STAT_DATA === 'undefined' ? null : TRICKCAL_STAT_DATA;
    const basicById = new Map((data?.sheets?.basicInfo || []).map(row => [row.id, row]));
    (data?.sheets?.rankGlobalBonuses || []).forEach(row => {
      const basic = basicById.get(row.id);
      if (mode === 'rare3-rank9' && Number(basic?.レア度) !== 3) return;
      for (let rank = 1; rank < 9; rank += 1) {
        for (let index = 1; index <= 2; index += 1) {
          const statKey = getEnemyBoardPresetStatKey(row[`Rank${rank}to${rank + 1}_type${index}`]);
          if (statKey) totals[statKey] += Number(row[`Rank${rank}to${rank + 1}_value${index}`]) || 0;
        }
      }
    });
    return totals;
  }

  function calculateEnemyGlobalAdditivePreset(context) {
    const snapshot = getEnemyApostleStatSnapshot(context);
    return sumEnemyCorrectionMaps(
      calculateEnemyRankGlobalPreset(context, snapshot),
      calculateCurrentEnemyBoardGlobalAdditive(context),
      calculateEnemyResearchPreset(context)
    );
  }

  function syncEnemyResearchPresetFromState(context) {
    if (view.enemyResearchPreset?.dirty) return;
    view.enemyResearchPreset = {
      level: Math.max(0, Math.min(10, Number(context?.state?.research?.level) || 0)),
      progress: Math.max(0, Math.min(45, Number(context?.state?.research?.progress) || 0)),
      dirty: false
    };
  }

  function renderEnemyBoardPresetUi(context = buildContext()) {
    renderEnemyCorrectionEnabledUi();
    if (!el.enemyBoardPreset) return;
    view.enemyBoardPresetSelections = normalizeEnemyBoardPresetSelections(view.enemyBoardPresetSelections);
    const rows = el.enemyBoardPreset.querySelector('.fdc-enemy-board-preset-rows');
    if (rows) {
      rows.innerHTML = [1, 2, 3].map(layer => `
        <div class="fdc-enemy-board-preset-row">
          <b>B${layer}</b>
          <div>${ENEMY_BOARD_PRESET_GROUPS.map(group => `
            <button type="button" class="${view.enemyBoardPresetSelections[layer].includes(group.key) ? 'is-active' : ''}" data-fdc-board-preset-layer="${layer}" data-fdc-board-preset-group="${escapeAttr(group.key)}">${escapeHtml(group.label)}</button>
          `).join('')}</div>
        </div>
      `).join('');
    }
    if (el.enemyRankPreset) el.enemyRankPreset.value = normalizeEnemyRankPreset(view.enemyRankPreset);
    if (el.enemyResearchLevel) {
      if (!el.enemyResearchLevel.options.length) el.enemyResearchLevel.innerHTML = Array.from({ length: 11 }, (_, index) => `<option value="${index}">${index ? `${index}段階` : 'OFF'}</option>`).join('');
      el.enemyResearchLevel.value = String(view.enemyResearchPreset?.level || 0);
    }
    if (el.enemyResearchProgress) {
      if (!el.enemyResearchProgress.options.length) el.enemyResearchProgress.innerHTML = Array.from({ length: 46 }, (_, index) => `<option value="${index}">${index ? `${index}回目` : 'OFF'}</option>`).join('');
      el.enemyResearchProgress.value = String(view.enemyResearchPreset?.progress || 0);
    }
  }
  function renderEnemyCorrectionEnabledUi() {
    const percentEnabled = view.enemyGlobalPercentEnabled !== false;
    const additiveEnabled = view.enemyGlobalAdditiveEnabled !== false;
    if (el.enemyGlobalPercentEnabled) el.enemyGlobalPercentEnabled.checked = percentEnabled;
    if (el.enemyGlobalAdditiveEnabled) el.enemyGlobalAdditiveEnabled.checked = additiveEnabled;
    el.enemyGlobalPercentGroup?.classList.toggle('is-disabled', !percentEnabled);
    el.enemyGlobalAdditiveGroup?.classList.toggle('is-disabled', !additiveEnabled);
  }
  function getEnemyCorrectionInputKeys() {
    return ENEMY_GLOBAL_PERCENT_CONFIG.flatMap(({ inputKey, additiveInputKey }) => [inputKey, additiveInputKey].filter(Boolean));
  }

  function readEnemyCorrectionInputs(configKey) {
    return Object.fromEntries(ENEMY_GLOBAL_PERCENT_CONFIG
      .filter(config => config[configKey])
      .map(config => [config.statKey, readNumber(el.inputs[config[configKey]])]));
  }

  function readEnemyCorrectionSourceValue(values = {}, config = {}) {
    return Number(values?.[config.statKey] ?? values?.[config.memberKey]) || 0;
  }

  function writeEnemyCorrectionInputs(configKey, values = {}) {
    ENEMY_GLOBAL_PERCENT_CONFIG.forEach(config => {
      const inputKey = config[configKey];
      if (inputKey && el.inputs[inputKey]) el.inputs[inputKey].value = formatPlainNumber(readEnemyCorrectionSourceValue(values, config));
    });
  }

  function readEnemyGlobalPercentInputs() {
    return readEnemyCorrectionInputs('inputKey');
  }

  function writeEnemyGlobalPercentInputs(values = {}) {
    writeEnemyCorrectionInputs('inputKey', values);
  }

  function calculateCurrentEnemyBoardGlobalAdditive(context) {
    const totals = Object.fromEntries(ENEMY_GLOBAL_PERCENT_CONFIG.map(config => [config.statKey, 0]));
    const rows = typeof TRICKCAL_STAT_DATA === 'undefined' ? [] : TRICKCAL_STAT_DATA?.sheets?.board || [];
    rows.forEach(row => {
      if (row.マス_type !== '上級') return;
      const apostleState = context?.state?.apostles?.[row.id] || {};
      const boards = view.statMode === 'planned' ? apostleState.plannedBoards || apostleState.boards || {} : apostleState.boards || {};
      const layer = String(Number(row.ボード階層) || 0);
      const key = `${row.ボード階層}:${row.X_pos}:${row.Y_pos}`;
      if (!boards?.[layer]?.filled?.[key]) return;
      [['効果1_type', '効果1_value'], ['効果2_type', '効果2_value']].forEach(([typeKey, valueKey]) => {
        const statKey = getEnemyBoardPresetStatKey(row[typeKey]);
        if (statKey) totals[statKey] += Number(row[valueKey]) || 0;
      });
    });
    return totals;
  }

  function calculateBoardPlanEffectDelta(context, tileType) {
    const totals = Object.fromEntries(ENEMY_GLOBAL_PERCENT_CONFIG.map(config => [config.statKey, 0]));
    const rows = typeof TRICKCAL_STAT_DATA === 'undefined' ? [] : TRICKCAL_STAT_DATA?.sheets?.board || [];
    rows.forEach(row => {
      if (row.マス_type !== tileType) return;
      const id = String(row.id || '');
      const apostleState = context?.state?.apostles?.[id]
        || context?.state?.apostles?.[row.id]
        || {};
      const currentBoards = apostleState.boards || {};
      const plannedBoards = apostleState.plannedBoards || currentBoards;
      const layer = String(Number(row.ボード階層) || 0);
      const key = String(row.ボード階層) + ':' + row.X_pos + ':' + row.Y_pos;
      const currentFilled = !!currentBoards?.[layer]?.filled?.[key];
      const plannedFilled = !!plannedBoards?.[layer]?.filled?.[key];
      const direction = Number(plannedFilled) - Number(currentFilled);
      if (!direction) return;
      [['効果1_type', '効果1_value'], ['効果2_type', '効果2_value']].forEach(([typeKey, valueKey]) => {
        const statKey = getEnemyBoardPresetStatKey(row[typeKey]);
        if (statKey) totals[statKey] += (Number(row[valueKey]) || 0) * direction;
      });
    });
    return totals;
  }

  function formatBoardPlanEffectDelta(values = {}, suffix = '') {
    const labels = {
      hp: 'HP',
      patk: '物攻',
      matk: '魔攻',
      pdef: '物防',
      mdef: '魔防',
      crit: '会心',
      critDmg: '会心DMG',
      critRes: '会心抵抗',
      critDmgRes: '会心DMG抵抗'
    };
    return ENEMY_GLOBAL_PERCENT_CONFIG
      .map(({ statKey }) => [labels[statKey] || statKey, Number(values[statKey]) || 0])
      .filter(([, value]) => value)
      .map(([label, value]) => label + (value > 0 ? '+' : '') + formatPlainNumber(value) + suffix)
      .join(' / ');
  }

  function renderBoardPlanBonus(context) {
    if (!el.boardPlanBonus) return;
    const planned = view.statMode === 'planned';
    el.boardPlanBonus.hidden = !planned;
    if (!planned) return;
    const hasPlan = Object.values(context?.state?.apostles || {}).some(apostle => (
      apostle?.plannedBoards && typeof apostle.plannedBoards === 'object'
    ));
    if (!hasPlan) {
      if (el.boardPlanSpecial) el.boardPlanSpecial.textContent = '予定なし';
      if (el.boardPlanAdvanced) el.boardPlanAdvanced.textContent = '予定なし';
      return;
    }
    const special = formatBoardPlanEffectDelta(calculateBoardPlanEffectDelta(context, '特殊'), '%');
    const advanced = formatBoardPlanEffectDelta(calculateBoardPlanEffectDelta(context, '上級'));
    if (el.boardPlanSpecial) el.boardPlanSpecial.textContent = special || '変化なし';
    if (el.boardPlanAdvanced) el.boardPlanAdvanced.textContent = advanced || '変化なし';
  }

  function calculateEnemyApostleRankGlobal(id, rankValue) {
    const totals = Object.fromEntries(ENEMY_GLOBAL_PERCENT_CONFIG.map(config => [config.statKey, 0]));
    const rows = typeof TRICKCAL_STAT_DATA === 'undefined' ? [] : TRICKCAL_STAT_DATA?.sheets?.rankGlobalBonuses || [];
    const row = rows.find(item => item.id === id);
    const rank = Math.max(1, Math.min(10, Number(rankValue) || 1));
    if (!row) return totals;
    for (let rankFrom = 1; rankFrom < rank; rankFrom += 1) {
      for (let index = 1; index <= 2; index += 1) {
        const statKey = getEnemyBoardPresetStatKey(row[`Rank${rankFrom}to${rankFrom + 1}_type${index}`]);
        if (statKey) totals[statKey] += Number(row[`Rank${rankFrom}to${rankFrom + 1}_value${index}`]) || 0;
      }
    }
    return totals;
  }

  function getCurrentEnemyRankGlobal(context, snapshot = null) {
    const hasSavedRankGlobal = Object.prototype.hasOwnProperty.call(snapshot?.breakdown || {}, 'rankGlobal');
    const saved = hasSavedRankGlobal
      ? snapshot.breakdown.rankGlobal || {}
      : (typeof TRICKCAL_STAT_DATA === 'undefined' ? [] : TRICKCAL_STAT_DATA?.sheets?.rankGlobalBonuses || [])
        .reduce((totals, row) => sumEnemyCorrectionMaps(
          totals,
          calculateEnemyApostleRankGlobal(row.id, context?.state?.apostles?.[row.id]?.rank || 1)
        ), {});
    const id = context?.enemyMember?.id || view.enemyApostleId;
    if (!id) return saved;
    const managerRank = Number(context?.state?.apostles?.[id]?.rank) || 1;
    const individualRank = Number(getEnemyIndividualOverride(context, id)?.rank ?? managerRank) || managerRank;
    const managerContribution = calculateEnemyApostleRankGlobal(id, managerRank);
    const individualContribution = calculateEnemyApostleRankGlobal(id, individualRank);
    return Object.fromEntries(ENEMY_GLOBAL_PERCENT_CONFIG.map(config => [
      config.statKey,
      (Number(saved?.[config.statKey]) || 0)
        - (Number(managerContribution?.[config.statKey]) || 0)
        + (Number(individualContribution?.[config.statKey]) || 0)
    ]));
  }

  function getSavedEnemyGlobalAdditive(context, snapshot = getEnemyApostleStatSnapshot(context)) {
    return sumEnemyCorrectionMaps(
      getCurrentEnemyRankGlobal(context, snapshot),
      calculateCurrentEnemyBoardGlobalAdditive(context),
      snapshot?.breakdown?.research || {}
    );
  }
  function syncEnemyGlobalPercentInputs(context) {
    if (view.enemySourceMode !== 'apostle' || view.enemyGlobalPercentDirty) return;
    const snapshot = getEnemyApostleStatSnapshot(context);
    writeEnemyCorrectionInputs('inputKey', snapshot?.globalPercentRates || {});
    writeEnemyCorrectionInputs('additiveInputKey', getSavedEnemyGlobalAdditive(context, snapshot));
  }

  function getEnemyApostleStatSnapshot(context) {
    const member = context?.enemyMember;
    if (!member) return null;
    const apostleState = context?.state?.apostles?.[member.id] || {};
    const basic = getApostle(member.id);
    const override = getEnemyIndividualOverride(context, member.id) || normalizeEnemyIndividualSettings({}, context, member.id);
    if (typeof TRICKCAL_SHARED_STAT_ENGINE === 'undefined' || typeof TRICKCAL_SHARED_STAT_ENGINE.applyApostleOverridesToSnapshot !== 'function') {
      return getGradeAdjustedSnapshot(apostleState, basic, getEffectiveGradeOverride(), view.statMode);
    }
    const snapshot = getGradeAdjustedSnapshot(apostleState, basic, 'saved', view.statMode);
    return TRICKCAL_SHARED_STAT_ENGINE.applyApostleOverridesToSnapshot(
      TRICKCAL_STAT_DATA,
      basic,
      apostleState,
      { snapshot, mode: view.statMode, overrides: override, kind: 'enemyIndividualOverride' }
    );
  }

  function getEnemyStatsWithGlobalPercentOverrides(context, member) {
    const snapshot = getEnemyApostleStatSnapshot(context);
    const raw = snapshot?.stats;
    if (!raw) return member?.stats || {};
    const breakdown = snapshot?.breakdown || {};
    const increases = breakdown.globalPercent || {};
    const savedRates = snapshot?.globalPercentRates || {};
    const savedGlobalAdditive = getSavedEnemyGlobalAdditive(context, snapshot);
    const stats = { ...(member?.stats || {}) };
    ENEMY_GLOBAL_PERCENT_CONFIG.forEach(({ inputKey, additiveInputKey, statKey, memberKey, aliases }) => {
      const finalValue = Number(readStatValue(raw, aliases)) || 0;
      const savedRate = Number(savedRates[statKey] ?? savedRates[memberKey]) || 0;
      let beforePercent = finalValue;
      if (Object.prototype.hasOwnProperty.call(increases, statKey)) {
        beforePercent = Math.max(0, finalValue - (Number(increases[statKey]) || 0));
      } else if (savedRate) {
        beforePercent = Math.max(0, Math.round(finalValue / (1 + savedRate / 100)));
      }
      const additiveBase = Number(savedGlobalAdditive[statKey]) || 0;
      const editedGlobalAdditive = view.enemyGlobalAdditiveEnabled === false
        ? 0
        : additiveInputKey ? readNumber(el.inputs[additiveInputKey]) : additiveBase;
      const editedAdditive = Math.max(0, beforePercent - additiveBase + editedGlobalAdditive);
      const editedRate = view.enemyGlobalPercentEnabled === false ? 0 : readNumber(el.inputs[inputKey]);
      stats[memberKey] = editedAdditive + Math.floor(editedAdditive * editedRate / 100);
    });
    return stats;
  }

  function isEnemyCorrectionInput(input) {
    return getEnemyCorrectionInputKeys().some(inputKey => el.inputs[inputKey] === input);
  }

  function syncStatsFromEnemyApostle(context) {
    if (view.enemySourceMode !== 'apostle' || view.enemyStatDirty) return;
    const member = context?.enemyMember;
    if (!member) {
      getEnemyCorrectionInputKeys().forEach(inputKey => {
        if (el.inputs[inputKey]) el.inputs[inputKey].value = 0;
      });
      el.inputs.enemyHp.value = 0;
      el.inputs.enemyAtk.value = 0;
      el.inputs.enemyCrit.value = 0;
      el.inputs.enemyCritDmg.value = 0;
      el.inputs.def.value = 1;
      el.inputs.critRes.value = 1;
      el.inputs.critDmgRes.value = 1;
      return;
    }
    const stats = getEnemyStatsWithGlobalPercentOverrides(context, member);
    const enemyDamageType = resolveEnemyDamageType();
    const selfDamageType = resolveSelfDamageType(context?.target);
    el.inputs.enemyHp.value = Math.round(Number(stats.hp) || 0);
    el.inputs.enemyAtk.value = Math.round(Number(enemyDamageType === 'magic' ? stats.magicAtk : stats.physicalAtk) || 0);
    el.inputs.enemyCrit.value = Math.round(Number(stats.crit) || 0);
    el.inputs.enemyCritDmg.value = Math.round(Number(stats.critDmg) || 0);
    el.inputs.def.value = Math.round(Number(selfDamageType === 'magic' ? stats.magicDef : stats.physicalDef) || 1);
    el.inputs.critRes.value = Math.round(Number(stats.critRes) || 1);
    el.inputs.critDmgRes.value = Math.round(Number(stats.critDmgRes) || 1);
  }

  function syncStatsFromTarget(context) {
    if (view.statDirty || !context.target) return;
    const stats = context.target.stats || {};
    const atk = context.damageType === 'magic' ? stats.magicAtk : stats.physicalAtk;
    const def = context.damageType === 'magic' ? stats.magicDef : stats.physicalDef;
    el.inputs.selfHp.value = Math.round(Number(stats.hp) || 0);
    el.inputs.atk.value = Math.round(Number(atk) || 0);
    el.inputs.selfDef.value = Math.round(Number(def) || 1);
    el.inputs.crit.value = Math.round(Number(stats.crit) || 0);
    el.inputs.critDmg.value = Math.round(Number(stats.critDmg) || 0);
    el.inputs.selfCritResBase.value = Math.round(Number(stats.critRes) || 1);
    el.inputs.selfCritDmgResBase.value = Math.round(Number(stats.critDmgRes) || 1);
  }

  function renderFormationPresetLoader(context) {
    if (!el.formationPreset) return;
    const presets = getSavedFormationPresets(context.state);
    const currentLabel = context.state?.activeFormationPresetId
      ? '編集中の編成（保存編成を読込中）'
      : '編集中の編成';
    const options = [
      `<option value="">${escapeHtml(currentLabel)}</option>`,
      ...presets
        .slice()
        .sort((a, b) => {
          const favoriteDiff = (a.favoriteSlot || 99) - (b.favoriteSlot || 99);
          if (favoriteDiff !== 0) return favoriteDiff;
          return String(a.name || '').localeCompare(String(b.name || ''), 'ja');
        })
        .map(preset => {
          const prefix = preset.favoriteSlot ? `${preset.favoriteSlot}. ` : '';
          const tags = preset.tags?.length ? ` / ${preset.tags.join('・')}` : '';
          const memberCount = countFormationMembers(preset.formation);
          return `<option value="${escapeAttr(preset.id)}">${escapeHtml(`${prefix}${preset.name} (${memberCount}人)${tags}`)}</option>`;
        })
    ].join('');
    if (el.formationPreset.innerHTML !== options) {
      el.formationPreset.innerHTML = options;
    }
    el.formationPreset.value = presets.some(preset => preset.id === view.formationPresetId) ? view.formationPresetId : '';
  }

  function countFormationMembers(formation = {}) {
    return normalizeFormation(formation).rows
      .flatMap(row => row.apostles || [])
      .filter(Boolean).length;
  }

  function renderTarget(context) {
    const target = context.target;
    if (!target) {
      el.targetPreview.className = 'fdc-target-preview';
      el.targetPreview.innerHTML = '<span class="fdc-target-empty">編成から使徒を選択</span>';
      renderFloatingTarget(null, context);
      return;
    }
    el.targetPreview.className = `fdc-target-preview is-filled personality-${target.personality || ''}`;
    el.targetPreview.title = `${target.name} / ${[target.position, normalizeRole(target.role), formatDamageType(context.damageType), formatStatModeLabel(target), formatGradeLabel(target)].filter(Boolean).join(' / ')}`;
    el.targetPreview.setAttribute('aria-expanded', String(!el.formationPicker?.hidden));
    el.targetPreview.innerHTML = `
      <span class="fdc-target-portrait">
        <img src="${escapeAttr(getApostleImage(target.id, target.name))}" alt="" data-fallback>
        ${renderApostleBadges(target)}
        <span class="fdc-target-grade-icons" title="${escapeAttr(formatGradeLabel(target))}">${renderGradeIcons(target.grade)}</span>
      </span>
    `;
    renderFloatingTarget(target, context);
    updateFloatingTargetVisibility();
  }

  function renderFloatingTarget(target, context) {
    if (!el.floatingTarget) return;
    if (!target) {
      el.floatingTarget.className = 'fdc-floating-target';
      el.floatingTarget.innerHTML = '';
      el.floatingTarget.title = '使徒を選択';
      updateFloatingTargetVisibility();
      return;
    }
    el.floatingTarget.className = `fdc-floating-target is-filled personality-${target.personality || ''}`;
    el.floatingTarget.title = 'クリックで使徒選択';
    el.floatingTarget.innerHTML = `
      <span class="fdc-floating-target-portrait">
        <img src="${escapeAttr(getApostleImage(target.id, target.name))}" alt="" data-fallback>
        ${renderApostleBadges(target)}
      </span>
    `;
  }

  function updateFloatingTargetVisibility() {
    if (!el.floatingTarget) return;
    const previewBottom = el.targetPreview?.getBoundingClientRect?.().bottom ?? 0;
    const shouldShow = !!view.targetId && window.scrollY > 180 && previewBottom < 18;
    el.floatingTarget.hidden = !shouldShow;
    el.floatingTarget.classList.toggle('is-visible', shouldShow);
  }

  function renderGradeIcons(grade) {
    const safeGrade = Math.max(1, Math.min(6, Number(grade) || 1));
    const icon = safeGrade >= 6 ? '学年_2.webp' : '学年_1.webp';
    return `<span class="grade-icon-set ${safeGrade >= 6 ? 'is-grade-max' : ''}">${Array.from({ length: safeGrade }, () => `<img src="img/${escapeAttr(icon)}" alt="">`).join('')}</span>`;
  }

  function renderFormationPicker(context) {
    if (!el.formationPicker) return;
    const pendingMember = getPendingTempMember(context);
    const body = view.pickerMode === 'all' && !pendingMember
      ? renderAllApostlePicker(context)
      : Array.from({ length: 3 }, (_, lineIndex) => `
        <div class="fdc-picker-row" data-line="${lineIndex}">
          ${POSITIONS.map((position, rowIndex) => {
            const member = context.members.find(item => item.line === lineIndex + 1 && item.position === position);
            return renderFormationPickerSlot(member, rowIndex, lineIndex, pendingMember, context.state?.cards);
          }).join('')}
        </div>
      `).join('');
    el.formationPicker.innerHTML = `
      <div class="fdc-picker-head">
        <div class="fdc-picker-tabs">
          <button type="button" class="${view.pickerMode === 'formation' ? 'is-active' : ''}" data-fdc-picker-mode="formation">編成</button>
          <button type="button" class="${view.pickerMode === 'all' ? 'is-active' : ''}" data-fdc-picker-mode="all">一覧</button>
        </div>
        <button type="button" class="fdc-picker-close" data-fdc-picker-close aria-label="使徒選択を閉じる">${renderUiIcon('close')}</button>
      </div>
      ${pendingMember ? renderPendingTempMemberNotice(pendingMember) : ''}
      <div class="fdc-picker-body ${view.pickerMode === 'all' ? 'is-all' : 'is-formation'}">${body}</div>
    `;
    el.formationPicker.querySelector('[data-fdc-picker-close]')?.addEventListener('click', closeFormationPicker);
    el.formationPicker.querySelectorAll('[data-fdc-picker-mode]').forEach(button => {
      button.addEventListener('click', () => {
        view.pendingTempMemberId = '';
        view.pickerMode = button.dataset.fdcPickerMode || 'formation';
        renderFormationPicker(buildContext());
      });
    });
    el.formationPicker.querySelector('[data-fdc-picker-search]')?.addEventListener('input', event => {
      const value = event.currentTarget.value || '';
      view.pickerSearch = value;
      renderFormationPicker(buildContext());
      const nextInput = el.formationPicker.querySelector('[data-fdc-picker-search]');
      nextInput?.focus();
      nextInput?.setSelectionRange?.(value.length, value.length);
    });
    el.formationPicker.querySelector('[data-fdc-picker-sort]')?.addEventListener('change', event => {
      view.pickerSort = event.currentTarget.value || 'name';
      renderFormationPicker(buildContext());
    });
    el.formationPicker.querySelectorAll('[data-fdc-picker-filter]').forEach(select => {
      select.addEventListener('change', event => {
        const key = event.currentTarget.dataset.fdcPickerFilter || '';
        if (key && Object.prototype.hasOwnProperty.call(view.pickerFilters, key)) {
          view.pickerFilters[key] = event.currentTarget.value || '';
        }
        renderFormationPicker(buildContext());
      });
    });
    el.formationPicker.querySelector('[data-fdc-temp-member-cancel]')?.addEventListener('click', () => {
      view.pendingTempMemberId = '';
      view.pickerMode = 'all';
      renderFormationPicker(buildContext());
    });
    el.formationPicker.querySelectorAll('[data-fdc-temp-member-slot]').forEach(button => {
      button.addEventListener('click', event => {
        if (!view.pendingTempMemberId) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        applyPendingTempMemberToSlot(button.dataset.fdcTempMemberSlot || '', buildContext());
        view.statDirty = false;
        el.formationPicker.hidden = true;
        el.formationPicker.classList.remove('is-floating-picker');
        render();
      });
    });
    el.formationPicker.querySelectorAll('[data-fdc-member-id]').forEach(button => {
      button.addEventListener('click', () => {
        if (view.pendingTempMemberId) return;
        const result = selectMemberFromPicker(button.dataset.fdcMemberId || '', context);
        view.statDirty = false;
        if (result === 'placement') {
          renderFormationPicker(buildContext());
          return;
        }
        el.formationPicker.hidden = true;
        el.formationPicker.classList.remove('is-floating-picker');
        render();
      });
    });
  }

  function selectMemberFromPicker(id, context) {
    if (!id) return '';
    const existingMember = context.members.find(member => member.id === id);
    if (existingMember || view.pickerMode !== 'all') {
      view.targetId = id;
      syncSelectedApostleToStatManager(id);
      applyEnemyPreset();
      saveCalcSettings();
      return 'selected';
    }
    const candidate = context.allMembers.find(member => member.id === id);
    if (!candidate) {
      view.targetId = id;
      syncSelectedApostleToStatManager(id);
      applyEnemyPreset();
      saveCalcSettings();
      return 'selected';
    }
    view.pendingTempMemberId = id;
    view.pickerMode = 'formation';
    return 'placement';
  }

  function getPendingTempMember(context) {
    return view.pendingTempMemberId
      ? context.allMembers.find(member => member.id === view.pendingTempMemberId) || null
      : null;
  }

  function renderPendingTempMemberNotice(member) {
    return `
      <div class="fdc-picker-placement">
        <span><strong>${escapeHtml(member.name)}</strong> の配置先を選択</span>
        <small>${escapeHtml(member.position || '')}のみ</small>
        <button type="button" data-fdc-temp-member-cancel>キャンセル</button>
      </div>
    `;
  }

  function applyPendingTempMemberToSlot(slotKey, context) {
    const member = getPendingTempMember(context);
    if (!member || !slotKey) return;
    const [rowIndex, lineIndex] = slotKey.split(':').map(Number);
    if (rowIndex !== getPreferredPositionIndex(member)) return;
    view.tempMembers[`${rowIndex}:${lineIndex}`] = member.id;
    view.targetId = member.id;
    view.pendingTempMemberId = '';
    syncSelectedApostleToStatManager(member.id);
    applyEnemyPreset();
    saveCalcSettings();
  }

  function renderSelfSkillChoices(context) {
    if (!el.selfSkillChoices) return;
    if (view.perspective === 'enemy') {
      el.selfSkillChoices.hidden = true;
      el.selfSkillChoices.innerHTML = '';
      return;
    }
    el.selfSkillChoices.hidden = false;
    const target = context.target;
    if (!target) {
      el.selfSkillChoices.innerHTML = '<div class="fdc-skill-choice-empty">使徒を選択するとスキル候補を表示します</div>';
      return;
    }
    const levelConfig = getFdcEffectiveSkillLevels(target);
    const options = buildFdcApostleSkillOptions(target, context);
    if (!options.length) {
      el.selfSkillChoices.innerHTML = `
        ${renderFdcSkillLevelControls(target, levelConfig)}
        <div class="fdc-skill-choice-empty">表示できる攻撃倍率がありません</div>
      `;
      bindFdcSkillLevelControls(target);
      return;
    }
    let current = readNumber(el.inputs.selfSkill);
    const selectedOptionByKey = view.selectedSkillOptionKey
      ? options.find(option => option.key === view.selectedSkillOptionKey)
      : null;
    if (view.selectedSkillOptionKey && !selectedOptionByKey) view.selectedSkillOptionKey = '';
    const selectedOption = selectedOptionByKey || (view.selectedSkillCategory
      ? options.find(option => option.category === view.selectedSkillCategory)
      : null);
    if (selectedOption && el.inputs.selfSkill) {
      current = Number(selectedOption.value) || current;
      el.inputs.selfSkill.value = String(selectedOption.value);
    }
    el.selfSkillChoices.innerHTML = `
      ${renderFdcSkillLevelControls(target, levelConfig)}
      <div class="fdc-skill-choice-header">
        <span>行動</span>
        <span>倍率</span>
        <span>値の種類</span>
        <span></span>
      </div>
      ${options.map(option => {
        const sourceCategory = option.sourceCategory || option.category;
        const classificationLabel = getFdcApostleSkillClassificationLabel(option);
        return `
        <button type="button" class="fdc-skill-choice ${(view.selectedSkillOptionKey ? view.selectedSkillOptionKey === option.key : Math.abs(Number(option.value) - current) < 0.001 && view.selectedSkillCategory === option.category) ? 'is-active' : ''}" data-fdc-skill-value="${escapeAttr(option.value)}" data-fdc-skill-category="${escapeAttr(option.category)}" data-fdc-skill-key="${escapeAttr(option.key)}">
          <span class="fdc-skill-choice-action-cell">
            <span class="fdc-skill-choice-action ${escapeAttr(getFdcApostleSkillTone(sourceCategory))}">${escapeHtml(getFdcApostleSkillActionLabel(sourceCategory))}</span>
            ${classificationLabel ? `<small class="fdc-skill-choice-classification" title="${escapeAttr(`攻撃分類: ${classificationLabel}`)}">分類: ${escapeHtml(classificationLabel)}</small>` : ''}
          </span>
          <span class="fdc-skill-choice-mult">${escapeHtml(formatPlainNumber(option.value))}%</span>
          <span class="fdc-skill-choice-kind" title="${escapeAttr(option.detailText || '')}">${escapeHtml([option.kind, option.shortDetail].filter(Boolean).join(' / '))}</span>
          <span class="fdc-skill-choice-info" data-fdc-skill-info="${escapeAttr(option.key)}" title="詳細">i</span>
        </button>
      `;
      }).join('')}
    `;
    const optionsByKey = new Map(options.map(option => [option.key, option]));
    el.selfSkillChoices.querySelectorAll('[data-fdc-skill-value]').forEach(button => {
      button.addEventListener('click', event => {
        if (event.target.closest('.fdc-skill-choice-info')) return;
        el.inputs.selfSkill.value = button.dataset.fdcSkillValue || '100';
        const nextSkillCategory = button.dataset.fdcSkillCategory || '';
        view.selfSkillEffectEnabled = {};
        view.selectedSkillCategory = nextSkillCategory;
        view.selectedSkillOptionKey = button.dataset.fdcSkillKey || '';
        el.selfSkillChoices.querySelectorAll('.fdc-skill-choice').forEach(row => row.classList.remove('is-active'));
        button.classList.add('is-active');
        saveCalcSettings();
        const context = buildContext();
        syncWeaknessFields(context.damageType);
        renderResult(context);
        renderSelfSkillEffects(context);
        renderArtifactCategory(context);
        renderSynergyCategory(context);
        renderSpellCategory(context);
      });
    });
    el.selfSkillChoices.querySelectorAll('[data-fdc-skill-info]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const option = optionsByKey.get(button.dataset.fdcSkillInfo || '');
        if (option) showFdcSkillPopover(button, option, target, context);
      });
    });
    bindFdcSkillLevelControls(target);
  }

  function showFdcSkillPopover(anchor, option, target = null, context = null) {
    const lines = [
      option.skillName ? `スキル名: ${option.skillName}` : '',
      option.label ? `候補: ${option.label}` : '',
      option.sourceCategory ? `由来行動: ${option.sourceCategory}` : '',
      option.attackCategory ? `攻撃分類: ${getFdcApostleSkillClassificationLabel(option) || option.attackCategory}` : '',
      option.sourceLabel && option.sourceLabel !== '通常' ? `由来: ${option.sourceLabel}` : '',
      option.cooldownSeconds ? `クールタイム: ${formatPlainNumber(option.cooldownSeconds)}秒` : '',
      option.detailText || '',
      ...getFdcLowSkillSpInfoLines(option, target, context)
    ].filter(Boolean);
    showFdcInfoPopover(anchor, option.sourceCategory || option.category || 'スキル詳細', lines);
  }

  function getFdcLowSkillSpInfoLines(option, target, context = null) {
    if (getFdcSkillBaseCategory(option?.sourceCategory || option?.category) !== '低学年スキル') return [];
    if (!target || typeof TRICKCAL_SP_ENGINE === 'undefined') return [];
    const apostle = getApostleSkillData(target) || getApostle(target.id) || {};
    const baseState = TRICKCAL_SP_ENGINE.createApostleState(apostle, target.stats || {}, {
      requiredSp: option.requiredSp
    });
    const cardTiming = getFdcSpCardTiming(context, baseState);
    const state = TRICKCAL_SP_ENGINE.createState({
      ...baseState,
      initialSp: cardTiming.initialSp,
      spRegen: cardTiming.spRegen
    });
    const slowCycle = TRICKCAL_SP_ENGINE.getCycleWithEvents(state, cardTiming.minEvents);
    const fastCycle = TRICKCAL_SP_ENGINE.getCycleWithEvents(state, cardTiming.maxEvents);
    const formatWait = seconds => {
      if (!Number.isFinite(seconds)) return '自然回復では発動不可';
      if (seconds <= 0) return '戦闘開始時';
      return `${formatPlainNumber(seconds)}秒後`;
    };
    const formatWaitRange = (slowSeconds, fastSeconds, suffix = '') => {
      if (!Number.isFinite(slowSeconds) && !Number.isFinite(fastSeconds)) return '自然回復では発動不可';
      const values = [slowSeconds, fastSeconds].filter(Number.isFinite).sort((a, b) => a - b);
      if (!values.length) return '自然回復では発動不可';
      if (Math.abs(values[0] - values[values.length - 1]) < 0.001) {
        return suffix ? `${formatPlainNumber(values[0])}${suffix}` : formatWait(values[0]);
      }
      return `${formatPlainNumber(values[0])}～${formatPlainNumber(values[values.length - 1])}${suffix || '秒後'}`;
    };
    return [
      `SP条件: ${formatPlainNumber(state.requiredSp)}（初期${formatPlainNumber(state.initialSp)} / 1秒ごと+${formatPlainNumber(state.spRegen)}）`,
      cardTiming.summaryText ? `SP補正: ${cardTiming.summaryText}` : '',
      `初回発動まで: ${formatWaitRange(slowCycle.firstReadySeconds, fastCycle.firstReadySeconds)}`,
      `次回発動まで: ${formatWaitRange(slowCycle.refillSeconds, fastCycle.refillSeconds, '秒')}`,
      cardTiming.manualText ? `${cardTiming.manualText}は使用時刻未指定のため除外` : '',
      'SP反映内訳',
      ...cardTiming.detailLines
    ];
  }

  function getFdcSpCardTiming(context, baseState) {
    const candidateRows = [
      ...(context?.effects?.conditional || []),
      ...(context?.effects?.applied || [])
    ];
    const allRows = candidateRows.filter(row => (
      isEffectSourceEnabled(row)
      && !/対象外/.test(String(row?.reason || ''))
      && (!row?.canToggle || isConditionalEffectEnabled(row.conditionKey, row.defaultEnabled))
    ));
    const uniqueRows = new Map();
    allRows.forEach(row => {
      const key = row.conditionKey || [row.source, row.cardName, row.label, JSON.stringify(row.bonuses || {})].join(':');
      if (!uniqueRows.has(key)) uniqueRows.set(key, row);
    });
    const rows = Array.from(uniqueRows.values());
    const automaticRows = rows.filter(row => {
      const text = [row.effectText, row.label, row.reason].filter(Boolean).join(' ');
      if (/通常攻撃|普通攻撃|基本攻撃/.test(text)) return false;
      if (Number(row?.bonuses?.spRegen) || Number(row?.bonuses?.spRegenP)) return true;
      return (Number(row?.bonuses?.spRecovery) || Number(row?.bonuses?.spRecoveryP))
        && /\d+(?:\.\d+)?秒ごと/.test(text);
    });
    const regenPercent = Number(summarizeEffectBonuses(automaticRows, key => key === 'spRegenP').spRegenP) || 0;
    const regenFixed = Number(summarizeEffectBonuses(automaticRows, key => key === 'spRegen').spRegen) || 0;
    const regenSources = unique(automaticRows
      .filter(row => Number(row?.bonuses?.spRegen) || Number(row?.bonuses?.spRegenP))
      .map(row => row.spSourceLabel || row.cardName || row.label || row.source)
      .filter(Boolean));
    const spRegen = Math.max(0, Math.floor(baseState.spRegen * (1 + regenPercent / 100) + regenFixed));
    const initialRows = rows.filter(row => Number(row?.bonuses?.initialSp) || Number(row?.bonuses?.initialSpP));
    const initialFixed = Number(summarizeEffectBonuses(initialRows, key => key === 'initialSp').initialSp) || 0;
    const initialPercent = Number(summarizeEffectBonuses(initialRows, key => key === 'initialSpP').initialSpP) || 0;
    const initialSources = unique(initialRows
      .map(row => row.spSourceLabel || row.cardName || row.label || row.source)
      .filter(Boolean));
    const initialSp = Math.min(
      baseState.maxSp,
      Math.max(0, baseState.initialSp + initialFixed + baseState.maxSp * initialPercent / 100)
    );
    const periodicGroups = new Map();
    automaticRows.forEach(row => {
      if (!Number(row?.bonuses?.spRecovery) && !Number(row?.bonuses?.spRecoveryP)) return;
      const text = [row.effectText, row.label, row.reason].filter(Boolean).join(' ');
      const interval = Number(text.match(/(\d+(?:\.\d+)?)秒ごと/)?.[1]);
      if (!Number.isFinite(interval) || interval <= 0) return;
      const sourceName = row.spSourceLabel || row.cardName || row.label || row.source || '';
      const key = [sourceName, interval].join(':');
      if (!periodicGroups.has(key)) periodicGroups.set(key, { interval, source: sourceName, min: [], max: [], fixed: [] });
      const group = periodicGroups.get(key);
      if (/ランダム最低値/.test(text)) group.min.push(row);
      else if (/ランダム最大値/.test(text)) group.max.push(row);
      else group.fixed.push(row);
    });
    const minEvents = [];
    const maxEvents = [];
    const periodicLabels = [];
    periodicGroups.forEach(group => {
      const measureRows = list => {
        const fixed = Number(summarizeEffectBonuses(list, key => key === 'spRecovery').spRecovery) || 0;
        const percent = Number(summarizeEffectBonuses(list, key => key === 'spRecoveryP').spRecoveryP) || 0;
        return { fixed, percent, amount: fixed + baseState.maxSp * percent / 100 };
      };
      const combineMeasures = (left, right) => ({
        fixed: left.fixed + right.fixed,
        percent: left.percent + right.percent,
        amount: left.amount + right.amount
      });
      const common = measureRows(group.fixed);
      const minimum = combineMeasures(common, measureRows(group.min.length ? group.min : group.max));
      const maximum = combineMeasures(common, measureRows(group.max.length ? group.max : group.min));
      if (minimum.amount > 0) minEvents.push({ intervalSeconds: group.interval, amountSp: minimum.amount, source: group.source });
      if (maximum.amount > 0) maxEvents.push({ intervalSeconds: group.interval, amountSp: maximum.amount, source: group.source });
      if (minimum.amount || maximum.amount) {
        const low = minimum.amount;
        const high = maximum.amount;
        const range = Math.abs(low - high) < 0.001
          ? formatPlainNumber(low)
          : `${formatPlainNumber(Math.min(low, high))}～${formatPlainNumber(Math.max(low, high))}`;
        periodicLabels.push(`${group.source ? `${group.source}: ` : ''}${formatPlainNumber(group.interval)}秒ごとSP${range}`);
      }
    });
    const manualCards = unique(rows.filter(row => {
      const text = [row.effectText, row.label, row.reason].filter(Boolean).join(' ');
      return (Number(row?.bonuses?.spRecovery) || Number(row?.bonuses?.spRecoveryP)) && /カード選択時/.test(text);
    }).map(row => row.cardName).filter(Boolean));
    const detailLines = buildFdcSpTimingDetailLines(context, baseState, candidateRows);
    const summaryParts = [
      initialFixed || initialPercent
        ? `初期SP${initialFixed ? `+${formatPlainNumber(initialFixed)}` : ''}${initialPercent ? `${initialFixed ? ' / ' : '+'}${formatPlainNumber(initialPercent)}%` : ''}（${formatPlainNumber(baseState.initialSp)}→${formatPlainNumber(initialSp)}${initialSources.length ? ` / ${initialSources.join('・')}` : ''}）`
        : '',
      regenFixed || regenPercent
        ? `毎秒回復量${regenFixed ? `+${formatPlainNumber(regenFixed)}` : ''}${regenPercent ? `${regenFixed ? ' / ' : '+'}${formatPlainNumber(regenPercent)}%` : ''}（${formatPlainNumber(baseState.spRegen)}→${formatPlainNumber(spRegen)}${regenSources.length ? ` / ${regenSources.join('・')}` : ''}）`
        : '',
      ...periodicLabels
    ].filter(Boolean);
    return {
      initialSp,
      spRegen,
      minEvents,
      maxEvents,
      summaryText: summaryParts.join(' / '),
      manualText: manualCards.length ? `${manualCards.join(' / ')}のカード選択時SP回復` : '',
      detailLines
    };
  }

  function buildFdcSpTimingDetailLines(context, baseState, candidateRows = []) {
    const applied = [`✓ 基礎: 初期SP${formatPlainNumber(baseState.initialSp)} / 毎秒SP+${formatPlainNumber(baseState.spRegen)}`];
    const held = [];
    const seen = new Set();
    const add = ({ key = '', source = '', bonuses = {}, text = '', enabled = true, disabledReason = '' }) => {
      if (!hasFdcSpTimingBonus(bonuses)) return;
      const uniqueKey = key || [source, JSON.stringify(bonuses), text].join(':');
      if (seen.has(uniqueKey)) return;
      seen.add(uniqueKey);
      const timing = classifyFdcSpTimingEffect(bonuses, text);
      const value = formatFdcSpTimingBonus(bonuses, timing.interval, baseState.maxSp);
      const label = source || '名称不明のSP効果';
      if (enabled && timing.automatic) {
        applied.push(`✓ ${label}: ${value}`);
      } else {
        const reasons = unique([disabledReason, timing.reason].filter(Boolean));
        held.push(`－ ${label}: ${value}［${reasons.join(' / ') || '自動計算対象外'}］`);
      }
    };

    const target = context?.target;
    if (target) {
      buildSelfSkillEffectOptions(target, context).forEach(option => {
        const bonuses = getSkillEffectOptionBonuses(option);
        const text = [option.condition, option.detailText, option.label].filter(Boolean).join(' ');
        add({
          key: `skill:${option.key}`,
          source: option.spSourceLabel || option.label,
          bonuses,
          text,
          enabled: isSelfSkillEffectOptionEnabled(option),
          disabledReason: isSelfSkillEffectOptionEnabled(option) ? '' : '条件未成立または手動OFF'
        });
      });
    }

    candidateRows.forEach(row => {
      if (/本人スキル|編成スキル|編成A3/.test(String(row?.source || ''))) return;
      const text = [row.effectText, row.label, row.reason].filter(Boolean).join(' ');
      const sourceEnabled = isEffectSourceEnabled(row);
      const targetMatched = !/対象外/.test(String(row?.reason || ''));
      const toggleEnabled = !row?.canToggle || isConditionalEffectEnabled(row.conditionKey, row.defaultEnabled);
      add({
        key: `row:${row.conditionKey || [row.source, row.cardName, row.label].join(':')}`,
        source: row.spSourceLabel || row.cardName || row.label || row.source,
        bonuses: row.bonuses || {},
        text,
        enabled: sourceEnabled && targetMatched && toggleEnabled,
        disabledReason: !sourceEnabled
          ? '補正カテゴリOFF'
          : (!targetMatched ? String(row.reason || '対象外') : (!toggleEnabled ? '手動OFF' : ''))
      });
    });

    getFormationArtifactEffectOwners(context?.formation, context?.state?.cards || {}, target).forEach(ownerRow => {
      const card = getCard(ownerRow.id);
      normalizeFdcArray(card?.conditionalEffects).forEach(effect => {
        const text = getEffectText(effect);
        const damageType = resolveActiveDamageType(target);
        const targetState = judgeFormationArtifactTarget(text, target, ownerRow, effect, damageType);
        if (targetState.matched) return;
        const bonuses = scaleEffectBonusMap(
          normalizeCardEffectBonuses(effect.bonusesByStar?.[ownerRow.star - 1], damageType, text),
          ownerRow.qty,
          effect,
          text
        );
        add({
          key: `artifact-target-out:${ownerRow.ownerId}:${ownerRow.id}:${effect.id || text}`,
          source: `${ownerRow.name}${ownerRow.ownerLabel ? `（${ownerRow.ownerLabel}）` : ''}`,
          bonuses,
          text,
          enabled: false,
          disabledReason: targetState.reason || '効果対象外'
        });
      });
    });

    return [
      ...applied,
      ...(held.length ? ['保留・除外', ...held] : ['保留・除外: なし'])
    ];
  }

  function hasFdcSpTimingBonus(bonuses = {}) {
    return ['initialSp', 'initialSpP', 'spRegen', 'spRegenP', 'spRecovery', 'spRecoveryP']
      .some(key => Number(bonuses?.[key]));
  }

  function classifyFdcSpTimingEffect(bonuses = {}, text = '') {
    if (Number(bonuses.initialSp) || Number(bonuses.initialSpP)) return { automatic: true, interval: 0, reason: '' };
    if (Number(bonuses.spRegen) || Number(bonuses.spRegenP)) return { automatic: true, interval: 1, reason: '' };
    const interval = Number(String(text).match(/(\d+(?:\.\d+)?)秒ごと/)?.[1]);
    if ((Number(bonuses.spRecovery) || Number(bonuses.spRecoveryP)) && Number.isFinite(interval) && interval > 0) {
      return { automatic: true, interval, reason: '' };
    }
    const body = String(text || '');
    if (/一定確率/.test(body)) return { automatic: false, interval: 0, reason: '確率発動は保留' };
    if (/n回ごと|\d+回(?:目|ごと)|攻撃回数/.test(body)) return { automatic: false, interval: 0, reason: '攻撃回数条件は保留' };
    if (/被撃|被弾|ダメージを受け|ダメージを受けた/.test(body)) return { automatic: false, interval: 0, reason: '被撃時回復は保留' };
    if (/攻撃時|攻撃命中時|基本攻撃|強化攻撃|通常攻撃|普通攻撃/.test(body)) return { automatic: false, interval: 0, reason: '攻撃時回復は保留' };
    if (/使用時|使用後|命中時|発動時|破壊時|撃破時|衝突時/.test(body)) return { automatic: false, interval: 0, reason: '発動・命中時回復は保留' };
    return { automatic: false, interval: 0, reason: '発生タイミング未対応' };
  }

  function formatFdcSpTimingBonus(bonuses = {}, interval = 0, maxSp = 0) {
    const parts = [];
    const push = (key, label, suffix = '') => {
      const value = Number(bonuses?.[key]) || 0;
      if (value) parts.push(`${label}${value > 0 ? '+' : ''}${formatPlainNumber(value)}${suffix}`);
    };
    push('initialSp', '初期SP');
    push('initialSpP', '初期SP', '%');
    push('spRegen', '毎秒SP');
    push('spRegenP', '毎秒SP', '%');
    push('spRecovery', interval > 0 ? `${formatPlainNumber(interval)}秒ごとSP` : 'SP');
    push('spRecoveryP', interval > 0 ? `${formatPlainNumber(interval)}秒ごとSP` : 'SP', '%');
    const percentRecovery = Number(bonuses.spRecoveryP) || 0;
    if (percentRecovery && maxSp) parts.push(`実回復${formatPlainNumber(maxSp * percentRecovery / 100)}`);
    return parts.join(' / ') || 'SP効果';
  }

  function showFdcArtifactPopover(anchor) {
    const id = anchor.dataset.fdcArtifactDetail || '';
    const card = getCard(id);
    if (!card) return;
    const star = Number(anchor.dataset.fdcArtifactStar) || 1;
    const solder = Number(anchor.dataset.fdcArtifactSolder) || 0;
    const lines = [
      card.rarity ? `レア度: ${card.rarity}` : '',
      `コスト: ${getCardCostById(id, star)} / ★${star}${solder ? ` / はんだ+${solder}` : ''}`,
      formatArtifactBonusLine('基礎補正', card.bonusesByStar?.[star - 1]),
      solder ? formatArtifactBonusLine(`はんだ+${solder}`, card.solderBonuses?.[solder]) : '',
      ...formatArtifactConditionalEffectLines(card.conditionalEffects || [], star)
    ].filter(Boolean);
    showFdcInfoPopover(anchor, card.name || '遺物詳細', lines);
  }

  function formatArtifactEffectDetail(effect, star = 1) {
    const title = effect.label || effect.shortLabel || '特殊効果';
    const judgeText = getEffectText(effect);
    const bonusText = formatBonusMap(normalizeCardEffectBonuses(effect.bonusesByStar?.[star - 1], 'unknown', judgeText));
    const detailText = String(getDisplayEffectDescription(effect, star) || '').replace(/\s+/g, ' ').trim();
    if (detailText) return detailText;
    return bonusText ? `${title}: ${bonusText}` : title;
  }

  function formatArtifactConditionalEffectLines(effects, star = 1) {
    const consumed = new Set();
    return effects.flatMap((effect, index) => {
      if (consumed.has(index)) return [];
      const bound = getArtifactRandomEffectBound(effect);
      if (bound) {
        const pairKey = getArtifactRandomEffectPairKey(effect);
        const pairIndex = effects.findIndex((candidate, candidateIndex) => (
          candidateIndex !== index
          && !consumed.has(candidateIndex)
          && getArtifactRandomEffectBound(candidate)
          && getArtifactRandomEffectBound(candidate) !== bound
          && getArtifactRandomEffectPairKey(candidate) === pairKey
        ));
        if (pairIndex >= 0) {
          consumed.add(index);
          consumed.add(pairIndex);
          const pair = effects[pairIndex];
          const minEffect = bound === 'min' ? effect : pair;
          const maxEffect = bound === 'max' ? effect : pair;
          return [formatArtifactRandomEffectRange(
            getDisplayEffectDescription(minEffect, star),
            getDisplayEffectDescription(maxEffect, star)
          )];
        }
      }
      consumed.add(index);
      return [formatArtifactEffectDetail(effect, star)];
    });
  }

  function getArtifactRandomEffectBound(effect) {
    const label = String(effect?.label || '');
    if (label.includes('ランダム最低値')) return 'min';
    if (label.includes('ランダム最大値')) return 'max';
    return '';
  }

  function getArtifactRandomEffectPairKey(effect) {
    return `${String(effect?.label || '')
      .replace('ランダム最低値', 'ランダム値')
      .replace('ランダム最大値', 'ランダム値')
      .replace(/\s+/g, ' ')
      .trim()}|${String(effect?.valueClass || '')}`;
  }

  function formatArtifactRandomEffectRange(minText, maxText) {
    const normalizedMin = String(minText || '').replace(/\s+/g, ' ').trim();
    const normalizedMax = String(maxText || '').replace(/\s+/g, ' ').trim();
    const pattern = /^(.*?)(-?\d+(?:\.\d+)?)(%?)(\s*\([^)]*\))$/;
    const minMatch = normalizedMin.match(pattern);
    const maxMatch = normalizedMax.match(pattern);
    if (minMatch && maxMatch && minMatch[1] === maxMatch[1] && minMatch[3] === maxMatch[3] && minMatch[4] === maxMatch[4]) {
      const range = minMatch[2] === maxMatch[2] ? minMatch[2] : `${minMatch[2]}～${maxMatch[2]}`;
      const context = minMatch[4].trim().slice(1, -1).trim();
      return `${minMatch[1]}${range}${minMatch[3]} (${context}${context ? ' / ' : ''}ランダム)`;
    }
    return `ランダム最低: ${normalizedMin} / 最大: ${normalizedMax}`;
  }

  function getDisplayEffectDescription(effect, star = 1) {
    if (Array.isArray(effect.descriptionByStar) && effect.descriptionByStar.length) {
      const index = clamp(Math.max(1, Number(star) || 1), 1, effect.descriptionByStar.length) - 1;
      return effect.descriptionByStar[index] || '';
    }
    return effect.description || effect.effectDescription || '';
  }

  function formatArtifactBonusLine(label, bonuses) {
    const text = formatBonusMap(normalizeCardBonusMap(bonuses, 'unknown'));
    return text ? `${label}: ${text}` : '';
  }

  function showFdcInfoPopover(anchor, titleText, lines) {
    el.skillPopover = el.skillPopover || document.getElementById('fdc-skill-popover');
    if (!el.skillPopover) return;
    const title = el.skillPopover.querySelector('.fdc-skill-popover-title');
    const body = el.skillPopover.querySelector('.fdc-skill-popover-body');
    el.skillPopover.classList.remove('is-spell-details', 'is-spell-editor');
    el.skillPopover.classList.toggle('is-temp-artifact-detail', !!anchor.closest('.fdc-temp-artifact-picker'));
    delete el.skillPopover.dataset.fdcPopoverKind;
    if (title) title.textContent = titleText;
    if (body) body.innerHTML = lines.map(line => `<p>${escapeHtml(line).replace(/\n/g, '<br>')}</p>`).join('');
    const rect = anchor.getBoundingClientRect();
    el.skillPopover.hidden = false;
    const preferredWidth = lines.includes('SP反映内訳') ? 400 : 320;
    const width = Math.min(preferredWidth, window.innerWidth - 24);
    el.skillPopover.style.width = `${width}px`;
    el.skillPopover.style.left = `${Math.min(window.innerWidth - width - 12, Math.max(12, rect.right - width))}px`;
    const popRect = el.skillPopover.getBoundingClientRect();
    const below = rect.bottom + 8;
    const above = rect.top - popRect.height - 8;
    const maxTop = Math.max(12, window.innerHeight - popRect.height - 12);
    const top = below + popRect.height <= window.innerHeight - 12
      ? below
      : Math.max(12, Math.min(above, maxTop));
    el.skillPopover.style.top = `${top}px`;
  }

  function hideFdcSkillPopover() {
    el.skillPopover = el.skillPopover || document.getElementById('fdc-skill-popover');
    if (el.skillPopover) {
      el.skillPopover.hidden = true;
      el.skillPopover.classList.remove('is-spell-details', 'is-spell-editor', 'is-temp-artifact-detail');
      delete el.skillPopover.dataset.fdcPopoverKind;
    }
    document.querySelector('[data-fdc-spell-details-toggle]')?.setAttribute('aria-expanded', 'false');
    document.querySelector('[data-fdc-spell-edit-toggle]')?.setAttribute('aria-expanded', 'false');
  }

  function bindFdcSkillLevelControls(target) {
    el.selfSkillChoices?.querySelectorAll('[data-fdc-skill-level]').forEach(control => {
      control.addEventListener('change', () => {
        const id = target.id;
        const base = normalizeFdcSkillLevelConfig(target?.skillLevels || {});
        view.skillLevelOverrides[id] = {
          ...getFdcEffectiveSkillLevels(target),
          [control.dataset.fdcSkillLevel]: Number(control.value) || 0,
          baseLow: base.low,
          baseHigh: base.high,
          basePassive: base.passive,
          baseAsideRank: Number(target?.asideRank) || 0,
          baseAsideLevel: Number(target?.asideLevel) || 0,
          managerSyncRevision: Math.max(0, Number(target?.managerSyncRevision) || 0)
        };
        saveCalcSettings();
        render();
      });
    });
  }

  function renderSelfSkillEffects(context) {
    if (!el.selfSkillEffects) return;
    const target = context.target;
    if (!target) {
      el.selfSkillEffects.innerHTML = '';
      return;
    }
    const options = buildSelfSkillEffectOptions(target, context)
      .filter(option => isBonusMapRelevantToPerspective(option.bonuses));
    const selfOptions = options.filter(option => option.group !== 'formation');
    const formationOptions = options.filter(option => option.group === 'formation');
    if (!options.length) {
      el.selfSkillEffects.innerHTML = `
        <div class="fdc-skill-effects-title">本人スキル効果</div>
        <div class="fdc-skill-effect-empty">計算に反映できる本人スキル効果はありません</div>
      `;
      return;
    }
    el.selfSkillEffects.innerHTML = `
      ${renderSkillEffectSection('本人スキル効果', selfOptions, '計算に反映できる本人スキル効果はありません')}
      ${renderSkillEffectSection('編成スキル効果', formationOptions, '影響する編成スキル効果はありません')}
    `;
    el.selfSkillEffects.querySelectorAll('[data-fdc-self-skill-effect]').forEach(input => {
      input.addEventListener('change', () => {
        view.selfSkillEffectEnabled[input.dataset.fdcSelfSkillEffect] = !!input.checked;
        saveCalcSettings();
        const nextContext = buildContext();
        renderResult(nextContext);
        renderSelfSkillEffects(nextContext);
      });
    });
    el.selfSkillEffects.querySelectorAll('[data-fdc-skill-effect-info]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const option = collectRenderedSkillEffectOptions(buildContext()).find(item => item.key === button.dataset.fdcSkillEffectInfo);
        if (option) showSkillEffectPopover(button, option);
      });
    });
  }

  function renderSkillEffectSection(title, options, emptyText) {
    return `
      <section class="fdc-skill-effect-card">
        <div class="fdc-skill-effects-title">${escapeHtml(title)}</div>
        ${renderSkillEffectBonusSummary(options)}
        ${options.length ? `
          <div class="fdc-skill-effect-list">
            ${options.map(option => renderSkillEffectToggle(option)).join('')}
          </div>
        ` : `<div class="fdc-skill-effect-empty">${escapeHtml(emptyText)}</div>`}
      </section>
    `;
  }

  function renderSkillEffectBonusSummary(options) {
    const enabledOptions = (options || [])
      .filter(option => isSelfSkillEffectOptionEnabled(option))
      .map(option => ({ bonuses: getRelevantBonusMap(getSkillEffectOptionBonuses(option)) }));
    const summary = summarizeEffects(enabledOptions);
    const chips = Object.entries(summary || {})
      .filter(([, value]) => Number(value))
      .map(([key, value]) => `<span class="fdc-skill-effect-bonus-chip">${escapeHtml(formatBonusMap({ [key]: value }))}</span>`);
    if (!chips.length) return '';
    return `<div class="fdc-skill-effect-summary">${chips.join('')}</div>`;
  }

  function renderSkillEffectToggle(option) {
    const checked = isSelfSkillEffectOptionEnabled(option) ? ' checked' : '';
    const summary = getSkillEffectCompactSummary(option);
    const stackControl = renderSkillEffectStackControl(option);
    return `
      <label class="fdc-skill-effect-toggle">
        <input type="checkbox" data-fdc-self-skill-effect="${escapeAttr(option.key)}"${checked}>
        <span class="fdc-skill-effect-source ${escapeAttr(getFdcApostleSkillTone(option.category))}">${escapeHtml(getFdcApostleSkillActionLabel(option.category))}</span>
        ${option.ownerName ? `<span class="fdc-skill-effect-owner">${escapeHtml(option.ownerName)}</span>` : ''}
        <button type="button" class="fdc-skill-effect-info" data-fdc-skill-effect-info="${escapeAttr(option.key)}" aria-label="${escapeAttr(`${option.label}の条件詳細`)}">i</button>
        <span class="fdc-skill-effect-text">
          <strong>${escapeHtml(summary.main)}</strong>
          <small>${escapeHtml(summary.meta)}</small>
        </span>
        ${stackControl}
      </label>
    `;
  }

  function renderSkillEffectStackControl(option) {
    const maxStack = Number(option?.stackMax);
    if (!option?.key || !Number.isFinite(maxStack) || maxStack <= 1) return '';
    const value = getConditionalEffectStackCount(option.key, maxStack, option.stackDefault);
    const enabled = isSelfSkillEffectOptionEnabled(option);
    return `
      <span class="fdc-skill-effect-stack-control">
        <span>スタック</span>
        <input type="number" min="1" max="${escapeAttr(maxStack)}" step="1" value="${escapeAttr(value)}" data-fdc-stack-count="${escapeAttr(option.key)}" data-fdc-stack-max="${escapeAttr(maxStack)}"${enabled ? '' : ' disabled'} aria-label="スタック数（最大${escapeAttr(maxStack)}）">
        <small>/ ${escapeHtml(maxStack)}</small>
      </span>
    `;
  }

  function getSkillEffectOptionBonuses(option) {
    const maxStack = Number(option?.stackMax);
    const count = Number.isFinite(maxStack) && maxStack > 1
      ? getConditionalEffectStackCount(option.key, maxStack, option.stackDefault)
      : 1;
    return scaleBonusMap(option?.bonuses, count);
  }

  function getSkillEffectCompactSummary(option) {
    const kind = option.valueKind || option.effectType || option.effectLabel || option.label || '効果';
    const value = option.effectValue || formatBonusMap(getSkillEffectOptionBonuses(option)) || '';
    const stackText = Number(option?.stackMax) > 1 ? ` ×${getConditionalEffectStackCount(option.key, option.stackMax, option.stackDefault)}` : '';
    const condition = option.condition || getSkillEffectConditionSummary(option) || '常時';
    const target = option.effectTarget || '本人';
    return {
      main: [kind, value + stackText].filter(Boolean).join(' '),
      meta: [condition, target, option.durationText].filter(Boolean).join(' / ')
    };
  }

  function getSkillEffectDisplayRows(option) {
    return [
      { label: '値の種類', value: option.valueKind || option.effectType || option.effectLabel || '効果' },
      { label: '効果値', value: option.effectValue || formatBonusMap(option.bonuses) || '-' },
      ...(option.durationText ? [{ label: '効果時間', value: option.durationText.replace(/^持続\s*/, '') }] : []),
      { label: '条件', value: option.condition || getSkillEffectConditionSummary(option) || '常時' },
      { label: '効果対象', value: option.effectTarget || '本人' }
    ];
  }

  function collectRenderedSkillEffectOptions(context) {
    const target = context.target;
    if (!target) return [];
    return buildSelfSkillEffectOptions(target, context)
      .filter(option => isBonusMapRelevantToPerspective(option.bonuses));
  }

  function showSkillEffectPopover(anchor, option) {
    const lines = getSkillEffectDisplayRows(option).map(row => `${row.label}: ${row.value}`);
    showFdcInfoPopover(anchor, option.label || 'スキル効果詳細', lines);
  }

  function getSkillEffectConditionSummary(option) {
    const conditions = getSkillEffectConditionLines(option);
    if (!conditions.length) return '';
    return conditions.slice(0, 2).join(' / ');
  }

  function getSkillEffectConditionLines(option) {
    const lines = String(option.detailText || '')
      .split(/\n+/)
      .map(line => line.trim())
      .filter(Boolean);
    const conditionLines = lines.filter(line => (
      /条件|対象|列|同列|前列|中列|後列|攻撃|守備|防御|支援|補助|物理|魔法|性格|純粋|冷静|狂気|活発|憂鬱|編成/.test(line)
      && !/物理\d|魔法\d|倍率|ダメージ\d/.test(line)
    ));
    return unique(conditionLines).slice(0, 4);
  }

  function renderSynergyCategory(context) {
    if (!el.synergyCategory) return;
    const rows = getActiveSynergyRows(context);
    const enabled = isEffectSourceActive('synergy');
    el.synergyCategory.innerHTML = `
      <div class="fdc-synergy-card ${enabled ? '' : 'is-disabled'}">
        <div class="fdc-synergy-head">
          <span>編成シナジー</span>
          <b>${enabled ? 'ON' : 'OFF'}</b>
        </div>
        <div class="fdc-synergy-lines">
          ${renderSynergyLine('性格', rows.filter(row => row.type === 'personality'))}
          ${renderSynergyLine('種族', rows.filter(row => row.type === 'race'))}
        </div>
        <div class="fdc-synergy-bonus-chips">
          ${rows.some(row => Object.keys(row.bonuses || {}).length) ? rows.filter(row => Object.keys(row.bonuses || {}).length).map(row => renderSynergyBonusChip(row)).join('') : '<p class="fdc-empty">発動中のシナジーなし</p>'}
        </div>
      </div>
    `;
  }

  function renderSynergyLine(label, rows) {
    if (rows[0]?.type === 'personality') return renderPersonalitySynergyLine(label, rows);
    return `
      <div class="fdc-synergy-line">
        <strong>${escapeHtml(label)}</strong>
        <div class="fdc-synergy-icons">
          ${rows.length ? rows.map(row => `
            <span class="fdc-synergy-icon-chip ${row.isTarget ? 'is-target' : ''}" title="${escapeAttr(`${row.name} x${row.count}`)}">
              <img src="${escapeAttr(row.icon)}" alt="">
              <b>x${escapeHtml(row.count)}</b>
            </span>
          `).join('') : '<span class="fdc-synergy-none">なし</span>'}
        </div>
      </div>
    `;
  }

  function renderPersonalitySynergyLine(label, rows) {
    const icons = rows.flatMap(row => Array.from({ length: row.count }, (_, index) => ({
      ...row,
      instanceIndex: index,
      active: index < row.activeCount
    })));
    const pairs = [];
    for (let index = 0; index < icons.length; index += 2) pairs.push([icons[index], icons[index + 1]].filter(Boolean));
    return `
      <div class="fdc-synergy-line fdc-synergy-line-personality">
        <strong>${escapeHtml(label)}</strong>
        <div class="fdc-synergy-personality-icons">
          ${pairs.length ? pairs.map(pair => `
            <span class="fdc-synergy-personality-pair">
              ${pair.map((row, index) => `
                <span class="fdc-synergy-personality-icon ${index ? 'is-bottom' : 'is-top'} ${row.active ? 'is-active' : 'is-extra'} ${row.isTarget ? 'is-target' : ''}" title="${escapeAttr(`${row.name} ${row.instanceIndex + 1}/${row.count}`)}">
                  <img src="${escapeAttr(row.icon)}" alt="">
                </span>
              `).join('')}
            </span>
          `).join('') : '<span class="fdc-synergy-none">なし</span>'}
        </div>
      </div>
    `;
  }

  function renderSynergyBonusChip(row) {
    return `
      <span class="fdc-synergy-bonus-chip ${row.isTarget ? 'is-target' : ''}">
        <img src="${escapeAttr(row.icon)}" alt="">
        <strong>${escapeHtml(row.name)} x${escapeHtml(row.count)}</strong>
        <b>${escapeHtml(formatBonusMap(row.bonuses))}</b>
      </span>
    `;
  }

  function getActiveSynergyRows(context) {
    const counts = collectSynergyCounts(context.formation, context.state);
    return [
      ...getSynergyRowsForType('personality', typeof PERSONALITY_SYNERGIES === 'undefined' ? [] : PERSONALITY_SYNERGIES, counts.personality, context.target?.personality),
      ...getSynergyRowsForType('race', typeof RACE_SYNERGIES === 'undefined' ? [] : RACE_SYNERGIES, counts.race, context.target?.race)
    ].filter(row => row.count > 0 && (row.type === 'personality' || (row.bonuses && Object.keys(row.bonuses).length)));
  }

  function getSynergyRowsForType(type, table, counts, targetName = '') {
    const source = type === 'personality' ? sortPersonalitySynergies(table || []) : (table || []);
    return source.map(item => {
      const count = Number(counts?.[item.name]) || 0;
      const effect = findSynergyEffect(table, item.name, count);
      const activeCount = getSynergyActiveThreshold(item, count);
      return {
        type,
        id: item.id,
        name: item.name,
        icon: item.icon,
        count,
        activeCount,
        bonuses: normalizeSynergyEffect(effect),
        isTarget: item.name === targetName
      };
    }).filter(row => row.count > 0);
  }

  function sortPersonalitySynergies(items) {
    const order = ['冷静', '憂鬱', '活発', '狂気', '純粋'];
    return [...items].sort((a, b) => {
      const ai = order.indexOf(a.name);
      const bi = order.indexOf(b.name);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    });
  }

  function getSynergyActiveThreshold(item, count) {
    const effectsByCount = item?.effectsByCount || {};
    const threshold = Object.keys(effectsByCount)
      .map(Number)
      .filter(value => Number.isFinite(value) && value <= count)
      .sort((a, b) => b - a)[0];
    return threshold || 0;
  }

  function applyEnabledSelfSkillEffects(effects, context) {
    buildSelfSkillEffectOptions(context.target, context)
      .filter(option => isSelfSkillEffectOptionEnabled(option, context.skillEffectStateOverrides))
      .forEach(option => {
        const item = setEffectTags({
          source: option.group === 'formation' ? '編成スキル' : option.source || '本人スキル',
          spSourceLabel: option.spSourceLabel || '',
          label: option.label,
          bonuses: getSkillEffectOptionBonuses(option),
          reason: option.detailText,
          tags: { source: [option.sourceTag || 'スキル/アサイド'], status: [option.defaultEnabled ? '自動ON' : '手動ON'], effect: Object.keys(option.bonuses || {}).flatMap(effectTagsFromBonusKey) }
        }, { status: [option.defaultEnabled ? '自動ON' : '手動ON'] });
        effects.applied.push(item);
      });
  }

  function isSelfSkillEffectOptionEnabled(option, stateOverrides = null) {
    if (!option?.key) return !!option?.defaultEnabled;
    const canonicalKey = getFdcSkillEffectCanonicalKey(option.key);
    if (stateOverrides && Object.prototype.hasOwnProperty.call(stateOverrides, canonicalKey)) {
      return stateOverrides[canonicalKey] === true;
    }
    const manualState = getSelfSkillEffectManualState(option);
    if (manualState !== null) return manualState;
    return !!option.defaultEnabled;
  }

  function getSelfSkillEffectManualState(option) {
    if (!option?.key) return null;
    if (Object.prototype.hasOwnProperty.call(view.selfSkillEffectEnabled, option.key)) {
      return view.selfSkillEffectEnabled[option.key] === true;
    }
    if (option.key.endsWith(':all')) {
      const legacyPrefix = option.key.slice(0, -3);
      const legacyKey = Object.keys(view.selfSkillEffectEnabled)
        .reverse()
        .find(key => key.startsWith(legacyPrefix));
      if (legacyKey) return view.selfSkillEffectEnabled[legacyKey] === true;
    }
    return null;
  }

  function getFdcSkillEffectActionKey(effect, encodedActionKey = 'none') {
    const valueScope = judgeFdcEffectValueActionScope(effect, '');
    return valueScope.hasActionScope ? encodedActionKey : 'all';
  }

  function getFdcSkillEffectCanonicalKey(key = '') {
    const parts = String(key).split(':');
    parts.pop();
    return parts.join(':');
  }

  function buildSelfSkillEffectOptions(target, context) {
    const apostle = getApostleSkillData(target);
    if (!apostle) return buildFormationA3SkillEffectOptions(target, context);
    const levels = getFdcEffectiveSkillLevels(target);
    const actionKey = encodeURIComponent(context.actionCategory || 'none');
    const options = [];
    collectFdcApostleSkillSources(apostle, levels, target, context).forEach(({ skill, sourceKey, sourceLabel }) => {
      const category = getFdcApostleSkillCategory(skill, sourceLabel);
      const skillLevel = getFdcSkillLevelForCategory(levels, category);
      normalizeFdcArray(skill.stats).forEach((stat, statIndex) => {
        const bonuses = normalizeFdcSkillStatBonus(stat);
        if (!bonuses || !Object.keys(bonuses).length) return;
        const label = createFdcSkillEffectLabel({
          sourceLabel,
          category,
          skillName: skill.skillName || skill.name || '',
          effectLabel: `${stat.statName || 'ステータス'}増加`
        });
        options.push({
          key: `${target.id}:${sourceKey}:stat:${statIndex}:all`,
          category,
          label,
          bonuses,
          valueKind: stat.statName ? `${stat.statName}増加` : 'ステータス増加',
          effectValue: formatFdcPercentValue(stat.increaseP ?? stat.increase ?? stat.value),
          condition: '常時',
          effectTarget: stat.statApplyTo || '本人',
          defaultEnabled: true,
          detailText: [skill.description, `${stat.statApplyTo || '本人'} ${stat.statName || ''} +${formatPlainNumber(stat.increaseP ?? stat.increase ?? stat.value)}%`].filter(Boolean).join('\n')
        });
      });
      normalizeFdcArray(skill.effects).forEach((effect, effectIndex) => {
        if (isFdcApostleAttackMultiplierEffect(effect)) return;
        const bonuses = normalizeFdcSkillEffectBonus(effect, skillLevel);
        if (!bonuses || !Object.keys(bonuses).length) return;
        const effectText = getFdcSkillEffectConditionText(skill, effect);
        const enemyPersonalityState = getEnemyPersonalityConditionState(effectText);
        const allyPersonalityState = getAllyPersonalityConditionState(effectText, target);
        const label = createFdcSkillEffectLabel({
          sourceLabel,
          category,
          skillName: skill.skillName || skill.name || '',
          effectLabel: effect.valueKind || effect.effectType || '効果'
        });
        options.push({
          key: `${target.id}:${sourceKey}:${effectIndex}:${getFdcSkillEffectActionKey(effect, actionKey)}`,
          effectId: effect.effectId || '',
          sourceId: sourceKey,
          category,
          label,
          bonuses,
          valueKind: effect.valueKind || effect.effectType || '効果',
          effectType: effect.effectType || '',
          effectValue: formatFdcSkillEffectValue(effect, skillLevel),
          durationText: getFdcSkillEffectDurationText(skill, effect, skillLevel),
          durationSeconds: parseFdcDurationSeconds(getFdcSkillEffectDurationText(skill, effect, skillLevel)),
          condition: getFdcSkillEffectDisplayCondition(effect, allyPersonalityState.reason, enemyPersonalityState.reason),
          effectTarget: effect.effectTarget || '本人',
          actionScoped: judgeFdcEffectValueActionScope(effect, '').hasActionScope,
          spSourceLabel: createFdcSpSourceLabel(target?.name || apostle?.name, sourceLabel, category),
          defaultEnabled: getFdcSkillEffectDefaultEnabled(effectText, effect, enemyPersonalityState, context.actionCategory, allyPersonalityState, context, category),
          detailText: [enemyPersonalityState.reason, skill.description, effect.description, effect.effectDescription].filter(Boolean).join('\n'),
          ...getFdcRuntimeEffectMetadata(effect),
          ...getFdcEffectStackMeta(effect)
        });
      });
    });
    return options.concat(buildFormationSkillEffectOptions(target, context));
  }

  function buildFormationSkillEffectOptions(target, context) {
    if (!target || !context?.members?.length) return [];
    const actionKey = encodeURIComponent(context.actionCategory || 'none');
    const options = [];
    context.members.forEach(member => {
      if (!member?.id || member.id === target.id) return;
      const apostle = getApostleSkillData(member);
      if (!apostle) return;
      const memberName = member.name || apostle?.name || member.id;
      const memberLevels = getFdcEffectiveSkillLevels(member);
      collectFdcApostleSkillSources(apostle, memberLevels, member, context).forEach(({ skill, sourceKey, sourceLabel }) => {
        if (String(sourceKey || '') === 'aside:3') return;
        const category = getFdcApostleSkillCategory(skill, sourceLabel);
        const skillLevel = getFdcSkillLevelForCategory(memberLevels, category);
        normalizeFdcArray(skill.effects).forEach((effect, effectIndex) => {
          const effectText = getFdcSkillEffectConditionText(skill, effect);
          const option = createFormationSkillEffectOption({
            effect,
            effectText,
            effectIndex,
            sourceKey,
            sourceLabel,
            category,
            skill,
            skillLevel,
            member,
            memberName,
            target,
            actionCategory: context.actionCategory,
            context
          });
          if (option) options.push(option);
        });
      });
    });
    return options.concat(buildFormationA3SkillEffectOptions(target, context));
  }

  function createFormationSkillEffectOption({ effect, effectText = '', effectIndex, sourceKey, sourceLabel, category, skill, skillLevel, member, memberName, target, actionCategory = '', context = null }) {
    if (isFdcApostleAttackMultiplierEffect(effect)) return null;
    const targetState = getFormationSkillTargetState(effect.effectTarget, target, member, effectText);
    if (!targetState.applies) return null;
    const bonuses = pickDamageRelevantBonusMap(normalizeFdcSkillEffectBonus(effect, skillLevel));
    if (!bonuses || !Object.keys(bonuses).length) return null;
    const enemyPersonalityState = getEnemyPersonalityConditionState(effectText);
    const defaultEnabled = targetState.defaultEnabled && getFdcSkillEffectDefaultEnabled(effectText, effect, enemyPersonalityState, actionCategory, undefined, context, category);
    return {
      key: `${member.id}:formation-skill:${sourceKey}:${effectIndex}:${target.id}:${getFdcSkillEffectActionKey(effect, encodeURIComponent(actionCategory || 'none'))}`,
      effectId: effect.effectId || '',
      sourceId: `${member.id}:${sourceKey}`,
      group: 'formation',
      category,
      source: '編成スキル',
      sourceTag: 'スキル/アサイド',
      defaultEnabled,
      ownerName: memberName,
      label: createFdcSkillEffectLabel({
        sourceLabel,
        category,
        skillName: skill?.skillName || skill?.name || '',
        effectLabel: effect.valueKind || effect.effectType || '効果',
        ownerName: memberName
      }),
      bonuses,
      valueKind: effect.valueKind || effect.effectType || '効果',
      effectType: effect.effectType || '',
      effectValue: formatFdcSkillEffectValue(effect, skillLevel),
      durationText: getFdcSkillEffectDurationText(skill, effect, skillLevel),
      durationSeconds: parseFdcDurationSeconds(getFdcSkillEffectDurationText(skill, effect, skillLevel)),
      condition: getFdcSkillEffectDisplayCondition(effect, targetState.reason, enemyPersonalityState.reason),
      effectTarget: effect.effectTarget || '味方',
      actionScoped: judgeFdcEffectValueActionScope(effect, '').hasActionScope,
      spSourceLabel: createFdcSpSourceLabel(memberName, sourceLabel, category),
      detailText: [targetState.reason, enemyPersonalityState.reason, skill?.description, effect.description, effect.effectDescription].filter(Boolean).join('\n'),
      ...getFdcRuntimeEffectMetadata(effect),
      ...getFdcEffectStackMeta(effect)
    };
  }

  function buildFormationA3SkillEffectOptions(target, context) {
    if (!target || !context?.members?.length) return [];
    const actionKey = encodeURIComponent(context.actionCategory || 'none');
    const options = [];
    context.members.forEach(member => {
      if (!member?.id || member.id === target.id || Number(member.asideRank) < 3) return;
      const apostle = getApostleSkillData(member);
      const aside3 = apostle?.aside?.levels?.[3];
      if (!aside3) return;
      const memberName = member.name || apostle?.name || member.id;
      normalizeFdcArray(aside3.effects).forEach((effect, effectIndex) => {
        const effectText = getFdcSkillEffectConditionText(aside3, effect);
        const targetState = getFormationSkillTargetState(effect.effectTarget, target, member, effectText);
        if (!targetState.applies) return;
        const skillLevel = getFdcSkillLevelForCategory(getFdcEffectiveSkillLevels(member), 'アサイド');
        const bonuses = pickDamageRelevantBonusMap(normalizeFdcSkillEffectBonus(effect, skillLevel));
        if (!bonuses || !Object.keys(bonuses).length) return;
        options.push({
          key: `${member.id}:formation-a3:effect:${effectIndex}:${target.id}:${getFdcSkillEffectActionKey(effect, actionKey)}`,
          effectId: effect.effectId || '',
          sourceId: `${member.id}:aside:3`,
          group: 'formation',
          category: 'アサイド',
          source: '編成A3',
          sourceTag: 'スキル/アサイド',
          defaultEnabled: targetState.defaultEnabled && getFdcSkillEffectDefaultEnabled(effectText, effect, undefined, context.actionCategory, undefined, context, 'A3'),
          ownerName: memberName,
          label: createFdcSkillEffectLabel({
            sourceLabel: 'A3',
            category: 'A3',
            effectLabel: effect.valueKind || effect.effectType || '効果',
            ownerName: memberName
          }),
          bonuses,
          valueKind: effect.valueKind || effect.effectType || '効果',
          effectType: effect.effectType || '',
          effectValue: formatFdcSkillEffectValue(effect, skillLevel),
          durationText: getFdcSkillEffectDurationText(aside3, effect, skillLevel),
          durationSeconds: parseFdcDurationSeconds(getFdcSkillEffectDurationText(aside3, effect, skillLevel)),
          condition: getFdcSkillEffectDisplayCondition(effect, targetState.reason),
          effectTarget: effect.effectTarget || '味方',
          actionScoped: judgeFdcEffectValueActionScope(effect, '').hasActionScope,
          spSourceLabel: createFdcSpSourceLabel(memberName, 'A3', 'A3'),
          detailText: [targetState.reason, aside3.description, effect.description, effect.effectDescription].filter(Boolean).join('\n'),
          ...getFdcRuntimeEffectMetadata(effect),
          ...getFdcEffectStackMeta(effect)
        });
      });
    });
    return options;
  }

  function getFdcEffectStackMeta(effect) {
    const maxStack = Number(effect?.maxStack);
    if (effect?.effectStack !== true || !Number.isFinite(maxStack) || maxStack <= 1) return {};
    return { stackMax: Math.floor(maxStack), stackDefault: 1 };
  }
  function createFdcSkillEffectLabel({ sourceLabel = '', category = '', skillName = '', effectLabel = '', ownerName = '' } = {}) {
    const owner = String(ownerName || '').trim();
    const action = getFdcApostleSkillActionLabel(category);
    const source = String(sourceLabel || '').trim();
    const candidates = [skillName, effectLabel]
      .map(part => compactFdcSkillLabelPart(part, { source, category, action }))
      .filter(Boolean);
    const uniqueParts = unique(candidates);
    const fallback = compactFdcSkillLabelPart(effectLabel || skillName || action || source || '効果', { source, category, action }) || '効果';
    const body = uniqueParts.length ? uniqueParts.join(' / ') : fallback;
    return owner ? `${owner} / ${body}` : body;
  }

  function createFdcSpSourceLabel(ownerName = '', sourceLabel = '', category = '') {
    const source = sourceLabel && sourceLabel !== '通常' ? sourceLabel : category;
    return [ownerName, source].filter(Boolean).join(' ');
  }

  function compactFdcSkillLabelPart(value, { source = '', category = '', action = '' } = {}) {
    const text = String(value || '').trim();
    if (!text) return '';
    const normalized = text.replace(/[\s　]+/g, '');
    const sourceNorm = String(source || '').replace(/[\s　]+/g, '');
    const categoryNorm = String(category || '').replace(/[\s　]+/g, '');
    const actionNorm = String(action || '').replace(/[\s　]+/g, '');
    const asideNumber = (sourceNorm.match(/^A([1-3])$/) || categoryNorm.match(/^A([1-3])$/) || categoryNorm.match(/^アサイド([1-3])$/))?.[1] || '';
    if ([sourceNorm, categoryNorm, actionNorm].includes(normalized)) return '';
    if (/^パッシブスキル$/.test(normalized) && /パッシブ/.test(`${sourceNorm}${categoryNorm}${actionNorm}`)) return '';
    if (/^パッシブ$/.test(normalized) && /パッシブ/.test(`${sourceNorm}${categoryNorm}${actionNorm}`)) return '';
    if (asideNumber && normalized === `アサイド${asideNumber}`) return '';
    if (asideNumber && normalized === `アサイドLv${asideNumber}`) return '';
    if (/^アサイド[1-3]$/.test(normalized) && /^A[1-3]$/.test(sourceNorm)) return '';
    return text;
  }

  function pickDamageRelevantBonusMap(bonuses) {
    if (!bonuses) return null;
    const allowed = new Set([
      'atkP',
      'physicalAtkP',
      'magicAtkP',
      'defP',
      'physicalDefP',
      'magicDefP',
      'hasteP',
      'critP',
      'critRateP',
      'critDmgP',
      'critDmgAddP',
      'critResP',
      'critResAddP',
      'critDmgResP',
      'critDmgResAddP',
      'addP',
      'otherP',
      'normalAttackAddP',
      'basicAddP',
      'enhancedAddP',
      'skillAddP',
      'takenDmgP',
      'attackerDmgDownP',
      'enemyDefDownP',
      'enemyCritResDownP',
      'enemyCritDmgResDownP'
    ]);
    return Object.fromEntries(Object.entries(bonuses).filter(([key, value]) => allowed.has(key) && Number(value)));
  }

  function getFormationSkillTargetState(rawTarget, target, sourceMember, conditionText = '') {
    const text = String(rawTarget || '').trim();
    const body = [text, conditionText].filter(Boolean).join(' ');
    const result = (applies, defaultEnabled, reason = '') => ({ applies, defaultEnabled, reason });
    if (!text) return result(false, false);
    if (/敵/.test(text)) return result(false, false, '敵対象');
    if (/自身|本人/.test(text) && !/味方|全体|前列|中列|後列/.test(text)) {
      return result(sourceMember?.id === target?.id, sourceMember?.id === target?.id, '自身対象');
    }
    if (/全体|味方全員|味方全体|フィールド上の味方全体|味方\/最大/.test(text)) {
      return result(true, true, '味方全体');
    }
    const reason = judgeTargetText(body, target, resolveActiveDamageType(target));
    if (reason.matched && reason.reason) {
      return result(true, true, reason.reason);
    }
    if (!reason.matched && reason.reason) {
      return result(false, false, reason.reason);
    }
    if (/味方/.test(text)) {
      return result(true, false, `${text} / 対象候補のため手動ON`);
    }
    return result(false, false, reason.reason);
  }

  function isAllyPersonalityConditionText(text) {
    const body = String(text || '');
    return ['純粋', '冷静', '狂気', '活発', '憂鬱'].some(name =>
      new RegExp(`${name}(?:性格)?の味方`).test(body)
      || new RegExp(`味方[\\/／ ]?${name}`).test(body)
    );
  }
  function getAllyPersonalityConditionState(text, target) {
    const body = String(text || '');
    const personalities = ['純粋', '冷静', '狂気', '活発', '憂鬱'];
    const personality = personalities.find(name =>
      new RegExp(`${name}(?:性格)?の味方`).test(body)
      || new RegExp(`味方[\\/／ ]?${name}`).test(body)
    );
    if (!personality) return { hasCondition: false, defaultEnabled: true, reason: '' };
    const matched = normalizePersonalityName(target?.personality) === personality;
    return {
      hasCondition: true,
      defaultEnabled: matched,
      reason: matched
        ? `味方性格=${personality}`
        : `味方性格条件: ${personality} (現在:${target?.personality || '未設定'})`
    };
  }
  function getEnemyPersonalityConditionState(text) {
    const body = String(text || '');
    const personalities = ['純粋', '冷静', '狂気', '活発', '憂鬱'];
    const personality = personalities.find(name => {
      if (!body.includes(name)) return false;
      if (new RegExp(`${name}(?:性格)?の味方`).test(body) || new RegExp(`味方[\\/／ ]?${name}`).test(body)) return false;
      return new RegExp(`${name}(?:へ|への|に対|相手|敵)`).test(body)
        || new RegExp(`${name}.*(?:与ダメージ|ダメージ量|ダメージ増加)`).test(body);
    });
    if (!personality) return { hasCondition: false, defaultEnabled: true, reason: '' };
    const current = getEffectiveEnemyPersonality();
    const matched = current === personality;
    return {
      hasCondition: true,
      defaultEnabled: matched,
      reason: matched
        ? `敵性格=${personality}`
        : `敵性格条件: ${personality}${current ? ` (現在:${current})` : ' (未設定)'}`
    };
  }

  function normalizeFdcSkillEffectBonus(effect, skillLevel) {
    if (!effect) return null;
    const valueClass = String(effect.valueClass || '');
    const valueKind = String(effect.valueKind || '');
    const isSpEffect = /SP/.test(valueKind) && !/SP減少|クールタイム|周期/.test(valueKind);
    const isSpMetadata = isSpEffect && /周期|クールタイム|持続時間|回数|最大スタック|対象数/.test(valueClass);
    if (isSpMetadata) return null;
    if (!isSpEffect && valueClass && !isFdcDamageBonusValueClass(valueClass)) return null;
    const levelInfo = getFdcEffectLevelInfo(effect, skillLevel);
    const value = Number(levelInfo?.value ?? effect.fixedValue);
    if (!Number.isFinite(value) || value === 0) return null;
    const effectType = String(effect.effectType || '');
    const effectTarget = String(effect.effectTarget || '');
    const text = `${valueKind} ${effectType} ${effectTarget}`;
    const targetEnemy = /敵/.test(effectTarget) || /デバフ/.test(effectType);
    const decrease = /減少|低下/.test(text);
    const increase = /増加|上昇|アップ/.test(text);
    const bonuses = {};
    const add = key => { bonuses[key] = (bonuses[key] || 0) + value; };
    const addSigned = key => { bonuses[key] = (bonuses[key] || 0) + (decrease ? -value : value); };
    const addDamageTakenMod = key => { bonuses[key] = (bonuses[key] || 0) + (decrease ? value : -value); };
    const isOtherMultiplier = /\(その他倍率\)/.test(valueKind);

    if (isSpEffect) {
      const percent = /倍率/.test(valueClass);
      if (/戦闘開始時/.test(valueKind)) add(percent ? 'initialSpP' : 'initialSp');
      else if (/毎秒|1秒ごと/.test(valueKind)) add(percent ? 'spRegenP' : 'spRegen');
      else add(percent ? 'spRecoveryP' : 'spRecovery');
      return bonuses;
    }

    if (valueClass === '与ダメージ量増加') add('addP');
    else if (valueClass === '被ダメージ量減少') add('takenDmgP');
    else if (isOtherMultiplier) addSigned('otherP');
    else if (/攻撃速度/.test(valueKind) && !targetEnemy) add('hasteP');
    else if (/攻撃力/.test(valueKind) && !targetEnemy) addSigned('atkP');
    else if (/防御力/.test(valueKind)) {
      if (targetEnemy && decrease) add('enemyDefDownP');
      else if (!targetEnemy) addSigned('defP');
    } else if (/会心被(?:ダメージ量|DMG量)|被会心(?:ダメージ量|DMG量)|被会心.*ダメージ量|被会心.*DMG量/.test(valueKind)) {
      addDamageTakenMod('critDmgResAddP');
    } else if (/被会心率|被会心/.test(valueKind)) {
      addDamageTakenMod('critResAddP');
    } else if (/会心DMG抵抗|会心ダメージ抵抗/.test(valueKind)) {
      if (targetEnemy && decrease) add('enemyCritDmgResDownP');
      else if (!targetEnemy) addSigned('critDmgResP');
    } else if (/会心抵抗/.test(valueKind)) {
      if (targetEnemy && decrease) add('enemyCritResDownP');
      else if (!targetEnemy) addSigned('critResP');
    } else if (/会心(?:ダメージ量|DMG量)/.test(valueKind)) add('critDmgAddP');
    else if (/会心ダメージ|会心DMG/.test(valueKind)) add('critDmgP');
    else if (/会心率/.test(valueKind)) add('critRateP');
    else if (/会心/.test(valueKind)) add('critP');
    else if (/被ダメージ|被ダメ/.test(valueKind) && !targetEnemy) addDamageTakenMod('takenDmgP');
    else if (/自爆ダメージ/.test(valueKind)) addSigned('specialP');
    else if (/(?:通常|普通)攻撃.*ダメージ/.test(valueKind)) addSigned('normalAttackAddP');
    else if (/基本攻撃.*ダメージ/.test(valueKind)) addSigned('basicAddP');
    else if (/強化攻撃.*ダメージ/.test(valueKind)) addSigned('enhancedAddP');
    else if (/スキル.*ダメージ|ダメージ量|与ダメージ|与ダメ/.test(valueKind)) addSigned('addP');
    else if (/HP回復/.test(valueKind)) add('hpRecoveryP');
    else if (/治癒|回復量/.test(valueKind)) add('healingP');
    return bonuses;
  }

  function formatFdcSkillEffectValue(effect, skillLevel) {
    const levelInfo = getFdcEffectLevelInfo(effect, skillLevel);
    const rawValue = levelInfo?.raw || (levelInfo?.value ?? effect?.fixedValue);
    if (rawValue === undefined || rawValue === null || rawValue === '') return '';
    const text = levelInfo?.raw || formatPlainNumber(rawValue);
    const unit = shouldAppendFdcPercentUnit(effect) ? '%' : '';
    return `${text}${unit}`;
  }

  function getFdcSkillEffectDurationText(skill, effect, skillLevel) {
    if (effect?.duration !== undefined && effect?.duration !== null && effect?.duration !== '') {
      return formatFdcEffectDuration(effect.duration);
    }
    const effectKind = String(effect?.valueKind || '').replace(/[\s　]+/g, '');
    const processGroupId = String(effect?.processGroupId || '').trim();
    const processOrder = Number(effect?.processOrder);
    const effectCondition = String(effect?.condition || '').replace(/[\s　]+/g, '');
    const effectTarget = String(effect?.effectTarget || '').replace(/[\s　]+/g, '');
    const candidates = normalizeFdcArray(skill?.effects)
      .filter(candidate => candidate !== effect && (candidate?.valueClass === '持続時間' || /持続時間/.test(candidate?.valueKind || '')))
      .map(candidate => {
        const durationKind = String(candidate?.valueKind || '').replace(/[\s　]+/g, '');
        const baseKind = durationKind.replace(/(?:の)?持続時間.*$/, '');
        const candidateCondition = String(candidate?.condition || '').replace(/[\s　]+/g, '');
        const candidateTarget = String(candidate?.effectTarget || '').replace(/[\s　]+/g, '');
        const sameProcessGroup = !!processGroupId && processGroupId === String(candidate?.processGroupId || '').trim();
        const candidateOrder = Number(candidate?.processOrder);
        const adjacentGroupDuration = sameProcessGroup
          && Number.isFinite(processOrder)
          && Number.isFinite(candidateOrder)
          && candidateOrder === processOrder + 1;
        let score = 0;
        if (effectKind && durationKind === `${effectKind}の持続時間`) score += 100;
        else if (effectKind && baseKind && (effectKind === baseKind || effectKind.includes(baseKind) || baseKind.includes(effectKind))) score += 70;
        else if (baseKind === 'バフ' && effect?.effectType === 'バフ') score += 35;
        else if (adjacentGroupDuration) score += 25;
        if (!score) return { candidate, score: 0 };
        if (sameProcessGroup) score += 1000;
        if (effectCondition && candidateCondition && effectCondition === candidateCondition) score += 20;
        if (effectTarget && candidateTarget && effectTarget === candidateTarget) score += 10;
        return { candidate, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    if (!candidates.length || (candidates[1] && candidates[0].score === candidates[1].score)) return '';
    const durationEffect = candidates[0].candidate;
    const levelInfo = getFdcEffectLevelInfo(durationEffect, skillLevel);
    const rawValue = levelInfo?.raw || (levelInfo?.value ?? durationEffect?.fixedValue);
    return formatFdcEffectDuration(rawValue);
  }

  function formatFdcEffectDuration(value) {
    const text = String(value ?? '').trim();
    if (!text) return '';
    return `持続 ${/^[+-]?\d+(?:\.\d+)?$/.test(text) ? `${text}秒` : text}`;
  }

  function parseFdcDurationSeconds(value) {
    const match = String(value || '').match(/-?\d+(?:\.\d+)?/);
    const seconds = match ? Number(match[0]) : 0;
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  }

  function getFdcSkillEffectDisplayCondition(effect, ...fallbackParts) {
    const structured = getFdcStructuredEffectConditionText(effect);
    if (structured) return structured;
    const explicit = String(effect?.condition || '').trim();
    if (explicit) return explicit;
    return fallbackParts.map(part => String(part || '').trim())
      .find(part => part && !/対象候補|手動ON|条件一致|現在:|未設定/.test(part)) || '';
  }

  function getFdcSkillEffectConditionText(skill, effect) {
    return [
      getFdcStructuredEffectConditionText(effect),
      effect?.triggerType,
      effect?.triggerValue,
      effect?.triggerSourceId,
      effect?.conditionType,
      effect?.conditionValue,
      effect?.condition,
      effect?.effectTarget,
      effect?.valueKind,
      effect?.effectType,
      effect?.description,
      effect?.effectDescription,
      skill?.description
    ].filter(Boolean).join(' ');
  }

  function getFdcRuntimeEffectMetadata(effect = {}) {
    return {
      processGroupId: String(effect.processGroupId || '').trim(),
      processOrder: Number.isFinite(Number(effect.processOrder)) ? Number(effect.processOrder) : 0,
      triggerType: String(effect.triggerType || '').trim(),
      triggerValue: effect.triggerValue ?? '',
      triggerSourceId: String(effect.triggerSourceId || '').trim(),
      conditionType: String(effect.conditionType || '').trim(),
      conditionValue: effect.conditionValue ?? ''
    };
  }

  function getFdcStructuredEffectConditionText(effect = {}) {
    const meta = getFdcRuntimeEffectMetadata(effect);
    let triggerType = meta.triggerType;
    let triggerValue = meta.triggerValue;
    if (triggerType === 'n秒ごと' && triggerValue !== '') {
      triggerType = `${triggerValue}秒ごと`;
      triggerValue = '';
    } else if (triggerType === 'n回ごと' && triggerValue !== '') {
      triggerType = `${triggerValue}回ごと`;
      triggerValue = '';
    } else if (/^一定確率/.test(triggerType) && triggerValue !== '') {
      triggerType = `${triggerType} ${triggerValue}%`;
      triggerValue = '';
    }
    const displayConditionValue = /_e\d+$/.test(String(meta.conditionValue || ''))
      ? ''
      : meta.conditionValue;
    const trigger = [triggerType, triggerValue]
      .filter(value => value !== '' && value != null)
      .join(' ');
    const condition = [meta.conditionType, displayConditionValue]
      .filter(value => value !== '' && value != null)
      .join(' ');
    return [trigger ? `発動:${trigger}` : '', condition ? `適用:${condition}` : '']
      .filter(Boolean)
      .join(' / ');
  }

  function getFdcStructuredConditionState(effect = {}, context = null) {
    const type = String(effect.conditionType || '').trim();
    const value = String(effect.conditionValue ?? '').trim();
    if (!type) return { hasCondition: false, resolved: true, matched: true };
    if (type === '編成中') {
      const expected = normalizeComparableName(value);
      const matched = (context?.members || []).some(member =>
        [member?.id, member?.name].some(candidate => normalizeComparableName(candidate) === expected)
      );
      return { hasCondition: true, resolved: true, matched };
    }
    if (type === '対象使徒') {
      const expected = value.split(/[、,\/]/).map(normalizeComparableName).filter(Boolean);
      const actual = [context?.target?.id, context?.target?.name].map(normalizeComparableName);
      return { hasCondition: true, resolved: true, matched: expected.some(item => actual.includes(item)) };
    }
    if (type === '対象性格' || type === '味方性格') {
      const targetPersonality = context?.target?.basic?.personality
        || context?.target?.personality
        || context?.member?.personality
        || '';
      return {
        hasCondition: true,
        resolved: !!targetPersonality,
        matched: normalizePersonalityName(targetPersonality) === normalizePersonalityName(value)
      };
    }
    if (type === '対象役割') {
      const targetRole = context?.target?.basic?.role
        || context?.target?.role
        || context?.member?.role
        || '';
      return {
        hasCondition: true,
        resolved: !!targetRole,
        matched: normalizeRole(targetRole) === normalizeRole(value)
      };
    }
    if (type === '敵性格') {
      return { hasCondition: true, resolved: true, matched: normalizeComparableName(getEffectiveEnemyPersonality()) === normalizeComparableName(value) };
    }
    if (type === '敵配置列') {
      const enemyPosition = context?.enemyMember?.position || getSelectedEnemyPreset()?.position || '';
      return { hasCondition: true, resolved: !!enemyPosition, matched: normalizeComparableName(enemyPosition) === normalizeComparableName(value) };
    }
    if (type === '攻撃対象' || type === '攻撃元') {
      return { hasCondition: true, resolved: true, matched: !value || /現在の目標|目標の敵/.test(value) };
    }
    if (type === '攻撃対象状態' || type === '攻撃元状態') {
      const isCurrentTargetState = /^Leets_target(?:\/付与者=自身)?$/.test(value);
      return { hasCondition: true, resolved: isCurrentTargetState, matched: isCurrentTargetState };
    }
    if (type === '付与者' && /^(?:自身|本人)$/.test(value)) {
      return { hasCondition: true, resolved: true, matched: true };
    }
    return { hasCondition: true, resolved: false, matched: false };
  }

  function getFdcSkillEffectDefaultEnabled(text, effect, enemyPersonalityState = { hasCondition: false, defaultEnabled: true }, actionCategory = '', allyPersonalityState = { hasCondition: false, defaultEnabled: true }, context = null, sourceCategory = '') {
    const personalityEnabled = enemyPersonalityState?.hasCondition
      ? !!enemyPersonalityState.defaultEnabled
      : true;
    // 発動条件は datasheet の条件/対象スキルから、効果の適用範囲は値の種類から判定する。
    // 例: 「普通攻撃ダメージ量増加」は基本攻撃・強化攻撃だけに適用する。
    const structuredConditionState = getFdcStructuredConditionState(effect, context);
    if (structuredConditionState.hasCondition && structuredConditionState.resolved && !structuredConditionState.matched) return false;
    const structuredCondition = getFdcStructuredEffectConditionText(effect);
    const explicitCondition = String(effect?.condition || structuredCondition || '').trim();
    // 編成側の対象判定（getFormationSkillTargetState）が性格一致を確認している
    // 場合もあるため、ここでは味方性格条件を未対応イベント条件としてOFFにしない。
    // 本人スキルでは allyPersonalityState で一致/不一致を判定する。
    if (isAllyPersonalityConditionText(explicitCondition)) {
      return personalityEnabled
        && (!allyPersonalityState?.hasCondition || !!allyPersonalityState.defaultEnabled);
    }
    const namedTargetState = getNamedApostleTargetState(explicitCondition, context?.target);
    if (namedTargetState.hasCondition) {
      return personalityEnabled && namedTargetState.matched;
    }
    const actionText = [effect?.triggerType, effect?.triggerSourceId, effect?.condition, effect?.targetSkill].filter(Boolean).join(' ');
    const selectedActionCategory = actionCategory || view.selectedSkillCategory || '';
    const valueKindActionMatch = judgeFdcEffectValueActionScope(effect, selectedActionCategory);
    if (valueKindActionMatch.hasActionScope) return personalityEnabled && valueKindActionMatch.matched;
    const actionMatch = judgeActionCondition(actionText, selectedActionCategory);
    if (actionMatch.hasActionCondition) return personalityEnabled && actionMatch.matched;
    if (structuredConditionState.hasCondition && !structuredConditionState.resolved) return false;
    if (enemyPersonalityState?.hasCondition) return personalityEnabled;
    if (isFdcFormationAvailabilityCondition(explicitCondition, context)) return personalityEnabled;
    if (!explicitCondition && isDeterministicPassiveSpTiming(text, effect, sourceCategory)) return personalityEnabled;
    // 明示された状態/イベント条件は、現在の計算画面で再現できないため初期OFF。
    if (explicitCondition && !/^(?:バフ|デバフ|常時|無条件|なし)$/.test(explicitCondition)) return false;
    if (isTimedOrManualEffect(text, effect)) return false;
    return true;
  }

  function judgeFdcEffectValueActionScope(effect = {}, actionCategory = '') {
    const triggerAction = judgeActionCondition(
      [effect.triggerType, effect.triggerSourceId].filter(Boolean).join(' '),
      actionCategory
    );
    if (triggerAction.hasActionCondition) {
      return { hasActionScope: true, matched: triggerAction.matched };
    }
    const explicitCategories = getFdcDeclaredAttackCategories(effect.attackCategory);
    if (explicitCategories.length) {
      const selectedCategories = getFdcActionCategories(actionCategory);
      const matched = explicitCategories.some(expected =>
        selectedCategories.some(selected => matchesFdcAttackCategory(expected, selected))
      );
      return { hasActionScope: true, matched };
    }
    const targetSkillCategories = getFdcDeclaredAttackCategories(effect.targetSkill)
      .filter(item => /攻撃|スキル|自爆|状態異常|毒|苦痛|火傷|凍傷/.test(item));
    if (targetSkillCategories.length) {
      const selectedCategories = getFdcActionCategories(actionCategory);
      const matched = targetSkillCategories.some(expected =>
        selectedCategories.some(selected => matchesFdcAttackCategory(expected, selected))
      );
      return { hasActionScope: true, matched };
    }
    const valueKind = String(effect.valueKind || '');
    const category = getFdcSkillBaseCategory(actionCategory);
    if (/(?:通常|普通)攻撃.*ダメージ/.test(valueKind)) {
      return { hasActionScope: true, matched: category === '基本攻撃' || category === '強化攻撃' };
    }
    if (/基本攻撃.*ダメージ/.test(valueKind)) {
      return { hasActionScope: true, matched: category === '基本攻撃' };
    }
    if (/強化攻撃.*ダメージ/.test(valueKind)) {
      return { hasActionScope: true, matched: category === '強化攻撃' };
    }
    return { hasActionScope: false, matched: true };
  }

  function isDeterministicPassiveSpTiming(text, effect, sourceCategory = '') {
    const valueKind = String(effect?.valueKind || '');
    if (!/SP/.test(valueKind) || /SP減少|クールタイム|周期/.test(valueKind)) return false;
    if (String(effect?.triggerType || '').trim()) return false;
    if (!/パッシブ|愛用品|^A[1-3]$/.test(String(sourceCategory || ''))) return false;
    return /戦闘開始時|毎秒|1秒ごと|\d+(?:\.\d+)?秒ごと/.test(`${valueKind} ${text}`);
  }

  function isFdcFormationAvailabilityCondition(condition = '', context = null) {
    const match = String(condition || '').trim().match(/^(.+?)編成時(?:かつ(?:ウェーブ開始時|1\s*ウェーブ(?:中|目)?))?$/);
    if (!match) return false;
    const requiredName = normalizeComparableName(match[1]);
    if (!requiredName) return false;
    return (context?.members || []).some(member =>
      [member?.name, member?.id].some(value => normalizeComparableName(value) === requiredName)
    );
  }

  function formatFdcPercentValue(value) {
    if (value === undefined || value === null || value === '') return '';
    return `${formatPlainNumber(value)}%`;
  }

  function shouldAppendFdcPercentUnit(effect) {
    const text = [effect?.valueKind, effect?.valueClass, effect?.effectType].filter(Boolean).join(' ');
    if (/秒|回|個|スタック|Lv|レベル/.test(text)) return false;
    if (/SP/.test(String(effect?.valueKind || '')) && !/倍率/.test(String(effect?.valueClass || ''))) return false;
    return /倍率|増加|減少|上昇|低下|率|量|攻撃|防御|会心|ダメージ|HP|SP|治癒|回復/.test(text);
  }

  function isFdcDamageBonusValueClass(valueClass) {
    return !valueClass || /倍率|与ダメージ量増加|被ダメージ量減少/.test(String(valueClass));
  }

  function normalizeFdcSkillStatBonus(stat) {
    const applyTo = String(stat?.statApplyTo || '本人');
    if (/全体|味方/.test(applyTo)) return null;
    const value = Number(stat?.increaseP ?? stat?.increase ?? stat?.value);
    if (!Number.isFinite(value) || value === 0) return null;
    const name = String(stat?.statName || '');
    const bonuses = {};
    if (/最大?HP|HP/.test(name)) bonuses.hpP = value;
    else if (/物理攻撃/.test(name)) bonuses.physicalAtkP = value;
    else if (/魔法攻撃/.test(name)) bonuses.magicAtkP = value;
    else if (/攻撃力/.test(name)) bonuses.atkP = value;
    else if (/物理防御/.test(name)) bonuses.physicalDefP = value;
    else if (/魔法防御/.test(name)) bonuses.magicDefP = value;
    else if (/防御力/.test(name)) bonuses.defP = value;
    else if (/会心被(?:ダメージ量|DMG量)|被会心(?:ダメージ量|DMG量)|被会心.*ダメージ量|被会心.*DMG量/.test(name)) bonuses.critDmgResAddP = value;
    else if (/被会心率|被会心/.test(name)) bonuses.critResAddP = value;
    else if (/会心ダメージ抵抗|会心DMG抵抗/.test(name)) bonuses.critDmgResP = value;
    else if (/会心抵抗/.test(name)) bonuses.critResP = value;
    else if (/会心(?:ダメージ量|DMG量)/.test(name)) bonuses.critDmgAddP = value;
    else if (/会心ダメージ|会心DMG/.test(name)) bonuses.critDmgP = value;
    else if (/会心率/.test(name)) bonuses.critRateP = value;
    else if (/会心/.test(name)) bonuses.critP = value;
    return bonuses;
  }

  function renderAllApostlePicker(context) {
    const members = getFilteredPickerMembers(context);
    return `
      ${renderPickerTools(members.length, context.allMembers.length)}
      <div class="fdc-picker-all-grid">
        ${members.map(member => renderFormationPickerSlot(member, null, null, null, context.state?.cards)).join('')}
      </div>
    `;
  }

  function getFilteredPickerMembers(context) {
    const search = String(view.pickerSearch || '').trim().toLowerCase();
    const filters = view.pickerFilters || {};
    const members = context.allMembers.filter(member => {
      if (filters.personality && member.personality !== filters.personality) return false;
      if (filters.position && member.position !== filters.position) return false;
      if (filters.role && normalizeRole(member.role) !== filters.role) return false;
      if (!search) return true;
      return [member.id, member.name, member.personality, member.race, normalizeRole(member.role), member.position]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(search));
    });
    const nameSort = (a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'ja');
    const sortKey = view.pickerSort || 'name';
    return members.sort((a, b) => {
      if (sortKey === 'level') return (Number(b.level) || 0) - (Number(a.level) || 0) || nameSort(a, b);
      if (sortKey === 'rank') return (Number(b.rank) || 0) - (Number(a.rank) || 0) || nameSort(a, b);
      if (sortKey === 'combatPower') return (Number(b.stats?.combatPower) || 0) - (Number(a.stats?.combatPower) || 0) || nameSort(a, b);
      if (sortKey === 'position') return POSITIONS.indexOf(a.position) - POSITIONS.indexOf(b.position) || nameSort(a, b);
      if (sortKey === 'star') return (Number(b.star) || 0) - (Number(a.star) || 0) || nameSort(a, b);
      return nameSort(a, b);
    });
  }

  function renderPickerTools(count, total) {
    return `
      <div class="fdc-picker-tools">
        <label class="fdc-picker-search">
          <span>検索</span>
          <input type="search" value="${escapeAttr(view.pickerSearch || '')}" data-fdc-picker-search placeholder="使徒名 / 種族など">
        </label>
        <label>
          <span>並び</span>
          <select data-fdc-picker-sort>
            ${renderSelectOption('name', '50音順', view.pickerSort)}
            ${renderSelectOption('combatPower', '戦闘力順', view.pickerSort)}
            ${renderSelectOption('level', 'Lv順', view.pickerSort)}
            ${renderSelectOption('rank', 'Rank順', view.pickerSort)}
            ${renderSelectOption('star', '★順', view.pickerSort)}
            ${renderSelectOption('position', '配置順', view.pickerSort)}
          </select>
        </label>
        <label>
          <span>性格</span>
          <select data-fdc-picker-filter="personality">
            ${renderSelectOption('', 'すべて', view.pickerFilters.personality)}
            ${['純粋', '冷静', '狂気', '活発', '憂鬱'].map(value => renderSelectOption(value, value, view.pickerFilters.personality)).join('')}
          </select>
        </label>
        <label>
          <span>列</span>
          <select data-fdc-picker-filter="position">
            ${renderSelectOption('', 'すべて', view.pickerFilters.position)}
            ${POSITIONS.map(value => renderSelectOption(value, value, view.pickerFilters.position)).join('')}
          </select>
        </label>
        <label>
          <span>役割</span>
          <select data-fdc-picker-filter="role">
            ${renderSelectOption('', 'すべて', view.pickerFilters.role)}
            ${['守備', '攻撃', '支援'].map(value => renderSelectOption(value, value, view.pickerFilters.role)).join('')}
          </select>
        </label>
        <span class="fdc-picker-count">${escapeHtml(`${count}/${total}`)}</span>
      </div>
    `;
  }

  function renderSelectOption(value, label, current) {
    return `<option value="${escapeAttr(value)}" ${String(current || '') === String(value) ? 'selected' : ''}>${escapeHtml(label)}</option>`;
  }

  function renderFormationPickerSlot(member, rowIndex, lineIndex, pendingMember = null, cards = {}) {
    const canPlacePending = !!pendingMember && rowIndex === getPreferredPositionIndex(pendingMember);
    const pendingSlotAttrs = canPlacePending
      ? `data-fdc-temp-member-slot="${rowIndex}:${lineIndex}"`
      : '';
    if (!member) {
      return `
        <button type="button" class="fdc-picker-slot is-empty ${canPlacePending ? 'is-placeable' : ''} ${pendingMember && !canPlacePending ? 'is-locked' : ''}" ${pendingSlotAttrs} ${canPlacePending ? '' : 'disabled'} aria-label="${POSITIONS[rowIndex]} ${lineIndex + 1} 空き">
          <span>${canPlacePending ? '+' : ''}</span>
        </button>
      `;
    }
    const isTempMember = rowIndex != null && lineIndex != null && !!view.tempMembers?.[`${rowIndex}:${lineIndex}`];
    const placementClass = pendingMember ? (canPlacePending ? 'is-placeable' : 'is-locked') : '';
    return `
      <button type="button" class="fdc-picker-slot is-filled ${member.id === view.targetId ? 'is-active' : ''} ${isTempMember ? 'is-temp' : ''} ${placementClass} personality-${escapeAttr(member.personality || '')}" data-fdc-member-id="${escapeAttr(member.id)}" ${pendingSlotAttrs} ${pendingMember && !canPlacePending ? 'disabled' : ''} title="${escapeAttr(member.name)}${isTempMember ? ' / 一時配置' : ''}">
        <img class="fdc-picker-portrait" src="${escapeAttr(getApostleImage(member.id, member.name))}" alt="" data-fallback>
        ${renderApostleBadges(member)}
        ${rowIndex == null || lineIndex == null ? '' : renderPickerArtifactStrip(member, cards)}
      </button>
    `;
  }

  function renderPickerArtifactStrip(member, cards = {}) {
    const artifacts = Array.from({ length: 3 }, (_, index) => {
      const id = member.artifactIds?.[index] || '';
      const row = id ? createArtifactDisplayRow(id, 1, cards[id], { owner: member.name, slot: index + 1 }) : null;
      if (!row) return `<span class="fdc-picker-artifact-mini is-empty" aria-hidden="true">${renderArtifactIcon(null, index)}</span>`;
      return `<span class="fdc-picker-artifact-mini is-filled ${getCardRarityClass(row)}" title="${escapeAttr(`${row.name} / ★${row.star}${row.solder ? ` / はんだ+${row.solder}` : ''}`)}">${renderArtifactIcon(row, index)}</span>`;
    }).join('');
    return `<span class="fdc-picker-artifacts" aria-label="装備遺物">${artifacts}</span>`;
  }

  function toggleFormationPicker(forceOpen = null) {
    if (!el.formationPicker) return;
    const shouldOpen = forceOpen === null ? el.formationPicker.hidden : !!forceOpen;
    el.formationPicker.hidden = !shouldOpen;
    el.formationPicker.classList.toggle('is-floating-picker', shouldOpen);
    if (shouldOpen) {
      renderFormationPicker(buildContext());
    }
    el.targetPreview?.setAttribute('aria-expanded', String(shouldOpen));
    updateFloatingTargetVisibility();
  }

  function closeFormationPicker() {
    if (!el.formationPicker) return;
    el.formationPicker.hidden = true;
    el.formationPicker.classList.remove('is-floating-picker');
    view.pendingTempMemberId = '';
    el.targetPreview?.setAttribute('aria-expanded', 'false');
    updateFloatingTargetVisibility();
  }

  function renderApostleBadges(member) {
    const personality = member.personality || '';
    const roleAsset = getRoleAssetName(member.role);
    const attackType = resolveDamageType('auto', member);
    const attackAsset = attackType === 'magic' ? 'mag' : attackType === 'physical' ? 'phys' : '';
    const position = member.position || '';
    return `
      ${personality ? `<img class="fdc-apostle-badge fdc-personality-badge" src="img/性格_${escapeAttr(personality)}.webp" alt="${escapeAttr(personality)}" title="${escapeAttr(personality)}">` : ''}
      ${position ? `<img class="fdc-apostle-badge fdc-position-badge" src="img/配置列_${escapeAttr(position)}.webp" alt="${escapeAttr(position)}" title="${escapeAttr(position)}">` : ''}
      ${roleAsset ? `<img class="fdc-apostle-badge fdc-role-badge" src="img/役割_${escapeAttr(roleAsset)}.webp" alt="${escapeAttr(member.role || '')}" title="${escapeAttr(member.role || '')}">` : ''}
      ${attackAsset ? `<img class="fdc-apostle-badge fdc-attack-badge" src="img/Attack_${attackAsset}.webp" alt="${escapeAttr(member.attackType || '')}" title="${escapeAttr(member.attackType || '')}">` : ''}
    `;
  }

  function getRoleAssetName(role) {
    const normalized = normalizeRole(role);
    if (normalized === '守備') return '防御';
    if (normalized === '支援') return '支援';
    if (normalized === '攻撃') return '攻撃';
    return '';
  }

  function renderArtifactCategory(context) {
    if (!el.artifactCategory) return;
    const targetSlots = getTargetArtifactSlots(context);
    const artifactLimit = Number(getActiveEnemyContentRules().artifactLimit) || 0;
    const artifactCount = getFormationArtifactRows(context)
      .reduce((sum, row) => sum + Math.max(1, Number(row.qty) || 1), 0);
    const artifactLimitExceeded = artifactLimit > 0 && artifactCount > artifactLimit;
    const equippedEffects = getArtifactEffectRows(context.effects, true).filter(isEffectRelevantToPerspective);
    const formationEffects = getFormationArtifactEffectRows(context.effects).filter(isEffectRelevantToPerspective);
    const equippedAutoEffects = equippedEffects.filter(isAutomaticBonusEffect);
    const equippedDetailEffects = equippedEffects.filter(item => !isAutomaticBonusEffect(item));
    const formationAutoEffects = formationEffects.filter(isAutomaticBonusEffect);
    const formationDetailEffects = formationEffects.filter(item => !isAutomaticBonusEffect(item));
    const allDetailEffects = [...equippedDetailEffects, ...formationDetailEffects];
    const enabled = isEffectSourceActive('artifact');
    el.artifactCategory.innerHTML = `
      ${artifactLimit ? `
        <div class="fdc-artifact-limit ${artifactLimitExceeded ? 'is-over' : ''}">
          <span>次元の遺物制限</span>
          <strong>${formatNumber(artifactCount)} / ${formatNumber(artifactLimit)}</strong>
        </div>` : ''}
      <section class="fdc-artifact-section">
        <h4>編成</h4>
        <div class="fdc-artifact-board">
          ${renderFormationArtifactBoard(context)}
        </div>
      </section>
      <section class="fdc-artifact-section">
        <h4>装備遺物</h4>
        <div class="fdc-equipped-artifact-list">
          ${targetSlots.map((row, index) => renderEquippedArtifactRow(row, index)).join('')}
        </div>
      </section>
      <div class="fdc-artifact-effect-columns">
        <section class="fdc-artifact-effect-box ${enabled ? '' : 'is-disabled'}">
          <h4>装備遺物補正 <span>${enabled ? 'ON' : 'OFF'}</span></h4>
          <div class="fdc-artifact-effect-chips">
            ${renderArtifactBonusSummary(equippedAutoEffects, enabled)}
            ${!equippedAutoEffects.length ? '<p class="fdc-empty">装備遺物の補正なし</p>' : ''}
          </div>
        </section>
        <section class="fdc-artifact-effect-box ${enabled ? '' : 'is-disabled'}">
          <h4>編成遺物補正 <span>${enabled ? 'ON' : 'OFF'}</span></h4>
          <div class="fdc-artifact-effect-chips">
            ${renderArtifactBonusSummary(formationAutoEffects, enabled)}
            ${!formationAutoEffects.length ? '<p class="fdc-empty">影響する編成遺物なし</p>' : ''}
          </div>
        </section>
      </div>
      <section class="fdc-artifact-effect-box fdc-artifact-detail-box ${enabled ? '' : 'is-disabled'}">
        <h4>遺物特殊効果 <span>${enabled ? 'ON' : 'OFF'}</span></h4>
        <div class="fdc-artifact-effect-chips">
          ${allDetailEffects.length ? renderGroupedArtifactEffectChips(allDetailEffects, enabled) : '<p class="fdc-empty">計算に影響する特殊効果なし</p>'}
        </div>
      </section>
    `;
  }
  function renderFormationArtifactBoard(context) {
    return Array.from({ length: 3 }, (_, lineIndex) => `
      <div class="fdc-artifact-board-row">
        ${POSITIONS.map((position, rowIndex) => renderFormationArtifactCell(context, rowIndex, lineIndex)).join('')}
      </div>
    `).join('');
  }

  function renderFormationArtifactCell(context, rowIndex, lineIndex) {
    const row = context.formation?.rows?.[rowIndex] || {};
    const apostleId = row.apostles?.[lineIndex] || '';
    const member = context.members.find(item => item.id === apostleId);
    const artifactIds = row.artifacts?.[lineIndex] || [];
    const artifactRows = Array.from({ length: 3 }, (_, index) => {
      const id = artifactIds[index] || '';
      const cardState = context.state?.cards?.[id];
      return createArtifactDisplayRow(id, 1, cardState, {
        owner: member?.name || '',
        position: POSITIONS[rowIndex],
        line: lineIndex + 1,
        slot: index + 1,
        scope: apostleId === context.target?.id ? 'self' : 'formation'
      });
    });
    const active = apostleId && apostleId === context.target?.id;
    return `
      <div class="fdc-artifact-board-cell ${active ? 'is-target' : ''}" title="${escapeAttr(`${POSITIONS[rowIndex]}${lineIndex + 1}`)}">
        <span class="fdc-artifact-cell-apostle">
          ${member ? `<img src="${escapeAttr(getApostleImage(member.id, member.name))}" alt="">` : '<span>?</span>'}
        </span>
        <span class="fdc-artifact-cell-items">
          ${Array.from({ length: 3 }, (_, index) => renderArtifactTiny(artifactRows[index], { rowIndex, lineIndex, slotIndex: index })).join('')}
        </span>
      </div>
    `;
  }

  function getTargetArtifactSlots(context) {
    const cards = context.state?.cards || {};
    return Array.from({ length: 3 }, (_, index) => {
      const id = context.target?.artifactIds?.[index] || '';
      return createArtifactDisplayRow(id, 1, cards[id], {
        owner: context.target?.name || '',
        scope: 'self',
        slot: index + 1
      });
    });
  }

  function getFormationArtifactRows(context) {
    const cards = context.state?.cards || {};
    return (context.formation?.rows || []).flatMap((row, rowIndex) =>
      (row.artifacts || []).flatMap((lineArtifacts, lineIndex) => {
        const ownerId = row.apostles?.[lineIndex] || '';
        const owner = getApostle(ownerId)?.使徒名 || ownerId || `編成${lineIndex + 1}`;
        return countIds(lineArtifacts || []).map(({ id, qty }) => createArtifactDisplayRow(id, qty, cards[id], {
          owner,
          position: POSITIONS[rowIndex] || '',
          line: lineIndex + 1,
          scope: ownerId === context.target?.id ? 'self' : 'formation'
        }));
      })
    ).filter(Boolean);
  }

  function createArtifactDisplayRow(id, qty, cardState = {}, meta = {}) {
    const card = getCard(id);
    if (!card || card.kind !== 'artifact') return null;
    const row = createCardRow(id, qty, cardState);
    return {
      ...row,
      rarity: card.rarity || '',
      signature: !!card.signature,
      favoriteCharacter: card.favoriteCharacter || '',
      owned: !!meta.owned || !!cardState?.owned,
      image: getCardImagePath(card),
      bg: getFormationArtifactBg(card),
      owner: meta.owner || '',
      position: meta.position || '',
      line: meta.line || '',
      slot: meta.slot || '',
      scope: meta.scope || 'formation'
    };
  }

  function renderArtifactSlot(row, index) {
    return `<button type="button" class="fdc-artifact-slot ${row ? `is-filled ${getCardRarityClass(row)}` : 'is-empty'}" title="${escapeAttr(row ? `${row.name} / ★${row.star}${row.solder ? ` / はんだ+${row.solder}` : ''}` : '遺物を選択')}" disabled>${renderArtifactIcon(row, index)}</button>`;
  }

  function renderArtifactIcon(row, index = 0) {
    if (!row) {
      return `
        <img class="fdc-artifact-bg" src="img/遺物bg_0.png" alt="">
        <span class="fdc-artifact-empty-icon">${index + 1}</span>
      `;
    }
    return `
      <img class="fdc-artifact-bg" src="${escapeAttr(row.bg)}" alt="">
      <img class="fdc-artifact-img" src="${escapeAttr(row.image)}" alt="">
      ${row.solder ? `<span class="fdc-artifact-solder">+${escapeHtml(row.solder)}</span>` : ''}
    `;
  }

  function renderEquippedArtifactRow(row, index) {
    if (!row) {
      return `
        <div class="fdc-equipped-artifact-row is-empty">
          <button type="button" class="fdc-artifact-slot is-empty" data-fdc-temp-artifact-row="target" data-fdc-temp-artifact-slot="${index}" title="一時的に遺物を選択">${renderArtifactIcon(null, index)}</button>
          <span class="fdc-equipped-artifact-info">
            <strong>装備遺物${index + 1}</strong>
            <small>未装備</small>
          </span>
          <span class="fdc-equipped-artifact-action">入替</span>
        </div>
      `;
    }
    return `
      <div class="fdc-equipped-artifact-row ${getCardRarityClass(row)}">
        <button type="button" class="fdc-artifact-slot is-filled ${getCardRarityClass(row)}" data-fdc-temp-artifact-row="target" data-fdc-temp-artifact-slot="${index}" title="${escapeAttr(`${row.name}を一時入替`)}">${renderArtifactIcon(row, index)}</button>
        <span class="fdc-equipped-artifact-info">
          <strong>${escapeHtml(row.name)}</strong>
          <small>${escapeHtml(`コスト${getCardCostById(row.id, row.star)} / ★${row.star}${row.solder ? ` / はんだ+${row.solder}` : ''}`)}</small>
          ${renderFdcTempCardGrowthControls(row)}
        </span>
        <span class="fdc-equipped-artifact-effect" data-fdc-artifact-detail="${escapeAttr(row.id)}" data-fdc-artifact-star="${escapeAttr(row.star)}" data-fdc-artifact-solder="${escapeAttr(row.solder || 0)}" title="効果詳細">i</span>
      </div>
    `;
  }

  function renderArtifactTiny(row, meta = {}) {
    const data = meta.rowIndex == null
      ? ''
      : `data-fdc-temp-artifact-row="${escapeAttr(meta.rowIndex)}" data-fdc-temp-artifact-line="${escapeAttr(meta.lineIndex)}" data-fdc-temp-artifact-slot="${escapeAttr(meta.slotIndex)}"`;
    if (!row) return `<button type="button" class="fdc-artifact-tiny is-empty" ${data} title="遺物を一時選択"></button>`;
    return `
      <button type="button" class="fdc-artifact-tiny ${getCardRarityClass(row)}" ${data} title="${escapeAttr(`${row.name}を一時入替`)}">
        <img class="fdc-artifact-bg" src="${escapeAttr(row.bg)}" alt="">
        <img class="fdc-artifact-img" src="${escapeAttr(row.image)}" alt="">
      </button>
    `;
  }

  function openTempArtifactPickerFromElement(element, context) {
    const target = (() => {
      if (element.dataset.fdcTempArtifactRow === 'enemy') {
        return {
          type: 'enemy',
          apostleId: context.enemyMember?.id || view.enemyApostleId || '',
          slotIndex: Number(element.dataset.fdcTempArtifactSlot) || 0
        };
      }
      if (element.dataset.fdcTempArtifactRow !== 'target') {
        return {
          type: 'formation',
          rowIndex: Number(element.dataset.fdcTempArtifactRow),
          lineIndex: Number(element.dataset.fdcTempArtifactLine),
          slotIndex: Number(element.dataset.fdcTempArtifactSlot) || 0
        };
      }
      const rowIndex = POSITIONS.indexOf(context.target?.position || '');
      const lineIndex = Number(context.target?.line) - 1;
      if (rowIndex >= 0 && lineIndex >= 0) {
        return {
          type: 'formation',
          rowIndex,
          lineIndex,
          slotIndex: Number(element.dataset.fdcTempArtifactSlot) || 0
        };
      }
      return {
          type: 'target',
          apostleId: context.target?.id || '',
          slotIndex: Number(element.dataset.fdcTempArtifactSlot) || 0
        };
    })();
    if ((target.type === 'target' || target.type === 'enemy') && !target.apostleId) return;
    if (target.type === 'formation' && (!Number.isFinite(target.rowIndex) || !Number.isFinite(target.lineIndex))) return;
    view.artifactPicker = target;
    const picker = getTempArtifactPicker(true);
    renderTempArtifactPicker(context);
    positionTempArtifactPicker(picker, element);
  }

  function getTempArtifactPicker(create = true) {
    let picker = document.getElementById('fdc-temp-artifact-picker');
    if (!picker && create) {
      picker = document.createElement('div');
      picker.id = 'fdc-temp-artifact-picker';
      picker.className = 'fdc-temp-artifact-picker';
      picker.hidden = true;
      document.body.appendChild(picker);
    }
    return picker;
  }

  function renderTempArtifactPicker(context) {
    const picker = getTempArtifactPicker(true);
    const cards = context.state?.cards || {};
    const options = getTempArtifactOptions(cards);
    const currentId = getCurrentTempArtifactId(context);
    const currentRow = currentId ? createArtifactDisplayRow(currentId, 1, cards[currentId]) : null;
    picker.innerHTML = `
      <div class="fdc-temp-artifact-head">
        <strong>${view.artifactPicker?.type === 'enemy' ? '敵遺物を入替' : '遺物を一時入替'}</strong>
        <button type="button" data-fdc-temp-artifact-close aria-label="閉じる">${renderUiIcon('close')}</button>
      </div>
      ${currentRow && view.artifactPicker?.type !== 'enemy' ? `
        <div class="fdc-temp-artifact-growth-current">
          <span><strong>${escapeHtml(currentRow.name)}</strong><small>一時育成</small></span>
          ${renderFdcTempCardGrowthControls(currentRow)}
        </div>` : ''}
      <div class="fdc-temp-artifact-grid">
        <button type="button" class="fdc-temp-artifact-option is-clear ${currentId ? '' : 'is-active'}" data-fdc-temp-artifact-value="">
          <span class="fdc-temp-artifact-empty">空</span>
          <strong>未装備</strong>
        </button>
        ${options.map(row => `
          <button type="button" class="fdc-temp-artifact-option ${getCardRarityClass(row)} ${row.owned ? '' : 'is-unowned'} ${row.id === currentId ? 'is-active' : ''}" data-fdc-temp-artifact-value="${escapeAttr(row.id)}">
            <span class="fdc-artifact-slot is-filled ${getCardRarityClass(row)}">
              ${renderArtifactIcon(row, 0)}
              <span class="fdc-temp-artifact-info" role="button" tabindex="0"
                data-fdc-artifact-detail="${escapeAttr(row.id)}"
                data-fdc-artifact-star="${escapeAttr(row.star)}"
                data-fdc-artifact-solder="${escapeAttr(row.solder || 0)}"
                aria-label="${escapeAttr(`${row.name}の効果詳細`)}" title="効果詳細">i</span>
            </span>
            <span class="fdc-temp-artifact-text">
              <strong>${escapeHtml(row.name)}</strong>
              <small>${escapeHtml(`${row.rarity || ''} / コスト${getCardCostById(row.id, row.star)} / ★${row.star}${row.solder ? ` / +${row.solder}` : ''}`)}</small>
            </span>
          </button>
        `).join('')}
      </div>
    `;
    picker.hidden = false;
    picker.querySelector('[data-fdc-temp-artifact-close]')?.addEventListener('click', closeTempArtifactPicker);
    picker.querySelectorAll('[data-fdc-temp-artifact-value]').forEach(button => {
      button.addEventListener('click', event => {
        if (event.target.closest('[data-fdc-artifact-detail]')) return;
        applyTempArtifactValue(button.dataset.fdcTempArtifactValue || '');
        closeTempArtifactPicker();
      });
    });
    picker.querySelectorAll('[data-fdc-artifact-detail]').forEach(button => {
      button.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        showFdcArtifactPopover(button);
      });
    });
  }

  function getTempArtifactOptions(cards = {}) {
    const artifacts = typeof CARD_LIBRARY === 'undefined' ? [] : CARD_LIBRARY.artifacts || [];
    return artifacts.map(card => {
      const state = cards[card.id] || {};
      return createArtifactDisplayRow(card.id, 1, state, { owned: !!state.owned });
    }).filter(Boolean).sort((a, b) => {
      if (a.owned !== b.owned) return a.owned ? -1 : 1;
      return compareArtifactOption(a, b);
    });
  }

  function compareArtifactOption(a, b) {
    const rarityOrder = { 伝説: 5, 希少: 4, 高級: 3, 一般: 2 };
    const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    if (rarityDiff) return rarityDiff;
    const costDiff = getCardCostById(b.id, b.star) - getCardCostById(a.id, a.star);
    if (costDiff) return costDiff;
    return String(a.name).localeCompare(String(b.name), 'ja');
  }

  function getCurrentTempArtifactId(context) {
    const target = view.artifactPicker;
    if (!target) return '';
    if (target.type === 'target') {
      return context.target?.artifactIds?.[target.slotIndex] || '';
    }
    if (target.type === 'enemy') {
      return context.enemyMember?.artifactIds?.[target.slotIndex] || '';
    }
    return context.formation?.rows?.[target.rowIndex]?.artifacts?.[target.lineIndex]?.[target.slotIndex] || '';
  }

  function applyTempArtifactValue(id) {
    const target = view.artifactPicker;
    if (!target) return;
    if (target.type === 'target') {
      if (!view.tempArtifacts.target[target.apostleId]) view.tempArtifacts.target[target.apostleId] = {};
      view.tempArtifacts.target[target.apostleId][target.slotIndex] = id || '';
    } else if (target.type === 'enemy') {
      const context = buildContext();
      const settings = ensureEnemyIndividualOverride(context, target.apostleId);
      if (!settings) return;
      settings.artifactIds = Array.from({ length: 3 }, (_, index) => settings.artifactIds?.[index] || '');
      settings.artifactIds[target.slotIndex] = id || '';
      settings.artifactSettings = Array.from({ length: 3 }, (_, index) => settings.artifactSettings?.[index] || { star: 1, solder: 0 });
      const managerCard = context.state?.cards?.[id] || {};
      const managerStar = Math.max(1, Math.min(5, Number(managerCard.star) || 1));
      settings.artifactSettings[target.slotIndex] = {
        star: managerStar,
        solder: managerStar >= 5 ? Math.max(0, Math.min(2, Number(managerCard.solder) || 0)) : 0
      };
      view.enemyIndividualOverrides[target.apostleId] = normalizeEnemyIndividualSettings(settings, context, target.apostleId);
      view.enemyStatDirty = false;
      view.enemyGlobalPercentDirty = false;
      saveCalcSettings();
    } else {
      view.tempArtifacts.formation[`${target.rowIndex}:${target.lineIndex}:${target.slotIndex}`] = id || '';
    }
    view.statDirty = false;
    render();
  }

  function closeTempArtifactPicker() {
    const picker = getTempArtifactPicker(false);
    if (picker) picker.hidden = true;
    view.artifactPicker = null;
  }

  function positionTempArtifactPicker(picker, anchor) {
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(420, window.innerWidth - 24);
    const viewportTop = 12;
    const resultBarTop = el.result?.bar?.getBoundingClientRect?.().top || window.innerHeight;
    const bottomLimit = Math.max(viewportTop + 120, Math.min(window.innerHeight - 12, resultBarTop - 12));
    const topPreferred = rect.bottom + 8;
    const maxHeight = Math.max(120, Math.min(560, bottomLimit - viewportTop));
    picker.style.width = `${width}px`;
    picker.style.left = `${Math.min(window.innerWidth - width - 12, Math.max(12, rect.left))}px`;
    picker.style.maxHeight = `${maxHeight}px`;
    picker.hidden = false;
    const height = Math.min(picker.offsetHeight || maxHeight, maxHeight);
    let top = topPreferred;
    if (top + height > bottomLimit) {
      const aboveTop = rect.top - 8 - height;
      top = aboveTop >= viewportTop ? aboveTop : bottomLimit - height;
    }
    top = Math.max(viewportTop, Math.min(top, bottomLimit - height));
    picker.style.top = `${top}px`;
  }

  function renderArtifactMini(row) {
    const meta = [row.owner, row.position].filter(Boolean).join(' / ');
    return `
      <span class="fdc-artifact-mini ${row.scope === 'self' ? 'is-self' : ''}" title="${escapeAttr([row.name, meta].filter(Boolean).join(' / '))}">
        <img class="fdc-artifact-bg" src="${escapeAttr(row.bg)}" alt="">
        <img class="fdc-artifact-img" src="${escapeAttr(row.image)}" alt="">
      </span>
    `;
  }

  function getCardImagePath(card) {
    if (!card) return '';
    const folder = card.kind === 'artifact' ? 'Artifact' : 'Spell';
    return `img/Card/${folder}/${card.imageFile || `${card.name}.webp`}`;
  }

  function getCardCostById(id, star = 1) {
    const card = getCard(id);
    if (!card) return 0;
    if (Array.isArray(card.costByStar) && card.costByStar.length) {
      const index = Math.max(0, Math.min(card.costByStar.length - 1, Number(star) - 1 || 0));
      return card.costByStar[index] || 0;
    }
    return card.cost || 0;
  }

  function syncCardCostUi(context) {
    if (!el.cardCost) return;
    const artifactCost = getFormationArtifactRows(context)
      .reduce((sum, row) => sum + getCardCostById(row.id, row.star) * row.qty, 0);
    const spellCost = getFdcSelectedSpellRows(context)
      .reduce((sum, row) => sum + getCardCostById(row.id, row.star) * row.qty, 0);
    const totalCost = artifactCost + spellCost;
    el.cardCost.querySelectorAll('.fdc-card-cost-text').forEach(value => {
      value.textContent = formatNumber(totalCost);
    });
    const costs = { artifact: artifactCost, spell: spellCost, total: totalCost };
    el.cardCostPanel?.querySelectorAll('[data-fdc-card-cost-value]').forEach(value => {
      value.textContent = formatNumber(costs[value.dataset.fdcCardCostValue] || 0);
    });
    const detail = `カード合計コスト ${formatNumber(totalCost)}（遺物 ${formatNumber(artifactCost)} / スペル ${formatNumber(spellCost)}）`;
    el.cardCost.title = detail;
    el.cardCost.setAttribute('aria-label', detail);
  }

  function getFormationArtifactBg(card) {
    if (!card) return 'img/遺物bg_0.png';
    if (card.signature) return 'img/遺物bg_4.png';
    if (card.rarity === '伝説') return 'img/遺物bg_4.png';
    if (card.rarity === '希少') return 'img/遺物bg_3.png';
    if (card.rarity === '高級') return 'img/遺物bg_2.png';
    return 'img/遺物bg_0.png';
  }

  function getCardRarityClass(row) {
    if (row.signature) return 'rarity-signature';
    if (row.rarity === '伝説') return 'rarity-legendary';
    if (row.rarity === '希少') return 'rarity-unique';
    if (row.rarity === '高級') return 'rarity-rare';
    return 'rarity-normal';
  }

  function getArtifactEffectRows(effects, selfOnly = false) {
    return [
      ...(effects.applied || []),
      ...(effects.conditional || [])
    ].filter(item => hasAnySourceTag(item, ['遺物', '愛用遺物']))
      .filter(item => !selfOnly || item.source === '装備遺物' || item.cardSource === '装備遺物');
  }

  function getFormationArtifactEffectRows(effects) {
    return getArtifactEffectRows(effects, false)
      .filter(item => item.source !== '装備遺物' && item.cardSource !== '装備遺物');
  }

  function isAutomaticBonusEffect(item) {
    const status = item.tags?.status || [];
    return item.bonuses
      && Object.keys(item.bonuses).length
      && status.includes('自動適用')
      && !status.includes('スキル変更');
  }

  function isVisibleDamageRelatedEffect(item) {
    if (!item.bonuses || !Object.keys(getRelevantBonusMap(item.bonuses)).length) return false;
    return isEffectRelevantToPerspective(item);
  }

  function renderArtifactBonusSummary(rows, enabled = true) {
    const summary = summarizeRelevantEffects(rows);
    const chips = Object.entries(summary || {})
      .filter(([, value]) => Number(value))
      .map(([key, value]) => `<span class="fdc-artifact-bonus-chip ${enabled ? '' : 'is-disabled'}">${escapeHtml(formatBonusMap({ [key]: value }))}</span>`);
    if (!chips.length) return '';
    return `<div class="fdc-artifact-bonus-summary">${chips.join('')}</div>`;
  }

  function renderGroupedArtifactEffectChips(rows, enabled) {
    const cards = groupArtifactEffectRows(rows.filter(isVisibleDamageRelatedEffect))
      .map(group => renderArtifactEffectGroupChip(group, enabled))
      .join('');
    return cards ? `<div class="fdc-artifact-card-grid">${cards}</div>` : '';
  }

  // 見出しはカード単位、状態・スタック・トグルは効果単位で保持する。
  // 同じカードを複数人が持つ場合も、所持者はメタ情報として集約する。
  function groupArtifactEffectRows(rows) {
    const cards = new Map();
    rows.forEach(row => {
      const cardKey = row.cardName || row.source || 'artifact';
      if (!cards.has(cardKey)) {
        cards.set(cardKey, {
          title: row.cardName || row.label || '遺物',
          sources: [],
          ownerLabels: [],
          effects: new Map()
        });
      }
      const cardGroup = cards.get(cardKey);
      const effectKey = row.overlapStackKey || [row.label || '', row.conditionKey || ''].join('::');
      if (!cardGroup.effects.has(effectKey)) cardGroup.effects.set(effectKey, { rows: [] });
      const effectGroup = cardGroup.effects.get(effectKey);
      const duplicateKey = row.conditionKey || [row.source, row.cardName, row.label, JSON.stringify(row.bonuses || {})].join('::');
      if (!effectGroup.rows.some(candidate => (candidate.conditionKey || [candidate.source, candidate.cardName, candidate.label, JSON.stringify(candidate.bonuses || {})].join('::')) === duplicateKey)) {
        effectGroup.rows.push(row);
      }
      if (row.source) cardGroup.sources.push(row.source);
      if (row.ownerLabel) cardGroup.ownerLabels.push(row.ownerLabel);
    });
    return Array.from(cards.values()).map(group => ({
      ...group,
      effects: Array.from(group.effects.values())
    }));
  }

  function renderArtifactEffectGroupChip(group, enabled) {
    const owners = unique(group.ownerLabels);
    // スペル補正セクション内の「スペル」は見出しと重複するため表示しない。
    const sources = unique(group.sources).filter(source => source !== 'スペル');
    const meta = owners.length ? `所持: ${owners.join(' / ')}` : sources.join(' / ');
    const effects = group.effects.map(effectGroup => renderArtifactEffectItem(effectGroup, enabled)).join('');
    return `
      <div class="fdc-artifact-effect-group ${enabled ? '' : 'is-disabled'}">
        <strong>${escapeHtml(group.title)}</strong>
        ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
        <div class="fdc-artifact-card-effects">${effects}</div>
      </div>
    `;
  }

  function renderArtifactEffectItem(group, enabled) {
    const item = getArtifactEffectGroupItem(group);
    const effectChip = renderArtifactEffectMiniChip(item);
    const stackEnabled = !!enabled && !!item.groupEnabled;
    const stackControls = [renderArtifactStackControl(item, stackEnabled), renderArtifactSharedStackControl(item, stackEnabled)].filter(Boolean).join('');
    return `
      <div class="fdc-artifact-card-effect">
        ${item.scopeLabel ? `<small class="fdc-artifact-effect-scope">対象: ${escapeHtml(item.scopeLabel)}</small>` : ''}
        <div class="fdc-artifact-effect-group-chips">${effectChip}</div>
        ${stackControls ? `<div class="fdc-artifact-effect-stack-controls">${stackControls}</div>` : ''}
      </div>
    `;
  }
  function getArtifactEffectGroupItem(group) {
    const rows = group.rows || [];
    const effectiveRows = getEffectiveArtifactEffectRows(rows);
    const overlapMax = effectiveRows.reduce((total, row) => total + Math.max(1, Number(row.overlapCount) || 1), 0);
    const overlapStackKey = rows[0]?.overlapStackKey || '';
    const overlapCount = overlapStackKey && overlapMax > 1
      ? getConditionalEffectStackCount(overlapStackKey, overlapMax, overlapMax)
      : overlapMax;
    const rawBonuses = summarizeRawEffectBonuses(effectiveRows, key => isBonusKeyRelevantToPerspective(key));
    const bonuses = overlapMax > 0 && overlapCount !== overlapMax
      ? scaleBonusMapByFactor(rawBonuses, overlapCount / overlapMax)
      : rawBonuses;
    const conditionKeys = unique(rows.map(row => row.conditionKey));
    const enabledCount = conditionKeys.filter(key => {
      const row = rows.find(candidate => candidate.conditionKey === key);
      return isConditionalEffectEnabled(key, row?.defaultEnabled);
    }).length;
    return {
      ...rows[0],
      bonuses,
      conditionKeys,
      groupEnabled: conditionKeys.length ? enabledCount === conditionKeys.length : false,
      overlapStackKey,
      overlapStackMax: overlapMax,
      overlapCount
    };
  }

  function renderArtifactStackControl(item, groupEnabled = true) {
    const maxStack = Number(item?.stackMax);
    if (!item?.conditionKey || !Number.isFinite(maxStack) || maxStack <= 1) return '';
    const value = getConditionalEffectStackCount(item.conditionKey, maxStack, item.stackDefault);
    const enabled = !!groupEnabled && isConditionalEffectEnabled(item.conditionKey, item.defaultEnabled);
    return `
      <span class="fdc-artifact-effect-stack-control${enabled ? '' : ' is-disabled'}">
        <span>効果スタック</span>
        <input type="number" min="1" max="${escapeAttr(maxStack)}" step="1" value="${escapeAttr(value)}" data-fdc-stack-count="${escapeAttr(item.conditionKey)}" data-fdc-stack-max="${escapeAttr(maxStack)}"${enabled ? '' : ' disabled'} aria-label="効果スタック数（最大${escapeAttr(maxStack)}）">
        <small>/ ${escapeHtml(maxStack)}</small>
      </span>
    `;
  }

  function renderArtifactSharedStackControl(item, enabled = true) {
    const maxStack = Number(item?.overlapStackMax);
    if (!item?.overlapStackKey || !Number.isFinite(maxStack) || maxStack <= 1) return '';
    return `
      <span class="fdc-artifact-effect-stack-control${enabled ? '' : ' is-disabled'}">
        <span>スタック</span>
        <input type="number" min="1" max="${escapeAttr(maxStack)}" step="1" value="${escapeAttr(item.overlapCount)}" data-fdc-stack-count="${escapeAttr(item.overlapStackKey)}" data-fdc-stack-max="${escapeAttr(maxStack)}"${enabled ? '' : ' disabled'} aria-label="スタック数（最大${escapeAttr(maxStack)}）">
        <small>/ ${escapeHtml(maxStack)}</small>
      </span>
    `;
  }

  function renderArtifactEffectMiniChip(item) {
    const bonusText = item.bonusText || (item.bonuses ? formatBonusMap(getRelevantBonusMap(item.bonuses)) : '');
    const checked = item.conditionKeys
      ? (item.groupEnabled ? ' checked' : '')
      : (item.conditionKey && isConditionalEffectEnabled(item.conditionKey, item.defaultEnabled) ? ' checked' : '');
    const toggle = item.canToggle ? (item.conditionKeys?.length
      ? `<input type="checkbox" data-fdc-condition-toggle-group="${escapeAttr(encodeConditionToggleGroupKeys(item.conditionKeys))}"${checked}>`
      : `<input type="checkbox" data-fdc-condition-toggle="${escapeAttr(item.conditionKey)}"${checked}>`) : '';
    const label = item.label || '効果';
    return `
      <label class="fdc-artifact-effect-mini-chip ${item.canToggle ? 'is-toggleable' : ''}">
        ${toggle}
        <span class="fdc-artifact-effect-mini-chip-content">
          <span>${escapeHtml(label)}</span>
          ${bonusText ? `<b>${escapeHtml(bonusText)}</b>` : ''}
          ${item.duration ? `<small class="fdc-artifact-effect-duration">${escapeHtml(formatFdcEffectDuration(item.duration))}</small>` : ''}
          ${Number(item.overlapStackMax) > 1 ? `<em>×${escapeHtml(item.overlapCount)}</em>` : ''}
        </span>
      </label>
    `;
  }

  function encodeConditionToggleGroupKeys(keys = []) {
    return encodeURIComponent(JSON.stringify(keys.filter(Boolean)));
  }

  function decodeConditionToggleGroupKeys(value = '') {
    try {
      const keys = JSON.parse(decodeURIComponent(value));
      return Array.isArray(keys) ? keys.filter(Boolean) : [];
    } catch (_) {
      return [];
    }
  }
  function renderArtifactEffectChip(item, enabled) {
    const bonusText = item.bonusText || (item.bonuses ? formatBonusMap(getRelevantBonusMap(item.bonuses)) : '');
    const status = (item.tags?.status || []).join(' / ');
    const meta = [item.ownerLabel, item.reason].filter(Boolean).join(' / ');
    const checked = item.conditionKey && isConditionalEffectEnabled(item.conditionKey, item.defaultEnabled) ? ' checked' : '';
    const toggle = item.canToggle ? `<input type="checkbox" data-fdc-condition-toggle="${escapeAttr(item.conditionKey)}"${checked}>` : '';
    return `
      <label class="fdc-artifact-effect-chip ${enabled ? '' : 'is-disabled'} ${item.canToggle ? 'is-toggleable' : ''}">
        ${toggle}
        <strong>${escapeHtml(item.cardName || item.label || '遺物')}</strong>
        ${item.label && item.cardName ? `<span class="fdc-artifact-effect-label">${escapeHtml(item.label)}</span>` : ''}
        ${bonusText ? `<b>${escapeHtml(bonusText)}</b>` : ''}
        ${status ? `<em>${escapeHtml(status)}</em>` : ''}
        ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
      </label>
    `;
  }

  function renderSpellCategory(context, options = {}) {
    if (!el.spellCategory) return;
    if (!options.keepPopover) hideFdcSpellPopover();
    const spellRows = getFdcSelectedSpellRows(context);
    const spellEffects = getSpellEffectRows(context.effects);
    const spellAutoEffects = spellEffects.filter(isAutomaticBonusEffect);
    const spellDetailEffects = spellEffects.filter(item => !isAutomaticBonusEffect(item));
    const enabled = isEffectSourceActive('spell');
    el.spellCategory.innerHTML = `
      <section class="fdc-spell-section">
        <h4>
          <span class="fdc-spell-heading">編成スペルカード${Array.isArray(view.tempSpells) ? '<em>一時変更</em>' : ''}</span>
          <span class="fdc-spell-head-actions">
            <button type="button" class="fdc-spell-detail-toggle" data-fdc-spell-edit-toggle aria-haspopup="dialog" aria-expanded="false">編集</button>
            <button type="button" class="fdc-spell-detail-toggle" data-fdc-spell-details-toggle aria-haspopup="dialog" aria-expanded="false" ${spellRows.length ? '' : 'disabled'}>詳細</button>
            <span>${context.formation?.spells?.length || 0}枚</span>
          </span>
        </h4>
        <div class="fdc-spell-strip">
          ${spellRows.length ? spellRows.map(renderSpellMini).join('') : '<p class="fdc-empty">スペルカードなし</p>'}
        </div>
      </section>
      <section class="fdc-artifact-effect-box ${enabled ? '' : 'is-disabled'}">
        <h4>スペル補正 <span>${enabled ? 'ON' : 'OFF'}</span></h4>
        <div class="fdc-artifact-effect-chips">
          ${renderArtifactBonusSummary(spellAutoEffects, enabled)}
          ${spellDetailEffects.length ? renderGroupedArtifactEffectChips(spellDetailEffects, enabled) : ''}
          ${!spellAutoEffects.length && !spellDetailEffects.length ? '<p class="fdc-empty">スペル補正なし</p>' : ''}
        </div>
      </section>
    `;
  }

  function getFdcSelectedSpellRows(context) {
    return countIds(context.formation?.spells || [])
      .map(({ id, qty }) => createCardRow(id, qty, context.state?.cards?.[id]))
      .map(row => ({ ...row, card: getCard(row.id) }))
      .filter(row => row.card?.kind === 'spell')
      .sort(compareSpellDisplayRow);
  }

  function toggleFdcSpellDetailsPopover(anchor, context) {
    el.skillPopover = el.skillPopover || document.getElementById('fdc-skill-popover');
    if (!el.skillPopover || !anchor) return;
    if (!el.skillPopover.hidden && el.skillPopover.dataset.fdcPopoverKind === 'spell-details') {
      hideFdcSkillPopover();
      return;
    }
    const rows = getFdcSelectedSpellRows(context);
    if (!rows.length) return;
    const title = el.skillPopover.querySelector('.fdc-skill-popover-title');
    const body = el.skillPopover.querySelector('.fdc-skill-popover-body');
    if (title) {
      title.innerHTML = `
        <span>選択中スペルの詳細</span>
        <button type="button" data-fdc-spell-details-close aria-label="閉じる">${renderUiIcon('close')}</button>
      `;
    }
    if (body) body.innerHTML = `<div class="fdc-selected-spell-list">${rows.map(renderSelectedSpellDetailRow).join('')}</div>`;
    el.skillPopover.classList.remove('is-spell-editor');
    el.skillPopover.classList.add('is-spell-details');
    el.skillPopover.dataset.fdcPopoverKind = 'spell-details';
    el.skillPopover.hidden = false;
    anchor.setAttribute('aria-expanded', 'true');
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(640, window.innerWidth - 24);
    el.skillPopover.style.width = `${width}px`;
    const popRect = el.skillPopover.getBoundingClientRect();
    const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
    const below = rect.bottom + 8;
    const top = below + popRect.height <= window.innerHeight - 12
      ? below
      : Math.max(12, rect.top - popRect.height - 8);
    el.skillPopover.style.left = `${left}px`;
    el.skillPopover.style.top = `${top}px`;
  }

  function toggleFdcSpellEditorPopover(anchor, context) {
    el.skillPopover = el.skillPopover || document.getElementById('fdc-skill-popover');
    if (!el.skillPopover || !anchor) return;
    if (!el.skillPopover.hidden && el.skillPopover.dataset.fdcPopoverKind === 'spell-editor') {
      hideFdcSkillPopover();
      return;
    }
    showFdcSpellEditorPopover(anchor, context);
  }

  function showFdcSpellEditorPopover(anchor, context) {
    el.skillPopover = el.skillPopover || document.getElementById('fdc-skill-popover');
    if (!el.skillPopover || !anchor) return;
    const rows = getFdcSpellCatalogRows(context);
    const selectedCount = context.formation?.spells?.length || 0;
    const totalCost = getFdcSelectedSpellRows(context)
      .reduce((sum, row) => sum + getCardCostById(row.id, row.star) * row.qty, 0);
    const title = el.skillPopover.querySelector('.fdc-skill-popover-title');
    const body = el.skillPopover.querySelector('.fdc-skill-popover-body');
    if (title) {
      title.innerHTML = `
        <span>スペル編成</span>
        <span class="fdc-spell-editor-title-actions">
          <button type="button" class="fdc-spell-editor-reset" data-fdc-spell-editor-reset ${Array.isArray(view.tempSpells) ? '' : 'disabled'}>編成に戻す</button>
          <button type="button" data-fdc-spell-editor-close aria-label="閉じる">${renderUiIcon('close')}</button>
        </span>
      `;
    }
    if (body) {
      body.innerHTML = `
        <div class="fdc-spell-editor-summary"><span data-fdc-spell-editor-total>${selectedCount}枚</span><span data-fdc-spell-editor-cost>コスト ${formatNumber(totalCost)}</span></div>
        <div class="fdc-spell-editor-grid">${rows.map(renderFdcSpellEditorCard).join('')}</div>
      `;
    }
    el.skillPopover.classList.remove('is-spell-details');
    el.skillPopover.classList.add('is-spell-editor');
    el.skillPopover.dataset.fdcPopoverKind = 'spell-editor';
    el.skillPopover.hidden = false;
    anchor.setAttribute('aria-expanded', 'true');
    positionFdcSpellPopover(anchor, 700);
  }

  function getFdcSpellCatalogRows(context) {
    const counts = Object.fromEntries(countIds(context.formation?.spells || []).map(row => [row.id, row.qty]));
    return (typeof CARD_LIBRARY === 'undefined' ? [] : CARD_LIBRARY.spells || [])
      .map(card => ({
        ...createCardRow(card.id, counts[card.id] || 0, context.state?.cards?.[card.id]),
        card,
        qty: counts[card.id] || 0
      }))
      .sort(compareSpellDisplayRow);
  }

  function renderFdcSpellEditorCard(row) {
    return `
      <article class="fdc-spell-editor-card ${row.qty ? 'is-selected' : ''} ${getCardRarityClass({ rarity: row.card?.rarity, signature: row.card?.signature })}" data-fdc-spell-editor-card="${escapeAttr(row.id)}">
        <span class="fdc-spell-editor-art">
          <img src="${escapeAttr(getCardImagePath(row.card))}" alt="${escapeAttr(row.name)}">
          <b>★${escapeHtml(row.star)}</b>
        </span>
        <strong title="${escapeAttr(row.name)}">${escapeHtml(row.name)}</strong>
        <small>コスト${escapeHtml(getCardCostById(row.id, row.star))}</small>
        ${renderFdcTempCardGrowthControls(row, { compact: true })}
        <span class="fdc-spell-editor-qty" aria-label="${escapeAttr(`${row.name}の枚数`)}">
          <button type="button" data-fdc-spell-id="${escapeAttr(row.id)}" data-fdc-spell-edit-step="-1" aria-label="1枚減らす" ${row.qty ? '' : 'disabled'}>${renderUiIcon('minus')}</button>
          <b data-fdc-spell-editor-qty-value>${escapeHtml(row.qty)}</b>
          <button type="button" data-fdc-spell-id="${escapeAttr(row.id)}" data-fdc-spell-edit-step="1" aria-label="1枚増やす">${renderUiIcon('plus')}</button>
        </span>
      </article>
    `;
  }

  function adjustFdcTempSpellCount(id, step, context) {
    if (!id || !step) return;
    const spells = Array.isArray(view.tempSpells)
      ? view.tempSpells.slice()
      : (context.formation?.spells || []).slice();
    if (step > 0) {
      spells.push(id);
    } else {
      const index = spells.lastIndexOf(id);
      if (index < 0) return;
      spells.splice(index, 1);
    }
    view.tempSpells = spells;
    saveCalcSettings();
    renderAfterFdcSpellEdit();
  }

  function resetFdcTempSpells() {
    view.tempSpells = null;
    saveCalcSettings();
    renderAfterFdcSpellEdit();
  }

  function renderAfterFdcSpellEdit() {
    render({ keepSpellPopover: true });
    const context = buildContext();
    const anchor = document.querySelector('[data-fdc-spell-edit-toggle]');
    refreshFdcSpellEditorContents(context);
    if (anchor) {
      anchor.setAttribute('aria-expanded', 'true');
      positionFdcSpellPopover(anchor, 700);
    }
  }

  function refreshFdcSpellEditorContents(context) {
    if (!el.skillPopover || el.skillPopover.hidden || el.skillPopover.dataset.fdcPopoverKind !== 'spell-editor') return;
    const counts = Object.fromEntries(countIds(context.formation?.spells || []).map(row => [row.id, row.qty]));
    const selectedRows = getFdcSelectedSpellRows(context);
    const selectedCount = context.formation?.spells?.length || 0;
    const totalCost = selectedRows.reduce((sum, row) => sum + getCardCostById(row.id, row.star) * row.qty, 0);
    const total = el.skillPopover.querySelector('[data-fdc-spell-editor-total]');
    const cost = el.skillPopover.querySelector('[data-fdc-spell-editor-cost]');
    const reset = el.skillPopover.querySelector('[data-fdc-spell-editor-reset]');
    if (total) total.textContent = `${selectedCount}枚`;
    if (cost) cost.textContent = `コスト ${formatNumber(totalCost)}`;
    if (reset) reset.disabled = !Array.isArray(view.tempSpells);
    el.skillPopover.querySelectorAll('[data-fdc-spell-editor-card]').forEach(card => {
      const id = card.dataset.fdcSpellEditorCard || '';
      const qty = counts[id] || 0;
      card.classList.toggle('is-selected', qty > 0);
      const value = card.querySelector('[data-fdc-spell-editor-qty-value]');
      const minus = card.querySelector('[data-fdc-spell-edit-step="-1"]');
      if (value) value.textContent = String(qty);
      if (minus) minus.disabled = qty <= 0;
    });
  }

  function positionFdcSpellPopover(anchor, preferredWidth = 640) {
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(preferredWidth, window.innerWidth - 24);
    el.skillPopover.style.width = `${width}px`;
    const popRect = el.skillPopover.getBoundingClientRect();
    const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
    const below = rect.bottom + 8;
    const top = below + popRect.height <= window.innerHeight - 12
      ? below
      : Math.max(12, rect.top - popRect.height - 8);
    el.skillPopover.style.left = `${left}px`;
    el.skillPopover.style.top = `${top}px`;
  }

  function hideFdcSpellPopover() {
    if (String(el.skillPopover?.dataset.fdcPopoverKind || '').startsWith('spell-')) hideFdcSkillPopover();
  }
  function renderSpellMini(row) {
    return `
      <span class="fdc-spell-mini ${getCardRarityClass({ rarity: row.card?.rarity, signature: row.card?.signature })}" title="${escapeAttr(row.name)}">
        <img src="${escapeAttr(getCardImagePath(row.card))}" alt="">
        ${row.qty > 1 ? `<b>x${escapeHtml(row.qty)}</b>` : ''}
      </span>
    `;
  }

  function compareSpellDisplayRow(a, b) {
    return compareArtifactOption(
      { ...a, rarity: a.card?.rarity, signature: a.card?.signature },
      { ...b, rarity: b.card?.rarity, signature: b.card?.signature }
    );
  }

  function renderSelectedSpellDetailRow(row) {
    const detailLines = getSelectedSpellDetailLines(row);
    return `
      <div class="fdc-selected-spell-row ${getCardRarityClass({ rarity: row.card?.rarity, signature: row.card?.signature })}">
        <span class="fdc-selected-spell-icon">
          <img src="${escapeAttr(getCardImagePath(row.card))}" alt="">
          ${row.qty > 1 ? `<b>x${escapeHtml(row.qty)}</b>` : ''}
        </span>
        <span class="fdc-selected-spell-text">
          <strong>${escapeHtml(row.name)}</strong>
          <small>${escapeHtml(`コスト${getCardCostById(row.id, row.star)} / ★${row.star}${row.qty > 1 ? ` / x${row.qty}` : ''}`)}</small>
          ${detailLines.length ? `<span class="fdc-selected-spell-effects">${detailLines.map(line => `<em>${escapeHtml(line)}</em>`).join('')}</span>` : ''}
        </span>
      </div>
    `;
  }

  function getSelectedSpellDetailLines(row) {
    const card = row.card || getCard(row.id);
    if (!card) return [];
    return [
      formatArtifactBonusLine('基礎補正', card.bonusesByStar?.[row.star - 1]),
      row.solder ? formatArtifactBonusLine(`はんだ+${row.solder}`, card.solderBonuses?.[row.solder]) : '',
      ...formatArtifactConditionalEffectLines(card.conditionalEffects || [], row.star)
    ].filter(Boolean);
  }

  function getSpellEffectRows(effects) {
    return [
      ...(effects.applied || []),
      ...(effects.conditional || [])
    ].filter(item => hasAnySourceTag(item, ['スペル', '愛用スペル']))
      .filter(isEffectRelevantToPerspective);
  }

  function getEnabledEffectRows(effects) {
    return [
      ...(effects.applied || []),
      ...(effects.globalStats || [])
    ].filter(item => isEffectSourceEnabled(item) && isEffectRelevantToPerspective(item));
  }

  function isEffectSourceEnabled(item) {
    const key = getEffectSourceKey(item);
    return isEffectSourceActive(key);
  }

  function isEffectRelevantToPerspective(item) {
    const bonuses = item.bonuses || {};
    if (!Object.keys(bonuses).length) return true;
    return isBonusMapRelevantToPerspective(bonuses);
  }

  function isBonusMapRelevantToPerspective(bonuses = {}) {
    const keys = Object.keys(bonuses).filter(key => Number(bonuses[key]));
    if (!keys.length) return true;
    const isDefenseMode = view.perspective === 'enemy';
    return keys.some(key => isDefenseMode ? isDefenseBonusKey(key) : isAttackBonusKey(key));
  }

  function getRelevantBonusMap(bonuses = {}) {
    const isDefenseMode = view.perspective === 'enemy';
    return Object.fromEntries(Object.entries(bonuses || {})
      .filter(([key, value]) => Number(value) && (isDefenseMode ? isDefenseBonusKey(key) : isAttackBonusKey(key))));
  }

  function isBonusKeyRelevantToPerspective(key) {
    return view.perspective === 'enemy' ? isDefenseBonusKey(key) : isAttackBonusKey(key);
  }

  function summarizeRelevantEffects(rows) {
    return summarizeEffectBonuses(rows, isBonusKeyRelevantToPerspective);
  }
  function isAttackBonusKey(key) {
    return [
      'atkP',
      'physicalAtkP',
      'magicAtkP',
      'critP',
      'critRateP',
      'critDmgP',
      'critDmgAddP',
      'hasteP',
      'addP',
      'normalAttackAddP',
      'basicAddP',
      'enhancedAddP',
      'skillAddP',
      'specialP',
      'otherP',
      'enemyDefDownP',
      'enemyCritResDownP',
      'enemyCritDmgResDownP',
      'spRecovery',
      'spRecoveryP',
      'spRegen',
      'spRegenP',
      'initialSp',
      'initialSpP'
    ].includes(key);
  }

  function isDefenseBonusKey(key) {
    return [
      'hpP',
      'defP',
      'physicalDefP',
      'magicDefP',
      'takenDmgP',
      'critResP',
      'critResAddP',
      'critDmgResP',
      'critDmgResAddP',
      'healingP',
      'hpRecoveryP',
      'spRecovery',
      'spRecoveryP',
      'spRegen',
      'spRegenP',
      'initialSp',
      'initialSpP',
      'atkDownP',
      'attackerDmgDownP'
    ].includes(key);
  }

  function getEffectSourceKey(item) {
    const sourceTags = item.tags?.source || [];
    if (sourceTags.includes('シナジー')) return 'synergy';
    if (sourceTags.includes('遺物') || sourceTags.includes('愛用遺物')) return 'artifact';
    if (sourceTags.includes('スペル') || sourceTags.includes('愛用スペル')) return 'spell';
    if (sourceTags.includes('クレヨン') || sourceTags.includes('A3全体') || sourceTags.includes('フォロー') || sourceTags.includes('追加クレヨン')) return 'globalStats';
    return '';
  }

  function hasAnySourceTag(item, candidates) {
    const tags = item.tags?.source || [];
    return candidates.some(tag => tags.includes(tag));
  }

  function renderResult(context) {
    const result = calculateDamage(context);
    const pinnedComparison = getPinnedSingleComparison(context);
    syncPinnedComparisonUi(context);
    const currentResult = pinnedComparison?.result || (view.statMode === 'planned' && context.target?.hasPlannedSnapshot
      ? calculateDamageWithStatMode(context, 'current')
      : null);
    const beforeLabel = pinnedComparison ? '変更前' : '現在';
    renderResultValue(el.result.normal, result.normal, currentResult?.normal, { type: 'number', beforeLabel });
    renderResultValue(el.result.crit, result.crit, currentResult?.crit, { type: 'number', beforeLabel });
    renderResultValue(el.result.expected, result.expected, currentResult?.expected, { type: 'number', beforeLabel });
    renderHpRateResults(result, currentResult);
    renderResultMetricSwitch(result, currentResult, beforeLabel);
    renderResultDetail(context, result);
    window.dispatchEvent(new CustomEvent('trickcal:damage-calculator-rendered', {
      detail: { targetId: context.target?.id || '' }
    }));
  }

  function renderResultMetricSwitch(result, currentResult = null, beforeLabel = '変更前') {
    const metric = normalizeResultMetric(view.resultMetric);
    const definitions = {
      critRate: {
        label: '会心率',
        value: Number(result?.critRate) * 100,
        before: currentResult ? Number(currentResult.critRate) * 100 : null,
        options: { type: 'percent', digits: 1, showPointDiff: true, beforeLabel }
      },
      critDmg: {
        label: '会心DMG量',
        value: getResultCritMultiplier(result) * 100,
        before: currentResult ? getResultCritMultiplier(currentResult) * 100 : null,
        options: { type: 'percent', digits: 1, showPointDiff: true, beforeLabel }
      },
      defRate: {
        label: '基礎DMG係数',
        value: Number(result?.defRate) * 100,
        before: currentResult ? Number(currentResult.defRate) * 100 : null,
        options: { type: 'percent', digits: 2, showPointDiff: true, beforeLabel }
      }
    };
    const definition = definitions[metric];
    if (el.result.metricLabel) el.result.metricLabel.textContent = definition.label;
    if (el.result.metricCard) el.result.metricCard.dataset.fdcResultMetric = metric;
    if (el.result.metricToggle) {
      const keys = ['critRate', 'critDmg', 'defRate'];
      const next = definitions[keys[(keys.indexOf(metric) + 1) % keys.length]];
      el.result.metricToggle.setAttribute('aria-label', definition.label + 'を' + next.label + 'へ切り替え');
      el.result.metricToggle.title = '表示中: ' + definition.label + ' / 次: ' + next.label;
    }
    renderResultValue(el.result.critRate, definition.value, definition.before, definition.options);
    syncResultMetricCapTone(result, metric);
  }

  function getResultCritMultiplier(result = {}) {
    return Number(result?.detail?.stats?.critMult ?? result?.critMult) || 0;
  }

  function syncResultMetricCapTone(result, metric) {
    const card = el.result.metricCard;
    if (!card) return;
    const cap = metric === 'critRate'
      ? result?.detail?.caps?.critRate
      : metric === 'critDmg'
        ? result?.detail?.caps?.critMult
        : null;
    const capType = cap?.type || '';
    card.classList.toggle('is-cap-upper', capType === 'upper');
    card.classList.toggle('is-cap-lower', capType === 'lower');
    const label = metric === 'critDmg' ? '会心ダメージ量' : '会心率';
    card.title = capType ? label + (capType === 'upper' ? '上限' : '下限') + ' ' + cap.limitText + ' に到達' : '';
  }

  function renderResultValue(element, plannedValue, currentValue = null, options = {}) {
    if (!element) return;
    if (currentValue === null || currentValue === undefined) {
      element.textContent = formatResultMetric(plannedValue, options);
      element.classList.remove('is-compare');
      return;
    }
    const planned = Number(plannedValue) || 0;
    const current = Number(currentValue) || 0;
    const diff = planned - current;
    const ratio = current ? (planned / current - 1) * 100 : planned ? Number.POSITIVE_INFINITY : 0;
    const diffText = formatResultDiff(ratio, diff, options);
    const direction = options.invertForDefense === false ? diff : view.perspective === 'enemy' ? -diff : diff;
    const tone = direction > 0 ? 'is-positive' : direction < 0 ? 'is-negative' : 'is-neutral';
    element.classList.add('is-compare');
    element.innerHTML = `
      <span class="fdc-result-current">${escapeHtml(formatResultMetric(planned, options))}</span>
      <span class="fdc-result-before">${escapeHtml(options.beforeLabel || '変更前')} ${escapeHtml(formatResultMetric(current, options))}</span>
      <span class="fdc-result-diff ${tone}">${escapeHtml(diffText)}</span>
    `;
  }

  function renderHpRateResults(result, currentResult = null) {
    const entries = [
      ['normal', result.normal, currentResult?.normal],
      ['expected', result.expected, currentResult?.expected],
      ['crit', result.crit, currentResult?.crit]
    ];
    entries.forEach(([key, damage, currentDamage]) => {
      renderHpRateValue(el.result.hpRates?.[key], result.hp, damage, currentResult?.hp, currentDamage);
    });
  }

  function renderHpRateValue(element, hp, damage, currentHp = null, currentDamage = null) {
    if (!element) return;
    element.hidden = view.resultDisplays.hp === false;
    if (element.hidden) {
      element.textContent = '';
      return;
    }
    const rate = calculateRemainingHpRate(hp, damage);
    if (currentHp === null || currentHp === undefined || currentDamage === null || currentDamage === undefined) {
      element.classList.remove('is-compare');
      element.innerHTML = `<span>残HP ${escapeHtml(formatHpRate(rate))}</span>`;
      return;
    }
    const currentRate = calculateRemainingHpRate(currentHp, currentDamage);
    const diff = rate - currentRate;
    const benefitDirection = view.perspective === 'enemy' ? diff : -diff;
    const tone = benefitDirection > 0 ? 'is-positive' : benefitDirection < 0 ? 'is-negative' : 'is-neutral';
    element.classList.add('is-compare');
    element.innerHTML = `
      <span>残HP ${escapeHtml(formatHpRate(rate))}</span>
      <b class="${tone}">(${escapeHtml(`${diff > 0 ? '+' : ''}${diff.toFixed(1)}pt`)})</b>
    `;
  }

  function calculateRemainingHpRate(hp, damage) {
    const baseHp = Math.max(0, Number(hp) || 0);
    if (!baseHp) return 0;
    return clamp((baseHp - Math.max(0, Number(damage) || 0)) / baseHp * 100, 0, 100);
  }

  function formatHpRate(rate) {
    return `${(Number(rate) || 0).toFixed(1)}%`;
  }

  function formatResultMetric(value, options = {}) {
    const num = Number(value) || 0;
    if (options.type === 'percent') return `${num.toFixed(options.digits ?? 1)}%`;
    return formatNumber(num);
  }

  function formatResultDiff(ratio, pointDiff, options = {}) {
    const ratioText = Number.isFinite(ratio)
      ? `${ratio > 0 ? '+' : ''}${ratio.toFixed(2)}%`
      : '+∞%';
    if (!options.showPointDiff) return ratioText;
    const pt = Number(pointDiff) || 0;
    const digits = options.digits ?? 1;
    return `${ratioText} (${pt > 0 ? '+' : ''}${pt.toFixed(digits)}pt)`;
  }

  function setupCollapsibleStatCategories() {
    document.querySelectorAll('.stat-category').forEach((category, index) => {
      if (category.dataset.fdcCollapsibleReady === 'true') return;
      const heading = category.querySelector(':scope > h3');
      if (!heading) return;
      category.dataset.fdcCollapsibleReady = 'true';
      const title = heading.textContent.trim();
      heading.classList.add('fdc-category-heading');
      heading.innerHTML = `
        <span>${escapeHtml(title)}</span>
        <button type="button" class="fdc-category-toggle" data-fdc-category-toggle aria-expanded="true" aria-label="${escapeAttr(title)}を閉じる">${renderUiIcon('minus', 'ui-icon-minus')}${renderUiIcon('plus', 'ui-icon-plus')}</button>
      `;
    });
  }

  function setStatCategoryCollapsed(category, collapsed) {
    const toggle = category.querySelector('[data-fdc-category-toggle]');
    category.classList.toggle('is-collapsed', collapsed);
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(!collapsed));
    const title = category.querySelector('.fdc-category-heading span')?.textContent || '項目';
    toggle.setAttribute('aria-label', `${title}を${collapsed ? '開く' : '閉じる'}`);
  }

  function setResultDetailOpen(open) {
    if (!el.result.detailPanel || !el.result.detailToggle) return;
    if (open) {
      view.resultDetailTab = getPinnedComparisonSession() ? 'comparison' : 'calculation';
    }
    el.result.detailPanel.hidden = !open;
    el.result.detailToggle.setAttribute('aria-expanded', String(open));
    el.result.detailToggle.classList.toggle('is-open', open);
    document.body.classList.toggle('fdc-result-detail-open', open);
  }

  function renderResultDetail(context, result = calculateDamage(context)) {
    if (!el.result.detailGrid || !el.result.detailNote) return;
    const target = context.target;
    const attackLabel = context.damageType === 'magic' ? '魔法攻撃力' : '物理攻撃力';
    const defenseLabel = context.damageType === 'magic' ? '魔法防御力' : '物理防御力';
    const isEnemyAttack = view.perspective === 'enemy';
    const attackerIsEnemy = isEnemyAttack;
    const defenderIsEnemy = !isEnemyAttack;
    const detail = result.detail || {};
    const stat = detail.stats || {};
    const mods = detail.mods || {};
    const caps = detail.caps || {};
    el.result.detailNote.textContent = target
      ? `${target.name} / ${formatStatModeLabel(target)} / ${formatGradeLabel(target)}`
      : '使徒未選択';
    const pinnedComparison = getPinnedSingleComparison(context);
    const pinnedDiffGroups = pinnedComparison
      ? createPinnedComparisonDiffGroups(context, pinnedComparison.session)
      : [];
    const calculationGroups = [
      {
        title: '計算結果',
        rows: [
          ['通常ダメージ', formatNumber(result.normal)],
          ['期待ダメージ', formatNumber(result.expected)],
          ['会心時ダメージ', formatNumber(result.crit)],
          createSideDetailRow('HP', formatNumber(result.hp), defenderIsEnemy),
          ['会心率', `${(result.critRate * 100).toFixed(1)}%`],
          ['会心ダメージ量', `${formatPlainNumber((Number(stat.critMult) || 0) * 100)}%`],
          ['基礎ダメージ係数', `${(result.defRate * 100).toFixed(2)}%`]
        ]
      },
      {
        title: '基礎ステータス',
        rows: [
          createSideDetailRow(attackLabel, formatNumber(stat.baseAtk), attackerIsEnemy),
          createSideDetailRow('会心', formatNumber(stat.baseCrit), attackerIsEnemy),
          createSideDetailRow('会心DMG', formatNumber(stat.baseCritDmg), attackerIsEnemy),
          createSideDetailRow('HP', formatNumber(stat.baseHp), defenderIsEnemy),
          createSideDetailRow(defenseLabel, formatNumber(stat.baseDef), defenderIsEnemy),
          createSideDetailRow('会心抵抗', formatNumber(stat.baseCritRes), defenderIsEnemy),
          createSideDetailRow('会心DMG抵抗', formatNumber(stat.baseCritDmgRes), defenderIsEnemy)
        ]
      },
      {
        title: '補正後ステータス',
        rows: [
          createSideDetailRow(attackLabel, formatNumber(stat.finalAtk), attackerIsEnemy),
          createSideDetailRow('会心', formatNumber(stat.finalCrit), attackerIsEnemy),
          createSideDetailRow('会心DMG', formatNumber(stat.finalCritDmg), attackerIsEnemy),
          createSideDetailRow('HP', formatNumber(stat.finalHp), defenderIsEnemy),
          createSideDetailRow(defenseLabel, formatNumber(stat.finalDef), defenderIsEnemy),
          createSideDetailRow('会心抵抗', formatNumber(stat.finalCritRes), defenderIsEnemy),
          createSideDetailRow('会心DMG抵抗', formatNumber(stat.finalCritDmgRes), defenderIsEnemy),
          ...(stat.damageReference ? [['ダメージ参照', stat.damageReference], ['ダメージ参照値', formatNumber(stat.damageSource)]] : []),
          createCapDetailRow('会心率', `${(result.critRate * 100).toFixed(1)}%`, caps.critRate),
          createCapDetailRow('会心ダメージ量', `${formatPlainNumber((Number(stat.critMult) || 0) * 100)}%`, caps.critMult)
        ]
      },
      {
        title: '最終補正値',
        rows: [
          createSideDetailRow('攻撃力ステ補正', formatSignedPercent(mods.attackP), attackerIsEnemy),
          createSideDetailRow('会心ステ補正', formatSignedPercent(mods.critP), attackerIsEnemy),
          createSideDetailRow('会心DMGステ補正', formatSignedPercent(mods.critDmgP), attackerIsEnemy),
          createSideDetailRow('会心率加算', formatSignedPercent(mods.critRateP), attackerIsEnemy),
          createSideDetailRow('会心DMG量加算', formatSignedPercent(mods.critDmgAddP), attackerIsEnemy),
          createSideDetailRow('HPステ補正', formatSignedPercent(mods.hpP), defenderIsEnemy),
          createSideDetailRow('防御力ステ補正', formatSignedPercent(mods.defenseP), defenderIsEnemy),
          createSideDetailRow('会心抵抗ステ補正', formatSignedPercent(mods.critResP), defenderIsEnemy),
          createSideDetailRow('会心DMG抵抗ステ補正', formatSignedPercent(mods.critDmgResP), defenderIsEnemy),
          createSideDetailRow('会心率抵抗加算', formatSignedPercent(mods.critResAddP), defenderIsEnemy),
          createSideDetailRow('会心DMG抵抗加算', formatSignedPercent(mods.critDmgResAddP), defenderIsEnemy),
          createCapDetailRow('与ダメージ量補正', `${(mods.addRate * 100).toFixed(1)}%`, caps.addRate),
          ...(Number(mods.conditionalTakenDmgP) ? [['状態弱点による被ダメージ量補正', formatSignedPercent(mods.conditionalTakenDmgP)]] : []),
          ...(Number(mods.targetDebuffTakenDmgP) ? [['破壊による被ダメージ量補正', formatSignedPercent(mods.targetDebuffTakenDmgP)]] : []),
          ['スキル倍率', `${formatPlainNumber(mods.skillP)}%`],
          ['属性相性倍率', `${formatPlainNumber(mods.typeP)}%`],
          ['特殊倍率', `${formatPlainNumber(mods.specialP)}%`],
          ['その他倍率', `${formatPlainNumber(mods.otherP)}%`]
        ]
      }
    ];
    const comparisonGroups = pinnedComparison
      ? [
          {
            title: '変更前/現在ダメージ比較',
            rows: createPinnedComparisonDamageRows(pinnedComparison.result, result)
          },
          ...pinnedDiffGroups,
          {
            title: '変更前の条件',
            rows: createPinnedComparisonConditionRows(context, pinnedComparison.session)
          }
        ]
      : [];
    if (!pinnedComparison) {
      calculationGroups.push(
        {
          title: '現在との差分',
          rows: createCurrentPlannedDiffRows(context)
        },
        {
          title: '現在/予定ダメージ比較',
          rows: createCurrentPlannedDamageRows(context, result)
        }
      );
    }
    syncResultDetailTabs(!!pinnedComparison);
    const groups = pinnedComparison && view.resultDetailTab === 'comparison'
      ? comparisonGroups
      : calculationGroups;
    el.result.detailGrid.innerHTML = groups.map(group => `
      <section class="fdc-result-detail-group ${escapeAttr(group.className || '')}">
        <h3>${escapeHtml(group.title)}</h3>
        ${group.content || ''}
        ${group.rows.length
          ? group.rows.map(renderResultDetailRow).join('')
          : '<p>差分なし</p>'}
      </section>
    `).join('');
  }

  function syncResultDetailTabs(hasComparison) {
    if (!el.result.detailTabs) return;
    el.result.detailTabs.hidden = !hasComparison;
    if (!hasComparison || view.resultDetailTab !== 'comparison') {
      view.resultDetailTab = 'calculation';
    }
    el.result.detailTabButtons.forEach(button => {
      const active = button.dataset.fdcResultDetailTab === view.resultDetailTab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }

  function renderResultDetailRow(row) {
    const normalized = Array.isArray(row) ? { label: row[0], value: row[1] } : row;
    const classes = ['fdc-result-detail-row', normalized.className || ''].filter(Boolean).join(' ');
    const title = normalized.title ? ` title="${escapeAttr(normalized.title)}"` : '';
    const enemyBadge = normalized.isEnemy ? '<em class="fdc-result-enemy-badge">[敵]</em>' : '';
    return `<div class="${escapeAttr(classes)}"${title}><span>${enemyBadge}${escapeHtml(normalized.label)}</span><strong>${escapeHtml(normalized.value)}</strong></div>`;
  }

  function createSideDetailRow(label, value, isEnemy = false) {
    return { label, value, isEnemy };
  }

  function createCapDetailRow(label, value, cap = null) {
    if (!cap) return [label, value];
    const tone = cap.type === 'upper' ? 'is-cap-upper' : cap.type === 'lower' ? 'is-cap-lower' : 'is-cap';
    const suffix = cap.type === 'upper' ? '上限到達' : cap.type === 'lower' ? '下限到達' : 'キャップ到達';
    const difference = Number(cap.difference);
    const differenceText = Number.isFinite(difference) && difference > 0
      ? `（${cap.type === 'upper' ? '超過' : '下限未満'} ${cap.differencePrefix || ''}${formatPlainNumber(difference)}${cap.differenceSuffix || ''}）`
      : '';
    return {
      label,
      value: `${value}${differenceText}`,
      className: `is-capped ${tone}`,
      title: `${suffix}: ${cap.limitText || ''}`.trim()
    };
  }

  function formatSignedPercent(value, digits = 1) {
    const num = Number(value) || 0;
    return `${num > 0 ? '+' : ''}${num.toFixed(digits)}%`;
  }

  function calculateDamage(context) {
    const summary = context.summary || {};
    const isEnemyAttack = view.perspective === 'enemy';
    const attacker = getAttackMods(isEnemyAttack ? 'enemy' : 'self');
    const defender = getDefenseMods(isEnemyAttack ? 'self' : 'enemy');
    const selectedSkillOption = isEnemyAttack ? null : context.selectedSkillOption || resolveSelectedSelfSkillOption(context);
    const selectedSkillValue = Number(selectedSkillOption?.value);
    const conditionalTakenDmgP = !isEnemyAttack && !context.ignoreEnemyStatusTakenDamageWeakness
      ? getEnemyPresetStatusTakenDamageWeaknessAdd()
      : 0;
    const targetDebuffTakenDmgP = isEnemyAttack ? getEnemyPresetBreakDebuffTakenDmgP() : 0;
    if (!isEnemyAttack && Number.isFinite(selectedSkillValue)) attacker.skill = selectedSkillValue;
    if (!isEnemyAttack) {
      attacker.other += getEnemyPresetStatusDamageWeaknessOtherP(selectedSkillOption?.category || context.actionCategory);
      attacker.addP += conditionalTakenDmgP;
    }
    if (isEnemyAttack) attacker.addP += targetDebuffTakenDmgP;
    attacker.addP += getWeaknessDamageP(isEnemyAttack ? 'self' : 'enemy', context.damageType);
    applyEffectSummaryToDamageMods(summary, context, attacker, defender, isEnemyAttack);
    applyEffectSummaryToDamageMods(
      context.enemySummary || {},
      {
        ...context,
        damageType: isEnemyAttack ? resolveEnemyDamageType() : context.damageType,
        actionCategory: view.enemySelectedSkillCategory || ''
      },
      attacker,
      defender,
      !isEnemyAttack
    );
    const baseAtk = isEnemyAttack ? readNumber(el.inputs.enemyAtk) : readNumber(el.inputs.atk);
    const baseCrit = isEnemyAttack ? readNumber(el.inputs.enemyCrit) : readNumber(el.inputs.crit);
    const baseCritDmg = isEnemyAttack ? readNumber(el.inputs.enemyCritDmg) : readNumber(el.inputs.critDmg);
    const baseDef = isEnemyAttack ? readNumber(el.inputs.selfDef) : readNumber(el.inputs.def);
    const baseCritRes = isEnemyAttack ? readNumber(el.inputs.selfCritResBase) : readNumber(el.inputs.critRes);
    const baseCritDmgRes = isEnemyAttack ? readNumber(el.inputs.selfCritDmgResBase) : readNumber(el.inputs.critDmgRes);
    const baseHp = isEnemyAttack ? readNumber(el.inputs.selfHp) : readNumber(el.inputs.enemyHp);
    const hpP = isEnemyAttack ? getActiveHpBonusP(context) : Number(context.enemySummary?.hpP) || 0;
    const attackP = attacker.atkP - attacker.atkDownP;
    const defenseP = defender.defP - defender.defDownP;
    const critP = attacker.critP;
    const critDmgP = attacker.critDmgP;
    const critRateP = attacker.critRateP;
    const critDmgAddP = attacker.critDmgAddP;
    const critResP = defender.critResP - defender.critResDownP;
    const critDmgResP = defender.critDmgResP - defender.critDmgResDownP;
    const finalAtk = baseAtk * (1 + attackP / 100);
    const finalCrit = baseCrit * (1 + attacker.critP / 100);
    const finalCritDmg = baseCritDmg * (1 + attacker.critDmgP / 100);
    const finalHp = baseHp * (1 + hpP / 100);
    const finalDef = Math.max(1, baseDef * (1 + defenseP / 100));
    const finalCritRes = Math.max(1, baseCritRes * (1 + critResP / 100));
    const finalCritDmgRes = Math.max(1, baseCritDmgRes * (1 + critDmgResP / 100));
    const defRate = calcBaseDamageRate(finalAtk, finalDef);
    const rawAddRate = 1 + (attacker.addP - defender.takenDmgP) / 100;
    let addRate = Math.max(0.2, rawAddRate);
    const skill = Math.max(0, attacker.skill) / 100;
    const type = Math.max(0, attacker.type) / 100;
    const special = Math.max(0, attacker.special) / 100;
    const other = Math.max(0, attacker.other) / 100;
    const damageReference = selectedSkillOption?.damageReference || '';
    const damageSource = damageReference === 'enemyMaxHp' ? finalHp : finalAtk;
    const normal = damageSource * defRate * skill * addRate * type * special * other;
    const baseCritRate = calcCritRate(finalCrit, finalCritRes);
    const rawCritRate = baseCritRate + attacker.critRateP / 100 - defender.critResAddP / 100;
    const critRate = clamp(rawCritRate, 0.05, 0.8);
    const baseCritMult = calcCritMultiplier(finalCritDmg, finalCritDmgRes);
    const rawCritMult = baseCritMult + attacker.critDmgAddP / 100 - defender.critDmgResAddP / 100;
    const critMult = clamp(rawCritMult, 1.2, 2.5);
    const crit = normal * critMult;
    const expected = normal * (1 - critRate) + crit * critRate;
    return {
      hp: finalHp,
      normal,
      crit,
      expected,
      critRate,
      defRate,
      summary,
      detail: {
        stats: {
          baseAtk,
          baseHp,
          baseDef,
          baseCrit,
          baseCritDmg,
          baseCritRes,
          baseCritDmgRes,
          finalAtk,
          finalHp,
          finalDef,
          finalCrit,
          finalCritDmg,
          finalCritRes,
          finalCritDmgRes,
          damageType: context.damageType,
          damageReference: damageReference === 'enemyMaxHp' ? '敵最大HP' : '',
          damageSource,
          critMult
        },
        mods: {
          attackP,
          hpP,
          defenseP,
          rawAddRate,
          addRate,
          conditionalTakenDmgP,
          targetDebuffTakenDmgP,
          skillP: attacker.skill,
          typeP: attacker.type,
          specialP: attacker.special,
          otherP: attacker.other,
          critP,
          critDmgP,
          critResP,
          critDmgResP,
          critRateP,
          critDmgAddP,
          critResAddP: defender.critResAddP,
          critDmgResAddP: defender.critDmgResAddP
        },
        caps: {
          addRate: rawAddRate < 0.2 ? {
            type: 'lower',
            limitText: '20%',
            difference: (0.2 - rawAddRate) * 100,
            differencePrefix: '-',
            differenceSuffix: '%'
          } : null,
          critRate: rawCritRate >= 0.8 ? {
            type: 'upper',
            limitText: '80%',
            difference: (rawCritRate - 0.8) * 100,
            differencePrefix: '+',
            differenceSuffix: '%'
          } : rawCritRate <= 0.05 ? {
            type: 'lower',
            limitText: '5%',
            difference: (0.05 - rawCritRate) * 100,
            differencePrefix: '-',
            differenceSuffix: '%'
          } : null,
          critMult: rawCritMult >= 2.5 ? {
            type: 'upper',
            limitText: '250%',
            difference: (rawCritMult - 2.5) * 100,
            differencePrefix: '+',
            differenceSuffix: '%'
          } : rawCritMult <= 1.2 ? {
            type: 'lower',
            limitText: '120%',
            difference: (1.2 - rawCritMult) * 100,
            differencePrefix: '-',
            differenceSuffix: '%'
          } : null
        }
      }
    };
  }

  function getActiveHpBonusP(context) {
    const effects = context?.effects || {};
    return [
      ...(effects.applied || []),
      ...(effects.globalStats || [])
    ].reduce((total, item) => {
      if (!isEffectSourceEnabled(item)) return total;
      return total + (Number(item?.bonuses?.hpP) || 0);
    }, 0);
  }

  function applyEffectSummaryToDamageMods(summary, context, attacker, defender, isEnemyAttack) {
    if (!summary) return;
    if (isEnemyAttack) {
      defender.defP += Number(summary.defP) || 0;
      defender.defP += context.damageType === 'magic' ? Number(summary.magicDefP) || 0 : Number(summary.physicalDefP) || 0;
      defender.takenDmgP += Number(summary.takenDmgP) || 0;
      defender.critResP += Number(summary.critResP) || 0;
      defender.critDmgResP += Number(summary.critDmgResP) || 0;
      defender.critResAddP += Number(summary.critResAddP) || 0;
      defender.critDmgResAddP += Number(summary.critDmgResAddP) || 0;
      attacker.atkDownP += Number(summary.atkDownP) || 0;
      attacker.atkDownP += Number(summary.attackerDmgDownP) || 0;
      return;
    }
    attacker.atkP += getActiveAttackBonus(summary, context.damageType);
    attacker.addP += getActiveAddBonus(summary, context.actionCategory);
    attacker.critRateP += Number(summary.critRateP) || 0;
    attacker.critP += Number(summary.critP) || 0;
    attacker.critDmgP += Number(summary.critDmgP) || 0;
    attacker.critDmgAddP += Number(summary.critDmgAddP) || 0;
    attacker.special += Number(summary.specialP) || 0;
    attacker.other += Number(summary.otherP) || 0;
    defender.defDownP += Number(summary.enemyDefDownP) || 0;
    defender.critResDownP += Number(summary.enemyCritResDownP) || 0;
    defender.critDmgResDownP += Number(summary.enemyCritDmgResDownP) || 0;
    defender.critResAddP += Number(summary.critResAddP) || 0;
    defender.critDmgResAddP += Number(summary.critDmgResAddP) || 0;
  }

  function getAttackMods(side) {
    if (side === 'enemy') {
      return {
        atkP: readNumber(el.inputs.enemyAtkP),
        critP: readNumber(el.inputs.enemyCritP),
        critDmgP: readNumber(el.inputs.enemyCritDmgP),
        skill: readEnemySkillMultiplier(),
        type: readNumber(el.inputs.enemyType),
        special: readNumber(el.inputs.enemySpecial),
        other: readNumber(el.inputs.enemyOther),
        addP: readNumber(el.inputs.enemyAddP) + getDebuffDamageP('enemy') + getEnemyPresetBuffDamageP(),
        critRateP: readNumber(el.inputs.enemyCritRateP),
        critDmgAddP: readNumber(el.inputs.enemyCritDmgAddP),
        atkDownP: readNumber(el.inputs.enemyAttackerDmgDownP)
      };
    }
    return {
      atkP: readNumber(el.inputs.selfAtkP),
      critP: readNumber(el.inputs.selfCritP),
      critDmgP: readNumber(el.inputs.selfCritDmgP),
      skill: readNumber(el.inputs.selfSkill),
      type: readNumber(el.inputs.selfType),
      special: 100,
      other: readNumber(el.inputs.selfOther),
      addP: readNumber(el.inputs.selfAddP) + getDebuffDamageP('self'),
      critRateP: readNumber(el.inputs.selfCritRateP),
      critDmgAddP: readNumber(el.inputs.selfCritDmgAddP),
      atkDownP: readNumber(el.inputs.selfAttackerDmgDownP)
    };
  }

  function resolveSelectedSelfSkillOption(context) {
    if (!context?.target) return null;
    const options = buildFdcApostleSkillOptions(context.target, context);
    if (view.selectedSkillOptionKey) {
      const selected = options.find(item => item.key === view.selectedSkillOptionKey);
      if (selected) return selected;
    }
    return view.selectedSkillCategory
      ? options.find(item => item.category === view.selectedSkillCategory) || null
      : null;
  }

  function getDebuffDamageP(side) {
    const poisonStack = side === 'enemy'
      ? readNumber(el.inputs.enemyPoisonStack)
      : readNumber(el.inputs.selfPoisonStack);
    const noise = side === 'enemy'
      ? readNumber(el.inputs.enemyNoise)
      : readNumber(el.inputs.selfNoise);
    return -11 * clamp(poisonStack, 0, 9) - (noise ? 50 : 0);
  }

  function getEnemyPresetBuffDamageP() {
    const anger = getEnemyPresetAngerConfig();
    if (!anger) return 0;
    const stacks = clamp(Math.floor(readNumber(el.inputs.enemyAngerStack)), 0, anger.maxStacks);
    return anger.perStack * stacks;
  }

  function getWeaknessDamageP(defenderSide, damageType = resolveActiveDamageType(buildContext().target)) {
    if (defenderSide === 'enemy') {
      return getEnemyPresetWeaknessAdd(getSelectedEnemyPreset(), damageType) > 0
        ? readNumber(el.inputs.enemyWeaknessP)
        : 0;
    }
    return el.selfWeaknessField?.classList.contains('is-active') ? readNumber(el.inputs.selfWeaknessP) : 0;
  }

  function getDefenseMods(side) {
    if (side === 'self') {
      return {
        defP: readNumber(el.inputs.selfDefP),
        defDownP: readNumber(el.inputs.selfDefDownP),
        takenDmgP: readNumber(el.inputs.selfTakenDmgP),
        critResP: readNumber(el.inputs.selfCritResP),
        critResDownP: readNumber(el.inputs.selfCritResDownP),
        critResAddP: 0,
        critDmgResP: readNumber(el.inputs.selfCritDmgResP),
        critDmgResDownP: readNumber(el.inputs.selfCritDmgResDownP),
        critDmgResAddP: 0
      };
    }
    return {
      defP: readNumber(el.inputs.enemyDefP),
      defDownP: readNumber(el.inputs.enemyDefDownP),
      takenDmgP: readNumber(el.inputs.enemyTakenDmgP),
      critResP: readNumber(el.inputs.enemyCritResP),
      critResDownP: readNumber(el.inputs.enemyCritResDownP),
      critResAddP: 0,
      critDmgResP: readNumber(el.inputs.enemyCritDmgResP),
      critDmgResDownP: readNumber(el.inputs.enemyCritDmgResDownP),
      critDmgResAddP: 0
    };
  }

  function readEnemySkillMultiplier() {
    const selected = Number(el.inputs.enemySkill?.value);
    return Number.isFinite(selected) && selected > 0 ? selected : 100;
  }

  function syncPerspectiveUi() {
    const defense = view.perspective === 'enemy';
    document.body.classList.toggle('is-defense-mode', defense);
    if (el.perspectiveLabel) el.perspectiveLabel.textContent = defense ? '防御' : '攻撃';
    document.querySelector('.self-side')?.classList.toggle('is-attacker', !defense);
    document.querySelector('.self-side')?.classList.toggle('is-defender', defense);
    document.querySelector('.enemy-side')?.classList.toggle('is-attacker', defense);
    document.querySelector('.enemy-side')?.classList.toggle('is-defender', !defense);
    syncRoleChip(el.selfRoleChip, !defense);
    syncRoleChip(el.enemyRoleChip, defense);
  }

  function syncMobileSideUi() {
    const visibleSide = view.mobileVisibleSide === 'enemy' ? 'enemy' : 'self';
    document.body.dataset.fdcMobileSide = visibleSide;
    el.mobileSideButtons.forEach(button => {
      const active = button.dataset.fdcMobileSide === visibleSide;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function syncRoleChip(chip, attacker) {
    if (!chip) return;
    chip.textContent = attacker ? 'Attacker' : 'Defender';
    chip.classList.toggle('is-attacker-chip', attacker);
    chip.classList.toggle('is-defender-chip', !attacker);
  }

  function syncDamageTypeUi(context) {
    const damageType = context?.damageType || resolveActiveDamageType(context?.target);
    const isMagic = damageType === 'magic';
    document.querySelectorAll('.side-panel').forEach(panel => {
      panel.classList.toggle('is-magic-damage', isMagic);
      panel.classList.toggle('is-physical-damage', !isMagic);
    });
    syncAttackTypeChip(el.selfAttackTypeChip, resolveSelfDamageType(context?.target));
    syncAttackTypeChip(el.enemyAttackTypeChip, resolveEnemyDamageType(getSelectedEnemyPreset()));
  }

  function syncAttackTypeChip(chip, damageType) {
    if (!chip) return;
    const isMagic = damageType === 'magic';
    chip.classList.toggle('is-magic', isMagic);
    chip.classList.toggle('is-physical', !isMagic);
    const image = chip.querySelector('img');
    const label = chip.querySelector('b');
    if (image) {
      image.src = isMagic ? 'img/Attack_mag.webp' : 'img/Attack_phys.webp';
      image.alt = isMagic ? '魔法' : '物理';
    }
    if (label) label.textContent = isMagic ? '魔法' : '物理';
  }

  function syncPersonalityTypeAffinity(context) {
    const selfPersonality = normalizePersonalityName(context?.target?.personality);
    const enemyPersonality = getEffectiveEnemyPersonality();
    const rate = getPersonalityTypeRate(
      view.perspective === 'enemy' ? enemyPersonality : selfPersonality,
      view.perspective === 'enemy' ? selfPersonality : enemyPersonality,
      view.enemySourceMode === 'apostle' && view.pvpAffinityEnabled
    );
    const input = view.perspective === 'enemy' ? el.inputs.enemyType : el.inputs.selfType;
    if (input) input.value = String(rate);
  }

  function getPersonalityTypeRate(attackerPersonality, defenderPersonality, pvpAdjusted = false) {
    if (!attackerPersonality || !defenderPersonality) return 100;
    if (attackerPersonality === defenderPersonality) return 100;
    if (PERSONALITY_ADVANTAGE[attackerPersonality] === defenderPersonality) return pvpAdjusted ? 150 : 200;
    if (PERSONALITY_ADVANTAGE[defenderPersonality] === attackerPersonality) return pvpAdjusted ? 75 : 50;
    return 100;
  }

  function normalizePersonalityName(value) {
    const text = String(value || '').trim();
    return Object.prototype.hasOwnProperty.call(PERSONALITY_ADVANTAGE, text) ? text : '';
  }

  function getEffectiveEnemyPersonality() {
    if (view.enemySourceMode === 'apostle') {
      return normalizePersonalityName(getApostle(view.enemyApostleId)?.性格);
    }
    return normalizePersonalityName(view.enemyPersonality);
  }

  function syncEnemyPersonalityUi() {
    const personality = getEffectiveEnemyPersonality();
    if (el.enemyPersonality) el.enemyPersonality.value = personality;
    if (el.enemyPersonalityIcon) {
      el.enemyPersonalityIcon.src = personality ? `img/性格_${personality}.webp` : 'img/性格_なし.webp';
      el.enemyPersonalityIcon.alt = personality || 'なし';
    }
  }

  function toggleCardCostPanel() {
    if (!el.cardCostPanel || !el.cardCost) return;
    const open = !!el.cardCostPanel.hidden;
    el.cardCostPanel.hidden = !open;
    el.cardCost.setAttribute('aria-expanded', String(open));
  }

  function closeCardCostPanel() {
    if (!el.cardCostPanel || !el.cardCost || el.cardCostPanel.hidden) return;
    el.cardCostPanel.hidden = true;
    el.cardCost.setAttribute('aria-expanded', 'false');
  }

  function toggleApplyFloatPanel() {
    if (!el.applyFloatPanel || !el.applyFloatToggle) return;
    const open = !!el.applyFloatPanel.hidden;
    if (open && el.saveMenu) el.saveMenu.open = false;
    if (open) closeCompareFloatPanel();
    el.applyFloatPanel.hidden = !open;
    el.applyFloatToggle.setAttribute('aria-expanded', String(open));
  }

  function closeApplyFloatPanel() {
    if (!el.applyFloatPanel || !el.applyFloatToggle || el.applyFloatPanel.hidden) return;
    el.applyFloatPanel.hidden = true;
    el.applyFloatToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleCompareFloatPanel() {
    if (!el.compareFloatPanel || !el.compareFloatToggle) return;
    const open = !!el.compareFloatPanel.hidden;
    if (open && el.saveMenu) el.saveMenu.open = false;
    if (open) {
      closeApplyFloatPanel();
      renderComparisonSourceControls();
    }
    el.compareFloatPanel.hidden = !open;
    el.compareFloatToggle.setAttribute('aria-expanded', String(open));
  }

  function closeCompareFloatPanel() {
    if (!el.compareFloatPanel || !el.compareFloatToggle || el.compareFloatPanel.hidden) return;
    el.compareFloatPanel.hidden = true;
    el.compareFloatToggle.setAttribute('aria-expanded', 'false');
  }

  function getCombatScenarioApi() {
    return typeof TRICKCAL_COMBAT_SCENARIO === 'undefined' ? null : TRICKCAL_COMBAT_SCENARIO;
  }

  function getPinnedComparisonSession() {
    return getCombatScenarioApi()?.loadComparisonSession?.() || null;
  }

  function createPinnedDpsSnapshot(snapshot = {}) {
    return clonePlain({
      targetId: snapshot.targetId || '',
      targetName: snapshot.targetName || '',
      apostle: snapshot.apostle || null,
      skillLevels: snapshot.skillLevels || {},
      damageType: snapshot.damageType || '',
      actionCategory: snapshot.actionCategory || '',
      selectedSkillOptionKey: snapshot.selectedSkillOptionKey || '',
      boardState: snapshot.boardState || null,
      singleActionProfiles: snapshot.singleActionProfiles || {},
      actionDamageProfiles: snapshot.actionDamageProfiles || {},
      actionEffectAudit: snapshot.actionEffectAudit || {}
    });
  }

  function loadComparisonStateSlots() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STAT_SLOT_STORAGE_KEY) || '{}');
      return Object.entries(parsed?.slots || {})
        .filter(([, entry]) => entry?.snapshot && typeof entry.snapshot === 'object')
        .map(([slot, entry]) => ({
          slot: String(slot),
          savedAt: entry.savedAt || entry.snapshot.savedAt || '',
          snapshot: entry.snapshot
        }))
        .sort((a, b) => Number(a.slot) - Number(b.slot));
    } catch {
      return [];
    }
  }

  function formatComparisonStateSlotLabel(item) {
    const snapshot = item?.snapshot || {};
    const slotName = String(snapshot.slotName || '').trim();
    const apostleName = snapshot.apostleName || snapshot.activeId || '名称なし';
    const name = slotName || apostleName;
    const savedAt = formatComparisonStateSlotSavedAt(item?.savedAt || snapshot.savedAt);
    const displayName = (!slotName || slotName === apostleName) && savedAt
      ? `${name}（${savedAt}）`
      : name;
    return `スロット${item.slot}: ${displayName}`;
  }

  function formatComparisonStateSlotSavedAt(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = number => String(number).padStart(2, '0');
    return `${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function getComparisonSources() {
    const state = loadStatState();
    return [
      { value: 'current', label: '現在の状態を記録', type: 'current' },
      ...loadComparisonStateSlots().map(item => ({
        value: `slot:${item.slot}`,
        label: formatComparisonStateSlotLabel(item),
        type: 'slot',
        data: item
      })),
      ...getSavedFormationPresets(state).map(item => ({
        value: `formation:${item.id}`,
        label: `保存編成: ${item.name || '無題の編成'}`,
        type: 'formation',
        data: item
      })),
      ...loadDamageCalculationSaves().map(item => ({
        value: `calc:${item.id}`,
        label: `保存計算: ${item.name || '無題の計算'}`,
        type: 'calc',
        data: item
      }))
    ];
  }

  function renderComparisonSourceControls() {
    if (!el.compareSource) return;
    const sources = getComparisonSources();
    if (!sources.some(source => source.value === view.comparisonSource)) view.comparisonSource = 'current';
    const groups = [
      ['current', '現在'],
      ['slot', 'ステータス保存'],
      ['formation', '保存編成'],
      ['calc', '保存済み計算']
    ];
    el.compareSource.innerHTML = groups.map(([type, label]) => {
      const options = sources.filter(source => source.type === type);
      if (!options.length) return '';
      return `<optgroup label="${escapeAttr(label)}">${options.map(source =>
        `<option value="${escapeAttr(source.value)}">${escapeHtml(source.label)}</option>`
      ).join('')}</optgroup>`;
    }).join('');
    el.compareSource.value = view.comparisonSource;
    syncComparisonScopeControls(sources);
  }

  function getSelectedComparisonSource(sources = getComparisonSources()) {
    return sources.find(source => source.value === view.comparisonSource) || sources[0] || null;
  }

  function syncComparisonScopeControls(sources = getComparisonSources()) {
    const source = getSelectedComparisonSource(sources);
    const available = source?.type === 'slot'
      ? new Set(['characterState', 'formationState', 'cardState'])
      : source?.type === 'formation'
        ? new Set(['formationState'])
        : new Set();
    el.compareScopeInputs.forEach(input => {
      const scope = input.dataset.fdcCompareScope;
      const selectable = available.has(scope);
      input.disabled = !selectable;
      input.checked = source?.type === 'formation'
        ? scope === 'formationState'
        : source?.type === 'slot'
          ? view.comparisonScopes[scope] !== false
          : true;
    });
    if (el.compareScopeFieldset) {
      el.compareScopeFieldset.disabled = !available.size;
      el.compareScopeFieldset.dataset.sourceType = source?.type || 'current';
    }
    if (el.pinnedCompareSave) {
      el.pinnedCompareSave.textContent = getPinnedComparisonSession()
        ? '比較基準を更新'
        : 'この条件で比較開始';
    }
    updateComparisonSourceHelp(source);
  }

  function hasTemporaryFormationComparisonChanges() {
    const hasMembers = Object.values(view.tempMembers || {}).some(Boolean);
    const hasArtifacts = Object.values(view.tempArtifacts?.formation || {}).some(Boolean)
      || Object.values(view.tempArtifacts?.target || {}).some(Boolean);
    return hasMembers || hasArtifacts || Array.isArray(view.tempSpells)
      || Object.keys(sanitizeFdcTempCardStates(view.tempCardStates)).length > 0;
  }

  function updateComparisonSourceHelp(source = getSelectedComparisonSource()) {
    if (!el.compareFloatHelp) return;
    const active = !!getPinnedComparisonSession();
    const prefix = active ? '現在、この基準と比較中です。' : '';
    if (source?.type === 'slot') {
      const temporaryNote = hasTemporaryFormationComparisonChanges()
        ? ' ダメージ計算内の一時編成・一時カードは保存スロットに含まれないため、編成内容を比較すると差が出ます。'
        : '';
      el.compareFloatHelp.textContent = `${prefix}保存スロットは使徒育成のみを初期選択しています。編成使徒・遺物・スペルやカードの★・はんだも比べる場合だけ追加で選択してください。${temporaryNote}`;
      return;
    }
    if (source?.type === 'formation') {
      el.compareFloatHelp.textContent = `${prefix}保存編成の使徒・遺物・スペル・教主の権能を、現在の編成内容と比較します。`;
      return;
    }
    if (source?.type === 'calc') {
      el.compareFloatHelp.textContent = `${prefix}保存済み計算に記録された育成・編成・カード・計算条件をまとめて比較元にします。`;
      return;
    }
    el.compareFloatHelp.textContent = `${prefix}今の育成・編成・計算設定を基準として記録し、その後の変更との差を確認します。`;
  }

  function getSelectedComparisonScopes() {
    return el.compareScopeInputs
      .filter(input => !input.disabled && input.checked)
      .map(input => input.dataset.fdcCompareScope);
  }

  function createCombatScenarioFromStateSnapshot(snapshot = {}, sourceMeta = {}) {
    const candidate = captureCombatScenario(buildContext());
    const source = clonePlain(candidate);
    const hydrated = hydrateComparisonApostleSnapshots(snapshot.apostles || {}, snapshot.comparisonStats);
    source.sourceMeta = {
      type: 'stateSlot',
      ...clonePlain(sourceMeta),
      missingStatSnapshotIds: hydrated.missingIds
    };
    source.characterState = {
      ...clonePlain(candidate.characterState),
      apostles: hydrated.apostles,
      research: clonePlain(snapshot.research || {})
    };
    source.formationState = {
      ...clonePlain(candidate.formationState),
      presetId: snapshot.activeFormationPresetId || '',
      formation: clonePlain(normalizeFormation(snapshot.formation || {})),
      tempMembers: {}
    };
    source.cardState = {
      ...clonePlain(candidate.cardState),
      cards: clonePlain(migrateCardStateMap(snapshot.cards || {})),
      tempArtifacts: { formation: {}, target: {} },
      tempSpells: null,
      tempCardStates: {}
    };
    return getCombatScenarioApi()?.createScenario?.(source) || source;
  }

  function hydrateComparisonApostleSnapshots(savedApostles = {}, comparisonStats = {}) {
    const apostles = clonePlain(savedApostles || {});
    const engine = typeof TRICKCAL_SHARED_STAT_ENGINE === 'undefined' ? null : TRICKCAL_SHARED_STAT_ENGINE;
    const decoded = engine?.decodeComparisonStatSnapshots?.(comparisonStats) || {};
    Object.entries(decoded).forEach(([id, snapshots]) => {
      if (!apostles[id] || typeof apostles[id] !== 'object') return;
      apostles[id].statSnapshots = {
        ...(apostles[id].statSnapshots || {}),
        ...clonePlain(snapshots)
      };
      if (apostles[id].statSnapshots.current?.stats) {
        apostles[id].finalStats = clonePlain(apostles[id].statSnapshots.current.stats);
      }
    });
    const liveApostles = loadStatState().apostles || {};
    const missingIds = [];
    Object.entries(apostles).forEach(([id, savedState]) => {
      if (savedState?.statSnapshots?.current?.stats) return;
      const liveState = liveApostles[id];
      if (liveState?.statSnapshots?.current?.stats && areEquivalentApostleSettings(savedState, liveState)) {
        savedState.statSnapshots = clonePlain(liveState.statSnapshots);
        savedState.finalStats = clonePlain(liveState.finalStats || liveState.statSnapshots.current.stats);
        return;
      }
      missingIds.push(id);
    });
    return { apostles, missingIds };
  }

  function areEquivalentApostleSettings(left = {}, right = {}) {
    const normalize = value => {
      const result = clonePlain(value || {});
      delete result.statSnapshots;
      delete result.finalStats;
      return result;
    };
    return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
  }

  function createCombatScenarioFromFormationPreset(preset = {}) {
    const candidate = captureCombatScenario(buildContext());
    const source = clonePlain(candidate);
    source.sourceMeta = {
      type: 'formationPreset',
      id: preset.id || '',
      name: preset.name || '無題の編成'
    };
    source.formationState = {
      ...clonePlain(candidate.formationState),
      presetId: preset.id || '',
      formation: clonePlain(normalizeFormation(preset.formation || {})),
      tempMembers: {}
    };
    return getCombatScenarioApi()?.createScenario?.(source) || source;
  }

  function evaluateComparisonScenario(scenario = {}) {
    const savedView = {
      targetId: view.targetId,
      formationPresetId: view.formationPresetId,
      statMode: view.statMode,
      gradeOverride: view.gradeOverride,
      statDirty: view.statDirty,
      referenceState: view.referenceState,
      referenceOptions: view.referenceOptions,
      tempMembers: view.tempMembers,
      tempArtifacts: view.tempArtifacts,
      tempSpells: view.tempSpells,
      tempCardStates: view.tempCardStates,
      skillLevelOverrides: view.skillLevelOverrides
    };
    const savedInputs = snapshotSelfStatInputs();
    try {
      const targetId = scenario.actors?.self?.id || scenario.characterState?.targetId || view.targetId;
      if (!scenario.characterState?.apostles?.[targetId]) {
        return { error: '選択した比較元に現在の使徒データがありません' };
      }
      view.targetId = targetId;
      view.formationPresetId = '';
      view.statMode = scenario.characterState?.statMode === 'planned' ? 'planned' : 'current';
      view.gradeOverride = scenario.characterState?.gradeOverride || 'saved';
      view.statDirty = false;
      view.referenceState = {
        found: true,
        activeId: targetId,
        apostles: clonePlain(scenario.characterState?.apostles || {}),
        research: clonePlain(scenario.characterState?.research || {}),
        cards: clonePlain(scenario.cardState?.cards || {}),
        formation: clonePlain(normalizeFormation(scenario.formationState?.formation || {})),
        savedFormations: []
      };
      view.referenceOptions = { cards: true, global: true, apostles: true };
      view.tempMembers = clonePlain(scenario.formationState?.tempMembers || {});
      view.tempArtifacts = clonePlain(scenario.cardState?.tempArtifacts || { formation: {}, target: {} });
      view.tempSpells = Array.isArray(scenario.cardState?.tempSpells) ? scenario.cardState.tempSpells.slice() : null;
      view.tempCardStates = sanitizeFdcTempCardStates(scenario.cardState?.tempCardStates);
      view.skillLevelOverrides = sanitizeSkillLevelOverrides(scenario.effectAssumptions?.skillLevelOverrides || {});
      const context = buildContext({ detached: true });
      if (!context.target || context.target.id !== targetId) {
        return { error: '選択した比較元の編成に現在の使徒がいません' };
      }
      writeSelfStatInputsForStats(context, context.target.stats || {});
      const result = calculateDamage(context);
      const dpsSnapshot = createPinnedDpsSnapshot(createDpsPrototypeSnapshot(context));
      return { result, dpsSnapshot };
    } finally {
      Object.assign(view, savedView);
      restoreSelfStatInputs(savedInputs);
    }
  }

  function savePinnedComparisonBaseline() {
    const api = getCombatScenarioApi();
    if (!api?.savePinnedComparison) return;
    const context = buildContext();
    if (!context.target) {
      if (el.pinnedCompareNote) el.pinnedCompareNote.textContent = '先に比較する使徒を選択してください';
      return;
    }
    const source = getSelectedComparisonSource();
    let scenario = captureCombatScenario(context);
    let result = calculateDamage(context);
    let dpsSnapshot = createPinnedDpsSnapshot(createDpsPrototypeSnapshot());
    if (source?.type === 'calc') {
      scenario = createCombatScenarioFromDamageSave(source.data);
      result = source.data.snapshot?.result || {};
      dpsSnapshot = source.data.snapshot?.comparison?.dpsSnapshot || {};
    } else if (source?.type === 'slot' || source?.type === 'formation') {
      const scopes = getSelectedComparisonScopes();
      if (!scopes.length) {
        if (el.pinnedCompareNote) el.pinnedCompareNote.textContent = '比較する範囲を1つ以上選択してください';
        return;
      }
      const sourceScenario = source.type === 'slot'
        ? createCombatScenarioFromStateSnapshot(source.data.snapshot, {
          slot: source.data.slot,
          name: formatComparisonStateSlotLabel(source.data)
        })
        : createCombatScenarioFromFormationPreset(source.data);
      const missingTargetSnapshot = source.type === 'slot'
        && sourceScenario.sourceMeta?.missingStatSnapshotIds?.includes(context.target.id);
      if (missingTargetSnapshot) {
        if (el.pinnedCompareNote) {
          el.pinnedCompareNote.textContent = 'この保存スロットは旧形式のため、ステータス管理で一度読み込み、再保存してください';
        }
        return;
      }
      scenario = api.materializeComparison?.(scenario, sourceScenario, scopes) || sourceScenario;
      if (source.type === 'formation') {
        const currentState = loadStatState();
        scenario.characterState.apostles = clonePlain(currentState.apostles || scenario.characterState.apostles || {});
      }
      const evaluation = evaluateComparisonScenario(scenario);
      if (evaluation.error) {
        if (el.pinnedCompareNote) el.pinnedCompareNote.textContent = evaluation.error;
        return;
      }
      result = evaluation.result;
      dpsSnapshot = evaluation.dpsSnapshot;
      scenario.characterState.boardState = clonePlain(dpsSnapshot.boardState || scenario.characterState.boardState || {});
      if (api.fingerprint) scenario.sourceMeta.fingerprint = api.fingerprint(scenario);
    }
    const session = api.savePinnedComparison({
      scenario,
      singleActionResult: result,
      dpsSnapshot
    });
    if (!session) {
      if (el.pinnedCompareNote) el.pinnedCompareNote.textContent = '基準の保存に失敗しました';
      return;
    }
    syncPinnedComparisonUi(context);
    renderResult(context);
    window.dispatchEvent(new CustomEvent('trickcal:comparison-session-changed', {
      detail: { mode: 'pinned', source: source?.type || 'current', id: source?.value || 'current' }
    }));
  }

  function clearPinnedComparisonBaseline() {
    getCombatScenarioApi()?.clearComparisonSession?.();
    const context = buildContext();
    syncPinnedComparisonUi(context);
    renderResult(context);
    window.dispatchEvent(new CustomEvent('trickcal:comparison-session-changed', { detail: { mode: 'none' } }));
  }

  function getPinnedSingleComparison(context = buildContext()) {
    const session = getPinnedComparisonSession();
    if (!session?.baseline?.singleActionResult) return null;
    const baselineScenario = session.baseline.scenario || {};
    const baselineTargetId = baselineScenario.actors?.self?.id || baselineScenario.characterState?.targetId || '';
    const baselinePerspective = baselineScenario.battleConditions?.perspective || 'self';
    if (!context.target || baselineTargetId !== context.target.id || baselinePerspective !== view.perspective) return null;
    const result = resolvePinnedSingleActionResult(session, context);
    if (!result) return null;
    return {
      session,
      result
    };
  }

  function resolvePinnedSingleActionResult(session, context) {
    const savedResult = session?.baseline?.singleActionResult || null;
    const policy = session?.evaluationPolicy?.singleAction || 'followCandidateAction';
    if (policy === 'fixedBaselineAction') return savedResult;
    const baselineScenario = session?.baseline?.scenario || {};
    const baselineAction = baselineScenario.battleConditions || {};
    if (view.perspective === 'enemy') {
      return baselineAction.enemySelectedSkillCategory === view.enemySelectedSkillCategory
        ? savedResult
        : null;
    }
    const selectedOption = context.selectedSkillOption || resolveSelectedSelfSkillOption(context);
    if (!selectedOption) {
      const sameCategory = (baselineAction.actionCategory || baselineAction.selectedSkillCategory || '') === (context.actionCategory || '');
      return sameCategory ? savedResult : null;
    }
    const profiles = session?.baseline?.dpsSnapshot?.singleActionProfiles || {};
    const exact = profiles[selectedOption.key];
    if (exact?.damageResult) return exact.damageResult;
    const compatible = Object.values(profiles).find(profile => {
      if (!profile?.damageResult) return false;
      if (selectedOption.effectId && profile.effectId === selectedOption.effectId) return true;
      return profile.category === selectedOption.category
        && profile.sourceCategory === selectedOption.sourceCategory
        && profile.kind === selectedOption.kind;
    });
    if (compatible?.damageResult) return compatible.damageResult;
    const sameOption = baselineAction.selectedSkillOptionKey
      ? baselineAction.selectedSkillOptionKey === selectedOption.key
      : (baselineAction.actionCategory || baselineAction.selectedSkillCategory || '') === (selectedOption.category || context.actionCategory || '');
    return sameOption ? savedResult : null;
  }

  function syncPinnedComparisonUi(context = buildContext()) {
    if (!el.pinnedCompareNote || !el.pinnedCompareClear) return;
    const session = getPinnedComparisonSession();
    el.pinnedCompareClear.disabled = !session;
    if (el.pinnedCompareSave) {
      el.pinnedCompareSave.textContent = session ? '比較基準を更新' : 'この条件で比較開始';
    }
    el.compareFloatToggle?.classList.toggle('is-active', !!session);
    if (el.compareFloatToggleLabel) el.compareFloatToggleLabel.textContent = session ? '比較中' : '比較';
    if (el.compareFloatToggle) {
      el.compareFloatToggle.setAttribute('aria-label', session ? '変更前と比較中' : '変更前と比較');
      el.compareFloatToggle.title = session ? '変更前との比較を確認・更新・終了' : '今の状態を記録して変更後と比較';
    }
    updateComparisonSourceHelp();
    if (!session) {
      el.pinnedCompareNote.textContent = '比較を開始していません';
      el.pinnedCompareNote.title = '';
      return;
    }
    const scenario = session.baseline.scenario || {};
    const name = scenario.actors?.self?.name || scenario.actors?.self?.id || '使徒未選択';
    const sourceLabel = formatPinnedComparisonSource(scenario);
    const baselineBoard = scenario.characterState?.boardState || session.baseline.dpsSnapshot?.boardState || {};
    const baselineBoardLabel = formatBoardComparisonMode(baselineBoard);
    const compatible = scenario.actors?.self?.id === context.target?.id
      && (scenario.battleConditions?.perspective || 'self') === view.perspective;
    const comparison = compatible ? getPinnedSingleComparison(context) : null;
    const expected = Number(comparison?.result?.expected) || 0;
    if (compatible && comparison) {
      const contextText = `${name} / 基準:${sourceLabel}・ボード${baselineBoardLabel} / 現在行動に追従`;
      const expectedText = `期待値 ${formatCompactDamage(expected)}`;
      el.pinnedCompareNote.innerHTML = `
        <span class="fdc-pinned-compare-context">${escapeHtml(contextText)}</span>
        <b class="fdc-pinned-compare-expected">${escapeHtml(expectedText)}</b>
      `;
      el.pinnedCompareNote.title = `${contextText} / ${expectedText}`;
    } else {
      const message = compatible
        ? `${name} / 現在行動を基準側で解決できません`
        : `${name} / 現在条件では比較停止`;
      el.pinnedCompareNote.textContent = message;
      el.pinnedCompareNote.title = message;
    }
  }

  function formatPinnedComparisonSource(scenario = {}) {
    const meta = scenario.sourceMeta?.comparisonSource || scenario.sourceMeta || {};
    if (meta.type === 'stateSlot') return meta.name || `保存スロット${meta.slot || ''}`;
    if (meta.type === 'formationPreset') return `保存編成:${meta.name || '無題'}`;
    if (meta.type === 'damageSave') return `保存計算:${meta.name || '無題'}`;
    return '現在記録';
  }

  function formatPinnedComparisonScopes(scenario = {}) {
    const scopes = scenario.sourceMeta?.comparisonScopes;
    if (!Array.isArray(scopes) || !scopes.length) return 'すべて';
    const labels = {
      characterState: '使徒育成',
      formationState: '編成',
      cardState: 'カード',
      battleConditions: '戦闘条件',
      effectAssumptions: '効果設定'
    };
    return scopes.map(scope => labels[scope] || scope).join('・');
  }

  function syncApplyFloatUi() {
    if (el.statMode) el.statMode.value = view.statMode;
    el.statModeChoices.forEach(button => {
      const active = button.dataset.fdcStatModeChoice === view.statMode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    el.applyFloatInputs.forEach(input => {
      const key = input.dataset.fdcApplySource;
      input.checked = isEffectSourceActive(key);
      input.disabled = isEffectSourceBlockedByContent(key);
    });
    el.categorySourceInputs.forEach(input => {
      const key = input.dataset.fdcCategorySource;
      input.checked = isEffectSourceActive(key);
      input.disabled = isEffectSourceBlockedByContent(key);
    });
    el.resultDisplayInputs.forEach(input => {
      const key = input.dataset.fdcResultDisplay;
      input.checked = view.resultDisplays[key] !== false;
    });
    Object.values(el.result.hpRates || {}).forEach(element => {
      if (element) element.hidden = view.resultDisplays.hp === false;
    });
    el.applyFloatDots.forEach(dot => {
      const key = dot.dataset.fdcApplyDot;
      dot.classList.toggle('is-on', isEffectSourceActive(key));
      dot.classList.toggle('is-off', !isEffectSourceActive(key));
    });
    const enabledCount = Object.keys(view.effectSources).filter(isEffectSourceActive).length;
    el.applyFloat?.classList.toggle('is-all-enabled', enabledCount === Object.keys(view.effectSources).length);
    el.applyFloat?.classList.toggle('is-all-disabled', enabledCount === 0);
    el.applyFloat?.classList.toggle('is-partial-enabled', enabledCount > 0 && enabledCount < Object.keys(view.effectSources).length);
  }

  function collectEffects({ target, formation, cards, damageType, state, actionCategory }) {
    const result = { applied: [], conditional: [], skillChanges: [], globalStats: [] };
    if (!target) return result;
    countIds(target.artifactIds).map(({ id, qty }) => createCardRow(id, qty, cards[id])).forEach(row => {
      pushBaseCardEffect(result.applied, row, '装備遺物', damageType);
      pushConditionalCardEffects(result, row, target, '装備遺物', damageType, actionCategory, formation);
    });
    pushFormationArtifactEffects(result, { target, formation, cards, damageType, actionCategory });
    countIds(formation.spells).map(({ id, qty }) => createCardRow(id, qty, cards[id])).forEach(row => {
      pushBaseCardEffect(result.applied, row, 'スペル', damageType);
      pushConditionalCardEffects(result, row, target, 'スペル', damageType, actionCategory, formation);
    });
    pushSynergyEffects(result.applied, formation, target, state);
    pushFavoriteSkillEffects(result.skillChanges, target, formation, cards);
    pushGlobalStatSnapshotEffects(result.globalStats, target, state);
    pushExtraCrayonEffects(result.globalStats);
    finalizeEffectTags(result);
    return result;
  }

  function collectEnemyCardEffects({ target, cards, damageType, actionCategory }) {
    const result = { applied: [], conditional: [], skillChanges: [], globalStats: [] };
    if (!target) return result;
    const enemyCards = { ...(cards || {}) };
    (target.artifactIds || []).forEach((id, index) => {
      if (!id) return;
      const cardState = { ...(cards?.[id] || {}), ...(target.artifactSettings?.[index] || {}) };
      enemyCards[id] = cardState;
      const row = { ...createCardRow(id, 1, cardState), ownerId: `enemy:${target.id}` };
      pushBaseCardEffect(result.applied, row, '装備遺物', damageType);
      pushConditionalCardEffects(
        result,
        row,
        target,
        '装備遺物',
        damageType,
        actionCategory,
        { rows: [{ apostles: [target.id] }], spells: target.spellIds || [] }
      );
    });
    countIds(target.spellIds || []).forEach(({ id, qty }) => {
      const cardState = { ...(cards?.[id] || {}), ...(target.spellSettings?.[id] || {}) };
      enemyCards[id] = cardState;
      const row = { ...createCardRow(id, qty, cardState), ownerId: `enemy-spell:${target.id}` };
      pushBaseCardEffect(result.applied, row, 'スペル', damageType);
      pushConditionalCardEffects(
        result,
        row,
        target,
        'スペル',
        damageType,
        actionCategory,
        { rows: [{ apostles: [target.id] }], spells: target.spellIds || [] }
      );
    });
    pushFavoriteSkillEffects(result.skillChanges, target, { rows: [{ apostles: [target.id] }], spells: target.spellIds || [] }, enemyCards);
    finalizeEffectTags(result);
    return result;
  }

  function finalizeEffectTags(result) {
    result.applied.forEach(item => setEffectTags(item, { status: ['自動適用'] }));
    result.conditional.forEach(item => setEffectTags(item, { status: item.tags?.status?.length ? item.tags.status : ['条件あり'] }));
    result.skillChanges.forEach(item => setEffectTags(item, { status: ['スキル変更'] }));
    result.globalStats.forEach(item => {
      const source = item.source === '追加クレヨン'
        ? ['追加クレヨン']
        : ['クレヨン', 'A3全体', 'フォロー'];
      setEffectTags(item, { status: ['自動適用'], source, effect: ['全体ステータス補正'] });
    });
  }

  function setEffectTags(item, additions = {}) {
    const inferred = inferEffectTags(item);
    item.tags = {
      source: unique([...(item.tags?.source || []), ...(inferred.source || []), ...(additions.source || [])]),
      status: unique([...(item.tags?.status || []), ...(inferred.status || []), ...(additions.status || [])]),
      target: unique([...(item.tags?.target || []), ...(inferred.target || []), ...(additions.target || [])]),
      effect: unique([...(item.tags?.effect || []), ...(inferred.effect || []), ...(additions.effect || [])])
    };
    return item;
  }

  function inferEffectTags(item) {
    const text = [item.source, item.cardName, item.label, item.reason].filter(Boolean).join(' ');
    const source = [];
    const status = [];
    const target = [];
    const effect = [];
    if (item.source === '装備遺物') source.push(/愛用/.test(text) ? '愛用遺物' : '遺物');
    if (item.source === '編成遺物') source.push(/愛用/.test(text) ? '愛用遺物' : '遺物');
    if (item.source === 'スペル') source.push(/愛用/.test(text) ? '愛用スペル' : 'スペル');
    if (item.source === '愛用スキル') source.push(item.cardSource === 'スペル' ? '愛用スペル' : '愛用遺物');
    if (item.source === '本人スキル' || item.source === '編成スキル') source.push('スキル/アサイド');
    if (item.source === '性格シナジー' || item.source === '種族シナジー') source.push('シナジー');
    if (/対象外/.test(text)) status.push('対象外');
    if (/発動条件|条件あり|ウェーブ|開始時|毎に|ごと|普通攻撃|基本攻撃|スキル使用時|敵1体/.test(text)) status.push('条件あり');
    if (/重複/.test(text)) status.push('重複不可');
    if (/前列/.test(text)) target.push('前列');
    if (/中列/.test(text)) target.push('中列');
    if (/後列/.test(text)) target.push('後列');
    if (/攻撃役割|役割=攻撃|アタッカー/.test(text)) target.push('攻撃役割');
    if (/守備|防御役割|ガード/.test(text)) target.push('守備役割');
    if (/支援|補助|サポート/.test(text)) target.push('支援役割');
    if (/物理/.test(text)) target.push('物理');
    if (/魔法/.test(text)) target.push('魔法');
    Object.keys(item.bonuses || {}).forEach(key => effect.push(...effectTagsFromBonusKey(key)));
    if (/攻撃速度/.test(text)) effect.push('攻撃速度');
    if (/スキル/.test(text)) effect.push('スキル');
    if (/アサイド/.test(text)) effect.push('アサイド');
    if (/クールタイム|CT/.test(text)) effect.push('クールタイム');
    if (/通常攻撃|基本攻撃/.test(text)) effect.push('通常攻撃');
    if (/強化攻撃/.test(text)) effect.push('強化攻撃');
    return { source: unique(source), status: unique(status), target: unique(target), effect: unique(effect) };
  }

  function effectTagsFromBonusKey(key) {
    const map = {
      hpP: ['HP'],
      atkP: ['攻撃力'],
      physicalAtkP: ['物理攻撃'],
      magicAtkP: ['魔法攻撃'],
      critP: ['会心'],
      critRateP: ['会心率'],
      critDmgP: ['会心DMGステ'],
      critDmgAddP: ['会心DMG増'],
      hasteP: ['攻撃速度'],
      addP: ['与ダメ'],
      specialP: ['特殊'],
      otherP: ['その他'],
      normalAttackAddP: ['普通攻撃ダメージ'],
      basicAddP: ['基本攻撃ダメージ'],
      enhancedAddP: ['強化攻撃ダメージ'],
      skillAddP: ['スキルダメージ'],
      healingP: ['治癒'],
      hpRecoveryP: ['HP回復'],
      spRecovery: ['SP回復'],
      spRecoveryP: ['SP回復'],
      spRegen: ['毎秒SP回復'],
      spRegenP: ['毎秒SP回復'],
      initialSp: ['初期SP'],
      initialSpP: ['初期SP'],
      defP: ['防御力'],
      physicalDefP: ['物理防御'],
      magicDefP: ['魔法防御'],
      takenDmgP: ['被ダメ'],
      critResP: ['会心抵抗'],
      critResAddP: ['会心率抵抗'],
      critDmgResP: ['会心DMG抵抗'],
      critDmgResAddP: ['会心DMG抵抗'],
      atkDownP: ['攻撃低下'],
      attackerDmgDownP: ['攻撃低下'],
      enemyDefDownP: ['敵防御低下'],
      enemyCritResDownP: ['敵会心抵抗低下'],
      enemyCritDmgResDownP: ['敵会心DMG抵抗低下']
    };
    return map[key] || [key];
  }

  function pushGlobalStatSnapshotEffects(list, target, state) {
    const apostleState = state?.apostles?.[target.id] || {};
    const mode = view.statMode === 'planned' ? 'planned' : 'current';
    const snapshot = mode === 'planned'
      ? apostleState.statSnapshots?.planned || apostleState.statSnapshots?.current
      : apostleState.statSnapshots?.current;
    if (!snapshot) return;
    const globalIncrease = snapshot.breakdown?.globalPercent || {};
    const globalRates = snapshot.globalPercentRates || {};
    const increaseText = formatStatMap(globalIncrease);
    const rateText = formatStatMap(globalRates, '%');
    const diffText = mode === 'planned'
      ? formatStatMap(createGlobalStatSnapshotDiff(apostleState, 'globalPercent'))
      : '';
    const label = mode === 'planned' && apostleState.statSnapshots?.planned
      ? 'クレヨン/A3/フォロー等（予定参照）'
      : 'クレヨン/A3/フォロー等（現在参照）';
    if (!increaseText && !rateText) {
      list.push({
        source: '全体ステータス補正',
        label,
        reason: '最終ステータスに反映済み。内訳データなし'
      });
      return;
    }
    list.push({
      source: '全体ステータス補正',
      label,
      bonuses: globalIncrease,
      bonusText: increaseText,
      reason: [rateText ? `補正率: ${rateText}` : '', diffText ? `現在との差分: ${diffText}` : ''].filter(Boolean).join(' / ')
    });
  }

  function createGlobalStatSnapshotDiff(apostleState = {}, key = 'globalPercent') {
    const current = apostleState.statSnapshots?.current?.breakdown?.[key] || {};
    const planned = apostleState.statSnapshots?.planned?.breakdown?.[key] || {};
    const diff = {};
    new Set([...Object.keys(current), ...Object.keys(planned)]).forEach(statKey => {
      const value = (Number(planned[statKey]) || 0) - (Number(current[statKey]) || 0);
      if (value) diff[statKey] = value;
    });
    return diff;
  }

  function pushExtraCrayonEffects(list) {
    const rates = readExtraCrayonInputs();
    if (!Object.values(rates).some(value => Number(value))) return;
    const rateText = formatStatMap(rates, '%');
    list.push({
      source: '追加クレヨン',
      label: '追加クレヨン',
      reason: rateText ? `基礎ステータスへ追加補正: ${rateText}` : '',
      bonuses: {}
    });
  }

  function pushBaseCardEffect(list, row, source, damageType) {
    const card = getCard(row.id);
    const qty = Math.max(1, Number(row.qty) || 1);
    const bonuses = scaleBonusMap(normalizeCardBonusMap(card?.bonusesByStar?.[row.star - 1], damageType), qty);
    const qtyLabel = qty > 1 ? ` x${qty}` : '';
    if (bonuses && Object.keys(bonuses).length) list.push({ source, cardName: row.name, label: `基礎補正${qtyLabel}`, bonuses });
    const solder = scaleBonusMap(normalizeCardBonusMap(card?.solderBonuses?.[row.solder], damageType), qty);
    if (row.solder > 0 && solder && Object.keys(solder).length) list.push({ source, cardName: row.name, label: `はんだ+${row.solder}${qtyLabel}`, bonuses: solder });
  }

  function pushConditionalCardEffects(result, row, target, source, damageType, actionCategory = '', formation = null) {
    const card = getCard(row.id);
    (card?.conditionalEffects || []).forEach(effect => {
      const text = getEffectText(effect);
      if (isMaxStackThresholdEffect(text) || isStackMetadataEffect(effect)) return;
      const stackMeta = getCardEffectStackMeta(card, effect, row.star);
      const conditionKey = createConditionEffectKey(source, row, effect, '', target);
      const stackCount = stackMeta
        ? getConditionalEffectStackCount(conditionKey, stackMeta.stackMax, stackMeta.stackDefault)
        : 1;
      const effectDamageType = resolveCardEffectBonusDamageType(effect, damageType);
      const normalizedBaseBonuses = normalizeCardEffectBonuses(effect.bonusesByStar?.[row.star - 1], effectDamageType, text);
      const baseBonuses = scaleEffectBonusMap(
        normalizedBaseBonuses,
        row.qty,
        effect,
        text,
        stackCount
      );
      const maxStackBonuses = stackMeta && stackCount >= stackMeta.stackMax
        ? scaleEffectBonusMap(
            getCardMaxStackBonusMap(card, row.star, damageType),
            row.qty,
            effect,
            text
          )
        : {};
      const bonuses = mergeBonusMaps(baseBonuses, maxStackBonuses);
      const item = {
        source,
        cardId: row.id,
        effectId: effect.id || '',
        effectText: text,
        cardName: row.name,
        ownerLabel: source === '装備遺物' ? '本人' : '',
        label: effect.label || effect.shortLabel || effect.id || '特殊効果',
        duration: effect.duration || '',
        scopeLabel: getArtifactEffectScopeLabel(effect),
        bonuses,
        reason: '',
        conditionKey,
        overlapStackKey: createArtifactEffectOverlapKey(source, row, effect, target),
        overlapCount: isNonStackingSameApostleEffect(effect, text) ? 1 : Math.max(1, Number(row.qty) || 1),
        nonStackingSameEffect: isNonStackingSameEffect(effect, text),
        ...getFdcRuntimeEffectMetadata(effect),
        ...(stackMeta || {})
      };
      if (isSkillChangeEffect(text, effect)) {
        item.reason = effect.description || 'スキル変更系';
        result.skillChanges.push(item);
        return;
      }
      const targetReason = judgeTargetText(text, target, damageType);
      if (!targetReason.matched) {
        item.reason = targetReason.reason;
        pushConditionalEffectCandidate(result, item, false);
        return;
      }
      if (!matchesCardEffectTargetDamageType(effect, damageType, target)) {
        item.reason = `対象外: 攻撃種別=${effect.onlyWhenDmgType}`;
        pushConditionalEffectCandidate(result, item, false, true);
        return;
      }
      const actionMatch = judgeActionCondition(text, actionCategory);
      if (!actionMatch.matched) {
        item.reason = actionMatch.reason;
        pushConditionalEffectCandidate(result, item, false);
        return;
      }
      if (shouldExposeConditionalToggle(text, effect, actionMatch)) {
        item.reason = [targetReason.reason, isFavoriteCardActiveInFormation(card, formation) ? '愛用使徒編成中' : ''].filter(Boolean).join(' / ') || '発動条件あり';
        pushToggleableConditionalEffect(result, item, getConditionalDefaultEnabled(text, effect, actionMatch, card, formation));
        return;
      }
      if (item.bonuses && Object.keys(item.bonuses).length) result.applied.push(item);
    });
  }

  function pushFormationArtifactEffects(result, { target, formation, cards, damageType, actionCategory }) {
    if (!target || !formation?.rows?.length) return;
    getFormationArtifactEffectOwners(formation, cards, target).forEach(ownerRow => {
      const card = getCard(ownerRow.id);
      (card?.conditionalEffects || []).forEach(effect => {
        const text = getEffectText(effect);
        if (isMaxStackThresholdEffect(text) || isStackMetadataEffect(effect)) return;
        const stackMeta = getCardEffectStackMeta(card, effect, ownerRow.star);
        const conditionKey = createConditionEffectKey('編成遺物', ownerRow, effect, ownerRow.ownerId, target);
        const stackCount = stackMeta
          ? getConditionalEffectStackCount(conditionKey, stackMeta.stackMax, stackMeta.stackDefault)
          : 1;
        const effectDamageType = resolveCardEffectBonusDamageType(effect, damageType);
        const normalizedBaseBonuses = normalizeCardEffectBonuses(effect.bonusesByStar?.[ownerRow.star - 1], effectDamageType, text);
        const baseBonuses = scaleEffectBonusMap(
          normalizedBaseBonuses,
          ownerRow.qty,
          effect,
          text,
          stackCount
        );
        const maxStackBonuses = stackMeta && stackCount >= stackMeta.stackMax
          ? scaleEffectBonusMap(
              getCardMaxStackBonusMap(card, ownerRow.star, damageType),
              ownerRow.qty,
              effect,
              text
            )
          : {};
        const bonuses = mergeBonusMaps(baseBonuses, maxStackBonuses);
        if (!bonuses || !Object.keys(bonuses).length) return;
        if (!canFormationArtifactAffectTarget(text)) return;
        const item = {
          source: '編成遺物',
          cardId: ownerRow.id,
          effectId: effect.id || '',
          effectText: text,
          cardName: ownerRow.name,
          label: effect.label || effect.shortLabel || effect.id || '特殊効果',
          duration: effect.duration || '',
          scopeLabel: getArtifactEffectScopeLabel(effect),
          bonuses,
          reason: '',
          ownerLabel: ownerRow.ownerLabel,
          conditionKey,
          overlapStackKey: createArtifactEffectOverlapKey('編成遺物', ownerRow, effect, target),
          overlapCount: isNonStackingSameApostleEffect(effect, text) ? 1 : Math.max(1, Number(ownerRow.qty) || 1),
          nonStackingSameEffect: isNonStackingSameEffect(effect, text),
          ...getFdcRuntimeEffectMetadata(effect),
          ...(stackMeta || {}),
          tags: { source: ['遺物'], target: [ownerRow.position, `第${ownerRow.line}列`].filter(Boolean) }
        };
        if (isSkillChangeEffect(text, effect)) return;
        const targetReason = judgeFormationArtifactTarget(text, target, ownerRow, effect, damageType);
        if (!targetReason.matched) return;
        item.reason = targetReason.reason || '編成条件一致';
        const actionMatch = judgeActionCondition(text, actionCategory);
        if (!actionMatch.matched) {
          item.reason = actionMatch.reason;
          pushConditionalEffectCandidate(result, item, false);
          return;
        }
        if (shouldExposeConditionalToggle(text, effect, actionMatch)) {
          pushToggleableConditionalEffect(result, item, getConditionalDefaultEnabled(text, effect, actionMatch));
          return;
        }
        if (item.bonuses && Object.keys(item.bonuses).length) result.applied.push(item);
      });
    });
  }

  function getFormationArtifactEffectOwners(formation, cards, target) {
    return (formation.rows || []).flatMap((row, rowIndex) =>
      (row.artifacts || []).flatMap((lineArtifacts, lineIndex) => {
        const ownerId = row.apostles?.[lineIndex] || '';
        if (!ownerId || ownerId === target.id) return [];
        const owner = getApostle(ownerId);
        const ownerName = owner?.使徒名 || ownerId;
        return countIds(lineArtifacts || []).map(({ id, qty }) => ({
          ...createCardRow(id, qty, cards[id]),
          ownerId,
          ownerName,
          position: POSITIONS[rowIndex] || '',
          line: lineIndex + 1,
          ownerLabel: `${POSITIONS[rowIndex] || ''}${lineIndex + 1} ${ownerName}`.trim()
        }));
      })
    ).filter(row => getCard(row.id)?.kind === 'artifact');
  }

  function judgeFormationArtifactTarget(text, target, ownerRow, effect, damageType) {
    if (/同列/.test(text) && ownerRow.position !== target.position) {
      return {
        matched: false,
        reason: `対象外: 同列 (${ownerRow.position}${ownerRow.line} -> ${target.position || '-'}${target.line || '-'})`
      };
    }
    if (!matchesCardEffectTargetDamageType(effect, damageType, target)) {
      return { matched: false, reason: `対象外: 攻撃種別=${effect.onlyWhenDmgType}` };
    }
    const targetReason = judgeTargetText(text.replace(/同列/g, ''), target, damageType);
    if (!targetReason.matched) return targetReason;
    return {
      matched: true,
      reason: unique([targetReason.reason, /同列/.test(text) ? `${ownerRow.position}同列` : ''].filter(Boolean)).join(' / ')
    };
  }

  function canFormationArtifactAffectTarget(text) {
    if (/自身|本人|着用者/.test(text) && !/味方|全体|同列|前列|中列|後列/.test(text)) return false;
    return /味方|全体|同列|前列|中列|後列|攻撃役割|防御役割|守備|ガード|支援|補助|サポート|物理攻撃|魔法攻撃/.test(text);
  }

  function isTimedOrManualEffect(text, effect) {
    if (effect.type === 'info') return true;
    return /ウェーブ|開始時|毎に|ごと|(?:低学年|高学年|スキル|通常|普通|基本|強化|アサイド|攻撃).{0,8}使用時|発動時|発動中|命中時|攻撃時|被撃時|被弾時|敵(?:が)?\d+体(?:以上|以下|のみ|の場合)?|クールタイム|CT/.test(text);
  }

  function isUnresolvedCardTriggerEffect(text) {
    return /ランダム効果|赤カード時|黄カード時|青カード時|カード時|味方戦闘不能時|戦闘不能時|死亡時|倒れた時|最大スタック|スタック最大時/.test(text);
  }

  function shouldExposeConditionalToggle(text, effect, actionMatch) {
    if (effect.type === 'info') return true;
    return effect.type === 'toggle' || actionMatch.hasActionCondition || isTimedOrManualEffect(text, effect);
  }

  function getConditionalDefaultEnabled(text, effect, actionMatch, card = null, formation = null) {
    if (isUnresolvedCardTriggerEffect(text)) return false;
    if (effect?.id === 'artifact_dragonlight_sword_e01') return true;
    if (effect.defaultEnabled === true) return true;
    if (isInitialWaveEffect(text)) return true;
    if (isSameLineStartEffect(text)) return true;
    if (isDeterministicCardSpTiming(text, effect)) return true;
    if (isDeterministicNormalAttackSpRecovery(text, effect)) return true;
    if (isFavoriteCardActiveInFormation(card, formation)) return true;
    if (effect.type === 'toggle' && !isTimedOrManualEffect(text, effect)) {
      return actionMatch?.hasActionCondition ? !!actionMatch.matched : true;
    }
    return !!(actionMatch?.hasActionCondition && !isTimedOrManualEffect(text, effect));
  }

  function isDeterministicCardSpTiming(text, effect = null) {
    const body = String(text || '');
    const hasSpBonus = normalizeFdcArray(effect?.bonusesByStar).some(bonuses =>
      ['initialSp', 'initialSpP', 'spRegen', 'spRegenP', 'spRecovery', 'spRecoveryP']
        .some(key => Number(bonuses?.[key]))
    );
    if (!hasSpBonus) return false;
    if (!/戦闘開始時|毎秒|1秒ごと|\d+(?:\.\d+)?秒ごと/.test(body)) return false;
    return !/一定確率|n回ごと|\d+回(?:目|ごと)|攻撃時|攻撃命中時|通常攻撃|普通攻撃|基本攻撃|強化攻撃|被撃時|被弾時|使用時|使用後|発動時|命中時|破壊時|撃破時/.test(body);
  }

  function isDeterministicNormalAttackSpRecovery(text, effect = null) {
    const body = String(text || '');
    const hasSpRecovery = normalizeFdcArray(effect?.bonusesByStar).some(bonuses => (
      Number(bonuses?.spRecovery) || Number(bonuses?.spRecoveryP)
    ));
    if (!hasSpRecovery) return false;
    if (/一定確率|ランダム|n回ごと|\d+回(?:目|ごと)/.test(body)) return false;
    return /(?:通常|普通|基本|強化)攻撃.{0,12}(?:命中時|攻撃時)/.test(body);
  }

  function isInitialWaveEffect(text) {
    return /(?:ウェーブ開始時|1\s*ウェーブ(?:中|目)?)/.test(String(text || ''));
  }

  function isSameLineStartEffect(text) {
    return /同列/.test(String(text || '')) && /戦闘開始時|開始時/.test(String(text || ''));
  }

  function isFavoriteCardActiveInFormation(card, formation) {
    const favoriteName = String(card?.favoriteCharacter || '').trim();
    if (!favoriteName || !formation?.rows?.length) return false;
    const normalizedFavorite = normalizeComparableName(favoriteName);
    return (formation.rows || []).some(row =>
      (row.apostles || []).some(id => {
        const apostle = getApostle(id);
        return [apostle?.使徒名, apostle?.id, id].some(value => normalizeComparableName(value) === normalizedFavorite);
      })
    );
  }

  function normalizeComparableName(value) {
    return String(value || '').trim().replace(/\s+/g, '').toLowerCase();
  }

  function pushToggleableConditionalEffect(result, item, defaultEnabled = false) {
    if (!item.bonuses || !Object.keys(item.bonuses).length) {
      result.conditional.push(item);
      return;
    }
    const control = {
      ...item,
      canToggle: true,
      defaultEnabled: !!defaultEnabled,
      tags: {
        ...(item.tags || {}),
        status: unique([...(item.tags?.status || []), isConditionalEffectEnabled(item.conditionKey, defaultEnabled) ? '手動ON' : '手動OFF'])
      }
    };
    result.conditional.push(control);
    if (!isConditionalEffectEnabled(item.conditionKey, defaultEnabled)) return;
    result.applied.push({
      ...item,
      tags: {
        ...(item.tags || {}),
        status: unique([...(item.tags?.status || []), '手動ON'])
      }
    });
  }

  function pushConditionalEffectCandidate(result, item, defaultEnabled = false, forceDisabled = false) {
    if (forceDisabled && item.conditionKey) delete view.conditionalEffectEnabled[item.conditionKey];
    if (item.bonuses && Object.keys(item.bonuses).length) {
      pushToggleableConditionalEffect(result, item, forceDisabled ? false : defaultEnabled);
      return;
    }
    result.conditional.push(item);
  }

  function isConditionalEffectEnabled(key, defaultEnabled = false) {
    if (!key) return !!defaultEnabled;
    if (Object.prototype.hasOwnProperty.call(view.conditionalEffectEnabled, key)) {
      return !!view.conditionalEffectEnabled[key];
    }
    return !!defaultEnabled;
  }

  function createArtifactEffectOverlapKey(source, row, effect, target = null) {
    return [
      // 所持者や装備枠では分けず、同じカード効果を1つのスタック群にする。
      'artifact-stack',
      row?.id || '',
      row?.star || '',
      row?.solder || '',
      effect?.id || effect?.label || effect?.shortLabel || '',
      target ? createConditionTargetKey(target) : ''
    ].join(':');
  }
  function createConditionEffectKey(source, row, effect, ownerId = '', target = null) {
    return [
      source || '',
      ownerId || row.ownerId || '',
      row.id || '',
      row.star || '',
      row.solder || '',
      effect.id || effect.label || effect.shortLabel || '',
      target ? createConditionTargetKey(target) : ''
    ].join(':');
  }

  function createConditionTargetKey(target) {
    return [
      target.id || '',
      target.position || '',
      target.line || ''
    ].join('@');
  }

  function judgeActionCondition(text, actionCategory = '') {
    const conditions = [];
    const body = String(text || '');
    const category = getFdcSkillBaseCategory(actionCategory);
    const hasLow = /低学年(?:スキル)?(?:使用時|発動時)/.test(body) || /低学年[、,／\s]+高学年(?:スキル)?使用時/.test(body) || /(?:^|\s)低学年スキル(?:$|\s)/.test(body);
    const hasHigh = /高学年(?:スキル)?(?:使用時|発動時)/.test(body) || /低学年[、,／\s]+高学年(?:スキル)?使用時/.test(body) || /(?:^|\s)高学年スキル(?:$|\s)/.test(body);
    if (/状態異常/.test(body)) {
      conditions.push(['状態異常', category === '状態異常']);
    } else if (hasLow || hasHigh) {
      // 「低学年、高学年使用時」はどちらか一方で成立する条件。
      conditions.push(['低学年/高学年スキル', (hasLow && /低学年/.test(category)) || (hasHigh && /高学年/.test(category))]);
    } else if (/アサイド(?:使用時|発動時)/.test(body)) {
      conditions.push(['アサイド', /^A[1-3]$|^アサイド/.test(actionCategory)]);
    } else if (/(?:通常|普通)攻撃(?:使用時|発動時|命中時)/.test(body) || /^(?:通常|普通)攻撃(?:_基本|_強化)?$/.test(body)) {
      conditions.push(['普通攻撃', actionCategory === '基本攻撃' || actionCategory === '強化攻撃']);
    }
    if (/基本攻撃/.test(body)) conditions.push(['基本攻撃', actionCategory === '基本攻撃']);
    if (/強化攻撃/.test(body)) conditions.push(['強化攻撃', actionCategory === '強化攻撃']);
    if (!conditions.length && /スキル攻撃|スキル使用時|スキル発動時|スキル時|スキル.*ダメージ|スキル.*与ダメ|スキル与ダメ/.test(body)) {
      conditions.push(['スキル', isFdcSkillActionCategory(actionCategory)]);
    }
    const failed = conditions.filter(([, matched]) => !matched);
    return {
      hasActionCondition: conditions.length > 0,
      matched: failed.length === 0,
      reason: failed.length ? `行動条件未選択: ${failed.map(([label]) => label).join(' / ')}` : conditions.map(([label]) => `${label}条件一致`).join(' / ')
    };
  }

  function resolveCardEffectBonusDamageType(effect, damageType) {
    if (!isCardAttackPowerStatEffect(effect)) return damageType;
    const only = String(effect?.onlyWhenDmgType || '').toLowerCase();
    if (/mag|magic|魔法/.test(only)) return 'magic';
    if (/phys|physical|物理/.test(only)) return 'physical';
    return damageType;
  }

  function matchesCardEffectTargetDamageType(effect, damageType, target = null) {
    // 攻撃力そのものを上げる効果は、選択中の攻撃の属性ではなく、
    // 効果を受ける使徒本来の攻撃タイプで対象を判定する。
    const targetDamageType = isCardAttackPowerStatEffect(effect)
      ? resolveDamageType('auto', target)
      : damageType;
    return matchesEffectDamageType(effect, targetDamageType, target);
  }

  function isCardAttackPowerStatEffect(effect = null) {
    const text = [effect?.label, effect?.shortLabel, effect?.description, ...(effect?.descriptionByStar || [])]
      .filter(Boolean)
      .join(' ');
    return /(?:物理|魔法)?攻撃力(?:増加|減少|上昇|低下)/.test(text)
      && !/(?:ダメージ|与ダメ|被ダメ|敵防御)/.test(text);
  }
  function matchesEffectDamageType(effect, damageType, target = null) {
    const only = String(effect?.onlyWhenDmgType || '').toLowerCase();
    if (!only) return true;
    const resolvedType = damageType === 'unknown' ? resolveDamageType('auto', target) : damageType;
    if (/mag|magic|魔法/.test(only)) return resolvedType === 'magic';
    if (/phys|physical|物理/.test(only)) return resolvedType === 'physical';
    return true;
  }

  function judgeTargetText(text, target, damageType = '') {
    const checks = [];
    const resolvedType = damageType || resolveDamageType('auto', target);
    const namedTargetState = getNamedApostleTargetState(text, target);
    if (namedTargetState.hasCondition) {
      checks.push(['対象使徒', namedTargetState.matched, namedTargetState.names.join('・')]);
    }
    if (/前列|前衛/.test(text)) checks.push(['隊列', target.position === '前列', '前列']);
    if (/中列/.test(text)) checks.push(['隊列', target.position === '中列', '中列']);
    if (/後列|後衛/.test(text)) checks.push(['隊列', target.position === '後列', '後列']);
    if (/アタッカー|攻撃ロール|攻撃役割/.test(text)) checks.push(['役割', normalizeRole(target.role) === '攻撃', '攻撃']);
    if (/ガード|守備|防御ロール|防御役割/.test(text)) checks.push(['役割', normalizeRole(target.role) === '守備', '守備']);
    if (/サポート|支援|補助/.test(text)) checks.push(['役割', normalizeRole(target.role) === '支援', '支援']);
    if (/魔法攻撃/.test(text)) checks.push(['攻撃種別', resolvedType === 'magic', '魔法']);
    if (/物理攻撃/.test(text)) checks.push(['攻撃種別', resolvedType === 'physical', '物理']);
    ['純粋', '冷静', '狂気', '活発', '憂鬱'].forEach(personality => {
      const allyPersonalityPattern = new RegExp(`${personality}(?:性格)?(?:の)?味方|味方[\\/／ ]?${personality}`);
      if (allyPersonalityPattern.test(text)) {
        checks.push(['性格', target.personality === personality, personality]);
      }
    });
    const structuredPersonality = String(text || '').match(/対象性格\s*[:=]?\s*(純粋|冷静|狂気|活発|憂鬱)/)?.[1] || '';
    if (structuredPersonality) {
      checks.push(['性格', normalizePersonalityName(target.personality) === structuredPersonality, structuredPersonality]);
    }
    const failed = checks.filter(([, matched]) => !matched);
    return {
      matched: failed.length === 0,
      reason: failed.length ? `対象外: ${failed.map(([type, , value]) => `${type}=${value}`).join(' / ')}` : checks.map(([type, , value]) => `${type}=${value}`).join(' / ')
    };
  }

  function getNamedApostleTargetState(text, target) {
    const match = String(text || '').match(/対象使徒\s*[（(]([^）)]+)[）)]/);
    if (!match) return { hasCondition: false, matched: true, names: [] };
    const names = match[1]
      .split(/[、,，／/・\s]+/)
      .map(name => name.trim())
      .filter(Boolean);
    const targetNames = [target?.name, target?.id]
      .map(normalizeComparableName)
      .filter(Boolean);
    const matched = names.some(name => targetNames.includes(normalizeComparableName(name)));
    return { hasCondition: true, matched, names };
  }

  function pushSynergyEffects(list, formation, target, state = {}) {
    const counts = collectSynergyCounts(formation, state);
    const personalityEffect = findSynergyEffect(typeof PERSONALITY_SYNERGIES === 'undefined' ? [] : PERSONALITY_SYNERGIES, target.personality, counts.personality[target.personality]);
    const raceEffect = findSynergyEffect(typeof RACE_SYNERGIES === 'undefined' ? [] : RACE_SYNERGIES, target.race, counts.race[target.race]);
    if (personalityEffect) list.push({ source: '性格シナジー', label: target.personality, bonuses: normalizeSynergyEffect(personalityEffect) });
    if (raceEffect) list.push({ source: '種族シナジー', label: target.race, bonuses: normalizeSynergyEffect(raceEffect) });
  }

  function normalizeSynergyEffect(effect = {}) {
    if (!effect) return {};
    const normalized = { ...effect };
    if (effect.critRateTakenDownP) {
      normalized.critResP = (Number(normalized.critResP) || 0) + Number(effect.critRateTakenDownP);
      delete normalized.critRateTakenDownP;
    }
    if (effect.critDmgTakenDownP) {
      normalized.critDmgResP = (Number(normalized.critDmgResP) || 0) + Number(effect.critDmgTakenDownP);
      delete normalized.critDmgTakenDownP;
    }
    if (effect.damageTakenDownP) {
      normalized.takenDmgP = (Number(normalized.takenDmgP) || 0) + Number(effect.damageTakenDownP);
      delete normalized.damageTakenDownP;
    }
    return Object.fromEntries(Object.entries(normalized).filter(([, value]) => Number(value)));
  }

  function pushFavoriteSkillEffects(list, target, formation, cards) {
    const apostle = getApostleSkillData(target);
    const levels = apostle?.favoriteCard?.levels || {};
    if (!Object.keys(levels).length) return;
    const allRows = [
      ...countIds(target.artifactIds).map(({ id, qty }) => ({ ...createCardRow(id, qty, cards[id]), cardSource: '装備遺物' })),
      ...countIds(formation.spells).map(({ id, qty }) => ({ ...createCardRow(id, qty, cards[id]), cardSource: 'スペル' }))
    ];
    allRows.forEach(row => {
      const card = getCard(row.id);
      if (!card?.signature || String(card.favoriteCharacter || '') !== target.name) return;
      Object.entries(levels).forEach(([level, entries]) => {
        if (row.star < Number(level)) return;
        normalizeArray(entries).forEach(entry => {
          list.push({
            source: '愛用スキル',
            cardSource: row.cardSource,
            cardName: row.name,
            label: `愛用Lv${level} ${entry.skillName || entry.skillType || ''}`,
            reason: entry.description || summarizeSkillEffects(entry.effects || entry.stats)
          });
        });
      });
    });
  }

  function summarizeEffects(rows) {
    return summarizeEffectBonuses(rows);
  }

  function summarizeEffectBonuses(rows, includeKey = null) {
    const grouped = new Map();
    const plainRows = [];
    (rows || []).forEach(row => {
      if (row?.overlapStackKey) {
        if (!grouped.has(row.overlapStackKey)) grouped.set(row.overlapStackKey, []);
        grouped.get(row.overlapStackKey).push(row);
      } else {
        plainRows.push(row);
      }
    });
    const summary = summarizeRawEffectBonuses(plainRows, includeKey);
    grouped.forEach((groupRows, key) => {
      const effectiveRows = getEffectiveArtifactEffectRows(groupRows);
      const overlapMax = effectiveRows.reduce((total, row) => total + Math.max(1, Number(row.overlapCount) || 1), 0);
      const overlapCount = getConditionalEffectStackCount(key, overlapMax, overlapMax);
      const raw = summarizeRawEffectBonuses(effectiveRows, includeKey);
      const scaled = overlapCount === overlapMax ? raw : scaleBonusMapByFactor(raw, overlapCount / overlapMax);
      Object.entries(scaled).forEach(([bonusKey, value]) => {
        summary[bonusKey] = (summary[bonusKey] || 0) + (Number(value) || 0);
      });
    });
    return summary;
  }

  // 同効果非スタックは所持者や装備枠をまたいで一度だけ計上する。
  // 同一使徒非スタックは item.overlapCount を1にしているため、ここでは除外しない。
  function getEffectiveArtifactEffectRows(rows) {
    const list = rows || [];
    return list.some(row => row?.nonStackingSameEffect) ? list.slice(0, 1) : list;
  }
  function summarizeRawEffectBonuses(rows, includeKey = null) {
    return (rows || []).reduce((sum, row) => {
      Object.entries(row?.bonuses || {}).forEach(([key, value]) => {
        if (includeKey && !includeKey(key)) return;
        sum[key] = (sum[key] || 0) + (Number(value) || 0);
      });
      return sum;
    }, {});
  }
  function getActiveAttackBonus(summary, damageType) {
    if (damageType === 'magic') return (Number(summary.magicAtkP) || 0) + (Number(summary.atkP) || 0);
    if (damageType === 'physical') return (Number(summary.physicalAtkP) || 0) + (Number(summary.atkP) || 0);
    return Number(summary.atkP) || 0;
  }

  function getActiveAddBonus(summary, actionCategory = '') {
    let total = Number(summary.addP) || 0;
    if (actionCategory === '基本攻撃' || actionCategory === '強化攻撃') total += Number(summary.normalAttackAddP) || 0;
    if (actionCategory === '基本攻撃') total += Number(summary.basicAddP) || 0;
    if (actionCategory === '強化攻撃') total += Number(summary.enhancedAddP) || 0;
    if (isFdcSkillActionCategory(actionCategory)) total += Number(summary.skillAddP) || 0;
    return total;
  }

  function normalizeAttackBonus(bonuses, damageType) {
    if (!bonuses) return null;
    const next = { ...bonuses };
    if (next.atkP != null) {
      if (damageType === 'physical') {
        next.physicalAtkP = next.atkP;
        delete next.atkP;
      } else if (damageType === 'magic') {
        next.magicAtkP = next.atkP;
        delete next.atkP;
      }
    }
    return next;
  }

  function normalizeCardEffectBonuses(bonuses, damageType, text = '') {
    const normalized = normalizeCardBonusMap(bonuses, damageType);
    normalizeCriticalBonusKeys(normalized, text);
    if (!normalized?.addP) return normalized;
    const value = normalized.addP;
    if (/強化攻撃/.test(text)) {
      delete normalized.addP;
      normalized.enhancedAddP = (normalized.enhancedAddP || 0) + value;
    } else if (/基本攻撃/.test(text)) {
      delete normalized.addP;
      normalized.basicAddP = (normalized.basicAddP || 0) + value;
    } else if (/通常攻撃|普通攻撃/.test(text)) {
      delete normalized.addP;
      normalized.normalAttackAddP = (normalized.normalAttackAddP || 0) + value;
    } else if (/スキル攻撃|スキル.*ダメージ|スキル.*与ダメ|スキル与ダメ|スキル時/.test(text)) {
      delete normalized.addP;
      normalized.skillAddP = (normalized.skillAddP || 0) + value;
    }
    return normalized;
  }

  function normalizeCardBonusMap(bonuses, damageType) {
    const normalized = normalizeAttackBonus(bonuses, damageType);
    if (!normalized) return normalized;
    if (normalized.critDmgP != null) {
      normalized.critDmgAddP = (Number(normalized.critDmgAddP) || 0) + Number(normalized.critDmgP || 0);
      delete normalized.critDmgP;
    }
    if (normalized.critResP != null) {
      normalized.critResAddP = (Number(normalized.critResAddP) || 0) + Number(normalized.critResP || 0);
      delete normalized.critResP;
    }
    if (normalized.critDmgResP != null) {
      normalized.critDmgResAddP = (Number(normalized.critDmgResAddP) || 0) + Number(normalized.critDmgResP || 0);
      delete normalized.critDmgResP;
    }
    return normalized;
  }

  function normalizeCriticalBonusKeys(bonuses, text = '') {
    if (!bonuses) return bonuses;
    const normalizedText = String(text || '');
    if (bonuses.critRateP != null && /会心(?!率|DMG|ダメージ|抵抗)/.test(normalizedText)) {
      bonuses.critP = (Number(bonuses.critP) || 0) + Number(bonuses.critRateP || 0);
      delete bonuses.critRateP;
    }
    if (bonuses.critDmgP != null && /会心(?:ダメージ量|DMG量)/.test(normalizedText)) {
      bonuses.critDmgAddP = (Number(bonuses.critDmgAddP) || 0) + Number(bonuses.critDmgP || 0);
      delete bonuses.critDmgP;
    }
    return bonuses;
  }

  function isStackMetadataEffect(effect) {
    const starBonuses = effect?.bonusesByStar?.[0] || effect?.bonuses || {};
    const keys = Object.keys(starBonuses);
    return keys.length > 0 && keys.every(key => key === 'maxStack' || key === 'stackCount');
  }

  function isMaxStackThresholdEffect(text) {
    return /(?:最大スタック時|スタック最大時)/.test(String(text || ''));
  }

  function mergeBonusMaps(...maps) {
    const merged = {};
    maps.forEach(map => {
      Object.entries(map || {}).forEach(([key, value]) => {
        const numeric = Number(value) || 0;
        if (numeric) merged[key] = (merged[key] || 0) + numeric;
      });
    });
    return merged;
  }

  function getCardMaxStackBonusMap(card, star = 1, damageType = 'unknown') {
    return normalizeArray(card?.conditionalEffects)
      .filter(candidate => isMaxStackThresholdEffect(getEffectText(candidate)))
      .reduce((sum, candidate) => mergeBonusMaps(
        sum,
        normalizeCardEffectBonuses(
          candidate.bonusesByStar?.[Math.max(0, Number(star) - 1)],
          damageType,
          getEffectText(candidate)
        )
      ), {});
  }
  function getCardEffectStackMeta(card, effect, star = 1) {
    const ownBonus = effect?.bonusesByStar?.[Math.max(0, Number(star) - 1)] || {};
    const ownMax = Number(ownBonus.maxStack);
    const ownCount = Number(ownBonus.stackCount);
    const text = getEffectText(effect);
    // 「最大スタック時」は到達判定用の効果であり、スタック数入力の対象ではない。
    if (isMaxStackThresholdEffect(text)) return null;
    const siblingMax = normalizeArray(card?.conditionalEffects).reduce((max, candidate) => {
      const value = Number(candidate?.bonusesByStar?.[Math.max(0, Number(star) - 1)]?.maxStack);
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0);
    // カード特殊効果では最大スタック数を別行で定義する。効果本文に「スタック」が
    // 含まれない場合（ブランセの花束など）も、そのカードの実効果に適用する。
    const hasExplicitStack = Number.isFinite(ownCount) || /スタック|stack/i.test(text) || siblingMax > 1;
    if (!hasExplicitStack) return null;
    const maxStack = Math.max(1, ownMax || siblingMax || 1);
    if (maxStack <= 1) return null;
    return {
      stackMax: maxStack,
      stackDefault: clamp(Number.isFinite(ownCount) ? ownCount : 1, 1, maxStack)
    };
  }

  function getConditionalEffectStackCount(key, maxStack = 1, defaultCount = 0) {
    const max = Math.max(1, Number(maxStack) || 1);
    const saved = Number(view.conditionalEffectStackCounts?.[key]);
    const fallback = Number.isFinite(Number(defaultCount)) ? Number(defaultCount) : 1;
    return clamp(Number.isFinite(saved) ? saved : fallback, 1, max);
  }

  function scaleEffectBonusMap(bonuses, qty = 1, effect = null, text = '', stackCount = 1) {
    // 「同一使徒非スタック」は同じ使徒が持つ複数枚だけを抑制する。
    // 「同効果非スタック」は編成全体での集約時に処理する。
    const cardMultiplier = isNonStackingSameApostleEffect(effect, text) ? 1 : qty;
    const stackMultiplier = Math.max(1, Number(stackCount) || 1);
    return scaleBonusMap(bonuses, cardMultiplier * stackMultiplier);
  }

  function scaleBonusMap(bonuses, qty = 1) {
    if (!bonuses) return bonuses;
    const multiplier = Math.max(1, Number(qty) || 1);
    if (multiplier === 1) return bonuses;
    return Object.fromEntries(Object.entries(bonuses).map(([key, value]) => [key, (Number(value) || 0) * multiplier]));
  }

  function scaleBonusMapByFactor(bonuses, factor = 1) {
    if (!bonuses) return bonuses;
    const multiplier = Math.max(0, Number(factor) || 0);
    if (multiplier === 1) return bonuses;
    return Object.fromEntries(Object.entries(bonuses).map(([key, value]) => [key, (Number(value) || 0) * multiplier]));
  }
  function isNonStackingSameApostleEffect(effect = null, text = '') {
    if (effect?.nonStackingSameApostle === true) return true;
    // 旧生成データは種別を持たないため、従来どおり同一使徒の複数枚にだけ適用する。
    if (effect?.nonStacking === true && effect?.nonStackingSameEffect !== true) return true;
    return /同一使徒.*(?:スタックしない|重複(?:しない|不可|適用されません|適用されない))/.test(String(text || getEffectText(effect)));
  }

  function isNonStackingSameEffect(effect = null, text = '') {
    if (effect?.nonStackingSameEffect === true) return true;
    return /同効果.*(?:スタックしない|重複(?:しない|不可|適用されません|適用されない))/.test(String(text || getEffectText(effect)));
  }

  function readMemberStats(apostleState = {}, basic = null, gradeOverride = 'saved', statMode = 'current') {
    const snapshot = getGradeAdjustedSnapshot(apostleState, basic, gradeOverride, statMode);
    const raw = snapshot?.stats
      || apostleState.finalStats
      || apostleState.stats
      || apostleState.totals
      || apostleState.calculatedStats
      || {};
    return applyExtraCrayonToStats({
      hp: readStatValue(raw, ['hp', 'HP']),
      physicalAtk: readStatValue(raw, ['physicalAtk', 'patk', '物理攻撃', '物理攻撃力']),
      magicAtk: readStatValue(raw, ['magicAtk', 'matk', '魔法攻撃', '魔法攻撃力']),
      physicalDef: readStatValue(raw, ['physicalDef', 'pdef', '物理防御', '物理防御力']),
      magicDef: readStatValue(raw, ['magicDef', 'mdef', '魔法防御', '魔法防御力']),
      crit: readStatValue(raw, ['crit', '会心']),
      critDmg: readStatValue(raw, ['critDmg', '会心DMG', '会心ダメージ']),
      critRes: readStatValue(raw, ['critRes', '会心抵抗']),
      critDmgRes: readStatValue(raw, ['critDmgRes', '会心DMG抵抗']),
      spRegen: readStatValue(raw, ['spRegen', '毎秒SP回復量', '毎秒SP回復']),
      combatPower: readStatValue(raw, ['combatPower', '戦闘力'])
    }, snapshot);
  }

  function applyExtraCrayonToStats(stats = {}, snapshot = null) {
    const rates = getExtraCrayonRates();
    if (!Object.values(rates).some(value => Number(value))) return stats;
    const applyRate = (value, rate, internalKey = '') => {
      const finalValue = Number(value || 0);
      const percent = Number(rate) || 0;
      if (!percent) return finalValue;
      const existingGlobalIncrease = Number(snapshot?.breakdown?.globalPercent?.[internalKey]) || 0;
      const additiveBase = Math.max(0, finalValue - existingGlobalIncrease);
      if (snapshot?.breakdown?.globalPercent) return finalValue + Math.floor(additiveBase * percent / 100);
      return finalValue * (1 + percent / 100);
    };
    return {
      ...stats,
      hp: applyRate(stats.hp, rates.hpP, 'hp'),
      physicalAtk: applyRate(stats.physicalAtk, rates.atkP, 'patk'),
      magicAtk: applyRate(stats.magicAtk, rates.atkP, 'matk'),
      physicalDef: applyRate(stats.physicalDef, rates.defP, 'pdef'),
      magicDef: applyRate(stats.magicDef, rates.defP, 'mdef'),
      crit: applyRate(stats.crit, rates.critP, 'crit'),
      critDmg: applyRate(stats.critDmg, rates.critDmgP, 'critDmg'),
      critRes: applyRate(stats.critRes, rates.critResP, 'critRes'),
      critDmgRes: applyRate(stats.critDmgRes, rates.critDmgResP, 'critDmgRes')
    };
  }

  function getExtraCrayonRates() {
    if (view.effectSources.globalStats === false) return {};
    return readExtraCrayonInputs();
  }

  function readExtraCrayonInputs() {
    return {
      hpP: readNumber(el.inputs.extraCrayonHpP),
      atkP: readNumber(el.inputs.extraCrayonAtkP),
      defP: readNumber(el.inputs.extraCrayonDefP),
      critP: readNumber(el.inputs.extraCrayonCritP),
      critDmgP: readNumber(el.inputs.extraCrayonCritDmgP),
      critResP: readNumber(el.inputs.extraCrayonCritResP),
      critDmgResP: readNumber(el.inputs.extraCrayonCritDmgResP)
    };
  }

  function writeExtraCrayonInputs(values = {}) {
    const pairs = [
      ['extraCrayonHpP', values.hpP],
      ['extraCrayonAtkP', values.atkP],
      ['extraCrayonDefP', values.defP],
      ['extraCrayonCritP', values.critP],
      ['extraCrayonCritDmgP', values.critDmgP],
      ['extraCrayonCritResP', values.critResP],
      ['extraCrayonCritDmgResP', values.critDmgResP]
    ];
    pairs.forEach(([key, value]) => {
      if (el.inputs[key]) el.inputs[key].value = Number.isFinite(Number(value)) ? String(Number(value)) : '0';
    });
  }

  function isExtraCrayonInput(input) {
    return [
      el.inputs.extraCrayonHpP,
      el.inputs.extraCrayonAtkP,
      el.inputs.extraCrayonDefP,
      el.inputs.extraCrayonCritP,
      el.inputs.extraCrayonCritDmgP,
      el.inputs.extraCrayonCritResP,
      el.inputs.extraCrayonCritDmgResP
    ].includes(input);
  }

  function getGradeAdjustedSnapshot(apostleState = {}, basic = null, gradeOverride = 'saved', statMode = 'current') {
    const mode = statMode === 'planned' ? 'planned' : 'current';
    let snapshot = mode === 'planned'
      ? apostleState.statSnapshots?.planned || apostleState.statSnapshots?.current || null
      : apostleState.statSnapshots?.current || null;
    if (
      !snapshot
      && basic
      && typeof TRICKCAL_SHARED_STAT_ENGINE !== 'undefined'
      && typeof TRICKCAL_SHARED_STAT_ENGINE.createInitialSnapshot === 'function'
    ) {
      snapshot = TRICKCAL_SHARED_STAT_ENGINE.createInitialSnapshot(
        TRICKCAL_STAT_DATA,
        basic,
        apostleState
      );
    }
    if (gradeOverride === 'saved' || !basic || typeof TRICKCAL_SHARED_STAT_ENGINE === 'undefined') return snapshot;
    return TRICKCAL_SHARED_STAT_ENGINE.applyGradeOverrideToSnapshot(
      TRICKCAL_STAT_DATA,
      basic,
      apostleState,
      { grade: Number(gradeOverride) || 1, snapshot, mode, kind: 'damageGradeOverride' }
    );
  }

  function getDisplayGrade(apostleState = {}) {
    const gradeOverride = getEffectiveGradeOverride();
    if (gradeOverride !== 'saved') return Number(gradeOverride) || 1;
    return Number(apostleState.grade) || 1;
  }

  function formatGradeLabel(member) {
    const grade = Number(member?.grade) || 1;
    return getEffectiveGradeOverride() === 'saved' ? `学年:保存値(${grade})` : `${grade}年生`;
  }

  function formatStatModeLabel(member = null) {
    if (view.statMode !== 'planned') return '現在';
    const hasPlan = !!member?.hasPlannedSnapshot;
    return hasPlan ? '予定' : '予定なし→現在';
  }

  function createCurrentPlannedDiffRows(context) {
    if (view.statMode !== 'planned') return [];
    const target = context.target;
    if (!target || !target.hasPlannedSnapshot) return target ? [['状態', '予定なし']] : [];
    const state = context.state?.apostles?.[target.id] || {};
    const current = readMemberStats(state, getApostle(target.id), getEffectiveGradeOverride(), 'current');
    const planned = readMemberStats(state, getApostle(target.id), getEffectiveGradeOverride(), 'planned');
    const attackKey = context.damageType === 'magic' ? 'magicAtk' : 'physicalAtk';
    const defenseKey = context.damageType === 'magic' ? 'magicDef' : 'physicalDef';
    return [
      ['HP', planned.hp - current.hp],
      ['攻', planned[attackKey] - current[attackKey]],
      ['防', planned[defenseKey] - current[defenseKey]],
      ['会', planned.crit - current.crit],
      ['会心DMG', planned.critDmg - current.critDmg],
      ['会心抵抗', planned.critRes - current.critRes],
      ['会心DMG抵抗', planned.critDmgRes - current.critDmgRes]
    ]
      .filter(([, value]) => Number(value))
      .map(([label, value]) => [label, formatSignedNumber(value)]);
  }

  function createCurrentPlannedDamageRows(context, plannedResult) {
    if (view.statMode !== 'planned' || !context.target?.hasPlannedSnapshot) return [];
    const currentResult = calculateDamageWithStatMode(context, 'current');
    if (!currentResult) return [];
    const plannedExpected = Number(plannedResult?.expected) || 0;
    const currentExpected = Number(currentResult.expected) || 0;
    const diff = plannedExpected - currentExpected;
    const ratio = currentExpected ? (plannedExpected / currentExpected - 1) * 100 : 0;
    return [
      ['現在期待値', formatNumber(currentExpected)],
      ['予定期待値', formatNumber(plannedExpected)],
      ['差分', formatSignedNumber(Math.round(diff))],
      ['上昇率', `${ratio > 0 ? '+' : ''}${ratio.toFixed(2)}%`]
    ];
  }

  function createPinnedComparisonDamageRows(baselineResult = {}, currentResult = {}) {
    const baselineExpected = Number(baselineResult.expected) || 0;
    const currentExpected = Number(currentResult.expected) || 0;
    const diff = currentExpected - baselineExpected;
    const ratio = baselineExpected ? diff / baselineExpected * 100 : currentExpected ? Number.POSITIVE_INFINITY : 0;
    return [
      ['変更前の期待値', formatNumber(baselineExpected)],
      ['現在期待値', formatNumber(currentExpected)],
      ['差分', formatSignedNumber(Math.round(diff))],
      ['変化率', Number.isFinite(ratio) ? `${ratio > 0 ? '+' : ''}${ratio.toFixed(2)}%` : '+∞%']
    ];
  }

  function createPinnedComparisonConditionRows(context, session) {
    const baseline = session?.baseline?.scenario || {};
    const currentScenario = captureCombatScenario(context);
    const baselineBoard = baseline.characterState?.boardState || session?.baseline?.dpsSnapshot?.boardState || {};
    const currentBoard = currentScenario.characterState?.boardState || {};
    const rows = [
      ['比較元', formatPinnedComparisonSource(baseline)],
      ['比較範囲', formatPinnedComparisonScopes(baseline)],
      ['変更前の使徒', baseline.actors?.self?.name || baseline.actors?.self?.id || '-'],
      ['現在使徒', currentScenario.actors?.self?.name || currentScenario.actors?.self?.id || '-'],
      ['変更前の行動', session?.evaluationPolicy?.singleAction === 'fixedBaselineAction'
        ? baseline.battleConditions?.actionCategory || '-'
        : `${currentScenario.battleConditions?.actionCategory || '-'}（現在選択に追従）`],
      ['現在行動', currentScenario.battleConditions?.actionCategory || '-'],
      ['変更前のボード', formatBoardComparisonMode(baselineBoard)],
      ['現在のボード', formatBoardComparisonMode(currentBoard)],
      ['変更前のボード反映値', formatBoardComparisonStats(baselineBoard)],
      ['現在のボード反映値', formatBoardComparisonStats(currentBoard)],
      ['変更前のスキルLv', formatSkillLevelSummary(session?.baseline?.dpsSnapshot?.skillLevels)],
      ['比較データ指紋', baseline.sourceMeta?.fingerprint || '-']
    ];
    return rows;
  }

  function createPinnedComparisonDiffGroups(context, session) {
    const baseline = session?.baseline?.scenario || {};
    const current = captureCombatScenario(context);
    const formationVisual = createPinnedComparisonFormationVisual(baseline, current);
    const groups = [
      {
        scope: 'characterState',
        title: 'ステータス差分',
        rows: createPinnedComparisonStatDiffRows(context, baseline, current)
      },
      {
        scope: 'characterState',
        title: '使徒育成差分',
        rows: createPinnedComparisonApostleDiffRows(context, baseline, current, session)
      },
      {
        scope: 'formationState',
        title: '編成差分',
        rows: createPinnedComparisonFormationDiffRows(baseline, current),
        className: formationVisual ? 'fdc-comparison-formation-group' : '',
        content: formationVisual
      },
      {
        scope: 'cardState',
        title: 'カード育成差分',
        rows: createPinnedComparisonCardDiffRows(baseline, current)
      },
      {
        scope: '',
        title: '現在行動の効果差分',
        rows: createPinnedComparisonEffectDiffRows(context, session)
      }
    ];
    return groups
      .filter(group => !group.scope || isPinnedComparisonScopeIncluded(baseline, group.scope))
      .map(group => ({
        title: group.title,
        rows: group.rows,
        className: group.className || '',
        content: group.content || ''
      }));
  }

  function isPinnedComparisonScopeIncluded(scenario = {}, scope = '') {
    const scopes = scenario.sourceMeta?.comparisonScopes;
    return !Array.isArray(scopes) || !scopes.length || scopes.includes(scope);
  }

  function createPinnedComparisonStatDiffRows(context, baseline = {}, current = {}) {
    const before = baseline.characterState?.boardState?.selectedStats || {};
    const after = current.characterState?.boardState?.selectedStats || context.target?.stats || {};
    const attackKey = context.damageType === 'magic' ? 'magicAtk' : 'physicalAtk';
    const defenseKey = context.damageType === 'magic' ? 'magicDef' : 'physicalDef';
    return [
      ['HP', 'hp'],
      [context.damageType === 'magic' ? '魔法攻撃力' : '物理攻撃力', attackKey],
      [context.damageType === 'magic' ? '魔法防御力' : '物理防御力', defenseKey],
      ['会心', 'crit'],
      ['会心DMG', 'critDmg'],
      ['会心抵抗', 'critRes'],
      ['会心DMG抵抗', 'critDmgRes']
    ].map(([label, key]) => createNumericComparisonRow(label, before[key], after[key]))
      .filter(Boolean);
  }

  function createNumericComparisonRow(label, beforeValue, afterValue) {
    const before = Number(beforeValue);
    const after = Number(afterValue);
    if (!Number.isFinite(before) || !Number.isFinite(after) || Math.abs(after - before) < 0.0001) return null;
    const diff = after - before;
    return {
      label,
      value: `${formatNumber(Math.round(before))} → ${formatNumber(Math.round(after))}（${formatSignedNumber(Math.round(diff))}）`,
      className: diff > 0 ? 'is-comparison-up' : 'is-comparison-down'
    };
  }

  function createPinnedComparisonApostleDiffRows(context, baseline = {}, current = {}, session = null) {
    const targetId = context.target?.id || current.actors?.self?.id || baseline.actors?.self?.id || '';
    const before = baseline.characterState?.apostles?.[targetId] || {};
    const after = current.characterState?.apostles?.[targetId] || {};
    const rows = [];
    const add = (label, left, right, formatter = formatPlainNumber) => {
      if (JSON.stringify(left ?? null) === JSON.stringify(right ?? null)) return;
      rows.push({ label, value: `${formatter(left)} → ${formatter(right)}`, className: 'is-comparison-change' });
    };
    add('★', Number(before.star) || 1, Number(after.star) || 1);
    add('Lv', Number(before.level) || 1, Number(after.level) || 1);
    add('Rank', Number(before.rank) || 1, Number(after.rank) || 1);
    add('学年', Number(before.grade) || 1, Number(after.grade) || 1);
    add('好感度', Number(before.bond) || 1, Number(after.bond) || 1);
    const beforeLevels = session?.baseline?.dpsSnapshot?.skillLevels || {
      low: Number(before.skillLevels?.low) || 1,
      high: Number(before.skillLevels?.high) || 1,
      passive: Number(before.skillLevels?.passive) || 1,
      asideRank: Number(before.asideRank) || 0,
      asideLevel: Number(before.asideLevel) || 0
    };
    const afterLevels = context.target ? getFdcEffectiveSkillLevels(context.target) : {
      low: Number(after.skillLevels?.low) || 1,
      high: Number(after.skillLevels?.high) || 1,
      passive: Number(after.skillLevels?.passive) || 1,
      asideRank: Number(after.asideRank) || 0,
      asideLevel: Number(after.asideLevel) || 0
    };
    add('アサイド', Number(beforeLevels.asideRank) || 0, Number(afterLevels.asideRank) || 0, value => Number(value) ? `A${Number(value)}` : '未発現');
    add('アサイドLv', Number(beforeLevels.asideLevel) || 0, Number(afterLevels.asideLevel) || 0, value => Number(value) ? `Lv${Number(value)}` : '-');
    add('低学年SLv', Number(beforeLevels.low) || 1, Number(afterLevels.low) || 1);
    add('高学年SLv', Number(beforeLevels.high) || 1, Number(afterLevels.high) || 1);
    add('パッシブSLv', Number(beforeLevels.passive) || 1, Number(afterLevels.passive) || 1);
    add('フォロー', !!before.follow, !!after.follow, value => value ? 'ON' : 'OFF');
    const equipmentKeys = unique([...Object.keys(before.equipment || {}), ...Object.keys(after.equipment || {})]);
    equipmentKeys.forEach(key => {
      const left = normalizeComparisonEquipment(before.equipment?.[key]);
      const right = normalizeComparisonEquipment(after.equipment?.[key]);
      if (left.enabled === right.enabled && left.enhance === right.enhance) return;
      rows.push({
        label: `装備 ${formatComparisonEquipmentLabel(key)}`,
        value: `${formatComparisonEquipment(left)} → ${formatComparisonEquipment(right)}`,
        className: 'is-comparison-change'
      });
    });
    const boardMode = baseline.characterState?.boardState?.selectedMode === 'planned' ? 'plannedBoards' : 'boards';
    const beforeBoardCount = countComparisonBoardTiles(before[boardMode]);
    const afterBoardCount = countComparisonBoardTiles(after[boardMode]);
    if (beforeBoardCount !== afterBoardCount) {
      rows.push({ label: 'ボード解放マス', value: `${beforeBoardCount} → ${afterBoardCount}`, className: 'is-comparison-change' });
    }
    return rows;
  }

  function normalizeComparisonEquipment(value = {}) {
    return { enabled: !!value?.enabled, enhance: Math.max(0, Number(value?.enhance) || 0) };
  }

  function formatComparisonEquipment(value = {}) {
    return value.enabled ? `+${value.enhance}` : 'なし';
  }

  function formatComparisonEquipmentLabel(key = '') {
    const labels = { HP: 'HP', 物理攻撃: '物攻', 魔法攻撃: '魔攻', 物理防御: '物防', 魔法防御: '魔防', 会心: '会心', 会心抵抗: '抵抗' };
    return labels[key] || key || '不明';
  }

  function countComparisonBoardTiles(boards = {}) {
    return Object.values(boards || {}).reduce((sum, board) => (
      sum + Object.values(board?.filled || {}).filter(Boolean).length
    ), 0);
  }

  function createPinnedComparisonFormationDiffRows(baseline = {}, current = {}) {
    const before = normalizeFormation(baseline.formationState?.formation || {});
    const after = normalizeFormation(current.formationState?.formation || {});
    const rows = [];
    addTextComparisonRow(rows, '編成使徒', formatComparisonApostleList(before), formatComparisonApostleList(after));
    addCountComparisonRows(rows, '遺物', getComparisonFormationArtifactIds(before), getComparisonFormationArtifactIds(after), id => getCard(id)?.name || id);
    addCountComparisonRows(rows, 'スペル', before.spells, after.spells, id => getCard(id)?.name || id);
    addTextComparisonRow(rows, '教主の権能', formatComparisonMasterPowerList(before.masterPowers), formatComparisonMasterPowerList(after.masterPowers));
    return rows;
  }

  function createPinnedComparisonFormationVisual(baseline = {}, current = {}) {
    const before = normalizeFormation(baseline.formationState?.formation || {});
    const after = normalizeFormation(current.formationState?.formation || {});
    const beforeArtifacts = before.rows.map(row => row.artifacts);
    const afterArtifacts = after.rows.map(row => row.artifacts);
    if (JSON.stringify(beforeArtifacts) === JSON.stringify(afterArtifacts)) return '';
    return `
      <div class="fdc-comparison-formation-visual">
        ${renderComparisonFormationSide('変更前', before, after, baseline.cardState?.cards || {}, true)}
        <span class="fdc-comparison-formation-arrow" aria-hidden="true">→</span>
        ${renderComparisonFormationSide('現在', after, before, current.cardState?.cards || {}, false)}
      </div>
    `;
  }

  function renderComparisonFormationSide(title, formation, counterpart, cardStates = {}, isBefore = false) {
    const cells = [];
    for (let rowIndex = 0; rowIndex < 3; rowIndex += 1) {
      for (let lineIndex = 0; lineIndex < 3; lineIndex += 1) {
        const apostleId = formation.rows?.[rowIndex]?.apostles?.[lineIndex] || '';
        const artifactIds = formation.rows?.[rowIndex]?.artifacts?.[lineIndex] || ['', '', ''];
        const counterpartIds = counterpart.rows?.[rowIndex]?.artifacts?.[lineIndex] || ['', '', ''];
        const positionLabel = `${POSITIONS[rowIndex] || ''}${lineIndex + 1}`;
        const apostleName = getApostle(apostleId)?.使徒名 || apostleId || '空き';
        const slots = Array.from({ length: 3 }, (_, slotIndex) => {
          const cardId = artifactIds[slotIndex] || '';
          const otherId = counterpartIds[slotIndex] || '';
          const card = getCard(cardId);
          const changed = cardId !== otherId;
          const row = cardId ? createArtifactDisplayRow(cardId, 1, cardStates?.[cardId] || {}, { owned: true }) : null;
          const classes = [
            'fdc-comparison-artifact-slot',
            changed && isBefore ? 'is-removed' : '',
            changed && !isBefore ? 'is-added' : '',
            cardId ? 'is-filled' : 'is-empty'
          ].filter(Boolean).join(' ');
          return `
            <span class="${classes}" title="${escapeAttr(card?.name || '空き枠')}">
              ${row ? renderArtifactIcon(row, slotIndex) : `<span>${slotIndex + 1}</span>`}
            </span>
          `;
        }).join('');
        cells.push(`
          <div class="fdc-comparison-formation-cell">
            <span class="fdc-comparison-formation-owner" title="${escapeAttr(`${positionLabel} / ${apostleName}`)}">${escapeHtml(apostleName)}</span>
            <div class="fdc-comparison-formation-artifacts">${slots}</div>
          </div>
        `);
      }
    }
    return `
      <section class="fdc-comparison-formation-side">
        <strong>${escapeHtml(title)}</strong>
        <div class="fdc-comparison-formation-grid">${cells.join('')}</div>
      </section>
    `;
  }

  function addCountComparisonRows(rows, category, beforeIds = [], afterIds = [], resolveName = value => value) {
    const beforeCounts = new Map(countIds(beforeIds).map(item => [String(item.id), Number(item.qty) || 0]));
    const afterCounts = new Map(countIds(afterIds).map(item => [String(item.id), Number(item.qty) || 0]));
    unique([...beforeIds, ...afterIds].map(String)).forEach(id => {
      const before = beforeCounts.get(id) || 0;
      const after = afterCounts.get(id) || 0;
      if (before === after) return;
      const diff = after - before;
      rows.push({
        label: `${category}：${resolveName(id)}`,
        value: `${formatComparisonCardQuantity(before)} → ${formatComparisonCardQuantity(after)}（${Math.abs(diff)}枚${diff > 0 ? '追加' : '減少'}）`,
        className: diff > 0 ? 'is-comparison-up' : 'is-comparison-down'
      });
    });
  }

  function formatComparisonCardQuantity(value) {
    const quantity = Math.max(0, Number(value) || 0);
    return quantity ? `${quantity}枚` : 'なし';
  }

  function addTextComparisonRow(rows, label, before, after) {
    if (before === after) return;
    rows.push({ label, value: `${before} → ${after}`, className: 'is-comparison-change' });
  }

  function formatComparisonApostleList(formation = {}) {
    const ids = (formation.rows || []).flatMap(row => row.apostles || []).filter(Boolean);
    return ids.length ? ids.map(id => getApostle(id)?.使徒名 || id).join('・') : 'なし';
  }

  function getComparisonFormationArtifactIds(formation = {}) {
    return (formation.rows || []).flatMap(row => (row.artifacts || []).flat()).filter(Boolean);
  }

  function formatComparisonCardList(ids = []) {
    const counted = countIds(ids || []);
    return counted.length
      ? counted.map(item => `${getCard(item.id)?.name || item.id}${item.qty > 1 ? `×${item.qty}` : ''}`).join('・')
      : 'なし';
  }

  function formatComparisonMasterPowerList(ids = []) {
    const powers = typeof TRICKCAL_STAT_DATA === 'undefined' ? [] : TRICKCAL_STAT_DATA?.sheets?.masterPowers || [];
    return ids?.length
      ? ids.map(id => {
        const row = powers.find(power => String(power.id || '') === String(id));
        return row?.['権能名'] || row?.['教主の権能名'] || row?.name || id;
      }).join('・')
      : 'なし';
  }

  function createPinnedComparisonCardDiffRows(baseline = {}, current = {}) {
    const before = baseline.cardState?.cards || {};
    const after = current.cardState?.cards || {};
    const ids = unique([...Object.keys(before), ...Object.keys(after)]);
    return ids.map(id => {
      const left = normalizeComparisonCardState(before[id]);
      const right = normalizeComparisonCardState(after[id]);
      if (left.owned === right.owned && left.star === right.star && left.solder === right.solder) return null;
      return {
        label: getCard(id)?.name || id,
        value: `${formatComparisonCardState(left)} → ${formatComparisonCardState(right)}`,
        className: 'is-comparison-change'
      };
    }).filter(Boolean);
  }

  function normalizeComparisonCardState(value = {}) {
    const star = Math.max(1, Math.min(5, Number(value?.star) || 1));
    return {
      owned: !!value?.owned,
      star,
      solder: star >= 5 ? Math.max(0, Math.min(2, Number(value?.solder) || 0)) : 0
    };
  }

  function formatComparisonCardState(value = {}) {
    if (!value.owned) return '未所持';
    return `★${value.star}${value.star >= 5 ? ` / はんだ+${value.solder}` : ''}`;
  }

  function createPinnedComparisonEffectDiffRows(context, session) {
    const actionKey = getComparisonActionKey(context.actionCategory);
    if (!actionKey) return [];
    const beforeRows = session?.baseline?.dpsSnapshot?.actionEffectAudit?.[actionKey]?.rows || [];
    const currentSnapshot = createDpsPrototypeSnapshot(context);
    const afterRows = currentSnapshot.actionEffectAudit?.[actionKey]?.rows || [];
    const before = aggregateComparisonEffectRows(beforeRows);
    const after = aggregateComparisonEffectRows(afterRows);
    return unique([...before.keys(), ...after.keys()]).map(key => {
      const left = before.get(key);
      const right = after.get(key);
      if (!left?.enabled && !right?.enabled) return null;
      if (areComparisonEffectStatesEqual(left, right)) return null;
      return {
        label: right?.label || left?.label || '効果',
        value: formatComparisonEffectChange(left, right),
        className: !left && right?.enabled
          ? 'is-comparison-up'
          : (!right && left?.enabled ? 'is-comparison-down' : 'is-comparison-change'),
        title: [left?.source, right?.source].filter(Boolean).join(' → ')
      };
    }).filter(Boolean);
  }

  function aggregateComparisonEffectRows(rows = []) {
    const grouped = new Map();
    rows.forEach(row => {
      const label = normalizeComparisonEffectLabel(row?.label);
      if (!label) return;
      const source = String(row?.source || '');
      const key = `${source}:${label}`;
      const current = grouped.get(key) || {
        key,
        label,
        source,
        enabled: false,
        bonuses: {},
        fallbackValues: []
      };
      current.enabled = current.enabled || !!row?.enabled;
      current.bonuses = mergeBonusMaps(current.bonuses, row?.bonuses || {});
      if (row?.value && !current.fallbackValues.includes(row.value)) current.fallbackValues.push(row.value);
      grouped.set(key, current);
    });
    grouped.forEach(row => {
      row.value = Object.keys(row.bonuses).length
        ? formatBonusMap(row.bonuses)
        : row.fallbackValues.join(' / ');
      delete row.fallbackValues;
    });
    return grouped;
  }

  function normalizeComparisonEffectLabel(value = '') {
    return String(value || '').replace(/\s*[x×]\s*\d+\s*$/i, '').trim();
  }

  function areComparisonEffectStatesEqual(left, right) {
    if (!left || !right) return left === right;
    return left.enabled === right.enabled
      && left.value === right.value;
  }

  function formatComparisonEffectChange(left, right) {
    if (!left) return `追加：${formatComparisonEffectState(right, false)}`;
    if (!right) return `削除：${formatComparisonEffectState(left, false)}`;
    if (left.enabled && right.enabled) return `${left.value || 'ON'} → ${right.value || 'ON'}`;
    return `${formatComparisonEffectState(left)} → ${formatComparisonEffectState(right)}`;
  }

  function getComparisonActionKey(category = '') {
    const categories = getFdcActionCategories(category);
    if (categories.includes('基本攻撃')) return 'basicAttack';
    if (categories.includes('強化攻撃')) return 'enhancedAttack';
    if (categories.includes('低学年スキル')) return 'lowSkill';
    if (categories.includes('高学年スキル')) return 'highSkill';
    return '';
  }

  function formatComparisonEffectState(row = null, includeEnabled = true) {
    if (!row) return '対象外';
    const state = includeEnabled ? (row.enabled ? 'ON' : 'OFF') : (!row.enabled ? 'OFF' : '');
    return `${state}${state && row.value ? ' ' : ''}${row.value || ''}` || (row.enabled ? 'ON' : 'OFF');
  }

  function formatBoardComparisonMode(boardState = {}) {
    const mode = boardState.selectedMode === 'planned' ? '予定' : '現在';
    return boardState.selectedMode === 'planned' && !boardState.hasPlannedSnapshot
      ? '予定（予定なし→現在）'
      : mode;
  }

  function formatBoardComparisonStats(boardState = {}) {
    const stats = boardState.selectedStats || {};
    const attackKey = boardState.damageType === 'magic' ? 'magicAtk' : 'physicalAtk';
    const values = [
      ['HP', stats.hp],
      ['攻', stats[attackKey]],
      ['会心', stats.crit],
      ['会心DMG', stats.critDmg]
    ].filter(([, value]) => Number.isFinite(Number(value)));
    return values.length
      ? values.map(([label, value]) => label + formatNumber(Math.round(Number(value) || 0))).join(' / ')
      : '-';
  }

  function formatSkillLevelSummary(levels = {}) {
    const labels = [
      ['低', levels.low],
      ['高', levels.high],
      ['パ', levels.passive],
      ['A段階', levels.asideRank],
      ['ALv', levels.asideLevel]
    ].filter(([, value]) => Number.isFinite(Number(value)));
    return labels.length
      ? labels.map(([label, value]) => `${label}${formatPlainNumber(value)}`).join(' / ')
      : '-';
  }

  function calculateDamageWithStatMode(context, mode) {
    const target = context.target;
    if (!target) return null;
    const apostleState = context.state?.apostles?.[target.id] || {};
    const stats = readMemberStats(apostleState, getApostle(target.id), getEffectiveGradeOverride(), mode);
    const saved = snapshotSelfStatInputs();
    try {
      writeSelfStatInputsForStats(context, stats);
      return calculateDamage({ ...context, target: { ...target, stats, statMode: mode } });
    } finally {
      restoreSelfStatInputs(saved);
    }
  }

  function snapshotSelfStatInputs() {
    return {
      hp: el.inputs.selfHp.value,
      atk: el.inputs.atk.value,
      selfDef: el.inputs.selfDef.value,
      crit: el.inputs.crit.value,
      critDmg: el.inputs.critDmg.value,
      critRes: el.inputs.selfCritResBase.value,
      critDmgRes: el.inputs.selfCritDmgResBase.value
    };
  }

  function restoreSelfStatInputs(saved) {
    el.inputs.selfHp.value = saved.hp;
    el.inputs.atk.value = saved.atk;
    el.inputs.selfDef.value = saved.selfDef;
    el.inputs.crit.value = saved.crit;
    el.inputs.critDmg.value = saved.critDmg;
    el.inputs.selfCritResBase.value = saved.critRes;
    el.inputs.selfCritDmgResBase.value = saved.critDmgRes;
  }

  function writeSelfStatInputsForStats(context, stats = {}) {
    const attackKey = context.damageType === 'magic' ? 'magicAtk' : 'physicalAtk';
    const defenseKey = context.damageType === 'magic' ? 'magicDef' : 'physicalDef';
    el.inputs.selfHp.value = Math.round(Number(stats.hp) || 0);
    el.inputs.atk.value = Math.round(Number(stats[attackKey]) || 0);
    el.inputs.selfDef.value = Math.round(Number(stats[defenseKey]) || 1);
    el.inputs.crit.value = Math.round(Number(stats.crit) || 0);
    el.inputs.critDmg.value = Math.round(Number(stats.critDmg) || 0);
    el.inputs.selfCritResBase.value = Math.round(Number(stats.critRes) || 1);
    el.inputs.selfCritDmgResBase.value = Math.round(Number(stats.critDmgRes) || 1);
  }

  function createCardRow(id, qty, cardState = {}) {
    const card = getCard(id);
    const star = Math.min(5, Math.max(1, Number(cardState?.star) || 1));
    return {
      id,
      qty,
      name: card?.name || id,
      star,
      solder: star >= 5 ? Math.min(2, Math.max(0, Number(cardState?.solder) || 0)) : 0
    };
  }

  function renderFdcTempCardGrowthControls(row, options = {}) {
    if (!row?.id) return '';
    const temporary = !!view.tempCardStates?.[row.id];
    const compact = !!options.compact;
    return `
      <span class="fdc-temp-card-growth ${compact ? 'is-compact' : ''} ${temporary ? 'is-temporary' : ''}" aria-label="${escapeAttr(`${row.name}の一時育成設定`)}">
        <label><span>★</span><select data-fdc-temp-card-id="${escapeAttr(row.id)}" data-fdc-temp-card-field="star" aria-label="${escapeAttr(`${row.name}の★`)}">
          ${[1, 2, 3, 4, 5].map(value => `<option value="${value}" ${row.star === value ? 'selected' : ''}>${value}</option>`).join('')}
        </select></label>
        <label><span>+</span><select data-fdc-temp-card-id="${escapeAttr(row.id)}" data-fdc-temp-card-field="solder" aria-label="${escapeAttr(`${row.name}のはんだ`)}" ${row.star >= 5 ? '' : 'disabled'}>
          ${[0, 1, 2].map(value => `<option value="${value}" ${row.solder === value ? 'selected' : ''}>${value}</option>`).join('')}
        </select></label>
        <button type="button" data-fdc-temp-card-reset="${escapeAttr(row.id)}" title="基準の育成値に戻す" aria-label="${escapeAttr(`${row.name}の一時育成を解除`)}" ${temporary ? '' : 'disabled'}>${renderUiIcon('close')}</button>
      </span>
    `;
  }

  function updateFdcTempCardState(rawId, field, rawValue) {
    const id = resolveCardIdAlias(rawId);
    if (!id || !getCard(id) || !['star', 'solder'].includes(field)) return;
    const state = getEffectiveStatState();
    const base = state.cards?.[id] || {};
    const current = view.tempCardStates?.[id] || {
      star: Math.max(1, Math.min(5, Number(base.star) || 1)),
      solder: Math.max(0, Math.min(2, Number(base.solder) || 0))
    };
    const next = { ...current };
    if (field === 'star') {
      next.star = Math.max(1, Math.min(5, Number(rawValue) || 1));
      if (next.star < 5) next.solder = 0;
    } else {
      next.solder = next.star >= 5 ? Math.max(0, Math.min(2, Number(rawValue) || 0)) : 0;
    }
    view.tempCardStates[id] = next;
    saveCalcSettings();
    render({ keepSpellPopover: true });
    if (view.artifactPicker && !getTempArtifactPicker(false)?.hidden) {
      renderTempArtifactPicker(buildContext());
    }
    if (el.skillPopover?.dataset.fdcPopoverKind === 'spell-editor' && !el.skillPopover.hidden) {
      showFdcSpellEditorPopover(document.querySelector('[data-fdc-spell-edit-toggle]'), buildContext());
    }
  }

  function resetFdcTempCardState(rawId) {
    const id = resolveCardIdAlias(rawId);
    if (!id || !view.tempCardStates?.[id]) return;
    delete view.tempCardStates[id];
    saveCalcSettings();
    render({ keepSpellPopover: true });
    if (view.artifactPicker && !getTempArtifactPicker(false)?.hidden) {
      renderTempArtifactPicker(buildContext());
    }
    if (el.skillPopover?.dataset.fdcPopoverKind === 'spell-editor' && !el.skillPopover.hidden) {
      showFdcSpellEditorPopover(document.querySelector('[data-fdc-spell-edit-toggle]'), buildContext());
    }
  }

  function collectSynergyCounts(formation, state = {}) {
    const personality = {};
    const race = {};
    const selectedIds = formation.rows.flatMap(row => row.apostles).filter(Boolean);
    selectedIds.forEach(id => {
      const basic = getApostle(id);
      if (basic?.性格) personality[basic.性格] = (personality[basic.性格] || 0) + 1;
      if (basic?.種族) race[basic.種族] = (race[basic.種族] || 0) + 1;
    });
    applyPersonalityExtraCounts({ personality }, formation, selectedIds, state);
    return { personality, race };
  }

  function applyPersonalityExtraCounts(counts, formation, selectedIds = [], state = {}) {
    const hasUi = selectedIds.some(id => id === 'Ui' || id === 'ui' || getApostle(id)?.使徒名 === 'ウイ');
    const uiState = state.apostles?.Ui || state.apostles?.ui || {};
    if (hasUi && (Number(uiState.asideRank) || 0) >= 2) {
      counts.personality['活発'] = (counts.personality['活発'] || 0) + 1;
    }
    getFormationSpellPersonalityExtras(formation).forEach(name => {
      counts.personality[name] = (counts.personality[name] || 0) + 1;
    });
  }

  function getFormationSpellPersonalityExtras(formation = {}) {
    const personalities = ['純粋', '冷静', '狂気', '活発', '憂鬱'];
    const selectedSpellIds = new Set(Array.isArray(formation.spells) ? formation.spells.filter(Boolean) : []);
    const extras = new Set();
    (typeof CARD_LIBRARY === 'undefined' ? [] : CARD_LIBRARY.spells || []).forEach(card => {
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

  function findSynergyEffect(table, name, count) {
    const entry = table.find(row => row.name === name);
    if (!entry?.effectsByCount) return null;
    const key = Object.keys(entry.effectsByCount).map(Number).filter(value => value <= (Number(count) || 0)).sort((a, b) => b - a)[0];
    return key ? entry.effectsByCount[key] : null;
  }

  function calcBaseDamageRate(atk, def) {
    const x = atk / Math.max(1, def);
    const rate = x >= 0.5
      ? 1.2 * (1 - 0.5 / (1 + (10 / 3) * (x - 0.5)))
      : 0.6 * (1 - ((13 / 3) * (0.5 - x)) / (1 + (10 / 3) * (0.5 - x)));
    return clamp(rate, 0.1125, 1.2);
  }

  function calcCritRate(critAtk, critDef) {
    const x = critAtk / Math.max(1, critDef);
    const rate = x >= 1 ? 0.30 + 0.50 * ((x - 1) / (x + 2)) : 0.05 + 0.25 * (x / (2 - x));
    return clamp(rate, 0.05, 0.8);
  }

  function calcCritMultiplier(critAtk, critDmgRes) {
    const x = critAtk / Math.max(1, critDmgRes);
    const mult = x >= 1 ? 1.75 + 0.85 * (x - 1) / (x + 2) : 1.75 - 1.10 * (1 - x) / (2 - x);
    return clamp(mult, 1.2, 2.5);
  }

  function resolveDamageType(requested, target) {
    if (requested === 'physical' || requested === 'magic') return requested;
    const raw = String(target?.attackType || '').toLowerCase();
    if (raw.includes('魔') || /mag|magic|matk/.test(raw)) return 'magic';
    if (raw.includes('物') || /phys|physical|patk/.test(raw)) return 'physical';
    const magicAtk = Number(target?.stats?.magicAtk) || 0;
    const physicalAtk = Number(target?.stats?.physicalAtk) || 0;
    if (magicAtk > 0 && physicalAtk <= 0) return 'magic';
    if (physicalAtk > 0 && magicAtk <= 0) return 'physical';
    if (magicAtk > physicalAtk) return 'magic';
    if (physicalAtk > magicAtk) return 'physical';
    return 'unknown';
  }

  function resolveSelfDamageType(target) {
    return resolveDamageType(view.damageType, target);
  }

  function resolveEnemyDamageType(preset = getSelectedEnemyPreset()) {
    if (view.enemyDamageType === 'physical' || view.enemyDamageType === 'magic') return view.enemyDamageType;
    if (view.enemySourceMode === 'apostle') {
      const basic = getApostle(view.enemyApostleId);
      return resolveDamageType('auto', { attackType: basic?.攻撃タイプ || basic?.攻撃Type || '' });
    }
    if (preset?.dmgType === 'mag' || preset?.dmgType === 'magic') return 'magic';
    if (preset?.dmgType === 'phys' || preset?.dmgType === 'physical') return 'physical';
    return 'physical';
  }

  function resolveActiveDamageType(target) {
    return view.perspective === 'enemy'
      ? resolveEnemyDamageType(getSelectedEnemyPreset())
      : resolveSelfDamageType(target);
  }

  function buildFdcApostleSkillOptions(target, context) {
    const apostle = getApostleSkillData(target);
    if (!apostle) return [];
    const levels = getFdcEffectiveSkillLevels(target);
    const options = [];
    const statusMultipliers = new Map();
    const skillSources = collectFdcApostleSkillSources(apostle, levels, target, context);
    skillSources.forEach(({ skill, sourceKey, sourceLabel }, skillIndex) => {
      const sourceCategory = getFdcApostleSkillCategory(skill, sourceLabel);
      const skillLevel = getFdcSkillLevelForCategory(levels, sourceCategory);
      getFdcSkillStatusMultipliers(skill).forEach(({ status, multiplier }) => {
        statusMultipliers.set(status, multiplier);
      });
      normalizeFdcArray(skill.effects).forEach((effect, effectIndex) => {
        if (!isFdcApostleAttackMultiplierEffect(effect)) return;
        const levelInfo = getFdcEffectLevelInfo(effect, skillLevel);
        if (!levelInfo || !Number.isFinite(levelInfo.value)) return;
        const randomMaxLock = levelInfo.isRange ? getFdcApostleSkillRandomMaxLockInfo(apostle, levels, sourceCategory) : null;
        const baseCalcValue = randomMaxLock ? levelInfo.max : levelInfo.value;
        const damageReference = getFdcApostleDamageReference(effect);
        const referenceLabel = damageReference === 'enemyMaxHp' ? '敵最大HP参照' : '';
        const kind = effect.valueKind || 'ダメージ';
        const attackCategory = String(effect.attackCategory || '').trim();
        const category = attackCategory || sourceCategory;
        const repeatInfo = sourceLabel === '通常'
          ? getFdcActionRepeatInfo(skillSources, levels, category)
          : { count: 1, labels: [] };
        const calcValue = baseCalcValue * repeatInfo.count;
        const cooldownSeconds = getFdcHighSkillCooldownSeconds(skill, sourceCategory);
        const triggerProbability = getFdcSkillTriggerProbabilityLabel(skill);
        const detailText = [skill.description, effect.description, effect.effectDescription].filter(Boolean).join('\n');
        options.push({
          key: `${apostle.id || target.id}:${sourceKey || skillIndex}:${effectIndex}`,
          effectId: effect.effectId || '',
          value: String(calcValue),
          label: `${sourceCategory}${attackCategory ? ` / 攻撃分類: ${attackCategory}` : ''} / ${kind} (${formatPlainNumber(calcValue)}%)`,
          category,
          sourceCategory,
          attackCategory,
          sourceLabel,
          skillName: skill.skillName || skill.name || '',
          requiredSp: getFdcLowSkillRequiredSp(skill),
          cooldownSeconds,
          kind,
          baseValue: String(baseCalcValue),
          actionRepeatCount: repeatInfo.count,
          damageReference,
          reference: effect.reference || '',
          condition: effect.condition || '',
          effectTarget: effect.effectTarget || '',
          processGroupId: effect.processGroupId || '',
          processOrder: Number(effect.processOrder) || 0,
          triggerType: effect.triggerType || '',
          triggerValue: effect.triggerValue ?? '',
          triggerSourceId: effect.triggerSourceId || '',
          conditionType: effect.conditionType || '',
          conditionValue: effect.conditionValue ?? '',
          effectStack: effect.effectStack,
          maxStack: Number(effect.maxStack) || 0,
          shortDetail: [
            triggerProbability,
            referenceLabel,
            repeatInfo.count > 1 ? `${repeatInfo.count}回分（基礎 ${formatPlainNumber(baseCalcValue)}% ×${formatPlainNumber(repeatInfo.count)}）` : '',
            effect.condition || '',
            levelInfo.isRange ? `範囲 ${formatPlainNumber(levelInfo.min)}～${formatPlainNumber(levelInfo.max)}${randomMaxLock ? ' / 最大固定' : ''}` : '',
            cooldownSeconds ? `CT ${formatPlainNumber(cooldownSeconds)}秒` : ''
          ].filter(Boolean).join(' / '),
          detailText: [
            skill.skillName || skill.name || '',
            triggerProbability ? `発動確率: ${triggerProbability.replace(/^発動率\s*/, '')}` : '',
            detailText,
            effect.reference ? `参照: ${effect.reference}` : '',
            effect.condition ? `条件: ${effect.condition}` : '',
            repeatInfo.count > 1
              ? `回数補正: ${repeatInfo.labels.join(' / ')}（${formatPlainNumber(baseCalcValue)}% × ${formatPlainNumber(repeatInfo.count)} = ${formatPlainNumber(calcValue)}%）`
              : '',
            levelInfo.isRange
              ? `範囲: ${levelInfo.raw || `${levelInfo.min}～${levelInfo.max}`} / 計算値: ${randomMaxLock ? `${randomMaxLock.sourceLabel} 最大固定 ${formatPlainNumber(calcValue)}%` : `平均 ${formatPlainNumber(calcValue)}%`}`
              : ''
          ].filter(Boolean).join('\n'),
          order: getFdcApostleSkillOrder(sourceCategory)
        });
      });
    });
    statusMultipliers.forEach((multiplier, status) => {
      options.push({
        key: `${apostle.id || target.id}:status:${status}`,
        value: String(multiplier),
        label: `${status} (${multiplier}%)`,
        category: `状態異常::${status}`,
        sourceCategory: `状態異常::${status}`,
        attackCategory: '',
        sourceLabel: '状態異常',
        skillName: '',
        kind: status,
        shortDetail: 'スキル倍率',
        detailText: `${status}スキル倍率: ${multiplier}%`,
        order: 80
      });
    });
    return options.sort((a, b) => (a.order - b.order) || a.label.localeCompare(b.label, 'ja'));
  }

  function getFdcActionRepeatInfo(skillSources, levels, actionCategory) {
    const matches = [];
    normalizeFdcArray(skillSources).forEach(({ skill, sourceLabel }) => {
      if (sourceLabel === '通常') return;
      const sourceCategory = getFdcApostleSkillCategory(skill, sourceLabel);
      const skillLevel = getFdcSkillLevelForCategory(levels, sourceCategory);
      normalizeFdcArray(skill?.effects).forEach(effect => {
        if (!isFdcActionRepeatCountEffect(effect)) return;
        const scope = judgeFdcEffectValueActionScope(effect, actionCategory);
        if (scope.hasActionScope && !scope.matched) return;
        const levelInfo = getFdcEffectLevelInfo(effect, skillLevel);
        const count = Number(levelInfo?.value);
        if (!Number.isFinite(count) || count <= 1) return;
        matches.push({
          count,
          label: `${sourceLabel} ${effect.valueKind || '行動回数'} ${formatPlainNumber(count)}回`
        });
      });
    });
    if (!matches.length) return { count: 1, labels: [] };
    const count = Math.max(...matches.map(item => item.count));
    return {
      count,
      labels: matches.filter(item => item.count === count).map(item => item.label)
    };
  }

  function isFdcActionRepeatCountEffect(effect = {}) {
    const valueKind = String(effect.valueKind || '').replace(/[\s　]+/g, '');
    const valueClass = String(effect.valueClass || '').trim();
    const effectType = String(effect.effectType || '').trim();
    // 「召喚回数」は対象行動全体の反復数として扱う。
    // 追加攻撃回数や最大使用回数は別ダメージ・使用制限なのでここでは掛けない。
    return valueClass === '回数'
      && /召喚回数$/.test(valueKind)
      && (!effectType || /召喚/.test(effectType));
  }

  function getFdcSkillTriggerProbabilityLabel(skill = {}) {
    const triggerType = String(skill.triggerType || skill['スキル発動条件種別'] || skill['発動条件種別'] || '').trim();
    const rawValue = skill.triggerValue ?? skill['スキル発動条件値'] ?? skill['発動条件値'];
    if (!/一定確率/.test(triggerType) || rawValue === '' || rawValue == null) return '';
    const value = Number(rawValue);
    return Number.isFinite(value) ? `発動率 ${formatPlainNumber(value)}%` : '';
  }

  function getFdcApostleDamageReference(effect = {}) {
    const reference = String(effect.reference || '').replace(/\s/g, '');
    return /敵(?:の)?最大HP|対象(?:の)?最大HP/.test(reference) ? 'enemyMaxHp' : '';
  }

  function getFdcLowSkillRequiredSp(skill = {}) {
    const direct = Number(skill.requiredSp ?? skill.spCost ?? skill['必要SP']);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const condition = normalizeFdcArray(skill.effects).find(effect => {
      const type = String(effect?.triggerType || effect?.valueKind || '');
      return /SP/.test(type) && /条件|必要|到達/.test(type);
    });
    const conditionValue = Number(condition?.triggerValue ?? condition?.fixedValue);
    return Number.isFinite(conditionValue) && conditionValue > 0
      ? conditionValue
      : (typeof TRICKCAL_SP_ENGINE !== 'undefined' ? TRICKCAL_SP_ENGINE.DEFAULT_REQUIRED_SP : 300) || 300;
  }

  function getFdcHighSkillCooldownSeconds(skill = {}, category = '') {
    if (getFdcSkillBaseCategory(category) !== '高学年スキル') return 0;
    const value = Number(skill.cooldownSeconds ?? skill['高学年クールタイム秒'] ?? skill['クールタイム秒']);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function getFdcSkillStatusMultipliers(skill) {
    const statuses = new Set();
    normalizeFdcArray(skill?.effects).forEach(effect => {
      if (effect?.valueClass !== '状態付与') return;
      const valueKind = String(effect.valueKind || '');
      Object.keys(FDC_STATUS_SKILL_MULTIPLIERS).forEach(status => {
        if (valueKind.includes(status)) statuses.add(status);
      });
    });
    return [...statuses].map(status => ({ status, multiplier: FDC_STATUS_SKILL_MULTIPLIERS[status] }));
  }

  function getFdcApostleSkillRandomMaxLockInfo(apostle, levels, category) {
    const categoryText = String(category || '');
    return Object.entries(apostle?.aside?.levels || {}).reduce((found, [level, data]) => {
      if (found || !data || Number(level) > Number(levels.asideRank || 0)) return found;
      const effect = normalizeFdcArray(data.effects).find(item => {
        const valueKind = String(item?.valueKind || '');
        if (!/乱数最大固定/.test(valueKind)) return false;
        const targetSkill = String(item?.targetSkill || '');
        if (!targetSkill) return true;
        return targetSkill.includes(categoryText) || categoryText.includes(targetSkill) || (/高学年/.test(targetSkill) && /高学年/.test(categoryText));
      });
      return effect ? { sourceLabel: `A${level}`, effect, data } : null;
    }, null);
  }

  function collectFdcApostleSkillSources(apostle, levels, target, context) {
    const sources = [];
    normalizeFdcArray(apostle?.skills).forEach((skill, index) => {
      sources.push({ skill, sourceLabel: '通常', sourceKey: `base:${index}` });
    });
    getActiveFdcFavoriteLevels(apostle, target, context).forEach(level => {
      normalizeFdcArray(apostle?.favoriteCard?.levels?.[level]).forEach((skill, index) => {
        sources.push({
          skill,
          sourceLabel: `愛用品Lv${level}`,
          sourceKey: `favorite:${level}:${index}`
        });
      });
    });
    Object.entries(apostle?.aside?.levels || {}).forEach(([level, data]) => {
      if (!data || Number(level) > Number(levels.asideRank || 0)) return;
      sources.push({
        skill: {
          skillType: data.name || `アサイド${level}`,
          skillName: data.description ? String(data.description).split(/\r?\n/)[0] : `アサイド${level}`,
          description: data.description || '',
          effects: normalizeFdcArray(data.effects),
          stats: normalizeFdcArray(data.stats)
        },
        sourceLabel: `A${level}`,
        sourceKey: `aside:${level}`
      });
    });
    return sources;
  }

  function getActiveFdcFavoriteLevels(apostle, target, context) {
    const favoriteLevels = apostle?.favoriteCard?.levels || {};
    if (!Object.keys(favoriteLevels).length) return [];
    const activeCards = getFdcTargetFavoriteCards(apostle, target, context);
    if (!activeCards.length) return [];
    const maxStar = Math.max(...activeCards.map(card => Number(card.star) || 0));
    return Object.keys(favoriteLevels)
      .map(Number)
      .filter(level => Number.isFinite(level) && maxStar >= level)
      .sort((a, b) => a - b);
  }

  function getFdcTargetFavoriteCards(apostle, target, context) {
    const cards = context?.state?.cards || {};
    const targetName = String(target?.name || apostle?.name || '');
    const rows = [
      ...countIds(target?.artifactIds || []).map(({ id, qty }) => ({ ...createCardRow(id, qty, cards[id]), source: '装備遺物' })),
      ...countIds(context?.formation?.spells || []).map(({ id, qty }) => ({ ...createCardRow(id, qty, cards[id]), source: 'スペル' }))
    ];
    return rows.filter(row => {
      const card = getCard(row.id);
      return card?.signature && String(card.favoriteCharacter || '') === targetName;
    });
  }

  function renderFdcSkillLevelControls(target, levels) {
    const apostle = getApostleSkillData(target);
    const maxAsideRank = getFdcMaxAsideRank(apostle);
    const maxSkillLevel = Math.max(1, 12 + Math.min(3, Number(levels.asideRank) || 0));
    const skillOptions = Array.from({ length: maxSkillLevel }, (_, index) => index + 1)
      .map(level => `<option value="${level}">${level}</option>`)
      .join('');
    const asideOptions = Array.from({ length: maxAsideRank + 1 }, (_, index) => {
      const selected = Number(levels.asideRank) === index ? ' selected' : '';
      return `<option value="${index}"${selected}>${index ? `A${index}` : 'なし'}</option>`;
    }).join('');
    return `
      <div class="fdc-skill-levels" aria-label="スキルレベル一時設定">
        ${renderFdcSkillLevelSelect('low', '低学年', levels.low, skillOptions)}
        ${renderFdcSkillLevelSelect('high', '高学年', levels.high, skillOptions)}
        ${renderFdcSkillLevelSelect('passive', 'パッシブ', levels.passive, skillOptions)}
        <label class="fdc-skill-level-control level-aside">
          <span>アサイド</span>
          <select data-fdc-skill-level="asideRank" ${maxAsideRank ? '' : 'disabled'}>
            ${asideOptions}
          </select>
        </label>
      </div>
    `;
  }

  function renderFdcSkillLevelSelect(key, label, value, optionsHtml) {
    return `
      <label class="fdc-skill-level-control level-${escapeAttr(key)}">
        <span>${escapeHtml(label)}</span>
        <select data-fdc-skill-level="${escapeAttr(key)}">
          ${optionsHtml.replace(`value="${Number(value) || 1}"`, `value="${Number(value) || 1}" selected`)}
        </select>
      </label>
    `;
  }

  function getFdcMaxAsideRank(apostle) {
    return Object.keys(apostle?.aside?.levels || {})
      .map(Number)
      .filter(Number.isFinite)
      .reduce((max, level) => Math.max(max, level), 0);
  }

  function getFdcEffectiveSkillLevels(target) {
    const base = normalizeFdcSkillLevelConfig(target?.skillLevels || {});
    const override = target?.hasEnemyIndividualSkillLevels ? {} : getCurrentFdcSkillLevelOverride(target, base);
    const asideRank = Number(override.asideRank ?? target?.asideRank ?? base.asideRank) || 0;
    const maxSkillLevel = Math.max(1, 12 + Math.min(3, asideRank));
    const clampSkill = value => Math.max(1, Math.min(maxSkillLevel, Number(value) || 1));
    return {
      low: clampSkill(override.low ?? base.low),
      high: clampSkill(override.high ?? base.high),
      passive: clampSkill(override.passive ?? base.passive),
      asideRank,
      asideLevel: Number(override.asideLevel ?? target?.asideLevel ?? base.asideLevel) || 0
    };
  }

  function getCurrentFdcSkillLevelOverride(target, base) {
    const id = target?.id;
    const override = view.skillLevelOverrides?.[id];
    if (!id || !override || typeof override !== 'object') return {};
    const matchesState = Number(override.baseLow) === Number(base.low)
      && Number(override.baseHigh) === Number(base.high)
      && Number(override.basePassive) === Number(base.passive)
      && Number(override.baseAsideRank) === Number(target?.asideRank || 0)
      && Number(override.baseAsideLevel) === Number(target?.asideLevel || 0)
      && Number(override.managerSyncRevision) === Math.max(0, Number(target?.managerSyncRevision) || 0);
    if (matchesState) return override;
    delete view.skillLevelOverrides[id];
    return {};
  }

  function syncFdcSkillLevelOverridesFromManager() {
    if (!Object.keys(view.skillLevelOverrides || {}).length) return;
    view.skillLevelOverrides = {};
    saveCalcSettings();
    render();
  }

  function normalizeFdcArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return value ? [value] : [];
  }

  function normalizeFdcSkillLevelConfig(value = {}) {
    const pick = (...keys) => {
      for (const key of keys) {
        const number = Number(value?.[key]);
        if (Number.isFinite(number) && number > 0) return number;
      }
      return 1;
    };
    return {
      low: pick('low', '低学年', 'F'),
      high: pick('high', '高学年', 'S'),
      passive: pick('passive', 'パッシブ', 'P'),
      default: pick('default', 'low', '低学年', 'F'),
      asideRank: Number(value?.asideRank) || 0,
      asideLevel: Number(value?.asideLevel) || 0
    };
  }

  function getFdcSkillLevelForCategory(levels, category) {
    if (/低学年/.test(category)) return levels.low;
    if (/高学年/.test(category)) return levels.high;
    if (/パッシブ/.test(category)) return levels.passive;
    return levels.default;
  }

  function isFdcSkillActionCategory(category = '') {
    return getFdcActionCategories(category)
      .some(item => item === 'スキル' || /低学年|高学年|アサイド|^A[1-3]$/.test(item));
  }

  function getFdcApostleSkillCategory(skill, sourceLabel = '') {
    if (String(sourceLabel || '').startsWith('愛用品')) return sourceLabel;
    if (/^A[1-3]$/.test(String(sourceLabel || ''))) return String(sourceLabel || '');
    const raw = String(skill?.skillType || skill?.targetSkill || skill?.name || '');
    if (/普通攻撃_基本|基本攻撃|基本/.test(raw)) return '基本攻撃';
    if (/普通攻撃_強化|強化攻撃|強化/.test(raw)) return '強化攻撃';
    if (/低学年/.test(raw)) return '低学年スキル';
    if (/高学年/.test(raw)) return '高学年スキル';
    if (/パッシブ/.test(raw)) return 'パッシブ';
    return raw || 'スキル';
  }

  function getFdcSkillBaseCategory(category = '') {
    return getFdcActionCategories(category)[0] || '';
  }

  function getFdcActionCategories(category = '') {
    const categories = getFdcDeclaredAttackCategories(category);
    const statusPart = String(category || '').split('::')[1];
    if (statusPart) categories.push('状態異常');
    if (categories.includes('基本攻撃') || categories.includes('強化攻撃')) categories.push('普通攻撃');
    if (categories.includes('低学年スキル') || categories.includes('高学年スキル')) categories.push('スキル');
    return [...new Set(categories.filter(Boolean))];
  }

  function getFdcDeclaredAttackCategories(category = '') {
    const [categoryPart, statusPart] = String(category || '').split('::');
    const categories = categoryPart
      .split(/[,、]/)
      .map(item => item.trim())
      .filter(Boolean);
    if (statusPart) categories.push(statusPart.trim());
    return [...new Set(categories.filter(Boolean))];
  }

  function matchesFdcAttackCategory(expected = '', selected = '') {
    const expectedKey = String(expected).replace(/[\s　・_]/g, '').replace(/の/g, '');
    const selectedKey = String(selected).replace(/[\s　・_]/g, '').replace(/の/g, '');
    if (!expectedKey || !selectedKey) return false;
    if (expectedKey === selectedKey) return true;
    if (/(?:通常|普通)攻撃基本/.test(expectedKey)) return selected === '基本攻撃';
    if (/(?:通常|普通)攻撃強化/.test(expectedKey)) return selected === '強化攻撃';
    if (expectedKey === 'スキル') return isFdcSkillActionCategory(selected);
    if (/(?:通常|普通)攻撃/.test(expectedKey)) return selected === '基本攻撃' || selected === '強化攻撃';
    return false;
  }

  function getFdcApostleSkillOrder(category) {
    const baseCategory = getFdcSkillBaseCategory(category);
    if (baseCategory === '基本攻撃') return 10;
    if (baseCategory === '強化攻撃') return 20;
    if (baseCategory === '低学年スキル') return 30;
    if (baseCategory === '高学年スキル') return 40;
    if (baseCategory.startsWith('愛用品')) return 50;
    if (baseCategory === 'パッシブ') return 50;
    if (/^A[1-3]$/.test(baseCategory)) return 60 + Number(baseCategory.slice(1));
    return 90;
  }

  function getFdcApostleSkillActionLabel(category = '') {
    const rawCategory = String(category || '');
    const [categoryPart, status] = rawCategory.split('::');
    const baseCategory = getFdcActionCategories(categoryPart)[0] || categoryPart;
    if (status) return status;
    if (baseCategory === '基本攻撃') return '基本';
    if (baseCategory === '強化攻撃') return '強化';
    if (baseCategory === '低学年スキル') return '低学年';
    if (baseCategory === '高学年スキル') return '高学年';
    if (baseCategory.startsWith('愛用品')) return baseCategory.replace('愛用品', '愛用');
    if (/^A[1-3]$/.test(baseCategory)) return baseCategory;
    return baseCategory || 'スキル';
  }

  function getFdcApostleSkillClassificationLabel(option = {}) {
    const attackCategory = String(option.attackCategory || '').trim();
    if (!attackCategory) return '';
    const declared = getFdcDeclaredAttackCategories(attackCategory);
    const sourceCategories = new Set(getFdcActionCategories(option.sourceCategory || ''));
    if (declared.length && declared.every(category => sourceCategories.has(category))) return '';
    return declared.join('・') || attackCategory;
  }

  function getFdcApostleSkillTone(category = '') {
    const baseCategory = getFdcSkillBaseCategory(category);
    if (baseCategory === '基本攻撃') return 'tone-basic';
    if (baseCategory === '強化攻撃') return 'tone-enhanced';
    if (baseCategory === '低学年スキル') return 'tone-low';
    if (baseCategory === '高学年スキル') return 'tone-high';
    if (baseCategory === 'パッシブ') return 'tone-passive';
    if (baseCategory.startsWith('愛用品')) return 'tone-favorite';
    if (/^A[1-3]$/.test(baseCategory)) return 'tone-extra';
    return 'tone-extra';
  }


  function isFdcApostleAttackMultiplierEffect(effect) {
    const valueKind = String(effect?.valueKind || '');
    const effectType = String(effect?.effectType || '');
    const valueClass = String(effect?.valueClass || '');
    if (valueClass && valueClass !== '倍率') return false;
    if (effectType && !/攻撃|ダメージ/.test(effectType)) return false;
    if (!/ダメージ/.test(valueKind)) return false;
    if (/被ダメージ|被スキルダメージ|ダメージ量減少|回復|シールド/.test(valueKind)) return false;
    return true;
  }

  function getFdcEffectLevelInfo(effect, requestedLevel) {
    const levels = effect?.levels;
    if (levels && typeof levels === 'object') {
      const requestedKey = String(requestedLevel);
      if (levels[requestedKey] !== undefined && levels[requestedKey] !== '') return parseFdcEffectNumericValue(levels[requestedKey]);
      const availableLevels = Object.keys(levels).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
      const fallback = availableLevels.filter(level => level <= requestedLevel).pop() || availableLevels[availableLevels.length - 1];
      if (fallback !== undefined) return parseFdcEffectNumericValue(levels[String(fallback)]);
    }
    if (effect?.fixedValue !== undefined && effect.fixedValue !== '') return parseFdcEffectNumericValue(effect.fixedValue);
    return null;
  }

  function parseFdcEffectNumericValue(value) {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? { value, min: value, max: value, isRange: false } : null;
    const text = String(value).trim();
    const range = text.match(/^(-?\d+(?:\.\d+)?)\s*[～〜~\-]\s*(-?\d+(?:\.\d+)?)$/);
    if (range) {
      const min = Number(range[1]);
      const max = Number(range[2]);
      if (Number.isFinite(min) && Number.isFinite(max)) return { value: (min + max) / 2, min, max, isRange: true, raw: text };
    }
    const number = Number(text);
    return Number.isFinite(number) ? { value: number, min: number, max: number, isRange: false } : null;
  }

  function getApostle(id) {
    const data = typeof TRICKCAL_STAT_DATA === 'undefined' ? null : TRICKCAL_STAT_DATA;
    return (data?.sheets?.basicInfo || []).find(row => row.id === id) || null;
  }

  function getApostleSkillData(target) {
    const list = typeof APOSTLE_LIBRARY === 'undefined' ? [] : APOSTLE_LIBRARY;
    return list.find(apostle => apostle.id === target.id || apostle.name === target.name) || null;
  }

  function getCard(id) {
    if (typeof CARD_LIBRARY === 'undefined') return null;
    const currentId = resolveCardIdAlias(id);
    if (typeof CARD_INDEX !== 'undefined' && CARD_INDEX[currentId]) return CARD_INDEX[currentId];
    return (CARD_LIBRARY.artifacts || []).concat(CARD_LIBRARY.spells || []).find(card => card.id === currentId) || null;
  }

  function getApostleImage(id, name = '') {
    const key = APOSTLE_IMAGE_ALIASES[id] || APOSTLE_IMAGE_ALIASES[name] || id;
    if (!key) return FALLBACK_IMAGE;
    return `img/Chara/${key}.webp`;
  }

  function normalizeRole(value) {
    const text = String(value || '');
    if (/攻撃|アタッカー/.test(text)) return '攻撃';
    if (/守備|防御|ガード|タンク|ディフェンダー/.test(text)) return '守備';
    if (/支援|補助|サポーター/.test(text)) return '支援';
    return text;
  }

  function isSkillChangeEffect(text, effect) {
    if (hasCardEffectBonus(effect)) return false;
    return /スキル変更|クールタイム|基本攻撃強化|強化攻撃|追加発射/.test(text)
      || /スキル変更/.test(String(effect.effectType || ''));
  }

  function hasCardEffectBonus(effect) {
    return normalizeArray(effect?.bonusesByStar).some(bonus => bonus && Object.keys(bonus).length)
      || !!(effect?.bonuses && Object.keys(effect.bonuses).length)
      || normalizeArray(effect?.solderBonuses).some(bonus => bonus && Object.keys(bonus).length);
  }

  function getArtifactEffectScopeLabel(effect = null) {
    const parts = String(effect?.description || '')
      .split('/')
      .map(part => part.trim())
      .filter(Boolean);
    // 生成データでは先頭要素が効果対象（自分、同列、味方全体など）。
    const scope = parts.find(part => !/^(?:持続|参照|リセット):|^(?:倍率|固定値|スタック数|クールタイム)$/.test(part));
    return scope || String(effect?.effectTarget || '').trim();
  }
  function getEffectText(effect) {
    return [
      effect.id,
      effect.label,
      effect.shortLabel,
      effect.valueKind,
      effect.valueClass,
      effect.effectType,
      effect.effectTarget,
      getFdcStructuredEffectConditionText(effect),
      effect.description,
      ...(effect.descriptionByStar || [])
    ].filter(Boolean).join(' ');
  }

  function summarizeSkillEffects(effects) {
    return normalizeArray(effects).map(effect => [
      effect.valueKind,
      effect.fixedValue != null ? formatNumber(effect.fixedValue) : '',
      effect.valueClass,
      effect.effectTarget
    ].filter(Boolean).join(' ')).join(' / ');
  }

  function normalizeArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return value ? [value] : [];
  }

  function unique(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function formatBonusMap(map) {
    const labels = {
      hpP: 'HP',
      atkP: '攻撃',
      physicalAtkP: '物理攻撃',
      magicAtkP: '魔法攻撃',
      critP: '会心',
      critRateP: '会心率',
      critDmgP: '会心DMGステ',
      critDmgAddP: '会心DMG増',
      hasteP: '攻撃速度',
      addP: '与被DMG',
      normalAttackAddP: '普通攻撃ダメージ',
      basicAddP: '基本攻撃ダメージ',
      enhancedAddP: '強化攻撃ダメージ',
      skillAddP: 'スキルダメージ',
      specialP: '特殊',
      otherP: 'その他',
      healingP: '治癒',
      hpRecoveryP: 'HP回復',
      spRecovery: 'SP回復',
      spRecoveryP: 'SP回復',
      spRegen: '毎秒SP回復',
      spRegenP: '毎秒SP回復',
      initialSp: '初期SP',
      initialSpP: '初期SP',
      defP: '防御',
      physicalDefP: '物理防御',
      magicDefP: '魔法防御',
      takenDmgP: '被ダメ',
      critResP: '会心抵抗',
      critResAddP: '会心率抵抗',
      critDmgResP: '会心DMG抵抗',
      critDmgResAddP: '会心DMG抵抗',
      atkDownP: '攻撃低下',
      attackerDmgDownP: '攻撃低下',
      enemyDefDownP: '敵防御低下',
      enemyCritResDownP: '敵会心抵抗低下',
      enemyCritDmgResDownP: '敵会心DMG抵抗低下',
      personalityMadnessPlus: '狂気性格判定',
      personalityVivaciousPlus: '活発性格判定',
      personalityPurePlus: '純粋性格判定',
      personalityGloomyPlus: '憂鬱性格判定',
      personalityCoolPlus: '冷静性格判定'
    };
    const fixedValueKeys = new Set([
      'spRecovery',
      'spRegen',
      'initialSp',
      'personalityMadnessPlus',
      'personalityVivaciousPlus',
      'personalityPurePlus',
      'personalityGloomyPlus',
      'personalityCoolPlus'
    ]);
    return Object.entries(map || {})
      .filter(([, value]) => Number(value))
      .map(([key, value]) => {
        const suffix = fixedValueKeys.has(key) ? '' : '%';
        const number = Number(value) || 0;
        return `${labels[key] || key}${number > 0 ? '+' : ''}${formatPlainNumber(number)}${suffix}`;
      })
      .join(' / ');
  }

  function formatStatMap(map, unit = '') {
    const labels = {
      hp: 'HP',
      hpP: 'HP',
      atkP: '攻撃',
      defP: '防御',
      patk: '物理攻撃',
      matk: '魔法攻撃',
      pdef: '物理防御',
      mdef: '魔法防御',
      physicalAtk: '物理攻撃',
      magicAtk: '魔法攻撃',
      physicalDef: '物理防御',
      magicDef: '魔法防御',
      crit: '会心',
      critP: '会心',
      critDmg: '会心DMG',
      critDmgP: '会心DMG',
      critRes: '会心抵抗',
      critResP: '会心抵抗',
      critDmgResP: '会心DMG抵抗',
      critDmgRes: '会心DMG抵抗'
    };
    return Object.entries(map || {})
      .filter(([, value]) => Number(value))
      .map(([key, value]) => `${labels[key] || key}${Number(value) > 0 ? '+' : ''}${formatPlainNumber(value)}${unit}`)
      .join(' / ');
  }

  function formatEffectValue(value, unit) {
    const num = Number(value) || 0;
    return unit === '件' ? `${num}${unit}` : `${num ? '+' : ''}${formatPlainNumber(num)}${unit}`;
  }

  function formatDamageType(type) {
    if (type === 'physical') return '物理';
    if (type === 'magic') return '魔法';
    return '未判定';
  }

  function addToInput(input, value) {
    const add = Number(value) || 0;
    if (!input || !add) return;
    input.value = formatPlainNumber((readNumber(input) || 0) + add);
  }

  function readStatValue(source, keys) {
    for (const key of keys) {
      const value = Number(source?.[key]);
      if (Number.isFinite(value) && value > 0) return value;
    }
    return 0;
  }

  function readNumber(input) {
    return Number(input?.value) || 0;
  }

  function countIds(ids) {
    const counts = ids.filter(Boolean).reduce((map, id) => {
      map[id] = (map[id] || 0) + 1;
      return map;
    }, {});
    return Object.entries(counts).map(([id, qty]) => ({ id, qty }));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function formatNumber(value) {
    return Math.floor(Number(value) || 0).toLocaleString('ja-JP');
  }

  function formatSignedNumber(value) {
    const num = Math.floor(Number(value) || 0);
    return `${num > 0 ? '+' : ''}${num.toLocaleString('ja-JP')}`;
  }

  function formatPlainNumber(value) {
    const num = Number(value) || 0;
    return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.?0+$/, '');
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY)
      || localStorage.getItem(LEGACY_THEME_KEY)
      || localStorage.getItem('trickcal_stat_theme')
      || 'dark';
    setTheme(saved === 'light' ? 'light' : 'dark');
  }

  function toggleTheme() {
    setTheme(document.body.classList.contains('theme-dark') ? 'light' : 'dark');
  }

  function setTheme(theme, persist = true) {
    document.body.classList.toggle('theme-light', theme === 'light');
    document.body.classList.toggle('theme-dark', theme !== 'light');
    if (el.themeToggle) el.themeToggle.setAttribute('aria-pressed', String(theme !== 'light'));
    if (!persist) return;
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(LEGACY_THEME_KEY, theme);
  }

  function captureCombatScenario(context = buildContext()) {
    const scenarioApi = typeof TRICKCAL_COMBAT_SCENARIO === 'undefined' ? null : TRICKCAL_COMBAT_SCENARIO;
    const target = context.target;
    const enemyMember = context.enemyMember;
    const referenceState = createReferenceStateSnapshot(context);
    const boardState = createBoardComparisonSnapshot(context);
    const source = {
      capturedAt: Date.now(),
      sourceMeta: {
        type: 'live',
        calculatorVersion: 4,
        managerSyncRevision: Math.max(0, Number(context.state?.syncRevision) || 0)
      },
      actors: {
        self: target ? {
          id: target.id || '',
          name: target.name || '',
          position: target.position || '',
          line: target.line,
          personality: target.personality || '',
          role: target.role || '',
          attackType: target.attackType || ''
        } : {},
        enemy: {
          sourceMode: view.enemySourceMode === 'apostle' ? 'apostle' : 'preset',
          id: enemyMember?.id || '',
          name: enemyMember?.name || getSelectedEnemyPreset()?.name || '',
          presetKey: view.enemyPresetKey || ''
        }
      },
      characterState: {
        targetId: target?.id || '',
        enemyApostleId: enemyMember?.id || view.enemyApostleId || '',
        statMode: view.statMode === 'planned' ? 'planned' : 'current',
        boardState,
        gradeOverride: view.gradeOverride || 'saved',
        apostles: referenceState.apostles || {},
        research: referenceState.research || {}
      },
      formationState: {
        presetId: view.formationPresetId || '',
        formation: clonePlain(context.formation || {}),
        tempMembers: clonePlain(view.tempMembers || {})
      },
      cardState: {
        cards: clonePlain(referenceState.cards || {}),
        tempArtifacts: clonePlain(view.tempArtifacts || { formation: {}, target: {} }),
        tempSpells: Array.isArray(view.tempSpells) ? view.tempSpells.slice() : null,
        tempCardStates: sanitizeFdcTempCardStates(view.tempCardStates)
      },
      battleConditions: {
        perspective: view.perspective === 'enemy' ? 'enemy' : 'self',
        damageType: view.damageType || 'auto',
        resolvedDamageType: context.damageType || '',
        enemyDamageType: view.enemyDamageType || 'auto',
        actionCategory: context.actionCategory || '',
        selectedSkillCategory: view.selectedSkillCategory || '',
        selectedSkillOptionKey: view.selectedSkillOptionKey || '',
        enemySelectedSkillCategory: view.enemySelectedSkillCategory || '',
        enemySourceMode: view.enemySourceMode === 'apostle' ? 'apostle' : 'preset',
        enemyPresetKey: view.enemyPresetKey || '',
        enemyPhaseIndex: Number(view.enemyPhaseIndex) || 0,
        enemySkillIndex: Number.isFinite(Number(view.enemySkillIndex)) ? Number(view.enemySkillIndex) : -1,
        enemyPersonality: view.enemyPersonality || '',
        pvpAffinityEnabled: !!view.pvpAffinityEnabled,
        pvpRank: normalizePvpRank(view.pvpRank),
        inputs: readDamageCalculationInputs()
      },
      effectAssumptions: {
        effectSources: pickBooleanMap(view.effectSources),
        selfSkillEffectEnabled: pickBooleanMap(view.selfSkillEffectEnabled),
        conditionalEffectEnabled: pickBooleanMap(view.conditionalEffectEnabled),
        conditionalEffectStackCounts: pickNumberMap(view.conditionalEffectStackCounts),
        skillLevelOverrides: sanitizeSkillLevelOverrides(view.skillLevelOverrides),
        enemyGlobalPercentEnabled: view.enemyGlobalPercentEnabled !== false,
        enemyGlobalAdditiveEnabled: view.enemyGlobalAdditiveEnabled !== false,
        enemyBoardPresetSelections: clonePlain(view.enemyBoardPresetSelections),
        enemyIndividualOverrides: clonePlain(view.enemyIndividualOverrides),
        enemyRankPreset: normalizeEnemyRankPreset(view.enemyRankPreset),
        enemyResearchPreset: clonePlain(view.enemyResearchPreset)
      }
    };
    const scenario = scenarioApi?.createScenario ? scenarioApi.createScenario(source) : clonePlain(source);
    if (scenarioApi?.fingerprint) scenario.sourceMeta.fingerprint = scenarioApi.fingerprint(scenario);
    return scenario;
  }

  function createBoardComparisonSnapshot(context = buildContext()) {
    const target = context.target;
    if (!target) return {
      selectedMode: view.statMode === 'planned' ? 'planned' : 'current',
      hasPlannedSnapshot: false,
      damageType: context.damageType || '',
      currentStats: {},
      plannedStats: {},
      selectedStats: {}
    };
    const apostleState = context.state?.apostles?.[target.id] || {};
    const basic = getApostle(target.id);
    const currentStats = readMemberStats(apostleState, basic, getEffectiveGradeOverride(), 'current');
    const plannedStats = readMemberStats(apostleState, basic, getEffectiveGradeOverride(), 'planned');
    const selectedMode = view.statMode === 'planned' ? 'planned' : 'current';
    const pickStats = stats => Object.fromEntries([
      'hp',
      'physicalAtk',
      'magicAtk',
      'physicalDef',
      'magicDef',
      'crit',
      'critDmg',
      'critRes',
      'critDmgRes',
      'spRegen',
      'combatPower'
    ].map(key => [key, Number(stats?.[key]) || 0]));
    const normalizedCurrent = pickStats(currentStats);
    const normalizedPlanned = pickStats(plannedStats);
    return {
      selectedMode,
      hasPlannedSnapshot: !!target.hasPlannedSnapshot,
      damageType: context.damageType || '',
      currentStats: normalizedCurrent,
      plannedStats: normalizedPlanned,
      selectedStats: selectedMode === 'planned' ? normalizedPlanned : normalizedCurrent
    };
  }

  function createCurrentSingleActionSnapshot() {
    const context = buildContext();
    return {
      scenario: captureCombatScenario(context),
      result: calculateDamage(context)
    };
  }

  function createDpsPrototypeSnapshot(contextOverride = null) {
    const context = contextOverride || buildContext();
    const scenario = captureCombatScenario(context);
    const target = context.target;
    const apostle = getApostleSkillData(target);
    const selectedSkillOptions = target ? buildFdcApostleSkillOptions(target, context) : [];
    const runtimeManagedEffects = target
      ? getDpsRuntimeManagedSkillEffects(target, context, selectedSkillOptions)
      : [];
    const sharedSkillEffectStates = target
      ? createDpsSharedSkillEffectStates(target, context, runtimeManagedEffects)
      : {};
    const actionDamageData = target
      ? createDpsActionDamageData(selectedSkillOptions, sharedSkillEffectStates, runtimeManagedEffects)
      : { profiles: {}, singleActionProfiles: {}, statusDamageProfiles: {}, audit: {} };
    const runtimeEffects = createDpsRuntimeEffects(actionDamageData.audit, {
      baseSpRegen: Number(target?.stats?.spRegen),
      runtimeManagedEffects,
      apostle,
      target,
      context,
      skillLevels: target ? getFdcEffectiveSkillLevels(target) : {},
      selectedSkillOptions,
      singleActionProfiles: actionDamageData.singleActionProfiles,
      statusReactions: createDpsEnemyStatusReactions()
    });
    return {
      scenario,
      targetId: target?.id || '',
      targetName: target?.name || apostle?.name || '',
      target,
      apostle,
      skillLevels: target ? getFdcEffectiveSkillLevels(target) : {},
      damageType: context.damageType,
      actionCategory: context.actionCategory,
      selectedSkillOptionKey: view.selectedSkillOptionKey,
      boardState: scenario.characterState?.boardState || createBoardComparisonSnapshot(context),
      selectedSkillOptions,
      singleActionProfiles: actionDamageData.singleActionProfiles,
      actionDamageProfiles: actionDamageData.profiles,
      statusDamageProfiles: actionDamageData.statusDamageProfiles,
      actionEffectAudit: actionDamageData.audit,
      effectOwnership: actionDamageData.effectOwnership,
      runtimeEffects,
      currentDamageResult: calculateDamage(context)
    };
  }

  function getDpsRuntimeManagedSkillEffects(target, context, selectedSkillOptions = []) {
    const nonDamageEffects = buildSelfSkillEffectOptions(target, context)
      .filter(isDpsRuntimeManagedSkillEffect)
      .map(option => ({
        key: getFdcSkillEffectCanonicalKey(option.key),
        effectId: option.effectId || '',
        label: option.label || option.valueKind || '時系列効果',
        owner: 'dpsRuntime'
      }));
    const damageEffects = normalizeFdcArray(selectedSkillOptions)
      .filter(option => (
        /^(?:n秒ごと|普通攻撃命中時|生成物命中時|生成物帰還時)$/.test(String(option.triggerType || ''))
        || /リソース(?:スタック|未所持)/.test(String(option.conditionType || ''))
      ))
      .map(option => ({
        key: option.key || option.effectId,
        effectId: option.effectId || '',
        label: option.label || option.kind || '時系列追加ダメージ',
        owner: 'dpsRuntime'
      }));
    return Array.from(new Map([...nonDamageEffects, ...damageEffects]
      .map(item => [item.effectId || item.key, item])).values());
  }

  function createDpsSharedSkillEffectStates(target, context, runtimeManagedEffects = null) {
    const managedKeys = new Set((runtimeManagedEffects || getDpsRuntimeManagedSkillEffects(target, context))
      .map(item => item.key));
    return Object.fromEntries(buildSelfSkillEffectOptions(target, context)
      .filter(option => !option.actionScoped || managedKeys.has(getFdcSkillEffectCanonicalKey(option.key)))
      .map(option => [
        getFdcSkillEffectCanonicalKey(option.key),
        managedKeys.has(getFdcSkillEffectCanonicalKey(option.key)) ? false : isSelfSkillEffectOptionEnabled(option)
      ]));
  }

  function isDpsRuntimeManagedSkillEffect(option = {}) {
    const text = [option.valueKind, option.condition, option.effectTarget, option.label].filter(Boolean).join(' ');
    if (/魔弾/.test(text) && /魔弾所持時|魔弾獲得時/.test(text)) return true;
    if (getDpsStructuredStatusCondition(option)) return true;
    const triggerText = [option.triggerType, option.triggerSourceId, text].filter(Boolean).join(' ');
    const changesDuringBattle = /戦闘開始時|ウェーブ開始時|n秒ごと|n回ごと|使用時|使用後|発動時|終了時|命中時|衝突時|攻撃時|状態付与時|リソース変化時/.test(triggerText);
    return changesDuringBattle && Number(option.durationSeconds) > 0;
  }

  function createDpsActionDamageData(skillOptions = [], sharedSkillEffectStates = {}, runtimeManagedEffects = []) {
    const profiles = {};
    const singleActionProfiles = {};
    const statusDamageProfiles = {};
    const audit = {};
    const actionCategories = {
      basicAttack: '基本攻撃',
      enhancedAttack: '強化攻撃',
      lowSkill: '低学年スキル',
      highSkill: '高学年スキル'
    };
    Object.entries(actionCategories).forEach(([actionKey, actionCategory]) => {
      const actionContext = buildContext({
        actionCategory,
        detached: true,
        skillEffectStateOverrides: sharedSkillEffectStates
      });
      actionContext.ignoreEnemyStatusTakenDamageWeakness = true;
      audit[actionKey] = createDpsActionEffectAudit(actionContext);
    });
    skillOptions.forEach(option => {
      const actionKey = getDpsActionKeyForSkillOption(option);
      const actionContext = buildContext({
        actionCategory: option.category || option.sourceCategory || '',
        detached: true,
        skillEffectStateOverrides: sharedSkillEffectStates
      });
      actionContext.ignoreEnemyStatusTakenDamageWeakness = true;
      actionContext.selectedSkillOption = option;
      const damage = calculateDamage(actionContext);
      if (option.key) {
        singleActionProfiles[option.key] = {
          optionKey: option.key,
          effectId: option.effectId || '',
          category: option.category || '',
          sourceCategory: option.sourceCategory || '',
          kind: option.kind || '',
          damageResult: createComparableDamageResult(damage)
        };
      }
      if (runtimeManagedEffects.some(item => item.effectId && item.effectId === option.effectId)) return;
      const status = String(option.sourceCategory || '').split('::')[1] || '';
      if (status && Object.prototype.hasOwnProperty.call(FDC_STATUS_SKILL_MULTIPLIERS, status)) {
        statusDamageProfiles[status] = {
          status,
          multiplier: Number(option.value) || FDC_STATUS_SKILL_MULTIPLIERS[status],
          expectedDamage: Math.max(0, Number(damage.expected) || 0),
          damageResult: createComparableDamageResult(damage)
        };
      }
      if (!actionKey) return;
      const branch = getDpsSkillOptionBranch(option);
      const variantKey = branch || 'default';
      const profile = profiles[actionKey] || (profiles[actionKey] = {
        actionKey,
        variants: {},
        assumptions: ['戦闘中に変化しない効果として評価'],
        runtimeManagedEffectIds: unique(runtimeManagedEffects.map(item => item.effectId).filter(Boolean))
      });
      const variant = profile.variants[variantKey] || (profile.variants[variantKey] = {
        branch,
        effects: {},
        totalExpectedDamage: 0
      });
      const effectKey = option.effectId || option.key;
      const expectedDamage = Math.max(0, Number(damage.expected) || 0);
      variant.effects[effectKey] = {
        effectId: option.effectId || '',
        optionKey: option.key,
        label: option.label,
        valueKind: option.kind || option.valueKind || '',
        multiplier: Number(option.value) || 0,
        expectedDamage,
        damageResult: createComparableDamageResult(damage)
      };
      variant.totalExpectedDamage += expectedDamage;
    });
    return {
      profiles,
      singleActionProfiles,
      statusDamageProfiles,
      audit,
      effectOwnership: {
        singleAction: '常時効果と行動固有効果を単発ダメージへ適用',
        dpsRuntime: '戦闘中に増減する効果を時系列で適用',
        runtimeManagedEffects
      }
    };
  }

  function createDpsEnemyStatusReactions() {
    if (view.enemySourceMode === 'apostle') return [];
    const weakness = getSelectedEnemyPreset()?.weakness?.statusTakenDamage;
    const status = String(weakness?.status || '').trim();
    const takenDmgP = Math.max(0, Number(weakness?.add) || 0);
    if (!status || !takenDmgP) return [];
    return [{
      id: `enemy-weakness:${view.enemyPresetKey || 'preset'}:${status}`,
      label: `${status}状態時の敵被ダメージ増加`,
      status,
      takenDmgP,
      perStack: false,
      maxStacks: 1
    }];
  }

  function getDpsStructuredTriggerText(effect = {}) {
    return [effect.triggerType, effect.triggerValue, effect.triggerSourceId]
      .filter(value => value !== '' && value != null)
      .join(' ');
  }

  function getDpsStructuredTriggerActionKeys(effect = {}, fallbackText = '') {
    const text = [getDpsStructuredTriggerText(effect), fallbackText].filter(Boolean).join(' ');
    const result = [];
    if (/低学年/.test(text)) result.push('lowSkill');
    if (/高学年/.test(text)) result.push('highSkill');
    if (/強化攻撃|普通攻撃_強化/.test(text)) result.push('enhancedAttack');
    if (/基本攻撃|普通攻撃_基本/.test(text)) result.push('basicAttack');
    if (/(?:通常|普通)攻撃/.test(text) && !/普通攻撃_(?:基本|強化)/.test(text)) {
      result.push('basicAttack', 'enhancedAttack');
    }
    if (!result.length && /(?:^|\s)スキル(?:使用|発動|終了|命中|効果|$)/.test(text)) {
      result.push('lowSkill', 'highSkill');
    }
    const sourceId = String(effect.triggerSourceId || '');
    if (/(?:^|_)low(?:_|$)/i.test(sourceId)) result.push('lowSkill');
    if (/(?:^|_)high(?:_|$)/i.test(sourceId)) result.push('highSkill');
    if (/(?:^|_)basic(?:_|$)/i.test(sourceId)) result.push('basicAttack');
    if (/(?:^|_)enhanced(?:_|$)/i.test(sourceId)) result.push('enhancedAttack');
    return unique(result);
  }

  function getDpsStructuredIntervalSeconds(effect = {}, fallbackText = '') {
    if (String(effect.triggerType || '') === 'n秒ごと') {
      const value = Number(effect.triggerValue);
      if (Number.isFinite(value) && value > 0) return value;
    }
    const value = Number(String(fallbackText || '').match(/(\d+(?:\.\d+)?)\s*秒ごと/)?.[1]);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function getDpsStructuredTriggerCount(effect = {}, fallbackText = '') {
    if (String(effect.triggerType || '') === 'n回ごと') {
      const value = Number(effect.triggerValue);
      if (Number.isFinite(value) && value > 0) return Math.max(1, Math.floor(value));
    }
    const value = Number(String(fallbackText || '').match(/(\d+)\s*回(?:目|ごと)/)?.[1]);
    return Number.isFinite(value) && value > 0 ? Math.max(1, Math.floor(value)) : 0;
  }

  function getDpsStructuredTriggerPhase(effect = {}, fallbackText = '') {
    const text = [effect.triggerType, fallbackText].filter(Boolean).join(' ');
    return /使用後|終了時|終了後/.test(text) ? 'end' : 'start';
  }

  function usesDpsSourceEffectOccurrence(effect = {}) {
    const sourceId = String(effect.triggerSourceId || '').trim();
    const triggerType = String(effect.triggerType || '').trim();
    if (!/_e\d+$/i.test(sourceId)) return false;
    // The source row identifies the occurrence point only for these triggers.
    // A shield/status "end" points at the row that created it, so firing when
    // that row occurs would be semantically wrong and remains action fallback.
    return /(?:効果発生(?:時|後)|命中時|衝突時|接触時|到着時|帰還時|生成物生成時|生成物消滅時|状態付与時|固有状態付与時|回復時)$/.test(triggerType);
  }

  function getDpsStructuredStatusCondition(effect = {}) {
    const conditionType = String(effect.conditionType || '').trim();
    if (!['対象状態', '攻撃対象状態'].includes(conditionType)) return null;
    const conditionValue = String(effect.conditionValue || '').trim();
    const status = conditionValue.split(/[\/／]/)[0].trim();
    if (!status) return null;
    return {
      conditionType,
      conditionValue,
      status,
      sourceSelf: /(?:^|[\/／])付与者=自身(?:$|[\/／])/.test(conditionValue)
    };
  }

  function createDpsStructuredRuntimeEvents(options = {}) {
    const {
      apostle,
      target,
      context,
      skillLevels = {},
      selectedSkillOptions = [],
      singleActionProfiles = {}
    } = options;
    if (!apostle || !target || !context) return { eventEffects: [], resources: [] };
    const selectedByEffectId = new Map(normalizeFdcArray(selectedSkillOptions)
      .filter(option => option.effectId)
      .map(option => [option.effectId, option]));
    const resources = new Map();
    const groups = new Map();
    collectFdcApostleSkillSources(apostle, skillLevels, target, context)
      .forEach(({ skill, sourceKey, sourceLabel }) => {
        const category = getFdcApostleSkillCategory(skill, sourceLabel);
        const skillLevel = getFdcSkillLevelForCategory(skillLevels, category);
        normalizeFdcArray(skill.effects).forEach(effect => {
          const triggerType = String(effect.triggerType || '');
          if (!/^(?:n秒ごと|普通攻撃命中時|生成物命中時|生成物帰還時)$/.test(triggerType)) return;
          const groupId = effect.processGroupId || effect.effectId;
          if (!groupId) return;
          const key = `${sourceKey}:${groupId}`;
          const group = groups.get(key) || {
            id: key,
            label: [sourceLabel, groupId].filter(Boolean).join(' / '),
            sourceLabel,
            triggerType,
            triggerValue: effect.triggerValue ?? '',
            triggerSourceId: effect.triggerSourceId || '',
            triggerActionKeys: triggerType === '普通攻撃命中時'
              ? ['basicAttack', 'enhancedAttack']
              : [],
            intervalFrames: triggerType === 'n秒ごと'
              ? Math.max(0, Number(effect.triggerValue) || 0) * 60
              : 0,
            oncePerAction: triggerType === '普通攻撃命中時',
            conditionResource: null,
            steps: []
          };
          const conditionType = String(effect.conditionType || '');
          const conditionValue = String(effect.conditionValue || '');
          if (/^リソース(?:未所持|スタック)/.test(conditionType)) {
            const [resourceId, amountText] = conditionValue.split(':');
            if (resourceId) {
              group.conditionResource = conditionType === 'リソース未所持'
                ? { id: resourceId, max: 0 }
                : { id: resourceId, min: Math.max(1, Number(amountText) || 1) };
            }
          }
          const valueKind = String(effect.valueKind || '');
          const value = Number(getFdcEffectLevelInfo(effect, skillLevel)?.value) || 0;
          const resourceMatch = valueKind.match(/^(.+?)(獲得|消費)$/);
          if (resourceMatch) {
            const resourceId = resourceMatch[1];
            const resource = resources.get(resourceId) || {
              id: resourceId,
              name: resourceId,
              initialStacks: 0,
              maxStacks: 1
            };
            resource.maxStacks = Math.max(resource.maxStacks, Number(effect.maxStack) || 1);
            resources.set(resourceId, resource);
            group.steps.push({
              type: 'resource',
              order: Number(effect.processOrder) || 0,
              resourceId,
              operation: resourceMatch[2] === '獲得' ? 'gain' : 'consume',
              amount: Math.max(1, value || 1)
            });
          } else if (isFdcApostleAttackMultiplierEffect(effect)) {
            const selected = selectedByEffectId.get(effect.effectId);
            const profile = selected ? singleActionProfiles[selected.key] : null;
            group.steps.push({
              type: 'damage',
              order: Number(effect.processOrder) || 0,
              effectId: effect.effectId || '',
              label: effect.valueKind || '追加ダメージ',
              expectedDamage: Math.max(0, Number(profile?.damageResult?.expected) || 0),
              runtimeBase: profile?.damageResult?.runtimeBase || null
            });
          } else if (effect.valueClass === '状態付与') {
            const durationEffect = normalizeFdcArray(skill.effects).find(item => (
              item.processGroupId === effect.processGroupId
              && item.valueClass === '持続時間'
              && item.valueKind === effect.valueKind
            ));
            const duration = Number(getFdcEffectLevelInfo(durationEffect, skillLevel)?.value) || 0;
            const status = String(effect.valueKind || '');
            const dealsPeriodicDamage = Object.prototype.hasOwnProperty.call(FDC_STATUS_SKILL_MULTIPLIERS, status);
            const hasExplicitStackSetting = effect.effectStack === true || durationEffect?.effectStack === true;
            group.steps.push({
              type: 'status',
              order: Number(effect.processOrder) || 0,
              application: {
                status,
                applicationEffectId: effect.effectId || '',
                durationEffectId: durationEffect?.effectId || '',
                durationFrames: duration * 60,
                stackable: dealsPeriodicDamage
                  ? effect.effectStack !== false && durationEffect?.effectStack !== false
                  : hasExplicitStackSetting,
                maxStacks: Math.max(1, Number(effect.maxStack ?? durationEffect?.maxStack) || (dealsPeriodicDamage ? 9 : 1)),
                stackGroupId: effect.processGroupId || `${status}:runtime`,
                dealsPeriodicDamage,
                tickFrames: dealsPeriodicDamage ? 60 : 0,
                tickMultiplier: Number(FDC_STATUS_SKILL_MULTIPLIERS[status]) || 0
              }
            });
          } else if (/HP回復/.test(valueKind) && effect.effectType === '回復') {
            group.steps.push({
              type: 'healing',
              order: Number(effect.processOrder) || 0,
              effectId: effect.effectId || '',
              label: valueKind,
              value,
              reference: effect.reference || ''
            });
          }
          groups.set(key, group);
        });
      });
    const eventEffects = Array.from(groups.values())
      .map(group => {
        const steps = group.steps.slice().sort((a, b) => a.order - b.order);
        const effectLabels = Array.from(new Set(steps.map(step => (
          step.type === 'damage' ? step.label
            : step.type === 'status' ? step.application?.status
              : step.type === 'healing' ? step.label
                : ''
        )).filter(Boolean)));
        return {
          ...group,
          label: [group.sourceLabel, effectLabels.join('・') || group.id].filter(Boolean).join(' / '),
          steps
        };
      })
      .filter(group => group.steps.length && (group.intervalFrames > 0 || group.triggerSourceId || group.triggerActionKeys.length));
    return { eventEffects, resources: Array.from(resources.values()) };
  }

  function createDpsRuntimeEffects(audit = {}, options = {}) {
    const actionEntries = Object.entries(audit || {});
    const grouped = new Map();
    actionEntries.forEach(([actionKey, actionAudit]) => {
      normalizeArray(actionAudit?.rows).forEach(row => {
        const hasteP = Number(row?.bonuses?.hasteP) || 0;
        if (!hasteP || row.manualDisabled) return;
        const runtimeText = [row.rawText, row.condition, row.reason, row.label, row.category]
          .filter(Boolean).join(' ');
        const hasDeterministicRuntimeTrigger = /戦闘開始時|ウェーブ開始時|\d+(?:\.\d+)?\s*秒ごと|使用時|使用後|発動時|終了時|命中時|衝突時|攻撃時|\d+\s*回ごと/.test(runtimeText);
        if (!row.enabled && !hasDeterministicRuntimeTrigger) return;
        const durationFrames = Math.max(0, Number(row.durationSeconds) || 0) * 60;
        const sourceId = row.sourceId || row.cardId || row.source || 'effect';
        // One buff can be represented by separate low/high trigger rows in the sheet.
        // When the shared description explicitly names both actions, keep one runtime
        // instance so either action refreshes the duration instead of stacking twice.
        const sharesLowHighTrigger = !row.stackable
          && /低学年/.test(runtimeText)
          && /高学年/.test(runtimeText)
          && /使用時|使用後|発動時|終了時/.test(runtimeText);
        const key = sharesLowHighTrigger
          ? `${sourceId}:shared-low-high-haste:${row.label || ''}:${hasteP}:${durationFrames}`
          : row.effectId
          ? `${row.sourceId || row.cardId || row.source || 'effect'}:${row.effectId}`
          : row.key || `${row.label}:${hasteP}`;
        const item = grouped.get(key) || {
          id: row.effectId || key,
          sourceId: sourceId === 'effect' ? '' : sourceId,
          label: row.label || '攻撃速度効果',
          hasteP,
          condition: row.condition || '',
          triggerType: row.triggerType || '',
          triggerValue: row.triggerValue ?? '',
          triggerSourceId: row.triggerSourceId || '',
          conditionType: row.conditionType || '',
          conditionValue: row.conditionValue ?? '',
          category: row.category || row.source || '',
          runtimeText,
          durationFrames,
          stackable: !!row.stackable,
          maxStacks: Math.max(1, Number(row.stackMax) || 1),
          actionScoped: !!row.actionScoped,
          enabledActions: []
        };
        item.hasteP = Math.max(item.hasteP, hasteP);
        item.durationFrames = Math.max(item.durationFrames, durationFrames);
        item.maxStacks = Math.max(item.maxStacks, Math.max(1, Number(row.stackMax) || 1));
        item.stackable ||= !!row.stackable;
        item.runtimeText = [item.runtimeText, runtimeText].filter(Boolean).join(' ');
        if (row.condition && !String(item.condition).includes(row.condition)) {
          item.condition = [item.condition, row.condition].filter(Boolean).join(' ');
        }
        item.enabledActions.push(actionKey);
        grouped.set(key, item);
      });
    });

    const actionSpeedEffects = Array.from(grouped.values()).map(effect => {
      const text = [effect.runtimeText, effect.condition, effect.label, effect.category].filter(Boolean).join(' ');
      const conditionText = String(effect.condition || '');
      const hasExplicitActionCondition = /低学年|高学年|強化攻撃|(?:基本|普通)攻撃/.test(conditionText);
      const triggerText = hasExplicitActionCondition
        ? conditionText
        : [effect.condition, effect.label, effect.category].filter(Boolean).join(' ');
      const triggerActionKeys = getDpsStructuredTriggerActionKeys(effect, triggerText);
      if (!triggerActionKeys.length) {
        if (/低学年/.test(effect.category)) triggerActionKeys.push('lowSkill');
        else if (/高学年/.test(effect.category)) triggerActionKeys.push('highSkill');
      }
      if (!triggerActionKeys.length && effect.actionScoped && effect.enabledActions.length === 1) {
        triggerActionKeys.push(effect.enabledActions[0]);
      }
      const intervalSeconds = getDpsStructuredIntervalSeconds(effect, text);
      const triggerEveryCount = getDpsStructuredTriggerCount(effect, text);
      const initialTimed = /戦闘開始時|ウェーブ開始時/.test(text);
      let mode = 'constant';
      if (effect.id === 'artifact_dragonlight_sword_e01' || (/1\s*秒ごと/.test(text) && !effect.durationFrames)) mode = 'periodicStack';
      else if (triggerEveryCount > 0) mode = 'attackCountStack';
      else if (intervalSeconds > 0) mode = 'periodicTimed';
      else if (usesDpsSourceEffectOccurrence(effect)) mode = 'sourceEventTimed';
      else if (triggerActionKeys.length) mode = 'actionTimed';
      else if (initialTimed && effect.durationFrames > 0) mode = 'initialTimed';
      else if (effect.durationFrames > 0) mode = 'manualInitialTimed';
      return {
        ...effect,
        mode,
        triggerActionKeys: unique(triggerActionKeys),
        triggerPhase: getDpsStructuredTriggerPhase(effect, text),
        intervalFrames: intervalSeconds > 0 ? intervalSeconds * 60 : (mode === 'periodicStack' ? 60 : 0),
        triggerEveryCount,
        maxStacks: effect.id === 'artifact_tig_blazing_sword_e01' ? 10 : (mode === 'periodicStack' ? 0 : effect.maxStacks),
        stackable: effect.id === 'artifact_tig_blazing_sword_e01' || mode === 'periodicStack' || effect.stackable,
        resetActionKeys: effect.id === 'artifact_dragonlight_sword_e01' ? ['lowSkill'] : [],
        sourceEventFallbackMode: 'actionTimed'
      };
    });
    const damageBuffKeys = new Set([
      'atkP',
      'physicalAtkP',
      'magicAtkP',
      'addP',
      'normalAttackAddP',
      'basicAddP',
      'enhancedAddP',
      'skillAddP',
      'specialP',
      'otherP',
      'critP',
      'critRateP',
      'critDmgP',
      'critDmgAddP',
      'enemyDefDownP',
      'enemyCritResDownP',
      'enemyCritDmgResDownP'
    ]);
    const targetDebuffKeys = new Set([
      'enemyDefDownP',
      'enemyCritResDownP',
      'enemyCritDmgResDownP'
    ]);
    const damageBuffGroups = new Map();
    actionEntries.forEach(([actionKey, actionAudit]) => {
      normalizeArray(actionAudit?.rows).forEach(row => {
        if (row.manualDisabled) return;
        const text = [row.rawText, row.condition, row.reason, row.label, row.category]
          .filter(Boolean).join(' ');
        const isDebuff = /デバフ/.test(String(row.effectType || ''));
        const allowDebuffAddP = /被ダメージ(?:量)?増加|受けるダメージ(?:量)?増加/.test(text);
        const modifiers = Object.fromEntries(Object.entries(row.runtimeBonuses || row.bonuses || {})
          .filter(([key, value]) => (
            damageBuffKeys.has(key)
            && Number(value)
            && (!isDebuff || targetDebuffKeys.has(key) || (key === 'addP' && allowDebuffAddP))
          ))
          .map(([key, value]) => [key, Number(value)]));
        const baselineModifiers = Object.fromEntries(Object.entries(row.bonuses || {})
          .filter(([key, value]) => Object.prototype.hasOwnProperty.call(modifiers, key) && Number(value))
          .map(([key, value]) => [key, Number(value)]));
        if (!Object.keys(modifiers).length) return;
        const statusCondition = getDpsStructuredStatusCondition(row);
        const structuredActionKeys = getDpsStructuredTriggerActionKeys(row, text);
        const triggerText = [row.triggerType, row.triggerSourceId, text].filter(Boolean).join(' ');
        const initialTrigger = /戦闘開始時|ウェーブ開始時/.test(triggerText);
        const actionTrigger = structuredActionKeys.length > 0
          || /使用時|使用後|発動時|終了時|命中(?:時|するたび|する度|すると)|衝突時|攻撃時/.test(triggerText);
        if (!initialTrigger && !actionTrigger && !statusCondition) return;
        const durationFrames = Math.max(0, Number(row.durationSeconds) || 0) * 60;
        // 終了条件がない効果は永続・状態切替・記載漏れを区別できないため、
        // 現段階では静的評価のままにして時限バフへ推測変換しない。
        if (!statusCondition && !(durationFrames > 0)) return;
        const triggerActionKeys = [...structuredActionKeys];
        if (actionTrigger && !triggerActionKeys.length && /低学年/.test(row.category || '')) triggerActionKeys.push('lowSkill');
        if (actionTrigger && !triggerActionKeys.length && /高学年/.test(row.category || '')) triggerActionKeys.push('highSkill');
        if (actionTrigger && !triggerActionKeys.length && row.actionScoped) triggerActionKeys.push(actionKey);
        if (actionTrigger && !triggerActionKeys.length) return;
        const sourceId = row.sourceId || row.cardId || row.source || 'effect';
        const key = row.effectId
          ? `${sourceId}:${row.effectId}`
          : row.key || `${sourceId}:${row.label || 'damageBuff'}`;
        const effect = damageBuffGroups.get(key) || {
          id: row.effectId || key,
          sourceId: sourceId === 'effect' ? '' : sourceId,
          label: row.label || '時限ダメージバフ',
          mode: statusCondition
            ? 'conditionalStatus'
            : (initialTrigger
              ? 'initialTimed'
              : (usesDpsSourceEffectOccurrence(row)
                ? 'sourceEventTimed'
                : (/命中(?:時|するたび|する度|すると)|衝突時/.test(triggerText) ? 'actionHitTimed' : 'actionTimed'))),
          triggerActionKeys: [],
          triggerPhase: getDpsStructuredTriggerPhase(row, triggerText),
          processGroupId: row.processGroupId || '',
          triggerType: row.triggerType || '',
          triggerValue: row.triggerValue ?? '',
          triggerSourceId: row.triggerSourceId || '',
          conditionType: statusCondition?.conditionType || row.conditionType || '',
          conditionValue: statusCondition?.conditionValue || row.conditionValue || '',
          requiredStatus: statusCondition?.status || '',
          requireSelfSource: !!statusCondition?.sourceSelf,
          durationFrames,
          stackable: !!row.stackable,
          maxStacks: Math.max(1, Number(row.stackMax) || 1),
          oncePerAction: /同じ対象に一度|一度だけ/.test(text),
          sourceEventFallbackMode: /命中(?:時|するたび|する度|すると)|衝突時/.test(triggerText)
            ? 'actionHitTimed'
            : 'actionTimed',
          modifiers: {},
          baselineModifiersByAction: {}
        };
        Object.entries(modifiers).forEach(([modifierKey, value]) => {
          const current = Number(effect.modifiers[modifierKey]) || 0;
          effect.modifiers[modifierKey] = Math.abs(value) > Math.abs(current) ? value : current;
          if (row.enabled) {
            const baseline = effect.baselineModifiersByAction[actionKey] || (effect.baselineModifiersByAction[actionKey] = {});
            baseline[modifierKey] = baselineModifiers[modifierKey] ?? value;
          }
        });
        effect.triggerActionKeys.push(...triggerActionKeys);
        effect.durationFrames = Math.max(effect.durationFrames, durationFrames);
        effect.maxStacks = Math.max(effect.maxStacks, Math.max(1, Number(row.stackMax) || 1));
        effect.stackable ||= !!row.stackable;
        effect.oncePerAction ||= /同じ対象に一度|一度だけ/.test(text);
        damageBuffGroups.set(key, effect);
      });
    });
    const damageBuffEffects = Array.from(damageBuffGroups.values()).map(effect => ({
      ...effect,
      triggerActionKeys: unique(effect.triggerActionKeys)
    }));
    const initialTargetStatuses = unique(damageBuffEffects
      .filter(effect => (
        effect.mode === 'conditionalStatus'
        && effect.conditionType === '攻撃対象状態'
        && effect.requiredStatus
        && effect.requireSelfSource
      ))
      .map(effect => effect.requiredStatus))
      .map(status => ({
        status,
        sourceSelf: true,
        reason: '現在の攻撃対象へ付与する固有状態'
      }));
    const spRows = new Map();
    actionEntries.forEach(([actionKey, actionAudit]) => {
      normalizeArray(actionAudit?.rows).forEach(row => {
        const hasSp = ['initialSp', 'initialSpP', 'spRegen', 'spRegenP', 'spRecovery', 'spRecoveryP']
          .some(key => Number(row?.bonuses?.[key]));
        if (!hasSp || row.manualDisabled) return;
        const runtimeText = [row.rawText, row.condition, row.reason, row.label, row.category]
          .filter(Boolean).join(' ');
        const hasDeterministicRuntimeTrigger = /戦闘開始時|ウェーブ開始時|カード選択時|\d+(?:\.\d+)?\s*秒ごと|使用時|使用後|発動時|命中時|衝突時|攻撃時|強化攻撃|普通攻撃_強化|低学年|高学年/.test(runtimeText);
        if (!row.enabled && !hasDeterministicRuntimeTrigger) return;
        const key = row.key || [row.sourceId, row.effectId, row.label].filter(Boolean).join(':');
        const item = spRows.get(key) || {
          ...row,
          enabledActions: []
        };
        item.enabledActions.push(actionKey);
        spRows.set(key, item);
      });
    });

    // 同効果非スタックは対象使徒に届いた候補のうち1件だけを採用する。
    // それ以外は、同列に別使徒から届く同じ効果も別ソースとして残して加算する。
    const acceptedSpRows = [];
    const nonStackingGroups = new Set();
    spRows.forEach(row => {
      const groupKey = row.overlapStackKey || `${row.sourceId || row.cardId || ''}:${row.effectId || ''}`;
      if (row.nonStackingSameEffect && nonStackingGroups.has(groupKey)) return;
      if (row.nonStackingSameEffect) nonStackingGroups.add(groupKey);
      acceptedSpRows.push(row);
    });

    const spRegenEffects = acceptedSpRows.filter(row => (
      Number(row?.bonuses?.spRegen) || Number(row?.bonuses?.spRegenP)
    )).map(row => ({
      id: row.key,
      sourceId: row.sourceId || row.cardId || '',
      label: row.label || '毎秒SP回復効果',
      fixed: Number(row.bonuses.spRegen) || 0,
      percent: Number(row.bonuses.spRegenP) || 0
    }));

    const initialSpEffects = acceptedSpRows.filter(row => (
      Number(row?.bonuses?.initialSp) || Number(row?.bonuses?.initialSpP)
    )).map(row => ({
      id: row.key,
      sourceId: row.sourceId || row.cardId || '',
      label: row.label || '初期SP効果',
      mode: 'initial',
      fixed: Number(row.bonuses.initialSp) || 0,
      percent: Number(row.bonuses.initialSpP) || 0
    }));

    const rawSpRecoveryEffects = acceptedSpRows.filter(row => (
      Number(row?.bonuses?.spRecovery) || Number(row?.bonuses?.spRecoveryP)
    )).map(row => {
      const text = [row.rawText, row.condition, row.reason, row.label, row.category]
        .filter(Boolean).join(' ');
      const interval = getDpsStructuredIntervalSeconds(row, text);
      const count = getDpsStructuredTriggerCount(row, text);
      const categoryActions = getDpsStructuredTriggerActionKeys(row, text);
      let triggerActionKeys = unique(categoryActions);
      if (!triggerActionKeys.length) {
        const enabled = unique(row.enabledActions || []);
        if (enabled.length && enabled.length < 4) triggerActionKeys = enabled;
      }
      let mode = 'manualInitial';
      if (/戦闘開始時|ウェーブ開始時/.test(text)) mode = 'initial';
      else if (interval > 0 && !triggerActionKeys.length) mode = 'periodic';
      else if (interval > 0 && triggerActionKeys.length) mode = 'actionPeriodic';
      else if (/カード選択時/.test(text)) mode = 'manualInitial';
      else if (usesDpsSourceEffectOccurrence(row)) mode = 'sourceEvent';
      else if (triggerActionKeys.length && /命中|衝突|攻撃時/.test(text)) mode = 'actionHit';
      else if (triggerActionKeys.length && /使用時|発動時|使用後|終了時/.test(text)) mode = 'action';
      else if (triggerActionKeys.length) mode = row.cardId ? 'action' : 'actionHit';
      const countAppliesToSelectedActions = !(triggerActionKeys.length === 1 && triggerActionKeys[0] === 'enhancedAttack');
      return {
        id: row.key,
        sourceId: row.sourceId || row.cardId || '',
        effectId: row.effectId || '',
        triggerSourceId: row.triggerSourceId || '',
        label: row.label || 'SP回復効果',
        mode,
        fixed: Number(row.bonuses.spRecovery) || 0,
        percent: Number(row.bonuses.spRecoveryP) || 0,
        durationFrames: Math.max(0, Number(row.durationSeconds) || 0) * 60,
        intervalFrames: interval > 0 ? interval * 60 : 0,
        triggerEveryCount: countAppliesToSelectedActions && count > 0 ? count : 0,
        triggerActionKeys,
        triggerPhase: getDpsStructuredTriggerPhase(row, text),
        oncePerAction: /同じ対象に一度|一度だけ/.test(text) || (!row.cardId && mode === 'actionHit'),
        sourceEventFallbackMode: /命中|衝突|攻撃時/.test(text) ? 'actionHit' : 'action',
        randomBound: /ランダム最低値/.test(text) ? 'min' : (/ランダム最大値/.test(text) ? 'max' : ''),
        randomGroupKey: /ランダム(?:最低値|最大値)/.test(text)
          ? [row.sourceId || row.cardId || row.source || '', interval || 0, 'spRecovery'].join(':')
          : ''
      };
    });

    const randomSpGroups = new Map();
    const spRecoveryEffects = [];
    rawSpRecoveryEffects.forEach(effect => {
      if (!effect.randomGroupKey) {
        spRecoveryEffects.push(effect);
        return;
      }
      const group = randomSpGroups.get(effect.randomGroupKey) || {};
      group[effect.randomBound] = effect;
      randomSpGroups.set(effect.randomGroupKey, group);
    });
    randomSpGroups.forEach((group, key) => {
      const minimum = group.min || group.max;
      const maximum = group.max || group.min;
      if (!minimum || !maximum) return;
      spRecoveryEffects.push({
        ...minimum,
        id: `random:${key}`,
        label: String(minimum.label || maximum.label || 'ランダムSP回復').replace(/ランダム最低値\s*/, 'ランダム '),
        fixedMin: Math.min(minimum.fixed, maximum.fixed),
        fixedMax: Math.max(minimum.fixed, maximum.fixed),
        percentMin: Math.min(minimum.percent, maximum.percent),
        percentMax: Math.max(minimum.percent, maximum.percent),
        randomBound: 'range'
      });
    });

    const structuredRuntime = createDpsStructuredRuntimeEvents(options);
    return {
      attackSpeedEffects: actionSpeedEffects,
      periodicAttackSpeedStacks: [],
      baseSpRegen: Number.isFinite(Number(options.baseSpRegen)) ? Number(options.baseSpRegen) : null,
      damageEffectIds: unique(normalizeArray(options.runtimeManagedEffects)
        .map(item => item.effectId)
        .filter(Boolean)),
      damageBuffEffects,
      initialTargetStatuses,
      statusReactions: normalizeArray(options.statusReactions),
      spRegenEffects,
      spRecoveryEffects: [...initialSpEffects, ...spRecoveryEffects],
      eventEffects: structuredRuntime.eventEffects,
      resources: structuredRuntime.resources
    };
  }

  function createComparableDamageResult(result = {}) {
    return {
      normal: Number(result.normal) || 0,
      crit: Number(result.crit) || 0,
      expected: Number(result.expected) || 0,
      hp: Number(result.hp) || 0,
      critRate: Number(result.critRate) || 0,
      defRate: Number(result.defRate) || 0,
      critMult: Number(result.detail?.stats?.critMult) || 0,
      runtimeBase: {
        baseAtk: Number(result.detail?.stats?.baseAtk) || 0,
        baseDef: Number(result.detail?.stats?.baseDef) || 1,
        finalAtk: Number(result.detail?.stats?.finalAtk) || 0,
        finalDef: Number(result.detail?.stats?.finalDef) || 1,
        defRate: Number(result.defRate) || 0,
        damageType: String(result.detail?.stats?.damageType || ''),
        attackP: Number(result.detail?.mods?.attackP) || 0,
        defenseP: Number(result.detail?.mods?.defenseP) || 0,
        rawAddRate: Number(result.detail?.mods?.rawAddRate) || Number(result.detail?.mods?.addRate) || 1,
        addRate: Number(result.detail?.mods?.addRate) || 1,
        specialP: Number(result.detail?.mods?.specialP) || 100,
        otherP: Number(result.detail?.mods?.otherP) || 100,
        baseCrit: Number(result.detail?.stats?.baseCrit) || 0,
        baseCritDmg: Number(result.detail?.stats?.baseCritDmg) || 0,
        baseCritRes: Number(result.detail?.stats?.baseCritRes) || 1,
        baseCritDmgRes: Number(result.detail?.stats?.baseCritDmgRes) || 1,
        finalCritRes: Number(result.detail?.stats?.finalCritRes) || 1,
        finalCritDmgRes: Number(result.detail?.stats?.finalCritDmgRes) || 1,
        critP: Number(result.detail?.mods?.critP) || 0,
        critRateP: Number(result.detail?.mods?.critRateP) || 0,
        critDmgP: Number(result.detail?.mods?.critDmgP) || 0,
        critResP: Number(result.detail?.mods?.critResP) || 0,
        critDmgResP: Number(result.detail?.mods?.critDmgResP) || 0,
        critDmgAddP: Number(result.detail?.mods?.critDmgAddP) || 0,
        critResAddP: Number(result.detail?.mods?.critResAddP) || 0,
        critDmgResAddP: Number(result.detail?.mods?.critDmgResAddP) || 0,
        critRate: Number(result.critRate) || 0,
        critMult: Number(result.detail?.stats?.critMult) || 1,
        damageReference: result.detail?.stats?.damageReference || ''
      }
    };
  }

  function createDpsActionEffectAudit(context) {
    const rows = new Map();
    const add = item => {
      if (!item?.key || !item.label) return;
      rows.set(item.key, item);
    };
    buildSelfSkillEffectOptions(context.target, context)
      .filter(option => isBonusMapRelevantToPerspective(option.bonuses))
      .forEach(option => {
        const enabled = isSelfSkillEffectOptionEnabled(option, context.skillEffectStateOverrides);
        const manualState = getSelfSkillEffectManualState(option);
        const keyParts = String(option.key || '').split(':');
        keyParts.pop();
        const bonuses = getRelevantBonusMap(getSkillEffectOptionBonuses(option));
        add({
          key: `skill:${keyParts.join(':')}`,
          effectId: option.effectId || '',
          sourceId: option.sourceId || '',
          label: option.label,
          source: option.group === 'formation' ? '編成スキル' : option.category || '本人スキル',
          category: option.category || '',
          effectType: option.effectType || '',
          condition: option.condition || '',
          processGroupId: option.processGroupId || '',
          processOrder: Number(option.processOrder) || 0,
          triggerType: option.triggerType || '',
          triggerValue: option.triggerValue ?? '',
          triggerSourceId: option.triggerSourceId || '',
          conditionType: option.conditionType || '',
          conditionValue: option.conditionValue ?? '',
          rawText: [option.valueKind, getFdcStructuredEffectConditionText(option), option.condition, option.detailText, option.label, option.category]
            .filter(Boolean).join(' '),
          effectTarget: option.effectTarget || '',
          durationSeconds: Math.max(0, Number(option.durationSeconds) || 0),
          actionScoped: !!option.actionScoped,
          stackMax: Math.max(1, Number(option.stackMax) || 1),
          stackable: Number(option.stackMax) > 1,
          value: formatBonusMap(bonuses),
          bonuses,
          runtimeBonuses: getRelevantBonusMap(option.bonuses || {}),
          enabled,
          manualDisabled: manualState === false,
          reason: enabled
            ? [manualState === true ? '手動ON' : '自動ON', option.condition, option.effectTarget].filter(Boolean).join(' / ')
            : [manualState === false ? '手動OFF' : '条件不一致', option.condition || getSkillEffectConditionSummary(option), option.effectTarget].filter(Boolean).join(' / ')
        });
      });

    const effectRows = [
      ...(context.effects?.applied || []),
      ...(context.effects?.globalStats || []),
      ...(context.effects?.conditional || [])
    ].filter(row => !hasAnySourceTag(row, ['スキル/アサイド']))
      .filter(isEffectRelevantToPerspective);
    effectRows.forEach(row => {
      const sourceEnabled = isEffectSourceEnabled(row);
      const toggleEnabled = !row.canToggle || isConditionalEffectEnabled(row.conditionKey, row.defaultEnabled);
      const enabled = sourceEnabled && toggleEnabled
        && (context.effects.applied.includes(row) || context.effects.globalStats.includes(row) || row.canToggle);
      const key = row.conditionKey
        ? `effect:${row.conditionKey}`
        : `effect:${[row.source, row.cardId, row.effectId, row.cardName, row.label].filter(Boolean).join(':')}`;
      const bonuses = getRelevantBonusMap(row.bonuses || {});
      add({
        key,
        cardId: row.cardId || '',
        effectId: row.effectId || '',
        sourceId: row.cardId || row.source || '',
        label: [row.cardName, row.label].filter(Boolean).join(' / ') || row.source || '効果',
        source: row.source || '補正',
        category: row.cardId ? 'カード' : row.source || '',
        effectType: row.effectType || '',
        condition: row.condition || row.triggerCondition || row.label || row.reason || '',
        processGroupId: row.processGroupId || '',
        processOrder: Number(row.processOrder) || 0,
        triggerType: row.triggerType || '',
        triggerValue: row.triggerValue ?? '',
        triggerSourceId: row.triggerSourceId || '',
        conditionType: row.conditionType || '',
        conditionValue: row.conditionValue ?? '',
        effectTarget: row.effectTarget || row.scopeLabel || '',
        durationSeconds: Math.max(0, Number(row.durationSeconds ?? row.duration) || 0),
        actionScoped: false,
        stackMax: Math.max(1, Number(row.maxStack) || Number(row.bonuses?.maxStack) || 1),
        stackable: Number(row.maxStack) > 1 || Number(row.bonuses?.maxStack) > 1,
        overlapStackKey: row.overlapStackKey || '',
        overlapCount: Math.max(1, Number(row.overlapCount) || 1),
        nonStackingSameEffect: !!row.nonStackingSameEffect,
        rawText: [row.effectText, row.condition, row.triggerCondition, row.label, row.reason]
          .filter(Boolean).join(' '),
        value: formatBonusMap(bonuses),
        bonuses,
        enabled,
        manualDisabled: !sourceEnabled || (row.canToggle && !toggleEnabled),
        reason: enabled
          ? [row.canToggle ? 'ON' : '自動適用', row.reason].filter(Boolean).join(' / ')
          : [!sourceEnabled ? '補正カテゴリOFF' : 'OFF', row.reason].filter(Boolean).join(' / ')
      });
    });
    return {
      actionCategory: context.actionCategory || '',
      rows: Array.from(rows.values())
    };
  }

  function getDpsActionKeyForSkillOption(option = {}) {
    // The source skill determines which timeline action owns the damage.
    // attackCategory is still used by calculateDamage to apply action-scoped
    // effects, but it must not move a summoned/basic-classified hit out of the
    // low/high skill that created it (Momo's clones are the representative case).
    const sourceCategories = getFdcActionCategories(option.sourceCategory || '');
    if (sourceCategories.includes('基本攻撃')) return 'basicAttack';
    if (sourceCategories.includes('強化攻撃')) return 'enhancedAttack';
    if (sourceCategories.includes('低学年スキル')) return 'lowSkill';
    if (sourceCategories.includes('高学年スキル')) return 'highSkill';
    const categories = getFdcActionCategories(option.attackCategory || option.category || '');
    if (categories.includes('基本攻撃')) return 'basicAttack';
    if (categories.includes('強化攻撃')) return 'enhancedAttack';
    if (categories.includes('低学年スキル')) return 'lowSkill';
    if (categories.includes('高学年スキル')) return 'highSkill';
    return '';
  }

  function getDpsSkillOptionBranch(option = {}) {
    return (String(option.kind || '').match(/^\[([^\]]+)\]/) || [])[1] || '';
  }

  window.TRICKCAL_DAMAGE_CALC = Object.freeze({
    version: 7,
    captureCombatScenario,
    createSingleActionSnapshot: createCurrentSingleActionSnapshot,
    createDpsSnapshot: createDpsPrototypeSnapshot
  });

  function renderUiIcon(name, className = '') {
    const paths = {
      close: '<path d="M6 6l12 12M18 6 6 18"></path>',
      minus: '<path d="M5 12h14"></path>',
      plus: '<path d="M12 5v14M5 12h14"></path>'
    };
    const extraClass = className ? ` ${escapeAttr(className)}` : '';
    return `<svg class="ui-icon${extraClass}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || ''}</svg>`;
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

  document.addEventListener('error', event => {
    if (event.target?.matches?.('[data-fallback]')) event.target.src = FALLBACK_IMAGE;
  }, true);
})();
