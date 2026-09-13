#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const generation = fs.readFileSync(path.join(__dirname, 'generate-all.bat'), 'utf8');
const push = fs.readFileSync(path.join(__dirname, 'git', 'push.bat'), 'utf8');
const pages = fs.readFileSync(path.join(root, '.github', 'workflows', 'pages.yml'), 'utf8');
const { main: validate } = require(path.join(__dirname, 'validate-formation-share-maintenance.js'));

const generationSteps = [
  'sync-formation-share-catalog.js" --write',
  'generate-formation-share-display-data.js" --check-images',
  'sync-formation-share-assets.js" --write',
  'validate-formation-share-maintenance.js'
];
let previousIndex = -1;
for (const step of generationSteps) {
  const currentIndex = generation.indexOf(step);
  assert.ok(currentIndex > previousIndex, `generate-all.batの工程順が不正です: ${step}`);
  previousIndex = currentIndex;
}
assert.match(push, /node tools[\\/]validate-formation-share-maintenance\.js/);
assert.match(push, /--base-catalog/);
assert.match(pages, /run: node tools\/validate-formation-share-maintenance\.js/);
assert.match(pages, /node-version: 20/);
assert.match(pages, /GITHUB_EVENT_BEFORE:/);
assert.equal(validate(['--base-catalog', 'tools/fixtures/formation-share-catalog-v1.json']), true);

console.log('formation share maintenance integration checks passed');
