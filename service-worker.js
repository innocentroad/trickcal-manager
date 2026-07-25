const CACHE_PREFIX = 'trickcal-manager';
const CACHE_VERSION = '20260725-asset-cache-13';
const RUNTIME_CACHE = `${CACHE_PREFIX}-${CACHE_VERSION}`;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(`${CACHE_PREFIX}-`) && key !== RUNTIME_CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (shouldCacheAsset(request, url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

function shouldCacheAsset(request, url) {
  if (['image', 'style', 'script', 'font'].includes(request.destination)) return true;
  return /\.(?:css|js|webp|png|jpg|jpeg|gif|svg|ico|woff2?)$/i.test(url.pathname);
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheable(response)) cache.put(request, response.clone());
    return response;
  } catch (_) {
    const cached = await cache.match(request, { ignoreVary: true });
    if (cached) return cached;
    throw _;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request, { ignoreVary: true });
  const network = fetch(request)
    .then(response => {
      if (isCacheable(response)) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  if (cached) return cached;
  const response = await network;
  return response || Response.error();
}

function isCacheable(response) {
  return response && response.ok && response.type !== 'opaque';
}
