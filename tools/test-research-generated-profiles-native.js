#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

async function run() {
  const root = path.resolve(process.env.TRICKCAL_RESEARCH_PROFILE_ROOT || path.join(__dirname, '..', 'tmp', 'research-planner-site'));
  if (!fs.existsSync(root)) throw new Error('ローカル公開生成物がありません');
  const port = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([port]);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-research-profiles-'));
  const failures = [];
  const imageRequests = [];
  const server = http.createServer((request, response) => {
    const relative = decodeURIComponent(new URL(request.url, `http://127.0.0.1:${port}`).pathname)
      .replace(/^\/+/, '');
    const file = path.resolve(root, relative.endsWith('/') ? path.join(relative, 'index.html') : relative);
    if (relative.includes('Materials') || relative.includes('ResearchMaterials') || /(?:^|\/)Slot\/ItemSlot_(?:[1-5]|Turquoise|Gold)\.png$/.test(relative)) imageRequests.push(relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      failures.push(relative); response.writeHead(404); response.end(); return;
    }
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', { '.js': 'application/javascript', '.css': 'text/css',
      '.html': 'text/html', '.png': 'image/png', '.webp': 'image/webp' }[path.extname(file)] || 'application/octet-stream');
    response.end(fs.readFileSync(file));
  }).listen(port, '127.0.0.1');
  let chrome, cdp;
  try {
    chrome = browser.startChild(browser.findChrome(), [`--user-data-dir=${profile}`,
      `--remote-debugging-port=${cdpPort}`, '--remote-debugging-address=127.0.0.1',
      '--no-first-run', '--no-default-browser-check', '--disable-sync', '--disable-extensions',
      '--disable-background-networking', 'about:blank'], root);
    const version = await browser.waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
      return response.ok ? response.json() : null;
    }, { timeoutMs: 30000 });
    cdp = new browser.CdpClient(version.webSocketDebuggerUrl);
    await cdp.connect();
    for (const prefix of ['', '/trickcal-manager']) {
      const page = await browser.createPage(cdp,
        `http://127.0.0.1:${port}${prefix}/manager/?global=research`);
      await browser.waitFor(async () => browser.evaluate(cdp, page,
        "document.documentElement.dataset.storageBoot==='ready' && document.querySelector('#research-tree-material')?.options.length===28"),
      { timeoutMs: 30000 });
      const check = await browser.evaluate(cdp, page, `(async () => {
        const select = document.querySelector('#research-tree-material');
        select.value = '感性コア'; select.dispatchEvent(new Event('change', { bubbles: true }));
        const nodes = [...document.querySelectorAll('#research-material-detail .research-tree-node')];
        const loadImage = image => new Promise(resolve => {
          if (image.complete) return resolve({ src: image.src, width: image.naturalWidth });
          image.addEventListener('load', () => resolve({ src: image.src, width: image.naturalWidth }), { once: true });
          image.addEventListener('error', () => resolve({ src: image.src, width: 0 }), { once: true });
        });
        const tree = await Promise.all(nodes.map(async node => {
          const images = await Promise.all([...node.querySelectorAll('img')].map(loadImage));
          return { name: node.dataset.researchNode, images };
        }));
        const slotFiles = ['ItemSlot_1.png','ItemSlot_2.png','ItemSlot_3.png','ItemSlot_4.png','ItemSlot_5.png','ItemSlot_Turquoise.png','ItemSlot_Gold.png'];
        const slotAssets = await Promise.all(slotFiles.map(file => loadImage(Object.assign(new Image(), { src: window.TRICKCAL_PUBLIC_SITE.assetUrl('img/Slot/' + file) }))));
        const catalog = window.TRICKCAL_STAT_DATA.sheets.researchMaterialCatalog;
        const catalogProbe = [];
        for (const item of catalog) {
          select.value = item.name; select.dispatchEvent(new Event('change', { bubbles: true }));
          const node = [...document.querySelectorAll('#research-material-detail .research-tree-node')].find(entry => entry.dataset.researchNode === item.name);
          const icon = node?.querySelector('.research-material-icon');
          const images = await Promise.all([...(icon?.querySelectorAll('img') || [])].map(loadImage));
          catalogProbe.push({ name:item.name, imageKey:item.imageKey, category:item.itemCategory ?? null, grade:item.itemGrade ?? null,
            background:icon?.querySelector('.research-material-slot-background')?.dataset.researchSlotBackground || null,
            foreground:icon?.querySelector('.research-material-image')?.dataset.researchImage || null,
            images });
        }
        const tierProbe = catalog.find(item => item.name === '感性コア');
        const originalGrade = tierProbe.itemGrade;
        const gradeProbe = [];
        for (const grade of [1,2,3,4,5]) {
          tierProbe.itemGrade = grade;
          select.value = '感性コア'; select.dispatchEvent(new Event('change', { bubbles: true }));
          const node = [...document.querySelectorAll('#research-material-detail .research-tree-node')].find(item => item.dataset.researchNode === '感性コア');
          const background = node.querySelector('.research-material-slot-background');
          const loaded = await loadImage(background);
          gradeProbe.push({ grade, name: background.dataset.researchSlotBackground, src: loaded.src, width: loaded.width });
        }
        const originalCategory = tierProbe.itemCategory;
        const neutralProbes = [];
        for (const invalidGrade of [null, 0, 6]) {
          tierProbe.itemCategory = invalidGrade === null ? undefined : '素材';
          tierProbe.itemGrade = invalidGrade;
          select.value = '感性コア'; select.dispatchEvent(new Event('change', { bubbles: true }));
          const node = [...document.querySelectorAll('#research-material-detail .research-tree-node')].find(item => item.dataset.researchNode === '感性コア');
          const icon = node.querySelector('.research-material-icon');
          neutralProbes.push({
            grade: invalidGrade,
            hasSlot: !!icon?.querySelector('.research-material-slot-background'),
            background: icon ? getComputedStyle(icon).backgroundColor : '',
            materialImage: !!icon?.querySelector('.research-material-image'),
          });
        }
        tierProbe.itemCategory = originalCategory;
        tierProbe.itemGrade = originalGrade;
        const hadElyph = catalog.some(item => item.name === 'エリーフ');
        let elyphFixture;
        if (!hadElyph) {
          elyphFixture = { name: 'エリーフ', imageKey: 'エリーフ.webp', itemCategory: '通貨', itemGrade: 'エリーフ' };
          catalog.push(elyphFixture);
          select.add(new Option('エリーフ', 'エリーフ'));
        }
        select.value = 'エリーフ'; select.dispatchEvent(new Event('change', { bubbles: true }));
        const elyphNode = [...document.querySelectorAll('#research-material-detail .research-tree-node')].find(item => item.dataset.researchNode === 'エリーフ');
        const elyphBackground = await loadImage(elyphNode.querySelector('.research-material-slot-background'));
        select.value = 'ゴールド'; select.dispatchEvent(new Event('change', { bubbles: true }));
        const goldNode = [...document.querySelectorAll('#research-material-detail .research-tree-node')].find(item => item.dataset.researchNode === 'ゴールド');
        const goldImages = await Promise.all([...goldNode.querySelectorAll('img')].map(loadImage));
        if (elyphFixture) {
          catalog.splice(catalog.indexOf(elyphFixture), 1);
          select.querySelector('option[value="エリーフ"]')?.remove();
        }
        return { nodes: nodes.length, tree, catalogProbe, gradeProbe, neutralProbes, elyphBackground,
          goldImages, slotAssets, assetUrl: window.TRICKCAL_PUBLIC_SITE.assetUrl('img/Materials/ゴールド.webp') };
      })()`);
      assert.equal(check.nodes, 7);
      assert.ok(check.tree.every(item => item.images.some(image => image.width > 0)), JSON.stringify(check.tree));
      const realItems = await browser.evaluate(cdp, page, `window.TRICKCAL_STAT_DATA.sheets.researchMaterialCatalog.map(({name,imageKey,itemCategory,itemGrade})=>({name,imageKey,itemCategory,itemGrade}))`);
      assert.equal(realItems.length, 28, 'アイテム基礎の全件を研究カタログへ追加しています');
      assert.equal(check.catalogProbe.length, realItems.length);
      for (const item of realItems) {
        const expected = item.name === 'ゴールド' ? 'ItemSlot_Gold.png' :
          item.name === 'エリーフ' ? 'ItemSlot_Turquoise.png' :
          item.itemCategory === '素材' && Number.isInteger(item.itemGrade) && item.itemGrade >= 1 && item.itemGrade <= 5 ? `ItemSlot_${item.itemGrade}.png` : null;
        const rendered = check.catalogProbe.find(entry => entry.name === item.name);
        assert.equal(rendered.background, expected, `${item.name}: ${JSON.stringify(rendered)}`);
        assert.equal(rendered.foreground, item.imageKey, `${item.name}の画像対応が一致しません`);
        assert.ok(rendered.images.some(image => image.width > 0), `${item.name}: ${JSON.stringify(rendered)}`);
        if (expected) assert.ok(rendered.images.some(image => image.src.includes(`/img/Slot/${expected}`) && image.width > 0), `${item.name}: ${JSON.stringify(rendered)}`);
      }
      assert.deepEqual(check.gradeProbe.map(item => [item.grade,item.name,item.width > 0]), [1,2,3,4,5].map(grade => [grade,`ItemSlot_${grade}.png`, true]));
      assert.deepEqual(check.neutralProbes.map(item => [item.grade,item.hasSlot,item.materialImage]), [
        [null,false,true], [0,false,true], [6,false,true],
      ]);
      assert.ok(check.neutralProbes.every(item => item.background && item.background !== 'rgba(0, 0, 0, 0)'));
      assert.ok(check.elyphBackground.src.includes('/img/Slot/ItemSlot_Turquoise.png') && check.elyphBackground.width > 0);
      assert.ok(check.goldImages.some(item => item.src.includes('/img/Slot/ItemSlot_Gold.png') && item.width > 0));
      assert.ok(check.slotAssets.every(item => item.width > 0 && item.src.includes(`${prefix}/img/Slot/`)), JSON.stringify(check.slotAssets));
      assert.ok(check.assetUrl.includes(`${prefix}/img/Materials/`), check.assetUrl);
      console.log(`${prefix || 'new'}: ${check.nodes} tree images loaded`);
      await cdp.send('Target.closeTarget', { targetId: page.targetId });
    }
    assert.equal(imageRequests.filter(name => name.includes('ResearchMaterials')).length, 0);
    assert.equal(imageRequests.filter(name => /\.(png|webp)\.(png|webp)$/i.test(name)).length, 0);
    const slotRequests = imageRequests.filter(name => /(?:^|\/)Slot\/ItemSlot_(?:[1-5]|Turquoise|Gold)\.png$/.test(name));
    assert.ok(slotRequests.length >= 7, `Slot背景要求が不足しています: ${slotRequests.join(', ')}`);
    assert.ok(slotRequests.every(name => name.startsWith(prefix.replace(/^\//, '') + (prefix ? '/' : '') + 'img/Slot/')),
      `profile外のSlot背景URL: ${slotRequests.join(', ')}`);
    assert.equal(failures.filter(name => name.includes('Materials') || /(?:^|\/)Slot\/ItemSlot_/.test(name)).length, 0, failures.join(', '));
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
