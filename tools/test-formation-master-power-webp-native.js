#!/usr/bin/env node
'use strict';

// Isolated-browser regression for formation master-power images and requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ROOT = path.resolve(process.env.MASTER_POWER_TEST_ROOT || PROJECT_ROOT);
const ROUTE = process.env.MASTER_POWER_TEST_ROUTE || '/stat-dashboard.html?masterPowerWebpTest=1';
const ROUTE_PATH = new URL(ROUTE, 'http://127.0.0.1').pathname;
const LEGACY_ROOT = path.join(ROOT, 'trickcal-manager');
const ASSET_ROOT = path.resolve(process.env.MASTER_POWER_TEST_ASSET_ROOT
  || (ROUTE_PATH.startsWith('/trickcal-manager/') && fs.existsSync(path.join(LEGACY_ROOT, 'img')) ? LEGACY_ROOT : ROOT));
const SCREENSHOT_DIR = process.env.MASTER_POWER_TEST_SCREENSHOT_DIR
  ? path.resolve(process.env.MASTER_POWER_TEST_SCREENSHOT_DIR)
  : '';
const EXPECTED_NAMES = [
  'ヌルゲーシールド', 'ポップピンスター', 'ボディブロー',
  'マジ天罰', '安心毛布', '急発進'
];
const MIME = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.mp4': 'video/mp4'
};

function startServer() {
  return http.createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname); }
    catch (_) { response.writeHead(400); response.end('Bad path'); return; }
    const relative = pathname.replace(/^\/+/, '') || 'index.html';
    let file = path.resolve(ROOT, relative);
    const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : `${ROOT}${path.sep}`;
    if (file.startsWith(rootPrefix) && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (file !== ROOT && !file.startsWith(rootPrefix)) { response.writeHead(404); response.end('Not found'); return; }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(fs.readFileSync(file));
  });
}

async function openChrome(cdpPort, profileRoot) {
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
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: width <= 720
  }, page.sessionId);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `innerWidth === ${width} && innerHeight === ${height}`), { timeoutMs: 5000 });
}

async function navigate(cdp, page, url) {
  await cdp.send('Page.navigate', { url }, page.sessionId);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() =>
    document.readyState === 'complete'
      && !!window.TRICKCAL_DASHBOARD_NAV
      && !!document.querySelector('[data-topbar-operation="formation"]')
      && document.body.classList.contains('is-booting') === false
  )()`), { timeoutMs: 30000 });
  await browser.evaluate(cdp, page, `document.querySelector('#trickcal-announcements-dialog')?.close()`);
}

async function waitForFormation(cdp, page, requests = []) {
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() =>
    document.querySelector('[data-dashboard-panel="formation"]')?.classList.contains('is-active')
      && document.querySelectorAll('#formation-master-power [data-formation-master-power]').length === ${EXPECTED_NAMES.length}
  )()`), { timeoutMs: 30000 });
  try {
    await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
      const images = [...document.querySelectorAll('#formation-master-power .formation-master-power-media > img')];
      return images.length === ${EXPECTED_NAMES.length} && images.every(image => image.complete && image.naturalWidth > 0);
    })()`), { timeoutMs: 15000 });
  } catch (error) {
    const imageState = await browser.evaluate(cdp, page, `(() => [...document.querySelectorAll('#formation-master-power .formation-master-power-media > img')].map(image => ({
      src: image.src, currentSrc: image.currentSrc, complete: image.complete, naturalWidth: image.naturalWidth
    })))()`);
    const cardRequests = requests.filter(url => /\/img\/Card\//i.test(url));
    throw new Error(`${error.message}; images=${JSON.stringify(imageState)}; cardRequests=${JSON.stringify(cardRequests)}`);
  }
}

async function saveScreenshot(cdp, page, filename) {
  if (!SCREENSHOT_DIR) return;
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, page.sessionId);
  fs.writeFileSync(path.join(SCREENSHOT_DIR, filename), Buffer.from(result.data, 'base64'));
}

async function facts(cdp, page) {
  return browser.evaluate(cdp, page, `(() => {
    const container = document.querySelector('#formation-master-power');
    const cards = [...container.querySelectorAll('[data-formation-master-power]')];
    return {
      theme: document.documentElement.dataset.theme || '',
      runtime: window.TRICKCAL_PUBLIC_SITE ? {
        profile: window.TRICKCAL_PUBLIC_SITE.profile,
        assetBasePath: window.TRICKCAL_PUBLIC_SITE.assetBasePath,
        assetVersion: window.TRICKCAL_PUBLIC_SITE.assetVersion
      } : { profile: 'source', assetBasePath: '', assetVersion: '' },
      videos: container.querySelectorAll('video, source').length,
      powers: cards.map(card => {
        const image = card.querySelector('.formation-master-power-media > img');
        const style = image ? getComputedStyle(image) : null;
        return {
          id: card.dataset.formationMasterPower,
          name: card.querySelector('strong')?.textContent.trim() || '',
          pressed: card.getAttribute('aria-pressed'),
          image: image?.currentSrc || image?.src || '',
          complete: image?.complete || false,
          naturalWidth: image?.naturalWidth || 0,
          objectFit: style?.objectFit || '',
          cardWidth: Math.round(card.getBoundingClientRect().width),
          cardHeight: Math.round(card.getBoundingClientRect().height),
          costVisible: (() => {
            const badge = card.querySelector('.formation-cost-badge');
            const icon = badge?.querySelector('img');
            const rect = badge?.getBoundingClientRect();
            return !!badge && rect.width > 0 && rect.height > 0 && (!icon || (icon.complete && icon.naturalWidth > 0));
          })()
        };
      })
    };
  })()`);
}

function assertImageCards(state) {
  assert.equal(state.videos, 0, '権能領域にvideo/source要素がない');
  const byName = new Map(state.powers.map(power => [power.name, power]));
  for (const name of EXPECTED_NAMES) {
    const item = byName.get(name);
    assert.ok(item, `権能カードがある: ${name}`);
    assert.equal(item.complete, true, `${name} WebP complete`);
    assert.ok(item.naturalWidth > 0, `${name} WebP naturalWidth`);
    const imageUrl = new URL(item.image);
    assert.equal(decodeURIComponent(imageUrl.pathname).split('/').pop(), `権能_${name}.webp`, `${name} WebP URL`);
    if (state.runtime.profile !== 'source') {
      const base = state.runtime.assetBasePath.replace(/\/+$/, '');
      assert.ok(imageUrl.pathname.startsWith(`${base}/img/`), `${name} profile assetBasePath`);
      assert.equal(imageUrl.searchParams.get('v'), state.runtime.assetVersion, `${name} profile asset version`);
    }
    assert.equal(item.objectFit, 'contain', `${name}画像は切り抜かず枠内に収まる`);
    assert.ok(item.cardWidth > 0 && item.cardHeight > 0, `${name}カード寸法を保持`);
    assert.equal(item.costVisible, true, `${name}コスト表示を保持`);
  }
  return byName;
}

function assertNoVideoRequests(requests, stage) {
  const mp4Requests = requests.filter(url => {
    try { return decodeURIComponent(new URL(url).pathname).toLowerCase().endsWith('.mp4'); }
    catch (_) { return /\.mp4(?:[?#]|$)/i.test(url); }
  });
  assert.deepEqual(mp4Requests, [], `${stage}: 権能MP4の通信要求がない`);
}

async function run() {
  assert.ok(fs.existsSync(ROOT), `test root exists: ${ROOT}`);
  const cardRoot = path.join(ASSET_ROOT, 'img', 'Card');
  for (const name of EXPECTED_NAMES) {
    assert.ok(fs.existsSync(path.join(cardRoot, `権能_${name}.webp`)), `${name} WebP exists in tested root`);
    assert.equal(fs.existsSync(path.join(cardRoot, `権能_${name}.mp4`)), false, `${name} MP4 excluded from tested root`);
  }

  const server = startServer();
  const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-master-power-webp-'));
  let chrome = null;
  let cdp = null;
  let page = null;
  let serverAddress;
  const requests = [];
  try {
    serverAddress = await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => resolve(server.address()));
    });
    const cdpPort = await browser.findFreePort([serverAddress.port]);
    ({ chrome, cdp } = await openChrome(cdpPort, profileRoot));
    page = await browser.createPage(cdp, 'about:blank');
    await cdp.send('Page.enable', {}, page.sessionId);
    await cdp.send('Network.enable', {}, page.sessionId);
    await cdp.send('Network.setBlockedURLs', {
      urls: ['https://www.googletagmanager.com/*', 'https://www.google-analytics.com/*']
    }, page.sessionId);
    cdp.on(page.sessionId, 'Network.requestWillBeSent', params => requests.push(params.request.url));
    const origin = `http://127.0.0.1:${serverAddress.port}`;
    const initialUrl = new URL(ROUTE, origin).href;
    await setViewport(cdp, page, 1280, 900);
    await navigate(cdp, page, initialUrl);
    assertNoVideoRequests(requests, '初期表示');

    const formationButton = '[data-topbar-operation="formation"]';
    await browser.clickSelector(cdp, page, formationButton);
    await waitForFormation(cdp, page, requests);
    let current = assertImageCards(await facts(cdp, page));
    assertNoVideoRequests(requests, '編成へ画面切替後');

    for (const width of [1280, 375]) {
      await setViewport(cdp, page, width, width === 375 ? 844 : 900);
      for (const theme of ['light', 'dark']) {
        // Isolate visual theme coverage from the manager's existing theme-toggle wiring;
        // this fixture only changes document theme classes and never writes saved state.
        await browser.evaluate(cdp, page, `(() => {
          const theme = ${JSON.stringify(theme)};
          document.documentElement.dataset.theme = theme;
          document.body.classList.toggle('theme-light', theme === 'light');
          document.body.classList.toggle('theme-dark', theme === 'dark');
          return theme;
        })()`);
        current = assertImageCards(await facts(cdp, page));
        assert.equal((await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme || ""')), theme, `${width}px ${theme} theme`);
      }
    }

    const target = current.get(EXPECTED_NAMES[0]);
    assert.ok(target?.id, '選択対象の権能IDをDOMから取得');
    const selector = `[data-formation-master-power="${target.id.replace(/["\\]/g, '\\$&')}"]`;
    const formationUrl = new URL(ROUTE, origin);
    formationUrl.searchParams.set('view', 'formation');

    await browser.clickSelector(cdp, page, selector);
    await browser.waitFor(async () => browser.evaluate(cdp, page, `document.querySelector(${JSON.stringify(selector)})?.getAttribute('aria-pressed') === 'true'`));
    assertImageCards(await facts(cdp, page));
    assertNoVideoRequests(requests, '権能選択後');

    await navigate(cdp, page, formationUrl.href);
    await waitForFormation(cdp, page, requests);
    await browser.waitFor(async () => browser.evaluate(cdp, page, `document.querySelector(${JSON.stringify(selector)})?.getAttribute('aria-pressed') === 'true'`));
    assertImageCards(await facts(cdp, page));

    await browser.clickSelector(cdp, page, selector);
    await browser.waitFor(async () => browser.evaluate(cdp, page, `document.querySelector(${JSON.stringify(selector)})?.getAttribute('aria-pressed') === 'false'`));
    await navigate(cdp, page, formationUrl.href);
    await waitForFormation(cdp, page, requests);
    await browser.waitFor(async () => browser.evaluate(cdp, page, `document.querySelector(${JSON.stringify(selector)})?.getAttribute('aria-pressed') === 'false'`));

    await browser.clickSelector(cdp, page, selector);
    await browser.waitFor(async () => browser.evaluate(cdp, page, `document.querySelector(${JSON.stringify(selector)})?.getAttribute('aria-pressed') === 'true'`));
    for (const width of [1280, 375]) {
      await setViewport(cdp, page, width, width === 375 ? 844 : 900);
      for (const theme of ['light', 'dark']) {
        await browser.evaluate(cdp, page, `(() => {
          const theme = ${JSON.stringify(theme)};
          document.documentElement.dataset.theme = theme;
          document.body.classList.toggle('theme-light', theme === 'light');
          document.body.classList.toggle('theme-dark', theme === 'dark');
        })()`);
        assertImageCards(await facts(cdp, page));
        const profile = (await facts(cdp, page)).runtime.profile;
        await browser.evaluate(cdp, page, `document.querySelector('#formation-master-power')?.scrollIntoView({ block: 'end', inline: 'nearest', behavior: 'instant' })`);
        await browser.sleep(120);
        await saveScreenshot(cdp, page, `${profile}-${width}-${theme}.png`);
      }
    }
    assertNoVideoRequests(requests, '選択／解除／再選択・再読込後');

    process.stdout.write(`${JSON.stringify({
      ok: true,
      root: ROOT,
      assetRoot: ASSET_ROOT,
      route: ROUTE,
      runtime: (await facts(cdp, page)).runtime,
      viewportChecks: [1280, 375],
      themes: ['light', 'dark'],
      expectedWebpCount: EXPECTED_NAMES.length,
      finalImages: [...(await facts(cdp, page)).powers].map(({ name, image, naturalWidth, pressed, costVisible }) => ({ name, image, naturalWidth, pressed, costVisible })),
      mp4Requests: requests.filter(url => /\.mp4(?:[?#]|$)/i.test(url)).length,
      managerView: await browser.evaluate(cdp, page, 'window.TRICKCAL_DASHBOARD_NAV.getState().view')
    }, null, 2)}\n`);
  } finally {
    try { if (page && cdp) await cdp.send('Target.closeTarget', { targetId: page.targetId }); } catch (_) {}
    try { if (cdp) await cdp.send('Browser.close'); } catch (_) {}
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    await new Promise(resolve => server.close(() => resolve()));
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
