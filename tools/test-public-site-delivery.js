'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { create: createCandidate } = require('./create-public-site-candidate.js');
const { generatePublicSite } = require('./generate-public-site.js');
const {
  deliver,
  IDENTITY_FILE,
  LEDGER_FILE
} = require('./transfer-public-site-artifact.js');
const { run: recordPublicSiteChecks } = require('./record-public-site-checks.js');
const { stageRelease } = require('./prepare-public-site-staging.js');
const { verify } = require('./verify-public-site-git.js');

function runGit(repository, args) {
  return execFileSync('git', ['-C', repository, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
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
    routes: [
      {
        id: 'fixture',
        source: 'index.html',
        indexable: false,
        profiles: {
          new: { publicPath: '/manager/', kind: 'static-page', aliases: ['/manager/index.html'] },
          legacy: { publicPath: '/trickcal-manager/', kind: 'static-page', aliases: ['/trickcal-manager/index.html'] }
        },
        fixtures: []
      },
      {
        id: 'old',
        source: 'old.html',
        indexable: false,
        profiles: {
          new: { publicPath: '/old/', kind: 'static-page', aliases: ['/old/index.html'] },
          legacy: { publicPath: '/trickcal-manager/old/', kind: 'static-page', aliases: ['/trickcal-manager/old/index.html'] }
        },
        fixtures: []
      }
    ],
    assets: [
      { source: 'service-worker.js', kind: 'file', profiles: ['new', 'legacy'] },
      { source: 'app.js', kind: 'file', profiles: ['new', 'legacy'] },
      { source: 'public-site-runtime.js', kind: 'file', profiles: ['new', 'legacy'] }
    ]
  };
}

function writeSourceFixture(fixtureRoot, manifest) {
  fs.mkdirSync(path.join(fixtureRoot, 'tools'), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, 'tmp'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'tools', 'public-route-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(fixtureRoot, '.gitignore'), 'tmp/\n');
  fs.writeFileSync(path.join(fixtureRoot, 'index.html'), '<!doctype html><html><head><title>fixture</title></head><body><a href="/old/">old</a><script src="app.js"></script></body></html>\n');
  fs.writeFileSync(path.join(fixtureRoot, 'old.html'), '<!doctype html><html><head><title>old</title></head><body><script src="app.js"></script></body></html>\n');
  fs.writeFileSync(path.join(fixtureRoot, 'app.js'), 'window.fixtureAsset = "one";\n');
  fs.writeFileSync(path.join(fixtureRoot, 'public-site-runtime.js'), 'window.fixtureRuntime = true;\n');
  fs.writeFileSync(path.join(fixtureRoot, 'service-worker.js'), [
    "const CACHE_VERSION = 'source-template';",
    "const PREVIOUS_CACHE_VERSION = '';",
    "self.addEventListener('install', event => event.waitUntil(Promise.resolve()));"
  ].join('\n') + '\n');
}

function initializeRepository(repository, message) {
  runGit(repository, ['init', '--initial-branch=main']);
  runGit(repository, ['config', 'user.name', 'Trickcal local fixture']);
  runGit(repository, ['config', 'user.email', 'trickcal-fixture@example.invalid']);
  runGit(repository, ['add', '--all']);
  runGit(repository, ['commit', '--quiet', '-m', message]);
}

function profileDigestArgs(release) {
  return Object.fromEntries(release.profiles.map(profile => [profile.profile, profile.outputDigest]));
}

async function buildCandidate({ fixtureRoot, manifestPath, label }) {
  const sourceDir = path.join(fixtureRoot, 'tmp', `public-site-${label}`);
  const checksPath = path.join(fixtureRoot, 'tmp', `public-site-checks-${label}.json`);
  const candidatePath = path.join(fixtureRoot, 'tmp', `public-site-candidate-${label}.json`);
  const stagingDir = path.join(fixtureRoot, 'tmp', `public-site-staging-${label}`);
  generatePublicSite(JSON.parse(fs.readFileSync(manifestPath, 'utf8')), {
    repoRoot: fixtureRoot,
    outputDir: sourceDir,
    write: true
  });
  const releasePath = path.join(sourceDir, 'public-site-release.json');
  const buildPath = path.join(sourceDir, 'public-site-build.json');
  const release = JSON.parse(fs.readFileSync(releasePath, 'utf8'));
  const build = JSON.parse(fs.readFileSync(buildPath, 'utf8'));
  const profileDigests = profileDigestArgs(release);
  const checksRun = await recordPublicSiteChecks({
    suite: 'artifact',
    repoRoot: fixtureRoot,
    sourceDir,
    manifestPath,
    releasePath,
    buildPath,
    outputPath: checksPath
  });
  assert.equal(checksRun.ok, true, JSON.stringify(checksRun.record, null, 2));
  const candidateRun = createCandidate({
    repoRoot: fixtureRoot,
    sourceDir,
    manifestPath,
    checksPath,
    expectedCommit: release.sourceCommit,
    expectedContentDigest: release.contentDigest,
    expectedProfileDigests: `new=${profileDigests.new},legacy=${profileDigests.legacy}`,
    outputPath: candidatePath
  });
  assert.equal(candidateRun.ok, true, candidateRun.errors?.join(' | '));
  const stageRun = stageRelease({
    repoRoot: fixtureRoot,
    sourceDir,
    outputDir: stagingDir,
    releasePath,
    buildPath,
    manifestPath,
    checksPath,
    candidateRecordPath: candidatePath,
    expectedCommit: release.sourceCommit,
    expectedContentDigest: release.contentDigest,
    expectedProfileDigests: `new=${profileDigests.new},legacy=${profileDigests.legacy}`,
    candidate: true
  });
  assert.equal(stageRun.report.candidateAccepted, true, stageRun.report.candidateReasons.join(' | '));
  const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
  return {
    sourceDir,
    releasePath,
    buildPath,
    checksPath,
    candidatePath,
    stagingDir,
    release,
    build,
    candidate,
    profileDigests
  };
}

function createDestination(fixtureRoot, label) {
  const destination = path.join(fixtureRoot, 'tmp', `delivery-${label}`);
  fs.mkdirSync(path.join(destination, '.github', 'workflows'), { recursive: true });
  fs.writeFileSync(path.join(destination, '.gitattributes'), '* -text\n');
  fs.writeFileSync(path.join(destination, '.github', 'workflows', 'pages.yml'), 'name: preinstalled-pages-workflow\n', 'utf8');
  fs.writeFileSync(path.join(destination, 'CNAME'), 'trickcal.irlab.dev\n', 'utf8');
  fs.writeFileSync(path.join(destination, 'keep.txt'), `unknown-${label}\n`, 'utf8');
  initializeRepository(destination, `${label} destination baseline`);
  return destination;
}

function deliveryOptions(candidateBuild, destination, profile) {
  return {
    candidateRecordPath: candidateBuild.candidatePath,
    stagingDir: candidateBuild.stagingDir,
    releasePath: candidateBuild.releasePath,
    buildPath: candidateBuild.buildPath,
    checksPath: candidateBuild.checksPath,
    destinationDir: destination,
    profile
  };
}

function snapshotTree(root) {
  const result = {};
  function visit(current, relative) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const next = relative ? `${relative}/${entry.name}` : entry.name;
      if (next === '.git' || next.startsWith('.git/')) continue;
      const full = path.join(current, entry.name);
      const stat = fs.lstatSync(full);
      if (stat.isDirectory()) visit(full, next);
      else if (stat.isFile()) result[next] = digestFile(full);
      else result[next] = `type:${stat.mode}`;
    }
  }
  visit(root, '');
  return result;
}

function digestFile(filePath) {
  return require('node:crypto').createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function assertProtectedFiles(destination, label) {
  assert.equal(fs.readFileSync(path.join(destination, '.github', 'workflows', 'pages.yml'), 'utf8'), 'name: preinstalled-pages-workflow\n', `${label}: workflow was changed`);
  assert.equal(fs.readFileSync(path.join(destination, 'CNAME'), 'utf8'), 'trickcal.irlab.dev\n', `${label}: CNAME was changed`);
  assert.equal(fs.readFileSync(path.join(destination, 'keep.txt'), 'utf8'), `unknown-${label}\n`, `${label}: unknown file was changed`);
}

function materializeArtifactRoot(destination, label) {
  const output = path.join(path.dirname(destination), `artifact-root-${label}`);
  fs.rmSync(output, { recursive: true, force: true });
  const ledger = JSON.parse(fs.readFileSync(path.join(destination, LEDGER_FILE), 'utf8'));
  fs.mkdirSync(output, { recursive: true });
  for (const file of ledger.ownedFiles) {
    const source = path.join(destination, ...file.path.split('/'));
    const target = path.join(output, ...file.path.split('/'));
    assert.equal(digestFile(source), file.sha256, `artifact source hash mismatch: ${file.path}`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
  return { output, ledger };
}

function testWorkflowTemplates() {
  const source = fs.readFileSync(path.join(__dirname, '..', 'docs', 'templates', 'storage-p5b-source-delivery.yml'), 'utf8');
  const pages = fs.readFileSync(path.join(__dirname, '..', 'docs', 'templates', 'storage-p5b-pages-deploy.yml'), 'utf8');
  for (const input of ['release_mode', 'previous_release_id', 'previous_release_json', 'source_commit', 'candidate_id', 'content_digest', 'new_output_digest', 'legacy_output_digest', 'site_repository']) {
    assert.match(source, new RegExp(`^      ${input}:`, 'm'), `source workflow input missing: ${input}`);
  }
  for (const input of ['candidate_id', 'source_commit', 'content_digest', 'profile']) {
    assert.match(pages, new RegExp(`^      ${input}:`, 'm'), `Pages workflow input missing: ${input}`);
  }
  assert.match(source, /workflow_dispatch:/);
  assert.match(source, /release_mode:[\s\S]*?type: choice[\s\S]*?- initial[\s\S]*?- update/);
  assert.match(source, /Validate release input and materialize previous record/);
  assert.match(source, /PREVIOUS_RELEASE_ID: \$\{\{ inputs\.previous_release_id \}\}/);
  assert.match(source, /PREVIOUS_RELEASE_JSON: \$\{\{ inputs\.previous_release_json \}\}/);
  assert.match(source, /validate-public-site-release-input\.js[\s\S]*--mode "\$RELEASE_MODE"/);
  assert.match(source, /previous_args=\(\)[\s\S]*--previous-release source\/tmp\/previous-public-site-release\.json/);
  assert.equal((source.match(/inputs\.previous_release_json/g) || []).length, 1, 'previous JSONがshell本文へ直接展開されています');
  assert.match(source, /environment: public-site-delivery-approval/);
  assert.match(source, /secrets\.TRICKCAL_SITE_CONTENTS_TOKEN/);
  assert.match(source, /transfer-public-site-artifact\.js[\s\S]*--profile new[\s\S]*--apply/);
  assert.match(pages, /actions\/configure-pages@v5/);
  assert.match(pages, /actions\/upload-pages-artifact@v4/);
  assert.match(pages, /actions\/deploy-pages@v4/);
  assert.match(pages, /needs: validate-and-package/);
  assert.match(pages, /pages: write/);
  assert.match(pages, /id-token: write/);
  assert.match(pages, /name: github-pages/);
  assert.equal(/^[ \t]+push:/m.test(source), false, 'source template must not auto-trigger on push');
  assert.equal(/^[ \t]+push:/m.test(pages), false, 'Pages template must not auto-trigger on push');
}

async function main() {
  testWorkflowTemplates();
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `trickcal-public-site-delivery-${process.pid}-`));
  const manifest = fixtureManifest();
  const manifestPath = path.join(fixtureRoot, 'tools', 'public-route-manifest.json');
  try {
    writeSourceFixture(fixtureRoot, manifest);
    initializeRepository(fixtureRoot, 'source A baseline');
    const candidateA = await buildCandidate({ fixtureRoot, manifestPath, label: 'a' });

    const badCandidatePath = path.join(fixtureRoot, 'tmp', 'public-site-candidate-bad-version.json');
    const manifestB = { ...manifest, routes: manifest.routes.filter(route => route.id !== 'old') };
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifestB, null, 2)}\n`, 'utf8');
    runGit(fixtureRoot, ['add', 'tools/public-route-manifest.json']);
    runGit(fixtureRoot, ['commit', '--quiet', '-m', 'source B removes retired route']);
    const candidateB = await buildCandidate({ fixtureRoot, manifestPath, label: 'b' });

    const newDestination = createDestination(fixtureRoot, 'new');
    const beforeDryRun = snapshotTree(newDestination);
    const dryRun = deliver(deliveryOptions(candidateA, newDestination, 'new'));
    assert.equal(dryRun.ok, true, dryRun.errors?.join(' | '));
    assert.equal(dryRun.applied, false);
    assert.equal(dryRun.plan.mode, 'dry-run');
    assert.deepEqual(snapshotTree(newDestination), beforeDryRun);

    const appliedA = deliver({ ...deliveryOptions(candidateA, newDestination, 'new'), apply: true });
    assert.equal(appliedA.ok, true, appliedA.errors?.join(' | '));
    assert.equal(appliedA.applied, true);
    assert.equal(appliedA.changed, true);
    assertProtectedFiles(newDestination, 'new');
    assert(fs.existsSync(path.join(newDestination, 'old', 'index.html')));
    const identityA = JSON.parse(fs.readFileSync(path.join(newDestination, IDENTITY_FILE), 'utf8'));
    assert.deepEqual(Object.keys(identityA).sort(), ['candidateId', 'digest', 'profile', 'sourceCommit']);
    assert.equal(identityA.candidateId, candidateA.candidate.candidateId);
    assert.equal(identityA.profile, 'new');
    assert.equal(identityA.digest.contentDigest, candidateA.candidate.contentDigest);
    assert.equal(identityA.digest.outputDigest, candidateA.candidate.profiles.new.outputDigest);
    const ledgerA = JSON.parse(fs.readFileSync(path.join(newDestination, LEDGER_FILE), 'utf8'));
    assert.equal(ledgerA.profile, 'new');
    assert.equal(ledgerA.ownedFiles.some(file => file.path === 'old/index.html'), true);
    runGit(newDestination, ['add', '--all']);
    assert.equal(verify({ ...deliveryOptions(candidateA, newDestination, 'new'), ref: 'index' }).ok, true);
    runGit(newDestination, ['commit', '--quiet', '-m', 'deliver candidate A']);
    const commitA = runGit(newDestination, ['rev-parse', 'HEAD']).trim();
    assert.equal(verify({ ...deliveryOptions(candidateA, newDestination, 'new'), ref: commitA }).ok, true);
    assert.throws(() => verify({ ...deliveryOptions(candidateA, newDestination, 'new'), ref: commitA.slice(0, 7) }), /full 40-character/);

    // Reproduce the former failure: EOL editing + a correspondingly edited
    // ledger must NOT pass verification against the original candidate.
    const originalApp = fs.readFileSync(path.join(newDestination, 'app.js'));
    const originalLedger = fs.readFileSync(path.join(newDestination, LEDGER_FILE));
    fs.writeFileSync(path.join(newDestination, 'app.js'), originalApp.toString().replace(/\r?\n/g, '\r\n'));
    const editedLedger = JSON.parse(originalLedger);
    editedLedger.ownedFiles.find(file => file.path === 'app.js').sha256 = digestFile(path.join(newDestination, 'app.js'));
    fs.writeFileSync(path.join(newDestination, LEDGER_FILE), JSON.stringify(editedLedger, null, 2) + '\n');
    runGit(newDestination, ['-c', 'core.autocrlf=false', 'add', 'app.js', LEDGER_FILE]);
    assert.throws(() => verify({ ...deliveryOptions(candidateA, newDestination, 'new'), ref: 'index' }), /candidate\/Git bytes mismatch: app.js/);
    fs.writeFileSync(path.join(newDestination, 'app.js'), originalApp);
    fs.writeFileSync(path.join(newDestination, LEDGER_FILE), originalLedger);
    runGit(newDestination, ['-c', 'core.autocrlf=false', 'add', 'app.js', LEDGER_FILE]);
    fs.writeFileSync(path.join(newDestination, 'unrelated.txt'), 'do not stage\n');
    runGit(newDestination, ['add', 'unrelated.txt']);
    assert.throws(() => verify({ ...deliveryOptions(candidateA, newDestination, 'new'), ref: 'index' }), /unrelated staged\/committed path/);
    runGit(newDestination, ['commit', '--quiet', '-m', 'fixture unrelated commit']);
    const unrelatedCommit = runGit(newDestination, ['rev-parse', 'HEAD']).trim();
    assert.throws(() => verify({ ...deliveryOptions(candidateA, newDestination, 'new'), ref: unrelatedCommit, baseCommit: commitA }), /unrelated staged\/committed path/);
    runGit(newDestination, ['rm', 'unrelated.txt']);
    runGit(newDestination, ['commit', '--quiet', '-m', 'remove fixture unrelated file']);

    const planB = deliver(deliveryOptions(candidateB, newDestination, 'new'));
    assert.equal(planB.ok, true, planB.errors?.join(' | '));
    assert.equal(planB.plan.operations.delete.some(operation => operation.path === 'old/index.html'), true);
    const appliedB = deliver({ ...deliveryOptions(candidateB, newDestination, 'new'), apply: true });
    assert.equal(appliedB.ok, true, appliedB.errors?.join(' | '));
    assert.equal(fs.existsSync(path.join(newDestination, 'old', 'index.html')), false, 'previously owned retired file was not deleted');
    assertProtectedFiles(newDestination, 'new');
    const newArtifact = materializeArtifactRoot(newDestination, 'new');
    assert.equal(fs.existsSync(path.join(newArtifact.output, 'public-site-deployment.json')), true);
    assert.equal(fs.existsSync(path.join(newArtifact.output, 'keep.txt')), false, 'unknown file entered artifact root');
    assert.equal(fs.existsSync(path.join(newArtifact.output, '.github')), false, 'workflow entered artifact root');
    assert.equal(fs.existsSync(path.join(newArtifact.output, 'CNAME')), false, 'CNAME entered artifact root');
    assert.equal(fs.existsSync(path.join(newArtifact.output, '.trickcal-public-site-delivery.json')), false, 'ownership ledger entered artifact root');
    runGit(newDestination, ['add', '--all']);
    assert.equal(verify({ ...deliveryOptions(candidateB, newDestination, 'new'), ref: 'index',
      stagePaths: [...appliedB.desiredFiles.map(file => file.path), ...appliedB.plan.operations.delete.map(file => file.path), LEDGER_FILE],
      deletedPaths: appliedB.plan.operations.delete.map(file => file.path) }).ok, true);
    runGit(newDestination, ['commit', '--quiet', '-m', 'deliver candidate B']);
    assert.equal(verify({ ...deliveryOptions(candidateB, newDestination, 'new'),
      ref: runGit(newDestination, ['rev-parse', 'HEAD']).trim(), baseCommit: commitA,
      stagePaths: [...appliedB.desiredFiles.map(file => file.path), ...appliedB.plan.operations.delete.map(file => file.path), LEDGER_FILE],
      deletedPaths: appliedB.plan.operations.delete.map(file => file.path) }).ok, true);

    const beforeRerun = snapshotTree(newDestination);
    const rerunPlan = deliver(deliveryOptions(candidateB, newDestination, 'new'));
    assert.equal(rerunPlan.ok, true, rerunPlan.errors?.join(' | '));
    assert.equal(rerunPlan.plan.operations.write.length, 0);
    assert.equal(rerunPlan.plan.operations.delete.length, 0);
    assert.equal(rerunPlan.plan.operations.unchanged.length, rerunPlan.plan.desiredFileCount);
    const rerun = deliver({ ...deliveryOptions(candidateB, newDestination, 'new'), apply: true });
    assert.equal(rerun.ok, true, rerun.errors?.join(' | '));
    assert.equal(rerun.changed, false);
    assert.deepEqual(snapshotTree(newDestination), beforeRerun);
    assert.equal(runGit(newDestination, ['status', '--porcelain', '--untracked-files=all']).trim(), '');

    const badCandidate = JSON.parse(JSON.stringify(candidateB.candidate));
    badCandidate.contentDigest = '0'.repeat(64);
    fs.writeFileSync(badCandidatePath, `${JSON.stringify(badCandidate, null, 2)}\n`, 'utf8');
    const beforeVersionMismatch = snapshotTree(newDestination);
    const versionMismatch = deliver({
      ...deliveryOptions(candidateB, newDestination, 'new'),
      candidateRecordPath: badCandidatePath,
      apply: true
    });
    assert.equal(versionMismatch.ok, false, 'version mismatch was accepted');
    assert(versionMismatch.errors.some(error => /contentDigest|candidateId/.test(error)), versionMismatch.errors.join(' | '));
    assert.deepEqual(snapshotTree(newDestination), beforeVersionMismatch);

    const legacyDestination = createDestination(fixtureRoot, 'legacy');
    const legacyResult = deliver({ ...deliveryOptions(candidateA, legacyDestination, 'legacy'), apply: true });
    assert.equal(legacyResult.ok, true, legacyResult.errors?.join(' | '));
    assert(fs.existsSync(path.join(legacyDestination, 'index.html')));
    assert.equal(fs.existsSync(path.join(legacyDestination, 'trickcal-manager')), false);
    const legacyIdentity = JSON.parse(fs.readFileSync(path.join(legacyDestination, IDENTITY_FILE), 'utf8'));
    assert.equal(legacyIdentity.profile, 'legacy');
    runGit(legacyDestination, ['add', '--all']);
    assert.equal(verify({ ...deliveryOptions(candidateA, legacyDestination, 'legacy'), ref: 'index' }).ok, true);
    assertProtectedFiles(legacyDestination, 'legacy');
    const legacyArtifact = materializeArtifactRoot(legacyDestination, 'legacy');
    assert.equal(fs.existsSync(path.join(legacyArtifact.output, 'trickcal-manager')), false);
    assert.equal(fs.existsSync(path.join(legacyArtifact.output, 'public-site-deployment.json')), true);

    const beforeFailure = snapshotTree(newDestination);
    const successfulHead = runGit(newDestination, ['rev-parse', 'HEAD']).trim();
    const successfulLedger = fs.readFileSync(path.join(newDestination, LEDGER_FILE), 'utf8');
    const failedResult = deliver({
      ...deliveryOptions(candidateB, newDestination, 'new'),
      apply: true,
      copyFile: () => { throw new Error('injected workspace copy failure'); }
    });
    assert.equal(failedResult.ok, false, 'injected copy failure was accepted');
    assert.equal(failedResult.applied, false);
    assert(failedResult.errors.some(error => error.includes('injected workspace copy failure')));
    assert.equal(fs.readFileSync(path.join(newDestination, LEDGER_FILE), 'utf8'), successfulLedger);
    assert.deepEqual(snapshotTree(newDestination), beforeFailure);
    assert.equal(runGit(newDestination, ['rev-parse', 'HEAD']).trim(), successfulHead);
    assert.equal(runGit(newDestination, ['status', '--porcelain', '--untracked-files=all']).trim(), '');

    console.log('public site delivery tests passed: dry-run, profile roots, ownership cleanup, protected files, idempotent rerun, mismatch and copy-failure stop');
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
