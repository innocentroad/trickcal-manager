#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ROOT = path.resolve(process.env.APOSTLE_DATA_TEST_ROOT || PROJECT_ROOT);
const TEST_ROUTE = process.env.APOSTLE_DATA_TEST_ROUTE || '/public/apostle-data.html?apostleDataTest=1';
const SCREENSHOT_PREFIX = process.env.APOSTLE_DATA_TEST_PREFIX || 'apostle-data';
const MIME = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp'
};

function startServer(port) {
  return http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    const relative = pathname.replace(/^\/+/, '') || 'index.html';
    let file = path.resolve(ROOT, relative);
    const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : `${ROOT}${path.sep}`;
    if (file.startsWith(rootPrefix) && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (file !== ROOT && !file.startsWith(rootPrefix)) { response.writeHead(404); response.end('Not found'); return; }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(fs.readFileSync(file));
  }).listen(port, '127.0.0.1');
}

async function launchChrome(cdpPort, profileRoot) {
  const chrome = browser.startChild(browser.findChrome(), [
    `--user-data-dir=${profileRoot}`, `--remote-debugging-port=${cdpPort}`,
    '--remote-debugging-address=127.0.0.1', '--no-first-run', '--no-default-browser-check',
    '--disable-sync', '--disable-extensions', '--disable-background-networking',
    '--window-size=1280,900', '--new-window', 'about:blank'
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
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, page.sessionId);
  await browser.waitFor(async () => (await browser.evaluate(cdp, page, 'innerWidth')) === width, { timeoutMs: 5000 });
}

async function waitReady(cdp, page) {
  return browser.waitFor(async () => browser.evaluate(cdp, page, `(() =>
    !!document.querySelector('[data-apostle-view-title]')
      && document.querySelectorAll('[data-apostle-data-row]').length === 78
      && [...document.querySelectorAll('img[data-apostle-data-image]')].every(image => image.complete && image.naturalWidth > 0)
  )()`), { timeoutMs: 30000 });
}

async function openPage(cdp, origin, width, height, route = TEST_ROUTE) {
  const page = await browser.createPage(cdp, 'about:blank');
  await cdp.send('Page.enable', {}, page.sessionId);
  await setViewport(cdp, page, width, height);
  await cdp.send('Page.navigate', { url: `${origin}${route}` }, page.sessionId);
  await waitReady(cdp, page);
  return page;
}

async function facts(cdp, page) {
  return browser.evaluate(cdp, page, `(() => {
    const table = document.querySelector('[data-apostle-table]');
    const wrap = document.querySelector('[data-apostle-table-wrap]');
    const bar = document.querySelector('[data-apostle-bottom-bar]');
    const dataMenu = document.querySelector('[data-topbar-menu="data"]');
    const dataItems = [...document.querySelectorAll('[data-topbar-menu-item="data"]')];
    return {
      width: innerWidth,
      overflow: document.documentElement.scrollWidth - innerWidth,
      rows: document.querySelectorAll('[data-apostle-data-row]').length,
      images: [...document.querySelectorAll('img[data-apostle-data-image]')].map(image => ({ complete: image.complete, naturalWidth: image.naturalWidth, src: image.currentSrc || image.src })),
      view: document.querySelector('[data-apostle-view-title]')?.textContent.trim() || '',
      currentTabs: [...document.querySelectorAll('[data-apostle-view][aria-current="page"]')].map(button => button.dataset.apostleView),
      dataMenuItems: dataItems.map(item => ({ text: item.textContent.trim(), target: item.dataset.topbarDataTarget, active: item.classList.contains('is-active') })),
      dataMenuTarget: document.querySelector('.data-detail-topbar')?.dataset.sharedTopbarDataTarget || '',
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
      tableScroll: wrap ? { scrollWidth: wrap.scrollWidth, clientWidth: wrap.clientWidth } : null,
      tableRect: wrap ? (() => { const rect = wrap.getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom, height: rect.height, clientHeight: wrap.clientHeight, scrollHeight: wrap.scrollHeight }; })() : null,
      tableStyles: (() => {
        const header = table?.querySelector('thead th');
        const firstCell = table?.querySelector('tbody tr > :first-child');
        const intersection = table?.querySelector('thead tr > :first-child');
        return {
          headerPosition: header ? getComputedStyle(header).position : '',
          firstCellPosition: firstCell ? getComputedStyle(firstCell).position : '',
          headerBackground: header ? getComputedStyle(header).backgroundColor : '',
          firstCellBackground: firstCell ? getComputedStyle(firstCell).backgroundColor : '',
          headerZ: header ? Number(getComputedStyle(header).zIndex) : 0,
          firstCellZ: firstCell ? Number(getComputedStyle(firstCell).zIndex) : 0,
          intersectionZ: intersection ? Number(getComputedStyle(intersection).zIndex) : 0
        };
      })(),
      bodyVerticalOverflow: document.documentElement.scrollHeight - innerHeight,
      bar: bar ? { width: bar.getBoundingClientRect().width, height: bar.getBoundingClientRect().height, bottom: bar.getBoundingClientRect().bottom } : null,
      bottomPadding: parseFloat(getComputedStyle(document.body).paddingBottom) || 0,
      filterCount: document.querySelector('#apostle-data-count')?.textContent.trim() || '',
      filterDetailsOpen: document.querySelector('[data-apostle-filter-details]')?.open === true,
      filterExpanded: document.querySelector('#apostle-data-filter-toggle')?.getAttribute('aria-expanded') || '',
      filterButtonText: document.querySelector('#apostle-data-filter-toggle')?.textContent.trim() || '',
      filterSummary: document.querySelector('[data-apostle-filter-summary]')?.textContent.trim() || '',
      filterClearHidden: document.querySelector('#apostle-data-filter-clear')?.hidden === true,
      oldHeader: !!document.querySelector('.apostle-data-header'),
      toolbarRect: (() => { const element = document.querySelector('.apostle-data-toolbar'); const rect = element?.getBoundingClientRect(); return rect ? { top: rect.top, bottom: rect.bottom, height: rect.height } : null; })(),
      filterDetailsRect: (() => { const element = document.querySelector('[data-apostle-filter-details]'); const rect = element?.getBoundingClientRect(); return rect ? { left: rect.left, right: rect.right, width: rect.width, height: rect.height } : null; })(),
      filterGridRect: (() => { const element = document.querySelector('#apostle-data-filter-grid'); const rect = element?.getBoundingClientRect(); return rect ? { left: rect.left, right: rect.right, width: rect.width, height: rect.height, clientHeight: element.clientHeight, scrollHeight: element.scrollHeight } : null; })(),
      viewHeadingHidden: document.querySelector('[data-apostle-view-heading]')?.hidden === true,
      noteHidden: document.querySelector('#apostle-data-view-note')?.hidden === true,
      status: document.querySelector('#apostle-data-status-summary')?.textContent.trim() || '',
      headers: [...document.querySelectorAll('[data-apostle-thead] th')].map(cell => cell.textContent.trim()),
      theme: document.documentElement.dataset.theme || '',
      themeLabel: document.querySelector('[data-shared-theme-button]')?.getAttribute('aria-label') || '',
      title: document.title
    };
  })()`);
}

async function selectValue(cdp, page, selector, value) {
  await browser.evaluate(cdp, page, `(() => { const element = document.querySelector(${JSON.stringify(selector)}); element.value = ${JSON.stringify(String(value))}; element.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `document.querySelector(${JSON.stringify(selector)})?.value === ${JSON.stringify(String(value))}`), { timeoutMs: 5000 });
}

async function capture(cdp, page, filename) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
  fs.writeFileSync(path.join(PROJECT_ROOT, 'tmp', filename), Buffer.from(result.data, 'base64'));
}

async function run() {
  const serverPort = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([serverPort]);
  const server = startServer(serverPort);
  const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-apostle-data-'));
  let chrome = null;
  let cdp = null;
  const pages = [];
  try {
    const origin = `http://127.0.0.1:${serverPort}`;
    await browser.waitForHttp(`${origin}${TEST_ROUTE.split('?')[0]}`);
    ({ chrome, cdp } = await launchChrome(cdpPort, profileRoot));
    const responsive = {};
    const expandedResponsive = {};
    for (const variant of [
      { label: '320', width: 320, height: 844 }, { label: '375', width: 375, height: 844 },
      { label: '375-low', width: 375, height: 600 },
      { label: '720', width: 720, height: 900 }, { label: '721', width: 721, height: 900 },
      { label: '1280', width: 1280, height: 900 }
    ]) {
      const page = await openPage(cdp, origin, variant.width, variant.height);
      pages.push(page);
      const current = await facts(cdp, page);
      assert.equal(current.width, variant.width, `${variant.label}: viewport`);
      assert.ok(current.overflow <= 0, `${variant.label}: body横overflow ${current.overflow}`);
      assert.deepEqual(current.legacyTemplates, [], `${variant.label}: 旧操作templateがレイアウトDOMに残っています`);
      assert.ok(current.topbarGeometry?.height > 0, `${variant.label}: 共通上バーの実測高さ`);
      assert.equal(current.topbarGeometry.syncedHeight, Math.ceil(current.topbarGeometry.height), `${variant.label}: 高さ同期用変数`);
      assert.equal(current.rows, 78, `${variant.label}: 基礎行数`);
      assert.equal(current.images.every(image => image.complete && image.naturalWidth > 0), true, `${variant.label}: 画像読込`);
      assert.deepEqual(current.dataMenuItems.map(item => item.target), ['apostles', 'enemies', 'board'], `${variant.label}: dataメニュー`);
      assert.equal(current.dataMenuItems.filter(item => item.active).length, 1, `${variant.label}: data現在項目`);
      assert.equal(current.dataMenuItems[0].active, true, `${variant.label}: 使徒データ強調`);
      assert.deepEqual(current.currentTabs, ['basic'], `${variant.label}: 初期view`);
      assert.equal(current.filterDetailsOpen, false, `${variant.label}: 初期filter折畳み`);
      assert.equal(current.filterExpanded, 'false', `${variant.label}: filter aria-expanded`);
      assert.equal(current.filterButtonText, '絞り込み', `${variant.label}: compact filter label`);
      assert.equal(current.filterClearHidden, true, `${variant.label}: 初期解除非表示`);
      assert.equal(current.oldHeader, false, `${variant.label}: 旧大見出しを撤去`);
      assert.equal(current.view, '基礎設定', `${variant.label}: 操作帯の表示名`);
      assert.equal(current.viewHeadingHidden, true, `${variant.label}: 固有操作のない空行を残さない`);
      assert.equal(current.noteHidden, true, `${variant.label}: 基礎設定の内部説明を表示しない`);
      assert.ok(current.toolbarRect?.height > 0 && current.toolbarRect.height < 4.5 * 16, `${variant.label}: compact操作帯`);
      assert.ok(current.bar.bottom >= variant.height - 16, `${variant.label}: 下バー固定`);
      assert.ok(current.bottomPadding >= current.bar.height, `${variant.label}: 下バー余白`);
      assert.ok(current.bodyVerticalOverflow <= 1, `${variant.label}: 本文の二重縦overflow ${current.bodyVerticalOverflow}`);
      assert.ok(current.tableRect?.height > 0, `${variant.label}: 表領域の高さ`);
      assert.ok(current.tableRect.bottom <= current.bar.bottom - current.bar.height + 1, `${variant.label}: 表が下バー背後へ隠れています`);
      assert.equal(current.tableStyles.headerPosition, 'sticky', `${variant.label}: 見出しsticky`);
      assert.equal(current.tableStyles.firstCellPosition, 'sticky', `${variant.label}: 使徒列sticky`);
      assert.notEqual(current.tableStyles.headerBackground, 'rgba(0, 0, 0, 0)', `${variant.label}: 見出し背景透過`);
      assert.notEqual(current.tableStyles.firstCellBackground, 'rgba(0, 0, 0, 0)', `${variant.label}: 使徒列背景透過`);
      assert.ok(current.tableStyles.intersectionZ >= current.tableStyles.headerZ, `${variant.label}: 交差セルz-index`);
      if (variant.width <= 720) assert.equal(new Set(await browser.evaluate(cdp, page, '[...document.querySelectorAll("[data-topbar-operation]")].map(element => Math.round(element.getBoundingClientRect().top))')).size, 2, `${variant.label}: 上バー2段`);
      else assert.equal(new Set(await browser.evaluate(cdp, page, '[...document.querySelectorAll("[data-topbar-operation]")].map(element => Math.round(element.getBoundingClientRect().top))')).size, 1, `${variant.label}: 上バー1段`);
      responsive[variant.label] = current;
    }

    for (const variant of [
      { label: '375-expanded', width: 375, height: 844 },
      { label: '375-low-expanded', width: 375, height: 600 },
      { label: '375-very-low-expanded', width: 375, height: 480 },
      { label: '320-expanded', width: 320, height: 844 }
    ]) {
      const page = await openPage(cdp, origin, variant.width, variant.height);
      pages.push(page);
      await browser.clickSelector(cdp, page, '#apostle-data-filter-toggle');
      await browser.waitFor(async () => browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-filter-details]")?.open === true && document.querySelector("#apostle-data-filter-toggle")?.getAttribute("aria-expanded") === "true"'), { timeoutMs: 5000 });
      const expanded = await facts(cdp, page);
      assert.equal(expanded.filterDetailsOpen, true, `${variant.label}: filter展開`);
      assert.equal(expanded.filterExpanded, 'true', `${variant.label}: filter aria-expanded`);
      assert.ok(expanded.filterDetailsRect?.width >= variant.width - 24, `${variant.label}: filterをページ幅へ展開`);
      assert.ok(expanded.filterDetailsRect?.right <= variant.width + 1, `${variant.label}: filter右端をviewport内へ収める`);
      assert.ok(expanded.filterGridRect?.width >= variant.width - 40, `${variant.label}: 条件欄の幅`);
      assert.ok(expanded.filterGridRect?.right <= variant.width + 1, `${variant.label}: 条件欄右端をviewport内へ収める`);
      assert.ok(expanded.filterGridRect?.height > 0, `${variant.label}: 条件欄の表示領域`);
      assert.ok(expanded.tableRect?.height >= 64, `${variant.label}: 展開後も表領域を確保`);
      assert.ok(expanded.tableRect.bottom <= expanded.bar.bottom - expanded.bar.height + 1, `${variant.label}: 展開後の表が下バー背後へ隠れています`);
      assert.ok(expanded.bodyVerticalOverflow <= 1, `${variant.label}: 展開後の本文overflow ${expanded.bodyVerticalOverflow}`);
      const filterReachability = await browser.evaluate(cdp, page, `(() => {
        const grid = document.querySelector('#apostle-data-filter-grid');
        const labels = [...(grid?.querySelectorAll('label') || [])];
        if (!grid) return { count: 0, all: false, lower: false };
        const gridOffsetTop = grid.offsetTop;
        const checks = labels.map(label => {
          grid.scrollTop = Math.max(0, label.offsetTop - gridOffsetTop);
          const rect = label.getBoundingClientRect();
          const gridRect = grid.getBoundingClientRect();
          return { text: label.textContent.trim(), offsetTop: label.offsetTop, scrollTop: grid.scrollTop, top: rect.top, bottom: rect.bottom, gridTop: gridRect.top, gridBottom: gridRect.bottom };
        });
        grid.scrollTop = 0;
        return { count: labels.length, all: checks.every(check => check.top >= check.gridTop - 1 && check.bottom <= check.gridBottom + 1), lower: checks.slice(-2).every(check => check.top >= check.gridTop - 1 && check.bottom <= check.gridBottom + 1) };
      })()`);
      assert.equal(filterReachability.count, 6, `${variant.label}: 全条件のDOM要素`);
      assert.equal(filterReachability.all, true, `${variant.label}: 全条件へスクロール到達 ${JSON.stringify(filterReachability)}`);
      assert.equal(filterReachability.lower, true, `${variant.label}: 攻撃タイプ・配置列へ到達 ${JSON.stringify(filterReachability)}`);
      if (variant.height <= 600) assert.ok((expanded.filterGridRect?.scrollHeight || 0) >= (expanded.filterGridRect?.clientHeight || 0), `${variant.label}: 条件欄の内部スクロール計測`);
      expandedResponsive[variant.label] = {
        tableHeight: expanded.tableRect?.height || 0,
        filterDetailsWidth: expanded.filterDetailsRect?.width || 0,
        filterGridHeight: expanded.filterGridRect?.height || 0,
        filterGridScrollHeight: expanded.filterGridRect?.scrollHeight || 0,
        bodyVerticalOverflow: expanded.bodyVerticalOverflow
      };
      if (variant.label === '375-low-expanded') await capture(cdp, page, `${SCREENSHOT_PREFIX}-basic-filter-expanded-375-600.png`);
      if (variant.label === '375-very-low-expanded') await capture(cdp, page, `${SCREENSHOT_PREFIX}-basic-filter-expanded-375-480.png`);
      await browser.clickSelector(cdp, page, '#apostle-data-filter-toggle');
      const closed = await facts(cdp, page);
      assert.equal(closed.filterDetailsOpen, false, `${variant.label}: 再折畳み`);
      assert.ok(closed.tableRect?.height > 0, `${variant.label}: 再折畳み後の表領域`);
    }

    for (const view of ['equipment', 'board', 'aside', 'rank']) {
      const directPage = await openPage(cdp, origin, 375, 844, `${TEST_ROUTE}&view=${view}`);
      pages.push(directPage);
      const directFacts = await facts(cdp, directPage);
      assert.equal(directFacts.filterDetailsOpen, false, `view=${view}: 初期filter折畳み`);
      assert.equal(directFacts.filterExpanded, 'false', `view=${view}: filter aria-expanded`);
    }

    const page = await openPage(cdp, origin, 375, 844);
    pages.push(page);
    const initialTheme = (await facts(cdp, page)).theme;
    await browser.clickSelector(cdp, page, '[data-shared-theme-button]');
    const darkTheme = await facts(cdp, page);
    assert.notEqual(darkTheme.theme, initialTheme, 'テーマ切替で本文状態を更新');
    assert.ok(darkTheme.themeLabel, 'テーマ切替のaria-label');
    await browser.clickSelector(cdp, page, '[data-shared-theme-button]');
    assert.equal((await facts(cdp, page)).theme, initialTheme, 'テーマを元へ戻す');
    const basicFacts = await facts(cdp, page);
    assert.deepEqual(basicFacts.headers.slice(0, 10), ['使徒', 'レア度', 'エルダイン', '性格', '種族', '役割', '攻撃タイプ', '配置列', '初期SP', '毎秒SP回復量'], '基礎設定の既存列を維持');
    assert.deepEqual(basicFacts.headers.slice(10), ['HP等級', '物理攻撃力等級', '魔法攻撃力等級', '物理防御力等級', '魔法防御力等級', '会心等級', '会心DMG等級', '会心抵抗等級', '会心DMG抵抗等級', '戦闘力補正値A', '戦闘力補正値B'], '基礎設定の等級・補正値列');
    const basicDataFacts = await browser.evaluate(cdp, page, `(() => {
      const rows = [...document.querySelectorAll('[data-apostle-data-row]')];
      const headerIndex = Object.fromEntries([...document.querySelectorAll('[data-apostle-thead] th')].map((cell, index) => [cell.textContent.trim(), index]));
      const get = (id, label) => rows.find(row => row.dataset.apostleDataRow === id)?.children[headerIndex[label]]?.textContent.trim() || '';
      return {
        amelia: {
          magicAttackTier: get('Amelia', '魔法攻撃力等級'),
          physicalAttackTier: get('Amelia', '物理攻撃力等級'),
          correctionA: get('Amelia', '戦闘力補正値A'),
          correctionB: get('Amelia', '戦闘力補正値B')
        },
        aya: { physicalAttackTier: get('Aya', '物理攻撃力等級'), magicAttackTier: get('Aya', '魔法攻撃力等級') },
        correctionZero: window.__TRICKCAL_APOSTLE_DATA_TESTING__?.basicDisplayValue(0, { dataKey: '戦闘力補正値A' }) || ''
      };
    })()`);
    assert.equal(basicDataFacts.amelia.magicAttackTier, '', '魔法型で非対応の魔法攻撃等級を空欄');
    assert.notEqual(basicDataFacts.amelia.physicalAttackTier, '', '魔法型で物理攻撃等級を表示');
    assert.equal(basicDataFacts.amelia.correctionA, '90', '戦闘力補正値Aをそのまま表示');
    assert.equal(basicDataFacts.amelia.correctionB, '0.525', '戦闘力補正値Bの小数を保持');
    assert.equal(basicDataFacts.aya.physicalAttackTier, '', '物理型で非対応の物理攻撃等級を空欄');
    assert.notEqual(basicDataFacts.aya.magicAttackTier, '', '物理型で魔法攻撃等級を表示');
    assert.equal(basicDataFacts.correctionZero, '0', '隔離fixture:戦闘力補正値Aの0を表示');
    await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-sort=\\"combatPowerB\\"]")?.click()');
    const correctionSort = await browser.evaluate(cdp, page, `(() => {
      const headerIndex = [...document.querySelectorAll('[data-apostle-thead] th')].findIndex(cell => cell.textContent.trim() === '戦闘力補正値B');
      return [...document.querySelectorAll('[data-apostle-data-row]')].map(row => Number(row.children[headerIndex]?.textContent.trim())).filter(Number.isFinite);
    })()`);
    assert.ok(correctionSort.every((value, index) => index === 0 || correctionSort[index - 1] <= value), '戦闘力補正値Bを数値順にソート');
    await capture(cdp, page, `${SCREENSHOT_PREFIX}-basic-filter-collapsed-375.png`);
    await browser.evaluate(cdp, page, 'document.querySelector("#apostle-data-filter-toggle")?.click()');
    await browser.waitFor(async () => browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-filter-details]")?.open === true'), { timeoutMs: 5000 });
    const expandedBefore = await facts(cdp, page);
    assert.equal(expandedBefore.filterExpanded, 'true', 'filter展開aria-expanded');
    assert.ok(expandedBefore.tableRect.height < basicFacts.tableRect.height, 'filter展開で表領域を縮小');
    await capture(cdp, page, `${SCREENSHOT_PREFIX}-basic-filter-expanded-375.png`);
    await browser.evaluate(cdp, page, `document.querySelector('#apostle-data-search').value = 'Amelia'; document.querySelector('#apostle-data-search').dispatchEvent(new Event('input', { bubbles: true }));`);
    await browser.evaluate(cdp, page, 'document.querySelector("#apostle-data-filter-toggle")?.click()');
    const collapsedFiltered = await facts(cdp, page);
    assert.equal(collapsedFiltered.filterDetailsOpen, false, 'filter再折畳み');
    assert.equal(collapsedFiltered.rows, 1, '閉じても検索結果を維持');
    assert.equal(collapsedFiltered.filterSummary, '絞り込み中', '閉じたfilterの適用表示');
    assert.equal(collapsedFiltered.filterClearHidden, false, '条件適用中は解除を表示');
    await browser.clickSelector(cdp, page, '#apostle-data-filter-clear');
    const cleared = await facts(cdp, page);
    assert.equal(cleared.rows, 78, '閉じたfilterを0件から解除');
    assert.equal(cleared.filterSummary, '', '解除で適用表示を消す');
    assert.equal(cleared.filterDetailsOpen, false, '解除でfilterを勝手に展開しない');
    const filterA11y = await browser.evaluate(cdp, page, `(() => {
      const details = document.querySelector('[data-apostle-filter-details]');
      const toggle = document.querySelector('#apostle-data-filter-toggle');
      return { tag: toggle?.tagName || '', controls: toggle?.getAttribute('aria-controls') || '', gridId: document.querySelector('#apostle-data-filter-grid')?.id || '', open: details?.open === true };
    })()`);
    assert.deepEqual(filterA11y, { tag: 'SUMMARY', controls: 'apostle-data-filter-grid', gridId: 'apostle-data-filter-grid', open: false }, 'filter開閉のDOM/ARIA接続');
    await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-filter-details]").open = true; document.querySelector("#apostle-data-search")?.focus(); document.querySelector("[data-apostle-filter-details]").open = false');
    await browser.waitFor(async () => browser.evaluate(cdp, page, 'document.activeElement?.id === "apostle-data-filter-toggle"'), { timeoutMs: 5000 });
    await browser.clickSelector(cdp, page, '[data-apostle-view="equipment"]');
    let current = await facts(cdp, page);
    assert.equal(current.view, '装備等級', '装備view切替');
    const equipmentCellFacts = await browser.evaluate(cdp, page, `(() => {
      const row = document.querySelector('[data-apostle-data-row="Amelia"]');
      return {
        apostleText: row?.querySelector('th')?.textContent.trim() || '',
        apostleHasId: !!row?.querySelector('th small'),
        magicAttackText: row?.querySelector('td:nth-child(4)')?.textContent.trim() || '',
        magicAttackHasControl: !!row?.querySelector('td:nth-child(4) button'),
        widths: [...document.querySelectorAll('[data-apostle-data-row="Amelia"] td')].map(cell => Math.round(cell.getBoundingClientRect().width)),
        equipmentButtons: document.querySelectorAll('[data-apostle-equipment-open]').length
      };
    })()`);
    assert.equal(equipmentCellFacts.apostleHasId, false, '使徒セルにIDを表示しない');
    assert.ok(equipmentCellFacts.apostleText.includes('アメリア'), '使徒セルに日本語名を表示');
    assert.equal(equipmentCellFacts.magicAttackText, '', '魔法攻撃の0段階を空欄');
    assert.equal(equipmentCellFacts.magicAttackHasControl, false, '非対応の魔法攻撃セルに操作を表示しない');
    assert.ok(equipmentCellFacts.widths.length === 7 && Math.max(...equipmentCellFacts.widths) - Math.min(...equipmentCellFacts.widths) <= 1, '装備列を等幅化');
    assert.ok(equipmentCellFacts.equipmentButtons > 0, '装備画像ボタンを生成');
    const equipmentBadge = await browser.evaluate(cdp, page, `(() => {
      const badge = document.querySelector('[data-apostle-data-row] .apostle-data-tier-badge');
      const image = badge?.closest('.apostle-data-icon-wrap')?.querySelector('img');
      if (!badge || !image) return null;
      const badgeRect = badge.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      const cellText = badge.closest('td')?.textContent || '';
      return {
        text: badge.textContent.trim(),
        hasTierLabelBelowImage: cellText.includes('等級1'),
        overlaysBottomRight: badgeRect.right >= imageRect.right - 1 && badgeRect.bottom >= imageRect.bottom - 1 && badgeRect.left < imageRect.right && badgeRect.top < imageRect.bottom
      };
    })()`);
    assert.equal(equipmentBadge?.text, '1', '装備等級バッジの数字');
    assert.equal(equipmentBadge?.hasTierLabelBelowImage, false, '画像下の等級ラベルを表示しない');
    assert.equal(equipmentBadge?.overlaysBottomRight, true, '装備等級バッジの右下重ね表示');
    const openerSelector = '[data-apostle-equipment-open]';
    await browser.evaluate(cdp, page, `document.querySelector(${JSON.stringify(openerSelector)})?.click()`);
    const dialogFacts = await browser.evaluate(cdp, page, `(() => ({
      open: document.querySelector('#apostle-data-equipment-dialog')?.open === true,
      text: document.querySelector('[data-apostle-equipment-dialog-body]')?.textContent || '',
      focus: document.activeElement?.getAttribute('data-apostle-equipment-dialog-close') !== null
    }))()`);
    assert.equal(dialogFacts.open, true, '装備詳細dialogを開く');
    assert.match(dialogFacts.text, /赤いエプロン|Rank|等級|未強化|＋5/, '装備詳細の内容');
    assert.equal(dialogFacts.focus, true, 'dialog初期フォーカス');
    await capture(cdp, page, `${SCREENSHOT_PREFIX}-equipment-dialog-375.png`);
    await browser.evaluate(cdp, page, 'document.querySelector("#apostle-data-equipment-dialog").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))');
    const closedDialog = await browser.evaluate(cdp, page, `(() => ({
      open: document.querySelector('#apostle-data-equipment-dialog')?.open === true,
      restored: document.activeElement?.matches('[data-apostle-equipment-open]') === true
    }))()`);
    assert.equal(closedDialog.open, false, 'Escapeで装備詳細を閉じる');
    assert.equal(closedDialog.restored, true, '装備詳細のフォーカス復帰');
    await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-equipment-open]")?.click()');
    await selectValue(cdp, page, '#apostle-data-equipment-rank', '2');
    assert.equal(await browser.evaluate(cdp, page, 'document.querySelector("#apostle-data-equipment-dialog")?.open === true'), false, 'Rank変更で古い装備詳細を閉じる');
    await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-equipment-open]")?.click()');
    await browser.evaluate(cdp, page, 'document.querySelector("#apostle-data-search").value = "Amelia"; document.querySelector("#apostle-data-search").dispatchEvent(new Event("input", { bubbles: true }));');
    assert.equal(await browser.evaluate(cdp, page, 'document.querySelector("#apostle-data-equipment-dialog")?.open === true'), false, '検索変更で古い装備詳細を閉じる');
    await browser.clickSelector(cdp, page, '#apostle-data-filter-clear');
    await capture(cdp, page, `${SCREENSHOT_PREFIX}-equipment-375.png`);
    await selectValue(cdp, page, '#apostle-data-equipment-rank', '2');
    assert.match(await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-table] caption")?.textContent || ""'), /Rank 2/, '装備Rank切替');

    await browser.clickSelector(cdp, page, '[data-apostle-view="board"]');
    current = await facts(cdp, page);
    assert.equal(current.view, 'ボード等級', 'ボードview切替');
    assert.match(current.status, /一意/); assert.match(await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-data-row] a")?.getAttribute("href") || ""'), /board-layout-preview|data\/boards/);
    await browser.evaluate(cdp, page, 'history.back()');
    await browser.waitFor(async () => browser.evaluate(cdp, page, 'new URL(location.href).searchParams.get("view") === "equipment"'), { timeoutMs: 5000 });

    await browser.clickSelector(cdp, page, '[data-apostle-view="aside"]');
    current = await facts(cdp, page);
    assert.match(current.status, /登録/); assert.match(await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-data-row]")?.innerText || ""'), /等級/);
    await browser.clickSelector(cdp, page, '[data-apostle-option="asideExpanded"]');
    assert.match(await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-table] caption")?.textContent || ""'), /補助値表示/);

    await browser.clickSelector(cdp, page, '[data-apostle-view="rank"]');
    assert.match(await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-table] caption")?.textContent || ""'), /Rank 1→2/);
    await selectValue(cdp, page, '#apostle-data-rank-transition', '2-3');
    assert.match(await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-table] caption")?.textContent || ""'), /Rank 2→3/);

    await browser.evaluate(cdp, page, 'document.querySelector("#apostle-data-search").value = "not-found"; document.querySelector("#apostle-data-search").dispatchEvent(new Event("input", { bubbles: true }));');
    assert.equal((await facts(cdp, page)).rows, 0, '検索0件');
    await browser.clickSelector(cdp, page, '#apostle-data-filter-clear');
    assert.equal((await facts(cdp, page)).rows, 78, '検索解除');

    await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-view=board]").click()');
    const fixture = await browser.evaluate(cdp, page, `(() => {
      const test = window.__TRICKCAL_APOSTLE_DATA_TESTING__;
      if (!test) return null;
      return {
        known: test.inferBoardTierStatus([{マス_type:'通常',効果1_type:'HP',効果1_value:50},{マス_type:'通常',効果1_type:'HP',効果1_value:99}], 'HP', 'hp'),
        unknown: test.inferBoardTierStatus([], 'HP', 'hp'),
        inconsistent: test.inferBoardTierStatus([{マス_type:'通常',効果1_type:'HP',効果1_value:50},{マス_type:'通常',効果1_type:'HP',効果1_value:123}], 'HP', 'hp'),
        hiddenAttackValues: [0, '0', '', null, undefined].map(value => test.isHiddenAttackValue(value)),
        visibleAttackValue: test.isHiddenAttackValue(1)
      };
    })()`);
    assert.equal(fixture.known.status, 'known', '隔離fixture:一意判定');
    assert.equal(fixture.unknown.status, 'unknown', '隔離fixture:不明');
    assert.equal(fixture.inconsistent.status, 'inconsistent', '隔離fixture:不整合');
    assert.deepEqual(fixture.hiddenAttackValues, [true, true, true, true, true], '隔離fixture:攻撃0/空欄を空欄化');
    assert.equal(fixture.visibleAttackValue, false, '隔離fixture:攻撃の有効値は維持');

    await capture(cdp, page, `${SCREENSHOT_PREFIX}-375.png`);
    const desktop = await openPage(cdp, origin, 1280, 900);
    pages.push(desktop);
    await browser.clickSelector(cdp, desktop, '[data-apostle-view="equipment"]');
    await capture(cdp, desktop, `${SCREENSHOT_PREFIX}-equipment-1280.png`);
    await browser.clickSelector(cdp, desktop, '[data-apostle-view="basic"]');
    await capture(cdp, desktop, `${SCREENSHOT_PREFIX}-1280.png`);
    console.log(JSON.stringify({ ok: true, responsive, expandedResponsive, screenshots: [`tmp/${SCREENSHOT_PREFIX}-basic-filter-collapsed-375.png`, `tmp/${SCREENSHOT_PREFIX}-basic-filter-expanded-375.png`, `tmp/${SCREENSHOT_PREFIX}-basic-filter-expanded-375-600.png`, `tmp/${SCREENSHOT_PREFIX}-basic-filter-expanded-375-480.png`, `tmp/${SCREENSHOT_PREFIX}-equipment-375.png`, `tmp/${SCREENSHOT_PREFIX}-equipment-dialog-375.png`, `tmp/${SCREENSHOT_PREFIX}-equipment-1280.png`, `tmp/${SCREENSHOT_PREFIX}-375.png`, `tmp/${SCREENSHOT_PREFIX}-1280.png`], fixture }, null, 2));
  } finally {
    try { await cdp?.disconnect(); } catch {}
    try { chrome?.kill(); } catch {}
    try { server.close(); } catch {}
    try { fs.rmSync(profileRoot, { recursive: true, force: true }); } catch {}
  }
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
