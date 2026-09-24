(function (root) {
  'use strict';

  const hasValue = value => value !== undefined && value !== null && value !== '';
  const stageKey = stage => `段階${stage}`;
  const orderKey = stage => `取得順${stage}`;

  function getStages(rows) {
    const stages = new Set();
    (rows || []).forEach(row => Object.keys(row || {}).forEach(key => {
      const match = /^段階([1-9]\d*)$/.exec(key);
      if (match) stages.add(Number(match[1]));
    }));
    return [...stages].sort((left, right) => left - right);
  }

  function getOrder(row, stage) {
    if (!hasValue(row?.[stageKey(stage)])) return 0;
    const key = orderKey(stage);
    return Number(Object.prototype.hasOwnProperty.call(row, key) ? row[key] : stage <= 10 ? row.id : 0) || 0;
  }

  function getLimits(rows) {
    const stages = getStages(rows);
    const progressByStage = Object.fromEntries(stages.map(stage => [stage,
      Math.max(0, ...(rows || []).map(row => getOrder(row, stage)))
    ]));
    const availableStages = stages.filter(stage => progressByStage[stage] > 0);
    return { stages: availableStages, maxLevel: availableStages.at(-1) || 0, progressByStage };
  }

  function getProgressLimit(limits, level) {
    return limits.progressByStage?.[Number(level)] || 0;
  }

  function normalizeState(state, limits) {
    const level = Math.max(0, Math.min(limits.maxLevel, Math.trunc(Number(state?.level) || 0)));
    const progress = Math.max(0, Math.min(getProgressLimit(limits, level), Math.trunc(Number(state?.progress) || 0)));
    return { level, progress };
  }

  function getAppliedStages(row, level, progress) {
    if (!(Number(level) > 0 && Number(progress) > 0)) return [];
    const stages = [];
    for (let stage = 1; stage <= level; stage += 1) {
      const order = getOrder(row, stage);
      if (order && (stage < level || order <= progress)) stages.push(stage);
    }
    return stages;
  }

  function getValue(row, level, progress) {
    if (!row?.種族 || !row?.ステータス) return 0;
    return getAppliedStages(row, level, progress).reduce(
      (sum, stage) => sum + (Number(row[stageKey(stage)]) || 0), 0
    );
  }

  function getCurrentOrder(row, level, progress) {
    const order = getOrder(row, level);
    return order && order <= Number(progress) ? order : null;
  }

  const api = { getStages, getOrder, getLimits, getProgressLimit, normalizeState,
    getAppliedStages, getValue, getCurrentOrder };
  root.TRICKCAL_RESEARCH_PROGRESS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
