(() => {
  'use strict';

                                 
                                            
  const DISABLED_PUBLIC_ASIDE_IDS = Object.freeze([]);
  const disabledAsideIds = new Set(DISABLED_PUBLIC_ASIDE_IDS.map(id => String(id).trim().toLowerCase()));

  window.TRICKCAL_PUBLIC_RELEASE = Object.freeze({
    disabledAsideIds: DISABLED_PUBLIC_ASIDE_IDS,
    isAsideEnabled(id) {
      return !disabledAsideIds.has(String(id || '').trim().toLowerCase());
    }
  });
})();
