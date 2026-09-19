#!/usr/bin/env node
'use strict';

// Isolated browser regression for material markers in the manager's global-board value matrices.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const ROOT = path.resolve(__dirname, '..');
const ROUTE = '/stat-dashboard.html?global=board-global&boardGlobalMaterialIconsNative=1';
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
  await browser.waitFor(async () => browser.evaluate(cdp, page, `innerWidth === ${width} && innerHeight === ${height}`), { timeoutMs: 5000 });
}

async function waitReady(cdp, page) {
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() =>
    document.readyState === 'complete'
      && document.documentElement.dataset.storageBoot === 'ready'
      && document.querySelectorAll('.board-global-effect-type-matrix').length === 2
      && document.querySelector('[data-shared-theme-button]')
  )()`), { timeoutMs: 30000 });
}

async function forceVisualTheme(cdp, page, theme) {
  await browser.evaluate(cdp, page, `(() => {
    document.documentElement.dataset.theme = ${JSON.stringify(theme)};
    document.body.classList.toggle('theme-light', ${JSON.stringify(theme)} === 'light');
    document.body.classList.toggle('theme-dark', ${JSON.stringify(theme)} === 'dark');
  })()`);
}

async function reloadAndWaitReady(cdp, page) {
  const previousTimeOrigin = await browser.evaluate(cdp, page, 'performance.timeOrigin');
  await cdp.send('Page.reload', { ignoreCache: true }, page.sessionId);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() =>
    document.readyState === 'complete'
      && !!document.body
      && document.documentElement.dataset.storageBoot === 'ready'
      && document.querySelectorAll('.board-global-effect-type-matrix').length === 2
      && performance.timeOrigin !== ${previousTimeOrigin}
  )()`), { timeoutMs: 30000 });
}

async function inspectMatrices(cdp, page, width, expectedTheme, { checkThemeControl = true } = {}) {
  const facts = await browser.evaluate(cdp, page, `(() => {
    const colorFor = variable => {
      const probe = document.createElement('span');
      probe.style.color = 'var(' + variable + ')';
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };
    const matrices = Object.fromEntries(['special', 'advanced'].map(kind => {
      const matrix = document.querySelector('.board-global-effect-type-matrix.is-' + kind);
      const wrapper = matrix?.querySelector('thead .board-global-tile-material-icon');
      const images = [...(wrapper?.querySelectorAll('img') || [])];
      const rect = element => { const r = element.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height, right:r.right, bottom:r.bottom }; };
      const tile = images.find(image => image.classList.contains('board-global-tile-type-icon'));
      const material = images.find(image => image.classList.contains('board-global-material-icon'));
      const wrapperRect = wrapper && rect(wrapper);
      const materialRect = material && rect(material);
      const th = matrix?.querySelector('thead th');
      const totalCurrent = matrix?.querySelector('.board-global-stat-total .board-global-total-current');
      const totalMax = matrix?.querySelector('.board-global-stat-total .board-global-total-max');
      return [kind, {
        matrixClass: matrix?.className || null,
        ariaLabel: wrapper?.getAttribute('aria-label'), role: wrapper?.getAttribute('role'),
        images: images.map(image => ({ path: new URL(image.src).pathname, loaded: image.complete && image.naturalWidth > 0, alt: image.getAttribute('alt'), hidden: image.getAttribute('aria-hidden') })),
        wrapper: wrapperRect, tile: tile && rect(tile), material: materialRect,
        wrapperIsInsideTh: !!wrapper && !!th && wrapperRect.x >= th.getBoundingClientRect().x - 0.5 && wrapperRect.right <= th.getBoundingClientRect().right + 0.5,
        materialInsideWrapper: !!material && !!wrapper && materialRect.x >= wrapperRect.x - 0.5 && materialRect.y >= wrapperRect.y - 0.5 && materialRect.right <= wrapperRect.right + 0.5 && materialRect.bottom <= wrapperRect.bottom + 0.5,
        headerHeight: th?.getBoundingClientRect().height || 0,
        matrixBackground: matrix ? getComputedStyle(matrix).backgroundColor : null,
        layerBackground: matrix ? getComputedStyle(matrix).getPropertyValue('--board-global-layer-bg').trim() : null,
        headerBackground: th ? getComputedStyle(th).backgroundColor : '',
        layerText: matrix ? getComputedStyle(matrix).getPropertyValue('--board-global-layer-text').trim() : null,
        headerTextColor: th ? getComputedStyle(th).color : null,
        totalCurrentTextColor: totalCurrent ? getComputedStyle(totalCurrent).color : null,
        totalMaxTextColor: totalMax ? getComputedStyle(totalMax).color : null
      }];
    }));
    const pageWidth = document.documentElement.clientWidth;
    return {
      theme: document.documentElement.dataset.theme,
      bodyLight: document.body.classList.contains('theme-light'),
      bodyDark: document.body.classList.contains('theme-dark'),
      width: innerWidth,
      pageOverflowX: document.documentElement.scrollWidth - pageWidth,
      matrixCount: Object.keys(matrices).length,
      matrices,
      normalTextColor: colorFor('--ink'),
      mutedTextColor: colorFor('--muted'),
      themeButton: {
        label: document.querySelector('[data-shared-theme-button]')?.getAttribute('aria-label'),
        title: document.querySelector('[data-shared-theme-button]')?.getAttribute('title'),
        pressed: document.querySelector('[data-shared-theme-button]')?.getAttribute('aria-pressed')
      }
    };
  })()`);
  assert.equal(facts.theme, expectedTheme, `${width}px theme ${expectedTheme}: root theme`);
  assert.equal(facts.matrixCount, 2);
  assert.ok(facts.pageOverflowX <= 0, `${width}px ${expectedTheme}: page horizontal overflow ${JSON.stringify(facts)}`);
  assert.ok(facts.matrices.special.matrixClass && facts.matrices.advanced.matrixClass, `both specialized matrices exist: ${JSON.stringify(facts.matrices)}`);
  assert.deepEqual(facts.matrices.special.ariaLabel, '特殊マス（金くれよん）');
  assert.deepEqual(facts.matrices.advanced.ariaLabel, '上級マス（紫くれよん）');
  assert.deepEqual(facts.matrices.special.images.map(image => decodeURIComponent(image.path)), ['/img/Board/Tileicon_3.webp', '/img/特級くれよん.webp']);
  assert.deepEqual(facts.matrices.advanced.images.map(image => decodeURIComponent(image.path)), ['/img/Board/Tileicon_2.webp', '/img/上級くれよん.webp']);
  for (const [kind, matrix] of Object.entries(facts.matrices)) {
    assert.equal(matrix.role, 'img', `${kind}: combined accessible label`);
    assert.equal(matrix.images.length, 2, `${kind}: tile + material images`);
    assert.ok(matrix.images.every(image => image.loaded), `${kind}: existing assets loaded ${JSON.stringify(matrix.images)}`);
    assert.ok(matrix.images.every(image => image.alt === '' && image.hidden === 'true'), `${kind}: child images decorative`);
    assert.ok(matrix.wrapperIsInsideTh, `${kind}: composite stays within the existing header cell`);
    assert.ok(matrix.materialInsideWrapper, `${kind}: material stays within the fixed icon frame`);
    assert.ok(Math.abs(matrix.wrapper.width - 25) < 0.2 && Math.abs(matrix.wrapper.height - 25) < 0.2, `${kind}: existing 25px icon frame retained ${JSON.stringify(matrix.wrapper)}`);
    assert.ok(Math.abs(matrix.material.width - 13) < 0.2 && Math.abs(matrix.material.height - 13) < 0.2, `${kind}: overlay remains about half-size`);
    assert.ok(matrix.headerHeight > 0, `${kind}: rendered heading cell is present`);
    assert.ok(matrix.headerHeight <= 40, `${kind}: header height did not expand ${matrix.headerHeight}`);
    assert.equal(matrix.headerTextColor, facts.normalTextColor, `${kind}: header uses the theme's normal text color`);
    assert.equal(matrix.totalCurrentTextColor, facts.normalTextColor, `${kind}: current aggregate uses normal text color`);
    assert.equal(matrix.totalMaxTextColor, facts.mutedTextColor, `${kind}: maximum aggregate uses auxiliary text color`);
    assert.notEqual(matrix.totalCurrentTextColor, matrix.totalMaxTextColor, `${kind}: current and maximum remain distinguishable`);
  }
  assert.notEqual(facts.matrices.special.layerBackground, facts.matrices.advanced.layerBackground, `${width}px ${expectedTheme}: type-specific background distinction`);
  assert.notEqual(facts.matrices.special.matrixBackground, facts.matrices.advanced.matrixBackground, `${width}px ${expectedTheme}: actual table backgrounds remain distinct`);
  if (checkThemeControl) {
    const isDark = expectedTheme === 'dark';
    assert.equal(facts.bodyLight, !isDark, `${width}px ${expectedTheme}: body theme class`);
    assert.equal(facts.bodyDark, isDark, `${width}px ${expectedTheme}: body theme class`);
    assert.equal(facts.themeButton.pressed, String(isDark), `${width}px ${expectedTheme}: aria-pressed matches the active theme`);
    assert.equal(facts.themeButton.label, isDark ? 'ライトモードに切替' : 'ダークモードに切替', `${width}px ${expectedTheme}: button label names the next theme`);
    assert.equal(facts.themeButton.title, facts.themeButton.label, `${width}px ${expectedTheme}: button title matches its label`);
  }
  if (expectedTheme === 'light') {
    assert.match(facts.matrices.special.layerBackground, /250, 245, 227/);
    assert.match(facts.matrices.advanced.layerBackground, /242, 235, 250/);
  } else {
    assert.equal(facts.matrices.special.layerBackground, '#2b261b');
    assert.equal(facts.matrices.advanced.layerBackground, '#282131');
  }
  return facts;
}

async function capture(cdp, page, filename) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, page.sessionId);
  const target = path.join(ROOT, 'tmp', filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, Buffer.from(result.data, 'base64'));
  return path.relative(ROOT, target).replaceAll(path.sep, '/');
}

async function run() {
  const serverPort = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([serverPort]);
  const origin = `http://127.0.0.1:${serverPort}`;
  const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-board-global-material-'));
  const server = startServer(serverPort);
  let chrome = null;
  let cdp = null;
  let page = null;
  const screenshots = [];
  const themeDiagnostics = [];
  try {
    await browser.waitForHttp(`${origin}/stat-dashboard.html`);
    ({ chrome, cdp } = await launchChrome(cdpPort, profileRoot));
    page = await browser.createPage(cdp, `${origin}${ROUTE}`);
    await waitReady(cdp, page);
    const themeDiagnostics = [];
    for (const { width, height } of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      await setViewport(cdp, page, width, height);
      await forceVisualTheme(cdp, page, 'light');
      const light = await inspectMatrices(cdp, page, width, 'light', { checkThemeControl: false });
      screenshots.push(await capture(cdp, page, `board-global-material-${width}-light.png`));

      await forceVisualTheme(cdp, page, 'dark');
      const dark = await inspectMatrices(cdp, page, width, 'dark', { checkThemeControl: false });
      screenshots.push(await capture(cdp, page, `board-global-material-${width}-dark.png`));

      // Forced root/body values above are palette-only checks. Reload to start the
      // actual button test from the application's normally initialized state.
      await reloadAndWaitReady(cdp, page);
      const normalInitial = await browser.evaluate(cdp, page, `(() => ({
        root: document.documentElement.dataset.theme,
        bodyLight: document.body.classList.contains('theme-light'),
        bodyDark: document.body.classList.contains('theme-dark'),
        pressed: document.querySelector('[data-shared-theme-button]')?.getAttribute('aria-pressed'),
        label: document.querySelector('[data-shared-theme-button]')?.getAttribute('aria-label')
      }))()`);
      assert.ok(['light', 'dark'].includes(normalInitial.root), `${width}px normal startup theme missing ${JSON.stringify(normalInitial)}`);
      assert.equal(normalInitial.bodyLight, normalInitial.root === 'light', `${width}px normal startup body-light mismatch ${JSON.stringify(normalInitial)}`);
      assert.equal(normalInitial.bodyDark, normalInitial.root === 'dark', `${width}px normal startup body-dark mismatch ${JSON.stringify(normalInitial)}`);
      assert.equal(normalInitial.pressed, String(normalInitial.root === 'dark'), `${width}px normal startup button state mismatch ${JSON.stringify(normalInitial)}`);
      const initialInspection = await inspectMatrices(cdp, page, width, normalInitial.root);

      const toggleTo = async theme => {
        await browser.clickSelector(cdp, page, '[data-shared-theme-button]');
        await browser.waitFor(async () => browser.evaluate(cdp, page, `document.documentElement.dataset.theme === ${JSON.stringify(theme)}`), { timeoutMs: 5000 });
        return inspectMatrices(cdp, page, width, theme);
      };
      let lightStart = initialInspection;
      if (normalInitial.root !== 'light') lightStart = await toggleTo('light');
      const darkAfterClick = await toggleTo('dark');
      const lightAfterClick = await toggleTo('light');
      await reloadAndWaitReady(cdp, page);
      const reloadedLight = await inspectMatrices(cdp, page, width, 'light');
      assert.notEqual(lightStart.matrices.special.matrixBackground, darkAfterClick.matrices.special.matrixBackground, `${width}px button operation changes the special table palette`);
      assert.notEqual(darkAfterClick.matrices.advanced.matrixBackground, lightAfterClick.matrices.advanced.matrixBackground, `${width}px second button operation restores the advanced table palette`);
      themeDiagnostics.push({
        width,
        normalInitial,
        forcedPaletteOnly: ['light', 'dark'],
        realButtonSequence: ['light', 'dark', 'light'],
        darkAfterClick: { root: darkAfterClick.theme, bodyDark: darkAfterClick.bodyDark, pressed: darkAfterClick.themeButton.pressed },
        lightAfterClick: { root: lightAfterClick.theme, bodyLight: lightAfterClick.bodyLight, pressed: lightAfterClick.themeButton.pressed },
        reloaded: { root: reloadedLight.theme, bodyLight: reloadedLight.bodyLight, pressed: reloadedLight.themeButton.pressed }
      });
    }
    process.stdout.write(`${JSON.stringify({ ok: true, viewportThemes: ['1280x900 light/dark', '390x844 light/dark'], themeDiagnostics, screenshots }, null, 2)}\n`);
  } finally {
    try { if (page && cdp) await cdp.send('Target.closeTarget', { targetId: page.targetId }); } catch (_) {}
    try { if (cdp) await cdp.send('Browser.close'); } catch (_) {}
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    await new Promise(resolve => server.close(resolve));
    await browser.sleep(250);
    try { fs.rmSync(profileRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch (_) {}
  }
}

if (require.main === module) {
  run().catch(error => {
    process.stderr.write(`${error.stack || error}\n`);
    process.exitCode = 1;
  });
}

module.exports = { inspectMatrices, run };
