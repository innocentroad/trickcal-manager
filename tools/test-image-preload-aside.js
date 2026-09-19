#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const preloadSource = fs.readFileSync(path.join(root, 'image-preload.js'), 'utf8');

function createFixture({ data: suppliedData, asideTiers = [], asideStatEffects = [], asideSpecialEffects = [], allowed = true, activeId = 'Epica', publicRelease = 'enabled' } = {}) {
  const values = new Map([
    ['trickcal_stat_prototype_v1', JSON.stringify({ activeId, formation: { rows: [], spells: [] } })],
    ['trickcal_formation_damage_settings_v1', JSON.stringify({ targetId: activeId })]
  ]);
  const data = suppliedData || {
    sheets: {
      basicInfo: [{ id: 'Epica' }, { id: 'ED' }],
      asideTiers,
      asideStatEffects,
      asideSpecialEffects
    }
  };
  const document = {
    readyState: 'loading',
    documentElement: { querySelectorAll: () => [] },
    querySelectorAll: () => [],
    addEventListener: () => {}
  };
  const window = {
    TRICKCAL_STAT_DATA: data,
    TRICKCAL_STORAGE_BOOT: { then(callback) { callback({ ok: true }); } },
    TRICKCAL_STORAGE_FACADE: {
      localStorage: { getItem: key => values.get(key) || null }
    },
    addEventListener: () => {},
    setTimeout: () => 0
  };
  if (publicRelease !== 'missing') {
    window.TRICKCAL_PUBLIC_RELEASE = { isAsideEnabled: () => allowed };
  }
  class FakeImage {}
  class FakeMutationObserver {
    observe() {}
  }
  class FakeHTMLImageElement {}
  const context = {
    window,
    document,
    TRICKCAL_STAT_DATA: data,
    Image: FakeImage,
    MutationObserver: FakeMutationObserver,
    HTMLImageElement: FakeHTMLImageElement,
    Node: { ELEMENT_NODE: 1 },
    console
  };
  vm.runInNewContext(preloadSource, context, { filename: 'image-preload.js' });
  return { data, window, preload: window.TRICKCAL_IMAGE_PRELOAD };
}

function asideUrls(urls) {
  return Array.from(urls).filter(url => url.includes('img/Chara/Aside/'));
}

function expectedAsideUrls(assetId) {
  return [
    `img/Chara/Aside/AsideIcon_${assetId}.webp`,
    `img/Chara/Aside/Aside_Skill_${assetId}_1.webp`,
    `img/Chara/Aside/Aside_Skill_${assetId}_2.webp`,
    `img/Chara/Aside/Aside_Skill_${assetId}_3.webp`
  ];
}

function assertAsideUrls(urls, assetId, message) {
  assert.deepEqual(asideUrls(urls).sort(), expectedAsideUrls(assetId).sort(), message);
}

{
  const fixture = createFixture({ asideTiers: [{ id: 'Epica' }] });
  const urls = fixture.preload.collectSavedImages();
  assert.deepEqual(asideUrls(urls), [], '等級だけの登録でアサイド画像を先読みしている');
  assert.ok(urls.includes('img/Chara/Epica.webp'), '通常使徒画像の先読みが失われている');
  assert.ok(urls.includes('img/Chara/Skill/Skill_P_Epica.webp'), '通常パッシブ画像の先読みが失われている');
  assert.ok(urls.includes('img/Chara/Skill/Skill_F_Epica.webp'), '通常低学年スキル画像の先読みが失われている');
  assert.ok(urls.includes('img/Chara/Skill/Skill_S_Epica.webp'), '通常高学年スキル画像の先読みが失われている');

  fixture.data.sheets.asideStatEffects.push({ id: 'Epica' });
  assertAsideUrls(fixture.preload.collectSavedImages(), 'Epica', '効果データ追加後の候補生成へ反映されていない');
}

{
  assertAsideUrls(
    createFixture({ asideSpecialEffects: [{ id: 'Epica' }] }).preload.collectSavedImages(),
    'Epica',
    '特殊効果だけの登録をアサイド登録として扱っていない'
  );
  assertAsideUrls(
    createFixture({ asideStatEffects: [{ id: 'Epica' }] }).preload.collectSavedImages(),
    'Epica',
    '通常効果だけの登録をアサイド登録として扱っていない'
  );
}

{
  const fixture = createFixture({ asideStatEffects: [{ id: 'Epica' }], publicRelease: 'missing' });
  assertAsideUrls(
    fixture.preload.collectSavedImages(),
    'Epica',
    '公開判定helperが未提供でも表示側と同じ既定動作で効果登録を反映していない'
  );
}

{
  const fixture = createFixture({ asideStatEffects: [{ id: 'Epica' }], allowed: false });
  assert.deepEqual(asideUrls(fixture.preload.collectSavedImages()), [], '公開制限中のアサイド画像を先読みしている');
  fixture.window.TRICKCAL_PUBLIC_RELEASE.isAsideEnabled = () => true;
  assertAsideUrls(fixture.preload.collectSavedImages(), 'Epica', '公開制限解除後の候補生成へ反映されていない');
}

{
  const fixture = createFixture({ activeId: 'ed', asideSpecialEffects: [{ id: 'ED' }] });
  const urls = fixture.preload.collectSavedImages();
  assert.ok(urls.includes('img/Chara/Ed.webp'), 'alias使徒の通常画像URLが解決されていない');
  assertAsideUrls(urls, 'Ed', 'alias使徒のアサイド画像URLが解決されていない');
}

console.log('Image preload aside registration tests passed');
