#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {
  buildPlan,
  checkPublicSite,
  directoryDigest,
  isUsableReleaseRecord,
  readManifest,
  validateManifest
} = require('./generate-public-site.js');
const { hashText } = require('./sync-formation-share-assets.js');
const {
  PROFILE_NAMES,
  releaseProfileDigests,
  releaseProfileServiceWorkerHashes,
  validateBoundChecks
} = require('./public-site-candidate.js');

const TOOL_ROOT = path.resolve(__dirname, '..');
const RECORD_FILES = new Set(['public-site-build.json', 'public-site-release.json']);

function digestBuffer(buffer) {
  const crypto = require('node:crypto');
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
    else if (arg === '--out') options.outputPath = argv[++index];
    else if (arg === '--help') options.help = true;
    else throw new Error(`未知の引数です: ${arg}`);
  }
  return options;
}

function usage() {
  return [
    'usage: node tools/record-public-site-checks.js [options]',
    '  --repo-root DIR       source repository (default: manager root)',
    '  --source DIR          generated dual-profile output',
    '  --manifest FILE       public-route-manifest.json',
    '  --release FILE        public-site-release.json',
    '  --build FILE          public-site-build.json',
    '  --out FILE            check evidence output outside generated source'
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
      else throw new Error(`生成物に通常fileでないentryがあります: ${next}`);
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

function checkGeneratedOutput(sourceDir, release, build) {
  if (!isUsableReleaseRecord(release)) throw new Error('release recordがU1以降の整合形ではありません');
  if (!Array.isArray(build?.files)) throw new Error('build recordのfilesがありません');
  const actualFiles = listFiles(sourceDir);
  const contentFiles = actualFiles.filter(file => !RECORD_FILES.has(file));
  const expectedFiles = build.files.map(file => file.output).sort((left, right) => left.localeCompare(right));
  if (contentFiles.length !== expectedFiles.length || contentFiles.some((file, index) => file !== expectedFiles[index])) {
    throw new Error('generated outputとbuild recordのfile一覧が一致しません');
  }
  const contentDigest = directoryDigest(sourceDir, { exclude: [...RECORD_FILES] });
  if (contentDigest !== release.contentDigest) throw new Error('generated outputのcontentDigestがreleaseと不一致です');
  const expectedProfiles = releaseProfileDigests(release);
  const expectedServiceWorkers = releaseProfileServiceWorkerHashes(release);
  for (const profileName of PROFILE_NAMES) {
    const actual = profileOutputDigest(build, sourceDir, profileName);
    if (actual !== expectedProfiles[profileName]) throw new Error(`${profileName} outputDigestがreleaseと不一致です`);
    const profile = release.profiles.find(item => item.profile === profileName);
    const serviceWorkerPath = path.join(sourceDir, profile.serviceWorker.output);
    if (digestBuffer(fs.readFileSync(serviceWorkerPath)) !== expectedServiceWorkers[profileName]) {
      throw new Error(`${profileName} Service Worker hashがreleaseと不一致です`);
    }
  }
  return { contentDigest, fileCount: contentFiles.length };
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
  }[extension] || 'application/octet-stream';
}

function createStaticServer(rootDirectory) {
  const root = path.resolve(rootDirectory);
  return http.createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { allow: 'GET, HEAD' });
      response.end();
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost/').pathname);
    } catch (_) {
      response.writeHead(400);
      response.end();
      return;
    }
    const relative = pathname.replace(/^\/+/, '');
    const requested = path.resolve(root, relative);
    if (!((requested === root) || requested.startsWith(`${root}${path.sep}`))) {
      response.writeHead(403);
      response.end();
      return;
    }
    let filePath = requested;
    try {
      if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
      if (!fs.statSync(filePath).isFile()) throw new Error('not a file');
    } catch (_) {
      response.writeHead(404);
      response.end();
      return;
    }
    const stat = fs.statSync(filePath);
    response.writeHead(200, {
      'content-type': contentType(filePath),
      'content-length': stat.size,
      'cache-control': 'no-store'
    });
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(filePath).pipe(response);
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise(resolve => server.close(() => resolve()));
}

async function checkHttp(manifest, repoRoot, sourceDir) {
  const plan = buildPlan(manifest, { repoRoot, outputDir: sourceDir });
  const requests = new Map();
  for (const [key] of plan.publicPaths) {
    const separator = key.indexOf(':');
    const profile = key.slice(0, separator);
    const publicPath = key.slice(separator + 1);
    requests.set(`${profile}:${publicPath}`, { profile, publicPath, label: key });
  }
  for (const entry of plan.entries.filter(item => item.type === 'asset')) {
    const publicPath = `/${entry.outputRel}`.replace(/\/+/g, '/');
    requests.set(`${entry.profile}:${publicPath}`, { profile: entry.profile, publicPath, label: entry.label });
  }
  const servers = [createStaticServer(sourceDir), createStaticServer(sourceDir)];
  const ports = await Promise.all(servers.map(listen));
  const failures = [];
  try {
    for (const request of requests.values()) {
      const base = `http://127.0.0.1:${ports[request.profile === 'new' ? 0 : 1]}/`;
      const response = await fetch(new URL(request.publicPath, base), { method: 'HEAD' });
      if (response.status !== 200) failures.push(`${request.label}: HTTP ${response.status}`);
    }
  } finally {
    await Promise.all(servers.map(close));
  }
  if (failures.length) throw new Error(`HTTP到達失敗: ${failures.slice(0, 8).join(' | ')}`);
  return { requestCount: requests.size };
}

function resolveOptions(options) {
  const repoRoot = path.resolve(options.repoRoot || TOOL_ROOT);
  const sourceDir = path.resolve(options.sourceDir || path.join(repoRoot, 'tmp', 'public-site'));
  const manifestPath = path.resolve(options.manifestPath || path.join(repoRoot, 'tools', 'public-route-manifest.json'));
  const releasePath = path.resolve(options.releasePath || path.join(sourceDir, 'public-site-release.json'));
  const buildPath = path.resolve(options.buildPath || path.join(sourceDir, 'public-site-build.json'));
  const outputPath = path.resolve(options.outputPath || path.join(repoRoot, 'tmp', 'public-site-checks.json'));
  const tmpRoot = path.resolve(repoRoot, 'tmp');
  const relativeOutput = path.relative(tmpRoot, outputPath);
  if (!relativeOutput || path.isAbsolute(relativeOutput) || relativeOutput === '..' || relativeOutput.startsWith(`..${path.sep}`)) {
    throw new Error(`checks出力はrepoのtmp配下に限定してください: ${outputPath}`);
  }
  const relativeSource = path.relative(sourceDir, outputPath);
  if (!path.isAbsolute(relativeSource) && relativeSource !== '..' && !relativeSource.startsWith(`..${path.sep}`)) {
    throw new Error(`checks出力をgenerated source内へ置けません: ${outputPath}`);
  }
  return { repoRoot, sourceDir, manifestPath, releasePath, buildPath, outputPath };
}

function runCheck(name, callback) {
  try {
    return { ok: true, detail: callback() };
  } catch (error) {
    return { ok: false, error: error.message || String(error) };
  }
}

async function run(options) {
  const paths = resolveOptions(options);
  let manifest = null;
  let release = null;
  let build = null;
  const failures = [];
  try {
    manifest = readManifest(paths.manifestPath);
  } catch (error) {
    failures.push(`manifest: ${error.message}`);
  }
  try {
    release = readJson(paths.releasePath);
  } catch (error) {
    failures.push(`release: ${error.message}`);
  }
  try {
    build = readJson(paths.buildPath);
  } catch (error) {
    failures.push(`build: ${error.message}`);
  }
  const results = {
    generationCheck: manifest && fs.existsSync(paths.sourceDir)
      ? runCheck('generationCheck', () => checkPublicSite(manifest, { repoRoot: paths.repoRoot, outputDir: paths.sourceDir }))
      : { ok: false, error: 'manifestまたはgenerated sourceがありません' },
    manifestValidate: manifest
      ? runCheck('manifestValidate', () => {
        const validation = validateManifest(manifest, { repoRoot: paths.repoRoot });
        if (!validation.ok) throw new Error(validation.errors.join('\n'));
        return { ok: true };
      })
      : { ok: false, error: 'manifestがありません' },
    publicSiteTest: release && build && fs.existsSync(paths.sourceDir)
      ? runCheck('publicSiteTest', () => checkGeneratedOutput(paths.sourceDir, release, build))
      : { ok: false, error: 'release/build/generated sourceがありません' },
    httpCheck: manifest && fs.existsSync(paths.sourceDir)
      ? await checkHttp(manifest, paths.repoRoot, paths.sourceDir).then(detail => ({ ok: true, detail })).catch(error => ({ ok: false, error: error.message || String(error) }))
      : { ok: false, error: 'manifestまたはgenerated sourceがありません' }
  };
  const binding = release ? {
    releaseId: release.releaseId || '',
    sourceCommit: release.sourceCommit || '',
    contentDigest: release.contentDigest || '',
    profiles: releaseProfileDigests(release)
  } : { releaseId: '', sourceCommit: '', contentDigest: '', profiles: {} };
  const record = {
    schemaVersion: 1,
    purpose: 'P5b generated public-site check evidence',
    producedBy: 'tools/record-public-site-checks.js',
    releaseId: binding.releaseId,
    generationCheck: results.generationCheck.ok,
    manifestValidate: results.manifestValidate.ok,
    publicSiteTest: results.publicSiteTest.ok,
    httpCheck: results.httpCheck.ok,
    sourceCommit: binding.sourceCommit,
    contentDigest: binding.contentDigest,
    profiles: binding.profiles,
    checks: results,
    failures: [
      ...failures,
      ...Object.entries(results).filter(([, result]) => !result.ok).map(([name, result]) => `${name}: ${result.error}`)
    ]
  };
  const bindingValidation = release ? validateBoundChecks(record, release) : { ok: false, errors: ['releaseがありません'] };
  record.binding = {
    ok: bindingValidation.ok,
    errors: bindingValidation.errors
  };
  if (!bindingValidation.ok) record.failures.push(...bindingValidation.errors.map(error => `binding: ${error}`));
  fs.mkdirSync(path.dirname(paths.outputPath), { recursive: true });
  fs.writeFileSync(paths.outputPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return {
    paths,
    record,
    ok: record.failures.length === 0
  };
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(usage());
    return 0;
  }
  const result = await run(options);
  console.log(JSON.stringify({
    ok: result.ok,
    outputPath: result.paths.outputPath,
    releaseId: result.record.releaseId,
    checks: {
      generationCheck: result.record.generationCheck,
      manifestValidate: result.record.manifestValidate,
      publicSiteTest: result.record.publicSiteTest,
      httpCheck: result.record.httpCheck
    },
    binding: result.record.binding,
    failures: result.record.failures
  }, null, 2));
  return result.ok ? 0 : 1;
}

if (require.main === module) {
  main().then(code => { process.exitCode = code; }).catch(error => {
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  });
}

module.exports = { main, run };
