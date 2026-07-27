(function () {
  'use strict';

  const DATA = window.TRICKCAL_STAT_DATA;
  if (!DATA) return;

  const COMMON_THEME_KEY = 'trickcal_theme';
  const LEGACY_PREVIEW_THEME_KEY = 'trickcal-board-preview-theme';

  const BOARD_TIER_VALUES = {
    hp: { 1: [50, 99], 2: [71, 141], 3: [92, 183], 4: [113, 225], 5: [134, 267] },
    attack: { 1: [5, 11], 2: [5, 12], 3: [6, 13], 4: [7, 14], 5: [7, 15] },
    defense: { 1: [11, 21], 2: [12, 24], 3: [13, 26], 4: [14, 28], 5: [15, 31] },
    crit: { 1: [8, 16], 2: [9, 17], 3: [10, 19], 4: [11, 21], 5: [12, 22] }
  };

  const SPECIAL_TYPES = [
    { key: 'A', signature: '2,3,2,1,1', fallbackLabel: '魔法攻撃力 / 物理防御力' },
    { key: 'B', signature: '1,3,2,1,2', fallbackLabel: 'HP / 魔法攻撃力' },
    { key: 'C', signature: '2,2,2,1,2', fallbackLabel: '物理防御力 / 会心抵抗' },
    { key: 'D', signature: '2,0,1,3,3', fallbackLabel: '会心抵抗 / 会心' },
    { key: 'E', signature: '2,1,2,3,1', fallbackLabel: '会心 / HP' }
  ];
  const SPECIAL_TYPE_BY_SIGNATURE = new Map(SPECIAL_TYPES.map(item => [item.signature, item.key]));

  const elements = {
    apostle: document.getElementById('board-preview-apostle'),
    species: document.getElementById('board-preview-species'),
    specialType: document.getElementById('board-preview-special-type'),
    attackType: document.getElementById('board-preview-attack-type'),
    orientationButtons: Array.from(document.querySelectorAll('[data-board-orientation]')),
    themeToggle: document.getElementById('board-preview-theme-toggle'),
    tierSelects: Array.from(document.querySelectorAll('[data-board-preview-tier]')),
    reference: document.getElementById('board-preview-reference'),
    status: document.getElementById('board-preview-status'),
    canvas: document.getElementById('board-preview-canvas'),
    detail: document.getElementById('board-preview-detail'),
    popover: document.getElementById('board-preview-popover'),
    popoverClose: document.getElementById('board-preview-popover-close')
  };
  if (!elements.apostle || !elements.species || !elements.canvas) return;

  const basicRows = DATA.sheets?.basicInfo || [];
  const basicById = new Map(basicRows.map(row => [String(row.id), row]));
  const referenceCatalog = buildReferenceCatalog();
  let selectedNode = null;
  let viewOrientation = 'horizontal';

  initialize();
  bindEvents();
  renderPreview();

  function initialize() {
    elements.apostle.innerHTML = [
      '<option value="">カスタム指定</option>',
      ...basicRows.map(row => `<option value="${escapeHtml(row.id)}">${escapeHtml(row.使徒名)}</option>`)
    ].join('');
    const species = Array.from(new Set(basicRows.map(row => String(row.種族 || '')).filter(Boolean)));
    elements.species.innerHTML = species.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
    const tierOptions = Array.from({ length: 5 }, (_, index) => `<option value="${index + 1}">Tier ${index + 1}</option>`).join('');
    elements.tierSelects.forEach(select => {
      select.innerHTML = tierOptions;
      select.value = '3';
    });
    updateSpecialTypeOptions();
    syncThemeToggle();
  }

  function bindEvents() {
    elements.apostle.addEventListener('change', syncFromApostle);
    elements.species.addEventListener('change', () => {
      markCustomSelection();
      updateSpecialTypeOptions();
      renderPreview();
    });
    elements.specialType.addEventListener('change', () => {
      markCustomSelection();
      renderPreview();
    });
    elements.attackType.addEventListener('change', () => {
      markCustomSelection();
      renderPreview();
    });
    elements.tierSelects.forEach(select => {
      select.addEventListener('change', () => {
        markCustomSelection();
        renderPreview();
      });
    });
    elements.orientationButtons.forEach(button => {
      button.addEventListener('click', () => {
        viewOrientation = button.dataset.boardOrientation === 'vertical' ? 'vertical' : 'horizontal';
        elements.orientationButtons.forEach(item => item.classList.toggle('is-active', item === button));
        renderPreview();
      });
    });
    elements.themeToggle.addEventListener('click', () => {
      applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
    window.addEventListener('storage', event => {
      if (event.key !== COMMON_THEME_KEY || !['light', 'dark'].includes(event.newValue)) return;
      applyTheme(event.newValue, false);
    });
    elements.canvas.addEventListener('click', event => {
      const button = event.target.closest('.board-node[data-row-index]');
      if (!button || button.classList.contains('is-virtual')) return;
      const row = currentRows()[Number(button.dataset.rowIndex)];
      if (!row) return;
      elements.canvas.querySelectorAll('.board-node.is-selected').forEach(node => node.classList.remove('is-selected'));
      button.classList.add('is-selected');
      selectedNode = boardKey(row);
      renderDetail(row);
      showTilePopover(button);
    });
    elements.popoverClose.addEventListener('click', closeTilePopover);
    document.addEventListener('click', event => {
      if (elements.popover.hidden || elements.popover.contains(event.target) || event.target.closest('.board-node')) return;
      closeTilePopover();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeTilePopover();
    });
  }

  function syncThemeToggle() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    elements.themeToggle.setAttribute('aria-pressed', String(isDark));
    elements.themeToggle.setAttribute('aria-label', isDark ? 'ダークモード。ライトモードに切替' : 'ライトモード。ダークモードに切替');
    elements.themeToggle.title = isDark ? 'ライトモードに切替' : 'ダークモードに切替';
  }
  function applyTheme(theme, persist = true) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    syncThemeToggle();
    if (!persist) return;
    try {
      localStorage.setItem(COMMON_THEME_KEY, nextTheme);
      localStorage.setItem(LEGACY_PREVIEW_THEME_KEY, nextTheme);
    } catch (error) {
      // file://など保存できない環境でも、その場の切り替えは維持する。
    }
  }
  function markCustomSelection() {
    elements.apostle.value = '';
  }

  function syncFromApostle() {
    const basic = basicById.get(String(elements.apostle.value || ''));
    if (!basic) return;
    const rows = DATA.getById('board', basic.id) || [];
    const specialType = inferSpecialType(rows);
    const attackType = normalizeAttackType(basic.攻撃タイプ || basic.攻撃Type);
    elements.species.value = String(basic.種族 || elements.species.options[0]?.value || '');
    updateSpecialTypeOptions(specialType);
    elements.attackType.value = attackType;
    const tiers = inferBoardTiers(rows, attackType);
    elements.tierSelects.forEach(select => {
      select.value = String(tiers[select.dataset.boardPreviewTier] || 3);
    });
    renderPreview();
  }
  function buildReferenceCatalog() {
    const exact = new Map();
    const species = new Map();
    const specialTypes = new Map();
    basicRows.forEach(basic => {
      const rows = DATA.getById('board', basic.id) || [];
      if (rows.length !== 91) return;
      const specialType = inferSpecialType(rows);
      const speciesName = String(basic.種族 || '');
      if (!specialType || !speciesName) return;
      const reference = { basic, rows, specialType };
      const key = referenceKey(speciesName, specialType);
      if (!exact.has(key)) exact.set(key, reference);
      if (!species.has(speciesName)) species.set(speciesName, reference);
      if (!specialTypes.has(specialType)) specialTypes.set(specialType, reference);
    });
    return { exact, species, specialTypes };
  }

  function inferSpecialType(rows) {
    const counts = { hp: 0, attack: 0, defense: 0, crit: 0, critRes: 0 };
    rows.filter(row => row.マス_type === '特殊').forEach(row => {
      const group = getSpecialEffectGroup(row.効果1_type);
      if (group) counts[group] += 1;
    });
    return SPECIAL_TYPE_BY_SIGNATURE.get([counts.hp, counts.attack, counts.defense, counts.crit, counts.critRes].join(',')) || '';
  }

  function getSpecialEffectGroup(type) {
    const text = String(type || '');
    if (text === '全体HP') return 'hp';
    if (text.includes('攻撃力')) return 'attack';
    if (text.includes('防御力')) return 'defense';
    if (text === '会心抵抗') return 'critRes';
    return text ? 'crit' : '';
  }

  function updateSpecialTypeOptions(preferred = elements.specialType.value) {
    const species = elements.species.value;
    elements.specialType.innerHTML = SPECIAL_TYPES.map(item => {
      const reference = getReference(species, item.key);
      const effects = getBoardOneSpecialEffects(reference?.rows);
      const label = effects.length === 2 ? effects.join(' / ') : item.fallbackLabel;
      const suffix = !reference ? ' / 生成不可' : reference.synthetic ? ' / 予測' : ` / 例: ${reference.basic.使徒名}`;
      return `<option value="${item.key}"${reference ? '' : ' disabled'}>${escapeHtml(`${item.key}: ${label}${suffix}`)}</option>`;
    }).join('');
    const preferredOption = Array.from(elements.specialType.options).find(option => option.value === preferred && !option.disabled);
    const firstEnabled = Array.from(elements.specialType.options).find(option => !option.disabled);
    elements.specialType.value = preferredOption?.value || firstEnabled?.value || '';
  }

  function getBoardOneSpecialEffects(rows = []) {
    return Array.from(new Set(rows
      .filter(row => Number(row.ボード階層) === 1 && row.マス_type === '特殊')
      .map(row => String(row.効果1_type || '').replace(/^全体/, ''))
      .filter(Boolean)));
  }

  function getReference(species, specialType) {
    const exact = referenceCatalog.exact.get(referenceKey(species, specialType));
    if (exact) {
      return { ...exact, geometryBasic: exact.basic, specialBasic: exact.basic, synthetic: false };
    }
    const geometry = referenceCatalog.species.get(species);
    const special = referenceCatalog.specialTypes.get(specialType);
    if (!geometry || !special) return null;
    const rows = composeReferenceRows(geometry.rows, special.rows);
    if (!rows) return null;
    return {
      basic: geometry.basic,
      rows,
      specialType,
      geometryBasic: geometry.basic,
      specialBasic: special.basic,
      synthetic: true
    };
  }

  function composeReferenceRows(geometryRows, specialRows) {
    const payloads = specialRows.filter(row => row.マス_type === '特殊');
    const geometrySpecials = geometryRows.filter(row => row.マス_type === '特殊');
    if (payloads.length !== 9 || geometrySpecials.length !== payloads.length) return null;
    if (!geometrySpecials.every((row, index) => Number(row.ボード階層) === Number(payloads[index].ボード階層))) return null;
    let specialIndex = 0;
    return geometryRows.map(source => {
      if (source.マス_type !== '特殊') return { ...source };
      const payload = payloads[specialIndex++];
      return {
        ...source,
        効果1_type: payload.効果1_type ?? '',
        効果1_value: payload.効果1_value ?? '',
        効果2_type: payload.効果2_type ?? '',
        効果2_value: payload.効果2_value ?? ''
      };
    });
  }

  function referenceKey(species, specialType) {
    return `${species}\u0000${specialType}`;
  }

  function getSettings() {
    return {
      attackType: elements.attackType.value,
      tiers: Object.fromEntries(elements.tierSelects.map(select => [
        select.dataset.boardPreviewTier,
        Number(select.value) || 3
      ]))
    };
  }

  function currentRows() {
    return getPreviewState().rows;
  }

  function getPreviewState() {
    const selectedBasic = basicById.get(String(elements.apostle.value || ''));
    if (selectedBasic) {
      const rows = DATA.getById('board', selectedBasic.id) || [];
      if (rows.length === 91) {
        return {
          rows: rows.map(row => ({ ...row })),
          label: `${selectedBasic.使徒名} / 使徒データ`,
          status: `${rows.length}マス / 選択使徒`
        };
      }
    }
    const reference = getReference(elements.species.value, elements.specialType.value);
    if (!reference) return { rows: [], label: '該当テンプレートなし', status: '表示できる基準データがありません。', error: true };
    return {
      rows: generatePreviewRows(reference.rows, getSettings()),
      label: reference.synthetic
        ? `盤面: ${reference.geometryBasic.使徒名} / 特殊: ${reference.specialBasic.使徒名} / 予測`
        : `${reference.basic.使徒名} / 実例`,
      status: `91マス / ${reference.synthetic ? '予測テンプレート' : '実在テンプレート'}`
    };
  }

  function generatePreviewRows(referenceRows, settings) {
    const normalValues = collectReferenceNormalRanges(referenceRows);
    return referenceRows.map(source => {
      const row = { ...source };
      if (row.マス_type !== '通常') return row;
      const sourceType = String(row.効果1_type || '');
      const tierKey = getTierControlKey(sourceType);
      const tier = settings.tiers[tierKey] || 3;
      const valueGroup = getTierValueGroup(sourceType);
      const range = normalValues.get(sourceType) || [Number(row.効果1_value) || 0, Number(row.効果1_value) || 0];
      const high = Number(row.効果1_value) === range[range.length - 1];
      if (sourceType === '物理攻撃力' || sourceType === '魔法攻撃力') {
        row.効果1_type = settings.attackType === '魔法' ? '魔法攻撃力' : '物理攻撃力';
      }
      row.効果1_value = BOARD_TIER_VALUES[valueGroup][tier][high ? 1 : 0];
      return row;
    });
  }

  function collectReferenceNormalRanges(rows) {
    const values = new Map();
    rows.filter(row => row.マス_type === '通常').forEach(row => {
      const type = String(row.効果1_type || '');
      if (!values.has(type)) values.set(type, new Set());
      values.get(type).add(Number(row.効果1_value) || 0);
    });
    return new Map(Array.from(values, ([type, set]) => [type, Array.from(set).sort((a, b) => a - b)]));
  }

  function getTierControlKey(effectType) {
    if (effectType === 'HP') return 'hp';
    if (effectType === '物理攻撃力' || effectType === '魔法攻撃力') return 'attack';
    if (effectType === '物理防御力') return 'physicalDefense';
    if (effectType === '魔法防御力') return 'magicDefense';
    if (effectType === '会心') return 'crit';
    if (effectType === '会心DMG') return 'critDmg';
    if (effectType === '会心抵抗') return 'critRes';
    return 'critDmgRes';
  }

  function getTierValueGroup(effectType) {
    if (effectType === 'HP') return 'hp';
    if (effectType.includes('攻撃力')) return 'attack';
    if (effectType.includes('防御力')) return 'defense';
    return 'crit';
  }

  function inferBoardTiers(rows, attackType) {
    const effectTypes = {
      hp: 'HP',
      attack: attackType === '魔法' ? '魔法攻撃力' : '物理攻撃力',
      physicalDefense: '物理防御力',
      magicDefense: '魔法防御力',
      crit: '会心',
      critDmg: '会心DMG',
      critRes: '会心抵抗',
      critDmgRes: '会心DMG抵抗'
    };
    return Object.fromEntries(Object.entries(effectTypes).map(([key, effectType]) => {
      const values = Array.from(new Set(rows
        .filter(row => row.マス_type === '通常' && row.効果1_type === effectType)
        .map(row => Number(row.効果1_value) || 0)))
        .sort((a, b) => a - b);
      const valueGroup = getTierValueGroup(effectType);
      const matched = Object.entries(BOARD_TIER_VALUES[valueGroup])
        .find(([, pair]) => pair[0] === values[0] && pair[1] === values[values.length - 1]);
      return [key, matched ? Number(matched[0]) : 3];
    }));
  }
  function renderPreview() {
    const preview = getPreviewState();
    closeTilePopover();
    elements.reference.textContent = preview.label;
    elements.status.textContent = preview.status;
    elements.status.classList.toggle('is-error', !!preview.error);
    elements.canvas.classList.toggle('is-vertical', viewOrientation === 'vertical');
    if (!preview.rows.length) {
      elements.canvas.innerHTML = '';
      return;
    }
    elements.canvas.innerHTML = renderUnifiedBoard(preview.rows, viewOrientation);
  }

  function renderUnifiedBoard(allRows, orientation) {
    const layers = [1, 2, 3].map(layer => allRows.filter(row => Number(row.ボード階層) === layer));
    const yOffsets = [0, 13, 26];
    const xOffsets = [0, 0, 0];
    for (let index = 1; index < layers.length; index += 1) {
      const previousGate = layers[index - 1].find(row => row.マス_type === 'ゲート');
      const entry = getBoardEntryRow(layers[index], previousGate);
      const previousGateX = Number(previousGate?.X_pos) + xOffsets[index - 1];
      xOffsets[index] = entry && Number.isFinite(previousGateX)
        ? previousGateX - Number(entry.X_pos)
        : xOffsets[index - 1];
    }
    const positioned = allRows.map((row, index) => {
      const layerIndex = Number(row.ボード階層) - 1;
      return {
        row,
        index,
        x: Number(row.X_pos) + xOffsets[layerIndex],
        y: Number(row.Y_pos) + yOffsets[layerIndex]
      };
    });
    const minX = Math.min(1, ...positioned.map(item => item.x));
    const maxX = Math.max(7, ...positioned.map(item => item.x));
    const maxY = 38;
    const byPos = new Map(positioned.map(item => [`${item.x}:${item.y}`, item]));
    const cells = [];
    if (orientation === 'vertical') {
      for (let y = maxY; y >= 1; y -= 1) {
        for (let x = maxX; x >= minX; x -= 1) {
          const item = byPos.get(`${x}:${y}`);
          cells.push(`<div class="board-cell">${item ? renderNode(item.row, item.index) : ''}</div>`);
        }
      }
    } else {
      for (let x = maxX; x >= minX; x -= 1) {
        for (let y = 1; y <= maxY; y += 1) {
          const item = byPos.get(`${x}:${y}`);
          cells.push(`<div class="board-cell">${item ? renderNode(item.row, item.index) : ''}</div>`);
        }
      }
    }
    const columnCount = orientation === 'vertical' ? maxX - minX + 1 : maxY;
    const rowCount = orientation === 'vertical' ? maxY : maxX - minX + 1;
    const heading = orientation === 'vertical'
      ? '<span>上から ボード3（25）・ボード2（25）・ボード1（41）</span>'
      : '<span>ボード1 <small>41マス</small></span><span>ボード2 <small>25マス</small></span><span>ボード3 <small>25マス</small></span>';
    return `
      <section class="unified-board is-${orientation}">
        <div class="unified-board-head">${heading}</div>
        <div class="board-grid" style="grid-template-columns: repeat(${columnCount}, var(--cell-size)); grid-template-rows: repeat(${rowCount}, var(--cell-size));">
          ${cells.join('')}
        </div>
      </section>
    `;
  }
  function getBoardEntryRow(rows, previousGate) {
    const minY = Math.min(...rows.map(row => Number(row.Y_pos)).filter(Number.isFinite));
    const candidates = rows
      .filter(row => Number(row.Y_pos) === minY)
      .sort((a, b) => Number(a.X_pos) - Number(b.X_pos));
    if (!previousGate) return candidates[0] || null;
    const gateX = Number(previousGate.X_pos);
    return candidates.find(row => Number(row.X_pos) === gateX)
      || candidates.slice().sort((a, b) => Math.abs(Number(a.X_pos) - gateX) - Math.abs(Number(b.X_pos) - gateX))[0]
      || null;
  }

  function renderNode(row, index) {
    const base = getBoardTileBasePath(row);
    const icon = getBoardIconPath(row);
    const label = shortBoardLabel(row);
    const title = `${row.マス_type}: ${formatBoardEffect(row)} / X${row.X_pos} Y${row.Y_pos}`;
    return `
      <button type="button" class="board-node ${boardNodeClass(row)}${selectedNode === boardKey(row) ? ' is-selected' : ''}"
        data-row-index="${index}" title="${escapeHtml(title)}"
        style="--tile-base:url('${escapeHtml(base)}');${icon ? `--tile-icon:url('${escapeHtml(icon)}')` : ''}">
        ${label ? `<span class="board-node-label">${escapeHtml(label)}</span>` : ''}
      </button>
    `;
  }

  function renderDetail(row) {
    const costs = [
      ['ゴールド', row.ゴールド, '../img/ゴールド.webp'],
      ['下級くれよん', row.下級, '../img/下級くれよん.webp'],
      ['中級くれよん', row.中級, '../img/中級くれよん.webp'],
      ['上級くれよん', row.上級, '../img/上級くれよん.webp'],
      ['特級くれよん', row.特級, '../img/特級くれよん.webp'],
      ['★1共同教団証', row['★1共同教団証'], '../img/★1共同教団証.webp'],
      ['使徒証', row.使徒証, '../img/使徒証.webp']
    ].filter(([, value]) => Number(value) > 0);
    const costsHtml = costs.length
      ? costs.map(([label, value, src]) => `
          <span class="detail-material" title="${escapeHtml(label)}">
            <img src="${escapeHtml(src)}" alt="${escapeHtml(label)}">
            <b>${escapeHtml(formatNumber(value))}</b>
          </span>
        `).join('')
      : '<span class="detail-cost-empty">消費素材なし</span>';
    const base = getBoardTileBasePath(row);
    const icon = getBoardIconPath(row);
    elements.detail.innerHTML = `
      <span class="detail-tile" style="--tile-base:url('${escapeHtml(base)}');${icon ? `--tile-icon:url('${escapeHtml(icon)}')` : ''}"></span>
      <span class="detail-copy">
        <strong>ボード${escapeHtml(row.ボード階層)}・X${escapeHtml(row.X_pos)} Y${escapeHtml(row.Y_pos)}</strong>
        <span>${escapeHtml(row.マス_type)}</span>
        <span class="detail-effect">${escapeHtml(formatBoardEffect(row))}</span>
        <span class="detail-costs">${costsHtml}</span>
      </span>
    `;
  }

  function showTilePopover(anchor) {
    elements.popover.hidden = false;
    requestAnimationFrame(() => {
      const anchorRect = anchor.getBoundingClientRect();
      const popoverRect = elements.popover.getBoundingClientRect();
      const margin = 10;
      const left = Math.min(
        window.innerWidth - popoverRect.width - margin,
        Math.max(margin, anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2)
      );
      let top = anchorRect.bottom + 8;
      if (top + popoverRect.height > window.innerHeight - margin) {
        top = Math.max(margin, anchorRect.top - popoverRect.height - 8);
      }
      elements.popover.style.left = `${left}px`;
      elements.popover.style.top = `${top}px`;
    });
  }

  function closeTilePopover() {
    elements.popover.hidden = true;
    elements.canvas.querySelectorAll('.board-node.is-selected').forEach(node => node.classList.remove('is-selected'));
    selectedNode = null;
  }
  function formatBoardEffect(row) {
    if (row.マス_type === 'スタート' || row.マス_type === 'ゲート') return row.マス_type;
    const suffix = row.マス_type === '特殊' ? '%' : '';
    return [
      formatEffect(row.効果1_type, row.効果1_value, suffix),
      formatEffect(row.効果2_type, row.効果2_value, suffix)
    ].filter(Boolean).join(' / ') || row.マス_type;
  }

  function formatEffect(type, value, suffix) {
    if (!type) return '';
    if (value === '' || value === null || value === undefined) return String(type);
    return `${type}+${formatNumber(value)}${suffix}`;
  }

  function shortBoardLabel(row) {
    if (row.マス_type === 'スタート' || row.マス_type === 'ゲート') return '';
    const value = [row.効果1_value, row.効果2_value].find(item => item !== '' && item !== null && item !== undefined);
    return value === undefined ? '' : `+${formatNumber(value)}${row.マス_type === '特殊' ? '%' : ''}`;
  }

  function getBoardTileBasePath(row) {
    if (row.マス_type === 'ゲート') return '../img/Board/Tile_gate.webp';
    if (row.マス_type === '上級') return '../img/Board/Tile_2_On.webp';
    if (row.マス_type === '特殊') return '../img/Board/Tile_3_On.webp';
    return '../img/Board/Tile_1_On.webp';
  }

  function getBoardIconPath(row) {
    const types = [row.効果1_type, row.効果2_type].filter(Boolean).join('/');
    if (row.マス_type === 'スタート') return viewOrientation === 'vertical'
      ? '../img/Board/Tile_Start_Up.webp'
      : '../img/Board/Tile_Start_Right.webp';
    if (row.マス_type === 'ゲート') return '';
    if (types.includes('HP')) return '../img/Board/Tile_Hp_On.webp';
    if (types.includes('物理攻撃') && types.includes('魔法攻撃')) return '../img/Board/Tile_AtkBoth_On.webp';
    if (types.includes('物理攻撃')) return '../img/Board/Tile_AtkP_On.webp';
    if (types.includes('魔法攻撃')) return '../img/Board/Tile_AtkM_On.webp';
    if (types.includes('物理防御') && types.includes('魔法防御')) return '../img/Board/Tile_DefBoth_On.webp';
    if (types.includes('物理防御')) return '../img/Board/Tile_DefP_On.webp';
    if (types.includes('魔法防御')) return '../img/Board/Tile_DefM_On.webp';
    if ((types.includes('会心DMG抵抗') || types.includes('会心ダメージ抵抗')) && types.includes('会心抵抗')) return '../img/Board/Tile_CritResBoth_On.webp';
    if (types.includes('会心DMG抵抗') || types.includes('会心ダメージ抵抗')) return '../img/Board/Tile_CritiDMGRes_On.webp';
    if (types.includes('会心抵抗')) return '../img/Board/Tile_CritiRes_On.webp';
    if ((types.includes('会心DMG') || types.includes('会心ダメージ')) && types.includes('会心')) return '../img/Board/Tile_CritBoth_On.webp';
    if (types.includes('会心DMG') || types.includes('会心ダメージ')) return '../img/Board/Tile_CritDMG_On.webp';
    if (types.includes('会心')) return '../img/Board/Tile_Crit_On.webp';
    return '';
  }

  function boardNodeClass(row) {
    if (row.マス_type === 'スタート') return 'type-start';
    if (row.マス_type === 'ゲート') return 'type-gate';
    if (row.マス_type === '上級') return 'type-advanced';
    if (row.マス_type === '特殊') return 'type-special';
    return 'type-normal';
  }

  function boardKey(row) {
    return `${row.ボード階層}:${row.X_pos}:${row.Y_pos}`;
  }

  function formatNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value ?? '');
    return Number.isInteger(number) ? String(number) : String(number).replace(/0+$/, '').replace(/\.$/, '');
  }

  function normalizeAttackType(value) {
    return String(value || '').includes('魔') ? '魔法' : '物理';
  }
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
