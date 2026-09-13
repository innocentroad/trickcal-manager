'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { create: createCandidate } = require('./create-public-site-candidate.js');
const { generatePublicSite } = require('./generate-public-site.js');

const helperPath = path.join(__dirname, 'validate-public-site-release-input.js');

function fixtureManifest() {
  return {
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
}

function runGit(repository, args) {
  return execFileSync('git', ['-C', repository, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function createGitFixture() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `trickcal-public-site-input-${process.pid}-`));
  const manifest = fixtureManifest();
  fs.mkdirSync(path.join(fixtureRoot, 'tools'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'tmp'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'tools', 'public-route-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(fixtureRoot, '.gitignore'), 'tmp/\n');
  fs.writeFileSync(path.join(fixtureRoot, 'index.html'), '<!doctype html><html><head></head><body><script src="app.js"></script></body></html>\n');
  fs.writeFileSync(path.join(fixtureRoot, 'app.js'), 'window.fixtureAsset = "one";\n');
  fs.writeFileSync(path.join(fixtureRoot, 'public-site-runtime.js'), 'window.fixtureRuntime = true;\n');
  fs.writeFileSync(path.join(fixtureRoot, 'service-worker.js'), [
    "const CACHE_VERSION = 'source-template';",
    "const PREVIOUS_CACHE_VERSION = '';",
    "self.addEventListener('install', event => event.waitUntil(Promise.resolve()));"
  ].join('\n') + '\n');
  runGit(fixtureRoot, ['init', '--initial-branch=main']);
  runGit(fixtureRoot, ['config', 'user.name', 'Trickcal input fixture']);
  runGit(fixtureRoot, ['config', 'user.email', 'trickcal-input@example.invalid']);
  runGit(fixtureRoot, ['add', '--all']);
  runGit(fixtureRoot, ['commit', '--quiet', '-m', 'input fixture baseline']);
  return { fixtureRoot, manifest };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeChecks(release, outputPath) {
  const checks = {
    schemaVersion: 1,
    generationCheck: true,
    manifestValidate: true,
    publicSiteTest: true,
    httpCheck: true,
    releaseId: release.releaseId,
    sourceCommit: release.sourceCommit,
    contentDigest: release.contentDigest,
    profiles: Object.fromEntries(release.profiles.map(profile => [profile.profile, profile.outputDigest]))
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(checks, null, 2)}\n`, 'utf8');
}

function createCheckedCandidate({ repoRoot, manifestPath, sourceDir, label }) {
  const releasePath = path.join(sourceDir, 'public-site-release.json');
  const buildPath = path.join(sourceDir, 'public-site-build.json');
  const release = readJson(releasePath);
  const checksPath = path.join(repoRoot, 'tmp', `input-checks-${label}.json`);
  const candidatePath = path.join(repoRoot, 'tmp', `input-candidate-${label}.json`);
  writeChecks(release, checksPath);
  const profileDigests = Object.fromEntries(release.profiles.map(profile => [profile.profile, profile.outputDigest]));
  const result = createCandidate({
    repoRoot,
    sourceDir,
    manifestPath,
    checksPath,
    expectedCommit: release.sourceCommit,
    expectedContentDigest: release.contentDigest,
    expectedProfileDigests: `new=${profileDigests.new},legacy=${profileDigests.legacy}`,
    outputPath: candidatePath
  });
  assert.equal(result.ok, true, result.errors?.join(' | '));
  return readJson(candidatePath);
}

function runInputCli({ mode, outputPath, previousReleaseId = '', previousReleaseJson = '' }) {
  return execFileSync(process.execPath, [helperPath, '--mode', mode, '--out', outputPath], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PREVIOUS_RELEASE_ID: previousReleaseId,
      PREVIOUS_RELEASE_JSON: previousReleaseJson
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function assertInputRejects(options, pattern) {
  assert.throws(
    () => runInputCli(options),
    error => error.status === 2 && pattern.test(String(error.stderr || '')),
    `入力が拒否されませんでした: ${pattern}`
  );
  assert.equal(fs.existsSync(options.outputPath), false, '拒否されたprevious recordが書き込まれました');
}

function serviceWorkerText(outputDir, release, profileName) {
  const profile = release.profiles.find(item => item.profile === profileName);
  return fs.readFileSync(path.join(outputDir, profile.serviceWorker.output), 'utf8');
}

function assertSameUpdate(localDir, freshDir, localRelease, freshRelease, localCandidate, freshCandidate, previousRelease) {
  for (const field of ['releaseId', 'sourceCommit', 'contentDigest']) {
    assert.equal(localRelease[field], freshRelease[field], `fresh ${field}が一致しません`);
  }
  assert.equal(localRelease.previousRelease.releaseId, previousRelease.releaseId);
  assert.equal(freshRelease.previousRelease.releaseId, previousRelease.releaseId);
  assert.equal(localCandidate.candidateId, freshCandidate.candidateId, 'fresh candidateIdが一致しません');
  assert.equal(localCandidate.sourceCommit, localRelease.sourceCommit);
  assert.equal(localCandidate.contentDigest, localRelease.contentDigest);
  assert.deepEqual(
    localRelease.profiles.map(profile => ({
      profile: profile.profile,
      outputDigest: profile.outputDigest,
      previousCacheVersion: profile.serviceWorker.previousCacheVersion,
      contentHash: profile.serviceWorker.contentHash
    })),
    freshRelease.profiles.map(profile => ({
      profile: profile.profile,
      outputDigest: profile.outputDigest,
      previousCacheVersion: profile.serviceWorker.previousCacheVersion,
      contentHash: profile.serviceWorker.contentHash
    }))
  );
  for (const profileName of ['new', 'legacy']) {
    assert.equal(
      serviceWorkerText(localDir, localRelease, profileName),
      serviceWorkerText(freshDir, freshRelease, profileName),
      `${profileName} Service Worker内容が一致しません`
    );
    assert.equal(
      localRelease.profiles.find(profile => profile.profile === profileName).serviceWorker.previousCacheVersion,
      previousRelease.releaseId,
      `${profileName} previousCacheVersionがprevious releaseに束縛されていません`
    );
  }
}

function testWorkflowTemplateInputWiring() {
  const templatePath = path.join(__dirname, '..', 'docs', 'templates', 'storage-p5b-source-delivery.yml');
  const template = fs.readFileSync(templatePath, 'utf8');
  for (const input of ['release_mode', 'previous_release_id', 'previous_release_json', 'source_commit', 'candidate_id', 'content_digest', 'new_output_digest', 'legacy_output_digest', 'site_repository']) {
    assert.match(template, new RegExp(`^      ${input}:`, 'm'), `source workflow input missing: ${input}`);
  }
  assert.match(template, /release_mode:[\s\S]*?type: choice[\s\S]*?- initial[\s\S]*?- update/);
  assert.match(template, /Validate release input and materialize previous record/);
  assert.match(template, /PREVIOUS_RELEASE_ID: \$\{\{ inputs\.previous_release_id \}\}/);
  assert.match(template, /PREVIOUS_RELEASE_JSON: \$\{\{ inputs\.previous_release_json \}\}/);
  assert.match(template, /validate-public-site-release-input\.js[\s\S]*--mode "\$RELEASE_MODE"/);
  assert.match(template, /previous_args=\(\)[\s\S]*--previous-release source\/tmp\/previous-public-site-release\.json/);
  assert.equal((template.match(/inputs\.previous_release_json/g) || []).length, 1, 'previous JSONがshell本文へ直接展開されています');
}

function testInitialAndUpdateReproduceInFreshEnvironment() {
  const { fixtureRoot, manifest } = createGitFixture();
  const manifestPath = path.join(fixtureRoot, 'tools', 'public-route-manifest.json');
  const initialOutput = path.join(fixtureRoot, 'tmp', 'public-site-initial');
  const initialInputPath = path.join(fixtureRoot, 'tmp', 'previous-public-site-release-initial.json');
  const localOutput = path.join(fixtureRoot, 'tmp', 'public-site-update-local');
  const localInputPath = path.join(fixtureRoot, 'tmp', 'previous-public-site-release-update.json');
  const freshRoot = fs.mkdtempSync(path.join(os.tmpdir(), `trickcal-public-site-fresh-${process.pid}-`));
  try {
    runInputCli({ mode: 'initial', outputPath: initialInputPath });
    assert.equal(fs.existsSync(initialInputPath), false, '初回inputがprevious recordを生成しました');
    generatePublicSite(manifest, { repoRoot: fixtureRoot, outputDir: initialOutput, write: true });
    const initialRelease = readJson(path.join(initialOutput, 'public-site-release.json'));
    const initialHead = runGit(fixtureRoot, ['rev-parse', 'HEAD']).trim();
    assert.equal(initialRelease.sourceCommit, initialHead);
    assert.equal(initialRelease.previousRelease, null);
    const initialCandidate = createCheckedCandidate({
      repoRoot: fixtureRoot,
      manifestPath,
      sourceDir: initialOutput,
      label: 'initial'
    });
    assert.equal(initialCandidate.sourceCommit, initialHead);
    assert.equal(initialCandidate.contentDigest, initialRelease.contentDigest);

    const previousRelease = JSON.parse(JSON.stringify(initialRelease));
    previousRelease.status = 'published';
    previousRelease.dirty = false;
    const previousReleaseJson = JSON.stringify(previousRelease);
    assertInputRejects({
      mode: 'update',
      outputPath: path.join(fixtureRoot, 'tmp', 'previous-local-only.json'),
      previousReleaseId: initialRelease.releaseId,
      previousReleaseJson: JSON.stringify(initialRelease)
    }, /成功配信済み/);
    assertInputRejects({
      mode: 'update',
      outputPath: path.join(fixtureRoot, 'tmp', 'previous-missing.json'),
      previousReleaseId: initialRelease.releaseId
    }, /previous_release_jsonが必須/);
    assertInputRejects({
      mode: 'update',
      outputPath: path.join(fixtureRoot, 'tmp', 'previous-different.json'),
      previousReleaseId: '0'.repeat(16),
      previousReleaseJson
    }, /releaseIdが不一致/);

    runInputCli({
      mode: 'update',
      outputPath: localInputPath,
      previousReleaseId: initialRelease.releaseId,
      previousReleaseJson
    });
    const materializedPrevious = readJson(localInputPath);
    assert.equal(materializedPrevious.status, 'published');
    assert.equal(materializedPrevious.dirty, false);
    assert.equal(materializedPrevious.releaseId, initialRelease.releaseId);
    assert.equal(materializedPrevious.assets, undefined, 'previous inputが巨大なlocal asset台帳を保持しています');

    fs.appendFileSync(path.join(fixtureRoot, 'app.js'), 'window.fixtureAsset = "two";\n');
    runGit(fixtureRoot, ['add', 'app.js']);
    runGit(fixtureRoot, ['commit', '--quiet', '-m', 'input fixture update']);
    const updateHead = runGit(fixtureRoot, ['rev-parse', 'HEAD']).trim();
    generatePublicSite(manifest, {
      repoRoot: fixtureRoot,
      outputDir: localOutput,
      write: true,
      previousReleasePath: localInputPath
    });
    const localRelease = readJson(path.join(localOutput, 'public-site-release.json'));
    const localCandidate = createCheckedCandidate({
      repoRoot: fixtureRoot,
      manifestPath,
      sourceDir: localOutput,
      label: 'update-local'
    });
    assert.equal(localRelease.sourceCommit, updateHead);
    assert.equal(localCandidate.sourceCommit, updateHead);

    fs.cpSync(fixtureRoot, freshRoot, { recursive: true, force: true });
    fs.rmSync(path.join(freshRoot, 'tmp'), { recursive: true, force: true });
    fs.mkdirSync(path.join(freshRoot, 'tmp'), { recursive: true });
    const freshManifest = readJson(path.join(freshRoot, 'tools', 'public-route-manifest.json'));
    const freshManifestPath = path.join(freshRoot, 'tools', 'public-route-manifest.json');
    const freshInputPath = path.join(freshRoot, 'tmp', 'previous-public-site-release-update.json');
    const freshOutput = path.join(freshRoot, 'tmp', 'public-site-update-fresh');
    runInputCli({
      mode: 'update',
      outputPath: freshInputPath,
      previousReleaseId: initialRelease.releaseId,
      previousReleaseJson
    });
    generatePublicSite(freshManifest, {
      repoRoot: freshRoot,
      outputDir: freshOutput,
      write: true,
      previousReleasePath: freshInputPath
    });
    const freshRelease = readJson(path.join(freshOutput, 'public-site-release.json'));
    const freshCandidate = createCheckedCandidate({
      repoRoot: freshRoot,
      manifestPath: freshManifestPath,
      sourceDir: freshOutput,
      label: 'update-fresh'
    });
    assert.equal(runGit(freshRoot, ['rev-parse', 'HEAD']).trim(), updateHead);
    assert.equal(runGit(freshRoot, ['status', '--porcelain', '--untracked-files=all']).trim(), '');
    assertSameUpdate(localOutput, freshOutput, localRelease, freshRelease, localCandidate, freshCandidate, previousRelease);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
    fs.rmSync(freshRoot, { recursive: true, force: true });
  }
}

function main() {
  testWorkflowTemplateInputWiring();
  testInitialAndUpdateReproduceInFreshEnvironment();
  console.log('public site release input tests passed: explicit initial/update input, previous-success validation, fresh output and candidate reproduction');
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
}
