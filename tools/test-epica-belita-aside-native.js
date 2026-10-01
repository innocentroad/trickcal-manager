#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'tmp', 'epica-belita-aside-local-20261001');
const apostleIds = ['Epica', 'Belita'];
const mime = {
  '.css':'text/css; charset=utf-8', '.html':'text/html; charset=utf-8',
  '.js':'application/javascript; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.png':'image/png', '.webp':'image/webp'
};

function makeFixture(id, legacy) {
  const state = {
    activeId: id,
    apostles: {
      [id]: {
        level:120, star:3, grade:1, gradeConfigured:true, rank:1, bond:1,
        asideRank:3, asideLevel:50, skillLevels:{ low:1, high:1, passive:1 },
        follow:false, equipment:{}, boards:{}, statSnapshots:{}
      }
    },
    research: {}, cards: {}
  };
  const stateJson = JSON.stringify(JSON.stringify(state));
  const target = `${legacy ? '/trickcal-manager' : ''}/stat-dashboard.html?view=aside&asideImageCheck=1`;
  return `<!doctype html><meta charset="utf-8"><script>localStorage.setItem('trickcal_stat_prototype_v1',${stateJson});location.replace(${JSON.stringify(target)});</script>`;
}

async function run() {
  fs.mkdirSync(output, { recursive:true });
  const port = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([port]);
  const origin = `http://127.0.0.1:${port}`;
  const assetFailures = [];
  const runtimeErrors = [];
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, origin);
    const requestedPath = decodeURIComponent(url.pathname);
    const legacy = requestedPath.startsWith('/trickcal-manager/');
    const pathname = requestedPath.replace(/^\/trickcal-manager(?=\/|$)/, '') || '/';
    if (pathname === '/__aside_fixture') {
      const id = url.searchParams.get('id');
      if (!apostleIds.includes(id)) { response.writeHead(404); response.end(); return; }
      response.writeHead(200, { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store' });
      response.end(makeFixture(id, legacy));
      return;
    }
    const relative = pathname.replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end('Not found'); return;
    }
    response.writeHead(200, { 'Content-Type':mime[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-store' });
    response.end(fs.readFileSync(file));
  }).listen(port, '127.0.0.1');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-aside-epica-belita-'));
  let chrome = null;
  let cdp = null;
  const pages = [];
  try {
    await browser.waitForHttp(`${origin}/stat-dashboard.html`);
    chrome = browser.startChild(browser.findChrome(), [
      `--user-data-dir=${profile}`, `--remote-debugging-port=${cdpPort}`, '--remote-debugging-address=127.0.0.1',
      '--no-first-run', '--no-default-browser-check', '--disable-sync', '--disable-extensions',
      '--disable-background-networking', '--window-size=1280,900', '--new-window', 'about:blank'
    ], root);
    const version = await browser.waitFor(async () => {
      const result = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
      return result.ok ? result.json() : null;
    }, { timeoutMs:30000 });
    cdp = new browser.CdpClient(version.webSocketDebuggerUrl);
    await cdp.connect();

    const records = [];
    for (const legacy of [false, true]) {
      const prefix = legacy ? '/trickcal-manager' : '';
      for (const id of apostleIds) {
        const page = await browser.createPage(cdp, 'about:blank');
        pages.push(page);
        await cdp.send('Page.enable', {}, page.sessionId);
        await cdp.send('Network.enable', {}, page.sessionId);
        await cdp.send('Runtime.enable', {}, page.sessionId);
        cdp.on(page.sessionId, 'Runtime.exceptionThrown', params => {
          runtimeErrors.push({ kind:'exception', text:params.exceptionDetails?.text || '', description:params.exceptionDetails?.exception?.description || '' });
        });
        cdp.on(page.sessionId, 'Runtime.consoleAPICalled', params => {
          if (params.type === 'error') runtimeErrors.push({ kind:'console', text:(params.args || []).map(arg=>arg.value ?? arg.description ?? '').join(' ') });
        });
        cdp.on(page.sessionId, 'Network.responseReceived', params => {
          if (params.response.status >= 400 && /\/img\/Chara\/Aside\//.test(new URL(params.response.url).pathname)) {
            assetFailures.push({ status:params.response.status, url:params.response.url });
          }
        });
        await cdp.send('Page.navigate', { url:`${origin}${prefix}/__aside_fixture?id=${id}` }, page.sessionId);
        try {
          await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
            const list=document.querySelector('#aside-info-list');
            const images=[...document.querySelectorAll('#aside-info-list img[data-apostle-image]')];
            return document.documentElement.dataset.storageBoot==='ready'
              && document.querySelector('[data-dashboard-panel="aside"]')?.classList.contains('is-active')
              && document.querySelector('#aside-rank-select')?.value==='3'
              && list?.querySelectorAll('.aside-info-card').length===4
              && images.length===4 && images.every(image=>image.complete&&image.naturalWidth>0);
          })()`), { timeoutMs:30000 });
        } catch (error) {
          const contentState = await browser.evaluate(cdp, page, `(() => ({path:location.pathname,bodyClass:document.body.className,ariaBusy:document.body.getAttribute('aria-busy'),storageBoot:document.documentElement.dataset.storageBoot,storageError:document.documentElement.dataset.storageError,activeId:document.querySelector('#apostle-select')?.value,asideRank:document.querySelector('#aside-rank-select')?.value,panel:document.querySelector('[data-dashboard-panel="aside"]')?.className,asideText:document.querySelector('#aside-info-list')?.innerText,cardCount:document.querySelectorAll('#aside-info-list .aside-info-card').length,images:[...document.querySelectorAll('#aside-info-list img[data-apostle-image]')].map(i=>({src:i.currentSrc||i.src,complete:i.complete,width:i.naturalWidth}))}))()`);
          throw new Error(`Aside content did not match fixture: ${JSON.stringify({ contentState, runtimeErrors, cause:error.message })}`);
        }
        try {
          await browser.waitFor(async () => browser.evaluate(cdp, page, `!document.body.classList.contains('is-booting')
            && document.body.getAttribute('aria-busy')!=='true'`), { timeoutMs:30000 });
        } catch (error) {
          const bootState = await browser.evaluate(cdp, page, `({className:document.body.className,ariaBusy:document.body.getAttribute('aria-busy'),storageBoot:document.documentElement.dataset.storageBoot,storageError:document.documentElement.dataset.storageError,bodyText:document.body.innerText.slice(0,300)})`);
          throw new Error(`Dashboard did not finish booting: ${JSON.stringify({ bootState, runtimeErrors, cause:error.message })}`);
        }
        await browser.evaluate(cdp, page, 'document.querySelector("#trickcal-announcements-dialog")?.close()');

        for (const [theme, width, height] of [
          ['light',1280,900], ['dark',1280,900], ['light',375,844], ['dark',375,844]
        ]) {
          const currentTheme = await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme');
          if (currentTheme !== theme) await browser.clickSelector(cdp, page, '.dashboard-top-theme-toggle');
          await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor:1, mobile:width<500 }, page.sessionId);
          await browser.waitFor(async () => browser.evaluate(cdp, page, `innerWidth===${width}&&document.documentElement.dataset.theme===${JSON.stringify(theme)}`), { timeoutMs:5000 });
          const facts = await browser.evaluate(cdp, page, `(() => {
            const list=document.querySelector('#aside-info-list');
            const images=[...list.querySelectorAll('img[data-apostle-image]')];
            const rect=list.getBoundingClientRect();
            return {apostle:document.querySelector('#apostle-select')?.value||'',path:location.pathname,
              theme:document.documentElement.dataset.theme,width:innerWidth,
              asideName:list.innerText.includes(${JSON.stringify(id==='Epica'?'エピカン':'わらわの心の中の妹')}),
              imagePaths:images.map(image=>new URL(image.currentSrc||image.src).pathname),
              imagesLoaded:images.every(image=>image.complete&&image.naturalWidth>0),
              broken:[...document.querySelectorAll('img')].filter(image=>image.getBoundingClientRect().width>0&&image.complete&&image.naturalWidth===0).map(image=>image.currentSrc||image.src),
              overflow:document.documentElement.scrollWidth>innerWidth,
              listRect:{top:rect.top,bottom:rect.bottom,height:rect.height}};
          })()`);
          assert.equal(facts.apostle, id, `${id}/${legacy?'legacy':'new'} selection`);
          assert.equal(facts.asideName, true, `${id}: aside name and rank details`);
          assert.equal(facts.imagesLoaded, true, `${id}: aside icon and A1-A3 images loaded`);
          assert.deepEqual(facts.broken.filter(url=>/\/img\/Chara\/Aside\//.test(url)), [], `${id}: no failed aside images`);
          assert.equal(facts.overflow, false, `${id}/${width}: page has no horizontal overflow`);
          assert.equal(facts.imagePaths.length, 4);
          const base = legacy ? '/trickcal-manager/img/Chara/Aside/' : '/img/Chara/Aside/';
          assert.ok(facts.imagePaths.every(value=>value.startsWith(base)), `${id}: profile-aware aside asset URLs`);
          if (legacy) assert.equal(facts.path, '/trickcal-manager/stat-dashboard.html');
          else assert.equal(facts.path, '/stat-dashboard.html');
          await browser.evaluate(cdp, page, 'document.querySelector("#aside-info-list")?.scrollIntoView({block:"center",behavior:"instant"})');
          const image = await cdp.send('Page.captureScreenshot', { format:'png', captureBeyondViewport:false }, page.sessionId);
          const name = `${legacy?'legacy':'new'}-${id.toLowerCase()}-${theme}-${width}.png`;
          fs.writeFileSync(path.join(output, name), Buffer.from(image.data, 'base64'));
          records.push({ profile:legacy?'legacy':'new', id, theme, width, image:`tmp/epica-belita-aside-local-20261001/${name}`, imagePaths:facts.imagePaths });
        }
        await cdp.send('Target.closeTarget', { targetId:page.targetId });
      }
    }
    assert.deepEqual(assetFailures, [], 'no failed aside asset responses in either profile');
    console.log(JSON.stringify({ result:'ok', records, asideAssetFailures:assetFailures }, null, 2));
  } finally {
    try { if (cdp) await cdp.send('Browser.close'); } catch (_) {}
    try { if (cdp) cdp.close(); } catch (_) {}
    try { if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill(); } catch (_) {}
    await new Promise(resolve => server.close(resolve));
    if (path.resolve(profile).startsWith(`${path.resolve(os.tmpdir())}${path.sep}`)) {
      try { fs.rmSync(profile, { recursive:true, force:true, maxRetries:3, retryDelay:100 }); } catch (_) {}
    }
  }
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
