#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const generated = require(path.join(root, 'formation-share-display-data.js'));
const { buildDisplayData } = require(path.join(root, 'tools', 'generate-formation-share-display-data.js'));

const rebuilt = buildDisplayData({ checkImages: false });

function assertImagePath(value, pattern) {
  assert.match(value, pattern);
  const relativePath = value.split('?')[0];
  if (fs.existsSync(path.join(root, relativePath.replaceAll('/', path.sep)))) {
    assert.match(value, /\?v=[0-9a-f]{16}$/);
  }
}

assert.deepEqual(JSON.parse(JSON.stringify(generated)), JSON.parse(JSON.stringify(rebuilt)));
assert.equal(generated.version, 1);
assert.deepEqual(generated.sourceCounts, {
  apostles: Object.keys(generated.apostles).length,
  artifacts: Object.keys(generated.artifacts).length,
  spells: Object.keys(generated.spells).length,
  masterPowers: Object.keys(generated.masterPowers).length
});

for (const [id, apostle] of Object.entries(generated.apostles)) {
  assert.equal(typeof apostle.name, 'string');
  assert.equal(typeof apostle.personality, 'string');
  assertImagePath(apostle.imagePath, /^img\/Chara\/.+\.webp(?:\?v=[0-9a-f]{16})?$/);
  assert.deepEqual(Object.keys(apostle).sort(), ['imagePath', 'name', 'personality', 'position', 'role']);
  assert.equal(id.includes('effects'), false);
}
for (const [id, card] of Object.entries({ ...generated.artifacts, ...generated.spells })) {
  assert.equal(typeof card.name, 'string');
  assert.equal(typeof card.rarity, 'string');
  assert.equal(Number.isFinite(card.cost), true);
  assertImagePath(card.imagePath, /^img\/Card\/(Artifact|Spell)\/.+\.webp(?:\?v=[0-9a-f]{16})?$/);
  assert.equal(id.includes('effects'), false);
}
for (const power of Object.values(generated.masterPowers)) {
  assert.equal(Number.isFinite(power.cost), true);
  assertImagePath(power.imagePath, /^img\/Card\/権能_.+\.webp(?:\?v=[0-9a-f]{16})?$/);
}

for (const [relativePath, imagePath] of Object.entries(generated.assets)) {
  const escapedPath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assertImagePath(imagePath, new RegExp(`^${escapedPath}(?:\\?v=[0-9a-f]{16})?$`));
}

console.log('formation share display data checks passed');
