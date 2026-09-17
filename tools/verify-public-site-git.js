'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const {
  IDENTITY_FILE, LEDGER_FILE, identityFor, makeLedger,
  readAndValidateInputs, stageProfileFiles
} = require('./transfer-public-site-artifact.js');

function git(root, args, options = {}) {
  return execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8', timeout: 30000, maxBuffer: 32 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'], ...options
  });
}

function blobId(bytes, algorithm) {
  return crypto.createHash(algorithm).update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
}

function readEntries(root, ref) {
  if (ref !== 'index' && !/^[0-9a-f]{40}$/.test(ref)) {
    throw new Error('ref must be index or a full 40-character commit SHA (not HEAD or a short SHA)');
  }
  const raw = ref === 'index'
    ? git(root, ['ls-files', '--stage', '-z'])
    : git(root, ['ls-tree', '-r', '-z', '--full-tree', ref]);
  const entries = new Map();
  for (const line of raw.split('\0').filter(Boolean)) {
    const separator = line.indexOf('\t');
    const name = line.slice(separator + 1);
    const fields = line.slice(0, separator).split(' ');
    const [mode, oid, stage] = ref === 'index' ? fields : [fields[0], fields[2], '0'];
    if (stage !== '0' || entries.has(name)) throw new Error('unmerged/duplicate Git path: ' + name);
    entries.set(name, { mode, oid });
  }
  return entries;
}

// The expected bytes come from staging re-bound to candidate.profile.outputDigest,
// never from a possibly hand-edited receiver ledger. Comparing raw Git blob IDs
// catches autocrlf/clean-filter conversion without spawning Git once per asset.
function verify(options) {
  const started = performance.now();
  const ref = options.ref || 'index';
  const input = readAndValidateInputs(options);
  if (!input.ok) throw new Error(input.errors.join('\n'));
  const staged = stageProfileFiles({ ...input, stagingDir: options.stagingDir, profileName: options.profile });
  if (staged.errors.length) throw new Error(staged.errors.join('\n'));
  const entries = ref === 'worktree' ? null : readEntries(options.destinationDir, ref);
  const algorithm = git(options.destinationDir, ['rev-parse', '--show-object-format']).trim();
  if (!['sha1', 'sha256'].includes(algorithm)) throw new Error('unsupported Git object format');
  const expected = [];
  for (const file of staged.files) {
    const bytes = fs.readFileSync(path.join(staged.root, file.path));
    const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
    if (sha256 !== file.sha256) throw new Error('staging changed during verification: ' + file.path);
    expected.push({ path: file.path, bytes, sha256 });
  }
  const identity = Buffer.from(JSON.stringify(identityFor(input.candidate, options.profile), null, 2) + '\n');
  expected.push({ path: IDENTITY_FILE, bytes: identity, sha256: crypto.createHash('sha256').update(identity).digest('hex') });
  const expectedLedger = makeLedger(input.candidate, options.profile, expected);
  const errors = [];
  for (const file of expected) {
    const entry = entries?.get(file.path);
    const workingPath = path.join(options.destinationDir, file.path);
    const matches = ref === 'worktree'
      ? fs.existsSync(workingPath) && fs.lstatSync(workingPath).isFile() && fs.readFileSync(workingPath).equals(file.bytes)
      : entry && ['100644', '100755'].includes(entry.mode) && entry.oid === blobId(file.bytes, algorithm);
    if (!matches) {
      const workingMatches = fs.existsSync(workingPath) && fs.readFileSync(workingPath).equals(file.bytes);
      errors.push('candidate/Git bytes mismatch: ' + file.path + ' (working file matches candidate: ' + workingMatches + ')');
    }
  }
  const ledgerEntry = entries?.get(LEDGER_FILE);
  if (ref !== 'worktree' && (!ledgerEntry || ledgerEntry.mode !== '100644')) errors.push('missing/non-regular delivery ledger');
  else {
    try {
      const ledger = JSON.parse(ref === 'worktree'
        ? fs.readFileSync(path.join(options.destinationDir, LEDGER_FILE), 'utf8')
        : git(options.destinationDir, ['cat-file', 'blob', ledgerEntry.oid]));
      assert.deepEqual(ledger, expectedLedger);
    } catch (_) { errors.push('Git delivery ledger does not describe the candidate bytes'); }
  }
  for (const name of options.deletedPaths || []) {
    if (ref === 'worktree' ? fs.existsSync(path.join(options.destinationDir, name)) : entries.has(name)) errors.push('obsolete owned path remains: ' + name);
  }
  if (ref === 'index' || options.baseCommit) {
    const allowed = new Set(options.stagePaths || [...expected.map(file => file.path), LEDGER_FILE]);
    if (options.baseCommit && !/^[0-9a-f]{40}$/.test(options.baseCommit)) throw new Error('invalid delivery base commit');
    const comparison = ref === 'index' ? ['--cached', options.baseCommit || 'HEAD']
      : ref === 'worktree' ? [options.baseCommit] : [options.baseCommit, ref];
    for (const name of git(options.destinationDir, ['diff', '--name-only', '--no-renames', '-z', ...comparison, '--']).split('\0').filter(Boolean)) {
      if (!allowed.has(name)) errors.push('unrelated staged/committed path: ' + name);
    }
    if (ref === 'worktree') {
      for (const name of git(options.destinationDir, ['diff', '--cached', '--name-only', '--no-renames', '-z', options.baseCommit, '--']).split('\0').filter(Boolean)) {
        if (!allowed.has(name)) errors.push('unrelated staged path: ' + name);
      }
      for (const name of git(options.destinationDir, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean)) {
        if (!allowed.has(name)) errors.push('unrelated untracked path: ' + name);
      }
    }
  }
  if (errors.length) throw new Error(errors.slice(0, 12).join('\n') + (errors.length > 12 ? '\n... total ' + errors.length : ''));
  const workflowInputs = {
    candidate_id: input.candidate.candidateId,
    source_commit: input.candidate.sourceCommit,
    content_digest: input.candidate.contentDigest
  };
  if (options.profile === 'new') workflowInputs.profile = 'new';
  else {
    workflowInputs.legacy_output_digest = staged.outputDigest;
    workflowInputs.artifact_branch = 'legacy-site-artifact';
    if (ref !== 'index') workflowInputs.artifact_commit = ref;
  }
  return { ok: true, profile: options.profile, ref, candidateId: input.candidate.candidateId, fileCount: expected.length, workflowInputs, elapsedMs: Math.round(performance.now() - started) };
}

module.exports = { verify, git, blobId, readEntries };
