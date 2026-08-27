(() => {
  'use strict';

  const ACTION_LABELS = Object.freeze({
    basicAttack: '基本攻撃', enhancedAttack: '強化攻撃', lowSkill: '低学年', highSkill: '高学年'
  });
  const ACTION_COLORS = Object.freeze({
    basicAttack: '#72a6ff', enhancedAttack: '#c88bff', lowSkill: '#62d6a3', highSkill: '#ffb568', runtime: '#f477aa'
  });
  // 独立DPS画面と同一の保存先を使う。通常計算のsnapshotは変更せず、
  // DPS実行用の複製だけへoverrideを反映する。
  const DPS_RUNTIME_OVERRIDE_STORAGE_KEY = 'trickcal:dps-runtime-effect-overrides:v1';

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
      // 対応可否の判定はDPS表示中だけに閉じない。通常表示のまま使徒を
      // 選び直しても、次にDPSを開けるかを軽量snapshotから更新する。
      this.currentTargetId = '';
      this.availability = { ready: false, snapshot: null, support: null, error: null };
      this.onAvailabilityChange = null;
    }

    getOptions() {
      const { duration, highMode, seed, trials } = this.elements;
      return {
        durationSeconds: Number(duration.value) || 60,
        highSkillMode: highMode.value || 'disabled',
        // 初動は試験版UIから外し、比較軸をぶらさない固定値とする。
        initialActionDelayFrames: 60,
        seed: Math.max(1, Math.floor(Number(seed.value) || 1)),
        trials: Math.max(1, Math.floor(Number(trials.value) || 16)),
        // 「統計試行数」は表示用の目安ではなく、集計に使うseed数そのもの。
        // この試験UIでは収束短縮を許可せず、指定された連番seedをすべて実行する。
        exactTrials: true,
        adaptiveTrials: false,
        formationTimelineMode: 'self-only'
      };
    }

    createAxis(snapshot, options) {
      const scenario = snapshot?.scenario || {};
      return {
        targetId: String(snapshot?.targetId || ''),
        enemy: stableStringify({
          battleConditions: scenario.battleConditions || {},
          enemy: scenario.actors?.enemy || {}
        }),
        durationSeconds: Number(options.durationSeconds) || 0,
        highSkillMode: options.highSkillMode || 'disabled',
        initialActionDelayFrames: Number(options.initialActionDelayFrames) || 0,
        seed: Number(options.seed) || 0,
        trials: Number(options.trials) || 0,
        formationTimelineMode: options.formationTimelineMode || 'self-only'
      };
    }

    getSupport(snapshot) {
      const registry = window.TRICKCAL_DPS_SUPPORT_REGISTRY;
      return registry?.evaluate?.(snapshot) || { supported: false, reason: 'DPS対応リストを読み込めませんでした。' };
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
        const support = this.getSupport(snapshot);
        const targetId = String(snapshot?.targetId || '').trim().toLowerCase();
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
      this.requiresRecalculation = true;
      this.lastAutoFingerprint = '';
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
      this.requiresRecalculation = true;
      this.lastAutoFingerprint = '';
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
      if (!this.running) return;
      this.running = false;
      // A partially computed aggregate must never look fresh after the user
      // returns to DPS mode.  Force the next DPS activation to obtain a whole
      // new single + aggregate pair.
      this.latest = null;
      this.requiresRecalculation = true;
      this.lastAutoFingerprint = '';
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
      this.currentInputFingerprint = createDpsInputFingerprint(snapshot, options);
      const freshness = getSnapshotFreshness(
        this.latest?.inputFingerprint || '',
        this.currentInputFingerprint,
        this.running
      );
      const stale = freshness.shouldInvalidate;
      if (stale || (this.requiresRecalculation && !this.latest)) {
        this.latest = null;
        this.requiresRecalculation = true;
        this.clearComparison();
        value.textContent = '再計算必要';
        state.textContent = '条件変更・再計算必要';
        meta.textContent = '使徒の育成・装備・スキル・敵またはDPS設定が変更されました';
        this.elements.drawerStatus.textContent = '条件変更・再計算必要';
        this.renderCollapsedBreakdown();
        this.renderDpsDetail();
      }
      if (!support.supported) {
        this.clearComparison();
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
      this.requiresRecalculation = true;
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
      this.latest = null;
      this.requiresRecalculation = true;
      this.lastAutoFingerprint = '';
      this.clearComparison();
      this.refreshAvailability({ render: true });
      this.requestAutoRun();
    }

    run() {
      if (!this.dpsModeActive || this.running) return;
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
      this.elements.state.textContent = '比較用DPSを計算中';
      this.elements.drawerStatus.textContent = this.elements.state.textContent;
      this.clearComparison();
      this.renderCollapsedBreakdown();
      this.updateBaselineControls();
      const snapshot = available.snapshot;
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
            enemySize: snapshot.scenario?.battleConditions?.enemySize || snapshot.scenario?.actors?.enemy?.size || '',
            enemySizeRank: snapshot.scenario?.battleConditions?.enemySizeRank || snapshot.scenario?.actors?.enemy?.sizeRank || 0
          });
          const singleOptions = {
            ...options,
            recordTimeline: true,
            recordDamageSeries: true,
            damageProfiles: snapshot.actionDamageProfiles || {},
            statusDamageProfiles: snapshot.statusDamageProfiles || {}
          };
          const aggregateOptions = {
            ...options,
            recordTimeline: false,
            recordDamageSeries: false,
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
          // 旧結果は表示せず再計算を求める。
          const currentSnapshot = createDpsSnapshotWithRuntimeOverrides(this.adapter);
          const currentFingerprint = createDpsInputFingerprint(currentSnapshot, this.getOptions());
          if (!this.isCurrentRun(runToken, cancellation)) return;
          if (currentFingerprint !== runFingerprint) {
            this.latest = null;
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
      this.elements.value.textContent = formatDamage(aggregate.meanDps);
      this.renderProvisionalBadge(support);
      this.elements.state.textContent = `${support.label} / ${support.configuration}`;
      this.elements.meta.textContent = `${trialSummary.compact} / ${options.durationSeconds}秒`;
      this.elements.drawerStatus.textContent = `計算済み: ${trialSummary.compact} / ${options.durationSeconds}秒`;
      this.renderDpsDetail();
      this.renderCollapsedBreakdown(createDpsBottomBreakdown(aggregate));
      this.elements.sparklineMeta.textContent = `${options.durationSeconds}秒 / seed ${this.latest.single?.seed || options.seed}`;
      drawSparkline(this.elements.sparkline, this.latest.single?.damageSeries || []);
      this.applyBaselineComparison({ resultReady: true });
    }

    renderCollapsedBreakdown(rows = null) {
      const items = rows || createDpsBottomBreakdown(null);
      if (!rows) {
        drawSparkline(this.elements.sparkline, []);
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
      const text = formatSignedDamage(row.differenceDps);
      const percent = formatSignedPercent(row.percentChange);
      const description = `基準比 ${text} DPS${percent ? `（${percent}）` : '（基準DPSが0のため比率なし）'}`;
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
        delete element.dataset.deltaState;
        return;
      }
      const text = formatSignedDamage(comparison.meanDpsDifference);
      const percent = formatSignedPercent(comparison.meanDpsPercent);
      const description = `基準比 ${text} DPS${percent ? `（${percent}）` : '（基準DPSが0のため比率なし）'}`;
      element.hidden = false;
      element.textContent = text;
      element.setAttribute('aria-label', description);
      element.dataset.deltaState = getDeltaState(comparison.meanDpsDifference);
    }

    renderDpsDetail() {
      const grid = this.elements.detailGrid;
      if (!grid) return;
      const latest = this.latest;
      if (!latest?.aggregate) {
        const state = this.elements.drawerStatus?.textContent || '計算前';
        grid.innerHTML = renderDpsDetailGroups([{
          title: '計算状態',
          rows: [['状態', getDpsDetailStatusLabel(state)]]
        }]);
        return;
      }
      const { aggregate, options, support, snapshot } = latest;
      const trialSummary = getTrialSummary(options, aggregate);
      const groups = [
        {
          title: '計測情報',
          rows: [
            ['平均総ダメージ', formatDamage(aggregate.totalExpectedDamage)],
            ['ばらつき（P10～P90）', `${formatDamage(aggregate.range?.p10)}～${formatDamage(aggregate.range?.p90)}`],
            ['計測時間', `${formatNumber(options.durationSeconds)}秒`],
            ['統計試行', `${formatNumber(trialSummary.evaluated)}回`]
          ]
        },
        {
          title: '対応構成',
          rows: [['使徒', `${support.label} / ${support.configuration}${support.provisional ? `（暫定: ${support.provisionalLabel}）` : ''}`]]
        },
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
        breakdown: structuredCloneSafe(createDpsBottomBreakdown(this.latest.aggregate))
      };
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
      bottomBar: document.getElementById('fdcp-bottom-bar'), primary: document.querySelector('.fdcp-dps-primary'), value: document.getElementById('fdcp-dps-value'), totalDelta: document.getElementById('fdcp-total-delta'), state: document.getElementById('fdcp-dps-state'), meta: document.getElementById('fdcp-dps-meta'), provisionalBadge: document.getElementById('fdcp-provisional-badge'), run: document.getElementById('fdcp-dps-run'),
      drawer: document.getElementById('fdcp-dps-detail-panel'), drawerStatus: document.getElementById('fdcp-drawer-status'), detailGrid: document.getElementById('fdcp-dps-detail-grid'),
      duration: document.getElementById('fdcp-duration'), highMode: document.getElementById('fdcp-high-mode'), seed: document.getElementById('fdcp-seed'), trials: document.getElementById('fdcp-trials'), autoRun: document.getElementById('fdcp-auto-run'), sparkline: document.getElementById('fdcp-sparkline'), sparklineMeta: document.getElementById('fdcp-sparkline-meta'),
      settingsToggle: document.getElementById('fdcp-dps-settings-toggle'), settingsPanel: document.getElementById('fdcp-dps-settings-panel'), settingsSlot: document.getElementById('fdcp-dps-settings-slot'), compareToggle: document.getElementById('fdcp-dps-compare-toggle'), compareToggleLabel: document.getElementById('fdcp-dps-compare-toggle-label'), comparePanel: document.getElementById('fdcp-dps-compare-panel'), compareSlot: document.getElementById('fdcp-dps-compare-slot'),
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
    elements.detailGrid?.addEventListener('click', event => {
      if (event.target.closest?.('[data-fdcp-timeline-more]')) controller.showMoreTimeline();
    });
    elements.detailGrid?.addEventListener('change', event => controller.handleRuntimeEffectSettingChange(event));
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
      if (currentMode !== 'dps') return;
      controller.refreshAvailability();
      controller.requestAutoRun();
    };
    [elements.highMode, elements.duration, elements.seed, elements.trials, elements.autoRun]
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
    setMode('single');
    controller.refreshAvailability({ render: false });
  }

  function axesMatch(left = {}, right = {}) { return ['targetId', 'enemy', 'durationSeconds', 'highSkillMode', 'initialActionDelayFrames', 'seed', 'trials', 'formationTimelineMode'].every(key => left[key] === right[key]); }
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
  function createDpsComparison(baseline = {}, current = {}) {
    const beforeAggregate = baseline.aggregate || {};
    const afterAggregate = current.aggregate || {};
    const beforeRows = baseline.breakdown || createDpsBottomBreakdown(beforeAggregate);
    const afterRows = current.breakdown || createDpsBottomBreakdown(afterAggregate);
    const compareValue = (before, after) => {
      const base = Number(before) || 0;
      const now = Number(after) || 0;
      const difference = now - base;
      return { before: base, after: now, difference, percentChange: base === 0 ? null : difference / base * 100 };
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
      formationTimelineMode: options.formationTimelineMode
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
      if (!['attackSpeedApplied', 'runtimeBuffApplied', 'runtimeEffectHit', 'spRecoveryEvent', 'cooldownChanged', 'statusApplied'].includes(event?.type)) return;
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
    const runtimeControls = renderDpsRuntimeEffectControls(runtimeEffects);
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
    const variant = event.variant ? ` / ${event.variant}` : '';
    const generated = event.generatedObjectId ? ` / ${event.generatedObjectName || event.generatedObjectId}${event.generatedEventType ? ` ${event.generatedEventType}` : ''}` : '';
    const statusReaction = event.statusTakenDmgP ? ` / 状態反応 +${formatNumber(event.statusTakenDmgP)}%` : '';
    const statusDamageWeakness = event.statusDamageP ? ` / 状態異常弱点 その他倍率 +${formatNumber(event.statusDamageP)}%` : '';
    const hitEvaluation = event.damageEvaluation && Math.abs((Number(event.damageEvaluation.ratio) || 1) - 1) > .0001 ? ` / 時点補正 ×${formatNumber(event.damageEvaluation.ratio)}（基礎 ${formatDamage(event.damageEvaluation.baseExpectedDamage)}）` : '';
    const runtimeBuffValue = formatDpsRuntimeBuffModifiers(event.modifiers) || (event.attackPPerStack ? `物理攻撃力 +${formatNumber(event.attackPPerStack)}%` : '補正適用');
    const cooldownDeltaFrames = Math.abs((Number(event.beforeFrames) || 0) - (Number(event.afterFrames) || 0));
    const cooldownChange = event.operation === 'multiply'
      ? `CT ×${formatNumber(event.multiplier)}`
      : `CT ${Number(event.afterFrames) <= Number(event.beforeFrames) ? '-' : '+'}${formatNumber(cooldownDeltaFrames / 60)}秒`;
    const map = {
      skillTransition: `${action}${variant}へ移行（${formatNumber(event.transitionFrames)}F）`,
      movementStart: `${event.fromActionLabel || ACTION_LABELS[event.fromActionKey] || event.fromActionKey} → ${event.toActionLabel || ACTION_LABELS[event.toActionKey] || event.toActionKey} 移動開始（${formatNumber(event.movementFrames)}F）${event.note ? ` / ${event.note}` : ''}`,
      movementEnd: `${event.toActionLabel || ACTION_LABELS[event.toActionKey] || event.toActionKey}の射程へ移動完了`,
      actionStart: `${action}${variant} 開始`,
      actionEnd: `${action}${variant} 終了`,
      hit: `${action}${variant}${generated} ${event.hitCount > 1 ? `${event.hitCount}ヒット` : 'ヒット'}${event.timingQuality === 'fallbackEnd' ? '（終了時補完）' : ''}${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ''}${hitEvaluation}${statusReaction}`,
      effect: `${action}${variant} 効果発生${event.effectId ? ` / ${event.effectId}` : ''}`,
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
      externalEvent: `外部イベント / ${event.reason || event.triggerType || '手動入力'}${event.intervalFrames > 0 ? ` / ${formatNumber(event.occurrence)}回目` : ''}`,
      statusApplied: `${event.status}付与 / ${formatNumber(event.stackCount)}/${formatNumber(event.maxStacks)}スタック / ${formatNumber(event.durationFrames / 60)}秒`,
      statusTick: `${event.status}ダメージ / ${formatNumber(event.stackCount)}スタック${event.expectedDamage > 0 ? ` / 期待 ${formatDamage(event.expectedDamage)}` : ' / ダメージ未評価'}${hitEvaluation}${statusReaction}${statusDamageWeakness}`,
      statusExpired: `${event.status}終了 / 残り${formatNumber(event.stackCount)}スタック`
    };
    return map[event.type] || `${action}${action ? ' / ' : ''}${event.label || event.type || 'イベント'}`;
  }
  function renderDpsTimelineContent(single = {}, visibleLimit = 160) {
    const timeline = Array.isArray(single?.timeline) ? single.timeline : [];
    const visible = timeline.slice(0, Math.max(160, visibleLimit));
    const remaining = Math.max(0, timeline.length - visible.length);
    const more = remaining ? `<div class="fdc-dps-timeline-more"><span>${formatNumber(visible.length)} / ${formatNumber(timeline.length)}件を表示</span><button type="button" data-fdcp-timeline-more>続きを${formatNumber(Math.min(100, remaining))}件表示</button></div>` : '';
    const timelineStats = single?.timelineStats || {};
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
      const percent = values?.percentChange === null ? '基準0' : formatSignedPercent(values?.percentChange);
      const className = values?.difference > 0 ? 'is-comparison-up' : values?.difference < 0 ? 'is-comparison-down' : 'is-comparison-change';
      return { label, value: `${before} → ${after} / ${difference}${percent ? `（${percent}）` : ''}`, className };
    });
  }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
  function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#96;'); }
  function drawDamageGraph(canvas, series) {
    const context = canvas?.getContext?.('2d'); if (!context) return;
    const width = canvas.width; const height = canvas.height; context.clearRect(0, 0, width, height); context.fillStyle = '#151a26'; context.fillRect(0, 0, width, height);
    if (!series.length) { context.fillStyle = '#aebbd2'; context.font = '14px sans-serif'; context.fillText('計算後に単一seedの累積ダメージを表示します。', 20, 30); return; }
    let total = 0; const points = series.map(item => ({ frame: Number(item.frame) || 0, total: total += Number(item.expectedDamage) || 0 })); const maxFrame = Math.max(1, points.at(-1).frame); const maxTotal = Math.max(1, total); const pad = 22;
    context.strokeStyle = '#3a465e'; context.lineWidth = 1; context.beginPath(); context.moveTo(pad, height - pad); context.lineTo(width - pad, height - pad); context.stroke(); context.strokeStyle = '#79a7ff'; context.lineWidth = 2; context.beginPath(); points.forEach((point, index) => { const x = pad + point.frame / maxFrame * (width - pad * 2); const y = height - pad - point.total / maxTotal * (height - pad * 2); if (index) context.lineTo(x, y); else context.moveTo(x, y); }); context.stroke();
  }
  function drawSparkline(canvas, series) {
    const context = canvas?.getContext?.('2d'); if (!context) return;
    const width = canvas.width; const height = canvas.height; context.clearRect(0, 0, width, height);
    if (!series.length) return;
    let total = 0; const points = series.map(item => ({ frame: Number(item.frame) || 0, total: total += Number(item.expectedDamage) || 0 }));
    const maxFrame = Math.max(1, points.at(-1).frame); const maxTotal = Math.max(1, total); const pad = 3;
    context.strokeStyle = '#87aaff'; context.lineWidth = 1.8; context.beginPath(); points.forEach((point, index) => { const x = pad + point.frame / maxFrame * (width - pad * 2); const y = height - pad - point.total / maxTotal * (height - pad * 2); if (index) context.lineTo(x, y); else context.moveTo(x, y); }); context.stroke();
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
        const worker = new Worker('dps-simulator-worker.js?v=20260827m');
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
    PrototypeDpsController, applyDpsRuntimeEffectOverrides, axesMatch, createDpsBottomBreakdown, createDpsComparison, createDpsDetailComparisonRows, createDpsInputFingerprint, createDpsInputProjection, createDpsSnapshotWithRuntimeOverrides, createRunCancellation, formatDpsTimelineEvent, formatSignedDamage, formatSignedPercent, getAutoRunCompletionFingerprint, getAutoRunDecision, getBaselineComparisonDecision, getDpsActionEffectState, getDpsApplicableActionEffects, getDpsDetailStatusLabel, getDpsFloatOutsideClickAction, getDpsRuntimeEffectOverride, getDpsTabAvailability, getDpsTargetChangeTransition, getExclusiveFloatState, getNativeFloatSyncState, getSnapshotFreshness, getTrialSummary, isRunCancelledError, renderDpsActionEffectContent, renderDpsRuntimeEffectControls, renderDpsTimelineContent, shouldApplyRunResult, stableStringify, runSimulationWorker
  });
  if (typeof document !== 'undefined') init();
})();
