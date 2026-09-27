#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

async function run() {
  const root = path.resolve(__dirname, '..', 'tmp', 'research-planner-site');
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
    if (relative.includes('Materials') || relative.includes('ResearchMaterials')) imageRequests.push(relative);
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
        const tree = await Promise.all(nodes.map(node => new Promise(resolve => {
          const image = node.querySelector('img');
          if (image.complete) return resolve({ src: image.src, width: image.naturalWidth });
          image.addEventListener('load', () => resolve({ src: image.src, width: image.naturalWidth }), { once: true });
          image.addEventListener('error', () => resolve({ src: image.src, width: 0 }), { once: true });
        })));
        return { nodes: nodes.length, tree, assetUrl: window.TRICKCAL_PUBLIC_SITE.assetUrl('img/Materials/ゴールド.webp') };
      })()`);
      assert.equal(check.nodes, 7);
      assert.ok(check.tree.every(item => item.width > 0), JSON.stringify(check.tree));
      assert.ok(check.assetUrl.includes(`${prefix}/img/Materials/`), check.assetUrl);
      console.log(`${prefix || 'new'}: ${check.nodes} tree images loaded`);
      await cdp.send('Target.closeTarget', { targetId: page.targetId });
    }
    assert.equal(imageRequests.filter(name => name.includes('ResearchMaterials')).length, 0);
    assert.equal(imageRequests.filter(name => /\.(png|webp)\.(png|webp)$/i.test(name)).length, 0);
    assert.equal(failures.filter(name => name.includes('Materials')).length, 0, failures.join(', '));
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
