(() => {
  'use strict';

  const DISPLAY_DATA = window.TRICKCAL_FORMATION_SHARE_DISPLAY_DATA;
  const CODEC = window.TRICKCAL_FORMATION_SHARE_CODEC;
  const basicById = new Map(Object.entries(DISPLAY_DATA?.apostles || {}));
  const cardById = new Map([
    ...Object.entries(DISPLAY_DATA?.artifacts || {}).map(([id, card]) => [id, { ...card, id, kind: 'artifact' }]),
    ...Object.entries(DISPLAY_DATA?.spells || {}).map(([id, card]) => [id, { ...card, id, kind: 'spell' }])
  ]);
  const powerById = new Map(Object.entries(DISPLAY_DATA?.masterPowers || {})
    .map(([id, power]) => [id, { ...power, id }]));
  const assetByPath = new Map(Object.entries(DISPLAY_DATA?.assets || {}));
  const publicSite = window.TRICKCAL_PUBLIC_SITE;
  const positionLabels = ['後列', '中列', '前列'];
  const GLOBAL_STATS = [
    { key: 'hp', label: 'HP', icon: 'HP.webp' },
    { key: 'patk', label: '物攻', icon: '物理攻撃力.webp' },
    { key: 'matk', label: '魔攻', icon: '魔法攻撃力.webp' },
    { key: 'pdef', label: '物防', icon: '物理防御力.webp' },
    { key: 'mdef', label: '魔防', icon: '魔法防御力.webp' },
    { key: 'crit', label: '会心', icon: '会心.webp' },
    { key: 'critDmg', label: '会心DMG', icon: '会心ダメージ.webp' },
    { key: 'critRes', label: '会心抵抗', icon: '会心抵抗.webp' },
    { key: 'critDmgRes', label: '会心DMG抵抗', icon: '会心DMG抵抗.webp' },
    { key: 'spRegen', label: 'SP回復', icon: 'SP回復.webp' }
  ];
  // 共有対象は全体%補正のみ。SP回復は%補正ではないため表示しない。
  const GLOBAL_STAT_GROUPS = [
    { label: 'HP', indices: [0] },
    { label: '攻撃', indices: [1, 2] },
    { label: '防御', indices: [3, 4] },
    { label: '会心', indices: [5, 6] },
    { label: '会心抵抗', indices: [7, 8] }
  ];
  const personalityNames = ['共鳴', '純粋', '冷静', '狂気', '活発', '憂鬱'];

  function splitAssetReference(value) {
    const text = String(value || '');
    const separatorIndex = text.search(/[?#]/);
    if (separatorIndex < 0) return { path: text, query: '', hash: '' };
    const path = text.slice(0, separatorIndex);
    const suffix = text.slice(separatorIndex);
    const hashIndex = suffix.indexOf('#');
    return {
      path,
      query: hashIndex >= 0 ? suffix.slice(0, hashIndex) : suffix,
      hash: hashIndex >= 0 ? suffix.slice(hashIndex) : ''
    };
  }

  function shareAssetPath(relativePath) {
    const mapped = assetByPath.get(relativePath) || relativePath;
    if (!mapped) return '';
    if (!publicSite?.assetUrl) return mapped;
    if (/^(?:data|blob|https?):/i.test(mapped) || mapped.startsWith('//') || mapped.startsWith('#')) {
      return publicSite.assetUrl(mapped);
    }
    const { path, query, hash } = splitAssetReference(mapped);
    return publicSite.assetUrl(path, { query, hash });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function apostleImagePath(id) {
    return shareAssetPath(basicById.get(id)?.imagePath || 'img/Chara/' + id + '.webp');
  }

  function cardImagePath(card) {
    if (!card) return '';
    if (card.imagePath) return shareAssetPath(card.imagePath);
    const folder = card.kind === 'spell' ? 'Spell' : 'Artifact';
    return shareAssetPath('img/Card/' + folder + '/' + (card.imageFile || (card.name + '.webp')));
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
      return shareAssetPath('img/Card/Card_Signature.webp');
    }
    const backgrounds = {
      '伝説': 'img/Card/Card_Legendary.webp',
      '希少': 'img/Card/Card_Unique.webp',
      '高級': 'img/Card/Card_Rare.webp'
    };
    return shareAssetPath(backgrounds[card.rarity] || 'img/Card/Card_Rare.webp');
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
      '<img src="' + shareAssetPath('img/' + (index < count ? 'Grade_on.webp' : 'Grade_off.webp'))
      + '" alt="" loading="lazy">'
    )).join('');
  }

  function renderCostBadge(cost, label = 'コスト') {
    const text = cost == null ? '?' : String(cost);
    return [
      '<span class="card-cost-badge" aria-label="', escapeHtml(label + text), '">',
      '<img src="', escapeHtml(shareAssetPath('img/Card/cost.webp')), '" alt=""><b>', escapeHtml(text), '</b></span>'
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

  function renderMember(member, relicEntries, slotIndex, snapshot) {
    const id = member?.id || '';
    const basic = basicById.get(id);
    const name = basic?.name || id || '空き枠';
    const selectedPersonality = snapshot.v >= 2
      ? snapshot.resonancePersonalities?.[slotIndex] || ''
      : '';
    const resolution = basic
      ? window.TRICKCAL_FORMATION_PERSONALITY.resolveFormationPersonality(basic, selectedPersonality)
      : null;
    const needsSelection = !!resolution?.needsSelection;
    const personality = resolution?.effectivePersonality || (resolution?.isSelectable ? '' : basic?.personality || '');
    const status = resolution?.invalidSelection
      ? `旧選択：${selectedPersonality}／現在の候補外` : needsSelection ? '性格未選択' : '';
    const personalityClass = personalityNames.includes(personality)
      ? 'personality-' + personality
      : '';
    const memberClass = [
      'share-member',
      personalityClass,
      id ? '' : 'is-empty'
    ].filter(Boolean).join(' ');
    const personalityBadge = basic && personality
      ? '<img class="personality-badge" src="' + escapeHtml(shareAssetPath('img/性格_' + personality + '.webp'))
        + '" alt="' + escapeHtml(personality) + '" title="' + escapeHtml(personality) + '">'
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
      '<article class="', memberClass, '" title="', escapeHtml(basic
        ? [basic.position, basic.role, status || personality].filter(Boolean).join('・')
        : '使徒未選択'), '">',
      status ? '<p class="share-personality-status" style="margin:0 0 4px;font-size:.68rem;font-weight:800;color:var(--share-text)">' + escapeHtml(status) + '</p>' : '',
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
        positionLabels[rowIndex], '</strong><span class="formation-column-count" aria-label="編成人数 ',
        filled, '/3">', filled, '/3</span></div>',
        '<div class="formation-column-body">',
        members.map((member, memberIndex) => renderMember(
          member,
          relics.slice(memberIndex * 3, memberIndex * 3 + 3),
          rowIndex * 3 + memberIndex,
          snapshot
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
      if (basic?.name) names.add(basic.name);
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
        const name = power.name || power.id;
        const imagePath = shareAssetPath(power.imagePath || '');
        return [
          '<div class="master-power-name-card" title="', escapeHtml(name), '" aria-label="教主の権能 ',
          escapeHtml(name), '"><div class="master-power-media">',
          '<img class="master-power-art" src="', escapeHtml(imagePath), '" alt="', escapeHtml(name), '">',
          '<span class="power-fallback" hidden>画像なし</span>',
          renderCostBadge(power.cost),
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
    const renderValue = index => {
      const stat = GLOBAL_STATS[index];
      const value = snapshot.globalPercent[index];
      if (value == null) {
        return [
          '<div class="global-enhancement-value" role="listitem"><span class="global-enhancement-stat-label"><img src="',
          escapeHtml(shareAssetPath('img/' + stat.icon)), '" alt="">', escapeHtml(stat.label),
          '</span><strong>?</strong></div>'
        ].join('');
      }
      if (value === 0) return '';
      return [
        '<div class="global-enhancement-value" role="listitem"><span class="global-enhancement-stat-label"><img src="',
        escapeHtml(shareAssetPath('img/' + stat.icon)), '" alt="">', escapeHtml(stat.label),
        '</span><strong>+', escapeHtml(formatPercent(value)), '%</strong></div>'
      ].join('');
    };
    const groups = GLOBAL_STAT_GROUPS.map(group => {
      const values = group.indices.map(renderValue).filter(Boolean).join('');
      if (!values) return '';
      return [
        '<div class="global-enhancement-group" role="listitem">',
        '<strong class="global-enhancement-group-head">', escapeHtml(group.label), '</strong>',
        '<div class="global-enhancement-group-values" role="list">', values, '</div>',
        '</div>'
      ].join('');
    }).filter(Boolean).join('');
    target.innerHTML = [
      '<article class="global-enhancement-source"><div class="global-enhancement-source-head">',
      '<strong>全体補正</strong><small>共有値</small></div>',
      groups ? '<div class="global-enhancement-values" role="list" aria-label="全体補正値">' + groups + '</div>'
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
    snapshot.powers.forEach(id => {
      const power = powerById.get(id);
      if (!power || !Number.isFinite(Number(power.cost))) {
        unknown = true;
        return;
      }
      total += Number(power.cost);
    });
    const target = document.getElementById('formation-total-cost');
    const text = unknown ? '?' : String(total);
    target.innerHTML = '<span>総合コスト</span><span class="formation-total-cost-value">'
      + '<img src="' + escapeHtml(shareAssetPath('img/Card/cost.webp')) + '" alt=""><strong>' + escapeHtml(text) + '</strong></span>';
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
      const result = CODEC.decodeHash(window.location.hash, { displayData: DISPLAY_DATA });
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

  if (!DISPLAY_DATA || !CODEC) {
    renderError(new Error('共有画面のデータを読み込めませんでした'));
  } else {
    renderFromHash();
    window.addEventListener('hashchange', renderFromHash);
  }
})();
