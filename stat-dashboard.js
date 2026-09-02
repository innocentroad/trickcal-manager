(() => {
  'use strict';

  const viewButtons = Array.from(document.querySelectorAll('[data-dashboard-view]'));
  const panels = Array.from(document.querySelectorAll('[data-dashboard-panel]'));
  const railButtons = Array.from(document.querySelectorAll('.dashboard-rail [data-dashboard-view]'));
  const globalButtons = Array.from(document.querySelectorAll('[data-open-global]'));
  const globalTabs = Array.from(document.querySelectorAll('#global-setting-tabs [data-setting-tab]'));
  const profileTopButton = document.querySelector('[data-dashboard-profile-top]');
  const topGlobalMenu = document.querySelector('.dashboard-top-tabs .topbar-global-menu');
  const bulkGlobalTabs = new Set(['apostles', 'rank', 'bond', 'aside', 'research']);
  const apostleSelect = document.getElementById('apostle-select');
  const bottomApostleButton = document.querySelector('.bottom-apostle-button');
  const bottomApostleImage = document.getElementById('bottom-apostle-image');
  const bottomApostleName = document.getElementById('bottom-apostle-name');
  const bottomSaveMenu = document.querySelector('.bottom-save-menu');
  const asideSettings = document.querySelector('.aside-settings');
  const asideSettingIcon = document.getElementById('aside-setting-icon');
  const asideRankSelect = document.getElementById('aside-rank-select');
  const asideLevelSelect = document.getElementById('aside-level-select');
  const skillIcons = {
    F: document.getElementById('low-skill-icon'),
    S: document.getElementById('high-skill-icon'),
    P: document.getElementById('passive-skill-icon')
  };
  const personalityToneMap = {
    '純粋': 'pure',
    '冷静': 'calm',
    '狂気': 'madness',
    '活発': 'active',
    '憂鬱': 'gloomy'
  };
  const personalityToneClasses = Object.values(personalityToneMap).map(tone => `personality-${tone}`);
  const apostleAssetAliases = {
    ED: 'Ed',
    Cuee: 'Kyuri',
    Kyui: 'Kyuri',
    Kyuui: 'Kyuri',
    Kiwi: 'Kyuri',
    Lazy: 'Layze',
    Razy: 'Layze',
    Reizy: 'Layze',
    Rudd: 'Rude',
    Selline: 'Selene',
    Shady: 'Shaydi',
    RenewaAwaken: 'Renewa',
    Sion: 'Xion',
    sion: 'Xion',
    xion: 'Xion',
    xXionx: 'Xion'
  };

  function showView(name) {
    panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.dashboardPanel === name));
    railButtons.forEach(button => button.classList.toggle('is-active', button.dataset.dashboardView === name));
    if (name !== 'global') setTopGlobalActive('');
  }

  function setTopGlobalActive(tabName = '') {
    topGlobalMenu?.classList.toggle('is-active', bulkGlobalTabs.has(tabName));
  }

  function scrollToDashboardMain(behavior = 'smooth') {
    window.requestAnimationFrame(() => {
      document.querySelector('.dashboard-main')?.scrollIntoView({ block: 'start', inline: 'nearest', behavior });
    });
  }

  function scrollToProfile(behavior = 'smooth') {
    window.requestAnimationFrame(() => {
      document.querySelector('.dashboard-persistent-profile')?.scrollIntoView({ block: 'start', inline: 'nearest', behavior });
    });
  }

  function openGlobal(tabName) {
    showView('global');
    const tab = globalTabs.find(button => button.dataset.settingTab === tabName);
    if (tab) tab.click();
    setTopGlobalActive(tabName);
  }

  function openCardManager(kind) {
    const safeKind = kind === 'spell' ? 'spell' : 'artifact';
    openGlobal('cards');
    document.querySelector(`[data-card-kind="${safeKind}"]`)?.click();
  }

  function applyInitialRoute() {
    const params = new URLSearchParams(window.location.search);
    const card = params.get('card');
    const global = params.get('global');
    const routeView = params.get('view');
    if (card) {
      openCardManager(card);
      scrollToDashboardMain('auto');
    } else if (global) {
      openGlobal(global);
      scrollToDashboardMain('auto');
    } else if (routeView) {
      showView(routeView);
      if (routeView === 'settings') scrollToProfile('auto');
      else scrollToDashboardMain('auto');
    }
  }

  function syncBottomApostle() {
    const sourceName = document.getElementById('apostle-name');
    const apostleId = apostleSelect.value;
    const basicInfo = typeof TRICKCAL_STAT_DATA === 'undefined'
      ? null
      : TRICKCAL_STAT_DATA.sheets.basicInfo.find(row => row.id === apostleId);
    const personalityTone = personalityToneMap[basicInfo?.性格];
    const apostleName = String(basicInfo?.使徒名 || basicInfo?.id || sourceName.textContent || '使徒選択').trim();
    const assetId = apostleAssetAliases[apostleId] || apostleId;

    bottomApostleImage.dataset.fallback = 'false';
    bottomApostleImage.src = assetId ? `img/Chara/${assetId}.webp` : 'img/Chara/null.webp';
    bottomApostleImage.alt = apostleName;
    bottomApostleName.textContent = apostleName;
    bottomApostleButton.classList.remove(...personalityToneClasses);
    if (personalityTone) bottomApostleButton.classList.add(`personality-${personalityTone}`);
    syncAsideAvailability(apostleSelect.value, apostleName);
    syncSkillIcons(apostleSelect.value, apostleName);
  }

  function syncAsideAvailability(apostleId, apostleName) {
    const sheets = typeof TRICKCAL_STAT_DATA === 'undefined' ? {} : TRICKCAL_STAT_DATA.sheets;
    const checker = window.TRICKCAL_PUBLIC_RELEASE?.isAsideEnabled;
    const isPublicAsideEnabled = typeof checker !== 'function' || checker(apostleId);
    const hasAside = isPublicAsideEnabled && ['asideStatEffects', 'asideSpecialEffects'].some(sheetName =>
      (sheets[sheetName] || []).some(row => row.id === apostleId)
    );

    asideSettings.classList.toggle('is-unavailable', !hasAside);
    asideRankSelect.disabled = !hasAside;
    if (!hasAside) asideLevelSelect.disabled = true;

    const assetId = apostleAssetAliases[apostleId] || apostleId;
    resetAsideSettingIconFallback();
    asideSettingIcon.alt = hasAside ? `${apostleName} アサイド` : '';
    asideSettingIcon.onload = resetAsideSettingIconFallback;
    asideSettingIcon.src = hasAside ? `img/Chara/Aside/AsideIcon_${assetId}.webp` : '';
  }

  function resetAsideSettingIconFallback() {
    if (!asideSettingIcon) return;
    asideSettingIcon.hidden = false;
    asideSettingIcon.classList.remove('is-aside-image-missing');
    const wrapper = asideSettingIcon.closest('[data-aside-image-wrap]');
    wrapper?.classList.remove('is-aside-image-fallback');
    const label = wrapper?.querySelector('[data-aside-image-fallback-label]');
    if (label) label.hidden = true;
  }

  function syncSkillIcons(apostleId, apostleName) {
    const assetId = apostleAssetAliases[apostleId] || apostleId;
    Object.entries(skillIcons).forEach(([type, image]) => {
      image.classList.remove('is-missing');
      image.alt = `${apostleName} ${type === 'F' ? '低学年' : type === 'S' ? '高学年' : 'パッシブ'}スキル`;
      image.onerror = () => image.classList.add('is-missing');
      image.onload = () => image.classList.remove('is-missing');
      image.src = `img/Chara/Skill/Skill_${type}_${assetId}.webp`;
    });
  }

  viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      showView(button.dataset.dashboardView);
      scrollToDashboardMain();
    });
  });

  globalButtons.forEach(button => {
    button.addEventListener('click', () => {
      openGlobal(button.dataset.openGlobal);
      button.closest('.topbar-global-menu')?.removeAttribute('open');
      scrollToDashboardMain();
    });
  });

  document.addEventListener('click', event => {
    document.querySelectorAll('.topbar-global-menu[open]').forEach(menu => {
      if (!menu.contains(event.target)) {
        menu.removeAttribute('open');
      }
    });
  });

  profileTopButton?.addEventListener('click', () => {
    showView('settings');
    setTopGlobalActive('');
    topGlobalMenu?.removeAttribute('open');
    scrollToProfile();
  });

  document.querySelector('[data-open-apostle-picker]').addEventListener('click', () => {
    document.getElementById('apostle-picker-button').click();
  });

  apostleSelect.addEventListener('change', syncBottomApostle);
  document.addEventListener('stat-state-applied', syncBottomApostle);

  ['save-state-slot', 'load-state-slot', 'delete-state-slot'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      if (id === 'load-state-slot') syncBottomApostle();
      bottomSaveMenu.open = true;
    });
  });

  syncBottomApostle();
  applyInitialRoute();
})();
