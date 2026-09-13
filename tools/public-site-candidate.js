'use strict';

const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const PROFILE_NAMES = ['new', 'legacy'];
const CANDIDATE_SCHEMA_VERSION = 1;
const CANDIDATE_PURPOSE = 'P5b checked public-site candidate';

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(item => stableStringify(item)).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function digestText(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function releaseProfileDigests(release) {
  return Object.fromEntries(PROFILE_NAMES.map(profileName => [
    profileName,
    release?.profiles?.find(profile => profile?.profile === profileName)?.outputDigest || ''
  ]));
}

function releaseProfileServiceWorkerHashes(release) {
  return Object.fromEntries(PROFILE_NAMES.map(profileName => [
    profileName,
    release?.profiles?.find(profile => profile?.profile === profileName)?.serviceWorker?.contentHash || ''
  ]));
}

function requiredCheckBinding(release) {
  return {
    sourceCommit: release?.sourceCommit || '',
    contentDigest: release?.contentDigest || '',
    profiles: releaseProfileDigests(release)
  };
}

function parseExpectedProfileDigests(value) {
  if (!value) return {};
  const result = {};
  for (const item of String(value).split(',')) {
    const [profile, digest] = item.split('=');
    if (!PROFILE_NAMES.includes(profile) || !/^[0-9a-f]{16}$/.test(digest || '')) {
      throw new Error(`expected-profile-digestsが不正です: ${item}`);
    }
    if (result[profile]) throw new Error(`expected-profile-digestsが重複しています: ${profile}`);
    result[profile] = digest;
  }
  return result;
}

function validateBoundChecks(values, release) {
  const errors = [];
  const required = ['generationCheck', 'manifestValidate', 'publicSiteTest', 'httpCheck'];
  if (!isRecord(values)) {
    return {
      ok: false,
      errors: ['check evidenceがobjectではありません'],
      binding: requiredCheckBinding(release)
    };
  }
  for (const key of required) {
    if (values[key] !== true) errors.push(`${key}がtrueではありません`);
  }
  const binding = requiredCheckBinding(release);
  if (values.sourceCommit !== binding.sourceCommit) {
    errors.push(values.sourceCommit
      ? 'check evidenceのsourceCommitがreleaseと不一致です'
      : 'check evidenceのsourceCommitが欠落しています');
  }
  if (values.contentDigest !== binding.contentDigest) {
    errors.push(values.contentDigest
      ? 'check evidenceのcontentDigestがreleaseと不一致です'
      : 'check evidenceのcontentDigestが欠落しています');
  }
  for (const profileName of PROFILE_NAMES) {
    if (values.profiles?.[profileName] !== binding.profiles[profileName]) {
      errors.push(values.profiles?.[profileName]
        ? `check evidenceの${profileName} outputDigestがreleaseと不一致です`
        : `check evidenceの${profileName} outputDigestが欠落しています`);
    }
  }
  if (values.releaseId != null && values.releaseId !== release?.releaseId) {
    errors.push('check evidenceのreleaseIdがreleaseと不一致です');
  }
  return { ok: errors.length === 0, errors, binding };
}

function candidateIdentity(record) {
  return {
    schemaVersion: record.schemaVersion,
    purpose: record.purpose,
    releaseId: record.releaseId,
    releaseStatus: record.releaseStatus,
    releaseDirty: record.releaseDirty,
    sourceCommit: record.sourceCommit,
    contentDigest: record.contentDigest,
    profiles: PROFILE_NAMES.map(profileName => ({
      profile: profileName,
      outputDigest: record.profiles?.[profileName]?.outputDigest || '',
      serviceWorkerContentHash: record.profiles?.[profileName]?.serviceWorkerContentHash || ''
    })),
    checks: {
      generationCheck: record.checks?.generationCheck === true,
      manifestValidate: record.checks?.manifestValidate === true,
      publicSiteTest: record.checks?.publicSiteTest === true,
      httpCheck: record.checks?.httpCheck === true,
      sourceCommit: record.checks?.sourceCommit || '',
      contentDigest: record.checks?.contentDigest || '',
      profiles: PROFILE_NAMES.reduce((result, profileName) => {
        result[profileName] = record.checks?.profiles?.[profileName] || '';
        return result;
      }, {})
    },
    git: {
      head: record.git?.head || '',
      dirty: record.git?.dirty === true
    }
  };
}

function calculateCandidateId(record) {
  return digestText(stableStringify(candidateIdentity(record))).slice(0, 16);
}

function createCandidateRecord({ release, checks, gitState }) {
  const outputDigests = releaseProfileDigests(release);
  const serviceWorkerContentHashes = releaseProfileServiceWorkerHashes(release);
  const record = {
    schemaVersion: CANDIDATE_SCHEMA_VERSION,
    purpose: CANDIDATE_PURPOSE,
    releaseId: release.releaseId,
    releaseStatus: release.status,
    releaseDirty: release.dirty,
    sourceCommit: release.sourceCommit,
    contentDigest: release.contentDigest,
    profiles: Object.fromEntries(PROFILE_NAMES.map(profileName => [profileName, {
      outputDigest: outputDigests[profileName],
      serviceWorkerContentHash: serviceWorkerContentHashes[profileName]
    }])),
    checks: {
      generationCheck: checks.generationCheck === true,
      manifestValidate: checks.manifestValidate === true,
      publicSiteTest: checks.publicSiteTest === true,
      httpCheck: checks.httpCheck === true,
      sourceCommit: checks.sourceCommit,
      contentDigest: checks.contentDigest,
      profiles: Object.fromEntries(PROFILE_NAMES.map(profileName => [
        profileName,
        checks.profiles?.[profileName] || ''
      ]))
    },
    git: {
      head: gitState.head,
      dirty: gitState.dirty
    }
  };
  record.candidateId = calculateCandidateId(record);
  return record;
}

function validateCandidateRecord(record, { release, checks, gitState } = {}) {
  const errors = [];
  if (!isRecord(record)) errors.push('candidate recordがobjectではありません');
  if (!isRecord(release)) errors.push('release recordがありません');
  if (errors.length) return { ok: false, errors };
  if (record.schemaVersion !== CANDIDATE_SCHEMA_VERSION) errors.push('candidate recordのschemaVersionが不正です');
  if (record.purpose !== CANDIDATE_PURPOSE) errors.push('candidate recordのpurposeが不正です');
  if (record.releaseId !== release.releaseId) errors.push('candidate recordのreleaseIdが不一致です');
  if (record.releaseStatus !== release.status) errors.push('candidate recordのrelease statusが不一致です');
  if (record.releaseDirty !== release.dirty) errors.push('candidate recordのrelease dirtyが不一致です');
  if (record.releaseDirty !== false) errors.push('candidate recordがclean releaseではありません');
  if (record.sourceCommit !== release.sourceCommit) errors.push('candidate recordのsourceCommitが不一致です');
  if (record.contentDigest !== release.contentDigest) errors.push('candidate recordのcontentDigestが不一致です');

  const outputDigests = releaseProfileDigests(release);
  const serviceWorkerContentHashes = releaseProfileServiceWorkerHashes(release);
  for (const profileName of PROFILE_NAMES) {
    if (record.profiles?.[profileName]?.outputDigest !== outputDigests[profileName]) {
      errors.push(`candidate recordの${profileName} outputDigestが不一致です`);
    }
    if (record.profiles?.[profileName]?.serviceWorkerContentHash !== serviceWorkerContentHashes[profileName]) {
      errors.push(`candidate recordの${profileName} Service Worker hashが不一致です`);
    }
  }

  const checkResult = validateBoundChecks(checks, release);
  errors.push(...checkResult.errors.map(error => `external checks: ${error}`));
  const candidateCheckResult = validateBoundChecks(record.checks, release);
  errors.push(...candidateCheckResult.errors.map(error => `candidate checks: ${error}`));
  if (checkResult.ok && candidateCheckResult.ok) {
    for (const key of ['generationCheck', 'manifestValidate', 'publicSiteTest', 'httpCheck', 'sourceCommit', 'contentDigest']) {
      if (record.checks[key] !== checks[key]) errors.push(`candidate checksの${key}が外部checksと不一致です`);
    }
    for (const profileName of PROFILE_NAMES) {
      if (record.checks.profiles[profileName] !== checks.profiles[profileName]) {
        errors.push(`candidate checksの${profileName} outputDigestが外部checksと不一致です`);
      }
    }
  }

  if (!isRecord(record.git) || record.git.head !== release.sourceCommit || record.git.dirty !== false) {
    errors.push('candidate recordのGit証拠がclean releaseと一致しません');
  }
  if (gitState && (gitState.head !== record.git?.head || gitState.dirty !== record.git?.dirty)) {
    errors.push('現在のGit HEAD／dirty状態がcandidate recordと不一致です');
  }
  if (!/^[0-9a-f]{16}$/.test(record.candidateId || '') || record.candidateId !== calculateCandidateId(record)) {
    errors.push('candidateIdがrecord内容と不一致です');
  }
  return { ok: errors.length === 0, errors };
}

function readGitState(repoRoot) {
  let head = '';
  try {
    head = execFileSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch (error) {
    return {
      available: false,
      head: '',
      dirty: true,
      reason: `git rev-parse HEADに失敗しました: ${error.code || '実行エラー'}`
    };
  }
  if (!/^[0-9a-f]{40}$/i.test(head)) {
    return {
      available: false,
      head: '',
      dirty: true,
      reason: 'git rev-parse HEADが40桁commitを返しませんでした'
    };
  }
  try {
    const status = execFileSync('git', [
      '-C', repoRoot,
      'status',
      '--porcelain',
      '--untracked-files=all'
    ], { encoding: 'utf8' });
    return {
      available: true,
      head,
      dirty: !!status.trim(),
      reason: ''
    };
  } catch (error) {
    return {
      available: false,
      head,
      dirty: true,
      reason: `git statusに失敗しました: ${error.code || '実行エラー'}`
    };
  }
}

module.exports = {
  CANDIDATE_PURPOSE,
  CANDIDATE_SCHEMA_VERSION,
  PROFILE_NAMES,
  calculateCandidateId,
  createCandidateRecord,
  parseExpectedProfileDigests,
  releaseProfileDigests,
  releaseProfileServiceWorkerHashes,
  requiredCheckBinding,
  readGitState,
  validateBoundChecks,
  validateCandidateRecord
};
