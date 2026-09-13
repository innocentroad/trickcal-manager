#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  checkPublicSite,
  directoryDigest,
  isUsableReleaseRecord,
  readManifest,
  validateManifest
} = require('./generate-public-site.js');
const { hashText } = require('./sync-formation-share-assets.js');
const {
  PROFILE_NAMES,
  readGitState,
  validateBoundChecks,
  validateCandidateRecord
} = require('./public-site-candidate.js');

const ROOT = path.resolve(__dirname, '..');
const TMP_ROOT = path.join(ROOT, 'tmp');
const DEFAULT_SOURCE = path.join(TMP_ROOT, 'public-site');
const DEFAULT_OUTPUT = path.join(TMP_ROOT, 'public-site-staging');
const DEFAULT_MANIFEST = path.join(__dirname, 'public-route-manifest.json');
const RECORD_FILES = ['public-site-build.json', 'public-site-release.json'];
const FORBIDDEN_SEGMENTS = /^(?:\.git|\.github|docs|tools|tmp|backups|outputs|tests?)$/i;
const STAGING_TOP_LEVEL = new Set([
  'new',
  'legacy',
  'staging-report.json',
  '.staging-directory.json',
  'candidate-record.json'
]);

function samePath(left, right) {
  const normalize = value => process.platform === 'win32' ? value.toLowerCase() : value;
  return normalize(path.resolve(left)) === normalize(path.resolve(right));
}

function isWithinPath(candidate, root, { allowEqual = true } = {}) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  if (!relative) return allowEqual;
  return !path.isAbsolute(relative)
    && relative !== '..'
    && !relative.startsWith(`..${path.sep}`);
}

function realPathCandidate(value) {
  const lexical = path.resolve(value);
  let current = lexical;
  const suffix = [];
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) return { lexical, real: lexical, exists: false };
    suffix.unshift(path.basename(current));
    current = parent;
  }
  const real = path.resolve(fs.realpathSync.native(current), ...suffix);
  return { lexical, real, exists: true };
}

function digestBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = { candidate: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--source') options.sourceDir = argv[++index];
    else if (arg === '--repo-root') options.repoRoot = argv[++index];
    else if (arg === '--release') options.releasePath = argv[++index];
    else if (arg === '--build') options.buildPath = argv[++index];
    else if (arg === '--manifest') options.manifestPath = argv[++index];
    else if (arg === '--out') options.outputDir = argv[++index];
    else if (arg === '--checks-file') options.checksPath = argv[++index];
    else if (arg === '--candidate-record') options.candidateRecordPath = argv[++index];
    else if (arg === '--expected-commit') options.expectedCommit = argv[++index];
    else if (arg === '--expected-content-digest') options.expectedContentDigest = argv[++index];
    else if (arg === '--expected-profile-digests') options.expectedProfileDigests = argv[++index];
    else if (arg === '--candidate') options.candidate = true;
    else if (arg === '--help') options.help = true;
    else throw new Error(`未知の引数です: ${arg}`);
  }
  return options;
}

function usage() {
  return [
    'usage: node tools/prepare-public-site-staging.js [options]',
    '  --source DIR                     generated dual-profile output',
    '  --repo-root DIR                 source repository for candidate Git check',
    '  --release FILE                   public-site-release.json',
    '  --build FILE                     public-site-build.json',
    '  --checks-file FILE               check evidence JSON',
    '  --candidate-record FILE          checked candidate record',
    '  --expected-commit VALUE          expected sourceCommit',
    '  --expected-content-digest HASH   expected dual-output digest',
    '  --expected-profile-digests LIST  new=<16hex>,legacy=<16hex>',
    '  --out DIR                       separate staging root parent',
    '  --candidate                      exit 2 when candidate is not publishable'
  ].join('\n');
}

function resolveUnderTmp(value, fallback, label, tmpRoot = TMP_ROOT) {
  const candidate = realPathCandidate(value || fallback);
  const resolvedTmpRoot = path.resolve(tmpRoot);
  const tmpReal = realPathCandidate(resolvedTmpRoot).real;
  if (samePath(candidate.lexical, resolvedTmpRoot) || !isWithinPath(candidate.lexical, resolvedTmpRoot)) {
    throw new Error(`${label}はtmp自身ではなくtmp直下に限定してください: ${candidate.lexical}`);
  }
  if (!isWithinPath(candidate.real, tmpReal)) {
    throw new Error(`${label}のrealpathがtmp境界外です: ${candidate.lexical}`);
  }
  if (candidate.exists && !samePath(candidate.lexical, candidate.real)) {
    throw new Error(`${label}のsymlink／junctionは対応外です: ${candidate.lexical}`);
  }
  return candidate;
}

function assertDirectTmpChild(candidate, label, tmpRoot = TMP_ROOT) {
  if (!samePath(path.dirname(candidate.lexical), tmpRoot)) {
    throw new Error(`${label}はtmp直下の専用ディレクトリにしてください: ${candidate.lexical}`);
  }
}

function assertNoReparsePoints(directory, label) {
  if (!fs.existsSync(directory)) return;
  const root = path.resolve(directory);
  const rootReal = path.resolve(fs.realpathSync.native(root));
  function visit(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      const stat = fs.lstatSync(full);
      if (stat.isSymbolicLink()) {
        throw new Error(`${label}にsymlinkがあります: ${path.relative(root, full)}`);
      }
      const real = path.resolve(fs.realpathSync.native(full));
      if (!isWithinPath(real, rootReal)) {
        throw new Error(`${label}のrealpathがroot外です: ${path.relative(root, full)}`);
      }
      if (entry.isDirectory()) visit(full);
    }
  }
  visit(root);
}

function assertDedicatedOutput(outputDir) {
  if (!/^public-site-staging(?:$|[-_].*)/i.test(path.basename(outputDir))) {
    throw new Error(`outは専用staging名が必要です: ${outputDir}`);
  }
  if (!fs.existsSync(outputDir)) return;
  const stat = fs.lstatSync(outputDir);
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error(`outは専用ディレクトリでなくsymlinkでもない必要があります: ${outputDir}`);
  }
  assertNoReparsePoints(outputDir, 'out');
  const unexpected = fs.readdirSync(outputDir).filter(name => !STAGING_TOP_LEVEL.has(name));
  if (unexpected.length) {
    throw new Error(`outが専用stagingディレクトリではありません: ${unexpected.join(', ')}`);
  }
}

function assertInputsOutsideOutput(outputDir, inputs) {
  const outputReal = realPathCandidate(outputDir).real;
  for (const input of inputs) {
    if (!input) continue;
    const inputReal = realPathCandidate(input).real;
    if (isWithinPath(inputReal, outputReal)) {
      throw new Error(`${input}はout配下の入力なので削除対象と衝突します`);
    }
  }
}

function parseExpectedProfiles(value) {
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

function listFiles(directory) {
  const result = [];
  function visit(current, relative) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const next = relative ? path.join(relative, entry.name) : entry.name;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full, next);
      else if (entry.isFile()) result.push(next.replaceAll('\\', '/'));
    }
  }
  visit(directory, '');
  return result;
}

function isSafeOutputPath(value) {
  return typeof value === 'string'
    && value
    && !value.includes('\\')
    && !value.includes('\0')
    && !path.posix.isAbsolute(value)
    && value.split('/').every(segment => segment && segment !== '.' && segment !== '..');
}

function hasForbiddenSegment(relativePath) {
  return relativePath.split('/').some(segment => FORBIDDEN_SEGMENTS.test(segment))
    || /(?:\.xlsx$|\.env(?:\.|$)|secret)/i.test(relativePath);
}

function profileDigest(files, sourceDir) {
  const records = files.map(file => ({
    path: file.output,
    sha256: digestBuffer(fs.readFileSync(path.join(sourceDir, file.output)))
  }));
  return hashText(JSON.stringify(records));
}

function copyProfile(files, profileName, sourceDir, stagingRoot, errors) {
  const profileRoot = path.join(stagingRoot, profileName);
  const legacyPrefix = 'trickcal-manager/';
  const seen = new Set();
  let copied = 0;
  let forbidden = [];
  const sourceRoot = path.resolve(sourceDir);
  const sourceRootReal = realPathCandidate(sourceRoot).real;
  for (const file of files) {
    const output = file.output;
    if (!isSafeOutputPath(output)) {
      errors.push(`${profileName}: output pathが不正です: ${output}`);
      continue;
    }
    if (seen.has(output)) {
      errors.push(`${profileName}: outputが重複しています: ${output}`);
      continue;
    }
    seen.add(output);
    let stagedRelative = output;
    if (profileName === 'legacy') {
      if (!output.startsWith(legacyPrefix)) {
        errors.push(`legacy: base prefixがありません: ${output}`);
        continue;
      }
      stagedRelative = output.slice(legacyPrefix.length);
      if (!stagedRelative || stagedRelative.startsWith(legacyPrefix)) {
        errors.push(`legacy: baseが二重化しています: ${output}`);
        continue;
      }
    } else if (output.startsWith(legacyPrefix)) {
      errors.push(`new: legacy baseが混入しています: ${output}`);
      continue;
    }
    if (hasForbiddenSegment(stagedRelative)) forbidden.push(stagedRelative);
    const source = path.resolve(sourceDir, output);
    if (!isWithinPath(source, sourceRoot, { allowEqual: false })) {
      errors.push(`${profileName}: source pathがroot外です: ${output}`);
      continue;
    }
    if (!fs.existsSync(source) || !fs.lstatSync(source).isFile() || fs.lstatSync(source).isSymbolicLink()) {
      errors.push(`${profileName}: generated fileがありません: ${output}`);
      continue;
    }
    const sourceReal = path.resolve(fs.realpathSync.native(source));
    if (!isWithinPath(sourceReal, sourceRootReal, { allowEqual: false })) {
      errors.push(`${profileName}: source realpathがroot外です: ${output}`);
      continue;
    }
    const destination = path.join(profileRoot, stagedRelative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    copied += 1;
  }
  const stagedFiles = fs.existsSync(profileRoot) ? listFiles(profileRoot) : [];
  return {
    root: profileRoot,
    copied,
    files: stagedFiles,
    forbidden,
    legacyNested: profileName === 'legacy' && stagedFiles.some(file => file.startsWith(legacyPrefix))
  };
}

function readChecks(options, release) {
  if (!options.checksPath) return {
    provided: false,
    ok: false,
    errors: ['check evidenceが指定されていません'],
    values: {}
  };
  const filePath = path.resolve(options.checksPath);
  if (!fs.existsSync(filePath)) return {
    provided: false,
    ok: false,
    errors: [`check evidenceがありません: ${filePath}`],
    values: {}
  };
  let values;
  try {
    values = readJson(filePath);
  } catch (error) {
    return { provided: true, ok: false, errors: [`check evidenceのJSONが不正です: ${error.message}`], values: {} };
  }
  const validation = validateBoundChecks(values, release);
  return {
    provided: true,
    ok: validation.ok,
    errors: validation.errors,
    values,
    binding: validation.binding
  };
}

function resolveTmpFile(value, label, tmpRoot = TMP_ROOT) {
  const candidate = realPathCandidate(value);
  const resolvedTmpRoot = path.resolve(tmpRoot);
  const tmpReal = realPathCandidate(resolvedTmpRoot).real;
  if (samePath(candidate.lexical, resolvedTmpRoot) || !isWithinPath(candidate.lexical, resolvedTmpRoot)) {
    throw new Error(`${label}はtmp配下の専用ファイルに限定してください: ${candidate.lexical}`);
  }
  if (!isWithinPath(candidate.real, tmpReal)) {
    throw new Error(`${label}のrealpathがtmp境界外です: ${candidate.lexical}`);
  }
  if (candidate.exists && !samePath(candidate.lexical, candidate.real)) {
    throw new Error(`${label}のsymlink／junctionは対応外です: ${candidate.lexical}`);
  }
  return candidate.lexical;
}

function stageRelease(options) {
  const repoRoot = path.resolve(options.repoRoot || ROOT);
  const tmpRoot = path.join(repoRoot, 'tmp');
  const sourceInfo = resolveUnderTmp(options.sourceDir, path.join(tmpRoot, 'public-site'), 'source', tmpRoot);
  const outputInfo = resolveUnderTmp(options.outputDir, path.join(tmpRoot, 'public-site-staging'), 'out', tmpRoot);
  assertDirectTmpChild(sourceInfo, 'source', tmpRoot);
  assertDirectTmpChild(outputInfo, 'out', tmpRoot);
  const sourceDir = sourceInfo.lexical;
  const outputDir = outputInfo.lexical;
  if (samePath(sourceDir, outputDir)
    || isWithinPath(outputInfo.real, sourceInfo.real, { allowEqual: false })
    || isWithinPath(sourceInfo.real, outputInfo.real, { allowEqual: false })) {
    throw new Error('outはsource directoryと同じ／親／子になれません');
  }
  assertNoReparsePoints(sourceDir, 'source');
  assertDedicatedOutput(outputDir);
  const releasePath = path.resolve(options.releasePath || path.join(sourceDir, 'public-site-release.json'));
  const buildPath = path.resolve(options.buildPath || path.join(sourceDir, 'public-site-build.json'));
  const manifestPath = path.resolve(options.manifestPath || path.join(repoRoot, 'tools', 'public-route-manifest.json'));
  const checksPath = options.checksPath ? path.resolve(options.checksPath) : null;
  const candidateRecordPath = options.candidateRecordPath
    ? resolveTmpFile(path.resolve(options.candidateRecordPath), 'candidate record', tmpRoot)
    : null;
  assertInputsOutsideOutput(outputDir, [releasePath, buildPath, checksPath, manifestPath, candidateRecordPath]);
  const release = readJson(releasePath);
  const build = readJson(buildPath);
  const manifest = readManifest(manifestPath);
  const checks = readChecks(options, release);
  let candidateRecord = null;
  let candidateVerification = {
    provided: !!candidateRecordPath,
    ok: false,
    errors: candidateRecordPath ? [] : ['candidate recordが指定されていません']
  };
  if (candidateRecordPath) {
    try {
      candidateRecord = readJson(candidateRecordPath);
      const gitState = readGitState(repoRoot);
      candidateVerification = {
        provided: true,
        ...validateCandidateRecord(candidateRecord, {
          release,
          checks: checks.values,
          gitState
        })
      };
      if (!gitState.available) {
        candidateVerification.errors.push(`現在のGit状態を取得できません: ${gitState.reason || 'rev-parse／statusが成功していません'}`);
      }
    } catch (error) {
      candidateVerification = {
        provided: true,
        ok: false,
        errors: [`candidate recordを読み込めません: ${error.message}`]
      };
    }
  }
  const errors = [];
  if (!isUsableReleaseRecord(release)) errors.push('release recordがU1以降の整合形ではありません');
  for (const profile of release.profiles || []) {
    if (!PROFILE_NAMES.includes(profile?.profile)) errors.push(`release recordに未知profileがあります: ${profile?.profile}`);
  }
  const manifestValidation = validateManifest(manifest, { repoRoot: path.resolve(path.dirname(manifestPath), '..') });
  if (!manifestValidation.ok) errors.push(...manifestValidation.errors.map(error => `manifest: ${error}`));
  if (!fs.existsSync(sourceDir)) errors.push(`source directoryがありません: ${sourceDir}`);
  if (!Array.isArray(build.files)) errors.push('build recordのfilesがありません');
  for (const file of build.files || []) {
    if (!PROFILE_NAMES.includes(file?.profile)) errors.push(`build recordに未知profileがあります: ${file?.profile}`);
  }
  for (const profile of build.profiles || []) {
    if (!PROFILE_NAMES.includes(profile?.name)) errors.push(`build recordに未知profileがあります: ${profile?.name}`);
  }

  const filesByProfile = Object.fromEntries(PROFILE_NAMES.map(profileName => [
    profileName,
    (build.files || []).filter(file => file?.profile === profileName)
  ]));
  const integrity = {
    sourceContentDigest: '',
    sourceContentDigestMatches: false,
    profiles: {}
  };
  if (fs.existsSync(sourceDir)) {
    integrity.sourceContentDigest = directoryDigest(sourceDir, { exclude: RECORD_FILES });
    integrity.sourceContentDigestMatches = integrity.sourceContentDigest === release.contentDigest;
    if (!integrity.sourceContentDigestMatches) errors.push('source contentDigestがreleaseと不一致です');
  }
  for (const profileName of PROFILE_NAMES) {
    const expected = release.profiles?.find(profile => profile.profile === profileName);
    const buildProfile = build.profiles?.find(profile => profile.name === profileName);
    if (!buildProfile) errors.push(`${profileName} build profileがありません`);
    else if (buildProfile.basePath !== expected?.basePath || buildProfile.assetBasePath !== manifest.profiles?.[profileName]?.assetBasePath) {
      errors.push(`${profileName} build profileのbase pathがmanifest／releaseと不一致です`);
    }
    const actual = fs.existsSync(sourceDir) ? profileDigest(filesByProfile[profileName], sourceDir) : '';
    const outputMatches = !!expected && actual === expected.outputDigest;
    integrity.profiles[profileName] = {
      expectedOutputDigest: expected?.outputDigest || '',
      actualOutputDigest: actual,
      outputDigestMatches: outputMatches,
      fileCount: filesByProfile[profileName].length
    };
    if (!outputMatches) errors.push(`${profileName} outputDigestがreleaseと不一致です`);
    const serviceWorker = expected?.serviceWorker;
    const serviceWorkerFile = filesByProfile[profileName].find(file => file.output === serviceWorker?.output);
    if (!serviceWorkerFile) {
      errors.push(`${profileName} releaseのService Worker outputがbuildにありません`);
    } else if (fs.existsSync(sourceDir)) {
      const serviceWorkerHash = digestBuffer(fs.readFileSync(path.join(sourceDir, serviceWorkerFile.output)));
      if (serviceWorkerHash !== serviceWorker?.contentHash) errors.push(`${profileName}生成Service Worker hashがreleaseと不一致です`);
    }
  }

  if (options.candidate) {
    if (!candidateVerification.ok) errors.push(...candidateVerification.errors.map(error => `candidate: ${error}`));
    if (candidateVerification.ok) {
      try {
        checkPublicSite(manifest, {
          repoRoot,
          outputDir: sourceDir
        });
      } catch (error) {
        errors.push(`candidate current generation check: ${error.message || error}`);
      }
    }
  }

  const expectedProfiles = parseExpectedProfiles(options.expectedProfileDigests);
  if (options.expectedCommit != null && options.expectedCommit !== release.sourceCommit) errors.push('expected sourceCommitがreleaseと不一致です');
  if (options.expectedContentDigest && options.expectedContentDigest !== release.contentDigest) errors.push('expected contentDigestがreleaseと不一致です');
  for (const profileName of PROFILE_NAMES) {
    if (expectedProfiles[profileName] && expectedProfiles[profileName] !== integrity.profiles[profileName].actualOutputDigest) {
      errors.push(`expected ${profileName} outputDigestが不一致です`);
    }
  }

  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });
  const staging = Object.fromEntries(PROFILE_NAMES.map(profileName => [
    profileName,
    copyProfile(filesByProfile[profileName], profileName, sourceDir, outputDir, errors)
  ]));
  if (staging.new.forbidden.length) errors.push('new stagingに禁止segmentがあります');
  if (staging.legacy.forbidden.length) errors.push('legacy stagingに禁止segmentがあります');
  if (staging.new.files.some(file => file.startsWith('trickcal-manager/'))) errors.push('new stagingにlegacy baseが混入しています');
  if (staging.legacy.legacyNested) errors.push('legacy stagingのbaseが二重化しています');
  if (!checks.ok) errors.push(...checks.errors.map(error => `checks: ${error}`));
  if (release.status === 'local-only-unpublished' && !candidateVerification.ok) errors.push('release statusがlocal-only-unpublishedです');
  if (release.dirty !== false) errors.push('releaseがdirtyです');
  if (options.expectedCommit == null) errors.push('expected sourceCommitが指定されていません');
  if (options.candidate) {
    if (!options.expectedContentDigest) errors.push('candidateではexpected contentDigestが必須です');
    for (const profileName of PROFILE_NAMES) {
      if (!expectedProfiles[profileName]) errors.push(`candidateではexpected ${profileName} outputDigestが必須です`);
    }
  }

  const report = {
    schemaVersion: 1,
    purpose: 'P5b local-only staging inspection',
    sourceDir,
    release: {
      status: release.status,
      releaseId: release.releaseId,
      sourceCommit: release.sourceCommit,
      dirty: release.dirty,
      contentDigest: release.contentDigest
    },
    integrity,
    checks: {
      provided: checks.provided,
      ok: checks.ok,
      errors: checks.errors,
      binding: checks.binding
    },
    candidate: {
      provided: candidateVerification.provided,
      ok: candidateVerification.ok,
      candidateId: candidateRecord?.candidateId || null,
      errors: candidateVerification.errors
    },
    safety: {
      outputPreflightPassed: true,
      inputsReadBeforeReset: true,
      outputWasDedicated: true
    },
    candidateAccepted: errors.length === 0,
    candidateReasons: errors,
    staging: {
      outputDir,
      newRoot: staging.new.root,
      legacyRoot: staging.legacy.root,
      newFiles: staging.new.copied,
      legacyFiles: staging.legacy.copied,
      newContainsLegacy: staging.new.files.some(file => file.startsWith('trickcal-manager/')),
      newContainsForbidden: staging.new.forbidden,
      legacyContainsForbidden: staging.legacy.forbidden,
      legacyNestedBase: staging.legacy.legacyNested
    },
    expected: {
      sourceCommit: options.expectedCommit || null,
      contentDigest: options.expectedContentDigest || null,
      profileDigests: expectedProfiles
    }
  };
  const reportPath = path.join(outputDir, 'staging-report.json');
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return { report, reportPath };
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(usage());
    return 0;
  }
  const result = stageRelease(options);
  console.log(JSON.stringify({
    ok: true,
    candidateAccepted: result.report.candidateAccepted,
    releaseId: result.report.release.releaseId,
    newFiles: result.report.staging.newFiles,
    legacyFiles: result.report.staging.legacyFiles,
    reportPath: result.reportPath,
    reasons: result.report.candidateReasons
  }, null, 2));
  return result.report.candidateAccepted || !options.candidate ? 0 : 2;
}

if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
  }
}

module.exports = { main, stageRelease };
