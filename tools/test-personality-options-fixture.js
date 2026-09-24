'use strict';
const assert = require('node:assert/strict');
const personality = require('../formation-personality.js');
const names = personality.PERSONALITY_NAMES;
for (const count of [2, 3, 4, 5]) {
  const basic = { id: `fixture-${count}`, personality: '裏面', personalityOptions: names.slice(0, count) };
  const empty = personality.resolveFormationPersonality(basic, null);
  assert.equal(empty.isSelectable, true);
  assert.equal(empty.needsSelection, true);
  assert.equal(empty.effectivePersonality, null);
  for (const option of basic.personalityOptions) {
    const selected = personality.resolveFormationPersonality(basic, option);
    assert.equal(selected.effectivePersonality, option);
    assert.equal(selected.needsSelection, false);
  }
  if (count < 5) {
    const invalid = personality.resolveFormationPersonality(basic, names[count]);
    assert.equal(invalid.invalidSelection, true);
    assert.equal(invalid.originalSelection, names[count]);
    assert.equal(invalid.effectivePersonality, null);
  }
}
assert.equal(personality.resolveFormationPersonality('純粋', null).effectivePersonality, '純粋');
assert.deepEqual(personality.getPersonalityOptions('共鳴'), names);
const joanne = { id: 'Joanne', personality: '裏面', personalityOptions: ['憂鬱', '純粋'] };
assert.equal(personality.resolveFormationPersonality(joanne, '憂鬱').effectivePersonality, '憂鬱');
assert.equal(personality.resolveFormationPersonality(joanne, '純粋').effectivePersonality, '純粋');
assert.equal(personality.resolveFormationPersonality(joanne, '冷静').invalidSelection, true);
for (const options of [['純粋', '純粋'], ['純粋', '未知'], ['純粋'], names.concat('純粋')]) {
  assert.throws(() => personality.getPersonalityOptions({ personality: '裏面', personalityOptions: options }));
}
assert.throws(() => personality.getPersonalityOptions({ personality: '純粋', personalityOptions: ['純粋', '憂鬱'] }));
for (const base of ['裏面', '未知分類']) {
  for (const value of [undefined, null, '', []]) {
    const row = { id: 'Joanne', personality: base };
    if (value !== undefined) row.personalityOptions = value;
    assert.throws(() => personality.resolveFormationPersonality(row, null), /性格候補/);
  }
}
assert.deepEqual(personality.getPersonalityOptions({}), []);
assert.equal(personality.normalizeStoredSelection(' 冷静 '), '冷静');
assert.equal(personality.normalizeStoredSelection({ personality: '冷静' }), null);
assert.equal(personality.resolveFormationPersonality(joanne, { personality: '純粋' }).effectivePersonality, null);
assert.throws(() => personality.resolveFormationPersonality({ id: 'broken', personality: '' }, null), /性格候補/);
console.log('personality options fixture: OK');
