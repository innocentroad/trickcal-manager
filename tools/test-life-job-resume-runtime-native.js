#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const root = path.resolve(__dirname, '..');

async function run() {
  const port = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([port]);
  const origin = `http://127.0.0.1:${port}`;
  const missing = [];
  const server = http.createServer((request, response) => {
    const relative = decodeURIComponent(new URL(request.url, origin).pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      if (relative.includes('Materials/')) missing.push(relative);
      response.writeHead(404); response.end(); return;
    }
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html' }[path.extname(file)] || 'application/octet-stream');
    response.end(fs.readFileSync(file));
  }).listen(port, '127.0.0.1');
  const profileRoot = path.join(root, 'tmp');
  fs.mkdirSync(profileRoot, { recursive: true });
  const profile = fs.mkdtempSync(path.join(profileRoot, 'life-job-resume-browser-'));
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
    const page = await browser.createPage(cdp, `${origin}/stat-dashboard.html?global=research`);
    await cdp.send('Page.enable', {}, page.sessionId);
    const evalPage = script => browser.evaluate(cdp, page, script);
    await browser.waitFor(async () => evalPage(
      "document.documentElement.dataset.storageBoot==='ready'&&document.querySelector('#research-plan-summary [data-research-plan-material]')"
    ), { timeoutMs: 30000 });
    const actual = await evalPage(`(() => {
      const data=window.TRICKCAL_STAT_DATA.sheets.lifeJobs;
      const materials=new Map(data.materials.map(item=>[item.id,item.name]));
      const linkedNames=new Set(data.resumeMaterialSlots.map(slot=>materials.get(slot.materialId)));
      const chip=[...document.querySelectorAll('#research-plan-summary [data-research-plan-material]')]
        .find(item=>linkedNames.has(item.dataset.researchPlanMaterial));
      if (!chip) return {error:'no linked research material'};
      chip.click();
      const material=chip.dataset.researchPlanMaterial;
      const materialId=data.materials.find(item=>item.name===material)?.id;
      const expected=data.resumeMaterialSlots.filter(slot=>slot.materialId===materialId);
      return {
        material,
        open:document.querySelector('#research-material-dialog').open,
        heading:document.querySelector('.research-life-job-sources h5')?.textContent,
        link:new URL(document.querySelector('.research-life-job-detail-link')?.href||'',location.href).searchParams.get('material'),
        expected:expected.map(slot=>({name:slot.apostleName,main:slot.isBest})).sort((a,b)=>a.name.localeCompare(b.name,'ja')),
        shown:[...document.querySelectorAll('.research-life-job-apostle')]
          .map(node=>({name:node.textContent.trim(),main:node.classList.contains('is-main')}))
          .sort((a,b)=>a.name.localeCompare(b.name,'ja'))
      };
    })()`);
    assert.equal(actual.error, undefined, JSON.stringify(actual));
    assert.equal(actual.open, true);
    assert.equal(actual.heading, '関連使徒');
    assert.equal(actual.link, actual.material);
    assert.deepEqual(actual.shown, actual.expected);
    assert.deepEqual(missing, []);
    console.log(JSON.stringify({ result: 'ok', material: actual.material, relatedApostles: actual.shown.length }));
  } finally {
    try { if (cdp) await cdp.send('Browser.close'); } catch (_) {}
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    await new Promise(resolve => server.close(resolve));
    const safeRoot = path.resolve(profileRoot) + path.sep;
    if (path.resolve(profile).startsWith(safeRoot) && path.basename(profile).startsWith('life-job-resume-browser-')) {
      try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); }
      catch (error) { console.warn(`隔離Chromeの一時profileを削除できませんでした: ${profile} (${error.code})`); }
    }
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
