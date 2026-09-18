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
      current: element.getAttribute('aria-current') || ''
    })),
    dataItems: [...document.querySelectorAll('[data-topbar-menu="data"] [data-topbar-menu-item="data"]')].map(element => ({
      tag: element.tagName,
      role: element.getAttribute('role'),
      target: element.dataset.topbarDataTarget,
      label: element.textContent.trim(),
      href: element.getAttribute('href')
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
    await browser.clickSelector(cdp, page, '[data-topbar-bulk-target="rank"]');
    await browser.waitFor(async () => (await browser.evaluate(cdp, page, `document.querySelector('[data-setting-panel="rank"].is-active')?.dataset.settingPanel || ''`)) === 'rank');
    const rank = await readTopbar(cdp, page);
    assert.deepEqual(rank.active, ['manager', 'bulk'], `unexpected active operations: ${JSON.stringify(rank.operations)}`);
    assert.equal(await browser.evaluate(cdp, page, `document.querySelector('[data-topbar-bulk-target="rank"]')?.getAttribute('aria-current')`), 'location');

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
