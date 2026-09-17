'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { create: createCandidate } = require('./create-public-site-candidate.js');
const { generatePublicSite } = require('./generate-public-site.js');
const { readGitState } = require('./public-site-candidate.js');
const { run: recordPublicSiteChecks } = require('./record-public-site-checks.js');
const { stageRelease } = require('./prepare-public-site-staging.js');

const repoRoot = path.resolve(__dirname, '..');
const tmpRoot = path.join(repoRoot, 'tmp');
const sourceDir = path.join(tmpRoot, 'public-site');
const releasePath = path.join(sourceDir, 'public-site-release.json');
const buildPath = path.join(sourceDir, 'public-site-build.json');
const checksPath = path.join(tmpRoot, 'public-site-u3-checks.json');

function stageOptions(outputDir, overrides = {}) {
  return {
    sourceDir,
    outputDir,
    releasePath,
    buildPath,
    checksPath,
    expectedCommit: 'e22f99d7a1c39eb093430944fb2e9314a0097215',
    expectedContentDigest: '3cd62b1bc1596be7b88b3f714db5f6f6933e95406dec65c9de517133b2935469',
    expectedProfileDigests: 'new=be85e7ddbae8722e,legacy=3f56dd68eeafcb9f',
    ...overrides
  };
}

function assertBoundaryRejects(outputDir, pattern) {
  let removeCalls = 0;
  let copyCalls = 0;
  const originalRemove = fs.rmSync;
  const originalCopy = fs.copyFileSync;
  fs.rmSync = (...args) => {
    removeCalls += 1;
    return originalRemove(...args);
  };
  fs.copyFileSync = (...args) => {
    copyCalls += 1;
    return originalCopy(...args);
  };
  try {
    assert.throws(() => stageRelease(stageOptions(outputDir)), pattern);
    assert.equal(removeCalls, 0, `boundary rejection called rmSync: ${outputDir}`);
    assert.equal(copyCalls, 0, `boundary rejection called copyFileSync: ${outputDir}`);
  } finally {
    fs.rmSync = originalRemove;
    fs.copyFileSync = originalCopy;
  }
}

function testOutputBoundaries() {
  assertBoundaryRejects(tmpRoot, /tmp自身/);
  assertBoundaryRejects(sourceDir, /同じ／親／子/);
  assertBoundaryRejects(path.join(sourceDir, 'nested'), /tmp直下|同じ／親／子/);
  assertBoundaryRejects(path.join(tmpRoot, 'unrelated-output'), /専用staging名/);

  const conflictDir = path.join(tmpRoot, 'public-site-staging-c1-input-conflict');
  fs.rmSync(conflictDir, { recursive: true, force: true });
  fs.mkdirSync(conflictDir, { recursive: true });
  const conflictPath = path.join(conflictDir, 'staging-report.json');
  fs.writeFileSync(conflictPath, 'input must survive\n', 'utf8');
  const before = fs.readFileSync(conflictPath, 'utf8');
  let removeCalls = 0;
  let copyCalls = 0;
  const originalRemove = fs.rmSync;
  const originalCopy = fs.copyFileSync;
  fs.rmSync = (...args) => {
    removeCalls += 1;
    return originalRemove(...args);
  };
  fs.copyFileSync = (...args) => {
    copyCalls += 1;
    return originalCopy(...args);
  };
  try {
    assert.throws(() => stageRelease(stageOptions(conflictDir, { checksPath: conflictPath })), /out配下の入力/);
    assert.equal(removeCalls, 0);
    assert.equal(copyCalls, 0);
    assert.equal(fs.readFileSync(conflictPath, 'utf8'), before);
  } finally {
    fs.rmSync = originalRemove;
    fs.copyFileSync = originalCopy;
    fs.rmSync(conflictDir, { recursive: true, force: true });
  }
}

function testNormalStagingAndBoundChecks() {
  const normalDir = path.join(tmpRoot, 'public-site-staging-c1-normal');
  const missingDir = path.join(tmpRoot, 'public-site-staging-c1-missing');
  const mismatchDir = path.join(tmpRoot, 'public-site-staging-c1-mismatch');
  const mismatchChecks = path.join(tmpRoot, 'public-site-checks-c1-mismatch.json');
  fs.rmSync(normalDir, { recursive: true, force: true });
  fs.rmSync(missingDir, { recursive: true, force: true });
  fs.rmSync(mismatchDir, { recursive: true, force: true });
  fs.rmSync(mismatchChecks, { force: true });
  try {
    const normal = stageRelease(stageOptions(normalDir));
    assert.equal(normal.report.integrity.sourceContentDigestMatches, true);
    assert.equal(normal.report.checks.ok, true);
    assert.equal(normal.report.staging.newFiles > 0, true);
    assert.equal(normal.report.staging.legacyFiles > 0, true);
    assert.equal(normal.report.candidateAccepted, false, 'dirty/local-only release was accepted');

    const missing = stageRelease(stageOptions(missingDir, {
      checksPath: path.join(tmpRoot, 'does-not-exist-c1-checks.json')
    }));
    assert.equal(missing.report.checks.ok, false);
    assert(missing.report.candidateReasons.some(reason => reason.includes('check evidenceがありません')));

    const checks = JSON.parse(fs.readFileSync(checksPath, 'utf8'));
    checks.contentDigest = '0'.repeat(64);
    fs.writeFileSync(mismatchChecks, `${JSON.stringify(checks, null, 2)}\n`, 'utf8');
    const mismatch = stageRelease(stageOptions(mismatchDir, { checksPath: mismatchChecks }));
    assert.equal(mismatch.report.checks.ok, false);
    assert(mismatch.report.candidateReasons.some(reason => reason.includes('contentDigestがreleaseと不一致')));
  } finally {
    for (const directory of [normalDir, missingDir, mismatchDir]) {
      fs.rmSync(directory, { recursive: true, force: true });
    }
    fs.rmSync(mismatchChecks, { force: true });
  }
}

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

function runFixtureGit(fixtureRoot, args) {
  return execFileSync('git', ['-C', fixtureRoot, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function createCleanGitFixture() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `trickcal-public-site-g1-${process.pid}-`));
  fs.mkdirSync(path.join(fixtureRoot, 'tools'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'tmp'), { recursive: true });
  const manifest = fixtureManifest();
  fs.writeFileSync(path.join(fixtureRoot, 'tools', 'public-route-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(fixtureRoot, '.gitignore'), 'tmp/\n');
  fs.writeFileSync(path.join(fixtureRoot, 'index.html'), '<!doctype html><html><head><title>fixture</title></head><body><script src="app.js"></script></body></html>\n');
  fs.writeFileSync(path.join(fixtureRoot, 'app.js'), 'window.fixtureAsset = "one";\n');
  fs.writeFileSync(path.join(fixtureRoot, 'public-site-runtime.js'), 'window.fixtureRuntime = true;\n');
  fs.writeFileSync(path.join(fixtureRoot, 'service-worker.js'), [
    "const CACHE_VERSION = 'source-template';",
    "const PREVIOUS_CACHE_VERSION = '';",
    "self.addEventListener('install', event => event.waitUntil(Promise.resolve()));"
  ].join('\n') + '\n');
  runFixtureGit(fixtureRoot, ['init', '--initial-branch=main']);
  runFixtureGit(fixtureRoot, ['config', 'user.name', 'Trickcal local fixture']);
  runFixtureGit(fixtureRoot, ['config', 'user.email', 'trickcal-fixture@example.invalid']);
  runFixtureGit(fixtureRoot, ['add', '--all']);
  runFixtureGit(fixtureRoot, ['commit', '--quiet', '-m', 'fixture baseline']);
  const head = runFixtureGit(fixtureRoot, ['rev-parse', 'HEAD']).trim();
  return { fixtureRoot, manifest, head };
}

async function testCandidateCreationAndRejection() {
  const { fixtureRoot, manifest, head } = createCleanGitFixture();
  const fixtureTmp = path.join(fixtureRoot, 'tmp');
  const fixtureSource = path.join(fixtureTmp, 'public-site');
  const fixtureManifest = path.join(fixtureRoot, 'tools', 'public-route-manifest.json');
  const fixtureChecks = path.join(fixtureTmp, 'public-site-checks-c2.json');
  const fixtureCandidate = path.join(fixtureTmp, 'public-site-candidate-c2.json');
  const fixtureStaging = path.join(fixtureTmp, 'public-site-staging-c2-success');
  const staleStaging = path.join(fixtureTmp, 'public-site-staging-c2-stale');
  try {
    generatePublicSite(manifest, { repoRoot: fixtureRoot, outputDir: fixtureSource, write: true });
    const release = JSON.parse(fs.readFileSync(path.join(fixtureSource, 'public-site-release.json'), 'utf8'));
    const build = JSON.parse(fs.readFileSync(path.join(fixtureSource, 'public-site-build.json'), 'utf8'));
    assert.equal(release.sourceCommit, head);
    assert.equal(release.dirty, false, 'clean fixture was marked dirty');
    const profileDigests = Object.fromEntries(release.profiles.map(profile => [profile.profile, profile.outputDigest]));

    const checksRun = await recordPublicSiteChecks({
      suite: 'artifact',
      repoRoot: fixtureRoot,
      sourceDir: fixtureSource,
      manifestPath: fixtureManifest,
      releasePath: path.join(fixtureSource, 'public-site-release.json'),
      buildPath: path.join(fixtureSource, 'public-site-build.json'),
      outputPath: fixtureChecks
    });
    assert.equal(checksRun.ok, true, JSON.stringify(checksRun.record, null, 2));
    const checks = JSON.parse(fs.readFileSync(fixtureChecks, 'utf8'));
    assert.deepEqual({
      generationCheck: checks.generationCheck,
      manifestValidate: checks.manifestValidate,
      publicSiteTest: checks.publicSiteTest,
      httpCheck: checks.httpCheck
    }, {
      generationCheck: true,
      manifestValidate: true,
      publicSiteTest: true,
      httpCheck: true
    });
    assert.equal(checks.sourceCommit, head);
    assert.equal(checks.contentDigest, release.contentDigest);
    assert.deepEqual(checks.profiles, profileDigests);

    const candidateRun = createCandidate({
      repoRoot: fixtureRoot,
      sourceDir: fixtureSource,
      manifestPath: fixtureManifest,
      checksPath: fixtureChecks,
      expectedCommit: head,
      expectedContentDigest: release.contentDigest,
      expectedProfileDigests: `new=${profileDigests.new},legacy=${profileDigests.legacy}`,
      outputPath: fixtureCandidate
    });
    assert.equal(candidateRun.ok, true, candidateRun.errors?.join(' | '));
    const candidate = JSON.parse(fs.readFileSync(fixtureCandidate, 'utf8'));
    assert.match(candidate.candidateId, /^[0-9a-f]{16}$/);
    assert.equal(candidate.releaseStatus, 'local-only-unpublished');
    assert.equal(candidate.releaseDirty, false);
    assert.equal(candidate.git.head, head);
    assert.equal(candidate.git.dirty, false);

    const missingChecks = createCandidate({
      repoRoot: fixtureRoot,
      sourceDir: fixtureSource,
      manifestPath: fixtureManifest,
      checksPath: path.join(fixtureTmp, 'missing-c2-checks.json'),
      expectedCommit: head,
      expectedContentDigest: release.contentDigest,
      expectedProfileDigests: `new=${profileDigests.new},legacy=${profileDigests.legacy}`,
      outputPath: path.join(fixtureTmp, 'public-site-candidate-c2-missing.json')
    });
    assert.equal(missingChecks.ok, false);
    assert(missingChecks.errors.some(error => error.includes('checksを読み込めません')));

    const wrongVersion = createCandidate({
      repoRoot: fixtureRoot,
      sourceDir: fixtureSource,
      manifestPath: fixtureManifest,
      checksPath: fixtureChecks,
      expectedCommit: head,
      expectedContentDigest: release.contentDigest,
      expectedProfileDigests: `new=0000000000000000,legacy=${profileDigests.legacy}`,
      outputPath: path.join(fixtureTmp, 'public-site-candidate-c2-version-mismatch.json')
    });
    assert.equal(wrongVersion.ok, false);
    assert(wrongVersion.errors.some(error => error.includes('expected new outputDigest')));

    const staged = stageRelease({
      repoRoot: fixtureRoot,
      sourceDir: fixtureSource,
      outputDir: fixtureStaging,
      releasePath: path.join(fixtureSource, 'public-site-release.json'),
      buildPath: path.join(fixtureSource, 'public-site-build.json'),
      manifestPath: fixtureManifest,
      checksPath: fixtureChecks,
      candidateRecordPath: fixtureCandidate,
      expectedCommit: head,
      expectedContentDigest: release.contentDigest,
      expectedProfileDigests: `new=${profileDigests.new},legacy=${profileDigests.legacy}`,
      candidate: true
    });
    assert.equal(staged.report.candidate.ok, true, staged.report.candidate.errors.join(' | '));
    assert.equal(staged.report.candidateAccepted, true, staged.report.candidateReasons.join(' | '));
    assert.equal(staged.report.release.status, 'local-only-unpublished');
    assert.equal(staged.report.release.dirty, false);
    assert.equal(staged.report.staging.newFiles > 0, true);
    assert.equal(staged.report.staging.legacyFiles > 0, true);

    const stagedCandidatePath = path.join(fixtureTmp, 'public-site-candidate-g1-staged.json');
    fs.rmSync(stagedCandidatePath, { force: true });
    fs.appendFileSync(path.join(fixtureRoot, 'app.js'), 'window.stagedCandidate = true;\n');
    runFixtureGit(fixtureRoot, ['add', 'app.js']);
    const stagedGitState = readGitState(fixtureRoot);
    assert.equal(stagedGitState.available, true);
    assert.equal(stagedGitState.dirty, true, 'staged uncommitted change was reported clean');
    const stagedCandidate = createCandidate({
      repoRoot: fixtureRoot,
      sourceDir: fixtureSource,
      manifestPath: fixtureManifest,
      checksPath: fixtureChecks,
      expectedCommit: head,
      expectedContentDigest: release.contentDigest,
      expectedProfileDigests: `new=${profileDigests.new},legacy=${profileDigests.legacy}`,
      outputPath: stagedCandidatePath
    });
    assert.equal(stagedCandidate.ok, false, 'staged uncommitted change produced an accepted candidate');
    assert(stagedCandidate.errors.some(error => error.includes('source repositoryがdirtyです')), stagedCandidate.errors.join(' | '));
    assert.equal(fs.existsSync(stagedCandidatePath), false);

    fs.appendFileSync(path.join(fixtureSource, 'app.js'), 'window.staleCandidate = true;\n');
    const stale = stageRelease({
      repoRoot: fixtureRoot,
      sourceDir: fixtureSource,
      outputDir: staleStaging,
      releasePath: path.join(fixtureSource, 'public-site-release.json'),
      buildPath: path.join(fixtureSource, 'public-site-build.json'),
      manifestPath: fixtureManifest,
      checksPath: fixtureChecks,
      candidateRecordPath: fixtureCandidate,
      expectedCommit: head,
      expectedContentDigest: release.contentDigest,
      expectedProfileDigests: `new=${profileDigests.new},legacy=${profileDigests.legacy}`,
      candidate: true
    });
    assert.equal(stale.report.candidateAccepted, false);
    assert(stale.report.candidateReasons.some(reason => /contentDigest|generation check|Git/.test(reason)), stale.report.candidateReasons.join(' | '));

    const hiddenGitDirectory = path.join(fixtureRoot, '.git-g1-hidden');
    const failedGitCandidatePath = path.join(fixtureTmp, 'public-site-candidate-g1-git-failure.json');
    fs.rmSync(failedGitCandidatePath, { force: true });
    fs.rmSync(hiddenGitDirectory, { recursive: true, force: true });
    fs.renameSync(path.join(fixtureRoot, '.git'), hiddenGitDirectory);
    try {
      const failedGitState = readGitState(fixtureRoot);
      assert.equal(failedGitState.available, false);
      assert.equal(failedGitState.dirty, true);
      assert.match(failedGitState.reason, /git rev-parse HEADに失敗/);
      const failedGitCandidate = createCandidate({
        repoRoot: fixtureRoot,
        sourceDir: fixtureSource,
        manifestPath: fixtureManifest,
        checksPath: fixtureChecks,
        expectedCommit: head,
        expectedContentDigest: release.contentDigest,
        expectedProfileDigests: `new=${profileDigests.new},legacy=${profileDigests.legacy}`,
        outputPath: failedGitCandidatePath
      });
      assert.equal(failedGitCandidate.ok, false, 'Git execution failure produced an accepted candidate');
      assert(failedGitCandidate.errors.some(error => error.includes('Git状態を取得できません') && error.includes('git rev-parse HEADに失敗')), failedGitCandidate.errors.join(' | '));
      assert.equal(fs.existsSync(failedGitCandidatePath), false);
    } finally {
      fs.renameSync(hiddenGitDirectory, path.join(fixtureRoot, '.git'));
    }
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function testRealRepositoryDirtyCandidateRejects() {
  const candidatePath = path.join(tmpRoot, `public-site-candidate-c2-dirty-${process.pid}.json`);
  fs.rmSync(candidatePath, { force: true });
  const release = JSON.parse(fs.readFileSync(releasePath, 'utf8'));
  const profileDigests = Object.fromEntries(release.profiles.map(profile => [profile.profile, profile.outputDigest]));
  const result = createCandidate({
    repoRoot,
    sourceDir,
    manifestPath: path.join(repoRoot, 'tools', 'public-route-manifest.json'),
    checksPath: path.join(tmpRoot, 'public-site-checks-c2.json'),
    expectedCommit: release.sourceCommit,
    expectedContentDigest: release.contentDigest,
    expectedProfileDigests: `new=${profileDigests.new},legacy=${profileDigests.legacy}`,
    outputPath: candidatePath
  });
  assert.equal(result.ok, false, 'dirty real repository produced an accepted candidate');
  assert(result.errors.some(error => error.includes('dirty')), result.errors.join(' | '));
  assert.equal(fs.existsSync(candidatePath), false, 'dirty real repository produced a candidate record');
}

async function main() {
  testOutputBoundaries();
  testNormalStagingAndBoundChecks();
  await testCandidateCreationAndRejection();
  testRealRepositoryDirtyCandidateRejects();
  console.log('public site staging tests passed: dedicated output boundaries, bound checks, real-git clean/staged/failure gates, stale/dirty rejection');
}

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
