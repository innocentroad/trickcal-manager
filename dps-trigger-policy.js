(function initDpsTriggerPolicy(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_DPS_TRIGGER_POLICY = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createDpsTriggerPolicy() {
  'use strict';

  const valueText = value => value == null ? '' : String(value).trim();
  const unique = values => Array.from(new Set(values));

  function getStructuredTriggerText(effect = {}) {
    return [effect.triggerType, effect.triggerValue, effect.triggerSourceId]
      .map(valueText)
      .filter(Boolean)
      .join(' ');
  }

  function hasExplicitTrigger(effect = {}) {
    return valueText(effect.triggerType) !== '';
  }

  function getRuntimeTriggerText(effect = {}, fallbackText = '') {
    const structuredText = [
      getStructuredTriggerText(effect),
      effect.targetSkill,
      effect.targetSkillName,
      effect.attackCategory
    ].map(valueText).filter(Boolean).join(' ');
    // 明示された発動条件がある行では、説明・ラベル・理由を判定に使わない。
    // 説明には同じスキル内の別効果が含まれ、無関係な行動名を拾うためである。
    if (hasExplicitTrigger(effect)) return structuredText;
    const legacyConditionText = [
      effect.condition,
      effect.conditionType,
      effect.conditionValue
    ].map(valueText).filter(Boolean).join(' ');
    if (/(?:戦闘開始時|ウェーブ開始時|カード選択時|\d+(?:\.\d+)?\s*秒ごと|\d+\s*回ごと|使用時|使用後|発動時|終了時|命中時|衝突時|接触時|到着時|帰還時|消滅時|攻撃時|状態(?:異常)?付与時)/.test(legacyConditionText)) {
      return [structuredText, legacyConditionText].filter(Boolean).join(' ');
    }
    // 旧データの「低学年・高学年スキル自身が持つ持続効果」は、その
    // 所属行動の使用時発動として扱う。スキル説明全文を読むと、効果対象の
    // 「普通攻撃」まで発動元として拾うため、所属カテゴリを先に確定する。
    const duration = Math.max(Number(effect.durationSeconds) || 0, (Number(effect.durationFrames) || 0) / 60);
    const ownerCategory = [effect.sourceCategory, effect.category]
      .map(valueText)
      .find(value => /低学年|高学年|強化攻撃|普通攻撃_(?:基本|強化)/.test(value)) || '';
    if (duration > 0 && ownerCategory) {
      return `${ownerCategory}使用時`;
    }
    return [
      structuredText,
      legacyConditionText,
      fallbackText
    ].map(valueText).filter(Boolean).join(' ');
  }

  function getActionKeys(effect = {}, fallbackText = '') {
    const text = getRuntimeTriggerText(effect, fallbackText);
    const result = [];
    if (/低学年/.test(text)) result.push('lowSkill');
    if (/高学年/.test(text)) result.push('highSkill');
    if (/強化攻撃|普通攻撃_強化/.test(text)) result.push('enhancedAttack');
    if (/基本攻撃|普通攻撃_基本/.test(text)) result.push('basicAttack');
    if (/(?:通常|普通)攻撃/.test(text) && !/普通攻撃_(?:基本|強化)/.test(text)) {
      result.push('basicAttack', 'enhancedAttack');
    }
    if (!result.length && /(?:^|\s)スキル(?:使用|発動|終了|命中|効果|$)/.test(text)) {
      result.push('lowSkill', 'highSkill');
    }
    const sourceId = valueText(effect.triggerSourceId);
    if (/(?:^|_)low(?:_|$)/i.test(sourceId)) result.push('lowSkill');
    if (/(?:^|_)high(?:_|$)/i.test(sourceId)) result.push('highSkill');
    if (/(?:^|_)basic(?:_|$)/i.test(sourceId)) result.push('basicAttack');
    if (/(?:^|_)enhanced(?:_|$)/i.test(sourceId)) result.push('enhancedAttack');
    return unique(result);
  }

  function getIntervalSeconds(effect = {}, fallbackText = '') {
    const triggerType = valueText(effect.triggerType);
    if (triggerType === 'n秒ごと') {
      const value = Number(effect.triggerValue);
      return Number.isFinite(value) && value > 0 ? value : 0;
    }
    if (triggerType) return 0;
    const value = Number(valueText(fallbackText).match(/(\d+(?:\.\d+)?)\s*秒ごと/)?.[1]);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function getTriggerCount(effect = {}, fallbackText = '') {
    const triggerType = valueText(effect.triggerType);
    if (triggerType === 'n回ごと') {
      const value = Number(effect.triggerValue);
      return Number.isFinite(value) && value > 0 ? Math.max(1, Math.floor(value)) : 0;
    }
    if (triggerType) return 0;
    const value = Number(valueText(fallbackText).match(/(\d+)\s*回(?:目|ごと)/)?.[1]);
    return Number.isFinite(value) && value > 0 ? Math.max(1, Math.floor(value)) : 0;
  }

  function getPhase(effect = {}, fallbackText = '') {
    return /使用後|終了時|終了後/.test(getRuntimeTriggerText(effect, fallbackText)) ? 'end' : 'start';
  }

  function normalizeTriggerType(value) {
    return valueText(value).replace(/[\s　]+/g, '');
  }

  function isOrdinaryAttackProbabilityTrigger(effect = {}) {
    return /^(?:普通|通常)攻撃命中時一定確率$/.test(normalizeTriggerType(effect.triggerType));
  }

  function isEffectSourceTrigger(effect = {}) {
    const triggerType = normalizeTriggerType(effect.triggerType);
    const sourceId = valueText(effect.triggerSourceId);
    // A source-effect reference is deliberately narrow: it must identify an
    // effect row, and the trigger must describe that effect's occurrence. This
    // lets generated chained rows (e.g. tornado follow-ups) through without
    // guessing support for arbitrary unknown conditions.
    return /(?:^|[:/])[^:/\s]+_e\d+$/i.test(sourceId)
      && /発生時$/.test(triggerType);
  }

  function getProbability(effect = {}) {
    if (!isOrdinaryAttackProbabilityTrigger(effect)) return null;
    const value = Number(effect.triggerValue);
    if (!Number.isFinite(value)) return null;
    return Math.max(0, Math.min(100, value));
  }

  function isUnsupported(effect = {}, fallbackText = '') {
    const triggerType = valueText(effect.triggerType);
    const normalizedTriggerType = normalizeTriggerType(triggerType);
    const structured = [
      triggerType,
      effect.triggerValue,
      effect.conditionType,
      effect.conditionValue
    ].map(valueText).filter(Boolean).join(' ');
    const body = structured || valueText(fallbackText);
    const supportedProbability = isOrdinaryAttackProbabilityTrigger(effect)
      && getProbability(effect) != null;
    if (/(?:自身|本人|味方|敵)?HP(?:以下|未満|超過|以上|割合|条件)|残りHP|被ダメージ回数|被ダメージ時|被撃時|被弾時|戦闘不能時|撃破時|攻撃対象(?:設定|未撃破)時|シールド破壊時|呪い状態の敵が存在|規定ヒット時|一定確率/.test(body)
      && !supportedProbability) {
      return true;
    }
    if (!triggerType) return false;
    // 未知の明示条件は推測せず、対応実装が入るまで外部条件として保留する。
    if (isOrdinaryAttackProbabilityTrigger(effect)) return false;
    if (isEffectSourceTrigger(effect)) return false;
    return !/^(?:戦闘開始時|ウェーブ開始時|カード選択時|n秒ごと|n回ごと|(?:普通攻撃|強化攻撃|低学年スキル|高学年スキル|スキル)(?:使用時|発動時|終了時|命中時|効果発生時|最終ヒット命中時)|生成物(?:命中時|接触時|攻撃時|帰還時|到着時|消滅時|生成時)|ダメージ命中時|攻撃命中時|直接攻撃命中時|効果発生後|状態(?:異常)?付与時|状態発動時|状態最大スタック到達時|状態終了時|固有状態付与時|固有状態終了時|回復時|リソース変化時|リソース獲得時|シールド終了時)$/.test(normalizedTriggerType);
  }

  return Object.freeze({
    getStructuredTriggerText,
    hasExplicitTrigger,
    getRuntimeTriggerText,
    getActionKeys,
    getIntervalSeconds,
    getTriggerCount,
    getPhase,
    getProbability,
    isOrdinaryAttackProbabilityTrigger,
    isEffectSourceTrigger,
    isUnsupported
  });
});
