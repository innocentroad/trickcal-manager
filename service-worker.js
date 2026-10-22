'use strict';
const CACHE_VERSION = "184e563e9186e281";
const PREVIOUS_CACHE_VERSION = "da65d43b0d672da5";
// Retired profile: ordinary requests go directly to the network.
self.addEventListener('message', event => {
  const message = event.data || {};
  if (message.type === 'trickcal-recovery-skip-waiting') { event.waitUntil(self.skipWaiting()); return; }
  if (message.type !== 'trickcal-recovery-clear-cache') return;
  event.waitUntil((async () => {
    const deleted = [];
    for (const key of await caches.keys()) {
      if ((key.startsWith('trickcal-manager-legacy-trickcal-manager-') || key === 'trickcal-manager-20260913-storage-1') && await caches.delete(key)) deleted.push(key);
    }
    const result = { type: 'trickcal-recovery-result', ok: true, cacheVersion: CACHE_VERSION, profile: 'legacy-trickcal-manager', deleted };
    if (event.ports?.[0]) event.ports[0].postMessage(result);
    else event.source?.postMessage(result);
  })());
});
