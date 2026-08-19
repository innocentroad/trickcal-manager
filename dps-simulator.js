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

  function findSkill(apostle, actionKey) {
    const skillType = ACTION_SKILL_TYPES[actionKey];
    return normalizeArray(apostle?.skills).find(skill => skill?.skillType === skillType) || null;
  }

  function getBranchName(effect) {
    return (String(effect?.valueKind || '').match(/^\[([^\]]+)\]/) || [])[1] || '';
  }

  function isDamageEffect(effect) {
    return effect?.effectType === '攻撃' && effect?.valueClass === '倍率';
  }

  function isDeferredDamageEffect(effect) {
    const text = `${effect?.valueKind || ''} ${effect?.condition || ''}`;
    return /破壊時|終了時|死亡時|撃破時|条件発動/.test(text);
  }

  function getDamageEffects(skill, branch = '') {
    return normalizeArray(skill?.effects).filter(effect => {
      if (!isDamageEffect(effect) || isDeferredDamageEffect(effect)) return false;
      const effectBranch = getBranchName(effect);
      return branch ? effectBranch === branch : !effectBranch;
    });
  }

  function getTotalHitCount(skill, branch = '') {
    const row = normalizeArray(skill?.effects).find(effect => {
      if (effect?.effectType !== '攻撃' || effect?.valueClass !== 'ヒット数') return false;
      const effectBranch = getBranchName(effect);
      return branch ? effectBranch === branch : !effectBranch;
    });
    const count = Number(row?.fixedValue);
    return Number.isFinite(count) && count > 0
      ? Math.floor(count)
      : getDamageEffects(skill, branch).length ? 1 : 0;
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
    skillEffects.forEach(({ effect }) => {
      const match = String(effect?.valueKind || '').match(/^(.+?)最大数$/);
      if (!match) return;
      const name = match[1];
      const maxStacks = Math.max(1, Math.floor(toFiniteNumber(effect.fixedValue, effect.maxStack || 1)));
      const current = resources.get(name) || { id: name, name, initialStacks: 0, maxStacks: 1 };
      current.maxStacks = Math.max(current.maxStacks, maxStacks);
      resources.set(name, current);
    });
    resources.forEach(resource => {
      const heldEffects = skillEffects.filter(({ effect }) => (
        String(effect?.condition || '').includes(`${resource.name}所持時`)
        && /与ダメージ量増加|与ダメージ|ダメージ量増加/.test(String(effect?.valueKind || ''))
      ));
      resource.heldAddEffectIds = heldEffects
        .map(({ effect }) => String(effect?.effectId || ''))
        .filter(Boolean);
      resource.heldAddPPerStack = heldEffects.reduce((max, { skill, effect }) => (
        Math.max(max, toFiniteNumber(resolveEffectValue(effect, getSkillLevel(skill, skillLevels))))
      ), 0);

      const gainBuff = skillEffects.find(({ effect }) => (
        String(effect?.condition || '').includes(`${resource.name}獲得時`)
        && /攻撃力増加/.test(String(effect?.valueKind || ''))
        && effect?.valueClass === '倍率'
      ));
      if (!gainBuff) return;
      const durationEffect = normalizeArray(gainBuff.skill?.effects).find(effect => (
        String(effect?.condition || '').includes(`${resource.name}獲得時`)
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
    for (const resource of runtimeResources) {
      const valueKind = String(effect?.valueKind || '');
      if (valueKind === `${resource.name}獲得`) {
        return {
          resourceId: resource.id,
          operation: 'gain',
          amount: Math.max(0, toFiniteNumber(resolveEffectValue(effect, skillLevel)))
        };
      }
      if (String(declaredKind || '') === `${resource.name}消費`) {
        return {
          resourceId: resource.id,
          operation: 'consume',
          amount: 1
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
    if (actionKey === 'lowSkill' || actionKey === 'highSkill') value += toFiniteNumber(modifiers?.skillAddP);
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
      const stackable = application.effectStack !== false && durationEffect?.effectStack !== false;
      const maxStacks = Math.max(
        1,
        Math.floor(toFiniteNumber(application.maxStack ?? durationEffect?.maxStack, DEFAULT_STATUS_MAX_STACKS))
      );
      const explicitGroup = application.stackGroupId
        || durationEffect?.stackGroupId
        || application.processGroupId
        || durationEffect?.processGroupId
        || '';
      return {
        status,
        branch,
        applicationEffectId: application.effectId || '',
        durationEffectId: durationEffect?.effectId || '',
        durationFrames: durationSeconds > 0 ? durationSeconds * DEFAULT_FRAMES_PER_SECOND : null,
        stackable,
        maxStacks,
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
    return damageEffects.length === 1 ? damageEffects[0] : damageEffects[0] || null;
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
    return events.sort((a, b) => a.frame - b.frame || (
      toFiniteNumber(a.generatedInstanceOrder) - toFiniteNumber(b.generatedInstanceOrder)
    ));
  }

  function buildVariantEvents(apostle, skill, actionTiming, branch, motionFrames, warnings, suppressDamageFallback = false, statusDefinitions = [], runtimeResources = [], skillLevel = 1) {
    const selectedResourceBranch = runtimeResources.map(resource => {
      const match = String(branch || '').match(new RegExp(`^${resource.name}(\\d+)$`));
      return match ? { resource, count: Number(match[1]) } : null;
    }).find(Boolean);
    const selectedRows = normalizeArray(actionTiming?.timingEvents).filter(row => {
      const rowBranch = row.branch || '';
      if (rowBranch === '' || rowBranch === '共通' || rowBranch === branch) return true;
      if (!selectedResourceBranch) return false;
      const match = String(rowBranch).match(new RegExp(`^${selectedResourceBranch.resource.name}(\\d+)$`));
      return !!match && Number(match[1]) <= selectedResourceBranch.count;
    });
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

    rows.forEach(row => {
      const effect = resolveApostleEffect(apostle, skill, row.effectId);
      const declared = String(row.effectKind || '');
      const damage = effect
        ? isDamageEffect(effect)
        : isDeclaredDamageKind(declared) || (!declared && damageEffects.length > 0);
      const damageEffect = damage ? (effect || resolveRowDamageEffect(skill, row, branch)) : null;
      const statusApplication = statusDefinitions.find(item => item.applicationEffectId === row.effectId) || null;
      const resourceChange = getResourceChange(effect, declared, branch, runtimeResources, skillLevel);
      const repeatDamageCount = 1;
      if (row.effectId && !effect) warnings.push(`effectIdを解決できません: ${row.effectId}`);
      if (row.frame == null) {
        if (!damage && effect) {
          events.push({
            frame: motionFrames,
            type: 'effect',
            effectId: effect.effectId || '',
            effectType: effect.effectType || '',
            timingQuality: 'fallbackEnd',
            statusApplication,
            note: row.note || ''
          });
        }
        return;
      }
      events.push({
        frame: toFiniteNumber(row.frame),
        type: damage ? 'damage' : 'effect',
        effectId: row.effectId || (damage ? damageEffects[0]?.effectId : '') || '',
        effectType: effect?.effectType || (damage ? '攻撃' : ''),
        effectValueKind: effect?.valueKind || declared,
        hitCount: damage ? repeatDamageCount : 0,
        repeatDamageCount,
        lv1PerHitMultiplier: row.lv1PerHitMultiplier ?? null,
        coefficientShare: getCoefficientShare(damageEffect, row.lv1PerHitMultiplier),
        statusApplication,
        resourceChange,
        timingQuality: 'measured',
        note: row.note || ''
      });
      if (damage) observedDamageHits += 1;
    });

    const researchStatuses = new Set(rows.map(row => row.researchStatus).filter(Boolean));
    const complete = researchStatuses.size > 0 && [...researchStatuses].every(status => status === '済' || status === '完了');
    if (!suppressDamageFallback && totalHitCount > observedDamageHits) {
      if (complete && observedDamageHits > 0) {
        warnings.push(`${skill?.skillId || skill?.skillType}: 調査済ですがヒット数が不足しています (${observedDamageHits}/${totalHitCount})`);
      }
      events.push({
        frame: motionFrames,
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

    return events.sort((a, b) => a.frame - b.frame);
  }

  function buildAction(apostle, timing, actionKey, warnings, buildOptions = {}) {
    const actionTiming = timing?.actions?.[actionKey];
    const skill = findSkill(apostle, actionKey);
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
    const generatedBranches = generatedEvents
      .map(event => event.branch || '')
      .filter(branch => branch && branch !== '共通');
    const branchSource = motionBranches.length
      ? motionBranches
      : (timingBranches.length ? timingBranches : generatedBranches);
    const branches = [...new Set(branchSource)];
    if (!branches.length) branches.push('');
    const motionFramesByVariant = {};
    motionVariants.forEach(item => {
      motionFramesByVariant[item.branch || 'default'] = Math.max(0, toFiniteNumber(item.gameFrames));
    });
    const variants = {};
    branches.forEach(branch => {
      const variantMotionFrames = motionFramesByVariant[branch || 'default'] ?? motionFrames;
      variants[branch || 'default'] = buildVariantEvents(
        apostle,
        skill,
        actionTiming,
        branch,
        variantMotionFrames,
        warnings,
        hasGeneratedDamage,
        statusDefinitions,
        runtimeResources,
        skillLevel
      );
    });
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
    const triggerType = actionKey === 'enhancedAttack' ? String(skill.triggerType || '') : '';
    const triggerValue = actionKey === 'enhancedAttack' ? Math.max(0, toFiniteNumber(skill.triggerValue)) : 0;
    if (actionKey === 'enhancedAttack' && triggerType && !/^一定確率/.test(triggerType) && triggerType !== 'n回ごと') {
      warnings.push(`${skill.skillId || skill.skillType}: 強化攻撃条件「${triggerType}」の時系列自動判定は未実装です`);
    }
    return {
      key: actionKey,
      label: ACTION_LABELS[actionKey],
      skillId: skill.skillId || '',
      motionFrames,
      motionFramesByVariant,
      variants,
      generatedEvents,
      statusDefinitions,
      variantNames: branches.filter(Boolean),
      variantSelection: resourceVariant
        ? { type: 'resourceAfterGain', ...resourceVariant }
        : (generatedBranches.length
          ? {
              type: 'fixed',
              branch: branches.includes('中型敵') ? '中型敵' : branches[0]
            }
          : { type: 'random' }),
      triggerType,
      triggerValue,
      triggerProbability: /^一定確率/.test(triggerType) ? Math.min(100, triggerValue) : 0,
      triggerEveryCount: triggerType === 'n回ごと' ? Math.max(1, Math.floor(triggerValue || 1)) : 0,
      transitionFrames: actionKey === 'lowSkill' || actionKey === 'highSkill' ? 2 : 0,
      requiredSp: actionKey === 'lowSkill' ? Math.max(1, toFiniteNumber(skill.requiredSp, 300)) : 0,
      cooldownSeconds: actionKey === 'highSkill' ? Math.max(0, toFiniteNumber(skill.cooldownSeconds)) : 0
    };
  }

  function buildCombatantConfig(apostle, timing, buildOptions = {}) {
    const warnings = [];
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
        ...buildOptions,
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
      warnings.push(`${effect?.label || effect?.id || '効果'}: 発動元 ${triggerSourceId || '(未設定)'} の発生タイミングがないため行動単位で近似します`);
      return String(effect?.sourceEventFallbackMode || fallbackMode);
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
      stackable: !!effect?.stackable,
      resetActionKeys: normalizeArray(effect?.resetActionKeys).map(String),
      sourceEventFallbackMode: String(effect?.sourceEventFallbackMode || 'actionTimed')
    })).filter(effect => effect.id && effect.hasteP);
    const initialAttackSpeedP = attackSpeedEffects.reduce((total, effect) => (
      ['constant', 'initialTimed', 'manualInitialTimed'].includes(effect.mode)
        ? total + effect.hasteP
        : total
    ), 0);
    const spRegenEffects = normalizeArray(buildOptions.runtimeEffects?.spRegenEffects).map((effect, index) => ({
      id: String(effect?.id || `spRegen:${index}`),
      sourceId: String(effect?.sourceId || ''),
      label: String(effect?.label || effect?.id || '毎秒SP回復効果'),
      fixed: toFiniteNumber(effect?.fixed),
      percent: toFiniteNumber(effect?.percent)
    })).filter(effect => effect.fixed || effect.percent);
    const spRecoveryEffects = normalizeArray(buildOptions.runtimeEffects?.spRecoveryEffects).map((effect, index) => ({
      id: String(effect?.id || `spRecovery:${index}`),
      sourceId: String(effect?.sourceId || ''),
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
      label: String(effect?.label || effect?.id || '時限ダメージバフ'),
      mode: resolveSourceEventMode(effect, 'sourceEventTimed', 'actionTimed'),
      triggerActionKeys: normalizeArray(effect?.triggerActionKeys).map(String),
      triggerPhase: effect?.triggerPhase === 'end' ? 'end' : 'start',
      processGroupId: String(effect?.processGroupId || ''),
      triggerType: String(effect?.triggerType || ''),
      triggerValue: effect?.triggerValue ?? '',
      triggerSourceId: String(effect?.triggerSourceId || ''),
      conditionType: String(effect?.conditionType || ''),
      conditionValue: effect?.conditionValue ?? '',
      requiredStatus: String(effect?.requiredStatus || ''),
      requireSelfSource: !!effect?.requireSelfSource,
      durationFrames: Math.max(0, toFiniteNumber(effect?.durationFrames)),
      stackable: !!effect?.stackable,
      maxStacks: Math.max(1, Math.floor(toFiniteNumber(effect?.maxStacks, 1))),
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
      triggerSourceId: String(effect?.triggerSourceId || ''),
      triggerActionKeys: normalizeArray(effect?.triggerActionKeys).map(String),
      intervalFrames: Math.max(0, toFiniteNumber(effect?.intervalFrames)),
      oncePerAction: !!effect?.oncePerAction,
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
    return {
      apostleId: timing?.id || apostle?.id || '',
      name: timing?.name || apostle?.name || '',
      personality,
      initialActionDelayFrames: Math.max(0, toFiniteNumber(timing?.initialActionDelayFrames, 60)),
      normalAttackIntervalFrames,
      initialAttackSpeedP,
      initialNormalAttackIntervalFrames: normalAttackIntervalFrames / (1 + initialAttackSpeedP / 100),
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
        damageBuffEffects,
        eventEffects,
        initialTargetStatuses: normalizeArray(buildOptions.runtimeEffects?.initialTargetStatuses).map(item => ({
          status: String(item?.status || ''),
          sourceSelf: item?.sourceSelf !== false,
          reason: String(item?.reason || '')
        })).filter(item => item.status),
        statusReactions,
        damageEffectIds: normalizeArray(buildOptions.runtimeEffects?.damageEffectIds).map(String).filter(Boolean)
      },
      runtimeResources,
      actions,
      warnings
    };
  }

  function pickVariant(action, state, random) {
    const names = action?.variantNames || [];
    if (!names.length) return 'default';
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
    let effect = event.effectId ? variantProfile.effects?.[event.effectId] : null;
    if (!effect && event.effectId) {
      effect = effects.find(item => item?.effectId === event.effectId) || null;
    }
    if (!effect && event.effectValueKind) {
      const expectedKind = String(event.effectValueKind);
      effect = effects.find(item => {
        const actualKind = String(item?.valueKind || item?.kind || item?.label || '');
        return actualKind === expectedKind
          || actualKind.includes(expectedKind)
          || expectedKind.includes(actualKind);
      }) || null;
    }
    if (!effect && effects.length === 1) effect = effects[0];
    return effect;
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
      const effect = findEventDamageEffect(effects, variantProfile, event);
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
    const effect = findEventDamageEffect(effects, variantProfile, event);
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
    const modifierDelta = input.modifierDelta || {};
    const heldAddP = toFiniteNumber(input.heldAddP);
    const statusTakenDmgP = toFiniteNumber(input.statusTakenDmgP);
    const activeEffects = normalizeArray(input.activeEffects).map(effect => ({
      id: String(effect?.id || effect?.effectId || ''),
      label: String(effect?.label || ''),
      kind: String(effect?.kind || ''),
      modifiers: { ...(effect?.modifiers || {}) }
    }));
    const base = input.runtimeBase || null;
    const ratios = { attackDefense: 1, add: 1, special: 1, other: 1, critical: 1 };
    const attackP = getRuntimeAttackModifierP(modifierDelta, base?.damageType || '');
    const addP = getRuntimeAddModifierP(modifierDelta, actionKey) + heldAddP + statusTakenDmgP;
    const specialP = toFiniteNumber(modifierDelta.specialP);
    const otherP = toFiniteNumber(modifierDelta.otherP);
    const critP = toFiniteNumber(modifierDelta.critP);
    const critRateP = toFiniteNumber(modifierDelta.critRateP);
    const critDmgP = toFiniteNumber(modifierDelta.critDmgP);
    const critDmgAddP = toFiniteNumber(modifierDelta.critDmgAddP);
    const enemyDefDownP = toFiniteNumber(modifierDelta.enemyDefDownP);
    const enemyCritResDownP = toFiniteNumber(modifierDelta.enemyCritResDownP);
    const enemyCritDmgResDownP = toFiniteNumber(modifierDelta.enemyCritDmgResDownP);
    const hasModifier = !!(attackP || addP || specialP || otherP || critP || critRateP || critDmgP || critDmgAddP
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
        activeEffects,
        runtimeBaseAvailable: !!base
      };
    }
    if (!base) {
      ratios.add = 1 + addP / 100;
      return {
        baseExpectedDamage: expectedDamage,
        expectedDamage: expectedDamage * ratios.add,
        ratio: ratios.add,
        ratios,
        modifierDelta: { ...modifierDelta },
        heldAddP,
        statusTakenDmgP,
        activeEffects,
        runtimeBaseAvailable: false
      };
    }

    let ratio = 1;
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
      const oldCritRate = Math.max(0.05, Math.min(0.8, toFiniteNumber(base.critRate, 0.05)));
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
      const newCritRate = Math.max(0.05, Math.min(0.8,
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
      activeEffects,
      runtimeBaseAvailable: true
    };
  }

  function evaluateRuntimeDamage(expectedDamage, current, event, damageProfiles, state, config, runtimeBase = null) {
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
    return evaluateDamageAtHit({
      expectedDamage,
      actionKey: current?.key || '',
      modifierDelta,
      heldAddP,
      statusTakenDmgP,
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
    const highSkillMode = options.highSkillMode === 'auto' ? 'auto' : 'disabled';
    const initialHighSkillCooldownMultiplier = Math.max(
      0,
      toFiniteNumber(options.initialHighSkillCooldownMultiplier, 1)
    );
    const recurringHighSkillCooldownMultiplier = Math.max(
      0,
      toFiniteNumber(options.recurringHighSkillCooldownMultiplier, 1)
    );
    const damageProfiles = options.damageProfiles || {};
    const statusDamageProfiles = options.statusDamageProfiles || {};
    const resolveStatusDamage = typeof options.resolveStatusDamage === 'function'
      ? options.resolveStatusDamage
      : null;
    const recordTimeline = options.recordTimeline !== false;
    const timeline = [];
    const counts = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const hits = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const damagingActions = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const expectedDamageByAction = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const expectedDamageByStatus = Object.fromEntries(Object.keys(DOT_STATUS_MULTIPLIERS).map(status => [status, 0]));
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
      skillTransition: null,
      pendingGeneratedEvents: [],
      generatedAttackSpeedSnapshots: new Set(),
      actionSerial: 0,
      normalAttackSequence: 0,
      lastNormalAttackStartTick: null,
      runtimeAttackSpeedEffects: normalizeArray(config.runtimeEffects?.attackSpeedEffects).map(effect => ({
        ...effect,
        stackCount: ['constant', 'initialTimed', 'manualInitialTimed'].includes(effect.mode) ? 1 : 0,
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
      runtimeDamageBuffEffects: normalizeArray(config.runtimeEffects?.damageBuffEffects).map(effect => ({
        ...effect,
        lastActionInstanceId: null
      })),
      runtimeEventEffects: normalizeArray(config.runtimeEffects?.eventEffects).map(effect => ({
        ...effect,
        nextTick: effect.intervalFrames > 0 ? toTicks(effect.intervalFrames, ticksPerFrame) : Infinity,
        lastActionInstanceId: null
      })),
      runtimeResources: Object.fromEntries(normalizeArray(config.runtimeResources).map(resource => [
        resource.id,
        { ...resource, stacks: Math.max(0, toFiniteNumber(resource.initialStacks)) }
      ])),
      runtimeDamageEffectIds: normalizeArray(config.runtimeEffects?.damageEffectIds),
      runtimeBuffSerial: 0,
      runtimeBuffStacks: [],
      statusSerial: initialTargetStatuses.length,
      statusStacks: initialTargetStatuses,
      actionStartAllowedTick: initialActionDelayTicks,
      nextNormalAttackTick: initialActionDelayTicks,
      sp: Math.min(config.maxSp, config.initialSp),
      spRecoveryRemainingTicks: spTickInterval,
      lowSkillQueued: false,
      lowSkillReadyTick: null,
      highSkillReadyTick: highSkillMode === 'auto' && config.actions.highSkill?.cooldownSeconds
        ? toTicks(
            config.actions.highSkill.cooldownSeconds
              * initialHighSkillCooldownMultiplier
              * framesPerSecond,
            ticksPerFrame
          )
        : Infinity,
      lastSkillVariant: ''
    };

    const log = (type, detail = {}) => {
      if (!recordTimeline) return;
      if (timeline.length >= Math.max(100, toFiniteNumber(options.maxTimelineEvents, 2000))) return;
      timeline.push({ tick: state.tick, frame: state.tick / ticksPerFrame, type, ...detail });
    };

    initialTargetStatuses.forEach(stack => {
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
          return;
        }
        applySpRecoveryEffect(effect, `${effect.intervalFrames / framesPerSecond}秒ごと`);
        effect.nextTick += toTicks(effect.intervalFrames, ticksPerFrame);
        if (effect.mode === 'actionPeriodic' && effect.nextTick > effect.activeUntilTick) effect.nextTick = Infinity;
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
    };

    const applyAttackSpeedEffect = (effect, reason = '') => {
      const previousStackCount = effect.stackCount;
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
      if (effect.stackCount === previousStackCount && !effect.durationFrames) return;
      updateCurrentNormalAttackSchedule();
      log('attackSpeedApplied', {
        effectId: effect.id,
        sourceId: effect.sourceId,
        label: effect.label,
        reason,
        stackCount: effect.stackCount,
        maxStacks: effect.maxStacks,
        hastePerStackP: effect.hasteP,
        totalHasteP: getRuntimeAttackSpeedP(),
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
      if (definition.oncePerAction && owner?.instanceId === definition.lastActionInstanceId) return;
      definition.lastActionInstanceId = owner?.instanceId ?? definition.lastActionInstanceId;
      const matching = state.runtimeBuffStacks.filter(stack => (
        stack.kind === 'damageBuff' && stack.effectId === definition.id
      ));
      if (!definition.stackable) {
        state.runtimeBuffStacks = state.runtimeBuffStacks.filter(stack => (
          stack.kind !== 'damageBuff' || stack.effectId !== definition.id
        ));
      } else if (matching.length >= definition.maxStacks) {
        const oldest = matching.slice().sort((a, b) => (
          a.expireTick - b.expireTick || a.id - b.id
        ))[0];
        state.runtimeBuffStacks = state.runtimeBuffStacks.filter(stack => stack !== oldest);
      }
      state.runtimeBuffStacks.push({
        id: ++state.runtimeBuffSerial,
        kind: 'damageBuff',
        effectId: definition.id,
        sourceId: definition.sourceId,
        label: definition.label,
        modifiers: { ...definition.modifiers },
        appliedTick: state.tick,
        expireTick: definition.durationFrames > 0
          ? state.tick + toTicks(definition.durationFrames, ticksPerFrame)
          : Infinity
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
        applyRuntimeDamageBuff(effect, owner, `${owner.label}${phase === 'end' ? '終了時' : '発動時'}`);
      });
    };

    const triggerDamageBuffEffectsForHit = (owner, hitCount = 1) => {
      state.runtimeDamageBuffEffects.forEach(effect => {
        if (effect.mode !== 'actionHitTimed' || !effect.triggerActionKeys.includes(owner.key)) return;
        const applications = effect.stackable ? Math.max(1, Math.floor(toFiniteNumber(hitCount, 1))) : 1;
        for (let index = 0; index < applications; index += 1) {
          applyRuntimeDamageBuff(effect, owner, `${owner.label}命中時`);
        }
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
    };

    const resetRuntimeEffectsForAction = actionKey => {
      let changed = false;
      state.runtimeAttackSpeedEffects.forEach(effect => {
        if (!effect.resetActionKeys.includes(actionKey) || effect.stackCount <= 0) return;
        const previousStackCount = effect.stackCount;
        effect.stackCount = 0;
        effect.expireTicks = [];
        changed = true;
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

    const addRuntimeGainBuff = (resource, owner, gainedStacks = 1) => {
      const definition = resource?.gainBuff;
      if (!definition || !(definition.attackPPerStack > 0) || !(definition.durationFrames > 0)) return;
      const addCount = Math.max(0, Math.floor(toFiniteNumber(gainedStacks)));
      for (let index = 0; index < addCount; index += 1) {
        const matching = state.runtimeBuffStacks.filter(stack => stack.effectId === definition.id);
        if (matching.length >= definition.maxStacks) {
          const oldest = matching.slice().sort((a, b) => a.expireTick - b.expireTick || a.id - b.id)[0];
          state.runtimeBuffStacks = state.runtimeBuffStacks.filter(stack => stack !== oldest);
        }
        state.runtimeBuffStacks.push({
          id: ++state.runtimeBuffSerial,
          kind: 'resourceGain',
          effectId: definition.id,
          label: definition.label,
          attackP: definition.attackPPerStack,
          modifiers: { atkP: definition.attackPPerStack },
          appliedTick: state.tick,
          expireTick: state.tick + toTicks(definition.durationFrames, ticksPerFrame)
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
      if (change.operation === 'gain') {
        resource.stacks = Math.min(resource.maxStacks, before + Math.max(0, toFiniteNumber(change.amount)));
        if (resource.stacks > before) addRuntimeGainBuff(resource, owner, resource.stacks - before);
      } else if (change.operation === 'consume') {
        const amount = change.amount === 'all' ? before : Math.max(0, toFiniteNumber(change.amount));
        resource.stacks = Math.max(0, before - amount);
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
        maxStacks: resource.maxStacks
      });
    };

    const expireRuntimeBuffs = () => {
      const expired = state.runtimeBuffStacks.filter(stack => stack.expireTick <= state.tick);
      if (!expired.length) return;
      state.runtimeBuffStacks = state.runtimeBuffStacks.filter(stack => stack.expireTick > state.tick);
      expired.forEach(stack => {
        log('runtimeBuffExpired', {
          label: stack.label,
          stackCount: state.runtimeBuffStacks.filter(item => item.effectId === stack.effectId).length
        });
      });
    };

    const applyStatusApplication = (owner, application) => {
      if (!application?.status || !(application.durationFrames > 0)) return;
      trackedStatuses.add(application.status);
      const groupStacks = state.statusStacks.filter(stack => stack.stackGroupId === application.stackGroupId);
      if (!application.stackable) {
        state.statusStacks = state.statusStacks.filter(stack => stack.stackGroupId !== application.stackGroupId);
      } else if (groupStacks.length >= application.maxStacks) {
        const oldest = groupStacks.slice().sort((a, b) => (
          a.expireTick - b.expireTick || a.appliedTick - b.appliedTick || a.id - b.id
        ))[0];
        state.statusStacks = state.statusStacks.filter(stack => stack !== oldest);
      }
      const stack = {
        id: ++state.statusSerial,
        status: application.status,
        stackGroupId: application.stackGroupId,
        stackable: application.stackable,
        maxStacks: application.maxStacks,
        sourceActionKey: owner.key,
        sourceActionLabel: owner.label,
        sourceActionInstanceId: owner.instanceId,
        sourceRuntimeEffectId: owner.runtimeEffectId || '',
        sourceSelf: true,
        appliedTick: state.tick,
        expireTick: state.tick + toTicks(application.durationFrames, ticksPerFrame),
        nextTick: application.dealsPeriodicDamage
          ? state.tick + toTicks(application.tickFrames || STATUS_TICK_FRAMES, ticksPerFrame)
          : Infinity,
        tickMultiplier: application.tickMultiplier
      };
      state.statusStacks.push(stack);
      log('statusApplied', {
        actionKey: owner.key,
        actionLabel: owner.label,
        status: stack.status,
        stackCount: getActiveStatusStacks(stack.status).length,
        maxStacks: stack.maxStacks,
        durationFrames: application.durationFrames,
        timingQuality: application.timingQuality || ''
      });
    };

    const runtimeEventConditionMatches = effect => {
      const condition = effect.conditionResource;
      if (!condition?.id) return true;
      const stacks = toFiniteNumber(state.runtimeResources[condition.id]?.stacks);
      if (condition.min != null && stacks < condition.min) return false;
      if (condition.max != null && stacks > condition.max) return false;
      return true;
    };

    const executeRuntimeEventEffect = (definition, sourceOwner = null, reason = '') => {
      if (!definition || !runtimeEventConditionMatches(definition)) return false;
      const triggerCount = (runtimeEffectTriggerCounts[definition.id] || 0) + 1;
      runtimeEffectTriggerCounts[definition.id] = triggerCount;
      const owner = sourceOwner
        ? { ...sourceOwner, runtimeEffectId: definition.id }
        : {
            key: '',
            label: definition.label,
            variant: '',
            instanceId: `runtime:${definition.id}:${triggerCount}`,
            runtimeEffectId: definition.id
          };
      definition.steps.forEach(step => {
        if (step.type === 'resource') {
          applyResourceChange(owner, {
            resourceId: step.resourceId,
            operation: step.operation,
            amount: step.amount
          });
          return;
        }
        if (step.type === 'damage') {
          const damageEvaluation = evaluateRuntimeDamage(
            step.expectedDamage,
            owner,
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
      return true;
    };

    const triggerRuntimeEventEffectsForEvent = (owner, event) => {
      state.runtimeEventEffects.forEach(effect => {
        const normalAttackHit = effect.triggerType === '普通攻撃命中時'
          && event.type === 'damage'
          && effect.triggerActionKeys.includes(owner.key);
        const generatedHit = effect.triggerType === '生成物命中時'
          && event.type === 'damage'
          && event.generatedObjectId === effect.triggerSourceId;
        const generatedReturn = effect.triggerType === '生成物帰還時'
          && event.generatedObjectId === effect.triggerSourceId
          && /帰還/.test(String(event.generatedEventType || ''));
        if (!normalAttackHit && !generatedHit && !generatedReturn) return;
        if (effect.oncePerAction && effect.lastActionInstanceId === owner.instanceId) return;
        if (executeRuntimeEventEffect(effect, owner, `${effect.triggerType} / ${effect.triggerSourceId || owner.label}`)) {
          effect.lastActionInstanceId = owner.instanceId;
        }
      });
    };

    const processPeriodicRuntimeEventEffects = () => {
      state.runtimeEventEffects.forEach(effect => {
        if (effect.triggerType !== 'n秒ごと' || effect.nextTick !== state.tick) return;
        executeRuntimeEventEffect(effect, null, `${effect.intervalFrames / framesPerSecond}秒ごと`);
        effect.nextTick += toTicks(effect.intervalFrames, ticksPerFrame);
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
        if (expectedDamage > 0 && !damagedActionInstances.has(owner.instanceId)) {
          damagedActionInstances.add(owner.instanceId);
          damagingActions[owner.key] += 1;
        }
      }
      log(event.type === 'damage' ? 'hit' : 'effect', {
        actionKey: owner.key,
        actionLabel: owner.label,
        variant: owner.variant,
        effectId: event.effectId,
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
          profile.damageResult?.runtimeBase || null
        );
        const expectedDamage = damageEvaluation.expectedDamage;
        if (stack.sourceRuntimeEffectId) {
          expectedDamageByRuntimeEffect[stack.sourceRuntimeEffectId] =
            toFiniteNumber(expectedDamageByRuntimeEffect[stack.sourceRuntimeEffectId]) + expectedDamage;
        } else if (Object.prototype.hasOwnProperty.call(expectedDamageByAction, stack.sourceActionKey)) {
          expectedDamageByAction[stack.sourceActionKey] += expectedDamage;
        }
        expectedDamageByStatus[stack.status] += expectedDamage;
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
          damageEvaluation,
          tickMultiplier: stack.tickMultiplier
        });
        stack.nextTick += toTicks(STATUS_TICK_FRAMES, ticksPerFrame);
      });
    };

    const expireStatuses = () => {
      const expiring = state.statusStacks.filter(stack => stack.expireTick <= state.tick);
      state.statusStacks = state.statusStacks.filter(stack => stack.expireTick > state.tick);
      expiring.forEach(stack => {
        log('statusExpired', {
          actionKey: stack.sourceActionKey,
          actionLabel: stack.sourceActionLabel,
          status: stack.status,
          stackCount: getActiveStatusStacks(stack.status).length
        });
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
      const due = state.pendingGeneratedEvents.filter(pending => pending.absoluteTick === state.tick);
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
            state.pendingGeneratedEvents.push({
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
        if (pending.emitted || pending.absoluteTick !== state.tick) return;
        pending.emitted = true;
        emitEvent(pending.owner, pending.event);
      });
      state.pendingGeneratedEvents = state.pendingGeneratedEvents.filter(pending => !pending.emitted && !pending.cancelled);
    };

    const startAction = actionKey => {
      const action = config.actions[actionKey];
      if (!action) return false;
      if (actionKey === 'lowSkill') resetRuntimeEffectsForAction(actionKey);
      triggerAttackSpeedEffectsForAction(actionKey);
      const variant = pickVariant(action, state, random);
      const sourceEvents = action.variants[variant] || action.variants.default || [];
      const baseMotionFrames = action.motionFramesByVariant?.[variant] ?? action.motionFrames;
      const normalAttack = actionKey === 'basicAttack' || actionKey === 'enhancedAttack';
      const motionScale = normalAttack && baseMotionFrames > 0
        ? Math.min(1, getEffectiveNormalAttackIntervalFrames() / baseMotionFrames)
        : 1;
      const motionFrames = baseMotionFrames * motionScale;
      const instanceId = ++state.actionSerial;
      state.currentAction = {
        key: actionKey,
        label: action.label,
        variant: variant === 'default' ? '' : variant,
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
        instanceId,
        startTick: state.tick,
        events: generatedRuntimeEvents
      };
      generatedRuntimeEvents.forEach(event => {
        state.pendingGeneratedEvents.push({
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
      } else if (actionKey === 'lowSkill') {
        state.sp = config.lowSkillSpPolicy === 'consume'
          ? Math.max(0, state.sp - config.requiredSp)
          : 0;
        state.lowSkillQueued = false;
        state.lowSkillReadyTick = null;
      } else if (actionKey === 'highSkill' && action.cooldownSeconds > 0) {
        state.highSkillReadyTick = state.tick + toTicks(
          action.cooldownSeconds * recurringHighSkillCooldownMultiplier * framesPerSecond,
          ticksPerFrame
        );
      }
      log('actionStart', {
        actionKey,
        actionLabel: action.label,
        variant: state.currentAction.variant,
        sp: state.sp,
        attackSpeedP: getRuntimeAttackSpeedP(),
        normalAttackIntervalFrames: getEffectiveNormalAttackIntervalFrames(),
        motionScale,
        motionFrames
      });
      triggerSpRecoveryEffectsForAction(state.currentAction, 'start');
      emitDueActionEvents();
      emitDueGeneratedEvents();
      return true;
    };

    const beginSkillTransition = actionKey => {
      const action = config.actions[actionKey];
      if (!action) return false;
      const transitionFrames = Math.max(0, toFiniteNumber(action.transitionFrames, 2));
      if (transitionFrames <= 0) return startAction(actionKey);
      state.skillTransition = {
        actionKey,
        readyTick: state.tick + toTicks(transitionFrames, ticksPerFrame)
      };
      log('skillTransition', {
        actionKey,
        actionLabel: action.label,
        transitionFrames
      });
      return true;
    };

    const tryStartNormalAttack = () => {
      if (state.tick < state.nextNormalAttackTick) return false;
      state.normalAttackSequence += 1;
      triggerAttackSpeedEffectsForNormalAttackCount();
      const enhancedAction = config.actions.enhancedAttack;
      const enhanced = !!enhancedAction && (
        enhancedAction.triggerEveryCount > 0
          ? state.normalAttackSequence % enhancedAction.triggerEveryCount === 0
          : enhancedAction.triggerProbability > 0 && random() * 100 < enhancedAction.triggerProbability
      );
      return startAction(enhanced ? 'enhancedAttack' : 'basicAttack');
    };

    const tryStartAction = () => {
      if (state.currentAction || state.skillTransition) return;
      if (state.tick < state.actionStartAllowedTick) return;
      if (state.lowSkillQueued && state.lowSkillReadyTick < state.tick && beginSkillTransition('lowSkill')) return;
      if (state.lowSkillQueued && state.lowSkillReadyTick === state.tick) {
        if (tryStartNormalAttack()) return;
        if (beginSkillTransition('lowSkill')) return;
      }
      if (highSkillMode === 'auto' && state.tick >= state.highSkillReadyTick && beginSkillTransition('highSkill')) return;
      if (tryStartNormalAttack()) return;
      if (state.lowSkillQueued) beginSkillTransition('lowSkill');
    };

    state.runtimeAttackSpeedEffects.filter(effect => effect.stackCount > 0).forEach(effect => {
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
      .filter(effect => effect.mode === 'initialTimed')
      .forEach(effect => applyRuntimeDamageBuff(effect, null, '戦闘開始時'));
    state.runtimeSpRecoveryEffects
      .filter(effect => effect.mode === 'initial' || effect.mode === 'manualInitial')
      .forEach(effect => applySpRecoveryEffect(
        effect,
        effect.mode === 'manualInitial' ? '手動効果を戦闘開始時に仮適用' : '戦闘開始時'
      ));

    for (state.tick = 0; state.tick <= durationTicks; state.tick += 1) {
      expireAttackSpeedEffects();
      processRuntimeAttackSpeedStacks();
      expireRuntimeBuffs();
      const pausesSpRecovery = state.currentAction?.key === 'lowSkill'
        || state.skillTransition?.actionKey === 'lowSkill';
      if (state.tick > 0 && !pausesSpRecovery && config.spRegen > 0) {
        state.spRecoveryRemainingTicks -= 1;
      }
      if (state.tick > 0 && state.spRecoveryRemainingTicks <= 0 && config.spRegen > 0) {
        state.spRecoveryRemainingTicks += spTickInterval;
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
        log('actionEnd', { actionKey: finished.key, actionLabel: finished.label, variant: finished.variant });
        triggerSpRecoveryEffectsForAction(finished, 'end');
        state.currentAction = null;
        triggerAttackSpeedEffectsForAction(finished.key, 'end');
        triggerDamageBuffEffectsForAction(finished, 'end');
        if (finished.key === 'lowSkill') {
          state.nextNormalAttackTick = state.tick;
        }
      }
      if (state.skillTransition && state.skillTransition.readyTick === state.tick) {
        const actionKey = state.skillTransition.actionKey;
        state.skillTransition = null;
        startAction(actionKey);
      }
      tryStartAction();
    }

    return {
      durationSeconds,
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
        byRuntimeEffect: expectedDamageByRuntimeEffect
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
        damageBuffEffects: state.runtimeDamageBuffEffects.map(effect => ({
          id: effect.id,
          label: effect.label,
          mode: effect.mode,
          triggerActionKeys: effect.triggerActionKeys,
          triggerPhase: effect.triggerPhase,
          durationFrames: effect.durationFrames,
          stackable: effect.stackable,
          maxStacks: effect.maxStacks,
          modifiers: { ...effect.modifiers }
        })),
        eventEffects: state.runtimeEventEffects.map(effect => ({
          id: effect.id,
          label: effect.label,
          triggerType: effect.triggerType,
          triggerCount: runtimeEffectTriggerCounts[effect.id] || 0,
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
        skillTransition: state.skillTransition ? { ...state.skillTransition } : null,
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
    const trials = Math.max(1, Math.min(4096, Math.floor(toFiniteNumber(options.trials, 64))));
    const baseSeed = Math.max(1, Math.floor(toFiniteNumber(options.seed, 1)));
    const durationSeconds = Math.max(1, Math.min(600, toFiniteNumber(options.durationSeconds, 60)));
    const actionKeys = Object.keys(ACTION_SKILL_TYPES);
    const totals = {
      damage: 0,
      counts: Object.fromEntries(actionKeys.map(key => [key, 0])),
      hits: Object.fromEntries(actionKeys.map(key => [key, 0])),
      damagingActions: Object.fromEntries(actionKeys.map(key => [key, 0])),
      damageByAction: Object.fromEntries(actionKeys.map(key => [key, 0])),
      damageByStatus: Object.fromEntries(Object.keys(DOT_STATUS_MULTIPLIERS).map(status => [status, 0])),
      damageByRuntimeEffect: Object.fromEntries(normalizeArray(config.runtimeEffects?.eventEffects)
        .map(effect => [effect.id, 0])),
      runtimeEffectTriggers: Object.fromEntries(normalizeArray(config.runtimeEffects?.eventEffects)
        .map(effect => [effect.id, 0]))
    };
    const trialResults = [];
    for (let index = 0; index < trials; index += 1) {
      const seed = baseSeed + index;
      const result = simulate(config, {
        ...options,
        seed,
        durationSeconds,
        recordTimeline: false
      });
      const totalDamage = toFiniteNumber(result.damage?.totalExpectedDamage);
      const totalDps = totalDamage / durationSeconds;
      totals.damage += totalDamage;
      actionKeys.forEach(key => {
        totals.counts[key] += toFiniteNumber(result.counts?.[key]);
        totals.hits[key] += toFiniteNumber(result.hits?.[key]);
        totals.damagingActions[key] += toFiniteNumber(result.damagingActions?.[key]);
        totals.damageByAction[key] += toFiniteNumber(result.damage?.byAction?.[key]);
      });
      Object.keys(DOT_STATUS_MULTIPLIERS).forEach(status => {
        totals.damageByStatus[status] += toFiniteNumber(result.damage?.byStatus?.[status]);
      });
      normalizeArray(config.runtimeEffects?.eventEffects).forEach(effect => {
        totals.damageByRuntimeEffect[effect.id] = toFiniteNumber(totals.damageByRuntimeEffect[effect.id])
          + toFiniteNumber(result.damage?.byRuntimeEffect?.[effect.id]);
        const runtimeResult = normalizeArray(result.runtimeEffects?.eventEffects)
          .find(item => item.id === effect.id);
        totals.runtimeEffectTriggers[effect.id] = toFiniteNumber(totals.runtimeEffectTriggers[effect.id])
          + toFiniteNumber(runtimeResult?.triggerCount);
      });
      trialResults.push({ seed, totalDps });
    }
    const totalDpsValues = trialResults.map(item => item.totalDps);
    const meanDps = totals.damage / trials / durationSeconds;
    const byAction = Object.fromEntries(actionKeys.map(key => {
      const expectedDamage = totals.damageByAction[key] / trials;
      const contributionDps = expectedDamage / durationSeconds;
      return [key, {
        expectedDamage,
        contributionDps,
        damageShareP: totals.damage > 0 ? totals.damageByAction[key] / totals.damage * 100 : 0,
        averageStarts: totals.counts[key] / trials,
        averageDamagingActions: totals.damagingActions[key] / trials,
        averageHits: totals.hits[key] / trials,
        averageDamagePerDamagingAction: totals.damagingActions[key] > 0 ? totals.damageByAction[key] / totals.damagingActions[key] : 0
      }];
    }));
    const medianDps = percentile(totalDpsValues, 0.5);
    const byStatus = Object.fromEntries(Object.keys(DOT_STATUS_MULTIPLIERS).map(status => {
      const expectedDamage = totals.damageByStatus[status] / trials;
      return [status, {
        expectedDamage,
        contributionDps: expectedDamage / durationSeconds,
        damageShareP: totals.damage > 0 ? totals.damageByStatus[status] / totals.damage * 100 : 0
      }];
    }));
    const byRuntimeEffect = Object.fromEntries(normalizeArray(config.runtimeEffects?.eventEffects)
      .map(effect => {
        const expectedDamage = toFiniteNumber(totals.damageByRuntimeEffect[effect.id]) / trials;
        const averageTriggers = toFiniteNumber(totals.runtimeEffectTriggers[effect.id]) / trials;
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
    return {
      trials,
      baseSeed,
      durationSeconds,
      meanDps,
      totalExpectedDamage: totals.damage / trials,
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

  return Object.freeze({
    version: 11,
    buildCombatantConfig,
    createSeededRandom,
    evaluateDamageAtHit,
    simulate,
    simulateMany,
    toTicks
  });
});
