#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const manifest = require(path.join(root, 'tools', 'formation-share-asset-manifest.json'));
const { buildSyncPlan } = require(path.join(root, 'tools', 'sync-formation-share-assets.js'));

const plan = buildSyncPlan(manifest);
assert.deepEqual(plan.changedFiles, []);
assert.match(plan.pageVersion, /^[0-9a-f]{16}$/);
assert.match(plan.derivedVersions['formation-share-create'], /^[0-9a-f]{16}$/);
assert.match(plan.derivedVersions['app-cache'], /^[0-9a-f]{16}$/);
assert.equal(plan.directVersions['formation-share-display-data'].length, 16);

for (const relativePath of manifest.directAssets.map(asset => asset.path)) {
  assert.equal(plan.texts.has(relativePath), true);
}
for (const relativePath of [manifest.pageVersion.constantFile, ...manifest.derivedAssets.map(asset => asset.path)]) {
  assert.equal(plan.texts.has(relativePath), true);
}

console.log('formation share asset checks passed');
