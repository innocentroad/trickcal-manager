(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;
  if (!window.isSecureContext) return;

  const ROUTE_ASSETS = {
    stat: [
      'stat-dashboard.html',
      'stat-prototype.css?v=20260903n',
      'stat-dashboard.css?v=20260903a',
      'shared-topbar.css?v=20260727e',
      'statData.js?v=20260903a',
      'public-release-config.js?v=20260903a',
      'sp-engine.js?v=20260720b',
      'synergy.js',
      'cards.js?v=20260813a',
      'stat-prototype.js?v=20260903a',
      'stat-dashboard.js?v=20260903a',
      'image-preload.js?v=20260727a'
    ],
    calc: [
      'formation-damage-calc.html',
      'style.css',
      'formation-damage-calc.css?v=20260826b',
      'formation-damage-dps-prototype.css?v=20260902c',
      'shared-topbar.css?v=20260727e',
      'statData.js?v=20260903a',
      'public-release-config.js?v=20260903a',
      'sp-engine.js?v=20260720b',
      'stat-engine.js?v=20260828a',
      'apostles.js?v=20260903a',
      'cards.js?v=20260813a',
      'synergy.js',
      'enemy-presets.js?v=20260821o',
      'combat-scenario.js?v=20260824a',
      'dps-trigger-policy.js?v=20260901c',
      'dps-timing-data.js?v=20260903a',
      'dps-simulator.js?v=20260902d',
      'dps-simulator-worker.js?v=20260901b',
      'dps-support-registry.js?v=20260827c',
      'formation-damage-calc.js?v=20260903c',
      'formation-damage-dps-prototype.js?v=20260902c',
      'image-preload.js?v=20260727a'
    ],
    dpsPrototype: [
      'formation-damage-dps-prototype.html',
      'formation-damage-dps-prototype.css?v=20260902c',
      'formation-damage-dps-prototype.js?v=20260902c',
      'public-release-config.js?v=20260903a',
      'stat-engine.js?v=20260828a',
      'dps-support-registry.js?v=20260827c',
      'dps-timing-data.js?v=20260903a',
      'dps-simulator.js?v=20260902d',
      'dps-simulator-worker.js?v=20260901b',
      'formation-damage-calc.html',
      'formation-damage-calc.css?v=20260826b',
      'dps-trigger-policy.js?v=20260901c',
      'formation-damage-calc.js?v=20260903c'
    ]
  };

  const warmedUrls = new Set();

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(error => {
      console.warn('[trickcal-manager] service worker registration failed', error);
    });
    warmLikelyRouteSoon();
    bindNavigationWarmup();
  }, { once: true });

  function warmLikelyRouteSoon() {
    const warm = () => warmRouteAssets(document.body?.classList.contains('fdcp-prototype-page')
      ? 'dpsPrototype'
      : document.body?.classList.contains('formation-damage-calc') ? 'calc' : 'stat');
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(warm, { timeout: 2200 });
    } else {
      window.setTimeout(warm, 1200);
    }
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
    if (href.includes('formation-damage-calc.html')) warmRouteAssets('calc', true);
    if (href.includes('stat-dashboard.html') || href.includes('index.html')) warmRouteAssets('stat', true);
  }

  function warmRouteAssets(route, highPriority = false) {
    const assets = ROUTE_ASSETS[route] || [];
    assets.forEach((asset, index) => {
      const url = new URL(asset, document.baseURI).href;
      if (warmedUrls.has(url)) return;
      warmedUrls.add(url);
      const fetchAsset = () => fetch(url, { cache: 'force-cache', credentials: 'same-origin' }).catch(() => undefined);
      if (highPriority || index < 3) {
        fetchAsset();
      } else if ('requestIdleCallback' in window) {
        window.requestIdleCallback(fetchAsset, { timeout: 2500 });
      } else {
        window.setTimeout(fetchAsset, 200 + index * 80);
      }
    });
  }
})();
