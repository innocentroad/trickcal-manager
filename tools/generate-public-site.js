'use strict';

const crypto = require('crypto');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { hashText } = require('./sync-formation-share-assets.js');
const { readGitState } = require('./public-site-candidate.js');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_MANIFEST_PATH = path.join(__dirname, 'public-route-manifest.json');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'tmp', 'public-site');
const PROFILE_NAMES = ['new', 'legacy'];
const GENERATORS = new Set(['home-entry', 'data-index']);
const RELEASE_INPUT_VERSION = 'public-site-release-input-v1';
const ROUTE_KINDS = new Set(['static-page', 'static-redirect', 'compatibility', 'maintenance']);
const TOP_KEYS = ['schemaVersion', 'profiles', 'assetConfig', 'serviceWorker', 'reservedPaths', 'routes', 'assets'];
const PROFILE_KEYS = ['origin', 'basePath', 'assetBasePath', 'serviceWorker'];
const PROFILE_SW_KEYS = ['script', 'scope'];
const SERVICE_WORKER_KEYS = ['source', 'cacheName', 'navigationStrategy', 'assetStrategy', 'imageStrategy', 'excludedPathPrefixes'];
const VERSIONED_IMAGE_EXTENSION = /\.(?:webp|png|jpe?g|gif|svg|ico)$/i;
const ROUTE_KEYS = ['id', 'source', 'generator', 'indexable', 'seo', 'profiles', 'fixtures'];
const ROUTE_SEO_KEYS = ['canonicalProfile'];
const ROUTE_PROFILE_KEYS = ['publicPath', 'kind', 'targetRouteId', 'aliases'];
const FIXTURE_KEYS = ['name', 'profile', 'query', 'hash', 'viewport', 'themes'];
const ASSET_KEYS = ['source', 'kind', 'profiles'];

class PublicSiteError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'PublicSiteError';
    this.errors = errors;
  }
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(item => stableStringify(item)).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function addUnknownKeyErrors(value, allowed, label, errors) {
  if (!isRecord(value)) return;
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) errors.push(`${label} に未知のフィールドがあります: ${key}`);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readManifest(manifestPath = DEFAULT_MANIFEST_PATH) {
  return readJson(manifestPath);
}

function isSafeRelativePath(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || value.includes('\0')) return false;
  if (value.startsWith('/') || value.includes('?') || value.includes('#')) return false;
  const parts = value.split('/');
  return parts.every(part => part && part !== '.' && part !== '..');
}

function isSafePublicPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.includes('\\') || value.includes('?') || value.includes('#')) {
    return false;
  }
  if (value.includes('//')) return false;
  const withoutTrailingSlash = value === '/' ? '' : value.replace(/\/+$/, '');
  const parts = withoutTrailingSlash.slice(1).split('/').filter(Boolean);
  return parts.every(part => part && part !== '.' && part !== '..');
}

function normalizePublicPath(value) {
  if (value === '/') return '/';
  return value.endsWith('/') ? value : value;
}

function outputRelativePath(publicPath) {
  const value = normalizePublicPath(publicPath);
  const withoutSlash = value.slice(1);
  if (!withoutSlash) return 'index.html';
  return value.endsWith('/') ? `${withoutSlash}index.html` : withoutSlash;
}

function joinPublicPath(basePath, relativePath) {
  const base = basePath === '/' ? '/' : `${basePath.replace(/\/+$/, '')}/`;
  return `${base}${relativePath}`;
}

function encodePublicAssetPath(publicPath) {
  return String(publicPath).split('/').map((segment, index) => {
    if (index === 0 && segment === '') return '';
    return encodeURIComponent(segment);
  }).join('/');
}

function isIndexAlias(canonicalPath, aliasPath) {
  const canonical = canonicalPath === '/' ? '/' : `${canonicalPath.replace(/\/+$/, '')}/`;
  return aliasPath === `${canonical}index.html`;
}

function outputPathOverlaps(left, right) {
  if (left === right) return true;
  return left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function safeResolve(root, relativePath) {
  const rootPath = path.resolve(root);
  const candidate = path.resolve(rootPath, relativePath);
  if (candidate !== rootPath && !candidate.startsWith(`${rootPath}${path.sep}`)) {
    throw new PublicSiteError(`出力先の外へ書き込もうとしています: ${relativePath}`);
  }
  return candidate;
}

function pathExists(repoRoot, relativePath, expectedKind = '') {
  if (!isSafeRelativePath(relativePath)) return false;
  const sourcePath = path.resolve(repoRoot, relativePath);
  if (sourcePath !== repoRoot && !sourcePath.startsWith(`${path.resolve(repoRoot)}${path.sep}`)) return false;
  try {
    const stat = fs.statSync(sourcePath);
    return !expectedKind || (expectedKind === 'directory' ? stat.isDirectory() : stat.isFile());
  } catch (_) {
    return false;
  }
}

function validateManifest(manifest, { repoRoot = ROOT } = {}) {
  const errors = [];
  if (!isRecord(manifest)) return { ok: false, errors: ['manifestはobjectである必要があります'] };
  addUnknownKeyErrors(manifest, TOP_KEYS, 'manifest', errors);
  if (manifest.schemaVersion !== 1) errors.push('schemaVersionは1である必要があります');

  if (!isRecord(manifest.profiles)) {
    errors.push('profilesはobjectである必要があります');
  } else {
    for (const name of PROFILE_NAMES) {
      if (!hasOwn(manifest.profiles, name)) errors.push(`profiles.${name} がありません`);
    }
    for (const name of Object.keys(manifest.profiles)) {
      if (!PROFILE_NAMES.includes(name)) errors.push(`未知のprofileです: ${name}`);
    }
    for (const name of PROFILE_NAMES) {
      const profile = manifest.profiles[name];
      if (!isRecord(profile)) {
        errors.push(`profiles.${name}はobjectである必要があります`);
        continue;
      }
      addUnknownKeyErrors(profile, PROFILE_KEYS, `profiles.${name}`, errors);
      if (typeof profile.origin !== 'string') {
        errors.push(`profiles.${name}.originが不正です`);
      } else {
        try {
          const origin = new URL(profile.origin);
          if (!['http:', 'https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash) {
            errors.push(`profiles.${name}.originはHTTP(S) originだけを指定してください`);
          }
        } catch (_) {
          errors.push(`profiles.${name}.originがURLではありません`);
        }
      }
      for (const key of ['basePath', 'assetBasePath']) {
        if (!isSafePublicPath(profile[key])) errors.push(`profiles.${name}.${key}が不正です`);
      }
      validateProfileServiceWorker(profile.serviceWorker, `profiles.${name}.serviceWorker`, errors);
    }
  }

  if (!isRecord(manifest.assetConfig)) {
    errors.push('assetConfigはobjectである必要があります');
  } else {
    addUnknownKeyErrors(manifest.assetConfig, ['policy', 'versionQuery', 'outputMode'], 'assetConfig', errors);
    if (manifest.assetConfig.policy !== 'manifest-only') errors.push('assetConfig.policyはmanifest-onlyである必要があります');
    if (typeof manifest.assetConfig.versionQuery !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(manifest.assetConfig.versionQuery)) {
      errors.push('assetConfig.versionQueryが不正です');
    }
    if (manifest.assetConfig.outputMode !== 'profile-base') errors.push('assetConfig.outputModeはprofile-baseである必要があります');
  }

  if (!isRecord(manifest.serviceWorker)) {
    errors.push('serviceWorkerはobjectである必要があります');
  } else {
    addUnknownKeyErrors(manifest.serviceWorker, SERVICE_WORKER_KEYS, 'serviceWorker', errors);
    if (!isSafeRelativePath(manifest.serviceWorker.source)) errors.push('serviceWorker.sourceが不正です');
    else if (!pathExists(repoRoot, manifest.serviceWorker.source, 'file')) errors.push(`serviceWorker.sourceが存在しません: ${manifest.serviceWorker.source}`);
    if (typeof manifest.serviceWorker.cacheName !== 'string' || !manifest.serviceWorker.cacheName) errors.push('serviceWorker.cacheNameが不正です');
    if (manifest.serviceWorker.navigationStrategy !== 'network-first') errors.push('serviceWorker.navigationStrategyが不正です');
    if (manifest.serviceWorker.assetStrategy !== 'stale-while-revalidate') errors.push('serviceWorker.assetStrategyが不正です');
    if (manifest.serviceWorker.imageStrategy != null && manifest.serviceWorker.imageStrategy !== 'cache-first-versioned') errors.push('serviceWorker.imageStrategyが不正です');
    validatePublicPathList(manifest.serviceWorker.excludedPathPrefixes, 'serviceWorker.excludedPathPrefixes', errors);
  }

  if (!isRecord(manifest.reservedPaths)) {
    errors.push('reservedPathsはobjectである必要があります');
  } else {
    for (const name of PROFILE_NAMES) {
      if (!hasOwn(manifest.reservedPaths, name)) errors.push(`reservedPaths.${name} がありません`);
      else validatePublicPathList(manifest.reservedPaths[name], `reservedPaths.${name}`, errors);
    }
    for (const name of Object.keys(manifest.reservedPaths)) {
      if (!PROFILE_NAMES.includes(name)) errors.push(`reservedPathsに未知のprofileがあります: ${name}`);
    }
  }

  const routeIds = new Set();
  const routeList = Array.isArray(manifest.routes) ? manifest.routes : [];
  if (!Array.isArray(manifest.routes) || !manifest.routes.length) errors.push('routesは1件以上のarrayである必要があります');
  for (let index = 0; index < routeList.length; index += 1) {
    const route = routeList[index];
    const label = `routes[${index}]`;
    if (!isRecord(route)) {
      errors.push(`${label}はobjectである必要があります`);
      continue;
    }
    addUnknownKeyErrors(route, ROUTE_KEYS, label, errors);
    if (typeof route.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(route.id)) errors.push(`${label}.idが不正です`);
    else if (routeIds.has(route.id)) errors.push(`route idが重複しています: ${route.id}`);
    else routeIds.add(route.id);
    const hasSource = hasOwn(route, 'source');
    const hasGenerator = hasOwn(route, 'generator');
    if (hasSource === hasGenerator) errors.push(`${label}はsourceまたはgeneratorのどちらか一方だけが必要です`);
    if (hasSource) {
      if (!isSafeRelativePath(route.source)) errors.push(`${label}.sourceが不正です`);
      else if (!pathExists(repoRoot, route.source, 'file')) errors.push(`${label}.sourceが存在しません: ${route.source}`);
    }
    if (hasGenerator && (!GENERATORS.has(route.generator) || typeof route.generator !== 'string')) errors.push(`${label}.generatorが不正です: ${route.generator}`);
    if (route.indexable === true && hasOwn(route, 'seo')) validateRouteSeo(route.seo, `${label}.seo`, errors);
    else if (hasOwn(route, 'seo')) errors.push(`${label}.seoはindexable routeだけに指定できます`);
    if (!isRecord(route.profiles)) {
      errors.push(`${label}.profilesはobjectである必要があります`);
    } else {
      for (const name of PROFILE_NAMES) {
        if (!hasOwn(route.profiles, name)) errors.push(`${label}.profiles.${name} がありません`);
      }
      for (const name of Object.keys(route.profiles)) {
        if (!PROFILE_NAMES.includes(name)) errors.push(`${label}.profilesに未知のprofileがあります: ${name}`);
      }
      for (const name of PROFILE_NAMES) validateRouteProfile(route.profiles[name], `${label}.profiles.${name}`, errors);
    }
    if (!Array.isArray(route.fixtures)) {
      errors.push(`${label}.fixturesはarrayである必要があります`);
    } else {
      for (let fixtureIndex = 0; fixtureIndex < route.fixtures.length; fixtureIndex += 1) {
        validateFixture(route.fixtures[fixtureIndex], `${label}.fixtures[${fixtureIndex}]`, errors);
      }
    }
  }

  const assetSources = new Set();
  const assetList = Array.isArray(manifest.assets) ? manifest.assets : [];
  if (!Array.isArray(manifest.assets)) errors.push('assetsはarrayである必要があります');
  for (let index = 0; index < assetList.length; index += 1) {
    const asset = assetList[index];
    const label = `assets[${index}]`;
    if (!isRecord(asset)) {
      errors.push(`${label}はobjectである必要があります`);
      continue;
    }
    addUnknownKeyErrors(asset, ASSET_KEYS, label, errors);
    if (!isSafeRelativePath(asset.source)) errors.push(`${label}.sourceが不正です`);
    else if (assetSources.has(asset.source)) errors.push(`asset sourceが重複しています: ${asset.source}`);
    else assetSources.add(asset.source);
    if (!['file', 'directory'].includes(asset.kind)) errors.push(`${label}.kindが不正です`);
    else if (isSafeRelativePath(asset.source) && !pathExists(repoRoot, asset.source, asset.kind)) errors.push(`${label}.sourceが存在しません: ${asset.source}`);
    if (!Array.isArray(asset.profiles) || !asset.profiles.length) {
      errors.push(`${label}.profilesは1件以上のarrayである必要があります`);
    } else {
      const seenProfiles = new Set();
      for (const profile of asset.profiles) {
        if (!PROFILE_NAMES.includes(profile)) errors.push(`${label}.profilesに未知のprofileがあります: ${profile}`);
        if (seenProfiles.has(profile)) errors.push(`${label}.profilesが重複しています: ${profile}`);
        seenProfiles.add(profile);
      }
    }
  }

  if (!errors.length) {
    validateCrossReferences(manifest, routeIds, errors);
  } else if (routeIds.size) {
    validateCrossReferences(manifest, routeIds, errors);
  }
  return { ok: errors.length === 0, errors };
}

function validateProfileServiceWorker(value, label, errors) {
  if (!isRecord(value)) {
    errors.push(`${label}はobjectである必要があります`);
    return;
  }
  addUnknownKeyErrors(value, PROFILE_SW_KEYS, label, errors);
  if (!isSafeRelativePath(value.script)) errors.push(`${label}.scriptが不正です`);
  if (!isSafePublicPath(value.scope)) errors.push(`${label}.scopeが不正です`);
}

function validateRouteSeo(value, label, errors) {
  if (!isRecord(value)) {
    errors.push(`${label}はindexable routeに必要なobjectです`);
    return;
  }
  addUnknownKeyErrors(value, ROUTE_SEO_KEYS, label, errors);
  if (!PROFILE_NAMES.includes(value.canonicalProfile)) {
    errors.push(`${label}.canonicalProfileは既知のprofileである必要があります`);
  }
}

function validateRouteProfile(value, label, errors) {
  if (!isRecord(value)) {
    errors.push(`${label}はobjectである必要があります`);
    return;
  }
  addUnknownKeyErrors(value, ROUTE_PROFILE_KEYS, label, errors);
  if (!isSafePublicPath(value.publicPath)) errors.push(`${label}.publicPathが不正です`);
  if (!ROUTE_KINDS.has(value.kind)) errors.push(`${label}.kindが不正です`);
  if (hasOwn(value, 'targetRouteId') && (typeof value.targetRouteId !== 'string' || !/^[a-z][a-z0-9-]*$/.test(value.targetRouteId))) {
    errors.push(`${label}.targetRouteIdが不正です`);
  }
  validatePublicPathList(value.aliases, `${label}.aliases`, errors);
}

function validatePublicPathList(value, label, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label}はarrayである必要があります`);
    return;
  }
  const seen = new Set();
  for (const item of value) {
    if (!isSafePublicPath(item)) errors.push(`${label}に不正なpathがあります: ${item}`);
    if (seen.has(item)) errors.push(`${label}に重複pathがあります: ${item}`);
    seen.add(item);
  }
}

function validateFixture(value, label, errors) {
  if (!isRecord(value)) {
    errors.push(`${label}はobjectである必要があります`);
    return;
  }
  addUnknownKeyErrors(value, FIXTURE_KEYS, label, errors);
  if (typeof value.name !== 'string' || !value.name) errors.push(`${label}.nameが不正です`);
  if (!PROFILE_NAMES.includes(value.profile)) errors.push(`${label}.profileが不正です`);
  if (typeof value.query !== 'string' || !/^$|^\?.*$/.test(value.query)) errors.push(`${label}.queryが不正です`);
  if (typeof value.hash !== 'string' || !/^$|^#.*$/.test(value.hash)) errors.push(`${label}.hashが不正です`);
  if (!['desktop', 'mobile'].includes(value.viewport)) errors.push(`${label}.viewportが不正です`);
  if (hasOwn(value, 'themes')) {
    if (!Array.isArray(value.themes) || value.themes.some(theme => !['light', 'dark'].includes(theme))) errors.push(`${label}.themesが不正です`);
    else if (new Set(value.themes).size !== value.themes.length) errors.push(`${label}.themesが重複しています`);
  }
}

function validateCrossReferences(manifest, routeIds, errors) {
  const seenPaths = new Map();
  const fixtureNames = new Set();
  const routeById = new Map(manifest.routes.map(route => [route.id, route]));
  for (const route of manifest.routes) {
    for (const profileName of PROFILE_NAMES) {
      const routeProfile = route.profiles?.[profileName];
      if (!routeProfile || !isRecord(routeProfile)) continue;
      const canonical = normalizePublicPath(routeProfile.publicPath);
      const pathEntries = [[canonical, 'canonical'], ...(Array.isArray(routeProfile.aliases) ? routeProfile.aliases.map(pathValue => [pathValue, 'alias']) : [])];
      for (const [publicPath, role] of pathEntries) {
        if (!isSafePublicPath(publicPath)) continue;
        const key = `${profileName}:${publicPath}`;
        const previous = seenPaths.get(key);
        if (previous) errors.push(`route/alias pathが衝突しています: ${key} (${previous.routeId} と ${route.id})`);
        else seenPaths.set(key, { routeId: route.id, role });
        if (role === 'alias' && publicPath === canonical) errors.push(`canonicalと同じaliasです: ${key}`);
        if (manifest.reservedPaths?.[profileName]?.includes(publicPath)) errors.push(`reserved pathと衝突しています: ${key}`);
      }
      const targetRouteId = routeProfile.targetRouteId;
      if (targetRouteId) {
        if (!routeIds.has(targetRouteId)) errors.push(`targetRouteIdが存在しません: ${route.id}.${profileName} -> ${targetRouteId}`);
        else if (targetRouteId === route.id) errors.push(`self redirectは禁止されています: ${route.id}.${profileName}`);
        else if (!routeById.get(targetRouteId)?.profiles?.[profileName]) errors.push(`target routeにprofileがありません: ${route.id}.${profileName} -> ${targetRouteId}`);
      }
      if (routeProfile.kind === 'static-redirect' && !targetRouteId) errors.push(`static-redirectにtargetRouteIdがありません: ${route.id}.${profileName}`);
    }
    if (route.indexable === true && route.seo?.canonicalProfile && !route.profiles?.[route.seo.canonicalProfile]) {
      errors.push(`canonicalProfileのroute profileがありません: ${route.id}.${route.seo.canonicalProfile}`);
    }
    for (const fixture of route.fixtures || []) {
      if (fixtureNames.has(fixture.name)) errors.push(`fixture nameが重複しています: ${fixture.name}`);
      fixtureNames.add(fixture.name);
      if (!route.profiles?.[fixture.profile]) errors.push(`fixtureのprofileがrouteにありません: ${route.id}.${fixture.profile}`);
    }
  }

  for (const asset of manifest.assets || []) {
    for (const profileName of asset.profiles || []) {
      const profile = manifest.profiles?.[profileName];
      if (!profile) continue;
      const publicPath = joinPublicPath(profile.assetBasePath, asset.source);
      if (manifest.reservedPaths?.[profileName]?.includes(publicPath)) errors.push(`assetがreserved pathと衝突しています: ${profileName}:${publicPath}`);
      const output = outputRelativePath(publicPath);
      for (const [key, entry] of seenPaths.entries()) {
        if (key.startsWith(`${profileName}:`) && outputPathOverlaps(output, outputRelativePath(key.slice(profileName.length + 1)))) {
          errors.push(`assetとroute/aliasの出力が衝突しています: ${profileName}:${asset.source} と ${key}`);
        }
      }
    }
  }
}

function buildPlan(manifest, { repoRoot = ROOT, outputDir = DEFAULT_OUTPUT_DIR } = {}) {
  const validation = validateManifest(manifest, { repoRoot });
  if (!validation.ok) throw new PublicSiteError(validation.errors.join('\n'), validation.errors);
  const routeById = new Map(manifest.routes.map(route => [route.id, route]));
  const entries = [];
  const outputOwners = new Map();
  const publicPaths = new Map();

  function addEntry(entry) {
    const outputKey = `${entry.profile}:${entry.outputRel}`;
    const previous = outputOwners.get(outputKey);
    if (previous) {
      throw new PublicSiteError(`生成出力が衝突しています: ${outputKey} (${previous.label} と ${entry.label})`);
    }
    outputOwners.set(outputKey, entry);
    entries.push(entry);
  }

  for (const profileName of PROFILE_NAMES) {
    const profile = manifest.profiles[profileName];
    for (const route of manifest.routes) {
      const routeProfile = route.profiles[profileName];
      const targetRoute = routeProfile.targetRouteId ? routeById.get(routeProfile.targetRouteId) : null;
      const targetPath = targetRoute?.profiles?.[profileName]?.publicPath || '';
      const canonicalEntry = {
        type: 'route',
        role: 'canonical',
        profile: profileName,
        routeId: route.id,
        kind: routeProfile.kind,
        publicPath: routeProfile.publicPath,
        outputRel: outputRelativePath(routeProfile.publicPath),
        source: route.source || null,
        generator: route.generator || null,
        targetPath,
        label: `${profileName}:${route.id}:canonical`
      };
      publicPaths.set(`${profileName}:${routeProfile.publicPath}`, canonicalEntry);
      addEntry(canonicalEntry);
      for (const alias of routeProfile.aliases) {
        if (isIndexAlias(routeProfile.publicPath, alias)) {
          publicPaths.set(`${profileName}:${alias}`, canonicalEntry);
          continue;
        }
        const aliasEntry = {
          type: 'alias',
          role: 'alias',
          profile: profileName,
          routeId: route.id,
          kind: 'static-redirect',
          publicPath: alias,
          outputRel: outputRelativePath(alias),
          targetPath: routeProfile.publicPath,
          label: `${profileName}:${route.id}:alias:${alias}`
        };
        publicPaths.set(`${profileName}:${alias}`, aliasEntry);
        addEntry(aliasEntry);
      }
    }
    for (const asset of manifest.assets) {
      if (!asset.profiles.includes(profileName)) continue;
      const sourcePath = path.resolve(repoRoot, asset.source);
      const destinationBase = outputRelativePath(joinPublicPath(profile.assetBasePath, asset.source));
      if (asset.kind === 'file') {
        addEntry({
          type: 'asset',
          role: 'asset',
          profile: profileName,
          source: asset.source,
          outputRel: destinationBase,
          label: `${profileName}:asset:${asset.source}`
        });
      } else {
        for (const relativeFile of listFiles(sourcePath)) {
          const outputRel = path.posix.join(destinationBase, relativeFile);
          addEntry({
            type: 'asset',
            role: 'asset',
            profile: profileName,
            source: path.posix.join(asset.source, relativeFile),
            outputRel,
            label: `${profileName}:asset:${asset.source}/${relativeFile}`
          });
        }
      }
    }
  }

  return {
    schemaVersion: manifest.schemaVersion,
    outputDir: path.resolve(outputDir),
    entries,
    publicPaths,
    profiles: PROFILE_NAMES.map(name => ({ name, ...manifest.profiles[name] })),
    fixtures: manifest.routes.flatMap(route => route.fixtures.map(fixture => ({ routeId: route.id, ...fixture })))
  };
}

function listFiles(directory) {
  const result = [];
  function visit(current, relative) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const nextRelative = relative ? path.posix.join(relative, entry.name) : entry.name;
      const nextPath = path.join(current, entry.name);
      if (entry.isDirectory()) visit(nextPath, nextRelative);
      else if (entry.isFile()) result.push(nextRelative.replaceAll('\\', '/'));
    }
  }
  visit(directory, '');
  return result;
}

function createBuildContext(manifest, plan, repoRoot, { previousRelease = null } = {}) {
  const assetSources = [...new Set(plan.entries
    .filter(entry => entry.type === 'asset')
    .map(entry => entry.source))].sort();
  const assetRecords = assetSources.map(relativePath => ({
    path: relativePath,
    sha256: digestBuffer(fs.readFileSync(path.resolve(repoRoot, relativePath)))
  }));
  const assetInput = JSON.stringify(assetRecords);
  const sourcePaths = [...new Set(plan.entries
    .map(entry => entry.source)
    .filter(Boolean))].sort();
  const sourceVersions = [
    { path: '[manifest]', sha256: digestBuffer(Buffer.from(stableStringify(manifest), 'utf8')) },
    ...sourcePaths.map(relativePath => ({
      path: relativePath,
      sha256: digestBuffer(fs.readFileSync(path.resolve(repoRoot, relativePath)))
    }))
  ];
  const releaseInput = {
    version: RELEASE_INPUT_VERSION,
    manifest,
    sourceVersions
  };
  const releaseInputText = stableStringify(releaseInput);
  const sourceToRoute = new Map([['index.html', 'home']]);
  const routeById = new Map(manifest.routes.map(route => [route.id, route]));
  for (const route of manifest.routes) {
    if (route.source) sourceToRoute.set(path.posix.normalize(route.source), route.id);
  }
  return {
    manifest,
    plan,
    repoRoot,
    routeById,
    sourceToRoute,
    assetSources: new Set(assetSources),
    assetRecords,
    assetsDigest: digestBuffer(Buffer.from(assetInput, 'utf8')),
    assetVersion: hashText(assetInput),
    sourceVersions,
    releaseInputDigest: digestBuffer(Buffer.from(releaseInputText, 'utf8')),
    releaseId: hashText(releaseInputText),
    previousRelease
  };
}

function splitReference(value) {
  const match = String(value).match(/[?#]/);
  if (!match) return { path: String(value), suffix: '' };
  return { path: String(value).slice(0, match.index), suffix: String(value).slice(match.index) };
}

function appendAssetVersion(publicPath, suffix, version) {
  if (!version) return `${publicPath}${suffix}`;
  const hashIndex = suffix.indexOf('#');
  const query = hashIndex >= 0 ? suffix.slice(0, hashIndex) : suffix;
  const hash = hashIndex >= 0 ? suffix.slice(hashIndex) : '';
  const parts = query.startsWith('?') ? query.slice(1).split('&').filter(Boolean) : [];
  const kept = parts.filter(part => !/^v=/.test(part));
  kept.push(`v=${version}`);
  return `${publicPath}?${kept.join('&')}${hash}`;
}

function isExternalReference(value) {
  return /^(?:data|blob|https?|mailto|tel|javascript):/i.test(value)
    || String(value).startsWith('//')
    || String(value).startsWith('#')
    || String(value).startsWith('?');
}

function resolveHtmlReference(value, entry, context) {
  if (!value || isExternalReference(value) || value.startsWith('/')) return value;
  const sourceDir = entry.source ? path.posix.dirname(entry.source) : '';
  const rawCandidate = path.posix.normalize(path.posix.join(sourceDir, value));
  if (rawCandidate !== '..' && !rawCandidate.startsWith('../') && context.assetSources.has(rawCandidate)) {
    const profile = context.manifest.profiles[entry.profile];
    return appendAssetVersion(encodePublicAssetPath(joinPublicPath(profile.assetBasePath, rawCandidate)), '', context.assetVersion);
  }
  const { path: referencePath, suffix } = splitReference(value);
  if (!referencePath) return value;
  const candidate = path.posix.normalize(path.posix.join(sourceDir, referencePath));
  if (candidate === '..' || candidate.startsWith('../')) return value;
  const routeId = context.sourceToRoute.get(candidate);
  const profileRoute = routeId ? context.routeById.get(routeId)?.profiles?.[entry.profile] : null;
  if (profileRoute) return `${profileRoute.publicPath}${suffix}`;
  if (!context.assetSources.has(candidate)) return value;
  const profile = context.manifest.profiles[entry.profile];
  return appendAssetVersion(encodePublicAssetPath(joinPublicPath(profile.assetBasePath, candidate)), suffix, context.assetVersion);
}

function createRuntimeConfig(context, profileName) {
  const profile = context.manifest.profiles[profileName];
  const routes = Object.fromEntries(context.manifest.routes.map(route => [route.id, route.profiles[profileName].publicPath]));
  const peerRoutes = Object.fromEntries(context.manifest.routes.map(route => [route.id, route.profiles.new.publicPath]));
  return {
    schemaVersion: 1,
    profile: profileName,
    origin: profile.origin,
    basePath: profile.basePath,
    assetBasePath: profile.assetBasePath,
    assetVersion: context.assetVersion,
    routes,
    peerRoutes,
    serviceWorker: profile.serviceWorker,
    serviceWorkerPolicy: context.manifest.serviceWorker
  };
}

function injectRuntimeConfig(html, context, profileName) {
  const profile = context.manifest.profiles[profileName];
  const config = JSON.stringify(createRuntimeConfig(context, profileName)).replace(/</g, '\\u003c');
  const runtimePath = appendAssetVersion(
    joinPublicPath(profile.assetBasePath, 'public-site-runtime.js'),
    '',
    context.assetVersion
  );
  const injection = `  <script>window.TRICKCAL_PUBLIC_SITE_CONFIG=${config};</script>\n  <script src="${runtimePath}"></script>\n`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${injection}</head>`);
  return `${injection}${html}`;
}

function canonicalUrlForRoute(route, context, profileName) {
  const canonicalProfileName = route?.seo?.canonicalProfile || profileName;
  const profile = context.manifest.profiles[canonicalProfileName];
  const profileRoute = route?.profiles?.[canonicalProfileName];
  if (!profile || !profileRoute) {
    throw new PublicSiteError(`canonicalProfileの解決に失敗しました: ${route?.id || 'unknown'}`);
  }
  return `${profile.origin.replace(/\/$/, '')}${profileRoute.publicPath}`;
}

function updateCanonicalMetadata(html, entry, context) {
  const route = context.routeById.get(entry.routeId);
  if (!route?.indexable) return html;
  const canonicalUrl = canonicalUrlForRoute(route, context, entry.profile);
  const pageProfile = context.manifest.profiles[entry.profile];
  const pageRoute = route.profiles?.[entry.profile];
  if (!pageProfile || !pageRoute) {
    throw new PublicSiteError(`ページprofileのURL解決に失敗しました: ${route.id}:${entry.profile}`);
  }
  const pageUrl = `${pageProfile.origin.replace(/\/$/, '')}${pageRoute.publicPath}`;
  let result = html;
  let canonicalCount = 0;
  result = result.replace(/<link\b[^>]*>/gi, tag => {
    if (!/\brel=["'][^"']*\bcanonical\b[^"']*["']/i.test(tag)) return tag;
    canonicalCount += 1;
    if (/\bhref=["']/i.test(tag)) return tag.replace(/(\bhref=["'])[^"']*/i, `$1${canonicalUrl}`);
    return tag.replace(/>$/, ` href="${canonicalUrl}">`);
  });
  if (canonicalCount > 1) {
    throw new PublicSiteError(`canonicalが重複しています: ${route.id}:${entry.profile}`);
  }
  let ogFound = false;
  result = result.replace(/(<meta\b[^>]*\bproperty=["']og:url["'][^>]*\bcontent=["'])[^"']*/i, (_match, prefix) => {
    ogFound = true;
    return `${prefix}${pageUrl}`;
  });
  const sourceUrl = route.source
    ? `${context.manifest.profiles.legacy.origin.replace(/\/$/, '')}/trickcal-manager/${route.source}`
    : '';
  if (sourceUrl) result = result.replaceAll(sourceUrl, pageUrl);
  const additions = [];
  if (canonicalCount === 0) additions.push(`<link rel="canonical" href="${canonicalUrl}">`);
  if (!ogFound) additions.push(`<meta property="og:url" content="${pageUrl}">`);
  if (additions.length) result = result.replace(/<\/head>/i, `  ${additions.join('\n  ')}\n</head>`);
  return result;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function renderSitemap(context, profileName) {
  const urls = context.manifest.routes
    .filter(route => route.indexable === true)
    .map(route => canonicalUrlForRoute(route, context, profileName));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(url => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
}

function renderRobots(context, profileName) {
  const profile = context.manifest.profiles[profileName];
  const sitemapPath = joinPublicPath(profile.assetBasePath, 'sitemap.xml');
  return `User-agent: *\nAllow: /\n\nSitemap: ${profile.origin.replace(/\/$/, '')}${sitemapPath}\n`;
}

function injectIndexAliasNormalization(html, entry, context) {
  const route = context.routeById.get(entry.routeId);
  const routeProfile = route?.profiles?.[entry.profile];
  const indexAliases = (routeProfile?.aliases || [])
    .filter(alias => isIndexAlias(routeProfile.publicPath, alias));
  if (!indexAliases.length) return html;
  const aliases = JSON.stringify(indexAliases);
  const target = JSON.stringify(routeProfile.publicPath);
  const injection = `  <script>(() => { const indexAliases = ${aliases}; if (indexAliases.includes(location.pathname)) location.replace(${target} + (location.search || '') + (location.hash || '')); })();</script>\n`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${injection}</head>`);
  return `${injection}${html}`;
}

function transformHtml(html, entry, context) {
  let result = html.replace(/<([a-z][^>]*?)>/gi, tag => tag.replace(/\b(src|href|poster)=(['"])(.*?)\2/gi, (match, attribute, quote, value) => {
    const resolved = resolveHtmlReference(value, entry, context);
    return `${attribute}=${quote}${resolved}${quote}`;
  }));
  result = updateCanonicalMetadata(result, entry, context);
  result = injectIndexAliasNormalization(result, entry, context);
  return injectRuntimeConfig(result, context, entry.profile);
}

function profileReleaseId(previousRelease, profileName) {
  return previousRelease?.profiles?.find(profile => profile.profile === profileName)?.releaseId
    || previousRelease?.releaseId
    || '';
}

function replaceServiceWorkerConstant(source, constantName, value) {
  const pattern = new RegExp(`(^\\s*const ${constantName} = )[^;]+;`, 'm');
  if (!pattern.test(source)) throw new PublicSiteError(`Service Workerの${constantName}テンプレートがありません`);
  return source.replace(pattern, `$1${JSON.stringify(value)};`);
}

function replaceServiceWorkerConstantIfPresent(source, constantName, value) {
  const pattern = new RegExp(`(^\\s*const ${constantName} = )[^;]+;`, 'm');
  return pattern.test(source) ? source.replace(pattern, `$1${JSON.stringify(value)};`) : source;
}

function versionedImagePathsForProfile(context, profileName) {
  return context.plan.entries
    .filter(entry => entry.type === 'asset'
      && entry.profile === profileName
      && VERSIONED_IMAGE_EXTENSION.test(entry.source))
    .map(entry => encodePublicAssetPath(`/${entry.outputRel}`.replace(/\/+/g, '/')))
    .sort();
}

function renderServiceWorker(entry, context) {
  let source = fs.readFileSync(path.resolve(context.repoRoot, entry.source), 'utf8');
  source = replaceServiceWorkerConstant(source, 'CACHE_VERSION', context.releaseId);
  source = replaceServiceWorkerConstant(source, 'PREVIOUS_CACHE_VERSION', profileReleaseId(context.previousRelease, entry.profile));
  source = replaceServiceWorkerConstantIfPresent(source, 'EXPECTED_ASSET_VERSION', context.assetVersion);
  source = replaceServiceWorkerConstantIfPresent(source, 'VERSIONED_IMAGE_PATHS', versionedImagePathsForProfile(context, entry.profile));
  return Buffer.from(source);
}

function injectAnnouncementHistoryData(html, profileName, context) {
  const profile = context.manifest.profiles[profileName];
  const controllerPath = appendAssetVersion(
    joinPublicPath(profile.assetBasePath, 'announcements.js'),
    '',
    context.assetVersion
  );
  const historyPath = appendAssetVersion(
    joinPublicPath(profile.assetBasePath, 'announcement-history-data.js'),
    '',
    context.assetVersion
  );
  const controllerTag = `<script src="${escapeHtml(controllerPath)}"></script>`;
  if (html.indexOf(controllerTag) < 0 || html.indexOf(controllerTag) !== html.lastIndexOf(controllerTag)) {
    throw new PublicSiteError('data indexのお知らせcontroller接続を一意に確認できません');
  }
  const historyTag = `<script src="${escapeHtml(historyPath)}"></script>`;
  return html.replace(controllerTag, `${historyTag}\n  ${controllerTag}`);
}

function injectDataIndexStorageBootstrap(html, profileName, context) {
  const profile = context.manifest.profiles[profileName];
  const scriptPath = asset => appendAssetVersion(
    joinPublicPath(profile.assetBasePath, asset),
    '',
    context.assetVersion
  );
  const sharedTopbarTag = `<script src="${escapeHtml(scriptPath('shared-topbar.js'))}"></script>`;
  if (html.indexOf(sharedTopbarTag) < 0 || html.indexOf(sharedTopbarTag) !== html.lastIndexOf(sharedTopbarTag)) {
    throw new PublicSiteError('data indexの共通上バー接続を一意に確認できません');
  }
  const storageScripts = ['storage-registry.js', 'storage-runtime.js', 'storage-bootstrap.js']
    .map(asset => `<script src="${escapeHtml(scriptPath(asset))}"></script>`)
    .join('\n  ');
  const optionalRoot = '<html lang="ja" data-storage-boot-mode="optional">';
  const rootCount = html.split('<html lang="ja">').length - 1;
  if (rootCount !== 1) throw new PublicSiteError('data indexのoptional storage rootを一意に確認できません');
  return html
    .replace('<html lang="ja">', optionalRoot)
    .replace(sharedTopbarTag, `${storageScripts}\n  ${sharedTopbarTag}`);
}

function renderEntry(entry, context) {
  if (entry.type === 'asset') {
    if (entry.source === context.manifest.serviceWorker.source) return renderServiceWorker(entry, context);
    if (entry.source === 'sitemap.xml') return Buffer.from(renderSitemap(context, entry.profile));
    if (entry.source === 'robots.txt') return Buffer.from(renderRobots(context, entry.profile));
    return fs.readFileSync(path.resolve(context.repoRoot, entry.source));
  }
  if (entry.type === 'alias') return Buffer.from(createRedirectHtml(entry.targetPath, `${entry.routeId} compatibility`));
  if (entry.generator === 'home-entry') return Buffer.from(createRedirectHtml(entry.targetPath, 'Trickcal Manager'));
  if (entry.generator === 'data-index') {
    const sourceHtml = injectDataIndexStorageBootstrap(
      stripDataIndexPageRow(createDataIndexHtml(context.plan, entry.profile, context)),
      entry.profile,
      context
    );
    const html = transformHtml(sourceHtml, entry, context);
    return Buffer.from(injectAnnouncementHistoryData(html, entry.profile, context));
  }
  const source = fs.readFileSync(path.resolve(context.repoRoot, entry.source), 'utf8');
  return Buffer.from(entry.outputRel.endsWith('.html') ? transformHtml(source, entry, context) : source);
}

function calculateRouteVersions(plan, renderedEntries) {
  const result = {};
  for (const profileName of PROFILE_NAMES) {
    const records = renderedEntries
      .filter(({ entry }) => entry.profile === profileName && entry.type === 'route' && entry.role === 'canonical')
      .map(({ entry, content }) => ({ path: entry.outputRel, sha256: digestBuffer(content) }));
    result[profileName] = hashText(JSON.stringify(records));
  }
  return result;
}

function profileDigest(plan, renderedEntries, profileName) {
  const records = renderedEntries
    .filter(({ entry }) => entry.profile === profileName)
    .map(({ entry, content }) => ({ path: entry.outputRel, sha256: digestBuffer(content) }));
  return hashText(JSON.stringify(records));
}

function getSourceCommit(repoRoot) {
  let gitDirectory = path.join(repoRoot, '.git');
  try {
    if (fs.statSync(gitDirectory).isFile()) {
      const pointer = fs.readFileSync(gitDirectory, 'utf8').trim().match(/^gitdir:\s*(.+)$/i);
      if (pointer) gitDirectory = path.resolve(repoRoot, pointer[1]);
    }
    const head = fs.readFileSync(path.join(gitDirectory, 'HEAD'), 'utf8').trim();
    if (/^[0-9a-f]{40}$/i.test(head)) return head;
    const match = head.match(/^ref:\s+(.+)$/);
    if (match) {
      const refPath = path.join(gitDirectory, ...match[1].split('/'));
      if (fs.existsSync(refPath)) {
        const commit = fs.readFileSync(refPath, 'utf8').trim();
        if (/^[0-9a-f]{40}$/i.test(commit)) return commit;
      }
      const commonDirPath = path.join(gitDirectory, 'commondir');
      if (fs.existsSync(commonDirPath)) {
        const commonDirectory = path.resolve(gitDirectory, fs.readFileSync(commonDirPath, 'utf8').trim());
        const commonRefPath = path.join(commonDirectory, ...match[1].split('/'));
        if (fs.existsSync(commonRefPath)) {
          const commit = fs.readFileSync(commonRefPath, 'utf8').trim();
          if (/^[0-9a-f]{40}$/i.test(commit)) return commit;
        }
      }
      const packedRefsPath = path.join(gitDirectory, 'packed-refs');
      if (fs.existsSync(packedRefsPath)) {
        const packed = fs.readFileSync(packedRefsPath, 'utf8').split(/\r?\n/);
        const packedLine = packed.find(line => line.endsWith(` ${match[1]}`));
        const commit = packedLine?.split(' ')[0] || '';
        if (/^[0-9a-f]{40}$/i.test(commit)) return commit;
      }
    }
  } catch (_) {
    // The fallback below is useful for non-git source copies.
  }
  try {
    return execFileSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() || 'unknown';
  } catch (_) {
    return 'unknown';
  }
}

function isWorkingTreeDirty(repoRoot) {
  try {
    return !!execFileSync('git', ['-C', repoRoot, 'status', '--porcelain', '--untracked-files=all'], { encoding: 'utf8' }).trim();
  } catch (_) {
    const gitState = readGitState(repoRoot);
    return gitState.available ? gitState.dirty : fs.existsSync(path.join(repoRoot, '.git'));
  }
}

function isUsableReleaseRecord(record) {
  if (!isRecord(record)
    || record.schemaVersion !== 1
    || !/^[0-9a-f]{16}$/.test(record.releaseId || '')
    || !/^[0-9a-f]{64}$/.test(record.contentDigest || '')) return false;
  const profiles = Array.isArray(record.profiles) ? record.profiles : [];
  return PROFILE_NAMES.every(profileName => {
    const profile = profiles.find(item => item?.profile === profileName);
    const releaseId = profile?.releaseId || record.releaseId;
    return !!profile
      && releaseId === record.releaseId
      && /^[0-9a-f]{16}$/.test(profile.outputDigest || '')
      && profile.serviceWorker?.cacheVersion === releaseId
      && (!profile.serviceWorker?.contentHash || /^[0-9a-f]{64}$/.test(profile.serviceWorker.contentHash));
  });
}

function summarizeReleaseRecord(record) {
  if (!isUsableReleaseRecord(record)) return null;
  return {
    schemaVersion: 1,
    status: record.status,
    releaseId: record.releaseId,
    sourceCommit: record.sourceCommit,
    dirty: record.dirty === true,
    contentDigest: record.contentDigest,
    profiles: PROFILE_NAMES.map(profileName => {
      const profile = record.profiles.find(item => item.profile === profileName);
      return {
        profile: profileName,
        releaseId: profile.releaseId || record.releaseId,
        routeVersion: profile.routeVersion,
        assetVersion: profile.assetVersion,
        assetsDigest: profile.assetsDigest,
        outputDigest: profile.outputDigest,
        serviceWorker: profile.serviceWorker ? {
          cacheVersion: profile.serviceWorker.cacheVersion,
          previousCacheVersion: profile.serviceWorker.previousCacheVersion || null,
          contentHash: profile.serviceWorker.contentHash || ''
        } : null
      };
    })
  };
}

function readReleaseRecord(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

function normalizePreviousRelease(value, { explicit = false } = {}) {
  if (value == null) return null;
  const summary = summarizeReleaseRecord(value);
  if (!summary && explicit) throw new PublicSiteError('previous release recordが不正です');
  return summary;
}

function resolvePreviousRelease(outputDir, releaseId, options) {
  if (hasOwn(options, 'previousReleasePath')) {
    const record = readReleaseRecord(path.resolve(options.previousReleasePath));
    if (!record) throw new PublicSiteError(`previous release recordを読めません: ${options.previousReleasePath}`);
    return normalizePreviousRelease(record, { explicit: true });
  }
  if (hasOwn(options, 'previousRelease')) return normalizePreviousRelease(options.previousRelease, { explicit: true });

  const current = readReleaseRecord(path.join(path.resolve(outputDir), 'public-site-release.json'));
  const currentSummary = normalizePreviousRelease(current);
  if (!currentSummary) return null;
  if (currentSummary.releaseId === releaseId) return normalizePreviousRelease(current.previousRelease);
  return currentSummary;
}

function findRenderedServiceWorker(renderedEntries, manifest, profileName) {
  return renderedEntries.find(({ entry }) => entry.profile === profileName
    && entry.type === 'asset'
    && entry.source === manifest.serviceWorker.source)?.content || Buffer.alloc(0);
}

function generatePublicSite(manifest, options = {}) {
  const {
    repoRoot = ROOT,
    outputDir = DEFAULT_OUTPUT_DIR,
    write = true
  } = options;
  const plan = buildPlan(manifest, { repoRoot, outputDir });
  if (!write) return summarizePlan(plan);
  const inputContext = createBuildContext(manifest, plan, repoRoot);
  const previousRelease = resolvePreviousRelease(outputDir, inputContext.releaseId, options);
  const context = createBuildContext(manifest, plan, repoRoot, { previousRelease });
  const renderedEntries = plan.entries.map(entry => ({ entry, content: renderEntry(entry, context) }));
  const routeVersions = calculateRouteVersions(plan, renderedEntries);
  const targetDir = path.resolve(outputDir);
  safeResolve(path.join(repoRoot, 'tmp'), path.relative(path.join(repoRoot, 'tmp'), targetDir));
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(targetDir, { recursive: true });

  for (const { entry, content } of renderedEntries) {
    const destination = safeResolve(targetDir, entry.outputRel);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content);
  }

  const contentDigest = directoryDigest(targetDir);
  const sourceCommit = getSourceCommit(repoRoot);
  const dirty = isWorkingTreeDirty(repoRoot);
  const dependencyOrder = [
    'profile-layout',
    'direct-assets',
    'share-page',
    'share-create',
    'app-cache',
    'final-html',
    'release-record'
  ];
  const releaseRecord = {
    schemaVersion: 1,
    status: 'local-only-unpublished',
    releaseInputVersion: RELEASE_INPUT_VERSION,
    releaseId: context.releaseId,
    releaseInputDigest: context.releaseInputDigest,
    sourceCommit,
    dirty,
    assetPolicy: manifest.assetConfig.policy,
    dependencyOrder,
    contentDigest,
    previousRelease,
    sourceVersions: context.sourceVersions,
    profiles: PROFILE_NAMES.map(profileName => ({
      profile: profileName,
      origin: manifest.profiles[profileName].origin,
      basePath: manifest.profiles[profileName].basePath,
      releaseId: context.releaseId,
      routeVersion: routeVersions[profileName],
      assetVersion: context.assetVersion,
      assetsDigest: context.assetsDigest,
      serviceWorker: {
        script: manifest.profiles[profileName].serviceWorker.script,
        scope: manifest.profiles[profileName].serviceWorker.scope,
        output: outputRelativePath(joinPublicPath(manifest.profiles[profileName].assetBasePath, manifest.profiles[profileName].serviceWorker.script)),
        cacheVersion: context.releaseId,
        previousCacheVersion: profileReleaseId(previousRelease, profileName) || null,
        contentHash: digestBuffer(findRenderedServiceWorker(renderedEntries, manifest, profileName))
      },
      outputDigest: profileDigest(plan, renderedEntries, profileName)
    })),
    assets: context.assetRecords
  };

  const buildRecord = {
    schemaVersion: 1,
    manifestSchemaVersion: manifest.schemaVersion,
    releaseInputVersion: RELEASE_INPUT_VERSION,
    assetPolicy: manifest.assetConfig.policy,
    assetVersion: context.assetVersion,
    assetsDigest: context.assetsDigest,
    releaseId: context.releaseId,
    previousRelease,
    routeVersions,
    dependencyOrder,
    profiles: plan.profiles.map(profile => ({
      name: profile.name,
      origin: profile.origin,
      basePath: profile.basePath,
      assetBasePath: profile.assetBasePath,
      serviceWorker: profile.serviceWorker
    })),
    routes: plan.entries
      .filter(entry => entry.type === 'route' || entry.type === 'alias')
      .map(entry => ({
        profile: entry.profile,
        routeId: entry.routeId,
        role: entry.role,
        kind: entry.kind,
        publicPath: entry.publicPath,
        output: entry.outputRel,
        targetPath: entry.targetPath || ''
      })),
    fixtures: plan.fixtures,
    files: plan.entries.map(entry => ({ profile: entry.profile, output: entry.outputRel, type: entry.type }))
  };
  fs.writeFileSync(path.join(targetDir, 'public-site-build.json'), `${JSON.stringify(buildRecord, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(targetDir, 'public-site-release.json'), `${JSON.stringify(releaseRecord, null, 2)}\n`, 'utf8');
  return {
    ...summarizePlan(plan),
    outputDir: targetDir,
    outputDigest: directoryDigest(targetDir, { exclude: ['public-site-build.json', 'public-site-release.json'] }),
    assetVersion: context.assetVersion,
    assetsDigest: context.assetsDigest,
    releaseId: context.releaseId,
    previousRelease,
    routeVersions,
    sourceCommit,
    dirty
  };
}

function summarizePlan(plan) {
  return {
    outputDir: plan.outputDir,
    fileCount: plan.entries.length + 2,
    routeCount: plan.entries.filter(entry => entry.type === 'route').length,
    aliasCount: plan.entries.filter(entry => entry.type === 'alias').length,
    assetCount: plan.entries.filter(entry => entry.type === 'asset').length,
    fixtures: plan.fixtures,
    entries: plan.entries
  };
}

function createRedirectHtml(targetPath, title) {
  const target = escapeHtml(targetPath || '/');
  const scriptTarget = JSON.stringify(targetPath || '/');
  return `<!doctype html>\n<html lang="ja">\n<head>\n  <meta charset="utf-8">\n  <meta name="robots" content="noindex,nofollow">\n  <title>${escapeHtml(title)}</title>\n  <script>(() => { const target = ${scriptTarget}; location.replace(target + (location.search || '') + (location.hash || '')); })();</script>\n</head>\n<body><noscript><p>JavaScriptを有効にしてから、次の入口を開いてください。</p><p><a href="${target}">Trickcal Managerを開く</a></p></noscript></body>\n</html>\n`;
}

function createDataIndexHtml(plan, profileName, context = null) {
  const profile = plan.profiles.find(item => item.name === profileName);
  const routeMap = new Map(plan.entries
    .filter(entry => entry.profile === profileName && entry.type === 'route' && entry.role === 'canonical')
    .map(entry => [entry.routeId, entry.publicPath]));
  const links = [
    ['manager', 'ステータス管理'],
    ['calc', '編成ダメージ計算'],
    ['share', '編成共有'],
    ['enemies', '敵データ'],
    ['board', 'ボードプレビュー'],
    ['dps', 'DPSプロトタイプ']
  ].filter(([id]) => routeMap.has(id)).map(([id, label]) => `<li><a href="${escapeHtml(routeMap.get(id))}">${escapeHtml(label)}</a></li>`).join('\n    ');
  const cssPath = appendAssetVersion(
    joinPublicPath(profile.assetBasePath, 'shared-topbar.css'),
    '',
    context?.assetVersion || ''
  );
  const scriptPath = asset => appendAssetVersion(
    joinPublicPath(profile.assetBasePath, asset),
    '',
    context?.assetVersion || ''
  );
  const managerHref = routeMap.get('manager') || '/';
  const calcHref = routeMap.get('calc') || '/';
  const enemyHref = routeMap.get('enemies') || '#';
  const boardHref = routeMap.get('board') || '#';
  return `<!doctype html>\n<html lang="ja">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="robots" content="index,follow">\n  <title>Trickcal Manager データ</title>\n  <link rel="stylesheet" href="${escapeHtml(cssPath)}">\n  <link rel="stylesheet" href="${escapeHtml(scriptPath('announcements.css'))}">\n  <style>body{margin:0;min-width:320px;--fdc-bg:#f3f8ed;--fdc-panel:rgba(255,255,255,.9);--fdc-text:#233629;--fdc-muted:#63725f;--fdc-border:rgba(75,125,67,.18);--fdc-primary:#4e9d4f;--fdc-primary-soft:rgba(112,189,91,.18);--fdc-shadow:rgba(75,125,67,.16);background:var(--fdc-bg);color:var(--fdc-text);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}.public-data-page.theme-dark{--fdc-bg:#0b1020;--fdc-panel:rgba(19,29,52,.92);--fdc-text:#f6f8ff;--fdc-muted:#aeb9d1;--fdc-border:rgba(180,207,255,.16);--fdc-primary:#7aa2ff;--fdc-primary-soft:rgba(122,162,255,.18);--fdc-shadow:rgba(0,0,0,.36)}.public-data-page{padding-top:var(--trickcal-top-occupied-height,3.25rem)}.data-index-shell{max-width:48rem;margin:1rem auto 3rem;padding:1rem}.data-index-shell a{color:var(--fdc-primary);font-weight:700}.data-index-shell li{margin:.75rem 0}</style>\n</head>\n<body class="dashboard-page public-data-page" data-theme="light">\n  <section class="dashboard-top-control-bar" data-shared-topbar-page="data" data-shared-topbar-manager-href="${escapeHtml(managerHref)}" data-shared-topbar-calc-href="${escapeHtml(calcHref)}" data-shared-topbar-data-href="./" aria-label="共通操作">\n    <div class="topbar-common-row" data-shared-topbar-common></div>\n    <div class="topbar-page-row">\n      <div class="dashboard-top-status"><h1>データ</h1><span>敵・ボードの閲覧入口</span></div>\n      <nav class="dashboard-top-tabs" aria-label="データ操作">\n        <a href="${escapeHtml(enemyHref)}">敵</a>\n        <a href="${escapeHtml(boardHref)}">ボード</a>\n      </nav>\n      <div class="dashboard-top-actions"></div>\n    </div>\n  </section>\n  <main class="data-index-shell">\n    <p>TRICKCAL MANAGER</p>\n    <h2>データ・補助画面</h2>\n    <p>保存状態を変更しない閲覧用の入口です。</p>\n    <ul>\n    ${links}\n    </ul>\n  </main>\n  <script src="${escapeHtml(scriptPath('shared-topbar.js'))}"></script>\n  <script src="${escapeHtml(scriptPath('announcements-release-config.js'))}"></script>\n  <script src="${escapeHtml(scriptPath('announcements-data.js'))}"></script>\n  <script src="${escapeHtml(scriptPath('announcements.js'))}"></script>\n</body>\n</html>\n`;
}

function stripDataIndexPageRow(html) {
  const start = html.indexOf('\n    <div class="topbar-page-row">');
  const closing = '\n    </div>';
  const end = start >= 0 ? html.indexOf(`${closing}\n  </section>`, start) : -1;
  if (start < 0 || end < 0) return html;
  return `${html.slice(0, start)}${html.slice(end + closing.length)}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function digestBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function directoryDigest(directory, { exclude = [] } = {}) {
  const hash = crypto.createHash('sha256');
  const excluded = new Set(exclude);
  for (const relativeFile of listFiles(directory).filter(file => !excluded.has(file))) {
    hash.update(relativeFile);
    hash.update('\0');
    hash.update(fs.readFileSync(path.join(directory, relativeFile)));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function compareDirectories(left, right) {
  if (!fs.existsSync(left) || !fs.existsSync(right)) return { ok: false, reason: 'output directory is missing' };
  const leftFiles = listFiles(left);
  const rightFiles = listFiles(right);
  if (leftFiles.length !== rightFiles.length || leftFiles.some((file, index) => file !== rightFiles[index])) {
    return { ok: false, reason: 'file list differs' };
  }
  for (const relativeFile of leftFiles) {
    const leftDigest = digestBuffer(fs.readFileSync(path.join(left, relativeFile)));
    const rightDigest = digestBuffer(fs.readFileSync(path.join(right, relativeFile)));
    if (leftDigest !== rightDigest) return { ok: false, reason: `file differs: ${relativeFile}` };
  }
  return { ok: true };
}

function checkPublicSite(manifest, { repoRoot = ROOT, outputDir = DEFAULT_OUTPUT_DIR } = {}) {
  const targetDir = path.resolve(outputDir);
  const validation = validateManifest(manifest, { repoRoot });
  if (!validation.ok) throw new PublicSiteError(validation.errors.join('\n'), validation.errors);
  if (!fs.existsSync(targetDir)) throw new PublicSiteError(`生成済みサイトがありません: ${targetDir}`);
  const checkDir = path.join(path.dirname(targetDir), `.${path.basename(targetDir)}-check`);
  fs.rmSync(checkDir, { recursive: true, force: true });
  try {
    const targetRelease = readReleaseRecord(path.join(targetDir, 'public-site-release.json'));
    const previousRelease = isUsableReleaseRecord(targetRelease) ? targetRelease.previousRelease || null : null;
    generatePublicSite(manifest, { repoRoot, outputDir: checkDir, write: true, previousRelease });
    const comparison = compareDirectories(targetDir, checkDir);
    if (!comparison.ok) throw new PublicSiteError(`生成安定性checkに失敗しました: ${comparison.reason}`);
    return {
      ok: true,
      outputDir: targetDir,
      outputDigest: directoryDigest(targetDir, { exclude: ['public-site-build.json', 'public-site-release.json'] })
    };
  } finally {
    fs.rmSync(checkDir, { recursive: true, force: true });
  }
}

function parseCliArgs(argv) {
  const options = { mode: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--write' || arg === '--check') options.mode = arg.slice(2);
    else if (arg === '--manifest') options.manifestPath = argv[++index];
    else if (arg === '--out') options.outputDir = argv[++index];
    else if (arg === '--previous-release') options.previousReleasePath = argv[++index];
    else throw new PublicSiteError(`未知の引数です: ${arg}`);
  }
  return options;
}

function main(argv = process.argv.slice(2)) {
  const options = parseCliArgs(argv);
  if (!options.mode) throw new PublicSiteError('--writeまたは--checkを指定してください');
  const manifestPath = path.resolve(options.manifestPath || DEFAULT_MANIFEST_PATH);
  const manifest = readManifest(manifestPath);
  const repoRoot = path.resolve(path.dirname(manifestPath), '..');
  const outputDir = path.resolve(options.outputDir || path.join(repoRoot, 'tmp', 'public-site'));
  if (options.mode === 'write') {
    const result = generatePublicSite(manifest, {
      repoRoot,
      outputDir,
      write: true,
      ...(options.previousReleasePath ? { previousReleasePath: options.previousReleasePath } : {})
    });
    console.log(`public site generated: ${result.outputDir} (${result.fileCount} files, digest ${result.outputDigest})`);
    return 0;
  }
  const result = checkPublicSite(manifest, { repoRoot, outputDir });
  console.log(`public site check passed: ${result.outputDir} (digest ${result.outputDigest})`);
  return 0;
}

if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
  }
}

module.exports = {
  DEFAULT_MANIFEST_PATH,
  DEFAULT_OUTPUT_DIR,
  PublicSiteError,
  buildPlan,
  checkPublicSite,
  directoryDigest,
  generatePublicSite,
  isUsableReleaseRecord,
  isIndexAlias,
  normalizePublicPath,
  outputRelativePath,
  readManifest,
  updateCanonicalMetadata,
  validateManifest
};
