(function (root, factory) {
  'use strict';

  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_SP_ENGINE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULT_REQUIRED_SP = 300;
  const TICK_EPSILON = 1e-9;

  function toNonNegativeNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.max(0, numeric) : fallback;
  }

  function toPositiveNumber(value, fallback) {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
  }

  function normalizeConfig(config = {}) {
    const requiredSp = toPositiveNumber(config.requiredSp, DEFAULT_REQUIRED_SP);
    const maxSp = Math.max(requiredSp, toPositiveNumber(config.maxSp, requiredSp));
    return {
      initialSp: Math.min(maxSp, toNonNegativeNumber(config.initialSp)),
      spRegen: toNonNegativeNumber(config.spRegen),
      requiredSp,
      maxSp
    };
  }

  function createState(config = {}) {
    const normalized = normalizeConfig(config);
    const currentSp = config.currentSp === undefined
      ? normalized.initialSp
      : Math.min(normalized.maxSp, toNonNegativeNumber(config.currentSp));
    return {
      ...normalized,
      currentSp,
      elapsedSeconds: toNonNegativeNumber(config.elapsedSeconds)
    };
  }

  function advance(state, elapsedSeconds) {
    const current = createState(state);
    const seconds = toNonNegativeNumber(elapsedSeconds);
    const nextElapsedSeconds = current.elapsedSeconds + seconds;
    const elapsedTicks = Math.max(
      0,
      Math.floor(nextElapsedSeconds + TICK_EPSILON) - Math.floor(current.elapsedSeconds + TICK_EPSILON)
    );
    return {
      ...current,
      currentSp: Math.min(current.maxSp, current.currentSp + current.spRegen * elapsedTicks),
      elapsedSeconds: nextElapsedSeconds
    };
  }

  function isReady(state) {
    const current = createState(state);
    return current.currentSp >= current.requiredSp;
  }

  function timeToReady(state) {
    const current = createState(state);
    if (isReady(current)) return 0;
    if (current.spRegen <= 0) return Infinity;
    const requiredTicks = Math.ceil((current.requiredSp - current.currentSp) / current.spRegen);
    const nearestSecond = Math.round(current.elapsedSeconds);
    const normalizedElapsed = Math.abs(current.elapsedSeconds - nearestSecond) < TICK_EPSILON
      ? nearestSecond
      : current.elapsedSeconds;
    const elapsedFraction = normalizedElapsed - Math.floor(normalizedElapsed);
    const secondsToNextTick = elapsedFraction > TICK_EPSILON ? 1 - elapsedFraction : 1;
    return secondsToNextTick + requiredTicks - 1;
  }

  function spend(state, amount) {
    const current = createState(state);
    const cost = amount === undefined
      ? current.requiredSp
      : toNonNegativeNumber(amount);
    if (cost > current.currentSp) return { ...current, spent: false, spentSp: 0 };
    return {
      ...current,
      currentSp: current.currentSp - cost,
      spent: true,
      spentSp: cost
    };
  }

  function recover(state, amountSp) {
    const current = createState(state);
    const amount = toNonNegativeNumber(amountSp);
    return {
      ...current,
      currentSp: Math.min(current.maxSp, current.currentSp + amount),
      recoveredSp: amount
    };
  }

  function normalizeRecoveryEvents(events = []) {
    return (Array.isArray(events) ? events : [])
      .map(event => {
        const intervalSeconds = toPositiveNumber(event?.intervalSeconds, 0);
        if (!intervalSeconds) return null;
        return {
          intervalSeconds,
          startSeconds: toPositiveNumber(event?.startSeconds, intervalSeconds),
          amountSp: toNonNegativeNumber(event?.amountSp),
          source: String(event?.source || '')
        };
      })
      .filter(event => event && event.amountSp > 0);
  }

  function countEventOccurrences(event, elapsedSeconds) {
    const elapsed = toNonNegativeNumber(elapsedSeconds);
    if (elapsed + TICK_EPSILON < event.startSeconds) return 0;
    return Math.floor((elapsed - event.startSeconds + TICK_EPSILON) / event.intervalSeconds) + 1;
  }

  function advanceWithEvents(state, elapsedSeconds, events = []) {
    const current = createState(state);
    const next = advance(current, elapsedSeconds);
    const recoveredSp = normalizeRecoveryEvents(events).reduce((total, event) => {
      const count = countEventOccurrences(event, next.elapsedSeconds)
        - countEventOccurrences(event, current.elapsedSeconds);
      return total + event.amountSp * Math.max(0, count);
    }, 0);
    return recoveredSp > 0 ? recover(next, recoveredSp) : next;
  }

  function getNextRecoveryTime(state, events = []) {
    const current = createState(state);
    const candidates = [];
    if (current.spRegen > 0) candidates.push(Math.floor(current.elapsedSeconds + TICK_EPSILON) + 1);
    normalizeRecoveryEvents(events).forEach(event => {
      if (current.elapsedSeconds + TICK_EPSILON < event.startSeconds) {
        candidates.push(event.startSeconds);
        return;
      }
      const completedIntervals = Math.floor(
        (current.elapsedSeconds - event.startSeconds + TICK_EPSILON) / event.intervalSeconds
      );
      candidates.push(event.startSeconds + (completedIntervals + 1) * event.intervalSeconds);
    });
    return candidates.length ? Math.min(...candidates) : Infinity;
  }

  function waitUntilReady(state, events = [], maxSeconds = 3600) {
    let current = createState(state);
    if (isReady(current)) return { seconds: 0, state: current };
    const startedAt = current.elapsedSeconds;
    const deadline = startedAt + toPositiveNumber(maxSeconds, 3600);
    for (let step = 0; step < 10000; step += 1) {
      const nextTime = getNextRecoveryTime(current, events);
      if (!Number.isFinite(nextTime) || nextTime > deadline + TICK_EPSILON) break;
      current = advanceWithEvents(current, Math.max(0, nextTime - current.elapsedSeconds), events);
      if (isReady(current)) return { seconds: current.elapsedSeconds - startedAt, state: current };
    }
    return { seconds: Infinity, state: current };
  }

  function getCycleWithEvents(config = {}, events = [], options = {}) {
    const initial = recover(createState(config), options.initialRecoverySp);
    const first = waitUntilReady(initial, events, options.maxSeconds);
    if (!Number.isFinite(first.seconds)) {
      return { ...initial, firstReadySeconds: Infinity, refillSeconds: Infinity };
    }
    const afterCast = spend(first.state);
    const refill = waitUntilReady(afterCast, events, options.maxSeconds);
    return {
      ...initial,
      firstReadySeconds: first.seconds,
      refillSeconds: refill.seconds
    };
  }

  function getNaturalCycle(config = {}) {
    const initial = createState(config);
    const afterCast = createState({ ...initial, currentSp: 0, elapsedSeconds: 0 });
    return {
      ...initial,
      firstReadySeconds: timeToReady(initial),
      refillSeconds: timeToReady(afterCast)
    };
  }

  function createApostleState(apostleOrBasic = {}, snapshot = {}, options = {}) {
    const basic = apostleOrBasic.basic || apostleOrBasic;
    const snapshotStats = snapshot.stats || snapshot;
    return createState({
      initialSp: options.initialSp
        ?? basic.initialSp
        ?? basic['初期SP'],
      spRegen: options.spRegen
        ?? snapshotStats.spRegen
        ?? basic.spRecoveryPerSecond
        ?? basic['毎秒SP回復量'],
      requiredSp: options.requiredSp
        ?? basic.requiredSp
        ?? basic.lowGradeRequiredSp
        ?? basic['低学年スキル必要SP'],
      maxSp: options.maxSp
        ?? basic.maxSp
        ?? basic['最大SP'],
      currentSp: options.currentSp,
      elapsedSeconds: options.elapsedSeconds
    });
  }

  return Object.freeze({
    version: 1,
    DEFAULT_REQUIRED_SP,
    normalizeConfig,
    createState,
    createApostleState,
    advance,
    isReady,
    timeToReady,
    spend,
    recover,
    normalizeRecoveryEvents,
    advanceWithEvents,
    waitUntilReady,
    getCycleWithEvents,
    getNaturalCycle
  });
});
