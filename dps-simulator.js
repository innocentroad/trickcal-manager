(function (root, factory) {
  'use strict';

  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_DPS_SIMULATOR = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_TICKS_PER_FRAME = 10;
  const DEFAULT_FRAMES_PER_SECOND = 60;
  const TIG_HERO_HP_WARNING = 'ティグの使徒相手への最大HP追加ダメージは未計上です。攻撃力由来のダメージだけで暫定比較します。';
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

  function normalizeResolvedSpRecoveryFactors(effect) {
    if (effect?.resolvedRecoveryFactors === undefined) return undefined;
    const factors = effect.resolvedRecoveryFactors;
    if (!factors || typeof factors !== 'object' || Array.isArray(factors)
      || typeof factors.owner !== 'number' || !Number.isFinite(factors.owner)
      || typeof factors.recipient !== 'number' || !Number.isFinite(factors.recipient)) {
      throw new RangeError('SP回復の供給側・受取側の確定係数が不足または不正です');
    }
    if (effect.amountModifierP !== undefined && (typeof effect.amountModifierP !== 'number'
      || !Number.isFinite(effect.amountModifierP) || effect.amountModifierP !== 0)) {
      throw new RangeError('SP回復の確定係数と旧回復量補正を重複指定できません');
    }
                                                                          
                                                                          
    return { owner: Math.max(0, factors.owner), recipient: Math.max(0, factors.recipient) };
  }

  function toTicks(frames, ticksPerFrame = DEFAULT_TICKS_PER_FRAME) {
                                                                           
                                                                                  
    const scaled = toFiniteNumber(frames) * ticksPerFrame;
    const nearest = Math.round(scaled);
                                                                            
                                                                               
    const exactTick = Math.abs(scaled - nearest) <= Number.EPSILON * 8 * Math.max(1, Math.abs(scaled));
    return Math.max(0, exactTick ? nearest : Math.ceil(scaled));
  }

  function createSeededRandom(seed = 1) {
    let state = (Math.floor(toFiniteNumber(seed, 1)) >>> 0) || 1;
                                                                           
                                                                          
                                                                        
    state = Math.imul(state ^ (state >>> 16), 0x85ebca6b);
    state = Math.imul(state ^ (state >>> 13), 0xc2b2ae35);
    state = (state ^ (state >>> 16)) >>> 0;
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
    if (/^(?:途中|暫定|解析|仮定|未調査|未|要調査)$/.test(value)) return 'provisional';
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
    'attackSpeedReset',
    'accelerationApplied',
    'accelerationExpired'
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
      attackSpeedReset: ['attackSpeed'],
      accelerationApplied: ['acceleration'],
      accelerationExpired: ['acceleration']
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
                                          
                                            
      return !hasMultipleActions;
    });
                                                                              
                                                                            
                                                                              
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
                                                                            
                                                                       
    const ristyCounter = skill.skillId === 'Risty_favorite_1' && actionKey === 'enhancedAttack'
      ? effects.find(effect => effect.effectId === 'Risty_favorite_1_e03'
        && effect.triggerType === 'n回ごと' && Number(effect.triggerValue) > 0) : null;
    return {
      ...JSON.parse(JSON.stringify(skill || {})),
      ...metadata,
      ...(ristyCounter ? {triggerType: ristyCounter.triggerType, triggerValue: Number(ristyCounter.triggerValue)} : {}),
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

  function resolveImplicitTimedSpEffectId(skill, row = {}) {
    if (row.effectId || row.effectKind !== 'SP回復') return '';
                                                                             
                                                                           
                                                                             
    const candidates = normalizeArray(skill?.effects).filter(effect => (
      ['SP回復', 'SP全回復', '持続SP回復'].includes(effect.valueKind)
      && ['固定値', '倍率'].includes(effect.valueClass)
      && effect.effectId
    ));
    return candidates.length === 1 ? String(candidates[0].effectId) : '';
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
      || Object.values(apostle?.aside?.levels || {})
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

  const SNORKY_REPEAT_EFFECT_IDS = Object.freeze({
    initialProbability: 'Snorky_enhanced_e02',
    decrementPoints: 'Snorky_enhanced_e03'
  });

  function resolveSnorkyRepeatPolicy(apostle, effectiveSkill, baseSkill, skillLevel = 1, warnings = []) {
    if (String(apostle?.id || '').trim().toLowerCase() !== 'snorky') return null;
                                      
                                           
    const effectSources = effectiveSkill === baseSkill
      ? [effectiveSkill]
      : [effectiveSkill, baseSkill];
    const invalid = reason => {
      warnings.push(`スノキー強化攻撃の連続発動を無効化しました: ${reason}`);
      return null;
    };
    const byId = new Map();
    effectSources.flatMap(skill => normalizeArray(skill?.effects))
      .forEach(effect => {
        const effectId = String(effect?.effectId || '').trim();
        if (effectId && !byId.has(effectId)) byId.set(effectId, effect);
      });
    for (const effectId of Object.values(SNORKY_REPEAT_EFFECT_IDS)) {
      const matches = effectSources.flatMap(skill => normalizeArray(skill?.effects))
        .filter(effect => String(effect?.effectId || '').trim() === effectId);
      if (matches.length > 1) return invalid(`効果ID ${effectId} が重複しています`);
    }
    const initial = byId.get(SNORKY_REPEAT_EFFECT_IDS.initialProbability);
    const decrement = byId.get(SNORKY_REPEAT_EFFECT_IDS.decrementPoints);
    if (!initial && !decrement) return null;
    if (!initial || !decrement) return invalid('確率と減少値の2行セットが揃っていません');
    const rows = [initial, decrement];
    if (rows.some(effect => String(effect?.valueClass || '').trim() !== '倍率')) {
      return invalid('値分類が倍率ではありません');
    }
    if (String(initial.valueKind || '').trim() !== '連続発動確率'
      || String(decrement.valueKind || '').trim() !== '連続発動確率減少') {
      return invalid('専用の値種類が一致しません');
    }
    if (rows.some(effect => String(effect?.effectType || '').trim() !== '攻撃'
      || String(effect?.effectTarget || '').trim() !== '自身'
      || String(effect?.triggerType || '').trim() !== '強化攻撃終了時'
      || String(effect?.triggerSourceId || '').trim() !== '強化攻撃'
      || String(effect?.targetSkill || '').trim() !== '普通攻撃_強化'
      || effect?.effectStack === true)) {
      return invalid('発動条件・対象・対象スキルが設計契約と一致しません');
    }
    const groupId = String(initial.processGroupId || '').trim();
    if (!groupId || groupId !== String(decrement.processGroupId || '').trim()
      || Number(initial.processOrder) !== 1 || Number(decrement.processOrder) !== 2) {
      return invalid('処理グループまたは処理順が不正です');
    }
    const initialProbabilityP = resolveEffectValue(initial, skillLevel);
    const decrementPoints = resolveEffectValue(decrement, skillLevel);
    if (!Number.isFinite(initialProbabilityP) || initialProbabilityP < 0 || initialProbabilityP > 100) {
      return invalid('初回確率が0〜100の有限値ではありません');
    }
    if (!Number.isFinite(decrementPoints) || decrementPoints <= 0) {
      return invalid('減少ポイントが正の有限値ではありません');
    }
    const maxActions = 1 + Math.ceil(initialProbabilityP / decrementPoints);
    if (!Number.isFinite(maxActions) || maxActions > 100) {
      return invalid('連続回数の安全上限100回を超えます');
    }
    return {
      initialProbabilityP,
      decrementPoints,
      sourceEffectIds: [initial.effectId, decrement.effectId],
      estimated: true,
      maxActions
    };
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

                                                                            
                                                                             
                                                                               
                                                                          
      if (normalizeScenarioId(apostle?.id) === 'pira') return;
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
    const halfDefense = def * 0.5;
    const z = ((atk - halfDefense) / (halfDefense === 0 ? 1 : halfDefense)) * 100;
    const percent = z < 0 ? 60 + z * 78 / (60 - z) : 60 + z * 60 / (z + 60);
    return Math.max(Math.fround(0.05), Math.min(1.5, percent * 0.01));
  }

  function calcRuntimeCritRate(crit, critRes) {
    const z = ((crit - critRes) / (critRes === 0 ? 1 : critRes)) * 100;
                                                                             
                                                         
    return Math.fround(0.3) + (z < 0 ? z * 0.5 / (100 - z) : z * 0.5 / (z + 300));
  }

  function calcRuntimeCritMultiplier(critDmg, critDmgRes) {
    const z = ((critDmg - critDmgRes) / (critDmgRes === 0 ? 1 : critDmgRes)) * 100;
    return 1 + (0.75 + (z < 0
      ? z * Math.fround(1.1) / (100 - z)
      : z * Math.fround(0.85) / (z + 300)));
  }

  function clampCombatCritRate(value) {
    return Math.max(Math.fround(0.05), Math.min(0.75, value));
  }

  function clampCombatCritMultiplier(value) {
    return 1 + Math.max(Math.fround(0.2), Math.min(1.5, value - 1));
  }

  function resolveCombatStat(base, percent = 0, minimum = 0) {
    return Math.max(minimum, roundDamageRateToEven(base * (1 + percent / 100)));
  }

  function resolveAttackSpeed(base, percent = 0, fixed = 0) {
    return Math.max(base * Math.fround(0.2), Math.min(base * 10,
      roundDamageRateToEven((base + fixed) * (1 + percent / 100))));
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
      if (!isTimedRuntimeBuffConditionActive(state, stack, actionKey)) return;
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

                                                                            
                                                                          
                                                                          
  function isTimedRuntimeBuffConditionActive(state, stack, actionKey = state?.currentAction?.key || '') {
    if (normalizeArray(stack.applyActionKeys).length && !stack.applyActionKeys.includes(actionKey)) return false;
    return !stack.requiredStatus || isRuntimeStatusConditionActive(state, {
      mode:'conditionalStatus', requiredStatus:stack.requiredStatus,
      requireSelfSource:stack.requireSelfSource
    });
  }

  function resolveNativeStatusCoefficientSelection(state, selection) {
    const kinds = selection?.statusKinds;
    const multipliers = selection?.multipliers;
    if (!Array.isArray(kinds) || !kinds.length || kinds.some(kind => typeof kind !== 'string' || !kind)
      || new Set(kinds).size !== kinds.length || !Array.isArray(multipliers)
      || multipliers.length !== kinds.length + 1
      || multipliers.some(value => typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
      || !Number.isFinite(state?.tick)) {
      throw new RangeError('状態種類数による係数選択の入力が不正です');
    }
    const kindCount = kinds.filter(kind => normalizeArray(state.statusStacks).some(stack =>
      stack.status === kind && stack.active !== false && state.tick < stack.expireTick)).length;
    return { kindCount, multiplier: Math.fround(multipliers[kindCount]) };
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
                                                                              
                                                                           
        && getStatusName(effect?.valueKind) === status
        && getBranchName(effect) === branch
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
                                            
                                       
      const stackable = application.effectStack === true
        || durationEffect?.effectStack === true
        || declaredMaxStacks > 1;
      const maxStacks = stackable
        ? Math.max(1, declaredMaxStacks || DEFAULT_STATUS_MAX_STACKS)
        : 1;
      const explicitGroup = application.stackGroupId
        || durationEffect?.stackGroupId
        || '';
                                                                               
                                                                                
                                                                             
      const mayoPoison = status === '毒' && stackable && maxStacks === 9
        && ({Mayo_enhanced:'Mayo_enhanced_e02',Mayo_low:'Mayo_low_e03',Mayo_high:'Mayo_high_e03'}[skill?.skillId]
          === application.effectId);
                                                                         
                                                                               
      const patulaPoison = status === '毒' && stackable && maxStacks === 9
        && skill?.skillId === 'Patula_low' && application.effectId === 'Patula_low_e02';
                                                                         
                                                                              
      const dayaBleed = status === '苦痛' && stackable && maxStacks === 9
        && ({Daya_low:'Daya_low_e02',Daya_enhanced:'Daya_enhanced_e02'}[skill?.skillId]
          === application.effectId);
      const blanchetBleed = status === '苦痛' && stackable && maxStacks === 9
        && skill?.skillId === 'Blanchet_enhanced' && application.effectId === 'Blanchet_enhanced_e02';
                                                                     
                                                                            
      const rollettBurn = status === '火傷' && stackable && maxStacks === 9
        && skill?.skillId === 'Rollett_enhanced' && application.effectId === 'Rollett_enhanced_e02';
                                                                  
                                                                        
      const ashurBurn = status === '火傷' && stackable && maxStacks === 9
        && ({Ashur_basic:'Ashur_basic_e02', Ashur_enhanced:'Ashur_enhanced_e04'}[skill?.skillId]
          === application.effectId);
                                                                       
                                                                            
      const aliceBurn = status === '火傷' && stackable && maxStacks === 9
        && ({Alice_low:'Alice_low_e06', Alice_high:'Alice_high_e06'}[skill?.skillId]
          === application.effectId);
      return {
        status,
        branch,
        applicationEffectId: application.effectId || '',
        ...(skill?.skillId === 'Amelia_high' && application.effectId === 'Amelia_high_e03'
          && status === '気絶' && application.conditionType === '対象状態'
          && application.conditionValue === '感電' ? { requiredTargetStatus: '感電' } : {}),
        reference: application.reference || '',
        durationEffectId: durationEffect?.effectId || '',
        durationFrames: durationSeconds > 0 ? durationSeconds * DEFAULT_FRAMES_PER_SECOND : null,
        stackable,
        maxStacks,
        stackOverflowPolicy: mayoPoison || patulaPoison || dayaBleed || blanchetBleed || rollettBurn || ashurBurn || aliceBurn ? 'reject' : 'replaceOldest',
                                                     
                                          
                                
        stackGroupId: explicitGroup || (rollettBurn ? 'Rollett:burn:stack:9'
          : aliceBurn ? 'Alice:burn:stack:9'
          : ashurBurn ? `${skill.skillId}:burn:stack:9`
          : blanchetBleed ? 'Blanchet:enhanced:bleed:stack:9'
          : dayaBleed ? `${skill.skillId}:bleed:stack:9`
          : mayoPoison ? 'Mayo:poison:stack:9'
          : patulaPoison ? 'Patula:poison:stack:9'
          : `${status}:${stackable ? 'stack' : 'single'}:${maxStacks}`),
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

  function resolveNativeCoefficient(value, integerSource = false) {
    const integer = Math.round(value);
                                                                             
                                                                              
                                                                
    return integerSource && Number.isSafeInteger(integer)
      && Math.abs(value - integer) <= Number.EPSILON * 64 * Math.max(1, Math.abs(value)) ? integer : value;
  }

  function resolveRowDamageEffect(skill, row, branch = '') {
    const resolved = resolveEffect(skill, row?.effectId);
    if (resolved) return isDamageEffect(resolved) ? resolved : null;
    const declared = String(row?.effectKind || row?.effectType || '');
    if (declared && !/ダメージ|攻撃/.test(declared)) return null;
                                                                                 
                                                                             
                                               
    const damageEffects = getDamageEffects(skill, branch);
    if (!damageEffects.length && branch) damageEffects.push(...getDamageEffects(skill));
    if (damageEffects.length <= 1) return damageEffects[0] || null;
                                                  
                                          
                                          
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

  function hasActionLocalSuicideEnd(definition, action) {
    return normalizeArray(definition.endConditions).some(condition => (
      condition.conditionType === '攻撃完了' && condition.endAction === '自爆'
    )) && normalizeArray(definition.timingEvents).some(event => (
      event.recordPurpose !== '観測' && event.actionId === action.id
      && event.timeOrigin === '召喚ユニット行動開始' && event.eventType === '自爆'
      && /ダメージ/.test(event.effectKind || '')
      && Number.isFinite(event.frame) && event.frame >= 0 && event.frame <= action.motionFrames
    ));
  }

                                                                            
                                                                            
                                                                                
  function isInstantSuicideAction(definition, action) {
    if (action.motionFrames !== 0 || action.actionType !== '自爆'
      || !hasActionLocalSuicideEnd(definition, action)) return false;
    const events = normalizeArray(definition.timingEvents).filter(event => (
      event.recordPurpose !== '観測' && event.actionId === action.id
      && event.timeOrigin === '召喚ユニット行動開始'
    ));
    return events.length === 1 && events[0].eventType === '自爆'
      && events[0].frame === 0 && /ダメージ/.test(events[0].effectKind || '');
  }

  function getGeneratedAttackSpeedSettings(generated) {
    const reference = String(generated?.attackSpeedReference || '');
    const scope = String(generated?.attackSpeedScope || generated?.speedScope || '');
    const changePolicy = String(
      generated?.attackSpeedChangePolicy || generated?.speedChangePolicy || ''
    );
    const ownBase = reference === '生成物自身';
    const base = generated?.attackSpeedBase;
    if (ownBase && !(typeof base === 'number' && Number.isFinite(base) && base > 0)) {
      throw new RangeError(`${generated.id || generated.name}: 生成物自身の攻撃速度基礎が不正です`);
    }
    return {
      reference,
      scope,
      changePolicy,
      base: ownBase ? base : null,
      ownBase,
      periodFrames: ownBase ? DEFAULT_FRAMES_PER_SECOND * 300 / base : null,
      ownerAtSpawn: reference.includes('本人') && reference.includes('生成時'),
      repeatInterval: scope.includes('反復周期')
    };
  }

  function getRistyBearActionSequence(definition) {
    if (definition.id !== 'Risty_low_bear') return null;
    const actions = normalizeArray(definition.summonActions);
    const ids = [1, 2, 3].map(index => `Risty_low_bear_attack${index}`);
    if (actions.length !== 3 || !ids.every(id => actions.filter(action => action.id === id).length === 1)) return null;
    const sequence = ids.map(id => actions.find(action => action.id === id));
    if (sequence.slice(0, 2).some(action => hasActionLocalSuicideEnd(definition, action))) return null;
    return hasActionLocalSuicideEnd(definition, sequence[2]) ? sequence : null;
  }

  function getSummonUnitIssues(definition) {
    const issues = [...normalizeArray(definition.executionIssues)];
    const actions = normalizeArray(definition.summonActions);
    const rows = normalizeArray(definition.timingEvents).filter(row => row.recordPurpose !== '観測');
    if (actions.length !== 1 && !getRistyBearActionSequence(definition)) {
      issues.push('召喚ユニットの行動順が未対応または不正です');
    }
    if (!(typeof definition.attackSpeedBase === 'number' && Number.isFinite(definition.attackSpeedBase) && definition.attackSpeedBase > 0)) {
      issues.push('召喚ユニットの攻撃速度基礎が不正です');
    }
    actions.forEach(action => {
      if (!(action.motionFrames > 0) && !isInstantSuicideAction(definition, action)) {
        issues.push(`${action.id}: モーション長が未確定です`);
      }
      const hits = rows.filter(row => row.actionId === action.id && row.timeOrigin === '召喚ユニット行動開始');
      if (!hits.length || hits.some(row => row.frame == null || !Number.isFinite(row.frame) || row.frame < 0 || row.frame > action.motionFrames)) {
        issues.push(`${action.id}: 行動内命中時刻が未確定・不正です`);
      }
    });
    const starts = rows.filter(row => row.eventType === '行動開始');
    if (!starts.length || starts.some(row => row.frame == null || !Number.isFinite(row.frame) || row.frame < 0)) {
      issues.push('初回行動開始時刻が未確定・不正です');
    }
    return [...new Set(issues)];
  }

                                                                                
                                                                                
  const SUMMON_BASE_KEYS = Object.freeze(['physicalAtk', 'magicAtk', 'physicalDef', 'magicDef',
    'crit', 'critDmg', 'critRes', 'critDmgRes']);

  function assembleSummonAbilities(assembly, modifiers = []) {
    const number = value => {
      if (typeof value !== 'number' || !Number.isFinite(value)) throw new RangeError('分身能力の有限値入力が不足しています');
      return value;
    };
    if (assembly?.inputStage !== 'growth-composed-base') throw new RangeError('分身能力には育成合成済み基礎が必要です');
    const stats = {};
    const parts = [assembly, ...modifiers];
    modifiers.forEach(part => {
      if (!part || Object.keys(part).some(key => !['fixed', 'rateP', 'additional', 'commonFixed', 'commonRateP',
        'attackSpeedFixed', 'attackSpeedP'].includes(key))) throw new RangeError('分身能力補正の種類が未対応です');
      ['fixed', 'rateP', 'additional'].forEach(group => {
        if (Object.keys(part[group] || {}).some(key => !SUMMON_BASE_KEYS.includes(key))) throw new RangeError('分身能力補正の対象が未対応です');
      });
      ['commonFixed', 'commonRateP'].forEach(group => {
        if (Object.keys(part[group] || {}).some(key => !['attack', 'defense'].includes(key))) throw new RangeError('共通能力補正の対象が未対応です');
      });
    });
    const sum = (group, key) => parts.reduce((total, part) => total + number(part[group]?.[key] ?? 0), 0);
    SUMMON_BASE_KEYS.forEach(key => {
      const base = number(assembly.ownerBaseStats?.[key]) * number(assembly.multipliers?.[key]);
      const common = /Atk$/.test(key) ? 'attack' : /Def$/.test(key) ? 'defense' : null;
      stats[key] = roundDamageRateToEven((base + sum('fixed', key) + (common ? sum('commonFixed', common) : 0))
        * (1 + (sum('rateP', key) + (common ? sum('commonRateP', common) : 0)) / 100)
        + sum('additional', key));
      if (!Number.isFinite(stats[key])) throw new RangeError('分身能力が計算範囲外です');
    });
    const speedBase = number(assembly.attackSpeedBase);
    const low = number(assembly.attackSpeedLowerFactor); const high = number(assembly.attackSpeedUpperFactor);
    if (!(speedBase > 0 && low > 0 && high >= low)) throw new RangeError('分身攻速の上下限が不正です');
    const speedFixed = parts.reduce((total, part) => total + number(part.attackSpeedFixed ?? 0), 0);
    const speedP = parts.reduce((total, part) => total + number(part.attackSpeedP ?? 0), 0);
    stats.attackSpeed = Math.max(speedBase * low, Math.min(speedBase * high,
      roundDamageRateToEven((speedBase + speedFixed) * (1 + speedP / 100))));
                                                                          
                                                                             
    if (assembly.hpFixed !== undefined) stats.hp = Math.max(1, Math.trunc(number(assembly.hpFixed)));
    return stats;
  }

  function getSummonCalculationIssues(input, definitions = []) {
    const issues = [];
    if (!input || input.schemaVersion !== 1 || ![1, 2].includes(input.policyVersion)) {
      return ['召喚ユニットの計算入力がないか、入力版が未対応です'];
    }
    const visit = value => {
      if (value === null || ['string', 'boolean'].includes(typeof value)) return;
      if (typeof value === 'number' && Number.isFinite(value)) return;
      if (Array.isArray(value)) { value.forEach(visit); return; }
      if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
        Object.values(value).forEach(visit); return;
      }
      throw new RangeError('召喚計算入力には有限値の純データだけを指定してください');
    };
    try { visit(input); } catch (error) { issues.push(error.message); }
    if (!Array.isArray(input.unresolved)) issues.push('召喚計算の未解決事項欄がありません');
    else input.unresolved.forEach(item => issues.push(String(item?.reason || item || '未解決事項の内容がありません')));
    const fields = ['baseDamage', 'coefficientP', 'effectDamage', 'personalityRate',
      'damageRate', 'endCorrection', 'critMult', 'critRate', 'additionalCoefficient'];
    definitions.forEach(definition => {
      const prepared = input.definitions?.[definition.id];
      if (prepared?.assemblyMode === 'epica-dedicated-owner-query-v1') {
        if (input.policyVersion !== 2
          || prepared.sourceBoundary?.contract !== 'owner-normal-physical-query'
          || prepared.sourceBoundary?.deltaBaselineAction !== 'basicAttack'
          || prepared.sourceBoundary?.criticalModel !== 'mean-v1') {
          issues.push(`${definition.id}: 専用人形の本人能力問い合わせ契約が不足しています`);
        }
        const built = buildEpicaDedicatedHitQuery(prepared.ownerQueryBase, {}, 0);
        if (!built.supported) issues.push(`${definition.id}: ${built.reason}`);
        if (!Array.isArray(prepared.contributions) || prepared.contributions.length
          || prepared.queryTimeline || prepared.abilityAssembly || prepared.hitInputs || prepared.executionRules) {
          issues.push(`${definition.id}: 専用人形の本人能力問い合わせへ別の継承規則を混ぜられません`);
        }
        if (!prepared.speed || !['attackSpeedP', 'selfSpeed', 'otherSpeed'].every(key => (
          typeof prepared.speed[key] === 'number' && Number.isFinite(prepared.speed[key])
        )) || prepared.speed.attackSpeedP <= -100 || prepared.speed.selfSpeed <= 0
          || prepared.speed.otherSpeed <= 0) {
          issues.push(`${definition.id}: 専用人形の個体速度供給が不足しています`);
        }
        if (prepared.accelerationModel !== undefined
          && (prepared.accelerationModel !== 'epica-skill-self-v1' || prepared.speed?.otherSpeed !== 1)) {
          issues.push(`${definition.id}: 専用人形のスキル型加速契約が不正です`);
        }
        if (prepared.spawnClock !== undefined) {
          const clock = prepared.spawnClock;
          if (prepared.accelerationModel !== 'epica-skill-self-v1'
            || !clock || clock.policy !== 'initial-self-speed'
            || typeof clock.animationFrames !== 'number' || !Number.isFinite(clock.animationFrames)
            || clock.animationFrames <= 0 || clock.aiDelayFrames !== 1
            || typeof clock.lifetimeFrames !== 'number' || !Number.isFinite(clock.lifetimeFrames)
            || clock.lifetimeFrames <= clock.aiDelayFrames) {
            issues.push(`${definition.id}: 生成完了・初回AI・寿命の時計が不足または不正です`);
          }
        }
        const events = normalizeArray(definition.timingEvents).filter(event => (
          event.recordPurpose !== '観測' && /ダメージ/.test(event.effectKind || '')
        ));
        if (!events.length || events.some(event => event.effectKind !== '物理ダメージ'
          || event.eventType !== '攻撃' || event.timeOrigin !== '召喚ユニット行動開始')) {
          issues.push(`${definition.id}: 専用人形の物理普通攻撃通知が不足または不一致です`);
        }
        return;
      }
      if (prepared?.assemblyMode === 'epica-dedicated-query-timeline-v1') {
                                                                           
                                                                             
                                                                 
        if (input.policyVersion !== 2
          || prepared.sourceBoundary?.contract !== 'resolved-dedicated-query-timeline'
          || prepared.sourceBoundary?.actionKind !== 'normalAttack'
          || prepared.sourceBoundary?.attackType !== 'physical'
          || prepared.sourceBoundary?.criticalModel !== 'mean-v1') {
          issues.push(`${definition.id}: 専用人形の命中問い合わせ契約が不足しています`);
        }
        if (!Array.isArray(prepared.contributions) || prepared.contributions.length
          || prepared.abilityAssembly || prepared.hitInputs || prepared.executionRules) {
          issues.push(`${definition.id}: 解決済み命中問い合わせへ別の継承・補正規則を混ぜられません`);
        }
        const timeline = prepared.queryTimeline;
        if (!Array.isArray(timeline) || !timeline.length || timeline[0]?.startFrame !== 0) {
          issues.push(`${definition.id}: 専用人形の初期命中問い合わせがありません`);
        } else {
          let previous = -1;
          const level = timeline[0].query?.skillLevel;
          timeline.forEach(row => {
            if (!row || typeof row !== 'object' || Array.isArray(row)) {
              issues.push(`${definition.id}: 命中問い合わせの行が不正です`);
              return;
            }
            if (typeof row.startFrame !== 'number' || !Number.isFinite(row.startFrame)
              || row.startFrame <= previous || row.startFrame < 0
              || row.query?.frame !== row.startFrame || row.query?.skillLevel !== level) {
              issues.push(`${definition.id}: 命中問い合わせの時刻・スキルレベルが不正です`);
            }
            previous = row.startFrame;
            const result = evaluateEpicaDedicatedHitQuery(row.query);
            if (!result.supported) issues.push(`${definition.id}: ${result.reason}`);
          });
        }
        if (!prepared.speed || !['attackSpeedP', 'selfSpeed', 'otherSpeed'].every(key => (
          typeof prepared.speed[key] === 'number' && Number.isFinite(prepared.speed[key])
        )) || prepared.speed.attackSpeedP <= -100 || prepared.speed.selfSpeed <= 0
          || prepared.speed.otherSpeed <= 0) {
          issues.push(`${definition.id}: 専用人形の個体速度入力が不正です`);
        }
        const events = normalizeArray(definition.timingEvents).filter(event => (
          event.recordPurpose !== '観測' && /ダメージ/.test(event.effectKind || '')
        ));
        if (!events.length || events.some(event => event.effectKind !== '物理ダメージ'
          || event.eventType !== '攻撃' || event.timeOrigin !== '召喚ユニット行動開始')) {
          issues.push(`${definition.id}: 専用人形の物理普通攻撃通知が不足または不一致です`);
        }
        return;
      }
      if (!prepared || !['resolved-hit-v1', 'momo-abilities-v2', 'missile-abilities-v1'].includes(prepared.assemblyMode)) {
        issues.push(`${definition.id}: 分身能力の組立式・効果対応が未解決です`); return;
      }
      const missile = prepared.assemblyMode === 'missile-abilities-v1';
      const abilities = missile || prepared.assemblyMode === 'momo-abilities-v2';
      if (missile && (prepared.provisionalModel || prepared.executionRules
        || prepared.abilityAssembly?.hpFixed !== undefined
        || prepared.sourceBoundary?.contract !== 'missile-snapshot-v1')) {
        issues.push(`${definition.id}: Missile能力契約にMomo固有のHP・生成・暫定規則を流用できません`);
      }
      if (prepared.executionRules) {
        const rule = prepared.executionRules;
        if (input.policyVersion !== 2 || !['generationIntervalSeconds', 'gamePlaySpeed',
          'deathOwnerSpRequest', 'ownerSpRecoveryMultiplier', 'maxInstances'].every(key => typeof rule[key] === 'number'
            && Number.isFinite(rule[key]) && rule[key] >= 0)
          || (Object.hasOwn(rule, 'initialDelayFrames') && (typeof rule.initialDelayFrames !== 'number'
            || !Number.isFinite(rule.initialDelayFrames) || rule.initialDelayFrames < 0))
          || rule.gamePlaySpeed <= 0 || !Number.isInteger(rule.maxInstances) || rule.maxInstances < 1
          || rule.generationClock !== 'unityScaledSeconds' || rule.overflowPolicy !== 'skip') {
          issues.push(`${definition.id}: 生成・初動・終了時計の入力が不正です`);
        }
        if (rule.deathOwnerSpRequest > 0 && (!Array.isArray(input.ownerAliveIntervals) || !input.ownerAliveIntervals.length
          || input.ownerAliveIntervals.some(row => typeof row.startFrame !== 'number' || !Number.isFinite(row.startFrame)
            || row.startFrame < 0 || (row.endFrame !== null && (typeof row.endFrame !== 'number'
              || !Number.isFinite(row.endFrame) || row.endFrame <= row.startFrame))))) {
          issues.push(`${definition.id}: 死亡時SP回復の主人生存条件が不足しています`);
        }
      }
      if (abilities) {
        try {
          if (input.policyVersion !== 2) throw new RangeError('分身能力組立はpolicyVersion 2が必要です');
          if (!missile && !Number.isFinite(prepared.abilityAssembly?.hpFixed)) {
            throw new RangeError('CreatureのHP入力が不足しています');
          }
          assembleSummonAbilities(prepared.abilityAssembly);
          if (prepared.speed?.attackSpeedP !== 0 || prepared.abilityAssembly.attackSpeedBase !== definition.attackSpeedBase) {
            throw new RangeError('能力組立の基礎攻速・率入力が重複または不一致です');
          }
          if (!Array.isArray(prepared.enemyTimeline) || !prepared.enemyTimeline.length) throw new RangeError('命中対象の能力入力がありません');
          let previous = -1;
          const defenseKeys = missile ? [...new Set(normalizeArray(definition.timingEvents)
            .filter(event => event.recordPurpose !== '観測' && /ダメージ/.test(event.effectKind || ''))
            .map(event => prepared.hitContexts?.[event.effectId]?.attackType === 'physical'
              ? 'physicalDef' : 'magicDef'))] : ['magicDef'];
          prepared.enemyTimeline.forEach(row => {
            if (!Number.isFinite(row.startFrame) || row.startFrame < 0 || row.startFrame <= previous
              || ![...defenseKeys, 'critRes', 'critDmgRes'].every(key => typeof row.stats?.[key] === 'number'
                && Number.isFinite(row.stats[key]) && row.stats[key] >= 0)) throw new RangeError('敵能力の時刻・値が不正です');
            previous = row.startFrame;
          });
          if (prepared.enemyTimeline[0].startFrame !== 0) throw new RangeError('初期の敵能力がありません');
        } catch (error) { issues.push(`${definition.id}: ${error.message}`); }
      }
      if (!prepared.speed || !['attackSpeedP', 'selfSpeed', 'otherSpeed'].every(key => (
        typeof prepared.speed[key] === 'number' && Number.isFinite(prepared.speed[key])
      )) || prepared.speed.attackSpeedP <= -100 || prepared.speed.selfSpeed <= 0 || prepared.speed.otherSpeed <= 0) {
        issues.push(`${definition.id}: 個体速度入力が不正です`);
      }
      normalizeArray(definition.timingEvents).filter(event => event.recordPurpose !== '観測'
        && /ダメージ/.test(event.effectKind || '')).forEach(event => {
        if (missile && (!['physical', 'magic'].includes(prepared.hitContexts?.[event.effectId]?.attackType)
          || !['normalAttack', 'autoTrigger'].includes(prepared.hitContexts?.[event.effectId]?.actionKind))) {
          issues.push(`${definition.id}/${event.effectId}: Missile自身の攻撃種別・行動分類が不足しています`);
        }
        const hit = prepared.hitInputs?.[event.effectId];
        const required = abilities ? fields.filter(field => !['baseDamage', 'critRate', 'critMult'].includes(field)) : fields;
        if (!hit || required.some(field => typeof hit[field] !== 'number' || !Number.isFinite(hit[field]))
          || !evaluateSingleHitDamage(abilities ? { ...hit, baseDamage: 1, critRate: 0.05, critMult: 1.2 } : hit).supported) {
          issues.push(`${definition.id}/${event.effectId}: 独立命中入力が不足・不正です`);
        }
      });
      const ids = new Set();
      Object.entries(prepared.hitAdjustments || {}).forEach(([id, adjustment]) => {
        if (!prepared.hitInputs?.[id] || !adjustment || typeof adjustment !== 'object'
          || Object.entries(adjustment).some(([key, value]) => !['critRateP', 'critDmgAddP'].includes(key)
            || typeof value !== 'number' || !Number.isFinite(value))) issues.push(`${definition.id}/${id}: 会心補正入力が不正です`);
      });
      if (!Array.isArray(prepared.contributions)) issues.push(`${definition.id}: 補正内訳がありません`);
      normalizeArray(prepared.contributions).forEach(effect => {
        if (!effect || typeof effect !== 'object') { issues.push(`${definition.id}: 補正内訳が不正です`); return; }
        if (!effect.id || ids.has(effect.id)) issues.push(`${definition.id}: 補正IDが不正・重複しています`);
        ids.add(effect.id);
        if (!['copyAtSpawn', 'excludeFromOwnerCopy', 'directToSummon'].includes(effect.inheritance)
          || !['status', 'artifact', 'spell'].includes(effect.sourceKind)
          || !effect.evidence || (effect.sourceKind === 'status' && !Number.isInteger(effect.nativeKind))) {
          issues.push(`${effect.id}: 継承区分・供給元の対応根拠が未確認です`);
        }
        if (effect.sourceKind === 'status' && [4, 9].includes(effect.nativeKind)
          && effect.inheritance === 'copyAtSpawn') issues.push(`${effect.id}: WorldRule/Augmentをコピーできません`);
        if (missile && effect.inheritance === 'copyAtSpawn'
          && (Object.keys(effect.speedModifiers || {}).length
            || Object.hasOwn(effect.abilityModifiers || {}, 'attackSpeedP')
            || Object.hasOwn(effect.abilityModifiers || {}, 'attackSpeedFixed'))) {
          issues.push(`${effect.id}: Missile攻速は子自身の46/47経路で、主人snapshotからコピーできません`);
        }
        if (typeof effect.startFrame !== 'number' || !Number.isFinite(effect.startFrame)
          || effect.startFrame < 0 || (effect.endFrame !== null && (
            typeof effect.endFrame !== 'number' || !Number.isFinite(effect.endFrame) || effect.endFrame <= effect.startFrame))) {
          issues.push(`${effect.id}: 補正の有効時刻が未確認です`);
        }
        const detached = input.policyVersion === 2 && effect.lifetimePolicy === 'detachedOrigin'
          && effect.sourceKind === 'status' && effect.inheritance === 'copyAtSpawn';
        if ((!['permanent', 'remaining'].includes(effect.lifetimePolicy) && !detached)
          || (effect.lifetimePolicy === 'permanent' && effect.endFrame !== null)
          || (effect.lifetimePolicy === 'remaining' && effect.endFrame === null)
          || effect.runtimeEffectId) issues.push(`${effect.id}: 補正寿命・動的発動経路が未対応です`);
        if (input.policyVersion === 2 && effect.sourceKind === 'status' && effect.inheritance === 'copyAtSpawn'
          && (!detached || effect.valueStage !== 'origin')) issues.push(`${effect.id}: 状態コピーは原値・独立保持の指定が必要です`);
        if (effect.abilityModifiers) {
          try { assembleSummonAbilities(prepared.abilityAssembly, [effect.abilityModifiers]); }
          catch (error) { issues.push(`${effect.id}: ${error.message}`); }
        }
        if (effect.queryCondition !== undefined) {
          const condition = effect.queryCondition;
          const validList = (list, allowed) => Array.isArray(list) && list.length > 0
            && list.every(value => allowed.includes(value));
          if (input.policyVersion !== 2 || !condition || typeof condition !== 'object'
            || Array.isArray(condition) || !Object.keys(condition).length
            || Object.keys(condition).some(key => !['actionKinds', 'attackTypes'].includes(key))
            || (condition.actionKinds !== undefined && !validList(condition.actionKinds, ['normalAttack', 'skill', 'autoTrigger']))
            || (condition.attackTypes !== undefined && !validList(condition.attackTypes, ['physical', 'magic']))
            || effect.abilityModifiers || effect.speedModifiers) {
            issues.push(`${effect.id}: 命中条件が未対応です。条件付き能力・速度補正は未接続です`);
          }
          Object.keys(prepared.hitInputs || {}).forEach(id => {
            const query = prepared.hitContexts?.[id];
            if (!query || !['normalAttack', 'autoTrigger'].includes(query.actionKind)
              || !['physical', 'magic'].includes(query.attackType)) {
              issues.push(`${effect.id}: ${id}の独立した命中種別・攻撃タイプが不足しています`);
            }
          });
        }
        if (effect.requiresOwnerAlive && (!Array.isArray(input.ownerAliveIntervals)
          || !input.ownerAliveIntervals.length || input.ownerAliveIntervals.some(row => typeof row.startFrame !== 'number'
            || !Number.isFinite(row.startFrame) || row.startFrame < 0 || (row.endFrame !== null
              && (typeof row.endFrame !== 'number' || !Number.isFinite(row.endFrame) || row.endFrame <= row.startFrame))))) {
          issues.push(`${effect.id}: 主人生存条件の入力が不足しています`);
        }
        normalizeArray(effect.sharedHitModifiers).forEach(binding => {
          const values = input.sharedValues?.[binding.referenceId];
          if (input.policyVersion !== 2 || effect.sourceKind !== 'spell'
            || !['damageRate', 'endCorrection', 'additionalCoefficient'].includes(binding.field)
            || typeof binding.multiplier !== 'number' || !Number.isFinite(binding.multiplier)
            || !Array.isArray(values) || !values.length || values[0].startFrame !== 0
            || values.some((row, index) => typeof row.startFrame !== 'number' || !Number.isFinite(row.startFrame)
              || row.startFrame < 0 || (index && row.startFrame <= values[index - 1].startFrame)
              || typeof row.value !== 'number' || !Number.isFinite(row.value))) {
            issues.push(`${effect.id}: スペル共有値の対応・時刻が不正です`);
          }
        });
        Object.entries(effect.hitModifiers || {}).forEach(([field, value]) => {
          if (!['damageRate', 'endCorrection', 'additionalCoefficient'].includes(field)
            || typeof value !== 'number' || !Number.isFinite(value)) issues.push(`${effect.id}: 命中補正が未対応です`);
        });
        Object.entries(effect.speedModifiers || {}).forEach(([field, value]) => {
          if (field !== 'attackSpeedP' || typeof value !== 'number' || !Number.isFinite(value)) {
            issues.push(`${effect.id}: 速度補正が未対応です`);
          }
        });
      });
    });
    return [...new Set(issues)];
  }

  function createSummonDataResolver(input) {
    return ({ definition, frame, ownerModifiers = {}, ownerAttackSpeedP = 0 }) => {
      const prepared = input.definitions[definition.id];
      if (prepared.assemblyMode === 'epica-dedicated-owner-query-v1') {
        return {
          ownerDeltaAction: 'basicAttack',
          getSpeed: context => ({ ...prepared.speed,
            ...(prepared.accelerationModel === 'epica-skill-self-v1'
              ? { selfSpeed: prepared.speed.selfSpeed * context.globalActionSpeed, otherSpeed: 1 } : {}) }),
          ...(prepared.spawnClock ? {
            getSpawnTiming: context => {
              const scale = prepared.speed.selfSpeed * context.globalActionSpeed;
              if (!Number.isFinite(scale) || scale <= 0) {
                throw new RangeError(`${definition.id}: 生成時のモーション速度が不正です`);
              }
              const completedAt = prepared.spawnClock.animationFrames / scale;
              return {
                initialDelayFrames: completedAt + prepared.spawnClock.aiDelayFrames,
                lifetimeFrames: completedAt + prepared.spawnClock.lifetimeFrames
              };
            }
          } : {}),
          getHitInput: context => {
            const built = buildEpicaDedicatedHitQuery(prepared.ownerQueryBase,
              context.ownerModifiers, context.frame);
            if (!built.supported) throw new RangeError(`${definition.id}: ${built.reason}`);
            const result = evaluateEpicaDedicatedHitQuery(built.query);
            if (!result.supported) throw new RangeError(`${definition.id}: ${result.reason}`);
            return result.hitInput;
          }
        };
      }
      if (prepared.assemblyMode === 'epica-dedicated-query-timeline-v1') {
        return {
          getSpeed: () => ({ ...prepared.speed }),
          getHitInput: context => {
                                                                               
                                                                             
                                                                          
            const row = prepared.queryTimeline.filter(item => item.startFrame <= context.frame).at(-1);
            const result = evaluateEpicaDedicatedHitQuery({ ...row.query, frame: context.frame });
            if (!result.supported) throw new RangeError(`${definition.id}: ${result.reason}`);
            return result.hitInput;
          }
        };
      }
      const assembled = ['momo-abilities-v2', 'missile-abilities-v1'].includes(prepared.assemblyMode);
      const provisional = prepared.provisionalModel === 'momo-site-snapshot-v1';
      const copiedOwner = provisional ? { ...ownerModifiers } : {};
      const inferredAbility = provisional ? { rateP: {
        magicAtk: getRuntimeAttackModifierP(copiedOwner, 'magic'),
        crit: toFiniteNumber(copiedOwner.critP), critDmg: toFiniteNumber(copiedOwner.critDmgP)
      }, attackSpeedP: ownerAttackSpeedP } : null;
      const activeAt = (effect, at) => effect.startFrame <= at && (effect.endFrame === null || at < effect.endFrame);
      const copied = prepared.contributions.filter(effect => effect.inheritance === 'copyAtSpawn' && activeAt(effect, frame));
      const direct = prepared.contributions.filter(effect => effect.inheritance === 'directToSummon');
      const effectsAt = at => [...copied.filter(effect => effect.lifetimePolicy === 'detachedOrigin'
        || effect.endFrame === null || at < effect.endFrame), ...direct.filter(effect => activeAt(effect, at))]
        .filter(effect => !effect.requiresOwnerAlive || input.ownerAliveIntervals.some(row => activeAt(row, at)));
                                                                                 
                                                                                  
      const boundaries = [...new Set([...copied, ...direct].flatMap(effect => [effect.startFrame, effect.endFrame])
        .concat([...copied, ...direct].some(effect => effect.requiresOwnerAlive)
          ? input.ownerAliveIntervals.flatMap(row => [row.startFrame, row.endFrame]) : [])
        .filter(value => typeof value === 'number' && Number.isFinite(value)))].sort((a, b) => a - b);
      let cachedAt = -Infinity, cachedUntil = -Infinity, cachedEffects, cachedStats;
      const activeEffectsAt = at => {
        if (!cachedEffects || at < cachedAt || at >= cachedUntil) {
          cachedEffects = effectsAt(at);
          cachedStats = null;
          cachedAt = at;
          cachedUntil = boundaries.find(value => value > at) ?? Infinity;
        }
        return cachedEffects;
      };
      const statsAt = at => {
        const effects = activeEffectsAt(at);
        if (!cachedStats) cachedStats = assembleSummonAbilities(prepared.abilityAssembly,
          [...effects.flatMap(effect => [effect.abilityModifiers, effect.speedModifiers].filter(Boolean)),
            ...(inferredAbility ? [inferredAbility] : [])]);
        return cachedStats;
      };
      const matchesHit = (effect, query) => {
        const condition = effect.queryCondition;
        if (!condition) return true;
                                                                                 
        return (!condition.actionKinds || condition.actionKinds.some(kind => kind === query.actionKind
          || (kind === 'skill' && query.actionKind === 'autoTrigger')))
          && (!condition.attackTypes || condition.attackTypes.includes(query.attackType));
      };
      return {
        getSpeed: context => {
          const speed = { ...prepared.speed };
          if (assembled) {
            speed.attackSpeedP = (statsAt(context.frame).attackSpeed / definition.attackSpeedBase - 1) * 100;
          }
          if (provisional) {
            speed.selfSpeed = context.globalActionSpeed || 1;
            speed.otherSpeed = context.globalActionSpeed || 1;
          }
          if (!assembled) activeEffectsAt(context.frame).forEach(effect => {
            Object.entries(effect.speedModifiers || {}).forEach(([key, value]) => { speed[key] += value; });
          });
          return speed;
        },
        getHitInput: context => {
          const hit = { ...prepared.hitInputs[context.event.effectId] };
          if (assembled) {
            const stats = statsAt(context.frame);
            const enemy = prepared.enemyTimeline.filter(row => row.startFrame <= context.frame).at(-1).stats;
            const physical = prepared.assemblyMode === 'missile-abilities-v1'
              && prepared.hitContexts[context.event.effectId].attackType === 'physical';
            const atk = Math.max(0, physical ? stats.physicalAtk : stats.magicAtk);
            hit.baseDamage = atk * calcRuntimeBaseDamageRate(atk, Math.max(1, physical ? enemy.physicalDef : enemy.magicDef));
            const adjustment = prepared.hitAdjustments?.[context.event.effectId] || {};
            hit.critRate = clampCombatCritRate(calcRuntimeCritRate(Math.max(0, stats.crit), Math.max(1, enemy.critRes))
              + (toFiniteNumber(adjustment.critRateP) + toFiniteNumber(copiedOwner.critRateP)) / 100);
            hit.critMult = clampCombatCritMultiplier(calcRuntimeCritMultiplier(Math.max(0, stats.critDmg), Math.max(1, enemy.critDmgRes))
              + (toFiniteNumber(adjustment.critDmgAddP) + toFiniteNumber(copiedOwner.critDmgAddP)) / 100);
          }
          if (provisional) {
            const query = prepared.hitContexts?.[context.event.effectId];
            hit.damageRate += (toFiniteNumber(copiedOwner.addP) + (query?.actionKind === 'autoTrigger'
              ? toFiniteNumber(copiedOwner.skillAddP) : toFiniteNumber(copiedOwner.normalAttackAddP))) / 100;
          }
          activeEffectsAt(context.frame).filter(effect => matchesHit(effect, prepared.hitContexts?.[context.event.effectId])).forEach(effect => {
            Object.entries(effect.hitModifiers || {}).forEach(([key, value]) => { hit[key] += value; });
            normalizeArray(effect.sharedHitModifiers).forEach(binding => {
              const row = input.sharedValues[binding.referenceId].filter(item => item.startFrame <= context.frame).at(-1);
              hit[binding.field] += row.value * binding.multiplier;
            });
          });
          return hit;
        }
      };
    };
  }

                                                                                
  function calculateActionSpeedTiming(periodFrames, motionFrames, selfSpeed = 1, otherSpeed = 1) {
    if (![periodFrames, motionFrames, selfSpeed, otherSpeed].every(value => typeof value === 'number' && Number.isFinite(value) && value > 0)) {
      throw new RangeError('行動速度に正の有限値が必要です');
    }
    const period = periodFrames / otherSpeed;
    const motionScale = Math.min(1, period / motionFrames) / selfSpeed;
    return { motionScale, motionFrames: motionFrames * motionScale,
      waitFrames: Math.max(0, period - motionFrames) };
  }

                                                                                  
                                                                               
  function getAliceGeneratedFirstHitApplicationId(skill, generated, row) {
    const contracts = {
      Alice_low_scratch: ['Alice_low', 'Alice_low_e08', 'Alice_low_e11', 'かすり傷注意'],
      Alice_high_scratch: ['Alice_high', 'Alice_high_e08', 'Alice_high_e11', 'かすり傷注意'],
      Alice_high_shock: ['Alice_high', 'Alice_high_e01', 'Alice_high_e03', '傘持参']
    };
    const contract = contracts[generated?.id];
    return contract && skill?.skillId === contract[0] && row?.effectId === contract[1]
      && generated.branch === contract[3] && row.repeatTarget === true
      ? contract[2] : '';
  }

  function buildGeneratedEvents(apostle, skill, actionTiming, warnings, statusDefinitions = [], skillLevel = 1) {
    const events = [];
    normalizeArray(actionTiming?.generatedObjects).forEach(generated => {
      const summonUnit = generated.executionMode === '召喚ユニット';
      const rows = normalizeArray(generated.timingEvents).filter(row => (
        row.recordPurpose !== '観測' && (!summonUnit || !row.actionId)
      ));
      const attackSpeedSettings = getGeneratedAttackSpeedSettings(generated);
      const independentStatsUnresolved = String(generated.statReference || '').startsWith('分身自身');
      if (!summonUnit && attackSpeedSettings.ownBase && attackSpeedSettings.repeatInterval) {
        warnings.push(`${generated.id}: 分身基礎攻速${attackSpeedSettings.base}から補正なし周期${attackSpeedSettings.periodFrames}Fで暫定計算します。主人攻速は流用せず、分身の攻速補正・加速・専用モーションは未対応です（シート実測${generated.repeatIntervalFrames}Fは保持）`);
      }
      if (!summonUnit && independentStatsUnresolved) {
        warnings.push(`${generated.id}: 分身の選択的能力継承は未対応です。ダメージは主人profileの旧互換値で、分身自身の能力・除外statusを再現していません`);
      }
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
            summonDefinition: summonUnit ? generated : null,
            generatedObjectName: generated.name || '',
            generatedInstanceOrder: instanceOrder,
            generatedInstanceKey,
            generatedEventType: '生成',
            generatedSpawnOrigin: generated.spawnOrigin,
            generatedSpawnFrame: spawnFrame,
            respawnPolicy: generated.respawnPolicy || '',
            generatedAttackSpeedReference: attackSpeedSettings.reference,
            generatedAttackSpeedBase: attackSpeedSettings.base,
            generatedIndependentStatsUnresolved: independentStatsUnresolved,
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

                                                                                
                                                                                  
                                                                                  
          const effect = resolveApostleEffect(apostle, skill, row.effectId)
            || resolveRowDamageEffect(skill, row, row.branch || '');
          const scratchApplicationId = getAliceGeneratedFirstHitApplicationId(skill, generated, row);
          const statusApplication = statusDefinitions.find(item => item.applicationEffectId === (scratchApplicationId || row.effectId)) || null;
          const expectedAliceStatus = generated.id === 'Alice_high_shock' ? '感電' : '気絶';
          if (scratchApplicationId && (!statusApplication || statusApplication.status !== expectedAliceStatus)) {
            throw new RangeError('アリスの反復命中に対応する状態入力がありません');
          }
          const damage = (!!effect && isDamageEffect(effect))
            || /ダメージ|攻撃/.test(String(row.effectKind || ''));
          if (row.effectId && !resolveApostleEffect(apostle, skill, row.effectId)) {
            warnings.push(`effectIdを解決できません: ${row.effectId}`);
          }
          const repeatInterval = row.repeatTarget === true
            ? Math.max(0, toFiniteNumber(attackSpeedSettings.ownBase && attackSpeedSettings.repeatInterval
              ? attackSpeedSettings.periodFrames : generated.repeatIntervalFrames))
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
              nativeCoefficientScale: row.nativeLv1Coefficient == null ? null
                : row.nativeLv1Coefficient / getLv1Multiplier(effect),
              nativeCoefficientInteger: Number.isSafeInteger(row.nativeLv1Coefficient),
              nativeEffectDamage: row.nativeEffectDamage ?? null,
              independentDamage: damage,
              persistent: generated.cancelPolicy !== '消滅',
              branch: row.branch || generated.branch || '',
              generatedObjectId: generated.id || '',
              summonDefinition: summonUnit ? generated : null,
              generatedObjectName: generated.name || '',
              generatedInstanceOrder: instanceOrder,
              generatedInstanceKey,
              generatedSpawnOrigin: generated.spawnOrigin,
              generatedSpawnFrame: spawnFrame,
              generatedEventType: row.eventType || '',
              generatedEndFrame: endFrame,
              respawnPolicy: generated.respawnPolicy || '',
              generatedAttackSpeedReference: attackSpeedSettings.reference,
              generatedAttackSpeedBase: attackSpeedSettings.base,
              generatedIndependentStatsUnresolved: independentStatsUnresolved,
              generatedAttackSpeedScope: attackSpeedSettings.scope,
              generatedAttackSpeedChangePolicy: attackSpeedSettings.changePolicy,
              generatedUsesOwnerAttackSpeedAtSpawn: attackSpeedSettings.ownerAtSpawn,
              generatedAttackSpeedAffectsRepeatInterval: attackSpeedSettings.repeatInterval,
              generatedRepeatSeriesKey: repeatSeriesKey,
              generatedRepeatIndex: repeat,
              generatedRepeatAnchorFrame: eventFrame,
              generatedRepeatIntervalFrames: repeatInterval,
              generatedRepeatCount: repeatCount,
              statusApplication: scratchApplicationId && repeat !== 0 ? null : statusApplication,
              ...(scratchApplicationId && repeat === 0 ? {statusApplicationPhase: 'afterDamage'} : {}),
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
    const sherumArea = normalizeScenarioId(apostle?.id) === 'sherum'
      && ['lowSkill', 'highSkill'].includes(actionKey);
    const yomiArea = normalizeScenarioId(apostle?.id) === 'yomi' && actionKey === 'highSkill'
      && normalizeArray(actionTiming?.timingEvents).some(row => ['Yomi_high_e01','Yomi_high_e02'].includes(row.effectId));
                                                                          
                                                                          
    if (sherumArea || yomiArea) suppressDamageFallback = true;
    const usesRawTiming = actionTiming?.timingBasis === 'rawMotion'
      && actionTiming?.timingAdoption !== '暫定採用';
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
                                                                             
                                                                            
      if (normalizeScenarioId(apostle?.id) === 'pira' && actionKey === 'highSkill') return false;
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
                                                                       
      if (!selectedResourceBranch) return true;
                                                                                      
                                                                                      
                                                               
      const keyParts = [row.order, row.frame, row.effectKind, row.effectId, row.lv1PerHitMultiplier,
        row.eventClock || '', row.afterAction || '', row.timeOrigin || '動作開始'];
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
      const sourceEffect = resolveApostleEffect(apostle, skill,
        row.effectId || resolveImplicitTimedSpEffectId(skill, row));
                                              
                                             
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
      if (row.effectId && !effect) {
        if (usesRawTiming) throw new RangeError(`元時刻採用行動の効果を解決できません: ${row.effectId}`);
        warnings.push(`effectIdを解決できません: ${row.effectId}`);
      }
      if (row.frame == null) {
        if (usesRawTiming) throw new RangeError('元時刻採用行動に未確定イベントがあります');
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
        effectId: damageEffect?.effectId || row.effectId || effect?.effectId || (damage ? damageEffects[0]?.effectId : '') || '',
        effectType: effect?.effectType || (damage ? '攻撃' : ''),
        effectValueKind: effect?.valueKind || declared,
        hitCount: eventHitCount,
        repeatDamageCount,
        lv1PerHitMultiplier: row.lv1PerHitMultiplier ?? null,
        coefficientShare: getCoefficientShare(damageEffect, row.lv1PerHitMultiplier),
        nativeCoefficientScale: row.nativeLv1Coefficient == null ? null
          : row.nativeLv1Coefficient / getLv1Multiplier(damageEffect),
        nativeCoefficientInteger: Number.isSafeInteger(row.nativeLv1Coefficient),
        nativeEffectDamage: row.nativeEffectDamage ?? null,
        statusApplication,
        resourceChange,
        eventClock: row.eventClock,
        afterAction: row.afterAction,
        timeOrigin: row.timeOrigin,
        timingQuality: row.eventClock === '従来換算（暫定）' ? 'provisional'
          : getTimingQualityFromResearchStatus(row.researchStatus, 'measured'),
        note: row.note || ''
      });
      if (damage) observedDamageHits += eventHitCount;
    });

    const researchStatuses = new Set(rows.map(row => row.researchStatus).filter(Boolean));
    const complete = researchStatuses.size > 0 && [...researchStatuses].every(status => status === '済' || status === '完了');
    if (!suppressDamageFallback && totalHitCount > observedDamageHits) {
      if (usesRawTiming) throw new RangeError('元時刻採用行動のヒット数が不足しています。元イベントを確認してください');
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
                                                                             
                                                                               
      if (normalizeArray(actionTiming?.generatedObjects).some(object =>
        normalizeArray(object.timingEvents).some(row => row.recordPurpose !== '観測'
          && row.effectId === statusApplication.applicationEffectId && row.eventType === '状態付与'))) return;
      if (normalizeArray(actionTiming?.generatedObjects).some(object => object.recordPurpose !== '観測'
        && normalizeArray(object.timingEvents).some(row => row.recordPurpose !== '観測'
          && getAliceGeneratedFirstHitApplicationId(skill, object, row) === statusApplication.applicationEffectId))) return;
      if (events.some(event => event.statusApplication?.applicationEffectId === statusApplication.applicationEffectId)) return;
                                                                            
                                                                              
      const application = resolveEffect(skill, statusApplication.applicationEffectId);
                                                                            
                                                                               
                                                                                 
      const ayaFreezeHit = skill?.skillId === 'Aya_high'
        && statusApplication.applicationEffectId === 'Aya_high_e03'
        && statusApplication.status === '凍傷' && statusApplication.durationFrames === 600
        && statusApplication.maxStacks === 9 && !application?.triggerSourceId;
      const sourceId = String(application?.triggerSourceId || (ayaFreezeHit ? 'Aya_high_e01' : ''));
      const sourceEffect = resolveEffect(skill, sourceId);
                                                                         
                                                                              
                                                                          
      const runtimeOwnsApplication = ['攻撃命中時', '普通攻撃命中時一定確率', '通常攻撃命中時一定確率']
        .includes(application?.triggerType) && sourceId
        && normalizeArray(timingContext.runtimeEventEffects).some(effect => (
          effect.triggerType === application.triggerType
          && (String(effect.triggerSourceId || '') === sourceId
            || normalizeArray(effect.triggerSourceIds).includes(sourceId))
          && normalizeArray(effect.steps).some(step => step.type === 'status'
            && step.application?.applicationEffectId === statusApplication.applicationEffectId)
        ));
      if (runtimeOwnsApplication) return;
      const linkedHits = (ayaFreezeHit || (application?.triggerType === '攻撃命中時'
        && !application.conditionType && !application.condition && !application.triggerValue && application.processGroupId
        && sourceEffect?.processGroupId === application.processGroupId && isDamageEffect(sourceEffect)))
        ? events.filter(event => event.type === 'damage' && event.effectId === sourceId) : [];
      const orderedSources = new Set(linkedHits.map(event => `${event.frame}:${event.eventOrder}`));
      if (linkedHits.length && orderedSources.size === linkedHits.length && linkedHits.every(event => (
        Number.isFinite(event.frame) && event.frame >= 0 && !event.generatedObjectId
        && event.timingQuality !== 'fallbackEnd' && event.eventClock !== '未確認'
        && event.hitCount === 1 && Number(event.repeatDamageCount ?? 1) === 1
      ))) {
        linkedHits.forEach(sourceEvent => events.push({
          frame: sourceEvent.frame,
          eventOrder: toFiniteNumber(sourceEvent.eventOrder, 1000) + .25,
          type: 'effect', effectId: statusApplication.applicationEffectId,
          effectType: 'デバフ', hitCount: 0, statusApplication,
          eventClock: sourceEvent.eventClock, afterAction: sourceEvent.afterAction,
          timeOrigin: sourceEvent.timeOrigin, timingQuality: sourceEvent.timingQuality,
          timingSourceEffectId: sourceId,
          note: `明示した命中元 ${sourceId} に連動する状態付与`
        }));
        return;
      }
      if (usesRawTiming) throw new RangeError(`元時刻採用行動の状態付与イベントが不足しています: ${statusApplication.status}`);
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
    if (sherumArea) {
      const favoriteArea = actionKey === 'lowSkill' && skill?.skillId === 'Sherum_favorite_1';
      const durationId = favoriteArea ? 'Sherum_favorite_1_e01'
        : actionKey === 'lowSkill' ? 'Sherum_low_e03' : 'Sherum_high_e03';
      const duration = resolveEffectValue(resolveEffect(skill, durationId), skillLevel);
      const damageId = favoriteArea ? 'Sherum_favorite_1_e04'
        : actionKey === 'lowSkill' ? 'Sherum_low_e01' : 'Sherum_high_e01';
      const pulseIds = [damageId, ...(actionKey === 'lowSkill'
        ? [favoriteArea ? 'Sherum_favorite_1_e02' : 'Sherum_low_e04'] : [])];
      if (sortedEvents.some(event => event.type === 'damage' && event.effectId !== damageId)) {
        throw new RangeError('シェルム領域の条件付き追加ダメージは未接続です');
      }
      sortedEvents.forEach(event => {
        if (!pulseIds.includes(event.effectId)) return;
        if (!Number.isFinite(duration) || duration <= 0 || event.timingQuality === 'fallbackEnd') {
          throw new RangeError('シェルム領域の持続時間・発生通知が不足しています');
        }
        const pulseEvent = { ...event, hitCount: event.type === 'damage' ? 1 : 0,
          isFinalHit: false, afterAction: '継続' };
        event.type = 'effect';
        event.hitCount = 0;
        event.isFinalHit = false;
        event.ownerArea = {durationSeconds:duration, intervalSeconds:1, pulseEvent};
      });
    }
    if (yomiArea) {
      const duration = resolveEffectValue(resolveEffect(skill, 'Yomi_high_e04'), skillLevel);
      const rows = sortedEvents.filter(event => ['Yomi_high_e01','Yomi_high_e02'].includes(event.effectId));
      if (!Number.isFinite(duration) || duration !== 12 || rows.length !== 2
        || rows.filter(event => event.effectId === 'Yomi_high_e01').length !== 1
        || rows.filter(event => event.effectId === 'Yomi_high_e02').length !== 1
        || rows.some(event => event.timingQuality === 'fallbackEnd' || event.frame !== rows[0].frame)
        || rows.find(event => event.effectId === 'Yomi_high_e02').type !== 'damage'
        || rows.find(event => event.effectId === 'Yomi_high_e01').type === 'damage') {
        throw new RangeError('ヨミの月光領域の生成通知・持続時間が不足しています');
      }
      rows.forEach(event => {
        const pulseEvent = {...event, hitCount:event.type === 'damage' ? 1 : 0,
          isFinalHit:false,afterAction:'継続'};
        event.type='effect';event.hitCount=0;event.isFinalHit=false;
        event.ownerArea={durationSeconds:duration,intervalSeconds:1,pulseEvent};
      });
    }
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
                                                                                   
    const pendingRecoveryTiming = actionTiming.activationMode === 'nonOccupyingRecoveryPending';
    const nonOccupyingImmediate = pendingRecoveryTiming
      || actionTiming.activationMode === 'nonOccupyingImmediate';
    if (pendingRecoveryTiming && (!normalizeArray(skill.effects).length
      || normalizeArray(skill.effects).some(effect => effect.effectType !== '回復'
        || effect.valueKind !== 'HP回復')
      || normalizeArray(actionTiming.timingEvents).length)) {
      throw new RangeError('回復時刻未確認の非占有発動はHP回復のみの高学年に限定されます');
    }
    if (nonOccupyingImmediate && (actionKey !== 'highSkill'
      || !(Number(skill.cooldownSeconds) > 0)
      || (!pendingRecoveryTiming && !normalizeArray(actionTiming.timingEvents).length)
      || normalizeArray(actionTiming.timingEvents).some(event => event.frame !== 0
        || !event.effectId || !resolveApostleEffect(apostle, skill, event.effectId))
      || normalizeArray(actionTiming.timingPatterns).length
      || normalizeArray(actionTiming.generatedObjects).length)) {
      throw new RangeError('非占有・即時高学年のCTまたは明示命中入力が不正です');
    }
    const motionVariants = normalizeArray(actionTiming.motionVariants).filter(item => item?.gameFrames != null);
    if (!nonOccupyingImmediate && actionTiming.motionFrames == null && !motionVariants.length) return null;
    if (nonOccupyingImmediate && (motionVariants.length || actionTiming.motionFrames != null)) {
      throw new RangeError('非占有高学年に本人モーションを指定できません');
    }
    const motionFrames = Math.max(0, toFiniteNumber(
      actionTiming.motionFrames,
      motionVariants[0]?.gameFrames
    ));
    const normalAttackIntervalBasis = actionTiming.normalAttackIntervalBasis === 'motion' ? 'motion' : 'normal';
    if (normalAttackIntervalBasis === 'motion' && !(motionFrames > 0)) {
      warnings.push(`${skill.skillId || skill.skillType}: 強化攻撃の基準モーション長が未確定です`);
      return null;
    }
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
    const repeatPolicy = actionKey === 'enhancedAttack'
      ? resolveSnorkyRepeatPolicy(apostle, skill, baseSkill, skillLevel, warnings)
      : null;
    const generatedEvents = buildGeneratedEvents(
      apostle,
      skill,
      actionTiming,
      warnings,
      [...statusDefinitions, ...generatedStatusDefinitions],
      skillLevel
    );
    const summonUnits = normalizeArray(actionTiming.generatedObjects).filter(item => item.executionMode === '召喚ユニット');
                                                                                  
                                      
    const hasGeneratedDamage = summonUnits.length > 0 || generatedEvents.some(event => event.type === 'damage');
    const favoriteBranchName = String(apostle?.favoriteCard?.name || '').trim();
    const favoriteOverrideActive = !!buildOptions.skillOverrides?.[actionKey];
    const isInactiveFavoriteBranch = branch => (
      !favoriteOverrideActive
      && favoriteBranchName
      && String(branch || '').trim() === favoriteBranchName
    );
    const motionBranches = motionVariants
      .map(item => item.branch || '')
      .filter(branch => branch && !isInactiveFavoriteBranch(branch));
    const timingBranches = normalizeArray(actionTiming.timingEvents)
      .map(row => row.branch || '')
      .filter(branch => branch && branch !== '共通' && !isInactiveFavoriteBranch(branch));
    const timingPatternBranches = normalizeArray(actionTiming.timingPatterns)
      .map(pattern => pattern.branch || '')
      .filter(branch => branch && branch !== '共通' && !isInactiveFavoriteBranch(branch));
    const generatedBranches = generatedEvents
      .map(event => event.branch || '')
      .filter(branch => branch && branch !== '共通' && !isInactiveFavoriteBranch(branch));
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
      skillCountModifiers: buildOptions.skillCountModifiers,
      runtimeEventEffects: buildOptions.runtimeEffects?.eventEffects
    };
                                      
                                   
                                              
                                 
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
      let patternMotionFrames = baseFrames;
      if (skill.skillId === 'Kidian_low' && actionKey === 'lowSkill') {
        const extra = getActiveSkillCountModifierSum(timingContext.skillCountModifiers,
          actionKey, timingContext.artifactCount);
        if (extra > 0) {
          const patterns = normalizeArray(actionTiming.timingPatterns).filter(pattern =>
            pattern.id === 'Kidian_low_pattern02' && pattern.effectId === 'Kidian_low_e01');
          if (patterns.length !== 1 || !(patterns[0].intervalFrames > 0) || !Number.isInteger(extra))
            throw new RangeError('ギデオンの追加攻撃と終了時計の入力を確認できません');
                                                                               
                                                                            
                                                                          
          patternMotionFrames += extra * patterns[0].intervalFrames;
          const notice='ギデオンA2は一部に暫定的な数値を使用しています。HP変化に伴う追加効果の自動発動は未対応です。';
          if (!warnings.includes(notice)) warnings.push(notice);
        }
      }
      motionFramesByVariant[variantKey] = Math.max(patternMotionFrames, lastPatternFrame);
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
    if (skill.skillId === 'Elena_basic' && !favoriteOverrideActive) {
      const damage = normalizeArray(variants.default).filter(event => event.type === 'damage');
      const first = normalizeArray(skill.effects).find(effect => effect.effectId === 'Elena_basic_e01');
      const last = normalizeArray(skill.effects).find(effect => effect.effectId === 'Elena_basic_e03');
      if (damage.length === 3 && getLv1Multiplier(first) === 90 && getLv1Multiplier(last) === 60) {
        let index = 0;
        variants.default = variants.default.map(event => {
          if (event.type !== 'damage') return event;
          const finalHit = index++ === 2;
          return { ...event, effectId: finalHit ? last.effectId : first.effectId,
            coefficientShare: null, nativeCoefficientScale: 150 / (finalHit ? 60 : 90), nativeCoefficientInteger: true,
            nativeEffectDamage: Math.fround(finalHit ? .4 : .3), onlySelectedDamageEffect: true };
        });
      }
    }
    if (skill.skillId === 'Elena_high' && !favoriteOverrideActive
      && summonUnits.some(unit => unit.id === 'Elena_high_drone')) {
                                                                              
                                                                       
      variants.default = normalizeArray(variants.default).filter(event => event.type !== 'damage');
    }
    const exclusiveDamageCandidates = normalizeArray(skill?.dpsExclusiveDamageCandidates)
      .filter(candidate => candidate?.effectId && toFiniteNumber(candidate?.weight) > 0);
    const exclusiveCandidateWeight = exclusiveDamageCandidates.reduce((total, candidate) => (
      total + toFiniteNumber(candidate.weight)
    ), 0);
    let actionVariantNames = branches.filter(Boolean);
    const variantLabels = {};
    let exclusiveVariantSelection = null;
                                                                        
                                                                                     
                                                                             
    const posherChoices = [
      { effectId: 'Posher_low_e03', branch: '黄のポーション', weight: 25 },
      { effectId: 'Posher_low_e01', branch: '緑のポーション', weight: 50 },
      { effectId: 'Posher_low_e02', branch: '赤のポーション', weight: 25 }
    ];
    const posherVariantSelection = normalizeScenarioId(apostle?.id) === 'posher'
      && actionKey === 'lowSkill' && skill?.skillId === 'Posher_low'
      && !exclusiveDamageCandidates.length
      && actionVariantNames.length === 3
      && posherChoices.every(choice => actionVariantNames.includes(choice.branch)
        && normalizeArray(actionTiming.timingEvents).some(row => row.branch === choice.branch
          && row.effectId === choice.effectId && row.frame !== null && row.frame !== undefined
          && Number.isFinite(Number(row.frame)) && Number(row.frame) >= 0)
        && normalizeArray(skill.effects).some(effect => effect.effectId === choice.effectId
          && effect.conditionType === 'ランダム分岐' && effect.conditionValue === choice.branch))
      ? { type: 'weighted', choices: posherChoices.map(({ branch, weight }) => ({ branch, weight })) }
      : null;
                                                                           
                                                                              
                                                                            
                                                        
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
    let motionVariantSelection = null;
    if (actionTiming.variantWeights !== undefined) {
      const weights = actionTiming.variantWeights;
      const choices = Object.entries(weights || {}).map(([branch, weight]) => ({ branch, weight }));
      const sourceBranches = [...new Set(motionVariants.map(item => item.branch))];
      if (!choices.length || !sourceBranches.length || sourceBranches.includes('')
        || choices.length !== sourceBranches.length
        || choices.some(choice => !sourceBranches.includes(choice.branch)
          || typeof choice.weight !== 'number' || !Number.isFinite(choice.weight) || choice.weight <= 0)
        || !Number.isFinite(choices.reduce((sum, choice) => sum + choice.weight, 0))
        || exclusiveVariantSelection || posherVariantSelection || selfStateVariantChoices.length || resourceVariant) {
        throw new RangeError('モーション分岐の抽選重みが不足、不正、または別の選択条件と競合しています');
      }
                                                                         
                                                            
      motionVariantSelection = { type: 'weighted', choices: choices.filter(choice => branches.includes(choice.branch)) };
      if (!motionVariantSelection.choices.length) throw new RangeError('モーション抽選の実行可能分岐がありません');
    }
                                       
                                      
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
                                                                         
                                                                            
    const aliceCardSelection = ['Alice_low','Alice_high'].includes(skill.skillId)
      && !fixedBranch && ['傘持参','残り火注意','かすり傷注意'].every(branch => branches.includes(branch))
      ? {type:'random'} : null;
    const blockedBySelfStateIds = actionKey === 'enhancedAttack'
      ? [...new Set(normalizeArray(skill.effects)
        .filter(effect => String(effect?.conditionType || '') === '固有状態外')
        .map(effect => String(effect?.conditionValue || '').trim())
        .filter(Boolean))]
      : [];
                                                                              
                                                                            
    if (skill.skillId === 'Allet_high' || skill.skillId === 'Vivi_low' || skill.skillId === 'Snorky_low') {
      const allet = skill.skillId === 'Allet_high';
      const snorky = skill.skillId === 'Snorky_low';
      const prefix = allet ? 'Allet_high' : snorky ? 'Snorky_low' : 'Vivi_low';
      const shield = skill.effects.find(effect => effect.effectId === `${prefix}_e01`);
      const lifetime = skill.effects.find(effect => effect.effectId === `${prefix}_e02`);
      const attack = allet ? skill.effects.find(effect => effect.effectId === 'Allet_high_e03') : null;
      const durationFrames = resolveEffectValue(lifetime, buildOptions.skillLevels?.[allet ? 'high' : 'low'] || 1) * 60;
      if (!(shield?.effectTarget === '自身' || (snorky && shield?.effectTarget === '味方/前列'
        && (apostle.position || apostle.basic?.position) === '前列')) || !(durationFrames > 0) || (allet && attack?.effectType !== '攻撃')) {
        throw new Error(`${apostle.name || skill.skillId}のシールド終了効果の入力が不足しています`);
      }
      Object.values(variants).forEach(events => {
        const sources = events.filter(event => event.type === 'effect'
          && (event.effectId === shield.effectId || (!event.effectId && event.effectValueKind === 'シールド')));
        if (sources.length !== 1 || (attack && events.some(event => event.effectId === attack.effectId))) {
          throw new Error(`${apostle.name || skill.skillId}のシールド生成・終了イベントを一意に解決できません`);
        }
        sources[0].effectId = shield.effectId;
        sources[0].selfStateApplication = {
          stateId: shield.effectId, status: 'シールド', kind: 'shield', durationFrames,
          endEvent: attack ? { type: 'damage', effectId: attack.effectId, effectType: '攻撃',
            effectValueKind: attack.valueKind, hitCount: 1, coefficientShare: 1,
            isFinalHit: true, timingQuality: sources[0].timingQuality,
            note: '本人のシールド破壊または持続時間終了時の1命中' } : null
        };
      });
    }
                                                                                
                                                                               
                                                                         
    if (skill.skillId === 'Kommy_low' || skill.skillId === 'Kommy_high' || skill.skillId === 'Tig_high'
      || skill.skillId === 'Joanne_high') {
      const low = skill.skillId === 'Kommy_low';
      const tig = skill.skillId === 'Tig_high';
      const joanne = skill.skillId === 'Joanne_high';
      const stateId = joanne ? 'Joanne_high_e03' : tig ? 'Tig_high_e05' : low ? 'Kommy_low_e04' : 'Kommy_high_e05';
      const durationId = joanne ? 'Joanne_high_e04' : tig ? 'Tig_high_e06' : low ? 'Kommy_low_e05' : 'Kommy_high_e06';
      const stateEffect = skill.effects.find(effect => effect.effectId === stateId);
      const durationEffect = skill.effects.find(effect => effect.effectId === durationId);
      const durationFrames = resolveEffectValue(durationEffect, buildOptions.skillLevels?.[low ? 'low' : 'high'] || 1) * 60;
      if (stateEffect?.effectType !== '固有状態' || stateEffect?.effectTarget !== '自身' || !(durationFrames > 0)) {
        throw new Error(`${apostle.name || skill.skillId}の自己状態・持続時間が不足しています`);
      }
      Object.values(variants).forEach(events => {
        const sources = events.filter(event => event.type === 'effect' && event.effectId === stateId);
        if (sources.length !== 1) throw new Error(`${apostle.name || skill.skillId}の自己状態の発生時刻を一意に解決できません`);
        sources[0].selfStateApplication = {stateId, status: stateEffect.valueKind, durationFrames};
      });
    }
    if (actionKey === 'highSkill' && skill.skillId === 'Selene_favorite_1') {
                                                                             
                                                                       
      const branch = 'セリーネの夜幻影';
      const events = normalizeArray(variants[branch]);
      const hit = events.find(event => event.type === 'damage');
      if (events.filter(event => event.type === 'damage').length !== 1
        || hit?.effectId !== 'Selene_favorite_1_e01') {
        throw new RangeError('セリーネ愛用の独立ダメージ通知が不足しています');
      }
      for (const [stateId, durationId, kind] of [
        ['Selene_favorite_1_e02','Selene_favorite_1_e03','shield'],
        ['Selene_favorite_1_e04','Selene_favorite_1_e05','selfState']
      ]) {
        const effect = resolveEffect(skill, stateId);
        const durationFrames = resolveEffectValue(resolveEffect(skill, durationId), skillLevel) * 60;
        const sources = events.filter(event => event.type === 'effect' && event.effectId === stateId);
        if (effect?.effectTarget !== '自身' || durationFrames !== 480 || sources.length !== 1
          || sources[0].frame <= hit.frame || sources[0].frame >= motionFramesByVariant[branch]) {
          throw new RangeError('セリーネ愛用の自己状態通知・持続が不足しています');
        }
        sources[0].selfStateApplication = {stateId,status:effect.valueKind,kind,durationFrames,
          reference:effect.reference || ''};
      }
      const stateEvents = events.filter(event => event.selfStateApplication);
      if (stateEvents[0].frame !== stateEvents[1].frame) throw new RangeError('セリーネ愛用の自己通知時刻が不一致です');
    }
                                                                         
                                                                            
                                                                            
    const motionLinkedInstances = new Map();
    generatedEvents.filter(event => event.generatedSpawnOrigin === 'モーション内').forEach(event => {
                                                                          
                                                                                
                                                                           
      const key = event.generatedInstanceKey;
      if (!motionLinkedInstances.has(key)) motionLinkedInstances.set(key, []);
      motionLinkedInstances.get(key).push(event);
    });
    if (motionLinkedInstances.size) Object.entries(variants).forEach(([variant, events]) => {
      motionLinkedInstances.forEach(sequence => {
        const first = sequence[0];
        if (first.branch && first.branch !== '共通' && first.branch !== variant) return;
        const spawnFrame = first.generatedSpawnFrame;
        const end = motionFramesByVariant[variant] ?? motionFrames;
        if (!Number.isFinite(spawnFrame) || spawnFrame < 0 || spawnFrame > end
          || sequence.some(event => event.frame < spawnFrame)) {
          throw new RangeError('モーション内生成の発生時刻・生成後イベントが不正です');
        }
        events.push({frame: spawnFrame, eventOrder:0, type:'effect', hitCount:0,
          timingQuality:first.timingQuality, motionLinkedGeneratedEvents:sequence,
          note:first.note || ''});
      });
      events.sort((a,b) => a.frame-b.frame || toFiniteNumber(a.eventOrder)-toFiniteNumber(b.eventOrder));
    });
    if (repeatPolicy && (skill === baseSkill || skill.skillId === 'Snorky_favorite_1')) {
                                                                              
                                                                                    
      const favorite = skill.skillId === 'Snorky_favorite_1';
      const branch = favorite ? 'スノキーのフェドーラ' : 'default';
      const damageId = favorite ? 'Snorky_favorite_1_e01' : 'Snorky_enhanced_e01';
      const notifications = normalizeArray(actionTiming.timingEvents).filter(event => (
        (favorite ? event.branch === branch : !event.branch) && event.effectId === damageId
        && event.timingBasis === 'rawMotion'
      ));
      if (favorite && normalizeArray(actionTiming.timingEvents).length && notifications.length !== 1) {
        throw new RangeError('スノキー愛用の連続強化通知の原時刻が不足しています');
      }
      if (notifications.length > 1) throw new RangeError('スノキーの連続強化攻撃の通知時刻が重複しています');
      if (notifications.length === 1) {
        const candidates = normalizeArray(variants[branch]).filter(event => (
          event.type === 'damage' && event.effectId === damageId
          && event.frame === notifications[0].frame
        ));
        if (candidates.length !== 1) throw new RangeError('スノキーの連続強化攻撃の通知を命中処理へ接続できません');
        let repeatNotification = candidates[0];
        if (favorite) {
          const stun = normalizeArray(variants[branch]).find(event => event.effectId === 'Snorky_favorite_1_e02');
          const probability = resolveEffectValue(resolveEffect(skill,'Snorky_favorite_1_e03'),skillLevel);
          if (!stun?.statusApplication || stun.frame !== candidates[0].frame
            || probability !== 50 || stun.statusApplication.durationFrames !== 120) {
            throw new RangeError('スノキー愛用の気絶通知・確率・持続が不足しています');
          }
          stun.statusApplication.applicationProbability = probability;
          stun.statusApplication.stackGroupId = 'Snorky_favorite_1:気絶:single:1';
                                                                           
                                                                         
          repeatNotification = stun;
        }
        repeatNotification.enhancedRepeatNotification = true;
        repeatPolicy.notificationVariants = [branch];
      }
    }
    if (actionKey === 'enhancedAttack' && skill.skillId === 'Barong_favorite_1') {
                                                                           
                                                                              
      const events = variants['バロンの呪いのぬいぐるみ'];
      const hits = normalizeArray(events).filter(event => event.type === 'damage');
      const definition = statusDefinitions.find(item => item.applicationEffectId === 'Barong_favorite_1_e02');
      const amount = resolveEffectValue(resolveEffect(skill, 'Barong_favorite_1_e02'), skillLevel);
      if (hits.length !== 3 || hits.some(event => event.effectId !== 'Barong_favorite_1_e01')
        || definition?.status !== '攻撃速度減少' || definition.durationFrames !== 300
        || definition.maxStacks !== 1 || amount !== 30) {
        throw new RangeError('バロン愛用の3命中・敵攻速低下・持続の入力が不足しています');
      }
      hits[2].statusApplication = {...definition, stackGroupId:'Barong_favorite_1:攻撃速度減少:single:1'};
      hits[2].statusApplicationPhase = 'afterDamage';
    }
    if (pendingRecoveryTiming) {
                                                                               
                                                                         
      variants.default = [];
      warnings.push(`${skill.skillId}: 回復の適用時刻は未確認です。発動・CTのみを反映します`);
    }
    if (nonOccupyingImmediate && !pendingRecoveryTiming && Object.values(variants).some(events => !events.length
      || events.some(event => event.frame !== 0 || event.timingQuality === 'fallbackEnd'))) {
      throw new RangeError('非占有高学年の未確定命中を0秒へ置換できません');
    }
    return {
      key: actionKey,
      activationMode: nonOccupyingImmediate ? 'nonOccupyingImmediate' : 'motion',
      ...(pendingRecoveryTiming ? {pendingRecoveryTiming:true} : {}),
      eventTimingContractVersion: actionTiming.eventTimingContractVersion || 0,
      normalAttackIntervalBasis,
      label: skill?.dpsActionName
        ? `${ACTION_LABELS[actionKey]}（${skill.dpsActionName}）`
        : ACTION_LABELS[actionKey],
      skillId: skill.skillId || '',
      motionFrames,
      motionFramesByVariant,
      variants,
      generatedEvents,
      summonUnits,
      statusDefinitions,
      variantNames: actionVariantNames,
      variantLabels,
      variantSelection: motionVariantSelection || exclusiveVariantSelection || posherVariantSelection || aliceCardSelection || (selfStateVariantChoices.length
        ? {
            type: 'selfState',
            choices: selfStateVariantChoices,
            fallbackBranch: branches.includes('') ? 'default'
              : (branches.find(branch => !selfStateVariantBranches.has(branch)) || actionVariantNames[0] || 'default')
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
      repeatPolicy,
      transitionFrames: nonOccupyingImmediate ? 0 : actionKey === 'lowSkill' || actionKey === 'highSkill' ? 2 : 0,
      requiredSp: actionKey === 'lowSkill' ? Math.max(1, toFiniteNumber(skill.requiredSp, 300)) : 0,
      cooldownSeconds: actionKey === 'highSkill' ? Math.max(0, toFiniteNumber(skill.cooldownSeconds)) : 0
    };
  }

  function buildCombatantConfig(apostle, timing, buildOptions = {}) {
    const warnings = normalizeArray(buildOptions.runtimeEffects?.warnings).map(String).filter(Boolean);
    const intrinsicExternalEvents = [];
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
      buildOptions.enemyCount ?? scenario?.battleConditions?.epicaA2EnemyCount ?? scenario?.battleConditions?.enemyCount,
      1
    )));
    const scenarioArtifactCount = getScenarioArtifactCount(scenario, apostle?.id);
    const artifactCount = Number.isFinite(Number(buildOptions.artifactCount))
      ? Math.max(0, Math.floor(Number(buildOptions.artifactCount)))
      : scenarioArtifactCount;
                                         
                                        
                            
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
      if (normalizeScenarioId(apostle?.id) === 'jade' && current.id === '翡翠玉'
        && normalizeArray(resource.heldAddEffectIds).includes('Jade_aside_2_e02')) {
        if (resource.heldAddPPerStack !== 9 || current.maxStacks !== 3
          || JSON.stringify(resource.heldAddActionKeys) !== '["lowSkill","highSkill"]') {
          throw new RangeError('ジェイドの翡翠玉所持補正が不正です');
        }
        current.heldAddEffectIds = ['Jade_aside_2_e02'];
        current.heldAddPPerStack = 9;
        current.heldAddActionKeys = ['lowSkill','highSkill'];
      }
      if (normalizeScenarioId(apostle?.id) === 'jade' && current.id === '翡翠玉'
        && resource.heldHasteEffectId === 'Jade_aside_2_e03') {
        if (resource.heldHastePPerStack !== 5 || current.maxStacks !== 3) {
          throw new RangeError('ジェイドの翡翠玉攻速補正が不正です');
        }
        current.heldHasteEffectId = resource.heldHasteEffectId;
        current.heldHastePPerStack = 5;
      }
      runtimeResourceMap.set(current.id, current);
    });
    const runtimeResources = Array.from(runtimeResourceMap.values());
                                                                           
                                                                                
    if (Array.isArray(buildOptions.runtimeEffects?.resourceHeldEffects)) {
      const enabled = effectId => buildOptions.runtimeEffects.resourceHeldEffects.some(effect => (
        effect.effectId === effectId && effect.mode !== 'off'
      ));
      runtimeResources.forEach(resource => {
        if (normalizeScenarioId(apostle?.id) !== 'jade' || resource.id !== '翡翠玉') return;
        if (!enabled('Jade_aside_2_e02')) {
          resource.heldAddEffectIds = [];
          resource.heldAddPPerStack = 0;
        }
        if (!enabled('Jade_aside_2_e03')) {
          delete resource.heldHasteEffectId;
          resource.heldHastePPerStack = 0;
        }
      });
    }
    const intervalValues = [...new Set(normalizeArray(timing?.normalAttackIntervalVariants)
      .filter(item => timing?.actions?.[item?.actionKey]?.normalAttackIntervalBasis !== 'motion')
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
    if (normalizeScenarioId(apostle?.id) === 'shoupan' && !actions.enhancedAttack) {
                                                                              
                                                                               
      warnings.push('シュパンの強化行動による回復・移動は未反映です。愛用品の付随効果も再現していません。');
    }
    if (normalizeScenarioId(apostle?.id) === 'joanne' && asideRank === 0) {
      if (actions.enhancedAttack) {
        const row = String(scenario?.actors?.self?.position || '');
        const ordinaryBranch = `${row}・通常`;
        const dreamBranch = `${row}・夢現`;
        if (!['前列','中列','後列'].includes(row)
          || !actions.enhancedAttack.variantNames.includes(ordinaryBranch)
          || !actions.enhancedAttack.variantNames.includes(dreamBranch)) {
          throw new RangeError('ジョアンの支援に必要な配置列が未設定です');
        }
                                                                            
                                                                             
        actions.enhancedAttack.variantSelection = {type:'selfState',
          choices:[{branch:dreamBranch,stateId:'Joanne_high_e03'}],fallbackBranch:ordinaryBranch};
        const skill = findSkill(apostle, 'enhancedAttack');
        const intrinsic = (id, durationId, kind, target) => {
          const effect = resolveEffect(skill, id);
          const durationEffect = resolveEffect(skill, durationId);
          const value = resolveEffectValue(effect);
          const durationFrames = resolveEffectValue(durationEffect) * 60;
          if (effect?.valueKind !== kind || effect.effectTarget !== target
            || !Number.isFinite(value) || value < 0 || !(durationFrames > 0)) {
            throw new RangeError('ジョアン支援の本人受取・持続入力が不正です');
          }
          return {id:`${id}:intrinsic:self`,runtimeBaseEffectId:id,sourceId:apostle.id,
            label:kind,mode:'sourceEventTimed',triggerSourceId:id,
            triggerActionKeys:['enhancedAttack'],sourceEventFallbackMode:'disabled',
            durationFrames,stackable:false,maxStacks:1,oncePerAction:false,value};
        };
        const ownedSupport = effect => {
          const ids = [effect?.id,effect?.runtimeBaseEffectId,effect?.effectId].map(value=>String(value||''));
          return ids.some(id=>/^Joanne_enhanced_e(?:01|03|05|09|11)(?:$|:)/.test(id))
            && (normalizeScenarioId(effect?.ownerId) === 'joanne'
              || normalizeScenarioId(effect?.sourceId) === 'joanne'
              || ids.some(id=>/:owner:Joanne(?:$|:)|:intrinsic:self$/.test(id)));
        };
        const runtimeEffects = {...buildOptions.runtimeEffects};
        for (const key of ['damageBuffEffects','attackSpeedEffects','spRegenEffects','spRecoveryEffects']) {
          runtimeEffects[key] = normalizeArray(runtimeEffects[key]).filter(effect=>!ownedSupport(effect));
        }
        if (row === '中列') {
          const buff=intrinsic('Joanne_enhanced_e03','Joanne_enhanced_e04','普通攻撃ダメージ量増加','味方全員');
          runtimeEffects.damageBuffEffects.push({...buff,modifiers:{normalAttackAddP:buff.value}});
          const haste=intrinsic('Joanne_enhanced_e09','Joanne_enhanced_e10','攻撃速度増加','中列の味方');
          runtimeEffects.attackSpeedEffects.push({...haste,hasteP:haste.value});
        } else if (row === '後列') {
          const buff=intrinsic('Joanne_enhanced_e05','Joanne_enhanced_e06','スキルダメージ量増加','味方全員');
          runtimeEffects.damageBuffEffects.push({...buff,modifiers:{skillAddP:buff.value}});
          const regen=intrinsic('Joanne_enhanced_e11','Joanne_enhanced_e12','毎秒SP回復量増加','後列の味方');
          runtimeEffects.spRegenEffects.push({...regen,fixed:regen.value,percent:0});
        }
                                                                               
                                                                                
        buildOptions = {...buildOptions,runtimeEffects};
      }
                                                                            
                                                                             
                                                                          
      for (const key of ['basicAttack', 'lowSkill']) {
        const action = actions[key];
        if (!action) continue;
        if (!action.variantNames.includes('通常') || !action.variantNames.includes('夢現')) {
          throw new RangeError('ジョアンの通常・夢現の行動入力が不足しています');
        }
        action.variantSelection = {type:'selfState',
          choices:[{branch:'夢現',stateId:'Joanne_high_e03'}],fallbackBranch:'通常'};
      }
      if (actions.basicAttack) {
        for (const [branch, events] of Object.entries(actions.basicAttack.variants)) {
          const hits = events.filter(event => event.type === 'damage');
          const effectId = branch === '通常' ? 'Joanne_basic_e01' : 'Joanne_basic_e02';
          const multiplier = branch === '通常' ? 200 : 500;
          if (hits.length !== 1 || hits[0].hitCount !== 1
            || hits[0].lv1PerHitMultiplier !== multiplier) {
            throw new RangeError('ジョアンの基本攻撃の置換・命中入力が不正です');
          }
                                                                            
                                                                             
                                                                                
          hits[0].effectId = effectId;
          hits[0].coefficientShare = 1;
          hits[0].onlySelectedDamageEffect = true;
        }
      }
    }
                                                                             
                                                                          
    if (normalizeScenarioId(apostle?.id) === 'snorky' && actions.highSkill) {
      Object.values(actions.highSkill.variants).forEach(events => events.forEach(event => {
        if (event.type === 'damage' && event.effectId === 'Snorky_high_e01') event.onlySelectedDamageEffect = true;
      }));
    }
    const epicaA2TimingApproximation = normalizeScenarioId(apostle?.id) === 'epica' && asideRank >= 2;
    const epicaLowEffects = normalizeScenarioId(apostle?.id) === 'epica'
      ? normalizeArray(findSkill(apostle, 'lowSkill')?.effects) : [];
    const epicaLowReplacementDurationFrames = epicaLowEffects.some(effect => effect.effectId === 'Epica_low_e04')
      ? Math.max(0, toFiniteNumber(resolveEffectValue(epicaLowEffects.find(effect => effect.effectId === 'Epica_low_e05')))) * 60 : 0;
    const unlockedAsideEffects = Object.entries(apostle?.aside?.levels || {})
      .filter(([level]) => Number(level) > 0 && Number(level) <= asideRank)
      .flatMap(([, data]) => normalizeArray(data?.effects));
                                                                                   
                                                                                     
    const passiveProbabilityEffects = normalizeArray(apostle?.skills)
      .filter(skill => skill.skillType === 'パッシブ')
      .flatMap(skill => normalizeArray(skill.effects).map(effect => ({
        ...effect, probabilityLevel: getSkillLevel(skill, buildOptions.skillLevels || {})
      })));
                                                                          
                                                                       
                                                                    
    const isNaia = normalizeScenarioId(apostle?.id) === 'naia';
    const naiaCooldownPassive = isNaia
      ? passiveProbabilityEffects.filter(effect => effect.effectId === 'Naia_passive_e01') : [];
    let intrinsicCooldownFixedSeconds = 0;
    if (isNaia) {
      if (!naiaCooldownPassive.length) throw new Error('ナイアの常時CT短縮の入力が不足しています');
      if (naiaCooldownPassive.length !== 1) throw new Error('ナイアの常時CT短縮が重複しています');
      const effect = naiaCooldownPassive[0];
      const value = resolveEffectValue(effect, effect.probabilityLevel);
      if (effect.valueKind !== 'クールタイム減少' || effect.effectTarget !== '自身'
        || effect.conditionType || effect.condition || effect.triggerType
        || effect.duration || effect.durationSeconds || effect.durationFrames
        || !Number.isFinite(value) || value < 0) {
        throw new Error('ナイアの常時CT短縮の対象・条件・数値を確認してください');
      }
      intrinsicCooldownFixedSeconds = value;
    }
    const additionalPowerAttackRate = [...passiveProbabilityEffects, ...unlockedAsideEffects]
      .filter(effect => ['強化攻撃発動確率増加', '強化攻撃確率増加'].includes(effect.valueKind)
        && effect.effectTarget === '自身' && !effect.conditionType && !effect.condition
        && !effect.triggerType && !effect.effectStack
        && !effect.duration && !effect.durationSeconds && !effect.durationFrames)
      .reduce((sum, effect) => sum + Math.max(0, toFiniteNumber(resolveEffectValue(effect, effect.probabilityLevel))), 0);
    if (/^一定確率/.test(actions.enhancedAttack?.triggerType || '')) {
      actions.enhancedAttack.triggerProbability = Math.fround(
        Math.trunc(actions.enhancedAttack.triggerValue) + Math.fround(additionalPowerAttackRate)
      );
    }
    if (epicaA2TimingApproximation) {
      if (['basicAttack', 'enhancedAttack'].some(key => !actions[key]
        || !Object.values(actions[key].variants).some(events => events.filter(event => event.type === 'damage').length === 2))) {
        throw new Error('エピカA2の基本・強化追加命中タイミングを生成してください。');
      }
      ['basicAttack', 'enhancedAttack'].forEach(key => {
        const action = actions[key];
        if (!action) return;
        action.detachedProjectileTiming = true;
        Object.values(action.variants).forEach(events => events.forEach(event => {
          if (event.type === 'damage') event.coefficientShare = event.coefficientShare || 1;
        }));
      });
      warnings.push('エピカA2暫定: 単体・静止敵、同弾速、元命中の6ゲームF後に追加命中と仮定。高学年中はアサイドなしと同じ行動処理、CT0後は既存オートの優先順位を使用。追加命中の総SP・外部命中効果と速度変更中の着弾は未確認です。');
    }
    Object.values(actions).forEach(action => {
      Object.entries(action.variants || {}).forEach(([variant, events]) => {
        const end = action.motionFramesByVariant?.[variant] ?? action.motionFrames;
        events.forEach(event => {
          const legacyProjectile = action.detachedProjectileTiming && event.type === 'damage'
            && event.afterAction == null;
          if (event.afterAction === '継続') {
            if (!['ゲーム時間', '従来換算（暫定）'].includes(event.eventClock)
              || event.timeOrigin !== '動作開始') throw new RangeError(`${action.label}: 継続イベントの時計・時間基準が未対応です`);
          } else if (event.eventClock === 'ゲーム時間' && event.afterAction === '終了') {
                                                                                   
            if (event.timeOrigin !== '動作開始') throw new RangeError(`${action.label}: ゲーム時間イベントの時間基準が未対応です`);
          } else if (!legacyProjectile && event.frame > end
            && (action.eventTimingContractVersion || event.afterAction != null)) {
            throw new RangeError(`${action.label}: 行動終了後の発生時刻があります。スキルタイミングのイベント時計・行動終了後を確認してください（${event.frame}F / 終了${end}F）`);
          }
        });
      });
    });
    if (normalizeScenarioId(apostle?.id) === 'rufo'
      && actions.enhancedAttack?.skillId === 'Rufo_enhanced') {
                                                                             
                                                                              
                                                                         
      Object.entries(actions.enhancedAttack.variants || {}).forEach(([branch,events]) => {
        if (branch !== 'default' || events.some(event => event.effectId === 'Rufo_enhanced_e02')) return;
        events.push({type:'selfState',frame:Math.fround(0.20000001788139343) * 60,
          effectId:'Rufo_enhanced_e02',label:'目くらまし',timingQuality:'asset',
          selfStateApplication:{stateId:'Rufo_enhanced_e02',status:'目くらまし',durationFrames:240}});
        events.sort((a,b)=>a.frame-b.frame);
      });
    }
    if (normalizeScenarioId(apostle?.id) === 'risty' && asideRank >= 2 && enemyCount !== 1) {
      Object.entries(actions.highSkill?.variants || {}).forEach(([branch,events]) => {
        actions.highSkill.variants[branch]=events.filter(event=>!normalizeArray(event.motionLinkedGeneratedEvents)
          .some(item=>item.generatedObjectId==='Risty_aside_high_extra'));
      });
      warnings.push('リスティA2の追加攻撃は敵1体の比較にのみ対応しています。');
    }
    const timingEffectIds = new Set();
    const reservationInput = buildOptions.runtimeEffects?.yomiAsideReservations;
    const yomiAsideReservations = normalizeScenarioId(apostle?.id) === 'yomi'
      && enemyCount === 1 && actions.enhancedAttack?.skillId === 'Yomi_enhanced' && reservationInput
      ? { ...reservationInput, delaySeconds:[...reservationInput.delaySeconds] } : null;
    if (yomiAsideReservations) {
      if (yomiAsideReservations.sourceEffectId !== 'Yomi_enhanced_e01'
        || yomiAsideReservations.effectId !== 'Yomi_aside_2_e03'
        || yomiAsideReservations.delaySeconds.length !== 3
        || yomiAsideReservations.delaySeconds.some((delay,index)=>delay !== [.5,.8,1.1][index])) {
        throw new RangeError('ヨミの追加攻撃予約入力が不正です');
      }
      timingEffectIds.add(yomiAsideReservations.effectId);
    }
    if (reservationInput && enemyCount !== 1) warnings.push('ヨミA2の追加攻撃は敵1体の比較にのみ対応しています。');
    if (normalizeScenarioId(apostle?.id) === 'chloe' && actions.basicAttack) {
      const form = actions.basicAttack.variants?.['ぬいぐるみの意志'];
      const hits = normalizeArray(form).filter(event => event.type === 'damage');
      if (hits.length !== 3 || hits.some((event, index) =>
        event.effectId !== ['Chloe_basic_e02','Chloe_basic_e02','Chloe_basic_e04'][index]
        || event.hitCount !== 1 || !Number.isFinite(event.frame))) {
        throw new RangeError('クロエ変身基本の3通知入力が不足しています');
      }
      const explicit = form.filter(event => event.effectId === 'Chloe_low_e04');
      if (explicit.length && explicit.length !== 3) {
        throw new RangeError('クロエ変身バフの通知数が一致しません');
      }
      if (!explicit.length) {
                                                                             
                                                                                
        hits.forEach(hit => form.push({frame:hit.frame,
          eventOrder:toFiniteNumber(hit.eventOrder,1000)+.25,
          type:'effect',effectId:'Chloe_low_e04',effectType:'バフ',hitCount:0,
          eventClock:hit.eventClock,afterAction:hit.afterAction,timeOrigin:hit.timeOrigin,
          timingQuality:'provisional',note:'暫定: 変身基本の各命中直後に普通攻撃バフを付与'}));
        form.sort((a,b)=>a.frame-b.frame || toFiniteNumber(a.eventOrder)-toFiniteNumber(b.eventOrder));
      }
      warnings.push('クロエ通常暫定: 変身基本の各命中直後に普通攻撃バフを付与します。実際の同一通知内の前後関係は未確認です。');
    }
    if (normalizeScenarioId(apostle?.id) === 'vivi') {
      warnings.push('ヴィヴィ通常暫定: 固定単体敵を低学年の盾終了効果の範囲内として扱います。被弾による早期破壊は外部イベントで指定し、高学年の盾から防御低下は発動しません。');
    }
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
    if (normalizeScenarioId(apostle?.id) === 'sherum' && asideRank >= 2
      && Object.values(actions.highSkill?.variants || {}).some(events =>
        normalizeArray(events).some(event => event.effectId === 'Sherum_high_e01' && event.ownerArea))) {
                                                                            
                                                                             
      timingEffectIds.add('Sherum_aside_2_e03');
      warnings.push('シェルムA2の領域効果に暫定的な処理を使用しています。');
    }
    const resolveSourceEventMode = (effect, sourceMode, fallbackMode) => {
      const mode = String(effect?.mode || fallbackMode);
      if (mode !== sourceMode) return mode;
      const triggerSourceId = String(effect?.triggerSourceId || '');
      if (triggerSourceId && timingEffectIds.has(triggerSourceId)) return mode;
                                                                        
                                                                          
                                                                        
      if (normalizeScenarioId(apostle?.id) === 'chloe'
        && effect.id === 'Chloe_aside_2_e07:owner:Chloe'
        && triggerSourceId === 'Chloe_low_e01' && effect.hasteP === 30
        && effect.durationFrames === 420
        && normalizeArray(buildOptions.runtimeEffects?.eventEffects).some(producer =>
          producer.triggerType === '低学年スキル使用時'
          && normalizeArray(producer.steps).some(step => step.type === 'selfState'
            && step.application?.stateId === triggerSourceId
            && step.application?.durationFrames > 0))) return mode;
      const resolvedFallbackMode = String(effect?.sourceEventFallbackMode || fallbackMode);
      if (normalizeScenarioId(apostle?.id) === 'yomi'
        && triggerSourceId === 'Yomi_aside_2_e03' && resolvedFallbackMode === 'disabled') {
        warnings.push('ヨミA2の追加攻撃と付随効果は未反映です。');
        return 'disabled';
      }
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
      runtimeBaseEffectId: String(effect?.runtimeBaseEffectId || ''),
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
    const accelerationEffects = normalizeArray(buildOptions.runtimeEffects?.accelerationEffects)
      .map((effect, index) => ({
        id: String(effect?.id || `acceleration:${index}`),
        effectId: String(effect?.effectId || ''),
        sourceId: String(effect?.sourceId || ''),
        externalSourceId: String(effect?.externalSourceId || ''),
        externalTriggerType: String(effect?.externalTriggerType || ''),
        label: String(effect?.label || effect?.id || '全行動速度効果'),
        mode: resolveSourceEventMode(effect, 'sourceEventTimed', 'actionTimed'),
        triggerSourceId: String(effect?.triggerSourceId || ''),
        accelerationP: toFiniteNumber(effect?.accelerationP),
        maxAccelerationP: effect?.effectId === 'Renewa_high_e01' ? Math.max(0, toFiniteNumber(effect?.accelerationP)) : Math.max(
          0,
          toFiniteNumber(effect?.maxAccelerationP, toFiniteNumber(effect?.accelerationP))
        ),
        maxActionSpeedP: effect?.effectId === 'Renewa_high_e01' ? 100 + Math.max(0, toFiniteNumber(effect?.accelerationP)) : Math.max(
          100,
          toFiniteNumber(effect?.maxActionSpeedP, 100 + toFiniteNumber(
            effect?.maxAccelerationP,
            toFiniteNumber(effect?.accelerationP)
          ))
        ),
        curve: effect?.effectId === 'Renewa_high_e01' ? 'linearHold' : String(effect?.curve || 'constant'),
        rampFrames: effect?.effectId === 'Renewa_high_e01' ? 420 : Math.max(0, toFiniteNumber(effect?.rampFrames)),
        holdFrames: effect?.effectId === 'Renewa_high_e01' ? 180 : Math.max(0, toFiniteNumber(effect?.holdFrames)),
        durationFrames: effect?.effectId === 'Renewa_high_e01' ? 600 : Math.max(0, toFiniteNumber(effect?.durationFrames)),
        intervalFrames: Math.max(0, toFiniteNumber(effect?.intervalFrames)),
        triggerEveryCount: Math.max(0, Math.floor(toFiniteNumber(effect?.triggerEveryCount))),
        triggerActionKeys: normalizeArray(effect?.triggerActionKeys).map(String),
        triggerPhase: effect?.triggerPhase === 'end' ? 'end' : 'start',
        maxStacks: Math.max(0, Math.floor(toFiniteNumber(effect?.maxStacks, 1))),
        fixedStacks: Math.max(1, Math.floor(toFiniteNumber(effect?.fixedStacks, 1))),
        stackable: !!effect?.stackable,
        resetActionKeys: normalizeArray(effect?.resetActionKeys).map(String),
        sourceEventFallbackMode: String(effect?.sourceEventFallbackMode || 'actionTimed')
      }))
      .filter(effect => effect.id && effect.accelerationP);
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
      mode: effect?.mode === 'sourceEventTimed'
        ? resolveSourceEventMode(effect, 'sourceEventTimed', 'disabled')
        : effect?.mode === 'externalTimed' ? 'externalTimed' : 'constant',
      ...(effect?.mode === 'sourceEventTimed' ? {
        triggerSourceId: String(effect?.triggerSourceId || ''),
        triggerActionKeys: normalizeArray(effect?.triggerActionKeys).map(String)
      } : {}),
      durationFrames: Math.max(0, toFiniteNumber(effect?.durationFrames)),
      fixed: toFiniteNumber(effect?.fixed),
      baseFixed: toFiniteNumber(effect?.baseFixed),
      percent: toFiniteNumber(effect?.percent)
    })).filter(effect => effect.fixed || effect.percent);
    const spRecoveryEffects = normalizeArray(buildOptions.runtimeEffects?.spRecoveryEffects).map((effect, index) => ({
      id: String(effect?.id || `spRecovery:${index}`),
      sourceId: String(effect?.sourceId || ''),
      externalSourceId: String(effect?.externalSourceId || ''),
      externalTriggerType: String(effect?.externalTriggerType || ''),
      externalBindingKey: String(effect?.externalBindingKey || ''),
      effectId: String(effect?.effectId || ''),
      label: String(effect?.label || effect?.id || 'SP回復効果'),
      mode: resolveSourceEventMode(effect, 'sourceEvent', 'action'),
      triggerSourceId: String(effect?.triggerSourceId || ''),
      fixed: toFiniteNumber(effect?.fixed),
      percent: toFiniteNumber(effect?.percent),
      fixedMin: toFiniteNumber(effect?.fixedMin, effect?.fixed),
      amountModifierP: toFiniteNumber(effect?.amountModifierP),
      ...(effect?.unitDelaySeconds === undefined ? {} : {unitDelaySeconds: (() => {
        if (typeof effect.unitDelaySeconds !== 'number' || !Number.isFinite(effect.unitDelaySeconds)
          || effect.unitDelaySeconds <= 0 || !['action','actionHit'].includes(effect.mode)) {
          throw new RangeError('SP回復のunit待機時間が不正です');
        }
        return Math.fround(effect.unitDelaySeconds);
      })()}),
      ...(effect?.resolvedRecoveryFactors === undefined ? {} : {
        resolvedRecoveryFactors: normalizeResolvedSpRecoveryFactors(effect)
      }),
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
      ...(effect?.randomValueType === 'float' ? {randomValueType:'float'} : {}),
      sourceEventFallbackMode: String(effect?.sourceEventFallbackMode || 'action')
    })).filter(effect => effect.id && (
      effect.fixed || effect.percent || effect.fixedMin || effect.fixedMax || effect.percentMin || effect.percentMax
    ));
    if (normalizeScenarioId(apostle?.id) === 'posher' && asideRank === 0) {
      warnings.push('ポーシャーの変異は持続時間とデバフ状態を反映しますが、敵の基礎能力はプリセット値を維持する暫定モデルです。ワールドボスへの変異は無効です');
    }
                                                                            
                                                                          
                                                                           
                                                                            
    if (normalizeScenarioId(apostle?.id) === 'alice' && asideRank === 0
      && (normalizeArray(apostle.skills).some(skill => skill.skillId === 'Alice_passive')
        || spRecoveryEffects.some(effect => effect.effectId === 'Alice_passive_e02'))) {
      const passive = normalizeArray(apostle.skills).find(skill => skill.skillId === 'Alice_passive');
      const recovery = resolveEffect(passive, 'Alice_passive_e02');
      const fixed = resolveEffectValue(recovery, getSkillLevel(passive, buildOptions.skillLevels));
      if (recovery?.valueKind !== 'SP回復' || recovery.valueClass !== '固定値'
        || recovery.effectTarget !== '自身' || !Number.isFinite(fixed) || fixed < 0) {
        throw new RangeError('アリスの強化命中SP回復入力が不正です');
      }
      const existing = spRecoveryEffects.filter(effect => effect.effectId === recovery.effectId);
      if (existing.length > 1 || existing.some(effect => effect.mode !== 'actionHit'
        || effect.fixed !== fixed || effect.percent !== 0
        || effect.triggerActionKeys.length !== 1 || effect.triggerActionKeys[0] !== 'enhancedAttack'
        || effect.random || effect.triggerEveryCount || effect.externalTriggerType)) {
        throw new RangeError('アリスの強化命中SP回復が重複または別の発動設定になっています');
      }
      const effect = existing[0] || {id:'alice-passive-intrinsic-sp',sourceId:apostle.id,
        effectId:recovery.effectId,label:'強化攻撃命中時のSP回復',mode:'actionHit',
        fixed,percent:0,triggerActionKeys:['enhancedAttack']};
      effect.oncePerAction = false;
      effect.alicePassiveResetFrames = 60;
      if (!existing.length) spRecoveryEffects.push(effect);
      warnings.push('アリスのSP回復期限と強化命中が同時の場合は、期限終了を先に処理する暫定モデルです');
    }
                                                                          
                                                                                
    if (normalizeScenarioId(apostle?.id) === 'jade') {
      const highSkill = normalizeArray(apostle.skills).find(skill => skill.skillId === 'Jade_high');
      const recoveryRows = normalizeArray(highSkill?.effects).filter(effect => effect.effectId === 'Jade_high_e04');
      const recovery = recoveryRows[0];
      const percent = resolveEffectValue(recovery, getSkillLevel(highSkill, buildOptions.skillLevels));
      const timedRows = normalizeArray(timing?.actions?.highSkill?.timingEvents)
        .filter(row => row.effectId === 'Jade_high_e04');
      if (highSkill?.skillType !== '高学年' || recoveryRows.length !== 1 || recovery?.valueKind !== 'SP回復'
        || recovery.valueClass !== '倍率' || recovery.effectTarget !== '自身'
        || recovery.conditionType || recovery.condition || recovery.durationSeconds || recovery.durationFrames
        || !Number.isFinite(percent) || percent < 0
        || timedRows.length !== 1 || !Number.isFinite(timedRows[0].frame)
        || timedRows[0].frame < 0 || timedRows[0].effectKind !== 'SP回復') {
        throw new RangeError('ジェイドの高学年SP回復の入力・発生時刻が不正です');
      }
      const existing = spRecoveryEffects.filter(effect => effect.effectId === recovery.effectId
        && (!effect.sourceId || normalizeScenarioId(effect.sourceId) === 'jade'));
      if (existing.length > 1 || existing.some(effect => effect.mode !== 'sourceEvent'
        || effect.triggerSourceId !== recovery.effectId || effect.percent !== percent || effect.fixed !== 0)) {
        throw new RangeError('ジェイドの高学年SP回復が重複または別の発動設定になっています');
      }
      if (!existing.length && percent > 0) spRecoveryEffects.push({
        id: 'jade-high-intrinsic-sp', sourceId: apostle.id, effectId: recovery.effectId,
        label: '高学年のSP回復', mode: 'sourceEvent', triggerSourceId: recovery.effectId,
        fixed: 0, percent, triggerActionKeys: ['highSkill'], oncePerAction: true,
        sourceEventFallbackMode: 'actionTimed'
      });
    }
                                                                            
                                                                                
    if (normalizeScenarioId(apostle?.id) === 'yomi'
      && normalizeArray(actions.highSkill?.variants?.default).some(event => event.ownerArea)) {
      const high = normalizeArray(apostle.skills).find(skill => skill.skillId === 'Yomi_high');
      const recovery = resolveEffect(high,'Yomi_high_e01');
      const fixed = resolveEffectValue(recovery,getSkillLevel(high,buildOptions.skillLevels));
      if (recovery?.valueClass !== '固定値' || recovery.effectTarget !== '月光内の味方'
        || !Number.isFinite(fixed) || fixed < 0) throw new RangeError('ヨミの月光SP回復入力が不正です');
      const existing=spRecoveryEffects.filter(effect=>effect.effectId===recovery.effectId);
      const moonlightFactors = buildOptions.runtimeEffects?.yomiMoonlightRecoveryFactors === undefined
        ? undefined : normalizeResolvedSpRecoveryFactors({ resolvedRecoveryFactors: buildOptions.runtimeEffects.yomiMoonlightRecoveryFactors });
      if (existing.length > 1 || existing.some(effect=>effect.mode!=='sourceEvent'
        || effect.triggerSourceId!==recovery.effectId || effect.fixed!==fixed || effect.percent!==0
        || effect.oncePerAction || !effect.triggerActionKeys.includes('highSkill'))) {
        throw new RangeError('ヨミの月光SP回復が重複または別の発動設定になっています');
      }
      if (!existing.length) spRecoveryEffects.push({id:'yomi-moonlight-intrinsic-sp',sourceId:apostle.id,
        effectId:recovery.effectId,label:'月光内のSP回復',mode:'sourceEvent',triggerSourceId:recovery.effectId,
        fixed,percent:0,triggerActionKeys:['highSkill'],oncePerAction:false,sourceEventFallbackMode:'disabled',
        ...(moonlightFactors ? {resolvedRecoveryFactors:moonlightFactors,amountModifierP:0} : {})});
      else if (moonlightFactors) {
        const provided = existing[0].resolvedRecoveryFactors;
        if (provided && (provided.owner !== moonlightFactors.owner || provided.recipient !== moonlightFactors.recipient)) {
          throw new RangeError('ヨミの月光SP回復量補正が一致しません');
        }
        existing[0].resolvedRecoveryFactors = moonlightFactors;
        existing[0].amountModifierP = 0;
      }
    }
                                                                           
                                                                              
                                                                            
                                                                             
                                                   
                                                                             
                                                                               
                                                                           
    if (normalizeScenarioId(apostle?.id) === 'ashur' && asideRank === 0
      && actions.lowSkill && actions.highSkill) {
      for (const [key, damageId, stateId, status, durationFrames] of [
        ['basicAttack', 'Ashur_basic_e01', 'Ashur_basic_e02', '火傷', 120],
        ['enhancedAttack', 'Ashur_enhanced_e02', 'Ashur_enhanced_e04', '火傷', 180],
        ['highSkill', 'Ashur_high_e02', 'Ashur_high_e04', '気絶', 180]
      ]) {
        const action = actions[key];
        const events = normalizeArray(action?.variants?.default);
        const hits = events.filter(event => event.type === 'damage');
        const states = normalizeArray(action?.statusDefinitions);
        const application = states.find(state => state.applicationEffectId === stateId);
        if (!action || hits.length !== 1 || hits[0].effectId !== damageId || hits[0].hitCount !== 1
          || states.length !== 1 || !application || application.status !== status
          || application.durationFrames !== durationFrames
          || events.some(event => event.statusApplication && (
            event.statusApplication.applicationEffectId !== stateId
            || (event.timingQuality !== 'fallbackEnd' && event.frame !== hits[0].frame)))) {
          throw new RangeError('エシュールの通常構成の命中・状態入力が対応済みの条件と一致しません');
        }
        action.variants.default = events.filter(event => !event.statusApplication || event === hits[0]).map(event =>
          event === hits[0] ? { ...event, statusApplication: { ...application },
            statusApplicationPhase: 'afterDamage' } : event);
      }
    }
    if (normalizeScenarioId(apostle?.id) === 'amelia' && asideRank === 0) {
      const passive = normalizeArray(apostle.skills).find(skill => skill.skillId === 'Amelia_passive');
      if (passive && enemyCount === 1) {
        const level = getSkillLevel(passive, buildOptions.skillLevels || {});
        const effectValue = id => resolveEffectValue(normalizeArray(passive.effects).find(effect => effect.effectId === id), level);
        const duration = effectValue('Amelia_passive_e02');
        if (duration !== 10 + .5 * (level - 1) || effectValue('Amelia_passive_e03') !== 2
          || effectValue('Amelia_passive_e04') !== 10)
          throw new RangeError('アメリアのパッシブ感電入力が暫定契約と一致しません');
                                                                             
                                                                                    
        intrinsicExternalEvents.push({id:'amelia-passive-shock', intrinsic:true,
          type:'statusApplied', frame:1, intervalFrames:600, sourceId:apostle.id,
          status:'感電', statusDurationFrames:duration * DEFAULT_FRAMES_PER_SECOND,
          statusApplicationEffectId:'Amelia_passive_e01', statusSourceId:apostle.id,
          statusSourceSelf:true, statusDealsPeriodicDamage:false,
          statusStackGroupId:'Amelia_passive_e01:感電', reason:'パッシブ感電（範囲内に留まる暫定モデル）'});
        warnings.push('アメリアのパッシブは敵が範囲内に留まる前提で、初回1ゲームフレーム後、以後10秒ごとに感電を付与します。');
      }
      for (const [actionKey,skillId,damageId,stateId,duration] of [
        ['enhancedAttack','Amelia_enhanced','Amelia_enhanced_e01','Amelia_enhanced_e02',180],
        ['lowSkill','Amelia_low','Amelia_low_e01','Amelia_low_e02',360]
      ]) {
        const skill=normalizeArray(apostle.skills).find(row=>row.skillId===skillId);
        const action=actions[actionKey],events=normalizeArray(action?.variants?.default);
        const hits=events.filter(event=>event.type==='damage');
        if (!skill || !action) continue;
        const durations=normalizeArray(skill.effects).filter(effect=>effect.valueKind==='感電'
          && effect.valueClass==='持続時間');
        const durationEffect=durations[0];
        const durationFrames=resolveEffectValue(durationEffect,getSkillLevel(skill,buildOptions.skillLevels||{}))*DEFAULT_FRAMES_PER_SECOND;
        if (durations.length!==1 || hits.length!==1 || hits[0].effectId!==damageId || hits[0].hitCount!==1
          || durationFrames!==duration || normalizeArray(action.statusDefinitions).some(state=>state.applicationEffectId!==stateId)
          || events.some(event=>event.statusApplication && (event.timingQuality!=='fallbackEnd'
            || event.statusApplication.applicationEffectId!==stateId)))
          throw new RangeError('アメリアの普通構成の命中・感電入力が解析契約と一致しません');
        const application={status:'感電',applicationEffectId:stateId,durationEffectId:durationEffect.effectId,
          durationFrames,stackable:false,maxStacks:1,stackOverflowPolicy:'replaceOldest',stackGroupId:'感電:single:1',
          dealsPeriodicDamage:false,tickFrames:0,tickMultiplier:0};
        action.statusDefinitions=[application];
        action.variants.default=events.filter(event=>!event.statusApplication).map(event=>event===hits[0]
          ? {...event,statusApplication:{...application},statusApplicationPhase:'afterDamage'} : event);
      }
                                                                         
                                                                              
                                                                             
      const high=actions.highSkill;
      if (high) {
        const events=normalizeArray(high.variants?.default);
        const hits=events.filter(event=>event.type==='damage');
        const stun=normalizeArray(high.statusDefinitions).find(state=>state.applicationEffectId==='Amelia_high_e03');
        const sourceSeconds=[1.3000000715255737,1.5000001192092896,2.1000001430511475,
          2.3000001907348633,2.500000238418579,2.9000000953674316];
        if (hits.length!==6 || hits.some((event,index)=>event.effectId!=='Amelia_high_e01'
          || event.hitCount!==1 || Math.abs(event.frame-sourceSeconds[index]*DEFAULT_FRAMES_PER_SECOND)>1e-5)
          || !stun || stun.status!=='気絶' || stun.requiredTargetStatus!=='感電'
          || normalizeArray(high.statusDefinitions).length!==1
          || events.some(event=>event.statusApplication && (event.timingQuality!=='fallbackEnd'
            || event.statusApplication.applicationEffectId!=='Amelia_high_e03')))
          throw new RangeError('アメリア高学年の通常構成の命中・気絶入力が解析契約と一致しません');
        high.variants.default=events.filter(event=>!event.statusApplication).map(event=>{
          const index=hits.indexOf(event);
          return index>=0 && index!==4
            ? {...event,statusApplication:{...stun},statusApplicationPhase:'afterDamage'} : event;
        });
      }
    }
                                                                             
                                                                            
                                                                              
    if (normalizeScenarioId(apostle?.id) === 'haley' && asideRank === 0) {
      const lowSkill = normalizeArray(apostle.skills).find(skill => skill.skillId === 'Haley_low');
      const lowDamage = normalizeArray(lowSkill?.effects).find(effect => effect.effectId === 'Haley_low_e01');
      const level = getSkillLevel(lowSkill, buildOptions.skillLevels || {});
      const total = resolveEffectValue(lowDamage, level);
      const coefficient = 320 + 30 * (level - 1);
      const low = actions.lowSkill;
      const events = normalizeArray(low?.variants?.default);
      const hits = events.filter(event => event.type === 'damage');
      const definition = normalizeArray(low?.statusDefinitions).find(item => item.applicationEffectId === 'Haley_low_e03');
      if (!lowSkill || !lowDamage || lowDamage.valueKind !== '総物理ダメージ'
        || !Number.isFinite(total) || Math.abs(total - coefficient * .99) > 1e-7
        || hits.length !== 3 || hits.some(event => event.effectId !== 'Haley_low_e01' || event.hitCount !== 1)
        || !definition || definition.status !== '苦痛' || definition.durationFrames !== 300
        || !definition.stackable || definition.maxStacks !== 9
        || events.some(event => event.statusApplication && event.timingQuality !== 'fallbackEnd')) {
        throw new RangeError('ヘイリー低学年の通常構成の命中・苦痛入力が解析契約と一致しません');
      }
      const application = { ...definition, stackOverflowPolicy: 'reject',
        stackGroupId: 'Haley:苦痛:stack:9', applicationProbability: 50 };
      low.statusDefinitions = low.statusDefinitions.map(item => item === definition ? application : item);
      low.variants.default = events.filter(event => !(event.statusApplication?.applicationEffectId === 'Haley_low_e03'
        && event.timingQuality === 'fallbackEnd')).map(event => event.type === 'damage' ? {
          ...event, nativeCoefficientScale: coefficient / total, nativeCoefficientInteger: true,
          nativeEffectDamage: Math.fround(.33), statusApplication: { ...application },
          statusApplicationPhase: 'beforeDamage', nativeStatusCoefficientSelection: {
            statusKinds: ['火傷','毒','苦痛'], multipliers: [1,Math.fround(1.2),Math.fround(1.4),Math.fround(1.6)] }
        } : event);
                                                                       
                                                                             
                                          
      const high = actions.highSkill;
      const highHits = normalizeArray(high?.generatedEvents)
        .filter(event => event.generatedObjectId === 'Haley_high_pulses' && event.type === 'damage');
      if (highHits.length) {
        const blind = normalizeArray(high?.statusDefinitions)
          .find(item => item.applicationEffectId === 'Haley_high_e03');
        if (highHits.length !== 7 || !blind || blind.status !== '目隠し' || blind.durationFrames !== 600
          || blind.stackable || highHits.some((event, index) => event.effectId !== 'Haley_high_e01'
            || event.generatedRepeatIndex !== index || event.frame !== 60 + index * 60
            || !event.persistent || event.nativeEffectDamage !== Math.fround(.145))
          || normalizeArray(high.variants?.default).some(event => event.type === 'damage'
            || (event.statusApplication && event.timingQuality !== 'fallbackEnd'))) {
          throw new RangeError('ヘイリー高学年の通常構成の反復命中・目隠し入力が解析契約と一致しません');
        }
        high.variants.default = high.variants.default.filter(event =>
          !(event.statusApplication?.applicationEffectId === 'Haley_high_e03' && event.timingQuality === 'fallbackEnd'));
                                                                             
                                                                              
        highHits[0].statusApplication = { ...blind };
        highHits[0].statusApplicationPhase = 'afterDamage';
      }
    }
                                                                             
                                                                             
    if (normalizeScenarioId(apostle?.id) === 'chloe' && actions.highSkill) {
      const high = actions.highSkill;
      const events = normalizeArray(high.generatedEvents);
      const spawns = events.filter(event => event.generatedEventType === '生成');
      if (spawns.length !== 7 || events.length !== 14 || spawns.some((event, index) =>
        event.generatedObjectId !== 'Chloe_high_doll' || event.generatedInstanceOrder !== index + 1
        || events.filter(item => item.generatedInstanceKey === event.generatedInstanceKey).length !== 2
        || events.some(item => item.generatedInstanceKey === event.generatedInstanceKey
          && (!Number.isFinite(item.frame) || item.frame < event.frame)))) {
        throw new RangeError('クロエ高学年の7体生成・生成後通知の入力が不足しています');
      }
                                                                          
                                                                               
                                                                                
      high.ownerReservePolicy = { objectId: 'Chloe_high_doll', count: 7,
        intervalSeconds: .6, referenceUpdatesPerGameSecond: 60 };
      warnings.push('クロエ高学年の生成待ちは暫定60更新/ゲーム秒で加速を反映。生成後の命中待ちは従来の測定値を使用します。');
    }
    const jadeLowGemSelection = normalizeScenarioId(apostle?.id) === 'jade';
    let jadeOverflowBuff = null;
    if (jadeLowGemSelection) {
      const lowHits = normalizeArray(actions.lowSkill?.variants?.default)
        .filter(event => event.type === 'damage');
      const resource = runtimeResources.find(item => item.id === '翡翠玉');
      if (lowHits.length !== 1 || lowHits[0].effectId !== 'Jade_low_e01'
        || lowHits[0].hitCount !== 1 || lowHits[0].resourceChange
        || !resource || resource.maxStacks !== 3) {
        throw new RangeError('ジェイドの低学年命中・翡翠玉上限の入力が不正です');
      }
      const passive = normalizeArray(apostle.skills).find(skill => skill.skillId === 'Jade_passive');
      const rows = normalizeArray(passive?.effects).filter(effect => effect.effectId === 'Jade_passive_e01');
      const effect = rows[0], percent = resolveEffectValue(effect, getSkillLevel(passive, buildOptions.skillLevels));
      if (rows.length !== 1 || effect.valueKind !== '魔法攻撃力増加' || effect.valueClass !== '倍率'
        || effect.effectTarget !== '自身' || effect.triggerSourceId !== '翡翠玉'
        || !Number.isFinite(percent) || percent < 0) {
        throw new RangeError('ジェイドの玉上限時の魔法攻撃力バフ入力が不正です');
      }
                                                                            
                                                                              
      jadeOverflowBuff = {id: effect.effectId, label: '翡翠玉上限時の魔法攻撃力増加',
        attackPPerStack: percent, modifiers: {magicAtkP: percent}, kind: 'damageBuff',
        maxStacks: 1, durationFrames: 360};
    }
    const cooldownSettingEffects = normalizeArray(buildOptions.runtimeEffects?.cooldownSettingEffects)
      .map((effect, index) => ({
        id: String(effect?.id || `cooldownSetting:${index}`), sourceId: String(effect?.sourceId || ''),
        externalSourceId: String(effect?.externalSourceId || ''),
        externalTriggerType: String(effect?.externalTriggerType || ''),
        label: String(effect?.label || '次回高学年CT短縮'),
        percent: toFiniteNumber(effect?.percent),
        durationFrames: Math.max(0, toFiniteNumber(effect?.durationFrames))
      })).filter(effect => effect.percent && effect.durationFrames > 0);
    const suppliedCooldownEffects = normalizeArray(buildOptions.runtimeEffects?.cooldownEffects).slice();
    if (normalizeScenarioId(apostle?.id) === 'sherum') {
      const enhanced = normalizeArray(apostle.skills).find(skill => skill.skillId === 'Sherum_enhanced');
      const rows = normalizeArray(enhanced?.effects).filter(effect => effect.effectId === 'Sherum_enhanced_e02');
      const effect = rows[0], seconds = resolveEffectValue(effect, getSkillLevel(enhanced, buildOptions.skillLevels));
      if (rows.length !== 1 || effect.valueKind !== '自分現在高学年クールタイム減少'
        || effect.effectTarget !== '自身' || effect.valueClass !== 'クールタイム'
        || !Number.isFinite(seconds) || seconds < 0) {
        throw new RangeError('シェルムの強化攻撃CT短縮入力が不正です');
      }
                                                                               
                                                                                   
      const existing = suppliedCooldownEffects.filter(item => item.id === effect.effectId);
      if (existing.length > 1) throw new RangeError('シェルムの強化攻撃CT短縮が重複しています');
      const index = suppliedCooldownEffects.findIndex(item => item.id === effect.effectId);
      if (index >= 0) suppliedCooldownEffects.splice(index, 1);
      if (seconds > 0) suppliedCooldownEffects.push({
        id: effect.effectId, sourceId: apostle.id, label: '強化攻撃の高学年CT短縮',
        mode: 'sourceEvent', triggerSourceId: effect.effectId,
        triggerActionKeys: ['enhancedAttack'], oncePerAction: true,
        targetActionKey: 'highSkill', operation: 'subtract', amountFrames: seconds * 60,
        sourceEventFallbackMode: 'disabled'
      });
    }
    const cooldownEffects = suppliedCooldownEffects.map((effect, index) => ({
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
    if (epicaA2TimingApproximation) {
      const ctEffect = unlockedAsideEffects.find(effect => effect.effectId === 'Epica_aside_2_e03');
      const amountFrames = Math.max(0, toFiniteNumber(resolveEffectValue(ctEffect))) * 60;
                                                                         
      const existingIndex = cooldownEffects.findIndex(effect => effect.id === 'Epica_aside_2_e03');
      if (existingIndex >= 0) cooldownEffects.splice(existingIndex, 1);
      if (amountFrames > 0) cooldownEffects.push({
        id: 'Epica_aside_2_e03', sourceId: 'aside:2', label: 'エピカA2 / 強化開始前CT減少',
        mode: 'action', triggerActionKeys: ['enhancedAttack'], triggerPhase: 'beforeStart',
        triggerEveryCount: 0, oncePerAction: true, targetActionKey: 'highSkill',
        operation: 'subtract', amountFrames, multiplier: 1
      });
    }
    const baseSpRegenOverride = Number(buildOptions.runtimeEffects?.baseSpRegen);
    const naturalSpBaseFixed = spRegenEffects.filter(effect => effect.mode === 'constant')
      .reduce((total, effect) => total + effect.baseFixed, 0);
    const baseSpRegen = Math.max(0, (Number.isFinite(baseSpRegenOverride)
      ? baseSpRegenOverride
      : toFiniteNumber(apostle?.basic?.spRecoveryPerSecond)) + naturalSpBaseFixed);
    const spRegenFixed = spRegenEffects.filter(effect => effect.mode === 'constant')
      .reduce((total, effect) => total + effect.fixed - effect.baseFixed, 0);
    const spRegenPercent = spRegenEffects.filter(effect => effect.mode === 'constant').reduce((total, effect) => total + effect.percent, 0);
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
    let suppliedDamageBuffEffects = normalizeArray(buildOptions.runtimeEffects?.damageBuffEffects);
    if (normalizeScenarioId(apostle?.id) === 'chloe' && actions.basicAttack) {
      const buffs = suppliedDamageBuffEffects.filter(effect => effect.id === 'Chloe_low_e04:owner:Chloe');
      if (buffs.length !== 1 || buffs[0].modifiers?.normalAttackAddP !== 7
        || buffs[0].maxStacks !== 9 || buffs[0].durationFrames !== 600
        || buffs[0].conditionType !== '固有状態中' || buffs[0].conditionValue !== 'Chloe_low_e01') {
        throw new RangeError('クロエ変身バフの供給条件が未接続です');
      }
      suppliedDamageBuffEffects = suppliedDamageBuffEffects.map(effect => effect !== buffs[0] ? effect : {
        ...effect,mode:'sourceEventTimed',triggerSourceId:'Chloe_low_e04',
        triggerActionKeys:['basicAttack'],oncePerAction:false,sourceEventFallbackMode:'disabled'
      });
    }
    if (normalizeScenarioId(apostle?.id) === 'sherum' && actions.lowSkill) {
      const skill = findSkill(apostle, 'lowSkill', buildOptions.skillOverrides);
      const favoriteArea = skill?.skillId === 'Sherum_favorite_1';
      const buff = resolveEffect(skill, favoriteArea ? 'Sherum_favorite_1_e02' : 'Sherum_low_e04');
      const duration = resolveEffectValue(resolveEffect(skill, favoriteArea ? 'Sherum_favorite_1_e03' : 'Sherum_low_e05'), getSkillLevel(skill, buildOptions.skillLevels));
      const percent = resolveEffectValue(buff, getSkillLevel(skill, buildOptions.skillLevels));
      if (buff?.valueKind !== '攻撃力増加' || buff.valueClass !== '倍率'
        || !Number.isFinite(percent) || percent < 0 || !Number.isFinite(duration) || duration <= 0) {
        throw new RangeError('シェルム領域の攻撃力バフ入力が不正です');
      }
      suppliedDamageBuffEffects = suppliedDamageBuffEffects.filter(effect => (
        !(favoriteArea && (effect.runtimeBaseEffectId === 'Sherum_low_e04'
          || String(effect.id || '').startsWith('Sherum_low_e04')))
        &&
        effect.id !== buff.effectId && effect.runtimeBaseEffectId !== buff.effectId
        && !String(effect.id || '').startsWith(`${buff.effectId}:`)
      ));
      suppliedDamageBuffEffects.push({id:buff.effectId, runtimeBaseEffectId:buff.effectId,
        sourceId:apostle.id, label:'伝承のカーテンの攻撃力増加',mode:'sourceEventTimed',
        triggerSourceId:buff.effectId,triggerActionKeys:['lowSkill'],durationFrames:duration*60,
        stackable:false,oncePerAction:false,maxStacks:1,
        modifiers:{physicalAtkP:percent,magicAtkP:percent},sourceEventFallbackMode:'disabled'});
    }
    const damageBuffEffects = suppliedDamageBuffEffects.map((effect, index) => ({
      id: String(effect?.id || `damageBuff:${index}`),
      runtimeBaseEffectId: String(effect?.runtimeBaseEffectId || ''),
      sourceId: String(effect?.sourceId || ''),
      externalSourceId: String(effect?.externalSourceId || ''),
      externalTriggerType: String(effect?.externalTriggerType || ''),
      label: String(effect?.label || effect?.id || '時限ダメージバフ'),
      externalBindingKey: String(effect?.externalBindingKey || ''),
      selfShieldSourceId: String(effect?.selfShieldSourceId || ''),
      stacksPerApplication: Math.max(1, Math.min(8, Math.floor(toFiniteNumber(effect?.stacksPerApplication, 1)))),
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
      applyActionKeys: normalizeArray(effect?.applyActionKeys).map(String),
      releaseAfterActionKeys: normalizeArray(effect?.releaseAfterActionKeys).map(String),
      maxStacks: Math.max(1, Math.floor(toFiniteNumber(effect?.maxStacks, 1))),
      fixedStacks: Math.max(1, Math.floor(toFiniteNumber(effect?.fixedStacks, 1))),
      oncePerAction: !!effect?.oncePerAction,
      stopAtMaxStacks: !!effect?.stopAtMaxStacks,
      maxStackModifiers: Object.fromEntries(Object.entries(effect?.maxStackModifiers || {})
        .map(([key, value]) => [key, toFiniteNumber(value)]).filter(([, value]) => value)),
      sourceEventFallbackMode: String(effect?.sourceEventFallbackMode || 'actionTimed'),
      modifiers: Object.fromEntries(Object.entries(effect?.modifiers || {})
        .map(([key, value]) => [key, toFiniteNumber(value)])
        .filter(([, value]) => value)),
      baselineModifiersByAction: Object.fromEntries(Object.entries(effect?.baselineModifiersByAction || {})
        .map(([actionKey, modifiers]) => [actionKey, Object.fromEntries(Object.entries(modifiers || {})
          .map(([key, value]) => [key, toFiniteNumber(value)])
          .filter(([, value]) => value))]))
    })).filter(effect => effect.id && Object.keys(effect.modifiers).length);
    if (normalizeScenarioId(apostle?.id) === 'snorky') {
      damageBuffEffects.forEach(effect => {
                                                                               
                                                                              
        if (effect.id.startsWith('Snorky_passive_e01:owner:Snorky')
          && effect.triggerType === '強化攻撃使用時' && effect.triggerSourceId === '強化攻撃') {
          effect.stackable = true;
          effect.maxStacks = 3;
          effect.stopAtMaxStacks = true;
        }
        if (effect.triggerType !== 'シールド終了時' || effect.triggerSourceId !== 'Snorky_low_e01'
          || !effect.id.startsWith('Snorky_low_e03:owner:Snorky')) return;
        effect.mode = 'selfShieldEndedTimed';
        effect.selfShieldSourceId = 'Snorky_low_e01';
      });
    }
    const worldBossFlag = buildOptions.scenario?.actors?.enemy?.isWorldBoss
      ?? buildOptions.scenario?.battleConditions?.enemyIsWorldBoss;
    const enemyIsWorldBoss = typeof worldBossFlag === 'boolean' ? worldBossFlag
      : buildOptions.scenario?.actors?.enemy?.sourceMode === 'apostle' ? false : null;
    const tigTargetSourceMode = buildOptions.scenario?.actors?.enemy?.sourceMode
      ?? buildOptions.scenario?.battleConditions?.enemySourceMode;
    let tigHeroHpModel = null;
    if (normalizeScenarioId(apostle?.id) === 'tig' && actions.lowSkill
      && tigTargetSourceMode === 'apostle') {
      if (enemyIsWorldBoss === true) throw new RangeError('ティグの敵設定で使徒とワールドボスが同時指定されています。');
      tigHeroHpModel = 'omit-with-warning-v1';
      warnings.push(TIG_HERO_HP_WARNING);
      Object.values(actions.lowSkill.variants).forEach(events => {
        const damage = events.filter(event => event.type === 'damage');
        if (damage.length !== 1 || damage[0].effectId !== 'Tig_low_e01') {
          throw new RangeError('ティグ低学年の攻撃力由来の命中を特定できません。');
        }
                                                                              
                                                                                
        damage[0].onlySelectedDamageEffect = true;
      });
    }
    if (normalizeScenarioId(apostle?.id) === 'sherum' && enemyIsWorldBoss === true) {
      const skill = findSkill(apostle, 'lowSkill', buildOptions.skillOverrides);
      const favoriteArea = skill?.skillId === 'Sherum_favorite_1';
      const extra = resolveEffect(skill, favoriteArea ? 'Sherum_favorite_1_e06' : 'Sherum_low_e06');
      const sourceDamageId = favoriteArea ? 'Sherum_favorite_1_e04' : 'Sherum_low_e01';
      const lv1PulseCoefficient = favoriteArea ? 150 : 72;
      if (!actions.lowSkill || extra?.conditionType !== '敵種別'
        || extra.conditionValue !== 'ワールドボスモンスター' || !isDamageEffect(extra)) {
        throw new RangeError('シェルムのワールドボス追加領域の入力が不足しています');
      }
      Object.values(actions.lowSkill.variants).forEach(events => {
        const source = events.find(event => event.effectId === sourceDamageId && event.ownerArea);
        if (!source) throw new RangeError('シェルムのワールドボス追加領域の発生通知が不足しています');
        const pulseEvent = { ...source.ownerArea.pulseEvent, effectId:extra.effectId,
          nativeCoefficientScale:lv1PulseCoefficient/getLv1Multiplier(extra), coefficientShare:getCoefficientShare(extra,lv1PulseCoefficient) };
                                                                       
                                                                            
                                                                            
        events.push({ ...source, id:`${source.id || extra.effectId}:worldBoss`, effectId:extra.effectId,
          eventOrder:toFiniteNumber(source.eventOrder)+1,
          ownerArea:{ ...source.ownerArea, startDelaySeconds:0.1, pulseEvent }});
      });
      warnings.push('シェルム領域は固定単体敵が範囲内にいる条件で計算します。ワールドボス分類は敵プリセットの設定を使用します');
    }
    const suppliedEventEffects = normalizeArray(buildOptions.runtimeEffects?.eventEffects).filter(effect => {
      if (normalizeScenarioId(apostle?.id) !== 'sherum'
        || !normalizeArray(effect.effectIds).some(id => ['Sherum_low_e06','Sherum_favorite_1_e06'].includes(id))) return true;
      if (enemyIsWorldBoss === false) return false;
      if (enemyIsWorldBoss === true) return false;                                                     
                                                                         
                                                                             
                                                            
      throw new RangeError('シェルムのワールドボス限定追加領域は、敵種別と発生処理の確認が必要です');
    });
                                                                            
                                                                            
                                                                              
    const normalizeEventChoices = effect => {
      if (effect.weightedChoices === undefined) {
        if (normalizeArray(effect.steps).some(step => step.choiceId != null)) {
          throw new RangeError('抽選分岐の重みがありません');
        }
        return null;
      }
      const choices = normalizeArray(effect.weightedChoices);
      const ids = new Set();
      let total = 0;
      if (!choices.length || normalizeRuntimeTriggerProbability(effect) != null) throw new RangeError('通知の抽選条件が不正です');
      const normalized = choices.map(choice => {
        if (typeof choice.id !== 'string' || !choice.id.trim() || ids.has(choice.id)
          || !Number.isSafeInteger(choice.weight) || choice.weight < 0) {
          throw new RangeError('通知の抽選重み・識別子が不正です');
        }
        ids.add(choice.id); total += choice.weight;
        return {id:choice.id,weight:choice.weight};
      });
      if (!(total > 0) || total > 2147483647
        || normalizeArray(effect.steps).some(step => typeof step.choiceId !== 'string' || !ids.has(step.choiceId))
        || normalized.some(choice => !normalizeArray(effect.steps).some(step => step.choiceId === choice.id))) {
        throw new RangeError('通知の抽選合計・分岐処理が不正です');
      }
      return {choices:normalized,total};
    };
    const eventEffects = suppliedEventEffects.map((effect, index) => ({
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
      weightedChoices: normalizeEventChoices(effect),
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
    const normalAttackSpeedBase = timing?.attackSpeedBase > 0
      ? toFiniteNumber(timing.attackSpeedBase) : toFiniteNumber(apostle?.basic?.baseAttackSpeed);
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
      epicaA2TimingApproximation,
      epicaLowReplacementDurationFrames,
      jadeLowGemSelection,
      jadeOverflowBuff,
      name: timing?.name || apostle?.name || '',
      scenarioFingerprint: String(scenario?.sourceMeta?.fingerprint || ''),
      scenarioTargetId: scenarioSelfId,
      personality,
      initialActionDelayFrames: Math.max(0, toFiniteNumber(timing?.initialActionDelayFrames, 60)),
      normalAttackIntervalFrames,
                                                                           
                                                                                
      normalAttackSpeedBase,
      initialAttackSpeedP,
      initialNormalAttackIntervalFrames: normalAttackSpeedBase > 0
        ? normalAttackIntervalFrames * normalAttackSpeedBase / resolveAttackSpeed(normalAttackSpeedBase, initialAttackSpeedP)
        : normalAttackIntervalFrames / (1 + initialAttackSpeedP / 100),
      movementTransitions,
      initialSp: Math.max(0, toFiniteNumber(apostle?.basic?.initialSp)),
      spRegen: Math.max(0, baseSpRegen * (1 + spRegenPercent / 100) + spRegenFixed),
      baseSpRegen,
      highSkillCooldownSettings: {
        fixedSeconds: Math.max(0, toFiniteNumber(buildOptions.highSkillCooldownSettings?.fixedSeconds))
          + intrinsicCooldownFixedSeconds,
        percent: toFiniteNumber(buildOptions.highSkillCooldownSettings?.percent),
        ...(Number.isFinite(buildOptions.highSkillCooldownSettings?.initialFixedSeconds)
          ? { initialFixedSeconds: Math.max(0, buildOptions.highSkillCooldownSettings.initialFixedSeconds)
              + intrinsicCooldownFixedSeconds } : {})
      },
      spRecoveryIntervalFrames: Math.max(1, toFiniteNumber(timing?.spRecoveryIntervalFrames, 60)),
      requiredSp: Math.max(1, actions.lowSkill?.requiredSp || 300),
      maxSp: Math.max(1, actions.lowSkill?.requiredSp || 300),
      lowSkillSpPolicy: 'reset',
      runtimeEffects: {
        yomiAsideReservations,
        attackSpeedEffects,
        accelerationEffects,
        spRegenEffects,
        spRecoveryEffects,
        cooldownEffects,
        cooldownSettingEffects,
        damageBuffEffects,
        eventEffects,
        resourceHeldEffects: normalizeArray(buildOptions.runtimeEffects?.resourceHeldEffects).map(effect => ({...effect})),
        statusDamageWeaknessP: Math.max(0, toFiniteNumber(buildOptions.runtimeEffects?.statusDamageWeaknessP)),
        initialTargetStatuses: normalizeArray(buildOptions.runtimeEffects?.initialTargetStatuses).map(item => ({
          status: String(item?.status || ''),
          sourceSelf: item?.sourceSelf !== false,
          reason: String(item?.reason || '')
        })).filter(item => item.status),
        statusReactions,
        damageEffectIds: normalizeArray(buildOptions.runtimeEffects?.damageEffectIds).map(String).filter(Boolean)
      },
      externalEvents: [...intrinsicExternalEvents, ...normalizeArray(buildOptions.externalEvents || buildOptions.runtimeEffects?.externalEvents)].map(event => {
                                                                             
                                                                            
        if (event?.sourceId === 'Pira' && event?.type === 'リソース変化時'
          && event?.value === '獲得時' && event?.bindingKey === 'Pira::リソース変化時::Pira_wealth') {
          return { ...event, type: 'リソース獲得時', bindingKey: 'Pira::リソース獲得時::Pira_wealth' };
        }
        return event;
      }).map((event, index) => ({
        id: String(event?.id || `external:${index}`),
        intrinsic: event?.intrinsic === true,
        type: String(event?.type || event?.triggerType || ''),
        frame: Math.max(0, toFiniteNumber(event?.frame)),
        intervalFrames: Math.max(0, toFiniteNumber(event?.intervalFrames)),
        repeatCount: Math.max(0, Math.floor(toFiniteNumber(event?.repeatCount))),
        sourceId: String(event?.sourceId || event?.triggerSourceId || ''),
        bindingKey: String(event?.bindingKey || event?.candidateId || ''),
        triggerSourceId: String(event?.triggerSourceId || ''),
        conditionType: String(event?.conditionType || ''),
        conditionValue: String(event?.conditionValue ?? ''),
        value: event?.value ?? '',
        status: String(event?.status || ''),
        statusDurationFrames: Math.max(0, toFiniteNumber(event?.statusDurationFrames ?? event?.durationFrames)),
        statusStackable: event?.statusStackable === true || event?.stackable === true,
        statusMaxStacks: Math.max(1, Math.floor(toFiniteNumber(event?.statusMaxStacks ?? event?.maxStacks, 1))),
        statusStackCount: Math.max(1, Math.min(DEFAULT_STATUS_MAX_STACKS, Math.floor(toFiniteNumber(event?.statusStackCount, 1) || 1))),
        statusStackGroupId: String(event?.statusStackGroupId || event?.stackGroupId || ''),
        statusApplicationEffectId: String(event?.statusApplicationEffectId || event?.applicationEffectId || ''),
        statusSourceId: String(event?.statusSourceId || ''),
        statusSourceSelf: event?.statusSourceSelf === true,
        statusReactionOnly: event?.statusReactionOnly === true,
        statusDealsPeriodicDamage: event?.statusDealsPeriodicDamage == null
          ? null
          : event.statusDealsPeriodicDamage === true,
        statusTickFrames: Math.max(0, toFiniteNumber(event?.statusTickFrames)),
        statusTickMultiplier: toFiniteNumber(event?.statusTickMultiplier),
        reason: String(event?.reason || '')
      })).filter(event => event.type),
      runtimeResources,
      supportClocks: normalizeArray(buildOptions.supportClocks).map(clock => {
        const input = clock.input || {};
        if (!input.apostle || !clock.timing || !normalizeArray(clock.bindings).length) {
          throw new RangeError('支援時計の入力が不足しています');
        }
        const actorConfig = buildCombatantConfig(input.apostle, clock.timing, {
          scenario: input.scenario, skillLevels: input.skillLevels,
          skillOverrides: input.dpsSkillOverrides, timingBranches: input.dpsTimingBranches,
          highSkillCooldownSettings: input.highSkillCooldownSettings,
          runtimeEffects: input.runtimeEffects,
          enemySize: input.scenario?.battleConditions?.enemySize,
          enemySizeRank: input.scenario?.battleConditions?.enemySizeRank
        });
        if (clock.bindings.some(binding => !isSupportClockBindingSupported(actorConfig, binding))) {
          throw new RangeError('支援時計の発動通知を確認できません');
        }
        const bindingKeys = new Set();
        const bindings = normalizeArray(clock.bindings).filter(binding => {
          if (bindingKeys.has(binding.bindingKey)) return false;
          bindingKeys.add(binding.bindingKey);
          return true;
        });
        return {
          ownerId: String(clock.ownerId),
          highSkillMode: clock.highSkillMode === 'auto' ? 'auto' : 'off',
          bindings,
          config: actorConfig,
          damageProfiles: input.actionDamageProfiles || {},
          statusDamageProfiles: input.statusDamageProfiles || {},
          summonCalculationInput: input.summonCalculationInput || null
        };
      }),
      enemyCount,
      enemyIsWorldBoss,
      tigHeroHpModel,
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
                                                                           
                                                                                 
      if (action.skillId === 'Pira_high' && weightedSelection?.type === 'resourceAfterGain') {
        const resource = state.runtimeResources?.[weightedSelection.resourceId];
        const desired = Math.min(Math.max(1, toFiniteNumber(resource?.maxStacks, 1)), Math.max(0,
          toFiniteNumber(resource?.stacks) + toFiniteNumber(weightedSelection.predictedGain)
        ));
        const choices = normalizeArray(weightedSelection.choices)
          .filter(choice => names.includes(choice?.branch))
          .slice().sort((a, b) => a.stacks - b.stacks);
        return choices.find(choice => choice.stacks === desired)?.branch
          || choices.filter(choice => choice.stacks <= desired).pop()?.branch
          || names[0];
      }
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

  function getEventExpectedDamage(current, event, damageProfiles, legacy = false) {
    const variantProfile = getVariantDamageProfile(damageProfiles, current?.key, current?.variant);
    if (!variantProfile) return 0;
    const effects = Object.values(variantProfile.effects || {});
    const damageEvents = current.events.filter(candidate => candidate.type === 'damage');
    const amount = effect => Math.max(0, toFiniteNumber(legacy
      ? effect.damageResult?.runtimeBase?.legacyExpectedDamage ?? effect.expectedDamage : effect.expectedDamage));
    let expectedDamage = 0;
    if (damageEvents.length === 1 && effects.length > 1 && !event.onlySelectedDamageEffect) {
      expectedDamage = legacy ? effects.reduce((sum, effect) => sum + amount(effect), 0)
        : Math.max(0, toFiniteNumber(variantProfile.totalExpectedDamage));
    } else {
      const effect = findEventDamageEffect(effects, variantProfile, event)
        || findEventDamageEffectAcrossVariants(damageProfiles, current, event, variantProfile);
      if (!effect) return 0;
      if (Number.isFinite(Number(event.coefficientShare)) && Number(event.coefficientShare) > 0) {
        expectedDamage = amount(effect) * Number(event.coefficientShare);
      } else if (isPerHitDamageDefinition(event, effect)) {
        expectedDamage = amount(effect);
      } else if (event.generatedObjectId) {
        expectedDamage = amount(effect);
      } else {
        const siblingEvents = current.events.filter(candidate => {
          if (candidate.type !== 'damage') return false;
          if (event.effectId) return candidate.effectId === event.effectId;
          return true;
        });
        const totalWeight = siblingEvents.reduce((total, candidate) => total + Math.max(1, candidate.hitCount || 1), 0) || 1;
        const eventWeight = Math.max(1, event.hitCount || 1);
        expectedDamage = amount(effect) * eventWeight / totalWeight;
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

  function getEventHitComponents(current, event, damageProfiles) {
    if (!Array.isArray(current?.events)) return [];
    const profile = getVariantDamageProfile(damageProfiles, current?.key, current?.variant);
    if (!profile) return [];
    const effects = Object.values(profile.effects || {});
    const events = current.events.filter(candidate => candidate.type === 'damage');
    const repeat = event.repeatDamageCount ?? 1;
    const count = event.hitCount || 1;
    if (!Number.isSafeInteger(repeat) || repeat < 1 || !Number.isSafeInteger(count) || count < 1
      || !Number.isSafeInteger(repeat * count) || event.timingQuality === 'fallbackEnd') return [];
    const selected = events.length === 1 && effects.length > 1 && !event.onlySelectedDamageEffect ? effects : [
      findEventDamageEffect(effects, profile, event)
        || findEventDamageEffectAcrossVariants(damageProfiles, current, event, profile)
    ];
    if (selected.some(effect => !effect?.damageResult?.runtimeBase?.hitInput)) return [];
    if (selected.length > 1 && count !== 1) return [];                                       
    const components = selected.map(effect => {
      const base = effect.damageResult.runtimeBase;
      const coefficient = base.hitInput.coefficientP;
      if (event.nativeCoefficientScale != null || event.nativeEffectDamage != null) {
        if (count !== 1 || !Number.isFinite(event.nativeCoefficientScale)
          || event.nativeCoefficientScale <= 0 || !Number.isFinite(event.nativeEffectDamage)
          || event.nativeEffectDamage < 0) throw new RangeError('命中の元倍率または効果倍率が不正です');
        return { runtimeBase: base, coefficientP: resolveNativeCoefficient(coefficient * event.nativeCoefficientScale,
          event.nativeCoefficientInteger === true),
          effectDamage: event.nativeEffectDamage, hitCount: repeat };
      }
      if (event.coefficientShare != null && Number.isFinite(Number(event.coefficientShare))
        && Number(event.coefficientShare) > 0) {
                                                                                
                                                                                 
        if (count !== 1) return null;                                                                   
        return { runtimeBase: base, coefficientP: coefficient * Number(event.coefficientShare),
          hitCount: repeat };
      }
      if (isPerHitDamageDefinition(event, effect) || base.hitInput.perHitDefinition) {
        return { runtimeBase: base, coefficientP: base.hitInput.perHitCoefficientP ?? coefficient,
          hitCount: count * repeat };
      }
      const siblings = events.filter(candidate => !event.effectId || candidate.effectId === event.effectId);
                                                                           
                                                                    
      if (siblings.length === 1 && count === 1) return { runtimeBase: base, coefficientP: coefficient, hitCount: repeat };
      return null;
    });
    return components.some(component => !component) ? [] : components;
  }

  function getStatusReactionTakenDmgP(state, config, include = () => true) {
    return normalizeArray(config?.runtimeEffects?.statusReactions).reduce((total, reaction) => {
      if (!include(reaction)) return total;
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

  function isResolvedDamageRateStatusReaction(reaction) {
                                                                           
                                                                                
    if (reaction.id === 'season:shock' && reaction.status === '感電'
      && reaction.takenDmgP === 50 && reaction.perStack === false
      && reaction.maxStacks === 1 && !reaction.attackerPersonality) return true;
                                                                        
                                                                               
                                                                          
    return reaction.id === 'builtin:frostbite-calm-taken-damage'
      && reaction.status === '凍傷' && reaction.attackerPersonality === '冷静'
      && reaction.takenDmgP === 8 && reaction.perStack === true
      && reaction.maxStacks === 0;
  }

                                                                            
                                                                               
                                                                         
  function roundNativeToEven(value, digits = 3) {
    if (!Number.isInteger(digits) || digits < 0 || digits > 15) throw new RangeError('Invalid rounding digits');
    if (!Number.isFinite(value) || Math.abs(value) >= 1e16) return value;
    const scale = 10 ** digits;
    const scaled = value * scale;
    const integral = Math.trunc(scaled);
    const fraction = scaled - integral;
                                                                         
                                                                            
    const rounded = Math.abs(fraction) === 0.5
      ? (integral % 2 === 0 ? integral : integral + Math.sign(scaled))
      : scaled >= 0 ? Math.floor(scaled + 0.5) : Math.ceil(scaled - 0.5);
    return rounded / scale;
  }

  function roundDamageRateToEven(value) {
    return roundNativeToEven(value, 3);
  }

                                                                             
                                                                              
  function resolveNormalDamageRate(fixed, percent, additional = 0) {
    return Math.max(Math.fround(0.2), roundDamageRateToEven(fixed * percent) + additional);
  }

  function resolveDirectCritRate(curve, attackerPoints, defenderPoints) {
    return clampCombatCritRate(curve +
      (roundDamageRateToEven(attackerPoints) + roundDamageRateToEven(-defenderPoints)) * 0.01);
  }

  function evaluateSingleHitDamage(input = {}) {
    if (input.coefficientChoices != null) {
      const choices = input.coefficientChoices;
      const invalid = reason => ({ supported: false, calculationMode: 'unavailable', reason,
        normal: null, crit: null, expected: null });
      if (!Array.isArray(choices) || choices.length < 2 || choices.length > 101
        || choices.some((value, index) => !Number.isSafeInteger(value) || value < 0
          || (index > 0 && value <= choices[index - 1]))) {
        return invalid('倍率抽選の候補が不正です');
      }
      const mean = choices.reduce((total, value) => total + value / choices.length, 0);
      if (!Number.isFinite(input.coefficientP) || Math.abs(input.coefficientP - mean) > 1e-8) {
        return invalid('倍率抽選の候補と行動倍率が一致しません');
      }
                                                                                 
      const { coefficientChoices, ...resolved } = input;
      const outcomes = choices.map(coefficientP => ({ coefficientP,
        ...evaluateSingleHitDamage({ ...resolved, coefficientP }) }));
      if (outcomes.some(outcome => !outcome.supported)) return invalid('倍率抽選の命中計算が未確定です');
      const average = key => outcomes.reduce((total, outcome) => total + outcome[key] / outcomes.length, 0);
      return { supported: true, calculationMode: 'normal-hit-v1',
        normal: average('normal'), crit: average('crit'), expected: average('expected'),
        coefficientOutcomes: outcomes,
        stages: { coefficientP: mean, effectDamage: outcomes[0].stages.effectDamage,
          damageRate: outcomes[0].stages.damageRate, endFactor: outcomes[0].stages.endFactor } };
    }
    const values = {
      baseDamage: input.baseDamage,
      coefficientP: input.coefficientP,
      effectDamage: input.effectDamage ?? 1,
      personalityRate: input.personalityRate ?? 1,
      damageRate: input.damageRate ?? 1,
      endCorrection: input.endCorrection ?? 0,
      critMult: input.critMult ?? 1,
      critRate: input.critRate ?? 0,
      additionalCoefficient: input.additionalCoefficient ?? 0
    };
    const unavailable = reason => ({ supported: false, calculationMode: 'unavailable', reason,
      normal: null, crit: null, expected: null });
    if (Object.values(values).some(value => typeof value !== 'number' || !Number.isFinite(value))) {
      return unavailable('命中計算に非有限値または不正な入力があります');
    }
    if (values.baseDamage < 0 || values.coefficientP < 0 || values.personalityRate < 0
      || values.effectDamage < 0 || values.critMult < 0 || values.critRate < 0 || values.critRate > 1) {
      return unavailable('通常命中計算の入力範囲外です');
    }
    const lowerLimit = Math.fround(0.2);
    const coefficientP = values.coefficientP + Math.fround(values.additionalCoefficient);
    const effectDamage = Math.fround(values.effectDamage);
    const damageRate = Math.max(lowerLimit, values.damageRate);
    const endFactor = Math.max(lowerLimit, 1 + values.endCorrection);
    if (!(coefficientP >= 0) || !Number.isFinite(effectDamage)) return unavailable('実効係数の範囲外です');
    const evaluate = criticalFactor => {
                                                                                 
      let pre = values.baseDamage * 0.01;
      pre *= criticalFactor;
      pre *= coefficientP;
      pre *= effectDamage;
      pre *= values.personalityRate;
      pre = damageRate * pre;
      const middle = Math.trunc(pre);
      const final = Math.trunc(middle * endFactor);
      if (!Number.isFinite(pre) || !Number.isSafeInteger(middle) || !Number.isSafeInteger(final)) return null;
      return { pre, middle, final };
    };
    const normal = evaluate(1);
    const crit = evaluate(values.critMult);
    if (!normal || !crit) return unavailable('命中ダメージが安全整数範囲を超えています');
    return { supported: true, calculationMode: 'normal-hit-v1', normal: normal.final, crit: crit.final,
      expected: normal.final * (1 - values.critRate) + crit.final * values.critRate,
      stages: { normal, crit, coefficientP, effectDamage, damageRate, endFactor } };
  }

                                                                              
                                                                               
                                                                  
  function buildEpicaDedicatedHitQuery(base, modifierDelta, frame) {
    const unavailable = reason => ({ supported: false, reason, query: null });
                                                                            
                                                                         
    if (!base || base.schemaVersion !== 1 || base.abilityStage !== 'owner-normal-physical-base'
      || base.actionKind !== 'normalAttack' || base.attackType !== 'physical'
      || base.criticalModel !== 'mean-v1' || base.baseEndCorrection !== 0
      || !Number.isInteger(base.skillLevel) || base.skillLevel < 1 || base.skillLevel > 15
      || typeof frame !== 'number' || !Number.isFinite(frame) || frame < 0) {
      return unavailable('専用人形の物理普通攻撃用の能力供給が未接続です');
    }
    const required = ['baseAtk', 'attackP', 'baseCrit', 'critP', 'baseCritDmg', 'critDmgP',
      'baseDef', 'defenseP', 'baseCritRes', 'critResP', 'baseCritDmgRes', 'critDmgResP',
      'critRateP', 'critResAddP', 'critDmgAddP', 'critDmgResAddP', 'rawAddRate',
      'personalityRate', 'conditionalEndCorrection', 'additionalCoefficient'];
    if (required.some(key => typeof base[key] !== 'number' || !Number.isFinite(base[key]))
      || ['baseAtk', 'baseCrit', 'baseCritDmg', 'baseDef', 'baseCritRes', 'baseCritDmgRes']
        .some(key => base[key] < 0)) {
      return unavailable('専用人形の基礎能力・敵能力・補正内訳が不足または不正です');
    }
    if (!modifierDelta || typeof modifierDelta !== 'object' || Array.isArray(modifierDelta)) {
      return unavailable('専用人形の命中時補正差分がありません');
    }
    const allowed = new Set(['atkP', 'physicalAtkP', 'magicAtkP', 'critP', 'critDmgP',
      'critRateP', 'critDmgAddP', 'enemyDefDownP', 'enemyCritResDownP',
      'enemyCritDmgResDownP', 'addP', 'nativeEndCorrectionP']);
    for (const [key, value] of Object.entries(modifierDelta)) {
      if (typeof value !== 'number' || !Number.isFinite(value)
        || (value !== 0 && !allowed.has(key))) {
        return unavailable(`専用人形への補正適用が未確認です: ${key}`);
      }
    }
    const delta = key => modifierDelta[key] ?? 0;
    const query = { schemaVersion: 1, abilityStage: 'dedicated-hit-query',
      actionKind: 'normalAttack', attackType: 'physical', criticalModel: 'mean-v1',
      skillLevel: base.skillLevel, frame,
      stats: {
        physicalAtk: resolveCombatStat(base.baseAtk, base.attackP + delta('atkP') + delta('physicalAtkP')),
        crit: resolveCombatStat(base.baseCrit, base.critP + delta('critP')),
        critDmg: resolveCombatStat(base.baseCritDmg, base.critDmgP + delta('critDmgP'))
      },
      enemy: {
        physicalDef: resolveCombatStat(base.baseDef, base.defenseP - delta('enemyDefDownP'), 1),
        critRes: resolveCombatStat(base.baseCritRes, base.critResP - delta('enemyCritResDownP'), 1),
        critDmgRes: resolveCombatStat(base.baseCritDmgRes, base.critDmgResP - delta('enemyCritDmgResDownP'), 1)
      },
      personalityRate: base.personalityRate,
      damageRate: resolveNormalDamageRate(1, base.rawAddRate + delta('addP') / 100),
      baseEndCorrection: 0,
      conditionalEndCorrection: base.conditionalEndCorrection + delta('nativeEndCorrectionP') / 100,
      additionalCoefficient: base.additionalCoefficient,
      critRateP: roundDamageRateToEven(base.critRateP + delta('critRateP'))
        + roundDamageRateToEven(-base.critResAddP),
      critDmgAddP: base.critDmgAddP + delta('critDmgAddP') - base.critDmgResAddP
    };
    const checked = evaluateEpicaDedicatedHitQuery(query);
    return checked.supported ? { supported: true, query } : unavailable(checked.reason);
  }

  function evaluateEpicaDedicatedHitQuery(query) {
    const unavailable = reason => ({ supported: false, calculationMode: 'unavailable',
      reason, normal: null, crit: null, expected: null });
    if (!query || query.schemaVersion !== 1 || query.abilityStage !== 'dedicated-hit-query'
      || query.actionKind !== 'normalAttack' || query.attackType !== 'physical'
      || query.criticalModel !== 'mean-v1'
      || !Number.isInteger(query.skillLevel) || query.skillLevel < 1 || query.skillLevel > 15
      || typeof query.frame !== 'number' || !Number.isFinite(query.frame) || query.frame < 0) {
      return unavailable('エピカ専用人形の命中時能力・行動区分が未接続です');
    }
    const required = [query.stats?.physicalAtk, query.stats?.crit, query.stats?.critDmg,
      query.enemy?.physicalDef, query.enemy?.critRes, query.enemy?.critDmgRes,
      query.personalityRate, query.damageRate, query.baseEndCorrection,
      query.conditionalEndCorrection, query.additionalCoefficient, query.critRateP, query.critDmgAddP];
    if (required.some(value => typeof value !== 'number' || !Number.isFinite(value))
      || [query.stats.physicalAtk, query.stats.crit, query.stats.critDmg,
        query.enemy.physicalDef, query.enemy.critRes, query.enemy.critDmgRes].some(value => value < 0)
      || query.baseEndCorrection !== 0) {
      return unavailable('エピカ専用人形の能力・敵抵抗・補正供給が不足または不正です');
    }
    const attack = query.stats.physicalAtk;
    const critRate = clampCombatCritRate(calcRuntimeCritRate(query.stats.crit,
      Math.max(1, query.enemy.critRes)) + query.critRateP / 100);
    const critMult = clampCombatCritMultiplier(calcRuntimeCritMultiplier(query.stats.critDmg,
      Math.max(1, query.enemy.critDmgRes)) + query.critDmgAddP / 100);
    const hitInput = {
      baseDamage: attack * calcRuntimeBaseDamageRate(attack, Math.max(1, query.enemy.physicalDef)),
      coefficientP: 200 + 20 * (query.skillLevel - 1), effectDamage: 1,
      personalityRate: query.personalityRate, damageRate: query.damageRate,
      endCorrection: query.conditionalEndCorrection,
      additionalCoefficient: query.additionalCoefficient, critRate, critMult
    };
    const result = evaluateSingleHitDamage(hitInput);
    return { ...result, hitInput: result.supported ? hitInput : null,
      criticalModel: 'mean-v1', queryFrame: query.frame };
  }

  function evaluateResolvedHit(component, input) {
    const base = component.runtimeBase;
    const hit = base?.hitInput;
    if (!hit) return null;
    input = { ...input, actionKey: base.runtimeActionKey ?? input.actionKey };
    const delta = input.modifierDelta || {};
                                                                              
                                                                          
                                                                            
    const actionMultiplier = getRuntimeActionMultiplierModifierP(delta, input.actionKey, input.generatedEventType);
    const tigOverdrive = String(input.apostleId || '').toLowerCase() === 'tig'
      && ['Tig_basic_e01','Tig_basic_e02','Tig_enhanced_e01','Tig_enhanced_e02'].includes(input.effectId)
      && ['basicAttack','enhancedAttack'].includes(input.actionKey)
      && !input.generatedEventType && !base.actionMultiplierBonusP
      && actionMultiplier === 100 && delta.normalAttackMultiplierBonusP === 100
      && normalizeArray(input.activeEffects).some(e => ['Tig_high_e04:owner:Tig',
        'Tig_favorite_1_e04:owner:Tig'].includes(e.id)
        && e.modifiers?.normalAttackMultiplierBonusP === 100);
                                                                         
                                                                             
                                                                        
                                                                      
    const chloeRateSources = normalizeArray(input.activeEffects)
      .filter(effect => toFiniteNumber(effect.modifiers?.normalAttackAddP));
    const chloeRateSupplier = String(input.apostleId || '').toLowerCase() === 'chloe'
      && chloeRateSources.length > 0
      && chloeRateSources.every(effect => effect.id === 'Chloe_low_e04:owner:Chloe'
        && effect.modifiers.normalAttackAddP > 0
        && effect.modifiers.normalAttackAddP % 7 === 0)
      && delta.normalAttackAddP > 0 && delta.normalAttackAddP <= 63
      && chloeRateSources.reduce((sum, effect) => sum + effect.modifiers.normalAttackAddP, 0)
        === delta.normalAttackAddP;
    const chloeNormalRate = chloeRateSupplier
      && ['basicAttack', 'enhancedAttack'].includes(input.actionKey)
      && !input.generatedEventType
      && ['Chloe_basic_e01','Chloe_basic_e02','Chloe_basic_e04','Chloe_enhanced_e01'].includes(input.effectId);
                                                                             
                                                                             
                                                                               
                                                                               
    const chloeHighRateExcluded = chloeRateSupplier && input.actionKey === 'highSkill'
      && input.effectId === 'Chloe_high_e02' && input.generatedEventType === '攻撃'
      && component.effectDamage === 1 && component.hitCount === 1;
                                                                         
                                                                           
                                                                           
    const joanneSupportHit = String(input.apostleId || '').toLowerCase() === 'joanne'
      && !input.generatedEventType
      && ({Joanne_basic_e01:'basicAttack',Joanne_basic_e02:'basicAttack',Joanne_high_e01:'highSkill'})[input.effectId] === input.actionKey;
    const joanneRateSupplier = key => {
      const sources = normalizeArray(input.activeEffects).filter(effect=>toFiniteNumber(effect.modifiers?.[key]));
      const id = key === 'normalAttackAddP' ? 'Joanne_enhanced_e03:intrinsic:self' : 'Joanne_enhanced_e05:intrinsic:self';
      return joanneSupportHit && delta[key] === 20 && sources.length === 1
        && sources[0].id === id && sources[0].modifiers?.[key] === 20;
    };
    const joanneNormalRate = joanneRateSupplier('normalAttackAddP');
    const joanneSkillRate = joanneRateSupplier('skillAddP');
                                                                           
                                                                              
                                                                               
                                                                           
    const ameliaRateSources = normalizeArray(input.activeEffects)
      .filter(effect => toFiniteNumber(effect.modifiers?.normalAttackAddP));
    const ameliaRateSupplier = String(input.apostleId || '').toLowerCase() === 'amelia'
      && !input.generatedEventType
      && ({Amelia_basic_e01:'basicAttack', Amelia_enhanced_e01:'enhancedAttack',
        Amelia_low_e01:'lowSkill', Amelia_high_e01:'highSkill'})[input.effectId] === input.actionKey
      && delta.normalAttackAddP === 40 && ameliaRateSources.length === 1
      && ameliaRateSources[0].id === 'Amelia_aside_2_e02:owner:Amelia'
      && ameliaRateSources[0].kind === 'conditionalStatus'
      && ameliaRateSources[0].modifiers.normalAttackAddP === 40;
                                                                      
                                                                            
                                                                         
    const xionHeldSources = normalizeArray(input.activeEffects)
      .filter(effect => effect.kind === 'resourceHeld');
    const xionHeldRate = String(input.apostleId || '').toLowerCase() === 'xion'
      && base.damageType === 'physical' && !input.generatedEventType
      && ({ Xion_basic_e01: 'basicAttack', Xion_enhanced_e01: 'enhancedAttack',
        Xion_low_e01: 'lowSkill', Xion_high_e01: 'highSkill' })[input.effectId] === input.actionKey
      && xionHeldSources.length === 1
      && xionHeldSources[0].id === 'runtime-resource-held'
      && xionHeldSources[0].modifiers?.addP === input.heldAddP
      && normalizeArray(xionHeldSources[0].sources).length === 1
      && normalizeArray(xionHeldSources[0].sources).every(source => source.resourceId === '魔弾'
        && source.perStack === 5 && Number.isInteger(source.stacks)
        && source.stacks > 0 && source.stacks <= 6
        && normalizeArray(source.effectIds).length === 1
        && source.effectIds[0] === 'Xion_passive_e04'
        && source.stacks * source.perStack === input.heldAddP);
                                                                               
                                                                             
    if ((actionMultiplier && !tigOverdrive)
      || toFiniteNumber(delta.specialP) || toFiniteNumber(delta.otherP)
      || ['normalAttackAddP', 'basicAddP', 'enhancedAddP', 'lowSkillAddP', 'highSkillAddP', 'skillAddP']
        .some(key => toFiniteNumber(delta[key])
          && !(key === 'normalAttackAddP' && (chloeNormalRate || chloeHighRateExcluded || joanneNormalRate || ameliaRateSupplier))
          && !(key === 'skillAddP' && joanneSkillRate)
          && !(base.runtimeActionKey === 'passive' && input.actionKey === 'passive'))
      || (input.heldAddP && !xionHeldRate)
      || input.hasUnresolvedStatusReaction
      || toFiniteNumber(input.statusTakenDmgP) !== toFiniteNumber(input.resolvedStatusTakenDmgP)
      || input.statusDamageP) return null;
    const attackP = getRuntimeAttackModifierP(delta, base.damageType);
    const finalAtk = resolveCombatStat(base.baseAtk, base.attackP + attackP);
    const finalDef = resolveCombatStat(base.baseDef, base.defenseP - toFiniteNumber(delta.enemyDefDownP), 1);
    const finalCrit = resolveCombatStat(base.baseCrit, base.critP + toFiniteNumber(delta.critP));
    const finalCritRes = resolveCombatStat(base.baseCritRes, base.critResP - toFiniteNumber(delta.enemyCritResDownP), 1);
    const finalCritDmg = resolveCombatStat(base.baseCritDmg, base.critDmgP + toFiniteNumber(delta.critDmgP));
    const finalCritDmgRes = resolveCombatStat(base.baseCritDmgRes, base.critDmgResP - toFiniteNumber(delta.enemyCritDmgResDownP), 1);
    const critRate = base.guaranteedCrit ? 1 : resolveDirectCritRate(
      calcRuntimeCritRate(finalCrit, finalCritRes), base.critRateP + toFiniteNumber(delta.critRateP), base.critResAddP);
    const critMult = clampCombatCritMultiplier(
      calcRuntimeCritMultiplier(finalCritDmg, finalCritDmgRes) + (base.critDmgAddP + toFiniteNumber(delta.critDmgAddP) - base.critDmgResAddP) / 100);
    let coefficientP = (component.coefficientP ?? hit.coefficientP) * (tigOverdrive ? 2 : 1);
    if (input.nativeCoefficientMultiplier != null) {
      const multiplier = input.nativeCoefficientMultiplier;
      if (typeof multiplier !== 'number' || !Number.isFinite(multiplier) || multiplier <= 0
        || !Number.isSafeInteger(coefficientP) || coefficientP < 0) {
        return { supported: false, reason: '状態数補正の元係数または倍率が未確定です' };
      }
                                                                        
                                                                               
      coefficientP = Math.trunc(Math.fround(Math.fround(coefficientP) * Math.fround(multiplier)));
    }
    const result = evaluateSingleHitDamage({ ...hit,
      baseDamage: finalAtk * calcRuntimeBaseDamageRate(finalAtk, finalDef),
      coefficientP,
      effectDamage: component.effectDamage ?? hit.effectDamage,
      damageRate: resolveNormalDamageRate(1, base.rawAddRate
        + (getRuntimeAddModifierP(delta, input.actionKey) + (xionHeldRate ? input.heldAddP : 0)
          + toFiniteNumber(input.resolvedStatusTakenDmgP)) / 100),
                                                                            
                                                                                
      endCorrection: (hit.endCorrection ?? 0) + (delta.nativeEndCorrectionP ?? 0) / 100,
      critRate, critMult });
    const count = component.hitCount ?? 1;
    if (!Number.isSafeInteger(count) || count < 1) return { supported: false, reason: '命中数が未確定です' };
    const totals = result.coefficientOutcomes || [result];
    if (result.supported && totals.some(outcome => !Number.isSafeInteger(outcome.normal * count)
      || !Number.isSafeInteger(outcome.crit * count))) {
      return { supported: false, reason: '命中合計が安全整数範囲を超えています' };
    }
    return { ...result, hitCount: count, expected: result.supported ? result.expected * count : null };
  }

                                                                           
                                                                              
  function evaluateDotDamage(input = {}) {
    const { baseDamage, coefficientP, personalityRate, damageRate, endCorrection,
      disorderCorrection, critRate, critMult } = input;
    const unavailable = reason => ({ supported: false, calculationMode: 'unavailable', reason,
      normal: null, crit: null, expected: null });
    if ([baseDamage, coefficientP, personalityRate, damageRate, endCorrection,
      disorderCorrection, critRate, critMult].some(value => typeof value !== 'number' || !Number.isFinite(value))) {
      return unavailable('周期ダメージの入力が不足、または非有限値です');
    }
    const coefficient = Math.fround(coefficientP);
    const lateFactor = (1 + endCorrection) + disorderCorrection;
    if (baseDamage < 0 || coefficient < 0 || personalityRate < 0 || damageRate < 0
      || lateFactor < 0 || critMult < 0 || critRate < 0 || critRate > 1) {
      return unavailable('周期ダメージの確認済み計算範囲外です');
    }
    const evaluate = critical => {
      let pre = baseDamage * .01;
      pre *= critical;
      pre *= coefficient;
      pre *= personalityRate;
      pre *= damageRate;
      const middle = Math.trunc(pre);
      const final = Math.trunc(middle * lateFactor);
      if (!Number.isFinite(pre) || !Number.isSafeInteger(middle) || !Number.isSafeInteger(final)) return null;
      return { pre, middle, final };
    };
    const normal = evaluate(1), crit = evaluate(critMult);
    if (!normal || !crit) return unavailable('周期ダメージが安全整数範囲を超えています');
    return { supported: true, calculationMode: 'dot-hit-v1', normal: normal.final, crit: crit.final,
      expected: normal.final * (1 - critRate) + crit.final * critRate,
      stages: { normal, crit, coefficientP: coefficient, damageRate, lateFactor } };
  }

  function createDotAttackSnapshot(base, delta = {}) {
    if (!base?.dotInput) return null;
    return Object.freeze({
      attack: resolveCombatStat(base.baseAtk, base.attackP + getRuntimeAttackModifierP(delta, base.damageType)),
      critical: resolveCombatStat(base.baseCrit, base.critP + toFiniteNumber(delta.critP)),
      criticalDamage: resolveCombatStat(base.baseCritDmg, base.critDmgP + toFiniteNumber(delta.critDmgP)),
      criticalDamagePoints: base.critDmgAddP + toFiniteNumber(delta.critDmgAddP)
    });
  }

  function evaluateDotAtTick(base, snapshot, delta = {}) {
    if (!base?.dotInput || !snapshot) return { supported: false, reason: '周期ダメージの付与元能力が未確認です' };
                                                                                 
                                                                                  
    if (toFiniteNumber(delta.specialP) || toFiniteNumber(delta.otherP)
      || toFiniteNumber(delta.actionMultiplierBonusP)) {
      return { supported: false, reason: '周期ダメージ補正の供給位置が未確認です' };
    }
    const defense = resolveCombatStat(base.baseDef, base.defenseP - toFiniteNumber(delta.enemyDefDownP), 1);
    const critResistance = resolveCombatStat(base.baseCritRes, base.critResP - toFiniteNumber(delta.enemyCritResDownP), 1);
    const critDmgResistance = resolveCombatStat(base.baseCritDmgRes, base.critDmgResP - toFiniteNumber(delta.enemyCritDmgResDownP), 1);
    const critRate = resolveDirectCritRate(calcRuntimeCritRate(snapshot.critical, critResistance),
      base.critRateP + toFiniteNumber(delta.critRateP), base.critResAddP);
    const critMult = clampCombatCritMultiplier(calcRuntimeCritMultiplier(snapshot.criticalDamage, critDmgResistance)
      + (snapshot.criticalDamagePoints - base.critDmgResAddP) / 100);
    return evaluateDotDamage({ ...base.dotInput,
      baseDamage: snapshot.attack * calcRuntimeBaseDamageRate(snapshot.attack, defense),
      damageRate: resolveNormalDamageRate(1, base.rawAddRate + toFiniteNumber(delta.addP) / 100),
                                                                            
                                                                                 
      endCorrection: base.dotInput.endCorrection + (delta.nativeEndCorrectionP ?? 0) / 100,
      critRate, critMult });
  }

  function evaluateDamageAtHit(input = {}) {
                                                                               
                                                                              
    const powerBase = input.runtimeBase;
    const powerEligible = !input.generatedIndependentStatsUnresolved && !powerBase?.damageReference
      && (powerBase?.masterPowerRateEligible === true || !!powerBase?.hitInput)
      && ['basicAttack', 'enhancedAttack', 'lowSkill', 'highSkill'].includes(input.actionKey);
    input = { ...input, modifierDelta: { ...(input.modifierDelta || {}),
      addP: toFiniteNumber(input.modifierDelta?.addP)
        + (powerEligible ? toFiniteNumber(input.modifierDelta?.masterPowerPercentP) : 0) } };
    let expectedDamage = Math.max(0, toFiniteNumber(input.expectedDamage));
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
      modifiers: { ...(effect?.modifiers || {}) },
      ...(Array.isArray(effect?.sources) ? { sources: effect.sources.map(source => ({
        ...source, effectIds: [...normalizeArray(source.effectIds)] })) } : {})
    }));
    const base = input.runtimeBase || null;
    const hitComponents = input.hitComponents || (base?.hitInput ? [{ runtimeBase: base, hitCount: 1 }] : null);
    if (hitComponents?.length) {
      const results = hitComponents.map(component => evaluateResolvedHit(component, input));
      if (results.every(result => result?.supported)) {
        const resolvedExpected = results.reduce((total, result) => total + result.expected, 0);
        return { baseExpectedDamage: expectedDamage, expectedDamage: resolvedExpected,
          ratio: expectedDamage > 0 ? resolvedExpected / expectedDamage : 1,
          ratios: {}, modifierDelta: { ...modifierDelta }, heldAddP, statusTakenDmgP, statusDamageP,
          activeEffects, runtimeBaseAvailable: true, calculationMode: 'normal-hit-v1', hitResults: results };
      }
      const unavailable = results.find(result => result && !result.supported);
      if (unavailable) return { baseExpectedDamage: expectedDamage, expectedDamage: NaN,
        calculationMode: 'unavailable', reason: unavailable.reason, unavailable: true,
        ratio: 1, ratios: {}, activeEffects, modifierDelta: { ...modifierDelta },
        heldAddP, statusTakenDmgP, statusDamageP, runtimeBaseAvailable: true };
    }
    if ((modifierDelta.nativeEndCorrectionP != null && modifierDelta.nativeEndCorrectionP !== 0)
      || input.nativeCoefficientMultiplier != null) {
      return { baseExpectedDamage: expectedDamage, expectedDamage: NaN,
        calculationMode: 'unavailable', reason: '最終補正または状態数補正の命中計算入力が不足しています',
        unavailable: true, ratio: 1, ratios: {}, activeEffects,
        modifierDelta: { ...modifierDelta }, heldAddP, statusTakenDmgP, statusDamageP,
        runtimeBaseAvailable: !!base };
    }
    const calculationMode = 'legacy-continuous';
    if (input.legacyExpectedDamage != null) expectedDamage = Math.max(0, toFiniteNumber(input.legacyExpectedDamage));
    const roundingReason = input.roundingReason || base?.roundingReason || '補正の供給元または命中配分が未確定です';
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
        runtimeBaseAvailable: !!base, calculationMode, roundingReason
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
        runtimeBaseAvailable: false, calculationMode, roundingReason
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
        ? resolveCombatStat(toFiniteNumber(base.baseAtk), toFiniteNumber(base.attackP) + attackP)
        : oldFinalAtk;
      const oldFinalDef = Math.max(1, toFiniteNumber(base.finalDef, 1));
      const newFinalDef = enemyDefDownP
        ? resolveCombatStat(toFiniteNumber(base.baseDef, oldFinalDef), toFiniteNumber(base.defenseP) - enemyDefDownP, 1)
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
        : clampCombatCritRate(toFiniteNumber(base.critRate, 0.05));
      const oldCritMult = clampCombatCritMultiplier(toFiniteNumber(base.critMult, 1.2));
      const newFinalCrit = resolveCombatStat(toFiniteNumber(base.baseCrit), toFiniteNumber(base.critP) + critP);
      const newFinalCritRes = enemyCritResDownP
        ? resolveCombatStat(toFiniteNumber(base.baseCritRes, base.finalCritRes), toFiniteNumber(base.critResP) - enemyCritResDownP, 1)
        : Math.max(1, toFiniteNumber(base.finalCritRes, 1));
      const newBaseCritRate = calcRuntimeCritRate(newFinalCrit, newFinalCritRes);
      const newCritRate = base.guaranteedCrit
        ? 1
        : resolveDirectCritRate(newBaseCritRate,
          toFiniteNumber(base.critRateP) + critRateP, toFiniteNumber(base.critResAddP));
      const newFinalCritDmg = resolveCombatStat(toFiniteNumber(base.baseCritDmg), toFiniteNumber(base.critDmgP) + critDmgP);
      const newFinalCritDmgRes = enemyCritDmgResDownP
        ? resolveCombatStat(toFiniteNumber(base.baseCritDmgRes, base.finalCritDmgRes), toFiniteNumber(base.critDmgResP) - enemyCritDmgResDownP, 1)
        : Math.max(1, toFiniteNumber(base.finalCritDmgRes, 1));
      const newBaseCritMult = calcRuntimeCritMultiplier(newFinalCritDmg, newFinalCritDmgRes);
      const newCritMult = clampCombatCritMultiplier(
        newBaseCritMult
          + (toFiniteNumber(base.critDmgAddP) + critDmgAddP) / 100
          - toFiniteNumber(base.critDmgResAddP) / 100
      );
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
      runtimeBaseAvailable: true, calculationMode, roundingReason
    };
  }

  function evaluateRuntimeDamage(expectedDamage, current, event, damageProfiles, state, config, runtimeBase = null, statusDamageP = 0) {
                                                                             
                                                                                 
                                                                       
    const eventRuntimeBase = runtimeBase || getEventRuntimeBase(current, event, damageProfiles);
    const damageActionKey = eventRuntimeBase?.runtimeActionKey ?? (current?.key || '');
                                                                                
                                                                                
    const baselineActionKey = runtimeBase?.runtimeActionKey ?? (current?.key || '');
    const modifierDelta = getRuntimeDamageBuffDelta(state, config, baselineActionKey);
    const heldAddP = Object.values(state.runtimeResources || {}).reduce((total, resource) => (
      total + ((!normalizeArray(resource.heldAddActionKeys).length
        || resource.heldAddActionKeys.includes(damageActionKey))
        && normalizeArray(resource.heldAddEffectIds).some(effectId => (
        normalizeArray(state.runtimeDamageEffectIds).includes(String(effectId || ''))
      ))
        ? toFiniteNumber(resource.stacks) * toFiniteNumber(resource.heldAddPPerStack)
        : 0)
    ), 0);
    const statusTakenDmgP = getStatusReactionTakenDmgP(state, config);
    const resolvedStatusTakenDmgP = getStatusReactionTakenDmgP(state, config, isResolvedDamageRateStatusReaction);
                                                                             
                                                                                  
    const hasUnresolvedStatusReaction = normalizeArray(config?.runtimeEffects?.statusReactions)
      .some(reaction => !isResolvedDamageRateStatusReaction(reaction)
        && getStatusReactionTakenDmgP(state, config, candidate => candidate === reaction) !== 0);
    const activeEffects = normalizeArray(state.runtimeBuffStacks)
      .filter(stack => stack.kind === 'damageBuff' || stack.kind === 'resourceGain')
      .filter(stack => isTimedRuntimeBuffConditionActive(state, stack))
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
      modifiers: { addP: heldAddP },
      sources: Object.values(state.runtimeResources || {})
        .filter(resource => resource.stacks > 0 && resource.heldAddPPerStack
          && (!normalizeArray(resource.heldAddActionKeys).length || resource.heldAddActionKeys.includes(damageActionKey))
          && normalizeArray(resource.heldAddEffectIds).some(id => normalizeArray(state.runtimeDamageEffectIds).includes(id)))
        .map(resource => ({ resourceId: resource.id, stacks: resource.stacks,
          perStack: resource.heldAddPPerStack, effectIds: [...normalizeArray(resource.heldAddEffectIds)] }))
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
    const hitComponents = event?.generatedIndependentStatsUnresolved ? []
      : runtimeBase?.hitInput && (runtimeBase.hitInput.perHitDefinition || runtimeBase.hitInput.singleHitDefinition)
      ? [{ runtimeBase, coefficientP: runtimeBase.hitInput.perHitCoefficientP ?? runtimeBase.hitInput.coefficientP, hitCount: 1 }]
      : runtimeBase || event?.type !== 'damage' ? [] : getEventHitComponents(current, event, damageProfiles);
    const result = evaluateDamageAtHit({
      expectedDamage,
      legacyExpectedDamage: runtimeBase ? runtimeBase.legacyExpectedDamage ?? expectedDamage
        : event?.type === 'damage' && Array.isArray(current?.events)
          ? getEventExpectedDamage(current, event, damageProfiles, true) : expectedDamage,
      actionKey: damageActionKey,
      apostleId: config.apostleId,
      effectId: event?.effectId || '',
      nativeCoefficientMultiplier: event?.nativeCoefficientMultiplier,
      generatedEventType: event?.generatedEventType || '',
      modifierDelta,
      generatedIndependentStatsUnresolved: event?.generatedIndependentStatsUnresolved === true,
      heldAddP,
      statusTakenDmgP,
      resolvedStatusTakenDmgP,
      hasUnresolvedStatusReaction,
      statusDamageP,
      activeEffects,
      hitComponents,
      runtimeBase: eventRuntimeBase
    });
    if (result.unavailable) throw new RangeError(result.reason);
    if (event?.generatedIndependentStatsUnresolved) {
      result.roundingReason = '分身の選択的能力継承が未対応のため、主人profileによる旧互換ダメージ';
    }
    const calculation = state.damageCalculation || (state.damageCalculation = { roundedEvents: 0, legacyEvents: 0, reasons: new Set() });
    if (result.calculationMode === 'normal-hit-v1') calculation.roundedEvents += 1;
    else { calculation.legacyEvents += 1; calculation.reasons.add(result.roundingReason); }
    return result;
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

  function* simulateSteps(config, options = {}, cooperative = null) {
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
                                                                               
                                                                             
                                                                              
                                                                                
    const supportEvents = [];
    for (const clock of normalizeArray(config.supportClocks)) {
      const bindings = clock.bindings.filter(binding => !normalizeArray(options.externalEvents ?? config.externalEvents)
        .some(event => event.bindingKey && event.bindingKey === binding.bindingKey));
      if (!bindings.length) continue;
      const supportSeed = deriveSupportSeed(options.seed, clock.ownerId);
      yield* simulateSteps(clock.config, {
        ...options, seed: supportSeed, highSkillMode: clock.highSkillMode,
        externalEvents: [], recordTimeline: false, recordDamageSeries: false,
        damageProfiles: clock.damageProfiles, statusDamageProfiles: clock.statusDamageProfiles,
        summonCalculationInput: clock.summonCalculationInput,
        notificationSink: notification => {
          bindings.forEach(binding => {
            if (!matchesSupportNotification(binding, notification)) return;
            const applicationDelayFrames = binding.supportRecipientModel === 'selected-recipient-provisional'
              ? calculatePiraGiftDelayFrames(binding.supportApplicationDelaySeconds, framesPerSecond) : 0;
            supportEvents.push({ type: binding.type, frame: notification.frame + applicationDelayFrames,
              sourceId: clock.ownerId, bindingKey: binding.bindingKey,
              triggerSourceId: binding.triggerSourceId || '', value: binding.value ?? '',
              conditionType: binding.conditionType || '', conditionValue: binding.conditionValue ?? '',
              reason: `${binding.label || '編成効果'}（支援行動）`,
              candidateId: binding.id, supportClock: true });
            if (binding.type === '状態付与時' && binding.statusReactionOnly === true) {
              Object.assign(supportEvents[supportEvents.length - 1], {
                status: notification.status, statusDurationFrames: notification.durationFrames,
                statusStackable: binding.statusStackable, statusMaxStacks: binding.statusMaxStacks,
                statusStackCount: 1, statusStackGroupId: binding.statusStackGroupId,
                statusApplicationEffectId: notification.applicationEffectId,
                statusSourceId: clock.ownerId, statusSourceSelf: false,
                statusDealsPeriodicDamage: false, statusReactionOnly: true
              });
            }
          });
        }
      }, cooperative);
    }
    if (supportEvents.length) options = { ...options,
      externalEvents: [...normalizeArray(options.externalEvents
        ?? normalizeArray(config.externalEvents).filter(event => event.intrinsic !== true)), ...supportEvents] };
    const enemyCount = Math.max(1, Math.floor(toFiniteNumber(
      options.enemyCount ?? config.enemyCount,
      1
    )));
    const highSkillMode = options.highSkillMode === 'auto' ? 'auto' : 'disabled';
                                                                                
                                                                              
                                                                           
    if (normalizeScenarioId(config.apostleId) === 'tig' && config.actions?.lowSkill
      && config.enemyIsWorldBoss !== true
      && !(config.enemyIsWorldBoss === false && config.tigHeroHpModel === 'omit-with-warning-v1')) {
      throw new RangeError('ティグの低学年DPSは現在ワールドボス相手に限定しています。使徒相手の最大HP追加ダメージ、または敵区分が未確認のため計算を停止しました。');
    }
    const activeSummonDefinitions = Object.values(config.actions || {}).filter(action => (
      action.key !== 'highSkill' || highSkillMode === 'auto'
    )).flatMap(action => normalizeArray(action.summonUnits));
    if (activeSummonDefinitions.length && ['elena-known-site-neutral-v1', 'ashur-known-site-recorded-contact-v1']
      .includes(options.summonCalculationInput?.provisionalModel)
      && ([...normalizeArray(options.externalEvents), ...normalizeArray(config.externalEvents)].length
        || ['damageBuffEffects', 'attackSpeedEffects', 'accelerationEffects', 'eventEffects']
          .flatMap(key => [...normalizeArray(options.runtimeEffects?.[key]),
            ...normalizeArray(config.runtimeEffects?.[key])])
          .some(effect => effect.mode !== 'off' && effect.mode !== 'disabled'))) {
      throw new RangeError('この召喚モデルと動的補正・外部イベントの併用は接続待ちです');
    }
    if (options.summonCalculationInput && options.resolveSummonUnit) {
      throw new RangeError('召喚計算の純データとcallbackは同時指定できません');
    }
    if (activeSummonDefinitions.length && options.summonCalculationInput) {
      const issues = getSummonCalculationIssues(options.summonCalculationInput, activeSummonDefinitions);
      if (issues.length) throw new RangeError(issues.join(' / '));
    }
    const resolveSummonUnit = options.summonCalculationInput
      ? createSummonDataResolver(options.summonCalculationInput)
      : typeof options.resolveSummonUnit === 'function' ? options.resolveSummonUnit : null;
    Object.values(config.actions || {}).forEach(action => {
      if (action.key === 'highSkill' && highSkillMode !== 'auto') return;
      normalizeArray(action.summonUnits).forEach(definition => {
        const issues = getSummonUnitIssues(definition);
        const spawnEvents = normalizeArray(action.generatedEvents).filter(event => (
          event.generatedObjectId === definition.id && event.generatedEventType === '生成'
        ));
        if (!spawnEvents.length) issues.push('召喚発生時刻・個体数が未確定です');
        spawnEvents.forEach(event => {
          const starts = normalizeArray(definition.timingEvents).filter(row => row.recordPurpose !== '観測'
            && row.eventType === '行動開始' && (row.instanceOrder == null || row.instanceOrder === event.generatedInstanceOrder));
          if (starts.length !== 1) issues.push(`個体${event.generatedInstanceOrder}: 行動開始が一意ではありません`);
        });
        normalizeArray(definition.timingEvents).filter(event => event.recordPurpose !== '観測'
          && event.timeOrigin === '終了時').forEach(event => {
          if (event.frame !== 0) issues.push('召喚終了後に遅延する効果は未対応です');
        });
        normalizeArray(action.generatedEvents).filter(event => event.summonDefinition?.id === definition.id
          && event.type === 'generatedEffect' && event.generatedEventType !== '生成').forEach(event => {
          if (!event.statusApplication) issues.push('召喚終了時の状態効果入力が不足しています');
          else if (event.statusApplication.dealsPeriodicDamage) issues.push('分身自身の継続ダメージ入力が未接続です');
        });
        if (!resolveSummonUnit) issues.push('召喚ユニット自身の能力・状態継承と命中計算の供給処理が未接続です');
        if (issues.length) throw new RangeError(`${definition.id}: ${issues.join(' / ')}`);
      });
    });
    if (config.epicaA2TimingApproximation && enemyCount !== 1) {
      throw new Error('エピカA2暫定DPSは敵1体に限定しています。');
    }
    if (config.runtimeEffects?.yomiAsideReservations && enemyCount !== 1) {
      throw new Error('ヨミA2の追加攻撃は敵1体の比較に限定しています。');
    }
    if (config.epicaA2TimingApproximation && ['spRecoveryEffects', 'cooldownEffects', 'damageBuffEffects']
      .flatMap(key => normalizeArray(config.runtimeEffects?.[key]))
      .some(effect => effect.mode === 'actionHit'
        && effect.triggerActionKeys?.some(key => ['basicAttack', 'enhancedAttack'].includes(key)))) {
      throw new Error('エピカA2暫定DPSでは普通攻撃の外部命中時効果との併用は未対応です。');
    }
    const initialHighSkillCooldownMultiplier = Math.max(
      0,
      toFiniteNumber(options.initialHighSkillCooldownMultiplier, 0.5)
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
    const summonUnits = new Map();
                                        
                                  
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
      nonOccupyingHighGlobalReadyTick: 0,
      movementTransition: null,
      skillTransition: null,
      pendingGeneratedEvents: [],
      ownerAreas: [],
      ownerReserves: [],
      pendingUnitSpRecoveries: [],
      pendingYomiAsideAttacks: [],
      ownerAreaSerial: 0,
      pendingGeneratedEventQueue: [],
      generatedEventQueueSequence: 0,
      runtimePeriodicEventQueue: [],
      runtimePeriodicEventQueueSequence: 0,
      generatedAttackSpeedSnapshots: new Set(),
      actionSerial: 0,
      enhancedRepeatChain: null,
      normalAttackSequence: 0,
      epicaLowEnhancedUntilTick: 0,
      lastCompletedAction: null,
      lastNormalAttackStartTick: null,
      normalAttackProgressFrames: null,
      normalAttackProgressLastTick: null,
      normalAttackCycleFrames: null,
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
      runtimeSpRegenEffects: normalizeArray(config.runtimeEffects?.spRegenEffects)
        .filter(effect => ['externalTimed','sourceEventTimed'].includes(effect.mode))
        .map(effect => ({ ...effect, expireTicks: [] })),
      runtimeCooldownSettingEffects: normalizeArray(config.runtimeEffects?.cooldownSettingEffects)
        .map(effect => ({ ...effect, expireTicks: [] })),
      runtimeAccelerationEffects: normalizeArray(config.runtimeEffects?.accelerationEffects).map(effect => ({
        ...effect,
        active: false,
        startTick: -1,
        expireTick: Infinity,
        triggerCount: 0,
        lastActionInstanceId: null
      })),
      runtimeSpRecoveryEffects: normalizeArray(config.runtimeEffects?.spRecoveryEffects).map(effect => ({
        ...effect,
        ...(effect?.resolvedRecoveryFactors === undefined ? {} : {
          resolvedRecoveryFactors: normalizeResolvedSpRecoveryFactors(effect)
        }),
        nextTick: effect.mode === 'periodic' && effect.intervalFrames > 0
          ? toTicks(effect.intervalFrames, ticksPerFrame)
          : Infinity,
        triggerCount: 0,
        lastActionInstanceId: null,
        activeUntilTick: -1,
        alicePassiveExpiryTick: -1
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
      externalEvents: (options.externalEvents
        ? [...normalizeArray(config.externalEvents).filter(event => event.intrinsic === true), ...normalizeArray(options.externalEvents)]
        : normalizeArray(config.externalEvents))
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
                calculateInitialCooldownSettingSeconds(config.actions.highSkill.cooldownSeconds,
                  config.highSkillCooldownSettings, initialHighSkillCooldownMultiplier) * framesPerSecond,
                ticksPerFrame
              )
            : Infinity
        }
      },
      lastSkillVariant: ''
    };

    const log = (type, detail = {}) => {
      options.notificationSink?.({frame: state.tick / ticksPerFrame, type, ...detail});
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
    state.runtimeAccelerationEffects.forEach(scheduleRuntimeExpireTick);
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

    const pickSpRecoveryValue = (minimum, maximum, valueType = '') => {
      const low = Math.min(toFiniteNumber(minimum), toFiniteNumber(maximum));
      const high = Math.max(toFiniteNumber(minimum), toFiniteNumber(maximum));
      if (Math.abs(high - low) < 0.000001) return low;
      if (valueType === 'float') return Math.fround(low + random() * (high - low));
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
        ? pickSpRecoveryValue(effect.fixedMin, effect.fixedMax, effect.randomValueType)
        : effect.fixed;
      const percent = effect.random
        ? pickSpRecoveryValue(effect.percentMin, effect.percentMax, effect.randomValueType)
        : effect.percent;
      const amountModifierP = toFiniteNumber(effect.amountModifierP);
      const factors = effect.resolvedRecoveryFactors;
      const baseAmount = fixed + config.maxSp * percent / 100;
      const requestedAmount = factors
        ? baseAmount * factors.owner * factors.recipient
        : baseAmount * (1 + amountModifierP / 100);
      if (!requestedAmount) return;
      const before = state.sp;
                                                                         
                                                                            
                                                                            
      const candidateSp = before + requestedAmount;
      const roundedAmount = roundNativeToEven(Math.fround(candidateSp - before), 0) || 0;
      state.sp = candidateSp < 1 ? 0
        : Math.min(config.maxSp, Math.max(0, before + roundedAmount));
      log('spRecoveryEvent', {
        effectId: effect.effectId || effect.id,
        sourceId: effect.sourceId,
        label: effect.label,
        reason,
        actionKey: owner?.key || '',
        actionLabel: owner?.label || '',
        requestedAmount,
        roundedAmount,
        amountModifierP,
        ...(factors ? { resolvedRecoveryFactors: { ...factors } } : {}),
        amount: state.sp - before,
        sp: state.sp,
        capped: state.sp === before
      });
      queueLowSkillIfReady();
    };

    const requestSpRecoveryEffect = (effect, reason, owner) => {
      if (!(effect.unitDelaySeconds > 0)) {applySpRecoveryEffect(effect,reason,owner);return;}
                                                                     
                                                                              
      state.pendingUnitSpRecoveries.push({effect:{...effect},owner:{...owner},reason,
        elapsed:Math.fround(Math.fround(1 / 60) * Math.fround(getOwnerAreaSpeed())),
        nextTick:state.tick + toTicks(framesPerSecond / 60,ticksPerFrame)});
      log('spRecoveryScheduled',{effectId:effect.effectId || effect.id,actionKey:owner.key,
        unitDelaySeconds:effect.unitDelaySeconds,referenceUpdatesPerGameSecond:60});
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
        const reason = `${owner.label}${phase === 'end' ? '終了時' : '発動時'}`;
        requestSpRecoveryEffect(effect,reason,owner);
      });
    };

    const triggerSpRecoveryEffectsForHit = (owner, effectEvent = false, hitCount = 1, event = null) => {
      state.runtimeSpRecoveryEffects.forEach(effect => {
        if (effect.mode !== 'actionHit' || !effect.triggerActionKeys.includes(owner.key)) return;
                                                                               
                                                                             
        if (effect.externalTriggerType === '生成物命中時'
          && (event?.type !== 'damage' || !effect.triggerSourceId
            || event.generatedObjectId !== effect.triggerSourceId)) return;
                                               
                                                  
        if (effectEvent && !effect.oncePerAction) return;
        const occurrences = effectEvent ? 1 : Math.max(1, Math.floor(toFiniteNumber(hitCount, 1)));
        for (let occurrence = 0; occurrence < occurrences; occurrence += 1) {
          if (effect.oncePerAction && effect.lastActionInstanceId === owner.instanceId) break;
          effect.triggerCount += 1;
          if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) continue;
          effect.lastActionInstanceId = owner.instanceId;
          if (effect.alicePassiveResetFrames > 0) {
            const retained = effect.alicePassiveExpiryTick > state.tick;
            effect.alicePassiveExpiryTick = state.tick + toTicks(effect.alicePassiveResetFrames, ticksPerFrame);
            if (retained) {
              log('spRecoveryRejected', {effectId:effect.effectId,sourceId:effect.sourceId,
                actionKey:owner.key,reason:'既存のSP回復状態を延長し、新規回復は受け付けません',
                expireFrame:effect.alicePassiveExpiryTick / ticksPerFrame,sp:state.sp});
              continue;
            }
          }
          requestSpRecoveryEffect(effect, `${owner.label}${effectEvent ? '効果発生時' : '命中時'}`, owner);
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

    const getRuntimeAttackSpeedP = () => {
      const shared = new Map();
      let total = 0;
      state.runtimeAttackSpeedEffects.forEach(effect => {
        const value = effect.stackCount * effect.hasteP;
        if (!effect.stackable && effect.runtimeBaseEffectId) {
          const previous = shared.get(effect.runtimeBaseEffectId) || 0;
                                                                         
                                                                              
          if (Math.abs(value) > Math.abs(previous)) shared.set(effect.runtimeBaseEffectId,value);
        } else total += value;
      });
      return total + [...shared.values()].reduce((sum,value)=>sum+value,0)
        + Object.values(state.runtimeResources || {}).reduce((sum,resource)=>(
          sum+toFiniteNumber(resource.stacks)*toFiniteNumber(resource.heldHastePPerStack)
        ),0);
    };

    const getAccelerationContribution = (effect, fromTick, toTick) => {
      if (!effect?.active || !(toTick > fromTick)) return 0;
      const startTick = Number.isFinite(Number(effect.startTick)) ? Number(effect.startTick) : fromTick;
      const fromFrame = Math.max(0, (fromTick - startTick) / ticksPerFrame);
      const toFrame = Math.max(fromFrame, (toTick - startTick) / ticksPerFrame);
      const durationFrames = effect.durationFrames > 0 ? effect.durationFrames : Infinity;
      const clippedTo = Math.min(toFrame, durationFrames);
      if (!(clippedTo > fromFrame)) return 0;
      const maxAccelerationP = Math.max(0, toFiniteNumber(
        effect.maxAccelerationP,
        toFiniteNumber(effect.accelerationP)
      ));
      if (!(maxAccelerationP > 0)) return 0;
      const curve = String(effect.curve || 'constant');
      if (curve !== 'linearHold' || !(effect.rampFrames > 0)) {
        return (clippedTo - Math.min(fromFrame, clippedTo)) * maxAccelerationP / 100;
      }
      const rampEnd = Math.min(durationFrames, effect.rampFrames);
      const rampFrom = Math.min(Math.max(fromFrame, 0), rampEnd);
      const rampTo = Math.min(Math.max(clippedTo, 0), rampEnd);
      const rampContribution = rampTo > rampFrom
        ? maxAccelerationP / 100 * (rampTo * rampTo - rampFrom * rampFrom) / (2 * effect.rampFrames)
        : 0;
      const holdStart = rampEnd;
      const holdEnd = Math.min(durationFrames, rampEnd + Math.max(0, effect.holdFrames));
      const holdFrom = Math.max(fromFrame, holdStart);
      const holdTo = Math.min(clippedTo, holdEnd);
      const holdContribution = holdTo > holdFrom
        ? (holdTo - holdFrom) * maxAccelerationP / 100
        : 0;
      return rampContribution + holdContribution;
    };

                                                                          
                                                                           
                                             
    const isRenewaAcceleration = effect => effect.effectId === 'Renewa_high_e01';
    const usesRenewaTiming = state.runtimeAccelerationEffects.some(isRenewaAcceleration);
    const usesContinuousAcceleration = state.runtimeAccelerationEffects.some(effect => !isRenewaAcceleration(effect));
    const speedModelWarnings = [];
    if (state.runtimeAccelerationEffects.filter(isRenewaAcceleration).length > 1) {
      speedModelWarnings.push('リニュア加速の複数発動元は書込順が未確認のため、最新の発動元で近似します（倍率を乗算しません）');
    }
    if (usesRenewaTiming && usesContinuousAcceleration) {
      speedModelWarnings.push('リニュアと他の加速の併用は合成規則が未確認です。他の加速は既存の連続進行で近似します');
    }
    const getRenewaSpeedAtStart = () => {
      const active = state.runtimeAccelerationEffects.filter(effect => (
        isRenewaAcceleration(effect) && effect.active && effect.expireTick > state.tick
      ));
      if (!active.length) return 1;
                                                                        
                                                                                   
      const effect = active.reduce((latest, next) => next.startTick >= latest.startTick ? next : latest);
      const elapsedFrames = Math.max(0, (state.tick - effect.startTick) / ticksPerFrame);
      return 1 + effect.maxAccelerationP / 100 * Math.min(1, elapsedFrames / effect.rampFrames);
    };

    const integrateActionSpeedFrames = (fromTick, toTick) => {
      if (!(toTick > fromTick)) return 0;
      const baseFrames = (toTick - fromTick) / ticksPerFrame;
      return baseFrames + state.runtimeAccelerationEffects.reduce((total, effect) => (
        total + (isRenewaAcceleration(effect) ? 0 : getAccelerationContribution(effect, fromTick, toTick))
      ), 0);
    };

    const hasActiveAcceleration = () => state.runtimeAccelerationEffects.some(effect => (
      effect.active && effect.expireTick > state.tick
    ));

    const advanceCurrentActionProgress = () => {
      const current = state.currentAction;
      if (!current?.dynamicTiming || current.progressLastTick >= state.tick) return;
      current.progressFrames += integrateActionSpeedFrames(current.progressLastTick, state.tick);
      current.progressLastTick = state.tick;
    };

    const advanceNormalAttackProgress = () => {
      if (state.normalAttackProgressFrames == null
        || state.normalAttackProgressLastTick == null
        || state.normalAttackProgressLastTick >= state.tick) return;
      state.normalAttackProgressFrames += integrateActionSpeedFrames(
        state.normalAttackProgressLastTick,
        state.tick
      );
      state.normalAttackProgressLastTick = state.tick;
    };

    const getEffectiveNormalAttackIntervalFrames = () => {
      const base = config.normalAttackSpeedBase;
      if (base > 0) return config.normalAttackIntervalFrames * base / resolveAttackSpeed(base, getRuntimeAttackSpeedP());
                                                                               
                                                                                
      return config.normalAttackIntervalFrames / (1 + getRuntimeAttackSpeedP() / 100);
    };

    const applyAttackSpeedEffect = (effect, reason = '') => {
      const previousStackCount = effect.stackCount;
      const previousTotalHasteP = getRuntimeAttackSpeedP();
      if (!effect.stackable && effect.runtimeBaseEffectId) {
        state.runtimeAttackSpeedEffects.forEach(other => {
          if (other === effect || other.stackable || other.mode === 'fixed'
            || other.runtimeBaseEffectId !== effect.runtimeBaseEffectId || !other.stackCount) return;
          other.stackCount = 0;
          other.expireTicks = [];
          scheduleRuntimeExpireTicks(other);
          logEffectStateChange({kind:'attackSpeed',effectId:other.id,label:other.label,
            operation:'replace',stackCount:0,maxStacks:other.maxStacks,sourceId:other.sourceId,
            reason:'同じ攻撃速度効果を更新'});
        });
      }
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
      state.runtimeAttackSpeedEffects.forEach(effect => {
        if (!effect.expireTicks.length) return;
        const before = effect.expireTicks.length;
        effect.expireTicks = effect.expireTicks.filter(expireTick => expireTick > state.tick);
        effect.stackCount = effect.expireTicks.length;
        if (effect.stackCount === before) return;
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

    const applyAccelerationEffect = (effect, reason = '') => {
      if (!effect) return;
      const wasActive = !!effect.active;
      const previousStartTick = effect.startTick;
      effect.active = true;
      effect.startTick = state.tick;
      effect.expireTick = effect.durationFrames > 0
        ? state.tick + toTicks(effect.durationFrames, ticksPerFrame)
        : Infinity;
      effect.triggerCount += 1;
      scheduleRuntimeExpireTick(effect);
      logEffectStateChange({
        kind: 'acceleration',
        effectId: effect.id,
        label: effect.label,
        operation: wasActive ? 'update' : 'apply',
        stackCount: 1,
        maxStacks: 1,
        appliedTick: state.tick,
        expireTick: effect.expireTick,
        sourceId: effect.sourceId,
        reason,
        details: {
          accelerationP: effect.accelerationP,
          maxAccelerationP: effect.maxAccelerationP,
          maxActionSpeedP: effect.maxActionSpeedP,
          curve: effect.curve,
          rampFrames: effect.rampFrames,
          holdFrames: effect.holdFrames,
          durationFrames: effect.durationFrames,
          previousStartTick
        }
      });
      log('accelerationApplied', {
        effectId: effect.id,
        sourceId: effect.sourceId,
        label: effect.label,
        reason,
        accelerationP: effect.accelerationP,
        maxAccelerationP: effect.maxAccelerationP,
        maxActionSpeedP: effect.maxActionSpeedP,
        curve: effect.curve,
        rampFrames: effect.rampFrames,
        holdFrames: effect.holdFrames,
        durationFrames: effect.durationFrames
      });
    };

    const expireAccelerationEffects = () => {
      state.runtimeAccelerationEffects.forEach(effect => {
        if (!effect.active || effect.expireTick > state.tick) return;
        effect.active = false;
        logEffectStateChange({
          kind: 'acceleration',
          effectId: effect.id,
          label: effect.label,
          operation: 'expire',
          stackCount: 0,
          maxStacks: 1,
          appliedTick: effect.startTick,
          expireTick: effect.expireTick,
          sourceId: effect.sourceId,
          reason: '持続時間終了',
          details: {
            accelerationP: effect.accelerationP,
            maxAccelerationP: effect.maxAccelerationP,
            maxActionSpeedP: effect.maxActionSpeedP,
            curve: effect.curve,
            rampFrames: effect.rampFrames,
            holdFrames: effect.holdFrames,
            durationFrames: effect.durationFrames
          }
        });
        log('accelerationExpired', {
          effectId: effect.id,
          sourceId: effect.sourceId,
          label: effect.label,
          accelerationP: effect.accelerationP,
          maxAccelerationP: effect.maxAccelerationP,
          maxActionSpeedP: effect.maxActionSpeedP,
          durationFrames: effect.durationFrames
        });
      });
    };

    const triggerAccelerationEffectsForAction = (actionKey, phase = 'start') => {
      state.runtimeAccelerationEffects.forEach(effect => {
        if (effect.mode !== 'actionTimed' || effect.triggerPhase !== phase || !effect.triggerActionKeys.includes(actionKey)) return;
        applyAccelerationEffect(effect, `${ACTION_LABELS[actionKey] || actionKey}${phase === 'end' ? '終了' : '発動'}`);
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
                                                                            
                                                                           
      const stateGroupId = !definition.stackable && definition.runtimeBaseEffectId
        ? definition.runtimeBaseEffectId : definition.id;
      const matchesState = stack => stack.kind === 'damageBuff'
        && (stack.stateGroupId || stack.effectId) === stateGroupId;
      const matching = state.runtimeBuffStacks.filter(matchesState);
      const operation = !definition.stackable && matching.length ? 'update' : 'apply';
      if (definition.stopAtMaxStacks && matching.length >= definition.maxStacks) return;
      if (!definition.stackable) {
        matching.forEach(stack => { stack.active = false; });
        state.runtimeBuffStacks = state.runtimeBuffStacks.filter(stack => !matchesState(stack));
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
          stackCount: state.runtimeBuffStacks.filter(matchesState).length,
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
        applyActionKeys: normalizeArray(definition.applyActionKeys),
        releaseAfterActionKeys: normalizeArray(definition.releaseAfterActionKeys),
        stateGroupId,
        sourceId: definition.sourceId,
        sourceActionKey: owner?.key || '',
        sourceActionLabel: owner?.label || '',
        label: definition.label,
        modifiers: { ...definition.modifiers },
        requiredStatus: definition.requiredStatus || '',
        requireSelfSource: !!definition.requireSelfSource,
        active: true,
        appliedTick: state.tick,
        expireTick: definition.durationFrames > 0
          ? state.tick + toTicks(definition.durationFrames, ticksPerFrame)
          : Infinity
      };
      if (definition.stackable && matching.length + 1 === definition.maxStacks) {
        addModifierMap(stack.modifiers, definition.maxStackModifiers);
      }
      state.runtimeBuffStacks.push(stack);
      scheduleRuntimeExpireTick(stack);
      logEffectStateChange({
        kind: 'buff',
        effectId: stack.effectId,
        label: stack.label,
        operation,
        stackId: stack.id,
        stackCount: state.runtimeBuffStacks.filter(matchesState).length,
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
        stackCount: state.runtimeBuffStacks.filter(matchesState).length,
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
        if (normalizeScenarioId(config.apostleId) === 'rim'
          && effect.id === 'Rim_aside_2_e01:owner:Rim'
          && !isRuntimeStatusConditionActive(state,{mode:'conditionalStatus',requiredStatus:'苦痛'})) return;
        const applications = effect.stackable ? Math.max(1, Math.floor(toFiniteNumber(hitCount, 1))) : 1;
        for (let index = 0; index < applications; index += 1) {
          effect.triggerCount += 1;
          if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) continue;
          applyRuntimeDamageBuff(effect, owner, `${owner.label}命中時`);
        }
      });
    };

    const triggerDamageBuffEffectsForStatusApplication = (owner, application) => {
                                       
                                          
                                            
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
      state.runtimeSpRegenEffects.forEach(effect => {
        if (effect.mode !== 'sourceEventTimed' || effect.triggerSourceId !== sourceEffectId
          || !matchesOwner(effect) || !(effect.durationFrames > 0)) return;
        const operation = effect.expireTicks.some(tick=>tick>state.tick) ? 'update' : 'apply';
                                                                             
                                                                                
        effect.expireTicks = [state.tick + toTicks(effect.durationFrames,ticksPerFrame)];
        scheduleRuntimeExpireTicks(effect);
        logEffectStateChange({kind:'spRegen',effectId:effect.id,sourceId:effect.sourceId,
          label:effect.label,operation,stackCount:1,appliedTick:state.tick,
          expireTick:effect.expireTicks[0],sourceActionKey:owner.key,
          reason:`${sourceEffectId}発生時`,details:{fixed:effect.fixed,percent:effect.percent}});
      });
      state.runtimeAccelerationEffects.forEach(effect => {
        if (effect.mode !== 'sourceEventTimed' || effect.triggerSourceId !== sourceEffectId) return;
        if (!matchesOwner(effect)) return;
        applyAccelerationEffect(effect, `${sourceEffectId}発生時`);
      });
      state.runtimeDamageBuffEffects.forEach(effect => {
        if (effect.mode !== 'sourceEventTimed' || effect.triggerSourceId !== sourceEffectId) return;
        if (!matchesOwner(effect)) return;
        if (effect.oncePerAction && effect.lastActionInstanceId === owner.instanceId) return;
        effect.triggerCount += 1;
        if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
                                                                            
                                                                              
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
          event?.statusApplication?.stateId,
          event?.selfStateApplication?.applicationEffectId,
          event?.selfStateApplication?.stateId
        ].map(value => String(value || '').trim()).filter(Boolean));
        const embeddedStep = step => {
          if (!directEventIds.size) return false;
          if (step?.type === 'resource' && !event?.resourceChange) return false;
          if (['status', 'selfState'].includes(step?.type)
            && !((step.type === 'selfState' ? event?.selfStateApplication : event?.statusApplication)?.durationFrames > 0)) return false;
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
      state.runtimeAttackSpeedEffects.forEach(effect => {
        if (!effect.resetActionKeys.includes(actionKey) || effect.stackCount <= 0) return;
        const previousStackCount = effect.stackCount;
        effect.stackCount = 0;
        effect.expireTicks = [];
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
          kind: definition.kind === 'damageBuff' ? 'damageBuff' : 'resourceGain',
          effectId: definition.id,
          sourceActionKey: owner?.key || '',
          sourceActionLabel: owner?.label || '',
          label: definition.label,
          attackP: definition.attackPPerStack,
          modifiers: definition.modifiers ? { ...definition.modifiers } : { atkP: definition.attackPPerStack },
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
        if (config.jadeOverflowBuff && normalizeScenarioId(config.apostleId) === 'jade'
          && resource.id === '翡翠玉' && owner.key === 'enhancedAttack'
          && before === 3 && requestedAmount === 1) {
          addRuntimeGainBuff({ ...resource, gainBuff: config.jadeOverflowBuff }, owner, 1);
        }
      } else if (change.operation === 'consume') {
        resource.stacks = Math.max(0, before - requestedAmount);
      }
      if (resource.stacks !== before) {
        if (normalizeScenarioId(config.apostleId) === 'jade' && resource.heldAddPPerStack > 0
          && resource.heldAddEffectIds.includes('Jade_aside_2_e02')) {
          logEffectStateChange({kind:'damageBuff', effectId:'Jade_aside_2_e02',
            label:'翡翠玉のスキルダメージ効果', operation:resource.stacks ? 'update' : 'remove',
            stackCount:resource.stacks, maxStacks:resource.maxStacks,
            sourceId:config.apostleId, sourceActionKey:owner?.key || '',
            details:{addP:resource.stacks*resource.heldAddPPerStack,
              applyActionKeys:resource.heldAddActionKeys}});
        }
        if (resource.heldHasteEffectId) {
                                                                              
                                                                           
          logEffectStateChange({kind:'attackSpeed', effectId:resource.heldHasteEffectId,
            label:'翡翠玉の攻撃速度効果', operation:resource.stacks ? 'update' : 'remove',
            stackCount:resource.stacks, maxStacks:resource.maxStacks,
            sourceId:config.apostleId, sourceActionKey:owner?.key || '',
            details:{hastePerStackP:resource.heldHastePPerStack,
              addedHasteP:(resource.stacks-before)*resource.heldHastePPerStack,
              totalHasteP:getRuntimeAttackSpeedP(),
              normalAttackIntervalFrames:getEffectiveNormalAttackIntervalFrames()}});
        }
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
          reason: normalizeArray(stack.releaseAfterActionKeys).length ? 'スキル終了' : '持続時間終了'
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

    const applyStatusApplication = (owner, application, options = {}) => {
      if (!application?.status || !(application.durationFrames > 0)) return;
      if (application.requiredTargetStatus && !isRuntimeStatusConditionActive(state,
        {mode:'conditionalStatus',requiredStatus:application.requiredTargetStatus})) {
        if (!options.suppressLog) logEffectStateChange({kind:'debuff',effectId:application.applicationEffectId,
          label:application.status,status:application.status,operation:'reject',sourceActionKey:owner.key,
          sourceActionLabel:owner.label,reason:`対象に${application.requiredTargetStatus}がありません`});
        return;
      }
                                                                        
                                                                                  
                                                                    
      if ((application.applicationEffectId === 'Posher_high_e01'
          || application.applicationEffectId === 'Rollett_aside_2_e03' && application.blocksWorldBoss === true)
        && application.status === '変異' && config.enemyIsWorldBoss === true) {
        if (!options.suppressLog) logEffectStateChange({
          kind: 'debuff', effectId: application.applicationEffectId,
          label: application.status, status: application.status, operation: 'reject',
          sourceActionKey: owner.key, sourceActionLabel: owner.label,
          reason: 'ワールドボスには変異を付与できません'
        });
        return;
      }
      if (application.applicationProbability != null) {
        const probability = application.applicationProbability;
        if (typeof probability !== 'number' || !Number.isFinite(probability) || probability < 0 || probability > 100) {
          throw new RangeError('状態付与率が不正です');
        }
        const roll = probability < 100 ? Math.fround(random() * 100) : 0;
        const success = roll < probability;
        if (!options.suppressLog) log('statusApplicationRoll', { actionKey: owner.key,
          status: application.status, probability, roll, success });
        if (!success) return;
      }
      const applicationSourceId = application.sourceId == null
        ? String(config.apostleId || '')
        : String(application.sourceId || '');
      const applicationSourceSelf = application.sourceSelf !== false;
                                                                            
                                                                            
      const dotAttackSnapshot = applicationSourceSelf && applicationSourceId === String(config.apostleId || '')
        ? createDotAttackSnapshot(statusDamageProfiles[application.status]?.damageResult?.runtimeBase,
            getRuntimeDamageBuffDelta(state, config)) : null;
      trackedStatuses.add(application.status);
      const groupStacks = state.statusStacks.filter(stack => stack.stackGroupId === application.stackGroupId);
      const operation = !application.stackable && groupStacks.length ? 'update' : 'apply';
      if (!application.stackable) {
        state.statusStacks
          .filter(stack => stack.stackGroupId === application.stackGroupId)
          .forEach(stack => { stack.active = false; });
        state.statusStacks = state.statusStacks.filter(stack => stack.stackGroupId !== application.stackGroupId);
      } else if (groupStacks.length >= application.maxStacks) {
        if (application.stackOverflowPolicy === 'reject') {
                                                                                
                                                                               
          if (!options.suppressLog) logEffectStateChange({
            kind:'debuff',effectId:application.applicationEffectId || application.status,
            label:application.status,status:application.status,operation:'reject',
            stackCount:groupStacks.length,maxStacks:application.maxStacks,
            sourceActionKey:owner.key,sourceActionLabel:owner.label,sourceId:applicationSourceId,
            reason:'最大スタックのため新規付与を拒否（既存の期限は維持）'
          });
          return;
        }
        const oldest = groupStacks.slice().sort((a, b) => (
          a.expireTick - b.expireTick || a.appliedTick - b.appliedTick || a.id - b.id
        ))[0];
        oldest.active = false;
        state.statusStacks = state.statusStacks.filter(stack => stack !== oldest);
        if (!options.suppressLog) logEffectStateChange({
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
        ...(application.value == null ? {} : {value:application.value}),
        sourceSelf: applicationSourceSelf,
        active: true,
        appliedTick: state.tick,
        expireTick: Number.isFinite(Number(application.durationFrames))
          ? state.tick + toTicks(application.durationFrames, ticksPerFrame)
          : Infinity,
        nextTick: application.dealsPeriodicDamage
          ? state.tick + toTicks(application.tickFrames || STATUS_TICK_FRAMES, ticksPerFrame)
          : Infinity,
        tickMultiplier: application.tickMultiplier,
        reactionOnly: application.reactionOnly === true,
                                                                                  
                                                                               
        dotAttackSnapshot
      };
      state.statusStacks.push(stack);
      scheduleRuntimePeriodicEvent(stack);
      scheduleRuntimeExpireTick(stack);
      if (!options.suppressLog) logEffectStateChange({
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
      if (!options.suppressLog) log('statusApplied', {
        actionKey: owner.key,
        actionLabel: owner.label,
        applicationEffectId: stack.applicationEffectId,
        status: stack.status,
        stackCount: getActiveStatusStacks(stack.status).length,
        maxStacks: stack.maxStacks,
        durationFrames: application.durationFrames,
        timingQuality: application.timingQuality || ''
      });
      if (!options.suppressTriggers) triggerDamageBuffEffectsForStatusApplication(owner, application);
      if (!options.suppressTriggers && triggerRuntimeEventEffectsForStateChange
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
      if (!options.suppressTriggers && application.stackable && stackCount >= application.maxStacks
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
        sourceActionInstanceId: owner.instanceId,
        sourceActionVariant: owner.variant,
        sourceRuntimeEffectId: owner.runtimeEffectId || '',
        kind: application.kind || 'selfState',
        endEvent: application.endEvent || null,
        appliedTick: state.tick,
        expireTick: state.tick + toTicks(application.durationFrames, ticksPerFrame)
      };
      state.selfStateStacks.push(stack);
                                                                          
                                                                    
      if (normalizeScenarioId(config.apostleId) === 'chloe'
        && application.stateId === 'Chloe_low_e01' && owner.runtimeEffectId
        && state.runtimeAttackSpeedEffects.some(effect =>
          effect.id === 'Chloe_aside_2_e07:owner:Chloe'
          && effect.mode === 'sourceEventTimed' && effect.hasteP === 30
          && effect.durationFrames === 420)) {
        triggerRuntimeEffectsForSourceEvent(owner, {effectId:application.stateId});
      }
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
                                           
                                            
                                          
      const emittedEffectIds = new Set();
      let selectedChoice = null;
      if (definition.weightedChoices) {
        const {choices,total} = definition.weightedChoices;
        const draw = Math.floor(random() * total);
        let cumulative = 0;
        selectedChoice = choices.find(choice => {
          cumulative += choice.weight;
          return cumulative > draw;
        })?.id;
        if (!selectedChoice) throw new RangeError('通知の抽選結果が範囲外です');
        log('runtimeEffectChoice', {actionKey:owner.key,actionLabel:owner.label,
          runtimeEffectId:definition.id,choiceId:selectedChoice,draw,total,reason});
      }
      const previousRuntimeChainPath = activeRuntimeChainPath;
      activeRuntimeChainPath = chainPath;
      try {
        definition.steps.forEach(step => {
          if (selectedChoice && step.choiceId !== selectedChoice) return;
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
            && normalizeScenarioId(effect.conditionValue) !== normalizeScenarioId(transition.sourceId)) return false;
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
      ['shieldEnd', 'シールド終了時'],
      ['シールド終了時', 'シールド終了時'],
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
      const reactionOnly = event?.statusReactionOnly === true;
      const periodicDamage = reactionOnly ? false : event?.statusDealsPeriodicDamage == null
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
        reactionOnly,
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
        if (triggerType === 'シールド破壊時' || triggerType === 'シールド終了時') {
          const source = String(event.triggerSourceId || event.sourceId || '').trim();
          const matching = state.selfStateStacks.filter(stack => stack.kind === 'shield'
            && (!source || source === stack.stateId || normalizeScenarioId(source) === normalizeScenarioId(config.apostleId)));
                                                                                 
          if (source || matching.length === 1) {
            matching.forEach(stack => {
              state.selfStateStacks = state.selfStateStacks.filter(item => item.id !== stack.id);
              finishSelfState(stack, 'remove', triggerType);
            });
          }
        }
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
          bindingKey: event.bindingKey,
          sourceId: event.sourceId,
          triggerType,
          occurrence: event.occurrence,
          intervalFrames: event.intervalFrames,
          value: event.value,
          status: event.status,
          reason: event.reason
        });
        const statusApplication = createExternalStatusApplication(event);
        if (statusApplication) {
          const requestedStacks = statusApplication.stackable
            ? Math.max(1, Math.min(statusApplication.maxStacks, Math.floor(toFiniteNumber(event.statusStackCount, 1) || 1)))
            : 1;
          for (let stackIndex = 0; stackIndex < requestedStacks; stackIndex += 1) {
            applyStatusApplication(owner, statusApplication, {
              suppressLog: requestedStacks > 1,
              suppressTriggers: statusApplication.reactionOnly
            });
          }
          if (requestedStacks > 1) {
            const activeStackCount = getActiveStatusStacks(statusApplication.status).length;
            logEffectStateChange({
              kind: 'debuff',
              effectId: statusApplication.applicationEffectId || statusApplication.status,
              label: statusApplication.status,
              status: statusApplication.status,
              operation: 'apply',
              stackCount: activeStackCount,
              maxStacks: statusApplication.maxStacks,
              appliedTick: state.tick,
              expireTick: state.tick + toTicks(statusApplication.durationFrames, ticksPerFrame),
              sourceActionKey: owner.key,
              sourceActionLabel: owner.label,
              sourceId: statusApplication.sourceId,
              reason: statusApplication.timingQuality || '',
              details: {
                appliedStackCount: requestedStacks,
                reactionOnly: statusApplication.reactionOnly === true,
                durationFrames: statusApplication.durationFrames
              }
            });
            log('statusApplied', {
              actionKey: owner.key,
              actionLabel: owner.label,
              status: statusApplication.status,
              stackCount: activeStackCount,
              maxStacks: statusApplication.maxStacks,
              appliedStackCount: requestedStacks,
              durationFrames: statusApplication.durationFrames,
              timingQuality: statusApplication.timingQuality || ''
            });
          }
        }
        const matchesExternalRuntimeEffect = effect => (
          effect.externalTriggerType === triggerType
          && (effect.effectId !== 'ED_aside_2_e05' || !effect.externalBindingKey
            || (event.sourceId === effect.externalSourceId
              && event.bindingKey === effect.externalBindingKey && !event.status))
          && (!effect.externalBindingKey || (!event.status
            && (effect.externalSourceId === 'Pira'
              ? event.sourceId === 'Pira' && effect.externalBindingKey === event.bindingKey
              : (!event.bindingKey || effect.externalBindingKey === event.bindingKey))))
                                               
                                             
                                        
          && (!effect.externalSourceId || !event.sourceId || effect.externalSourceId === event.sourceId)
        );
        state.runtimeAttackSpeedEffects.forEach(effect => {
          if (effect.mode !== 'externalTimed' || !matchesExternalRuntimeEffect(effect)) return;
          applyAttackSpeedEffect(effect, `${triggerType} / ${event.reason || event.id}`);
        });
        state.runtimeSpRegenEffects.forEach(effect => {
          if (effect.mode !== 'externalTimed' || !matchesExternalRuntimeEffect(effect) || !(effect.durationFrames > 0)) return;
          effect.expireTicks = effect.expireTicks.filter(tick => tick > state.tick);
          effect.expireTicks.push(state.tick + toTicks(effect.durationFrames, ticksPerFrame));
          scheduleRuntimeExpireTicks(effect);
          logEffectStateChange({ kind: 'spRegen', effectId: effect.id, sourceId: effect.sourceId,
            label: effect.label, operation: 'apply', stackCount: effect.expireTicks.length,
            appliedTick: state.tick, expireTick: effect.expireTicks[effect.expireTicks.length - 1],
            reason: event.reason || event.id });
        });
        state.runtimeCooldownSettingEffects.forEach(effect => {
          if (!matchesExternalRuntimeEffect(effect)) return;
          effect.expireTicks = effect.expireTicks.filter(tick => tick > state.tick);
          effect.expireTicks.push(state.tick + toTicks(effect.durationFrames, ticksPerFrame));
          scheduleRuntimeExpireTicks(effect);
          logEffectStateChange({ kind: 'cooldownSetting', effectId: effect.id, sourceId: effect.sourceId,
            label: effect.label, operation: 'apply', stackCount: effect.expireTicks.length,
            appliedTick: state.tick, expireTick: effect.expireTicks[effect.expireTicks.length - 1],
            reason: '次回CT設定時だけ反映（現在の残りCTは変更しません）' });
        });
        state.runtimeAccelerationEffects.forEach(effect => {
          if (effect.mode !== 'externalTimed' || !matchesExternalRuntimeEffect(effect)) return;
          applyAccelerationEffect(effect, `${triggerType} / ${event.reason || event.id}`);
        });
        state.runtimeDamageBuffEffects.forEach(effect => {
          if (effect.mode !== 'externalTimed' || !matchesExternalRuntimeEffect(effect)) return;
          effect.triggerCount += 1;
          if (effect.triggerEveryCount > 0 && effect.triggerCount % effect.triggerEveryCount !== 0) return;
          for (let i = 0; i < (effect.stacksPerApplication || 1); i += 1) {
            applyRuntimeDamageBuff(effect, owner, `${triggerType} / ${event.reason || event.id}`);
          }
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

                                                                             
                                                                           
                                                                             
    const getInactiveProgressReadyTick = (targetFrames, progressFrames, lastTick) => {
      const progress = progressFrames + integrateActionSpeedFrames(lastTick, state.tick);
      return state.tick + Math.max(0, Math.ceil((targetFrames - progress - 1e-9) * ticksPerFrame));
    };
    const getNextNormalAttackReadyTick = () => usesContinuousAcceleration
      && state.normalAttackProgressFrames != null && !hasActiveAcceleration()
      ? getInactiveProgressReadyTick(state.normalAttackCycleFrames,
        state.normalAttackProgressFrames, state.normalAttackProgressLastTick)
      : state.nextNormalAttackTick;

    const getNextActionInternalEventTick = () => {
      let nextTick = Infinity;
      const current = state.currentAction;
      if (current) {
        const progressClock = current.dynamicTiming && !hasActiveAcceleration();
        nextTick = Math.min(nextTick, progressClock
          ? getInactiveProgressReadyTick(current.motionFrames, current.progressFrames, current.progressLastTick)
          : current.endTick);
        current.events.forEach(event => {
          if (event.emitted) return;
          nextTick = Math.min(nextTick, progressClock
            ? getInactiveProgressReadyTick(event.relativeFrames, current.progressFrames, current.progressLastTick)
            : current.startTick + event.relativeTick);
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

    const finishSelfState = (stack, operation, reason) => {
        if (stack.kind === 'shield') {
          state.runtimeDamageBuffEffects.forEach(effect => {
            if (effect.mode !== 'selfShieldEndedTimed' || effect.selfShieldSourceId !== stack.stateId) return;
            applyRuntimeDamageBuff(effect, {key:stack.sourceActionKey,label:stack.sourceActionLabel,
              instanceId:stack.sourceActionInstanceId}, reason);
          });
        }
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
          operation,
          stackId: stack.id,
          stackCount: 0,
          maxStacks: 1,
          appliedTick: stack.appliedTick,
          expireTick: stack.expireTick,
          sourceActionKey: stack.sourceActionKey,
          sourceActionLabel: stack.sourceActionLabel,
          sourceId: String(config.apostleId || ''),
          reason,
          details: { reference: stack.reference || '' }
        });
        if (triggerRuntimeEventEffectsForStateChange) {
          triggerRuntimeEventEffectsForStateChange({
            key: stack.sourceActionKey,
            label: stack.sourceActionLabel,
            variant: stack.sourceActionVariant || '',
            instanceId: stack.sourceActionInstanceId || `self-state:${stack.id}`,
            runtimeEffectId: stack.sourceRuntimeEffectId || ''
          }, {
            kind: 'selfState',
            operation,
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
        if (stack.endEvent) {
          const owner = { key: stack.sourceActionKey, label: stack.sourceActionLabel,
            variant: stack.sourceActionVariant || '', events: [stack.endEvent],
            instanceId: stack.sourceActionInstanceId || `self-state:${stack.id}`,
            runtimeEffectId: stack.sourceRuntimeEffectId || '' };
          const profile = getVariantDamageProfile(damageProfiles, owner.key, owner.variant);
          if (!findEventDamageEffectAcrossVariants(damageProfiles, owner, stack.endEvent, profile)) {
            throw new Error('シールド終了時の攻撃ダメージ入力が不足しています');
          }
          emitEvent(owner, stack.endEvent);
        }
    };

    const expireSelfStates = () => {
      const expired = state.selfStateStacks.filter(stack => stack.expireTick <= state.tick);
      if (!expired.length) return;
      state.selfStateStacks = state.selfStateStacks.filter(stack => stack.expireTick > state.tick);
      expired.forEach(stack => finishSelfState(stack, 'expire', '持続時間終了'));
    };

    const emitEvent = (owner, event) => {
      if (event.motionLinkedGeneratedEvents) {
        const sequence = event.motionLinkedGeneratedEvents;
        const generatedOwner = {...owner, events:sequence};
        sequence.forEach(item => scheduleGeneratedEvent({
          absoluteTick:state.tick + toTicks(item.frame-item.generatedSpawnFrame, ticksPerFrame),
          owner:generatedOwner, event:item, emitted:false
        }));
        return;
      }
      if (event.ownerArea) {
        const definition = event.ownerArea;
        if (!definition.pulseEvent || definition.pulseEvent.ownerArea) {
          throw new RangeError('領域の周期イベント入力が不足しています');
        }
        const pulseEvent = { ...definition.pulseEvent, onlySelectedDamageEffect: true };
        const areaInstanceId = ++state.ownerAreaSerial;
        const delay = definition.startDelaySeconds ?? 0;
        if (!Number.isFinite(delay) || delay < 0) throw new RangeError('領域の開始遅延が不正です');
        state.ownerAreas.push({ areaInstanceId, started:false,
          owner: { ...owner, events: [pulseEvent] }, pulseEvent,
          startTick: state.tick + toTicks(delay * framesPerSecond, ticksPerFrame),
          clock: createOwnerAreaClock(definition.durationSeconds, definition.intervalSeconds ?? 1)
        });
        processOwnerAreas();
        return;
      }
      if (config.jadeLowGemSelection && normalizeScenarioId(config.apostleId) === 'jade'
        && owner.key === 'lowSkill' && event.type === 'damage' && event.effectId === 'Jade_low_e01') {
        const resource = state.runtimeResources['翡翠玉'];
        const stacks = resource?.stacks;
        if (!Number.isInteger(stacks) || stacks < 0 || stacks > 3 || resource.maxStacks !== 3) {
          throw new RangeError('ジェイドの命中時の翡翠玉数が不正です');
        }
        const percent = stacks === 3 ? 150 : stacks > 0 ? 120 : 100;
                                                                          
                                                                             
        event = { ...event, nativeCoefficientScale: 1, nativeCoefficientInteger: true,
          nativeEffectDamage: Math.fround(Math.fround(percent) * Math.fround(.01)) };
        log('resourceDamageSelection', {actionKey: owner.key, effectId: event.effectId,
          resourceId: '翡翠玉', stacks, percent, effectDamage: event.nativeEffectDamage});
                                                                              
                                                                              
        if (stacks === 3) applyResourceChange(owner, {resourceId: '翡翠玉', operation: 'consume',
          amount: 3, changeEventBasis: '低学年命中時'});
      }
      if (owner.key === 'lowSkill' && event.effectId === 'Epica_low_e04'
        && config.epicaLowReplacementDurationFrames > 0) {
        state.epicaLowEnhancedUntilTick = state.tick + config.epicaLowReplacementDurationFrames * ticksPerFrame;
        scheduleRuntimeStateTimer('epicaLowEnhancedUntilTick');
        log('effectStateChanged', { kind: 'attackReplacement', operation: 'apply',
          effectId: event.effectId, label: '低学年中の基本攻撃→強化攻撃',
          expireTick: state.epicaLowEnhancedUntilTick, sourceActionKey: owner.key });
      }
                                                                                  
                                                                               
      if (event.resourceChange) applyResourceChange(owner, event.resourceChange);
      if (event.statusApplicationPhase != null && !['beforeDamage', 'afterDamage'].includes(event.statusApplicationPhase)) {
        throw new RangeError('状態付与と命中の順序指定が不正です');
      }
      if (event.statusApplicationPhase === 'beforeDamage') {
        if (event.type !== 'damage' || !event.statusApplication) {
          throw new RangeError('命中前の状態付与には命中と状態入力が必要です');
        }
        applyStatusApplication(owner, { ...event.statusApplication,
          timingQuality: event.statusApplication.timingQuality || event.timingQuality || '' });
      }
      if (event.nativeStatusCoefficientSelection) {
        if (event.type !== 'damage') throw new RangeError('状態数係数補正には命中イベントが必要です');
        const selection = resolveNativeStatusCoefficientSelection(state, event.nativeStatusCoefficientSelection);
        event = { ...event, nativeCoefficientMultiplier: selection.multiplier };
        log('statusCoefficientSelection', { actionKey: owner.key, effectId: event.effectId,
          kindCount: selection.kindCount, multiplier: selection.multiplier });
      }
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
        generatedAttackSpeedBase: event.generatedAttackSpeedBase ?? null,
        generatedIndependentStatsUnresolved: event.generatedIndependentStatsUnresolved === true,
        generatedEventType: event.generatedEventType || '',
        timingQuality: event.timingQuality,
        areaPulseKind: event.areaPulseKind || '',
        areaInstanceId: event.areaInstanceId || null,
        note: event.note || ''
      });
      if (event.type === 'damage') {
        triggerDamageBuffEffectsForHit(owner, event.hitCount || 1);
        triggerSpRecoveryEffectsForHit(owner, false, event.hitCount || 1, event);
        triggerCooldownEffectsForHit(owner, event.hitCount || 1);
      }
      else triggerSpRecoveryEffectsForHit(owner, true, 1, event);
      if (event.statusApplication && event.statusApplicationPhase !== 'beforeDamage') applyStatusApplication(owner, { ...event.statusApplication,
        timingQuality: event.statusApplication.timingQuality || event.timingQuality || '' });
      if (event.selfStateApplication) applySelfState(owner, event.selfStateApplication);
                                                                             
                                                                               
                                                                             
      triggerRuntimeEffectsForSourceEvent(owner, event);
      if (normalizeScenarioId(config.apostleId) === 'sherum'
        && owner.key === 'highSkill' && event.type === 'damage'
        && event.effectId === 'Sherum_high_e01' && event.areaPulseKind === 'first'
        && normalizeArray(config.runtimeEffects?.damageBuffEffects).some(effect =>
          effect.triggerSourceId === 'Sherum_aside_2_e03')) {
                                                                           
                                                                              
        emitEvent(owner, {type:'effect',effectId:'Sherum_aside_2_e03',hitCount:0,
          timingQuality:'provisional',label:'領域デバフ（暫定）'});
      }
      const reservation = config.runtimeEffects?.yomiAsideReservations;
      if (reservation && owner.key === 'enhancedAttack'
        && event.type === 'damage' && event.effectId === reservation.sourceEffectId) {
        const extra = {type:'damage', effectId:reservation.effectId, hitCount:1,
          onlySelectedDamageEffect:true, nativeCoefficientScale:1, nativeEffectDamage:1,
          timingQuality:'provisional', label:'追加攻撃'};
                                                                           
                                                                          
                                                                                
        if (!getEventRuntimeBase(owner,extra,damageProfiles)) {
          throw new RangeError('ヨミの追加攻撃の命中計算入力が不足しています');
        }
        reservation.delaySeconds.forEach((delaySeconds,index)=> {
          state.pendingYomiAsideAttacks.push({delaySeconds,index,
            owner:{...owner,events:[extra]},event:{...extra},
            elapsed:Math.fround(Math.fround(1/60)*Math.fround(getOwnerAreaSpeed())),
            nextTick:state.tick+toTicks(framesPerSecond/60,ticksPerFrame)});
        });
        log('additionalAttackScheduled',{actionKey:owner.key,effectId:reservation.effectId,
          count:3,referenceUpdatesPerGameSecond:60});
      }
      triggerRuntimeEventEffectsForEvent(owner, event);
      if (event.enhancedRepeatNotification) continueEnhancedRepeat(owner, 'notification');
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
        const base = profile.damageResult?.runtimeBase || null;
        let damageEvaluation;
        if (base?.dotInput && !resolveStatusDamage) {
          const delta = getRuntimeDamageBuffDelta(state, config);
          const heldAdd = Object.values(state.runtimeResources || {}).some(resource => toFiniteNumber(resource.stacks)
            && toFiniteNumber(resource.heldAddPPerStack) && normalizeArray(resource.heldAddEffectIds)
              .some(id => normalizeArray(state.runtimeDamageEffectIds).includes(String(id || ''))));
          const statusTakenDmgP = getStatusReactionTakenDmgP(state, config, isResolvedDamageRateStatusReaction);
          const unresolved = heldAdd || getStatusReactionTakenDmgP(state, config, reaction => !isResolvedDamageRateStatusReaction(reaction))
            || toFiniteNumber(config.runtimeEffects?.statusDamageWeaknessP);
          const evaluated = unresolved ? { supported: false, reason: '状態・所持補正の周期ダメージ供給位置が未確認です' }
            : evaluateDotAtTick(base, stack.dotAttackSnapshot,
              { ...delta, addP: toFiniteNumber(delta.addP) + statusTakenDmgP });
          if (!evaluated.supported) throw new RangeError(evaluated.reason);
          damageEvaluation = { ...evaluated, baseExpectedDamage, expectedDamage: evaluated.expected,
            ratio: baseExpectedDamage > 0 ? evaluated.expected / baseExpectedDamage : 1,
            modifierDelta: delta, statusTakenDmgP, runtimeBaseAvailable: true, dotAttackSnapshot: stack.dotAttackSnapshot };
          const calculation = state.damageCalculation || (state.damageCalculation = { roundedEvents: 0, legacyEvents: 0, reasons: new Set() });
          calculation.roundedDotEvents = (calculation.roundedDotEvents || 0) + 1;
        } else damageEvaluation = evaluateRuntimeDamage(
          baseExpectedDamage,
          { key: stack.sourceActionKey, variant: '' },
          null,
          damageProfiles,
          state,
          config,
          base,
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

    const getOwnerAreaSpeed = () => getRenewaSpeedAtStart()
      + state.runtimeAccelerationEffects.reduce((total, effect) => {
        if (isRenewaAcceleration(effect) || !effect.active || effect.expireTick <= state.tick) return total;
        const elapsed = Math.max(0, (state.tick - effect.startTick) / ticksPerFrame);
        const amount = Math.max(0, toFiniteNumber(effect.maxAccelerationP, effect.accelerationP)) / 100;
        if (effect.curve !== 'linearHold' || !(effect.rampFrames > 0)) return total + amount;
        if (elapsed >= effect.rampFrames + Math.max(0, effect.holdFrames)) return total;
        return total + amount * Math.min(1, elapsed / effect.rampFrames);
      }, 0);
    const getNextOwnerAreaTick = () => state.ownerAreas.reduce((next, area) => Math.min(next,
      area.startTick + toTicks(area.clock.nextUpdate / 60 * framesPerSecond, ticksPerFrame)), Infinity);
    const processOwnerAreas = () => {
      state.ownerAreas.forEach(area => {
        if (state.tick < area.startTick) return;
        if (!area.started) {
          area.started = true;
          log('ownerAreaStart', {areaInstanceId:area.areaInstanceId,actionKey:area.owner.key,
            effectId:area.pulseEvent.effectId,durationSeconds:area.clock.duration,
            referenceUpdatesPerGameSecond:60});
        }
        const elapsed = (state.tick - area.startTick) / ticksPerFrame / framesPerSecond;
                                                                                 
                                                                               
        const pulses = advanceOwnerAreaClock(area.clock, Math.max(0, elapsed), getOwnerAreaSpeed);
        pulses.forEach(pulse => emitEvent(area.owner, { ...area.pulseEvent,
          areaPulseKind: pulse.kind, areaInstanceId: area.areaInstanceId }));
        if (area.clock.ended) log('ownerAreaEnd', {areaInstanceId: area.areaInstanceId,
          actionKey: area.owner.key, effectId: area.pulseEvent.effectId});
      });
      state.ownerAreas = state.ownerAreas.filter(area => !area.clock.ended);
    };

    const getNextOwnerReserveTick = () => state.ownerReserves.reduce((next, reserve) =>
      Math.min(next, reserve.nextTick), Infinity);
    const getNextUnitSpRecoveryTick = () => state.pendingUnitSpRecoveries.reduce((next, pending) =>
      Math.min(next,pending.nextTick),Infinity);
    const getNextYomiAsideAttackTick = () => state.pendingYomiAsideAttacks.reduce((next,pending)=>
      Math.min(next,pending.nextTick),Infinity);
    const processYomiAsideAttacks = () => {
      state.pendingYomiAsideAttacks.forEach(pending=> {
        if (pending.nextTick > state.tick) return;
        if (pending.elapsed >= pending.delaySeconds) {
          pending.finished=true;
          emitEvent(pending.owner,pending.event);
        } else {
          const speed=getOwnerAreaSpeed();
          if (!Number.isFinite(speed) || speed < 0 || !Number.isFinite(Math.fround(speed))) {
            throw new RangeError('追加攻撃待機の加速値が不正です');
          }
          pending.elapsed=Math.fround(pending.elapsed+Math.fround(Math.fround(1/60)*Math.fround(speed)));
          pending.nextTick=state.tick+toTicks(framesPerSecond/60,ticksPerFrame);
        }
      });
      state.pendingYomiAsideAttacks=state.pendingYomiAsideAttacks.filter(pending=>!pending.finished);
    };
    const processUnitSpRecoveries = () => {
      state.pendingUnitSpRecoveries.forEach(pending => {
        if (pending.nextTick > state.tick) return;
        if (pending.elapsed >= pending.effect.unitDelaySeconds) {
          applySpRecoveryEffect(pending.effect,pending.reason,pending.owner);
          pending.finished=true;
        } else {
          const speed=getOwnerAreaSpeed();
          if (!Number.isFinite(speed) || speed < 0 || !Number.isFinite(Math.fround(speed))) {
            throw new RangeError('SP回復待機の加速値が不正です');
          }
          pending.elapsed=Math.fround(pending.elapsed + Math.fround(Math.fround(1 / 60) * Math.fround(speed)));
          pending.nextTick=state.tick + toTicks(framesPerSecond / 60,ticksPerFrame);
        }
      });
      state.pendingUnitSpRecoveries=state.pendingUnitSpRecoveries.filter(pending=>!pending.finished);
    };
    const releaseOwnerReserveChild = reserve => {
      const spawn = reserve.spawns[reserve.index++];
      reserve.owner.events.filter(event => event.generatedInstanceKey === spawn.generatedInstanceKey)
        .forEach(event => scheduleGeneratedEvent({
          absoluteTick: state.tick + toTicks(event.frame - spawn.frame, ticksPerFrame),
          owner: reserve.owner, event, emitted: false
        }));
      log('ownerReserveGenerated', {actionKey: reserve.owner.key,
        instanceId: reserve.owner.instanceId, generatedInstanceOrder: spawn.generatedInstanceOrder,
        generatedInstanceKey: spawn.generatedInstanceKey, referenceUpdatesPerGameSecond: 60});
      reserve.wait = 0;
    };
    const processOwnerReserves = () => {
      state.ownerReserves.forEach(reserve => {
        if (state.tick < reserve.nextTick) return;
        const speed = getOwnerAreaSpeed();                                                          
        if (!Number.isFinite(speed) || speed < 0 || !Number.isFinite(Math.fround(speed))) {
          throw new RangeError('生成待ちの加速値が不正です');
        }
        reserve.wait = Math.fround(reserve.wait
          + Math.fround(Math.fround(1 / 60) * Math.fround(speed)));
        if (reserve.wait >= Math.fround(reserve.intervalSeconds)) releaseOwnerReserveChild(reserve);
        reserve.update++;
        reserve.nextTick = reserve.startTick + toTicks(reserve.update / 60 * framesPerSecond, ticksPerFrame);
      });
      state.ownerReserves = state.ownerReserves.filter(reserve => reserve.index < reserve.spawns.length);
    };

    const emitDueActionEvents = () => {
      const current = state.currentAction;
      if (!current) return;
      const sharedClockDue = [];
      current.events.forEach(event => {
        if (event.emitted) return;
        const due = current.dynamicTiming
          ? current.progressFrames + 1e-9 >= event.relativeFrames
          : current.startTick + event.relativeTick === state.tick;
        if (!due) return;
        event.emitted = true;
        if (current.hasExplicitEventClock) sharedClockDue.push({owner:current,event,emitted:false});
        else emitEvent(current, event);
      });
      if (sharedClockDue.length) emitDueGeneratedEvents(sharedClockDue);
    };

    const summonContext = unit => ({ frame: state.tick / ticksPerFrame, definition: unit.definition,
      instanceOrder: unit.order, sourceActionKey: unit.owner.key, state: unit.localState,
      actionId: unit.action?.id || '', unitId: unit.id, globalActionSpeed: getRenewaSpeedAtStart(),
      ...(unit.adapter.ownerDeltaAction === 'basicAttack'
        ? { ownerModifiers: getRuntimeDamageBuffDelta(state, config, 'basicAttack') } : {}) });
    const getSummonTiming = unit => {
      const supplied = unit.adapter.getSpeed(summonContext(unit));
      if (!supplied || ![supplied.attackSpeedP, supplied.selfSpeed, supplied.otherSpeed].every(value => (
        typeof value === 'number' && Number.isFinite(value)
      )) || supplied.attackSpeedP <= -100 || supplied.selfSpeed <= 0
        || supplied.otherSpeed <= 0) throw new RangeError(`${unit.definition.id}: 召喚ユニット速度が不正です`);
      if (isInstantSuicideAction(unit.definition, unit.action)) {
        return { motionScale: 1 / supplied.selfSpeed, motionFrames: 0, waitFrames: 0 };
      }
      return calculateActionSpeedTiming(DEFAULT_FRAMES_PER_SECOND * 300 / unit.definition.attackSpeedBase
        / (1 + supplied.attackSpeedP / 100), unit.action.motionFrames, supplied.selfSpeed, supplied.otherSpeed);
    };
    const emitSummonHit = (unit, event) => {
                                                                                  
                                                                                  
      const hitInput = unit.adapter.getHitInput({ ...summonContext(unit), event });
      const result = evaluateSingleHitDamage(hitInput || {});
      if (!result.supported) throw new RangeError(`${unit.definition.id}: ${result.reason}`);
      const expectedDamage = result.expected;
      hits[unit.owner.key] += 1;
      expectedDamageByAction[unit.owner.key] += expectedDamage;
      const damageInstanceId = `${unit.id}:${unit.actionSerial}:${event.timeOrigin === '終了時' || event.generatedEventType === '自爆' ? 'end' : 'attack'}`;
      if (!damagedActionInstances.has(damageInstanceId)) {
        damagedActionInstances.add(damageInstanceId);
        damagingActions[unit.owner.key] += 1;
      }
      if (recordDamageSeries) damageSeries.push({ frame: state.tick / ticksPerFrame,
        expectedDamage, type: 'hit', actionKey: unit.owner.key, generatedObjectId: unit.definition.id });
      const calculation = state.damageCalculation || (state.damageCalculation = { roundedEvents: 0, legacyEvents: 0, reasons: new Set() });
      calculation.roundedEvents += 1;
      log('hit', { actionKey: unit.owner.key, effectId: event.effectId || '', expectedDamage,
        generatedObjectId: unit.definition.id, generatedInstanceKey: unit.id, generatedInstanceOrder: unit.order,
        summonActionId: unit.action.id, summonActionSerial: unit.actionSerial, hitCount: 1,
        generatedEventType: event.eventType || event.generatedEventType || '攻撃',
        damageEvaluation: { ...result, expectedDamage }, timingQuality: 'provisional' });
      if (typeof unit.adapter.onHit === 'function') unit.adapter.onHit({ ...summonContext(unit), event, result });
    };
    const spawnSummon = pending => {
      const definition = pending.event.summonDefinition;
      const id = `${pending.owner.instanceId}:${pending.event.generatedInstanceKey}`;
      if (definition.respawnPolicy === '上書き') {
        summonUnits.forEach((unit, key) => {
          if (unit.definition.id === definition.id && unit.owner.instanceId !== pending.owner.instanceId) summonUnits.delete(key);
        });
      }
      const execution = options.summonCalculationInput?.definitions?.[definition.id]?.executionRules;
      const maxInstances = execution?.maxInstances ?? definition.maxInstances;
      if (maxInstances > 0 && [...summonUnits.values()].filter(unit => unit.definition.id === definition.id).length >= maxInstances) {
        if (execution?.overflowPolicy === 'skip') {
          log('summonSpawnSkipped', { generatedObjectId: definition.id, reason: '生存個体上限', maxInstances }); return;
        }
        throw new RangeError(`${definition.id}: 最大存在数超過の終了規則が未対応です`);
      }
      const order = pending.event.generatedInstanceOrder;
      const starts = normalizeArray(definition.timingEvents).filter(row => row.recordPurpose !== '観測'
        && row.eventType === '行動開始' && (row.instanceOrder == null || row.instanceOrder === order));
      if (starts.length !== 1) throw new RangeError(`${definition.id}: 個体${order}の行動開始を一意に解決できません`);
      const action = definition.summonActions.find(item => item.id === starts[0].actionId);
      if (!action) throw new RangeError(`${definition.id}: 行動IDを解決できません`);
      const adapter = resolveSummonUnit({ definition, instanceOrder: order, frame: state.tick / ticksPerFrame,
        sourceActionKey: pending.owner.key, ownerModifiers: getRuntimeDamageBuffDelta(state, config, 'basicAttack'),
        ownerAttackSpeedP: getRuntimeAttackSpeedP() });
      if (!adapter || typeof adapter.getSpeed !== 'function' || typeof adapter.getHitInput !== 'function') {
        throw new RangeError(`${definition.id}: 召喚ユニット能力・速度・命中入力が未接続です`);
      }
      const spawnTiming = typeof adapter.getSpawnTiming === 'function'
        ? adapter.getSpawnTiming({ frame: state.tick / ticksPerFrame, globalActionSpeed: getRenewaSpeedAtStart() }) : null;
      if (spawnTiming && (!['initialDelayFrames', 'lifetimeFrames'].every(key => (
        typeof spawnTiming[key] === 'number' && Number.isFinite(spawnTiming[key])
      )) || spawnTiming.initialDelayFrames < 0 || spawnTiming.lifetimeFrames <= spawnTiming.initialDelayFrames)) {
        throw new RangeError(`${definition.id}: 生成時計の待ち・終了時刻が不正です`);
      }
      const endFrame = spawnTiming ? state.tick / ticksPerFrame + spawnTiming.lifetimeFrames
        : getGeneratedTimedEndFrame(definition, state.tick / ticksPerFrame);
      const actionSequence = getRistyBearActionSequence(definition);
      if (actionSequence && action.id !== actionSequence[0].id) {
        throw new RangeError(`${definition.id}: 最初の行動が順序定義と一致しません`);
      }
      if (endFrame == null && !hasActionLocalSuicideEnd(definition, action)
        && !actionSequence) {
        throw new RangeError(`${definition.id}: 時間終了条件または行動内自爆による終了条件が必要です`);
      }
      const unit = { id, definition, order, action, actionSequence, sequenceIndex: 0, adapter, owner: pending.owner,
        actionEvents: normalizeArray(definition.timingEvents).map((event, index) => ({ event, index }))
          .filter(({ event }) => event.recordPurpose !== '観測'
            && event.timeOrigin === '召喚ユニット行動開始' && event.actionId === action.id),
        localState: {}, actionSerial: 0, progressFrames: null, lastTick: state.tick,
        nextStartTick: state.tick + toTicks(spawnTiming?.initialDelayFrames ?? execution?.initialDelayFrames ?? starts[0].frame, ticksPerFrame),
        endTick: endFrame == null ? Infinity : toTicks(endFrame, ticksPerFrame), emitted: new Set() };
      summonUnits.set(id, unit);
      log('summonSpawn', { unitId: id, generatedObjectId: definition.id, generatedInstanceOrder: order,
        actionKey: pending.owner.key, endFrame,
        initialDelayFrames: spawnTiming?.initialDelayFrames ?? execution?.initialDelayFrames ?? starts[0].frame });
    };
    const processSummonUnits = () => {
      summonUnits.forEach((unit, id) => {
        const startUnitAction = () => {
          const timing = getSummonTiming(unit);
          unit.progressFrames = 0; unit.lastTick = state.tick; unit.actionSerial += 1;
          unit.motionScale = timing.motionScale; unit.waitFrames = timing.waitFrames; unit.emitted.clear();
          log('summonActionStart', { unitId: id, summonActionId: unit.action.id,
            generatedObjectId: unit.definition.id, sourceActionKey: unit.owner.key, waitFrames: unit.waitFrames });
        };
        const emitUnitActionEvents = () => {
          for (const { event, index } of unit.actionEvents) {
            if (unit.emitted.has(index)
              || unit.progressFrames + 1e-9 < event.frame) continue;
            if (!/ダメージ/.test(event.effectKind || '')) throw new RangeError(`${unit.definition.id}: 召喚ユニット行動の非ダメージ効果は未対応です`);
            unit.emitted.add(index); emitSummonHit(unit, event);
                                                                             
                                                                               
                                                                                
            if (event.eventType === '自爆') {
              summonUnits.delete(id);
              log('summonEnd', { unitId: id, generatedObjectId: unit.definition.id, reason: '行動内自爆' });
              return;
            }
          }
        };
                                                                                      
        if (state.tick >= unit.endTick) {
          const rule = options.summonCalculationInput?.definitions?.[unit.definition.id]?.executionRules;
          if (rule?.deathOwnerSpRequest && (options.summonCalculationInput.ownerAliveIntervals || []).some(row => (
            row.startFrame <= state.tick / ticksPerFrame && (row.endFrame === null || state.tick / ticksPerFrame < row.endFrame)))) {
            applySpRecoveryEffect({ id: `${id}:death-sp`, sourceId: id, label: '分身終了時SP回復',
              fixed: rule.deathOwnerSpRequest * rule.ownerSpRecoveryMultiplier, percent: 0 }, '時間寿命終了', unit.owner);
          }
          summonUnits.delete(id); log('summonEnd', { unitId: id, generatedObjectId: unit.definition.id }); return;
        }
        if (unit.progressFrames != null) {
          unit.progressFrames += (state.tick - unit.lastTick) / ticksPerFrame / unit.motionScale;
          unit.lastTick = state.tick;
                                                                                   
                                                                    
          unit.motionScale = getSummonTiming(unit).motionScale;
        }
        if (unit.progressFrames == null && state.tick >= unit.nextStartTick) {
          startUnitAction();
        }
        if (unit.progressFrames == null) return;
        emitUnitActionEvents();
        if (!summonUnits.has(id)) return;
        if (unit.progressFrames + 1e-9 >= unit.action.motionFrames) {
          unit.progressFrames = null;
          unit.nextStartTick = state.tick + toTicks(unit.waitFrames, ticksPerFrame);
          log('summonActionEnd', { unitId: id, summonActionId: unit.action.id });
          if (unit.actionSequence) {
            unit.sequenceIndex += 1;
            const next = unit.actionSequence[unit.sequenceIndex];
            if (!next) throw new RangeError(`${unit.definition.id}: 最終攻撃の終了通知が実行されていません`);
            unit.action = next;
            unit.actionEvents = normalizeArray(unit.definition.timingEvents).map((event, index) => ({ event, index }))
              .filter(({ event }) => event.recordPurpose !== '観測'
                && event.timeOrigin === '召喚ユニット行動開始' && event.actionId === next.id);
          }
          if (unit.nextStartTick === state.tick) { startUnitAction(); emitUnitActionEvents(); }
        }
      });
    };

    const emitDueGeneratedEvents = (actionDue = []) => {
      let due = actionDue.slice();
      while (true) {
        const next = peekPendingGeneratedEvent();
        if (!next || next.absoluteTick > state.tick) break;
        const pending = popPendingGeneratedEvent();
        if (pending) due.push(pending);
      }
                                                                              
                                                                             
                                                                    
      if (due.length > 1 && due.some(pending => pending.event.afterAction != null)) {
        const groups = new Map();
                                                                         
                                                                          
        const groupKey = (pending,index) => pending.event.generatedObjectId || pending.owner.instanceId == null
          ? `separate:${index}` : `action:${pending.owner.instanceId}`;
        due.forEach((pending, index) => {
          const key = groupKey(pending,index);
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push({pending,index});
        });
        groups.forEach(group => {
          if (group.some(item => item.pending.event.afterAction != null)) {
            group.sort((a,b) => toFiniteNumber(a.pending.event.eventOrder,1000)
              - toFiniteNumber(b.pending.event.eventOrder,1000) || a.index - b.index);
          }
        });
        const offsets = new Map();
        due = due.map((pending,index) => {
          const key = groupKey(pending,index), offset = offsets.get(key) || 0;
          offsets.set(key, offset + 1);
          return groups.get(key)[offset].pending;
        });
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
        if (pending.event.summonDefinition) {
          if (pending.event.generatedEventType === '生成') { spawnSummon(pending); return; }
          const unit = summonUnits.get(`${pending.owner.instanceId}:${pending.event.generatedInstanceKey}`);
          if (unit && pending.event.type === 'damage') emitSummonHit(unit, pending.event);
          else if (unit && pending.event.statusApplication) {
                                                                                   
                                                                                 
            if (pending.event.statusApplication.dealsPeriodicDamage) {
              throw new RangeError(`${unit.definition.id}: 分身自身の継続ダメージ入力が未接続です`);
            }
            applyStatusApplication(unit.owner, { ...pending.event.statusApplication,
              sourceId: unit.id, sourceSelf: false });
          } else if (unit) throw new RangeError(`${unit.definition.id}: 召喚終了時の状態効果入力が不足しています`);
          return;
        }
        emitEvent(pending.owner, pending.event);
      });
      state.pendingGeneratedEvents = state.pendingGeneratedEvents.filter(pending => !pending.emitted && !pending.cancelled);
    };

    const startAction = (actionKey, selectedVariant = '', startOptions = {}) => {
      const action = config.actions[actionKey];
      if (!action) return false;
      if (actionKey === 'lowSkill' || actionKey === 'highSkill') pauseBaseSpRecovery();
      if (actionKey === 'lowSkill') resetRuntimeEffectsForAction(actionKey);
      const normalAttack = actionKey === 'basicAttack' || actionKey === 'enhancedAttack';
      const isEnhancedRepeat = actionKey === 'enhancedAttack' && startOptions.repeat === true;
      let repeatIndex = 0;
      let repeatProbabilityP = null;
      if (actionKey === 'enhancedAttack') {
        if (isEnhancedRepeat) {
          if (!state.enhancedRepeatChain || !state.enhancedRepeatChain.pending) return false;
          repeatIndex = state.enhancedRepeatChain.actionCount + 1;
          repeatProbabilityP = state.enhancedRepeatChain.actionProbabilityP;
        } else if (action.repeatPolicy) {
          state.enhancedRepeatChain = {
            actionCount: 1,
            actionProbabilityP: action.repeatPolicy.initialProbabilityP,
            maxActions: action.repeatPolicy.maxActions,
            decrementPoints: action.repeatPolicy.decrementPoints,
            estimated: action.repeatPolicy.estimated === true,
            sourceEffectIds: normalizeArray(action.repeatPolicy.sourceEffectIds).slice(),
            variant: '',
            pending: false,
            pendingRepeatIndex: null
          };
          repeatIndex = 1;
          repeatProbabilityP = state.enhancedRepeatChain.actionProbabilityP;
        } else {
          state.enhancedRepeatChain = null;
        }
      }
      if (normalAttack && !isEnhancedRepeat) {
        state.normalAttackSequence += 1;
        triggerAttackSpeedEffectsForNormalAttackCount();
      }
      triggerAttackSpeedEffectsForAction(actionKey);
      triggerAccelerationEffectsForAction(actionKey);
      const variant = selectedVariant || pickVariant(action, state, random);
      const variantLabel = String(action.variantLabels?.[variant] || '').trim();
      const sourceEvents = action.variants[variant] || action.variants.default || [];
      const baseMotionFrames = action.motionFramesByVariant?.[variant] ?? action.motionFrames;
      if (action.normalAttackIntervalBasis === 'motion' && !(baseMotionFrames > 0)) {
        throw new RangeError(`${action.label}: 選択分岐の基準モーション長が未確定です`);
      }
      const selfSpeed = getRenewaSpeedAtStart();
      const otherSpeed = selfSpeed;
                                                                            
                                                                              
      const effectivePeriodFrames = action.normalAttackIntervalBasis === 'motion'
        ? baseMotionFrames * getEffectiveNormalAttackIntervalFrames() / config.normalAttackIntervalFrames
        : getEffectiveNormalAttackIntervalFrames();
      const normalPeriodFrames = effectivePeriodFrames / otherSpeed;
      const motionScale = normalAttack && baseMotionFrames > 0
        ? calculateActionSpeedTiming(effectivePeriodFrames, baseMotionFrames, selfSpeed, otherSpeed).motionScale
        : 1 / selfSpeed;
      const motionFrames = baseMotionFrames * motionScale;
      const normalCycleFrames = motionFrames + Math.max(0, normalPeriodFrames - baseMotionFrames);
      const instanceId = ++state.actionSerial;
      triggerCooldownEffectsForAction({ key: actionKey, label: action.label, instanceId }, 'beforeStart');
      state.currentAction = {
        key: actionKey,
        label: action.label,
        variant: variant === 'default' ? '' : variant,
        variantLabel,
        instanceId,
        hasExplicitEventClock: sourceEvents.some(event => event.afterAction != null),
        startTick: state.tick,
        dynamicTiming: usesContinuousAcceleration,
        progressFrames: 0,
        progressLastTick: state.tick,
        motionFrames,
        endTick: state.tick + Math.max(1, toTicks(motionFrames, ticksPerFrame)),
        repeatIndex,
        repeatProbabilityP,
        events: sourceEvents.map(event => ({
          ...event,
          relativeFrames: event.frame * (event.eventClock === 'ゲーム時間' ? 1 : motionScale),
          relativeTick: toTicks(event.frame * (event.eventClock === 'ゲーム時間' ? 1 : motionScale), ticksPerFrame),
          emitted: false
        }))
      };
      if (action.detachedProjectileTiming || sourceEvents.some(event => event.afterAction === '継続'
        || event.eventClock === 'ゲーム時間')) {
                                                                              
                                                                            
        const owner = { ...state.currentAction, events: state.currentAction.events };
        const isDetached = event => event.afterAction === '継続' || event.eventClock === 'ゲーム時間'
          || (action.detachedProjectileTiming && event.type === 'damage' && event.afterAction == null);
        state.currentAction.events = owner.events.filter(event => !isDetached(event));
        owner.events.filter(isDetached).forEach(event => {
          scheduleGeneratedEvent({ absoluteTick: state.tick + event.relativeTick,
            owner, event, emitted: false });
        });
      }
      if (actionKey === 'enhancedAttack') {
        const chain = state.enhancedRepeatChain;
        if (isEnhancedRepeat && chain) {
                                                 
          chain.actionCount = repeatIndex;
          chain.pending = false;
          chain.pendingRepeatIndex = null;
          chain.variant = state.currentAction.variant;
        } else if (chain) {
          chain.variant = state.currentAction.variant;
        }
      }
      triggerDamageBuffEffectsForAction(state.currentAction, 'start');
      const generatedSourceEvents = normalizeArray(action.generatedEvents).filter(event => (
        event.generatedSpawnOrigin !== 'モーション内'
        && (!event.branch || event.branch === '共通' || event.branch === state.currentAction.variant)
      ));
      const generatedRuntimeEvents = generatedSourceEvents.map(event => {
        const rule = options.summonCalculationInput?.definitions?.[event.generatedObjectId]?.executionRules;
        let shift = 0;
        if (rule) {
          const spawns = generatedSourceEvents.filter(item => item.generatedObjectId === event.generatedObjectId
            && item.generatedEventType === '生成').sort((a, b) => a.generatedInstanceOrder - b.generatedInstanceOrder);
          const spawn = spawns.find(item => item.generatedInstanceOrder === event.generatedInstanceOrder);
          if (spawn) shift = spawns[0].frame + (event.generatedInstanceOrder - 1)
            * rule.generationIntervalSeconds * framesPerSecond * rule.gamePlaySpeed - spawn.frame;
        }
        return { ...event, relativeTick: toTicks(event.frame + shift, ticksPerFrame) };
      });
      const generatedOwner = {
        key: actionKey,
        label: action.label,
        variant: state.currentAction.variant,
        variantLabel: state.currentAction.variantLabel,
        instanceId,
        startTick: state.tick,
        events: generatedRuntimeEvents
      };
      const policy = action.ownerReservePolicy;
      if (policy) {
        if (normalizeScenarioId(config.apostleId) !== 'chloe' || actionKey !== 'highSkill'
          || policy.objectId !== 'Chloe_high_doll' || policy.count !== 7
          || policy.intervalSeconds !== .6 || policy.referenceUpdatesPerGameSecond !== 60) {
          throw new RangeError('生成待ちの対応契約が不正です');
        }
        const spawns = generatedRuntimeEvents.filter(event => event.generatedEventType === '生成'
          && event.generatedObjectId === policy.objectId)
          .sort((a,b) => a.generatedInstanceOrder - b.generatedInstanceOrder);
        if (spawns.length !== policy.count) throw new RangeError('生成待ちの個体数が一致しません');
        const reserve = { owner: generatedOwner, spawns, index: 0, wait: 0,
          intervalSeconds: policy.intervalSeconds, startTick: state.tick, update: 1,
          nextTick: state.tick + toTicks(framesPerSecond / 60, ticksPerFrame) };
        releaseOwnerReserveChild(reserve);
        state.ownerReserves.push(reserve);
      }
      generatedRuntimeEvents.filter(event => !policy || event.generatedObjectId !== policy.objectId).forEach(event => {
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
        state.normalAttackProgressFrames = 0;
        state.normalAttackProgressLastTick = state.tick;
        state.normalAttackCycleFrames = normalCycleFrames;
        state.nextNormalAttackTick = state.tick + toTicks(state.normalAttackCycleFrames, ticksPerFrame);
        scheduleRuntimeStateTimer('nextNormalAttackTick');
      } else if (actionKey === 'lowSkill') {
        state.sp = config.lowSkillSpPolicy === 'consume'
          ? Math.max(0, state.sp - config.requiredSp)
          : 0;
        state.lowSkillQueued = false;
        state.lowSkillReadyTick = null;
        scheduleRuntimeStateTimer('lowSkillReadyTick');
      } else if (actionKey === 'highSkill' && action.cooldownSeconds > 0) {
        const activeCooldownPercent = state.runtimeCooldownSettingEffects.reduce((total, effect) =>
          total + effect.expireTicks.filter(tick => tick > state.tick).length * effect.percent, 0);
        setCooldownRemainingTicks(
          'highSkill',
          toTicks(calculateCooldownSettingSeconds(action.cooldownSeconds,
            config.highSkillCooldownSettings, activeCooldownPercent)
            * recurringHighSkillCooldownMultiplier * framesPerSecond, ticksPerFrame)
        );
      }
                                           
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
        motionFrames,
        selfSpeed,
        otherSpeed,
        normalCycleFrames: normalAttack ? state.normalAttackCycleFrames : null,
        repeatIndex,
        repeatProbabilityP,
        repeatEstimated: state.enhancedRepeatChain?.estimated === true
      });
      triggerSpRecoveryEffectsForAction(state.currentAction, 'start');
      triggerRuntimeEventEffectsForAction(state.currentAction);
      emitDueActionEvents();
      emitDueGeneratedEvents();
      processSummonUnits();
      return true;
    };

    const beginSkillTransition = (actionKey, selectedVariant = '', startOptions = {}) => {
      const action = config.actions[actionKey];
      if (!action) return false;
      if (actionKey === 'lowSkill' || actionKey === 'highSkill') pauseBaseSpRecovery();
      const transitionFrames = Math.max(0, toFiniteNumber(action.transitionFrames, 2));
      if (transitionFrames <= 0) return startAction(actionKey, selectedVariant, startOptions);
      state.skillTransition = {
        actionKey,
        variant: selectedVariant,
        startOptions: { ...startOptions },
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

    const beginPreparedAction = (actionKey, selectedVariant = '', startOptions = {}) => (
      actionKey === 'lowSkill' || actionKey === 'highSkill'
        ? beginSkillTransition(actionKey, selectedVariant, startOptions)
        : startAction(actionKey, selectedVariant, startOptions)
    );

    const continueEnhancedRepeat = (finished, phase = 'end') => {
      const chain = state.enhancedRepeatChain;
      if (!chain || finished?.key !== 'enhancedAttack') return false;
      const notificationBound = normalizeArray(config.actions.enhancedAttack?.repeatPolicy?.notificationVariants)
        .includes(finished.variant || 'default');
                                                                           
                                                                         
      if ((phase === 'end' && notificationBound) || (phase === 'notification' && !notificationBound)) return false;
                                
      if (chain.pending) return false;
      const baseDetail = {
        actionKey: 'enhancedAttack',
        actionLabel: config.actions.enhancedAttack?.label || '強化攻撃',
        chainIndex: chain.actionCount,
        probability: chain.actionProbabilityP,
        decrementPoints: chain.decrementPoints,
        estimated: chain.estimated,
        maxActions: chain.maxActions,
        drawPhase: phase
      };
      if (state.tick >= durationTicks) {
        state.enhancedRepeatChain = null;
        log('enhancedRepeatProbability', {
          ...baseDetail,
          success: false,
          nextProbability: 0,
          reason: '計測時間終了'
        });
        return false;
      }
      if (chain.actionCount >= chain.maxActions) {
        state.enhancedRepeatChain = null;
        log('enhancedRepeatProbability', {
          ...baseDetail,
          success: false,
          nextProbability: 0,
          reason: `連続${chain.maxActions}回上限`
        });
        return false;
      }
      const probability = Math.max(0, Math.min(100, toFiniteNumber(chain.actionProbabilityP)));
      if (!(probability > 0)) {
        state.enhancedRepeatChain = null;
        log('enhancedRepeatProbability', {
          ...baseDetail,
          probability,
          success: false,
          nextProbability: 0,
          reason: '再発動確率0%（乱数消費なし）'
        });
        return false;
      }
                                                                            
                                                                     
      const ticket = probability >= 100 ? 0 : Math.floor(random() * 10001);
      const roll = ticket / 100;
      const success = probability >= 100 || ticket <= Math.trunc(Math.fround(probability * 100));
      const nextProbability = Math.max(0, probability - chain.decrementPoints);
      if (!success) {
        state.enhancedRepeatChain = null;
        log('enhancedRepeatProbability', {
          ...baseDetail,
          probability,
          roll,
          success: false,
          nextProbability,
          reason: '連続終了'
        });
        return false;
      }
                                    
                                                        
      chain.actionProbabilityP = nextProbability;
      chain.pending = true;
      chain.pendingRepeatIndex = chain.actionCount + 1;
      chain.variant = finished.variant || '';
      const lowSkillReady = state.lowSkillQueued
        && Number(state.lowSkillReadyTick) <= state.tick;
      log('enhancedRepeatProbability', {
        ...baseDetail,
        success: true,
        probability,
        roll,
        nextProbability,
        reason: lowSkillReady ? '低学年を優先して保留'
          : phase === 'notification' ? '行動終了後の強化攻撃を予約' : '次の強化攻撃へ直結'
      });
      return true;
    };

    const beginActionPreparation = (actionKey, requestedVariant = null, startOptions = {}) => {
      const action = config.actions[actionKey];
      if (!action) return false;
      const selectedVariant = requestedVariant == null
        ? pickVariant(action, state, random)
        : requestedVariant;
      const movement = findMovementTransition(actionKey, selectedVariant);
      if (!movement) return beginPreparedAction(actionKey, selectedVariant, startOptions);
      state.movementTransition = {
        ...movement,
        actionKey,
        actionLabel: action.label,
        variant: selectedVariant,
        startOptions: { ...startOptions },
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
      if (usesContinuousAcceleration) {
        if (state.normalAttackProgressFrames == null) {
          if (state.tick < state.nextNormalAttackTick) return false;
        } else if (state.normalAttackProgressFrames + 1e-9 < state.normalAttackCycleFrames) {
          return false;
        }
      } else if (state.tick < state.nextNormalAttackTick) return false;
      const enhancedAction = config.actions.enhancedAttack;
      const nextNormalAttackSequence = state.normalAttackSequence + 1;
      const enhancedBlocked = normalizeArray(enhancedAction?.blockedBySelfStateIds)
        .some(stateId => isSelfStateActive(stateId));
                                                                            
                                                                               
      const enhancedProbability = Math.fround(toFiniteNumber(enhancedAction?.triggerProbability)
        + Math.fround(toFiniteNumber(getRuntimeDamageBuffDelta(state, config, 'enhancedAttack').enhancedAttackRateP)));
      const enhanced = !enhancedBlocked && !!enhancedAction && (state.tick < state.epicaLowEnhancedUntilTick || (enhancedAction.triggerStatus
        ? getActiveStatusStacks(enhancedAction.triggerStatus).length > 0
        : (enhancedAction.triggerEveryCount > 0
          ? nextNormalAttackSequence % enhancedAction.triggerEveryCount === 0
          : enhancedProbability > 0 && Math.floor(random() * 100) < enhancedProbability)));
      return beginActionPreparation(enhanced ? 'enhancedAttack' : 'basicAttack');
    };

    const canActivateNonOccupyingHigh = () => {
      const action = config.actions.highSkill;
      return highSkillMode === 'auto' && action?.activationMode === 'nonOccupyingImmediate'
        && state.tick >= state.actionStartAllowedTick
        && !state.movementTransition && !state.skillTransition
        && !['lowSkill', 'highSkill'].includes(state.currentAction?.key);
    };

    const tryActivateNonOccupyingHigh = () => {
      if (!canActivateNonOccupyingHigh()
        || getCooldownRemainingTicks('highSkill') > 0
        || state.tick < state.nonOccupyingHighGlobalReadyTick) return false;
      const action = config.actions.highSkill;
      const variant = pickVariant(action, state, random);
      const owner = {key:'highSkill', label:action.label, variant:variant === 'default' ? '' : variant,
        variantLabel:action.variantLabels?.[variant] || '', instanceId:++state.actionSerial,
        startTick:state.tick, events:action.variants[variant] || action.variants.default || []};
                                                                               
      triggerCooldownEffectsForAction(owner, 'beforeStart');
      triggerAttackSpeedEffectsForAction('highSkill');
      triggerAccelerationEffectsForAction('highSkill');
      triggerDamageBuffEffectsForAction(owner, 'start');
      counts.highSkill += 1;
      log('actionStart', {actionKey:owner.key, actionLabel:owner.label, variant:owner.variant,
        activationMode:action.activationMode, sp:state.sp, motionFrames:null});
      triggerSpRecoveryEffectsForAction(owner, 'start');
      triggerRuntimeEventEffectsForAction(owner);
      owner.events.forEach(event => emitEvent(owner, event));
      log('actionEnd', {actionKey:owner.key, actionLabel:owner.label, variant:owner.variant,
        activationMode:action.activationMode});
      triggerRuntimeEventEffectsForAction(owner, 'end');
      triggerSpRecoveryEffectsForAction(owner, 'end');
      triggerAttackSpeedEffectsForAction('highSkill', 'end');
      triggerAccelerationEffectsForAction('highSkill', 'end');
      triggerDamageBuffEffectsForAction(owner, 'end');
                                                                               
      const percent = state.runtimeCooldownSettingEffects.reduce((total, effect) => total
        + effect.expireTicks.filter(tick => tick > state.tick).length * effect.percent, 0);
      setCooldownRemainingTicks('highSkill', toTicks(calculateCooldownSettingSeconds(
        action.cooldownSeconds, config.highSkillCooldownSettings, percent)
        * recurringHighSkillCooldownMultiplier * framesPerSecond, ticksPerFrame));
      state.nonOccupyingHighGlobalReadyTick = state.tick + toTicks(framesPerSecond, ticksPerFrame);
      triggerCooldownEffectsForAction(owner, 'start');
      triggerCooldownEffectsForAction(owner, 'end');
      return true;
    };

    const tryStartAction = () => {
      if (state.currentAction || state.movementTransition || state.skillTransition) return;
      if (state.tick < state.actionStartAllowedTick) return;
      const pendingRepeat = state.enhancedRepeatChain?.pending === true
        ? state.enhancedRepeatChain
        : null;
      if (pendingRepeat) {
        const lowSkillReady = state.lowSkillQueued
          && Number(state.lowSkillReadyTick) <= state.tick;
        if (lowSkillReady && beginActionPreparation('lowSkill')) return;
        const repeatVariant = pendingRepeat.variant || 'default';
        if (beginActionPreparation('enhancedAttack', repeatVariant, { repeat: true })) return;
                                              
        state.enhancedRepeatChain = null;
        return;
      }
      if (state.lowSkillQueued && state.lowSkillReadyTick < state.tick && beginActionPreparation('lowSkill')) return;
      if (state.lowSkillQueued && state.lowSkillReadyTick === state.tick) {
        if (tryStartNormalAttack()) return;
        if (beginActionPreparation('lowSkill')) return;
      }
      if (highSkillMode === 'auto' && config.actions.highSkill?.activationMode !== 'nonOccupyingImmediate'
        && getCooldownRemainingTicks('highSkill') <= 0 && beginActionPreparation('highSkill')) return;
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
    state.runtimeAccelerationEffects
      .filter(effect => ['constant', 'initialTimed', 'manualInitialTimed', 'fixed'].includes(effect.mode))
      .forEach(effect => applyAccelerationEffect(
        effect,
        effect.mode === 'fixed' ? '固定設定' : '戦闘開始時'
      ));
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
                                        
                                  
    queueLowSkillIfReady();

    const getNextIdleEventTick = () => {
      const candidates = [durationTicks];
      const add = value => {
        const tick = Number(value);
        if (Number.isFinite(tick) && tick > state.tick) candidates.push(Math.ceil(tick));
      };
      add(state.actionStartAllowedTick);
      add(getNextNormalAttackReadyTick());
      add(getNextActionInternalEventTick());
      add(getNextRuntimePeriodicEventTick());
      state.runtimeAccelerationEffects.forEach(effect => add(effect.active ? effect.expireTick : Infinity));
      state.selfStateStacks.forEach(stack => add(stack.expireTick));
      add(getNextPendingGeneratedEventTick());
      add(getNextOwnerAreaTick());
      add(getNextOwnerReserveTick());
      add(getNextUnitSpRecoveryTick());
      add(getNextYomiAsideAttackTick());
      if (canActivateNonOccupyingHigh()) add(Math.max(state.cooldowns.highSkill.readyTick,
        state.nonOccupyingHighGlobalReadyTick));
                                          
                                        
                                                    
                                     
      const nextExternalEvent = state.externalEvents[state.externalEventIndex];
      if (nextExternalEvent && !nextExternalEvent.emitted) {
        add(nextExternalEvent.eventTick);
      }
      return Math.min(...candidates);
    };

    const fastForwardIdleTicks = () => {
      if (options.enableFastForward === false) return false;
      if (summonUnits.size > 0) return false;
      if (hasActiveAcceleration()) return false;
      const isDue = value => Number.isFinite(Number(value)) && Number(value) <= state.tick;
      const actionPhaseActive = !!(
        state.currentAction
        || state.movementTransition
        || state.skillTransition
      );
      if (isDue(getNextActionInternalEventTick())
        || (canActivateNonOccupyingHigh() && getCooldownRemainingTicks('highSkill') <= 0
          && state.tick >= state.nonOccupyingHighGlobalReadyTick)
        || (!actionPhaseActive && isDue(getNextNormalAttackReadyTick()))
        || (!actionPhaseActive && state.lowSkillQueued && isDue(state.lowSkillReadyTick))
        || (!actionPhaseActive && highSkillMode === 'auto' && getCooldownRemainingTicks('highSkill') <= 0)
        || isDue(getNextRuntimePeriodicEventTick())
        || state.selfStateStacks.some(stack => isDue(stack.expireTick))
        || isDue(getNextPendingGeneratedEventTick())
        || isDue(getNextOwnerAreaTick()) || isDue(getNextOwnerReserveTick())
        || isDue(getNextUnitSpRecoveryTick()) || isDue(getNextYomiAsideAttackTick())) {
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
                                                                                   
                                                                               
      if (cooperative && processedTickCount % 256 === 0 && cooperative.shouldYield()) yield;
      processedTickCount += 1;
      if (fastForwardIdleTicks()) continue;
      advanceCurrentActionProgress();
      advanceNormalAttackProgress();
      expireAccelerationEffects();
      expireAttackSpeedEffects();
      [...state.runtimeSpRegenEffects, ...state.runtimeCooldownSettingEffects].forEach(effect => {
        const before = effect.expireTicks.length;
        effect.expireTicks = effect.expireTicks.filter(tick => tick > state.tick);
        if (before !== effect.expireTicks.length) logEffectStateChange({
          kind: state.runtimeCooldownSettingEffects.includes(effect) ? 'cooldownSetting' : 'spRegen',
          effectId: effect.id, sourceId: effect.sourceId, label: effect.label,
          operation: 'expire', stackCount: effect.expireTicks.length });
      });
      processRuntimeAttackSpeedStacks();
      expireRuntimeBuffs();
      expireSelfStates();
      if (state.epicaLowEnhancedUntilTick > 0 && state.epicaLowEnhancedUntilTick <= state.tick) {
        state.epicaLowEnhancedUntilTick = 0;
        log('effectStateChanged', { kind: 'attackReplacement', operation: 'expire',
          effectId: 'Epica_low_e04', label: '低学年中の基本攻撃→強化攻撃', reason: '持続時間終了' });
      }
      processExternalEvents();
      const pausesSpRecovery = ['lowSkill', 'highSkill'].includes(state.currentAction?.key)
        || ['lowSkill', 'highSkill'].includes(state.skillTransition?.actionKey);
      if (state.tick > 0 && !pausesSpRecovery && config.spRegen > 0) {
        state.spRecoveryRemainingTicks = Math.max(0, state.spRecoveryNextTick - state.tick);
      }
      if (state.tick > 0 && state.spRecoveryNextTick <= state.tick && config.spRegen > 0) {
        state.spRecoveryNextTick = state.tick + spTickInterval;
        state.spRecoveryRemainingTicks = spTickInterval;
        scheduleRuntimeStateTimer('spRecoveryNextTick');
        const before = state.sp;
        const timedSpRegen = state.runtimeSpRegenEffects.reduce((amount, effect) => amount
          + effect.expireTicks.length * ((config.baseSpRegen || 0) * effect.percent / 100 + effect.fixed), 0);
        state.sp = Math.min(config.maxSp, state.sp + Math.max(0, config.spRegen + timedSpRegen));
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
      processOwnerAreas();
      processOwnerReserves();
      processUnitSpRecoveries();
      processYomiAsideAttacks();
      emitDueActionEvents();
      emitDueGeneratedEvents();
      processSummonUnits();
      expireStatuses();
      const currentActionComplete = state.currentAction && (
        state.currentAction.dynamicTiming
          ? state.currentAction.progressFrames + 1e-9 >= state.currentAction.motionFrames
          : state.currentAction.endTick === state.tick
      );
      if (currentActionComplete) {
        const finished = state.currentAction;
        log('actionEnd', { actionKey: finished.key, actionLabel: finished.label, variant: finished.variant, variantLabel: finished.variantLabel });
        triggerRuntimeEventEffectsForAction(finished, 'end');
        triggerSpRecoveryEffectsForAction(finished, 'end');
        state.runtimeBuffStacks.forEach(stack => {
          if (normalizeArray(stack.releaseAfterActionKeys).includes(finished.key)) stack.expireTick = state.tick;
        });
        expireRuntimeBuffs();
        state.pendingGeneratedEvents.forEach(pending => {
          if (pending.owner.instanceId === finished.instanceId && pending.event.afterAction === '終了') {
            pending.cancelled = true;
          }
        });
        state.currentAction = null;
        state.lastCompletedAction = {
          key: finished.key,
          label: finished.label,
          variant: finished.variant,
          variantLabel: finished.variantLabel
        };
        triggerAttackSpeedEffectsForAction(finished.key, 'end');
        triggerAccelerationEffectsForAction(finished.key, 'end');
        triggerDamageBuffEffectsForAction(finished, 'end');
        triggerCooldownEffectsForAction(finished, 'end');
        if (finished.key === 'lowSkill') {
          state.nextNormalAttackTick = state.tick;
          if (state.normalAttackProgressFrames != null) {
            state.normalAttackProgressFrames = usesRenewaTiming
              ? state.normalAttackCycleFrames : getEffectiveNormalAttackIntervalFrames();
            state.normalAttackProgressLastTick = state.tick;
          }
          scheduleRuntimeStateTimer('nextNormalAttackTick');
        }
        if (finished.key === 'lowSkill' || finished.key === 'highSkill') {
          resumeBaseSpRecovery();
        }
                                                                          
                                                                           
        continueEnhancedRepeat(finished);
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
        beginPreparedAction(movement.actionKey, movement.variant, movement.startOptions || {});
      }
      if (state.skillTransition && state.skillTransition.readyTick === state.tick) {
        const actionKey = state.skillTransition.actionKey;
        const selectedVariant = state.skillTransition.variant;
        const startOptions = state.skillTransition.startOptions || {};
        state.skillTransition = null;
        startAction(actionKey, selectedVariant, startOptions);
      }
                                                                          
                                                                                 
      tryActivateNonOccupyingHigh();
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
        calculation: {
          roundedEvents: state.damageCalculation?.roundedEvents || 0,
          roundedDotEvents: state.damageCalculation?.roundedDotEvents || 0,
          legacyEvents: state.damageCalculation?.legacyEvents || 0,
          legacyReasons: [...(state.damageCalculation?.reasons || [])]
        },
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
        accelerationEffects: state.runtimeAccelerationEffects.map(effect => ({
          id: effect.id,
          effectId: effect.effectId,
          label: effect.label,
          mode: effect.mode,
          active: effect.active,
          triggerCount: effect.triggerCount,
          accelerationP: effect.accelerationP,
          maxAccelerationP: effect.maxAccelerationP,
          maxActionSpeedP: effect.maxActionSpeedP,
          curve: effect.curve,
          rampFrames: effect.rampFrames,
          holdFrames: effect.holdFrames,
          durationFrames: effect.durationFrames,
          startTick: effect.startTick,
          expireTick: effect.expireTick
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
        enhancedRepeatChain: state.enhancedRepeatChain ? {
          actionCount: state.enhancedRepeatChain.actionCount,
          actionProbabilityP: state.enhancedRepeatChain.actionProbabilityP,
          maxActions: state.enhancedRepeatChain.maxActions,
          decrementPoints: state.enhancedRepeatChain.decrementPoints,
          estimated: state.enhancedRepeatChain.estimated,
          variant: state.enhancedRepeatChain.variant || '',
          pending: state.enhancedRepeatChain.pending === true,
          pendingRepeatIndex: state.enhancedRepeatChain.pendingRepeatIndex ?? null
        } : null,
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
      warnings: [...new Set([...normalizeArray(config.warnings), ...speedModelWarnings,
        ...(normalizeScenarioId(config.apostleId) === 'tig' && config.actions?.lowSkill
          && config.enemyIsWorldBoss === false && config.tigHeroHpModel === 'omit-with-warning-v1'
          ? [TIG_HERO_HP_WARNING] : []),
        ...normalizeArray(options.summonCalculationInput?.assumptions)])]
    };
  }

  function* simulateManySteps(config, options = {}, cooperative = null) {
    const aggregateStartedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    const requestedTrials = Math.max(1, Math.min(4096, Math.floor(toFiniteNumber(options.trials, 64))));
                                            
                                                   
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
      const result = yield* simulateSteps(config, {
        ...options,
        seed,
        durationSeconds,
        recordTimeline: false
      }, cooperative);
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

  function finishSimulation(steps) {
    let next = steps.next();
    while (!next.done) next = steps.next();
    return next.value;
  }

  function simulate(config, options = {}) {
    return finishSimulation(simulateSteps(config, options));
  }

  function simulateMany(config, options = {}) {
    return finishSimulation(simulateManySteps(config, options));
  }

  async function runCooperativeSimulation(makeSteps, config, options, control = {}) {
    const now = () => typeof performance !== 'undefined' ? performance.now() : Date.now();
    const budgetMs = Math.max(1, Math.min(16, toFiniteNumber(control.budgetMs, 8)));
    let deadline = now() + budgetMs;
    const steps = makeSteps(config, options, { shouldYield: () => now() >= deadline });
    const checkCancelled = () => {
      if (!control.isCancelled?.()) return;
      const error = new Error('DPS計算を取り消しました');
      error.name = 'DpsRunCancelledError';
      throw error;
    };
    try {
      while (true) {
        checkCancelled();
        const next = steps.next();
        checkCancelled();
        if (next.done) return next.value;
                                                                                
        await new Promise(resolve => setTimeout(resolve, 0));
        deadline = now() + budgetMs;
      }
    } finally {
      steps.return();
    }
  }

  function simulateAsync(config, options = {}, control = {}) {
    return runCooperativeSimulation(simulateSteps, config, options, control);
  }

  function simulateManyAsync(config, options = {}, control = {}) {
    return runCooperativeSimulation(simulateManySteps, config, options, control);
  }

                                                                       
                                                                            
  function calculateCooldownSettingSeconds(baseSeconds, settings = {}, extraPercent = 0) {
    const base = Math.max(0, toFiniteNumber(baseSeconds));
    const fixed = Math.max(0, toFiniteNumber(settings?.fixedSeconds));
    const percent = toFiniteNumber(settings?.percent) + toFiniteNumber(extraPercent);
    if (!fixed && !percent) return base;
    const remaining = Math.fround(Math.fround(base) - Math.fround(fixed));
    const factor = Math.max(0, Math.fround(1 - Math.fround(Math.fround(percent) * Math.fround(0.01))));
    return Math.max(0, Math.fround(remaining * factor));
  }

  function calculateInitialCooldownSettingSeconds(baseSeconds, settings = {}, multiplier = 0.5) {
                                                                            
                                                                      
                                                                            
    const initialSettings = Number.isFinite(settings?.initialFixedSeconds)
      ? { ...settings, fixedSeconds: settings.initialFixedSeconds } : settings;
    const reduced = calculateCooldownSettingSeconds(baseSeconds, initialSettings);
    const initialRate = Math.max(0, toFiniteNumber(multiplier, 0.5));
    return Math.max(0, Math.fround(Math.fround(reduced) * Math.fround(initialRate)));
  }

                                                                             
                                                                             
                                                                               
  function createOwnerAreaClock(durationSeconds, intervalSeconds = 1) {
    if (!Number.isFinite(durationSeconds) || durationSeconds < 0
      || !Number.isFinite(intervalSeconds) || intervalSeconds <= 0
      || !Number.isFinite(Math.fround(durationSeconds))
      || !Number.isFinite(Math.fround(intervalSeconds)) || Math.fround(intervalSeconds) <= 0) {
      throw new RangeError('領域の持続時間・周期が不正です');
    }
    return { duration: Math.fround(durationSeconds), interval: Math.fround(intervalSeconds),
      wait: 0, period: 0, nextUpdate: 0, lastGameSeconds: -1, ended: false };
  }

  function advanceOwnerAreaClock(clock, elapsedGameSeconds, selfSpeedAtTime = () => 1) {
    if (!Number.isFinite(elapsedGameSeconds) || elapsedGameSeconds < 0
      || elapsedGameSeconds < clock.lastGameSeconds) {
      throw new RangeError('領域の時計を逆行させることはできません');
    }
    const pulses = [];
    while (!clock.ended && clock.nextUpdate / 60 <= elapsedGameSeconds) {
      const update = clock.nextUpdate;
      const gameSeconds = update / 60;
      const speed = selfSpeedAtTime(gameSeconds);
      if (!Number.isFinite(speed) || speed < 0 || !Number.isFinite(Math.fround(speed))) {
        throw new RangeError('領域の加速値が不正です');
      }
      const emit = kind => pulses.push({ kind, update, gameSeconds, ownerSeconds: clock.wait });
      if (update === 0) emit('first');
      if (clock.wait > clock.duration) {
        emit('end');
        clock.ended = true;
        break;
      }
      if (clock.period >= clock.interval) {
        clock.period = 0;
        emit('period');
      }
      const delta = Math.fround(Math.fround(1 / 60) * Math.fround(speed));
      clock.period = Math.fround(clock.period + delta);
      clock.wait = Math.fround(clock.wait + delta);
      clock.nextUpdate += 1;
    }
    clock.lastGameSeconds = elapsedGameSeconds;
    return pulses;
  }

  function deriveSupportSeed(seed, ownerId) {
    let hash = 2166136261;
    for (const char of `support:${String(ownerId).toLowerCase()}`) {
      hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    }
    return Math.max(1, (hash ^ Math.floor(toFiniteNumber(seed, 1))) >>> 0);
  }

                                                                         
                                                                           
                                                                           
  function calculatePiraGiftDelayFrames(seconds, updatesPerGameSecond) {
    if (!Number.isFinite(seconds) || seconds < 0
      || !Number.isFinite(updatesPerGameSecond) || updatesPerGameSecond <= 0) {
      throw new RangeError('Invalid gift delay clock');
    }
    const threshold = Math.fround(seconds);
    const delta = Math.fround(1 / updatesPerGameSecond);
    let elapsed = 0, updates = 0;
    const limit = Math.ceil(seconds * updatesPerGameSecond) + 2;
    while (elapsed < threshold && updates < limit) {
      elapsed = Math.fround(elapsed + delta);
      updates++;
    }
    if (elapsed < threshold) throw new RangeError('Gift delay clock did not reach threshold');
    return updates;
  }

  function isSupportClockBindingSupported(config, binding) {
    if (!binding.bindingKey) return false;
    if (normalizeScenarioId(config.apostleId) === 'pira'
      && binding.effectIds?.includes('Pira_aside_2_e05')) {
      return binding.supportRecipientModel === 'selected-recipient-provisional'
        && binding.supportApplicationDelaySeconds === 0.5
        && binding.type === '高学年スキル終了時'
        && binding.triggerSourceId === '高学年スキル'
        && !binding.conditionType && !binding.conditionValue
        && normalizeArray(binding.triggerActionKeys).length === 1
        && binding.triggerActionKeys[0] === 'highSkill' && !!config.actions?.highSkill;
    }
    if (normalizeScenarioId(config.apostleId) === 'sherum'
      && binding.type === '高学年スキル効果発生時'
      && binding.triggerSourceId === 'Sherum_aside_2_e03'
      && !binding.conditionType && !binding.conditionValue) {
      return normalizeArray(config.runtimeEffects?.damageBuffEffects).some(effect =>
        effect.triggerSourceId === 'Sherum_aside_2_e03' && effect.durationFrames === 360)
        && Object.values(config.actions?.highSkill?.variants || {}).some(events =>
          normalizeArray(events).some(event => event.effectId === 'Sherum_high_e01' && event.ownerArea));
    }
    if (normalizeScenarioId(config.apostleId)==='rollett' && binding.type==='状態付与時'
      && binding.statusReactionOnly===true && !binding.conditionType && !binding.conditionValue) {
      return normalizeArray(config.runtimeEffects?.eventEffects).some(effect=>effect.id==='Rollett:aside2:childChoice'
        && effect.weightedChoices?.total===300 && normalizeArray(effect.steps).some(step=>step.type==='status'
          && step.application?.applicationEffectId===binding.triggerSourceId
          && step.application.status===binding.status));
    }
    if (normalizeScenarioId(config.apostleId) === 'yomi'
      && binding.type === '強化攻撃命中時' && binding.triggerSourceId === 'Yomi_aside_2_e03'
      && !binding.conditionType && !binding.conditionValue
      && normalizeArray(binding.triggerActionKeys).length === 1
      && binding.triggerActionKeys[0] === 'enhancedAttack') {
      return config.enemyCount === 1 && !!config.runtimeEffects?.yomiAsideReservations;
    }
    if (normalizeScenarioId(config.apostleId) === 'barong' && binding.type === '状態付与時'
      && binding.triggerSourceId === 'Barong_favorite_1_e02' && binding.status === '攻撃速度減少'
      && binding.statusReactionOnly === true && !binding.conditionType && !binding.conditionValue) {
      return Object.values(config.actions?.enhancedAttack?.variants || {}).some(events =>
        normalizeArray(events).some(event => event.statusApplication?.applicationEffectId === binding.triggerSourceId
          && event.statusApplication.durationFrames === 300));
    }
    if (normalizeScenarioId(config.apostleId) === 'snorky' && binding.type === '状態付与時'
      && binding.triggerSourceId === 'Snorky_favorite_1_e02' && binding.status === '気絶'
      && binding.statusReactionOnly === true && !binding.conditionType && !binding.conditionValue) {
      return Object.values(config.actions?.enhancedAttack?.variants || {}).some(events =>
        normalizeArray(events).some(event => event.statusApplication?.applicationEffectId === binding.triggerSourceId
          && event.statusApplication.applicationProbability === 50));
    }
    if (normalizeScenarioId(config.apostleId) === 'daya' && binding.type === '状態付与時'
      && binding.triggerSourceId === 'Daya_aside_2_e04' && binding.status === '気絶'
      && binding.statusReactionOnly === true && !binding.conditionType && !binding.conditionValue) {
      return normalizeArray(config.runtimeEffects?.eventEffects).some(effect =>
        effect.triggerType === '高学年スキル命中時'
        && normalizeArray(effect.triggerActionKeys).includes('highSkill')
        && normalizeArray(effect.steps).some(step => step.type === 'status'
          && step.application?.applicationEffectId === binding.triggerSourceId
          && step.application?.status === '気絶' && step.application.durationFrames === 150));
    }
                                                                              
    if (normalizeScenarioId(config.apostleId) === 'tig' && binding.type === '状態付与時'
      && binding.triggerSourceId === 'Tig_favorite_1_e05' && binding.status === '火傷'
      && binding.statusReactionOnly === true && !binding.conditionType && !binding.conditionValue) {
      return normalizeArray(config.runtimeEffects?.eventEffects).some(effect =>
        normalizeArray(effect.steps).some(step => step.type === 'status'
          && step.application?.applicationEffectId === binding.triggerSourceId));
    }
    const pira = normalizeScenarioId(config.apostleId) === 'pira';
                                                                            
                                                                               
    const piraBranch = pira && binding.type === '高学年スキル効果発生時'
      && ((binding.triggerSourceId === 'Pira_high_e03'
        && binding.conditionType === '発動前リソーススタック範囲' && binding.conditionValue === 'Pira_wealth:0-29')
        || (binding.triggerSourceId === 'Pira_high_e06'
        && binding.conditionType === '発動前リソーススタック' && binding.conditionValue === 'Pira_wealth:30'));
    if (pira && binding.type === 'リソース獲得時' && binding.triggerSourceId === 'Pira_wealth') {
      return !binding.conditionType && !binding.conditionValue
        && normalizeArray(config.runtimeResources).some(resource => resource.id === 'Pira_wealth');
    }
    if (!/^(?:普通攻撃|強化攻撃|低学年スキル|高学年スキル)(?:使用|発動|終了|命中|効果発生)時$/.test(binding.type)
      || ((binding.conditionType || binding.conditionValue) && !piraBranch)) return false;
    const keys = normalizeArray(binding.triggerActionKeys);
    if (!keys.length || keys.some(key => !config.actions?.[key])) return false;
    const source = String(binding.triggerSourceId || '');
    const concreteSource = source && !/^(普通攻撃(?:_基本|_強化)?|基本攻撃|強化攻撃|低学年スキル|高学年スキル)$/.test(source);
    const needsNotification = /効果発生時$/.test(binding.type)
      || (concreteSource && /発動時$|命中時$/.test(binding.type));
    if (!needsNotification) return true;
    const matches = event => event?.effectId === source
      || normalizeArray(event?.motionLinkedGeneratedEvents).some(matches);
    return keys.some(key => Object.values(config.actions[key].variants || {})
      .some(events => normalizeArray(events).some(matches)));
  }

  function matchesSupportNotification(binding, notification) {
    if (binding.type === '状態付与時') return notification.type === 'statusApplied'
      && notification.applicationEffectId === binding.triggerSourceId
      && notification.status === binding.status;
    if (binding.type === 'リソース獲得時') return notification.type === 'resourceChange'
      && notification.resourceId === binding.triggerSourceId && notification.operation === 'gain'
      && notification.after > notification.before && notification.amount > 0;
    if (normalizeArray(binding.triggerActionKeys).length
      && !binding.triggerActionKeys.includes(notification.actionKey)) return false;
    const type = String(binding.type || '');
    const source = String(binding.triggerSourceId || '');
    const genericSource = !source || /^(普通攻撃(?:_基本|_強化)?|基本攻撃|強化攻撃|低学年スキル|高学年スキル)$/.test(source);
    if (/効果発生時$/.test(type) || (/発動時$/.test(type) && !genericSource)) {
      return ['hit', 'effect'].includes(notification.type) && source === notification.effectId;
    }
    if (/使用時$|発動時$/.test(type)) return notification.type === 'actionStart';
    if (/終了時$/.test(type)) return notification.type === 'actionEnd';
    if (/命中時$/.test(type)) return notification.type === 'hit'
      && !notification.generatedObjectId && (genericSource || source === notification.effectId);
    return false;
  }

  function hasSimulationRandomness(config = {}) {
    if (normalizeArray(config.supportClocks).some(clock => hasSimulationRandomness(clock.config))) return true;
    const actions = Object.values(config.actions || {});
    const probabilisticStatus = event => {
      const probability = event?.statusApplication?.applicationProbability;
      return (typeof probability === 'number' && probability > 0 && probability < 100)
        || normalizeArray(event?.motionLinkedGeneratedEvents).some(probabilisticStatus);
    };
    if (actions.some(action => Object.values(action?.variants || {}).some(events =>
      normalizeArray(events).some(probabilisticStatus)))) return true;
    if (actions.some(action => (
      Number(action?.triggerProbability) > 0
      || Number(action?.repeatPolicy?.initialProbabilityP) > 0
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
      || normalizeArray(effect?.weightedChoices?.choices).filter(choice=>choice.weight>0).length>1
      || probabilisticStatus(effect)
      || effect?.randomBound === 'range'
      || (Number.isFinite(Number(effect?.triggerProbability))
        && Number(effect.triggerProbability) > 0
        && Number(effect.triggerProbability) < 100)
    ));
  }

  return Object.freeze({
    version: 205,
    calculatePiraGiftDelayFrames,
    resolveNativeCoefficient,
    resolveImplicitTimedSpEffectId,
    calculateCooldownSettingSeconds,
    calculateInitialCooldownSettingSeconds,
    createOwnerAreaClock,
    advanceOwnerAreaClock,
    assembleSummonAbilities,
    getSummonCalculationIssues,
    getSummonUnitIssues,
    calculateActionSpeedTiming,
    buildCombatantConfig,
    createActionSkillOverride,
    createSeededRandom,
    evaluateDamageAtHit,
    resolveNativeStatusCoefficientSelection,
    evaluateSingleHitDamage,
    buildEpicaDedicatedHitQuery,
    evaluateEpicaDedicatedHitQuery,
    evaluateDotDamage,
    createDotAttackSnapshot,
    evaluateDotAtTick,
    roundDamageRateToEven,
    roundNativeToEven,
    resolveNormalDamageRate,
    resolveDirectCritRate,
    resolveCombatStat,
    resolveAttackSpeed,
    calcRuntimeBaseDamageRate,
    calcRuntimeCritRate,
    calcRuntimeCritMultiplier,
    clampCombatCritRate,
    clampCombatCritMultiplier,
    simulate,
    isSupportClockBindingSupported,
    simulateMany,
    simulateAsync,
    simulateManyAsync,
    createDpsPublicTimeline,
    selectEnemySizeVariantBranch,
    toTicks
  });
});
