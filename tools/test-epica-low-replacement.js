'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const simulator = require('../dps-simulator.js');
const context = {};
vm.runInNewContext(fs.readFileSync(require.resolve('../apostles.js'), 'utf8')
  + ';this.library=APOSTLE_LIBRARY;', context);
const apostle = context.library.find(item => item.id === 'epica');
const config = simulator.buildCombatantConfig(apostle,
  require('../dps-timing-data.js').apostles.epica, { skillLevels: { asideRank: 2 } });
assert.equal(config.epicaLowReplacementDurationFrames, 540);
config.initialSp = config.maxSp;
config.spRegen = 1; // One low skill; the next one cannot fill within this horizon.
config.actions.enhancedAttack.triggerProbability = 0; // Isolate replacement from random procs.
const profiles = Object.fromEntries(['basicAttack', 'enhancedAttack'].map((key, index) => {
  const effectId = index ? 'Epica_enhanced_e01' : 'Epica_basic_e01';
  return [key, { variants: { default: { effects: {
    [effectId]: { effectId, expectedDamage: index ? 400 : 100 }
  }, totalExpectedDamage: index ? 400 : 100 } } }];
}));
const options = { durationSeconds: 20, initialActionDelayFrames: 0,
  highSkillMode: 'disabled', seed: 1, damageProfiles: profiles, recordTimeline: true };
const result = simulator.simulate(config, options);
const start = result.timeline.find(item => item.type === 'actionStart' && item.actionKey === 'lowSkill');
const apply = result.timeline.find(item => item.kind === 'attackReplacement' && item.operation === 'apply');
const expire = result.timeline.find(item => item.kind === 'attackReplacement' && item.operation === 'expire');
assert.equal(apply.frame, start.frame + 95, 'replacement starts at the generated low-skill effect');
assert.equal(expire.frame, apply.frame + 540, 'nine seconds, not nine seconds from motion start');
const attacks = result.timeline.filter(item => item.type === 'actionStart'
  && ['basicAttack', 'enhancedAttack'].includes(item.actionKey));
assert.ok(attacks.some(item => item.frame < apply.frame && item.actionKey === 'basicAttack'));
const replaced = attacks.filter(item => item.frame >= apply.frame && item.frame < expire.frame);
assert.ok(replaced.length > 1);
assert.ok(replaced.every(item => item.actionKey === 'enhancedAttack'));
assert.ok(attacks.some(item => item.frame >= expire.frame && item.actionKey === 'basicAttack'));
const lateHits = result.timeline.filter(item => item.type === 'hit'
  && item.actionKey === 'enhancedAttack' && item.frame > expire.frame);
assert.equal(lateHits.length, 2, 'expiration does not cancel already fired A2 projectiles');
assert.ok(lateHits.every(item => item.expectedDamage === 400));
const slow = simulator.simulate(config, { ...options, enableFastForward: false });
assert.equal(slow.totalExpectedDamage, result.totalExpectedDamage);
assert.deepEqual(slow.timeline.filter(item => item.kind === 'attackReplacement'),
  result.timeline.filter(item => item.kind === 'attackReplacement'));
const noBuff = simulator.simulate({ ...config, epicaLowReplacementDurationFrames: 0 }, options);
assert.equal(noBuff.timeline.filter(item => item.type === 'actionStart'
  && item.actionKey === 'enhancedAttack').length, 0);
console.log('Epica low-skill replacement / expiration / detached impacts tests passed');
