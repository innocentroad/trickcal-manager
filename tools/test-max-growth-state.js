#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const {
  DEFAULT_OUTPUT,
  EXPORT_SCHEMA,
  EXPORT_VERSION,
  VERIFICATION_SLOT,
  boardKey,
  createMaxGrowthPayload,
  getAvailableEquipmentKeys,
  hasAsideData,
  readGeneratedCards,
  readGeneratedStatData,
  readPublicReleaseConfig,
  serializePayload
} = require('./create-max-growth-state');

const data = readGeneratedStatData();
const cards = readGeneratedCards();
const release = readPublicReleaseConfig();
const expected = createMaxGrowthPayload({ data, cards, release });
const fixture = JSON.parse(fs.readFileSync(DEFAULT_OUTPUT, 'utf8'));

assert.deepEqual(fixture, expected, 'fixtureは現在の生成データから再生成した内容と一致する');
assert.equal(fixture.schema, EXPORT_SCHEMA);
assert.equal(fixture.version, EXPORT_VERSION);
assert.equal(fixture.kind, 'slot');
assert.equal(fixture.sourceSlot, VERIFICATION_SLOT);
assert.equal(fixture.snapshot.slotName, 'Codex表示検証用・全育成最大');
assert.equal(fixture.snapshot.research.level, 10);
assert.equal(fixture.snapshot.research.progress, 45);

const basicInfo = data.sheets.basicInfo || [];
assert.equal(Object.keys(fixture.snapshot.apostles).length, basicInfo.length, '全使徒を含む');
basicInfo.forEach(basic => {
  const state = fixture.snapshot.apostles[basic.id];
  assert.ok(state, `${basic.id}の状態を含む`);
  assert.deepEqual(
    {
      rank: state.rank,
      star: state.star,
      level: state.level,
      grade: state.grade,
      gradeConfigured: state.gradeConfigured
    },
    { rank: 9, star: 5, level: 145, grade: 6, gradeConfigured: true },
    `${basic.id}の基本育成値が最大`
  );
  assert.equal(state.bond, Number(basic.レア度) === 1 ? 1 : 30, `${basic.id}の好感度上限`);

  const asideAvailable = release.isAsideEnabled(basic.id) && hasAsideData(data, basic.id);
  const asideRank = asideAvailable ? 3 : 0;
  assert.equal(state.asideRank, asideRank, `${basic.id}のアサイド公開状態`);
  assert.equal(state.asideLevel, asideRank ? 50 : 0, `${basic.id}のアサイドLv上限`);
  assert.deepEqual(
    state.skillLevels,
    { low: asideRank ? 15 : 12, high: asideRank ? 15 : 12, passive: asideRank ? 15 : 12 },
    `${basic.id}のスキル上限`
  );

  const equipment = data.getById('equipment', basic.id);
  getAvailableEquipmentKeys(equipment).forEach(key => {
    assert.deepEqual(state.equipment[key], { enabled: true, enhance: 5 }, `${basic.id} ${key}の装備上限`);
  });

  const rows = data.getById('board', basic.id) || [];
  const expectedKeys = rows.filter(row => row.マス_type !== 'スタート').map(boardKey);
  const actualKeys = Object.values(state.boards).flatMap(layer => Object.keys(layer.filled));
  assert.equal(new Set(expectedKeys).size, expectedKeys.length, `${basic.id}のボードキーが一意`);
  assert.deepEqual([...actualKeys].sort(), [...expectedKeys].sort(), `${basic.id}のボードを全開放`);
  assert.equal('statSnapshots' in state, true, `${basic.id}の派生値領域を保持`);
  assert.deepEqual(state.statSnapshots, {}, `${basic.id}の派生値を空にする`);
  assert.equal('finalStats' in state, false, `${basic.id}の旧派生値を含めない`);
});

const cardList = [...cards.artifacts, ...cards.spells];
assert.equal(Object.keys(fixture.snapshot.cards).length, cardList.length, '全カードを含む');
cardList.forEach(card => {
  assert.deepEqual(fixture.snapshot.cards[card.id], { owned: true, star: 5, solder: 2 }, `${card.id}のカード上限`);
});

assert.equal(fixture.snapshot.formation.rows.length, 3, '編成は空の3行を持つ');
assert.deepEqual(fixture.snapshot.formation.spells, [], '編成条件を持ち込まない');
assert.deepEqual(fixture.snapshot.formation.masterPowers, [], 'マスターパワー条件を持ち込まない');
assert.equal(serializePayload(fixture), serializePayload(expected), 'JSON出力も安定している');

console.log(`max growth state tests passed (apostles=${basicInfo.length}, cards=${cardList.length})`);
