#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');
const codec = require('../formation-share-codec.js');
const catalog = require('../formation-share-catalog.js');

const root = path.resolve(__dirname, '..');
function servedSource(relative) {
  let source = fs.readFileSync(path.join(root, relative));
  if (relative === 'statData.js') {
    const original = source.toString('utf8');
    const changed = original.replace(/("id":"Joanne"[^}]*?"性格":)"共鳴"/, '$1"裏面","personalityOptions":["憂鬱","純粋"]');
    if (changed === original) {
      const row = original.match(/"id":"Joanne"[^}]*}/)?.[0] || '';
      assert.ok(row.includes('"性格":"裏面"') && row.includes('"personalityOptions":["憂鬱","純粋"]'), 'Joanne generated basicInfo');
    }
    source = Buffer.from(changed);
  } else if (relative === 'apostles.js') {
    const original = source.toString('utf8');
    const changed = original.replace(/("id": "joanne",[\s\S]*?"personality": )"共鳴"/, '$1"裏面",\n      "personalityOptions": ["憂鬱", "純粋"]');
    if (changed === original) {
      const row = original.match(/"id": "joanne",[\s\S]*?"statTypes"/)?.[0] || '';
      assert.ok(row.includes('"personality": "裏面"') && /"personalityOptions": \[\s*"憂鬱",\s*"純粋"\s*\]/.test(row), 'Joanne generated apostle');
    }
    source = Buffer.from(changed);
  }
  return source;
}

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
    const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png' };
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(servedSource(relative));
  }).listen(serverPort, '127.0.0.1');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-joanne-options-'));
  let chrome, cdp, page, calcPage, sharePage;
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
    page = await browser.createPage(cdp, `${origin}/stat-dashboard.html?view=formation&joanneOptionsFixture=1`);
    await cdp.send('Page.enable', {}, page.sessionId);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, page.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      "document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_STAT_ENGINE && document.querySelector('[data-dashboard-panel=formation]')?.classList.contains('is-active')"), { timeoutMs: 30000 });
    await browser.evaluate(cdp, page, 'document.querySelector("#trickcal-announcements-dialog")?.close()');
    assert.deepEqual(await browser.evaluate(cdp, page,
      'window.TRICKCAL_FORMATION_PERSONALITY.getPersonalityOptions(window.TRICKCAL_STAT_DATA.getById("basicInfo","Joanne"))'),
      ['憂鬱', '純粋']);
    const slot = '[data-formation-apostle-row="0"][data-formation-line="0"]';
    await browser.clickSelector(cdp, page, slot);
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="Joanne"]');
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    const options = await browser.evaluate(cdp, page,
      '[...document.querySelectorAll("#formation-picker-grid [data-formation-picker-value]")].map(node=>node.dataset.formationPickerValue)');
    assert.deepEqual(options, ['憂鬱', '純粋']);
    assert.equal(await browser.evaluate(cdp, page,
      'window.TRICKCAL_STAT_ENGINE.getState().formation.rows[0].apostles[0] || ""'), '');
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, page.sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, page.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, page, '!document.querySelector("#formation-picker-dialog").open'));
    assert.equal(await browser.evaluate(cdp, page,
      'window.TRICKCAL_STAT_ENGINE.getState().formation.rows[0].apostles[0] || ""'), '');
    await browser.clickSelector(cdp, page, slot);
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="Joanne"]');
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="純粋"]');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      'window.TRICKCAL_STAT_ENGINE.getState().formation.rows[0].resonancePersonalities[0] === "純粋"'));
    for (const [theme, width] of [['light', 1280], ['dark', 1280], ['light', 375], ['dark', 375]]) {
      const current = await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme');
      if (current !== theme) await browser.clickSelector(cdp, page, '.dashboard-top-theme-toggle');
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 }, page.sessionId);
      await browser.waitFor(async () => browser.evaluate(cdp, page, `innerWidth === ${width} && document.documentElement.dataset.theme === '${theme}'`));
      const facts = await browser.evaluate(cdp, page, `(() => { const slot=document.querySelector('${slot}'); const icon=slot?.closest('.formation-apostle-card-wrap')?.querySelector('[data-formation-personality-row] img'); return {className:slot?.className,icon:icon?.getAttribute('src')||'',background:getComputedStyle(slot).backgroundImage}; })()`);
      assert.match(facts.icon, /純粋/);
      assert.match(facts.background, /gradient/);
      await browser.evaluate(cdp, page, `document.querySelector('${slot}')?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' })`);
      const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
      fs.mkdirSync(path.join(root, 'tmp'), { recursive: true });
      fs.writeFileSync(path.join(root, 'tmp', `manager-joanne-options-${theme}-${width}.png`), Buffer.from(screenshot.data, 'base64'));
    }
    calcPage = await browser.createPage(cdp, `${origin}/formation-damage-calc.html?joanneOptionsFixture=1`);
    await cdp.send('Page.enable', {}, calcPage.sessionId);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, calcPage.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, calcPage,
      '!!window.TRICKCAL_DAMAGE_CALC && !!document.querySelector("#fdc-target-preview")'), { timeoutMs: 30000 });
    await browser.clickSelector(cdp, calcPage, '#fdc-target-preview');
    await browser.waitForSelector(cdp, calcPage, '#fdc-formation-picker:not([hidden])');
    await browser.clickSelector(cdp, calcPage, '[data-fdc-picker-mode="all"]');
    await browser.waitForSelector(cdp, calcPage, '[data-fdc-picker-search]');
    await browser.evaluate(cdp, calcPage, '(() => { const input=document.querySelector("[data-fdc-picker-search]"); input.value="Joanne"; input.dispatchEvent(new Event("input",{bubbles:true})); })()');
    await browser.waitForSelector(cdp, calcPage, '[data-fdc-member-id="Joanne"]');
    await browser.clickSelector(cdp, calcPage, '[data-fdc-member-id="Joanne"]');
    await browser.waitForSelector(cdp, calcPage, '[data-fdc-temp-member-slot]');
    await browser.clickSelector(cdp, calcPage, '[data-fdc-temp-member-slot]:not([disabled])');
    await browser.waitForSelector(cdp, calcPage, '.fdc-target-resonance-trigger[data-fdc-resonance-personality-id="Joanne"]');
    assert.match(await browser.evaluate(cdp, calcPage,
      'document.querySelector(".fdc-target-resonance-trigger")?.innerHTML || ""'), /純粋/);
    await browser.clickSelector(cdp, calcPage, '.fdc-target-resonance-trigger[data-fdc-resonance-personality-id="Joanne"]');
    await browser.waitForSelector(cdp, calcPage, '#fdc-resonance-personality-dialog[open]');
    const calcOptions = await browser.evaluate(cdp, calcPage,
      '[...document.querySelectorAll("#fdc-resonance-personality-dialog [data-fdc-resonance-personality-option]")].map(node=>node.dataset.fdcResonancePersonalityOption)');
    assert.deepEqual(calcOptions, ['憂鬱', '純粋']);
    await browser.clickSelector(cdp, calcPage, '#fdc-resonance-personality-dialog [data-fdc-resonance-personality-option="憂鬱"]');
    await browser.waitFor(async () => browser.evaluate(cdp, calcPage,
      '!document.querySelector("#fdc-resonance-personality-dialog").open'));
    assert.match(await browser.evaluate(cdp, calcPage,
      'document.querySelector(".fdc-target-resonance-trigger")?.innerHTML || ""'), /憂鬱/);
    for (const [theme, width] of [['light', 1280], ['dark', 1280], ['light', 375], ['dark', 375]]) {
      const current = await browser.evaluate(cdp, calcPage, 'document.documentElement.dataset.theme');
      if (current !== theme) await browser.clickSelector(cdp, calcPage, '#fdc-theme-toggle');
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 }, calcPage.sessionId);
      await browser.waitFor(async () => browser.evaluate(cdp, calcPage, `innerWidth === ${width} && document.documentElement.dataset.theme === '${theme}'`));
      await browser.evaluate(cdp, calcPage, 'document.querySelector(".fdc-target-resonance-trigger")?.scrollIntoView({block:"center",behavior:"instant"})');
      const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png' }, calcPage.sessionId);
      fs.writeFileSync(path.join(root, 'tmp', `calc-joanne-options-${theme}-${width}.png`), Buffer.from(screenshot.data, 'base64'));
    }
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, calcPage.sessionId);
    await browser.clickSelector(cdp, calcPage, '.fdc-target-resonance-trigger[data-fdc-resonance-personality-id="Joanne"]');
    await browser.waitForSelector(cdp, calcPage, '#fdc-resonance-personality-dialog[open]');
    await browser.clickSelector(cdp, calcPage, '#fdc-resonance-personality-dialog [data-fdc-resonance-personality-clear]');
    const calcUnselectedTone = await browser.evaluate(cdp, calcPage, `(() => {
      const target=document.querySelector('#fdc-target-preview'),floating=document.querySelector('#fdc-floating-target'),style=getComputedStyle(target);
      return {twoTone:target.classList.contains('is-two-tone'),unselected:target.classList.contains('is-resonance-unselected'),layers:style.backgroundImage.split('linear-gradient').length-1,frame:style.getPropertyValue('--personality-options-frame').trim(),floatingTwoTone:floating?.classList.contains('is-two-tone')};
    })()`);
    assert.equal(calcUnselectedTone.twoTone && calcUnselectedTone.unselected && calcUnselectedTone.floatingTwoTone, true);
    assert.equal(calcUnselectedTone.layers, 2);
    await browser.clickSelector(cdp, calcPage, '#fdc-target-preview');
    await browser.waitForSelector(cdp, calcPage, '#fdc-formation-picker:not([hidden])');
    await browser.clickSelector(cdp, calcPage, '[data-fdc-picker-mode="all"]');
    assert.equal(await browser.evaluate(cdp, calcPage,
      'document.querySelector("[data-fdc-member-id=Joanne]")?.classList.contains("is-two-tone")'), true);
    await browser.clickSelector(cdp, calcPage, '[data-fdc-picker-close]');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, page.sessionId);
    await browser.clickSelector(cdp, page, '[data-formation-personality-row="0"][data-formation-personality-line="0"]');
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value=""]');
    const unselectedTone = await browser.evaluate(cdp, page, `(() => {
      const card=document.querySelector('${slot}'), style=getComputedStyle(card);
      return {twoTone:card.classList.contains('is-two-tone'),unselected:card.classList.contains('is-resonance-unselected'),layers:style.backgroundImage.split('linear-gradient').length-1,clip:style.backgroundClip,border:style.borderTopColor};
    })()`);
    assert.equal(unselectedTone.twoTone && unselectedTone.unselected, true);
    assert.equal(unselectedTone.layers, 2);
    assert.equal(unselectedTone.clip, 'padding-box, border-box');
    await browser.evaluate(cdp, page, `document.querySelector('${slot}')?.scrollIntoView({block:'center',behavior:'instant'})`);
    const unselectedShot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'manager-joanne-two-tone-unselected-1280.png'), Buffer.from(unselectedShot.data, 'base64'));
    await browser.clickSelector(cdp, page, '[data-formation-personality-row="0"][data-formation-personality-line="0"]');
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="憂鬱"]');
    const selectedTone = await browser.evaluate(cdp, page, `(() => {
      const card=document.querySelector('${slot}'), style=getComputedStyle(card);
      return {twoTone:card.classList.contains('is-two-tone'),unselected:card.classList.contains('is-resonance-unselected'),layers:style.backgroundImage.split('linear-gradient').length-1,border:style.borderTopColor,icon:card.closest('.formation-apostle-card-wrap')?.querySelector('[data-formation-personality-row] img')?.getAttribute('src')};
    })()`);
    assert.equal(selectedTone.twoTone && !selectedTone.unselected, true);
    assert.equal(selectedTone.layers, 1);
    assert.match(selectedTone.icon, /憂鬱/);
    await browser.clickSelector(cdp, page, '[data-formation-personality-row="0"][data-formation-personality-line="0"]');
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value=""]');
    assert.equal(await browser.evaluate(cdp, page, `getComputedStyle(document.querySelector('${slot}')).backgroundImage.split('linear-gradient').length-1`), 2);
    await browser.clickSelector(cdp, page, '.bottom-apostle-button');
    await browser.waitForSelector(cdp, page, '#apostle-picker-dialog[open]');
    const masterTone = await browser.evaluate(cdp, page, `(() => {
      const card=document.querySelector('#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
      const art=card?.querySelector('.apostle-picker-art');
      return {twoTone:card?.classList.contains('is-two-tone'),artLayers:art?getComputedStyle(art).backgroundImage.split('linear-gradient').length-1:0,name:getComputedStyle(card?.querySelector('strong')).color};
    })()`);
    assert.equal(masterTone.twoTone, true);
    assert.equal(masterTone.artLayers, 2);
    await browser.clickSelector(cdp, page, '#apostle-picker-grid [data-apostle-picker-id="Joanne"]');
    await browser.waitFor(async () => browser.evaluate(cdp, page, 'document.querySelector(".bottom-apostle-button")?.classList.contains("is-two-tone")'));
    const bottomTone = await browser.evaluate(cdp, page, `(() => {
      const bar=document.querySelector('.bottom-apostle-button'),profile=document.querySelector('.dashboard-persistent-profile');
      const style=getComputedStyle(bar); return {layers:style.backgroundImage.split('linear-gradient').length-1,clip:style.backgroundClip,frame:style.getPropertyValue('--personality-options-frame').trim(),profile:profile?.classList.contains('is-two-tone'),nameBackground:getComputedStyle(bar.querySelector('span')).backgroundColor,rect:(()=>{const r=bar.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()};
    })()`);
    assert.equal(bottomTone.layers, 2);
    assert.equal(bottomTone.clip, 'padding-box, border-box');
    assert.equal(bottomTone.profile, true);
    const masterShot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'manager-joanne-two-tone-master-1280.png'), Buffer.from(masterShot.data, 'base64'));
    for (const theme of ['light', 'dark']) {
      const current = await browser.evaluate(cdp, page, 'document.documentElement.dataset.theme');
      if (current !== theme) await browser.clickSelector(cdp, page, '.dashboard-top-theme-toggle');
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 900, deviceScaleFactor: 1, mobile: true }, page.sessionId);
      await browser.waitFor(async () => browser.evaluate(cdp, page, `innerWidth === 375 && document.documentElement.dataset.theme === '${theme}'`));
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
      fs.writeFileSync(path.join(root, 'tmp', `manager-joanne-two-tone-master-${theme}-375.png`), Buffer.from(shot.data, 'base64'));
    }
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, page.sessionId);
    await browser.clickSelector(cdp, page, '[data-dashboard-view="settings"]');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      'document.querySelector("[data-dashboard-panel=settings]")?.classList.contains("is-active")'));
    await browser.evaluate(cdp, page, 'document.querySelector(".dashboard-persistent-profile")?.scrollIntoView({block:"start",behavior:"instant"})');
    const profileShot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'manager-joanne-two-tone-profile-1280.png'), Buffer.from(profileShot.data, 'base64'));
    await browser.clickSelector(cdp, page, '[data-dashboard-view="formation"]');
    await browser.clickSelector(cdp, page, '.bottom-apostle-button');
    await browser.waitForSelector(cdp, page, '#apostle-picker-dialog[open]');
    await browser.clickSelector(cdp, page, '#apostle-picker-grid [data-apostle-picker-id="Amelia"]');
    await browser.waitFor(async () => browser.evaluate(cdp, page, '!document.querySelector(".bottom-apostle-button")?.classList.contains("is-two-tone")'));
    const ordinaryFacts = await browser.evaluate(cdp, page, `(() => {
      const bar=document.querySelector('.bottom-apostle-button'),profile=document.querySelector('.dashboard-persistent-profile');
      return {master:window.TRICKCAL_STAT_ENGINE.getActiveApostleId(),barTwoTone:bar.classList.contains('is-two-tone'),barFrame:bar.style.getPropertyValue('--personality-options-frame'),profileTwoTone:profile.classList.contains('is-two-tone'),profileFrame:profile.style.getPropertyValue('--personality-options-frame')};
    })()`);
    assert.deepEqual(ordinaryFacts, { master: 'Amelia', barTwoTone: false, barFrame: '', profileTwoTone: false, profileFrame: '' });
    await browser.clickSelector(cdp, page, '[data-topbar-menu-trigger="bulk"]');
    await browser.waitForSelector(cdp, page, '[data-topbar-menu="bulk"][open]');
    await browser.clickSelector(cdp, page, '[data-topbar-bulk-target="apostles"]');
    await browser.waitForSelector(cdp, page, '#apostle-bulk-list [data-apostle-bulk-row="Joanne"]');
    const bulkFacts = await browser.evaluate(cdp, page, `(() => {
      const row=document.querySelector('#apostle-bulk-list [data-apostle-bulk-row="Joanne"]');
      const avatar=row?.querySelector('.apostle-bulk-avatar');
      return {twoTone:row?.classList.contains('is-two-tone'),layers:avatar?getComputedStyle(avatar).backgroundImage.split('linear-gradient').length-1:0,identityBackground:getComputedStyle(row.querySelector('.apostle-bulk-identity')).backgroundImage};
    })()`);
    assert.equal(bulkFacts.twoTone && bulkFacts.layers === 2 && bulkFacts.identityBackground === 'none', true);
    await browser.evaluate(cdp, page, 'document.querySelector("#apostle-bulk-list [data-apostle-bulk-row=Joanne]")?.scrollIntoView({block:"center",behavior:"instant"})');
    const bulkShot = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
    fs.writeFileSync(path.join(root, 'tmp', 'manager-joanne-two-tone-bulk-1280.png'), Buffer.from(bulkShot.data, 'base64'));
    const oldSnapshot = {
      v: 2, m: 1,
      members: [{ id: 'Joanne', star: 3, asideRank: 0 }, ...Array(8).fill(null)],
      resonancePersonalities: ['冷静', ...Array(8).fill(null)],
      relicSlots: Array(27).fill(null), spells: [], powers: [], globalPercent: null
    };
    const old = codec.encode(oldSnapshot, { catalog, displayData: { apostles: { Joanne: { personality: '共鳴' } } } });
    sharePage = await browser.createPage(cdp, `${origin}/formation-share.html#${old.format}.${old.payload}`);
    await cdp.send('Page.enable', {}, sharePage.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, sharePage,
      'document.querySelector("#share-content")?.textContent.includes("旧選択：冷静／現在の候補外")'), { timeoutMs: 30000 });
    const oldShareFacts = await browser.evaluate(cdp, sharePage, `(() => ({warning:document.querySelector('#share-content')?.textContent.includes('旧選択：冷静／現在の候補外'),invalidIcon:!!document.querySelector('#share-content img[src*="性格_冷静"]'),baseIcon:!!document.querySelector('#share-content img[src*="性格_裏面"]')}))()`);
    assert.deepEqual(oldShareFacts, { warning: true, invalidIcon: false, baseIcon: false });
    await browser.evaluate(cdp, sharePage, `(() => { const create=URL.createObjectURL; URL.createObjectURL=function(blob) { if(blob.type==='image/png') window.__shareImageBlob=blob; return create.call(this,blob); }; })()`);
    await browser.clickSelector(cdp, sharePage, '#share-image-generate');
    await browser.waitFor(async () => browser.evaluate(cdp, sharePage,
      'document.querySelector("#share-image-state")?.textContent.includes("共有画像を作成しました")'), { timeoutMs: 30000 });
    assert.equal(await browser.evaluate(cdp, sharePage, '!document.querySelector("#share-image-save")?.disabled'), true);
    const imageBase64 = await browser.evaluate(cdp, sharePage, `(async () => {
      const bytes=new Uint8Array(await window.__shareImageBlob.arrayBuffer());
      let raw=''; for(let i=0;i<bytes.length;i+=8192) raw+=String.fromCharCode(...bytes.subarray(i,i+8192));
      return btoa(raw);
    })()`);
    fs.writeFileSync(path.join(root, 'tmp', 'share-joanne-old-selection.png'), Buffer.from(imageBase64, 'base64'));
    console.log(JSON.stringify({ options, selected: '純粋', calcOptions, calcChangedTo: '憂鬱', calcUnselectedTone, unselectedTone, selectedTone, masterTone, bottomTone, ordinaryFacts, bulkFacts, oldShareWarning: oldShareFacts.warning, oldShareImage: true, screenshots: 14 }));
  } finally {
    if (sharePage && cdp) try { await cdp.send('Target.closeTarget', { targetId: sharePage.targetId }); } catch (_) {}
    if (calcPage && cdp) try { await cdp.send('Target.closeTarget', { targetId: calcPage.targetId }); } catch (_) {}
    if (page && cdp) try { await cdp.send('Target.closeTarget', { targetId: page.targetId }); } catch (_) {}
    if (cdp) { try { await cdp.send('Browser.close'); } catch (_) {} cdp.close(); }
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    await new Promise(resolve => server.close(resolve));
    await browser.sleep(200);
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch (_) {}
  }
}
if (require.main === module) run().catch(error => { process.stderr.write(`${error.stack || error}\n`); process.exitCode = 1; });
module.exports = { run };
