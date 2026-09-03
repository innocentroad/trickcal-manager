'use strict';

// Read-only inventory for the first slice of the runtime-effect settings Goal.
// It intentionally prints the result instead of modifying generated data or
// application state. The audit uses the current FDC conversion path so that
// collection gaps are measured against the same objects the UI receives.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const policy = require('../dps-trigger-policy.js');
const timingData = require('../dps-timing-data.js');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const prototypeSource = read('formation-damage-dps-prototype.js');

const loadLibrary = (file, assignment) => {
  const context = {};
  vm.runInNewContext(`${read(file)}\nthis.library = ${assignment};`, context, { filename: file });
  return context.library;
};

const apostleLibrary = loadLibrary('apostles.js', 'APOSTLE_LIBRARY');
const cardLibrary = loadLibrary('cards.js', 'CARD_LIBRARY');
const statData = (() => {
  const context = { window: {} };
  vm.runInNewContext(`${read('statData.js')}\nthis.data = TRICKCAL_STAT_DATA;`, context, { filename: 'statData.js' });
  return context.data;
})();

const source = read('formation-damage-calc.js').replace(/\r\n/g, '\n');
const initBlock = [
  '  restoreCalcSettings();',
  '',
  '  initTheme();',
  '  setupCollapsibleStatCategories();',
  '  bindEvents();',
  '  setupResultBarOffsetSync();',
  '  populateEnemyPresets();',
  '  populateEnemyApostles();',
  '  renderDamageSaveActionPanel();',
  '  applyEnemyPreset();',
  '  render();'
].join('\n');
const apiExports = [
  '    createDpsActionEffectAudit,',
  '    createDpsFormationEventCandidates,',
  '    createDpsRuntimeEffects,',
  '    collectEffects,',
  '    buildFdcApostleSkillOptions,'
].join('\n');
const runtimeSource = source
  .replace(initBlock, '')
  .replace('    createDpsEvaluationInput,\n', `    createDpsEvaluationInput,\n${apiExports}\n`);

const documentStub = {
  documentElement: { classList: { add() {} }, style: { setProperty() {} } },
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() {}
};
const context = {
  APOSTLE_LIBRARY: apostleLibrary,
  CARD_LIBRARY: cardLibrary,
  TRICKCAL_STAT_DATA: statData,
  DPS_TIMING_DATA: timingData,
  ENEMY_PRESETS: [],
  resolveCardIdAlias(value) { return value; },
  TRICKCAL_DPS_TRIGGER_POLICY: policy,
  window: {
    TRICKCAL_DPS_TRIGGER_POLICY: policy,
    addEventListener() {},
    dispatchEvent() {},
    innerWidth: 1280,
    innerHeight: 720,
    scrollY: 0
  },
  document: documentStub,
  localStorage: { getItem() { return null; }, setItem() {} },
  sessionStorage: { getItem() { return null; }, setItem() {} }
};
vm.runInNewContext(`${runtimeSource}\nthis.api = window.TRICKCAL_DAMAGE_CALC;`, context, {
  filename: 'formation-damage-calc.js'
});
const api = context.api;

const actionCategories = ['基本攻撃', '強化攻撃', '低学年スキル', '高学年スキル'];
const collectionKeys = [
  'attackSpeedEffects',
  'damageBuffEffects',
  'spRegenEffects',
  'spRecoveryEffects',
  'cooldownEffects',
  'eventEffects'
];
const collectionLabels = {
  attackSpeedEffects: '攻撃速度',
  damageBuffEffects: 'ダメージ補正',
  spRegenEffects: '毎秒SP補正',
  spRecoveryEffects: 'SP回復',
  cooldownEffects: 'クールタイム',
  eventEffects: 'イベント'
};
const runtimeControlSource = prototypeSource.slice(
  prototypeSource.indexOf('function renderDpsRuntimeEffectControls'),
  prototypeSource.indexOf('function renderDpsRuntimeSettingsContent')
);
const settingsCollectionKeys = Array.from(new Set([
  ...Array.from(runtimeControlSource.matchAll(/\['([^']+Effects?)',/g), match => match[1]),
  ...Array.from(runtimeControlSource.matchAll(/register\('([^']+Effects?)'/g), match => match[1])
]));
const readOnlyCollectionKeys = ['spRegenEffects'];
const auxiliaryRuntimeKeys = [
  'initialTargetStatuses',
  'statusReactions',
  'statusDamageWeaknessP',
  'resources'
];

function createTarget(apostle) {
  const attackType = apostle?.basic?.attackType || '物理';
  return {
    id: apostle.id,
    name: apostle.name,
    attackType,
    artifactIds: [],
    skillLevels: { low: 12, high: 12, passive: 12 },
    asideRank: 3,
    asideLevel: 3,
    stats: {
      hp: 1000,
      physicalAtk: 1000,
      magicAtk: 1000,
      physicalDef: 100,
      magicDef: 100,
      crit: 100,
      critDmg: 100,
      critRes: 100,
      critDmgRes: 100,
      spRegen: Number(apostle?.basic?.spRecoveryPerSecond) || 0
    }
  };
}

function createContext(target, actionCategory, formation, cards = {}, stateOverride = null) {
  const damageType = /魔/.test(target.attackType) ? 'magic' : 'physical';
  const cardStates = plain(cards || {});
  const state = stateOverride || { apostles: { [target.id]: {} }, cards: cardStates };
  const effects = api.collectEffects({
    target,
    formation,
    cards: cardStates,
    damageType,
    state,
    actionCategory
  });
  return {
    target,
    formation,
    cards: cardStates,
    damageType,
    state,
    actionCategory,
    effects,
    skillEffectStateOverrides: {}
  };
}

const createFormation = targetId => ({
  rows: [{ apostles: [targetId, '', ''] }, { apostles: ['', '', ''] }, { apostles: ['', '', ''] }],
  spells: []
});
const inventory = [];
const auxiliaryInventory = [];
const cardRuntimeInventory = [];
const cardFixtureInventory = [];
const formationCandidateInventory = [];
const formationFixtureInventory = [];
const errors = [];

for (const apostle of apostleLibrary) {
  if (!apostle?.id || !apostle?.name) continue;
  const target = createTarget(apostle);
  const formation = createFormation(target.id);
  const actionAudit = {};
  for (const actionCategory of actionCategories) {
    try {
      const actionContext = createContext(target, actionCategory, formation);
      actionAudit[actionCategory] = api.createDpsActionEffectAudit(actionContext);
    } catch (error) {
      errors.push({ apostle: apostle.id, actionCategory, message: error.message });
    }
  }
  try {
    const selectedContext = createContext(target, '低学年スキル', formation);
    const selectedSkillOptions = api.buildFdcApostleSkillOptions(target, selectedContext);
    const runtimeEffects = api.createDpsRuntimeEffects(actionAudit, {
      baseSpRegen: target.stats.spRegen,
      runtimeManagedEffects: [],
      apostle,
      target,
      context: selectedContext,
      skillLevels: target.skillLevels,
      selectedSkillOptions,
      dpsSkillOverrides: {},
      dpsTimingBranches: {},
      timingEffectBindings: {}
    });
    collectionKeys.forEach(collection => {
      (runtimeEffects[collection] || []).forEach(effect => {
        inventory.push({
          apostleId: apostle.id,
          apostleName: apostle.name,
          collection,
          collectionLabel: collectionLabels[collection],
          id: String(effect.id || effect.effectId || ''),
          label: String(effect.label || ''),
          triggerType: String(effect.triggerType || ''),
          conditionType: String(effect.conditionType || ''),
          externalActionRequired: !!effect.externalActionRequired,
          ownerId: String(effect.ownerId || ''),
          sourceId: String(effect.sourceId || ''),
          ...getRuntimeAuditFields(effect, collection)
        });
      });
    });
    auxiliaryInventory.push({
      apostleId: apostle.id,
      present: auxiliaryRuntimeKeys.filter(key => {
        const value = runtimeEffects[key];
        return Array.isArray(value) ? value.length > 0 : value && typeof value === 'object'
          ? Object.keys(value).length > 0
          : Number(value) !== 0 && value != null;
      })
    });
  } catch (error) {
    errors.push({ apostle: apostle.id, phase: 'runtime', message: error.message });
  }
}

// Audit every apostle once as a formation-side source.  The neutral target is
// placed on the same row so all-ally/same-row action effects reach the normal
// FDC collection path.  Target-personality/role combinations remain a later
// expansion; this pass establishes the generic action/external split for all
// source apostles without changing application state.
for (const sourceApostle of apostleLibrary) {
  if (!sourceApostle?.id || !sourceApostle?.name) continue;
  const targetApostle = apostleLibrary.find(item => (
    item?.id && item.id !== sourceApostle.id && item.id === 'sylla'
  )) || apostleLibrary.find(item => item?.id && item.id !== sourceApostle.id);
  if (!targetApostle) continue;
  const target = {
    ...createTarget(targetApostle),
    position: '後列',
    line: 1
  };
  const formation = {
    rows: [
      { apostles: [target.id, sourceApostle.id, ''], artifacts: [[], [], []] },
      { apostles: ['', '', ''], artifacts: [[], [], []] },
      { apostles: ['', '', ''], artifacts: [[], [], []] }
    ],
    spells: []
  };
  const maxState = apostle => ({
    level: 60,
    star: 5,
    rank: 10,
    asideRank: 3,
    asideLevel: 3,
    skillLevels: { low: 12, high: 12, passive: 12 }
  });
  const state = {
    apostles: {
      [target.id]: maxState(targetApostle),
      [sourceApostle.id]: maxState(sourceApostle)
    },
    cards: {}
  };
  const members = [{
    id: sourceApostle.id,
    name: sourceApostle.name,
    position: '後列',
    line: 2,
    stats: { spRegen: Number(sourceApostle?.basic?.spRecoveryPerSecond) || 0 }
  }];
  const actionAudit = {};
  for (const actionCategory of actionCategories) {
    try {
      const actionContext = createContext(target, actionCategory, formation, state.cards, state);
      actionContext.members = members;
      actionAudit[actionCategory] = api.createDpsActionEffectAudit(actionContext);
    } catch (error) {
      errors.push({ sourceApostle: sourceApostle.id, actionCategory, phase: 'formation-audit', message: error.message });
    }
  }
  try {
    const candidates = api.createDpsFormationEventCandidates(actionAudit, { members });
    candidates.forEach(candidate => formationCandidateInventory.push({
      sourceApostleId: sourceApostle.id,
      sourceApostleName: sourceApostle.name,
      targetApostleId: target.id,
      id: String(candidate.id || ''),
      bindingKey: String(candidate.bindingKey || ''),
      label: String(candidate.label || ''),
      type: String(candidate.type || ''),
      timingMode: String(candidate.timingMode || ''),
      eventClass: String(candidate.eventClass || ''),
      periodicActionLabel: String(candidate.periodicActionLabel || ''),
      startSeconds: Number(candidate.startSeconds) || 0,
      intervalSeconds: Number(candidate.intervalSeconds) || 0,
      confidence: String(candidate.confidence || ''),
      basis: String(candidate.basis || ''),
      effectLabels: Array.isArray(candidate.effectLabels) ? candidate.effectLabels.map(String) : []
    }));
    formationFixtureInventory.push({
      sourceApostleId: sourceApostle.id,
      sourceApostleName: sourceApostle.name,
      targetApostleId: target.id,
      candidateCount: candidates.length
    });
  } catch (error) {
    errors.push({ sourceApostle: sourceApostle.id, phase: 'formation-candidates', message: error.message });
  }
}

// Generated skill effects are audited above with an empty card state.  Audit
// cards separately so a card being present does not make the skill baseline
// look like a card-owned runtime row.  Each card is checked as a self-equipped
// artifact, a formation artifact, or a spell, at both physical and magical
// target perspectives.  This is an inventory pass, not a claim that every
// card trigger is already simulated.
const cardTargetApostles = [
  apostleLibrary.find(apostle => !/魔/.test(String(apostle?.basic?.attackType || ''))),
  apostleLibrary.find(apostle => /魔/.test(String(apostle?.basic?.attackType || '')))
].filter(Boolean);
const getCardOwnerApostle = targetApostle => apostleLibrary.find(apostle => (
  apostle?.id && apostle.id !== targetApostle?.id
)) || apostleLibrary[0];

function createCardFixtureTarget(apostle) {
  return {
    ...createTarget(apostle),
    // Formation rows are ordered 後列 -> 中列 -> 前列 in the application.
    // Keep the target in the first row so same-line card effects are tested
    // against the owner placed beside it.
    position: '後列',
    line: 1
  };
}

function createFormationArtifactFixture(targetId, ownerId, cardId) {
  return {
    rows: [
      { apostles: [targetId, ownerId, ''], artifacts: [[], [cardId], []] },
      { apostles: ['', '', ''], artifacts: [[], [], []] },
      { apostles: ['', '', ''], artifacts: [[], [], []] }
    ],
    spells: []
  };
}

function cardRuntimeMatchesCard(effect, card) {
  const cardId = String(card?.id || '');
  if (!cardId || !effect) return false;
  const sourceId = String(effect.sourceId || '').trim();
  const effectId = String(effect.effectId || '').trim();
  const id = String(effect.id || '').trim();
  return sourceId === cardId
    || effectId.startsWith(`${cardId}_`)
    || id === cardId
    || id.startsWith(`${cardId}_`)
    || id.includes(`:${cardId}:`);
}

function cardRuntimePolicyFields(effect) {
  const runtimePolicy = effect?.runtimePolicy || {};
  return {
    hasCapability: !!runtimePolicy.capability || Object.hasOwn(effect || {}, 'capability'),
    hasDefaultMode: !!runtimePolicy.defaultMode || Object.hasOwn(effect || {}, 'defaultMode'),
    hasTriggerDomain: !!runtimePolicy.triggerDomain || Object.hasOwn(effect || {}, 'triggerDomain'),
    hasQuality: !!runtimePolicy.quality || Object.hasOwn(effect || {}, 'quality'),
    hasReasonCode: !!runtimePolicy.reasonCode || Object.hasOwn(effect || {}, 'reasonCode')
  };
}

function getRuntimeAuditFields(effect, collection) {
  const runtimePolicy = effect?.runtimePolicy || {};
  const triggerActionKeys = Array.isArray(effect?.triggerActionKeys)
    ? effect.triggerActionKeys.map(String).filter(Boolean)
    : [];
  const targetActionKeys = Array.isArray(effect?.targetActionKeys)
    ? effect.targetActionKeys.map(String).filter(Boolean)
    : [];
  const hasTriggerMetadata = [
    effect?.triggerType,
    effect?.conditionType,
    effect?.conditionValue,
    effect?.triggerSourceId,
    effect?.timingSourceEffectId
  ].some(value => value !== undefined && value !== null && String(value).trim() !== '');
  const hasTimingMetadata = triggerActionKeys.length > 0
    || Number(effect?.intervalFrames) > 0
    || Number(effect?.triggerEveryCount) > 0
    || String(effect?.mode || '').trim() !== ''
    || (collection === 'eventEffects' && Array.isArray(effect?.steps) && effect.steps.length > 0);
  const hasTriggerPath = collection === 'spRegenEffects' || hasTriggerMetadata || hasTimingMetadata;
  return {
    policyCapability: runtimePolicy.capability || '',
    policyDefaultMode: runtimePolicy.defaultMode || '',
    policyStatus: runtimePolicy.status || '',
    policyReasonCode: runtimePolicy.reasonCode || '',
    policyQuality: runtimePolicy.quality || '',
    policyHigh: runtimePolicy.highSkill === true,
    runtimeMode: String(effect?.mode || ''),
    triggerSourceId: String(effect?.triggerSourceId || ''),
    timingSourceEffectId: String(effect?.timingSourceEffectId || ''),
    triggerActionKeys,
    targetActionKeys,
    intervalFrames: Number(effect?.intervalFrames) || 0,
    durationFrames: Number(effect?.durationFrames) || 0,
    triggerEveryCount: Number(effect?.triggerEveryCount) || 0,
    hasTriggerPath,
    triggerPathReason: hasTriggerPath ? '' : (runtimePolicy.reasonCode || 'missingTriggerMetadata'),
    ...cardRuntimePolicyFields(effect)
  };
}

function auditCardRuntimeFixture(card, fixtureType, targetApostle) {
  const target = createCardFixtureTarget(targetApostle);
  const cardStates = { [card.id]: { star: 5, solder: 2 } };
  let formation;
  if (fixtureType === 'targetArtifact') {
    target.artifactIds = [card.id];
    formation = createFormation(target.id);
  } else if (fixtureType === 'spell') {
    formation = { ...createFormation(target.id), spells: [card.id] };
  } else {
    formation = createFormationArtifactFixture(target.id, getCardOwnerApostle(targetApostle).id, card.id);
  }
  const fixtureKey = `${fixtureType}:${card.id}:${target.attackType}`;
  const actionAudit = {};
  let auditedCardRows = 0;
  let collectedCardRows = 0;
  for (const actionCategory of actionCategories) {
    try {
      const actionContext = createContext(target, actionCategory, formation, cardStates);
      const fullAudit = api.createDpsActionEffectAudit(actionContext);
      actionAudit[actionCategory] = {
        ...fullAudit,
        rows: (fullAudit.rows || []).filter(row => row.cardId === card.id)
      };
      auditedCardRows += actionAudit[actionCategory].rows.length;
    } catch (error) {
      errors.push({ card: card.id, fixtureType, actionCategory, message: error.message });
    }
  }
  try {
    const selectedContext = createContext(target, '低学年スキル', formation, cardStates);
    const collectedRows = [
      ...(selectedContext.effects?.applied || []),
      ...(selectedContext.effects?.conditional || []),
      ...(selectedContext.effects?.skillChanges || []),
      ...(selectedContext.effects?.globalStats || [])
    ].filter(row => row.cardId === card.id).length;
    collectedCardRows = collectedRows;
    const runtimeEffects = api.createDpsRuntimeEffects(actionAudit, {
      baseSpRegen: target.stats.spRegen,
      runtimeManagedEffects: [],
      // Do not add the target's skill sources to this pass.  Card status
      // events still come from the fixture context through the existing card
      // runtime path below.
      target,
      context: selectedContext,
      skillLevels: target.skillLevels,
      selectedSkillOptions: [],
      dpsSkillOverrides: {},
      dpsTimingBranches: {},
      timingEffectBindings: {}
    });
    const runtimeRows = [];
    collectionKeys.forEach(collection => {
      (runtimeEffects[collection] || []).forEach(effect => {
        if (!cardRuntimeMatchesCard(effect, card)) return;
          const policyFields = getRuntimeAuditFields(effect, collection);
        const row = {
          fixtureKey,
          fixtureType,
          targetAttackType: target.attackType,
          cardId: card.id,
          cardName: card.name,
          collection,
          collectionLabel: collectionLabels[collection],
          id: String(effect.id || effect.effectId || ''),
          label: String(effect.label || ''),
          triggerType: String(effect.triggerType || ''),
          conditionType: String(effect.conditionType || ''),
          externalActionRequired: !!effect.externalActionRequired,
          ownerId: String(effect.ownerId || ''),
          sourceId: String(effect.sourceId || ''),
          ...policyFields
        };
        runtimeRows.push(row);
        cardRuntimeInventory.push(row);
      });
    });
    cardFixtureInventory.push({
      fixtureKey,
      fixtureType,
      cardId: card.id,
      cardName: card.name,
      targetAttackType: target.attackType,
      auditedCardRows,
      collectedCardRows,
      runtimeRows: runtimeRows.length,
      collections: Array.from(new Set(runtimeRows.map(row => row.collection))),
      externalRows: runtimeRows.filter(row => row.externalActionRequired).length,
      missingPolicyRows: runtimeRows.filter(row => !row.hasCapability || !row.hasDefaultMode
        || !row.hasTriggerDomain || !row.hasQuality || !row.hasReasonCode).length
    });
  } catch (error) {
    errors.push({ card: card.id, fixtureType, phase: 'runtime', message: error.message });
  }
}

for (const targetApostle of cardTargetApostles) {
  for (const card of cardLibrary.artifacts || []) {
    auditCardRuntimeFixture(card, 'targetArtifact', targetApostle);
    auditCardRuntimeFixture(card, 'formationArtifact', targetApostle);
  }
  for (const card of cardLibrary.spells || []) {
    auditCardRuntimeFixture(card, 'spell', targetApostle);
  }
}

const unique = values => Array.from(new Set(values));
const byCollection = Object.fromEntries(collectionKeys.map(collection => [
  collection,
  inventory.filter(item => item.collection === collection)
]));
const allIds = unique(inventory.map(item => item.id).filter(Boolean));
const duplicateIds = allIds.filter(id => inventory.filter(item => item.id === id).length > 1);
const externalRows = inventory.filter(item => item.externalActionRequired);
const blankTriggerRows = inventory.filter(item => !item.triggerType && !item.conditionType);
const missingPolicyRows = inventory.filter(item => !item.hasCapability || !item.hasDefaultMode
  || !item.hasTriggerDomain || !item.hasQuality || !item.hasReasonCode);
const noTriggerPathRows = inventory.filter(item => !item.hasTriggerPath);
const unexposedCollections = collectionKeys.filter(collection => !settingsCollectionKeys.includes(collection));
const auxiliaryPresenceCounts = Object.fromEntries(auxiliaryRuntimeKeys.map(key => [
  key,
  auxiliaryInventory.filter(item => item.present.includes(key)).length
]));
const byCardCollection = Object.fromEntries(collectionKeys.map(collection => [
  collection,
  cardRuntimeInventory.filter(item => item.collection === collection)
]));
const cardDuplicateGroups = new Map();
cardRuntimeInventory.forEach(row => {
  const key = `${row.fixtureKey}:${row.collection}:${row.id}`;
  cardDuplicateGroups.set(key, (cardDuplicateGroups.get(key) || 0) + 1);
});
const cardDuplicateIds = Array.from(cardDuplicateGroups.entries())
  .filter(([, count]) => count > 1)
  .map(([key]) => key);
const cardExternalRows = cardRuntimeInventory.filter(item => item.externalActionRequired);
const cardBlankTriggerRows = cardRuntimeInventory.filter(item => !item.triggerType && !item.conditionType);
const cardMissingPolicyRows = cardRuntimeInventory.filter(item => !item.hasCapability || !item.hasDefaultMode
  || !item.hasTriggerDomain || !item.hasQuality || !item.hasReasonCode);
const cardNoTriggerPathRows = cardRuntimeInventory.filter(item => !item.hasTriggerPath);
const countBy = (rows, key) => Object.fromEntries(
  Array.from(rows.reduce((counts, row) => {
    const value = String(row?.[key] || '未設定');
    counts.set(value, (counts.get(value) || 0) + 1);
    return counts;
  }, new Map()).entries())
);
const cardRuntimeFixtureTypeCounts = Object.fromEntries(
  ['targetArtifact', 'formationArtifact', 'spell'].map(fixtureType => [
    fixtureType,
    cardRuntimeInventory.filter(item => item.fixtureType === fixtureType).length
  ])
);

// Keep a structured-source view for the audit report.  It follows the common
// policy and deliberately ignores target actions/display text: an effect that
// changes high-skill cooldown is not itself fired by a high-skill action.
function getStructuredTriggerGrade(row = {}) {
  return policy.getStructuredTriggerGrade(row) || 'none';
}

function summarizeRepresentativeCase(caseId, rows, expected = {}) {
  const row = rows.find(item => String(item.id || '').includes(caseId));
  if (!row) return { caseId, found: false, expected };
  return {
    caseId,
    found: true,
    source: row.cardId ? row.cardName : row.apostleName,
    id: row.id,
    triggerType: row.triggerType,
    triggerActionKeys: row.triggerActionKeys,
    targetActionKeys: row.targetActionKeys,
    current: {
      capability: row.policyCapability,
      defaultMode: row.policyDefaultMode,
      highSkill: row.policyHigh,
      reasonCode: row.policyReasonCode
    },
    expected
  };
}

const runtimeAndCardRows = [...inventory, ...cardRuntimeInventory];
const falseHighRows = runtimeAndCardRows.filter(row => (
  row.policyHigh && !['high', 'mixed'].includes(getStructuredTriggerGrade(row))
));
const mixedTriggerRows = runtimeAndCardRows.filter(row => getStructuredTriggerGrade(row) === 'mixed');
const representativeCases = [
  summarizeRepresentativeCase('artifact_dragonlight_sword_e01', cardRuntimeInventory, {
    capability: 'exact', defaultMode: 'auto', triggerGrade: 'low-reset-only'
  }),
  summarizeRepresentativeCase('artifact_elena_enhanced_drone_e01', cardRuntimeInventory, {
    capability: 'exact', defaultMode: 'auto', triggerGrade: 'low'
  }),
  summarizeRepresentativeCase('Rollett_passive_e01', inventory, {
    capability: 'exact', defaultMode: 'auto', triggerGrade: 'low-source-lineage'
  }),
  summarizeRepresentativeCase('Kidian_passive_e01', inventory, {
    capability: 'exact', defaultMode: 'split', triggerGrade: 'mixed-low-auto-high-off'
  }),
  summarizeRepresentativeCase('Xion_aside_2_e03', inventory, {
    capability: 'exact', defaultMode: 'split', triggerGrade: 'mixed-low-auto-high-off'
  })
];

const formationPolicyFixtures = [
  {
    caseId: 'formation-low-estimated',
    effect: {
      id: 'Kyarot_low_e01', ownerId: 'kyarot', triggerType: '低学年スキル使用時',
      triggerActionKeys: ['lowSkill'], externalActionRequired: true
    },
    expected: { capability: 'estimated', defaultMode: 'auto' }
  },
  {
    caseId: 'formation-high-opt-in',
    effect: {
      id: 'Epica_high_e04', ownerId: 'epica', triggerType: '高学年スキル使用時',
      triggerActionKeys: ['highSkill'], externalActionRequired: true
    },
    expected: { capability: 'estimated', defaultMode: 'off' }
  },
  {
    caseId: 'true-external-shield-break',
    effect: {
      id: 'Kyarot_aside_2_e03', ownerId: 'kyarot', triggerType: 'シールド破壊時',
      externalTriggerType: 'シールド破壊時', externalActionRequired: true
    },
    expected: { capability: 'external', defaultMode: 'waiting' }
  }
].map(item => {
  const currentPolicy = policy.getRuntimeEffectPolicy(item.effect);
  const schedulePolicy = policy.getRuntimeEffectSchedulePolicy(item.effect, { policy: currentPolicy });
  return {
    caseId: item.caseId,
    current: {
      capability: currentPolicy.capability,
      defaultMode: currentPolicy.defaultMode,
      highSkill: currentPolicy.highSkill,
      scheduleCapabilities: schedulePolicy.capabilityLabels
    },
    expected: item.expected
  };
});

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  apostles: apostleLibrary.filter(item => item?.id && item?.name).length,
  actionCategories,
  runtimeCollectionKeys: collectionKeys,
  settingsCollectionKeys,
  readOnlyCollections: readOnlyCollectionKeys.filter(collection => settingsCollectionKeys.includes(collection)),
  unexposedCollections,
  auxiliaryRuntimeKeys,
  auxiliaryPresenceCounts,
  collectionCounts: Object.fromEntries(collectionKeys.map(collection => [collection, byCollection[collection].length])),
  totalRuntimeRows: inventory.length,
  uniqueEffectIds: allIds.length,
  duplicateEffectIdRows: duplicateIds.length,
  duplicateEffectIds: duplicateIds.slice(0, 30),
  externalActionRows: externalRows.length,
  blankTriggerRows: blankTriggerRows.length,
  blankTriggerReasonCodes: countBy(blankTriggerRows, 'policyReasonCode'),
  noTriggerPathRows: noTriggerPathRows.length,
  noTriggerPathReasonCodes: countBy(noTriggerPathRows, 'triggerPathReason'),
  missingPolicyRows: missingPolicyRows.length,
  cardFixtureCounts: {
    targetApostles: cardTargetApostles.length,
    artifacts: cardLibrary.artifacts?.length || 0,
    spells: cardLibrary.spells?.length || 0,
    conditionalEffects: [...(cardLibrary.artifacts || []), ...(cardLibrary.spells || [])]
      .reduce((total, card) => total + (card.conditionalEffects?.length || 0), 0),
    fixtures: cardFixtureInventory.length,
    fixturesWithRuntimeRows: cardFixtureInventory.filter(item => item.runtimeRows > 0).length
  },
  cardRuntimeCollectionCounts: Object.fromEntries(collectionKeys.map(collection => [
    collection,
    byCardCollection[collection].length
  ])),
  cardRuntimeFixtureTypeCounts,
  cardCollectedRows: cardFixtureInventory.reduce((total, item) => total + item.collectedCardRows, 0),
  cardAuditRows: cardFixtureInventory.reduce((total, item) => total + item.auditedCardRows, 0),
  cardAuditRowsByFixtureType: Object.fromEntries(
    ['targetArtifact', 'formationArtifact', 'spell'].map(fixtureType => [
      fixtureType,
      cardFixtureInventory
        .filter(item => item.fixtureType === fixtureType)
        .reduce((total, item) => total + item.auditedCardRows, 0)
    ])
  ),
  cardCollectedRowsByFixtureType: Object.fromEntries(
    ['targetArtifact', 'formationArtifact', 'spell'].map(fixtureType => [
      fixtureType,
      cardFixtureInventory
        .filter(item => item.fixtureType === fixtureType)
        .reduce((total, item) => total + item.collectedCardRows, 0)
    ])
  ),
  cardRuntimeRows: cardRuntimeInventory.length,
  cardRuntimeExternalRows: cardExternalRows.length,
  cardRuntimeBlankTriggerRows: cardBlankTriggerRows.length,
  cardRuntimeBlankTriggerReasonCodes: countBy(cardBlankTriggerRows, 'policyReasonCode'),
  cardRuntimeNoTriggerPathRows: cardNoTriggerPathRows.length,
  cardRuntimeNoTriggerPathReasonCodes: countBy(cardNoTriggerPathRows, 'triggerPathReason'),
  cardRuntimeMissingPolicyRows: cardMissingPolicyRows.length,
  cardRuntimeDuplicateIdRows: cardDuplicateIds.length,
  cardRuntimeDuplicateIds: cardDuplicateIds.slice(0, 30),
  cardRuntimeUnexposedCollections: collectionKeys.filter(collection => (
    byCardCollection[collection].length > 0 && !settingsCollectionKeys.includes(collection)
  )),
  formationCandidateAudit: {
    fixtures: formationFixtureInventory.length,
    sourceApostlesWithCandidates: formationFixtureInventory.filter(item => item.candidateCount > 0).length,
    totalCandidates: formationCandidateInventory.length,
    timingModeCounts: countBy(formationCandidateInventory, 'timingMode'),
    periodicActionCounts: countBy(formationCandidateInventory, 'periodicActionLabel'),
    zeroIntervalPeriodicCandidates: formationCandidateInventory.filter(item => (
      item.timingMode === 'periodic' && !(item.intervalSeconds > 0)
    )).length,
    candidateIds: unique(formationCandidateInventory.map(item => item.id)).sort(),
    sampleCandidates: plain(formationCandidateInventory.slice(0, 30))
  },
  triggerClassificationAudit: {
    falseHighRows: falseHighRows.length,
    falseHighIds: unique(falseHighRows.map(row => row.id)).sort(),
    mixedTriggerRows: mixedTriggerRows.length,
    mixedTriggerIds: unique(mixedTriggerRows.map(row => row.id)).sort(),
    representativeCases,
    formationPolicyFixtures
  },
  errors,
  sampleExternalRows: plain(externalRows.slice(0, 12)),
  sampleBlankTriggerRows: plain(blankTriggerRows.slice(0, 12)),
  sampleCardRuntimeRows: plain(cardRuntimeInventory.slice(0, 20)),
  sampleCardBlankTriggerRows: plain(cardBlankTriggerRows.slice(0, 12)),
  sampleFormationArtifactFixtures: plain(cardFixtureInventory
    .filter(item => item.fixtureType === 'formationArtifact' && (item.auditedCardRows || item.collectedCardRows))
    .slice(0, 12))
}, null, 2));

if (errors.length) process.exitCode = 1;
