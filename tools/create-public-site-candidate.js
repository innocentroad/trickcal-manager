#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  directoryDigest,
  isUsableReleaseRecord,
  readManifest,
  validateManifest
} = require('./generate-public-site.js');
const { hashText } = require('./sync-formation-share-assets.js');
const {
  PROFILE_NAMES,
  createCandidateRecord,
  parseExpectedProfileDigests,
  readGitState,
  releaseProfileDigests,
  releaseProfileServiceWorkerHashes,
  validateBoundChecks
} = require('./public-site-candidate.js');

const ROOT = path.resolve(__dirname, '..');
const RECORD_FILES = ['public-site-build.json', 'public-site-release.json'];

function digestBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') options.repoRoot = argv[++index];
    else if (arg === '--source') options.sourceDir = argv[++index];
    else if (arg === '--manifest') options.manifestPath = argv[++index];
    else if (arg === '--release') options.releasePath = argv[++index];
    else if (arg === '--build') options.buildPath = argv[++index];
    else if (arg === '--checks-file') options.checksPath = argv[++index];
    else if (arg === '--expected-commit') options.expectedCommit = argv[++index];
    else if (arg === '--expected-content-digest') options.expectedContentDigest = argv[++index];
    else if (arg === '--expected-profile-digests') options.expectedProfileDigests = argv[++index];
    else if (arg === '--out') options.outputPath = argv[++index];
    else if (arg === '--help') options.help = true;
    else throw new Error(`未知の引数です: ${arg}`);
  }
  return options;
}

function usage() {
  return [
    'usage: node tools/create-public-site-candidate.js [options]',
    '  --repo-root DIR                 clean source repository',
    '  --source DIR                    generated dual-profile output',
    '  --manifest FILE                 public-route-manifest.json',
    '  --release FILE                  public-site-release.json',
    '  --build FILE                    public-site-build.json',
    '  --checks-file FILE              generated check evidence JSON',
    '  --expected-commit VALUE         expected clean Git HEAD',
    '  --expected-content-digest HASH  expected dual-output digest',
    '  --expected-profile-digests LIST new=<16hex>,legacy=<16hex>',
    '  --out FILE                      candidate record outside generated source'
  ].join('\n');
}

function listFiles(directory) {
  const result = [];
  function visit(current, relative) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const next = relative ? path.join(relative, entry.name) : entry.name;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full, next);
      else if (entry.isFile()) result.push(next.replaceAll('\\', '/'));
      else throw new Error(`generated outputに通常fileでないentryがあります: ${next}`);
    }
  }
  visit(directory, '');
  return result.sort((left, right) => left.localeCompare(right));
}

function profileOutputDigest(build, sourceDir, profileName) {
  const files = (build.files || []).filter(file => file?.profile === profileName);
  const records = files.map(file => ({
    path: file.output,
    sha256: digestBuffer(fs.readFileSync(path.join(sourceDir, file.output)))
  }));
  return hashText(JSON.stringify(records));
}

function assertGeneratedOutput(sourceDir, release, build) {
  if (!fs.existsSync(sourceDir)) throw new Error(`source directoryがありません: ${sourceDir}`);
  if (!Array.isArray(build?.files)) throw new Error('build recordのfilesがありません');
  const actualFiles = listFiles(sourceDir);
  const contentFiles = actualFiles.filter(file => !RECORD_FILES.includes(file));
  const expectedFiles = build.files.map(file => file.output).sort((left, right) => left.localeCompare(right));
  if (contentFiles.length !== expectedFiles.length || contentFiles.some((file, index) => file !== expectedFiles[index])) {
    throw new Error('generated outputとbuild recordのfile一覧が一致しません');
  }
  const actualContentDigest = directoryDigest(sourceDir, { exclude: RECORD_FILES });
  if (actualContentDigest !== release.contentDigest) {
    throw new Error(`generated output contentDigestが不一致です: ${actualContentDigest}`);
  }
  const expectedDigests = releaseProfileDigests(release);
  const expectedServiceWorkers = releaseProfileServiceWorkerHashes(release);
  const actualProfiles = {};
  for (const profileName of PROFILE_NAMES) {
    actualProfiles[profileName] = profileOutputDigest(build, sourceDir, profileName);
    if (actualProfiles[profileName] !== expectedDigests[profileName]) {
      throw new Error(`${profileName} outputDigestが不一致です`);
    }
    const serviceWorker = release.profiles.find(profile => profile.profile === profileName)?.serviceWorker;
    if (!serviceWorker?.output) throw new Error(`${profileName} Service Worker outputがありません`);
    const actualServiceWorkerHash = digestBuffer(fs.readFileSync(path.join(sourceDir, serviceWorker.output)));
    if (actualServiceWorkerHash !== expectedServiceWorkers[profileName]) {
      throw new Error(`${profileName} Service Worker hashが不一致です`);
    }
  }
  return { actualContentDigest, actualProfiles };
}

function resolveOptions(options) {
  const repoRoot = path.resolve(options.repoRoot || ROOT);
  const sourceDir = path.resolve(options.sourceDir || path.join(repoRoot, 'tmp', 'public-site'));
  const releasePath = path.resolve(options.releasePath || path.join(sourceDir, 'public-site-release.json'));
  const buildPath = path.resolve(options.buildPath || path.join(sourceDir, 'public-site-build.json'));
  const checksPath = path.resolve(options.checksPath || path.join(repoRoot, 'tmp', 'public-site-checks.json'));
  const manifestPath = path.resolve(options.manifestPath || path.join(repoRoot, 'tools', 'public-route-manifest.json'));
  const outputPath = path.resolve(options.outputPath || path.join(repoRoot, 'tmp', 'public-site-candidate.json'));
  const tmpRoot = path.resolve(repoRoot, 'tmp');
  const relativeOutput = path.relative(tmpRoot, outputPath);
  if (!relativeOutput || path.isAbsolute(relativeOutput) || relativeOutput === '..' || relativeOutput.startsWith(`..${path.sep}`)) {
    throw new Error(`candidate出力はrepoのtmp配下に限定してください: ${outputPath}`);
  }
  const relativeSource = path.relative(sourceDir, outputPath);
  if (!path.isAbsolute(relativeSource) && relativeSource !== '..' && !relativeSource.startsWith(`..${path.sep}`)) {
    throw new Error(`candidate出力をgenerated source内へ置けません: ${outputPath}`);
  }
  return { repoRoot, sourceDir, releasePath, buildPath, checksPath, manifestPath, outputPath };
}

function create(options) {
  const paths = resolveOptions(options);
  const errors = [];
  if (fs.existsSync(paths.outputPath)) errors.push(`candidate出力が既にあります: ${paths.outputPath}`);
  let release = null;
  let build = null;
  let checks = null;
  let manifest = null;
  for (const [name, filePath] of [
    ['release', paths.releasePath],
    ['build', paths.buildPath],
    ['checks', paths.checksPath],
    ['manifest', paths.manifestPath]
  ]) {
    try {
      const value = readJson(filePath);
      if (name === 'release') release = value;
      else if (name === 'build') build = value;
      else if (name === 'checks') checks = value;
      else manifest = value;
    } catch (error) {
      errors.push(`${name}を読み込めません: ${error.message}`);
    }
  }
  if (!isUsableReleaseRecord(release)) errors.push('release recordがU1以降の整合形ではありません');
  if (manifest) {
    const validation = validateManifest(manifest, { repoRoot: paths.repoRoot });
    if (!validation.ok) errors.push(...validation.errors.map(error => `manifest: ${error}`));
  }
  const gitState = readGitState(paths.repoRoot);
  if (!gitState.available) {
    errors.push(`Git状態を取得できません: ${gitState.reason || 'rev-parse／statusが成功していません'}`);
  } else {
    if (gitState.dirty) errors.push('source repositoryがdirtyです');
    if (release && gitState.head !== release.sourceCommit) errors.push('Git HEADがrelease sourceCommitと不一致です');
  }
  if (release?.dirty !== false) errors.push('release recordがdirtyです');

  let generated = null;
  if (release && build) {
    try {
      generated = assertGeneratedOutput(paths.sourceDir, release, build);
    } catch (error) {
      errors.push(`generated output: ${error.message}`);
    }
  }
  const expectedProfiles = parseExpectedProfileDigests(options.expectedProfileDigests || '');
  if (options.expectedCommit == null) errors.push('expected sourceCommitが指定されていません');
  else if (release?.sourceCommit !== options.expectedCommit) errors.push('expected sourceCommitがreleaseと不一致です');
  if (!options.expectedContentDigest) errors.push('expected contentDigestが指定されていません');
  else if (release?.contentDigest !== options.expectedContentDigest) errors.push('expected contentDigestがreleaseと不一致です');
  for (const profileName of PROFILE_NAMES) {
    if (!expectedProfiles[profileName]) errors.push(`expected ${profileName} outputDigestが指定されていません`);
    else if (expectedProfiles[profileName] !== releaseProfileDigests(release)[profileName]) {
      errors.push(`expected ${profileName} outputDigestがreleaseと不一致です`);
    }
    if (generated && expectedProfiles[profileName] !== generated.actualProfiles[profileName]) {
      errors.push(`expected ${profileName} outputDigestがgenerated outputと不一致です`);
    }
  }
  if (generated && options.expectedContentDigest && generated.actualContentDigest !== options.expectedContentDigest) {
    errors.push('expected contentDigestがgenerated outputと不一致です');
  }
  const checksValidation = validateBoundChecks(checks, release);
  errors.push(...checksValidation.errors.map(error => `checks: ${error}`));
  if (errors.length) return { ok: false, paths, errors, gitState };

  const record = createCandidateRecord({ release, checks, gitState });
  fs.mkdirSync(path.dirname(paths.outputPath), { recursive: true });
  fs.writeFileSync(paths.outputPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return { ok: true, paths, record, gitState };
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(usage());
    return 0;
  }
  let result;
  try {
    result = create(options);
  } catch (error) {
    console.error(error.message || error);
    return 1;
  }
  console.log(JSON.stringify({
    ok: result.ok,
    candidatePath: result.paths.outputPath,
    candidateId: result.record?.candidateId || null,
    releaseId: result.record?.releaseId || null,
    errors: result.errors || []
  }, null, 2));
  return result.ok ? 0 : 2;
}

if (require.main === module) {
  main().then(code => { process.exitCode = code; }).catch(error => {
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  });
}

module.exports = { create, main };
