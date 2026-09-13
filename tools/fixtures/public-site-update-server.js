#!/usr/bin/env node
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const port = Number(process.argv[2]);
const oldRoot = path.resolve(process.argv[3] || '');
const newRoot = path.resolve(process.argv[4] || '');
if (!Number.isInteger(port) || !oldRoot || !newRoot) throw new Error('usage: node public-site-update-server.js <port> <old-root> <new-root>');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};
let activeRoot = oldRoot;
let switchedAt = null;

function debugScript() {
  return `<script>(() => {
  const state = { mode: 'update-server' };
  const seedUnrelatedCache = async () => {
    if (!('caches' in window)) return;
    const cache = await caches.open('u2-unrelated-cache-sentinel');
    if (!(await cache.match('/__u2-unrelated-cache-sentinel'))) {
      await cache.put('/__u2-unrelated-cache-sentinel', new Response('keep'));
    }
  };
  const render = value => {
    window.__trickcalU2State = value;
    const node = document.getElementById('trickcal-u2-debug');
    if (node) node.textContent = JSON.stringify(value);
  };
  const inspect = async () => {
    try {
      const registration = await navigator.serviceWorker?.getRegistration?.();
      const cacheNames = 'caches' in window ? await caches.keys() : [];
      const navigation = performance.getEntriesByType('navigation')[0];
      render({
        mode: 'update-server',
        waiting: !!registration?.waiting,
        waitingState: registration?.waiting?.state || '',
        activeState: registration?.active?.state || '',
        activeScript: registration?.active?.scriptURL || '',
        controller: !!navigator.serviceWorker?.controller,
        cacheNames,
        url: location.href,
        navigationType: navigation?.type || '',
        switchedAt: ${JSON.stringify(switchedAt)}
      });
      if (registration && !registration.waiting) await registration.update();
    } catch (error) {
      render({ mode: 'update-server', error: String(error), url: location.href });
    }
  };
  const debug = document.createElement('pre');
  debug.id = 'trickcal-u2-debug';
  debug.hidden = true;
  document.documentElement.appendChild(debug);
  seedUnrelatedCache().catch(() => {});
  inspect();
  setInterval(inspect, 500);
})();</script>`;
}

function injectDebug(content) {
  const text = content.toString('utf8');
  const script = debugScript();
  if (/<\/head>/i.test(text)) return Buffer.from(text.replace(/<\/head>/i, `${script}</head>`));
  return Buffer.from(`${script}${text}`);
}

function resolveFile(root, pathname) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  let filePath = path.resolve(root, relative || 'index.html');
  if (filePath.startsWith(`${root}${path.sep}`) && fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) return null;
  return filePath;
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`);
  if (requestUrl.pathname === '/__u2/switch' || requestUrl.pathname === '/u2-switch'
    || requestUrl.searchParams.get('u2') === 'switch') {
    activeRoot = newRoot;
    switchedAt = new Date().toISOString();
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ ok: true, activeRoot, switchedAt }));
    return;
  }
  if (requestUrl.pathname === '/__u2/state' || requestUrl.pathname === '/u2-state') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ activeRoot, switchedAt }));
    return;
  }
  const filePath = resolveFile(activeRoot, requestUrl.pathname);
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  const extension = path.extname(filePath).toLowerCase();
  const content = extension === '.html' ? injectDebug(fs.readFileSync(filePath)) : fs.readFileSync(filePath);
  response.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  response.end(content);
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(JSON.stringify({ ok: true, port, oldRoot, newRoot }) + '\n');
});
