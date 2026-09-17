'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { advance, parseArgs, targetFor } = require('./publish-public-site.js');
const config = require('./publication-targets.json');

async function main() {
  assert.equal(parseArgs(['--bundle', 'x', '--profile', 'new']).execute, undefined);
  assert.throws(() => parseArgs(['--force']), /unknown/);
  assert.throws(() => parseArgs(['--run-id', '0']), /invalid run ID/);
  const frozen = { ...config, mode: 'new-only', legacyState: 'frozen' };
  assert.equal(targetFor(frozen, 'new'), config.new);
  assert.throws(() => targetFor(frozen, 'legacy'), /disabled/);
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-publish-mock-'));
  const sha = 'a'.repeat(40);
  const candidateId = 'b'.repeat(16);
  const makePlan = (label, profile = 'new', configuration = config) => ({ config: configuration, target: config[profile], profile,
    bundle: { candidateId }, artifactCommit: sha, historyDir: path.join(scratch, label), release: { releaseId: 'fixture' },
    expectedIdentity: { candidateId, sourceCommit: sha, profile, digest: { contentDigest: 'c', outputDigest: profile } },
    workflowInputs: { candidate_id: candidateId }, destinationDir: 'never-used' });
  function mock(plan, overrides = {}) {
    const calls = [];
    const settings = { dispatchFails: false, status: 'in_progress', conclusion: null, pending: [], identityMatches: true, ...overrides };
    const run = () => ({ id: 17, repository: { full_name: plan.target.repository }, workflow_id: 3,
      event: 'workflow_dispatch', head_branch: plan.target.workflowBranch, head_sha: sha,
      created_at: new Date().toISOString(), status: settings.status, conclusion: settings.conclusion,
      html_url: 'https://github.com/' + plan.target.repository + '/actions/runs/17', ...settings.runOverrides });
    const client = {
      push() { calls.push('push'); },
      async identity(url) {
        calls.push('identity:' + url);
        if (!settings.identityMatches) return { wrong: true };
        return plan.profile === 'legacy' && url === config.new.identityUrl
          ? { ...plan.expectedIdentity, profile: 'new', digest: { ...plan.expectedIdentity.digest, outputDigest: 'new' } }
          : plan.expectedIdentity;
      },
      async api(method, endpoint, body) {
        calls.push(method + ':' + endpoint);
        if (method === 'POST' && endpoint.endsWith('/dispatches')) {
          if (settings.dispatchFails) throw new Error('simulated lost response');
          return { workflow_run_id: 17 };
        }
        if (method === 'POST' && endpoint.endsWith('/pending_deployments')) {
          assert.equal(body.state, 'approved'); return [];
        }
        if (endpoint.includes('/branches/')) return { commit: { sha } };
        if (endpoint.endsWith('/pending_deployments')) return settings.pending;
        if (endpoint.includes('/runs?')) return { workflow_runs: [run()] };
        if (endpoint.endsWith('/runs/17')) return run();
        if (endpoint.includes('/actions/workflows/')) return { id: 3, state: 'active', path: '.github/workflows/' + plan.target.workflow };
        throw new Error('unexpected API call: ' + endpoint);
      }
    };
    return { client, calls, settings };
  }
  try {
    const imported = makePlan('browser-import');
    const browser = mock(imported, { runOverrides: { created_at: '2026-09-01T00:00:00Z' } });
    await assert.rejects(() => advance(imported, { runId: 17 }, browser.client), /confirm-run-inputs/);
    assert.deepEqual(browser.calls, []);
    assert.equal((await advance(imported, { runId: 17, confirmRunInputs: true }, browser.client)).state, 'running');
    assert.equal((await advance(imported, {}, browser.client)).state, 'running');
    assert.equal(browser.calls.some(x => x === 'push' || x.startsWith('POST:')), false);
    for (const runOverrides of [{ id: 18 }, { head_sha: 'd'.repeat(40) }, { workflow_id: 4 },
      { repository: { full_name: config.legacy.repository } }, { created_at: 'invalid' }]) {
      const invalid = makePlan('invalid-import');
      const bad = mock(invalid, { runOverrides });
      await assert.rejects(() => advance(invalid, { runId: 17, confirmRunInputs: true }, bad.client), /mismatch|timestamp/);
      assert.equal(bad.calls.some(x => x === 'push' || x.startsWith('POST:')), false);
      assert.deepEqual(fs.readdirSync(invalid.historyDir), []);
    }
    const parallel = makePlan('parallel'); const concurrent = mock(parallel);
    const pair = await Promise.allSettled([advance(parallel, {}, concurrent.client), advance(parallel, {}, concurrent.client)]);
    assert.equal(pair[0].status, 'fulfilled');
    assert.equal(pair[1].status, 'rejected');
    assert.match(pair[1].reason.message, /publication locked/);
    assert.equal(concurrent.calls.filter(x => x.endsWith('/dispatches')).length, 1);
    assert.equal((await advance(parallel, {}, concurrent.client)).state, 'running');
    assert.equal(concurrent.calls.filter(x => x.endsWith('/dispatches')).length, 1);

    // Different candidates for the same target share the same lock, too.
    const shared = makePlan('shared-target'); const first = mock(shared);
    const other = { ...shared, bundle: { candidateId: 'e'.repeat(16) } }; const second = mock(other);
    const competitors = await Promise.allSettled([advance(shared, {}, first.client), advance(other, {}, second.client)]);
    assert.equal(competitors[0].status, 'fulfilled');
    assert.equal(competitors[1].status, 'rejected');
    assert.deepEqual(second.calls, []);

    const abandoned = makePlan('abandoned'); const blockedLock = mock(abandoned);
    fs.mkdirSync(abandoned.historyDir, { recursive: true });
    const key = require('node:crypto').createHash('sha256').update(abandoned.target.repository.toLowerCase()).digest('hex');
    const lock = path.join(abandoned.historyDir, 'target-' + key + '.lock');
    fs.mkdirSync(lock);
    await assert.rejects(() => advance(abandoned, {}, blockedLock.client), /no automatic unlock/);
    assert.equal(fs.existsSync(lock), true);
    assert.deepEqual(blockedLock.calls, []);

    const plan = makePlan('normal');
    const m = mock(plan);
    assert.equal((await advance(plan, {}, m.client)).state, 'running');
    m.settings.pending = [{ environment: { id: 9, name: 'github-pages' }, current_user_can_approve: false }];
    assert.equal((await advance(plan, { approveDeployments: true }, m.client)).state, 'approval-required');
    assert.equal(m.calls.some(x => x.startsWith('POST:') && x.endsWith('/pending_deployments')), false);
    m.settings.pending[0].current_user_can_approve = true;
    assert.equal((await advance(plan, {}, m.client)).state, 'approval-required');
    assert.equal((await advance(plan, { approveDeployments: true }, m.client)).state, 'approval-submitted');
    m.settings.pending = []; m.settings.status = 'completed'; m.settings.conclusion = 'success';
    m.settings.identityMatches = false;
    assert.equal((await advance(plan, {}, m.client)).state, 'identity-pending-or-mismatch');
    assert.equal(fs.existsSync(path.join(plan.historyDir, 'latest-new-release.json')), false);
    m.settings.identityMatches = true;
    assert.equal((await advance(plan, {}, m.client)).state, 'published');
    assert.equal(m.calls.filter(x => x.endsWith('/dispatches')).length, 1);
    assert.equal(fs.existsSync(path.join(plan.historyDir, 'latest-new-release.json')), true);
    const legacyPlan = makePlan('normal', 'legacy'); const legacy = mock(legacyPlan);
    assert.equal((await advance(legacyPlan, {}, legacy.client)).state, 'running');
    for (const environment of ['legacy-pages-delivery-approval', 'github-pages']) {
      legacy.settings.pending = [{ environment: { id: 10, name: environment }, current_user_can_approve: true }];
      assert.equal((await advance(legacyPlan, { approveDeployments: true }, legacy.client)).state, 'approval-submitted');
    }
    legacy.settings.status = 'completed'; legacy.settings.conclusion = 'success';
    assert.equal((await advance(legacyPlan, {}, legacy.client)).state, 'published');
    assert.equal(fs.existsSync(path.join(plan.historyDir, 'latest-legacy-release.json')), true);
    const unexpected = makePlan('unexpected'); const unsafe = mock(unexpected, {
      pending: [{ environment: { id: 1, name: 'unapproved-environment' }, current_user_can_approve: true }]
    });
    await assert.rejects(() => advance(unexpected, { approveDeployments: true }, unsafe.client), /unexpected approval/);
    assert.equal(unsafe.calls.some(x => x.startsWith('POST:') && x.endsWith('/pending_deployments')), false);

    const unknown = makePlan('unknown'); const lost = mock(unknown, { dispatchFails: true });
    assert.equal((await advance(unknown, {}, lost.client)).state, 'dispatch-unknown');
    assert.equal((await advance(unknown, {}, lost.client)).state, 'dispatch-unknown');
    assert.equal(lost.calls.filter(x => x.endsWith('/dispatches')).length, 1);
    assert.equal((await advance(unknown, { runId: 17, confirmRunInputs: true }, lost.client)).state, 'running');
    const denied = makePlan('legacy-first', 'legacy'); const blocked = mock(denied);
    await assert.rejects(() => advance(denied, {}, blocked.client), /new deploy/);
    assert.deepEqual(blocked.calls, []);

    const newOnly = makePlan('new-only', 'new', frozen); const fresh = mock(newOnly, { status: 'completed', conclusion: 'success' });
    assert.equal((await advance(newOnly, {}, fresh.client)).state, 'published');
    assert.equal(fresh.calls.some(x => x.includes(config.legacy.repository + '/') || x.includes(config.legacy.identityUrl)), false);
    await assert.rejects(() => advance({ ...newOnly, profile: 'legacy' }, {}, fresh.client), /disabled/);
    console.log('GitHub publication mock tests passed: browser import without push/dispatch, target locking, stale-lock stop, explicit execution, one dispatch, unknown response recovery, normal approval only, identity gate, per-profile history, new-only excludes legacy');
  } finally { fs.rmSync(scratch, { recursive: true, force: true }); }
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
