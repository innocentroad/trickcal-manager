'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'formation-damage-calc.js'), 'utf8');
function extract(name) {
  const start = source.indexOf(`  function ${name}(`);
  assert.notEqual(start, -1);
  const end = source.indexOf('\n  function ', start + 1);
  assert.notEqual(end, -1);
  return source.slice(start, end);
}

let stored = '[]';
let failWrite = false;
let confirm = true;
let downloaded;
let downloadName;
let renders = 0;
let closed = 0;
let revoked = false;
const context = {
  CALC_RESULT_SAVES_KEY: 'calc-saves',
  CALC_SAVE_LIMIT: 50,
  damageSaveWriteMessage: '',
  clonePlain: value => JSON.parse(JSON.stringify(value)),
  storageLocal: {
    getItem: () => stored,
    setItem: (key, value) => {
      assert.equal(key, 'calc-saves');
      if (failWrite) { const error = new Error('quota'); error.name = 'QuotaExceededError'; throw error; }
      stored = value;
    }
  },
  console: { warn() {} },
  Blob,
  URL: { createObjectURL(blob) { downloaded = blob; return 'blob:test'; }, revokeObjectURL() { revoked = true; } },
  document: {
    createElement: () => ({ click() { downloadName = this.download; }, remove() {} }),
    body: { appendChild() {} }
  },
  window: { confirm: () => confirm, alert(message) { context.lastAlert = message; }, setTimeout(fn) { fn(); } },
  view: { damageSaveAction: '' },
  renderDamageSaveActionPanel() { renders++; },
  closeDamageSaveMenu() { closed++; }
};
vm.runInNewContext([
  'loadDamageCalculationSaves', 'writeDamageCalculationSaves', 'getDamageSaveById',
  'parseDamageCalculationFile', 'exportDamageCalculationFile', 'importDamageCalculationFile',
  'toSettingsOnlyDamageSnapshot', 'compactDamageCalculationSaves'
].map(extract).join('\n'), context);

const snapshot = {
  version: 4, statCalculationVersion: 4,
  view: { targetId: 'barong', selectedSkillCategory: 'basic', tempArtifacts: { target: { favorite: true } } },
  inputs: { attack: '12345', defense: '678' },
  referenceState: { apostles: { barong: { asideLevel: 2 } }, cards: {}, research: {}, formation: { rows: [] }, savedFormations: [] },
  result: { expected: 458276 },
  comparison: { dpsSnapshot: { actionEffectAudit: { data: 'x'.repeat(20000) } } }
};
const entry = { id: 'existing', name: 'バロン/比較', note: '本人高学年OFF／リニュア自動ON', savedAt: 1, snapshot };
stored = JSON.stringify([entry]);

(async () => {
  context.exportDamageCalculationFile(entry.id);
  assert.equal(downloadName, 'trickcal-calc-バロン_比較.json');
  assert.equal(revoked, true);
  assert.equal(closed, 1);
  const text = await downloaded.text();
  const payload = JSON.parse(text);
  assert.deepEqual(payload.calculation.snapshot, snapshot);
  assert.equal(payload.calculation.note, entry.note);
  assert.equal('dpsSettings' in payload, false);
  assert.equal(context.importDamageCalculationFile(text), true);
  const saves = JSON.parse(stored);
  assert.equal(saves.length, 2);
  assert.notEqual(saves[0].id, entry.id);
  const settingsOnly = JSON.parse(JSON.stringify(context.toSettingsOnlyDamageSnapshot(snapshot)));
  assert.deepEqual(saves[0].snapshot, settingsOnly);
  assert.equal(settingsOnly.version, 5);
  assert.equal('result' in settingsOnly, false);
  assert.equal('comparison' in settingsOnly, false);
  assert.deepEqual(settingsOnly.referenceState, snapshot.referenceState);
  assert.deepEqual(saves[1], entry);
  assert.equal(context.loadDamageCalculationSaves()[0].note, entry.note);
  assert.equal(context.view.damageSaveAction, 'load');
  assert.equal(renders, 1);

  const before = stored;
  confirm = false;
  assert.equal(context.importDamageCalculationFile(text), false);
  assert.equal(stored, before);
  confirm = true;
  failWrite = true;
  assert.throws(() => context.importDamageCalculationFile(text), /保存容量が不足/);
  assert.equal(stored, before);
  failWrite = false;

  for (const invalid of [
    '{bad', '{}',
    text.replace('"version": 1', '"version": 99'),
    text.replace('"version": 4', '"version": 99'),
    text.replace('"referenceState": {', '"referenceState": {"__proto__": {},'),
    JSON.stringify({ ...payload, calculation: { ...payload.calculation, note: 'x'.repeat(2001) } }),
    JSON.stringify({ ...payload, calculation: { ...payload.calculation, snapshot: { ...snapshot, inputs: [] } } })
  ]) {
    assert.throws(() => context.importDamageCalculationFile(invalid));
    assert.equal(stored, before);
  }
  assert.equal(context.parseDamageCalculationFile('\uFEFF' + text).name, entry.name);
  const newText = JSON.stringify({ ...payload, calculation: { ...payload.calculation, snapshot: settingsOnly } });
  assert.equal(context.parseDamageCalculationFile(newText).snapshot.version, 5);
  stored = JSON.stringify([entry]);
  confirm = false;
  context.compactDamageCalculationSaves();
  assert.equal(stored, JSON.stringify([entry]), 'cancel preserves old results');
  confirm = true;
  failWrite = true;
  context.compactDamageCalculationSaves();
  assert.equal(stored, JSON.stringify([entry]), 'quota failure preserves old results');
  assert.match(context.lastAlert, /保存容量/);
  failWrite = false;
  context.compactDamageCalculationSaves();
  assert.deepEqual(JSON.parse(stored), [{ ...entry, snapshot: settingsOnly }]);
  stored = JSON.stringify(Array.from({ length: 50 }, (_, i) => ({ ...entry, id: `save:${i}` })));
  const full = stored;
  assert.throws(() => context.importDamageCalculationFile(text), /50件/);
  assert.equal(stored, full);
  assert.equal(context.writeDamageCalculationSaves([...JSON.parse(stored), { ...entry, id: '51st' }]), false);
  assert.equal(stored, full, 'no silent truncation at 51 entries');
  console.log('Calculation save transfer: round-trip, append, memo, cancellation, invalid input, capacity and write failure passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
