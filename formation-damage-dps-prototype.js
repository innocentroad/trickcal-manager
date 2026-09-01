(() => {
  'use strict';

  const ACTION_LABELS = Object.freeze({
    basicAttack: '基本攻撃', enhancedAttack: '強化攻撃', lowSkill: '低学年', highSkill: '高学年'
  });
  const ACTION_COLORS = Object.freeze({
    basicAttack: '#72a6ff', enhancedAttack: '#c88bff', lowSkill: '#62d6a3', highSkill: '#ffb568', runtime: '#f477aa'
  });
  const EXTERNAL_EVENT_TYPES = Object.freeze({
    shieldBreak: 'シールド破壊',
    hpThreshold: 'HP閾値',
    damageTaken: '被弾',
    statusApplied: '状態付与',
    'シールド破壊時': 'シールド破壊',
    'シールド終了時': 'シールド終了',
    'HP閾値': 'HP閾値',
    '被弾時': '被弾',
    '味方戦闘不能時': '味方戦闘不能',
    '自身戦闘不能時': '自身戦闘不能',
    '低学年スキルで敵撃破時': '低学年スキルで敵撃破',
    '高学年スキルで敵撃破時': '高学年スキルで敵撃破',
    '普通攻撃で敵撃破時': '普通攻撃で敵撃破',
    '強化攻撃で敵撃破時': '強化攻撃で敵撃破',
    '敵撃破時': '敵撃破',
    '固有状態付与時': '固有状態付与',
    '固有状態終了時': '固有状態終了',
    '状態付与時': '状態付与',
    '状態終了時': '状態終了',
    '状態発動時': '状態発動',
    '状態最大スタック到達時': '状態最大スタック',
    'リソース変化時': 'リソース変化',
    'n回ごと': 'n回ごと',
    '規定ヒット時': '規定ヒット',
    '低学年スキル効果発生時': '低学年スキル効果発生',
    '高学年スキル効果発生時': '高学年スキル効果発生',
    '低学年スキル最終ヒット命中時': '低学年最終ヒット命中',
    'スキル使用時': 'スキル使用',
    'スキル発動時': 'スキル発動',
    'スキル終了時': 'スキル終了',
    '生成物生成時': '生成物生成',
    '生成物攻撃時': '生成物攻撃',
    '生成物命中時': '生成物命中',
    '生成物接触時': '生成物接触',
    '生成物到着時': '生成物到着',
    '生成物帰還時': '生成物帰還',
    '生成物消滅時': '生成物消滅',
    '攻撃対象未撃破時': '攻撃対象未撃破',
    '攻撃対象設定時': '攻撃対象設定',
    '攻撃対象変更時': '攻撃対象変更',
    'ダメージ命中時': 'ダメージ命中',
    '竜巻ダメージ発生時': '竜巻ダメージ発生',
    '効果発生時': '効果発生',
    '効果発生後': '効果発生後',
    '対象状態成立時': '対象状態成立',
    '呪い状態の敵が存在': '呪い状態の敵が存在',
    '攻撃命中時': '攻撃命中',
    '直接攻撃命中時': '直接攻撃命中',
    '回復時': '回復'
  });
  function getExternalEventTypeEntries(currentType = '') {
    const current = String(currentType || '');
    const currentLabel = EXTERNAL_EVENT_TYPES[current] || '';
    const seenLabels = new Set();
    return Object.entries(EXTERNAL_EVENT_TYPES).filter(([value, label]) => {
      if (current && currentLabel && label === currentLabel && value !== current) return false;
      if (seenLabels.has(label)) return false;
      seenLabels.add(label);
      return true;
    });
  }
  const DEFAULT_EXTERNAL_EVENT_REASONS = Object.freeze({
    shieldBreak: '手動シールド破壊',
    hpThreshold: '手動HP閾値',
    damageTaken: '手動被弾',
    statusApplied: '手動状態付与',
    'シールド破壊時': '手動シールド破壊',
    'シールド終了時': '手動シールド終了',
    'HP閾値': '手動HP閾値',
    '被弾時': '手動被弾',
    '味方戦闘不能時': '手動味方戦闘不能',
    '自身戦闘不能時': '手動自身戦闘不能',
    '敵撃破時': '手動敵撃破',
    '状態付与時': '手動状態付与',
    '状態終了時': '手動状態終了',
    'リソース変化時': '手動リソース変化',
    'n回ごと': '手動n回ごと',
    '低学年スキル効果発生時': '手動低学年スキル効果発生',
    '高学年スキル効果発生時': '手動高学年スキル効果発生',
    'スキル使用時': '手動スキル使用',
    'スキル発動時': '手動スキル発動',
    'スキル終了時': '手動スキル終了',
    '竜巻ダメージ発生時': '手動竜巻ダメージ発生',
    '効果発生時': '手動効果発生',
    '効果発生後': '手動効果発生後',
    '規定ヒット時': '手動規定ヒット',
    '対象状態成立時': '手動対象状態成立',
    '呪い状態の敵が存在': '手動呪い状態成立',
    '攻撃対象設定時': '手動攻撃対象設定',
    '攻撃命中時': '手動攻撃命中',
    '直接攻撃命中時': '手動直接攻撃命中',
    '低学年スキル最終ヒット命中時': '手動低学年最終ヒット命中'
  });
  // 独立DPS画面と同一の保存先を使う。通常計算のsnapshotは変更せず、
  // DPS実行用の複製だけへoverrideを反映する。
  const DPS_RUNTIME_OVERRIDE_STORAGE_KEY = 'trickcal:dps-runtime-effect-overrides:v1';
  const DPS_SETTINGS_STORAGE_KEY = 'trickcal:dps-settings:v1';
  const DEFAULT_DPS_SETTINGS = Object.freeze({
    durationSeconds: 90, highSkillMode: 'disabled', formationTimelineMode: 'off', formationHighSkillMode: 'disabled', seed: 1, trials: 16, autoRun: true, externalEvents: []
  });
  const DPS_DURATION_OPTIONS = Object.freeze([30, 60, 90, 120, 180]);
  const DPS_TRIAL_OPTIONS = Object.freeze([16, 64, 256]);
  const DPS_HIGH_MODE_OPTIONS = Object.freeze(['disabled', 'auto']);
  const DPS_FORMATION_TIMELINE_OPTIONS = Object.freeze(['off', 'supportEstimate']);
  const DPS_FORMATION_HIGH_MODE_OPTIONS = Object.freeze(['disabled', 'auto']);

  function loadDpsRuntimeEffectOverrides() {
    try {
      const parsed = JSON.parse(window.localStorage?.getItem(DPS_RUNTIME_OVERRIDE_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) { return {}; }
  }
  let dpsRuntimeEffectOverrides = loadDpsRuntimeEffectOverrides();
  function saveDpsRuntimeEffectOverrides(overrides) {
    dpsRuntimeEffectOverrides = overrides && typeof overrides === 'object' ? overrides : {};
    try { window.localStorage?.setItem(DPS_RUNTIME_OVERRIDE_STORAGE_KEY, JSON.stringify(dpsRuntimeEffectOverrides)); } catch (_) { /* 保存不可でもこのタブ内の設定は維持する。 */ }
  }
  function loadDpsSettingsStore() {
    try {
      const parsed = JSON.parse(window.localStorage?.getItem(DPS_SETTINGS_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (_) { return {}; }
  }
  let dpsSettingsStore = loadDpsSettingsStore();
  function saveDpsSettingsStore(store) {
    dpsSettingsStore = store && typeof store === 'object' && !Array.isArray(store) ? store : {};
    try { window.localStorage?.setItem(DPS_SETTINGS_STORAGE_KEY, JSON.stringify(dpsSettingsStore)); } catch (_) { /* 保存不可でもこのタブ内の設定は維持する。 */ }
  }
  function chooseDpsSetting(value, fallback, choices) {
    const candidate = String(value ?? '');
    const fallbackValue = String(fallback ?? '');
    return choices.includes(candidate) ? candidate : choices.includes(fallbackValue) ? fallbackValue : String(choices[0]);
  }
  function normalizeDpsSettings(value = {}, fallback = DEFAULT_DPS_SETTINGS) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const base = fallback && typeof fallback === 'object' ? fallback : DEFAULT_DPS_SETTINGS;
    const duration = chooseDpsSetting(source.durationSeconds, base.durationSeconds, DPS_DURATION_OPTIONS.map(String));
    const trials = chooseDpsSetting(source.trials, base.trials, DPS_TRIAL_OPTIONS.map(String));
    const rawSeed = Number(source.seed);
    const fallbackSeed = Number(base.seed);
    return {
      durationSeconds: Number(duration),
      highSkillMode: chooseDpsSetting(source.highSkillMode, base.highSkillMode, DPS_HIGH_MODE_OPTIONS),
      formationTimelineMode: chooseDpsSetting(source.formationTimelineMode, base.formationTimelineMode, DPS_FORMATION_TIMELINE_OPTIONS),
      formationHighSkillMode: chooseDpsSetting(source.formationHighSkillMode, base.formationHighSkillMode, DPS_FORMATION_HIGH_MODE_OPTIONS),
      seed: Math.max(1, Math.floor(Number.isFinite(rawSeed) ? rawSeed : (Number.isFinite(fallbackSeed) ? fallbackSeed : 1))),
      trials: Number(trials),
      autoRun: typeof source.autoRun === 'boolean' ? source.autoRun : base.autoRun !== false,
      externalEvents: normalizeDpsExternalEvents(Array.isArray(source.externalEvents) ? source.externalEvents : base.externalEvents)
    };
  }
  function getDpsRuntimeEffectOverride(targetId, effectId, overrides = dpsRuntimeEffectOverrides) {
    return overrides?.[String(targetId || '')]?.[String(effectId || '')] || null;
  }
  function applyDpsRuntimeEffectOverrides(runtimeEffects = {}, targetId = '', overrides = dpsRuntimeEffectOverrides) {
    const source = runtimeEffects || {};
    const display = { ...source };
    const simulation = { ...source };
    [
      ['attackSpeedEffects', true], ['damageBuffEffects', true], ['spRecoveryEffects', false],
      ['cooldownEffects', false], ['eventEffects', false]
    ].forEach(([collectionKey, supportsFixed]) => {
      const displayRows = Array.isArray(source[collectionKey]) ? source[collectionKey] : [];
      display[collectionKey] = displayRows.map(effect => {
        const effectId = String(effect?.id || effect?.effectId || '');
        const override = getDpsRuntimeEffectOverride(targetId, effectId, overrides);
        return { ...effect, runtimeOverrideMode: override?.mode || 'auto', runtimeFixedStacks: Math.max(1, Math.floor(Number(override?.fixedStacks) || 1)), runtimeSupportsFixed: supportsFixed };
      });
      simulation[collectionKey] = displayRows.flatMap(effect => {
        const effectId = String(effect?.id || effect?.effectId || '');
        const override = getDpsRuntimeEffectOverride(targetId, effectId, overrides);
        if (override?.mode === 'off') {
          // 動的ダメージ補正はdefinitionを残して発動不能にする。完全に削除すると
          // 単発profile由来の仮定値がDPSへ残る場合がある。
          return collectionKey === 'damageBuffEffects'
            ? [{ ...effect, mode: 'off', triggerActionKeys: [], intervalFrames: 0 }]
            : [];
        }
        if (override?.mode !== 'fixed' || !supportsFixed) return [effect];
        const maxStacks = Math.max(1, Math.floor(Number(effect.maxStacks) || 1));
        const fixedStacks = Math.min(maxStacks, Math.max(1, Math.floor(Number(override.fixedStacks) || 1)));
        return [{ ...effect, mode: 'fixed', fixedStacks, durationFrames: 0, intervalFrames: 0, triggerEveryCount: 0, triggerActionKeys: [] }];
      });
    });
    return { display, simulation };
  }
  function createDpsSnapshotWithRuntimeOverrides(adapter) {
    const source = adapter.createDpsSnapshot();
    const settings = applyDpsRuntimeEffectOverrides(source?.runtimeEffects || {}, source?.targetId || '');
    return { ...source, runtimeEffects: settings.display, dpsRuntimeSimulationEffects: settings.simulation };
  }

  function normalizeDpsExternalEvent(value = {}, index = 0) {
    const type = String(value?.type || '').trim();
    const frame = Number.isFinite(Number(value?.frame))
      ? Number(value.frame)
      : Math.max(0, Number(value?.seconds) || 0) * 60;
    const intervalFrames = Number.isFinite(Number(value?.intervalFrames))
      ? Number(value.intervalFrames)
      : Math.max(0, Number(value?.intervalSeconds) || 0) * 60;
    const statusDurationFrames = Number.isFinite(Number(value?.statusDurationFrames))
      ? Number(value.statusDurationFrames)
      : Math.max(0, Number(value?.statusDurationSeconds) || 0) * 60;
    const repeatCount = Math.max(0, Math.floor(Number(value?.repeatCount) || 0));
    const status = String(value?.status || '').trim();
    const candidateId = String(value?.candidateId || value?.formationCandidateId || '').trim();
    const candidateLabel = String(value?.candidateLabel || '').trim();
    const candidateBasis = String(value?.candidateBasis || '').trim();
    const candidateEffectLabels = Array.isArray(value?.candidateEffectLabels)
      ? value.candidateEffectLabels.map(label => String(label || '').trim()).filter(Boolean)
      : [];
    const timingMode = String(value?.timingMode || value?.candidateTimingMode || '').trim();
    const eventClass = String(value?.eventClass || value?.candidateEventClass || '').trim();
    const eventLabel = String(value?.eventLabel || value?.candidateEventLabel || '').trim();
    const repeatability = String(value?.repeatability || value?.candidateRepeatability || '').trim();
    const inputMode = String(value?.inputMode || value?.candidateInputMode || '').trim();
    const triggerSourceId = String(value?.triggerSourceId || '').trim();
    const conditionType = String(value?.conditionType || '').trim();
    const conditionValue = String(value?.conditionValue ?? '').trim();
    const normalized = {
      id: String(value?.id || `manual:${index + 1}`),
      type,
      frame: Math.max(0, frame),
      intervalFrames: Math.max(0, intervalFrames),
      repeatCount,
      sourceId: String(value?.sourceId || '').trim(),
      value: String(value?.value ?? '').trim(),
      reason: String(value?.reason || '').trim() || DEFAULT_EXTERNAL_EVENT_REASONS[type] || '手動外部イベント'
    };
    if (candidateId) {
      Object.assign(normalized, {
        candidateId,
        candidateLabel,
        candidateBasis,
        candidateEffectLabels,
        timingMode,
        eventClass,
        eventLabel,
        repeatability,
        inputMode,
        triggerSourceId,
        conditionType,
        conditionValue
      });
    }
    if (status || Number(statusDurationFrames) > 0) {
      Object.assign(normalized, {
        status,
        statusDurationFrames: Math.max(0, statusDurationFrames),
        statusStackable: value?.statusStackable === true || value?.stackable === true,
        statusMaxStacks: Math.max(1, Math.floor(Number(value?.statusMaxStacks ?? value?.maxStacks) || 1)),
        statusStackGroupId: String(value?.statusStackGroupId || value?.stackGroupId || '').trim(),
        statusApplicationEffectId: String(value?.statusApplicationEffectId || value?.applicationEffectId || '').trim(),
        statusSourceId: String(value?.statusSourceId || '').trim(),
        statusSourceSelf: value?.statusSourceSelf === true,
        statusDealsPeriodicDamage: value?.statusDealsPeriodicDamage == null
          ? null
          : value.statusDealsPeriodicDamage === true,
        statusTickFrames: Math.max(0, Number(value?.statusTickFrames) || 0),
        statusTickMultiplier: Number(value?.statusTickMultiplier) || 0
      });
    }
    return normalized;
  }

  function normalizeDpsExternalEvents(values = []) {
    return (Array.isArray(values) ? values : [])
      .map((value, index) => normalizeDpsExternalEvent(value, index))
      .filter(event => event.type);
  }

  // 通常計算の結果表示を読まず、同一windowの公開snapshot APIだけをDPS入力に使う。
  function createDirectDamageAdapter() {
    function createDpsSnapshot() {
      const api = window.TRICKCAL_DAMAGE_CALC;
      const create = api?.createDpsEvaluationInput || api?.createDpsSnapshot;
      if (typeof create !== 'function') {
        throw new Error('通常計算のDPS入力を準備中です。ページの読み込み完了後に再試行してください。');
      }
      return create();
    }
    return Object.freeze({ createDpsSnapshot });
  }

  class PrototypeDpsController {
    constructor(adapter, elements) {
      this.adapter = adapter;
      this.elements = elements;
      this.latest = null;
      this.baseline = null;
      this.comparison = null;
      this.currentAxis = null;
      this.currentInputFingerprint = '';
      this.requiresRecalculation = false;
      this.running = false;
      this.autoTimer = 0;
      this.pendingAutoRun = false;
      this.lastAutoFingerprint = '';
      this.dpsModeActive = false;
      this.runToken = 0;
      this.activeCancellation = null;
      this.timelineVisibleLimit = 160;
      this.externalEvents = [];
      this.externalEventsInitialized = false;
      this.dpsSettingsTargetId = '';
      this.defaultDpsSettings = normalizeDpsSettings({
        durationSeconds: this.elements.duration?.value,
        highSkillMode: this.elements.highMode?.value,
        formationTimelineMode: this.elements.formationTimelineMode?.value,
        formationHighSkillMode: this.elements.formationHighMode?.value,
        seed: this.elements.seed?.value,
        trials: this.elements.trials?.value,
        autoRun: this.elements.autoRun?.checked,
        externalEvents: []
      });
      this.damageGraphModel = null;
      this.updateExternalEventCount();
      // 対応可否の判定はDPS表示中だけに閉じない。通常表示のまま使徒を
      // 選び直しても、次にDPSを開けるかを軽量snapshotから更新する。
      this.currentTargetId = '';
      this.availability = { ready: false, snapshot: null, support: null, error: null };
      this.onAvailabilityChange = null;
    }

    getDpsSettings() {
      return normalizeDpsSettings({
        durationSeconds: this.elements.duration?.value,
        highSkillMode: this.elements.highMode?.value,
        formationTimelineMode: this.elements.formationTimelineMode?.value,
        formationHighSkillMode: this.elements.formationHighMode?.value,
        seed: this.elements.seed?.value,
        trials: this.elements.trials?.value,
        autoRun: this.elements.autoRun?.checked,
        externalEvents: this.externalEvents
      }, this.defaultDpsSettings || DEFAULT_DPS_SETTINGS);
    }

    applyDpsSettings(settings = {}) {
      const next = normalizeDpsSettings(settings, this.defaultDpsSettings || DEFAULT_DPS_SETTINGS);
      if (this.elements.duration) this.elements.duration.value = String(next.durationSeconds);
      if (this.elements.highMode) this.elements.highMode.value = next.highSkillMode;
      if (this.elements.formationTimelineMode) this.elements.formationTimelineMode.value = next.formationTimelineMode;
      if (this.elements.formationHighMode) this.elements.formationHighMode.value = next.formationHighSkillMode;
      if (this.elements.seed) this.elements.seed.value = String(next.seed);
      if (this.elements.trials) this.elements.trials.value = String(next.trials);
      if (this.elements.autoRun) this.elements.autoRun.checked = next.autoRun;
      this.externalEvents = normalizeDpsExternalEvents(next.externalEvents);
      this.externalEventsInitialized = true;
      this.updateExternalEventCount();
      return next;
    }

    restoreDpsSettingsForTarget(targetId, fallbackExternalEvents = []) {
      const key = String(targetId || '').trim().toLowerCase();
      if (!key) return false;
      const saved = dpsSettingsStore[key];
      const fallback = {
        ...(this.defaultDpsSettings || DEFAULT_DPS_SETTINGS),
        externalEvents: normalizeDpsExternalEvents(fallbackExternalEvents)
      };
      this.applyDpsSettings(saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : fallback);
      return true;
    }

    persistDpsSettingsForTarget(targetId = this.dpsSettingsTargetId || this.currentTargetId) {
      const key = String(targetId || '').trim().toLowerCase();
      if (!key) return false;
      saveDpsSettingsStore({ ...dpsSettingsStore, [key]: this.getDpsSettings() });
      return true;
    }

    syncDpsSettingsForTarget(targetId, snapshot = {}) {
      const key = String(targetId || '').trim().toLowerCase();
      if (!key) {
        if (this.dpsSettingsTargetId) this.persistDpsSettingsForTarget(this.dpsSettingsTargetId);
        this.dpsSettingsTargetId = '';
        return false;
      }
      if (this.dpsSettingsTargetId !== key) {
        if (this.dpsSettingsTargetId) this.persistDpsSettingsForTarget(this.dpsSettingsTargetId);
        this.restoreDpsSettingsForTarget(key, snapshot?.externalEvents || []);
        this.dpsSettingsTargetId = key;
        this.persistDpsSettingsForTarget(key);
        return true;
      }
      this.persistDpsSettingsForTarget(key);
      return false;
    }

    getOptions() {
      const settings = this.getDpsSettings();
      return {
        durationSeconds: Number(settings.durationSeconds) || 60,
        highSkillMode: settings.highSkillMode || 'disabled',
        // 初動は試験版UIから外し、比較軸をぶらさない固定値とする。
        initialActionDelayFrames: 60,
        seed: Math.max(1, Math.floor(Number(settings.seed) || 1)),
        trials: Math.max(1, Math.floor(Number(settings.trials) || 16)),
        // 「統計試行数」は表示用の目安ではなく、集計に使うseed数そのもの。
        // この試験UIでは収束短縮を許可せず、指定された連番seedをすべて実行する。
        exactTrials: true,
        adaptiveTrials: false,
        formationTimelineMode: settings.formationTimelineMode || 'off',
        formationHighSkillMode: settings.formationHighSkillMode || 'disabled'
      };
    }

    createAxis(snapshot, options) {
      return createDpsComparisonAxis(snapshot, options);
    }

    getSupport(snapshot) {
      const registry = window.TRICKCAL_DPS_SUPPORT_REGISTRY;
      return registry?.evaluate?.(snapshot) || { supported: false, reason: 'DPS対応リストを読み込めませんでした。' };
    }

    setRecalculationIndicator({ visible = false, running = false } = {}) {
      const state = visible ? (running ? 'running' : 'pending') : 'none';
      const label = running ? '再計算中' : '再計算待ち';
      const indicator = this.elements.recalcIndicator;
      if (indicator) {
        indicator.hidden = !visible;
        indicator.dataset.fdcpRecalculation = state;
        const labelElement = indicator.querySelector?.('[data-fdcp-recalc-label]');
        if (labelElement) labelElement.textContent = label;
        if (visible) {
          indicator.setAttribute('aria-label', label);
          indicator.title = '前回の計算結果を表示したまま、最新条件を再計算しています。';
        } else {
          indicator.removeAttribute('aria-label');
          indicator.removeAttribute('title');
        }
      }
      if (this.elements.primary) {
        this.elements.primary.dataset.fdcpRecalculation = state;
        this.elements.primary.setAttribute('aria-busy', String(visible));
      }
    }

    renderRecalculationState() {
      const hasCachedResult = !!this.latest?.aggregate;
      const status = this.running ? '再計算中' : '再計算待ち';
      this.setRecalculationIndicator({ visible: true, running: this.running });
      if (hasCachedResult) {
        this.elements.state.textContent = status;
        this.elements.meta.textContent = '前回の計算結果を表示中';
        this.elements.drawerStatus.textContent = `${status}: 前回の計算結果を表示しています`;
        this.renderCollapsedBreakdown(createDpsBottomBreakdown(this.latest.aggregate));
      } else {
        this.elements.value.textContent = '再計算必要';
        this.elements.state.textContent = status;
        this.elements.meta.textContent = '計算条件が変更されました';
        this.elements.drawerStatus.textContent = status;
        this.renderCollapsedBreakdown();
      }
      this.renderDpsDetail();
    }

    createInputSnapshot(snapshot = {}) {
      return {
        ...snapshot,
        externalEvents: normalizeDpsExternalEvents(this.externalEvents)
      };
    }

    renderProvisionalBadge(support) {
      const components = support?.provisionalComponents || [];
      this.elements.provisionalBadge.hidden = !components.length;
      this.elements.provisionalBadge.textContent = components.length
        ? `暫定: ${support.provisionalLabel || components.map(item => item.label).join('・')}`
        : '暫定';
    }

    refreshAvailability({ render = this.dpsModeActive } = {}) {
      try {
        const snapshot = createDpsSnapshotWithRuntimeOverrides(this.adapter);
        const targetId = String(snapshot?.targetId || '').trim().toLowerCase();
        this.syncDpsSettingsForTarget(targetId, snapshot);
        this.updateExternalEventCount();
        this.renderDpsExternalInput(snapshot);
        this.renderDpsRuntimeSettings(snapshot);
        const support = this.getSupport(snapshot);
        const transition = getDpsTargetChangeTransition({
          previousTargetId: this.currentTargetId,
          nextTargetId: targetId,
          dpsModeActive: this.dpsModeActive,
          supportKnown: true,
          supported: !!support?.supported,
          autoEnabled: !!this.elements.autoRun?.checked
        });
        if (transition.targetChanged) this.invalidateForTargetChange();
        else if (this.dpsModeActive && !support?.supported) this.invalidateForUnsupportedAvailability();
        this.currentTargetId = targetId;
        this.availability = { ready: true, snapshot, support, error: null };
        if (render) this.renderAvailability(snapshot, support);
        this.onAvailabilityChange?.({ ready: true, snapshot, support, transition });
        return { snapshot, support };
      } catch (error) {
        // snapshot APIの起動途中は「未対応」とは別状態。DPS tabは無効化せず、
        // 通常計算側の次のrender通知で再評価できるようにしておく。
        this.availability = { ready: false, snapshot: null, support: null, error };
        if (render) this.renderAdapterError(error);
        this.onAvailabilityChange?.({ ready: false, snapshot: null, support: null, error, transition: null });
        return null;
      }
    }

    canEnterDpsMode() {
      return !this.availability.ready || !!this.availability.support?.supported;
    }

    invalidateForTargetChange() {
      // 比較基準は同じ使徒の設定差分専用。使徒をまたぐ基準を残すと誤解を
      // 招くため、対応使徒同士の切替でも安全側で解除する。
      this.cancelActiveRun();
      this.latest = null;
      this.damageGraphModel = null;
      this.requiresRecalculation = true;
      this.lastAutoFingerprint = '';
      this.setRecalculationIndicator({ visible: false });
      this.clearComparison();
      if (this.baseline) this.clearBaseline({ message: '使徒変更のため比較基準を解除しました。' });
      else this.updateBaselineControls();
    }

    invalidateForUnsupportedAvailability() {
      // 同一使徒のアサイド・愛用品変更で未対応構成になった場合も、前の
      // supported結果を内部に残さない。基準自体は同じ使徒の比較用として
      // 保持するが、未対応中は差分を一切描画しない。
      this.cancelActiveRun();
      this.latest = null;
      this.damageGraphModel = null;
      this.requiresRecalculation = true;
      this.lastAutoFingerprint = '';
      this.setRecalculationIndicator({ visible: false });
      this.clearComparison();
      this.updateBaselineControls();
    }

    requestAutoRun() {
      const decision = getAutoRunDecision({
        dpsModeActive: this.dpsModeActive,
        autoEnabled: !!this.elements.autoRun?.checked,
        running: this.running,
        fingerprint: this.currentInputFingerprint,
        lastFingerprint: this.lastAutoFingerprint,
        requiresRecalculation: this.requiresRecalculation
      });
      if (decision === 'none') return;
      if (decision === 'pending') {
        this.pendingAutoRun = true;
        return;
      }
      window.clearTimeout(this.autoTimer);
      this.autoTimer = window.setTimeout(() => {
        this.autoTimer = 0;
        if (!this.dpsModeActive || !this.elements.autoRun?.checked || this.running) return;
        this.run();
      }, 500);
    }

    setDpsModeActive(active) {
      this.dpsModeActive = !!active;
      if (this.dpsModeActive) return;
      window.clearTimeout(this.autoTimer);
      this.autoTimer = 0;
      this.pendingAutoRun = false;
      this.cancelActiveRun();
    }

    cancelActiveRun() {
      const cancellation = this.activeCancellation;
      // Advance the token before resolving/rejecting the old task.  This makes
      // a late Worker or synchronous fallback result incapable of reaching UI.
      this.runToken += 1;
      this.activeCancellation = null;
      cancellation?.cancel();
      if (!this.running) {
        this.setRecalculationIndicator({ visible: false });
        return;
      }
      this.running = false;
      // A partially computed aggregate must never look fresh after the user
      // returns to DPS mode.  Force the next DPS activation to obtain a whole
      // new single + aggregate pair.
      this.latest = null;
      this.damageGraphModel = null;
      this.requiresRecalculation = true;
      this.lastAutoFingerprint = '';
      this.setRecalculationIndicator({ visible: false });
      this.clearComparison();
      this.elements.run.textContent = 'DPS計算';
      this.elements.run.disabled = !this.dpsModeActive;
      this.updateBaselineControls();
    }

    isCurrentRun(token, cancellation) {
      return this.activeCancellation === cancellation && shouldApplyRunResult({
        dpsModeActive: this.dpsModeActive,
        runToken: token,
        currentToken: this.runToken,
        cancelled: cancellation.cancelled
      });
    }

    renderAvailability(snapshot, support) {
      const { value, state, meta, run } = this.elements;
      this.renderProvisionalBadge(support);
      const options = this.getOptions();
      this.currentAxis = this.createAxis(snapshot, options);
      this.currentInputFingerprint = createDpsInputFingerprint(this.createInputSnapshot(snapshot), options);
      const freshness = getSnapshotFreshness(
        this.latest?.inputFingerprint || '',
        this.currentInputFingerprint,
        this.running
      );
      const stale = freshness.shouldInvalidate;
      if (stale || this.requiresRecalculation) {
        this.requiresRecalculation = true;
        this.renderRecalculationState();
      }
      if (!support.supported) {
        this.clearComparison();
        this.setRecalculationIndicator({ visible: false });
        value.textContent = 'DPS未対応';
        state.textContent = support.reason || '未対応構成';
        meta.textContent = '';
        this.elements.drawerStatus.textContent = state.textContent;
        run.disabled = true;
        this.renderCollapsedBreakdown();
        this.renderDpsDetail();
        this.updateBaselineControls();
        if (this.baseline) this.elements.baselineNote.textContent = 'DPS未対応のため、基準との差分は表示できません。';
        return;
      }
      if (!this.latest && !stale && !this.requiresRecalculation) {
        value.textContent = '未計算';
        this.setRecalculationIndicator({ visible: false });
      }
      if (!stale && !this.latest && !this.requiresRecalculation) {
        state.textContent = `${support.label || snapshot.targetName || snapshot.targetId} / ${support.configuration || '対応済み構成'}`;
        meta.textContent = '計算条件の変更後は再計算してください';
        this.elements.drawerStatus.textContent = '計算前';
        this.renderDpsDetail();
      }
      run.disabled = false;
      this.updateBaselineControls();
    }

    renderAdapterError(error) {
      this.renderProvisionalBadge(null);
      this.clearComparison();
      this.latest = null;
      this.damageGraphModel = null;
      this.requiresRecalculation = true;
      this.setRecalculationIndicator({ visible: false });
      this.elements.value.textContent = 'DPS未対応';
      this.elements.state.textContent = 'snapshot取得エラー';
      this.elements.meta.textContent = error?.message || '通常計算ページを読み込めません。';
      this.elements.drawerStatus.textContent = this.elements.state.textContent;
      this.elements.run.disabled = true;
      this.renderCollapsedBreakdown();
      this.renderDpsDetail();
      this.updateBaselineControls();
      if (this.baseline) this.elements.baselineNote.textContent = 'DPS入力を取得できないため、基準との差分は表示できません。';
    }

    handleRuntimeEffectSettingChange(event) {
      const modeSelect = event.target.closest?.('[data-fdc-dps-runtime-mode]');
      const stackInput = event.target.closest?.('[data-fdc-dps-runtime-stacks]');
      const control = modeSelect || stackInput;
      if (!control) return;
      const effectId = String(control.dataset.fdcDpsRuntimeMode || control.dataset.fdcDpsRuntimeStacks || '');
      const targetId = String(this.availability?.snapshot?.targetId || this.currentTargetId || '');
      if (!effectId || !targetId) return;
      const overrides = dpsRuntimeEffectOverrides || loadDpsRuntimeEffectOverrides();
      const targetOverrides = overrides[targetId] || {};
      const current = targetOverrides[effectId] || { mode: 'auto', fixedStacks: 1 };
      const next = {
        mode: modeSelect ? modeSelect.value : current.mode,
        fixedStacks: stackInput ? Math.max(1, Math.floor(Number(stackInput.value) || 1)) : Math.max(1, Math.floor(Number(current.fixedStacks) || 1))
      };
      if (next.mode === 'auto') delete targetOverrides[effectId];
      else targetOverrides[effectId] = next;
      if (Object.keys(targetOverrides).length) overrides[targetId] = targetOverrides;
      else delete overrides[targetId];
      saveDpsRuntimeEffectOverrides(overrides);
      this.requiresRecalculation = true;
      this.lastAutoFingerprint = '';
      this.refreshAvailability({ render: true });
      this.requestAutoRun();
    }

    readExternalEventsFromDetail() {
      const input = this.elements.externalInput || this.elements.detailGrid;
      const rows = Array.from(input?.querySelectorAll?.('.fdc-dps-external-event-row') || []);
      return normalizeDpsExternalEvents(rows.map(row => {
        let candidateMeta = {};
        try {
          const parsed = JSON.parse(row.dataset?.fdcpExternalCandidateMeta || '{}');
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) candidateMeta = parsed;
        } catch (_) { /* metadata is optional */ }
        return {
          type: row.querySelector?.('[data-fdc-dps-external-type]')?.value || '',
          seconds: Math.max(0, Number(row.querySelector?.('[data-fdc-dps-external-seconds]')?.value) || 0),
          intervalSeconds: Math.max(0, Number(row.querySelector?.('[data-fdc-dps-external-interval]')?.value) || 0),
          repeatCount: Math.max(0, Math.floor(Number(row.querySelector?.('[data-fdc-dps-external-count]')?.value) || 0)),
          sourceId: row.querySelector?.('[data-fdc-dps-external-source]')?.value || '',
          value: row.querySelector?.('[data-fdc-dps-external-value]')?.value || '',
          status: row.querySelector?.('[data-fdc-dps-external-status]')?.value || '',
          statusDurationSeconds: Math.max(0, Number(row.querySelector?.('[data-fdc-dps-external-status-duration]')?.value) || 0),
          reason: row.querySelector?.('[data-fdc-dps-external-reason]')?.value || '',
          candidateId: row.dataset?.fdcpExternalCandidateId || '',
          candidateLabel: row.dataset?.fdcpExternalCandidateLabel || '',
          candidateBasis: row.dataset?.fdcpExternalCandidateBasis || '',
          candidateEffectLabels: (() => {
            try {
              const parsed = JSON.parse(row.dataset?.fdcpExternalCandidateEffects || '[]');
              return Array.isArray(parsed) ? parsed : [];
            } catch (_) { return []; }
          })(),
          ...candidateMeta
        };
      }));
    }

    markExternalEventsChanged(events = []) {
      this.externalEvents = normalizeDpsExternalEvents(events);
      this.externalEventsInitialized = true;
      this.persistDpsSettingsForTarget();
      this.updateExternalEventCount();
      this.requiresRecalculation = true;
      this.lastAutoFingerprint = '';
      this.refreshAvailability({ render: true });
      this.requestAutoRun();
    }

    handleExternalInputChange() {
      this.markExternalEventsChanged(this.readExternalEventsFromDetail());
    }

    addExternalEvent(value = {}) {
      this.markExternalEventsChanged([...this.externalEvents, value]);
      this.elements.externalInput?.querySelector?.('[data-fdcp-detail-section="external"]')?.setAttribute('open', '');
    }

    updateExternalEventCount() {
      const count = this.elements.externalEventCount;
      if (!count) return;
      count.textContent = `${formatNumber(this.externalEvents.length)}件 / 追加・編集`;
    }

    renderDpsExternalInput(snapshot = null) {
      const host = this.elements.externalInput;
      if (!host) return;
      const previousExternalDetails = host.querySelector?.('[data-fdcp-detail-section="external"]');
      const previousCandidateDetails = host.querySelector?.('[data-fdcp-detail-section="external-candidates"]');
      const sourceSnapshot = snapshot || this.latest?.snapshot || this.availability?.snapshot || {};
      host.innerHTML = renderDpsExternalInputContent(
        this.externalEvents,
        sourceSnapshot.formationEventCandidates || []
      );
      const externalDetails = host.querySelector?.('[data-fdcp-detail-section="external"]');
      const candidateDetails = host.querySelector?.('[data-fdcp-detail-section="external-candidates"]');
      if (externalDetails) externalDetails.open = previousExternalDetails ? !!previousExternalDetails.open : this.externalEvents.length > 0;
      if (candidateDetails) candidateDetails.open = !!previousCandidateDetails?.open;
    }

    renderDpsRuntimeSettings(snapshot = null) {
      const host = this.elements.runtimeSettings;
      if (!host) return;
      const previousDetails = host.querySelector?.('[data-fdcp-detail-section="runtime-settings"]');
      const sourceSnapshot = snapshot || this.latest?.snapshot || this.availability?.snapshot || {};
      host.innerHTML = renderDpsRuntimeSettingsContent(sourceSnapshot.runtimeEffects || {}, !!previousDetails?.open);
    }

    removeExternalEvent(index) {
      const targetIndex = Math.max(0, Math.floor(Number(index)));
      this.markExternalEventsChanged(this.externalEvents.filter((_, currentIndex) => currentIndex !== targetIndex));
    }

    handleDetailClick(event) {
      if (event.target.closest?.('[data-fdcp-timeline-more]')) {
        this.showMoreTimeline();
        return;
      }
      if (event.target.closest?.('[data-fdcp-dps-external-event-add]')) {
        this.addExternalEvent({ type: 'shieldBreak' });
        return;
      }
      const remove = event.target.closest?.('[data-fdc-dps-external-remove]');
      if (remove) {
        const row = remove.closest?.('.fdc-dps-external-event-row');
        this.removeExternalEvent(row?.dataset?.fdcpExternalIndex);
        return;
      }
      const add = event.target.closest?.('[data-fdc-dps-formation-event-add]');
      if (add) {
        const snapshot = this.latest?.snapshot || this.availability?.snapshot || {};
        const candidate = (Array.isArray(snapshot.formationEventCandidates) ? snapshot.formationEventCandidates : [])
          .find(item => String(item?.id || '') === String(add.dataset.fdcDpsFormationEventAdd || ''));
        if (!candidate) return;
        this.addExternalEvent({
          type: candidate.type,
          seconds: candidate.startSeconds,
          intervalSeconds: candidate.intervalSeconds,
          repeatCount: candidate.repeatCount,
          sourceId: candidate.sourceId,
          value: candidate.value ?? candidate.conditionValue ?? candidate.triggerValue ?? '',
          triggerSourceId: candidate.triggerSourceId || '',
          conditionType: candidate.conditionType || '',
          conditionValue: candidate.conditionValue ?? '',
          status: candidate.status,
          statusDurationFrames: candidate.statusDurationFrames,
          reason: candidate.label,
          candidateId: candidate.id,
          candidateLabel: candidate.label,
          candidateBasis: candidate.basis || '',
          candidateEffectLabels: Array.isArray(candidate.effectLabels) ? candidate.effectLabels : [],
          timingMode: candidate.timingMode || '',
          eventClass: candidate.eventClass || '',
          eventLabel: candidate.eventLabel || '',
          repeatability: candidate.repeatability || '',
          inputMode: candidate.inputMode || ''
        });
      }
    }

    handleDetailChange(event) {
      if (event.target.closest?.('[data-fdc-dps-runtime-mode], [data-fdc-dps-runtime-stacks]')) {
        this.handleRuntimeEffectSettingChange(event);
        return;
      }
      if (event.target.closest?.('[data-fdc-dps-external-type], [data-fdc-dps-external-seconds], [data-fdc-dps-external-interval], [data-fdc-dps-external-count], [data-fdc-dps-external-source], [data-fdc-dps-external-value], [data-fdc-dps-external-reason], [data-fdc-dps-external-status], [data-fdc-dps-external-status-duration]')) {
        this.handleExternalInputChange();
      }
    }

    refreshDamageGraphModel() {
      this.damageGraphModel = createDpsDamageGraphModel(
        this.latest?.single || null,
        this.baseline?.single || null
      );
    }

    renderDamageGraphs({ detail = true, sparkline = true } = {}) {
      if (sparkline) drawSparkline(this.elements.sparkline, this.damageGraphModel?.current || null);
      if (detail) {
        const canvas = this.elements.detailGrid?.querySelector?.('[data-fdcp-damage-graph]');
        drawDpsDamageGraph(canvas, this.damageGraphModel);
      }
    }

    run() {
      if (!this.dpsModeActive || this.running) return;
      // ボタン操作で直前の入力欄からchangeが届かない環境でも、計算開始時点の
      // 外部イベント設定を取り込む。状態欄を含むDOM入力を古いstateで上書きしない。
      const detailEvents = this.readExternalEventsFromDetail();
      if (detailEvents.length || this.externalEventsInitialized) {
        this.externalEvents = detailEvents;
        this.externalEventsInitialized = true;
      }
      const available = this.refreshAvailability({ render: true });
      if (!this.dpsModeActive || !available?.support?.supported) return;
      const simulator = window.TRICKCAL_DPS_SIMULATOR;
      const timing = window.DPS_TIMING_DATA?.apostles?.[String(available.snapshot.targetId || '').toLowerCase()];
      if (!simulator || !timing || !available.snapshot.apostle) {
        this.renderAdapterError(new Error('DPS計算モジュール、タイミングデータ、または使徒データを読み込めませんでした。'));
        return;
      }
      this.running = true;
      const runToken = ++this.runToken;
      const cancellation = createRunCancellation();
      this.activeCancellation = cancellation;
      this.elements.run.disabled = true;
      this.elements.run.textContent = '計算中…';
      this.renderRecalculationState();
      this.updateBaselineControls();
      const snapshot = this.createInputSnapshot(available.snapshot);
      const support = available.support;
      const options = this.getOptions();
      const runFingerprint = createDpsInputFingerprint(snapshot, options);
      const fallbackNotes = new Set();
      const noteFallback = message => fallbackNotes.add(message);
      // UIを先に更新してから計算を開始し、長いseed計算でも状態が見えるようにする。
      setTimeout(async () => {
        try {
          if (!this.isCurrentRun(runToken, cancellation)) return;
          const config = simulator.buildCombatantConfig(snapshot.apostle, timing, {
            scenario: snapshot.scenario,
            skillLevels: snapshot.skillLevels,
            skillOverrides: snapshot.dpsSkillOverrides,
            timingBranches: snapshot.dpsTimingBranches,
            runtimeEffects: snapshot.dpsRuntimeSimulationEffects || snapshot.runtimeEffects,
            externalEvents: snapshot.externalEvents || [],
            enemySize: snapshot.scenario?.battleConditions?.enemySize || snapshot.scenario?.actors?.enemy?.size || '',
            enemySizeRank: snapshot.scenario?.battleConditions?.enemySizeRank || snapshot.scenario?.actors?.enemy?.sizeRank || 0
          });
          const singleOptions = {
            ...options,
            recordTimeline: true,
            recordDamageSeries: true,
            externalEvents: snapshot.externalEvents || [],
            damageProfiles: snapshot.actionDamageProfiles || {},
            statusDamageProfiles: snapshot.statusDamageProfiles || {}
          };
          const aggregateOptions = {
            ...options,
            recordTimeline: false,
            recordDamageSeries: false,
            externalEvents: snapshot.externalEvents || [],
            damageProfiles: snapshot.actionDamageProfiles || {},
            statusDamageProfiles: snapshot.statusDamageProfiles || {}
          };
          const single = await runSimulationWorker(config, singleOptions, 'single', null, noteFallback, cancellation);
          if (!this.isCurrentRun(runToken, cancellation)) return;
          this.elements.state.textContent = '単一seed完了 / 複数seedを集計中';
          const aggregate = await runSimulationWorker(config, aggregateOptions, 'aggregate', progress => {
            if (this.isCurrentRun(runToken, cancellation)) this.elements.state.textContent = `複数seedを集計中 ${formatNumber(progress.completed)} / ${formatNumber(progress.total)}`;
          }, noteFallback, cancellation);
          if (!this.isCurrentRun(runToken, cancellation)) return;
          // 計算中に通常計算側の育成・装備・スキル、または詳細設定が変わった場合、
          // 旧結果を表示したまま再計算を求める。次のrun完了時にだけ差し替える。
          const currentSnapshot = this.createInputSnapshot(createDpsSnapshotWithRuntimeOverrides(this.adapter));
          const currentFingerprint = createDpsInputFingerprint(currentSnapshot, this.getOptions());
          if (!this.isCurrentRun(runToken, cancellation)) return;
          if (currentFingerprint !== runFingerprint) {
            this.requiresRecalculation = true;
            this.renderAvailability(currentSnapshot, this.getSupport(currentSnapshot));
            return;
          }
          this.latest = {
            snapshot, support, options, axis: this.createAxis(snapshot, options), config, single, aggregate,
            inputFingerprint: runFingerprint, fallbackNote: Array.from(fallbackNotes).join(' / ')
          };
          this.timelineVisibleLimit = 160;
          this.requiresRecalculation = false;
          this.clearComparison();
          this.lastAutoFingerprint = getAutoRunCompletionFingerprint(runFingerprint);
          this.renderLatest();
        } catch (error) {
          if (this.isCurrentRun(runToken, cancellation) && !isRunCancelledError(error)) this.renderAdapterError(error);
        } finally {
          if (this.runToken !== runToken || this.activeCancellation !== cancellation) return;
          this.running = false;
          this.activeCancellation = null;
          if (this.requiresRecalculation && this.latest?.aggregate) this.renderRecalculationState();
          this.elements.run.textContent = 'DPS計算';
          this.elements.run.disabled = false;
          this.updateBaselineControls();
          if (this.dpsModeActive && this.pendingAutoRun) {
            this.pendingAutoRun = false;
            this.refreshAvailability();
            this.requestAutoRun();
          }
        }
      }, 0);
    }

    renderLatest() {
      const { aggregate, support, options, config } = this.latest;
      const trialSummary = getTrialSummary(options, aggregate);
      this.setRecalculationIndicator({ visible: false });
      this.elements.value.textContent = formatDamage(aggregate.meanDps);
      this.renderProvisionalBadge(support);
      this.elements.state.textContent = `${support.label} / ${support.configuration}`;
      this.elements.meta.textContent = `${trialSummary.compact} / ${options.durationSeconds}秒`;
      this.elements.drawerStatus.textContent = `計算済み: ${trialSummary.compact} / ${options.durationSeconds}秒`;
      this.refreshDamageGraphModel();
      this.renderDpsDetail();
      this.renderCollapsedBreakdown(createDpsBottomBreakdown(aggregate));
      this.elements.sparklineMeta.textContent = `${options.durationSeconds}秒 / seed ${this.latest.single?.seed || options.seed}`;
      this.applyBaselineComparison({ resultReady: true });
    }

    renderCollapsedBreakdown(rows = null) {
      const items = rows || createDpsBottomBreakdown(null);
      if (!rows) {
        this.elements.sparklineMeta.textContent = `${this.getOptions().durationSeconds}秒 / seed ${this.getOptions().seed}`;
      }
      items.forEach(item => {
        const cell = document.querySelector(`[data-fdcp-breakdown="${item.key}"]`);
        if (!cell) return;
        const value = cell.querySelector('[data-fdcp-column="dps"]');
        const delta = cell.querySelector('[data-fdcp-column="delta"]');
        const share = cell.querySelector('[data-fdcp-column="share"]');
        const count = cell.querySelector('[data-fdcp-column="count"]');
        if (value) value.textContent = item.placeholder ? '—' : formatDamage(item.contributionDps);
        this.renderBreakdownDelta(delta, item.key);
        if (share) share.textContent = item.placeholder ? '—' : formatPercent(item.damageShareP);
        if (count) count.textContent = item.placeholder || item.key === 'other' ? '—' : `${formatNumber(item.averageStarts)}回`;
      });
      this.renderDamageGraphs({ detail: false, sparkline: true });
    }

    renderBreakdownDelta(element, key) {
      if (!element) return;
      const row = this.comparison?.breakdown?.find(item => item.key === key);
      if (!row) {
        element.textContent = '';
        element.title = '基準比';
        element.setAttribute('aria-hidden', 'true');
        delete element.dataset.deltaState;
        return;
      }
      const percent = formatSignedPercent(row.percentChange);
      const text = formatCompactComparisonDelta(row.percentChange);
      const difference = formatSignedDamage(row.differenceDps);
      const description = percent
        ? `基準比 ${percent}（差分 ${difference} DPS）`
        : `基準比なし（基準DPSが0 / 差分 ${difference} DPS）`;
      element.textContent = text;
      element.title = description;
      element.setAttribute('aria-label', description);
      element.setAttribute('aria-hidden', 'false');
      element.dataset.deltaState = getDeltaState(row.differenceDps);
    }

    renderTotalDelta() {
      const element = this.elements.totalDelta;
      const comparison = this.comparison;
      if (!comparison) {
        element.hidden = true;
        element.textContent = '';
        element.removeAttribute('aria-label');
        element.removeAttribute('title');
        delete element.dataset.deltaState;
        return;
      }
      const percent = formatSignedPercent(comparison.meanDpsPercent);
      const text = formatCompactComparisonDelta(comparison.meanDpsPercent);
      const difference = formatSignedDamage(comparison.meanDpsDifference);
      const description = percent
        ? `基準比 ${percent}（差分 ${difference} DPS）`
        : `基準比なし（基準DPSが0 / 差分 ${difference} DPS）`;
      element.hidden = false;
      element.textContent = text;
      element.setAttribute('aria-label', description);
      element.title = description;
      element.dataset.deltaState = getDeltaState(comparison.meanDpsDifference);
    }

    renderDpsDetail() {
      this.renderDpsExternalInput();
      const grid = this.elements.detailGrid;
      if (!grid) return;
      const latest = this.latest;
      const commonGroups = [
        {
          title: '',
          className: 'is-wide',
          content: renderDpsDamageGraphContent()
        }
      ];
      if (!latest?.aggregate) {
        const state = this.elements.drawerStatus?.textContent || '計算前';
        grid.innerHTML = renderDpsDetailGroups([
          { title: '計算状態', rows: [['状態', getDpsDetailStatusLabel(state)]] },
          ...commonGroups
        ]);
      } else {
        const { aggregate, options, support, snapshot, config } = latest;
        const trialSummary = getTrialSummary(options, aggregate);
        const timingRows = createDpsTimingDetailRows(config || {});
        const groups = [
          {
            title: '計測情報',
            rows: [
              ['平均総ダメージ', formatDamage(aggregate.totalExpectedDamage)],
              ['ばらつき（P10～P90）', `${formatDamage(aggregate.range?.p10)}～${formatDamage(aggregate.range?.p90)}`],
              ['計測時間', `${formatNumber(options.durationSeconds)}秒`],
              ['統計試行', `${formatNumber(trialSummary.evaluated)}回`],
              ['編成行動推定', getDpsFormationTimelineModeLabel(options.formationTimelineMode)],
              ['編成高学年', getDpsFormationHighModeLabel(options.formationHighSkillMode)]
            ]
          },
          ...(timingRows.length ? [{ title: '行動タイミング', className: 'is-wide', rows: timingRows }] : []),
          {
            title: '対応構成',
            rows: [['使徒', `${support.label} / ${support.configuration}${support.provisional ? `（暫定: ${support.provisionalLabel}）` : ''}`]]
          },
          ...commonGroups,
          {
            title: '',
            className: 'is-wide',
            content: renderDpsActionEffectContent(snapshot.actionEffectAudit || {}, snapshot.actionDamageProfiles || {}, snapshot.runtimeEffects || {}, this.latest.single || {}, snapshot.additionalDamageComponents || [])
          },
          {
            title: '',
            className: 'is-wide',
            content: renderDpsTimelineContent(this.latest.single || {}, this.timelineVisibleLimit)
          }
        ];
        if (this.comparison) {
          groups.push({
            title: '基準との差分',
            className: 'is-wide',
            rows: createDpsDetailComparisonRows(this.comparison)
          });
        }
        grid.innerHTML = renderDpsDetailGroups(groups);
      }
      this.renderDamageGraphs({ detail: true, sparkline: false });
    }

    showMoreTimeline() {
      if (!this.latest?.single?.timeline?.length) return;
      this.timelineVisibleLimit += 100;
      this.renderDpsDetail();
    }

    saveBaseline() {
      if (this.running) {
        this.elements.baselineNote.textContent = 'DPS計算の完了後に基準を保存してください。';
        return;
      }
      if (!this.latest?.aggregate) {
        this.elements.baselineNote.textContent = '比較用DPSの計算後に基準を保存してください。';
        return;
      }
      this.baseline = {
        axis: { ...this.latest.axis },
        aggregate: structuredCloneSafe(this.latest.aggregate),
        single: structuredCloneSafe(this.latest.single),
        breakdown: structuredCloneSafe(createDpsBottomBreakdown(this.latest.aggregate))
      };
      this.refreshDamageGraphModel();
      this.elements.baselineNote.textContent = `${this.latest.support.label}の現在条件を基準として保存しました。`;
      this.clearComparison({ render: true });
      this.updateBaselineControls();
    }

    applyBaselineComparison({ resultReady = false } = {}) {
      const compareAxis = this.currentAxis || this.latest?.axis;
      const isFresh = !!this.latest && this.latest.inputFingerprint === this.currentInputFingerprint;
      const decision = getBaselineComparisonDecision({
        hasBaseline: !!this.baseline,
        hasLatest: !!this.latest?.aggregate,
        isFresh,
        axesEqual: axesMatch(this.baseline?.axis, compareAxis),
        // 最新resultを描画する段階では、finally前でも計算本体は完了している。
        // ここでのみrunningを無視して、結果と同時に差分を反映する。
        running: resultReady ? false : this.running
      });
      if (decision !== 'apply') {
        this.clearComparison();
        if (decision === 'axes-mismatch') this.elements.baselineNote.textContent = '比較軸が異なります。使徒・敵・計測時間・DPS設定を基準と一致させてください。';
        else if (decision === 'stale') this.elements.baselineNote.textContent = '条件変更・再計算が必要です。再計算後に差分を自動表示します。';
        else if (decision === 'running') this.elements.baselineNote.textContent = 'DPSを再計算中です。完了後に差分を自動表示します。';
        if (!resultReady) this.updateBaselineControls();
        return decision;
      }
      this.comparison = createDpsComparison(this.baseline, {
        aggregate: this.latest.aggregate,
        breakdown: createDpsBottomBreakdown(this.latest.aggregate)
      });
      this.renderCollapsedBreakdown(createDpsBottomBreakdown(this.latest.aggregate));
      this.renderTotalDelta();
      this.renderDpsDetail();
      this.syncComparisonUi();
      this.elements.baselineNote.textContent = `基準との差分を表示中です。全体・行動別の差分は下バーで確認できます。`;
      return decision;
    }

    clearBaseline({ message = '基準は未保存です。' } = {}) {
      this.baseline = null;
      this.refreshDamageGraphModel();
      this.clearComparison({ render: true });
      this.elements.baselineNote.textContent = message;
      this.updateBaselineControls();
    }

    clearComparison({ render = false } = {}) {
      this.comparison = null;
      this.renderTotalDelta();
      this.renderDpsDetail();
      this.syncComparisonUi();
      if (render && this.latest?.aggregate) this.renderCollapsedBreakdown(createDpsBottomBreakdown(this.latest.aggregate));
    }

    syncComparisonUi() {
      const hasBaseline = !!this.baseline;
      const hasDifference = !!this.comparison;
      const state = hasDifference ? 'active' : hasBaseline ? 'waiting' : 'none';
      const toggle = this.elements.compareToggle;
      toggle?.classList?.toggle('is-active', hasBaseline);
      if (this.elements.compareToggleLabel) this.elements.compareToggleLabel.textContent = hasBaseline ? '比較中' : 'DPS比較';
      if (toggle) {
        toggle.setAttribute('aria-label', hasBaseline ? 'DPS比較中' : 'DPS比較');
        toggle.title = hasBaseline ? 'DPS比較を確認・更新・解除' : '現在条件を基準としてDPS比較';
      }
      if (this.elements.baselineNote) this.elements.baselineNote.dataset.fdcpComparisonState = state;
      if (this.elements.bottomBar) this.elements.bottomBar.dataset.fdcpComparison = state;
      if (this.elements.primary) this.elements.primary.dataset.fdcpComparison = state;
    }

    updateBaselineControls() {
      const compareAxis = this.currentAxis || this.latest?.axis;
      const isFresh = !!this.latest && this.latest.inputFingerprint === this.currentInputFingerprint;
      this.elements.baselineSave.disabled = !isFresh || this.running;
      this.elements.baselineClear.disabled = !this.baseline;
      if (this.baseline && this.running) this.elements.baselineNote.textContent = 'DPSを再計算中です。完了後に差分を自動表示します。';
      else if (this.baseline && !isFresh) this.elements.baselineNote.textContent = '条件変更・再計算が必要です。再計算後に差分を自動表示します。';
      else if (this.baseline && !axesMatch(this.baseline.axis, compareAxis)) this.elements.baselineNote.textContent = '比較軸が異なります。使徒・敵・計測時間・DPS設定を基準と一致させてください。';
      this.syncComparisonUi();
    }
  }

  function createElements() {
    return {
      bottomBar: document.getElementById('fdcp-bottom-bar'), primary: document.querySelector('.fdcp-dps-primary'), value: document.getElementById('fdcp-dps-value'), totalDelta: document.getElementById('fdcp-total-delta'), state: document.getElementById('fdcp-dps-state'), meta: document.getElementById('fdcp-dps-meta'), provisionalBadge: document.getElementById('fdcp-provisional-badge'), recalcIndicator: document.getElementById('fdcp-dps-recalc-indicator'), run: document.getElementById('fdcp-dps-run'),
      drawer: document.getElementById('fdcp-dps-detail-panel'), drawerStatus: document.getElementById('fdcp-drawer-status'), detailGrid: document.getElementById('fdcp-dps-detail-grid'),
      duration: document.getElementById('fdcp-duration'), highMode: document.getElementById('fdcp-high-mode'), formationTimelineMode: document.getElementById('fdcp-formation-timeline-mode'), formationHighMode: document.getElementById('fdcp-formation-high-mode'), highModeQuick: document.getElementById('fdcp-high-mode-quick'), seed: document.getElementById('fdcp-seed'), trials: document.getElementById('fdcp-trials'), autoRun: document.getElementById('fdcp-auto-run'), sparkline: document.getElementById('fdcp-sparkline'), sparklineMeta: document.getElementById('fdcp-sparkline-meta'),
      settingsToggle: document.getElementById('fdcp-dps-settings-toggle'), settingsPanel: document.getElementById('fdcp-dps-settings-panel'), settingsSlot: document.getElementById('fdcp-dps-settings-slot'), externalEventCount: document.getElementById('fdcp-dps-external-event-count'), externalInput: document.getElementById('fdcp-dps-external-input'), runtimeSettings: document.getElementById('fdcp-dps-runtime-settings'), compareToggle: document.getElementById('fdcp-dps-compare-toggle'), compareToggleLabel: document.getElementById('fdcp-dps-compare-toggle-label'), comparePanel: document.getElementById('fdcp-dps-compare-panel'), compareSlot: document.getElementById('fdcp-dps-compare-slot'),
      baselineSave: document.getElementById('fdcp-baseline-save'), baselineClear: document.getElementById('fdcp-baseline-clear'), baselineNote: document.getElementById('fdcp-baseline-note')
    };
  }

  function init() {
    const adapter = createDirectDamageAdapter();
    const elements = createElements();
    const controller = new PrototypeDpsController(adapter, elements);
    const bottomBar = document.getElementById('fdcp-bottom-bar');
    const dpsPanel = document.querySelector('[data-fdcp-panel="dps"]');
    const singleCompareToggle = document.getElementById('fdc-compare-float-toggle');
    const singleApplyToggle = document.getElementById('fdc-apply-float-toggle');
    const singleApplyPanel = document.getElementById('fdc-apply-float-panel');
    const singleComparePanel = document.getElementById('fdc-compare-float-panel');
    const saveMenu = document.getElementById('fdc-save-menu');
    const singleDetailPanel = document.getElementById('fdc-result-detail-panel');
    const singleDetailToggle = document.getElementById('fdc-result-detail-toggle');
    const dpsDetailToggle = document.getElementById('fdcp-dps-detail');
    const dpsModeToggle = document.querySelector('[data-fdcp-mode="dps"]');
    let currentMode = 'single';
    let refreshTimer = 0;
    // 通常計算側の既存click listenerが先にnative panelを開閉する。同期側から
    // 対象native panelを書き戻すと、閉じ操作を再度開いてしまうため保持できる。
    const applyFloatState = (active, { preserveNative = false } = {}) => {
      if (currentMode === 'dps' && (active === 'singleApply' || active === 'singleCompare')) active = 'none';
      const state = getExclusiveFloatState(active);
      if (!(preserveNative && active === 'singleApply')) singleApplyPanel.hidden = !state.singleApply;
      if (!(preserveNative && active === 'singleCompare')) singleComparePanel.hidden = !state.singleCompare;
      saveMenu.open = state.save;
      elements.settingsPanel.hidden = !state.dpsSettings;
      elements.comparePanel.hidden = !state.dpsCompare;
      singleApplyToggle.setAttribute('aria-expanded', String(state.singleApply));
      singleCompareToggle.setAttribute('aria-expanded', String(state.singleCompare));
      elements.settingsToggle.setAttribute('aria-expanded', String(state.dpsSettings));
      elements.compareToggle.setAttribute('aria-expanded', String(state.dpsCompare));
    };
    const setDpsDetailOpen = open => {
      elements.drawer.hidden = !open;
      dpsDetailToggle.setAttribute('aria-expanded', String(open));
      dpsDetailToggle.classList.toggle('is-open', open);
      document.body.classList.toggle('fdc-result-detail-open', open);
      if (open) {
        controller.renderDamageGraphs({ detail: true, sparkline: false });
        // The detail sheet may have been hidden when the first render ran.
        // Paint once after layout so the canvas measures its final visible
        // width instead of retaining the hidden-state fallback width.
        window.setTimeout(() => {
          if (!elements.drawer.hidden) controller.renderDamageGraphs({ detail: true, sparkline: false });
        }, 0);
      }
    };
    const syncHighModeQuickControl = () => {
      const quick = elements.highModeQuick;
      if (!quick) return;
      const auto = elements.highMode?.value === 'auto';
      const label = auto ? 'AUTO' : 'OFF';
      quick.dataset.fdcpHighMode = auto ? 'auto' : 'disabled';
      quick.setAttribute('aria-pressed', String(auto));
      quick.setAttribute('aria-label', `高学年モード: ${label}`);
      quick.title = `高学年: ${label}（クリックで${auto ? 'OFF' : 'AUTO'}へ切替）`;
      const labelElement = quick.querySelector?.('[data-fdcp-high-mode-label]');
      if (labelElement) labelElement.textContent = label;
    };
    const closeSingleDetail = () => {
      singleDetailPanel.hidden = true;
      singleDetailToggle.setAttribute('aria-expanded', 'false');
      singleDetailToggle.classList.remove('is-open');
      document.body.classList.remove('fdc-result-detail-open');
    };
    const renderDpsTabAvailability = availability => {
      // APIの起動途中は無効化しない。判定が取れた「未対応」だけをnative
      // disabledにして、クリック・keyboard・setModeの三経路を同じ可否へ寄せる。
      const state = getDpsTabAvailability(availability);
      dpsModeToggle.disabled = state.disabled;
      dpsModeToggle.setAttribute('aria-disabled', String(state.disabled));
      dpsModeToggle.title = state.title;
      dpsModeToggle.setAttribute('aria-label', state.ariaLabel);
    };
    const setMode = mode => {
      const dpsMode = mode === 'dps';
      // disabled buttonへのclickだけでなく、将来の外部APIやテストからの
      // setMode('dps')も拒否する。まだsnapshot APIが準備中の場合だけは、
      // 永久disableにせず画面内で再試行可能にする。
      if (dpsMode) {
        controller.refreshAvailability({ render: false });
        if (!controller.canEnterDpsMode()) return false;
      }
      currentMode = dpsMode ? 'dps' : 'single';
      // Float controls are siblings of the result bar, so its data-mode cannot
      // scope them.  This page-level attribute is also a CSS backstop when the
      // ordinary controller later removes a `hidden` attribute during render.
      document.body.dataset.fdcpMode = currentMode;
      controller.setDpsModeActive(dpsMode);
      if (!dpsMode) {
        window.clearTimeout(refreshTimer);
        refreshTimer = 0;
      }
      applyFloatState('none');
      if (dpsMode) closeSingleDetail(); else setDpsDetailOpen(false);
      bottomBar.dataset.mode = dpsMode ? 'dps' : 'single';
      dpsPanel.hidden = !dpsMode;
      elements.settingsSlot.hidden = !dpsMode;
      elements.compareSlot.hidden = !dpsMode;
      singleCompareToggle.hidden = dpsMode;
      singleApplyToggle.hidden = dpsMode;
      singleCompareToggle.setAttribute('aria-hidden', String(dpsMode));
      singleApplyToggle.setAttribute('aria-hidden', String(dpsMode));
      elements.settingsSlot.setAttribute('aria-hidden', String(!dpsMode));
      elements.compareSlot.setAttribute('aria-hidden', String(!dpsMode));
      if (dpsMode) {
        singleApplyPanel.hidden = true;
        singleComparePanel.hidden = true;
        singleApplyToggle.setAttribute('aria-expanded', 'false');
        singleCompareToggle.setAttribute('aria-expanded', 'false');
      }
      document.querySelectorAll('[data-fdcp-mode]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.fdcpMode === mode)));
      if (dpsMode) {
        controller.refreshAvailability();
        controller.requestAutoRun();
      }
      return true;
    };
    controller.onAvailabilityChange = availability => {
      syncHighModeQuickControl();
      renderDpsTabAvailability(availability);
      // DPS表示中に未対応構成へ変わった時だけ通常計算へ退避する。通常表示で
      // 未対応→対応になっても自動でDPSへ戻さず、ユーザーのtab選択を待つ。
      if (availability.transition?.forceSingle) setMode('single');
    };
    document.querySelectorAll('[data-fdcp-mode]').forEach(button => button.addEventListener('click', () => {
      if (button.disabled || button.getAttribute('aria-disabled') === 'true') return;
      setMode(button.dataset.fdcpMode);
    }));
    elements.run.addEventListener('click', () => controller.run());
    dpsDetailToggle.addEventListener('click', () => setDpsDetailOpen(elements.drawer.hidden));
    elements.highModeQuick?.addEventListener('click', () => {
      if (!elements.highMode) return;
      elements.highMode.value = elements.highMode.value === 'auto' ? 'disabled' : 'auto';
      syncHighModeQuickControl();
      elements.highMode.dispatchEvent(new Event('change', { bubbles: true }));
    });
    elements.detailGrid?.addEventListener('click', event => controller.handleDetailClick(event));
    elements.detailGrid?.addEventListener('change', event => controller.handleDetailChange(event));
    elements.settingsPanel?.addEventListener('click', event => {
      const externalMutation = event.target.closest?.(
        '[data-fdcp-dps-external-event-add], [data-fdc-dps-external-remove], [data-fdc-dps-formation-event-add]'
      );
      if (externalMutation) event.stopPropagation();
      controller.handleDetailClick(event);
      // 再描画で外側click判定の対象から外れても、外部イベントの追加・削除中は
      // DPS設定floatを開いたままにする。
      if (externalMutation) applyFloatState('dpsSettings');
    });
    elements.settingsPanel?.addEventListener('change', event => controller.handleDetailChange(event));
    const redrawDpsDamageGraph = () => {
      if (!elements.drawer.hidden) controller.renderDamageGraphs({ detail: true, sparkline: false });
    };
    window.addEventListener('resize', redrawDpsDamageGraph);
    window.addEventListener('trickcal:theme-changed', redrawDpsDamageGraph);
    elements.baselineSave.addEventListener('click', () => controller.saveBaseline());
    elements.baselineClear.addEventListener('click', () => controller.clearBaseline());
    elements.settingsToggle.addEventListener('click', () => {
      const show = elements.settingsPanel.hidden;
      applyFloatState(show ? 'dpsSettings' : 'none');
    });
    elements.compareToggle.addEventListener('click', () => {
      const show = elements.comparePanel.hidden;
      applyFloatState(show ? 'dpsCompare' : 'none');
    });
    // toggle自身のclick listenerが先に排他的な表示状態を確定する。document側では
    // その確定後のslot内外だけを見ることで、別のDPS toggleを押した場合も
    // 「閉じる」ではなく従来どおりのpanel切替として扱える。
    document.addEventListener('click', event => {
      const closeDpsFloat = getDpsFloatOutsideClickAction({
        currentMode,
        settingsOpen: !elements.settingsPanel.hidden,
        compareOpen: !elements.comparePanel.hidden,
        targetInSettings: !!elements.settingsSlot?.contains(event.target),
        targetInCompare: !!elements.compareSlot?.contains(event.target)
      });
      if (closeDpsFloat) applyFloatState(closeDpsFloat);
    });
    const syncNativeFloat = (panel, kind) => {
      scheduleNativeFloatSync(() => {
        // native listener後の実表示状態を唯一の入力にする。ここでは対象panelへ
        // 書き戻さず、他のDPS/save/native floatだけを排他的に閉じる。
        applyFloatState(getNativeFloatSyncState(panel.hidden, kind), { preserveNative: true });
      });
    };
    singleApplyToggle.addEventListener('click', () => { if (currentMode === 'single') syncNativeFloat(singleApplyPanel, 'singleApply'); });
    singleCompareToggle.addEventListener('click', () => { if (currentMode === 'single') syncNativeFloat(singleComparePanel, 'singleCompare'); });
    saveMenu.addEventListener('toggle', () => { if (saveMenu.open) applyFloatState('save'); });
    const refreshDpsSettings = () => {
      syncHighModeQuickControl();
      if (currentMode !== 'dps') return;
      controller.refreshAvailability();
      controller.requestAutoRun();
    };
    [elements.highMode, elements.formationTimelineMode, elements.formationHighMode, elements.duration, elements.seed, elements.trials, elements.autoRun]
      .forEach(input => input.addEventListener('change', refreshDpsSettings));
    const scheduleAvailabilityRefresh = ({ delay = 120 } = {}) => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        const activeDps = currentMode === 'dps';
        controller.refreshAvailability({ render: activeDps });
        // 通常計算中は対応可否だけを更新し、DPS simulationは絶対に開始しない。
        if (activeDps) controller.requestAutoRun();
      }, delay);
    };
    const isPrototypeControl = target => !!target?.closest?.('#fdcp-bottom-bar, #fdc-apply-float-controller');
    document.addEventListener('change', event => {
      if (!isPrototypeControl(event.target)) scheduleAvailabilityRefresh();
    }, { passive: true });
    document.addEventListener('input', event => {
      if (!isPrototypeControl(event.target)) scheduleAvailabilityRefresh();
    }, { passive: true });
    // 通常計算側にはclickだけで設定を変えるUIがある。DPS自身の操作は除外し、
    // 実際のsnapshot fingerprintが変化した場合だけ上で無効化する。
    document.addEventListener('click', event => {
      if (!isPrototypeControl(event.target)) scheduleAvailabilityRefresh();
    }, { passive: true });
    // 使徒ピッカーはselect/input changeではなく、view.targetIdを更新して
    // render()するclick系UI。通常計算がrenderResultの最後に発行するこの通知を
    // 主経路とし、render完了後のmicrotaskでsnapshotを取得する。
    window.addEventListener('trickcal:damage-calculator-rendered', () => {
      scheduleAvailabilityRefresh({ delay: 0 });
    });
    window.addEventListener('pagehide', () => controller.persistDpsSettingsForTarget());
    syncHighModeQuickControl();
    setMode('single');
    controller.refreshAvailability({ render: false });
    syncHighModeQuickControl();
  }

  function isDpsEnemyInputKey(key) {
    const value = String(key || '');
    return value.startsWith('enemy') || ['def', 'critRes', 'critDmgRes'].includes(value);
  }
  function createDpsComparisonAxis(snapshot = {}, options = {}) {
    const scenario = snapshot?.scenario || {};
    const battleConditions = scenario.battleConditions || {};
    const { inputs = {}, ...conditionAxis } = battleConditions;
    // battleConditions.inputs contains both sides' raw calculator fields. A
    // self-stat change is exactly what DPS comparison is meant to show, so it
    // must not turn into an enemy/axis mismatch. Keep the enemy fields here;
    // otherwise manually entered enemy defense/resistance changes would be
    // incorrectly accepted as the same comparison condition.
    const enemyInputs = Object.fromEntries(
      Object.entries(inputs || {}).filter(([key]) => isDpsEnemyInputKey(key))
    );
    return {
      targetId: String(snapshot?.targetId || ''),
      enemy: stableStringify({
        battleConditions: conditionAxis,
        enemy: scenario.actors?.enemy || {},
        inputs: enemyInputs
      }),
      durationSeconds: Number(options.durationSeconds) || 0,
      highSkillMode: options.highSkillMode || 'disabled',
      initialActionDelayFrames: Number(options.initialActionDelayFrames) || 0,
      seed: Number(options.seed) || 0,
      trials: Number(options.trials) || 0,
      formationTimelineMode: options.formationTimelineMode || 'off',
      formationHighSkillMode: options.formationHighSkillMode || 'disabled'
    };
  }
  function axesMatch(left = {}, right = {}) { return ['targetId', 'enemy', 'durationSeconds', 'highSkillMode', 'initialActionDelayFrames', 'seed', 'trials', 'formationTimelineMode', 'formationHighSkillMode'].every(key => left[key] === right[key]); }
  function getBaselineComparisonDecision({ hasBaseline = false, hasLatest = false, isFresh = false, axesEqual = false, running = false } = {}) {
    if (!hasBaseline) return 'none';
    if (running) return 'running';
    if (!hasLatest || !isFresh) return 'stale';
    return axesEqual ? 'apply' : 'axes-mismatch';
  }
  function getSnapshotFreshness(latestFingerprint = '', currentFingerprint = '', isRunning = false) {
    const hasLatest = !!latestFingerprint;
    const changed = hasLatest && latestFingerprint !== currentFingerprint;
    return Object.freeze({ changed, shouldInvalidate: changed && !isRunning });
  }
  function getAutoRunDecision({ dpsModeActive = true, autoEnabled = false, running = false, fingerprint = '', lastFingerprint = '', requiresRecalculation = false } = {}) {
    if (!dpsModeActive || !autoEnabled || !fingerprint) return 'none';
    if (running) return 'pending';
    return fingerprint !== lastFingerprint || requiresRecalculation ? 'schedule' : 'none';
  }
  function getDpsTabAvailability({ ready = false, support = null, error = null } = {}) {
    const disabled = !!ready && !support?.supported;
    const reason = support?.reason || error?.message || 'DPS対応を確認中です。';
    const label = support?.label || 'この使徒';
    const configuration = support?.configuration || 'DPS対応構成';
    return Object.freeze({
      disabled,
      title: disabled ? reason : (support?.supported ? `${label} / ${configuration}${support.provisional ? `（暫定: ${support.provisionalLabel}）` : ''}` : 'DPS対応を確認中です。'),
      ariaLabel: disabled ? `DPS（利用不可: ${reason}）` : (support?.provisional ? `DPS（暫定: ${support.provisionalLabel}）` : 'DPS')
    });
  }
  function getDpsTargetChangeTransition({ previousTargetId = '', nextTargetId = '', dpsModeActive = false, supportKnown = false, supported = false, autoEnabled = false } = {}) {
    const before = String(previousTargetId || '').trim().toLowerCase();
    const after = String(nextTargetId || '').trim().toLowerCase();
    const targetChanged = !!before && !!after && before !== after;
    return Object.freeze({
      targetChanged,
      clearBaseline: targetChanged,
      cancelRun: targetChanged && !!dpsModeActive,
      forceSingle: !!dpsModeActive && !!supportKnown && !supported,
      scheduleAuto: targetChanged && !!dpsModeActive && !!supportKnown && !!supported && !!autoEnabled
    });
  }
  function getAutoRunCompletionFingerprint(runFingerprint = '') { return String(runFingerprint || ''); }
  function getExclusiveFloatState(active = 'none') {
    return Object.freeze({
      singleApply: active === 'singleApply', singleCompare: active === 'singleCompare', save: active === 'save',
      dpsSettings: active === 'dpsSettings', dpsCompare: active === 'dpsCompare'
    });
  }
  function getDpsFloatOutsideClickAction({ currentMode = 'single', settingsOpen = false, compareOpen = false, targetInSettings = false, targetInCompare = false } = {}) {
    if (currentMode !== 'dps' || (!settingsOpen && !compareOpen)) return null;
    if ((settingsOpen && targetInSettings) || (compareOpen && targetInCompare)) return null;
    return 'none';
  }
  function getNativeFloatSyncState(panelHidden = true, kind = 'none') {
    if (panelHidden) return 'none';
    return kind === 'singleApply' || kind === 'singleCompare' ? kind : 'none';
  }
  function scheduleNativeFloatSync(callback) {
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(callback);
      return;
    }
    window.setTimeout(callback, 0);
  }
  function createRunCancelledError() {
    const error = new Error('DPS計算を中止しました。');
    error.name = 'DpsRunCancelledError';
    return error;
  }
  function isRunCancelledError(error) { return error?.name === 'DpsRunCancelledError'; }
  function createRunCancellation() {
    let cancelled = false;
    const listeners = new Set();
    return Object.freeze({
      get cancelled() { return cancelled; },
      cancel() {
        if (cancelled) return;
        cancelled = true;
        listeners.forEach(listener => listener());
        listeners.clear();
      },
      onCancel(listener) {
        if (typeof listener !== 'function') return () => {};
        if (cancelled) { listener(); return () => {}; }
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
    });
  }
  function shouldApplyRunResult({ dpsModeActive = false, runToken = 0, currentToken = 0, cancelled = false } = {}) {
    return !!dpsModeActive && runToken === currentToken && !cancelled;
  }
  function createDpsBottomBreakdown(aggregate = null) {
    const keys = ['basicAttack', 'enhancedAttack', 'lowSkill', 'highSkill'];
    if (!aggregate || !(Number(aggregate.meanDps) >= 0)) return [...keys, 'other'].map(key => ({ key, placeholder: true }));
    const total = Math.max(0, Number(aggregate.meanDps) || 0);
    const rows = keys.map(key => {
      const item = aggregate.byAction?.[key] || {};
      return { key, contributionDps: Math.max(0, Number(item.contributionDps) || 0), averageStarts: Number(item.averageStarts) || 0 };
    });
    const actionTotal = rows.reduce((sum, row) => sum + row.contributionDps, 0);
    const other = Math.max(0, total - actionTotal);
    return [...rows, { key: 'other', contributionDps: other, averageStarts: null }].map(row => ({
      ...row,
      damageShareP: total > 0 ? row.contributionDps / total * 100 : 0
    }));
  }
  function getTrialSummary(options = {}, aggregate = {}) {
    const requested = Math.max(1, Math.floor(Number(options.trials) || Number(aggregate.trials) || 1));
    const evaluated = Math.max(0, Math.floor(Number(aggregate.evaluatedTrials) || 0));
    const actual = evaluated || Math.max(1, Math.floor(Number(aggregate.trials) || requested));
    const lastSeed = Math.max(1, Math.floor(Number(options.seed) || Number(aggregate.baseSeed) || 1)) + actual - 1;
    const truncated = actual !== requested;
    return Object.freeze({
      requested, evaluated: actual, lastSeed, truncated,
      compact: truncated ? `${actual} / 指定${requested} seed` : `${actual} seed`,
      detail: truncated ? `統計試行数 指定${requested} seed / 実行${actual} seed（短縮）` : `統計試行数 ${actual} seed`
    });
  }
  function getDpsFormationTimelineModeLabel(mode = 'off') {
    return mode === 'supportEstimate' ? '支援効果のみ推定' : 'OFF';
  }
  function getDpsFormationHighModeLabel(mode = 'disabled') {
    return mode === 'auto' ? 'オート発動' : '発動なし';
  }
  function createDpsComparison(baseline = {}, current = {}) {
    const beforeAggregate = baseline.aggregate || {};
    const afterAggregate = current.aggregate || {};
    const beforeRows = baseline.breakdown || createDpsBottomBreakdown(beforeAggregate);
    const afterRows = current.breakdown || createDpsBottomBreakdown(afterAggregate);
    // 比較欄の数値は整数表示なので、表示上0になる小さな残差を割合計算へ
    // 持ち込まない。特に「その他」は総DPSから行動DPSを引いた残差のため、
    // 丸め誤差だけで0→0が-100%になることがある。
    const normalizeComparisonValue = value => {
      const number = Number(value);
      return Number.isFinite(number) && Math.abs(number) >= .5 ? number : 0;
    };
    const compareValue = (before, after) => {
      const base = normalizeComparisonValue(before);
      const now = normalizeComparisonValue(after);
      const difference = now - base;
      return { before: base, after: now, difference, percentChange: base === 0 ? (now === 0 ? 0 : null) : difference / base * 100 };
    };
    const meanDps = compareValue(beforeAggregate.meanDps, afterAggregate.meanDps);
    const totalExpectedDamage = compareValue(beforeAggregate.totalExpectedDamage, afterAggregate.totalExpectedDamage);
    const p10 = compareValue(beforeAggregate.range?.p10, afterAggregate.range?.p10);
    const p90 = compareValue(beforeAggregate.range?.p90, afterAggregate.range?.p90);
    return Object.freeze({
      baselineDps: meanDps.before, currentDps: meanDps.after, meanDpsDifference: meanDps.difference, meanDpsPercent: meanDps.percentChange,
      totalExpectedDamage, p10, p90,
      breakdown: afterRows.map(row => {
        const baselineRow = beforeRows.find(item => item.key === row.key) || {};
        const values = compareValue(baselineRow.contributionDps, row.contributionDps);
        return Object.freeze({ key: row.key, differenceDps: values.difference, percentChange: values.percentChange });
      })
    });
  }
  function stableStringify(value) {
    const normalize = item => {
      if (Array.isArray(item)) return item.map(normalize);
      if (item && typeof item === 'object') return Object.fromEntries(Object.keys(item).sort().map(key => [key, normalize(item[key])]));
      return item;
    };
    try { return JSON.stringify(normalize(value)); } catch { return ''; }
  }
  function createDpsInputFingerprint(snapshot = {}, options = {}) {
    const source = stableStringify(createDpsInputProjection(snapshot));
    const settings = stableStringify({
      durationSeconds: options.durationSeconds,
      highSkillMode: options.highSkillMode,
      initialActionDelayFrames: options.initialActionDelayFrames,
      seed: options.seed,
      trials: options.trials,
      formationTimelineMode: options.formationTimelineMode,
      formationHighSkillMode: options.formationHighSkillMode
    });
    return createFingerprint(`${source}\n${settings}`);
  }
  // captureCombatScenario()のcapturedAt等は計算値に影響しない。snapshot全体を
  // fingerprint化すると毎回の生成時刻だけで結果を無効化してしまうため、DPS計算に
  // 渡す入力だけへ投影する。
  function createDpsInputProjection(snapshot = {}) {
    const scenario = snapshot.scenario || {};
    return {
      targetId: snapshot.targetId || '',
      skillLevels: snapshot.skillLevels || {},
      damageType: snapshot.damageType || '',
      actionCategory: snapshot.actionCategory || '',
      selectedSkillOptionKey: snapshot.selectedSkillOptionKey || '',
      apostle: snapshot.apostle || null,
      dpsSkillOverrides: snapshot.dpsSkillOverrides || {},
      dpsTimingBranches: snapshot.dpsTimingBranches || {},
      selectedSkillOptions: snapshot.selectedSkillOptions || [],
      actionDamageProfiles: snapshot.actionDamageProfiles || {},
      additionalDamageComponents: snapshot.additionalDamageComponents || [],
      statusDamageProfiles: snapshot.statusDamageProfiles || {},
      runtimeEffects: snapshot.runtimeEffects || {},
      externalEvents: normalizeDpsExternalEvents(snapshot.externalEvents || []),
      scenario: {
        actors: scenario.actors || {},
        characterState: scenario.characterState || {},
        formationState: scenario.formationState || {},
        cardState: scenario.cardState || {},
        battleConditions: scenario.battleConditions || {},
        effectAssumptions: scenario.effectAssumptions || {}
      }
    };
  }
  function createFingerprint(text = '') {
    let hashA = 2166136261; let hashB = 2246822507;
    for (let index = 0; index < text.length; index += 1) {
      const code = text.charCodeAt(index);
      hashA = Math.imul(hashA ^ code, 16777619);
      hashB = Math.imul(hashB ^ code, 3266489917);
    }
    return `${text.length}:${hashA >>> 0}:${hashB >>> 0}`;
  }
  function structuredCloneSafe(value) { return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
  function formatNumber(value) { const number = Number(value) || 0; return Number.isInteger(number) ? number.toLocaleString('ja-JP') : number.toFixed(2).replace(/\.?0+$/, ''); }
  function formatDamage(value) { return Math.round(Number(value) || 0).toLocaleString('ja-JP'); }
  function formatPercent(value) { return `${(Number(value) || 0).toFixed(1)}%`; }
  function getDeltaState(value) { const number = Number(value) || 0; return number > 0 ? 'positive' : number < 0 ? 'negative' : 'zero'; }
  function formatSignedDamage(value) { const number = Math.round(Number(value) || 0); return number === 0 ? '±0' : `${number > 0 ? '+' : '-'}${formatDamage(Math.abs(number))}`; }
  function formatSignedPercent(value) { if (value === null || value === undefined || !Number.isFinite(Number(value))) return ''; const number = Number(value); return number === 0 ? '±0.0%' : `${number > 0 ? '+' : '-'}${Math.abs(number).toFixed(1)}%`; }
  function formatCompactComparisonDelta(value) {
    return value !== null && value !== undefined && Number(value) === 0 ? '±0' : formatSignedPercent(value) || '基準0';
  }
  function getDpsDetailStatusLabel(state = '') {
    if (/未対応|利用できません/.test(state)) return 'この構成ではDPSを利用できません。';
    if (/エラー/.test(state)) return 'DPS入力を準備できません。通常計算の設定を確認してください。';
    if (/再計算必要/.test(state)) return '設定が変更されました。DPSを再計算してください。';
    if (/計算中/.test(state)) return 'DPSを計算しています。';
    return 'DPSを計算すると詳細を表示します。';
  }
  function renderDpsDetailGroups(groups = []) {
    return groups.map(group => `
      <section class="fdc-result-detail-group ${escapeAttr(group.className || '')}">
        ${group.title ? `<h3>${escapeHtml(group.title)}</h3>` : ''}
        ${group.content || ''}
        ${group.rows?.length ? group.rows.map(renderDpsDetailRow).join('') : ''}
      </section>
    `).join('');
  }
  function renderDpsDetailRow(row) {
    const normalized = Array.isArray(row) ? { label: row[0], value: row[1] } : (row || {});
    const classes = ['fdc-result-detail-row', normalized.className || ''].filter(Boolean).join(' ');
    return `<div class="${escapeAttr(classes)}"><span>${escapeHtml(normalized.label)}</span><strong>${escapeHtml(normalized.value)}</strong></div>`;
  }
  function formatDpsFrameValue(frames) {
    const number = Number(frames);
    if (!Number.isFinite(number)) return '—';
    return `${formatNumber(number)}F（${formatNumber(number / 60)}秒）`;
  }
  function formatDpsVariantLabel(variant = '', explicitLabel = '') {
    const raw = String(variant || '').trim();
    const label = String(explicitLabel || '').trim();
    if (label) return label;
    if (!raw || raw === 'default') return '';
    if (/^__exclusive:/.test(raw)) return '確率分岐';
    if (/^__/.test(raw)) return '分岐';
    return raw;
  }
  function formatDpsTimelineQualitySuffix(event = {}) {
    return ({
      provisional: '（暫定時刻）',
      fallbackEnd: '（終了時補完）',
      external: '（外部指定）',
      'initial-target': '（初期対象仮定）'
    })[String(event?.timingQuality || '').trim()] || '';
  }
  function formatDpsTimelineFallbackLabel(event = {}) {
    const label = String(event?.label || '').trim();
    if (/^__exclusive:/.test(label)) return '確率分岐';
    if (/^__[A-Za-z0-9:_-]+$/.test(label)) return 'イベント';
    if (/(?:^|[_:])(?:favorite|aside)_\d+_e\d+$/i.test(label)) return '効果';
    return label || EXTERNAL_EVENT_TYPES[event?.type] || 'イベント';
  }
  function createDpsTimingDetailRows(config = {}) {
    const rows = [];
    const normalInterval = Number(config?.normalAttackIntervalFrames);
    const adjustedInterval = Number(config?.initialNormalAttackIntervalFrames);
    if (Number.isFinite(normalInterval)) rows.push(['普通攻撃間隔（補正前）', formatDpsFrameValue(normalInterval)]);
    if (Number.isFinite(adjustedInterval)) {
      const initialAttackSpeed = Number(config?.initialAttackSpeedP);
      const correction = Number.isFinite(initialAttackSpeed) && Math.abs(initialAttackSpeed) > 0.0001
        ? ` / 開始時攻撃速度${formatSignedPercent(initialAttackSpeed)}`
        : '';
      rows.push(['普通攻撃間隔（補正後）', `${formatDpsFrameValue(adjustedInterval)}${correction}`]);
    }
    Object.entries(ACTION_LABELS).forEach(([actionKey, defaultLabel]) => {
      const action = config?.actions?.[actionKey];
      if (!action) return;
      const variants = Object.entries(action.motionFramesByVariant || {})
        .filter(([, frames]) => Number.isFinite(Number(frames)))
        .map(([branch, frames]) => ({ branch, frames: Number(frames) }));
      if (!variants.length && Number.isFinite(Number(action.motionFrames))) {
        variants.push({ branch: '', frames: Number(action.motionFrames) });
      }
      if (!variants.length) return;
      const hasExclusiveVariants = variants.some(({ branch }) => /^__exclusive:/.test(String(branch || '')));
      const displayVariants = hasExclusiveVariants
        ? variants.filter(({ branch }) => branch !== 'default')
        : variants;
      const distinctFrames = new Set(displayVariants.map(({ frames }) => Number(frames))).size > 1;
      const values = (distinctFrames ? displayVariants : displayVariants.slice(0, 1)).map(({ branch, frames }, index) => {
        const branchLabel = distinctFrames && branch && branch !== 'default'
          ? formatDpsVariantLabel(branch, action.variantLabels?.[branch]) || `分岐${index + 1}`
          : '';
        return `${branchLabel ? `${branchLabel}: ` : ''}${formatDpsFrameValue(frames)}`;
      });
      rows.push([`${action.label || defaultLabel}のモーション硬直`, values.join(' / ')]);
    });
    return rows;
  }

  function renderDpsExternalEventRow(event = {}, index = 0) {
    const type = String(event.type || 'shieldBreak');
    const isFormationCandidate = !!String(event.candidateId || '').trim();
    const timingModeLabel = event.timingMode === 'event'
      ? '非周期・発生秒指定'
      : event.timingMode === 'periodic' ? '周期推定' : '';
    const repeatabilityLabel = ({ once: '一回型', repeatable: '反復型', counted: 'カウント型' })[event.repeatability] || '';
    const eventTitle = isFormationCandidate
      ? String(event.candidateLabel || event.reason || EXTERNAL_EVENT_TYPES[type] || type)
      : '';
    const candidateEffectSummary = isFormationCandidate
      ? formatDpsExternalCandidateEffectSummary(event, 2)
      : '';
    const summaryParts = [];
    if (timingModeLabel) summaryParts.push(timingModeLabel);
    if (repeatabilityLabel) summaryParts.push(repeatabilityLabel);
    if (isFormationCandidate && event.candidateBasis) summaryParts.push(event.candidateBasis);
    if (event.status) {
      const statusDuration = Number(event.statusDurationFrames);
      summaryParts.push(`状態: ${event.status}${statusDuration > 0 ? ` / ${formatNumber(statusDuration / 60)}秒` : ' / 計測中維持'}`);
    }
    const candidateMetadata = {
      timingMode: event.timingMode || '',
      eventClass: event.eventClass || '',
      eventLabel: event.eventLabel || '',
      repeatability: event.repeatability || '',
      inputMode: event.inputMode || '',
      triggerSourceId: event.triggerSourceId || '',
      conditionType: event.conditionType || '',
      conditionValue: event.conditionValue ?? ''
    };
    const candidateAttributes = isFormationCandidate
      ? ` data-fdcp-external-candidate-id="${escapeAttr(event.candidateId)}" data-fdcp-external-candidate-label="${escapeAttr(event.candidateLabel || eventTitle)}" data-fdcp-external-candidate-basis="${escapeAttr(event.candidateBasis || '')}" data-fdcp-external-candidate-effects="${escapeAttr(JSON.stringify(event.candidateEffectLabels || []))}" data-fdcp-external-candidate-meta="${escapeAttr(JSON.stringify(candidateMetadata))}"`
      : '';
    const typeOptions = getExternalEventTypeEntries(type)
      .map(([value, label]) => `<option value="${escapeAttr(value)}"${value === type ? ' selected' : ''}>${escapeHtml(label)}</option>`)
      .join('');
    const customType = !Object.prototype.hasOwnProperty.call(EXTERNAL_EVENT_TYPES, type) && type
      ? `<option value="${escapeAttr(type)}" selected>${escapeHtml(type)}</option>`
      : '';
    const eventIdentity = isFormationCandidate
      ? `<input type="hidden" value="${escapeAttr(type)}" data-fdc-dps-external-type><strong>${escapeHtml(eventTitle)}</strong>`
      : `<label class="is-type"><span>イベント</span><select data-fdc-dps-external-type>${typeOptions}${customType}</select></label>`;
    const eventSummary = candidateEffectSummary
      ? `<strong class="is-effect">発動効果: ${escapeHtml(candidateEffectSummary)}</strong>${summaryParts.length ? `<small>${escapeHtml(summaryParts.join(' / '))}</small>` : ''}`
      : summaryParts.length
      ? `<small>${escapeHtml(summaryParts.join(' / '))}</small>`
      : (!isFormationCandidate ? '<small>時刻を手動設定</small>' : '');
    return `
      <div class="fdc-dps-external-event-row${isFormationCandidate ? ' is-formation-candidate' : ''}${event.timingMode === 'event' ? ' is-event-driven' : ''}" data-fdcp-external-index="${index}"${candidateAttributes}>
        <div class="fdc-dps-external-event-compact">
          <div class="fdc-dps-external-event-identity">${eventIdentity}${eventSummary}</div>
          <label class="is-start"><span>発動秒</span><input type="number" min="0" max="600" step="0.1" value="${escapeAttr(formatNumber((Number(event.frame) || 0) / 60))}" data-fdc-dps-external-seconds></label>
          <label class="is-interval"><span>${event.timingMode === 'event' ? '間隔（任意）' : '間隔'}</span><input type="number" min="0" max="600" step="0.1" value="${escapeAttr(formatNumber((Number(event.intervalFrames) || 0) / 60))}" placeholder="非周期" data-fdc-dps-external-interval></label>
          <label class="is-count"><span>回数</span><input type="number" min="0" max="10000" step="1" value="${escapeAttr(event.repeatCount > 0 ? event.repeatCount : '')}" placeholder="無制限" title="空欄または0で計測終了まで" data-fdc-dps-external-count></label>
          <button type="button" data-fdc-dps-external-remove aria-label="外部イベントを削除" title="削除">×</button>
        </div>
        <details class="fdc-dps-external-advanced">
          <summary>詳細設定</summary>
          <div class="fdc-dps-external-advanced-grid">
            <label class="is-source"><span>発動元ID</span><input type="text" value="${escapeAttr(event.sourceId || '')}" placeholder="任意" data-fdc-dps-external-source></label>
            <label class="is-value"><span>条件値</span><input type="text" value="${escapeAttr(event.value || '')}" placeholder="任意" data-fdc-dps-external-value></label>
            <label class="is-reason"><span>表示名</span><input type="text" value="${escapeAttr(event.reason || '')}" placeholder="任意" data-fdc-dps-external-reason></label>
            <label class="is-status"><span>直接付与状態</span><input type="text" value="${escapeAttr(event.status || '')}" placeholder="任意" data-fdc-dps-external-status></label>
            <label class="is-status-duration"><span>状態秒</span><input type="number" min="0" max="600" step="0.1" value="${escapeAttr(event.statusDurationFrames > 0 ? formatNumber(event.statusDurationFrames / 60) : '')}" placeholder="無期限" data-fdc-dps-external-status-duration></label>
          </div>
        </details>
      </div>
    `;
  }

  function formatDpsExternalCandidateEffectSummary(candidate = {}, limit = 3) {
    const labels = Array.isArray(candidate.candidateEffectLabels || candidate.effectLabels)
      ? (candidate.candidateEffectLabels || candidate.effectLabels).map(label => String(label || '').trim()).filter(Boolean)
      : [];
    if (!labels.length) return '';
    const visible = labels.slice(0, Math.max(1, limit));
    return `${visible.join('・')}${labels.length > visible.length ? ` ほか${labels.length - visible.length}件` : ''}`;
  }

  function renderDpsFormationEventCandidates(candidates = []) {
    const normalized = Array.isArray(candidates) ? candidates : [];
    if (!normalized.length) return '<p class="is-empty">現在の編成に、外部行動待ちの効果はありません。</p>';
    return normalized.map(candidate => {
      const effectSummary = formatDpsExternalCandidateEffectSummary(candidate, 3);
      return `
        <article class="fdc-dps-formation-event-candidate">
          <div>
            <strong class="is-trigger">${escapeHtml(candidate.label || candidate.type)}</strong>
            ${effectSummary ? `<strong class="is-effect">発動効果: ${escapeHtml(effectSummary)}</strong>` : ''}
            ${candidate.timingMode === 'event' ? `<span class="is-event-kind">非周期 / ${{ once: '一回型', repeatable: '反復型', counted: 'カウント型' }[candidate.repeatability] || '発生秒指定'}</span>` : '<span class="is-periodic-kind">周期推定</span>'}
            <span>${escapeHtml(candidate.basis || '時刻を手動設定')}</span>
          </div>
          <button type="button" data-fdc-dps-formation-event-add="${escapeAttr(candidate.id || '')}">追加</button>
        </article>
      `;
    }).join('');
  }

  function renderDpsExternalInputContent(events = [], candidates = []) {
    const normalizedEvents = normalizeDpsExternalEvents(events);
    const normalizedCandidates = Array.isArray(candidates) ? candidates : [];
    return `
      <details class="fdc-dps-external-events" data-fdcp-detail-section="external">
        <summary>外部イベント（手動） <small>標準OFF</small></summary>
        <div class="fdc-dps-external-events-head">
          <p>周期候補は推定時刻で追加されます。非周期候補は発生秒を指定するイベントとして追加されるため、間隔を推測せず必要な回数だけ個別に設定します。</p>
        </div>
        <details class="fdc-dps-formation-event-candidates" data-fdcp-detail-section="external-candidates">
          <summary>編成から追加 <span>${normalizedCandidates.length ? `${normalizedCandidates.length}件` : '候補なし'}</span></summary>
          <p>周期型はCT・SP・普通攻撃間隔から軽量推定し、被弾・シールド破壊・撃破・状態遷移などの非周期型は発生秒を手動指定します。</p>
          <div class="fdc-dps-formation-event-candidate-list">${renderDpsFormationEventCandidates(normalizedCandidates)}</div>
        </details>
        <div class="fdc-dps-external-event-list">${normalizedEvents.map(renderDpsExternalEventRow).join('')}</div>
      </details>
    `;
  }

  function renderDpsDamageGraphContent() {
    return `
      <section class="fdc-dps-damage-graph-panel" aria-labelledby="fdcp-dps-damage-graph-title">
        <div class="fdc-dps-section-head">
          <div>
            <h3 id="fdcp-dps-damage-graph-title">ダメージ推移</h3>
            <p>単一seedの累積ダメージを表示し、基準保存中は変更前と重ねて比較します。</p>
          </div>
          <span data-fdcp-damage-graph-note></span>
        </div>
        <div class="fdc-dps-damage-graph-wrap">
          <canvas id="fdcp-dps-damage-graph" data-fdcp-damage-graph aria-label="ダメージ推移グラフ"></canvas>
        </div>
        <div class="fdc-dps-damage-graph-axis-label" data-fdcp-damage-graph-x-label>経過秒数</div>
        <div class="fdc-dps-damage-graph-legend" aria-hidden="true">
          <span><i class="is-cumulative"></i>現在</span>
          <span data-fdcp-damage-graph-baseline-legend hidden><i class="is-baseline"></i>基準</span>
        </div>
      </section>
    `;
  }
  function getDpsApplicableActionEffects(audit = {}) {
    return Object.entries(ACTION_LABELS).map(([actionKey, label]) => {
      const seen = new Set();
      const rows = (audit?.[actionKey]?.rows || []).map(row => ({
        label: String(row.label || row.source || '効果').trim(), value: formatDpsActionEffectValue(row), state: getDpsActionEffectState(row)
      })).filter(row => row.label && row.value).filter(row => {
        const key = `${row.label}\n${row.value}\n${row.state.code}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return { key: actionKey, label, rows };
    });
  }
  function formatDpsActionEffectValue(row = {}) {
    const value = String(row.value || '').trim();
    if (value) return value;
    if (row.skillRewrite) return 'スキル効果を変更';
    if (row.guaranteedCrit) return '会心率100%';
    if (row.runtimeManaged) return '条件成立時に反映';
    return '適用';
  }
  function getDpsActionEffectState(row = {}) {
    if (row.unsupportedRuntimeTrigger) return { code: 'unsupported', label: 'DPS未対応' };
    if (row.externalActionRequired) return { code: 'external', label: '他使徒の行動待ち' };
    if (row.sourceDisabled) return { code: 'off', label: '適用元OFF' };
    if (row.manualDisabled || row.singleManualDisabled) return { code: 'off', label: '手動OFF' };
    if (!row.enabled) return { code: 'condition', label: /条件|不一致/.test(String(row.reason || '')) ? '条件不一致' : 'OFF' };
    if (row.runtimeManaged) return { code: 'runtime', label: 'DPS時系列で反映' };
    if (/手動ON/.test(String(row.reason || ''))) return { code: 'on', label: '手動ON' };
    return { code: 'on', label: '自動適用' };
  }
  function getDpsAuditRowKey(row = {}) {
    return String(row.key || [row.sourceId, row.effectId, row.label, row.value].filter(Boolean).join('\u0001'));
  }
  function uniqueDps(values = []) { return Array.from(new Set(values)); }
  function getDpsAdditionalDamageClassificationActionKeys(category = '') {
    const text = String(category || '').replace(/[\s　・_]/g, '');
    const keys = [];
    if (/普通攻撃|通常攻撃/.test(text)) keys.push('basicAttack', 'enhancedAttack');
    if (/基本攻撃/.test(text)) keys.push('basicAttack');
    if (/強化攻撃/.test(text)) keys.push('enhancedAttack');
    if (/低学年/.test(text)) keys.push('lowSkill');
    if (/高学年/.test(text)) keys.push('highSkill');
    if (text === 'スキル') keys.push('lowSkill', 'highSkill');
    return uniqueDps(keys);
  }
  function getDpsRuntimeDamageTargetActionKeys(modifiers = {}) {
    const keys = new Set();
    const modifierKeys = Object.keys(modifiers).filter(key => Number(modifiers[key]));
    if (modifierKeys.some(key => ['atkP', 'physicalAtkP', 'magicAtkP', 'addP', 'actionMultiplierBonusP', 'specialP', 'otherP', 'critP', 'critRateP', 'critDmgP', 'critDmgAddP', 'enemyDefDownP', 'enemyCritResDownP', 'enemyCritDmgResDownP'].includes(key))) Object.keys(ACTION_LABELS).forEach(key => keys.add(key));
    if (modifierKeys.includes('normalAttackMultiplierBonusP') || modifierKeys.includes('normalAttackAddP')) ['basicAttack', 'enhancedAttack'].forEach(key => keys.add(key));
    if (modifierKeys.includes('basicMultiplierBonusP') || modifierKeys.includes('basicAddP')) keys.add('basicAttack');
    if (modifierKeys.includes('enhancedMultiplierBonusP') || modifierKeys.includes('enhancedAddP')) keys.add('enhancedAttack');
    if (modifierKeys.includes('lowSkillMultiplierBonusP') || modifierKeys.includes('lowSkillAddP')) keys.add('lowSkill');
    if (modifierKeys.includes('highSkillMultiplierBonusP') || modifierKeys.includes('highSkillAddP')) keys.add('highSkill');
    if (modifierKeys.includes('skillActionMultiplierBonusP') || modifierKeys.includes('skillAddP')) ['lowSkill', 'highSkill'].forEach(key => keys.add(key));
    return Array.from(keys);
  }
  function buildDpsRuntimeEffectDescriptors(runtimeEffects = {}, single = {}) {
    const descriptors = new Map();
    const activityCounts = new Map();
    (single?.timeline || []).forEach(event => {
      if (!['attackSpeedApplied', 'runtimeBuffApplied', 'runtimeEffectHit', 'spRecoveryEvent', 'cooldownChanged', 'statusApplied', 'effectStateChanged'].includes(event?.type)) return;
      const id = String(event.runtimeEffectId || event.effectId || event.applicationEffectId || '');
      if (id) activityCounts.set(id, (activityCounts.get(id) || 0) + 1);
    });
    const register = (effect, kind, targetActionKeys = [], triggerActionKeys = []) => {
      const id = String(effect?.id || effect?.effectId || '');
      if (!id) return;
      const descriptor = { id, kind, overrideMode: String(effect?.runtimeOverrideMode || 'auto'), fixedStacks: Math.max(1, Math.floor(Number(effect?.runtimeFixedStacks) || 1)), targetActionKeys: uniqueDps(targetActionKeys), triggerActionKeys: uniqueDps(triggerActionKeys), activityCount: activityCounts.get(id) || 0 };
      descriptors.set(id, descriptor);
      uniqueDps(effect?.effectIds || []).forEach(effectId => descriptors.set(String(effectId), descriptor));
    };
    (runtimeEffects.damageBuffEffects || []).forEach(effect => register(effect, 'damage', getDpsRuntimeDamageTargetActionKeys(effect.modifiers || {}), effect.triggerActionKeys || []));
    (runtimeEffects.attackSpeedEffects || []).forEach(effect => register(effect, 'speed', ['basicAttack', 'enhancedAttack'], effect.triggerActionKeys || []));
    (runtimeEffects.spRecoveryEffects || []).forEach(effect => register(effect, 'sp', [], effect.triggerActionKeys || []));
    (runtimeEffects.cooldownEffects || []).forEach(effect => register(effect, 'cooldown', [], effect.triggerActionKeys || []));
    (runtimeEffects.eventEffects || []).forEach(effect => register(effect, 'event', effect.targetActionKeys || [], effect.triggerActionKeys || []));
    return descriptors;
  }
  function getDpsRuntimeEffectDescriptor(row = {}, descriptors = new Map()) {
    const ids = [row.runtimeEffectId, row.effectId, row.id, row.sourceId].map(value => String(value || '')).filter(Boolean);
    return ids.map(id => descriptors.get(id)).find(Boolean) || null;
  }
  function getDpsMatrixState(row, actionKey, descriptor, hasResult) {
    if (!row) return { label: '—', className: 'is-none', title: 'この行動では評価対象外' };
    if (row.unsupportedRuntimeTrigger) {
      if (descriptor) {
        const active = hasResult && descriptor.activityCount > 0;
        return { label: hasResult ? (active ? 'ONあり' : '待機') : '外部入力', className: active ? 'is-runtime-active' : 'is-runtime-waiting', title: `手動外部イベントで評価${active ? ` / 発動${formatNumber(descriptor.activityCount)}回` : ' / 一致するイベント待ち'}` };
      }
      return { label: '未対応', className: 'is-runtime-waiting', title: row.reason || '発動時刻を再現できない条件のためDPS自動計算から除外' };
    }
    if (row.externalActionRequired) return { label: '外部待ち', className: 'is-runtime-waiting', title: '編成内の別使徒本人の行動タイムラインを未計上のため発動させません' };
    if (descriptor?.overrideMode === 'off') return { label: 'OFF', className: 'is-off', title: 'DPSの時系列効果設定で除外' };
    if (descriptor?.overrideMode === 'fixed') {
      if (!descriptor.targetActionKeys.includes(actionKey)) return { label: '—', className: 'is-none', title: '固定補正の適用対象外' };
      return { label: `固定${descriptor.fixedStacks > 1 ? `×${descriptor.fixedStacks}` : ''}`, className: 'is-runtime-active', title: `指定した${descriptor.fixedStacks}スタックを計測中常時適用` };
    }
    if (descriptor?.targetActionKeys?.includes(actionKey)) {
      const active = hasResult && descriptor.activityCount > 0;
      return { label: hasResult ? (active ? 'ONあり' : '待機') : '自動', className: active ? 'is-runtime-active' : 'is-runtime-waiting', title: `DPS自動評価${descriptor.activityCount > 0 ? ` / 発動${formatNumber(descriptor.activityCount)}回` : ' / この試行では未発動'}` };
    }
    if (descriptor?.triggerActionKeys?.includes(actionKey)) return { label: '起点', className: 'is-runtime-trigger', title: `この行動がDPS自動効果の発動起点${descriptor.activityCount > 0 ? ` / 発動${formatNumber(descriptor.activityCount)}回` : ''}` };
    if (descriptor || row.runtimeManaged) return { label: descriptor ? '—' : '自動', className: descriptor ? 'is-none' : 'is-runtime-waiting', title: descriptor ? 'この行動は発動起点・適用対象ではありません' : 'DPSでは単発トグルから独立して自動評価' };
    if (row.sourceDisabled || row.manualDisabled || row.singleManualDisabled || !row.enabled) return { label: 'OFF', className: 'is-off', title: row.reason || '除外' };
    return { label: 'ON', className: 'is-on', title: row.reason || '適用' };
  }
  function formatDpsActionProfileDamage(profile = {}) {
    const values = Object.values(profile?.variants || {}).map(item => Number(item?.totalExpectedDamage) || 0).filter(value => value > 0).sort((a, b) => a - b);
    if (!values.length) return '0';
    return values.length === 1 || Math.abs(values[0] - values.at(-1)) < .5 ? formatDamage(values[0]) : `${formatDamage(values[0])}～${formatDamage(values.at(-1))}`;
  }
  function renderDpsRuntimeEffectControls(runtimeEffects = {}) {
    const definitions = new Map();
    [
      ['attackSpeedEffects', true, '攻撃速度'], ['damageBuffEffects', true, 'ダメージ補正'],
      ['spRecoveryEffects', false, 'SP回復'], ['cooldownEffects', false, 'クールタイム'], ['eventEffects', false, 'イベント']
    ].forEach(([collectionKey, supportsFixed, kindLabel]) => {
      (runtimeEffects?.[collectionKey] || []).forEach(effect => {
        const id = String(effect?.id || effect?.effectId || '');
        if (!id) return;
        const current = definitions.get(id);
        const maxStacks = Math.max(1, Math.floor(Number(effect?.maxStacks) || 1));
        definitions.set(id, {
          id, label: effect.label || current?.label || '時系列効果',
          kinds: uniqueDps([...(current?.kinds || []), kindLabel]),
          supportsFixed: !!(current?.supportsFixed || supportsFixed),
          maxStacks: Math.max(current?.maxStacks || 1, maxStacks),
          mode: effect.runtimeOverrideMode || current?.mode || 'auto',
          fixedStacks: effect.runtimeFixedStacks || current?.fixedStacks || 1
        });
      });
    });
    if (!definitions.size) return '';
    const rows = Array.from(definitions.values()).map(item => {
      const fixed = item.mode === 'fixed' && item.supportsFixed;
      return `<label class="fdc-dps-runtime-setting${item.mode === 'off' ? ' is-off' : fixed ? ' is-fixed' : ''}"><span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.kinds.join('・'))}</small></span><select data-fdc-dps-runtime-mode="${escapeAttr(item.id)}" aria-label="${escapeAttr(item.label)}のDPS動作"><option value="auto"${item.mode === 'auto' ? ' selected' : ''}>自動</option>${item.supportsFixed ? `<option value="fixed"${fixed ? ' selected' : ''}>固定</option>` : ''}<option value="off"${item.mode === 'off' ? ' selected' : ''}>OFF</option></select>${item.supportsFixed ? `<span class="fdc-dps-runtime-stack${fixed ? '' : ' is-disabled'}"><input type="number" min="1" max="${item.maxStacks}" step="1" value="${Math.min(item.maxStacks, item.fixedStacks)}" data-fdc-dps-runtime-stacks="${escapeAttr(item.id)}"${fixed ? '' : ' disabled'}><small>/${item.maxStacks}</small></span>` : ''}</label>`;
    }).join('');
    return `<div class="fdc-dps-runtime-settings"><div class="fdc-dps-runtime-settings-head"><strong>時系列効果設定</strong><small>自動はタイムライン処理、固定は指定スタックを常時適用、OFFはDPSから除外</small></div><div class="fdc-dps-runtime-settings-list">${rows}</div></div>`;
  }
  function renderDpsRuntimeSettingsContent(runtimeEffects = {}, open = false) {
    const controls = renderDpsRuntimeEffectControls(runtimeEffects)
      .replace('<strong>時系列効果設定</strong>', '<strong>効果一覧</strong>');
    if (!controls) return '';
    return '<details class="fdcp-dps-runtime-settings-disclosure" data-fdcp-detail-section="runtime-settings"'
      + (open ? ' open' : '')
      + '><summary>時系列効果設定 <small>DPSの計算条件</small></summary>'
      + controls
      + '</details>';
  }
  function renderDpsActionEffectContent(audit = {}, _profiles = {}, runtimeEffects = {}, single = {}, additionalDamageComponents = []) {
    const actionMaps = Object.fromEntries(Object.keys(ACTION_LABELS).map(key => [key, new Map((audit?.[key]?.rows || []).map(row => [getDpsAuditRowKey(row), row]))]));
    const seenComponents = new Set();
    const supplementalColumns = (Array.isArray(additionalDamageComponents) ? additionalDamageComponents : []).filter(component => {
      const id = String(component?.effectId || component?.optionKey || component?.label || '');
      if (!id || seenComponents.has(id)) return false;
      seenComponents.add(id);
      return true;
    }).map((component, index) => {
      const classificationActionKeys = getDpsAdditionalDamageClassificationActionKeys(component.attackCategory || component.sourceCategory || '');
      const ownerActionKeys = Array.isArray(component.ownerActionKeys) ? component.ownerActionKeys : [];
      const rows = (component.actionEffectAudit?.rows || []).filter(row => row.auditKind == null);
      return {
        key: `supplemental:${component.effectId || component.optionKey || index}`,
        label: component.valueKind || component.label || '追加ダメージ',
        actionKey: classificationActionKeys[0] || ownerActionKeys[0] || '', classificationActionKeys, ownerActionKeys,
        rows: new Map(rows.map(row => [getDpsAuditRowKey(row), row])), component
      };
    });
    const columns = [
      ...Object.keys(ACTION_LABELS).map(key => ({ key, label: ACTION_LABELS[key], actionKey: key, rows: actionMaps[key], component: null })),
      ...supplementalColumns
    ];
    const effectKeys = uniqueDps(columns.flatMap(column => Array.from(column.rows.keys()))).filter(Boolean);
    // 操作欄はDPS計算フロートへ集約し、詳細側は適用状態の監査に専念させる。
    const runtimeControls = '';
    if (!effectKeys.length) return `<details class="fdc-dps-effect-audit-panel"><summary>行動別適用効果 <span>0効果</span></summary><p>固定効果はON/OFF、時間変化する効果はDPS自動の発動実績・起点・適用対象を表示します。単発計算の仮定トグルとは独立しています。</p>${runtimeControls}<p class="fdc-dps-empty">表示できる行動別効果がありません。</p></details>`;
    const descriptors = buildDpsRuntimeEffectDescriptors(runtimeEffects, single);
    const hasResult = Array.isArray(single?.timeline);
    const headers = columns.map(column => {
      if (!column.component) return `<span>${escapeHtml(column.label)}</span>`;
      const component = column.component;
      const multiplier = formatNumber(component.baseMultiplier || component.multiplier || 0);
      const repeat = component.repeatCount > 1 ? `×${formatNumber(component.repeatCount)}` : '';
      const owner = column.ownerActionKeys.map(key => ACTION_LABELS[key]).filter(Boolean).join('・');
      const classification = column.classificationActionKeys.map(key => ACTION_LABELS[key]).filter(Boolean).join('・');
      const title = [component.sourceLabel || '追加効果', component.valueKind || component.label, owner && `発動:${owner}`, classification && `分類:${classification}`].filter(Boolean).join(' / ');
      return `<span class="is-additional" title="${escapeAttr(title)}"><b>${escapeHtml(component.sourceLabel || '追加効果')}</b><small>${escapeHtml(component.valueKind || component.label || '追加')} ${escapeHtml(multiplier)}%${escapeHtml(repeat)}</small></span>`;
    }).join('');
    const rows = effectKeys.map(effectKey => {
      const representative = columns.map(column => column.rows.get(effectKey)).find(Boolean) || {};
      const descriptor = getDpsRuntimeEffectDescriptor(representative, descriptors);
      const states = columns.map(column => {
        const appliesToEveryBaseAction = descriptor && Object.keys(ACTION_LABELS).every(key => descriptor.targetActionKeys.includes(key));
        const row = column.rows.get(effectKey) || (column.component && appliesToEveryBaseAction ? representative : null);
        if (!row) return '<span class="fdc-dps-effect-state is-none" title="この行動では評価対象外">—</span>';
        const actionKey = column.actionKey || (appliesToEveryBaseAction ? 'basicAttack' : '');
        const state = getDpsMatrixState(row, actionKey, descriptor, hasResult);
        return `<span class="fdc-dps-effect-state ${escapeAttr(state.className)}" title="${escapeAttr(state.title)}">${escapeHtml(state.label)}</span>`;
      }).join('');
      const runtimeMeta = descriptor
        ? (descriptor.overrideMode === 'off' ? 'DPS OFF' : descriptor.overrideMode === 'fixed' ? `DPS固定×${descriptor.fixedStacks}` : `DPS自動${descriptor.activityCount > 0 ? `・発動${formatNumber(descriptor.activityCount)}回` : ''}`)
        : (representative.runtimeManaged ? 'DPS自動' : '');
      return `<div class="fdc-dps-effect-matrix-row${descriptor || representative.runtimeManaged ? ' is-runtime-managed' : ''}"><span class="fdc-dps-effect-name"><strong>${escapeHtml(representative.label || '効果')}</strong><small>${escapeHtml([representative.source, formatDpsActionEffectValue(representative), runtimeMeta].filter(Boolean).join(' / '))}</small></span>${states}</div>`;
    }).join('');
    return `<details class="fdc-dps-effect-audit-panel"><summary>行動別適用効果 <span>${formatNumber(effectKeys.length)}効果</span></summary><p>固定効果はON/OFF、時間変化する効果はDPS自動の発動実績・起点・適用対象を表示します。単発計算の仮定トグルとは独立しています。</p>${runtimeControls}<div class="fdc-dps-effect-matrix" style="--fdc-effect-column-count:${columns.length}"><div class="fdc-dps-effect-matrix-head"><span>効果</span>${headers}</div>${rows}</div></details>`;
  }
  function formatDpsRuntimeBuffModifiers(modifiers = {}) {
    const labels = {
      atkP: '攻撃力', physicalAtkP: '物理攻撃力', magicAtkP: '魔法攻撃力', addP: '与ダメージ量',
      normalAttackAddP: '普通攻撃ダメージ量', basicAddP: '基本攻撃ダメージ量', enhancedAddP: '強化攻撃ダメージ量',
      skillAddP: 'スキルダメージ量', lowSkillAddP: '低学年スキルダメージ量', highSkillAddP: '高学年スキルダメージ量',
      specialP: '特殊倍率', otherP: 'その他倍率', actionMultiplierBonusP: '行動倍率',
      normalAttackMultiplierBonusP: '普通攻撃行動倍率', basicMultiplierBonusP: '基本攻撃行動倍率',
      enhancedMultiplierBonusP: '強化攻撃行動倍率', skillActionMultiplierBonusP: 'スキル行動倍率',
      lowSkillMultiplierBonusP: '低学年スキル行動倍率', highSkillMultiplierBonusP: '高学年スキル行動倍率',
      selfDestructMultiplierBonusP: '自爆行動倍率', critP: '会心', critRateP: '会心率', critDmgP: '会心DMG',
      critDmgAddP: '会心DMG量', enemyDefDownP: '敵防御力低下', enemyCritResDownP: '敵会心抵抗低下',
      enemyCritDmgResDownP: '敵会心DMG抵抗低下'
    };
    return Object.entries(modifiers || {})
      .filter(([, value]) => Number(value))
      .map(([key, value]) => `${labels[key] || key} ${Number(value) > 0 ? '+' : ''}${formatNumber(value)}%`)
      .join(' / ');
  }
  function formatDpsTimelineEvent(event = {}) {
    const action = event.actionLabel || '';
    const variantLabel = formatDpsVariantLabel(event.variant, event.variantLabel);
    const variant = variantLabel ? ` / ${variantLabel}` : '';
    const generated = event.generatedObjectId ? ` / ${event.generatedObjectName || '生成物'}${event.generatedEventType ? ` ${event.generatedEventType}` : ''}` : '';
    const effectLabel = String(event.effectValueKind || '').trim();
    const statusReaction = event.statusTakenDmgP ? ` / 状態反応 +${formatNumber(event.statusTakenDmgP)}%` : '';
    const statusDamageWeakness = event.statusDamageP ? ` / 状態異常弱点 その他倍率 +${formatNumber(event.statusDamageP)}%` : '';
    const hitEvaluation = event.damageEvaluation && Math.abs((Number(event.damageEvaluation.ratio) || 1) - 1) > .0001 ? ` / 時点補正 ×${formatNumber(event.damageEvaluation.ratio)}（基礎 ${formatDamage(event.damageEvaluation.baseExpectedDamage)}）` : '';
    const runtimeBuffValue = formatDpsRuntimeBuffModifiers(event.modifiers) || (event.attackPPerStack ? `物理攻撃力 +${formatNumber(event.attackPPerStack)}%` : '補正適用');
    const cooldownDeltaFrames = Math.abs((Number(event.beforeFrames) || 0) - (Number(event.afterFrames) || 0));
    const cooldownChange = event.operation === 'multiply'
      ? `CT ×${formatNumber(event.multiplier)}`
      : `CT ${Number(event.afterFrames) <= Number(event.beforeFrames) ? '-' : '+'}${formatNumber(cooldownDeltaFrames / 60)}秒`;
    const statusDuration = Number.isFinite(Number(event.durationFrames)) && Number(event.durationFrames) > 0
      ? `${formatNumber(Number(event.durationFrames) / 60)}秒`
      : '計測中維持';
    const map = {
      skillTransition: `${action}${variant}へ移行（${formatNumber(event.transitionFrames)}F）`,
      movementStart: `${event.fromActionLabel || ACTION_LABELS[event.fromActionKey] || event.fromActionKey} → ${event.toActionLabel || ACTION_LABELS[event.toActionKey] || event.toActionKey} 移動開始（${formatNumber(event.movementFrames)}F）${event.note ? ` / ${event.note}` : ''}`,
      movementEnd: `${event.toActionLabel || ACTION_LABELS[event.toActionKey] || event.toActionKey}の射程へ移動完了`,
      actionStart: `${action}${variant} 開始`,
      actionEnd: `${action}${variant} 終了`,
      hit: `${action}${variant}${generated} ${event.hitCount > 1 ? `${event.hitCount}ヒット` : 'ヒット'}${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ''}${hitEvaluation}${statusReaction}`,
      effect: `${action}${variant} 効果発生${effectLabel ? ` / ${effectLabel}` : ''}`,
      spRecovery: event.capped ? `SP回復周期 / 上限 ${formatNumber(event.sp)}` : `SP +${formatNumber(event.amount)} → ${formatNumber(event.sp)}`,
      spRecoveryEvent: `${event.label || 'SP回復'} / ${event.reason || '効果発生'} / ${event.capped ? `上限 ${formatNumber(event.sp)}` : `SP +${formatNumber(event.amount)} → ${formatNumber(event.sp)}`}`,
      cooldownChanged: `${event.label || 'クールタイム変更'} / ${cooldownChange} → 残り${formatNumber((Number(event.afterFrames) || 0) / 60)}秒${event.ready ? '（発動可能）' : ''}`,
      lowSkillReady: `低学年発動可能 / SP ${formatNumber(event.sp)}`,
      attackSpeedInitial: `${event.label} 開始時適用 / 攻撃速度 +${formatNumber(event.totalHasteP)}% / 普通攻撃間隔 ${formatNumber(event.normalAttackIntervalFrames)}F${event.durationFrames > 0 ? ` / ${formatNumber(event.durationFrames / 60)}秒` : ''}`,
      attackSpeedStack: `${event.label} ${formatNumber(event.stackCount)}スタック / 今回+${formatNumber(event.addedHasteP)}%・累計+${formatNumber(event.totalHasteP)}% / 普通攻撃間隔 ${formatNumber(event.normalAttackIntervalFrames)}F`,
      attackSpeedApplied: `${event.label} ${formatNumber(event.stackCount)}スタック / 今回+${formatNumber(event.addedHasteP)}%・累計+${formatNumber(event.totalHasteP)}% / 普通攻撃間隔 ${formatNumber(event.normalAttackIntervalFrames)}F${event.durationFrames > 0 ? ` / ${formatNumber(event.durationFrames / 60)}秒` : ''}`,
      attackSpeedExpired: `${event.label} 終了 / 残り${formatNumber(event.stackCount)}スタック / 攻撃速度 +${formatNumber(event.totalHasteP)}%`,
      attackSpeedReset: `${event.label} リセット / ${formatNumber(event.previousStackCount)}→0スタック / 普通攻撃間隔 ${formatNumber(event.normalAttackIntervalFrames)}F`,
      resourceChange: `${event.resourceName} ${event.operation === 'gain' ? '+' : '-'}${formatNumber(event.amount)} → ${formatNumber(event.after)}/${formatNumber(event.maxStacks)}`,
      runtimeBuffApplied: `${event.label} ${formatNumber(event.stackCount)}/${formatNumber(event.maxStacks)}スタック / ${runtimeBuffValue}${event.durationFrames > 0 ? ` / ${formatNumber(event.durationFrames / 60)}秒` : ''}`,
      runtimeBuffExpired: `${event.label} 終了 / 残り${formatNumber(event.stackCount)}スタック`,
      runtimeEffectProbability: `${action ? `${action} / ` : ''}${event.label || '時系列効果'} 発動抽選 / ${formatNumber(event.probability)}% ${event.success ? '成功' : '不発'}${event.reason ? ` / ${event.reason}` : ''}${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ''}`,
      runtimeEffectHit: `${event.label || '時系列効果'} / ${event.reason || '効果発生'}${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ''}${hitEvaluation}`,
      runtimeHealingEvent: `${event.label || 'HP回復'} / ${event.reason || '効果発生'} / ${event.reference ? `${event.reference}の` : ''}${formatNumber(event.value)}%`,
      externalEvent: `外部イベント / ${event.reason || event.triggerType || '手動入力'}${event.status ? ` / ${event.status}付与` : ''}${event.intervalFrames > 0 ? ` / ${formatNumber(event.occurrence)}回目` : ''}`,
      statusApplied: `${event.status}付与 / ${formatNumber(event.stackCount)}/${formatNumber(event.maxStacks)}スタック / ${statusDuration}`,
      statusTick: `${event.status}ダメージ / ${formatNumber(event.stackCount)}スタック${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ' / ダメージ未評価'}${hitEvaluation}${statusReaction}${statusDamageWeakness}`,
      statusExpired: `${event.status}終了 / 残り${formatNumber(event.stackCount)}スタック`,
      effectStateChanged: formatDpsEffectStateChange(event)
    };
    const fallbackLabel = formatDpsTimelineFallbackLabel(event);
    const message = map[event.type] || `${action}${action ? ' / ' : ''}${fallbackLabel}`;
    return `${message}${formatDpsTimelineQualitySuffix(event)}`;
  }
  function formatDpsEffectStateChange(event = {}) {
    const kindLabel = ({
      attackSpeed: '攻撃速度',
      buff: '時系列効果',
      debuff: '状態',
      selfState: '固有状態',
      resourceBuff: 'リソース効果',
      resource: 'リソース'
    })[String(event.kind || '')] || '状態';
    const label = String(event.label || event.status || '').trim() || kindLabel;
    const operation = ({
      apply: '付与',
      update: '更新',
      remove: '置換',
      expire: '終了',
      reset: 'リセット',
      gain: '増加',
      consume: '消費'
    })[String(event.operation || '')] || '変更';
    const resourceValue = event.kind === 'resource' && (event.before != null || event.after != null)
      ? ` / ${formatNumber(event.before)}→${formatNumber(event.after)}/${formatNumber(event.maxStacks)}`
      : '';
    const stackValue = event.kind !== 'resource' && (event.stackCount || event.maxStacks > 1)
      ? ` / ${formatNumber(event.stackCount)}/${formatNumber(event.maxStacks)}スタック`
      : '';
    const modifierValue = event.modifiers
      ? formatDpsRuntimeBuffModifiers(event.modifiers)
      : event.kind === 'attackSpeed' && Number(event.totalHasteP)
        ? `攻撃速度 +${formatNumber(event.totalHasteP)}% / 普通攻撃間隔 ${formatNumber(event.normalAttackIntervalFrames)}F`
        : '';
    const duration = Number(event.durationFrames) > 0
      ? ` / ${formatNumber(Number(event.durationFrames) / 60)}秒`
      : Number(event.expireFrame) > Number(event.appliedFrame)
        ? ` / 期限 ${formatNumber(Number(event.expireFrame) / 60)}秒`
        : '';
    const source = event.sourceActionLabel ? ` / ${event.sourceActionLabel}` : '';
    const reason = event.reason && event.reason !== event.timingQuality ? ` / ${event.reason}` : '';
    return `${label} ${operation}${resourceValue || stackValue}${modifierValue ? ` / ${modifierValue}` : ''}${duration}${source}${reason}`;
  }
  function getDpsTimelineForDisplay(single = {}) {
    if (Array.isArray(single?.publicTimeline)) return single.publicTimeline;
    const timeline = Array.isArray(single?.timeline) ? single.timeline : [];
    const simulator = typeof window !== 'undefined' ? window.TRICKCAL_DPS_SIMULATOR : null;
    return typeof simulator?.createDpsPublicTimeline === 'function'
      ? simulator.createDpsPublicTimeline(timeline)
      : timeline;
  }
  function renderDpsTimelineContent(single = {}, visibleLimit = 160) {
    const timeline = getDpsTimelineForDisplay(single);
    const visible = timeline.slice(0, Math.max(160, visibleLimit));
    const remaining = Math.max(0, timeline.length - visible.length);
    const more = remaining ? `<div class="fdc-dps-timeline-more"><span>${formatNumber(visible.length)} / ${formatNumber(timeline.length)}件を表示</span><button type="button" data-fdcp-timeline-more>続きを${formatNumber(Math.min(100, remaining))}件表示</button></div>` : '';
    const timelineStats = single?.publicTimelineStats || single?.timelineStats || {};
    const omittedCount = Math.max(0, Number(timelineStats.omitted) || 0);
    const omitted = omittedCount
      ? `<p class="fdc-dps-empty">記録上限により計${formatNumber(Number(timelineStats.total) || timeline.length + omittedCount)}件中、${formatNumber(omittedCount)}件を省略しています。計算・グラフには影響しません。</p>`
      : '';
    return `<details class="fdc-dps-timeline-panel" open><summary>単一seed 行動タイムライン</summary><div class="fdc-dps-timeline">${visible.length ? visible.map(event => `<div class="fdc-dps-timeline-row type-${escapeAttr(event.type || '')}"><time>${escapeHtml(formatNumber(event.frame))}F <small>${escapeHtml(formatNumber(Number(event.frame) / 60))}秒</small></time><span>${escapeHtml(formatDpsTimelineEvent(event))}</span></div>`).join('') : '<p class="fdc-dps-empty">表示できるイベントがありません。</p>'}${more}${omitted}</div></details>`;
  }
  function createDpsDetailComparisonRows(comparison = {}) {
    const rows = [
      ['全体期待DPS', { before: comparison.baselineDps, after: comparison.currentDps, difference: comparison.meanDpsDifference, percentChange: comparison.meanDpsPercent }, ' DPS'],
      ['平均総ダメージ', comparison.totalExpectedDamage],
      ['P10', comparison.p10],
      ['P90', comparison.p90]
    ];
    return rows.map(([label, values, unit = '']) => {
      const before = formatDamage(values?.before);
      const after = formatDamage(values?.after);
      const difference = `${formatSignedDamage(values?.difference)}${unit}`;
      const percent = values?.percentChange === undefined ? '' : formatCompactComparisonDelta(values.percentChange);
      const className = values?.difference > 0 ? 'is-comparison-up' : values?.difference < 0 ? 'is-comparison-down' : 'is-comparison-change';
      return { label, value: `${before} → ${after} / ${difference}${percent ? `（${percent}）` : ''}`, className };
    });
  }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
  function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#96;'); }
  function createDpsDamageGraphSeries(result = null) {
    if (!result) return null;
    const durationFrames = Math.max(1, Number(result.durationFrames) || Number(result.durationSeconds || 1) * 60);
    const rawHits = (result.damageSeries || result.timeline || [])
      .filter(event => (event.type === 'hit' || event.type === 'statusTick') && Number(event.expectedDamage) > 0)
      .sort((a, b) => Number(a.frame || 0) - Number(b.frame || 0));
    const bucketCount = Math.min(400, Math.max(1, Math.ceil(durationFrames / 6)));
    const buckets = Array.from({ length: bucketCount }, () => 0);
    rawHits.forEach(event => {
      const frame = Math.max(0, Math.min(durationFrames, Number(event.frame) || 0));
      const index = Math.min(bucketCount - 1, Math.floor(frame / durationFrames * bucketCount));
      buckets[index] += Number(event.expectedDamage) || 0;
    });
    let cumulative = 0;
    const points = buckets.map((damage, index) => {
      cumulative += damage;
      return {
        frame: (index / Math.max(1, bucketCount - 1)) * durationFrames,
        yValue: cumulative
      };
    });
    return { durationFrames, rawHitCount: rawHits.length, bucketCount, totalDamage: cumulative, points };
  }

  function createDpsDamageGraphModel(result = null, baselineResult = null) {
    const current = createDpsDamageGraphSeries(result);
    const baseline = createDpsDamageGraphSeries(baselineResult);
    return { current, baseline };
  }
  function createDpsDamageGraphTicks(durationFrames, intervalSeconds = 10) {
    const totalSeconds = Math.max(0, Number(durationFrames) || 0) / 60;
    const interval = Math.max(1, Number(intervalSeconds) || 10);
    const fullTickCount = Math.floor(totalSeconds / interval + 0.0000001);
    const ticks = Array.from({ length: fullTickCount + 1 }, (_, index) => index * interval);
    const lastTick = ticks[ticks.length - 1] || 0;
    if (totalSeconds > lastTick + 0.0000001) ticks.push(totalSeconds);
    return ticks.map(seconds => ({ seconds, frame: seconds * 60 }));
  }

  function drawDpsDamageGraph(canvas, model = null) {
    const context = canvas?.getContext?.('2d');
    if (!context) return;
    // A previous paint may have happened while the detail sheet was hidden.
    // Restore the responsive CSS width before measuring so that a fallback
    // width can never become the next measurement's own constraint.
    canvas.style.width = '100%';
    const rect = canvas.getBoundingClientRect?.() || {};
    // Use the rendered CSS width as the drawing coordinate width.  A fixed
    // minimum here makes the backing canvas wider than the detail sheet on
    // narrow screens, so later ticks drift past their actual grid positions.
    const width = Math.max(1, Number(rect.width) || Number(canvas.clientWidth) || Number(canvas.parentElement?.clientWidth) || 600);
    const height = 180;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const pixelWidth = Math.max(1, Math.round(width * ratio));
    const pixelHeight = Math.max(1, Math.round(height * ratio));
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    canvas.style.height = `${height}px`;
    const panel = canvas.closest?.('.fdc-dps-damage-graph-panel');
    const note = panel?.querySelector?.('[data-fdcp-damage-graph-note]');
    const baselineLegend = panel?.querySelector?.('[data-fdcp-damage-graph-baseline-legend]');
    const light = document.body.classList.contains('theme-light');
    const colors = light
      ? { text: '#526783', grid: 'rgba(74, 111, 157, .2)', cumulative: '#1768a8', fill: 'rgba(23, 104, 168, .12)', baseline: '#7b8797' }
      : { text: '#9db0ca', grid: 'rgba(142, 174, 218, .2)', cumulative: '#72b9ff', fill: 'rgba(114, 185, 255, .12)', baseline: '#aeb9c8' };
    context.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
    context.clearRect(0, 0, width, height);
    const current = model?.current || null;
    const baseline = model?.baseline || null;
    if (!current || !(current.totalDamage > 0)) {
      context.fillStyle = colors.text;
      context.font = '12px sans-serif';
      context.textAlign = 'center';
      context.fillText('計算後に単一seedの累積ダメージを表示します。', width / 2, height / 2);
      if (note) note.textContent = '';
      if (baselineLegend) baselineLegend.hidden = true;
      return;
    }
    const durationFrames = Math.max(current.durationFrames, baseline?.durationFrames || 0, 1);
    const yMax = Math.max(current.totalDamage, baseline?.totalDamage || 0, 1) * 1.08;
    const pad = { left: 82, right: 12, top: 10, bottom: 34 };
    const plotWidth = Math.max(1, width - pad.left - pad.right);
    const plotHeight = Math.max(1, height - pad.top - pad.bottom);
    const y = value => pad.top + plotHeight - (value / yMax) * plotHeight;
    const x = frame => pad.left + (frame / durationFrames) * plotWidth;
    context.font = '9px sans-serif';
    context.lineWidth = 1;
    context.strokeStyle = colors.grid;
    context.fillStyle = colors.text;
    [0, .25, .5, .75, 1].forEach(step => {
      const yy = pad.top + plotHeight * (1 - step);
      context.beginPath(); context.moveTo(pad.left, yy); context.lineTo(width - pad.right, yy); context.stroke();
      context.textAlign = 'right'; context.fillText(formatDamage(yMax * step), pad.left - 6, yy + 3);
    });
    const xTicks = createDpsDamageGraphTicks(durationFrames, 10);
    xTicks.forEach((tick, index) => {
      const xx = x(tick.frame);
      context.beginPath(); context.moveTo(xx, pad.top); context.lineTo(xx, pad.top + plotHeight); context.stroke();
      context.save();
      context.translate(xx, height - 7);
      context.textAlign = index === 0 ? 'left' : index === xTicks.length - 1 ? 'right' : 'center';
      context.fillText(formatNumber(tick.seconds), 0, 0);
      context.restore();
    });
    const drawSeries = (series, strokeStyle, { fillStyle = '', dashed = false } = {}) => {
      if (!series?.points.length) return;
      const points = series.points.map(point => ({ x: x(point.frame), yValue: point.yValue }));
      if (fillStyle) {
        context.beginPath();
        points.forEach((point, index) => { const yy = y(point.yValue); if (!index) context.moveTo(point.x, yy); else context.lineTo(point.x, yy); });
        context.lineTo(points[points.length - 1].x, pad.top + plotHeight); context.lineTo(points[0].x, pad.top + plotHeight); context.closePath();
        context.fillStyle = fillStyle; context.fill();
      }
      context.beginPath();
      points.forEach((point, index) => { const yy = y(point.yValue); if (!index) context.moveTo(point.x, yy); else context.lineTo(point.x, yy); });
      context.strokeStyle = strokeStyle;
      context.lineWidth = dashed ? 1.5 : 2;
      context.setLineDash(dashed ? [6, 4] : []);
      context.stroke();
      context.setLineDash([]);
    };
    drawSeries(current, colors.cumulative, { fillStyle: colors.fill });
    drawSeries(baseline, colors.baseline, { dashed: true });
    drawSeries(current, colors.cumulative);
    if (baselineLegend) baselineLegend.hidden = !baseline;
    if (note) note.textContent = `${formatNumber(current.rawHitCount)}発生 / 最大${formatNumber(current.bucketCount)}点${baseline ? ` / 基準 ${formatDamage(baseline.totalDamage)}` : ''}`;
  }

  function drawSparkline(canvas, series) {
    const context = canvas?.getContext?.('2d'); if (!context) return;
    const width = canvas.width; const height = canvas.height; context.clearRect(0, 0, width, height);
    if (!series?.points?.length || !(series.totalDamage > 0)) return;
    const maxFrame = Math.max(1, series.durationFrames); const maxTotal = Math.max(1, series.totalDamage); const pad = 3;
    context.strokeStyle = '#87aaff'; context.lineWidth = 1.8; context.beginPath(); series.points.forEach((point, index) => { const x = pad + point.frame / maxFrame * (width - pad * 2); const y = height - pad - point.yValue / maxTotal * (height - pad * 2); if (index) context.lineTo(x, y); else context.moveTo(x, y); }); context.stroke();
  }

  function runSimulationWorker(config, options, mode, onProgress = null, onFallback = null, cancellation = null) {
    const runFallback = reason => {
      const requestedTrials = Math.max(1, Math.floor(Number(options.trials) || 16));
      // file:// でも統計試行数は結果の定義そのもの。Workerが使えない場合も
      // 指定seed数を省略せず、同期実行として同じ集計結果を返す。
      const executedTrials = mode === 'single' ? 1 : requestedTrials;
      const safeOptions = { ...options, trials: executedTrials, exactTrials: true, adaptiveTrials: false };
      if (mode !== 'single') {
        onFallback?.(`${reason}のため同期計算（${executedTrials} seed）`);
      }
      return new Promise((resolve, reject) => {
        let finished = false;
        let timer = 0;
        const cleanupCancellation = cancellation?.onCancel(() => {
          if (finished) return;
          finished = true;
          window.clearTimeout(timer);
          reject(createRunCancelledError());
        });
        timer = window.setTimeout(() => {
          if (finished) return;
          finished = true;
          cleanupCancellation?.();
          if (cancellation?.cancelled) { reject(createRunCancelledError()); return; }
        const simulator = window.TRICKCAL_DPS_SIMULATOR;
          resolve(mode === 'single' ? simulator.simulate(config, safeOptions) : simulator.simulateMany(config, safeOptions));
        }, 0);
      });
    };
    if (location.protocol === 'file:') return runFallback('file://環境');
    if (typeof Worker === 'undefined') return runFallback('Worker非対応環境');
    try {
      return new Promise((resolve, reject) => {
        let finished = false;
        const worker = new Worker('dps-simulator-worker.js?v=20260901b');
        const cleanup = () => { if (!finished) { finished = true; worker.terminate(); } };
        const cleanupCancellation = cancellation?.onCancel(() => {
          if (finished) return;
          cleanup();
          reject(createRunCancelledError());
        });
        const resolveResult = result => { cleanupCancellation?.(); resolve(result); };
        const fallback = reason => { cleanup(); cleanupCancellation?.(); runFallback(reason).then(resolve, reject); };
        worker.onmessage = event => {
          if (event.data?.progress) { onProgress?.(event.data.progress); return; }
          cleanup();
          cleanupCancellation?.();
          if (cancellation?.cancelled) { reject(createRunCancelledError()); return; }
          if (event.data?.error) { runFallback('Worker計算失敗').then(resolve, reject); return; }
          resolveResult(event.data?.result);
        };
        worker.onerror = () => fallback('Worker起動失敗');
        try {
          worker.postMessage({ requestId: 1, mode: mode === 'single' ? 'single' : 'aggregate', config, options });
        } catch {
          fallback('Worker送信失敗');
        }
      });
    } catch {
      return runFallback('Worker生成失敗');
    }
  }

  window.TRICKCAL_DPS_BOTTOM_BAR_PROTOTYPE_TESTING = Object.freeze({
    createDpsComparisonAxis,
    PrototypeDpsController, applyDpsRuntimeEffectOverrides, axesMatch, createDpsBottomBreakdown, createDpsComparison, createDpsDetailComparisonRows, createDpsDamageGraphModel, createDpsDamageGraphSeries, createDpsDamageGraphTicks, createDpsInputFingerprint, createDpsInputProjection, createDpsSnapshotWithRuntimeOverrides, createDpsTimingDetailRows, createRunCancellation, formatCompactComparisonDelta, formatDpsEffectStateChange, formatDpsFrameValue, formatDpsTimelineEvent, formatSignedDamage, formatSignedPercent, getAutoRunCompletionFingerprint, getAutoRunDecision, getBaselineComparisonDecision, getDpsActionEffectState, getDpsApplicableActionEffects, getDpsDetailStatusLabel, getDpsExternalInputContent: renderDpsExternalInputContent, getDpsExternalEvent: normalizeDpsExternalEvent, getDpsFloatOutsideClickAction, getDpsFormationHighModeLabel, getDpsFormationTimelineModeLabel, getDpsRuntimeEffectOverride, getDpsTabAvailability, getDpsTargetChangeTransition, getExclusiveFloatState, getNativeFloatSyncState, getDpsTimelineForDisplay, getSnapshotFreshness, getTrialSummary, isRunCancelledError, normalizeDpsExternalEvents, normalizeDpsSettings, renderDpsActionEffectContent, renderDpsDamageGraphContent, renderDpsRuntimeEffectControls, renderDpsRuntimeSettingsContent, renderDpsTimelineContent, shouldApplyRunResult, stableStringify, runSimulationWorker
  });
  if (typeof document !== 'undefined') init();
})();
