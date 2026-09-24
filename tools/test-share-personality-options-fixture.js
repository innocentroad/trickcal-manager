'use strict';
const assert = require('node:assert/strict');
const catalog = require('../formation-share-catalog.js');
const codec = require('../formation-share-codec.js');
const joanneId = catalog.apostles.find(id => String(id).toLowerCase() === 'joanne');
assert.ok(joanneId);
const snapshot = {
  v: 2, m: 1,
  members: [{ id: joanneId, star: 3, asideRank: 0 }, ...Array(8).fill(null)],
  resonancePersonalities: ['冷静', ...Array(8).fill(null)],
  relicSlots: Array(27).fill(null), spells: [], powers: [], globalPercent: null
};
const previous = { apostles: { [joanneId]: { personality: '共鳴' } } };
const current = { apostles: { [joanneId]: { personality: '裏面', personalityOptions: ['憂鬱', '純粋'] } } };
const oldUrl = codec.encode(snapshot, { catalog, displayData: previous });
assert.deepEqual(codec.decode(oldUrl.payload, { catalog, displayData: current }).snapshot, snapshot);
assert.throws(() => codec.encode(snapshot, { catalog, displayData: current }), /現在の性格候補/);
const valid = { ...snapshot, resonancePersonalities: ['憂鬱', ...Array(8).fill(null)] };
assert.deepEqual(codec.decode(codec.encode(valid, { catalog, displayData: current }).payload, { catalog, displayData: current }).snapshot, valid);
assert.throws(() => codec.encode({ ...snapshot, members: Array(9).fill(null) }, { catalog, displayData: current }), /空き使徒枠/);
console.log('share personality options fixture: OK');
