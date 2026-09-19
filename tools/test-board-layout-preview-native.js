#!/usr/bin/env node
'use strict';

// Standalone local browser regression for the release-source board page.
// Generated profiles can be tested by setting BOARD_PREVIEW_TEST_ROOT and routes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ROOT = path.resolve(process.env.BOARD_PREVIEW_TEST_ROOT || PROJECT_ROOT);
const BOARD_ROUTE = process.env.BOARD_PREVIEW_TEST_ROUTE
  || '/public/board-layout-preview.html?apostle=Amelia&boardPreviewNative=1';
const ENEMY_ROUTE = process.env.BOARD_PREVIEW_TEST_ENEMY_ROUTE || '/enemy-status.html';
const APOSTLE_ROUTE = process.env.BOARD_PREVIEW_TEST_APOSTLE_ROUTE || '/public/apostle-data.html';
const SCREENSHOT_PREFIX = process.env.BOARD_PREVIEW_TEST_PREFIX || 'board-preview-bottom-bar';
const MIME = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp'
};

function startServer(port) {
  const server = http.createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname); }
    catch (_) { response.writeHead(400); response.end('Bad path'); return; }
    const relative = pathname.replace(/^\/+/, '') || 'index.html';
    let file = path.resolve(ROOT, relative);
    const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : `${ROOT}${path.sep}`;
    if (file.startsWith(rootPrefix) && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (file !== ROOT && !file.startsWith(rootPrefix)) { response.writeHead(404); response.end('Not found'); return; }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(fs.readFileSync(file));
  });
  return server.listen(port, '127.0.0.1');
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
  await browser.waitFor(async () => await browser.evaluate(cdp, page, `innerWidth === ${width} && innerHeight === ${height}`), { timeoutMs: 5000 });
}

async function navigate(cdp, page, origin, route, width, height) {
  await setViewport(cdp, page, width, height);
  await cdp.send('Page.navigate', { url: `${origin}${route}` }, page.sessionId);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() =>
    document.readyState === 'complete'
      && document.documentElement.dataset.storageBoot === 'ready'
      && document.querySelectorAll('[data-topbar-operation]').length === 8
      && !!document.querySelector('#board-preview-viewport .unified-board')
      && document.querySelector('#board-preview-apostle-image')?.complete
      && document.querySelector('#board-preview-apostle-image')?.naturalWidth > 0
  )()`), { timeoutMs: 30000 });
  await waitBarSynced(cdp, page);
}

async function waitBarSynced(cdp, page) {
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
    const bar = document.querySelector('.template-config-bar');
    const measured = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-preview-bottom-bar-height')) || 0;
    return Math.abs(measured - Math.ceil(bar.getBoundingClientRect().height)) <= 1;
  })()`), { timeoutMs: 5000, intervalMs: 40 });
  let previous = null;
  for (let index = 0; index < 3; index += 1) {
    await browser.sleep(75);
    const sample = await browser.evaluate(cdp, page, `(() => ({
      barHeight: document.querySelector('.template-config-bar').getBoundingClientRect().height,
      measured: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-preview-bottom-bar-height')) || 0,
      bodyPaddingBottom: parseFloat(getComputedStyle(document.body).paddingBottom) || 0
    }))()`);
    assert.ok(Math.abs(sample.measured - Math.ceil(sample.barHeight)) <= 1, `下バー実高同期が安定 ${JSON.stringify(sample)}`);
    if (previous) assert.deepEqual(sample, previous, 'ResizeObserver同期後の下バー高さが振動しない');
    previous = sample;
  }
}

async function installNoticeFixture(cdp, page) {
  return browser.evaluate(cdp, page, `(() => {
    document.querySelector('.trickcal-announcements-follow-bar')?.remove();
    const topbar = document.querySelector('.data-detail-topbar');
    const notice = document.createElement('button');
    notice.type = 'button';
    notice.className = 'trickcal-announcements-follow-bar';
    notice.setAttribute('aria-label', '隔離fixtureのお知らせ');
    for (const [className, text] of [
      ['trickcal-announcements-follow-label', '重要なお知らせ'],
      ['trickcal-announcements-follow-title', 'サイト移行案内の隔離表示確認 fixture']
    ]) {
      const span = document.createElement('span'); span.className = className; span.textContent = text; notice.appendChild(span);
    }
    const unread = document.createElement('span'); unread.className = 'trickcal-announcements-follow-unread'; unread.hidden = true; notice.appendChild(unread);
    const arrow = document.createElement('span'); arrow.className = 'trickcal-announcements-follow-arrow'; arrow.textContent = '›'; notice.appendChild(arrow);
    topbar.after(notice);
    const height = Math.ceil(notice.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--trickcal-follow-bar-height', height + 'px');
    return { height, topbarHeight: topbar.getBoundingClientRect().height };
  })()`);
}

async function removeNoticeFixture(cdp, page) {
  await browser.evaluate(cdp, page, `(() => {
    document.querySelector('.trickcal-announcements-follow-bar')?.remove();
    document.documentElement.style.removeProperty('--trickcal-follow-bar-height');
  })()`);
  await browser.sleep(60);
}

async function readFacts(cdp, page) {
  return browser.evaluate(cdp, page, `(() => {
    const bar = document.querySelector('.template-config-bar');
    const topbar = document.querySelector('.data-detail-topbar');
    const notice = document.querySelector('.trickcal-announcements-follow-bar');
    const viewport = document.querySelector('#board-preview-viewport');
    const boardGrid = document.querySelector('.board-grid')?.getBoundingClientRect();
    const backgroundRects = [...document.querySelectorAll('.board-layer-background')].map(element => {
      const rect = element.getBoundingClientRect(); return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    });
    const barRect = bar.getBoundingClientRect();
    const topbarRect = topbar.getBoundingClientRect();
    const noticeRect = notice?.getBoundingClientRect();
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    const rootStyle = getComputedStyle(document.documentElement);
    return {
      width: innerWidth, height: innerHeight, viewportClientWidth: document.documentElement.clientWidth,
      viewportClientHeight: document.documentElement.clientHeight,
      visualViewportHeight: visualViewport?.height || innerHeight,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      operationTops: [...document.querySelectorAll('[data-topbar-operation]')].map(node => Math.round(node.getBoundingClientRect().top)),
      topbar: { top: topbarRect.top, bottom: topbarRect.bottom, height: topbarRect.height },
      notice: noticeRect && { top: noticeRect.top, bottom: noticeRect.bottom, height: noticeRect.height },
      topOccupied: Math.max(topbarRect.bottom, noticeRect?.bottom || 0),
      bodyPaddingTop: parseFloat(getComputedStyle(document.body).paddingTop) || 0,
      topOccupiedVariable: getComputedStyle(document.body).getPropertyValue('--trickcal-top-occupied-height').trim(),
      bar: {
        top: barRect.top, bottom: barRect.bottom, computedBottom: getComputedStyle(bar).bottom, width: barRect.width, height: barRect.height,
        maxHeight: parseFloat(getComputedStyle(bar).maxHeight) || 0,
        scrollHeight: bar.scrollHeight, clientHeight: bar.clientHeight, scrollTop: bar.scrollTop
      },
      bodyPaddingBottom: parseFloat(getComputedStyle(document.body).paddingBottom) || 0,
      measuredBarVariable: parseFloat(rootStyle.getPropertyValue('--board-preview-bottom-bar-height')) || 0,
      detailsOpen: document.querySelector('#board-preview-detail-settings')?.dataset.templateDetailsOpen || 'false',
      detailsExpanded: document.querySelector('.tier-details')?.open || false,
      detailsButtonExpanded: document.querySelector('#board-preview-detail-toggle')?.getAttribute('aria-expanded') || 'false',
      focusId: document.activeElement?.id || '',
      tierControls: [...document.querySelectorAll('.tier-grid select')].map(element => {
        const rect = element.getBoundingClientRect();
        return { name: element.closest('label')?.innerText.trim() || '', top: rect.top, bottom: rect.bottom, value: element.value };
      }),
      image: { complete: document.querySelector('#board-preview-apostle-image')?.complete, naturalWidth: document.querySelector('#board-preview-apostle-image')?.naturalWidth },
      headings: [...document.querySelectorAll('.board-heading-label')].map(node => node.textContent.trim()),
      verticalLabels: document.querySelectorAll('.board-layer-label').length,
      backgroundInsideGrid: !!boardGrid && backgroundRects.every(rect => rect.left >= boardGrid.left - 1 && rect.top >= boardGrid.top - 1 && rect.right <= boardGrid.right + 1 && rect.bottom <= boardGrid.bottom + 1),
      duplicateIds: duplicates
    };
  })()`);
}

async function dispatchKey(cdp, page, key) {
  const keys = {
    ArrowDown: { code: 'ArrowDown', windowsVirtualKeyCode: 40 },
    ArrowUp: { code: 'ArrowUp', windowsVirtualKeyCode: 38 },
    Enter: { code: 'Enter', windowsVirtualKeyCode: 13 },
    Escape: { code: 'Escape', windowsVirtualKeyCode: 27 }
  };
  assert.ok(keys[key], `unsupported key ${key}`);
  const params = { key, ...keys[key] };
  await cdp.send('Input.dispatchKeyEvent', { ...params, type: 'keyDown' }, page.sessionId);
  await cdp.send('Input.dispatchKeyEvent', { ...params, type: 'keyUp' }, page.sessionId);
}

async function wheelBar(cdp, page) {
  const point = await browser.evaluate(cdp, page, `(() => {
    const rect = document.querySelector('.template-config-bar').getBoundingClientRect();
    return { x: Math.max(10, rect.left + rect.width / 2), y: Math.max(10, rect.top + Math.min(rect.height - 10, rect.height / 2)) };
  })()`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y }, page.sessionId);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: point.x, y: point.y, deltaX: 0, deltaY: 700 }, page.sessionId);
  await browser.sleep(120);
}

async function dispatchChange(cdp, page, selector, value) {
  await browser.evaluate(cdp, page, `(() => {
    const control = document.querySelector(${JSON.stringify(selector)});
    if (!control) throw new Error('missing control: ' + ${JSON.stringify(selector)});
    control.value = ${JSON.stringify(String(value))};
    control.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await browser.sleep(100);
}

async function revealAllTierControls(cdp, page, context) {
  const selectors = await browser.evaluate(cdp, page, `Array.from(document.querySelectorAll('.tier-grid select')).map(select =>
    '.tier-grid select[data-board-preview-tier="' + select.dataset.boardPreviewTier + '"]')`);
  assert.equal(selectors.length, 8, `${context}:Tier操作数`);
  for (const selector of selectors) {
    const reached = await browser.evaluate(cdp, page, `(() => {
      const control = document.querySelector(${JSON.stringify(selector)});
      const bar = document.querySelector('.template-config-bar');
      control.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
      const rect = control.getBoundingClientRect();
      const bounds = bar.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1;
    })()`);
    assert.equal(reached, true, `${context}:到達可能 ${selector}`);
  }
}

async function checkThemeToggle(cdp, page, context) {
  const before = await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme');
  await browser.clickSelector(cdp, page, '[data-shared-theme-button]');
  await browser.waitFor(async () => (await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme')) !== before, { timeoutMs: 3000 });
  const switched = await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme');
  assertBarGeometry(await readFacts(cdp, page), `${context}:テーマ切替後`);
  await browser.clickSelector(cdp, page, '[data-shared-theme-button]');
  await browser.waitFor(async () => (await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme')) === before, { timeoutMs: 3000 });
  return { before, switched, restored: await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme') };
}

function summarize(facts) {
  return {
    viewport: `${facts.width}x${facts.height}`,
    viewportClientHeight: facts.viewportClientHeight,
    horizontalOverflow: facts.overflowX,
    topbarHeight: Math.round(facts.topbar.height * 10) / 10,
    noticeHeight: Math.round((facts.notice?.height || 0) * 10) / 10,
    barTop: facts.bar.top,
    barHeight: facts.bar.height,
    barBottom: facts.bar.bottom,
    maxHeight: facts.bar.maxHeight,
    internalScroll: `${facts.bar.clientHeight}/${facts.bar.scrollHeight}`,
    scrollTop: facts.bar.scrollTop,
    bodyPaddingTop: facts.bodyPaddingTop,
    bodyPaddingBottom: facts.bodyPaddingBottom,
    measuredBarHeight: facts.measuredBarVariable,
    tierExpanded: facts.detailsExpanded,
    detailPanelExpanded: facts.detailsOpen,
    focusId: facts.focusId
  };
}

async function checkProfileAwareManagerLink(cdp, page, origin) {
  const href = await browser.evaluate(cdp, page, `document.querySelector('[data-topbar-operation="manager"]')?.href || ''`);
  assert.ok(href, '共通上バーの管理リンクがある');
  const url = new URL(href);
  assert.equal(url.origin, origin, `管理リンクが同一profile内 ${href}`);
  const response = await fetch(href);
  assert.equal(response.status, 200, `profile-aware管理route ${href}`);
  return { href, status: response.status };
}

async function capture(cdp, page, filename) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
  const target = path.join(PROJECT_ROOT, 'tmp', filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, Buffer.from(result.data, 'base64'));
  return path.relative(PROJECT_ROOT, target).replaceAll(path.sep, '/');
}

function assertBarGeometry(facts, context) {
  assert.ok(Math.abs(facts.bar.bottom - facts.viewportClientHeight) <= 1, `${context}:表示viewport下端固定 ${JSON.stringify({ bar: facts.bar, height: facts.height, viewportClientHeight: facts.viewportClientHeight, visualViewportHeight: facts.visualViewportHeight })}`);
  assert.ok(facts.bar.top >= facts.topOccupied + Math.max(80, facts.height * 0.2) - 2, `${context}:上部領域とプレビュー余白を確保 ${JSON.stringify({ bar: facts.bar, topOccupied: facts.topOccupied })}`);
  assert.ok(facts.bodyPaddingTop >= facts.topOccupied - 1, `${context}:本文上余白が実上部高へ追従 ${JSON.stringify({ paddingTop: facts.bodyPaddingTop, topOccupied: facts.topOccupied, variable: facts.topOccupiedVariable })}`);
  assert.ok(facts.bodyPaddingBottom >= facts.bar.height - 1, `${context}:本文下余白 ${JSON.stringify(facts)}`);
  assert.ok(Math.abs(facts.measuredBarVariable - Math.ceil(facts.bar.height)) <= 1, `${context}:実高同期 ${JSON.stringify(facts)}`);
  assert.ok(facts.overflowX <= 0, `${context}:横overflow ${facts.overflowX}`);
  assert.deepEqual(facts.duplicateIds, [], `${context}:重複ID`);
}

async function assertHeadings(cdp, page, origin, width, route, selector, title, expectedPrefixVisible) {
  await setViewport(cdp, page, width, 800);
  await cdp.send('Page.navigate', { url: `${origin}${route}` }, page.sessionId);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `document.readyState === 'complete' && !!document.querySelector(${JSON.stringify(selector)})`), { timeoutMs: 15000 });
  const facts = await browser.evaluate(cdp, page, `(() => {
    const heading = document.querySelector(${JSON.stringify(selector)});
    const prefix = heading.querySelector('.data-heading-prefix');
    const separator = heading.querySelector('.data-heading-separator');
    const title = heading.innerText.replace(/\\s+/g, ' ').trim();
    return { tagName: heading.tagName, title, hasLink: !!heading.querySelector('a'), prefixDisplay: prefix ? getComputedStyle(prefix).display : 'missing', separatorDisplay: separator ? getComputedStyle(separator).display : 'missing', rect: (() => { const r = heading.getBoundingClientRect(); return { width:r.width, height:r.height, right:r.right }; })() };
  })()`);
  assert.equal(facts.tagName, 'H1', `${title}:見出し要素`);
  assert.equal(facts.hasLink, false, `${title}:見出しにリンクを付けない`);
  assert.ok(facts.title.includes(title), `${title}:見出し本文 ${JSON.stringify(facts)}`);
  assert.equal(facts.prefixDisplay !== 'none', expectedPrefixVisible, `${title}:接頭辞表示幅${width} ${JSON.stringify(facts)}`);
  assert.equal(facts.separatorDisplay !== 'none', expectedPrefixVisible, `${title}:区切り表示幅${width} ${JSON.stringify(facts)}`);
  assert.ok(facts.rect.right <= width + 1, `${title}:見出し横はみ出し ${JSON.stringify(facts)}`);
  return facts;
}

async function run() {
  const serverPort = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([serverPort]);
  const server = startServer(serverPort);
  const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-board-review-'));
  let chrome = null;
  let cdp = null;
  let page = null;
  try {
    const origin = `http://127.0.0.1:${serverPort}`;
    await browser.waitForHttp(`${origin}${BOARD_ROUTE.split('?')[0]}`);
    ({ chrome, cdp } = await launchChrome(cdpPort, profileRoot));
    page = await browser.createPage(cdp, 'about:blank');
    await cdp.send('Page.enable', {}, page.sessionId);

    const responsive = {};
    for (const item of [
      { label: '320x844', width: 320, height: 844 }, { label: '375x844', width: 375, height: 844 },
      { label: '390x844', width: 390, height: 844 }, { label: '720x844', width: 720, height: 844 },
      { label: '721x844', width: 721, height: 844 }, { label: '1280x900', width: 1280, height: 900 }
    ]) {
      await navigate(cdp, page, origin, BOARD_ROUTE, item.width, item.height);
      const facts = await readFacts(cdp, page);
      assertBarGeometry(facts, item.label);
      assert.equal(facts.image.complete, true, `${item.label}:使徒画像complete`);
      assert.ok(facts.image.naturalWidth > 0, `${item.label}:使徒画像naturalWidth`);
      assert.deepEqual(facts.headings, ['B1', 'B2', 'B3'], `${item.label}:横表示Bラベル`);
      assert.equal(facts.backgroundInsideGrid, true, `${item.label}:ボード背景境界`);
      assert.equal(new Set(facts.operationTops).size, item.width <= 720 ? 2 : 1, `${item.label}:共通上バー段数`);
      responsive[item.label] = summarize(facts);
    }

    // Exact review reproduction: desktop breakpoint at 721px, only 480px tall.
    await navigate(cdp, page, origin, BOARD_ROUTE, 721, 480);
    await browser.clickSelector(cdp, page, '.tier-details summary');
    await waitBarSynced(cdp, page);
    let low = await readFacts(cdp, page);
    assertBarGeometry(low, '721x480 expanded/no notice');
    assert.equal(low.detailsExpanded, true, '721x480:Tier設定が開く');
    assert.ok(low.bar.height < 480, '721x480:バーが画面を覆わない');
    assert.ok(low.bar.scrollHeight > low.bar.clientHeight, '721x480:超過内容が内部スクロールになる');
    await wheelBar(cdp, page);
    low = await readFacts(cdp, page);
    assert.ok(low.bar.scrollTop > 0, `721x480:実ホイールでバー内スクロール ${JSON.stringify(low.bar)}`);
    await revealAllTierControls(cdp, page, '721x480');
    assert.ok(low.tierControls.at(-1).bottom <= low.bar.bottom + 1, '721x480:最終Tier設定へスクロール可能');
    const lastSelector = '.tier-grid select[data-board-preview-tier="critDmgRes"]';
    await browser.clickSelector(cdp, page, lastSelector);
    const previousValue = await browser.readValue(cdp, page, lastSelector);
    const nextOption = await browser.evaluate(cdp, page, `(() => {
      const select = document.querySelector(${JSON.stringify(lastSelector)});
      return select.selectedIndex < select.options.length - 1 ? 'ArrowDown' : 'ArrowUp';
    })()`);
    await dispatchKey(cdp, page, nextOption);
    await dispatchKey(cdp, page, 'Enter');
    await browser.waitFor(async () => (await browser.readValue(cdp, page, lastSelector)) !== previousValue, { timeoutMs: 3000 });
    await browser.clickSelector(cdp, page, '.tier-details summary');
    await waitBarSynced(cdp, page);
    const collapsed = await readFacts(cdp, page);
    assert.equal(collapsed.detailsExpanded, false, '721x480:Tier折りたたみ');
    assertBarGeometry(collapsed, '721x480 collapsed/no notice');
    assert.ok(collapsed.bar.height < low.bar.height, '721x480:折りたたみ後の高さが戻る');

    // Isolated follow-bar fixture exercises the same CSS measurement contract without changing notice data/state.
    await installNoticeFixture(cdp, page);
    await browser.clickSelector(cdp, page, '.tier-details summary');
    await waitBarSynced(cdp, page);
    let withNotice = await readFacts(cdp, page);
    assertBarGeometry(withNotice, '721x480 expanded/notice fixture');
    assert.ok(withNotice.notice && withNotice.bar.top >= withNotice.notice.bottom + 96 - 2, `721x480:告知バーと下バーの間にプレビュー領域 ${JSON.stringify(withNotice)}`);
    assert.ok(withNotice.bar.scrollHeight > withNotice.bar.clientHeight, '721x480/notice:内部スクロール');
    const screenshot721 = await capture(cdp, page, `${SCREENSHOT_PREFIX}-721x480-notice-expanded.png`);
    await browser.clickSelector(cdp, page, '.tier-details summary');
    await waitBarSynced(cdp, page);
    const noticeCollapsed = await readFacts(cdp, page);
    assertBarGeometry(noticeCollapsed, '721x480 collapsed/notice fixture');
    assert.ok(noticeCollapsed.bar.height < withNotice.bar.height, '721x480/notice:閉じた後に高さが戻る');
    await removeNoticeFixture(cdp, page);

    // Mobile: the compact first row remains, detail panel expands and scrolls inside the fixed bar.
    await navigate(cdp, page, origin, BOARD_ROUTE, 375, 480);
    await installNoticeFixture(cdp, page);
    await browser.clickSelector(cdp, page, '#board-preview-detail-toggle');
    await waitBarSynced(cdp, page);
    await browser.clickSelector(cdp, page, '.tier-details summary');
    await waitBarSynced(cdp, page);
    let mobileLow = await readFacts(cdp, page);
    assertBarGeometry(mobileLow, '375x480 expanded/notice fixture');
    assert.equal(mobileLow.detailsButtonExpanded, 'true', '375x480:aria-expanded');
    assert.ok(mobileLow.bar.scrollHeight > mobileLow.bar.clientHeight, '375x480:詳細操作が内部スクロール');
    await browser.evaluate(cdp, page, `document.querySelector('.template-config-bar').scrollTop = 0`);
    const screenshot375 = await capture(cdp, page, `${SCREENSHOT_PREFIX}-375x480-notice-expanded.png`);
    await wheelBar(cdp, page);
    mobileLow = await readFacts(cdp, page);
    assert.ok(mobileLow.bar.scrollTop > 0, '375x480:実ホイールで全条件へ到達');
    await revealAllTierControls(cdp, page, '375x480');
    await browser.clickSelector(cdp, page, '.tier-grid select[data-board-preview-tier="critDmgRes"]');
    assert.equal(await browser.evaluate(cdp, page, `document.querySelector('#board-preview-detail-toggle').getAttribute('aria-expanded')`), 'true', '375x480:操作中も詳細展開を維持');
    await dispatchKey(cdp, page, 'Escape');
    if ((await readFacts(cdp, page)).detailsOpen === 'true') await dispatchKey(cdp, page, 'Escape');
    await waitBarSynced(cdp, page);
    const mobileClosed = await readFacts(cdp, page);
    assert.equal(mobileClosed.detailsOpen, 'false', '375x480:Escapeで詳細を閉じる');
    assert.equal(mobileClosed.focusId, 'board-preview-detail-toggle', '375x480:Escape後フォーカス復帰');
    assertBarGeometry(mobileClosed, '375x480 collapsed/notice fixture');
    assert.ok(mobileClosed.bar.height < mobileLow.bar.height, '375x480:折りたたみ後の高さが戻る');
    await removeNoticeFixture(cdp, page);

    // Preserve established preview behavior while the lower bar is present.
    await navigate(cdp, page, origin, BOARD_ROUTE, 720, 844);
    const themeToggle = await checkThemeToggle(cdp, page, '720px');
    const startScroll = await browser.evaluate(cdp, page, `(() => {
      const viewport = document.querySelector('#board-preview-viewport');
      viewport.scrollLeft = 260;
      return { left: viewport.scrollLeft, otherSpecies: [...document.querySelector('#board-preview-species').options].map(option => option.value).find(value => value && value !== document.querySelector('#board-preview-species').value) };
    })()`);
    assert.ok(startScroll.left > 0, 'ボード横スクロールを右へ移動');
    assert.ok(startScroll.otherSpecies, '種族変更の候補がある');
    await dispatchChange(cdp, page, '#board-preview-species', startScroll.otherSpecies);
    assert.equal(await browser.evaluate(cdp, page, 'document.querySelector("#board-preview-viewport").scrollLeft'), 0, '種族変更で左端へ戻る');
    await browser.evaluate(cdp, page, `(() => {
      const viewport = document.querySelector('#board-preview-viewport');
      viewport.scrollLeft = 260;
      document.querySelector('.board-node:not(.is-virtual)')?.click();
    })()`);
    assert.equal(await browser.evaluate(cdp, page, 'document.querySelector("#board-preview-viewport").scrollLeft'), 260, 'マス選択で手動横位置を保持');
    await dispatchChange(cdp, page, '#board-preview-apostle', '');
    let imageState = await browser.evaluate(cdp, page, `({ hidden:document.querySelector('#board-preview-apostle-image').hidden, name:document.querySelector('#board-preview-apostle-name').textContent.trim() })`);
    assert.deepEqual(imageState, { hidden: true, name: 'カスタム指定' }, 'カスタム指定で使徒画像を隠す');
    await dispatchChange(cdp, page, '#board-preview-apostle', 'Rudd');
    await browser.waitFor(async () => browser.evaluate(cdp, page, `document.querySelector('#board-preview-apostle-image').complete && document.querySelector('#board-preview-apostle-image').naturalWidth > 0`));
    imageState = await browser.evaluate(cdp, page, `({ src:document.querySelector('#board-preview-apostle-image').getAttribute('src'), name:document.querySelector('#board-preview-apostle-name').textContent.trim() })`);
    assert.match(imageState.src, /img\/Chara\/Rude\.webp(?:[?#]|$)/, `使徒alias画像 ${JSON.stringify(imageState)}`);
    assert.ok(imageState.name, 'alias使徒名');
    await dispatchChange(cdp, page, '#board-preview-apostle', 'Amelia');
    for (let index = 0; index < 6; index += 1) await browser.clickSelector(cdp, page, '#board-preview-zoom-in');
    let boardFacts = await readFacts(cdp, page);
    assert.equal(await browser.evaluate(cdp, page, `getComputedStyle(document.documentElement).getPropertyValue('--board-preview-scale').trim()`), '1.6', '最大ズーム');
    assert.equal(boardFacts.backgroundInsideGrid, true, '最大ズームの背景境界');
    for (let index = 0; index < 10; index += 1) await browser.clickSelector(cdp, page, '#board-preview-zoom-out');
    boardFacts = await readFacts(cdp, page);
    assert.equal(await browser.evaluate(cdp, page, `getComputedStyle(document.documentElement).getPropertyValue('--board-preview-scale').trim()`), '0.6', '最小ズーム');
    assert.equal(boardFacts.backgroundInsideGrid, true, '最小ズームの背景境界');
    await browser.clickSelector(cdp, page, '#board-preview-zoom-reset');
    await browser.clickSelector(cdp, page, '[data-board-orientation="vertical"]');
    boardFacts = await readFacts(cdp, page);
    assert.equal(boardFacts.verticalLabels, 3, '縦向きB1〜B3ラベル');
    assert.deepEqual(boardFacts.headings, ['B3', 'B2', 'B1'], '縦向きBラベル順');

    const profileManagerLink = await checkProfileAwareManagerLink(cdp, page, origin);

    // Compact shared headings stay visible on board/enemy at phone widths; apostle keeps its compact prefix rule.
    const headings = {};
    headings.board375 = await assertHeadings(cdp, page, origin, 375, BOARD_ROUTE, '.tool-head h1', 'ボードプレビュー', true);
    headings.enemy375 = await assertHeadings(cdp, page, origin, 375, ENEMY_ROUTE, '.enemy-status-header h1', '敵データ', true);
    headings.board320 = await assertHeadings(cdp, page, origin, 320, BOARD_ROUTE, '.tool-head h1', 'ボードプレビュー', true);
    headings.enemy320 = await assertHeadings(cdp, page, origin, 320, ENEMY_ROUTE, '.enemy-status-header h1', '敵データ', true);
    headings.enemy1280 = await assertHeadings(cdp, page, origin, 1280, ENEMY_ROUTE, '.enemy-status-header h1', '敵データ', true);
    headings.apostle375 = await assertHeadings(cdp, page, origin, 375, APOSTLE_ROUTE, '.apostle-data-page-title', '使徒データ', false);
    headings.apostle1280 = await assertHeadings(cdp, page, origin, 1280, APOSTLE_ROUTE, '.apostle-data-page-title', '使徒データ', true);

    await navigate(cdp, page, origin, BOARD_ROUTE, 375, 844);
    const screenshotMobile = await capture(cdp, page, `${SCREENSHOT_PREFIX}-375.png`);
    await navigate(cdp, page, origin, BOARD_ROUTE, 1280, 900);
    const screenshotDesktop = await capture(cdp, page, `${SCREENSHOT_PREFIX}-1280.png`);
    console.log(JSON.stringify({
      ok: true, root: ROOT,
      requiredReproduction: {
        expanded721x480: summarize(low), expanded721x480WithNotice: summarize(withNotice),
        collapsed721x480: summarize(collapsed), expanded375x480: summarize(mobileLow), collapsed375x480: summarize(mobileClosed)
      },
      responsive, headings, themeToggle, profileManagerLink,
      screenshots: [screenshot721, screenshot375, screenshotMobile, screenshotDesktop]
    }, null, 2));
  } finally {
    try { cdp?.close(); } catch (_) {}
    try { chrome?.kill(); } catch (_) {}
    try { server.close(); } catch (_) {}
    try { fs.rmSync(profileRoot, { recursive: true, force: true }); } catch (_) {}
  }
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
