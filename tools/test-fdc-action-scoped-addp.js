'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const simulator = require('../dps-simulator.js');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'formation-damage-calc.js'), 'utf8');

function extractTopLevelFunction(name) {
  const marker = `  function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} が formation-damage-calc.js に存在する`);
  const next = source.indexOf('\n  function ', start + marker.length);
  assert.notEqual(next, -1, `${name} の終端を取得できる`);
  return source.slice(start + 2, next);
}

const functionNames = [
  'normalizeFdcDamageModifierCategory',
  'getFdcActionScopedModifierKey',
  'normalizeFdcSkillEffectBonus',
  'isFdcFormationOwnerRuntimeTrigger',
  'judgeFdcEffectValueActionScope',
  'judgeActionCondition',
  'isFdcSkillActionCategory',
  'getFdcSkillBaseCategory',
  'getFdcActionCategories',
  'getFdcDeclaredAttackCategories',
  'matchesFdcAttackCategory'
];

const context = {};
vm.runInNewContext(`
  function getFdcEffectLevelInfo(effect) {
    return { value: Number(effect.fixedValue) };
  }
  function isFdcDamageBonusValueClass() {
    return true;
  }
  ${functionNames.map(extractTopLevelFunction).join('\n')}
  this.api = {
    normalizeFdcSkillEffectBonus,
    isFdcFormationOwnerRuntimeTrigger,
    judgeFdcEffectValueActionScope
  };
`, context);

const plain = value => JSON.parse(JSON.stringify(value));
const apostleContext = {};
vm.runInNewContext(
  `${fs.readFileSync(path.resolve(__dirname, '..', 'apostles.js'), 'utf8')}\nthis.library = APOSTLE_LIBRARY;`,
  apostleContext
);
const timingData = require('../dps-timing-data.js');
const timingBranchContext = {};
vm.runInNewContext(`
  function normalizeFdcArray(value) { return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []; }
  ${extractTopLevelFunction('createDpsAsideTimingBranches')}
  ${extractTopLevelFunction('createDpsTimingEffectBindings')}
  this.api = { createDpsAsideTimingBranches, createDpsTimingEffectBindings };
`, timingBranchContext);
const barongTiming = timingData.apostles.barong;
const barongAsideBranches = timingBranchContext.api.createDpsAsideTimingBranches(barongTiming, 2);
assert.equal(barongAsideBranches.lowSkill, 'アサイド2',
  '実データの有効アサイド段階から低学年のA2タイミング分岐を選ぶ');
const barongTimingBindings = timingBranchContext.api.createDpsTimingEffectBindings(
  barongTiming,
  barongAsideBranches
);
assert.deepEqual(
  plain(barongTimingBindings.Barong_aside_2_e05?.occurrences.map(item => [item.actionKey, item.branch, item.frame])),
  [['lowSkill', 'アサイド2', 166]],
  'Barong A2毒は低学年開始ではなく実測frame166へ一度だけ結び付く'
);
assert.deepEqual(
  plain(barongTimingBindings.Barong_aside_2_e07?.occurrences.map(item => [item.actionKey, item.branch, item.frame])),
  [['lowSkill', 'アサイド2', 166]],
  'Barong A2回復も毒と同じ命中frameへ結び付く'
);
assert.ok(
  barongTimingBindings.Barong_aside_2_e03?.occurrences.some(item => (
    item.actionKey === 'lowSkill' && item.generatedObjectId === 'Barong_aside_low_fog' && item.frame === 0
  )),
  'Barong A2の霧呪いは生成物の発生時刻へ結び付く'
);

// FDCの実生成経路でも、カードの「状態異常付与時」効果をDPS時限バフへ
// 変換できることと、Barong A2の状態付与・回復が構造化イベントへ届くことを確認する。
const cardDataContext = {};
vm.runInNewContext(
  `${fs.readFileSync(path.resolve(__dirname, '..', 'cards.js'), 'utf8')}\nthis.library = CARD_LIBRARY;`,
  cardDataContext
);
const statDataContext = { window: {} };
vm.runInNewContext(
  `${fs.readFileSync(path.resolve(__dirname, '..', 'statData.js'), 'utf8')}\nthis.data = TRICKCAL_STAT_DATA;`,
  statDataContext
);
const barongDollCard = cardDataContext.library.artifacts.find(card => (
  card.id === 'artifact_barong_cursed_doll'
));
const barongDollEffect = barongDollCard?.conditionalEffects?.find(effect => (
  effect.id === 'artifact_barong_cursed_doll_e01'
));
assert.ok(barongDollEffect, 'FDC focused test用の呪いのぬいぐるみ効果が生成されている');

const fdcRuntimeSource = source
  .replace(/\r\n/g, '\n')
  .replace(
    [
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
    ].join('\n'),
    ''
  )
  .replace(
    '    createDpsEvaluationInput,\n',
    [
      '    createDpsEvaluationInput,',
      '    createDpsRuntimeEffects,',
      '    createDpsStructuredRuntimeEvents,',
      '    buildFdcApostleSkillOptions,',
      '    buildDpsActionProfiles,',
      '    getDpsRuntimeManagedSkillEffects,',
      '    normalizeCardEffectBonuses,',
      '    getEffectText,',
      '    getDpsDirectTimingSourceEffectId,'
    ].join('\n') + '\n'
  );
const fdcInputValues = {
  'fdc-self-hp': 1000,
  'fdc-atk': 1000,
  'fdc-self-def': 100,
  'fdc-crit': 100,
  'fdc-crit-dmg': 100,
  'fdc-self-crit-res-base': 100,
  'fdc-self-crit-dmg-res-base': 100,
  'fdc-enemy-hp': 1000,
  'fdc-enemy-atk': 100,
  'fdc-enemy-crit': 100,
  'fdc-enemy-crit-dmg': 100,
  'fdc-enemy-skill-value': 100,
  'fdc-def': 100,
  'fdc-crit-res': 100,
  'fdc-crit-dmg-res': 100,
  'fdc-self-type': 100,
  'fdc-self-other': 100
};
const fdcRuntimeContext = {
  APOSTLE_LIBRARY: apostleContext.library,
  CARD_LIBRARY: cardDataContext.library,
  TRICKCAL_STAT_DATA: statDataContext.data,
  DPS_TIMING_DATA: timingData,
  ENEMY_PRESETS: [],
  resolveCardIdAlias(value) { return value; },
  TRICKCAL_DPS_TRIGGER_POLICY: require('../dps-trigger-policy.js'),
  window: {
    TRICKCAL_DPS_TRIGGER_POLICY: require('../dps-trigger-policy.js'),
    addEventListener() {},
    dispatchEvent() {},
    innerWidth: 1280,
    innerHeight: 720,
    scrollY: 0
  },
  document: {
    documentElement: { classList: { add() {} }, style: { setProperty() {} } },
    getElementById(id) {
      return Object.hasOwn(fdcInputValues, id) ? { value: String(fdcInputValues[id]) } : null;
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {}
  },
  localStorage: {
    getItem(key) {
      if (key !== 'trickcal_stat_prototype_v1') return null;
      return JSON.stringify({
        formation: {
          rows: [
            { apostles: ['Sylla', '', ''], artifacts: [['', '', ''], ['', '', ''], ['', '', '']] },
            { apostles: ['', '', ''], artifacts: [['', '', ''], ['', '', ''], ['', '', '']] },
            { apostles: ['', '', ''], artifacts: [['', '', ''], ['', '', ''], ['', '', '']] }
          ],
          spells: []
        },
        apostles: {
          Sylla: {
            level: 1,
            star: 1,
            rank: 1,
            asideRank: 2,
            asideLevel: 1,
            finalStats: {
              hp: 1000,
              physicalAtk: 1000,
              magicAtk: 1,
              physicalDef: 100,
              magicDef: 100,
              crit: 100,
              critDmg: 100,
              critRes: 100,
              critDmgRes: 100,
              spRegen: 0
            }
          }
        },
        cards: {}
      });
    },
    setItem() {}
  },
  sessionStorage: { getItem() { return null; }, setItem() {} }
};
vm.runInNewContext(
  `${fdcRuntimeSource}\nthis.api = window.TRICKCAL_DAMAGE_CALC;`,
  fdcRuntimeContext
);
const fdcApi = fdcRuntimeContext.api;
const dollText = fdcApi.getEffectText(barongDollEffect);
const dollBonuses = fdcApi.normalizeCardEffectBonuses(
  barongDollEffect.bonusesByStar[0],
  'unknown',
  dollText,
  barongDollEffect
);
assert.deepEqual(
  plain(dollBonuses),
  { enhancedAddP: 50 },
  'FDC生成時に呪いのぬいぐるみのaddPを強化攻撃専用へ正規化する'
);
const dollAuditRow = {
  key: 'effect:artifact_barong_cursed_doll_e01',
  cardId: barongDollCard.id,
  effectId: barongDollEffect.id,
  sourceId: barongDollCard.id,
  label: barongDollEffect.label,
  source: '装備遺物',
  category: 'カード',
  effectType: barongDollEffect.effectType,
  condition: barongDollEffect.condition,
  triggerType: barongDollEffect.triggerType,
  effectTarget: '自分',
  durationSeconds: Number(barongDollEffect.duration),
  stackMax: 1,
  stackable: false,
  rawText: dollText,
  bonuses: {},
  runtimeBonuses: dollBonuses,
  enabled: false,
  sourceDisabled: false,
  singleManualDisabled: true,
  nonStackingSameEffect: true
};
const generatedDollRuntime = fdcApi.createDpsRuntimeEffects({
  basicAttack: { rows: [dollAuditRow] }
}, {});
const generatedDollBuff = generatedDollRuntime.damageBuffEffects.find(effect => (
  effect.id === 'artifact_barong_cursed_doll_e01'
));
assert.equal(generatedDollBuff?.mode, 'statusApplicationTimed',
  'FDC生成結果で呪いのぬいぐるみを状態異常付与起点の時限バフにする');
assert.deepEqual(plain(generatedDollBuff?.modifiers), { enhancedAddP: 50 },
  'FDC生成結果の呪いのぬいぐるみはenhancedAddPだけを持つ');
assert.equal(generatedDollBuff?.durationFrames, 360,
  'FDC生成結果の呪いのぬいぐるみは6秒=360Fにする');

const barongApostle = apostleContext.library.find(apostle => apostle.id === 'barong');
const structuredBarong = fdcApi.createDpsStructuredRuntimeEvents({
  apostle: barongApostle,
  target: { id: 'barong', name: 'バロン', artifactIds: [] },
  context: { state: { cards: {} }, formation: { spells: [] } },
  skillLevels: { low: 1, high: 1, passive: 1, default: 1, asideRank: 2 },
  timingEffectBindings: barongTimingBindings,
  runtimeManagedEffects: [],
  selectedSkillOptions: [],
  singleActionProfiles: {}
});
const structuredPoison = structuredBarong.eventEffects.find(effect => effect.steps.some(step => (
  step.application?.applicationEffectId === 'Barong_aside_2_e05'
)));
const structuredHeal = structuredBarong.eventEffects.find(effect => effect.steps.some(step => (
  step.effectId === 'Barong_aside_2_e07'
)));
const structuredCurse = structuredBarong.eventEffects.find(effect => effect.steps.some(step => (
  step.application?.applicationEffectId === 'Barong_aside_2_e03'
)));
assert.equal(structuredPoison?.timingSourceEffectId, 'Barong_aside_2_e05',
  'FDC構造化イベントへBarong A2毒の直接timing bindingを渡す');
assert.equal(structuredHeal?.timingSourceEffectId, 'Barong_aside_2_e07',
  'FDC構造化イベントへBarong A2回復の直接timing bindingを渡す');
assert.equal(structuredCurse?.timingSourceEffectId, 'Barong_aside_2_e03',
  'FDC構造化イベントへBarong A2霧呪いの生成物timing bindingを渡す');
assert.equal(
  fdcApi.getDpsDirectTimingSourceEffectId(
    barongAsidePoisonEffectForTest(barongApostle),
    { timingEffectBindings: barongTimingBindings }
  ),
  'Barong_aside_2_e05',
  'FDC評価系の直接timing解決がBarong A2毒へ到達する'
);

// FDCで構造化した実データのイベントをそのままシミュレーターへ渡し、
// 選択中A2の共通本体行も含めて低学年が実際にダメージを出すことを確認する。
const fdcBarongRuntimeConfig = simulator.buildCombatantConfig(barongApostle, barongTiming, {
  skillLevels: { low: 1, high: 1, passive: 1, default: 1, asideRank: 2 },
  timingBranches: barongAsideBranches,
  runtimeEffects: {
    ...structuredBarong,
    spRecoveryEffects: [{ id: 'fdc-focused-initial-sp', mode: 'initial', fixed: 300 }]
  }
});
fdcBarongRuntimeConfig.spRegen = 0;
const fdcBarongResult = simulator.simulate(fdcBarongRuntimeConfig, {
  durationSeconds: 7,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  recordTimeline: true,
  damageProfiles: {
    lowSkill: {
      variants: {
        アサイド2: {
          effects: {
            Barong_low_e01: { effectId: 'Barong_low_e01', expectedDamage: 100 }
          },
          totalExpectedDamage: 100
        }
      }
    }
  },
  statusDamageProfiles: { 毒: { expectedDamage: 1 } }
});
const fdcBarongLowStart = fdcBarongResult.timeline.find(event => (
  event.type === 'actionStart' && event.actionKey === 'lowSkill'
));
const fdcBarongLowHits = fdcBarongResult.timeline.filter(event => (
  event.type === 'hit' && event.actionKey === 'lowSkill' && event.effectId === 'Barong_low_e01'
));
assert.equal(fdcBarongLowHits.length, 1,
  'FDC生成イベントを使ったBarong A2低学年の本体ダメージは1回である');
assert.equal(fdcBarongLowHits[0]?.frame, fdcBarongLowStart?.frame + 166,
  'FDC生成イベントを使ったBarong A2低学年本体はframe166で発生する');
assert.ok(fdcBarongLowHits[0]?.expectedDamage > 0,
  'FDC生成イベントを使ったBarong A2低学年本体ダメージは0にならない');
const fdcBarongPoison = fdcBarongResult.timeline.find(event => (
  event.type === 'statusApplied' && event.status === '毒'
));
assert.equal(fdcBarongPoison?.frame, fdcBarongLowStart?.frame + 166,
  'FDC生成イベントを使ったBarong A2毒はframe166で付与する');
const fdcBarongHeal = fdcBarongResult.timeline.find(event => (
  event.type === 'runtimeHealingEvent' && event.effectId === 'Barong_aside_2_e07'
));
assert.equal(fdcBarongHeal?.frame, fdcBarongLowStart?.frame + 166,
  'FDC生成イベントを使ったBarong A2回復はframe166で発生する');

// シーラの竜巻はskillmotionの直接行ではなく、普通攻撃命中を起点に
// runtime eventとして生成する。実データのA2効果をそのままFDC builderへ
// 渡し、e02確率・e03連鎖条件・A1非発動を検証する。
const syllaApostle = apostleContext.library.find(apostle => apostle.id === 'sylla');
const syllaAsideEffects = syllaApostle?.aside?.levels?.['2']?.effects || [];
const syllaTornadoEffects = syllaAsideEffects.filter(effect => (
  ['Sylla_aside_2_e02', 'Sylla_aside_2_e03'].includes(effect.effectId)
));
assert.equal(syllaTornadoEffects.length, 2, '生成データにシーラA2竜巻e02/e03が存在する');
const syllaBuilderTarget = {
  id: 'Sylla',
  name: 'シーラ',
  artifactIds: [],
  skillLevels: { low: 1, high: 1, passive: 1 },
  asideRank: 2,
  asideLevel: 1
};
const syllaBuilderContext = {
  state: { cards: {} },
  formation: { spells: [] },
  damageType: 'physical',
  actionCategory: '基本攻撃'
};
const syllaBuiltOptions = fdcApi.buildFdcApostleSkillOptions(
  syllaBuilderTarget,
  syllaBuilderContext
);
const syllaBuiltE02 = syllaBuiltOptions.find(option => option.effectId === 'Sylla_aside_2_e02');
const syllaBuiltE03 = syllaBuiltOptions.find(option => option.effectId === 'Sylla_aside_2_e03');
assert.ok(syllaBuiltE02, 'FDCの実スキルオプション生成でシーラe02を取得する');
assert.ok(syllaBuiltE03, 'FDCの実スキルオプション生成でシーラe03を取得する');
assert.equal(Number(syllaBuiltE02.value), 120,
  'FDCの実スキルオプション生成でシーラe02を120%に解決する');
assert.equal(Number(syllaBuiltE03.value), 120,
  'FDCの実スキルオプション生成でシーラe03を120%に解決する');
const syllaBuiltProfiles = fdcApi.buildDpsActionProfiles({
  context: syllaBuilderContext,
  target: syllaBuilderTarget,
  selectedSkillOptions: [syllaBuiltE02, syllaBuiltE03],
  runtimeManagedEffects: [
    { key: syllaBuiltE02.key, effectId: syllaBuiltE02.effectId },
    { key: syllaBuiltE03.key, effectId: syllaBuiltE03.effectId }
  ]
});
assert.ok(
  Number(syllaBuiltProfiles.singleActionProfiles[syllaBuiltE02.key]?.damageResult?.expected) > 0,
  'FDCアクションプロファイル生成でシーラe02の期待ダメージを0にしない'
);
assert.ok(
  Number(syllaBuiltProfiles.singleActionProfiles[syllaBuiltE03.key]?.damageResult?.expected) > 0,
  'FDCアクションプロファイル生成でシーラe03の期待ダメージを0にしない'
);
assert.equal(Object.values(syllaBuiltProfiles.profiles).some(profile => (
  Object.values(profile.variants || {}).some(variant => (
    Object.hasOwn(variant.effects || {}, 'Sylla_aside_2_e02')
    || Object.hasOwn(variant.effects || {}, 'Sylla_aside_2_e03')
  ))
)), false, 'シーラ竜巻e02/e03を行動本体の静的プロファイルへ二重加算しない');
const syllaStructuredWithProfiles = fdcApi.createDpsStructuredRuntimeEvents({
  apostle: syllaApostle,
  target: syllaBuilderTarget,
  context: syllaBuilderContext,
  skillLevels: { low: 1, high: 1, passive: 1, default: 1, asideRank: 2 },
  selectedSkillOptions: [syllaBuiltE02, syllaBuiltE03],
  singleActionProfiles: syllaBuiltProfiles.singleActionProfiles
});
const syllaProfiledTornado = syllaStructuredWithProfiles.eventEffects.find(effect => (
  effect.effectIds.includes('Sylla_aside_2_e02')
));
const syllaProfiledExtraTornado = syllaStructuredWithProfiles.eventEffects.find(effect => (
  effect.effectIds.includes('Sylla_aside_2_e03')
));
assert.ok(Number(syllaProfiledTornado?.steps?.[0]?.expectedDamage) > 0,
  'FDC構造化イベントにも実e02単発プロファイルの期待ダメージを渡す');
assert.ok(Number(syllaProfiledExtraTornado?.steps?.[0]?.expectedDamage) > 0,
  'FDC構造化イベントにも実e03単発プロファイルの期待ダメージを渡す');
assert.ok(syllaProfiledTornado?.steps?.[0]?.runtimeBase,
  'シーラe02のランタイム再評価用基準値をFDC構造化イベントへ保持する');
assert.ok(syllaProfiledExtraTornado?.steps?.[0]?.runtimeBase,
  'シーラe03のランタイム再評価用基準値をFDC構造化イベントへ保持する');
const syllaSelectedOptions = syllaTornadoEffects.map(effect => ({
  ...effect,
  key: `focused:${effect.effectId}`,
  category: '攻撃',
  sourceCategory: 'A2',
  sourceKey: 'aside:2',
  sourceLabel: 'A2',
  kind: effect.valueKind,
  value: String(effect.fixedValue),
  baseValue: String(effect.fixedValue)
}));
const syllaSingleActionProfiles = Object.fromEntries(syllaSelectedOptions.map(option => [
  option.key,
  { damageResult: { expected: Number(option.fixedValue), runtimeBase: null } }
]));
const syllaStructured = fdcApi.createDpsStructuredRuntimeEvents({
  apostle: syllaApostle,
  target: { id: 'sylla', name: 'シーラ', artifactIds: [] },
  context: { state: { cards: {} }, formation: { spells: [] } },
  skillLevels: { low: 1, high: 1, passive: 1, default: 1, asideRank: 2 },
  selectedSkillOptions: syllaSelectedOptions,
  singleActionProfiles: syllaSingleActionProfiles
});
const syllaTornadoEvent = syllaStructured.eventEffects.find(effect => effect.effectIds.includes('Sylla_aside_2_e02'));
const syllaExtraTornadoEvent = syllaStructured.eventEffects.find(effect => effect.effectIds.includes('Sylla_aside_2_e03'));
assert.equal(syllaTornadoEvent?.triggerType, '普通攻撃命中時一定確率',
  'FDC生成結果のシーラe02は普通攻撃命中時一定確率を保持する');
assert.equal(syllaTornadoEvent?.triggerProbability, 75,
  'FDC生成結果のシーラe02は発動率75%をランタイムへ渡す');
assert.deepEqual(plain(syllaTornadoEvent?.triggerActionKeys), ['basicAttack', 'enhancedAttack'],
  'シーラe02は通常攻撃の行動後イベントとしてバインドする');
assert.equal(syllaTornadoEvent?.oncePerAction, true,
  'シーラe02は普通攻撃multi-hitでも1行動1抽選にする');
assert.equal(syllaTornadoEvent?.steps?.[0]?.effectId, 'Sylla_aside_2_e02',
  'シーラe02のruntime damage effect IDを保持する');
assert.equal(syllaTornadoEvent?.steps?.[0]?.expectedDamage, 120,
  'シーラe02のFDC単発プロファイルを120%として渡す');
assert.equal(syllaExtraTornadoEvent?.triggerType, '竜巻ダメージ発生時',
  'FDC生成結果のシーラe03は竜巻発生時トリガーを保持する');
assert.equal(syllaExtraTornadoEvent?.triggerSourceId, 'Sylla_aside_2_e02',
  'シーラe03はe02のruntime effect IDを発生元にする');
assert.equal(syllaExtraTornadoEvent?.conditionType, '追加対象存在',
  'シーラe03は追加対象存在条件を保持する');
assert.equal(syllaExtraTornadoEvent?.conditionValue, '1',
  'シーラe03は追加対象1体条件を保持する');
assert.deepEqual(plain(syllaExtraTornadoEvent?.triggerActionKeys), [],
  'シーラe03は通常攻撃へ直接バインドせずe02連鎖だけで発火する');
const syllaStructuredA1 = fdcApi.createDpsStructuredRuntimeEvents({
  apostle: syllaApostle,
  target: { id: 'sylla', name: 'シーラ', artifactIds: [] },
  context: { state: { cards: {} }, formation: { spells: [] } },
  skillLevels: { low: 1, high: 1, passive: 1, default: 1, asideRank: 1 },
  selectedSkillOptions: syllaSelectedOptions,
  singleActionProfiles: syllaSingleActionProfiles
});
assert.equal(syllaStructuredA1.eventEffects.some(effect => effect.effectIds.includes('Sylla_aside_2_e02')), false,
  'シーラA1ではA2竜巻e02を混入しない');
assert.equal(syllaStructuredA1.eventEffects.some(effect => effect.effectIds.includes('Sylla_aside_2_e03')), false,
  'シーラA1ではA2竜巻e03を混入しない');

// 本番と同じ ownership + skillmotion binding を渡す経路では、行動本体の
// damage をstructured runtimeへ複製しない。A2の明示runtime追加ダメージ
// だけを残す。
const syllaTiming = timingData.apostles.sylla;
const syllaTimingBranches = timingBranchContext.api.createDpsAsideTimingBranches(syllaTiming, 2);
const syllaTimingBindings = timingBranchContext.api.createDpsTimingEffectBindings(
  syllaTiming,
  syllaTimingBranches
);
const syllaRuntimeManagedEffects = fdcApi.getDpsRuntimeManagedSkillEffects(
  syllaBuilderTarget,
  syllaBuilderContext,
  syllaBuiltOptions,
  { timingEffectBindings: syllaTimingBindings }
);
assert.ok(syllaRuntimeManagedEffects.some(effect => effect.effectId === 'Sylla_aside_2_e02'),
  'シーラe02を明示runtime所有として判定する');
assert.ok(syllaRuntimeManagedEffects.some(effect => effect.effectId === 'Sylla_aside_2_e03'),
  'シーラe03連鎖を明示runtime所有として判定する');
const syllaProductionProfiles = fdcApi.buildDpsActionProfiles({
  context: syllaBuilderContext,
  target: syllaBuilderTarget,
  selectedSkillOptions: syllaBuiltOptions,
  runtimeManagedEffects: syllaRuntimeManagedEffects
});
const syllaProductionStructured = fdcApi.createDpsStructuredRuntimeEvents({
  apostle: syllaApostle,
  target: syllaBuilderTarget,
  context: syllaBuilderContext,
  skillLevels: { low: 1, high: 1, passive: 1, default: 1, asideRank: 2 },
  selectedSkillOptions: syllaBuiltOptions,
  singleActionProfiles: syllaProductionProfiles.singleActionProfiles,
  runtimeManagedEffects: syllaRuntimeManagedEffects,
  timingEffectBindings: syllaTimingBindings
});
const syllaProductionRuntimeDamageIds = syllaProductionStructured.eventEffects.flatMap(effect => (
  effect.steps.filter(step => step.type === 'damage').map(step => step.effectId)
));
['Sylla_basic_e01', 'Sylla_low_e01', 'Sylla_high_e01'].forEach(effectId => {
  assert.equal(syllaProductionRuntimeDamageIds.includes(effectId), false,
    `本番structured runtimeへ行動本体${effectId}を二重登録しない`);
});
assert.ok(syllaProductionRuntimeDamageIds.includes('Sylla_aside_2_e02'),
  '本番structured runtimeに明示確率追加ダメージe02を残す');
assert.ok(syllaProductionRuntimeDamageIds.includes('Sylla_aside_2_e03'),
  '本番structured runtimeにeffect-source連鎖e03を残す');
const buildSyllaProductionConfig = (spRecoveryEffects = []) => {
  const config = simulator.buildCombatantConfig(syllaApostle, syllaTiming, {
    asideRank: 2,
    skillLevels: { low: 1, high: 1, passive: 1, default: 1, asideRank: 2 },
    timingBranches: syllaTimingBranches,
    runtimeEffects: { ...syllaProductionStructured, spRecoveryEffects }
  });
  config.spRegen = 0;
  return config;
};
const syllaProductionBasicResult = simulator.simulate(buildSyllaProductionConfig(), {
  durationSeconds: 12,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  seed: 1,
  recordTimeline: true,
  damageProfiles: syllaProductionProfiles.profiles
});
assert.ok(Number(syllaProductionBasicResult.damage.byAction.basicAttack) > 0,
  'シーラ基本攻撃本体は行動ダメージとして計上する');
const syllaRuntimeTornadoId = syllaProductionStructured.eventEffects.find(effect => (
  effect.effectIds.includes('Sylla_aside_2_e02')
))?.id;
assert.ok(Number(syllaProductionBasicResult.damage.byRuntimeEffect[syllaRuntimeTornadoId]) > 0,
  'シーラA2竜巻だけはruntime damageとして計上する');
assert.equal(Object.hasOwn(syllaProductionBasicResult.damage.byRuntimeEffect, 'Sylla_basic_e01'), false,
  'シーラ基本攻撃本体をruntime damageへ二重計上しない');
const syllaProductionLowResult = simulator.simulate(buildSyllaProductionConfig([
  { id: 'focused-sylla-initial-sp', mode: 'initial', fixed: 999 }
]), {
  durationSeconds: 8,
  initialActionDelayFrames: 0,
  highSkillMode: 'disabled',
  seed: 1,
  recordTimeline: true,
  damageProfiles: syllaProductionProfiles.profiles
});
assert.ok(Number(syllaProductionLowResult.damage.byAction.lowSkill) > 0,
  'シーラ低学年本体は行動ダメージとして計上する');
assert.equal(Object.hasOwn(syllaProductionLowResult.damage.byRuntimeEffect, 'Sylla_low_e01'), false,
  'シーラ低学年本体をruntime damageへ二重計上しない');

// 全使徒横断: skillmotionに直接結び付く本体倍率は、明示runtime所有でない限り
// structured eventのdamage stepへ混入させない。一方で実シーラe02/e03は上で
// ownershipありとして残るため、除外条件が追加攻撃全般を消していないことも担保する。
const isAttackMultiplier = effect => (
  (!effect.valueClass || effect.valueClass === '倍率')
  && (!effect.effectType || /攻撃|ダメージ/.test(effect.effectType))
  && /ダメージ/.test(effect.valueKind || '')
  && !/被ダメージ|被スキルダメージ|ダメージ量減少|回復|シールド/.test(effect.valueKind || '')
);
const directTimedDamageLeaks = [];
apostleContext.library.forEach(apostle => {
  const timing = timingData.apostles[apostle.id];
  if (!timing) return;
  const target = {
    id: apostle.id,
    name: apostle.name,
    artifactIds: [],
    skillLevels: { low: 1, high: 1, passive: 1 },
    asideRank: 3,
    asideLevel: 1
  };
  const context = { state: { cards: {} }, formation: { spells: [] }, damageType: 'physical' };
  const branches = timingBranchContext.api.createDpsAsideTimingBranches(timing, 3);
  const bindings = timingBranchContext.api.createDpsTimingEffectBindings(timing, branches);
  const options = fdcApi.buildFdcApostleSkillOptions(target, context);
  const managedEffects = fdcApi.getDpsRuntimeManagedSkillEffects(target, context, options, {
    timingEffectBindings: bindings
  });
  const managedIds = new Set(managedEffects.map(effect => effect.effectId));
  const structured = fdcApi.createDpsStructuredRuntimeEvents({
    apostle,
    target,
    context,
    skillLevels: { low: 1, high: 1, passive: 1, default: 1, asideRank: 3 },
    selectedSkillOptions: options,
    singleActionProfiles: {},
    runtimeManagedEffects: managedEffects,
    timingEffectBindings: bindings
  });
  const runtimeDamageIds = new Set(structured.eventEffects.flatMap(effect => (
    effect.steps.filter(step => step.type === 'damage').map(step => step.effectId)
  )));
  const directTimedDamageIds = [
    ...(apostle.skills || []).flatMap(skill => skill.effects || []),
    ...Object.values(apostle.aside?.levels || {}).flatMap(level => level.effects || [])
  ].filter(effect => (
    isAttackMultiplier(effect)
    && Object.hasOwn(bindings, effect.effectId)
    && !managedIds.has(effect.effectId)
  )).map(effect => effect.effectId);
  directTimedDamageIds.forEach(effectId => {
    if (runtimeDamageIds.has(effectId)) directTimedDamageLeaks.push(`${apostle.id}:${effectId}`);
  });
});
assert.deepEqual(directTimedDamageLeaks, [],
  '全使徒でdirect timingの行動本体倍率をstructured runtimeへ二重登録しない');

function barongAsidePoisonEffectForTest(apostle) {
  return apostle?.aside?.levels?.['2']?.effects?.find(effect => (
    effect.effectId === 'Barong_aside_2_e05'
  )) || {};
}

const aya = apostleContext.library.find(apostle => apostle.id === 'aya');
const ayaFavorite3 = aya?.favoriteCard?.levels?.['3']
  ?.flatMap(level => level.effects || [])
  .find(effect => effect.effectId === 'Aya_favorite_3_e01');
assert.ok(ayaFavorite3, '生成データにアヤ愛用品Lv3効果が存在する');

const rewriteContext = {};
vm.runInNewContext(`
  function normalizeFdcArray(value) { return Array.isArray(value) ? value : value ? [value] : []; }
  function unique(values) { return [...new Set(values)]; }
  ${extractTopLevelFunction('getDpsTargetActionKeys')}
  ${extractTopLevelFunction('isFdcExclusiveProbabilityRewriteEffect')}
  this.api = { isFdcExclusiveProbabilityRewriteEffect };
`, rewriteContext);
const xionFavoriteLv1Effects = apostleContext.library.find(apostle => apostle.id === 'xion')
  ?.favoriteCard?.levels?.['1']?.[0]?.effects;
assert.ok(xionFavoriteLv1Effects, 'シオン愛用品Lv1の生成データが存在する');
const xionPassiveEffects = apostleContext.library.find(apostle => apostle.id === 'xion')
  ?.skills?.find(skill => skill.skillId === 'Xion_passive')?.effects;
assert.ok(xionPassiveEffects, 'シオンパッシブの生成データが存在する');

const runtimeManagedContext = {};
vm.runInNewContext(`
  function getDpsStructuredStatusCondition() { return ''; }
  function isDpsUnsupportedRuntimeTrigger() { return false; }
  function getDpsRuntimeTriggerText(option, fallbackText) { return fallbackText; }
  function getDpsTargetActionKeys() { return []; }
  ${extractTopLevelFunction('isDpsRuntimeManagedSkillEffect')}
  this.api = { isDpsRuntimeManagedSkillEffect };
`, runtimeManagedContext);
const xionHeldBulletDamage = xionPassiveEffects.find(effect => effect.effectId === 'Xion_passive_e04');
const xionBulletGainAttack = xionPassiveEffects.find(effect => effect.effectId === 'Xion_passive_e01');
assert.equal(
  runtimeManagedContext.api.isDpsRuntimeManagedSkillEffect(xionHeldBulletDamage),
  true,
  '構造化されたリソース所持条件のシオン魔弾与ダメージ補正をDPSランタイム管理へ移す'
);
assert.equal(
  runtimeManagedContext.api.isDpsRuntimeManagedSkillEffect(xionBulletGainAttack),
  true,
  '魔弾獲得時の物理攻撃力バフもDPSランタイム管理を維持する'
);
assert.equal(
  rewriteContext.api.isFdcExclusiveProbabilityRewriteEffect(
    xionFavoriteLv1Effects[0],
    xionFavoriteLv1Effects
  ),
  true,
  '同一基本攻撃対象で確率合計100%のシオン愛用品弾種を置換候補として識別する'
);
const blanchetFavoriteLv1Effects = apostleContext.library.find(apostle => apostle.id === 'blanchet')
  ?.favoriteCard?.levels?.['1']?.[0]?.effects;
assert.ok(blanchetFavoriteLv1Effects, 'ブランセ愛用品Lv1の生成データが存在する');
assert.equal(
  rewriteContext.api.isFdcExclusiveProbabilityRewriteEffect(
    blanchetFavoriteLv1Effects[0],
    blanchetFavoriteLv1Effects
  ),
  false,
  '同一processGroupIdのブランセ愛用品Lv1連続攻撃を確率置換候補にしない'
);

const conditionalRewriteContext = {};
vm.runInNewContext(`
  function unique(values) { return [...new Set(values)]; }
  ${extractTopLevelFunction('getDpsTargetActionKeys')}
  ${extractTopLevelFunction('isFdcSkillRewriteOption')}
  this.api = { isFdcSkillRewriteOption };
`, conditionalRewriteContext);
const barongFavoriteLv1Damage = apostleContext.library.find(apostle => apostle.id === 'barong')
  ?.favoriteCard?.levels?.['1']?.[0]?.effects
  .find(effect => effect.effectId === 'Barong_favorite_1_e01');
assert.ok(barongFavoriteLv1Damage, 'バロン愛用品Lv1の生成データが存在する');
assert.equal(
  conditionalRewriteContext.api.isFdcSkillRewriteOption({
    sourceKey: 'favorite:1',
    targetSkill: barongFavoriteLv1Damage.targetSkill,
    effectType: barongFavoriteLv1Damage.effectType,
    valueKind: barongFavoriteLv1Damage.valueKind,
    triggerType: barongFavoriteLv1Damage.triggerType
  }),
  true,
  '状態存在を条件に通常攻撃を切り替えるバロン愛用品Lv1をスキル書き換えとして扱う'
);

assert.deepEqual(
  plain(context.api.normalizeFdcSkillEffectBonus(ayaFavorite3, 1)),
  { lowSkillAddP: 33 },
  'アヤ愛用品Lv3は低学年専用の与ダメージ量補正へ振り分ける'
);
assert.deepEqual(
  plain(context.api.judgeFdcEffectValueActionScope(ayaFavorite3, '低学年スキル')),
  { hasActionScope: true, matched: true },
  'アヤ愛用品Lv3は低学年選択時だけ条件一致する'
);
assert.deepEqual(
  plain(context.api.judgeFdcEffectValueActionScope(ayaFavorite3, '高学年スキル')),
  { hasActionScope: true, matched: false },
  'アヤ愛用品Lv3を高学年へ適用しない'
);
assert.deepEqual(
  plain(context.api.judgeFdcEffectValueActionScope(ayaFavorite3, '基本攻撃')),
  { hasActionScope: true, matched: false },
  'アヤ愛用品Lv3を基本攻撃へ適用しない'
);

const highSkillOnly = {
  valueKind: '高学年スキルダメージ量増加',
  valueClass: '倍率',
  effectType: 'バフ',
  effectTarget: '自身',
  fixedValue: 25
};
assert.deepEqual(
  plain(context.api.normalizeFdcSkillEffectBonus(highSkillOnly, 1)),
  { highSkillAddP: 25 },
  '同型の高学年効果も高学年専用補正へ振り分ける'
);

const genericDamageAmount = {
  valueKind: '与ダメージ量増加',
  valueClass: '倍率',
  effectType: 'バフ',
  effectTarget: '自身',
  fixedValue: 20
};
assert.deepEqual(
  plain(context.api.normalizeFdcSkillEffectBonus(genericDamageAmount, 1)),
  { addP: 20 },
  '行動指定のない与ダメージ量増加は汎用addPを維持する'
);

const sourceSkillOnly = {
  ...genericDamageAmount,
  targetSkill: '低学年',
  conditionType: '領域内',
  conditionValue: 'sample_area'
};
assert.deepEqual(
  plain(context.api.normalizeFdcSkillEffectBonus(sourceSkillOnly, 1)),
  { addP: 20 },
  '発動元・所属スキルだけが低学年の汎用バフを低学年専用へ狭めない'
);

const formationLowSkillTrigger = {
  triggerType: '低学年スキル使用時',
  triggerSourceId: '低学年スキル',
  valueKind: '攻撃力増加'
};
assert.equal(
  context.api.isFdcFormationOwnerRuntimeTrigger(formationLowSkillTrigger),
  true,
  '編成使徒本人の低学年使用時は外部タイムライン条件として扱う'
);
assert.deepEqual(
  plain(context.api.judgeFdcEffectValueActionScope(formationLowSkillTrigger, '低学年スキル')),
  { hasActionScope: true, matched: true },
  '本人スキル効果では従来どおり本人の選択行動を発動条件に利用できる'
);
assert.deepEqual(
  plain(context.api.judgeFdcEffectValueActionScope(
    formationLowSkillTrigger,
    '低学年スキル',
    { includeTriggerAction: false }
  )),
  { hasActionScope: false, matched: true },
  '編成効果では選択使徒の低学年を編成使徒本人の発動条件に利用しない'
);
assert.equal(
  context.api.isFdcFormationOwnerRuntimeTrigger({ triggerType: 'ウェーブ開始時' }),
  false,
  'ウェーブ開始時は共通戦闘時計で解決できる'
);
assert.equal(
  context.api.isFdcFormationOwnerRuntimeTrigger({ triggerType: 'n秒ごと' }),
  false,
  'n秒ごとは共通戦闘時計で解決できる'
);
assert.equal(
  context.api.isFdcFormationOwnerRuntimeTrigger({ condition: '高学年スキル使用時' }),
  true,
  '旧形式の行動発動条件も編成使徒本人の条件として扱う'
);

console.log('FDC action-scoped addP tests passed');
