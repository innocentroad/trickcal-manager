(function (root) {
  'use strict';

  const hasValue = value => value !== undefined && value !== null && value !== '';
  const stageKey = stage => `段階${stage}`;
  const orderKey = stage => `取得順${stage}`;
  const isVertical = row => Object.prototype.hasOwnProperty.call(row || {}, '段階') &&
    Object.prototype.hasOwnProperty.call(row || {}, '取得順');

  function getStages(rows) {
    const stages = new Set();
    (rows || []).forEach(row => {
      if (isVertical(row)) {
        stages.add(Number(row.段階));
        return;
      }
      Object.keys(row || {}).forEach(key => {
      const match = /^段階([1-9]\d*)$/.exec(key);
      if (match) stages.add(Number(match[1]));
      });
    });
    return [...stages].sort((left, right) => left - right);
  }

  function getOrder(row, stage) {
    if (isVertical(row)) return Number(row.段階) === Number(stage) ? Number(row.取得順) || 0 : 0;
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
    if (isVertical(row)) {
      const stage = Number(row.段階);
      return stage < Number(level) || (stage === Number(level) && Number(row.取得順) <= Number(progress))
        ? [stage] : [];
    }
    const stages = [];
    for (let stage = 1; stage <= level; stage += 1) {
      const order = getOrder(row, stage);
      if (order && (stage < level || order <= progress)) stages.push(stage);
    }
    return stages;
  }

  function getValue(row, level, progress) {
    if (!row?.種族 || !row?.ステータス) return 0;
    if (isVertical(row)) return getAppliedStages(row, level, progress).length ? Number(row.増加値) : 0;
    return getAppliedStages(row, level, progress).reduce(
      (sum, stage) => sum + (Number(row[stageKey(stage)]) || 0), 0
    );
  }

  function getCurrentOrder(row, level, progress) {
    const order = getOrder(row, level);
    return order && order <= Number(progress) ? order : null;
  }

  function nonnegativeInteger(value, label, positive = false) {
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < (positive ? 1 : 0)) {
      throw new Error(`${label}は${positive ? '1以上' : '0以上'}の整数が必要です`);
    }
    return number;
  }

  function createMaterialPlanner(recipes = [], catalog = []) {
    const known = new Set(catalog.map(row => row.name));
    const byName = new Map();
    recipes.forEach(row => {
      const name = String(row.name || '');
      if (!known.has(name) || byName.has(name)) throw new Error(`製作素材の参照・重複を確認してください: ${name}`);
      const outputCount = nonnegativeInteger(row.outputCount, `${name}の完成数`, true);
      const materials = (row.materials || []).map(item => {
        if (!known.has(item.name)) throw new Error(`${name}の材料が未登録です: ${item.name}`);
        return { name: item.name, count: nonnegativeInteger(item.count, `${name}の${item.name}`, true) };
      });
      if (!materials.length) throw new Error(`${name}の材料がありません`);
      byName.set(name, { ...row, outputCount, materials });
    });
    const depths = new Map();
    const visiting = new Set();
    function depth(name) {
      if (!known.has(name)) throw new Error(`素材が未登録です: ${name}`);
      if (visiting.has(name)) throw new Error(`製作レシピが循環しています: ${[...visiting, name].join(' → ')}`);
      if (depths.has(name)) return depths.get(name);
      visiting.add(name);
      const recipe = byName.get(name);
      const value = recipe ? 1 + Math.max(...recipe.materials.map(item => depth(item.name))) : 0;
      visiting.delete(name);
      depths.set(name, value);
      return value;
    }
    byName.forEach((_, name) => depth(name));

    function expand(directInput, inventory = {}, mode = 'total') {
      if (!['total', 'shortfall'].includes(mode)) throw new Error('計画モードが不正です');
      const direct = new Map();
      for (const [name, count] of directInput) {
        if (!known.has(name)) throw new Error(`研究素材が未登録です: ${name}`);
        direct.set(name, nonnegativeInteger((direct.get(name) || 0)
          + nonnegativeInteger(count, `${name}の必要数`), `${name}の合計必要数`));
      }
      const owned = new Map();
      Object.entries(inventory).forEach(([name, count]) => {
        if (known.has(name)) owned.set(name, nonnegativeInteger(count, `${name}の所持数`));
      });
      const reachable = new Set();
      function visit(name) {
        if (reachable.has(name)) return;
        reachable.add(name);
        byName.get(name)?.materials.forEach(item => visit(item.name));
      }
      direct.forEach((_, name) => visit(name));
      const ordered = [...reachable].sort((a, b) => depth(b) - depth(a) || a.localeCompare(b, 'ja'));
      const demand = new Map(direct);
      const entries = new Map();
      ordered.forEach(name => {
        const quantity = demand.get(name) || 0;
        const stock = mode === 'shortfall' ? (owned.get(name) || 0) : 0;
        const missing = Math.max(0, quantity - stock);
        const recipe = byName.get(name);
        const batches = recipe ? Math.ceil(missing / recipe.outputCount) : 0;
        const produced = recipe ? nonnegativeInteger(batches * recipe.outputCount, `${name}の製作完成数`) : 0;
        const surplus = recipe ? produced - missing : 0;
        entries.set(name, { name, demand: quantity, owned: stock, missing, batches, surplus,
          depth: depth(name), recipe: recipe || null, direct: direct.get(name) || 0 });
        recipe?.materials.forEach(item => {
          demand.set(item.name, nonnegativeInteger((demand.get(item.name) || 0)
            + nonnegativeInteger(batches * item.count, `${item.name}の材料需要`), `${item.name}の合計需要`));
        });
      });
      return { direct, entries, ordered, mode };
    }
    return { expand, recipes: byName };
  }

  function planRemainingResearch(rows, recipes, catalog, state, endStage, inventory = {}, mode = 'total') {
    const planner = createMaterialPlanner(recipes, catalog);
    const end = nonnegativeInteger(endStage, '終了段階');
    const currentStage = Number(state?.level) || 0;
    const currentProgress = Number(state?.progress) || 0;
    const direct = new Map();
    const byStage = new Map();
    let researchCount = 0;
    (rows || []).forEach(row => {
      const stage = Number(row.段階);
      const order = Number(row.取得順);
      if (stage > end || (currentStage > 0 && currentProgress > 0
        && (stage < currentStage || (stage === currentStage && order <= currentProgress)))) return;
      researchCount += 1;
      (row.素材 || []).forEach(item => {
        const count = nonnegativeInteger(item.count, `${stage}段階・${order}番の${item.name}`, true);
        direct.set(item.name, nonnegativeInteger((direct.get(item.name) || 0) + count, `${item.name}の合計必要数`));
        const stageItems = byStage.get(stage) || new Map();
        stageItems.set(item.name, nonnegativeInteger((stageItems.get(item.name) || 0) + count, `${stage}段階の${item.name}`));
        byStage.set(stage, stageItems);
      });
    });
    return { ...planner.expand(direct, inventory, mode), byStage, researchCount };
  }

  const api = { getStages, getOrder, getLimits, getProgressLimit, normalizeState,
    getAppliedStages, getValue, getCurrentOrder, createMaterialPlanner, planRemainingResearch };
  root.TRICKCAL_RESEARCH_PROGRESS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
