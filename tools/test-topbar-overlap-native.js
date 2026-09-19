#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const browser = require('./storage-native-browser-check.js');

const ROOT = path.resolve(__dirname, '..');
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function startServer(port) {
  return http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    const relative = pathname.replace(/^\/+/, '') || 'index.html';
    let file = path.resolve(ROOT, relative);
    const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : `${ROOT}${path.sep}`;
    if (file.startsWith(rootPrefix) && fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, 'index.html');
    }
    if (file !== ROOT && !file.startsWith(rootPrefix)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(fs.readFileSync(file));
  }).listen(port, '127.0.0.1');
}

async function launchChrome(cdpPort, profileRoot) {
  const chrome = browser.startChild(browser.findChrome(), [
    `--user-data-dir=${profileRoot}`,
    `--remote-debugging-port=${cdpPort}`,
    '--remote-debugging-address=127.0.0.1',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-sync',
    '--disable-extensions',
    '--disable-background-networking',
    '--window-size=1280,900',
    '--new-window',
    'about:blank'
  ], ROOT);
  const version = await browser.waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
    return response.ok ? response.json() : null;
  }, { timeoutMs: 30000 });
  const cdp = new browser.CdpClient(version.webSocketDebuggerUrl);
  await cdp.connect();
  return { chrome, cdp };
}

async function setViewport(cdp, page, width, height) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false
  }, page.sessionId);
  await browser.waitFor(async () => (await browser.evaluate(cdp, page, 'innerWidth')) === width, { timeoutMs: 5000 });
}

async function openCalc(cdp, origin, width, height) {
  const page = await browser.createPage(cdp, 'about:blank');
  await cdp.send('Page.enable', {}, page.sessionId);
  await setViewport(cdp, page, width, height);
  await cdp.send('Page.navigate', { url: `${origin}/formation-damage-calc.html?topbarOverlapNative=1` }, page.sessionId);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() =>
    document.documentElement.dataset.storageBoot === 'ready'
      && document.querySelectorAll('[data-topbar-operation]').length === 8
      && !!document.querySelector('#fdc-perspective-toggle')
  )()`), { timeoutMs: 30000 });
  await browser.evaluate(cdp, page, `document.querySelector('#trickcal-announcements-dialog')?.close()`);
  await browser.evaluate(cdp, page, 'window.scrollTo(0, document.documentElement.scrollHeight)');
  await browser.waitFor(async () => browser.evaluate(cdp, page, 'window.scrollY > 180'), { timeoutMs: 5000 });
  return page;
}

async function readOverlap(cdp, page, menuKey) {
  return browser.evaluate(cdp, page, `(() => {
    const rect = element => {
      if (!element) return null;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (box.width <= 0 || box.height <= 0 || style.display === 'none' || style.visibility === 'hidden') return null;
      return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
    };
    const menu = document.querySelector('[data-topbar-menu="${menuKey}"]');
    const items = [...document.querySelectorAll('[data-topbar-menu="${menuKey}"] [data-topbar-menu-item="${menuKey}"]')]
      .map((element, index) => ({ element, index, rect: rect(element), label: element.textContent.trim() }))
      .filter(item => item.rect);
    const floats = ['.fdc-perspective-toggle', '.fdc-floating-target', '.fdc-apply-float-controller', '.fdc-mobile-side-switch']
      .map(selector => ({ selector, element: document.querySelector(selector), rect: rect(document.querySelector(selector)) }))
      .filter(item => item.rect);
    const candidates = [];
    for (const item of items) {
      for (const target of floats) {
        const x1 = Math.max(item.rect.left, target.rect.left);
        const y1 = Math.max(item.rect.top, target.rect.top);
        const x2 = Math.min(item.rect.right, target.rect.right);
        const y2 = Math.min(item.rect.bottom, target.rect.bottom);
        if (x2 <= x1 || y2 <= y1) continue;
        const x = (x1 + x2) / 2;
        const y = (y1 + y2) / 2;
        const hit = document.elementFromPoint(x, y);
        candidates.push({
          itemIndex: item.index,
          label: item.label,
          floatSelector: target.selector,
          overlap: { left: x1, top: y1, right: x2, bottom: y2, area: (x2 - x1) * (y2 - y1) },
          point: { x, y },
          hit: hit ? { tag: hit.tagName, id: hit.id || '', className: String(hit.className || '') } : null,
          menuHit: !!hit && (hit === item.element || item.element.contains(hit))
        });
      }
    }
    return {
      menuOpen: !!menu?.open,
      menuRect: rect(menu?.querySelector('.topbar-global-popover')),
      items: items.map(item => ({ index: item.index, label: item.label, rect: item.rect })),
      floats: floats.map(item => ({ selector: item.selector, rect: item.rect })),
      candidates
    };
  })()`);
}

async function clickPoint(cdp, page, point) {
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y, button: 'none' }, page.sessionId);
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1, buttons: 1
  }, page.sessionId);
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1, buttons: 0
  }, page.sessionId);
}

async function pressEscape(cdp, page) {
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27
  }, page.sessionId);
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27
  }, page.sessionId);
}

async function verifyMenuOverlap(cdp, page, menuKey) {
  await browser.clickSelector(cdp, page, `[data-topbar-menu-trigger="${menuKey}"]`);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `!!document.querySelector('[data-topbar-menu="${menuKey}"][open]')`), { timeoutMs: 5000 });
  return readOverlap(cdp, page, menuKey);
}

async function verifyPerspectiveAfterClose(cdp, page) {
  await pressEscape(cdp, page);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `![...document.querySelectorAll('[data-topbar-menu][open]')].length`), { timeoutMs: 5000 });
  const before = await browser.evaluate(cdp, page, `document.body.classList.contains('is-defense-mode')`);
  await browser.clickSelector(cdp, page, '#fdc-perspective-toggle');
  const after = await browser.evaluate(cdp, page, `document.body.classList.contains('is-defense-mode')`);
  assert.notEqual(after, before, 'メニューを閉じた後の攻防切替が通常クリックで動作しません');
  await browser.clickSelector(cdp, page, '#fdc-perspective-toggle');
  assert.equal(await browser.evaluate(cdp, page, `document.body.classList.contains('is-defense-mode')`), before, '攻防切替の復帰クリックが動作しません');
}

async function run() {
  const serverPort = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([serverPort]);
  const origin = `http://127.0.0.1:${serverPort}`;
  const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-topbar-overlap-'));
  const server = startServer(serverPort);
  const pages = [];
  let chrome = null;
  let cdp = null;
  const observations = [];
  try {
    await browser.waitForHttp(`${origin}/formation-damage-calc.html`);
    ({ chrome, cdp } = await launchChrome(cdpPort, profileRoot));
    let dataOverlap = null;
    let bulkOverlap = null;
    for (const scenario of [
      { label: 'pc-1280-bulk', width: 1280, height: 900, menu: 'bulk' },
      { label: 'mobile-375-data', width: 375, height: 844, menu: 'data' },
      { label: 'mobile-720-data', width: 720, height: 900, menu: 'data' },
      { label: 'desktop-721-very-low-bulk', width: 721, height: 250, menu: 'bulk' }
    ]) {
      const page = await openCalc(cdp, origin, scenario.width, scenario.height);
      pages.push(page);
      const rows = await browser.evaluate(cdp, page, '[...document.querySelectorAll("[data-topbar-operation]")].map(element => Math.round(element.getBoundingClientRect().top))');
      assert.equal(new Set(rows).size, scenario.width <= 720 ? 2 : 1, `${scenario.label}: 上バー段数が境界仕様と不一致`);
      const facts = await verifyMenuOverlap(cdp, page, scenario.menu);
      const hit = facts.candidates.find(candidate => candidate.menuHit);
      observations.push({ label: scenario.label, menu: scenario.menu, facts, selected: hit || null });
      if (hit) {
        if (scenario.menu === 'data' && !dataOverlap) dataOverlap = { page, hit, facts, label: scenario.label };
        if (scenario.menu === 'bulk' && !bulkOverlap) bulkOverlap = { page, hit, facts, label: scenario.label };
      }
      await verifyPerspectiveAfterClose(cdp, page);
    }

    assert.ok(dataOverlap, `データメニューと攻防フロートの実交差が確認できませんでした: ${JSON.stringify(observations)}`);
    assert.ok(bulkOverlap, `一括設定メニューと攻防フロートの実交差が確認できませんでした: ${JSON.stringify(observations)}`);

    const dataPage = await openCalc(cdp, origin, dataOverlap.label === 'mobile-375-data' ? 375 : 721, 844);
    pages.push(dataPage);
    const dataFacts = await verifyMenuOverlap(cdp, dataPage, 'data');
    const dataHit = dataFacts.candidates.find(candidate => candidate.menuHit);
    assert.ok(dataHit, `データメニューの再現交差点が見つかりません: ${JSON.stringify(dataFacts)}`);
    await clickPoint(cdp, dataPage, dataHit.point);
    await browser.waitFor(async () => browser.evaluate(cdp, dataPage, `location.pathname.endsWith('/public/apostle-data.html')`), { timeoutMs: 15000 });
    assert.equal(await browser.evaluate(cdp, dataPage, `location.pathname`), '/public/apostle-data.html', 'データメニューの実クリックが使徒データへ遷移しません');

    const bulkPage = await openCalc(cdp, origin, bulkOverlap.label === 'pc-1280-bulk' ? 1280 : 721, bulkOverlap.label === 'desktop-721-very-low-bulk' ? 250 : 900);
    pages.push(bulkPage);
    const bulkFacts = await verifyMenuOverlap(cdp, bulkPage, 'bulk');
    const bulkHit = bulkFacts.candidates.find(candidate => candidate.menuHit);
    assert.ok(bulkHit, `一括設定メニューの再現交差点が見つかりません: ${JSON.stringify(bulkFacts)}`);
    const bulkTarget = await browser.evaluate(cdp, bulkPage, `document.querySelectorAll('[data-topbar-menu="bulk"] [data-topbar-menu-item="bulk"]')[${bulkHit.itemIndex}]?.dataset.topbarBulkTarget || ''`);
    await clickPoint(cdp, bulkPage, bulkHit.point);
    await browser.waitFor(async () => browser.evaluate(cdp, bulkPage, `location.pathname.endsWith('/stat-dashboard.html') && new URL(location.href).searchParams.get('global') === ${JSON.stringify(bulkTarget)}`), { timeoutMs: 15000 });
    assert.equal(await browser.evaluate(cdp, bulkPage, `new URL(location.href).searchParams.get('global')`), bulkTarget, '一括設定メニューの実クリックが対象設定へ遷移しません');

    const modalPage = await openCalc(cdp, origin, 375, 844);
    pages.push(modalPage);
    const modal = await browser.evaluate(cdp, modalPage, `(() => {
      const dialog = document.querySelector('#trickcal-announcements-dialog');
      if (!dialog) return null;
      dialog.showModal();
      const topbar = document.querySelector('.fdc-top-control-bar');
      const rect = dialog.getBoundingClientRect();
      const point = { x: Math.max(1, Math.min(innerWidth - 1, rect.left + rect.width / 2)), y: Math.max(1, Math.min(innerHeight - 1, rect.top + rect.height / 2)) };
      const hit = document.elementFromPoint(point.x, point.y);
      return { modal: dialog.matches(':modal'), hitDialog: hit === dialog || !!hit?.closest('#trickcal-announcements-dialog'), topbarZ: getComputedStyle(topbar).zIndex };
    })()`);
    if (modal) {
      assert.equal(modal.modal, true, '通知ダイアログを隔離状態で開けません');
      assert.equal(modal.hitDialog, true, '通知ダイアログが上バーより前面にありません');
      await browser.evaluate(cdp, modalPage, `document.querySelector('#trickcal-announcements-dialog')?.close()`);
    }

    console.log(JSON.stringify({
      ok: true,
      browser: 'Chrome CDP isolated profile',
      overlaps: observations.map(item => ({
        label: item.label,
        menu: item.menu,
        selected: item.selected ? {
          itemIndex: item.selected.itemIndex,
          label: item.selected.label,
          floatSelector: item.selected.floatSelector,
          point: item.selected.point,
          hit: item.selected.hit,
          overlap: item.selected.overlap
        } : null
      })),
      actions: ['data menu physical overlap click -> public/apostle-data.html', 'bulk menu physical overlap click -> manager global setting', 'closed menu -> perspective toggle click', 'announcement dialog remains above topbar']
    }));
  } finally {
    for (const page of pages) {
      try { if (cdp) await cdp.send('Target.closeTarget', { targetId: page.targetId }); } catch (_) {}
    }
    try { if (cdp) await cdp.send('Browser.close'); } catch (_) {}
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    await new Promise(resolve => server.close(resolve));
    await browser.sleep(200);
    try { fs.rmSync(profileRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch (_) {}
  }
}

if (require.main === module) {
  run().catch(error => {
    process.stderr.write(`${error.stack || error}\n`);
    process.exitCode = 1;
  });
}

module.exports = { run };
