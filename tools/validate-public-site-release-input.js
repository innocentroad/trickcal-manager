#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { isUsableReleaseRecord } = require('./generate-public-site.js');

const RELEASE_MODE_NAMES = ['initial', 'update'];
const PUBLISHED_RELEASE_STATUS = 'published';

function compactReleaseRecord(record) {
  return {
    schemaVersion: 1,
    status: record.status,
    releaseId: record.releaseId,
    sourceCommit: record.sourceCommit,
    dirty: false,
    contentDigest: record.contentDigest,
    profiles: record.profiles.map(profile => ({
      profile: profile.profile,
      releaseId: profile.releaseId || record.releaseId,
      outputDigest: profile.outputDigest,
      serviceWorker: {
        cacheVersion: profile.serviceWorker.cacheVersion,
        previousCacheVersion: profile.serviceWorker.previousCacheVersion || null,
        contentHash: profile.serviceWorker.contentHash || ''
      }
    }))
  };
}

function validatePreviousReleaseRecord(record, expectedReleaseId = '') {
  const errors = [];
  if (!isUsableReleaseRecord(record)) {
    errors.push('previous release recordがU1以降の整合形ではありません');
  }
  if (record?.status !== PUBLISHED_RELEASE_STATUS) {
    errors.push('previous release recordが成功配信済み(status=published)ではありません');
  }
  if (record?.dirty !== false) {
    errors.push('previous release recordがclean(dirty=false)ではありません');
  }
  if (!/^[0-9a-f]{40}$/i.test(record?.sourceCommit || '')) {
    errors.push('previous release recordのsourceCommitが40桁commitではありません');
  }
  if (!/^[0-9a-f]{16}$/.test(expectedReleaseId)) {
    errors.push('previous_release_idが16桁release IDではありません');
  } else if (record?.releaseId !== expectedReleaseId) {
    errors.push('previous_release_idとprevious release recordのreleaseIdが不一致です');
  }
  return { ok: errors.length === 0, errors };
}

function materializeReleaseInput({
  mode,
  previousReleaseJson = '',
  previousReleaseId = '',
  outputPath
}) {
  const errors = [];
  const normalizedMode = String(mode || '').trim();
  const rawJson = String(previousReleaseJson || '').trim();
  const expectedReleaseId = String(previousReleaseId || '').trim();

  if (!RELEASE_MODE_NAMES.includes(normalizedMode)) {
    errors.push(`release_modeは${RELEASE_MODE_NAMES.join('または')}で指定してください`);
  }
  if (!outputPath) errors.push('previous release recordの出力先がありません');
  if (errors.length) return { ok: false, errors };

  const resolvedOutputPath = path.resolve(outputPath);
  if (normalizedMode === 'initial') {
    if (rawJson) errors.push('初回releaseではprevious_release_jsonを指定できません');
    if (expectedReleaseId) errors.push('初回releaseではprevious_release_idを指定できません');
    if (fs.existsSync(resolvedOutputPath)) {
      errors.push(`初回releaseのprevious record出力先が既に存在します: ${resolvedOutputPath}`);
    }
    return errors.length
      ? { ok: false, errors }
      : { ok: true, mode: normalizedMode, previousReleasePath: null };
  }

  if (!expectedReleaseId) errors.push('更新releaseではprevious_release_idが必須です');
  if (!rawJson) errors.push('更新releaseではprevious_release_jsonが必須です');
  if (errors.length) return { ok: false, errors };

  let record;
  try {
    record = JSON.parse(rawJson);
  } catch (error) {
    errors.push(`previous_release_jsonがJSONではありません: ${error.message}`);
  }
  if (errors.length) return { ok: false, errors };

  const validation = validatePreviousReleaseRecord(record, expectedReleaseId);
  errors.push(...validation.errors);
  if (errors.length) return { ok: false, errors };

  const compact = compactReleaseRecord(record);
  fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
  fs.writeFileSync(resolvedOutputPath, `${JSON.stringify(compact, null, 2)}\n`, 'utf8');
  return {
    ok: true,
    mode: normalizedMode,
    previousReleasePath: resolvedOutputPath,
    releaseId: compact.releaseId
  };
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--mode') options.mode = argv[++index];
    else if (arg === '--out') options.outputPath = argv[++index];
    else if (arg === '--help') options.help = true;
    else throw new Error(`未知の引数です: ${arg}`);
  }
  return options;
}

function usage() {
  return [
    'usage: node tools/validate-public-site-release-input.js --mode initial|update --out FILE',
    '  PREVIOUS_RELEASE_ID  expected previous successful release ID (update only)',
    '  PREVIOUS_RELEASE_JSON previous successful release record JSON (update only)'
  ].join('\n');
}

function main(argv = process.argv.slice(2), env = process.env) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(usage());
    return 0;
  }
  const result = materializeReleaseInput({
    mode: options.mode,
    previousReleaseId: env.PREVIOUS_RELEASE_ID || '',
    previousReleaseJson: env.PREVIOUS_RELEASE_JSON || '',
    outputPath: options.outputPath
  });
  if (!result.ok) {
    console.error(result.errors.join('\n'));
    return 2;
  }
  console.log(result.mode === 'initial'
    ? 'public-site release input accepted: initial (no previous release)'
    : `public-site release input accepted: update (previous ${result.releaseId})`);
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
  PUBLISHED_RELEASE_STATUS,
  RELEASE_MODE_NAMES,
  compactReleaseRecord,
  main,
  materializeReleaseInput,
  validatePreviousReleaseRecord
};
