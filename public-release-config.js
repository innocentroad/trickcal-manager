(() => {
  'use strict';

  // 公開から一時的に外すアサイドだけ、ここへIDを追加する。
  // 生成データ（apostles.js / statData.js）は変更しない。
  const DISABLED_PUBLIC_ASIDE_IDS = Object.freeze([
    'kidian' // ギデオン: アサイド未実装
  ]);
  const disabledAsideIds = new Set(DISABLED_PUBLIC_ASIDE_IDS.map(id => String(id).trim().toLowerCase()));

  window.TRICKCAL_PUBLIC_RELEASE = Object.freeze({
    disabledAsideIds: DISABLED_PUBLIC_ASIDE_IDS,
    isAsideEnabled(id) {
      return !disabledAsideIds.has(String(id || '').trim().toLowerCase());
    }
  });
})();
