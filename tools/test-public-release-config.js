#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const configSource = fs.readFileSync(path.join(root, 'public-release-config.js'), 'utf8');
const statEngineSource = fs.readFileSync(path.join(root, 'stat-engine.js'), 'utf8');
const statPrototypeSource = fs.readFileSync(path.join(root, 'stat-prototype.js'), 'utf8');
const damageCalcSource = fs.readFileSync(path.join(root, 'formation-damage-calc.js'), 'utf8');
const cacheSource = fs.readFileSync(path.join(root, 'app-cache.js'), 'utf8');

const context = { window: {} };
vm.runInNewContext(configSource, context, { filename: 'public-release-config.js' });
const release = context.window.TRICKCAL_PUBLIC_RELEASE;

assert.equal(release.isAsideEnabled('kidian'), false, 'ギデオンのアサイドを公開無効化する');
assert.equal(release.isAsideEnabled('KIDIAN'), false, 'アサイドIDの大文字小文字を吸収する');
assert.equal(release.isAsideEnabled('sylla'), true, '未指定のアサイドは公開有効のままにする');

const statContext = { window: context.window };
vm.runInNewContext(statEngineSource, statContext, { filename: 'stat-engine.js' });
const engine = statContext.window.TRICKCAL_SHARED_STAT_ENGINE;
const totals = {
  hp: 100,
  patk: 100,
  matk: 100,
  pdef: 100,
  mdef: 100,
  crit: 100,
  critDmg: 100,
  critRes: 100,
  critDmgRes: 100
};
const blockedBasic = { id: 'kidian', レア度: 3, 攻撃タイプ: '物理' };
const blockedState = { asideRank: 3, skillLevels: { low: 1, high: 1, passive: 1 } };
const noAsidePower = engine.calculateCombatPower(blockedBasic, { ...blockedState, asideRank: 0 }, totals);
const blockedPower = engine.calculateCombatPower(blockedBasic, blockedState, totals);
assert.equal(blockedPower, noAsidePower, '無効化したアサイドの戦闘力補正を止める');

assert.match(statPrototypeSource, /function hasAsideEffects\(id\) \{[\s\S]*isPublicAsideEnabled\(id\)/, 'ステータス画面のアサイド表示を公開判定へ接続する');
assert.match(damageCalcSource, /function getFdcEffectiveSkillLevels\(target\) \{[\s\S]*isPublicAsideEnabled\(target\)/, '本体DPSのアサイドスキルレベルを公開判定へ接続する');
assert.ok(cacheSource.includes('public-release-config.js?v=20260828a'), '公開リリース設定をcache warmupへ追加する');

console.log('Public release config tests passed');
