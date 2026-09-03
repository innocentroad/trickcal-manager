(() => {
  'use strict';

  const el = {
    lab: document.getElementById('fdc-dps-lab'),
    duration: document.getElementById('fdc-dps-duration'),
    highMode: document.getElementById('fdc-dps-high-mode'),
    formationTimelineMode: document.getElementById('fdc-dps-formation-timeline-mode'),
    initialDelay: document.getElementById('fdc-dps-initial-delay'),
    seed: document.getElementById('fdc-dps-seed'),
    trials: document.getElementById('fdc-dps-trials'),
    run: document.getElementById('fdc-dps-run'),
    externalEventAdd: document.getElementById('fdc-dps-external-event-add'),
    externalEventList: document.getElementById('fdc-dps-external-event-list'),
    runtimeScheduleEventList: document.getElementById('fdc-dps-runtime-schedule-event-list'),
    formationEventCandidateList: document.getElementById('fdc-dps-formation-event-candidate-list'),
    formationEventCandidateNote: document.getElementById('fdc-dps-formation-event-candidate-note'),
    externalFormationEventCandidateList: document.getElementById('fdc-dps-external-event-candidate-list'),
    externalFormationEventCandidateNote: document.getElementById('fdc-dps-external-event-candidate-note'),
    targetNote: document.getElementById('fdc-dps-target-note'),
    status: document.getElementById('fdc-dps-status'),
    summary: document.getElementById('fdc-dps-summary'),
    contribution: document.getElementById('fdc-dps-contribution'),
    trialNote: document.getElementById('fdc-dps-trial-note'),
    effectAudit: document.getElementById('fdc-dps-effect-audit'),
    effectAuditNote: document.getElementById('fdc-dps-effect-audit-note'),
    timeline: document.getElementById('fdc-dps-timeline'),
    baselineSave: document.getElementById('fdc-dps-baseline-save'),
    baselineCompare: document.getElementById('fdc-dps-baseline-compare'),
    baselineClear: document.getElementById('fdc-dps-baseline-clear'),
    baselineNote: document.getElementById('fdc-dps-baseline-note'),
    comparisonPanel: document.getElementById('fdc-dps-comparison-panel'),
    comparisonNote: document.getElementById('fdc-dps-comparison-note'),
    comparison: document.getElementById('fdc-dps-comparison'),
    damageGraph: document.getElementById('fdc-dps-damage-graph'),
    damageGraphNote: document.getElementById('fdc-dps-damage-graph-note'),
    damageGraphBaselineLegend: document.getElementById('fdc-dps-damage-graph-baseline-legend')
  };
  if (!el.lab) return;

  const ACTION_ORDER = ['basicAttack', 'enhancedAttack', 'lowSkill', 'highSkill'];
  const ACTION_LABELS = {
    basicAttack: '基本攻撃',
    enhancedAttack: '強化攻撃',
    lowSkill: '低学年',
    highSkill: '高学年'
  };
  const EXTERNAL_EVENT_TYPES = {
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
  };
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
  const DPS_RUNTIME_OVERRIDE_STORAGE_KEY = 'trickcal:dps-runtime-effect-overrides:v1';
  const DEFAULT_FORMATION_TIMELINE_MODE = 'supportEstimate';
  let rerunTimer = 0;
  let pendingRunCanReuseSourceSnapshot = false;
  let latestRun = null;
  let latestSimulationKey = '';
  let latestSourceSnapshot = null;
  let latestSourceSnapshotFingerprint = '';
  let baseline = null;
  let activeTargetId = '';
  let runtimeEffectOverrides = loadRuntimeEffectOverrides();
  let latestGraphData = null;
  let aggregateWorker = null;
  let aggregateRequestId = 0;
  let singleWorker = null;
  let singleRequestId = 0;
  let deferredDetailRevision = 0;
  let lastRenderedDetailKey = '';
  let latestTimelineResult = null;
  let latestFormationEventCandidates = [];
  let latestFormationEventCandidateFingerprint = '';
  let latestRuntimeEffectsDisplay = null;
  let timelineVisibleLimit = 160;
  const simulationCache = new Map();
  const combatantConfigCache = new Map();
  const SIMULATION_CACHE_LIMIT = 6;
  const COMBATANT_CONFIG_CACHE_LIMIT = 8;

  el.run?.addEventListener('click', runSimulation);
  el.externalEventAdd?.addEventListener('click', () => addExternalEventRow());
  function enableFormationCandidateRuntimeEffects(candidate = {}) {
    if (getDpsFormationCandidateSchedulePolicy(candidate).mode !== 'periodic') return;
    if (!activeTargetId) return;
    const bindingKey = String(candidate.bindingKey || '').trim();
    const actionKey = candidate.periodicActionLabel === '高学年'
      ? 'highSkill'
      : candidate.periodicActionLabel === '低学年'
        ? 'lowSkill'
        : '';
    const scopedBindingKey = bindingKey && actionKey
      ? bindingKey + '::' + actionKey
      : '';
    const candidateEffectIds = new Set((Array.isArray(candidate.effectIds) ? candidate.effectIds : [])
      .map(value => String(value || '').trim()).filter(Boolean));
    const runtimeCollections = [
      'attackSpeedEffects',
      'damageBuffEffects',
      'spRecoveryEffects',
      'cooldownEffects',
      'eventEffects'
    ];
    const runtimeEffects = latestSourceSnapshot?.runtimeEffects || {};
    const matchedEffects = runtimeCollections.flatMap(collectionKey => (runtimeEffects[collectionKey] || []))
      .filter(effect => {
        const effectBinding = String(effect?.bindingKey || '').trim();
        const effectIds = new Set([
          effect?.id,
          effect?.effectId,
          ...(Array.isArray(effect?.effectIds) ? effect.effectIds : [])
        ].map(value => String(value || '').trim()).filter(Boolean));
        return (bindingKey && effectBinding === bindingKey)
          || (scopedBindingKey && effectBinding === scopedBindingKey)
          || [...candidateEffectIds].some(effectId => effectIds.has(effectId));
      });
    if (!matchedEffects.length) return;
    const targetOverrides = { ...(runtimeEffectOverrides[activeTargetId] || {}) };
    matchedEffects.forEach(effect => {
      const effectId = String(effect?.id || effect?.effectId || '').trim();
      if (!effectId) return;
      targetOverrides[effectId] = {
        ...(targetOverrides[effectId] || {}),
        mode: 'auto',
        fixedStacks: Math.max(1, Math.floor(Number(targetOverrides[effectId]?.fixedStacks) || 1))
      };
    });
    runtimeEffectOverrides[activeTargetId] = targetOverrides;
    saveRuntimeEffectOverrides();
  }
  [el.externalEventList, el.runtimeScheduleEventList].forEach(host => {
    host?.addEventListener('change', scheduleReusableRun);
    host?.addEventListener('click', event => {
      const remove = event.target.closest('[data-fdc-dps-external-remove]');
      if (!remove) return;
      remove.closest('.fdc-dps-external-event-row')?.remove();
      renderFormationEventCandidates(latestFormationEventCandidates);
      scheduleReusableRun();
    });
  });
  const handleFormationEventCandidateClick = event => {
    const add = event.target.closest('[data-fdc-dps-formation-event-add]');
    if (!add) return;
    const candidate = latestFormationEventCandidates.find(item => item.id === add.dataset.fdcDpsFormationEventAdd);
    if (!candidate) return;
    enableFormationCandidateRuntimeEffects(candidate);
    addExternalEventRow({
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
      ...(candidate.status ? {
        statusStackable: candidate.statusStackable === true,
        statusMaxStacks: candidate.statusMaxStacks,
        statusStackCount: candidate.statusStackCount,
        statusStackGroupId: candidate.statusStackGroupId || '',
        statusApplicationEffectId: candidate.statusApplicationEffectId || '',
        statusSourceId: candidate.statusSourceId || '',
        statusSourceSelf: candidate.statusSourceSelf === true,
        statusDealsPeriodicDamage: candidate.statusDealsPeriodicDamage,
        statusReactionOnly: candidate.statusReactionOnly === true
      } : {}),
      reason: candidate.label,
      candidateId: candidate.id,
      candidateLabel: candidate.label,
      candidateBasis: candidate.basis || '',
      candidateEffectLabels: Array.isArray(candidate.effectLabels) ? candidate.effectLabels : [],
      ...(candidate.bindingKey ? { bindingKey: candidate.bindingKey } : {}),
      timingMode: candidate.timingMode || '',
      eventClass: candidate.eventClass || '',
      eventLabel: candidate.eventLabel || '',
      repeatability: candidate.repeatability || '',
      inputMode: candidate.inputMode || ''
    });
    scheduleReusableRun();
  };
  [el.formationEventCandidateList, el.externalFormationEventCandidateList]
    .forEach(host => host?.addEventListener('click', handleFormationEventCandidateClick));
  el.baselineSave?.addEventListener('click', saveBaseline);
  el.baselineCompare?.addEventListener('click', compareWithBaseline);
  el.baselineClear?.addEventListener('click', () => clearBaseline());
  el.effectAudit?.addEventListener('change', handleRuntimeEffectSettingChange);
  el.timeline?.addEventListener('click', handleTimelineControlClick);
  [el.duration, el.highMode, el.initialDelay, el.seed, el.trials].forEach(input => input?.addEventListener('change', scheduleReusableRun));
  el.formationTimelineMode?.addEventListener('change', () => {
    renderFormationEventCandidates(latestFormationEventCandidates);
    scheduleReusableRun();
  });
  window.addEventListener('trickcal:damage-calculator-rendered', () => scheduleRun());
  window.addEventListener('trickcal:comparison-definition-changed', event => {
    if (String(event.detail?.evaluator || '') !== 'dps') return;
    updateBaselineControls();
  });
  window.addEventListener('resize', () => drawDamageGraph(latestGraphData));
  window.addEventListener('trickcal:theme-changed', () => drawDamageGraph(latestGraphData));

  runSimulation();

  function scheduleReusableRun() {
    scheduleRun({ reuseSourceSnapshot: true });
  }

  function addExternalEventRow(value = {}) {
    const target = value.timingMode === 'periodic' && value.candidateId
      ? (el.runtimeScheduleEventList || el.externalEventList)
      : el.externalEventList;
    if (!target) return;
    if (value.timingMode === 'periodic' && (value.candidateId || value.bindingKey)) {
      Array.from(target.querySelectorAll('.fdc-dps-external-event-row') || [])
        .filter(row => (value.candidateId && row.dataset.fdcpExternalCandidateId === String(value.candidateId))
          || (value.bindingKey && row.dataset.fdcpExternalBindingKey === String(value.bindingKey)))
        .forEach(row => row.remove());
    }
    const row = document.createElement('div');
    row.className = 'fdc-dps-external-event-row';
    if (value.timingMode === 'event') row.classList.add('is-event-driven');
    if (value.candidateId) {
      row.dataset.fdcpExternalCandidateId = value.candidateId;
      row.dataset.fdcpExternalCandidateLabel = value.candidateLabel || value.reason || '';
      row.dataset.fdcpExternalCandidateBasis = value.candidateBasis || '';
      row.dataset.fdcpExternalCandidateEffects = JSON.stringify(value.candidateEffectLabels || []);
      row.dataset.fdcpExternalBindingKey = value.bindingKey || '';
      row.dataset.fdcpExternalCandidateMeta = JSON.stringify({
        timingMode: value.timingMode || '',
        eventClass: value.eventClass || '',
        eventLabel: value.eventLabel || '',
        repeatability: value.repeatability || '',
        inputMode: value.inputMode || '',
        bindingKey: value.bindingKey || '',
        triggerSourceId: value.triggerSourceId || '',
        conditionType: value.conditionType || '',
        conditionValue: value.conditionValue ?? ''
      });
    }
    row.innerHTML = `
      <label class="is-type"><span>種類</span><select data-fdc-dps-external-type>${getExternalEventTypeEntries(value.type || 'shieldBreak').map(([type, label]) => `<option value="${escapeAttr(type)}">${escapeHtml(label)}</option>`).join('')}</select></label>
      <label class="is-start"><span>開始秒</span><input type="number" min="0" max="600" step="0.1" value="${escapeAttr(value.seconds ?? 0)}" data-fdc-dps-external-seconds></label>
      <label class="is-interval"><span>${value.timingMode === 'event' ? '間隔（任意）' : '間隔秒'}</span><input type="number" min="0" max="600" step="0.1" value="${escapeAttr(value.intervalSeconds ?? 0)}" placeholder="非周期" data-fdc-dps-external-interval></label>
      <label class="is-count"><span>回数</span><input type="number" min="0" max="10000" step="1" value="${escapeAttr(value.repeatCount ?? 0)}" title="0または空欄で計測終了まで" data-fdc-dps-external-count></label>
      <label class="is-source"><span>発動元ID</span><input type="text" value="${escapeAttr(value.sourceId || '')}" placeholder="任意" data-fdc-dps-external-source></label>
      <label class="is-value"><span>条件値</span><input type="text" value="${escapeAttr(value.value ?? '')}" placeholder="任意" data-fdc-dps-external-value></label>
      <label class="is-reason"><span>表示名</span><input type="text" value="${escapeAttr(value.reason || '')}" placeholder="任意" data-fdc-dps-external-reason></label>
      <label class="is-status"><span>直接付与状態</span><input type="text" value="${escapeAttr(value.status || '')}" placeholder="任意" data-fdc-dps-external-status></label>
      <label class="is-status-duration"><span>状態秒</span><input type="number" min="0" max="600" step="0.1" value="${escapeAttr(value.statusDurationSeconds ?? (Number(value.statusDurationFrames) > 0 ? Number(value.statusDurationFrames) / 60 : ''))}" placeholder="無期限" data-fdc-dps-external-status-duration></label>
      ${value.status && value.statusStackable ? `<label class="is-status-stack"><span>付与スタック</span><input type="number" min="1" max="${escapeAttr(value.statusMaxStacks || 9)}" step="1" value="${escapeAttr(value.statusStackCount || 1)}" data-fdc-dps-external-status-stack-count></label>` : ''}
      <button type="button" data-fdc-dps-external-remove aria-label="外部イベントを削除" title="削除">×</button>
    `;
    const typeSelect = row.querySelector('[data-fdc-dps-external-type]');
    const type = value.type || 'shieldBreak';
    if (type && !Array.from(typeSelect.options).some(option => option.value === type)) {
      typeSelect.add(new Option(type.replace(/時$/, ''), type));
    }
    typeSelect.value = type;
    target.append(row);
    renderFormationEventCandidates(latestFormationEventCandidates);
  }

  function renderFormationEventCandidates(candidates = [], runtimeEffects = latestRuntimeEffectsDisplay || latestSourceSnapshot?.runtimeEffects || {}) {
    if (!el.formationEventCandidateList && !el.externalFormationEventCandidateList) return;
    const normalized = Array.isArray(candidates) ? candidates : [];
    const currentMode = el.formationTimelineMode?.value || DEFAULT_FORMATION_TIMELINE_MODE;
    const manualEvents = collectExternalEvents();
    const bindingModes = getDpsFormationBindingModes(runtimeEffects);
    const fingerprint = createDataFingerprint({
      candidates: normalized,
      formationTimelineMode: currentMode,
      formationHighSkillMode: 'disabled',
      bindingModes,
      manualEvents: manualEvents
        .filter(event => isDpsPeriodicFormationEvent(event))
        .map(event => [event.candidateId || '', event.bindingKey || '', event.frame, event.intervalFrames, event.repeatCount])
    });
    if (fingerprint === latestFormationEventCandidateFingerprint) return;
    latestFormationEventCandidateFingerprint = fingerprint;
    latestFormationEventCandidates = normalized;
    const periodic = normalized.filter(candidate => getDpsFormationCandidateSchedulePolicy(candidate).mode === 'periodic');
    const external = normalized.filter(candidate => getDpsFormationCandidateSchedulePolicy(candidate).mode === 'external');
    if (el.formationEventCandidateNote) {
      el.formationEventCandidateNote.textContent = periodic.length ? `${periodic.length}件` : '候補なし';
    }
    if (el.externalFormationEventCandidateNote) {
      el.externalFormationEventCandidateNote.textContent = external.length ? `${external.length}件` : '候補なし';
    }
    const renderCandidates = (items, emptyMessage) => items.length ? items.map(candidate => {
      const effectSummary = formatFormationEventEffectSummary(candidate, 3);
      const schedulePolicy = getDpsFormationCandidateSchedulePolicy(candidate);
      const isPeriodic = schedulePolicy.mode === 'periodic';
      const repeatabilityLabel = ({ once: '一回型', repeatable: '反復型', counted: 'カウント型' }[candidate.repeatability] || '発生秒指定');
      const scheduleState = getDpsFormationCandidateScheduleState(candidate, {
        formationTimelineMode: currentMode,
        formationHighSkillMode: 'disabled',
        bindingModes
      }, manualEvents);
      const stateLabel = isPeriodic
        ? `${scheduleState.label} / ${schedulePolicy.capabilityLabel}`
        : `${schedulePolicy.capabilityLabel} / 非周期・${repeatabilityLabel}`;
      const actionLabel = !isPeriodic
        ? '追加'
        : scheduleState.code === 'manual'
          ? '周期を調整'
          : scheduleState.code === 'estimated'
            ? '周期を上書き'
            : '周期を追加';
      return `
        <article class="fdc-dps-formation-event-candidate is-${escapeAttr(scheduleState.code)}">
          <div>
            <strong class="is-trigger">${escapeHtml(candidate.label || candidate.type)}</strong>
            ${effectSummary ? `<strong class="is-effect">発動効果: ${escapeHtml(effectSummary)}</strong>` : ''}
            <span class="${isPeriodic ? 'is-periodic-kind' : 'is-event-kind'}" data-fdc-dps-formation-event-state="${escapeAttr(scheduleState.code)}">${escapeHtml(stateLabel)}</span>
            <span>${escapeHtml(candidate.basis || '時刻を手動設定')}</span>
          </div>
          <button type="button" data-fdc-dps-formation-event-add="${escapeAttr(candidate.id)}">${actionLabel}</button>
        </article>
      `;
    }).join('') : `<p class="is-empty">${escapeHtml(emptyMessage)}</p>`;
    if (el.formationEventCandidateList) {
      el.formationEventCandidateList.innerHTML = renderCandidates(periodic, '現在の編成に、周期指定できる行動連動効果はありません。');
    }
    if (el.externalFormationEventCandidateList) {
      el.externalFormationEventCandidateList.innerHTML = renderCandidates(external, '現在の編成に、外部条件として入力できる効果はありません。');
    }
  }

  function formatFormationEventEffectSummary(candidate = {}, limit = 3) {
    const labels = Array.isArray(candidate.effectLabels)
      ? candidate.effectLabels.map(label => String(label || '').trim()).filter(Boolean)
      : [];
    if (!labels.length) return '';
    const visible = labels.slice(0, Math.max(1, limit));
    return `${visible.join('・')}${labels.length > visible.length ? ` ほか${labels.length - visible.length}件` : ''}`;
  }

  function isDpsPeriodicFormationEvent(value = {}) {
    return !!(String(value?.candidateId || '').trim() || String(value?.bindingKey || '').trim())
      && getDpsFormationCandidateSchedulePolicy(value).mode === 'periodic';
  }

  function getDpsExternalEventBindingIdentity(value = {}) {
    const bindingKey = String(value?.bindingKey || '').trim();
    if (bindingKey) return `binding:${bindingKey}`;
    const candidateId = String(value?.candidateId || '').trim();
    return candidateId ? `candidate:${candidateId}` : '';
  }

  function dedupeDpsExternalEventsByBinding(events = []) {
    const seenPeriodicBindings = new Set();
    return (Array.isArray(events) ? events : []).filter(event => {
      if (!isDpsPeriodicFormationEvent(event)) return true;
      const identity = getDpsExternalEventBindingIdentity(event);
      if (!identity || seenPeriodicBindings.has(identity)) return false;
      seenPeriodicBindings.add(identity);
      return true;
    });
  }

  function collectExternalEvents() {
    const hosts = [el.externalEventList, el.runtimeScheduleEventList].filter(Boolean);
    const rows = Array.from(new Set(hosts.flatMap(host => Array.from(
      host.querySelectorAll('.fdc-dps-external-event-row') || []
    ))));
    return dedupeDpsExternalEventsByBinding(rows.map((row, index) => {
        let candidateMeta = {};
        try {
          const parsed = JSON.parse(row.dataset.fdcpExternalCandidateMeta || '{}');
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) candidateMeta = parsed;
        } catch (_) { /* metadata is optional */ }
        const type = row.querySelector('[data-fdc-dps-external-type]')?.value || '';
        const seconds = Math.max(0, Number(row.querySelector('[data-fdc-dps-external-seconds]')?.value) || 0);
        const intervalSeconds = Math.max(0, Number(row.querySelector('[data-fdc-dps-external-interval]')?.value) || 0);
        const repeatCount = Math.max(0, Math.floor(Number(row.querySelector('[data-fdc-dps-external-count]')?.value) || 0));
        const sourceId = row.querySelector('[data-fdc-dps-external-source]')?.value?.trim() || '';
        const value = row.querySelector('[data-fdc-dps-external-value]')?.value?.trim() || '';
        const status = row.querySelector('[data-fdc-dps-external-status]')?.value?.trim() || '';
        const statusDurationSeconds = Math.max(0, Number(row.querySelector('[data-fdc-dps-external-status-duration]')?.value) || 0);
        const statusStackCount = Math.max(1, Math.min(9, Math.floor(Number(row.querySelector('[data-fdc-dps-external-status-stack-count]')?.value) || 1)));
        const reason = row.querySelector('[data-fdc-dps-external-reason]')?.value?.trim() || '';
        return {
          id: `manual:${index + 1}`,
          type,
          frame: seconds * 60,
          intervalFrames: intervalSeconds * 60,
          repeatCount,
          sourceId,
          value,
          status,
          statusDurationFrames: statusDurationSeconds * 60,
          ...(status ? { statusStackCount } : {}),
          reason: reason || ({
            shieldBreak: '手動シールド破壊',
            hpThreshold: '手動HP閾値',
            damageTaken: '手動被弾',
            statusApplied: '手動状態付与'
          })[type] || '手動外部イベント',
          candidateId: row.dataset.fdcpExternalCandidateId || '',
          candidateLabel: row.dataset.fdcpExternalCandidateLabel || '',
          candidateBasis: row.dataset.fdcpExternalCandidateBasis || '',
          bindingKey: row.dataset.fdcpExternalBindingKey || '',
          candidateEffectLabels: (() => {
            try {
              const parsed = JSON.parse(row.dataset.fdcpExternalCandidateEffects || '[]');
              return Array.isArray(parsed) ? parsed : [];
            } catch (_) { return []; }
          })(),
          ...candidateMeta
        };
      }).filter(event => event.type));
  }

  function getDpsFormationBindingModes(runtimeEffects = {}) {
    const policyApi = typeof window !== 'undefined' ? window.TRICKCAL_DPS_TRIGGER_POLICY : null;
    if (typeof policyApi?.getDpsFormationBindingModes === 'function') {
      return policyApi.getDpsFormationBindingModes(runtimeEffects);
    }
    const modes = {};
    [
      'attackSpeedEffects',
      'damageBuffEffects',
      'spRecoveryEffects',
      'cooldownEffects',
      'eventEffects'
    ].forEach(collectionKey => {
      (runtimeEffects?.[collectionKey] || []).forEach(effect => {
        if (effect?.runtimeHasExplicitOverride !== true) return;
        const bindingKey = String(effect?.bindingKey || '').trim();
        const effectId = String(effect?.id || effect?.effectId || '').trim();
        const mode = ['auto', 'fixed', 'off'].includes(String(effect?.runtimeOverrideMode || ''))
          ? String(effect.runtimeOverrideMode)
          : '';
        if (!mode) return;
        if (bindingKey) modes[bindingKey] = mode;
        if (effectId) modes[effectId] = mode;
      });
    });
    return modes;
  }

  function getDpsEffectiveExternalEvents(
    snapshot = {},
    manualEvents = collectExternalEvents(),
    runtimeEffects = snapshot?.runtimeEffects || {}
  ) {
    const formationTimelineMode = el.formationTimelineMode?.value || DEFAULT_FORMATION_TIMELINE_MODE;
    return dedupeDpsExternalEventsByBinding([
      ...(Array.isArray(manualEvents) ? manualEvents : []),
      ...createDpsFormationEstimatedEvents(
        snapshot?.formationEventCandidates || [],
        {
          formationTimelineMode,
          formationHighSkillMode: 'disabled',
          bindingModes: getDpsFormationBindingModes(runtimeEffects)
        },
        manualEvents
      )
    ]);
  }

  function scheduleRun(options = {}) {
    const canReuseSourceSnapshot = options?.reuseSourceSnapshot === true;
    pendingRunCanReuseSourceSnapshot = rerunTimer
      ? pendingRunCanReuseSourceSnapshot && canReuseSourceSnapshot
      : canReuseSourceSnapshot;
    clearTimeout(rerunTimer);
    rerunTimer = setTimeout(() => {
      rerunTimer = 0;
      const reuseSourceSnapshot = pendingRunCanReuseSourceSnapshot;
      pendingRunCanReuseSourceSnapshot = false;
      runSimulation({ reuseSourceSnapshot });
    }, 120);
  }

  function runSimulation(options = {}) {
    rerunTimer = 0;
    pendingRunCanReuseSourceSnapshot = false;
    const api = window.TRICKCAL_DAMAGE_CALC;
    const simulator = window.TRICKCAL_DPS_SIMULATOR;
    const timingData = typeof DPS_TIMING_DATA === 'undefined' ? null : DPS_TIMING_DATA;
    const createDpsInput = api?.createDpsEvaluationInput || api?.createDpsSnapshot;
    if (!createDpsInput || !simulator || !timingData) {
      renderError('DPS試験用データまたは計算モジュールを読み込めませんでした。');
      return;
    }
    const canReuseSourceSnapshot = options?.reuseSourceSnapshot === true && latestSourceSnapshot;
    const snapshot = canReuseSourceSnapshot
      ? latestSourceSnapshot
      : ensureDpsFavoriteSkillOverrides(createDpsInput());
    const previousSourceSnapshotFingerprint = latestSourceSnapshotFingerprint;
    const currentSourceSnapshotFingerprint = createDpsSourceFingerprint(snapshot);
    const sourceSnapshotChanged = !canReuseSourceSnapshot
      && !!previousSourceSnapshotFingerprint
      && previousSourceSnapshotFingerprint !== currentSourceSnapshotFingerprint;
    if (!canReuseSourceSnapshot) {
      latestSourceSnapshot = snapshot;
      latestSourceSnapshotFingerprint = currentSourceSnapshotFingerprint;
    }
    activeTargetId = String(snapshot.targetId || '');
    const runtimeSettings = applyRuntimeEffectOverrides(snapshot.runtimeEffects || {}, activeTargetId);
    latestRuntimeEffectsDisplay = runtimeSettings.display;
    renderFormationEventCandidates(snapshot.formationEventCandidates || [], runtimeSettings.display);
    const manualExternalEvents = collectExternalEvents();
    const formationTimelineMode = el.formationTimelineMode?.value || DEFAULT_FORMATION_TIMELINE_MODE;
    const externalEvents = getDpsEffectiveExternalEvents(snapshot, manualExternalEvents, runtimeSettings.display);
    const externalEventFingerprint = createDataFingerprint(externalEvents);
    const effectiveSnapshot = {
      ...snapshot,
      runtimeEffects: runtimeSettings.simulation,
      externalEvents
    };
    const trialCount = Number(el.trials?.value) || 16;
    const runtimeOverrideFingerprint = createRuntimeOverrideFingerprint(activeTargetId);
    const simulationKey = createSimulationKey({
      snapshot: latestSourceSnapshotFingerprint,
      runtimeOverrides: runtimeOverrideFingerprint,
      externalEvents: externalEventFingerprint,
      durationSeconds: Number(el.duration?.value) || 60,
      highSkillMode: el.highMode?.value || 'disabled',
      initialDelaySeconds: Math.max(0, Number(el.initialDelay?.value) || 0),
      seed: Number(el.seed?.value) || 1,
      trials: trialCount,
      formationTimelineMode
    });
    if (latestRun && latestSimulationKey === simulationKey) return;
    const timing = timingData.apostles?.[String(snapshot.targetId || '').toLowerCase()];
    if (!snapshot.apostle) {
      renderError(`${snapshot.targetName || '選択使徒'}のスキルデータを読み込めませんでした。`);
      return;
    }
    if (!timing) {
      renderWithoutTiming(effectiveSnapshot, runtimeSettings.display, sourceSnapshotChanged);
      return;
    }
    cancelAggregateWorker();
    const configKey = createSimulationKey({
      snapshot: latestSourceSnapshotFingerprint,
      runtimeOverrides: runtimeOverrideFingerprint,
      externalEvents: externalEventFingerprint
    });
    let config = getCombatantConfigCache(configKey);
    if (!config) {
      config = simulator.buildCombatantConfig(snapshot.apostle, timing, {
        scenario: snapshot.scenario,
        skillLevels: snapshot.skillLevels,
        skillOverrides: snapshot.dpsSkillOverrides,
        timingBranches: snapshot.dpsTimingBranches,
        runtimeEffects: runtimeSettings.simulation,
        externalEvents,
        enemySize: snapshot.scenario?.battleConditions?.enemySize || snapshot.scenario?.actors?.enemy?.size || '',
        enemySizeRank: snapshot.scenario?.battleConditions?.enemySizeRank || snapshot.scenario?.actors?.enemy?.sizeRank || 0
      });
      setCombatantConfigCache(configKey, config);
    }
    const initialDelaySeconds = Math.max(0, Number(el.initialDelay?.value) || 0);
    const durationSeconds = Number(el.duration?.value) || 60;
    const seed = Number(el.seed?.value) || 1;
    const simulationOptions = {
      durationSeconds,
      highSkillMode: el.highMode?.value || 'disabled',
      initialActionDelayFrames: initialDelaySeconds * 60,
      seed,
      adaptiveTrials: true,
      adaptiveMinTrials: 16,
      adaptiveRelativeErrorP: 0.2,
      formationTimelineMode,
      damageProfiles: snapshot.actionDamageProfiles || {},
      statusDamageProfiles: snapshot.statusDamageProfiles || {}
    };
    const cached = getSimulationCache(simulationKey);
    if (!cached?.result && window.Worker) {
      latestRun = {
        scenario: snapshot.scenario || null,
        snapshot: effectiveSnapshot,
        runtimeEffectsDisplay: runtimeSettings.display,
        timing,
        config,
        result: null,
        aggregate: null,
        simulationKey,
        options: { ...simulationOptions, trials: trialCount }
      };
      latestSimulationKey = simulationKey;
      if (baseline && baseline.targetId !== snapshot.targetId) {
        clearBaseline(`${baseline.targetName}から使徒が変更されたため、基準を解除しました。`);
      } else {
        if (baseline && sourceSnapshotChanged && el.comparisonPanel && !el.comparisonPanel.hidden) hideComparison();
        updateBaselineControls();
      }
      if (el.status) el.status.textContent = '単一seed計算中…';
      startSingleWorker(config, simulationOptions, trialCount, simulationKey, effectiveSnapshot, timing, runtimeSettings.display, timingData);
      return;
    }
    const result = cached?.result || simulator.simulate(config, simulationOptions);
    latestRun = {
      scenario: snapshot.scenario || null,
      snapshot: effectiveSnapshot,
      runtimeEffectsDisplay: runtimeSettings.display,
      timing,
      config,
      result,
      aggregate: cached?.aggregate || null,
      simulationKey,
      options: {
        ...simulationOptions,
        trials: trialCount
      }
    };
    latestSimulationKey = simulationKey;
    if (baseline && baseline.targetId !== snapshot.targetId) {
      clearBaseline(`${baseline.targetName}から使徒が変更されたため、基準を解除しました。`);
    } else {
      if (baseline && sourceSnapshotChanged && el.comparisonPanel && !el.comparisonPanel.hidden) hideComparison();
      updateBaselineControls();
    }
    if (cached?.aggregate) {
      renderSimulation(effectiveSnapshot, timing, config, result, cached.aggregate, timingData, runtimeSettings.display);
      if (el.status) el.status.textContent = 'キャッシュから計算結果を復元しました。';
      return;
    }
    if (el.status && !cached) {
      const elapsedMs = Number(result.performance?.elapsedMs);
      const processedTicks = Number(result.performance?.processedTickCount);
      const skippedTicks = Number(result.performance?.skippedTickCount);
      const timingNote = Number.isFinite(elapsedMs)
        ? ` / 単一seed ${formatNumber(elapsedMs)}ms・${formatNumber(processedTicks)}tick処理（${formatNumber(skippedTicks)}tick短縮）`
        : '';
      el.status.textContent = `単一seedを表示中${timingNote}`;
    }
    renderSimulation(effectiveSnapshot, timing, config, result, null, timingData, runtimeSettings.display);
    if (trialCount > 1) {
      if (el.status) el.status.textContent = '単一seedを表示中 / 複数seed集計中…';
      startAggregateWorker(config, simulationOptions, trialCount, simulationKey, effectiveSnapshot, timing, runtimeSettings.display, timingData);
    } else {
      latestRun.aggregate = simulator.simulateMany(config, { ...simulationOptions, trials: 1 });
      setSimulationCache(simulationKey, { result, aggregate: latestRun.aggregate });
      renderSimulation(effectiveSnapshot, timing, config, result, latestRun.aggregate, timingData, runtimeSettings.display);
    }
  }

  function ensureDpsFavoriteSkillOverrides(snapshot = {}) {
    const existingOverrides = snapshot.dpsSkillOverrides && typeof snapshot.dpsSkillOverrides === 'object'
      ? snapshot.dpsSkillOverrides
      : {};
    const rewriteOptions = (snapshot.selectedSkillOptions || [])
      .filter(option => option?.skillRewrite === true)
      .filter(option => String(option?.sourceKey || '').startsWith('favorite:'));
    if (!rewriteOptions.length) return snapshot;
    const favoriteLevels = snapshot.apostle?.favoriteCard?.levels || {};
    const overrides = { ...existingOverrides };
    const branches = { ...(snapshot.dpsTimingBranches || {}) };
    rewriteOptions.forEach(option => {
      const level = Number(String(option.sourceKey || '').split(':')[1]);
      const skills = Array.isArray(favoriteLevels[level]) ? favoriteLevels[level] : [];
      const skill = skills.find(candidate => (candidate?.effects || [])
        .some(effect => effect?.effectId && effect.effectId === option.effectId)) || skills[0];
      if (!skill) return;
      getDpsRewriteActionKeys(option.targetSkill).forEach(actionKey => {
        // DPS入力生成側が既に正規の置換を作成している場合は保持し、
        // 部分的に欠けているアクションだけをフォールバックで補完する。
        if (overrides[actionKey]) return;
        const override = typeof simulator?.createActionSkillOverride === 'function'
          ? simulator.createActionSkillOverride(skill, actionKey)
          : cloneData(skill);
        const targetName = String(option.targetSkillName || '').trim();
        if (targetName) {
          override.skillName = targetName;
          override.dpsActionName = targetName;
        }
        const favoriteName = String(snapshot.apostle?.favoriteCard?.name || '').trim();
        const actionTiming = typeof DPS_TIMING_DATA === 'undefined'
          ? null
          : DPS_TIMING_DATA?.apostles?.[String(snapshot.targetId || '').toLowerCase()]?.actions?.[actionKey];
        const availableBranches = [
          ...(actionTiming?.motionVariants || []),
          ...(actionTiming?.timingEvents || []),
          ...(actionTiming?.timingPatterns || []),
          ...(actionTiming?.generatedObjects || [])
        ].map(item => String(item?.branch || '').trim()).filter(Boolean);
        if (favoriteName && availableBranches.includes(favoriteName)) {
          override.dpsTimingBranch = favoriteName;
          branches[actionKey] = favoriteName;
        }
        override.dpsSourceKey = String(option.sourceKey || '');
        if (actionKey === 'highSkill' && !(Number(override.cooldownSeconds) > 0)) {
          const baseHigh = (snapshot.apostle?.skills || []).find(candidate => /高学年/.test(String(candidate?.skillType || '')));
          const cooldown = Number(baseHigh?.cooldownSeconds);
          if (cooldown > 0) override.cooldownSeconds = cooldown;
        }
        overrides[actionKey] = override;
      });
    });
    if (Object.keys(overrides).length === Object.keys(existingOverrides).length
      && Object.keys(branches).length === Object.keys(snapshot.dpsTimingBranches || {}).length) {
      return snapshot;
    }
    return {
      ...snapshot,
      dpsSkillOverrides: overrides,
      dpsTimingBranches: { ...(snapshot.dpsTimingBranches || {}), ...branches }
    };
  }

  function getDpsRewriteActionKeys(value = '') {
    const text = String(value || '').replace(/[\s　・_]/g, '');
    const keys = [];
    if (/基本攻撃|(?:普通|通常)攻撃基本/.test(text)) keys.push('basicAttack');
    if (/強化攻撃|(?:普通|通常)攻撃強化/.test(text)) keys.push('enhancedAttack');
    if (/低学年/.test(text)) keys.push('lowSkill');
    if (/高学年/.test(text)) keys.push('highSkill');
    if (!keys.some(key => key === 'basicAttack' || key === 'enhancedAttack') && /普通攻撃|通常攻撃/.test(text)) {
      keys.push('basicAttack', 'enhancedAttack');
    }
    return [...new Set(keys)];
  }

  function renderWithoutTiming(snapshot, runtimeEffectsDisplay = snapshot.runtimeEffects || {}, sourceSnapshotChanged = false) {
    cancelAggregateWorker();
    latestRun = null;
    latestSimulationKey = '';
    if (baseline && baseline.targetId !== snapshot.targetId) {
      clearBaseline(`${baseline.targetName}から使徒が変更されたため、基準を解除しました。`);
    } else {
      if (baseline && sourceSnapshotChanged && el.comparisonPanel && !el.comparisonPanel.hidden) hideComparison();
      updateBaselineControls();
    }
    el.targetNote.textContent = `${snapshot.targetName || '選択使徒'} / スキル速度未登録`;
    el.status.textContent = '速度データがないためDPSとタイムラインは計算できません。行動別適用効果は確認できます。';
    el.status.classList.add('has-warning');
    el.summary.innerHTML = '<div class="fdc-dps-summary-card"><span>DPS計算</span><strong>速度未登録</strong><small>効果範囲の監査のみ利用できます</small></div>';
    if (el.contribution) el.contribution.innerHTML = '<p class="fdc-dps-empty">スキル速度データの追加後にDPS寄与度を計算できます。</p>';
    if (el.trialNote) el.trialNote.textContent = '';
    if (el.timeline) el.timeline.innerHTML = '<p class="fdc-dps-empty">速度データがないためタイムラインは生成していません。</p>';
    renderActionEffectAudit(
      snapshot.actionEffectAudit || {},
      snapshot.actionDamageProfiles || {},
      runtimeEffectsDisplay,
      null,
      snapshot.additionalDamageComponents || [],
      snapshot.externalEvents || []
    );
  }

  function cancelAggregateWorker() {
    aggregateRequestId += 1;
    singleRequestId += 1;
    if (singleWorker) {
      singleWorker.terminate();
      singleWorker = null;
    }
    if (aggregateWorker) {
      aggregateWorker.terminate();
      aggregateWorker = null;
    }
  }

  function startSingleWorker(config, simulationOptions, trialCount, simulationKey, snapshot, timing, runtimeEffectsDisplay, timingData) {
    const requestId = ++singleRequestId;
    const finish = result => {
      if (!latestRun || requestId !== singleRequestId || latestRun.simulationKey !== simulationKey) return;
      latestRun.result = result;
      renderSimulation(snapshot, timing, config, result, null, timingData, runtimeEffectsDisplay);
      if (trialCount > 1) {
        if (el.status) el.status.textContent = '単一seedを表示中 / 複数seed集計中…';
        startAggregateWorker(config, simulationOptions, trialCount, simulationKey, snapshot, timing, runtimeEffectsDisplay, timingData);
      } else {
        const simulator = window.TRICKCAL_DPS_SIMULATOR;
        latestRun.aggregate = simulator.simulateMany(config, { ...simulationOptions, trials: 1 });
        setSimulationCache(simulationKey, { result, aggregate: latestRun.aggregate });
        renderSimulation(snapshot, timing, config, result, latestRun.aggregate, timingData, runtimeEffectsDisplay);
      }
    };
    const fallback = () => {
      const simulator = window.TRICKCAL_DPS_SIMULATOR;
      if (!simulator) return;
      setTimeout(() => {
        if (requestId !== singleRequestId) return;
        finish(simulator.simulate(config, simulationOptions));
      }, 0);
    };
    try {
      singleWorker = new Worker('dps-simulator-worker.js?v=20260901b');
      singleWorker.onmessage = event => {
        if (event.data?.requestId !== requestId) return;
        singleWorker?.terminate();
        singleWorker = null;
        if (event.data.error) {
          fallback();
          return;
        }
        finish(event.data.result);
      };
      singleWorker.onerror = () => {
        singleWorker?.terminate();
        singleWorker = null;
        fallback();
      };
      singleWorker.postMessage({
        requestId,
        mode: 'single',
        config,
        options: simulationOptions
      });
    } catch {
      singleWorker = null;
      fallback();
    }
  }

  function startAggregateWorker(config, simulationOptions, trialCount, simulationKey, snapshot, timing, runtimeEffectsDisplay, timingData) {
    const requestId = ++aggregateRequestId;
    const finish = aggregate => {
      if (!latestRun || requestId !== aggregateRequestId || latestRun.simulationKey !== simulationKey) return;
      latestRun.aggregate = aggregate;
      setSimulationCache(simulationKey, { result: latestRun.result, aggregate });
      renderSimulation(snapshot, timing, config, latestRun.result, aggregate, timingData, runtimeEffectsDisplay);
    };
    const fallback = () => {
      const simulator = window.TRICKCAL_DPS_SIMULATOR;
      if (!simulator) return;
      setTimeout(() => {
        if (requestId !== aggregateRequestId) return;
        finish(simulator.simulateMany(config, {
          ...simulationOptions,
          trials: trialCount,
          recordTimeline: false,
          recordDamageSeries: false
        }));
      }, 0);
    };
    if (!window.Worker) {
      fallback();
      return;
    }
    try {
      aggregateWorker = new Worker('dps-simulator-worker.js?v=20260901b');
      aggregateWorker.onmessage = event => {
        if (event.data?.requestId !== requestId) return;
        if (event.data.progress) {
          const progress = event.data.progress;
          if (el.status) el.status.textContent = `単一seedを表示中 / 複数seed集計中 ${formatNumber(progress.completed)} / ${formatNumber(progress.total)} seed…`;
          return;
        }
        aggregateWorker?.terminate();
        aggregateWorker = null;
        if (event.data.error) {
          fallback();
          return;
        }
        finish(event.data.result);
      };
      aggregateWorker.onerror = () => {
        aggregateWorker?.terminate();
        aggregateWorker = null;
        fallback();
      };
      aggregateWorker.postMessage({
        requestId,
        config,
        options: { ...simulationOptions, trials: trialCount }
      });
    } catch {
      aggregateWorker = null;
      fallback();
    }
  }

  function createSimulationKey(input = {}) {
    try {
      return JSON.stringify(input);
    } catch {
      return `${input.snapshot?.targetId || ''}:${input.durationSeconds}:${input.seed}:${input.trials}`;
    }
  }

  function createDataFingerprint(value) {
    let serialized = '';
    try {
      serialized = JSON.stringify(value);
    } catch {
      return `unserializable:${Date.now()}`;
    }
    let hashA = 2166136261;
    let hashB = 2246822507;
    for (let index = 0; index < serialized.length; index += 1) {
      const code = serialized.charCodeAt(index);
      hashA = Math.imul(hashA ^ code, 16777619);
      hashB = Math.imul(hashB ^ code, 3266489917);
    }
    return `${serialized.length}:${hashA >>> 0}:${hashB >>> 0}`;
  }

  function createDpsSourceFingerprint(snapshot = {}) {
    const normalized = cloneData(snapshot);
    const scenario = normalized?.scenario;
    if (scenario && typeof scenario === 'object') {
      normalized.scenario = {
        actors: scenario.actors || {},
        characterState: scenario.characterState || {},
        formationState: scenario.formationState || {},
        cardState: scenario.cardState || {},
        battleConditions: scenario.battleConditions || {},
        effectAssumptions: scenario.effectAssumptions || {}
      };
    }
    return createDataFingerprint(normalized);
  }

  function createRuntimeOverrideFingerprint(targetId) {
    const overrides = runtimeEffectOverrides?.[String(targetId || '')] || {};
    const normalized = Object.keys(overrides).sort().map(effectId => {
      const setting = overrides[effectId] || {};
      return [effectId, setting.mode || 'auto', Math.max(1, Math.floor(Number(setting.fixedStacks) || 1))];
    });
    return createDataFingerprint(normalized);
  }

  function getSimulationCache(key) {
    if (!key || !simulationCache.has(key)) return null;
    const value = simulationCache.get(key);
    simulationCache.delete(key);
    simulationCache.set(key, value);
    return value;
  }

  function setSimulationCache(key, value) {
    if (!key || !value) return;
    simulationCache.delete(key);
    simulationCache.set(key, value);
    while (simulationCache.size > SIMULATION_CACHE_LIMIT) {
      simulationCache.delete(simulationCache.keys().next().value);
    }
  }

  function getCombatantConfigCache(key) {
    if (!key || !combatantConfigCache.has(key)) return null;
    const value = combatantConfigCache.get(key);
    combatantConfigCache.delete(key);
    combatantConfigCache.set(key, value);
    return value;
  }

  function setCombatantConfigCache(key, value) {
    if (!key || !value) return;
    combatantConfigCache.delete(key);
    combatantConfigCache.set(key, value);
    while (combatantConfigCache.size > COMBATANT_CONFIG_CACHE_LIMIT) {
      combatantConfigCache.delete(combatantConfigCache.keys().next().value);
    }
  }

  function saveBaseline() {
    if (!latestRun?.aggregate || !(latestRun.aggregate.totalExpectedDamage > 0)) {
      if (el.baselineNote) el.baselineNote.textContent = 'DPS集計の完了後に基準を保存してください。';
      return;
    }
    const dpsSnapshot = cloneData(latestRun.snapshot);
    const inputFingerprint = createDataFingerprint(dpsSnapshot);
    baseline = {
      targetId: latestRun.snapshot.targetId,
      targetName: latestRun.snapshot.targetName,
      scenario: cloneData(latestRun.scenario || latestRun.snapshot.scenario || null),
      dpsSnapshot,
      inputFingerprint,
      config: cloneData(latestRun.config),
      damageProfiles: cloneData(latestRun.snapshot.actionDamageProfiles || {}),
      statusDamageProfiles: cloneData(latestRun.snapshot.statusDamageProfiles || {}),
      options: cloneData({
        durationSeconds: latestRun.options.durationSeconds,
        highSkillMode: latestRun.options.highSkillMode,
        initialActionDelayFrames: latestRun.options.initialActionDelayFrames,
        seed: latestRun.options.seed,
        trials: latestRun.options.trials,
        adaptiveTrials: latestRun.options.adaptiveTrials !== false,
        adaptiveMinTrials: latestRun.options.adaptiveMinTrials || 16,
        adaptiveRelativeErrorP: latestRun.options.adaptiveRelativeErrorP || 0.2,
        formationTimelineMode: latestRun.options.formationTimelineMode || DEFAULT_FORMATION_TIMELINE_MODE
      }),
      aggregate: cloneData(latestRun.aggregate),
      aggregateFingerprint: createDpsAggregateFingerprint(inputFingerprint, latestRun.options),
      result: latestRun.result
    };
    hideComparison();
    updateBaselineControls();
    refreshDamageGraphBaseline();
    dispatchDpsComparisonDefinitionChanged({ mode: 'pinned' });
  }

  function createSharedSessionBaseline(simulator, timingData, options) {
    const scenarioApi = window.TRICKCAL_COMBAT_SCENARIO;
    const session = scenarioApi?.loadComparisonSession?.();
    const saved = session?.caches?.dps?.snapshot || session?.baseline?.dpsSnapshot;
    if (!saved?.targetId || !saved.apostle) return null;
    const timing = timingData?.apostles?.[String(saved.targetId).toLowerCase()];
    if (!timing) return null;
    return {
      targetId: saved.targetId,
      targetName: saved.targetName || session.baseline.scenario?.actors?.self?.name || saved.targetId,
      scenario: cloneData(session.baseline.scenario || null),
      config: simulator.buildCombatantConfig(saved.apostle, timing, {
        scenario: saved.scenario || session?.baseline?.scenario,
        skillLevels: saved.skillLevels,
        skillOverrides: saved.dpsSkillOverrides,
        timingBranches: saved.dpsTimingBranches,
        runtimeEffects: saved.runtimeEffects,
        externalEvents: saved.externalEvents || [],
        enemySize: saved.scenario?.battleConditions?.enemySize || saved.scenario?.actors?.enemy?.size || '',
        enemySizeRank: saved.scenario?.battleConditions?.enemySizeRank || saved.scenario?.actors?.enemy?.sizeRank || 0
      }),
      damageProfiles: cloneData(saved.actionDamageProfiles || {}),
      statusDamageProfiles: cloneData(saved.statusDamageProfiles || {}),
      options: cloneData({
        durationSeconds: options.durationSeconds,
        highSkillMode: options.highSkillMode,
        initialActionDelayFrames: options.initialActionDelayFrames,
        seed: options.seed,
        trials: options.trials,
        adaptiveTrials: options.adaptiveTrials !== false,
        adaptiveMinTrials: options.adaptiveMinTrials || 16,
        adaptiveRelativeErrorP: options.adaptiveRelativeErrorP || 0.2,
        formationTimelineMode: options.formationTimelineMode || DEFAULT_FORMATION_TIMELINE_MODE
      }),
      aggregate: null,
      result: null,
      sharedSession: true
    };
  }

  function saveSharedSessionBaseline(snapshot) {
    const scenarioApi = window.TRICKCAL_COMBAT_SCENARIO;
    if (!scenarioApi?.savePinnedComparison || !snapshot?.scenario) return;
    scenarioApi.savePinnedComparison({
      scenario: snapshot.scenario,
      singleActionResult: snapshot.currentDamageResult || {},
      dpsSnapshot: {
        targetId: snapshot.targetId || '',
        targetName: snapshot.targetName || '',
        apostle: cloneData(snapshot.apostle || null),
        dpsSkillOverrides: cloneData(snapshot.dpsSkillOverrides || {}),
        dpsTimingBranches: cloneData(snapshot.dpsTimingBranches || {}),
        skillLevels: cloneData(snapshot.skillLevels || {}),
        damageType: snapshot.damageType || '',
        actionCategory: snapshot.actionCategory || '',
        selectedSkillOptionKey: snapshot.selectedSkillOptionKey || '',
        boardState: cloneData(snapshot.boardState || snapshot.scenario?.characterState?.boardState || null),
        singleActionProfiles: cloneData(snapshot.singleActionProfiles || {}),
        actionDamageProfiles: cloneData(snapshot.actionDamageProfiles || {}),
        statusDamageProfiles: cloneData(snapshot.statusDamageProfiles || {}),
        actionEffectAudit: cloneData(snapshot.actionEffectAudit || {}),
        runtimeEffects: cloneData(snapshot.runtimeEffects || {}),
        externalEvents: cloneData(snapshot.externalEvents || [])
      }
    });
  }

  function compareWithBaseline() {
    if (!baseline) return;
    const api = window.TRICKCAL_DAMAGE_CALC;
    const simulator = window.TRICKCAL_DPS_SIMULATOR;
    const timingData = typeof DPS_TIMING_DATA === 'undefined' ? null : DPS_TIMING_DATA;
    // 通常表示と同じく、愛用品によるスキル書き換えを補完してから
    // 比較用コンフィグを組み立てる。これを省くとティグのように
    // 愛用品用タイミングを基礎スキルへ誤適用し、同じ高学年を複数回
    // ダメージとして数えることがある。
    const createDpsInput = api?.createDpsEvaluationInput || api?.createDpsSnapshot;
    const snapshot = ensureDpsFavoriteSkillOverrides(createDpsInput?.() || {});
    const timing = timingData?.apostles?.[String(snapshot?.targetId || '').toLowerCase()];
    if (!snapshot?.apostle || !timing || !simulator) {
      if (el.baselineNote) el.baselineNote.textContent = '変更後のDPSデータを作成できませんでした。';
      return;
    }
    if (snapshot.targetId !== baseline.targetId) {
      clearBaseline(`${baseline.targetName}から使徒が変更されたため、基準を解除しました。`);
      return;
    }
    const runtimeSettings = applyRuntimeEffectOverrides(snapshot.runtimeEffects || {}, snapshot.targetId);
    const externalEvents = getDpsEffectiveExternalEvents(snapshot, collectExternalEvents(), runtimeSettings.display);
    const candidateConfig = simulator.buildCombatantConfig(snapshot.apostle, timing, {
      scenario: snapshot.scenario,
      skillLevels: snapshot.skillLevels,
      skillOverrides: snapshot.dpsSkillOverrides,
      timingBranches: snapshot.dpsTimingBranches,
      runtimeEffects: runtimeSettings.simulation,
      externalEvents,
      enemySize: snapshot.scenario?.battleConditions?.enemySize || snapshot.scenario?.actors?.enemy?.size || '',
      enemySizeRank: snapshot.scenario?.battleConditions?.enemySizeRank || snapshot.scenario?.actors?.enemy?.sizeRank || 0
    });
    const commonOptions = {
      ...baseline.options,
      adaptiveTrials: baseline.options.adaptiveTrials !== false,
      adaptiveMinTrials: baseline.options.adaptiveMinTrials || 16,
      adaptiveRelativeErrorP: baseline.options.adaptiveRelativeErrorP || 0.2,
      formationTimelineMode: baseline.options.formationTimelineMode || DEFAULT_FORMATION_TIMELINE_MODE
    };
    const baselineAggregate = getOrCreateBaselineAggregate(simulator, timingData, commonOptions);
    if (!baselineAggregate) {
      if (el.baselineNote) el.baselineNote.textContent = '変更前のDPS基準を再構築できませんでした。';
      return;
    }
    const candidateAggregate = simulator.simulateMany(candidateConfig, {
      ...commonOptions,
      damageProfiles: snapshot.actionDamageProfiles || {},
      statusDamageProfiles: snapshot.statusDamageProfiles || {}
    });
    renderComparison(baselineAggregate, candidateAggregate, commonOptions);
  }

  function createDpsAggregateFingerprint(inputFingerprint = '', options = {}) {
    return createSimulationKey({
      snapshot: inputFingerprint || '',
      durationSeconds: Number(options.durationSeconds) || 0,
      highSkillMode: options.highSkillMode || 'disabled',
      initialActionDelayFrames: Number(options.initialActionDelayFrames) || 0,
      seed: Number(options.seed) || 1,
      trials: Number(options.trials) || 1,
      adaptiveTrials: options.adaptiveTrials !== false,
      adaptiveMinTrials: Number(options.adaptiveMinTrials) || 16,
      adaptiveRelativeErrorP: Number(options.adaptiveRelativeErrorP) || 0.2,
      formationTimelineMode: options.formationTimelineMode || DEFAULT_FORMATION_TIMELINE_MODE
    });
  }

  function getOrCreateBaselineAggregate(simulator, timingData, options = {}) {
    if (!baseline || !simulator) return null;
    const expectedFingerprint = baseline.inputFingerprint
      ? createDpsAggregateFingerprint(baseline.inputFingerprint, options)
      : '';
    const cacheIsUsable = !!baseline.aggregate
      && (!baseline.aggregateFingerprint || !expectedFingerprint || baseline.aggregateFingerprint === expectedFingerprint);
    if (cacheIsUsable) return baseline.aggregate;

    let config = baseline.config;
    const snapshot = baseline.dpsSnapshot || {};
    if (!config && snapshot.apostle) {
      const timing = timingData?.apostles?.[String(snapshot.targetId || baseline.targetId || '').toLowerCase()];
      if (timing) {
        config = simulator.buildCombatantConfig(snapshot.apostle, timing, {
          scenario: snapshot.scenario || baseline.scenario,
          skillLevels: snapshot.skillLevels,
          skillOverrides: snapshot.dpsSkillOverrides,
          timingBranches: snapshot.dpsTimingBranches,
          runtimeEffects: snapshot.runtimeEffects,
          externalEvents: snapshot.externalEvents || [],
          enemySize: snapshot.scenario?.battleConditions?.enemySize || snapshot.scenario?.actors?.enemy?.size || '',
          enemySizeRank: snapshot.scenario?.battleConditions?.enemySizeRank || snapshot.scenario?.actors?.enemy?.sizeRank || 0
        });
      }
    }
    if (!config) return null;
    const aggregate = simulator.simulateMany(config, {
      ...options,
      damageProfiles: snapshot.actionDamageProfiles || baseline.damageProfiles || {},
      statusDamageProfiles: snapshot.statusDamageProfiles || baseline.statusDamageProfiles || {}
    });
    baseline.config = config;
    baseline.aggregate = aggregate;
    baseline.aggregateFingerprint = expectedFingerprint;
    return aggregate;
  }

  function clearBaseline(message = '基準は未保存です。') {
    baseline = null;
    hideComparison();
    updateBaselineControls(message);
    refreshDamageGraphBaseline();
    dispatchDpsComparisonDefinitionChanged({ mode: 'none' });
  }

  function dispatchDpsComparisonDefinitionChanged({ mode = 'pinned' } = {}) {
    window.dispatchEvent(new CustomEvent('trickcal:comparison-definition-changed', {
      detail: {
        evaluator: 'dps',
        mode,
        targetId: baseline?.targetId || activeTargetId,
        source: 'dps-local'
      }
    }));
  }

  function refreshDamageGraphBaseline() {
    if (!latestGraphData) return;
    latestGraphData = {
      ...latestGraphData,
      baselineResult: baseline?.result || null
    };
    drawDamageGraph(latestGraphData);
  }

  function hideComparison() {
    if (el.comparisonPanel) el.comparisonPanel.hidden = true;
    if (el.comparison) el.comparison.innerHTML = '';
    if (el.comparisonNote) el.comparisonNote.textContent = '';
  }

  function updateBaselineControls(message = '') {
    const hasBaseline = !!baseline;
    if (el.baselineCompare) el.baselineCompare.disabled = !hasBaseline;
    if (el.baselineClear) el.baselineClear.disabled = !hasBaseline;
    if (!el.baselineNote) return;
    if (message) {
      el.baselineNote.textContent = message;
      return;
    }
    if (!baseline) {
      el.baselineNote.textContent = '基準は未保存です。';
      return;
    }
    const lastSeed = baseline.options.seed + baseline.options.trials - 1;
    el.baselineNote.textContent = `${baseline.targetName} / ${formatNumber(baseline.options.durationSeconds)}秒 / seed ${formatNumber(baseline.options.seed)}～${formatNumber(lastSeed)}を基準に保存中`;
  }

  function renderComparison(before, after, options) {
    if (!el.comparisonPanel || !el.comparison) return;
    const totalDelta = after.meanDps - before.meanDps;
    const totalDeltaP = before.meanDps ? totalDelta / before.meanDps * 100 : 0;
    const damageDelta = after.totalExpectedDamage - before.totalExpectedDamage;
    const rows = ACTION_ORDER.map(key => {
      const beforeItem = before.byAction?.[key] || {};
      const afterItem = after.byAction?.[key] || {};
      const dpsDelta = (afterItem.contributionDps || 0) - (beforeItem.contributionDps || 0);
      const startsDelta = (afterItem.averageStarts || 0) - (beforeItem.averageStarts || 0);
      return `
        <div class="fdc-dps-comparison-row">
          <strong>${escapeHtml(ACTION_LABELS[key])}</strong>
          <span>${formatDamage(beforeItem.contributionDps)}</span>
          <span>${formatDamage(afterItem.contributionDps)}</span>
          <span class="fdc-dps-delta ${getDeltaClass(dpsDelta)}">${formatSignedDamage(dpsDelta)}</span>
          <span class="fdc-dps-delta ${getDeltaClass(startsDelta)}">${formatSignedNumber(startsDelta)}回</span>
        </div>
      `;
    }).join('');
    const lastSeed = options.seed + options.trials - 1;
    if (el.comparisonNote) {
      el.comparisonNote.textContent = `${formatNumber(options.durationSeconds)}秒・seed ${formatNumber(options.seed)}～${formatNumber(lastSeed)}を変更前後に共通使用`;
    }
    el.comparison.innerHTML = `
      <div class="fdc-dps-comparison-total">
        <div><span>変更前DPS</span><strong>${formatDamage(before.meanDps)}</strong></div>
        <div><span>変更後DPS</span><strong>${formatDamage(after.meanDps)}</strong></div>
        <div><span>DPS差</span><strong class="fdc-dps-delta ${getDeltaClass(totalDelta)}">${formatSignedDamage(totalDelta)}（${formatSignedPercent(totalDeltaP)}）</strong></div>
        <div><span>平均総ダメージ差</span><strong class="fdc-dps-delta ${getDeltaClass(damageDelta)}">${formatSignedDamage(damageDelta)}</strong></div>
      </div>
      <div class="fdc-dps-comparison-table">
        <div class="fdc-dps-comparison-header"><span>行動</span><span>変更前</span><span>変更後</span><span>DPS差</span><span>発動差</span></div>
        ${rows}
      </div>
    `;
    el.comparisonPanel.hidden = false;
  }

  function renderError(message) {
    deferredDetailRevision += 1;
    lastRenderedDetailKey = '';
    el.targetNote.textContent = message;
    el.status.textContent = '';
    el.summary.innerHTML = '';
    if (el.contribution) el.contribution.innerHTML = `<p class="fdc-dps-empty">${escapeHtml(message)}</p>`;
    if (el.trialNote) el.trialNote.textContent = '';
    if (el.effectAudit) el.effectAudit.innerHTML = `<p class="fdc-dps-empty">${escapeHtml(message)}</p>`;
    if (el.effectAuditNote) el.effectAuditNote.textContent = '';
    el.timeline.innerHTML = `<p class="fdc-dps-empty">${escapeHtml(message)}</p>`;
  }

  function renderSimulation(snapshot, timing, config, result, aggregate, timingData, runtimeEffectsDisplay = snapshot.runtimeEffects || {}) {
    el.targetNote.textContent = `${snapshot.targetName} / ゲーム内${formatNumber(result.durationSeconds)}秒`;
    const warnings = unique([...(timingData.warnings || []), ...(result.warnings || [])]
      .map(value => String(value || '').trim())
      .filter(Boolean));
    el.status.innerHTML = warnings.length
      ? `<details><summary>暫定データ: ${warnings.length}件の確認事項</summary><ul>${warnings.map(warning => `<li>${escapeHtml(warning)}</li>`).join('')}</ul></details>`
      : '速度・発生フレームの暫定データで計算しています。';
    el.status.classList.toggle('has-warning', warnings.length > 0);
    renderContribution(aggregate, !aggregate && !!result);
    latestGraphData = { result, aggregate, baselineResult: baseline?.result || null };
    drawDamageGraph(latestGraphData);

    const actionCards = ACTION_ORDER.map(key => `
      <div class="fdc-dps-summary-card">
        <span>${ACTION_LABELS[key]}</span>
        <strong>${formatNumber(result.counts[key] || 0)}回</strong>
        <small>${formatNumber(result.hits[key] || 0)}ヒット</small>
      </div>
    `).join('');
    const hitEvents = (result.timeline || []).filter(event => event.type === 'hit');
    const fallbackHits = hitEvents.filter(event => event.timingQuality === 'fallbackEnd').length;
    const measuredHits = Math.max(0, hitEvents.length - fallbackHits);
    const generatedHits = hitEvents.filter(event => event.generatedObjectId).length;
    const selfDestructHits = hitEvents.filter(event => (
      event.generatedObjectId && /自爆/.test(String(event.generatedEventType || ''))
    )).length;
    const dotTicks = (result.timeline || []).filter(event => event.type === 'statusTick').length;
    const timingQualityNote = [
      fallbackHits ? `終了時補完${formatNumber(fallbackHits)}` : '',
      generatedHits ? `生成物${formatNumber(generatedHits)}` : '',
      selfDestructHits ? `自爆${formatNumber(selfDestructHits)}回` : '',
      dotTicks ? `DoT ${formatNumber(dotTicks)}回` : ''
    ].filter(Boolean).join(' / ') || '実測・指定発生F';
    el.summary.innerHTML = `
      <div class="fdc-dps-summary-card">
        <span>初動</span>
        <strong>${formatNumber(result.initialActionDelayFrames / 60)}秒</strong>
        <small>${formatNumber(result.initialActionDelayFrames)}F / SP周期は0F開始</small>
      </div>
      <div class="fdc-dps-summary-card is-interval">
        <span>普通攻撃間隔</span>
        <strong>${formatNumber(config.initialNormalAttackIntervalFrames || config.normalAttackIntervalFrames)}F</strong>
        <small>基礎${formatNumber(config.normalAttackIntervalFrames)}F${config.initialAttackSpeedP ? ` / 開始時 攻撃速度+${formatNumber(config.initialAttackSpeedP)}%` : ''}</small>
      </div>
      <div class="fdc-dps-summary-card">
        <span>発生精度</span>
        <strong>${formatNumber(measuredHits)} / ${formatNumber(hitEvents.length)}</strong>
        <small>${timingQualityNote}</small>
      </div>
      ${actionCards}
    `;

    scheduleDeferredSimulationDetails(snapshot, result, runtimeEffectsDisplay);
  }

  function scheduleDeferredSimulationDetails(snapshot, result, runtimeEffectsDisplay) {
    const detailKey = latestRun?.simulationKey || latestSimulationKey || '';
    if (detailKey && lastRenderedDetailKey === detailKey) return;
    const revision = ++deferredDetailRevision;
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (revision !== deferredDetailRevision) return;
        if (detailKey && detailKey !== (latestRun?.simulationKey || latestSimulationKey || '')) return;
        renderActionEffectAudit(
          snapshot.actionEffectAudit || {},
          snapshot.actionDamageProfiles || {},
          runtimeEffectsDisplay,
          result,
          snapshot.additionalDamageComponents || [],
          snapshot.externalEvents || []
        );
        renderSimulationTimeline(result);
        lastRenderedDetailKey = detailKey;
      }, 0);
    });
  }

  function renderSimulationTimeline(result) {
    if (latestTimelineResult !== result) {
      latestTimelineResult = result;
      timelineVisibleLimit = 160;
    }
    const timeline = getDpsTimelineForDisplay(result);
    const visible = timeline.slice(0, timelineVisibleLimit);
    el.timeline.innerHTML = visible.length
      ? visible.map(renderTimelineRow).join('')
      : '<p class="fdc-dps-empty">表示できるイベントがありません。</p>';
    const timelineStats = result.publicTimelineStats || result.timelineStats || {};
    const omittedCount = Math.max(0, Number(timelineStats.omitted) || 0);
    const remaining = Math.max(0, timeline.length - visible.length);
    if (remaining > 0) {
      el.timeline.insertAdjacentHTML('beforeend', `
        <div class="fdc-dps-timeline-more">
          <span>${formatNumber(visible.length)} / ${formatNumber(result.timeline.length)}件を表示</span>
          <button type="button" data-fdc-dps-timeline-more>続きを${formatNumber(Math.min(100, remaining))}件表示</button>
        </div>
      `);
    }
    if (omittedCount > 0) {
      const total = Number(timelineStats.total) || timeline.length + omittedCount;
      el.timeline.insertAdjacentHTML('beforeend', `<p class="fdc-dps-empty">記録上限により計${formatNumber(total)}件中、${formatNumber(omittedCount)}件を省略しています。計算・グラフには影響しません。</p>`);
    }
  }

  function handleTimelineControlClick(event) {
    const button = event.target.closest?.('[data-fdc-dps-timeline-more]');
    if (!button || !latestTimelineResult) return;
    timelineVisibleLimit += 100;
    renderSimulationTimeline(latestTimelineResult);
  }

  function drawDamageGraph(data) {
    const canvas = el.damageGraph;
    if (!canvas || !data?.result) return;
    const result = data.result;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(280, Math.floor(rect.width || canvas.parentElement?.clientWidth || 600));
    const height = 180;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const light = document.body.classList.contains('theme-light');
    const colors = light
      ? { text: '#526783', grid: 'rgba(74, 111, 157, .2)', cumulative: '#1768a8', fill: 'rgba(23, 104, 168, .12)', baseline: '#7b8797' }
      : { text: '#9db0ca', grid: 'rgba(142, 174, 218, .2)', cumulative: '#72b9ff', fill: 'rgba(114, 185, 255, .12)', baseline: '#aeb9c8' };
    ctx.clearRect(0, 0, width, height);
    const pad = { left: 82, right: 12, top: 10, bottom: 26 };
    const plotWidth = Math.max(1, width - pad.left - pad.right);
    const plotHeight = Math.max(1, height - pad.top - pad.bottom);
    const currentSeries = createDamageGraphSeries(result);
    const baselineSeries = data.baselineResult ? createDamageGraphSeries(data.baselineResult) : null;
    const durationFrames = Math.max(currentSeries.durationFrames, baselineSeries?.durationFrames || 0, 1);
    const yMax = Math.max(currentSeries.totalDamage, baselineSeries?.totalDamage || 0, 1) * 1.08;
    const y = value => pad.top + plotHeight - (value / yMax) * plotHeight;
    const x = frame => pad.left + (frame / durationFrames) * plotWidth;
    ctx.font = '9px sans-serif';
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.grid;
    ctx.fillStyle = colors.text;
    [0, .25, .5, .75, 1].forEach(step => {
      const yy = pad.top + plotHeight * (1 - step);
      ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(width - pad.right, yy); ctx.stroke();
      ctx.textAlign = 'right'; ctx.fillText(formatDamage(yMax * step), pad.left - 6, yy + 3);
    });
    [0, .5, 1].forEach(step => {
      const xx = pad.left + plotWidth * step;
      ctx.beginPath(); ctx.moveTo(xx, pad.top); ctx.lineTo(xx, pad.top + plotHeight); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillText(`${formatNumber(durationFrames * step / 60)}秒`, xx, height - 8);
    });
    const drawSeries = (series, strokeStyle, { fillStyle = '', dashed = false } = {}) => {
      if (!series?.points.length) return;
      const points = series.points.map(point => ({ x: x(point.frame), yValue: point.yValue }));
      if (fillStyle) {
        ctx.beginPath();
        points.forEach((point, index) => { const yy = y(point.yValue); if (!index) ctx.moveTo(point.x, yy); else ctx.lineTo(point.x, yy); });
        ctx.lineTo(points[points.length - 1].x, pad.top + plotHeight); ctx.lineTo(points[0].x, pad.top + plotHeight); ctx.closePath();
        ctx.fillStyle = fillStyle; ctx.fill();
      }
      ctx.beginPath();
      points.forEach((point, index) => { const yy = y(point.yValue); if (!index) ctx.moveTo(point.x, yy); else ctx.lineTo(point.x, yy); });
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = dashed ? 1.5 : 2;
      ctx.setLineDash(dashed ? [6, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    };
    drawSeries(currentSeries, colors.cumulative, { fillStyle: colors.fill });
    drawSeries(baselineSeries, colors.baseline, { dashed: true });
    drawSeries(currentSeries, colors.cumulative);
    if (el.damageGraphBaselineLegend) el.damageGraphBaselineLegend.hidden = !baselineSeries;
    if (el.damageGraphNote) {
      const baselineNote = baselineSeries ? ` / 基準 ${formatDamage(baselineSeries.totalDamage)}` : '';
      el.damageGraphNote.textContent = `${formatNumber(currentSeries.rawHitCount)}発生 / 最大${formatNumber(currentSeries.bucketCount)}点${baselineNote}`;
    }
  }

  function createDamageGraphSeries(result) {
    const durationFrames = Math.max(1, Number(result?.durationFrames) || Number(result?.durationSeconds || 1) * 60);
    const rawHits = (result?.damageSeries || (result?.timeline || []))
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

  function renderContribution(aggregate, pending = false) {
    if (!el.contribution) return;
    if (!aggregate || !(aggregate.totalExpectedDamage > 0)) {
      el.contribution.innerHTML = pending
        ? '<p class="fdc-dps-empty">複数seedを集計中です。単一seedのタイムラインは表示しています。</p>'
        : '<p class="fdc-dps-empty">行動ダメージを評価できませんでした。スキル倍率または発生タイミングを確認してください。</p>';
      if (el.trialNote) el.trialNote.textContent = aggregate ? `${formatNumber(aggregate.trials)} seed` : '';
      return;
    }
    if (el.trialNote) {
      const evaluatedTrials = Number(aggregate.evaluatedTrials) || aggregate.trials;
      const lastSeed = aggregate.baseSeed + evaluatedTrials - 1;
      const averageSimulationMs = Number(aggregate.performance?.averageSimulationMs);
      const performanceNote = Number.isFinite(averageSimulationMs)
        ? ` / 平均${formatNumber(averageSimulationMs)}ms`
        : '';
      const adaptiveNote = aggregate.adaptiveStopped ? '（収束により短縮）' : '';
      el.trialNote.textContent = `${formatNumber(evaluatedTrials)} seed / ${formatNumber(aggregate.baseSeed)}～${formatNumber(lastSeed)}${aggregate.deterministic ? '（決定的条件のため短縮）' : ''}${adaptiveNote}${performanceNote}`;
    }
    const rows = ACTION_ORDER.map(key => {
      const item = aggregate.byAction?.[key] || {};
      return `
        <div class="fdc-dps-contribution-row">
          <strong>${escapeHtml(ACTION_LABELS[key])}</strong>
          <span><b>${formatDamage(item.contributionDps)}</b><small>DPS</small></span>
          <span><b>${formatPercent(item.damageShareP)}</b><small>構成比</small></span>
          <span><b>${formatNumber(item.averageStarts || 0)}回</b><small>平均発動</small></span>
          <span><b>${formatDamage(item.averageDamagePerDamagingAction || 0)}</b><small>1回平均</small></span>
        </div>
      `;
    }).join('');
    const statusRows = Object.entries(aggregate.byStatus || {})
      .filter(([, item]) => Number(item?.expectedDamage) > 0)
      .map(([status, item]) => {
        const sourceSummary = (item.sources || [])
          .map(source => `${source.label || source.sourceId} ${formatDamage(source.contributionDps)} DPS`)
          .join(' / ');
        return `
        <div class="fdc-dps-contribution-row">
          <strong><span>${escapeHtml(status)}（DoT合計）</span>${sourceSummary ? `<small title="${escapeAttr(sourceSummary)}">付与元: ${escapeHtml(sourceSummary)}</small>` : ''}</strong>
          <span><b>${formatDamage(item.contributionDps)}</b><small>DPS</small></span>
          <span><b>${formatPercent(item.damageShareP)}</b><small>構成比</small></span>
          <span><b>1秒毎</b><small>周期</small></span>
          <span><b>${formatDamage(item.expectedDamage)}</b><small>総DoT</small></span>
        </div>
      `;
      }).join('');
    const runtimeRows = Object.values(aggregate.byRuntimeEffect || {})
      .filter(item => Number(item?.expectedDamage) > 0)
      .map(item => `
        <div class="fdc-dps-contribution-row">
          <strong>${escapeHtml(item.label || item.id)}</strong>
          <span><b>${formatDamage(item.contributionDps)}</b><small>DPS</small></span>
          <span><b>${formatPercent(item.damageShareP)}</b><small>構成比</small></span>
          <span><b>${formatNumber(item.averageTriggers || 0)}回</b><small>平均発動</small></span>
          <span><b>${formatDamage(item.averageDamagePerTrigger || 0)}</b><small>1回平均</small></span>
        </div>
      `).join('');
    el.contribution.innerHTML = `
      <div class="fdc-dps-total-summary">
        <div><span>期待DPS</span><strong>${formatDamage(aggregate.meanDps)}</strong></div>
        <div><span>平均総ダメージ</span><strong>${formatDamage(aggregate.totalExpectedDamage)}</strong></div>
        <div><span>P10～P90</span><strong>${formatDamage(aggregate.range?.p10)}～${formatDamage(aggregate.range?.p90)}</strong></div>
      </div>
      <div class="fdc-dps-contribution-table">
        <div class="fdc-dps-contribution-header"><span>行動</span><span>DPS</span><span>構成比</span><span>発動</span><span>1回平均</span></div>
        ${rows}
        ${runtimeRows ? '<div class="fdc-dps-contribution-header"><span>時系列効果</span><span>DPS</span><span>構成比</span><span>発動</span><span>1回平均</span></div>' : ''}
        ${runtimeRows}
        ${statusRows ? '<div class="fdc-dps-contribution-header"><span>DoT内訳（総DPSに含む）</span><span>DPS</span><span>構成比</span><span>周期</span><span>総DoT</span></div>' : ''}
        ${statusRows}
      </div>
    `;
  }

  function loadRuntimeEffectOverrides() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DPS_RUNTIME_OVERRIDE_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveRuntimeEffectOverrides() {
    try {
      localStorage.setItem(DPS_RUNTIME_OVERRIDE_STORAGE_KEY, JSON.stringify(runtimeEffectOverrides));
    } catch (_) {
      // 保存できない環境でも、このタブ内では設定を維持する。
    }
  }

  function getRuntimeEffectOverride(targetId, effectId) {
    return runtimeEffectOverrides?.[String(targetId || '')]?.[String(effectId || '')] || null;
  }
  function getRuntimeEffectOverrideForEffect(targetId, effect = {}) {
    const effectId = String(effect?.id || effect?.effectId || '').trim();
    const direct = getRuntimeEffectOverride(targetId, effectId);
    if (direct) return direct;
    const legacyEffectId = String(effect?.runtimeBaseEffectId || '').trim();
    return legacyEffectId && legacyEffectId !== effectId
      ? getRuntimeEffectOverride(targetId, legacyEffectId)
      : null;
  }

  function getDpsRuntimeEffectPolicy(effect = {}, options = {}) {
    const policy = typeof window !== 'undefined' ? window.TRICKCAL_DPS_TRIGGER_POLICY : null;
    if (typeof policy?.getRuntimeEffectPolicy === 'function') {
      return policy.getRuntimeEffectPolicy(effect, options);
    }
    return {
      capability: 'unsupported',
      defaultMode: 'off',
      supportsFixed: !!options.supportsFixed,
      triggerDomain: 'unknown',
      reasonCode: 'policyUnavailable',
      quality: 'unknown',
      highSkill: false,
      highSkillOnly: false,
      mixedSkill: false,
      status: 'unsupported'
    };
  }
  function isDpsHighSkillRuntimeEffect(effect = {}) {
    return !!getDpsRuntimeEffectPolicy(effect).highSkill;
  }

  function getDpsRuntimeEffectDefaultMode(effect = {}) {
    return getDpsRuntimeEffectPolicy(effect).defaultMode;
  }

  function getDpsRuntimeEffectPolicyPresentation(policy = {}, options = {}) {
    const policyApi = typeof window !== 'undefined' ? window.TRICKCAL_DPS_TRIGGER_POLICY : null;
    if (typeof policyApi?.getRuntimeEffectPolicyPresentation === 'function') {
      return policyApi.getRuntimeEffectPolicyPresentation(policy, options);
    }
    const mode = ['auto', 'fixed', 'off'].includes(options.mode) ? options.mode : (policy.defaultMode || 'auto');
    const readOnly = options.readOnly === true;
    const label = readOnly ? '監査のみ' : mode === 'fixed' ? '固定' : mode === 'off' ? 'OFF' : policy.capability === 'estimated' ? '自動（推定）' : '自動';
    const statusCode = readOnly ? 'readonly' : policy.capability === 'estimated' && mode === 'auto' ? 'estimated' : mode;
    const className = readOnly ? 'is-readonly' : policy.capability === 'estimated' && mode === 'auto' ? 'is-estimated' : `is-${mode}`;
    return { mode, label, statusCode, className, reasonLabel: '発動条件要確認', qualityLabel: '未確認', detailLabel: '発動条件要確認 / 未確認' };
  }
  function getDpsRuntimeExternalEventMatchState(effect = {}, events = []) {
    const policyApi = typeof window !== 'undefined' ? window.TRICKCAL_DPS_TRIGGER_POLICY : null;
    if (typeof policyApi?.getRuntimeExternalEventMatchState === 'function') {
      return policyApi.getRuntimeExternalEventMatchState(effect, events);
    }
    return { required: effect?.externalActionRequired === true, matched: false, count: 0, expectedType: '', expectedLabel: 'イベント種別未設定' };
  }
  function getDpsRuntimeEffectSchedulePolicy(effect = {}, options = {}) {
    const policyApi = typeof window !== 'undefined' ? window.TRICKCAL_DPS_TRIGGER_POLICY : null;
    if (typeof policyApi?.getRuntimeEffectSchedulePolicy === 'function') {
      return policyApi.getRuntimeEffectSchedulePolicy(effect, options);
    }
    const external = effect?.externalActionRequired === true;
    return {
      bindingKey: String(effect?.id || effect?.effectId || 'effect:unbound'),
      triggerType: String(effect?.triggerType || ''),
      triggerLabel: String(effect?.triggerType || '発動条件未設定').replace(/時$/, ''),
      actionKeys: [], actionLinked: false, externalOccurrenceOnly: false,
      externalCondition: external, scheduleDomain: external ? 'externalCondition' : 'unknown',
      supportsAutomatic: !external, supportsEstimated: false, supportsPeriodic: false,
      supportsOccurrences: external, supportsExternalInput: external,
      capabilityLabels: [external ? '外部入力対応' : '未対応'],
      capabilityLabel: external ? '外部入力対応' : '未対応',
      reasonCode: 'policyUnavailable', quality: 'unknown', defaultMode: 'off', highSkill: false
    };
  }
  function getDpsFormationCandidateSchedulePolicy(candidate = {}) {
    const policyApi = typeof window !== 'undefined' ? window.TRICKCAL_DPS_TRIGGER_POLICY : null;
    if (typeof policyApi?.getDpsFormationCandidateSchedulePolicy === 'function') {
      return policyApi.getDpsFormationCandidateSchedulePolicy(candidate);
    }
    const periodic = String(candidate?.timingMode || '').toLowerCase() === 'periodic';
    return {
      mode: periodic ? 'periodic' : 'external',
      actionLinked: periodic,
      capability: periodic ? 'periodic' : 'external',
      capabilityLabel: periodic ? '周期指定対応' : '外部入力対応',
      inputLabel: periodic ? '時系列効果・発動タイミング' : '外部条件イベント',
      eventClass: String(candidate?.eventClass || ''),
      reason: periodic ? '編成行動に連動する効果。初期値は行動間隔・SP・CTからの推定値。' : '敵状態や戦闘結果など、時刻を自動確定しない条件。'
    };
  }
  function isDpsPeriodicFormationEvent(value = {}) {
    return !!(String(value?.candidateId || '').trim() || String(value?.bindingKey || '').trim())
      && getDpsFormationCandidateSchedulePolicy(value).mode === 'periodic';
  }

  function isDpsHighSkillFormationCandidate(candidate = {}) {
    const policyApi = typeof window !== 'undefined' ? window.TRICKCAL_DPS_TRIGGER_POLICY : null;
    if (typeof policyApi?.isHighSkillFormationCandidate === 'function') {
      return policyApi.isHighSkillFormationCandidate(candidate);
    }
    const periodicActionLabel = String(candidate?.periodicActionLabel || '').trim();
    if (periodicActionLabel === '高学年') return true;
    return /高学年/.test([
      candidate?.eventLabel,
      candidate?.type,
      candidate?.label
    ].filter(Boolean).join(' '));
  }

  function isDpsFormationCandidateManuallyScheduled(candidate = {}, events = []) {
    const policyApi = typeof window !== 'undefined' ? window.TRICKCAL_DPS_TRIGGER_POLICY : null;
    if (typeof policyApi?.isFormationCandidateManuallyScheduled === 'function') {
      return policyApi.isFormationCandidateManuallyScheduled(candidate, events);
    }
    const candidateId = String(candidate?.id || '').trim();
    const bindingKey = String(candidate?.bindingKey || '').trim();
    return (Array.isArray(events) ? events : []).some(event => {
      const eventCandidateId = String(event?.candidateId || event?.formationCandidateId || '').trim();
      const eventBindingKey = String(event?.bindingKey || event?.candidateBindingKey || '').trim();
      return (candidateId && eventCandidateId === candidateId)
        || (bindingKey && eventBindingKey === bindingKey);
    });
  }

  function isDpsFormationCandidateAutoEnabled(candidate = {}, options = {}, events = []) {
    const policyApi = typeof window !== 'undefined' ? window.TRICKCAL_DPS_TRIGGER_POLICY : null;
    if (typeof policyApi?.isDpsFormationCandidateAutoEnabled === 'function') {
      return policyApi.isDpsFormationCandidateAutoEnabled(candidate, options, events);
    }
    const schedulePolicy = getDpsFormationCandidateSchedulePolicy(candidate);
    if (schedulePolicy.mode !== 'periodic') return false;
    if (String(options?.formationTimelineMode || 'off') !== 'supportEstimate') return false;
    if (!(Number(candidate?.intervalSeconds) > 0)) return false;
    if (isDpsHighSkillFormationCandidate(candidate)
      && String(options?.formationHighSkillMode || 'disabled') !== 'auto') return false;
    return !isDpsFormationCandidateManuallyScheduled(candidate, events);
  }

  function getDpsFormationCandidateScheduleState(candidate = {}, options = {}, events = []) {
    const schedulePolicy = getDpsFormationCandidateSchedulePolicy(candidate);
    if (schedulePolicy.mode !== 'periodic') return { code: 'external', label: '外部入力待ち' };
    if (isDpsFormationCandidateManuallyScheduled(candidate, events)) {
      return { code: 'manual', label: '周期設定済み' };
    }
    if (isDpsFormationCandidateAutoEnabled(candidate, options, events)) {
      return { code: 'estimated', label: '自動（推定）' };
    }
    if (isDpsHighSkillFormationCandidate(candidate)) return { code: 'high-off', label: '初期OFF' };
    if (!(Number(candidate?.intervalSeconds) > 0)) return { code: 'missing', label: '時刻入力待ち' };
    return { code: 'manual', label: '手動設定' };
  }

  function createDpsFormationEstimatedEvents(candidates = [], options = {}, manualEvents = []) {
    const policyApi = typeof window !== 'undefined' ? window.TRICKCAL_DPS_TRIGGER_POLICY : null;
    if (typeof policyApi?.createDpsFormationEstimatedEvents === 'function') {
      return policyApi.createDpsFormationEstimatedEvents(candidates, options, manualEvents);
    }
    const sourceCandidates = Array.isArray(candidates) ? candidates : [];
    const sourceEvents = Array.isArray(manualEvents) ? manualEvents : [];
    return sourceCandidates
      .filter(candidate => isDpsFormationCandidateAutoEnabled(candidate, options, sourceEvents))
      .map(candidate => {
        const startSeconds = Math.max(0, Number(candidate?.startSeconds) || 0);
        const intervalSeconds = Math.max(0, Number(candidate?.intervalSeconds) || 0);
        const repeatCount = Math.max(0, Math.floor(Number(candidate?.repeatCount) || 0));
        return {
          id: `auto:${String(candidate?.id || 'formation')}`,
          type: String(candidate?.type || '').trim(),
          frame: startSeconds * 60,
          intervalFrames: intervalSeconds * 60,
          repeatCount,
          sourceId: String(candidate?.sourceId || candidate?.ownerId || '').trim(),
          value: candidate?.value ?? candidate?.conditionValue ?? candidate?.triggerValue ?? '',
          status: candidate?.status || '',
          statusDurationFrames: Math.max(0, Number(candidate?.statusDurationFrames) || 0),
          statusStackable: candidate?.statusStackable === true,
          statusMaxStacks: Math.max(1, Math.floor(Number(candidate?.statusMaxStacks) || 1)),
          statusStackGroupId: String(candidate?.statusStackGroupId || '').trim(),
          statusStackCount: Math.max(1, Math.min(9, Math.floor(Number(candidate?.statusStackCount) || 1))),
          statusApplicationEffectId: String(candidate?.statusApplicationEffectId || '').trim(),
          statusSourceId: String(candidate?.statusSourceId || candidate?.sourceId || '').trim(),
          statusSourceSelf: candidate?.statusSourceSelf === true,
          statusDealsPeriodicDamage: candidate?.statusDealsPeriodicDamage == null
            ? null
            : candidate.statusDealsPeriodicDamage === true,
          statusReactionOnly: candidate?.statusReactionOnly === true,
          reason: `${String(candidate?.label || candidate?.type || '編成行動')}（自動推定）`,
          candidateId: String(candidate?.id || '').trim(),
          candidateLabel: String(candidate?.label || '').trim(),
          candidateBasis: String(candidate?.basis || '').trim(),
          candidateEffectLabels: Array.isArray(candidate?.effectLabels) ? candidate.effectLabels : [],
          bindingKey: String(candidate?.bindingKey || '').trim(),
          timingMode: 'periodic',
          eventClass: String(candidate?.eventClass || '').trim(),
          eventLabel: String(candidate?.eventLabel || '').trim(),
          repeatability: String(candidate?.repeatability || '').trim(),
          inputMode: 'periodic',
          triggerSourceId: String(candidate?.triggerSourceId || '').trim(),
          conditionType: String(candidate?.conditionType || '').trim(),
          conditionValue: String(candidate?.conditionValue ?? '').trim(),
          provider: 'estimated'
        };
      })
      .filter(event => event.type && event.candidateId && event.intervalFrames > 0);
  }

  function handleRuntimeEffectSettingChange(event) {
    const modeSelect = event.target.closest?.('[data-fdc-dps-runtime-mode]');
    const stackInput = event.target.closest?.('[data-fdc-dps-runtime-stacks]');
    const control = modeSelect || stackInput;
    if (!control || !activeTargetId) return;
    const effectId = String(control.dataset.fdcDpsRuntimeMode || control.dataset.fdcDpsRuntimeStacks || '');
    if (!effectId) return;
    const targetOverrides = runtimeEffectOverrides[activeTargetId] || {};
    const current = targetOverrides[effectId] || { mode: 'auto', fixedStacks: 1 };
    const next = {
      mode: modeSelect ? modeSelect.value : current.mode,
      fixedStacks: stackInput
        ? Math.max(1, Math.floor(Number(stackInput.value) || 1))
        : Math.max(1, Math.floor(Number(current.fixedStacks) || 1))
    };
    // 高学年関連の未保存状態は初期OFFなので、ユーザーがAUTOを
    // 選んだ事実も保存して次回描画・再計算へ引き継ぐ。
    targetOverrides[effectId] = next;
    if (Object.keys(targetOverrides).length) runtimeEffectOverrides[activeTargetId] = targetOverrides;
    else delete runtimeEffectOverrides[activeTargetId];
    saveRuntimeEffectOverrides();
    scheduleReusableRun();
  }

  function applyRuntimeEffectOverrides(runtimeEffects = {}, targetId = '') {
    const source = runtimeEffects || {};
    const display = { ...source };
    const simulation = { ...source };
    const collections = [
      ['attackSpeedEffects', true],
      ['damageBuffEffects', true],
      ['spRecoveryEffects', false],
      ['cooldownEffects', false],
      ['eventEffects', false]
    ];
    collections.forEach(([collectionKey, supportsFixed]) => {
      const sourceRows = Array.isArray(display[collectionKey]) ? display[collectionKey] : [];
      display[collectionKey] = sourceRows.map(effect => {
        const effectId = String(effect?.id || effect?.effectId || '');
        const override = getRuntimeEffectOverrideForEffect(targetId, effect);
        const runtimePolicy = getDpsRuntimeEffectPolicy(effect, { supportsFixed });
        const defaultMode = runtimePolicy.defaultMode;
        return {
          ...effect,
          runtimePolicy,
          runtimeDefaultMode: defaultMode,
          runtimeHasExplicitOverride: !!override,
          runtimeOverrideMode: override?.mode || defaultMode,
          runtimeFixedStacks: Math.max(1, Math.floor(Number(override?.fixedStacks) || 1)),
          runtimeSupportsFixed: supportsFixed
        };
      });
      const simulationRows = Array.isArray(simulation[collectionKey]) ? simulation[collectionKey] : [];
      simulation[collectionKey] = simulationRows.flatMap(effect => {
        const effectId = String(effect?.id || effect?.effectId || '');
        const override = getRuntimeEffectOverrideForEffect(targetId, effect);
        const mode = override?.mode || getDpsRuntimeEffectDefaultMode(effect);
        if (mode === 'off') {
          // ダメージ補正は単発プロファイルに含まれた動的効果を差し引くため、
          // 定義だけ残して発動不能にする。削除すると単発側の仮定値がDPSへ残る。
          if (collectionKey === 'damageBuffEffects') {
            return [{ ...effect, mode: 'off', triggerActionKeys: [], intervalFrames: 0 }];
          }
          return [];
        }
        if (mode !== 'fixed' || !supportsFixed) return [effect];
        const maxStacks = Math.max(1, Math.floor(Number(effect.maxStacks) || 1));
        const fixedStacks = Math.min(maxStacks, Math.max(1, Math.floor(Number(override.fixedStacks) || 1)));
        return [{
          ...effect,
          mode: 'fixed',
          fixedStacks,
          durationFrames: 0,
          intervalFrames: 0,
          triggerEveryCount: 0,
          triggerActionKeys: []
        }];
      });
    });
    return { display, simulation };
  }

  function renderDpsRuntimeAuxiliaryAudit(runtimeEffects = {}) {
    const statuses = Array.isArray(runtimeEffects.initialTargetStatuses)
      ? runtimeEffects.initialTargetStatuses.map(item => String(item?.status || '').trim()).filter(Boolean)
      : [];
    const reactions = Array.isArray(runtimeEffects.statusReactions)
      ? runtimeEffects.statusReactions.map(item => {
        const label = String(item?.label || item?.status || '').trim();
        const value = Number(item?.takenDmgP) || 0;
        return label ? `${label}${value ? ` +${formatNumber(value)}%` : ''}` : '';
      }).filter(Boolean)
      : [];
    const weakness = Number(runtimeEffects.statusDamageWeaknessP) || 0;
    const resources = Array.isArray(runtimeEffects.resources)
      ? runtimeEffects.resources.map(item => {
        const name = String(item?.name || '').trim();
        if (!name) return '';
        const initial = Math.max(0, Math.floor(Number(item?.initialStacks) || 0));
        const max = Math.max(1, Math.floor(Number(item?.maxStacks) || 1));
        return `${name} ${initial}/${max}`;
      }).filter(Boolean)
      : [];
    const rows = [
      ['初期対象状態', statuses.join('・') || 'なし'],
      ['状態反応', reactions.join('・') || 'なし'],
      ['状態異常弱点', weakness ? `その他倍率 +${formatNumber(weakness)}%` : 'なし'],
      ['固有リソース', resources.join('・') || 'なし']
    ];
    return `<div class="fdc-dps-runtime-auxiliary" data-fdc-dps-runtime-readonly="auxiliary"><strong>補助ランタイム（監査のみ）</strong><small>現在のDPSへ渡る初期状態・状態反応・リソース。個別発動モードは設定しません。</small><div class="fdc-dps-runtime-auxiliary-list">${rows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join('')}</div></div>`;
  }

  function renderRuntimeEffectControls(runtimeEffects = {}, externalEvents = []) {
    const definitions = new Map();
    const register = (collectionKey, supportsFixed, kindLabel, readOnly = false) => (runtimeEffects[collectionKey] || []).forEach(effect => {
      const id = String(effect?.id || effect?.effectId || '');
      if (!id) return;
      const current = definitions.get(id);
      const maxStacks = Math.max(1, Math.floor(Number(effect.maxStacks) || 1));
      const runtimePolicy = effect.runtimePolicy || getDpsRuntimeEffectPolicy(effect, { supportsFixed });
      definitions.set(id, {
        id,
        label: effect.label || current?.label || id,
        kinds: unique([...(current?.kinds || []), kindLabel]),
        supportsFixed: !!(current?.supportsFixed || supportsFixed),
        readOnly: current ? !!(current.readOnly && readOnly) : readOnly,
        maxStacks: Math.max(current?.maxStacks || 1, maxStacks),
        mode: effect.runtimeOverrideMode || current?.mode || runtimePolicy.defaultMode,
        fixedStacks: effect.runtimeFixedStacks || current?.fixedStacks || 1,
        runtimePolicy: current?.runtimePolicy || runtimePolicy,
        explicit: !!(current?.explicit || effect.runtimeHasExplicitOverride),
        runtimeEffect: current?.runtimeEffect || effect
      });
    });
    register('attackSpeedEffects', true, '攻撃速度');
    register('damageBuffEffects', true, 'ダメージ補正');
    register('spRecoveryEffects', false, 'SP回復');
    register('cooldownEffects', false, 'クールタイム');
    register('eventEffects', false, 'イベント');
    // 毎秒SPはシミュレーターへ渡るが、現在の設定保存形式では個別の
    // 発動モードを持たない。存在を隠さず、監査のみとして表示する。
    register('spRegenEffects', false, '毎秒SP', true);
    const auxiliaryAudit = renderDpsRuntimeAuxiliaryAudit(runtimeEffects);
    if (!definitions.size && !auxiliaryAudit) return '';
    const rows = Array.from(definitions.values()).map(item => {
      const unsupported = item.runtimePolicy.capability === 'unsupported';
      const fixed = item.mode === 'fixed' && item.supportsFixed && !item.readOnly && !unsupported;
      const externalMatch = getDpsRuntimeExternalEventMatchState(item.runtimeEffect, externalEvents);
      const presentation = getDpsRuntimeEffectPolicyPresentation(item.runtimePolicy, {
        mode: item.mode,
        explicit: item.explicit,
        readOnly: item.readOnly,
        externalMatched: externalMatch.matched
      });
      const schedulePolicy = getDpsRuntimeEffectSchedulePolicy(item.runtimeEffect, { policy: item.runtimePolicy, supportsFixed: item.supportsFixed });
      const policyClass = `is-policy-${presentation.className.replace(/^is-/, '')}`;
      const externalDetail = externalMatch.required
        ? ` / ${externalMatch.matched ? `対応${externalMatch.count}件` : `対応イベントなし（${externalMatch.expectedLabel}）`}`
        : '';
      const detailLabel = `${presentation.detailLabel} / ${schedulePolicy.capabilityLabel}${externalDetail}`;
      const title = `${item.label} / ${presentation.label} / ${detailLabel}`;
      const readOnlyControl = item.readOnly || unsupported;
      const control = readOnlyControl
        ? `<span class="fdc-dps-runtime-readonly" title="${escapeAttr(title)}">${unsupported ? '未対応' : '監査'}</span>`
        : `<select data-fdc-dps-runtime-mode="${escapeAttr(item.id)}" aria-label="${escapeAttr(item.label)}のDPS動作"><option value="auto"${item.mode === 'auto' ? ' selected' : ''}>自動</option>${item.supportsFixed ? `<option value="fixed"${fixed ? ' selected' : ''}>固定</option>` : ''}<option value="off"${item.mode === 'off' ? ' selected' : ''}>OFF</option></select>`;
      const stack = item.supportsFixed && !readOnlyControl
        ? `<span class="fdc-dps-runtime-stack${fixed ? '' : ' is-disabled'}"><input type="number" min="1" max="${item.maxStacks}" step="1" value="${Math.min(item.maxStacks, item.fixedStacks)}" data-fdc-dps-runtime-stacks="${escapeAttr(item.id)}"${fixed ? '' : ' disabled'}><small>/${item.maxStacks}</small></span>`
        : '';
      return `<label class="fdc-dps-runtime-setting${item.mode === 'off' ? ' is-off' : fixed ? ' is-fixed' : ''}${readOnlyControl ? ' is-readonly' : ''}" data-runtime-policy-status="${escapeAttr(presentation.statusCode)}" title="${escapeAttr(title)}"><span><strong>${escapeHtml(item.label)} <b class="fdc-dps-runtime-policy ${policyClass}">${escapeHtml(presentation.label)}</b></strong><small>${escapeHtml(item.kinds.join('・'))} / ${escapeHtml(detailLabel)}</small></span>${control}${stack}</label>`;
    }).join('');
    return `
      <div class="fdc-dps-runtime-settings">
        <div class="fdc-dps-runtime-settings-head"><strong>時系列効果設定</strong><small>自動・外部入力待ち・初期OFF・未対応を区別 / 固定は指定スタックを常時適用 / OFFはDPSから除外</small></div>
        <div class="fdc-dps-runtime-settings-list">${rows}</div>${auxiliaryAudit}
      </div>
    `;
  }

  function renderActionEffectAudit(audit, profiles, runtimeEffects = {}, result = null, additionalDamageComponents = [], externalEvents = []) {
    if (!el.effectAudit) return;
    const runtimeControls = renderRuntimeEffectControls(runtimeEffects, externalEvents);
    const runtimeDescriptors = buildRuntimeEffectDescriptors(runtimeEffects, result);
    const actionMaps = Object.fromEntries(ACTION_ORDER.map(key => [
      key,
      new Map((audit?.[key]?.rows || []).map(row => [row.key, row]))
    ]));
    const baseColumns = ACTION_ORDER.map(key => ({
      key,
      label: ACTION_LABELS[key],
      actionKey: key,
      rows: actionMaps[key],
      component: null
    }));
    const seenComponents = new Set();
    const supplementalColumns = (Array.isArray(additionalDamageComponents) ? additionalDamageComponents : [])
      .filter(component => {
        const id = String(component?.effectId || component?.optionKey || component?.label || '');
        if (!id || seenComponents.has(id)) return false;
        seenComponents.add(id);
        return true;
      })
      .map((component, index) => {
        const componentActionKeys = getAdditionalDamageClassificationActionKeys(component.attackCategory || component.sourceCategory || '');
        const ownerActionKeys = Array.isArray(component.ownerActionKeys) ? component.ownerActionKeys : [];
        const rows = (component.actionEffectAudit?.rows || []).filter(row => row.auditKind == null);
        return {
          key: `supplemental:${component.effectId || component.optionKey || index}`,
          label: component.valueKind || component.label || '追加ダメージ',
          actionKey: componentActionKeys[0] || ownerActionKeys[0] || '',
          classificationActionKeys: componentActionKeys,
          ownerActionKeys,
          rows: new Map(rows.map(row => [row.key, row])),
          component
        };
      });
    const columns = [...baseColumns, ...supplementalColumns];
    const effectKeys = unique(columns.flatMap(column => Array.from(column.rows.keys())));
    if (el.effectAuditNote) {
      const extraText = supplementalColumns.length ? ` / 追加ダメージ${formatNumber(supplementalColumns.length)}列` : '';
      el.effectAuditNote.textContent = `${formatNumber(effectKeys.length)}効果${extraText}`;
    }
    if (!effectKeys.length) {
      el.effectAudit.innerHTML = `${runtimeControls}<p class="fdc-dps-empty">表示できる行動別効果がありません。</p>`;
      return;
    }
    const matrixRows = effectKeys.map(effectKey => {
      const representative = columns.map(column => column.rows.get(effectKey)).find(Boolean) || {};
      const descriptor = getRuntimeEffectDescriptor(representative, runtimeDescriptors);
      const states = columns.map(column => {
        const appliesToEveryBaseAction = descriptor
          && ACTION_ORDER.every(actionKey => descriptor.targetActionKeys.includes(actionKey));
        const row = column.rows.get(effectKey)
          || (column.component && appliesToEveryBaseAction ? representative : null);
        if (!row) return '<span class="fdc-dps-effect-state is-none" title="この行動では評価対象外">—</span>';
        const runtimeActionKey = column.actionKey || (appliesToEveryBaseAction ? ACTION_ORDER[0] : '');
        const runtimeState = getRuntimeAuditState(row, runtimeActionKey, descriptor, !!result);
        if (runtimeState) {
          return `<span class="fdc-dps-effect-state ${runtimeState.className}" title="${escapeAttr(runtimeState.title)}">${escapeHtml(runtimeState.label)}</span>`;
        }
        const state = row.enabled ? 'is-on' : 'is-off';
        return `<span class="fdc-dps-effect-state ${state}" title="${escapeAttr(row.reason || (row.enabled ? '適用' : '除外'))}">${row.enabled ? 'ON' : 'OFF'}</span>`;
      }).join('');
      const runtimeMeta = descriptor
        ? (descriptor.overrideMode === 'off'
          ? 'DPS OFF'
          : descriptor.overrideMode === 'fixed'
            ? `DPS固定×${descriptor.fixedStacks}`
            : `DPS自動${descriptor.activityCount > 0 ? `・発動${formatNumber(descriptor.activityCount)}回` : ''}`)
        : (representative.runtimeManaged ? 'DPS自動' : '');
      return `
        <div class="fdc-dps-effect-matrix-row${descriptor || representative.runtimeManaged ? ' is-runtime-managed' : ''}">
          <span class="fdc-dps-effect-name"><strong>${escapeHtml(representative.label || '効果')}</strong><small>${escapeHtml([representative.source, representative.value, runtimeMeta].filter(Boolean).join(' / '))}</small></span>
          ${states}
        </div>
      `;
    }).join('');
    const actionDetails = ACTION_ORDER.map(key => {
      const rows = Array.from(actionMaps[key].values());
      const staticRows = rows.filter(row => !getRuntimeEffectDescriptor(row, runtimeDescriptors) && !row.runtimeManaged);
      const runtimeRows = rows.filter(row => getRuntimeEffectDescriptor(row, runtimeDescriptors) || row.runtimeManaged);
      const enabledCount = staticRows.filter(row => row.enabled).length;
      const damageText = formatActionProfileDamage(profiles?.[key]);
      return `
        <details class="fdc-dps-effect-action-detail">
          <summary><strong>${escapeHtml(ACTION_LABELS[key])}</strong><span>1回期待 ${escapeHtml(damageText)} / 固定ON ${formatNumber(enabledCount)}・動的 ${formatNumber(runtimeRows.length)}</span></summary>
          <div class="fdc-dps-effect-action-list">
            ${rows.length ? rows.map(row => {
              const descriptor = getRuntimeEffectDescriptor(row, runtimeDescriptors);
              const runtimeState = getRuntimeAuditState(row, key, descriptor, !!result);
              const enabled = runtimeState ? runtimeState.className === 'is-runtime-active' : row.enabled;
              const stateLabel = runtimeState?.label || (row.enabled ? 'ON' : 'OFF');
              const reason = runtimeState?.title || row.reason;
              return `
              <div class="${runtimeState ? 'is-runtime-managed' : (enabled ? 'is-on' : 'is-off')}">
                <span>${escapeHtml(stateLabel)}</span>
                <strong>${escapeHtml(row.label)}</strong>
                <small>${escapeHtml([row.value, reason].filter(Boolean).join(' / '))}</small>
              </div>
            `;
            }).join('') : '<p class="fdc-dps-empty">評価対象の効果なし</p>'}
          </div>
        </details>
      `;
    }).join('');
    const matrixWidth = 220 + (columns.length * 88);
    const columnHeaders = columns.map(column => {
      if (!column.component) return `<span>${escapeHtml(column.label)}</span>`;
      const component = column.component;
      const source = component.sourceLabel || '追加効果';
      const multiplier = formatNumber(component.baseMultiplier || component.multiplier || 0);
      const repeat = component.repeatCount > 1 ? `×${formatNumber(component.repeatCount)}` : '';
      const classificationActions = column.classificationActionKeys.map(key => ACTION_LABELS[key]).filter(Boolean).join('・');
      const ownerActions = column.ownerActionKeys.map(key => ACTION_LABELS[key]).filter(Boolean).join('・');
      const title = [
        source,
        component.valueKind || component.label,
        ownerActions && `発動:${ownerActions}`,
        classificationActions && `分類:${classificationActions}`
      ].filter(Boolean).join(' / ');
      return `<span class="is-additional" title="${escapeAttr(title)}"><b>${escapeHtml(source)}</b><small>${escapeHtml(component.valueKind || '追加ダメージ')} ${escapeHtml(multiplier)}%${escapeHtml(repeat)}</small></span>`;
    }).join('');
    el.effectAudit.innerHTML = `
      ${runtimeControls}
      <div class="fdc-dps-effect-matrix-wrap">
        <div class="fdc-dps-effect-matrix" style="--fdc-effect-column-count:${columns.length};min-width:${matrixWidth}px">
          <div class="fdc-dps-effect-matrix-head"><span>効果</span>${columnHeaders}</div>
          ${matrixRows}
        </div>
      </div>
      <div class="fdc-dps-effect-action-details">${actionDetails}</div>
    `;
  }

  function getAdditionalDamageClassificationActionKeys(category = '') {
    const text = String(category || '').replace(/[\s　・_]/g, '');
    const keys = [];
    if (/普通攻撃|通常攻撃/.test(text)) keys.push('basicAttack', 'enhancedAttack');
    if (/基本攻撃/.test(text)) keys.push('basicAttack');
    if (/強化攻撃/.test(text)) keys.push('enhancedAttack');
    if (/低学年/.test(text)) keys.push('lowSkill');
    if (/高学年/.test(text)) keys.push('highSkill');
    if (text === 'スキル') keys.push('lowSkill', 'highSkill');
    return unique(keys);
  }

  function buildRuntimeEffectDescriptors(runtimeEffects = {}, result = null) {
    const descriptors = new Map();
    const activityCounts = new Map();
    const addActivity = id => {
      const key = String(id || '');
      if (key) activityCounts.set(key, (activityCounts.get(key) || 0) + 1);
    };
    (result?.timeline || []).forEach(event => {
      if (['attackSpeedApplied', 'runtimeBuffApplied', 'runtimeEffectHit', 'spRecoveryEvent', 'cooldownChanged', 'statusApplied', 'effectStateChanged'].includes(event.type)) {
        addActivity(event.runtimeEffectId || event.effectId || event.applicationEffectId);
      }
    });
    const register = (effect, kind, targetActionKeys = [], triggerActionKeys = []) => {
      const id = String(effect?.id || effect?.effectId || '');
      if (!id) return;
      const descriptor = {
        id,
        kind,
        mode: String(effect?.mode || ''),
        overrideMode: String(effect?.runtimeOverrideMode || 'auto'),
        fixedStacks: Math.max(1, Math.floor(Number(effect?.runtimeFixedStacks) || 1)),
        targetActionKeys: unique(targetActionKeys),
        triggerActionKeys: unique(triggerActionKeys),
        activityCount: activityCounts.get(id) || 0
      };
      descriptors.set(id, descriptor);
      unique(effect?.effectIds || []).forEach(effectId => descriptors.set(String(effectId), descriptor));
    };
    (runtimeEffects.damageBuffEffects || []).forEach(effect => register(
      effect,
      'damage',
      getRuntimeDamageTargetActionKeys(effect.modifiers || {}),
      effect.triggerActionKeys || []
    ));
    (runtimeEffects.attackSpeedEffects || []).forEach(effect => register(
      effect,
      'speed',
      ['basicAttack', 'enhancedAttack'],
      effect.triggerActionKeys || []
    ));
    (runtimeEffects.spRecoveryEffects || []).forEach(effect => register(
      effect,
      'sp',
      [],
      effect.triggerActionKeys || []
    ));
    (runtimeEffects.cooldownEffects || []).forEach(effect => register(
      effect,
      'cooldown',
      [],
      effect.triggerActionKeys || []
    ));
    (runtimeEffects.eventEffects || []).forEach(effect => register(
      effect,
      'event',
      effect.targetActionKeys || [],
      effect.triggerActionKeys || []
    ));
    return descriptors;
  }

  function getRuntimeDamageTargetActionKeys(modifiers = {}) {
    const keys = new Set();
    const modifierKeys = Object.keys(modifiers).filter(key => Number(modifiers[key]));
    if (modifierKeys.some(key => ['atkP', 'physicalAtkP', 'magicAtkP', 'addP', 'actionMultiplierBonusP', 'specialP', 'otherP', 'critP', 'critRateP', 'critDmgP', 'critDmgAddP', 'enemyDefDownP', 'enemyCritResDownP', 'enemyCritDmgResDownP'].includes(key))) {
      ACTION_ORDER.forEach(key => keys.add(key));
    }
    if (modifierKeys.includes('normalAttackMultiplierBonusP')) ['basicAttack', 'enhancedAttack'].forEach(key => keys.add(key));
    if (modifierKeys.includes('basicMultiplierBonusP')) keys.add('basicAttack');
    if (modifierKeys.includes('enhancedMultiplierBonusP')) keys.add('enhancedAttack');
    if (modifierKeys.includes('lowSkillMultiplierBonusP')) keys.add('lowSkill');
    if (modifierKeys.includes('highSkillMultiplierBonusP')) keys.add('highSkill');
    if (modifierKeys.includes('skillActionMultiplierBonusP')) ['lowSkill', 'highSkill'].forEach(key => keys.add(key));
    if (modifierKeys.includes('normalAttackAddP')) ['basicAttack', 'enhancedAttack'].forEach(key => keys.add(key));
    if (modifierKeys.includes('basicAddP')) keys.add('basicAttack');
    if (modifierKeys.includes('enhancedAddP')) keys.add('enhancedAttack');
    if (modifierKeys.includes('lowSkillAddP')) keys.add('lowSkill');
    if (modifierKeys.includes('highSkillAddP')) keys.add('highSkill');
    if (modifierKeys.includes('skillAddP')) ['lowSkill', 'highSkill'].forEach(key => keys.add(key));
    return Array.from(keys);
  }

  function getRuntimeEffectDescriptor(row = {}, descriptors = new Map()) {
    const ids = [row.runtimeEffectId, row.effectId, row.id, row.sourceId].map(value => String(value || '')).filter(Boolean);
    return ids.map(id => descriptors.get(id)).find(Boolean) || null;
  }

  function getRuntimeAuditState(row, actionKey, descriptor, hasResult) {
    if (!descriptor && !row?.runtimeManaged) return null;
    if (row?.unsupportedRuntimeTrigger) {
      if (descriptor) {
        const active = hasResult && descriptor.activityCount > 0;
        return {
          label: hasResult ? (active ? 'ONあり' : '待機') : '外部入力',
          className: active ? 'is-runtime-active' : 'is-runtime-waiting',
          title: `手動外部イベントで評価${active ? ` / 発動${formatNumber(descriptor.activityCount)}回` : ' / 一致するイベント待ち'}`
        };
      }
      return {
        label: '未対応',
        className: 'is-runtime-waiting',
        title: row.reason || '発動時刻を再現できない条件のためDPS自動計算から除外'
      };
    }
    if (row?.externalActionRequired) {
      return {
        label: '外部待ち',
        className: 'is-runtime-waiting',
        title: '編成内の別使徒本人の行動タイムラインを未計上のため発動させません'
      };
    }
    if (descriptor?.overrideMode === 'off') {
      return {
        label: 'OFF',
        className: 'is-off',
        title: 'DPSの時系列効果設定で除外'
      };
    }
    if (descriptor?.overrideMode === 'fixed') {
      const target = descriptor.targetActionKeys.includes(actionKey);
      if (!target) {
        return {
          label: '—',
          className: 'is-none',
          title: '固定補正の適用対象外'
        };
      }
      return {
        label: `固定${descriptor.fixedStacks > 1 ? `×${descriptor.fixedStacks}` : ''}`,
        className: 'is-runtime-active',
        title: `指定した${descriptor.fixedStacks}スタックを計測中常時適用`
      };
    }
    const target = descriptor?.targetActionKeys?.includes(actionKey);
    const trigger = descriptor?.triggerActionKeys?.includes(actionKey);
    if (target) {
      const active = hasResult && descriptor.activityCount > 0;
      return {
        label: hasResult ? (active ? 'ONあり' : '待機') : '自動',
        className: active ? 'is-runtime-active' : 'is-runtime-waiting',
        title: `DPS自動評価${descriptor.activityCount > 0 ? ` / 発動${formatNumber(descriptor.activityCount)}回` : ' / この試行では未発動'}`
      };
    }
    if (trigger) {
      return {
        label: '起点',
        className: 'is-runtime-trigger',
        title: `この行動がDPS自動効果の発動起点${descriptor.activityCount > 0 ? ` / 発動${formatNumber(descriptor.activityCount)}回` : ''}`
      };
    }
    if (!descriptor) {
      return {
        label: '自動',
        className: 'is-runtime-waiting',
        title: 'DPSでは単発トグルから独立して自動評価'
      };
    }
    return {
      label: '—',
      className: 'is-none',
      title: 'この行動は発動起点・適用対象ではありません'
    };
  }

  function formatActionProfileDamage(profile) {
    const values = Object.values(profile?.variants || {})
      .map(variant => Number(variant?.totalExpectedDamage) || 0)
      .filter(value => value > 0)
      .sort((a, b) => a - b);
    if (!values.length) return '0';
    if (values.length === 1 || Math.abs(values[0] - values[values.length - 1]) < 0.5) return formatDamage(values[0]);
    return `${formatDamage(values[0])}～${formatDamage(values[values.length - 1])}`;
  }

  function renderTimelineRow(event) {
    const action = event.actionLabel || '';
    const variant = event.variant ? ` / ${event.variant}` : '';
    const generatedHitLabel = event.generatedObjectId
      ? ` / ${event.generatedObjectName || event.generatedObjectId}${event.generatedEventType ? ` ${event.generatedEventType}` : ''}`
      : '';
    const statusReaction = event.statusTakenDmgP
      ? ` / 状態反応 +${formatNumber(event.statusTakenDmgP)}%`
      : '';
    const statusDamageWeakness = event.statusDamageP
      ? ` / 状態異常弱点 その他倍率 +${formatNumber(event.statusDamageP)}%`
      : '';
    const hitEvaluation = event.damageEvaluation && Math.abs((Number(event.damageEvaluation.ratio) || 1) - 1) > 0.0001
      ? ` / 時点補正 ×${formatNumber(event.damageEvaluation.ratio)}（基礎 ${formatDamage(event.damageEvaluation.baseExpectedDamage)}）`
      : '';
    const evaluationTitle = event.damageEvaluation
      ? [
          ...Object.entries(event.damageEvaluation.ratios || {})
            .filter(([, value]) => Math.abs((Number(value) || 1) - 1) > 0.0001)
            .map(([key, value]) => `${({ attackDefense: '攻防', actionMultiplier: '行動倍率', add: '与被DMG', special: '特殊', other: 'その他', critical: '会心' })[key] || key}×${formatNumber(value)}`),
          ...(Array.isArray(event.damageEvaluation.activeEffects) ? event.damageEvaluation.activeEffects : [])
            .map(effect => effect.label)
            .filter(Boolean)
        ].join(' / ')
      : '';
    const runtimeBuffValue = formatRuntimeBuffModifiers(event.modifiers)
      || (event.attackPPerStack ? `物理攻撃力 +${formatNumber(event.attackPPerStack)}%` : '補正適用');
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
      hit: `${action}${variant}${generatedHitLabel} ${event.hitCount > 1 ? `${event.hitCount}ヒット` : 'ヒット'}${event.timingQuality === 'fallbackEnd' ? '（終了時補完）' : ''}${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ''}${hitEvaluation}${statusReaction}`,
      effect: `${action}${variant} 効果発生${event.effectId ? ` / ${event.effectId}` : ''}`,
      spRecovery: event.capped
        ? `SP回復周期 / 上限 ${formatNumber(event.sp)}`
        : `SP +${formatNumber(event.amount)} → ${formatNumber(event.sp)}`,
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
      runtimeEffectHit: `${event.label || '時系列効果'} / ${event.reason || '効果発生'}${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ''}${hitEvaluation}`,
      runtimeHealingEvent: `${event.label || 'HP回復'} / ${event.reason || '効果発生'} / ${event.reference ? `${event.reference}の` : ''}${formatNumber(event.value)}%`,
      externalEvent: `外部イベント / ${event.reason || event.triggerType || '手動入力'}${event.status ? ` / ${event.status}付与` : ''}${event.intervalFrames > 0 ? ` / ${formatNumber(event.occurrence)}回目` : ''}`,
      statusApplied: `${event.status}付与 / ${formatNumber(event.stackCount)}/${formatNumber(event.maxStacks)}スタック / ${statusDuration}`,
      statusTick: `${event.status}ダメージ / ${formatNumber(event.stackCount)}スタック${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ' / ダメージ未評価'}${hitEvaluation}${statusReaction}${statusDamageWeakness}`,
      statusExpired: `${event.status}終了 / 残り${formatNumber(event.stackCount)}スタック`,
      effectStateChanged: formatDpsEffectStateChange(event)
    };
    return `
      <div class="fdc-dps-timeline-row type-${escapeAttr(event.type)}">
        <time>${formatNumber(event.frame)}F <small>${formatNumber(event.frame / 60)}秒</small></time>
        <span${evaluationTitle ? ` title="${escapeAttr(evaluationTitle)}"` : ''}>${escapeHtml(map[event.type] || event.type)}</span>
      </div>
    `;
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
      ? formatRuntimeBuffModifiers(event.modifiers)
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

  function getDpsTimelineForDisplay(result = {}) {
    if (Array.isArray(result?.publicTimeline)) return result.publicTimeline;
    const timeline = Array.isArray(result?.timeline) ? result.timeline : [];
    const simulator = typeof window !== 'undefined' ? window.TRICKCAL_DPS_SIMULATOR : null;
    return typeof simulator?.createDpsPublicTimeline === 'function'
      ? simulator.createDpsPublicTimeline(timeline)
      : timeline;
  }

  function formatRuntimeBuffModifiers(modifiers = {}) {
    const labels = {
      atkP: '攻撃力',
      physicalAtkP: '物理攻撃力',
      magicAtkP: '魔法攻撃力',
      addP: '与ダメージ量',
      normalAttackAddP: '普通攻撃ダメージ量',
      basicAddP: '基本攻撃ダメージ量',
      enhancedAddP: '強化攻撃ダメージ量',
      skillAddP: 'スキルダメージ量',
      lowSkillAddP: '低学年スキルダメージ量',
      highSkillAddP: '高学年スキルダメージ量',
      specialP: '特殊倍率',
      otherP: 'その他倍率',
      actionMultiplierBonusP: '行動倍率',
      normalAttackMultiplierBonusP: '普通攻撃行動倍率',
      basicMultiplierBonusP: '基本攻撃行動倍率',
      enhancedMultiplierBonusP: '強化攻撃行動倍率',
      skillActionMultiplierBonusP: 'スキル行動倍率',
      lowSkillMultiplierBonusP: '低学年スキル行動倍率',
      highSkillMultiplierBonusP: '高学年スキル行動倍率',
      selfDestructMultiplierBonusP: '自爆行動倍率',
      critP: '会心',
      critRateP: '会心率',
      critDmgP: '会心DMG',
      critDmgAddP: '会心DMG量',
      enemyDefDownP: '敵防御力低下',
      enemyCritResDownP: '敵会心抵抗低下',
      enemyCritDmgResDownP: '敵会心DMG抵抗低下'
    };
    return Object.entries(modifiers || {})
      .filter(([, value]) => Number(value))
      .map(([key, value]) => `${labels[key] || key} ${Number(value) > 0 ? '+' : ''}${formatNumber(value)}%`)
      .join(' / ');
  }

  function formatNumber(value) {
    const number = Number(value) || 0;
    return Number.isInteger(number) ? number.toLocaleString('ja-JP') : number.toFixed(2).replace(/\.?0+$/, '');
  }

  function formatDamage(value) {
    return Math.round(Number(value) || 0).toLocaleString('ja-JP');
  }

  function formatSignedDamage(value) {
    const number = Math.round(Number(value) || 0);
    return `${number > 0 ? '+' : ''}${number.toLocaleString('ja-JP')}`;
  }

  function formatSignedNumber(value) {
    const number = Number(value) || 0;
    const text = Math.abs(number).toFixed(2).replace(/\.?0+$/, '');
    return `${number > 0 ? '+' : number < 0 ? '-' : ''}${text}`;
  }

  function formatSignedPercent(value) {
    const number = Number(value) || 0;
    return `${number > 0 ? '+' : ''}${number.toFixed(1)}%`;
  }

  function getDeltaClass(value) {
    const number = Number(value) || 0;
    return number > 0 ? 'is-positive' : number < 0 ? 'is-negative' : 'is-neutral';
  }

  function cloneData(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function unique(values) {
    return Array.from(new Set(values));
  }

  function formatPercent(value) {
    return `${(Number(value) || 0).toFixed(1)}%`;
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
