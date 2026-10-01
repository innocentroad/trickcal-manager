#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'tmp', 'research-item-slot-backgrounds-20260930');
const key = 'trickcal_research_inventory_v1';

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
    response.setHeader('Content-Type', { '.js':'application/javascript', '.css':'text/css', '.html':'text/html' }[path.extname(file)] || 'application/octet-stream');
    response.end(fs.readFileSync(file));
  }).listen(port, '127.0.0.1');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-research-tabs-'));
  let chrome, cdp;
  const evalPage = (page, script) => browser.evaluate(cdp, page, script);
  const setTheme = async (page, theme) => {
    if (await evalPage(page, "document.documentElement.dataset.theme") === theme) return;
    await browser.clickSelector(cdp, page, '[data-shared-theme-button]');
    await browser.waitFor(async () => evalPage(page, "document.documentElement.dataset.theme") === theme);
  };
  const capture = async (page, name) => {
    const { data } = await cdp.send('Page.captureScreenshot', { format:'png', captureBeyondViewport:false }, page.sessionId);
    fs.writeFileSync(path.join(output, name), Buffer.from(data, 'base64'));
  };
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
    }, { timeoutMs:30000 });
    cdp = new browser.CdpClient(version.webSocketDebuggerUrl);
    await cdp.connect();
    fs.mkdirSync(output, { recursive:true });
    for (const width of [1280, 375]) {
      const page = await browser.createPage(cdp, `${origin}/stat-dashboard.html?global=research&researchNative=tabs`);
      await cdp.send('Page.enable', {}, page.sessionId);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height:900, deviceScaleFactor:1, mobile:width<500 }, page.sessionId);
      await browser.waitFor(async () => evalPage(page, "document.documentElement.dataset.storageBoot==='ready'&&document.querySelector('#research-level-select')?.options.length===13"), { timeoutMs:30000 });
      await evalPage(page, "document.querySelector('#trickcal-announcements-dialog')?.close()");
      await evalPage(page, `(() => {
        const level=document.querySelector('#research-level-select');level.value='12';level.dispatchEvent(new Event('change',{bubbles:true}));
      })()`);
      await browser.waitFor(async () => evalPage(page, "document.querySelector('#research-progress-select')?.options.length===48"));
      await evalPage(page, `(() => {const progress=document.querySelector('#research-progress-select');progress.value='47';progress.dispatchEvent(new Event('change',{bubbles:true}));})()`);
      await cdp.send('Page.reload', { ignoreCache:true }, page.sessionId);
      await browser.waitFor(async () => evalPage(page, "document.documentElement.dataset.storageBoot==='ready'&&document.querySelector('#research-progress-select')?.value==='47'"), { timeoutMs:30000 });
      await evalPage(page, "document.querySelector('#trickcal-announcements-dialog')?.close()");
      await browser.waitFor(async () => evalPage(page, "document.querySelector('#research-browse-stage')?.value==='12'"));
      await evalPage(page, `(() => {const browse=document.querySelector('#research-browse-stage');browse.value='5';browse.dispatchEvent(new Event('change',{bubbles:true}));
        const progress=document.querySelector('#research-progress-select');progress.value='46';progress.dispatchEvent(new Event('change',{bubbles:true}));})()`);
      assert.deepEqual(await evalPage(page, `(() => ({browse:document.querySelector('#research-browse-stage').value,
        level:document.querySelector('#research-level-select').value,progress:document.querySelector('#research-progress-select').value}))()`),
      { browse:'5', level:'12', progress:'46' });
      await evalPage(page, `(() => {
        const level=document.querySelector('#research-level-select');level.value='8';level.dispatchEvent(new Event('change',{bubbles:true}));
        const progress=document.querySelector('#research-progress-select');progress.value='10';progress.dispatchEvent(new Event('change',{bubbles:true}));
        document.querySelector('#save-state-slot').click();document.querySelector('[data-state-slot="2"]').click();
      })()`);
      await browser.waitFor(async () => evalPage(page, "document.querySelector('#state-status').textContent.includes('保存しました')"), { timeoutMs:30000 });
      await evalPage(page, `(() => {
        const level=document.querySelector('#research-level-select');level.value='12';level.dispatchEvent(new Event('change',{bubbles:true}));
        const progress=document.querySelector('#research-progress-select');progress.value='47';progress.dispatchEvent(new Event('change',{bubbles:true}));
        const browse=document.querySelector('#research-browse-stage');browse.value='6';browse.dispatchEvent(new Event('change',{bubbles:true}));
      })()`);
      const canceledLoad = await evalPage(page, `(() => {
        const current = () => ({ browse:document.querySelector('#research-browse-stage').value,
          level:document.querySelector('#research-level-select').value,
          progress:document.querySelector('#research-progress-select').value });
        const before = current();
        const savedBefore = ['trickcal_stat_slots_v2','trickcal_stat_prototype_v1']
          .map(key => [key, localStorage.getItem(key)]);
        let confirmations = 0;
        window.confirm = () => { confirmations += 1; return false; };
        document.querySelector('#load-state-slot').click();
        document.querySelector('[data-state-slot="2"]').click();
        return { before, after:current(), savedBefore,
          savedAfter:['trickcal_stat_slots_v2','trickcal_stat_prototype_v1']
            .map(key => [key, localStorage.getItem(key)]), confirmations };
      })()`);
      assert.deepEqual(canceledLoad.after, canceledLoad.before, 'cancelled slot load keeps the displayed research state');
      assert.deepEqual(canceledLoad.savedAfter, canceledLoad.savedBefore, 'cancelled slot load leaves persisted state untouched');
      assert.equal(canceledLoad.confirmations, 1, 'dirty slot load presents one confirmation');
      await evalPage(page, `(() => {
        window.confirm=()=>true;document.querySelector('#load-state-slot').click();document.querySelector('[data-state-slot="2"]').click();
      })()`);
      await browser.waitFor(async () => evalPage(page, "document.querySelector('#state-status').textContent.includes('読み込みました')"), { timeoutMs:30000 });
      assert.deepEqual(await evalPage(page, `(() => ({browse:document.querySelector('#research-browse-stage').value,
        level:document.querySelector('#research-level-select').value,progress:document.querySelector('#research-progress-select').value}))()`),
      { browse:'8', level:'8', progress:'10' });
      await setTheme(page, 'dark');
      const initial = await evalPage(page, `(() => ({
        tabs:[...document.querySelectorAll('[data-research-plan-tab]')].map(x=>x.textContent),
        single:!!document.querySelector('#research-single-controls'),
        crafted:document.querySelector('#research-plan-summary').textContent.includes('中間・完成素材の製作必要数'),
        state:document.querySelector('.research-acquired-mark')?.getAttribute('aria-label'),
        stateBesideOrder:!!document.querySelector('.research-order-cell .research-acquired-mark'),
        columns:document.querySelectorAll('.research-detail-table thead th').length,
        interactive:document.querySelectorAll('.research-order-cell input,.research-order-cell button').length,
        activeTabBackground:getComputedStyle(document.querySelector('[data-research-plan-tab=remaining]')).backgroundColor
      }))()`);
      assert.deepEqual(initial.tabs, ['残り研究','所持素材']);
      assert.equal(initial.single, false); assert.equal(initial.crafted, false);
      assert.equal(initial.interactive, 0); assert.match(initial.state, /取得済み|未取得/);
      assert.equal(initial.stateBesideOrder, true); assert.equal(initial.columns, 5);
      assert.notEqual(initial.activeTabBackground, 'rgba(0, 0, 0, 0)');
      await evalPage(page, `(() => {
        const s=document.querySelector('#research-level-select');s.value='10';s.dispatchEvent(new Event('change',{bubbles:true}));
        const p=document.querySelector('#research-progress-select');p.value='45';p.dispatchEvent(new Event('change',{bubbles:true}));
        document.querySelector('#research-plan-summary').scrollIntoView({block:'center',behavior:'instant'});
      })()`);
      assert.match(await evalPage(page, "document.querySelector('#research-plan-summary').textContent"), /製作に必要な原材料/);
      const alignment = await evalPage(page, `(() => {
        const stage=document.querySelector('#research-plan-end-stage').getBoundingClientRect();
        const mode=document.querySelector('#research-plan-mode').getBoundingClientRect();
        return {sameTop:Math.abs(stage.top-mode.top)<2,sameBottom:Math.abs(stage.bottom-mode.bottom)<2,
          current:document.querySelector('#research-plan-current').textContent,
          label:document.querySelector('#research-plan-mode').closest('label').textContent,
          overflow:document.documentElement.scrollWidth>innerWidth};
      })()`);
      assert.equal(alignment.sameTop, true); assert.equal(alignment.sameBottom, true);
      assert.equal(alignment.overflow, false); assert.ok(!alignment.current.includes('→'));
      assert.ok(alignment.label.includes('計算方法'));
      await capture(page, `tabs-plan-${width}-dark.png`);
      await setTheme(page, 'light');
      await capture(page, `tabs-plan-${width}-light.png`);
      await setTheme(page, 'dark');
      const reverseMaterial = await evalPage(page, `(() => {
        const links=window.TRICKCAL_STAT_DATA.sheets.lifeJobs.resumeMaterialSlots||[];
        const materials=new Map(window.TRICKCAL_STAT_DATA.sheets.lifeJobs.materials.map(x=>[x.id,x.name]));
        const linkedNames=new Set(links.map(x=>materials.get(x.materialId)));
        const chip=[...document.querySelectorAll('#research-plan-summary [data-research-plan-material]')]
          .find(item=>linkedNames.has(item.dataset.researchPlanMaterial));
        if (!chip) return '';
        chip.click();return chip.dataset.researchPlanMaterial;
      })()`);
      assert.ok(reverseMaterial, 'アルバイト参照がある研究素材から詳細を開ける');
      assert.equal(await evalPage(page, "document.querySelector('#research-material-dialog').open"), true);
      const reverse = await evalPage(page, `(() => ({
        heading:document.querySelector('.research-life-job-sources h5')?.textContent,
        link:document.querySelector('.research-life-job-detail-link')?.getAttribute('href'),
        target:document.querySelector('.research-life-job-detail-link')?.target,
        groups:[...document.querySelectorAll('.research-life-job-apostle-group > strong')].map(x=>x.textContent),
        apostleLink:document.querySelector('.research-life-job-apostle')?.getAttribute('href'),
        verboseJobs:!!document.querySelector('.research-life-job-source')
      }))()`);
      assert.equal(reverse.heading, '入手できる使徒');
      assert.match(reverse.link, /life-jobs.*material=/);
      assert.equal(reverse.target, '_blank');
      assert.ok(reverse.groups.every(label => ['メイン','サブ','その他','区分未確認'].includes(label)));
      assert.ok(!reverse.verboseJobs, '研究モーダルは使徒表示を簡潔に保つ');
      assert.ok(reverse.groups.includes('区分未確認'), '根拠がない素材位置は未確認グループにする');
      assert.match(reverse.apostleLink, /life-jobs.*view=apostle.*apostle=/);
      assert.equal(new URL(reverse.link, 'http://localhost').searchParams.get('material'), reverseMaterial);
      const treeLookup = await evalPage(page, `(() => {
        const selected=document.querySelector('#research-material-dialog-detail [data-research-node]:not(.is-target)');
        if (!selected) return null;
        selected.click();
        const link=document.querySelector('.research-tree-job-sources .research-life-job-sources a');
        return {material:selected.dataset.researchNode,filter:new URL(link.href,location.href).searchParams.get('material')};
      })()`);
      assert.ok(treeLookup, '製作ツリーに別素材ノードがある');
      assert.equal(treeLookup.filter, treeLookup.material, 'ツリーで選択した素材のアルバイト逆引きへ更新される');
      await capture(page, `tabs-tree-${width}-dark.png`);
      await setTheme(page, 'light');
      await capture(page, `tabs-tree-${width}-light.png`);
      await setTheme(page, 'dark');
      await evalPage(page, "document.querySelector('#research-material-dialog-close').click();document.querySelector('[data-research-plan-tab=inventory]').click()");
      await browser.waitFor(async () => evalPage(page, `(() => {
        const image=document.querySelector('[data-research-owned="地球から来た鉛"] .research-material-image');
        return image?.complete && image.naturalWidth>0;
      })()`));
      const inventory = await evalPage(page, `(() => ({
        count:document.querySelectorAll('#research-inventory-list button').length,
        gold:!!document.querySelector('[data-research-owned="ゴールド"]'),
        blank:document.querySelector('[data-research-owned="地球から来た鉛"] .research-plan-count').textContent,
        background:document.querySelector('[data-research-owned="地球から来た鉛"] .research-material-slot-background')?.dataset.researchSlotBackground,
        imageWidth:document.querySelector('[data-research-owned="地球から来た鉛"] .research-material-image')?.naturalWidth,
        planHidden:document.querySelector('#research-plan-summary').hidden,
        progress:document.querySelector('#research-progress-select').value,
        pageWidth:document.documentElement.scrollWidth
      }))()`);
      assert.equal(inventory.count, 27); assert.equal(inventory.gold, false);
      assert.equal(inventory.blank, '—'); assert.equal(inventory.planHidden, true);
      assert.equal(inventory.background, 'ItemSlot_2.png'); assert.ok(inventory.imageWidth>0);
      assert.equal(inventory.progress, '45');
      assert.equal(await evalPage(page, "document.querySelector('#research-inventory-updated').textContent.includes('最終更新')"), false);
      if (width===375) assert.ok(inventory.pageWidth<=width, JSON.stringify(inventory));
      await evalPage(page, "document.querySelector('#research-inventory-list').scrollIntoView({block:'center',behavior:'instant'})");
      await capture(page, `tabs-inventory-${width}-dark.png`);
      await setTheme(page, 'light');
      await capture(page, `tabs-inventory-${width}-light.png`);
      await setTheme(page, 'dark');
      await evalPage(page, "document.querySelector('[data-research-owned=\"地球から来た鉛\"]').click()");
      assert.equal(await evalPage(page, "document.activeElement.id"), 'research-inventory-input');
      assert.equal(await evalPage(page, "document.querySelector('#research-inventory-dialog-title').textContent"), '所持数を変更');
      const dialogIcon = await evalPage(page, `(() => ({
        background:document.querySelector('#research-inventory-dialog-material .research-material-slot-background')?.dataset.researchSlotBackground,
        image:document.querySelector('#research-inventory-dialog-material .research-material-image')?.complete && document.querySelector('#research-inventory-dialog-material .research-material-image')?.naturalWidth>0
      }))()`);
      assert.deepEqual(dialogIcon, { background:'ItemSlot_2.png', image:true });
      await evalPage(page, "(() => { const i=document.querySelector('#research-inventory-input');i.value='3';i.dispatchEvent(new Event('input',{bubbles:true})); })()");
      assert.equal(await evalPage(page, `localStorage.getItem('${key}')`), null);
      await capture(page, `tabs-edit-${width}-dark.png`);
      const invalid = await evalPage(page, `(() => {
        const i=document.querySelector('#research-inventory-input');i.value='1.5';i.dispatchEvent(new Event('input',{bubbles:true}));
        document.querySelector('#research-inventory-dialog-save').click();
        return {open:document.querySelector('#research-inventory-dialog').open,raw:localStorage.getItem('${key}'),invalid:i.getAttribute('aria-invalid')};
      })()`);
      assert.deepEqual(invalid, { open:true, raw:null, invalid:'true' });
      await evalPage(page, `(() => {
        const i=document.querySelector('#research-inventory-input');i.value='3';i.dispatchEvent(new Event('input',{bubbles:true}));
        const prior=Storage.prototype.setItem;
        Storage.prototype.setItem=function(k,v){if(k==='${key}')throw new DOMException('injected','QuotaExceededError');return prior.call(this,k,v)};
        window.__researchOriginalSetItem=prior;
        document.querySelector('#research-inventory-dialog-save').click();
      })()`);
      await browser.waitFor(async () => evalPage(page, "document.querySelector('#research-inventory-dialog-status').textContent.includes('保存できません')"));
      const failed = await evalPage(page, `(() => {
        Storage.prototype.setItem=window.__researchOriginalSetItem;
        return {open:document.querySelector('#research-inventory-dialog').open,value:document.querySelector('#research-inventory-input').value,raw:localStorage.getItem('${key}'),message:document.querySelector('#research-inventory-dialog-status').textContent};
      })()`);
      assert.equal(failed.open, true); assert.equal(failed.value, '3');
      assert.equal(failed.raw, null); assert.match(failed.message, /保存できません/);
      await evalPage(page, "document.querySelector('#research-inventory-dialog-save').click()");
      await browser.waitFor(async () => evalPage(page, "!document.querySelector('#research-inventory-dialog').open"));
      await browser.waitFor(async () => evalPage(page, "document.activeElement.dataset.researchOwned==='地球から来た鉛'"));
      const saved = await evalPage(page, `(() => ({
        items:JSON.parse(localStorage.getItem('${key}')).items,
        value:document.querySelector('[data-research-owned="地球から来た鉛"] .research-plan-count').textContent,
        focus:document.activeElement.dataset.researchOwned
      }))()`);
      assert.equal(saved.items['地球から来た鉛'], 3); assert.equal(saved.value, '3'); assert.equal(saved.focus, '地球から来た鉛');
      await evalPage(page, `(() => {
        document.querySelector('[data-research-owned="地球から来た鉛"]').click();
        const i=document.querySelector('#research-inventory-input');i.value='4';i.dispatchEvent(new Event('input',{bubbles:true}));
        window.confirm=()=>false;
      })()`);
      const noLock = await evalPage(page, `(() => {
        Object.defineProperty(navigator,'locks',{value:undefined,configurable:true});
        try {
          document.querySelector('#research-inventory-dialog-save').click();
          return {open:document.querySelector('#research-inventory-dialog').open,
            stored:JSON.parse(localStorage.getItem('${key}')).items['地球から来た鉛'],
            message:document.querySelector('#research-inventory-dialog-status').textContent};
        } finally { delete navigator.locks; }
      })()`);
      assert.equal(noLock.open, true); assert.equal(noLock.stored, 3);
      assert.match(noLock.message, /排他機能を利用できない/);
      const tabKey = { key:'Tab', code:'Tab', windowsVirtualKeyCode:9 };
      await cdp.send('Input.dispatchKeyEvent', { ...tabKey, type:'keyDown' }, page.sessionId);
      await cdp.send('Input.dispatchKeyEvent', { ...tabKey, type:'keyUp' }, page.sessionId);
      assert.equal(await evalPage(page, "document.querySelector('#research-inventory-dialog').contains(document.activeElement)"), true);
      const escapeKey = { key:'Escape', code:'Escape', windowsVirtualKeyCode:27 };
      await cdp.send('Input.dispatchKeyEvent', { ...escapeKey, type:'keyDown' }, page.sessionId);
      await cdp.send('Input.dispatchKeyEvent', { ...escapeKey, type:'keyUp' }, page.sessionId);
      assert.equal(await evalPage(page, "document.querySelector('#research-inventory-dialog').open"), true);
      await evalPage(page, "window.confirm=()=>true");
      await cdp.send('Input.dispatchKeyEvent', { ...escapeKey, type:'keyDown' }, page.sessionId);
      await cdp.send('Input.dispatchKeyEvent', { ...escapeKey, type:'keyUp' }, page.sessionId);
      await browser.waitFor(async () => evalPage(page, "!document.querySelector('#research-inventory-dialog').open && document.activeElement.dataset.researchOwned==='地球から来た鉛'"));
      await evalPage(page, `(() => {
        document.querySelector('[data-research-owned="地球から来た鉛"]').click();
        const i=document.querySelector('#research-inventory-input');i.value='0';i.dispatchEvent(new Event('input',{bubbles:true}));
        document.querySelector('#research-inventory-dialog-save').click();
      })()`);
      await browser.waitFor(async () => evalPage(page, "!document.querySelector('#research-inventory-dialog').open && document.querySelector('[data-research-owned=\"地球から来た鉛\"] .research-plan-count').textContent==='0'"));
      assert.equal(await evalPage(page, "document.querySelector('[data-research-owned=\"地球から来た鉛\"] .research-plan-count').textContent"), '0');
      await evalPage(page, `(() => {
        document.querySelector('[data-research-owned="地球から来た鉛"]').click();
        const i=document.querySelector('#research-inventory-input');i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));
        document.querySelector('#research-inventory-dialog-save').click();
      })()`);
      await browser.waitFor(async () => evalPage(page, "!document.querySelector('#research-inventory-dialog').open && document.querySelector('[data-research-owned=\"地球から来た鉛\"] .research-plan-count').textContent==='—'"));
      assert.equal(await evalPage(page, "document.querySelector('[data-research-owned=\"地球から来た鉛\"] .research-plan-count').textContent"), '—');
      await evalPage(page, `(() => {
        document.querySelector('[data-research-owned="地球から来た鉛"]').click();
        const i=document.querySelector('#research-inventory-input');i.value='7';i.dispatchEvent(new Event('input',{bubbles:true}));
      })()`);
      const second = await browser.createPage(cdp, `${origin}/stat-dashboard.html?global=research&researchNative=second`);
      await cdp.send('Page.enable', {}, second.sessionId);
      await browser.waitFor(async () => evalPage(second, "document.documentElement.dataset.storageBoot==='ready'&&document.querySelector('#research-level-select')?.options.length===13"));
      const holdLock = async () => {
        await evalPage(second, `(() => {
          window.__lockHeld=false;
          navigator.locks.request('trickcal-research-inventory-v1',{mode:'exclusive'},async()=>{
            window.__lockHeld=true;
            await new Promise(resolve=>{window.__releaseInventoryLock=resolve});
          });
        })()`);
        await browser.waitFor(async () => evalPage(second, "window.__lockHeld===true"));
      };
      await holdLock();
      await evalPage(page, `(() => {
        window.__inventoryWrites=0;
        const prior=Storage.prototype.setItem;
        window.__researchOriginalSetItem=prior;
        Storage.prototype.setItem=function(k,v){if(k==='${key}')window.__inventoryWrites++;return prior.call(this,k,v)};
        document.querySelector('#research-inventory-dialog-save').click();
        document.querySelector('#research-inventory-dialog-save').click();
      })()`);
      const pending = await evalPage(page, `(() => ({busy:document.querySelector('#research-inventory-dialog').getAttribute('aria-busy'),
        disabled:document.querySelector('#research-inventory-dialog-save').disabled,
        raw:JSON.parse(localStorage.getItem('${key}')).items['地球から来た鉛']}))()`);
      assert.equal(pending.busy, 'true'); assert.equal(pending.disabled, true); assert.equal(pending.raw, undefined);
      await evalPage(second, `(() => {
        const old=JSON.parse(localStorage.getItem('${key}'));
        localStorage.setItem('${key}',JSON.stringify({...old,items:{...old.items,'感性コア':12}}));
        window.__releaseInventoryLock();
      })()`);
      await cdp.send('Target.activateTarget', { targetId:page.targetId });
      try {
        await browser.waitFor(async () => evalPage(page, "!document.querySelector('#research-inventory-dialog').open && document.querySelector('[data-research-owned=\"地球から来た鉛\"] .research-plan-count').textContent==='7'"));
      } catch (error) {
        const state = await evalPage(page, `(() => ({open:document.querySelector('#research-inventory-dialog').open,
          status:document.querySelector('#research-inventory-dialog-status').textContent,
          busy:document.querySelector('#research-inventory-dialog').getAttribute('aria-busy'),
          saved:localStorage.getItem('${key}'),count:document.querySelector('[data-research-owned="地球から来た鉛"] .research-plan-count')?.textContent}))()`);
        throw new Error(`locked inventory save did not finish: ${JSON.stringify(state)}`, { cause:error });
      }
      const merged = await evalPage(page, `JSON.parse(localStorage.getItem('${key}')).items`);
      assert.equal(merged['地球から来た鉛'], 7); assert.equal(merged['感性コア'], 12);
      assert.equal(await evalPage(page, "window.__inventoryWrites"), 1);
      await evalPage(page, "Storage.prototype.setItem=window.__researchOriginalSetItem");
      await evalPage(page, "document.querySelector('[data-research-owned=\"地球から来た鉛\"]').click()");
      await holdLock();
      await evalPage(page, `(() => {
        const i=document.querySelector('#research-inventory-input');i.value='9';i.dispatchEvent(new Event('input',{bubbles:true}));
        document.querySelector('#research-inventory-dialog-save').click();
      })()`);
      await evalPage(second, `(() => {
        const old=JSON.parse(localStorage.getItem('${key}'));
        localStorage.setItem('${key}',JSON.stringify({...old,items:{...old.items,'地球から来た鉛':8}}));
        window.__releaseInventoryLock();
      })()`);
      await browser.waitFor(async () => evalPage(page, "document.querySelector('#research-inventory-dialog-status').textContent.includes('別タブでこの素材が更新されました') && !document.querySelector('#research-inventory-dialog').hasAttribute('aria-busy')"));
      const conflict = await evalPage(page, `(() => {
        return {open:document.querySelector('#research-inventory-dialog').open,raw:JSON.parse(localStorage.getItem('${key}')).items['地球から来た鉛'],msg:document.querySelector('#research-inventory-dialog-status').textContent};
      })()`);
      assert.equal(conflict.open, true); assert.equal(conflict.raw, 8); assert.match(conflict.msg, /別タブ/);
      const cancel = await evalPage(page, `(() => {
        const old=window.confirm;window.confirm=()=>false;
        document.querySelector('#research-inventory-dialog-cancel').click();
        const refused=document.querySelector('#research-inventory-dialog').open;
        window.confirm=()=>true;document.querySelector('#research-inventory-dialog-cancel').click();window.confirm=old;
        return {refused,closed:!document.querySelector('#research-inventory-dialog').open};
      })()`);
      assert.deepEqual(cancel, {refused:true,closed:true});
      await browser.waitFor(async () => evalPage(page, "document.querySelector('[data-research-owned=\"地球から来た鉛\"] .research-plan-count').textContent==='8'"));
      assert.equal(await evalPage(page, "document.querySelector('[data-research-owned=\"地球から来た鉛\"] .research-plan-count').textContent"), '8');
      await cdp.send('Target.closeTarget', { targetId:second.targetId });
      await browser.clickSelector(cdp, page, '[data-shared-theme-button]');
      await browser.waitFor(async () => evalPage(page, "document.documentElement.dataset.theme==='light'"));
      await evalPage(page, "document.querySelector('#research-inventory-list').scrollIntoView({block:'center',behavior:'instant'})");
      await capture(page, `tabs-inventory-${width}-light.png`);
      await evalPage(page, "document.querySelector('[data-research-plan-tab=remaining]').click();document.querySelector('#research-plan-summary').scrollIntoView({block:'center',behavior:'instant'})");
      await capture(page, `tabs-plan-${width}-light.png`);
      await evalPage(page, "document.querySelector('[data-research-plan-tab=inventory]').click();document.querySelector('[data-research-owned=\"感性コア\"]').click()");
      await capture(page, `tabs-edit-${width}-light.png`);
      await evalPage(page, "document.querySelector('#research-inventory-dialog-cancel').click()");
      await evalPage(page, 'location.reload()');
      await browser.waitFor(async () => evalPage(page, "document.documentElement.dataset.storageBoot==='ready'&&document.querySelector('#research-level-select')?.options.length===13"));
      assert.equal(await evalPage(page, `JSON.parse(localStorage.getItem('${key}')).items['感性コア']`), 12);
      if (width===375) {
        await evalPage(page, `localStorage.setItem('${key}',JSON.stringify({'地球から来た鉛':0,'ゴールド':7}))`);
        await evalPage(page, 'location.reload()');
        await browser.waitFor(async () => evalPage(page, "document.documentElement.dataset.storageBoot==='ready'&&document.querySelector('#research-level-select')?.options.length===13"));
        const legacy = await evalPage(page, `(() => {
          document.querySelector('[data-research-plan-tab=inventory]').click();
          return {zero:document.querySelector('[data-research-owned="地球から来た鉛"] .research-plan-count').textContent,
            blank:document.querySelector('[data-research-owned="感性コア"] .research-plan-count').textContent,
            date:document.querySelector('#research-inventory-updated').textContent,
            gold:!!document.querySelector('[data-research-owned="ゴールド"]')};
        })()`);
        assert.equal(legacy.zero, '0'); assert.equal(legacy.blank, '—');
        assert.match(legacy.date, /更新日時不明/); assert.equal(legacy.gold, false);
        await evalPage(page, `(() => {
          document.querySelector('[data-research-owned="感性コア"]').click();
          const i=document.querySelector('#research-inventory-input');i.value='2';i.dispatchEvent(new Event('input',{bubbles:true}));
          document.querySelector('#research-inventory-dialog-save').click();
        })()`);
        await browser.waitFor(async () => evalPage(page, "!document.querySelector('#research-inventory-dialog').open && document.querySelector('[data-research-owned=\"感性コア\"] .research-plan-count').textContent==='2'"));
        const migrated = await evalPage(page, `JSON.parse(localStorage.getItem('${key}'))`);
        assert.equal(migrated.version, 2); assert.equal(migrated.items['ゴールド'], 7);
        assert.equal(migrated.items['地球から来た鉛'], 0); assert.equal(migrated.items['感性コア'], 2);
      }
      assert.ok(!missing.length, JSON.stringify(missing));
      if (width===375) {
        await cdp.send('Emulation.setDeviceMetricsOverride', { width:320, height:900, deviceScaleFactor:1, mobile:true }, page.sessionId);
        await evalPage(page, "document.querySelector('[data-research-plan-tab=remaining]').click()");
        const narrow = await evalPage(page, `(() => {
          const fields=document.querySelector('.research-plan-fields');
          const stage=document.querySelector('#research-plan-end-stage').getBoundingClientRect();
          const mode=document.querySelector('#research-plan-mode').getBoundingClientRect();
          return {wrapped:mode.top>stage.bottom,overflow:fields.scrollWidth>fields.clientWidth};
        })()`);
        assert.equal(narrow.wrapped, true); assert.equal(narrow.overflow, false);
      }
      console.log(JSON.stringify({ width, inventory:inventory.count, merged, conflict:conflict.msg }));
      await evalPage(page, `localStorage.removeItem('${key}')`);
      await cdp.send('Target.closeTarget', { targetId:page.targetId });
    }
    // Keep the calculator-side research preset check alongside the manager UI checks.
    const calc = await browser.createPage(cdp, `${origin}/formation-damage-calc.html?researchNative=1`);
    await cdp.send('Page.enable', {}, calc.sessionId);
    await browser.waitFor(async () => evalPage(calc, "document.querySelector('#fdc-enemy-research-level')?.options.length===13"), { timeoutMs:30000 });
    await evalPage(calc, "(() => { const s=document.querySelector('#fdc-enemy-source-mode');s.value='apostle';s.dispatchEvent(new Event('change',{bubbles:true})); })()");
    await browser.waitFor(async () => evalPage(calc, "document.querySelector('#fdc-enemy-global-percent-category')?.hidden===false"));
    const enemyId = await evalPage(calc, "(() => { const id=window.TRICKCAL_STAT_DATA.sheets.basicInfo.find(row=>row.種族==='精霊')?.id;const s=document.querySelector('#fdc-enemy-apostle');s.value=id;s.dispatchEvent(new Event('change',{bubbles:true}));return id; })()");
    await evalPage(calc, "(() => { const s=document.querySelector('#fdc-enemy-research-level');s.value='12';s.dispatchEvent(new Event('change',{bubbles:true})); })()");
    await browser.waitFor(async () => evalPage(calc, "document.querySelector('#fdc-enemy-research-progress')?.options.length===48"));
    await evalPage(calc, "(() => { const s=document.querySelector('#fdc-enemy-research-progress');s.value='47';s.dispatchEvent(new Event('change',{bubbles:true})); })()");
    const applied = await evalPage(calc, "(() => { document.querySelector('#fdc-enemy-additive-preset-apply')?.click();return {patk:document.querySelector('#fdc-enemy-global-additive-patk')?.value}; })()");
    assert.equal(Number(applied.patk), 389, `enemy ${enemyId} research applied`);
    for (const width of [1280, 375]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width, height:900, deviceScaleFactor:1, mobile:width<500 }, calc.sessionId);
      if (width<500) await evalPage(calc, "document.querySelector('#fdc-mobile-side-switch [data-fdc-mobile-side=enemy]')?.click()");
      const state = await evalPage(calc, "(() => { const s=document.querySelector('#fdc-enemy-research-progress');const r=s.getBoundingClientRect();return {level:document.querySelector('#fdc-enemy-research-level').value,progress:s.value,options:s.options.length,width:r.width,height:r.height}; })()");
      assert.equal(state.level, '12'); assert.equal(state.progress, '47'); assert.equal(state.options, 48);
      assert.ok(state.width>0 && state.height>0);
    }
    console.log(JSON.stringify({ page:'enemy-apply', applied }));
    await cdp.send('Target.closeTarget', { targetId:calc.targetId });
  } finally {
    try { if (cdp) await cdp.send('Browser.close'); } catch (_) {}
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    await new Promise(resolve => server.close(resolve));
    if (path.resolve(profile).startsWith(`${path.resolve(os.tmpdir())}${path.sep}`)) {
      try { fs.rmSync(profile, { recursive:true, force:true, maxRetries:3, retryDelay:100 }); } catch (_) {}
    }
  }
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
