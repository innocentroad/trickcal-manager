#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const browser = require('./storage-native-browser-check.js');

const ROOT = path.resolve(__dirname, '..');
const SHARE_HASH = '#1.z.C3EODmBkZBSS1WN2kHWVZZLlZtaWVZPVkOXlYxVlZWTlZBVjZWKVZJVlVWBVZxViFmRiZmVkYgYiFlY2dnYONk4WLi5uHl5eblZOBgYGARZWRkZWJg5WJj5eJl5WJn5WRjlWJh5WJhFeJllWJhleJiagcaxMUrxMXKxMikDFbAwMyfeZnzJn5ji4MbMxSHFpWgMA';
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
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

async function waitReady(cdp, page) {
  await browser.waitFor(async () => browser.evaluate(cdp, page, `
    document.documentElement.dataset.storageBoot === 'ready'
      && !!document.querySelector('[data-shared-topbar-common]')
      && !!window.TRICKCAL_STAT_ENGINE
  `), { timeoutMs: 30000 });
}

async function pressBrowserKey(cdp, page, key, { shiftKey = false } = {}) {
  const keyInfo = {
    Tab: { code: 'Tab', windowsVirtualKeyCode: 9 },
    Escape: { code: 'Escape', windowsVirtualKeyCode: 27 }
  }[key];
  if (!keyInfo) throw new Error(`Unsupported browser key: ${key}`);
  const params = {
    key,
    ...keyInfo,
    modifiers: shiftKey ? 8 : 0
  };
  await cdp.send('Input.dispatchKeyEvent', { ...params, type: 'keyDown' }, page.sessionId);
  await cdp.send('Input.dispatchKeyEvent', { ...params, type: 'keyUp' }, page.sessionId);
}

async function waitCommonTopbarReady(cdp, page) {
  await browser.waitFor(async () => browser.evaluate(cdp, page, `
    !!document.querySelector('[data-shared-topbar-common]')
      && document.querySelectorAll('[data-topbar-operation]').length === 8
  `), { timeoutMs: 30000 });
}

async function waitDataDetailReady(cdp, page, target) {
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
    const bar = document.querySelector('.data-detail-topbar[data-shared-topbar-data-target="${target}"]');
    return !!bar && document.querySelectorAll('[data-topbar-operation]').length === 8;
  })()`), { timeoutMs: 30000 });
}

async function readDataDetail(cdp, page) {
  return browser.evaluate(cdp, page, `(() => ({
    topbar: !!document.querySelector('.data-detail-topbar'),
    operationCount: document.querySelectorAll('[data-topbar-operation]').length,
    pageCurrent: [...document.querySelectorAll('[aria-current="page"]')].map(element => element.innerText),
    dataCurrent: [...document.querySelectorAll('[data-topbar-menu-item="data"][aria-current]')].map(element => ({
      target: element.dataset.topbarDataTarget,
      current: element.getAttribute('aria-current')
    })),
    dataItems: [...document.querySelectorAll('[data-topbar-menu="data"] [data-topbar-menu-item="data"]')].map(element => ({
      tag: element.tagName,
      role: element.getAttribute('role'),
      target: element.dataset.topbarDataTarget,
      label: element.textContent.trim(),
      href: element.getAttribute('href')
    })),
    oldThemeIds: [...document.querySelectorAll('#enemy-status-theme, #board-preview-theme-toggle')].length,
    title: document.querySelector('.enemy-status-header h1, .tool-head h1')?.innerText || '',
    enemySearch: !!document.querySelector('#enemy-status-search'),
    boardZoom: !!document.querySelector('#board-preview-zoom-in'),
    legacyTemplates: [...document.querySelectorAll('template.dashboard-top-actions, template.fdc-legacy-topbar, template.enemy-legacy-header-actions, template.board-legacy-theme-control')].map(element => {
      const rect = element.getBoundingClientRect();
      return { className: element.className, display: getComputedStyle(element).display, height: rect.height };
    }),
    geometry: {
      barHeight: document.querySelector('.data-detail-topbar')?.getBoundingClientRect().height || 0,
      syncedHeight: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--trickcal-topbar-height')) || 0,
      operationWidths: [...document.querySelectorAll('.topbar-operation-nav > *')].map(element => element.getBoundingClientRect().width),
      operationHeights: [...document.querySelectorAll('.topbar-operation-nav > *')].map(element => element.getBoundingClientRect().height),
      overflow: document.documentElement.scrollWidth - innerWidth
    }
  }))()`);
}

async function readTopbar(cdp, page) {
  return browser.evaluate(cdp, page, `(() => ({
    operations: [...document.querySelectorAll('[data-topbar-operation]')].map(element => ({
      key: element.dataset.topbarOperation,
      tag: element.tagName,
      menu: element.dataset.topbarMenu || '',
      view: element.dataset.dashboardView || '',
      card: element.dataset.openCardManager || '',
      global: element.dataset.openGlobal || '',
      active: element.classList.contains('is-active'),
      current: element.getAttribute('aria-current') || '',
      href: element.getAttribute('href') || ''
    })),
    dataItems: [...document.querySelectorAll('[data-topbar-menu="data"] [data-topbar-menu-item="data"]')].map(element => ({
      tag: element.tagName,
      role: element.getAttribute('role'),
      target: element.dataset.topbarDataTarget,
      label: element.textContent.trim(),
      href: element.getAttribute('href')
    })),
    bulkItems: [...document.querySelectorAll('[data-topbar-menu="bulk"] [data-topbar-menu-item="bulk"]')].map(element => ({
      tag: element.tagName,
      role: element.getAttribute('role'),
      target: element.dataset.topbarBulkTarget,
      label: element.textContent.trim(),
      href: element.getAttribute('href'),
      openGlobal: element.dataset.openGlobal || ''
    })),
    legacyTemplates: [...document.querySelectorAll('template.dashboard-top-actions, template.fdc-legacy-topbar, template.enemy-legacy-header-actions, template.board-legacy-theme-control')].map(element => {
      const rect = element.getBoundingClientRect();
      return { className: element.className, display: getComputedStyle(element).display, height: rect.height };
    }),
    topbarGeometry: (() => {
      const element = document.querySelector('[data-shared-topbar-page]');
      if (!element) return null;
      return {
        height: element.getBoundingClientRect().height,
        syncedHeight: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--trickcal-topbar-height')) || 0
      };
    })(),
    geometry: {
      operations: [...document.querySelectorAll('[data-topbar-operation]')].map(element => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }),
      iconActions: [...document.querySelectorAll('.topbar-common-actions > .topbar-icon-action')].map(element => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }),
      note: (() => {
        const element = document.querySelector('.topbar-common-actions > .topbar-note-link');
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, width: rect.width, height: rect.height };
      })(),
      reloadCount: document.querySelectorAll('.topbar-reload-button').length
    },
    active: [...document.querySelectorAll('[data-topbar-operation].is-active')].map(element => element.dataset.topbarOperation),
    menu: [...document.querySelectorAll('[data-topbar-menu]')].map(element => ({ key: element.dataset.topbarMenu, open: element.open }))
  }))()`);
}

async function run() {
  const serverPort = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([serverPort]);
  const origin = `http://127.0.0.1:${serverPort}`;
  const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-topbar-navigation-'));
  const server = startServer(serverPort);
  const pages = [];
  let chrome = null;
  let cdp = null;
  try {
    await browser.waitForHttp(`${origin}/stat-dashboard.html`);
    ({ chrome, cdp } = await launchChrome(cdpPort, profileRoot));
    const page = await browser.createPage(cdp, `${origin}/stat-dashboard.html?topbarNavigationNative=1&view=settings`);
    pages.push(page);
    await waitReady(cdp, page);
    await browser.evaluate(cdp, page, `document.querySelector('#trickcal-announcements-dialog')?.close()`);

    const noticePage = await browser.createPage(cdp, `${origin}/tools/fixtures/topbar-browser-fixture.html?nativeAnnouncementFocus=1`);
    pages.push(noticePage);
    await browser.waitFor(async () => browser.evaluate(cdp, noticePage, `(() =>
      document.documentElement.dataset.storageBoot === 'ready'
        && !!document.querySelector('[data-shared-topbar-common]')
        && !!window.TRICKCAL_ANNOUNCEMENTS_CONTROLLER
        && !!document.querySelector('#trickcal-announcements-dialog')
    )()`), { timeoutMs: 30000 });
    await browser.evaluate(cdp, noticePage, `document.querySelector('#trickcal-announcements-dialog')?.close()`);
    const noticeButton = '.topbar-announcement-trigger';
    await browser.clickSelector(cdp, noticePage, noticeButton);
    await browser.waitFor(async () => browser.evaluate(cdp, noticePage, `(() => {
      const dialog = document.querySelector('#trickcal-announcements-dialog');
      return dialog?.open === true && document.activeElement?.classList.contains('trickcal-announcements-close');
    })()`), { timeoutMs: 5000 });
    const initialNoticeFocus = await browser.evaluate(cdp, noticePage, `(() => ({
      dialogOpen: document.querySelector('#trickcal-announcements-dialog')?.open,
      activeTag: document.activeElement?.tagName,
      activeClass: document.activeElement?.className,
      activeIsClose: document.activeElement === document.querySelector('.trickcal-announcements-close')
    }))()`);
    assert.deepEqual(initialNoticeFocus, {
      dialogOpen: true,
      activeTag: 'BUTTON',
      activeClass: 'trickcal-announcements-close',
      activeIsClose: true
    }, '実DOMの初期フォーカスがdialog自身ではなく閉じるbuttonにあります');

    await pressBrowserKey(cdp, noticePage, 'Tab');
    assert.equal(await browser.evaluate(cdp, noticePage, `document.activeElement === document.querySelector('.trickcal-announcement-open-migration')`), true, '実Tabで閉じるbuttonの次に移行案内操作へ進みます');
    await pressBrowserKey(cdp, noticePage, 'Tab', { shiftKey: true });
    assert.equal(await browser.evaluate(cdp, noticePage, `document.activeElement === document.querySelector('.trickcal-announcements-close')`), true, '実Shift+Tabで先頭へ戻ります');

    const reverseTrap = await browser.evaluate(cdp, noticePage, `(() => {
      const dialog = document.querySelector('#trickcal-announcements-dialog');
      const first = dialog.querySelector('.trickcal-announcements-close');
      const selector = 'button:not([disabled]), a[href], summary, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const candidates = [...dialog.querySelectorAll(selector)].filter(element => {
        if (element.disabled || element.hidden || element.inert || element.getAttribute('aria-hidden') === 'true') return false;
        for (let ancestor = element; ancestor?.nodeType === 1; ancestor = ancestor.parentElement) {
          if (ancestor.hidden || ancestor.inert || getComputedStyle(ancestor).display === 'none' || getComputedStyle(ancestor).visibility === 'hidden') return false;
          if (ancestor.tagName === 'DETAILS' && !ancestor.open && ancestor.querySelector('summary') !== element) return false;
        }
        return true;
      });
      const last = candidates.at(-1);
      first.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
      dialog.dispatchEvent(event);
      return { prevented: event.defaultPrevented, candidateCount: candidates.length, lastExists: !!last, activeIsLast: document.activeElement === last };
    })()`);
    assert.equal(reverseTrap.prevented, true, `通知controllerがShift+Tabを捕捉しませんでした: ${JSON.stringify(reverseTrap)}`);
    assert.ok(reverseTrap.candidateCount > 1 && reverseTrap.lastExists && reverseTrap.activeIsLast, `通知controllerが実DOMの末尾候補へ移動しませんでした: ${JSON.stringify(reverseTrap)}`);
    const forwardTrap = await browser.evaluate(cdp, noticePage, `(() => {
      const dialog = document.querySelector('#trickcal-announcements-dialog');
      const first = dialog.querySelector('.trickcal-announcements-close');
      const selector = 'button:not([disabled]), a[href], summary, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const candidates = [...dialog.querySelectorAll(selector)].filter(element => {
        if (element.disabled || element.hidden || element.inert || element.getAttribute('aria-hidden') === 'true') return false;
        for (let ancestor = element; ancestor?.nodeType === 1; ancestor = ancestor.parentElement) {
          if (ancestor.hidden || ancestor.inert || getComputedStyle(ancestor).display === 'none' || getComputedStyle(ancestor).visibility === 'hidden') return false;
          if (ancestor.tagName === 'DETAILS' && !ancestor.open && ancestor.querySelector('summary') !== element) return false;
        }
        return true;
      });
      const last = candidates.at(-1);
      last.focus();
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      dialog.dispatchEvent(event);
      return { prevented: event.defaultPrevented, lastExists: !!last, activeIsFirst: document.activeElement === first };
    })()`);
    assert.deepEqual(forwardTrap, { prevented: true, lastExists: true, activeIsFirst: true }, '合成Tabで通知controller自身が末尾から先頭へ循環します');

    const gameMoreSelector = '.trickcal-announcement-history-section.is-game-data .trickcal-announcement-history-more';
    await browser.waitFor(async () => browser.evaluate(cdp, noticePage, `!!document.querySelector(${JSON.stringify(gameMoreSelector)})`), { timeoutMs: 5000 });
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const moreVisible = await browser.evaluate(cdp, noticePage, `(() => {
        const more = document.querySelector(${JSON.stringify(gameMoreSelector)});
        return !!more && !more.hidden;
      })()`);
      if (!moreVisible) break;
      await browser.clickSelector(cdp, noticePage, gameMoreSelector);
    }
    const finalMoreFocus = await browser.evaluate(cdp, noticePage, `(() => {
      const more = document.querySelector(${JSON.stringify(gameMoreSelector)});
      const active = document.activeElement;
      return {
        moreHidden: !more || more.hidden,
        activeTag: active?.tagName,
        activeIsHistorySummary: active?.matches?.('.trickcal-announcement-history-entry > summary') === true,
        activeInsideDialog: document.querySelector('#trickcal-announcements-dialog')?.contains(active) === true
      };
    })()`);
    assert.deepEqual(finalMoreFocus, {
      moreHidden: true,
      activeTag: 'SUMMARY',
      activeIsHistorySummary: true,
      activeInsideDialog: true
    }, '最後の「もっと見る」が消えた後、実activeElementを追加された記事summaryへ移します');
    await pressBrowserKey(cdp, noticePage, 'Escape');
    await browser.waitFor(async () => browser.evaluate(cdp, noticePage, `(() => {
      const dialog = document.querySelector('#trickcal-announcements-dialog');
      return dialog?.open === false && document.activeElement === document.querySelector(${JSON.stringify(noticeButton)});
    })()`), { timeoutMs: 5000 });
    const afterNoticeEscape = await browser.evaluate(cdp, noticePage, `({
      dialogOpen: document.querySelector('#trickcal-announcements-dialog')?.open,
      bellRestored: document.activeElement === document.querySelector(${JSON.stringify(noticeButton)}),
      activeClass: document.activeElement?.className
    })`);
    assert.deepEqual(afterNoticeEscape, { dialogOpen: false, bellRestored: true, activeClass: 'topbar-announcement-trigger topbar-icon-action' }, 'Escapeで閉じた後に元の共通ベルへ実focusを復帰します');

    const indexPage = await browser.createPage(cdp, `${origin}/index.html?view=formation&phase=2#home-preserved`);
    pages.push(indexPage);
    await browser.waitFor(async () => browser.evaluate(cdp, indexPage, `location.pathname.endsWith('/stat-dashboard.html')`));
    const indexForwarded = await browser.evaluate(cdp, indexPage, `(() => {
      const url = new URL(location.href);
      return { view: url.searchParams.get('view'), phase: url.searchParams.get('phase'), recover: url.searchParams.get('recover'), hash: url.hash };
    })()`);
    assert.deepEqual(indexForwarded, { view: 'formation', phase: '2', recover: null, hash: '#home-preserved' }, 'indexがquery/hashを保持して通常遷移しています');

    const oldRecoverPage = await browser.createPage(cdp, `${origin}/stat-dashboard.html?recover=20260912&view=formation#legacy-preserved`);
    pages.push(oldRecoverPage);
    await waitReady(cdp, oldRecoverPage);
    const oldRecoverInitial = await browser.evaluate(cdp, oldRecoverPage, `(() => {
      const url = new URL(location.href);
      return {
        path: url.pathname,
        recover: url.searchParams.get('recover'),
        view: url.searchParams.get('view'),
        hash: url.hash,
        panel: document.querySelector('[data-dashboard-panel].is-active')?.dataset.dashboardPanel
      };
    })()`);
    assert.deepEqual(oldRecoverInitial, {
      path: '/stat-dashboard.html', recover: '20260912', view: 'formation', hash: '#legacy-preserved', panel: 'formation'
    }, '古いrecover付きURLが通常ページとして開けません');
    await cdp.send('Page.reload', { ignoreCache: true }, oldRecoverPage.sessionId);
    await waitReady(cdp, oldRecoverPage);
    assert.equal(await browser.evaluate(cdp, oldRecoverPage, `new URL(location.href).searchParams.get('recover')`), '20260912', '古いrecover付きURLの再読み込みに失敗しました');

    const initial = await readTopbar(cdp, page);
    const initialByKey = Object.fromEntries(initial.operations.map(item => [item.key, item]));
    assert.equal(initialByKey.manager.tag, 'BUTTON');
    assert.equal(initialByKey.formation.tag, 'BUTTON');
    assert.equal(initialByKey.artifact.tag, 'BUTTON');
    assert.equal(initialByKey.spell.tag, 'BUTTON');
    assert.equal(initialByKey.board.tag, 'BUTTON');
    assert.equal(initialByKey.bulk.tag, 'DETAILS');
    assert.equal(initialByKey.bulk.menu, 'bulk');
    assert.equal(initialByKey.data.tag, 'DETAILS');
    assert.equal(initialByKey.data.menu, 'data');
    assert.deepEqual(initial.legacyTemplates, [], '旧操作templateがレイアウトDOMに残っています');
    assert.ok(initial.topbarGeometry?.height > 0, '共通上バーの実測高さが取得できません');
    assert.equal(initial.topbarGeometry.syncedHeight, Math.ceil(initial.topbarGeometry.height), '高さ同期用変数が実測値と一致しません');
    assert.deepEqual(initial.dataItems.map(item => item.target), ['apostles', 'enemies', 'board']);
    assert.deepEqual(initial.dataItems.map(item => item.label), ['使徒データ', '敵データ', 'ボードプレビュー']);
    assert.ok(initial.dataItems.every(item => item.tag === 'A' && item.role === 'menuitem' && item.href));
    assert.deepEqual(initial.bulkItems.map(item => item.target), ['apostles', 'rank', 'bond', 'aside', 'research']);
    assert.deepEqual(initial.bulkItems.map(item => item.tag), ['BUTTON', 'BUTTON', 'BUTTON', 'BUTTON', 'BUTTON']);
    assert.ok(initial.bulkItems.every(item => item.role === 'menuitem' && item.openGlobal === item.target && !item.href));
    const operationWidths = initial.geometry.operations.map(item => item.width);
    const operationHeights = initial.geometry.operations.map(item => item.height);
    assert.ok(operationWidths.every(width => Math.abs(width - operationWidths[0]) < 0.2), `operation widths differ: ${operationWidths}`);
    assert.ok(operationHeights.every(height => Math.abs(height - operationHeights[0]) < 0.2), `operation heights differ: ${operationHeights}`);
    assert.ok(Math.abs(operationWidths[0] - 61.6) < 0.2, `unexpected operation width: ${operationWidths[0]}`);
    assert.ok(Math.abs(operationHeights[0] - 37.6) < 0.2, `unexpected operation height: ${operationHeights[0]}`);
    assert.equal(initial.geometry.iconActions.length, 2);
    assert.ok(initial.geometry.iconActions.every(item => Math.abs(item.width - 40) < 0.2 && Math.abs(item.height - 40) < 0.2), `icon action sizes differ: ${JSON.stringify(initial.geometry.iconActions)}`);
    assert.equal(initial.geometry.note?.tag, 'A');
    assert.equal(initial.geometry.reloadCount, 0);

    await browser.clickSelector(cdp, page, '[data-dashboard-view="formation"]');
    const formation = await browser.evaluate(cdp, page, `(() => ({
      panel: document.querySelector('[data-dashboard-panel].is-active')?.dataset.dashboardPanel,
      active: [...document.querySelectorAll('[data-topbar-operation].is-active')].map(element => element.dataset.topbarOperation),
      current: document.querySelector('[data-topbar-operation="formation"]')?.getAttribute('aria-current')
    }))()`);
    assert.equal(formation.panel, 'formation');
    assert.deepEqual(formation.active, ['manager', 'formation']);
    assert.equal(formation.current, 'location');

    await browser.clickSelector(cdp, page, '[data-open-card-manager="artifact"]');
    await browser.waitFor(async () => (await browser.evaluate(cdp, page, `document.querySelector('[data-card-kind].is-active')?.dataset.cardKind || ''`)) === 'artifact');
    const artifact = await readTopbar(cdp, page);
    assert.deepEqual(artifact.active, ['manager', 'artifact']);

    await browser.clickSelector(cdp, page, '[data-open-card-manager="spell"]');
    await browser.waitFor(async () => (await browser.evaluate(cdp, page, `document.querySelector('[data-card-kind].is-active')?.dataset.cardKind || ''`)) === 'spell');
    const spell = await readTopbar(cdp, page);
    assert.deepEqual(spell.active, ['manager', 'spell']);

    await browser.clickSelector(cdp, page, '[data-open-global="board-global"]');
    await browser.waitFor(async () => (await browser.evaluate(cdp, page, `document.querySelector('[data-setting-panel="board-global"].is-active')?.dataset.settingPanel || ''`)) === 'board-global');
    const board = await readTopbar(cdp, page);
    assert.deepEqual(board.active, ['manager', 'board']);

    await browser.clickSelector(cdp, page, '[data-topbar-menu-trigger="bulk"]');
    let opened = await readTopbar(cdp, page);
    assert.equal(opened.menu.find(item => item.key === 'bulk').open, true);
    assert.deepEqual(opened.active, ['manager', 'board'], 'メニューを開いただけで現在位置が変わりました');
    for (const target of ['apostles', 'rank', 'bond', 'aside', 'research']) {
      if (target !== 'apostles') await browser.clickSelector(cdp, page, '[data-topbar-menu-trigger="bulk"]');
      await browser.waitFor(async () => (await browser.evaluate(cdp, page, `document.querySelector('[data-topbar-menu="bulk"]')?.open || false`)) === true);
      await browser.clickSelector(cdp, page, `[data-topbar-bulk-target="${target}"]`);
      await browser.waitFor(async () => (await browser.evaluate(cdp, page, `document.querySelector('[data-setting-panel="${target}"].is-active')?.dataset.settingPanel || ''`)) === target);
      const selected = await readTopbar(cdp, page);
      assert.deepEqual(selected.active, ['manager', 'bulk'], `unexpected active operations for ${target}: ${JSON.stringify(selected.operations)}`);
      assert.equal(selected.menu.find(item => item.key === 'bulk').open, false);
      assert.deepEqual(await browser.evaluate(cdp, page, `([...document.querySelectorAll('[data-setting-panel].is-active')].map(element => element.dataset.settingPanel))`), [target]);
      assert.equal(await browser.evaluate(cdp, page, `document.querySelector('[data-topbar-bulk-target="${target}"]')?.getAttribute('aria-current')`), 'location');
    }

    await browser.clickSelector(cdp, page, '[data-topbar-menu-trigger="data"]');
    opened = await readTopbar(cdp, page);
    assert.equal(opened.menu.find(item => item.key === 'data').open, true);
    assert.equal(opened.menu.find(item => item.key === 'bulk').open, false);
    assert.deepEqual(opened.active, ['manager', 'bulk'], 'データメニューを開いて現在位置が変わりました');
    await browser.evaluate(cdp, page, `document.querySelector('[data-topbar-menu-trigger="data"]').focus()`);
    await browser.evaluate(cdp, page, `document.querySelector('[data-topbar-menu-trigger="data"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    const escaped = await browser.evaluate(cdp, page, `({
      open: document.querySelector('[data-topbar-menu="data"]')?.open || false,
      focused: document.activeElement?.dataset?.topbarMenuTrigger || ''
    })`);
    assert.equal(escaped.open, false);
    assert.equal(escaped.focused, 'data');

    const externalBulkTargets = ['apostles', 'rank', 'bond', 'aside', 'research'];
    const externalPages = [
      ['calc', `${origin}/formation-damage-calc.html?topbarBulkNative=1`, 'calc'],
      ['data', `${origin}/tools/fixtures/topbar-browser-fixture.html?topbarBulkNative=1`, 'data'],
      ['share', `${origin}/formation-share.html${SHARE_HASH}`, '']
    ];
    for (const [pageName, url, expectedPage] of externalPages) {
      const externalPage = await browser.createPage(cdp, url);
      pages.push(externalPage);
      await waitCommonTopbarReady(cdp, externalPage);
      const before = await browser.evaluate(cdp, externalPage, `location.href`);
      const external = await readTopbar(cdp, externalPage);
      if (pageName === 'calc') {
        const layering = await browser.evaluate(cdp, externalPage, `(() => {
          const topbar = document.querySelector('.fdc-top-control-bar, .dashboard-top-control-bar');
          const popover = document.querySelector('.topbar-global-popover');
          const floatSelectors = ['.fdc-floating-target', '.fdc-apply-float-controller'];
          const zIndex = element => Number.parseInt(getComputedStyle(element).zIndex, 10) || 0;
          return {
            topbar: topbar ? zIndex(topbar) : 0,
            popover: popover ? zIndex(popover) : 0,
            floats: floatSelectors.map(selector => zIndex(document.querySelector(selector)))
          };
        })()`);
        assert.ok(layering.topbar > Math.max(...layering.floats), `計算画面の攻撃／防御フロートが上バーより前面です: ${JSON.stringify(layering)}`);
      }
      assert.equal(external.operations.find(item => item.key === 'bulk')?.tag, 'DETAILS', `${pageName}の一括設定がリンクになっています`);
      assert.deepEqual(external.bulkItems.map(item => item.target), externalBulkTargets);
      assert.deepEqual(external.bulkItems.map(item => item.tag), ['A', 'A', 'A', 'A', 'A']);
      assert.ok(external.bulkItems.every(item => item.role === 'menuitem' && item.href && !item.openGlobal));
      assert.ok(external.bulkItems.every(item => new URL(item.href, before).searchParams.get('global') === item.target));
      const routeLinks = [
        ...external.operations.filter(item => item.href).map(item => item.href),
        ...external.dataItems.map(item => item.href),
        ...external.bulkItems.map(item => item.href)
      ];
      assert.ok(routeLinks.every(href => !new URL(href, before).searchParams.getAll('recover').includes('20260912')), `${pageName}の通常メニューが固定recoverを含みます`);
      if (pageName === 'data') {
        const enemyMenuUrl = new URL(external.dataItems.find(item => item.target === 'enemies').href, before);
        assert.deepEqual(enemyMenuUrl.searchParams.getAll('recover'), ['custom'], '固定recoverだけが除去され、別のrecover値は保持されませんでした');
        assert.equal(enemyMenuUrl.searchParams.get('preset'), 'fixture', '通常routeのpreset queryを落としました');
        assert.equal(enemyMenuUrl.searchParams.get('phase'), '2', '通常routeのphase queryを落としました');
        assert.equal(enemyMenuUrl.hash, '#enemy-safe', '通常routeのhashを落としました');
      }
      if (expectedPage) {
        assert.equal(external.active.includes(expectedPage), true, `${pageName}の現在ページが点灯していません`);
      } else {
        assert.deepEqual(external.active, [], `${pageName}で管理操作を現在ページとして点灯させています`);
      }

      await browser.clickSelector(cdp, externalPage, '[data-topbar-menu-trigger="bulk"]');
      const externalOpened = await readTopbar(cdp, externalPage);
      assert.equal(externalOpened.menu.find(item => item.key === 'bulk').open, true);
      assert.equal(await browser.evaluate(cdp, externalPage, `location.href`), before, `${pageName}の一括設定ボタン押下だけで遷移しました`);
      const target = pageName === 'calc' ? 'rank' : pageName === 'data' ? 'aside' : 'research';
      await browser.clickSelector(cdp, externalPage, `[data-topbar-bulk-target="${target}"]`);
      await browser.waitFor(async () => browser.evaluate(cdp, externalPage, `location.pathname.includes('stat-dashboard.html')
        && new URL(location.href).searchParams.get('global') === '${target}'
        && !!document.querySelector('[data-setting-panel="${target}"].is-active')`), { timeoutMs: 30000 });
      const navigated = await browser.evaluate(cdp, externalPage, `({ href: location.href, global: new URL(location.href).searchParams.get('global'), active: [...document.querySelectorAll('[data-setting-panel].is-active')].map(element => element.dataset.settingPanel) })`);
      assert.equal(navigated.global, target, `${pageName}から${target}への遷移先が不正です`);
      assert.deepEqual(navigated.active, [target], `${pageName}から${target}の設定が開いていません`);
      assert.equal(new URL(navigated.href).searchParams.getAll('recover').includes('20260912'), false, `${pageName}からの通常遷移へ固定recoverが残っています`);
      if (pageName === 'data') {
        const targetUrl = new URL(navigated.href);
        assert.equal(targetUrl.searchParams.get('recover'), 'custom');
        assert.equal(targetUrl.searchParams.get('preset'), 'fixture');
        assert.equal(targetUrl.searchParams.get('phase'), '2');
        assert.equal(targetUrl.hash, '#manager-safe');
      }
    }

    const calcHandoffPage = await browser.createPage(cdp, `${origin}/formation-damage-calc.html?nativeEnemyHandoff=1`);
    pages.push(calcHandoffPage);
    await waitCommonTopbarReady(cdp, calcHandoffPage);
    await browser.waitFor(async () => browser.evaluate(cdp, calcHandoffPage, `document.querySelector('#fdc-enemy-preset')?.options.length > 1`), { timeoutMs: 30000 });
    await browser.evaluate(cdp, calcHandoffPage, `(() => {
      const preset = document.querySelector('#fdc-enemy-preset');
      const phase = document.querySelector('#fdc-enemy-phase');
      for (const option of [...preset.options].filter(item => item.value)) {
        preset.value = option.value;
        preset.dispatchEvent(new Event('change', { bubbles: true }));
        if (phase.options.length > 1) {
          phase.value = '1';
          phase.dispatchEvent(new Event('change', { bubbles: true }));
          return { preset: preset.value, phaseCount: phase.options.length, phase: phase.value };
        }
      }
      return { preset: preset.value, phaseCount: phase.options.length, phase: phase.value };
    })()`);
    const handoffSelection = await browser.evaluate(cdp, calcHandoffPage, `({ preset: document.querySelector('#fdc-enemy-preset')?.value || '', phaseCount: document.querySelector('#fdc-enemy-phase')?.options.length || 0, phase: document.querySelector('#fdc-enemy-phase')?.value || '' })`);
    assert.ok(handoffSelection.preset && handoffSelection.phaseCount > 1, `phase付き敵プリセットが見つかりません: ${JSON.stringify(handoffSelection)}`);
    assert.equal(handoffSelection.phase, '1');
    await browser.clickSelector(cdp, calcHandoffPage, '#fdc-enemy-status-link');
    await browser.waitFor(async () => browser.evaluate(cdp, calcHandoffPage, `location.pathname.endsWith('/enemy-status.html') || location.pathname.endsWith('/data/enemies/')`));
    const enemyHandoff = await browser.evaluate(cdp, calcHandoffPage, `(() => {
      const url = new URL(location.href);
      return { path: url.pathname, preset: url.searchParams.get('preset'), phase: url.searchParams.get('phase'), recover: url.searchParams.get('recover') };
    })()`);
    assert.equal(enemyHandoff.preset, handoffSelection.preset, '敵プリセットが敵データへ引き継がれていません');
    assert.equal(enemyHandoff.phase, '1', '敵phaseが敵データへ引き継がれていません');
    assert.notEqual(enemyHandoff.recover, '20260912', '敵データへの通常遷移に固定recoverが付与されています');

    const enemyPage = await browser.createPage(cdp, `${origin}/enemy-status.html?topbarDataDetailNative=1`);
    const boardPage = await browser.createPage(cdp, `${origin}/public/board-layout-preview.html?apostle=Amelia&topbarDataDetailNative=1`);
    pages.push(enemyPage, boardPage);
    await waitDataDetailReady(cdp, enemyPage, 'enemies');
    await waitDataDetailReady(cdp, boardPage, 'board');
    const enemyDetail = await readDataDetail(cdp, enemyPage);
    const boardDetail = await readDataDetail(cdp, boardPage);
    for (const [label, detail, target] of [['enemy', enemyDetail, 'enemies'], ['board', boardDetail, 'board']]) {
      assert.equal(detail.topbar, true, `${label} detail has no common topbar`);
      assert.equal(detail.operationCount, 8, `${label} detail operation count differs`);
      assert.deepEqual(detail.pageCurrent, ['データ'], `${label} detail has duplicate page current markers`);
      assert.deepEqual(detail.dataCurrent, [{ target, current: 'location' }], `${label} data destination is not active`);
      assert.equal(detail.oldThemeIds, 0, `${label} detail retains a duplicate theme control`);
      assert.deepEqual(detail.legacyTemplates, [], `${label} detail retains a legacy template`);
      assert.ok(detail.geometry.barHeight > 0, `${label} detail topbar has no measurable height`);
      assert.equal(detail.geometry.syncedHeight, Math.ceil(detail.geometry.barHeight), `${label} detail topbar height is not synchronized`);
      assert.ok(detail.title, `${label} detail title was removed`);
      assert.ok(detail.dataItems.every(item => item.tag === 'A' && item.role === 'menuitem' && item.href), `${label} data menu item is not a route link`);
      assert.ok(detail.geometry.operationWidths.every(width => Math.abs(width - detail.geometry.operationWidths[0]) < 0.2), `${label} operation widths differ`);
      assert.ok(detail.geometry.operationHeights.every(height => Math.abs(height - detail.geometry.operationHeights[0]) < 0.2), `${label} operation heights differ`);
      assert.ok(detail.geometry.overflow <= 0, `${label} detail overflows horizontally`);
    }
    assert.ok(enemyDetail.enemySearch, 'enemy detail search control was removed');
    assert.ok(boardDetail.boardZoom, 'board detail zoom control was removed');

    await browser.evaluate(cdp, boardPage, `localStorage.setItem('trickcal_theme', 'dark')`);
    await cdp.send('Page.reload', { ignoreCache: true }, boardPage.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, boardPage, `document.documentElement.dataset.storageBoot === 'ready' && document.body.classList.contains('theme-dark')`), { timeoutMs: 30000 });
    await waitDataDetailReady(cdp, boardPage, 'board');
    const darkInitial = await browser.evaluate(cdp, boardPage, `(() => {
      const button = document.querySelector('[data-shared-theme-button]');
      return {
        theme: document.documentElement.dataset.theme,
        bodyDark: document.body.classList.contains('theme-dark'),
        pressed: button?.getAttribute('aria-pressed'),
        label: button?.getAttribute('aria-label'),
        title: button?.title
      };
    })()`);
    assert.deepEqual(darkInitial, {
      theme: 'dark',
      bodyDark: true,
      pressed: 'true',
      label: 'ライトモードに切替',
      title: 'ライトモードに切替'
    }, `保存済みダークの初期状態が一致しません: ${JSON.stringify(darkInitial)}`);
    await browser.clickSelector(cdp, boardPage, '[data-shared-theme-button]');
    const lightAfterFirstClick = await browser.evaluate(cdp, boardPage, `(() => {
      const button = document.querySelector('[data-shared-theme-button]');
      return { theme: document.documentElement.dataset.theme, bodyLight: document.body.classList.contains('theme-light'), pressed: button?.getAttribute('aria-pressed'), label: button?.getAttribute('aria-label') };
    })()`);
    assert.deepEqual(lightAfterFirstClick, { theme: 'light', bodyLight: true, pressed: 'false', label: 'ダークモードに切替' });
    await browser.clickSelector(cdp, boardPage, '[data-shared-theme-button]');
    const darkAfterSecondClick = await browser.evaluate(cdp, boardPage, `document.documentElement.dataset.theme`);
    assert.equal(darkAfterSecondClick, 'dark');
    await browser.clickSelector(cdp, boardPage, '[data-shared-theme-button]');
    await cdp.send('Page.reload', { ignoreCache: true }, boardPage.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, boardPage, `(() => {
      const button = document.querySelector('[data-shared-theme-button]');
      return document.documentElement.dataset.storageBoot === 'ready'
        && document.body.classList.contains('theme-light')
        && !!button
        && button.getAttribute('aria-pressed') === 'false'
        && button.getAttribute('aria-label') === 'ダークモードに切替';
    })()`), { timeoutMs: 30000 });
    const lightReload = await browser.evaluate(cdp, boardPage, `(() => {
      const button = document.querySelector('[data-shared-theme-button]');
      return { theme: document.documentElement.dataset.theme, pressed: button?.getAttribute('aria-pressed'), label: button?.getAttribute('aria-label') };
    })()`);
    assert.deepEqual(lightReload, { theme: 'light', pressed: 'false', label: 'ダークモードに切替' });
    await browser.evaluate(cdp, boardPage, `localStorage.removeItem('trickcal_theme')`);
    await cdp.send('Page.reload', { ignoreCache: true }, boardPage.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, boardPage, `(() => {
      const button = document.querySelector('[data-shared-theme-button]');
      return document.documentElement.dataset.storageBoot === 'ready'
        && document.body.classList.contains('theme-dark')
        && !!button
        && button.getAttribute('aria-pressed') === 'true'
        && button.getAttribute('aria-label') === 'ライトモードに切替';
    })()`), { timeoutMs: 30000 });
    const defaultTheme = await browser.evaluate(cdp, boardPage, `(() => {
      const button = document.querySelector('[data-shared-theme-button]');
      return { theme: document.documentElement.dataset.theme, pressed: button?.getAttribute('aria-pressed'), label: button?.getAttribute('aria-label') };
    })()`);
    assert.deepEqual(defaultTheme, { theme: 'dark', pressed: 'true', label: 'ライトモードに切替' });

    const sharePage = await browser.createPage(cdp, `${origin}/formation-share.html${SHARE_HASH}`);
    pages.push(sharePage);
    await browser.waitFor(async () => browser.evaluate(cdp, sharePage, `(() => {
      const content = document.querySelector('#share-content');
      return !!document.querySelector('[data-shared-topbar-page="share"] [data-shared-topbar-common]')
        && !!content
        && !content.hidden;
    })()`), { timeoutMs: 30000 });
    await browser.evaluate(cdp, sharePage, `localStorage.setItem('trickcal_theme', 'dark')`);
    await cdp.send('Page.reload', { ignoreCache: true }, sharePage.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, sharePage, `(() => {
      const button = document.querySelector('[data-shared-theme-button]');
      return !!document.querySelector('[data-shared-topbar-page="share"] [data-shared-topbar-common]')
        && document.documentElement.dataset.theme === 'dark'
        && document.body.classList.contains('theme-dark')
        && button?.getAttribute('aria-pressed') === 'true';
    })()`), { timeoutMs: 30000 });
    await browser.waitFor(async () => browser.evaluate(cdp, sharePage, `(() => {
      const images = [...document.images];
      return images.length > 0 && images.every(image => image.complete);
    })()`), { timeoutMs: 30000 });
    const shareInitial = await browser.evaluate(cdp, sharePage, `(() => ({
      operationCount: document.querySelectorAll('[data-topbar-operation]').length,
      pageCurrent: [...document.querySelectorAll('[data-topbar-operation][aria-current="page"]')].map(element => element.dataset.topbarOperation),
      oldHeaderCount: document.querySelectorAll('.share-topbar, #theme-toggle').length,
      heading: document.querySelector('.share-page-heading h1')?.innerText || '',
      literalNewline: [...document.body.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.includes('\\\\n')),
      topbarHeight: document.querySelector('[data-shared-topbar-page]')?.getBoundingClientRect().height || 0,
      syncedHeight: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--trickcal-topbar-height')) || 0,
      brokenImages: [...document.images].filter(image => !image.naturalWidth).length,
      imageCount: document.images.length,
      theme: document.documentElement.dataset.theme,
      pressed: document.querySelector('[data-shared-theme-button]')?.getAttribute('aria-pressed'),
      announcementTrigger: !!document.querySelector('[data-announcement-trigger]')
    }))()`);
    assert.equal(shareInitial.operationCount, 8);
    assert.deepEqual(shareInitial.pageCurrent, [], '共有ページで管理操作を現在ページとして点灯させています');
    assert.equal(shareInitial.oldHeaderCount, 0, '共有専用旧ヘッダーまたは旧テーマボタンが残っています');
    assert.equal(shareInitial.heading, '編成共有');
    assert.equal(shareInitial.literalNewline, false, '共有ページの本文にliteral\\nが混入しています');
    assert.ok(shareInitial.topbarHeight > 0);
    assert.equal(shareInitial.syncedHeight, Math.ceil(shareInitial.topbarHeight));
    assert.equal(shareInitial.brokenImages, 0, `共有画像の読み込みに失敗しています: ${shareInitial.brokenImages}/${shareInitial.imageCount}`);
    assert.equal(shareInitial.theme, 'dark');
    assert.equal(shareInitial.pressed, 'true');
    assert.equal(shareInitial.announcementTrigger, true);
    await browser.clickSelector(cdp, sharePage, '[data-shared-theme-button]');
    const shareLight = await browser.evaluate(cdp, sharePage, `(() => ({
      theme: document.documentElement.dataset.theme,
      bodyLight: document.body.classList.contains('theme-light'),
      pressed: document.querySelector('[data-shared-theme-button]')?.getAttribute('aria-pressed'),
      label: document.querySelector('[data-shared-theme-button]')?.getAttribute('aria-label')
    }))()`);
    assert.deepEqual(shareLight, { theme: 'light', bodyLight: true, pressed: 'false', label: 'ダークモードに切替' });
    await browser.evaluate(cdp, sharePage, `localStorage.removeItem('trickcal_theme')`);

    console.log(JSON.stringify({
      ok: true,
      browser: 'Chrome CDP',
      dom: 'manager/card/global controls and data menu elements',
      checks: [
        'undefined internal operation keys do not fall back to links',
        'formation/card/global active state follows displayed panel',
        'bulk menu has the same five item definitions on manager and external pages',
        'external bulk selections navigate to the matching manager setting without button-only navigation',
        'normal routes omit the legacy recovery marker while preserving required query/hash values',
        'index forwarding and direct legacy-recover URLs remain usable after reload',
        'calc enemy preset and phase survive the ordinary enemy-data link',
        'opening data/bulk menus does not change active state',
        'data menu has three role=menuitem links',
        'Escape closes the menu and restores trigger focus',
        'PC operation controls share the reference geometry and note remains an independent link',
        'data detail pages use one common topbar, preserve native controls, and mark only their data destination',
        'saved dark/light and no-theme board states stay synchronized across reloads',
        'share page uses one common topbar, has no manager active state, keeps share images loaded, and avoids literal newline text'
      ]
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
