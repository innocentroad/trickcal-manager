#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const backup = require('../storage-backup.js');

const ROOT = path.resolve(__dirname, '..');
const MAX_BYTES = backup.limits.maxBytes;

function readFixtureSnapshot() {
  const fixture = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'tools', 'fixtures', 'max-growth-verification-state.json'),
    'utf8'
  ));
  return fixture.snapshot;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createRepresentativeEntries() {
  const snapshot = readFixtureSnapshot();
  const slots = {};
  for (let slot = 1; slot <= 6; slot += 1) {
    slots[String(slot)] = {
      slotRevision: slot,
      savedAt: `2026-09-13T00:00:0${slot}.000Z`,
      savedBy: `test-${slot}`,
      snapshot: { ...clone(snapshot), activeStateSlot: slot }
    };
  }
  const draft = { ...clone(snapshot), activeStateSlot: 3 };
  const resultSaves = Array.from({ length: 50 }, (_, index) => ({
    id: `result-${index + 1}`,
    savedAt: 1789257600000 + index * 1000,
    name: `検証計算${index + 1}`,
    snapshot: {
      version: 4,
      input: { durationSeconds: 90, targetId: 'Momo', seed: index + 1 },
      result: { dps: 100000 + index, totalDamage: 9000000 + index },
      dps: { settingsVersion: 2, durationSeconds: 90, trials: 16 }
    }
  }));
  return {
    'stat.slotStore': JSON.stringify({ schemaVersion: 2, storeRevision: 6, slots }),
    'stat.workspaceDraft': JSON.stringify({
      workspaceVersion: 2,
      workspaceId: 'workspace-capacity-test',
      activeSlot: 3,
      baseSlotRevision: 3,
      draft
    }),
    'stat.liveMirror': JSON.stringify({
      schemaVersion: 2,
      revision: 7,
      sourceTabInstanceId: 'capacity-test',
      sourceSlot: '3',
      publishedAt: '2026-09-13T00:01:00.000Z',
      snapshot: draft
    }),
    'stat.legacyCurrent': JSON.stringify({ ...draft, syncRevision: 7, activeStateSlot: 3 }),
    'calc.settings': JSON.stringify({ schemaVersion: 1, durationSeconds: 90, targetId: 'Momo' }),
    'calc.resultSaves': JSON.stringify(resultSaves),
    'calc.enemyPresets': JSON.stringify({ test: { name: '容量確認', hp: 999999999, defense: 500 } }),
    'dps.settings': JSON.stringify({ settingsVersion: 2, Momo: { durationSeconds: 90, trials: 16 } }),
    'dps.runtimeOverrides': JSON.stringify({ Momo: { effects: [] } }),
    'preference.commonTheme': 'dark',
    'preference.statThemeLegacy': 'dark',
    'preference.calcThemeLegacy': 'dark',
    'preference.boardPreviewThemeLegacy': 'dark',
    'preference.boardShortcutOffMode': 'node',
    'preference.boardOrientation': 'horizontal',
    'preference.boardPreviewScale': '1',
    'sharePrototype.globalEnhancements': JSON.stringify({ version: 1, values: {} })
  };
}

async function makeOuter(payload) {
  const payloadJson = JSON.stringify(payload);
  return {
    format: backup.format,
    version: backup.version,
    payloadJson,
    sha256: await backup.sha256Hex(payloadJson)
  };
}

function assertFailure(result, code) {
  assert.equal(result.ok, false);
  assert.equal(result.code, code);
  return result;
}

async function testRoundTripAndPresence() {
  const entries = createRepresentativeEntries();
  const created = await backup.createBackupPackageFromEntries(entries, {
    sourceMode: 'current-tab',
    sourceRelease: 'backup-test',
    createdAt: '2026-09-13T00:00:00.000Z'
  });
  assert.equal(created.ok, true);
  assert.equal(typeof created.value.sha256, 'string');
  assert.match(created.value.sha256, /^[0-9a-f]{64}$/);

  const decoded = await backup.decodeBackupPackage(JSON.stringify(created.value));
  assert.equal(decoded.ok, true);
  assert.equal(decoded.value.payload.schemaSet, 1);
  assert.equal(decoded.value.payload.sourceMode, 'current-tab');
  assert.equal(decoded.value.summary.totalDatasets, 12);
  assert.equal(decoded.value.summary.presentDatasets, 12);
  const slotValue = decoded.value.payload.datasets['stat.slots'].value;
  const slotStore = slotValue;
  assert.equal(Object.keys(slotStore.slots).length, 6);
  const savedValue = decoded.value.payload.datasets['calc.resultSaves'].value;
  assert.equal(savedValue.length, 50);
  assert.equal(savedValue[0].snapshot.version, 4);

  const restoreEntries = backup.buildRestoreEntries(decoded.value.payload, {
    transactionId: 'restore-c2-test',
    restoredAt: '2026-09-13T00:02:00.000Z'
  });
  const restoredById = new Map(restoreEntries.map(entry => [entry.id, entry]));
  const restoredSlots = JSON.parse(restoredById.get('stat.slotStore').raw);
  assert.equal(restoredSlots.schemaVersion, 2);
  assert.equal(restoredSlots.storeRevision, 1);
  assert.equal(restoredSlots.slots['1'].slotRevision, 1);
  assert.equal(restoredSlots.slots['1'].savedBy, 'restore-c2-test');
  assert.equal(restoredSlots.slots['1'].snapshot.activeStateSlot, undefined);
  const restoredWorkspace = JSON.parse(restoredById.get('stat.workspaceDraft').raw);
  assert.equal(restoredWorkspace.workspaceId, 'workspace-restore-c2-test');
  assert.equal(restoredWorkspace.activeSlot, 3);
  assert.equal(restoredWorkspace.draft.activeStateSlot, 3);
  const restoredLive = JSON.parse(restoredById.get('stat.liveMirror').raw);
  assert.equal(restoredLive.revision, 1);
  assert.equal(restoredLive.sourceSlot, '3');
  assert.match(restoredLive.sourceTabInstanceId, /^restore-tab-/);
  const restoredLegacy = JSON.parse(restoredById.get('stat.legacyCurrent').raw);
  assert.equal(restoredLegacy.syncRevision, 1);
  assert.equal(restoredLegacy.activeStateSlot, 3);
  assert.deepEqual(
    JSON.parse(restoredById.get('calc.resultSaves').raw),
    savedValue,
    '保存計算結果がcanonical→runtime変換で欠落しました'
  );

  const storedOnly = await backup.createBackupPackageFromEntries({
    ...entries,
    'stat.workspaceDraft': '{this is not read in stored-only}'
  }, { sourceMode: 'stored-only', sourceRelease: 'backup-test' });
  assert.equal(storedOnly.ok, true);
  const storedPayload = JSON.parse(storedOnly.value.payloadJson);
  const currentEntries = storedPayload.datasets['stat.current'];
  assert.equal(currentEntries.state, 'present');
  assert.equal(currentEntries.value.activeSlot, 3);
  assert.equal(currentEntries.value.snapshot.activeStateSlot, undefined);

  const divergent = {
    ...entries,
    'stat.workspaceDraft': JSON.stringify({
      ...JSON.parse(entries['stat.workspaceDraft']),
      draft: { ...JSON.parse(entries['stat.workspaceDraft']).draft, selected: 'workspace' }
    }),
    'stat.liveMirror': JSON.stringify({
      ...JSON.parse(entries['stat.liveMirror']),
      snapshot: { ...JSON.parse(entries['stat.liveMirror']).snapshot, selected: 'live' }
    }),
    'stat.legacyCurrent': JSON.stringify({
      ...JSON.parse(entries['stat.legacyCurrent']),
      selected: 'legacy'
    })
  };
  const currentTabPayload = backup.buildPayload(divergent, { sourceMode: 'current-tab', sourceRelease: 'backup-test' });
  const storedOnlyPayload = backup.buildPayload(divergent, { sourceMode: 'stored-only', sourceRelease: 'backup-test' });
  assert.equal(currentTabPayload.datasets['stat.current'].value.snapshot.selected, 'workspace');
  assert.equal(storedOnlyPayload.datasets['stat.current'].value.snapshot.selected, 'live');

  const presence = await backup.createBackupPackageFromEntries({
    'calc.settings': '{"value":0}',
    'calc.resultSaves': '[]'
  }, { sourceRelease: 'backup-test' });
  assert.equal(presence.ok, true);
  const presencePayload = JSON.parse(presence.value.payloadJson);
  assert.equal(presencePayload.datasets['stat.slots'].state, 'absent');
  assert.equal(presencePayload.datasets['calc.settings'].state, 'present');
  assert.equal(presencePayload.datasets['calc.resultSaves'].state, 'present');
}

async function testLegacySavedStatesAreNotReportedAbsent() {
  const entries = Object.freeze({
    'stat.legacyCurrent': JSON.stringify({
      activeStateSlot: 2,
      apostles: { Momo: { rank: 6 } },
      savedStates: {
        '2': { apostles: { Momo: { rank: 6 } } }
      }
    }),
    'calc.resultSaves': '[]'
  });
  const before = JSON.stringify(entries);
  const rejected = await backup.createBackupPackageFromEntries(entries, {
    sourceMode: 'stored-only',
    sourceRelease: 'legacy-slot-test'
  });
  assertFailure(rejected, 'recovery-required');
  assert.match(rejected.message, /旧形式の保存枠/);
  assert.match(rejected.message, /救出/);
  assert.equal(JSON.stringify(entries), before, '旧形式の拒否で入力storage相当値が変わりました');

  const empty = await backup.createBackupPackageFromEntries({
    'stat.legacyCurrent': JSON.stringify({
      activeStateSlot: 1,
      apostles: {},
      savedStates: {}
    }),
    'calc.resultSaves': '[]'
  }, { sourceMode: 'stored-only', sourceRelease: 'legacy-slot-test' });
  assert.equal(empty.ok, true, JSON.stringify(empty));
  const emptyPayload = JSON.parse(empty.value.payloadJson);
  assert.deepEqual(emptyPayload.datasets['stat.slots'], { state: 'absent' });
}

async function testRejectedInputsDoNotNeedWrites() {
  const entries = createRepresentativeEntries();
  let writes = 0;
  const reject = async input => {
    const result = await backup.decodeBackupPackage(input);
    if (!result.ok) writes += 0;
    return result;
  };

  const valid = await backup.createBackupPackageFromEntries(entries, { sourceRelease: 'backup-test' });
  assert.equal(valid.ok, true);

  const unknownVersion = { ...valid.value, version: 2 };
  assertFailure(await reject(JSON.stringify(unknownVersion)), 'invalid-data');

  const badDigest = { ...valid.value, sha256: '0'.repeat(64) };
  assertFailure(await reject(JSON.stringify(badDigest)), 'invalid-data');

  const payload = JSON.parse(valid.value.payloadJson);
  payload.datasets.unknown = { state: 'absent' };
  const unknownDataset = await makeOuter(payload);
  assertFailure(await reject(JSON.stringify(unknownDataset)), 'invalid-data');

  const oldSlot = fs.readFileSync(
    path.join(ROOT, 'tools', 'fixtures', 'storage-s1-import.json'),
    'utf8'
  );
  assertFailure(await reject(oldSlot), 'invalid-data');
  const rescuePackage = { ...valid.value, format: 'trickcal-manager-rescue' };
  assertFailure(await reject(JSON.stringify(rescuePackage)), 'invalid-data');

  const dangerous = await backup.createBackupPackageFromEntries({
    ...entries,
    'calc.settings': '{"__proto__":{"polluted":true}}'
  }, { sourceRelease: 'backup-test' });
  assertFailure(dangerous, 'invalid-data');

  const corrupt = await backup.createBackupPackageFromEntries({
    ...entries,
    'stat.liveMirror': '{bad'
  }, { sourceRelease: 'backup-test' });
  assertFailure(corrupt, 'recovery-required');

  const tooManyResults = await backup.createBackupPackageFromEntries({
    ...entries,
    'calc.resultSaves': JSON.stringify([
      ...JSON.parse(entries['calc.resultSaves']),
      { id: 'result-51', snapshot: { version: 4 } }
    ])
  }, { sourceRelease: 'backup-test' });
  assertFailure(tooManyResults, 'invalid-data');

  const unsupportedResultVersion = await backup.createBackupPackageFromEntries({
    ...entries,
    'calc.resultSaves': JSON.stringify([
      { ...JSON.parse(entries['calc.resultSaves'])[0], snapshot: { version: 3 } }
    ])
  }, { sourceRelease: 'backup-test' });
  assertFailure(unsupportedResultVersion, 'invalid-data');

  const unsupportedSavedAt = await backup.createBackupPackageFromEntries({
    ...entries,
    'calc.resultSaves': JSON.stringify([
      { ...JSON.parse(entries['calc.resultSaves'])[0], savedAt: '2026-09-13T00:00:00.000Z' }
    ])
  }, { sourceRelease: 'backup-test' });
  assertFailure(unsupportedSavedAt, 'invalid-data');

  const numericStringSavedAt = await backup.createBackupPackageFromEntries({
    ...entries,
    'calc.resultSaves': JSON.stringify([
      { ...JSON.parse(entries['calc.resultSaves'])[0], savedAt: '1726185600000' }
    ])
  }, { sourceRelease: 'backup-test' });
  assertFailure(numericStringSavedAt, 'invalid-data');

  const oversized = await backup.createBackupPackageFromEntries({
    ...entries,
    'calc.settings': JSON.stringify({ value: 'x'.repeat(MAX_BYTES) })
  }, { sourceRelease: 'backup-test' });
  assertFailure(oversized, 'oversize');

  const oversizedInput = `${' '.repeat(MAX_BYTES)}${JSON.stringify(valid.value)}`;
  assertFailure(await reject(oversizedInput), 'oversize');

  assert.equal(writes, 0, 'validatorは保存書込みを行わない');
}

async function testAuxiliaryExclusionRequiresConfirmation() {
  const entries = createRepresentativeEntries();
  const cases = [
    ['calc.settings', '[]', 'invalid-data'],
    ['dps.settings', JSON.stringify({ settingsVersion: 999 }), 'unsupported'],
    ['dps.runtimeOverrides', '[]', 'invalid-data']
  ];

  for (const [id, raw, reason] of cases) {
    const created = await createBackupPackageWithOverride(entries, id, raw);
    assert.equal(created.ok, true, `${id}の補助設定を含むpackageを作成できません`);
    const packageValue = created.value;
    const decoded = await backup.decodeBackupPackage(JSON.stringify(packageValue));
    assert.equal(decoded.ok, true, `${id}の補助設定不正でpackage全体を拒否しません`);
    const dataset = decoded.value.payload.datasets[id];
    assert.deepEqual(dataset, { state: 'excluded', reason });
    assert.equal(decoded.value.summary.excludedDatasets, 1);
    assert.throws(
      () => backup.buildRestoreEntries(decoded.value.payload),
      /補助設定の除外には明示確認が必要です/,
      `${id}は明示確認なしに復元対象から外れません`
    );
    const restored = backup.buildRestoreEntries(decoded.value.payload, {
      allowAuxiliaryExclusion: true,
      transactionId: 'auxiliary-exclusion-test'
    });
    assert.equal(restored.some(entry => entry.id === id), false, `${id}を許可後も復元しません`);
    assert.equal(restored.some(entry => entry.id === 'calc.resultSaves'), true, '保存計算結果まで除外されました');
  }

  const dangerous = await createBackupPackageWithOverride(
    entries,
    'calc.settings',
    '{"__proto__":{"polluted":true}}'
  );
  assertFailure(dangerous, 'invalid-data');

  const oversized = await createBackupPackageWithOverride(
    entries,
    'calc.settings',
    JSON.stringify({ value: 'x'.repeat(MAX_BYTES) })
  );
  assertFailure(oversized, 'oversize');

  const valid = await backup.createBackupPackageFromEntries(entries, { sourceRelease: 'backup-test' });
  assert.equal(valid.ok, true);
  const filePayload = JSON.parse(valid.value.payloadJson);
  filePayload.datasets['dps.settings'] = {
    state: 'present',
    value: { settingsVersion: 999 }
  };
  const filePackage = await makeOuter(filePayload);
  const decodedFile = await backup.decodeBackupPackage(JSON.stringify(filePackage));
  assert.equal(decodedFile.ok, true, JSON.stringify(decodedFile));
  assert.deepEqual(
    decodedFile.value.payload.datasets['dps.settings'],
    { state: 'excluded', reason: 'unsupported' },
    'ファイル内present補助設定を除外候補へ変換できません'
  );
  assert.equal(decodedFile.value.package.payloadJson, filePackage.payloadJson, '元payloadJsonを変更しました');
  assert.equal(decodedFile.value.package.sha256, filePackage.sha256, '元digestを変更しました');
  assert.throws(
    () => backup.buildRestoreEntries(decodedFile.value.payload),
    /補助設定の除外には明示確認が必要です/
  );
  const fileRestore = backup.buildRestoreEntries(decodedFile.value.payload, {
    allowAuxiliaryExclusion: true,
    transactionId: 'file-auxiliary-exclusion-test'
  });
  assert.equal(fileRestore.some(entry => entry.id === 'dps.settings'), false);
  assert.equal(fileRestore.some(entry => entry.id === 'calc.resultSaves'), true);

  const mandatoryPayload = JSON.parse(valid.value.payloadJson);
  mandatoryPayload.datasets['stat.slots'] = { state: 'present', value: null };
  const mandatoryPackage = await makeOuter(mandatoryPayload);
  assertFailure(
    await backup.decodeBackupPackage(JSON.stringify(mandatoryPackage)),
    'invalid-data'
  );

  const dangerousPayload = JSON.parse(valid.value.payloadJson);
  dangerousPayload.datasets['calc.settings'] = {
    state: 'present',
    value: JSON.parse('{"__proto__":{"polluted":true}}')
  };
  const dangerousFile = await makeOuter(dangerousPayload);
  assertFailure(
    await backup.decodeBackupPackage(JSON.stringify(dangerousFile)),
    'invalid-data'
  );

  const mixedDangerousPayload = JSON.parse(valid.value.payloadJson);
  mixedDangerousPayload.datasets['dps.settings'] = {
    state: 'present',
    value: JSON.parse('{"settingsVersion":999,"__proto__":{"polluted":true}}')
  };
  const mixedDangerousFile = await makeOuter(mixedDangerousPayload);
  assertFailure(
    await backup.decodeBackupPackage(JSON.stringify(mixedDangerousFile)),
    'invalid-data'
  );

  const extraDatasetFieldPayload = JSON.parse(valid.value.payloadJson);
  extraDatasetFieldPayload.datasets['dps.settings'] = {
    state: 'present',
    value: { settingsVersion: 999 },
    extra: true
  };
  const extraDatasetFieldFile = await makeOuter(extraDatasetFieldPayload);
  assertFailure(
    await backup.decodeBackupPackage(JSON.stringify(extraDatasetFieldFile)),
    'invalid-data'
  );

  const deepValue = { settingsVersion: 999 };
  let deepCursor = deepValue;
  for (let index = 0; index < 70; index += 1) {
    deepCursor.child = {};
    deepCursor = deepCursor.child;
  }
  const deepPayload = JSON.parse(valid.value.payloadJson);
  deepPayload.datasets['dps.settings'] = { state: 'present', value: deepValue };
  const deepFile = await makeOuter(deepPayload);
  assertFailure(
    await backup.decodeBackupPackage(JSON.stringify(deepFile)),
    'oversize'
  );
}

async function createBackupPackageWithOverride(entries, id, raw) {
  return backup.createBackupPackageFromEntries({ ...entries, [id]: raw }, {
    sourceMode: 'current-tab',
    sourceRelease: 'backup-test',
    createdAt: '2026-09-13T00:00:00.000Z'
  });
}

async function testRescueFormatIsSeparate() {
  const rescue = await backup.createRescuePackageFromEntries([
    {
      id: 'stat.slotStore',
      area: 'localStorage',
      state: 'read-failed',
      code: 'recovery-required'
    },
    {
      id: 'calc.settings',
      area: 'localStorage',
      state: 'present',
      raw: '{preserve-this-corrupt-value'
    }
  ], {
    sourceRelease: 'rescue-test',
    createdAt: '2026-09-13T00:00:00.000Z'
  });
  assert.equal(rescue.ok, true);
  assert.equal(rescue.value.format, backup.rescueFormat);
  assert.equal(backup.isRescuePackage(JSON.stringify(rescue.value)), true);
  const decoded = await backup.decodeRescuePackage(JSON.stringify(rescue.value));
  assert.equal(decoded.ok, true, JSON.stringify(decoded));
  assert.equal(decoded.value.payload.entries.length, backup.rescueEntrySpecs.length);
  assert.deepEqual(
    decoded.value.payload.entries.find(entry => entry.id === 'stat.slotStore'),
    { id: 'stat.slotStore', area: 'localStorage', state: 'read-failed', code: 'recovery-required' }
  );
  assert.deepEqual(
    decoded.value.payload.entries.find(entry => entry.id === 'calc.settings'),
    { id: 'calc.settings', area: 'localStorage', state: 'present', raw: '{preserve-this-corrupt-value' }
  );
  assert.equal(
    (await backup.decodeBackupPackage(JSON.stringify(rescue.value))).code,
    'invalid-data'
  );
}

async function testCapacity() {
  const entries = createRepresentativeEntries();
  const created = await backup.createBackupPackageFromEntries(entries, {
    sourceMode: 'current-tab',
    sourceRelease: 'capacity-test',
    createdAt: '2026-09-13T00:00:00.000Z'
  });
  assert.equal(created.ok, true);
  const fileJson = JSON.stringify(created.value);
  const journal = JSON.stringify({
    version: 1,
    phase: 'prepared',
    transactionId: 'capacity-transaction',
    before: entries,
    afterHashes: {}
  });
  const report = {
    packageBytes: Buffer.byteLength(fileJson, 'utf8'),
    payloadBytes: Buffer.byteLength(created.value.payloadJson, 'utf8'),
    beforeJournalBytes: Buffer.byteLength(journal, 'utf8'),
    slots: 6,
    calculationSaves: 50,
    packageLimitBytes: MAX_BYTES,
    journalLimitBytes: 16 * 1024 * 1024
  };
  assert.ok(report.packageBytes <= MAX_BYTES, `packageが上限超過: ${report.packageBytes}`);
  assert.ok(report.payloadBytes <= MAX_BYTES, `payloadが上限超過: ${report.payloadBytes}`);
  assert.ok(report.beforeJournalBytes <= 16 * 1024 * 1024, `journalが上限超過: ${report.beforeJournalBytes}`);
  assert.equal((await backup.decodeBackupPackage(fileJson)).ok, true);
  console.log(`storage backup capacity: ${JSON.stringify(report)}`);
  return report;
}

(async () => {
  await testRoundTripAndPresence();
  await testLegacySavedStatesAreNotReportedAbsent();
  await testRejectedInputsDoNotNeedWrites();
  await testAuxiliaryExclusionRequiresConfirmation();
  await testRescueFormatIsSeparate();
  await testCapacity();
  console.log('storage backup tests passed: datasets, presence, digest, rejection, limits, capacity');
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
