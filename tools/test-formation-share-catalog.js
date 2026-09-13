#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'tools', 'sync-formation-share-catalog.js');
const catalog = require(path.join(root, 'formation-share-catalog.js'));
const fixture = JSON.parse(fs.readFileSync(
  path.join(root, 'tools', 'fixtures', 'formation-share-catalog-v1.json'),
  'utf8'
));
const { assertPrefix, compareLists, main, normalizeCatalogLists, renderCatalog } = require(scriptPath);

const catalogLists = normalizeCatalogLists(catalog, 'current catalog');
const fixtureLists = fixture.lists;
assertPrefix(fixtureLists, catalogLists, 'published fixture');
assert.deepEqual(catalogLists.apostles.slice(-2), ['Barie', 'Sherum']);
assert.equal(catalogLists.artifacts.at(-1), 'artifact_sherum_parchment_scroll');

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-share-catalog-'));
const tempCatalogPath = path.join(tempDirectory, 'formation-share-catalog.js');
fs.writeFileSync(tempCatalogPath, renderCatalog(fixtureLists), 'utf8');

function run(mode) {
  const output = [];
  const originalLog = console.log;
  console.log = (...values) => output.push(values.join(' '));
  try {
    main([mode, '--catalog', tempCatalogPath]);
    return { error: null, output: output.join('\n') };
  } catch (error) {
    return { error, output: output.join('\n') };
  } finally {
    console.log = originalLog;
  }
}

try {
  const missing = run('--check');
  assert.match(missing.error?.message || '', /Barie/);
  assert.match(missing.error?.message || '', /Sherum/);
  assert.match(missing.error?.message || '', /artifact_sherum_parchment_scroll/);

  const written = run('--write');
  assert.equal(written.error, null, written.error?.message || written.output);
  delete require.cache[require.resolve(tempCatalogPath)];
  const appendedCatalog = require(tempCatalogPath);
  const appendedLists = normalizeCatalogLists(appendedCatalog, 'appended catalog');
  assertPrefix(fixtureLists, appendedLists, 'appended published fixture');
  assert.deepEqual(appendedLists.apostles.slice(-2), ['Barie', 'Sherum']);
  assert.equal(appendedLists.artifacts.at(-1), 'artifact_sherum_parchment_scroll');

  const stable = run('--write');
  assert.equal(stable.error, null, stable.error?.message || stable.output);
  assert.match(stable.output, /変更していません/);

  const reordered = {
    ...catalogLists,
    apostles: [catalogLists.apostles[1], catalogLists.apostles[0], ...catalogLists.apostles.slice(2)]
  };
  assert.throws(
    () => assertPrefix(fixtureLists, reordered, 'reordered catalog'),
    /公開番号が変更されています/
  );

  const comparison = compareLists(
    { ...catalogLists, apostles: catalogLists.apostles.slice(0, -1) },
    catalogLists
  );
  assert.deepEqual(comparison.retired.apostles, ['Sherum']);
} finally {
  fs.rmSync(tempDirectory, { recursive: true, force: true });
}

console.log('formation share catalog checks passed');
