const APP_ID = 'trickcal-manager';
const CACHE_VERSION = "6daee62c748b441e";
const PREVIOUS_CACHE_VERSION = "";
const SW_PATHNAME = new URL(self.location.href).pathname;
const BASE_PATH = SW_PATHNAME.startsWith('/trickcal-manager/') ? '/trickcal-manager/' : '/';
const PROFILE_KEY = BASE_PATH === '/' ? 'new-root' : 'legacy-trickcal-manager';
const CACHE_NAMESPACE = `${APP_ID}-${PROFILE_KEY}`;
const OWNED_CACHE_PREFIX = `${CACHE_NAMESPACE}-`;
const RUNTIME_CACHE = `${OWNED_CACHE_PREFIX}${CACHE_VERSION}`;
const PREVIOUS_CACHE = PREVIOUS_CACHE_VERSION ? `${OWNED_CACHE_PREFIX}${PREVIOUS_CACHE_VERSION}` : '';
const KNOWN_OLD_CACHE_NAMES = [`${APP_ID}-20260913-storage-1`];

const ROOT_NAVIGATION_PATHS = [
  '/', '/index.html', '/manager/', '/manager/index.html', '/stat-dashboard.html',
  '/calc/', '/calc/index.html', '/formation-damage-calc.html',
  '/calc/dps/', '/calc/dps/index.html', '/formation-damage-dps-prototype.html',
  '/share/', '/share/index.html', '/formation-share.html',
  '/data/', '/data/index.html', '/data/enemies/', '/data/enemies/index.html', '/enemy-status.html',
  '/data/boards/', '/data/boards/index.html', '/public/board-layout-preview.html',
  '/transfer/', '/transfer/index.html', '/storage-transfer.html',
  '/recovery/', '/recovery/index.html', '/storage-recovery.html'
];
const LEGACY_NAVIGATION_PATHS = ROOT_NAVIGATION_PATHS
  .filter(pathname => pathname !== '/')
  .map(pathname => `/trickcal-manager${pathname}`)
  .filter(pathname => !pathname.includes('/manager/index.html') && !pathname.includes('/calc/index.html')
    && !pathname.includes('/share/index.html') && !pathname.includes('/data/index.html')
    && !pathname.includes('/data/enemies/index.html') && !pathname.includes('/data/boards/index.html')
    && !pathname.includes('/transfer/index.html') && !pathname.includes('/recovery/index.html'));
const KNOWN_NAVIGATION_PATHS = new Set(BASE_PATH === '/' ? ROOT_NAVIGATION_PATHS : [
  '/trickcal-manager/',
  '/trickcal-manager/index.html',
  '/trickcal-manager/stat-dashboard.html',
  '/trickcal-manager/manager/',
  '/trickcal-manager/formation-damage-calc.html',
  '/trickcal-manager/calc/',
  '/trickcal-manager/formation-damage-dps-prototype.html',
  '/trickcal-manager/calc/dps/',
  '/trickcal-manager/formation-share.html',
  '/trickcal-manager/share/',
  '/trickcal-manager/data/',
  '/trickcal-manager/data/enemies/',
  '/trickcal-manager/enemy-status.html',
  '/trickcal-manager/data/boards/',
  '/trickcal-manager/public/board-layout-preview.html',
  '/trickcal-manager/storage-transfer.html',
  '/trickcal-manager/transfer/',
  '/trickcal-manager/storage-recovery.html',
  '/trickcal-manager/recovery/'
]);
const EXCLUDED_PATH_PREFIXES = BASE_PATH === '/'
  ? ['/transfer/', '/recovery/', '/storage-transfer.html', '/storage-recovery.html']
  : ['/trickcal-manager/transfer/', '/trickcal-manager/recovery/', '/trickcal-manager/storage-transfer.html', '/trickcal-manager/storage-recovery.html'];

self.addEventListener('install', event => {
  // Waiting is intentional. A page with unsaved state must not be replaced by
  // a new worker until the user explicitly asks for the update.
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([RUNTIME_CACHE]);
    if (PREVIOUS_CACHE) keep.add(PREVIOUS_CACHE);
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => (key.startsWith(OWNED_CACHE_PREFIX) || KNOWN_OLD_CACHE_NAMES.includes(key)) && !keep.has(key))
      .map(key => caches.delete(key)));
  })());
});

self.addEventListener('message', event => {
  const message = event.data && typeof event.data === 'object' ? event.data : {};
  if (message.type === 'trickcal-recovery-skip-waiting') {
    event.waitUntil(self.skipWaiting());
    return;
  }
  if (message.type !== 'trickcal-recovery-clear-cache') return;

  event.waitUntil((async () => {
    const deleted = [];
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => (key.startsWith(OWNED_CACHE_PREFIX) || KNOWN_OLD_CACHE_NAMES.includes(key)) && key !== RUNTIME_CACHE)
      .map(async key => {
        if (await caches.delete(key)) deleted.push(key);
      }));
    const result = {
      type: 'trickcal-recovery-result',
      ok: true,
      cacheVersion: CACHE_VERSION,
      profile: PROFILE_KEY,
      deleted
    };
    if (event.ports?.[0]) event.ports[0].postMessage(result);
    else event.source?.postMessage(result);
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (BASE_PATH === '/' && url.pathname.startsWith('/trickcal-manager/')) return;
  if (EXCLUDED_PATH_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) return;

  if (request.mode === 'navigate') {
    if (!KNOWN_NAVIGATION_PATHS.has(url.pathname)) return;
    event.respondWith(networkFirst(request));
    return;
  }

  if (shouldCacheAsset(request, url)) event.respondWith(staleWhileRevalidate(request));
});

function shouldCacheAsset(request, url) {
  if (BASE_PATH !== '/' && !url.pathname.startsWith(BASE_PATH)) return false;
  if (['image', 'style', 'script', 'font'].includes(request.destination)) return true;
  return /\.(?:css|js|webp|png|jpg|jpeg|gif|svg|ico|woff2?|mp4)$/i.test(url.pathname);
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request, { cache: 'reload' });
    if (isCacheable(request, response)) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreVary: true });
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request, { ignoreVary: true });
  const network = fetch(request, { cache: 'reload' })
    .then(response => {
      if (isCacheable(request, response)) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  if (cached) return cached;
  const response = await network;
  return response || Response.error();
}

function isCacheable(request, response) {
  if (!response || !response.ok || response.type !== 'basic') return false;
  try {
    const responseUrl = new URL(response.url || request.url);
    return responseUrl.origin === self.location.origin;
  } catch (_) {
    return false;
  }
}
