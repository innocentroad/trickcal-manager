#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const root = path.resolve(__dirname, '..');

async function run() {
  const port = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([port]);
  const origin = `http://127.0.0.1:${port}`;
  const server = http.createServer((request, response) => {
    const relative = decodeURIComponent(new URL(request.url, origin).pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    response.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp' }[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(fs.readFileSync(file));
  }).listen(port, '127.0.0.1');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-two-tone-targeted-'));
  let chrome, cdp, page, calcPage;
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
    page = await browser.createPage(cdp, `${origin}/stat-dashboard.html?view=formation&twoToneTargeted=1`);
    await cdp.send('Page.enable', {}, page.sessionId);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, page.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      "document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_STAT_ENGINE && document.querySelector('[data-dashboard-panel=formation]')?.classList.contains('is-active')"), { timeoutMs: 30000 });
    await browser.evaluate(cdp, page, 'document.querySelector("#trickcal-announcements-dialog")?.close()');
    const source = '[data-formation-apostle-row="0"][data-formation-line="0"]';
    const target = '[data-formation-apostle-row="0"][data-formation-line="1"]';
    await browser.clickSelector(cdp, page, source);
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog[open]');
    const placementClassificationIcon = await browser.evaluate(cdp, page,
      'document.querySelector("#formation-picker-grid [data-formation-picker-value=Joanne] .formation-picker-resonance-mark img")?.getAttribute("src") || ""');
    assert.match(placementClassificationIcon, /性格_裏面/);
    fs.mkdirSync(path.join(root, 'tmp'), { recursive: true });
    const placementIconShot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'joanne-classification-formation-picker.png'), Buffer.from(placementIconShot.data, 'base64'));
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }, page.sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }, page.sessionId);
    const focus = await browser.evaluate(cdp, page, `(() => {
      const card=document.querySelector('#formation-picker-grid [data-formation-picker-value="Joanne"]');
      card.focus(); const style=getComputedStyle(card);
      return {focusVisible:card.matches(':focus-visible'),outlineWidth:style.outlineWidth,outlineStyle:style.outlineStyle};
    })()`);
    assert.equal(focus.focusVisible, true);
    assert.notEqual(focus.outlineStyle, 'none');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="Joanne"]');
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="憂鬱"]');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      'window.TRICKCAL_STAT_ENGINE.getState().formation.rows[0].resonancePersonalities[0] === "憂鬱"'));
    await browser.evaluate(cdp, page, `document.querySelector('${source}').scrollIntoView({block:'center',behavior:'instant'})`);
    const centers = await browser.evaluate(cdp, page, `(() => {
      const center=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}};
      return {source:center('${source}'),target:center('${target}')};
    })()`);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: centers.source.x, y: centers.source.y, button: 'left', clickCount: 1 }, page.sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: centers.target.x, y: centers.target.y, button: 'left', buttons: 1 }, page.sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: centers.target.x, y: centers.target.y, button: 'left', buttons: 0, clickCount: 1 }, page.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      'window.TRICKCAL_STAT_ENGINE.getState().formation.rows[0].apostles[1] === "Joanne"'));
    const drag = await browser.evaluate(cdp, page, `(() => {
      const row=window.TRICKCAL_STAT_ENGINE.getState().formation.rows[0];
      return {apostles:row.apostles.slice(0,2),choices:row.resonancePersonalities.slice(0,2),twoTone:document.querySelector('${target}').classList.contains('is-two-tone')};
    })()`);
    assert.deepEqual(drag.apostles, ['', 'Joanne']);
    assert.deepEqual(drag.choices, [null, '憂鬱']);
    assert.equal(drag.twoTone, true);
    assert.match(await browser.evaluate(cdp, page,
      'document.querySelector(`[data-formation-personality-row="0"][data-formation-personality-line="1"] img`)?.getAttribute("src") || ""'), /性格_憂鬱/);
    await browser.clickSelector(cdp, page, '.bottom-apostle-button');
    await browser.waitForSelector(cdp, page, '#apostle-picker-dialog[open]');
    const listClassificationIcon = await browser.evaluate(cdp, page,
      'document.querySelector("#apostle-picker-grid [data-apostle-picker-id=Joanne] .apostle-info-badge.personality")?.getAttribute("src") || ""');
    assert.match(listClassificationIcon, /性格_裏面/);
    await browser.clickSelector(cdp, page, '#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
    if (await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme') !== 'dark') {
      await browser.clickSelector(cdp, page, '.dashboard-top-theme-toggle');
    }
    const bottomStyle = () => browser.evaluate(cdp, page, `(() => {
      const bar=document.querySelector('.bottom-apostle-button'),style=getComputedStyle(bar);
      return {image:style.backgroundImage,base:style.backgroundColor,nameBackground:getComputedStyle(bar.querySelector('span')).backgroundColor};
    })()`);
    const joanneDark = await bottomStyle();
    let shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.mkdirSync(path.join(root, 'tmp'), { recursive: true });
    fs.writeFileSync(path.join(root, 'tmp', 'two-tone-followup-joanne-dark.png'), Buffer.from(shot.data, 'base64'));
    await browser.clickSelector(cdp, page, '.bottom-apostle-button');
    await browser.waitForSelector(cdp, page, '#apostle-picker-dialog[open]');
    const currentClassificationIcon = await browser.evaluate(cdp, page,
      'document.querySelector(".apostle-current-badges .apostle-info-badge.personality")?.getAttribute("src") || ""');
    assert.match(currentClassificationIcon, /性格_裏面/);
    const listStyle = () => browser.evaluate(cdp, page, `(() => {
      const art=document.querySelector('#apostle-picker-grid [data-apostle-picker-id="Joanne"] .apostle-picker-art');
      const style=getComputedStyle(art);
      return {base:style.getPropertyValue('--personality-gradient-base').trim(),image:style.backgroundImage};
    })()`);
    const listDark = await listStyle();
    await browser.evaluate(cdp, page, 'document.querySelector("#apostle-picker-grid [data-apostle-picker-id=Joanne]")?.scrollIntoView({block:"center",behavior:"instant"})');
    shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'two-tone-followup-list-dark.png'), Buffer.from(shot.data, 'base64'));
    await browser.clickSelector(cdp, page, '#apostle-picker-grid [data-apostle-picker-id="Elena"]');
    const elenaDark = await bottomStyle();
    shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'two-tone-followup-elena-dark.png'), Buffer.from(shot.data, 'base64'));
    await browser.clickSelector(cdp, page, '.bottom-apostle-button');
    await browser.waitForSelector(cdp, page, '#apostle-picker-dialog[open]');
    await browser.clickSelector(cdp, page, '#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
    await browser.clickSelector(cdp, page, '.dashboard-top-theme-toggle');
    const joanneLight = await bottomStyle();
    shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'two-tone-followup-joanne-light.png'), Buffer.from(shot.data, 'base64'));
    await browser.clickSelector(cdp, page, '.bottom-apostle-button');
    await browser.waitForSelector(cdp, page, '#apostle-picker-dialog[open]');
    const listLight = await listStyle();
    shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'two-tone-followup-list-light.png'), Buffer.from(shot.data, 'base64'));
    assert.equal(listDark.base, 'white');
    assert.equal(listLight.base, 'white');
    assert.equal(listDark.image, listLight.image);
    assert.notEqual(joanneDark.image, joanneLight.image);
    await browser.clickSelector(cdp, page, '#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 900, deviceScaleFactor: 1, mobile: true }, page.sessionId);
    shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'two-tone-followup-joanne-light-375.png'), Buffer.from(shot.data, 'base64'));
    await browser.clickSelector(cdp, page, '.dashboard-top-theme-toggle');
    shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'two-tone-followup-joanne-dark-375.png'), Buffer.from(shot.data, 'base64'));
    assert.equal((await bottomStyle()).image.split('linear-gradient').length - 1, 2);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, page.sessionId);
    await browser.evaluate(cdp, page, '[...document.querySelectorAll("[data-dashboard-view=settings]")].find(node=>node.getBoundingClientRect().width>0)?.click()');
    await browser.waitFor(async () => browser.evaluate(cdp, page, 'document.querySelector("[data-dashboard-panel=settings]")?.classList.contains("is-active")'));
    const profileClassificationIcon = await browser.evaluate(cdp, page, `(() => {
      const image=document.querySelector('.dashboard-persistent-profile .profile-meta-icons .apostle-info-badge.personality');
      return {src:image?.getAttribute('src')||'',loaded:!!image?.naturalWidth};
    })()`);
    assert.match(profileClassificationIcon.src, /性格_裏面/);
    assert.equal(profileClassificationIcon.loaded, true);
    const portrait = await browser.evaluate(cdp, page, `(() => {
      const image=document.querySelector('.dashboard-persistent-profile .portrait-frame.dashboard-portrait');
      image.scrollIntoView({block:'center',behavior:'instant'});
      const style=getComputedStyle(image), rect=image.getBoundingClientRect();
      return {layers:style.backgroundImage.split('linear-gradient').length-1,clip:style.backgroundClip,visible:style.visibility,display:style.display,rect:{x:rect.x,y:rect.y,w:rect.width,h:rect.height},topElement:document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2)?.id||''};
    })()`);
    assert.equal(portrait.layers, 2);
    assert.equal(portrait.clip, 'padding-box, border-box');
    const portraitShot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.mkdirSync(path.join(root, 'tmp'), { recursive: true });
    fs.writeFileSync(path.join(root, 'tmp', 'manager-joanne-two-tone-profile-visible-1280.png'), Buffer.from(portraitShot.data, 'base64'));
    const profileDark = await browser.evaluate(cdp, page,
      'getComputedStyle(document.querySelector(".dashboard-persistent-profile .portrait-frame.dashboard-portrait")).backgroundImage');
    await browser.clickSelector(cdp, page, '.dashboard-top-theme-toggle');
    const profileLight = await browser.evaluate(cdp, page,
      'getComputedStyle(document.querySelector(".dashboard-persistent-profile .portrait-frame.dashboard-portrait")).backgroundImage');
    assert.notEqual(profileDark, profileLight);
    const profileLightShot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'two-tone-followup-profile-light.png'), Buffer.from(profileLightShot.data, 'base64'));
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
      const key='trickcal_stat_workspace_v2', raw=sessionStorage.getItem(key); if(!raw) return;
      const workspace=JSON.parse(raw), rows=workspace.draft?.formation?.rows||[];
      for(const row of rows) for(let i=0;i<(row.apostles||[]).length;i++) if(row.apostles[i]==='Joanne') row.resonancePersonalities[i]='冷静';
      sessionStorage.setItem(key,JSON.stringify(workspace));
    })();` }, page.sessionId);
    await cdp.send('Page.navigate', { url: `${origin}/stat-dashboard.html?view=formation&twoToneTargeted=legacy` }, page.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      "document.documentElement.dataset.storageBoot === 'ready' && window.TRICKCAL_STAT_ENGINE?.getState().formation.rows[0].resonancePersonalities[1] === '冷静'"), { timeoutMs: 30000 });
    const legacy = await browser.evaluate(cdp, page, `(() => {
      const card=document.querySelector('${target}'),row=window.TRICKCAL_STAT_ENGINE.getState().formation.rows[0];
      const style=getComputedStyle(card);
      const action=document.querySelector('[data-formation-personality-row="0"][data-formation-personality-line="1"]');
      return {raw:row.resonancePersonalities[1],invalid:card.classList.contains('is-resonance-unselected'),twoTone:card.classList.contains('is-two-tone'),layers:style.backgroundImage.split('linear-gradient').length-1,warning:action?.getAttribute('title')||'',marker:action?.textContent||''};
    })()`);
    assert.equal(legacy.raw, '冷静');
    assert.equal(legacy.invalid && legacy.twoTone && legacy.layers === 2, true);
    assert.match(legacy.warning, /旧選択：冷静／現在の候補外/);
    assert.equal(legacy.marker, '!');
    calcPage = await browser.createPage(cdp, `${origin}/formation-damage-calc.html?twoToneTargeted=1`);
    await cdp.send('Page.enable', {}, calcPage.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, calcPage,
      '!!window.TRICKCAL_DAMAGE_CALC && !!document.querySelector("#fdc-target-preview")'), { timeoutMs: 30000 });
    await browser.clickSelector(cdp, calcPage, '#fdc-target-preview');
    await browser.waitForSelector(cdp, calcPage, '#fdc-formation-picker:not([hidden])');
    await browser.clickSelector(cdp, calcPage, '[data-fdc-picker-mode="all"]');
    await browser.evaluate(cdp, calcPage, '(() => {const input=document.querySelector("[data-fdc-picker-search]");input.value="Joanne";input.dispatchEvent(new Event("input",{bubbles:true}));})()');
    await browser.waitForSelector(cdp, calcPage, '[data-fdc-member-id="Joanne"]');
    const calcListClassificationIcon = await browser.evaluate(cdp, calcPage,
      'document.querySelector("[data-fdc-member-id=Joanne]")?.closest(".fdc-picker-member-choice")?.querySelector(".fdc-resonance-personality-trigger img")?.getAttribute("src") || ""');
    assert.match(calcListClassificationIcon, /性格_裏面/);
    const calcListIconShot = await cdp.send('Page.captureScreenshot', { format: 'png' }, calcPage.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'joanne-classification-calc-list.png'), Buffer.from(calcListIconShot.data, 'base64'));
    const calcListStyle = () => browser.evaluate(cdp, calcPage, `(() => {
      const card=document.querySelector('[data-fdc-member-id="Joanne"]'),style=getComputedStyle(card);
      return {base:style.getPropertyValue('--personality-gradient-base').trim(),image:style.backgroundImage};
    })()`);
    if (!await browser.evaluate(cdp, calcPage, 'document.body.classList.contains("theme-dark")')) {
      await browser.evaluate(cdp, calcPage, 'document.querySelector("#fdc-theme-toggle")?.click()');
    }
    const calcListDark = await calcListStyle();
    await browser.evaluate(cdp, calcPage, 'document.querySelector("#fdc-theme-toggle")?.click()');
    const calcListLight = await calcListStyle();
    assert.equal(calcListDark.base, 'white');
    assert.equal(calcListLight.base, 'white');
    assert.equal(calcListDark.image, calcListLight.image);
    console.log(JSON.stringify({ focus, drag, placementClassificationIcon, listClassificationIcon, currentClassificationIcon, profileClassificationIcon, calcListClassificationIcon, portrait, legacy, joanneDark, elenaDark, joanneLight, listDark, listLight, calcListDark, calcListLight }));
  } finally {
    if (calcPage && cdp) try { await cdp.send('Target.closeTarget', { targetId: calcPage.targetId }); } catch (_) {}
    if (page && cdp) try { await cdp.send('Target.closeTarget', { targetId: page.targetId }); } catch (_) {}
    if (cdp) { try { await cdp.send('Browser.close'); } catch (_) {} cdp.close(); }
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    await new Promise(resolve => server.close(resolve));
    await browser.sleep(200);
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch (_) {}
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
