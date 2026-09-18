#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const runtimeSource = fs.readFileSync(path.join(root, 'public-site-runtime.js'), 'utf8');
const shareSource = fs.readFileSync(path.join(root, 'formation-share.js'), 'utf8');
const displayData = require(path.join(root, 'formation-share-display-data.js'));

function collectImageReferences(value, result = []) {
  if (typeof value === 'string' && value.includes('img/')) {
    result.push(value);
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach(item => collectImageReferences(item, result));
  }
  return result;
}

function encodedPathReferences(values) {
  return values.filter(value => {
    const pathname = String(value).split(/[?#]/, 1)[0];
    return /%[0-9a-f]{2}/i.test(pathname);
  });
}

function createElement() {
  return {
    hidden: false,
    innerHTML: '',
    textContent: '',
    title: '',
    dataset: {},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    setAttribute(name, value) {
      this[name] = String(value);
    }
  };
}

function createSandbox(profile) {
  const ids = [
    'theme-toggle', 'share-content', 'share-error', 'share-error-message',
    'formation-grid', 'spell-count', 'spell-list', 'power-count', 'master-power',
    'formation-total-cost', 'global-enhancement-panel', 'global-enhancement-list'
  ];
  const elements = new Map(ids.map(id => [id, createElement()]));
  const documentElement = { dataset: { theme: 'dark' } };
  const pathname = profile === 'legacy'
    ? '/trickcal-manager/formation-share.html'
    : '/share/';
  const location = {
    pathname,
    origin: 'http://127.0.0.1',
    href: `http://127.0.0.1${pathname}#fixture`,
    hash: '#fixture'
  };
  const document = {
    documentElement,
    getElementById: id => elements.get(id) || null
  };
  const window = {
    location,
    document,
    addEventListener: () => {},
    TRICKCAL_PUBLIC_SITE_CONFIG: {
      profile,
      basePath: profile === 'legacy' ? '/trickcal-manager/' : '/',
      assetBasePath: profile === 'legacy' ? '/trickcal-manager/' : '/',
      assetVersion: 'common-asset-version',
      routes: { share: profile === 'legacy' ? '/trickcal-manager/formation-share.html' : '/share/' },
      peerRoutes: {},
      serviceWorker: { script: 'service-worker.js', scope: profile === 'legacy' ? '/trickcal-manager/' : '/' }
    },
    TRICKCAL_FORMATION_SHARE_DISPLAY_DATA: {
      apostles: {
        Amelia: {
          name: 'アメリア',
          personality: '冷静',
          position: '前列',
          role: '攻撃',
          imagePath: 'img/Chara/Amelia.webp?image=apostle&v=per-image#fixture'
        }
      },
      artifacts: {},
      spells: {},
      masterPowers: {},
      assets: {
        'img/性格_冷静.webp': 'img/性格_冷静.webp?v=personality-image',
        'img/Grade_on.webp': 'img/Grade_on.webp?v=grade-image',
        'img/Grade_off.webp': 'img/Grade_off.webp?v=grade-image-off',
        'img/Card/cost.webp': 'img/Card/cost.webp?v=cost-image'
      }
    },
    TRICKCAL_FORMATION_SHARE_CODEC: {
      decodeHash: () => ({
        snapshot: {
          members: [{ id: 'Amelia', star: 1, asideRank: 0 }, ...Array(8).fill(null)],
          relicSlots: Array(27).fill(null),
          spells: [],
          powers: [],
          globalPercent: null
        }
      })
    }
  };
  const sandbox = {
    window,
    document,
    URL,
    console,
    setTimeout,
    clearTimeout,
    Node: { ELEMENT_NODE: 1 },
    MutationObserver: undefined
  };
  vm.runInNewContext(runtimeSource, sandbox, { filename: 'public-site-runtime.js' });
  vm.runInNewContext(shareSource, sandbox, { filename: 'formation-share.js' });
  return {
    imageHtml: elements.get('formation-grid').innerHTML,
    publicSite: window.TRICKCAL_PUBLIC_SITE
  };
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

function createStaticServer() {
  return http.createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405);
      response.end();
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1/').pathname);
    const relativePath = pathname.replace(/^\/trickcal-manager\//, '').replace(/^\/+/, '');
    const filePath = path.resolve(root, relativePath);
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403);
      response.end();
      return;
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      response.writeHead(404);
      response.end();
      return;
    }
    response.writeHead(200, { 'cache-control': 'no-store' });
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(filePath).pipe(response);
  });
}

async function head(url) {
  const response = await fetch(url, { method: 'HEAD' });
  return response.status;
}

async function main() {
  const displayImageReferences = collectImageReferences(displayData);
  const encodedDisplayImageReferences = encodedPathReferences(displayImageReferences);
  assert.equal(displayImageReferences.length, 193, '共有表示データの画像参照数が変わっています');
  assert.deepEqual(
    encodedDisplayImageReferences,
    [],
    '実共有表示データにpathnameのエンコード済み画像参照があります'
  );

  const server = createStaticServer();
  const port = await listen(server);
  try {
    const results = {};
    for (const profile of ['new', 'legacy']) {
      const { imageHtml, publicSite } = createSandbox(profile);
      const match = imageHtml.match(/<img class="apostle-art" src="([^"]+)"/);
      assert.ok(match, `${profile}: 使徒画像が生成されていません`);
      const imageUrl = new URL(match[1].replaceAll('&amp;', '&'), `http://127.0.0.1:${port}/`).href;
      const brokenUrl = imageUrl.replace('Amelia.webp', 'Amelia.webp%3Fv%3Dper-image');
      assert.equal(imageUrl.includes('%3F'), false, `${profile}: query区切りがパスへエンコードされています`);
      assert.equal(new URL(imageUrl).searchParams.get('v'), 'common-asset-version');
      assert.equal(
        publicSite.assetUrl('img/性格_冷静.webp', { query: '?v=per-image', hash: '#fixture' }),
        `${profile === 'legacy' ? '/trickcal-manager' : ''}/img/%E6%80%A7%E6%A0%BC_%E5%86%B7%E9%9D%99.webp?v=common-asset-version#fixture`
      );
      assert.equal(
        publicSite.assetUrl('img/Chara/Amelia.webp', { query: '?v=per-image', hash: '#fixture', versioned: false }),
        `${profile === 'legacy' ? '/trickcal-manager' : ''}/img/Chara/Amelia.webp?v=per-image#fixture`
      );
      assert.equal(
        publicSite.assetUrl('img/Chara/%41melia.webp'),
        `${profile === 'legacy' ? '/trickcal-manager' : ''}/img/Chara/%2541melia.webp?v=common-asset-version`
      );
      for (const external of [
        'https://cdn.example.test/image.webp?v=1',
        'data:image/svg+xml,%3Csvg%3E',
        'blob:https://example.test/fixture'
      ]) assert.equal(publicSite.assetUrl(external), external);
      for (const invalid of ['', '/img/test.webp', '../img/test.webp', 'img\\test.webp', 'img//test.webp']) {
        assert.throws(() => publicSite.assetUrl(invalid), /manifest-relative/);
      }
      assert.equal(await head(imageUrl), 200, `${profile}: 修正版画像URLが実ファイルへ到達しません`);
      assert.equal(await head(brokenUrl), 404, `${profile}: 壊れた代表URLが再現できません`);
      results[profile] = {
        imageUrl,
        brokenUrl,
        assetBasePath: publicSite.assetBasePath
      };
    }
    assert.equal(results.new.assetBasePath, '/');
    assert.equal(results.legacy.assetBasePath, '/trickcal-manager/');
    console.log(JSON.stringify({ ok: true, results }, null, 2));
  } finally {
    await close(server);
  }
}

main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
