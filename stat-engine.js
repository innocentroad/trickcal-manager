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
  // v3 adds the calculation's fractional totals to compact comparison slots.
  const COMPARISON_STATS_SCHEMA_VERSION = 3;
  // v4: retain fractions through the ordered final multiplier.
  const SNAPSHOT_CALCULATION_VERSION = 4;
  const ADDITIVE_SOURCES = ['base', 'rankUp', 'equipment', 'rankGlobal', 'research', 'boardBasic', 'boardAdvanced', 'bond', 'asideManifest', 'asideLevel'];
  const COMPARISON_STAT_KEYS = [...Object.values(INTERNAL_TO_SNAPSHOT), 'combatPower'];
  // v22: these three grades were checked against AsideGrade's five stat slots.
  const ASIDE_GRADE_MULTIPLIERS = Object.freeze({ 1: 1, 2: 1.03, 3: 1.06 });

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function isPublicAsideEnabled(id) {
    const checker = window.TRICKCAL_PUBLIC_RELEASE?.isAsideEnabled;
    return typeof checker !== 'function' || checker(id);
  }

  function encodeNumberVector(source = {}, keys = []) {
    return keys.map(key => Number(source?.[key]) || 0);
  }

  function decodeNumberVector(values = [], keys = []) {
    return Object.fromEntries(keys.map((key, index) => [key, Number(values?.[index]) || 0]));
  }

  function encodeComparisonSnapshot(snapshot = null) {
    if (Number(snapshot?.calculationVersion) !== SNAPSHOT_CALCULATION_VERSION || !hasCompleteBreakdown(snapshot)) return null;
    return [
      encodeNumberVector(snapshot.stats, COMPARISON_STAT_KEYS),
      ADDITIVE_SOURCES.map(source => encodeNumberVector(snapshot.breakdown?.[source], TOTAL_KEYS)),
      encodeNumberVector(snapshot.breakdown?.globalPercent, TOTAL_KEYS),
      encodeNumberVector(snapshot.globalPercentRates, Object.values(INTERNAL_TO_SNAPSHOT)),
      Number(snapshot.calculationVersion) || 0,
      snapshot.stats.combatPower == null,
      encodeNumberVector(snapshot.internalTotals, TOTAL_KEYS)
    ];
  }

  function decodeComparisonSnapshot(value = null, mode = 'current', version = 1) {
    if (!Array.isArray(value) || !Array.isArray(value[0])) return null;
    const modern = version === 2 || version === COMPARISON_STATS_SCHEMA_VERSION;
    if (modern && (!Array.isArray(value[1]) || value[1].length !== ADDITIVE_SOURCES.length
      || value[1].some(vector => !Array.isArray(vector) || vector.length !== TOTAL_KEYS.length))) return null;
    if (version === COMPARISON_STATS_SCHEMA_VERSION
      && (!Array.isArray(value[6]) || value[6].length !== TOTAL_KEYS.length)) return null;
    if (version === COMPARISON_STATS_SCHEMA_VERSION) {
      const valid = entry => entry !== null && entry !== undefined && entry !== ''
        && Number.isFinite(Number(entry));
      if (!Array.isArray(value[0]) || value[0].length !== COMPARISON_STAT_KEYS.length
        || value[0].slice(0, -1).some(entry => !valid(entry))
        || value[1].some(vector => vector.some(entry => !valid(entry)))
        || !Array.isArray(value[2]) || value[2].length !== TOTAL_KEYS.length || value[2].some(entry => !valid(entry))
        || !Array.isArray(value[3]) || value[3].length !== TOTAL_KEYS.length || value[3].some(entry => !valid(entry))
        || value[6].some(entry => !valid(entry))) return null;
    }
    const snapshot = {
      kind: `comparisonCompact:${mode}`,
      stats: decodeNumberVector(value[0], COMPARISON_STAT_KEYS),
      breakdown: modern
        ? Object.fromEntries(ADDITIVE_SOURCES.map((source, index) => [source, decodeNumberVector(value[1]?.[index], TOTAL_KEYS)]))
        : { base: decodeNumberVector(value[1], TOTAL_KEYS) },
      globalPercentRates: decodeNumberVector(value[3], Object.values(INTERNAL_TO_SNAPSHOT)),
      calculationVersion: modern ? Number(value[4]) || 0 : 0,
      ...(version === COMPARISON_STATS_SCHEMA_VERSION
        ? { internalTotals: decodeNumberVector(value[6], TOTAL_KEYS) } : {})
    };
    snapshot.breakdown.globalPercent = decodeNumberVector(value[2], TOTAL_KEYS);
    // Old compact snapshots contain display integers, not the v29 internal inputs.
    if (!modern || snapshot.calculationVersion !== SNAPSHOT_CALCULATION_VERSION || value[5] === true) snapshot.stats.combatPower = null;
    return snapshot;
  }

  function encodeComparisonStatSnapshots(apostles = {}) {
    const encoded = {};
    Object.entries(apostles || {}).forEach(([id, state]) => {
      const current = encodeComparisonSnapshot(state?.statSnapshots?.current);
      const planned = encodeComparisonSnapshot(state?.statSnapshots?.planned);
      if (current || planned) encoded[id] = [current, planned];
    });
    return {
      v: COMPARISON_STATS_SCHEMA_VERSION,
      a: encoded
    };
  }

  function decodeComparisonStatSnapshots(store = {}) {
    const version = Number(store?.v);
    if (![1, 2, COMPARISON_STATS_SCHEMA_VERSION].includes(version) || !store.a || typeof store.a !== 'object') return {};
    const decoded = {};
    Object.entries(store.a).forEach(([id, value]) => {
      if (!Array.isArray(value)) return;
      const current = decodeComparisonSnapshot(value[0], 'current', version);
      const planned = decodeComparisonSnapshot(value[1], 'planned', version);
      if (!current && !planned) return;
      decoded[id] = {};
      if (current) decoded[id].current = current;
      if (planned) decoded[id].planned = planned;
    });
    return decoded;
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
    const starRate = statKey === 'spRegen' ? 0 : (starValue - 1) * 0.2;
    const levelStat = Number(base) + Number(coeff) * (levelValue - 1);
    return (levelStat * (1 + starRate)) * (1 + gradeRate);
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

  function followFraction(state, internalKey) {
    if (!state?.follow || internalKey === 'spRegen') return 0;
    // HeroLove.Value 30 -> single(30) * single(0.001), then widened to double.
    return Math.fround(Math.fround(30) * Math.fround(0.001));
  }

  function commonFlatValue(value) {
    // ApplyCommonStat/AllValue converts each incoming entry before addition.
    return Math.trunc(Number(value) || 0);
  }

  function calculateFinalInternalTotals(data, basic, state, breakdown, commonRates) {
    const aside = calculateAsideContribution(data, basic, state);
    if (!aside) return null;
    const totals = createEmptyTotals();
    const increases = createEmptyTotals();
    TOTAL_KEYS.forEach(key => {
      const read = source => Number(breakdown?.[source]?.[key]) || 0;
      // GetDefaultStat already includes its Rank addition. GetBaseStat then
      // adds the remaining groups in the compiled order; aside.total must not
      // be reconstructed from the two display-only breakdown columns.
      let value = read('base') + read('rankUp');
      value = value + read('equipment');
      value = read('boardBasic') + value;
      value = read('bond') + value;
      value = read('research') + value;
      value = Number(aside.total[key] || 0) + value;
      value = (read('rankGlobal') + read('boardAdvanced')) + value;
      const rate = Number(commonRates?.[INTERNAL_TO_SNAPSHOT[key]] ?? commonRates?.[key]) || 0;
      const factor = (1 + rate / 100) + followFraction(state, key);
      totals[key] = factor * value;
      increases[key] = totals[key] - value;
    });
    return { totals, increases };
  }

  function hasCompleteBreakdown(snapshot) {
    const hasNumber = value => value !== null && value !== undefined && value !== ''
      && Number.isFinite(Number(value));
    return !!snapshot?.stats && !!snapshot?.globalPercentRates && !!snapshot.breakdown?.globalPercent
      && ADDITIVE_SOURCES.every(source => snapshot.breakdown?.[source]
      && TOTAL_KEYS.every(key => hasNumber(snapshot.breakdown[source][key])))
      && TOTAL_KEYS.every(key => hasNumber(snapshot.breakdown.globalPercent[key])
        && hasNumber(snapshot.globalPercentRates[INTERNAL_TO_SNAPSHOT[key]]))
      && (Number(snapshot.calculationVersion) !== SNAPSHOT_CALCULATION_VERSION
        || (TOTAL_KEYS.every(key => hasNumber(snapshot.internalTotals?.[key]))
          && Object.values(INTERNAL_TO_SNAPSHOT).every(key => hasNumber(snapshot.stats[key]))));
  }

  function auditSummonGrowthSnapshot(data, basic, apostleState, snapshot) {
    // A valid site snapshot is not yet proof of native GetBaseStat equivalence.
    // Keep the eight pre-battle values and their source boundary explicit.
    if (!data || !basic || !apostleState || !hasCompleteBreakdown(snapshot)
      || snapshot.calculationVersion !== SNAPSHOT_CALCULATION_VERSION) return null;
    const state = normalizeApostleOverrideState(basic, snapshot.overrideState || apostleState);
    const keys = TOTAL_KEYS.filter(key => key !== 'hp' && key !== 'spRegen');
    const finite = value => typeof value === 'number' && Number.isFinite(value);
    if (!keys.every(key => finite(snapshot.internalTotals[key])
      && finite(snapshot.globalPercentRates[INTERNAL_TO_SNAPSHOT[key]])
      && [...ADDITIVE_SOURCES, 'globalPercent'].every(source => finite(snapshot.breakdown[source][key])))) return null;
    const personal = {
      base: calculateBaseTotals(data, basic, state),
      rankUp: calculateRankUpTotals(data, basic, state.rank),
      equipment: calculateEquipmentTotals(data, basic, state),
      bond: calculateBondTotals(data, basic, state.bond)
    };
    const same = (a, b) => Number.isFinite(a) && Number.isFinite(b)
      && Math.abs(a - b) <= Number.EPSILON * 8 * Math.max(1, Math.abs(a), Math.abs(b));
    if (Object.entries(personal).some(([source, values]) => !values
      || keys.some(key => !same(values[key], snapshot.breakdown[source][key])))) return null;
    const rebuilt = calculateFinalInternalTotals(data, basic, state, snapshot.breakdown, snapshot.globalPercentRates);
    if (!rebuilt || keys.some(key => !same(rebuilt.totals[key], snapshot.internalTotals[key])
      || !same(rebuilt.increases[key], snapshot.breakdown.globalPercent[key]))) return null;
    // Rebuild the known components in GetBaseStat order, independently of
    // the displayed/site final totals. Missing native sources are NOT assumed
    // to be zero: this is an explicitly incomplete supply candidate.
    const aside = calculateAsideContribution(data, basic, state);
    const nativeCandidateStats = {};
    keys.forEach(key => {
      const read = source => snapshot.breakdown[source][key];
      let value = read('base') + read('rankUp');
      value = value + read('equipment');
      value = value + read('boardBasic');
      value = value + read('bond');
      value = value + aside.total[key];
      let commonFlat = read('research') + read('rankGlobal');
      commonFlat = commonFlat + read('boardAdvanced');
      value = value + commonFlat;
      // Snapshot rates use percent. Native CommonPermille uses permille.
      const permille = snapshot.globalPercentRates[INTERNAL_TO_SNAPSHOT[key]] * 10;
      nativeCandidateStats[INTERNAL_TO_SNAPSHOT[key]] = value * ((1 + permille * 0.001) + followFraction(state, key));
    });
    if (!Object.values(nativeCandidateStats).every(finite)) return null;
    return {
      inputStage: 'site-growth-snapshot', calculationVersion: SNAPSHOT_CALCULATION_VERSION,
      consistency: 'verified', nativeEquivalent: false,
      stats: Object.fromEntries(keys.map(key => [INTERNAL_TO_SNAPSHOT[key], snapshot.internalTotals[key]])),
      nativeBaseCandidate: {
        inputStage: 'growth-composed-base-candidate', stats: nativeCandidateStats,
        completeness: 'known-site-components-only',
        // Aggregates cannot prove native truncation of each incoming entry.
        commonFlatEntryProvenance: 'unavailable',
        missingSources: ['gather', 'bot', 'event', 'mode-specific', 'board-supply-provenance']
      },
      sourceGroups: {
        personal: ['base', 'rankUp', 'equipment', 'boardBasic', 'bond', 'asideManifest', 'asideLevel'],
        commonFixed: ['research', 'rankGlobal', 'boardAdvanced'],
        commonPercent: 'globalPercentRates', follow: state.follow
      },
      unresolved: [
        '研究を共通固定値としてnative順の候補を組立済み。入力別整数化の元エントリーはsnapshot集計値だけでは確認できません',
        '収集・Bot/Event・モード固有補正とボードの供給区分はsnapshotだけではnativeとの同等性を確認できません'
      ]
    };
  }

  function canRebuildLegacySnapshot(data, basic, apostleState, snapshot, options = {}) {
    if (!data || !basic || !hasCompleteBreakdown(snapshot) || !apostleState) return false;
    // A complete vector is not proof that it belongs to these saved settings.
    const required = ['level', 'star', 'grade', 'rank', 'bond', 'asideRank'];
    const missingNumber = value => value === null || value === undefined || value === ''
      || !Number.isFinite(Number(value));
    if (required.some(key => missingNumber(apostleState[key]))) return false;
    if (Number(apostleState.asideRank) > 0 && missingNumber(apostleState.asideLevel)) return false;
    if (options.mode === 'planned' && (!apostleState.plannedBoards || !snapshot.boardDiff)) return false;
    const nonzero = source => TOTAL_KEYS.some(key => Number(snapshot.breakdown[source]?.[key]) !== 0);
    // These legacy vectors have no board/research/rank-global provenance. Their
    // presence alongside saved settings cannot establish that they still agree.
    if (['boardBasic', 'boardAdvanced', 'research', 'rankGlobal'].some(nonzero)) return false;
    const savedAside = calculateAsideContribution(data, basic, apostleState);
    if (!savedAside) return false;
    const expected = {
      base: calculateBaseTotals(data, basic, apostleState),
      rankUp: calculateRankUpTotals(data, basic, apostleState.rank),
      equipment: calculateEquipmentTotals(data, basic, apostleState),
      bond: calculateBondTotals(data, basic, apostleState.bond),
      asideManifest: savedAside.base,
      asideLevel: savedAside.growth
    };
    return Object.entries(expected).every(([source, values]) => values
      && TOTAL_KEYS.every(key => {
        const expectedValue = source === 'base' && Number(snapshot.calculationVersion) < SNAPSHOT_CALCULATION_VERSION
          ? Math.floor(Number(values[key])) : Number(values[key]);
        return Math.abs(Number(snapshot.breakdown[source]?.[key]) - expectedValue) < 1e-7;
      }));
  }

  function requiresAsideGlobalRecalculation(data, basic, previousRank, nextRank) {
    if ((Number(previousRank) >= 3) === (Number(nextRank) >= 3)) return false;
    if (!data || !basic) return true;
    const rows = data.getById?.('asideStatEffects', basic.id);
    if (rows == null && !Array.isArray(data.sheets?.asideStatEffects)) return true;
    return (Array.isArray(rows) ? rows : []).some(row =>
      Number(row.SLv ?? row.Lv) === 3
      && String(row.ステ適用 || '').includes('全体')
      && String(row.ステ能力値 || '').trim()
      && Number(row['上昇%']) !== 0);
  }

  function rebuildSnapshot(data, basic, apostleState, options = {}) {
    const original = options.snapshot;
    if (!hasCompleteBreakdown(original)) return null;
    const state = normalizeApostleOverrideState(basic, apostleState, options.overrides || {});
    const previous = normalizeApostleOverrideState(basic, original.overrideState || apostleState);
    // A3 may grant a party-wide percent effect. Its rate cannot be reconstructed
    // from one apostle's saved snapshot when crossing the A3 boundary.
    if (requiresAsideGlobalRecalculation(data, basic, previous.asideRank, state.asideRank)) return null;
    const replacements = {
      base: calculateBaseTotals(data, basic, state),
      rankUp: calculateRankUpTotals(data, basic, state.rank),
      equipment: calculateEquipmentTotals(data, basic, state),
      bond: calculateBondTotals(data, basic, state.bond),
      asideManifest: calculateAsideManifestTotals(data, basic, state),
      asideLevel: calculateAsideLevelTotals(data, basic, state)
    };
    if (Object.values(replacements).some(value => value === null)) return null;
    const next = cloneJson(original);
    next.breakdown = next.breakdown || {};
    Object.entries(replacements).forEach(([source, totals]) => { next.breakdown[source] = cloneJson(totals); });
    next.breakdown.globalPercent = next.breakdown.globalPercent || {};
    next.globalPercentRates = next.globalPercentRates || {};
    next.stats = next.stats || {};
    const commonRates = createEmptyTotals();
    TOTAL_KEYS.forEach(internalKey => {
      const snapshotKey = INTERNAL_TO_SNAPSHOT[internalKey];
      const savedRate = readSnapshotRate(original, internalKey);
      // v3 stored the integer +3% follow bonus in the common-rate vector.
      const rate = savedRate - (Number(original.calculationVersion) < SNAPSHOT_CALCULATION_VERSION
        && internalKey !== 'spRegen' && previous.follow ? 3 : 0);
      commonRates[snapshotKey] = rate;
    });
    const combined = calculateFinalInternalTotals(data, basic, state, next.breakdown, commonRates);
    if (!combined) return null;
    TOTAL_KEYS.forEach(internalKey => {
      const snapshotKey = INTERNAL_TO_SNAPSHOT[internalKey];
      next.breakdown.globalPercent[internalKey] = combined.increases[internalKey];
      next.globalPercentRates[snapshotKey] = commonRates[snapshotKey];
      next.stats[snapshotKey] = Math.trunc(combined.totals[internalKey]);
    });
    next.internalTotals = combined.totals;
    next.calculationVersion = SNAPSHOT_CALCULATION_VERSION;
    next.overrideState = cloneJson(state);
    next.kind = options.kind || `${original.kind || 'current'}:apostleOverride`;
    next.updatedAt = new Date().toISOString();
    next.stats.combatPower = null;
    return next;
  }

  function applyGradeOverrideToSnapshot(data, basic, apostleState = {}, options = {}) {
    const grade = normalizeGrade(options.grade ?? apostleState.grade ?? 1);
    const next = applyApostleOverridesToSnapshot(data, basic, apostleState, {
      ...options,
      overrides: { ...(options.overrides || {}), grade },
      kind: options.kind || 'gradeOverride'
    });
    if (next) next.gradeOverride = grade;
    return next;
  }

  function mapInternalTotalsToSnapshot(totals) {
    return Object.fromEntries(TOTAL_KEYS.map(key => [INTERNAL_TO_SNAPSHOT[key], Math.trunc(Number(totals?.[key]) || 0)]));
  }

  function requiredNumber(source, keys) {
    for (const key of keys) {
      const value = source?.[key];
      if (value !== undefined && value !== null && value !== '') {
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0) throw new Error(`戦闘力入力が不正: ${key}`);
        return number;
      }
    }
    return null;
  }

  function round3AwayFromZero(value) {
    if (!Number.isFinite(value) || Math.abs(value) >= 1e15) throw new Error('戦闘力の丸め範囲外');
    const scaled = value * 1000;
    const whole = Math.trunc(scaled);
    return (whole + (Math.abs(scaled - whole) >= 0.5 ? Math.sign(scaled) : 0)) / 1000;
  }

  function calculateCombatPower(basic, apostleState = {}, stats = {}) {
    if (!basic) return null;
    const correction = requiredNumber(basic, ['戦闘力補正値', 'combatPowerCorrection']);
    const legacyCorrection = requiredNumber(basic, ['戦闘力補正値B', 'combatPowerCorrectionB', 'weight_value_a']);
    if (correction !== null && legacyCorrection !== null && correction !== legacyCorrection) {
      throw new Error(`戦闘力補正値と旧Bが矛盾: ${basic.id || ''}`);
    }
    const weights = [
      requiredNumber(basic, ['戦闘力低学年係数', 'combatPowerLowSkillCoefficient']),
      requiredNumber(basic, ['戦闘力高学年係数', 'combatPowerHighSkillCoefficient']),
      requiredNumber(basic, ['戦闘力パッシブ係数', 'combatPowerPassiveCoefficient']),
      requiredNumber(basic, ['戦闘力アサイド係数', 'combatPowerAsideCoefficient'])
    ];
    const speed = requiredNumber(basic, ['攻撃速度基礎', 'baseAttackSpeed']);
    if (correction === null && legacyCorrection === null || weights.includes(null) || speed === null) return null;
    const numeric = key => {
      const value = Number(stats[key]);
      if (!Number.isFinite(value) || value < 0) throw new Error(`戦闘力内部値が不正: ${key}`);
      return value;
    };
    const attack = String(basic.攻撃タイプ || basic.攻撃Type || basic.attackType || '') === '魔法'
      ? numeric('matk') : numeric('patk');
    const terms = [
      attack * 2.1,
      (numeric('pdef') + numeric('mdef')) * 0.7,
      numeric('hp') * 0.08,
      numeric('crit') * 0.7,
      numeric('critDmg') * 0.7,
      numeric('critRes') * 0.7,
      numeric('critDmgRes') * 0.7,
      speed * 0.6
    ];
    const sum = terms.reduce((value, term) => value + round3AwayFromZero(term), 0);
    const skills = apostleState.skillLevels || apostleState.skills || {};
    const levels = ['low', 'high', 'passive'].map(key => {
      const value = Number(skills[key] ?? 1);
      if (!Number.isInteger(value) || value < 0) throw new Error(`戦闘力スキルLvが不正: ${key}`);
      return value;
    });
    const aside = isPublicAsideEnabled(basic.id) && Number(apostleState.asideRank || 0) >= 2 ? weights[3] : 0;
    let factor = weights[0] * levels[0] + 1;
    factor += weights[1] * levels[1];
    factor += weights[2] * levels[2];
    factor += aside;
    factor += correction ?? legacyCorrection;
    return Math.trunc(sum * factor);
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
    return { key: physical ? 'patk' : 'matk' };
  }

  function calculateAsideContribution(data, basic, state) {
    const rank = Number(state?.asideRank) || 0;
    if (!rank || !isPublicAsideEnabled(basic?.id)) {
      return { base: createEmptyTotals(), growth: createEmptyTotals(), total: createEmptyTotals(), multiplier: 0 };
    }
    const multiplier = ASIDE_GRADE_MULTIPLIERS[rank];
    if (multiplier === undefined) throw new Error(`未対応のアサイド段階: ${rank}`);
    const row = getAsideTierRow(data, basic);
    if (!row) return null;
    const attackFields = getAsideAttackFields(basic);
    const read = (newKey, oldKey) => {
      const value = row[newKey] ?? row[oldKey];
      if (value === undefined || value === null || value === '') return null;
      const number = Number(value);
      if (!Number.isFinite(number)) throw new Error(`アサイド原値が不正: ${basic.id}/${newKey}`);
      return number;
    };
    const fields = [
      ['hp', 'HP'], [attackFields.key, attackFields.key === 'patk' ? '物理攻撃力' : '魔法攻撃力'],
      ['pdef', '物理防御力'], ['mdef', '魔法防御力']
    ];
    const base = createEmptyTotals();
    const growth = createEmptyTotals();
    const total = createEmptyTotals();
    const growthLevels = Math.max(0, Number(state?.asideLevel || 1) - 1);
    for (const [key, label] of fields) {
      const rawBase = read(`${label}基礎値`, `${label}発現値`);
      const rawGrowth = read(`${label}_A1成長値`, `${label}_A1成長値`);
      if (rawBase === null || rawGrowth === null) return null;
      base[key] = rawBase * multiplier;
      growth[key] = rawGrowth * growthLevels * multiplier;
      total[key] = (rawBase + rawGrowth * growthLevels) * multiplier;
    }
    return { base, growth, total, multiplier };
  }

  function calculateAsideManifestTotals(data, basic, state) {
    return calculateAsideContribution(data, basic, state)?.base ?? null;
  }

  function calculateAsideLevelTotals(data, basic, state) {
    return calculateAsideContribution(data, basic, state)?.growth ?? null;
  }

  function normalizeApostleOverrideState(basic, apostleState, overrides = {}) {
    const star = normalizeApostleStar(overrides.star ?? apostleState?.star ?? basic?.レア度 ?? 1);
    const levelCaps = { 1: 120, 2: 120, 3: 125, 4: 135, 5: 145 };
    const level = Math.max(1, Math.min(levelCaps[star] || 120, Number(overrides.level ?? apostleState?.level) || 1));
    const rank = Math.max(1, Math.min(10, Number(overrides.rank ?? apostleState?.rank) || 1));
    const asideRank = isPublicAsideEnabled(basic?.id)
      ? Math.max(0, Math.min(3, Number(overrides.asideRank ?? apostleState?.asideRank) || 0))
      : 0;
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
        ...Object.fromEntries(ADDITIVE_SOURCES.map(source => [source, cloneJson(emptyTotals)])),
        globalPercent: cloneJson(emptyTotals)
      },
      globalPercentRates: {}
    };
    return rebuildSnapshot(data, basic, apostleState, { ...options, snapshot });
  }

  function createInitialSnapshot(data, basic, apostleState = {}) {
    if (!basic) return null;
    const snapshot = applyApostleOverridesToSnapshot(data, basic, apostleState, {
      kind: 'initialDefault'
    });
    // An existing snapshot cannot be reversed into exact internal fractional stats.
    if (snapshot?.stats) snapshot.stats.combatPower = null;
    return snapshot;
  }

  window.TRICKCAL_SHARED_STAT_ENGINE = {
    version: 10,
    snapshotCalculationVersion: SNAPSHOT_CALCULATION_VERSION,
    hasCompleteBreakdown,
    auditSummonGrowthSnapshot,
    canRebuildLegacySnapshot,
    requiresAsideGlobalRecalculation,
    normalizeGrade,
    getGradeStatBonusRate,
    calculateBaseTotals,
    calculateCombatPower,
    round3AwayFromZero,
    calculateAsideContribution,
    calculateFinalInternalTotals,
    followFraction,
    commonFlatValue,
    encodeComparisonStatSnapshots,
    decodeComparisonStatSnapshots,
    createInitialSnapshot,
    applyGradeOverrideToSnapshot,
    applyApostleOverridesToSnapshot
  };
})();
