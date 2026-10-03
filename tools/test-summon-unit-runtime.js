'use strict';
const assert = require('node:assert/strict');
const simulator = require('../dps-simulator.js');
const skill = { id: 'fixture', skills: [{ skillId: 'fixture_basic', skillType: '普通攻撃_基本',
  effects: [{ effectId: 'clone_hit', valueKind: '魔法ダメージ', effectType: '攻撃', fixedValue: 30 }] }] };
function definition(count = 1) {
  return { id: 'clone', executionMode: '召喚ユニット', spawnFrame: 0, spawnCount: count,
    cancelPolicy: '継続', attackSpeedReference: '生成物自身', attackSpeedBase: 150,
    endConditions: [{ conditionType: '生成後経過時間', conditionFrames: 360 }],
    summonActions: [{ id: 'attack', actionType: '通常攻撃', motionFrames: 58 }],
    timingEvents: [
      ...Array.from({ length: count }, (_, index) => ({ eventType: '行動開始', instanceOrder: index + 1,
        frame: 0, timeOrigin: '生成時', actionId: 'attack', recordPurpose: '実行' })),
      { eventType: '攻撃', frame: 10, timeOrigin: '召喚ユニット行動開始', actionId: 'attack',
        effectKind: '魔法ダメージ', effectId: 'clone_hit', lv1PerHitMultiplier: 30, recordPurpose: '実行' },
      { eventType: '攻撃', frame: 1, timeOrigin: '生成時', actionId: 'attack', recordPurpose: '観測' }
    ] };
}
function build(def = definition(), haste = 0) {
  return simulator.buildCombatantConfig(skill, { normalAttackIntervalFrames: 9999, actions: { basicAttack: {
    motionFrames: 1, generatedObjects: [def]
  } } }, { runtimeEffects: {
    attackSpeedEffects: haste ? [{ id: 'owner-speed', mode: 'initial', percent: haste }] : [],
    spRecoveryEffects: [{ id: 'owner-on-hit-sp', mode: 'actionHit', triggerActionKeys: ['basicAttack'], fixed: 50 }]
  } });
}
const speed = { attackSpeedP: 0, selfSpeed: 1, otherSpeed: 1 };
const adapters = new Set();
function run(def = definition(), opts = {}, getSpeed = () => speed) {
  return simulator.simulate(build(def, opts.ownerHaste || 0), { durationSeconds: 6, initialActionDelayFrames: 0,
    recordTimeline: true, maxTimelineEvents: 10000,
    damageProfiles: { basicAttack: { totalExpectedDamage: 999999 } },
    resolveSummonUnit: () => { const adapter = { getSpeed,
      getHitInput: ({ event, state }) => { adapters.add(state); return { baseDamage: 1000,
        coefficientP: event.lv1PerHitMultiplier, critRate: 0, critMult: 1.5 }; } }; return adapter; },
    ...opts });
}
const frames = result => result.timeline.filter(event => event.type === 'hit').map(event => event.frame);
const baseline = run();
assert.deepEqual(frames(baseline), [10, 130, 250]);
assert.equal(baseline.damage.totalExpectedDamage, 900, 'damage uses summon inputs, not the owner profile');
const eventEqualsHit = definition();
eventEqualsHit.timingEvents.find(event => event.eventType === '攻撃' && event.recordPurpose === '実行').frame = 20;
assert.deepEqual(frames(run(eventEqualsHit)), [20, 140, 260],
  '20F attack events hit immediately without an additional flight delay (fixture start is 0F)');
assert.deepEqual(frames(run(definition(), { ownerHaste: 100 })), frames(baseline));
assert.deepEqual(frames(run(definition(), { enableFastForward: false })), frames(baseline));
assert.deepEqual(frames(run(definition(), {}, () => ({ ...speed, selfSpeed: 2, otherSpeed: 2 }))),
  [5, 36, 67, 98, 129, 160, 191, 222, 253, 284, 315, 346]);
const zeroWait = run(definition(), {}, () => ({ ...speed, attackSpeedP: 100, otherSpeed: 2 }));
assert.deepEqual(zeroWait.timeline.filter(event => event.type === 'summonActionStart').slice(0, 3).map(event => event.frame),
  [0, 30, 60], 'zero wait cannot add an extra tick per attack');
const accelerated = run(definition(), {}, ({ frame }) => frame >= 20 ? { ...speed, selfSpeed: 2, otherSpeed: 2 } : speed);
assert.deepEqual(accelerated.timeline.filter(event => event.type === 'summonActionStart').slice(0, 2).map(event => event.frame),
  [0, 101], 'animation speed changes do not recalculate the captured 62F wait');
adapters.clear();
const multiple = run(definition(2));
assert.equal(multiple.damage.totalExpectedDamage, 1800);
assert.equal(adapters.size, 2, 'each instance owns a distinct state');
const expires = definition(); expires.endConditions[0].conditionFrames = 130;
assert.deepEqual(frames(run(expires)), [10], 'hit exactly at lifetime end is excluded');
const missing = definition(); missing.timingEvents[0].frame = null;
assert.throws(() => run(missing), /初回行動開始/);
assert.throws(() => simulator.simulate(build()), /供給処理/);
assert.equal(baseline.runtimeEffects.spRecoveryEffects.find(effect => effect.id === 'owner-on-hit-sp').triggerCount, 0,
  'a configured owner on-hit SP effect must not be triggered by summon hits');
assert.equal(simulator.calculateActionSpeedTiming(120, 58).waitFrames, 62);
console.log('Summon actor clock, independent damage/state, acceleration, observations and safety guards passed');
