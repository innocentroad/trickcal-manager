(function initDpsTriggerPolicy(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_DPS_TRIGGER_POLICY = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createDpsTriggerPolicy() {
  'use strict';

  const valueText = value => value == null ? '' : String(value).trim();
  const unique = values => Array.from(new Set(values));

  // 行動間隔から時刻を作れるトリガーとは別に、戦闘状態や対象の変化を
  // 外部イベントとして指定するトリガーをここで共通分類する。表示側と
  // ランタイム側が別々の文字列判定を持つと、候補を追加しても発動条件が
  // 一致しないため、正規化後のイベント種別をこの表から取得する。
  const EXTERNAL_EVENT_CLASSIFICATIONS = Object.freeze([
    { eventType: 'シールド破壊時', eventClass: 'shield-break', label: 'シールド破壊', repeatability: 'once', matcher: /シールド破壊/ },
    { eventType: 'シールド終了時', eventClass: 'shield-ended', label: 'シールド終了', repeatability: 'repeatable', matcher: /シールド終了/ },
    { eventType: 'HP閾値', eventClass: 'hp-threshold', label: 'HP閾値', repeatability: 'once', matcher: /HP.*(?:以下|未満|以上|超過|閾値|到達)|残りHP/ },
    { eventType: '被弾時', eventClass: 'damage-taken-count', label: '被弾回数', repeatability: 'counted', matcher: /被ダメージ回数/ },
    { eventType: '被弾時', eventClass: 'damage-taken', label: '被弾', repeatability: 'repeatable', matcher: /被ダメージ|被撃|被弾/ },
    { eventType: '被弾時', eventClass: 'damage-taken', label: '普通攻撃被命中', repeatability: 'repeatable', matcher: /普通攻撃被命中/ },
    { eventType: '味方戦闘不能時', eventClass: 'ally-defeated', label: '味方戦闘不能', repeatability: 'once', matcher: /味方戦闘不能/ },
    { eventType: '自身戦闘不能時', eventClass: 'self-defeated', label: '自身戦闘不能', repeatability: 'once', matcher: /(?:自身|本人)戦闘不能/ },
    { eventType: '低学年スキルで敵撃破時', eventClass: 'enemy-defeated-by-action', label: '低学年スキルで敵撃破', repeatability: 'once', matcher: /低学年.*敵撃破/ },
    { eventType: '高学年スキルで敵撃破時', eventClass: 'enemy-defeated-by-action', label: '高学年スキルで敵撃破', repeatability: 'once', matcher: /高学年.*敵撃破/ },
    { eventType: '普通攻撃で敵撃破時', eventClass: 'enemy-defeated-by-action', label: '普通攻撃で敵撃破', repeatability: 'once', matcher: /(?:普通|通常|基本)攻撃.*敵撃破/ },
    { eventType: '強化攻撃で敵撃破時', eventClass: 'enemy-defeated-by-action', label: '強化攻撃で敵撃破', repeatability: 'once', matcher: /強化攻撃.*敵撃破/ },
    // 「攻撃対象未撃破時」は撃破イベントではなく、対象状態の条件。
    // この定義を汎用の撃破判定より先に置く。
    { eventType: '攻撃対象未撃破時', eventClass: 'target-condition', label: '攻撃対象未撃破', repeatability: 'repeatable', matcher: /攻撃対象未撃破/ },
    { eventType: '攻撃対象設定時', eventClass: 'target-condition', label: '攻撃対象設定', repeatability: 'repeatable', matcher: /攻撃対象設定/ },
    { eventType: '敵撃破時', eventClass: 'enemy-defeated', label: '敵撃破', repeatability: 'once', matcher: /撃破時/ },
    { eventType: '固有状態付与時', eventClass: 'unique-state-applied', label: '固有状態付与', repeatability: 'repeatable', matcher: /固有状態付与/ },
    { eventType: '固有状態終了時', eventClass: 'unique-state-ended', label: '固有状態終了', repeatability: 'repeatable', matcher: /固有状態終了/ },
    { eventType: '状態付与時', eventClass: 'status-applied', label: '状態付与', repeatability: 'repeatable', matcher: /状態(?:異常)?付与/ },
    { eventType: '状態終了時', eventClass: 'status-ended', label: '状態終了', repeatability: 'repeatable', matcher: /状態(?:異常)?終了/ },
    { eventType: '状態発動時', eventClass: 'status-activated', label: '状態発動', repeatability: 'repeatable', matcher: /状態発動/ },
    { eventType: '状態最大スタック到達時', eventClass: 'status-max-stack', label: '状態最大スタック', repeatability: 'counted', matcher: /状態最大スタック到達/ },
    { eventType: 'リソース変化時', eventClass: 'resource-changed', label: 'リソース変化', repeatability: 'repeatable', matcher: /リソース(?:変化|獲得|消費)/ },
    { eventType: 'n回ごと', eventClass: 'action-count', label: 'n回ごと', repeatability: 'counted', matcher: /n回ごと/ },
    { eventType: '規定ヒット時', eventClass: 'action-count', label: '規定ヒット', repeatability: 'counted', matcher: /規定ヒット時/ },
    { eventType: '低学年スキル効果発生時', eventClass: 'skill-effect', label: '低学年スキル効果発生', repeatability: 'repeatable', matcher: /低学年スキル効果発生/ },
    { eventType: '高学年スキル効果発生時', eventClass: 'skill-effect', label: '高学年スキル効果発生', repeatability: 'repeatable', matcher: /高学年スキル効果発生/ },
    { eventType: '低学年スキル最終ヒット命中時', eventClass: 'skill-action', label: '低学年最終ヒット命中', repeatability: 'repeatable', matcher: /低学年スキル最終ヒット命中/ },
    { eventType: '高学年スキル最終ヒット命中時', eventClass: 'skill-action', label: '高学年最終ヒット命中', repeatability: 'repeatable', matcher: /高学年スキル最終ヒット命中/ },
    { eventType: '低学年スキル命中時', eventClass: 'skill-action', label: '低学年スキル命中', repeatability: 'repeatable', matcher: /^低学年スキル命中時$/ },
    { eventType: '高学年スキル命中時', eventClass: 'skill-action', label: '高学年スキル命中', repeatability: 'repeatable', matcher: /^高学年スキル命中時$/ },
    { eventType: '低学年スキル終了時', eventClass: 'skill-action', label: '低学年スキル終了', repeatability: 'repeatable', matcher: /^低学年スキル終了時$/ },
    { eventType: '高学年スキル終了時', eventClass: 'skill-action', label: '高学年スキル終了', repeatability: 'repeatable', matcher: /^高学年スキル終了時$/ },
    { eventType: 'スキル命中時', eventClass: 'skill-action', label: 'スキル命中', repeatability: 'repeatable', matcher: /^スキル命中時$/ },
    { eventType: '攻撃命中時', eventClass: 'skill-action', label: '攻撃命中', repeatability: 'repeatable', matcher: /^攻撃命中時$/ },
    { eventType: 'スキル使用時', eventClass: 'skill-action', label: 'スキル使用', repeatability: 'repeatable', matcher: /^スキル使用時$/ },
    { eventType: 'スキル発動時', eventClass: 'skill-action', label: 'スキル発動', repeatability: 'repeatable', matcher: /^スキル発動時$/ },
    { eventType: 'スキル終了時', eventClass: 'skill-action', label: 'スキル終了', repeatability: 'repeatable', matcher: /^スキル終了時$/ },
    { eventType: '生成物生成時', eventClass: 'generated-object', label: '生成物生成', repeatability: 'repeatable', matcher: /生成物生成時/ },
    { eventType: '生成物攻撃時', eventClass: 'generated-object', label: '生成物攻撃', repeatability: 'repeatable', matcher: /生成物攻撃時/ },
    { eventType: '生成物命中時', eventClass: 'generated-object', label: '生成物命中', repeatability: 'repeatable', matcher: /生成物命中時/ },
    { eventType: '生成物接触時', eventClass: 'generated-object', label: '生成物接触', repeatability: 'repeatable', matcher: /生成物接触時/ },
    { eventType: '生成物到着時', eventClass: 'generated-object', label: '生成物到着', repeatability: 'repeatable', matcher: /生成物到着時/ },
    { eventType: '生成物帰還時', eventClass: 'generated-object', label: '生成物帰還', repeatability: 'repeatable', matcher: /生成物帰還時/ },
    { eventType: '生成物消滅時', eventClass: 'generated-object', label: '生成物消滅', repeatability: 'repeatable', matcher: /生成物消滅時/ },
    { eventType: '攻撃対象変更時', eventClass: 'target-condition', label: '攻撃対象変更', repeatability: 'repeatable', matcher: /攻撃対象変更/ },
    { eventType: 'ダメージ命中時', eventClass: 'damage-hit', label: 'ダメージ命中', repeatability: 'repeatable', matcher: /^(?:ダメージ|攻撃|直接攻撃)命中時$/ },
    { eventType: '竜巻ダメージ発生時', eventClass: 'effect-triggered', label: '竜巻ダメージ発生', repeatability: 'repeatable', matcher: /^竜巻ダメージ発生時$/ },
    { eventType: '効果発生時', eventClass: 'effect-triggered', label: '効果発生', repeatability: 'repeatable', matcher: /^効果発生時$/ },
    { eventType: '効果発生後', eventClass: 'effect-triggered', label: '効果発生後', repeatability: 'repeatable', matcher: /効果発生後/ },
    { eventType: '対象状態成立時', eventClass: 'target-status', label: '対象状態成立', repeatability: 'repeatable', matcher: /状態の敵が存在$/ },
    { eventType: '回復時', eventClass: 'healing', label: '回復', repeatability: 'repeatable', matcher: /回復時/ }
  ]);

  // 現在の単体DPS時計だけでは発生を確定できない条件。分類自体は外部候補
  // として表示するが、externalActionRequired が付いていない本人効果を
  // 自動ランタイムへ通して「行動時に起きた」と推測してはいけない。
  const EXTERNAL_OCCURRENCE_ONLY_TYPES = new Set([
    'シールド破壊時',
    'シールド終了時',
    'HP閾値',
    '被弾時',
    '味方戦闘不能時',
    '自身戦闘不能時',
    '低学年スキルで敵撃破時',
    '高学年スキルで敵撃破時',
    '普通攻撃で敵撃破時',
    '強化攻撃で敵撃破時',
    '敵撃破時',
    '攻撃対象未撃破時',
    '攻撃対象設定時',
    '攻撃対象変更時',
    '状態発動時',
    '生成物生成時',
    '対象状態成立時',
    '回復時'
  ]);

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

  function getExternalEventClassification(effect = {}) {
    const triggerType = normalizeTriggerType(typeof effect === 'object' ? effect?.triggerType : effect);
    if (!triggerType) return null;
    const definition = EXTERNAL_EVENT_CLASSIFICATIONS.find(item => item.matcher.test(triggerType));
    if (!definition) return null;
    return {
      eventType: definition.eventType,
      eventClass: definition.eventClass,
      label: definition.label,
      timingMode: 'event',
      repeatability: definition.repeatability,
      inputMode: 'occurrence'
    };
  }

  function isExternalOccurrenceOnly(effect = {}) {
    const classification = getExternalEventClassification(effect);
    return !!classification && EXTERNAL_OCCURRENCE_ONLY_TYPES.has(classification.eventType);
  }

  function normalizeExternalEventType(value) {
    return getExternalEventClassification(value)?.eventType || normalizeTriggerType(value);
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
    const externalClassification = getExternalEventClassification(effect);
    const structured = [
      triggerType,
      effect.triggerValue,
      effect.conditionType,
      effect.conditionValue
    ].map(valueText).filter(Boolean).join(' ');
    const body = structured || valueText(fallbackText);
    const supportedProbability = isOrdinaryAttackProbabilityTrigger(effect)
      && getProbability(effect) != null;
    if (isExternalOccurrenceOnly(effect)) {
      return effect.externalActionRequired !== true;
    }
    if (/(?:自身|本人|味方|敵)?HP(?:以下|未満|超過|以上|割合|条件)|残りHP|被ダメージ回数|被ダメージ時|被撃時|被弾時|戦闘不能時|撃破時|攻撃対象(?:設定|未撃破)時|シールド破壊時|呪い状態の敵が存在|規定ヒット時|一定確率/.test(body)
      && !supportedProbability) {
      // 既知のイベント駆動型は、発生時刻を外部入力へ委ねることで扱える。
      // externalActionRequired がない本人条件は、従来どおり自動発動させない。
      if (externalClassification && effect.externalActionRequired === true) return false;
      return true;
    }
    if (!triggerType) return false;
    if (externalClassification && effect.externalActionRequired === true) return false;
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
    isExternalOccurrenceOnly,
    isUnsupported,
    getExternalEventClassification,
    normalizeExternalEventType
  });
});
