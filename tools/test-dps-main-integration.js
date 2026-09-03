#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const main = fs.readFileSync(path.join(root, 'formation-damage-calc.html'), 'utf8');
const prototype = fs.readFileSync(path.join(root, 'formation-damage-dps-prototype.html'), 'utf8');
const dpsPage = fs.readFileSync(path.join(root, 'formation-dps-calc.html'), 'utf8');
const dpsPageScript = fs.readFileSync(path.join(root, 'formation-dps-calc.js'), 'utf8');
const dpsWorker = fs.readFileSync(path.join(root, 'dps-simulator-worker.js'), 'utf8');
const dashboard = fs.readFileSync(path.join(root, 'stat-dashboard.html'), 'utf8');
const calcScript = fs.readFileSync(path.join(root, 'formation-damage-calc.js'), 'utf8');
const sharedStyle = fs.readFileSync(path.join(root, 'formation-damage-dps-prototype.css'), 'utf8');
const statPrototypeStyle = fs.readFileSync(path.join(root, 'stat-prototype.css'), 'utf8');
const cache = fs.readFileSync(path.join(root, 'app-cache.js'), 'utf8');

assert.match(main, /<meta name="robots" content="index,follow">/, '本体は検索公開設定を維持する');
assert.match(main, /<link rel="canonical" href="https:\/\/innocentroad\.github\.io\/trickcal-manager\/formation-damage-calc\.html">/, '本体canonicalを維持する');
assert.ok(!main.includes('比較用DPS β') && !main.includes('noindex,nofollow'), 'prototype固有のβ/noindex文言を本体へ持ち込まない');
assert.match(main, /<body class="formation-damage-calc fdcp-page theme-dark"/, '本体は共有DPS UIのmode gateだけを追加する');
assert.ok(!main.includes('fdcp-prototype-page'), '本体をprototype routeとして扱わない');
assert.match(prototype, /<body class="formation-damage-calc fdcp-page fdcp-prototype-page theme-dark"/, 'prototypeだけを専用cache routeとして識別する');

[
  'fdcp-bottom-bar', 'fdcp-dps-detail-panel', 'fdcp-dps-result', 'fdcp-breakdown', 'fdcp-dps-detail',
  'fdcp-dps-compare-slot', 'fdcp-dps-settings-slot', 'fdcp-dps-run', 'fdcp-baseline-save', 'fdcp-baseline-clear', 'fdcp-high-mode-quick', 'fdcp-formation-timeline-mode', 'fdcp-formation-high-mode', 'fdcp-dps-external-control', 'fdcp-dps-external-event-count', 'fdcp-dps-external-input', 'fdcp-dps-runtime-settings'
].forEach(id => assert.ok(main.includes(`id="${id}"`), `本体に${id}を統合する`));
assert.ok(!main.includes('id="fdcp-total-value"') && !prototype.includes('id="fdcp-total-value"'), '本体・prototypeのcollapsed DPSカードに平均総ダメージ表示を残さない');
assert.equal((main.match(/id="fdc-result-detail-panel"/g) || []).length, 1, '通常計算の詳細sheetを複製しない');
assert.equal((main.match(/id="fdc-result-detail-toggle"/g) || []).length, 1, '通常計算の詳細buttonを複製しない');
assert.ok(main.indexOf('id="fdc-save-menu"') < main.indexOf('id="fdcp-dps-compare-slot"')
  && main.indexOf('id="fdcp-dps-compare-slot"') < main.indexOf('id="fdc-compare-float-toggle"'), '本体DPS floatは保存と通常floatの間に統合する');

assert.ok(main.includes('formation-damage-dps-prototype.css?v=20260904a'), '本体は共有DPS stylesheetのcache-bustを参照する');
assert.match(statPrototypeStyle, /\.board-global-stat-matrix tbody th > img[\s\S]*?width:\s*25px;[\s\S]*?height:\s*25px;/, '全体ボード下部の合計表アイコンを原寸表示しない');
assert.ok(main.includes('formation-damage-dps-prototype.js?v=20260904c'), '本体は共有DPS controllerの新cache-bustを参照する');
assert.ok(dpsPage.includes('app-cache.js?v=20260904a') && dashboard.includes('app-cache.js?v=20260904a'), 'DPS試験版・ステータス管理は最新app-cacheを参照する');
assert.ok(dashboard.includes('dps-trigger-policy.js?v=20260904b'), 'ステータス管理のpolicy prefetchも最新cache-bustを参照する');
assert.ok(dpsPage.includes('formation-dps-calc.js?v=20260904c') && dpsPage.includes('formation-dps-calc.css?v=20260904a'), 'DPS試験版controllerとstylesheetの新cache-bustを参照する');
assert.equal((dpsPageScript.match(/dps-simulator-worker\.js\?v=20260904a/g) || []).length, 2, 'DPS試験版の単一seed・複数seed Workerを最新cache-bustへ揃える');
assert.ok(dpsWorker.includes("importScripts('dps-simulator.js?v=20260904a')"), 'WorkerもstatusStackCount対応の最新DPS kernelを読み込む');
assert.ok(main.indexOf('dps-timing-data.js?v=20260903a') < main.indexOf('formation-damage-calc.js?v=20260904a'), 'timing dataは本体controllerより先に読む');
assert.ok(main.indexOf('dps-simulator.js?v=20260904a') < main.indexOf('formation-damage-calc.js?v=20260904a'), 'DPS simulatorは本体controllerより先に読む');
assert.ok(main.indexOf('dps-support-registry.js?v=20260827c') < main.indexOf('formation-damage-calc.js?v=20260904a'), '対応registryは本体controllerより先に読む');
assert.ok(main.indexOf('formation-damage-calc.js?v=20260904a') < main.indexOf('formation-damage-dps-prototype.js?v=20260904c'), '共有DPS controllerは通常計算snapshot APIの後に読む');
assert.ok(main.indexOf('id="fdcp-dps-runtime-settings"') < main.indexOf('id="fdcp-dps-external-control"'), '本体DPS設定フロートは時系列効果を外部条件より先に置く');
assert.ok(prototype.indexOf('id="fdcp-dps-runtime-settings"') < prototype.indexOf('id="fdcp-dps-external-control"'), 'prototype DPS設定フロートは時系列効果を外部条件より先に置く');
assert.ok(dpsPage.includes('fdc-dps-runtime-schedule-panel') && dpsPage.includes('fdc-dps-runtime-schedule-event-list') && dpsPage.includes('fdc-dps-external-event-candidate-list'), 'DPS試験版も周期設定と外部条件の候補欄を分離する');
assert.ok(dpsPage.includes('id="fdc-dps-formation-timeline-mode"') && /<option value="supportEstimate"(?: selected)?\>自動（推定）<\/option>/.test(dpsPage), 'DPS試験版も編成行動推定を設定できる');
assert.ok(/<option value="supportEstimate"(?: selected)?\>自動（推定）<\/option>/.test(main)
  && /<option value="supportEstimate"(?: selected)?\>自動（推定）<\/option>/.test(prototype), '本体・prototypeの編成行動推定を有効化する');
assert.ok(dpsPageScript.includes('runtimeScheduleEventList') && dpsPageScript.includes('externalFormationEventCandidateList') && dpsPageScript.includes('getDpsFormationCandidateSchedulePolicy') && dpsPageScript.includes('createDpsFormationEstimatedEvents'), 'DPS試験版は周期候補と外部候補を共通分類で描画し、自動推定を入力へ反映する');
assert.ok(dpsPageScript.includes('getDpsFormationBindingModes') && dpsPageScript.includes('getDpsFormationCandidateBindingModes') && dpsPageScript.includes('bindingModes:'), 'DPS試験版も保存済みbinding単位の自動・OFF設定を推定providerへ渡す');
assert.ok(sharedStyle.includes('.fdcp-dps-settings-panel .fdc-dps-runtime-schedule'), '本体DPSフロートの周期設定へ専用レイアウトを持つ');
assert.match(sharedStyle, /\.fdcp-dps-settings-panel \.fdc-dps-formation-status-setting strong,[\s\S]*?overflow:visible;[\s\S]*?white-space:normal;/, '編成由来状態効果の由来・効果名は設定カードで省略しない');
assert.ok(calcScript.includes('fdc-result-before-label') && calcScript.includes('data-compact-label'), '比較値の数値と狭幅ラベルを別要素で描画する');
assert.ok(sharedStyle.includes('fdc-result-number') && sharedStyle.includes('content:attr(data-compact-label)'), '狭幅比較値は数値を省略せず短縮ラベルを使う');

assert.match(cache, /calc: \[[\s\S]*formation-damage-dps-prototype\.css\?v=20260904a[\s\S]*dps-trigger-policy\.js\?v=20260904b[\s\S]*dps-timing-data\.js\?v=20260903a[\s\S]*dps-simulator\.js\?v=20260904a[\s\S]*dps-support-registry\.js\?v=20260827c[\s\S]*formation-damage-dps-prototype\.js\?v=20260904c[\s\S]*\]/, '通常計算routeのcache warmupへDPS依存を加える');
assert.ok(cache.includes('formation-damage-calc.js?v=20260904a'), 'cache manifestも共有controllerのcache-bustを参照する');
assert.match(cache, /dpsPrototype: \[[\s\S]*formation-damage-dps-prototype\.js\?v=20260904c[\s\S]*dps-trigger-policy\.js\?v=20260904b/, 'prototype routeも共有controllerとpolicyのcache-bustを揃える');
assert.ok(cache.includes("classList.contains('fdcp-prototype-page')") && !cache.includes("classList.contains('fdcp-page')\n      ? 'dpsPrototype'"), '本体fdcp-pageをprototype cache routeへ誤振分けしない');

console.log('DPS main integration tests passed');
