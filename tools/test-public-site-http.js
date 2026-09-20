#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { buildPlan, readManifest } = require('./generate-public-site.js');

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8'
  }[extension] || 'application/octet-stream';
}

function createStaticServer(rootDirectory) {
  const root = path.resolve(rootDirectory);
  return http.createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { allow: 'GET, HEAD' });
      response.end();
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost/').pathname);
    } catch (_) {
      response.writeHead(400);
      response.end();
      return;
    }
    const relative = pathname.replace(/^\/+/, '');
    const requested = path.resolve(root, relative);
    if (requested !== root && !requested.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403);
      response.end();
      return;
    }
    let filePath = requested;
    try {
      if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
      if (!fs.statSync(filePath).isFile()) throw new Error('not a file');
    } catch (_) {
      response.writeHead(404);
      response.end();
      return;
    }
    const stat = fs.statSync(filePath);
    response.writeHead(200, {
      'content-type': contentType(filePath),
      'content-length': stat.size,
      'cache-control': 'no-store'
    });
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(filePath).pipe(response);
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  server.closeAllConnections?.();
  return new Promise(resolve => server.close(() => resolve()));
}

function registeredRequests(plan) {
  const requests = new Map();
  for (const [key] of plan.publicPaths) {
    const separator = key.indexOf(':');
    const profile = key.slice(0, separator);
    const publicPath = key.slice(separator + 1);
    requests.set(`${profile}:${publicPath}`, { profile, publicPath, label: key });
  }
  for (const entry of plan.entries.filter(item => item.type === 'asset')) {
    const publicPath = `/${entry.outputRel}`.replace(/\/+/g, '/');
    requests.set(`${entry.profile}:${publicPath}`, {
      profile: entry.profile,
      publicPath,
      label: entry.label
    });
  }
  return [...requests.values()];
}

async function checkHeadRequests(baseUrls, requests) {
  const failures = [];
  let cursor = 0;
  async function worker() {
    while (cursor < requests.length) {
      const item = requests[cursor++];
      const url = new URL(item.publicPath, baseUrls[item.profile]).href;
      try {
        const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
        if (response.status !== 200) failures.push(`${item.label}: HTTP ${response.status} ${url}`);
      } catch (error) {
        failures.push(`${item.label}: ${error.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(32, requests.length) }, () => worker()));
  assert.deepEqual(failures, [], `HTTP到達できない登録入口／資材があります: ${failures.slice(0, 12).join(' | ')}`);
}

async function getText(base, publicPath) {
  const response = await fetch(new URL(publicPath, base), { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, `${publicPath}: HTTP ${response.status}`);
  return response.text();
}

function collectSameOriginStaticRefs(html, sourcePath, base) {
  const sourceUrl = new URL(sourcePath, base);
  const refs = [];
  for (const match of html.matchAll(/\b(?:src|href|poster)=["']([^"']+)["']/gi)) {
    const reference = match[1];
    if (!reference || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(reference)) continue;
    const target = new URL(reference, sourceUrl);
    if (target.origin === sourceUrl.origin) refs.push(target.pathname);
  }
  return [...new Set(refs)];
}

async function checkStaticReferences(baseUrls) {
  const pages = [
    ['new', '/manager/index.html'],
    ['new', '/calc/index.html'],
    ['new', '/calc/dps/index.html'],
    ['new', '/share/index.html'],
    ['new', '/data/index.html'],
    ['new', '/data/enemies/index.html'],
    ['new', '/data/boards/index.html'],
    ['new', '/transfer/index.html'],
    ['new', '/recovery/index.html'],
    ['legacy', '/trickcal-manager/stat-dashboard.html'],
    ['legacy', '/trickcal-manager/formation-damage-calc.html'],
    ['legacy', '/trickcal-manager/formation-share.html'],
    ['legacy', '/trickcal-manager/public/board-layout-preview.html']
  ];
  const refs = new Map();
  for (const [profile, page] of pages) {
    const html = await getText(baseUrls[profile], page);
    for (const reference of collectSameOriginStaticRefs(html, page, baseUrls[profile])) {
      refs.set(`${profile}:${reference}`, { profile, publicPath: reference, label: `${page} -> ${reference}` });
    }
  }
  await checkHeadRequests(baseUrls, [...refs.values()]);
}

async function run(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || path.join(__dirname, '..'));
  const outputDir = path.resolve(options.sourceDir || path.join(repoRoot, 'tmp', 'public-site'));
  const manifest = options.manifest || readManifest(path.join(repoRoot, 'tools', 'public-route-manifest.json'));
  const plan = buildPlan(manifest, { repoRoot, outputDir });
  assert(fs.existsSync(outputDir), `生成物がありません: ${outputDir}`);
  const servers = [createStaticServer(outputDir), createStaticServer(outputDir)];
  try {
    const ports = [];
    for (const server of servers) ports.push(await listen(server));
    const baseUrls = {
      new: 'http://127.0.0.1:' + ports[0] + '/',
      legacy: 'http://127.0.0.1:' + ports[1] + '/'
    };
    const requests = registeredRequests(plan);
    await checkHeadRequests(baseUrls, requests);
    await checkStaticReferences(baseUrls);

    const newManager = await getText(baseUrls.new, '/manager/');
    const newCalc = await getText(baseUrls.new, '/calc/');
    const newDps = await getText(baseUrls.new, '/calc/dps/');
    const newData = await getText(baseUrls.new, '/data/');
    const newBoard = await getText(baseUrls.new, '/data/boards/');
    const newAlias = await getText(baseUrls.new, '/stat-dashboard.html?keep=1');
    const legacyManager = await getText(baseUrls.legacy, '/trickcal-manager/stat-dashboard.html');
    const shareCreate = await getText(baseUrls.new, '/formation-share-create.js');
    const worker = await getText(baseUrls.new, '/dps-simulator-worker.js');
    const boardScript = await getText(baseUrls.new, '/public/board-layout-preview.js');
    const serviceWorker = await getText(baseUrls.new, '/service-worker.js');

    assert.match(newManager, /href="\/calc\//);
    assert.match(newManager, /href="\/data\/boards\//);
    assert.match(newManager, /public-site-runtime\.js\?v=[0-9a-f]{16}/);
    assert.doesNotMatch(newManager, /href="formation-damage-calc\.html/);
    assert.match(newCalc, /formation-damage-dps-prototype/);
    assert.match(newDps, /dps-simulator\.js/);
    assert.match(newData, /dashboard-top-control-bar/);
    assert.match(newData, /href="\/manager\//);
    assert.match(newData, /href="\/data\/enemies\//);
    assert.match(newBoard, /public-site-runtime\.js\?v=[0-9a-f]{16}/);
    assert.match(newAlias, /location\.search \|\| ''/);
    assert.match(newAlias, /location\.hash \|\| ''/);
    const managerRoute = manifest.routes.find(route => route.id === 'manager');
    const expectedCanonical = `${manifest.profiles.new.origin}${managerRoute.profiles.new.publicPath}`;
    const expectedLegacyPage = `${manifest.profiles.legacy.origin}${managerRoute.profiles.legacy.publicPath}`;
    const canonicalTags = (legacyManager.match(/<link\b[^>]*>/gi) || [])
      .filter(tag => /\brel=["'][^"']*\bcanonical\b[^"']*["']/i.test(tag));
    assert.strictEqual(canonicalTags.length, 1, 'legacy manager has one canonical link');
    assert(canonicalTags[0].includes(`href="${expectedCanonical}"`), 'legacy manager canonical points to new manager');
    assert(legacyManager.includes(`<meta property="og:url" content="${expectedLegacyPage}">`), 'legacy manager og:url remains on legacy profile');
    assert.doesNotMatch(legacyManager.replace(canonicalTags[0], ''), /https:\/\/trickcal\.irlab\.dev/, 'legacy response uses the new origin only in rel=canonical');
    assert.match(shareCreate, /TRICKCAL_PUBLIC_SITE\?\.pageUrl\?\.\('share'\)/);
    assert.doesNotMatch(shareCreate, /searchParams\.set\('v'/);
    assert.match(worker, /new URL\('dps-simulator\.js'/);
    assert.match(boardScript, /boardAssetPath\('img\/Board\/Tile_gate\.webp'\)/);
    assert.doesNotMatch(serviceWorker, /clients\.claim/);
    assert.doesNotMatch(serviceWorker.slice(
      serviceWorker.indexOf("addEventListener('install'"),
      serviceWorker.indexOf("addEventListener('activate'")
    ), /skipWaiting/);
    assert.match(serviceWorker, /EXCLUDED_PATH_PREFIXES/);
    assert.match(serviceWorker, /BASE_PATH === '\/' && url\.pathname\.startsWith\('\/trickcal-manager\/'\)/);
    return { requestCount: requests.length, origins: 2, staticReferences: true, routeWiring: true, aliases: true, serviceWorkerGates: true };
  } finally {
    await Promise.all(servers.map(close));
  }
}

if (require.main === module) {
  run().then(result => console.log('public site HTTP checks passed: ' + JSON.stringify(result))).catch(error => {
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  });
}

module.exports = { run };
