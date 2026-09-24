(() => {
  'use strict';

  const PERSONALITY_NAMES = Object.freeze(['純粋', '冷静', '狂気', '活発', '憂鬱']);
  const RESONANCE_PERSONALITY = '共鳴';
  const PERSONALITY_SET = new Set(PERSONALITY_NAMES);
  const PERSONALITY_COLORS = Object.freeze({ 純粋: '#3cb371', 冷静: '#1e90ff', 狂気: '#dc143c', 活発: '#daa520', 憂鬱: '#6a5acd' });

  function normalizeSelection(value) {
    const normalized = String(value ?? '').trim();
    return PERSONALITY_SET.has(normalized) ? normalized : null;
  }

  function normalizeStoredSelection(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  function isResonancePersonality(value) {
    return String(value ?? '').trim() === RESONANCE_PERSONALITY;
  }

  function getPersonalityOptions(source) {
    const basic = source && typeof source === 'object' ? source : { personality: source };
    const base = String(basic.personality ?? basic.性格 ?? '').trim();
    const specified = Object.hasOwn(basic, 'personalityOptions') || Object.hasOwn(basic, '性格候補');
    if (!specified) {
      if (isResonancePersonality(base)) return [...PERSONALITY_NAMES];
      if (PERSONALITY_SET.has(base) || (!base && !basic.id && !basic.使徒名)) return [];
      throw new Error(`性格候補が必要です: ${basic.id || basic.使徒名 || base}`);
    }
    const options = basic.personalityOptions ?? basic.性格候補;
    if (!Array.isArray(options) || options.length < 2 || options.length > 5
      || options.some(value => typeof value !== 'string' || !PERSONALITY_SET.has(value))
      || new Set(options).size !== options.length
      || PERSONALITY_SET.has(base) || !base) {
      throw new Error(`性格候補が不正です: ${basic.id || basic.使徒名 || base}`);
    }
    return [...options];
  }

  function resolveFormationPersonality(source, selection) {
    const basic = source && typeof source === 'object' ? source : { personality: source };
    const base = String(basic.personality ?? basic.性格 ?? '').trim();
    const options = getPersonalityOptions(basic);
    const isSelectable = options.length > 0;
    const originalSelection = normalizeStoredSelection(selection);
    const validSelection = originalSelection && options.includes(originalSelection) ? originalSelection : null;
    return {
      basePersonality: base,
      personalityOptions: options,
      originalSelection,
      effectivePersonality: isSelectable ? validSelection : (PERSONALITY_SET.has(base) ? base : null),
      isSelectable,
      isResonance: isResonancePersonality(base),
      invalidSelection: isSelectable && !!originalSelection && !validSelection,
      needsSelection: isSelectable && !validSelection
    };
  }

  function getPersonalityOptionGradient(options) {
    const colors = getPersonalityOptionColors(options);
    if (colors.length === 2) {
      return `linear-gradient(to bottom right, color-mix(in srgb, ${colors[0]} 42%, var(--personality-gradient-base, white)) 50%, color-mix(in srgb, ${colors[1]} 42%, var(--personality-gradient-base, white)) 50%)`;
    }
    return colors.length > 1 ? `linear-gradient(135deg, ${colors.map(color => `color-mix(in srgb, ${color} 42%, var(--personality-gradient-base, white))`).join(', ')})` : '';
  }

  function getPersonalityOptionFrameGradient(options) {
    if (options.length !== 2) return '';
    const colors = getPersonalityOptionColors(options);
    return colors.every(Boolean)
      ? `linear-gradient(to bottom right, ${colors[0]} 50%, ${colors[1]} 50%)`
      : '';
  }

  function getPersonalityOptionStyle(options) {
    const background = getPersonalityOptionGradient(options);
    if (!background || options.length === 5) return '';
    const frame = getPersonalityOptionFrameGradient(options);
    const colors = getPersonalityOptionColors(options);
    return `--personality-options-bg: ${background};${frame ? ` --personality-options-frame: ${frame}; --personality-option-first: ${colors[0]}; --personality-option-second: ${colors[1]};` : ''}`;
  }

  function getPersonalityOptionColors(options) {
    return options.map(name => PERSONALITY_COLORS[name]).filter(Boolean);
  }

  const api = Object.freeze({
    PERSONALITY_NAMES,
    RESONANCE_PERSONALITY,
    normalizeSelection,
    normalizeStoredSelection,
    isResonancePersonality,
    getPersonalityOptions,
    getPersonalityOptionGradient,
    getPersonalityOptionFrameGradient,
    getPersonalityOptionColors,
    getPersonalityOptionStyle,
    resolveFormationPersonality
  });

  globalThis.TRICKCAL_FORMATION_PERSONALITY = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
