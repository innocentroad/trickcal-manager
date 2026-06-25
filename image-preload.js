(function () {
  'use strict';

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

  const COMMON_IMAGES = [
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
    'img/配置列_後列.webp',
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

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function getApostleAssetId(id) {
    return APOSTLE_ALIASES[id] || id;
  }

  function addApostleImages(urls, id) {
    if (!id) return;
    const assetId = getApostleAssetId(String(id));
    urls.add(`img/Chara/${assetId}.webp`);
    urls.add(`img/Chara/Skill/Skill_P_${assetId}.webp`);
    urls.add(`img/Chara/Skill/Skill_F_${assetId}.webp`);
    urls.add(`img/Chara/Skill/Skill_S_${assetId}.webp`);
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
    const urls = new Set(COMMON_IMAGES);
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

  function preloadImages(urls, chunkSize = 8) {
    const queue = urls.filter(Boolean);
    const loaded = [];
    const run = deadline => {
      let count = 0;
      while (queue.length && count < chunkSize && (!deadline || deadline.timeRemaining() > 2)) {
        const src = queue.shift();
        const image = new Image();
        image.decoding = 'async';
        image.src = src;
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
    preloadNow: () => preloadImages(collectSavedImages())
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => preloadImages(collectSavedImages()), { once: true });
  } else {
    preloadImages(collectSavedImages());
  }
})();
