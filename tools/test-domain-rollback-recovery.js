'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const recoveryVersion = '20260912';

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const recovery = read('recover-20260912.html');
const storageRecovery = read('storage-recovery.html');
const serviceWorker = read('service-worker.js');
const appCache = read('app-cache.js');
const calcScript = read('formation-damage-calc.js');
const topbarScript = read('shared-topbar.js');
const index = read('index.html');
const manifest = JSON.parse(read('tools/public-route-manifest.json'));

assert(/const EXPECTED_CACHE_VERSION = '[^']+'/.test(recovery), '復旧ページのキャッシュ期待値がありません');
assert(recovery.includes("const RECOVERY_QUERY = '" + recoveryVersion + "'"), '専用復旧入口のリンク版が不一致');
assert(recovery.includes("url.searchParams.set('recover', RECOVERY_QUERY)"), '専用復旧入口の動的リンク版が不一致');
assert(!/\b(?:localStorage|sessionStorage|indexedDB|caches\.delete|Clear-Site-Data)\b/i.test(recovery), '復旧ページが保存領域または全キャッシュ削除へ触れている');
assert(!/<(?:script|link)[^>]+(?:src|href)=["']https?:/i.test(recovery), '復旧ページが外部資材へ依存している');
assert(recovery.includes("updateViaCache: 'none'"), '復旧ページのService Worker更新がHTTPキャッシュを迂回しない');
assert(recovery.includes("type: 'trickcal-recovery-clear-cache'"), '復旧ページのキャッシュ復旧メッセージがない');
assert(recovery.includes('stat-dashboard.html?recover=20260912'), '専用復旧入口の初期リンクが不一致');
assert(recovery.includes('formation-damage-calc.html?recover=20260912'), '専用復旧入口の計算リンクが不一致');
assert(fs.existsSync(path.join(root, 'recover-20260912.html')), '歴史的な専用復旧入口が削除されています');

assert(/const CACHE_VERSION = ["'][a-z0-9-]+["'];/i.test(serviceWorker), 'Service Workerのキャッシュ版がありません');
assert(serviceWorker.includes("message.type !== 'trickcal-recovery-clear-cache'"), 'Service Workerの復旧メッセージ処理がない');
assert((serviceWorker.match(/cache: 'reload'/g) || []).length >= 2, 'Service Workerのネットワーク取得がreloadになっていない');
assert(serviceWorker.includes('responseUrl.origin === self.location.origin'), '別Originの応答をキャッシュしない検査がない');
assert(serviceWorker.includes("response.type !== 'basic'"), 'opaqueな応答をキャッシュしない検査がない');

assert(appCache.includes("updateViaCache: 'none'"), '通常ページのService Worker更新がHTTPキャッシュを迂回しない');
assert(appCache.includes("cache: 'reload'"), '先読みがHTTPキャッシュを再利用している');
assert(read('formation-damage-calc.html').includes('formation-damage-calc.js?v=20260912a'), '計算スクリプトの版参照が不一致');
assert(!appCache.includes('recover=20260912'), '通常の先読みへ復旧クエリが混入しています');

assert(index.includes("location.replace('stat-dashboard.html' + location.search + (location.hash || ''))"), '入口が既存query/hashをそのまま保持しません');
assert(!index.includes("params.set('recover'"), 'indexが通常遷移へ復旧queryを追加しています');
assert(!index.includes('stat-dashboard.html?recover=20260912'), 'indexの通常遷移へ固定復旧queryが残っています');
assert(calcScript.includes("url.searchParams.set('preset', key)"), '敵プリセットの引き継ぎがありません');
assert(calcScript.includes("url.searchParams.set('phase', String(view.enemyPhaseIndex))"), '敵phaseの引き継ぎがありません');
assert(!/searchParams\.set\(['"]recover['"]/.test(calcScript), '敵データへの通常遷移が復旧queryを追加しています');
assert(topbarScript.includes('function stripLegacyRecoveryQuery(href)'), '上バーに旧固定query除去処理がありません');
assert(!topbarScript.includes("recover: '20260912'"), '上バー操作定義が通常遷移へ復旧queryを付与しています');

const ordinaryHtmlPages = [
  'stat-dashboard.html',
  'formation-damage-calc.html',
  'formation-damage-dps-prototype.html',
  'formation-share.html',
  'enemy-status.html',
  'public/apostle-data.html',
  'public/board-layout-preview.html'
];
ordinaryHtmlPages.forEach(file => {
  assert(!/recover=20260912/.test(read(file)), file + 'の通常リンク／prefetch／route属性に固定復旧queryが残っています');
});

const routeFixtures = manifest.routes.flatMap(route => route.fixtures || []);
assert(routeFixtures.length > 0, '公開route fixtureがありません');
routeFixtures.forEach(fixture => {
  assert(!new URLSearchParams(String(fixture.query || '').replace(/^\?/, '')).getAll('recover').includes(recoveryVersion), `${fixture.name}へ復旧queryが設定されています`);
});
const routeById = new Map(manifest.routes.map(route => [route.id, route]));
const storageRecoveryRoute = routeById.get('recovery');
assert(storageRecoveryRoute?.source === 'storage-recovery.html', '現行storage recovery routeが維持されていません');
assert(storageRecovery.includes('id="recovery-run"') && storageRecovery.includes('id="recovery-export-rescue"'), '現行storage recoveryの救出・復旧操作が見つかりません');
assert(storageRecoveryRoute.profiles.new.publicPath === '/recovery/', '現行new storage recovery pathが変化しています');
assert(storageRecoveryRoute.profiles.legacy.publicPath === '/trickcal-manager/storage-recovery.html', '現行legacy storage recovery pathが変化しています');
assert(!manifest.routes.some(route => route.source === 'recover-20260912.html'), '歴史的な専用復旧入口を公開routeへ追加しています');
assert(!manifest.routes.some(route => route.source === 'formation-dps-calc.html'), '公開route外の旧DPS試作ページを対象へ誤追加しています');
for (const [id, expectedNew, expectedLegacy] of [
  ['manager', '/manager/', '/trickcal-manager/stat-dashboard.html'],
  ['calc', '/calc/', '/trickcal-manager/formation-damage-calc.html'],
  ['dps', '/calc/dps/', '/trickcal-manager/formation-damage-dps-prototype.html'],
  ['enemies', '/data/enemies/', '/trickcal-manager/enemy-status.html']
]) {
  const route = routeById.get(id);
  assert(route?.profiles?.new?.publicPath === expectedNew, `${id} new routeが変化しています`);
  assert(route?.profiles?.legacy?.publicPath === expectedLegacy, `${id} legacy routeが変化しています`);
}

console.log('domain rollback recovery tests passed');
