(() => {
  'use strict';

  const FORMATION_ROWS = Object.freeze(['後列', '中列', '前列']);
  const ALL_ROWS = '全列';

  function getBasePosition(source = {}) {
    const value = typeof source === 'string'
      ? source
      : (source.basePosition || source.position || source.配置列 || source.配列 || '');
    return String(value || '').trim();
  }

  function getAllowedFormationRows(source = {}) {
    const position = getBasePosition(source);
    if (position === ALL_ROWS) return FORMATION_ROWS.slice();
    return FORMATION_ROWS.includes(position) ? [position] : [];
  }

  function getFormationRow(destination) {
    if (typeof destination === 'number') return FORMATION_ROWS[destination] || '';
    return String(destination || '').trim();
  }

  function canPlaceApostle(source, destination) {
    const row = getFormationRow(destination);
    return !!row && getAllowedFormationRows(source).includes(row);
  }

  function canSwapFormationApostles(source, sourceDestination, target, targetDestination) {
    return canPlaceApostle(source, targetDestination)
      && (!target || canPlaceApostle(target, sourceDestination));
  }

  const api = Object.freeze({
    FORMATION_ROWS,
    ALL_ROWS,
    getBasePosition,
    getAllowedFormationRows,
    getFormationRow,
    canPlaceApostle,
    canSwapFormationApostles
  });

  globalThis.TRICKCAL_FORMATION_PLACEMENT = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
