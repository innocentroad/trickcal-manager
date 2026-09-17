'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { readGitState } = require('./public-site-candidate.js');
const { parseArgs, preflight } = require('./public-site-publication.js');
const { run: httpChecks } = require('./test-public-site-http.js');
const { git } = require('./verify-public-site-git.js');

const ROOT = path.resolve(__dirname, '..');
function initialize(root) {
  git(root, ['init', '--initial-branch=main']);
  git(root, ['config', 'user.name', 'Publication test']);
  git(root, ['config', 'user.email', 'publication-test@example.invalid']);
  git(root, ['config', 'core.autocrlf', 'false']);
  git(root, ['add', '--all']);
  git(root, ['commit', '--quiet', '-m', 'isolated test fixture']);
}

async function main() {
  assert.throws(() => parseArgs(['prepare', '--apply']), /unexpected option/);
  assert.throws(() => parseArgs(['transfer', '--destination']), /missing value/);
  assert.throws(() => parseArgs(['deploy']), /unknown command/);
  const denied = readGitState(ROOT, () => { throw Object.assign(new Error('denied'), { code: 'EPERM' }); });
  assert.equal(denied.available, false);
  assert.equal(denied.dirty, true);

  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-publication-test-'));
  const source = path.join(scratch, 'source');
  fs.mkdirSync(source);
  try {
    // Exercise the actual CLI with the current code in an isolated, committed
    // fixture. No commits, index changes or resets touch the user's source.
    const tracked = git(ROOT, ['ls-files', '-z']).split('\0').filter(Boolean);
    for (const name of new Set([...tracked,
      'tools/public-site-publication.js', 'tools/verify-public-site-git.js', 'tools/test-public-site-publication.js',
      'tools/public-site-receipt.js', 'tools/publish-public-site.js', 'tools/publication-targets.json'])) {
      const target = path.join(source, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(ROOT, name), target);
    }
    fs.writeFileSync(path.join(source, '.gitattributes'), '* -text\n');
    initialize(source);
    assert.equal(preflight(source).dirty, false);
    const linked = path.join(scratch, 'linked');
    git(source, ['worktree', 'add', '--detach', linked]);
    assert.equal(fs.statSync(path.join(linked, '.git')).isFile(), true);
    assert.equal(preflight(linked).head, preflight(source).head);
    git(source, ['worktree', 'remove', linked]);
    const cli = path.join(source, 'tools', 'public-site-publication.js');
    const run = args => JSON.parse(execFileSync(process.execPath, [cli, ...args], {
      cwd: source, encoding: 'utf8', timeout: 120000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']
    }));
    const local = run(['check', '--name', 'baseline']);
    assert.equal(local.publishable, false);
    const baseline = path.join(local.sourceDir, 'public-site-release.json');
    assert.throws(() => run(['prepare', '--name', 'missing-previous']), /previous-release/);
    const prepared = run(['prepare', '--name', 'candidate', '--previous-release', baseline]);
    console.log('publication fixture: prepare passed');
    assert.equal(prepared.ok, true);
    const bundle = JSON.parse(fs.readFileSync(prepared.bundlePath));
    const checks = JSON.parse(fs.readFileSync(bundle.checksPath));
    assert.equal(checks.suite, 'manager');
    assert.equal(checks.checks.publicSiteTest.detail.assertions.releaseVersioning, true);
    assert.equal(checks.checks.httpCheck.detail.serviceWorkerGates, true);
    assert.throws(() => run(['prepare', '--name', 'candidate', '--previous-release', baseline]), /上書き/);
    const history = path.join(source, 'backups', 'publication-history');
    fs.mkdirSync(history, { recursive: true });
    const latest = { success: false, release: JSON.parse(fs.readFileSync(bundle.releasePath)) };
    fs.writeFileSync(path.join(history, 'latest-new.json'), JSON.stringify(latest));
    assert.throws(() => run(['prepare', '--name', 'not-published']), /前回成功記録/);
    latest.success = true;
    fs.writeFileSync(path.join(history, 'latest-new.json'), JSON.stringify(latest));
    assert.equal(run(['prepare', '--name', 'from-history']).ok, true, 'durable previous release was not used');
    for (const profile of ['new', 'legacy']) {
      const receiver = path.join(scratch, profile);
      fs.mkdirSync(receiver);
      fs.writeFileSync(path.join(receiver, '.gitattributes'), '* -text\n');
      fs.writeFileSync(path.join(receiver, 'keep.txt'), 'keep\n');
      initialize(receiver);
      const baseArgs = ['--bundle', prepared.bundlePath, '--destination', receiver, '--profile', profile];
      assert.throws(() => run(['verify', ...baseArgs]), /receipt required/);
      const dry = run(['transfer', ...baseArgs]);
      assert.equal(dry.applied, false);
      assert.equal(readGitState(receiver).dirty, false);
      fs.writeFileSync(path.join(receiver, 'unrelated.txt'), 'uncommitted\n');
      assert.throws(() => run(['transfer', ...baseArgs, '--apply', '--stage']), /receiver is dirty/);
      fs.unlinkSync(path.join(receiver, 'unrelated.txt'));
      const transferred = run(['transfer', ...baseArgs, '--apply']);
      const receipt = JSON.parse(fs.readFileSync(transferred.receiptPath));
      // Crash between successful copying and applied-state persistence.
      receipt.applied = false; receipt.phase = 'planned';
      fs.writeFileSync(transferred.receiptPath, JSON.stringify(receipt));
      fs.writeFileSync(path.join(receiver, 'foreign.txt'), 'unrelated');
      assert.throws(() => run(['stage', '--receipt', transferred.receiptPath]), error =>
        /unrelated untracked/.test(error.message) && /receipt:/.test(error.message) && /resume:/.test(error.message));
      assert.equal(git(receiver, ['diff', '--cached', '--name-only']).trim(), '');
      fs.unlinkSync(path.join(receiver, 'foreign.txt'));
      const staged = run(['stage', '--receipt', transferred.receiptPath]);
      assert.equal(staged.verification.ok, true);
      assert.equal(run(['verify', ...baseArgs]).ok, true, 'automatic receipt lookup failed');
      const validReceipt = fs.readFileSync(transferred.receiptPath);
      const wrongReceipt = JSON.parse(validReceipt);
      wrongReceipt.stagePaths.push('.github/workflows/not-allowed.yml');
      fs.writeFileSync(transferred.receiptPath, JSON.stringify(wrongReceipt));
      assert.throws(() => run(['verify', ...baseArgs]), /receipt scope mismatch/);
      fs.writeFileSync(transferred.receiptPath, validReceipt);
      git(receiver, ['commit', '--quiet', '-m', 'fixture artifact']);
      const sha = git(receiver, ['rev-parse', 'HEAD']).trim();
      const verified = run(['verify', ...baseArgs, '--ref', sha, '--receipt', transferred.receiptPath]);
      assert.equal(verified.ok, true);
      if (profile === 'legacy') assert.equal(verified.workflowInputs.artifact_commit, sha);
      const configPath = path.join(source, 'tools', 'publication-targets.json');
      const configBytes = fs.readFileSync(configPath);
      const configuration = JSON.parse(configBytes);
      configuration[profile].destination = receiver;
      fs.writeFileSync(configPath, JSON.stringify(configuration));
      git(receiver, ['branch', '-m', configuration[profile].branch]);
      git(receiver, ['remote', 'add', 'origin', 'https://github.com/' + configuration[profile].repository + '.git']);
      const publishPlan = () => JSON.parse(execFileSync(process.execPath, [path.join(source, 'tools', 'publish-public-site.js'),
        '--bundle', prepared.bundlePath, '--profile', profile], {
        cwd: source, encoding: 'utf8', timeout: 120000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']
      }));
      assert.equal(publishPlan().execute, false, 'default must remain a local-only plan');
      git(receiver, ['remote', 'set-url', 'origin', 'https://github.com/innocentroad/wrong-receiver.git']);
      assert.throws(publishPlan, /remote mismatch/);
      git(receiver, ['remote', 'set-url', 'origin', 'https://github.com/' + configuration[profile].repository + '.git']);
      if (profile === 'legacy') {
        configuration.mode = 'new-only'; configuration.legacyState = 'frozen';
        fs.writeFileSync(configPath, JSON.stringify(configuration));
        assert.throws(publishPlan, /legacy publication disabled/);
      }
      fs.writeFileSync(configPath, configBytes);
      assert.throws(() => run(['verify', ...baseArgs, '--ref', sha.slice(0, 7)]), /full 40-character/);
      const repeated = run(['transfer', ...baseArgs, '--apply', '--stage']);
      assert.equal(repeated.writes, 0);
      assert.equal(readGitState(receiver).dirty, false);
      console.log('publication fixture: ' + profile + ' receipt/resume/commit passed');
    }
    // A 200 response alone is insufficient: keep HTTP content assertions live.
    const managerPath = path.join(bundle.sourceDir, 'manager', 'index.html');
    const manager = fs.readFileSync(managerPath);
    fs.writeFileSync(managerPath, '<!doctype html><html><body>wrong route wiring</body></html>');
    await assert.rejects(() => httpChecks({ repoRoot: source, sourceDir: bundle.sourceDir }));
    fs.writeFileSync(managerPath, manager);
    fs.writeFileSync(path.join(source, 'untracked-change.txt'), 'dirty\n');
    assert.throws(() => run(['prepare', '--name', 'dirty', '--previous-release', baseline]), /dirty/);
    assert.equal(fs.existsSync(path.join(source, 'tmp', 'publication-dirty-output')), false);
    assert.equal(git(source, ['status', '--porcelain']).trim(), '?? untracked-change.txt');
    console.log('publication tests passed: real CLI prepare/check, full checks, linked worktree, dirty/EPERM gates, immutable candidate, scoped stage, new/legacy, full SHA, HTTP content failure, idempotent transfer');
  } finally {
    // scratch was created by this test under the OS temporary directory.
    assert.equal(path.dirname(scratch), fs.realpathSync(os.tmpdir()));
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
