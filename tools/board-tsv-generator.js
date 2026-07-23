(function () {
  'use strict';

  const DATA = window.TRICKCAL_STAT_DATA;
  if (!DATA) return;

  const BOARD_COLUMNS = [
    'id', '使徒名', 'ボード階層', 'X_pos', 'Y_pos', 'マス_type',
    '効果1_type', '効果1_value', '効果2_type', '効果2_value',
    'ゴールド', '下級', '中級', '上級', '特級', '★1共同教団証', '使徒証', '表示用'
  ];

  const BOARD_TIER_VALUES = {
    hp: {
      1: [50, 99], 2: [71, 141], 3: [92, 183], 4: [113, 225], 5: [134, 267]
    },
    attack: {
      1: [5, 11], 2: [5, 12], 3: [6, 13], 4: [7, 14], 5: [7, 15]
    },
    defense: {
      1: [11, 21], 2: [12, 24], 3: [13, 26], 4: [14, 28], 5: [15, 31]
    },
    crit: {
      1: [8, 16], 2: [9, 17], 3: [10, 19], 4: [11, 21], 5: [12, 22]
    }
  };

  const SPECIAL_TYPES = [
    { key: 'A', signature: '2,3,2,1,1', fallbackLabel: '全体魔法攻撃力 / 全体物理防御力' },
    { key: 'B', signature: '1,3,2,1,2', fallbackLabel: '全体HP / 全体魔法攻撃力' },
    { key: 'C', signature: '2,2,2,1,2', fallbackLabel: '全体物理防御力 / 会心抵抗' },
    { key: 'D', signature: '2,0,1,3,3', fallbackLabel: '会心抵抗 / 全体会心' },
    { key: 'E', signature: '2,1,2,3,1', fallbackLabel: '全体会心 / 全体HP' }
  ];
  const SPECIAL_TYPE_BY_SIGNATURE = new Map(SPECIAL_TYPES.map(item => [item.signature, item.key]));

  const elements = {
    sourceApostle: document.getElementById('board-tsv-source-apostle'),
    id: document.getElementById('board-tsv-id'),
    name: document.getElementById('board-tsv-name'),
    species: document.getElementById('board-tsv-species'),
    specialType: document.getElementById('board-tsv-special-type'),
    attackType: document.getElementById('board-tsv-attack-type'),
    reference: document.getElementById('board-tsv-reference'),
    tierSelects: Array.from(document.querySelectorAll('[data-board-tsv-tier]')),
    includeHeader: document.getElementById('board-tsv-include-header'),
    status: document.getElementById('board-tsv-status'),
    output: document.getElementById('board-tsv-output'),
    generate: document.getElementById('board-tsv-generate'),
    copy: document.getElementById('board-tsv-copy'),
    download: document.getElementById('board-tsv-download'),
  };

  if (!elements.sourceApostle || !elements.output || !elements.generate) return;

  const basicRows = DATA.sheets?.basicInfo || [];
  const basicById = new Map(basicRows.map(row => [String(row.id), row]));
  const referenceCatalog = buildReferenceCatalog();

  initializeControls();
  bindEvents();
  syncFromCurrentApostle();

  function initializeControls() {
    elements.sourceApostle.innerHTML = basicRows.map(row => (
      `<option value="${escapeHtml(row.id)}">${escapeHtml(row.使徒名)} (${escapeHtml(row.id)})</option>`
    )).join('');
    const species = Array.from(new Set(basicRows.map(row => String(row.種族 || '')).filter(Boolean)));
    elements.species.innerHTML = species.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
    const tierOptions = Array.from({ length: 5 }, (_, index) => {
      const tier = index + 1;
      return `<option value="${tier}">Tier ${tier}</option>`;
    }).join('');
    elements.tierSelects.forEach(select => {
      select.innerHTML = tierOptions;
      select.value = '3';
    });
    updateSpecialTypeOptions();
    updateReferenceStatus();
  }

  function bindEvents() {
    elements.sourceApostle.addEventListener('change', syncFromCurrentApostle);
    elements.species.addEventListener('change', () => {
      updateSpecialTypeOptions();
      updateReferenceStatus();
    });
    elements.specialType.addEventListener('change', updateReferenceStatus);
    elements.generate.addEventListener('click', generateTsv);
    elements.copy.addEventListener('click', copyTsv);
    elements.download.addEventListener('click', downloadTsv);
    elements.includeHeader.addEventListener('change', () => {
      if (elements.output.value) generateTsv();
    });
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
      counts[getSpecialEffectGroup(row.効果1_type)] += 1;
    });
    const signature = [counts.hp, counts.attack, counts.defense, counts.crit, counts.critRes].join(',');
    return SPECIAL_TYPE_BY_SIGNATURE.get(signature) || '';
  }

  function getSpecialEffectGroup(type) {
    const text = String(type || '');
    if (text === '全体HP') return 'hp';
    if (text.includes('攻撃力')) return 'attack';
    if (text.includes('防御力')) return 'defense';
    if (text === '会心抵抗') return 'critRes';
    return 'crit';
  }

  function syncFromCurrentApostle() {
    const currentId = elements.sourceApostle.value || basicRows[0]?.id || '';
    const basic = basicById.get(String(currentId)) || basicRows[0];
    if (!basic) return;
    const rows = DATA.getById('board', basic.id) || [];
    const specialType = inferSpecialType(rows);
    elements.id.value = '';
    elements.name.value = '';
    elements.species.value = String(basic.種族 || elements.species.options[0]?.value || '');
    updateSpecialTypeOptions(specialType);
    elements.attackType.value = normalizeAttackType(basic.攻撃タイプ || basic.攻撃Type);
    const inferredTiers = inferBoardTiers(rows, elements.attackType.value);
    elements.tierSelects.forEach(select => {
      select.value = String(inferredTiers[select.dataset.boardTsvTier] || 3);
    });
    elements.output.value = '';
    setStatus('現在選択中の使徒を初期値にしました。');
    updateReferenceStatus();
  }

  function updateSpecialTypeOptions(preferred = elements.specialType.value) {
    const species = elements.species.value;
    elements.specialType.innerHTML = SPECIAL_TYPES.map(item => {
      const reference = getReference(species, item.key);
      const effects = getBoardOneSpecialEffects(reference?.rows);
      const typeLabel = effects.length === 2 ? effects.join(' / ') : item.fallbackLabel;
      const suffix = !reference
        ? ' / 生成不可'
        : reference.synthetic
          ? ' / 合成'
          : ` / 例: ${reference.basic.使徒名}`;
      return `<option value="${item.key}"${reference ? '' : ' disabled'}>${escapeHtml(`${item.key}: ${typeLabel}${suffix}`)}</option>`;
    }).join('');
    const preferredOption = Array.from(elements.specialType.options).find(option => option.value === preferred && !option.disabled);
    const firstEnabled = Array.from(elements.specialType.options).find(option => !option.disabled);
    elements.specialType.value = preferredOption?.value || firstEnabled?.value || '';
  }

  function updateReferenceStatus() {
    const reference = getSelectedReference();
    if (!reference) {
      elements.reference.textContent = '該当テンプレートなし';
      elements.generate.disabled = true;
      return;
    }
    elements.reference.textContent = reference.synthetic
      ? `盤面: ${reference.geometryBasic.使徒名} / 特殊: ${reference.specialBasic.使徒名} / 合成`
      : `${reference.basic.使徒名} (${reference.basic.id}) / 実例`;
    elements.generate.disabled = false;
  }

  function getBoardOneSpecialEffects(rows = []) {
    return Array.from(new Set(rows
      .filter(row => Number(row.ボード階層) === 1 && row.マス_type === '特殊')
      .map(row => String(row.効果1_type || ''))
      .filter(Boolean)));
  }

  function getSelectedReference() {
    return getReference(elements.species.value, elements.specialType.value);
  }

  function getReference(species, specialType) {
    const exact = referenceCatalog.exact.get(referenceKey(species, specialType));
    if (exact) {
      return {
        ...exact,
        geometryBasic: exact.basic,
        specialBasic: exact.basic,
        synthetic: false
      };
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
    const levelsMatch = geometrySpecials.every((row, index) => (
      Number(row.ボード階層) === Number(payloads[index].ボード階層)
    ));
    if (!levelsMatch) return null;

    let specialIndex = 0;
    return geometryRows.map(source => {
      if (source.マス_type !== '特殊') return { ...source };
      const payload = payloads[specialIndex++];
      const row = {
        ...source,
        効果1_type: payload.効果1_type ?? '',
        効果1_value: payload.効果1_value ?? '',
        効果2_type: payload.効果2_type ?? '',
        効果2_value: payload.効果2_value ?? ''
      };
      row.表示用 = formatBoardDisplay(row);
      return row;
    });
  }

  function referenceKey(species, specialType) {
    return `${species}\u0000${specialType}`;
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
      const values = getNormalEffectValues(rows, effectType);
      const valueGroup = getTierValueGroup(effectType);
      const matched = Object.entries(BOARD_TIER_VALUES[valueGroup]).find(([, pair]) => pair[0] === values[0] && pair[1] === values[1]);
      return [key, matched ? Number(matched[0]) : 3];
    }));
  }

  function generateTsv() {
    const id = sanitizeIdentity(elements.id.value);
    const name = sanitizeIdentity(elements.name.value);
    const reference = getSelectedReference();
    if (!id || !name) {
      setStatus('idと使徒名を入力してください。', true);
      return;
    }
    if (!reference) {
      setStatus('盤面または特殊マスタイプの基準データが不足しています。', true);
      return;
    }

    const tiers = Object.fromEntries(elements.tierSelects.map(select => [select.dataset.boardTsvTier, Number(select.value) || 3]));
    const rows = generateBoardRows(reference.rows, {
      id,
      name,
      attackType: elements.attackType.value,
      tiers
    });
    const table = elements.includeHeader.checked ? [BOARD_COLUMNS, ...rows] : rows;
    elements.output.value = table.map(row => row.map(formatTsvCell).join('\t')).join('\r\n');
    const duplicate = basicById.has(id) ? ' / 既存idと重複' : '';
    const source = reference.synthetic ? ' / 合成テンプレート' : '';
    setStatus(`${rows.length}行を生成しました${source}${duplicate}`, basicById.has(id));
  }

  function generateBoardRows(referenceRows, settings) {
    const normalValues = collectReferenceNormalRanges(referenceRows);
    return referenceRows.map(source => {
      const row = { ...source, id: settings.id, 使徒名: settings.name };
      if (row.マス_type === '通常') {
        const sourceType = String(row.効果1_type || '');
        const tierKey = getTierControlKey(sourceType);
        const tier = settings.tiers[tierKey] || 3;
        const valueGroup = getTierValueGroup(sourceType);
        const range = normalValues.get(sourceType) || [Number(row.効果1_value) || 0, Number(row.効果1_value) || 0];
        const high = Number(row.効果1_value) === range[1];
        if (sourceType === '物理攻撃力' || sourceType === '魔法攻撃力') {
          row.効果1_type = settings.attackType === '魔法' ? '魔法攻撃力' : '物理攻撃力';
        }
        row.効果1_value = BOARD_TIER_VALUES[valueGroup][tier][high ? 1 : 0];
      }
      row.表示用 = formatBoardDisplay(row);
      return BOARD_COLUMNS.map(column => row[column] ?? '');
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

  function getNormalEffectValues(rows, effectType) {
    return Array.from(new Set(rows
      .filter(row => row.マス_type === '通常' && row.効果1_type === effectType)
      .map(row => Number(row.効果1_value) || 0)))
      .sort((a, b) => a - b);
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

  function formatBoardDisplay(row) {
    if (row.マス_type === 'スタート') return 'スタート';
    if (row.マス_type === 'ゲート') return 'ゲート';
    const suffix = row.マス_type === '特殊' ? '%' : '';
    return [
      formatEffectDisplay(row.効果1_type, row.効果1_value, suffix),
      formatEffectDisplay(row.効果2_type, row.効果2_value, suffix)
    ].filter(Boolean).join(' / ');
  }

  function formatEffectDisplay(type, value, suffix) {
    if (!type) return '';
    if (value === '' || value === null || value === undefined) return String(type);
    return `${type}+${formatNumber(value)}${suffix}`;
  }

  function formatNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value ?? '');
    return Number.isInteger(number) ? String(number) : String(number).replace(/0+$/, '').replace(/\.$/, '');
  }

  function formatTsvCell(value) {
    const text = typeof value === 'number' ? formatNumber(value) : String(value ?? '');
    return /[\t\r\n"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  async function copyTsv() {
    if (!elements.output.value) generateTsv();
    if (!elements.output.value) return;
    try {
      await navigator.clipboard.writeText(elements.output.value);
      setStatus('TSVをコピーしました。');
    } catch (error) {
      elements.output.focus();
      elements.output.select();
      const copied = document.execCommand('copy');
      setStatus(copied ? 'TSVをコピーしました。' : 'コピーできませんでした。', !copied);
    }
  }

  function downloadTsv() {
    if (!elements.output.value) generateTsv();
    if (!elements.output.value) return;
    const id = sanitizeIdentity(elements.id.value) || 'new-apostle';
    const blob = new Blob(['\ufeff', elements.output.value], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${id}-board.tsv`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('TSVをダウンロードしました。');
  }

  function sanitizeIdentity(value) {
    return String(value || '').replace(/[\t\r\n]+/g, ' ').trim();
  }

  function normalizeAttackType(value) {
    return String(value || '').includes('魔') ? '魔法' : '物理';
  }

  function setStatus(message, error = false) {
    elements.status.textContent = message;
    elements.status.classList.toggle('is-error', error);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.TRICKCAL_BOARD_TSV_GENERATOR = {
    columns: BOARD_COLUMNS.slice(),
    specialTypes: SPECIAL_TYPES.map(item => ({ ...item })),
    inferSpecialType,
    composeReferenceRows,
    generateBoardRows,
    formatTsvCell
  };
})();
