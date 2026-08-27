#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const main = fs.readFileSync(path.join(root, 'formation-damage-calc.html'), 'utf8');
const prototype = fs.readFileSync(path.join(root, 'formation-damage-dps-prototype.html'), 'utf8');
const cache = fs.readFileSync(path.join(root, 'app-cache.js'), 'utf8');

assert.match(main, /<meta name="robots" content="index,follow">/, '本体は検索公開設定を維持する');
assert.match(main, /<link rel="canonical" href="https:\/\/innocentroad\.github\.io\/trickcal-manager\/formation-damage-calc\.html">/, '本体canonicalを維持する');
assert.ok(!main.includes('比較用DPS β') && !main.includes('noindex,nofollow'), 'prototype固有のβ/noindex文言を本体へ持ち込まない');
assert.match(main, /<body class="formation-damage-calc fdcp-page theme-dark"/, '本体は共有DPS UIのmode gateだけを追加する');
assert.ok(!main.includes('fdcp-prototype-page'), '本体をprototype routeとして扱わない');
assert.match(prototype, /<body class="formation-damage-calc fdcp-page fdcp-prototype-page theme-dark"/, 'prototypeだけを専用cache routeとして識別する');

[
  'fdcp-bottom-bar', 'fdcp-dps-detail-panel', 'fdcp-dps-result', 'fdcp-breakdown', 'fdcp-dps-detail',
  'fdcp-dps-compare-slot', 'fdcp-dps-settings-slot', 'fdcp-dps-run', 'fdcp-baseline-save', 'fdcp-baseline-clear'
].forEach(id => assert.ok(main.includes(`id="${id}"`), `本体に${id}を統合する`));
assert.ok(!main.includes('id="fdcp-total-value"') && !prototype.includes('id="fdcp-total-value"'), '本体・prototypeのcollapsed DPSカードに平均総ダメージ表示を残さない');
assert.equal((main.match(/id="fdc-result-detail-panel"/g) || []).length, 1, '通常計算の詳細sheetを複製しない');
assert.equal((main.match(/id="fdc-result-detail-toggle"/g) || []).length, 1, '通常計算の詳細buttonを複製しない');
assert.ok(main.indexOf('id="fdc-save-menu"') < main.indexOf('id="fdcp-dps-compare-slot"')
  && main.indexOf('id="fdcp-dps-compare-slot"') < main.indexOf('id="fdc-compare-float-toggle"'), '本体DPS floatは保存と通常floatの間に統合する');

assert.ok(main.includes('formation-damage-dps-prototype.css?v=20260828a'), '本体は共有DPS stylesheetの新cache-bustを参照する');
assert.ok(main.includes('formation-damage-dps-prototype.js?v=20260828c'), '本体は共有DPS controllerの新cache-bustを参照する');
assert.ok(main.indexOf('dps-timing-data.js?v=20260827b') < main.indexOf('formation-damage-calc.js?v=20260828b'), 'timing dataは本体controllerより先に読む');
assert.ok(main.indexOf('dps-simulator.js?v=20260827n') < main.indexOf('formation-damage-calc.js?v=20260828b'), 'DPS simulatorは本体controllerより先に読む');
assert.ok(main.indexOf('dps-support-registry.js?v=20260827c') < main.indexOf('formation-damage-calc.js?v=20260828b'), '対応registryは本体controllerより先に読む');
assert.ok(main.indexOf('formation-damage-calc.js?v=20260828b') < main.indexOf('formation-damage-dps-prototype.js?v=20260828c'), '共有DPS controllerは通常計算snapshot APIの後に読む');

assert.match(cache, /calc: \[[\s\S]*formation-damage-dps-prototype\.css\?v=20260828a[\s\S]*dps-timing-data\.js\?v=20260827b[\s\S]*dps-simulator\.js\?v=20260827n[\s\S]*dps-support-registry\.js\?v=20260827c[\s\S]*formation-damage-dps-prototype\.js\?v=20260828c[\s\S]*\]/, '通常計算routeのcache warmupへDPS依存を加える');
assert.ok(cache.includes('formation-damage-calc.js?v=20260828b'), 'cache manifestも共有controllerの新cache-bustを参照する');
assert.ok(cache.includes("classList.contains('fdcp-prototype-page')") && !cache.includes("classList.contains('fdcp-page')\n      ? 'dpsPrototype'"), '本体fdcp-pageをprototype cache routeへ誤振分けしない');

console.log('DPS main integration tests passed');
