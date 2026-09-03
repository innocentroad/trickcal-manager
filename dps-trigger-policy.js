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
  const EXTERNAL_EVENT_ALIASES = Object.freeze({
    shieldBreak: 'シールド破壊時',
    shieldEnded: 'シールド終了時',
    hpThreshold: 'HP閾値',
    damageTaken: '被弾時',
    statusApplied: '状態付与時'
  });

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
    const normalized = normalizeTriggerType(value);
    return EXTERNAL_EVENT_ALIASES[normalized]
      || getExternalEventClassification(normalized)?.eventType
      || normalized;
  }

  function getRuntimeExternalEventMatchState(effect = {}, events = []) {
    const required = isExternalRuntimeCondition(effect);
    if (!required) return Object.freeze({ required: false, matched: false, count: 0, expectedType: '', expectedLabel: '' });
    const rawType = valueText(effect.externalTriggerType || effect.triggerType);
    const expectedType = normalizeExternalEventType(rawType);
    const classification = getExternalEventClassification({ triggerType: expectedType });
    const expectedLabel = classification?.label || expectedType.replace(/時$/, '') || 'イベント種別未設定';
    const expectedSources = unique([
      effect.externalSourceId,
      effect.ownerId,
      effect.triggerSourceId
    ].map(valueText).filter(Boolean));
    const matches = (Array.isArray(events) ? events : []).filter(event => {
      const eventType = normalizeExternalEventType(event?.type || event?.triggerType || event?.eventType);
      if (!expectedType || eventType !== expectedType) return false;
      if (!expectedSources.length) return true;
      const eventSource = valueText(event?.sourceId || event?.triggerSourceId);
      // sourceId省略は従来どおり同種イベントのワイルドカード。
      return !eventSource || expectedSources.includes(eventSource);
    });
    return Object.freeze({
      required: true,
      matched: matches.length > 0,
      count: matches.length,
      expectedType,
      expectedLabel
    });
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

  // 発動元の判定では、効果対象や表示用の自由文を参照しない。
  // 例えば「高学年スキルの対象にする」は、高学年スキル自身の発動条件ではない。
  function getStructuredTriggerActionKeys(effect = {}) {
    const explicitKeys = Array.isArray(effect.triggerActionKeys)
      ? effect.triggerActionKeys.map(valueText).filter(Boolean)
      : [];
    const triggerOnlyEffect = {
      ...effect,
      targetActionKeys: [],
      targetSkill: '',
      targetSkillName: ''
    };
    const inferredKeys = getActionKeys(triggerOnlyEffect, '');
    return unique([...explicitKeys, ...inferredKeys]);
  }

  function getStructuredTriggerGrade(effect = {}) {
    const actionKeys = getStructuredTriggerActionKeys(effect);
    const hasLowSkill = actionKeys.includes('lowSkill');
    const hasHighSkill = actionKeys.includes('highSkill');
    if (hasLowSkill && hasHighSkill) return 'mixed';
    if (hasHighSkill) return 'high';
    if (hasLowSkill) return 'low';
    return null;
  }

  function isHighSkillRuntimeEffect(effect = {}) {
    return getStructuredTriggerActionKeys(effect).includes('highSkill');
  }

  function isExternalRuntimeCondition(effect = {}) {
    if (isExternalOccurrenceOnly(effect)) return true;
    if (effect.externalActionRequired !== true) return false;
    // 編成の普通／強化／低学年／高学年に連動する行は、発動時刻の
    // 自動確定が未実装でも「外部条件」ではなく「周期推定」に分類する。
    return getStructuredTriggerActionKeys(effect).length === 0;
  }

  function getRuntimeEffectPolicy(effect = {}, options = {}) {
    const fallbackText = [
      options.fallbackText,
      effect.runtimeText,
      effect.condition,
      effect.reason,
      effect.label,
      effect.category
    ].filter(Boolean).join(' ');
    const actionKeys = getStructuredTriggerActionKeys(effect);
    const triggerGrade = getStructuredTriggerGrade(effect);
    const explicitlyExternal = effect.externalActionRequired === true;
    const unsupported = !explicitlyExternal && isUnsupported(effect, fallbackText);
    const externalCondition = isExternalRuntimeCondition(effect);
    const capability = unsupported
      ? 'unsupported'
      : externalCondition
        ? 'external'
        : explicitlyExternal
          ? 'estimated'
          : 'exact';
    const highSkill = triggerGrade === 'high' || triggerGrade === 'mixed';
    const highSkillOnly = triggerGrade === 'high';
    const mixedSkill = triggerGrade === 'mixed';
    // 高学年単独の発動元だけを初期OFFにする。低学年と高学年を
    // まとめた旧行は、低学年まで止めないため自動扱いにしておき、
    // 後段で binding を分割する。
    const defaultMode = unsupported || highSkillOnly ? 'off' : 'auto';
    const triggerType = normalizeTriggerType(effect.triggerType);
    const triggerDomain = externalCondition
      ? 'external'
      : /n秒ごと|秒ごと/.test(triggerType) || Number(effect.intervalSeconds) > 0
        ? 'systemClock'
        : /リソース/.test(`${effect.conditionType || ''} ${effect.conditionValue || ''}`)
          ? 'resource'
          : /状態/.test(`${effect.conditionType || ''} ${effect.conditionValue || ''}`)
            ? 'status'
            : effect.externalActionRequired === true
              ? 'formationAction'
              : actionKeys.length
                ? 'selfAction'
                : 'sourceEvent';
    const reasonCode = highSkillOnly
      ? 'highSkillOptIn'
      : mixedSkill
        ? 'mixedActionBinding'
        : capability === 'external'
        ? 'externalOccurrence'
        : unsupported
          ? 'unsupportedTrigger'
          : !triggerType && !effect.triggerSourceId && !Number(effect.intervalSeconds)
            ? 'missingTriggerMetadata'
            : 'deterministicTrigger';
    const quality = valueText(effect.quality || effect.timingQuality)
      || (effect.timingSourceEffectId ? 'measured' : 'generated');
    return Object.freeze({
      capability,
      defaultMode,
      supportsFixed: !!options.supportsFixed,
      triggerDomain,
      reasonCode,
      quality,
      highSkill,
      highSkillOnly,
      mixedSkill,
      status: capability === 'external'
        ? 'externalWaiting'
        : capability === 'unsupported'
          ? 'unsupported'
          : defaultMode === 'off'
            ? 'optIn'
            : 'automatic'
    });
  }

  const RUNTIME_POLICY_REASON_LABELS = Object.freeze({
    highSkillOptIn: '高学年関連',
    mixedActionBinding: '低学年・高学年共通',
    externalOccurrence: '発生時刻を外部入力',
    unsupportedTrigger: '発動条件未対応',
    missingTriggerMetadata: '発動条件要確認',
    deterministicTrigger: '時系列処理'
  });
  const RUNTIME_POLICY_QUALITY_LABELS = Object.freeze({
    measured: '検証済',
    generated: '暫定',
    inferred: '推定',
    provisional: '暫定',
    unknown: '未確認'
  });

  // 設定カードが同じ効果について「現在の操作状態」と「発動能力」を
  // 混同しないための表示用変換も共通化する。mode は legacy の保存値を
  // そのまま受け取り、external は内部では auto のままでも外部入力待ちと
  // 表示する。
  function getRuntimeEffectPolicyPresentation(policy = {}, options = {}) {
    const mode = ['auto', 'fixed', 'off'].includes(options.mode)
      ? options.mode
      : (policy.defaultMode || 'auto');
    const explicit = options.explicit === true;
    const readOnly = options.readOnly === true;
    let label = '自動';
    let statusCode = 'automatic';
    let className = 'is-auto';
    if (readOnly) {
      label = '監査のみ';
      statusCode = 'readonly';
      className = 'is-readonly';
    } else if (mode === 'fixed') {
      label = '固定';
      statusCode = 'fixed';
      className = 'is-fixed';
    } else if (mode === 'off') {
      if (policy.capability === 'unsupported') {
        label = '未対応';
        statusCode = 'unsupported';
        className = 'is-unsupported';
      } else if (policy.status === 'optIn' && !explicit) {
        label = '初期OFF';
        statusCode = 'opt-in';
        className = 'is-opt-in';
      } else {
        label = 'OFF';
        statusCode = 'off';
        className = 'is-off';
      }
    } else if (policy.capability === 'estimated') {
      label = '自動（推定）';
      statusCode = 'estimated';
      className = 'is-estimated';
    } else if (policy.capability === 'external') {
      label = options.externalMatched ? '外部入力あり' : '外部入力待ち';
      statusCode = options.externalMatched ? 'externalMatched' : 'external';
      className = options.externalMatched ? 'is-external-active' : 'is-external';
    } else if (policy.capability === 'unsupported') {
      label = '未対応';
      statusCode = 'unsupported';
      className = 'is-unsupported';
    }
    const reasonLabel = RUNTIME_POLICY_REASON_LABELS[policy.reasonCode]
      || (policy.reasonCode ? String(policy.reasonCode) : '発動条件要確認');
    const qualityLabel = RUNTIME_POLICY_QUALITY_LABELS[policy.quality]
      || (policy.quality ? String(policy.quality) : '未確認');
    return Object.freeze({
      mode,
      label,
      statusCode,
      className,
      reasonLabel,
      qualityLabel,
      detailLabel: `${reasonLabel} / ${qualityLabel}`
    });
  }

  // 効果行と外部イベント候補を同じ「発動binding」として扱うための
  // 安定した識別子。効果の表示名はデータ更新で変わることがあるため、
  // owner / trigger / source / condition の構造化値を優先する。
  function getRuntimeEffectBindingKey(effect = {}, options = {}) {
    const owner = valueText(effect.ownerId || effect.ownerName || options.ownerId || options.ownerName);
    const triggerType = normalizeTriggerType(
      effect.triggerType || effect.externalTriggerType || effect.eventType || options.triggerType
    );
    const source = valueText(
      effect.triggerSourceId || effect.externalSourceId || effect.sourceId || options.sourceId
    );
    const condition = [
      effect.conditionType,
      effect.conditionValue,
      effect.targetSkill,
      effect.targetSkillName,
      effect.attackCategory
    ].map(valueText).filter(Boolean).join('|');
    const explicit = valueText(effect.bindingKey || effect.effectBindingKey || options.bindingKey);
    if (explicit) return explicit;
    const parts = [owner, triggerType, source, condition].filter(Boolean);
    if (parts.length) return parts.join('::');
    const fallback = valueText(effect.id || effect.effectId || effect.sourceId || options.id);
    return fallback ? `effect:${fallback}` : 'effect:unbound';
  }

  function getRuntimeEffectSchedulePolicy(effect = {}, options = {}) {
    const fallbackText = [
      options.fallbackText,
      effect.runtimeText,
      effect.condition,
      effect.reason,
      effect.label,
      effect.category
    ].filter(Boolean).join(' ');
    const policy = options.policy || getRuntimeEffectPolicy(effect, options);
    const triggerType = normalizeTriggerType(effect.triggerType || effect.externalTriggerType);
    const actionKeys = unique([
      ...(Array.isArray(effect?.triggerActionKeys) ? effect.triggerActionKeys : []),
      ...(Array.isArray(effect?.targetActionKeys) ? effect.targetActionKeys : []),
      ...getActionKeys(effect, fallbackText)
    ].map(valueText).filter(Boolean));
    const externalOccurrenceOnly = isExternalOccurrenceOnly(effect);
    const directActionTrigger = /^(?:低学年スキル|高学年スキル|普通攻撃|強化攻撃)(?:使用|発動|終了|命中)時(?:一定確率)?$/.test(triggerType);
    const linkedActionTrigger = /(?:低学年|高学年)スキル(?:効果発生|最終ヒット命中)時|^(?:低学年|高学年)スキル命中時$|^(?:低学年|高学年)スキル終了時$|^スキル(?:使用|発動|終了|命中)時$|^攻撃命中時$|^ダメージ命中時$|^n回ごと$|^規定ヒット時$/.test(triggerType);
    const actionLinked = !externalOccurrenceOnly && actionKeys.length > 0 && (
      directActionTrigger
      || linkedActionTrigger
      || effect.externalActionRequired === true
      || policy.triggerDomain === 'selfAction'
      || policy.triggerDomain === 'formationAction'
    );
    const systemClock = !externalOccurrenceOnly && (
      triggerType === '戦闘開始時'
      || triggerType === 'ウェーブ開始時'
      || triggerType === 'カード選択時'
      || triggerType === 'n秒ごと'
      || /秒ごと/.test(triggerType)
      || Number(effect.intervalSeconds) > 0
    );
    const unsupported = policy.capability === 'unsupported';
    const externalCondition = !unsupported
      && policy.capability === 'external'
      && !actionLinked;
    const supportsAutomatic = !unsupported
      && !externalCondition
      && policy.capability === 'exact';
    const supportsEstimated = !unsupported
      && !externalCondition
      && actionLinked
      && (policy.capability === 'estimated'
        || effect.externalActionRequired === true
        || policy.triggerDomain === 'formationAction'
        || options.formationAction === true);
    const supportsPeriodic = !unsupported
      && !externalCondition
      && (actionLinked || systemClock || supportsEstimated);
    const supportsExternalInput = !unsupported && externalCondition;
    const supportsOccurrences = supportsExternalInput;
    const capabilityLabels = [];
    if (supportsAutomatic) capabilityLabels.push('自動対応');
    if (supportsEstimated) capabilityLabels.push('周期推定');
    if (supportsPeriodic) capabilityLabels.push('周期指定対応');
    if (supportsExternalInput) capabilityLabels.push('外部入力対応');
    if (!capabilityLabels.length && unsupported) capabilityLabels.push('未対応');
    const scheduleDomain = externalCondition
      ? 'externalCondition'
      : actionLinked
        ? 'action'
        : systemClock
          ? 'systemClock'
          : policy.triggerDomain;
    const classification = getExternalEventClassification({ triggerType });
    return Object.freeze({
      bindingKey: getRuntimeEffectBindingKey(effect, options),
      triggerType,
      triggerLabel: classification?.label || triggerType.replace(/時$/, '') || '発動条件未設定',
      actionKeys,
      actionLinked,
      externalOccurrenceOnly,
      externalCondition,
      scheduleDomain,
      supportsAutomatic,
      supportsEstimated,
      supportsPeriodic,
      supportsOccurrences,
      supportsExternalInput,
      capabilityLabels,
      capabilityLabel: capabilityLabels.join(' / ') || '未対応',
      reasonCode: policy.reasonCode,
      quality: policy.quality,
      defaultMode: policy.defaultMode,
      highSkill: policy.highSkill
    });
  }

  function getDpsFormationCandidateSchedulePolicy(candidate = {}) {
    const timingMode = valueText(candidate.timingMode).toLowerCase();
    const actionLinked = timingMode === 'periodic';
    const eventClass = valueText(candidate.eventClass);
    if (actionLinked) {
      return Object.freeze({
        mode: 'periodic',
        actionLinked: true,
        capability: 'periodic',
        capabilityLabel: '周期指定対応',
        inputLabel: '時系列効果・発動タイミング',
        eventClass,
        reason: '編成行動に連動する効果。初期値は行動間隔・SP・CTからの推定値。'
      });
    }
    return Object.freeze({
      mode: 'external',
      actionLinked: false,
      capability: 'external',
      capabilityLabel: '外部入力対応',
      inputLabel: '外部条件イベント',
      eventClass,
      reason: '敵状態や戦闘結果など、時刻を自動確定しない条件。'
    });
  }

  function isHighSkillFormationCandidate(candidate = {}) {
    const periodicActionLabel = valueText(candidate.periodicActionLabel);
    if (periodicActionLabel === '高学年') return true;
    const actionKeys = Array.isArray(candidate.triggerActionKeys)
      ? candidate.triggerActionKeys.map(valueText)
      : [];
    if (actionKeys.includes('highSkill')) return true;
    return /^(?:高学年スキル|高学年)(?:使用|発動|終了|命中|効果発生|最終ヒット命中)時?$/.test(
      normalizeTriggerType(candidate.triggerType)
    );
  }

  function isFormationCandidateManuallyScheduled(candidate = {}, events = []) {
    const candidateId = valueText(candidate.id);
    const bindingKey = valueText(candidate.bindingKey);
    return (Array.isArray(events) ? events : []).some(event => {
      const eventCandidateId = valueText(event.candidateId || event.formationCandidateId);
      const eventBindingKey = valueText(event.bindingKey || event.candidateBindingKey);
      return (candidateId && eventCandidateId === candidateId)
        || (bindingKey && eventBindingKey === bindingKey);
    });
  }

  function isDpsFormationCandidateAutoEnabled(candidate = {}, options = {}, events = []) {
    const schedulePolicy = getDpsFormationCandidateSchedulePolicy(candidate);
    if (schedulePolicy.mode !== 'periodic') return false;
    if (!(Number(candidate.intervalSeconds) > 0)) return false;
    const bindingKey = valueText(candidate.bindingKey);
    const candidateId = valueText(candidate.id);
    const bindingModes = options.bindingModes && typeof options.bindingModes === 'object'
      ? options.bindingModes
      : {};
    const candidateActionKey = candidate.periodicActionLabel === '高学年'
      ? 'highSkill'
      : candidate.periodicActionLabel === '低学年'
        ? 'lowSkill'
        : '';
    const scopedBindingKey = bindingKey && candidateActionKey
      ? `${bindingKey}::${candidateActionKey}`
      : '';
    const explicitMode = valueText(
      (scopedBindingKey && bindingModes[scopedBindingKey])
        || (bindingKey && bindingModes[bindingKey])
        || (candidateId && bindingModes[candidateId])
    );
    if (explicitMode === 'off' || explicitMode === 'fixed') return false;
    if (explicitMode === 'auto') return !isFormationCandidateManuallyScheduled(candidate, events);
    if (isHighSkillFormationCandidate(candidate)
      && valueText(options.formationHighSkillMode || 'disabled') !== 'auto') return false;
    if (valueText(options.formationTimelineMode || 'supportEstimate') !== 'supportEstimate') return false;
    return !isFormationCandidateManuallyScheduled(candidate, events);
  }
  function getDpsFormationBindingModes(runtimeEffects = {}) {
    const modes = {};
    [
      'attackSpeedEffects',
      'damageBuffEffects',
      'spRecoveryEffects',
      'cooldownEffects',
      'eventEffects'
    ].forEach(collectionKey => {
      (runtimeEffects?.[collectionKey] || []).forEach(effect => {
        if (effect?.runtimeHasExplicitOverride !== true) return;
        const bindingKey = valueText(effect.bindingKey);
        const effectId = valueText(effect.id || effect.effectId);
        const rawMode = valueText(effect.runtimeOverrideMode);
        const mode = ['auto', 'fixed', 'off'].includes(rawMode) ? rawMode : '';
        if (!mode) return;
        if (bindingKey) modes[bindingKey] = mode;
        if (effectId) modes[effectId] = mode;
      });
    });
    return modes;
  }

  function createDpsFormationEstimatedEvents(candidates = [], options = {}, manualEvents = []) {
    const sourceCandidates = Array.isArray(candidates) ? candidates : [];
    const sourceEvents = Array.isArray(manualEvents) ? manualEvents : [];
    return sourceCandidates
      .filter(candidate => isDpsFormationCandidateAutoEnabled(candidate, options, sourceEvents))
      .map(candidate => {
        const startSeconds = Math.max(0, Number(candidate.startSeconds) || 0);
        const intervalSeconds = Math.max(0, Number(candidate.intervalSeconds) || 0);
        const repeatCount = Math.max(0, Math.floor(Number(candidate.repeatCount) || 0));
        return {
          id: `auto:${valueText(candidate.id) || 'formation'}`,
          type: valueText(candidate.type),
          frame: startSeconds * 60,
          intervalFrames: intervalSeconds * 60,
          repeatCount,
          sourceId: valueText(candidate.sourceId || candidate.ownerId),
          value: candidate.value ?? candidate.conditionValue ?? candidate.triggerValue ?? '',
          status: candidate.status || '',
          statusDurationFrames: Math.max(0, Number(candidate.statusDurationFrames) || 0),
          reason: `${valueText(candidate.label || candidate.type || '編成行動')}（自動推定）`,
          candidateId: valueText(candidate.id),
          candidateLabel: valueText(candidate.label),
          candidateBasis: valueText(candidate.basis),
          candidateEffectLabels: Array.isArray(candidate.effectLabels) ? candidate.effectLabels : [],
          bindingKey: valueText(candidate.bindingKey),
          timingMode: 'periodic',
          eventClass: valueText(candidate.eventClass),
          eventLabel: valueText(candidate.eventLabel),
          repeatability: valueText(candidate.repeatability),
          inputMode: 'periodic',
          triggerSourceId: valueText(candidate.triggerSourceId),
          conditionType: valueText(candidate.conditionType),
          conditionValue: valueText(candidate.conditionValue),
          provider: 'estimated'
        };
      })
      .filter(event => event.type && event.candidateId && event.intervalFrames > 0);
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
    getStructuredTriggerActionKeys,
    getStructuredTriggerGrade,
    getIntervalSeconds,
    getTriggerCount,
    getPhase,
    getProbability,
    isOrdinaryAttackProbabilityTrigger,
    isEffectSourceTrigger,
    isExternalOccurrenceOnly,
    isExternalRuntimeCondition,
    isUnsupported,
    getExternalEventClassification,
    normalizeExternalEventType,
    getRuntimeExternalEventMatchState,
    isHighSkillRuntimeEffect,
    getRuntimeEffectPolicy,
    getRuntimeEffectPolicyPresentation,
    getRuntimeEffectBindingKey,
    getRuntimeEffectSchedulePolicy,
    getDpsFormationCandidateSchedulePolicy,
    isHighSkillFormationCandidate,
    isFormationCandidateManuallyScheduled,
    isDpsFormationCandidateAutoEnabled,
    getDpsFormationBindingModes,
    createDpsFormationEstimatedEvents
  });
});
