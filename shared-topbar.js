// 管理・計算・dataで共有する操作定義。ページ固有の処理は既存のdata属性へ接続する。
(() => {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const MOBILE_QUERY = '(max-width: 720px)';
  const THEME_KEY = 'trickcal_theme';
  const PAGE_KEYS = Object.freeze({
    manager: 'manager',
    calc: 'calc',
    data: 'data',
    formation: 'formation',
    artifact: 'artifact',
    spell: 'spell',
    board: 'board',
    bulk: 'bulk'
  });
  const DATA_MENU_ITEMS = Object.freeze([
    Object.freeze({ key: 'apostles', label: '使徒データ', fallback: 'public/apostle-data.html' }),
    Object.freeze({ key: 'enemies', label: '敵データ', fallback: 'enemy-status.html?recover=20260912' }),
    Object.freeze({ key: 'board', label: 'ボードプレビュー', fallback: 'public/board-layout-preview.html' })
  ]);
  const BULK_MENU_ITEMS = Object.freeze([
    Object.freeze({ key: 'apostles', label: '使徒設定' }),
    Object.freeze({ key: 'rank', label: 'Rank' }),
    Object.freeze({ key: 'bond', label: '好感度' }),
    Object.freeze({ key: 'aside', label: 'アサイド' }),
    Object.freeze({ key: 'research', label: '研究' })
  ]);
  const OPERATIONS = Object.freeze([
    Object.freeze({ key: 'calc', label: 'ダメ計算', desktop: ['ダメ', '計算'], mobile: ['ダメ', '計算'] }),
    Object.freeze({ key: 'manager', label: 'ステ管理', desktop: ['ステ', '管理'], mobile: ['ステ', '管理'] }),
    Object.freeze({ key: 'formation', label: '編成', mobile: ['編成'] }),
    Object.freeze({ key: 'artifact', label: '遺物', mobile: ['遺物'] }),
    Object.freeze({ key: 'spell', label: 'スペル', mobile: ['スペル'] }),
    Object.freeze({ key: 'board', label: '全体ボード', desktop: ['全体', 'ボード'], mobile: ['全体', 'ボード'] }),
    Object.freeze({ key: 'bulk', label: '一括設定', desktop: ['一括', '設定'], mobile: ['一括', '設定'] }),
    Object.freeze({ key: 'data', label: 'データ', mobile: ['データ'] })
  ]);
  const PC_ORDER = Object.freeze(['calc', 'manager', 'formation', 'artifact', 'spell', 'board', 'bulk', 'data']);
  const MOBILE_ORDER = Object.freeze(['calc', 'manager', 'artifact', 'board', 'theme', 'data', 'formation', 'spell', 'bulk', 'notice']);

  function createElement(tagName, className = '') {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    return element;
  }

  function createSvg(className, viewBox = '0 0 24 24') {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    return svg;
  }

  function appendSvgPath(svg, d) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
    return path;
  }

  function appendBellIcon(parent) {
    const svg = createSvg('ui-icon topbar-announcement-icon');
    appendSvgPath(svg, 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9');
    appendSvgPath(svg, 'M10 21h4');
    parent.appendChild(svg);
  }

  function appendThemeIcons(parent) {
    const sun = createSvg('ui-icon ui-theme-icon-sun');
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '4');
    sun.appendChild(circle);
    [
      'M12 2v2', 'M12 20v2', 'M4.93 4.93l1.42 1.42',
      'M17.65 17.65l1.42 1.42', 'M2 12h2', 'M20 12h2',
      'M4.93 19.07l1.42-1.42', 'M17.65 6.35l1.42-1.42'
    ].forEach(d => appendSvgPath(sun, d));
    parent.appendChild(sun);

    const moon = createSvg('ui-icon ui-theme-icon-moon');
    appendSvgPath(moon, 'M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z');
    parent.appendChild(moon);
  }

  function publicRoute(routeKey) {
    try {
      const path = window.TRICKCAL_PUBLIC_SITE?.pageUrl?.(routeKey);
      if (path) return path;
    } catch (_) { /* local source fallback */ }
    return '';
  }

  function routeHref(bar, pageKey, currentPage) {
    const dataKey = `sharedTopbar${pageKey[0].toUpperCase()}${pageKey.slice(1)}Href`;
    const configured = publicRoute(pageKey);
    if (configured) return configured;
    if (bar.dataset[dataKey]) return bar.dataset[dataKey];
    const routeKey = `sharedTopbar${pageKey[0].toUpperCase()}${pageKey.slice(1)}Route`;
    if (bar.dataset[routeKey]) return bar.dataset[routeKey];
    if (currentPage === PAGE_KEYS.data) {
      return pageKey === PAGE_KEYS.data ? './' : `../${pageKey}/`;
    }
    if (pageKey === PAGE_KEYS.manager) return 'stat-dashboard.html?view=settings&recover=20260912';
    if (pageKey === PAGE_KEYS.calc) return 'formation-damage-calc.html?recover=20260912';
    return 'data/';
  }

  function managerActionHref(bar, page, query) {
    const href = routeHref(bar, PAGE_KEYS.manager, page);
    try {
      const url = new URL(href, window.location.href);
      Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));
      return `${url.pathname}${url.search}${url.hash}`;
    } catch (_) {
      return href;
    }
  }

  function dataMenuHref(bar, page, item) {
    const dataKey = `sharedTopbar${item.key[0].toUpperCase()}${item.key.slice(1)}Href`;
    const configured = publicRoute(item.key);
    if (configured) return configured;
    if (bar.dataset[dataKey]) return bar.dataset[dataKey];
    const routeKey = `sharedTopbar${item.key[0].toUpperCase()}${item.key.slice(1)}Route`;
    if (bar.dataset[routeKey]) return bar.dataset[routeKey];
    if (page === PAGE_KEYS.data) {
      return item.key === 'data' ? './' : `../${item.fallback}`;
    }
    return item.fallback;
  }

  function createBulkControl(operation, bar, page) {
    const isManager = page === PAGE_KEYS.manager;
    const control = createElement('details', 'topbar-global-menu topbar-operation-menu topbar-bulk-menu');
    control.dataset.topbarOperation = operation.key;
    control.dataset.topbarMenu = 'bulk';

    const summary = createElement('summary');
    summary.dataset.topbarMenuTrigger = 'bulk';
    summary.setAttribute('aria-haspopup', 'menu');
    appendLabel(summary, operation);

    const popover = createElement('div', 'topbar-global-popover');
    popover.setAttribute('aria-label', '一括設定メニュー');
    popover.setAttribute('role', 'menu');
    BULK_MENU_ITEMS.forEach(itemConfig => {
      const item = createElement(isManager ? 'button' : 'a');
      if (isManager) {
        item.type = 'button';
        item.dataset.openGlobal = itemConfig.key;
      } else {
        item.href = managerActionHref(bar, page, { global: itemConfig.key, recover: '20260912' });
      }
      item.dataset.topbarMenuItem = 'bulk';
      item.dataset.topbarBulkTarget = itemConfig.key;
      item.setAttribute('role', 'menuitem');
      item.textContent = itemConfig.label;
      popover.appendChild(item);
    });
    control.append(summary, popover);
    return control;
  }

  function currentTheme() {
    if (document.documentElement?.dataset?.theme === 'light') return 'light';
    if (document.body?.classList?.contains('theme-light')) return 'light';
    return 'dark';
  }

  function syncThemeButton(button) {
    if (!button) return;
    const dark = currentTheme() === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'ライトモードに切替' : 'ダークモードに切替');
    button.setAttribute('title', dark ? 'ライトモードに切替' : 'ダークモードに切替');
  }

  function applyTheme(theme, persist = true) {
    const safeTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = safeTheme;
    document.body.classList.toggle('theme-light', safeTheme === 'light');
    document.body.classList.toggle('theme-dark', safeTheme !== 'light');
    if (persist) {
      try { window.localStorage?.setItem(THEME_KEY, safeTheme); } catch (_) { /* no-op */ }
    }
    document.querySelectorAll('[data-shared-theme-button], [data-dashboard-theme-toggle], #fdc-theme-toggle')
      .forEach(syncThemeButton);
  }

  function bindTheme(button, page) {
    if (!button || button.dataset.sharedThemeBound === 'true') return;
    button.dataset.sharedThemeButton = 'true';
    syncThemeButton(button);
    if (page !== PAGE_KEYS.calc) {
      button.addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
    }
    button.dataset.sharedThemeBound = 'true';
  }

  function appendLabel(control, operation) {
    const label = createElement('span', 'topbar-label');
    const desktop = createElement('span', 'topbar-label-desktop');
    desktop.textContent = (operation.desktop || [operation.label]).join('\n');
    const mobile = createElement('span', 'topbar-label-mobile');
    mobile.textContent = operation.mobile.join('\n');
    label.append(desktop, mobile);
    control.appendChild(label);
  }

  function createControl(operation, bar, page) {
    const isCurrentPage = operation.key === page;
    const isManager = page === PAGE_KEYS.manager;
    let control;
    const controlClass = `topbar-operation-link${isCurrentPage ? ' is-active' : ''}`;
    const setOperation = element => {
      element.dataset.topbarOperation = operation.key;
      return element;
    };

    if (operation.key === PAGE_KEYS.data) {
      control = setOperation(createElement('details', `topbar-global-menu topbar-operation-menu topbar-data-menu${isCurrentPage ? ' is-active' : ''}`));
      control.dataset.topbarMenu = 'data';
      const summary = createElement('summary');
      summary.dataset.topbarMenuTrigger = 'data';
      summary.setAttribute('aria-haspopup', 'menu');
      if (isCurrentPage) summary.setAttribute('aria-current', 'page');
      appendLabel(summary, operation);
      const popover = createElement('div', 'topbar-global-popover topbar-data-popover');
      popover.setAttribute('aria-label', 'データメニュー');
      popover.setAttribute('role', 'menu');
      DATA_MENU_ITEMS.forEach(itemConfig => {
        const item = createElement('a');
        item.href = dataMenuHref(bar, page, itemConfig);
        item.dataset.topbarMenuItem = 'data';
        item.dataset.topbarDataTarget = itemConfig.key;
        item.setAttribute('role', 'menuitem');
        item.textContent = itemConfig.label;
        popover.appendChild(item);
      });
      control.append(summary, popover);
      return control;
    }

    if (operation.key === PAGE_KEYS.bulk) {
      return createBulkControl(operation, bar, page);
    }

    if (operation.key === PAGE_KEYS.manager && isManager) {
      control = setOperation(createElement('button', controlClass));
      control.type = 'button';
      control.dataset.dashboardProfileTop = 'true';
      control.setAttribute('aria-current', 'page');
    } else if (operation.key === PAGE_KEYS.formation && isManager) {
      control = setOperation(createElement('button', controlClass));
      control.type = 'button';
      control.dataset.dashboardView = 'formation';
    } else if (operation.key === PAGE_KEYS.artifact && isManager) {
      control = setOperation(createElement('button', controlClass));
      control.type = 'button';
      control.dataset.openCardManager = 'artifact';
    } else if (operation.key === PAGE_KEYS.spell && isManager) {
      control = setOperation(createElement('button', controlClass));
      control.type = 'button';
      control.dataset.openCardManager = 'spell';
    } else if (operation.key === PAGE_KEYS.board && isManager) {
      control = setOperation(createElement('button', controlClass));
      control.type = 'button';
      control.dataset.openGlobal = 'board-global';
    } else {
      control = createElement('a', `topbar-common-link topbar-operation-link${isCurrentPage ? ' is-active' : ''}`);
      setOperation(control);
      control.href = operation.key === PAGE_KEYS.manager
        ? routeHref(bar, PAGE_KEYS.manager, page)
        : operation.key === PAGE_KEYS.calc
          ? routeHref(bar, PAGE_KEYS.calc, page)
          : operation.key === PAGE_KEYS.data
            ? routeHref(bar, PAGE_KEYS.data, page)
            : managerActionHref(bar, page, operation.key === 'formation'
              ? { view: 'formation', recover: '20260912' }
              : operation.key === 'artifact'
                ? { card: 'artifact', recover: '20260912' }
                : operation.key === 'spell'
                  ? { card: 'spell', recover: '20260912' }
                  : operation.key === 'board'
                    ? { global: 'board-global', recover: '20260912' }
                    : { global: 'apostles', recover: '20260912' });
      if (isCurrentPage) control.setAttribute('aria-current', 'page');
    }
    appendLabel(control, operation);
    return control;
  }

  function createNoteLink() {
    const link = createElement('a', 'topbar-note-link');
    link.href = 'https://note.com/innocentroad';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'note: innocentroad');
    link.setAttribute('title', 'note: innocentroad');
    const image = createElement('img');
    image.src = (() => {
      try {
        const configured = window.TRICKCAL_PUBLIC_SITE?.assetUrl?.('img/icon/note.svg');
        if (configured) return configured;
        return new URL('/img/icon/note.svg', window.location.href).href;
      } catch (_) { return 'img/icon/note.svg'; }
    })();
    image.alt = '';
    image.width = 16;
    image.height = 16;
    link.appendChild(image);
    return link;
  }

  function createNoticeButton() {
    const button = createElement('button', 'topbar-announcement-trigger topbar-icon-action');
    button.type = 'button';
    button.dataset.announcementTrigger = 'true';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'trickcal-announcements-dialog');
    button.setAttribute('aria-label', 'お知らせ');
    button.setAttribute('title', 'お知らせ');
    appendBellIcon(button);
    const unread = createElement('span', 'trickcal-announcements-follow-unread');
    unread.hidden = true;
    unread.setAttribute('aria-label', '未読あり');
    button.appendChild(unread);
    return button;
  }

  function createThemeButton(page) {
    const button = createElement('button', page === PAGE_KEYS.calc ? 'fdc-theme-toggle topbar-icon-action' : 'dashboard-top-theme-toggle topbar-icon-action');
    button.type = 'button';
    if (page === PAGE_KEYS.calc) button.id = 'fdc-theme-toggle';
    else button.dataset.dashboardThemeToggle = 'true';
    button.dataset.sharedThemeButton = 'true';
    button.setAttribute('aria-label', 'テーマ切替');
    appendThemeIcons(button);
    return button;
  }

  function getManagerActiveOperation() {
    const view = document.querySelector('[data-dashboard-panel].is-active')?.dataset.dashboardPanel || 'settings';
    if (view === 'formation') return { key: PAGE_KEYS.formation, global: '' };
    if (view !== 'global') return { key: '', global: '' };

    const global = document.querySelector('[data-setting-panel].is-active')?.dataset.settingPanel || '';
    if (global === 'board-global') return { key: PAGE_KEYS.board, global };
    if (global === 'cards') {
      const card = document.querySelector('[data-card-kind].is-active')?.dataset.cardKind;
      return { key: card === 'spell' ? PAGE_KEYS.spell : PAGE_KEYS.artifact, global };
    }
    if (['apostles', 'rank', 'bond', 'aside', 'research'].includes(global)) {
      return { key: PAGE_KEYS.bulk, global };
    }
    return { key: '', global };
  }

  function setTopbarCurrent(element, active, currentType = 'location') {
    if (!element) return;
    element.classList.toggle('is-active', active);
    if (active) element.setAttribute('aria-current', currentType);
    else if (element.getAttribute('aria-current') !== 'page') element.removeAttribute('aria-current');
  }

  function syncTopbarState(layout) {
    const page = layout.page;
    const controls = layout.controls;
    const managerActive = page === PAGE_KEYS.manager ? getManagerActiveOperation() : { key: '', global: '' };

    Object.entries(controls).forEach(([key, control]) => {
      if (!control || !OPERATIONS.some(operation => operation.key === key)) return;
      const isPageCurrent = key === page;
      const isManagerPage = page === PAGE_KEYS.manager;
      const isInternalActive = isManagerPage && key === managerActive.key;
      const active = isPageCurrent || isInternalActive;
      setTopbarCurrent(control, active, isPageCurrent ? 'page' : 'location');
      const summary = control.matches?.('details') ? control.querySelector('summary') : null;
      if (summary) {
        const summaryIsCurrent = isPageCurrent || isInternalActive;
        control.removeAttribute('aria-current');
        setTopbarCurrent(summary, summaryIsCurrent, isPageCurrent ? 'page' : 'location');
        if (!summaryIsCurrent) summary.removeAttribute('aria-current');
      }
    });

    const bulkItems = controls.bulk?.querySelectorAll('[data-topbar-menu-item="bulk"]') || [];
    bulkItems.forEach(item => {
      const active = page === PAGE_KEYS.manager
        && managerActive.key === PAGE_KEYS.bulk
        && item.dataset.topbarBulkTarget === managerActive.global;
      setTopbarCurrent(item, active);
    });

    const dataTarget = layout.bar.dataset.sharedTopbarDataTarget || 'data';
    const dataItems = controls.data?.querySelectorAll('[data-topbar-menu-item="data"]') || [];
    dataItems.forEach(item => {
      const active = page === PAGE_KEYS.data && item.dataset.topbarDataTarget === dataTarget;
      setTopbarCurrent(item, active);
    });
  }

  function installTopbarStateObserver(layout) {
    syncTopbarState(layout);
    if (layout.page !== PAGE_KEYS.manager || typeof window.MutationObserver !== 'function') return;
    const sources = document.querySelectorAll('[data-dashboard-panel], [data-setting-panel], [data-card-kind]');
    const observer = new window.MutationObserver(() => syncTopbarState(layout));
    sources.forEach(source => observer.observe(source, { attributes: true, attributeFilter: ['class'] }));
    layout.activeStateObserver = observer;
  }

  function installTopbarMenuInteractions() {
    if (document.documentElement.dataset.topbarMenuInteractions === 'true') return;
    document.documentElement.dataset.topbarMenuInteractions = 'true';

    const getMenus = () => Array.from(document.querySelectorAll('[data-topbar-menu]'));
    getMenus().forEach(menu => {
      menu.addEventListener('toggle', () => {
        if (!menu.open) return;
        getMenus().forEach(other => {
          if (other !== menu && other.open) other.removeAttribute('open');
        });
      });
      menu.addEventListener('click', event => {
        if (event.target.closest?.('[data-topbar-menu-item]')) menu.removeAttribute('open');
      });
    });

    document.addEventListener('click', event => {
      getMenus().forEach(menu => {
        if (menu.open && !menu.contains(event.target)) menu.removeAttribute('open');
      });
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const menu = getMenus().find(item => item.open);
      if (!menu) return;
      menu.removeAttribute('open');
      event.preventDefault();
      menu.querySelector('summary')?.focus();
    });
  }

  function arrangeLayout(layout, isMobile) {
    const controls = layout.controls;
    if (isMobile) {
      layout.desktopNav.hidden = true;
      layout.desktopActions.hidden = true;
      layout.mobileNav.hidden = false;
      layout.mobileNav.replaceChildren(...MOBILE_ORDER.map(key => controls[key]).filter(Boolean));
      layout.desktopActions.replaceChildren(layout.note);
    } else {
      layout.mobileNav.hidden = true;
      layout.desktopActions.hidden = false;
      layout.desktopNav.hidden = false;
      layout.desktopNav.replaceChildren(...PC_ORDER.map(key => controls[key]).filter(Boolean));
      layout.desktopActions.replaceChildren(layout.note, controls.notice, controls.theme);
    }
    layout.desktopNav.setAttribute('aria-hidden', String(isMobile));
    layout.mobileNav.setAttribute('aria-hidden', String(!isMobile));
    layout.desktopActions.setAttribute('aria-hidden', String(isMobile));
  }

  function initializeBar(bar) {
    if (!bar || bar.dataset.sharedTopbarReady === 'true') return;
    const page = bar.dataset.sharedTopbarPage || (bar.classList.contains('fdc-top-control-bar') ? PAGE_KEYS.calc : PAGE_KEYS.manager);
    const row = bar.querySelector('[data-shared-topbar-common]');
    if (!row) return;
    // 前回試作のページ固有行が残る生成元も、同一の共通操作群へ統合する。
    bar.querySelector('.topbar-page-row')?.remove();
    row.replaceChildren();

    const desktopNav = createElement('nav', 'dashboard-top-tabs topbar-operation-nav');
    desktopNav.setAttribute('aria-label', '共通操作');
    const mobileNav = createElement('nav', 'dashboard-top-tabs topbar-mobile-grid');
    mobileNav.setAttribute('aria-label', '共通操作');
    const desktopActions = createElement('div', 'topbar-common-actions');
    desktopActions.setAttribute('aria-label', '補助操作');
    const controls = {};
    OPERATIONS.forEach(operation => { controls[operation.key] = createControl(operation, bar, page); });
    controls.notice = createNoticeButton();
    controls.theme = createThemeButton(page);
    const note = createNoteLink();
    row.className = 'topbar-common-row';
    row.append(desktopNav, mobileNav, desktopActions);
    const layout = { bar, page, desktopNav, mobileNav, desktopActions, controls, note };
    const mediaQuery = window.matchMedia?.(MOBILE_QUERY) || null;
    const arrange = () => arrangeLayout(layout, mediaQuery?.matches ?? window.innerWidth <= 720);
    arrange();
    if (typeof mediaQuery?.addEventListener === 'function') mediaQuery.addEventListener('change', arrange);
    else if (typeof mediaQuery?.addListener === 'function') mediaQuery.addListener(arrange);
    else window.addEventListener('resize', arrange);
    installTopbarMenuInteractions();
    installTopbarStateObserver(layout);

    bindTheme(controls.theme, page);
    if (page === PAGE_KEYS.data && !document.documentElement.dataset.theme) {
      let saved = '';
      try { saved = window.localStorage?.getItem(THEME_KEY) || ''; } catch (_) { /* no-op */ }
      applyTheme(saved === 'dark' ? 'dark' : 'light', false);
    } else {
      applyTheme(currentTheme(), false);
    }
    bar.dataset.sharedTopbarReady = 'true';
    if (typeof window.ResizeObserver === 'function') {
      const observer = new window.ResizeObserver(() => syncTopbarHeight(bar));
      observer.observe(bar);
    }
    syncTopbarHeight(bar);
  }

  function syncTopbarHeight(bar) {
    const height = Math.ceil(bar.getBoundingClientRect?.().height || bar.offsetHeight || 0);
    if (height > 0) document.documentElement.style.setProperty('--trickcal-topbar-height', `${height}px`);
  }

  function initialize() {
    document.querySelectorAll('[data-shared-topbar-page]').forEach(initializeBar);
  }

  // 通知scriptより前にベルをDOMへ置く。scriptがbody末尾であっても初期化順を安定させる。
  initialize();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
})();
