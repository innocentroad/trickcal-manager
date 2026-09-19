(function () {
  'use strict';

  const storageBoot = window.TRICKCAL_STORAGE_BOOT || Promise.resolve({ ok: true });
  storageBoot.then(bootResult => {
    if (!bootResult?.ok) return;
    const storageFacade = window.TRICKCAL_STORAGE_FACADE;
    if (!storageFacade) return;
    const storageLocal = window.TRICKCAL_STORAGE_FACADE.localStorage;

  const STAT_STORAGE_KEY = 'trickcal_stat_prototype_v1';
  const CALC_SETTINGS_KEY = 'trickcal_formation_damage_settings_v1';
  const APOSTLE_ALIASES = {
    ED: 'Ed',
    Cuee: 'Kyuri',
    Kyui: 'Kyuri',
    Kyuui: 'Kyuri',
    Kiwi: 'Kyuri',
    Lazy: 'Layze',
    Razy: 'Layze',
    Reizy: 'Layze',
    Selline: 'Selene',
    Shady: 'Shaydi',
    Rudd: 'Rude',
    RenewaAwaken: 'Renewa',
    Sion: 'Xion',
    sion: 'Xion',
    xion: 'Xion',
    xXionx: 'Xion'
  };

  const BASE_COMMON_IMAGES = [
    'ico.webp',
    'img/Chara/null.webp',
    'img/Grade_on.webp',
    'img/Grade_on_1_2.webp',
    'img/Grade_off.webp',
    'img/学年_1.webp',
    'img/学年_2.webp',
    'img/フォロー.webp',
    'img/NormalAttack_Physic.webp',
    'img/NormalAttack_Magic.webp',
    'img/Attack_phys.webp',
    'img/Attack_mag.webp',
    'img/HP.webp',
    'img/物理攻撃力.webp',
    'img/魔法攻撃力.webp',
    'img/物理防御力.webp',
    'img/魔法防御力.webp',
    'img/会心.webp',
    'img/会心ダメージ.webp',
    'img/会心抵抗.webp',
    'img/会心DMG抵抗.webp',
    'img/Tab_Chara.webp',
    'img/Tab_Equip.webp',
    'img/Tab_Board.webp',
    'img/Tab_Skill.webp',
    'img/Tab_Aside.webp',
    'img/Tab_Save.png',
    'img/Card/cost.webp',
    'img/Card/ef_coin.webp',
    'img/Card/sunshine_token.webp',
    'img/Card/Card_Legendary.webp',
    'img/Card/Card_Signature.webp',
    'img/Card/Card_Unique.webp',
    'img/Card/Card_Rare.webp',
    'img/Card/Card_Grade_1.webp',
    'img/遺物bg_0.png',
    'img/遺物bg_1.png',
    'img/遺物bg_2.png',
    'img/遺物bg_3.png',
    'img/遺物bg_4.png',
    'img/使徒bg.png',
    'img/性格_なし.webp',
    'img/性格_純粋.webp',
    'img/性格_冷静.webp',
    'img/性格_狂気.webp',
    'img/性格_活発.webp',
    'img/性格_憂鬱.webp',
    'img/種族_妖精.webp',
    'img/種族_獣人.webp',
    'img/種族_エルフ.webp',
    'img/種族_精霊.webp',
    'img/種族_幽霊.webp',
    'img/種族_竜族.webp',
    'img/種族_魔女.webp',
    'img/種族_？？？.webp',
    'img/役割_防御.webp',
    'img/役割_攻撃.webp',
    'img/役割_支援.webp',
    'img/配置列_前列.webp',
    'img/配置列_中列.webp',
    'img/配置列_後列.webp'
  ];

  const STAT_DASHBOARD_IMAGES = [
    'img/Board/Tile_1_On.webp',
    'img/Board/Tile_1_Off.webp',
    'img/Board/Tile_2_On.webp',
    'img/Board/Tile_2_Off.webp',
    'img/Board/Tile_3_On.webp',
    'img/Board/Tile_3_Off.webp',
    'img/Board/Tile_Start_Right.webp',
    'img/Board/Tile_gate.webp',
    'img/Board/Tileicon_2.webp',
    'img/Board/Tileicon_3.webp'
  ];

  const preloadCache = [];
  const requestedUrls = new Set();
  const publicSite = window.TRICKCAL_PUBLIC_SITE;
  let canonicalApostleIdsByLower = null;

  function resolveAssetUrl(src) {
    return publicSite?.assetUrl?.(src) || src;
  }

  function disableImageInteraction(root) {
    const images = root instanceof HTMLImageElement
      ? [root]
      : Array.from(root?.querySelectorAll?.('img:not([data-allow-image-interaction])') || []);
    images.forEach(image => {
      image.draggable = false;
    });
  }

  disableImageInteraction(document);
  const imageInteractionObserver = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) disableImageInteraction(node);
      });
    });
  });
  imageInteractionObserver.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('contextmenu', event => {
    if (event.target?.closest?.('img:not([data-allow-image-interaction])')) event.preventDefault();
  }, { capture: true });

  function readJson(key) {
    try {
      return JSON.parse(storageLocal.getItem(key) || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function getCanonicalApostleId(id) {
    const sourceId = String(id || '').trim();
    if (!sourceId) return '';
    if (!canonicalApostleIdsByLower) {
      const basicInfo = typeof TRICKCAL_STAT_DATA === 'undefined'
        ? []
        : (TRICKCAL_STAT_DATA?.sheets?.basicInfo || []);
      if (!basicInfo.length) return '';
      canonicalApostleIdsByLower = new Map(
        basicInfo
        .map(row => String(row?.id || '').trim())
        .filter(Boolean)
        .map(canonicalId => [canonicalId.toLowerCase(), canonicalId])
      );
    }
    const direct = canonicalApostleIdsByLower.get(sourceId.toLowerCase());
    if (direct) return direct;
    const aliasKey = Object.keys(APOSTLE_ALIASES)
      .find(key => key.toLowerCase() === sourceId.toLowerCase());
    const aliasId = aliasKey ? APOSTLE_ALIASES[aliasKey] : '';
    return canonicalApostleIdsByLower.get(String(aliasId).toLowerCase()) || '';
  }

  function getApostleAssetId(id) {
    const canonicalId = getCanonicalApostleId(id);
    return canonicalId ? (APOSTLE_ALIASES[canonicalId] || canonicalId) : '';
  }

  function hasPublicAsideData(id) {
    const canonicalId = getCanonicalApostleId(id);
    if (!canonicalId) return false;
    const checker = window.TRICKCAL_PUBLIC_RELEASE?.isAsideEnabled;
    if (typeof checker === 'function' && !checker(canonicalId)) return false;
    const sheets = typeof TRICKCAL_STAT_DATA === 'undefined'
      ? null
      : TRICKCAL_STAT_DATA?.sheets;
    if (!sheets) return false;
    return ['asideStatEffects', 'asideSpecialEffects'].some(sheetName =>
      Array.isArray(sheets[sheetName])
      && sheets[sheetName].some(row => getCanonicalApostleId(row?.id) === canonicalId)
    );
  }

  function isDamageCalcPage() {
    return document.body?.classList.contains('formation-damage-calc');
  }

  function getCommonImages() {
    return isDamageCalcPage()
      ? BASE_COMMON_IMAGES
      : BASE_COMMON_IMAGES.concat(STAT_DASHBOARD_IMAGES);
  }

  function addApostleImages(urls, id) {
    if (!id) return;
    const assetId = getApostleAssetId(String(id));
    if (!assetId) return;
    urls.add(`img/Chara/${assetId}.webp`);
    if (isDamageCalcPage()) return;
    urls.add(`img/Chara/Skill/Skill_P_${assetId}.webp`);
    urls.add(`img/Chara/Skill/Skill_F_${assetId}.webp`);
    urls.add(`img/Chara/Skill/Skill_S_${assetId}.webp`);
    if (!hasPublicAsideData(id)) return;
    urls.add(`img/Chara/Aside/AsideIcon_${assetId}.webp`);
    urls.add(`img/Chara/Aside/Aside_Skill_${assetId}_1.webp`);
    urls.add(`img/Chara/Aside/Aside_Skill_${assetId}_2.webp`);
    urls.add(`img/Chara/Aside/Aside_Skill_${assetId}_3.webp`);
  }

  function getCardCollections() {
    const library = typeof CARD_LIBRARY !== 'undefined' ? CARD_LIBRARY : null;
    return {
      artifact: Array.isArray(library?.artifacts) ? library.artifacts : [],
      spell: Array.isArray(library?.spells) ? library.spells : []
    };
  }

  function getCardImagePath(card) {
    if (!card) return '';
    const folder = card.kind === 'spell' ? 'Spell' : 'Artifact';
    return `img/Card/${folder}/${card.imageFile || `${card.name}.webp`}`;
  }

  function addCardImage(urls, cardId, kindHint = '') {
    if (!cardId) return;
    const collections = getCardCollections();
    const pool = kindHint === 'spell'
      ? collections.spell
      : kindHint === 'artifact'
        ? collections.artifact
        : collections.artifact.concat(collections.spell);
    const card = pool.find(item => item.id === cardId);
    const path = getCardImagePath(card);
    if (path) urls.add(path);
  }

  function collectSavedImages() {
    const urls = new Set(getCommonImages());
    const state = readJson(STAT_STORAGE_KEY);
    const calc = readJson(CALC_SETTINGS_KEY);

    addApostleImages(urls, state.activeId);
    addApostleImages(urls, calc.targetId);

    const formation = state.formation || {};
    (formation.rows || []).forEach(row => {
      (row.apostles || []).forEach(id => addApostleImages(urls, id));
      (row.artifacts || []).forEach(id => addCardImage(urls, id, 'artifact'));
    });
    (formation.spells || []).forEach(id => addCardImage(urls, id, 'spell'));

    return Array.from(urls);
  }

  function collectLibraryImages() {
    const urls = new Set();
    const apostles = typeof APOSTLE_LIBRARY !== 'undefined' && Array.isArray(APOSTLE_LIBRARY)
      ? APOSTLE_LIBRARY
      : [];
    apostles.forEach(apostle => {
      const assetId = getApostleAssetId(apostle?.id);
      if (assetId) urls.add(`img/Chara/${assetId}.webp`);
    });
    const collections = getCardCollections();
    collections.artifact.concat(collections.spell).forEach(card => {
      const path = getCardImagePath(card);
      if (path) urls.add(path);
    });
    return Array.from(urls);
  }

  function preloadImages(urls, chunkSize = 8) {
    const queue = urls.filter(src => {
      const resolved = resolveAssetUrl(src);
      if (!resolved || requestedUrls.has(resolved)) return false;
      requestedUrls.add(resolved);
      return true;
    });
    const loaded = [];
    const run = deadline => {
      let count = 0;
      while (queue.length && count < chunkSize && (!deadline || deadline.timeRemaining() > 2)) {
        const src = resolveAssetUrl(queue.shift());
        const image = new Image();
        image.decoding = 'async';
        image.fetchPriority = 'low';
        image.src = src;
        preloadCache.push(image);
        loaded.push(src);
        count += 1;
      }
      window.TRICKCAL_PRELOADED_IMAGES = loaded.slice();
      if (queue.length) schedule(run);
    };
    schedule(run);
  }

  function schedule(callback) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: 1500 });
      return;
    }
    window.setTimeout(() => callback(null), 80);
  }

  window.TRICKCAL_IMAGE_PRELOAD = {
    collectSavedImages,
    collectLibraryImages,
    preloadNow: () => preloadImages(collectSavedImages()),
    preloadLibrary: () => preloadImages(collectLibraryImages(), 3)
  };

  function startPreload() {
    preloadImages(collectSavedImages(), 4);
    window.setTimeout(() => preloadImages(collectLibraryImages(), 3), 2200);
  }

  if (document.readyState === 'complete') startPreload();
  else window.addEventListener('load', startPreload, { once: true });
  });
})();
