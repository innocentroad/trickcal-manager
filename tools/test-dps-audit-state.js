'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'formation-dps-calc.js'), 'utf8');
const marker = '  function getRuntimeAuditState(';
const start = source.indexOf(marker);
assert.notEqual(start, -1, 'getRuntimeAuditState が formation-dps-calc.js に存在する');
const end = source.indexOf('\n  function ', start + marker.length);
assert.notEqual(end, -1, 'getRuntimeAuditState の終端を取得できる');

const context = {};
vm.runInNewContext(`
  function formatNumber(value) { return String(value); }
  ${source.slice(start + 2, end)}
  this.api = { getRuntimeAuditState };
`, context);

const unsupported = context.api.getRuntimeAuditState({
  runtimeManaged: true,
  unsupportedRuntimeTrigger: true,
  reason: 'DPS未対応の発動条件: 自身HP以下到達時'
}, 'lowSkill', null, true);

assert.equal(unsupported.label, '未対応', '未対応条件をDPS自動として表示しない');
assert.equal(unsupported.className, 'is-runtime-waiting', '未対応条件は待機表示へ分類する');
assert.match(unsupported.title, /自身HP以下到達時/, '未対応となった具体的な条件を監査へ残す');

const formationExternal = context.api.getRuntimeAuditState({
  runtimeManaged: true,
  externalActionRequired: true
}, 'highSkill', null, true);
assert.equal(formationExternal.label, '外部待ち', '編成使徒の未計上行動は外部待ちを維持する');

const damageSource = fs.readFileSync(path.resolve(__dirname, '..', 'formation-damage-calc.js'), 'utf8');
function extractDamageFunction(name) {
  const functionMarker = `  function ${name}(`;
  const functionStart = damageSource.indexOf(functionMarker);
  assert.notEqual(functionStart, -1, `${name} が formation-damage-calc.js に存在する`);
  const functionEnd = damageSource.indexOf('\n  function ', functionStart + functionMarker.length);
  assert.notEqual(functionEnd, -1, `${name} の終端を取得できる`);
  return damageSource.slice(functionStart + 2, functionEnd);
}

const damageContext = {};
vm.runInNewContext(`
  function normalizeFdcArray(value) { return Array.isArray(value) ? value : value ? [value] : []; }
  function isDpsUnsupportedRuntimeTrigger(effect, fallbackText) {
    return /HP以下|被弾時|撃破時/.test([effect.triggerType, fallbackText].filter(Boolean).join(' '));
  }
  ${extractDamageFunction('isDpsUnsupportedEffectRow')}
  ${extractDamageFunction('createDpsRuntimeSafeActionContext')}
  ${extractDamageFunction('createDpsRuntimeDuplicateWarnings')}
  ${extractDamageFunction('normalizeDpsExternalTriggerType')}
  this.api = { createDpsRuntimeSafeActionContext, createDpsRuntimeDuplicateWarnings, normalizeDpsExternalTriggerType };
`, damageContext);

const safeContext = damageContext.api.createDpsRuntimeSafeActionContext({
  effects: {
    applied: [
      { effectId: 'always', triggerType: '戦闘開始時' },
      { effectId: 'hp', triggerType: '自身HP以下到達時' }
    ],
    globalStats: [{ effectId: 'global' }],
    conditional: [{ effectId: 'hit', condition: '被弾時' }]
  }
});
assert.deepEqual(
  Array.from(safeContext.effects.applied, row => row.effectId),
  ['always'],
  '未対応の明示条件をDPS基礎プロファイルから除外する'
);
assert.deepEqual(
  Array.from(safeContext.effects.globalStats, row => row.effectId),
  ['global'],
  '無条件の全体補正はDPS基礎プロファイルへ維持する'
);
assert.equal(safeContext.effects.conditional.length, 0,
  '旧形式でも発生時刻を再現できない被弾条件を常時適用しない');

const duplicateWarnings = Array.from(damageContext.api.createDpsRuntimeDuplicateWarnings({
  attackSpeedEffects: [
    { id: 'artifact_dragonlight_sword_e01', sourceId: 'self:artifact:slot1', mode: 'periodicStack', hasteP: 5 },
    { id: 'artifact_dragonlight_sword_e01', sourceId: 'self:artifact:slot1', mode: 'periodicStack', hasteP: 5 },
    { id: 'artifact_dragonlight_sword_e01', sourceId: 'ally:artifact:slot1', mode: 'periodicStack', hasteP: 5 }
  ]
}));
assert.equal(duplicateWarnings.length, 1, '同一発生元の完全重複だけを警告する');
assert.match(duplicateWarnings[0], /重複/, '完全重複を重複警告として分類する');

const collisionWarnings = Array.from(damageContext.api.createDpsRuntimeDuplicateWarnings({
  damageBuffEffects: [
    { id: 'sample_e01', sourceId: 'self:skill', mode: 'actionTimed', modifiers: { addP: 10 } },
    { id: 'sample_e01', sourceId: 'self:skill', mode: 'actionTimed', modifiers: { addP: 20 } }
  ]
}));
assert.equal(collisionWarnings.length, 1, '同一ID・同一発生元で内容が違う場合も検出する');
assert.match(collisionWarnings[0], /内容衝突/, '内容差をID衝突として分類する');

assert.equal(damageContext.api.normalizeDpsExternalTriggerType('自身HP以下到達時'), 'HP閾値',
  'HP条件を手動外部イベントの共通種別へ正規化する');
assert.equal(damageContext.api.normalizeDpsExternalTriggerType('豆乳シールド破壊時'), 'シールド破壊時',
  '固有名付きシールド破壊条件を共通種別へ正規化する');
assert.equal(damageContext.api.normalizeDpsExternalTriggerType('被ダメージ時'), '被弾時',
  '被ダメージ条件を被弾イベントへ正規化する');

console.log('DPS audit state tests passed');
