#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'tmp', 'life-job-simple-ui-20261002');

async function run() {
  const port = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([port]);
  const origin = `http://127.0.0.1:${port}`;
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, origin).pathname)
      .replace(/^\/trickcal-manager(?=\/|$)/, '/');
    const relative = pathname.replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    const types = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png' };
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', types[path.extname(file).toLowerCase()] || 'application/octet-stream');
    response.end(fs.readFileSync(file));
  }).listen(port, '127.0.0.1');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-life-job-simple-'));
  let chrome, cdp;
  try {
    await browser.waitForHttp(`${origin}/public/life-jobs.html`);
    chrome = browser.startChild(browser.findChrome(), [
      `--user-data-dir=${profile}`, `--remote-debugging-port=${cdpPort}`, '--remote-debugging-address=127.0.0.1',
      '--no-first-run', '--no-default-browser-check', '--disable-sync', '--disable-extensions',
      '--disable-background-networking', '--window-size=1280,900', '--new-window', 'about:blank'
    ], root);
    const version = await browser.waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
      return response.ok ? response.json() : null;
    }, { timeoutMs: 30000 });
    cdp = new browser.CdpClient(version.webSocketDebuggerUrl);
    await cdp.connect();
    fs.mkdirSync(output, { recursive: true });
    for (const prefix of ['', '/trickcal-manager']) {
      for (const width of [1280, 375]) {
        const page = await browser.createPage(cdp,
          `${origin}${prefix}/public/life-jobs.html?view=apostle&apostle=${encodeURIComponent('タイダー')}`);
        await cdp.send('Page.enable', {}, page.sessionId);
        await cdp.send('Emulation.setDeviceMetricsOverride',
          { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 }, page.sessionId);
        const evaluate = script => browser.evaluate(cdp, page, script);
        await browser.waitFor(async () => evaluate(
          "window.TRICKCAL_STAT_DATA?.sheets?.lifeJobs?.schemaVersion===5 && document.querySelectorAll('.life-jobs-material-result').length===5"
        ), { timeoutMs: 30000 });
        await browser.waitFor(async () => evaluate(
          "document.querySelector('[data-shared-theme-button]')?.dataset.sharedThemeBound==='true'"
        ), { timeoutMs: 15000 });
        await evaluate("document.querySelector('#trickcal-announcements-dialog')?.close()");
        for (const theme of ['light', 'dark']) {
          if (await evaluate('document.documentElement.dataset.theme') !== theme) {
            await evaluate("document.querySelector('[data-shared-theme-button]').click()");
            await browser.waitFor(async () => (await evaluate('document.documentElement.dataset.theme')) === theme);
          }
          const state = await evaluate(`(() => ({
            names:[...document.querySelectorAll('.life-jobs-material-result')].map(x=>x.dataset.chooseMaterial),
            main:document.querySelectorAll('.life-jobs-material-icon.is-main').length,
            sources:[...document.querySelectorAll('.life-jobs-material-result small')].map(x=>x.textContent),
            broken:[...document.querySelectorAll('.life-jobs-item-image')].filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.src),
            overflow:document.documentElement.scrollWidth>innerWidth,
            jobDetails:document.querySelectorAll('.life-jobs-job-list, .life-jobs-grade-quantity').length
          }))()`);
          assert.deepEqual(state.names, ['蜜', '砂糖', '加工しやすい木', '睡眠アイマスク', '野菜']);
          assert.equal(state.main, 1);
          assert.equal(state.sources[2], '休息');
          assert.equal(state.sources[3], '休息');
          assert.deepEqual(state.broken, []);
          assert.equal(state.overflow, false);
          assert.equal(state.jobDetails, 0);
          await evaluate(`(() => {
            const button=document.querySelector('.life-jobs-material-result');button.focus();
          })()`);
          const focusName = await evaluate(`(() => {
            const button=document.querySelector('.life-jobs-material-result');
            return document.activeElement===button ? button.getAttribute('aria-label') : '';
          })()`);
          assert.match(focusName, /蜜/);
          const { data } = await cdp.send('Page.captureScreenshot',
            { format: 'png', captureBeyondViewport: false }, page.sessionId);
          fs.writeFileSync(path.join(output, `${prefix ? 'legacy' : 'new'}-${width}-${theme}.png`), Buffer.from(data, 'base64'));
        }
        await evaluate("document.querySelector('[data-choose-material=\"加工しやすい木\"]')?.click()");
        const reverse = await evaluate(`(() => ({
          selected:new URLSearchParams(location.search).get('material'),
          names:[...document.querySelectorAll('.life-jobs-apostle-result')].map(x=>x.dataset.chooseApostle),
          search:document.querySelector('#life-jobs-search-caption')?.textContent
        }))()`);
        assert.equal(reverse.selected, '加工しやすい木');
        assert.ok(reverse.names.includes('タイダー'));
        assert.equal(new Set(reverse.names).size, reverse.names.length);
        assert.equal(reverse.search, '素材名で検索');
        await evaluate("document.querySelector('#life-jobs-search').value='木';document.querySelector('#life-jobs-search').dispatchEvent(new Event('input',{bubbles:true}))");
        assert.ok(await evaluate("document.querySelectorAll('[data-select-material]').length>0"));
        await evaluate('history.back()');
        await browser.waitFor(async () => evaluate(
          "new URLSearchParams(location.search).get('apostle')==='タイダー' && document.querySelectorAll('.life-jobs-material-result').length===5"
        ));
        await evaluate("document.querySelector('[data-select-apostle=\"ナイア\"]')?.click()");
        const naia = await evaluate(`(() => ({
          names:[...document.querySelectorAll('.life-jobs-material-result')].map(x=>x.dataset.chooseMaterial),
          main:document.querySelectorAll('.life-jobs-material-icon.is-main').length
        }))()`);
        assert.deepEqual(naia.names, ['パリパリの金箔', 'ウィンクウィンク', 'チーズ']);
        assert.equal(naia.main, 1);
        await cdp.send('Target.closeTarget', { targetId: page.targetId });
      }
    }
    console.log(JSON.stringify({ result: 'ok', screenshots: output }));
  } finally {
    try { if (cdp) await cdp.send('Browser.close'); } catch (_) {}
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    await new Promise(resolve => server.close(resolve));
    const safe = `${path.resolve(os.tmpdir())}${path.sep}`;
    if (path.resolve(profile).startsWith(safe) && path.basename(profile).startsWith('trickcal-life-job-simple-')) {
      try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); }
      catch (error) { console.warn(`隔離profileの削除失敗: ${profile} (${error.code})`); }
    }
  }
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
