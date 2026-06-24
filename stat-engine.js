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

  window.TRICKCAL_SHARED_STAT_ENGINE = {
    version: 1,
    normalizeGrade,
    getGradeStatBonusRate,
    calculateBaseTotals,
    applyGradeOverrideToSnapshot
  };
})();
