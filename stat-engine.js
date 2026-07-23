(function () {
  'use strict';

  const INTERNAL_TO_SNAPSHOT = {
    hp: 'hp',
    patk: 'physicalAtk',
    matk: 'magicAtk',
    pdef: 'physicalDef',
    mdef: 'magicDef',
    crit: 'crit',
    critDmg: 'critDmg',
    critRes: 'critRes',
    critDmgRes: 'critDmgRes',
    spRegen: 'spRegen'
  };

  const TOTAL_KEYS = Object.keys(INTERNAL_TO_SNAPSHOT);

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function normalizeGrade(value) {
    return Math.max(1, Math.min(6, Number(value) || 1));
  }

  function normalizeApostleStar(value) {
    return Math.max(1, Math.min(5, Number(value) || 1));
  }

  function findBaseStatValue(data, type, group) {
    const row = data?.sheets?.baseStatValues?.find(item => String(item.col1) === `tier${type}`);
    if (!row) return null;
    const columns = {
      hp: ['HP基礎', 'HP係数'],
      attack: ['攻撃系基礎', '攻撃系係数'],
      defense: ['防御系基礎', '防御系係数'],
      crit: ['会心系基礎', '会心系係数']
    };
    const [baseKey, coeffKey] = columns[group] || [];
    return {
      base: Number(row?.[baseKey]) || 0,
      coeff: Number(row?.[coeffKey]) || 0
    };
  }

  function extractGradeNumber(value) {
    if (typeof value === 'number') return value;
    const text = String(value || '').trim();
    if (!text) return 0;
    const match = text.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function normalizeGradeBonusValue(value) {
    if (value === '' || value === null || value === undefined) return null;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    return numeric > 1 ? numeric / 100 : numeric;
  }

  function findGradeBonusRow(data, grade) {
    const safeGrade = normalizeGrade(grade);
    return (data?.sheets?.gradeBonuses || [])
      .find(row => extractGradeNumber(row.学年 ?? row.grade ?? row.star ?? row['★']) === safeGrade) || null;
  }

  function getGradeStatBonusRate(data, grade, statKey = '', basic = null) {
    const row = findGradeBonusRow(data, grade);
    if (!row) return 0.2 * (normalizeGrade(grade) - 1);
    const role = String(basic?.役割 || '');
    const key = (() => {
      if (role === '守備' && statKey === 'hp') return '守備タイプHP補正';
      if (role === '攻撃' && (statKey === 'patk' || statKey === 'matk')) return '攻撃タイプ攻撃力補正';
      if (role === '支援' && statKey === 'spRegen') return '支援タイプ毎秒SP回復量補正';
      if (statKey === 'spRegen') return '毎秒SP回復量補正';
      return '基本ステータス補正';
    })();
    return normalizeGradeBonusValue(row[key]) ?? normalizeGradeBonusValue(row.基本ステータス補正) ?? 0;
  }

  function calculateBaseStat(data, base, coeff, level, star, grade, statKey, basic) {
    const levelValue = Math.max(1, Number(level) || 1);
    const starValue = normalizeApostleStar(star);
    const gradeRate = getGradeStatBonusRate(data, grade, statKey, basic);
    return Math.floor((Number(base) + Number(coeff) * (levelValue - 1)) * (1 + 0.2 * (starValue - 1)) * (1 + gradeRate));
  }

  function createEmptyTotals() {
    return Object.fromEntries(TOTAL_KEYS.map(key => [key, 0]));
  }

  function calculateBaseTotals(data, basic, apostleState = {}, override = {}) {
    if (!data || !basic) return createEmptyTotals();
    const level = Number(override.level ?? apostleState.level) || 1;
    const star = normalizeApostleStar(override.star ?? apostleState.star ?? basic.レア度 ?? 1);
    const grade = normalizeGrade(override.grade ?? apostleState.grade ?? 1);
    const totals = createEmptyTotals();
    const entries = [
      ['hp', basic.HPタイプ, 'hp'],
      ['patk', basic.物理攻撃力タイプ, 'attack'],
      ['matk', basic.魔法攻撃力タイプ, 'attack'],
      ['pdef', basic.物理防御力タイプ, 'defense'],
      ['mdef', basic.魔法防御力タイプ, 'defense'],
      ['crit', basic.会心タイプ, 'crit'],
      ['critDmg', basic.会心DMGタイプ, 'crit'],
      ['critRes', basic.会心抵抗タイプ, 'crit'],
      ['critDmgRes', basic.会心DMG抵抗タイプ, 'crit'],
      ['spRegen', basic.毎秒SP回復量 ? 'spRegen' : 0, 'sp']
    ];

    entries.forEach(([totalKey, tier, group]) => {
      const base = totalKey === 'spRegen'
        ? { base: Number(basic.毎秒SP回復量) || 0, coeff: 0 }
        : findBaseStatValue(data, tier, group);
      if (!base) return;
      totals[totalKey] = calculateBaseStat(data, base.base, base.coeff, level, star, grade, totalKey, basic);
    });
    return totals;
  }

  function getSnapshot(apostleState = {}, mode = 'current') {
    if (mode === 'planned') return apostleState.statSnapshots?.planned || apostleState.statSnapshots?.current || null;
    return apostleState.statSnapshots?.current || null;
  }

  function readSnapshotRate(snapshot, internalKey) {
    const snapshotKey = INTERNAL_TO_SNAPSHOT[internalKey];
    return Number(snapshot?.globalPercentRates?.[snapshotKey] ?? snapshot?.globalPercentRates?.[internalKey]) || 0;
  }

  function applyGradeOverrideToSnapshot(data, basic, apostleState = {}, options = {}) {
    const grade = normalizeGrade(options.grade ?? apostleState.grade ?? 1);
    const snapshot = cloneJson(options.snapshot || getSnapshot(apostleState, options.mode || 'current'));
    if (!snapshot?.stats) {
      return {
        kind: options.kind || 'gradeOverride',
        stats: mapInternalTotalsToSnapshot(calculateBaseTotals(data, basic, apostleState, { grade })),
        breakdown: { base: calculateBaseTotals(data, basic, apostleState, { grade }) },
        globalPercentRates: {},
        gradeOverride: grade
      };
    }

    const currentBase = snapshot.breakdown?.base || calculateBaseTotals(data, basic, apostleState);
    const nextBase = calculateBaseTotals(data, basic, apostleState, { grade });
    const next = cloneJson(snapshot);
    next.kind = options.kind || `${snapshot.kind || 'current'}:gradeOverride`;
    next.gradeOverride = grade;
    next.breakdown = next.breakdown || {};
    next.breakdown.base = cloneJson(nextBase);
    next.breakdown.globalPercent = next.breakdown.globalPercent || {};

    TOTAL_KEYS.forEach(internalKey => {
      const snapshotKey = INTERNAL_TO_SNAPSHOT[internalKey];
      const oldFinal = Number(snapshot.stats?.[snapshotKey]) || 0;
      const oldGlobalIncrease = Number(snapshot.breakdown?.globalPercent?.[internalKey]) || 0;
      const oldBase = Number(currentBase?.[internalKey]) || 0;
      const additiveWithoutBase = oldFinal - oldGlobalIncrease - oldBase;
      const additive = additiveWithoutBase + (Number(nextBase[internalKey]) || 0);
      const percent = readSnapshotRate(snapshot, internalKey);
      const nextGlobalIncrease = Math.floor(additive * percent / 100);
      next.breakdown.globalPercent[internalKey] = nextGlobalIncrease;
      next.stats[snapshotKey] = Math.floor(additive + nextGlobalIncrease);
    });
    next.updatedAt = new Date().toISOString();
    return next;
  }

  function mapInternalTotalsToSnapshot(totals) {
    return Object.fromEntries(TOTAL_KEYS.map(key => [INTERNAL_TO_SNAPSHOT[key], Math.floor(Number(totals?.[key]) || 0)]));
  }

  function calculateRankUpTotals(data, basic, rankValue) {
    const totals = createEmptyTotals();
    const rank = Math.max(1, Math.min(10, Number(rankValue) || 1));
    const attackType = String(basic?.攻撃タイプ || basic?.攻撃Type || '');
    const entries = [
      ['hp', basic?.HPタイプ, 'HP'],
      [attackType === '魔法' ? 'matk' : 'patk', attackType === '魔法' ? basic?.魔法攻撃力タイプ : basic?.物理攻撃力タイプ, '攻撃力'],
      ['pdef', basic?.物理防御力タイプ, '防御力'],
      ['mdef', basic?.魔法防御力タイプ, '防御力'],
      ['crit', basic?.会心タイプ, '会心系'],
      ['critDmg', basic?.会心DMGタイプ, '会心系'],
      ['critRes', basic?.会心抵抗タイプ, '会心系'],
      ['critDmgRes', basic?.会心DMG抵抗タイプ, '会心系']
    ];
    for (let rankFrom = 1; rankFrom < rank; rankFrom += 1) {
      entries.forEach(([statKey, tier, valueKey]) => {
        const row = (data?.sheets?.rankUpBonuses || []).find(item => Number(item.rank_from) === rankFrom && Number(item.tier) === Number(tier));
        if (row) totals[statKey] += Number(row[valueKey]) || 0;
      });
    }
    return totals;
  }

  const EQUIPMENT_GROUPS = [
    { key: 'HP', lookup: 'HP', stats: ['hp'] },
    { key: '物理攻撃', lookup: '物理攻撃力', stats: ['patk'] },
    { key: '魔法攻撃', lookup: '魔法攻撃力', stats: ['matk'] },
    { key: '物理防御', lookup: '物理防御力', stats: ['pdef'] },
    { key: '魔法防御', lookup: '魔法防御力', stats: ['mdef'] },
    { key: '会心/会心DMG', lookup: '会心/会心DMG', stats: ['crit', 'critDmg'] },
    { key: '会心抵抗/会心DMG抵抗', lookup: '会心抵抗/会心DMG抵抗', stats: ['critRes', 'critDmgRes'] }
  ];

  function calculateEquipmentTotals(data, basic, state) {
    const totals = createEmptyTotals();
    const row = data?.getById?.('equipment', basic?.id)
      || (data?.sheets?.equipment || []).find(item => item.id === basic?.id);
    const rank = Math.max(1, Math.min(10, Number(state?.rank) || 1));
    EQUIPMENT_GROUPS.forEach(group => {
      const tier = Number(row?.[`Equip_Rank${rank}_${group.key}`]) || 0;
      const setting = state?.equipment?.[group.key] || {};
      if (!tier || !setting.enabled) return;
      const enhance = Math.max(0, Math.min(5, Number(setting.enhance) || 0));
      const valueRow = (data?.sheets?.equipmentValues || []).find(item => Number(item.rank) === rank && String(item.statGroup) === group.lookup && Number(item.tier) === tier);
      const value = Number(valueRow?.[`enhance${enhance}`]) || 0;
      group.stats.forEach(statKey => { totals[statKey] += value; });
    });
    return totals;
  }

  function calculateBondTotals(data, basic, bondValue) {
    const totals = createEmptyTotals();
    const locked = Number(basic?.レア度) === 1;
    const bond = locked ? 1 : Math.max(1, Math.min(30, Number(bondValue) || 1));
    const row = (data?.sheets?.bondBonuses || []).find(item => Number(String(item.好感度Lv || '').replace(/[^\d]/g, '')) === bond);
    const fallback = 31 * bond;
    totals.crit = row ? Number(row.会心) || 0 : fallback;
    totals.critDmg = row ? Number(row.会心DMG) || 0 : fallback;
    totals.critRes = row ? Number(row.会心抵抗) || 0 : fallback;
    totals.critDmgRes = row ? Number(row.会心DMG抵抗) || 0 : fallback;
    return totals;
  }

  function getAsideTierRow(data, basic) {
    return data?.getById?.('asideTiers', basic?.id)
      || (data?.sheets?.asideTiers || []).find(item => item.id === basic?.id)
      || null;
  }

  function getAsideAttackFields(basic) {
    const physical = String(basic?.攻撃タイプ || basic?.攻撃Type || '') === '物理';
    return {
      key: physical ? 'patk' : 'matk',
      tier: physical ? '物理攻撃力タイプ' : '魔法攻撃力タイプ',
      manifest: physical ? '物理攻撃力発現値' : '魔法攻撃力発現値',
      star: physical ? '物理攻撃力星上昇値' : '魔法攻撃力星上昇値'
    };
  }

  function calculateAsideManifestTotals(data, basic, state) {
    const totals = createEmptyTotals();
    if (!(Number(state?.asideRank) || 0)) return totals;
    const row = getAsideTierRow(data, basic);
    const attackFields = getAsideAttackFields(basic);
    const attackKey = attackFields.key;
    const baseAttackTier = attackKey === 'patk' ? basic?.物理攻撃力タイプ : basic?.魔法攻撃力タイプ;
    const values = {
      hp: Number(row?.HP発現値) || (Number(findBaseStatValue(data, Number(row?.HPタイプ) || basic?.HPタイプ, 'hp')?.base) || 0) * 3,
      attack: Number(row?.[attackFields.manifest]) || Number(row?.攻撃力発現値)
        || (Number(findBaseStatValue(data, Number(row?.[attackFields.tier]) || Number(row?.攻撃力タイプ) || baseAttackTier, 'attack')?.base) || 0) * 3,
      pdef: Number(row?.物理防御力発現値) || (Number(findBaseStatValue(data, Number(row?.物理防御力タイプ) || basic?.物理防御力タイプ, 'defense')?.base) || 0) * 3,
      mdef: Number(row?.魔法防御力発現値) || (Number(findBaseStatValue(data, Number(row?.魔法防御力タイプ) || basic?.魔法防御力タイプ, 'defense')?.base) || 0) * 3
    };
    totals.hp = values.hp;
    totals[attackKey] = values.attack;
    totals.pdef = values.pdef;
    totals.mdef = values.mdef;
    return totals;
  }

  function calculateAsideLevelTotals(data, basic, state) {
    const totals = createEmptyTotals();
    const rank = Math.max(0, Math.min(3, Number(state?.asideRank) || 0));
    const level = Number(state?.asideLevel) || 0;
    const multiplier = ({ 1: 3, 2: 3.09, 3: 3.18 })[rank] || 0;
    if (!rank || !level || !multiplier) return totals;
    const row = getAsideTierRow(data, basic);
    const attackFields = getAsideAttackFields(basic);
    const attackKey = attackFields.key;
    const baseAttackTier = attackKey === 'patk' ? basic?.物理攻撃力タイプ : basic?.魔法攻撃力タイプ;
    const growthLevels = Math.max(0, level - 1);
    const starBonusCount = Math.max(0, Math.min(2, rank - 1));
    const calculate = (tier, group, starBonus) =>
      Math.floor((Number(findBaseStatValue(data, tier, group)?.coeff) || 0) * multiplier * growthLevels)
      + (Number(starBonus) || 0) * starBonusCount;
    totals.hp = calculate(Number(row?.HPタイプ) || basic?.HPタイプ, 'hp', row?.HP星上昇値);
    totals[attackKey] = calculate(
      Number(row?.[attackFields.tier]) || Number(row?.攻撃力タイプ) || baseAttackTier,
      'attack',
      row?.[attackFields.star] ?? row?.攻撃力星上昇値
    );
    totals.pdef = calculate(Number(row?.物理防御力タイプ) || basic?.物理防御力タイプ, 'defense', row?.物理防御力星上昇値);
    totals.mdef = calculate(Number(row?.魔法防御力タイプ) || basic?.魔法防御力タイプ, 'defense', row?.魔法防御力星上昇値);
    return totals;
  }

  function normalizeApostleOverrideState(basic, apostleState, overrides = {}) {
    const star = normalizeApostleStar(overrides.star ?? apostleState?.star ?? basic?.レア度 ?? 1);
    const levelCaps = { 1: 120, 2: 120, 3: 125, 4: 135, 5: 145 };
    const level = Math.max(1, Math.min(levelCaps[star] || 120, Number(overrides.level ?? apostleState?.level) || 1));
    const rank = Math.max(1, Math.min(10, Number(overrides.rank ?? apostleState?.rank) || 1));
    const asideRank = Math.max(0, Math.min(3, Number(overrides.asideRank ?? apostleState?.asideRank) || 0));
    const asideLevelCap = [0, 30, 40, 50][asideRank] || 0;
    const asideLevel = asideLevelCap
      ? Math.max(1, Math.min(asideLevelCap, Number(overrides.asideLevel ?? apostleState?.asideLevel) || 1))
      : 0;
    const equipment = cloneJson(apostleState?.equipment || {});
    Object.entries(overrides.equipment || {}).forEach(([key, value]) => {
      equipment[key] = { ...(equipment[key] || {}), ...(value || {}) };
    });
    return {
      level,
      star,
      grade: normalizeGrade(overrides.grade ?? apostleState?.grade ?? 1),
      rank,
      bond: Number(basic?.レア度) === 1 ? 1 : Math.max(1, Math.min(30, Number(overrides.bond ?? apostleState?.bond) || 1)),
      asideRank,
      asideLevel,
      follow: basic?.エルダイン ? false : !!(overrides.follow ?? apostleState?.follow),
      equipment
    };
  }

  function applyApostleOverridesToSnapshot(data, basic, apostleState = {}, options = {}) {
    const savedSnapshot = cloneJson(options.snapshot || getSnapshot(apostleState, options.mode || 'current'));
    if (!basic) return savedSnapshot || null;
    const emptyTotals = createEmptyTotals();
    const snapshot = savedSnapshot?.stats ? savedSnapshot : {
      kind: 'calculatedFallback',
      stats: mapInternalTotalsToSnapshot(emptyTotals),
      breakdown: {
        base: cloneJson(emptyTotals),
        rankUp: cloneJson(emptyTotals),
        equipment: cloneJson(emptyTotals),
        bond: cloneJson(emptyTotals),
        asideManifest: cloneJson(emptyTotals),
        asideLevel: cloneJson(emptyTotals),
        globalPercent: cloneJson(emptyTotals)
      },
      globalPercentRates: {}
    };
    const state = normalizeApostleOverrideState(basic, apostleState, options.overrides || {});
    const previous = normalizeApostleOverrideState(basic, apostleState, {});
    const replacements = {
      base: calculateBaseTotals(data, basic, state),
      rankUp: calculateRankUpTotals(data, basic, state.rank),
      equipment: calculateEquipmentTotals(data, basic, state),
      bond: calculateBondTotals(data, basic, state.bond),
      asideManifest: calculateAsideManifestTotals(data, basic, state),
      asideLevel: calculateAsideLevelTotals(data, basic, state)
    };
    const next = cloneJson(snapshot);
    next.kind = options.kind || `${snapshot.kind || 'current'}:apostleOverride`;
    next.breakdown = next.breakdown || {};
    next.breakdown.globalPercent = next.breakdown.globalPercent || {};
    next.globalPercentRates = next.globalPercentRates || {};

    TOTAL_KEYS.forEach(internalKey => {
      const snapshotKey = INTERNAL_TO_SNAPSHOT[internalKey];
      const oldFinal = Number(snapshot.stats?.[snapshotKey]) || 0;
      const oldGlobalIncrease = Number(snapshot.breakdown?.globalPercent?.[internalKey]) || 0;
      let additive = Math.max(0, oldFinal - oldGlobalIncrease);
      Object.entries(replacements).forEach(([source, totals]) => {
        additive += (Number(totals?.[internalKey]) || 0) - (Number(snapshot.breakdown?.[source]?.[internalKey]) || 0);
      });
      const followDelta = internalKey === 'spRegen' ? 0 : (state.follow ? 3 : 0) - (previous.follow ? 3 : 0);
      const rate = readSnapshotRate(snapshot, internalKey) + followDelta;
      const increase = Math.floor(Math.max(0, additive) * rate / 100);
      next.breakdown.globalPercent[internalKey] = increase;
      next.globalPercentRates[snapshotKey] = rate;
      next.stats[snapshotKey] = Math.floor(Math.max(0, additive) + increase);
    });
    Object.entries(replacements).forEach(([source, totals]) => { next.breakdown[source] = cloneJson(totals); });
    next.overrideState = cloneJson(state);
    next.updatedAt = new Date().toISOString();
    return next;
  }

  window.TRICKCAL_SHARED_STAT_ENGINE = {
    version: 3,
    normalizeGrade,
    getGradeStatBonusRate,
    calculateBaseTotals,
    applyGradeOverrideToSnapshot,
    applyApostleOverridesToSnapshot
  };
})();
