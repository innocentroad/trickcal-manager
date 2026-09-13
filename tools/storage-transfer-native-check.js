#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const storageBackup = require('../storage-backup.js');
const browser = require('./storage-native-browser-check.js');

const ROOT = path.resolve(__dirname, '..');
const SERVER_SCRIPT = path.join(ROOT, 'tools', 'fixtures', 'storage-http-server.js');
const SERVER_PATH = '/storage-transfer.html';
const STAT_PATH = '/stat-dashboard.html?native=storage-transfer';
const SOURCE_ROOT = path.resolve(process.env.TRICKCAL_STORAGE_NATIVE_SOURCE_ROOT || ROOT);
const TARGET_ROOT = path.resolve(process.env.TRICKCAL_STORAGE_NATIVE_TARGET_ROOT || ROOT);
const SOURCE_PATH = process.env.TRICKCAL_STORAGE_NATIVE_SOURCE_PATH || STAT_PATH;
const TARGET_PATH = process.env.TRICKCAL_STORAGE_NATIVE_TARGET_PATH || SERVER_PATH;
const REOPEN_PATH = process.env.TRICKCAL_STORAGE_NATIVE_REOPEN_PATH || STAT_PATH;

function startChild(command, args, environment = {}) {
  return spawn(command, args, {
    cwd: ROOT,
    env: { ...process.env, ...environment },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
}

async function createPageWithInitScript(cdp, url, source) {
  const page = await browser.createPage(cdp, 'about:blank');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source }, page.sessionId);
  await cdp.send('Page.navigate', { url }, page.sessionId);
  await browser.waitFor(async () => {
    const state = await browser.evaluate(cdp, page, 'document.readyState');
    return state === 'complete' || state === 'interactive';
  });
  return page;
}

async function attachOpenedPage(cdp, targetId, initSource = '') {
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('DOM.enable', {}, sessionId);
  const page = { targetId, sessionId };
  if (initSource) {
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: initSource }, sessionId);
    await browser.evaluate(cdp, page, initSource);
  }
  await browser.waitFor(async () => {
    const state = await browser.evaluate(cdp, page, 'document.readyState');
    return state === 'complete' || state === 'interactive';
  });
  return page;
}

async function activateOpenedPage(cdp, page) {
  // window.open has already created and foregrounded this target. Calling
  // Target.activateTarget here is unnecessary and, on the local Chrome/CDP
  // combination used by this runner, can return "Session not found" for an
  // otherwise usable flattened popup session. Keep the native check focused
  // on the attached page rather than adding another target-lifecycle command.
  await browser.sleep(100);
}

async function findTarget(cdp, predicate) {
  return browser.waitFor(async () => {
    const result = await cdp.send('Target.getTargets');
    return result.targetInfos.find(predicate) || null;
  }, { timeoutMs: 15000, intervalMs: 100 });
}

async function readAllStorage(cdp, page) {
  return browser.evaluate(cdp, page, `(() => ({
    local: Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])),
    session: Object.fromEntries(Object.keys(sessionStorage).sort().map(key => [key, sessionStorage.getItem(key)]))
  }))()`);
}

async function waitForStableStorage(cdp, page) {
  let previous = await readAllStorage(cdp, page);
  return browser.waitFor(async () => {
    await browser.sleep(250);
    const next = await readAllStorage(cdp, page);
    if (JSON.stringify(next) === JSON.stringify(previous)) return next;
    previous = next;
    return null;
  }, { timeoutMs: 5000, intervalMs: 50 });
}

async function waitForTransferPreview(cdp, page) {
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
    const preview = document.querySelector('#transfer-preview');
    return !!preview && !preview.hidden && (document.querySelector('#transfer-preview-summary')?.textContent || '').length > 0;
  })()`), { timeoutMs: 30000 });
}

async function createCalculationSave() {
  const value = {
    id: 'native-transfer-result',
    name: '転送確認',
    savedAt: 1726189200000,
    snapshot: {
      version: 4,
      view: { targetId: 'Momo', durationSeconds: 90 },
      result: { expected: 2, totalDamage: 2 },
      comparison: { dpsSnapshot: { durationSeconds: 90 } }
    }
  };
  return JSON.stringify([value]);
}

function createNativeStateSnapshot() {
  return {
    savedAt: '2026-09-13T00:00:00.000Z',
    slotName: 'native transfer source',
    apostleName: 'モモ',
    activeId: 'Momo',
    activeStateSlot: 1,
    apostles: {
      Momo: {
        rank: 3,
        level: 42,
        star: 3,
        grade: 2,
        gradeConfigured: true,
        bond: 5,
        asideRank: 1,
        asideLevel: 10,
        skillLevels: { low: 4, high: 3, passive: 2 },
        follow: true,
        equipment: {},
        boards: {},
        statSnapshots: {}
      }
    },
    comparisonStats: { v: 1, a: {} },
    research: {},
    cards: {},
    formation: {
      cardKind: 'artifact',
      rows: [
        { apostles: ['Momo', '', ''], artifacts: [['', '', ''], ['', '', ''], ['', '', '']] },
        { apostles: ['', '', ''], artifacts: [['', '', ''], ['', '', ''], ['', '', '']] },
        { apostles: ['', '', ''], artifacts: [['', '', ''], ['', '', ''], ['', '', '']] }
      ],
      spells: [],
      masterPowers: [],
      coins: 77,
      coinMode: 'manual'
    },
    totalCombatPower: 12345,
    activeFormationPresetId: '',
    savedFormations: []
  };
}

function createNativeStorageSeed(snapshot, calculationSave) {
  const currentSnapshot = { ...snapshot, activeStateSlot: 1 };
  return {
    local: {
      trickcal_stat_slots_v2: JSON.stringify({
        schemaVersion: 2,
        storeRevision: 7,
        slots: {
          '1': {
            slotRevision: 3,
            savedAt: snapshot.savedAt,
            savedBy: 'native-seed',
            snapshot
          }
        }
      }),
      trickcal_stat_prototype_v1: JSON.stringify({
        ...currentSnapshot,
        syncRevision: 7
      }),
      trickcal_stat_live_v2: JSON.stringify({
        schemaVersion: 2,
        revision: 7,
        sourceTabInstanceId: 'native-seed-tab',
        sourceSlot: '1',
        publishedAt: snapshot.savedAt,
        snapshot: currentSnapshot
      }),
      trickcal_formation_damage_result_saves_v1: calculationSave
    },
    session: {
      trickcal_stat_workspace_v2: JSON.stringify({
        workspaceVersion: 2,
        workspaceId: 'native-seed-workspace',
        activeSlot: 1,
        baseSlotRevision: 3,
        draft: currentSnapshot
      })
    }
  };
}

function createStorageSeedScript(seed) {
  const lines = [];
  Object.entries(seed.local || {}).forEach(([key, value]) => {
    lines.push('localStorage.setItem(' + JSON.stringify(key) + ', ' + JSON.stringify(value) + ');');
  });
  Object.entries(seed.session || {}).forEach(([key, value]) => {
    lines.push('sessionStorage.setItem(' + JSON.stringify(key) + ', ' + JSON.stringify(value) + ');');
  });
  return lines.join('');
}

function stateFactsFromStorage(storage) {
  const parse = raw => {
    try { return raw == null ? null : JSON.parse(raw); } catch (_) { return null; }
  };
  const slotStore = parse(storage?.local?.trickcal_stat_slots_v2);
  const slotSnapshot = slotStore?.slots?.['1']?.snapshot || null;
  const workspace = parse(storage?.session?.trickcal_stat_workspace_v2);
  const live = parse(storage?.local?.trickcal_stat_live_v2);
  const legacy = parse(storage?.local?.trickcal_stat_prototype_v1);
  const currentSnapshot = workspace?.draft || live?.snapshot || legacy || null;
  const pickApostle = value => ({
    rank: Number(value?.rank) || 0,
    level: Number(value?.level) || 0,
    star: Number(value?.star) || 0,
    grade: Number(value?.grade) || 0,
    bond: Number(value?.bond) || 0,
    asideRank: Number(value?.asideRank) || 0,
    asideLevel: Number(value?.asideLevel) || 0,
    skillLevels: { ...(value?.skillLevels || {}) },
    follow: value?.follow === true
  });
  const pickSnapshot = value => value ? {
    activeId: value.activeId || '',
    apostles: Object.fromEntries(Object.entries(value.apostles || {}).map(([id, state]) => [id, pickApostle(state)])),
    research: value.research || {},
    cards: value.cards || {},
    formation: {
      cardKind: value.formation?.cardKind || '',
      rows: (value.formation?.rows || []).map(row => ({
        apostles: Array.isArray(row?.apostles) ? row.apostles.slice(0, 3) : [],
        artifacts: Array.isArray(row?.artifacts) ? row.artifacts.map(line => Array.isArray(line) ? line.slice(0, 3) : line) : []
      })),
      spells: Array.isArray(value.formation?.spells) ? value.formation.spells.slice() : [],
      masterPowers: Array.isArray(value.formation?.masterPowers) ? value.formation.masterPowers.slice() : [],
      coins: Number(value.formation?.coins) || 0,
      coinMode: value.formation?.coinMode || ''
    },
    totalCombatPower: Number(value.totalCombatPower) || 0,
    activeFormationPresetId: value.activeFormationPresetId || ''
  } : null;
  return {
    slotPresent: !!slotSnapshot,
    currentPresent: !!currentSnapshot,
    slot: pickSnapshot(slotSnapshot),
    current: pickSnapshot(currentSnapshot),
    calculationSaves: parse(storage?.local?.trickcal_formation_damage_result_saves_v1)
  };
}

async function run() {
  const firstPort = await browser.findFreePort();
  const secondPort = await browser.findFreePort([firstPort]);
  const cdpPort = await browser.findFreePort([firstPort, secondPort]);
  const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-storage-transfer-native-'));
  const downloadRoot = path.join(profileRoot, 'downloads');
  fs.mkdirSync(downloadRoot);
  const chromePath = browser.findChrome();
  const firstOrigin = `http://127.0.0.1:${firstPort}`;
  const secondOrigin = `http://127.0.0.1:${secondPort}`;
  const statUrl = `${firstOrigin}${SOURCE_PATH}`;
  const transferUrl = `${secondOrigin}${TARGET_PATH}`;
  const targetPathname = new URL(transferUrl).pathname;
  let serverOne = null;
  let serverTwo = null;
  let chrome = null;
  let cdp = null;
  const pages = [];
  const diagnostics = { server: [], chrome: [] };
  let stage = 'start';

  try {
    stage = 'start-http-servers';
    serverOne = startChild(process.execPath, [SERVER_SCRIPT, String(firstPort)], {
      TRICKCAL_STORAGE_HTTP_ROOT: SOURCE_ROOT
    });
    serverTwo = startChild(process.execPath, [SERVER_SCRIPT, String(secondPort)], {
      TRICKCAL_STORAGE_HTTP_ROOT: TARGET_ROOT
    });
    [serverOne, serverTwo].forEach(server => {
      server.on('error', error => diagnostics.server.push(error.message));
      server.stderr.on('data', chunk => diagnostics.server.push(String(chunk)));
    });
    stage = 'wait-http-servers';
    await Promise.all([
      browser.waitForHttp(`${firstOrigin}${SERVER_PATH}`),
      browser.waitForHttp(`${secondOrigin}${SERVER_PATH}`)
    ]);

    stage = 'start-chrome';
    chrome = startChild(chromePath, [
      `--user-data-dir=${profileRoot}`,
      `--remote-debugging-port=${cdpPort}`,
      '--remote-debugging-address=127.0.0.1',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-sync',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-features=Translate',
      '--window-size=1280,900',
      '--new-window',
      'about:blank'
    ]);
    chrome.on('error', error => diagnostics.chrome.push(error.message));
    chrome.stderr.on('data', chunk => diagnostics.chrome.push(String(chunk)));
    stage = 'wait-cdp';
    const version = await browser.waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
      return response.ok ? response.json() : null;
    });
    stage = 'connect-cdp';
    cdp = new browser.CdpClient(version.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadRoot });

    // This is a local-only test hook. Production resolves the fixed
    // trickcal.irlab.dev target and does not accept URL parameters.
    const calculationSave = await createCalculationSave();
    const nativeSnapshot = createNativeStateSnapshot();
    const nativeSeed = createNativeStorageSeed(nativeSnapshot, calculationSave);
    const statInit = `window.TRICKCAL_STORAGE_TRANSFER_TEST_ENABLED = true; window.TRICKCAL_STORAGE_TRANSFER_TEST_TARGET_ORIGIN = ${JSON.stringify(secondOrigin)};` + createStorageSeedScript(nativeSeed);
    stage = 'create-stat-page';
    const statPage = await createPageWithInitScript(cdp, statUrl, statInit);
    pages.push(statPage);
    stage = 'activate-stat-page';
    await browser.activatePage(cdp, statPage);
    // The transfer button is inside the closed save details. Check presence
    // first, then open the details before using the clickable-box helper.
    await browser.waitFor(async () => browser.evaluate(cdp, statPage, '!!document.querySelector("#backup-transfer")'));
    try {
      await browser.waitFor(async () => browser.evaluate(cdp, statPage, 'document.documentElement.dataset.storageBoot === "ready"'));
    } catch (error) {
      const bootDiagnostic = await browser.evaluate(cdp, statPage, `({
        storageBoot: document.documentElement.dataset.storageBoot || '',
        storageError: document.documentElement.dataset.storageError || '',
        bodyText: (document.body?.innerText || '').slice(0, 800),
        readyState: document.readyState
      })`);
      throw new Error(`${error.message}; statBootDiagnostic=${JSON.stringify(bootDiagnostic)}`);
    }

    stage = 'seed-sender-storage';
    await browser.evaluate(cdp, statPage, createStorageSeedScript(nativeSeed));
    await cdp.send('Page.reload', { ignoreCache: true }, statPage.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, statPage, 'document.readyState === "complete" || document.readyState === "interactive"'));
    await browser.waitFor(async () => browser.evaluate(cdp, statPage, 'document.documentElement.dataset.storageBoot === "ready"'));
    await browser.evaluate(cdp, statPage, `localStorage.setItem('trickcal_formation_damage_result_saves_v1', ${JSON.stringify(calculationSave)}); localStorage.setItem('native-transfer-sender-unrelated', 'keep-sender'); sessionStorage.setItem('native-transfer-sender-session', 'keep-sender-session');`);

    // The init-script path is retained for ordinary navigations, but the
    // real page may be controlled by its service worker before that hook is
    // observable. Set the local-only override after boot as well and verify
    // the exact resolver result before a real click opens the transfer page.
    stage = 'configure-local-transfer-hook';
    await browser.evaluate(cdp, statPage, 'window.TRICKCAL_STORAGE_TRANSFER_TEST_ENABLED = true; window.dispatchEvent(new Event("trickcal-storage-transfer-test-enabled"));');
    const configuredOrigin = await browser.evaluate(cdp, statPage, `(() => {
      window.TRICKCAL_STORAGE_TRANSFER_TEST_TARGET_ORIGIN = ${JSON.stringify(secondOrigin)};
      const api = window.TRICKCAL_STORAGE_TRANSFER;
      return {
        configured: window.TRICKCAL_STORAGE_TRANSFER_TEST_TARGET_ORIGIN,
        resolved: api?.getConfiguredPeerOrigin?.('target') || api?.defaultTargetOrigin || ''
      };
    })()`);
    assert.equal(configuredOrigin.configured, secondOrigin);
    assert.equal(configuredOrigin.resolved, secondOrigin, `ローカル転送先を解決できません: ${JSON.stringify(configuredOrigin)}`);

    const menuOpen = await browser.evaluate(cdp, statPage, '!!document.querySelector(".bottom-save-menu[open]")');
    if (!menuOpen) {
      await browser.clickSelector(cdp, statPage, '.bottom-save-menu > summary');
      await browser.waitForSelector(cdp, statPage, '.bottom-save-popover');
    }
    stage = 'click-transfer';
    await browser.clickSelector(cdp, statPage, '#backup-transfer');
    stage = 'find-transfer-target';
    const targetInfo = await findTarget(cdp, info => info.type === 'page'
      && (info.url.includes(targetPathname) || info.url.includes('/transfer/')));
    stage = 'attach-transfer-target';
    const transferPage = await attachOpenedPage(
      cdp,
      targetInfo.targetId,
      `window.TRICKCAL_STORAGE_TRANSFER_TEST_SOURCE_ORIGIN = ${JSON.stringify(firstOrigin)};`
    );
    pages.push(transferPage);
    stage = 'activate-transfer-target';
    await activateOpenedPage(cdp, transferPage);
    stage = 'wait-transfer-selector';
    await browser.waitForSelector(cdp, transferPage, '#transfer-file-button');
    stage = 'seed-receiver-storage';
    await browser.evaluate(cdp, transferPage, `localStorage.setItem('native-transfer-receiver-unrelated', 'keep-receiver'); sessionStorage.setItem('native-transfer-receiver-session', 'keep-receiver-session');`);
    await waitForTransferPreview(cdp, transferPage);
    const beforeReceiverBackup = await readAllStorage(cdp, transferPage);
    const receiverBackupBeforeDownload = browser.snapshotDownloadedFiles(downloadRoot);
    stage = 'backup-receiver-before-apply';
    await browser.clickSelector(cdp, transferPage, '#transfer-backup-current');
    await browser.waitForText(
      cdp,
      transferPage,
      '#transfer-status',
      text => text.includes('新サイトのバックアップを保存しました'),
      { timeoutMs: 30000 }
    );
    const receiverBackupPath = await browser.waitForNewDownload(downloadRoot, receiverBackupBeforeDownload);
    assert.equal((await storageBackup.decodeBackupPackage(fs.readFileSync(receiverBackupPath, 'utf8'))).ok, true, '適用前の新サイトバックアップをdecodeできません');
    await waitForStableStorage(cdp, transferPage);
    const afterReceiverBackup = await readAllStorage(cdp, transferPage);
    assert.deepEqual(afterReceiverBackup, beforeReceiverBackup, '適用前バックアップで新サイトstorageが変わりました');
    // beginMaintenance('backup') performs the ordinary freeze/flush before
    // export. The sender baseline therefore starts when the preview proves
    // collection completed, not before the click that triggered that flush.
    await browser.waitForText(
      cdp,
      statPage,
      '#backup-status',
      text => text.includes('新サイトへ送信しました') || text.includes('新サイトで内容を確認しました'),
      { timeoutMs: 30000 }
    );
    await waitForStableStorage(cdp, statPage);
    const senderAfterCollection = await readAllStorage(cdp, statPage);
    const senderFacts = stateFactsFromStorage(senderAfterCollection);
    assert.equal(senderFacts.slotPresent, true, '送信元の非空slotを確認できません');
    assert.equal(senderFacts.currentPresent, true, '送信元の非空currentを確認できません');
    assert.equal(senderFacts.slot.apostles.Momo.level, 42, '送信元の育成level seedが失われました');
    assert.deepEqual(senderFacts.slot.formation.rows[0].apostles, ['Momo', '', ''], '送信元の編成seedが失われました');
    assert.equal(senderFacts.slot.formation.coins, 77, '送信元の編成値seedが失われました');
    assert.deepEqual(senderFacts.calculationSaves, JSON.parse(calculationSave), '送信元の保存計算seedが失われました');
    const beforeApply = await readAllStorage(cdp, transferPage);
    const directPackageDigest = await browser.evaluate(
      cdp,
      transferPage,
      'window.TRICKCAL_STORAGE_TRANSFER_PAGE_CONTROLLER?.getState?.().packageDigest || ""'
    );
    assert.match(directPackageDigest, /^[0-9a-f]{64}$/, '受信パッケージdigestを取得できません');
    assert.equal(await browser.evaluate(cdp, transferPage, 'document.querySelector("#transfer-apply")?.hidden === true'), true, '受信直後に復元ボタンが有効です');
    assert.equal(await browser.evaluate(cdp, transferPage, 'document.querySelector("#transfer-prepare")?.hidden === false'), true, '受信直後の確認ボタンがありません');
    assert.equal(beforeApply.local['trickcal_stat_slots_v2'] || null, null, '受信previewだけでslotが書かれました');
    assert.equal(beforeApply.local['trickcal_formation_damage_result_saves_v1'] || null, null, '受信previewだけで計算結果が書かれました');

    stage = 'prepare-transfer';
    await browser.clickSelector(cdp, transferPage, '#transfer-prepare');
    await browser.waitForText(cdp, transferPage, '#transfer-status', text => text.includes('復元対象を確認しました'), { timeoutMs: 30000 });
    const beforeApplyAfterPlan = await readAllStorage(cdp, transferPage);
    assert.deepEqual(beforeApplyAfterPlan, beforeApply, 'plan確認だけで受信先storageが変わりました');
    stage = 'apply-transfer';
    await browser.clickSelector(cdp, transferPage, '#transfer-apply');
    const transferOutcome = await browser.waitFor(async () => {
      const receiverState = await browser.evaluate(cdp, transferPage, `({
        status: document.querySelector('#transfer-status')?.textContent || '',
        kind: document.querySelector('#transfer-status')?.dataset.kind || ''
      })`);
      const senderState = await browser.evaluate(cdp, statPage, `({
        status: document.querySelector('#backup-status')?.textContent || ''
      })`);
      if (receiverState.status.includes('復元が完了しました')
        && senderState.status.includes('転送と復元が完了しました')) {
        return { ok: true, receiverState, senderState };
      }
      if (senderState.status.includes('通信を確認できません')
        || receiverState.status.includes('復元に失敗')
        || receiverState.kind === 'error') {
        return { ok: false, receiverState, senderState };
      }
      return null;
    }, { timeoutMs: 30000 });
    if (!transferOutcome.ok) {
      throw new Error(`転送適用結果が拒否されました: ${JSON.stringify(transferOutcome)}`);
    }

    const senderAfter = await readAllStorage(cdp, statPage);
    assert.deepEqual(senderAfter, senderAfterCollection, '送信元の採取完了後storageが変わりました');
    const receiverAfter = await readAllStorage(cdp, transferPage);
    assert.equal(receiverAfter.local['native-transfer-receiver-unrelated'], 'keep-receiver');
    assert.equal(receiverAfter.session['native-transfer-receiver-session'], 'keep-receiver-session');
    assert.equal(typeof receiverAfter.local.trickcal_stat_slots_v2, 'string');
    assert.equal(receiverAfter.local.trickcal_formation_damage_result_saves_v1, calculationSave);
    assert.equal(receiverAfter.local.trickcal_storage_journal_v1 || null, null);
    const receiverFacts = stateFactsFromStorage(receiverAfter);
    assert.deepEqual(receiverFacts.slot, senderFacts.slot, '復元後slotの育成・編成内容が送信元と一致しません');
    assert.deepEqual(receiverFacts.current, senderFacts.current, '復元後currentの育成・編成内容が送信元と一致しません');
    assert.deepEqual(receiverFacts.calculationSaves, senderFacts.calculationSaves, '復元後の保存計算内容が送信元と一致しません');

    const directPackageBeforeSave = browser.snapshotDownloadedFiles(downloadRoot);
    await browser.activatePage(cdp, statPage);
    const senderMenuOpen = await browser.evaluate(cdp, statPage, '!!document.querySelector(".bottom-save-menu[open]")');
    if (!senderMenuOpen) {
      await browser.clickSelector(cdp, statPage, '.bottom-save-menu > summary');
      await browser.waitForSelector(cdp, statPage, '.bottom-save-popover');
    }
    stage = 'save-fixed-transfer-package';
    await browser.clickSelector(cdp, statPage, '#backup-transfer-save');
    await browser.waitForText(
      cdp,
      statPage,
      '#backup-status',
      text => text.includes('送信時点のバックアップを保存しました'),
      { timeoutMs: 30000 }
    );
    const fixedPackagePath = await browser.waitForNewDownload(downloadRoot, directPackageBeforeSave);
    const fixedPackageText = fs.readFileSync(fixedPackagePath, 'utf8');
    const fixedPackage = JSON.parse(fixedPackageText);
    assert.equal(fixedPackage.sha256, directPackageDigest, '保存した固定パッケージが送信payloadと一致しません');
    assert.equal((await storageBackup.decodeBackupPackage(fixedPackageText)).ok, true, '固定パッケージをdecodeできません');

    stage = 'close-direct-transfer';
    await cdp.send('Target.closeTarget', { targetId: transferPage.targetId });
    pages.splice(pages.indexOf(transferPage), 1);

    const backupPath = fixedPackagePath;

    stage = 'create-file-page';
    const filePage = await browser.createPage(cdp, transferUrl);
    pages.push(filePage);
    await browser.activatePage(cdp, filePage);
    await browser.waitForSelector(cdp, filePage, '#transfer-file-button');
    stage = 'file-input';
    await browser.setFileInputWithoutWaiting(cdp, filePage, '#transfer-file-input', backupPath);
    await waitForTransferPreview(cdp, filePage);
    stage = 'prepare-file-transfer';
    await browser.clickSelector(cdp, filePage, '#transfer-prepare');
    await browser.waitForText(cdp, filePage, '#transfer-status', text => text.includes('復元対象を確認しました'), { timeoutMs: 30000 });
    stage = 'apply-file-transfer';
    await browser.clickSelector(cdp, filePage, '#transfer-apply');
    await browser.waitForText(cdp, filePage, '#transfer-status', text => text.includes('復元が完了しました'), { timeoutMs: 30000 });
    const fileAfter = await readAllStorage(cdp, filePage);
    assert.equal(fileAfter.local['native-transfer-receiver-unrelated'], 'keep-receiver');
    assert.equal(fileAfter.local.trickcal_storage_journal_v1 || null, null);

    stage = 'close-file-page';
    await cdp.send('Target.closeTarget', { targetId: filePage.targetId });
    pages.splice(pages.indexOf(filePage), 1);
    stage = 'reopen-target';
    const reopened = await browser.createPage(cdp, `${secondOrigin}${REOPEN_PATH.replace('native=storage-transfer', 'native=storage-transfer-reopened')}`);
    pages.push(reopened);
    await browser.activatePage(cdp, reopened);
    await browser.waitFor(async () => browser.evaluate(cdp, reopened, `document.documentElement.dataset.storageBoot === 'ready' && !!document.querySelector('#apostle-select')`), { timeoutMs: 30000 });
    assert.equal(await browser.evaluate(cdp, reopened, 'typeof localStorage.getItem("trickcal_stat_slots_v2")'), 'string');
    assert.equal(await browser.evaluate(cdp, reopened, 'localStorage.getItem("trickcal_formation_damage_result_saves_v1") === ' + JSON.stringify(calculationSave)), true);

    const summaryPath = path.join(ROOT, 'tmp', 'storage-transfer-native-' + Date.now() + '.json');
    const report = {
      ok: true,
      isolatedProfile: true,
      origins: { source: firstOrigin, target: secondOrigin },
      directTransfer: {
        previewNoWrite: true,
        planNoWrite: true,
        receiverBackupBeforeApplySaved: true,
        sourceStateSeeded: true,
        senderUnchanged: true,
        receiverRestored: true,
        stateFactsMatch: true,
        calculationSavesPreserved: true,
        unrelatedKeysPreserved: true,
        senderCompletionObserved: true,
        fixedPackageSaved: true,
        fixedPackageMatchesDirectDigest: true
      },
      fileTransfer: { inputObserved: true, restored: true },
      reopenedTarget: { bootReady: true, savedDataReadable: true },
      diagnostics,
      summaryPath: path.relative(ROOT, summaryPath)
    };
    fs.writeFileSync(summaryPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } catch (error) {
    let sourceDiagnostic = null;
    try {
      sourceDiagnostic = await browser.evaluate(cdp, pages[0], `({
        status: document.querySelector('#backup-status')?.textContent || '',
        statusError: document.querySelector('#backup-status')?.className || '',
        transferDisabled: !!document.querySelector('#backup-transfer')?.disabled,
        boot: document.documentElement.dataset.storageBoot || '',
        targetHook: window.TRICKCAL_STORAGE_TRANSFER_TEST_TARGET_ORIGIN || '',
        resolvedTarget: window.TRICKCAL_STORAGE_TRANSFER?.getConfiguredPeerOrigin?.('target') || ''
      })`);
    } catch (sourceError) {
      sourceDiagnostic = { error: sourceError.message };
    }
    throw new Error(`${error.message}; nativeStage=${stage}; sourceDiagnostic=${JSON.stringify(sourceDiagnostic)}`);
  } finally {
    for (const page of pages.slice()) {
      try { if (cdp) await cdp.send('Target.closeTarget', { targetId: page.targetId }); } catch (_) {}
    }
    try { if (cdp) await cdp.send('Browser.close'); } catch (_) {}
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    if (serverOne && serverOne.exitCode === null && !serverOne.killed) serverOne.kill();
    if (serverTwo && serverTwo.exitCode === null && !serverTwo.killed) serverTwo.kill();
    await browser.sleep(250);
    try { fs.rmSync(profileRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch (_) {}
  }
}

run().catch(error => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
