(() => {
  'use strict';

  const DATA = window.TRICKCAL_STAT_DATA;
  const CODEC = window.TRICKCAL_FORMATION_SHARE_CODEC;
  const CARD_DATA = window.TRICKCAL_CARD_LIBRARY || (typeof CARD_LIBRARY === 'undefined'
    ? { artifacts: [], spells: [] }
    : CARD_LIBRARY);
  const basicById = new Map((DATA?.sheets?.basicInfo || []).map(row => [row.id, row]));
  const cardById = new Map([
    ...(CARD_DATA.artifacts || []).map(card => [card.id, { ...card, kind: 'artifact' }]),
    ...(CARD_DATA.spells || []).map(card => [card.id, { ...card, kind: 'spell' }])
  ]);
  const powerById = new Map((DATA?.sheets?.masterPowers || []).map(power => [power.id, power]));
  const positionLabels = ['後列', '中列', '前列'];
  const positionNotes = ['後衛グループ', '中衛グループ', '前衛グループ'];
  const MASTER_POWER_COST = 30;
  const GLOBAL_STATS = [
    { key: 'hp', label: 'HP', icon: 'HP.webp' },
    { key: 'patk', label: '物攻', icon: '物理攻撃力.webp' },
    { key: 'matk', label: '魔攻', icon: '魔法攻撃力.webp' },
    { key: 'pdef', label: '物防', icon: '物理防御力.webp' },
    { key: 'mdef', label: '魔防', icon: '魔法防御力.webp' },
    { key: 'crit', label: '会心', icon: '会心.webp' },
    { key: 'critDmg', label: '会心DMG', icon: '会心ダメージ.webp' },
    { key: 'critRes', label: '会心抵抗', icon: '会心抵抗.webp' },
    { key: 'critDmgRes', label: 'DMG抵抗', icon: '会心DMG抵抗.webp' },
    { key: 'spRegen', label: 'SP回復', icon: 'SP回復.webp' }
  ];
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
  const personalityNames = ['純粋', '冷静', '狂気', '活発', '憂鬱'];

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function apostleImagePath(id) {
    return 'img/Chara/' + (assetAliases[id] || id) + '.webp';
  }

  function cardImagePath(card) {
    if (!card) return '';
    const folder = card.kind === 'spell' ? 'Spell' : 'Artifact';
    return 'img/Card/' + folder + '/' + (card.imageFile || (card.name + '.webp'));
  }

  function getRarityClass(card, ownerName = '') {
    if (!card) return '';
    if (card.signature && String(card.favoriteCharacter || '') === String(ownerName || '')) {
      return 'rarity-favorite-equipped';
    }
    if (card.rarity === '伝説') return 'rarity-legendary';
    if (card.rarity === '希少') return 'rarity-unique';
    if (card.rarity === '高級') return 'rarity-rare';
    return card.kind === 'artifact' ? 'rarity-artifact' : '';
  }

  function getRarityBackgroundPath(card, ownerName = '') {
    if (!card || card.kind !== 'artifact') return '';
    if (card.signature && String(card.favoriteCharacter || '') === String(ownerName || '')) {
      return 'img/Card/Card_Signature.webp';
    }
    const backgrounds = {
      '伝説': 'img/Card/Card_Legendary.webp',
      '希少': 'img/Card/Card_Unique.webp',
      '高級': 'img/Card/Card_Rare.webp'
    };
    return backgrounds[card.rarity] || 'img/Card/Card_Rare.webp';
  }

  function getCardCost(card, star) {
    if (!card || star == null) return null;
    if (Array.isArray(card.costByStar) && card.costByStar.length) {
      const numericStar = Number(star);
      if (!Number.isInteger(numericStar) || numericStar < 1 || numericStar > 5) return null;
      return Number(card.costByStar[Math.min(numericStar, card.costByStar.length) - 1]) || 0;
    }
    const cost = Number(card.cost);
    return Number.isFinite(cost) ? cost : null;
  }

  function renderStars(star, label) {
    if (star == null) {
      return '<span class="share-star-unknown" aria-label="' + escapeHtml(label || '★不明') + '">?</span>';
    }
    const count = Number(star);
    if (!Number.isInteger(count) || count < 1 || count > 5) {
      return '<span class="share-star-unknown" aria-label="' + escapeHtml(label || '★不明') + '">?</span>';
    }
    return Array.from({ length: 5 }, (_, index) => (
      '<img src="img/' + (index < count ? 'Grade_on.webp' : 'Grade_off.webp')
      + '" alt="" loading="lazy">'
    )).join('');
  }

  function renderCostBadge(cost, label = 'コスト') {
    const text = cost == null ? '?' : String(cost);
    return [
      '<span class="card-cost-badge" aria-label="', escapeHtml(label + text), '">',
      '<img src="img/Card/cost.webp" alt=""><b>', escapeHtml(text), '</b></span>'
    ].join('');
  }

  function renderSolderBadge(solder) {
    if (solder == null) {
      return '<span class="solder-badge solder-unknown" aria-label="はんだ不明">?</span>';
    }
    if (!Number(solder)) return '';
    return '<span class="solder-badge" aria-label="はんだ+' + escapeHtml(solder) + '">+'
      + escapeHtml(solder) + '</span>';
  }

  function renderEmptyRelic() {
    return '<div class="empty-relic" aria-label="空き遺物枠"><div class="relic-media"></div></div>';
  }

  function renderUnknownCard(entry, kind) {
    const className = kind === 'artifact' ? 'relic-card' : 'support-card';
    const mediaClass = kind === 'artifact' ? 'relic-media' : 'support-card-media';
    return [
      '<div class="', className, ' unknown-card" title="表示データなし">',
      '<div class="', mediaClass, '">',
      '<span class="card-missing">表示データなし<br>', escapeHtml(entry.id), '</span>',
      renderStars(entry.star, '★不明'),
      renderSolderBadge(entry.solder),
      '</div></div>'
    ].join('');
  }

  function renderCard(entry, kind, ownerName = '', count = 1) {
    if (!entry) return kind === 'artifact' ? renderEmptyRelic() : '';
    const card = cardById.get(entry.id);
    if (!card) return renderUnknownCard(entry, kind);
    const rarityClass = getRarityClass(card, ownerName);
    const rarityBackgroundPath = getRarityBackgroundPath(card, ownerName);
    const cost = getCardCost(card, entry.star);
    const title = card.name + (entry.star == null ? ' ★?' : ' ★' + entry.star)
      + (entry.solder > 0 ? ' はんだ+' + entry.solder : '');
    const stars = '<span class="card-stars" aria-label="★'
      + (entry.star == null ? '?' : entry.star) + '">'
      + renderStars(entry.star, card.name + 'の★') + '</span>';
    const extras = [
      renderSolderBadge(entry.solder),
      count > 1 ? '<span class="support-card-count" aria-label="' + escapeHtml(count) + '枚">×'
        + escapeHtml(count) + '</span>' : ''
    ].join('');
    if (kind === 'artifact') {
      return [
        '<div class="relic-card ', rarityClass, '" title="', escapeHtml(title), '">',
        '<div class="relic-media">',
        rarityBackgroundPath ? '<img class="card-rarity-bg" src="' + escapeHtml(rarityBackgroundPath) + '" alt="">' : '',
        renderCostBadge(cost),
        '<img class="card-art" src="', escapeHtml(cardImagePath(card)), '" alt="', escapeHtml(card.name), '">',
        '<span class="card-missing" hidden>画像なし</span>',
        stars,
        extras,
        '</div></div>'
      ].join('');
    }
    return [
      '<div class="support-card ', rarityClass, '" title="', escapeHtml(title), '">',
      '<div class="support-card-media">',
      '<img class="card-art" src="', escapeHtml(cardImagePath(card)), '" alt="', escapeHtml(card.name), '">',
      '<span class="card-missing" hidden>画像なし</span>',
      stars,
      renderCostBadge(cost),
      extras,
      '</div></div>'
    ].join('');
  }

  function renderAsideBadge(asideRank) {
    if (asideRank === 0 || asideRank === undefined) return '';
    if (asideRank === 'notApplicable') {
      return '<span class="aside-badge aside-not-applicable" aria-label="アサイド対象外">—</span>';
    }
    if (asideRank == null) {
      return '<span class="aside-badge aside-unknown" aria-label="アサイド不明">A?</span>';
    }
    return '<span class="aside-badge aside-rank-' + escapeHtml(asideRank)
      + '" aria-label="アサイド' + escapeHtml(asideRank) + '">A' + escapeHtml(asideRank) + '</span>';
  }

  function renderMember(member, relicEntries) {
    const id = member?.id || '';
    const basic = basicById.get(id);
    const name = basic?.使徒名 || id || '空き枠';
    const personality = basic?.性格 || '';
    const personalityClass = personalityNames.includes(personality)
      ? 'personality-' + personality
      : '';
    const memberClass = [
      'share-member',
      personalityClass,
      id ? '' : 'is-empty'
    ].filter(Boolean).join(' ');
    const personalityBadge = basic && personality
      ? '<img class="personality-badge" src="img/性格_' + escapeHtml(personality)
        + '.webp" alt="' + escapeHtml(personality) + '" title="' + escapeHtml(personality) + '">'
      : '';
    const portrait = id
      ? '<img class="apostle-art" src="' + escapeHtml(apostleImagePath(id)) + '" alt="' + escapeHtml(name) + '">'
        + '<span class="portrait-missing" hidden>' + escapeHtml(name) + '</span>'
      : '<span class="portrait-missing">空き枠</span>';
    const memberStars = member
      ? '<span class="member-stars" aria-label="使徒★' + (member.star == null ? '?' : member.star) + '">'
        + renderStars(member.star, name + 'の★') + '</span>'
      : '';
    const relics = Array.from({ length: 3 }, (_, index) => renderCard(
      relicEntries[index] || null,
      'artifact',
      name
    )).join('');
    return [
      '<article class="', memberClass, '" title="', escapeHtml(basic ? [basic.配置列, basic.役割, personality].filter(Boolean).join('・') : '使徒未選択'), '">',
      '<div class="member-row">',
      '<div class="member-apostle"><div class="member-portrait">',
      portrait,
      personalityBadge,
      renderAsideBadge(member?.asideRank),
      memberStars,
      '</div><div class="member-name" title="', escapeHtml(name), '">', escapeHtml(name), '</div></div>',
      '<div class="relic-grid" aria-label="', escapeHtml(name + 'の装備遺物'), '">', relics, '</div>',
      '</div></article>'
    ].join('');
  }

  function renderFormation(snapshot) {
    const target = document.getElementById('formation-grid');
    const rows = [];
    for (let rowIndex = 0; rowIndex < 3; rowIndex += 1) {
      const members = snapshot.members.slice(rowIndex * 3, rowIndex * 3 + 3);
      const relics = snapshot.relicSlots.slice(rowIndex * 9, rowIndex * 9 + 9);
      const filled = members.filter(Boolean).length;
      rows.push([
        '<section class="formation-column" aria-labelledby="position-', rowIndex, '">',
        '<div class="formation-column-head"><strong id="position-', rowIndex, '">',
        positionLabels[rowIndex], '</strong><small>', positionNotes[rowIndex], '・', filled, '/3</small></div>',
        '<div class="formation-column-body">',
        members.map((member, memberIndex) => renderMember(
          member,
          relics.slice(memberIndex * 3, memberIndex * 3 + 3)
        )).join(''),
        '</div></section>'
      ].join(''));
    }
    target.innerHTML = rows.join('');
    bindImageFallbacks(target);
  }

  function getFormationNames(snapshot) {
    const names = new Set();
    snapshot.members.forEach(member => {
      const basic = basicById.get(member?.id || '');
      if (member?.id) names.add(member.id);
      if (basic?.使徒名) names.add(basic.使徒名);
    });
    return names;
  }

  function getCardRarityRank(card) {
    if (!card) return 0;
    if (card.rarity === '伝説') return 4;
    if (card.rarity === '希少') return 3;
    if (card.rarity === '高級') return 2;
    return 1;
  }

  function getSortCost(card) {
    if (!card) return 0;
    if (Array.isArray(card.costByStar) && card.costByStar.length) {
      return Number(card.costByStar[Math.min(5, card.costByStar.length) - 1]) || 0;
    }
    return Number(card.cost) || 0;
  }

  function compareSpellEntries(a, b) {
    const cardA = cardById.get(a.id);
    const cardB = cardById.get(b.id);
    if (cardA && !cardB) return -1;
    if (!cardA && cardB) return 1;
    if (!cardA && !cardB) return a.index - b.index;
    const rarityDiff = getCardRarityRank(cardB) - getCardRarityRank(cardA);
    if (rarityDiff) return rarityDiff;
    const costDiff = getSortCost(cardB) - getSortCost(cardA);
    if (costDiff) return costDiff;
    const nameDiff = String(cardA.name || '').localeCompare(String(cardB.name || ''), 'ja');
    return nameDiff || a.index - b.index;
  }

  function renderSpells(snapshot) {
    const totalCount = snapshot.spells.reduce((total, entry) => total + entry.count, 0);
    document.getElementById('spell-count').textContent = totalCount + '枚・' + snapshot.spells.length + '種類';
    const names = getFormationNames(snapshot);
    const target = document.getElementById('spell-list');
    const entries = snapshot.spells.map((entry, index) => ({ ...entry, index })).sort(compareSpellEntries);
    target.innerHTML = entries.length
      ? entries.map(entry => {
        const card = cardById.get(entry.id);
        const ownerName = card?.favoriteCharacter && names.has(card.favoriteCharacter)
          ? card.favoriteCharacter
          : '';
        return renderCard(entry, 'spell', ownerName, entry.count);
      }).join('')
      : '<p class="empty-support">スペル未選択</p>';
    bindImageFallbacks(target);
  }

  function renderMasterPowers(snapshot) {
    const target = document.getElementById('master-power');
    document.getElementById('power-count').textContent = snapshot.powers.length + '件';
    target.innerHTML = snapshot.powers.length
      ? '<div class="master-power-stack">' + snapshot.powers.map(id => {
        const power = powerById.get(id);
        if (!power) {
          return '<div class="master-power-name-card unknown-card"><strong>'
            + escapeHtml(id) + '</strong></div>';
        }
        const name = power['権能名'] || power.id;
        const imagePath = 'img/Card/権能_' + name + '.webp';
        return [
          '<div class="master-power-name-card" title="', escapeHtml(name), '" aria-label="教主の権能 ',
          escapeHtml(name), '"><div class="master-power-media">',
          '<img class="master-power-art" src="', escapeHtml(imagePath), '" alt="', escapeHtml(name), '">',
          '<span class="power-fallback" hidden>画像なし</span>',
          renderCostBadge(MASTER_POWER_COST),
          '</div><strong>', escapeHtml(name), '</strong></div>'
        ].join('');
      }).join('') + '</div>'
      : '<p class="empty-support">権能未選択</p>';
    bindImageFallbacks(target);
  }

  function formatPercent(value) {
    return Number(value).toLocaleString('ja-JP', { maximumFractionDigits: 3 });
  }

  function renderGlobalEnhancements(snapshot) {
    const panel = document.getElementById('global-enhancement-panel');
    const target = document.getElementById('global-enhancement-list');
    if (snapshot.globalPercent == null) {
      panel.hidden = true;
      target.innerHTML = '';
      return;
    }
    panel.hidden = false;
    const rows = GLOBAL_STATS.map((stat, index) => {
      const value = snapshot.globalPercent[index];
      if (value == null) {
        return [
          '<tr><th scope="row"><span class="global-enhancement-stat-label"><img src="img/',
          escapeHtml(stat.icon), '" alt="">', escapeHtml(stat.label),
          '</span></th><td><strong>?</strong></td></tr>'
        ].join('');
      }
      if (value === 0) return '';
      return [
        '<tr><th scope="row"><span class="global-enhancement-stat-label"><img src="img/',
        escapeHtml(stat.icon), '" alt="">', escapeHtml(stat.label),
        '</span></th><td><strong>+', escapeHtml(formatPercent(value)), '%</strong></td></tr>'
      ].join('');
    }).filter(Boolean).join('');
    target.innerHTML = [
      '<article class="global-enhancement-source"><div class="global-enhancement-source-head">',
      '<strong>全体補正</strong><small>共有値</small></div>',
      rows ? '<table class="global-enhancement-table"><thead><tr><th scope="col">ステータス</th><th scope="col">補正値</th></tr></thead><tbody>' + rows + '</tbody></table>'
        : '<p class="empty-support">補正なし</p>',
      '</article>'
    ].join('');
  }

  function renderTotalCost(snapshot) {
    let total = 0;
    let unknown = false;
    const addCardCost = entry => {
      if (!entry) return;
      const card = cardById.get(entry.id);
      const cost = getCardCost(card, entry.star);
      const count = Number(entry.count || 1);
      if (cost == null || !Number.isFinite(count)) {
        unknown = true;
        return;
      }
      total += cost * count;
    };
    snapshot.relicSlots.forEach(addCardCost);
    snapshot.spells.forEach(addCardCost);
    total += snapshot.powers.length * MASTER_POWER_COST;
    const target = document.getElementById('formation-total-cost');
    const text = unknown ? '?' : String(total);
    target.innerHTML = '<span>総合コスト</span><span class="formation-total-cost-value">'
      + '<img src="img/Card/cost.webp" alt=""><strong>' + escapeHtml(text) + '</strong></span>';
    target.title = unknown
      ? '★不明のカードがあるため総合コストは未確定です'
      : '遺物・スペル・権能の総合コスト ' + total;
    target.setAttribute('aria-label', target.title);
  }

  function bindImageFallbacks(root) {
    root?.querySelectorAll('img.apostle-art, img.card-art, img.skill-art, img.master-power-art').forEach(image => {
      image.addEventListener('error', () => {
        image.hidden = true;
        const fallback = image.parentElement?.querySelector(
          '.portrait-missing, .card-missing, .power-fallback'
        );
        if (fallback) fallback.hidden = false;
      }, { once: true });
    });
  }

  function setupTheme() {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const update = () => {
      const light = document.documentElement.dataset.theme === 'light';
      button.setAttribute('aria-pressed', String(!light));
      const label = button.querySelector('.theme-button-label');
      if (label) label.textContent = light ? 'ダーク' : 'ライト';
    };
    button.addEventListener('click', () => {
      document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'light'
        ? 'dark'
        : 'light';
      update();
    });
    update();
  }

  function renderError(error) {
    const content = document.getElementById('share-content');
    const panel = document.getElementById('share-error');
    const message = document.getElementById('share-error-message');
    content.hidden = true;
    panel.hidden = false;
    message.textContent = error?.name === 'FormationShareCodecError'
      ? '共有URLが不正か、対応していない形式です。リンクを作り直してください。'
      : '共有編成の読み込みに失敗しました。リンクを作り直してください。';
  }

  function renderFromHash() {
    const content = document.getElementById('share-content');
    const panel = document.getElementById('share-error');
    if (!window.location.hash) {
      renderError(new Error('共有URLがありません'));
      return;
    }
    try {
      const result = CODEC.decodeHash(window.location.hash);
      content.hidden = false;
      panel.hidden = true;
      renderFormation(result.snapshot);
      renderSpells(result.snapshot);
      renderMasterPowers(result.snapshot);
      renderTotalCost(result.snapshot);
      renderGlobalEnhancements(result.snapshot);
    } catch (error) {
      renderError(error);
    }
  }

  if (!DATA || !CODEC) {
    renderError(new Error('共有画面のデータを読み込めませんでした'));
  } else {
    setupTheme();
    renderFromHash();
    window.addEventListener('hashchange', renderFromHash);
  }
})();
