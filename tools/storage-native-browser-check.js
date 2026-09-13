'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const storageBackup = require('../storage-backup.js');

const ROOT = path.resolve(__dirname, '..');
const SERVER_SCRIPT = path.join(ROOT, 'tools', 'fixtures', 'storage-http-server.js');
const IMPORT_FIXTURE = path.join(ROOT, 'tools', 'fixtures', 'storage-s1-import.json');
const PROBE_PATH = '/tools/fixtures/storage-http-baseline.html';
const STAT_PATH = '/stat-dashboard.html?view=settings&native=storage-p1b';
const DAMAGE_PATH = '/formation-damage-calc.html?native=storage-p1b';
const RECOVERY_PATH = '/storage-recovery.html?native=storage-c3';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findFreePort(excludedPorts = []) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      probe.close(error => {
        if (error) return reject(error);
        if (excludedPorts.includes(port)) return reject(new Error(`Port collision: ${port}`));
        resolve(port);
      });
    });
  });
}

async function waitFor(check, { timeoutMs = 15000, intervalMs = 100 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await sleep(intervalMs);
  }
  if (lastError) throw lastError;
  throw new Error(`Timed out after ${timeoutMs}ms`);
}

async function waitForStableValue(read, { timeoutMs = 10000, settleMs = 250 } = {}) {
  let previous = await read();
  return waitFor(async () => {
    await sleep(settleMs);
    const next = await read();
    if (JSON.stringify(next) === JSON.stringify(previous)) return next;
    previous = next;
    return null;
  }, { timeoutMs, intervalMs: 25 });
}

async function waitForQuiescentValue(
  read,
  { timeoutMs = 30000, settleMs = 1000, stableReads = 3 } = {}
) {
  let previous = await read();
  let unchangedReads = 0;
  return waitFor(async () => {
    await sleep(settleMs);
    const next = await read();
    if (JSON.stringify(next) !== JSON.stringify(previous)) {
      previous = next;
      unchangedReads = 0;
      return null;
    }
    unchangedReads += 1;
    return unchangedReads >= stableReads ? next : null;
  }, { timeoutMs, intervalMs: 25 });
}

function normalizeStorageDataForComparison(storage) {
  const normalized = {
    local: { ...(storage?.local || {}) },
    session: { ...(storage?.session || {}) }
  };
  const mirrorSpecs = [
    {
      key: 'trickcal_stat_live_v2',
      volatileKeys: ['revision', 'sourceTabInstanceId', 'publishedAt']
    },
    {
      key: 'trickcal_stat_prototype_v1',
      volatileKeys: ['syncRevision']
    }
  ];
  mirrorSpecs.forEach(({ key, volatileKeys }) => {
    const rawMirror = normalized.local[key];
    if (rawMirror == null) return;
    try {
      const mirror = JSON.parse(rawMirror);
      const removeDerivedTimestamps = value => {
        if (Array.isArray(value)) {
          value.forEach(removeDerivedTimestamps);
          return;
        }
        if (!value || typeof value !== 'object') return;
        delete value.updatedAt;
        // persistStateの版管理値は、maintenanceのflush/resumeで進み得る。
        // snapshot本体の不変性とは分けて比較する。
        delete value.syncRevision;
        Object.values(value).forEach(removeDerivedTimestamps);
      };
      volatileKeys.forEach(volatileKey => delete mirror[volatileKey]);
      removeDerivedTimestamps(mirror);
      normalized.local[key] = mirror;
    } catch (_) {
      // Preserve invalid values as-is so a valid/invalid transition still fails.
    }
  });
  return normalized;
}

function collectStorageDifferences(expected, actual, path = '', differences = [], limit = 20) {
  if (differences.length >= limit || Object.is(expected, actual)) return differences;
  if (Array.isArray(expected) && Array.isArray(actual)) {
    const length = Math.max(expected.length, actual.length);
    for (let index = 0; index < length; index += 1) {
      collectStorageDifferences(expected[index], actual[index], `${path}[${index}]`, differences, limit);
      if (differences.length >= limit) break;
    }
    return differences;
  }
  if (expected && actual && typeof expected === 'object' && typeof actual === 'object') {
    const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    for (const key of keys) {
      collectStorageDifferences(expected[key], actual[key], path ? `${path}.${key}` : key, differences, limit);
      if (differences.length >= limit) break;
    }
    return differences;
  }
  differences.push(path || '<root>');
  return differences;
}

function assertStorageDataUnchanged(before, after, message) {
  const expected = normalizeStorageDataForComparison(before);
  const actual = normalizeStorageDataForComparison(after);
  const differences = collectStorageDifferences(expected, actual);
  assert.equal(differences.length, 0, `${message}: ${differences.join(', ')}`);
}

async function waitForHttp(url) {
  await waitFor(async () => {
    const response = await fetch(url);
    return response.ok;
  });
}

function findChrome() {
  const candidates = [
    process.env.TRICKCAL_CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);
  const executable = candidates.find(candidate => fs.existsSync(candidate));
  if (!executable) throw new Error('Chrome/Edge executable was not found. Set TRICKCAL_CHROME_PATH.');
  return executable;
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.nextId = 1;
    this.pending = new Map();
    this.eventHandlers = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = event => {
      let message;
      try {
        message = JSON.parse(String(event.data));
      } catch (error) {
        return;
      }
      if (!message.id) {
        const key = `${message.sessionId || ''}:${message.method || ''}`;
        const handlers = this.eventHandlers.get(key) || [];
        handlers.forEach(handler => {
          Promise.resolve(handler(message.params || {}, message)).catch(() => {});
        });
        return;
      }
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new Error(`${message.error.code}: ${message.error.message}`));
      } else {
        pending.resolve(message.result || {});
      }
    };
    this.socket.onerror = event => {
      const error = new Error(`CDP websocket error: ${event.message || 'unknown error'}`);
      for (const pending of this.pending.values()) pending.reject(error);
      this.pending.clear();
    };
    await new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
    });
  }

  on(sessionId, method, handler) {
    const key = `${sessionId || ''}:${method}`;
    const handlers = this.eventHandlers.get(key) || [];
    handlers.push(handler);
    this.eventHandlers.set(key, handlers);
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.nextId++;
    const message = { id, method, params };
    if (sessionId) message.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify(message));
    });
  }

  close() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) this.socket.close();
  }
}

async function createPage(cdp, url) {
  const { targetId } = await cdp.send('Target.createTarget', {
    url,
    newWindow: false,
    background: false
  });
  const { sessionId } = await cdp.send('Target.attachToTarget', {
    targetId,
    flatten: true
  });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('DOM.enable', {}, sessionId);
  await waitFor(async () => {
    const state = await evaluate(cdp, { sessionId }, 'document.readyState');
    return state === 'complete' || state === 'interactive';
  });
  return { targetId, sessionId };
}

async function activatePage(cdp, page) {
  try {
    const { windowId } = await cdp.send('Browser.getWindowForTarget', { targetId: page.targetId });
    if (windowId != null) {
      await cdp.send('Browser.setWindowBounds', {
        windowId,
        bounds: { windowState: 'normal' }
      });
    }
  } catch (_) {}
  await cdp.send('Target.activateTarget', { targetId: page.targetId });
  await cdp.send('Page.bringToFront', {}, page.sessionId);
  await sleep(100);
}

async function waitForSelector(cdp, page, selector, options = {}) {
  const literal = JSON.stringify(selector);
  return waitFor(
    () => evaluate(cdp, page, `(() => {
      const element = document.querySelector(${literal});
      if (!element) return null;
      let current = element;
      while (current && current.nodeType === Node.ELEMENT_NODE) {
        const style = getComputedStyle(current);
        if (current.hidden || style.display === 'none' || style.visibility === 'hidden') return null;
        current = current.parentElement;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      if ('disabled' in element && element.disabled) return null;
      return {
        tagName: element.tagName,
        text: element.innerText || element.textContent || '',
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      };
    })()`),
    options
  );
}

async function waitForText(cdp, page, selector, predicate, options = {}) {
  const literal = JSON.stringify(selector);
  return waitFor(
    async () => {
      const text = await evaluate(cdp, page, `document.querySelector(${literal})?.innerText || document.querySelector(${literal})?.textContent || ''`);
      return predicate(text) ? text : null;
    },
    options
  );
}

async function readValue(cdp, page, selector) {
  const literal = JSON.stringify(selector);
  return evaluate(cdp, page, `document.querySelector(${literal})?.value ?? ''`);
}

async function readAttribute(cdp, page, selector, attribute) {
  const selectorLiteral = JSON.stringify(selector);
  const attributeLiteral = JSON.stringify(attribute);
  return evaluate(cdp, page, `document.querySelector(${selectorLiteral})?.getAttribute(${attributeLiteral}) || ''`);
}

async function pressKey(cdp, page, key) {
  const keyData = {
    Home: { code: 'Home', windowsVirtualKeyCode: 36 },
    End: { code: 'End', windowsVirtualKeyCode: 35 },
    ArrowDown: { code: 'ArrowDown', windowsVirtualKeyCode: 40 },
    ArrowUp: { code: 'ArrowUp', windowsVirtualKeyCode: 38 },
    Enter: { code: 'Enter', windowsVirtualKeyCode: 13 }
  }[key];
  if (!keyData) throw new Error(`Unsupported key: ${key}`);
  const params = { key, ...keyData, type: 'keyDown' };
  await cdp.send('Input.dispatchKeyEvent', params, page.sessionId);
  await cdp.send('Input.dispatchKeyEvent', { ...params, type: 'keyUp' }, page.sessionId);
}

async function selectValue(cdp, page, selector, value) {
  const selectorLiteral = JSON.stringify(selector);
  const valueLiteral = JSON.stringify(String(value));
  const optionIndex = await evaluate(cdp, page, `(() => {
    const select = document.querySelector(${selectorLiteral});
    if (!select) return -1;
    return Array.from(select.options).findIndex(option => option.value === ${valueLiteral});
  })()`);
  if (optionIndex < 0) throw new Error(`Option not found: ${selector}=${value}`);
  if (await readValue(cdp, page, selector) === String(value)) return;
  await clickSelector(cdp, page, selector);
  await pressKey(cdp, page, 'Home');
  for (let index = 0; index < optionIndex; index += 1) await pressKey(cdp, page, 'ArrowDown');
  await pressKey(cdp, page, 'Enter');
  await waitFor(async () => (await readValue(cdp, page, selector)) === String(value));
}

async function installDialogAutoAccept(cdp, page, dialogLog, diagnostics = {}) {
  await cdp.send('Page.enable', {}, page.sessionId);
  const handleDialog = async (params, message) => {
    const sessionId = message?.sessionId || '';
    const entry = { type: params.type, message: params.message, sessionId: sessionId || null, handled: false };
    dialogLog.push(entry);
    try {
      if (sessionId) await cdp.send('Page.handleJavaScriptDialog', { accept: true }, sessionId);
      else await cdp.send('Page.handleJavaScriptDialog', { accept: true });
      entry.handled = true;
    } catch (error) {
      entry.error = error.message;
      diagnostics.dialogErrors = diagnostics.dialogErrors || [];
      diagnostics.dialogErrors.push(error.message);
    }
  };
  // Flattened CDP normally includes sessionId, but some Chrome builds emit
  // the page dialog event on the browser socket without it.
  cdp.on(page.sessionId, 'Page.javascriptDialogOpening', handleDialog);
  cdp.on('', 'Page.javascriptDialogOpening', handleDialog);
}

async function acceptPendingDialog(cdp, page) {
  await sleep(100);
  try {
    await cdp.send('Page.handleJavaScriptDialog', { accept: true }, page.sessionId);
    return true;
  } catch (_) {
    try {
      await cdp.send('Page.handleJavaScriptDialog', { accept: true });
      return true;
    } catch (_) {
      return false;
    }
  }
}

function installPageDiagnostics(cdp, page, diagnostics) {
  cdp.on(page.sessionId, 'Runtime.exceptionThrown', params => {
    const details = params.exceptionDetails || {};
    diagnostics.exceptions = diagnostics.exceptions || [];
    diagnostics.exceptions.push({
      text: details.text || '',
      description: details.exception?.description || '',
      url: details.url || '',
      lineNumber: details.lineNumber ?? null
    });
  });
  cdp.on(page.sessionId, 'Runtime.consoleAPICalled', params => {
    const values = (params.args || []).map(argument => argument.value ?? argument.description ?? '').slice(0, 4);
    diagnostics.console = diagnostics.console || [];
    diagnostics.console.push({ type: params.type, values });
  });
}

async function setFileInputWithoutWaiting(cdp, page, selector, filePath) {
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 }, page.sessionId);
  const { nodeId } = await cdp.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector
  }, page.sessionId);
  assert.ok(nodeId, `Element not found: ${selector}`);
  await cdp.send('DOM.setFileInputFiles', { nodeId, files: [filePath] }, page.sessionId);
}

function listDownloadedFiles(downloadRoot) {
  return fs.readdirSync(downloadRoot)
    .filter(name => !name.endsWith('.crdownload'))
    .map(name => path.join(downloadRoot, name));
}

function snapshotDownloadedFiles(downloadRoot) {
  return new Map(listDownloadedFiles(downloadRoot).map(file => {
    const stat = fs.statSync(file);
    return [file, { size: stat.size, mtimeMs: stat.mtimeMs }];
  }));
}

function getChangedDownloadedFiles(downloadRoot, previousFiles) {
  const previous = previousFiles instanceof Map
    ? previousFiles
    : new Map((previousFiles || []).map(file => [file, null]));
  return listDownloadedFiles(downloadRoot).filter(file => {
    if (!previous.has(file)) return true;
    const before = previous.get(file);
    if (!before) return false;
    const after = fs.statSync(file);
    return after.size !== before.size || after.mtimeMs > before.mtimeMs;
  });
}

async function waitForNewDownload(downloadRoot, previousFiles) {
  return waitFor(() => {
    const next = getChangedDownloadedFiles(downloadRoot, previousFiles)[0];
    return next || null;
  });
}

async function chooseFormationTarget(cdp, page, apostleId) {
  const targetSelector = `#fdc-target-preview`;
  await activatePage(cdp, page);
  await runStage('対象プレビュークリック', () => clickSelector(cdp, page, targetSelector));
  await runStage('編成選択パネル', () => waitForSelector(cdp, page, '#fdc-formation-picker'));
  const allMode = '[data-fdc-picker-mode="all"]';
  if (await evaluate(cdp, page, `!!document.querySelector(${JSON.stringify(allMode)})`)) {
    await runStage('使徒一覧切替', () => clickSelector(cdp, page, allMode));
  }
  const memberSelector = `[data-fdc-member-id="${apostleId}"]`;
  await runStage(`対象候補 ${apostleId}`, () => waitForSelector(cdp, page, memberSelector));
  await runStage(`対象候補 ${apostleId} 適用`, () => clickSelector(cdp, page, memberSelector));
  const needsPlacement = await evaluate(cdp, page, '!!document.querySelector("[data-fdc-temp-member-slot]")');
  if (needsPlacement) {
    await runStage('一時配置候補', () => waitForSelector(cdp, page, '[data-fdc-temp-member-slot]'));
    await runStage('一時配置適用', () => clickSelector(cdp, page, '[data-fdc-temp-member-slot]'));
  }
  return runStage(`対象 ${apostleId} 表示反映`, () => waitFor(async () => {
    const observed = await evaluate(cdp, page, `(() => {
      const preview = document.querySelector(${JSON.stringify(targetSelector)});
      const image = preview?.querySelector('img');
      const basic = window.TRICKCAL_STAT_DATA?.sheets?.basicInfo?.find(row => row.id === ${JSON.stringify(apostleId)});
      return { title: preview?.title || '', image: image?.src || '', name: basic?.使徒名 || '' };
    })()`);
    const haystack = `${observed?.title || ''} ${observed?.image || ''} ${observed?.name || ''}`.toLowerCase();
    return haystack.includes(String(apostleId).toLowerCase())
      || (observed?.name && String(observed.title || '').includes(String(observed.name)))
      ? observed
      : null;
  }));
}

async function enterDpsModeAndCalculate(cdp, page) {
  const modeSelector = '[data-fdcp-mode="dps"]';
  await waitForSelector(cdp, page, modeSelector);
  await waitFor(async () => evaluate(cdp, page, `(() => {
    const button = document.querySelector(${JSON.stringify(modeSelector)});
    return !!button && !button.disabled && button.getAttribute('aria-disabled') !== 'true';
  })()`));
  await clickSelector(cdp, page, modeSelector);
  await waitFor(async () => evaluate(cdp, page, 'document.body.dataset.fdcpMode === "dps"'));
  await waitForSelector(cdp, page, '#fdcp-dps-result');
  await waitFor(async () => evaluate(cdp, page, `(() => {
    const button = document.querySelector('#fdcp-dps-run');
    return !!button && !button.disabled;
  })()`), { timeoutMs: 30000 });
  await openDpsSettings(cdp, page);
  await waitForSelector(cdp, page, '#fdcp-dps-run');
  await clickSelector(cdp, page, '#fdcp-dps-run');
  return waitFor(async () => {
    const result = await evaluate(cdp, page, `({
      value: document.querySelector('#fdcp-dps-value')?.textContent?.trim() || '',
      state: document.querySelector('#fdcp-dps-state')?.textContent?.trim() || '',
      timeline: document.querySelector('#fdcp-dps-detail-grid')?.textContent?.includes('単一seed 行動タイムライン') || false
    })`);
    if (!result.value || /^(—|再計算必要|DPS未対応)$/.test(result.value)) return null;
    return result;
  }, { timeoutMs: 30000 });
}

async function openDpsSettings(cdp, page) {
  const panelSelector = '#fdcp-dps-settings-panel';
  const hidden = await evaluate(cdp, page, `document.querySelector(${JSON.stringify(panelSelector)})?.hidden !== false`);
  if (hidden) await clickSelector(cdp, page, '#fdcp-dps-settings-toggle');
  await waitForSelector(cdp, page, panelSelector);
}

async function reloadPage(cdp, page) {
  await cdp.send('Page.reload', { ignoreCache: true }, page.sessionId);
  await waitFor(async () => {
    const state = await evaluate(cdp, page, 'document.readyState');
    return state === 'complete' || state === 'interactive';
  });
}

async function waitForStorageBoot(cdp, page) {
  return waitFor(
    () => evaluate(cdp, page, 'document.documentElement.dataset.storageBoot === "ready"'),
    { timeoutMs: 30000 }
  );
}

async function checkStorageBootGuard(cdp, url) {
  const journalKey = 'trickcal_storage_journal_v1';
  const guardPage = await createPage(cdp, url);
  try {
    await evaluate(
      cdp,
      guardPage,
      `localStorage.setItem(${JSON.stringify(journalKey)}, JSON.stringify({ version: 99 }))`
    );
    await reloadPage(cdp, guardPage);
    const result = await waitFor(async () => {
      const state = await evaluate(cdp, guardPage, `(() => ({
        boot: document.documentElement.dataset.storageBoot || '',
        errorPage: !!document.querySelector('.storage-boot-error'),
        appSelect: !!document.querySelector('#apostle-select'),
        journal: localStorage.getItem(${JSON.stringify(journalKey)}) || ''
      }))()`);
      if (!state.boot) return null;
      if (state.boot === 'recovery-required' && !state.errorPage) return null;
      return state;
    }, { timeoutMs: 30000 });
    assert.equal(result.boot, 'recovery-required');
    assert.equal(result.errorPage, true);
    assert.equal(result.appSelect, false);
    assert.equal(result.journal, JSON.stringify({ version: 99 }));
    return {
      boot: result.boot,
      errorPage: result.errorPage,
      appSelect: result.appSelect,
      journalPreserved: result.journal === JSON.stringify({ version: 99 })
    };
  } finally {
    await evaluate(cdp, guardPage, `localStorage.removeItem(${JSON.stringify(journalKey)})`);
    await cdp.send('Target.closeTarget', { targetId: guardPage.targetId });
  }
}

async function checkStandaloneRescue(cdp, url, downloadRoot) {
  const journalKey = 'trickcal_storage_journal_v1';
  const recoveryPage = await createPage(cdp, url);
  const storageKeys = [
    journalKey,
    'trickcal_stat_slots_v2',
    'trickcal_stat_prototype_v1',
    'trickcal_stat_live_v2',
    'trickcal_stat_workspace_v2',
    'trickcal_formation_damage_result_saves_v1'
  ];
  const readStorage = () => evaluate(cdp, recoveryPage, `(() => {
    const keys = ${JSON.stringify(storageKeys)};
    const read = storage => Object.fromEntries(keys.map(key => [key, storage.getItem(key)]));
    return { local: read(localStorage), session: read(sessionStorage) };
  })()`);
  try {
    await activatePage(cdp, recoveryPage);
    await evaluate(cdp, recoveryPage, `localStorage.setItem(${JSON.stringify(journalKey)}, '{broken-journal')`);
    await reloadPage(cdp, recoveryPage);
    await waitForText(cdp, recoveryPage, '#recovery-status', text => text.includes('安全に確認できません'), { timeoutMs: 10000 });
    const before = await readStorage();
    const previousFiles = snapshotDownloadedFiles(downloadRoot);
    await clickSelector(cdp, recoveryPage, '#recovery-export-rescue');
    await waitForText(cdp, recoveryPage, '#recovery-status', text => text.includes('救出ファイルを保存しました'), { timeoutMs: 10000 });
    const rescuePath = await waitForNewDownload(downloadRoot, previousFiles);
    const rescueOuter = JSON.parse(fs.readFileSync(rescuePath, 'utf8'));
    assert.equal(rescueOuter.format, storageBackup.rescueFormat);
    const decoded = await storageBackup.decodeRescuePackage(JSON.stringify(rescueOuter));
    assert.equal(decoded.ok, true, JSON.stringify(decoded));
    const after = await readStorage();
    assertStorageDataUnchanged(before, after, '独立救出で保存データが変更されました');
    assert.equal(after.local[journalKey], '{broken-journal');
    assert.equal(
      decoded.value.payload.entries.find(entry => entry.id === 'stat.slotStore')?.state,
      'present'
    );
    return {
      rescueFile: path.basename(rescuePath),
      rescueFormat: rescueOuter.format,
      rescueEntryCount: decoded.value.payload.entries.length,
      brokenJournalPreserved: true,
      storageUnchanged: true,
      normalBootCalled: false
    };
  } finally {
    try { await evaluate(cdp, recoveryPage, `localStorage.removeItem(${JSON.stringify(journalKey)})`); } catch (_) {}
    await cdp.send('Target.closeTarget', { targetId: recoveryPage.targetId });
  }
}

async function checkStorageRuntimeLocks(cdp, page, secondPage, diagnostics = null) {
  await runStage('Lock primary boot', () => waitForStorageBoot(cdp, page));
  await runStage('Lock secondary boot', () => waitForStorageBoot(cdp, secondPage));
  await runStage('Lock primary activate', () => activatePage(cdp, page));
  const preflight = await runStage('Lock preflight', () => evaluate(cdp, page, `(() => {
    const runtime = window.TRICKCAL_STORAGE_RUNTIME_INSTANCE;
    const stateBefore = runtime?.getState?.() || null;
    const flush = runtime?.flushParticipants?.() || null;
    return {
      visibility: document.visibilityState,
      focus: document.hasFocus(),
      stateBefore,
      flush,
      stateAfter: runtime?.getState?.() || null,
      storageError: document.documentElement.dataset.storageError || ''
    };
  })()`));
  const busy = await runStage('Lock busy probe', () => evaluate(cdp, page, `(async () => {
    const runtime = window.TRICKCAL_STORAGE_RUNTIME_INSTANCE;
    return runtime ? await runtime.beginMaintenance('native-lock-check') : null;
  })()`));
  assert.deepEqual(
    { ok: busy?.ok, code: busy?.code },
    { ok: false, code: 'busy' },
    `sharedを保持する実2タブ中のexclusive取得がbusyになりません: ${JSON.stringify({ preflight, busy, diagnostics })}`
  );

  await cdp.send('Target.closeTarget', { targetId: secondPage.targetId });
  const released = await runStage('Lock released probe', () => waitFor(
    async () => {
      const attempt = await evaluate(cdp, page, `(async () => {
        const runtime = window.TRICKCAL_STORAGE_RUNTIME_INSTANCE;
        if (!runtime) return null;
        const maintenance = await runtime.beginMaintenance('native-lock-check');
        if (!maintenance?.ok) return { acquired: false, code: maintenance?.code };
        const cancelled = await maintenance.value.cancel();
        return {
          acquired: true,
          cancelled: !!cancelled?.ok,
          state: runtime.getState()
        };
      })()`);
      if (attempt?.acquired === false && attempt.code === 'busy') return null;
      return attempt;
    },
    { timeoutMs: 5000, intervalMs: 150 }
  ));
  assert.deepEqual(
    {
      acquired: released?.acquired,
      cancelled: released?.cancelled,
      lifecycle: released?.state?.lifecycle,
      hasSharedLock: released?.state?.hasSharedLock,
      hasExclusiveLock: released?.state?.hasExclusiveLock
    },
    {
      acquired: true,
      cancelled: true,
      lifecycle: 'ready',
      hasSharedLock: true,
      hasExclusiveLock: false
    },
    'shared終了後のexclusive取得またはcancel後のshared復帰が不正です'
  );
  return {
    preflight,
    busy: { ok: busy.ok, code: busy.code },
    released: {
      acquired: released.acquired,
      cancelled: released.cancelled,
      lifecycle: released.state.lifecycle,
      hasSharedLock: released.state.hasSharedLock,
      hasExclusiveLock: released.state.hasExclusiveLock
    }
  };
}

async function checkStorageAppLifecycle(cdp, appUrl, awayUrl) {
  let lifecyclePage = null;
  let peerPage = null;
  let observerScriptId = null;
  const pageshowMarkerKey = '__trickcal_native_pageshow_v1';
  const pagehideMarkerKey = '__trickcal_native_pagehide_v1';
  const lifecycleObserver = `(() => {
    if (window.__trickcalNativeLifecycleObserver) return;
    window.__trickcalNativeLifecycleObserver = true;
    let events = [];
    try {
      const parsed = JSON.parse(window.name || '[]');
      if (Array.isArray(parsed)) events = parsed;
    } catch (_) {}
    const record = (type, event) => {
      events = events.concat({ type, persisted: !!event?.persisted }).slice(-20);
      window.name = JSON.stringify(events);
      if (type === 'pageshow') {
        let marks = [];
        try {
          const parsed = JSON.parse(sessionStorage.getItem(${JSON.stringify(pageshowMarkerKey)}) || '[]');
          if (Array.isArray(parsed)) marks = parsed;
        } catch (_) {}
        marks = marks.concat({
          type,
          path: location.pathname,
          persisted: !!event?.persisted
        }).slice(-20);
        sessionStorage.setItem(${JSON.stringify(pageshowMarkerKey)}, JSON.stringify(marks));
      }
      if (type === 'pagehide') {
        let marks = [];
        try {
          const parsed = JSON.parse(sessionStorage.getItem(${JSON.stringify(pagehideMarkerKey)}) || '[]');
          if (Array.isArray(parsed)) marks = parsed;
        } catch (_) {}
        marks = marks.concat({
          type,
          path: location.pathname,
          persisted: !!event?.persisted
        }).slice(-20);
        sessionStorage.setItem(${JSON.stringify(pagehideMarkerKey)}, JSON.stringify(marks));
      }
    };
    window.addEventListener('pagehide', event => record('pagehide', event));
    window.addEventListener('pageshow', event => record('pageshow', event));
  })();`;

  try {
    lifecyclePage = await createPage(cdp, `${appUrl}&lifecycle=1`);
    peerPage = await createPage(cdp, `${appUrl}&lifecyclePeer=1`);
    await waitForStorageBoot(cdp, lifecyclePage);
    await evaluate(cdp, lifecyclePage, `sessionStorage.removeItem(${JSON.stringify(pageshowMarkerKey)})`);
    await evaluate(cdp, lifecyclePage, `sessionStorage.removeItem(${JSON.stringify(pagehideMarkerKey)})`);
    await waitForStorageBoot(cdp, peerPage);
    await cdp.send('Page.enable', {}, lifecyclePage.sessionId);
    observerScriptId = (await cdp.send(
      'Page.addScriptToEvaluateOnNewDocument',
      { source: lifecycleObserver },
      lifecyclePage.sessionId
    )).identifier;
    await evaluate(cdp, lifecyclePage, lifecycleObserver);

    await activatePage(cdp, lifecyclePage);
    await sleep(250);
    await activatePage(cdp, peerPage);
    let lastHiddenState = null;
    try {
      await waitFor(async () => {
        lastHiddenState = await evaluate(cdp, lifecyclePage, `({
          visibility: document.visibilityState,
          focus: document.hasFocus(),
          boot: document.documentElement.dataset.storageBoot || ''
        })`);
        return lastHiddenState.visibility === 'hidden';
      }, { timeoutMs: 5000, intervalMs: 100 });
    } catch (error) {
      throw new Error(`${error.message}; lifecycleHidden=${JSON.stringify(lastHiddenState)}`);
    }
    const hidden = await evaluate(cdp, lifecyclePage, `(() => ({
      visibility: document.visibilityState,
      focus: document.hasFocus(),
      state: window.TRICKCAL_STORAGE_RUNTIME_INSTANCE?.getState?.() || null,
      storageError: document.documentElement.dataset.storageError || ''
    }))()`);
    const hiddenBusy = await evaluate(cdp, peerPage, `(async () => {
      const runtime = window.TRICKCAL_STORAGE_RUNTIME_INSTANCE;
      return runtime ? await runtime.beginMaintenance('native-lifecycle-hidden') : null;
    })()`);
    assert.deepEqual(
      { ok: hiddenBusy?.ok, code: hiddenBusy?.code },
      { ok: false, code: 'busy' },
      `hidden中の実アプリがsharedを保持しません: ${JSON.stringify({ hidden, hiddenBusy })}`
    );

    await activatePage(cdp, lifecyclePage);
    let lastVisibleState = null;
    try {
      await waitFor(async () => {
        lastVisibleState = await evaluate(cdp, lifecyclePage, `({
          visibility: document.visibilityState,
          focus: document.hasFocus(),
          boot: document.documentElement.dataset.storageBoot || ''
        })`);
        return lastVisibleState.visibility === 'visible';
      }, { timeoutMs: 5000, intervalMs: 100 });
    } catch (error) {
      throw new Error(`${error.message}; lifecycleVisible=${JSON.stringify(lastVisibleState)}`);
    }
    const visible = await evaluate(cdp, lifecyclePage, `(() => ({
      visibility: document.visibilityState,
      focus: document.hasFocus(),
      state: window.TRICKCAL_STORAGE_RUNTIME_INSTANCE?.getState?.() || null,
      storageError: document.documentElement.dataset.storageError || ''
    }))()`);

    await cdp.send('Page.navigate', { url: awayUrl }, lifecyclePage.sessionId);
    await waitFor(async () => {
      const state = await evaluate(cdp, lifecyclePage, 'document.readyState');
      return state === 'complete' || state === 'interactive';
    });
    const released = await waitFor(async () => {
      const attempt = await evaluate(cdp, peerPage, `(async () => {
        const runtime = window.TRICKCAL_STORAGE_RUNTIME_INSTANCE;
        if (!runtime) return null;
        const maintenance = await runtime.beginMaintenance('native-lifecycle-pagehide');
        if (!maintenance?.ok) return { acquired: false, code: maintenance?.code };
        const cancelled = await maintenance.value.cancel();
        return {
          acquired: true,
          cancelled: !!cancelled?.ok,
          state: runtime.getState()
        };
      })()`);
      if (attempt?.acquired === false && attempt.code === 'busy') return null;
      return attempt;
    }, { timeoutMs: 5000, intervalMs: 150 });
    assert.equal(released?.acquired, true);
    assert.equal(released?.cancelled, true);

    const history = await cdp.send('Page.getNavigationHistory', {}, lifecyclePage.sessionId);
    const previousEntry = history.entries?.[Math.max(0, history.currentIndex - 1)];
    assert.ok(previousEntry, 'pageshow検証用の戻り先履歴がありません');
    await cdp.send(
      'Page.navigateToHistoryEntry',
      { entryId: previousEntry.id },
      lifecyclePage.sessionId
    );
    await waitFor(async () => {
      const state = await evaluate(cdp, lifecyclePage, 'document.readyState');
      return state === 'complete' || state === 'interactive';
    });
    await waitForStorageBoot(cdp, lifecyclePage);
    let lastRestored = null;
    const restored = await waitFor(async () => {
      lastRestored = await evaluate(cdp, lifecyclePage, `(() => ({
        boot: document.documentElement.dataset.storageBoot || '',
        visibility: document.visibilityState,
        state: window.TRICKCAL_STORAGE_RUNTIME_INSTANCE?.getState?.() || null,
        storageError: document.documentElement.dataset.storageError || '',
        events: (() => {
          try { return JSON.parse(window.name || '[]'); } catch (_) { return []; }
        })(),
        pageshowMarks: (() => {
          try { return JSON.parse(sessionStorage.getItem(${JSON.stringify(pageshowMarkerKey)}) || '[]'); } catch (_) { return []; }
        })(),
        pagehideMarks: (() => {
          try { return JSON.parse(sessionStorage.getItem(${JSON.stringify(pagehideMarkerKey)}) || '[]'); } catch (_) { return []; }
        })(),
        pageshowObserved: (() => {
          try {
            return JSON.parse(sessionStorage.getItem(${JSON.stringify(pageshowMarkerKey)}) || '[]')
              .some(mark => mark.type === 'pageshow' && mark.path === '/stat-dashboard.html');
          } catch (_) { return false; }
        })(),
        pagehideObserved: (() => {
          try {
            return JSON.parse(sessionStorage.getItem(${JSON.stringify(pagehideMarkerKey)}) || '[]')
              .some(mark => mark.type === 'pagehide' && mark.path === '/stat-dashboard.html');
          } catch (_) { return false; }
        })()
      }))()`);
      return lastRestored.boot === 'ready'
        && lastRestored.pageshowObserved
        ? lastRestored
        : null;
    }, { timeoutMs: 30000, intervalMs: 100 }).catch(error => {
      throw new Error(`${error.message}; lifecycleRestored=${JSON.stringify(lastRestored)}`);
    });
    assert.equal(restored.boot, 'ready');
    assert.equal(restored.visibility, 'visible');
    assert.equal(restored.pagehideObserved, true);
    assert.equal(restored.pageshowObserved, true);
    return {
      hidden: {
        visibility: hidden.visibility,
        focus: hidden.focus,
        lifecycle: hidden.state?.lifecycle,
        permission: hidden.state?.permission,
        storageError: hidden.storageError
      },
      hiddenBusy: { ok: hiddenBusy.ok, code: hiddenBusy.code },
      visible: {
        visibility: visible.visibility,
        focus: visible.focus,
        lifecycle: visible.state?.lifecycle,
        permission: visible.state?.permission,
        storageError: visible.storageError
      },
      pagehide: {
        released: released.acquired,
        cancelled: released.cancelled
      },
      pageshow: {
        boot: restored.boot,
        visibility: restored.visibility,
        lifecycle: restored.state?.lifecycle,
        permission: restored.state?.permission,
        pageshowObserved: restored.pageshowObserved,
        pagehideObserved: restored.pagehideObserved,
        pageshowMarks: restored.pageshowMarks,
        pagehideMarks: restored.pagehideMarks,
        events: restored.events
      }
    };
  } finally {
    try {
      if (lifecyclePage && cdp) {
        await evaluate(cdp, lifecyclePage, `sessionStorage.removeItem(${JSON.stringify(pageshowMarkerKey)})`);
        await evaluate(cdp, lifecyclePage, `sessionStorage.removeItem(${JSON.stringify(pagehideMarkerKey)})`);
      }
    } catch (_) {}
    if (observerScriptId && lifecyclePage && cdp) {
      try {
        await cdp.send(
          'Page.removeScriptToEvaluateOnNewDocument',
          { identifier: observerScriptId },
          lifecyclePage.sessionId
        );
      } catch (_) {}
    }
    try {
      if (peerPage && cdp) await cdp.send('Target.closeTarget', { targetId: peerPage.targetId });
    } catch (_) {}
    try {
      if (lifecyclePage && cdp) await cdp.send('Target.closeTarget', { targetId: lifecyclePage.targetId });
    } catch (_) {}
  }
}

async function chooseStatDraftApostle(cdp, page, excludedId) {
  const saveMenuOpen = await evaluate(cdp, page, '!!document.querySelector(".bottom-save-menu[open]")');
  if (saveMenuOpen) await runStage('保存メニューを閉じる', () => clickSelector(cdp, page, '.bottom-save-menu > summary'));
  await runStage('使徒選択ボタン', () => clickSelector(cdp, page, '.bottom-apostle-button'));
  await runStage('使徒選択ダイアログ', () => waitForSelector(cdp, page, '#apostle-picker-dialog[open]'));
  const available = await runStage('使徒選択候補', () => evaluate(cdp, page, `Array.from(document.querySelectorAll('[data-apostle-picker-id]')).map(card => ({
    id: card.dataset.apostlePickerId || '',
    label: card.innerText || card.textContent || ''
  }))`));
  const preferred = ['Tig', 'Momo', 'Sylla', 'Barong'];
  const candidate = preferred.find(id => id !== excludedId && available.some(item => item.id === id))
    || available.find(item => item.id && item.id !== excludedId)?.id;
  assert.ok(candidate, '未保存draft用の使徒を選択できません');
  await runStage('使徒選択適用', async () => {
    await clickSelector(cdp, page, `[data-apostle-picker-id="${candidate}"]`);
    await waitFor(async () => (await readValue(cdp, page, '#apostle-select')) === candidate);
  });
  return candidate;
}

async function runStage(name, callback) {
  try {
    return await callback();
  } catch (error) {
    throw new Error(`${name}: ${error.message}`);
  }
}

async function readStatExport(downloadRoot, previousFiles) {
  try {
    return await waitFor(() => {
      const candidates = getChangedDownloadedFiles(downloadRoot, previousFiles);
      for (const candidate of candidates) {
        try {
          const payload = JSON.parse(fs.readFileSync(candidate, 'utf8'));
          if (payload.schema !== 'trickcal-stat-state') continue;
          if (payload.kind !== 'slot') continue;
          if (!payload.snapshot || typeof payload.snapshot !== 'object') continue;
          return { path: candidate, payload };
        } catch (_) {
          // Chrome may expose the destination before the download stream is a
          // complete JSON file. Keep polling the same file instead of accepting
          // an unrelated/incomplete file as export evidence.
        }
      }
      return null;
    });
  } catch (error) {
    const candidates = getChangedDownloadedFiles(downloadRoot, previousFiles)
      .map(file => {
        const buffer = fs.readFileSync(file);
        return {
          file: path.basename(file),
          size: buffer.length,
          prefixHex: buffer.subarray(0, 16).toString('hex')
        };
      });
    throw new Error(`${error.message}; exportCandidates=${JSON.stringify(candidates)}`);
  }
}

async function exportStatSlot(cdp, page, downloadRoot, slot) {
  const saveMenuOpen = await evaluate(cdp, page, '!!document.querySelector(".bottom-save-menu[open]")');
  if (!saveMenuOpen) {
    await clickSelector(cdp, page, '.bottom-save-menu > summary');
    await waitForSelector(cdp, page, '.bottom-save-popover');
  }
  await clickSelector(cdp, page, '#export-state');
  await waitForSelector(cdp, page, `.state-slot-list button[data-state-slot="${slot}"]`);
  await waitFor(async () => evaluate(cdp, page, `(() => {
    const button = document.querySelector('.state-slot-list button[data-state-slot="${slot}"]');
    return !!button && !button.disabled;
  })()`));
  const previousFiles = snapshotDownloadedFiles(downloadRoot);
  await clickSelector(cdp, page, `.state-slot-list button[data-state-slot="${slot}"]`);
  await waitFor(async () => {
    const status = await readText(cdp, page, '#state-status');
    if (status.includes('書き出しました')) return true;
    if (status.includes('未保存')) throw new Error(`slot${slot} export status: ${status}`);
    return false;
  }, { timeoutMs: 5000 });
  return readStatExport(downloadRoot, previousFiles);
}

async function checkStatApplication(cdp, page, downloadRoot) {
  const dialogLog = [];
  const diagnostics = { exceptions: [], console: [], dialogErrors: [] };
  let dialogHandledByCommand = false;
  installPageDiagnostics(cdp, page, diagnostics);
  await installDialogAutoAccept(cdp, page, dialogLog, diagnostics);
  await runStage('stat起動', () => waitFor(async () => evaluate(cdp, page, `(() => {
    const select = document.querySelector('#apostle-select');
    return !!select && select.options.length > 0;
  })()`), { timeoutMs: 30000 }));
  await runStage('stat保存メニュー', async () => {
    await clickSelector(cdp, page, '.bottom-save-menu > summary');
    await waitForSelector(cdp, page, '.bottom-save-popover');
    await clickSelector(cdp, page, '#save-state-slot');
    await waitForSelector(cdp, page, '.state-slot-list button[data-state-slot="1"]');
    await clickSelector(cdp, page, '.state-slot-list button[data-state-slot="1"]');
    await waitForText(cdp, page, '#state-status', text => text.includes('保存しました'));
  });
  const savedActiveId = await readValue(cdp, page, '#apostle-select');
  const savedSlotLabel = await readText(cdp, page, '#state-current-slot');
  const draftId = await runStage('stat未保存draft', () => chooseStatDraftApostle(cdp, page, savedActiveId));
  await waitForText(cdp, page, '#state-current-slot', text => text.includes('編集中'));
  const exportedSlot1 = await runStage('stat実export', () => exportStatSlot(cdp, page, downloadRoot, 1));
  assert.equal(exportedSlot1.payload.sourceSlot, 1);
  assert.equal(exportedSlot1.payload.snapshot.activeId, savedActiveId);
  assert.notEqual(exportedSlot1.payload.snapshot.activeId, draftId);

  await runStage('stat実import投入', async () => {
    await cdp.send('Page.setInterceptFileChooserDialog', { enabled: true }, page.sessionId);
    const menuOpen = await evaluate(cdp, page, '!!document.querySelector(".bottom-save-menu[open]")');
    if (!menuOpen) {
      await runStage('保存メニュー再表示', () => clickSelector(cdp, page, '.bottom-save-menu > summary'));
      await waitForSelector(cdp, page, '.bottom-save-popover');
    }
    await runStage('importボタン', () => clickSelector(cdp, page, '#import-state'));
    await runStage('import file input投入', () => setFileInputWithoutWaiting(cdp, page, '#import-state-file', exportedSlot1.path));
    await runStage('インポート先表示', () => waitForText(cdp, page, '#state-status', text => text.includes('インポート先')));
    const slot2Click = await runStage('インポートslot2クリック', () => clickSelector(cdp, page, '.state-slot-list button[data-state-slot="2"]'));
    dialogHandledByCommand = await acceptPendingDialog(cdp, page);
    try {
      await waitForText(cdp, page, '#state-status', text => text.includes('スロット2にインポートしました'), { timeoutMs: 30000 });
    } catch (error) {
      const debug = await evaluate(cdp, page, `(() => {
        const describe = element => {
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          const hit = rect.width > 0 && rect.height > 0
            ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
            : null;
          return {
            disabled: !!element.disabled,
            text: element.innerText || element.textContent || '',
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            display: style.display,
            visibility: style.visibility,
            hit: hit ? { tagName: hit.tagName, id: hit.id || '', className: String(hit.className || '') } : null
          };
        };
        return {
        status: document.querySelector('#state-status')?.textContent || '',
        currentSlot: document.querySelector('#state-current-slot')?.textContent || '',
        activeId: document.querySelector('#apostle-select')?.value || '',
        slotMode: document.querySelector('.bottom-save-popover')?.dataset.slotMode || '',
        readyState: document.readyState,
        activeElement: document.activeElement?.outerHTML?.slice(0, 500) || '',
        slot2: describe(document.querySelector('.state-slot-list button[data-state-slot="2"]')),
        slot2Click,
        diagnostics
        };
      })()`);
      throw new Error(`${error.message}; importDebug=${JSON.stringify(debug)}; dialogs=${JSON.stringify(dialogLog)}`);
    }
  });
  const importedActiveId = await readValue(cdp, page, '#apostle-select');
  const importedSlotLabel = await readText(cdp, page, '#state-current-slot');
  assert.equal(importedActiveId, savedActiveId);
  assert.match(importedSlotLabel, /2/);

  const exportedSlot1AfterImport = await runStage('stat別slot維持確認', () => exportStatSlot(cdp, page, downloadRoot, 1));
  assert.deepEqual(exportedSlot1AfterImport.payload.snapshot, exportedSlot1.payload.snapshot);
  assert.ok(dialogLog.some(entry => entry.type === 'confirm') || dialogHandledByCommand, 'import確認ダイアログを観測できません');
  return {
    savedActiveId,
    savedSlotLabel,
    draftId,
    exportedFile: path.basename(exportedSlot1.path),
    exportedSchema: exportedSlot1.payload.schema,
    importedActiveId,
    importedSlotLabel,
    otherSlotUnchanged: true,
    dialogs: dialogLog,
    dialogHandledByCommand,
    diagnostics
  };
}

async function checkStatBackup(cdp, page, downloadRoot) {
  await activatePage(cdp, page);
  const menuOpen = await evaluate(cdp, page, '!!document.querySelector(".bottom-save-menu[open]")');
  if (!menuOpen) {
    await clickSelector(cdp, page, '.bottom-save-menu > summary');
    await waitForSelector(cdp, page, '.bottom-save-popover');
  }
  const previousFiles = snapshotDownloadedFiles(downloadRoot);
  await runStage('全体バックアップ保存', () => clickSelector(cdp, page, '#backup-export'));
  await waitForText(cdp, page, '#backup-status', text => text.includes('バックアップを保存しました'), { timeoutMs: 30000 });
  const downloadedPath = await waitForNewDownload(downloadRoot, previousFiles);
  const packageValue = JSON.parse(fs.readFileSync(downloadedPath, 'utf8'));
  assert.equal(packageValue.format, 'trickcal-manager-backup');
  assert.equal(packageValue.version, 1);
  assert.equal(
    crypto.createHash('sha256').update(Buffer.from(packageValue.payloadJson, 'utf8')).digest('hex'),
    packageValue.sha256
  );
  const payload = JSON.parse(packageValue.payloadJson);
  assert.equal(payload.schemaSet, 1);
  assert.equal(payload.sourceMode, 'current-tab');
  assert.equal(Object.keys(payload.datasets).length, 12);

  // ダウンロード後にブラウザがdetailsを閉じる場合があるため、
  // 次の実file input操作の前に既存の保存メニューを再確認する。
  const menuAfterExport = await evaluate(cdp, page, '!!document.querySelector(".bottom-save-menu[open]")');
  if (!menuAfterExport) {
    await clickSelector(cdp, page, '.bottom-save-menu > summary');
    await waitForSelector(cdp, page, '.bottom-save-popover');
  }

  const storageKeys = [
    'trickcal_stat_slots_v2',
    'trickcal_stat_prototype_v1',
    'trickcal_stat_live_v2',
    'trickcal_formation_damage_settings_v1',
    'trickcal_formation_damage_result_saves_v1',
    'trickcal_formation_damage_enemy_presets_v1',
    'trickcal:dps-settings:v1',
    'trickcal:dps-runtime-effect-overrides:v1',
    'trickcal_theme',
    'trickcal_stat_theme',
    'trickcal_damage_calc_theme',
    'trickcal-board-preview-theme',
    'trickcal_board_shortcut_off_mode',
    'trickcal_board_orientation',
    'trickcal-board-preview-scale',
    'trickcal_share_global_enhancement_sources_v2',
    'trickcal_storage_journal_v1',
    'trickcal_stat_workspace_v2'
  ];
  const readBackupStorage = () => evaluate(cdp, page, `(() => {
    const keys = ${JSON.stringify(storageKeys)};
    const read = storage => Object.fromEntries(keys.map(key => [key, storage.getItem(key)]));
    return { local: read(localStorage), session: read(sessionStorage) };
  })()`);
  const beforePreview = await waitForQuiescentValue(readBackupStorage);

  // Chromeのfile chooserを開くclickは、実ブラウザのblur/focus境界で
  // 本番のlive mirror flushを発生させる。これはstorageAppLifecycleで別に
  // 確認するため、preview不変性では実file inputへの投入だけを観測する。
  await runStage('全体バックアップfile input投入', () => setFileInputWithoutWaiting(cdp, page, '#backup-import-file', downloadedPath));
  await waitForText(cdp, page, '#backup-status', text => text.includes('内容を確認しました'), { timeoutMs: 30000 });
  const preview = await waitFor(async () => evaluate(cdp, page, `(() => {
    const element = document.querySelector('#backup-preview');
    return element && !element.hidden ? {
      summary: document.querySelector('#backup-preview-summary')?.textContent || '',
      datasets: document.querySelectorAll('#backup-preview-datasets li').length
    } : null;
  })()`));
  assert.equal(preview.datasets, 12);
  const afterPreview = await waitForQuiescentValue(readBackupStorage);
  assert.deepEqual(afterPreview, beforePreview, '確認だけで保存データが変更されました');

  await runStage('全体バックアップ確認取消', () => clickSelector(cdp, page, '#backup-cancel'));
  await waitForText(cdp, page, '#backup-status', text => text.includes('変更されていません'), { timeoutMs: 5000 });
  const cancelled = await evaluate(cdp, page, `(() => ({
    hidden: !!document.querySelector('#backup-preview')?.hidden,
    status: document.querySelector('#backup-status')?.textContent || ''
  }))()`);
  assert.equal(cancelled.hidden, true);
  const afterCancel = await evaluate(cdp, page, `(() => {
    const keys = ${JSON.stringify(storageKeys)};
    const read = storage => Object.fromEntries(keys.map(key => [key, storage.getItem(key)]));
    return { local: read(localStorage), session: read(sessionStorage) };
  })()`);
  assert.deepEqual(afterCancel, beforePreview, '確認取消で保存データが変更されました');

  const rescuePreviousFiles = snapshotDownloadedFiles(downloadRoot);
  await runStage('救出ファイル保存', () => clickSelector(cdp, page, '#backup-rescue'));
  await waitForText(cdp, page, '#backup-status', text => text.includes('救出ファイルを保存しました'), { timeoutMs: 30000 });
  const rescuePath = await waitForNewDownload(downloadRoot, rescuePreviousFiles);
  const rescueOuter = JSON.parse(fs.readFileSync(rescuePath, 'utf8'));
  assert.equal(rescueOuter.format, storageBackup.rescueFormat);
  const rescueDecoded = await storageBackup.decodeRescuePackage(JSON.stringify(rescueOuter));
  assert.equal(rescueDecoded.ok, true, JSON.stringify(rescueDecoded));

  // restoreの対象外キーを一つだけ作り、allowlist復元で変更されないことを確認する。
  const unrelatedKey = 'native-restore-unrelated-key';
  await evaluate(cdp, page, `localStorage.setItem(${JSON.stringify(unrelatedKey)}, 'keep-native-unrelated')`);
  const readStorage = () => evaluate(cdp, page, `(() => {
    const keys = ${JSON.stringify(storageKeys)};
    const read = storage => Object.fromEntries(keys.map(key => [key, storage.getItem(key)]));
    return {
      local: { ...read(localStorage), [${JSON.stringify(unrelatedKey)}]: localStorage.getItem(${JSON.stringify(unrelatedKey)}) },
      session: read(sessionStorage)
    };
  })()`);
  const backupCurrentDataset = payload.datasets['stat.current'];
  const backupCurrent = backupCurrentDataset?.state === 'present'
    ? backupCurrentDataset.value
    : null;
  const backupSlotStore = payload.datasets['stat.slots']?.state === 'present'
    ? payload.datasets['stat.slots'].value
    : null;
  const expectedRestoredActiveId = backupCurrent?.snapshot?.activeId
    || Object.values(backupSlotStore?.slots || {})[0]?.snapshot?.activeId;
  assert.ok(expectedRestoredActiveId, 'バックアップから復元対象のactiveIdを取得できません');

  const mutatedId = await runStage('復元前の実UI変更', () => chooseStatDraftApostle(cdp, page, expectedRestoredActiveId));
  assert.notEqual(mutatedId, expectedRestoredActiveId);
  await waitForText(cdp, page, '#state-current-slot', text => text.includes('編集中'));
  // 「編集中」は保存slotとの差分を示すだけで、snapshot再計算の完了を
  // 示さない。復元確認の前に本番storageの静止を待ち、遅延した通常保存を
  // 取消判定へ混ぜない。
  await waitForQuiescentValue(readStorage);
  const beforeRestoreMutation = await readStorage();

  const reopenBackupMenu = async () => {
    const open = await evaluate(cdp, page, '!!document.querySelector(".bottom-save-menu[open]")');
    if (!open) {
      await clickSelector(cdp, page, '.bottom-save-menu > summary');
      await waitForSelector(cdp, page, '.bottom-save-popover');
    }
  };
  const inputBackupForRestore = async () => {
    await reopenBackupMenu();
    await setFileInputWithoutWaiting(cdp, page, '#backup-import-file', downloadedPath);
    await waitForText(cdp, page, '#backup-status', text => text.includes('内容を確認しました'), { timeoutMs: 30000 });
  };

  await inputBackupForRestore();
  await runStage('復元対象確認', () => clickSelector(cdp, page, '#backup-prepare-restore'));
  await waitForText(cdp, page, '#backup-status', text => text.includes('復元対象を確認しました'), { timeoutMs: 30000 });
  // maintenance開始時のfreeze/flushで保留中の通常保存が確定するため、
  // plan完了後にも静止を取り、取消そのものの差分だけを比較する。
  await waitForQuiescentValue(readStorage);
  const beforeRestoreCancel = await readStorage();
  await runStage('復元確認取消', () => clickSelector(cdp, page, '#backup-cancel'));
  await waitForText(cdp, page, '#backup-status', text => text.includes('保存データは変更されていません'), { timeoutMs: 10000 });
  const afterRestoreCancel = await readStorage();
  assertStorageDataUnchanged(beforeRestoreCancel, afterRestoreCancel, '復元確認取消で保存データが変更されました');
  assert.equal(await readValue(cdp, page, '#apostle-select'), mutatedId);

  await inputBackupForRestore();
  await runStage('復元対象再確認', () => clickSelector(cdp, page, '#backup-prepare-restore'));
  await waitForText(cdp, page, '#backup-status', text => text.includes('復元対象を確認しました'), { timeoutMs: 30000 });
  await runStage('復元適用', () => clickSelector(cdp, page, '#backup-apply-restore'));
  await waitForText(cdp, page, '#backup-status', text => text.includes('復元が完了しました'), { timeoutMs: 30000 });
  await waitForSelector(cdp, page, '#backup-reload');
  const beforeReload = await readStorage();
  assert.equal(await readValue(cdp, page, '#apostle-select'), mutatedId);
  assert.equal(beforeReload.local[unrelatedKey], 'keep-native-unrelated');
  assert.equal(await evaluate(cdp, page, 'localStorage.getItem("trickcal_storage_journal_v1")'), null);

  await runStage('復元後再読み込み', () => clickSelector(cdp, page, '#backup-reload'));
  await waitFor(async () => evaluate(cdp, page, `(() => {
    const select = document.querySelector('#apostle-select');
    return document.documentElement.dataset.storageBoot === 'ready'
      && !!select && select.options.length > 0 && select.value === ${JSON.stringify(expectedRestoredActiveId)};
  })()`), { timeoutMs: 30000 });
  const afterReload = await readStorage();
  assert.equal(await readValue(cdp, page, '#apostle-select'), expectedRestoredActiveId);
  assert.equal(afterReload.local[unrelatedKey], 'keep-native-unrelated');
  assert.equal(afterReload.local['trickcal_storage_journal_v1'], null);
  const restoredWorkspace = afterReload.session['trickcal_stat_workspace_v2'];
  assert.equal(JSON.parse(restoredWorkspace).draft.activeId, expectedRestoredActiveId);
  return {
    file: path.basename(downloadedPath),
    bytes: fs.statSync(downloadedPath).size,
    datasetCount: Object.keys(payload.datasets).length,
    preview,
    previewStorageUnchanged: true,
    cancelStorageUnchanged: true,
    rescueFile: path.basename(rescuePath),
    rescueFormat: rescueOuter.format,
    rescueEntryCount: rescueDecoded.value.payload.entries.length,
    restore: {
      mutatedId,
      restoredActiveId: expectedRestoredActiveId,
      cancelStorageUnchanged: true,
      applyCompleted: true,
      reloadRestored: true,
      unrelatedKeyUnchanged: true,
      journalRemoved: true,
      draftRestored: true,
      preRestoreMutationStorageCaptured: !!beforeRestoreMutation
    }
  };
}

async function checkStatBrowserQuota(cdp, page, backupPath) {
  const fillerKey = 'native-r4-3-quota-filler';
  const storageKeys = [
    'trickcal_stat_slots_v2',
    'trickcal_stat_prototype_v1',
    'trickcal_stat_live_v2',
    'trickcal_formation_damage_settings_v1',
    'trickcal_formation_damage_result_saves_v1',
    'trickcal_formation_damage_enemy_presets_v1',
    'trickcal:dps-settings:v1',
    'trickcal:dps-runtime-effect-overrides:v1',
    'trickcal_theme',
    'trickcal_stat_theme',
    'trickcal_damage_calc_theme',
    'trickcal-board-preview-theme',
    'trickcal_board_shortcut_off_mode',
    'trickcal_board_orientation',
    'trickcal-board-preview-scale',
    'trickcal_share_global_enhancement_sources_v2',
    'trickcal_storage_journal_v1',
    'trickcal_stat_workspace_v2'
  ];
  const readStorage = () => evaluate(cdp, page, `(() => {
    const keys = ${JSON.stringify(storageKeys)};
    const read = storage => Object.fromEntries(keys.map(key => [key, storage.getItem(key)]));
    return { local: read(localStorage), session: read(sessionStorage) };
  })()`);

  await activatePage(cdp, page);
  await waitForQuiescentValue(readStorage);
  let beforeApply = null;
  let fill = null;
  try {
    // テスト専用Originの一時キーだけを満たし、Chrome自身のquotaを発生させる。
    // アプリの保存関数やruntimeの失敗注入はここでは使わない。
    fill = await evaluate(cdp, page, `(() => {
      const key = ${JSON.stringify(fillerKey)};
      localStorage.removeItem(key);
      const chunk = 'x'.repeat(256 * 1024);
      const limit = 24 * 1024 * 1024;
      let value = '';
      let storedBytes = 0;
      let errorName = '';
      let errorCode = 0;
      try {
        while (value.length < limit) {
          const next = value + chunk;
          localStorage.setItem(key, next);
          value = next;
          storedBytes = value.length;
        }
      } catch (error) {
        errorName = String(error?.name || '');
        errorCode = Number(error?.code || 0);
      }
      return {
        key,
        storedBytes,
        errorName,
        errorCode,
        quota: errorName === 'QuotaExceededError' || errorCode === 22 || errorCode === 1014
      };
    })()`);
    assert.equal(fill.quota, true, `実ブラウザquotaを発生させられませんでした: ${JSON.stringify(fill)}`);

    const menuOpen = await evaluate(cdp, page, '!!document.querySelector(".bottom-save-menu[open]")');
    if (!menuOpen) {
      await clickSelector(cdp, page, '.bottom-save-menu > summary');
      await waitForSelector(cdp, page, '.bottom-save-popover');
    }
    await setFileInputWithoutWaiting(cdp, page, '#backup-import-file', backupPath);
    await waitForText(cdp, page, '#backup-status', text => text.includes('内容を確認しました'), { timeoutMs: 30000 });
    await runStage('quota復元対象確認', () => clickSelector(cdp, page, '#backup-prepare-restore'));
    await waitForText(cdp, page, '#backup-status', text => text.includes('復元対象を確認しました'), { timeoutMs: 30000 });
    // beginMaintenanceのfreeze/flushで発生する通常のpersistStateを、
    // quotaでapplyが停止した後の不変性比較へ混ぜない。
    await waitForQuiescentValue(readStorage);
    beforeApply = await readStorage();
    await runStage('quota復元適用', () => clickSelector(cdp, page, '#backup-apply-restore'));
    await waitForText(
      cdp,
      page,
      '#backup-status',
      text => text.includes('保存領域の上限に達しました') && text.includes('元の状態へ戻しました'),
      { timeoutMs: 30000 }
    );
    const after = await readStorage();
    assertStorageDataUnchanged(beforeApply, after, '実ブラウザquota失敗後に保存データが変化しました');
    assert.equal(after.local['trickcal_storage_journal_v1'], beforeApply.local['trickcal_storage_journal_v1']);
    assert.equal(await evaluate(cdp, page, 'localStorage.getItem("native-r4-3-quota-filler") !== null'), true);
    return {
      quotaTriggered: true,
      fillerBytes: fill.storedBytes,
      errorName: fill.errorName,
      status: await readText(cdp, page, '#backup-status'),
      storageUnchanged: true,
      journalUnchanged: true
    };
  } finally {
    await evaluate(cdp, page, `localStorage.removeItem(${JSON.stringify(fillerKey)})`);
  }
}

async function checkFreshTabAfterRestore(cdp, pageUrl) {
  const freshPage = await createPage(cdp, `${pageUrl}&freshRestoreTab=1`);
  try {
    await waitForStorageBoot(cdp, freshPage);
    const result = await waitFor(async () => evaluate(cdp, freshPage, `(() => ({
      boot: document.documentElement.dataset.storageBoot || '',
      errorPage: !!document.querySelector('.storage-boot-error'),
      activeId: document.querySelector('#apostle-select')?.value || '',
      marker: sessionStorage.getItem('trickcal_storage_session_epoch_v1') || '',
      workspace: sessionStorage.getItem('trickcal_stat_workspace_v2'),
      reloadContext: sessionStorage.getItem('trickcal_dashboard_reload_context_v1'),
      comparison: sessionStorage.getItem('trickcal_combat_comparison_session_v1')
    }))()`), { timeoutMs: 30000 });
    assert.equal(result.boot, 'ready');
    assert.equal(result.errorPage, false);
    assert.ok(result.activeId, '復元後の新規tabでstat画面が初期化されません');
    assert.ok(result.marker, '復元後の新規tabでsession markerが再構成されません');
    assert.equal(result.reloadContext, null);
    assert.equal(result.comparison, null);
    return {
      boot: result.boot,
      activeId: result.activeId,
      markerRebuilt: true,
      staleSessionCleared: result.workspace === null
        && result.reloadContext === null
        && result.comparison === null
    };
  } finally {
    try {
      await cdp.send('Target.closeTarget', { targetId: freshPage.targetId });
    } catch (_) {}
  }
}

async function calculateCurrentDps(cdp, page) {
  await waitForSelector(cdp, page, '#fdcp-dps-result');
  await waitFor(async () => evaluate(cdp, page, `(() => {
    const button = document.querySelector('#fdcp-dps-run');
    return !!button && !button.disabled;
  })()`), { timeoutMs: 30000 });
  await openDpsSettings(cdp, page);
  await waitForSelector(cdp, page, '#fdcp-dps-run');
  await clickSelector(cdp, page, '#fdcp-dps-run');
  return waitFor(async () => {
    const result = await evaluate(cdp, page, `({
      value: document.querySelector('#fdcp-dps-value')?.textContent?.trim() || '',
      state: document.querySelector('#fdcp-dps-state')?.textContent?.trim() || '',
      timeline: document.querySelector('#fdcp-dps-detail-grid')?.textContent?.includes('単一seed 行動タイムライン') || false
    })`);
    if (!result.value || /^(—|再計算必要|DPS未対応)$/.test(result.value)) return null;
    return result;
  }, { timeoutMs: 30000 });
}

async function saveAndReloadDamageCalculation(cdp, page) {
  const key = 'trickcal_formation_damage_result_saves_v1';
  await evaluate(cdp, page, `localStorage.removeItem(${JSON.stringify(key)})`);
  const menuOpen = await evaluate(cdp, page, '!!document.querySelector("#fdc-save-menu[open]")');
  if (!menuOpen) {
    await clickSelector(cdp, page, '#fdc-save-menu > summary');
    await waitForSelector(cdp, page, '#fdc-save-menu[open] .fdc-save-popover');
  }
  await clickSelector(cdp, page, '[data-fdc-save-action="save"]');
  await waitForSelector(cdp, page, '#fdc-save-list [data-fdc-save-id=""]');
  await clickSelector(cdp, page, '#fdc-save-list [data-fdc-save-id=""]');
  const saved = await waitFor(async () => evaluate(cdp, page, `(() => {
    try {
      const items = JSON.parse(localStorage.getItem(${JSON.stringify(key)}) || '[]');
      return Array.isArray(items) && items.length === 1 && items[0]?.snapshot?.version === 4
        ? { id: items[0].id, name: items[0].name, savedAt: items[0].savedAt, snapshotVersion: items[0].snapshot.version }
        : null;
    } catch (_) {
      return null;
    }
  })()`), { timeoutMs: 10000 });

  const afterSaveMenuOpen = await evaluate(cdp, page, '!!document.querySelector("#fdc-save-menu[open]")');
  if (!afterSaveMenuOpen) {
    await clickSelector(cdp, page, '#fdc-save-menu > summary');
    await waitForSelector(cdp, page, '#fdc-save-menu[open] .fdc-save-popover');
  }
  await clickSelector(cdp, page, '[data-fdc-save-action="load"]');
  await waitForSelector(cdp, page, '#fdc-save-list [data-fdc-save-id]');
  await clickSelector(cdp, page, `#fdc-save-list [data-fdc-save-id="${saved.id}"]`);
  await waitFor(async () => evaluate(cdp, page, '!!document.querySelector("#fdc-loaded-save-label:not([hidden])")'), { timeoutMs: 10000 });
  return saved;
}

async function checkDpsApplication(cdp, page) {
  const dialogLog = [];
  const diagnostics = { exceptions: [], console: [], dialogErrors: [] };
  installPageDiagnostics(cdp, page, diagnostics);
  await installDialogAutoAccept(cdp, page, dialogLog, diagnostics);
  await runStage('DPS起動', () => waitForSelector(cdp, page, '#fdc-target-preview', { timeoutMs: 30000 }));
  const targetMomo = await runStage('DPS対象A選択', () => chooseFormationTarget(cdp, page, 'Momo'));
  const firstCalculation = await runStage('DPS初回計算', () => enterDpsModeAndCalculate(cdp, page));
  const savedCalculation = await runStage('保存計算結果の保存・読込', () => saveAndReloadDamageCalculation(cdp, page));
  await openDpsSettings(cdp, page);
  await selectValue(cdp, page, '#fdcp-duration', '30');
  await selectValue(cdp, page, '#fdcp-high-mode', 'auto');
  const momoSettings = {
    duration: await readValue(cdp, page, '#fdcp-duration'),
    highMode: await readValue(cdp, page, '#fdcp-high-mode')
  };
  assert.deepEqual(momoSettings, { duration: '30', highMode: 'auto' });

  const targetSylla = await chooseFormationTarget(cdp, page, 'Sylla');
  await sleep(500);
  await waitFor(async () => evaluate(cdp, page, 'document.body.dataset.fdcpMode === "dps" || document.body.dataset.fdcpMode === "single"'));
  if (await evaluate(cdp, page, 'document.body.dataset.fdcpMode !== "dps"')) {
    await enterDpsModeAndCalculate(cdp, page);
  } else {
    await calculateCurrentDps(cdp, page);
  }
  await openDpsSettings(cdp, page);
  const syllaSettings = {
    duration: await readValue(cdp, page, '#fdcp-duration'),
    highMode: await readValue(cdp, page, '#fdcp-high-mode')
  };
  assert.deepEqual(syllaSettings, { duration: '90', highMode: 'disabled' });
  await selectValue(cdp, page, '#fdcp-duration', '60');
  const syllaStoredSettings = {
    duration: await readValue(cdp, page, '#fdcp-duration'),
    highMode: await readValue(cdp, page, '#fdcp-high-mode')
  };

  const targetMomoAgain = await chooseFormationTarget(cdp, page, 'Momo');
  await sleep(500);
  await waitFor(async () => evaluate(cdp, page, 'document.body.dataset.fdcpMode === "dps" || document.body.dataset.fdcpMode === "single"'));
  if (await evaluate(cdp, page, 'document.body.dataset.fdcpMode !== "dps"')) {
    await enterDpsModeAndCalculate(cdp, page);
  } else {
    await calculateCurrentDps(cdp, page);
  }
  await openDpsSettings(cdp, page);
  const momoRestoredBeforeReload = {
    duration: await readValue(cdp, page, '#fdcp-duration'),
    highMode: await readValue(cdp, page, '#fdcp-high-mode')
  };
  assert.deepEqual(momoRestoredBeforeReload, momoSettings);

  await reloadPage(cdp, page);
  await waitForSelector(cdp, page, '#fdc-target-preview');
  await waitFor(async () => {
    const preview = await evaluate(cdp, page, `(() => {
      const element = document.querySelector('#fdc-target-preview');
      const image = element?.querySelector('img');
      return ((element?.title || '') + ' ' + (image?.src || '')).toLowerCase();
    })()`);
    return preview.includes('momo');
  }, { timeoutMs: 30000 });
  await sleep(500);
  await waitFor(async () => evaluate(cdp, page, 'document.body.dataset.fdcpMode === "dps" || document.body.dataset.fdcpMode === "single"'));
  if (await evaluate(cdp, page, 'document.body.dataset.fdcpMode !== "dps"')) {
    await enterDpsModeAndCalculate(cdp, page);
  }
  await openDpsSettings(cdp, page);
  const momoRestoredAfterReload = {
    duration: await readValue(cdp, page, '#fdcp-duration'),
    highMode: await readValue(cdp, page, '#fdcp-high-mode')
  };
  assert.deepEqual(momoRestoredAfterReload, momoSettings);
  return {
    targetSequence: [targetMomo, targetSylla, targetMomoAgain],
    firstCalculation,
    savedCalculation,
    momoSettings,
    syllaSettings,
    syllaStoredSettings,
    momoRestoredBeforeReload,
    momoRestoredAfterReload,
    dialogs: dialogLog,
    diagnostics
  };
}

async function evaluate(cdp, page, expression) {
  const response = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  }, page.sessionId);
  if (response.exceptionDetails) {
    const description = response.exceptionDetails.exception?.description
      || response.exceptionDetails.text
      || 'Runtime.evaluate failed';
    throw new Error(description);
  }
  return response.result?.value;
}

async function clickSelector(cdp, page, selector) {
  const selectorLiteral = JSON.stringify(selector);
  const initial = await evaluate(cdp, page, `(() => {
    const element = document.querySelector(${selectorLiteral});
    if (!element) return null;
    if ('disabled' in element && element.disabled) return null;
    element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    return true;
  })()`);
  if (!initial) throw new Error(`Element not found or disabled: ${selector}`);
  await sleep(50);
  const rect = await evaluate(cdp, page, `(() => {
    const element = document.querySelector(${selectorLiteral});
    if (!element) return null;
    const box = element.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const hit = document.elementFromPoint(x, y);
    return {
      x, y,
      width: box.width,
      height: box.height,
      hit: hit ? { tagName: hit.tagName, id: hit.id || '', className: String(hit.className || '') } : null,
      targetMatches: !!hit && (hit === element || element.contains(hit))
    };
  })()`);
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    const details = await evaluate(cdp, page, `(() => {
      const element = document.querySelector(${selectorLiteral});
      const chain = [];
      let current = element;
      while (current && current.nodeType === Node.ELEMENT_NODE && chain.length < 8) {
        const box = current.getBoundingClientRect();
        const style = getComputedStyle(current);
        chain.push({
          tagName: current.tagName,
          id: current.id || '',
          className: String(current.className || ''),
          hidden: !!current.hidden,
          display: style.display,
          visibility: style.visibility,
          rect: { x: box.x, y: box.y, width: box.width, height: box.height }
        });
        current = current.parentElement;
      }
      return { element: !!element, chain };
    })()`);
    throw new Error(`Element has no clickable box: ${selector}; details=${JSON.stringify(details)}`);
  }
  if (!rect.targetMatches) {
    throw new Error(`Element is covered at ${rect.x},${rect.y}: ${JSON.stringify(rect.hit)}`);
  }
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved', x: rect.x, y: rect.y, button: 'none'
  }, page.sessionId);
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1, buttons: 1
  }, page.sessionId);
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: rect.x, y: rect.y, button: 'left', clickCount: 1, buttons: 0
  }, page.sessionId);
  return rect;
}

async function setFileInput(cdp, page, selector, filePath) {
  const selectorLiteral = JSON.stringify(selector);
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 }, page.sessionId);
  const { nodeId } = await cdp.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector
  }, page.sessionId);
  assert.ok(nodeId, `Element not found: ${selector}`);
  await cdp.send('DOM.setFileInputFiles', {
    nodeId,
    files: [filePath]
  }, page.sessionId);
  await waitFor(async () => {
    const status = await evaluate(cdp, page, `document.querySelector(${selectorLiteral})?.parentElement?.innerText || ''`);
    return status.includes('ok:');
  });
}

async function readText(cdp, page, selector) {
  const literal = JSON.stringify(selector);
  return evaluate(cdp, page, `document.querySelector(${literal})?.textContent || ''`);
}

function startChild(command, args, cwd) {
  return spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
}

async function run() {
  const serverPort = await findFreePort();
  const cdpPort = await findFreePort([serverPort]);
  const childDiagnostics = { server: { errors: [], exits: [], stderr: [] }, chrome: { errors: [], exits: [], stderr: [] } };
  let server = null;
  let chrome = null;
  let profileRoot = null;
  let downloadRoot = null;
  let chromePath = null;
  let cdp = null;
  let page = null;
  let secondPage = null;
  let statPage = null;
  let statLockPage = null;
  let dpsPage = null;
  const checks = {};
  const runId = `native-${Date.now().toString(36)}`;
  const probeUrl = `http://127.0.0.1:${serverPort}${PROBE_PATH}?run=${runId}`;

  async function capture(name, callback) {
    try {
      checks[name] = { ok: true, ...(await callback()) };
    } catch (error) {
      checks[name] = { ok: false, error: error.message };
    }
  }

  try {
    server = startChild(process.execPath, [SERVER_SCRIPT, String(serverPort)], ROOT);
    server.on('error', error => childDiagnostics.server.errors.push(error.message));
    server.on('exit', (code, signal) => childDiagnostics.server.exits.push({ code, signal }));
    server.stderr.on('data', chunk => childDiagnostics.server.stderr.push(String(chunk)));
    profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-storage-native-'));
    downloadRoot = path.join(profileRoot, 'downloads');
    fs.mkdirSync(downloadRoot);
    chromePath = findChrome();
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
    ], ROOT);
    chrome.on('error', error => childDiagnostics.chrome.errors.push(error.message));
    chrome.on('exit', (code, signal) => childDiagnostics.chrome.exits.push({ code, signal }));
    chrome.stderr.on('data', chunk => childDiagnostics.chrome.stderr.push(String(chunk)));
    const serverUrl = `http://127.0.0.1:${serverPort}${PROBE_PATH}`;
    try {
      await waitForHttp(serverUrl);
    } catch (error) {
      throw new Error(`HTTP server unavailable at ${serverUrl}: ${error.message}; diagnostics=${JSON.stringify(childDiagnostics.server)}`);
    }
    let version;
    try {
      version = await waitFor(async () => {
        const response = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
        return response.ok ? response.json() : null;
      });
    } catch (error) {
      throw new Error(
        `Chrome CDP unavailable at http://127.0.0.1:${cdpPort}: ${error.message}; `
        + `diagnostics=${JSON.stringify(childDiagnostics.chrome)}`
      );
    }
    cdp = new CdpClient(version.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadRoot
    });
    page = await createPage(cdp, probeUrl);

    await capture('page', async () => ({
      title: await evaluate(cdp, page, 'document.title'),
      readyState: await evaluate(cdp, page, 'document.readyState'),
      probeVisible: await evaluate(cdp, page, '!!document.querySelector("#value")')
    }));

    await capture('dom', async () => {
      await activatePage(cdp, page);
      await clickSelector(cdp, page, '#write');
      await waitFor(async () => (await readText(cdp, page, '#value')) === '1');
      return { value: await readText(cdp, page, '#value') };
    });

    await capture('jsonFile', async () => {
      await activatePage(cdp, page);
      await setFileInput(cdp, page, '#json-file', IMPORT_FIXTURE);
      return { status: await readText(cdp, page, '#json-file-status') };
    });

    await capture('download', async () => {
      await activatePage(cdp, page);
      await clickSelector(cdp, page, '#download-json');
      const downloadedPath = await waitFor(() => {
        const files = fs.readdirSync(downloadRoot)
          .filter(name => !name.endsWith('.crdownload'));
        return files.length ? path.join(downloadRoot, files[0]) : null;
      });
      const payload = JSON.parse(fs.readFileSync(downloadedPath, 'utf8'));
      return {
        file: path.basename(downloadedPath),
        payload,
        pageStatus: await readText(cdp, page, '#download-status')
      };
    });

    await capture('storageEvent', async () => {
      secondPage = await createPage(cdp, probeUrl);
      const firstValue = await readText(cdp, page, '#value');
      const secondInitialValue = await readText(cdp, secondPage, '#value');
      await activatePage(cdp, secondPage);
      await clickSelector(cdp, secondPage, '#write');
      await waitFor(async () => (await readText(cdp, page, '#value')) === '2');
      const firstLog = await readText(cdp, page, '#log');
      assert.match(firstLog, /storage:applied:2/);
      return {
        firstValueBefore: firstValue,
        secondInitialValue,
        firstValueAfter: await readText(cdp, page, '#value'),
        storageApplied: firstLog.includes('storage:applied:2')
      };
    });

    await capture('focusVisibility', async () => {
      assert.ok(secondPage, 'storageEvent did not create the second page');
      await activatePage(cdp, page);
      await sleep(300);
      const initial = await evaluate(cdp, page, '({ visibility: document.visibilityState, focus: document.hasFocus() })');
      await activatePage(cdp, secondPage);
      await sleep(500);
      const background = await evaluate(cdp, page, '({ visibility: document.visibilityState, focus: document.hasFocus() })');
      await activatePage(cdp, page);
      await sleep(500);
      const restored = await evaluate(cdp, page, '({ visibility: document.visibilityState, focus: document.hasFocus() })');
      const log = await readText(cdp, page, '#log');
      assert.equal(initial.visibility, 'visible');
      assert.equal(initial.focus, true);
      assert.equal(background.visibility, 'hidden');
      assert.equal(background.focus, false);
      assert.equal(restored.visibility, 'visible');
      assert.equal(restored.focus, true);
      assert.match(log, /blur/);
      assert.match(log, /visibility:hidden/);
      assert.match(log, /focus/);
      return { initial, background, restored, log };
    });

    await capture('statApplication', async () => {
      statPage = await createPage(cdp, `http://127.0.0.1:${serverPort}${STAT_PATH}`);
      await activatePage(cdp, statPage);
      return checkStatApplication(cdp, statPage, downloadRoot);
    });

    // slot import直後のページには、変更したsnapshotを処理する非同期更新が
    // 残ることがある。backupのpreview不変判定へ持ち込まないため、import確認と
    // backup/restore確認を別の本番ページ・別runtimeで分離する。
    await capture('statRuntimeLocks', async () => {
      // 新しいtabは、復元後のrestoreSerialとsession markerの組合せでは
      // staleになるため、Lock検査は通常起動直後の本番runtimeで行う。
      if (!statPage) {
        statPage = await createPage(cdp, `http://127.0.0.1:${serverPort}${STAT_PATH}&lockPrimary=1`);
        await activatePage(cdp, statPage);
      }
      statLockPage = await createPage(cdp, `http://127.0.0.1:${serverPort}${STAT_PATH}&lockCheck=1`);
      const result = await checkStorageRuntimeLocks(
        cdp,
        statPage,
        statLockPage,
        checks.statApplication?.diagnostics || null
      );
      statLockPage = null;
      return result;
    });

    await capture('storageAppLifecycle', async () => checkStorageAppLifecycle(
      cdp,
      `http://127.0.0.1:${serverPort}${STAT_PATH}`,
      probeUrl
    ));

    await capture('dpsApplication', async () => {
      dpsPage = await createPage(cdp, `http://127.0.0.1:${serverPort}${DAMAGE_PATH}`);
      await activatePage(cdp, dpsPage);
      return checkDpsApplication(cdp, dpsPage);
    });

    // DPSページ自身がshared lockを保持するため、restore前に閉じる。
    if (dpsPage && cdp) {
      await cdp.send('Target.closeTarget', { targetId: dpsPage.targetId });
      dpsPage = null;
    }

    // 通常runtimeを閉じてから、restoreによるepoch変更を独立した
    // 本番ページで検証する。
    if (statPage && cdp) {
      await cdp.send('Target.closeTarget', { targetId: statPage.targetId });
      statPage = null;
      await sleep(500);
    }

    await capture('statBackup', async () => {
      statPage = await createPage(cdp, `http://127.0.0.1:${serverPort}${STAT_PATH}&backup=1`);
      await activatePage(cdp, statPage);
      return checkStatBackup(cdp, statPage, downloadRoot);
    });

    await capture('statBrowserQuota', async () => {
      assert.ok(checks.statBackup?.ok, 'stat backupが成功していないためquota検査を開始できません');
      assert.ok(checks.statBackup.file, 'quota検査用のbackup fileがありません');
      return checkStatBrowserQuota(
        cdp,
        statPage,
        path.join(downloadRoot, checks.statBackup.file)
      );
    });

    await capture('storageFreshTabAfterRestore', async () => {
      assert.ok(checks.statBackup?.ok, 'stat復元が成功していないため新規tab検査を開始できません');
      return checkFreshTabAfterRestore(
        cdp,
        `http://127.0.0.1:${serverPort}${STAT_PATH}`
      );
    });

    // restore後のstatページはshared lockを保持するため、起動ガードを
    // recovery-required状態として検査する前に閉じる。復元処理の成否と
    // ロック競合を混同させないためのnative検査境界。
    if (statPage && cdp) {
      await cdp.send('Target.closeTarget', { targetId: statPage.targetId });
      statPage = null;
      await sleep(500);
    }

    await capture('standaloneRescue', async () => checkStandaloneRescue(
      cdp,
      `http://127.0.0.1:${serverPort}${RECOVERY_PATH}`,
      downloadRoot
    ));

    await capture('storageBootGuard', async () => checkStorageBootGuard(
      cdp,
      `http://127.0.0.1:${serverPort}${STAT_PATH}&bootGuard=1`
    ));

    const failed = Object.entries(checks).filter(([, result]) => !result.ok);
    const report = {
      ok: failed.length === 0,
      browser: chromePath,
      isolatedProfile: true,
      serverPort,
      cdpPort,
      probeUrl,
      checks
    };
    if (process.argv.includes('--summary')) {
      const summary = {
        ok: report.ok,
        isolatedProfile: report.isolatedProfile,
        checks: Object.fromEntries(Object.entries(checks).map(([name, result]) => [name, {
          ok: result.ok,
          error: result.ok ? undefined : result.error,
          ...(name === 'statBackup' && result.ok ? {
            previewStorageUnchanged: result.previewStorageUnchanged,
            cancelStorageUnchanged: result.cancelStorageUnchanged,
            rescueFormat: result.rescueFormat,
            restore: result.restore
          } : {}),
          ...(name === 'statBrowserQuota' && result.ok ? {
            quotaTriggered: result.quotaTriggered,
            fillerBytes: result.fillerBytes,
            errorName: result.errorName,
            storageUnchanged: result.storageUnchanged,
            journalUnchanged: result.journalUnchanged
          } : {}),
          ...(name === 'dpsApplication' && result.ok ? {
            targetSequence: result.targetSequence?.map(item => item.name),
            momoRestoredAfterReload: result.momoRestoredAfterReload,
            savedCalculation: result.savedCalculation
          } : {}),
          ...(name === 'standaloneRescue' && result.ok ? {
            rescueFile: result.rescueFile,
            rescueFormat: result.rescueFormat,
            rescueEntryCount: result.rescueEntryCount,
            brokenJournalPreserved: result.brokenJournalPreserved,
            storageUnchanged: result.storageUnchanged,
            normalBootCalled: result.normalBootCalled
          } : {})
        }]))
      };
      process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    } else {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    }
    process.exitCode = report.ok ? 0 : 1;
  } finally {
    try {
      if (dpsPage && cdp) await cdp.send('Target.closeTarget', { targetId: dpsPage.targetId });
    } catch (_) {}
    try {
      if (statLockPage && cdp) await cdp.send('Target.closeTarget', { targetId: statLockPage.targetId });
    } catch (_) {}
    try {
      if (statPage && cdp) await cdp.send('Target.closeTarget', { targetId: statPage.targetId });
    } catch (_) {}
    try {
      if (secondPage && cdp) await cdp.send('Target.closeTarget', { targetId: secondPage.targetId });
    } catch (_) {}
    try {
      if (page && cdp) await cdp.send('Target.closeTarget', { targetId: page.targetId });
    } catch (_) {}
    try {
      if (cdp) await cdp.send('Browser.close');
    } catch (_) {}
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    if (server && server.exitCode === null && !server.killed) server.kill();
    await sleep(250);
    try {
      if (profileRoot) {
        fs.rmSync(profileRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      }
    } catch (_) {}
  }
}

if (require.main === module) {
  run().catch(error => {
    process.stderr.write(`${error.stack || error}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  CdpClient,
  createPage,
  activatePage,
  waitFor,
  waitForHttp,
  findFreePort,
  findChrome,
  startChild,
  evaluate,
  clickSelector,
  waitForSelector,
  waitForText,
  setFileInputWithoutWaiting,
  snapshotDownloadedFiles,
  waitForNewDownload,
  readText,
  readValue,
  sleep
};
