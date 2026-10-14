(() => {
  'use strict';

                                      
                                  
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
  function evaluate(snapshot = {}, options = {}) {
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
                                                                           
                                                                                  
                                                                                
    if (id === 'gabia' && !(timing.actions?.lowSkill?.generatedObjects || [])
      .some(item => item.executionMode === '召喚ユニット')) {
      return unsupported({ id, label, asideRank, favoriteLevels, implementationStatuses: statuses, requiredComponents,
        reason: 'ガヴィアは低学年のシールド終了時攻撃がDPS接続待ちです。そのダメージを省いた結果は表示しません。' });
    }
                                
                                        
    if (id === 'mago' && !(timing.actions?.highSkill?.generatedObjects || [])
      .some(item => item.executionMode === '召喚ユニット')) {
      return unsupported({ id, label, asideRank, favoriteLevels, implementationStatuses: statuses, requiredComponents,
        reason: 'マーゴは高学年で呼ぶヒツジの攻撃がDPS未対応です。本人の一撃として代用せず、ヒツジの攻撃回数・能力・時間を接続する必要があります。' });
    }
    if (id === 'risty' && !(timing.actions?.lowSkill?.generatedObjects || [])
      .some(item => item.executionMode === '召喚ユニット')) {
      return unsupported({ id, label, asideRank, favoriteLevels, implementationStatuses: statuses, requiredComponents,
        reason: 'リスティは低学年で呼ぶクマの攻撃が接続待ちです。その攻撃を省いた結果は表示しません。' });
    }
                                                                                
                                                                            
                                                                                
    if (id === 'elena' && asideRank === 0 && !favoriteLevels.some(level => level > 0)
      && options.highSkillMode !== 'disabled'
      && !(timing.actions?.highSkill?.generatedObjects || [])
        .some(item => item.executionMode === '召喚ユニット')) {
      return unsupported({ id, label, asideRank, favoriteLevels, implementationStatuses: statuses, requiredComponents,
        reason: 'エレナの高学年で呼ぶドローンの攻撃はDPS接続待ちです。基本攻撃7回と自爆1回を、ドローン自身の能力と時間で計算する必要があります。高学年OFFでは計算できます。' });
    }
    const missing = requiredComponents.filter(component => !IMPLEMENTED_STATUSES.includes(component.status));
    const blockingMissing = missing.filter(component => component.key === 'normal');
    const incompleteAddons = missing.filter(component => component.key !== 'normal');
    if (blockingMissing.length) {
      const details = blockingMissing.map(component => `${component.label}: ${component.status}`).join('、');
      return unsupported({ id, label, asideRank, favoriteLevels, implementationStatuses: statuses, requiredComponents,
        reason: `${label}の必要な構成はDPS未対応です（${details}）。` });
    }
    const summonDefinitions = Object.entries(timing.actions || {})
      .filter(([key]) => key !== 'highSkill' || options.highSkillMode !== 'disabled')
      .flatMap(([, action]) => (
      (action.generatedObjects || []).filter(item => item.executionMode === '召喚ユニット')
    ));
    if (summonDefinitions.length) {
      const issues = [...new Set(summonDefinitions.flatMap(item => item.executionIssues || []))];
      const validate = globalThis.TRICKCAL_DPS_SIMULATOR?.getSummonCalculationIssues;
      const calculationIssues = snapshot.summonCalculationInput && typeof validate === 'function'
        ? validate(snapshot.summonCalculationInput, summonDefinitions) : [
          '分身自身の能力・状態継承と命中計算の供給元対応が未接続です'
        ];
      const provisionalMomo = id === 'momo' && snapshot.summonCalculationInput?.provisionalModel === 'momo-site-snapshot-v1'
        && !issues.length && !calculationIssues.length;
      const provisionalElena = id === 'elena' && asideRank === 0 && !favoriteLevels.some(level => level > 0)
        && snapshot.summonCalculationInput?.provisionalModel === 'elena-known-site-neutral-v1'
        && summonDefinitions.length === 1 && summonDefinitions[0].id === 'Elena_high_drone'
        && !issues.length && !calculationIssues.length;
      const provisionalEpica = id === 'epica' && asideRank === 0 && !favoriteLevels.some(level => level > 0)
        && snapshot.summonCalculationInput?.provisionalModel === 'epica-normal-physical-skill-speed-v1'
        && summonDefinitions.length === 3
        && new Set(summonDefinitions.map(item => item.id)).size === 3
        && summonDefinitions.every(item => /^Epica_high_dedicated_[123]$/.test(item.id))
        && !issues.length && !calculationIssues.length;
      const provisionalMago = id === 'mago' && asideRank === 0 && !favoriteLevels.some(level => level > 0)
        && snapshot.summonCalculationInput?.provisionalModel === 'mago-known-site-neutral-v1'
        && summonDefinitions.length === 1 && summonDefinitions[0].id === 'Mago_high_sheep'
        && !issues.length && !calculationIssues.length;
      const provisionalAshur = id === 'ashur' && asideRank === 0 && !favoriteLevels.some(level => level > 0)
        && snapshot.summonCalculationInput?.provisionalModel === 'ashur-known-site-recorded-contact-v1'
        && summonDefinitions.length === 1 && summonDefinitions[0].id === 'Ashur_low_dessert'
        && !issues.length && !calculationIssues.length;
      const provisionalRisty = id === 'risty'
        && snapshot.summonCalculationInput?.provisionalModel === 'risty-known-site-neutral-v1'
        && summonDefinitions.length === 1 && summonDefinitions[0].id === 'Risty_low_bear'
        && !issues.length && !calculationIssues.length;
      if (!provisionalMomo && !provisionalElena && !provisionalEpica && !provisionalMago && !provisionalAshur && !provisionalRisty) return unsupported({ id, label, asideRank, favoriteLevels, implementationStatuses: statuses, requiredComponents,
        reason: `${label}の召喚ユニットDPSは${issues.length ? '入力待ち' : '実装待ち'}です。${[...issues, ...calculationIssues].slice(0, 3).join(' / ') || '実データの能力組立・終了効果の統合検証待ちです'}。` });
    }
    if (id === 'epica' && asideRank >= 2) {
      const enemyCount = Number(snapshot.scenario?.battleConditions?.epicaA2EnemyCount || 1);
      const reason = enemyCount !== 1
        ? 'エピカA2暫定DPSは敵1体に限定しています。敵数を1体にしてください。'
        : '';
      if (reason) return unsupported({ id, label, asideRank, favoriteLevels,
        implementationStatuses: statuses, requiredComponents, reason });
      const normalActions = ['basicAttack', 'enhancedAttack'];
      const hitConsumers = ['spRecoveryEffects', 'cooldownEffects', 'damageBuffEffects']
        .flatMap(key => snapshot.runtimeEffects?.[key] || [])
        .some(effect => effect.mode === 'actionHit' && effect.triggerActionKeys?.some(key => normalActions.includes(key)));
      if (hitConsumers) return unsupported({ id, label, asideRank, favoriteLevels,
        implementationStatuses: statuses, requiredComponents,
        reason: 'エピカA2暫定DPSでは普通攻撃の外部命中時効果との併用は未対応です。' });
    }
    const provisionalComponents = requiredComponents.filter(component => component.status === '暫定'
      || incompleteAddons.includes(component));
    const warnings = incompleteAddons.length ? [
      `${incompleteAddons.map(component => `${component.label}: ${component.status}`).join('、')}。未反映・未検証の効果があるため、DPSは参考値です。対応済みの効果は計算しますが、選択した構成全体の再現は保証しません。`
    ] : [];
    const enemySourceMode = snapshot.scenario?.actors?.enemy?.sourceMode
      ?? snapshot.scenario?.battleConditions?.enemySourceMode;
    if (id === 'tig' && enemySourceMode === 'apostle') {
      provisionalComponents.push(Object.freeze({ key: 'heroHp', label: 'HP追加分未計上', status: '暫定' }));
      warnings.push('ティグの使徒相手への最大HP追加ダメージは未計上です。攻撃力由来のダメージだけで暫定比較します。');
    }
                                   
                               
    if (id === 'snorky' && asideRank === 0 && !favoriteLevels.some(level => level > 0)) {
      provisionalComponents.push(Object.freeze({ key: 'movement', label: '移動モデル', status: '暫定' }));
    }
    if (id === 'momo' && snapshot.summonCalculationInput?.provisionalModel === 'momo-site-snapshot-v1') {
      provisionalComponents.push(Object.freeze({ key: 'summon', label: '分身モデル', status: '暫定' }));
    }
    if (id === 'elena' && summonDefinitions.length
      && snapshot.summonCalculationInput?.provisionalModel === 'elena-known-site-neutral-v1') {
      provisionalComponents.push(Object.freeze({ key: 'summon', label: 'ドローンモデル', status: '暫定' }));
    }
    if (id === 'epica' && summonDefinitions.length
      && snapshot.summonCalculationInput?.provisionalModel === 'epica-normal-physical-skill-speed-v1') {
      provisionalComponents.push(Object.freeze({ key: 'summon', label: '人形モデル', status: '暫定' }));
      warnings.push('一部に暫定値を使用しています。実ゲームと結果が異なる場合があります。');
    }
    if (id === 'mago' && summonDefinitions.length
      && snapshot.summonCalculationInput?.provisionalModel === 'mago-known-site-neutral-v1') {
      provisionalComponents.push(Object.freeze({ key: 'summon', label: '召喚モデル', status: '暫定' }));
      warnings.push('一部に暫定的な数値を使用しています。実ゲームと結果が異なる場合があります。');
    }
    if (id === 'ashur' && summonDefinitions.length
      && snapshot.summonCalculationInput?.provisionalModel === 'ashur-known-site-recorded-contact-v1') {
      provisionalComponents.push(Object.freeze({ key: 'summon', label: '召喚モデル', status: '暫定' }));
      warnings.push('一部に暫定的な数値を使用しています。実ゲームと結果が異なる場合があります。');
    }
    if (id === 'risty' && summonDefinitions.length
      && snapshot.summonCalculationInput?.provisionalModel === 'risty-known-site-neutral-v1') {
      provisionalComponents.push(Object.freeze({ key: 'summon', label: '人形モデル', status: '暫定' }));
      warnings.push('一部に暫定的な数値を使用しています。実ゲームと結果が異なる場合があります。');
    }
    if (snapshot.highSkillCooldownSettings?.initialCooldownProvisional
      || (snapshot.formationSupportClocks || []).some(clock =>
        clock.input?.highSkillCooldownSettings?.initialCooldownProvisional)) {
      provisionalComponents.push(Object.freeze({ key: 'initialCooldown', label: '初回待機', status: '暫定' }));
      warnings.push('高学年の初回待機時間に暫定的な設定を使用しています。');
    }
    if (snapshot.seasonRuleWarnings?.length) {
      provisionalComponents.push(Object.freeze({ key: 'season', label: 'シーズンルール', status: '暫定' }));
      warnings.push(...snapshot.seasonRuleWarnings);
    }
    const provisionalLabel = provisionalComponents.map(component => component.label).join('・');
    const statusLabel = requiredComponents.map(component => `${component.label}: ${component.status}`).join(' / ');
    return Object.freeze({
      supported: true, id, label, asideRank, favoriteLevels, implementationStatuses: statuses, requiredComponents,
      configuration: getConfigurationLabel(requiredKeys), fixtures: [],
      provisional: provisionalComponents.length > 0, provisionalComponents, provisionalLabel, statusLabel,
      warnings, incompleteComponents: incompleteAddons
    });
  }
  window.TRICKCAL_DPS_SUPPORT_REGISTRY = Object.freeze({
    version: 12, IMPLEMENTED_STATUSES, COMPONENTS, getFavoriteLevels, getRequiredComponentKeys, evaluate
  });
})();
