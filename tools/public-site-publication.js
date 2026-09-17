#!/usr/bin/env node
'use strict';

// Local publication preparation only: no commit, push, dispatch or approval.
const fs = require('node:fs');
const path = require('node:path');
const { readGitState, releaseProfileDigests } = require('./public-site-candidate.js');
const { generatePublicSite, readManifest } = require('./generate-public-site.js');
const { run: recordChecks } = require('./record-public-site-checks.js');
const { create: createCandidate } = require('./create-public-site-candidate.js');
const { stageRelease } = require('./prepare-public-site-staging.js');
const { deliver, LEDGER_FILE } = require('./transfer-public-site-artifact.js');
const { verify, git } = require('./verify-public-site-git.js');
const { saveJson, receiptPath: receiptLocation, scopeFromPlan, loadReceipt, contextualError } = require('./public-site-receipt.js');

const ROOT = path.resolve(__dirname, '..');
const PURPOSE = 'checked local publication bundle';
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' }); }

function preflight(repoRoot, { localOnly = false } = {}) {
  const state = readGitState(repoRoot);
  if (!state.available) throw new Error('Git取得不可。承認された実行環境で同じworktreeから再実行してください。cloneやdirty判定の改変は不要です。 ' + state.reason);
  if (state.dirty && !localOnly) throw new Error('sourceがdirtyです。対象限定のsource commit後にprepareしてください。未commitの検証はcheckを使用します。');
  return state;
}

async function prepare(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || ROOT);
  const localOnly = options.command === 'check';
  const initial = preflight(repoRoot, { localOnly });
  let previousRelease;
  if (!localOnly && !options.previousReleasePath) {
    const latestPath = path.join(repoRoot, 'backups', 'publication-history', 'latest-new.json');
    const latest = fs.existsSync(latestPath) ? readJson(latestPath) : null;
    if (!latest?.success || !latest.release) throw new Error('前回成功記録がありません。初回は --previous-release FILE を指定してください。');
    previousRelease = latest.release;
  }
  const name = options.name || new Date().toISOString().replace(/[^0-9]/g, '');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(name)) throw new Error('name must be 1-64 ASCII letters/digits, hyphens or underscores');
  const prefix = path.join(repoRoot, 'tmp', 'publication-' + name);
  const paths = {
    repoRoot,
    sourceDir: prefix + '-output',
    checksPath: prefix + '-checks.json',
    candidateRecordPath: prefix + '-candidate.json',
    stagingDir: path.join(repoRoot, 'tmp', 'public-site-staging-' + name),
    bundlePath: prefix + '.json'
  };
  for (const [key, file] of Object.entries(paths)) {
    if (key !== 'repoRoot' && fs.existsSync(file)) throw new Error('既存の候補は上書きしません: ' + file);
  }
  const timings = {};
  async function step(name, fn) {
    const start = performance.now();
    process.stderr.write(name + '...\n');
    try { return await fn(); }
    finally { timings[name] = Math.round(performance.now() - start); }
  }
  const manifest = readManifest(path.join(repoRoot, 'tools', 'public-route-manifest.json'));
  await step('generate', () => generatePublicSite(manifest, {
    repoRoot, outputDir: paths.sourceDir, write: true,
    ...(previousRelease ? { previousRelease } : {}),
    ...(options.previousReleasePath ? { previousReleasePath: path.resolve(options.previousReleasePath) } : {})
  }));
  const checked = await step('checks', () => recordChecks({
    repoRoot, sourceDir: paths.sourceDir, outputPath: paths.checksPath, suite: 'manager'
  }));
  if (!checked.ok) throw new Error(checked.record.failures.join('\n') + '\ncheck record: ' + paths.checksPath);
  if (localOnly) return { ok: true, localOnly: true, publishable: false, checksPath: paths.checksPath, sourceDir: paths.sourceDir, timingsMs: timings };
  const final = preflight(repoRoot);
  if (initial.head !== final.head) throw new Error('source HEAD changed during preparation');
  const releasePath = path.join(paths.sourceDir, 'public-site-release.json');
  const buildPath = path.join(paths.sourceDir, 'public-site-build.json');
  const release = readJson(releasePath);
  const expected = {
    expectedCommit: initial.head,
    expectedContentDigest: release.contentDigest,
    expectedProfileDigests: Object.entries(releaseProfileDigests(release)).map(([key, value]) => key + '=' + value).join(',')
  };
  const candidate = await step('candidate', () => createCandidate({
    repoRoot, sourceDir: paths.sourceDir, checksPath: paths.checksPath,
    outputPath: paths.candidateRecordPath, ...expected
  }));
  if (!candidate.ok) throw new Error(candidate.errors.join('\n'));
  const staged = await step('staging', () => stageRelease({
    repoRoot, sourceDir: paths.sourceDir, outputDir: paths.stagingDir,
    checksPath: paths.checksPath, candidateRecordPath: paths.candidateRecordPath,
    candidate: true, ...expected
  }));
  if (!staged.report.candidateAccepted) throw new Error(staged.report.candidateReasons.join('\n'));
  const bundle = { schemaVersion: 1, purpose: PURPOSE, ...paths, releasePath, buildPath,
    candidateId: candidate.record.candidateId, sourceCommit: initial.head, timingsMs: timings };
  writeJson(paths.bundlePath, bundle);
  return { ok: true, bundlePath: paths.bundlePath, candidateId: bundle.candidateId, sourceCommit: initial.head, timingsMs: timings };
}

function loadBundle(file) {
  if (!file) throw new Error('--bundle is required');
  const bundle = readJson(path.resolve(file));
  if (bundle.schemaVersion !== 1 || bundle.purpose !== PURPOSE) throw new Error('not a publication bundle');
  const candidate = readJson(bundle.candidateRecordPath);
  if (candidate.candidateId !== bundle.candidateId || candidate.sourceCommit !== bundle.sourceCommit) throw new Error('bundle/candidate mismatch');
  const checks = readJson(bundle.checksPath);
  if (checks.suite !== 'manager' || !checks.publicSiteTest || !checks.httpCheck) throw new Error('complete Manager checks are required');
  return bundle;
}

function deliveryOptions(options) {
  if (!options.destinationDir || !['new', 'legacy'].includes(options.profile)) throw new Error('--destination and --profile new|legacy are required');
  const bundle = loadBundle(options.bundlePath);
  const destinationDir = path.resolve(options.destinationDir);
  const top = git(destinationDir, ['rev-parse', '--show-toplevel']).trim();
  if (fs.realpathSync(top).toLowerCase() !== fs.realpathSync(destinationDir).toLowerCase()) throw new Error('destination must be the receiver Git repository root');
  return { ...bundle, destinationDir, profile: options.profile };
}

function transfer(options) {
  const started = performance.now();
  const input = deliveryOptions(options);
  if (options.stage && !options.apply) throw new Error('--stage requires --apply');
  const state = readGitState(input.destinationDir);
  if (!state.available) throw new Error('receiver Git state unavailable: ' + state.reason);
  const receiptFile = receiptLocation(input);
  if (options.apply && fs.existsSync(receiptFile)) {
    const existing = loadReceipt(input, receiptFile, { allowPlanned: true }).receipt;
    if (existing.applied || state.dirty) {
      if (options.stage) return stageReceipt({ receiptPath: receiptFile });
      throw contextualError(new Error('delivery already exists; do not transfer again'), receiptFile, 'resume');
    }
  }
  if (options.apply && state.dirty) throw new Error('receiver is dirty; inspect existing changes before transfer');
  const inspected = deliver({ ...input, apply: false });
  if (!inspected.ok) throw new Error(inspected.errors.join('\n'));
  const scope = scopeFromPlan(inspected.plan);
  if (!options.apply) return { ok: true, applied: false, candidateId: input.candidateId,
    profile: input.profile, writes: inspected.plan.operations.write.length,
    deletes: scope.deletedPaths.length, plan: inspected.plan };
  const receipt = { schemaVersion: 2, bundlePath: input.bundlePath, candidateId: input.candidateId,
    destinationDir: input.destinationDir, profile: input.profile, applied: false, phase: 'planned',
    baseCommit: state.head, ...scope, plan: inspected.plan };
  saveJson(receiptFile, receipt);
  process.stderr.write('receipt: ' + receiptFile + '\n');
  let phase = 'transfer';
  try {
    const result = deliver({ ...input, apply: true });
    if (!result.ok) throw new Error(result.errors.join('\n'));
    receipt.applied = true; receipt.phase = 'transferred';
    saveJson(receiptFile, receipt);
    phase = 'stage';
    const staged = options.stage ? stageReceipt({ receiptPath: receiptFile }) : {};
    return { ok: true, applied: true, candidateId: input.candidateId, profile: input.profile,
      writes: result.plan.operations.write.length, deletes: scope.deletedPaths.length,
      receiptPath: receiptFile, verification: staged.verification, elapsedMs: Math.round(performance.now() - started) };
  } catch (error) { throw contextualError(error, receiptFile, phase); }
}

function stageReceipt(options) {
  if (!options.receiptPath) throw new Error('--receipt is required for stage');
  const initial = readJson(options.receiptPath);
  const input = deliveryOptions({ bundlePath: initial.bundlePath, destinationDir: initial.destinationDir, profile: initial.profile });
  const { file, receipt } = loadReceipt(input, options.receiptPath, { allowPlanned: true });
  try {
    const state = readGitState(input.destinationDir);
    if (!state.available) throw new Error('receiver Git state unavailable');
    if (state.head !== receipt.baseCommit) {
      if (!receipt.applied || state.dirty) throw new Error('receiver HEAD changed; cannot stage');
      const verification = verifyGit({ ...input, receiptPath: file, ref: state.head });
      return { ok: true, applied: true, writes: 0, receiptPath: file, alreadyCommitted: true, verification };
    }
    // Reconcile a crash after copying but before saving applied=true. This is
    // read-only; partial copies or foreign edits cannot be auto-repaired.
    verify({ ...input, ref: 'worktree', ...scopeFromPlan(receipt.plan), baseCommit: receipt.baseCommit });
    receipt.applied = true; receipt.phase = 'transferred'; saveJson(file, receipt);
    git(input.destinationDir, ['--literal-pathspecs', 'add', '--pathspec-from-file=-', '--pathspec-file-nul'],
      { input: receipt.stagePaths.join('\0') + '\0' });
    const verification = verifyGit({ ...input, receiptPath: file, ref: 'index' });
    receipt.phase = 'staged'; saveJson(file, receipt);
    return { ok: true, applied: true, writes: 0, receiptPath: file, verification };
  } catch (error) { throw contextualError(error, file, 'stage'); }
}

function verifyGit(options) {
  const input = deliveryOptions(options);
  const ref = options.ref || 'index';
  if (ref !== 'index' && !/^[0-9a-f]{40}$/.test(ref)) throw new Error('ref must be index or a full 40-character commit SHA');
  const { receipt } = loadReceipt(input, options.receiptPath);
  if (ref !== 'index') git(input.destinationDir, ['merge-base', '--is-ancestor', receipt.baseCommit, ref]);
  return verify({ ...input, ref, stagePaths: receipt.stagePaths, deletedPaths: receipt.deletedPaths, baseCommit: receipt.baseCommit });
}

function parseArgs(argv) {
  const [command, ...args] = argv;
  if (!command || command === '--help') return { command: 'help' };
  if (!['check', 'prepare', 'transfer', 'stage', 'verify'].includes(command)) throw new Error('unknown command: ' + command);
  const options = { command };
  const keys = { '--name': 'name', '--previous-release': 'previousReleasePath', '--bundle': 'bundlePath',
    '--destination': 'destinationDir', '--profile': 'profile', '--ref': 'ref', '--receipt': 'receiptPath' };
  const allowed = {
    check: ['--name', '--previous-release'], prepare: ['--name', '--previous-release'],
    transfer: ['--bundle', '--destination', '--profile', '--apply', '--stage'],
    stage: ['--receipt'],
    verify: ['--bundle', '--destination', '--profile', '--ref', '--receipt']
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!allowed[command].includes(arg)) throw new Error('unexpected option: ' + arg);
    if (arg === '--apply' || arg === '--stage') options[arg.slice(2)] = true;
    else {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('missing value: ' + arg);
      options[keys[arg]] = args[++i];
    }
  }
  return options;
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.command === 'help') {
    console.log('Local-only publication helper (no commit/push/deploy):\n'
      + '  check   [--name NAME] [--previous-release FILE]  local checks; dirty allowed, no candidate\n'
      + '  prepare [--name NAME] [--previous-release FILE]  clean source -> candidate; defaults to last published new release\n'
      + '  transfer --bundle FILE --destination DIR --profile new|legacy [--apply [--stage]]\n'
      + '  stage --receipt FILE  resume without regeneration or copying\n'
      + '  verify --bundle FILE --destination DIR --profile new|legacy [--ref index|FULL_SHA] [--receipt FILE]\n'
      + '  Receipt evidence is mandatory; omitted --receipt is resolved automatically, never skipped.');
    return;
  }
  const result = ['check', 'prepare'].includes(options.command) ? await prepare(options)
    : options.command === 'transfer' ? transfer(options) : options.command === 'stage' ? stageReceipt(options) : verifyGit(options);
  console.log(JSON.stringify(result, null, 2));
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });

module.exports = { prepare, preflight, transfer, stageReceipt, verifyGit, parseArgs, loadBundle };
