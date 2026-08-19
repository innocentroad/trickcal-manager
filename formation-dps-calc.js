(() => {
  'use strict';

  const el = {
    lab: document.getElementById('fdc-dps-lab'),
    duration: document.getElementById('fdc-dps-duration'),
    highMode: document.getElementById('fdc-dps-high-mode'),
    initialDelay: document.getElementById('fdc-dps-initial-delay'),
    seed: document.getElementById('fdc-dps-seed'),
    trials: document.getElementById('fdc-dps-trials'),
    run: document.getElementById('fdc-dps-run'),
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
    comparison: document.getElementById('fdc-dps-comparison')
  };
  if (!el.lab) return;

  const ACTION_ORDER = ['basicAttack', 'enhancedAttack', 'lowSkill', 'highSkill'];
  const ACTION_LABELS = {
    basicAttack: '基本攻撃',
    enhancedAttack: '強化攻撃',
    lowSkill: '低学年',
    highSkill: '高学年'
  };
  let rerunTimer = 0;
  let latestRun = null;
  let baseline = null;

  el.run?.addEventListener('click', runSimulation);
  el.baselineSave?.addEventListener('click', saveBaseline);
  el.baselineCompare?.addEventListener('click', compareWithBaseline);
  el.baselineClear?.addEventListener('click', () => clearBaseline());
  [el.duration, el.highMode, el.initialDelay, el.seed, el.trials].forEach(input => input?.addEventListener('change', runSimulation));
  window.addEventListener('trickcal:damage-calculator-rendered', scheduleRun);
  window.addEventListener('trickcal:comparison-session-changed', () => {
    baseline = null;
    hideComparison();
    scheduleRun();
  });

  runSimulation();

  function scheduleRun() {
    clearTimeout(rerunTimer);
    rerunTimer = setTimeout(runSimulation, 0);
  }

  function runSimulation() {
    const api = window.TRICKCAL_DAMAGE_CALC;
    const simulator = window.TRICKCAL_DPS_SIMULATOR;
    const timingData = typeof DPS_TIMING_DATA === 'undefined' ? null : DPS_TIMING_DATA;
    if (!api?.createDpsSnapshot || !simulator || !timingData) {
      renderError('DPS試験用データまたは計算モジュールを読み込めませんでした。');
      return;
    }
    const snapshot = api.createDpsSnapshot();
    const timing = timingData.apostles?.[String(snapshot.targetId || '').toLowerCase()];
    if (!snapshot.apostle) {
      renderError(`${snapshot.targetName || '選択使徒'}のスキルデータを読み込めませんでした。`);
      return;
    }
    if (!timing) {
      renderWithoutTiming(snapshot);
      return;
    }
    const config = simulator.buildCombatantConfig(snapshot.apostle, timing, {
      skillLevels: snapshot.skillLevels,
      runtimeEffects: snapshot.runtimeEffects
    });
    const initialDelaySeconds = Math.max(0, Number(el.initialDelay?.value) || 0);
    const durationSeconds = Number(el.duration?.value) || 60;
    const seed = Number(el.seed?.value) || 1;
    const simulationOptions = {
      durationSeconds,
      highSkillMode: el.highMode?.value || 'disabled',
      initialActionDelayFrames: initialDelaySeconds * 60,
      seed,
      damageProfiles: snapshot.actionDamageProfiles || {},
      statusDamageProfiles: snapshot.statusDamageProfiles || {}
    };
    const result = simulator.simulate(config, simulationOptions);
    const aggregate = simulator.simulateMany(config, {
      ...simulationOptions,
      trials: Number(el.trials?.value) || 64
    });
    latestRun = {
      scenario: snapshot.scenario || null,
      snapshot,
      timing,
      config,
      result,
      aggregate,
      options: {
        ...simulationOptions,
        trials: Number(el.trials?.value) || 64
      }
    };
    if (!baseline) baseline = createSharedSessionBaseline(simulator, timingData, latestRun.options);
    if (baseline && baseline.targetId !== snapshot.targetId) {
      clearBaseline(`${baseline.targetName}から使徒が変更されたため、基準を解除しました。`);
    } else {
      if (baseline && el.comparisonPanel && !el.comparisonPanel.hidden) hideComparison();
      updateBaselineControls();
    }
    renderSimulation(snapshot, timing, config, result, aggregate, timingData);
  }

  function renderWithoutTiming(snapshot) {
    latestRun = null;
    if (baseline && baseline.targetId !== snapshot.targetId) {
      clearBaseline(`${baseline.targetName}から使徒が変更されたため、基準を解除しました。`);
    } else {
      if (baseline && el.comparisonPanel && !el.comparisonPanel.hidden) hideComparison();
      updateBaselineControls();
    }
    el.targetNote.textContent = `${snapshot.targetName || '選択使徒'} / スキル速度未登録`;
    el.status.textContent = '速度データがないためDPSとタイムラインは計算できません。行動別適用効果は確認できます。';
    el.status.classList.add('has-warning');
    el.summary.innerHTML = '<div class="fdc-dps-summary-card"><span>DPS計算</span><strong>速度未登録</strong><small>効果範囲の監査のみ利用できます</small></div>';
    if (el.contribution) el.contribution.innerHTML = '<p class="fdc-dps-empty">スキル速度データの追加後にDPS寄与度を計算できます。</p>';
    if (el.trialNote) el.trialNote.textContent = '';
    if (el.timeline) el.timeline.innerHTML = '<p class="fdc-dps-empty">速度データがないためタイムラインは生成していません。</p>';
    renderActionEffectAudit(snapshot.actionEffectAudit || {}, snapshot.actionDamageProfiles || {});
  }

  function saveBaseline() {
    runSimulation();
    if (!latestRun?.aggregate || !(latestRun.aggregate.totalExpectedDamage > 0)) {
      if (el.baselineNote) el.baselineNote.textContent = 'ダメージを評価できる状態で基準を保存してください。';
      return;
    }
    baseline = {
      targetId: latestRun.snapshot.targetId,
      targetName: latestRun.snapshot.targetName,
      scenario: cloneData(latestRun.scenario || latestRun.snapshot.scenario || null),
      config: cloneData(latestRun.config),
      damageProfiles: cloneData(latestRun.snapshot.actionDamageProfiles || {}),
      statusDamageProfiles: cloneData(latestRun.snapshot.statusDamageProfiles || {}),
      options: cloneData({
        durationSeconds: latestRun.options.durationSeconds,
        highSkillMode: latestRun.options.highSkillMode,
        initialActionDelayFrames: latestRun.options.initialActionDelayFrames,
        seed: latestRun.options.seed,
        trials: latestRun.options.trials
      }),
      aggregate: cloneData(latestRun.aggregate)
    };
    saveSharedSessionBaseline(latestRun.snapshot);
    window.dispatchEvent(new CustomEvent('trickcal:comparison-session-ui'));
    hideComparison();
    updateBaselineControls();
  }

  function createSharedSessionBaseline(simulator, timingData, options) {
    const scenarioApi = window.TRICKCAL_COMBAT_SCENARIO;
    const session = scenarioApi?.loadComparisonSession?.();
    const saved = session?.baseline?.dpsSnapshot;
    if (!saved?.targetId || !saved.apostle) return null;
    const timing = timingData?.apostles?.[String(saved.targetId).toLowerCase()];
    if (!timing) return null;
    return {
      targetId: saved.targetId,
      targetName: saved.targetName || session.baseline.scenario?.actors?.self?.name || saved.targetId,
      scenario: cloneData(session.baseline.scenario || null),
      config: simulator.buildCombatantConfig(saved.apostle, timing, {
        skillLevels: saved.skillLevels,
        runtimeEffects: saved.runtimeEffects
      }),
      damageProfiles: cloneData(saved.actionDamageProfiles || {}),
      statusDamageProfiles: cloneData(saved.statusDamageProfiles || {}),
      options: cloneData({
        durationSeconds: options.durationSeconds,
        highSkillMode: options.highSkillMode,
        initialActionDelayFrames: options.initialActionDelayFrames,
        seed: options.seed,
        trials: options.trials
      }),
      aggregate: null,
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
        skillLevels: cloneData(snapshot.skillLevels || {}),
        damageType: snapshot.damageType || '',
        actionCategory: snapshot.actionCategory || '',
        selectedSkillOptionKey: snapshot.selectedSkillOptionKey || '',
        boardState: cloneData(snapshot.boardState || snapshot.scenario?.characterState?.boardState || null),
        singleActionProfiles: cloneData(snapshot.singleActionProfiles || {}),
        actionDamageProfiles: cloneData(snapshot.actionDamageProfiles || {}),
        statusDamageProfiles: cloneData(snapshot.statusDamageProfiles || {}),
        actionEffectAudit: cloneData(snapshot.actionEffectAudit || {}),
        runtimeEffects: cloneData(snapshot.runtimeEffects || {})
      }
    });
  }

  function compareWithBaseline() {
    if (!baseline) return;
    const api = window.TRICKCAL_DAMAGE_CALC;
    const simulator = window.TRICKCAL_DPS_SIMULATOR;
    const timingData = typeof DPS_TIMING_DATA === 'undefined' ? null : DPS_TIMING_DATA;
    const snapshot = api?.createDpsSnapshot?.();
    const timing = timingData?.apostles?.[String(snapshot?.targetId || '').toLowerCase()];
    if (!snapshot?.apostle || !timing || !simulator) {
      if (el.baselineNote) el.baselineNote.textContent = '変更後のDPSデータを作成できませんでした。';
      return;
    }
    if (snapshot.targetId !== baseline.targetId) {
      clearBaseline(`${baseline.targetName}から使徒が変更されたため、基準を解除しました。`);
      return;
    }
    const candidateConfig = simulator.buildCombatantConfig(snapshot.apostle, timing, {
      skillLevels: snapshot.skillLevels,
      runtimeEffects: snapshot.runtimeEffects
    });
    const commonOptions = baseline.options;
    const baselineAggregate = baseline.aggregate || simulator.simulateMany(baseline.config, {
      ...commonOptions,
      damageProfiles: baseline.damageProfiles,
      statusDamageProfiles: baseline.statusDamageProfiles || {}
    });
    const candidateAggregate = simulator.simulateMany(candidateConfig, {
      ...commonOptions,
      damageProfiles: snapshot.actionDamageProfiles || {},
      statusDamageProfiles: snapshot.statusDamageProfiles || {}
    });
    renderComparison(baselineAggregate, candidateAggregate, commonOptions);
  }

  function clearBaseline(message = '基準は未保存です。') {
    baseline = null;
    window.TRICKCAL_COMBAT_SCENARIO?.clearComparisonSession?.();
    window.dispatchEvent(new CustomEvent('trickcal:comparison-session-ui'));
    hideComparison();
    updateBaselineControls(message);
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
    el.targetNote.textContent = message;
    el.status.textContent = '';
    el.summary.innerHTML = '';
    if (el.contribution) el.contribution.innerHTML = `<p class="fdc-dps-empty">${escapeHtml(message)}</p>`;
    if (el.trialNote) el.trialNote.textContent = '';
    if (el.effectAudit) el.effectAudit.innerHTML = `<p class="fdc-dps-empty">${escapeHtml(message)}</p>`;
    if (el.effectAuditNote) el.effectAuditNote.textContent = '';
    el.timeline.innerHTML = `<p class="fdc-dps-empty">${escapeHtml(message)}</p>`;
  }

  function renderSimulation(snapshot, timing, config, result, aggregate, timingData) {
    el.targetNote.textContent = `${snapshot.targetName} / ゲーム内${formatNumber(result.durationSeconds)}秒`;
    const warnings = [...(timingData.warnings || []), ...(result.warnings || [])];
    el.status.textContent = warnings.length
      ? `暫定データ: ${warnings.length}件の確認事項があります。`
      : '速度・発生フレームの暫定データで計算しています。';
    el.status.classList.toggle('has-warning', warnings.length > 0);
    renderContribution(aggregate);
    renderActionEffectAudit(snapshot.actionEffectAudit || {}, snapshot.actionDamageProfiles || {});

    const actionCards = ACTION_ORDER.map(key => `
      <div class="fdc-dps-summary-card">
        <span>${ACTION_LABELS[key]}</span>
        <strong>${formatNumber(result.counts[key] || 0)}回</strong>
        <small>${formatNumber(result.hits[key] || 0)}ヒット</small>
      </div>
    `).join('');
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
      ${actionCards}
    `;

    const visible = result.timeline.slice(0, 600);
    el.timeline.innerHTML = visible.length
      ? visible.map(renderTimelineRow).join('')
      : '<p class="fdc-dps-empty">表示できるイベントがありません。</p>';
    if (result.timeline.length > visible.length) {
      el.timeline.insertAdjacentHTML('beforeend', `<p class="fdc-dps-empty">以降${formatNumber(result.timeline.length - visible.length)}件は省略しました。</p>`);
    }
  }

  function renderContribution(aggregate) {
    if (!el.contribution) return;
    if (!aggregate || !(aggregate.totalExpectedDamage > 0)) {
      el.contribution.innerHTML = '<p class="fdc-dps-empty">行動ダメージを評価できませんでした。スキル倍率または発生タイミングを確認してください。</p>';
      if (el.trialNote) el.trialNote.textContent = aggregate ? `${formatNumber(aggregate.trials)} seed` : '';
      return;
    }
    if (el.trialNote) {
      const lastSeed = aggregate.baseSeed + aggregate.trials - 1;
      el.trialNote.textContent = `${formatNumber(aggregate.trials)} seed / ${formatNumber(aggregate.baseSeed)}～${formatNumber(lastSeed)}`;
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
      .map(([status, item]) => `
        <div class="fdc-dps-contribution-row">
          <strong>${escapeHtml(status)}（DoT）</strong>
          <span><b>${formatDamage(item.contributionDps)}</b><small>DPS</small></span>
          <span><b>${formatPercent(item.damageShareP)}</b><small>構成比</small></span>
          <span><b>1秒毎</b><small>周期</small></span>
          <span><b>${formatDamage(item.expectedDamage)}</b><small>総DoT</small></span>
        </div>
      `).join('');
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

  function renderActionEffectAudit(audit, profiles) {
    if (!el.effectAudit) return;
    const actionMaps = Object.fromEntries(ACTION_ORDER.map(key => [
      key,
      new Map((audit?.[key]?.rows || []).map(row => [row.key, row]))
    ]));
    const effectKeys = unique(ACTION_ORDER.flatMap(key => Array.from(actionMaps[key].keys())));
    if (el.effectAuditNote) el.effectAuditNote.textContent = `${formatNumber(effectKeys.length)}効果`;
    if (!effectKeys.length) {
      el.effectAudit.innerHTML = '<p class="fdc-dps-empty">表示できる静的効果がありません。</p>';
      return;
    }
    const matrixRows = effectKeys.map(effectKey => {
      const representative = ACTION_ORDER.map(key => actionMaps[key].get(effectKey)).find(Boolean) || {};
      const states = ACTION_ORDER.map(key => {
        const row = actionMaps[key].get(effectKey);
        if (!row) return '<span class="fdc-dps-effect-state is-none" title="この行動では評価対象外">—</span>';
        const state = row.enabled ? 'is-on' : 'is-off';
        return `<span class="fdc-dps-effect-state ${state}" title="${escapeAttr(row.reason || (row.enabled ? '適用' : '除外'))}">${row.enabled ? 'ON' : 'OFF'}</span>`;
      }).join('');
      return `
        <div class="fdc-dps-effect-matrix-row">
          <span class="fdc-dps-effect-name"><strong>${escapeHtml(representative.label || '効果')}</strong><small>${escapeHtml([representative.source, representative.value].filter(Boolean).join(' / '))}</small></span>
          ${states}
        </div>
      `;
    }).join('');
    const actionDetails = ACTION_ORDER.map(key => {
      const rows = Array.from(actionMaps[key].values());
      const enabledCount = rows.filter(row => row.enabled).length;
      const damageText = formatActionProfileDamage(profiles?.[key]);
      return `
        <details class="fdc-dps-effect-action-detail">
          <summary><strong>${escapeHtml(ACTION_LABELS[key])}</strong><span>1回期待 ${escapeHtml(damageText)} / ON ${formatNumber(enabledCount)}・OFF ${formatNumber(rows.length - enabledCount)}</span></summary>
          <div class="fdc-dps-effect-action-list">
            ${rows.length ? rows.map(row => `
              <div class="${row.enabled ? 'is-on' : 'is-off'}">
                <span>${row.enabled ? 'ON' : 'OFF'}</span>
                <strong>${escapeHtml(row.label)}</strong>
                <small>${escapeHtml([row.value, row.reason].filter(Boolean).join(' / '))}</small>
              </div>
            `).join('') : '<p class="fdc-dps-empty">評価対象の効果なし</p>'}
          </div>
        </details>
      `;
    }).join('');
    el.effectAudit.innerHTML = `
      <div class="fdc-dps-effect-matrix-wrap">
        <div class="fdc-dps-effect-matrix">
          <div class="fdc-dps-effect-matrix-head"><span>効果</span>${ACTION_ORDER.map(key => `<span>${escapeHtml(ACTION_LABELS[key])}</span>`).join('')}</div>
          ${matrixRows}
        </div>
      </div>
      <div class="fdc-dps-effect-action-details">${actionDetails}</div>
    `;
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
    const statusWeakness = event.statusTakenDmgP
      ? ` / 状態弱点 +${formatNumber(event.statusTakenDmgP)}%`
      : '';
    const hitEvaluation = event.damageEvaluation && Math.abs((Number(event.damageEvaluation.ratio) || 1) - 1) > 0.0001
      ? ` / 時点補正 ×${formatNumber(event.damageEvaluation.ratio)}（基礎 ${formatDamage(event.damageEvaluation.baseExpectedDamage)}）`
      : '';
    const evaluationTitle = event.damageEvaluation
      ? [
          ...Object.entries(event.damageEvaluation.ratios || {})
            .filter(([, value]) => Math.abs((Number(value) || 1) - 1) > 0.0001)
            .map(([key, value]) => `${({ attackDefense: '攻防', add: '与被DMG', special: '特殊', other: 'その他', critical: '会心' })[key] || key}×${formatNumber(value)}`),
          ...(Array.isArray(event.damageEvaluation.activeEffects) ? event.damageEvaluation.activeEffects : [])
            .map(effect => effect.label)
            .filter(Boolean)
        ].join(' / ')
      : '';
    const runtimeBuffValue = formatRuntimeBuffModifiers(event.modifiers)
      || (event.attackPPerStack ? `物理攻撃力 +${formatNumber(event.attackPPerStack)}%` : '補正適用');
    const map = {
      skillTransition: `${action}${variant}へ移行（${formatNumber(event.transitionFrames)}F）`,
      actionStart: `${action}${variant} 開始`,
      actionEnd: `${action}${variant} 終了`,
      hit: `${action}${variant} ${event.hitCount > 1 ? `${event.hitCount}ヒット` : 'ヒット'}${event.timingQuality === 'fallbackEnd' ? '（終了時補完）' : ''}${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ''}${hitEvaluation}${statusWeakness}`,
      effect: `${action}${variant} 効果発生${event.effectId ? ` / ${event.effectId}` : ''}`,
      spRecovery: event.capped
        ? `SP回復周期 / 上限 ${formatNumber(event.sp)}`
        : `SP +${formatNumber(event.amount)} → ${formatNumber(event.sp)}`,
      spRecoveryEvent: `${event.label || 'SP回復'} / ${event.reason || '効果発生'} / ${event.capped ? `上限 ${formatNumber(event.sp)}` : `SP +${formatNumber(event.amount)} → ${formatNumber(event.sp)}`}`,
      lowSkillReady: `低学年発動可能 / SP ${formatNumber(event.sp)}`,
      attackSpeedInitial: `${event.label} 開始時適用 / 攻撃速度 +${formatNumber(event.totalHasteP)}% / 普通攻撃間隔 ${formatNumber(event.normalAttackIntervalFrames)}F${event.durationFrames > 0 ? ` / ${formatNumber(event.durationFrames / 60)}秒` : ''}`,
      attackSpeedStack: `${event.label} ${formatNumber(event.stackCount)}スタック / 攻撃速度 +${formatNumber(event.totalHasteP)}% / 普通攻撃間隔 ${formatNumber(event.normalAttackIntervalFrames)}F`,
      attackSpeedApplied: `${event.label} ${formatNumber(event.stackCount)}スタック / 攻撃速度 +${formatNumber(event.totalHasteP)}% / 普通攻撃間隔 ${formatNumber(event.normalAttackIntervalFrames)}F${event.durationFrames > 0 ? ` / ${formatNumber(event.durationFrames / 60)}秒` : ''}`,
      attackSpeedExpired: `${event.label} 終了 / 残り${formatNumber(event.stackCount)}スタック / 攻撃速度 +${formatNumber(event.totalHasteP)}%`,
      attackSpeedReset: `${event.label} リセット / ${formatNumber(event.previousStackCount)}→0スタック / 普通攻撃間隔 ${formatNumber(event.normalAttackIntervalFrames)}F`,
      resourceChange: `${event.resourceName} ${event.operation === 'gain' ? '+' : '-'}${formatNumber(event.amount)} → ${formatNumber(event.after)}/${formatNumber(event.maxStacks)}`,
      runtimeBuffApplied: `${event.label} ${formatNumber(event.stackCount)}/${formatNumber(event.maxStacks)}スタック / ${runtimeBuffValue}${event.durationFrames > 0 ? ` / ${formatNumber(event.durationFrames / 60)}秒` : ''}`,
      runtimeBuffExpired: `${event.label} 終了 / 残り${formatNumber(event.stackCount)}スタック`,
      runtimeEffectHit: `${event.label || '時系列効果'} / ${event.reason || '効果発生'}${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ''}${hitEvaluation}`,
      runtimeHealingEvent: `${event.label || 'HP回復'} / ${event.reason || '効果発生'} / ${event.reference ? `${event.reference}の` : ''}${formatNumber(event.value)}%`,
      statusApplied: `${event.status}付与 / ${formatNumber(event.stackCount)}/${formatNumber(event.maxStacks)}スタック / ${formatNumber(event.durationFrames / 60)}秒`,
      statusTick: `${event.status}ダメージ / ${formatNumber(event.stackCount)}スタック${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ' / ダメージ未評価'}${hitEvaluation}${statusWeakness}`,
      statusExpired: `${event.status}終了 / 残り${formatNumber(event.stackCount)}スタック`
    };
    return `
      <div class="fdc-dps-timeline-row type-${escapeAttr(event.type)}">
        <time>${formatNumber(event.frame)}F <small>${formatNumber(event.frame / 60)}秒</small></time>
        <span${evaluationTitle ? ` title="${escapeAttr(evaluationTitle)}"` : ''}>${escapeHtml(map[event.type] || event.type)}</span>
      </div>
    `;
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
      specialP: '特殊倍率',
      otherP: 'その他倍率',
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
