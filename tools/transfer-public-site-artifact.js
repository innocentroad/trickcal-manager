#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  PROFILE_NAMES,
  validateCandidateRecord
} = require('./public-site-candidate.js');

const ROOT = path.resolve(__dirname, '..');
const IDENTITY_FILE = 'public-site-deployment.json';
const LEDGER_FILE = '.trickcal-public-site-delivery.json';
const LEDGER_SCHEMA_VERSION = 1;
const LEDGER_PURPOSE = 'P5b local public-site delivery ownership ledger';
const PLAN_SCHEMA_VERSION = 1;
const PLAN_PURPOSE = 'P5b local public-site delivery plan';
const LEGACY_PREFIX = 'trickcal-manager/';
const PROTECTED_ROOTS = new Set(['.git', '.github']);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

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

function digestBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function digestFile(filePath) {
  return digestBuffer(fs.readFileSync(filePath));
}

function hashText(value) {
  return crypto.createHash('sha256')
    .update(String(value).replace(/\r\n?/g, '\n'), 'utf8')
    .digest('hex')
    .slice(0, 16);
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${label}を読み込めません: ${error.message}`);
  }
}

function isSafeRelativePath(value) {
  return typeof value === 'string'
    && value
    && !value.includes('\\')
    && !value.includes('\0')
    && !path.posix.isAbsolute(value)
    && value.split('/').every(segment => segment && segment !== '.' && segment !== '..');
}

function normalizeRelativePath(value) {
  if (!isSafeRelativePath(value)) throw new Error(`相対pathが不正です: ${value}`);
  return value;
}

function isProtectedPath(relativePath) {
  const firstSegment = relativePath.split('/')[0];
  return PROTECTED_ROOTS.has(firstSegment) || relativePath.toLowerCase() === 'cname';
}

function assertRegularFile(filePath, label) {
  let stat;
  try {
    stat = fs.lstatSync(filePath);
  } catch (error) {
    throw new Error(`${label}がありません: ${filePath}`);
  }
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${label}が通常ファイルではありません: ${filePath}`);
}

function assertDirectory(directory, label) {
  let stat;
  try {
    stat = fs.lstatSync(directory);
  } catch (error) {
    throw new Error(`${label}がありません: ${directory}`);
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`${label}が通常ディレクトリではありません: ${directory}`);
}

function assertNoReparsePoints(directory, label, { skipProtected = false } = {}) {
  assertDirectory(directory, label);
  const root = path.resolve(directory);
  const rootReal = path.resolve(fs.realpathSync.native(root));
  function visit(current, relative) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const next = relative ? `${relative}/${entry.name}` : entry.name;
      if (skipProtected && isProtectedPath(next)) continue;
      const full = path.join(current, entry.name);
      const stat = fs.lstatSync(full);
      if (stat.isSymbolicLink()) throw new Error(`${label}にsymlinkがあります: ${next}`);
      const real = path.resolve(fs.realpathSync.native(full));
      if (!isWithinPath(real, rootReal, { allowEqual: false })) {
        throw new Error(`${label}のrealpathがroot外です: ${next}`);
      }
      if (stat.isDirectory()) visit(full, next);
      else if (!stat.isFile()) throw new Error(`${label}に通常ファイル以外があります: ${next}`);
    }
  }
  visit(root, '');
}

function listFiles(directory, { skipProtected = false } = {}) {
  const result = [];
  const root = path.resolve(directory);
  function visit(current, relative) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const next = relative ? `${relative}/${entry.name}` : entry.name;
      if (skipProtected && isProtectedPath(next)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full, next);
      else if (entry.isFile()) result.push(next);
    }
  }
  visit(root, '');
  return result;
}

function buildStagedRelativePath(profileName, output) {
  normalizeRelativePath(output);
  if (profileName === 'new') {
    if (output.startsWith(LEGACY_PREFIX)) throw new Error(`newにlegacy baseが混入しています: ${output}`);
    return output;
  }
  if (!output.startsWith(LEGACY_PREFIX)) throw new Error(`legacyにbase prefixがありません: ${output}`);
  const relative = output.slice(LEGACY_PREFIX.length);
  if (!relative || relative.startsWith(LEGACY_PREFIX)) throw new Error(`legacy baseが二重化しています: ${output}`);
  return relative;
}

function candidateProfile(candidate, profileName) {
  const profile = candidate.profiles?.[profileName];
  if (!isRecord(profile)) throw new Error(`candidate recordに${profileName} profileがありません`);
  if (!/^[0-9a-f]{16}$/.test(profile.outputDigest || '')) throw new Error(`candidate recordの${profileName} outputDigestが不正です`);
  if (!/^[0-9a-f]{64}$/.test(profile.serviceWorkerContentHash || '')) throw new Error(`candidate recordの${profileName} Service Worker hashが不正です`);
  return profile;
}

function identityFor(candidate, profileName) {
  const profile = candidateProfile(candidate, profileName);
  return {
    candidateId: candidate.candidateId,
    sourceCommit: candidate.sourceCommit,
    profile: profileName,
    digest: {
      contentDigest: candidate.contentDigest,
      outputDigest: profile.outputDigest
    }
  };
}

function identityText(candidate, profileName) {
  return `${JSON.stringify(identityFor(candidate, profileName), null, 2)}\n`;
}

function readAndValidateInputs(options) {
  const errors = [];
  const required = [
    ['candidate record', options.candidateRecordPath],
    ['staging directory', options.stagingDir],
    ['release record', options.releasePath],
    ['build record', options.buildPath],
    ['checks evidence', options.checksPath],
    ['destination', options.destinationDir]
  ];
  for (const [label, value] of required) if (!value) errors.push(`${label}が指定されていません`);
  if (!PROFILE_NAMES.includes(options.profile)) errors.push(`profileが不正です: ${options.profile}`);
  if (errors.length) return { ok: false, errors };

  let candidate;
  let release;
  let build;
  let checks;
  let stagingReport;
  try {
    candidate = readJson(options.candidateRecordPath, 'candidate record');
    release = readJson(options.releasePath, 'release record');
    build = readJson(options.buildPath, 'build record');
    checks = readJson(options.checksPath, 'checks evidence');
    stagingReport = readJson(path.join(options.stagingDir, 'staging-report.json'), 'staging report');
  } catch (error) {
    return { ok: false, errors: [error.message] };
  }

  const candidateValidation = validateCandidateRecord(candidate, { release, checks });
  errors.push(...candidateValidation.errors.map(error => `candidate: ${error}`));
  if (!isRecord(build) || !Array.isArray(build.files)) errors.push('build recordのfilesがありません');
  if (!isRecord(stagingReport)) errors.push('staging reportがobjectではありません');
  if (stagingReport?.candidateAccepted !== true) errors.push('stagingがcandidateAccepted:trueではありません');
  if (stagingReport?.candidate?.candidateId !== candidate?.candidateId) errors.push('staging reportのcandidateIdが不一致です');
  if (stagingReport?.release?.releaseId !== candidate?.releaseId) errors.push('staging reportのreleaseIdが不一致です');
  if (stagingReport?.release?.sourceCommit !== candidate?.sourceCommit) errors.push('staging reportのsourceCommitが不一致です');
  if (stagingReport?.release?.contentDigest !== candidate?.contentDigest) errors.push('staging reportのcontentDigestが不一致です');
  if (stagingReport?.release?.dirty !== false) errors.push('staging reportのreleaseがdirtyです');

  try {
    assertDirectory(options.stagingDir, 'staging directory');
    assertNoReparsePoints(options.stagingDir, 'staging directory');
    assertDirectory(options.destinationDir, 'destination');
    assertNoReparsePoints(options.destinationDir, 'destination', { skipProtected: true });
  } catch (error) {
    errors.push(error.message);
  }

  return {
    ok: errors.length === 0,
    errors,
    candidate,
    release,
    build,
    checks,
    stagingReport
  };
}

function stageProfileFiles({ candidate, release, build, stagingDir, profileName }) {
  const profileFiles = (build.files || []).filter(file => file?.profile === profileName);
  const profileRoot = path.join(stagingDir, profileName);
  const errors = [];
  const expected = [];
  const seen = new Set();
  for (const file of profileFiles) {
    try {
      const stagedRelative = buildStagedRelativePath(profileName, file.output);
      if (seen.has(stagedRelative)) throw new Error(`staging pathが重複しています: ${stagedRelative}`);
      seen.add(stagedRelative);
      const stagedPath = path.resolve(profileRoot, ...stagedRelative.split('/'));
      if (!isWithinPath(stagedPath, profileRoot, { allowEqual: false })) throw new Error(`staging pathがroot外です: ${stagedRelative}`);
      assertRegularFile(stagedPath, 'staged generated file');
      const sha256 = digestFile(stagedPath);
      expected.push({ output: file.output, path: stagedRelative, sha256 });
    } catch (error) {
      errors.push(`${profileName}: ${error.message}`);
    }
  }
  let actualFiles = [];
  try {
    assertDirectory(profileRoot, `${profileName} staging root`);
    actualFiles = listFiles(profileRoot);
  } catch (error) {
    errors.push(error.message);
  }
  const expectedPaths = expected.map(file => file.path).sort();
  const actualPaths = actualFiles.slice().sort();
  if (JSON.stringify(expectedPaths) !== JSON.stringify(actualPaths)) {
    const expectedSet = new Set(expectedPaths);
    const actualSet = new Set(actualPaths);
    const missing = expectedPaths.filter(file => !actualSet.has(file));
    const extra = actualPaths.filter(file => !expectedSet.has(file));
    errors.push(`${profileName} stagingのfile一覧がbuildと不一致です: missing=${missing.join(',')}; extra=${extra.join(',')}`);
  }
  const outputDigest = hashText(JSON.stringify(expected.map(file => ({ path: file.output, sha256: file.sha256 }))));
  const candidateProfileData = candidateProfile(candidate, profileName);
  if (outputDigest !== candidateProfileData.outputDigest) errors.push(`${profileName} staging outputDigestがcandidateと不一致です`);
  const serviceWorkerOutput = release?.profiles?.find(profile => profile?.profile === profileName)?.serviceWorker?.output;
  if (serviceWorkerOutput) {
    const serviceWorkerFile = expected.find(file => file.output === serviceWorkerOutput);
    if (!serviceWorkerFile || serviceWorkerFile.sha256 !== candidateProfileData.serviceWorkerContentHash) {
      errors.push(`${profileName} staging Service Worker hashがcandidateと不一致です`);
    }
  }
  return {
    profile: profileName,
    root: profileRoot,
    files: expected,
    outputDigest,
    errors
  };
}

function readPreviousLedger(destinationDir) {
  const ledgerPath = path.join(destinationDir, LEDGER_FILE);
  if (!fs.existsSync(ledgerPath)) return { path: ledgerPath, value: null, errors: [] };
  const errors = [];
  try {
    assertRegularFile(ledgerPath, 'delivery ledger');
    const value = readJson(ledgerPath, 'delivery ledger');
    if (!isRecord(value) || value.schemaVersion !== LEDGER_SCHEMA_VERSION || value.purpose !== LEDGER_PURPOSE) {
      errors.push('delivery ledgerのschema／purposeが不正です');
    }
    if (!PROFILE_NAMES.includes(value.profile)) errors.push('delivery ledgerのprofileが不正です');
    if (!Array.isArray(value.ownedFiles)) errors.push('delivery ledgerのownedFilesがありません');
    const seen = new Set();
    for (const file of value.ownedFiles || []) {
      if (!isSafeRelativePath(file?.path) || isProtectedPath(file.path)) errors.push(`delivery ledgerのowned pathが不正です: ${file?.path}`);
      if (seen.has(file?.path)) errors.push(`delivery ledgerのowned pathが重複しています: ${file?.path}`);
      seen.add(file?.path);
      if (!/^[0-9a-f]{64}$/.test(file?.sha256 || '')) errors.push(`delivery ledgerのhashが不正です: ${file?.path}`);
    }
    return { path: ledgerPath, value, errors };
  } catch (error) {
    return { path: ledgerPath, value: null, errors: [error.message] };
  }
}

function scanDestinationFiles(destinationDir) {
  const result = new Map();
  function visit(current, relative) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const next = relative ? `${relative}/${entry.name}` : entry.name;
      if (isProtectedPath(next) || next === LEDGER_FILE) continue;
      const full = path.join(current, entry.name);
      const stat = fs.lstatSync(full);
      if (stat.isSymbolicLink()) {
        result.set(next, { path: full, type: 'symlink' });
      } else if (stat.isDirectory()) {
        visit(full, next);
      } else if (stat.isFile()) {
        result.set(next, { path: full, type: 'file', sha256: digestFile(full) });
      } else {
        result.set(next, { path: full, type: 'other' });
      }
    }
  }
  visit(destinationDir, '');
  return result;
}

function makeLedger(candidate, profileName, desiredFiles) {
  const profile = candidateProfile(candidate, profileName);
  return {
    schemaVersion: LEDGER_SCHEMA_VERSION,
    purpose: LEDGER_PURPOSE,
    candidateId: candidate.candidateId,
    sourceCommit: candidate.sourceCommit,
    profile: profileName,
    contentDigest: candidate.contentDigest,
    outputDigest: profile.outputDigest,
    identityPath: IDENTITY_FILE,
    ownedFiles: desiredFiles
      .map(file => ({ path: file.path, sha256: file.sha256 }))
      .sort((left, right) => left.path.localeCompare(right.path))
  };
}

function planDelivery(options) {
  const input = readAndValidateInputs(options);
  if (!input.ok) return { ok: false, errors: input.errors };
  if (samePath(options.destinationDir, options.stagingDir)
    || isWithinPath(options.destinationDir, options.stagingDir)
    || isWithinPath(options.stagingDir, options.destinationDir)) {
    return { ok: false, errors: ['destinationとstagingは同じ／親子にできません'] };
  }

  const staged = stageProfileFiles({
    candidate: input.candidate,
    release: input.release,
    build: input.build,
    stagingDir: options.stagingDir,
    profileName: options.profile
  });
  const errors = [...staged.errors];
  const reportProfile = input.stagingReport?.integrity?.profiles?.[options.profile];
  if (!reportProfile) errors.push(`staging reportに${options.profile} integrityがありません`);
  else {
    if (reportProfile.actualOutputDigest !== staged.outputDigest) errors.push(`${options.profile} staging reportのoutputDigestが不一致です`);
    if (reportProfile.fileCount !== staged.files.length) errors.push(`${options.profile} staging reportのfileCountが不一致です`);
    if (reportProfile.outputDigestMatches !== true) errors.push(`${options.profile} staging reportのoutputDigestMatchesがtrueではありません`);
  }
  const identity = identityText(input.candidate, options.profile);
  const desiredFiles = [
    ...staged.files.map(file => ({ path: file.path, sourcePath: path.join(staged.root, ...file.path.split('/')), sha256: file.sha256 })),
    { path: IDENTITY_FILE, sourcePath: null, content: identity, sha256: digestBuffer(Buffer.from(identity, 'utf8')) }
  ];
  const desiredByPath = new Map();
  for (const file of desiredFiles) {
    if (!isSafeRelativePath(file.path) || isProtectedPath(file.path)) errors.push(`desired pathが保護範囲です: ${file.path}`);
    if (desiredByPath.has(file.path)) errors.push(`desired pathが重複しています: ${file.path}`);
    desiredByPath.set(file.path, file);
  }

  const previous = readPreviousLedger(options.destinationDir);
  errors.push(...previous.errors);
  if (previous.value && previous.value.profile !== options.profile) errors.push('既存delivery ledgerのprofileが今回と不一致です');
  const previousOwned = new Map((previous.value?.ownedFiles || []).map(file => [file.path, file.sha256]));
  let currentFiles = new Map();
  try {
    currentFiles = scanDestinationFiles(options.destinationDir);
  } catch (error) {
    errors.push(`destinationの一覧取得に失敗しました: ${error.message}`);
  }

  const writes = [];
  const unchanged = [];
  const deletes = [];
  const conflicts = [];
  for (const [relativePath, desired] of desiredByPath) {
    const current = currentFiles.get(relativePath);
    if (!current) {
      writes.push({ path: relativePath, sha256: desired.sha256, reason: 'missing' });
    } else if (current.type !== 'file') {
      conflicts.push(`${relativePath}: destinationが通常ファイルではありません`);
    } else if (!previousOwned.has(relativePath)) {
      conflicts.push(`${relativePath}: 前回所有台帳にない同名ファイルです`);
    } else if (current.sha256 !== previousOwned.get(relativePath)) {
      conflicts.push(`${relativePath}: 前回所有ファイルが手動変更されています`);
    } else if (current.sha256 === desired.sha256) {
      unchanged.push(relativePath);
    } else {
      writes.push({ path: relativePath, sha256: desired.sha256, reason: 'replace' });
    }
  }
  for (const [relativePath, previousSha256] of previousOwned) {
    if (desiredByPath.has(relativePath)) continue;
    const current = currentFiles.get(relativePath);
    if (!current) continue;
    if (current.type !== 'file') conflicts.push(`${relativePath}: 削除対象が通常ファイルではありません`);
    else if (current.sha256 !== previousSha256) conflicts.push(`${relativePath}: 削除対象が手動変更されています`);
    else deletes.push({ path: relativePath, sha256: previousSha256 });
  }
  errors.push(...conflicts);
  const ledger = makeLedger(input.candidate, options.profile, desiredFiles);
  const plan = {
    schemaVersion: PLAN_SCHEMA_VERSION,
    purpose: PLAN_PURPOSE,
    mode: options.apply ? 'apply' : 'dry-run',
    candidateId: input.candidate.candidateId,
    sourceCommit: input.candidate.sourceCommit,
    profile: options.profile,
    contentDigest: input.candidate.contentDigest,
    outputDigest: candidateProfile(input.candidate, options.profile).outputDigest,
    stagingDir: options.stagingDir,
    destinationDir: options.destinationDir,
    identityPath: IDENTITY_FILE,
    desiredFileCount: desiredFiles.length,
    operations: {
      write: writes,
      delete: deletes,
      unchanged,
      conflicts
    },
    previousLedger: previous.value ? {
      candidateId: previous.value.candidateId,
      sourceCommit: previous.value.sourceCommit,
      profile: previous.value.profile,
      ownedFileCount: previous.value.ownedFiles.length
    } : null,
    nextLedger: {
      file: LEDGER_FILE,
      ownedFileCount: ledger.ownedFiles.length
    },
    accepted: errors.length === 0
  };
  return {
    ok: errors.length === 0,
    errors,
    plan,
    input,
    staged,
    desiredFiles,
    desiredByPath,
    previous,
    currentFiles,
    ledger
  };
}

function ensureDestinationPath(destinationDir, relativePath) {
  const target = path.resolve(destinationDir, ...relativePath.split('/'));
  if (!isWithinPath(target, destinationDir, { allowEqual: false })) throw new Error(`destination pathがroot外です: ${relativePath}`);
  let current = path.resolve(destinationDir);
  for (const segment of relativePath.split('/')) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) continue;
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error(`destination pathにsymlinkがあります: ${relativePath}`);
    if (current !== target && !stat.isDirectory()) throw new Error(`destination pathの親がディレクトリではありません: ${relativePath}`);
  }
  return target;
}

function writeWorkspaceFiles(workDir, desiredFiles, copyFile) {
  for (const file of desiredFiles) {
    const target = path.resolve(workDir, ...file.path.split('/'));
    if (!isWithinPath(target, workDir, { allowEqual: false })) throw new Error(`workspace pathがroot外です: ${file.path}`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (file.sourcePath) copyFile(file.sourcePath, target);
    else fs.writeFileSync(target, file.content, 'utf8');
    if (digestFile(target) !== file.sha256) throw new Error(`workspace hashが不一致です: ${file.path}`);
  }
}

function restoreDestination({ destinationDir, backups, created, ledgerPath, ledgerBackup, ledgerTouched }) {
  for (const relativePath of created) {
    const target = ensureDestinationPath(destinationDir, relativePath);
    if (fs.existsSync(target)) fs.unlinkSync(target);
  }
  for (const [relativePath, backupPath] of backups) {
    const target = ensureDestinationPath(destinationDir, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(backupPath, target);
  }
  if (ledgerTouched) {
    if (ledgerBackup) {
      fs.copyFileSync(ledgerBackup, ledgerPath);
    } else if (fs.existsSync(ledgerPath)) {
      fs.unlinkSync(ledgerPath);
    }
  }
}

function applyDelivery(result, options) {
  if (!result.ok) return { ...result, applied: false, changed: false };
  if (!options.apply) return { ...result, applied: false, changed: false };
  const workDir = fs.mkdtempSync(path.join(path.dirname(options.destinationDir), '.trickcal-delivery-work-'));
  const backupDir = path.join(workDir, 'backup');
  fs.mkdirSync(backupDir, { recursive: true });
  const ledgerPath = path.join(options.destinationDir, LEDGER_FILE);
  const ledgerTempPath = path.join(workDir, 'delivery-ledger.json');
  const copyFile = options.copyFile || fs.copyFileSync;
  const backups = new Map();
  const created = [];
  let ledgerBackup = null;
  let ledgerTouched = false;
  try {
    writeWorkspaceFiles(workDir, result.desiredFiles, copyFile);
    fs.writeFileSync(ledgerTempPath, `${JSON.stringify(result.ledger, null, 2)}\n`, 'utf8');
    if (fs.existsSync(ledgerPath)) {
      assertRegularFile(ledgerPath, 'delivery ledger');
      ledgerBackup = path.join(backupDir, 'ledger.json');
      fs.copyFileSync(ledgerPath, ledgerBackup);
    }
    const affectedPaths = [
      ...result.plan.operations.write.filter(operation => result.currentFiles.has(operation.path)).map(operation => operation.path),
      ...result.plan.operations.delete.map(operation => operation.path)
    ];
    for (const relativePath of affectedPaths) {
      const source = ensureDestinationPath(options.destinationDir, relativePath);
      const backupPath = path.join(backupDir, ...relativePath.split('/'));
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(source, backupPath);
      backups.set(relativePath, backupPath);
    }
    for (const operation of result.plan.operations.write) {
      const source = path.resolve(workDir, ...operation.path.split('/'));
      const target = ensureDestinationPath(options.destinationDir, operation.path);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      created.push(operation.path);
      fs.copyFileSync(source, target);
      if (digestFile(target) !== operation.sha256) throw new Error(`destination hashが不一致です: ${operation.path}`);
    }
    for (const operation of result.plan.operations.delete) {
      const target = ensureDestinationPath(options.destinationDir, operation.path);
      if (fs.existsSync(target)) fs.unlinkSync(target);
    }
    if (result.plan.operations.write.length || result.plan.operations.delete.length || !fs.existsSync(ledgerPath)) {
      fs.renameSync(ledgerTempPath, ledgerPath);
      ledgerTouched = true;
    }
    const changed = result.plan.operations.write.length > 0 || result.plan.operations.delete.length > 0 || !ledgerBackup;
    fs.rmSync(workDir, { recursive: true, force: true });
    return { ...result, applied: true, changed, ledgerPath };
  } catch (error) {
    try {
      restoreDestination({ destinationDir: options.destinationDir, backups, created, ledgerPath, ledgerBackup, ledgerTouched });
    } catch (rollbackError) {
      error.message = `${error.message}; rollback失敗: ${rollbackError.message}`;
    }
    fs.rmSync(workDir, { recursive: true, force: true });
    return {
      ...result,
      ok: false,
      applied: false,
      changed: false,
      errors: [...result.errors, `受渡し適用を中止しました: ${error.message}`],
      failure: error.message
    };
  }
}

function deliver(options) {
  const normalized = {
    ...options,
    profile: options.profile || 'new',
    candidateRecordPath: options.candidateRecordPath && path.resolve(options.candidateRecordPath),
    stagingDir: options.stagingDir && path.resolve(options.stagingDir),
    releasePath: options.releasePath && path.resolve(options.releasePath),
    buildPath: options.buildPath && path.resolve(options.buildPath),
    checksPath: options.checksPath && path.resolve(options.checksPath),
    destinationDir: options.destinationDir && path.resolve(options.destinationDir),
    apply: options.apply === true
  };
  const result = planDelivery(normalized);
  if (!result.ok || !normalized.apply) return { ...result, applied: false, changed: false };
  return applyDelivery(result, normalized);
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = { profile: 'new', apply: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--candidate-record') options.candidateRecordPath = argv[++index];
    else if (arg === '--staging') options.stagingDir = argv[++index];
    else if (arg === '--release') options.releasePath = argv[++index];
    else if (arg === '--build') options.buildPath = argv[++index];
    else if (arg === '--checks-file') options.checksPath = argv[++index];
    else if (arg === '--destination') options.destinationDir = argv[++index];
    else if (arg === '--profile') options.profile = argv[++index];
    else if (arg === '--plan') options.planPath = argv[++index];
    else if (arg === '--apply') options.apply = true;
    else if (arg === '--dry-run') options.apply = false;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`未知の引数です: ${arg}`);
  }
  return options;
}

function usage() {
  return [
    'usage: node tools/transfer-public-site-artifact.js [options]',
    '  --candidate-record FILE  checked candidate record',
    '  --staging DIR            candidate staging root containing new/legacy',
    '  --release FILE           bound public-site-release.json',
    '  --build FILE             bound public-site-build.json',
    '  --checks-file FILE       bound check evidence JSON',
    '  --destination DIR        destination repository/artifact root',
    '  --profile new|legacy     profile to deliver (default: new)',
    '  --plan FILE              write the inspected plan JSON',
    '  --dry-run                inspect only (default)',
    '  --apply                  apply only after all preflight checks pass'
  ].join('\n');
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(usage());
    return 0;
  }
  let result;
  try {
    result = deliver(options);
    if (options.planPath && result.plan) {
      fs.mkdirSync(path.dirname(path.resolve(options.planPath)), { recursive: true });
      fs.writeFileSync(path.resolve(options.planPath), `${JSON.stringify(result.plan, null, 2)}\n`, 'utf8');
    }
  } catch (error) {
    console.error(error.message || error);
    return 1;
  }
  console.log(JSON.stringify({
    ok: result.ok,
    applied: result.applied,
    changed: result.changed,
    candidateId: result.plan?.candidateId || null,
    profile: result.plan?.profile || options.profile,
    writes: result.plan?.operations.write.length || 0,
    deletes: result.plan?.operations.delete.length || 0,
    unchanged: result.plan?.operations.unchanged.length || 0,
    conflicts: result.plan?.operations.conflicts.length || 0,
    errors: result.errors || []
  }, null, 2));
  return result.ok ? 0 : 2;
}

if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  }
}

module.exports = {
  IDENTITY_FILE,
  LEDGER_FILE,
  LEDGER_PURPOSE,
  deliver,
  identityFor,
  main,
  makeLedger,
  planDelivery
};
