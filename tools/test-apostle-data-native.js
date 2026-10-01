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
const EXPECTED_APOSTLE_ROWS = 79;
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
      && document.querySelectorAll('[data-apostle-data-row]').length === ${EXPECTED_APOSTLE_ROWS}
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
      joanne: (() => {
        const row = document.querySelector('[data-apostle-data-row="Joanne"]');
        const image = row?.querySelector('img[data-apostle-data-image]');
        return { present: !!row, name: row?.innerText || '', imageLoaded: !!image && image.complete && image.naturalWidth > 0 };
      })(),
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

async function tableGeometry(cdp, page) {
  return browser.evaluate(cdp, page, `(() => {
    const wrap = document.querySelector('[data-apostle-table-wrap]');
    const rect = wrap.getBoundingClientRect();
    const rows = [...document.querySelectorAll('[data-apostle-data-row]')];
    const columns = [...document.querySelectorAll('[data-apostle-thead] th')];
    return { rowHeight: rows[0]?.getBoundingClientRect().height || 0,
      visibleRows: rows.filter(row => { const r = row.getBoundingClientRect(); return r.top >= rect.top && r.bottom <= rect.bottom; }).length,
      visibleColumns: columns.filter(cell => { const r = cell.getBoundingClientRect(); return r.left >= rect.left && r.right <= rect.right; }).length,
      firstWidth: columns[0]?.getBoundingClientRect().width || 0,
      scrollWidth: wrap.scrollWidth, clientWidth: wrap.clientWidth };
  })()`);
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
      assert.equal(current.rows, EXPECTED_APOSTLE_ROWS, `${variant.label}: 基礎行数`);
      assert.equal(current.joanne.present, true, `${variant.label}: 使徒データにジョアン`);
      assert.match(current.joanne.name, /ジョアン/, `${variant.label}: ジョアン日本語名`);
      assert.equal(current.joanne.imageLoaded, true, `${variant.label}: ジョアン画像`);
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

    const viewGeometry = {};
    for (const view of ['equipment', 'board', 'aside', 'rank']) {
      const directPage = await openPage(cdp, origin, 375, 844, `${TEST_ROUTE}&view=${view}`);
      pages.push(directPage);
      const directFacts = await facts(cdp, directPage);
      assert.equal(directFacts.filterDetailsOpen, false, `view=${view}: 初期filter折畳み`);
      assert.equal(directFacts.filterExpanded, 'false', `view=${view}: filter aria-expanded`);
      viewGeometry[`375-${view}`] = await tableGeometry(cdp, directPage);
      assert.ok(viewGeometry[`375-${view}`].rowHeight <= 70, `${view}:通常行を70px以下に整理`);
      if (view === 'equipment') {
        const badge = await browser.evaluate(cdp, directPage, `(() => { const b=document.querySelector('.apostle-data-tier-badge'); const c=b?.closest('td'); const s=b&&getComputedStyle(b); return { tier:b?.dataset.tier, background:s?.backgroundColor, color:s?.color, stroke:s?.webkitTextStrokeWidth, align:c&&getComputedStyle(c).textAlign }; })()`);
        assert.ok(['1','2','3','4','5'].includes(badge.tier), '装備の元データ等級を表示');
        assert.equal(badge.background, 'rgba(0, 0, 0, 0)', '装備等級数字に背景を置かない');
        assert.equal(badge.stroke, '2px', '数字の縁取りを維持');
        assert.equal(badge.align, 'center', '装備セルを中央揃え');
        const tierColors = await browser.evaluate(cdp, directPage, `(() => Object.fromEntries([...document.querySelectorAll('.apostle-data-tier-badge')].map(b => [b.dataset.tier, getComputedStyle(b).color])))()`);
        assert.ok(new Set(Object.values(tierColors)).size >= 3, '装備等級ごとに判別できる文字色');
      }
      await capture(cdp, directPage, `${SCREENSHOT_PREFIX}-${view}-375-initial.png`);
      await browser.clickSelector(cdp, directPage, '[data-shared-theme-button]');
      await capture(cdp, directPage, `${SCREENSHOT_PREFIX}-${view}-375-opposite-theme.png`);
      await browser.clickSelector(cdp, directPage, '[data-shared-theme-button]');
      if (view === 'aside') {
        await browser.clickSelector(cdp, directPage, '[data-apostle-option="asideExpanded"]');
        await capture(cdp, directPage, `${SCREENSHOT_PREFIX}-aside-375-expanded.png`);
        await browser.evaluate(cdp, directPage, `document.querySelector('[data-apostle-table-wrap]').scrollLeft = document.querySelector('[data-apostle-table-wrap]').scrollWidth`);
        await capture(cdp, directPage, `${SCREENSHOT_PREFIX}-aside-375-expanded-magic-defense.png`);
        await browser.clickSelector(cdp, directPage, '[data-shared-theme-button]');
        await capture(cdp, directPage, `${SCREENSHOT_PREFIX}-aside-375-expanded-magic-defense-opposite-theme.png`);
      }
    }

    const page = await openPage(cdp, origin, 375, 844);
    pages.push(page);
    const initialTheme = (await facts(cdp, page)).theme;
    await browser.clickSelector(cdp, page, '[data-shared-theme-button]');
    const darkTheme = await facts(cdp, page);
    assert.notEqual(darkTheme.theme, initialTheme, 'テーマ切替で本文状態を更新');
    assert.ok(darkTheme.themeLabel, 'テーマ切替のaria-label');
    await capture(cdp, page, `${SCREENSHOT_PREFIX}-basic-375-opposite-theme.png`);
    await browser.clickSelector(cdp, page, '[data-shared-theme-button]');
    assert.equal((await facts(cdp, page)).theme, initialTheme, 'テーマを元へ戻す');
    const basicFacts = await facts(cdp, page);
    viewGeometry['375-basic'] = await tableGeometry(cdp, page);
    const basicHeaders = await browser.evaluate(cdp, page, `[...document.querySelectorAll('[data-apostle-thead] th')].map(cell => cell.getAttribute('aria-label') || cell.textContent.trim())`);
    assert.deepEqual(basicHeaders.slice(0, 10), ['使徒', 'レア度', 'エルダイン', '性格', '種族', '役割', '攻撃タイプ', '配置列', '初期SP', '毎秒SP回復量'], '基礎設定の既存列を維持');
    assert.deepEqual(basicHeaders.slice(10), ['HP等級', '物理攻撃力等級', '魔法攻撃力等級', '物理防御力等級', '魔法防御力等級', '会心等級', '会心DMG等級', '会心抵抗等級', '会心DMG抵抗等級', '攻撃速度基礎', '戦闘力補正値'], '基礎設定は攻撃速度基礎・戦闘力補正値を表示し、計算用4係数は表示しない');
    const compact = await browser.evaluate(cdp, page, `(() => {
      const row = document.querySelector('[data-apostle-data-row="Amelia"]');
      const image = row.querySelector('.apostle-data-apostle-image-wrap').getBoundingClientRect();
      const name = row.querySelector('.apostle-data-apostle-name').getBoundingClientRect();
      const headers = [...document.querySelectorAll('[data-apostle-thead] th[data-apostle-column]')];
      return { imageBottom: image.bottom, nameTop: name.top, firstWidth: row.firstElementChild.getBoundingClientRect().width,
        headerImagesLoaded: headers.flatMap(cell => [...cell.querySelectorAll('img')]).every(img => img.complete && img.naturalWidth > 0),
        iconSources: Object.fromEntries(headers.map(cell => [cell.dataset.apostleColumn, cell.querySelector('img')?.getAttribute('src') || ''])),
        columnWidths: Object.fromEntries(headers.map(cell => [cell.dataset.apostleColumn, cell.getBoundingClientRect().width])),
        numericAligned: getComputedStyle(row.querySelector('[data-apostle-column="initialSP"]')).textAlign,
        textAligned: getComputedStyle(row.querySelector('[data-apostle-column="personality"]')).textAlign,
        numericUnclipped: [...document.querySelectorAll('[data-apostle-data-row] td:nth-child(n+9)')].every(cell => cell.scrollWidth <= cell.clientWidth + 1),
        nameTitle: row.querySelector('.apostle-data-apostle-cell').title,
        allNamesAvailable: [...document.querySelectorAll('.apostle-data-apostle-cell')].every(cell => cell.title === cell.querySelector('img')?.alt && cell.title.length > 0),
        lineClamp: getComputedStyle(row.querySelector('.apostle-data-apostle-name')).webkitLineClamp };
    })()`);
    assert.ok(compact.imageBottom <= compact.nameTop, '使徒画像の下に名前');
    assert.ok(compact.firstWidth < 120, '使徒列の幅を圧縮');
    assert.equal(compact.headerImagesLoaded, true, '基礎見出し画像の読込');
    assert.match(compact.iconSources.initialSP, /\/img\/SP\.webp$/);
    assert.match(compact.iconSources.spRegen, /\/img\/SP回復\.webp$/);
    assert.match(compact.iconSources.baseAttackSpeed, /\/img\/攻撃速度\.webp$/, '攻撃速度画像');
    assert.match(compact.iconSources.combatPowerCorrection, /\/img\/c_pow\.webp$/, '戦闘力画像');
    assert.ok(compact.columnWidths.hpTier < 65, '等級列の左右余白を縮める');
    assert.ok(compact.columnWidths.hpTier < compact.columnWidths.attackType, '列幅を一律にせず意味に合わせる');
    assert.equal(compact.numericAligned, 'center', '数値列を中央揃え');
    assert.equal(compact.textAligned, 'center', '文字の値列も中央揃え');
    assert.equal(compact.numericUnclipped, true, '最大数値も省略・欠けなし');
    assert.equal(compact.nameTitle, 'アメリア', '省略時も正式名を確認できる');
    assert.equal(compact.allNamesAvailable, true, '長い名前も正式名を確認できる');
    assert.equal(compact.lineClamp, '2', '名前は最大2行');
    const help = '[data-apostle-header-help="HP等級"]';
    await browser.clickSelector(cdp, page, help);
    const helpOpen = await browser.evaluate(cdp, page, `(() => { const box = document.querySelector('#apostle-data-header-help'); const r = box.getBoundingClientRect(); return { text: box.textContent, hidden: box.hidden, left: r.left, right: r.right, top: r.top, bottom: r.bottom }; })()`);
    assert.equal(helpOpen.text, 'HP等級');
    assert.equal(helpOpen.hidden, false, 'クリックで説明を開く');
    assert.ok(helpOpen.left >= 0 && helpOpen.right <= 375 && helpOpen.top >= 0 && helpOpen.bottom <= 844, '説明が画面内に収まる');
    await browser.evaluate(cdp, page, `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    assert.equal(await browser.evaluate(cdp, page, `document.querySelector('#apostle-data-header-help').hidden`), true, 'Escapeで説明を閉じる');
    await browser.evaluate(cdp, page, `document.querySelector('#apostle-data-filter-toggle').focus(); document.querySelector('[data-apostle-header-help="HP等級"]').focus()`);
    const focusHelp = await browser.evaluate(cdp, page, `({ hidden: document.querySelector('#apostle-data-header-help').hidden, active: document.activeElement?.outerHTML, scrollLeft: document.querySelector('[data-apostle-table-wrap]').scrollLeft })`);
    assert.equal(focusHelp.hidden, false, `キーボードフォーカスで説明を表示: ${JSON.stringify(focusHelp)}`);
    await browser.clickSelector(cdp, page, '#apostle-data-count');
    assert.equal(await browser.evaluate(cdp, page, `document.querySelector('#apostle-data-header-help').hidden`), true, '外側操作で説明を閉じる');
    const edgeHelp = await browser.evaluate(cdp, page, `(() => {
      const wrap = document.querySelector('[data-apostle-table-wrap]');
      wrap.scrollLeft = wrap.scrollWidth;
      const button = document.querySelector('[data-apostle-header-help="戦闘力補正値"]');
      button.focus();
      const rect = document.querySelector('#apostle-data-header-help').getBoundingClientRect();
      return { left: rect.left, right: rect.right, text: document.querySelector('#apostle-data-header-help').textContent };
    })()`);
    assert.equal(edgeHelp.text, '戦闘力補正値');
    assert.ok(edgeHelp.left >= 0 && edgeHelp.right <= 375, '右端の説明も画面内');
    await capture(cdp, page, `${SCREENSHOT_PREFIX}-basic-right-help-375.png`);
    await browser.evaluate(cdp, page, `document.querySelector('[data-apostle-table-wrap]').scrollLeft = 0`);
    const basicDataFacts = await browser.evaluate(cdp, page, `(() => {
      const rows = [...document.querySelectorAll('[data-apostle-data-row]')];
      const headerIndex = Object.fromEntries([...document.querySelectorAll('[data-apostle-thead] th')].map((cell, index) => [cell.getAttribute('aria-label') || cell.textContent.trim(), index]));
      const get = (id, label) => rows.find(row => row.dataset.apostleDataRow === id)?.children[headerIndex[label]]?.textContent.trim() || '';
      return {
        amelia: {
          magicAttackTier: get('Amelia', '魔法攻撃力等級'),
          physicalAttackTier: get('Amelia', '物理攻撃力等級'),
          speed: get('Amelia', '攻撃速度基礎'),
          correction: get('Amelia', '戦闘力補正値')
        },
        aya: { physicalAttackTier: get('Aya', '物理攻撃力等級'), magicAttackTier: get('Aya', '魔法攻撃力等級') },
        correctionZero: window.__TRICKCAL_APOSTLE_DATA_TESTING__?.basicDisplayValue(0, { dataKey: '戦闘力補正値' }) || ''
      };
    })()`);
    assert.equal(basicDataFacts.amelia.magicAttackTier, '', '魔法型で非対応の魔法攻撃等級を空欄');
    assert.notEqual(basicDataFacts.amelia.physicalAttackTier, '', '魔法型で物理攻撃等級を表示');
    assert.equal(basicDataFacts.amelia.speed, '100', '攻撃速度基礎を表示');
    assert.equal(basicDataFacts.amelia.correction, '0.525', '戦闘力補正値の小数を保持');
    assert.equal(basicDataFacts.aya.physicalAttackTier, '', '物理型で非対応の物理攻撃等級を空欄');
    assert.notEqual(basicDataFacts.aya.magicAttackTier, '', '物理型で魔法攻撃等級を表示');
    assert.equal(basicDataFacts.correctionZero, '0', '隔離fixture:戦闘力補正値の0を表示');
    await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-sort=\\"combatPowerCorrection\\"]")?.click()');
    const correctionSort = await browser.evaluate(cdp, page, `(() => {
      const headerIndex = [...document.querySelectorAll('[data-apostle-thead] th')].findIndex(cell => cell.getAttribute('aria-label') === '戦闘力補正値');
      return [...document.querySelectorAll('[data-apostle-data-row]')].map(row => Number(row.children[headerIndex]?.textContent.trim())).filter(Number.isFinite);
    })()`);
    assert.ok(correctionSort.every((value, index) => index === 0 || correctionSort[index - 1] <= value), '戦闘力補正値を数値順にソート');
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
    assert.equal(cleared.rows, EXPECTED_APOSTLE_ROWS, '閉じたfilterを0件から解除');
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
    await browser.clickSelector(cdp, page, '#apostle-data-filter-toggle');
    const mysticFilter = await browser.evaluate(cdp, page, `(() => {
      const select = document.querySelector('[data-apostle-filter="species"]');
      const apostle = window.TRICKCAL_STAT_DATA.sheets.basicInfo.find(row => row.使徒名 === 'ヨミ');
      return { options: [...select.options].map(option => option.value), apostleId: apostle?.id || '', apostleRace: apostle?.種族 || '' , normalizedRace: window.TRICKCAL_SPECIES.normalizeName(apostle?.種族) };
    })()`);
    assert.equal(mysticFilter.options.filter(value => value === 'ミスティック').length, 1, '種族filterにミスティックを1件表示');
    assert.equal(mysticFilter.options.includes('？？？'), false, '種族filterに旧表記を表示しない');
    assert.equal(mysticFilter.normalizedRace, 'ミスティック', '旧生成データのヨミを新名称として扱う');
    await browser.evaluate(cdp, page, `(() => { const select = document.querySelector('[data-apostle-filter="species"]'); select.value = 'ミスティック'; select.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    await browser.waitFor(async () => browser.evaluate(cdp, page, `document.querySelectorAll('[data-apostle-data-row]').length === 1 && document.querySelector('[data-apostle-data-row]')?.dataset.apostleDataRow === ${JSON.stringify(mysticFilter.apostleId)}`), { timeoutMs: 5000 });
    const mysticVisible = await browser.evaluate(cdp, page, `(() => {
      const row = document.querySelector('[data-apostle-data-row]');
      const speciesColumn = [...document.querySelectorAll('[data-apostle-thead] th')].findIndex(cell => (cell.getAttribute('aria-label') || cell.textContent.trim()) === '種族');
      return { name: row?.querySelector('.apostle-data-apostle-name')?.textContent.trim() || '', species: row?.children[speciesColumn]?.textContent.trim() || '' };
    })()`);
    assert.match(mysticVisible.name, /ヨミ/, 'ミスティック絞り込みでヨミを表示');
    assert.equal(mysticVisible.species, 'ミスティック', '旧生成データの種族表示を統一');
    await capture(cdp, page, `${SCREENSHOT_PREFIX}-mystic-filter-375.png`);
    await browser.clickSelector(cdp, page, '#apostle-data-filter-clear');
    await browser.clickSelector(cdp, page, '[data-apostle-view="equipment"]');
    let current = await facts(cdp, page);
    assert.equal(current.view, '装備等級', '装備view切替');
    assert.equal(current.rows, EXPECTED_APOSTLE_ROWS, '装備viewの使徒行数');
    assert.equal(current.joanne.present && current.joanne.imageLoaded, true, '装備等級にジョアンと画像');
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
    const equipmentHeaders = await browser.evaluate(cdp, page, `(() => {
      const pair = document.querySelector('[data-apostle-thead] th[data-apostle-column="会心/会心DMG"]');
      return { count: pair.querySelectorAll('.apostle-data-header-pair img').length,
        label: pair.getAttribute('aria-label'),
        help: pair.querySelector('[data-apostle-header-help]')?.dataset.apostleHeaderHelp,
        loaded: [...document.querySelectorAll('[data-apostle-thead] img')].every(img => img.complete && img.naturalWidth > 0) };
    })()`);
    assert.equal(equipmentHeaders.count, 2, '複合装備見出しは2画像を重ねる');
    assert.match(equipmentHeaders.label, /会心・会心DMG/);
    assert.equal(equipmentHeaders.help, equipmentHeaders.label, '複合見出しの説明');
    assert.equal(equipmentHeaders.loaded, true, '装備見出し画像を読込');
    await browser.clickSelector(cdp, page, '[data-apostle-column="会心/会心DMG"] [data-apostle-header-help]');
    assert.equal(await browser.evaluate(cdp, page, `document.querySelector('#apostle-data-header-help').textContent`), '会心・会心DMG', '複合見出しをタップで説明');
    await browser.evaluate(cdp, page, `document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape',bubbles:true}))`);
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
    assert.equal(current.rows, EXPECTED_APOSTLE_ROWS, 'ボードviewの使徒行数');
    assert.equal(current.joanne.present && current.joanne.imageLoaded, true, 'ボード等級にジョアンと画像');
    assert.match(current.status, /一意/); assert.match(await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-data-row] a")?.getAttribute("href") || ""'), /board-layout-preview|data\/boards/);
    await browser.evaluate(cdp, page, 'history.back()');
    await browser.waitFor(async () => browser.evaluate(cdp, page, 'new URL(location.href).searchParams.get("view") === "equipment"'), { timeoutMs: 5000 });

    await browser.clickSelector(cdp, page, '[data-apostle-view="aside"]');
    current = await facts(cdp, page);
    assert.equal(current.rows, EXPECTED_APOSTLE_ROWS, 'アサイドviewの使徒行数');
    assert.equal(current.joanne.present && current.joanne.imageLoaded, true, 'アサイド等級にジョアンと画像');
    assert.match(current.status, /登録/); assert.match(await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-data-row]")?.innerText || ""'), /等級/);
    assert.match(await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-option=asideExpanded]")?.textContent || ""'), /基礎値・成長値を表示/);
    await browser.clickSelector(cdp, page, '[data-apostle-option="asideExpanded"]');
    assert.match(await browser.evaluate(cdp, page, 'document.querySelector("[data-apostle-table] caption")?.textContent || ""'), /補助値表示/);
    const asideHeaders = await browser.evaluate(cdp, page, `(() => ({ count: document.querySelectorAll('[data-apostle-thead] th').length,
      basis: document.querySelector('[data-apostle-column="HP-manifest"]')?.querySelector('.apostle-data-sort-button')?.textContent.trim(),
      growth: document.querySelector('[data-apostle-column="HP-growth"]')?.querySelector('.apostle-data-sort-button')?.textContent.trim() }))()`);
    assert.deepEqual(asideHeaders, {count:16,basis:'基礎',growth:'成長'}, '魔法防御を含むアサイド補助列');
    const asideFacts = await browser.evaluate(cdp, page, `(() => {
      const source = window.TRICKCAL_STAT_DATA.sheets.asideTiers;
      const rows = [...document.querySelectorAll('[data-apostle-data-row]')];
      const byId = new Map(source.map(item => [String(item.id), item]));
      const cell = (row,key) => row?.querySelector('[data-apostle-column="'+key+'"]');
      const shown = value => value === undefined || value === null || String(value).trim() === '' ? '' : Number(value).toLocaleString('ja-JP');
      const mismatches = [];
      for (const row of rows) {
        const data = byId.get(row.dataset.apostleDataRow);
        const allowed = !data || typeof window.TRICKCAL_PUBLIC_RELEASE?.isAsideEnabled !== 'function' || window.TRICKCAL_PUBLIC_RELEASE.isAsideEnabled(row.dataset.apostleDataRow);
        const type = data?.['魔法防御力タイプ'];
        const expectedTier = !data || type === undefined || type === null || String(type).trim() === '' ? '' : !allowed ? '非公開' : Number(type) === 0 ? '対象外0' : '等級'+type;
        const base = data?.['魔法防御力基礎値'] ?? data?.['魔法防御力発現値'];
        const growth = data?.['魔法防御力_A1成長値'];
        const expectedBase = allowed ? shown(base) : '';
        const expectedGrowth = allowed ? shown(growth) : '';
        const actual = [cell(row,'magicDefense')?.textContent.trim() || '', cell(row,'magicDefense-manifest')?.textContent.trim() || '', cell(row,'magicDefense-growth')?.textContent.trim() || ''];
        if (actual.join('|') !== [expectedTier,expectedBase,expectedGrowth].join('|')) mismatches.push({id:row.dataset.apostleDataRow,actual,expected:[expectedTier,expectedBase,expectedGrowth]});
      }
      const amelia = document.querySelector('[data-apostle-data-row="Amelia"]');
      const epica = document.querySelector('[data-apostle-data-row="Epica"]');
      const belita = document.querySelector('[data-apostle-data-row="Belita"]');
      const missing = rows.filter(row => !byId.has(row.dataset.apostleDataRow));
      const fixture = window.__TRICKCAL_APOSTLE_DATA_TESTING__;
      const column = {key:'magicDefense',type:'魔法防御力',value:'魔法防御力'};
      const basic = {id:'Amelia'};
      return { registered:source.length, missing:missing.length, mismatches:mismatches.slice(0,5),
        newAsideApostles:{epica:{present:!!epica,physical:cell(epica,'physicalAttack')?.textContent.trim()||'',magic:cell(epica,'magicAttack')?.textContent.trim()||''},
          belita:{present:!!belita,physical:cell(belita,'physicalAttack')?.textContent.trim()||'',magic:cell(belita,'magicAttack')?.textContent.trim()||''}},
        amelia:[cell(amelia,'magicDefense')?.textContent.trim(),cell(amelia,'magicDefense-manifest')?.textContent.trim(),cell(amelia,'magicDefense-growth')?.textContent.trim()],
        noUnregisteredText:rows.every(row => [...row.querySelectorAll('td')].every(td => !td.textContent.includes('未登録'))),
        missingBlank:missing.every(row => [...row.querySelectorAll('td')].every(td => td.textContent.trim()==='')),
        fixture:{none:fixture.asideValue({basic,aside:null},column), partial:fixture.asideValue({basic,aside:{HPタイプ:1}},column), zero:fixture.asideValue({basic,aside:{魔法防御力タイプ:0,魔法防御力基礎値:0,魔法防御力_A1成長値:0}},column), baseZero:fixture.asideSupplement({aside:{魔法防御力基礎値:0}},column,'基礎値'), growthMissing:fixture.asideSupplement({aside:{}},column,'_A1成長値')},
        icon:document.querySelector('[data-apostle-thead] [data-apostle-column="magicDefense"] img')?.getAttribute('src'),
        help:document.querySelector('[data-apostle-thead] [data-apostle-column="magicDefense"] [data-apostle-header-help]')?.dataset.apostleHeaderHelp };
    })()`);
    assert.equal(asideFacts.registered, 42, 'エピカ・ベリータを含む登録済み行数');
    assert.deepEqual(asideFacts.mismatches, [], '全登録済み行の魔法防御等級・基礎・成長を元データと照合');
    assert.deepEqual(asideFacts.newAsideApostles, {
      epica:{present:true,physical:'等級4',magic:'対象外'},
      belita:{present:true,physical:'対象外',magic:'等級4'}
    }, 'エピカは物理、ベリータは魔法の本人攻撃等級を表示');
    assert.deepEqual(asideFacts.amelia, ['等級1','324','45'], 'アメリアの原値');
    assert.equal(asideFacts.noUnregisteredText && asideFacts.missingBlank, true, 'アサイド欠損セルは空欄');
    assert.equal(asideFacts.fixture.none.blank && asideFacts.fixture.partial.blank, true, '未登録全体と項目欠損を区別');
    assert.equal(asideFacts.fixture.zero.status, 'excluded', '明示0は未登録ではない');
    assert.equal(asideFacts.fixture.baseZero, 0, '基礎値の明示0を維持');
    assert.equal(asideFacts.fixture.growthMissing, null, '成長値の空欄を維持');
    assert.match(asideFacts.icon, /魔法防御力\.webp/);
    assert.equal(asideFacts.help, '魔法防御力', '正式名称の説明');
    await browser.clickSelector(cdp, page, '[data-apostle-column="magicDefense"] [data-apostle-sort]');
    const sortedAside = await browser.evaluate(cdp, page, `(() => { const map=new Map(window.TRICKCAL_STAT_DATA.sheets.asideTiers.map(r=>[String(r.id),r])); return [...document.querySelectorAll('[data-apostle-data-row]')].map(row=>map.get(row.dataset.apostleDataRow)?.['魔法防御力タイプ'] ?? null); })()`);
    const knownAside = sortedAside.filter(value => value !== null);
    assert.deepEqual(knownAside, [...knownAside].sort((a,b)=>a-b), '魔法防御の数値等級で並べ替え');
    assert.ok(sortedAside.slice(knownAside.length).every(value => value === null), '未登録を等級0と混同しない');

    await browser.clickSelector(cdp, page, '[data-apostle-view="rank"]');
    current = await facts(cdp, page);
    assert.equal(current.rows, EXPECTED_APOSTLE_ROWS, 'Rank viewの使徒行数');
    assert.equal(current.joanne.present && current.joanne.imageLoaded, true, 'Rank効果にジョアンと画像');
    const rankFacts = await browser.evaluate(cdp, page, `(() => {
      const row = document.querySelector('[data-apostle-data-row="Amelia"]');
      const source = window.TRICKCAL_STAT_DATA.sheets.rankGlobalBonuses.find(item => item.id === 'Amelia');
      return { headers: [...document.querySelectorAll('[data-apostle-thead] th')].map(cell => cell.dataset.apostleColumn),
        noSelector: !document.querySelector('#apostle-data-rank-transition'),
        rank1: row.querySelector('[data-apostle-column="rank1"]').textContent.trim(),
        rank2: [...row.querySelectorAll('[data-apostle-column="rank2"] .apostle-data-rank-effect')].map(button => button.getAttribute('aria-label')),
        rank10: [...row.querySelectorAll('[data-apostle-column="rank10"] .apostle-data-rank-effect')].map(button => button.getAttribute('aria-label')),
        allRowsComplete: [...document.querySelectorAll('[data-apostle-data-row]')].every(item => item.children.length === 11),
        allRankMatches: window.TRICKCAL_STAT_DATA.sheets.rankGlobalBonuses.every(item => {
          const rendered = [...document.querySelectorAll('[data-apostle-data-row]')].find(row => row.dataset.apostleDataRow === String(item.id));
          if (!rendered || rendered.querySelector('[data-apostle-column="rank1"]')?.textContent.trim() !== '—') return false;
          return Array.from({length:9}, (_, index) => index + 2).every(rank => {
            const prefix = 'Rank' + (rank - 1) + 'to' + rank;
            const labels = [...rendered.querySelectorAll('[data-apostle-column="rank' + rank + '"] .apostle-data-rank-effect')].map(button => button.getAttribute('aria-label'));
            return labels.length === 2 && [1,2].every((effect, slot) => labels[slot] === item[prefix + '_type' + effect] + ' ' + item[prefix + '_value' + effect]);
          });
        }),
        source2: [source.Rank1to2_type1, source.Rank1to2_value1, source.Rank1to2_type2, source.Rank1to2_value2],
        source10: [source.Rank9to10_type1, source.Rank9to10_value1, source.Rank9to10_type2, source.Rank9to10_value2],
        zero: window.__TRICKCAL_APOSTLE_DATA_TESTING__.rankEffect({rank:{Rank1to2_type1:'HP',Rank1to2_value1:0}},1,1,2),
        missing: window.__TRICKCAL_APOSTLE_DATA_TESTING__.rankEffect({rank:{}},1,1,2),
        excluded: window.__TRICKCAL_APOSTLE_DATA_TESTING__.rankEffect({rank:{Rank1to2_type1:'',Rank1to2_value1:0}},1,1,2) };
    })()`);
    assert.deepEqual(rankFacts.headers, ['name', ...Array.from({length:10}, (_, index) => `rank${index + 1}`)], 'Rank 1〜10を同時表示');
    assert.equal(rankFacts.noSelector, true, '不要なRank遷移切替を削除');
    assert.equal(rankFacts.rank1, '—', 'Rank 1は架空の効果を補わない');
    assert.deepEqual(rankFacts.rank2, ['会心 24', '会心ダメージ 24'], 'Rank 2は1→2の増分');
    assert.deepEqual(rankFacts.rank10, ['物理防御力 33', '魔法防御力 33'], 'Rank 10は9→10の増分');
    assert.deepEqual(rankFacts.source2, ['会心',24,'会心ダメージ',24], '元データのRank 1→2を照合');
    assert.deepEqual(rankFacts.source10, ['物理防御力',33,'魔法防御力',33], '元データのRank 9→10を照合');
    assert.equal(rankFacts.allRowsComplete, true, '全使徒に10 Rank列');
    assert.equal(rankFacts.allRankMatches, true, '全79使徒・Rank 2〜10の増分を生成元と照合');
    assert.equal(rankFacts.zero.status, 'known', '明示0を残す');
    assert.equal(rankFacts.missing.status, 'unregistered', '未登録を区別');
    assert.equal(rankFacts.excluded.status, 'excluded', '対象外を区別');
    assert.match(await browser.evaluate(cdp, page, `document.querySelector('[data-apostle-column="rank10"] [data-apostle-header-help]')?.dataset.apostleHeaderHelp || ''`), /Rank 9→10/);
    await browser.clickSelector(cdp, page, '[data-apostle-column="rank2"] .apostle-data-rank-effect');
    assert.equal(await browser.evaluate(cdp, page, `document.querySelector('#apostle-data-header-help').textContent`), '会心', 'Rank効果アイコンの説明');
    await browser.clickSelector(cdp, page, '[data-apostle-thead] [data-apostle-column="rank10"] [data-apostle-header-help]');
    const rankEdgeHelp = await browser.evaluate(cdp, page, `(() => { const r=document.querySelector('#apostle-data-header-help').getBoundingClientRect(); return { left:r.left,right:r.right,text:document.querySelector('#apostle-data-header-help').textContent }; })()`);
    assert.ok(rankEdgeHelp.left >= 0 && rankEdgeHelp.right <= 375 && rankEdgeHelp.text.includes('Rank 9→10'), '最右Rank見出しの説明が画面内');

    await browser.evaluate(cdp, page, 'document.querySelector("#apostle-data-search").value = "not-found"; document.querySelector("#apostle-data-search").dispatchEvent(new Event("input", { bubbles: true }));');
    assert.equal((await facts(cdp, page)).rows, 0, '検索0件');
    await browser.clickSelector(cdp, page, '#apostle-data-filter-clear');
    assert.equal((await facts(cdp, page)).rows, EXPECTED_APOSTLE_ROWS, '検索解除');

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
    for (const view of ['basic', 'equipment', 'board', 'aside', 'rank']) {
      if (view !== 'basic') await browser.clickSelector(cdp, desktop, `[data-apostle-view="${view}"]`);
      viewGeometry[`1280-${view}`] = await tableGeometry(cdp, desktop);
      await capture(cdp, desktop, `${SCREENSHOT_PREFIX}-${view}-1280-initial.png`);
      await browser.clickSelector(cdp, desktop, '[data-shared-theme-button]');
      await capture(cdp, desktop, `${SCREENSHOT_PREFIX}-${view}-1280-opposite-theme.png`);
      await browser.clickSelector(cdp, desktop, '[data-shared-theme-button]');
      if (view === 'aside') {
        await browser.clickSelector(cdp, desktop, '[data-apostle-option="asideExpanded"]');
        await capture(cdp, desktop, `${SCREENSHOT_PREFIX}-aside-1280-expanded.png`);
        await browser.evaluate(cdp, desktop, `document.querySelector('[data-apostle-table-wrap]').scrollLeft = document.querySelector('[data-apostle-table-wrap]').scrollWidth`);
        await capture(cdp, desktop, `${SCREENSHOT_PREFIX}-aside-1280-expanded-magic-defense.png`);
        await browser.clickSelector(cdp, desktop, '[data-shared-theme-button]');
        await capture(cdp, desktop, `${SCREENSHOT_PREFIX}-aside-1280-expanded-magic-defense-opposite-theme.png`);
      }
    }
    await browser.clickSelector(cdp, desktop, '[data-apostle-view="equipment"]');
    await capture(cdp, desktop, `${SCREENSHOT_PREFIX}-equipment-1280.png`);
    await browser.clickSelector(cdp, desktop, '[data-apostle-view="basic"]');
    await capture(cdp, desktop, `${SCREENSHOT_PREFIX}-1280.png`);
    await browser.evaluate(cdp, desktop, `document.querySelector('[data-apostle-table-wrap]').scrollLeft = document.querySelector('[data-apostle-table-wrap]').scrollWidth`);
    await capture(cdp, desktop, `${SCREENSHOT_PREFIX}-basic-right-1280.png`);
    await browser.evaluate(cdp, desktop, `document.querySelector('[data-apostle-table-wrap]').scrollLeft = 0`);
    await browser.clickSelector(cdp, desktop, '[data-shared-theme-button]');
    await capture(cdp, desktop, `${SCREENSHOT_PREFIX}-1280-opposite-theme.png`);
    console.log(JSON.stringify({ ok: true, responsive, expandedResponsive, viewGeometry, screenshots: [`tmp/${SCREENSHOT_PREFIX}-basic-filter-collapsed-375.png`, `tmp/${SCREENSHOT_PREFIX}-mystic-filter-375.png`, `tmp/${SCREENSHOT_PREFIX}-basic-375-opposite-theme.png`, `tmp/${SCREENSHOT_PREFIX}-basic-right-help-375.png`, `tmp/${SCREENSHOT_PREFIX}-basic-filter-expanded-375.png`, `tmp/${SCREENSHOT_PREFIX}-basic-filter-expanded-375-600.png`, `tmp/${SCREENSHOT_PREFIX}-basic-filter-expanded-375-480.png`, `tmp/${SCREENSHOT_PREFIX}-equipment-375.png`, `tmp/${SCREENSHOT_PREFIX}-equipment-dialog-375.png`, `tmp/${SCREENSHOT_PREFIX}-equipment-1280.png`, `tmp/${SCREENSHOT_PREFIX}-375.png`, `tmp/${SCREENSHOT_PREFIX}-1280.png`, `tmp/${SCREENSHOT_PREFIX}-basic-right-1280.png`, `tmp/${SCREENSHOT_PREFIX}-1280-opposite-theme.png`], fixture }, null, 2));
  } finally {
    try { await cdp?.disconnect(); } catch {}
    try { chrome?.kill(); } catch {}
    try { server.close(); } catch {}
    try { fs.rmSync(profileRoot, { recursive: true, force: true }); } catch {}
  }
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
