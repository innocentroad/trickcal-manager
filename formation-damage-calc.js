(() => {
  document.documentElement?.classList?.add('fdc-root');
  const STAT_STORAGE_KEY = 'trickcal_stat_prototype_v1';
  const CALC_SETTINGS_KEY = 'trickcal_formation_damage_settings_v1';
  const CUSTOM_ENEMY_PRESETS_KEY = 'trickcal_formation_damage_enemy_presets_v1';
  const THEME_KEY = 'trickcal_theme';
  const LEGACY_THEME_KEY = 'trickcal_damage_calc_theme';
  const FALLBACK_IMAGE = 'img/Chara/null.webp';
  const POSITIONS = ['後列', '中列', '前列'];
  const PERSONALITY_ADVANTAGE = {
    '純粋': '冷静',
    '冷静': '狂気',
    '狂気': '純粋',
    '憂鬱': '活発',
    '活発': '憂鬱'
  };
  const APOSTLE_IMAGE_ALIASES = {
    Kyuri: 'Kyuri',
    Kyui: 'Kyuri',
    Kyuui: 'Kyuri',
    Kiwi: 'Kyuri',
    Cuee: 'Kyuri',
    Shaydi: 'Shaydi',
    Shady: 'Shaydi',
    Lazy: 'Layze',
    Layze: 'Layze',
    Razy: 'Layze',
    Reizy: 'Layze',
    Selline: 'Selene',
    Selene: 'Selene',
    Rude: 'Rude',
    Rudd: 'Rude',
    Lude: 'Rude',
    RenewaAwaken: 'Renewa',
    Xion: 'Xion',
    xion: 'Xion',
    xXionx: 'Xion',
    Sion: 'Xion',
    sion: 'Xion',
    'シオン': 'Xion',
    'シオン・ザ・DB': 'Xion'
  };

  const el = {
    reload: document.getElementById('fdc-reload'),
    themeToggle: document.getElementById('fdc-theme-toggle'),
    perspectiveToggle: document.getElementById('fdc-perspective-toggle'),
    perspectiveLabel: document.getElementById('fdc-perspective-label'),
    damageType: document.getElementById('fdc-damage-type'),
    enemyDamageType: document.getElementById('fdc-enemy-damage-type'),
    gradeOverride: document.getElementById('fdc-grade-override'),
    statMode: document.getElementById('fdc-stat-mode'),
    selfRoleChip: document.getElementById('fdc-self-role-chip'),
    enemyRoleChip: document.getElementById('fdc-enemy-role-chip'),
    selfAttackTypeChip: document.getElementById('fdc-self-attack-type-chip'),
    enemyAttackTypeChip: document.getElementById('fdc-enemy-attack-type-chip'),
    enemyPreset: document.getElementById('fdc-enemy-preset'),
    enemyPresetName: document.getElementById('fdc-enemy-preset-name'),
    enemyPresetSave: document.getElementById('fdc-enemy-preset-save'),
    enemyPresetDelete: document.getElementById('fdc-enemy-preset-delete'),
    enemyPersonality: document.getElementById('fdc-enemy-personality'),
    enemyPersonalityIcon: document.getElementById('fdc-enemy-personality-icon'),
    enemyPhase: document.getElementById('fdc-enemy-phase'),
    enemyPhaseField: document.getElementById('fdc-enemy-phase-field'),
    enemySkill: document.getElementById('fdc-enemy-skill'),
    enemySkillChoices: document.getElementById('fdc-enemy-skill-choices'),
    selfWeaknessField: document.getElementById('fdc-self-weakness-field'),
    selfWeaknessLabel: document.getElementById('fdc-self-weakness-label'),
    enemyWeaknessField: document.getElementById('fdc-enemy-weakness-field'),
    enemyWeaknessLabel: document.getElementById('fdc-enemy-weakness-label'),
    selfBuffCategory: document.getElementById('fdc-self-buff-category'),
    enemyBuffCategory: document.getElementById('fdc-enemy-buff-category'),
    formationPreset: document.getElementById('fdc-formation-preset'),
    targetPreview: document.getElementById('fdc-target-preview'),
    floatingTarget: document.getElementById('fdc-floating-target'),
    formationPicker: document.getElementById('fdc-formation-picker'),
    skillPopover: document.getElementById('fdc-skill-popover'),
    selfSkillEffects: document.getElementById('fdc-self-skill-effects'),
    synergyCategory: document.getElementById('fdc-synergy-category'),
    artifactCategory: document.getElementById('fdc-artifact-category'),
    artifactEffectsToggle: document.getElementById('fdc-artifact-effects-toggle'),
    spellCategory: document.getElementById('fdc-spell-category'),
    applyFloat: document.getElementById('fdc-apply-float-controller'),
    applyFloatPanel: document.getElementById('fdc-apply-float-panel'),
    applyFloatToggle: document.getElementById('fdc-apply-float-toggle'),
    applyFloatInputs: Array.from(document.querySelectorAll('[data-fdc-apply-source]')),
    applyFloatDots: Array.from(document.querySelectorAll('[data-fdc-apply-dot]')),
    applyFloatBulk: Array.from(document.querySelectorAll('[data-fdc-apply-bulk]')),
    selfSkillChoices: document.getElementById('fdc-self-skill-choices'),
    inputs: {
      selfHp: document.getElementById('fdc-self-hp'),
      atk: document.getElementById('fdc-atk'),
      selfDef: document.getElementById('fdc-self-def'),
      crit: document.getElementById('fdc-crit'),
      critDmg: document.getElementById('fdc-crit-dmg'),
      selfCritResBase: document.getElementById('fdc-self-crit-res-base'),
      selfCritDmgResBase: document.getElementById('fdc-self-crit-dmg-res-base'),
      enemyHp: document.getElementById('fdc-enemy-hp'),
      enemyAtk: document.getElementById('fdc-enemy-atk'),
      enemyCrit: document.getElementById('fdc-enemy-crit'),
      enemyCritDmg: document.getElementById('fdc-enemy-crit-dmg'),
      enemySkill: document.getElementById('fdc-enemy-skill-value'),
      def: document.getElementById('fdc-def'),
      critRes: document.getElementById('fdc-crit-res'),
      critDmgRes: document.getElementById('fdc-crit-dmg-res'),
      selfAtkP: document.getElementById('fdc-self-atk-p'),
      selfCritP: document.getElementById('fdc-self-crit-p'),
      selfCritDmgP: document.getElementById('fdc-self-crit-dmg-p'),
      selfSkill: document.getElementById('fdc-self-skill'),
      selfType: document.getElementById('fdc-self-type'),
      selfOther: document.getElementById('fdc-self-other'),
      selfAddP: document.getElementById('fdc-self-add-p'),
      selfPoisonStack: document.getElementById('fdc-self-poison-stack'),
      selfNoise: document.getElementById('fdc-self-noise'),
      selfWeaknessP: document.getElementById('fdc-self-weakness-p'),
      selfCritRateP: document.getElementById('fdc-self-crit-rate-p'),
      selfAttackerDmgDownP: document.getElementById('fdc-self-attacker-dmg-down-p'),
      selfDefDownP: document.getElementById('fdc-self-def-down-p'),
      selfCritResDownP: document.getElementById('fdc-self-crit-res-down-p'),
      selfCritDmgResDownP: document.getElementById('fdc-self-crit-dmg-res-down-p'),
      selfDefP: document.getElementById('fdc-self-def-p'),
      selfTakenDmgP: document.getElementById('fdc-self-taken-dmg-p'),
      selfCritResP: document.getElementById('fdc-self-crit-res-p'),
      selfCritDmgResP: document.getElementById('fdc-self-crit-dmg-res-p'),
      enemyDefP: document.getElementById('fdc-enemy-def-p'),
      enemyTakenDmgP: document.getElementById('fdc-enemy-taken-dmg-p'),
      enemyCritResP: document.getElementById('fdc-enemy-crit-res-p'),
      enemyCritDmgResP: document.getElementById('fdc-enemy-crit-dmg-res-p'),
      enemyAtkP: document.getElementById('fdc-enemy-atk-p'),
      enemyCritP: document.getElementById('fdc-enemy-crit-p'),
      enemyCritDmgP: document.getElementById('fdc-enemy-crit-dmg-p'),
      enemyType: document.getElementById('fdc-enemy-type'),
      enemySpecial: document.getElementById('fdc-enemy-special'),
      enemyOther: document.getElementById('fdc-enemy-other'),
      enemyAddP: document.getElementById('fdc-enemy-add-p'),
      enemyPoisonStack: document.getElementById('fdc-enemy-poison-stack'),
      enemyNoise: document.getElementById('fdc-enemy-noise'),
      enemyWeaknessP: document.getElementById('fdc-enemy-weakness-p'),
      enemyCritRateP: document.getElementById('fdc-enemy-crit-rate-p'),
      enemyAttackerDmgDownP: document.getElementById('fdc-enemy-attacker-dmg-down-p'),
      enemyDefDownP: document.getElementById('fdc-enemy-def-down-p'),
      enemyCritResDownP: document.getElementById('fdc-enemy-crit-res-down-p'),
      enemyCritDmgResDownP: document.getElementById('fdc-enemy-crit-dmg-res-down-p')
    },
    result: {
      normal: document.getElementById('fdc-result-normal'),
      crit: document.getElementById('fdc-result-crit'),
      expected: document.getElementById('fdc-result-expected'),
      critRate: document.getElementById('fdc-result-crit-rate'),
      defRate: document.getElementById('fdc-result-def-rate'),
      detailToggle: document.getElementById('fdc-result-detail-toggle'),
      detailPanel: document.getElementById('fdc-result-detail-panel'),
      detailNote: document.getElementById('fdc-result-detail-note'),
      detailGrid: document.getElementById('fdc-result-detail-grid')
    }
  };

  const view = {
    targetId: '',
    damageType: 'auto',
    enemyDamageType: 'auto',
    gradeOverride: 'saved',
    statMode: 'current',
    perspective: 'self',
    enemyPersonality: '',
    enemyPresetKey: '',
    formationPresetId: '',
    enemyPhaseIndex: 0,
    enemySkillIndex: -1,
    pickerMode: 'formation',
    pickerSearch: '',
    pickerSort: 'name',
    pickerFilters: {
      personality: '',
      position: '',
      role: ''
    },
    statDirty: false,
    selectedSkillCategory: '',
    skillLevelOverrides: {},
    selfSkillEffectEnabled: {},
    conditionalEffectEnabled: {},
    tempMembers: {},
    pendingTempMemberId: '',
    spellDetailsOpen: false,
    tempArtifacts: {
      formation: {},
      target: {}
    },
    artifactPicker: null,
    effectSources: {
      synergy: true,
      artifact: true,
      spell: true,
      globalStats: true
    }
  };
  restoreCalcSettings();

  initTheme();
  setupCollapsibleStatCategories();
  bindEvents();
  populateEnemyPresets();
  applyEnemyPreset();
  render();

  function bindEvents() {
    el.reload?.addEventListener('click', () => {
      view.statDirty = false;
      render();
    });
    el.themeToggle?.addEventListener('click', toggleTheme);
    el.result.detailToggle?.addEventListener('click', () => {
      const open = el.result.detailPanel?.hidden !== false;
      setResultDetailOpen(open);
      const context = buildContext();
      renderResultDetail(context, calculateDamage(context));
    });
    el.applyFloatToggle?.addEventListener('click', () => toggleApplyFloatPanel());
    el.applyFloatInputs.forEach(input => {
      input.addEventListener('change', () => {
        view.effectSources[input.dataset.fdcApplySource] = !!input.checked;
        saveCalcSettings();
        syncApplyFloatUi();
        render();
      });
    });
    el.artifactEffectsToggle?.addEventListener('change', () => {
      view.effectSources.artifact = !!el.artifactEffectsToggle.checked;
      saveCalcSettings();
      syncApplyFloatUi();
      render();
    });
    el.applyFloatBulk.forEach(button => {
      button.addEventListener('click', () => {
        const enabled = button.dataset.fdcApplyBulk === 'on';
        Object.keys(view.effectSources).forEach(key => { view.effectSources[key] = enabled; });
        saveCalcSettings();
        syncApplyFloatUi();
        render();
      });
    });
    document.addEventListener('click', event => {
      const toggle = event.target.closest('[data-fdc-category-toggle]');
      if (!toggle) return;
      const category = toggle.closest('.stat-category');
      if (!category) return;
      setStatCategoryCollapsed(category, !category.classList.contains('is-collapsed'));
    });
    document.addEventListener('click', event => {
      if (!el.applyFloat || el.applyFloat.contains(event.target)) return;
      closeApplyFloatPanel();
    });
    document.addEventListener('click', event => {
      if (!el.skillPopover || el.skillPopover.hidden) return;
      if (el.skillPopover.contains(event.target) || event.target.closest('.fdc-skill-choice-info')) return;
      hideFdcSkillPopover();
    });
    document.addEventListener('click', event => {
      const spellDetailsButton = event.target.closest('[data-fdc-spell-details-toggle]');
      if (spellDetailsButton) {
        event.preventDefault();
        view.spellDetailsOpen = !view.spellDetailsOpen;
        renderSpellCategory(buildContext());
        return;
      }
      const button = event.target.closest('[data-fdc-artifact-detail]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      showFdcArtifactPopover(button);
    });
    document.addEventListener('click', event => {
      const slot = event.target.closest('[data-fdc-temp-artifact-slot], [data-fdc-temp-artifact-row]');
      if (!slot) return;
      event.preventDefault();
      event.stopPropagation();
      openTempArtifactPickerFromElement(slot, buildContext());
    });
    document.addEventListener('click', event => {
      const picker = getTempArtifactPicker(false);
      if (!picker || picker.hidden) return;
      if (picker.contains(event.target) || event.target.closest('[data-fdc-temp-artifact-slot], [data-fdc-temp-artifact-row]')) return;
      closeTempArtifactPicker();
    });
    document.addEventListener('click', event => {
      if (!el.formationPicker || el.formationPicker.hidden) return;
      if (el.formationPicker.contains(event.target) || event.target.closest('#fdc-target-preview, #fdc-floating-target')) return;
      closeFormationPicker();
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (el.formationPicker && !el.formationPicker.hidden) closeFormationPicker();
    });
    document.addEventListener('change', event => {
      const input = event.target.closest('[data-fdc-condition-toggle]');
      if (!input) return;
      view.conditionalEffectEnabled[input.dataset.fdcConditionToggle] = !!input.checked;
      saveCalcSettings();
      render();
    });
    el.perspectiveToggle?.addEventListener('click', () => {
      view.perspective = view.perspective === 'self' ? 'enemy' : 'self';
      saveCalcSettings();
      render();
    });
    el.targetPreview?.addEventListener('click', () => toggleFormationPicker());
    el.floatingTarget?.addEventListener('click', () => toggleFormationPicker(true));
    el.formationPicker?.addEventListener('click', event => event.stopPropagation());
    window.addEventListener('scroll', updateFloatingTargetVisibility, { passive: true });
    window.addEventListener('resize', updateFloatingTargetVisibility, { passive: true });
    el.formationPreset?.addEventListener('change', () => {
      view.formationPresetId = el.formationPreset.value || '';
      view.tempMembers = {};
      view.tempArtifacts = { formation: {}, target: {} };
      view.pendingTempMemberId = '';
      const state = loadStatState();
      const formation = normalizeFormation(getSelectedFormationSource(state).formation);
      view.targetId = getFirstFormationApostleId(formation) || view.targetId;
      syncSelectedApostleToStatManager(view.targetId);
      saveCalcSettings();
      render();
    });
    el.enemyPersonality?.addEventListener('change', () => {
      view.enemyPersonality = el.enemyPersonality.value || '';
      saveCalcSettings();
      render();
    });
    el.damageType?.addEventListener('change', () => {
      view.damageType = el.damageType.value || 'auto';
      view.statDirty = false;
      applyEnemyPreset();
      saveCalcSettings();
      render();
    });
    el.enemyDamageType?.addEventListener('change', () => {
      view.enemyDamageType = el.enemyDamageType.value || 'auto';
      view.statDirty = false;
      applyEnemyPreset();
      saveCalcSettings();
      render();
    });
    el.gradeOverride?.addEventListener('change', () => {
      view.gradeOverride = el.gradeOverride.value || 'saved';
      view.statDirty = false;
      saveCalcSettings();
      render();
    });
    el.statMode?.addEventListener('change', () => {
      view.statMode = el.statMode.value === 'planned' ? 'planned' : 'current';
      view.statDirty = false;
      saveCalcSettings();
      render();
    });
    el.enemyPreset?.addEventListener('change', () => {
      view.enemyPresetKey = el.enemyPreset.value || '';
      view.enemyPhaseIndex = 0;
      view.enemySkillIndex = -1;
      syncEnemyPresetManagement();
      populateEnemyPhases();
      applyEnemyPreset();
      syncDamageTypeUi(buildContext());
      saveCalcSettings();
      renderResult(buildContext());
    });
    el.enemyPresetSave?.addEventListener('click', () => {
      saveCustomEnemyPreset();
      saveCalcSettings();
      render();
    });
    el.enemyPresetDelete?.addEventListener('click', () => {
      deleteCustomEnemyPreset();
      saveCalcSettings();
      render();
    });
    el.enemyPhase?.addEventListener('change', () => {
      view.enemyPhaseIndex = Number(el.enemyPhase.value) || 0;
      applyEnemyPreset();
      syncDamageTypeUi(buildContext());
      saveCalcSettings();
      renderResult(buildContext());
    });
    el.enemySkill?.addEventListener('change', () => {
      view.enemySkillIndex = Number(el.enemySkill.selectedOptions?.[0]?.dataset?.fdcEnemySkillIndex ?? -1);
      renderEnemySkillChoices();
      saveCalcSettings();
      renderResult(buildContext());
    });
    [el.inputs.selfHp, el.inputs.atk, el.inputs.selfDef, el.inputs.crit, el.inputs.critDmg, el.inputs.selfCritResBase, el.inputs.selfCritDmgResBase].forEach(input => {
      input?.addEventListener('input', () => {
        view.statDirty = true;
        renderResult(buildContext());
      });
    });
    Object.values(el.inputs).forEach(input => {
      if (!input || [el.inputs.selfHp, el.inputs.atk, el.inputs.selfDef, el.inputs.crit, el.inputs.critDmg, el.inputs.selfCritResBase, el.inputs.selfCritDmgResBase].includes(input)) return;
      input.addEventListener('input', () => {
        if (input === el.inputs.selfSkill) view.selectedSkillCategory = '';
        if (input === el.inputs.enemySkill) {
          view.enemySkillIndex = -2;
          if (el.enemySkill) el.enemySkill.value = input.value || '';
          renderEnemySkillChoices();
        }
        saveCalcSettings();
        renderResult(buildContext());
      });
    });
  }

  function render() {
    const context = buildContext();
    syncApplyFloatUi();
    syncPerspectiveUi();
    if (el.damageType) el.damageType.value = view.damageType;
    if (el.enemyDamageType) el.enemyDamageType.value = view.enemyDamageType;
    syncDamageTypeUi(context);
    syncWeaknessFields(context.damageType);
    syncEnemyPersonalityUi();
    syncPersonalityTypeAffinity(context);
    if (el.gradeOverride) el.gradeOverride.value = view.gradeOverride;
    if (el.statMode) el.statMode.value = view.statMode;
    populateEnemyPhases();
    renderEnemySkillChoices();
    syncStatsFromTarget(context);
    renderFormationPresetLoader(context);
    renderTarget(context);
    renderSelfSkillChoices(context);
    renderSelfSkillEffects(context);
    renderSynergyCategory(context);
    renderFormationPicker(context);
    renderArtifactCategory(context);
    renderSpellCategory(context);
    renderResult(context);
  }

  function populateEnemyPresets() {
    if (!el.enemyPreset) return;
    const previous = view.enemyPresetKey || el.enemyPreset.value;
    const presets = getEnemyPresets();
    el.enemyPreset.innerHTML = [
      '<option value="">手動入力</option>',
      ...Object.entries(presets).map(([key, preset]) => `<option value="${escapeAttr(key)}">${escapeHtml(preset.name || key)}</option>`)
    ].join('');
    el.enemyPreset.value = presets[previous] ? previous : '';
    view.enemyPresetKey = el.enemyPreset.value;
    syncEnemyPresetManagement();
  }

  function populateEnemyPhases() {
    if (!el.enemyPhase || !el.enemyPhaseField) return;
    const preset = getSelectedEnemyPreset();
    const phases = Array.isArray(preset?.phases) ? preset.phases : [];
    el.enemyPhaseField.hidden = phases.length === 0;
    if (!phases.length) {
      el.enemyPhase.innerHTML = '';
      view.enemyPhaseIndex = 0;
      return;
    }
    const previous = Math.min(view.enemyPhaseIndex, phases.length - 1);
    el.enemyPhase.innerHTML = phases.map((phase, index) => `<option value="${index}">${escapeHtml(phase.name || `Phase ${index + 1}`)}</option>`).join('');
    el.enemyPhase.value = String(previous);
    view.enemyPhaseIndex = previous;
  }

  function populateEnemySkills(preset) {
    if (!el.enemySkill) return;
    const skills = Array.isArray(preset?.skills) ? preset.skills : [];
    el.enemySkill.innerHTML = [
      '<option value="" data-fdc-enemy-skill-index="-1">なし</option>',
      ...skills.map((skill, index) => {
        const name = [skill.action, skill.name, skill.note ? `(${skill.note})` : ''].filter(Boolean).join(' ');
        return `<option value="${escapeAttr(skill.mult || 100)}" data-fdc-enemy-skill-index="${index}">${escapeHtml(name || `Skill ${index + 1}`)} / ${escapeHtml(formatPlainNumber(skill.mult || 100))}%</option>`;
      })
    ].join('');
    renderEnemySkillChoices(preset);
  }

  function applyEnemyPreset() {
    const preset = getSelectedEnemyPreset();
    populateEnemySkills(preset);
    if (!preset) {
      if (el.inputs.enemyWeaknessP) el.inputs.enemyWeaknessP.value = '0';
      syncWeaknessFields();
      return;
    }
    const scaled = scaleEnemyPresetByPhase(preset, view.enemyPhaseIndex);
    const contextTarget = buildContext().target;
    const selfType = resolveSelfDamageType(contextTarget);
    const enemyType = resolveEnemyDamageType(preset);
    const enemyIsMagic = enemyType === 'magic';
    const selfIsMagic = selfType === 'magic';
    el.inputs.enemyHp.value = Math.round(Number(scaled.hp) || 0);
    el.inputs.enemyAtk.value = Math.round(Number(enemyIsMagic ? scaled.atk_m : scaled.atk_p) || 0);
    el.inputs.enemyCrit.value = Math.round(Number(scaled.crit) || 0);
    el.inputs.enemyCritDmg.value = Math.round(Number(scaled.critDmg) || 0);
    el.inputs.def.value = Math.round(Number(selfIsMagic ? scaled.def_m : scaled.def_p) || 1);
    el.inputs.critRes.value = Math.round(Number(scaled.critRes) || 1);
    el.inputs.critDmgRes.value = Math.round(Number(scaled.critDmgRes) || 1);
    if (scaled.special != null) el.inputs.enemySpecial.value = formatPlainNumber(scaled.special);
    const weaknessInfo = getEnemyPresetWeaknessInfo(preset, selfType);
    if (el.inputs.enemyWeaknessP) el.inputs.enemyWeaknessP.value = formatPlainNumber(weaknessInfo.add);
    syncWeaknessFields(selfType);
    syncAttackTypeChip(el.selfAttackTypeChip, selfType);
    syncAttackTypeChip(el.enemyAttackTypeChip, enemyType);
    syncPersonalityTypeAffinity(buildContext());
    const skills = Array.isArray(preset.skills) ? preset.skills : [];
    let skillIndex = Number.isFinite(Number(view.enemySkillIndex)) ? Number(view.enemySkillIndex) : -1;
    if (skillIndex >= skills.length) skillIndex = skills.length ? 0 : -1;
    if (skillIndex >= 0 && skills[skillIndex]?.mult) {
      el.enemySkill.value = String(skills[skillIndex].mult);
      if (el.inputs.enemySkill) el.inputs.enemySkill.value = String(skills[skillIndex].mult);
      view.enemySkillIndex = skillIndex;
    } else {
      if (el.inputs.enemySkill) el.inputs.enemySkill.value = '100';
      view.enemySkillIndex = -1;
    }
    renderEnemySkillChoices(preset);
  }

  function getEnemyPresetWeaknessAdd(preset, damageType = '') {
    return getEnemyPresetWeaknessInfo(preset, damageType).add;
  }

  function getEnemyPresetWeaknessInfo(preset, damageType = '') {
    const key = damageType === 'magic' ? 'mag' : damageType === 'physical' ? 'phys' : '';
    const weakness = key ? preset?.weakness?.[key] : null;
    return {
      key,
      label: key === 'mag' ? '魔法弱点' : key === 'phys' ? '物理弱点' : '弱点',
      add: Number(weakness?.add) || 0,
      hasAny: !!preset?.weakness && Object.keys(preset.weakness).length > 0
    };
  }

  function syncWeaknessFields(damageType = resolveSelfDamageType(buildContext().target)) {
    if (el.selfWeaknessField) {
      el.selfWeaknessField.hidden = true;
      el.selfWeaknessField.classList.remove('is-active', 'is-inactive');
      if (el.inputs.selfWeaknessP) el.inputs.selfWeaknessP.value = '0';
    }
    const weaknessInfo = getEnemyPresetWeaknessInfo(getSelectedEnemyPreset(), damageType);
    if (el.enemyWeaknessLabel) {
      const condition = weaknessInfo.key ? weaknessInfo.label : '弱点';
      el.enemyWeaknessLabel.textContent = weaknessInfo.add
        ? `${condition} 適用`
        : `${condition} 対象外`;
    }
    if (el.enemyWeaknessField) {
      el.enemyWeaknessField.hidden = !weaknessInfo.hasAny;
      el.enemyWeaknessField.classList.toggle('is-active', weaknessInfo.add > 0);
      el.enemyWeaknessField.classList.toggle('is-inactive', weaknessInfo.hasAny && weaknessInfo.add <= 0);
    }
    if (!getSelectedEnemyPreset() && el.inputs.enemyWeaknessP) el.inputs.enemyWeaknessP.value = '0';
    syncBuffDebuffCategoryVisibility(weaknessInfo);
  }

  function syncBuffDebuffCategoryVisibility(enemyWeaknessInfo = getEnemyPresetWeaknessInfo(getSelectedEnemyPreset(), resolveSelfDamageType(buildContext().target))) {
    const selfIsAttacker = view.perspective !== 'enemy';
    const enemyIsAttacker = view.perspective === 'enemy';
    if (el.selfBuffCategory) el.selfBuffCategory.hidden = !selfIsAttacker;
    if (el.enemyBuffCategory) el.enemyBuffCategory.hidden = !enemyIsAttacker && !enemyWeaknessInfo.hasAny;
  }

  function getSelectedEnemyPreset() {
    return getEnemyPresets()[view.enemyPresetKey || el.enemyPreset?.value || ''] || null;
  }

  function getEnemyPresets() {
    return {
      ...(typeof ENEMY_PRESETS === 'undefined' ? {} : ENEMY_PRESETS),
      ...getCustomEnemyPresets()
    };
  }

  function getCustomEnemyPresets() {
    try {
      const raw = localStorage.getItem(CUSTOM_ENEMY_PRESETS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      return Object.fromEntries(Object.entries(parsed)
        .filter(([, preset]) => preset && typeof preset === 'object')
        .map(([key, preset]) => [key.startsWith('custom:') ? key : `custom:${key}`, {
          ...preset,
          name: preset.name?.startsWith('[保存]') ? preset.name : `[保存] ${preset.name || key}`
        }]));
    } catch (error) {
      console.warn('Failed to load custom enemy presets', error);
      return {};
    }
  }

  function saveCustomEnemyPreset() {
    const base = getSelectedEnemyPreset();
    const rawName = (el.enemyPresetName?.value || '').trim();
    const name = rawName || base?.name?.replace(/^\[保存\]\s*/, '') || '敵プリセット';
    const id = `custom:${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const damageType = resolveEnemyDamageType(base);
    const enemyAtk = readNumber(el.inputs.enemyAtk);
    const enemyDef = readNumber(el.inputs.def);
    const preset = {
      name,
      hp: readNumber(el.inputs.enemyHp),
      atk_p: enemyAtk,
      atk_m: enemyAtk,
      def_p: enemyDef,
      def_m: enemyDef,
      dmgType: damageType === 'magic' ? 'mag' : 'phys',
      crit: readNumber(el.inputs.enemyCrit),
      critDmg: readNumber(el.inputs.enemyCritDmg),
      critRes: readNumber(el.inputs.critRes),
      critDmgRes: readNumber(el.inputs.critDmgRes),
      special: readNumber(el.inputs.enemySpecial) || 100,
      weakness: base?.weakness ? JSON.parse(JSON.stringify(base.weakness)) : undefined,
      skills: Array.isArray(base?.skills) ? JSON.parse(JSON.stringify(base.skills)) : []
    };
    try {
      const current = getCustomEnemyPresets();
      const stored = Object.fromEntries(Object.entries(current).map(([key, value]) => [key, { ...value, name: value.name?.replace(/^\[保存\]\s*/, '') || key }]));
      stored[id] = preset;
      localStorage.setItem(CUSTOM_ENEMY_PRESETS_KEY, JSON.stringify(stored));
      view.enemyPresetKey = id;
      if (el.enemyPresetName) el.enemyPresetName.value = '';
      populateEnemyPresets();
      populateEnemyPhases();
      applyEnemyPreset();
      syncEnemyPresetManagement();
    } catch (error) {
      console.warn('Failed to save custom enemy preset', error);
    }
  }

  function deleteCustomEnemyPreset() {
    const key = view.enemyPresetKey || el.enemyPreset?.value || '';
    if (!key.startsWith('custom:')) return;
    const preset = getEnemyPresets()[key];
    const name = preset?.name?.replace(/^\[保存\]\s*/, '') || '保存プリセット';
    if (!window.confirm(`${name} を削除しますか？`)) return;
    try {
      const current = getCustomEnemyPresets();
      const stored = Object.fromEntries(Object.entries(current)
        .filter(([customKey]) => customKey !== key)
        .map(([customKey, value]) => [customKey, { ...value, name: value.name?.replace(/^\[保存\]\s*/, '') || customKey }]));
      localStorage.setItem(CUSTOM_ENEMY_PRESETS_KEY, JSON.stringify(stored));
      view.enemyPresetKey = '';
      view.enemyPhaseIndex = 0;
      view.enemySkillIndex = -1;
      populateEnemyPresets();
      populateEnemyPhases();
      applyEnemyPreset();
      syncEnemyPresetManagement();
    } catch (error) {
      console.warn('Failed to delete custom enemy preset', error);
    }
  }

  function syncEnemyPresetManagement() {
    const key = view.enemyPresetKey || el.enemyPreset?.value || '';
    if (el.enemyPresetDelete) el.enemyPresetDelete.disabled = !key.startsWith('custom:');
  }

  function renderEnemySkillChoices(preset = getSelectedEnemyPreset()) {
    if (!el.enemySkillChoices) return;
    if (view.perspective !== 'enemy') {
      el.enemySkillChoices.hidden = true;
      el.enemySkillChoices.innerHTML = '';
      return;
    }
    el.enemySkillChoices.hidden = false;
    const skills = Array.isArray(preset?.skills) ? preset.skills : [];
    const currentIndex = Number.isFinite(view.enemySkillIndex) ? view.enemySkillIndex : -1;
    const rows = [
      {
        index: -1,
        value: '',
        action: 'なし',
        name: '通常入力',
        note: 'スキル倍率を使わない'
      },
      ...skills.map((skill, index) => ({
        index,
        value: skill.mult || 100,
        action: skill.action || skill.name || `Skill ${index + 1}`,
        name: skill.name || '',
        note: skill.note || ''
      }))
    ];
    el.enemySkillChoices.innerHTML = `
      <div class="fdc-skill-choice-header fdc-enemy-skill-choice-header">
        <span>行動</span>
        <span>倍率</span>
        <span>補足</span>
      </div>
      ${rows.map(row => `
        <button type="button" class="fdc-skill-choice fdc-enemy-skill-choice ${row.index === currentIndex ? 'is-active' : ''}" data-fdc-enemy-skill-index="${row.index}" data-fdc-enemy-skill-value="${escapeAttr(row.value)}">
          <span class="fdc-skill-choice-action ${row.index < 0 ? 'tone-basic' : 'tone-extra'}">${escapeHtml(row.action)}</span>
          <span class="fdc-skill-choice-mult">${row.value === '' ? '-' : `${escapeHtml(formatPlainNumber(row.value))}%`}</span>
          <span class="fdc-skill-choice-kind">${escapeHtml([row.name, row.note].filter(Boolean).join(' / ') || '-')}</span>
        </button>
      `).join('')}
    `;
    el.enemySkillChoices.querySelectorAll('[data-fdc-enemy-skill-index]').forEach(button => {
      button.addEventListener('click', () => {
        view.enemySkillIndex = Number(button.dataset.fdcEnemySkillIndex);
        const value = button.dataset.fdcEnemySkillValue || '';
        if (el.enemySkill) {
          el.enemySkill.value = value;
          Array.from(el.enemySkill.options || []).forEach(option => {
            option.selected = Number(option.dataset.fdcEnemySkillIndex) === view.enemySkillIndex;
          });
        }
        if (el.inputs.enemySkill) el.inputs.enemySkill.value = value || '100';
        el.enemySkillChoices.querySelectorAll('.fdc-enemy-skill-choice').forEach(row => row.classList.remove('is-active'));
        button.classList.add('is-active');
        saveCalcSettings();
        renderResult(buildContext());
      });
    });
  }

  function scaleEnemyPresetByPhase(preset, phaseIndex) {
    const phase = Array.isArray(preset?.phases) ? preset.phases[phaseIndex] : null;
    if (!phase?.mult) return { ...preset };
    const scaled = { ...preset };
    const keys = Array.isArray(phase.scaleStats) ? phase.scaleStats : [];
    keys.forEach(key => {
      if (scaled[key] != null) scaled[key] = Number(scaled[key]) * Number(phase.mult);
    });
    return scaled;
  }

  function buildContext() {
    const state = loadStatState();
    const formationSource = getSelectedFormationSource(state);
    const formation = applyTempArtifactOverrides(applyTempMemberOverrides(normalizeFormation(formationSource.formation)));
    const members = getFormationMembers(formation, state);
    const allMembers = getAllApostleMembers(state);
    if (formationSource.preset && !members.some(member => member.id === view.targetId)) {
      view.targetId = members[0]?.id || view.targetId;
    }
    if (!view.targetId || !allMembers.some(member => member.id === view.targetId)) view.targetId = members[0]?.id || allMembers[0]?.id || '';
    const target = getCurrentTargetMember(members, allMembers);
    const damageType = resolveActiveDamageType(target);
    const cards = state.cards && typeof state.cards === 'object' ? state.cards : {};
    const actionCategory = view.selectedSkillCategory || '';
    const effects = collectEffects({ target, formation, cards, damageType, state, actionCategory });
    applyEnabledSelfSkillEffects(effects, { target, formation, cards, damageType, state, actionCategory, members, allMembers });
    const summary = summarizeEffects(getEnabledEffectRows(effects));
    return { state, formation, formationPreset: formationSource.preset, members, allMembers, target, damageType, actionCategory, effects, summary };
  }

  function getCurrentTargetMember(members, allMembers) {
    const tempSlot = Object.entries(view.tempMembers || {}).find(([, id]) => id === view.targetId);
    if (tempSlot) {
      const [rowIndex, lineIndex] = tempSlot[0].split(':').map(Number);
      const tempMember = members.find(member =>
        member.id === view.targetId
        && member.position === POSITIONS[rowIndex]
        && member.line === lineIndex + 1
      );
      if (tempMember) return tempMember;
    }
    return members.find(member => member.id === view.targetId) || allMembers.find(member => member.id === view.targetId) || null;
  }

  function getSelectedFormationSource(state = {}) {
    const presets = getSavedFormationPresets(state);
    const preset = presets.find(item => item.id === view.formationPresetId);
    if (view.formationPresetId && !preset) view.formationPresetId = '';
    return {
      preset: preset || null,
      formation: preset?.formation || state.formation || {}
    };
  }

  function getSavedFormationPresets(state = {}) {
    return Array.isArray(state.savedFormations)
      ? state.savedFormations
        .filter(item => item && item.id && item.formation && typeof item.formation === 'object')
        .map(item => ({
          ...item,
          name: item.name || '無題の編成',
          tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
          favoriteSlot: Number(item.favoriteSlot) || 0
        }))
      : [];
  }

  function getFirstFormationApostleId(formation = {}) {
    return (formation.rows || [])
      .flatMap(row => row.apostles || [])
      .find(Boolean) || '';
  }

  function applyTempArtifactOverrides(formation) {
    const next = normalizeFormation(formation);
    Object.entries(view.tempArtifacts.formation || {}).forEach(([key, id]) => {
      const [rowIndex, lineIndex, slotIndex] = key.split(':').map(Number);
      const row = next.rows[rowIndex];
      if (!row || !Array.isArray(row.artifacts?.[lineIndex])) return;
      row.artifacts[lineIndex][slotIndex] = id || '';
    });
    return next;
  }

  function applyTempMemberOverrides(formation) {
    const next = normalizeFormation(formation);
    Object.entries(view.tempMembers || {}).forEach(([key, id]) => {
      const [rowIndex, lineIndex] = key.split(':').map(Number);
      const row = next.rows[rowIndex];
      if (!row || lineIndex < 0 || lineIndex >= 3) return;
      const memberId = id || '';
      if (memberId) {
        next.rows.forEach(otherRow => {
          otherRow.apostles = otherRow.apostles.map(existingId => existingId === memberId ? '' : existingId);
        });
      }
      row.apostles[lineIndex] = memberId;
    });
    return next;
  }

  function restoreCalcSettings() {
    try {
      const raw = localStorage.getItem(CALC_SETTINGS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object') return;
      if (typeof saved.targetId === 'string') view.targetId = saved.targetId;
      if (typeof saved.formationPresetId === 'string') view.formationPresetId = saved.formationPresetId;
      if (['auto', 'physical', 'magic'].includes(saved.damageType)) view.damageType = saved.damageType;
      if (['auto', 'physical', 'magic'].includes(saved.enemyDamageType)) view.enemyDamageType = saved.enemyDamageType;
      if (['saved', '1', '2', '3', '4', '5', '6'].includes(String(saved.gradeOverride))) view.gradeOverride = String(saved.gradeOverride);
      if (['current', 'planned'].includes(saved.statMode)) view.statMode = saved.statMode;
      if (['self', 'enemy'].includes(saved.perspective)) view.perspective = saved.perspective;
      if (typeof saved.enemyPersonality === 'string') view.enemyPersonality = saved.enemyPersonality;
      if (typeof saved.enemyPresetKey === 'string') view.enemyPresetKey = saved.enemyPresetKey;
      if (Number.isFinite(Number(saved.enemyPhaseIndex))) view.enemyPhaseIndex = Math.max(0, Number(saved.enemyPhaseIndex));
      if (Number.isFinite(Number(saved.enemySkillIndex))) view.enemySkillIndex = Number(saved.enemySkillIndex);
      if (typeof saved.selectedSkillCategory === 'string') view.selectedSkillCategory = saved.selectedSkillCategory;
      if (saved.effectSources && typeof saved.effectSources === 'object') {
        view.effectSources = { ...view.effectSources, ...pickBooleanMap(saved.effectSources, Object.keys(view.effectSources)) };
      }
      if (saved.selfSkillEffectEnabled && typeof saved.selfSkillEffectEnabled === 'object') {
        view.selfSkillEffectEnabled = pickBooleanMap(saved.selfSkillEffectEnabled);
      }
      if (saved.conditionalEffectEnabled && typeof saved.conditionalEffectEnabled === 'object') {
        view.conditionalEffectEnabled = pickBooleanMap(saved.conditionalEffectEnabled);
      }
      if (saved.skillLevelOverrides && typeof saved.skillLevelOverrides === 'object') {
        view.skillLevelOverrides = sanitizeSkillLevelOverrides(saved.skillLevelOverrides);
      }
    } catch (error) {
      console.warn('Failed to restore formation damage settings', error);
    }
  }

  function saveCalcSettings() {
    try {
      localStorage.setItem(CALC_SETTINGS_KEY, JSON.stringify({
        targetId: view.targetId || '',
        formationPresetId: view.formationPresetId || '',
        damageType: view.damageType || 'auto',
        enemyDamageType: view.enemyDamageType || 'auto',
        gradeOverride: view.gradeOverride || 'saved',
        statMode: view.statMode === 'planned' ? 'planned' : 'current',
        perspective: view.perspective === 'enemy' ? 'enemy' : 'self',
        enemyPersonality: view.enemyPersonality || '',
        enemyPresetKey: view.enemyPresetKey || '',
        enemyPhaseIndex: Number(view.enemyPhaseIndex) || 0,
        enemySkillIndex: Number.isFinite(Number(view.enemySkillIndex)) ? Number(view.enemySkillIndex) : -1,
        selectedSkillCategory: view.selectedSkillCategory || '',
        effectSources: pickBooleanMap(view.effectSources),
        selfSkillEffectEnabled: pickBooleanMap(view.selfSkillEffectEnabled),
        conditionalEffectEnabled: pickBooleanMap(view.conditionalEffectEnabled),
        skillLevelOverrides: sanitizeSkillLevelOverrides(view.skillLevelOverrides)
      }));
    } catch (error) {
      console.warn('Failed to save formation damage settings', error);
    }
  }

  function pickBooleanMap(source = {}, allowedKeys = null) {
    const result = {};
    Object.entries(source || {}).forEach(([key, value]) => {
      if (allowedKeys && !allowedKeys.includes(key)) return;
      result[key] = !!value;
    });
    return result;
  }

  function sanitizeSkillLevelOverrides(source = {}) {
    const result = {};
    Object.entries(source || {}).forEach(([id, levels]) => {
      if (!id || !levels || typeof levels !== 'object') return;
      result[id] = {};
      Object.entries(levels).forEach(([key, value]) => {
        const numeric = Number(value);
        if (Number.isFinite(numeric)) result[id][key] = numeric;
      });
      if (!Object.keys(result[id]).length) delete result[id];
    });
    return result;
  }

  function loadStatState() {
    try {
      const raw = localStorage.getItem(STAT_STORAGE_KEY);
      return raw ? { ...JSON.parse(raw), found: true } : { found: false };
    } catch {
      return { found: false };
    }
  }

  function syncSelectedApostleToStatManager(id) {
    if (!id) return;
    try {
      const raw = localStorage.getItem(STAT_STORAGE_KEY);
      const state = raw ? JSON.parse(raw) : {};
      if (!state || typeof state !== 'object') return;
      if (state.activeId === id) return;
      state.activeId = id;
      localStorage.setItem(STAT_STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent('trickcal-stat-active-apostle-sync', { detail: { id } }));
    } catch (error) {
      console.warn('Failed to sync selected apostle to stat manager', error);
    }
  }

  function normalizeFormation(formation = {}) {
    return {
      rows: Array.from({ length: 3 }, (_, rowIndex) => normalizeFormationRow(formation.rows?.[rowIndex])),
      spells: Array.isArray(formation.spells) ? formation.spells.filter(Boolean) : []
    };
  }

  function normalizeFormationRow(row = {}) {
    return {
      apostles: Array.from({ length: 3 }, (_, index) => row.apostles?.[index] || ''),
      artifacts: Array.from({ length: 3 }, (_, lineIndex) => {
        const line = row.artifacts?.[lineIndex];
        if (Array.isArray(line)) return Array.from({ length: 3 }, (_, index) => line[index] || '');
        return [line || '', '', ''];
      })
    };
  }

  function getFormationMembers(formation, state = {}) {
    return formation.rows.flatMap((row, rowIndex) =>
      row.apostles.map((id, lineIndex) => createMember(id, rowIndex, lineIndex, state, row.artifacts[lineIndex])).filter(Boolean)
    );
  }

  function getAllApostleMembers(state = {}) {
    const data = typeof TRICKCAL_STAT_DATA === 'undefined' ? null : TRICKCAL_STAT_DATA;
    return (data?.sheets?.basicInfo || []).map(row => createMember(row.id, getPreferredPositionIndex(row), null, state, [])).filter(Boolean);
  }

  function getPreferredPositionIndex(source = {}) {
    const position = source.position || source.配置列 || source.配列 || '';
    const index = POSITIONS.indexOf(position);
    return index >= 0 ? index : 1;
  }

  function createMember(id, rowIndex, lineIndex, state = {}, artifactIds = []) {
    const basic = getApostle(id);
    if (!id || !basic) return null;
    const apostleState = state.apostles?.[id] || {};
    const hasPlannedSnapshot = !!apostleState.statSnapshots?.planned;
    return {
      id,
      name: basic.使徒名 || id,
      position: POSITIONS[rowIndex],
      line: lineIndex == null ? null : lineIndex + 1,
      personality: basic.性格 || '',
      race: basic.種族 || '',
      role: basic.役割 || '',
      attackType: basic.攻撃タイプ || basic.攻撃Type || '',
      level: Number(apostleState.level) || 1,
      star: Number(apostleState.star) || Number(basic.レア度) || 1,
      grade: getDisplayGrade(apostleState),
      gradeOverride: view.gradeOverride,
      statMode: view.statMode,
      hasPlannedSnapshot,
      rank: Number(apostleState.rank) || 1,
      stats: readMemberStats(apostleState, basic, view.gradeOverride, view.statMode),
      artifactIds: getEffectiveMemberArtifactIds(id, artifactIds),
      skillLevels: apostleState.skillLevels || apostleState.skills || {},
      asideRank: Number(apostleState.asideRank) || 0,
      asideLevel: Number(apostleState.asideLevel) || 0
    };
  }

  function getEffectiveMemberArtifactIds(id, artifactIds = []) {
    const base = Array.from({ length: 3 }, (_, index) => artifactIds?.[index] || '');
    const overrides = view.tempArtifacts.target?.[id] || {};
    Object.entries(overrides).forEach(([slot, artifactId]) => {
      const index = Number(slot);
      if (index >= 0 && index < 3) base[index] = artifactId || '';
    });
    return base;
  }

  function syncStatsFromTarget(context) {
    if (view.statDirty || !context.target) return;
    const stats = context.target.stats || {};
    const atk = context.damageType === 'magic' ? stats.magicAtk : stats.physicalAtk;
    const def = context.damageType === 'magic' ? stats.magicDef : stats.physicalDef;
    el.inputs.selfHp.value = Math.round(Number(stats.hp) || 0);
    el.inputs.atk.value = Math.round(Number(atk) || 0);
    el.inputs.selfDef.value = Math.round(Number(def) || 1);
    el.inputs.crit.value = Math.round(Number(stats.crit) || 0);
    el.inputs.critDmg.value = Math.round(Number(stats.critDmg) || 0);
    el.inputs.selfCritResBase.value = Math.round(Number(stats.critRes) || 1);
    el.inputs.selfCritDmgResBase.value = Math.round(Number(stats.critDmgRes) || 1);
  }

  function renderFormationPresetLoader(context) {
    if (!el.formationPreset) return;
    const presets = getSavedFormationPresets(context.state);
    const currentLabel = context.state?.activeFormationPresetId
      ? '編集中の編成（保存編成を読込中）'
      : '編集中の編成';
    const options = [
      `<option value="">${escapeHtml(currentLabel)}</option>`,
      ...presets
        .slice()
        .sort((a, b) => {
          const favoriteDiff = (a.favoriteSlot || 99) - (b.favoriteSlot || 99);
          if (favoriteDiff !== 0) return favoriteDiff;
          return String(a.name || '').localeCompare(String(b.name || ''), 'ja');
        })
        .map(preset => {
          const prefix = preset.favoriteSlot ? `${preset.favoriteSlot}. ` : '';
          const tags = preset.tags?.length ? ` / ${preset.tags.join('・')}` : '';
          const memberCount = countFormationMembers(preset.formation);
          return `<option value="${escapeAttr(preset.id)}">${escapeHtml(`${prefix}${preset.name} (${memberCount}人)${tags}`)}</option>`;
        })
    ].join('');
    if (el.formationPreset.innerHTML !== options) {
      el.formationPreset.innerHTML = options;
    }
    el.formationPreset.value = presets.some(preset => preset.id === view.formationPresetId) ? view.formationPresetId : '';
  }

  function countFormationMembers(formation = {}) {
    return normalizeFormation(formation).rows
      .flatMap(row => row.apostles || [])
      .filter(Boolean).length;
  }

  function renderTarget(context) {
    const target = context.target;
    if (!target) {
      el.targetPreview.className = 'fdc-target-preview';
      el.targetPreview.innerHTML = '<span class="fdc-target-empty">編成から使徒を選択</span>';
      renderFloatingTarget(null, context);
      return;
    }
    el.targetPreview.className = `fdc-target-preview is-filled personality-${target.personality || ''}`;
    el.targetPreview.title = `${target.name} / ${[target.position, normalizeRole(target.role), formatDamageType(context.damageType), formatStatModeLabel(target), formatGradeLabel(target)].filter(Boolean).join(' / ')}`;
    el.targetPreview.setAttribute('aria-expanded', String(!el.formationPicker?.hidden));
    el.targetPreview.innerHTML = `
      <span class="fdc-target-portrait">
        <img src="${escapeAttr(getApostleImage(target.id, target.name))}" alt="" data-fallback>
        ${renderApostleBadges(target)}
        <span class="fdc-target-grade-icons" title="${escapeAttr(formatGradeLabel(target))}">${renderGradeIcons(target.grade)}</span>
      </span>
    `;
    renderFloatingTarget(target, context);
    updateFloatingTargetVisibility();
  }

  function renderFloatingTarget(target, context) {
    if (!el.floatingTarget) return;
    if (!target) {
      el.floatingTarget.className = 'fdc-floating-target';
      el.floatingTarget.innerHTML = '<span>使徒</span>';
      el.floatingTarget.title = '使徒を選択';
      updateFloatingTargetVisibility();
      return;
    }
    el.floatingTarget.className = `fdc-floating-target is-filled personality-${target.personality || ''}`;
    el.floatingTarget.title = `${target.name} / クリックで使徒選択`;
    el.floatingTarget.innerHTML = `
      <span class="fdc-floating-target-portrait">
        <img src="${escapeAttr(getApostleImage(target.id, target.name))}" alt="" data-fallback>
        ${renderApostleBadges(target)}
      </span>
      <span class="fdc-floating-target-name">${escapeHtml(target.name || '-')}</span>
    `;
  }

  function updateFloatingTargetVisibility() {
    if (!el.floatingTarget) return;
    const previewBottom = el.targetPreview?.getBoundingClientRect?.().bottom ?? 0;
    const shouldShow = !!view.targetId && window.scrollY > 180 && previewBottom < 18;
    el.floatingTarget.hidden = !shouldShow;
    el.floatingTarget.classList.toggle('is-visible', shouldShow);
  }

  function renderGradeIcons(grade) {
    const safeGrade = Math.max(1, Math.min(6, Number(grade) || 1));
    const icon = safeGrade >= 6 ? '学年_2.webp' : '学年_1.webp';
    return Array.from({ length: safeGrade }, () => `<img src="img/${escapeAttr(icon)}" alt="">`).join('');
  }

  function renderFormationPicker(context) {
    if (!el.formationPicker) return;
    const pendingMember = getPendingTempMember(context);
    const body = view.pickerMode === 'all' && !pendingMember
      ? renderAllApostlePicker(context)
      : Array.from({ length: 3 }, (_, lineIndex) => `
        <div class="fdc-picker-row" data-line="${lineIndex}">
          ${POSITIONS.map((position, rowIndex) => {
            const member = context.members.find(item => item.line === lineIndex + 1 && item.position === position);
            return renderFormationPickerSlot(member, rowIndex, lineIndex, pendingMember, context.state?.cards);
          }).join('')}
        </div>
      `).join('');
    el.formationPicker.innerHTML = `
      <div class="fdc-picker-head">
        <div class="fdc-picker-tabs">
          <button type="button" class="${view.pickerMode === 'formation' ? 'is-active' : ''}" data-fdc-picker-mode="formation">編成</button>
          <button type="button" class="${view.pickerMode === 'all' ? 'is-active' : ''}" data-fdc-picker-mode="all">一覧</button>
        </div>
        <button type="button" class="fdc-picker-close" data-fdc-picker-close aria-label="使徒選択を閉じる">×</button>
      </div>
      ${pendingMember ? renderPendingTempMemberNotice(pendingMember) : ''}
      <div class="fdc-picker-body ${view.pickerMode === 'all' ? 'is-all' : 'is-formation'}">${body}</div>
    `;
    el.formationPicker.querySelector('[data-fdc-picker-close]')?.addEventListener('click', closeFormationPicker);
    el.formationPicker.querySelectorAll('[data-fdc-picker-mode]').forEach(button => {
      button.addEventListener('click', () => {
        view.pendingTempMemberId = '';
        view.pickerMode = button.dataset.fdcPickerMode || 'formation';
        renderFormationPicker(buildContext());
      });
    });
    el.formationPicker.querySelector('[data-fdc-picker-search]')?.addEventListener('input', event => {
      const value = event.currentTarget.value || '';
      view.pickerSearch = value;
      renderFormationPicker(buildContext());
      const nextInput = el.formationPicker.querySelector('[data-fdc-picker-search]');
      nextInput?.focus();
      nextInput?.setSelectionRange?.(value.length, value.length);
    });
    el.formationPicker.querySelector('[data-fdc-picker-sort]')?.addEventListener('change', event => {
      view.pickerSort = event.currentTarget.value || 'name';
      renderFormationPicker(buildContext());
    });
    el.formationPicker.querySelectorAll('[data-fdc-picker-filter]').forEach(select => {
      select.addEventListener('change', event => {
        const key = event.currentTarget.dataset.fdcPickerFilter || '';
        if (key && Object.prototype.hasOwnProperty.call(view.pickerFilters, key)) {
          view.pickerFilters[key] = event.currentTarget.value || '';
        }
        renderFormationPicker(buildContext());
      });
    });
    el.formationPicker.querySelector('[data-fdc-temp-member-cancel]')?.addEventListener('click', () => {
      view.pendingTempMemberId = '';
      view.pickerMode = 'all';
      renderFormationPicker(buildContext());
    });
    el.formationPicker.querySelectorAll('[data-fdc-temp-member-slot]').forEach(button => {
      button.addEventListener('click', event => {
        if (!view.pendingTempMemberId) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        applyPendingTempMemberToSlot(button.dataset.fdcTempMemberSlot || '', buildContext());
        view.statDirty = false;
        el.formationPicker.hidden = true;
        el.formationPicker.classList.remove('is-floating-picker');
        render();
      });
    });
    el.formationPicker.querySelectorAll('[data-fdc-member-id]').forEach(button => {
      button.addEventListener('click', () => {
        if (view.pendingTempMemberId) return;
        const result = selectMemberFromPicker(button.dataset.fdcMemberId || '', context);
        view.statDirty = false;
        if (result === 'placement') {
          renderFormationPicker(buildContext());
          return;
        }
        el.formationPicker.hidden = true;
        el.formationPicker.classList.remove('is-floating-picker');
        render();
      });
    });
  }

  function selectMemberFromPicker(id, context) {
    if (!id) return '';
    const existingMember = context.members.find(member => member.id === id);
    if (existingMember || view.pickerMode !== 'all') {
      view.targetId = id;
      syncSelectedApostleToStatManager(id);
      applyEnemyPreset();
      saveCalcSettings();
      return 'selected';
    }
    const candidate = context.allMembers.find(member => member.id === id);
    if (!candidate) {
      view.targetId = id;
      syncSelectedApostleToStatManager(id);
      applyEnemyPreset();
      saveCalcSettings();
      return 'selected';
    }
    view.pendingTempMemberId = id;
    view.pickerMode = 'formation';
    return 'placement';
  }

  function getPendingTempMember(context) {
    return view.pendingTempMemberId
      ? context.allMembers.find(member => member.id === view.pendingTempMemberId) || null
      : null;
  }

  function renderPendingTempMemberNotice(member) {
    return `
      <div class="fdc-picker-placement">
        <span><strong>${escapeHtml(member.name)}</strong> の配置先を選択</span>
        <small>${escapeHtml(member.position || '')}のみ</small>
        <button type="button" data-fdc-temp-member-cancel>キャンセル</button>
      </div>
    `;
  }

  function applyPendingTempMemberToSlot(slotKey, context) {
    const member = getPendingTempMember(context);
    if (!member || !slotKey) return;
    const [rowIndex, lineIndex] = slotKey.split(':').map(Number);
    if (rowIndex !== getPreferredPositionIndex(member)) return;
    view.tempMembers[`${rowIndex}:${lineIndex}`] = member.id;
    view.targetId = member.id;
    view.pendingTempMemberId = '';
    syncSelectedApostleToStatManager(member.id);
    applyEnemyPreset();
    saveCalcSettings();
  }

  function renderSelfSkillChoices(context) {
    if (!el.selfSkillChoices) return;
    if (view.perspective === 'enemy') {
      el.selfSkillChoices.hidden = true;
      el.selfSkillChoices.innerHTML = '';
      return;
    }
    el.selfSkillChoices.hidden = false;
    const target = context.target;
    if (!target) {
      el.selfSkillChoices.innerHTML = '<div class="fdc-skill-choice-empty">使徒を選択するとスキル候補を表示します</div>';
      return;
    }
    const levelConfig = getFdcEffectiveSkillLevels(target);
    const options = buildFdcApostleSkillOptions(target, context);
    if (!options.length) {
      el.selfSkillChoices.innerHTML = `
        ${renderFdcSkillLevelControls(target, levelConfig)}
        <div class="fdc-skill-choice-empty">表示できる攻撃倍率がありません</div>
      `;
      bindFdcSkillLevelControls(target);
      return;
    }
    const current = readNumber(el.inputs.selfSkill);
    el.selfSkillChoices.innerHTML = `
      ${renderFdcSkillLevelControls(target, levelConfig)}
      <div class="fdc-skill-choice-header">
        <span>行動</span>
        <span>倍率</span>
        <span>値の種類</span>
        <span></span>
      </div>
      ${options.map(option => `
        <button type="button" class="fdc-skill-choice ${Math.abs(Number(option.value) - current) < 0.001 && view.selectedSkillCategory === option.category ? 'is-active' : ''}" data-fdc-skill-value="${escapeAttr(option.value)}" data-fdc-skill-category="${escapeAttr(option.category)}">
          <span class="fdc-skill-choice-action ${escapeAttr(getFdcApostleSkillTone(option.category))}">${escapeHtml(getFdcApostleSkillActionLabel(option.category))}</span>
          <span class="fdc-skill-choice-mult">${escapeHtml(formatPlainNumber(option.value))}%</span>
          <span class="fdc-skill-choice-kind" title="${escapeAttr(option.detailText || '')}">${escapeHtml([option.kind, option.shortDetail].filter(Boolean).join(' / '))}</span>
          <span class="fdc-skill-choice-info" data-fdc-skill-info="${escapeAttr(option.key)}" title="詳細">i</span>
        </button>
      `).join('')}
    `;
    const optionsByKey = new Map(options.map(option => [option.key, option]));
    el.selfSkillChoices.querySelectorAll('[data-fdc-skill-value]').forEach(button => {
      button.addEventListener('click', event => {
        if (event.target.closest('.fdc-skill-choice-info')) return;
        el.inputs.selfSkill.value = button.dataset.fdcSkillValue || '100';
        view.selectedSkillCategory = button.dataset.fdcSkillCategory || '';
        el.selfSkillChoices.querySelectorAll('.fdc-skill-choice').forEach(row => row.classList.remove('is-active'));
        button.classList.add('is-active');
        saveCalcSettings();
        const context = buildContext();
        renderResult(context);
        renderArtifactCategory(context);
        renderSynergyCategory(context);
        renderSpellCategory(context);
      });
    });
    el.selfSkillChoices.querySelectorAll('[data-fdc-skill-info]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const option = optionsByKey.get(button.dataset.fdcSkillInfo || '');
        if (option) showFdcSkillPopover(button, option);
      });
    });
    bindFdcSkillLevelControls(target);
  }

  function showFdcSkillPopover(anchor, option) {
    const lines = [
      option.skillName ? `スキル名: ${option.skillName}` : '',
      option.label ? `候補: ${option.label}` : '',
      option.sourceLabel && option.sourceLabel !== '通常' ? `由来: ${option.sourceLabel}` : '',
      option.detailText || ''
    ].filter(Boolean);
    showFdcInfoPopover(anchor, option.category || 'スキル詳細', lines);
  }

  function showFdcArtifactPopover(anchor) {
    const id = anchor.dataset.fdcArtifactDetail || '';
    const card = getCard(id);
    if (!card) return;
    const star = Number(anchor.dataset.fdcArtifactStar) || 1;
    const solder = Number(anchor.dataset.fdcArtifactSolder) || 0;
    const lines = [
      card.rarity ? `レア度: ${card.rarity}` : '',
      `コスト: ${getCardCostById(id, star)} / ★${star}${solder ? ` / はんだ+${solder}` : ''}`,
      formatArtifactBonusLine('基礎補正', card.bonusesByStar?.[star - 1]),
      solder ? formatArtifactBonusLine(`はんだ+${solder}`, card.solderBonuses?.[solder]) : '',
      ...(card.conditionalEffects || []).map(effect => formatArtifactEffectDetail(effect, star))
    ].filter(Boolean);
    showFdcInfoPopover(anchor, card.name || '遺物詳細', lines);
  }

  function formatArtifactEffectDetail(effect, star = 1) {
    const title = effect.label || effect.shortLabel || '特殊効果';
    const detailText = getDisplayEffectDescription(effect, star);
    const judgeText = getEffectText(effect);
    const bonusText = formatBonusMap(normalizeCardEffectBonuses(effect.bonusesByStar?.[star - 1], 'unknown', judgeText));
    return [title, bonusText, detailText].filter(Boolean).join('\n');
  }

  function getDisplayEffectDescription(effect, star = 1) {
    if (Array.isArray(effect.descriptionByStar) && effect.descriptionByStar.length) {
      const index = clamp(Math.max(1, Number(star) || 1), 1, effect.descriptionByStar.length) - 1;
      return effect.descriptionByStar[index] || '';
    }
    return effect.description || effect.effectDescription || '';
  }

  function formatArtifactBonusLine(label, bonuses) {
    const text = formatBonusMap(normalizeCardBonusMap(bonuses, 'unknown'));
    return text ? `${label}: ${text}` : '';
  }

  function showFdcInfoPopover(anchor, titleText, lines) {
    el.skillPopover = el.skillPopover || document.getElementById('fdc-skill-popover');
    if (!el.skillPopover) return;
    const title = el.skillPopover.querySelector('.fdc-skill-popover-title');
    const body = el.skillPopover.querySelector('.fdc-skill-popover-body');
    if (title) title.textContent = titleText;
    if (body) body.innerHTML = lines.map(line => `<p>${escapeHtml(line).replace(/\n/g, '<br>')}</p>`).join('');
    const rect = anchor.getBoundingClientRect();
    el.skillPopover.hidden = false;
    const width = Math.min(320, window.innerWidth - 24);
    el.skillPopover.style.width = `${width}px`;
    el.skillPopover.style.left = `${Math.min(window.innerWidth - width - 12, Math.max(12, rect.right - width))}px`;
    el.skillPopover.style.top = `${Math.min(window.innerHeight - 80, rect.bottom + 8)}px`;
  }

  function hideFdcSkillPopover() {
    el.skillPopover = el.skillPopover || document.getElementById('fdc-skill-popover');
    if (el.skillPopover) el.skillPopover.hidden = true;
  }

  function bindFdcSkillLevelControls(target) {
    el.selfSkillChoices?.querySelectorAll('[data-fdc-skill-level]').forEach(control => {
      control.addEventListener('change', () => {
        const id = target.id;
        view.skillLevelOverrides[id] = {
          ...getFdcEffectiveSkillLevels(target),
          [control.dataset.fdcSkillLevel]: Number(control.value) || 0
        };
        saveCalcSettings();
        renderSelfSkillChoices(buildContext());
      });
    });
  }

  function renderSelfSkillEffects(context) {
    if (!el.selfSkillEffects) return;
    const target = context.target;
    if (!target) {
      el.selfSkillEffects.innerHTML = '';
      return;
    }
    const options = buildSelfSkillEffectOptions(target, context)
      .filter(option => isBonusMapRelevantToPerspective(option.bonuses));
    const selfOptions = options.filter(option => option.group !== 'formation');
    const formationOptions = options.filter(option => option.group === 'formation');
    if (!options.length) {
      el.selfSkillEffects.innerHTML = `
        <div class="fdc-skill-effects-title">本人スキル効果</div>
        <div class="fdc-skill-effect-empty">計算に反映できる本人スキル効果はありません</div>
      `;
      return;
    }
    el.selfSkillEffects.innerHTML = `
      ${renderSkillEffectSection('本人スキル効果', selfOptions, '計算に反映できる本人スキル効果はありません')}
      ${renderSkillEffectSection('編成スキル効果', formationOptions, '影響する編成スキル効果はありません')}
    `;
    el.selfSkillEffects.querySelectorAll('[data-fdc-self-skill-effect]').forEach(input => {
      input.addEventListener('change', () => {
        view.selfSkillEffectEnabled[input.dataset.fdcSelfSkillEffect] = !!input.checked;
        saveCalcSettings();
        renderResult(buildContext());
      });
    });
    el.selfSkillEffects.querySelectorAll('[data-fdc-skill-effect-info]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const option = collectRenderedSkillEffectOptions(buildContext()).find(item => item.key === button.dataset.fdcSkillEffectInfo);
        if (option) showSkillEffectPopover(button, option);
      });
    });
  }

  function renderSkillEffectSection(title, options, emptyText) {
    return `
      <section class="fdc-skill-effect-card">
        <div class="fdc-skill-effects-title">${escapeHtml(title)}</div>
        ${options.length ? `
          <div class="fdc-skill-effect-list">
            ${options.map(option => renderSkillEffectToggle(option)).join('')}
          </div>
        ` : `<div class="fdc-skill-effect-empty">${escapeHtml(emptyText)}</div>`}
      </section>
    `;
  }

  function renderSkillEffectToggle(option) {
    const checked = isSelfSkillEffectOptionEnabled(option) ? ' checked' : '';
    const summary = formatBonusMap(option.bonuses) || getSkillEffectConditionSummary(option) || '詳細あり';
    return `
      <label class="fdc-skill-effect-toggle">
        <input type="checkbox" data-fdc-self-skill-effect="${escapeAttr(option.key)}"${checked}>
        <span class="fdc-skill-effect-source ${escapeAttr(getFdcApostleSkillTone(option.category))}">${escapeHtml(getFdcApostleSkillActionLabel(option.category))}</span>
        <button type="button" class="fdc-skill-effect-info" data-fdc-skill-effect-info="${escapeAttr(option.key)}" aria-label="${escapeAttr(`${option.label}の条件詳細`)}">i</button>
        <span class="fdc-skill-effect-text">
          <strong>${escapeHtml(option.label)}</strong>
          <small>${escapeHtml(summary)}</small>
        </span>
      </label>
    `;
  }

  function collectRenderedSkillEffectOptions(context) {
    const target = context.target;
    if (!target) return [];
    return buildSelfSkillEffectOptions(target, context)
      .filter(option => isBonusMapRelevantToPerspective(option.bonuses));
  }

  function showSkillEffectPopover(anchor, option) {
    const lines = [
      formatBonusMap(option.bonuses) ? `効果: ${formatBonusMap(option.bonuses)}` : '',
      ...getSkillEffectConditionLines(option).map(line => `条件: ${line}`),
      option.detailText || ''
    ].filter(Boolean);
    showFdcInfoPopover(anchor, option.label || 'スキル効果詳細', lines);
  }

  function getSkillEffectConditionSummary(option) {
    const conditions = getSkillEffectConditionLines(option);
    if (!conditions.length) return '';
    return conditions.slice(0, 2).join(' / ');
  }

  function getSkillEffectConditionLines(option) {
    const lines = String(option.detailText || '')
      .split(/\n+/)
      .map(line => line.trim())
      .filter(Boolean);
    const conditionLines = lines.filter(line => (
      /条件|対象|列|同列|前列|中列|後列|攻撃|守備|防御|支援|補助|物理|魔法|性格|純粋|冷静|狂気|活発|憂鬱|編成/.test(line)
      && !/物理\d|魔法\d|倍率|ダメージ\d/.test(line)
    ));
    return unique(conditionLines).slice(0, 4);
  }

  function renderSynergyCategory(context) {
    if (!el.synergyCategory) return;
    const rows = getActiveSynergyRows(context);
    const enabled = view.effectSources.synergy !== false;
    el.synergyCategory.innerHTML = `
      <div class="fdc-synergy-card ${enabled ? '' : 'is-disabled'}">
        <div class="fdc-synergy-head">
          <span>編成シナジー</span>
          <b>${enabled ? 'ON' : 'OFF'}</b>
        </div>
        <div class="fdc-synergy-lines">
          ${renderSynergyLine('性格', rows.filter(row => row.type === 'personality'))}
          ${renderSynergyLine('種族', rows.filter(row => row.type === 'race'))}
        </div>
        <div class="fdc-synergy-bonus-chips">
          ${rows.some(row => Object.keys(row.bonuses || {}).length) ? rows.filter(row => Object.keys(row.bonuses || {}).length).map(row => renderSynergyBonusChip(row)).join('') : '<p class="fdc-empty">発動中のシナジーなし</p>'}
        </div>
      </div>
    `;
  }

  function renderSynergyLine(label, rows) {
    if (rows[0]?.type === 'personality') return renderPersonalitySynergyLine(label, rows);
    return `
      <div class="fdc-synergy-line">
        <strong>${escapeHtml(label)}</strong>
        <div class="fdc-synergy-icons">
          ${rows.length ? rows.map(row => `
            <span class="fdc-synergy-icon-chip ${row.isTarget ? 'is-target' : ''}" title="${escapeAttr(`${row.name} x${row.count}`)}">
              <img src="${escapeAttr(row.icon)}" alt="">
              <b>x${escapeHtml(row.count)}</b>
            </span>
          `).join('') : '<span class="fdc-synergy-none">なし</span>'}
        </div>
      </div>
    `;
  }

  function renderPersonalitySynergyLine(label, rows) {
    const icons = rows.flatMap(row => Array.from({ length: row.count }, (_, index) => ({
      ...row,
      instanceIndex: index,
      active: index < row.activeCount
    })));
    const pairs = [];
    for (let index = 0; index < icons.length; index += 2) pairs.push([icons[index], icons[index + 1]].filter(Boolean));
    return `
      <div class="fdc-synergy-line fdc-synergy-line-personality">
        <strong>${escapeHtml(label)}</strong>
        <div class="fdc-synergy-personality-icons">
          ${pairs.length ? pairs.map(pair => `
            <span class="fdc-synergy-personality-pair">
              ${pair.map((row, index) => `
                <span class="fdc-synergy-personality-icon ${index ? 'is-bottom' : 'is-top'} ${row.active ? 'is-active' : 'is-extra'} ${row.isTarget ? 'is-target' : ''}" title="${escapeAttr(`${row.name} ${row.instanceIndex + 1}/${row.count}`)}">
                  <img src="${escapeAttr(row.icon)}" alt="">
                </span>
              `).join('')}
            </span>
          `).join('') : '<span class="fdc-synergy-none">なし</span>'}
        </div>
      </div>
    `;
  }

  function renderSynergyBonusChip(row) {
    return `
      <span class="fdc-synergy-bonus-chip ${row.isTarget ? 'is-target' : ''}">
        <img src="${escapeAttr(row.icon)}" alt="">
        <strong>${escapeHtml(row.name)} x${escapeHtml(row.count)}</strong>
        <b>${escapeHtml(formatBonusMap(row.bonuses))}</b>
      </span>
    `;
  }

  function getActiveSynergyRows(context) {
    const counts = collectSynergyCounts(context.formation, context.state);
    return [
      ...getSynergyRowsForType('personality', typeof PERSONALITY_SYNERGIES === 'undefined' ? [] : PERSONALITY_SYNERGIES, counts.personality, context.target?.personality),
      ...getSynergyRowsForType('race', typeof RACE_SYNERGIES === 'undefined' ? [] : RACE_SYNERGIES, counts.race, context.target?.race)
    ].filter(row => row.count > 0 && (row.type === 'personality' || (row.bonuses && Object.keys(row.bonuses).length)));
  }

  function getSynergyRowsForType(type, table, counts, targetName = '') {
    const source = type === 'personality' ? sortPersonalitySynergies(table || []) : (table || []);
    return source.map(item => {
      const count = Number(counts?.[item.name]) || 0;
      const effect = findSynergyEffect(table, item.name, count);
      const activeCount = getSynergyActiveThreshold(item, count);
      return {
        type,
        id: item.id,
        name: item.name,
        icon: item.icon,
        count,
        activeCount,
        bonuses: normalizeSynergyEffect(effect),
        isTarget: item.name === targetName
      };
    }).filter(row => row.count > 0);
  }

  function sortPersonalitySynergies(items) {
    const order = ['冷静', '憂鬱', '活発', '狂気', '純粋'];
    return [...items].sort((a, b) => {
      const ai = order.indexOf(a.name);
      const bi = order.indexOf(b.name);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    });
  }

  function getSynergyActiveThreshold(item, count) {
    const effectsByCount = item?.effectsByCount || {};
    const threshold = Object.keys(effectsByCount)
      .map(Number)
      .filter(value => Number.isFinite(value) && value <= count)
      .sort((a, b) => b - a)[0];
    return threshold || 0;
  }

  function applyEnabledSelfSkillEffects(effects, context) {
    buildSelfSkillEffectOptions(context.target, context)
      .filter(option => isSelfSkillEffectOptionEnabled(option))
      .forEach(option => {
        const item = setEffectTags({
          source: option.group === 'formation' ? '編成スキル' : option.source || '本人スキル',
          label: option.label,
          bonuses: option.bonuses,
          reason: option.detailText,
          tags: { source: [option.sourceTag || 'スキル/アサイド'], status: [option.defaultEnabled ? '自動ON' : '手動ON'], effect: Object.keys(option.bonuses || {}).flatMap(effectTagsFromBonusKey) }
        }, { status: [option.defaultEnabled ? '自動ON' : '手動ON'] });
        effects.applied.push(item);
      });
  }

  function isSelfSkillEffectOptionEnabled(option) {
    if (!option?.key) return !!option?.defaultEnabled;
    if (Object.prototype.hasOwnProperty.call(view.selfSkillEffectEnabled, option.key)) {
      return view.selfSkillEffectEnabled[option.key] === true;
    }
    return !!option.defaultEnabled;
  }

  function buildSelfSkillEffectOptions(target, context) {
    const apostle = getApostleSkillData(target);
    if (!apostle) return buildFormationA3SkillEffectOptions(target, context);
    const levels = getFdcEffectiveSkillLevels(target);
    const options = [];
    collectFdcApostleSkillSources(apostle, levels, target, context).forEach(({ skill, sourceKey, sourceLabel }) => {
      const category = getFdcApostleSkillCategory(skill, sourceLabel);
      const skillLevel = getFdcSkillLevelForCategory(levels, category);
      normalizeFdcArray(skill.stats).forEach((stat, statIndex) => {
        const bonuses = normalizeFdcSkillStatBonus(stat);
        if (!bonuses || !Object.keys(bonuses).length) return;
        const label = [
          sourceLabel && sourceLabel !== '通常' ? sourceLabel : category,
          skill.skillName || skill.name || '',
          `${stat.statName || 'ステータス'}増加`
        ].filter(Boolean).join(' / ');
        options.push({
          key: `${target.id}:${sourceKey}:stat:${statIndex}`,
          category,
          label,
          bonuses,
          detailText: [skill.description, `${stat.statApplyTo || '本人'} ${stat.statName || ''} +${formatPlainNumber(stat.increaseP ?? stat.increase ?? stat.value)}%`].filter(Boolean).join('\n')
        });
      });
      normalizeFdcArray(skill.effects).forEach((effect, effectIndex) => {
        if (isFdcApostleAttackMultiplierEffect(effect)) return;
        const bonuses = normalizeFdcSkillEffectBonus(effect, skillLevel);
        if (!bonuses || !Object.keys(bonuses).length) return;
        const effectText = [skill.description, effect.description, effect.effectDescription, effect.valueKind, effect.effectType, effect.effectTarget].filter(Boolean).join(' ');
        const enemyPersonalityState = getEnemyPersonalityConditionState(effectText);
        const label = [
          sourceLabel && sourceLabel !== '通常' ? sourceLabel : category,
          skill.skillName || skill.name || '',
          effect.valueKind || effect.effectType || '効果'
        ].filter(Boolean).join(' / ');
        options.push({
          key: `${target.id}:${sourceKey}:${effectIndex}`,
          category,
          label,
          bonuses,
          defaultEnabled: enemyPersonalityState.hasCondition && enemyPersonalityState.defaultEnabled && !isTimedOrManualEffect(effectText, effect),
          detailText: [enemyPersonalityState.reason, skill.description, effect.description, effect.effectDescription].filter(Boolean).join('\n')
        });
      });
    });
    return options.concat(buildFormationSkillEffectOptions(target, context));
  }

  function buildFormationSkillEffectOptions(target, context) {
    if (!target || !context?.members?.length) return [];
    const options = [];
    context.members.forEach(member => {
      if (!member?.id || member.id === target.id) return;
      const apostle = getApostleSkillData(member);
      if (!apostle) return;
      const memberName = member.name || apostle?.name || member.id;
      const memberLevels = getFdcEffectiveSkillLevels(member);
      collectFdcApostleSkillSources(apostle, memberLevels, member, context).forEach(({ skill, sourceKey, sourceLabel }) => {
        if (String(sourceKey || '').startsWith('aside:')) return;
        const category = getFdcApostleSkillCategory(skill, sourceLabel);
        const skillLevel = getFdcSkillLevelForCategory(memberLevels, category);
        normalizeFdcArray(skill.effects).forEach((effect, effectIndex) => {
          const option = createFormationSkillEffectOption({
            effect,
            effectIndex,
            sourceKey,
            sourceLabel,
            category,
            skill,
            skillLevel,
            member,
            memberName,
            target
          });
          if (option) options.push(option);
        });
      });
    });
    return options.concat(buildFormationA3SkillEffectOptions(target, context));
  }

  function createFormationSkillEffectOption({ effect, effectIndex, sourceKey, sourceLabel, category, skill, skillLevel, member, memberName, target }) {
    if (isFdcApostleAttackMultiplierEffect(effect)) return null;
    const targetState = getFormationSkillTargetState(effect.effectTarget, target, member);
    if (!targetState.applies) return null;
    const bonuses = pickDamageRelevantBonusMap(normalizeFdcSkillEffectBonus(effect, skillLevel));
    if (!bonuses || !Object.keys(bonuses).length) return null;
    const effectText = [skill?.description, effect.valueKind, effect.effectType, effect.effectTarget, effect.description, effect.effectDescription].filter(Boolean).join(' ');
    const enemyPersonalityState = getEnemyPersonalityConditionState(effectText);
    const defaultEnabled = targetState.defaultEnabled && enemyPersonalityState.defaultEnabled && !isTimedOrManualEffect(effectText, effect);
    return {
      key: `${member.id}:formation-skill:${sourceKey}:${effectIndex}:${target.id}`,
      group: 'formation',
      category,
      source: '編成スキル',
      sourceTag: 'スキル/アサイド',
      defaultEnabled,
      label: [
        `${memberName} ${sourceLabel && sourceLabel !== '通常' ? sourceLabel : getFdcApostleSkillActionLabel(category)}`,
        skill?.skillName || skill?.name || '',
        effect.valueKind || effect.effectType || '効果'
      ].filter(Boolean).join(' / '),
      bonuses,
      detailText: [targetState.reason, enemyPersonalityState.reason, skill?.description, effect.description, effect.effectDescription].filter(Boolean).join('\n')
    };
  }

  function buildFormationA3SkillEffectOptions(target, context) {
    if (!target || !context?.members?.length) return [];
    const options = [];
    context.members.forEach(member => {
      if (!member?.id || member.id === target.id || Number(member.asideRank) < 3) return;
      const apostle = getApostleSkillData(member);
      const aside3 = apostle?.aside?.levels?.[3];
      if (!aside3) return;
      const memberName = member.name || apostle?.name || member.id;
      normalizeFdcArray(aside3.effects).forEach((effect, effectIndex) => {
        const effectText = [effect.valueKind, effect.effectType, effect.effectTarget, effect.description, effect.effectDescription].filter(Boolean).join(' ');
        const targetState = getFormationSkillTargetState(effect.effectTarget, target, member);
        if (!targetState.applies) return;
        const skillLevel = getFdcSkillLevelForCategory(getFdcEffectiveSkillLevels(member), 'アサイド');
        const bonuses = pickDamageRelevantBonusMap(normalizeFdcSkillEffectBonus(effect, skillLevel));
        if (!bonuses || !Object.keys(bonuses).length) return;
        options.push({
          key: `${member.id}:formation-a3:effect:${effectIndex}:${target.id}`,
          group: 'formation',
          category: 'アサイド',
          source: '編成A3',
          sourceTag: 'スキル/アサイド',
          defaultEnabled: targetState.defaultEnabled && !isTimedOrManualEffect(effectText, effect),
          label: [`${memberName} A3`, effect.valueKind || effect.effectType || '効果'].filter(Boolean).join(' / '),
          bonuses,
          detailText: [targetState.reason, aside3.description, effect.description, effect.effectDescription].filter(Boolean).join('\n')
        });
      });
    });
    return options;
  }

  function pickDamageRelevantBonusMap(bonuses) {
    if (!bonuses) return null;
    const allowed = new Set([
      'atkP',
      'physicalAtkP',
      'magicAtkP',
      'defP',
      'physicalDefP',
      'magicDefP',
      'critP',
      'critRateP',
      'critDmgP',
      'critDmgAddP',
      'critResP',
      'critResAddP',
      'critDmgResP',
      'critDmgResAddP',
      'addP',
      'normalAttackAddP',
      'basicAddP',
      'enhancedAddP',
      'skillAddP',
      'takenDmgP',
      'attackerDmgDownP',
      'enemyDefDownP',
      'enemyCritResDownP',
      'enemyCritDmgResDownP'
    ]);
    return Object.fromEntries(Object.entries(bonuses).filter(([key, value]) => allowed.has(key) && Number(value)));
  }

  function getFormationSkillTargetState(rawTarget, target, sourceMember) {
    const text = String(rawTarget || '').trim();
    const result = (applies, defaultEnabled, reason = '') => ({ applies, defaultEnabled, reason });
    if (!text) return result(false, false);
    if (/敵/.test(text)) return result(false, false, '敵対象');
    if (/自身|本人/.test(text) && !/味方|全体|前列|中列|後列/.test(text)) {
      return result(sourceMember?.id === target?.id, sourceMember?.id === target?.id, '自身対象');
    }
    if (/全体|味方全員|味方全体|フィールド上の味方全体|味方\/最大/.test(text)) {
      return result(true, true, '味方全体');
    }
    const reason = judgeTargetText(text, target, resolveActiveDamageType(target));
    if (reason.matched && /前列|中列|後列|攻撃|守備|防御|支援|補助|物理|魔法/.test(text)) {
      return result(true, true, reason.reason);
    }
    if (/味方/.test(text)) {
      return result(true, false, `${text} / 対象候補のため手動ON`);
    }
    return result(false, false, reason.reason);
  }

  function getEnemyPersonalityConditionState(text) {
    const body = String(text || '');
    const personalities = ['純粋', '冷静', '狂気', '活発', '憂鬱'];
    const personality = personalities.find(name => {
      if (!body.includes(name)) return false;
      if (new RegExp(`${name}の味方`).test(body)) return false;
      return new RegExp(`${name}(?:へ|への|に対|相手|敵)`).test(body)
        || new RegExp(`${name}.*(?:与ダメージ|ダメージ量|ダメージ増加)`).test(body);
    });
    if (!personality) return { hasCondition: false, defaultEnabled: true, reason: '' };
    const current = normalizePersonalityName(view.enemyPersonality);
    const matched = current === personality;
    return {
      hasCondition: true,
      defaultEnabled: matched,
      reason: matched
        ? `敵性格=${personality}`
        : `敵性格条件: ${personality}${current ? ` (現在:${current})` : ' (未設定)'}`
    };
  }

  function normalizeFdcSkillEffectBonus(effect, skillLevel) {
    if (!effect) return null;
    const valueClass = String(effect.valueClass || '');
    if (valueClass && valueClass !== '倍率') return null;
    const levelInfo = getFdcEffectLevelInfo(effect, skillLevel);
    const value = Number(levelInfo?.value ?? effect.fixedValue);
    if (!Number.isFinite(value) || value === 0) return null;
    const valueKind = String(effect.valueKind || '');
    const effectType = String(effect.effectType || '');
    const effectTarget = String(effect.effectTarget || '');
    const text = `${valueKind} ${effectType} ${effectTarget}`;
    const targetEnemy = /敵/.test(effectTarget) || /デバフ/.test(effectType);
    const decrease = /減少|低下/.test(text);
    const increase = /増加|上昇|アップ/.test(text);
    const bonuses = {};
    const add = key => { bonuses[key] = (bonuses[key] || 0) + value; };
    const addSigned = key => { bonuses[key] = (bonuses[key] || 0) + (decrease ? -value : value); };
    const addDamageTakenMod = key => { bonuses[key] = (bonuses[key] || 0) + (decrease ? value : -value); };

    if (/攻撃速度/.test(valueKind) && !targetEnemy) add('hasteP');
    else if (/攻撃力/.test(valueKind) && !targetEnemy) addSigned('atkP');
    else if (/防御力/.test(valueKind)) {
      if (targetEnemy && decrease) add('enemyDefDownP');
      else if (!targetEnemy) addSigned('defP');
    } else if (/会心DMG抵抗|会心ダメージ抵抗/.test(valueKind)) {
      if (targetEnemy && decrease) add('enemyCritDmgResDownP');
      else if (!targetEnemy) addSigned('critDmgResP');
    } else if (/会心抵抗/.test(valueKind)) {
      if (targetEnemy && decrease) add('enemyCritResDownP');
      else if (!targetEnemy) addSigned('critResP');
    } else if (/会心(?:ダメージ量|DMG量)/.test(valueKind)) add('critDmgAddP');
    else if (/会心ダメージ|会心DMG/.test(valueKind)) add('critDmgP');
    else if (/会心率/.test(valueKind)) add('critRateP');
    else if (/会心/.test(valueKind)) add('critP');
    else if (/被ダメージ|被ダメ/.test(valueKind) && !targetEnemy) addDamageTakenMod('takenDmgP');
    else if (/自爆ダメージ/.test(valueKind)) addSigned('specialP');
    else if (/スキル.*ダメージ|ダメージ量|与ダメージ|与ダメ/.test(valueKind)) addSigned('addP');
    else if (/HP回復/.test(valueKind)) add('hpRecoveryP');
    else if (/治癒|回復量/.test(valueKind)) add('healingP');
    else if (/SP回復/.test(valueKind)) add('spRecoveryP');
    return bonuses;
  }

  function normalizeFdcSkillStatBonus(stat) {
    const applyTo = String(stat?.statApplyTo || '本人');
    if (/全体|味方/.test(applyTo)) return null;
    const value = Number(stat?.increaseP ?? stat?.increase ?? stat?.value);
    if (!Number.isFinite(value) || value === 0) return null;
    const name = String(stat?.statName || '');
    const bonuses = {};
    if (/最大?HP|HP/.test(name)) bonuses.hpP = value;
    else if (/物理攻撃/.test(name)) bonuses.physicalAtkP = value;
    else if (/魔法攻撃/.test(name)) bonuses.magicAtkP = value;
    else if (/攻撃力/.test(name)) bonuses.atkP = value;
    else if (/物理防御/.test(name)) bonuses.physicalDefP = value;
    else if (/魔法防御/.test(name)) bonuses.magicDefP = value;
    else if (/防御力/.test(name)) bonuses.defP = value;
    else if (/会心ダメージ抵抗|会心DMG抵抗/.test(name)) bonuses.critDmgResP = value;
    else if (/会心抵抗/.test(name)) bonuses.critResP = value;
    else if (/会心(?:ダメージ量|DMG量)/.test(name)) bonuses.critDmgAddP = value;
    else if (/会心ダメージ|会心DMG/.test(name)) bonuses.critDmgP = value;
    else if (/会心率/.test(name)) bonuses.critRateP = value;
    else if (/会心/.test(name)) bonuses.critP = value;
    return bonuses;
  }

  function renderAllApostlePicker(context) {
    const members = getFilteredPickerMembers(context);
    return `
      ${renderPickerTools(members.length, context.allMembers.length)}
      <div class="fdc-picker-all-grid">
        ${members.map(member => renderFormationPickerSlot(member, null, null, null, context.state?.cards)).join('')}
      </div>
    `;
  }

  function getFilteredPickerMembers(context) {
    const search = String(view.pickerSearch || '').trim().toLowerCase();
    const filters = view.pickerFilters || {};
    const members = context.allMembers.filter(member => {
      if (filters.personality && member.personality !== filters.personality) return false;
      if (filters.position && member.position !== filters.position) return false;
      if (filters.role && normalizeRole(member.role) !== filters.role) return false;
      if (!search) return true;
      return [member.id, member.name, member.personality, member.race, normalizeRole(member.role), member.position]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(search));
    });
    const nameSort = (a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'ja');
    const sortKey = view.pickerSort || 'name';
    return members.sort((a, b) => {
      if (sortKey === 'level') return (Number(b.level) || 0) - (Number(a.level) || 0) || nameSort(a, b);
      if (sortKey === 'rank') return (Number(b.rank) || 0) - (Number(a.rank) || 0) || nameSort(a, b);
      if (sortKey === 'position') return POSITIONS.indexOf(a.position) - POSITIONS.indexOf(b.position) || nameSort(a, b);
      if (sortKey === 'star') return (Number(b.star) || 0) - (Number(a.star) || 0) || nameSort(a, b);
      return nameSort(a, b);
    });
  }

  function renderPickerTools(count, total) {
    return `
      <div class="fdc-picker-tools">
        <label class="fdc-picker-search">
          <span>検索</span>
          <input type="search" value="${escapeAttr(view.pickerSearch || '')}" data-fdc-picker-search placeholder="使徒名 / 種族など">
        </label>
        <label>
          <span>並び</span>
          <select data-fdc-picker-sort>
            ${renderSelectOption('name', '50音順', view.pickerSort)}
            ${renderSelectOption('level', 'Lv高い順', view.pickerSort)}
            ${renderSelectOption('rank', 'Rank高い順', view.pickerSort)}
            ${renderSelectOption('star', '★多い順', view.pickerSort)}
            ${renderSelectOption('position', '配置順', view.pickerSort)}
          </select>
        </label>
        <label>
          <span>性格</span>
          <select data-fdc-picker-filter="personality">
            ${renderSelectOption('', 'すべて', view.pickerFilters.personality)}
            ${['純粋', '冷静', '狂気', '活発', '憂鬱'].map(value => renderSelectOption(value, value, view.pickerFilters.personality)).join('')}
          </select>
        </label>
        <label>
          <span>列</span>
          <select data-fdc-picker-filter="position">
            ${renderSelectOption('', 'すべて', view.pickerFilters.position)}
            ${POSITIONS.map(value => renderSelectOption(value, value, view.pickerFilters.position)).join('')}
          </select>
        </label>
        <label>
          <span>役割</span>
          <select data-fdc-picker-filter="role">
            ${renderSelectOption('', 'すべて', view.pickerFilters.role)}
            ${['守備', '攻撃', '支援'].map(value => renderSelectOption(value, value, view.pickerFilters.role)).join('')}
          </select>
        </label>
        <span class="fdc-picker-count">${escapeHtml(`${count}/${total}`)}</span>
      </div>
    `;
  }

  function renderSelectOption(value, label, current) {
    return `<option value="${escapeAttr(value)}" ${String(current || '') === String(value) ? 'selected' : ''}>${escapeHtml(label)}</option>`;
  }

  function renderFormationPickerSlot(member, rowIndex, lineIndex, pendingMember = null, cards = {}) {
    const canPlacePending = !!pendingMember && rowIndex === getPreferredPositionIndex(pendingMember);
    const pendingSlotAttrs = canPlacePending
      ? `data-fdc-temp-member-slot="${rowIndex}:${lineIndex}"`
      : '';
    if (!member) {
      return `
        <button type="button" class="fdc-picker-slot is-empty ${canPlacePending ? 'is-placeable' : ''} ${pendingMember && !canPlacePending ? 'is-locked' : ''}" ${pendingSlotAttrs} ${canPlacePending ? '' : 'disabled'} aria-label="${POSITIONS[rowIndex]} ${lineIndex + 1} 空き">
          <span>${canPlacePending ? '+' : ''}</span>
        </button>
      `;
    }
    const isTempMember = rowIndex != null && lineIndex != null && !!view.tempMembers?.[`${rowIndex}:${lineIndex}`];
    const placementClass = pendingMember ? (canPlacePending ? 'is-placeable' : 'is-locked') : '';
    return `
      <button type="button" class="fdc-picker-slot is-filled ${member.id === view.targetId ? 'is-active' : ''} ${isTempMember ? 'is-temp' : ''} ${placementClass} personality-${escapeAttr(member.personality || '')}" data-fdc-member-id="${escapeAttr(member.id)}" ${pendingSlotAttrs} ${pendingMember && !canPlacePending ? 'disabled' : ''} title="${escapeAttr(member.name)}${isTempMember ? ' / 一時配置' : ''}">
        <img class="fdc-picker-portrait" src="${escapeAttr(getApostleImage(member.id, member.name))}" alt="" data-fallback>
        ${renderApostleBadges(member)}
        ${rowIndex == null || lineIndex == null ? '' : renderPickerArtifactStrip(member, cards)}
      </button>
    `;
  }

  function renderPickerArtifactStrip(member, cards = {}) {
    const artifacts = Array.from({ length: 3 }, (_, index) => {
      const id = member.artifactIds?.[index] || '';
      const row = id ? createArtifactDisplayRow(id, 1, cards[id], { owner: member.name, slot: index + 1 }) : null;
      if (!row) return `<span class="fdc-picker-artifact-mini is-empty" aria-hidden="true">${renderArtifactIcon(null, index)}</span>`;
      return `<span class="fdc-picker-artifact-mini is-filled ${getCardRarityClass(row)}" title="${escapeAttr(`${row.name} / ★${row.star}${row.solder ? ` / はんだ+${row.solder}` : ''}`)}">${renderArtifactIcon(row, index)}</span>`;
    }).join('');
    return `<span class="fdc-picker-artifacts" aria-label="装備遺物">${artifacts}</span>`;
  }

  function toggleFormationPicker(forceOpen = null) {
    if (!el.formationPicker) return;
    const shouldOpen = forceOpen === null ? el.formationPicker.hidden : !!forceOpen;
    el.formationPicker.hidden = !shouldOpen;
    el.formationPicker.classList.toggle('is-floating-picker', shouldOpen && forceOpen === true);
    if (shouldOpen) {
      renderFormationPicker(buildContext());
    }
    el.targetPreview?.setAttribute('aria-expanded', String(shouldOpen));
    updateFloatingTargetVisibility();
  }

  function closeFormationPicker() {
    if (!el.formationPicker) return;
    el.formationPicker.hidden = true;
    el.formationPicker.classList.remove('is-floating-picker');
    view.pendingTempMemberId = '';
    el.targetPreview?.setAttribute('aria-expanded', 'false');
    updateFloatingTargetVisibility();
  }

  function renderApostleBadges(member) {
    const personality = member.personality || '';
    const roleAsset = getRoleAssetName(member.role);
    const attackType = resolveDamageType('auto', member);
    const attackAsset = attackType === 'magic' ? 'mag' : attackType === 'physical' ? 'phys' : '';
    const position = member.position || '';
    return `
      ${personality ? `<img class="fdc-apostle-badge fdc-personality-badge" src="img/性格_${escapeAttr(personality)}.webp" alt="${escapeAttr(personality)}" title="${escapeAttr(personality)}">` : ''}
      ${position ? `<img class="fdc-apostle-badge fdc-position-badge" src="img/配置列_${escapeAttr(position)}.webp" alt="${escapeAttr(position)}" title="${escapeAttr(position)}">` : ''}
      ${roleAsset ? `<img class="fdc-apostle-badge fdc-role-badge" src="img/役割_${escapeAttr(roleAsset)}.webp" alt="${escapeAttr(member.role || '')}" title="${escapeAttr(member.role || '')}">` : ''}
      ${attackAsset ? `<img class="fdc-apostle-badge fdc-attack-badge" src="img/Attack_${attackAsset}.webp" alt="${escapeAttr(member.attackType || '')}" title="${escapeAttr(member.attackType || '')}">` : ''}
    `;
  }

  function getRoleAssetName(role) {
    const normalized = normalizeRole(role);
    if (normalized === '守備') return '防御';
    if (normalized === '支援') return '支援';
    if (normalized === '攻撃') return '攻撃';
    return '';
  }

  function renderArtifactCategory(context) {
    if (!el.artifactCategory) return;
    const targetSlots = getTargetArtifactSlots(context);
    const equippedEffects = getArtifactEffectRows(context.effects, true).filter(isEffectRelevantToPerspective);
    const formationEffects = getFormationArtifactEffectRows(context.effects).filter(isEffectRelevantToPerspective);
    const equippedAutoEffects = equippedEffects.filter(isAutomaticBonusEffect);
    const equippedDetailEffects = equippedEffects.filter(item => !isAutomaticBonusEffect(item));
    const formationAutoEffects = formationEffects.filter(isAutomaticBonusEffect);
    const formationDetailEffects = formationEffects.filter(item => !isAutomaticBonusEffect(item));
    const enabled = view.effectSources.artifact !== false;
    el.artifactCategory.innerHTML = `
      <section class="fdc-artifact-section">
        <h4>編成</h4>
        <div class="fdc-artifact-board">
          ${renderFormationArtifactBoard(context)}
        </div>
      </section>
      <section class="fdc-artifact-section">
        <h4>装備遺物</h4>
        <div class="fdc-equipped-artifact-list">
          ${targetSlots.map((row, index) => renderEquippedArtifactRow(row, index)).join('')}
        </div>
      </section>
      <div class="fdc-artifact-effect-columns">
        <section class="fdc-artifact-effect-box ${enabled ? '' : 'is-disabled'}">
          <h4>装備遺物補正 <span>${enabled ? 'ON' : 'OFF'}</span></h4>
          <div class="fdc-artifact-effect-chips">
            ${renderArtifactBonusSummary(equippedAutoEffects, enabled)}
            ${renderGroupedArtifactEffectChips(equippedDetailEffects, enabled)}
            ${!equippedAutoEffects.length && !equippedDetailEffects.length ? '<p class="fdc-empty">装備遺物の補正なし</p>' : ''}
          </div>
        </section>
        <section class="fdc-artifact-effect-box ${enabled ? '' : 'is-disabled'}">
          <h4>編成遺物補正 <span>${enabled ? 'ON' : 'OFF'}</span></h4>
          <div class="fdc-artifact-effect-chips">
            ${renderArtifactBonusSummary(formationAutoEffects, enabled)}
            ${formationDetailEffects.length ? renderGroupedArtifactEffectChips(formationDetailEffects, enabled) : ''}
            ${!formationAutoEffects.length && !formationDetailEffects.length ? '<p class="fdc-empty">影響する編成遺物なし</p>' : ''}
          </div>
        </section>
      </div>
    `;
  }

  function renderFormationArtifactBoard(context) {
    return Array.from({ length: 3 }, (_, lineIndex) => `
      <div class="fdc-artifact-board-row">
        ${POSITIONS.map((position, rowIndex) => renderFormationArtifactCell(context, rowIndex, lineIndex)).join('')}
      </div>
    `).join('');
  }

  function renderFormationArtifactCell(context, rowIndex, lineIndex) {
    const row = context.formation?.rows?.[rowIndex] || {};
    const apostleId = row.apostles?.[lineIndex] || '';
    const member = context.members.find(item => item.id === apostleId);
    const artifactIds = row.artifacts?.[lineIndex] || [];
    const artifactRows = Array.from({ length: 3 }, (_, index) => {
      const id = artifactIds[index] || '';
      const cardState = context.state?.cards?.[id];
      return createArtifactDisplayRow(id, 1, cardState, {
        owner: member?.name || '',
        position: POSITIONS[rowIndex],
        line: lineIndex + 1,
        slot: index + 1,
        scope: apostleId === context.target?.id ? 'self' : 'formation'
      });
    });
    const active = apostleId && apostleId === context.target?.id;
    return `
      <div class="fdc-artifact-board-cell ${active ? 'is-target' : ''}" title="${escapeAttr(`${POSITIONS[rowIndex]}${lineIndex + 1}`)}">
        <span class="fdc-artifact-cell-apostle">
          ${member ? `<img src="${escapeAttr(getApostleImage(member.id, member.name))}" alt="">` : '<span>?</span>'}
        </span>
        <span class="fdc-artifact-cell-items">
          ${Array.from({ length: 3 }, (_, index) => renderArtifactTiny(artifactRows[index], { rowIndex, lineIndex, slotIndex: index })).join('')}
        </span>
      </div>
    `;
  }

  function getTargetArtifactSlots(context) {
    const cards = context.state?.cards || {};
    return Array.from({ length: 3 }, (_, index) => {
      const id = context.target?.artifactIds?.[index] || '';
      return createArtifactDisplayRow(id, 1, cards[id], {
        owner: context.target?.name || '',
        scope: 'self',
        slot: index + 1
      });
    });
  }

  function getFormationArtifactRows(context) {
    const cards = context.state?.cards || {};
    return (context.formation?.rows || []).flatMap((row, rowIndex) =>
      (row.artifacts || []).flatMap((lineArtifacts, lineIndex) => {
        const ownerId = row.apostles?.[lineIndex] || '';
        const owner = getApostle(ownerId)?.使徒名 || ownerId || `編成${lineIndex + 1}`;
        return countIds(lineArtifacts || []).map(({ id, qty }) => createArtifactDisplayRow(id, qty, cards[id], {
          owner,
          position: POSITIONS[rowIndex] || '',
          line: lineIndex + 1,
          scope: ownerId === context.target?.id ? 'self' : 'formation'
        }));
      })
    ).filter(Boolean);
  }

  function createArtifactDisplayRow(id, qty, cardState = {}, meta = {}) {
    const card = getCard(id);
    if (!card || card.kind !== 'artifact') return null;
    const row = createCardRow(id, qty, cardState);
    return {
      ...row,
      rarity: card.rarity || '',
      signature: !!card.signature,
      favoriteCharacter: card.favoriteCharacter || '',
      owned: !!meta.owned || !!cardState?.owned,
      image: getCardImagePath(card),
      bg: getFormationArtifactBg(card),
      owner: meta.owner || '',
      position: meta.position || '',
      line: meta.line || '',
      slot: meta.slot || '',
      scope: meta.scope || 'formation'
    };
  }

  function renderArtifactSlot(row, index) {
    return `<button type="button" class="fdc-artifact-slot ${row ? `is-filled ${getCardRarityClass(row)}` : 'is-empty'}" title="${escapeAttr(row ? `${row.name} / ★${row.star}${row.solder ? ` / はんだ+${row.solder}` : ''}` : '遺物を選択')}" disabled>${renderArtifactIcon(row, index)}</button>`;
  }

  function renderArtifactIcon(row, index = 0) {
    if (!row) {
      return `
        <img class="fdc-artifact-bg" src="img/遺物bg_0.png" alt="">
        <span class="fdc-artifact-empty-icon">${index + 1}</span>
      `;
    }
    return `
      <img class="fdc-artifact-bg" src="${escapeAttr(row.bg)}" alt="">
      <img class="fdc-artifact-img" src="${escapeAttr(row.image)}" alt="">
      ${row.solder ? `<span class="fdc-artifact-solder">+${escapeHtml(row.solder)}</span>` : ''}
    `;
  }

  function renderEquippedArtifactRow(row, index) {
    if (!row) {
      return `
        <div class="fdc-equipped-artifact-row is-empty">
          <button type="button" class="fdc-artifact-slot is-empty" data-fdc-temp-artifact-row="target" data-fdc-temp-artifact-slot="${index}" title="一時的に遺物を選択">${renderArtifactIcon(null, index)}</button>
          <span class="fdc-equipped-artifact-info">
            <strong>装備遺物${index + 1}</strong>
            <small>未装備</small>
          </span>
          <span class="fdc-equipped-artifact-action">入替</span>
        </div>
      `;
    }
    return `
      <div class="fdc-equipped-artifact-row ${getCardRarityClass(row)}">
        <button type="button" class="fdc-artifact-slot is-filled ${getCardRarityClass(row)}" data-fdc-temp-artifact-row="target" data-fdc-temp-artifact-slot="${index}" title="${escapeAttr(`${row.name}を一時入替`)}">${renderArtifactIcon(row, index)}</button>
        <span class="fdc-equipped-artifact-info">
          <strong>${escapeHtml(row.name)}</strong>
          <small>${escapeHtml(`コスト${getCardCostById(row.id, row.star)} / ★${row.star}${row.solder ? ` / はんだ+${row.solder}` : ''}`)}</small>
        </span>
        <span class="fdc-equipped-artifact-effect" data-fdc-artifact-detail="${escapeAttr(row.id)}" data-fdc-artifact-star="${escapeAttr(row.star)}" data-fdc-artifact-solder="${escapeAttr(row.solder || 0)}" title="効果詳細">i</span>
      </div>
    `;
  }

  function renderArtifactTiny(row, meta = {}) {
    const data = meta.rowIndex == null
      ? ''
      : `data-fdc-temp-artifact-row="${escapeAttr(meta.rowIndex)}" data-fdc-temp-artifact-line="${escapeAttr(meta.lineIndex)}" data-fdc-temp-artifact-slot="${escapeAttr(meta.slotIndex)}"`;
    if (!row) return `<button type="button" class="fdc-artifact-tiny is-empty" ${data} title="遺物を一時選択"></button>`;
    return `
      <button type="button" class="fdc-artifact-tiny ${getCardRarityClass(row)}" ${data} title="${escapeAttr(`${row.name}を一時入替`)}">
        <img class="fdc-artifact-bg" src="${escapeAttr(row.bg)}" alt="">
        <img class="fdc-artifact-img" src="${escapeAttr(row.image)}" alt="">
      </button>
    `;
  }

  function openTempArtifactPickerFromElement(element, context) {
    const target = (() => {
      if (element.dataset.fdcTempArtifactRow !== 'target') {
        return {
          type: 'formation',
          rowIndex: Number(element.dataset.fdcTempArtifactRow),
          lineIndex: Number(element.dataset.fdcTempArtifactLine),
          slotIndex: Number(element.dataset.fdcTempArtifactSlot) || 0
        };
      }
      const rowIndex = POSITIONS.indexOf(context.target?.position || '');
      const lineIndex = Number(context.target?.line) - 1;
      if (rowIndex >= 0 && lineIndex >= 0) {
        return {
          type: 'formation',
          rowIndex,
          lineIndex,
          slotIndex: Number(element.dataset.fdcTempArtifactSlot) || 0
        };
      }
      return {
          type: 'target',
          apostleId: context.target?.id || '',
          slotIndex: Number(element.dataset.fdcTempArtifactSlot) || 0
        };
    })();
    if (target.type === 'target' && !target.apostleId) return;
    if (target.type === 'formation' && (!Number.isFinite(target.rowIndex) || !Number.isFinite(target.lineIndex))) return;
    view.artifactPicker = target;
    const picker = getTempArtifactPicker(true);
    renderTempArtifactPicker(context);
    positionTempArtifactPicker(picker, element);
  }

  function getTempArtifactPicker(create = true) {
    let picker = document.getElementById('fdc-temp-artifact-picker');
    if (!picker && create) {
      picker = document.createElement('div');
      picker.id = 'fdc-temp-artifact-picker';
      picker.className = 'fdc-temp-artifact-picker';
      picker.hidden = true;
      document.body.appendChild(picker);
    }
    return picker;
  }

  function renderTempArtifactPicker(context) {
    const picker = getTempArtifactPicker(true);
    const cards = context.state?.cards || {};
    const options = getTempArtifactOptions(cards);
    const currentId = getCurrentTempArtifactId(context);
    picker.innerHTML = `
      <div class="fdc-temp-artifact-head">
        <strong>遺物を一時入替</strong>
        <button type="button" data-fdc-temp-artifact-close aria-label="閉じる">×</button>
      </div>
      <div class="fdc-temp-artifact-grid">
        <button type="button" class="fdc-temp-artifact-option is-clear ${currentId ? '' : 'is-active'}" data-fdc-temp-artifact-value="">
          <span class="fdc-temp-artifact-empty">空</span>
          <strong>未装備</strong>
        </button>
        ${options.map(row => `
          <button type="button" class="fdc-temp-artifact-option ${getCardRarityClass(row)} ${row.owned ? '' : 'is-unowned'} ${row.id === currentId ? 'is-active' : ''}" data-fdc-temp-artifact-value="${escapeAttr(row.id)}">
            <span class="fdc-artifact-slot is-filled ${getCardRarityClass(row)}">${renderArtifactIcon(row, 0)}</span>
            <span class="fdc-temp-artifact-text">
              <strong>${escapeHtml(row.name)}</strong>
              <small>${escapeHtml(`${row.rarity || ''} / コスト${getCardCostById(row.id, row.star)} / ★${row.star}${row.solder ? ` / +${row.solder}` : ''}`)}</small>
            </span>
          </button>
        `).join('')}
      </div>
    `;
    picker.hidden = false;
    picker.querySelector('[data-fdc-temp-artifact-close]')?.addEventListener('click', closeTempArtifactPicker);
    picker.querySelectorAll('[data-fdc-temp-artifact-value]').forEach(button => {
      button.addEventListener('click', () => {
        applyTempArtifactValue(button.dataset.fdcTempArtifactValue || '');
        closeTempArtifactPicker();
      });
    });
  }

  function getTempArtifactOptions(cards = {}) {
    const artifacts = typeof CARD_LIBRARY === 'undefined' ? [] : CARD_LIBRARY.artifacts || [];
    return artifacts.map(card => {
      const state = cards[card.id] || {};
      return createArtifactDisplayRow(card.id, 1, state, { owned: !!state.owned });
    }).filter(Boolean).sort((a, b) => {
      if (a.owned !== b.owned) return a.owned ? -1 : 1;
      return compareArtifactOption(a, b);
    });
  }

  function compareArtifactOption(a, b) {
    const rarityOrder = { 伝説: 5, 希少: 4, 高級: 3, 一般: 2 };
    const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    if (rarityDiff) return rarityDiff;
    const costDiff = getCardCostById(b.id, b.star) - getCardCostById(a.id, a.star);
    if (costDiff) return costDiff;
    return String(a.name).localeCompare(String(b.name), 'ja');
  }

  function getCurrentTempArtifactId(context) {
    const target = view.artifactPicker;
    if (!target) return '';
    if (target.type === 'target') {
      return context.target?.artifactIds?.[target.slotIndex] || '';
    }
    return context.formation?.rows?.[target.rowIndex]?.artifacts?.[target.lineIndex]?.[target.slotIndex] || '';
  }

  function applyTempArtifactValue(id) {
    const target = view.artifactPicker;
    if (!target) return;
    if (target.type === 'target') {
      if (!view.tempArtifacts.target[target.apostleId]) view.tempArtifacts.target[target.apostleId] = {};
      view.tempArtifacts.target[target.apostleId][target.slotIndex] = id || '';
    } else {
      view.tempArtifacts.formation[`${target.rowIndex}:${target.lineIndex}:${target.slotIndex}`] = id || '';
    }
    view.statDirty = false;
    render();
  }

  function closeTempArtifactPicker() {
    const picker = getTempArtifactPicker(false);
    if (picker) picker.hidden = true;
    view.artifactPicker = null;
  }

  function positionTempArtifactPicker(picker, anchor) {
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(420, window.innerWidth - 24);
    const viewportTop = 12;
    const resultBarTop = el.result?.bar?.getBoundingClientRect?.().top || window.innerHeight;
    const bottomLimit = Math.max(viewportTop + 120, Math.min(window.innerHeight - 12, resultBarTop - 12));
    const topPreferred = rect.bottom + 8;
    const maxHeight = Math.max(120, Math.min(560, bottomLimit - viewportTop));
    picker.style.width = `${width}px`;
    picker.style.left = `${Math.min(window.innerWidth - width - 12, Math.max(12, rect.left))}px`;
    picker.style.maxHeight = `${maxHeight}px`;
    picker.hidden = false;
    const height = Math.min(picker.offsetHeight || maxHeight, maxHeight);
    let top = topPreferred;
    if (top + height > bottomLimit) {
      const aboveTop = rect.top - 8 - height;
      top = aboveTop >= viewportTop ? aboveTop : bottomLimit - height;
    }
    top = Math.max(viewportTop, Math.min(top, bottomLimit - height));
    picker.style.top = `${top}px`;
  }

  function renderArtifactMini(row) {
    const meta = [row.owner, row.position].filter(Boolean).join(' / ');
    return `
      <span class="fdc-artifact-mini ${row.scope === 'self' ? 'is-self' : ''}" title="${escapeAttr([row.name, meta].filter(Boolean).join(' / '))}">
        <img class="fdc-artifact-bg" src="${escapeAttr(row.bg)}" alt="">
        <img class="fdc-artifact-img" src="${escapeAttr(row.image)}" alt="">
      </span>
    `;
  }

  function getCardImagePath(card) {
    if (!card) return '';
    const folder = card.kind === 'artifact' ? 'Artifact' : 'Spell';
    return `img/Card/${folder}/${card.imageFile || `${card.name}.webp`}`;
  }

  function getCardCostById(id, star = 1) {
    const card = getCard(id);
    if (!card) return 0;
    if (Array.isArray(card.costByStar) && card.costByStar.length) {
      const index = Math.max(0, Math.min(card.costByStar.length - 1, Number(star) - 1 || 0));
      return card.costByStar[index] || 0;
    }
    return card.cost || 0;
  }

  function getFormationArtifactBg(card) {
    if (!card) return 'img/遺物bg_0.png';
    if (card.signature) return 'img/遺物bg_4.png';
    if (card.rarity === '伝説') return 'img/遺物bg_4.png';
    if (card.rarity === '希少') return 'img/遺物bg_3.png';
    if (card.rarity === '高級') return 'img/遺物bg_2.png';
    return 'img/遺物bg_0.png';
  }

  function getCardRarityClass(row) {
    if (row.signature) return 'rarity-signature';
    if (row.rarity === '伝説') return 'rarity-legendary';
    if (row.rarity === '希少') return 'rarity-unique';
    if (row.rarity === '高級') return 'rarity-rare';
    return 'rarity-normal';
  }

  function getArtifactEffectRows(effects, selfOnly = false) {
    return [
      ...(effects.applied || []),
      ...(effects.conditional || [])
    ].filter(item => hasAnySourceTag(item, ['遺物', '愛用遺物']))
      .filter(item => !selfOnly || item.source === '装備遺物' || item.cardSource === '装備遺物');
  }

  function getFormationArtifactEffectRows(effects) {
    return getArtifactEffectRows(effects, false)
      .filter(item => item.source !== '装備遺物' && item.cardSource !== '装備遺物');
  }

  function isAutomaticBonusEffect(item) {
    const status = item.tags?.status || [];
    return item.bonuses
      && Object.keys(item.bonuses).length
      && status.includes('自動適用')
      && !status.includes('スキル変更');
  }

  function isVisibleDamageRelatedEffect(item) {
    if (!item.bonuses || !Object.keys(getRelevantBonusMap(item.bonuses)).length) return false;
    return isEffectRelevantToPerspective(item);
  }

  function renderArtifactBonusSummary(rows, enabled = true) {
    const summary = summarizeRelevantEffects(rows);
    const chips = Object.entries(summary || {})
      .filter(([, value]) => Number(value))
      .map(([key, value]) => `<span class="fdc-artifact-bonus-chip ${enabled ? '' : 'is-disabled'}">${escapeHtml(formatBonusMap({ [key]: value }))}</span>`);
    if (!chips.length) return '';
    return `<div class="fdc-artifact-bonus-summary">${chips.join('')}</div>`;
  }

  function renderGroupedArtifactEffectChips(rows, enabled) {
    return groupArtifactEffectRows(rows.filter(isVisibleDamageRelatedEffect))
      .map(group => renderArtifactEffectGroupChip(group, enabled))
      .join('');
  }

  function groupArtifactEffectRows(rows) {
    const groups = new Map();
    rows.forEach(row => {
      const key = [row.source, row.ownerLabel || '', row.cardName || row.label || ''].join('::');
      if (!groups.has(key)) {
        groups.set(key, {
          title: row.cardName || row.label || '遺物',
          source: row.source || '',
          ownerLabel: row.ownerLabel || '',
          rows: []
        });
      }
      groups.get(key).rows.push(row);
    });
    return Array.from(groups.values());
  }

  function renderArtifactEffectGroupChip(group, enabled) {
    const effectChips = group.rows.map(row => renderArtifactEffectMiniChip(row)).join('');
    const meta = [group.source, group.ownerLabel].filter(Boolean).join(' / ');
    return `
      <div class="fdc-artifact-effect-group ${enabled ? '' : 'is-disabled'}">
        <strong>${escapeHtml(group.title)}</strong>
        ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
        <div class="fdc-artifact-effect-group-chips">${effectChips}</div>
      </div>
    `;
  }

  function renderArtifactEffectMiniChip(item) {
    const bonusText = item.bonusText || (item.bonuses ? formatBonusMap(getRelevantBonusMap(item.bonuses)) : '');
    const checked = item.conditionKey && isConditionalEffectEnabled(item.conditionKey, item.defaultEnabled) ? ' checked' : '';
    const toggle = item.canToggle ? `<input type="checkbox" data-fdc-condition-toggle="${escapeAttr(item.conditionKey)}"${checked}>` : '';
    const label = item.label || '効果';
    return `
      <label class="fdc-artifact-effect-mini-chip ${item.canToggle ? 'is-toggleable' : ''}">
        ${toggle}
        <span>${escapeHtml(label)}</span>
        ${bonusText ? `<b>${escapeHtml(bonusText)}</b>` : ''}
      </label>
    `;
  }

  function renderArtifactEffectChip(item, enabled) {
    const bonusText = item.bonusText || (item.bonuses ? formatBonusMap(getRelevantBonusMap(item.bonuses)) : '');
    const status = (item.tags?.status || []).join(' / ');
    const meta = [item.ownerLabel, item.reason].filter(Boolean).join(' / ');
    const checked = item.conditionKey && isConditionalEffectEnabled(item.conditionKey, item.defaultEnabled) ? ' checked' : '';
    const toggle = item.canToggle ? `<input type="checkbox" data-fdc-condition-toggle="${escapeAttr(item.conditionKey)}"${checked}>` : '';
    return `
      <label class="fdc-artifact-effect-chip ${enabled ? '' : 'is-disabled'} ${item.canToggle ? 'is-toggleable' : ''}">
        ${toggle}
        <strong>${escapeHtml(item.cardName || item.label || '遺物')}</strong>
        ${item.label && item.cardName ? `<span class="fdc-artifact-effect-label">${escapeHtml(item.label)}</span>` : ''}
        ${bonusText ? `<b>${escapeHtml(bonusText)}</b>` : ''}
        ${status ? `<em>${escapeHtml(status)}</em>` : ''}
        ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
      </label>
    `;
  }

  function renderSpellCategory(context) {
    if (!el.spellCategory) return;
    const spellRows = countIds(context.formation?.spells || [])
      .map(({ id, qty }) => createCardRow(id, qty, context.state?.cards?.[id]))
      .map(row => ({ ...row, card: getCard(row.id) }))
      .filter(row => row.card?.kind === 'spell')
      .sort(compareSpellDisplayRow);
    const spellEffects = getSpellEffectRows(context.effects);
    const spellAutoEffects = spellEffects.filter(isAutomaticBonusEffect);
    const spellDetailEffects = spellEffects.filter(item => !isAutomaticBonusEffect(item));
    const enabled = view.effectSources.spell !== false;
    el.spellCategory.innerHTML = `
      <section class="fdc-spell-section">
        <h4>
          <span>編成スペルカード</span>
          <button type="button" class="fdc-spell-detail-toggle" data-fdc-spell-details-toggle>
            詳細 ${view.spellDetailsOpen ? '▲' : '▼'}
          </button>
          <span>${spellRows.length}</span>
        </h4>
        <div class="fdc-spell-strip">
          ${spellRows.length ? spellRows.map(renderSpellMini).join('') : '<p class="fdc-empty">スペルカードなし</p>'}
        </div>
        ${spellRows.length && view.spellDetailsOpen ? `
          <div class="fdc-selected-spell-list">
            ${spellRows.map(renderSelectedSpellDetailRow).join('')}
          </div>
        ` : ''}
      </section>
      <section class="fdc-artifact-effect-box ${enabled ? '' : 'is-disabled'}">
        <h4>スペル補正 <span>${enabled ? 'ON' : 'OFF'}</span></h4>
        <div class="fdc-artifact-effect-chips">
          ${renderArtifactBonusSummary(spellAutoEffects, enabled)}
          ${spellDetailEffects.length ? renderGroupedArtifactEffectChips(spellDetailEffects, enabled) : ''}
          ${!spellAutoEffects.length && !spellDetailEffects.length ? '<p class="fdc-empty">スペル補正なし</p>' : ''}
        </div>
      </section>
    `;
  }

  function renderSpellMini(row) {
    return `
      <span class="fdc-spell-mini ${getCardRarityClass({ rarity: row.card?.rarity, signature: row.card?.signature })}" title="${escapeAttr(row.name)}">
        <img src="${escapeAttr(getCardImagePath(row.card))}" alt="">
        ${row.qty > 1 ? `<b>x${escapeHtml(row.qty)}</b>` : ''}
      </span>
    `;
  }

  function compareSpellDisplayRow(a, b) {
    return compareArtifactOption(
      { ...a, rarity: a.card?.rarity, signature: a.card?.signature },
      { ...b, rarity: b.card?.rarity, signature: b.card?.signature }
    );
  }

  function renderSelectedSpellDetailRow(row) {
    const detailLines = getSelectedSpellDetailLines(row);
    return `
      <div class="fdc-selected-spell-row ${getCardRarityClass({ rarity: row.card?.rarity, signature: row.card?.signature })}">
        <span class="fdc-selected-spell-icon">
          <img src="${escapeAttr(getCardImagePath(row.card))}" alt="">
          ${row.qty > 1 ? `<b>x${escapeHtml(row.qty)}</b>` : ''}
        </span>
        <span class="fdc-selected-spell-text">
          <strong>${escapeHtml(row.name)}</strong>
          <small>${escapeHtml(`コスト${getCardCostById(row.id, row.star)} / ★${row.star}${row.qty > 1 ? ` / x${row.qty}` : ''}`)}</small>
          ${detailLines.length ? `<span class="fdc-selected-spell-effects">${detailLines.map(line => `<em>${escapeHtml(line)}</em>`).join('')}</span>` : ''}
        </span>
      </div>
    `;
  }

  function getSelectedSpellDetailLines(row) {
    const card = row.card || getCard(row.id);
    if (!card) return [];
    return [
      formatArtifactBonusLine('基礎補正', card.bonusesByStar?.[row.star - 1]),
      row.solder ? formatArtifactBonusLine(`はんだ+${row.solder}`, card.solderBonuses?.[row.solder]) : '',
      ...(card.conditionalEffects || []).map(effect => formatArtifactEffectDetail(effect, row.star))
    ].filter(Boolean);
  }

  function getSpellEffectRows(effects) {
    return [
      ...(effects.applied || []),
      ...(effects.conditional || [])
    ].filter(item => hasAnySourceTag(item, ['スペル', '愛用スペル']))
      .filter(isEffectRelevantToPerspective);
  }

  function getEnabledEffectRows(effects) {
    return [
      ...(effects.applied || []),
      ...(effects.globalStats || [])
    ].filter(item => isEffectSourceEnabled(item) && isEffectRelevantToPerspective(item));
  }

  function isEffectSourceEnabled(item) {
    const key = getEffectSourceKey(item);
    return !key || view.effectSources[key] !== false;
  }

  function isEffectRelevantToPerspective(item) {
    const bonuses = item.bonuses || {};
    if (!Object.keys(bonuses).length) return true;
    return isBonusMapRelevantToPerspective(bonuses);
  }

  function isBonusMapRelevantToPerspective(bonuses = {}) {
    const keys = Object.keys(bonuses).filter(key => Number(bonuses[key]));
    if (!keys.length) return true;
    const isDefenseMode = view.perspective === 'enemy';
    return keys.some(key => isDefenseMode ? isDefenseBonusKey(key) : isAttackBonusKey(key));
  }

  function getRelevantBonusMap(bonuses = {}) {
    const isDefenseMode = view.perspective === 'enemy';
    return Object.fromEntries(Object.entries(bonuses || {})
      .filter(([key, value]) => Number(value) && (isDefenseMode ? isDefenseBonusKey(key) : isAttackBonusKey(key))));
  }

  function summarizeRelevantEffects(rows) {
    const isDefenseMode = view.perspective === 'enemy';
    return rows.reduce((sum, row) => {
      Object.entries(row.bonuses || {}).forEach(([key, value]) => {
        if (!(isDefenseMode ? isDefenseBonusKey(key) : isAttackBonusKey(key))) return;
        sum[key] = (sum[key] || 0) + (Number(value) || 0);
      });
      return sum;
    }, {});
  }

  function isAttackBonusKey(key) {
    return [
      'atkP',
      'physicalAtkP',
      'magicAtkP',
      'critP',
      'critRateP',
      'critDmgP',
      'critDmgAddP',
      'hasteP',
      'addP',
      'normalAttackAddP',
      'basicAddP',
      'enhancedAddP',
      'skillAddP',
      'specialP',
      'otherP',
      'enemyDefDownP',
      'enemyCritResDownP',
      'enemyCritDmgResDownP'
    ].includes(key);
  }

  function isDefenseBonusKey(key) {
    return [
      'hpP',
      'defP',
      'physicalDefP',
      'magicDefP',
      'takenDmgP',
      'critResP',
      'critResAddP',
      'critDmgResP',
      'critDmgResAddP',
      'healingP',
      'hpRecoveryP',
      'spRecoveryP',
      'atkDownP',
      'attackerDmgDownP'
    ].includes(key);
  }

  function getEffectSourceKey(item) {
    const sourceTags = item.tags?.source || [];
    if (sourceTags.includes('シナジー')) return 'synergy';
    if (sourceTags.includes('遺物') || sourceTags.includes('愛用遺物')) return 'artifact';
    if (sourceTags.includes('スペル') || sourceTags.includes('愛用スペル')) return 'spell';
    if (sourceTags.includes('クレヨン') || sourceTags.includes('A3全体') || sourceTags.includes('フォロー')) return 'globalStats';
    return '';
  }

  function hasAnySourceTag(item, candidates) {
    const tags = item.tags?.source || [];
    return candidates.some(tag => tags.includes(tag));
  }

  function renderResult(context) {
    const result = calculateDamage(context);
    const currentResult = view.statMode === 'planned' && context.target?.hasPlannedSnapshot
      ? calculateDamageWithStatMode(context, 'current')
      : null;
    renderResultValue(el.result.normal, result.normal, currentResult?.normal, { type: 'number' });
    renderResultValue(el.result.crit, result.crit, currentResult?.crit, { type: 'number' });
    renderResultValue(el.result.expected, result.expected, currentResult?.expected, { type: 'number' });
    renderResultValue(el.result.critRate, result.critRate * 100, currentResult ? currentResult.critRate * 100 : null, { type: 'percent', digits: 1, showPointDiff: true });
    renderResultValue(el.result.defRate, result.defRate * 100, currentResult ? currentResult.defRate * 100 : null, { type: 'percent', digits: 2 });
    syncCritRateCapTone(result);
    renderResultDetail(context, result);
  }

  function syncCritRateCapTone(result) {
    const card = el.result.critRate?.closest('.result-card');
    if (!card) return;
    const capType = result?.detail?.caps?.critRate?.type || '';
    card.classList.toggle('is-cap-upper', capType === 'upper');
    card.classList.toggle('is-cap-lower', capType === 'lower');
    card.title = capType === 'upper'
      ? '会心率上限 80% に到達'
      : capType === 'lower'
        ? '会心率下限 5% に到達'
        : '';
  }

  function renderResultValue(element, plannedValue, currentValue = null, options = {}) {
    if (!element) return;
    if (currentValue === null || currentValue === undefined) {
      element.textContent = formatResultMetric(plannedValue, options);
      element.classList.remove('is-compare');
      return;
    }
    const planned = Number(plannedValue) || 0;
    const current = Number(currentValue) || 0;
    const diff = planned - current;
    const ratio = current ? (planned / current - 1) * 100 : planned ? Number.POSITIVE_INFINITY : 0;
    const diffText = formatResultDiff(ratio, diff, options);
    const direction = view.perspective === 'enemy' ? -diff : diff;
    const tone = direction > 0 ? 'is-positive' : direction < 0 ? 'is-negative' : 'is-neutral';
    element.classList.add('is-compare');
    element.innerHTML = `
      <span class="fdc-result-current">${escapeHtml(formatResultMetric(planned, options))}</span>
      <span class="fdc-result-before">(${escapeHtml(formatResultMetric(current, options))})</span>
      <span class="fdc-result-diff ${tone}">${escapeHtml(diffText)}</span>
    `;
  }

  function formatResultMetric(value, options = {}) {
    const num = Number(value) || 0;
    if (options.type === 'percent') return `${num.toFixed(options.digits ?? 1)}%`;
    return formatNumber(num);
  }

  function formatResultDiff(ratio, pointDiff, options = {}) {
    const ratioText = Number.isFinite(ratio)
      ? `${ratio > 0 ? '+' : ''}${ratio.toFixed(2)}%`
      : '+∞%';
    if (!options.showPointDiff) return ratioText;
    const pt = Number(pointDiff) || 0;
    const digits = options.digits ?? 1;
    return `${ratioText} (${pt > 0 ? '+' : ''}${pt.toFixed(digits)}pt)`;
  }

  function setupCollapsibleStatCategories() {
    document.querySelectorAll('.stat-category').forEach((category, index) => {
      if (category.dataset.fdcCollapsibleReady === 'true') return;
      const heading = category.querySelector(':scope > h3');
      if (!heading) return;
      category.dataset.fdcCollapsibleReady = 'true';
      const title = heading.textContent.trim();
      heading.classList.add('fdc-category-heading');
      heading.innerHTML = `
        <span>${escapeHtml(title)}</span>
        <button type="button" class="fdc-category-toggle" data-fdc-category-toggle aria-expanded="true" aria-label="${escapeAttr(title)}を閉じる">－</button>
      `;
    });
  }

  function setStatCategoryCollapsed(category, collapsed) {
    const toggle = category.querySelector('[data-fdc-category-toggle]');
    category.classList.toggle('is-collapsed', collapsed);
    if (!toggle) return;
    toggle.textContent = collapsed ? '＋' : '－';
    toggle.setAttribute('aria-expanded', String(!collapsed));
    const title = category.querySelector('.fdc-category-heading span')?.textContent || '項目';
    toggle.setAttribute('aria-label', `${title}を${collapsed ? '開く' : '閉じる'}`);
  }

  function setResultDetailOpen(open) {
    if (!el.result.detailPanel || !el.result.detailToggle) return;
    el.result.detailPanel.hidden = !open;
    el.result.detailToggle.setAttribute('aria-expanded', String(open));
    el.result.detailToggle.classList.toggle('is-open', open);
    document.body.classList.toggle('fdc-result-detail-open', open);
  }

  function renderResultDetail(context, result = calculateDamage(context)) {
    if (!el.result.detailGrid || !el.result.detailNote) return;
    const target = context.target;
    const stats = target?.stats || {};
    const attackKey = context.damageType === 'magic' ? 'magicAtk' : 'physicalAtk';
    const defenseKey = context.damageType === 'magic' ? 'magicDef' : 'physicalDef';
    const detail = result.detail || {};
    const stat = detail.stats || {};
    const mods = detail.mods || {};
    const caps = detail.caps || {};
    el.result.detailNote.textContent = target
      ? `${target.name} / ${formatStatModeLabel(target)} / ${formatGradeLabel(target)}`
      : '使徒未選択';
    const groups = [
      {
        title: '計算結果',
        rows: [
          ['通常', formatNumber(result.normal)],
          ['会心', formatNumber(result.crit)],
          ['期待値', formatNumber(result.expected)],
          ['会心率', `${(result.critRate * 100).toFixed(1)}%`],
          ['防御係数', `${(result.defRate * 100).toFixed(2)}%`]
        ]
      },
      {
        title: '基礎ステータス',
        rows: [
          ['HP', formatNumber(stats.hp)],
          ['攻撃', formatNumber(stats[attackKey])],
          ['防御', formatNumber(stats[defenseKey])],
          ['会心', formatNumber(stats.crit)],
          ['会心DMG', formatNumber(stats.critDmg)],
          ['会心抵抗', formatNumber(stats.critRes)],
          ['会心DMG抵抗', formatNumber(stats.critDmgRes)]
        ]
      },
      {
        title: '補正後ステータス',
        rows: [
          ['攻撃', formatNumber(stat.finalAtk)],
          ['防御', formatNumber(stat.finalDef)],
          ['会心', formatNumber(stat.finalCrit)],
          ['会心DMG', formatNumber(stat.finalCritDmg)],
          ['会心抵抗', formatNumber(stat.finalCritRes)],
          ['会心DMG抵抗', formatNumber(stat.finalCritDmgRes)],
          createCapDetailRow('会心率', `${(result.critRate * 100).toFixed(1)}%`, caps.critRate),
          createCapDetailRow('会心倍率', `${stat.critMult?.toFixed ? stat.critMult.toFixed(2) : formatPlainNumber(stat.critMult)}x`, caps.critMult)
        ]
      },
      {
        title: '最終補正値',
        rows: [
          ['攻撃補正', formatSignedPercent(mods.attackP)],
          ['防御補正', formatSignedPercent(mods.defenseP)],
          createCapDetailRow('与ダメ補正', `${(mods.addRate * 100).toFixed(1)}%`, caps.addRate),
          ['スキル倍率', `${formatPlainNumber(mods.skillP)}%`],
          ['タイプ補正', `${formatPlainNumber(mods.typeP)}%`],
          ['特殊補正', `${formatPlainNumber(mods.specialP)}%`],
          ['その他補正', `${formatPlainNumber(mods.otherP)}%`],
          ['会心補正', formatSignedPercent(mods.critP)],
          ['会心DMGステ補正', formatSignedPercent(mods.critDmgP)],
          ['会心率加算', formatSignedPercent(mods.critRateP)],
          ['会心DMG倍率加算', formatSignedPercent(mods.critDmgAddP)],
          ['会心率抵抗加算', formatSignedPercent(mods.critResAddP)],
          ['会心DMG抵抗加算', formatSignedPercent(mods.critDmgResAddP)]
        ]
      },
      {
        title: '現在との差分',
        rows: createCurrentPlannedDiffRows(context)
      },
      {
        title: '現在/予定ダメージ比較',
        rows: createCurrentPlannedDamageRows(context, result)
      }
    ];
    el.result.detailGrid.innerHTML = groups.map(group => `
      <section class="fdc-result-detail-group">
        <h3>${escapeHtml(group.title)}</h3>
        ${group.rows.length
          ? group.rows.map(renderResultDetailRow).join('')
          : '<p>差分なし</p>'}
      </section>
    `).join('');
  }

  function renderResultDetailRow(row) {
    const normalized = Array.isArray(row) ? { label: row[0], value: row[1] } : row;
    const classes = ['fdc-result-detail-row', normalized.className || ''].filter(Boolean).join(' ');
    const title = normalized.title ? ` title="${escapeAttr(normalized.title)}"` : '';
    return `<div class="${escapeAttr(classes)}"${title}><span>${escapeHtml(normalized.label)}</span><strong>${escapeHtml(normalized.value)}</strong></div>`;
  }

  function createCapDetailRow(label, value, cap = null) {
    if (!cap) return [label, value];
    const tone = cap.type === 'upper' ? 'is-cap-upper' : cap.type === 'lower' ? 'is-cap-lower' : 'is-cap';
    const suffix = cap.type === 'upper' ? '上限到達' : cap.type === 'lower' ? '下限到達' : 'キャップ到達';
    return {
      label,
      value,
      className: `is-capped ${tone}`,
      title: `${suffix}: ${cap.limitText || ''}`.trim()
    };
  }

  function formatSignedPercent(value, digits = 1) {
    const num = Number(value) || 0;
    return `${num > 0 ? '+' : ''}${num.toFixed(digits)}%`;
  }

  function calculateDamage(context) {
    const summary = context.summary || {};
    const isEnemyAttack = view.perspective === 'enemy';
    const attacker = getAttackMods(isEnemyAttack ? 'enemy' : 'self');
    const defender = getDefenseMods(isEnemyAttack ? 'self' : 'enemy');
    attacker.addP += getWeaknessDamageP(isEnemyAttack ? 'self' : 'enemy', context.damageType);
    applyEffectSummaryToDamageMods(summary, context, attacker, defender, isEnemyAttack);
    const baseAtk = isEnemyAttack ? readNumber(el.inputs.enemyAtk) : readNumber(el.inputs.atk);
    const baseCrit = isEnemyAttack ? readNumber(el.inputs.enemyCrit) : readNumber(el.inputs.crit);
    const baseCritDmg = isEnemyAttack ? readNumber(el.inputs.enemyCritDmg) : readNumber(el.inputs.critDmg);
    const baseDef = isEnemyAttack ? readNumber(el.inputs.selfDef) : readNumber(el.inputs.def);
    const baseCritRes = isEnemyAttack ? readNumber(el.inputs.selfCritResBase) : readNumber(el.inputs.critRes);
    const baseCritDmgRes = isEnemyAttack ? readNumber(el.inputs.selfCritDmgResBase) : readNumber(el.inputs.critDmgRes);
    const attackP = attacker.atkP - attacker.atkDownP;
    const defenseP = defender.defP - defender.defDownP;
    const critP = attacker.critP;
    const critDmgP = attacker.critDmgP;
    const critRateP = attacker.critRateP;
    const critDmgAddP = attacker.critDmgAddP;
    const finalAtk = baseAtk * (1 + attackP / 100);
    const finalCrit = baseCrit * (1 + attacker.critP / 100);
    const finalCritDmg = baseCritDmg * (1 + attacker.critDmgP / 100);
    const finalDef = Math.max(1, baseDef * (1 + defenseP / 100));
    const finalCritRes = Math.max(1, baseCritRes * (1 + (defender.critResP - defender.critResDownP) / 100));
    const finalCritDmgRes = Math.max(1, baseCritDmgRes * (1 + (defender.critDmgResP - defender.critDmgResDownP) / 100));
    const defRate = calcBaseDamageRate(finalAtk, finalDef);
    const rawAddRate = 1 + (attacker.addP - defender.takenDmgP) / 100;
    let addRate = Math.max(0.2, rawAddRate);
    const skill = Math.max(0, attacker.skill) / 100;
    const type = Math.max(0, attacker.type) / 100;
    const special = Math.max(0, attacker.special) / 100;
    const other = Math.max(0, attacker.other) / 100;
    const normal = finalAtk * defRate * skill * addRate * type * special * other;
    const baseCritRate = calcCritRate(finalCrit, finalCritRes);
    const rawCritRate = baseCritRate + attacker.critRateP / 100 - defender.critResAddP / 100;
    const critRate = clamp(rawCritRate, 0.05, 0.8);
    const baseCritMult = calcCritMultiplier(finalCritDmg, finalCritDmgRes);
    const rawCritMult = baseCritMult + attacker.critDmgAddP / 100 - defender.critDmgResAddP / 100;
    const critMult = clamp(rawCritMult, 1.2, 2.5);
    const crit = normal * critMult;
    const expected = normal * (1 - critRate) + crit * critRate;
    return {
      normal,
      crit,
      expected,
      critRate,
      defRate,
      summary,
      detail: {
        stats: {
          baseAtk,
          baseDef,
          baseCrit,
          baseCritDmg,
          baseCritRes,
          baseCritDmgRes,
          finalAtk,
          finalDef,
          finalCrit,
          finalCritDmg,
          finalCritRes,
          finalCritDmgRes,
          critMult
        },
        mods: {
          attackP,
          defenseP,
          addRate,
          skillP: attacker.skill,
          typeP: attacker.type,
          specialP: attacker.special,
          otherP: attacker.other,
          critP,
          critDmgP,
          critRateP,
          critDmgAddP,
          critResAddP: defender.critResAddP,
          critDmgResAddP: defender.critDmgResAddP
        },
        caps: {
          addRate: rawAddRate < 0.2 ? { type: 'lower', limitText: '20%' } : null,
          critRate: rawCritRate >= 0.8 ? { type: 'upper', limitText: '80%' } : rawCritRate <= 0.05 ? { type: 'lower', limitText: '5%' } : null,
          critMult: rawCritMult >= 2.5 ? { type: 'upper', limitText: '2.5x' } : rawCritMult <= 1.2 ? { type: 'lower', limitText: '1.2x' } : null
        }
      }
    };
  }

  function applyEffectSummaryToDamageMods(summary, context, attacker, defender, isEnemyAttack) {
    if (!summary) return;
    if (isEnemyAttack) {
      defender.defP += Number(summary.defP) || 0;
      defender.defP += context.damageType === 'magic' ? Number(summary.magicDefP) || 0 : Number(summary.physicalDefP) || 0;
      defender.takenDmgP += Number(summary.takenDmgP) || 0;
      defender.critResP += Number(summary.critResP) || 0;
      defender.critDmgResP += Number(summary.critDmgResP) || 0;
      defender.critResAddP += Number(summary.critResAddP) || 0;
      defender.critDmgResAddP += Number(summary.critDmgResAddP) || 0;
      attacker.atkDownP += Number(summary.atkDownP) || 0;
      attacker.atkDownP += Number(summary.attackerDmgDownP) || 0;
      return;
    }
    attacker.atkP += getActiveAttackBonus(summary, context.damageType);
    attacker.addP += getActiveAddBonus(summary, context.actionCategory);
    attacker.critRateP += Number(summary.critRateP) || 0;
    attacker.critP += Number(summary.critP) || 0;
    attacker.critDmgP += Number(summary.critDmgP) || 0;
    attacker.critDmgAddP += Number(summary.critDmgAddP) || 0;
    attacker.special += Number(summary.specialP) || 0;
    attacker.other += Number(summary.otherP) || 0;
    defender.defDownP += Number(summary.enemyDefDownP) || 0;
    defender.critResDownP += Number(summary.enemyCritResDownP) || 0;
    defender.critDmgResDownP += Number(summary.enemyCritDmgResDownP) || 0;
    defender.critResAddP += Number(summary.critResAddP) || 0;
    defender.critDmgResAddP += Number(summary.critDmgResAddP) || 0;
  }

  function getAttackMods(side) {
    if (side === 'enemy') {
      return {
        atkP: readNumber(el.inputs.enemyAtkP),
        critP: readNumber(el.inputs.enemyCritP),
        critDmgP: readNumber(el.inputs.enemyCritDmgP),
        skill: readEnemySkillMultiplier(),
        type: readNumber(el.inputs.enemyType),
        special: readNumber(el.inputs.enemySpecial),
        other: readNumber(el.inputs.enemyOther),
        addP: readNumber(el.inputs.enemyAddP) + getDebuffDamageP('enemy'),
        critRateP: readNumber(el.inputs.enemyCritRateP),
        critDmgAddP: 0,
        atkDownP: readNumber(el.inputs.enemyAttackerDmgDownP)
      };
    }
    return {
      atkP: readNumber(el.inputs.selfAtkP),
      critP: readNumber(el.inputs.selfCritP),
      critDmgP: readNumber(el.inputs.selfCritDmgP),
      skill: readNumber(el.inputs.selfSkill),
      type: readNumber(el.inputs.selfType),
      special: 100,
      other: readNumber(el.inputs.selfOther),
      addP: readNumber(el.inputs.selfAddP) + getDebuffDamageP('self'),
      critRateP: readNumber(el.inputs.selfCritRateP),
      critDmgAddP: 0,
      atkDownP: readNumber(el.inputs.selfAttackerDmgDownP)
    };
  }

  function getDebuffDamageP(side) {
    const poisonStack = side === 'enemy'
      ? readNumber(el.inputs.enemyPoisonStack)
      : readNumber(el.inputs.selfPoisonStack);
    const noise = side === 'enemy'
      ? readNumber(el.inputs.enemyNoise)
      : readNumber(el.inputs.selfNoise);
    return -11 * clamp(poisonStack, 0, 9) - (noise ? 50 : 0);
  }

  function getWeaknessDamageP(defenderSide, damageType = resolveActiveDamageType(buildContext().target)) {
    if (defenderSide === 'enemy') {
      return getEnemyPresetWeaknessAdd(getSelectedEnemyPreset(), damageType) > 0
        ? readNumber(el.inputs.enemyWeaknessP)
        : 0;
    }
    return el.selfWeaknessField?.classList.contains('is-active') ? readNumber(el.inputs.selfWeaknessP) : 0;
  }

  function getDefenseMods(side) {
    if (side === 'self') {
      return {
        defP: readNumber(el.inputs.selfDefP),
        defDownP: readNumber(el.inputs.selfDefDownP),
        takenDmgP: readNumber(el.inputs.selfTakenDmgP),
        critResP: readNumber(el.inputs.selfCritResP),
        critResDownP: readNumber(el.inputs.selfCritResDownP),
        critResAddP: 0,
        critDmgResP: readNumber(el.inputs.selfCritDmgResP),
        critDmgResDownP: readNumber(el.inputs.selfCritDmgResDownP),
        critDmgResAddP: 0
      };
    }
    return {
      defP: readNumber(el.inputs.enemyDefP),
      defDownP: readNumber(el.inputs.enemyDefDownP),
      takenDmgP: readNumber(el.inputs.enemyTakenDmgP),
      critResP: readNumber(el.inputs.enemyCritResP),
      critResDownP: readNumber(el.inputs.enemyCritResDownP),
      critResAddP: 0,
      critDmgResP: readNumber(el.inputs.enemyCritDmgResP),
      critDmgResDownP: readNumber(el.inputs.enemyCritDmgResDownP),
      critDmgResAddP: 0
    };
  }

  function readEnemySkillMultiplier() {
    const selected = Number(el.inputs.enemySkill?.value);
    return Number.isFinite(selected) && selected > 0 ? selected : 100;
  }

  function syncPerspectiveUi() {
    const defense = view.perspective === 'enemy';
    document.body.classList.toggle('is-defense-mode', defense);
    if (el.perspectiveLabel) el.perspectiveLabel.textContent = defense ? '防御' : '攻撃';
    document.querySelector('.self-side')?.classList.toggle('is-attacker', !defense);
    document.querySelector('.self-side')?.classList.toggle('is-defender', defense);
    document.querySelector('.enemy-side')?.classList.toggle('is-attacker', defense);
    document.querySelector('.enemy-side')?.classList.toggle('is-defender', !defense);
    syncRoleChip(el.selfRoleChip, !defense);
    syncRoleChip(el.enemyRoleChip, defense);
  }

  function syncRoleChip(chip, attacker) {
    if (!chip) return;
    chip.textContent = attacker ? 'Attacker' : 'Defender';
    chip.classList.toggle('is-attacker-chip', attacker);
    chip.classList.toggle('is-defender-chip', !attacker);
  }

  function syncDamageTypeUi(context) {
    const damageType = context?.damageType || resolveActiveDamageType(context?.target);
    const isMagic = damageType === 'magic';
    document.querySelectorAll('.side-panel').forEach(panel => {
      panel.classList.toggle('is-magic-damage', isMagic);
      panel.classList.toggle('is-physical-damage', !isMagic);
    });
    syncAttackTypeChip(el.selfAttackTypeChip, resolveSelfDamageType(context?.target));
    syncAttackTypeChip(el.enemyAttackTypeChip, resolveEnemyDamageType(getSelectedEnemyPreset()));
  }

  function syncAttackTypeChip(chip, damageType) {
    if (!chip) return;
    const isMagic = damageType === 'magic';
    chip.classList.toggle('is-magic', isMagic);
    chip.classList.toggle('is-physical', !isMagic);
    const image = chip.querySelector('img');
    const label = chip.querySelector('b');
    if (image) {
      image.src = isMagic ? 'img/Attack_mag.webp' : 'img/Attack_phys.webp';
      image.alt = isMagic ? '魔法' : '物理';
    }
    if (label) label.textContent = isMagic ? '魔法' : '物理';
  }

  function syncPersonalityTypeAffinity(context) {
    const selfPersonality = normalizePersonalityName(context?.target?.personality);
    const enemyPersonality = normalizePersonalityName(view.enemyPersonality);
    const rate = getPersonalityTypeRate(
      view.perspective === 'enemy' ? enemyPersonality : selfPersonality,
      view.perspective === 'enemy' ? selfPersonality : enemyPersonality
    );
    const input = view.perspective === 'enemy' ? el.inputs.enemyType : el.inputs.selfType;
    if (input) input.value = String(rate);
  }

  function getPersonalityTypeRate(attackerPersonality, defenderPersonality) {
    if (!attackerPersonality || !defenderPersonality) return 100;
    if (attackerPersonality === defenderPersonality) return 100;
    if (PERSONALITY_ADVANTAGE[attackerPersonality] === defenderPersonality) return 200;
    if (PERSONALITY_ADVANTAGE[defenderPersonality] === attackerPersonality) return 50;
    return 100;
  }

  function normalizePersonalityName(value) {
    const text = String(value || '').trim();
    return Object.prototype.hasOwnProperty.call(PERSONALITY_ADVANTAGE, text) ? text : '';
  }

  function syncEnemyPersonalityUi() {
    const personality = view.enemyPersonality || '';
    if (el.enemyPersonality) el.enemyPersonality.value = personality;
    if (el.enemyPersonalityIcon) {
      el.enemyPersonalityIcon.src = personality ? `img/性格_${personality}.webp` : 'img/性格_なし.webp';
      el.enemyPersonalityIcon.alt = personality || 'なし';
    }
  }

  function toggleApplyFloatPanel() {
    if (!el.applyFloatPanel || !el.applyFloatToggle) return;
    const open = !!el.applyFloatPanel.hidden;
    el.applyFloatPanel.hidden = !open;
    el.applyFloatToggle.setAttribute('aria-expanded', String(open));
  }

  function closeApplyFloatPanel() {
    if (!el.applyFloatPanel || !el.applyFloatToggle || el.applyFloatPanel.hidden) return;
    el.applyFloatPanel.hidden = true;
    el.applyFloatToggle.setAttribute('aria-expanded', 'false');
  }

  function syncApplyFloatUi() {
    el.applyFloatInputs.forEach(input => {
      const key = input.dataset.fdcApplySource;
      input.checked = view.effectSources[key] !== false;
    });
    el.applyFloatDots.forEach(dot => {
      const key = dot.dataset.fdcApplyDot;
      dot.classList.toggle('is-on', view.effectSources[key] !== false);
      dot.classList.toggle('is-off', view.effectSources[key] === false);
    });
    if (el.artifactEffectsToggle) el.artifactEffectsToggle.checked = view.effectSources.artifact !== false;
    const enabledCount = Object.values(view.effectSources).filter(Boolean).length;
    el.applyFloat?.classList.toggle('is-all-enabled', enabledCount === Object.keys(view.effectSources).length);
    el.applyFloat?.classList.toggle('is-all-disabled', enabledCount === 0);
    el.applyFloat?.classList.toggle('is-partial-enabled', enabledCount > 0 && enabledCount < Object.keys(view.effectSources).length);
  }

  function collectEffects({ target, formation, cards, damageType, state, actionCategory }) {
    const result = { applied: [], conditional: [], skillChanges: [], globalStats: [] };
    if (!target) return result;
    countIds(target.artifactIds).map(({ id, qty }) => createCardRow(id, qty, cards[id])).forEach(row => {
      pushBaseCardEffect(result.applied, row, '装備遺物', damageType);
      pushConditionalCardEffects(result, row, target, '装備遺物', damageType, actionCategory, formation);
    });
    pushFormationArtifactEffects(result, { target, formation, cards, damageType, actionCategory });
    countIds(formation.spells).map(({ id, qty }) => createCardRow(id, qty, cards[id])).forEach(row => {
      pushBaseCardEffect(result.applied, row, 'スペル', damageType);
      pushConditionalCardEffects(result, row, target, 'スペル', damageType, actionCategory, formation);
    });
    pushSynergyEffects(result.applied, formation, target, state);
    pushFavoriteSkillEffects(result.skillChanges, target, formation, cards);
    pushGlobalStatSnapshotEffects(result.globalStats, target, state);
    finalizeEffectTags(result);
    return result;
  }

  function finalizeEffectTags(result) {
    result.applied.forEach(item => setEffectTags(item, { status: ['自動適用'] }));
    result.conditional.forEach(item => setEffectTags(item, { status: item.tags?.status?.length ? item.tags.status : ['条件あり'] }));
    result.skillChanges.forEach(item => setEffectTags(item, { status: ['スキル変更'] }));
    result.globalStats.forEach(item => setEffectTags(item, { status: ['自動適用'], source: ['クレヨン', 'A3全体', 'フォロー'], effect: ['全体ステータス補正'] }));
  }

  function setEffectTags(item, additions = {}) {
    const inferred = inferEffectTags(item);
    item.tags = {
      source: unique([...(item.tags?.source || []), ...(inferred.source || []), ...(additions.source || [])]),
      status: unique([...(item.tags?.status || []), ...(inferred.status || []), ...(additions.status || [])]),
      target: unique([...(item.tags?.target || []), ...(inferred.target || []), ...(additions.target || [])]),
      effect: unique([...(item.tags?.effect || []), ...(inferred.effect || []), ...(additions.effect || [])])
    };
    return item;
  }

  function inferEffectTags(item) {
    const text = [item.source, item.cardName, item.label, item.reason].filter(Boolean).join(' ');
    const source = [];
    const status = [];
    const target = [];
    const effect = [];
    if (item.source === '装備遺物') source.push(/愛用/.test(text) ? '愛用遺物' : '遺物');
    if (item.source === '編成遺物') source.push(/愛用/.test(text) ? '愛用遺物' : '遺物');
    if (item.source === 'スペル') source.push(/愛用/.test(text) ? '愛用スペル' : 'スペル');
    if (item.source === '愛用スキル') source.push(item.cardSource === 'スペル' ? '愛用スペル' : '愛用遺物');
    if (item.source === '本人スキル' || item.source === '編成スキル') source.push('スキル/アサイド');
    if (item.source === '性格シナジー' || item.source === '種族シナジー') source.push('シナジー');
    if (/対象外/.test(text)) status.push('対象外');
    if (/発動条件|条件あり|ウェーブ|開始時|毎に|ごと|普通攻撃|基本攻撃|スキル使用時|敵1体/.test(text)) status.push('条件あり');
    if (/重複/.test(text)) status.push('重複不可');
    if (/前列/.test(text)) target.push('前列');
    if (/中列/.test(text)) target.push('中列');
    if (/後列/.test(text)) target.push('後列');
    if (/攻撃役割|役割=攻撃|アタッカー/.test(text)) target.push('攻撃役割');
    if (/守備|防御役割|ガード/.test(text)) target.push('守備役割');
    if (/支援|補助|サポート/.test(text)) target.push('支援役割');
    if (/物理/.test(text)) target.push('物理');
    if (/魔法/.test(text)) target.push('魔法');
    Object.keys(item.bonuses || {}).forEach(key => effect.push(...effectTagsFromBonusKey(key)));
    if (/攻撃速度/.test(text)) effect.push('攻撃速度');
    if (/スキル/.test(text)) effect.push('スキル');
    if (/アサイド/.test(text)) effect.push('アサイド');
    if (/クールタイム|CT/.test(text)) effect.push('クールタイム');
    if (/通常攻撃|基本攻撃/.test(text)) effect.push('通常攻撃');
    if (/強化攻撃/.test(text)) effect.push('強化攻撃');
    return { source: unique(source), status: unique(status), target: unique(target), effect: unique(effect) };
  }

  function effectTagsFromBonusKey(key) {
    const map = {
      hpP: ['HP'],
      atkP: ['攻撃力'],
      physicalAtkP: ['物理攻撃'],
      magicAtkP: ['魔法攻撃'],
      critP: ['会心'],
      critRateP: ['会心率'],
      critDmgP: ['会心DMGステ'],
      critDmgAddP: ['会心DMG増'],
      hasteP: ['攻撃速度'],
      addP: ['与ダメ'],
      specialP: ['特殊'],
      otherP: ['その他'],
      normalAttackAddP: ['普通攻撃ダメージ'],
      basicAddP: ['基本攻撃ダメージ'],
      enhancedAddP: ['強化攻撃ダメージ'],
      skillAddP: ['スキルダメージ'],
      healingP: ['治癒'],
      hpRecoveryP: ['HP回復'],
      spRecoveryP: ['SP回復'],
      defP: ['防御力'],
      physicalDefP: ['物理防御'],
      magicDefP: ['魔法防御'],
      takenDmgP: ['被ダメ'],
      critResP: ['会心抵抗'],
      critResAddP: ['会心率抵抗'],
      critDmgResP: ['会心DMG抵抗'],
      critDmgResAddP: ['会心DMG抵抗'],
      atkDownP: ['攻撃低下'],
      attackerDmgDownP: ['攻撃低下'],
      enemyDefDownP: ['敵防御低下'],
      enemyCritResDownP: ['敵会心抵抗低下'],
      enemyCritDmgResDownP: ['敵会心DMG抵抗低下']
    };
    return map[key] || [key];
  }

  function pushGlobalStatSnapshotEffects(list, target, state) {
    const apostleState = state?.apostles?.[target.id] || {};
    const mode = view.statMode === 'planned' ? 'planned' : 'current';
    const snapshot = mode === 'planned'
      ? apostleState.statSnapshots?.planned || apostleState.statSnapshots?.current
      : apostleState.statSnapshots?.current;
    if (!snapshot) return;
    const globalIncrease = snapshot.breakdown?.globalPercent || {};
    const globalRates = snapshot.globalPercentRates || {};
    const increaseText = formatStatMap(globalIncrease);
    const rateText = formatStatMap(globalRates, '%');
    const diffText = mode === 'planned'
      ? formatStatMap(createGlobalStatSnapshotDiff(apostleState, 'globalPercent'))
      : '';
    const label = mode === 'planned' && apostleState.statSnapshots?.planned
      ? 'クレヨン/A3/フォロー等（予定参照）'
      : 'クレヨン/A3/フォロー等（現在参照）';
    if (!increaseText && !rateText) {
      list.push({
        source: '全体ステータス補正',
        label,
        reason: '最終ステータスに反映済み。内訳データなし'
      });
      return;
    }
    list.push({
      source: '全体ステータス補正',
      label,
      bonuses: globalIncrease,
      bonusText: increaseText,
      reason: [rateText ? `補正率: ${rateText}` : '', diffText ? `現在との差分: ${diffText}` : ''].filter(Boolean).join(' / ')
    });
  }

  function createGlobalStatSnapshotDiff(apostleState = {}, key = 'globalPercent') {
    const current = apostleState.statSnapshots?.current?.breakdown?.[key] || {};
    const planned = apostleState.statSnapshots?.planned?.breakdown?.[key] || {};
    const diff = {};
    new Set([...Object.keys(current), ...Object.keys(planned)]).forEach(statKey => {
      const value = (Number(planned[statKey]) || 0) - (Number(current[statKey]) || 0);
      if (value) diff[statKey] = value;
    });
    return diff;
  }

  function pushBaseCardEffect(list, row, source, damageType) {
    const card = getCard(row.id);
    const qty = Math.max(1, Number(row.qty) || 1);
    const bonuses = scaleBonusMap(normalizeCardBonusMap(card?.bonusesByStar?.[row.star - 1], damageType), qty);
    const qtyLabel = qty > 1 ? ` x${qty}` : '';
    if (bonuses && Object.keys(bonuses).length) list.push({ source, cardName: row.name, label: `基礎補正${qtyLabel}`, bonuses });
    const solder = scaleBonusMap(normalizeCardBonusMap(card?.solderBonuses?.[row.solder], damageType), qty);
    if (row.solder > 0 && solder && Object.keys(solder).length) list.push({ source, cardName: row.name, label: `はんだ+${row.solder}${qtyLabel}`, bonuses: solder });
  }

  function pushConditionalCardEffects(result, row, target, source, damageType, actionCategory = '', formation = null) {
    const card = getCard(row.id);
    (card?.conditionalEffects || []).forEach(effect => {
      const text = getEffectText(effect);
      const item = {
        source,
        cardName: row.name,
        label: effect.label || effect.shortLabel || effect.id || '特殊効果',
        bonuses: scaleEffectBonusMap(normalizeCardEffectBonuses(effect.bonusesByStar?.[row.star - 1], damageType, text), row.qty, effect, text),
        reason: '',
        conditionKey: createConditionEffectKey(source, row, effect, '', target)
      };
      if (isSkillChangeEffect(text, effect)) {
        item.reason = effect.description || 'スキル変更系';
        result.skillChanges.push(item);
        return;
      }
      const targetReason = judgeTargetText(text, target, damageType);
      if (!targetReason.matched) {
        item.reason = targetReason.reason;
        pushConditionalEffectCandidate(result, item, false);
        return;
      }
      const actionMatch = judgeActionCondition(text, actionCategory);
      if (!actionMatch.matched) {
        item.reason = actionMatch.reason;
        pushConditionalEffectCandidate(result, item, false);
        return;
      }
      if (shouldExposeConditionalToggle(text, effect, actionMatch)) {
        item.reason = [targetReason.reason, isFavoriteCardActiveInFormation(card, formation) ? '愛用使徒編成中' : ''].filter(Boolean).join(' / ') || '発動条件あり';
        pushToggleableConditionalEffect(result, item, getConditionalDefaultEnabled(text, effect, actionMatch, card, formation));
        return;
      }
      if (item.bonuses && Object.keys(item.bonuses).length) result.applied.push(item);
    });
  }

  function pushFormationArtifactEffects(result, { target, formation, cards, damageType, actionCategory }) {
    if (!target || !formation?.rows?.length) return;
    getFormationArtifactEffectOwners(formation, cards, target).forEach(ownerRow => {
      const card = getCard(ownerRow.id);
      (card?.conditionalEffects || []).forEach(effect => {
        const text = getEffectText(effect);
        const bonuses = scaleEffectBonusMap(normalizeCardEffectBonuses(effect.bonusesByStar?.[ownerRow.star - 1], damageType, text), ownerRow.qty, effect, text);
        if (!bonuses || !Object.keys(bonuses).length) return;
        if (!canFormationArtifactAffectTarget(text)) return;
        const item = {
          source: '編成遺物',
          cardName: ownerRow.name,
          label: effect.shortLabel || effect.label || effect.id || '特殊効果',
          bonuses,
          reason: '',
          ownerLabel: ownerRow.ownerLabel,
          conditionKey: createConditionEffectKey('編成遺物', ownerRow, effect, ownerRow.ownerId, target),
          tags: { source: ['遺物'], target: [ownerRow.position, `第${ownerRow.line}列`].filter(Boolean) }
        };
        if (isSkillChangeEffect(text, effect)) return;
        const targetReason = judgeFormationArtifactTarget(text, target, ownerRow, effect, damageType);
        if (!targetReason.matched) return;
        item.reason = targetReason.reason || '編成条件一致';
        const actionMatch = judgeActionCondition(text, actionCategory);
        if (!actionMatch.matched) {
          item.reason = actionMatch.reason;
          pushConditionalEffectCandidate(result, item, false);
          return;
        }
        if (shouldExposeConditionalToggle(text, effect, actionMatch)) {
          pushToggleableConditionalEffect(result, item, getConditionalDefaultEnabled(text, effect, actionMatch));
          return;
        }
        if (item.bonuses && Object.keys(item.bonuses).length) result.applied.push(item);
      });
    });
  }

  function getFormationArtifactEffectOwners(formation, cards, target) {
    return (formation.rows || []).flatMap((row, rowIndex) =>
      (row.artifacts || []).flatMap((lineArtifacts, lineIndex) => {
        const ownerId = row.apostles?.[lineIndex] || '';
        if (!ownerId || ownerId === target.id) return [];
        const owner = getApostle(ownerId);
        const ownerName = owner?.使徒名 || ownerId;
        return countIds(lineArtifacts || []).map(({ id, qty }) => ({
          ...createCardRow(id, qty, cards[id]),
          ownerId,
          ownerName,
          position: POSITIONS[rowIndex] || '',
          line: lineIndex + 1,
          ownerLabel: `${POSITIONS[rowIndex] || ''}${lineIndex + 1} ${ownerName}`.trim()
        }));
      })
    ).filter(row => getCard(row.id)?.kind === 'artifact');
  }

  function judgeFormationArtifactTarget(text, target, ownerRow, effect, damageType) {
    if (/同列/.test(text) && ownerRow.position !== target.position) {
      return {
        matched: false,
        reason: `対象外: 同列 (${ownerRow.position}${ownerRow.line} -> ${target.position || '-'}${target.line || '-'})`
      };
    }
    if (!matchesEffectDamageType(effect, damageType, target)) {
      return { matched: false, reason: `対象外: 攻撃種別=${effect.onlyWhenDmgType}` };
    }
    const targetReason = judgeTargetText(text.replace(/同列/g, ''), target, damageType);
    if (!targetReason.matched) return targetReason;
    return {
      matched: true,
      reason: unique([targetReason.reason, /同列/.test(text) ? `${ownerRow.position}同列` : ''].filter(Boolean)).join(' / ')
    };
  }

  function canFormationArtifactAffectTarget(text) {
    if (/自身|本人|着用者/.test(text) && !/味方|全体|同列|前列|中列|後列/.test(text)) return false;
    return /味方|全体|同列|前列|中列|後列|攻撃役割|防御役割|守備|ガード|支援|補助|サポート|物理攻撃|魔法攻撃/.test(text);
  }

  function isTimedOrManualEffect(text, effect) {
    if (effect.type === 'info') return true;
    return /ウェーブ|開始時|毎に|ごと|スキル使用時|敵1体|クールタイム|CT/.test(text);
  }

  function shouldExposeConditionalToggle(text, effect, actionMatch) {
    if (effect.type === 'info') return true;
    return effect.type === 'toggle' || actionMatch.hasActionCondition || isTimedOrManualEffect(text, effect);
  }

  function getConditionalDefaultEnabled(text, effect, actionMatch, card = null, formation = null) {
    if (effect.defaultEnabled === true) return true;
    if (isFavoriteCardActiveInFormation(card, formation)) return true;
    if (effect.type === 'toggle' && !isTimedOrManualEffect(text, effect)) return true;
    return !!(actionMatch?.hasActionCondition && !isTimedOrManualEffect(text, effect));
  }

  function isFavoriteCardActiveInFormation(card, formation) {
    const favoriteName = String(card?.favoriteCharacter || '').trim();
    if (!favoriteName || !formation?.rows?.length) return false;
    const normalizedFavorite = normalizeComparableName(favoriteName);
    return (formation.rows || []).some(row =>
      (row.apostles || []).some(id => {
        const apostle = getApostle(id);
        return [apostle?.使徒名, apostle?.id, id].some(value => normalizeComparableName(value) === normalizedFavorite);
      })
    );
  }

  function normalizeComparableName(value) {
    return String(value || '').trim().replace(/\s+/g, '').toLowerCase();
  }

  function pushToggleableConditionalEffect(result, item, defaultEnabled = false) {
    if (!item.bonuses || !Object.keys(item.bonuses).length) {
      result.conditional.push(item);
      return;
    }
    const control = {
      ...item,
      canToggle: true,
      defaultEnabled: !!defaultEnabled,
      tags: {
        ...(item.tags || {}),
        status: unique([...(item.tags?.status || []), isConditionalEffectEnabled(item.conditionKey, defaultEnabled) ? '手動ON' : '手動OFF'])
      }
    };
    result.conditional.push(control);
    if (!isConditionalEffectEnabled(item.conditionKey, defaultEnabled)) return;
    result.applied.push({
      ...item,
      tags: {
        ...(item.tags || {}),
        status: unique([...(item.tags?.status || []), '手動ON'])
      }
    });
  }

  function pushConditionalEffectCandidate(result, item, defaultEnabled = false) {
    if (item.bonuses && Object.keys(item.bonuses).length) {
      pushToggleableConditionalEffect(result, item, defaultEnabled);
      return;
    }
    result.conditional.push(item);
  }

  function isConditionalEffectEnabled(key, defaultEnabled = false) {
    if (!key) return !!defaultEnabled;
    if (Object.prototype.hasOwnProperty.call(view.conditionalEffectEnabled, key)) {
      return !!view.conditionalEffectEnabled[key];
    }
    return !!defaultEnabled;
  }

  function createConditionEffectKey(source, row, effect, ownerId = '', target = null) {
    return [
      source || '',
      ownerId || row.ownerId || '',
      row.id || '',
      row.star || '',
      row.solder || '',
      effect.id || effect.label || effect.shortLabel || '',
      target ? createConditionTargetKey(target) : ''
    ].join(':');
  }

  function createConditionTargetKey(target) {
    return [
      target.id || '',
      target.position || '',
      target.line || ''
    ].join('@');
  }

  function judgeActionCondition(text, actionCategory = '') {
    const conditions = [];
    if (/通常攻撃|普通攻撃/.test(text)) conditions.push(['普通攻撃', actionCategory === '基本攻撃' || actionCategory === '強化攻撃']);
    if (/基本攻撃/.test(text)) conditions.push(['基本攻撃', actionCategory === '基本攻撃']);
    if (/強化攻撃/.test(text)) conditions.push(['強化攻撃', actionCategory === '強化攻撃']);
    if (/スキル攻撃|スキル時|スキル.*ダメージ|スキル.*与ダメ|スキル与ダメ/.test(text)) {
      conditions.push(['スキル', /低学年|高学年|アサイド/.test(actionCategory)]);
    }
    const failed = conditions.filter(([, matched]) => !matched);
    return {
      hasActionCondition: conditions.length > 0,
      matched: failed.length === 0,
      reason: failed.length ? `行動条件未選択: ${failed.map(([label]) => label).join(' / ')}` : conditions.map(([label]) => `${label}条件一致`).join(' / ')
    };
  }

  function matchesEffectDamageType(effect, damageType, target = null) {
    const only = String(effect?.onlyWhenDmgType || '').toLowerCase();
    if (!only) return true;
    const resolvedType = damageType === 'unknown' ? resolveDamageType('auto', target) : damageType;
    if (/mag|magic|魔法/.test(only)) return resolvedType === 'magic';
    if (/phys|physical|物理/.test(only)) return resolvedType === 'physical';
    return true;
  }

  function judgeTargetText(text, target, damageType = '') {
    const checks = [];
    const resolvedType = damageType || resolveDamageType('auto', target);
    if (/前列|前衛/.test(text)) checks.push(['隊列', target.position === '前列', '前列']);
    if (/中列/.test(text)) checks.push(['隊列', target.position === '中列', '中列']);
    if (/後列|後衛/.test(text)) checks.push(['隊列', target.position === '後列', '後列']);
    if (/アタッカー|攻撃ロール|攻撃役割/.test(text)) checks.push(['役割', normalizeRole(target.role) === '攻撃', '攻撃']);
    if (/ガード|守備|防御ロール|防御役割/.test(text)) checks.push(['役割', normalizeRole(target.role) === '守備', '守備']);
    if (/サポート|支援|補助/.test(text)) checks.push(['役割', normalizeRole(target.role) === '支援', '支援']);
    if (/魔法攻撃/.test(text)) checks.push(['攻撃種別', resolvedType === 'magic', '魔法']);
    if (/物理攻撃/.test(text)) checks.push(['攻撃種別', resolvedType === 'physical', '物理']);
    const failed = checks.filter(([, matched]) => !matched);
    return {
      matched: failed.length === 0,
      reason: failed.length ? `対象外: ${failed.map(([type, , value]) => `${type}=${value}`).join(' / ')}` : checks.map(([type, , value]) => `${type}=${value}`).join(' / ')
    };
  }

  function pushSynergyEffects(list, formation, target, state = {}) {
    const counts = collectSynergyCounts(formation, state);
    const personalityEffect = findSynergyEffect(typeof PERSONALITY_SYNERGIES === 'undefined' ? [] : PERSONALITY_SYNERGIES, target.personality, counts.personality[target.personality]);
    const raceEffect = findSynergyEffect(typeof RACE_SYNERGIES === 'undefined' ? [] : RACE_SYNERGIES, target.race, counts.race[target.race]);
    if (personalityEffect) list.push({ source: '性格シナジー', label: target.personality, bonuses: normalizeSynergyEffect(personalityEffect) });
    if (raceEffect) list.push({ source: '種族シナジー', label: target.race, bonuses: normalizeSynergyEffect(raceEffect) });
  }

  function normalizeSynergyEffect(effect = {}) {
    if (!effect) return {};
    const normalized = { ...effect };
    if (effect.critRateTakenDownP) {
      normalized.critResP = (Number(normalized.critResP) || 0) + Number(effect.critRateTakenDownP);
      delete normalized.critRateTakenDownP;
    }
    if (effect.critDmgTakenDownP) {
      normalized.critDmgResP = (Number(normalized.critDmgResP) || 0) + Number(effect.critDmgTakenDownP);
      delete normalized.critDmgTakenDownP;
    }
    if (effect.damageTakenDownP) {
      normalized.takenDmgP = (Number(normalized.takenDmgP) || 0) + Number(effect.damageTakenDownP);
      delete normalized.damageTakenDownP;
    }
    return Object.fromEntries(Object.entries(normalized).filter(([, value]) => Number(value)));
  }

  function pushFavoriteSkillEffects(list, target, formation, cards) {
    const apostle = getApostleSkillData(target);
    const levels = apostle?.favoriteCard?.levels || {};
    if (!Object.keys(levels).length) return;
    const allRows = [
      ...countIds(target.artifactIds).map(({ id, qty }) => ({ ...createCardRow(id, qty, cards[id]), cardSource: '装備遺物' })),
      ...countIds(formation.spells).map(({ id, qty }) => ({ ...createCardRow(id, qty, cards[id]), cardSource: 'スペル' }))
    ];
    allRows.forEach(row => {
      const card = getCard(row.id);
      if (!card?.signature || String(card.favoriteCharacter || '') !== target.name) return;
      Object.entries(levels).forEach(([level, entries]) => {
        if (row.star < Number(level)) return;
        normalizeArray(entries).forEach(entry => {
          list.push({
            source: '愛用スキル',
            cardSource: row.cardSource,
            cardName: row.name,
            label: `愛用Lv${level} ${entry.skillName || entry.skillType || ''}`,
            reason: entry.description || summarizeSkillEffects(entry.effects || entry.stats)
          });
        });
      });
    });
  }

  function summarizeEffects(rows) {
    return rows.reduce((sum, row) => {
      Object.entries(row.bonuses || {}).forEach(([key, value]) => {
        sum[key] = (sum[key] || 0) + (Number(value) || 0);
      });
      return sum;
    }, {});
  }

  function getActiveAttackBonus(summary, damageType) {
    if (damageType === 'magic') return (Number(summary.magicAtkP) || 0) + (Number(summary.atkP) || 0);
    if (damageType === 'physical') return (Number(summary.physicalAtkP) || 0) + (Number(summary.atkP) || 0);
    return Number(summary.atkP) || 0;
  }

  function getActiveAddBonus(summary, actionCategory = '') {
    let total = Number(summary.addP) || 0;
    if (actionCategory === '基本攻撃' || actionCategory === '強化攻撃') total += Number(summary.normalAttackAddP) || 0;
    if (actionCategory === '基本攻撃') total += Number(summary.basicAddP) || 0;
    if (actionCategory === '強化攻撃') total += Number(summary.enhancedAddP) || 0;
    if (/低学年|高学年|アサイド/.test(actionCategory)) total += Number(summary.skillAddP) || 0;
    return total;
  }

  function normalizeAttackBonus(bonuses, damageType) {
    if (!bonuses) return null;
    const next = { ...bonuses };
    if (next.atkP != null) {
      if (damageType === 'physical') {
        next.physicalAtkP = next.atkP;
        delete next.atkP;
      } else if (damageType === 'magic') {
        next.magicAtkP = next.atkP;
        delete next.atkP;
      }
    }
    return next;
  }

  function normalizeCardEffectBonuses(bonuses, damageType, text = '') {
    const normalized = normalizeCardBonusMap(bonuses, damageType);
    normalizeCriticalBonusKeys(normalized, text);
    if (!normalized?.addP) return normalized;
    const value = normalized.addP;
    if (/強化攻撃/.test(text)) {
      delete normalized.addP;
      normalized.enhancedAddP = (normalized.enhancedAddP || 0) + value;
    } else if (/基本攻撃/.test(text)) {
      delete normalized.addP;
      normalized.basicAddP = (normalized.basicAddP || 0) + value;
    } else if (/通常攻撃|普通攻撃/.test(text)) {
      delete normalized.addP;
      normalized.normalAttackAddP = (normalized.normalAttackAddP || 0) + value;
    } else if (/スキル攻撃|スキル.*ダメージ|スキル.*与ダメ|スキル与ダメ|スキル時/.test(text)) {
      delete normalized.addP;
      normalized.skillAddP = (normalized.skillAddP || 0) + value;
    }
    return normalized;
  }

  function normalizeCardBonusMap(bonuses, damageType) {
    const normalized = normalizeAttackBonus(bonuses, damageType);
    if (!normalized) return normalized;
    if (normalized.critDmgP != null) {
      normalized.critDmgAddP = (Number(normalized.critDmgAddP) || 0) + Number(normalized.critDmgP || 0);
      delete normalized.critDmgP;
    }
    if (normalized.critResP != null) {
      normalized.critResAddP = (Number(normalized.critResAddP) || 0) + Number(normalized.critResP || 0);
      delete normalized.critResP;
    }
    if (normalized.critDmgResP != null) {
      normalized.critDmgResAddP = (Number(normalized.critDmgResAddP) || 0) + Number(normalized.critDmgResP || 0);
      delete normalized.critDmgResP;
    }
    return normalized;
  }

  function normalizeCriticalBonusKeys(bonuses, text = '') {
    if (!bonuses) return bonuses;
    const normalizedText = String(text || '');
    if (bonuses.critRateP != null && /会心(?!率|DMG|ダメージ|抵抗)/.test(normalizedText)) {
      bonuses.critP = (Number(bonuses.critP) || 0) + Number(bonuses.critRateP || 0);
      delete bonuses.critRateP;
    }
    if (bonuses.critDmgP != null && /会心(?:ダメージ量|DMG量)/.test(normalizedText)) {
      bonuses.critDmgAddP = (Number(bonuses.critDmgAddP) || 0) + Number(bonuses.critDmgP || 0);
      delete bonuses.critDmgP;
    }
    return bonuses;
  }

  function scaleEffectBonusMap(bonuses, qty = 1, effect = null, text = '') {
    const multiplier = isNonStackingCardEffect(effect, text) ? 1 : qty;
    return scaleBonusMap(bonuses, multiplier);
  }

  function scaleBonusMap(bonuses, qty = 1) {
    if (!bonuses) return bonuses;
    const multiplier = Math.max(1, Number(qty) || 1);
    if (multiplier === 1) return bonuses;
    return Object.fromEntries(Object.entries(bonuses).map(([key, value]) => [key, (Number(value) || 0) * multiplier]));
  }

  function isNonStackingCardEffect(effect = null, text = '') {
    if (effect?.nonStacking === true) return true;
    return /スタックしない|重複(?:しない|不可|適用されません|適用されない)/.test(String(text || getEffectText(effect)));
  }

  function readMemberStats(apostleState = {}, basic = null, gradeOverride = 'saved', statMode = 'current') {
    const snapshot = getGradeAdjustedSnapshot(apostleState, basic, gradeOverride, statMode);
    const raw = snapshot?.stats
      || apostleState.finalStats
      || apostleState.stats
      || apostleState.totals
      || apostleState.calculatedStats
      || {};
    return {
      hp: readStatValue(raw, ['hp', 'HP']),
      physicalAtk: readStatValue(raw, ['physicalAtk', 'patk', '物理攻撃', '物理攻撃力']),
      magicAtk: readStatValue(raw, ['magicAtk', 'matk', '魔法攻撃', '魔法攻撃力']),
      physicalDef: readStatValue(raw, ['physicalDef', 'pdef', '物理防御', '物理防御力']),
      magicDef: readStatValue(raw, ['magicDef', 'mdef', '魔法防御', '魔法防御力']),
      crit: readStatValue(raw, ['crit', '会心']),
      critDmg: readStatValue(raw, ['critDmg', '会心DMG', '会心ダメージ']),
      critRes: readStatValue(raw, ['critRes', '会心抵抗']),
      critDmgRes: readStatValue(raw, ['critDmgRes', '会心DMG抵抗'])
    };
  }

  function getGradeAdjustedSnapshot(apostleState = {}, basic = null, gradeOverride = 'saved', statMode = 'current') {
    const mode = statMode === 'planned' ? 'planned' : 'current';
    const snapshot = mode === 'planned'
      ? apostleState.statSnapshots?.planned || apostleState.statSnapshots?.current || null
      : apostleState.statSnapshots?.current || null;
    if (gradeOverride === 'saved' || !basic || typeof TRICKCAL_SHARED_STAT_ENGINE === 'undefined') return snapshot;
    return TRICKCAL_SHARED_STAT_ENGINE.applyGradeOverrideToSnapshot(
      TRICKCAL_STAT_DATA,
      basic,
      apostleState,
      { grade: Number(gradeOverride) || 1, snapshot, mode, kind: 'damageGradeOverride' }
    );
  }

  function getDisplayGrade(apostleState = {}) {
    if (view.gradeOverride !== 'saved') return Number(view.gradeOverride) || 1;
    return Number(apostleState.grade) || 1;
  }

  function formatGradeLabel(member) {
    const grade = Number(member?.grade) || 1;
    return view.gradeOverride === 'saved' ? `学年:保存値(${grade})` : `${grade}年生`;
  }

  function formatStatModeLabel(member = null) {
    if (view.statMode !== 'planned') return '現在';
    const hasPlan = !!member?.hasPlannedSnapshot;
    return hasPlan ? '予定' : '予定なし→現在';
  }

  function createCurrentPlannedDiffRows(context) {
    if (view.statMode !== 'planned') return [];
    const target = context.target;
    if (!target || !target.hasPlannedSnapshot) return target ? [['状態', '予定なし']] : [];
    const state = context.state?.apostles?.[target.id] || {};
    const current = readMemberStats(state, getApostle(target.id), view.gradeOverride, 'current');
    const planned = readMemberStats(state, getApostle(target.id), view.gradeOverride, 'planned');
    const attackKey = context.damageType === 'magic' ? 'magicAtk' : 'physicalAtk';
    const defenseKey = context.damageType === 'magic' ? 'magicDef' : 'physicalDef';
    return [
      ['HP', planned.hp - current.hp],
      ['攻', planned[attackKey] - current[attackKey]],
      ['防', planned[defenseKey] - current[defenseKey]],
      ['会', planned.crit - current.crit],
      ['会心DMG', planned.critDmg - current.critDmg],
      ['会心抵抗', planned.critRes - current.critRes],
      ['会心DMG抵抗', planned.critDmgRes - current.critDmgRes]
    ]
      .filter(([, value]) => Number(value))
      .map(([label, value]) => [label, formatSignedNumber(value)]);
  }

  function createCurrentPlannedDamageRows(context, plannedResult) {
    if (view.statMode !== 'planned' || !context.target?.hasPlannedSnapshot) return [];
    const currentResult = calculateDamageWithStatMode(context, 'current');
    if (!currentResult) return [];
    const plannedExpected = Number(plannedResult?.expected) || 0;
    const currentExpected = Number(currentResult.expected) || 0;
    const diff = plannedExpected - currentExpected;
    const ratio = currentExpected ? (plannedExpected / currentExpected - 1) * 100 : 0;
    return [
      ['現在期待値', formatNumber(currentExpected)],
      ['予定期待値', formatNumber(plannedExpected)],
      ['差分', formatSignedNumber(Math.round(diff))],
      ['上昇率', `${ratio > 0 ? '+' : ''}${ratio.toFixed(2)}%`]
    ];
  }

  function calculateDamageWithStatMode(context, mode) {
    const target = context.target;
    if (!target) return null;
    const apostleState = context.state?.apostles?.[target.id] || {};
    const stats = readMemberStats(apostleState, getApostle(target.id), view.gradeOverride, mode);
    const saved = snapshotSelfStatInputs();
    try {
      writeSelfStatInputsForStats(context, stats);
      return calculateDamage({ ...context, target: { ...target, stats, statMode: mode } });
    } finally {
      restoreSelfStatInputs(saved);
    }
  }

  function snapshotSelfStatInputs() {
    return {
      hp: el.inputs.selfHp.value,
      atk: el.inputs.atk.value,
      selfDef: el.inputs.selfDef.value,
      crit: el.inputs.crit.value,
      critDmg: el.inputs.critDmg.value,
      critRes: el.inputs.selfCritResBase.value,
      critDmgRes: el.inputs.selfCritDmgResBase.value
    };
  }

  function restoreSelfStatInputs(saved) {
    el.inputs.selfHp.value = saved.hp;
    el.inputs.atk.value = saved.atk;
    el.inputs.selfDef.value = saved.selfDef;
    el.inputs.crit.value = saved.crit;
    el.inputs.critDmg.value = saved.critDmg;
    el.inputs.selfCritResBase.value = saved.critRes;
    el.inputs.selfCritDmgResBase.value = saved.critDmgRes;
  }

  function writeSelfStatInputsForStats(context, stats = {}) {
    const attackKey = context.damageType === 'magic' ? 'magicAtk' : 'physicalAtk';
    const defenseKey = context.damageType === 'magic' ? 'magicDef' : 'physicalDef';
    el.inputs.selfHp.value = Math.round(Number(stats.hp) || 0);
    el.inputs.atk.value = Math.round(Number(stats[attackKey]) || 0);
    el.inputs.selfDef.value = Math.round(Number(stats[defenseKey]) || 1);
    el.inputs.crit.value = Math.round(Number(stats.crit) || 0);
    el.inputs.critDmg.value = Math.round(Number(stats.critDmg) || 0);
    el.inputs.selfCritResBase.value = Math.round(Number(stats.critRes) || 1);
    el.inputs.selfCritDmgResBase.value = Math.round(Number(stats.critDmgRes) || 1);
  }

  function createCardRow(id, qty, cardState = {}) {
    const card = getCard(id);
    const star = Math.min(5, Math.max(1, Number(cardState?.star) || 1));
    return {
      id,
      qty,
      name: card?.name || id,
      star,
      solder: star >= 5 ? Math.min(2, Math.max(0, Number(cardState?.solder) || 0)) : 0
    };
  }

  function collectSynergyCounts(formation, state = {}) {
    const personality = {};
    const race = {};
    const selectedIds = formation.rows.flatMap(row => row.apostles).filter(Boolean);
    selectedIds.forEach(id => {
      const basic = getApostle(id);
      if (basic?.性格) personality[basic.性格] = (personality[basic.性格] || 0) + 1;
      if (basic?.種族) race[basic.種族] = (race[basic.種族] || 0) + 1;
    });
    applyPersonalityExtraCounts({ personality }, formation, selectedIds, state);
    return { personality, race };
  }

  function applyPersonalityExtraCounts(counts, formation, selectedIds = [], state = {}) {
    const hasUi = selectedIds.some(id => id === 'Ui' || id === 'ui' || getApostle(id)?.使徒名 === 'ウイ');
    const uiState = state.apostles?.Ui || state.apostles?.ui || {};
    if (hasUi && (Number(uiState.asideRank) || 0) >= 2) {
      counts.personality['活発'] = (counts.personality['活発'] || 0) + 1;
    }
    getFormationSpellPersonalityExtras(formation).forEach(name => {
      counts.personality[name] = (counts.personality[name] || 0) + 1;
    });
  }

  function getFormationSpellPersonalityExtras(formation = {}) {
    const personalities = ['純粋', '冷静', '狂気', '活発', '憂鬱'];
    const selectedSpellIds = new Set(Array.isArray(formation.spells) ? formation.spells.filter(Boolean) : []);
    const extras = new Set();
    (typeof CARD_LIBRARY === 'undefined' ? [] : CARD_LIBRARY.spells || []).forEach(card => {
      if (!selectedSpellIds.has(card.id)) return;
      const text = [
        card.name,
        ...(card.conditionalEffects || []).flatMap(effect => [
          effect.id,
          effect.label,
          effect.shortLabel,
          effect.description,
          ...(effect.descriptionByStar || [])
        ])
      ].filter(Boolean).join(' ');
      const personality = personalities.find(name => text.includes(`性格『${name}』`) || text.includes(`【${name}】`));
      if (personality) extras.add(personality);
    });
    return Array.from(extras);
  }

  function findSynergyEffect(table, name, count) {
    const entry = table.find(row => row.name === name);
    if (!entry?.effectsByCount) return null;
    const key = Object.keys(entry.effectsByCount).map(Number).filter(value => value <= (Number(count) || 0)).sort((a, b) => b - a)[0];
    return key ? entry.effectsByCount[key] : null;
  }

  function calcBaseDamageRate(atk, def) {
    const x = atk / Math.max(1, def);
    const rate = x >= 0.5
      ? 1.2 * (1 - 0.5 / (1 + (10 / 3) * (x - 0.5)))
      : 0.6 * (1 - ((13 / 3) * (0.5 - x)) / (1 + (10 / 3) * (0.5 - x)));
    return clamp(rate, 0.1125, 1.2);
  }

  function calcCritRate(critAtk, critDef) {
    const x = critAtk / Math.max(1, critDef);
    const rate = x >= 1 ? 0.30 + 0.50 * ((x - 1) / (x + 2)) : 0.05 + 0.25 * (x / (2 - x));
    return clamp(rate, 0.05, 0.8);
  }

  function calcCritMultiplier(critAtk, critDmgRes) {
    const x = critAtk / Math.max(1, critDmgRes);
    const mult = x >= 1 ? 1.75 + 0.85 * (x - 1) / (x + 2) : 1.75 - 1.10 * (1 - x) / (2 - x);
    return clamp(mult, 1.2, 2.5);
  }

  function resolveDamageType(requested, target) {
    if (requested === 'physical' || requested === 'magic') return requested;
    const raw = String(target?.attackType || '').toLowerCase();
    if (raw.includes('魔') || /mag|magic|matk/.test(raw)) return 'magic';
    if (raw.includes('物') || /phys|physical|patk/.test(raw)) return 'physical';
    const magicAtk = Number(target?.stats?.magicAtk) || 0;
    const physicalAtk = Number(target?.stats?.physicalAtk) || 0;
    if (magicAtk > 0 && physicalAtk <= 0) return 'magic';
    if (physicalAtk > 0 && magicAtk <= 0) return 'physical';
    if (magicAtk > physicalAtk) return 'magic';
    if (physicalAtk > magicAtk) return 'physical';
    return 'unknown';
  }

  function resolveSelfDamageType(target) {
    return resolveDamageType(view.damageType, target);
  }

  function resolveEnemyDamageType(preset = getSelectedEnemyPreset()) {
    if (view.enemyDamageType === 'physical' || view.enemyDamageType === 'magic') return view.enemyDamageType;
    if (preset?.dmgType === 'mag' || preset?.dmgType === 'magic') return 'magic';
    if (preset?.dmgType === 'phys' || preset?.dmgType === 'physical') return 'physical';
    return 'physical';
  }

  function resolveActiveDamageType(target) {
    return view.perspective === 'enemy'
      ? resolveEnemyDamageType(getSelectedEnemyPreset())
      : resolveSelfDamageType(target);
  }

  function buildFdcApostleSkillOptions(target, context) {
    const apostle = getApostleSkillData(target);
    if (!apostle) return [];
    const levels = getFdcEffectiveSkillLevels(target);
    const options = [];
    collectFdcApostleSkillSources(apostle, levels, target, context).forEach(({ skill, sourceKey, sourceLabel }, skillIndex) => {
      const category = getFdcApostleSkillCategory(skill, sourceLabel);
      const skillLevel = getFdcSkillLevelForCategory(levels, category);
      normalizeFdcArray(skill.effects).forEach((effect, effectIndex) => {
        if (!isFdcApostleAttackMultiplierEffect(effect)) return;
        const levelInfo = getFdcEffectLevelInfo(effect, skillLevel);
        if (!levelInfo || !Number.isFinite(levelInfo.value)) return;
        const kind = effect.valueKind || 'ダメージ';
        const detailText = [skill.description, effect.description, effect.effectDescription].filter(Boolean).join('\n');
        options.push({
          key: `${apostle.id || target.id}:${sourceKey || skillIndex}:${effectIndex}`,
          value: String(levelInfo.value),
          label: `${category} / ${kind} (${formatPlainNumber(levelInfo.value)}%)`,
          category,
          sourceLabel,
          skillName: skill.skillName || skill.name || '',
          kind,
          shortDetail: levelInfo.isRange ? `範囲 ${formatPlainNumber(levelInfo.min)}～${formatPlainNumber(levelInfo.max)}` : '',
          detailText: [
            skill.skillName || skill.name || '',
            detailText,
            levelInfo.isRange ? `範囲: ${levelInfo.raw || `${levelInfo.min}～${levelInfo.max}`} / 計算値: 平均 ${formatPlainNumber(levelInfo.value)}%` : ''
          ].filter(Boolean).join('\n'),
          order: getFdcApostleSkillOrder(category)
        });
      });
    });
    return options.sort((a, b) => (a.order - b.order) || a.label.localeCompare(b.label, 'ja'));
  }

  function collectFdcApostleSkillSources(apostle, levels, target, context) {
    const sources = [];
    normalizeFdcArray(apostle?.skills).forEach((skill, index) => {
      sources.push({ skill, sourceLabel: '通常', sourceKey: `base:${index}` });
    });
    getActiveFdcFavoriteLevels(apostle, target, context).forEach(level => {
      normalizeFdcArray(apostle?.favoriteCard?.levels?.[level]).forEach((skill, index) => {
        sources.push({
          skill,
          sourceLabel: `愛用品Lv${level}`,
          sourceKey: `favorite:${level}:${index}`
        });
      });
    });
    Object.entries(apostle?.aside?.levels || {}).forEach(([level, data]) => {
      if (!data || Number(level) > Number(levels.asideRank || 0)) return;
      sources.push({
        skill: {
          skillType: data.name || `アサイド${level}`,
          skillName: data.description ? String(data.description).split(/\r?\n/)[0] : `アサイド${level}`,
          description: data.description || '',
          effects: normalizeFdcArray(data.effects),
          stats: normalizeFdcArray(data.stats)
        },
        sourceLabel: `A${level}`,
        sourceKey: `aside:${level}`
      });
    });
    return sources;
  }

  function getActiveFdcFavoriteLevels(apostle, target, context) {
    const favoriteLevels = apostle?.favoriteCard?.levels || {};
    if (!Object.keys(favoriteLevels).length) return [];
    const activeCards = getFdcTargetFavoriteCards(apostle, target, context);
    if (!activeCards.length) return [];
    const maxStar = Math.max(...activeCards.map(card => Number(card.star) || 0));
    return Object.keys(favoriteLevels)
      .map(Number)
      .filter(level => Number.isFinite(level) && maxStar >= level)
      .sort((a, b) => a - b);
  }

  function getFdcTargetFavoriteCards(apostle, target, context) {
    const cards = context?.state?.cards || {};
    const targetName = String(target?.name || apostle?.name || '');
    const rows = [
      ...countIds(target?.artifactIds || []).map(({ id, qty }) => ({ ...createCardRow(id, qty, cards[id]), source: '装備遺物' })),
      ...countIds(context?.formation?.spells || []).map(({ id, qty }) => ({ ...createCardRow(id, qty, cards[id]), source: 'スペル' }))
    ];
    return rows.filter(row => {
      const card = getCard(row.id);
      return card?.signature && String(card.favoriteCharacter || '') === targetName;
    });
  }

  function renderFdcSkillLevelControls(target, levels) {
    const apostle = getApostleSkillData(target);
    const maxAsideRank = getFdcMaxAsideRank(apostle);
    const maxSkillLevel = Math.max(1, 12 + Math.min(3, Number(levels.asideRank) || 0));
    const skillOptions = Array.from({ length: maxSkillLevel }, (_, index) => index + 1)
      .map(level => `<option value="${level}">${level}</option>`)
      .join('');
    const asideOptions = Array.from({ length: maxAsideRank + 1 }, (_, index) => {
      const selected = Number(levels.asideRank) === index ? ' selected' : '';
      return `<option value="${index}"${selected}>${index ? `A${index}` : 'なし'}</option>`;
    }).join('');
    return `
      <div class="fdc-skill-levels" aria-label="スキルレベル一時設定">
        ${renderFdcSkillLevelSelect('low', '低学年', levels.low, skillOptions)}
        ${renderFdcSkillLevelSelect('high', '高学年', levels.high, skillOptions)}
        ${renderFdcSkillLevelSelect('passive', 'パッシブ', levels.passive, skillOptions)}
        <label class="fdc-skill-level-control level-aside">
          <span>アサイド</span>
          <select data-fdc-skill-level="asideRank" ${maxAsideRank ? '' : 'disabled'}>
            ${asideOptions}
          </select>
        </label>
      </div>
    `;
  }

  function renderFdcSkillLevelSelect(key, label, value, optionsHtml) {
    return `
      <label class="fdc-skill-level-control level-${escapeAttr(key)}">
        <span>${escapeHtml(label)}</span>
        <select data-fdc-skill-level="${escapeAttr(key)}">
          ${optionsHtml.replace(`value="${Number(value) || 1}"`, `value="${Number(value) || 1}" selected`)}
        </select>
      </label>
    `;
  }

  function getFdcMaxAsideRank(apostle) {
    return Object.keys(apostle?.aside?.levels || {})
      .map(Number)
      .filter(Number.isFinite)
      .reduce((max, level) => Math.max(max, level), 0);
  }

  function getFdcEffectiveSkillLevels(target) {
    const base = normalizeFdcSkillLevelConfig(target?.skillLevels || {});
    const override = view.skillLevelOverrides[target?.id] || {};
    const asideRank = Number(override.asideRank ?? target?.asideRank ?? base.asideRank) || 0;
    const maxSkillLevel = Math.max(1, 12 + Math.min(3, asideRank));
    const clampSkill = value => Math.max(1, Math.min(maxSkillLevel, Number(value) || 1));
    return {
      low: clampSkill(override.low ?? base.low),
      high: clampSkill(override.high ?? base.high),
      passive: clampSkill(override.passive ?? base.passive),
      asideRank,
      asideLevel: Number(override.asideLevel ?? target?.asideLevel ?? base.asideLevel) || 0
    };
  }

  function normalizeFdcArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return value ? [value] : [];
  }

  function normalizeFdcSkillLevelConfig(value = {}) {
    const pick = (...keys) => {
      for (const key of keys) {
        const number = Number(value?.[key]);
        if (Number.isFinite(number) && number > 0) return number;
      }
      return 1;
    };
    return {
      low: pick('low', '低学年', 'F'),
      high: pick('high', '高学年', 'S'),
      passive: pick('passive', 'パッシブ', 'P'),
      default: pick('default', 'low', '低学年', 'F'),
      asideRank: Number(value?.asideRank) || 0,
      asideLevel: Number(value?.asideLevel) || 0
    };
  }

  function getFdcSkillLevelForCategory(levels, category) {
    if (/低学年/.test(category)) return levels.low;
    if (/高学年/.test(category)) return levels.high;
    if (/パッシブ/.test(category)) return levels.passive;
    return levels.default;
  }

  function getFdcApostleSkillCategory(skill, sourceLabel = '') {
    if (String(sourceLabel || '').startsWith('愛用品')) return sourceLabel;
    const raw = String(skill?.skillType || skill?.targetSkill || skill?.name || '');
    if (/普通攻撃_基本|基本攻撃|基本/.test(raw)) return '基本攻撃';
    if (/普通攻撃_強化|強化攻撃|強化/.test(raw)) return '強化攻撃';
    if (/低学年/.test(raw)) return '低学年スキル';
    if (/高学年/.test(raw)) return '高学年スキル';
    if (/パッシブ/.test(raw)) return 'パッシブ';
    return raw || 'スキル';
  }

  function getFdcApostleSkillOrder(category) {
    if (category === '基本攻撃') return 10;
    if (category === '強化攻撃') return 20;
    if (category === '低学年スキル') return 30;
    if (category === '高学年スキル') return 40;
    if (category.startsWith('愛用品')) return 50;
    if (category === 'パッシブ') return 50;
    return 90;
  }

  function getFdcApostleSkillActionLabel(category = '') {
    if (category === '基本攻撃') return '基本';
    if (category === '強化攻撃') return '強化';
    if (category === '低学年スキル') return '低学年';
    if (category === '高学年スキル') return '高学年';
    if (category.startsWith('愛用品')) return category.replace('愛用品', '愛用');
    return category || 'スキル';
  }

  function getFdcApostleSkillTone(category = '') {
    if (category === '基本攻撃') return 'tone-basic';
    if (category === '強化攻撃') return 'tone-enhanced';
    if (category === '低学年スキル') return 'tone-low';
    if (category === '高学年スキル') return 'tone-high';
    if (category === 'パッシブ') return 'tone-passive';
    if (category.startsWith('愛用品')) return 'tone-favorite';
    return 'tone-extra';
  }

  function isFdcApostleAttackMultiplierEffect(effect) {
    const valueKind = String(effect?.valueKind || '');
    const effectType = String(effect?.effectType || '');
    const valueClass = String(effect?.valueClass || '');
    if (valueClass && valueClass !== '倍率') return false;
    if (effectType && !/攻撃|ダメージ/.test(effectType)) return false;
    if (!/ダメージ/.test(valueKind)) return false;
    if (/被ダメージ|被スキルダメージ|ダメージ量減少|回復|シールド/.test(valueKind)) return false;
    return true;
  }

  function getFdcEffectLevelInfo(effect, requestedLevel) {
    const levels = effect?.levels;
    if (levels && typeof levels === 'object') {
      const requestedKey = String(requestedLevel);
      if (levels[requestedKey] !== undefined && levels[requestedKey] !== '') return parseFdcEffectNumericValue(levels[requestedKey]);
      const availableLevels = Object.keys(levels).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
      const fallback = availableLevels.filter(level => level <= requestedLevel).pop() || availableLevels[availableLevels.length - 1];
      if (fallback !== undefined) return parseFdcEffectNumericValue(levels[String(fallback)]);
    }
    if (effect?.fixedValue !== undefined && effect.fixedValue !== '') return parseFdcEffectNumericValue(effect.fixedValue);
    return null;
  }

  function parseFdcEffectNumericValue(value) {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? { value, min: value, max: value, isRange: false } : null;
    const text = String(value).trim();
    const range = text.match(/^(-?\d+(?:\.\d+)?)\s*[～〜~\-]\s*(-?\d+(?:\.\d+)?)$/);
    if (range) {
      const min = Number(range[1]);
      const max = Number(range[2]);
      if (Number.isFinite(min) && Number.isFinite(max)) return { value: (min + max) / 2, min, max, isRange: true, raw: text };
    }
    const number = Number(text);
    return Number.isFinite(number) ? { value: number, min: number, max: number, isRange: false } : null;
  }

  function getApostle(id) {
    const data = typeof TRICKCAL_STAT_DATA === 'undefined' ? null : TRICKCAL_STAT_DATA;
    return (data?.sheets?.basicInfo || []).find(row => row.id === id) || null;
  }

  function getApostleSkillData(target) {
    const list = typeof APOSTLE_LIBRARY === 'undefined' ? [] : APOSTLE_LIBRARY;
    return list.find(apostle => apostle.id === target.id || apostle.name === target.name) || null;
  }

  function getCard(id) {
    if (typeof CARD_LIBRARY === 'undefined') return null;
    return (CARD_LIBRARY.artifacts || []).concat(CARD_LIBRARY.spells || []).find(card => card.id === id) || null;
  }

  function getApostleImage(id, name = '') {
    const key = APOSTLE_IMAGE_ALIASES[id] || APOSTLE_IMAGE_ALIASES[name] || id;
    if (!key) return FALLBACK_IMAGE;
    return `img/Chara/${key}.webp`;
  }

  function normalizeRole(value) {
    const text = String(value || '');
    if (/攻撃|アタッカー/.test(text)) return '攻撃';
    if (/守備|防御|ガード|タンク|ディフェンダー/.test(text)) return '守備';
    if (/支援|補助|サポーター/.test(text)) return '支援';
    return text;
  }

  function isSkillChangeEffect(text, effect) {
    if (hasCardEffectBonus(effect)) return false;
    return /スキル変更|クールタイム|基本攻撃強化|強化攻撃|追加発射/.test(text)
      || /スキル変更/.test(String(effect.effectType || ''));
  }

  function hasCardEffectBonus(effect) {
    return normalizeArray(effect?.bonusesByStar).some(bonus => bonus && Object.keys(bonus).length)
      || !!(effect?.bonuses && Object.keys(effect.bonuses).length)
      || normalizeArray(effect?.solderBonuses).some(bonus => bonus && Object.keys(bonus).length);
  }

  function getEffectText(effect) {
    return [
      effect.id,
      effect.label,
      effect.shortLabel,
      effect.valueKind,
      effect.valueClass,
      effect.effectType,
      effect.effectTarget,
      effect.description,
      ...(effect.descriptionByStar || [])
    ].filter(Boolean).join(' ');
  }

  function summarizeSkillEffects(effects) {
    return normalizeArray(effects).map(effect => [
      effect.valueKind,
      effect.fixedValue != null ? formatNumber(effect.fixedValue) : '',
      effect.valueClass,
      effect.effectTarget
    ].filter(Boolean).join(' ')).join(' / ');
  }

  function normalizeArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return value ? [value] : [];
  }

  function unique(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function formatBonusMap(map) {
    const labels = {
      hpP: 'HP',
      atkP: '攻撃',
      physicalAtkP: '物理攻撃',
      magicAtkP: '魔法攻撃',
      critP: '会心',
      critRateP: '会心率',
      critDmgP: '会心DMGステ',
      critDmgAddP: '会心DMG増',
      hasteP: '攻撃速度',
      addP: '与被DMG',
      normalAttackAddP: '普通攻撃ダメージ',
      basicAddP: '基本攻撃ダメージ',
      enhancedAddP: '強化攻撃ダメージ',
      skillAddP: 'スキルダメージ',
      specialP: '特殊',
      otherP: 'その他',
      healingP: '治癒',
      hpRecoveryP: 'HP回復',
      spRecoveryP: 'SP回復',
      defP: '防御',
      physicalDefP: '物理防御',
      magicDefP: '魔法防御',
      takenDmgP: '被ダメ',
      critResP: '会心抵抗',
      critResAddP: '会心率抵抗',
      critDmgResP: '会心DMG抵抗',
      critDmgResAddP: '会心DMG抵抗',
      atkDownP: '攻撃低下',
      attackerDmgDownP: '攻撃低下',
      enemyDefDownP: '敵防御低下',
      enemyCritResDownP: '敵会心抵抗低下',
      enemyCritDmgResDownP: '敵会心DMG抵抗低下'
    };
    return Object.entries(map || {})
      .filter(([, value]) => Number(value))
      .map(([key, value]) => `${labels[key] || key}${formatSignedPercentText(value)}`)
      .join(' / ');
  }

  function formatSignedPercentText(value) {
    const number = Number(value) || 0;
    return `${number > 0 ? '+' : ''}${formatPlainNumber(number)}%`;
  }

  function formatStatMap(map, unit = '') {
    const labels = {
      hp: 'HP',
      patk: '物理攻撃',
      matk: '魔法攻撃',
      pdef: '物理防御',
      mdef: '魔法防御',
      physicalAtk: '物理攻撃',
      magicAtk: '魔法攻撃',
      physicalDef: '物理防御',
      magicDef: '魔法防御',
      crit: '会心',
      critDmg: '会心DMG',
      critRes: '会心抵抗',
      critDmgRes: '会心DMG抵抗'
    };
    return Object.entries(map || {})
      .filter(([, value]) => Number(value))
      .map(([key, value]) => `${labels[key] || key}${Number(value) > 0 ? '+' : ''}${formatPlainNumber(value)}${unit}`)
      .join(' / ');
  }

  function formatEffectValue(value, unit) {
    const num = Number(value) || 0;
    return unit === '件' ? `${num}${unit}` : `${num ? '+' : ''}${formatPlainNumber(num)}${unit}`;
  }

  function formatDamageType(type) {
    if (type === 'physical') return '物理';
    if (type === 'magic') return '魔法';
    return '未判定';
  }

  function addToInput(input, value) {
    const add = Number(value) || 0;
    if (!input || !add) return;
    input.value = formatPlainNumber((readNumber(input) || 0) + add);
  }

  function readStatValue(source, keys) {
    for (const key of keys) {
      const value = Number(source?.[key]);
      if (Number.isFinite(value) && value > 0) return value;
    }
    return 0;
  }

  function readNumber(input) {
    return Number(input?.value) || 0;
  }

  function countIds(ids) {
    const counts = ids.filter(Boolean).reduce((map, id) => {
      map[id] = (map[id] || 0) + 1;
      return map;
    }, {});
    return Object.entries(counts).map(([id, qty]) => ({ id, qty }));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function formatNumber(value) {
    return Math.floor(Number(value) || 0).toLocaleString('ja-JP');
  }

  function formatSignedNumber(value) {
    const num = Math.floor(Number(value) || 0);
    return `${num > 0 ? '+' : ''}${num.toLocaleString('ja-JP')}`;
  }

  function formatPlainNumber(value) {
    const num = Number(value) || 0;
    return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/\.?0+$/, '');
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY)
      || localStorage.getItem(LEGACY_THEME_KEY)
      || localStorage.getItem('trickcal_stat_theme')
      || 'dark';
    setTheme(saved === 'light' ? 'light' : 'dark');
  }

  function toggleTheme() {
    setTheme(document.body.classList.contains('theme-dark') ? 'light' : 'dark');
  }

  function setTheme(theme) {
    document.body.classList.toggle('theme-light', theme === 'light');
    document.body.classList.toggle('theme-dark', theme !== 'light');
    if (el.themeToggle) el.themeToggle.textContent = theme === 'light' ? '☀' : '☾';
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(LEGACY_THEME_KEY, theme);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  document.addEventListener('error', event => {
    if (event.target?.matches?.('[data-fallback]')) event.target.src = FALLBACK_IMAGE;
  }, true);
})();
