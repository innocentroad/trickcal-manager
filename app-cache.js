(function () {
  'use strict';

  const FALLBACK_ROUTES = {
    manager: 'stat-dashboard.html',
    calc: 'formation-damage-calc.html',
    dps: 'formation-damage-dps-prototype.html'
  };
  const ROUTE_ASSETS = {
    manager: [
      'storage-registry.js', 'storage-runtime.js', 'storage-bootstrap.js', 'storage-backup.js', 'storage-transfer.js',
      'formation-share.html', 'formation-share-display-data.js', 'formation-share-catalog.js',
      'formation-share-codec.js', 'formation-share-prototype.css', 'formation-share.js',
      'formation-share-image.js', 'formation-share-page-actions.js', 'formation-share-create.js',
      'stat-prototype.css', 'stat-dashboard.css', 'shared-topbar.css', 'statData.js',
      'public-release-config.js', 'sp-engine.js', 'synergy.js', 'cards.js', 'stat-engine.js',
      'stat-prototype.js', 'stat-dashboard.js', 'image-preload.js', 'public-site-runtime.js'
    ],
    calc: [
      'storage-registry.js', 'storage-runtime.js', 'storage-bootstrap.js', 'style.css',
      'formation-damage-calc.css', 'formation-damage-dps-prototype.css', 'shared-topbar.css',
      'statData.js', 'public-release-config.js', 'sp-engine.js', 'stat-engine.js', 'apostles.js',
      'cards.js', 'synergy.js', 'enemy-presets.js', 'combat-scenario.js', 'dps-trigger-policy.js',
      'dps-timing-data.js', 'dps-simulator.js', 'dps-simulator-worker.js', 'dps-support-registry.js',
      'formation-damage-calc.js', 'formation-damage-dps-prototype.js', 'image-preload.js', 'public-site-runtime.js'
    ],
    dps: [
      'storage-registry.js', 'storage-runtime.js', 'storage-bootstrap.js', 'formation-damage-dps-prototype.css',
      'formation-damage-dps-prototype.js', 'public-release-config.js', 'stat-engine.js', 'dps-support-registry.js',
      'dps-timing-data.js', 'dps-simulator.js', 'dps-simulator-worker.js', 'formation-damage-calc.css',
      'dps-trigger-policy.js', 'formation-damage-calc.js', 'public-site-runtime.js'
    ]
  };

  if (!('serviceWorker' in navigator)) return;
  if (!window.isSecureContext) return;

  const publicSite = window.TRICKCAL_PUBLIC_SITE;
  const pagePath = route => publicSite?.pageUrl?.(route) || FALLBACK_ROUTES[route] || route;
  const assetPath = asset => publicSite?.assetUrl?.(asset) || asset;
  const serviceWorkerPath = publicSite?.serviceWorker?.script
    ? publicSite.assetUrl?.(publicSite.serviceWorker.script, { versioned: false }) || publicSite.serviceWorker.script
    : 'service-worker.js';
  const registrationOptions = { updateViaCache: 'none' };
  if (publicSite?.serviceWorker?.scope) registrationOptions.scope = publicSite.serviceWorker.scope;
  const warmedUrls = new Set();

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(serviceWorkerPath, registrationOptions).catch(error => {
      console.warn('[trickcal-manager] service worker registration failed', error);
    });
    warmLikelyRouteSoon();
    bindNavigationWarmup();
  }, { once: true });

  function warmLikelyRouteSoon() {
    const warm = () => warmRouteAssets(document.body?.classList.contains('fdcp-prototype-page')
      ? 'dps'
      : document.body?.classList.contains('formation-damage-calc') ? 'calc' : 'manager');
    if ('requestIdleCallback' in window) window.requestIdleCallback(warm, { timeout: 2200 });
    else window.setTimeout(warm, 1200);
  }

  function bindNavigationWarmup() {
    document.addEventListener('pointerover', event => warmLink(event.target), { passive: true });
    document.addEventListener('focusin', event => warmLink(event.target));
    document.addEventListener('pointerdown', event => warmLink(event.target), { passive: true });
  }

  function warmLink(target) {
    const link = target?.closest?.('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const route = publicSite?.routeIdForUrl?.(href)
      || (href.includes('formation-damage-calc.html') ? 'calc' : '')
      || (href.includes('stat-dashboard.html') || href.includes('index.html') ? 'manager' : '');
    if (route) warmRouteAssets(route, true);
  }

  function warmRouteAssets(route, highPriority = false) {
    const page = pagePath(route);
    const assets = [page, ...(ROUTE_ASSETS[route] || [])];
    assets.forEach((asset, index) => {
      let url;
      try {
        const resolved = asset === page ? page : assetPath(asset);
        url = new URL(resolved, document.baseURI).href;
      } catch (_) {
        return;
      }
      if (warmedUrls.has(url)) return;
      warmedUrls.add(url);
      const fetchAsset = () => fetch(url, { cache: 'reload', credentials: 'same-origin' }).catch(() => undefined);
      if (highPriority || index < 3) fetchAsset();
      else if ('requestIdleCallback' in window) window.requestIdleCallback(fetchAsset, { timeout: 2500 });
      else window.setTimeout(fetchAsset, 200 + index * 80);
    });
  }
})();
