'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const {
  buildPlan,
  checkPublicSite,
  directoryDigest,
  generatePublicSite,
  readManifest,
  validateManifest
} = require('./generate-public-site.js');
const { readGitState } = require('./public-site-candidate.js');


function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectInvalid(manifest, repoRoot, mutator, pattern) {
  const candidate = clone(manifest);
  mutator(candidate);
  const result = validateManifest(candidate, { repoRoot });
  assert.strictEqual(result.ok, false);
  assert(result.errors.some(error => pattern.test(error)), `${pattern} not found in ${result.errors.join(' | ')}`);
}

function outputFiles(directory) {
  const result = [];
  function visit(current, relative) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const next = relative ? path.join(relative, entry.name) : entry.name;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full, next);
      else result.push(next.replaceAll('\\', '/'));
    }
  }
  visit(directory, '');
  return result;
}

function readOutputText(directory, relativePath) {
  return fs.readFileSync(path.join(directory, relativePath), 'utf8');
}

function canonicalHref(html) {
  const tags = (html.match(/<link\b[^>]*>/gi) || [])
    .filter(tag => /\brel=["'][^"']*\bcanonical\b[^"']*["']/i.test(tag));
  assert.strictEqual(tags.length, 1, 'generated indexable page has exactly one canonical link');
  return tags[0].match(/\bhref=["']([^"']+)["']/i)?.[1] || '';
}

function metaContent(html, property) {
  const tag = (html.match(/<meta\b[^>]*>/gi) || [])
    .find(item => new RegExp(`\\bproperty=["']${property}["']`, 'i').test(item));
  return tag?.match(/\bcontent=["']([^"']*)["']/i)?.[1] || '';
}

function assertCanonicalProfileOutputs(testOutput, plan, manifest) {
  const indexableRoutes = manifest.routes.filter(route => route.indexable === true);
  assert.deepStrictEqual(indexableRoutes.map(route => route.id), ['manager', 'calc', 'share', 'data']);
  for (const route of indexableRoutes) {
    assert.strictEqual(route.seo?.canonicalProfile, 'new', `${route.id} declares the new canonical profile`);
    const canonicalUrl = `${manifest.profiles.new.origin}${route.profiles.new.publicPath}`;
    for (const profileName of ['new', 'legacy']) {
      const profile = manifest.profiles[profileName];
      const profileRoute = route.profiles[profileName];
      const pageUrl = `${profile.origin}${profileRoute.publicPath}`;
      const pageEntry = plan.entries.find(entry => entry.type === 'route'
        && entry.role === 'canonical'
        && entry.profile === profileName
        && entry.routeId === route.id);
      assert(pageEntry, `${profileName}:${route.id} has a generated page`);
      const html = readOutputText(testOutput, pageEntry.outputRel);
      assert.strictEqual(canonicalHref(html), canonicalUrl, `${profileName}:${route.id} canonical maps to new profile`);
      const parsedCanonical = new URL(canonicalHref(html));
      assert.strictEqual(parsedCanonical.search, '', `${profileName}:${route.id} canonical omits query`);
      assert.strictEqual(parsedCanonical.hash, '', `${profileName}:${route.id} canonical omits hash`);
      assert.strictEqual(metaContent(html, 'og:url'), pageUrl, `${profileName}:${route.id} og:url stays profile-specific`);

      for (const aliasPath of profileRoute.aliases.filter(alias => alias.endsWith('/index.html'))) {
        assert.strictEqual(
          plan.publicPaths.get(`${profileName}:${aliasPath}`),
          pageEntry,
          `${profileName}:${route.id} content index alias shares its canonical page`
        );
      }

      for (const aliasPath of profileRoute.aliases) {
        const aliasEntry = plan.publicPaths.get(`${profileName}:${aliasPath}`);
        if (aliasEntry === pageEntry) continue;
        assert(aliasEntry?.type === 'alias', `${profileName}:${route.id} compatibility alias is a redirect`);
        const redirect = readOutputText(testOutput, aliasEntry.outputRel);
        assert(redirect.includes(`const target = ${JSON.stringify(profileRoute.publicPath)}`), `${profileName}:${route.id} alias redirects within its profile`);
        assert(redirect.includes("location.search || ''") && redirect.includes("location.hash || ''"), `${profileName}:${route.id} alias preserves query/hash`);
      }

      if (route.id === 'manager' || route.id === 'calc') {
        const jsonLd = html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
        assert(jsonLd, `${profileName}:${route.id} keeps structured data`);
        assert.strictEqual(JSON.parse(jsonLd[1]).url, pageUrl, `${profileName}:${route.id} structured-data URL stays profile-specific`);
      }
    }
  }

  const sitemap = readOutputText(testOutput, 'sitemap.xml');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepStrictEqual(locations, indexableRoutes.map(route => `${manifest.profiles.new.origin}${route.profiles.new.publicPath}`));
  assert(!sitemap.includes(manifest.profiles.legacy.origin), 'sitemap excludes legacy origin');
  assert(locations.every(location => !/(?:index\.html|\?|#)/.test(location)), 'sitemap locations exclude aliases and query/hash');
  assert(!sitemap.includes('<lastmod>'), 'sitemap does not invent lastmod');
  const robots = readOutputText(testOutput, 'robots.txt');
  assert.strictEqual((robots.match(/^Sitemap:/gm) || []).length, 1);
  assert(robots.includes(`Sitemap: ${manifest.profiles.new.origin}/sitemap.xml`));
  assert(!robots.includes(manifest.profiles.legacy.origin), 'new robots sitemap points only to new origin');
  assert(!outputFiles(testOutput).some(file => file.startsWith('trickcal-manager/') && /(?:^|\/)(?:sitemap\.xml|robots\.txt)$/.test(file)), 'new-only sitemap and robots assets are not emitted into legacy profile');
}

function sha256File(directory, relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, relativePath))).digest('hex');
}

function testReleaseVersioning(repoRoot) {
  const fixtureRoot = path.join(repoRoot, 'tmp', `public-site-release-fixture-${process.pid}`);
  const outputOne = path.join(fixtureRoot, 'tmp', 'release-one');
  const outputTwo = path.join(fixtureRoot, 'tmp', 'release-two');
  const fixtureManifest = {
    schemaVersion: 1,
    profiles: {
      new: {
        origin: 'https://new.example.test',
        basePath: '/',
        assetBasePath: '/',
        serviceWorker: { script: 'service-worker.js', scope: '/' }
      },
      legacy: {
        origin: 'https://legacy.example.test',
        basePath: '/trickcal-manager/',
        assetBasePath: '/trickcal-manager/',
        serviceWorker: { script: 'service-worker.js', scope: '/trickcal-manager/' }
      }
    },
    assetConfig: { policy: 'manifest-only', versionQuery: 'v', outputMode: 'profile-base' },
    serviceWorker: {
      source: 'service-worker.js',
      cacheName: 'fixture-manager',
      navigationStrategy: 'network-first',
      assetStrategy: 'stale-while-revalidate',
      excludedPathPrefixes: []
    },
    reservedPaths: { new: [], legacy: [] },
    routes: [{
      id: 'fixture',
      source: 'index.html',
      indexable: false,
      profiles: {
        new: { publicPath: '/manager/', kind: 'static-page', aliases: ['/manager/index.html'] },
        legacy: { publicPath: '/trickcal-manager/', kind: 'static-page', aliases: ['/trickcal-manager/index.html'] }
      },
      fixtures: []
    }],
    assets: [
      { source: 'service-worker.js', kind: 'file', profiles: ['new', 'legacy'] },
      { source: 'app.js', kind: 'file', profiles: ['new', 'legacy'] },
      { source: 'public-site-runtime.js', kind: 'file', profiles: ['new', 'legacy'] }
    ]
  };
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
  fs.mkdirSync(path.join(fixtureRoot, 'tmp'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'index.html'), '<!doctype html><html><head></head><body><script src="app.js"></script></body></html>\n');
  fs.writeFileSync(path.join(fixtureRoot, 'app.js'), 'window.fixtureAsset = "one";\n');
  fs.writeFileSync(path.join(fixtureRoot, 'public-site-runtime.js'), 'window.fixtureRuntime = true;\n');
  fs.writeFileSync(path.join(fixtureRoot, 'service-worker.js'), [
    "const CACHE_VERSION = 'source-template';",
    "const PREVIOUS_CACHE_VERSION = '';",
    "self.addEventListener('install', event => event.waitUntil(Promise.resolve()));"
  ].join('\n') + '\n');
  try {
    const first = generatePublicSite(fixtureManifest, { repoRoot: fixtureRoot, outputDir: outputOne, write: true });
    const firstRecord = JSON.parse(readOutputText(outputOne, 'public-site-release.json'));
    assert.match(first.releaseId, /^[0-9a-f]{16}$/);
    assert.strictEqual(firstRecord.previousRelease, null, '初回releaseにpreviousが設定されています');
    assert.strictEqual(firstRecord.releaseId, first.releaseId);
    assert.match(firstRecord.releaseInputDigest, /^[0-9a-f]{64}$/);
    assert(firstRecord.sourceVersions.some(version => version.path === 'app.js'));
    assert.strictEqual(firstRecord.profiles[0].serviceWorker.cacheVersion, first.releaseId);
    assert.strictEqual(firstRecord.profiles[0].serviceWorker.previousCacheVersion, null);
    assert.strictEqual(
      firstRecord.profiles[0].serviceWorker.contentHash,
      sha256File(outputOne, firstRecord.profiles[0].serviceWorker.output)
    );
    const firstDigest = directoryDigest(outputOne, { exclude: ['public-site-build.json', 'public-site-release.json'] });

    const repeated = generatePublicSite(fixtureManifest, { repoRoot: fixtureRoot, outputDir: outputOne, write: true });
    assert.strictEqual(repeated.releaseId, first.releaseId, '同一入力のrelease IDが不安定です');
    assert.strictEqual(
      directoryDigest(outputOne, { exclude: ['public-site-build.json', 'public-site-release.json'] }),
      firstDigest,
      '同一入力の生成SW／成果物が不安定です'
    );
    assert.strictEqual(checkPublicSite(fixtureManifest, { repoRoot: fixtureRoot, outputDir: outputOne }).ok, true);

    fs.appendFileSync(path.join(fixtureRoot, 'app.js'), 'window.fixtureAsset = "two";\n');
    const second = generatePublicSite(fixtureManifest, {
      repoRoot: fixtureRoot,
      outputDir: outputTwo,
      write: true,
      previousRelease: firstRecord
    });
    const secondRecord = JSON.parse(readOutputText(outputTwo, 'public-site-release.json'));
    assert.notStrictEqual(second.releaseId, first.releaseId, '資材変更でrelease IDが変わりません');
    assert.strictEqual(secondRecord.previousRelease.releaseId, first.releaseId);
    assert.strictEqual(secondRecord.profiles[0].serviceWorker.previousCacheVersion, first.releaseId);
    assert.strictEqual(secondRecord.profiles[0].serviceWorker.cacheVersion, second.releaseId);
    assert.notStrictEqual(
      readOutputText(outputOne, 'service-worker.js'),
      readOutputText(outputTwo, 'service-worker.js'),
      '資材変更で生成SWが変わりません'
    );
    assert.strictEqual(
      secondRecord.profiles[0].serviceWorker.contentHash,
      sha256File(outputTwo, secondRecord.profiles[0].serviceWorker.output)
    );
    const repeatedSecond = generatePublicSite(fixtureManifest, { repoRoot: fixtureRoot, outputDir: outputTwo, write: true });
    assert.strictEqual(repeatedSecond.releaseId, second.releaseId, '更新後の同一入力が不安定です');
    assert.strictEqual(checkPublicSite(fixtureManifest, { repoRoot: fixtureRoot, outputDir: outputTwo }).ok, true);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function testRuntimeApi(repoRoot) {
  const sandbox = {
    URL,
    window: {
      location: { pathname: '/manager/', origin: 'http://localhost:8765', href: 'http://localhost:8765/manager/' },
      TRICKCAL_PUBLIC_SITE_CONFIG: {
        profile: 'new',
        basePath: '/',
        assetBasePath: '/',
        assetVersion: 'asset-test-1',
        routes: { share: '/share/', manager: '/manager/' },
        peerRoutes: { transfer: '/transfer/' },
        serviceWorker: { script: 'service-worker.js', scope: '/' }
      }
    },
    document: { documentElement: {} },
    MutationObserver: undefined
  };
  vm.runInNewContext(readOutputText(repoRoot, 'public-site-runtime.js'), sandbox);
  const publicSite = sandbox.window.TRICKCAL_PUBLIC_SITE;
  assert.strictEqual(publicSite.pageUrl('share', '?payload=fixture', '#keep'), '/share/?payload=fixture#keep');
  assert.strictEqual(publicSite.peerPageUrl('transfer', 'https://trickcal.irlab.dev'), 'https://trickcal.irlab.dev/transfer/');
  assert.strictEqual(publicSite.assetUrl('img/Chara/test.webp'), '/img/Chara/test.webp?v=asset-test-1');
  assert.strictEqual(publicSite.assetUrl('service-worker.js', { versioned: false }), '/service-worker.js');
  assert.throws(() => publicSite.assetUrl('../img/test.webp'), /manifest-relative/);
}

function run(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || path.join(__dirname, '..'));
  const manifest = options.manifest || readManifest(path.join(repoRoot, 'tools', 'public-route-manifest.json'));
  const syncPlan = require(path.join(repoRoot, 'tools', 'sync-formation-share-assets.js')).buildSyncPlan();
  assert.deepStrictEqual(syncPlan.changedFiles, [], '既存共有資材同期の依存版が古いままです');
  const validation = validateManifest(manifest, { repoRoot });
  assert.strictEqual(validation.ok, true, validation.errors.join('\n'));
  const plan = buildPlan(manifest, { repoRoot, outputDir: path.join(repoRoot, 'tmp', 'public-site-test') });
  const ownershipFile = 'google4e94c2b3cb5b1c67.html';
  const ownershipAsset = manifest.assets.find(asset => asset.source === ownershipFile);
  assert.deepStrictEqual(ownershipAsset, { source: ownershipFile, kind: 'file', profiles: ['new'] });
  assert(!manifest.routes.some(route => route.source === ownershipFile), 'ownership file is an explicit asset, not a route');
  const ownershipEntries = plan.entries
    .filter(entry => entry.type === 'asset' && entry.source === ownershipFile)
    .map(({ profile, outputRel }) => ({ profile, outputRel }));
  assert.deepStrictEqual(ownershipEntries, [{ profile: 'new', outputRel: ownershipFile }]);
  const manager = plan.entries.find(entry => entry.profile === 'new' && entry.routeId === 'manager' && entry.role === 'canonical');
  const managerIndex = plan.publicPaths.get('new:/manager/index.html');
  assert(manager && manager.outputRel === 'manager/index.html');
  assert.strictEqual(managerIndex, manager, 'canonical route and index alias must share one output');
  assert(plan.entries.some(entry => entry.profile === 'legacy' && entry.outputRel === 'trickcal-manager/stat-dashboard.html'));
  assert(plan.entries.some(entry => entry.profile === 'new' && entry.outputRel === 'data/index.html'));
  assert(plan.entries.some(entry => entry.profile === 'new' && entry.outputRel === 'transfer/index.html'));

  expectInvalid(manifest, repoRoot, candidate => { candidate.unexpected = true; }, /未知のフィールド/);
  expectInvalid(manifest, repoRoot, candidate => { candidate.routes[0].source = 'index.html'; }, /sourceまたはgenerator/);
  expectInvalid(manifest, repoRoot, candidate => { candidate.routes[0].profiles.new.targetRouteId = 'home'; }, /self redirect/);
  expectInvalid(manifest, repoRoot, candidate => { candidate.routes[0].profiles.new.aliases.push('/manager/'); }, /route\/alias pathが衝突|reserved path/);
  expectInvalid(manifest, repoRoot, candidate => { candidate.reservedPaths.new.push('/manager/'); }, /reserved path/);
  expectInvalid(manifest, repoRoot, candidate => { candidate.routes[1].profiles.new.aliases.push('/formation-damage-calc.html'); }, /route\/alias pathが衝突|assetとroute/);
  expectInvalid(manifest, repoRoot, candidate => { candidate.routes.find(route => route.id === 'manager').seo.canonicalProfile = 'unknown'; }, /canonicalProfileは既知のprofile/);
  expectInvalid(manifest, repoRoot, candidate => {
    const route = candidate.routes.find(item => item.id === 'manager');
    route.seo.canonicalProfile = 'legacy';
    delete route.profiles.legacy;
  }, /canonicalProfileのroute profileがありません: manager\.legacy/);

  const reuseGenerated = !!options.sourceDir;
  const testOutput = options.sourceDir || path.join(repoRoot, 'tmp', 'public-site-test');
  if (!reuseGenerated) fs.rmSync(testOutput, { recursive: true, force: true });
  try {
    const generated = reuseGenerated
      ? { outputDigest: directoryDigest(testOutput), assetVersion: JSON.parse(readOutputText(testOutput, 'public-site-build.json')).assetVersion }
      : generatePublicSite(manifest, { repoRoot, outputDir: testOutput, write: true });
    assert(generated.outputDigest);
    assertCanonicalProfileOutputs(testOutput, plan, manifest);
    const files = outputFiles(testOutput);
    const ownershipSourceBytes = fs.readFileSync(path.join(repoRoot, ownershipFile));
    const ownershipOutputBytes = fs.readFileSync(path.join(testOutput, ownershipFile));
    assert.deepStrictEqual(ownershipOutputBytes, ownershipSourceBytes, 'new profile preserves the ownership file byte-for-byte');
    assert(!files.includes(`trickcal-manager/${ownershipFile}`), 'legacy profile excludes the ownership verification file');
    assert(!readOutputText(testOutput, 'sitemap.xml').includes(ownershipFile), 'ownership file is not added to the sitemap');
    for (const expected of [
      'index.html',
      'manager/index.html',
      'calc/index.html',
      'share/index.html',
      'data/index.html',
      'data/apostles/index.html',
      'data/enemies/index.html',
      'data/boards/index.html',
      'transfer/index.html',
      'recovery/index.html',
      'trickcal-manager/index.html',
      'trickcal-manager/stat-dashboard.html',
      'trickcal-manager/public/board-layout-preview.html',
      'public-site-build.json'
    ]) assert(files.includes(expected), `missing generated file: ${expected}`);
    assert(!files.some(file => /(?:^|\/)(?:docs|tools|backups|outputs|tests?)(?:\/|$)|(?:\.xlsx$|\.env(?:\.|$)|secret)/i.test(file)));
    assert(files.includes('public-site-release.json'));
    const homeRedirect = readOutputText(testOutput, 'index.html');
    const managerAlias = readOutputText(testOutput, 'stat-dashboard.html');
    assert(homeRedirect.includes("location.search || ''") && homeRedirect.includes("location.hash || ''"));
    assert(!homeRedirect.includes('http-equiv="refresh"'));
    assert(managerAlias.includes('const target = "/manager/"'));
    assert(managerAlias.includes("location.search || ''") && managerAlias.includes("location.hash || ''"));
    assert(!readOutputText(testOutput, 'trickcal-manager/stat-dashboard.html').includes('http-equiv="refresh"'), 'legacy manager remains a usable page rather than a forced redirect');
    const release = JSON.parse(readOutputText(testOutput, 'public-site-release.json'));
    assert(/^[0-9a-f]{40}$/.test(release.sourceCommit));
    const releaseGitState = readGitState(repoRoot);
    assert.strictEqual(release.dirty, releaseGitState.available ? releaseGitState.dirty : true);
    assert.deepStrictEqual(release.dependencyOrder, [
      'profile-layout', 'direct-assets', 'share-page', 'share-create', 'app-cache', 'final-html', 'release-record'
    ]);
    assert(release.profiles.every(profile => profile.routeVersion && profile.assetVersion && profile.assetsDigest));

    const assetVersion = generated.assetVersion;
    const managerHtml = readOutputText(testOutput, 'manager/index.html');
    const legacyHtml = readOutputText(testOutput, 'trickcal-manager/stat-dashboard.html');
    const dataHtml = readOutputText(testOutput, 'data/index.html');
    const legacyDataHtml = readOutputText(testOutput, 'trickcal-manager/data/index.html');
    const apostleDataHtml = readOutputText(testOutput, 'data/apostles/index.html');
    const legacyApostleDataHtml = readOutputText(testOutput, 'trickcal-manager/public/apostle-data.html');
    const shareHtml = readOutputText(testOutput, 'share/index.html');
    const generatedOrdinaryPages = [
      'manager/index.html',
      'calc/index.html',
      'calc/dps/index.html',
      'data/index.html',
      'data/apostles/index.html',
      'data/enemies/index.html',
      'data/boards/index.html',
      'share/index.html',
      'trickcal-manager/manager/index.html',
      'trickcal-manager/stat-dashboard.html',
      'trickcal-manager/formation-damage-calc.html',
      'trickcal-manager/formation-damage-dps-prototype.html',
      'trickcal-manager/formation-share.html',
      'trickcal-manager/data/index.html',
      'trickcal-manager/enemy-status.html',
      'trickcal-manager/public/apostle-data.html',
      'trickcal-manager/public/board-layout-preview.html'
    ];
    generatedOrdinaryPages.forEach(file => {
      assert(!readOutputText(testOutput, file).includes('recover=20260912'), `${file}の通常routeに復旧queryが残っています`);
    });
    assert(managerHtml.includes('href="/calc/"'));
    assert(managerHtml.includes('href="/data/boards/"'));
    assert(managerHtml.includes(`src="/public-site-runtime.js?v=${assetVersion}"`));
    assert(managerHtml.includes(`src="/statData.js?v=${assetVersion}"`));
    assert(managerHtml.includes(`src="/shared-topbar.js?v=${assetVersion}"`));
    assert(managerHtml.includes('data-shared-topbar-page="manager"'));
    assert(dataHtml.includes(`src="/shared-topbar.js?v=${assetVersion}"`));
    assert(dataHtml.includes(`src="/announcements.js?v=${assetVersion}"`));
    assert(dataHtml.includes(`src="/announcement-history-data.js?v=${assetVersion}"`), 'new data入口がprofile版付き履歴dataを読む');
    assert(legacyDataHtml.includes(`src="/trickcal-manager/announcement-history-data.js?v=${assetVersion}"`), 'legacy data入口がbase付き履歴dataを読む');
    const assertStorageScripts = (html, prefix, name) => {
      const tags = ['storage-registry.js', 'storage-runtime.js', 'storage-bootstrap.js']
        .map(asset => `<script src="${prefix}${asset}?v=${assetVersion}"></script>`);
      assert(tags.every(tag => html.includes(tag)), `${name}がprofile-awareなstorage script一式を含みます`);
      assert(tags.map(tag => html.indexOf(tag)).every((position, index, positions) => index === 0 || positions[index - 1] < position), `${name}のregistry/runtime/bootstrap順が正しい`);
      assert(html.includes('data-storage-boot-mode="optional"'), `${name}のstorage boot失敗時も読取専用画面を維持します`);
    };
    assertStorageScripts(dataHtml, '/', 'new data入口');
    assertStorageScripts(legacyDataHtml, '/trickcal-manager/', 'legacy data入口');
    assertStorageScripts(shareHtml, '/', 'new共有ページ');
    assertStorageScripts(readOutputText(testOutput, 'trickcal-manager/formation-share.html'), '/trickcal-manager/', 'legacy共有ページ');
    assertStorageScripts(apostleDataHtml, '/', 'new使徒データ');
    assertStorageScripts(legacyApostleDataHtml, '/trickcal-manager/', 'legacy使徒データ');
    assert(files.includes('announcement-history-data.js'));
    assert(files.includes('trickcal-manager/announcement-history-data.js'));
    assert(dataHtml.includes('data-shared-topbar-page="data"'));
    assert(dataHtml.includes('data-shared-topbar-data-href="./"'));
    assert(!dataHtml.includes('class="topbar-page-row"'), 'data生成物へ旧ページ固有上バー行を残しません');
    assert(dataHtml.includes('href="/data/enemies/"'), 'data本文の敵導線を生成元から維持します');
    assert(dataHtml.includes('href="/data/boards/"'), 'data本文のボード導線を生成元から維持します');
    assert(readOutputText(testOutput, 'calc/index.html').includes('href="/data/enemies/"'));
    assert(readOutputText(testOutput, 'trickcal-manager/formation-damage-calc.html').includes('href="/trickcal-manager/enemy-status.html"'));
    assert(!managerHtml.includes('href="formation-damage-calc.html'));
    assert(shareHtml.includes(`href="/shared-topbar.css?v=${assetVersion}"`));
    assert(shareHtml.includes(`href="/announcements.css?v=${assetVersion}"`));
    assert(shareHtml.includes(`src="/shared-topbar.js?v=${assetVersion}"`));
    assert(shareHtml.includes(`src="/announcements.js?v=${assetVersion}"`));
    assert(shareHtml.includes('data-shared-topbar-page="share"'));
    assert(!shareHtml.includes('class="share-topbar"'), '共有ページへ旧共有専用上バーを残しません');
    assert.match(shareHtml, /<link rel="canonical" href="https:\/\/trickcal\.irlab\.dev\/share\/">\n\s*<meta property="og:url" content="https:\/\/trickcal\.irlab\.dev\/share\/">/);
    assert.doesNotMatch(shareHtml, /\\n\s*<meta property="og:url"/, 'canonical metadataの改行がliteral\\nになっています');
    assert(legacyHtml.includes('href="/trickcal-manager/formation-damage-calc.html"'));
    const legacyHtmlWithoutCanonical = legacyHtml.replace(/<link\b(?=[^>]*\brel=["'][^"']*\bcanonical\b[^"']*["'])[^>]*>/i, '');
    assert(!legacyHtmlWithoutCanonical.includes(manifest.profiles.new.origin), 'legacy ordinary links, assets, OG, and structured data do not inherit canonical origin');
    assert(legacyHtml.includes('href="/trickcal-manager/storage-recovery.html"'), 'legacy manager retains the legacy recovery entry');
    assert(legacyHtml.includes('id="backup-export"') && legacyHtml.includes('id="backup-import"'), 'legacy manager retains backup controls');
    const appCache = readOutputText(testOutput, 'app-cache.js');
    assert(appCache.includes("publicSite.assetUrl?.(publicSite.serviceWorker.script, { versioned: false })"));
    const shareCreate = readOutputText(testOutput, 'formation-share-create.js');
    assert(shareCreate.includes("pageUrl?.('share')"));
    assert(!shareCreate.includes("searchParams.set('v'"));
    assert(readOutputText(testOutput, 'formation-damage-dps-prototype.js').includes("assetUrl?.('dps-simulator-worker.js')"));
    assert(readOutputText(testOutput, 'dps-simulator-worker.js').includes("new URL('dps-simulator.js'"));
    assert(readOutputText(testOutput, 'public/board-layout-preview.js').includes("boardAssetPath('img/Board/Tile_gate.webp')"));
    const serviceWorker = readOutputText(testOutput, 'service-worker.js');
    assert(!serviceWorker.includes('clients.claim'));
    const installPart = serviceWorker.slice(serviceWorker.indexOf("addEventListener('install'"), serviceWorker.indexOf("addEventListener('activate'"));
    assert(!installPart.includes('skipWaiting'));
    assert(serviceWorker.includes('EXCLUDED_PATH_PREFIXES'));
    assert(!serviceWorker.includes('const CACHE_PREFIX'));
    assert(managerHtml.includes('location.pathname'));
    assert(readOutputText(testOutput, 'calc/index.html').includes('"/calc/index.html"'));
    assert(readOutputText(testOutput, 'calc/index.html').includes('location.replace("/calc/"'));
    testRuntimeApi(repoRoot);
    if (!reuseGenerated) {
      const checked = checkPublicSite(manifest, { repoRoot, outputDir: testOutput });
      assert.strictEqual(checked.ok, true);
    }
  } finally {
    if (!reuseGenerated) fs.rmSync(testOutput, { recursive: true, force: true });
  }
  testReleaseVersioning(repoRoot);
  return { schema: true, routes: true, aliases: true, targets: true, collisionGuards: true, explicitOutput: true, ownershipAsset: true, releaseVersioning: true };
}

if (require.main === module) console.log('public site tests passed: ' + JSON.stringify(run()));

module.exports = { run };
