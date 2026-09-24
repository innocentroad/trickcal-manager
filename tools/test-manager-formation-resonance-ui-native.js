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

async function openPage(cdp, url, width = 1280, height = 900, mobile = false) {
  const page = await browser.createPage(cdp, url);
  await cdp.send('Page.enable', {}, page.sessionId);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile }, page.sessionId);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `innerWidth === ${width}`), { timeoutMs: 5000 });
  return page;
}

async function waitReady(cdp, page) {
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    "document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_STAT_ENGINE"), { timeoutMs: 30000 });
  await browser.evaluate(cdp, page, 'document.querySelector("#trickcal-announcements-dialog")?.close()');
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    "document.querySelector('[data-dashboard-panel=formation]')?.classList.contains('is-active') === true"));
}

async function readFormation(cdp, page) {
  return browser.evaluate(cdp, page, 'window.TRICKCAL_STAT_ENGINE.getState().formation');
}

async function pressKey(cdp, page, key) {
  const keys = { Escape: [27, 'Escape'], Enter: [13, 'Enter'], ' ': [32, 'Space'] };
  const [code, keyCode] = keys[key] || [undefined, key];
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown', key: keyCode, code: key === ' ' ? 'Space' : keyCode,
    ...(code ? { windowsVirtualKeyCode: code, nativeVirtualKeyCode: code } : {})
  }, page.sessionId);
  if (key === 'Enter' || key === ' ') {
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'char', key: keyCode, code: key === ' ' ? 'Space' : keyCode,
      text: key === ' ' ? ' ' : '\r', unmodifiedText: key === ' ' ? ' ' : '\r',
      windowsVirtualKeyCode: code, nativeVirtualKeyCode: code
    }, page.sessionId);
  }
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp', key: keyCode, code: key === ' ' ? 'Space' : keyCode,
    ...(code ? { windowsVirtualKeyCode: code, nativeVirtualKeyCode: code } : {})
  }, page.sessionId);
}

async function pressShiftTab(cdp, page) {
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown', key: 'Tab', code: 'Tab', modifiers: 8,
    windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9
  }, page.sessionId);
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp', key: 'Tab', code: 'Tab', modifiers: 8,
    windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9
  }, page.sessionId);
}

async function capture(cdp, page, filename) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
  fs.mkdirSync(path.join(ROOT, 'tmp'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'tmp', filename), Buffer.from(result.data, 'base64'));
}

async function revealBulkJoanneRow(cdp, page) {
  const rowSelector = '#apostle-bulk-list [data-apostle-bulk-row="Joanne"]';
  await browser.evaluate(cdp, page, `(() => {
    const row = document.querySelector(${JSON.stringify(rowSelector)});
    if (!row) return false;
    row.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    return true;
  })()`);
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `!!document.querySelector(${JSON.stringify(rowSelector)})`), { timeoutMs: 5000 });
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
    const row = document.querySelector(${JSON.stringify(rowSelector)});
    const images = [...(row?.querySelectorAll('.apostle-bulk-avatar img') || [])];
    return images.length === 1 && images.every(image => image.complete && image.naturalWidth > 0);
  })()`), { timeoutMs: 10000, intervalMs: 50 });

  const readFacts = async () => browser.evaluate(cdp, page, `(() => {
    const row = document.querySelector(${JSON.stringify(rowSelector)});
    const identity = row?.querySelector('.apostle-bulk-identity');
    const identityStyle = identity ? getComputedStyle(identity) : null;
    const portrait = row?.querySelector('.apostle-bulk-avatar > img');
    const rectOf = node => {
      if (!node || node.hidden || !node.getClientRects().length) return null;
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') return null;
      const r = node.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const rowRect = rectOf(row);
    const identityRect = rectOf(identity);
    const topbar = rectOf(document.querySelector('[data-shared-topbar-page]'));
    const followBar = rectOf(document.querySelector('.trickcal-announcements-follow-bar'));
    const bottomBar = rectOf(document.querySelector('.dashboard-bottom-bar'));
    const topBoundary = Math.max(0, topbar?.bottom || 0, followBar?.bottom || 0);
    const bottomBoundary = Math.min(innerHeight, bottomBar?.top ?? innerHeight);
    const images = [...(row?.querySelectorAll('.apostle-bulk-avatar img') || [])];
    const normalRow = [...document.querySelectorAll('#apostle-bulk-list .apostle-bulk-row:not(.is-resonance)')]
      .find(candidate => {
        const r = candidate.getBoundingClientRect();
        return r.left >= 0 && r.right <= innerWidth && r.top >= topBoundary && r.bottom <= bottomBoundary;
      });
    const normalIdentity = normalRow?.querySelector('.apostle-bulk-identity');
    const normalIdentityStyle = normalIdentity ? getComputedStyle(normalIdentity) : null;
    const centerX = identityRect ? identityRect.left + identityRect.width / 2 : 0;
    const centerY = identityRect ? identityRect.top + identityRect.height / 2 : 0;
    const hit = identityRect ? document.elementFromPoint(centerX, centerY) : null;
    const scrollAncestors = [];
    for (let parent = row?.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (parent.scrollHeight > parent.clientHeight + 1 && /(auto|scroll|overlay)/.test(style.overflowY)) {
        scrollAncestors.push({ id: parent.id || '', className: String(parent.className || ''), scrollTop: parent.scrollTop });
      }
    }
    return {
      theme: document.documentElement.dataset.theme || '',
      scroll: { x: scrollX, y: scrollY },
      scrollAncestors,
      viewport: { width: innerWidth, height: innerHeight },
      rowClass: row?.className || '',
      row: rowRect,
      identity: identityRect,
      normalRowId: normalRow?.dataset.apostleBulkRow || '',
      normalIdentity: rectOf(normalIdentity),
      normalIdentityStyle: normalIdentityStyle ? {
        borderRadius: normalIdentityStyle.borderRadius,
        padding: normalIdentityStyle.padding,
        borderTopWidth: normalIdentityStyle.borderTopWidth
      } : null,
      topBoundary,
      bottomBoundary,
      rowFullyVisible: !!rowRect && rowRect.left >= 0 && rowRect.right <= innerWidth
        && rowRect.top >= topBoundary && rowRect.bottom <= bottomBoundary,
      identityUncovered: !!identity && !!hit && (hit === identity || identity.contains(hit)),
      identityStyle: identityStyle ? {
        background: identityStyle.backgroundImage,
        borderRadius: identityStyle.borderRadius,
        padding: identityStyle.padding,
        borderTopWidth: identityStyle.borderTopWidth
      } : null,
      resonanceMarkAbsent: !row?.querySelector('.apostle-bulk-resonance-mark'),
      portraitLoaded: !!portrait?.complete && portrait.naturalWidth > 0,
      imageStates: images.map(image => ({ src: image.currentSrc || image.src, complete: image.complete, naturalWidth: image.naturalWidth }))
    };
  })()`);
  let previousFacts = await readFacts();
  const facts = await browser.waitFor(async () => {
    const currentFacts = await readFacts();
    if (JSON.stringify(currentFacts) !== JSON.stringify(previousFacts)) {
      previousFacts = currentFacts;
      return null;
    }
    return currentFacts;
  }, { timeoutMs: 5000, intervalMs: 100 });

  assert.ok(facts.rowFullyVisible, `一括設定のジョアン行が固定バー間に全表示される: ${JSON.stringify(facts)}`);
  assert.ok(facts.identityUncovered, `ジョアンの虹背景・共鳴アイコン領域が固定要素に隠れていない: ${JSON.stringify(facts)}`);
  assert.ok(facts.normalRowId, `通常使徒行もジョアンと同じ画面内に表示される: ${JSON.stringify(facts)}`);
  return facts;
}

async function captureAndVerifyBulkApostleRows(cdp, page) {
  await setViewport(cdp, page, 1280, 900, false);
  await browser.clickSelector(cdp, page, '[data-topbar-menu-trigger="bulk"]');
  await browser.waitForSelector(cdp, page, '[data-topbar-menu="bulk"][open]');
  await browser.clickSelector(cdp, page, '[data-topbar-bulk-target="apostles"]');
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    'document.querySelector("[data-setting-panel=apostles]")?.classList.contains("is-active") === true'));
  await setTheme(cdp, page, 'light');
  await browser.waitForSelector(cdp, page, '#apostle-bulk-list [data-apostle-bulk-row="Joanne"]');
  const bulkFacts = await revealBulkJoanneRow(cdp, page);
  assert.match(bulkFacts.rowClass, /is-resonance/, '一括使徒設定でジョアンの共鳴表示を有効化');
  assert.match(bulkFacts.identityStyle.background, /linear-gradient/, '一括使徒設定の使徒部分に通常行と同じ方向の虹グラデーション');
  assert.equal(bulkFacts.identityStyle.borderTopWidth, '0px', '一括設定の使徒名部分へ後付けの白枠を追加しない');
  assert.equal(bulkFacts.identityStyle.padding, bulkFacts.normalIdentityStyle.padding, 'ジョアンのidentity余白は通常行と一致');
  assert.equal(bulkFacts.identityStyle.borderRadius, bulkFacts.normalIdentityStyle.borderRadius, 'ジョアンのidentity角丸は通常行と一致');
  assert.equal(bulkFacts.identityStyle.borderTopWidth, bulkFacts.normalIdentityStyle.borderTopWidth, 'ジョアンのidentity枠は通常行と一致');
  assert.equal(bulkFacts.resonanceMarkAbsent, true, '一括設定から後付け共鳴バッジを撤去');
  assert.equal(bulkFacts.portraitLoaded, true, '一括使徒設定のジョアン画像を読み込む');
  await capture(cdp, page, 'manager-resonance-bulk-light-1280.png');

  await setTheme(cdp, page, 'dark');
  const bulkDarkFacts = await revealBulkJoanneRow(cdp, page);
  assert.equal(bulkDarkFacts.theme, 'dark', '一括使徒設定でテーマを即時切替');
  assert.notEqual(bulkDarkFacts.identityStyle.background, bulkFacts.identityStyle.background, '一括使徒設定はテーマ切替後に配色を更新');
  assert.equal(bulkDarkFacts.resonanceMarkAbsent, true, 'ダークでも後付け共鳴バッジを追加しない');
  await capture(cdp, page, 'manager-resonance-bulk-dark-1280.png');

  await setViewport(cdp, page, 375, 844, true);
  const bulkMobileDarkFacts = await revealBulkJoanneRow(cdp, page);
  assert.equal(bulkMobileDarkFacts.theme, 'dark', 'スマホ撮影前にダーク状態を維持');
  assert.match(bulkMobileDarkFacts.identityStyle.background, /linear-gradient/, '375pxダークのジョアン共鳴虹背景');
  assert.equal(bulkMobileDarkFacts.resonanceMarkAbsent, true, '375pxダークで後付け共鳴バッジを表示しない');
  assert.equal(bulkMobileDarkFacts.portraitLoaded, true, '375pxダークのジョアン画像読込');
  await capture(cdp, page, 'manager-resonance-bulk-dark-375.png');

  await setTheme(cdp, page, 'light');
  const bulkMobileLightFacts = await revealBulkJoanneRow(cdp, page);
  assert.equal(bulkMobileLightFacts.theme, 'light', 'スマホ撮影前にライト状態を維持');
  assert.notEqual(bulkMobileLightFacts.identityStyle.background, bulkMobileDarkFacts.identityStyle.background,
    '375pxで一括設定のライト／ダーク配色を区別');
  assert.match(bulkMobileLightFacts.identityStyle.background, /linear-gradient/, '375pxライトのジョアン共鳴虹背景');
  assert.equal(bulkMobileLightFacts.resonanceMarkAbsent, true, '375pxライトで後付け共鳴バッジを表示しない');
  assert.equal(bulkMobileLightFacts.portraitLoaded, true, '375pxライトのジョアン画像読込');
  await capture(cdp, page, 'manager-resonance-bulk-light-375.png');
  return { bulkFacts, bulkDarkFacts, bulkMobileDarkFacts, bulkMobileLightFacts };
}

async function centerFormationCard(cdp, page, selector) {
  await browser.evaluate(cdp, page, `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({ block: 'center', inline: 'center' })`);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
    const card = document.querySelector(${JSON.stringify(selector)});
    if (!card) return false;
    const rect = card.getBoundingClientRect();
    return rect.top >= 70 && rect.bottom <= innerHeight - 80;
  })()`), { timeoutMs: 3000 });
}

async function setTheme(cdp, page, theme) {
  const selector = '.dashboard-top-theme-toggle';
  const current = await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme || ""');
  if (current !== theme) await browser.clickSelector(cdp, page, selector);
  try {
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      `document.documentElement.dataset.theme === ${JSON.stringify(theme)}`), { timeoutMs: 2500 });
  } catch (_) {
    const facts = await browser.evaluate(cdp, page, `(() => ({
      expected: ${JSON.stringify(theme)}, root: document.documentElement.dataset.theme || '',
      body: document.body.className,
      button: (() => { const b=document.querySelector(${JSON.stringify(selector)}); return b ? {label:b.getAttribute('aria-label'),pressed:b.getAttribute('aria-pressed'),rect:(()=>{const r=b.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()} : null })()
    }))()`);
    throw new Error(`Theme button did not reach ${theme}: ${JSON.stringify(facts)}`);
  }
  const stored = await browser.evaluate(cdp, page, `({
    root:document.documentElement.dataset.theme || '', body:document.body.className,
    native:window.localStorage.getItem('trickcal_theme'),
    facade:window.TRICKCAL_STORAGE_FACADE?.localStorage?.getItem('trickcal_theme') || '',
    legacy:window.TRICKCAL_STORAGE_FACADE?.localStorage?.getItem('trickcal_stat_theme') || '',
    button:document.querySelector(${JSON.stringify(selector)})?.getAttribute('aria-pressed')
  })`);
  assert.equal(stored.native, theme, `テーマクリック後の共通保存値: ${JSON.stringify(stored)}`);
  assert.equal(stored.facade, theme, `テーマクリック後の管理保存値: ${JSON.stringify(stored)}`);
  assert.equal(stored.legacy, theme, `従来テーマ保存値との同期: ${JSON.stringify(stored)}`);
}

async function inspectManagerApostlePicker(cdp, page, theme, width, screenshotName) {
  await setTheme(cdp, page, theme);
  await setViewport(cdp, page, width, 844, width < 600);
  await browser.clickSelector(cdp, page, '.bottom-apostle-button');
  await browser.waitForSelector(cdp, page, '#apostle-picker-dialog[open]');
  await browser.waitForSelector(cdp, page, '#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
  await browser.evaluate(cdp, page, `(() => {
    const grid=document.querySelector('#apostle-picker-grid');
    const target=grid?.querySelector('[data-apostle-picker-id="Joanne"]');
    if (!grid || !target) return false;
    const gridRect=grid.getBoundingClientRect();
    const targetRect=target.getBoundingClientRect();
    grid.scrollTop += targetRect.top-gridRect.top-(grid.clientHeight-targetRect.height)/2;
    return true;
  })()`);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
    const grid=document.querySelector('#apostle-picker-grid');
    const joanne=grid?.querySelector('[data-apostle-picker-id="Joanne"]');
    if (!grid || !joanne) return false;
    const jr=joanne.getBoundingClientRect();
    const gr=grid.getBoundingClientRect();
    const ordinary=[...grid.querySelectorAll('.apostle-picker-card:not(.is-resonance)')]
      .find(card => Math.abs(card.getBoundingClientRect().top-jr.top)<1
        && card.getBoundingClientRect().left>=gr.left && card.getBoundingClientRect().right<=gr.right);
    return !!ordinary && [...joanne.querySelectorAll('.apostle-picker-art > img[data-apostle-image]'),
      ...ordinary.querySelectorAll('.apostle-picker-art > img[data-apostle-image]')]
      .every(image => image.complete && image.naturalWidth>0);
  })()`), { timeoutMs: 10000, intervalMs: 50 });
  const facts = await browser.evaluate(cdp, page, `(() => {
    const grid=document.querySelector('#apostle-picker-grid');
    const joanne=grid?.querySelector('[data-apostle-picker-id="Joanne"]');
    const jr=joanne?.getBoundingClientRect();
    const gr=grid?.getBoundingClientRect();
    const ordinary=[...grid.querySelectorAll('.apostle-picker-card:not(.is-resonance)')]
      .find(card => Math.abs(card.getBoundingClientRect().top-jr.top)<1
        && card.getBoundingClientRect().left>=gr.left && card.getBoundingClientRect().right<=gr.right);
    const art=joanne?.querySelector('.apostle-picker-art');
    const portrait=art?.querySelector('img[data-apostle-image]');
    const personality=art?.querySelector('.apostle-info-badge.personality');
    const name=joanne?.querySelector(':scope > strong');
    const cardStyle=joanne ? getComputedStyle(joanne) : null;
    const artStyle=art ? getComputedStyle(art) : null;
    const nameStyle=name ? getComputedStyle(name) : null;
    const panelStyle=joanne ? getComputedStyle(joanne,'::after') : null;
    const rect=node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
    const dialogRect=rect(document.querySelector('#apostle-picker-dialog'));
    const gridRect=rect(grid);
    const normalRect=ordinary ? rect(ordinary) : null;
    const beforeShadow=cardStyle?.boxShadow || '';
    const previouslySelected=joanne?.classList.contains('is-selected') || false;
    joanne?.classList.remove('is-selected');
    const unselectedShadow=getComputedStyle(joanne).boxShadow;
    joanne?.classList.add('is-selected');
    const selectedStyle={border:getComputedStyle(joanne).borderTopColor,shadow:getComputedStyle(joanne).boxShadow};
    if (!previouslySelected) joanne?.classList.remove('is-selected');
    const visible=node=>{
      if(!node)return false;
      const r=node.getBoundingClientRect();
      return r.left>=gr.left && r.right<=gr.right && r.top>=gr.top && r.bottom<=gr.bottom;
    };
    return {
      theme:document.documentElement.dataset.theme || '',
      master:window.TRICKCAL_STAT_DATA.getById('basicInfo','Joanne')?.性格 || '',
      classes:joanne?.className || '',
      name: name?.innerText || '',
      cardBackground:cardStyle?.backgroundImage || '',
      cardColor:cardStyle?.color || '',
      border:cardStyle?.borderTopColor || '',
      borderWidth:cardStyle?.borderTopWidth || '',
      baseShadow:unselectedShadow,
      beforeShadow,
      selectedStyle,
      artBackground:artStyle?.backgroundImage || '',
      namePanelBackground:panelStyle?.backgroundColor || '',
      nameColor:nameStyle?.color || '',
      personalitySrc:personality?.getAttribute('src') || '',
      portraitLoaded:!!portrait?.complete && portrait.naturalWidth>0,
      cardRect:rect(joanne), ordinaryRect:normalRect,
      cardVisible:visible(joanne), ordinaryVisible:visible(ordinary),
      dialogRect,gridRect
    };
  })()`);
  assert.equal(facts.theme, theme, `管理使徒一覧テーマ ${theme}/${width}px`);
  assert.match(facts.classes, /is-resonance/, '管理使徒一覧はマスター共鳴表示');
  assert.equal(facts.master, '共鳴', '管理使徒一覧はマスター性格を表示');
  assert.match(facts.personalitySrc, /性格_共鳴\.webp/, '管理使徒一覧の既存位置に共鳴アイコンを維持');
  assert.match(facts.artBackground, /linear-gradient/, '虹背景は画像領域に適用');
  assert.equal(facts.namePanelBackground, 'rgb(255, 255, 255)', '名前欄の背景は通常カード同様の白');
  assert.equal(facts.nameColor, 'rgb(31, 41, 51)', '名前は濃い文字色で読める');
  assert.equal(facts.cardColor, 'rgb(31, 41, 51)', 'カード全体の文字色を通常カードと揃える');
  assert.match(facts.border, /255, 255, 255/, '共鳴カードの白枠を維持');
  assert.equal(facts.borderWidth, '1px', '白枠を既存カードと同じ外寸で表示');
  assert.equal(facts.portraitLoaded, true, 'ジョアン画像の読込');
  assert.ok(facts.cardVisible && facts.ordinaryVisible, `ジョアンと通常使徒を同じ画面に表示 (${width}px)`);
  assert.ok(Math.abs(facts.cardRect.width-facts.ordinaryRect.width)<0.5
    && Math.abs(facts.cardRect.height-facts.ordinaryRect.height)<0.5,
  `共鳴／通常カードの寸法一致 (${width}px): ${JSON.stringify({resonance:facts.cardRect,ordinary:facts.ordinaryRect})}`);
  assert.match(facts.selectedStyle.border, /255, 255, 255/, '選択表示でも共鳴の白枠を維持');
  assert.notEqual(facts.selectedStyle.shadow, facts.baseShadow, '選択強調は外側のshadowで区別');
  await capture(cdp, page, screenshotName);
  await pressKey(cdp, page, 'Escape');
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    'document.querySelector("#apostle-picker-dialog")?.open === false'));
  return facts;
}

async function openSlotPicker(cdp, page, row, line) {
  await browser.clickSelector(cdp, page, `[data-formation-apostle-row="${row}"][data-formation-line="${line}"]`);
  await browser.waitForSelector(cdp, page, '#formation-picker-dialog[open]');
}

async function filterApostlePickerToJoanne(cdp, page) {
  await browser.clickSelector(cdp, page, '#formation-picker-search');
  await cdp.send('Input.insertText', { text: 'Joanne' }, page.sessionId);
  await browser.waitForSelector(cdp, page,
    '#formation-picker-grid .formation-picker-option.is-resonance-option[data-formation-picker-value="Joanne"]');
}

async function inspectResonanceApostlePicker(cdp, page, theme, width, screenshotName) {
  await setTheme(cdp, page, theme);
  await setViewport(cdp, page, width, 844, width < 600);
  await openSlotPicker(cdp, page, 0, 0);
  const unfiltered = await browser.evaluate(cdp, page, `(() => {
    const option = document.querySelector('#formation-picker-grid [data-formation-picker-value="Joanne"]');
    if (!option) return null;
    const rect = element => { const r=element.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; };
    const optionRect = rect(option);
    const normal = [...document.querySelectorAll('#formation-picker-grid .formation-picker-option:not(.is-clear):not(.is-resonance-option)')]
      .find(candidate => Math.abs(rect(candidate).y - optionRect.y) < 1);
    return {className:option.className, rect:optionRect, normalRect:normal ? rect(normal) : null,
      rowGap:getComputedStyle(document.querySelector('#formation-picker-grid')).rowGap,
      master:window.TRICKCAL_STAT_DATA.getById('basicInfo','Joanne')?.性格 || '',
      optionCount:document.querySelectorAll('#formation-picker-grid .formation-picker-option:not(.is-clear)').length};
  })()`);
  assert.ok(unfiltered, `共鳴使徒ジョアンが使徒一覧にある (${width}px)`);
  assert.match(unfiltered.className, /is-resonance-option/, '共鳴表示は専用クラスで判定');
  assert.match(unfiltered.className, /personality-共鳴/, '一覧表示はマスター性格を使用');
  assert.equal(unfiltered.master, '共鳴', '表示判定はマスター性格を参照');
  assert.ok(unfiltered.normalRect, `同じ行に比較用の通常使徒がある (${width}px)`);
  assert.equal(unfiltered.rect.width, unfiltered.normalRect.width, `通常／共鳴使徒の幅一致 (${width}px)`);
  assert.equal(unfiltered.rect.height, unfiltered.normalRect.height, `通常／共鳴使徒の高さ一致 (${width}px)`);

  await filterApostlePickerToJoanne(cdp, page);
  const facts = await browser.evaluate(cdp, page, `(() => {
    const option = document.querySelector('#formation-picker-grid [data-formation-picker-value="Joanne"]');
    const marker = option?.querySelector('.formation-picker-resonance-mark');
    const icon = marker?.querySelector('img');
    const portrait = option?.querySelector('.formation-picker-option-image-wrap > img[data-apostle-image]');
    const rect = element => { const r=element.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; };
    const optionRect = rect(option);
    const dialogRect = rect(document.querySelector('#formation-picker-dialog'));
    const iconRect = rect(marker);
    const portraitRect = rect(portrait);
    const overlapWidth = Math.max(0, Math.min(iconRect.x + iconRect.width, portraitRect.x + portraitRect.width) - Math.max(iconRect.x, portraitRect.x));
    const overlapHeight = Math.max(0, Math.min(iconRect.y + iconRect.height, portraitRect.y + portraitRect.height) - Math.max(iconRect.y, portraitRect.y));
    return {theme:document.documentElement.dataset.theme, master:window.TRICKCAL_STAT_DATA.getById('basicInfo','Joanne')?.性格 || '',
      classes:option.className, text:option.innerText, border:getComputedStyle(option).borderTopColor,
      background:getComputedStyle(option).backgroundImage, boxShadow:getComputedStyle(option).boxShadow,
      optionRect, dialogRect, marker:rect(marker), markerLoaded:!!icon?.complete && icon.naturalWidth > 0,
      markerHidden:marker?.getAttribute('aria-hidden'), iconAlt:icon?.getAttribute('alt'),
      markerPosition:{top:marker?.offsetTop,left:marker?.offsetLeft,width:marker?.offsetWidth,height:marker?.offsetHeight},
      portraitLoaded:!!portrait?.complete && portrait.naturalWidth > 0,
      portraitOverlapRatio:overlapWidth * overlapHeight / Math.max(1, portraitRect.width * portraitRect.height),
      focused:document.activeElement === option, focusVisible:option.matches(':focus-visible'),
      outline:getComputedStyle(option).outlineStyle, outlineColor:getComputedStyle(option).outlineColor,
      displayed:optionRect.width > 0 && optionRect.height > 0 && optionRect.x >= dialogRect.x
        && optionRect.x + optionRect.width <= dialogRect.x + dialogRect.width
        && optionRect.y >= dialogRect.y && optionRect.y + optionRect.height <= dialogRect.y + dialogRect.height};
  })()`);
  assert.equal(facts.theme, theme, `使徒一覧のテーマ ${theme}/${width}px`);
  assert.match(facts.classes, /is-resonance-option/, '一覧で共鳴専用クラスを維持');
  assert.equal(facts.master, '共鳴', '選択中の枠性格ではなくマスター性格を表示');
  assert.match(facts.border, /255, 255, 255|248, 250, 252/, `白枠 ${theme}/${width}px: ${facts.border}`);
  assert.match(facts.background, /linear-gradient/, '共鳴専用の虹背景');
  assert.equal(facts.markerLoaded, true, '共鳴アイコン画像を読み込む');
  assert.equal(facts.markerHidden, 'true', '共鳴アイコンは装飾扱い');
  assert.equal(facts.iconAlt, '', '共鳴アイコンに重複読み上げを付けない');
  assert.equal(facts.portraitLoaded, true, '一覧のジョアン画像を読み込む');
  assert.ok(facts.markerPosition.left < 0 && facts.markerPosition.top < 0, 'アイコンを画像枠左上へ重ねる');
  assert.ok(facts.portraitOverlapRatio > 0 && facts.portraitOverlapRatio < 0.2,
    `アイコンが使徒画像の特徴を覆い過ぎない: ${facts.portraitOverlapRatio}`);
  assert.equal(facts.displayed, true, `ジョアン選択肢を実画面内へ表示 (${width}px)`);

  for (let tab = 0; tab < 10 && !facts.focused; tab += 1) {
    await pressKey(cdp, page, 'Tab');
    facts.focused = await browser.evaluate(cdp, page,
      'document.activeElement?.dataset?.formationPickerValue === "Joanne"');
  }
  assert.equal(facts.focused, true, `Tabでジョアン選択肢へ到達 (${width}px)`);
  const focusFacts = await browser.evaluate(cdp, page, `(() => {
    const option=document.querySelector('#formation-picker-grid [data-formation-picker-value="Joanne"]');
    return {visible:option.matches(':focus-visible'), outline:getComputedStyle(option).outlineStyle,
      border:getComputedStyle(option).borderTopColor};
  })()`);
  assert.equal(focusFacts.visible, true, `キーボード焦点表示 (${theme}/${width}px)`);
  assert.equal(focusFacts.outline, 'solid', 'フォーカス輪郭を維持');
  assert.match(focusFacts.border, /255, 255, 255|248, 250, 252/, 'フォーカス中も白枠を維持');
  const selectedStyle = await browser.evaluate(cdp, page, `(() => {
    const option=document.querySelector('#formation-picker-grid [data-formation-picker-value="Joanne"]');
    option.classList.add('is-selected');
    const result={border:getComputedStyle(option).borderTopColor,shadow:getComputedStyle(option).boxShadow};
    option.classList.remove('is-selected');
    return result;
  })()`);
  assert.match(selectedStyle.border, /255, 255, 255|248, 250, 252/, '選択表示でも共鳴白枠を維持');
  assert.notEqual(selectedStyle.shadow, facts.boxShadow, '選択リングを共鳴枠色から分離');
  await capture(cdp, page, screenshotName);

  const hoverFacts = await browser.evaluate(cdp, page, `(() => {
    const option=document.querySelector('#formation-picker-grid [data-formation-picker-value="Joanne"]');
    const r=option.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+r.height/2};
  })()`);
  await cdp.send('Input.dispatchMouseEvent', { type:'mouseMoved', x:hoverFacts.x, y:hoverFacts.y, button:'none' }, page.sessionId);
  const afterHover = await browser.evaluate(cdp, page, `(() => {
    const option=document.querySelector('#formation-picker-grid [data-formation-picker-value="Joanne"]');
    return {hover:option.matches(':hover'), border:getComputedStyle(option).borderTopColor, shadow:getComputedStyle(option).boxShadow};
  })()`);
  assert.equal(afterHover.hover, true, `ポインターhoverを実適用 (${width}px)`);
  assert.match(afterHover.border, /255, 255, 255|248, 250, 252/, 'hover中も白枠を維持');

  await pressKey(cdp, page, 'Escape');
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    'document.querySelector("#formation-picker-dialog")?.open === false'));
  assert.equal(await browser.evaluate(cdp, page,
    'document.activeElement?.dataset?.formationApostleRow === "0" && document.activeElement?.dataset?.formationLine === "0"'),
  true, '一覧を閉じると配置元へフォーカス復帰');
  return {theme,width,unfiltered,facts,focusFacts,selectedStyle,hover:afterHover};
}

async function pickApostle(cdp, page, row, line, id) {
  await openSlotPicker(cdp, page, row, line);
  await browser.waitForSelector(cdp, page, `#formation-picker-grid [data-formation-picker-value="${id}"]`);
  await browser.clickSelector(cdp, page, `#formation-picker-grid [data-formation-picker-value="${id}"]`);
  if (id === 'Joanne' || id === 'Amelia' && await browser.evaluate(cdp, page,
    'window.TRICKCAL_STAT_DATA.getById("basicInfo", "Amelia")?.性格 === "共鳴"')) {
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="冷静"]');
  }
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `window.TRICKCAL_STAT_ENGINE.getState().formation.rows[${row}].apostles[${line}] === ${JSON.stringify(id)}`));
}

async function assignArtifact(cdp, page, row, line) {
  await browser.clickSelector(cdp, page,
    `[data-formation-artifact-row="${row}"][data-formation-artifact-line="${line}"][data-formation-artifact-slot="0"]`);
  await browser.waitForSelector(cdp, page, '#formation-picker-dialog[open]');
  const cardOptionFacts = await browser.evaluate(cdp, page, `(() => ({
    resonanceOptions:document.querySelectorAll('#formation-picker-grid .formation-picker-option.is-resonance-option').length,
    resonanceMarkers:document.querySelectorAll('#formation-picker-grid .formation-picker-resonance-mark').length
  }))()`);
  assert.deepEqual(cardOptionFacts, {resonanceOptions:0,resonanceMarkers:0}, '遺物候補DOMへ共鳴スタイル・アイコンを漏らさない');
  const id = await browser.evaluate(cdp, page,
    'document.querySelector("#formation-picker-grid [data-formation-picker-value]:not(.is-clear)")?.dataset.formationPickerValue || ""');
  assert.ok(id, 'fixture用の装備カード候補');
  await browser.clickSelector(cdp, page, `#formation-picker-grid [data-formation-picker-value=${JSON.stringify(id)}]`);
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `window.TRICKCAL_STAT_ENGINE.getState().formation.rows[${row}].artifacts[${line}][0] === ${JSON.stringify(id)}`));
  return id;
}

async function saveFormationPreset(cdp, page, name) {
  await browser.clickSelector(cdp, page, '#formation-save-current');
  await browser.evaluate(cdp, page, `(() => {
    const input = document.querySelector('#formation-save-name');
    if (input) input.value = ${JSON.stringify(name)};
  })()`);
  await browser.clickSelector(cdp, page, '#formation-save-confirm');
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `window.TRICKCAL_STAT_ENGINE.getState().savedFormations.some(preset => preset.name === ${JSON.stringify(name)})`));
  return browser.evaluate(cdp, page,
    `window.TRICKCAL_STAT_ENGINE.getState().savedFormations.find(preset => preset.name === ${JSON.stringify(name)})?.id || ''`);
}

async function setViewport(cdp, page, width, height, mobile = false) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile }, page.sessionId);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `innerWidth === ${width}`), { timeoutMs: 5000 });
}

async function run() {
  const serverPort = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([serverPort]);
  const origin = `http://127.0.0.1:${serverPort}`;
  const server = startServer(serverPort);
  const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-manager-resonance-ui-'));
  const pages = [];
  let chrome = null;
  let cdp = null;
  try {
    await browser.waitForHttp(`${origin}/stat-dashboard.html`);
    ({ chrome, cdp } = await launchChrome(cdpPort, profileRoot));
    const page = await openPage(cdp, `${origin}/stat-dashboard.html?view=formation&resonanceUiNative=1`);
    pages.push(page);
    await waitReady(cdp, page);
    await browser.waitForSelector(cdp, page, '#formation-board [data-formation-apostle-row="0"][data-formation-line="0"]');
    const initialTheme = await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme || ""');
    const initialThemeFacts = await browser.evaluate(cdp, page, `(() => ({
      root:document.documentElement.dataset.theme || '', bodyDark:document.body.classList.contains('theme-dark'),
      bodyLight:document.body.classList.contains('theme-light'),
      pressed:document.querySelector('.dashboard-top-theme-toggle')?.getAttribute('aria-pressed')
    }))()`);
    assert.equal(initialThemeFacts.root, initialTheme, '起動時rootテーマを取得');
    assert.equal(initialThemeFacts.bodyDark, initialTheme === 'dark', '起動時bodyテーマとrootを一致');
    assert.equal(initialThemeFacts.bodyLight, initialTheme === 'light', '起動時bodyテーマとrootを一致');
    assert.equal(initialThemeFacts.pressed, String(initialTheme === 'dark'), '起動時テーマボタン状態');

    if (process.argv.includes('--display-polish-capture-only')) {
      const statusPickerVisuals=[];
      for (const [theme,width,screenshot] of [
        ['light',1280,'manager-resonance-status-picker-light-1280.png'],
        ['dark',1280,'manager-resonance-status-picker-dark-1280.png'],
        ['light',375,'manager-resonance-status-picker-light-375.png'],
        ['dark',375,'manager-resonance-status-picker-dark-375.png']
      ]) statusPickerVisuals.push(await inspectManagerApostlePicker(cdp,page,theme,width,screenshot));

      await setViewport(cdp,page,1280,900,false);
      await browser.clickSelector(cdp,page,'.bottom-apostle-button');
      await browser.waitForSelector(cdp,page,'#apostle-picker-dialog[open]');
      await browser.clickSelector(cdp,page,'#apostle-picker-search');
      await cdp.send('Input.insertText',{text:'ジョアン'},page.sessionId);
      await browser.waitForSelector(cdp,page,'#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
      await browser.clickSelector(cdp,page,'#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
      await browser.waitFor(async()=>browser.evaluate(cdp,page,
        'document.querySelector("#bottom-apostle-name")?.textContent.trim()==="ジョアン"'));

      let ordinarySlot=await browser.evaluate(cdp,page,`(() => {
        const slot=document.querySelector('#formation-board .formation-apostle-slot.is-filled:not(.is-resonance)');
        return slot ? {row:slot.dataset.formationApostleRow,line:slot.dataset.formationLine} : null;
      })()`);
      if(!ordinarySlot){
        const fixture=await browser.evaluate(cdp,page,`(() => {
          const rows=window.TRICKCAL_STAT_ENGINE.getState().formation.rows;
          const slot=rows.flatMap((row,rowIndex)=>(row.apostles||[]).map((id,lineIndex)=>({id,row:rowIndex,line:lineIndex})))
            .find(item=>!item.id);
          const apostle=window.TRICKCAL_STAT_DATA.sheets.basicInfo.find(row=>row.性格!=='共鳴' && row.id!=='Joanne');
          return slot && apostle ? {slot,apostleId:apostle.id} : null;
        })()`);
        assert.ok(fixture,'通常使徒を1名置ける隔離fixture枠');
        await pickApostle(cdp,page,fixture.slot.row,fixture.slot.line,fixture.apostleId);
        ordinarySlot={row:String(fixture.slot.row),line:String(fixture.slot.line)};
      }

      const bottomVisuals=[];
      for(const [theme,width,screenshot] of [
        ['light',1280,'manager-resonance-bottom-bar-light-1280.png'],
        ['dark',1280,'manager-resonance-bottom-bar-dark-1280.png'],
        ['light',375,'manager-resonance-bottom-bar-light-375.png'],
        ['dark',375,'manager-resonance-bottom-bar-dark-375.png']
      ]){
        await setViewport(cdp,page,width,844,width<600);
        await setTheme(cdp,page,theme);
        const normalSelector=`.formation-apostle-slot.is-filled:not(.is-resonance)[data-formation-apostle-row="${ordinarySlot.row}"][data-formation-line="${ordinarySlot.line}"]`;
        await centerFormationCard(cdp,page,normalSelector);
        const facts=await browser.evaluate(cdp,page,`(() => {
          const button=document.querySelector('.bottom-apostle-button');
          const normal=document.querySelector(${JSON.stringify(normalSelector)});
          const portrait=button?.querySelector('#bottom-apostle-image');
          const normalPortrait=normal?.querySelector('.formation-apostle-img');
          const r=normal?.getBoundingClientRect();
          const bar=document.querySelector('.dashboard-bottom-bar')?.getBoundingClientRect();
          return {theme:document.documentElement.dataset.theme,name:document.querySelector('#bottom-apostle-name')?.textContent.trim()||'',
            resonance:button?.classList.contains('is-resonance')||false,
            background:getComputedStyle(button).backgroundImage,border:getComputedStyle(button).borderTopColor,
            markAbsent:!button?.querySelector('.bottom-apostle-resonance-mark'),
            portraitLoaded:!!portrait?.complete&&portrait.naturalWidth>0,
            ordinaryId:normal?.dataset.formationApostleRow+'-'+normal?.dataset.formationLine,
            ordinaryVisible:!!r&&r.top>=0&&r.bottom<=(bar?.top??innerHeight),
            ordinaryImageLoaded:!!normalPortrait?.complete&&normalPortrait.naturalWidth>0};
        })()`);
        assert.equal(facts.theme,theme,`下バー撮影テーマ ${theme}/${width}`);
        assert.equal(facts.name,'ジョアン','下バーにジョアン名');
        assert.equal(facts.resonance,true,'下バーの共鳴判定はマスター性格');
        assert.equal(facts.markAbsent,true,'下バーの後付けバッジがない');
        assert.equal(facts.portraitLoaded,true,'下バーのジョアン画像が表示される');
        assert.ok(facts.ordinaryVisible&&facts.ordinaryImageLoaded,'通常使徒も同じ画面内に表示され画像を読み込む');
        bottomVisuals.push(facts);
        await capture(cdp,page,screenshot);
      }

      const bulkVisuals=await captureAndVerifyBulkApostleRows(cdp,page);
      console.log(JSON.stringify({ok:true,mode:'display-polish-capture-only',initialTheme,
        observed:{statusPickerVisuals,bottomVisuals,bulkVisuals},
        screenshots:[
          'tmp/manager-resonance-status-picker-light-1280.png','tmp/manager-resonance-status-picker-dark-1280.png',
          'tmp/manager-resonance-status-picker-light-375.png','tmp/manager-resonance-status-picker-dark-375.png',
          'tmp/manager-resonance-bottom-bar-light-1280.png','tmp/manager-resonance-bottom-bar-dark-1280.png',
          'tmp/manager-resonance-bottom-bar-light-375.png','tmp/manager-resonance-bottom-bar-dark-375.png',
          'tmp/manager-resonance-bulk-light-375.png','tmp/manager-resonance-bulk-dark-375.png'
        ]}));
      return;
    }

    if (process.argv.includes('--display-polish-capture-only')) {
      const statusPickerVisuals=[];
      for (const [theme,width,screenshot] of [
        ['light',1280,'manager-resonance-status-picker-light-1280.png'],
        ['dark',1280,'manager-resonance-status-picker-dark-1280.png'],
        ['light',375,'manager-resonance-status-picker-light-375.png'],
        ['dark',375,'manager-resonance-status-picker-dark-375.png']
      ]) statusPickerVisuals.push(await inspectManagerApostlePicker(cdp,page,theme,width,screenshot));

      await setViewport(cdp,page,1280,900,false);
      await browser.clickSelector(cdp,page,'.bottom-apostle-button');
      await browser.waitForSelector(cdp,page,'#apostle-picker-dialog[open]');
      await browser.clickSelector(cdp,page,'#apostle-picker-search');
      await cdp.send('Input.insertText',{text:'ジョアン'},page.sessionId);
      await browser.waitForSelector(cdp,page,'#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
      await browser.clickSelector(cdp,page,'#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
      await browser.waitFor(async()=>browser.evaluate(cdp,page,
        'document.querySelector("#bottom-apostle-name")?.textContent.trim()==="ジョアン"'));

      let ordinarySlot=await browser.evaluate(cdp,page,`(() => {
        const slot=document.querySelector('#formation-board .formation-apostle-slot.is-filled:not(.is-resonance)');
        return slot ? {row:slot.dataset.formationApostleRow,line:slot.dataset.formationLine} : null;
      })()`);
      if(!ordinarySlot){
        const fixture=await browser.evaluate(cdp,page,`(() => {
          const rows=window.TRICKCAL_STAT_ENGINE.getState().formation.rows;
          const slot=rows.flatMap((row,rowIndex)=>(row.apostles||[]).map((id,lineIndex)=>({id,row:rowIndex,line:lineIndex})))
            .find(item=>!item.id);
          const apostle=window.TRICKCAL_STAT_DATA.sheets.basicInfo.find(row=>row.性格!=='共鳴' && row.id!=='Joanne');
          return slot && apostle ? {slot,apostleId:apostle.id} : null;
        })()`);
        assert.ok(fixture,'通常使徒を1名置ける隔離fixture枠');
        await pickApostle(cdp,page,fixture.slot.row,fixture.slot.line,fixture.apostleId);
        ordinarySlot={row:String(fixture.slot.row),line:String(fixture.slot.line)};
      }

      const bottomVisuals=[];
      for(const [theme,width,screenshot] of [
        ['light',1280,'manager-resonance-bottom-bar-light-1280.png'],
        ['dark',1280,'manager-resonance-bottom-bar-dark-1280.png'],
        ['light',375,'manager-resonance-bottom-bar-light-375.png'],
        ['dark',375,'manager-resonance-bottom-bar-dark-375.png']
      ]){
        await setViewport(cdp,page,width,844,width<600);
        await setTheme(cdp,page,theme);
        const normalSelector=`.formation-apostle-slot.is-filled:not(.is-resonance)[data-formation-apostle-row="${ordinarySlot.row}"][data-formation-line="${ordinarySlot.line}"]`;
        await centerFormationCard(cdp,page,normalSelector);
        const facts=await browser.evaluate(cdp,page,`(() => {
          const button=document.querySelector('.bottom-apostle-button');
          const normal=document.querySelector(${JSON.stringify(normalSelector)});
          const portrait=button?.querySelector('#bottom-apostle-image');
          const normalPortrait=normal?.querySelector('.formation-apostle-img');
          const r=normal?.getBoundingClientRect();
          const bar=document.querySelector('.dashboard-bottom-bar')?.getBoundingClientRect();
          return {theme:document.documentElement.dataset.theme,name:document.querySelector('#bottom-apostle-name')?.textContent.trim()||'',
            resonance:button?.classList.contains('is-resonance')||false,
            background:getComputedStyle(button).backgroundImage,border:getComputedStyle(button).borderTopColor,
            markAbsent:!button?.querySelector('.bottom-apostle-resonance-mark'),
            portraitLoaded:!!portrait?.complete&&portrait.naturalWidth>0,
            ordinaryId:normal?.dataset.formationApostleRow+'-'+normal?.dataset.formationLine,
            ordinaryVisible:!!r&&r.top>=0&&r.bottom<=(bar?.top??innerHeight),
            ordinaryImageLoaded:!!normalPortrait?.complete&&normalPortrait.naturalWidth>0};
        })()`);
        assert.equal(facts.theme,theme,`下バー撮影テーマ ${theme}/${width}`);
        assert.equal(facts.name,'ジョアン','下バーにジョアン名');
        assert.equal(facts.resonance,true,'下バーの共鳴判定はマスター性格');
        assert.equal(facts.markAbsent,true,'下バーの後付けバッジがない');
        assert.equal(facts.portraitLoaded,true,'下バーのジョアン画像が表示される');
        assert.ok(facts.ordinaryVisible&&facts.ordinaryImageLoaded,'通常使徒も同じ画面内に表示され画像を読み込む');
        bottomVisuals.push(facts);
        await capture(cdp,page,screenshot);
      }

      const bulkVisuals=await captureAndVerifyBulkApostleRows(cdp,page);
      console.log(JSON.stringify({ok:true,mode:'display-polish-capture-only',initialTheme,
        observed:{statusPickerVisuals,bottomVisuals,bulkVisuals},
        screenshots:[
          'tmp/manager-resonance-status-picker-light-1280.png','tmp/manager-resonance-status-picker-dark-1280.png',
          'tmp/manager-resonance-status-picker-light-375.png','tmp/manager-resonance-status-picker-dark-375.png',
          'tmp/manager-resonance-bottom-bar-light-1280.png','tmp/manager-resonance-bottom-bar-dark-1280.png',
          'tmp/manager-resonance-bottom-bar-light-375.png','tmp/manager-resonance-bottom-bar-dark-375.png',
          'tmp/manager-resonance-bulk-light-375.png','tmp/manager-resonance-bulk-dark-375.png'
        ]}));
      return;
    }

    if (process.argv.includes('--bulk-capture-only')) {
      const bulkVisuals = await captureAndVerifyBulkApostleRows(cdp, page);
      console.log(JSON.stringify({ ok: true, mode: 'bulk-capture-only', initialTheme, observed: bulkVisuals,
        screenshots: ['tmp/manager-resonance-bulk-dark-375.png', 'tmp/manager-resonance-bulk-light-375.png'] }));
      return;
    }

    const before = await browser.evaluate(cdp, page, `(() => {
      const formation = window.TRICKCAL_STAT_ENGINE.getState().formation;
      return { formation: JSON.stringify(formation), undoDisabled: document.querySelector('#history-undo')?.disabled ?? true,
        redoDisabled: document.querySelector('#history-redo')?.disabled ?? true };
    })()`);
    const target = { row: 0, line: 0 };
    assert.equal((await readFormation(cdp, page)).rows[target.row].apostles[target.line] || '', '', '隔離確認プロファイルの新規配置枠');

    const resonancePickerVisuals = [];
    for (const [theme,width,screenshot] of [
      ['dark',1280,'manager-resonance-apostle-picker-dark-1280.png'],
      ['light',1280,'manager-resonance-apostle-picker-light-1280.png'],
      ['dark',375,'manager-resonance-apostle-picker-dark-375.png'],
      ['light',375,'manager-resonance-apostle-picker-light-375.png']
    ]) {
      resonancePickerVisuals.push(await inspectResonanceApostlePicker(cdp, page, theme, width, screenshot));
    }
    assert.notEqual(resonancePickerVisuals[0].facts.background, resonancePickerVisuals[1].facts.background,
      '使徒一覧の共鳴背景はライト／ダークで別定義');
    assert.notEqual(resonancePickerVisuals[2].facts.background, resonancePickerVisuals[3].facts.background,
      '375pxでも使徒一覧の共鳴背景をテーマ別に切替');
    await setViewport(cdp, page, 1280, 900, false);
    await setTheme(cdp, page, initialTheme);

    await openSlotPicker(cdp, page, target.row, target.line);
    const apostleModeFacts = await browser.evaluate(cdp, page, `(() => ({
      toolsVisible: !document.querySelector('.formation-picker-tools')?.hidden,
      sortVisible: !document.querySelector('#formation-picker-sort-wrap')?.hidden,
      filtersVisible: !document.querySelector('#formation-filter-details')?.hidden,
      searchTabIndex: document.querySelector('#formation-picker-search')?.tabIndex
    }))()`);
    assert.equal(apostleModeFacts.toolsVisible && apostleModeFacts.sortVisible && apostleModeFacts.filtersVisible, true,
      '通常の使徒選択では検索・並び替え・絞り込みを維持');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="Joanne"]');
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    const pendingFacts = await browser.evaluate(cdp, page, `(() => ({
      values: [...document.querySelectorAll('#formation-picker-grid [data-formation-picker-value]')].map(button => button.dataset.formationPickerValue),
      toolsHidden: document.querySelector('.formation-picker-tools')?.hidden,
      filtersHidden: document.querySelector('#formation-filter-details')?.hidden,
      selectedApostle: window.TRICKCAL_STAT_ENGINE.getState().formation.rows[0].apostles[0] || '',
      undoDisabled: document.querySelector('#history-undo')?.disabled ?? true,
      iconsReady: [...document.querySelectorAll('#formation-picker-grid .formation-personality-choice img')].every(image => image.complete && image.naturalWidth > 0),
      dialog: (() => { const r = document.querySelector('#formation-picker-dialog').getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; })(),
      focus: document.activeElement?.dataset?.formationPickerValue || ''
    }))()`);
    assert.deepEqual(pendingFacts.values, ['純粋', '冷静', '狂気', '活発', '憂鬱'], '新規配置は5性格だけの小型選択へ移行');
    assert.equal(pendingFacts.toolsHidden, true, '性格選択では検索欄を非表示');
    assert.equal(pendingFacts.filtersHidden, true, '性格選択ではフィルターを非表示');
    assert.equal(pendingFacts.selectedApostle, '', '性格確定前は編成状態を変更しない');
    assert.equal(pendingFacts.undoDisabled, before.undoDisabled, '未確定操作でundo履歴を追加しない');
    assert.equal(pendingFacts.iconsReady, true, '5性格のアイコンを読み込む');
    assert.ok(pendingFacts.dialog.w <= 520 && pendingFacts.dialog.x >= 0 && pendingFacts.dialog.x + pendingFacts.dialog.w <= 1280,
      `性格ダイアログのPC実寸: ${JSON.stringify(pendingFacts.dialog)}`);
    await capture(cdp, page, 'manager-resonance-personality-picker-1280.png');
    await pressKey(cdp, page, 'Escape');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      'document.querySelector("#formation-picker-dialog")?.open === false'));
    const canceled = await browser.evaluate(cdp, page, `({
      formation: JSON.stringify(window.TRICKCAL_STAT_ENGINE.getState().formation),
      undoDisabled: document.querySelector('#history-undo')?.disabled ?? true,
      focusedRow: document.activeElement?.dataset?.formationApostleRow || '',
      focusedLine: document.activeElement?.dataset?.formationLine || ''
    })`);
    assert.equal(canceled.formation, before.formation, '新規配置のEscapeで使徒・性格・遺物を維持');
    assert.equal(canceled.undoDisabled, before.undoDisabled, 'キャンセルで履歴不変');
    assert.equal(canceled.focusedRow, String(target.row), 'キャンセル後に配置元へフォーカス復帰');
    assert.equal(canceled.focusedLine, String(target.line), 'キャンセル後に配置元へフォーカス復帰');

    await openSlotPicker(cdp, page, target.row, target.line);
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="Joanne"]');
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="冷静"]');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      `window.TRICKCAL_STAT_ENGINE.getState().formation.rows[${target.row}].resonancePersonalities[${target.line}] === "冷静"`));
    assert.equal((await readFormation(cdp, page)).rows[target.row].apostles[target.line], 'Joanne', '性格選択後に新規配置を確定');
    assert.equal(await browser.evaluate(cdp, page, 'document.querySelector("#history-undo")?.disabled === false'), true,
      '確定操作は履歴に1件以上反映');
    await browser.clickSelector(cdp, page, '#history-undo');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      `!window.TRICKCAL_STAT_ENGINE.getState().formation.rows[${target.row}].apostles[${target.line}]`));
    assert.equal((await readFormation(cdp, page)).rows[target.row].resonancePersonalities[target.line] || null, null,
      'undo 1回で使徒と確定性格を同時に戻す');
    await browser.clickSelector(cdp, page, '#history-redo');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      `window.TRICKCAL_STAT_ENGINE.getState().formation.rows[${target.row}].apostles[${target.line}] === "Joanne"`));
    assert.equal((await readFormation(cdp, page)).rows[target.row].resonancePersonalities[target.line], '冷静',
      'redo 1回で使徒と確定性格を同時に復元');

    const formationWithSelectedJoanne = await readFormation(cdp, page);
    const historyWithSelectedJoanne = await browser.evaluate(cdp, page, `({
      undo:document.querySelector('#history-undo')?.disabled ?? true,
      redo:document.querySelector('#history-redo')?.disabled ?? true
    })`);
    const masterListingSlot = { row: 1, line: 0 };
    assert.equal(formationWithSelectedJoanne.rows[masterListingSlot.row].apostles[masterListingSlot.line] || '', '',
      '一覧確認用の別枠が空いている');
    await openSlotPicker(cdp, page, masterListingSlot.row, masterListingSlot.line);
    await filterApostlePickerToJoanne(cdp, page);
    const selectedPersonalityListFacts = await browser.evaluate(cdp, page, `(() => {
      const option=document.querySelector('#formation-picker-grid [data-formation-picker-value="Joanne"]');
      const icon=option?.querySelector('.formation-picker-resonance-mark img');
      const formation=window.TRICKCAL_STAT_ENGINE.getState().formation;
      return {master:window.TRICKCAL_STAT_DATA.getById('basicInfo','Joanne')?.性格 || '',
        selected:formation.rows[${target.row}].resonancePersonalities[${target.line}] || null,
        classes:option?.className || '', icon:icon?.getAttribute('src') || '', iconLoaded:!!icon?.complete && icon.naturalWidth>0,
        border:option ? getComputedStyle(option).borderTopColor : ''};
    })()`);
    assert.equal(selectedPersonalityListFacts.selected, '冷静', '確認対象の編成でジョアン性格が選択済み');
    assert.equal(selectedPersonalityListFacts.master, '共鳴', '一覧の表示判定は性格マスター');
    assert.match(selectedPersonalityListFacts.classes, /is-resonance-option/, '選択済みでも一覧の共鳴表示を維持');
    assert.match(selectedPersonalityListFacts.classes, /personality-共鳴/, '一覧項目に選択性格由来のclassを付けない');
    assert.doesNotMatch(selectedPersonalityListFacts.classes, /personality-冷静/, '現在枠の性格色を一覧へ流用しない');
    assert.match(selectedPersonalityListFacts.icon, /性格_共鳴\.webp/, '選択済み性格に関係なく共鳴アイコン');
    assert.equal(selectedPersonalityListFacts.iconLoaded, true, '選択済み状態の一覧アイコンを読込');
    assert.match(selectedPersonalityListFacts.border, /255, 255, 255|248, 250, 252/, '選択済み性格の一覧も白枠');
    await capture(cdp, page, 'manager-resonance-apostle-picker-selected-master-1280.png');
    await browser.clickSelector(cdp, page, '#formation-picker-close');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      'document.querySelector("#formation-picker-dialog")?.open === false'));
    assert.deepEqual(await readFormation(cdp, page), formationWithSelectedJoanne, '一覧確認のキャンセルで編成不変');
    assert.deepEqual(await browser.evaluate(cdp, page, `({
      undo:document.querySelector('#history-undo')?.disabled ?? true,
      redo:document.querySelector('#history-redo')?.disabled ?? true
    })`), historyWithSelectedJoanne, '一覧確認のキャンセルで履歴不変');

    await browser.evaluate(cdp, page, `(() => {
      const basic = window.TRICKCAL_STAT_DATA.getById('basicInfo', 'Amelia');
      Object.assign(basic, { 使徒名: '隔離確認用共鳴', 性格: '共鳴', 配置列: '全列', 配列: '全列' });
    })()`);
    const fixture = { row: 1, line: 0 };
    assert.equal((await readFormation(cdp, page)).rows[fixture.row].apostles[fixture.line] || '', '', 'fixture配置先が空');
    await openSlotPicker(cdp, page, fixture.row, fixture.line);
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="Amelia"]');
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="純粋"]');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      `window.TRICKCAL_STAT_ENGINE.getState().formation.rows[${fixture.row}].resonancePersonalities[${fixture.line}] === "純粋"`));
    const front = { row: 2, line: 0 };
    await pickApostle(cdp, page, front.row, front.line, 'Allet');

    const joanneArtifact = await assignArtifact(cdp, page, target.row, target.line);
    const fixtureArtifact = await assignArtifact(cdp, page, fixture.row, fixture.line);
    const beforeMove = await readFormation(cdp, page);

    await browser.clickSelector(cdp, page,
      `[data-formation-move-row="${target.row}"][data-formation-move-line="${target.line}"]`);
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-move-mode[open]');
    const moveFacts = await browser.evaluate(cdp, page, `(() => ({
      values: [...document.querySelectorAll('#formation-picker-grid .formation-picker-move-cell')].map(button => button.dataset.formationPickerValue),
      headings: [...document.querySelectorAll('#formation-picker-grid .formation-picker-move-heading')].map(node => node.textContent.trim()),
      sourceDisabled: document.querySelector('#formation-picker-grid [data-formation-picker-value="${target.row}:${target.line}"]')?.disabled,
      incompatibleDisabled: document.querySelector('#formation-picker-grid [data-formation-picker-value="2:0"]')?.disabled,
      hasPortraits: [...document.querySelectorAll('#formation-picker-grid .formation-picker-move-portrait')].every(image => image.complete && image.naturalWidth > 0),
      focus: document.activeElement?.dataset?.formationPickerValue || '',
      dialog: (() => { const r = document.querySelector('#formation-picker-dialog').getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; })()
    }))()`);
    assert.deepEqual(moveFacts.values, ['0:0', '1:0', '2:0', '0:1', '1:1', '2:1', '0:2', '1:2', '2:2'], '配置本体と一致する行列順の3×3枠');
    assert.deepEqual(moveFacts.headings, ['後列', '中列', '前列'], '列見出しは編成本体と同じ並び');
    assert.equal(moveFacts.sourceDisabled, true, '移動元枠は無効化');
    assert.equal(moveFacts.incompatibleDisabled, true, '固定前列使徒との非対応交換を無効化');
    assert.equal(moveFacts.hasPortraits, true, '占有枠の使徒画像を表示');
    assert.ok(moveFacts.dialog.x >= 0 && moveFacts.dialog.x + moveFacts.dialog.w <= 1280, `配置ダイアログPC実寸: ${JSON.stringify(moveFacts.dialog)}`);
    await capture(cdp, page, 'manager-resonance-move-picker-1280.png');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-cancel]');
    await browser.waitFor(async () => browser.evaluate(cdp, page, 'document.querySelector("#formation-picker-dialog")?.open === false'));
    assert.equal(await browser.evaluate(cdp, page,
      `document.activeElement?.dataset?.formationMoveRow === ${JSON.stringify(String(target.row))}`), true, '配置取消後に操作元の全列アイコンへフォーカス復帰');
    assert.deepEqual(await readFormation(cdp, page), beforeMove, '配置キャンセルで編成・履歴対象を変更しない');

    await browser.clickSelector(cdp, page,
      `[data-formation-move-row="${target.row}"][data-formation-move-line="${target.line}"]`);
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-move-mode[open]');
    await browser.evaluate(cdp, page, `document.querySelector('#formation-picker-grid [data-formation-picker-value="${fixture.row}:${fixture.line}"]')?.focus()`);
    await pressKey(cdp, page, 'Enter');
    await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
      const formation = window.TRICKCAL_STAT_ENGINE.getState().formation;
      return formation.rows[${target.row}].apostles[${target.line}] === 'Amelia'
        && formation.rows[${fixture.row}].apostles[${fixture.line}] === 'Joanne';
    })()`));
    let moved = await readFormation(cdp, page);
    assert.equal(moved.rows[target.row].resonancePersonalities[target.line], '純粋', '交換相手の性格を自身と一緒に移動');
    assert.equal(moved.rows[fixture.row].resonancePersonalities[fixture.line], '冷静', 'ジョアンの性格を交換後も保持');
    assert.equal(moved.rows[target.row].artifacts[target.line][0], fixtureArtifact, '交換相手の遺物を一緒に移動');
    assert.equal(moved.rows[fixture.row].artifacts[fixture.line][0], joanneArtifact, 'ジョアンの遺物を交換後も保持');

    await browser.evaluate(cdp, page, `(() => {
      const basic = window.TRICKCAL_STAT_DATA.getById('basicInfo', 'Amelia');
      Object.assign(basic, { 使徒名: 'アメリア', 性格: '冷静', 配置列: '後列', 配列: '後列' });
    })()`);
    await browser.clickSelector(cdp, page,
      `[data-formation-move-row="${fixture.row}"][data-formation-move-line="${fixture.line}"]`);
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-move-mode[open]');
    await browser.clickSelector(cdp, page, `#formation-picker-grid [data-formation-picker-value="2:1"]`);
    await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
      const formation = window.TRICKCAL_STAT_ENGINE.getState().formation;
      return formation.rows[2].apostles[1] === 'Joanne';
    })()`));
    moved = await readFormation(cdp, page);
    assert.equal(moved.rows[2].resonancePersonalities[1], '冷静', '空き枠移動後も性格を保持');
    assert.equal(moved.rows[2].artifacts[1][0], joanneArtifact, '空き枠移動後も遺物を保持');

    const calmFormationId = await saveFormationPreset(cdp, page, '隔離共鳴テスト・冷静');
    await browser.clickSelector(cdp, page,
      `[data-formation-personality-row="2"][data-formation-personality-line="1"]`);
    const reopenedPersonalityFacts = await browser.evaluate(cdp, page, `(() => {
      const dialog = document.querySelector('#formation-picker-dialog');
      const button = document.querySelector('[data-formation-personality-row="2"][data-formation-personality-line="1"]');
      return {open:dialog?.open || false, classes:dialog?.className || '', active:document.activeElement?.outerHTML?.slice(0,220) || '', button:button?.outerHTML?.slice(0,260) || '', panel:document.querySelector('[data-dashboard-panel="formation"]')?.className || ''};
    })()`);
    assert.equal(reopenedPersonalityFacts.open && reopenedPersonalityFacts.classes.includes('is-personality-mode'), true,
      `再読込後の性格アイコンから選択モードを開く: ${JSON.stringify(reopenedPersonalityFacts)}`);
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="活発"]');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      'window.TRICKCAL_STAT_ENGINE.getState().formation.rows[2].resonancePersonalities[1] === "活発"'));
    const activeFormationId = await saveFormationPreset(cdp, page, '隔離共鳴テスト・活発');
    await browser.evaluate(cdp, page, `document.querySelector('.formation-preset-details').open = true`);
    await browser.clickSelector(cdp, page, `[data-formation-preset-load="${calmFormationId}"]`);
    await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
      const state = window.TRICKCAL_STAT_ENGINE.getState();
      return state.activeFormationPresetId === ${JSON.stringify(calmFormationId)}
        && state.formation.rows[2].resonancePersonalities[1] === '冷静';
    })()`));
    await browser.clickSelector(cdp, page, `[data-formation-preset-load="${activeFormationId}"]`);
    await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
      const state = window.TRICKCAL_STAT_ENGINE.getState();
      return state.activeFormationPresetId === ${JSON.stringify(activeFormationId)}
        && state.formation.rows[2].resonancePersonalities[1] === '活発';
    })()`));
    await browser.clickSelector(cdp, page, `[data-formation-preset-load="${calmFormationId}"]`);
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      `window.TRICKCAL_STAT_ENGINE.getState().activeFormationPresetId === ${JSON.stringify(calmFormationId)}`));

    await browser.clickSelector(cdp, page,
      `[data-formation-personality-row="2"][data-formation-personality-line="1"]`);
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value=""]');
    const unselectedFacts = await browser.evaluate(cdp, page, `(() => {
      const state = window.TRICKCAL_STAT_ENGINE.getState();
      const card = document.querySelector(${JSON.stringify('[data-formation-apostle-row="2"][data-formation-line="1"]')});
      const icon = document.querySelector(${JSON.stringify('[data-formation-personality-row="2"][data-formation-personality-line="1"] img')});
      return {selection:state.formation.rows[2].resonancePersonalities[1] || null,
        resonance:card.classList.contains('is-resonance'), unselected:card.classList.contains('is-resonance-unselected'),
        icon:icon?.getAttribute('src') || ''};
    })()`);
    assert.equal(unselectedFacts.selection, null, '既存枠を未選択へ戻す');
    assert.equal(unselectedFacts.resonance, true, 'マスター共鳴判定を選択値から独立させる');
    assert.equal(unselectedFacts.unselected, true, '保存済み未選択を未選択表示');
    assert.match(unselectedFacts.icon, /性格_共鳴\.webp/, '未選択時に共鳴アイコンを表示');
    await capture(cdp, page, 'manager-resonance-unselected-1280.png');
    await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
      const raw = window.TRICKCAL_STORAGE_FACADE.sessionStorage.getItem('trickcal_stat_workspace_v2');
      if (!raw) return false;
      const workspace = JSON.parse(raw);
      return workspace.draft?.formation?.rows?.[2]?.resonancePersonalities?.[1] == null;
    })()`), { timeoutMs: 5000 });
    await cdp.send('Page.reload', { ignoreCache: true }, page.sessionId);
    await waitReady(cdp, page);
    const reloadedUnselected = await browser.evaluate(cdp, page, `(() => {
      const state = window.TRICKCAL_STAT_ENGINE.getState();
      const card = document.querySelector(${JSON.stringify('[data-formation-apostle-row="2"][data-formation-line="1"]')});
      const icon = document.querySelector(${JSON.stringify('[data-formation-personality-row="2"][data-formation-personality-line="1"] img')});
      return {selection:state.formation.rows[2].resonancePersonalities[1] || null,
        unselected:card.classList.contains('is-resonance-unselected'), icon:icon?.getAttribute('src') || '',
        theme:document.documentElement.dataset.theme,
        nativeTheme:window.localStorage.getItem('trickcal_theme'),
        facadeTheme:window.TRICKCAL_STORAGE_FACADE.localStorage.getItem('trickcal_theme'),
        legacyTheme:window.TRICKCAL_STORAGE_FACADE.localStorage.getItem('trickcal_stat_theme')};
    })()`);
    assert.equal(reloadedUnselected.selection, null, '再読込でも共鳴性格を勝手に補完しない');
    assert.equal(reloadedUnselected.unselected, true, '再読込後も未選択枠として表示');
    assert.match(reloadedUnselected.icon, /性格_共鳴\.webp/, '再読込後も共鳴アイコンを表示');
    assert.equal(reloadedUnselected.theme, reloadedUnselected.facadeTheme,
      `再読込後のrootと管理保存テーマの初期一致: ${JSON.stringify(reloadedUnselected)}`);
    assert.equal(reloadedUnselected.theme, reloadedUnselected.nativeTheme,
      `再読込後のrootと共通保存テーマの初期一致: ${JSON.stringify(reloadedUnselected)}`);
    await browser.clickSelector(cdp, page,
      `[data-formation-personality-row="2"][data-formation-personality-line="1"]`);
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="憂鬱"]');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      'window.TRICKCAL_STAT_ENGINE.getState().formation.rows[2].resonancePersonalities[1] === "憂鬱"'));

    await setTheme(cdp, page, 'light');
    const cardSelectors = {
      resonance: '[data-formation-apostle-row="2"][data-formation-line="1"]',
      normal: '[data-formation-apostle-row="2"][data-formation-line="0"]'
    };
    const structureFacts = await browser.evaluate(cdp, page, `(() => {
      const resonance = document.querySelector(${JSON.stringify(cardSelectors.resonance)});
      const normal = document.querySelector(${JSON.stringify(cardSelectors.normal)});
      const resonanceWrap = resonance?.closest('.formation-apostle-card-wrap');
      const normalWrap = normal?.closest('.formation-apostle-card-wrap');
      const rect = element => { const r = element.getBoundingClientRect(); return {width:r.width,height:r.height}; };
      return {
        resonance: rect(resonance), normal: rect(normal),
        resonanceLine: rect(resonance?.closest('.formation-line')), normalLine: rect(normal?.closest('.formation-line')),
        wrapper: !!resonanceWrap,
        personalityAction: resonanceWrap?.querySelector(':scope > [data-formation-personality-row]')?.outerHTML || '',
        moveAction: resonanceWrap?.querySelector(':scope > [data-formation-move-row]')?.outerHTML || '',
        nestedButtons: !!resonance?.querySelector('button'),
        normalPersonalityBadge: !!normal.querySelector('.formation-personality-badge'),
        oldLabels: document.querySelectorAll('.formation-resonance-mark, .formation-personality-change, .formation-placement-move').length,
        roleAndAttack: !!resonance.querySelector('.formation-role-badge') && !!resonance.querySelector('.formation-attack-badge'),
        border: getComputedStyle(resonance).borderTopColor,
        background: getComputedStyle(resonance).backgroundImage
      };
    })()`);
    assert.deepEqual(structureFacts.resonance, structureFacts.normal, '共鳴／通常カードの外寸を統一');
    assert.deepEqual(structureFacts.resonanceLine, structureFacts.normalLine, '共鳴／通常カードの行間・行寸法を統一');
    assert.equal(structureFacts.wrapper, true, 'カードと操作アイコンの寸法を維持するラッパー');
    assert.match(structureFacts.personalityAction, /性格_憂鬱\.webp/, '選択性格のアイコンを表示');
    assert.match(structureFacts.moveAction, /配置列_全列\.webp/, '既存の全列画像を配置操作に使用');
    assert.equal(structureFacts.nestedButtons, false, 'カードbutton内へ操作buttonを入れない');
    assert.equal(structureFacts.normalPersonalityBadge, true, '通常使徒の既存性格表示を維持');
    assert.equal(structureFacts.oldLabels, 0, '旧重複ラベル・文字を撤去');
    assert.equal(structureFacts.roleAndAttack, true, '役割・攻撃タイプのカード表示を維持');
    const lightGradient = structureFacts.background;

    await setTheme(cdp, page, 'dark');
    const darkFacts = await browser.evaluate(cdp, page, `(() => {
      const card = document.querySelector(${JSON.stringify(cardSelectors.resonance)});
      return { root: document.documentElement.dataset.theme, background: getComputedStyle(card).backgroundImage,
        border: getComputedStyle(card).borderTopColor, icon: card.closest('.formation-apostle-card-wrap')?.querySelector('[data-formation-personality-row] img')?.naturalWidth || 0 };
    })()`);
    assert.equal(darkFacts.root, 'dark', 'テーマ切替でrootを即時更新');
    assert.notEqual(darkFacts.background, lightGradient, 'ライト／ダークで別の共鳴グラデーション');
    assert.ok(darkFacts.icon > 0, 'ダークテーマでも性格アイコンを読み込む');
    await centerFormationCard(cdp, page, cardSelectors.resonance);
    await capture(cdp, page, 'manager-resonance-formation-dark-1280.png');
    await setTheme(cdp, page, 'light');
    await centerFormationCard(cdp, page, cardSelectors.resonance);
    await capture(cdp, page, 'manager-resonance-formation-light-1280.png');

    await setViewport(cdp, page, 375, 844, true);
    const mobileCards = await browser.evaluate(cdp, page, `(() => {
      const read = selector => {
        const card = document.querySelector(selector);
        const r = card.getBoundingClientRect();
        const line = card.closest('.formation-line').getBoundingClientRect();
        return {card:{width:r.width,height:r.height}, line:{width:line.width,height:line.height}};
      };
      return {resonance:read(${JSON.stringify(cardSelectors.resonance)}), normal:read(${JSON.stringify(cardSelectors.normal)}),
        scrollWidth:document.documentElement.scrollWidth, viewport:innerWidth};
    })()`);
    assert.deepEqual(mobileCards.resonance, mobileCards.normal, '375pxでも共鳴／通常カード寸法を統一');
    assert.equal(mobileCards.scrollWidth, mobileCards.viewport, '375pxで横はみ出しなし');
    await centerFormationCard(cdp, page, cardSelectors.resonance);
    await capture(cdp, page, 'manager-resonance-formation-light-375.png');
    await setTheme(cdp, page, 'dark');
    const mobileDarkCard = await browser.evaluate(cdp, page, `(() => {
      const card = document.querySelector(${JSON.stringify(cardSelectors.resonance)});
      return {root:document.documentElement.dataset.theme, background:getComputedStyle(card).backgroundImage,
        border:getComputedStyle(card).borderTopColor, width:card.getBoundingClientRect().width};
    })()`);
    assert.equal(mobileDarkCard.root, 'dark', '375pxでテーマボタンからダークへ切替');
    assert.notEqual(mobileDarkCard.background, lightGradient, '375pxでもテーマ別の虹背景');
    assert.equal(mobileDarkCard.width, mobileCards.resonance.card.width, 'テーマ変更でカード寸法が変わらない');
    await centerFormationCard(cdp, page, cardSelectors.resonance);
    await capture(cdp, page, 'manager-resonance-formation-dark-375.png');
    await setTheme(cdp, page, 'light');

    await browser.evaluate(cdp, page, `document.querySelector(${JSON.stringify('[data-formation-personality-row="2"][data-formation-personality-line="1"]')})?.focus()`);
    await pressKey(cdp, page, 'Enter');
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    const mobileDialog = await browser.evaluate(cdp, page, `(() => {
      const dialog = document.querySelector('#formation-picker-dialog');
      const rect = dialog.getBoundingClientRect();
      const current = dialog.querySelector('[data-formation-picker-value="憂鬱"]');
      return {rect:{x:rect.x,y:rect.y,w:rect.width,h:rect.height}, viewport:{w:innerWidth,h:innerHeight},
        focus:document.activeElement?.dataset?.formationPickerValue || '', pressed:current?.getAttribute('aria-pressed'),
        count:dialog.querySelectorAll('.formation-personality-choice').length,
        toolsHidden:dialog.querySelector('.formation-picker-tools')?.hidden,
        filtersHidden:dialog.querySelector('#formation-filter-details')?.hidden};
    })()`);
    assert.equal(mobileDialog.count, 5, 'モバイル性格候補は5つ');
    assert.equal(mobileDialog.pressed, 'true', '現在性格のARIA選択状態');
    assert.equal(mobileDialog.toolsHidden, true, 'モバイル性格モードで検索を隠す');
    assert.equal(mobileDialog.filtersHidden, true, 'モバイル性格モードで絞り込みを隠す');
    assert.ok(mobileDialog.rect.x >= 0 && mobileDialog.rect.x + mobileDialog.rect.w <= mobileDialog.viewport.w
      && mobileDialog.rect.y >= 0 && mobileDialog.rect.y + mobileDialog.rect.h <= mobileDialog.viewport.h,
    `375px性格モーダルが画面内: ${JSON.stringify(mobileDialog)}`);
    await capture(cdp, page, 'manager-resonance-personality-picker-375.png');
    await pressKey(cdp, page, 'Escape');
    await browser.waitFor(async () => browser.evaluate(cdp, page, 'document.querySelector("#formation-picker-dialog")?.open === false'));
    assert.equal(await browser.evaluate(cdp, page,
      'document.activeElement?.dataset?.formationPersonalityRow === "2" && document.activeElement?.dataset?.formationPersonalityLine === "1"'), true,
    '性格ダイアログEscape後にアイコンへフォーカス復帰');
    await browser.evaluate(cdp, page, `document.querySelector(${JSON.stringify('[data-formation-personality-row="2"][data-formation-personality-line="1"]')})?.focus()`);
    await pressKey(cdp, page, 'Enter');
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    const initialPersonalityFocus = await browser.evaluate(cdp, page, `(() => {
      const row = window.TRICKCAL_STAT_ENGINE.getState().formation.rows[2];
      return row.resonancePersonalities[1] || '純粋';
    })()`);
    await browser.waitFor(async () => {
      const activeBeforeFrame = await browser.evaluate(cdp, page,
        'document.activeElement?.dataset?.formationPickerValue || ""');
      if (activeBeforeFrame !== initialPersonalityFocus) return false;
      await browser.evaluate(cdp, page,
        'new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
      return browser.evaluate(cdp, page,
        `document.activeElement?.dataset?.formationPickerValue === ${JSON.stringify(initialPersonalityFocus)}`);
    }, { timeoutMs: 3000 });
    assert.equal(await browser.evaluate(cdp, page,
      `document.activeElement?.dataset?.formationPickerValue === ${JSON.stringify(initialPersonalityFocus)}`), true,
    'モーダル初期フォーカス処理が候補へ収束してからキーボード操作へ進む');
    await browser.evaluate(cdp, page, `(() => {
      window.__resonanceKeyboardProbe=[];
      const dialog=document.querySelector('#formation-picker-dialog');
      ['keydown','keyup','click'].forEach(type=>dialog.addEventListener(type,event=>window.__resonanceKeyboardProbe.push({
        type,key:event.key||'',trusted:event.isTrusted,value:event.target?.dataset?.formationPickerValue||''
      }),{once:false}));
    })()`);
    await pressShiftTab(cdp, page);
    await pressShiftTab(cdp, page);
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      'document.activeElement?.dataset?.formationPickerValue === "狂気"'), { timeoutMs: 3000 });
    await pressKey(cdp, page, 'Enter');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      'window.TRICKCAL_STAT_ENGINE.getState().formation.rows[2].resonancePersonalities[1] === "狂気"'), { timeoutMs: 5000 });
    const personalityKeyboardResult = await browser.evaluate(cdp, page, `(() => ({
      row:window.TRICKCAL_STAT_ENGINE.getState().formation.rows[2],
      basic:(()=>{const id=window.TRICKCAL_STAT_ENGINE.getState().formation.rows[2].apostles[1]; const basic=window.TRICKCAL_STAT_DATA.getById('basicInfo',id); return {id,personality:basic?.性格||''};})(),
      selected:window.TRICKCAL_STAT_ENGINE.getState().formation.rows[2].resonancePersonalities[1]||null,
      active:document.activeElement?.dataset?.formationPickerValue||'',
      open:document.querySelector('#formation-picker-dialog')?.open,
      mode:document.querySelector('#formation-picker-dialog')?.className||'',
      candidate:document.querySelector('#formation-picker-grid [data-formation-picker-value="狂気"]')?.outerHTML||'',
      events:window.__resonanceKeyboardProbe||[]
    }))()`);
    assert.equal(personalityKeyboardResult.selected, '狂気',
      `Enterで性格候補を確定: ${JSON.stringify(personalityKeyboardResult)}`);
    assert.ok(personalityKeyboardResult.events.some(event => event.type === 'click' && event.trusted
      && event.value === '狂気'), `Enterから信頼済みボタンクリック: ${JSON.stringify(personalityKeyboardResult)}`);
    assert.match(await browser.evaluate(cdp, page,
      `document.querySelector(${JSON.stringify('[data-formation-personality-row="2"][data-formation-personality-line="1"] img')})?.getAttribute("src") || ""`),
    /性格_狂気\.webp/, '性格確定後にカード左上アイコンを更新');

    await browser.clickSelector(cdp, page,
      `[data-formation-move-row="2"][data-formation-move-line="1"]`);
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-move-mode[open]');
    const mobileMoveRect = await browser.evaluate(cdp, page, `(() => {
      const r=document.querySelector('#formation-picker-dialog').getBoundingClientRect();
      return {x:r.x,y:r.y,w:r.width,h:r.height,viewport:{w:innerWidth,h:innerHeight},count:document.querySelectorAll('.formation-picker-move-cell').length};
    })()`);
    assert.equal(mobileMoveRect.count, 9, 'モバイル配置モーダルに9枠');
    assert.ok(mobileMoveRect.x >= 0 && mobileMoveRect.x + mobileMoveRect.w <= mobileMoveRect.viewport.w
      && mobileMoveRect.y >= 0 && mobileMoveRect.y + mobileMoveRect.h <= mobileMoveRect.viewport.h,
    `375px配置モーダルが画面内: ${JSON.stringify(mobileMoveRect)}`);
    await capture(cdp, page, 'manager-resonance-move-picker-375.png');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-cancel]');
    await browser.waitFor(async () => browser.evaluate(cdp, page, 'document.querySelector("#formation-picker-dialog")?.open === false'));
    assert.equal(await browser.evaluate(cdp, page,
      'document.activeElement?.dataset?.formationMoveRow === "2" && document.activeElement?.dataset?.formationMoveLine === "1"'), true,
    '配置ダイアログ閉鎖後に全列アイコンへフォーカス復帰');

    const persistedBeforeReload = await readFormation(cdp, page);
    await cdp.send('Page.reload', { ignoreCache: true }, page.sessionId);
    await waitReady(cdp, page);
    assert.deepEqual(await readFormation(cdp, page), persistedBeforeReload, '再読み込み後に配置・性格・遺物を保持');
    assert.match(await browser.evaluate(cdp, page,
      `document.querySelector(${JSON.stringify('[data-formation-personality-row="2"][data-formation-personality-line="1"] img')})?.getAttribute("src") || ""`),
    /性格_狂気\.webp/, '再読み込み後も選択アイコンを再現');

    await setViewport(cdp, page, 1280, 900, false);
    await browser.clickSelector(cdp, page, '[data-open-apostle-picker]');
    await browser.waitForSelector(cdp, page, '#apostle-picker-dialog[open]');
    await browser.clickSelector(cdp, page, '#apostle-picker-search');
    await cdp.send('Input.insertText', { text: 'ジョアン' }, page.sessionId);
    await browser.waitForSelector(cdp, page, '#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
    await browser.clickSelector(cdp, page, '#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      'document.querySelector("#bottom-apostle-name")?.textContent.trim() === "ジョアン"'));
    const bottomResonanceVisuals = [];
    for (const [theme,width,screenshot] of [
      ['light',1280,'manager-resonance-bottom-bar-light-1280.png'],
      ['dark',1280,'manager-resonance-bottom-bar-dark-1280.png'],
      ['light',375,'manager-resonance-bottom-bar-light-375.png'],
      ['dark',375,'manager-resonance-bottom-bar-dark-375.png']
    ]) {
      await setViewport(cdp, page, width, 844, width < 600);
      await setTheme(cdp, page, theme);
      const facts = await browser.evaluate(cdp, page, `(() => {
        const button=document.querySelector('.bottom-apostle-button');
        const image=button?.querySelector('#bottom-apostle-image');
        const r=button.getBoundingClientRect();
        const rect=value=>({width:value.width,height:value.height});
        const resonanceRect=rect(r);
        const originalClass=button?.className || '';
        button?.classList.remove('is-resonance');
        const ordinaryRect=rect(button.getBoundingClientRect());
        button?.classList.add('is-resonance');
        return {theme:document.documentElement.dataset.theme,name:document.querySelector('#bottom-apostle-name')?.textContent.trim() || '',
          resonance:button.classList.contains('is-resonance'),background:getComputedStyle(button).backgroundImage,
          border:getComputedStyle(button).borderTopColor,rect:resonanceRect,ordinaryRect,
          originalClass,
          portraitLoaded:!!image?.complete && image.naturalWidth>0,
          resonanceMarkAbsent:!button?.querySelector('.bottom-apostle-resonance-mark')};
      })()`);
      assert.equal(facts.theme, theme, `下バーのテーマ ${theme}/${width}px`);
      assert.equal(facts.name, 'ジョアン', `下バーにジョアンを表示 ${theme}/${width}px`);
      assert.equal(facts.resonance, true, '下バー共鳴判定はマスター性格を使用');
      assert.match(facts.background, /linear-gradient/, '下バー共鳴部分に虹背景');
      assert.match(facts.border, /255, 255, 255|248, 250, 252/, '下バー共鳴白枠');
      assert.equal(facts.portraitLoaded, true, '下バーの使徒画像を読み込む');
      assert.equal(facts.resonanceMarkAbsent, true, '下バーに後付け共鳴バッジを表示しない');
      assert.deepEqual(facts.rect, facts.ordinaryRect, `共鳴表示で下バー寸法を変更しない ${width}px`);
      bottomResonanceVisuals.push(facts);
      await capture(cdp, page, screenshot);
    }
    assert.notEqual(bottomResonanceVisuals[0].background, bottomResonanceVisuals[1].background,
      '下バーのライト／ダーク共鳴背景は別定義');
    assert.notEqual(bottomResonanceVisuals[2].background, bottomResonanceVisuals[3].background,
      '375px下バーのライト／ダーク共鳴背景は別定義');

    const { bulkFacts, bulkDarkFacts, bulkMobileDarkFacts, bulkMobileLightFacts } =
      await captureAndVerifyBulkApostleRows(cdp, page);

    const result = {
      ok: true,
      browser: 'Chrome CDP / isolated profile; trusted pointer and keyboard events',
      initialTheme,
      manager: [
        '編成ピッカーのジョアン共鳴背景・白枠・画像左上アイコン（PC/375px、明暗）',
        'ステ管理の使徒一覧は明暗とも明るいカード、画像領域だけ虹・白い名前欄・共鳴アイコン（通常使徒と並べて確認）',
        '下バーは虹背景・白枠を維持し、後付けバッジなし（通常使徒カードと同画面）',
        '一括使徒設定は通常行と同じidentity余白・角丸・左→右の薄まり方で虹色、後付けバッジなし',
        '一覧性格はマスター基準で選択済み編成の色と分離、実画面内表示とTab/Enter',
        '新規配置: 使徒→5性格→確定、Escape時は編成と履歴が不変',
        '配置確定を1 undo/redoで使徒・性格同時に往復',
        '性格変更アイコンの独立操作・現在値ARIA・Escapeフォーカス復帰',
        '3×3配置関係・互換不可セル・交換／空き枠移動で性格と遺物保持',
        'PC/375pxの通常・共鳴カード寸法、ライト／ダーク実切替',
        '検索／絞り込みが通常ピッカーへ戻り、小型モーダルは画面内',
        '再読み込み後の編成・性格・遺物維持'
      ],
      observed: { initialMode: apostleModeFacts, resonancePickerVisuals, selectedPersonalityListFacts, bottomResonanceVisuals, bulkFacts, bulkDarkFacts,
        bulkMobileDarkFacts, bulkMobileLightFacts,
        compactPersonality: pendingFacts, moveGrid: moveFacts, initialThemeFacts, desktopCard: structureFacts,
        darkCard: darkFacts, mobileCards, mobileDarkCard, mobileDialog, mobileMoveRect },
      isolatedRuntimeFixture: 'Amelia basicInfo row temporarily changed in test-only browser memory to provide a second all-row resonance Apostle; browser profile and process are discarded after test.',
      screenshots: [
        'tmp/manager-resonance-status-picker-light-1280.png',
        'tmp/manager-resonance-status-picker-dark-1280.png',
        'tmp/manager-resonance-status-picker-light-375.png',
        'tmp/manager-resonance-status-picker-dark-375.png',
        'tmp/manager-resonance-apostle-picker-dark-1280.png',
        'tmp/manager-resonance-apostle-picker-light-1280.png',
        'tmp/manager-resonance-apostle-picker-dark-375.png',
        'tmp/manager-resonance-apostle-picker-light-375.png',
        'tmp/manager-resonance-apostle-picker-selected-master-1280.png',
        'tmp/manager-resonance-personality-picker-1280.png',
        'tmp/manager-resonance-move-picker-1280.png',
        'tmp/manager-resonance-formation-light-1280.png',
        'tmp/manager-resonance-unselected-1280.png',
        'tmp/manager-resonance-formation-dark-1280.png',
        'tmp/manager-resonance-formation-light-375.png',
        'tmp/manager-resonance-formation-dark-375.png',
        'tmp/manager-resonance-personality-picker-375.png',
        'tmp/manager-resonance-move-picker-375.png',
        'tmp/manager-resonance-bottom-bar-light-1280.png',
        'tmp/manager-resonance-bottom-bar-dark-1280.png',
        'tmp/manager-resonance-bottom-bar-light-375.png',
        'tmp/manager-resonance-bottom-bar-dark-375.png',
        'tmp/manager-resonance-bulk-light-1280.png',
        'tmp/manager-resonance-bulk-dark-1280.png',
        'tmp/manager-resonance-bulk-light-375.png',
        'tmp/manager-resonance-bulk-dark-375.png'
      ]
    };
    console.log(JSON.stringify(result));
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
