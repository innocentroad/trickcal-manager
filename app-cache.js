(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) return;
  if (!window.isSecureContext) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(error => {
      console.warn('[trickcal-manager] service worker registration failed', error);
    });
  }, { once: true });
})();
