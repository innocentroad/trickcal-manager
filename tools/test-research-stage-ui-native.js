#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const root = path.resolve(__dirname, '..');
const captureDir = path.join(root, 'tmp', 'research-stage-ui');

async function run() {
  const serverPort = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([serverPort]);
  const origin = `http://127.0.0.1:${serverPort}`;
  const server = http.createServer((request, response) => {
    const relative = decodeURIComponent(new URL(request.url, origin).pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html' }[path.extname(file)] || 'application/octet-stream');
    response.end(fs.readFileSync(file));
  }).listen(serverPort, '127.0.0.1');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-research-stage-'));
  let chrome, cdp;
  try {
    await browser.waitForHttp(`${origin}/stat-dashboard.html`);
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
    fs.mkdirSync(captureDir, { recursive: true });
    for (const width of [1280, 375]) {
      const page = await browser.createPage(cdp, `${origin}/stat-dashboard.html?global=research&researchNative=1`);
      await cdp.send('Page.enable', {}, page.sessionId);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 }, page.sessionId);
      await browser.waitFor(async () => browser.evaluate(cdp, page,
        "document.documentElement.dataset.storageBoot === 'ready' && document.querySelector('#research-level-select')?.options.length === 13"), { timeoutMs: 30000 });
      await browser.evaluate(cdp, page, "document.querySelector('#trickcal-announcements-dialog')?.close()");
      await browser.waitFor(async () => browser.evaluate(cdp, page, "document.querySelector('[data-dashboard-panel=global]')?.classList.contains('is-active')"));
      const initial = await browser.evaluate(cdp, page, "({levels:document.querySelector('#research-level-select').options.length, progress:document.querySelector('#research-progress-select').options.length})");
      assert.equal(initial.levels, 13);
      await browser.evaluate(cdp, page, "(() => { const s=document.querySelector('#research-level-select');s.value='12';s.dispatchEvent(new Event('change',{bubbles:true})); })()");
      await browser.waitFor(async () => browser.evaluate(cdp, page, "document.querySelector('#research-progress-select')?.options.length===48"));
      await browser.evaluate(cdp, page, "(() => { const s=document.querySelector('#research-progress-select');s.value='47';s.dispatchEvent(new Event('change',{bubbles:true})); })()");
      const selected = await browser.evaluate(cdp, page, "({level:document.querySelector('#research-level-select').value,progress:document.querySelector('#research-progress-select').value,summary:document.querySelector('#research-overview-summary')?.textContent?.slice(0,120)})");
      assert.equal(selected.level, '12'); assert.equal(selected.progress, '47');
      const visibility = await browser.evaluate(cdp, page, "(() => { const el=document.querySelector('#research-level-select');el.scrollIntoView({block:'start',behavior:'instant'});window.scrollBy(0,-120);const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,display:getComputedStyle(el).display}; })()");
      assert.ok(visibility.width > 0 && visibility.height > 0);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, page.sessionId);
      fs.writeFileSync(path.join(captureDir, `manager-${width}.png`), Buffer.from(data, 'base64'));
      await browser.waitFor(async () => browser.evaluate(cdp, page,
        "JSON.parse(localStorage.getItem('trickcal_stat_prototype_v1')||'{}').research?.progress===47"));
      await browser.evaluate(cdp, page, 'location.reload()');
      await browser.waitFor(async () => browser.evaluate(cdp, page,
        "document.documentElement.dataset.storageBoot==='ready'&&document.querySelector('#research-level-select')?.value==='12'&&document.querySelector('#research-progress-select')?.value==='47'"), { timeoutMs: 30000 });
      await browser.evaluate(cdp, page, "(() => { const s=document.querySelector('#research-level-select');s.value='10';s.dispatchEvent(new Event('change',{bubbles:true})); })()");
      const reduced = await browser.evaluate(cdp, page, "({progress:document.querySelector('#research-progress-select').value,count:document.querySelector('#research-progress-select').options.length})");
      assert.equal(reduced.progress, '45'); assert.equal(reduced.count, 46);
      console.log(JSON.stringify({ page: 'manager', width, initial, selected, reduced, visibility }));
      await cdp.send('Target.closeTarget', { targetId: page.targetId });
    }
    const calc = await browser.createPage(cdp, `${origin}/formation-damage-calc.html?researchNative=1`);
    await cdp.send('Page.enable', {}, calc.sessionId);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, calc.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, calc, "document.querySelector('#fdc-enemy-research-level')?.options.length===13"), { timeoutMs: 30000 });
    const enemy = await browser.evaluate(cdp, calc, "({levels:document.querySelector('#fdc-enemy-research-level').options.length,progress:document.querySelector('#fdc-enemy-research-progress').options.length})");
    assert.equal(enemy.levels, 13);
    await browser.evaluate(cdp, calc, "(() => { const s=document.querySelector('#fdc-enemy-source-mode');s.value='apostle';s.dispatchEvent(new Event('change',{bubbles:true})); })()");
    await browser.waitFor(async () => browser.evaluate(cdp, calc, "document.querySelector('#fdc-enemy-global-percent-category')?.hidden===false"));
    const enemyId = await browser.evaluate(cdp, calc, "(() => { const id=window.TRICKCAL_STAT_DATA.sheets.basicInfo.find(row=>row.種族==='精霊')?.id;const s=document.querySelector('#fdc-enemy-apostle');s.value=id;s.dispatchEvent(new Event('change',{bubbles:true}));return id; })()");
    await browser.evaluate(cdp, calc, "(() => { const s=document.querySelector('#fdc-enemy-research-level');s.value='12';s.dispatchEvent(new Event('change',{bubbles:true})); })()");
    await browser.waitFor(async () => browser.evaluate(cdp, calc, "document.querySelector('#fdc-enemy-research-progress')?.options.length===48"));
    await browser.evaluate(cdp, calc, "(() => { const s=document.querySelector('#fdc-enemy-research-progress');s.value='47';s.dispatchEvent(new Event('change',{bubbles:true}));s.scrollIntoView({block:'center',behavior:'instant'}); })()");
    const applied = await browser.evaluate(cdp, calc, "(() => { document.querySelector('#fdc-enemy-additive-preset-apply')?.click();return {patk:document.querySelector('#fdc-enemy-global-additive-patk')?.value}; })()");
    assert.equal(Number(applied.patk), 389, `enemy ${enemyId} research applied`);
    console.log(JSON.stringify({ page: 'enemy-apply', applied }));
    for (const width of [1280, 375]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 }, calc.sessionId);
      if (width < 500) await browser.evaluate(cdp, calc, "document.querySelector('#fdc-mobile-side-switch [data-fdc-mobile-side=enemy]')?.click()");
      const state = await browser.evaluate(cdp, calc, "(() => { const s=document.querySelector('#fdc-enemy-research-progress');s.scrollIntoView({block:'center',behavior:'instant'});const r=s.getBoundingClientRect();return {level:document.querySelector('#fdc-enemy-research-level').value,progress:s.value,options:s.options.length,rect:{x:r.x,y:r.y,width:r.width,height:r.height}}; })()");
      assert.equal(state.level, '12'); assert.equal(state.progress, '47'); assert.equal(state.options, 48);
      assert.ok(state.rect.width > 0 && state.rect.height > 0);
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, calc.sessionId);
      fs.writeFileSync(path.join(captureDir, `calculation-${width}.png`), Buffer.from(shot.data, 'base64'));
      console.log(JSON.stringify({ page: 'calculation', width, enemy, state }));
    }
    await cdp.send('Target.closeTarget', { targetId: calc.targetId });
  } finally {
    try { if (cdp) await cdp.send('Browser.close'); } catch (_) {}
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    await new Promise(resolve => server.close(resolve));
    if (path.resolve(profile).startsWith(`${path.resolve(os.tmpdir())}${path.sep}`)) {
      try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch (_) {}
    }
  }
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
