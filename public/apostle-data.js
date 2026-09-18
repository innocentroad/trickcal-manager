(() => {
  'use strict';

  const DATA = window.TRICKCAL_STAT_DATA || { sheets: {} };
  const SHEETS = DATA.sheets || {};
  const basicRows = Array.isArray(SHEETS.basicInfo) ? SHEETS.basicInfo : [];
  const equipmentRows = new Map((SHEETS.equipment || []).map(row => [String(row.id), row]));
  const asideRows = new Map((SHEETS.asideTiers || []).map(row => [String(row.id), row]));
  const rankRows = new Map((SHEETS.rankGlobalBonuses || []).map(row => [String(row.id), row]));
  const boardRows = new Map();
  (SHEETS.board || []).forEach(row => {
    const id = String(row.id || '');
    if (!boardRows.has(id)) boardRows.set(id, []);
    boardRows.get(id).push(row);
  });

  const VIEWS = Object.freeze({
    basic: { title: '基礎設定', note: '', caption: '使徒の基礎設定一覧' },
    equipment: { title: '装備等級', note: '', caption: '使徒ごとの装備等級一覧' },
    board: { title: 'ボード等級', note: '実マス値と対応表から一意に判定できた等級だけを表示します。', caption: '使徒ごとのボード等級一覧' },
    aside: { title: 'アサイド等級', note: '', caption: '使徒ごとのアサイド等級一覧' },
    rank: { title: 'Rank全体効果', note: '選択したRank遷移の増分を表示します。累積値ではありません。', caption: '使徒ごとのRank全体効果一覧' }
  });
  const VIEW_KEYS = Object.freeze(Object.keys(VIEWS));
  const APOSTLE_ASSET_ALIASES = Object.freeze({
    ED: 'Ed', Cuee: 'Kyuri', Kyui: 'Kyuri', Kyuui: 'Kyuri', Kiwi: 'Kyuri',
    Lazy: 'Layze', Razy: 'Layze', Reizy: 'Layze', Rudd: 'Rude', Selline: 'Selene',
    Shady: 'Shaydi', RenewaAwaken: 'Renewa', Sion: 'Xion', sion: 'Xion',
    xion: 'Xion', xXionx: 'Xion'
  });
  const EQUIPMENT_COLUMNS = Object.freeze([
    { key: 'HP', label: 'HP', lookup: 'HP' },
    { key: '物理攻撃', label: '物理攻撃', lookup: '物理攻撃力' },
    { key: '魔法攻撃', label: '魔法攻撃', lookup: '魔法攻撃力' },
    { key: '物理防御', label: '物理防御', lookup: '物理防御力' },
    { key: '魔法防御', label: '魔法防御', lookup: '魔法防御力' },
    { key: '会心/会心DMG', label: '会心・会心DMG', lookup: '会心/会心DMG' },
    { key: '会心抵抗/会心DMG抵抗', label: '会心抵抗・会心DMG抵抗', lookup: '会心抵抗/会心DMG抵抗' }
  ]);
  const ASIDE_COLUMNS = Object.freeze([
    { key: 'HP', label: 'HP', type: 'HP', value: 'HP' },
    { key: 'physicalAttack', label: '物理攻撃', type: '物理攻撃力', value: '物理攻撃力' },
    { key: 'magicAttack', label: '魔法攻撃', type: '魔法攻撃力', value: '魔法攻撃力' },
    { key: 'physicalDefense', label: '物理防御', type: '物理防御力', value: '物理防御力' }
  ]);
  const BASIC_TIER_COLUMNS = Object.freeze([
    { key: 'hpTier', label: 'HP等級', dataKey: 'HPTier' },
    { key: 'physicalAttackTier', label: '物理攻撃力等級', dataKey: '物理攻撃力Tier', attack: true },
    { key: 'magicAttackTier', label: '魔法攻撃力等級', dataKey: '魔法攻撃力Tier', attack: true },
    { key: 'physicalDefenseTier', label: '物理防御力等級', dataKey: '物理防御力Tier' },
    { key: 'magicDefenseTier', label: '魔法防御力等級', dataKey: '魔法防御力Tier' },
    { key: 'critTier', label: '会心等級', dataKey: '会心Tier' },
    { key: 'critDmgTier', label: '会心DMG等級', dataKey: '会心DMGTier' },
    { key: 'critResTier', label: '会心抵抗等級', dataKey: '会心抵抗Tier' },
    { key: 'critDmgResTier', label: '会心DMG抵抗等級', dataKey: '会心DMG抵抗Tier' }
  ]);
  const BASIC_COMBAT_COLUMNS = Object.freeze([
    { key: 'combatPowerA', label: '戦闘力補正値A', dataKey: '戦闘力補正値A' },
    { key: 'combatPowerB', label: '戦闘力補正値B', dataKey: '戦闘力補正値B' }
  ]);
  const BOARD_COLUMNS = Object.freeze([
    { key: 'hp', label: 'HP', effect: 'HP', group: 'hp' },
    { key: 'attack', label: '攻撃力', effect: 'attack', group: 'attack' },
    { key: 'physicalDefense', label: '物理防御', effect: '物理防御力', group: 'defense' },
    { key: 'magicDefense', label: '魔法防御', effect: '魔法防御力', group: 'defense' },
    { key: 'crit', label: '会心', effect: '会心', group: 'crit' },
    { key: 'critDmg', label: '会心DMG', effect: '会心DMG', group: 'crit' },
    { key: 'critRes', label: '会心抵抗', effect: '会心抵抗', group: 'crit' },
    { key: 'critDmgRes', label: '会心DMG抵抗', effect: '会心DMG抵抗', group: 'crit' }
  ]);
  // board-layout-preview.js の既存対応表を、UI用fallbackを含めずに参照する。
  const BOARD_TIER_VALUES = Object.freeze({
    hp: { 1: [50, 99], 2: [71, 141], 3: [92, 183], 4: [113, 225], 5: [134, 267] },
    attack: { 1: [5, 11], 2: [5, 12], 3: [6, 13], 4: [7, 14], 5: [7, 15] },
    defense: { 1: [11, 21], 2: [12, 24], 3: [13, 26], 4: [14, 28], 5: [15, 31] },
    crit: { 1: [8, 16], 2: [9, 17], 3: [10, 19], 4: [11, 21], 5: [12, 22] }
  });
  const elements = {
    search: document.getElementById('apostle-data-search'),
    filters: Array.from(document.querySelectorAll('[data-apostle-filter]')),
    filterDetails: document.querySelector('[data-apostle-filter-details]'),
    filterToggle: document.getElementById('apostle-data-filter-toggle'),
    filterSummary: document.querySelector('[data-apostle-filter-summary]'),
    clearFilters: document.getElementById('apostle-data-filter-clear'),
    count: document.getElementById('apostle-data-count'),
    title: document.querySelector('[data-apostle-view-title]'),
    viewHeading: document.querySelector('[data-apostle-view-heading]'),
    note: document.getElementById('apostle-data-view-note'),
    status: document.getElementById('apostle-data-status-summary'),
    options: document.getElementById('apostle-data-view-options'),
    caption: document.querySelector('[data-apostle-caption]'),
    thead: document.querySelector('[data-apostle-thead]'),
    tbody: document.querySelector('[data-apostle-tbody]'),
    table: document.querySelector('[data-apostle-table]'),
    tableWrap: document.querySelector('[data-apostle-table-wrap]'),
    bottom: document.querySelector('[data-apostle-bottom-bar]'),
    equipmentDialog: document.getElementById('apostle-data-equipment-dialog'),
    equipmentDialogBody: document.querySelector('[data-apostle-equipment-dialog-body]'),
    equipmentDialogClose: document.querySelector('[data-apostle-equipment-dialog-close]')
  };
  let equipmentDialogOpener = null;
  const state = {
    view: readView(),
    search: '',
    filters: { personality: '', species: '', role: '', attackType: '', column: '' },
    equipmentRank: readNumberParam('rank', 1),
    rankFrom: readNumberParam('rankFrom', 1),
    rankTo: readNumberParam('rankTo', 2),
    asideExpanded: false,
    sort: Object.fromEntries(VIEW_KEYS.map(view => [view, { key: 'name', direction: 'asc' }]))
  };

  function readView() {
    const value = new URLSearchParams(window.location.search).get('view');
    return VIEW_KEYS.includes(value) ? value : 'basic';
  }

  function readNumberParam(key, fallback) {
    const value = Number(new URLSearchParams(window.location.search).get(key));
    return Number.isInteger(value) && value > 0 ? value : fallback;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  }

  function formatNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString('ja-JP') : '—';
  }

  function formatRawValue(value) {
    return value === null || value === undefined || cleanText(value) === '' ? '—' : cleanText(value);
  }

  function cleanText(value) {
    return String(value ?? '').trim();
  }

  function isAttackEffectType(value) {
    return /(?:物理|魔法)(?:攻撃|攻撃力)|(?:物攻|魔攻)/.test(cleanText(value));
  }

  function isHiddenAttackValue(value) {
    return value === null || value === undefined || cleanText(value) === '' || Number(value) === 0;
  }

  function basicDisplayValue(value, column) {
    if (column.attack && isHiddenAttackValue(value)) return emptyCell();
    if (column.dataKey.startsWith('戦闘力補正値')) return escapeHtml(formatRawValue(value));
    return escapeHtml(formatNumber(value));
  }

  function emptyCell() {
    return '<span class="apostle-data-empty-cell" aria-hidden="true"></span>';
  }

  function assetUrl(relativePath) {
    const value = String(relativePath || '').replace(/^\.\//, '');
    try {
      const configured = window.TRICKCAL_PUBLIC_SITE?.assetUrl?.(value);
      if (configured) return configured;
    } catch (_) { /* source fallback */ }
    return `../${value}`;
  }

  function routeUrl(routeKey, fallback, params = {}) {
    let href = '';
    try { href = window.TRICKCAL_PUBLIC_SITE?.pageUrl?.(routeKey) || ''; } catch (_) { /* source fallback */ }
    if (!href) href = fallback;
    try {
      const url = new URL(href, window.location.href);
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
      return `${url.pathname}${url.search}${url.hash}`;
    } catch (_) {
      return href;
    }
  }

  function apostleAssetId(id) {
    return APOSTLE_ASSET_ALIASES[id] || id;
  }

  function apostleCell(row, link = false) {
    const id = cleanText(row.basic.id);
    const name = cleanText(row.basic.使徒名) || '名称未登録';
    const content = `
      <span class="apostle-data-apostle-image-wrap">
        <img data-apostle-data-image src="${escapeHtml(assetUrl(`img/Chara/${apostleAssetId(id)}.webp`))}" alt="${escapeHtml(name)}">
        <span class="is-missing" data-apostle-data-image-fallback hidden>画像なし</span>
      </span>
      <span class="apostle-data-apostle-name"><strong>${escapeHtml(name)}</strong></span>`;
    const body = `<span class="apostle-data-apostle-cell">${content}</span>`;
    return link
      ? `<a class="apostle-data-link" href="${escapeHtml(routeUrl('board', '../board-layout-preview.html', { apostle: id }))}">${body}</a>`
      : body;
  }

  function makeRow(basic, index) {
    return {
      basic,
      index,
      equipment: equipmentRows.get(String(basic.id)) || null,
      aside: asideRows.get(String(basic.id)) || null,
      rank: rankRows.get(String(basic.id)) || null,
      board: boardRows.get(String(basic.id)) || []
    };
  }

  const rows = basicRows.map(makeRow);
  const rankList = getRankTransitions();
  const equipmentRanks = getEquipmentRanks();

  function getEquipmentRanks() {
    const ranks = new Set();
    equipmentRows.forEach(row => Object.keys(row).forEach(key => {
      const match = key.match(/^Equip_Rank(\d+)_/);
      if (match) ranks.add(Number(match[1]));
    }));
    return Array.from(ranks).sort((a, b) => a - b);
  }

  function getRankTransitions() {
    const transitions = new Map();
    rankRows.forEach(row => Object.keys(row).forEach(key => {
      const match = key.match(/^Rank(\d+)to(\d+)_type1$/);
      if (match) transitions.set(`${match[1]}-${match[2]}`, { from: Number(match[1]), to: Number(match[2]) });
    }));
    return Array.from(transitions.values()).sort((a, b) => a.from - b.from);
  }

  function populateFilters() {
    const options = {
      personality: '性格', species: '種族', role: '役割', attackType: '攻撃Type', column: '配置列'
    };
    elements.filters.forEach(select => {
      const key = select.dataset.apostleFilter;
      const values = Array.from(new Set(rows.map(row => cleanText(row.basic[options[key]])).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, 'ja'));
      select.innerHTML = `<option value="">すべて</option>${values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}`;
      select.value = state.filters[key] || '';
    });
  }

  function getFilteredRows() {
    const search = state.search.trim().toLocaleLowerCase();
    const keys = { personality: '性格', species: '種族', role: '役割', attackType: '攻撃Type', column: '配置列' };
    return rows.filter(row => {
      const basic = row.basic;
      const haystack = `${cleanText(basic.id)} ${cleanText(basic.使徒名)}`.toLocaleLowerCase();
      if (search && !haystack.includes(search)) return false;
      return Object.entries(keys).every(([filterKey, dataKey]) => !state.filters[filterKey] || cleanText(basic[dataKey]) === state.filters[filterKey]);
    });
  }

  function hasActiveFilters() {
    return Boolean(state.search.trim() || Object.values(state.filters).some(value => value));
  }

  function syncFilterSummary() {
    const active = hasActiveFilters();
    if (elements.filterSummary) {
      elements.filterSummary.hidden = !active;
      elements.filterSummary.textContent = active ? '絞り込み中' : '';
    }
    if (elements.clearFilters) elements.clearFilters.hidden = !active;
  }

  function syncFilterDisclosure() {
    if (!elements.filterDetails) return;
    const open = elements.filterDetails.open;
    elements.filterToggle?.setAttribute('aria-expanded', String(open));
  }

  function normalizeBoardEffect(column, basic) {
    return column.effect === 'attack'
      ? (cleanText(basic.攻撃タイプ || basic['攻撃Type']) === '魔法' ? '魔法攻撃力' : '物理攻撃力')
      : column.effect;
  }

  function inferBoardTierStatus(boardData, effectType, group) {
    const values = Array.from(new Set(boardData
      .filter(row => cleanText(row.マス_type) === '通常' && cleanText(row.効果1_type) === effectType)
      .map(row => Number(row.効果1_value))
      .filter(Number.isFinite))).sort((a, b) => a - b);
    if (!values.length) return { status: 'unknown', label: '不明', tier: null, values };
    const matches = Object.entries(BOARD_TIER_VALUES[group] || {}).filter(([, pair]) => {
      return pair[0] === values[0] && pair[1] === values[values.length - 1] && values.every(value => pair.includes(value));
    });
    if (matches.length !== 1) return { status: 'inconsistent', label: '不整合', tier: null, values };
    return { status: 'known', label: `等級${matches[0][0]}`, tier: Number(matches[0][0]), values };
  }

  function boardAssessment(row) {
    return Object.fromEntries(BOARD_COLUMNS.map(column => {
      const effect = normalizeBoardEffect(column, row.basic);
      return [column.key, inferBoardTierStatus(row.board, effect, column.group)];
    }));
  }

  function equipmentIconPath(rank, statGroup, tier) {
    const category = statGroup === '会心/会心DMG' || statGroup === '会心抵抗/会心DMG抵抗'
      ? 'Accessory' : statGroup.includes('攻撃') ? 'Weapon' : 'Armor';
    const base = statGroup === 'HP' || statGroup === '物理攻撃力' || statGroup === '会心/会心DMG'
      ? 0 : statGroup === '魔法攻撃力' || statGroup === '物理防御力' || statGroup === '会心抵抗/会心DMG抵抗'
        ? 5 : statGroup === '魔法防御力' ? 10 : 0;
    const variant = base + (6 - Number(tier));
    return `img/equipicons/Equip_${category}${String(rank).padStart(2, '0')}${String(variant).padStart(2, '0')}.webp`;
  }

  function equipmentValue(row, column, rank) {
    const hideAttack = column.key === '物理攻撃' || column.key === '魔法攻撃';
    if (!row.equipment) return hideAttack ? { status: 'blank', blank: true } : { status: 'unregistered', label: '未登録' };
    const raw = row.equipment[`Equip_Rank${rank}_${column.key}`];
    if (raw === undefined || raw === null || cleanText(raw) === '') {
      return hideAttack ? { status: 'blank', blank: true } : { status: 'unregistered', label: '未登録' };
    }
    const tier = Number(raw);
    if (!Number.isFinite(tier)) return hideAttack ? { status: 'blank', blank: true } : { status: 'unregistered', label: '未登録' };
    if (tier === 0) return hideAttack ? { status: 'blank', blank: true } : { status: 'excluded', label: '対象外', detail: '0' };
    const value = (SHEETS.equipmentValues || []).find(item => Number(item.rank) === rank
      && cleanText(item.statGroup || item.ステータス) === column.lookup && Number(item.tier) === tier);
    return {
      status: value ? 'known' : 'unregistered',
      label: `等級${tier}`,
      detail: value?.equipName || value?.装備名 || '装備定義未登録',
      icon: value ? assetUrl(equipmentIconPath(rank, column.lookup, tier)) : '',
      tier,
      numeric: tier,
      definition: value || null,
      effectType: cleanText(value?.statGroup || value?.ステータス || column.lookup)
    };
  }

  function asideValue(row, column) {
    const hideAttack = column.key === 'physicalAttack' || column.key === 'magicAttack';
    if (!row.aside) return hideAttack ? { status: 'blank', blank: true } : { status: 'unregistered', label: '未登録' };
    if (typeof window.TRICKCAL_PUBLIC_RELEASE?.isAsideEnabled === 'function'
      && !window.TRICKCAL_PUBLIC_RELEASE.isAsideEnabled(row.basic.id)) {
      return hideAttack ? { status: 'blank', blank: true } : { status: 'disabled', label: '非公開' };
    }
    const type = row.aside[`${column.type}タイプ`];
    if (type === undefined || type === null || cleanText(type) === '') {
      return hideAttack ? { status: 'blank', blank: true } : { status: 'unregistered', label: '未登録' };
    }
    if (Number(type) === 0) return hideAttack ? { status: 'blank', blank: true } : { status: 'excluded', label: '対象外', detail: '0' };
    return { status: 'known', label: `等級${type}`, tier: Number(type) };
  }

  function asideSupplement(row, column, suffix) {
    if (!row.aside) return null;
    const value = row.aside[`${column.value}${suffix}`];
    return value === undefined || value === null || cleanText(value) === '' ? null : value;
  }

  function rankEffect(row, index) {
    if (!row.rank) return { status: 'unregistered', type: '', value: null };
    const prefix = `Rank${state.rankFrom}to${state.rankTo}`;
    const type = cleanText(row.rank[`${prefix}_type${index}`]);
    const raw = row.rank[`${prefix}_value${index}`];
    if (!type && (raw === undefined || raw === null || cleanText(raw) === '')) return { status: 'unregistered', type: '', value: null };
    const value = raw === undefined || raw === null || cleanText(raw) === '' ? null : Number(raw);
    if (isAttackEffectType(type) && isHiddenAttackValue(value)) return { status: 'blank', type: '', value: null, blank: true };
    return { status: 'known', type, value: Number.isFinite(value) ? value : raw };
  }

  function cellStack(primary, detail = '', options = {}) {
    if (options.blank) return emptyCell();
    const status = options.status || '';
    const image = options.icon ? `<img data-apostle-data-image src="${escapeHtml(options.icon)}" alt="">` : '';
    const icon = options.icon && options.tierBadge != null
      ? `<span class="apostle-data-icon-wrap">${image}<b class="apostle-data-tier-badge" aria-label="等級${escapeHtml(options.tierBadge)}">${escapeHtml(options.tierBadge)}</b></span>`
      : image;
    const text = options.tierBadge != null && options.icon
      ? (detail ? `<strong>${escapeHtml(detail)}</strong>` : '')
      : `<strong>${escapeHtml(primary)}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ''}`;
    return `<span class="apostle-data-cell-stack${status && status !== 'known' ? ' is-status' : ''}"${status ? ` data-status="${escapeHtml(status)}"` : ''}>${icon}${text}</span>`;
  }

  function equipmentCell(row, column, value) {
    if (value.blank) return emptyCell();
    if (!value.definition || value.status !== 'known') {
      return cellStack(value.label || '未登録', '', { status: value.status });
    }
    const name = value.detail || '装備名未登録';
    const icon = value.icon
      ? `<span class="apostle-data-icon-wrap"><img data-apostle-data-image src="${escapeHtml(value.icon)}" alt=""><span class="is-missing" data-apostle-data-image-fallback hidden>画像なし</span><b class="apostle-data-tier-badge" aria-label="等級${escapeHtml(value.tier)}">${escapeHtml(value.tier)}</b></span>`
      : `<span class="apostle-data-icon-wrap apostle-data-icon-placeholder" aria-hidden="true"><span>画像なし</span><b class="apostle-data-tier-badge" aria-label="等級${escapeHtml(value.tier)}">${escapeHtml(value.tier)}</b></span>`;
    const label = `${name} Rank ${state.equipmentRank} 等級${value.tier}の装備詳細`;
    return `<button type="button" class="apostle-data-equipment-button" data-apostle-equipment-open data-apostle-id="${escapeHtml(row.basic.id)}" data-apostle-equipment-column="${escapeHtml(column.key)}" data-apostle-equipment-rank="${escapeHtml(state.equipmentRank)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${icon}</button>`;
  }

  function headerCell(column) {
    const sortKey = column.sortKey || column.key;
    const active = state.sort[state.view]?.key === sortKey;
    const direction = active ? state.sort[state.view].direction : '';
    return `<th scope="col"><button type="button" class="apostle-data-sort-button" data-apostle-sort="${escapeHtml(sortKey)}" aria-sort="${direction}">${escapeHtml(column.label)}</button></th>`;
  }

  function renderTable(columns, visibleRows, caption, cellBuilder) {
    elements.table.dataset.apostleView = state.view;
    elements.caption.textContent = caption;
    elements.thead.innerHTML = `<tr>${columns.map(headerCell).join('')}</tr>`;
    if (!visibleRows.length) {
      elements.tbody.innerHTML = `<tr><td class="apostle-data-empty" colspan="${columns.length}">条件に一致する使徒はいません。絞り込みを解除してください。</td></tr>`;
      return;
    }
    elements.tbody.innerHTML = visibleRows.map(row => `<tr data-apostle-data-row="${escapeHtml(row.basic.id)}">${cellBuilder(row).map((cell, index) => index === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`).join('')}</tr>`).join('');
  }

  function baseColumns() {
    return [
      { key: 'name', label: '使徒', sortKey: 'name' },
      { key: 'rarity', label: 'レア度' }, { key: 'eldain', label: 'エルダイン' },
      { key: 'personality', label: '性格' }, { key: 'species', label: '種族' },
      { key: 'role', label: '役割' }, { key: 'attackType', label: '攻撃タイプ' },
      { key: 'column', label: '配置列' }, { key: 'initialSP', label: '初期SP' },
      { key: 'spRegen', label: '毎秒SP回復量' },
      ...BASIC_TIER_COLUMNS.map(column => ({ key: column.key, label: column.label })),
      ...BASIC_COMBAT_COLUMNS.map(column => ({ key: column.key, label: column.label }))
    ];
  }

  function renderBasic(visibleRows) {
    const columns = baseColumns();
    renderTable(columns, visibleRows, VIEWS.basic.caption, row => {
      const b = row.basic;
      return [
        apostleCell(row),
        formatNumber(b.レア度),
        cleanText(b.エルダイン) || '—',
        cleanText(b.性格) || '—',
        cleanText(b.種族) || '—',
        cleanText(b.役割) || '—',
        cleanText(b.攻撃Type) || '—',
        cleanText(b.配置列) || '—',
        formatNumber(b.初期SP),
        formatNumber(b.毎秒SP回復量),
        ...BASIC_TIER_COLUMNS.map(column => basicDisplayValue(b[column.dataKey], column)),
        ...BASIC_COMBAT_COLUMNS.map(column => escapeHtml(formatRawValue(b[column.dataKey])))
      ];
    });
  }

  function renderEquipment(visibleRows) {
    const columns = [{ key: 'name', label: '使徒', sortKey: 'name' }, ...EQUIPMENT_COLUMNS.map(column => ({ key: column.key, label: column.label }))];
    renderTable(columns, visibleRows, `${VIEWS.equipment.caption} / Rank ${state.equipmentRank}`, row => [apostleCell(row), ...EQUIPMENT_COLUMNS.map(column => {
      const value = equipmentValue(row, column, state.equipmentRank);
      return equipmentCell(row, column, value);
    })]);
  }

  function renderBoard(visibleRows) {
    const columns = [{ key: 'name', label: '使徒', sortKey: 'name' }, ...BOARD_COLUMNS];
    const assessments = new Map(visibleRows.map(row => [row.basic.id, boardAssessment(row)]));
    let known = 0; let unknown = 0; let inconsistent = 0;
    renderTable(columns, visibleRows, VIEWS.board.caption, row => {
      const assessment = assessments.get(row.basic.id);
      const cells = BOARD_COLUMNS.map(column => {
        const value = assessment[column.key];
        if (value.status === 'known') known += 1;
        else if (value.status === 'unknown') unknown += 1;
        else inconsistent += 1;
        return cellStack(value.label, value.values.length ? `実値 ${value.values.join(' / ')}` : 'マス値なし', { status: value.status });
      });
      return [apostleCell(row, true), ...cells];
    });
    elements.status.textContent = `判定：一意 ${known}件 / 不明 ${unknown}件 / 不整合 ${inconsistent}件。使徒名からボードプレビューを開けます。`;
  }

  function renderAside(visibleRows) {
    const columns = [{ key: 'name', label: '使徒', sortKey: 'name' }, ...ASIDE_COLUMNS.map(column => ({ key: column.key, label: column.label }))];
    if (state.asideExpanded) {
      ASIDE_COLUMNS.forEach(column => {
        columns.push({ key: `${column.key}-manifest`, label: `${column.label} 発現` });
        columns.push({ key: `${column.key}-growth`, label: `${column.label} A1成長` });
        columns.push({ key: `${column.key}-star`, label: `${column.label} 星上昇` });
      });
    }
    renderTable(columns, visibleRows, `${VIEWS.aside.caption}${state.asideExpanded ? ' / 補助値表示' : ''}`, row => {
      const cells = ASIDE_COLUMNS.map(column => {
        const value = asideValue(row, column);
        return cellStack(value.label, value.detail, { status: value.status, blank: value.blank });
      });
      if (state.asideExpanded) {
        ASIDE_COLUMNS.forEach(column => {
          cells.push(cellStack(formatNumber(asideSupplement(row, column, '発現値')), '', { status: asideSupplement(row, column, '発現値') == null ? 'unregistered' : 'known' }));
          cells.push(cellStack(formatNumber(asideSupplement(row, column, '_A1成長値')), '', { status: asideSupplement(row, column, '_A1成長値') == null ? 'unregistered' : 'known' }));
          cells.push(cellStack(formatNumber(asideSupplement(row, column, '星上昇値')), '', { status: asideSupplement(row, column, '星上昇値') == null ? 'unregistered' : 'known' }));
        });
      }
      return [apostleCell(row), ...cells];
    });
    const unregistered = visibleRows.filter(row => !row.aside).length;
    elements.status.textContent = `登録：${visibleRows.length - unregistered}名 / 未登録：${unregistered}名。補助値は${state.asideExpanded ? '表示中' : '非表示'}です。`;
    elements.status.hidden = false;
  }

  function renderRank(visibleRows) {
    const columns = [{ key: 'name', label: '使徒', sortKey: 'name' }, { key: 'effect1', label: '効果1' }, { key: 'effect2', label: '効果2' }];
    renderTable(columns, visibleRows, `${VIEWS.rank.caption} / Rank ${state.rankFrom}→${state.rankTo}`, row => {
      const effects = [rankEffect(row, 1), rankEffect(row, 2)];
      return [apostleCell(row), ...effects.map(effect => effect.status === 'unregistered'
        ? cellStack('未登録', '', { status: effect.status })
        : effect.blank ? emptyCell()
        : cellStack(effect.type || '種類なし', effect.value == null ? '値なし' : formatNumber(effect.value), { status: effect.status }))];
    });
    const unregistered = visibleRows.filter(row => !row.rank).length;
    elements.status.textContent = `増分表示：Rank ${state.rankFrom}→${state.rankTo} / 未登録：${unregistered}名。値はschemaの単位をそのまま表示しています。`;
    elements.status.hidden = false;
  }

  function sortValue(row, key) {
    const b = row.basic;
    if (key === 'name') return cleanText(b.使徒名) || cleanText(b.id);
    if (state.view === 'basic') {
      const map = {
        rarity: 'レア度', eldain: 'エルダイン', personality: '性格', species: '種族', role: '役割',
        attackType: '攻撃Type', column: '配置列', initialSP: '初期SP', spRegen: '毎秒SP回復量',
        ...Object.fromEntries(BASIC_TIER_COLUMNS.map(column => [column.key, column.dataKey])),
        ...Object.fromEntries(BASIC_COMBAT_COLUMNS.map(column => [column.key, column.dataKey]))
      };
      return map[key] ? b[map[key]] : null;
    }
    if (state.view === 'equipment') {
      const column = EQUIPMENT_COLUMNS.find(item => item.key === key);
      const value = column ? equipmentValue(row, column, state.equipmentRank) : null;
      return value?.numeric ?? null;
    }
    if (state.view === 'board') return boardAssessment(row)[key]?.tier ?? null;
    if (state.view === 'aside') {
      const column = ASIDE_COLUMNS.find(item => item.key === key);
      return column ? asideValue(row, column).tier ?? null : null;
    }
    return key === 'effect1' ? rankEffect(row, 1).value : key === 'effect2' ? rankEffect(row, 2).value : null;
  }

  function sortedRows(visibleRows) {
    const config = state.sort[state.view] || { key: 'name', direction: 'asc' };
    return visibleRows.map((row, index) => ({ row, index, value: sortValue(row, config.key) })).sort((a, b) => {
      const aMissing = a.value === null || a.value === undefined || a.value === '' || Number.isNaN(Number(a.value));
      const bMissing = b.value === null || b.value === undefined || b.value === '' || Number.isNaN(Number(b.value));
      if (aMissing || bMissing) return aMissing === bMissing ? a.index - b.index : aMissing ? 1 : -1;
      const basicNumeric = state.view === 'basic' && (
        ['rarity', 'initialSP', 'spRegen'].includes(config.key)
        || BASIC_TIER_COLUMNS.some(column => column.key === config.key)
        || BASIC_COMBAT_COLUMNS.some(column => column.key === config.key)
      );
      const aNumber = typeof a.value === 'number' || basicNumeric || (state.view !== 'basic' && /^-?\d+(?:\.\d+)?$/.test(String(a.value)));
      let result = aNumber ? Number(a.value) - Number(b.value) : String(a.value).localeCompare(String(b.value), 'ja');
      if (!result) result = a.index - b.index;
      return state.sort[state.view].direction === 'desc' ? -result : result;
    }).map(item => item.row);
  }

  function renderOptions() {
    if (state.view === 'equipment') {
      elements.options.innerHTML = `<label>Rank <select id="apostle-data-equipment-rank" data-apostle-option="equipmentRank">${equipmentRanks.map(rank => `<option value="${rank}" ${rank === state.equipmentRank ? 'selected' : ''}>${rank}</option>`).join('')}</select></label>`;
    } else if (state.view === 'rank') {
      const current = rankList.find(item => item.from === state.rankFrom && item.to === state.rankTo) || rankList[0] || { from: 1, to: 2 };
      state.rankFrom = current.from; state.rankTo = current.to;
      elements.options.innerHTML = `<label>Rank遷移 <select id="apostle-data-rank-transition" data-apostle-option="rankTransition">${rankList.map(item => `<option value="${item.from}-${item.to}" ${item.from === current.from && item.to === current.to ? 'selected' : ''}>Rank ${item.from} → ${item.to}</option>`).join('')}</select></label>`;
    } else if (state.view === 'aside') {
      elements.options.innerHTML = `<button type="button" data-apostle-option="asideExpanded" aria-expanded="${state.asideExpanded}">${state.asideExpanded ? '補助値を隠す' : '発現値・成長値・星上昇値を表示'}</button>`;
    } else {
      elements.options.replaceChildren();
    }
    if (elements.viewHeading) elements.viewHeading.hidden = elements.options.children.length === 0;
  }

  function equipmentEffectValue(definition, key) {
    const raw = definition?.[key];
    if (isAttackEffectType(definition?.statGroup || definition?.ステータス) && isHiddenAttackValue(raw)) return '';
    return raw === undefined || raw === null || cleanText(raw) === '' ? '' : formatNumber(raw);
  }

  function renderEquipmentDialog(row, column, value) {
    const definition = value.definition;
    if (!definition) return false;
    const name = value.detail || '装備名未登録';
    const icon = value.icon
      ? `<img data-apostle-data-image src="${escapeHtml(value.icon)}" alt="${escapeHtml(name)}"><span class="is-missing" data-apostle-data-image-fallback hidden>画像なし</span>`
      : '<span class="apostle-data-dialog-image-missing">画像なし</span>';
    const effectType = cleanText(definition.statGroup || definition.ステータス || column.lookup) || '効果種別未登録';
    const values = Array.from({ length: 6 }, (_, index) => {
      const label = index === 0 ? '未強化' : `強化＋${index}`;
      const effect = equipmentEffectValue(definition, `enhance${index}`);
      return `<tr><th scope="row">${label}</th><td>${effect ? escapeHtml(effect) : '<span class="apostle-data-dialog-empty">—</span>'}</td></tr>`;
    }).join('');
    elements.equipmentDialogBody.innerHTML = `
      <div class="apostle-data-equipment-dialog-summary">
        <div class="apostle-data-equipment-dialog-image">${icon}</div>
        <div>
          <h3>${escapeHtml(name)}</h3>
          <dl class="apostle-data-equipment-dialog-meta">
            <div><dt>Rank</dt><dd>${escapeHtml(state.equipmentRank)}</dd></div>
            <div><dt>等級</dt><dd>${escapeHtml(value.tier)}</dd></div>
            <div><dt>効果の種類</dt><dd>${escapeHtml(effectType)}</dd></div>
          </dl>
        </div>
      </div>
      <table class="apostle-data-equipment-values"><caption>強化段階別の効果値</caption><tbody>${values}</tbody></table>`;
    return true;
  }

  function closeEquipmentDialog(restoreFocus = true) {
    if (!elements.equipmentDialog) return;
    if (elements.equipmentDialog.open) elements.equipmentDialog.close();
    elements.equipmentDialogBody.replaceChildren();
    const opener = equipmentDialogOpener;
    equipmentDialogOpener = null;
    if (restoreFocus && opener?.isConnected) opener.focus();
  }

  function openEquipmentDialog(button) {
    const row = rows.find(item => String(item.basic.id) === String(button.dataset.apostleId));
    const column = EQUIPMENT_COLUMNS.find(item => item.key === button.dataset.apostleEquipmentColumn);
    const rank = Number(button.dataset.apostleEquipmentRank) || state.equipmentRank;
    if (!row || !column) return;
    const value = equipmentValue(row, column, rank);
    if (value.blank || !value.definition) return;
    equipmentDialogOpener = button;
    if (!renderEquipmentDialog(row, column, value)) return;
    if (typeof elements.equipmentDialog.showModal === 'function') elements.equipmentDialog.showModal();
    else elements.equipmentDialog.setAttribute('open', '');
    elements.equipmentDialogClose.focus();
  }

  function render() {
    if (elements.equipmentDialog?.open) closeEquipmentDialog(false);
    const config = VIEWS[state.view];
    const filtered = getFilteredRows();
    const visible = sortedRows(filtered);
    elements.title.textContent = config.title;
    elements.note.textContent = config.note;
    elements.note.hidden = !config.note;
    elements.count.textContent = `${filtered.length} / ${rows.length}名`;
    syncFilterSummary();
    elements.status.textContent = '';
    elements.status.hidden = true;
    renderOptions();
    if (state.view === 'basic') renderBasic(visible);
    if (state.view === 'equipment') renderEquipment(visible);
    if (state.view === 'board') renderBoard(visible);
    if (state.view === 'aside') renderAside(visible);
    if (state.view === 'rank') renderRank(visible);
    elements.bottom.querySelectorAll('[data-apostle-view]').forEach(button => {
      const active = button.dataset.apostleView === state.view;
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
    syncBottomHeight();
  }

  function updateUrl(replace = false) {
    const url = new URL(window.location.href);
    if (state.view === 'basic') url.searchParams.delete('view');
    else url.searchParams.set('view', state.view);
    if (state.view === 'equipment' && state.equipmentRank !== 1) url.searchParams.set('rank', state.equipmentRank);
    else url.searchParams.delete('rank');
    if (state.view === 'rank' && (state.rankFrom !== 1 || state.rankTo !== 2)) {
      url.searchParams.set('rankFrom', state.rankFrom); url.searchParams.set('rankTo', state.rankTo);
    } else {
      url.searchParams.delete('rankFrom'); url.searchParams.delete('rankTo');
    }
    window.history[replace ? 'replaceState' : 'pushState']({ view: state.view }, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function setView(view) {
    if (!VIEW_KEYS.includes(view) || view === state.view) return;
    state.view = view;
    updateUrl(false);
    render();
  }

  function syncBottomHeight() {
    const height = Math.ceil(elements.bottom?.getBoundingClientRect?.().height || 0);
    if (height) document.documentElement.style.setProperty('--apostle-data-bottom-height', `${height}px`);
  }

  function handleSort(key) {
    const current = state.sort[state.view] || { key: 'name', direction: 'asc' };
    state.sort[state.view] = { key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' };
    render();
  }

  function bindEvents() {
    elements.bottom.addEventListener('click', event => {
      const button = event.target.closest('[data-apostle-view]');
      if (button) setView(button.dataset.apostleView);
    });
    elements.search.addEventListener('input', () => { state.search = elements.search.value; render(); });
    elements.filters.forEach(select => select.addEventListener('change', () => { state.filters[select.dataset.apostleFilter] = select.value; render(); }));
    elements.clearFilters.addEventListener('click', () => {
      state.search = ''; elements.search.value = '';
      elements.filters.forEach(select => { select.value = ''; state.filters[select.dataset.apostleFilter] = ''; });
      render(); elements.search.focus();
    });
    elements.options.addEventListener('change', event => {
      if (event.target.dataset.apostleOption === 'equipmentRank') state.equipmentRank = Number(event.target.value) || 1;
      if (event.target.dataset.apostleOption === 'rankTransition') {
        const [from, to] = event.target.value.split('-').map(Number);
        state.rankFrom = from; state.rankTo = to;
      }
      updateUrl(true); render();
    });
    elements.options.addEventListener('click', event => {
      if (event.target.dataset.apostleOption !== 'asideExpanded') return;
      state.asideExpanded = !state.asideExpanded;
      render();
    });
    elements.table.addEventListener('click', event => {
      const equipmentButton = event.target.closest('[data-apostle-equipment-open]');
      if (equipmentButton) {
        openEquipmentDialog(equipmentButton);
        return;
      }
      const button = event.target.closest('[data-apostle-sort]');
      if (button) handleSort(button.dataset.apostleSort);
    });
    elements.equipmentDialogClose.addEventListener('click', () => closeEquipmentDialog(true));
    elements.equipmentDialog.addEventListener('cancel', event => {
      event.preventDefault();
      closeEquipmentDialog(true);
    });
    elements.equipmentDialog.addEventListener('click', event => {
      if (event.target === elements.equipmentDialog) closeEquipmentDialog(true);
    });
    elements.equipmentDialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeEquipmentDialog(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(elements.equipmentDialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(element => !element.disabled && element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    document.addEventListener('error', event => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || !image.matches('[data-apostle-data-image]')) return;
      image.hidden = true;
      const fallback = image.parentElement?.querySelector('[data-apostle-data-image-fallback]');
      if (fallback) fallback.hidden = false;
    }, true);
    window.addEventListener('popstate', () => { state.view = readView(); render(); });
    if (elements.filterDetails) {
      elements.filterDetails.open = false;
      syncFilterDisclosure();
      elements.filterDetails.addEventListener('toggle', () => {
        const focusInside = elements.filterDetails.contains(document.activeElement);
        syncFilterDisclosure();
        if (!elements.filterDetails.open && focusInside) elements.filterToggle?.focus();
        window.requestAnimationFrame(syncBottomHeight);
      });
      elements.filterToggle?.addEventListener('click', () => {
        window.requestAnimationFrame(() => {
          syncFilterDisclosure();
          syncBottomHeight();
        });
      });
    }
    if (typeof window.ResizeObserver === 'function') new window.ResizeObserver(syncBottomHeight).observe(elements.bottom);
    else window.addEventListener('resize', syncBottomHeight);
  }

  populateFilters();
  bindEvents();
  render();

  if (new URLSearchParams(window.location.search).get('apostleDataTest') === '1') {
    window.__TRICKCAL_APOSTLE_DATA_TESTING__ = Object.freeze({ inferBoardTierStatus, isHiddenAttackValue, basicDisplayValue });
  }
})();
