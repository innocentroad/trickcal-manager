'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const simulator = require('../dps-simulator.js');
const context = {};
vm.runInNewContext(fs.readFileSync(require.resolve('../apostles.js'), 'utf8')
  + ';this.library=APOSTLE_LIBRARY;', context);
const timingData = require('../dps-timing-data.js');
for (const [id, base, withAside] of [
  ['amelia', 25, 40], ['epica', 25, 40], ['canna', 20, 35],
  ['jade', 25, 34], ['fricle', 33, 40.5]
]) {
  const apostle = context.library.find(item => item.id === id);
  assert.ok(apostle, `${id}: real apostle data exists`);
  // Jade has no measured DPS timing. This fallback only checks config construction,
  // not DPS support or a game-accurate motion.
  const timing = timingData.apostles[id] || { actions: {
    basicAttack: { motionFrames: 1 }, enhancedAttack: { motionFrames: 1 }
  } };
  const build = rank => simulator.buildCombatantConfig(apostle, timing,
    { skillLevels: { asideRank: rank } });
  assert.equal(build(1).actions.enhancedAttack.triggerProbability, base, `${id}: A1 baseline`);
  assert.equal(build(2).actions.enhancedAttack.triggerProbability, withAside, `${id}: A2 additive threshold`);
  assert.equal(build(3).actions.enhancedAttack.triggerProbability, withAside, `${id}: no double A2 at A3`);
  assert.equal(simulator.buildCombatantConfig(apostle, timing, {
    skillLevels: { asideRank: 0 }, scenario: { characterState: { asideRank: 2 } }
  }).actions.enhancedAttack.triggerProbability, base, `${id}: explicit none stays disabled`);
}

const fixture = probability => simulator.buildCombatantConfig({
  id: 'probability-fixture', skills: [
    { skillType: '普通攻撃_基本', effects: [{ effectId: 'basic', effectType: '攻撃', valueClass: '倍率', fixedValue: 100 }] },
    { skillType: '普通攻撃_強化', triggerType: '一定確率', triggerValue: probability,
      effects: [{ effectId: 'enhanced', effectType: '攻撃', valueClass: '倍率', fixedValue: 200 }] }
  ]
}, { normalAttackIntervalFrames: 60, actions: {
  basicAttack: { motionFrames: 1, timingEvents: [{ frame: 0, effectId: 'basic', effectKind: 'ダメージ' }] },
  enhancedAttack: { motionFrames: 1, timingEvents: [{ frame: 0, effectId: 'enhanced', effectKind: 'ダメージ' }] }
} });
// One deterministic seed per integer bucket. No Monte Carlo tolerance or flaky frequency test.
const seeds = new Map();
for (let seed = 1; seeds.size < 100 && seed < 100000; seed++) {
  const roll = simulator.createSeededRandom(seed)() * 100;
  if (!seeds.has(Math.floor(roll))) seeds.set(Math.floor(roll), { seed, roll });
}
assert.equal(seeds.size, 100);
const config = fixture(33);
config.actions.enhancedAttack.triggerProbability = 40.5;
let successCount = 0;
for (const [bucket, { seed }] of seeds) {
  const result = simulator.simulate(config, { durationSeconds: 0.05,
    initialActionDelayFrames: 0, seed, highSkillMode: 'disabled', recordTimeline: true });
  const enhanced = result.timeline.find(item => item.type === 'actionStart').actionKey === 'enhancedAttack';
  assert.equal(enhanced, bucket < 40.5, `integer roll bucket ${bucket}`);
  successCount += Number(enhanced);
}
assert.equal(successCount, 41, '40.5 threshold succeeds on 41 of 100 integer buckets');
// This exact bucket failed with a continuous roll, distinguishing the old implementation.
const boundarySeed = Array.from({ length: 10000 }, (_, index) => index + 1)
  .find(seed => { const roll = simulator.createSeededRandom(seed)() * 100; return roll >= 40.5 && roll < 41; });
assert.ok(boundarySeed);
assert.equal(simulator.simulate(config, { durationSeconds: 0.05,
  initialActionDelayFrames: 0, seed: boundarySeed, highSkillMode: 'disabled', recordTimeline: true })
  .timeline.find(item => item.type === 'actionStart').actionKey, 'enhancedAttack');
console.log('Shared A2 probability / discrete 0-99 threshold tests passed');
