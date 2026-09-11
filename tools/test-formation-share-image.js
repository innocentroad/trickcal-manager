const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'formation-share-image.js'), 'utf8');
const create = fs.readFileSync(path.join(root, 'formation-share-create.js'), 'utf8');
const dashboard = fs.readFileSync(path.join(root, 'stat-dashboard.html'), 'utf8');
const dashboardCss = fs.readFileSync(path.join(root, 'stat-dashboard.css'), 'utf8');
const share = fs.readFileSync(path.join(root, 'formation-share.js'), 'utf8');
const shareCss = fs.readFileSync(path.join(root, 'formation-share-prototype.css'), 'utf8');
const sharePage = fs.readFileSync(path.join(root, 'formation-share.html'), 'utf8');
const sharePageActions = fs.readFileSync(path.join(root, 'formation-share-page-actions.js'), 'utf8');

assert.match(source, /TARGET_WIDTH = 1200/);
assert.match(source, /share-content/);
assert.match(source, /frameDocument\.fonts\?\.ready/);
assert.match(source, /image\.addEventListener\('error'/);
assert.match(source, /StaleFormationShareImageError/);
assert.match(source, /querySelector\('\.share-shell'\)/);
assert.match(source, /maxHeight/);
assert.match(source, /maxArea/);
assert.match(source, /canvas\.toBlob/);
assert.match(source, /createSvgDataUrl/);
assert.match(source, /maxSvgBytes/);
assert.match(source, /area\|base\|br\|col\|embed\|hr\|img/);
assert.match(source, /renderOptions\.theme/);
assert.match(source, /frameDocument\.documentElement\.dataset\.theme = renderOptions\.theme/);
assert.match(source, /_shareImageGeneration/);
assert.match(source, /file-url-unsupported/);
assert.match(source, /ローカルファイル（file:\/\/）では共有画像を作成できません/);
assert.match(create, /_sharePreview/);
assert.match(create, /getSharePreviewTheme/);
assert.match(create, /themeObserver/);
assert.match(create, /data-theme/);
assert.match(create, /file:\/\//);
assert.match(create, /ローカルファイル（file:\/\/）では共有画像を作成できません/);
assert.match(dashboard, /formation-share-create\.js\?v=20260912o/);
assert.match(dashboard, /formation-share-image\.js\?v=20260912j/);
assert.match(dashboard, /formation-share-image-preview/);
assert.match(dashboard, /formation-share-image-share/);
assert.match(dashboard, /formation-share-image-copy/);
assert.match(dashboard, /formation-share-image-save/);
assert.match(dashboard, /formation-share-image-actions/);
assert.match(dashboard, /formation-share-action-row/);
assert.match(dashboard, /formation-share-link-actions/);
assert.equal((dashboard.match(/id="formation-share-image-share"/g) || []).length, 1);
assert.match(dashboard, /id="formation-share-image-share"[^>]*hidden/);
assert.match(dashboard, /formation-share-preview/);
assert.match(dashboard, /formation-share-image-state/);
assert.match(dashboard, /画像をコピーまたは保存し、URLを同じ投稿へ貼り付けてください/);
assert.match(dashboardCss, /formation-share-preview-wrap iframe\[hidden\]/);
assert.match(dashboardCss, /#formation-share-image-preview\[hidden\]/);
assert.match(dashboardCss, /\.formation-share-action-row/);
assert.match(dashboardCss, /\.formation-share-link-actions/);
assert.match(dashboard, /stat-dashboard\.css\?v=20260912i/);
for (const className of [
  'formation-share-button-image-copy',
  'formation-share-button-image-save',
  'formation-share-button-url',
  'formation-share-button-close'
]) assert.match(dashboard, new RegExp(className));
assert.match(dashboardCss, /formation-share-button-image-copy/);
assert.match(dashboardCss, /formation-share-button-image-save/);
assert.match(dashboardCss, /formation-share-button-url/);
assert.match(dashboardCss, /formation-share-button-close/);
assert.match(dashboardCss, /@media \(max-width: 700px\)[\s\S]*?overflow-y: auto/);
assert.match(create, /SHARE_PAGE_CACHE_VERSION = '20260912d'/);
assert.match(create, /syncSharePreviewTheme\(getDashboardTheme\(\)\)/);
assert.match(create, /const shareUrl = new URL\(codec\.createUrl/);
assert.match(create, /shareUrl\.searchParams\.set\('v', SHARE_PAGE_CACHE_VERSION\)/);
assert.match(create, /navigator\.share\(shareData\)/);
assert.match(create, /files: \[file\]/);
assert.match(create, /navigator\.canShare\(shareData\)/);
assert.match(create, /error\?\.name === 'AbortError'/);
assert.match(create, /画像保存とURLコピーを利用してください/);
assert.match(create, /URL\.createObjectURL\(currentImageBlob\)/);
assert.match(create, /URL\.revokeObjectURL\(currentImageObjectUrl\)/);
assert.match(share, /GLOBAL_STAT_GROUPS/);
assert.doesNotMatch(share, /positionNotes/);
assert.doesNotMatch(share, /後衛グループ|中衛グループ|前衛グループ/);
assert.match(share, /formation-column-count/);
assert.match(share, /filled, '\/3">', filled, '\/3/);
assert.match(share, /label: '会心抵抗'/);
assert.match(share, /label: '会心DMG抵抗'/);
for (const label of ['HP', '攻撃', '防御', '会心', '会心抵抗']) assert.match(share, new RegExp(`label: '${label}'`));
assert.doesNotMatch(share, /label: 'DMG抵抗'/);
assert.match(shareCss, /\.support-card\.rarity-legendary \.support-card-media::after/);
assert.match(shareCss, /\.support-card\.rarity-unique \.support-card-media::after/);
assert.match(shareCss, /\.support-card\.rarity-rare \.support-card-media::after/);
assert.match(shareCss, /flex: 0 0 62px/);
assert.match(shareCss, /\.support-card-media \{[^\n]*width: 60px/);
assert.match(sharePage, /id="share-action-bar"/);
for (const id of ['share-image-generate', 'share-image-copy', 'share-image-save', 'share-url-copy']) {
  assert.match(sharePage, new RegExp(`id="${id}"`));
}
assert.match(sharePage, /formation-share-image\.js\?v=20260912j/);
assert.match(sharePage, /formation-share-page-actions\.js\?v=20260912a/);
assert.match(sharePage, /formation-share-prototype\.css\?v=20260912e/);
assert.match(sharePage, /formation-share\.js\?v=20260912c/);
assert.match(sharePageActions, /imageController\.render\(getPublicShareUrl\(\), \{ theme: getCurrentTheme\(\) \}\)/);
assert.match(sharePageActions, /navigator\.clipboard\.writeText/);
assert.match(sharePageActions, /navigator\.clipboard\.write/);
assert.match(sharePageActions, /link\.download = 'trickcal-formation\.png'/);

console.log('formation share image foundation checks passed');
