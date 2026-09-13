'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const recoveryVersion = '20260912';
const cacheVersion = '20260912-recovery-1';

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const recovery = read('recover-20260912.html');
const serviceWorker = read('service-worker.js');
const appCache = read('app-cache.js');
const calcScript = read('formation-damage-calc.js');

assert(recovery.includes("EXPECTED_CACHE_VERSION = '" + cacheVersion + "'"), '復旧ページの期待キャッシュ版が不一致');
assert(recovery.includes("const RECOVERY_QUERY = '" + recoveryVersion + "'"), '復旧ページのリンク版が不一致');
assert(recovery.includes("url.searchParams.set('recover', RECOVERY_QUERY)"), '復旧ページの動的リンク版が不一致');
assert(!/\b(?:localStorage|sessionStorage|indexedDB|caches\.delete|Clear-Site-Data)\b/i.test(recovery), '復旧ページが保存領域または全キャッシュ削除へ触れている');
assert(!/<(?:script|link)[^>]+(?:src|href)=["']https?:/i.test(recovery), '復旧ページが外部資材へ依存している');
assert(recovery.includes("updateViaCache: 'none'"), '復旧ページのService Worker更新がHTTPキャッシュを迂回しない');
assert(recovery.includes("type: 'trickcal-recovery-clear-cache'"), '復旧ページのキャッシュ復旧メッセージがない');
assert(recovery.includes('stat-dashboard.html?recover=20260912'), '復旧ページの初期リンクが不一致');
assert(recovery.includes('formation-damage-calc.html?recover=20260912'), '復旧ページの計算リンクが不一致');

assert(serviceWorker.includes("const CACHE_VERSION = '" + cacheVersion + "';"), 'Service Workerのキャッシュ版が不一致');
assert(serviceWorker.includes("message.type !== 'trickcal-recovery-clear-cache'"), 'Service Workerの復旧メッセージ処理がない');
assert((serviceWorker.match(/cache: 'reload'/g) || []).length >= 2, 'Service Workerのネットワーク取得がreloadになっていない');
assert(serviceWorker.includes('responseUrl.origin === self.location.origin'), '別Originの応答をキャッシュしない検査がない');
assert(serviceWorker.includes("response.type !== 'basic'"), 'opaqueな応答をキャッシュしない検査がない');

assert(appCache.includes("const RECOVERY_QUERY = 'recover=" + recoveryVersion + "';"), '先読みの復旧クエリが不一致');
assert(appCache.includes("updateViaCache: 'none'"), '通常ページのService Worker更新がHTTPキャッシュを迂回しない');
assert(appCache.includes("cache: 'reload'"), '先読みがHTTPキャッシュを再利用している');
assert(appCache.includes('formation-damage-calc.js?v=20260912a'), '先読みの計算スクリプト版が不一致');
assert(calcScript.includes("url.searchParams.set('recover', '20260912')"), '敵ステータス遷移に復旧クエリがない');

const pages = [
  'index.html',
  'stat-dashboard.html',
  'formation-damage-calc.html',
  'formation-damage-dps-prototype.html',
  'formation-dps-calc.html',
  'formation-share.html',
  'enemy-status.html'
];
pages.forEach(file => {
  const html = read(file);
  const internalLinks = [...html.matchAll(/href=\"([^\"]+)\"/g)]
    .map(match => match[1])
    .filter(href => /^(?:index|stat-dashboard|formation-damage-calc|formation-damage-dps-prototype|formation-dps-calc|formation-share|enemy-status)\.html(?:[?#]|$)/.test(href));
  internalLinks.forEach(href => {
    assert(href.includes('recover=' + recoveryVersion), file + 'の内部リンクに復旧クエリがない: ' + href);
  });
});

[
  'stat-dashboard.html',
  'formation-damage-calc.html',
  'formation-damage-dps-prototype.html',
  'formation-dps-calc.html'
].forEach(file => {
  assert(/app-cache\.js\?v=[A-Za-z0-9._-]+/.test(read(file)), file + 'のapp-cache版参照がない');
});

console.log('domain rollback recovery tests passed');
