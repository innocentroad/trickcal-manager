// お知らせの表示用データ。保存データ・移行payloadとは分離した静的な表示資材。
(function initAnnouncementData(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_ANNOUNCEMENT_DATA = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createAnnouncementDataApi() {
  'use strict';

  const ALLOWED_PROFILES = new Set(['new', 'legacy']);
  const ALLOWED_CTA = new Set(['migration-guide', null]);
  const ARTICLES = Object.freeze([
    Object.freeze({
      id: 'migration-file-first-20260914',
      date: '2026-09-14',
      title: '新サイトへの移行のお知らせ',
      barTitle: '新サイトへの移行について',
      summary: '保存データは自動では引き継がれません。旧サイトでバックアップを保存し、新サイトで読み込んでください。',
      body: Object.freeze([
        '新しいサイトは trickcal.irlab.dev です。',
        '保存データは自動では引き継がれません。',
        '旧サイトでバックアップを保存し、新サイトで読み込んでください。',
        '旧サイトのデータは残りますが、読み込み先の対象データは上書きされます。'
      ]),
      category: '移行案内',
      profiles: Object.freeze(['new', 'legacy']),
      autoRevision: '1',
      cta: 'migration-guide'
    })
  ]);

  function isValidDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  function validateArticle(article, index) {
    const label = `article[${index}]`;
    if (!article || typeof article !== 'object' || Array.isArray(article)) return `${label} is not an object`;
    if (typeof article.id !== 'string' || !article.id.trim()) return `${label}.id is required`;
    if (!isValidDate(article.date)) return `${label}.date is invalid`;
    if (typeof article.title !== 'string' || !article.title.trim()) return `${label}.title is required`;
    if (article.barTitle !== undefined
      && (typeof article.barTitle !== 'string' || !article.barTitle.trim())) return `${label}.barTitle is invalid`;
    if (typeof article.summary !== 'string' || !article.summary.trim()) return `${label}.summary is required`;
    if (!Array.isArray(article.body) || !article.body.length
      || article.body.some(paragraph => typeof paragraph !== 'string' || !paragraph.trim())) {
      return `${label}.body is invalid`;
    }
    if (!Array.isArray(article.profiles) || !article.profiles.length
      || article.profiles.some(profile => !ALLOWED_PROFILES.has(profile))) {
      return `${label}.profiles is invalid`;
    }
    if (article.autoRevision !== undefined
      && (typeof article.autoRevision !== 'string' || !article.autoRevision.trim())) {
      return `${label}.autoRevision is invalid`;
    }
    if (!ALLOWED_CTA.has(article.cta === undefined ? null : article.cta)) return `${label}.cta is invalid`;
    return null;
  }

  function validateArticles(input) {
    if (!Array.isArray(input) || !input.length) return { ok: false, errors: ['articles must be a non-empty array'] };
    const errors = [];
    const ids = new Set();
    input.forEach((article, index) => {
      const error = validateArticle(article, index);
      if (error) errors.push(error);
      if (article?.id) {
        if (ids.has(article.id)) errors.push(`duplicate article id: ${article.id}`);
        ids.add(article.id);
      }
    });
    return errors.length ? { ok: false, errors } : { ok: true, errors: [] };
  }

  function normalizeProfile(profile) {
    return profile === 'legacy' ? 'legacy' : 'new';
  }

  function getArticles(profile = 'new', input = ARTICLES) {
    const normalizedProfile = normalizeProfile(profile);
    return input
      .filter(article => Array.isArray(article.profiles) && article.profiles.includes(normalizedProfile))
      .slice()
      .sort((left, right) => right.date.localeCompare(left.date) || right.id.localeCompare(left.id));
  }

  function getArticle(id, input = ARTICLES) {
    return input.find(article => article.id === id) || null;
  }

  const validation = validateArticles(ARTICLES);
  if (!validation.ok) throw new Error(`Invalid announcement data: ${validation.errors.join(', ')}`);

  return Object.freeze({
    version: 1,
    articles: ARTICLES,
    validateArticles,
    getArticles,
    getArticle
  });
});
