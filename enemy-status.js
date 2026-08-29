(() => {
  'use strict';

  const presets = typeof ENEMY_PRESETS === 'undefined' ? {} : ENEMY_PRESETS;
  const entries = Object.entries(presets).filter(([key, preset]) => !isHiddenPreset(key, preset));
  const entryKeys = new Set(entries.map(([key]) => key));
  const el = {
    search: document.getElementById('enemy-status-search'),
    group: document.getElementById('enemy-status-group'),
    count: document.getElementById('enemy-status-count'),
    list: document.getElementById('enemy-status-list'),
    detail: document.getElementById('enemy-status-detail'),
    theme: document.getElementById('enemy-status-theme')
  };
  const params = new URLSearchParams(location.search);
  const initialKey = entryKeys.has(params.get('preset')) ? params.get('preset') : entries[0]?.[0] || '';
  const state = {
    key: initialKey,
    phase: Math.max(0, Number(params.get('phase')) || 0),
    query: '',
    group: 'all'
  };
  const numberFormat = new Intl.NumberFormat('ja-JP');

  initTheme();
  renderGroupOptions();
  bindEvents();
  render();

  function bindEvents() {
    el.search?.addEventListener('input', () => {
      state.query = el.search.value.trim().toLocaleLowerCase('ja');
      renderList();
    });
    el.group?.addEventListener('change', () => {
      state.group = el.group.value || 'all';
      renderList();
    });
    el.list?.addEventListener('click', event => {
      const button = event.target.closest('[data-enemy-key]');
      if (!button) return;
      state.key = button.dataset.enemyKey || '';
      state.phase = 0;
      updateUrl();
      render();
    });
    el.detail?.addEventListener('change', event => {
      if (!event.target.matches('[data-enemy-phase]')) return;
      state.phase = Math.max(0, Number(event.target.value) || 0);
      updateUrl();
      renderDetail();
      renderList();
    });
    el.theme?.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('trickcal_theme', next); } catch {}
    });
  }

  function render() {
    renderList();
    renderDetail();
  }

  function renderList() {
    const filtered = entries.filter(([key, preset]) => {
      if (state.group !== 'all' && getPresetGroup(key, preset) !== state.group) return false;
      if (!state.query) return true;
      return getEnemyPresetSearchText(preset, key).toLocaleLowerCase('ja').includes(state.query);
    });
    if (el.count) el.count.textContent = `${filtered.length} / ${entries.length}件`;
    if (!el.list) return;
    el.list.innerHTML = filtered.length ? filtered.map(([key, preset]) => {
      const selected = key === state.key;
      const phase = selected ? getPhase(preset, state.phase) : null;
      const scaled = scalePreset(preset, phase);
      const metadata = getEnemyPresetMetadata(preset, key);
      const selectionContext = [metadata.selectionContentLabel, metadata.modeLabel, metadata.difficultyLabel, metadata.worldLabel, metadata.stageLabel].filter(Boolean).join(' ');
      return `
        <button type="button" class="enemy-list-button${selected ? ' is-selected' : ''}" data-enemy-key="${escapeAttr(key)}" aria-pressed="${selected}">
          <span class="enemy-list-name">${escapeHtml(metadata.name || key)}</span>
          <span class="enemy-list-meta">
            ${selectionContext ? `<span class="enemy-list-context">${escapeHtml(selectionContext)}</span>` : ''}
            ${metadata.personality ? `<span>${escapeHtml(metadata.personality)}</span>` : ''}
            ${metadata.sizeLabel ? `<span>${escapeHtml(metadata.sizeLabel)}</span>` : ''}
            <span>${formatDamageType(preset.dmgType)}</span>
            <span>HP ${formatNumber(scaled.hp)}</span>
            ${preset.phases?.length ? `<span>${escapeHtml(phase?.name || `${preset.phases.length} phases`)}</span>` : ''}
          </span>
        </button>`;
    }).join('') : '<div class="empty-state">該当する敵がありません。</div>';
  }

  function renderDetail() {
    if (!el.detail) return;
    const preset = presets[state.key];
    if (!preset) {
      el.detail.innerHTML = '<div class="empty-state">敵プリセットを選択してください。</div>';
      return;
    }
    const phases = Array.isArray(preset.phases) ? preset.phases : [];
    state.phase = Math.min(state.phase, Math.max(0, phases.length - 1));
    const phase = getPhase(preset, state.phase);
    const scaled = scalePreset(preset, phase);
    const metadata = getEnemyPresetMetadata(preset, state.key);
    const ruleLabels = formatContentRules(metadata.rules);
    const weakness = formatWeakness(preset.weakness);
    const modifiers = formatModifiers(preset.modifiers);
    const contextItems = [
      { label: metadata.selectionContentLabel, primary: true, title: metadata.contentLabel || metadata.selectionContentLabel },
      { label: metadata.modeLabel },
      { label: metadata.difficultyLabel },
      { label: metadata.worldLabel },
      { label: metadata.stageLabel }
    ].filter(item => item.label);
    const attackValue = preset.dmgType === 'mag' ? scaled.atk_m : scaled.atk_p;
    const [specialInteger, specialDecimal] = formatNumber(scaled.special).split('.');
    const stats = [
      ['HP', scaled.hp, 'hp'],
      ['攻撃', attackValue, 'attack'],
      ['物理防御', scaled.def_p, 'defense'],
      ['魔法防御', scaled.def_m, 'defense'],
      ['会心', scaled.crit, 'critical'],
      ['会心DMG', scaled.critDmg, 'critical'],
      ['会心抵抗', scaled.critRes, 'resist'],
      ['会心DMG抵抗', scaled.critDmgRes, 'resist']
    ];
    const skills = Array.isArray(preset.skills) ? preset.skills : [];
    el.detail.innerHTML = `
      <div class="detail-head">
        <div>
          <h2>${escapeHtml(metadata.name || state.key)}</h2>
          ${contextItems.length ? `<div class="detail-context" aria-label="敵の分類">${contextItems.map(item => `<span class="detail-context-item${item.primary ? ' is-primary' : ''}"${item.title ? ` title="${escapeAttr(item.title)}"` : ''}>${escapeHtml(item.label)}</span>`).join('')}</div>` : ''}
          <div class="detail-chips">
            ${metadata.personality ? `<span class="detail-chip">${escapeHtml(metadata.personality)}</span>` : ''}
            ${metadata.sizeLabel ? `<span class="detail-chip">${escapeHtml(metadata.sizeLabel)}</span>` : ''}
            <span class="detail-chip ${preset.dmgType === 'mag' ? 'is-magic' : 'is-physical'}">${formatDamageType(preset.dmgType)}</span>
            ${weakness.map(item => `<span class="detail-chip">${escapeHtml(item)}</span>`).join('')}
            ${phases.length ? `<span class="detail-chip">${phases.length}フェーズ</span>` : ''}
          </div>
        </div>
        ${phases.length ? `
          <label class="phase-control">
            <span>フェーズ</span>
            <select class="phase-select" data-enemy-phase>
              ${phases.map((item, index) => `<option value="${index}"${index === state.phase ? ' selected' : ''}>${escapeHtml(item.name || `Phase ${index + 1}`)}</option>`).join('')}
            </select>
          </label>` : ''}
      </div>
      <div class="stat-table-wrap">
        <table class="stat-table" aria-label="敵ステータス">
          <tbody>${stats.map(([label, value, tone]) => `
            <tr>
              <th scope="row" class="stat-label">${label}</th>
              <td class="stat-value" data-tone="${tone}">${formatNumber(value)}</td>
            </tr>`).join('')}</tbody>
        </table>
      </div>
      ${ruleLabels.length ? `
        <div class="detail-rules" aria-label="ステージ設定">
          ${ruleLabels.map(label => `<span class="detail-rule">${escapeHtml(label)}</span>`).join('')}
        </div>` : ''}
      ${modifiers.length ? `
        <section class="detail-section">
          <h3>固有バフ/デバフ</h3>
          <div class="note-list">${modifiers.map(item => `<span class="note-item">${escapeHtml(item)}</span>`).join('')}</div>
        </section>` : ''}
      <div class="enemy-special-modifier" aria-label="敵用補正">
        <span class="enemy-special-modifier-label">敵用補正</span>
        <strong class="enemy-special-modifier-value"><span class="enemy-special-modifier-integer">${escapeHtml(specialInteger)}</span>${specialDecimal ? `<span class="enemy-special-modifier-fraction">.${escapeHtml(specialDecimal)}</span>` : ''}<span class="enemy-special-modifier-unit">%</span></strong>
      </div>
      <section class="detail-section">
        <h3>行動・スキル倍率</h3>
        ${skills.length ? `
          <div class="table-wrap">
            <table>
              <thead><tr><th>種別</th><th>行動名</th><th>倍率</th><th>補足</th></tr></thead>
              <tbody>${skills.map(skill => `
                <tr>
                  <td class="skill-action">${escapeHtml(skill.action || '攻撃')}</td>
                  <td>${escapeHtml(skill.name || '-')}</td>
                  <td class="skill-mult">${formatPlainNumber(skill.mult)}%</td>
                  <td class="skill-note">${escapeHtml(skill.note || '')}</td>
                </tr>`).join('')}</tbody>
            </table>
          </div>` : '<div class="note-item">登録されたスキルはありません。</div>'}
      </section>`;
  }

  function getPhase(preset, index) {
    const phases = Array.isArray(preset?.phases) ? preset.phases : [];
    return phases[Math.min(Math.max(0, index), Math.max(0, phases.length - 1))] || null;
  }

  function scalePreset(preset, phase) {
    if (!phase) return { ...preset };
    const result = { ...preset };
    const multiplier = Number(phase.mult) || 1;
    (phase.scaleStats || []).forEach(key => {
      result[key] = Math.round((Number(preset[key]) || 0) * multiplier);
    });
    return result;
  }

  function getPresetGroup(key, preset) {
    const metadata = getEnemyPresetMetadata(preset, key);
    return metadata.type === 'dungeon' && metadata.mode ? `dungeon:${metadata.mode}` : metadata.type || 'other';
  }

  function isHiddenPreset(key, preset) {
    return `${key} ${preset?.name || ''}`.toLocaleLowerCase('en-US').includes('dummy');
  }

  function formatContentRules(rules = {}) {
    return [
      rules.fixedGrade ? `${rules.fixedGrade}年生固定` : '',
      rules.disabledEffectSources?.includes('synergy') ? 'シナジー無効' : '',
      rules.disabledEffectSources?.includes('spell') ? 'スペル使用不可' : '',
      rules.artifactLimit ? `遺物上限 ${rules.artifactLimit}` : ''
    ].filter(Boolean);
  }

  function renderGroupOptions() {
    if (!el.group) return;
    const groups = new Map();
    entries.forEach(([key, preset]) => {
      const metadata = getEnemyPresetMetadata(preset, key);
      const group = metadata.type === 'dungeon' && metadata.mode ? `dungeon:${metadata.mode}` : metadata.type || 'other';
      const label = metadata.type === 'dungeon'
        ? metadata.modeLabel || metadata.contentLabel || 'その他'
        : metadata.contentShortLabel || metadata.contentLabel || 'その他';
      groups.set(group, label);
    });
    el.group.innerHTML = [
      '<option value="all">すべて</option>',
      ...Array.from(groups, ([value, label]) => `<option value="${escapeAttr(value)}">${escapeHtml(label)}</option>`)
    ].join('');
  }

  function formatWeakness(weakness = {}) {
    return Object.entries(weakness || {}).map(([key, value]) => {
      if (key === 'statusDamage') return `状態異常ダメージ弱点 その他倍率+${formatPlainNumber(value?.otherP)}%`;
      if (key === 'statusTakenDamage') return `${value?.status || '状態'}状態弱点 被ダメージ量+${formatPlainNumber(value?.add)}%`;
      const label = key === 'phys' ? '物理弱点' : key === 'mag' ? '魔法弱点' : `${key}弱点`;
      return `${label} +${formatPlainNumber(value?.add)}%`;
    });
  }

  function formatModifiers(modifiers = {}) {
    const labels = {
      anger: '怒り',
      takenDmg: '被ダメージ',
      painTakenDmg: '苦痛被ダメージ',
      breakTakenDmg: '破壊被ダメージ'
    };
    const groups = {
      buffs: '敵バフ',
      debuffs: '敵側',
      targetDebuffs: '対象側'
    };
    const result = [];
    Object.entries(modifiers || {}).forEach(([groupKey, values]) => {
      Object.entries(values || {}).forEach(([key, value]) => {
        if (key === 'anger' && value && typeof value === 'object') {
          const perStack = Number(value.perStack) || 0;
          const maxStacks = Math.max(0, Number(value.maxStacks) || 0);
          result.push(`${groups[groupKey] || groupKey}: ${labels[key]} 1スタックごとに与ダメージ+${formatPlainNumber(perStack)}% / 最大${maxStacks}スタック (+${formatPlainNumber(perStack * maxStacks)}%)`);
          return;
        }
        if (key === 'breakTakenDmg' && value && typeof value === 'object') {
          const perStack = Number(value.perStack) || 0;
          const maxStacks = Math.max(0, Number(value.maxStacks) || 0);
          result.push(`${groups[groupKey] || groupKey}: 破壊 1スタックごとに被ダメージ量+${formatPlainNumber(perStack)}% / 最大${maxStacks}スタック (+${formatPlainNumber(perStack * maxStacks)}%)`);
          return;
        }
        result.push(`${groups[groupKey] || groupKey}: ${labels[key] || key} ${formatSignedPercent(value)}`);
      });
    });
    return result;
  }

  function formatDamageType(value) {
    return value === 'mag' ? '魔法攻撃' : value === 'phys' ? '物理攻撃' : '攻撃種別不明';
  }

  function formatNumber(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '-';
    return Number.isInteger(numeric) ? numberFormat.format(numeric) : formatPlainNumber(numeric);
  }

  function formatPlainNumber(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '0';
    return numeric.toLocaleString('ja-JP', { maximumFractionDigits: 3 });
  }

  function formatSignedPercent(value) {
    const numeric = Number(value) || 0;
    return `${numeric > 0 ? '+' : ''}${formatPlainNumber(numeric)}%`;
  }

  function updateUrl() {
    const next = new URL(location.href);
    if (state.key) next.searchParams.set('preset', state.key);
    else next.searchParams.delete('preset');
    if (state.phase) next.searchParams.set('phase', String(state.phase));
    else next.searchParams.delete('phase');
    history.replaceState(null, '', next);
  }

  function initTheme() {
    let theme = 'dark';
    try { theme = localStorage.getItem('trickcal_theme') || 'dark'; } catch {}
    applyTheme(theme === 'light' ? 'light' : 'dark');
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (el.theme) {
      el.theme.setAttribute('aria-pressed', String(theme !== 'light'));
      el.theme.setAttribute('aria-label', theme === 'light' ? 'ダークモードに切替' : 'ライトモードに切替');
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
