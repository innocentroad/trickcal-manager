(() => {
  'use strict';

  const SCHEMA_VERSION = 1;
  const COMPARISON_SESSION_VERSION = 2;
  const COMPARISON_SESSION_KEY = 'trickcal_combat_comparison_session_v1';
  const DEFAULT_EVALUATION_POLICY = Object.freeze({
    singleAction: 'followCandidateAction',
    dpsActions: 'all',
    unresolvedAction: 'disableComparison'
  });
  const COMPARISON_SCOPES = Object.freeze([
    'characterState',
    'formationState',
    'cardState',
    'battleConditions',
    'effectAssumptions'
  ]);

  function clone(value, fallback = {}) {
    try {
      return JSON.parse(JSON.stringify(value ?? fallback));
    } catch {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? clone(value) : {};
  }

  function normalizeScenario(value = {}) {
    const source = asObject(value);
    return {
      schemaVersion: SCHEMA_VERSION,
      capturedAt: Math.max(0, Number(source.capturedAt) || 0),
      sourceMeta: asObject(source.sourceMeta),
      actors: {
        self: asObject(source.actors?.self),
        enemy: asObject(source.actors?.enemy)
      },
      characterState: asObject(source.characterState),
      formationState: asObject(source.formationState),
      cardState: asObject(source.cardState),
      battleConditions: asObject(source.battleConditions),
      effectAssumptions: asObject(source.effectAssumptions)
    };
  }

  function createScenario(value = {}) {
    return normalizeScenario({
      ...value,
      capturedAt: Number(value.capturedAt) || Date.now()
    });
  }

  function roundTripScenario(value = {}) {
    return normalizeScenario(clone(normalizeScenario(value)));
  }

  function materializeComparison(candidateValue = {}, sourceValue = {}, scopes = COMPARISON_SCOPES) {
    const candidate = normalizeScenario(candidateValue);
    const source = normalizeScenario(sourceValue);
    const selected = new Set((Array.isArray(scopes) ? scopes : []).filter(scope => COMPARISON_SCOPES.includes(scope)));
    const baseline = clone(candidate);
    selected.forEach(scope => {
      baseline[scope] = clone(source[scope]);
    });
    baseline.capturedAt = Date.now();
    baseline.sourceMeta = {
      ...clone(candidate.sourceMeta),
      comparisonSource: clone(source.sourceMeta),
      comparisonScopes: Array.from(selected)
    };
    return normalizeScenario(baseline);
  }

  function stableSort(value) {
    if (Array.isArray(value)) return value.map(stableSort);
    if (!value || typeof value !== 'object') return value;
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = stableSort(value[key]);
      return result;
    }, {});
  }

  function stableStringify(value = {}) {
    return JSON.stringify(stableSort(normalizeScenario(value)));
  }

  function semanticStringify(value = {}) {
    const scenario = normalizeScenario(value);
    return JSON.stringify(stableSort({
      actors: scenario.actors,
      characterState: scenario.characterState,
      formationState: scenario.formationState,
      cardState: scenario.cardState,
      battleConditions: scenario.battleConditions,
      effectAssumptions: scenario.effectAssumptions
    }));
  }

  function fingerprint(value = {}) {
    const text = semanticStringify(value);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `scenario:${SCHEMA_VERSION}:${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }

  function getSessionStorage() {
    try {
      return typeof sessionStorage === 'undefined' ? null : sessionStorage;
    } catch {
      return null;
    }
  }

  function normalizeEvaluationPolicy(value = {}) {
    const source = asObject(value);
    return {
      singleAction: source.singleAction === 'fixedBaselineAction'
        ? 'fixedBaselineAction'
        : DEFAULT_EVALUATION_POLICY.singleAction,
      dpsActions: DEFAULT_EVALUATION_POLICY.dpsActions,
      unresolvedAction: source.unresolvedAction === 'useSavedResult'
        ? 'useSavedResult'
        : DEFAULT_EVALUATION_POLICY.unresolvedAction
    };
  }

  function normalizeComparisonSession(value = {}) {
    if (!value || typeof value !== 'object' || value.mode !== 'pinned' || !value.baseline?.scenario) return null;
    return {
      version: COMPARISON_SESSION_VERSION,
      mode: 'pinned',
      savedAt: Math.max(0, Number(value.savedAt) || 0),
      evaluationPolicy: normalizeEvaluationPolicy(value.evaluationPolicy),
      baseline: {
        scenario: normalizeScenario(value.baseline.scenario),
        singleActionResult: asObject(value.baseline.singleActionResult),
        dpsSnapshot: asObject(value.baseline.dpsSnapshot)
      }
    };
  }

  function loadComparisonSession(storage = getSessionStorage()) {
    if (!storage) return null;
    try {
      const raw = storage.getItem(COMPARISON_SESSION_KEY);
      return raw ? normalizeComparisonSession(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  }

  function savePinnedComparison(payload = {}, storage = getSessionStorage()) {
    if (!storage || !payload.scenario) return null;
    const session = normalizeComparisonSession({
      version: COMPARISON_SESSION_VERSION,
      mode: 'pinned',
      savedAt: Date.now(),
      evaluationPolicy: payload.evaluationPolicy,
      baseline: {
        scenario: payload.scenario,
        singleActionResult: payload.singleActionResult,
        dpsSnapshot: payload.dpsSnapshot
      }
    });
    if (!session) return null;
    try {
      storage.setItem(COMPARISON_SESSION_KEY, JSON.stringify(session));
      return session;
    } catch {
      return null;
    }
  }

  function clearComparisonSession(storage = getSessionStorage()) {
    if (!storage) return;
    try {
      storage.removeItem(COMPARISON_SESSION_KEY);
    } catch {
      // sessionStorageが利用できない環境では何もしない。
    }
  }

  const api = Object.freeze({
    version: SCHEMA_VERSION,
    comparisonScopes: COMPARISON_SCOPES,
    defaultEvaluationPolicy: DEFAULT_EVALUATION_POLICY,
    clone,
    createScenario,
    normalizeScenario,
    roundTripScenario,
    materializeComparison,
    stableStringify,
    semanticStringify,
    fingerprint,
    comparisonSessionKey: COMPARISON_SESSION_KEY,
    normalizeEvaluationPolicy,
    normalizeComparisonSession,
    loadComparisonSession,
    savePinnedComparison,
    clearComparisonSession
  });

  globalThis.TRICKCAL_COMBAT_SCENARIO = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
