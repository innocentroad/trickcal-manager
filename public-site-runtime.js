(() => {
  'use strict';

  const fallbackLegacy = window.location.pathname.startsWith('/trickcal-manager/');
  const fallbackBasePath = fallbackLegacy ? '/trickcal-manager/' : '/';
  const fallbackRoutes = fallbackLegacy
    ? {
      home: '/trickcal-manager/',
      manager: '/trickcal-manager/stat-dashboard.html',
      calc: '/trickcal-manager/formation-damage-calc.html',
      dps: '/trickcal-manager/formation-damage-dps-prototype.html',
      share: '/trickcal-manager/formation-share.html',
      data: '/trickcal-manager/data/',
      enemies: '/trickcal-manager/enemy-status.html',
      board: '/trickcal-manager/public/board-layout-preview.html',
      transfer: '/trickcal-manager/storage-transfer.html',
      recovery: '/trickcal-manager/storage-recovery.html'
    }
    : {
      home: '/',
      manager: '/manager/',
      calc: '/calc/',
      dps: '/calc/dps/',
      share: '/share/',
      data: '/data/',
      enemies: '/data/enemies/',
      board: '/data/boards/',
      transfer: '/transfer/',
      recovery: '/recovery/'
    };
  const fallbackConfig = {
    profile: fallbackLegacy ? 'legacy' : 'source',
    origin: window.location.origin,
    basePath: fallbackBasePath,
    assetBasePath: fallbackBasePath,
    assetVersion: '',
    routes: fallbackRoutes,
    peerRoutes: fallbackLegacy ? {
      transfer: '/transfer/',
      recovery: '/recovery/'
    } : fallbackRoutes,
    serviceWorker: {
      script: 'service-worker.js',
      scope: fallbackBasePath
    }
  };
  const configured = window.TRICKCAL_PUBLIC_SITE_CONFIG && typeof window.TRICKCAL_PUBLIC_SITE_CONFIG === 'object'
    ? window.TRICKCAL_PUBLIC_SITE_CONFIG
    : {};
  const config = {
    ...fallbackConfig,
    ...configured,
    routes: { ...fallbackRoutes, ...(configured.routes || {}) },
    peerRoutes: { ...fallbackConfig.peerRoutes, ...(configured.peerRoutes || {}) },
    serviceWorker: { ...fallbackConfig.serviceWorker, ...(configured.serviceWorker || {}) }
  };

  function splitSuffix(value) {
    const match = String(value).match(/[?#]/);
    if (!match) return { path: String(value), suffix: '' };
    return { path: String(value).slice(0, match.index), suffix: String(value).slice(match.index) };
  }

  function versionedSuffix(suffix) {
    const version = String(config.assetVersion || '');
    if (!version) return suffix;
    const hashIndex = suffix.indexOf('#');
    const query = hashIndex >= 0 ? suffix.slice(0, hashIndex) : suffix;
    const hash = hashIndex >= 0 ? suffix.slice(hashIndex) : '';
    const parts = query.startsWith('?') ? query.slice(1).split('&').filter(Boolean) : [];
    const kept = parts.filter(part => !/^v=/.test(part));
    kept.push(`v=${version}`);
    return `?${kept.join('&')}${hash}`;
  }

  function pagePath(routeId, peer = false) {
    const routes = peer ? config.peerRoutes : config.routes;
    return typeof routes?.[routeId] === 'string' ? routes[routeId] : '';
  }

  function pageUrl(routeId, query = '', hash = '') {
    if (query && typeof query === 'object') {
      hash = query.hash || '';
      query = query.query || '';
    }
    const path = pagePath(routeId);
    if (!path) throw new Error(`unknown public route: ${routeId}`);
    const queryPart = query ? (String(query).startsWith('?') ? String(query) : `?${query}`) : '';
    const hashPart = hash ? (String(hash).startsWith('#') ? String(hash) : `#${hash}`) : '';
    return `${path}${queryPart}${hashPart}`;
  }

  function peerPageUrl(routeId, origin = '') {
    const path = pagePath(routeId, true);
    if (!path) throw new Error(`unknown public peer route: ${routeId}`);
    if (!origin) return path;
    return new URL(path, `${String(origin).replace(/\/+$/, '')}/`).href;
  }

  function assetUrl(assetPath, options = {}) {
    const value = String(assetPath || '');
    if (/^(?:data|blob|https?):/i.test(value) || value.startsWith('//') || value.startsWith('#')) return value;
    const { path, suffix } = splitSuffix(value);
    if (!path || path.startsWith('/') || path.includes('\\') || path.split('/').some(part => !part || part === '.' || part === '..')) {
      throw new TypeError(`assetUrl requires a manifest-relative path: ${value}`);
    }
    const base = String(config.assetBasePath || '/').replace(/\/+$/, '');
    return `${base}/${path}${options?.versioned === false ? suffix : versionedSuffix(suffix)}`;
  }

  function routeIdForUrl(value) {
    try {
      const pathname = new URL(value, window.location.href).pathname;
      return Object.keys(config.routes).find(id => config.routes[id] === pathname) || '';
    } catch (_) {
      return '';
    }
  }

  function normalizeDynamicAsset(value) {
    const text = String(value || '');
    if (!/^(?:\.\.\/)*img\//.test(text)) return text;
    return assetUrl(text.replace(/^(?:\.\.\/)+/, ''));
  }

  function normalizeElement(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    for (const attribute of ['src', 'poster']) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const normalized = normalizeDynamicAsset(value);
      if (normalized !== value) element.setAttribute(attribute, normalized);
    }
    const style = element.getAttribute('style');
    if (style && /url\(\s*['"]?(?:\.\.\/)*img\//.test(style)) {
      const normalized = style.replace(/url\(\s*(['"]?)(\.\.\/)*?(img\/[^'")]+)\1\s*\)/gi, (_match, quote, _up, asset) => `url(${quote}${assetUrl(asset)}${quote})`);
      if (normalized !== style) element.setAttribute('style', normalized);
    }
  }

  const publicSite = Object.freeze({
    profile: config.profile,
    origin: config.origin,
    basePath: config.basePath,
    assetBasePath: config.assetBasePath,
    assetVersion: config.assetVersion || '',
    pagePath: routeId => pagePath(routeId),
    pageUrl,
    peerPageUrl,
    assetUrl,
    routeIdForUrl,
    serviceWorker: Object.freeze({ ...config.serviceWorker })
  });
  window.TRICKCAL_PUBLIC_SITE = publicSite;

  if (typeof MutationObserver === 'undefined' || !document.documentElement) return;
  normalizeElement(document.documentElement);
  const observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'attributes') {
        normalizeElement(record.target);
        return;
      }
      record.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        normalizeElement(node);
        node.querySelectorAll?.('[src], [poster], [style]').forEach(normalizeElement);
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'poster', 'style'] });
})();
