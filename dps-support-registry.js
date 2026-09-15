(() => {
  'use strict';

  // DPS対応可否は skillmotion の「対応状況」シートだけから判定する。
  // 通常は常に必須、アサイド・愛用品は選択時だけ必須に加える。
  const IMPLEMENTED_STATUSES = Object.freeze(['済', '暫定']);
  const COMPONENTS = Object.freeze({
    normal: Object.freeze({ key: 'normal', label: '通常' }),
    aside: Object.freeze({ key: 'aside', label: 'アサイド' }),
    favorite: Object.freeze({ key: 'favorite', label: '愛用品' })
  });
  const COMPONENT_ORDER = Object.freeze(['normal', 'aside', 'favorite']);

  function normalizeId(value) { return String(value || '').trim().toLowerCase(); }
  function getTimingData() { return globalThis.DPS_TIMING_DATA || null; }
  function uniqueNumbers(values) {
    return Array.from(new Set(values.map(Number).filter(value => Number.isFinite(value) && value >= 0))).sort((a, b) => a - b);
  }
  function getFavoriteLevels(snapshot = {}) {
    const values = [];
    const add = sourceKey => {
      const found = String(sourceKey || '').match(/^favorite:(\d+)/i);
      if (found) values.push(Number(found[1]));
    };
    Object.values(snapshot.dpsSkillOverrides || {}).forEach(item => add(item?.dpsSourceKey));
    (snapshot.selectedSkillOptions || []).forEach(item => add(item?.sourceKey));
    return uniqueNumbers(values);
  }
  function getRequiredComponentKeys(asideRank = 0, favoriteLevels = []) {
    const keys = ['normal'];
    if (asideRank > 0) keys.push('aside');
    if (favoriteLevels.some(level => level > 0)) keys.push('favorite');
    return keys;
  }
  function getConfigurationLabel(requiredComponentKeys = []) {
    return requiredComponentKeys.map(key => COMPONENTS[key]?.label || key).join(' + ') || '通常';
  }
  function normalizeStatuses(statuses = {}) {
    return Object.freeze(Object.fromEntries(COMPONENT_ORDER.map(key => [key, String(statuses?.[key] || '未').trim() || '未'])));
  }
  function unsupported({ id, label = '', asideRank = 0, favoriteLevels = [], implementationStatuses = null, requiredComponents = [], reason }) {
    const statuses = normalizeStatuses(implementationStatuses || {});
    return Object.freeze({
      supported: false, id, label, asideRank, favoriteLevels, implementationStatuses: statuses,
      requiredComponents, configuration: getConfigurationLabel(requiredComponents.map(item => item.key)),
      provisional: false, provisionalComponents: [], provisionalLabel: '', statusLabel: '', reason
    });
  }
  function evaluate(snapshot = {}) {
    const id = normalizeId(snapshot.targetId);
    const asideRank = Math.max(0, Math.floor(Number(snapshot.skillLevels?.asideRank) || 0));
    const favoriteLevels = getFavoriteLevels(snapshot);
    const requiredKeys = getRequiredComponentKeys(asideRank, favoriteLevels);
    const timingData = getTimingData();
    if (!timingData?.apostles || !timingData?.supportStatuses) {
      return unsupported({ id, asideRank, favoriteLevels, reason: 'DPSタイミングデータまたは対応状況を読み込めませんでした。' });
    }
    const statusRecord = timingData.supportStatuses[id];
    const timing = timingData.apostles[id];
    const label = timing?.name || statusRecord?.name || snapshot.targetName || id;
    const statuses = normalizeStatuses(timing?.implementationStatuses || statusRecord?.statuses || {});
    const requiredComponents = requiredKeys.map(key => Object.freeze({
      key, label: COMPONENTS[key].label, status: statuses[key]
    }));
    if (!statusRecord) {
      return unsupported({ id, label, asideRank, favoriteLevels, implementationStatuses: statuses, requiredComponents,
        reason: `${label}のDPS対応状況が未登録です。` });
    }
    if (!timing) {
      return unsupported({ id, label, asideRank, favoriteLevels, implementationStatuses: statuses, requiredComponents,
        reason: `${label}は対応状況が登録されていますが、DPS用タイミングデータがありません。` });
    }
    const missing = requiredComponents.filter(component => !IMPLEMENTED_STATUSES.includes(component.status));
    if (missing.length) {
      const details = missing.map(component => `${component.label}: ${component.status}`).join('、');
      return unsupported({ id, label, asideRank, favoriteLevels, implementationStatuses: statuses, requiredComponents,
        reason: `${label}の必要な構成はDPS未対応です（${details}）。` });
    }
    const provisionalComponents = requiredComponents.filter(component => component.status === '暫定');
    const provisionalLabel = provisionalComponents.map(component => component.label).join('・');
    const statusLabel = requiredComponents.map(component => `${component.label}: ${component.status}`).join(' / ');
    return Object.freeze({
      supported: true, id, label, asideRank, favoriteLevels, implementationStatuses: statuses, requiredComponents,
      configuration: getConfigurationLabel(requiredKeys), fixtures: [],
      provisional: provisionalComponents.length > 0, provisionalComponents, provisionalLabel, statusLabel
    });
  }
  window.TRICKCAL_DPS_SUPPORT_REGISTRY = Object.freeze({
    version: 3, IMPLEMENTED_STATUSES, COMPONENTS, getFavoriteLevels, getRequiredComponentKeys, evaluate
  });
})();
