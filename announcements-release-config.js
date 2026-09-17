// ローカル公開確認用のお知らせgate。実サイトへの反映は別承認の境界とする。
(function initAnnouncementsReleaseConfig(root) {
  if (!root) return;
  root.TRICKCAL_ANNOUNCEMENTS_RELEASE_CONFIG = Object.freeze({
    releaseGate: 'announcements-migration-20260915',
    enabled: true,
    autoEnabled: true,
    bannerEnabled: true,
    profiles: Object.freeze(['new', 'legacy']),
    pages: Object.freeze(['manager', 'calc'])
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
