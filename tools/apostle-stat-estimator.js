(function () {
  'use strict';

  const DATA = window.TRICKCAL_STAT_DATA;
  const ENGINE = window.TRICKCAL_SHARED_STAT_ENGINE;
  if (!DATA || !ENGINE) return;

  const STAT_DEFS = [
    { key: 'hp', label: 'HP', tierField: 'HPタイプ', group: 'hp' },
    { key: 'patk', label: '物理攻撃力', tierField: '物理攻撃力タイプ', group: 'attack', attack: '物理' },
    { key: 'matk', label: '魔法攻撃力', tierField: '魔法攻撃力タイプ', group: 'attack', attack: '魔法' },
    { key: 'pdef', label: '物理防御力', tierField: '物理防御力タイプ', group: 'defense' },
    { key: 'mdef', label: '魔法防御力', tierField: '魔法防御力タイプ', group: 'defense' },
    { key: 'crit', label: '会心', tierField: '会心タイプ', group: 'crit' },
    { key: 'critDmg', label: '会心DMG', tierField: '会心DMGタイプ', group: 'crit' },
    { key: 'critRes', label: '会心抵抗', tierField: '会心抵抗タイプ', group: 'crit' },
    { key: 'critDmgRes', label: '会心DMG抵抗', tierField: '会心DMG抵抗タイプ', group: 'crit' }
  ];
  const ASIDE_DEFS = [
    { key: 'hp', label: 'HP', tierField: 'HPタイプ', manifestField: 'HP発現値', growthField: 'HP_A1成長値', starField: 'HP星上昇値', group: 'hp' },
    { key: 'attack', label: '攻撃力', group: 'attack' },
    { key: 'pdef', label: '物理防御力', tierField: '物理防御力タイプ', manifestField: '物理防御力発現値', growthField: '物理防御力_A1成長値', starField: '物理防御力星上昇値', group: 'defense' },
    { key: 'mdef', label: '魔法防御力', tierField: '魔法防御力タイプ', manifestField: '魔法防御力発現値', growthField: '魔法防御力_A1成長値', starField: '魔法防御力星上昇値', group: 'defense' }
  ];
  const CP_RARITY = { 1: 1.015, 2: 1.03, 3: 1.06 };
  const CP_SKILL = { 1: 0.005, 2: 0.01, 3: 0.02 };
  const SNAPSHOT_STAT_KEYS = {
    hp: 'hp', patk: 'physicalAtk', matk: 'magicAtk', pdef: 'physicalDef', mdef: 'magicDef',
    crit: 'crit', critDmg: 'critDmg', critRes: 'critRes', critDmgRes: 'critDmgRes'
  };
  const NAMED_STAT_KEYS = {
    HP: 'hp', 最大HP: 'hp', 物理攻撃力: 'patk', 魔法攻撃力: 'matk', 攻撃力: 'attackAll',
    物理防御力: 'pdef', 魔法防御力: 'mdef', 防御力: 'defenseAll', 会心: 'crit', 会心DMG: 'critDmg',
    会心ダメージ: 'critDmg', 会心抵抗: 'critRes', 会心DMG抵抗: 'critDmgRes', 会心ダメージ抵抗: 'critDmgRes'
  };
  const BASIC_TSV_COLUMNS = [
    '使徒名', 'HPTier', '物理攻撃力Tier', '魔法攻撃力Tier', '物理防御力Tier', '魔法防御力Tier',
    '会心Tier', '会心DMGTier', '会心抵抗Tier', '会心DMG抵抗Tier', '戦闘力補正値A', '戦闘力補正値B'
  ];
  const ASIDE_TSV_COLUMNS = [
    '使徒名', 'HP_AsideTier', '物理攻撃力_AsideTier', '魔法攻撃力_AsideTier', '物理防御力_AsideTier', '魔法防御力_AsideTier',
    'HP_AsideBonus', '物理攻撃力_AsideBonus', '魔法攻撃力_AsideBonus', '物理防御力_AsideBonus', '魔法防御力_AsideBonus',
    'HP_AsideGrowth', '物理攻撃力_AsideGrowth', '魔法攻撃力_AsideGrowth', '物理防御力_AsideGrowth', '魔法防御力_AsideGrowth',
    'HP_AsideStarBonus', '物理攻撃力_AsideStarBonus', '魔法攻撃力_AsideStarBonus', '物理防御力_AsideStarBonus', '魔法防御力_AsideStarBonus'
  ];

  const elements = {
    source: document.getElementById('estimator-source-apostle'),
    name: document.getElementById('estimator-name'),
    rarity: document.getElementById('estimator-rarity'),
    attackType: document.getElementById('estimator-attack-type'),
    role: document.getElementById('estimator-role'),
    species: document.getElementById('estimator-species'),
    level: document.getElementById('estimator-level'),
    star: document.getElementById('estimator-star'),
    grade: document.getElementById('estimator-grade'),
    rank: document.getElementById('estimator-rank'),
    bond: document.getElementById('estimator-bond'),
    equipmentEnhances: Array.from(document.querySelectorAll('[data-equipment-enhance]')),
    observed: Array.from(document.querySelectorAll('[data-observed-stat]')),
    asideGains: Array.from(document.querySelectorAll('[data-aside-gain]')),
    asideValueMode: document.getElementById('estimator-aside-value-mode'),
    globalAdditives: Array.from(document.querySelectorAll('[data-global-additive]')),
    globalPercents: Array.from(document.querySelectorAll('[data-global-percent]')),
    loadGlobalPercent: document.getElementById('estimator-load-global-percent'),
    globalPercentStatus: document.getElementById('estimator-global-percent-status'),
    cpObservations: document.getElementById('estimator-cp-observations'),
    summary: document.getElementById('estimator-summary'),
    baseResults: document.getElementById('estimator-base-results'),
    asideResults: document.getElementById('estimator-aside-results'),
    cpResults: document.getElementById('estimator-cp-results'),
    cpConfidence: document.getElementById('estimator-cp-confidence'),
    output: document.getElementById('estimator-output'),
    includeHeader: document.getElementById('estimator-include-header'),
    recalculate: document.getElementById('estimator-recalculate'),
    copy: document.getElementById('estimator-copy')
  };
  if (!elements.source || !elements.baseResults) return;

  const basicRows = DATA.sheets?.basicInfo || [];
  const asideRows = DATA.sheets?.asideTiers || [];
  const cpPairCatalog = buildCpPairCatalog();
  let latestPrediction = null;
  let updateTimer = 0;

  initialize();

  function initialize() {
    elements.source.insertAdjacentHTML('beforeend', basicRows.map(row => (
      `<option value="${escapeHtml(row.id)}">${escapeHtml(row.使徒名)} (${escapeHtml(row.id)})</option>`
    )).join(''));
    elements.rank.innerHTML = Array.from({ length: 10 }, (_, index) => `<option value="${index + 1}">Rank ${index + 1}</option>`).join('');
    elements.bond.innerHTML = '<option value="0">なし</option>' + Array.from({ length: 30 }, (_, index) => `<option value="${index + 1}">Lv${index + 1}</option>`).join('');
    elements.equipmentEnhances.forEach(select => {
      select.innerHTML = '<option value="off">なし</option>' + Array.from({ length: 6 }, (_, enhance) => `<option value="${enhance}">+${enhance}</option>`).join('');
    });
    renderCpObservationRows();
    bindEvents();
    syncAttackTypeVisibility();
    recalculate();
  }

  function renderCpObservationRows() {
    elements.cpObservations.innerHTML = [1, 2, 3].map(index => `
      <div class="cp-row" data-cp-observation="${index}">
        <span class="cp-index">${index}</span>
        <label class="field"><span>表示CP${index === 1 ? '' : '（任意）'}</span><input type="number" min="0" data-cp-field="cp"></label>
        <label class="field"><span>ステータス</span><select data-cp-field="statsMode"><option value="base">入力値</option><option value="aside">入力値+A1発現</option></select></label>
        <label class="field"><span>アサイド</span><select data-cp-field="asideRank"><option value="0">未発現</option><option value="1">A1</option><option value="2">A2</option><option value="3">A3</option></select></label>
        <label class="field cp-field-skill"><span>低SLv</span><input type="number" min="1" max="15" value="1" data-cp-field="low"></label>
        <label class="field cp-field-skill"><span>高SLv</span><input type="number" min="1" max="15" value="1" data-cp-field="high"></label>
        <label class="field cp-field-skill"><span>PSLv</span><input type="number" min="1" max="15" value="1" data-cp-field="passive"></label>
      </div>
    `).join('');
  }

  function bindEvents() {
    elements.source.addEventListener('change', loadReferenceApostle);
    elements.attackType.addEventListener('change', () => {
      syncAttackTypeVisibility();
      scheduleUpdate();
    });
    document.querySelectorAll('#estimator-name, #estimator-rarity, #estimator-role, #estimator-species, #estimator-level, #estimator-star, #estimator-grade, #estimator-rank, #estimator-bond, #estimator-aside-value-mode, [data-equipment-enhance], [data-observed-stat], [data-aside-gain], [data-global-additive], [data-global-percent], [data-cp-field]')
      .forEach(control => control.addEventListener('input', scheduleUpdate));
    elements.globalAdditives.forEach(control => control.addEventListener('input', () => {
      setGlobalPercentStatus('入力した全体加算・全体補正で計算しています。');
    }));
    elements.globalPercents.forEach(control => control.addEventListener('input', () => {
      setGlobalPercentStatus('入力した全体加算・全体補正で計算しています。');
    }));
    elements.asideValueMode?.addEventListener('change', syncAsideValueMode);
    elements.loadGlobalPercent?.addEventListener('click', loadGlobalPercentFromStatManager);
    elements.recalculate.addEventListener('click', recalculate);
    elements.includeHeader.addEventListener('change', renderTsvOutput);
    elements.copy.addEventListener('click', copyOutput);
    syncAsideValueMode();
  }

  function scheduleUpdate() {
    window.clearTimeout(updateTimer);
    updateTimer = window.setTimeout(recalculate, 90);
  }

  function loadReferenceApostle() {
    const basic = basicRows.find(row => String(row.id) === elements.source.value);
    if (!basic) return;
    elements.name.value = basic.使徒名 || '';
    elements.rarity.value = String(Number(basic.レア度) || 3);
    elements.attackType.value = normalizeAttackType(basic.攻撃タイプ || basic.攻撃Type);
    elements.role.value = basic.役割 || '攻撃';
    elements.species.value = basic.種族 || '妖精';
    elements.level.value = '1';
    elements.star.value = String(Number(basic.レア度) || 3);
    elements.grade.value = '1';
    elements.rank.value = '1';
    elements.bond.value = '0';
    elements.equipmentEnhances.forEach(select => { select.value = 'off'; });
    syncAttackTypeVisibility();

    const state = createApostleState();
    const totals = ENGINE.calculateBaseTotals(DATA, basic, state);
    elements.observed.forEach(input => { input.value = totals[input.dataset.observedStat] || ''; });
    const aside = asideRows.find(row => String(row.id) === String(basic.id));
    const attackFields = getAsideAttackFields();
    const gains = {
      hp: Number(aside?.HP発現値) || 0,
      attack: Number(aside?.[attackFields.manifest]) || 0,
      pdef: Number(aside?.物理防御力発現値) || 0,
      mdef: Number(aside?.魔法防御力発現値) || 0
    };
    elements.asideGains.forEach(input => { input.value = gains[input.dataset.asideGain] || ''; });
    elements.globalAdditives.forEach(input => { input.value = '0'; });
    elements.globalPercents.forEach(input => { input.value = '0'; });
    setGlobalPercentStatus('既知の補正前発現値を読み込んだため、全体補正なしとして計算します。');

    const stats = mapTotalsToSnapshot(totals);
    const cpRows = getCpRows();
    setCpRow(cpRows[0], {
      cp: ENGINE.calculateCombatPower(basic, { ...state, asideRank: 0, skillLevels: { low: 1, high: 1, passive: 1 } }, stats),
      statsMode: 'base', asideRank: 0
    });
    if (aside) {
      const asideStats = addAsideGainsToStats(stats, gains);
      setCpRow(cpRows[1], {
        cp: ENGINE.calculateCombatPower(basic, { ...state, asideRank: 2, skillLevels: { low: 1, high: 1, passive: 1 } }, asideStats),
        statsMode: 'aside', asideRank: 2
      });
    } else {
      setCpRow(cpRows[1], { cp: '', statsMode: 'base', asideRank: 0 });
    }
    setCpRow(cpRows[2], { cp: '', statsMode: 'base', asideRank: 0 });
    recalculate();
  }

  function setCpRow(row, values) {
    if (!row) return;
    Object.entries(values).forEach(([key, value]) => {
      const control = row.querySelector(`[data-cp-field="${key}"]`);
      if (control) control.value = String(value);
    });
  }

  function syncAttackTypeVisibility() {
    const magic = elements.attackType.value === '魔法';
    document.querySelectorAll('.physical-only').forEach(node => { node.hidden = magic; });
    document.querySelectorAll('.magic-only').forEach(node => { node.hidden = !magic; });
  }

  function syncAsideValueMode() {
    scheduleUpdate();
  }

  function loadGlobalPercentFromStatManager() {
    const context = readStatManagerContext();
    const apostleId = elements.source.value || context?.activeId || '';
    const apostleState = context?.apostles?.[apostleId] || context?.apostles?.[context?.activeId] || null;
    const snapshot = apostleState?.statSnapshots?.current || apostleState?.statSnapshots?.planned || null;
    const rates = snapshot?.globalPercentRates;
    if (!rates) {
      setGlobalPercentStatus('ステ管理の全体補正を取得できませんでした。ステータス管理を一度表示・更新してから再度お試しください。', true);
      return;
    }
    if (elements.source.value && context?.apostles?.[apostleId]) {
      elements.level.value = String(Math.max(1, Number(apostleState.level) || 1));
      elements.star.value = String(Math.max(1, Number(apostleState.star) || Number(basicRows.find(row => row.id === apostleId)?.レア度) || 1));
      elements.grade.value = String(Math.max(1, Number(apostleState.grade) || 1));
      elements.rank.value = String(Math.max(1, Number(apostleState.rank) || 1));
      elements.bond.value = String(Math.max(0, Number(apostleState.bond) || 0));
      const equipmentKeys = {
        hp: 'HP',
        attack: elements.attackType.value === '魔法' ? '魔法攻撃' : '物理攻撃',
        pdef: '物理防御', mdef: '魔法防御', critPair: '会心/会心DMG', critResPair: '会心抵抗/会心DMG抵抗'
      };
      elements.equipmentEnhances.forEach(select => {
        const saved = apostleState.equipment?.[equipmentKeys[select.dataset.equipmentEnhance]];
        select.value = saved?.enabled ? String(Math.max(0, Math.min(5, Number(saved.enhance) || 0))) : 'off';
      });
    }
    const additive = calculateGlobalAdditivesFromContext(context);
    elements.globalAdditives.forEach(input => {
      input.value = formatInputNumber(additive[input.dataset.globalAdditive] || 0);
    });
    elements.globalPercents.forEach(input => {
      const key = input.dataset.globalPercent;
      input.value = formatInputNumber(Number(rates[SNAPSHOT_STAT_KEYS[key]] ?? rates[key]) || 0);
    });
    const basic = basicRows.find(row => String(row.id) === String(apostleId));
    setGlobalPercentStatus(`${basic?.使徒名 || apostleId || '編集中使徒'}の設定から、Rank全体・研究・上級マス・クレヨン・A3等を読み込みました。`);
    recalculate();
  }

  function calculateGlobalAdditivesFromContext(context) {
    const totals = createStatTotals();
    (DATA.sheets?.rankGlobalBonuses || []).forEach(row => {
      const rank = Math.max(1, Number(context?.apostles?.[row.id]?.rank) || 1);
      for (let rankFrom = 1; rankFrom <= Math.min(rank - 1, 9); rankFrom += 1) {
        for (let index = 1; index <= 2; index += 1) {
          addNamedStat(totals, row[`Rank${rankFrom}to${rankFrom + 1}_type${index}`], row[`Rank${rankFrom}to${rankFrom + 1}_value${index}`]);
        }
      }
    });
    basicRows.forEach(basic => {
      const boards = context?.apostles?.[basic.id]?.boards || {};
      (DATA.getById('board', basic.id) || []).forEach(row => {
        if (row.マス_type !== '上級') return;
        const key = `${row.ボード階層}:${row.X_pos}:${row.Y_pos}`;
        if (!boards?.[String(row.ボード階層)]?.filled?.[key]) return;
        addNamedStat(totals, row.効果1_type, row.効果1_value);
        addNamedStat(totals, row.効果2_type, row.効果2_value);
      });
    });
    const researchLevel = Number(context?.research?.level) || 0;
    const researchProgress = Number(context?.research?.progress) || 0;
    if (researchLevel && researchProgress) {
      (DATA.sheets?.research || []).filter(row => row.種族 === elements.species.value && row.ステータス).forEach(row => {
        const rowCount = Number(row.id) || 0;
        const maxStage = rowCount <= researchProgress ? researchLevel : researchLevel - 1;
        let value = 0;
        for (let stage = 1; stage <= maxStage; stage += 1) value += Number(row[`段階${stage}`]) || 0;
        addNamedStat(totals, row.ステータス, value);
      });
    }
    return totals;
  }

  function createStatTotals() {
    return Object.fromEntries(Object.keys(SNAPSHOT_STAT_KEYS).map(key => [key, 0]));
  }

  function addNamedStat(totals, rawName, rawValue) {
    const name = String(rawName || '');
    const key = NAMED_STAT_KEYS[name] || NAMED_STAT_KEYS[name.replace(/全体/g, '')] || '';
    const value = Number(rawValue) || 0;
    if (!key || !value) return;
    if (key === 'attackAll') {
      totals.patk += value;
      totals.matk += value;
    } else if (key === 'defenseAll') {
      totals.pdef += value;
      totals.mdef += value;
    } else if (Object.prototype.hasOwnProperty.call(totals, key)) {
      totals[key] += value;
    }
  }

  function readStatManagerContext() {
    try {
      const live = JSON.parse(localStorage.getItem('trickcal_stat_live_v2') || 'null');
      if (live?.snapshot?.apostles) return live.snapshot;
    } catch {}
    try {
      const workspace = JSON.parse(sessionStorage.getItem('trickcal_stat_workspace_v2') || 'null');
      if (workspace?.draft?.apostles) return workspace.draft;
    } catch {}
    try {
      const legacy = JSON.parse(localStorage.getItem('trickcal_stat_prototype_v1') || 'null');
      if (legacy?.apostles) return legacy;
    } catch {}
    return null;
  }

  function setGlobalPercentStatus(message, isError = false) {
    if (!elements.globalPercentStatus) return;
    elements.globalPercentStatus.textContent = message;
    elements.globalPercentStatus.classList.toggle('is-error', isError);
  }

  function recalculate() {
    const base = predictBaseTiers();
    const aside = predictAsideTiers();
    const cp = predictCombatPowerCorrections();
    latestPrediction = { base, aside, cp };
    renderBaseResults(base);
    renderAsideResults(aside);
    renderCpResults(cp);
    renderTsvOutput();
    const filled = base.filter(item => item.observed > 0).length;
    const asideFilled = aside.filter(item => item.observed > 0).length;
    elements.summary.textContent = `通常tier ${filled}/8項目・アサイド ${asideFilled}/4項目・CP観測 ${cp.observationCount}件を使用`;
  }

  function predictBaseTiers() {
    const attackType = elements.attackType.value;
    return STAT_DEFS
      .filter(def => !def.attack || def.attack === attackType)
      .map(def => {
        const observed = readNumber(elements.observed.find(input => input.dataset.observedStat === def.key)?.value);
        const candidates = Array.from({ length: 5 }, (_, index) => {
          const tier = index + 1;
          const expected = calculateExpectedBaseStat(def, tier);
          return { tier, expected, error: Math.abs(expected - observed) };
        }).sort((a, b) => a.error - b.error || a.tier - b.tier);
        return { ...def, observed, candidates, best: observed > 0 ? candidates[0] : null };
      });
  }

  function calculateExpectedBaseStat(def, tier) {
    const basic = createCandidateBasic();
    basic[def.tierField] = tier;
    const totals = ENGINE.calculateBaseTotals(DATA, basic, createApostleState());
    let expected = Number(totals[def.key]) || 0;
    expected += calculateRankUpBonus(def, tier);
    expected += calculateEquipmentBonus(def, tier);
    expected += calculateBondBonus(def.key);
    expected += getGlobalAdditive(def.key);
    const percent = getGlobalPercent(def.key);
    return expected + Math.floor(expected * percent / 100);
  }

  function calculateRankUpBonus(def, tier) {
    const rank = Math.max(1, readNumber(elements.rank.value) || 1);
    const valueKey = def.group === 'hp' ? 'HP' : def.group === 'attack' ? '攻撃力' : def.group === 'defense' ? '防御力' : '会心系';
    let total = 0;
    for (let rankFrom = 1; rankFrom < rank; rankFrom += 1) {
      const row = (DATA.sheets?.rankUpBonuses || []).find(item => Number(item.rank_from) === rankFrom && Number(item.tier) === tier);
      total += Number(row?.[valueKey]) || 0;
    }
    return total;
  }

  function calculateEquipmentBonus(def, tier) {
    const equipmentKey = def.key === 'hp' ? 'hp'
      : def.key === 'patk' || def.key === 'matk' ? 'attack'
        : def.key === 'pdef' ? 'pdef' : def.key === 'mdef' ? 'mdef'
          : def.key === 'crit' || def.key === 'critDmg' ? 'critPair' : 'critResPair';
    const control = elements.equipmentEnhances.find(select => select.dataset.equipmentEnhance === equipmentKey);
    if (!control || control.value === 'off') return 0;
    const statGroup = def.key === 'patk' ? '物理攻撃力' : def.key === 'matk' ? '魔法攻撃力'
      : def.key === 'pdef' ? '物理防御力' : def.key === 'mdef' ? '魔法防御力'
        : def.key === 'crit' || def.key === 'critDmg' ? '会心/会心DMG'
          : def.key === 'critRes' || def.key === 'critDmgRes' ? '会心抵抗/会心DMG抵抗' : 'HP';
    const rank = Math.max(1, readNumber(elements.rank.value) || 1);
    const row = (DATA.sheets?.equipmentValues || []).find(item => Number(item.rank) === rank && String(item.statGroup) === statGroup && Number(item.tier) === tier);
    return Number(row?.[`enhance${readNumber(control.value)}`]) || 0;
  }

  function calculateBondBonus(key) {
    if (!['crit', 'critDmg', 'critRes', 'critDmgRes'].includes(key)) return 0;
    const level = readNumber(elements.bond.value);
    if (!level) return 0;
    const row = (DATA.sheets?.bondBonuses || []).find(item => Number(String(item.好感度Lv || '').replace(/[^\d]/g, '')) === level);
    const column = { crit: '会心', critDmg: '会心DMG', critRes: '会心抵抗', critDmgRes: '会心DMG抵抗' }[key];
    return Number(row?.[column]) || 31 * level;
  }

  function getGlobalAdditive(key) {
    return readNumber(elements.globalAdditives.find(input => input.dataset.globalAdditive === key)?.value);
  }

  function getGlobalPercent(key) {
    return readNumber(elements.globalPercents.find(input => input.dataset.globalPercent === key)?.value);
  }

  function predictAsideTiers() {
    const attackFields = getAsideAttackFields();
    return ASIDE_DEFS.map(rawDef => {
      const def = rawDef.key === 'attack'
        ? { ...rawDef, tierField: attackFields.tier, manifestField: attackFields.manifest, growthField: attackFields.growth, starField: attackFields.star }
        : rawDef;
      const observed = readNumber(elements.asideGains.find(input => input.dataset.asideGain === def.key)?.value);
      const globalPercent = getAsideGlobalPercent(def.key);
      const candidates = Array.from({ length: 5 }, (_, index) => {
        const tier = index + 1;
        const expected = getAsideTierExpected(def, tier);
        const displayedRange = calculateDisplayedAsideGainRange(expected.manifest, globalPercent);
        const displayedManifest = clamp(observed, displayedRange.min, displayedRange.max);
        const error = observed < displayedRange.min
          ? displayedRange.min - observed
          : observed > displayedRange.max ? observed - displayedRange.max : 0;
        return { tier, ...expected, displayedManifest, displayedRange, globalPercent, error };
      }).sort((a, b) => a.error - b.error || a.tier - b.tier);
      return { ...def, observed, globalPercent, candidates, best: observed > 0 ? candidates[0] : null };
    });
  }

  function getAsideGlobalPercent(key) {
    if (elements.asideValueMode?.value === 'raw') return 0;
    const statKey = key === 'attack' ? (elements.attackType.value === '魔法' ? 'matk' : 'patk') : key;
    return getGlobalPercent(statKey);
  }

  function calculateDisplayedAsideGainRange(manifest, globalPercent) {
    const raw = Number(manifest) || 0;
    const rate = Number(globalPercent) || 0;
    const percentIncrease = raw * rate / 100;
    return {
      min: raw + Math.floor(percentIncrease),
      max: raw + Math.ceil(percentIncrease)
    };
  }

  function getAsideTierExpected(def, tier) {
    const matching = asideRows.filter(row => Number(row?.[def.tierField]) === tier && Number(row?.[def.manifestField]) > 0);
    const manifest = median(matching.map(row => Number(row[def.manifestField])).filter(Number.isFinite))
      || getBaseStatValue(tier, def.group, 'base') * 3;
    const growth = median(matching.map(row => Number(row[def.growthField])).filter(Number.isFinite))
      || getBaseStatValue(tier, def.group, 'coeff') * 3;
    const star = median(matching.map(row => Number(row[def.starField])).filter(Number.isFinite)) || 0;
    return { manifest, growth, star };
  }

  function predictCombatPowerCorrections() {
    const observations = collectCpObservations();
    if (!observations.length) return { observationCount: 0, candidates: [] };
    const candidateMap = new Map();
    cpPairCatalog.forEach(item => candidateMap.set(pairKey(item.a, item.b), { ...item, known: true }));
    for (let a = 60; a <= 150; a += 5) {
      for (let bMilli = 150; bMilli <= 650; bMilli += 5) {
        const b = bMilli / 1000;
        const key = pairKey(a, b);
        if (!candidateMap.has(key)) candidateMap.set(key, { a, b, count: 0, examples: [], known: false });
      }
    }
    const candidates = Array.from(candidateMap.values()).map(candidate => {
      const predictions = observations.map(observation => calculateCpCandidate(candidate, observation));
      const totalError = predictions.reduce((sum, item) => sum + Math.abs(item.predicted - item.actual), 0);
      const maxError = Math.max(...predictions.map(item => Math.abs(item.predicted - item.actual)));
      return { ...candidate, predictions, totalError, maxError };
    }).sort((a, b) => (
      a.totalError - b.totalError
      || b.count - a.count
      || Math.abs(a.a - 120) - Math.abs(b.a - 120)
      || a.b - b.b
    ));
    return { observationCount: observations.length, candidates: candidates.slice(0, 12), exactCount: candidates.filter(item => item.totalError === 0).length };
  }

  function collectCpObservations() {
    const baseStats = getObservedSnapshotStats();
    const gains = getAsideGainValues();
    return getCpRows().map(row => {
      const cp = readNumber(row.querySelector('[data-cp-field="cp"]')?.value);
      if (!(cp > 0)) return null;
      const mode = row.querySelector('[data-cp-field="statsMode"]')?.value || 'base';
      return {
        cp,
        stats: mode === 'aside' ? addAsideGainsToStats(baseStats, gains) : { ...baseStats },
        asideRank: readNumber(row.querySelector('[data-cp-field="asideRank"]')?.value),
        skillLevels: {
          low: Math.max(1, readNumber(row.querySelector('[data-cp-field="low"]')?.value) || 1),
          high: Math.max(1, readNumber(row.querySelector('[data-cp-field="high"]')?.value) || 1),
          passive: Math.max(1, readNumber(row.querySelector('[data-cp-field="passive"]')?.value) || 1)
        }
      };
    }).filter(Boolean);
  }

  function calculateCpCandidate(candidate, observation) {
    const rarity = readNumber(elements.rarity.value) || 3;
    const attack = elements.attackType.value === '魔法' ? observation.stats.magicAtk : observation.stats.physicalAtk;
    const other = observation.stats.physicalDef + observation.stats.magicDef + observation.stats.crit
      + observation.stats.critDmg + observation.stats.critRes + observation.stats.critDmgRes;
    const basePower = observation.stats.hp * 0.08 + attack * 2.1 + (other + candidate.a) * 0.7;
    const skillSum = observation.skillLevels.low + observation.skillLevels.high + observation.skillLevels.passive;
    const multiplier = (CP_RARITY[rarity] || CP_RARITY[3]) + candidate.b
      + (observation.asideRank >= 2 ? 0.7 : 0)
      + (CP_SKILL[rarity] || CP_SKILL[3]) * Math.max(0, skillSum - 3);
    return { actual: observation.cp, predicted: Math.max(0, Math.floor(basePower * multiplier)) };
  }

  function renderBaseResults(results) {
    elements.baseResults.innerHTML = results.map(item => renderTierCard(item, false)).join('');
  }

  function renderAsideResults(results) {
    elements.asideResults.innerHTML = results.map(item => renderTierCard(item, true)).join('');
  }

  function renderTierCard(item, aside) {
    if (!item.best) return `<article class="result-card is-missing"><div class="result-card-head"><h4>${escapeHtml(item.label)}</h4><strong>未入力</strong></div><p>値を入力すると候補を表示します。</p></article>`;
    const best = item.best;
    const second = item.candidates[1];
    const exact = best.error === 0;
    const mainDetail = aside
      ? `${item.globalPercent ? `表示期待 ${formatAsideRange(best.displayedRange)}（発現 ${formatNumber(best.manifest)}・全体+${formatNumber(item.globalPercent)}%）` : `発現 ${formatNumber(best.manifest)}`} / 成長 ${formatNumber(best.growth)} / 星 ${formatNumber(best.star)}`
      : `期待 ${formatNumber(best.expected)} / 入力 ${formatNumber(item.observed)}`;
    const secondDetail = aside
      ? `次点 T${second.tier}（${item.globalPercent ? '表示期待' : '発現'} ${formatAsideRange(second.displayedRange)}・最小差 ${formatNumber(second.error)}）`
      : `次点 T${second.tier}（期待 ${formatNumber(second.expected)}・差 ${formatSignedError(second.expected - item.observed)}）`;
    return `<article class="result-card${exact ? ' is-exact' : ''}">
      <div class="result-card-head"><h4>${escapeHtml(item.label)}</h4><strong>Tier ${best.tier}</strong></div>
      <p>${escapeHtml(mainDetail)} <span class="${exact ? '' : 'error'}">差 ${formatSignedError((aside ? best.displayedManifest : best.expected) - item.observed)}</span></p>
      <p class="candidate">${escapeHtml(secondDetail)}</p>
    </article>`;
  }

  function renderCpResults(result) {
    elements.cpConfidence.className = 'confidence';
    if (!result.observationCount) {
      elements.cpConfidence.textContent = '未計算';
      elements.cpConfidence.classList.add('is-low');
      elements.cpResults.innerHTML = '<p class="cp-empty">表示CPを1件以上入力してください。</p>';
      return;
    }
    const best = result.candidates[0];
    const high = result.observationCount >= 2 && best?.totalError === 0 && result.exactCount === 1;
    const medium = result.observationCount >= 2 && best?.totalError <= 2;
    elements.cpConfidence.textContent = high ? '一意候補' : medium ? '有力候補' : '予測候補';
    elements.cpConfidence.classList.add(high ? 'is-high' : medium ? '' : 'is-low');
    const ambiguity = result.exactCount > 1 ? `完全一致 ${result.exactCount}組` : '';
    elements.cpResults.innerHTML = result.candidates.map((item, index) => {
      const detail = item.predictions.map((prediction, obsIndex) => `観測${obsIndex + 1}: ${formatNumber(prediction.predicted)}/${formatNumber(prediction.actual)}`).join('・');
      const known = item.known ? `既存${item.count}件${item.examples.length ? `（${item.examples.slice(0, 2).join('・')}）` : ''}` : '未出組合せ';
      return `<div class="cp-candidate${index === 0 ? ' is-best' : ''}">
        <span class="cp-rank">#${index + 1}</span>
        <span class="cp-pair">A ${formatNumber(item.a)}</span>
        <span class="cp-pair">B ${formatDecimal(item.b)}</span>
        <span class="cp-detail" title="${escapeHtml(`${detail} / ${known}`)}">誤差 ${formatNumber(item.totalError)} / ${escapeHtml(known)} / ${escapeHtml(detail)}</span>
      </div>`;
    }).join('') + (ambiguity ? `<p class="cp-empty">${escapeHtml(ambiguity)}あります。倍率条件の異なるCPを追加すると絞り込めます。</p>` : '');
  }

  function renderTsvOutput() {
    if (!latestPrediction) return;
    const attackType = elements.attackType.value;
    const baseByKey = Object.fromEntries(latestPrediction.base.map(item => [item.key, item.best?.tier || '']));
    const asideByKey = Object.fromEntries(latestPrediction.aside.map(item => [item.key, item.best || null]));
    const bestCp = latestPrediction.cp.candidates?.[0] || {};
    const name = elements.name.value.trim();
    const basicRow = {
      使徒名: name,
      HPTier: baseByKey.hp,
      物理攻撃力Tier: attackType === '物理' ? baseByKey.patk : 0,
      魔法攻撃力Tier: attackType === '魔法' ? baseByKey.matk : 0,
      物理防御力Tier: baseByKey.pdef,
      魔法防御力Tier: baseByKey.mdef,
      会心Tier: baseByKey.crit,
      会心DMGTier: baseByKey.critDmg,
      会心抵抗Tier: baseByKey.critRes,
      会心DMG抵抗Tier: baseByKey.critDmgRes,
      戦闘力補正値A: bestCp.a ?? '',
      戦闘力補正値B: bestCp.b ?? ''
    };
    const asideRow = buildAsideTsvRow(name, attackType, asideByKey);
    const includeHeader = elements.includeHeader.checked;
    const blocks = [
      createTsvBlock('使徒基礎設定', BASIC_TSV_COLUMNS, basicRow, includeHeader),
      createTsvBlock('アサイドTier設定', ASIDE_TSV_COLUMNS, asideRow, includeHeader)
    ];
    elements.output.value = blocks.join('\n\n');
  }

  function buildAsideTsvRow(name, attackType, values) {
    const attack = values.attack;
    const row = {
      使徒名: name,
      HP_AsideTier: values.hp?.tier || '',
      物理攻撃力_AsideTier: attackType === '物理' ? attack?.tier || '' : 0,
      魔法攻撃力_AsideTier: attackType === '魔法' ? attack?.tier || '' : 0,
      物理防御力_AsideTier: values.pdef?.tier || '',
      魔法防御力_AsideTier: values.mdef?.tier || '',
      HP_AsideBonus: values.hp?.manifest || '',
      物理攻撃力_AsideBonus: attackType === '物理' ? attack?.manifest || '' : '',
      魔法攻撃力_AsideBonus: attackType === '魔法' ? attack?.manifest || '' : '',
      物理防御力_AsideBonus: values.pdef?.manifest || '',
      魔法防御力_AsideBonus: values.mdef?.manifest || '',
      HP_AsideGrowth: values.hp?.growth || '',
      物理攻撃力_AsideGrowth: attackType === '物理' ? attack?.growth || '' : '',
      魔法攻撃力_AsideGrowth: attackType === '魔法' ? attack?.growth || '' : '',
      物理防御力_AsideGrowth: values.pdef?.growth || '',
      魔法防御力_AsideGrowth: values.mdef?.growth || '',
      HP_AsideStarBonus: values.hp?.star || '',
      物理攻撃力_AsideStarBonus: attackType === '物理' ? attack?.star || '' : '',
      魔法攻撃力_AsideStarBonus: attackType === '魔法' ? attack?.star || '' : '',
      物理防御力_AsideStarBonus: values.pdef?.star || '',
      魔法防御力_AsideStarBonus: values.mdef?.star || ''
    };
    return row;
  }

  function createTsvBlock(label, columns, row, includeHeader) {
    const lines = [`# ${label}`];
    if (includeHeader) lines.push(columns.join('\t'));
    lines.push(columns.map(column => row[column] ?? '').join('\t'));
    return lines.join('\n');
  }

  async function copyOutput() {
    if (!elements.output.value) return;
    try {
      await navigator.clipboard.writeText(elements.output.value);
      const original = elements.copy.textContent;
      elements.copy.textContent = 'コピーしました';
      window.setTimeout(() => { elements.copy.textContent = original; }, 1200);
    } catch {
      elements.output.select();
      document.execCommand('copy');
    }
  }

  function buildCpPairCatalog() {
    const map = new Map();
    basicRows.forEach(row => {
      const a = Number(row.戦闘力補正値A);
      const b = Number(row.戦闘力補正値B);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return;
      const key = pairKey(a, b);
      const current = map.get(key) || { a, b, count: 0, examples: [] };
      current.count += 1;
      if (row.使徒名 && current.examples.length < 4) current.examples.push(row.使徒名);
      map.set(key, current);
    });
    return Array.from(map.values());
  }

  function createCandidateBasic() {
    return {
      id: '__candidate__',
      使徒名: elements.name.value || '候補',
      レア度: readNumber(elements.rarity.value) || 3,
      役割: elements.role.value || '攻撃',
      種族: elements.species.value || '妖精',
      攻撃タイプ: elements.attackType.value || '物理',
      HPタイプ: 1,
      物理攻撃力タイプ: elements.attackType.value === '物理' ? 1 : 0,
      魔法攻撃力タイプ: elements.attackType.value === '魔法' ? 1 : 0,
      物理防御力タイプ: 1,
      魔法防御力タイプ: 1,
      会心タイプ: 1,
      会心DMGタイプ: 1,
      会心抵抗タイプ: 1,
      会心DMG抵抗タイプ: 1
    };
  }

  function createApostleState() {
    return {
      level: Math.max(1, readNumber(elements.level.value) || 1),
      star: Math.max(1, readNumber(elements.star.value) || 1),
      grade: Math.max(1, readNumber(elements.grade.value) || 1)
    };
  }

  function getObservedSnapshotStats() {
    const values = Object.fromEntries(elements.observed.map(input => [input.dataset.observedStat, readNumber(input.value)]));
    return {
      hp: values.hp || 0,
      physicalAtk: values.patk || 0,
      magicAtk: values.matk || 0,
      physicalDef: values.pdef || 0,
      magicDef: values.mdef || 0,
      crit: values.crit || 0,
      critDmg: values.critDmg || 0,
      critRes: values.critRes || 0,
      critDmgRes: values.critDmgRes || 0
    };
  }

  function getAsideGainValues() {
    return Object.fromEntries(elements.asideGains.map(input => [input.dataset.asideGain, readNumber(input.value)]));
  }

  function addAsideGainsToStats(stats, gains) {
    const next = { ...stats };
    next.hp += gains.hp || 0;
    if (elements.attackType.value === '魔法') next.magicAtk += gains.attack || 0;
    else next.physicalAtk += gains.attack || 0;
    next.physicalDef += gains.pdef || 0;
    next.magicDef += gains.mdef || 0;
    return next;
  }

  function mapTotalsToSnapshot(totals) {
    return {
      hp: Number(totals.hp) || 0,
      physicalAtk: Number(totals.patk) || 0,
      magicAtk: Number(totals.matk) || 0,
      physicalDef: Number(totals.pdef) || 0,
      magicDef: Number(totals.mdef) || 0,
      crit: Number(totals.crit) || 0,
      critDmg: Number(totals.critDmg) || 0,
      critRes: Number(totals.critRes) || 0,
      critDmgRes: Number(totals.critDmgRes) || 0
    };
  }

  function getAsideAttackFields() {
    const physical = elements.attackType.value !== '魔法';
    return {
      tier: physical ? '物理攻撃力タイプ' : '魔法攻撃力タイプ',
      manifest: physical ? '物理攻撃力発現値' : '魔法攻撃力発現値',
      growth: physical ? '物理攻撃力_A1成長値' : '魔法攻撃力_A1成長値',
      star: physical ? '物理攻撃力星上昇値' : '魔法攻撃力星上昇値'
    };
  }

  function getBaseStatValue(tier, group, kind) {
    const row = (DATA.sheets?.baseStatValues || []).find(item => String(item.col1) === `tier${tier}`);
    const columns = {
      hp: { base: 'HP基礎', coeff: 'HP係数' },
      attack: { base: '攻撃系基礎', coeff: '攻撃系係数' },
      defense: { base: '防御系基礎', coeff: '防御系係数' },
      crit: { base: '会心系基礎', coeff: '会心系係数' }
    };
    return Number(row?.[columns[group]?.[kind]]) || 0;
  }

  function getCpRows() {
    return Array.from(elements.cpObservations.querySelectorAll('[data-cp-observation]'));
  }

  function median(values) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(Number(value) || 0, min), max);
  }

  function pairKey(a, b) {
    return `${Number(a)}:${Number(b).toFixed(3)}`;
  }

  function normalizeAttackType(value) {
    return String(value || '').includes('魔法') ? '魔法' : '物理';
  }

  function readNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString('ja-JP', { maximumFractionDigits: 3 });
  }

  function formatAsideRange(range) {
    if (!range) return '0';
    return range.min === range.max
      ? formatNumber(range.min)
      : `${formatNumber(range.min)}〜${formatNumber(range.max)}`;
  }

  function formatInputNumber(value) {
    return String(Number(Number(value || 0).toFixed(3)));
  }

  function formatDecimal(value) {
    return Number(value || 0).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  }

  function formatSignedError(value) {
    const number = Number(value) || 0;
    return `${number > 0 ? '+' : ''}${formatNumber(number)}`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }
})();
