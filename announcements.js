// お知らせ一覧・自動表示・旧サイト移行案内の共通UI。
// 通知状態は専用のregistry entryへ保存するが、backup/restoreの対象には含めない。
(function initAnnouncements(root, factory) {
  let data = root?.TRICKCAL_ANNOUNCEMENT_DATA;
  if (!data && typeof module === 'object' && module.exports && typeof require === 'function') {
    try {
      data = require('./announcements-data');
    } catch (_) {
      data = null;
    }
  }
  const api = factory(root, data);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!root) return;
  root.TRICKCAL_ANNOUNCEMENTS = api;
  if (!root.document) return;
  const boot = root.TRICKCAL_STORAGE_BOOT || Promise.resolve({ ok: true });
  Promise.resolve(boot).then(() => {
    const controller = api.createController({
      window: root,
      document: root.document
    });
    root.TRICKCAL_ANNOUNCEMENTS_CONTROLLER = controller;
    controller.initialize();
  }).catch(error => {
    try { root.console?.warn?.('お知らせUIを初期化できませんでした。', error); } catch (_) { /* no-op */ }
  });
})(typeof globalThis !== 'undefined' ? globalThis : this, function createAnnouncementsApi(windowRoot, defaultData) {
  'use strict';

  const NOTICE_STORAGE_KEY = 'trickcal_notice_state_v1';
  const STATE_VERSION = 1;
  const MAX_STATE_ITEMS = 100;
  const PROFILE_NEW = 'new';
  const PROFILE_LEGACY = 'legacy';
  const PROFILE_LOCALHOST = 'localhost';
  const PAGE_MANAGER = 'manager';
  const PAGE_CALC = 'calc';
  const PAGE_OTHER = 'other';
  const RELEASE_GATE = 'announcements-migration-20260915';
  const LEGACY_ORIGIN = 'https://innocentroad.github.io';
  const NEW_ORIGIN = 'https://trickcal.irlab.dev';
  const FOCUSABLE_SELECTOR = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function cloneState(state) {
    return {
      version: STATE_VERSION,
      readIds: state.readIds.slice(),
      autoAcknowledged: state.autoAcknowledged.map(item => ({ id: item.id, revision: item.revision }))
    };
  }

  function emptyState() {
    return { version: STATE_VERSION, readIds: [], autoAcknowledged: [] };
  }

  function sanitizeState(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== STATE_VERSION) return null;
    const readIds = Array.isArray(value.readIds)
      ? value.readIds.filter(item => typeof item === 'string' && item.trim()).slice(0, MAX_STATE_ITEMS)
      : [];
    const autoAcknowledged = Array.isArray(value.autoAcknowledged)
      ? value.autoAcknowledged
        .filter(item => item && typeof item === 'object'
          && typeof item.id === 'string' && item.id.trim()
          && typeof item.revision === 'string' && item.revision.trim())
        .map(item => ({ id: item.id, revision: item.revision }))
        .slice(0, MAX_STATE_ITEMS)
      : [];
    if (!Array.isArray(value.readIds) || !Array.isArray(value.autoAcknowledged)) return null;
    return {
      version: STATE_VERSION,
      readIds: Array.from(new Set(readIds)),
      autoAcknowledged: Array.from(new Map(autoAcknowledged.map(item => [`${item.id}\u0000${item.revision}`, item])).values())
    };
  }

  function safeText(value) {
    return String(value == null ? '' : value);
  }

  function currentOrigin(windowObject) {
    return safeText(windowObject?.location?.origin || 'http://localhost');
  }

  function absoluteUrl(path, origin) {
    try {
      return new URL(path, `${String(origin || currentOrigin(windowRoot)).replace(/\/$/, '')}/`).href;
    } catch (_) {
      return String(path || '');
    }
  }

  function createController(options = {}) {
    const windowObject = options.window || windowRoot || {};
    const documentObject = options.document || windowObject.document || null;
    const data = options.data || defaultData;
    const fixtureConfig = options.config || windowObject.TRICKCAL_ANNOUNCEMENTS_CONFIG || {};
    const releaseConfig = windowObject.TRICKCAL_ANNOUNCEMENTS_RELEASE_CONFIG || {};
    const config = { ...releaseConfig, ...fixtureConfig };
    const publicSite = windowObject.TRICKCAL_PUBLIC_SITE || {};
    const transferApi = windowObject.TRICKCAL_STORAGE_TRANSFER || {};
    const injectedStorage = Object.prototype.hasOwnProperty.call(options, 'storageLocal')
      ? options.storageLocal
      : null;
    let state = emptyState();
    let storageFallback = false;
    let initialized = false;
    let currentView = 'list';
    let currentAuto = null;
    let lastTrigger = null;
    let trigger = null;
    let dialog = null;
    let dialogBody = null;
    let dialogTitle = null;
    let banner = null;
    let topBar = null;
    let closeHandlerInstalled = false;
    let autoDecisionMade = false;
    let layoutUpdateScheduled = false;
    let followBarResizeObserver = null;

    function readNoticeRaw() {
      if (injectedStorage && typeof injectedStorage.getItem === 'function') return injectedStorage.getItem(NOTICE_STORAGE_KEY);
      if (typeof window !== 'undefined' && window.TRICKCAL_STORAGE_FACADE) {
        return window.TRICKCAL_STORAGE_FACADE.localStorage.getItem(NOTICE_STORAGE_KEY);
      }
      return null;
    }

    function writeNoticeRaw(raw) {
      if (injectedStorage && typeof injectedStorage.setItem === 'function') {
        injectedStorage.setItem(NOTICE_STORAGE_KEY, raw);
        return true;
      }
      if (typeof window !== 'undefined' && window.TRICKCAL_STORAGE_FACADE) {
        window.TRICKCAL_STORAGE_FACADE.localStorage.setItem(NOTICE_STORAGE_KEY, raw);
        return true;
      }
      return false;
    }

    function readPersistedState() {
      if (!injectedStorage && !(typeof window !== 'undefined' && window.TRICKCAL_STORAGE_FACADE)) {
        storageFallback = true;
        return emptyState();
      }
      try {
        const raw = readNoticeRaw();
        if (raw == null) return emptyState();
        const parsed = sanitizeState(JSON.parse(raw));
        if (!parsed) {
          storageFallback = true;
          return emptyState();
        }
        return parsed;
      } catch (_) {
        storageFallback = true;
        return emptyState();
      }
    }

    function persistState() {
      if (!injectedStorage && !(typeof window !== 'undefined' && window.TRICKCAL_STORAGE_FACADE)) {
        storageFallback = true;
        return false;
      }
      try {
        return writeNoticeRaw(JSON.stringify(cloneState(state)));
      } catch (_) {
        storageFallback = true;
        return false;
      }
    }

    function rawProfile() {
      if (config.fixture === true && ['new', 'legacy', 'localhost'].includes(config.profileOverride)) {
        return config.profileOverride;
      }
      if (publicSite.profile === PROFILE_LEGACY) return PROFILE_LEGACY;
      if (publicSite.profile === PROFILE_NEW) return PROFILE_NEW;
      const hostname = safeText(windowObject?.location?.hostname).toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return PROFILE_LOCALHOST;
      if (safeText(windowObject?.location?.pathname).startsWith('/trickcal-manager/')) return PROFILE_LEGACY;
      return PROFILE_NEW;
    }

    const profile = rawProfile();
    const contentProfile = profile === PROFILE_LEGACY ? PROFILE_LEGACY : PROFILE_NEW;

    function rawPage() {
      if (config.fixture === true && [PAGE_MANAGER, PAGE_CALC, PAGE_OTHER].includes(config.page)) {
        return config.page;
      }
      const pathname = safeText(windowObject?.location?.pathname);
      if (/\/manager(?:\/|$)|stat-dashboard\.html$/.test(pathname)) return PAGE_MANAGER;
      if (/\/calc(?:\/|$)|formation-damage-calc\.html$/.test(pathname)) return PAGE_CALC;
      return PAGE_OTHER;
    }

    const page = rawPage();

    function releaseFeatureEnabled(feature) {
      return releaseConfig.releaseGate === RELEASE_GATE
        && releaseConfig.enabled === true
        && releaseConfig[feature] === true
        && Array.isArray(releaseConfig.profiles)
        && releaseConfig.profiles.includes(profile)
        && Array.isArray(releaseConfig.pages)
        && releaseConfig.pages.includes(page);
    }

    function featureEnabled(feature) {
      if (config.fixture === true) return config[feature] === true;
      return releaseFeatureEnabled(feature);
    }

    function articles() {
      try {
        return data?.getArticles?.(contentProfile) || [];
      } catch (_) {
        return [];
      }
    }

    function articleById(id) {
      try {
        return data?.getArticle?.(id) || articles().find(article => article.id === id) || null;
      } catch (_) {
        return null;
      }
    }

    function isRead(id) {
      return state.readIds.includes(id);
    }

    function isAutoAcknowledged(article) {
      return state.autoAcknowledged.some(item => item.id === article.id && item.revision === article.autoRevision);
    }

    function markRead(id) {
      if (!id || isRead(id)) return false;
      state.readIds = [id].concat(state.readIds.filter(item => item !== id)).slice(0, MAX_STATE_ITEMS);
      persistState();
      refreshUnread();
      return true;
    }

    function acknowledgeAuto(article) {
      if (!article?.autoRevision) return false;
      if (!isAutoAcknowledged(article)) {
        state.autoAcknowledged = [{ id: article.id, revision: article.autoRevision }]
          .concat(state.autoAcknowledged.filter(item => !(item.id === article.id && item.revision === article.autoRevision)))
          .slice(0, MAX_STATE_ITEMS);
      }
      if (!isRead(article.id)) state.readIds = [article.id].concat(state.readIds).slice(0, MAX_STATE_ITEMS);
      persistState();
      refreshUnread();
      return true;
    }

    function acknowledgeCurrentAuto() {
      const article = currentAuto;
      currentAuto = null;
      return article ? acknowledgeAuto(article) : false;
    }

    function appendElement(parent, tagName, text, className) {
      const element = documentObject.createElement(tagName);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = safeText(text);
      parent.appendChild(element);
      return element;
    }

    function appendArticleParagraph(parent, text) {
      const paragraph = appendElement(parent, 'p', undefined, 'trickcal-announcement-paragraph');
      const value = safeText(text);
      const marker = 'trickcal.irlab.dev';
      const markerIndex = value.indexOf(marker);
      if (markerIndex < 0) {
        paragraph.textContent = value;
        return paragraph;
      }
      appendElement(paragraph, 'span', value.slice(0, markerIndex));
      const siteLink = appendElement(paragraph, 'a', marker, 'trickcal-announcement-site-link');
      siteLink.href = NEW_ORIGIN;
      siteLink.target = '_blank';
      siteLink.rel = 'noopener noreferrer';
      appendElement(paragraph, 'span', value.slice(markerIndex + marker.length));
      return paragraph;
    }

    function routeUrl(routeId, fallbackPath) {
      try {
        const path = publicSite.pageUrl?.(routeId);
        if (path) return absoluteUrl(path, currentOrigin(windowObject));
      } catch (_) { /* fallback below */ }
      return absoluteUrl(fallbackPath, currentOrigin(windowObject));
    }

    function peerRouteUrl(routeId, origin, fallbackPath) {
      try {
        const path = publicSite.peerPageUrl?.(routeId, origin);
        if (path) return absoluteUrl(path, origin || currentOrigin(windowObject));
      } catch (_) { /* fallback below */ }
      return absoluteUrl(fallbackPath, origin || currentOrigin(windowObject));
    }

    function withQuery(path, params, origin = currentOrigin(windowObject)) {
      try {
        const url = new URL(path, `${String(origin || '').replace(/\/$/, '')}/`);
        Object.entries(params || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
        });
        return url.href;
      } catch (_) {
        return String(path || '');
      }
    }

    function peerOrigin(kind, fallback) {
      try {
        const configured = transferApi.getConfiguredPeerOrigin?.(kind);
        if (configured) return configured;
      } catch (_) { /* fallback below */ }
      return transferApi[kind === 'source' ? 'defaultSourceOrigin' : 'defaultTargetOrigin'] || fallback;
    }

    function getGuideLinks() {
      const oldManagerRoute = profile === PROFILE_LEGACY
        ? routeUrl('manager', '/trickcal-manager/stat-dashboard.html')
        : profile === PROFILE_LOCALHOST
          ? routeUrl('manager', '/manager/')
          : absoluteUrl('/trickcal-manager/stat-dashboard.html', peerOrigin('source', LEGACY_ORIGIN));
      const oldManager = withQuery(oldManagerRoute, { view: 'settings', backup: '1' });
      const newTransfer = profile === PROFILE_NEW
        ? routeUrl('transfer', '/transfer/')
        : profile === PROFILE_LOCALHOST
          ? routeUrl('transfer', '/transfer/')
          : peerRouteUrl('transfer', peerOrigin('target', NEW_ORIGIN), '/transfer/');
      return { oldManager, newTransfer };
    }

    function requestLegacyManagerBackupMenu() {
      if (typeof documentObject?.dispatchEvent !== 'function') return false;
      const event = typeof windowObject?.CustomEvent === 'function'
        ? new windowObject.CustomEvent('trickcal-open-backup-menu')
        : { type: 'trickcal-open-backup-menu' };
      return documentObject.dispatchEvent(event);
    }

    function openDialog() {
      if (!dialog) return false;
      try {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else {
          dialog.open = true;
          dialog.setAttribute('open', '');
        }
      } catch (_) {
        dialog.open = true;
        dialog.setAttribute('open', '');
      }
      return true;
    }

    function focusDialogStart() {
      try {
        const candidates = Array.from(dialog?.querySelectorAll?.(FOCUSABLE_SELECTOR) || []);
        (candidates[0] || dialog)?.focus?.();
      } catch (_) { /* no-op */ }
    }

    function setDialogTitle(text) {
      if (dialogTitle) dialogTitle.textContent = safeText(text);
    }

    function measureFollowBar() {
      const root = documentObject?.documentElement;
      if (!root?.style || !topBar || !trigger) return;
      const topHeight = Number(topBar.getBoundingClientRect?.().height || topBar.offsetHeight || 0);
      const followHeight = Number(trigger.getBoundingClientRect?.().height || trigger.offsetHeight || 0);
      if (topHeight > 0) root.style.setProperty('--trickcal-topbar-height', `${topHeight}px`);
      if (followHeight > 0) root.style.setProperty('--trickcal-follow-bar-height', `${followHeight}px`);
    }

    function scheduleFollowBarMetrics() {
      if (layoutUpdateScheduled) return;
      layoutUpdateScheduled = true;
      const update = () => {
        layoutUpdateScheduled = false;
        measureFollowBar();
      };
      if (typeof windowObject.requestAnimationFrame === 'function') windowObject.requestAnimationFrame(update);
      else update();
    }

    function notifyLayoutReady() {
      const root = documentObject?.documentElement;
      if (root?.dataset) root.dataset.trickcalAnnouncementsLayoutReady = 'true';
      if (typeof documentObject?.dispatchEvent !== 'function') return;
      try {
        const EventCtor = windowObject.Event;
        documentObject.dispatchEvent(typeof EventCtor === 'function'
          ? new EventCtor('trickcal-announcements-layout-ready')
          : { type: 'trickcal-announcements-layout-ready' });
      } catch (_) { /* no-op */ }
    }

    function renderList() {
      if (!dialogBody) return;
      currentView = 'list';
      setDialogTitle('お知らせ');
      dialogBody.replaceChildren?.();
      appendElement(dialogBody, 'p', '最新のお知らせと移行案内です。', 'trickcal-announcements-intro');
      const list = appendElement(dialogBody, 'div', undefined, 'trickcal-announcements-list');
      articles().forEach(article => {
        const item = appendElement(list, 'article', undefined, 'trickcal-announcement-card');
        const button = appendElement(item, 'button', undefined, 'trickcal-announcement-card-button');
        button.type = 'button';
        button.dataset.articleId = article.id;
        const meta = appendElement(button, 'span', `${article.date} · ${article.category}`, 'trickcal-announcement-meta');
        meta.setAttribute('aria-hidden', 'true');
        appendElement(button, 'strong', article.title, 'trickcal-announcement-title');
        appendElement(button, 'span', article.summary, 'trickcal-announcement-summary');
        if (!isRead(article.id)) appendElement(button, 'span', '未読', 'trickcal-announcement-unread');
        button.addEventListener('click', () => openArticleById(article.id));
      });
      if (!articles().length) appendElement(list, 'p', '現在表示できるお知らせはありません。', 'trickcal-announcements-empty');
    }

    function renderArticle(article, auto = false) {
      if (!dialogBody || !article) return false;
      currentView = 'article';
      currentAuto = auto ? article : null;
      setDialogTitle(article.title);
      dialogBody.replaceChildren?.();
      const back = appendElement(dialogBody, 'button', '一覧へ戻る', 'trickcal-announcements-back');
      back.type = 'button';
      back.addEventListener('click', () => {
        acknowledgeCurrentAuto();
        renderList();
        focusDialogStart();
      });
      appendElement(dialogBody, 'p', `${article.date} · ${article.category}`, 'trickcal-announcement-meta');
      article.body.forEach(paragraph => appendArticleParagraph(dialogBody, paragraph));
      if (article.cta === 'migration-guide') {
        const guideButton = appendElement(dialogBody, 'button', '移行方法を見る', 'trickcal-announcement-guide-button');
        guideButton.type = 'button';
        guideButton.addEventListener('click', () => {
          acknowledgeCurrentAuto();
          renderGuide();
          focusDialogStart();
        });
      }
      if (!auto) markRead(article.id);
      return true;
    }

    function renderGuide() {
      if (!dialogBody) return false;
      currentView = 'guide';
      currentAuto = null;
      setDialogTitle('保存データの移行方法');
      dialogBody.replaceChildren?.();
      const back = appendElement(dialogBody, 'button', '一覧へ戻る', 'trickcal-announcements-back');
      back.type = 'button';
      back.addEventListener('click', () => { renderList(); focusDialogStart(); });
      appendElement(dialogBody, 'p', '移行はファイルを使って手動で行います。自動では移りません。', 'trickcal-announcement-guide-lead');
      const steps = appendElement(dialogBody, 'ol', undefined, 'trickcal-announcement-guide-steps');
      [
        '旧サイトで全体バックアップを保存します。',
        '新サイトの移行ページでバックアップファイルを選びます。',
        '内容を確認し、明示的に適用します。'
      ].forEach(step => appendElement(steps, 'li', step));
      appendElement(dialogBody, 'p', '旧サイトのデータは削除されません。新サイトの対象データは上書きされます。', 'trickcal-announcement-guide-warning');
      appendElement(dialogBody, 'p', '新サイトで読み込んだバックアップの内容を確認してから、適用を確定できます。', 'trickcal-announcement-guide-confirm');
      const links = getGuideLinks();
      const actions = appendElement(dialogBody, 'div', undefined, 'trickcal-announcement-guide-actions');
      const sameScreenLegacyManager = profile === PROFILE_LEGACY && page === PAGE_MANAGER;
      const oldLink = appendElement(actions, sameScreenLegacyManager ? 'button' : 'a', '旧サイトでバックアップ', 'trickcal-announcement-guide-link');
      if (sameScreenLegacyManager) {
        oldLink.type = 'button';
        oldLink.dataset.announcementAction = 'open-backup-menu';
        oldLink.addEventListener('click', () => {
          close();
          requestLegacyManagerBackupMenu();
        });
      } else {
        oldLink.href = links.oldManager;
        oldLink.target = profile === PROFILE_LEGACY && page === PAGE_CALC ? '_self' : '_blank';
        if (oldLink.target === '_blank') oldLink.rel = 'noopener';
      }
      const newLink = appendElement(actions, 'a', '新サイトで読み込む', 'trickcal-announcement-guide-link');
      newLink.href = links.newTransfer;
      newLink.target = '_blank';
      newLink.rel = 'noopener';
      const details = appendElement(dialogBody, 'details', undefined, 'trickcal-announcement-guide-details');
      appendElement(details, 'summary', '困った時');
      appendElement(details, 'p', '適用前のプレビューと明示確認を使い、保存先と件数を確認してください。自動転送は実行されません。複数タブで同じサイトを開いている場合は、未保存の編集がないことを確認してから他のタブを閉じて、もう一度試してください。');
      return true;
    }

    function close() {
      if (!dialog) return false;
      try {
        acknowledgeCurrentAuto();
        if (typeof dialog.close === 'function') dialog.close();
        else {
          dialog.open = false;
          dialog.removeAttribute('open');
          handleDialogClosed();
        }
      } catch (_) {
        dialog.open = false;
        dialog.removeAttribute('open');
        handleDialogClosed();
      }
      return true;
    }

    function handleDialogClosed() {
      currentView = 'list';
      setDialogTitle('お知らせ');
      if (lastTrigger) {
        try { lastTrigger.focus?.(); } catch (_) { /* no-op */ }
      }
      lastTrigger = null;
      refreshUnread();
    }

    function openList(source = null) {
      if (!dialog || dialog.open) return false;
      lastTrigger = source || trigger;
      currentAuto = null;
      renderList();
      openDialog();
      focusDialogStart();
      return true;
    }

    function openArticleById(id, options = {}) {
      if (!dialog) return false;
      const article = articleById(id);
      if (!article) return false;
      if (dialog.open && currentAuto && !options.auto) acknowledgeCurrentAuto();
      if (!dialog.open) lastTrigger = options.source || trigger;
      renderArticle(article, options.auto === true);
      openDialog();
      focusDialogStart();
      return true;
    }

    function openGuide(source = null) {
      if (!dialog) return false;
      if (!dialog.open) lastTrigger = source || trigger;
      acknowledgeCurrentAuto();
      renderGuide();
      openDialog();
      focusDialogStart();
      return true;
    }

    function refreshUnread() {
      if (!trigger) return;
      const unreadCount = articles().filter(article => !isRead(article.id)).length;
      trigger.dataset.unread = unreadCount > 0 ? 'true' : 'false';
      trigger.setAttribute('aria-label', `${unreadCount > 0 ? `未読${unreadCount}件。` : ''}お知らせ。新サイトへの移行について`);
      trigger.setAttribute('title', unreadCount > 0 ? `お知らせ（未読${unreadCount}件）` : 'お知らせ');
      const unreadIndicator = trigger.querySelector?.('.trickcal-announcements-follow-unread');
      if (unreadIndicator) unreadIndicator.hidden = unreadCount <= 0;
    }

    function createFollowBar() {
      if (!featureEnabled('bannerEnabled') || !documentObject?.body) return false;
      const article = articles()[0];
      if (!article) return false;
      topBar = documentObject.querySelector?.('.dashboard-top-control-bar, .fdc-top-control-bar');
      if (!topBar?.parentNode) return false;
      trigger = documentObject.querySelector?.('.trickcal-announcements-follow-bar') || null;
      if (!trigger) {
        trigger = documentObject.createElement('button');
        trigger.type = 'button';
        trigger.className = 'trickcal-announcements-follow-bar';
        trigger.setAttribute('aria-haspopup', 'dialog');
        trigger.setAttribute('aria-controls', 'trickcal-announcements-dialog');
        appendElement(trigger, 'span', 'お知らせ', 'trickcal-announcements-follow-label');
        appendElement(trigger, 'span', article.barTitle || article.title, 'trickcal-announcements-follow-title');
        appendElement(trigger, 'span', '未読', 'trickcal-announcements-follow-unread');
        const arrow = appendElement(trigger, 'span', '›', 'trickcal-announcements-follow-arrow');
        arrow.setAttribute('aria-hidden', 'true');
        topBar.parentNode.insertBefore(trigger, topBar.nextSibling);
      }
      banner = trigger;
      if (trigger.dataset.announcementsBound !== 'true') {
        trigger.addEventListener('click', () => openArticleById(article.id, { source: trigger }));
        trigger.dataset.announcementsBound = 'true';
      }
      measureFollowBar();
      scheduleFollowBarMetrics();
      if (typeof windowObject.addEventListener === 'function') windowObject.addEventListener('resize', scheduleFollowBarMetrics);
      if (typeof windowObject.ResizeObserver === 'function') {
        followBarResizeObserver = new windowObject.ResizeObserver(scheduleFollowBarMetrics);
        followBarResizeObserver.observe(topBar);
        followBarResizeObserver.observe(trigger);
      }
      return true;
    }

    function createDialog() {
      if (!documentObject?.body) return;
      dialog = documentObject.getElementById?.('trickcal-announcements-dialog') || null;
      if (!dialog) {
        dialog = documentObject.createElement('dialog');
        dialog.id = 'trickcal-announcements-dialog';
        dialog.className = 'trickcal-announcements-dialog';
        dialog.setAttribute('aria-labelledby', 'trickcal-announcements-title');
        const header = appendElement(dialog, 'header', undefined, 'trickcal-announcements-dialog-header');
        dialogTitle = appendElement(header, 'h2', 'お知らせ', undefined);
        dialogTitle.id = 'trickcal-announcements-title';
        const closeButton = appendElement(header, 'button', '閉じる', 'trickcal-announcements-close');
        closeButton.type = 'button';
        closeButton.addEventListener('click', close);
        dialogBody = appendElement(dialog, 'div', undefined, 'trickcal-announcements-dialog-body');
        documentObject.body.appendChild(dialog);
      } else {
        dialogTitle = dialog.querySelector?.('#trickcal-announcements-title') || null;
        dialogBody = dialog.querySelector?.('.trickcal-announcements-dialog-body') || dialog;
      }
      if (!closeHandlerInstalled) {
        dialog.addEventListener?.('cancel', event => {
          event.preventDefault?.();
          close();
        });
        dialog.addEventListener?.('close', handleDialogClosed);
        dialog.addEventListener?.('keydown', event => {
          if (event.key !== 'Tab') return;
          const candidates = Array.from(dialog.querySelectorAll?.(FOCUSABLE_SELECTOR) || []);
          if (!candidates.length) return;
          const first = candidates[0];
          const last = candidates[candidates.length - 1];
          if (event.shiftKey && documentObject.activeElement === first) {
            event.preventDefault?.();
            last.focus?.();
          } else if (!event.shiftKey && documentObject.activeElement === last) {
            event.preventDefault?.();
            first.focus?.();
          }
        });
        closeHandlerInstalled = true;
      }
    }

    function isInputFocused() {
      const active = documentObject?.activeElement;
      if (!active) return false;
      const tag = safeText(active.tagName).toLowerCase();
      return ['input', 'textarea', 'select'].includes(tag) || active.isContentEditable === true;
    }

    function isInteractiveFocus() {
      const active = documentObject?.activeElement;
      if (!active) return false;
      if (isInputFocused()) return true;
      const tag = safeText(active.tagName).toLowerCase();
      return ['button', 'a', 'summary'].includes(tag) || active.getAttribute?.('role') === 'button';
    }

    function hasBlockingUi() {
      const openDialogs = Array.from(documentObject?.querySelectorAll?.('dialog[open]') || []);
      if (openDialogs.some(item => item !== dialog)) return true;
      const selectors = [
        '[role="dialog"][aria-modal="true"]',
        '[data-modal-open="true"]',
        '[data-calculation-busy="true"]',
        '[data-calculating="true"]',
        '.is-calculating',
        '.is-loading'
      ];
      return selectors.some(selector => {
        try { return !!documentObject?.querySelector?.(selector); } catch (_) { return false; }
      });
    }

    function canAutoOpen() {
      if (!featureEnabled('autoEnabled') || !initialized || autoDecisionMade || !dialog || dialog.open) return false;
      const body = documentObject?.body;
      if (body?.classList?.contains?.('is-booting')
        || body?.classList?.contains?.('is-calculating')
        || body?.classList?.contains?.('is-loading')
        || body?.getAttribute?.('aria-busy') === 'true'
        || body?.getAttribute?.('data-calculation-busy') === 'true'
        || body?.dataset?.calculating === 'true') return false;
      if (isInteractiveFocus() || hasBlockingUi()) return false;
      const runtime = options.runtime || windowObject.TRICKCAL_STORAGE_RUNTIME_INSTANCE;
      const runtimeState = options.runtimeState || runtime?.getState?.();
      if (runtimeState && (runtimeState.lifecycle && runtimeState.lifecycle !== 'ready' || runtimeState.permission && runtimeState.permission !== 'allowed')) return false;
      return true;
    }

    function maybeAutoOpen() {
      if (!featureEnabled('autoEnabled') || !initialized || autoDecisionMade) return false;
      const safeToOpen = canAutoOpen();
      autoDecisionMade = true;
      if (!safeToOpen) return false;
      const candidate = articles().find(article => article.autoRevision && !isAutoAcknowledged(article));
      if (!candidate) return false;
      return openArticleById(candidate.id, { auto: true });
    }

    function initialize() {
      if (initialized || !documentObject?.body) return false;
      state = readPersistedState();
      createDialog();
      createFollowBar();
      initialized = true;
      refreshUnread();
      notifyLayoutReady();
      if (featureEnabled('autoEnabled') && config.scheduleAuto !== false) {
        const schedule = windowObject.setTimeout || setTimeout;
        schedule(() => maybeAutoOpen(), 0);
      }
      return true;
    }

    return Object.freeze({
      initialize,
      openList,
      openArticleById,
      openGuide,
      close,
      maybeAutoOpen,
      getState() {
        return Object.freeze({
          profile,
          contentProfile,
          page,
          releaseGateOpen: releaseFeatureEnabled('autoEnabled') || releaseFeatureEnabled('bannerEnabled'),
          readIds: state.readIds.slice(),
          autoAcknowledged: state.autoAcknowledged.map(item => ({ ...item })),
          autoDecisionMade,
          unreadCount: articles().filter(article => !isRead(article.id)).length,
          autoArticleId: currentAuto?.id || null,
          dialogOpen: !!dialog?.open,
          view: currentView,
          bannerVisible: !!banner,
          followBarVisible: !!trigger,
          storageFallback
        });
      },
      getLinks: getGuideLinks
    });
  }

  return Object.freeze({
    version: 1,
    noticeStorageKey: NOTICE_STORAGE_KEY,
    createController,
    sanitizeState
  });
});
