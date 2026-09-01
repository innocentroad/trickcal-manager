(function (root, factory) {
  'use strict';

  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_DPS_SIMULATOR = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_TICKS_PER_FRAME = 10;
  const DEFAULT_FRAMES_PER_SECOND = 60;
  const ACTION_SKILL_TYPES = Object.freeze({
    basicAttack: '普通攻撃_基本',
    enhancedAttack: '普通攻撃_強化',
    lowSkill: '低学年',
    highSkill: '高学年'
  });
  const ACTION_LABELS = Object.freeze({
    basicAttack: '基本攻撃',
    enhancedAttack: '強化攻撃',
    lowSkill: '低学年',
    highSkill: '高学年'
  });
  const ENEMY_SIZE_BRANCH_RANKS = Object.freeze({
    '超小型敵': 1,
    '小型敵': 2,
    '中型敵': 3,
    '大型敵': 4,
    '超大型敵': 5
  });
  const ENEMY_SIZE_RANKS = Object.freeze({
    extraSmall: 1,
    small: 2,
    medium: 3,
    large: 4,
    extraLarge: 5
  });
  const DOT_STATUS_MULTIPLIERS = Object.freeze({
    '火傷': 30,
    '毒': 6,
    '苦痛': 12,
    '凍傷': 9
  });
  const KNOWN_NON_DAMAGE_STATUSES = Object.freeze([
    '感電',
    '気絶',
    '沈黙',
    '好奇心',
    '目くらまし',
    '破壊'
  ]);
  const DEFAULT_STATUS_MAX_STACKS = 9;
  const STATUS_TICK_FRAMES = 60;

  function toFiniteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function toTicks(frames, ticksPerFrame = DEFAULT_TICKS_PER_FRAME) {
    return Math.max(0, Math.round(toFiniteNumber(frames) * ticksPerFrame));
  }

  function createSeededRandom(seed = 1) {
    let state = (Math.floor(toFiniteNumber(seed, 1)) >>> 0) || 1;
    return function random() {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 0x100000000;
    };
  }

  function normalizeArray(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function getTimingQualityFromResearchStatus(status, fallback = 'provisional') {
    const value = String(status || '').trim();
    if (/^(?:済|完了)$/.test(value)) return 'measured';
    if (/^(?:途中|暫定|仮定|未調査|未|要調査)$/.test(value)) return 'provisional';
    return fallback;
  }

  const PUBLIC_TIMELINE_STATE_EVENT_TYPES = Object.freeze(new Set([
    'statusApplied',
    'statusExpired',
    'runtimeBuffApplied',
    'runtimeBuffExpired',
    'resourceChange',
    'attackSpeedInitial',
    'attackSpeedApplied',
    'attackSpeedExpired',
    'attackSpeedReset'
  ]));

  function getTimelineEventTime(event = {}) {
    const tick = Number(event?.tick);
    if (Number.isFinite(tick)) return `tick:${tick}`;
    const frame = Number(event?.frame);
    return Number.isFinite(frame) ? `frame:${frame}` : '';
  }

  function isPublicTimelineStateDuplicate(stateEvent = {}, legacyEvent = {}) {
    if (getTimelineEventTime(stateEvent) !== getTimelineEventTime(legacyEvent)) return false;
    const kind = String(stateEvent.kind || '');
    const legacyType = String(legacyEvent.type || '');
    const compatibleKinds = {
      statusApplied: ['debuff'],
      statusExpired: ['debuff'],
      runtimeBuffApplied: ['buff', 'resourceBuff'],
      runtimeBuffExpired: ['buff', 'resourceBuff'],
      resourceChange: ['resource'],
      attackSpeedInitial: ['attackSpeed'],
      attackSpeedApplied: ['attackSpeed'],
      attackSpeedExpired: ['attackSpeed'],
      attackSpeedReset: ['attackSpeed']
    }[legacyType] || [];
    if (!compatibleKinds.includes(kind)) return false;
    const stateIds = [stateEvent.effectId, stateEvent.status, stateEvent.label]
      .map(value => String(value || '').trim())
      .filter(Boolean);
    const legacyIds = [legacyEvent.effectId, legacyEvent.runtimeEffectId, legacyEvent.applicationEffectId,
      legacyEvent.resourceId, legacyEvent.status, legacyEvent.label]
      .map(value => String(value || '').trim())
      .filter(Boolean);
    return stateIds.some(id => legacyIds.includes(id));
  }

  // Keep the detailed legacy event records for diagnostics and existing callers,
  // while exposing one state transition per change to the public timeline.
  function createDpsPublicTimeline(timeline = []) {
    const rows = normalizeArray(timeline);
    const stateEvents = rows.filter(event => event?.type === 'effectStateChanged');
    if (!stateEvents.length) return rows;
    return rows.filter(event => (
      event?.type === 'effectStateChanged'
        || !PUBLIC_TIMELINE_STATE_EVENT_TYPES.has(String(event?.type || ''))
        || !stateEvents.some(stateEvent => isPublicTimelineStateDuplicate(stateEvent, event))
    ));
  }

  function normalizeRuntimeTriggerProbability(effect = {}) {
    const explicitRaw = effect?.triggerProbability;
    const explicit = explicitRaw == null || explicitRaw === ''
      ? NaN
      : Number(explicitRaw);
    const triggerType = String(effect?.triggerType || '').replace(/[\s　]+/g, '');
    const inferred = /^(?:普通|通常)攻撃命中時一定確率$/.test(triggerType)
      ? Number(effect?.triggerValue)
      : NaN;
    const value = Number.isFinite(explicit) ? explicit : inferred;
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null;
  }

  // Timing branches are not all the same kind of choice.  An aside branch
  // augments the base motion, while a favorite-card branch replaces it.  Keep
  // the distinction explicit for callers that can provide it, and retain the
  // data-compatible aside-name fallback for older snapshots.
  function normalizeTimingBranchMode(value) {
    const text = String(value || '').trim().toLowerCase();
    if (['additive', 'add', 'merge', 'merged', 'combined', '共通併用', '追加', '加算', '合成'].includes(text)) {
      return 'additive';
    }
    if (['replacement', 'replace', 'exact', 'exclusive', '置換', '完全', '排他'].includes(text)) {
      return 'replacement';
    }
    return '';
  }

  function getTimingBranchModeValue(value) {
    if (typeof value === 'string') return normalizeTimingBranchMode(value);
    if (!value || typeof value !== 'object') return '';
    return normalizeTimingBranchMode(
      value.mode ?? value.composition ?? value.branchComposition ?? value.timingBranchMode
    );
  }

  function getTimingAsideBranchRank(branch = '') {
    const match = String(branch || '').trim().match(/^(?:A|アサイド)(?:Lv)?([1-3])$/i);
    return match ? Number(match[1]) : 0;
  }

  function resolveTimingBranchMode(buildOptions = {}, actionKey = '', branch = '') {
    const candidates = [];
    const collect = source => {
      if (!source || typeof source !== 'object') return;
      const actionValue = source[actionKey];
      candidates.push(actionValue?.[branch]);
      candidates.push(actionValue?.default);
      candidates.push(actionValue);
      candidates.push(source[branch]);
      candidates.push(source.default);
    };
    collect(buildOptions.timingBranchModes);
    collect(buildOptions.timingBranchComposition);
    collect(buildOptions.timingComposition);
    for (const candidate of candidates) {
      const mode = getTimingBranchModeValue(candidate);
      if (mode) return mode;
    }
    // A1-A3 branches are additive by definition: their skillmotion rows are
    // the aside-specific effects in addition to the common skill rows.
    if (getTimingAsideBranchRank(branch) > 0) return 'additive';
    return 'replacement';
  }

  function getRewriteActionKeys(value = '') {
    const text = String(value || '').replace(/[\s　・_]/g, '');
    const keys = [];
    if (/基本攻撃|(?:普通|通常)攻撃基本/.test(text)) keys.push('basicAttack');
    if (/強化攻撃|(?:普通|通常)攻撃強化/.test(text)) keys.push('enhancedAttack');
    if (/低学年/.test(text)) keys.push('lowSkill');
    if (/高学年/.test(text)) keys.push('highSkill');
    if (!keys.some(key => key === 'basicAttack' || key === 'enhancedAttack') && /普通攻撃|通常攻撃/.test(text)) {
      keys.push('basicAttack', 'enhancedAttack');
    }
    return [...new Set(keys)];
  }

  // 愛用品などが1つのスキル定義で複数行動を書き換える場合でも、
  // DPSへは対象行動の効果だけを渡す。変更前スキルや別行動の倍率を
  // 同じactionへ混在させないための、表示層とシミュレーターの境界。
  function createActionSkillOverride(skill = {}, actionKey = '', metadata = {}) {
    const sourceEffects = normalizeArray(skill?.effects);
    const explicitActionKeys = new Set(sourceEffects
      .flatMap(effect => getRewriteActionKeys(effect?.targetSkill || '')));
    const selectedEffects = sourceEffects.filter(effect => (
      getRewriteActionKeys(effect?.targetSkill || '').includes(actionKey)
    ));
    const selectedProcessGroups = new Set(selectedEffects
      .map(effect => String(effect?.processGroupId || '').trim())
      .filter(Boolean));
    const hasMultipleActions = explicitActionKeys.size > 1;
    const effects = sourceEffects.filter(effect => {
      const targetKeys = getRewriteActionKeys(effect?.targetSkill || '');
      if (targetKeys.length) return targetKeys.includes(actionKey);
      const processGroupId = String(effect?.processGroupId || '').trim();
      if (processGroupId && selectedProcessGroups.has(processGroupId)) return true;
      // 対象が1行動だけなら、対象スキル欄を省略したヒット数・状態付与等も
      // 同じ置換定義として保持する。複数行動定義では明示的な紐付けを優先する。
      return !hasMultipleActions;
    });
    // A pair (or set) of probability-tagged damage rows that totals 100% is a
    // replacement choice, not a collection of additional attacks.  Keep the
    // rows together here so the timeline can choose exactly one for each use.
    const probabilityDamageEffects = effects.filter(effect => (
      isDamageEffect(effect)
      && /^一定確率/.test(String(effect?.triggerType || ''))
      && toFiniteNumber(effect?.triggerValue) > 0
    ));
    const probabilityTotal = probabilityDamageEffects.reduce((total, effect) => (
      total + toFiniteNumber(effect?.triggerValue)
    ), 0);
    const probabilityProcessGroups = new Map();
    probabilityDamageEffects.forEach(effect => {
      const processGroupId = String(effect?.processGroupId || '').trim();
      if (!processGroupId) return;
      probabilityProcessGroups.set(processGroupId, (probabilityProcessGroups.get(processGroupId) || 0) + 1);
    });
    const hasGroupedProbabilityDamage = [...probabilityProcessGroups.values()].some(count => count > 1);
    const dpsExclusiveDamageCandidates = probabilityDamageEffects.length > 1
      && Math.abs(probabilityTotal - 100) < 0.0001
      && !hasGroupedProbabilityDamage
      ? Array.from(probabilityDamageEffects, effect => ({
          effectId: String(effect?.effectId || ''),
          weight: toFiniteNumber(effect?.triggerValue)
        })).filter(candidate => candidate.effectId && candidate.weight > 0)
      : [];
    return {
      ...JSON.parse(JSON.stringify(skill || {})),
      ...metadata,
      effects,
      dpsActionKey: actionKey,
      dpsReplacesBase: true,
      dpsExclusiveDamageCandidates
    };
  }

  function findSkill(apostle, actionKey, skillOverrides = {}) {
    const override = skillOverrides?.[actionKey];
    if (override) return override;
    const skillType = ACTION_SKILL_TYPES[actionKey];
    return normalizeArray(apostle?.skills).find(skill => skill?.skillType === skillType) || null;
  }

  function getBranchName(effect) {
    return (String(effect?.valueKind || '').match(/^\[([^\]]+)\]/) || [])[1] || '';
  }

  function getTimingVariantLabel(effect = {}, fallback = '') {
    const valueKind = String(effect?.valueKind || '').trim().replace(/^\[[^\]]+\]\s*/, '');
    if (valueKind) return valueKind;
    const label = String(effect?.label || '').trim();
    return label || String(fallback || '').trim();
  }

  function isDamageEffect(effect) {
    return effect?.effectType === '攻撃' && effect?.valueClass === '倍率';
  }

  function isDeferredDamageEffect(effect) {
    const text = `${effect?.valueKind || ''} ${effect?.condition || ''}`;
    return /破壊時|終了時|死亡時|撃破時|条件発動/.test(text);
  }

  function getTimingBranchStateIds(skill, branch = '') {
    const normalizedBranch = String(branch || '').trim();
    if (!normalizedBranch) return [];
    return [...new Set(normalizeArray(skill?.effects)
      .filter(effect => String(effect?.conditionType || '') === '固有状態中')
      .filter(effect => String(effect?.condition || '').includes(normalizedBranch))
      .map(effect => String(effect?.conditionValue || '').trim())
      .filter(Boolean))];
  }

  function isEffectActiveForTimingBranch(effect, skill, branch = '') {
    const conditionType = String(effect?.conditionType || '');
    const conditionValue = String(effect?.conditionValue || '').trim();
    if (!conditionValue || !['固有状態中', '固有状態外'].includes(conditionType)) return true;
    const branchStateIds = getTimingBranchStateIds(skill, branch);
    if (conditionType === '固有状態中') {
      return branchStateIds.includes(conditionValue);
    }
    return !branchStateIds.length;
  }

  function getDamageEffects(skill, branch = '') {
    return normalizeArray(skill?.effects).filter(effect => {
      if (!isDamageEffect(effect) || isDeferredDamageEffect(effect)) return false;
      if (!isEffectActiveForTimingBranch(effect, skill, branch)) return false;
      const effectBranch = getBranchName(effect);
      const stateConditional = String(effect?.conditionType || '') === '固有状態中';
      return branch ? (effectBranch === branch || (!effectBranch && stateConditional)) : !effectBranch;
    });
  }

  function getTotalHitCount(skill, branch = '') {
    const row = normalizeArray(skill?.effects).find(effect => {
      if (effect?.effectType !== '攻撃' || effect?.valueClass !== 'ヒット数') return false;
      if (!isEffectActiveForTimingBranch(effect, skill, branch)) return false;
      const effectBranch = getBranchName(effect);
      const stateConditional = String(effect?.conditionType || '') === '固有状態中';
      return branch ? (effectBranch === branch || (!effectBranch && stateConditional)) : !effectBranch;
    });
    const count = Number(row?.fixedValue);
    return Number.isFinite(count) && count > 0
      ? Math.floor(count)
      : getDamageEffects(skill, branch).length ? 1 : 0;
  }

  // Timing patterns are intentionally evaluated at simulation-build time.  The
  // workbook can describe a count such as
  // "基本攻撃回数+min(装備遺物数,最大追加攻撃回数)*遺物1個ごとの追加攻撃回数"
  // without baking a particular formation into generated timing data.
  function tokenizeTimingExpression(expression) {
    const text = String(expression || '').trim();
    if (!text) return [];
    const tokens = [];
    const tokenPattern = /\s*(min|max|[()+\-*/×,]|\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_-]*|[^\s()+\-*/×,]+)/gy;
    let cursor = 0;
    while (cursor < text.length) {
      tokenPattern.lastIndex = cursor;
      const match = tokenPattern.exec(text);
      if (!match || match.index !== cursor) return null;
      tokens.push(match[1]);
      cursor = tokenPattern.lastIndex;
    }
    return tokens;
  }

  function evaluateTimingExpression(expression, variables = {}) {
    const tokens = tokenizeTimingExpression(expression);
    if (!tokens?.length) return null;
    let index = 0;
    const hasVariable = key => Object.prototype.hasOwnProperty.call(variables, key);
    const parseExpression = () => {
      let value = parseTerm();
      if (value == null) return null;
      while (index < tokens.length && ['+', '-'].includes(tokens[index])) {
        const operator = tokens[index++];
        const right = parseTerm();
        if (right == null) return null;
        value = operator === '+' ? value + right : value - right;
      }
      return value;
    };
    const parseTerm = () => {
      let value = parseFactor();
      if (value == null) return null;
      while (index < tokens.length && ['*', '×', '/'].includes(tokens[index])) {
        const operator = tokens[index++];
        const right = parseFactor();
        if (right == null) return null;
        if (operator === '/') {
          if (right === 0) return null;
          value /= right;
        } else {
          value *= right;
        }
      }
      return value;
    };
    const parseFactor = () => {
      if (tokens[index] === '-') {
        index += 1;
        const value = parseFactor();
        return value == null ? null : -value;
      }
      return parsePrimary();
    };
    const parsePrimary = () => {
      const token = tokens[index++];
      if (token == null) return null;
      if (token === '(') {
        const value = parseExpression();
        if (tokens[index++] !== ')') return null;
        return value;
      }
      if (/^\d+(?:\.\d+)?$/.test(token)) return Number(token);
      if (!['min', 'max'].includes(token)) {
        return hasVariable(token) ? Number(variables[token]) : null;
      }
      if (tokens[index++] !== '(') return null;
      const args = [];
      while (index < tokens.length && tokens[index] !== ')') {
        const value = parseExpression();
        if (value == null) return null;
        args.push(value);
        if (tokens[index] === ',') index += 1;
        else if (tokens[index] !== ')') return null;
      }
      if (tokens[index++] !== ')' || !args.length) return null;
      return token === 'min' ? Math.min(...args) : Math.max(...args);
    };
    const result = parseExpression();
    return index === tokens.length && Number.isFinite(result) ? result : null;
  }

  function getTimingActionKeys(value = '') {
    const text = String(value || '');
    const keys = [];
    if (/低学年/.test(text)) keys.push('lowSkill');
    if (/高学年/.test(text)) keys.push('highSkill');
    if (/強化攻撃/.test(text)) keys.push('enhancedAttack');
    if (/基本攻撃|普通攻撃/.test(text)) keys.push('basicAttack');
    return [...new Set(keys)];
  }

  function normalizeScenarioId(value) {
    return String(value ?? '').trim().toLowerCase();
  }

  function getScenarioValueById(collection, targetId) {
    if (!collection || typeof collection !== 'object') return null;
    const targetKey = normalizeScenarioId(targetId);
    if (!targetKey) return null;
    const direct = collection[targetId];
    if (direct != null) return direct;
    const entry = Object.entries(collection).find(([id]) => normalizeScenarioId(id) === targetKey);
    return entry ? entry[1] : null;
  }

  function getScenarioArtifactCount(scenario, apostleId) {
    const targetId = String(apostleId || scenario?.actors?.self?.id || scenario?.characterState?.targetId || '');
    const targetKey = normalizeScenarioId(targetId);
    const rows = normalizeArray(scenario?.formationState?.formation?.rows || scenario?.formation?.rows);
    const override = getScenarioValueById(scenario?.cardState?.tempArtifacts?.target, targetId);
    for (const row of rows) {
      const apostles = normalizeArray(row?.apostles);
      const index = apostles.findIndex(item => normalizeScenarioId(item?.id ?? item?.apostleId ?? item) === targetKey);
      if (index < 0) continue;
      const artifactLines = row?.artifacts || row?.artifactIds;
      const slots = normalizeArray(artifactLines?.[index]).map(item => (
        typeof item === 'string' ? item : item?.id
      ));
      const resolved = Array.isArray(override)
        ? override
        : slots.map((id, slot) => (
          override && typeof override === 'object' && Object.prototype.hasOwnProperty.call(override, slot)
            ? override[slot]
            : id
        ));
      return resolved.filter(Boolean).length;
    }
    return null;
  }

  function getScenarioAsideRank(scenario, apostleId, fallback = 0) {
    const targetId = String(apostleId || scenario?.actors?.self?.id || scenario?.characterState?.targetId || '');
    const state = getScenarioValueById(scenario?.characterState?.apostles, targetId)
      || getScenarioValueById(scenario?.apostles, targetId)
      || null;
    return Math.max(0, Math.floor(toFiniteNumber(
      state?.asideRank ?? state?.aside ?? fallback,
      fallback
    )));
  }

  function getSkillCountModifierValue(modifier, skillLevel = 1) {
    const value = modifier?.value ?? modifier?.fixedValue;
    const levels = modifier?.levels;
    if (levels && typeof levels === 'object') {
      const levelValue = levels[String(skillLevel)] ?? levels[String(Math.max(1, Math.floor(skillLevel)))];
      if (levelValue != null && Number.isFinite(Number(levelValue))) return Number(levelValue);
    }
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function buildSkillCountModifiers(apostle, asideRank = 0, skillLevels = {}) {
    const result = [];
    const levels = apostle?.aside?.levels && typeof apostle.aside.levels === 'object'
      ? apostle.aside.levels
      : {};
    Object.entries(levels).forEach(([levelKey, levelData]) => {
      const level = Number(levelKey);
      if (!Number.isFinite(level) || level > Number(asideRank || 0)) return;
      normalizeArray(levelData?.effects).forEach(effect => {
        const valueKind = String(effect?.valueKind || '');
        if (!/追加攻撃回数|攻撃回数/.test(valueKind)) return;
        const actionKeys = getTimingActionKeys(
          `${effect?.targetSkill || ''} ${effect?.targetSkillName || ''} ${effect?.attackCategory || ''} ${valueKind}`
        );
        result.push({
          id: String(effect?.effectId || `${apostle?.id || 'apostle'}:aside:${level}:${result.length}`),
          sourceId: String(effect?.effectId || ''),
          label: String(effect?.valueKind || effect?.effectId || '追加攻撃回数'),
          actionKeys,
          conditionType: String(effect?.conditionType || effect?.applicationConditionType || ''),
          conditionValue: effect?.conditionValue ?? effect?.applicationConditionValue ?? '',
          value: getSkillCountModifierValue(effect, getActionSkillLevel(skillLevels, actionKeys[0] || 'lowSkill')),
          valueKind,
          targetSkill: String(effect?.targetSkill || '')
        });
      });
    });
    return result;
  }

  function getActiveSkillCountModifierSum(modifiers, actionKey, artifactCount = 0) {
    return normalizeArray(modifiers).reduce((total, modifier) => {
      const actionKeys = normalizeArray(modifier?.actionKeys).map(String);
      if (actionKeys.length && !actionKeys.includes(actionKey)) return total;
      const conditionType = String(modifier?.conditionType || '');
      const conditionValue = String(modifier?.conditionValue ?? '');
      if (/装備遺物数/.test(conditionType)) {
        const expected = Number(conditionValue.match(/\d+/)?.[0]);
        if (Number.isFinite(expected) && expected !== Number(artifactCount)) return total;
      }
      return total + toFiniteNumber(modifier?.value);
    }, 0);
  }

  function resolveTimingPatternCount(pattern, skill, skillLevel, timingContext = {}, actionKey, warnings) {
    const variables = {
      装備遺物数: Math.max(0, Math.floor(toFiniteNumber(timingContext.artifactCount))),
      artifactCount: Math.max(0, Math.floor(toFiniteNumber(timingContext.artifactCount))),
      適用中の低学年スキル追加攻撃回数: getActiveSkillCountModifierSum(
        timingContext.skillCountModifiers,
        actionKey,
        timingContext.artifactCount
      )
    };
    normalizeArray(skill?.effects).forEach(effect => {
      if (!effect?.effectId) return;
      variables[String(effect.effectId)] = toFiniteNumber(resolveEffectValue(effect, skillLevel));
    });
    const count = evaluateTimingExpression(pattern?.countExpression, variables);
    if (count == null) {
      warnings.push(`${skill?.skillId || skill?.skillType || 'スキル'}: 発生回数式「${pattern?.countExpression || '(空欄)'}」を評価できません`);
      return 0;
    }
    return Math.max(0, Math.floor(count));
  }

  function expandTimingPatterns(actionTiming, skill, actionKey, branch, skillLevel, timingContext, warnings, includeCommonRows = true) {
    return normalizeArray(actionTiming?.timingPatterns).flatMap(pattern => {
      const patternBranch = String(pattern?.branch || '');
      const branchMatches = patternBranch === branch
        || (includeCommonRows && (!patternBranch || patternBranch === '共通'));
      if (!branchMatches) return [];
      const initialFrame = Number(pattern?.initialFrame);
      const intervalFrames = Number(pattern?.intervalFrames ?? 0);
      if (!Number.isFinite(initialFrame)) return [];
      const count = resolveTimingPatternCount(pattern, skill, skillLevel, timingContext, actionKey, warnings);
      if (count <= 0) return [];
      return Array.from({ length: count }, (_, index) => ({
        branch: patternBranch,
        order: toFiniteNumber(pattern?.order, 1) + index,
        effectKind: pattern?.effectKind || 'ダメージ',
        effectId: pattern?.effectId || '',
        lv1PerHitMultiplier: pattern?.lv1PerHitMultiplier ?? null,
        frame: initialFrame + intervalFrames * index,
        hitCount: 1,
        researchStatus: pattern?.researchStatus || '',
        timingQuality: getTimingQualityFromResearchStatus(pattern?.researchStatus),
        adoption: pattern?.adoption || '採用',
        note: pattern?.note || ''
      }));
    });
  }

  function resolveEffect(skill, effectId) {
    if (!effectId) return null;
    return normalizeArray(skill?.effects).find(effect => effect?.effectId === effectId) || null;
  }

  function resolveApostleEffect(apostle, skill, effectId) {
    return resolveEffect(skill, effectId)
      || normalizeArray(apostle?.skills)
        .flatMap(candidate => normalizeArray(candidate?.effects))
        .find(effect => effect?.effectId === effectId)
      || null;
  }

  function isDeclaredDamageKind(value) {
    const text = String(value || '');
    return /ダメージ|攻撃判定|^攻撃$/.test(text);
  }

  function getStatusName(valueKind) {
    const text = String(valueKind || '').replace(/^\[[^\]]+\]\s*/, '').trim();
    const known = [...Object.keys(DOT_STATUS_MULTIPLIERS), ...KNOWN_NON_DAMAGE_STATUSES]
      .find(status => text === status || text.startsWith(`${status} `));
    return known || text;
  }

  function getEnhancedStatusPresenceTrigger(triggerType = '') {
    const match = String(triggerType || '').trim().match(/^(.+?)状態の敵が存在$/);
    return match ? getStatusName(match[1]) : '';
  }

  function resolveEffectValue(effect, level = 1) {
    const value = effect?.levels?.[String(level)] ?? effect?.fixedValue;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function getActionSkillLevel(skillLevels, actionKey) {
    if (actionKey === 'lowSkill') return Math.max(1, Math.floor(toFiniteNumber(skillLevels?.low, 1)));
    if (actionKey === 'highSkill') return Math.max(1, Math.floor(toFiniteNumber(skillLevels?.high, 1)));
    return Math.max(1, Math.floor(toFiniteNumber(skillLevels?.default, 1)));
  }

  function getSkillLevel(skill, skillLevels = {}) {
    if (skill?.skillType === '低学年') return Math.max(1, Math.floor(toFiniteNumber(skillLevels.low, 1)));
    if (skill?.skillType === '高学年') return Math.max(1, Math.floor(toFiniteNumber(skillLevels.high, 1)));
    if (skill?.skillType === 'パッシブ') return Math.max(1, Math.floor(toFiniteNumber(skillLevels.passive, 1)));
    return Math.max(1, Math.floor(toFiniteNumber(skillLevels.default, 1)));
  }

  function buildRuntimeResources(apostle, skillLevels = {}) {
    const skillEffects = normalizeArray(apostle?.skills).flatMap(skill => (
      normalizeArray(skill?.effects).map(effect => ({ skill, effect }))
    ));
    const resources = new Map();
    const findResource = value => {
      const key = String(value || '').trim();
      if (!key) return null;
      return resources.get(key)
        || Array.from(resources.values()).find(resource => (
          resource.id === key || resource.name === key
        ))
        || null;
    };
    const addResource = (definition = {}) => {
      const id = String(definition.id || definition.stateId || definition.name || '').trim();
      const name = String(definition.name || id).trim();
      if (!id || !name) return null;
      const current = findResource(id) || findResource(name) || {
        id,
        name,
        initialStacks: 0,
        maxStacks: 1
      };
      current.id = id;
      current.name = name;
      current.initialStacks = Math.max(
        0,
        toFiniteNumber(definition.initialStacks ?? definition.initialValue, current.initialStacks)
      );
      current.maxStacks = Math.max(
        1,
        Math.floor(toFiniteNumber(definition.maxStacks ?? definition.maxValue, current.maxStacks))
      );
      if (definition.minValue != null) current.minStacks = toFiniteNumber(definition.minValue, 0);
      if (definition.step != null) current.step = Math.max(0, toFiniteNumber(definition.step));
      if (definition.changeEventBasis) current.changeEventBasis = String(definition.changeEventBasis);
      if (definition.verificationStatus) current.verificationStatus = String(definition.verificationStatus);
      if (definition.calculationSupportLevel) {
        current.calculationSupportLevel = String(definition.calculationSupportLevel);
      }
      resources.set(current.id, current);
      return current;
    };

    // 固有状態基礎設定が生成データに存在する場合は、表示名ではなく
    // stateIdを内部キーにする。効果行側の「富豪獲得」と
    // 「Pira_wealth:30」を同じ状態へ結び付けられるようにする。
    normalizeArray(apostle?.uniqueStates)
      .filter(state => /固有リソース|resource/i.test(String(state?.category || '')))
      .forEach(state => addResource({
        id: state.stateId || state.id,
        name: state.name || state.stateName || state.stateId || state.id,
        initialValue: state.initialValue,
        maxValue: state.maxValue,
        minValue: state.minValue,
        step: state.step,
        changeEventBasis: state.changeEventBasis,
        verificationStatus: state.verificationStatus,
        calculationSupportLevel: state.calculationSupportLevel
      }));

    skillEffects.forEach(({ effect }) => {
      const match = String(effect?.valueKind || '').match(/^(.+?)最大数$/);
      if (!match) return;
      const name = match[1];
      const maxStacks = Math.max(1, Math.floor(toFiniteNumber(effect.fixedValue, effect.maxStack || 1)));
      const current = addResource({ id: name, name, maxStacks });
      current.maxStacks = Math.max(current.maxStacks, maxStacks);
    });
    // 上限行がない古いデータでも、獲得・消費行と参照IDからリソースを
    // 生成する。uniqueStatesがある場合は既存のstateIdへ統合する。
    skillEffects.forEach(({ effect }) => {
      const valueKind = String(effect?.valueKind || '');
      const match = valueKind.match(/^(.+?)(獲得|消費)$/);
      if (!match) return;
      addResource({
        id: effect.reference || match[1],
        name: match[1],
        maxStacks: effect.maxStack
      });
    });
    resources.forEach(resource => {
      const heldEffects = skillEffects.filter(({ effect }) => (
        (String(effect?.condition || '').includes(`${resource.name}所持時`)
          || String(effect?.conditionValue || '').includes(resource.id))
        && /与ダメージ量増加|与ダメージ|ダメージ量増加/.test(String(effect?.valueKind || ''))
      ));
      resource.heldAddEffectIds = heldEffects
        .map(({ effect }) => String(effect?.effectId || ''))
        .filter(Boolean);
      resource.heldAddPPerStack = heldEffects.reduce((max, { skill, effect }) => (
        Math.max(max, toFiniteNumber(resolveEffectValue(effect, getSkillLevel(skill, skillLevels))))
      ), 0);

      const gainBuff = skillEffects.find(({ effect }) => (
        (String(effect?.condition || '').includes(`${resource.name}獲得時`)
          || String(effect?.conditionValue || '').includes(resource.id))
        && /攻撃力増加/.test(String(effect?.valueKind || ''))
        && effect?.valueClass === '倍率'
      ));
      if (!gainBuff) return;
      const durationEffect = normalizeArray(gainBuff.skill?.effects).find(effect => (
        (String(effect?.condition || '').includes(`${resource.name}獲得時`)
          || String(effect?.conditionValue || '').includes(resource.id))
        && (effect?.valueClass === '持続時間' || /持続時間/.test(String(effect?.valueKind || '')))
      ));
      const durationSeconds = resolveEffectValue(durationEffect, getSkillLevel(gainBuff.skill, skillLevels));
      resource.gainBuff = {
        id: gainBuff.effect.effectId || `${resource.id}:gainBuff`,
        label: gainBuff.effect.valueKind || `${resource.name}獲得時バフ`,
        attackPPerStack: toFiniteNumber(resolveEffectValue(
          gainBuff.effect,
          getSkillLevel(gainBuff.skill, skillLevels)
        )),
        maxStacks: Math.max(1, Math.floor(toFiniteNumber(gainBuff.effect.maxStack, 9))),
        durationFrames: durationSeconds > 0 ? durationSeconds * DEFAULT_FRAMES_PER_SECOND : 0
      };
    });
    return Array.from(resources.values());
  }

  function getResourceChange(effect, declaredKind, branch, runtimeResources = [], skillLevel = 1) {
    const valueKind = String(effect?.valueKind || '').trim();
    const declared = String(declaredKind || '').trim();
    const operationText = valueKind || declared;
    const operationMatch = operationText.match(/^(.+?)(獲得|消費)$/);
    const referencedId = String(effect?.reference || '').trim();
    for (const resource of runtimeResources) {
      const nameMatches = operationMatch && (
        operationMatch[1] === resource.name
        || operationMatch[1] === resource.id
        || referencedId === resource.id
      );
      if (nameMatches && operationMatch[2] === '獲得') {
        return {
          resourceId: resource.id,
          operation: 'gain',
          amount: Math.max(0, toFiniteNumber(resolveEffectValue(effect, skillLevel))),
          changeEventBasis: resource.changeEventBasis || '実際の増減時'
        };
      }
      if (nameMatches && operationMatch[2] === '消費') {
        const rawAmount = effect?.fixedValue ?? effect?.value;
        const rangeMatch = String(rawAmount ?? '').match(/(-?\d+(?:\.\d+)?)\s*[～~\-]\s*(-?\d+(?:\.\d+)?)/);
        const resolvedAmount = resolveEffectValue(effect, skillLevel);
        const fallbackAmount = resolvedAmount == null ? 1 : toFiniteNumber(resolvedAmount);
        const amountMin = rangeMatch ? Math.max(0, Number(rangeMatch[1])) : Math.max(0, fallbackAmount);
        const amountMax = rangeMatch ? Math.max(amountMin, Number(rangeMatch[2])) : amountMin;
        return {
          resourceId: resource.id,
          operation: 'consume',
          amount: amountMin,
          amountMin,
          amountMax,
          random: amountMax > amountMin,
          provisional: amountMax > amountMin,
          changeEventBasis: resource.changeEventBasis || '実際の増減時'
        };
      }
    }
    return null;
  }

  function calcRuntimeBaseDamageRate(atk, def) {
    const x = atk / Math.max(1, def);
    const rate = x >= 0.5
      ? 1.2 * (1 - 0.5 / (1 + (10 / 3) * (x - 0.5)))
      : 0.6 * (1 - ((13 / 3) * (0.5 - x)) / (1 + (10 / 3) * (0.5 - x)));
    return Math.max(0.1125, Math.min(1.2, rate));
  }

  function calcRuntimeCritRate(crit, critRes) {
    const x = crit / Math.max(1, critRes);
    const rate = x >= 1
      ? 0.30 + 0.50 * ((x - 1) / (x + 2))
      : 0.05 + 0.25 * (x / (2 - x));
    return Math.max(0.05, Math.min(0.8, rate));
  }

  function calcRuntimeCritMultiplier(critDmg, critDmgRes) {
    const x = critDmg / Math.max(1, critDmgRes);
    const multiplier = x >= 1
      ? 1.75 + 0.85 * (x - 1) / (x + 2)
      : 1.75 - 1.10 * (1 - x) / (2 - x);
    return Math.max(1.2, Math.min(2.5, multiplier));
  }

  function addModifierMap(target, source, factor = 1) {
    Object.entries(source || {}).forEach(([key, value]) => {
      target[key] = toFiniteNumber(target[key]) + toFiniteNumber(value) * factor;
    });
    return target;
  }

  function getRuntimeDamageBuffDelta(state, config, actionKey = '') {
    const delta = {};
    normalizeArray(state?.runtimeBuffStacks).forEach(stack => {
      if (stack.kind === 'resourceGain') {
        if (!normalizeArray(state.runtimeDamageEffectIds).includes(stack.effectId)) return;
      } else if (stack.kind !== 'damageBuff') {
        return;
      }
      addModifierMap(delta, stack.modifiers);
    });
    normalizeArray(config?.runtimeEffects?.damageBuffEffects).forEach(effect => {
      if (effect.mode === 'conditionalStatus' && isRuntimeStatusConditionActive(state, effect)) {
        addModifierMap(delta, effect.modifiers);
      }
      addModifierMap(delta, effect.baselineModifiersByAction?.[actionKey], -1);
    });
    return delta;
  }

  function isRuntimeStatusConditionActive(state, effect) {
    if (effect?.mode !== 'conditionalStatus' || !effect.requiredStatus) return false;
    return normalizeArray(state?.statusStacks).some(stack => (
      stack.status === effect.requiredStatus
      && state.tick < stack.expireTick
      && (!effect.requireSelfSource || stack.sourceSelf === true)
    ));
  }

  function getRuntimeAttackModifierP(modifiers, damageType = '') {
    let value = toFiniteNumber(modifiers?.atkP);
    if (damageType === 'physical') value += toFiniteNumber(modifiers?.physicalAtkP);
    if (damageType === 'magic') value += toFiniteNumber(modifiers?.magicAtkP);
    return value;
  }

  function getRuntimeAddModifierP(modifiers, actionKey = '') {
    let value = toFiniteNumber(modifiers?.addP);
    if (actionKey === 'basicAttack' || actionKey === 'enhancedAttack') {
      value += toFiniteNumber(modifiers?.normalAttackAddP);
    }
    if (actionKey === 'basicAttack') value += toFiniteNumber(modifiers?.basicAddP);
    if (actionKey === 'enhancedAttack') value += toFiniteNumber(modifiers?.enhancedAddP);
    if (actionKey === 'lowSkill') value += toFiniteNumber(modifiers?.lowSkillAddP);
    if (actionKey === 'highSkill') value += toFiniteNumber(modifiers?.highSkillAddP);
    if (actionKey === 'lowSkill' || actionKey === 'highSkill') value += toFiniteNumber(modifiers?.skillAddP);
    return value;
  }

  function getRuntimeActionMultiplierModifierP(modifiers, actionKey = '', eventType = '') {
    let value = toFiniteNumber(modifiers?.actionMultiplierBonusP);
    if (actionKey === 'basicAttack' || actionKey === 'enhancedAttack') {
      value += toFiniteNumber(modifiers?.normalAttackMultiplierBonusP);
    }
    if (actionKey === 'basicAttack') value += toFiniteNumber(modifiers?.basicMultiplierBonusP);
    if (actionKey === 'enhancedAttack') value += toFiniteNumber(modifiers?.enhancedMultiplierBonusP);
    if (actionKey === 'lowSkill') value += toFiniteNumber(modifiers?.lowSkillMultiplierBonusP);
    if (actionKey === 'highSkill') value += toFiniteNumber(modifiers?.highSkillMultiplierBonusP);
    if (actionKey === 'lowSkill' || actionKey === 'highSkill') {
      value += toFiniteNumber(modifiers?.skillActionMultiplierBonusP);
    }
    if (/自爆|selfDestruct/i.test(`${actionKey} ${eventType}`)) {
      value += toFiniteNumber(modifiers?.selfDestructMultiplierBonusP);
    }
    return value;
  }

  function buildStatusDefinitions(skill, actionKey, skillLevels, warnings) {
    const effects = normalizeArray(skill?.effects);
    const skillLevel = getSkillLevel(skill, skillLevels);
    return effects.filter(effect => (
      effect?.effectType === 'デバフ'
      && effect?.valueClass === '状態付与'
      && getStatusName(effect?.valueKind)
    )).map(application => {
      const status = getStatusName(application.valueKind);
      const branch = getBranchName(application);
      const durationEffect = effects.find(effect => (
        application?.processGroupId
        && effect?.processGroupId === application.processGroupId
        && effect?.valueClass === '持続時間'
      )) || effects.find(effect => (
        effect?.effectType === 'デバフ'
        && effect?.valueClass === '持続時間'
        && getStatusName(effect?.valueKind) === status
        && getBranchName(effect) === branch
      ));
      const durationSeconds = resolveEffectValue(durationEffect, skillLevel);
      if (!(durationSeconds > 0)) {
        warnings.push(`${skill?.skillId || skill?.skillType}: ${status}の持続時間を解決できません`);
      }
      const declaredMaxStacks = Math.max(
        0,
        Math.floor(toFiniteNumber(application.maxStack ?? durationEffect?.maxStack))
      );
      // 状態付与は、明示的に積み重ねる指定があるものだけをスタック可能にする。
      // 未指定は同名状態を更新して持続時間をリフレッシュする単一枠。
      const stackable = application.effectStack === true
        || durationEffect?.effectStack === true
        || declaredMaxStacks > 1;
      const maxStacks = stackable
        ? Math.max(1, declaredMaxStacks || DEFAULT_STATUS_MAX_STACKS)
        : 1;
      const explicitGroup = application.stackGroupId
        || durationEffect?.stackGroupId
        || '';
      return {
        status,
        branch,
        applicationEffectId: application.effectId || '',
        reference: application.reference || '',
        durationEffectId: durationEffect?.effectId || '',
        durationFrames: durationSeconds > 0 ? durationSeconds * DEFAULT_FRAMES_PER_SECOND : null,
        stackable,
        maxStacks,
        // processGroupId は状態付与と持続時間などの効果行をまとめるIDであり、
        // スタック枠ではない。同じ使徒の同じ状態異常は、スキル・愛用品・
        // アサイドなど発生源が違っても同じ枠へ積む。
        stackGroupId: explicitGroup || `${status}:${stackable ? 'stack' : 'single'}:${maxStacks}`,
        dealsPeriodicDamage: Object.prototype.hasOwnProperty.call(DOT_STATUS_MULTIPLIERS, status),
        tickFrames: Object.prototype.hasOwnProperty.call(DOT_STATUS_MULTIPLIERS, status) ? STATUS_TICK_FRAMES : 0,
        tickMultiplier: DOT_STATUS_MULTIPLIERS[status] || 0
      };
    }).filter(item => item.durationFrames != null);
  }

  function buildGeneratedStatusDefinitions(apostle, actionTiming, skillLevels, warnings) {
    const referencedEffectIds = new Set(normalizeArray(actionTiming?.generatedObjects)
      .flatMap(generated => normalizeArray(generated?.timingEvents))
      .map(row => String(row?.effectId || ''))
      .filter(Boolean));
    if (!referencedEffectIds.size) return [];
    const definitions = [];
    normalizeArray(apostle?.skills).forEach(candidate => {
      const candidateIds = new Set(normalizeArray(candidate?.effects)
        .map(effect => String(effect?.effectId || ''))
        .filter(effectId => referencedEffectIds.has(effectId)));
      if (!candidateIds.size) return;
      const localWarnings = [];
      buildStatusDefinitions(candidate, '', skillLevels, localWarnings)
        .filter(definition => candidateIds.has(definition.applicationEffectId))
        .forEach(definition => definitions.push(definition));
      warnings.push(...localWarnings);
    });
    return definitions;
  }

  function getLv1Multiplier(effect) {
    const value = effect?.levels?.['1'] ?? effect?.fixedValue;
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function getCoefficientShare(effect, lv1PerHitMultiplier) {
    const perHit = Number(lv1PerHitMultiplier);
    const total = getLv1Multiplier(effect);
    return Number.isFinite(perHit) && perHit > 0 && total ? perHit / total : null;
  }

  function resolveRowDamageEffect(skill, row, branch = '') {
    const resolved = resolveEffect(skill, row?.effectId);
    if (resolved) return isDamageEffect(resolved) ? resolved : null;
    const declared = String(row?.effectKind || row?.effectType || '');
    if (declared && !/ダメージ|攻撃/.test(declared)) return null;
    // A generated-object branch can describe the target shape/size rather than a
    // separate skill-effect branch. In that case, use the skill's unbranched
    // damage effect as the coefficient source.
    const damageEffects = getDamageEffects(skill, branch);
    if (!damageEffects.length && branch) damageEffects.push(...getDamageEffects(skill));
    if (damageEffects.length <= 1) return damageEffects[0] || null;
    // effectId が未記入の skillmotion でも、構造化された処理順があれば
    // 同一状態中の最終ヒット等を正しい効果行へ対応付ける。中間のヒット数行は
    // 直前のダメージ行を継続するため、指定順以下で最も後ろのダメージを使う。
    const rowOrder = toFiniteNumber(row?.order, 0);
    const ordered = damageEffects.slice().sort((a, b) => (
      toFiniteNumber(a?.processOrder, 0) - toFiniteNumber(b?.processOrder, 0)
    ));
    const matching = ordered.filter(effect => toFiniteNumber(effect?.processOrder, 0) <= rowOrder).at(-1);
    return matching || ordered[0] || null;
  }

  function resolveGeneratedSpawnCount(apostle, skill, generated, skillLevel) {
    const fixedCount = Number(generated?.spawnCount);
    if (Number.isFinite(fixedCount) && fixedCount > 0) return Math.floor(fixedCount);
    const countEffect = resolveApostleEffect(apostle, skill, generated?.spawnCountEffectId);
    const effectCount = resolveEffectValue(countEffect, skillLevel);
    return Number.isFinite(effectCount) && effectCount > 0 ? Math.floor(effectCount) : null;
  }

  function getGeneratedTimedEndFrame(generated, spawnFrame) {
    const timed = normalizeArray(generated?.endConditions).find(condition => (
      /生成後経過時間|持続時間/.test(String(condition?.conditionType || ''))
      && Number.isFinite(Number(condition?.conditionFrames))
    ));
    return timed && spawnFrame != null
      ? spawnFrame + Math.max(0, Number(timed.conditionFrames))
      : null;
  }

  function getGeneratedAttackSpeedSettings(generated) {
    const reference = String(generated?.attackSpeedReference || '');
    const scope = String(generated?.attackSpeedScope || generated?.speedScope || '');
    const changePolicy = String(
      generated?.attackSpeedChangePolicy || generated?.speedChangePolicy || ''
    );
    return {
      reference,
      scope,
      changePolicy,
      ownerAtSpawn: reference.includes('本人') && reference.includes('生成時'),
      repeatInterval: scope.includes('反復周期')
    };
  }

  function buildGeneratedEvents(apostle, skill, actionTiming, warnings, statusDefinitions = [], skillLevel = 1) {
    const events = [];
    normalizeArray(actionTiming?.generatedObjects).forEach(generated => {
      const rows = normalizeArray(generated.timingEvents);
      const attackSpeedSettings = getGeneratedAttackSpeedSettings(generated);
      const baseSpawnFrame = generated.spawnFrame == null ? null : toFiniteNumber(generated.spawnFrame);
      const spawnCount = resolveGeneratedSpawnCount(apostle, skill, generated, skillLevel);
      const explicitOrders = [...new Set(rows
        .filter(row => row.instanceOrder != null && row.instanceOrder !== '')
        .map(row => Number(row.instanceOrder))
        .filter(order => Number.isFinite(order) && order > 0))]
        .sort((a, b) => a - b);
      const instanceOrders = explicitOrders.length
        ? explicitOrders.filter(order => spawnCount == null || order <= spawnCount)
        : Array.from({ length: Math.max(1, spawnCount || 1) }, (_, index) => index + 1);
      const hasExplicitSpawn = rows.some(row => row.eventType === '生成');
      if (normalizeArray(generated?.endConditions).some(condition => (
        /被ダメージ回数/.test(String(condition?.conditionType || ''))
      ))) {
        warnings.push(`${generated.id || generated.name}: 被ダメージ回数による終了は未評価のため、時間終了条件を使用します`);
      }

      instanceOrders.forEach(instanceOrder => {
        const instanceRows = rows.filter(row => (
          row.instanceOrder == null || Number(row.instanceOrder) === instanceOrder
        ));
        const spawnRow = instanceRows.find(row => (
          row.eventType === '生成' && Number(row.instanceOrder) === instanceOrder
        ));
        let spawnFrame = baseSpawnFrame;
        if (spawnRow?.frame != null) {
          if (spawnRow.timeOrigin === '生成時') {
            if (baseSpawnFrame == null) {
              warnings.push(`${generated.id || generated.name}: 生成時基準ですが生成発生値が未調査です`);
            } else {
              spawnFrame = baseSpawnFrame + toFiniteNumber(spawnRow.frame);
            }
          } else {
            spawnFrame = toFiniteNumber(spawnRow.frame);
          }
        }
        if (spawnFrame == null) {
          warnings.push(`${generated.id || generated.name}: 個体${instanceOrder}の生成時刻が未調査です`);
          return;
        }
        const endFrame = getGeneratedTimedEndFrame(generated, spawnFrame);
        const generatedInstanceKey = `${generated.id || generated.name || 'generated'}:${instanceOrder}`;

        if (!hasExplicitSpawn) {
          events.push({
            frame: spawnFrame,
            eventOrder: 0,
            type: 'generatedEffect',
            effectId: '',
            effectType: '生成',
            hitCount: 0,
            coefficientShare: null,
            independentDamage: false,
            persistent: true,
            branch: generated.branch || '',
            generatedObjectId: generated.id || '',
            generatedObjectName: generated.name || '',
            generatedInstanceOrder: instanceOrder,
            generatedInstanceKey,
            generatedEventType: '生成',
            respawnPolicy: generated.respawnPolicy || '',
            generatedAttackSpeedReference: attackSpeedSettings.reference,
            generatedAttackSpeedScope: attackSpeedSettings.scope,
            generatedAttackSpeedChangePolicy: attackSpeedSettings.changePolicy,
            generatedUsesOwnerAttackSpeedAtSpawn: attackSpeedSettings.ownerAtSpawn,
            generatedAttackSpeedAffectsRepeatInterval: attackSpeedSettings.repeatInterval,
            timingQuality: /済|完了/.test(String(generated.researchStatus || '')) ? 'measured' : 'provisional',
            note: generated.note || ''
          });
        }

        instanceRows.forEach((row, rowIndex) => {
          if (row.frame == null) return;
          let eventFrame;
          if (row.timeOrigin === '生成時') eventFrame = spawnFrame + toFiniteNumber(row.frame);
          else if (row.timeOrigin === '終了時') {
            if (endFrame == null) {
              warnings.push(`${generated.id || generated.name}: 終了時基準ですが時間終了条件がありません`);
              return;
            }
            eventFrame = endFrame + toFiniteNumber(row.frame);
          } else eventFrame = toFiniteNumber(row.frame);

          // Generated objects may deliberately reuse an effect owned by another
          // skill (for example, a high-grade skill spawning the low-grade clone).
          // Preserve that exact effect before falling back to the current action.
          const effect = resolveApostleEffect(apostle, skill, row.effectId)
            || resolveRowDamageEffect(skill, row, row.branch || '');
          const statusApplication = statusDefinitions.find(item => item.applicationEffectId === row.effectId) || null;
          const damage = (!!effect && isDamageEffect(effect))
            || /ダメージ|攻撃/.test(String(row.effectKind || ''));
          if (row.effectId && !resolveApostleEffect(apostle, skill, row.effectId)) {
            warnings.push(`effectIdを解決できません: ${row.effectId}`);
          }
          const repeatInterval = row.repeatTarget === true
            ? Math.max(0, toFiniteNumber(generated.repeatIntervalFrames))
            : 0;
          let repeatCount = 1;
          if (repeatInterval > 0) {
            if (endFrame != null) {
              repeatCount = Math.max(0, Math.ceil((endFrame - eventFrame) / repeatInterval));
            } else if (Number(generated.repeatCount) > 0) {
              repeatCount = Math.max(1, Math.floor(Number(generated.repeatCount)));
            } else {
              warnings.push(`${generated.id || generated.name}: 反復対象ですが終了条件または繰り返し回数がありません`);
            }
          }
          const repeatSeriesKey = repeatInterval > 0
            ? `${generatedInstanceKey}:${rowIndex}:${row.effectId || row.effectKind || row.eventType || 'repeat'}`
            : '';
          for (let repeat = 0; repeat < repeatCount; repeat += 1) {
            const repeatedFrame = eventFrame + repeatInterval * repeat;
            if (endFrame != null && row.timeOrigin !== '終了時' && repeatedFrame >= endFrame) break;
            events.push({
              frame: repeatedFrame,
              eventOrder: row.order == null ? 1000 + rowIndex : Number(row.order),
              type: damage ? 'damage' : 'generatedEffect',
              effectId: row.effectId || effect?.effectId || '',
              effectType: effect?.effectType || row.effectKind || '',
              effectValueKind: effect?.valueKind || row.effectKind || '',
              hitCount: damage ? 1 : 0,
              lv1PerHitMultiplier: row.lv1PerHitMultiplier ?? null,
              coefficientShare: getCoefficientShare(effect, row.lv1PerHitMultiplier),
              independentDamage: damage,
              persistent: generated.cancelPolicy !== '消滅',
              branch: row.branch || generated.branch || '',
              generatedObjectId: generated.id || '',
              generatedObjectName: generated.name || '',
              generatedInstanceOrder: instanceOrder,
              generatedInstanceKey,
              generatedEventType: row.eventType || '',
              generatedEndFrame: endFrame,
              respawnPolicy: generated.respawnPolicy || '',
              generatedAttackSpeedReference: attackSpeedSettings.reference,
              generatedAttackSpeedScope: attackSpeedSettings.scope,
              generatedAttackSpeedChangePolicy: attackSpeedSettings.changePolicy,
              generatedUsesOwnerAttackSpeedAtSpawn: attackSpeedSettings.ownerAtSpawn,
              generatedAttackSpeedAffectsRepeatInterval: attackSpeedSettings.repeatInterval,
              generatedRepeatSeriesKey: repeatSeriesKey,
              generatedRepeatIndex: repeat,
              generatedRepeatAnchorFrame: eventFrame,
              generatedRepeatIntervalFrames: repeatInterval,
              generatedRepeatCount: repeatCount,
              statusApplication,
              timingQuality: /済|完了/.test(String(row.researchStatus || '')) ? 'measured' : 'provisional',
              note: row.note || generated.note || ''
            });
          }
        });
      });
    });
    return events.sort((a, b) => (
      a.frame - b.frame
      || toFiniteNumber(a.eventOrder, 1000) - toFiniteNumber(b.eventOrder, 1000)
      || toFiniteNumber(a.generatedInstanceOrder) - toFiniteNumber(b.generatedInstanceOrder)
    ));
  }

  function buildVariantEvents(apostle, skill, actionTiming, actionKey, branch, motionFrames, warnings, suppressDamageFallback = false, statusDefinitions = [], runtimeResources = [], skillLevel = 1, exactBranch = false, timingContext = {}, branchComposition = 'replacement') {
    const includeCommonRows = !exactBranch || branchComposition === 'additive';
    const selectedResourceBranch = runtimeResources.map(resource => {
      const match = String(branch || '').match(new RegExp(`^${resource.name}(\\d+)$`));
      return match ? { resource, count: Number(match[1]) } : null;
    }).find(Boolean);
    const hasActiveTimingPattern = normalizeArray(actionTiming?.timingPatterns)
      .some(pattern => pattern?.adoption !== '検証');
    const selectedRows = normalizeArray(actionTiming?.timingEvents).filter(row => {
      if (hasActiveTimingPattern && row?.adoption === '検証') return false;
      const rowBranch = row.branch || '';
      if ((includeCommonRows && (rowBranch === '' || rowBranch === '共通')) || rowBranch === branch) return true;
      if (!selectedResourceBranch) return false;
      const match = String(rowBranch).match(new RegExp(`^${selectedResourceBranch.resource.name}(\\d+)$`));
      return !!match && Number(match[1]) <= selectedResourceBranch.count;
    });
    selectedRows.push(...expandTimingPatterns(
      actionTiming,
      skill,
      actionKey,
      branch,
      skillLevel,
      timingContext,
      warnings,
      includeCommonRows
    ));
    const seenRows = new Set();
    const rows = selectedRows.filter(row => {
      // Resource branches are cumulative snapshots (魔弾2 contains shot 1 and 2, etc.).
      // Notes may differ between otherwise identical inherited rows, so they must not
      // prevent de-duplication when lower branches are merged.
      const keyParts = [row.frame, row.effectKind, row.effectId, row.lv1PerHitMultiplier];
      if (!selectedResourceBranch) keyParts.push(row.note);
      const key = keyParts.join('\u0001');
      if (seenRows.has(key)) return false;
      seenRows.add(key);
      return true;
    });
    const damageEffects = getDamageEffects(skill, branch);
    const totalHitCount = getTotalHitCount(skill, branch);
    const events = [];
    let observedDamageHits = 0;

    if (damageEffects.length > 1 && !rows.some(row => row.effectId)) {
      warnings.push(`${skill?.skillId || skill?.skillType}: 複数ダメージ効果のヒット配分が未調査です`);
    }

    rows.forEach((row, rowIndex) => {
      const declared = String(row.effectKind || '');
      const sourceEffect = resolveApostleEffect(apostle, skill, row.effectId);
      // 置換後スキルは元スキルの発生フレームを流用しても、倍率・effectIdは
      // 置換後のものを使う。旧effectIdから旧倍率を引き直してはいけない。
      const replacementDamageEffect = skill?.dpsReplacesBase
        && (isDeclaredDamageKind(declared) || isDamageEffect(sourceEffect))
        ? resolveRowDamageEffect(skill, row, branch)
        : null;
      const effect = replacementDamageEffect || sourceEffect;
      const damage = effect
        ? isDamageEffect(effect)
        : isDeclaredDamageKind(declared) || (!declared && damageEffects.length > 0);
      const damageEffect = damage ? (effect || resolveRowDamageEffect(skill, row, branch)) : null;
      const statusApplication = statusDefinitions.find(item => item.applicationEffectId === row.effectId) || null;
      const resourceChange = getResourceChange(effect, declared, branch, runtimeResources, skillLevel);
      const repeatDamageCount = 1;
      const eventHitCount = damage
        ? Math.max(1, Math.floor(toFiniteNumber(row.hitCount, repeatDamageCount)))
        : 0;
      if (row.effectId && !effect) warnings.push(`effectIdを解決できません: ${row.effectId}`);
      if (row.frame == null) {
        if (!damage && effect) {
          events.push({
            frame: motionFrames,
            eventOrder: 1000,
            type: 'effect',
            effectId: effect.effectId || '',
            effectType: effect.effectType || '',
            effectValueKind: effect.valueKind || declared,
            timingQuality: 'fallbackEnd',
            statusApplication,
            note: row.note || ''
          });
        }
        return;
      }
      events.push({
        frame: toFiniteNumber(row.frame),
        eventOrder: row.order == null ? 1000 + rowIndex : Number(row.order),
        type: damage ? 'damage' : 'effect',
        effectId: damageEffect?.effectId || row.effectId || (damage ? damageEffects[0]?.effectId : '') || '',
        effectType: effect?.effectType || (damage ? '攻撃' : ''),
        effectValueKind: effect?.valueKind || declared,
        hitCount: eventHitCount,
        repeatDamageCount,
        lv1PerHitMultiplier: row.lv1PerHitMultiplier ?? null,
        coefficientShare: getCoefficientShare(damageEffect, row.lv1PerHitMultiplier),
        statusApplication,
        resourceChange,
        timingQuality: getTimingQualityFromResearchStatus(row.researchStatus, 'measured'),
        note: row.note || ''
      });
      if (damage) observedDamageHits += eventHitCount;
    });

    const researchStatuses = new Set(rows.map(row => row.researchStatus).filter(Boolean));
    const complete = researchStatuses.size > 0 && [...researchStatuses].every(status => status === '済' || status === '完了');
    if (!suppressDamageFallback && totalHitCount > observedDamageHits) {
      if (complete && observedDamageHits > 0) {
        warnings.push(`${skill?.skillId || skill?.skillType}: 調査済ですがヒット数が不足しています (${observedDamageHits}/${totalHitCount})`);
      }
      events.push({
        frame: motionFrames,
        eventOrder: 1000,
        type: 'damage',
        effectId: damageEffects[0]?.effectId || '',
        effectType: '攻撃',
        hitCount: totalHitCount - observedDamageHits,
        lv1PerHitMultiplier: null,
        timingQuality: 'fallbackEnd',
        note: observedDamageHits ? `未調査${totalHitCount - observedDamageHits}ヒット` : '発生F未調査'
      });
    }

    statusDefinitions.filter(item => item.branch === branch).forEach(statusApplication => {
      if (events.some(event => event.statusApplication?.applicationEffectId === statusApplication.applicationEffectId)) return;
      events.push({
        frame: motionFrames,
        eventOrder: 1000,
        type: 'effect',
        effectId: statusApplication.applicationEffectId,
        effectType: 'デバフ',
        hitCount: 0,
        statusApplication,
        timingQuality: 'fallbackEnd',
        note: `${statusApplication.status}付与F未調査`
      });
      warnings.push(`${skill?.skillId || skill?.skillType}: ${statusApplication.status}をモーション終了時付与として補完します`);
    });

    const sortedEvents = events.sort((a, b) => (
      a.frame - b.frame
      || toFiniteNumber(a.eventOrder, 1000) - toFiniteNumber(b.eventOrder, 1000)
    ));
    const damageEvents = sortedEvents.filter(event => event.type === 'damage' && event.hitCount > 0);
    if (damageEvents.length) damageEvents[damageEvents.length - 1].isFinalHit = true;
    return sortedEvents;
  }

  function resolveEnemySizeRank(enemySize = '', enemySizeRank = 0) {
    const explicitRank = Math.round(toFiniteNumber(enemySizeRank));
    if (explicitRank >= 1 && explicitRank <= 5) return explicitRank;
    return ENEMY_SIZE_RANKS[String(enemySize || '')] || 0;
  }

  function selectEnemySizeVariantBranch(branches = [], enemySize = '', enemySizeRank = 0) {
    const candidates = normalizeArray(branches)
      .map(branch => ({ branch: String(branch || ''), rank: ENEMY_SIZE_BRANCH_RANKS[String(branch || '')] || 0 }))
      .filter(item => item.rank > 0);
    if (!candidates.length) return '';
    const requestedRank = resolveEnemySizeRank(enemySize, enemySizeRank) || 3;
    return candidates.slice().sort((a, b) => (
      Math.abs(a.rank - requestedRank) - Math.abs(b.rank - requestedRank)
      || a.rank - b.rank
    ))[0].branch;
  }

  function buildAction(apostle, timing, actionKey, warnings, buildOptions = {}) {
    const actionTiming = timing?.actions?.[actionKey];
    const baseSkill = findSkill(apostle, actionKey);
    const skill = findSkill(apostle, actionKey, buildOptions.skillOverrides);
    if (!actionTiming || !skill) return null;
    const motionVariants = normalizeArray(actionTiming.motionVariants).filter(item => item?.gameFrames != null);
    if (actionTiming.motionFrames == null && !motionVariants.length) return null;
    const motionFrames = Math.max(0, toFiniteNumber(
      actionTiming.motionFrames,
      motionVariants[0]?.gameFrames
    ));
    const hasRepeatCount = normalizeArray(skill.effects).some(effect => effect?.valueKind === '繰り返し回数');
    const hasHitCount = normalizeArray(skill.effects).some(effect => effect?.effectType === '攻撃' && effect?.valueClass === 'ヒット数');
    if (hasRepeatCount && !hasHitCount) {
      warnings.push(`${skill.skillId || skill.skillType}: 繰り返し回数を総ヒット数へ変換する規則が未確定です`);
    }
    const statusDefinitions = buildStatusDefinitions(skill, actionKey, buildOptions.skillLevels, warnings);
    const generatedStatusDefinitions = buildGeneratedStatusDefinitions(
      apostle,
      actionTiming,
      buildOptions.skillLevels,
      warnings
    );
    const runtimeResources = normalizeArray(buildOptions.runtimeResources);
    const skillLevel = getActionSkillLevel(buildOptions.skillLevels, actionKey);
    const generatedEvents = buildGeneratedEvents(
      apostle,
      skill,
      actionTiming,
      warnings,
      [...statusDefinitions, ...generatedStatusDefinitions],
      skillLevel
    );
    const hasGeneratedDamage = generatedEvents.some(event => event.type === 'damage');
    const motionBranches = motionVariants.map(item => item.branch || '').filter(Boolean);
    const timingBranches = normalizeArray(actionTiming.timingEvents)
      .map(row => row.branch || '')
      .filter(branch => branch && branch !== '共通');
    const timingPatternBranches = normalizeArray(actionTiming.timingPatterns)
      .map(pattern => pattern.branch || '')
      .filter(branch => branch && branch !== '共通');
    const generatedBranches = generatedEvents
      .map(event => event.branch || '')
      .filter(branch => branch && branch !== '共通');
    const branchSource = motionBranches.length
      ? motionBranches
      : (timingBranches.length ? timingBranches : (timingPatternBranches.length ? timingPatternBranches : generatedBranches));
    const preferredBranch = buildOptions.timingBranches?.[actionKey]
      ?? skill?.dpsTimingBranch;
    const availableBranchSource = [...new Set(branchSource)].filter(branch => {
      const asideRank = getTimingAsideBranchRank(branch);
      return !asideRank || asideRank <= Math.max(0, Math.floor(toFiniteNumber(buildOptions.asideRank)));
    });
    const activeAsideBranches = availableBranchSource
      .filter(branch => getTimingAsideBranchRank(branch) > 0)
      .sort((a, b) => getTimingAsideBranchRank(b) - getTimingAsideBranchRank(a));
    const nonAsideBranches = availableBranchSource.filter(branch => getTimingAsideBranchRank(branch) === 0);
    const resolvedBranchSource = activeAsideBranches.length
      ? [...nonAsideBranches, activeAsideBranches[0]]
      : nonAsideBranches;
    const branches = preferredBranch != null && (
      !timingBranches.length || timingBranches.includes(preferredBranch) || preferredBranch === ''
    )
      ? [preferredBranch]
      : resolvedBranchSource;
    if (!branches.length) branches.push('');
    // 固有状態で基本攻撃のモーション自体が置き換わるケースは、通常の
    // skillmotion 分岐とは異なりランダム候補ではない。分岐名と同じ状態中
    // 条件を持つ効果行から状態IDを解決し、実行時にのみその分岐を選択する。
    const selfStateVariantChoices = branches.flatMap(branch => {
      const stateIds = getTimingBranchStateIds(skill, branch);
      return stateIds.length === 1 ? [{ branch, stateId: stateIds[0] }] : [];
    });
    const selfStateVariantBranches = new Set(selfStateVariantChoices.map(choice => choice.branch));
    const motionFramesByVariant = {};
    motionVariants.forEach(item => {
      motionFramesByVariant[item.branch || 'default'] = Math.max(0, toFiniteNumber(item.gameFrames));
    });
    const timingContext = {
      artifactCount: buildOptions.artifactCount,
      skillCountModifiers: buildOptions.skillCountModifiers
    };
    // 追加攻撃回数によって基礎モーションの調査値を超える場合がある。
    // その場合も最終ヒットまで行動中として扱い、末尾のヒットを
    // actionEnd で切り捨てない。生成物の周期攻撃は別シートで管理するため、
    // ここではスキルタイミングのパターンだけを対象にする。
    branches.forEach(branch => {
      const branchComposition = resolveTimingBranchMode(buildOptions, actionKey, branch);
      const exactBranch = (preferredBranch != null
        && preferredBranch !== ''
        && branch === preferredBranch
        && branchComposition !== 'additive')
        || (selfStateVariantBranches.has(branch) && branchComposition !== 'additive');
      const variantKey = branch || 'default';
      const baseFrames = motionFramesByVariant[variantKey] ?? motionFrames;
      const patternRows = expandTimingPatterns(
        actionTiming,
        skill,
        actionKey,
        branch,
        skillLevel,
        timingContext,
        warnings,
        !exactBranch || branchComposition === 'additive'
      );
      const lastPatternFrame = patternRows.reduce((max, row) => (
        Math.max(max, toFiniteNumber(row.frame))
      ), 0);
      motionFramesByVariant[variantKey] = Math.max(baseFrames, lastPatternFrame);
    });
    const variants = {};
    branches.forEach(branch => {
      const branchComposition = resolveTimingBranchMode(buildOptions, actionKey, branch);
      const exactBranch = (preferredBranch != null
        && preferredBranch !== ''
        && branch === preferredBranch
        && branchComposition !== 'additive')
        || (selfStateVariantBranches.has(branch) && branchComposition !== 'additive');
      const variantMotionFrames = motionFramesByVariant[branch || 'default'] ?? motionFrames;
      variants[branch || 'default'] = buildVariantEvents(
        apostle,
        skill,
        actionTiming,
        actionKey,
        branch,
        variantMotionFrames,
        warnings,
        hasGeneratedDamage,
        statusDefinitions,
        runtimeResources,
        skillLevel,
        exactBranch,
        timingContext,
        branchComposition
      );
    });
    const exclusiveDamageCandidates = normalizeArray(skill?.dpsExclusiveDamageCandidates)
      .filter(candidate => candidate?.effectId && toFiniteNumber(candidate?.weight) > 0);
    const exclusiveCandidateWeight = exclusiveDamageCandidates.reduce((total, candidate) => (
      total + toFiniteNumber(candidate.weight)
    ), 0);
    let actionVariantNames = branches.filter(Boolean);
    const variantLabels = {};
    let exclusiveVariantSelection = null;
    // Keep timing branches and probability choices separate.  Named timing
    // branches can need a cross-product that the datasheet does not currently
    // describe, so only apply the generic replacement form to an unbranched
    // action and surface an explicit warning otherwise.
    if (exclusiveDamageCandidates.length > 1 && Math.abs(exclusiveCandidateWeight - 100) < 0.0001) {
      if (branches.length !== 1 || branches[0] !== '') {
        warnings.push(`${skill.skillId || skill.skillType}: 確率置換とタイミング分岐の組み合わせは未対応です`);
      } else {
        const candidateIds = new Set(exclusiveDamageCandidates.map(candidate => candidate.effectId));
        const choices = exclusiveDamageCandidates.map((candidate, index) => {
          const variant = `__exclusive:${candidate.effectId}`;
          const candidateEffect = normalizeArray(skill.effects).find(effect => (
            String(effect?.effectId || '') === candidate.effectId
          ));
          variantLabels[variant] = getTimingVariantLabel(candidateEffect, `確率分岐${index + 1}`);
          const candidateSkill = {
            ...skill,
            effects: normalizeArray(skill.effects).filter(effect => (
              !candidateIds.has(String(effect?.effectId || ''))
              || String(effect?.effectId || '') === candidate.effectId
            ))
          };
          variants[variant] = buildVariantEvents(
            apostle,
            candidateSkill,
            actionTiming,
            actionKey,
            '',
            motionFrames,
            warnings,
            hasGeneratedDamage,
            statusDefinitions,
            runtimeResources,
            skillLevel,
            false,
            timingContext
          );
          motionFramesByVariant[variant] = motionFrames;
          return { branch: variant, weight: toFiniteNumber(candidate.weight) };
        });
        actionVariantNames = choices.map(choice => choice.branch);
        exclusiveVariantSelection = { type: 'weighted', choices };
      }
    }
    const resourceVariant = runtimeResources.map(resource => {
      const choices = branches.map(branch => {
        const match = String(branch).match(new RegExp(`^${resource.name}(\\d+)$`));
        return match ? { branch, stacks: Number(match[1]) } : null;
      }).filter(Boolean);
      if (!choices.length || choices.length !== branches.length) return null;
      const commonGain = normalizeArray(variants[choices[0].branch])
        .filter(event => event.resourceChange?.resourceId === resource.id && event.resourceChange.operation === 'gain')
        .reduce((total, event) => total + toFiniteNumber(event.resourceChange.amount), 0);
      return { resourceId: resource.id, choices, predictedGain: commonGain };
    }).find(Boolean);
    // 愛用品の行動書き換えは対象行動の効果だけを持つため、書き換え元の
    // 強化条件（例: 呪い状態の敵が存在）は基本スキルから引き継ぐ。
    const triggerType = actionKey === 'enhancedAttack'
      ? String(skill.triggerType || baseSkill?.triggerType || '')
      : '';
    const triggerValue = actionKey === 'enhancedAttack'
      ? Math.max(0, toFiniteNumber(skill.triggerValue ?? baseSkill?.triggerValue))
      : 0;
    const triggerStatus = actionKey === 'enhancedAttack'
      ? getEnhancedStatusPresenceTrigger(triggerType)
      : '';
    if (actionKey === 'enhancedAttack' && triggerType && !/^一定確率/.test(triggerType)
      && triggerType !== 'n回ごと' && !triggerStatus) {
      warnings.push(`${skill.skillId || skill.skillType}: 強化攻撃条件「${triggerType}」の時系列自動判定は未実装です`);
    }
    const enemySizeBranch = selectEnemySizeVariantBranch(
      branches,
      buildOptions.enemySize,
      buildOptions.enemySizeRank
    );
    const requestedEnemySizeRank = resolveEnemySizeRank(buildOptions.enemySize, buildOptions.enemySizeRank);
    if (enemySizeBranch && requestedEnemySizeRank > 0
      && ENEMY_SIZE_BRANCH_RANKS[enemySizeBranch] !== requestedEnemySizeRank) {
      warnings.push(`${skill.skillId || skill.skillType}: 敵サイズの調査分岐がないため「${enemySizeBranch}」で近似します`);
    }
    const requestedArtifactCount = actionKey === 'lowSkill' && Number.isFinite(Number(buildOptions.artifactCount))
      ? Math.max(0, Math.floor(Number(buildOptions.artifactCount)))
      : null;
    const artifactBranch = requestedArtifactCount == null
      ? ''
      : branches
        .map(branch => ({
          branch,
          count: Number(String(branch).match(/^遺物装備(\d+)$/)?.[1])
        }))
        .filter(item => Number.isFinite(item.count))
        .sort((a, b) => (
          Math.abs(a.count - requestedArtifactCount) - Math.abs(b.count - requestedArtifactCount)
        ))[0]?.branch || '';
    const fixedBranch = preferredBranch != null && preferredBranch !== ''
      ? preferredBranch
      : artifactBranch;
    const blockedBySelfStateIds = actionKey === 'enhancedAttack'
      ? [...new Set(normalizeArray(skill.effects)
        .filter(effect => String(effect?.conditionType || '') === '固有状態外')
        .map(effect => String(effect?.conditionValue || '').trim())
        .filter(Boolean))]
      : [];
    return {
      key: actionKey,
      label: skill?.dpsActionName
        ? `${ACTION_LABELS[actionKey]}（${skill.dpsActionName}）`
        : ACTION_LABELS[actionKey],
      skillId: skill.skillId || '',
      motionFrames,
      motionFramesByVariant,
      variants,
      generatedEvents,
      statusDefinitions,
      variantNames: actionVariantNames,
      variantLabels,
      variantSelection: exclusiveVariantSelection || (selfStateVariantChoices.length
        ? {
            type: 'selfState',
            choices: selfStateVariantChoices,
            fallbackBranch: branches.includes('') ? 'default' : (actionVariantNames[0] || 'default')
          }
        : (resourceVariant
        ? { type: 'resourceAfterGain', ...resourceVariant }
        : (generatedBranches.length
          ? {
              type: 'fixed',
              branch: enemySizeBranch || (branches.includes('中型敵') ? '中型敵' : branches[0])
            }
          : (fixedBranch ? { type: 'fixed', branch: fixedBranch } : { type: 'random' })))),
      triggerType,
      triggerValue,
      triggerStatus,
      blockedBySelfStateIds,
      triggerProbability: /^一定確率/.test(triggerType) ? Math.min(100, triggerValue) : 0,
      triggerEveryCount: triggerType === 'n回ごと' ? Math.max(1, Math.floor(triggerValue || 1)) : 0,
      transitionFrames: actionKey === 'lowSkill' || actionKey === 'highSkill' ? 2 : 0,
      requiredSp: actionKey === 'lowSkill' ? Math.max(1, toFiniteNumber(skill.requiredSp, 300)) : 0,
      cooldownSeconds: actionKey === 'highSkill' ? Math.max(0, toFiniteNumber(skill.cooldownSeconds)) : 0
    };
  }

  function buildCombatantConfig(apostle, timing, buildOptions = {}) {
    const warnings = normalizeArray(buildOptions.runtimeEffects?.warnings).map(String).filter(Boolean);
    const scenario = buildOptions.scenario && typeof buildOptions.scenario === 'object'
      ? buildOptions.scenario
      : null;
    const scenarioSelfId = String(scenario?.actors?.self?.id || scenario?.characterState?.targetId || '');
    if (scenarioSelfId && apostle?.id
      && normalizeScenarioId(scenarioSelfId) !== normalizeScenarioId(apostle.id)) {
      warnings.push(`共通シナリオの対象使徒(${scenarioSelfId})とDPSデータ(${apostle.id})が一致しません`);
    }
    const scenarioEnemySize = String(
      scenario?.battleConditions?.enemySize
      || scenario?.actors?.enemy?.size
      || ''
    );
    const scenarioEnemySizeRank = Number(
      scenario?.battleConditions?.enemySizeRank
      || scenario?.actors?.enemy?.sizeRank
      || 0
    );
    const resolvedBuildOptions = {
      ...buildOptions,
      enemySize: buildOptions.enemySize || scenarioEnemySize,
      enemySizeRank: buildOptions.enemySizeRank || scenarioEnemySizeRank
    };
    const enemyCount = Math.max(1, Math.floor(toFiniteNumber(
      buildOptions.enemyCount ?? scenario?.battleConditions?.enemyCount,
      1
    )));
    const scenarioArtifactCount = getScenarioArtifactCount(scenario, apostle?.id);
    const artifactCount = Number.isFinite(Number(buildOptions.artifactCount))
      ? Math.max(0, Math.floor(Number(buildOptions.artifactCount)))
      : scenarioArtifactCount;
    // DPSの一時設定・保存スロットから渡された値は、シナリオに残っている
    // 管理側の値より優先する。シナリオがA2のままでも、画面で「なし」を
    // 選んだ場合にA2の追加攻撃回数を混ぜない。
    const hasExplicitAsideRank = Object.prototype.hasOwnProperty.call(buildOptions, 'asideRank')
      || Object.prototype.hasOwnProperty.call(buildOptions.skillLevels || {}, 'asideRank');
    const explicitAsideRank = buildOptions.asideRank ?? buildOptions.skillLevels?.asideRank;
    const asideRank = hasExplicitAsideRank
      ? Math.max(0, Math.min(3, Math.floor(toFiniteNumber(explicitAsideRank))))
      : getScenarioAsideRank(scenario, apostle?.id, buildOptions.asideRank);
    const skillCountModifiers = [
      ...buildSkillCountModifiers(apostle, asideRank, buildOptions.skillLevels),
      ...normalizeArray(buildOptions.runtimeEffects?.skillCountModifiers)
    ];
    resolvedBuildOptions.artifactCount = artifactCount;
    resolvedBuildOptions.asideRank = asideRank;
    resolvedBuildOptions.skillCountModifiers = skillCountModifiers;
    const runtimeResourceMap = new Map(buildRuntimeResources(apostle, buildOptions.skillLevels)
      .map(resource => [resource.id, resource]));
    normalizeArray(buildOptions.runtimeEffects?.resources).forEach(resource => {
      if (!resource?.id) return;
      const current = runtimeResourceMap.get(String(resource.id)) || {
        id: String(resource.id),
        name: String(resource.name || resource.id),
        initialStacks: 0,
        maxStacks: 1
      };
      current.initialStacks = Math.max(0, toFiniteNumber(resource.initialStacks, current.initialStacks));
      current.maxStacks = Math.max(1, toFiniteNumber(resource.maxStacks, current.maxStacks));
      runtimeResourceMap.set(current.id, current);
    });
    const runtimeResources = Array.from(runtimeResourceMap.values());
    const intervalValues = [...new Set(normalizeArray(timing?.normalAttackIntervalVariants)
      .map(item => Number(item?.gameFrames))
      .filter(Number.isFinite))];
    if (intervalValues.length > 1) {
      warnings.push(`${timing?.name || apostle?.name || '使徒'}: 分岐別の普通攻撃間隔は現在、基準値で計算します`);
    }
    const actions = {};
    Object.keys(ACTION_SKILL_TYPES).forEach(actionKey => {
      const action = buildAction(apostle, timing, actionKey, warnings, {
        ...resolvedBuildOptions,
        runtimeResources
      });
      if (action) actions[actionKey] = action;
    });
    const timingEffectIds = new Set();
    Object.values(actions).forEach(action => {
      Object.values(action.variants || {}).forEach(events => {
        normalizeArray(events).forEach(event => {
          if (event?.effectId) timingEffectIds.add(String(event.effectId));
        });
      });
      normalizeArray(action.generatedEvents).forEach(event => {
        if (event?.effectId) timingEffectIds.add(String(event.effectId));
      });
    });
    const resolveSourceEventMode = (effect, sourceMode, fallbackMode) => {
      const mode = String(effect?.mode || fallbackMode);
      if (mode !== sourceMode) return mode;
      const triggerSourceId = String(effect?.triggerSourceId || '');
      if (triggerSourceId && timingEffectIds.has(triggerSourceId)) return mode;
      const resolvedFallbackMode = String(effect?.sourceEventFallbackMode || fallbackMode);
      warnings.push(resolvedFallbackMode === 'disabled'
        ? `${effect?.label || effect?.id || '効果'}: 発動元 ${triggerSourceId || '(未設定)'} の発生タイミングがないためDPSでは発動させません`
        : `${effect?.label || effect?.id || '効果'}: 発動元 ${triggerSourceId || '(未設定)'} の発生タイミングがないため行動単位で近似します`);
      return resolvedFallbackMode;
    };
    const legacyPeriodicAttackSpeed = normalizeArray(buildOptions.runtimeEffects?.periodicAttackSpeedStacks)
      .map(effect => ({
        id: String(effect?.id || ''),
        sourceId: String(effect?.sourceId || ''),
        label: String(effect?.label || effect?.id || '攻撃速度効果'),
        mode: 'periodicStack',
        intervalFrames: Math.max(1, toFiniteNumber(effect?.intervalFrames, 60)),
        hasteP: toFiniteNumber(effect?.hastePerStackP),
        maxStacks: Math.max(0, Math.floor(toFiniteNumber(effect?.maxStacks))),
        resetActionKeys: normalizeArray(effect?.resetActionKeys).map(String)
      }))
      .filter(effect => effect.id && effect.hasteP);
    const attackSpeedEffects = [
      ...normalizeArray(buildOptions.runtimeEffects?.attackSpeedEffects),
      ...legacyPeriodicAttackSpeed
    ].map((effect, index) => ({
      id: String(effect?.id || `attackSpeed:${index}`),
      sourceId: String(effect?.sourceId || ''),
      externalSourceId: String(effect?.externalSourceId || ''),
      externalTriggerType: String(effect?.externalTriggerType || ''),
      label: String(effect?.label || effect?.id || '攻撃速度効果'),
      mode: resolveSourceEventMode(effect, 'sourceEventTimed', 'actionTimed'),
      triggerSourceId: String(effect?.triggerSourceId || ''),
      hasteP: toFiniteNumber(effect?.hasteP ?? effect?.hastePerStackP),
      durationFrames: Math.max(0, toFiniteNumber(effect?.durationFrames)),
      intervalFrames: Math.max(0, toFiniteNumber(effect?.intervalFrames)),
      triggerEveryCount: Math.max(0, Math.floor(toFiniteNumber(effect?.triggerEveryCount))),
      triggerActionKeys: normalizeArray(effect?.triggerActionKeys).map(String),
      triggerPhase: effect?.triggerPhase === 'end' ? 'end' : 'start',
      maxStacks: Math.max(0, Math.floor(toFiniteNumber(effect?.maxStacks, 1))),
      fixedStacks: Math.max(1, Math.floor(toFiniteNumber(effect?.fixedStacks, 1))),
      stackable: !!effect?.stackable,
      resetActionKeys: normalizeArray(effect?.resetActionKeys).map(String),
      sourceEventFallbackMode: String(effect?.sourceEventFallbackMode || 'actionTimed')
    })).filter(effect => effect.id && effect.hasteP);
    const initialAttackSpeedP = attackSpeedEffects.reduce((total, effect) => (
      ['constant', 'initialTimed', 'manualInitialTimed', 'fixed'].includes(effect.mode)
        ? total + effect.hasteP * (effect.mode === 'fixed' ? effect.fixedStacks : 1)
        : total
    ), 0);
    const spRegenEffects = normalizeArray(buildOptions.runtimeEffects?.spRegenEffects).map((effect, index) => ({
      id: String(effect?.id || `spRegen:${index}`),
      sourceId: String(effect?.sourceId || ''),
      externalSourceId: String(effect?.externalSourceId || ''),
      externalTriggerType: String(effect?.externalTriggerType || ''),
      label: String(effect?.label || effect?.id || '毎秒SP回復効果'),
      fixed: toFiniteNumber(effect?.fixed),
      percent: toFiniteNumber(effect?.percent)
    })).filter(effect => effect.fixed || effect.percent);
    const spRecoveryEffects = normalizeArray(buildOptions.runtimeEffects?.spRecoveryEffects).map((effect, index) => ({
      id: String(effect?.id || `spRecovery:${index}`),
      sourceId: String(effect?.sourceId || ''),
      externalSourceId: String(effect?.externalSourceId || ''),
      externalTriggerType: String(effect?.externalTriggerType || ''),
      effectId: String(effect?.effectId || ''),
      label: String(effect?.label || effect?.id || 'SP回復効果'),
      mode: resolveSourceEventMode(effect, 'sourceEvent', 'action'),
      triggerSourceId: String(effect?.triggerSourceId || ''),
      fixed: toFiniteNumber(effect?.fixed),
      percent: toFiniteNumber(effect?.percent),
      fixedMin: toFiniteNumber(effect?.fixedMin, effect?.fixed),
      fixedMax: toFiniteNumber(effect?.fixedMax, effect?.fixed),
      percentMin: toFiniteNumber(effect?.percentMin, effect?.percent),
      percentMax: toFiniteNumber(effect?.percentMax, effect?.percent),
      durationFrames: Math.max(0, toFiniteNumber(effect?.durationFrames)),
      intervalFrames: Math.max(0, toFiniteNumber(effect?.intervalFrames)),
      triggerEveryCount: Math.max(0, Math.floor(toFiniteNumber(effect?.triggerEveryCount))),
      triggerActionKeys: normalizeArray(effect?.triggerActionKeys).map(String),
      triggerPhase: effect?.triggerPhase === 'end' ? 'end' : 'start',
      oncePerAction: !!effect?.oncePerAction,
      random: effect?.randomBound === 'range',
      sourceEventFallbackMode: String(effect?.sourceEventFallbackMode || 'action')
    })).filter(effect => effect.id && (
      effect.fixed || effect.percent || effect.fixedMin || effect.fixedMax || effect.percentMin || effect.percentMax
    ));
    const cooldownEffects = normalizeArray(buildOptions.runtimeEffects?.cooldownEffects).map((effect, index) => ({
      id: String(effect?.id || `cooldown:${index}`),
      sourceId: String(effect?.sourceId || ''),
      label: String(effect?.label || effect?.id || 'クールタイム変更'),
      mode: resolveSourceEventMode(effect, 'sourceEvent', 'action'),
      triggerSourceId: String(effect?.triggerSourceId || ''),
      triggerActionKeys: normalizeArray(effect?.triggerActionKeys).map(String),
      triggerPhase: effect?.triggerPhase === 'end' ? 'end' : 'start',
      triggerEveryCount: Math.max(0, Math.floor(toFiniteNumber(effect?.triggerEveryCount))),
      oncePerAction: !!effect?.oncePerAction,
      targetActionKey: String(effect?.targetActionKey || 'highSkill'),
      operation: ['add', 'subtract', 'set', 'multiply'].includes(effect?.operation)
        ? effect.operation
        : 'subtract',
      amountFrames: Math.max(0, toFiniteNumber(effect?.amountFrames)),
      multiplier: Math.max(0, toFiniteNumber(effect?.multiplier, 1)),
      sourceEventFallbackMode: String(effect?.sourceEventFallbackMode || 'action')
    })).filter(effect => effect.id && (
      effect.operation === 'multiply' ? effect.multiplier !== 1 : effect.amountFrames > 0
    ));
    const baseSpRegenOverride = Number(buildOptions.runtimeEffects?.baseSpRegen);
    const baseSpRegen = Math.max(0, Number.isFinite(baseSpRegenOverride)
      ? baseSpRegenOverride
      : toFiniteNumber(apostle?.basic?.spRecoveryPerSecond));
    const spRegenFixed = spRegenEffects.reduce((total, effect) => total + effect.fixed, 0);
    const spRegenPercent = spRegenEffects.reduce((total, effect) => total + effect.percent, 0);
    const personality = apostle?.basic?.personality || apostle?.personality || '';
    const statusReactions = normalizeArray(buildOptions.runtimeEffects?.statusReactions).map((reaction, index) => ({
      id: String(reaction?.id || `statusReaction:${index}`),
      label: String(reaction?.label || `${reaction?.status || '状態'}反応`),
      status: String(reaction?.status || ''),
      takenDmgP: toFiniteNumber(reaction?.takenDmgP),
      perStack: !!reaction?.perStack,
      maxStacks: Math.max(0, Math.floor(toFiniteNumber(reaction?.maxStacks))),
      attackerPersonality: String(reaction?.attackerPersonality || '')
    })).filter(reaction => reaction.status && reaction.takenDmgP);
    const damageBuffEffects = normalizeArray(buildOptions.runtimeEffects?.damageBuffEffects).map((effect, index) => ({
      id: String(effect?.id || `damageBuff:${index}`),
      sourceId: String(effect?.sourceId || ''),
      externalSourceId: String(effect?.externalSourceId || ''),
      externalTriggerType: String(effect?.externalTriggerType || ''),
      label: String(effect?.label || effect?.id || '時限ダメージバフ'),
      mode: resolveSourceEventMode(effect, 'sourceEventTimed', 'actionTimed'),
      triggerActionKeys: normalizeArray(effect?.triggerActionKeys).map(String),
      triggerPhase: effect?.triggerPhase === 'end' ? 'end' : 'start',
      processGroupId: String(effect?.processGroupId || ''),
      triggerType: String(effect?.triggerType || ''),
      triggerValue: effect?.triggerValue ?? '',
      triggerSourceId: String(effect?.triggerSourceId || ''),
      triggerEveryCount: Math.max(0, Math.floor(toFiniteNumber(effect?.triggerEveryCount))),
      conditionType: String(effect?.conditionType || ''),
      conditionValue: effect?.conditionValue ?? '',
      requiredStatus: String(effect?.requiredStatus || ''),
      requireSelfSource: !!effect?.requireSelfSource,
      durationFrames: Math.max(0, toFiniteNumber(effect?.durationFrames)),
      stackable: !!effect?.stackable,
      maxStacks: Math.max(1, Math.floor(toFiniteNumber(effect?.maxStacks, 1))),
      fixedStacks: Math.max(1, Math.floor(toFiniteNumber(effect?.fixedStacks, 1))),
      oncePerAction: !!effect?.oncePerAction,
      sourceEventFallbackMode: String(effect?.sourceEventFallbackMode || 'actionTimed'),
      modifiers: Object.fromEntries(Object.entries(effect?.modifiers || {})
        .map(([key, value]) => [key, toFiniteNumber(value)])
        .filter(([, value]) => value)),
      baselineModifiersByAction: Object.fromEntries(Object.entries(effect?.baselineModifiersByAction || {})
        .map(([actionKey, modifiers]) => [actionKey, Object.fromEntries(Object.entries(modifiers || {})
          .map(([key, value]) => [key, toFiniteNumber(value)])
          .filter(([, value]) => value))]))
    })).filter(effect => effect.id && Object.keys(effect.modifiers).length);
    const eventEffects = normalizeArray(buildOptions.runtimeEffects?.eventEffects).map((effect, index) => ({
      id: String(effect?.id || `runtimeEvent:${index}`),
      label: String(effect?.label || effect?.id || '時系列効果'),
      triggerType: String(effect?.triggerType || ''),
      triggerValue: effect?.triggerValue ?? '',
      triggerProbability: normalizeRuntimeTriggerProbability(effect),
      triggerSourceId: String(effect?.triggerSourceId || ''),
      triggerSourceIds: Array.from(new Set([
        effect?.triggerSourceId,
        ...normalizeArray(effect?.triggerSourceIds)
      ].map(value => String(value || '').trim()).filter(Boolean))),
      effectIds: Array.from(new Set([
        effect?.effectId,
        ...normalizeArray(effect?.effectIds)
      ].map(value => String(value || '').trim()).filter(Boolean))),
      timingSourceEffectId: String(effect?.timingSourceEffectId || ''),
      triggerActionKeys: normalizeArray(effect?.triggerActionKeys).map(String),
      conditionType: String(effect?.conditionType || ''),
      conditionValue: String(effect?.conditionValue || ''),
      startOnSelfStateId: String(effect?.startOnSelfStateId || ''),
      consumeMaxStacks: !!effect?.consumeMaxStacks,
      intervalFrames: Math.max(0, toFiniteNumber(effect?.intervalFrames)),
      triggerEveryCount: Math.max(0, Math.floor(toFiniteNumber(effect?.triggerEveryCount))),
      oncePerAction: !!effect?.oncePerAction,
      perHitTrigger: !!effect?.perHitTrigger
        || ['各ヒット', '毎ヒット'].includes(String(effect?.triggerValue || '').trim()),
      finalHitOnly: effect?.finalHitOnly === true,
      conditionResource: effect?.conditionResource ? {
        id: String(effect.conditionResource.id || ''),
        min: effect.conditionResource.min == null ? null : toFiniteNumber(effect.conditionResource.min),
        max: effect.conditionResource.max == null ? null : toFiniteNumber(effect.conditionResource.max)
      } : null,
      steps: normalizeArray(effect?.steps).map(step => ({
        ...step,
        type: String(step?.type || ''),
        order: toFiniteNumber(step?.order),
        expectedDamage: Math.max(0, toFiniteNumber(step?.expectedDamage)),
        unclassifiedDamage: !!step?.unclassifiedDamage,
        value: toFiniteNumber(step?.value),
        amount: Math.max(0, toFiniteNumber(step?.amount)),
        application: step?.application ? { ...step.application } : null,
        runtimeBase: step?.runtimeBase ? { ...step.runtimeBase } : null
      })).filter(step => step.type)
    })).filter(effect => effect.id && effect.steps.length);
    if (personality === '冷静' && !statusReactions.some(reaction => reaction.id === 'builtin:frostbite-calm-taken-damage')) {
      statusReactions.push({
        id: 'builtin:frostbite-calm-taken-damage',
        label: '凍傷による冷静被ダメージ増加',
        status: '凍傷',
        takenDmgP: 8,
        perStack: true,
        maxStacks: 0,
        attackerPersonality: '冷静'
      });
    }
    const normalAttackIntervalFrames = Math.max(1, toFiniteNumber(timing?.normalAttackIntervalFrames, 60));
    const movementTransitions = normalizeArray(timing?.movementTransitions).map((transition, index) => ({
      id: String(transition?.id || `movement:${index}`),
      fromActionKey: String(transition?.fromActionKey || ''),
      fromBranch: String(transition?.fromBranch || ''),
      toActionKey: String(transition?.toActionKey || ''),
      toBranch: String(transition?.toBranch || ''),
      frames: Math.max(0, toFiniteNumber(transition?.frames)),
      researchStatus: String(transition?.researchStatus || ''),
      note: String(transition?.note || '')
    })).filter(transition => transition.fromActionKey && transition.toActionKey && transition.frames > 0);
    return {
      apostleId: timing?.id || apostle?.id || '',
      name: timing?.name || apostle?.name || '',
      scenarioFingerprint: String(scenario?.sourceMeta?.fingerprint || ''),
      scenarioTargetId: scenarioSelfId,
      personality,
      initialActionDelayFrames: Math.max(0, toFiniteNumber(timing?.initialActionDelayFrames, 60)),
      normalAttackIntervalFrames,
      initialAttackSpeedP,
      initialNormalAttackIntervalFrames: normalAttackIntervalFrames / (1 + initialAttackSpeedP / 100),
      movementTransitions,
      initialSp: Math.max(0, toFiniteNumber(apostle?.basic?.initialSp)),
      spRegen: Math.max(0, baseSpRegen * (1 + spRegenPercent / 100) + spRegenFixed),
      spRecoveryIntervalFrames: Math.max(1, toFiniteNumber(timing?.spRecoveryIntervalFrames, 60)),
      requiredSp: Math.max(1, actions.lowSkill?.requiredSp || 300),
      maxSp: Math.max(1, actions.lowSkill?.requiredSp || 300),
      lowSkillSpPolicy: 'reset',
      runtimeEffects: {
        attackSpeedEffects,
        spRegenEffects,
        spRecoveryEffects,
        cooldownEffects,
        damageBuffEffects,
        eventEffects,
        statusDamageWeaknessP: Math.max(0, toFiniteNumber(buildOptions.runtimeEffects?.statusDamageWeaknessP)),
        initialTargetStatuses: normalizeArray(buildOptions.runtimeEffects?.initialTargetStatuses).map(item => ({
          status: String(item?.status || ''),
          sourceSelf: item?.sourceSelf !== false,
          reason: String(item?.reason || '')
        })).filter(item => item.status),
        statusReactions,
        damageEffectIds: normalizeArray(buildOptions.runtimeEffects?.damageEffectIds).map(String).filter(Boolean)
      },
      externalEvents: normalizeArray(buildOptions.externalEvents || buildOptions.runtimeEffects?.externalEvents).map((event, index) => ({
        id: String(event?.id || `external:${index}`),
        type: String(event?.type || event?.triggerType || ''),
        frame: Math.max(0, toFiniteNumber(event?.frame)),
        intervalFrames: Math.max(0, toFiniteNumber(event?.intervalFrames)),
        repeatCount: Math.max(0, Math.floor(toFiniteNumber(event?.repeatCount))),
        sourceId: String(event?.sourceId || event?.triggerSourceId || ''),
        triggerSourceId: String(event?.triggerSourceId || ''),
        conditionType: String(event?.conditionType || ''),
        conditionValue: String(event?.conditionValue ?? ''),
        value: event?.value ?? '',
        status: String(event?.status || ''),
        statusDurationFrames: Math.max(0, toFiniteNumber(event?.statusDurationFrames ?? event?.durationFrames)),
        statusStackable: event?.statusStackable === true || event?.stackable === true,
        statusMaxStacks: Math.max(1, Math.floor(toFiniteNumber(event?.statusMaxStacks ?? event?.maxStacks, 1))),
        statusStackGroupId: String(event?.statusStackGroupId || event?.stackGroupId || ''),
        statusApplicationEffectId: String(event?.statusApplicationEffectId || event?.applicationEffectId || ''),
        statusSourceId: String(event?.statusSourceId || ''),
        statusSourceSelf: event?.statusSourceSelf === true,
        statusDealsPeriodicDamage: event?.statusDealsPeriodicDamage == null
          ? null
          : event.statusDealsPeriodicDamage === true,
        statusTickFrames: Math.max(0, toFiniteNumber(event?.statusTickFrames)),
        statusTickMultiplier: toFiniteNumber(event?.statusTickMultiplier),
        reason: String(event?.reason || '')
      })).filter(event => event.type),
      runtimeResources,
      enemyCount,
      actions,
      warnings
    };
  }

  function pickVariant(action, state, random) {
    const names = action?.variantNames || [];
    if (!names.length) return 'default';
    const weightedSelection = action.variantSelection;
    if (weightedSelection?.type === 'selfState') {
      const activeChoice = normalizeArray(weightedSelection.choices).find(choice => (
        names.includes(choice?.branch)
        && state.selfStateStacks.some(stack => (
          stack.stateId === choice?.stateId && state.tick < stack.expireTick
        ))
      ));
      if (activeChoice) return activeChoice.branch;
      const fallback = String(weightedSelection.fallbackBranch || 'default');
      return fallback === 'default' || names.includes(fallback) ? fallback : names[0];
    }
    if (weightedSelection?.type === 'weighted') {
      const choices = normalizeArray(weightedSelection.choices)
        .filter(choice => names.includes(choice?.branch) && toFiniteNumber(choice?.weight) > 0);
      const totalWeight = choices.reduce((total, choice) => total + toFiniteNumber(choice.weight), 0);
      if (totalWeight > 0) {
        let remaining = random() * totalWeight;
        for (const choice of choices) {
          remaining -= toFiniteNumber(choice.weight);
          if (remaining < 0) return choice.branch;
        }
        return choices.at(-1)?.branch || names[0];
      }
    }
    if (action.key === 'lowSkill') {
      const selection = action.variantSelection || { type: 'random' };
      let selected;
      if (selection.type === 'resourceAfterGain') {
        const resource = state.runtimeResources?.[selection.resourceId];
        const maxStacks = Math.max(1, toFiniteNumber(resource?.maxStacks, 1));
        const desired = Math.min(maxStacks, Math.max(0,
          toFiniteNumber(resource?.stacks) + toFiniteNumber(selection.predictedGain)
        ));
        const choices = normalizeArray(selection.choices).slice().sort((a, b) => a.stacks - b.stacks);
        selected = choices.find(choice => choice.stacks === desired)?.branch
          || choices.filter(choice => choice.stacks <= desired).pop()?.branch
          || choices[0]?.branch;
      } else if (selection.type === 'fixed') {
        selected = names.includes(selection.branch) ? selection.branch : names[0];
      } else {
        selected = names[Math.min(names.length - 1, Math.floor(random() * names.length))];
      }
      selected ||= names[0];
      state.lastSkillVariant = selected;
      return selected;
    }
    if (action.key === 'highSkill') {
      if (state.lastSkillVariant && names.includes(state.lastSkillVariant)) return state.lastSkillVariant;
      return names.includes('かすり傷注意') ? 'かすり傷注意' : names[0];
    }
    return names[0];
  }

  function getVariantDamageProfile(damageProfiles, actionKey, variant = '') {
    const profile = damageProfiles?.[actionKey];
    if (!profile) return null;
    return profile.variants?.[variant || 'default']
      || profile.variants?.default
      || Object.values(profile.variants || {})[0]
      || null;
  }

  function findEventDamageEffect(effects, variantProfile, event) {
    let effect = event?.effectId ? variantProfile.effects?.[event.effectId] : null;
    if (!effect && event?.effectId) {
      effect = effects.find(item => item?.effectId === event.effectId) || null;
    }
    if (!effect && event?.effectValueKind) {
      const expectedKind = String(event.effectValueKind);
      effect = effects.find(item => {
        const actualKind = String(item?.valueKind || item?.kind || item?.label || '');
        return actualKind === expectedKind
          || actualKind.includes(expectedKind)
          || expectedKind.includes(actualKind);
      }) || null;
    }
    if (!effect && !event?.effectId && effects.length === 1) effect = effects[0];
    return effect;
  }

  function findEventDamageEffectAcrossVariants(damageProfiles, current, event, preferredProfile) {
    if (!event?.effectId) return null;
    const actionProfile = damageProfiles?.[current?.key];
    const profiles = [
      preferredProfile,
      ...Object.values(actionProfile?.variants || {})
    ].filter(Boolean);
    const seen = new Set();
    for (const profile of profiles) {
      if (seen.has(profile)) continue;
      seen.add(profile);
      const effect = profile.effects?.[event.effectId]
        || Object.values(profile.effects || {}).find(item => item?.effectId === event.effectId);
      if (effect) return effect;
    }
    return null;
  }

  function isPerHitDamageDefinition(event, effect) {
    const text = `${event?.effectValueKind || ''} ${effect?.valueKind || effect?.kind || effect?.label || ''}`;
    return /1回あたり|1ヒットあたり|各1回|各ヒット/.test(text);
  }

  function getEventExpectedDamage(current, event, damageProfiles) {
    const variantProfile = getVariantDamageProfile(damageProfiles, current?.key, current?.variant);
    if (!variantProfile) return 0;
    const effects = Object.values(variantProfile.effects || {});
    const damageEvents = current.events.filter(candidate => candidate.type === 'damage');
    let expectedDamage = 0;
    if (damageEvents.length === 1 && effects.length > 1) {
      expectedDamage = Math.max(0, toFiniteNumber(variantProfile.totalExpectedDamage));
    } else {
      const effect = findEventDamageEffect(effects, variantProfile, event)
        || findEventDamageEffectAcrossVariants(damageProfiles, current, event, variantProfile);
      if (!effect) return 0;
      if (Number.isFinite(Number(event.coefficientShare)) && Number(event.coefficientShare) > 0) {
        expectedDamage = Math.max(0, toFiniteNumber(effect.expectedDamage)) * Number(event.coefficientShare);
      } else if (isPerHitDamageDefinition(event, effect)) {
        expectedDamage = Math.max(0, toFiniteNumber(effect.expectedDamage));
      } else if (event.generatedObjectId) {
        expectedDamage = Math.max(0, toFiniteNumber(effect.expectedDamage));
      } else {
        const siblingEvents = current.events.filter(candidate => {
          if (candidate.type !== 'damage') return false;
          if (event.effectId) return candidate.effectId === event.effectId;
          return true;
        });
        const totalWeight = siblingEvents.reduce((total, candidate) => total + Math.max(1, candidate.hitCount || 1), 0) || 1;
        const eventWeight = Math.max(1, event.hitCount || 1);
        expectedDamage = Math.max(0, toFiniteNumber(effect.expectedDamage)) * eventWeight / totalWeight;
      }
    }
    return expectedDamage * Math.max(1, toFiniteNumber(event.repeatDamageCount, 1));
  }

  function getEventRuntimeBase(current, event, damageProfiles) {
    const variantProfile = getVariantDamageProfile(damageProfiles, current?.key, current?.variant);
    if (!variantProfile) return null;
    const effects = Object.values(variantProfile.effects || {});
    const effect = findEventDamageEffect(effects, variantProfile, event)
      || findEventDamageEffectAcrossVariants(damageProfiles, current, event, variantProfile);
    return effect?.damageResult?.runtimeBase || null;
  }

  function getStatusReactionTakenDmgP(state, config) {
    return normalizeArray(config?.runtimeEffects?.statusReactions).reduce((total, reaction) => {
      if (reaction.attackerPersonality && reaction.attackerPersonality !== config.personality) return total;
      const activeStacks = normalizeArray(state?.statusStacks).filter(stack => (
        stack.status === reaction.status && state.tick <= stack.expireTick
      )).length;
      if (!activeStacks) return total;
      const appliedStacks = reaction.perStack
        ? (reaction.maxStacks > 0 ? Math.min(reaction.maxStacks, activeStacks) : activeStacks)
        : 1;
      return total + reaction.takenDmgP * appliedStacks;
    }, 0);
  }

  function evaluateDamageAtHit(input = {}) {
    const expectedDamage = Math.max(0, toFiniteNumber(input.expectedDamage));
    const actionKey = String(input.actionKey || '');
    const generatedEventType = String(input.generatedEventType || '');
    const modifierDelta = input.modifierDelta || {};
    const heldAddP = toFiniteNumber(input.heldAddP);
    const statusTakenDmgP = toFiniteNumber(input.statusTakenDmgP);
    const statusDamageP = toFiniteNumber(input.statusDamageP);
    const activeEffects = normalizeArray(input.activeEffects).map(effect => ({
      id: String(effect?.id || effect?.effectId || ''),
      label: String(effect?.label || ''),
      kind: String(effect?.kind || ''),
      modifiers: { ...(effect?.modifiers || {}) }
    }));
    const base = input.runtimeBase || null;
    const ratios = { attackDefense: 1, actionMultiplier: 1, add: 1, special: 1, other: 1, critical: 1 };
    const attackP = getRuntimeAttackModifierP(modifierDelta, base?.damageType || '');
    const actionMultiplierP = getRuntimeActionMultiplierModifierP(modifierDelta, actionKey, generatedEventType);
    const addP = getRuntimeAddModifierP(modifierDelta, actionKey) + heldAddP + statusTakenDmgP;
    const specialP = toFiniteNumber(modifierDelta.specialP);
    const otherP = toFiniteNumber(modifierDelta.otherP) + statusDamageP;
    const critP = toFiniteNumber(modifierDelta.critP);
    const critRateP = toFiniteNumber(modifierDelta.critRateP);
    const critDmgP = toFiniteNumber(modifierDelta.critDmgP);
    const critDmgAddP = toFiniteNumber(modifierDelta.critDmgAddP);
    const enemyDefDownP = toFiniteNumber(modifierDelta.enemyDefDownP);
    const enemyCritResDownP = toFiniteNumber(modifierDelta.enemyCritResDownP);
    const enemyCritDmgResDownP = toFiniteNumber(modifierDelta.enemyCritDmgResDownP);
    const hasModifier = !!(attackP || actionMultiplierP || addP || specialP || otherP || critP || critRateP || critDmgP || critDmgAddP
      || enemyDefDownP || enemyCritResDownP || enemyCritDmgResDownP);
    if (!(expectedDamage > 0) || !hasModifier) {
      return {
        baseExpectedDamage: expectedDamage,
        expectedDamage,
        ratio: 1,
        ratios,
        modifierDelta: { ...modifierDelta },
        heldAddP,
        statusTakenDmgP,
        statusDamageP,
        activeEffects,
        runtimeBaseAvailable: !!base
      };
    }
    if (!base) {
      ratios.actionMultiplier = 1 + actionMultiplierP / 100;
      ratios.add = 1 + addP / 100;
      ratios.special = 1 + specialP / 100;
      ratios.other = 1 + otherP / 100;
      const ratio = ratios.actionMultiplier * ratios.add * ratios.special * ratios.other;
      return {
        baseExpectedDamage: expectedDamage,
        expectedDamage: expectedDamage * ratio,
        ratio,
        ratios,
        modifierDelta: { ...modifierDelta },
        heldAddP,
        statusTakenDmgP,
        statusDamageP,
        activeEffects,
        runtimeBaseAvailable: false
      };
    }

    let ratio = 1;
    if (actionMultiplierP) {
      const oldActionMultiplierP = Math.max(
        0.000001,
        toFiniteNumber(base.finalActionMultiplierP, base.baseActionMultiplierP || 100)
      );
      const baseActionMultiplierP = Math.max(
        0,
        toFiniteNumber(base.baseActionMultiplierP, oldActionMultiplierP)
      );
      const newActionMultiplierP = Math.max(
        0,
        baseActionMultiplierP * (
          1 + (toFiniteNumber(base.actionMultiplierBonusP) + actionMultiplierP) / 100
        )
      );
      ratios.actionMultiplier = newActionMultiplierP / oldActionMultiplierP;
      ratio *= ratios.actionMultiplier;
    }
    if (attackP || enemyDefDownP) {
      const oldFinalAtk = Math.max(0, toFiniteNumber(base.finalAtk));
      const newFinalAtk = attackP
        ? Math.max(0, toFiniteNumber(base.baseAtk) * (1 + (toFiniteNumber(base.attackP) + attackP) / 100))
        : oldFinalAtk;
      const oldFinalDef = Math.max(1, toFiniteNumber(base.finalDef, 1));
      const newFinalDef = enemyDefDownP
        ? Math.max(1, toFiniteNumber(base.baseDef, oldFinalDef) * (
          1 + (toFiniteNumber(base.defenseP) - enemyDefDownP) / 100
        ))
        : oldFinalDef;
      const oldDefRate = Math.max(0.000001, toFiniteNumber(base.defRate));
      const newDefRate = calcRuntimeBaseDamageRate(newFinalAtk, newFinalDef);
      ratios.attackDefense = newDefRate / oldDefRate;
      if (attackP && !base.damageReference && oldFinalAtk > 0) ratios.attackDefense *= newFinalAtk / oldFinalAtk;
      ratio *= ratios.attackDefense;
    }
    if (addP) {
      const oldAddRate = Math.max(0.2, toFiniteNumber(base.addRate, 1));
      const newAddRate = Math.max(
        0.2,
        toFiniteNumber(base.rawAddRate, oldAddRate) + addP / 100
      );
      ratios.add = newAddRate / oldAddRate;
      ratio *= ratios.add;
    }
    if (specialP) {
      const oldSpecialP = Math.max(0.000001, toFiniteNumber(base.specialP, 100));
      ratios.special = Math.max(0, oldSpecialP + specialP) / oldSpecialP;
      ratio *= ratios.special;
    }
    if (otherP) {
      const oldOtherP = Math.max(0.000001, toFiniteNumber(base.otherP, 100));
      ratios.other = Math.max(0, oldOtherP + otherP) / oldOtherP;
      ratio *= ratios.other;
    }
    if (critP || critRateP || critDmgP || critDmgAddP || enemyCritResDownP || enemyCritDmgResDownP) {
      const oldCritRate = base.guaranteedCrit
        ? 1
        : Math.max(0.05, Math.min(0.8, toFiniteNumber(base.critRate, 0.05)));
      const oldCritMult = Math.max(1.2, Math.min(2.5, toFiniteNumber(base.critMult, 1.2)));
      const newFinalCrit = Math.max(0, toFiniteNumber(base.baseCrit) * (
        1 + (toFiniteNumber(base.critP) + critP) / 100
      ));
      const newFinalCritRes = enemyCritResDownP
        ? Math.max(1, toFiniteNumber(base.baseCritRes, base.finalCritRes) * (
          1 + (toFiniteNumber(base.critResP) - enemyCritResDownP) / 100
        ))
        : Math.max(1, toFiniteNumber(base.finalCritRes, 1));
      const newBaseCritRate = calcRuntimeCritRate(newFinalCrit, newFinalCritRes);
      const newCritRate = base.guaranteedCrit
        ? 1
        : Math.max(0.05, Math.min(0.8,
          newBaseCritRate
            + (toFiniteNumber(base.critRateP) + critRateP) / 100
            - toFiniteNumber(base.critResAddP) / 100
        ));
      const newFinalCritDmg = Math.max(0, toFiniteNumber(base.baseCritDmg) * (
        1 + (toFiniteNumber(base.critDmgP) + critDmgP) / 100
      ));
      const newFinalCritDmgRes = enemyCritDmgResDownP
        ? Math.max(1, toFiniteNumber(base.baseCritDmgRes, base.finalCritDmgRes) * (
          1 + (toFiniteNumber(base.critDmgResP) - enemyCritDmgResDownP) / 100
        ))
        : Math.max(1, toFiniteNumber(base.finalCritDmgRes, 1));
      const newBaseCritMult = calcRuntimeCritMultiplier(newFinalCritDmg, newFinalCritDmgRes);
      const newCritMult = Math.max(1.2, Math.min(2.5,
        newBaseCritMult
          + (toFiniteNumber(base.critDmgAddP) + critDmgAddP) / 100
          - toFiniteNumber(base.critDmgResAddP) / 100
      ));
      const oldExpectedFactor = 1 + oldCritRate * (oldCritMult - 1);
      const newExpectedFactor = 1 + newCritRate * (newCritMult - 1);
      ratios.critical = newExpectedFactor / Math.max(0.000001, oldExpectedFactor);
      ratio *= ratios.critical;
    }
    return {
      baseExpectedDamage: expectedDamage,
      expectedDamage: expectedDamage * ratio,
      ratio,
      ratios,
      modifierDelta: { ...modifierDelta },
      heldAddP,
      statusTakenDmgP,
      statusDamageP,
      activeEffects,
      runtimeBaseAvailable: true
    };
  }

  function evaluateRuntimeDamage(expectedDamage, current, event, damageProfiles, state, config, runtimeBase = null, statusDamageP = 0) {
    const modifierDelta = getRuntimeDamageBuffDelta(state, config, current?.key || '');
    const heldAddP = Object.values(state.runtimeResources || {}).reduce((total, resource) => (
      total + (normalizeArray(resource.heldAddEffectIds).some(effectId => (
        normalizeArray(state.runtimeDamageEffectIds).includes(String(effectId || ''))
      ))
        ? toFiniteNumber(resource.stacks) * toFiniteNumber(resource.heldAddPPerStack)
        : 0)
    ), 0);
    const statusTakenDmgP = getStatusReactionTakenDmgP(state, config);
    const activeEffects = normalizeArray(state.runtimeBuffStacks)
      .filter(stack => stack.kind === 'damageBuff' || stack.kind === 'resourceGain')
      .map(stack => ({
        id: stack.effectId,
        label: stack.label,
        kind: stack.kind,
        modifiers: { ...(stack.modifiers || {}) }
      }));
    normalizeArray(config?.runtimeEffects?.damageBuffEffects)
      .filter(effect => isRuntimeStatusConditionActive(state, effect))
      .forEach(effect => activeEffects.push({
        id: effect.id,
        label: effect.label,
        kind: 'conditionalStatus',
        modifiers: { ...(effect.modifiers || {}) }
      }));
    if (heldAddP) activeEffects.push({
      id: 'runtime-resource-held',
      label: '固有リソース所持補正',
      kind: 'resourceHeld',
      modifiers: { addP: heldAddP }
    });
    if (statusTakenDmgP) activeEffects.push({
      id: 'runtime-status-reaction',
      label: '状態反応補正',
      kind: 'statusReaction',
      modifiers: { addP: statusTakenDmgP }
    });
    if (statusDamageP) activeEffects.push({
      id: 'runtime-status-damage-weakness',
      label: '状態異常ダメージ弱点',
      kind: 'statusDamageWeakness',
      modifiers: { otherP: statusDamageP }
    });
    return evaluateDamageAtHit({
      expectedDamage,
      actionKey: current?.key || '',
      generatedEventType: event?.generatedEventType || '',
      modifierDelta,
      heldAddP,
      statusTakenDmgP,
      statusDamageP,
      activeEffects,
      runtimeBase: runtimeBase || getEventRuntimeBase(current, event, damageProfiles)
    });
  }

  function percentile(values, ratio) {
    if (!values.length) return 0;
    const sorted = values.slice().sort((a, b) => a - b);
    const index = (sorted.length - 1) * Math.max(0, Math.min(1, ratio));
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
  }

  function simulate(config, options = {}) {
    const simulationStartedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    const ticksPerFrame = Math.max(1, Math.floor(toFiniteNumber(options.ticksPerFrame, DEFAULT_TICKS_PER_FRAME)));
    const framesPerSecond = Math.max(1, toFiniteNumber(options.framesPerSecond, DEFAULT_FRAMES_PER_SECOND));
    const durationSeconds = Math.max(1, Math.min(600, toFiniteNumber(options.durationSeconds, 60)));
    const durationTicks = toTicks(durationSeconds * framesPerSecond, ticksPerFrame);
    const spRecoveryIntervalFrames = Math.max(
      1,
      toFiniteNumber(options.spRecoveryIntervalFrames, config.spRecoveryIntervalFrames ?? 60)
    );
    const spTickInterval = toTicks(spRecoveryIntervalFrames, ticksPerFrame);
    const initialActionDelayFrames = Math.max(
      0,
      toFiniteNumber(options.initialActionDelayFrames, config.initialActionDelayFrames ?? framesPerSecond)
    );
    const initialActionDelayTicks = toTicks(initialActionDelayFrames, ticksPerFrame);
    const random = createSeededRandom(options.seed);
    const enemyCount = Math.max(1, Math.floor(toFiniteNumber(
      options.enemyCount ?? config.enemyCount,
      1
    )));
    const highSkillMode = options.highSkillMode === 'auto' ? 'auto' : 'disabled';
    const initialHighSkillCooldownMultiplier = Math.max(
      0,
      toFiniteNumber(options.initialHighSkillCooldownMultiplier, 1)
    );
    const recurringHighSkillCooldownMultiplier = Math.max(
      0,
      toFiniteNumber(options.recurringHighSkillCooldownMultiplier, 1)
    );
    const formationTimelineMode = ['supportEstimate', 'fullFormation'].includes(options.formationTimelineMode)
      ? options.formationTimelineMode
      : 'off';
    const damageProfiles = options.damageProfiles || {};
    const statusDamageProfiles = options.statusDamageProfiles || {};
    const resolveStatusDamage = typeof options.resolveStatusDamage === 'function'
      ? options.resolveStatusDamage
      : null;
    const recordTimeline = options.recordTimeline !== false;
    const recordDamageSeries = options.recordDamageSeries !== false && recordTimeline;
    const timeline = [];
    let timelineEventCount = 0;
    let timelineOmittedCount = 0;
    let processedTickCount = 0;
    let fastForwardCount = 0;
    let fastForwardedTickCount = 0;
    let generatedEventScheduleCount = 0;
    // 表示用タイムラインとは分離する。表示イベントは上限で省略されても、
    // グラフ・集計用のダメージ発生点は戦闘終了まで保持する。
    const damageSeries = [];
    const counts = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const hits = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const damagingActions = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const expectedDamageByAction = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const expectedDamageByStatus = Object.fromEntries(Object.keys(DOT_STATUS_MULTIPLIERS).map(status => [status, 0]));
    const expectedDamageByStatusSource = Object.fromEntries(Object.keys(DOT_STATUS_MULTIPLIERS).map(status => [status, {}]));
    const expectedDamageByRuntimeEffect = {};
    const runtimeEffectTriggerCounts = {};
    const trackedStatuses = new Set([
      ...Object.keys(DOT_STATUS_MULTIPLIERS),
      ...normalizeArray(config.runtimeEffects?.statusReactions).map(reaction => reaction.status),
      ...Object.values(config.actions || {}).flatMap(action => (
        normalizeArray(action?.statusDefinitions).map(definition => definition.status)
      ))
    ].filter(Boolean));
    const damagedActionInstances = new Set();
    const initialTargetStatuses = normalizeArray(config.runtimeEffects?.initialTargetStatuses)
      .filter(item => item?.status)
      .map((item, index) => ({
        id: index + 1,
        status: String(item.status),
        stackGroupId: `initial-target:${item.status}`,
        stackable: false,
        maxStacks: 1,
        sourceActionKey: '',
        sourceActionLabel: item.reason || '戦闘開始時の対象状態',
        sourceActionInstanceId: null,
        sourceSelf: item.sourceSelf !== false,
        appliedTick: 0,
        expireTick: Infinity,
        nextTick: Infinity,
        tickMultiplier: 0
      }));
    initialTargetStatuses.forEach(stack => trackedStatuses.add(stack.status));
    const state = {
      tick: 0,
      currentAction: null,
      movementTransition: null,
      skillTransition: null,
      pendingGeneratedEvents: [],
      pendingGeneratedEventQueue: [],
      generatedEventQueueSequence: 0,
      runtimePeriodicEventQueue: [],
      runtimePeriodicEventQueueSequence: 0,
      generatedAttackSpeedSnapshots: new Set(),
      actionSerial: 0,
      normalAttackSequence: 0,
      lastCompletedAction: null,
      lastNormalAttackStartTick: null,
      runtimeAttackSpeedEffects: normalizeArray(config.runtimeEffects?.attackSpeedEffects).map(effect => ({
        ...effect,
        stackCount: effect.mode === 'fixed'
          ? effect.fixedStacks
          : (['constant', 'initialTimed', 'manualInitialTimed'].includes(effect.mode) ? 1 : 0),
        expireTicks: effect.durationFrames > 0 && ['initialTimed', 'manualInitialTimed'].includes(effect.mode)
          ? [toTicks(effect.durationFrames, ticksPerFrame)]
          : [],
        nextTick: effect.intervalFrames > 0 ? toTicks(effect.intervalFrames, ticksPerFrame) : Infinity
      })),
      runtimeSpRecoveryEffects: normalizeArray(config.runtimeEffects?.spRecoveryEffects).map(effect => ({
        ...effect,
        nextTick: effect.mode === 'periodic' && effect.intervalFrames > 0
          ? toTicks(effect.intervalFrames, ticksPerFrame)
          : Infinity,
        triggerCount: 0,
        lastActionInstanceId: null,
        activeUntilTick: -1
      })),
      runtimeCooldownEffects: normalizeArray(config.runtimeEffects?.cooldownEffects).map(effect => ({
        ...effect,
        triggerCount: 0,
        lastActionInstanceId: null
      })),
      runtimeDamageBuffEffects: normalizeArray(config.runtimeEffects?.damageBuffEffects).map(effect => ({
        ...effect,
        triggerCount: 0,
        lastActionInstanceId: null
      })),
      runtimeEventEffects: normalizeArray(config.runtimeEffects?.eventEffects).map(effect => ({
        ...effect,
        nextTick: effect.intervalFrames > 0 && !effect.startOnSelfStateId
          ? toTicks(effect.intervalFrames, ticksPerFrame)
          : Infinity,
        occurrenceCount: 0,
        lastActionInstanceId: null
      })),
      externalEvents: normalizeArray(options.externalEvents || config.externalEvents)
        .flatMap((event, index) => {
          const startFrame = Math.max(0, toFiniteNumber(event?.frame));
          const intervalFrames = Math.max(0, toFiniteNumber(event?.intervalFrames));
          const requestedCount = Math.max(0, Math.floor(toFiniteNumber(event?.repeatCount)));
          const availableCount = intervalFrames > 0 && startFrame <= durationSeconds * framesPerSecond
            ? Math.floor((durationSeconds * framesPerSecond - startFrame) / intervalFrames) + 1
            : 1;
          const count = intervalFrames > 0
            ? Math.min(10000, requestedCount > 0 ? requestedCount : availableCount, availableCount)
            : 1;
          return Array.from({ length: Math.max(0, count) }, (_, occurrenceIndex) => {
            const frame = startFrame + intervalFrames * occurrenceIndex;
            return {
              ...event,
              id: `${String(event?.id || `external:${index}`)}:${occurrenceIndex + 1}`,
              periodicGroupId: String(event?.id || `external:${index}`),
              occurrence: occurrenceIndex + 1,
              frame,
              eventTick: toTicks(frame, ticksPerFrame),
              emitted: false
            };
          });
        })
        .sort((a, b) => a.frame - b.frame),
      externalEventIndex: 0,
      runtimeResources: Object.fromEntries(normalizeArray(config.runtimeResources).map(resource => [
        resource.id,
        { ...resource, stacks: Math.max(0, toFiniteNumber(resource.initialStacks)) }
      ])),
      runtimeDamageEffectIds: normalizeArray(config.runtimeEffects?.damageEffectIds),
      runtimeBuffSerial: 0,
      runtimeBuffStacks: [],
      selfStateSerial: 0,
      selfStateStacks: [],
      statusSerial: initialTargetStatuses.length,
      statusStacks: initialTargetStatuses,
      actionStartAllowedTick: initialActionDelayTicks,
      nextNormalAttackTick: initialActionDelayTicks,
      sp: Math.min(config.maxSp, config.initialSp),
      spRecoveryRemainingTicks: spTickInterval,
      spRecoveryNextTick: config.spRegen > 0 ? spTickInterval : Infinity,
      spRecoveryPausedRemainingTicks: null,
      lowSkillQueued: false,
      lowSkillReadyTick: null,
      cooldowns: {
        highSkill: {
          actionKey: 'highSkill',
          readyTick: highSkillMode === 'auto' && config.actions.highSkill?.cooldownSeconds
            ? toTicks(
                config.actions.highSkill.cooldownSeconds
                  * initialHighSkillCooldownMultiplier
                  * framesPerSecond,
                ticksPerFrame
              )
            : Infinity
        }
      },
      lastSkillVariant: ''
    };

    const log = (type, detail = {}) => {
      if (!recordTimeline) return;
      timelineEventCount += 1;
      if (timeline.length >= Math.max(100, toFiniteNumber(options.maxTimelineEvents, 2000))) {
        timelineOmittedCount += 1;
        return;
      }
      timeline.push({ tick: state.tick, frame: state.tick / ticksPerFrame, type, ...detail });
    };

    const comparePendingGeneratedEvents = (a, b) => (
      toFiniteNumber(a?.absoluteTick) - toFiniteNumber(b?.absoluteTick)
      || toFiniteNumber(a?.event?.eventOrder, 1000) - toFiniteNumber(b?.event?.eventOrder, 1000)
      || toFiniteNumber(a?.queueOrder) - toFiniteNumber(b?.queueOrder)
    );

    const enqueueGeneratedEvent = pending => {
      const queue = state.pendingGeneratedEventQueue;
      queue.push(pending);
      let index = queue.length - 1;
      while (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        if (comparePendingGeneratedEvents(queue[parent], queue[index]) <= 0) break;
        [queue[parent], queue[index]] = [queue[index], queue[parent]];
        index = parent;
      }
    };

    const peekPendingGeneratedEvent = () => {
      const queue = state.pendingGeneratedEventQueue;
      while (queue.length > 0) {
        const pending = queue[0];
        if (!pending.emitted && !pending.cancelled) return pending;
        const last = queue.pop();
        if (queue.length === 0) break;
        queue[0] = last;
        let index = 0;
        while (true) {
          const left = index * 2 + 1;
          const right = left + 1;
          let smallest = index;
          if (left < queue.length && comparePendingGeneratedEvents(queue[left], queue[smallest]) < 0) {
            smallest = left;
          }
          if (right < queue.length && comparePendingGeneratedEvents(queue[right], queue[smallest]) < 0) {
            smallest = right;
          }
          if (smallest === index) break;
          [queue[index], queue[smallest]] = [queue[smallest], queue[index]];
          index = smallest;
        }
      }
      return null;
    };

    const popPendingGeneratedEvent = () => {
      const pending = peekPendingGeneratedEvent();
      if (!pending) return null;
      const queue = state.pendingGeneratedEventQueue;
      const last = queue.pop();
      if (queue.length > 0) {
        queue[0] = last;
        let index = 0;
        while (true) {
          const left = index * 2 + 1;
          const right = left + 1;
          let smallest = index;
          if (left < queue.length && comparePendingGeneratedEvents(queue[left], queue[smallest]) < 0) {
            smallest = left;
          }
          if (right < queue.length && comparePendingGeneratedEvents(queue[right], queue[smallest]) < 0) {
            smallest = right;
          }
          if (smallest === index) break;
          [queue[index], queue[smallest]] = [queue[smallest], queue[index]];
          index = smallest;
        }
      }
      return pending;
    };

    const getNextPendingGeneratedEventTick = () => {
      const pending = peekPendingGeneratedEvent();
      return pending ? toFiniteNumber(pending.absoluteTick, Infinity) : Infinity;
    };

    // 周期効果・DoT・時限効果の次回時刻を遅延削除付きの最小ヒープで保持する。
    // 効果側の時刻が更新された場合、古いエントリは世代番号で無効化する。
    const runtimePeriodicTimerVersions = new WeakMap();
    const compareRuntimePeriodicEvents = (a, b) => (
      toFiniteNumber(a?.tick) - toFiniteNumber(b?.tick)
      || toFiniteNumber(a?.sequence) - toFiniteNumber(b?.sequence)
    );

    const pushRuntimePeriodicEvent = entry => {
      const queue = state.runtimePeriodicEventQueue;
      queue.push(entry);
      let index = queue.length - 1;
      while (index > 0) {
        const parent = Math.floor((index - 1) / 2);
        if (compareRuntimePeriodicEvents(queue[parent], queue[index]) <= 0) break;
        [queue[parent], queue[index]] = [queue[index], queue[parent]];
        index = parent;
      }
    };

    const popRuntimePeriodicEvent = () => {
      const queue = state.runtimePeriodicEventQueue;
      if (!queue.length) return null;
      const first = queue[0];
      const last = queue.pop();
      if (queue.length > 0) {
        queue[0] = last;
        let index = 0;
        while (true) {
          const left = index * 2 + 1;
          const right = left + 1;
          let smallest = index;
          if (left < queue.length && compareRuntimePeriodicEvents(queue[left], queue[smallest]) < 0) {
            smallest = left;
          }
          if (right < queue.length && compareRuntimePeriodicEvents(queue[right], queue[smallest]) < 0) {
            smallest = right;
          }
          if (smallest === index) break;
          [queue[index], queue[smallest]] = [queue[smallest], queue[index]];
          index = smallest;
        }
      }
      return first;
    };

    const getRuntimeTimerVersionMap = source => {
      let versions = runtimePeriodicTimerVersions.get(source);
      if (!versions) {
        versions = new Map();
        runtimePeriodicTimerVersions.set(source, versions);
      }
      return versions;
    };

    const getRuntimeTimerVersionKey = entry => `${entry.kind}:${entry.property || ''}`;

    const isRuntimePeriodicEventCurrent = entry => {
      const source = entry?.source;
      if (!source || source.active === false) return false;
      if (entry.kind === 'externalEvent') {
        return !source.emitted && source.eventTick === entry.tick;
      }
      if (entry.kind === 'expireTicks') {
        return Array.isArray(source.expireTicks) && source.expireTicks.includes(entry.value);
      }
      const property = entry.property || entry.kind || 'nextTick';
      const versions = getRuntimeTimerVersionMap(source);
      return versions.get(getRuntimeTimerVersionKey(entry)) === entry.version
        && toFiniteNumber(source[property], Infinity) === entry.tick;
    };

    const peekRuntimePeriodicEvent = () => {
      while (state.runtimePeriodicEventQueue.length > 0) {
        const entry = state.runtimePeriodicEventQueue[0];
        if (isRuntimePeriodicEventCurrent(entry)) return entry;
        popRuntimePeriodicEvent();
      }
      return null;
    };

    const scheduleRuntimeTimer = (source, kind = 'nextTick', tick = null, value = null, property = '') => {
      if (!source || typeof source !== 'object') return;
      const timerProperty = property || kind;
      const rawTick = tick == null ? source[timerProperty] : tick;
      const resolvedTick = rawTick == null ? Infinity : toFiniteNumber(rawTick, Infinity);
      const versions = getRuntimeTimerVersionMap(source);
      const versionKey = `${kind}:${timerProperty || ''}`;
      const version = (versions.get(versionKey) || 0) + 1;
      versions.set(versionKey, version);
      if (!Number.isFinite(resolvedTick)) return;
      pushRuntimePeriodicEvent({
        source,
        kind,
        property: timerProperty,
        tick: resolvedTick,
        value: value == null ? resolvedTick : value,
        version,
        sequence: ++state.runtimePeriodicEventQueueSequence
      });
    };

    const scheduleRuntimePeriodicEvent = source => scheduleRuntimeTimer(
      source,
      'nextTick',
      source?.nextTick,
      null,
      'nextTick'
    );

    const scheduleRuntimeExpireTick = source => scheduleRuntimeTimer(
      source,
      'expireTick',
      source?.expireTick,
      null,
      'expireTick'
    );

    const scheduleRuntimeExpireTicks = source => normalizeArray(source?.expireTicks)
      .forEach(expireTick => scheduleRuntimeTimer(
        source,
        'expireTicks',
        expireTick,
        expireTick,
        'expireTicks'
      ));

    const getNextRuntimePeriodicEventTick = () => {
      const entry = peekRuntimePeriodicEvent();
      return entry ? entry.tick : Infinity;
    };

    const scheduleRuntimeStateTimer = property => scheduleRuntimeTimer(
      state,
      'state',
      state[property],
      null,
      property
    );

    const scheduleRuntimeCooldownTimer = cooldown => scheduleRuntimeTimer(
      cooldown,
      'cooldown',
      cooldown?.readyTick,
      null,
      'readyTick'
    );

    const scheduleRuntimeExternalEvent = event => scheduleRuntimeTimer(
      event,
      'externalEvent',
      event?.eventTick,
      null,
      'eventTick'
    );

    const pauseBaseSpRecovery = () => {
      if (config.spRegen <= 0 || state.spRecoveryPausedRemainingTicks != null) return;
      const remaining = state.spRecoveryNextTick - state.tick;
      state.spRecoveryPausedRemainingTicks = Math.max(
        1,
        Number.isFinite(remaining) ? remaining : spTickInterval
      );
      state.spRecoveryRemainingTicks = state.spRecoveryPausedRemainingTicks;
      state.spRecoveryNextTick = Infinity;
      scheduleRuntimeStateTimer('spRecoveryNextTick');
    };

    const resumeBaseSpRecovery = () => {
      if (config.spRegen <= 0) return;
      const remaining = state.spRecoveryPausedRemainingTicks == null
        ? Math.max(1, state.spRecoveryNextTick - state.tick)
        : state.spRecoveryPausedRemainingTicks;
      state.spRecoveryRemainingTicks = remaining;
      state.spRecoveryNextTick = state.tick + remaining;
      state.spRecoveryPausedRemainingTicks = null;
      scheduleRuntimeStateTimer('spRecoveryNextTick');
    };

    state.runtimeAttackSpeedEffects.forEach(scheduleRuntimePeriodicEvent);
    state.runtimeAttackSpeedEffects.forEach(scheduleRuntimeExpireTicks);
    state.runtimeSpRecoveryEffects.forEach(scheduleRuntimePeriodicEvent);
    state.runtimeEventEffects.forEach(scheduleRuntimePeriodicEvent);
    state.statusStacks.forEach(scheduleRuntimePeriodicEvent);
    state.statusStacks.forEach(scheduleRuntimeExpireTick);
    state.runtimeBuffStacks.forEach(scheduleRuntimeExpireTick);
    state.externalEvents.forEach(scheduleRuntimeExternalEvent);
    scheduleRuntimeStateTimer('nextNormalAttackTick');
    scheduleRuntimeStateTimer('lowSkillReadyTick');
    scheduleRuntimeStateTimer('spRecoveryNextTick');
    Object.values(state.cooldowns).forEach(scheduleRuntimeCooldownTimer);

    const scheduleGeneratedEvent = pending => {
      pending.queueOrder = ++state.generatedEventQueueSequence;
      state.pendingGeneratedEvents.push(pending);
      enqueueGeneratedEvent(pending);
      generatedEventScheduleCount += 1;
    };

    // バフ・デバフを個別実装から切り離して追跡できる共通状態遷移ログ。
    // 既存の runtimeBuffApplied / statusApplied 等も互換性のため残す。
    const logEffectStateChange = ({
      kind,
      effectId,
      label = '',
      status = '',
      operation,
      stackId = null,
      stackCount = 0,
      maxStacks = 1,
      appliedTick = null,
      expireTick = null,
      sourceActionKey = '',
      sourceActionLabel = '',
      sourceId = '',
      reason = '',
      details = {}
    }) => {
      log('effectStateChanged', {
        kind,
        effectId: String(effectId || status || ''),
        label: String(label || ''),
        status: String(status || ''),
        operation,
        stackId,
        stackCount,
        maxStacks,
        appliedFrame: appliedTick == null ? null : appliedTick / ticksPerFrame,
        expireFrame: expireTick == null || !Number.isFinite(expireTick)
          ? null
          : expireTick / ticksPerFrame,
        sourceActionKey,
        sourceActionLabel,
        sourceId,
        reason,
        ...details
      });
    };

    initialTargetStatuses.forEach(stack => {
      logEffectStateChange({
        kind: 'debuff',
        effectId: stack.status,
        label: stack.status,
        status: stack.status,
        operation: 'apply',
        stackId: stack.id,
        stackCount: 1,
        maxStacks: 1,
        appliedTick: stack.appliedTick,
        expireTick: stack.expireTick,
        sourceActionKey: stack.sourceActionKey,
        sourceActionLabel: stack.sourceActionLabel,
        sourceId: stack.sourceId,
        reason: '戦闘開始時'
      });
      log('statusApplied', {
        actionKey: '',
        actionLabel: stack.sourceActionLabel,
        status: stack.status,
        stackCount: 1,
        maxStacks: 1,
        durationFrames: null,
        timingQuality: 'initial-target'
      });
    });

    const queueLowSkillIfReady = () => {
      if (state.lowSkillQueued || state.sp < config.requiredSp) return;
      state.lowSkillQueued = true;
      state.lowSkillReadyTick = state.tick;
      scheduleRuntimeStateTimer('lowSkillReadyTick');
      log('lowSkillReady', { sp: state.sp });
    };

    const pickSpRecoveryValue = (minimum, maximum) => {
      const low = Math.min(toFiniteNumber(minimum), toFiniteNumber(maximum));
      const high = Math.max(toFiniteNumber(minimum), toFiniteNumber(maximum));
      if (Math.abs(high - low) < 0.000001) return low;
      if (Number.isInteger(low) && Number.isInteger(high)) {
        return low + Math.floor(random() * (high - low + 1));
      }
      return low + random() * (high - low);
    };

    const getCooldownState = actionKey => state.cooldowns[actionKey] || null;

    const getCooldownRemainingTicks = actionKey => {
      const cooldown = getCooldownState(actionKey);
      if (!cooldown || !Number.isFinite(cooldown.readyTick)) return Infinity;
      return Math.max(0, cooldown.readyTick - state.tick);
    };

    const setCooldownRemainingTicks = (actionKey, remainingTicks) => {
      const cooldown = getCooldownState(actionKey);
      if (!cooldown) return false;
      cooldown.readyTick = state.tick + Math.max(0, remainingTicks);
      scheduleRuntimeCooldownTimer(cooldown);
      return true;
    };

    const applyCooldownEffect = (effect, reason = '', owner = null) => {
      const beforeTicks = getCooldownRemainingTicks(effect.targetActionKey);
      if (!Number.isFinite(beforeTicks)) return;
      const amountTicks = toTicks(effect.amountFrames, ticksPerFrame);
      let afterTicks = beforeTicks;
      if (effect.operation === 'add') afterTicks += amountTicks;
      else if (effect.operation === 'set') afterTicks = amountTicks;
      else if (effect.operation === 'multiply') afterTicks *= effect.multiplier;
      else afterTicks -= amountTicks;
      afterTicks = Math.max(0, afterTicks);
      if (Math.abs(afterTicks - beforeTicks) < 0.000001) return;
      setCooldownRemainingTicks(effect.targetActionKey, afterTicks);
      log('cooldownChanged', {
        effectId: effect.id,
        sourceId: effect.sourceId,
        label: effect.label,
        reason,
        actionKey: owner?.key || '',
        actionLabel: owner?.label || '',
        targetActionKey: effect.targetActionKey,
        operation: effect.operation,
        amountFrames: effect.amountFrames,
        multiplier: effect.multiplier,
        beforeFrames: beforeTicks / ticksPerFrame,
        afterFrames: afterTicks / ticksPerFrame,
        ready: afterTicks <= 0
      });
    };

    const triggerCooldownEffectsForAction = (owner, phase = 'start') => {
      state.runtimeCooldownEffects.forEach(effect => {
        if (effect.mode !== 'action' || effect.triggerPhase !== phase) return;
        if (!effect.triggerActionKeys.includes(owner.key)) return;
        effect.triggerCount += 1;
        if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
        applyCooldownEffect(effect, `${owner.label}${phase === 'end' ? '終了時' : '発動時'}`, owner);
      });
    };

    const triggerCooldownEffectsForHit = (owner, hitCount = 1) => {
      state.runtimeCooldownEffects.forEach(effect => {
        if (effect.mode !== 'actionHit' || !effect.triggerActionKeys.includes(owner.key)) return;
        const occurrences = effect.oncePerAction ? 1 : Math.max(1, Math.floor(toFiniteNumber(hitCount, 1)));
        for (let occurrence = 0; occurrence < occurrences; occurrence += 1) {
          if (effect.oncePerAction && effect.lastActionInstanceId === owner.instanceId) break;
          effect.triggerCount += 1;
          if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) continue;
          effect.lastActionInstanceId = owner.instanceId;
          applyCooldownEffect(effect, `${owner.label}命中時`, owner);
        }
      });
    };

    const applySpRecoveryEffect = (effect, reason = '', owner = null) => {
      const fixed = effect.random
        ? pickSpRecoveryValue(effect.fixedMin, effect.fixedMax)
        : effect.fixed;
      const percent = effect.random
        ? pickSpRecoveryValue(effect.percentMin, effect.percentMax)
        : effect.percent;
      const requestedAmount = fixed + config.maxSp * percent / 100;
      if (!requestedAmount) return;
      const before = state.sp;
      state.sp = Math.min(config.maxSp, Math.max(0, state.sp + requestedAmount));
      log('spRecoveryEvent', {
        effectId: effect.effectId || effect.id,
        sourceId: effect.sourceId,
        label: effect.label,
        reason,
        actionKey: owner?.key || '',
        actionLabel: owner?.label || '',
        requestedAmount,
        amount: state.sp - before,
        sp: state.sp,
        capped: state.sp === before
      });
      queueLowSkillIfReady();
    };

    const triggerSpRecoveryEffectsForAction = (owner, phase = 'start') => {
      state.runtimeSpRecoveryEffects.forEach(effect => {
        if (effect.mode === 'actionPeriodic' && phase === 'start' && effect.triggerActionKeys.includes(owner.key)) {
          effect.nextTick = state.tick + toTicks(effect.intervalFrames, ticksPerFrame);
          effect.activeUntilTick = effect.durationFrames > 0
            ? state.tick + toTicks(effect.durationFrames, ticksPerFrame)
            : effect.nextTick;
          scheduleRuntimePeriodicEvent(effect);
          return;
        }
        if (effect.mode !== 'action' || effect.triggerPhase !== phase) return;
        if (!effect.triggerActionKeys.includes(owner.key)) return;
        effect.triggerCount += 1;
        if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
        applySpRecoveryEffect(effect, `${owner.label}${phase === 'end' ? '終了時' : '発動時'}`, owner);
      });
    };

    const triggerSpRecoveryEffectsForHit = (owner, effectEvent = false, hitCount = 1) => {
      state.runtimeSpRecoveryEffects.forEach(effect => {
        if (effect.mode !== 'actionHit' || !effect.triggerActionKeys.includes(owner.key)) return;
        // 非攻撃行動は効果イベントを発生点として扱う。カードの「通常攻撃命中時」は
        // oncePerAction=false のため、効果イベントでは誤発火しない。
        if (effectEvent && !effect.oncePerAction) return;
        const occurrences = effectEvent ? 1 : Math.max(1, Math.floor(toFiniteNumber(hitCount, 1)));
        for (let occurrence = 0; occurrence < occurrences; occurrence += 1) {
          if (effect.oncePerAction && effect.lastActionInstanceId === owner.instanceId) break;
          effect.triggerCount += 1;
          if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) continue;
          effect.lastActionInstanceId = owner.instanceId;
          applySpRecoveryEffect(effect, `${owner.label}${effectEvent ? '効果発生時' : '命中時'}`, owner);
        }
      });
    };

    const processPeriodicSpRecoveryEffects = () => {
      state.runtimeSpRecoveryEffects.forEach(effect => {
        if (!['periodic', 'actionPeriodic'].includes(effect.mode) || effect.nextTick !== state.tick) return;
        if (effect.mode === 'actionPeriodic' && state.tick > effect.activeUntilTick) {
          effect.nextTick = Infinity;
          scheduleRuntimePeriodicEvent(effect);
          return;
        }
        applySpRecoveryEffect(effect, `${effect.intervalFrames / framesPerSecond}秒ごと`);
        effect.nextTick += toTicks(effect.intervalFrames, ticksPerFrame);
        if (effect.mode === 'actionPeriodic' && effect.nextTick > effect.activeUntilTick) effect.nextTick = Infinity;
        scheduleRuntimePeriodicEvent(effect);
      });
    };

    const getRuntimeAttackSpeedP = () => state.runtimeAttackSpeedEffects.reduce((total, effect) => (
      total + effect.stackCount * effect.hasteP
    ), 0);

    const getEffectiveNormalAttackIntervalFrames = () => (
      config.normalAttackIntervalFrames / (1 + getRuntimeAttackSpeedP() / 100)
    );

    const updateCurrentNormalAttackSchedule = () => {
      if (state.lastNormalAttackStartTick == null) return;
      state.nextNormalAttackTick = state.lastNormalAttackStartTick
        + toTicks(getEffectiveNormalAttackIntervalFrames(), ticksPerFrame);
      scheduleRuntimeStateTimer('nextNormalAttackTick');
    };

    const applyAttackSpeedEffect = (effect, reason = '') => {
      const previousStackCount = effect.stackCount;
      const previousTotalHasteP = getRuntimeAttackSpeedP();
      if (effect.durationFrames > 0) {
        const expireTick = state.tick + toTicks(effect.durationFrames, ticksPerFrame);
        if (effect.stackable) {
          const maxStacks = effect.maxStacks > 0 ? effect.maxStacks : Infinity;
          if (effect.expireTicks.length >= maxStacks) {
            effect.expireTicks.sort((a, b) => a - b);
            effect.expireTicks.shift();
          }
          effect.expireTicks.push(expireTick);
        } else {
          effect.expireTicks = [expireTick];
        }
        effect.stackCount = effect.expireTicks.length;
      } else if (effect.stackable || ['periodicStack', 'attackCountStack'].includes(effect.mode)) {
        effect.stackCount = effect.maxStacks > 0
          ? Math.min(effect.maxStacks, effect.stackCount + 1)
          : effect.stackCount + 1;
      } else {
        effect.stackCount = 1;
      }
      scheduleRuntimeExpireTicks(effect);
      if (effect.stackCount === previousStackCount && !effect.durationFrames) return;
      updateCurrentNormalAttackSchedule();
      const totalHasteP = getRuntimeAttackSpeedP();
      logEffectStateChange({
        kind: 'attackSpeed',
        effectId: effect.id,
        label: effect.label,
        operation: previousStackCount > 0 ? 'update' : 'apply',
        stackCount: effect.stackCount,
        maxStacks: effect.maxStacks,
        sourceId: effect.sourceId,
        reason,
        details: {
          hastePerStackP: effect.hasteP,
          addedHasteP: totalHasteP - previousTotalHasteP,
          totalHasteP,
          durationFrames: effect.durationFrames,
          normalAttackIntervalFrames: getEffectiveNormalAttackIntervalFrames()
        }
      });
      log('attackSpeedApplied', {
        effectId: effect.id,
        sourceId: effect.sourceId,
        label: effect.label,
        reason,
        stackCount: effect.stackCount,
        maxStacks: effect.maxStacks,
        hastePerStackP: effect.hasteP,
        addedHasteP: totalHasteP - previousTotalHasteP,
        totalHasteP,
        durationFrames: effect.durationFrames,
        normalAttackIntervalFrames: getEffectiveNormalAttackIntervalFrames()
      });
    };

    const expireAttackSpeedEffects = () => {
      let changed = false;
      state.runtimeAttackSpeedEffects.forEach(effect => {
        if (!effect.expireTicks.length) return;
        const before = effect.expireTicks.length;
        effect.expireTicks = effect.expireTicks.filter(expireTick => expireTick > state.tick);
        effect.stackCount = effect.expireTicks.length;
        if (effect.stackCount === before) return;
        changed = true;
        logEffectStateChange({
          kind: 'attackSpeed',
          effectId: effect.id,
          label: effect.label,
          operation: 'expire',
          stackCount: effect.stackCount,
          maxStacks: effect.maxStacks,
          sourceId: effect.sourceId,
          reason: '持続時間終了',
          details: {
            totalHasteP: getRuntimeAttackSpeedP(),
            normalAttackIntervalFrames: getEffectiveNormalAttackIntervalFrames()
          }
        });
        log('attackSpeedExpired', {
          effectId: effect.id,
          sourceId: effect.sourceId,
          label: effect.label,
          stackCount: effect.stackCount,
          totalHasteP: getRuntimeAttackSpeedP(),
          normalAttackIntervalFrames: getEffectiveNormalAttackIntervalFrames()
        });
      });
      if (changed) updateCurrentNormalAttackSchedule();
    };

    const processRuntimeAttackSpeedStacks = () => {
      state.runtimeAttackSpeedEffects.forEach(effect => {
        if (!['periodicStack', 'periodicTimed'].includes(effect.mode)) return;
        if (effect.nextTick !== state.tick) return;
        effect.nextTick += toTicks(effect.intervalFrames, ticksPerFrame);
        scheduleRuntimePeriodicEvent(effect);
        applyAttackSpeedEffect(effect, `${effect.intervalFrames / 60}秒ごと`);
      });
    };

    const triggerAttackSpeedEffectsForAction = (actionKey, phase = 'start') => {
      state.runtimeAttackSpeedEffects.forEach(effect => {
        if (effect.mode !== 'actionTimed' || effect.triggerPhase !== phase || !effect.triggerActionKeys.includes(actionKey)) return;
        applyAttackSpeedEffect(effect, `${ACTION_LABELS[actionKey] || actionKey}${phase === 'end' ? '終了' : '発動'}`);
      });
    };

    const triggerAttackSpeedEffectsForNormalAttackCount = () => {
      state.runtimeAttackSpeedEffects.forEach(effect => {
        if (effect.mode !== 'attackCountStack' || effect.triggerEveryCount <= 0) return;
        if (state.normalAttackSequence % effect.triggerEveryCount !== 0) return;
        applyAttackSpeedEffect(effect, `普通攻撃${state.normalAttackSequence}回目`);
      });
    };

    const applyRuntimeDamageBuff = (definition, owner = null, reason = '') => {
      if (!definition || !Object.keys(definition.modifiers || {}).length) return;
      if (definition.conditionType === '固有状態中' && definition.conditionValue) {
        const active = state.selfStateStacks.some(stack => (
          stack.stateId === definition.conditionValue && state.tick < stack.expireTick
        ));
        if (!active) return;
      }
      if (definition.oncePerAction && owner?.instanceId === definition.lastActionInstanceId) return;
      definition.lastActionInstanceId = owner?.instanceId ?? definition.lastActionInstanceId;
      const matching = state.runtimeBuffStacks.filter(stack => (
        stack.kind === 'damageBuff' && stack.effectId === definition.id
      ));
      const operation = !definition.stackable && matching.length ? 'update' : 'apply';
      if (!definition.stackable) {
        matching.forEach(stack => { stack.active = false; });
        state.runtimeBuffStacks = state.runtimeBuffStacks.filter(stack => (
          stack.kind !== 'damageBuff' || stack.effectId !== definition.id
        ));
      } else if (matching.length >= definition.maxStacks) {
        const oldest = matching.slice().sort((a, b) => (
          a.expireTick - b.expireTick || a.id - b.id
        ))[0];
        oldest.active = false;
        state.runtimeBuffStacks = state.runtimeBuffStacks.filter(stack => stack !== oldest);
        logEffectStateChange({
          kind: 'buff',
          effectId: oldest.effectId,
          label: oldest.label,
          operation: 'remove',
          stackId: oldest.id,
          stackCount: state.runtimeBuffStacks.filter(stack => stack.effectId === definition.id).length,
          maxStacks: definition.maxStacks,
          appliedTick: oldest.appliedTick,
          expireTick: oldest.expireTick,
          sourceActionKey: oldest.sourceActionKey || '',
          sourceActionLabel: oldest.sourceActionLabel || '',
          sourceId: oldest.sourceId || '',
          reason: '最大スタック到達による最古スタック置換'
        });
      }
      const stack = {
        id: ++state.runtimeBuffSerial,
        kind: 'damageBuff',
        effectId: definition.id,
        sourceId: definition.sourceId,
        sourceActionKey: owner?.key || '',
        sourceActionLabel: owner?.label || '',
        label: definition.label,
        modifiers: { ...definition.modifiers },
        active: true,
        appliedTick: state.tick,
        expireTick: definition.durationFrames > 0
          ? state.tick + toTicks(definition.durationFrames, ticksPerFrame)
          : Infinity
      };
      state.runtimeBuffStacks.push(stack);
      scheduleRuntimeExpireTick(stack);
      logEffectStateChange({
        kind: 'buff',
        effectId: stack.effectId,
        label: stack.label,
        operation,
        stackId: stack.id,
        stackCount: state.runtimeBuffStacks.filter(item => item.effectId === definition.id).length,
        maxStacks: definition.maxStacks,
        appliedTick: stack.appliedTick,
        expireTick: stack.expireTick,
        sourceActionKey: stack.sourceActionKey,
        sourceActionLabel: stack.sourceActionLabel,
        sourceId: stack.sourceId,
        reason,
        details: {
          modifiers: { ...stack.modifiers },
          durationFrames: definition.durationFrames
        }
      });
      log('runtimeBuffApplied', {
        actionKey: owner?.key || '',
        actionLabel: owner?.label || '',
        effectId: definition.id,
        label: definition.label,
        reason,
        addedStackCount: 1,
        stackCount: state.runtimeBuffStacks.filter(stack => (
          stack.kind === 'damageBuff' && stack.effectId === definition.id
        )).length,
        maxStacks: definition.maxStacks,
        modifiers: { ...definition.modifiers },
        durationFrames: definition.durationFrames
      });
    };

    const triggerDamageBuffEffectsForAction = (owner, phase = 'start') => {
      state.runtimeDamageBuffEffects.forEach(effect => {
        if (effect.mode !== 'actionTimed' || effect.triggerPhase !== phase) return;
        if (!effect.triggerActionKeys.includes(owner.key)) return;
        effect.triggerCount += 1;
        if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
        applyRuntimeDamageBuff(effect, owner, `${owner.label}${phase === 'end' ? '終了時' : '発動時'}`);
      });
    };

    const triggerDamageBuffEffectsForHit = (owner, hitCount = 1) => {
      state.runtimeDamageBuffEffects.forEach(effect => {
        if (effect.mode !== 'actionHitTimed' || !effect.triggerActionKeys.includes(owner.key)) return;
        const applications = effect.stackable ? Math.max(1, Math.floor(toFiniteNumber(hitCount, 1))) : 1;
        for (let index = 0; index < applications; index += 1) {
          effect.triggerCount += 1;
          if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) continue;
          applyRuntimeDamageBuff(effect, owner, `${owner.label}命中時`);
        }
      });
    };

    const triggerDamageBuffEffectsForStatusApplication = (owner, application) => {
      // 初期状態や外部状態ではなく、本人の行動／生成物によって実際に
      // 状態異常の付与処理が成功した瞬間だけを起点にする。非スタック状態の
      // 更新も「付与時」なので、同じバフを更新して持続時間をリフレッシュする。
      if (!owner?.key || owner.key === 'external' || !application?.status) return;
      state.runtimeDamageBuffEffects.forEach(effect => {
        if (effect.mode !== 'statusApplicationTimed') return;
        if (effect.triggerActionKeys.length && !effect.triggerActionKeys.includes(owner.key)) return;
        effect.triggerCount += 1;
        if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
        applyRuntimeDamageBuff(effect, owner, `${application.status}付与時`);
      });
    };

    const triggerDamageBuffEffectsForResourceChange = (owner, resource, change) => {
      const sourceIds = new Set([
        String(resource?.id || '').trim(),
        String(resource?.name || '').trim()
      ].filter(Boolean));
      const operation = change?.operation === 'consume' ? 'consume' : 'gain';
      state.runtimeDamageBuffEffects.forEach(effect => {
        if (effect.mode !== 'resourceChanged') return;
        if (effect.triggerSourceId && !sourceIds.has(String(effect.triggerSourceId).trim())) return;
        const triggerText = normalizeRuntimeTriggerType([
          effect.triggerType,
          effect.triggerValue,
          effect.conditionValue
        ].filter(Boolean).join(' '));
        if (/獲得/.test(triggerText) && operation !== 'gain') return;
        if (/消費/.test(triggerText) && operation !== 'consume') return;
        effect.triggerCount += 1;
        if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
        applyRuntimeDamageBuff(
          effect,
          owner,
          `${resource?.name || resource?.id || 'リソース'}${operation === 'gain' ? '獲得時' : '消費時'}`
        );
      });
    };

    const triggerRuntimeEffectsForSourceEvent = (owner, event) => {
      const sourceEffectId = String(event?.effectId || '');
      if (!sourceEffectId) return;
      const matchesOwner = effect => (
        !effect.triggerActionKeys?.length || effect.triggerActionKeys.includes(owner.key)
      );
      state.runtimeAttackSpeedEffects.forEach(effect => {
        if (effect.mode !== 'sourceEventTimed' || effect.triggerSourceId !== sourceEffectId) return;
        if (!matchesOwner(effect)) return;
        applyAttackSpeedEffect(effect, `${sourceEffectId}発生時`);
      });
      state.runtimeDamageBuffEffects.forEach(effect => {
        if (effect.mode !== 'sourceEventTimed' || effect.triggerSourceId !== sourceEffectId) return;
        if (!matchesOwner(effect)) return;
        if (effect.oncePerAction && effect.lastActionInstanceId === owner.instanceId) return;
        effect.triggerCount += 1;
        if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
        effect.lastActionInstanceId = owner.instanceId;
        applyRuntimeDamageBuff(effect, owner, `${sourceEffectId}発生時`);
      });
      state.runtimeSpRecoveryEffects.forEach(effect => {
        if (effect.mode !== 'sourceEvent' || effect.triggerSourceId !== sourceEffectId) return;
        if (!matchesOwner(effect)) return;
        if (effect.oncePerAction && effect.lastActionInstanceId === owner.instanceId) return;
        effect.triggerCount += 1;
        if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
        effect.lastActionInstanceId = owner.instanceId;
        applySpRecoveryEffect(effect, `${sourceEffectId}発生時`, owner);
      });
      state.runtimeCooldownEffects.forEach(effect => {
        if (effect.mode !== 'sourceEvent' || effect.triggerSourceId !== sourceEffectId) return;
        if (!matchesOwner(effect)) return;
        if (effect.oncePerAction && effect.lastActionInstanceId === owner.instanceId) return;
        effect.triggerCount += 1;
        if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
        effect.lastActionInstanceId = owner.instanceId;
        applyCooldownEffect(effect, `${sourceEffectId}発生時`, owner);
      });
      // skillmotion の効果IDへ直接結び付けた固有状態・状態異常・追加効果も、
      // 攻撃速度やダメージバフと同じ発生時刻で処理する。triggerSourceId だけを
      // 見ると通常の命中・生成物トリガーまで拾うため、明示した timingSourceEffectId
      // に限定して行動開始時との二重発動を防ぐ。skillmotion側に同じリソース／
      // 状態ステップが直接埋め込まれている場合は、そのステップだけを構造化側
      // から除外し、同一グループ内の別ステップは処理順を保ったまま実行する。
      state.runtimeEventEffects.forEach(effect => {
        if (!effect.timingSourceEffectId || effect.timingSourceEffectId !== sourceEffectId) return;
        if (!matchesOwner(effect)) return;
        if (effect.oncePerAction && effect.lastActionInstanceId === owner.instanceId) return;
        effect.occurrenceCount += 1;
        if (effect.triggerEveryCount > 0 && effect.occurrenceCount % effect.triggerEveryCount !== 0) return;
        effect.lastActionInstanceId = owner.instanceId;
        const directEventIds = new Set([
          event?.effectId,
          event?.statusApplication?.applicationEffectId,
          event?.statusApplication?.stateId
        ].map(value => String(value || '').trim()).filter(Boolean));
        const embeddedStep = step => {
          if (!directEventIds.size) return false;
          if (step?.type === 'resource' && !event?.resourceChange) return false;
          if (['status', 'selfState'].includes(step?.type)
            && !(event?.statusApplication?.durationFrames > 0)) return false;
          if (!['resource', 'status', 'selfState'].includes(step?.type)) return false;
          const stepId = String(
            step?.effectId
              || step?.application?.applicationEffectId
              || step?.application?.stateId
              || ''
          ).trim();
          return stepId && directEventIds.has(stepId);
        };
        const remainingSteps = effect.steps.filter(step => !embeddedStep(step));
        if (!remainingSteps.length) return;
        executeRuntimeEventEffect(
          remainingSteps.length === effect.steps.length
            ? effect
            : { ...effect, steps: remainingSteps },
          owner,
          `${sourceEffectId}発生時`
        );
      });
    };

    const resetRuntimeEffectsForAction = actionKey => {
      let changed = false;
      state.runtimeAttackSpeedEffects.forEach(effect => {
        if (!effect.resetActionKeys.includes(actionKey) || effect.stackCount <= 0) return;
        const previousStackCount = effect.stackCount;
        effect.stackCount = 0;
        effect.expireTicks = [];
        changed = true;
        logEffectStateChange({
          kind: 'attackSpeed',
          effectId: effect.id,
          label: effect.label,
          operation: 'reset',
          stackCount: 0,
          maxStacks: effect.maxStacks,
          sourceId: effect.sourceId,
          reason: `${ACTION_LABELS[actionKey] || actionKey}発動時`,
          details: {
            previousStackCount,
            totalHasteP: getRuntimeAttackSpeedP(),
            normalAttackIntervalFrames: getEffectiveNormalAttackIntervalFrames(),
            resetActionKey: actionKey
          }
        });
        log('attackSpeedReset', {
          effectId: effect.id,
          sourceId: effect.sourceId,
          label: effect.label,
          previousStackCount,
          totalHasteP: getRuntimeAttackSpeedP(),
          normalAttackIntervalFrames: getEffectiveNormalAttackIntervalFrames(),
          resetActionKey: actionKey
        });
      });
      if (changed) updateCurrentNormalAttackSchedule();
    };

    const getActiveStatusStacks = status => state.statusStacks.filter(stack => (
      stack.status === status && state.tick <= stack.expireTick
    ));

    const isSelfStateActive = stateId => state.selfStateStacks.some(stack => (
      stack.stateId === stateId && state.tick < stack.expireTick
    ));

    const addRuntimeGainBuff = (resource, owner, gainedStacks = 1) => {
      const definition = resource?.gainBuff;
      if (!definition || !(definition.attackPPerStack > 0) || !(definition.durationFrames > 0)) return;
      const addCount = Math.max(0, Math.floor(toFiniteNumber(gainedStacks)));
      for (let index = 0; index < addCount; index += 1) {
        const matching = state.runtimeBuffStacks.filter(stack => stack.effectId === definition.id);
        if (matching.length >= definition.maxStacks) {
          const oldest = matching.slice().sort((a, b) => a.expireTick - b.expireTick || a.id - b.id)[0];
          oldest.active = false;
          state.runtimeBuffStacks = state.runtimeBuffStacks.filter(stack => stack !== oldest);
          logEffectStateChange({
            kind: 'resourceBuff',
            effectId: oldest.effectId,
            label: oldest.label,
            operation: 'remove',
            stackId: oldest.id,
            stackCount: state.runtimeBuffStacks.filter(stack => stack.effectId === definition.id).length,
            maxStacks: definition.maxStacks,
            appliedTick: oldest.appliedTick,
            expireTick: oldest.expireTick,
            sourceActionKey: oldest.sourceActionKey || '',
            sourceActionLabel: oldest.sourceActionLabel || '',
            sourceId: definition.id,
            reason: '最大スタック到達による最古スタック置換'
          });
        }
        const stack = {
          id: ++state.runtimeBuffSerial,
          kind: 'resourceGain',
          effectId: definition.id,
          sourceActionKey: owner?.key || '',
          sourceActionLabel: owner?.label || '',
          label: definition.label,
          attackP: definition.attackPPerStack,
          modifiers: { atkP: definition.attackPPerStack },
          active: true,
          appliedTick: state.tick,
          expireTick: state.tick + toTicks(definition.durationFrames, ticksPerFrame)
        };
        state.runtimeBuffStacks.push(stack);
        scheduleRuntimeExpireTick(stack);
        logEffectStateChange({
          kind: 'resourceBuff',
          effectId: stack.effectId,
          label: stack.label,
          operation: 'apply',
          stackId: stack.id,
          stackCount: state.runtimeBuffStacks.filter(item => item.effectId === definition.id).length,
          maxStacks: definition.maxStacks,
          appliedTick: stack.appliedTick,
          expireTick: stack.expireTick,
          sourceActionKey: stack.sourceActionKey,
          sourceActionLabel: stack.sourceActionLabel,
          sourceId: stack.sourceId,
          reason: `${resource.name}獲得時`,
          details: {
            attackPPerStack: definition.attackPPerStack,
            durationFrames: definition.durationFrames,
            modifiers: { ...stack.modifiers }
          }
        });
      }
      if (!addCount) return;
      log('runtimeBuffApplied', {
        actionKey: owner.key,
        actionLabel: owner.label,
        label: definition.label,
        addedStackCount: addCount,
        stackCount: state.runtimeBuffStacks.filter(item => item.effectId === definition.id).length,
        maxStacks: definition.maxStacks,
        attackPPerStack: definition.attackPPerStack,
        durationFrames: definition.durationFrames
      });
    };

    const applyResourceChange = (owner, change) => {
      if (!change?.resourceId) return;
      const resource = state.runtimeResources[change.resourceId];
      if (!resource) return;
      const before = resource.stacks;
      const requestedAmount = change.amount === 'all'
        ? before
        : change.random
          ? pickSpRecoveryValue(change.amountMin, change.amountMax)
          : Math.max(0, toFiniteNumber(change.amount));
      if (change.operation === 'gain') {
        resource.stacks = Math.min(resource.maxStacks, before + requestedAmount);
        if (resource.stacks > before) addRuntimeGainBuff(resource, owner, resource.stacks - before);
      } else if (change.operation === 'consume') {
        resource.stacks = Math.max(0, before - requestedAmount);
      }
      if (resource.stacks !== before) {
        logEffectStateChange({
          kind: 'resource',
          effectId: resource.id,
          label: resource.name,
          operation: change.operation === 'consume' ? 'consume' : 'gain',
          stackCount: resource.stacks,
          maxStacks: resource.maxStacks,
          sourceActionKey: owner?.key || '',
          sourceActionLabel: owner?.label || '',
          sourceId: owner?.runtimeEffectId || '',
          reason: `${resource.name}${change.operation === 'consume' ? '消費時' : '獲得時'}`,
          details: {
            before,
            after: resource.stacks,
            amount: Math.abs(resource.stacks - before),
            requestedAmount,
            provisional: change.provisional === true,
            changeEventBasis: change.changeEventBasis || resource.changeEventBasis || ''
          }
        });
      }
      log('resourceChange', {
        actionKey: owner.key,
        actionLabel: owner.label,
        resourceId: resource.id,
        resourceName: resource.name,
        operation: change.operation,
        before,
        after: resource.stacks,
        amount: Math.abs(resource.stacks - before),
        requestedAmount,
        provisional: change.provisional === true,
        changeEventBasis: change.changeEventBasis || resource.changeEventBasis || '',
        maxStacks: resource.maxStacks
      });
      if (resource.stacks !== before && triggerRuntimeEventEffectsForResourceChange) {
        triggerRuntimeEventEffectsForResourceChange(owner, resource, change, before, resource.stacks);
      }
      if (resource.stacks !== before && triggerDamageBuffEffectsForResourceChange) {
        triggerDamageBuffEffectsForResourceChange(owner, resource, change);
      }
    };

    const expireRuntimeBuffs = () => {
      const expired = state.runtimeBuffStacks.filter(stack => stack.expireTick <= state.tick);
      expired.forEach(stack => { stack.active = false; });
      if (!expired.length) return;
      state.runtimeBuffStacks = state.runtimeBuffStacks.filter(stack => stack.expireTick > state.tick);
      expired.forEach(stack => {
        logEffectStateChange({
          kind: stack.kind === 'resourceGain' ? 'resourceBuff' : 'buff',
          effectId: stack.effectId,
          label: stack.label,
          operation: 'expire',
          stackId: stack.id,
          stackCount: state.runtimeBuffStacks.filter(item => item.effectId === stack.effectId).length,
          appliedTick: stack.appliedTick,
          expireTick: stack.expireTick,
          sourceActionKey: stack.sourceActionKey || '',
          sourceActionLabel: stack.sourceActionLabel || '',
          sourceId: stack.sourceId || '',
          reason: '持続時間終了'
        });
        log('runtimeBuffExpired', {
          label: stack.label,
          stackCount: state.runtimeBuffStacks.filter(item => item.effectId === stack.effectId).length
        });
      });
    };

    let triggerRuntimeEventEffectsForStatusMaxStack = null;
    let triggerRuntimeEventEffectsForResourceChange = null;
    let triggerRuntimeEventEffectsForStateChange = null;

    const applyStatusApplication = (owner, application) => {
      if (!application?.status || !(application.durationFrames > 0)) return;
      const applicationSourceId = application.sourceId == null
        ? String(config.apostleId || '')
        : String(application.sourceId || '');
      const applicationSourceSelf = application.sourceSelf !== false;
      trackedStatuses.add(application.status);
      const groupStacks = state.statusStacks.filter(stack => stack.stackGroupId === application.stackGroupId);
      const operation = !application.stackable && groupStacks.length ? 'update' : 'apply';
      if (!application.stackable) {
        state.statusStacks
          .filter(stack => stack.stackGroupId === application.stackGroupId)
          .forEach(stack => { stack.active = false; });
        state.statusStacks = state.statusStacks.filter(stack => stack.stackGroupId !== application.stackGroupId);
      } else if (groupStacks.length >= application.maxStacks) {
        const oldest = groupStacks.slice().sort((a, b) => (
          a.expireTick - b.expireTick || a.appliedTick - b.appliedTick || a.id - b.id
        ))[0];
        oldest.active = false;
        state.statusStacks = state.statusStacks.filter(stack => stack !== oldest);
        logEffectStateChange({
          kind: 'debuff',
          effectId: oldest.sourceRuntimeEffectId || oldest.status,
          label: oldest.status,
          status: oldest.status,
          operation: 'remove',
          stackId: oldest.id,
          stackCount: state.statusStacks.filter(stack => stack.stackGroupId === application.stackGroupId).length,
          maxStacks: application.maxStacks,
          appliedTick: oldest.appliedTick,
          expireTick: oldest.expireTick,
          sourceActionKey: oldest.sourceActionKey,
          sourceActionLabel: oldest.sourceActionLabel,
          sourceId: oldest.sourceId,
          reason: '最大スタック到達による最古スタック置換'
        });
      }
      const stack = {
        id: ++state.statusSerial,
        status: application.status,
        stackGroupId: application.stackGroupId,
        stackable: application.stackable,
        maxStacks: application.maxStacks,
        sourceActionKey: owner.key,
        sourceActionLabel: owner.label,
        sourceId: applicationSourceId,
        sourceActionInstanceId: owner.instanceId,
        sourceRuntimeEffectId: owner.runtimeEffectId || '',
        sourceRuntimeEffectLabel: owner.runtimeEffectId ? (owner.runtimeEffectLabel || owner.label) : '',
        applicationEffectId: application.applicationEffectId || application.stateId || '',
        reference: application.reference || '',
        sourceSelf: applicationSourceSelf,
        active: true,
        appliedTick: state.tick,
        expireTick: Number.isFinite(Number(application.durationFrames))
          ? state.tick + toTicks(application.durationFrames, ticksPerFrame)
          : Infinity,
        nextTick: application.dealsPeriodicDamage
          ? state.tick + toTicks(application.tickFrames || STATUS_TICK_FRAMES, ticksPerFrame)
          : Infinity,
        tickMultiplier: application.tickMultiplier
      };
      state.statusStacks.push(stack);
      scheduleRuntimePeriodicEvent(stack);
      scheduleRuntimeExpireTick(stack);
      logEffectStateChange({
        kind: 'debuff',
        effectId: stack.sourceRuntimeEffectId || stack.status,
        label: stack.status,
        status: stack.status,
        operation,
        stackId: stack.id,
        stackCount: getActiveStatusStacks(stack.status).length,
        maxStacks: stack.maxStacks,
        appliedTick: stack.appliedTick,
        expireTick: stack.expireTick,
        sourceActionKey: stack.sourceActionKey,
        sourceActionLabel: stack.sourceActionLabel,
        sourceId: stack.sourceId,
        reason: application.timingQuality || '',
        details: {
          durationFrames: application.durationFrames,
          timingQuality: application.timingQuality || ''
        }
      });
      log('statusApplied', {
        actionKey: owner.key,
        actionLabel: owner.label,
        status: stack.status,
        stackCount: getActiveStatusStacks(stack.status).length,
        maxStacks: stack.maxStacks,
        durationFrames: application.durationFrames,
        timingQuality: application.timingQuality || ''
      });
      triggerDamageBuffEffectsForStatusApplication(owner, application);
      if (triggerRuntimeEventEffectsForStateChange
        && (owner?.key !== 'external' || application.externalStateTransition === true)) {
        triggerRuntimeEventEffectsForStateChange(owner, {
          kind: 'status',
          operation,
          stateId: stack.applicationEffectId || stack.status,
          status: stack.status,
          reference: application.reference || '',
          sourceId: applicationSourceId,
          sourceSelf: applicationSourceSelf,
          stackId: stack.id,
          stackCount: getActiveStatusStacks(stack.status).length,
          maxStacks: stack.maxStacks
        });
      }
      const stackCount = state.statusStacks.filter(item => (
        item.stackGroupId === application.stackGroupId && state.tick < item.expireTick
      )).length;
      if (application.stackable && stackCount >= application.maxStacks
        && triggerRuntimeEventEffectsForStatusMaxStack) {
        triggerRuntimeEventEffectsForStatusMaxStack(owner, application, stackCount);
      }
    };

    const runtimeEventConditionMatches = effect => {
      const condition = effect.conditionResource;
      if (condition?.id) {
        const stacks = toFiniteNumber(state.runtimeResources[condition.id]?.stacks);
        if (condition.min != null && stacks < condition.min) return false;
        if (condition.max != null && stacks > condition.max) return false;
      }
      if (String(effect.conditionType || '').replace(/[\s　]+/g, '') === '追加対象存在') {
        const required = Number(effect.conditionValue);
        const requiredAdditionalTargets = Number.isFinite(required)
          ? Math.max(0, Math.floor(required))
          : 1;
        if (Math.max(0, enemyCount - 1) < requiredAdditionalTargets) return false;
      }
      if (effect.conditionType === '固有状態中' && effect.conditionValue) {
        const active = state.selfStateStacks.some(stack => (
          (stack.stateId === effect.conditionValue || stack.status === effect.conditionValue)
          && state.tick < stack.expireTick
        ));
        if (!active) return false;
      }
      return true;
    };

    const applySelfState = (owner, application) => {
      if (!application?.stateId || !(application.durationFrames > 0)) return;
      const matching = state.selfStateStacks.filter(stack => stack.stateId === application.stateId);
      const operation = matching.length ? 'update' : 'apply';
      state.selfStateStacks = state.selfStateStacks.filter(stack => stack.stateId !== application.stateId);
      const stack = {
        id: ++state.selfStateSerial,
        stateId: application.stateId,
        status: application.status || application.stateId,
        reference: String(application.reference || '').trim(),
        sourceActionKey: owner.key,
        sourceActionLabel: owner.label,
        appliedTick: state.tick,
        expireTick: state.tick + toTicks(application.durationFrames, ticksPerFrame)
      };
      state.selfStateStacks.push(stack);
      state.runtimeEventEffects.forEach(effect => {
        if (effect.startOnSelfStateId !== stack.stateId || !(effect.intervalFrames > 0)) return;
        effect.nextTick = state.tick + toTicks(effect.intervalFrames, ticksPerFrame);
        scheduleRuntimePeriodicEvent(effect);
      });
      logEffectStateChange({
        kind: 'selfState',
        effectId: stack.stateId,
        label: stack.status,
        status: stack.status,
        operation,
        stackId: stack.id,
        stackCount: 1,
        maxStacks: 1,
        appliedTick: stack.appliedTick,
        expireTick: stack.expireTick,
        sourceActionKey: stack.sourceActionKey,
        sourceActionLabel: stack.sourceActionLabel,
        sourceId: String(config.apostleId || ''),
        reason: '固有状態付与',
        details: {
          durationFrames: application.durationFrames,
          reference: stack.reference
        }
      });
      if (triggerRuntimeEventEffectsForStateChange) {
        triggerRuntimeEventEffectsForStateChange(owner, {
          kind: 'selfState',
          operation,
          stateId: stack.stateId,
          status: stack.status,
          reference: stack.reference,
          sourceId: String(config.apostleId || ''),
          sourceSelf: true,
          stackId: stack.id,
          stackCount: 1,
          maxStacks: 1
        });
      }
    };

    let triggerRuntimeEventEffectsForEmittedEffect = null;
    let activeRuntimeChainPath = new Set();

    const rollRuntimeEventProbability = (definition, owner, reason) => {
      const probability = definition?.triggerProbability;
      if (probability == null) return true;
      const normalizedProbability = Math.max(0, Math.min(100, toFiniteNumber(probability)));
      if (normalizedProbability <= 0 || normalizedProbability >= 100) {
        log('runtimeEffectProbability', {
          actionKey: owner?.key || '',
          actionLabel: owner?.label || definition.label,
          runtimeEffectId: definition.id,
          probability: normalizedProbability,
          roll: normalizedProbability >= 100 ? 0 : 100,
          success: normalizedProbability >= 100,
          reason
        });
        return normalizedProbability >= 100;
      }
      const roll = random() * 100;
      const success = roll < normalizedProbability;
      log('runtimeEffectProbability', {
        actionKey: owner?.key || '',
        actionLabel: owner?.label || definition.label,
        runtimeEffectId: definition.id,
        probability: normalizedProbability,
        roll,
        success,
        reason
      });
      return success;
    };

    const executeRuntimeEventEffect = (
      definition,
      sourceOwner = null,
      reason = '',
      chainPath = new Set()
    ) => {
      if (!definition || !runtimeEventConditionMatches(definition)) return false;
      const triggerCount = (runtimeEffectTriggerCounts[definition.id] || 0) + 1;
      const ownerForProbability = sourceOwner || {
        key: '',
        label: definition.label,
        variant: '',
        instanceId: `runtime:${definition.id}:${triggerCount}`
      };
      if (!rollRuntimeEventProbability(definition, ownerForProbability, reason)) return false;
      runtimeEffectTriggerCounts[definition.id] = triggerCount;
      const owner = sourceOwner
        ? { ...sourceOwner, runtimeEffectId: definition.id, runtimeEffectLabel: definition.label }
        : {
            key: '',
            label: definition.label,
            variant: '',
            instanceId: `runtime:${definition.id}:${triggerCount}`,
            runtimeEffectId: definition.id,
            runtimeEffectLabel: definition.label
          };
      // effectId連鎖は実際に発生したダメージ効果だけを発火元にする。
      // 定義に並ぶ補助行（状態・リソース・回復など）のIDまで先に通知すると、
      // ダメージが発生していないのに「ダメージ命中時」相当の連鎖が起きる。
      const emittedEffectIds = new Set();
      const previousRuntimeChainPath = activeRuntimeChainPath;
      activeRuntimeChainPath = chainPath;
      try {
        definition.steps.forEach(step => {
          if (step.type === 'resource') {
            applyResourceChange(owner, {
              resourceId: step.resourceId,
              operation: step.operation,
              amount: step.amount,
              amountMin: step.amountMin,
              amountMax: step.amountMax,
              random: step.random,
              provisional: step.provisional,
              changeEventBasis: step.changeEventBasis
            });
            return;
          }
          if (step.type === 'damage') {
            if (step.effectId) emittedEffectIds.add(String(step.effectId));
            const damageOwner = step.unclassifiedDamage
              ? { ...owner, key: '' }
              : owner;
            const damageEvaluation = evaluateRuntimeDamage(
              step.expectedDamage,
              damageOwner,
              { effectId: step.effectId },
              damageProfiles,
              state,
              config,
              step.runtimeBase || null
            );
            const expectedDamage = damageEvaluation.expectedDamage;
            expectedDamageByRuntimeEffect[definition.id] = toFiniteNumber(expectedDamageByRuntimeEffect[definition.id]) + expectedDamage;
            log('runtimeEffectHit', {
              actionKey: owner.key || '',
              actionLabel: owner.label || definition.label,
              effectId: step.effectId || definition.id,
              runtimeEffectId: definition.id,
              label: step.label || definition.label,
              reason,
              expectedDamage,
              damageEvaluation
            });
            return;
          }
          if (step.type === 'status') {
            applyStatusApplication(owner, step.application);
            return;
          }
          if (step.type === 'selfState') {
            applySelfState(owner, step.application);
            return;
          }
          if (step.type === 'healing') {
            log('runtimeHealingEvent', {
              actionKey: owner.key || '',
              actionLabel: owner.label || definition.label,
              effectId: step.effectId || definition.id,
              runtimeEffectId: definition.id,
              label: step.label || 'HP回復',
              reason,
              value: step.value,
              reference: step.reference || ''
            });
          }
        });
      } finally {
        activeRuntimeChainPath = previousRuntimeChainPath;
      }
      if (triggerRuntimeEventEffectsForEmittedEffect) {
        const nextChainPath = new Set(chainPath);
        nextChainPath.add(definition.id);
        triggerRuntimeEventEffectsForEmittedEffect(owner, emittedEffectIds, reason, nextChainPath);
      }
      return true;
    };

    const normalizeRuntimeTriggerType = value => String(value || '').replace(/[\s　]+/g, '');

    const getRuntimeTransitionSourceIds = transition => new Set([
      transition?.stateId,
      transition?.status,
      transition?.reference,
      transition?.sourceId,
      transition?.resourceId,
      transition?.resourceName
    ].map(value => String(value || '').trim()).filter(Boolean));

    const triggerRuntimeTransitionEffects = (
      owner,
      transition,
      matchesEffect,
      reason = ''
    ) => {
      const chainPath = activeRuntimeChainPath || new Set();
      const triggered = new Set();
      state.runtimeEventEffects.forEach(effect => {
        if (chainPath.has(effect.id) || triggered.has(effect.id)) return;
        if (!matchesEffect(effect, transition)) return;
        if (effect.triggerActionKeys?.length && !effect.triggerActionKeys.includes(owner?.key)) return;
        if (effect.oncePerAction && effect.lastActionInstanceId === owner?.instanceId) return;
        triggered.add(effect.id);
        if (effect.oncePerAction) effect.lastActionInstanceId = owner?.instanceId || null;
        effect.occurrenceCount += 1;
        if (effect.triggerEveryCount > 0 && effect.occurrenceCount % effect.triggerEveryCount !== 0) return;
        executeRuntimeEventEffect(effect, owner, reason || effect.triggerType, chainPath);
      });
    };

    triggerRuntimeEventEffectsForStateChange = (owner, transition = {}) => {
      const normalizedTriggerType = normalizeRuntimeTriggerType(transition.triggerType || '');
      const isSelfState = transition.kind === 'selfState';
      const isApplied = ['apply', 'update'].includes(transition.operation);
      const expectedTriggerTypes = isSelfState
        ? (isApplied ? ['固有状態付与時'] : ['固有状態終了時'])
        : (isApplied ? ['状態付与時', '状態異常付与時'] : ['状態終了時']);
      const sourceIds = getRuntimeTransitionSourceIds(transition);
      triggerRuntimeTransitionEffects(
        owner,
        transition,
        effect => {
          const triggerType = normalizeRuntimeTriggerType(effect.triggerType);
          if (!expectedTriggerTypes.includes(triggerType)) return false;
          if (effect.triggerSourceId && !sourceIds.has(String(effect.triggerSourceId).trim())) return false;
          const triggerValue = String(effect.triggerValue || '').trim();
          if (triggerValue && !sourceIds.has(triggerValue)) return false;
          if (effect.conditionType === '付与者' && effect.conditionValue
            && String(effect.conditionValue).trim() !== String(transition.sourceId || '').trim()) return false;
          return true;
        },
        `${transition.status || transition.stateId || '状態'}${isApplied ? '付与時' : '終了時'}${transition.provisional ? '（暫定）' : ''}`
      );
    };

    triggerRuntimeEventEffectsForResourceChange = (owner, resource, change, before, after) => {
      const operation = change?.operation === 'consume' ? 'consume' : 'gain';
      const sourceIds = new Set([
        String(resource?.id || '').trim(),
        String(resource?.name || '').trim()
      ].filter(Boolean));
      const transition = {
        kind: 'resource',
        operation,
        resourceId: resource?.id || '',
        resourceName: resource?.name || '',
        before,
        after,
        requestedAmount: change?.amount,
        provisional: change?.provisional === true
      };
      triggerRuntimeTransitionEffects(
        owner,
        transition,
        effect => {
          const triggerType = normalizeRuntimeTriggerType(effect.triggerType);
          if (!['リソース変化時', 'リソース獲得時', 'リソース消費時'].includes(triggerType)) return false;
          if (effect.triggerSourceId && !sourceIds.has(String(effect.triggerSourceId).trim())) return false;
          const operationText = normalizeRuntimeTriggerType([
            effect.triggerType,
            effect.triggerValue,
            effect.conditionValue
          ].filter(Boolean).join(' '));
          if (/獲得/.test(operationText) && operation !== 'gain') return false;
          if (/消費/.test(operationText) && operation !== 'consume') return false;
          return true;
        },
        `${resource?.name || resource?.id || 'リソース'}${operation === 'gain' ? '獲得時' : '消費時'}${transition.provisional ? '（暫定）' : ''}`
      );
    };

    triggerRuntimeEventEffectsForEmittedEffect = (
      owner,
      emittedEffectIds,
      reason = '',
      chainPath = new Set()
    ) => {
      const emittedValues = emittedEffectIds instanceof Set
        ? [...emittedEffectIds]
        : normalizeArray(emittedEffectIds);
      const emittedIds = new Set(emittedValues.map(String).filter(Boolean));
      if (!emittedIds.size) return;
      const triggered = new Set();
      state.runtimeEventEffects.forEach(effect => {
        const sourceIds = normalizeArray(effect.triggerSourceIds?.length
          ? effect.triggerSourceIds
          : effect.triggerSourceId).map(String).filter(Boolean);
        if (!sourceIds.some(sourceId => emittedIds.has(sourceId))) return;
        if (chainPath.has(effect.id) || triggered.has(effect.id)) return;
        triggered.add(effect.id);
        if (effect.oncePerAction && effect.lastActionInstanceId === owner?.instanceId) return;
        if (effect.oncePerAction) effect.lastActionInstanceId = owner?.instanceId;
        effect.occurrenceCount += 1;
        if (effect.triggerEveryCount > 0 && effect.occurrenceCount % effect.triggerEveryCount !== 0) return;
        executeRuntimeEventEffect(
          effect,
          owner,
          `${effect.triggerType || '効果'} / ${sourceIds.find(sourceId => emittedIds.has(sourceId)) || ''}`,
          chainPath
        );
      });
    };

    triggerRuntimeEventEffectsForStatusMaxStack = (owner, application, stackCount) => {
      state.runtimeEventEffects.forEach(effect => {
        if (effect.triggerType !== '状態最大スタック到達時') return;
        if (effect.triggerSourceId && effect.triggerSourceId !== application.applicationEffectId) return;
        if (effect.conditionType === '状態' && effect.conditionValue
          && effect.conditionValue !== application.status) return;
        const triggered = executeRuntimeEventEffect(
          effect,
          owner,
          `${application.status} ${stackCount}/${application.maxStacks}スタック到達`
        );
        if (!triggered || !effect.consumeMaxStacks) return;
        const consumed = state.statusStacks.filter(stack => (
          stack.stackGroupId === application.stackGroupId
        ));
        consumed.forEach(stack => { stack.active = false; });
        state.statusStacks = state.statusStacks.filter(stack => (
          stack.stackGroupId !== application.stackGroupId
        ));
        logEffectStateChange({
          kind: 'debuff',
          effectId: application.applicationEffectId || application.status,
          label: application.status,
          status: application.status,
          operation: 'remove',
          stackCount: 0,
          maxStacks: application.maxStacks,
          sourceActionKey: owner?.key || '',
          sourceActionLabel: owner?.label || '',
          sourceId: String(config.apostleId || ''),
          reason: '最大スタック到達効果の発動後に消費'
        });
      });
    };

    const triggerRuntimeEventEffectsForEvent = (owner, event) => {
      state.runtimeEventEffects.forEach(effect => {
        const normalizedTriggerType = String(effect.triggerType || '').replace(/[\s　]+/g, '');
        const normalAttackHit = (effect.triggerType === '普通攻撃命中時'
          || effect.triggerType === '強化攻撃命中時'
          || /^(?:普通|通常)攻撃命中時一定確率$/.test(normalizedTriggerType))
          && event.type === 'damage'
          && effect.triggerActionKeys.includes(owner.key);
        const skillHit = [
          '低学年スキル命中時',
          '低学年スキル最終ヒット命中時',
          '高学年スキル命中時',
          '高学年スキル最終ヒット命中時',
          'スキル命中時',
          '攻撃命中時'
        ].includes(normalizedTriggerType)
          && event.type === 'damage'
          && effect.triggerActionKeys.includes(owner.key)
          && (!effect.finalHitOnly || event.isFinalHit === true);
        const damageHit = effect.triggerType === 'ダメージ命中時'
          && event.type === 'damage'
          && effect.triggerActionKeys.includes(owner.key)
          && (!effect.triggerSourceId || effect.triggerSourceId === event.effectId);
        const generatedHit = effect.triggerType === '生成物命中時'
          && event.type === 'damage'
          && event.generatedObjectId === effect.triggerSourceId;
        const generatedReturn = effect.triggerType === '生成物帰還時'
          && event.generatedObjectId === effect.triggerSourceId
          && /帰還/.test(String(event.generatedEventType || ''));
        const generatedDestroyed = effect.triggerType === '生成物消滅時'
          && event.generatedObjectId === effect.triggerSourceId
          && /消滅|破壊/.test(String(event.generatedEventType || ''));
        const generatedContact = effect.triggerType === '生成物接触時'
          && event.generatedObjectId === effect.triggerSourceId
          && /接触|衝突/.test(String(event.generatedEventType || ''));
        const generatedAttack = effect.triggerType === '生成物攻撃時'
          && event.generatedObjectId === effect.triggerSourceId
          && /攻撃/.test(String(event.generatedEventType || ''));
        const generatedArrival = effect.triggerType === '生成物到着時'
          && event.generatedObjectId === effect.triggerSourceId
          && /到着|爆発/.test(String(event.generatedEventType || ''));
        if (!normalAttackHit && !skillHit && !damageHit && !generatedHit && !generatedReturn && !generatedDestroyed
          && !generatedContact && !generatedAttack && !generatedArrival) return;
        const hitBasedTrigger = event.type === 'damage'
          && (normalAttackHit || skillHit || damageHit || generatedHit || generatedAttack);
        const occurrences = effect.perHitTrigger && hitBasedTrigger
          ? Math.max(1, Math.floor(toFiniteNumber(event.hitCount, 1)))
          : 1;
        for (let occurrence = 0; occurrence < occurrences; occurrence += 1) {
          if (effect.oncePerAction && effect.lastActionInstanceId === owner.instanceId) break;
          if (effect.oncePerAction) effect.lastActionInstanceId = owner.instanceId;
          effect.occurrenceCount += 1;
          if (effect.triggerEveryCount > 0 && effect.occurrenceCount % effect.triggerEveryCount !== 0) continue;
          executeRuntimeEventEffect(effect, owner, `${effect.triggerType} / ${effect.triggerSourceId || owner.label}${effect.perHitTrigger ? ` / ${occurrence + 1}ヒット目` : ''}`);
        }
      });
    };

    const triggerRuntimeEventEffectsForAction = (owner, phase = 'start') => {
      state.runtimeEventEffects.forEach(effect => {
        if (!effect.triggerActionKeys.includes(owner.key)) return;
        const isStart = phase === 'start';
        const actionTrigger = (
          (owner.key === 'lowSkill' && effect.triggerType === (isStart ? '低学年スキル使用時' : '低学年スキル終了時'))
          || (owner.key === 'highSkill' && effect.triggerType === (isStart ? '高学年スキル使用時' : '高学年スキル終了時'))
          || (owner.key === 'enhancedAttack' && effect.triggerType === (isStart ? '強化攻撃使用時' : '強化攻撃終了時'))
          || ((owner.key === 'basicAttack' || owner.key === 'enhancedAttack')
            && effect.triggerType === (isStart ? '普通攻撃使用時' : '普通攻撃終了時'))
          || (effect.triggerType === (isStart ? 'スキル使用時' : 'スキル終了時')
            && (owner.key === 'lowSkill' || owner.key === 'highSkill'))
          || (isStart && effect.triggerType === 'スキル発動時'
            && (owner.key === 'lowSkill' || owner.key === 'highSkill'))
          || (isStart && effect.triggerType === '対象スキル使用時'
            && effect.triggerActionKeys.includes(owner.key))
        );
        if (!actionTrigger) return;
        if (effect.oncePerAction && effect.lastActionInstanceId === owner.instanceId) return;
        if (effect.oncePerAction) effect.lastActionInstanceId = owner.instanceId;
        effect.occurrenceCount += 1;
        if (effect.triggerEveryCount > 0 && effect.occurrenceCount % effect.triggerEveryCount !== 0) return;
        executeRuntimeEventEffect(effect, owner, `${effect.triggerType} / ${owner.label}`);
      });
    };

    const externalTriggerTypes = new Map([
      ['shieldBreak', 'シールド破壊時'],
      ['シールド破壊時', 'シールド破壊時'],
      ['hpThreshold', 'HP閾値'],
      ['HP閾値', 'HP閾値'],
      ['damageTaken', '被弾時'],
      ['被弾時', '被弾時'],
      ['statusApplied', '状態付与時'],
      ['状態付与時', '状態付与時']
    ]);

    const createExternalStatusApplication = event => {
      const status = String(event?.status || '').trim();
      if (!status) return null;
      const requestedDurationFrames = toFiniteNumber(
        event?.statusDurationFrames ?? event?.durationFrames
      );
      const durationFrames = requestedDurationFrames > 0 ? requestedDurationFrames : Infinity;
      const stackable = event?.statusStackable === true || event?.stackable === true;
      const maxStacks = stackable
        ? Math.max(1, Math.floor(toFiniteNumber(event?.statusMaxStacks ?? event?.maxStacks, DEFAULT_STATUS_MAX_STACKS)))
        : 1;
      const periodicDamage = event?.statusDealsPeriodicDamage == null
        ? Object.prototype.hasOwnProperty.call(DOT_STATUS_MULTIPLIERS, status)
        : event.statusDealsPeriodicDamage === true;
      const tickFrames = periodicDamage
        ? Math.max(1, toFiniteNumber(event?.statusTickFrames, STATUS_TICK_FRAMES) || STATUS_TICK_FRAMES)
        : 0;
      const requestedTickMultiplier = toFiniteNumber(event?.statusTickMultiplier);
      const tickMultiplier = periodicDamage
        ? (requestedTickMultiplier > 0 ? requestedTickMultiplier : (DOT_STATUS_MULTIPLIERS[status] || 0))
        : 0;
      const eventGroupId = String(event?.periodicGroupId || event?.id || 'external');
      return {
        status,
        applicationEffectId: String(event?.statusApplicationEffectId || `external-status:${eventGroupId}:${status}`),
        durationFrames,
        stackable,
        maxStacks,
        stackGroupId: String(event?.statusStackGroupId || `external-status:${eventGroupId}:${status}`),
        dealsPeriodicDamage: periodicDamage,
        tickFrames,
        tickMultiplier,
        sourceId: String(event?.statusSourceId || event?.sourceId || `external:${eventGroupId}`),
        sourceSelf: event?.statusSourceSelf === true,
        externalStateTransition: true,
        timingQuality: 'external'
      };
    };

    const processExternalEvents = () => {
      while (state.externalEventIndex < state.externalEvents.length) {
        const event = state.externalEvents[state.externalEventIndex];
        if (event.emitted) {
          state.externalEventIndex += 1;
          continue;
        }
        if (event.eventTick !== state.tick) break;
        event.emitted = true;
        state.externalEventIndex += 1;
        const triggerType = externalTriggerTypes.get(event.type) || event.type;
        const owner = {
          key: 'external',
          label: event.reason || triggerType,
          variant: '',
          instanceId: `external:${event.id}`,
          runtimeEffectId: event.id
        };
        log('externalEvent', {
          externalEventId: event.id,
          externalEventType: event.type,
          triggerType,
          occurrence: event.occurrence,
          intervalFrames: event.intervalFrames,
          value: event.value,
          status: event.status,
          reason: event.reason
        });
        const statusApplication = createExternalStatusApplication(event);
        if (statusApplication) applyStatusApplication(owner, statusApplication);
        const matchesExternalRuntimeEffect = effect => (
          effect.externalTriggerType === triggerType
          // sourceIdを空欄にした手動イベントは、発動元IDを知らなくても
          // 同種の外部条件を起動できる。候補追加時はsourceIdで対象を
          // 絞り込めるため、複数使徒の同条件は従来どおり分離可能。
          && (!effect.externalSourceId || !event.sourceId || effect.externalSourceId === event.sourceId)
        );
        state.runtimeAttackSpeedEffects.forEach(effect => {
          if (effect.mode !== 'externalTimed' || !matchesExternalRuntimeEffect(effect)) return;
          applyAttackSpeedEffect(effect, `${triggerType} / ${event.reason || event.id}`);
        });
        state.runtimeDamageBuffEffects.forEach(effect => {
          if (effect.mode !== 'externalTimed' || !matchesExternalRuntimeEffect(effect)) return;
          effect.triggerCount += 1;
          if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
          applyRuntimeDamageBuff(effect, owner, `${triggerType} / ${event.reason || event.id}`);
        });
        state.runtimeSpRecoveryEffects.forEach(effect => {
          if (effect.mode !== 'external' || !matchesExternalRuntimeEffect(effect)) return;
          effect.triggerCount += 1;
          if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
          applySpRecoveryEffect(effect, `${triggerType} / ${event.reason || event.id}`, owner);
        });
        state.runtimeEventEffects.forEach(effect => {
          if (statusApplication
            && ['状態付与時', '状態異常付与時'].includes(normalizeRuntimeTriggerType(effect.triggerType))) return;
          if (effect.triggerType !== triggerType) return;
          const eventTriggerSourceId = String(event.triggerSourceId || '').trim();
          if (effect.triggerSourceId && eventTriggerSourceId
            && effect.triggerSourceId !== eventTriggerSourceId) return;
          if (effect.triggerSourceId && !eventTriggerSourceId && event.sourceId
            && effect.triggerSourceId !== event.sourceId) return;
          const expectedValue = effect.conditionValue !== '' && effect.conditionValue != null
            ? effect.conditionValue
            : effect.triggerValue;
          if (expectedValue !== '' && expectedValue != null
            && String(expectedValue) !== String(event.value ?? '')) return;
          effect.occurrenceCount += 1;
          if (effect.triggerEveryCount > 0 && effect.occurrenceCount % effect.triggerEveryCount !== 0) return;
          executeRuntimeEventEffect(effect, owner, `${triggerType} / ${event.reason || event.id}`);
        });
      }
    };

    const getNextActionInternalEventTick = () => {
      let nextTick = Infinity;
      const current = state.currentAction;
      if (current) {
        nextTick = Math.min(nextTick, current.endTick);
        current.events.forEach(event => {
          if (event.emitted) return;
          nextTick = Math.min(nextTick, current.startTick + event.relativeTick);
        });
      }
      if (state.movementTransition) nextTick = Math.min(nextTick, state.movementTransition.endTick);
      if (state.skillTransition) nextTick = Math.min(nextTick, state.skillTransition.readyTick);
      return nextTick;
    };

    const processPeriodicRuntimeEventEffects = () => {
      state.runtimeEventEffects.forEach(effect => {
        if (effect.triggerType !== 'n秒ごと' || effect.nextTick !== state.tick) return;
        executeRuntimeEventEffect(effect, null, `${effect.intervalFrames / framesPerSecond}秒ごと`);
        effect.nextTick += toTicks(effect.intervalFrames, ticksPerFrame);
        scheduleRuntimePeriodicEvent(effect);
      });
    };

    const expireSelfStates = () => {
      const expired = state.selfStateStacks.filter(stack => stack.expireTick <= state.tick);
      if (!expired.length) return;
      state.selfStateStacks = state.selfStateStacks.filter(stack => stack.expireTick > state.tick);
      expired.forEach(stack => {
        state.runtimeEventEffects.forEach(effect => {
          if (effect.startOnSelfStateId !== stack.stateId) return;
          effect.nextTick = Infinity;
          scheduleRuntimePeriodicEvent(effect);
        });
        logEffectStateChange({
          kind: 'selfState',
          effectId: stack.stateId,
          label: stack.status,
          status: stack.status,
          operation: 'expire',
          stackId: stack.id,
          stackCount: 0,
          maxStacks: 1,
          appliedTick: stack.appliedTick,
          expireTick: stack.expireTick,
          sourceActionKey: stack.sourceActionKey,
          sourceActionLabel: stack.sourceActionLabel,
          sourceId: String(config.apostleId || ''),
          reason: '持続時間終了',
          details: { reference: stack.reference || '' }
        });
        if (triggerRuntimeEventEffectsForStateChange) {
          triggerRuntimeEventEffectsForStateChange({
            key: stack.sourceActionKey,
            label: stack.sourceActionLabel,
            variant: '',
            instanceId: stack.sourceActionInstanceId || `self-state:${stack.id}`,
            runtimeEffectId: stack.sourceRuntimeEffectId || ''
          }, {
            kind: 'selfState',
            operation: 'expire',
            stateId: stack.stateId,
            status: stack.status,
            reference: stack.reference || '',
            sourceId: String(config.apostleId || ''),
            sourceSelf: true,
            stackId: stack.id,
            stackCount: 0,
            maxStacks: 1
          });
        }
      });
    };

    const emitEvent = (owner, event) => {
      // Resource changes belong to the effect's occurrence itself. In particular,
      // a magic-bullet shot consumes one bullet before that shot is evaluated.
      if (event.resourceChange) applyResourceChange(owner, event.resourceChange);
      const baseExpectedDamage = event.type === 'damage'
        ? getEventExpectedDamage(owner, event, damageProfiles)
        : 0;
      const damageEvaluation = event.type === 'damage'
        ? evaluateRuntimeDamage(baseExpectedDamage, owner, event, damageProfiles, state, config)
        : evaluateDamageAtHit({ expectedDamage: 0 });
      const expectedDamage = damageEvaluation.expectedDamage;
      if (event.type === 'damage') {
        hits[owner.key] += Math.max(1, event.hitCount || 1);
        expectedDamageByAction[owner.key] += expectedDamage;
        if (recordDamageSeries) damageSeries.push({
          frame: state.tick / ticksPerFrame,
          expectedDamage,
          type: 'hit',
          actionKey: owner.key,
          generatedObjectId: event.generatedObjectId || ''
        });
        if (expectedDamage > 0 && !damagedActionInstances.has(owner.instanceId)) {
          damagedActionInstances.add(owner.instanceId);
          damagingActions[owner.key] += 1;
        }
      }
      log(event.type === 'damage' ? 'hit' : 'effect', {
        actionKey: owner.key,
        actionLabel: owner.label,
        variant: owner.variant,
        variantLabel: owner.variantLabel || '',
        effectId: event.effectId,
        effectValueKind: event.effectValueKind || '',
        hitCount: event.hitCount || 0,
        expectedDamage,
        statusTakenDmgP: damageEvaluation.statusTakenDmgP,
        damageEvaluation,
        generatedObjectId: event.generatedObjectId || '',
        generatedObjectName: event.generatedObjectName || '',
        generatedInstanceOrder: event.generatedInstanceOrder || null,
        generatedInstanceKey: event.generatedInstanceKey || '',
        generatedEventType: event.generatedEventType || '',
        timingQuality: event.timingQuality,
        note: event.note || ''
      });
      if (event.type === 'damage') {
        triggerDamageBuffEffectsForHit(owner, event.hitCount || 1);
        triggerSpRecoveryEffectsForHit(owner, false, event.hitCount || 1);
        triggerCooldownEffectsForHit(owner, event.hitCount || 1);
      }
      else triggerSpRecoveryEffectsForHit(owner, true);
      if (event.statusApplication) applyStatusApplication(owner, event.statusApplication);
      // Dependent effects start after their source occurrence has completed.
      // This keeps the source hit itself unbuffed while allowing later events,
      // including a later event on the same frame, to observe the new state.
      triggerRuntimeEffectsForSourceEvent(owner, event);
      triggerRuntimeEventEffectsForEvent(owner, event);
    };

    const processStatusTicks = () => {
      state.statusStacks.forEach(stack => {
        if (!(stack.tickMultiplier > 0)) return;
        if (stack.nextTick !== state.tick || state.tick > stack.expireTick) return;
        const profile = statusDamageProfiles[stack.status] || {};
        const resolvedDamage = resolveStatusDamage?.({
          status: stack.status,
          frame: state.tick / ticksPerFrame,
          stackCount: getActiveStatusStacks(stack.status).length,
          sourceActionKey: stack.sourceActionKey,
          profile
        });
        const baseExpectedDamage = Math.max(
          0,
          toFiniteNumber(resolvedDamage?.expectedDamage ?? resolvedDamage, profile.expectedDamage)
        );
        const damageEvaluation = evaluateRuntimeDamage(
          baseExpectedDamage,
          { key: stack.sourceActionKey, variant: '' },
          null,
          damageProfiles,
          state,
          config,
          profile.damageResult?.runtimeBase || null,
          toFiniteNumber(config?.runtimeEffects?.statusDamageWeaknessP)
        );
        const expectedDamage = damageEvaluation.expectedDamage;
        if (stack.sourceRuntimeEffectId) {
          expectedDamageByRuntimeEffect[stack.sourceRuntimeEffectId] =
            toFiniteNumber(expectedDamageByRuntimeEffect[stack.sourceRuntimeEffectId]) + expectedDamage;
        } else if (Object.prototype.hasOwnProperty.call(expectedDamageByAction, stack.sourceActionKey)) {
          expectedDamageByAction[stack.sourceActionKey] += expectedDamage;
        }
        expectedDamageByStatus[stack.status] += expectedDamage;
        const statusSources = expectedDamageByStatusSource[stack.status] || (expectedDamageByStatusSource[stack.status] = {});
        const sourceType = stack.sourceRuntimeEffectId ? 'runtimeEffect' : 'action';
        const sourceId = String(stack.sourceRuntimeEffectId || stack.sourceActionKey || 'unknown');
        const sourceKey = `${sourceType}:${sourceId}`;
        const sourceEntry = statusSources[sourceKey] || {
          sourceType,
          sourceId,
          label: stack.sourceRuntimeEffectLabel || stack.sourceActionLabel || sourceId,
          expectedDamage: 0
        };
        sourceEntry.expectedDamage += expectedDamage;
        statusSources[sourceKey] = sourceEntry;
        if (recordDamageSeries) damageSeries.push({
          frame: state.tick / ticksPerFrame,
          expectedDamage,
          type: 'statusTick',
          status: stack.status,
          actionKey: stack.sourceActionKey
        });
        if (expectedDamage > 0
          && Object.prototype.hasOwnProperty.call(damagingActions, stack.sourceActionKey)
          && !damagedActionInstances.has(stack.sourceActionInstanceId)) {
          damagedActionInstances.add(stack.sourceActionInstanceId);
          damagingActions[stack.sourceActionKey] += 1;
        }
        log('statusTick', {
          actionKey: stack.sourceActionKey,
          actionLabel: stack.sourceActionLabel,
          status: stack.status,
          stackCount: getActiveStatusStacks(stack.status).length,
          expectedDamage,
          statusTakenDmgP: damageEvaluation.statusTakenDmgP,
          statusDamageP: damageEvaluation.statusDamageP,
          damageEvaluation,
          tickMultiplier: stack.tickMultiplier
        });
        stack.nextTick += toTicks(STATUS_TICK_FRAMES, ticksPerFrame);
        scheduleRuntimePeriodicEvent(stack);
      });
    };

    const expireStatuses = () => {
      const expiring = state.statusStacks.filter(stack => stack.expireTick <= state.tick);
      expiring.forEach(stack => { stack.active = false; });
      state.statusStacks = state.statusStacks.filter(stack => stack.expireTick > state.tick);
      expiring.forEach(stack => {
        logEffectStateChange({
          kind: 'debuff',
          effectId: stack.sourceRuntimeEffectId || stack.status,
          label: stack.status,
          status: stack.status,
          operation: 'expire',
          stackId: stack.id,
          stackCount: getActiveStatusStacks(stack.status).length,
          maxStacks: stack.maxStacks,
          appliedTick: stack.appliedTick,
          expireTick: stack.expireTick,
          sourceActionKey: stack.sourceActionKey,
          sourceActionLabel: stack.sourceActionLabel,
          sourceId: stack.sourceId,
          reason: '持続時間終了'
        });
        log('statusExpired', {
          actionKey: stack.sourceActionKey,
          actionLabel: stack.sourceActionLabel,
          status: stack.status,
          stackCount: getActiveStatusStacks(stack.status).length
        });
        if (triggerRuntimeEventEffectsForStateChange) {
          triggerRuntimeEventEffectsForStateChange({
            key: stack.sourceActionKey,
            label: stack.sourceActionLabel,
            variant: '',
            instanceId: stack.sourceActionInstanceId || `status:${stack.id}`,
            runtimeEffectId: stack.sourceRuntimeEffectId || ''
          }, {
            kind: 'status',
            operation: 'expire',
            stateId: stack.applicationEffectId || stack.sourceRuntimeEffectId || stack.status,
            status: stack.status,
            reference: stack.reference || '',
            sourceId: stack.sourceId || '',
            sourceSelf: stack.sourceSelf !== false,
            stackId: stack.id,
            stackCount: 0,
            maxStacks: stack.maxStacks
          });
        }
      });
    };

    const emitDueActionEvents = () => {
      const current = state.currentAction;
      if (!current) return;
      current.events.forEach(event => {
        if (event.emitted || current.startTick + event.relativeTick !== state.tick) return;
        event.emitted = true;
        emitEvent(current, event);
      });
    };

    const emitDueGeneratedEvents = () => {
      const due = [];
      while (true) {
        const next = peekPendingGeneratedEvent();
        if (!next || next.absoluteTick > state.tick) break;
        const pending = popPendingGeneratedEvent();
        if (pending) due.push(pending);
      }
      due.forEach(pending => {
        if (pending.cancelled || pending.event.generatedEventType !== '生成') return;
        if (pending.event.respawnPolicy !== '上書き') return;
        state.pendingGeneratedEvents.forEach(candidate => {
          if (candidate === pending || candidate.emitted) return;
          if (candidate.owner.instanceId === pending.owner.instanceId) return;
          if (candidate.event.generatedObjectId !== pending.event.generatedObjectId) return;
          candidate.cancelled = true;
        });
      });
      due.forEach(pending => {
        if (pending.cancelled || pending.event.generatedEventType !== '生成') return;
        const event = pending.event;
        if (!event.generatedUsesOwnerAttackSpeedAtSpawn) return;
        if (!event.generatedAttackSpeedAffectsRepeatInterval) return;
        const snapshotKey = `${pending.owner.instanceId}:${event.generatedInstanceKey}`;
        if (state.generatedAttackSpeedSnapshots.has(snapshotKey)) return;
        state.generatedAttackSpeedSnapshots.add(snapshotKey);

        const attackSpeedP = getRuntimeAttackSpeedP();
        const intervalScale = Math.max(0.01, 1 + attackSpeedP / 100);
        const templates = state.pendingGeneratedEvents.filter(candidate => (
          !candidate.cancelled
          && candidate.owner.instanceId === pending.owner.instanceId
          && candidate.event.generatedInstanceKey === event.generatedInstanceKey
          && candidate.event.generatedAttackSpeedAffectsRepeatInterval
          && candidate.event.generatedRepeatSeriesKey
          && candidate.event.generatedRepeatIndex === 0
        ));

        templates.forEach(template => {
          state.pendingGeneratedEvents.forEach(candidate => {
            if (candidate === template || candidate.emitted) return;
            if (candidate.owner.instanceId !== pending.owner.instanceId) return;
            if (candidate.event.generatedRepeatSeriesKey !== template.event.generatedRepeatSeriesKey) return;
            if (candidate.event.generatedRepeatIndex > 0) candidate.cancelled = true;
          });

          const baseIntervalFrames = Math.max(
            0,
            toFiniteNumber(template.event.generatedRepeatIntervalFrames)
          );
          if (!(baseIntervalFrames > 0)) return;
          const anchorTick = pending.owner.startTick
            + toTicks(template.event.generatedRepeatAnchorFrame, ticksPerFrame);
          const endTick = Number.isFinite(Number(template.event.generatedEndFrame))
            ? pending.owner.startTick + toTicks(template.event.generatedEndFrame, ticksPerFrame)
            : Infinity;
          const fallbackCount = Math.max(
            1,
            Math.floor(toFiniteNumber(template.event.generatedRepeatCount, 1))
          );
          const safetyLimit = endTick < Infinity ? 10000 : fallbackCount;
          for (let repeat = 1; repeat < safetyLimit; repeat += 1) {
            const relativeFrames = baseIntervalFrames * repeat / intervalScale;
            const absoluteTick = anchorTick + toTicks(relativeFrames, ticksPerFrame);
            if (absoluteTick >= endTick) break;
            if (endTick === Infinity && repeat >= fallbackCount) break;
            scheduleGeneratedEvent({
              absoluteTick,
              owner: pending.owner,
              event: {
                ...template.event,
                frame: template.event.generatedRepeatAnchorFrame + relativeFrames,
                generatedRepeatIndex: repeat,
                generatedAttackSpeedSnapshotP: attackSpeedP
              },
              emitted: false
            });
          }
        });
        log('generatedAttackSpeedSnapshot', {
          actionKey: pending.owner.key,
          actionLabel: pending.owner.label,
          generatedObjectId: event.generatedObjectId || '',
          generatedObjectName: event.generatedObjectName || '',
          generatedInstanceOrder: event.generatedInstanceOrder || null,
          generatedInstanceKey: event.generatedInstanceKey || '',
          attackSpeedP,
          scope: event.generatedAttackSpeedScope || ''
        });
      });
      due.forEach(pending => {
        if (pending.cancelled) return;
        if (pending.emitted || pending.absoluteTick > state.tick) return;
        pending.emitted = true;
        emitEvent(pending.owner, pending.event);
      });
      state.pendingGeneratedEvents = state.pendingGeneratedEvents.filter(pending => !pending.emitted && !pending.cancelled);
    };

    const startAction = (actionKey, selectedVariant = '') => {
      const action = config.actions[actionKey];
      if (!action) return false;
      if (actionKey === 'lowSkill') pauseBaseSpRecovery();
      if (actionKey === 'lowSkill') resetRuntimeEffectsForAction(actionKey);
      const normalAttack = actionKey === 'basicAttack' || actionKey === 'enhancedAttack';
      if (normalAttack) {
        state.normalAttackSequence += 1;
        triggerAttackSpeedEffectsForNormalAttackCount();
      }
      triggerAttackSpeedEffectsForAction(actionKey);
      const variant = selectedVariant || pickVariant(action, state, random);
      const variantLabel = String(action.variantLabels?.[variant] || '').trim();
      const sourceEvents = action.variants[variant] || action.variants.default || [];
      const baseMotionFrames = action.motionFramesByVariant?.[variant] ?? action.motionFrames;
      const motionScale = normalAttack && baseMotionFrames > 0
        ? Math.min(1, getEffectiveNormalAttackIntervalFrames() / baseMotionFrames)
        : 1;
      const motionFrames = baseMotionFrames * motionScale;
      const instanceId = ++state.actionSerial;
      state.currentAction = {
        key: actionKey,
        label: action.label,
        variant: variant === 'default' ? '' : variant,
        variantLabel,
        instanceId,
        startTick: state.tick,
        endTick: state.tick + Math.max(1, toTicks(motionFrames, ticksPerFrame)),
        events: sourceEvents.map(event => ({
          ...event,
          relativeTick: toTicks(event.frame * motionScale, ticksPerFrame),
          emitted: false
        }))
      };
      triggerDamageBuffEffectsForAction(state.currentAction, 'start');
      const generatedSourceEvents = normalizeArray(action.generatedEvents).filter(event => (
        !event.branch || event.branch === '共通' || event.branch === state.currentAction.variant
      ));
      const generatedRuntimeEvents = generatedSourceEvents.map(event => ({
        ...event,
        relativeTick: toTicks(event.frame, ticksPerFrame)
      }));
      const generatedOwner = {
        key: actionKey,
        label: action.label,
        variant: state.currentAction.variant,
        variantLabel: state.currentAction.variantLabel,
        instanceId,
        startTick: state.tick,
        events: generatedRuntimeEvents
      };
      generatedRuntimeEvents.forEach(event => {
        scheduleGeneratedEvent({
          absoluteTick: state.tick + event.relativeTick,
          owner: generatedOwner,
          event,
          emitted: false
        });
      });
      counts[actionKey] += 1;
      if (actionKey === 'basicAttack' || actionKey === 'enhancedAttack') {
        state.lastNormalAttackStartTick = state.tick;
        state.nextNormalAttackTick = state.tick + toTicks(getEffectiveNormalAttackIntervalFrames(), ticksPerFrame);
        scheduleRuntimeStateTimer('nextNormalAttackTick');
      } else if (actionKey === 'lowSkill') {
        state.sp = config.lowSkillSpPolicy === 'consume'
          ? Math.max(0, state.sp - config.requiredSp)
          : 0;
        state.lowSkillQueued = false;
        state.lowSkillReadyTick = null;
        scheduleRuntimeStateTimer('lowSkillReadyTick');
      } else if (actionKey === 'highSkill' && action.cooldownSeconds > 0) {
        setCooldownRemainingTicks(
          'highSkill',
          toTicks(action.cooldownSeconds * recurringHighSkillCooldownMultiplier * framesPerSecond, ticksPerFrame)
        );
      }
      // 高学年自身の発動時効果も、新しく開始したCTへ適用できる順序にする。
      triggerCooldownEffectsForAction(state.currentAction, 'start');
      log('actionStart', {
        actionKey,
        actionLabel: action.label,
        variant: state.currentAction.variant,
        variantLabel: state.currentAction.variantLabel,
        sp: state.sp,
        attackSpeedP: getRuntimeAttackSpeedP(),
        normalAttackIntervalFrames: getEffectiveNormalAttackIntervalFrames(),
        motionScale,
        motionFrames
      });
      triggerSpRecoveryEffectsForAction(state.currentAction, 'start');
      triggerRuntimeEventEffectsForAction(state.currentAction);
      emitDueActionEvents();
      emitDueGeneratedEvents();
      return true;
    };

    const beginSkillTransition = (actionKey, selectedVariant = '') => {
      const action = config.actions[actionKey];
      if (!action) return false;
      if (actionKey === 'lowSkill') pauseBaseSpRecovery();
      const transitionFrames = Math.max(0, toFiniteNumber(action.transitionFrames, 2));
      if (transitionFrames <= 0) return startAction(actionKey, selectedVariant);
      state.skillTransition = {
        actionKey,
        variant: selectedVariant,
        readyTick: state.tick + toTicks(transitionFrames, ticksPerFrame)
      };
      log('skillTransition', {
        actionKey,
        actionLabel: action.label,
        variant: selectedVariant === 'default' ? '' : selectedVariant,
        variantLabel: String(action.variantLabels?.[selectedVariant || 'default'] || '').trim(),
        transitionFrames
      });
      return true;
    };

    const findMovementTransition = (actionKey, selectedVariant = '') => {
      const from = state.lastCompletedAction;
      if (!from) return null;
      const normalizedToBranch = selectedVariant === 'default' ? '' : selectedVariant;
      return normalizeArray(config.movementTransitions)
        .filter(transition => (
          transition.fromActionKey === from.key
          && transition.toActionKey === actionKey
          && (!transition.fromBranch || transition.fromBranch === from.variant)
          && (!transition.toBranch || transition.toBranch === normalizedToBranch)
        ))
        .sort((a, b) => (
          Number(!!b.fromBranch) + Number(!!b.toBranch)
          - Number(!!a.fromBranch) - Number(!!a.toBranch)
        ))[0] || null;
    };

    const beginPreparedAction = (actionKey, selectedVariant = '') => (
      actionKey === 'lowSkill' || actionKey === 'highSkill'
        ? beginSkillTransition(actionKey, selectedVariant)
        : startAction(actionKey, selectedVariant)
    );

    const beginActionPreparation = actionKey => {
      const action = config.actions[actionKey];
      if (!action) return false;
      const selectedVariant = pickVariant(action, state, random);
      const movement = findMovementTransition(actionKey, selectedVariant);
      if (!movement) return beginPreparedAction(actionKey, selectedVariant);
      state.movementTransition = {
        ...movement,
        actionKey,
        actionLabel: action.label,
        variant: selectedVariant,
        startTick: state.tick,
        endTick: state.tick + toTicks(movement.frames, ticksPerFrame)
      };
      log('movementStart', {
        movementId: movement.id,
        fromActionKey: state.lastCompletedAction.key,
        fromActionLabel: state.lastCompletedAction.label,
        fromVariant: state.lastCompletedAction.variant,
        toActionKey: actionKey,
        toActionLabel: action.label,
        toVariant: selectedVariant === 'default' ? '' : selectedVariant,
        toVariantLabel: String(action.variantLabels?.[selectedVariant || 'default'] || '').trim(),
        movementFrames: movement.frames,
        researchStatus: movement.researchStatus,
        note: movement.note
      });
      return true;
    };

    const tryStartNormalAttack = () => {
      if (state.tick < state.nextNormalAttackTick) return false;
      const enhancedAction = config.actions.enhancedAttack;
      const nextNormalAttackSequence = state.normalAttackSequence + 1;
      const enhancedBlocked = normalizeArray(enhancedAction?.blockedBySelfStateIds)
        .some(stateId => isSelfStateActive(stateId));
      const enhanced = !enhancedBlocked && !!enhancedAction && (enhancedAction.triggerStatus
        ? getActiveStatusStacks(enhancedAction.triggerStatus).length > 0
        : (enhancedAction.triggerEveryCount > 0
          ? nextNormalAttackSequence % enhancedAction.triggerEveryCount === 0
          : enhancedAction.triggerProbability > 0 && random() * 100 < enhancedAction.triggerProbability));
      return beginActionPreparation(enhanced ? 'enhancedAttack' : 'basicAttack');
    };

    const tryStartAction = () => {
      if (state.currentAction || state.movementTransition || state.skillTransition) return;
      if (state.tick < state.actionStartAllowedTick) return;
      if (state.lowSkillQueued && state.lowSkillReadyTick < state.tick && beginActionPreparation('lowSkill')) return;
      if (state.lowSkillQueued && state.lowSkillReadyTick === state.tick) {
        if (tryStartNormalAttack()) return;
        if (beginActionPreparation('lowSkill')) return;
      }
      if (highSkillMode === 'auto' && getCooldownRemainingTicks('highSkill') <= 0 && beginActionPreparation('highSkill')) return;
      if (tryStartNormalAttack()) return;
      if (state.lowSkillQueued) beginActionPreparation('lowSkill');
    };

    state.runtimeAttackSpeedEffects.filter(effect => effect.stackCount > 0).forEach(effect => {
      logEffectStateChange({
        kind: 'attackSpeed',
        effectId: effect.id,
        label: effect.label,
        operation: 'apply',
        stackCount: effect.stackCount,
        maxStacks: effect.maxStacks,
        sourceId: effect.sourceId,
        reason: '戦闘開始時',
        details: {
          hastePerStackP: effect.hasteP,
          totalHasteP: getRuntimeAttackSpeedP(),
          durationFrames: effect.durationFrames,
          normalAttackIntervalFrames: getEffectiveNormalAttackIntervalFrames()
        }
      });
      log('attackSpeedInitial', {
        effectId: effect.id,
        sourceId: effect.sourceId,
        label: effect.label,
        stackCount: effect.stackCount,
        hastePerStackP: effect.hasteP,
        totalHasteP: getRuntimeAttackSpeedP(),
        durationFrames: effect.durationFrames,
        normalAttackIntervalFrames: getEffectiveNormalAttackIntervalFrames()
      });
    });
    state.runtimeDamageBuffEffects
      .filter(effect => effect.mode === 'initialTimed' || effect.mode === 'fixed')
      .forEach(effect => {
        const applications = effect.mode === 'fixed' && effect.stackable
          ? Math.min(effect.maxStacks, effect.fixedStacks)
          : 1;
        for (let index = 0; index < applications; index += 1) {
          applyRuntimeDamageBuff(effect, null, effect.mode === 'fixed' ? '固定設定' : '戦闘開始時');
        }
      });
    state.runtimeSpRecoveryEffects
      .filter(effect => effect.mode === 'initial' || effect.mode === 'manualInitial')
      .forEach(effect => applySpRecoveryEffect(
        effect,
        effect.mode === 'manualInitial' ? '手動効果を戦闘開始時に仮適用' : '戦闘開始時'
      ));

    const getNextIdleEventTick = () => {
      const candidates = [durationTicks];
      const add = value => {
        const tick = Number(value);
        if (Number.isFinite(tick) && tick > state.tick) candidates.push(Math.ceil(tick));
      };
      add(state.actionStartAllowedTick);
      add(getNextActionInternalEventTick());
      add(getNextRuntimePeriodicEventTick());
      add(getNextPendingGeneratedEventTick());
      // 外部イベントは通常のランタイム周期キューとは別配列で管理している。
      // ここを候補に含めないと、外部イベントしか残っていない待機区間を
      // fast-forwardIdleTicks が終端まで飛ばし、指定フレームのイベントを
      // processExternalEvents へ渡せない。
      const nextExternalEvent = state.externalEvents[state.externalEventIndex];
      if (nextExternalEvent && !nextExternalEvent.emitted) {
        add(nextExternalEvent.eventTick);
      }
      return Math.min(...candidates);
    };

    const fastForwardIdleTicks = () => {
      if (options.enableFastForward === false) return false;
      const isDue = value => Number.isFinite(Number(value)) && Number(value) <= state.tick;
      const actionPhaseActive = !!(
        state.currentAction
        || state.movementTransition
        || state.skillTransition
      );
      if (isDue(getNextActionInternalEventTick())
        || (!actionPhaseActive && isDue(state.nextNormalAttackTick))
        || (!actionPhaseActive && state.lowSkillQueued && isDue(state.lowSkillReadyTick))
        || (!actionPhaseActive && highSkillMode === 'auto' && getCooldownRemainingTicks('highSkill') <= 0)
        || isDue(getNextRuntimePeriodicEventTick())
        || isDue(getNextPendingGeneratedEventTick())) {
        return false;
      }
      const nextTick = getNextIdleEventTick();
      const skippedTicks = nextTick - state.tick - 1;
      if (skippedTicks <= 0) return false;
      state.tick = nextTick - 1;
      if (config.spRegen > 0) {
        state.spRecoveryRemainingTicks = Math.max(1, state.spRecoveryNextTick - state.tick);
        scheduleRuntimeStateTimer('spRecoveryNextTick');
      }
      fastForwardCount += 1;
      fastForwardedTickCount += skippedTicks;
      return true;
    };

    for (state.tick = 0; state.tick <= durationTicks; state.tick += 1) {
      processedTickCount += 1;
      if (fastForwardIdleTicks()) continue;
      expireAttackSpeedEffects();
      processRuntimeAttackSpeedStacks();
      expireRuntimeBuffs();
      expireSelfStates();
      processExternalEvents();
      const pausesSpRecovery = state.currentAction?.key === 'lowSkill'
        || state.skillTransition?.actionKey === 'lowSkill';
      if (state.tick > 0 && !pausesSpRecovery && config.spRegen > 0) {
        state.spRecoveryRemainingTicks = Math.max(0, state.spRecoveryNextTick - state.tick);
      }
      if (state.tick > 0 && state.spRecoveryNextTick <= state.tick && config.spRegen > 0) {
        state.spRecoveryNextTick = state.tick + spTickInterval;
        state.spRecoveryRemainingTicks = spTickInterval;
        scheduleRuntimeStateTimer('spRecoveryNextTick');
        const before = state.sp;
        state.sp = Math.min(config.maxSp, state.sp + config.spRegen);
        log('spRecovery', {
          amount: state.sp - before,
          sp: state.sp,
          capped: state.sp === before
        });
        queueLowSkillIfReady();
      }
      processPeriodicSpRecoveryEffects();
      processPeriodicRuntimeEventEffects();
      processStatusTicks();
      emitDueActionEvents();
      emitDueGeneratedEvents();
      expireStatuses();
      if (state.currentAction && state.currentAction.endTick === state.tick) {
        const finished = state.currentAction;
        log('actionEnd', { actionKey: finished.key, actionLabel: finished.label, variant: finished.variant, variantLabel: finished.variantLabel });
        triggerRuntimeEventEffectsForAction(finished, 'end');
        triggerSpRecoveryEffectsForAction(finished, 'end');
        state.currentAction = null;
        state.lastCompletedAction = {
          key: finished.key,
          label: finished.label,
          variant: finished.variant,
          variantLabel: finished.variantLabel
        };
        triggerAttackSpeedEffectsForAction(finished.key, 'end');
        triggerDamageBuffEffectsForAction(finished, 'end');
        triggerCooldownEffectsForAction(finished, 'end');
        if (finished.key === 'lowSkill') {
          state.nextNormalAttackTick = state.tick;
          scheduleRuntimeStateTimer('nextNormalAttackTick');
          resumeBaseSpRecovery();
        }
      }
      if (state.movementTransition && state.movementTransition.endTick === state.tick) {
        const movement = state.movementTransition;
        state.movementTransition = null;
        log('movementEnd', {
          movementId: movement.id,
          fromActionKey: movement.fromActionKey,
          toActionKey: movement.actionKey,
          toActionLabel: movement.actionLabel,
          toVariant: movement.variant === 'default' ? '' : movement.variant,
          movementFrames: movement.frames
        });
        beginPreparedAction(movement.actionKey, movement.variant);
      }
      if (state.skillTransition && state.skillTransition.readyTick === state.tick) {
        const actionKey = state.skillTransition.actionKey;
        const selectedVariant = state.skillTransition.variant;
        state.skillTransition = null;
        startAction(actionKey, selectedVariant);
      }
      tryStartAction();
    }

    const simulationFinishedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    const publicTimeline = createDpsPublicTimeline(timeline);
    return {
      durationSeconds,
      formationTimelineMode,
      durationFrames: durationTicks / ticksPerFrame,
      initialActionDelayFrames,
      counts,
      hits,
      damagingActions,
      damage: {
        totalExpectedDamage: [expectedDamageByAction, expectedDamageByRuntimeEffect]
          .reduce((total, group) => total + Object.values(group).reduce((sum, value) => sum + value, 0), 0),
        byAction: expectedDamageByAction,
        byStatus: expectedDamageByStatus,
        byStatusSource: expectedDamageByStatusSource,
        byRuntimeEffect: expectedDamageByRuntimeEffect
      },
      damageSeries,
      performance: {
        elapsedMs: Math.max(0, simulationFinishedAt - simulationStartedAt),
        durationTicks,
        processedTickCount,
        skippedTickCount: fastForwardedTickCount,
        fastForwardCount,
        generatedEventScheduleCount,
        fastForwardEnabled: options.enableFastForward !== false
      },
      timelineStats: {
        recorded: timeline.length,
        total: timelineEventCount,
        omitted: timelineOmittedCount,
        max: Math.max(100, toFiniteNumber(options.maxTimelineEvents, 2000))
      },
      publicTimeline,
      publicTimelineStats: {
        recorded: publicTimeline.length,
        total: publicTimeline.length + timelineOmittedCount,
        omitted: timelineOmittedCount,
        max: Math.max(100, toFiniteNumber(options.maxTimelineEvents, 2000)),
        rawRecorded: timeline.length,
        rawTotal: timelineEventCount,
        rawOmitted: timelineOmittedCount
      },
      runtimeEffects: {
        attackSpeedP: getRuntimeAttackSpeedP(),
        attackSpeedEffects: state.runtimeAttackSpeedEffects.map(effect => ({
          id: effect.id,
          label: effect.label,
          mode: effect.mode,
          stackCount: effect.stackCount,
          maxStacks: effect.maxStacks,
          hastePerStackP: effect.hasteP,
          durationFrames: effect.durationFrames
        })),
        spRegen: config.spRegen,
        spRegenEffects: normalizeArray(config.runtimeEffects?.spRegenEffects).map(effect => ({
          id: effect.id,
          label: effect.label,
          fixed: effect.fixed,
          percent: effect.percent
        })),
        spRecoveryEffects: state.runtimeSpRecoveryEffects.map(effect => ({
          id: effect.id,
          label: effect.label,
          mode: effect.mode,
          triggerCount: effect.triggerCount,
          intervalFrames: effect.intervalFrames
        })),
        cooldownEffects: state.runtimeCooldownEffects.map(effect => ({
          id: effect.id,
          label: effect.label,
          mode: effect.mode,
          targetActionKey: effect.targetActionKey,
          operation: effect.operation,
          amountFrames: effect.amountFrames,
          multiplier: effect.multiplier,
          triggerCount: effect.triggerCount
        })),
        damageBuffEffects: state.runtimeDamageBuffEffects.map(effect => ({
          id: effect.id,
          label: effect.label,
          mode: effect.mode,
          triggerActionKeys: effect.triggerActionKeys,
          triggerPhase: effect.triggerPhase,
          triggerEveryCount: effect.triggerEveryCount,
          triggerCount: effect.triggerCount,
          durationFrames: effect.durationFrames,
          stackable: effect.stackable,
          maxStacks: effect.maxStacks,
          modifiers: { ...effect.modifiers }
        })),
        eventEffects: state.runtimeEventEffects.map(effect => ({
          id: effect.id,
          label: effect.label,
          triggerType: effect.triggerType,
          triggerProbability: effect.triggerProbability,
          triggerSourceId: effect.triggerSourceId,
          effectIds: [...normalizeArray(effect.effectIds)],
          triggerCount: runtimeEffectTriggerCounts[effect.id] || 0,
          occurrenceCount: effect.occurrenceCount,
          triggerEveryCount: effect.triggerEveryCount,
          intervalFrames: effect.intervalFrames
        })),
        statusReactions: normalizeArray(config.runtimeEffects?.statusReactions).map(reaction => ({
          id: reaction.id,
          label: reaction.label,
          status: reaction.status,
          takenDmgP: reaction.takenDmgP,
          perStack: reaction.perStack
        }))
      },
      timeline,
      finalState: {
        sp: state.sp,
        spRecoveryRemainingFrames: state.spRecoveryRemainingTicks / ticksPerFrame,
        lowSkillQueued: state.lowSkillQueued,
        movementTransition: state.movementTransition ? { ...state.movementTransition } : null,
        skillTransition: state.skillTransition ? { ...state.skillTransition } : null,
        lastCompletedAction: state.lastCompletedAction ? { ...state.lastCompletedAction } : null,
        cooldowns: Object.fromEntries(Object.entries(state.cooldowns).map(([actionKey, cooldown]) => [
          actionKey,
          {
            ready: getCooldownRemainingTicks(actionKey) <= 0,
            remainingFrames: Number.isFinite(cooldown.readyTick)
              ? getCooldownRemainingTicks(actionKey) / ticksPerFrame
              : null
          }
        ])),
        normalAttackSequence: state.normalAttackSequence,
        activeStatuses: Object.fromEntries(Array.from(trackedStatuses).map(status => [
          status,
          getActiveStatusStacks(status).length
        ])),
        resources: Object.fromEntries(Object.entries(state.runtimeResources).map(([id, resource]) => [id, resource.stacks])),
        runtimeBuffs: state.runtimeBuffStacks.map(stack => ({
          effectId: stack.effectId,
          label: stack.label,
          attackP: stack.attackP,
          modifiers: { ...(stack.modifiers || {}) },
          remainingFrames: Math.max(0, (stack.expireTick - state.tick) / ticksPerFrame)
        })),
        lastSkillVariant: state.lastSkillVariant
      },
      warnings: normalizeArray(config.warnings)
    };
  }

  function simulateMany(config, options = {}) {
    const aggregateStartedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    const requestedTrials = Math.max(1, Math.min(4096, Math.floor(toFiniteNumber(options.trials, 64))));
    // DPS比較では、UIの「統計試行数」をそのまま実行回数にできるようにする。
    // 既存画面の収束短縮・決定的条件の最適化は exactTrials 未指定時だけ維持する。
    const exactTrials = options.exactTrials === true;
    const deterministic = !hasSimulationRandomness(config);
    const adaptiveMinTrials = Math.max(2, Math.min(requestedTrials, Math.floor(toFiniteNumber(options.adaptiveMinTrials, 16))));
    const adaptiveEnabled = !exactTrials
      && !deterministic
      && options.adaptiveTrials === true
      && requestedTrials >= adaptiveMinTrials;
    const targetTrials = exactTrials ? requestedTrials : (deterministic ? 1 : requestedTrials);
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
    const progressStep = Math.max(1, Math.ceil(targetTrials / 32));
    const baseSeed = Math.max(1, Math.floor(toFiniteNumber(options.seed, 1)));
    const durationSeconds = Math.max(1, Math.min(600, toFiniteNumber(options.durationSeconds, 60)));
    const actionKeys = Object.keys(ACTION_SKILL_TYPES);
    const statusKeys = Object.keys(DOT_STATUS_MULTIPLIERS);
    const runtimeEventEffects = normalizeArray(config.runtimeEffects?.eventEffects);
    const runtimeEventEffectIds = runtimeEventEffects.map(effect => effect.id);
    const totals = {
      damage: 0,
      counts: Object.fromEntries(actionKeys.map(key => [key, 0])),
      hits: Object.fromEntries(actionKeys.map(key => [key, 0])),
      damagingActions: Object.fromEntries(actionKeys.map(key => [key, 0])),
      damageByAction: Object.fromEntries(actionKeys.map(key => [key, 0])),
      damageByStatus: Object.fromEntries(statusKeys.map(status => [status, 0])),
      damageByStatusSource: Object.fromEntries(statusKeys.map(status => [status, {}])),
      damageByRuntimeEffect: Object.fromEntries(runtimeEventEffectIds.map(id => [id, 0])),
      runtimeEffectTriggers: Object.fromEntries(runtimeEventEffectIds.map(id => [id, 0]))
    };
    const trialResults = [];
    let totalSimulationElapsedMs = 0;
    let totalProcessedTickCount = 0;
    let totalSkippedTickCount = 0;
    let adaptiveStopped = false;
    for (let index = 0; index < targetTrials; index += 1) {
      const seed = baseSeed + index;
      const result = simulate(config, {
        ...options,
        seed,
        durationSeconds,
        recordTimeline: false
      });
      const totalDamage = toFiniteNumber(result.damage?.totalExpectedDamage);
      totalSimulationElapsedMs += toFiniteNumber(result.performance?.elapsedMs);
      totalProcessedTickCount += toFiniteNumber(result.performance?.processedTickCount);
      totalSkippedTickCount += toFiniteNumber(result.performance?.skippedTickCount);
      const totalDps = totalDamage / durationSeconds;
      totals.damage += totalDamage;
      actionKeys.forEach(key => {
        totals.counts[key] += toFiniteNumber(result.counts?.[key]);
        totals.hits[key] += toFiniteNumber(result.hits?.[key]);
        totals.damagingActions[key] += toFiniteNumber(result.damagingActions?.[key]);
        totals.damageByAction[key] += toFiniteNumber(result.damage?.byAction?.[key]);
      });
      statusKeys.forEach(status => {
        totals.damageByStatus[status] += toFiniteNumber(result.damage?.byStatus?.[status]);
        Object.entries(result.damage?.byStatusSource?.[status] || {}).forEach(([sourceKey, source]) => {
          const totalSource = totals.damageByStatusSource[status][sourceKey] || {
            sourceType: source.sourceType || '',
            sourceId: source.sourceId || '',
            label: source.label || source.sourceId || sourceKey,
            expectedDamage: 0
          };
          totalSource.expectedDamage += toFiniteNumber(source.expectedDamage);
          totals.damageByStatusSource[status][sourceKey] = totalSource;
        });
      });
      runtimeEventEffects.forEach(effect => {
        totals.damageByRuntimeEffect[effect.id] = toFiniteNumber(totals.damageByRuntimeEffect[effect.id])
          + toFiniteNumber(result.damage?.byRuntimeEffect?.[effect.id]);
        const runtimeResult = normalizeArray(result.runtimeEffects?.eventEffects)
          .find(item => item.id === effect.id);
        totals.runtimeEffectTriggers[effect.id] = toFiniteNumber(totals.runtimeEffectTriggers[effect.id])
          + toFiniteNumber(runtimeResult?.triggerCount);
      });
      trialResults.push({ seed, totalDps });
      if (adaptiveEnabled && trialResults.length >= adaptiveMinTrials && trialResults.length % 4 === 0) {
        const values = trialResults.map(item => item.totalDps);
        const sampleMean = values.reduce((sum, value) => sum + value, 0) / values.length;
        const variance = values.length > 1
          ? values.reduce((sum, value) => sum + ((value - sampleMean) ** 2), 0) / (values.length - 1)
          : Infinity;
        const halfWidth = 1.96 * Math.sqrt(variance / values.length);
        const relativeThreshold = Math.max(Math.abs(sampleMean), 1) * (
          Math.max(0.001, toFiniteNumber(options.adaptiveRelativeErrorP, 0.2)) / 100
        );
        if (halfWidth <= relativeThreshold) {
          adaptiveStopped = true;
        }
      }
      if (onProgress && ((index + 1) % progressStep === 0 || index + 1 === targetTrials || adaptiveStopped)) {
        onProgress({
          completed: index + 1,
          total: targetTrials,
          requestedTotal: requestedTrials,
          deterministic,
          adaptiveStopped
        });
      }
      if (adaptiveStopped) break;
    }
    const evaluatedTrials = trialResults.length;
    const totalDpsValues = trialResults.map(item => item.totalDps);
    const meanDps = totals.damage / evaluatedTrials / durationSeconds;
    const byAction = Object.fromEntries(actionKeys.map(key => {
      const expectedDamage = totals.damageByAction[key] / evaluatedTrials;
      const contributionDps = expectedDamage / durationSeconds;
      return [key, {
        expectedDamage,
        contributionDps,
        damageShareP: totals.damage > 0 ? totals.damageByAction[key] / totals.damage * 100 : 0,
        averageStarts: totals.counts[key] / evaluatedTrials,
        averageDamagingActions: totals.damagingActions[key] / evaluatedTrials,
        averageHits: totals.hits[key] / evaluatedTrials,
        averageDamagePerDamagingAction: totals.damagingActions[key] > 0 ? totals.damageByAction[key] / totals.damagingActions[key] : 0
      }];
    }));
    const medianDps = percentile(totalDpsValues, 0.5);
    const byStatus = Object.fromEntries(statusKeys.map(status => {
      const expectedDamage = totals.damageByStatus[status] / evaluatedTrials;
      return [status, {
        expectedDamage,
        contributionDps: expectedDamage / durationSeconds,
        damageShareP: totals.damage > 0 ? totals.damageByStatus[status] / totals.damage * 100 : 0,
        sources: Object.values(totals.damageByStatusSource[status] || {})
          .map(source => {
            const sourceExpectedDamage = toFiniteNumber(source.expectedDamage) / evaluatedTrials;
            return {
              sourceType: source.sourceType || '',
              sourceId: source.sourceId || '',
              label: source.label || source.sourceId || '',
              expectedDamage: sourceExpectedDamage,
              contributionDps: sourceExpectedDamage / durationSeconds
            };
          })
          .filter(source => source.expectedDamage > 0)
          .sort((a, b) => b.expectedDamage - a.expectedDamage)
      }];
    }));
    const byRuntimeEffect = Object.fromEntries(runtimeEventEffects
      .map(effect => {
        const expectedDamage = toFiniteNumber(totals.damageByRuntimeEffect[effect.id]) / evaluatedTrials;
        const averageTriggers = toFiniteNumber(totals.runtimeEffectTriggers[effect.id]) / evaluatedTrials;
        return [effect.id, {
          id: effect.id,
          label: effect.label,
          triggerType: effect.triggerType,
          expectedDamage,
          contributionDps: expectedDamage / durationSeconds,
          damageShareP: totals.damage > 0 ? totals.damageByRuntimeEffect[effect.id] / totals.damage * 100 : 0,
          averageTriggers,
          averageDamagePerTrigger: averageTriggers > 0 ? expectedDamage / averageTriggers : 0
        }];
      }));
    const representative = trialResults.reduce((best, item) => (
      !best || Math.abs(item.totalDps - medianDps) < Math.abs(best.totalDps - medianDps) ? item : best
    ), null);
    const aggregateFinishedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    return {
      trials: requestedTrials,
      evaluatedTrials,
      trialSeeds: trialResults.map(item => item.seed),
      deterministic,
      exactTrials,
      adaptiveStopped,
      baseSeed,
      durationSeconds,
      performance: {
        elapsedMs: Math.max(0, aggregateFinishedAt - aggregateStartedAt),
        simulationElapsedMs: totalSimulationElapsedMs,
        averageSimulationMs: evaluatedTrials > 0 ? totalSimulationElapsedMs / evaluatedTrials : 0,
        processedTickCount: totalProcessedTickCount,
        skippedTickCount: totalSkippedTickCount,
        averageProcessedTickCount: evaluatedTrials > 0 ? totalProcessedTickCount / evaluatedTrials : 0,
        averageSkippedTickCount: evaluatedTrials > 0 ? totalSkippedTickCount / evaluatedTrials : 0
      },
      meanDps,
      totalExpectedDamage: totals.damage / evaluatedTrials,
      range: {
        p10: percentile(totalDpsValues, 0.1),
        median: medianDps,
        p90: percentile(totalDpsValues, 0.9)
      },
      representativeSeed: representative?.seed || baseSeed,
      byAction,
      byStatus,
      byRuntimeEffect
    };
  }

  function hasSimulationRandomness(config = {}) {
    const actions = Object.values(config.actions || {});
    if (actions.some(action => (
      Number(action?.triggerProbability) > 0
      || (['random', 'weighted'].includes(action?.variantSelection?.type)
        && normalizeArray(action.variantNames).length > 1)
    ))) return true;
    const effects = [
      ...normalizeArray(config.runtimeEffects?.eventEffects),
      ...normalizeArray(config.runtimeEffects?.damageBuffEffects),
      ...normalizeArray(config.runtimeEffects?.spRecoveryEffects)
    ];
    return effects.some(effect => (
      effect?.random === true
      || effect?.randomBound === 'range'
      || (Number.isFinite(Number(effect?.triggerProbability))
        && Number(effect.triggerProbability) > 0
        && Number(effect.triggerProbability) < 100)
    ));
  }

  return Object.freeze({
    version: 20,
    buildCombatantConfig,
    createActionSkillOverride,
    createSeededRandom,
    evaluateDamageAtHit,
    simulate,
    simulateMany,
    createDpsPublicTimeline,
    selectEnemySizeVariantBranch,
    toTicks
  });
});
