// お知らせ一覧・自動表示・旧サイト移行案内の共通UI。
// 通知状態は専用のregistry entryへ保存するが、backup/restoreの対象には含めない。
(function initAnnouncements(root, factory) {
  let data = root?.TRICKCAL_ANNOUNCEMENT_DATA;
  let historyData = root?.TRICKCAL_ANNOUNCEMENT_HISTORY_DATA;
  if (!data && typeof module === 'object' && module.exports && typeof require === 'function') {
    try {
      data = require('./announcements-data');
    } catch (_) {
      data = null;
    }
  }
  if (!historyData && typeof module === 'object' && module.exports && typeof require === 'function') {
    try {
      historyData = require('./announcement-history-data');
    } catch (_) {
      historyData = null;
    }
  }
  const api = factory(root, data, historyData);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (!root) return;
  root.TRICKCAL_ANNOUNCEMENTS = api;
  if (!root.document) return;
  function showStorageUnavailable() {
    const documentObject = root.document;
    const render = () => {
      const trigger = documentObject.querySelector?.('[data-announcement-trigger]');
      if (trigger) {
        trigger.disabled = true;
        trigger.setAttribute('aria-disabled', 'true');
        trigger.setAttribute('aria-label', '保存状態へ接続できないため、お知らせは利用できません');
      }
      if (documentObject.querySelector?.('.trickcal-announcement-storage-unavailable')) return;
      const notice = documentObject.createElement('p');
      notice.className = 'trickcal-announcement-storage-unavailable';
      notice.setAttribute('role', 'status');
      notice.textContent = '保存状態を確認できないため、お知らせ機能は利用できません。このページの閲覧は続けられます。';
      const target = documentObject.querySelector?.('main') || documentObject.body;
      if (target?.firstChild) target.insertBefore(notice, target.firstChild);
      else target?.appendChild?.(notice);
    };
    if (documentObject.readyState === 'loading') {
      documentObject.addEventListener?.('DOMContentLoaded', render, { once: true });
    } else render();
  }
  const boot = root.TRICKCAL_STORAGE_BOOT;
  if (!boot) {
    showStorageUnavailable();
    return;
  }
  Promise.resolve(boot).then(result => {
    if (result?.ok !== true || !root.TRICKCAL_STORAGE_FACADE) {
      showStorageUnavailable();
      return;
    }
    const controller = api.createController({
      window: root,
      document: root.document
    });
    root.TRICKCAL_ANNOUNCEMENTS_CONTROLLER = controller;
    controller.initialize();
  }).catch(error => {
    try { root.console?.warn?.('お知らせUIを初期化できませんでした。', error); } catch (_) { /* no-op */ }
  });
})(typeof globalThis !== 'undefined' ? globalThis : this, function createAnnouncementsApi(windowRoot, defaultData, defaultHistoryData) {
  'use strict';

  const NOTICE_STORAGE_KEY = 'trickcal_notice_state_v1';
  const STATE_VERSION = 1;
  const MAX_STATE_ITEMS = 100;
  const PROFILE_NEW = 'new';
  const PROFILE_LEGACY = 'legacy';
  const PROFILE_LOCALHOST = 'localhost';
  const PAGE_MANAGER = 'manager';
  const PAGE_CALC = 'calc';
  const PAGE_DATA = 'data';
  const PAGE_OTHER = 'other';
  const RELEASE_GATE = 'announcements-migration-20260915';
  const MIGRATION_ARTICLE_ID = 'migration-file-first-20260914';
  const LEGACY_ORIGIN = 'https://innocentroad.github.io';
  const NEW_ORIGIN = 'https://trickcal.irlab.dev';
  const FOCUSABLE_SELECTOR = 'button:not([disabled]), a[href], summary, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function cloneState(state) {
    return {
      version: STATE_VERSION,
      readIds: state.readIds.slice(),
      autoAcknowledged: state.autoAcknowledged.map(item => ({ id: item.id, revision: item.revision })),
      dismissedIds: state.dismissedIds.slice()
    };
  }

  function emptyState() {
    return { version: STATE_VERSION, readIds: [], autoAcknowledged: [], dismissedIds: [] };
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
    const dismissedIds = Array.isArray(value.dismissedIds)
      ? value.dismissedIds.filter(item => typeof item === 'string' && item.trim()).slice(0, MAX_STATE_ITEMS)
      : [];
    if (!Array.isArray(value.readIds) || !Array.isArray(value.autoAcknowledged)) return null;
    return {
      version: STATE_VERSION,
      readIds: Array.from(new Set(readIds)),
      autoAcknowledged: Array.from(new Map(autoAcknowledged.map(item => [`${item.id}\u0000${item.revision}`, item])).values()),
      dismissedIds: Array.from(new Set(dismissedIds))
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
    const historyData = Object.prototype.hasOwnProperty.call(options, 'historyData')
      ? options.historyData
      : defaultHistoryData;
    const fixtureConfig = options.config || windowObject.TRICKCAL_ANNOUNCEMENTS_CONFIG || {};
    const releaseConfig = windowObject.TRICKCAL_ANNOUNCEMENTS_RELEASE_CONFIG || {};
    const config = { ...releaseConfig, ...fixtureConfig };
    const publicSite = windowObject.TRICKCAL_PUBLIC_SITE || {};
    const transferApi = windowObject.TRICKCAL_STORAGE_TRANSFER || {};
    const injectedStorage = Object.prototype.hasOwnProperty.call(options, 'storageLocal')
      ? options.storageLocal
      : null;
    const noticeStorage = () => injectedStorage || windowObject.TRICKCAL_STORAGE_FACADE?.localStorage || null;
    let state = emptyState();
    let storageFallback = false;
    let initialized = false;
    let currentView = 'list';
    let historyVisibleCounts = Object.create(null);
    let currentAuto = null;
    let lastTrigger = null;
    let trigger = null;
    let followBarTrigger = null;
    let dialog = null;
    let dialogBody = null;
    let dialogTitle = null;
    let banner = null;
    let topBar = null;
    let closeHandlerInstalled = false;
    let autoDecisionMade = false;
    let layoutUpdateScheduled = false;
    let followBarResizeObserver = null;
    let followBarResizeHandler = null;
    let displaySettings = null;
    let displaySettingsStatus = null;
    let displaySettingsButton = null;
    let displaySettingsError = null;
    let pendingCloseFocus = null;
    let backupController = null;
    let backupControllerUnsubscribe = null;
    let backupControllerReadyBound = false;
    let storageWarning = null;

    function showStorageWarning(message = '通知状態を保存できません。変更はこの画面だけに反映され、再読込後には残らない場合があります。') {
      if (!documentObject?.body) return;
      storageWarning = documentObject.querySelector?.('.trickcal-announcement-storage-unavailable') || storageWarning;
      if (!storageWarning) {
        storageWarning = documentObject.createElement('p');
        storageWarning.className = 'trickcal-announcement-storage-unavailable';
        storageWarning.setAttribute('role', 'status');
        const target = documentObject.querySelector?.('main') || documentObject.body;
        if (target?.children?.length) target.insertBefore(storageWarning, target.children[0]);
        else target?.appendChild?.(storageWarning);
      }
      storageWarning.textContent = message;
    }

    function clearStorageWarning() {
      if (storageWarning?.parentNode?.removeChild) storageWarning.parentNode.removeChild(storageWarning);
      storageWarning = null;
    }

    function readNoticeRaw() {
      const storage = noticeStorage();
      if (typeof storage?.getItem !== 'function') throw new Error('notification storage unavailable');
      return storage.getItem(NOTICE_STORAGE_KEY);
    }

    function writeNoticeRaw(raw) {
      const storage = noticeStorage();
      if (typeof storage?.setItem !== 'function') throw new Error('notification storage unavailable');
      storage.setItem(NOTICE_STORAGE_KEY, raw);
      return true;
    }

    function readPersistedState() {
      if (!noticeStorage()) {
        storageFallback = true;
        return emptyState();
      }
      try {
        const raw = readNoticeRaw();
        if (raw == null) {
          storageFallback = false;
          return emptyState();
        }
        const parsed = sanitizeState(JSON.parse(raw));
        if (!parsed) {
          storageFallback = true;
          return emptyState();
        }
        storageFallback = false;
        return parsed;
      } catch (_) {
        storageFallback = true;
        return emptyState();
      }
    }

    function persistState(transition) {
      if (typeof transition !== 'function' || !noticeStorage()) {
        storageFallback = true;
        return false;
      }
      try {
        const raw = readNoticeRaw();
        const latest = raw == null ? emptyState() : sanitizeState(JSON.parse(raw));
        if (!latest) {
          storageFallback = true;
          return false;
        }
        const next = sanitizeState(transition(cloneState(latest)));
        if (!next || !writeNoticeRaw(JSON.stringify(next))) {
          storageFallback = true;
          return false;
        }
        state = next;
        storageFallback = false;
        clearStorageWarning();
        return true;
      } catch (_) {
        storageFallback = true;
        return false;
      }
    }

    function applyNoticeTransition(transition) {
      const localNext = sanitizeState(transition(cloneState(state))) || cloneState(state);
      const saved = persistState(transition);
      if (!saved) {
        state = localNext;
        showStorageWarning();
      }
      return saved;
    }

    function refreshPersistedState() {
      try {
        const raw = readNoticeRaw();
        const latest = raw == null ? emptyState() : sanitizeState(JSON.parse(raw));
        if (!latest) {
          storageFallback = true;
          showStorageWarning();
          return false;
        }
        state = latest;
        storageFallback = false;
        clearStorageWarning();
        refreshUnread();
        refreshFollowBar();
        updateDisplaySettings();
        return true;
      } catch (_) {
        storageFallback = true;
        showStorageWarning();
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
      if (config.fixture === true && [PAGE_MANAGER, PAGE_CALC, PAGE_DATA, PAGE_OTHER].includes(config.page)) {
        return config.page;
      }
      const pathname = safeText(windowObject?.location?.pathname);
      if (/\/manager(?:\/|$)|stat-dashboard\.html$/.test(pathname)) return PAGE_MANAGER;
      if (/\/calc(?:\/|$)|formation-damage-calc\.html$/.test(pathname)) return PAGE_CALC;
      if (/\/data(?:\/|$)/.test(pathname)) return PAGE_DATA;
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
        return data?.getArticleForProfile?.(id, contentProfile)
          || data?.getArticle?.(id, undefined, contentProfile)
          || articles().find(article => article.id === id)
          || null;
      } catch (_) {
        return null;
      }
    }

    function validatedHistoryEntries() {
      if (!historyData || typeof historyData.validateEntries !== 'function') {
        return { ok: false, entries: [] };
      }
      try {
        const result = historyData.validateEntries(historyData);
        return result?.ok === true && Array.isArray(result.entries)
          ? { ok: true, entries: result.entries }
          : { ok: false, entries: [] };
      } catch (_) {
        return { ok: false, entries: [] };
      }
    }

    function isRead(id) {
      return state.readIds.includes(id);
    }

    function isAutoAcknowledged(article) {
      return state.autoAcknowledged.some(item => item.id === article.id && item.revision === article.autoRevision);
    }

    function isDismissed(article) {
      return !!article?.id && state.dismissedIds.includes(article.id);
    }

    function notificationArticles() {
      return articles().filter(article => !isDismissed(article));
    }

    function markRead(id) {
      if (!id) return false;
      if (isRead(id)) return true;
      const saved = applyNoticeTransition(latest => {
        latest.readIds = [id].concat(latest.readIds.filter(item => item !== id)).slice(0, MAX_STATE_ITEMS);
        return latest;
      });
      refreshUnread();
      return saved;
    }

    function acknowledgeAuto(article) {
      if (!article?.autoRevision) return false;
      const saved = applyNoticeTransition(latest => {
        latest.autoAcknowledged = [{ id: article.id, revision: article.autoRevision }]
          .concat(latest.autoAcknowledged.filter(item => !(item.id === article.id && item.revision === article.autoRevision)))
          .slice(0, MAX_STATE_ITEMS);
        latest.readIds = [article.id].concat(latest.readIds.filter(item => item !== article.id)).slice(0, MAX_STATE_ITEMS);
        return latest;
      });
      refreshUnread();
      return saved;
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
      const oldManager = withQuery(oldManagerRoute, {
        view: 'settings',
        backup: '1',
        notice: 'migration-guide'
      });
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

    function openLegacyManagerBackupMenu() {
      const opened = requestLegacyManagerBackupMenu();
      close();
      return opened;
    }

    function backupRecoveryUrl() {
      return routeUrl('recovery', profile === PROFILE_LEGACY
        ? '/trickcal-manager/storage-recovery.html'
        : '/recovery/');
    }

    function syncGuideBackupState() {
      const requestButton = dialogBody?.querySelector?.('[data-announcement-backup-request]');
      const status = dialogBody?.querySelector?.('[data-announcement-backup-status]');
      const recovery = dialogBody?.querySelector?.('[data-announcement-backup-recovery]');
      if (!requestButton && !status && !recovery) return;
      const state = backupController?.getState?.() || { phase: 'idle' };
      if (requestButton) {
        const retryLocked = state.phase === 'finished' && state.retryable === false;
        requestButton.disabled = state.phase === 'running' || retryLocked || !backupController;
        requestButton.textContent = state.phase === 'running'
          ? 'バックアップを作成しています…'
          : state.recoveryRequired
            ? '復旧後に再試行'
            : 'バックアップを保存';
      }
      if (status) {
        let message = '';
        if (!backupController) message = '保存機能を準備しています…';
        else if (state.phase === 'running') message = `バックアップを作成しています…（対象：${state.targetDescription || '現在の設定'}）`;
        else if (state.phase === 'finished') message = state.message || 'バックアップ結果を確認してください。';
        status.textContent = message;
        status.hidden = !message;
        status.classList.toggle('is-error', !!state.recoveryRequired || (state.phase === 'finished' && state.resultCode !== 'download-requested'));
      }
      if (recovery) {
        recovery.hidden = !state.recoveryRequired;
        recovery.href = backupRecoveryUrl();
      }
    }

    function bindBackupController() {
      const next = windowObject?.TRICKCAL_BACKUP_CONTROLLER;
      if (next === backupController) {
        syncGuideBackupState();
        return;
      }
      backupControllerUnsubscribe?.();
      backupController = next?.request && next?.getState ? next : null;
      backupControllerUnsubscribe = backupController?.subscribe?.(() => syncGuideBackupState()) || null;
      syncGuideBackupState();
    }

    function requestGuideBackup() {
      bindBackupController();
      if (!backupController?.request) {
        syncGuideBackupState();
        return false;
      }
      void backupController.request();
      return true;
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
        const candidates = getFocusableCandidates(dialog);
        (candidates[0] || dialog)?.focus?.();
      } catch (_) { /* no-op */ }
    }

    function getFocusableCandidates(container) {
      return Array.from(container?.querySelectorAll?.(FOCUSABLE_SELECTOR) || []).filter(element => {
        if (element.disabled || element.hidden || element.inert
          || element.getAttribute?.('disabled') !== null
          || element.getAttribute?.('hidden') !== null
          || element.getAttribute?.('inert') !== null
          || element.getAttribute?.('aria-hidden') === 'true'
          || element.getAttribute?.('tabindex') === '-1') return false;
        let ancestor = element;
        while (ancestor?.nodeType === 1) {
          if (ancestor.hidden || ancestor.inert
            || ancestor.getAttribute?.('hidden') !== null
            || ancestor.getAttribute?.('inert') !== null
            || ancestor.getAttribute?.('aria-hidden') === 'true') return false;
          if (ancestor.tagName === 'DETAILS' && !ancestor.open
            && ancestor.querySelector?.('summary') !== element) return false;
          if (ancestor.tagName === 'DIALOG' && ancestor !== dialog && !ancestor.open) return false;
          try {
            const style = windowObject.getComputedStyle?.(ancestor);
            if (style?.display === 'none' || style?.visibility === 'hidden') return false;
          } catch (_) { /* computed styles are optional in fixtures */ }
          ancestor = ancestor.parentNode;
        }
        return true;
      });
    }

    function focusWithoutScroll(element) {
      try { element?.focus?.({ preventScroll: true }); } catch (_) {
        try { element?.focus?.(); } catch (_) { /* no-op */ }
      }
    }

    function ensureDisplaySettings() {
      if (!documentObject?.body) return false;
      displaySettings = documentObject.querySelector?.('[data-announcement-display-settings]') || null;
      if (!displaySettings) {
        const anchor = documentObject.querySelector?.('.site-rights-footer');
        const parent = anchor?.parentNode || documentObject.querySelector?.('main') || documentObject.body;
        if (!parent) return false;
        displaySettings = documentObject.createElement('details');
        displaySettings.className = 'trickcal-announcement-display-settings';
        displaySettings.dataset.announcementDisplaySettings = 'true';
        displaySettings.setAttribute('data-announcement-display-settings', 'true');
        const summary = appendElement(displaySettings, 'summary', '表示設定');
        summary.className = 'trickcal-announcement-display-settings-summary';
        const content = appendElement(displaySettings, 'div', undefined, 'trickcal-announcement-display-settings-content');
        appendElement(content, 'p', '', 'trickcal-announcement-display-status');
        const button = appendElement(content, 'button', '移行案内を再表示', 'trickcal-announcement-restore');
        button.type = 'button';
        button.dataset.announcementRestore = 'true';
        button.setAttribute('data-announcement-restore', 'true');
        button.hidden = true;
        appendElement(content, 'p', '', 'trickcal-announcement-display-error');
        if (anchor?.nextSibling) parent.insertBefore(displaySettings, anchor.nextSibling);
        else parent.appendChild(displaySettings);
      }
      displaySettingsStatus = displaySettings.querySelector?.('[data-announcement-display-status]')
        || displaySettings.querySelector?.('.trickcal-announcement-display-status');
      displaySettingsButton = displaySettings.querySelector?.('[data-announcement-restore]')
        || displaySettings.querySelector?.('.trickcal-announcement-restore');
      displaySettingsError = displaySettings.querySelector?.('[data-announcement-display-error]')
        || displaySettings.querySelector?.('.trickcal-announcement-display-error');
      if (displaySettings.dataset.announcementsBound !== 'true') {
        displaySettingsButton?.addEventListener?.('click', restoreDismissed);
        displaySettings.dataset.announcementsBound = 'true';
      }
      return true;
    }

    function updateDisplaySettings(errorMessage = '') {
      if (!ensureDisplaySettings()) return;
      const article = articleById(MIGRATION_ARTICLE_ID);
      const enabled = !!article && (featureEnabled('bannerEnabled') || featureEnabled('autoEnabled'));
      displaySettings.hidden = !enabled;
      const dismissed = isDismissed(article);
      if (displaySettingsStatus) {
        displaySettingsStatus.textContent = dismissed
          ? '移行案内は非表示です。必要な場合はここから再表示できます。'
          : '移行案内は表示中です。';
      }
      if (displaySettingsButton) {
        displaySettingsButton.hidden = !dismissed;
        displaySettingsButton.disabled = !dismissed;
      }
      if (displaySettingsError) {
        displaySettingsError.textContent = errorMessage;
        displaySettingsError.hidden = !errorMessage;
      }
    }

    function restoreDismissed() {
      const article = articleById(MIGRATION_ARTICLE_ID);
      if (!article || !isDismissed(article)) return false;
      const saved = applyNoticeTransition(latest => {
        latest.dismissedIds = latest.dismissedIds.filter(id => id !== article.id);
        return latest;
      });
      updateDisplaySettings(saved ? '' : 'この画面では再表示しましたが、設定を保存できませんでした。再読み込みすると非表示のままの場合があります。');
      refreshFollowBar();
      const stableTarget = displaySettings?.querySelector?.('summary') || displaySettings;
      focusWithoutScroll(stableTarget);
      const schedule = windowObject.requestAnimationFrame || windowObject.setTimeout;
      if (typeof schedule === 'function') schedule(() => focusWithoutScroll(stableTarget), 0);
      return true;
    }

    function dismissArticle(article) {
      if (!article?.id || isDismissed(article)) return false;
      const saved = applyNoticeTransition(latest => {
        latest.dismissedIds = [article.id].concat(latest.dismissedIds.filter(id => id !== article.id)).slice(0, MAX_STATE_ITEMS);
        return latest;
      });
      updateDisplaySettings(saved ? '' : 'この画面では非表示にしましたが、設定を保存できませんでした。再読み込みすると表示される場合があります。');
      refreshFollowBar();
      const stableTarget = displaySettings?.querySelector?.('summary') || displaySettingsButton || documentObject.body;
      close({ focusTarget: stableTarget });
      return true;
    }

    function setDialogTitle(text) {
      if (dialogTitle) dialogTitle.textContent = safeText(text);
    }

    function measureFollowBar() {
      const root = documentObject?.documentElement;
      if (!root?.style) return;
      const topHeight = Number(topBar?.getBoundingClientRect?.().height || topBar?.offsetHeight || 0);
      const followHeight = Number(followBarTrigger?.getBoundingClientRect?.().height || followBarTrigger?.offsetHeight || 0);
      if (topHeight > 0) root.style.setProperty('--trickcal-topbar-height', `${topHeight}px`);
      root.style.setProperty('--trickcal-follow-bar-height', `${Math.max(0, followHeight)}px`);
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

    function entryUrl() {
      try {
        const location = windowObject?.location;
        if (!location) return null;
        return new URL(location.href || `${location.origin || ''}${location.pathname || ''}${location.search || ''}${location.hash || ''}`);
      } catch (_) {
        return null;
      }
    }

    function hasMigrationGuideEntry() {
      const url = entryUrl();
      return profile === PROFILE_LEGACY
        && page === PAGE_MANAGER
        && url?.searchParams?.get('notice') === 'migration-guide';
    }

    function consumeMigrationGuideEntry() {
      const url = entryUrl();
      if (!url || url.searchParams.get('notice') !== 'migration-guide') return false;
      url.searchParams.delete('notice');
      url.searchParams.delete('backup');
      const history = windowObject?.history;
      if (typeof history?.replaceState !== 'function') return false;
      const next = `${url.pathname}${url.search}${url.hash}`;
      history.replaceState(history.state || null, '', next);
      return true;
    }

    function openMigrationGuideEntry() {
      if (!hasMigrationGuideEntry()) return false;
      autoDecisionMade = true;
      const opened = openGuide(null, { preserveNoticeState: true });
      if (opened) {
        consumeMigrationGuideEntry();
        return true;
      }
      const fallback = requestLegacyManagerBackupMenu();
      if (fallback) consumeMigrationGuideEntry();
      return fallback;
    }

    function renderCurrentArticleCard(parent, article) {
      const item = appendElement(parent, 'article', undefined, 'trickcal-announcement-card');
      const button = appendElement(item, 'button', undefined, 'trickcal-announcement-card-button');
      button.type = 'button';
      button.dataset.articleId = article.id;
      const meta = appendElement(button, 'span', `${article.date} · ${article.category}`, 'trickcal-announcement-meta');
      meta.setAttribute('aria-hidden', 'true');
      appendElement(button, 'strong', article.title, 'trickcal-announcement-title');
      appendElement(button, 'span', article.summary, 'trickcal-announcement-summary');
      const unread = appendElement(button, 'span', '未読', 'trickcal-announcement-unread');
      unread.dataset.announcementUnreadId = article.id;
      unread.hidden = isRead(article.id);
      button.addEventListener('click', () => openArticleById(article.id));
      return item;
    }

    function renderImportantArticle(parent) {
      const section = appendElement(parent, 'section', undefined, 'trickcal-announcement-important');
      appendElement(section, 'h3', '重要なお知らせ', 'trickcal-announcement-section-title');
      const article = articleById(MIGRATION_ARTICLE_ID);
      if (!article) {
        appendElement(section, 'p', '移行案内を現在表示できません。', 'trickcal-announcement-history-unavailable');
        return;
      }
      const card = appendElement(section, 'article', undefined, 'trickcal-announcement-important-card');
      appendElement(card, 'strong', article.title, 'trickcal-announcement-title');
      appendElement(card, 'p', article.summary, 'trickcal-announcement-summary');
      const unread = appendElement(card, 'span', '未読', 'trickcal-announcement-unread');
      unread.dataset.announcementUnreadId = article.id;
      unread.hidden = isRead(article.id);
      const button = appendElement(card, 'button', '移行の詳細を見る', 'trickcal-announcement-open-migration');
      button.type = 'button';
      button.dataset.articleId = article.id;
      button.addEventListener('click', () => openArticleById(MIGRATION_ARTICLE_ID));
    }

    function appendHistoryEntry(parent, entry) {
      const item = appendElement(parent, 'li', undefined, 'trickcal-announcement-history-item');
      const details = appendElement(item, 'details', undefined, 'trickcal-announcement-history-entry');
      details.dataset.historyId = entry.id;
      const summary = appendElement(details, 'summary', undefined, 'trickcal-announcement-history-summary');
      const meta = appendElement(summary, 'span', undefined, 'trickcal-announcement-history-meta');
      const time = appendElement(meta, 'time', entry.date, 'trickcal-announcement-history-date');
      time.setAttribute('datetime', entry.date);
      const categoryLabels = { 'game-data': 'ゲームデータ', feature: '機能', fix: '不具合修正' };
      appendElement(meta, 'span', categoryLabels[entry.category], 'trickcal-announcement-history-category');
      appendElement(summary, 'strong', entry.title, 'trickcal-announcement-history-title');
      entry.items.forEach(text => appendElement(details, 'p', text, 'trickcal-announcement-history-paragraph'));
      if (Array.isArray(entry.historicalNotes) && entry.historicalNotes.length) {
        const notes = appendElement(details, 'aside', undefined, 'trickcal-announcement-history-notes');
        appendElement(notes, 'h4', '更新当時の注記');
        const list = appendElement(notes, 'ul');
        entry.historicalNotes.forEach(text => appendElement(list, 'li', text));
      }
      return item;
    }

    function renderHistorySection(parent, { key, title, entries, initialVisible, firstMoreLabel }) {
      const section = appendElement(parent, 'section', undefined, `trickcal-announcement-history-section is-${key}`);
      appendElement(section, 'h3', title, 'trickcal-announcement-section-title');
      if (!entries.length) {
        appendElement(section, 'p', 'この区分の更新履歴はありません。', 'trickcal-announcement-history-empty');
        return;
      }
      const listId = `trickcal-announcement-history-${key}-list`;
      const list = appendElement(section, 'ol', undefined, 'trickcal-announcement-history-list');
      list.id = listId;
      const live = appendElement(section, 'span', '', 'trickcal-announcement-history-live');
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      let shown = Math.min(
        Math.max(initialVisible, Number(historyVisibleCounts[key] || initialVisible)),
        entries.length
      );
      historyVisibleCounts[key] = shown;
      entries.slice(0, shown).forEach(entry => appendHistoryEntry(list, entry));
      if (shown >= entries.length) return;
      const moreLabel = shown > initialVisible ? 'もっと見る' : firstMoreLabel;
      const more = appendElement(section, 'button', moreLabel, 'trickcal-announcement-history-more');
      more.type = 'button';
      more.dataset.historyLoadMore = key;
      more.setAttribute('aria-controls', listId);
      more.addEventListener('click', () => {
        const nextShown = Math.min(shown + 5, entries.length);
        const addedItems = entries.slice(shown, nextShown).map(entry => appendHistoryEntry(list, entry));
        const added = nextShown - shown;
        shown = nextShown;
        historyVisibleCounts[key] = shown;
        live.textContent = `${added}件を追加しました。${shown} / ${entries.length}件を表示中です。`;
        const allShown = shown >= entries.length;
        more.textContent = allShown ? '' : 'もっと見る';
        more.hidden = allShown;
        if (allShown) {
          const firstNewSummary = addedItems[0]?.querySelector?.('summary');
          if (firstNewSummary) firstNewSummary.focus?.();
        } else if (documentObject.activeElement !== more) {
          more.focus?.();
        }
      });
    }

    function renderList() {
      if (!dialogBody) return;
      currentView = 'list';
      setDialogTitle('お知らせ');
      dialogBody.replaceChildren?.();
      dialogBody.dataset.announcementView = 'list';
      renderImportantArticle(dialogBody);
      const historyScroll = appendElement(dialogBody, 'div', undefined, 'trickcal-announcement-history-scroll');
      const history = validatedHistoryEntries();
      if (!history.ok) {
        appendElement(historyScroll, 'p', '更新履歴を現在表示できません。', 'trickcal-announcement-history-unavailable');
      } else {
        const gameEntries = history.entries.filter(entry => entry.category === 'game-data');
        const siteEntries = history.entries.filter(entry => entry.category === 'feature' || entry.category === 'fix');
        renderHistorySection(historyScroll, {
          key: 'game-data',
          title: 'ゲームデータ更新',
          entries: gameEntries,
          initialVisible: 1,
          firstMoreLabel: '過去の更新を見る'
        });
        renderHistorySection(historyScroll, {
          key: 'site-updates',
          title: 'サイトの更新履歴',
          entries: siteEntries,
          initialVisible: 3,
          firstMoreLabel: 'もっと見る'
        });
      }
      const otherArticles = articles().filter(article => article.id !== MIGRATION_ARTICLE_ID);
      if (otherArticles.length) {
        const section = appendElement(historyScroll, 'section', undefined, 'trickcal-announcements-list');
        appendElement(section, 'h3', 'その他のお知らせ', 'trickcal-announcement-section-title');
        otherArticles.forEach(article => renderCurrentArticleCard(section, article));
      }
    }

    function renderArticle(article, auto = false) {
      if (!dialogBody || !article) return false;
      currentView = 'article';
      dialogBody.dataset.announcementView = 'article';
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
      appendDismissControl(dialogBody, article);
      if (!auto && !markRead(article.id)) {
        appendElement(dialogBody, 'p', 'この記事を既読にしましたが、既読状態を保存できませんでした。', 'trickcal-announcement-storage-unavailable');
      }
      return true;
    }

    function appendDismissControl(parent, article) {
      if (isDismissed(article)) {
        appendElement(parent, 'p', 'この移行案内は表示設定から再表示できます。', 'trickcal-announcement-dismissed-note');
        return;
      }
      const actions = appendElement(parent, 'div', undefined, 'trickcal-announcement-dismiss-actions');
      const button = appendElement(actions, 'button', 'この移行案内を今後表示しない', 'trickcal-announcement-dismiss');
      button.type = 'button';
      button.addEventListener('click', () => dismissArticle(article));
      appendElement(actions, 'p', '移行済み・移行不要の場合に非表示にできます。表示設定から戻せます。', 'trickcal-announcement-dismiss-help');
    }

    function renderGuide() {
      if (!dialogBody) return false;
      currentView = 'guide';
      dialogBody.dataset.announcementView = 'guide';
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
      const oldLink = appendElement(actions, sameScreenLegacyManager ? 'button' : 'a', sameScreenLegacyManager ? 'バックアップを保存' : '旧サイトのバックアップ画面を開く', 'trickcal-announcement-guide-link');
      if (sameScreenLegacyManager) {
        oldLink.type = 'button';
        oldLink.dataset.announcementAction = 'open-backup-menu';
        oldLink.dataset.announcementBackupRequest = 'true';
        oldLink.setAttribute('data-announcement-backup-request', 'true');
        oldLink.addEventListener('click', requestGuideBackup);
      } else {
        oldLink.href = links.oldManager;
        oldLink.target = profile === PROFILE_LEGACY && page === PAGE_CALC ? '_self' : '_blank';
        if (oldLink.target === '_blank') oldLink.rel = 'noopener';
      }
      if (sameScreenLegacyManager) {
        const menuLink = appendElement(actions, 'button', '保存メニューを開く', 'trickcal-announcement-guide-link trickcal-announcement-guide-menu-link');
        menuLink.type = 'button';
        menuLink.dataset.announcementAction = 'open-backup-menu';
        menuLink.addEventListener('click', openLegacyManagerBackupMenu);
      }
      const newLink = appendElement(actions, 'a', '新サイトで読み込む', 'trickcal-announcement-guide-link');
      newLink.href = links.newTransfer;
      newLink.target = '_blank';
      newLink.rel = 'noopener';
      const details = appendElement(dialogBody, 'details', undefined, 'trickcal-announcement-guide-details');
      appendElement(details, 'summary', '困った時');
      appendElement(details, 'p', '適用前のプレビューと明示確認を使い、保存先と件数を確認してください。自動転送は実行されません。複数タブで同じサイトを開いている場合は、未保存の編集がないことを確認してから他のタブを閉じて、もう一度試してください。');
      if (sameScreenLegacyManager) {
        const backupStatus = appendElement(dialogBody, 'p', '', 'trickcal-announcement-backup-status');
        backupStatus.setAttribute('role', 'status');
        backupStatus.dataset.announcementBackupStatus = 'true';
        backupStatus.setAttribute('data-announcement-backup-status', 'true');
        backupStatus.hidden = true;
        const recovery = appendElement(dialogBody, 'a', '復旧ページを開く', 'trickcal-announcement-backup-recovery');
        recovery.dataset.announcementBackupRecovery = 'true';
        recovery.setAttribute('data-announcement-backup-recovery', 'true');
        recovery.href = backupRecoveryUrl();
        recovery.target = '_blank';
        recovery.rel = 'noopener';
        recovery.hidden = true;
        bindBackupController();
      }
      appendDismissControl(dialogBody, articleById(MIGRATION_ARTICLE_ID));
      return true;
    }

    function close(options = {}) {
      if (!dialog) return false;
      const focusTarget = options.focusTarget || null;
      pendingCloseFocus = focusTarget;
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
      if (focusTarget && typeof windowObject.setTimeout === 'function') {
        windowObject.setTimeout(() => focusWithoutScroll(focusTarget), 50);
      }
      return true;
    }

    function handleDialogClosed() {
      currentView = 'list';
      setDialogTitle('お知らせ');
      const focusTarget = pendingCloseFocus;
      pendingCloseFocus = null;
      if (focusTarget) {
        focusWithoutScroll(focusTarget);
        const schedule = windowObject.requestAnimationFrame || windowObject.setTimeout;
        if (typeof schedule === 'function') schedule(() => focusWithoutScroll(focusTarget), 0);
      } else if (lastTrigger) focusWithoutScroll(lastTrigger);
      lastTrigger = null;
      refreshUnread();
    }

    function openList(source = null) {
      if (!dialog || dialog.open) return false;
      lastTrigger = source || trigger;
      currentAuto = null;
      historyVisibleCounts = Object.create(null);
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

    function openGuide(source = null, options = {}) {
      if (!dialog) return false;
      if (!dialog.open) lastTrigger = source || trigger;
      if (!options.preserveNoticeState) acknowledgeCurrentAuto();
      renderGuide();
      openDialog();
      focusDialogStart();
      return true;
    }

    function refreshUnread() {
      const visibleArticles = notificationArticles();
      const unreadCount = visibleArticles.filter(article => !isRead(article.id)).length;
      const currentArticle = visibleArticles[0] || articles()[0];
      const targets = [trigger, followBarTrigger].filter((item, index, list) => item && list.indexOf(item) === index);
      targets.forEach(target => {
        target.dataset.unread = unreadCount > 0 ? 'true' : 'false';
        target.setAttribute('aria-label', `${unreadCount > 0 ? `未読${unreadCount}件。` : ''}お知らせ。${currentArticle?.barTitle || '最新のお知らせ'}`);
        target.setAttribute('title', unreadCount > 0 ? `お知らせ（未読${unreadCount}件）` : 'お知らせ');
        const unreadIndicator = target.querySelector?.('.trickcal-announcements-follow-unread');
        if (unreadIndicator) unreadIndicator.hidden = unreadCount <= 0;
      });
      documentObject?.querySelectorAll?.('[data-announcement-unread-id]')?.forEach?.(marker => {
        marker.hidden = isRead(marker.dataset.announcementUnreadId);
      });
    }

    function removeFollowBar() {
      if (followBarResizeObserver?.disconnect) followBarResizeObserver.disconnect();
      followBarResizeObserver = null;
      if (followBarResizeHandler && typeof windowObject.removeEventListener === 'function') {
        windowObject.removeEventListener('resize', followBarResizeHandler);
      }
      followBarResizeHandler = null;
      if (followBarTrigger?.parentNode?.removeChild) followBarTrigger.parentNode.removeChild(followBarTrigger);
      if (trigger === followBarTrigger) trigger = null;
      followBarTrigger = null;
      banner = null;
      measureFollowBar();
    }

    function createFollowBar(articleOverride = null) {
      if (!featureEnabled('bannerEnabled') || !documentObject?.body) return false;
      const migrationArticle = articleById(MIGRATION_ARTICLE_ID);
      const article = articleOverride?.id === MIGRATION_ARTICLE_ID ? articleOverride : migrationArticle;
      if (!article || isDismissed(article)) {
        removeFollowBar();
        return false;
      }
      topBar = documentObject.querySelector?.('.dashboard-top-control-bar, .fdc-top-control-bar');
      if (!topBar?.parentNode) return false;
      followBarTrigger = documentObject.querySelector?.('.trickcal-announcements-follow-bar') || null;
      if (!followBarTrigger) {
        followBarTrigger = documentObject.createElement('button');
        followBarTrigger.type = 'button';
        followBarTrigger.className = 'trickcal-announcements-follow-bar';
        followBarTrigger.setAttribute('aria-haspopup', 'dialog');
        followBarTrigger.setAttribute('aria-controls', 'trickcal-announcements-dialog');
        appendElement(followBarTrigger, 'span', 'お知らせ', 'trickcal-announcements-follow-label');
        appendElement(followBarTrigger, 'span', article.barTitle || article.title, 'trickcal-announcements-follow-title');
        appendElement(followBarTrigger, 'span', '未読', 'trickcal-announcements-follow-unread');
        const arrow = appendElement(followBarTrigger, 'span', '›', 'trickcal-announcements-follow-arrow');
        arrow.setAttribute('aria-hidden', 'true');
        topBar.parentNode.insertBefore(followBarTrigger, topBar.nextSibling);
      }
      if (!trigger) trigger = followBarTrigger;
      banner = followBarTrigger;
      const title = followBarTrigger.querySelector?.('.trickcal-announcements-follow-title');
      if (title) title.textContent = article.barTitle || article.title;
      followBarTrigger.dataset.articleId = article.id;
      if (followBarTrigger.dataset.announcementsBound !== 'true') {
        followBarTrigger.addEventListener('click', () => {
          const currentArticleId = followBarTrigger?.dataset?.articleId;
          if (currentArticleId) openArticleById(currentArticleId, { source: followBarTrigger });
        });
        followBarTrigger.dataset.announcementsBound = 'true';
      }
      refreshUnread();
      measureFollowBar();
      scheduleFollowBarMetrics();
      if (!followBarResizeHandler && typeof windowObject.addEventListener === 'function') {
        followBarResizeHandler = scheduleFollowBarMetrics;
        windowObject.addEventListener('resize', followBarResizeHandler);
      }
      if (typeof windowObject.ResizeObserver === 'function') {
        followBarResizeObserver?.disconnect?.();
        followBarResizeObserver = new windowObject.ResizeObserver(scheduleFollowBarMetrics);
        followBarResizeObserver.observe(topBar);
        followBarResizeObserver.observe(followBarTrigger);
      }
      return true;
    }

    function refreshFollowBar() {
      if (!featureEnabled('bannerEnabled')) {
        removeFollowBar();
        return false;
      }
      return createFollowBar();
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
          const candidates = getFocusableCandidates(dialog);
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

    function bindTopbarTrigger() {
      const candidate = documentObject?.querySelector?.('[data-announcement-trigger]');
      if (!candidate) return false;
      trigger = candidate;
      candidate.setAttribute('aria-haspopup', 'dialog');
      candidate.setAttribute('aria-controls', 'trickcal-announcements-dialog');
      if (candidate.dataset.announcementsBound !== 'true') {
        candidate.addEventListener('click', () => openList(candidate));
        candidate.dataset.announcementsBound = 'true';
      }
      return true;
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
      if (hasMigrationGuideEntry()) {
        autoDecisionMade = true;
        return false;
      }
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
      if (storageFallback) showStorageWarning('通知状態を読み込めませんでした。既読・非表示の変更は保存できません。');
      createDialog();
      bindTopbarTrigger();
      createFollowBar();
      ensureDisplaySettings();
      if (!backupControllerReadyBound && typeof windowObject.addEventListener === 'function') {
        windowObject.addEventListener('trickcal-backup-controller-ready', bindBackupController);
        backupControllerReadyBound = true;
      }
      bindBackupController();
      initialized = true;
      if (typeof windowObject.addEventListener === 'function') {
        windowObject.addEventListener('storage', event => {
          if (event?.key !== NOTICE_STORAGE_KEY && event?.key !== null) return;
          refreshPersistedState();
        });
        windowObject.addEventListener('trickcal-storage-resumed', refreshPersistedState);
      }
      refreshUnread();
      updateDisplaySettings();
      openMigrationGuideEntry();
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
          dismissedIds: state.dismissedIds.slice(),
          autoDecisionMade,
          unreadCount: notificationArticles().filter(article => !isRead(article.id)).length,
          autoArticleId: currentAuto?.id || null,
          dialogOpen: !!dialog?.open,
          view: currentView,
          bannerVisible: !!banner,
          followBarVisible: !!followBarTrigger,
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
