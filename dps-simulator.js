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

  function buildVariantEvents(skill, actionTiming, branch, motionFrames, warnings) {
    const rows = normalizeArray(actionTiming?.timingEvents).filter(row => (row.branch || '') === branch);
    const damageEffects = getDamageEffects(skill, branch);
    const totalHitCount = getTotalHitCount(skill, branch);
    const events = [];
    let observedDamageHits = 0;

    if (damageEffects.length > 1 && !rows.some(row => row.effectId)) {
      warnings.push(`${skill?.skillId || skill?.skillType}: 複数ダメージ効果のヒット配分が未調査です`);
    }

    rows.forEach(row => {
      const effect = resolveEffect(skill, row.effectId);
      const damage = effect ? isDamageEffect(effect) : damageEffects.length > 0;
      if (row.effectId && !effect) warnings.push(`effectIdを解決できません: ${row.effectId}`);
      if (row.frame == null) {
        if (!damage && effect) {
          events.push({
            frame: motionFrames,
            type: 'effect',
            effectId: effect.effectId || '',
            effectType: effect.effectType || '',
            timingQuality: 'fallbackEnd',
            note: row.note || ''
          });
        }
        return;
      }
      events.push({
        frame: toFiniteNumber(row.frame),
        type: damage ? 'damage' : 'effect',
        effectId: row.effectId || damageEffects[0]?.effectId || '',
        effectType: effect?.effectType || (damage ? '攻撃' : ''),
        hitCount: damage ? 1 : 0,
        lv1PerHitMultiplier: row.lv1PerHitMultiplier ?? null,
        timingQuality: 'measured',
        note: row.note || ''
      });
      if (damage) observedDamageHits += 1;
    });

    const researchStatuses = new Set(rows.map(row => row.researchStatus).filter(Boolean));
    const complete = researchStatuses.size > 0 && [...researchStatuses].every(status => status === '済' || status === '完了');
    if (totalHitCount > observedDamageHits) {
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

    return events.sort((a, b) => a.frame - b.frame);
  }

  function buildAction(apostle, timing, actionKey, warnings) {
    const actionTiming = timing?.actions?.[actionKey];
    const skill = findSkill(apostle, actionKey);
    if (!actionTiming || !skill) return null;
    const motionFrames = toFiniteNumber(actionTiming.motionFrames);
    if (!(motionFrames > 0)) return null;
    const hasRepeatCount = normalizeArray(skill.effects).some(effect => effect?.valueKind === '繰り返し回数');
    const hasHitCount = normalizeArray(skill.effects).some(effect => effect?.effectType === '攻撃' && effect?.valueClass === 'ヒット数');
    if (hasRepeatCount && !hasHitCount) {
      warnings.push(`${skill.skillId || skill.skillType}: 繰り返し回数を総ヒット数へ変換する規則が未確定です`);
    }
    const branches = [...new Set(normalizeArray(actionTiming.timingEvents).map(row => row.branch || ''))];
    if (!branches.length) branches.push('');
    const variants = {};
    branches.forEach(branch => {
      variants[branch || 'default'] = buildVariantEvents(skill, actionTiming, branch, motionFrames, warnings);
    });
    return {
      key: actionKey,
      label: ACTION_LABELS[actionKey],
      skillId: skill.skillId || '',
      motionFrames,
      variants,
      variantNames: branches.filter(Boolean),
      triggerProbability: actionKey === 'enhancedAttack' ? Math.max(0, Math.min(100, toFiniteNumber(skill.triggerValue))) : 0,
      requiredSp: actionKey === 'lowSkill' ? Math.max(1, toFiniteNumber(skill.requiredSp, 300)) : 0,
      cooldownSeconds: actionKey === 'highSkill' ? Math.max(0, toFiniteNumber(skill.cooldownSeconds)) : 0
    };
  }

  function buildCombatantConfig(apostle, timing) {
    const warnings = [];
    const actions = {};
    Object.keys(ACTION_SKILL_TYPES).forEach(actionKey => {
      const action = buildAction(apostle, timing, actionKey, warnings);
      if (action) actions[actionKey] = action;
    });
    return {
      apostleId: timing?.id || apostle?.id || '',
      name: timing?.name || apostle?.name || '',
      initialActionDelayFrames: Math.max(0, toFiniteNumber(timing?.initialActionDelayFrames, 60)),
      normalAttackIntervalFrames: Math.max(1, toFiniteNumber(timing?.normalAttackIntervalFrames, 60)),
      initialSp: Math.max(0, toFiniteNumber(apostle?.basic?.initialSp)),
      spRegen: Math.max(0, toFiniteNumber(apostle?.basic?.spRecoveryPerSecond)),
      spRecoveryIntervalFrames: Math.max(1, toFiniteNumber(timing?.spRecoveryIntervalFrames, 60)),
      requiredSp: Math.max(1, actions.lowSkill?.requiredSp || 300),
      maxSp: Math.max(1, actions.lowSkill?.requiredSp || 300),
      lowSkillSpPolicy: 'reset',
      actions,
      warnings
    };
  }

  function pickVariant(action, state, random) {
    const names = action?.variantNames || [];
    if (!names.length) return 'default';
    if (action.key === 'lowSkill') {
      const selected = names[Math.min(names.length - 1, Math.floor(random() * names.length))];
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

  function getEventExpectedDamage(current, event, damageProfiles) {
    const variantProfile = getVariantDamageProfile(damageProfiles, current?.key, current?.variant);
    if (!variantProfile) return 0;
    const effects = Object.values(variantProfile.effects || {});
    const damageEvents = current.events.filter(candidate => candidate.type === 'damage');
    if (damageEvents.length === 1 && effects.length > 1) {
      return Math.max(0, toFiniteNumber(variantProfile.totalExpectedDamage));
    }
    let effect = event.effectId ? variantProfile.effects?.[event.effectId] : null;
    if (!effect && event.effectId) {
      effect = effects.find(item => item?.effectId === event.effectId) || null;
    }
    if (!effect && effects.length === 1) effect = effects[0];
    if (!effect) return 0;
    const siblingEvents = current.events.filter(candidate => {
      if (candidate.type !== 'damage') return false;
      if (event.effectId) return candidate.effectId === event.effectId;
      return true;
    });
    const totalWeight = siblingEvents.reduce((total, candidate) => total + Math.max(1, candidate.hitCount || 1), 0) || 1;
    const eventWeight = Math.max(1, event.hitCount || 1);
    return Math.max(0, toFiniteNumber(effect.expectedDamage)) * eventWeight / totalWeight;
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
    const recordTimeline = options.recordTimeline !== false;
    const timeline = [];
    const counts = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const hits = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const damagingActions = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const expectedDamageByAction = { basicAttack: 0, enhancedAttack: 0, lowSkill: 0, highSkill: 0 };
    const state = {
      tick: 0,
      currentAction: null,
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

    const emitDueActionEvents = () => {
      const current = state.currentAction;
      if (!current) return;
      current.events.forEach(event => {
        if (event.emitted || current.startTick + event.relativeTick !== state.tick) return;
        event.emitted = true;
        const expectedDamage = event.type === 'damage'
          ? getEventExpectedDamage(current, event, damageProfiles)
          : 0;
        if (event.type === 'damage') {
          hits[current.key] += Math.max(1, event.hitCount || 1);
          expectedDamageByAction[current.key] += expectedDamage;
          if (expectedDamage > 0 && !current.hasExpectedDamage) {
            current.hasExpectedDamage = true;
            damagingActions[current.key] += 1;
          }
        }
        log(event.type === 'damage' ? 'hit' : 'effect', {
          actionKey: current.key,
          actionLabel: current.label,
          variant: current.variant,
          effectId: event.effectId,
          hitCount: event.hitCount || 0,
          expectedDamage,
          timingQuality: event.timingQuality,
          note: event.note || ''
        });
      });
    };

    const startAction = actionKey => {
      const action = config.actions[actionKey];
      if (!action) return false;
      const variant = pickVariant(action, state, random);
      const sourceEvents = action.variants[variant] || action.variants.default || [];
      state.currentAction = {
        key: actionKey,
        label: action.label,
        variant: variant === 'default' ? '' : variant,
        startTick: state.tick,
        endTick: state.tick + Math.max(1, toTicks(action.motionFrames, ticksPerFrame)),
        events: sourceEvents.map(event => ({
          ...event,
          relativeTick: toTicks(event.frame, ticksPerFrame),
          emitted: false
        })),
        hasExpectedDamage: false
      };
      counts[actionKey] += 1;
      if (actionKey === 'basicAttack' || actionKey === 'enhancedAttack') {
        state.nextNormalAttackTick = state.tick + toTicks(config.normalAttackIntervalFrames, ticksPerFrame);
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
      log('actionStart', { actionKey, actionLabel: action.label, variant: state.currentAction.variant, sp: state.sp });
      emitDueActionEvents();
      return true;
    };

    const tryStartNormalAttack = () => {
      if (state.tick < state.nextNormalAttackTick) return false;
      const enhanced = config.actions.enhancedAttack
        && random() * 100 < config.actions.enhancedAttack.triggerProbability;
      return startAction(enhanced ? 'enhancedAttack' : 'basicAttack');
    };

    const tryStartAction = () => {
      if (state.currentAction) return;
      if (state.tick < state.actionStartAllowedTick) return;
      if (state.lowSkillQueued && state.lowSkillReadyTick < state.tick && startAction('lowSkill')) return;
      if (state.lowSkillQueued && state.lowSkillReadyTick === state.tick) {
        if (tryStartNormalAttack()) return;
        if (startAction('lowSkill')) return;
      }
      if (highSkillMode === 'auto' && state.tick >= state.highSkillReadyTick && startAction('highSkill')) return;
      if (tryStartNormalAttack()) return;
      if (state.lowSkillQueued) startAction('lowSkill');
    };

    for (state.tick = 0; state.tick <= durationTicks; state.tick += 1) {
      const pausesSpRecovery = state.currentAction?.key === 'lowSkill';
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
        if (!state.lowSkillQueued && state.sp >= config.requiredSp) {
          state.lowSkillQueued = true;
          state.lowSkillReadyTick = state.tick;
          log('lowSkillReady', { sp: state.sp });
        }
      }
      emitDueActionEvents();
      if (state.currentAction && state.currentAction.endTick === state.tick) {
        const finished = state.currentAction;
        log('actionEnd', { actionKey: finished.key, actionLabel: finished.label, variant: finished.variant });
        state.currentAction = null;
        if (finished.key === 'lowSkill') {
          state.nextNormalAttackTick = state.tick;
        }
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
        totalExpectedDamage: Object.values(expectedDamageByAction).reduce((total, value) => total + value, 0),
        byAction: expectedDamageByAction
      },
      timeline,
      finalState: {
        sp: state.sp,
        spRecoveryRemainingFrames: state.spRecoveryRemainingTicks / ticksPerFrame,
        lowSkillQueued: state.lowSkillQueued,
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
      damageByAction: Object.fromEntries(actionKeys.map(key => [key, 0]))
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
      byAction
    };
  }

  return Object.freeze({
    version: 2,
    buildCombatantConfig,
    createSeededRandom,
    simulate,
    simulateMany,
    toTicks
  });
});
