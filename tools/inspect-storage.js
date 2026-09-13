#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { inspectStorageProject } = require('./storage-inspection');

const rootArgumentIndex = process.argv.indexOf('--root');
const root = rootArgumentIndex >= 0 && process.argv[rootArgumentIndex + 1]
  ? path.resolve(process.argv[rootArgumentIndex + 1])
  : path.resolve(__dirname, '..');
const result = inspectStorageProject({ root });

if (!result.ok) {
  for (const diagnostic of result.diagnostics) {
    const location = diagnostic.file ? `${diagnostic.file}${diagnostic.line ? `:${diagnostic.line}` : ''} ` : '';
    console.error(`[${diagnostic.code}] ${location}${diagnostic.message}`);
  }
  process.exitCode = 1;
} else {
  console.log(`storage inspection passed (${result.summary.keys} keys, ${result.summary.channels} channels, ${result.summary.storageAccesses} accesses)`);
}
