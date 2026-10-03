'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const simulator = require('../dps-simulator.js');
const root = path.resolve(__dirname, '..');
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'apostles.js'), 'utf8') + ';this.library=APOSTLE_LIBRARY;', context);
const apostle = context.library.find(item => item.id === 'epica');
const timing = require(process.env.EPICA_TIMING_PREVIEW || '../dps-timing-data.js').apostles.epica;
const profiles = Object.fromEntries(['basicAttack', 'enhancedAttack'].map((key, index) => {
  const effectId = index ? 'Epica_enhanced_e01' : 'Epica_basic_e01';
  return [key, { variants: { default: { effects: { [effectId]: { effectId, expectedDamage: index ? 400 : 100 } }, totalExpectedDamage: index ? 400 : 100 } } }];
}));
const build = rank => simulator.buildCombatantConfig(apostle, timing, { skillLevels: { asideRank: rank } });
const a1 = build(1), a2 = build(2), a3 = build(3);
assert.equal(a1.actions.enhancedAttack.triggerProbability, 25);
assert.equal(a2.actions.enhancedAttack.triggerProbability, 40);
assert.equal(a3.actions.enhancedAttack.triggerProbability, 40);
for (const [key, frames] of [['basicAttack', [96, 102]], ['enhancedAttack', [147, 153]]]) {
  const action = a2.actions[key];
  const events = Object.values(action.variants)[0].filter(item => item.type === 'damage');
  assert.deepEqual(events.map(item => item.frame), frames);
  assert.equal(action.motionFrames, key === 'basicAttack' ? 100 : 120);
  assert.equal(events[0].coefficientShare, 1);
  assert.equal(events[1].coefficientShare, 1);
}
function run(config, seconds = 4, extra = {}) {
  return simulator.simulate(config, { durationSeconds: seconds, initialActionDelayFrames: 0,
    seed: 1, highSkillMode: 'disabled', damageProfiles: profiles, recordTimeline: true, ...extra });
}
for (const key of ['basicAttack', 'enhancedAttack']) {
  const config = build(2);
  config.actions.enhancedAttack.triggerProbability = key === 'enhancedAttack' ? 100 : 0;
  const result = run(config);
  const hits = result.timeline.filter(item => item.type === 'hit' && item.actionKey === key);
  assert.equal(hits.length, key === 'basicAttack' ? 4 : 2, 'independent projectiles land within the horizon');
  assert.equal(hits[1].frame - hits[0].frame, 6);
  assert.equal(hits[0].expectedDamage, key === 'basicAttack' ? 100 : 400);
  assert.equal(hits[1].expectedDamage, hits[0].expectedDamage);
  const starts = result.timeline.filter(item => item.type === 'actionStart' && item.actionKey === key);
  assert.equal(starts.length, 2, 'additional impact does not create a second action');
  assert.equal(starts[1].frame, 121, 'late projectile must not extend enhanced motion');
  const slow = run(config, 4, { enableFastForward: false });
  assert.equal(slow.totalExpectedDamage, result.totalExpectedDamage);
  if (key === 'enhancedAttack') {
    assert.equal(run(config, 2.5).timeline.filter(item => item.type === 'hit').length, 1,
      'an additional hit outside the simulation horizon is not counted');
  }
}
assert.doesNotThrow(() => run(a2, 4, { highSkillMode: 'auto' }));
assert.throws(() => run(a2, 4, { enemyCount: 2 }), /敵1体/);
// High skill uses the existing auto scheduler; CT reduction never interrupts an action.
const ctConfig = build(2);
ctConfig.actions.enhancedAttack.triggerProbability = 100;
ctConfig.actions.highSkill.cooldownSeconds = 10;
const ct = run(ctConfig, 4, { highSkillMode: 'auto' });
const changes = ct.timeline.filter(item => item.type === 'cooldownChanged' && item.effectId === 'Epica_aside_2_e03');
assert.equal(changes.length, 2, 'once per enhanced start, never per impact');
assert.equal(changes[0].frame, 0);
assert.equal(changes[0].beforeFrames, 600);
assert.equal(changes[0].afterFrames, 420);
ctConfig.actions.highSkill.cooldownSeconds = 2;
const floorResult = run(ctConfig, 14, { highSkillMode: 'auto' });
const floor = floorResult.timeline.find(item => item.type === 'cooldownChanged' && item.effectId === 'Epica_aside_2_e03');
assert.equal(floor.afterFrames, 0, 'CT reduction clamps at zero');
const highStart = floorResult.timeline.find(item => item.type === 'actionStart' && item.actionKey === 'highSkill');
const baseAuto = build(1);
baseAuto.actions.enhancedAttack.triggerProbability = 100;
baseAuto.actions.highSkill.cooldownSeconds = 2;
const baseHighStart = run(baseAuto, 14, { highSkillMode: 'auto' }).timeline
  .find(item => item.type === 'actionStart' && item.actionKey === 'highSkill');
assert.equal(highStart.frame, baseHighStart.frame,
  'CT0 uses the existing action-end and skill-transition scheduler, without an interrupt');
assert.ok(highStart.frame >= 120, 'the enhanced motion finishes before high starts');
const highEnd = floorResult.timeline.find(item => item.type === 'actionEnd' && item.actionKey === 'highSkill');
assert.ok(highEnd && highEnd.frame === highStart.frame + 600, 'high motion remains the base 600 frames');
assert.equal(floorResult.timeline.filter(item => item.type === 'actionStart'
  && ['basicAttack', 'enhancedAttack'].includes(item.actionKey)
  && item.frame > highStart.frame && item.frame < highEnd.frame).length, 0,
  'no new normal actions are added during the base high motion');
assert.deepEqual(ctConfig.actions.highSkill.variants, a1.actions.highSkill.variants,
  'A2 does not add hits to high-skill projectiles');
assert.equal(run(ctConfig, 14, { highSkillMode: 'auto', enableFastForward: false }).totalExpectedDamage,
  floorResult.totalExpectedDamage, 'auto scheduling agrees with the non-fast-forward path');
console.log('Epica A2 generated timing / detached impacts / proc / CT tests passed');
