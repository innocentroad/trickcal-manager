(() => {
  'use strict';

  const sourceData = window.TRICKCAL_STAT_DATA?.sheets?.lifeJobs;
  const eligibleApostleNames = new Set((sourceData?.apostles || []).map(apostle => apostle?.name).filter(Boolean));
  const data = sourceData ? {
    ...sourceData,
    resumeMaterialSlots: (sourceData.resumeMaterialSlots || [])
      .filter(slot => eligibleApostleNames.has(slot?.apostleName))
  } : null;
  const sheets = window.TRICKCAL_STAT_DATA?.sheets;
  const elements = {
    tabs: [...document.querySelectorAll('[data-life-jobs-view]')],
    search: document.getElementById('life-jobs-search'),
    searchCaption: document.getElementById('life-jobs-search-caption'),
    count: document.getElementById('life-jobs-count'),
    list: document.getElementById('life-jobs-list'),
    detail: document.getElementById('life-jobs-detail'),
    tooltip: document.getElementById('life-jobs-material-tooltip')
  };
  const numberFormat = new Intl.NumberFormat('ja-JP');
  const roleLabels = { main: 'メイン', normal: '履歴書素材' };
  const materialsById = new Map((data?.materials || []).map(item => [item.id, item]));
  const apostlesByName = new Map((data?.apostles || []).map(apostle => [apostle.name, apostle]));
  const params = new URLSearchParams(location.search);
  const state = {
    view: params.get('view') === 'apostle' || (!params.has('view') && params.has('apostle')) ? 'apostle' : 'material',
    materialName: params.get('material') || '',
    apostleName: params.get('apostle') || '',
    query: ''
  };
  let tooltipTarget = null;
  let tooltipPinned = false;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function assetUrl(path) {
    try {
      return window.TRICKCAL_PUBLIC_SITE?.assetUrl?.(path) || `../${path}`;
    } catch (_) {
      return `../${path}`;
    }
  }

  function materialByName(name) {
    return (data?.materials || []).find(item => item.name === name);
  }

  function resumeSlots() {
    return Array.isArray(data?.resumeMaterialSlots) ? data.resumeMaterialSlots : [];
  }

  function renderMaterialLayers(material, { quantity = '', categories = [], compact = false } = {}) {
    const name = material?.name || '素材名未登録';
    const grade = Number(material?.itemGrade);
    const slot = Number.isInteger(grade) && grade >= 1 && grade <= 5
      ? `ItemSlot_${grade}.png` : '';
    const background = slot
      ? `<img class="life-jobs-slot" src="${escapeHtml(assetUrl(`img/Slot/${slot}`))}" alt="" aria-hidden="true" loading="lazy">`
      : '';
    const image = material?.imageFileName
      ? `<img class="life-jobs-item-image" src="${escapeHtml(assetUrl(`img/Materials/${material.imageFileName}`))}" alt="" aria-hidden="true" loading="lazy">`
      : '';
    const amount = quantity === '' || quantity == null ? ''
      : `<span class="life-jobs-quantity">${escapeHtml(quantity)}</span>`;
    const roleClass = categories.includes('main') ? ' is-main' : '';
    const compactClass = compact ? ' is-compact' : '';
    return `<span class="life-jobs-material-icon${roleClass}${compactClass}" data-life-job-material="${escapeHtml(name)}" aria-label="${escapeHtml(name)}">${background}${image}${amount}</span>`;
  }

  function renderApostleIcon(apostleName) {
    const apostle = apostlesByName.get(apostleName);
    const assetId = apostle?.assetId;
    const image = assetId
      ? `<img src="${escapeHtml(assetUrl(`img/Chara/${assetId}.webp`))}" alt="" loading="lazy">`
      : '<span class="life-jobs-no-portrait" aria-hidden="true">人</span>';
    return `<span class="life-jobs-apostle-identity">${image}<span>${escapeHtml(apostleName)}</span></span>`;
  }

  function sourceLabel(slot) {
    return (slot.sources || []).map(source => source === 'job' ? '仕事' : '休息').join('・');
  }

  function updateLocation(method = 'pushState') {
    const next = new URLSearchParams(location.search);
    next.delete('view');
    next.delete('material');
    next.delete('apostle');
    if (state.materialName) next.set('material', state.materialName);
    if (state.apostleName) next.set('apostle', state.apostleName);
    if (state.view === 'apostle' || state.apostleName) next.set('view', state.view);
    const query = next.toString();
    history[method]({}, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
  }

  function syncFromLocation() {
    const current = new URLSearchParams(location.search);
    state.materialName = current.get('material') || '';
    state.apostleName = current.get('apostle') || '';
    state.view = current.get('view') === 'apostle'
      || (!current.has('view') && current.has('apostle') && !current.has('material')) ? 'apostle' : 'material';
    state.query = '';
    elements.search.value = '';
    render();
  }

  function renderTabs() {
    for (const tab of elements.tabs) {
      const selected = tab.dataset.lifeJobsView === state.view;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    elements.searchCaption.textContent = state.view === 'material' ? '素材名で検索' : '使徒名で検索';
    elements.search.placeholder = state.view === 'material' ? '素材名' : '使徒名';
    elements.list.setAttribute('aria-label', state.view === 'material' ? '素材一覧' : '使徒一覧');
  }

  function renderSelector() {
    const query = state.query.trim().toLocaleLowerCase('ja');
    if (state.view === 'material') {
      const entries = (data.materials || []).filter(item => !query || item.name.toLocaleLowerCase('ja').includes(query));
      elements.count.textContent = `${numberFormat.format(entries.length)} / ${numberFormat.format(data.materials.length)}素材`;
      elements.list.innerHTML = entries.map(material => {
        const selected = material.name === state.materialName;
        return `<button type="button" class="life-jobs-choice life-jobs-material-choice" data-select-material="${escapeHtml(material.name)}" aria-pressed="${selected}" title="${escapeHtml(material.name)}">${renderMaterialLayers(material, { compact: true })}<span>${escapeHtml(material.name)}</span></button>`;
      }).join('') || '<p class="life-jobs-empty">素材が見つかりません。</p>';
      return;
    }
    const entries = (data.apostles || []).filter(item => !query || item.name.toLocaleLowerCase('ja').includes(query));
    elements.count.textContent = `${numberFormat.format(entries.length)} / ${numberFormat.format(data.apostles.length)}使徒`;
    elements.list.innerHTML = entries.map(apostle => {
      const selected = apostle.name === state.apostleName;
      return `<button type="button" class="life-jobs-choice life-jobs-apostle-list-choice" data-select-apostle="${escapeHtml(apostle.name)}" aria-pressed="${selected}" title="${escapeHtml(apostle.name)}">${apostle.assetId ? `<img src="${escapeHtml(assetUrl(`img/Chara/${apostle.assetId}.webp`))}" alt="" loading="lazy">` : '<span class="life-jobs-no-portrait" aria-hidden="true">人</span>'}<span>${escapeHtml(apostle.name)}</span></button>`;
    }).join('') || '<p class="life-jobs-empty">使徒が見つかりません。</p>';
  }

  function renderMaterialView() {
    const material = materialByName(state.materialName);
    if (!material) {
      elements.detail.innerHTML = state.materialName
        ? `<p class="life-jobs-empty">「${escapeHtml(state.materialName)}」に一致する登録素材がありません。</p>`
        : '<p class="life-jobs-empty">素材を選択してください。</p>';
      return;
    }
    const slots = resumeSlots().filter(slot => slot.materialId === material.id)
      .sort((a, b) => Number(b.isBest) - Number(a.isBest) || a.apostleName.localeCompare(b.apostleName, 'ja'));
    const groups = [true, false].map(isBest => {
      const matching = slots.filter(slot => slot.isBest === isBest);
      if (!matching.length) return '';
      return `<section class="life-jobs-role-group role-${isBest ? 'main' : 'normal'}"><h3>${isBest ? 'メイン' : 'その他の履歴書素材'}</h3><div class="life-jobs-role-entries">${matching.map(slot => {
        return `<button type="button" class="life-jobs-apostle-result${isBest ? ' is-main' : ''}" data-choose-apostle="${escapeHtml(slot.apostleName)}" aria-label="${escapeHtml(`${slot.apostleName}、${isBest ? 'メイン素材' : '履歴書素材'}、入手元：${sourceLabel(slot)}`)}" title="${escapeHtml(`入手元：${sourceLabel(slot)}`)}">${renderApostleIcon(slot.apostleName)}<small>${escapeHtml(sourceLabel(slot))}</small></button>`;
      }).join('')}</div></section>`;
    }).join('');
    elements.detail.innerHTML = `<header class="life-jobs-selected-heading">${renderMaterialLayers(material)}<div><h2>${escapeHtml(material.name)}</h2><p>登録済みの履歴書素材</p></div></header>`
      + `<div class="life-jobs-results-summary">${numberFormat.format(slots.length)}人</div>${groups || '<p class="life-jobs-empty">登録済みの履歴書素材に該当なし</p>'}`;
  }

  function renderApostleView() {
    const apostle = apostlesByName.get(state.apostleName);
    if (!apostle) {
      elements.detail.innerHTML = state.apostleName
        ? '<p class="life-jobs-empty">登録済みの使徒が見つかりません。</p>'
        : '<p class="life-jobs-empty">使徒を選択してください。</p>';
      return;
    }
    const slots = resumeSlots().filter(slot => slot.apostleName === apostle.name)
      .sort((a, b) => a.order - b.order);
    const renderApostleEntry = slot => {
      const material = materialsById.get(slot.materialId);
      if (!material) return '';
      const role = slot.isBest ? 'main' : 'normal';
      return `<button type="button" class="life-jobs-material-result" data-choose-material="${escapeHtml(material.name)}" data-material-name="${escapeHtml(material.name)}" aria-label="${escapeHtml(`${roleLabels[role]}：${material.name}、入手元：${sourceLabel(slot)}`)}" title="${escapeHtml(`${material.name}・入手元：${sourceLabel(slot)}`)}">${renderMaterialLayers(material, { categories: [role] })}<small>${escapeHtml(sourceLabel(slot))}</small></button>`;
    };
    const upperCount = Math.ceil(slots.length / 2);
    const rows = slots.length ? `<div class="life-jobs-resume-layout" aria-label="履歴書素材。左から表示順">
      <div class="life-jobs-resume-row">${slots.slice(0, upperCount).map(renderApostleEntry).join('')}</div>
      <div class="life-jobs-resume-row">${slots.slice(upperCount).map(renderApostleEntry).join('')}</div>
    </div>` : '';
    const portrait = apostle.assetId
      ? `<img src="${escapeHtml(assetUrl(`img/Chara/${apostle.assetId}.webp`))}" alt="" loading="lazy">`
      : '<span class="life-jobs-no-portrait" aria-hidden="true">人</span>';
    elements.detail.innerHTML = `<header class="life-jobs-selected-heading">${portrait}<div><h2>${escapeHtml(apostle.name)}</h2><p>登録済みの履歴書素材</p></div></header>`
      + `<div class="life-jobs-results-summary">${numberFormat.format(slots.length)}素材・緑枠はメイン素材</div>`
      + (rows || '<p class="life-jobs-empty">登録済みの履歴書素材はありません。</p>');
  }

  function render() {
    renderTabs();
    renderSelector();
    if (state.view === 'material') renderMaterialView();
    else renderApostleView();
  }

  function chooseMaterial(name, { view = 'material', push = true } = {}) {
    state.materialName = name;
    state.view = view;
    updateLocation(push ? 'pushState' : 'replaceState');
    render();
  }

  function chooseApostle(name, { view = 'apostle', push = true } = {}) {
    state.apostleName = name;
    state.view = view;
    updateLocation(push ? 'pushState' : 'replaceState');
    render();
  }

  function showTooltip(target, pin = false) {
    if (!target || !elements.tooltip) return;
    tooltipTarget = target;
    tooltipPinned = pin;
    elements.tooltip.textContent = target.dataset.lifeJobMaterial || '';
    elements.tooltip.hidden = false;
    const rect = target.getBoundingClientRect();
    const tip = elements.tooltip.getBoundingClientRect();
    const left = Math.max(8, Math.min(innerWidth - tip.width - 8, rect.left + (rect.width - tip.width) / 2));
    const above = rect.top - tip.height - 8;
    const top = above >= 8 ? above : Math.min(innerHeight - tip.height - 8, rect.bottom + 8);
    elements.tooltip.style.left = `${left}px`;
    elements.tooltip.style.top = `${Math.max(8, top)}px`;
  }

  function hideTooltip(force = false) {
    if (tooltipPinned && !force) return;
    if (!force && tooltipTarget && document.activeElement?.contains(tooltipTarget)) return;
    elements.tooltip.hidden = true;
    tooltipTarget = null;
    tooltipPinned = false;
  }

  if (!data || data.schemaVersion !== 5 || !Array.isArray(data.materials)
    || !Array.isArray(data.apostles) || !Array.isArray(data.resumeMaterialSlots)) {
    elements.detail.innerHTML = '<p class="life-jobs-error">アルバイトデータを読み込めません。生成済みデータを確認してください。</p>';
    elements.list.textContent = 'データなし';
    return;
  }

  for (const tab of elements.tabs) {
    tab.addEventListener('click', () => {
      state.view = tab.dataset.lifeJobsView;
      updateLocation();
      render();
    });
  }
  elements.search.addEventListener('input', () => {
    state.query = elements.search.value;
    renderSelector();
  });
  elements.list.addEventListener('click', event => {
    const material = event.target.closest('[data-select-material]');
    const apostle = event.target.closest('[data-select-apostle]');
    if (material) chooseMaterial(material.dataset.selectMaterial);
    else if (apostle) chooseApostle(apostle.dataset.selectApostle);
  });
  elements.detail.addEventListener('click', event => {
    const material = event.target.closest('[data-choose-material]');
    const apostle = event.target.closest('[data-choose-apostle]');
    if (material) chooseMaterial(material.dataset.chooseMaterial);
    else if (apostle) chooseApostle(apostle.dataset.chooseApostle);
  });
  window.addEventListener('popstate', syncFromLocation);
  document.addEventListener('pointerover', event => {
    const target = event.target.closest?.('[data-life-job-material]');
    if (target && !tooltipPinned) showTooltip(target);
  });
  document.addEventListener('pointerout', event => {
    if (!tooltipPinned && !event.relatedTarget?.closest?.('[data-life-job-material]')) hideTooltip();
  });
  document.addEventListener('focusin', event => {
    const target = event.target.closest?.('[data-life-job-material]')
      || event.target.querySelector?.('[data-life-job-material]');
    if (target) {
      const owner = event.target;
      requestAnimationFrame(() => {
        if (document.activeElement === owner) showTooltip(target);
      });
    }
  });
  document.addEventListener('focusout', event => {
    const next = event.relatedTarget;
    if (!tooltipPinned && !next?.closest?.('[data-life-job-material]')
      && !next?.querySelector?.('[data-life-job-material]')) hideTooltip();
  });
  document.addEventListener('click', event => {
    const target = event.target.closest?.('[data-life-job-material]');
    if (target) {
      showTooltip(target, !(tooltipPinned && tooltipTarget === target));
      if (!tooltipPinned) hideTooltip(true);
      return;
    }
    hideTooltip(true);
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hideTooltip(true); });

  render();
})();
