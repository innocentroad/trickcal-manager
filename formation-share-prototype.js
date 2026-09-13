(() => {
  'use strict';

  const storageBoot = window.TRICKCAL_STORAGE_BOOT || Promise.resolve({ ok: true });
  storageBoot.then(bootResult => {
    if (!bootResult?.ok) return;
    const storageFacade = window.TRICKCAL_STORAGE_FACADE;
    if (!storageFacade) throw new Error('storage facade unavailable');
    const storageLocal = window.TRICKCAL_STORAGE_FACADE.localStorage;
    const storageSession = window.TRICKCAL_STORAGE_FACADE.sessionStorage;

  const DATA = window.TRICKCAL_STAT_DATA;
  const cards = typeof CARD_LIBRARY === 'undefined'
    ? { artifacts: [], spells: [] }
    : CARD_LIBRARY;
  const cardById = new Map([...(cards.artifacts || []), ...(cards.spells || [])].map(card => [card.id, card]));
  const basicById = new Map((DATA?.sheets?.basicInfo || []).map(row => [row.id, row]));
  const powerById = new Map((DATA?.sheets?.masterPowers || []).map(power => [power.id, power]));
  const params = new URLSearchParams(window.location.search);
  const displayOptions = {
    showMemberInfo: params.get('showMemberInfo') !== '0',
    showSkillLevels: params.get('showSkillLevels') !== '0'
  };
  const GLOBAL_ENHANCEMENT_STORAGE_KEY = 'trickcal_share_global_enhancement_sources_v2';
  const GLOBAL_ENHANCEMENT_STATS = [
    { key: 'hp', label: 'HP', snapshotKey: 'hp', icon: 'HP.webp' },
    { key: 'patk', label: '物攻', snapshotKey: 'physicalAtk', icon: '物理攻撃力.webp' },
    { key: 'matk', label: '魔攻', snapshotKey: 'magicAtk', icon: '魔法攻撃力.webp' },
    { key: 'pdef', label: '物防', snapshotKey: 'physicalDef', icon: '物理防御力.webp' },
    { key: 'mdef', label: '魔防', snapshotKey: 'magicDef', icon: '魔法防御力.webp' },
    { key: 'crit', label: '会心', snapshotKey: 'crit', icon: '会心.webp' },
    { key: 'critDmg', label: '会心DMG', snapshotKey: 'critDmg', icon: '会心ダメージ.webp' },
    { key: 'critRes', label: '会心抵抗', snapshotKey: 'critRes', icon: '会心抵抗.webp' },
    { key: 'critDmgRes', label: 'DMG抵抗', snapshotKey: 'critDmgRes', icon: '会心DMG抵抗.webp' },
    { key: 'spRegen', label: 'SP回復', snapshotKey: 'spRegen', icon: 'SP回復.webp' }
  ];
  const GLOBAL_ENHANCEMENT_SOURCES = [
    { key: 'rankGlobal', label: 'Rank全体', note: '全体', default: false },
    { key: 'research', label: '研究', note: '種族', default: false },
    { key: 'boardAdvanced', label: 'ボード上級', note: '全体', default: false },
    { key: 'globalPercent', label: '全体%補正', note: 'アサイド・特殊マス', default: true, percent: true }
  ];
  let globalEnhancementSelection = loadGlobalEnhancementSelection();
  const assetAliases = {
    ED: 'Ed',
    Rudd: 'Rude',
    Sion: 'Xion',
    sion: 'Xion',
    xion: 'Xion',
    Shady: 'Shaydi',
    Lazy: 'Layze',
    Razy: 'Layze',
    Reizy: 'Layze'
  };
  const positionLabels = ['後列', '中列', '前列'];
  const positionNotes = ['後衛グループ', '中衛グループ', '前衛グループ'];
  const MASTER_POWER_COST = 30;
  const brokenCardIds = new Set();

  const sampleFormation = {
    rows: [
      {
        apostles: ['Xion', 'Aya', 'Momo'],
        artifacts: [
          ['artifact_xion_black_cape', 'artifact_dragonlight_sword', 'artifact_jade_codex'],
          ['artifact_icy_charm', 'artifact_life_gem', 'artifact_safety_harness'],
          ['artifact_30kg_kettlebell', 'artifact_elven_wand', 'artifact_ring_of_greed']
        ]
      },
      {
        apostles: ['Kyarot', 'Epica', 'Alice'],
        artifacts: [
          ['artifact_kyarot_sugarcane', 'artifact_chloe_sewing_chest', 'artifact_picora_fashion_pouch'],
          ['artifact_yomi_moonflower', 'artifact_blanchet_bouquet', 'artifact_risty_replica_glove'],
          ['artifact_barong_cursed_doll', 'artifact_shoupan_magical_backpack', 'artifact_snorky_fedora']
        ]
      },
      {
        apostles: ['Tig', 'Sylla', 'Kidian'],
        artifacts: [
          ['artifact_tig_blazing_sword', 'artifact_dragonlight_sword', 'artifact_jade_codex'],
          ['artifact_healing_pendant', 'artifact_old_wooden_dagger', 'artifact_icy_charm'],
          ['artifact_safety_harness', 'artifact_life_gem', 'artifact_assassin_scroll']
        ]
      }
    ],
    spells: [
      'spell_aya_snowflake_magic',
      'spell_epica_hero_exaltation',
      'spell_alice_fake_magic',
      'spell_combat_master',
      'spell_aroma_therapy',
      'spell_cheer_up'
    ],
    masterPowers: ['masterpower_acceleration']
  };

  const sampleApostles = {
    Xion: { level: 145, rank: 6, star: 5, asideRank: 2, asideLevel: 30, skillLevels: { low: 14, high: 14, passive: 14 }, favoriteLevel: 3 },
    Aya: { level: 145, rank: 6, star: 5, asideRank: 2, asideLevel: 30, skillLevels: { low: 14, high: 14, passive: 14 }, favoriteLevel: 2 },
    Momo: { level: 145, rank: 6, star: 5, asideRank: 0, asideLevel: 0, skillLevels: { low: 12, high: 12, passive: 12 }, favoriteLevel: 0 },
    Kyarot: { level: 145, rank: 6, star: 5, asideRank: 3, asideLevel: 40, skillLevels: { low: 15, high: 15, passive: 15 }, favoriteLevel: 3 },
    Epica: { level: 145, rank: 6, star: 5, asideRank: 1, asideLevel: 20, skillLevels: { low: 13, high: 13, passive: 13 }, favoriteLevel: 2 },
    Alice: { level: 140, rank: 6, star: 5, asideRank: 0, asideLevel: 0, skillLevels: { low: 12, high: 12, passive: 12 }, favoriteLevel: 0 },
    Tig: { level: 145, rank: 6, star: 5, asideRank: 3, asideLevel: 40, skillLevels: { low: 15, high: 15, passive: 15 }, favoriteLevel: 3 },
    Sylla: { level: 145, rank: 6, star: 5, asideRank: 2, asideLevel: 30, skillLevels: { low: 14, high: 14, passive: 14 }, favoriteLevel: 2 },
    Kidian: { level: 145, rank: 6, star: 5, asideRank: 1, asideLevel: 20, skillLevels: { low: 13, high: 13, passive: 13 }, favoriteLevel: 1 }
  };

  const sampleCards = {};
  [...sampleFormation.rows.flatMap(row => row.artifacts.flat()), ...sampleFormation.spells].forEach((id, index) => {
    sampleCards[id] = { star: 5, solder: index % 3, owned: true };
  });

  const sampleGlobalEnhancements = {
    rankGlobal: { hp: 31356, patk: 2144, matk: 2192, pdef: 4554, mdef: 4455, crit: 3240, critDmg: 3240, critRes: 3216, critDmgRes: 3216 },
    research: { hp: 4026, patk: 281, matk: 281, pdef: 561, mdef: 561 },
    boardAdvanced: { hp: 10488, patk: 684, matk: 684, pdef: 1368, mdef: 1368, crit: 1140, critDmg: 1140, critRes: 1810, critDmgRes: 1810 },
    globalPercent: { rates: { hp: 607, patk: 616, matk: 621, pdef: 592, mdef: 591, crit: 590, critDmg: 591, critRes: 606, critDmgRes: 601 } }
  };

  function parseJson(storage, key) {
    try {
      const raw = storage?.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function loadSavedSnapshot() {
    const workspace = parseJson(storageSession, 'trickcal_stat_workspace_v2');
    if (workspace?.workspaceVersion === 2 && workspace.draft) return hydrateSavedSnapshot(workspace.draft);
    const live = parseJson(storageLocal, 'trickcal_stat_live_v2');
    if (live?.snapshot) return hydrateSavedSnapshot(live.snapshot);
    return hydrateSavedSnapshot(parseJson(storageLocal, 'trickcal_stat_prototype_v1'));
  }

  function hydrateSavedSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return snapshot;
    const decoder = window.TRICKCAL_SHARED_STAT_ENGINE?.decodeComparisonStatSnapshots;
    if (typeof decoder !== 'function' || !snapshot.comparisonStats || !snapshot.apostles) return snapshot;
    const decoded = decoder(snapshot.comparisonStats);
    Object.entries(decoded || {}).forEach(([id, snapshots]) => {
      const state = snapshot.apostles[id];
      if (!state || typeof state !== 'object') return;
      state.statSnapshots = {
        ...(state.statSnapshots && typeof state.statSnapshots === 'object' ? state.statSnapshots : {}),
        ...cloneJson(snapshots)
      };
      if (state.statSnapshots.current?.stats) state.finalStats = cloneJson(state.statSnapshots.current.stats);
    });
    return snapshot;
  }

  function hasFormationMembers(formation) {
    return !!formation?.rows?.some(row => row?.apostles?.some(Boolean));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function apostleAssetId(id) {
    return assetAliases[id] || id;
  }

  function apostleImagePath(id) {
    return `img/Chara/${apostleAssetId(id)}.webp`;
  }

  function skillImagePath(id, kind) {
    const skillType = { low: 'F', high: 'S', passive: 'P' }[kind] || 'P';
    return `img/Chara/Skill/Skill_${skillType}_${apostleAssetId(id)}.webp`;
  }

  function cardImagePath(card) {
    if (!card) return '';
    const folder = card.kind === 'spell' ? 'Spell' : 'Artifact';
    if (brokenCardIds.has(card.id)) return `img/Card/${folder}/__missing__.webp`;
    return `img/Card/${folder}/${card.imageFile || `${card.name}.webp`}`;
  }

  function publicAsideRank(id, value) {
    if (typeof window.TRICKCAL_PUBLIC_RELEASE?.isAsideEnabled === 'function'
      && !window.TRICKCAL_PUBLIC_RELEASE.isAsideEnabled(id)) return 0;
    return clamp(value, 0, 3);
  }

  function getStateFor(id, states, useSample) {
    const source = useSample ? sampleApostles[id] : states?.[id];
    return source && typeof source === 'object' ? source : {};
  }

  function getCardState(id, states, useSample) {
    const source = useSample ? sampleCards[id] : states?.[id];
    return source && typeof source === 'object' ? source : { star: 1, solder: 0 };
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadGlobalEnhancementSelection() {
    const allowed = new Set(GLOBAL_ENHANCEMENT_SOURCES.map(source => source.key));
    const query = params.get('globalSources');
    if (query != null) return new Set(query.split(',').filter(key => allowed.has(key)));
    try {
      const parsed = JSON.parse(storageLocal.getItem(GLOBAL_ENHANCEMENT_STORAGE_KEY) || 'null');
      if (Array.isArray(parsed?.sources)) return new Set(parsed.sources.filter(key => allowed.has(key)));
    } catch {}
    return new Set(GLOBAL_ENHANCEMENT_SOURCES.filter(source => source.default).map(source => source.key));
  }

  function saveGlobalEnhancementSelection() {
    if (params.has('globalSources')) return;
    try {
      storageLocal.setItem(GLOBAL_ENHANCEMENT_STORAGE_KEY, JSON.stringify({
        version: 1,
        sources: Array.from(globalEnhancementSelection)
      }));
    } catch {}
  }

  function formatShareNumber(value) {
    return Math.round(Number(value) || 0).toLocaleString('ja-JP');
  }

  function formatShareRate(value) {
    const numeric = Number(value) || 0;
    return numeric.toLocaleString('ja-JP', { maximumFractionDigits: 2 });
  }

  function getSampleCase(caseName) {
    const formation = cloneJson(sampleFormation);
    brokenCardIds.clear();
    if (caseName === 'empty') {
      formation.rows = Array.from({ length: 3 }, () => ({ apostles: ['', '', ''], artifacts: [[], [], []] }));
      formation.spells = [];
      formation.masterPowers = [];
    } else if (caseName === 'one') {
      formation.rows = Array.from({ length: 3 }, () => ({ apostles: ['', '', ''], artifacts: [[], [], []] }));
      formation.rows[1].apostles[0] = 'Aya';
      formation.rows[1].artifacts[0] = ['artifact_icy_charm', '', ''];
      formation.spells = ['spell_aya_snowflake_magic'];
      formation.masterPowers = ['masterpower_acceleration'];
    } else if (caseName === 'duplicate') {
      formation.spells = [sampleFormation.spells[0], sampleFormation.spells[0], ...sampleFormation.spells.slice(1)];
    } else if (caseName === 'six') {
      formation.rows[2].apostles = ['', '', ''];
      formation.rows[2].artifacts = [[], [], []];
    } else if (caseName === 'missing') {
      formation.rows[2].apostles[2] = 'MissingApostle';
      brokenCardIds.add('artifact_assassin_scroll');
    }
    return formation;
  }

  function renderStars(star, baseRarity = 3, compact = false) {
    const count = clamp(star || 1, 1, 5);
    const on = Number(baseRarity) <= 2 ? 'Grade_on_1_2.webp' : 'Grade_on.webp';
    return Array.from({ length: 5 }, (_, index) => `<img src="img/${index < count ? on : 'Grade_off.webp'}" alt=""${compact ? ' loading="lazy"' : ''}>`).join('');
  }

  function renderCardState(card, cardStates, useSample) {
    const state = getCardState(card?.id, cardStates, useSample);
    const star = clamp(state.star || 1, 1, 5);
    const solder = star >= 5 ? clamp(state.solder, 0, 2) : 0;
    return { star, solder };
  }

  function getCardCost(card, star = 5) {
    if (!card) return 0;
    if (Array.isArray(card.costByStar) && card.costByStar.length) {
      const index = Math.min(Math.max(Number(star) || 1, 1), card.costByStar.length) - 1;
      return Number(card.costByStar[index]) || 0;
    }
    return Number(card.cost) || 0;
  }

  function getCardRarityBackgroundPath(card, ownerName = '') {
    if (!card) return '';
    const favoriteEquipped = card.signature
      && String(card.favoriteCharacter || '') === String(ownerName || '');
    if (favoriteEquipped) return 'img/Card/Card_Signature.webp';
    const backgrounds = {
      '伝説': 'img/Card/Card_Legendary.webp',
      '希少': 'img/Card/Card_Unique.webp',
      '高級': 'img/Card/Card_Rare.webp'
    };
    return backgrounds[card.rarity] || 'img/Card/Card_Rare.webp';
  }

  function renderCardCostBadge(card, star) {
    const cost = getCardCost(card, star);
    return `
      <span class="card-cost-badge" title="コスト ${cost}" aria-label="コスト${cost}">
        <img src="img/Card/cost.webp" alt="">
        <b>${escapeHtml(cost)}</b>
      </span>
    `;
  }

  function rarityClass(card, ownerName = '') {
    const favoriteEquipped = card?.signature
      && String(card.favoriteCharacter || '') === String(ownerName || '');
    if (favoriteEquipped) return 'rarity-favorite-equipped';
    if (card?.rarity === '伝説') return 'rarity-legendary';
    if (card?.rarity === '希少') return 'rarity-unique';
    if (card?.rarity === '高級') return 'rarity-rare';
    if (card?.kind === 'artifact') return 'rarity-artifact';
    return '';
  }

  function renderCardMedia(card, cardStates, useSample, className = 'relic-card', ownerName = '') {
    if (!card) {
      return `<div class="empty-relic" aria-label="空き遺物枠"><div class="relic-media"></div></div>`;
    }
    const state = renderCardState(card, cardStates, useSample);
    const imagePath = cardImagePath(card);
    const rarityBackgroundPath = getCardRarityBackgroundPath(card, ownerName);
    return `
      <div class="${className} ${rarityClass(card, ownerName)}" title="${escapeHtml(`${card.name} ★${state.star}${state.solder > 0 ? ` はんだ+${state.solder}` : ''}`)}">
        <div class="relic-media">
          ${rarityBackgroundPath ? `<img class="card-rarity-bg" src="${rarityBackgroundPath}" alt="">` : ''}
          ${renderCardCostBadge(card, state.star)}
          <img class="card-art" src="${escapeHtml(imagePath)}" alt="${escapeHtml(card.name)}">
          <span class="card-missing" hidden>画像なし</span>
          <span class="card-stars" aria-label="★${state.star}">${renderStars(state.star, 3, true)}</span>
          ${state.solder > 0 ? `<span class="solder-badge" aria-label="はんだ+${state.solder}">+${state.solder}</span>` : ''}
        </div>
      </div>
    `;
  }

  function renderSkillLevel(id, kind, label, value) {
    const displayValue = value || '未';
    const description = `${label}スキル Lv${displayValue}`;
    return `
      <span class="skill-level-chip skill-${kind}" title="${escapeHtml(description)}" aria-label="${escapeHtml(description)}">
        <span class="skill-icon-wrap">
          <img class="skill-art" src="${escapeHtml(skillImagePath(id, kind))}" alt="">
          <span class="skill-missing" hidden>${escapeHtml(label)}</span>
          <b>${escapeHtml(label)}</b>
        </span>
        <strong>${escapeHtml(displayValue)}</strong>
      </span>
    `;
  }

  function renderMember(id, artifacts, states, cardStates, useSample) {
    const basic = basicById.get(id);
    const state = getStateFor(id, states, useSample);
    const asideRank = publicAsideRank(id, state.asideRank);
    const asideLevel = clamp(state.asideLevel, 0, 40);
    const skills = state.skillLevels || {};
    const name = basic?.使徒名 || id || '空き枠';
    const personality = basic?.性格 || '';
    const personalityClass = ['純粋', '冷静', '狂気', '活発', '憂鬱'].includes(personality)
      ? `personality-${personality}`
      : '';
    const memberStars = basic ? renderStars(state.star || basic.レア度 || 1, basic.レア度) : '';
    const aside = asideRank ? `<span class="aside-badge aside-rank-${asideRank}" aria-label="アサイド${asideRank}">A${asideRank}</span>` : '';
    const personalityBadge = basic && personality
      ? `<img class="personality-badge" src="img/性格_${escapeHtml(personality)}.webp" alt="${escapeHtml(personality)}" title="${escapeHtml(personality)}">`
      : '';
    const showMemberSummary = displayOptions.showMemberInfo || (displayOptions.showSkillLevels && basic);
    return `
      <article class="share-member ${basic ? personalityClass : 'is-empty'}" title="${escapeHtml(basic ? [basic.配置列, basic.役割, basic.攻撃タイプ, personality].filter(Boolean).join('・') : '使徒未選択')}">
        <div class="member-row">
          <div class="member-apostle">
            <div class="member-portrait">
              ${id ? `<img class="apostle-art" src="${escapeHtml(apostleImagePath(id))}" alt="${escapeHtml(name)}"><span class="portrait-missing" hidden>${escapeHtml(name)}</span>` : '<span class="portrait-missing">空き枠</span>'}
              ${personalityBadge}
              ${aside}
              ${basic ? `<span class="member-stars" aria-label="使徒★${clamp(state.star || basic.レア度 || 1, 1, 5)}">${memberStars}</span>` : ''}
            </div>
            <div class="member-name" title="${escapeHtml(name)}">${escapeHtml(name)}</div>
          </div>
          <div class="relic-grid" aria-label="${escapeHtml(`${name}の装備遺物`)}">
            ${Array.from({ length: 3 }, (_, index) => renderCardMedia(cardById.get(artifacts?.[index] || ''), cardStates, useSample, 'relic-card', basic?.使徒名 || '')).join('')}
          </div>
        </div>
        ${showMemberSummary ? `<div class="member-summary">
          ${displayOptions.showMemberInfo ? `<div class="member-info-line">
            <span class="member-level">Lv<strong>${state.level ? escapeHtml(state.level) : '未設定'}</strong></span>
            <span class="member-rank">R<strong>${state.rank ? escapeHtml(state.rank) : '未設定'}</strong></span>
            ${asideRank ? `<span class="aside-level">ALv${asideLevel || '未設定'}</span>` : ''}
          </div>` : ''}
          ${displayOptions.showSkillLevels && basic ? `<div class="skill-levels" aria-label="スキルレベル">
            ${renderSkillLevel(id, 'low', '低', skills.low)}
            ${renderSkillLevel(id, 'high', '高', skills.high)}
            ${renderSkillLevel(id, 'passive', 'P', skills.passive)}
          </div>` : ''}
        </div>` : ''}
      </article>
    `;
  }

  function renderFormation(formation, states, cardStates, useSample) {
    const grid = document.getElementById('formation-grid');
    grid.innerHTML = positionLabels.map((position, rowIndex) => {
      const row = formation.rows?.[rowIndex] || {};
      const apostles = Array.from({ length: 3 }, (_, index) => row.apostles?.[index] || '');
      const artifactRows = Array.from({ length: 3 }, (_, index) => Array.isArray(row.artifacts?.[index]) ? row.artifacts[index] : []);
      const filled = apostles.filter(Boolean).length;
      return `
        <section class="formation-column" aria-labelledby="position-${rowIndex}">
          <div class="formation-column-head">
            <strong id="position-${rowIndex}">${position}</strong>
            <small>${positionNotes[rowIndex]}・${filled}/3</small>
          </div>
          <div class="formation-column-body">
            ${apostles.map((id, index) => renderMember(id, artifactRows[index], states, cardStates, useSample)).join('')}
          </div>
        </section>
      `;
    }).join('');
    bindImageFallbacks(grid);
  }

  function renderSpells(formation, cardStates, useSample) {
    const ids = Array.isArray(formation.spells) ? formation.spells.filter(Boolean) : [];
    const counts = new Map();
    ids.forEach(id => counts.set(id, (counts.get(id) || 0) + 1));
    const rows = Array.from(counts.entries()).map(([id, count]) => ({ card: cardById.get(id), count })).filter(row => row.card);
    const formationMemberNames = new Set();
    (formation.rows || []).forEach(row => {
      (row.apostles || []).forEach(id => {
        const name = basicById.get(id || '')?.使徒名;
        if (name) formationMemberNames.add(name);
      });
    });
    document.getElementById('spell-count').textContent = `${ids.length}枚・${rows.length}種類`;
    document.getElementById('spell-list').innerHTML = rows.length
      ? rows.map(({ card, count }) => {
        const state = renderCardState(card, cardStates, useSample);
        const ownerName = card.favoriteCharacter && formationMemberNames.has(card.favoriteCharacter)
          ? card.favoriteCharacter
          : '';
        return `
          <div class="support-card" title="${escapeHtml(`${card.name} ★${state.star}${state.solder > 0 ? ` はんだ+${state.solder}` : ''}`)}">
            <div class="support-card-media ${rarityClass(card, ownerName)}">
              <img class="card-art" src="${escapeHtml(cardImagePath(card))}" alt="${escapeHtml(card.name)}">
              <span class="card-missing" hidden>画像なし</span>
              <span class="card-stars" aria-label="★${state.star}">${renderStars(state.star, 3, true)}</span>
              ${renderCardCostBadge(card, state.star)}
              ${state.solder > 0 ? `<span class="solder-badge" aria-label="はんだ+${state.solder}">+${state.solder}</span>` : ''}
              ${count > 1 ? `<span class="support-card-count" aria-label="${count}枚">×${count}</span>` : ''}
            </div>
          </div>
        `;
      }).join('')
      : '<p class="empty-support">スペル未選択</p>';
    bindImageFallbacks(document.getElementById('spell-list'));
  }

  function calculateFormationTotalCost(formation, cardStates, useSample) {
    let total = 0;
    (formation.rows || []).forEach(row => {
      (row.artifacts || []).forEach(artifacts => {
        (artifacts || []).forEach(id => {
          const card = cardById.get(id || '');
          if (!card) return;
          const state = renderCardState(card, cardStates, useSample);
          total += getCardCost(card, state.star);
        });
      });
    });
    (formation.spells || []).forEach(id => {
      const card = cardById.get(id || '');
      if (!card) return;
      const state = renderCardState(card, cardStates, useSample);
      total += getCardCost(card, state.star);
    });
    if ((formation.masterPowers || []).some(Boolean)) total += MASTER_POWER_COST;
    return total;
  }

  function renderFormationTotalCost(formation, cardStates, useSample) {
    const target = document.getElementById('formation-total-cost');
    if (!target) return;
    const total = calculateFormationTotalCost(formation, cardStates, useSample);
    target.innerHTML = `
      <span>総合コスト</span>
      <span class="formation-total-cost-value">
        <img src="img/Card/cost.webp" alt="">
        <strong>${escapeHtml(total)}</strong>
      </span>
    `;
    target.title = `遺物・スペル・権能の総合コスト ${total}`;
    target.setAttribute('aria-label', target.title);
  }

  function renderMasterPower(formation, useSample) {
    const id = formation.masterPowers?.[0] || '';
    const power = powerById.get(id) || (useSample && params.get('case') !== 'empty'
      ? powerById.get(sampleFormation.masterPowers[0])
      : null);
    const target = document.getElementById('master-power');
    if (!power) {
      target.innerHTML = '<p class="empty-support">権能未選択</p>';
      return;
    }
    const name = power['権能名'] || power.id;
    const imagePath = `img/Card/権能_${name}.webp`;
    target.innerHTML = `
      <div class="master-power-name-card" title="${escapeHtml(name)}" aria-label="教主の権能 ${escapeHtml(name)}">
        <div class="master-power-media">
          <img class="master-power-art" src="${escapeHtml(imagePath)}" alt="${escapeHtml(name)}">
          <span class="power-fallback" hidden>画像なし</span>
          ${renderCardCostBadge({ cost: MASTER_POWER_COST }, 5)}
        </div>
        <strong>${escapeHtml(name)}</strong>
      </div>
    `;
    bindImageFallbacks(target);
  }

  function bindImageFallbacks(root) {
    root?.querySelectorAll('img.apostle-art, img.card-art, img.skill-art, img.master-power-art').forEach(image => {
      image.addEventListener('error', () => {
        image.hidden = true;
        const fallback = image.parentElement?.querySelector('.portrait-missing, .card-missing, .skill-missing, .power-fallback');
        if (fallback) fallback.hidden = false;
      }, { once: true });
    });
  }

  function normalizeFormation(source) {
    const rows = Array.isArray(source?.rows) ? source.rows : [];
    return {
      rows: Array.from({ length: 3 }, (_, rowIndex) => {
        const row = rows[rowIndex] || {};
        return {
          apostles: Array.from({ length: 3 }, (_, index) => row.apostles?.[index] || ''),
          artifacts: Array.from({ length: 3 }, (_, index) => Array.from({ length: 3 }, (_, slot) => row.artifacts?.[index]?.[slot] || ''))
        };
      }),
      spells: Array.isArray(source?.spells) ? source.spells.filter(Boolean) : [],
      masterPowers: Array.isArray(source?.masterPowers) ? source.masterPowers.filter(Boolean) : []
    };
  }

  function displayLabel(value) {
    if (value == null) return '';
    if (typeof value === 'object') {
      return String(value.name ?? value.label ?? value.title ?? '').trim();
    }
    return String(value).trim();
  }

  function getFormationContext(source) {
    const metadata = source?.shareMeta || source?.formationMeta || source?.metadata || {};
    const scenario = metadata.scenario || source?.scenario || {};
    const formationMetadata = source?.formation && typeof source.formation === 'object'
      ? source.formation
      : {};
    const presets = Array.isArray(source?.savedFormations) ? source.savedFormations : [];
    const activePreset = presets.find(item => String(item?.id || '') === String(source?.activeFormationPresetId || ''));
    const title = displayLabel(
      params.get('formationTitle') || params.get('title')
      || metadata.formationTitle || metadata.title
      || source?.formationTitle || formationMetadata.title
      || activePreset?.name
    );
    const stage = displayLabel(
      params.get('stage')
      || metadata.stageName || metadata.stage
      || scenario.stageName || scenario.stage
      || source?.stageName || source?.stage
    );
    const enemy = displayLabel(
      params.get('enemy')
      || metadata.enemyName || metadata.enemy
      || scenario.enemyName || scenario.enemy
      || source?.enemyName || source?.enemy
    );
    const rawTags = Array.isArray(metadata.tags)
      ? metadata.tags
      : Array.isArray(activePreset?.tags) ? activePreset.tags : [];
    const tags = rawTags.map(displayLabel).filter(Boolean).slice(0, 4);
    return { title, stage, enemy, tags };
  }

  function renderFormationContext(source) {
    const target = document.getElementById('formation-context');
    if (!target) return;
    const context = getFormationContext(source);
    const parts = [];
    if (context.title) parts.push(`<strong class="formation-context-title">${escapeHtml(context.title)}</strong>`);
    if (context.stage) parts.push(`<span class="formation-context-item"><b>ステージ</b>${escapeHtml(context.stage)}</span>`);
    if (context.enemy) parts.push(`<span class="formation-context-item"><b>敵</b>${escapeHtml(context.enemy)}</span>`);
    context.tags.forEach(tag => parts.push(`<span class="formation-context-tag">${escapeHtml(tag)}</span>`));
    target.innerHTML = parts.join('');
    target.hidden = parts.length === 0;
  }

  function setupTheme() {
    const button = document.getElementById('theme-toggle');
    const update = () => {
      const light = document.documentElement.dataset.theme === 'light';
      button.setAttribute('aria-pressed', String(!light));
      button.querySelector('.theme-button-label').textContent = light ? 'ダーク' : 'ライト';
    };
    button.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      try { storageLocal.setItem('trickcal_theme', next); } catch (error) {
        if (error?.name === 'StorageRuntimeError') document.documentElement.dataset.storageError = error.result?.code || 'failed';
      }
      update();
    });
    update();
  }

  function setupDisplayOptions() {
    const memberInfo = document.getElementById('share-show-member-info');
    const skillLevels = document.getElementById('share-show-skill-levels');
    if (!memberInfo || !skillLevels) return;
    memberInfo.checked = displayOptions.showMemberInfo;
    skillLevels.checked = displayOptions.showSkillLevels;
    const update = () => {
      displayOptions.showMemberInfo = memberInfo.checked;
      displayOptions.showSkillLevels = skillLevels.checked;
      render();
    };
    memberInfo.addEventListener('change', update);
    skillLevels.addEventListener('change', update);
  }

  function getFormationMemberIds(formation) {
    return [...new Set((formation?.rows || [])
      .flatMap(row => row?.apostles || [])
      .filter(Boolean))];
  }

  function getMemberSnapshot(source, id) {
    const state = source?.apostles?.[id];
    return state?.statSnapshots?.current || state?.statSnapshots?.planned || null;
  }

  function normalizeGlobalEnhancementValues(raw = {}) {
    const values = raw?.values || raw?.stats || raw || {};
    return Object.fromEntries(GLOBAL_ENHANCEMENT_STATS.map(stat => [
      stat.key,
      Number(values?.[stat.key] ?? values?.[stat.snapshotKey]) || 0
    ]));
  }

  function normalizeGlobalEnhancementEntry(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const valuesSource = raw.values || raw.stats || (raw.rates || raw.globalPercentRates ? {} : raw);
    return {
      values: normalizeGlobalEnhancementValues(valuesSource),
      rates: normalizeGlobalEnhancementValues(raw.rates || raw.globalPercentRates || {})
    };
  }

  function getExplicitGlobalEnhancementSource(source, key) {
    const container = source?.globalEnhancements
      || source?.globalBonusSummary
      || source?.shareMeta?.globalEnhancements;
    if (!container || typeof container !== 'object') return null;
    return container.sources?.[key] ?? container[key] ?? null;
  }

  function getSnapshotGlobalEnhancement(source, id, sourceDef) {
    const snapshot = getMemberSnapshot(source, id);
    if (!snapshot) return null;
    return {
      values: normalizeGlobalEnhancementValues(snapshot.breakdown?.[sourceDef.key] || {}),
      rates: sourceDef.percent
        ? normalizeGlobalEnhancementValues(snapshot.globalPercentRates || {})
        : normalizeGlobalEnhancementValues({})
    };
  }

  function hasGlobalEnhancementValue(entry, sourceDef) {
    return GLOBAL_ENHANCEMENT_STATS.some(stat => {
      const value = Number(entry?.values?.[stat.key]) || 0;
      const rate = sourceDef.percent ? Number(entry?.rates?.[stat.key]) || 0 : 0;
      return value !== 0 || rate !== 0;
    });
  }

  function enhancementSignature(entry, sourceDef) {
    return GLOBAL_ENHANCEMENT_STATS.map(stat => [
      Number(entry?.values?.[stat.key]) || 0,
      sourceDef.percent ? Number(entry?.rates?.[stat.key]) || 0 : 0
    ].join(':')).join('|');
  }

  function collectGlobalEnhancements(source, formation) {
    return GLOBAL_ENHANCEMENT_SOURCES
      .filter(sourceDef => globalEnhancementSelection.has(sourceDef.key))
      .map(sourceDef => {
        const explicit = getExplicitGlobalEnhancementSource(source, sourceDef.key);
        const candidates = [];
        if (explicit) {
          const entry = normalizeGlobalEnhancementEntry(explicit);
          if (entry && hasGlobalEnhancementValue(entry, sourceDef)) {
            candidates.push({ entry, target: '編成全体' });
          }
        } else {
          getFormationMemberIds(formation).forEach(id => {
            const entry = getSnapshotGlobalEnhancement(source, id, sourceDef);
            if (!entry || !hasGlobalEnhancementValue(entry, sourceDef)) return;
            candidates.push({
              entry,
              target: basicById.get(id)?.使徒名 || id
            });
          });
        }
        const groups = new Map();
        candidates.forEach(candidate => {
          const signature = enhancementSignature(candidate.entry, sourceDef);
          const group = groups.get(signature) || {
            entry: candidate.entry,
            targets: []
          };
          group.targets.push(candidate.target);
          groups.set(signature, group);
        });
        return { sourceDef, groups: [...groups.values()] };
      })
      .filter(item => item.groups.length);
  }

  function renderGlobalEnhancementOptions() {
    const target = document.getElementById('global-enhancement-source-options');
    if (!target) return;
    target.innerHTML = GLOBAL_ENHANCEMENT_SOURCES.map(source => `
      <label class="global-enhancement-source-option">
        <input type="checkbox" data-global-enhancement-source="${escapeHtml(source.key)}"${globalEnhancementSelection.has(source.key) ? ' checked' : ''}>
        <span>
          <strong>${escapeHtml(source.label)}</strong>
          <small>${escapeHtml(source.note)}</small>
        </span>
      </label>
    `).join('');
  }

  function renderGlobalEnhancementRow(stat, entry, sourceDef) {
    const value = Number(entry?.values?.[stat.key]) || 0;
    const rate = sourceDef.percent ? Number(entry?.rates?.[stat.key]) || 0 : 0;
    if (!value && !rate) return '';
    const displayValue = sourceDef.percent
      ? `+${formatShareRate(rate)}%`
      : `+${formatShareNumber(value)}`;
    const label = sourceDef.percent ? `${stat.label} 全体補正 ${displayValue}` : `${stat.label} ${displayValue}`;
    return `
      <tr>
        <th scope="row" title="${escapeHtml(label)}">
          <span class="global-enhancement-stat-label"><img src="img/${escapeHtml(stat.icon)}" alt="">${escapeHtml(stat.label)}</span>
        </th>
        <td><strong>${escapeHtml(displayValue)}</strong></td>
      </tr>
    `;
  }

  function renderGlobalEnhancementSource(sourceDef, groups) {
    return `
      <article class="global-enhancement-source">
        <div class="global-enhancement-source-head">
          <strong>${escapeHtml(sourceDef.label)}</strong>
          <small>${escapeHtml(sourceDef.note)}</small>
        </div>
        ${groups.map(group => `
          <div class="global-enhancement-entry">
            <table class="global-enhancement-table">
              <thead><tr><th scope="col">ステータス</th><th scope="col">補正値</th></tr></thead>
              <tbody>${GLOBAL_ENHANCEMENT_STATS.map(stat => renderGlobalEnhancementRow(stat, group.entry, sourceDef)).filter(Boolean).join('')}</tbody>
            </table>
          </div>
        `).join('')}
      </article>
    `;
  }

  function renderGlobalEnhancements(source, formation, useSample) {
    const target = document.getElementById('global-enhancement-list');
    if (!target) return;
    if (!globalEnhancementSelection.size) {
      target.innerHTML = '<p class="empty-support">表示設定から表示する強化元を選択してください。</p>';
      return;
    }
    const sections = collectGlobalEnhancements(source, formation)
      .map(item => renderGlobalEnhancementSource(item.sourceDef, item.groups));
    target.innerHTML = sections.length
      ? sections.join('')
      : `<p class="empty-support">${useSample ? '共有用の表示例に全体強化値がありません。' : '保存データに全体強化値がありません。'}</p>`;
  }

  function setupGlobalEnhancementOptions() {
    renderGlobalEnhancementOptions();
    document.getElementById('global-enhancement-source-options')?.addEventListener('change', event => {
      const input = event.target.closest('input[data-global-enhancement-source]');
      if (!input) return;
      const key = input.dataset.globalEnhancementSource || '';
      if (!GLOBAL_ENHANCEMENT_SOURCES.some(source => source.key === key)) return;
      if (input.checked) globalEnhancementSelection.add(key);
      else globalEnhancementSelection.delete(key);
      saveGlobalEnhancementSelection();
      render();
    });
  }

  function render() {
    const saved = loadSavedSnapshot();
    const sampleCase = params.get('case') || '';
    const forceSample = params.get('sample') === '1' || !!sampleCase;
    const useSample = forceSample || !hasFormationMembers(saved?.formation);
    const source = useSample
      ? {
        formation: getSampleCase(sampleCase),
        apostles: sampleApostles,
        cards: sampleCards,
        ...(!sampleCase ? { globalEnhancements: sampleGlobalEnhancements } : {})
      }
      : saved;
    const formation = normalizeFormation(source?.formation);
    renderFormation(formation, source?.apostles || {}, source?.cards || {}, useSample);
    renderFormationContext(source);
    renderSpells(formation, source?.cards || {}, useSample);
    renderFormationTotalCost(formation, source?.cards || {}, useSample);
    renderGlobalEnhancements(source, formation, useSample);
    renderMasterPower(formation, useSample);
    const caseLabel = { empty: '空き枠', one: '1人', duplicate: '同一スペル複数枚', six: '6人', missing: '画像欠落' }[sampleCase];
    document.getElementById('snapshot-source').textContent = useSample
      ? `代表サンプル${caseLabel ? `（${caseLabel}）` : '（検証用）'}`
      : '保存状態（読み取り専用）';
    document.getElementById('snapshot-date').textContent = useSample
      ? `${caseLabel || '9人・最大育成'}を含む表示例`
      : '編成・育成データを変更しません';
  }

  if (params.get('theme') === 'light') document.documentElement.dataset.theme = 'light';
  setupTheme();
  setupDisplayOptions();
  setupGlobalEnhancementOptions();
  render();
  }).catch(error => {
    if (error?.name === 'StorageRuntimeError') {
      document.documentElement?.setAttribute('data-storage-error', error.result?.code || 'failed');
      return;
    }
    console.error(error);
  });
})();
