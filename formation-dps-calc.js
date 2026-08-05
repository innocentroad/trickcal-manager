(() => {
  'use strict';

  const el = {
    lab: document.getElementById('fdc-dps-lab'),
    duration: document.getElementById('fdc-dps-duration'),
    highMode: document.getElementById('fdc-dps-high-mode'),
    initialDelay: document.getElementById('fdc-dps-initial-delay'),
    seed: document.getElementById('fdc-dps-seed'),
    run: document.getElementById('fdc-dps-run'),
    targetNote: document.getElementById('fdc-dps-target-note'),
    status: document.getElementById('fdc-dps-status'),
    summary: document.getElementById('fdc-dps-summary'),
    timeline: document.getElementById('fdc-dps-timeline')
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

  el.run?.addEventListener('click', runSimulation);
  [el.duration, el.highMode, el.initialDelay, el.seed].forEach(input => input?.addEventListener('change', runSimulation));
  window.addEventListener('trickcal:damage-calculator-rendered', scheduleRun);

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
    if (!snapshot.apostle || !timing) {
      renderError(`${snapshot.targetName || '選択使徒'}のスキル速度データがありません。`);
      return;
    }
    const config = simulator.buildCombatantConfig(snapshot.apostle, timing);
    const initialDelaySeconds = Math.max(0, Number(el.initialDelay?.value) || 0);
    const result = simulator.simulate(config, {
      durationSeconds: Number(el.duration?.value) || 60,
      highSkillMode: el.highMode?.value || 'disabled',
      initialActionDelayFrames: initialDelaySeconds * 60,
      seed: Number(el.seed?.value) || 1
    });
    renderSimulation(snapshot, timing, config, result, timingData);
  }

  function renderError(message) {
    el.targetNote.textContent = message;
    el.status.textContent = '';
    el.summary.innerHTML = '';
    el.timeline.innerHTML = `<p class="fdc-dps-empty">${escapeHtml(message)}</p>`;
  }

  function renderSimulation(snapshot, timing, config, result, timingData) {
    el.targetNote.textContent = `${snapshot.targetName} / ゲーム内${formatNumber(result.durationSeconds)}秒`;
    const warnings = [...(timingData.warnings || []), ...(result.warnings || [])];
    el.status.textContent = warnings.length
      ? `暫定データ: ${warnings.length}件の確認事項があります。`
      : '速度・発生フレームの暫定データで計算しています。';
    el.status.classList.toggle('has-warning', warnings.length > 0);

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
        <strong>${formatNumber(config.normalAttackIntervalFrames)}F</strong>
        <small>実測${formatNumber(timing.measuredNormalAttackIntervalFrames)}F × 1.3</small>
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

  function renderTimelineRow(event) {
    const action = event.actionLabel || '';
    const variant = event.variant ? ` / ${event.variant}` : '';
    const map = {
      actionStart: `${action}${variant} 開始`,
      actionEnd: `${action}${variant} 終了`,
      hit: `${action}${variant} ${event.hitCount > 1 ? `${event.hitCount}ヒット` : 'ヒット'}${event.timingQuality === 'fallbackEnd' ? '（終了時補完）' : ''}`,
      effect: `${action}${variant} 効果発生${event.effectId ? ` / ${event.effectId}` : ''}`,
      spRecovery: event.capped
        ? `SP回復周期 / 上限 ${formatNumber(event.sp)}`
        : `SP +${formatNumber(event.amount)} → ${formatNumber(event.sp)}`,
      lowSkillReady: `低学年発動可能 / SP ${formatNumber(event.sp)}`
    };
    return `
      <div class="fdc-dps-timeline-row type-${escapeAttr(event.type)}">
        <time>${formatNumber(event.frame)}F <small>${formatNumber(event.frame / 60)}秒</small></time>
        <span>${escapeHtml(map[event.type] || event.type)}</span>
      </div>
    `;
  }

  function formatNumber(value) {
    const number = Number(value) || 0;
    return Number.isInteger(number) ? number.toLocaleString('ja-JP') : number.toFixed(2).replace(/\.?0+$/, '');
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
