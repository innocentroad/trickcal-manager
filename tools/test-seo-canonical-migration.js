'use strict';

const assert = require('assert');
const path = require('path');
const {
  PublicSiteError,
  readManifest,
  updateCanonicalMetadata,
  validateManifest
} = require('./generate-public-site.js');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function canonicalHref(html) {
  const tags = (html.match(/<link\b[^>]*>/gi) || [])
    .filter(tag => /\brel=["'][^"']*\bcanonical\b[^"']*["']/i.test(tag));
  assert.strictEqual(tags.length, 1, 'canonical link must be unique');
  return tags[0].match(/\bhref=["']([^"']+)["']/i)?.[1] || '';
}

function run(repoRoot = path.resolve(__dirname, '..')) {
  const manifest = readManifest(path.join(repoRoot, 'tools', 'public-route-manifest.json'));
  const manager = manifest.routes.find(route => route.id === 'manager');
  const context = {
    manifest,
    routeById: new Map(manifest.routes.map(route => [route.id, route]))
  };
  const sourceUrl = `${manifest.profiles.legacy.origin}/trickcal-manager/${manager.source}`;
  const legacyPageUrl = `${manifest.profiles.legacy.origin}${manager.profiles.legacy.publicPath}`;
  const newPageUrl = `${manifest.profiles.new.origin}${manager.profiles.new.publicPath}`;
  const sourceHtml = [
    '<!doctype html><html><head>',
    `<link rel="canonical" href="${sourceUrl}">`,
    `<meta property="og:url" content="${sourceUrl}">`,
    '<meta property="og:type" content="website">',
    '</head><body>',
    `<script type="application/ld+json">{"url":"${sourceUrl}"}</script>`,
    `<a href="${sourceUrl}">page</a>`,
    '</body></html>'
  ].join('');

  const legacyHtml = updateCanonicalMetadata(sourceHtml, { routeId: 'manager', profile: 'legacy' }, context);
  assert.strictEqual(canonicalHref(legacyHtml), newPageUrl, 'legacy canonical targets its matching new-profile route');
  assert(legacyHtml.includes(`<meta property="og:url" content="${legacyPageUrl}">`), 'legacy og:url remains profile-specific');
  assert(legacyHtml.includes(`<script type="application/ld+json">{"url":"${legacyPageUrl}"}</script>`), 'legacy structured data remains profile-specific');
  assert(legacyHtml.includes(`<a href="${legacyPageUrl}">page</a>`), 'legacy ordinary route URLs remain profile-specific');
  assert(legacyHtml.includes('<meta property="og:type" content="website">'));

  const newHtml = updateCanonicalMetadata(sourceHtml, { routeId: 'manager', profile: 'new' }, context);
  assert.strictEqual(canonicalHref(newHtml), newPageUrl, 'new canonical remains its existing new-profile URL');
  assert(newHtml.includes(`<meta property="og:url" content="${newPageUrl}">`), 'new og:url remains the new page URL');
  assert(newHtml.includes(`<script type="application/ld+json">{"url":"${newPageUrl}"}</script>`), 'new structured data remains new-profile-specific');
  assert(newHtml.includes(`<a href="${newPageUrl}">page</a>`), 'new ordinary route URLs retain existing new-profile resolution');
  const canonical = new URL(canonicalHref(legacyHtml));
  assert.strictEqual(canonical.search, '', 'canonical excludes query');
  assert.strictEqual(canonical.hash, '', 'canonical excludes hash');

  const dataRoute = manifest.routes.find(route => route.id === 'data');
  const generatedData = updateCanonicalMetadata(
    '<!doctype html><html><head></head><body></body></html>',
    { routeId: 'data', profile: 'legacy' },
    context
  );
  assert.strictEqual(canonicalHref(generatedData), `${manifest.profiles.new.origin}${dataRoute.profiles.new.publicPath}`);
  assert(generatedData.includes(`<meta property="og:url" content="${manifest.profiles.legacy.origin}${dataRoute.profiles.legacy.publicPath}">`), 'generated data og:url uses its serving profile');

  const duplicateCanonicalHtml = sourceHtml.replace(
    '</head>',
    `<link rel="canonical" href="${sourceUrl}"></head>`
  );
  assert.throws(
    () => updateCanonicalMetadata(duplicateCanonicalHtml, { routeId: 'manager', profile: 'legacy' }, context),
    error => error instanceof PublicSiteError && /canonicalが重複/.test(error.message),
    'duplicate canonical metadata is rejected'
  );

  const invalidProfile = clone(manifest);
  invalidProfile.routes.find(route => route.id === 'manager').seo.canonicalProfile = 'unknown';
  const invalidResult = validateManifest(invalidProfile, { repoRoot });
  assert.strictEqual(invalidResult.ok, false);
  assert(invalidResult.errors.some(error => /canonicalProfileは既知のprofile/.test(error)));

  const missingProfile = clone(manifest);
  const missingManager = missingProfile.routes.find(route => route.id === 'manager');
  missingManager.seo.canonicalProfile = 'legacy';
  delete missingManager.profiles.legacy;
  const missingResult = validateManifest(missingProfile, { repoRoot });
  assert.strictEqual(missingResult.ok, false);
  assert(missingResult.errors.some(error => /canonicalProfileのroute profileがありません: manager\.legacy/.test(error)));

  return {
    canonicalTargets: ['new', 'legacy'],
    profileMetadataPreserved: true,
    duplicateCanonicalRejected: true,
    invalidCanonicalProfileRejected: true,
    missingCanonicalRouteRejected: true
  };
}

if (require.main === module) console.log(`SEO canonical focus tests passed: ${JSON.stringify(run())}`);

module.exports = { run };
