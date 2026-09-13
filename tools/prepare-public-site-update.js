#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  buildPlan,
  generatePublicSite,
  readManifest
} = require('./generate-public-site.js');

const ROOT = path.resolve(__dirname, '..');
const BUNDLE_ROOT = path.join(ROOT, 'tmp', 'public-site-u2');
const SOURCE_ROOT = path.join(BUNDLE_ROOT, 'source');
const OLD_OUTPUT = path.join(SOURCE_ROOT, 'tmp', 'public-site-old');
const NEW_OUTPUT = path.join(SOURCE_ROOT, 'tmp', 'public-site-new');
const LEDGER_PATH = path.join(BUNDLE_ROOT, 'ledger.json');
const MANIFEST_PATH = path.join(__dirname, 'public-route-manifest.json');

function copyPlanSources(plan) {
  const sources = [...new Set(plan.entries.map(entry => entry.source).filter(Boolean))].sort();
  for (const relativePath of sources) {
    const source = path.join(ROOT, relativePath);
    const destination = path.join(SOURCE_ROOT, relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
  return sources;
}

function readRelease(outputDir) {
  return JSON.parse(fs.readFileSync(path.join(outputDir, 'public-site-release.json'), 'utf8'));
}

function prepare() {
  const manifest = readManifest(MANIFEST_PATH);
  const sourcePlan = buildPlan(manifest, { repoRoot: ROOT, outputDir: OLD_OUTPUT });
  fs.rmSync(BUNDLE_ROOT, { recursive: true, force: true });
  fs.mkdirSync(SOURCE_ROOT, { recursive: true });
  const sourcePaths = copyPlanSources(sourcePlan);

  const oldResult = generatePublicSite(manifest, {
    repoRoot: SOURCE_ROOT,
    outputDir: OLD_OUTPUT,
    write: true
  });
  const oldRelease = readRelease(OLD_OUTPUT);

  fs.appendFileSync(path.join(SOURCE_ROOT, 'app-cache.js'), '\n// U2 isolated app asset update fixture\n');
  const newResult = generatePublicSite(manifest, {
    repoRoot: SOURCE_ROOT,
    outputDir: NEW_OUTPUT,
    write: true,
    previousRelease: oldRelease
  });
  const newRelease = readRelease(NEW_OUTPUT);
  const ledger = {
    schemaVersion: 1,
    purpose: 'U2 local-only generated update verification',
    sourceRoot: SOURCE_ROOT,
    oldOutput: OLD_OUTPUT,
    newOutput: NEW_OUTPUT,
    changedSource: 'app-cache.js',
    sourceCount: sourcePaths.length,
    old: {
      releaseId: oldRelease.releaseId,
      contentDigest: oldRelease.contentDigest,
      status: oldRelease.status,
      dirty: oldRelease.dirty
    },
    new: {
      releaseId: newRelease.releaseId,
      previousReleaseId: newRelease.previousRelease?.releaseId || null,
      contentDigest: newRelease.contentDigest,
      status: newRelease.status,
      dirty: newRelease.dirty
    }
  };
  fs.writeFileSync(LEDGER_PATH, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({
    ok: true,
    ledger: LEDGER_PATH,
    sourceRoot: SOURCE_ROOT,
    oldOutput: OLD_OUTPUT,
    newOutput: NEW_OUTPUT,
    oldReleaseId: oldResult.releaseId,
    newReleaseId: newResult.releaseId,
    previousReleaseId: newRelease.previousRelease?.releaseId || null,
    sourceCount: sourcePaths.length
  }, null, 2)}\n`);
}

function clean() {
  fs.rmSync(BUNDLE_ROOT, { recursive: true, force: true });
  console.log(`removed ${BUNDLE_ROOT}`);
}

if (process.argv.includes('--clean')) clean();
else prepare();
