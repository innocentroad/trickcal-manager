#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { loadBundle, verifyGit } = require('./public-site-publication.js');
const { git } = require('./verify-public-site-git.js');
const { readGitState } = require('./public-site-candidate.js');
const { identityFor } = require('./transfer-public-site-artifact.js');
const { saveJson } = require('./public-site-receipt.js');
const ROOT = path.resolve(__dirname, '..');
const HISTORY = path.join(ROOT, 'backups', 'publication-history');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

function targetFor(config, profile) {
  if (!['dual', 'new-only'].includes(config.mode) || !['active', 'frozen', 'closed'].includes(config.legacyState)) throw new Error('invalid publication mode');
  if (config.mode === 'dual' && config.legacyState !== 'active') throw new Error('dual mode requires active legacy');
  if (config.mode === 'new-only' && config.legacyState === 'active') throw new Error('new-only mode requires explicit frozen/closed legacy state');
  if (!['new', 'legacy'].includes(profile) || (profile === 'legacy' && config.mode !== 'dual')) throw new Error('legacy publication disabled by migration policy');
  const target = config[profile];
  if (!target || !/^innocentroad\/[a-zA-Z0-9_-]+$/.test(target.repository)
    || !/^[\w.-]+\.yml$/.test(target.workflow) || !/^[\w/-]+$/.test(target.branch)
    || !/^[\w/-]+$/.test(target.workflowBranch)) throw new Error('invalid target configuration');
  return target;
}
function normalizeRemote(value) {
  return value.trim().replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git$/, '').replace(/\/$/, '');
}
function makePlan(options) {
  const config = readJson(path.join(ROOT, 'tools', 'publication-targets.json'));
  const target = targetFor(config, options.profile);
  const bundle = loadBundle(options.bundlePath);
  const destinationDir = path.resolve(ROOT, target.destination);
  const state = readGitState(destinationDir);
  if (!state.available || state.dirty) throw new Error('committed clean receiver is required');
  if (git(destinationDir, ['branch', '--show-current']).trim() !== target.branch) throw new Error('receiver branch mismatch');
  if (normalizeRemote(git(destinationDir, ['remote', 'get-url', '--push', 'origin'])) !== 'https://github.com/' + target.repository) throw new Error('receiver push remote mismatch');
  const artifactCommit = options.ref || state.head;
  if (state.head !== artifactCommit) throw new Error('receiver HEAD differs from requested artifact commit');
  const verified = verifyGit({ bundlePath: bundle.bundlePath, destinationDir, profile: options.profile, ref: artifactCommit, receiptPath: options.receiptPath });
  const candidate = readJson(bundle.candidateRecordPath);
  return { config, target, profile: options.profile, bundle, destinationDir, artifactCommit,
    expectedIdentity: identityFor(candidate, options.profile), workflowInputs: verified.workflowInputs,
    release: readJson(bundle.releasePath), historyDir: HISTORY };
}

function createClient(plan) {
  let token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    try { token = execFileSync('gh', ['auth', 'token', '--hostname', 'github.com'], { encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
    catch (_) { /* Try the existing Git credential helper, without prompting. */ }
  }
  if (!token) {
    try {
      const saved = execFileSync('git', ['-C', plan.destinationDir, 'credential', 'fill'], {
        input: 'protocol=https\nhost=github.com\npath=' + plan.target.repository + '.git\n\n',
        encoding: 'utf8', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never' }
      });
      token = saved.split(/\r?\n/).find(line => line.startsWith('password='))?.slice('password='.length);
    } catch (_) { /* No new login/account/permission is requested. */ }
  }
  if (!token) throw new Error('GitHub authentication unavailable. Use the browser handoff from plan; no tools/settings were installed or changed.');
  return {
    async api(method, endpoint, body) {
      const response = await fetch('https://api.github.com/' + endpoint, {
        method, redirect: 'error', signal: AbortSignal.timeout(30000),
        headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + token,
          'X-GitHub-Api-Version': '2026-03-10', 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      if (!response.ok) throw new Error('GitHub API ' + response.status + ': ' + method + ' ' + endpoint + '; no bypass/retry performed');
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    },
    async identity(url, candidateId) {
      const checkUrl = new URL(url); checkUrl.searchParams.set('publication', candidateId);
      const response = await fetch(checkUrl, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('public identity HTTP ' + response.status);
      return response.json();
    },
    push(plan) {
      // Explicit non-force refspec; never push source/main or other branches.
      git(plan.destinationDir, ['push', 'origin', plan.artifactCommit + ':refs/heads/' + plan.target.branch]);
    }
  };
}
function assertRun(run, plan, record) {
  if (run.repository?.full_name !== plan.target.repository || run.event !== 'workflow_dispatch'
    || run.head_branch !== plan.target.workflowBranch || run.head_sha !== record.workflowCommit
    || run.workflow_id !== record.workflowId || !Number.isSafeInteger(run.id)
    || (record.runId && run.id !== record.runId)) throw new Error('run repository/workflow/commit mismatch');
  if (!Number.isFinite(Date.parse(run.created_at)) || !Number.isFinite(Date.parse(record.requestedAt))
    || Date.parse(run.created_at) < Date.parse(record.requestedAt) - 5000) throw new Error('run predates this dispatch or lacks a valid timestamp');
}
function historyFile(plan) { return path.join(plan.historyDir, plan.bundle.candidateId + '-' + plan.profile + '.json'); }
function readOptional(file) { return fs.existsSync(file) ? readJson(file) : null; }

// One bounded step per invocation. Repeating with the same bundle follows the
// saved run; it never blindly dispatches or re-runs a job after an unknown result.
async function advance(plan, options, client) {
  targetFor(plan.config, plan.profile);
  const key = crypto.createHash('sha256').update(plan.target.repository.toLowerCase()).digest('hex');
  fs.mkdirSync(plan.historyDir, { recursive: true });
  const lock = path.join(plan.historyDir, 'target-' + key + '.lock');
  try { fs.mkdirSync(lock); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('publication locked: ' + lock + '; confirm the owner has stopped and inspect GitHub runs before manual recovery; no automatic unlock');
    throw error;
  }
  try {
    fs.writeFileSync(path.join(lock, 'owner.json'), JSON.stringify({ pid: process.pid,
      repository: plan.target.repository, candidateId: plan.bundle.candidateId, startedAt: new Date().toISOString() }), { flag: 'wx' });
    return await advanceLocked(plan, options, client);
  } finally {
    const owner = path.join(lock, 'owner.json');
    if (fs.existsSync(owner)) fs.unlinkSync(owner);
    fs.rmdirSync(lock);
  }
}

async function advanceLocked(plan, options, client) {
  const { target, profile, bundle } = plan;
  targetFor(plan.config, profile);
  const file = historyFile(plan);
  let record = readOptional(file);
  if (record && (record.artifactCommit !== plan.artifactCommit || record.repository !== target.repository
    || record.candidateId !== bundle.candidateId || record.profile !== profile)) throw new Error('saved publication identity mismatch');
  if (profile === 'legacy') {
    const newSuccess = readOptional(path.join(plan.historyDir, bundle.candidateId + '-new.json'));
    if (!newSuccess?.success) throw new Error('new deploy + identity confirmation must succeed before legacy');
    const currentNew = await client.identity(plan.config.new.identityUrl, bundle.candidateId);
    assert.deepEqual(currentNew, newSuccess.identity, 'new identity changed; legacy blocked');
  }
  const base = 'repos/' + target.repository;
  if (!record && options.runId !== undefined) {
    if (!Number.isSafeInteger(options.runId) || options.runId <= 0 || !options.confirmRunInputs) {
      throw new Error('existing run import requires a positive run ID and --confirm-run-inputs; no push/dispatch performed');
    }
    const workflow = await client.api('GET', base + '/actions/workflows/' + target.workflow);
    if (workflow.state !== 'active' || workflow.path !== '.github/workflows/' + target.workflow) throw new Error('existing workflow is not active/matching');
    const workflowBranch = await client.api('GET', base + '/branches/' + encodeURIComponent(target.workflowBranch));
    if (profile === 'new' && workflowBranch.commit.sha !== plan.artifactCommit) throw new Error('new workflow commit changed');
    const attached = await client.api('GET', base + '/actions/runs/' + options.runId);
    record = { schemaVersion: 1, candidateId: bundle.candidateId, profile, repository: target.repository,
      artifactCommit: plan.artifactCommit, workflowCommit: workflowBranch.commit.sha, workflowId: workflow.id,
      requestedAt: attached.created_at, importedAt: new Date().toISOString(), dispatchState: 'known', runId: options.runId,
      identity: plan.expectedIdentity, release: plan.release, success: false };
    // No local dispatch timestamp exists for a browser-started run. Its inputs
    // require explicit operator confirmation; all available run bindings still match.
    assertRun(attached, plan, record);
    saveJson(file, record);
  }
  if (!record) {
    const remote = await client.api('GET', base + '/branches/' + encodeURIComponent(target.branch));
    if (remote.commit.sha !== plan.artifactCommit) client.push(plan);
    const pushed = await client.api('GET', base + '/branches/' + encodeURIComponent(target.branch));
    if (pushed.commit.sha !== plan.artifactCommit) throw new Error('remote artifact branch differs from verified commit');
    const workflow = await client.api('GET', base + '/actions/workflows/' + target.workflow);
    if (workflow.state !== 'active' || workflow.path !== '.github/workflows/' + target.workflow) throw new Error('existing workflow is not active/matching');
    const workflowBranch = await client.api('GET', base + '/branches/' + encodeURIComponent(target.workflowBranch));
    if (profile === 'new' && workflowBranch.commit.sha !== plan.artifactCommit) throw new Error('new workflow commit changed');
    record = { schemaVersion: 1, candidateId: bundle.candidateId, profile, repository: target.repository,
      artifactCommit: plan.artifactCommit, workflowCommit: workflowBranch.commit.sha, workflowId: workflow.id,
      requestedAt: new Date().toISOString(), dispatchState: 'requested', runId: null,
      identity: plan.expectedIdentity, release: plan.release, success: false };
    // Under the target lock, save BEFORE dispatch to prevent blind redispatch.
    saveJson(file, record);
    try {
      const dispatched = await client.api('POST', base + '/actions/workflows/' + target.workflow + '/dispatches', {
        ref: target.workflowBranch, inputs: plan.workflowInputs
      });
      if (Number.isSafeInteger(dispatched?.workflow_run_id)) {
        record.runId = dispatched.workflow_run_id; record.dispatchState = 'known'; saveJson(file, record);
      }
    } catch (error) {
      return { ok: false, state: 'dispatch-unknown', recordPath: file, error: error.message,
        next: 'Inspect existing runs; do not dispatch again. Use --run-id ID --confirm-run-inputs only after confirming the submitted inputs.' };
    }
  }
  if (!record.runId) {
    if (!options.runId || !options.confirmRunInputs) {
      const runs = await client.api('GET', base + '/actions/workflows/' + target.workflow + '/runs?event=workflow_dispatch&per_page=20');
      const candidates = (runs.workflow_runs || []).filter(run => {
        try { assertRun(run, plan, record); return true; } catch (_) { return false; }
      }).map(run => ({ id: run.id, url: run.html_url }));
      return { ok: false, state: 'dispatch-unknown', recordPath: file, candidates,
        next: 'Confirm run inputs in GitHub, then --run-id ID --confirm-run-inputs. No automatic redispatch.' };
    }
    const attached = await client.api('GET', base + '/actions/runs/' + options.runId);
    if (attached.id !== options.runId) throw new Error('requested run ID mismatch');
    assertRun(attached, plan, record);
    record.runId = attached.id; record.dispatchState = 'known'; saveJson(file, record);
  } else if (options.runId && options.runId !== record.runId) throw new Error('requested run differs from saved run');
  const run = await client.api('GET', base + '/actions/runs/' + record.runId);
  assertRun(run, plan, record);
  const runUrl = 'https://github.com/' + target.repository + '/actions/runs/' + record.runId;
  if (run.status === 'completed') {
    if (run.conclusion !== 'success') return { ok: false, state: 'run-failed', conclusion: run.conclusion, runUrl, recordPath: file };
    try { assert.deepEqual(await client.identity(target.identityUrl, bundle.candidateId), plan.expectedIdentity); }
    catch (_) { return { ok: false, state: 'identity-pending-or-mismatch', runUrl, recordPath: file, next: 'Recheck this same run; do not redeploy to fix an identity mismatch.' }; }
    record.success = true; record.confirmedAt = new Date().toISOString(); record.runUrl = runUrl;
    saveJson(file, record);
    // Per-profile pointers: a frozen legacy can never hold back new releases.
    saveJson(path.join(plan.historyDir, 'latest-' + profile + '.json'), record);
    saveJson(path.join(plan.historyDir, 'latest-' + profile + '-release.json'), plan.release);
    return { ok: true, state: 'published', profile, runUrl, recordPath: file };
  }
  const pending = await client.api('GET', base + '/actions/runs/' + record.runId + '/pending_deployments');
  if (pending.length) {
    if (pending.some(item => !target.environments.includes(item.environment.name))) throw new Error('unexpected approval environment; no approval submitted');
    if (!options.approveDeployments || pending.some(item => item.current_user_can_approve !== true)) {
      return { ok: false, state: 'approval-required', runUrl, environments: pending.map(x => x.environment.name),
        reason: options.approveDeployments ? 'GitHub does not permit this account to approve; request an eligible reviewer.' : 'Approval delegation was not requested.' };
    }
    await client.api('POST', base + '/actions/runs/' + record.runId + '/pending_deployments', {
      environment_ids: pending.map(x => x.environment.id), state: 'approved', comment: 'Requested publication: ' + bundle.candidateId
    });
    return { ok: true, state: 'approval-submitted', runUrl, next: 'Resume this same command to follow the run.' };
  }
  return { ok: true, state: 'running', runUrl, next: 'Resume this same command after 15-30 seconds.' };
}

function parseArgs(args) {
  const options = {};
  const values = { '--bundle': 'bundlePath', '--profile': 'profile', '--receipt': 'receiptPath', '--ref': 'ref', '--run-id': 'runId' };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help') options.help = true;
    else if (arg === '--execute') options.execute = true;
    else if (arg === '--approve-deployments') options.approveDeployments = true;
    else if (arg === '--confirm-run-inputs') options.confirmRunInputs = true;
    else if (values[arg] && args[i + 1] && !args[i + 1].startsWith('--')) options[values[arg]] = args[++i];
    else throw new Error('unknown/missing option: ' + arg);
  }
  if (options.runId) {
    if (!/^\d+$/.test(options.runId) || !Number.isSafeInteger(Number(options.runId)) || Number(options.runId) <= 0) throw new Error('invalid run ID');
    options.runId = Number(options.runId);
  }
  return options;
}
async function main(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  if (options.help) {
    console.log('publish-public-site.js --bundle FILE --profile new|legacy [--receipt FILE] [--ref FULL_SHA]\n'
      + 'Default: local verified plan only. --execute permits push/dispatch/resume.\n'
      + '--approve-deployments delegates ordinary approval for this run only.\n'
      + 'Unknown dispatch recovery: --run-id ID --confirm-run-inputs (after checking inputs).'); return;
  }
  const plan = makePlan(options);
  if (!options.execute) {
    console.log(JSON.stringify({ ok: true, execute: false, mode: plan.config.mode, profile: plan.profile,
      repository: plan.target.repository, artifactCommit: plan.artifactCommit, workflow: plan.target.workflow,
      workflowBranch: plan.target.workflowBranch, inputs: plan.workflowInputs,
      browserUrl: 'https://github.com/' + plan.target.repository + '/actions/workflows/' + plan.target.workflow }, null, 2)); return;
  }
  const result = await advance(plan, options, createClient(plan));
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 2;
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { advance, assertRun, makePlan, parseArgs, targetFor, normalizeRemote };
