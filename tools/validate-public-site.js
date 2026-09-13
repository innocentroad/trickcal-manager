'use strict';

const path = require('path');
const {
  DEFAULT_MANIFEST_PATH,
  checkPublicSite,
  readManifest,
  validateManifest
} = require('./generate-public-site.js');

function main() {
  const manifestPath = path.resolve(process.argv[2] || DEFAULT_MANIFEST_PATH);
  const manifest = readManifest(manifestPath);
  const repoRoot = path.resolve(path.dirname(manifestPath), '..');
  const validation = validateManifest(manifest, { repoRoot });
  if (!validation.ok) throw new Error(validation.errors.join('\n'));
  const result = checkPublicSite(manifest, { repoRoot });
  console.log(`public route manifest and generated site are valid: ${result.outputDir}`);
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exitCode = 1;
}
