#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'formation-damage-dps-prototype.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'formation-damage-dps-prototype.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'formation-damage-dps-prototype.css'), 'utf8');
const appCache = fs.readFileSync(path.join(root, 'app-cache.js'), 'utf8');

[
  'fdcp-bottom-bar', 'fdcp-dps-detail-panel', 'fdcp-dps-run', 'fdcp-baseline-save', 'fdcp-baseline-clear',
  'fdc-result-normal', 'fdc-result-detail-panel', 'fdc-target-preview', 'fdc-formation-picker', 'fdc-self-skill',
  'fdcp-sparkline', 'fdcp-breakdown', 'fdcp-dps-settings-toggle', 'fdcp-dps-settings-panel', 'fdcp-dps-compare-toggle', 'fdcp-dps-compare-panel',
  'fdcp-auto-run', 'fdcp-high-mode', 'fdcp-high-mode-quick', 'fdcp-duration', 'fdcp-trials', 'fdcp-seed', 'fdcp-dps-detail', 'fdcp-dps-detail-grid', 'fdcp-dps-recalc-indicator'
].forEach(id => assert.ok(html.includes(`id="${id}"`), `${id} is present`));
assert.ok(html.includes('id="fdcp-provisional-badge"'), '暫定対応は下バー内の常時視認badgeを持つ');
assert.ok(!html.includes('id="fdcp-total-value"'), 'collapsed DPSカードに平均総ダメージ表示を残さない');
assert.ok(!script.includes('fdcp-total-value') && !/elements\.total(?![A-Za-z])/.test(script), 'collapsed DPSカードの総ダメージDOM参照・更新を残さない');
assert.ok(script.includes("['平均総ダメージ', formatDamage(aggregate.totalExpectedDamage)]"), '平均総ダメージはDPS詳細に残す');
assert.ok(css.includes('.fdcp-provisional-badge') && css.includes('position:absolute'), '暫定badgeは固定bar高を増やさない');
assert.ok(!html.includes('id="fdcp-baseline-compare"'), '手動の現在と比較ボタンを残さない');
assert.ok(html.includes('data-fdcp-mode="single"'), '通常計算タブを持つ');
assert.ok(html.includes('data-fdcp-mode="dps"'), '比較用DPSタブを持つ');
assert.ok(html.includes('class="fdcp-mode-tabs"'), 'タブはprototype barの付箋コンテナを持つ');
assert.ok(html.indexOf('id="fdcp-bottom-bar"') < html.indexOf('id="fdcp-dps-detail-panel"'), 'DPS詳細はbottom bar内に置く');
assert.ok(css.includes('grid-template-rows:repeat(5,minmax(0,1fr))'), 'collapsed DPSは5行tableを持つ');
assert.ok(css.includes('--fdcp-collapsed-bar-height:5.35rem') && css.includes('--fdcp-dps-panel-height:var(--fdcp-collapsed-bar-height)') && css.includes('height:var(--fdcp-dps-panel-height)'), '通常/DPSは共通の固定コンパクト高さtokenを持つ');
assert.match(css, /data-mode="single"[^\{]*\.bottom-results-grid[^\{]*\{[^}]*height:var\(--fdcp-collapsed-bar-height\)[^}]*min-height:var\(--fdcp-collapsed-bar-height\)[^}]*max-height:var\(--fdcp-collapsed-bar-height\)/, '通常計算もDPSと同じcollapsed高さに固定する');
assert.match(css, /data-mode="single"[^\{]*\.bottom-results-grid \.result-card[^\{]*\{[^}]*width:100%; max-width:none; min-width:0;/, '通常計算の各カードはgrid列幅へ伸び、旧スマホmax-widthを残さない');
assert.match(css, /fdc-result-hp-rate\[hidden\][^\{]*\{ display:flex; visibility:hidden;/, 'HP表示の有無で通常計算カードの予約行が消えない');
assert.match(css, /\.value\.is-compare[^\{]*\{ display:grid; align-content:center; min-height:0; overflow:hidden;/, '比較時の複数行値も固定カード内に収める');
assert.ok(css.includes('--fdcp-breakdown-columns:minmax(2.7rem,.62fr) minmax(0,1.38fr) minmax(0,1.08fr) minmax(3.15rem,.54fr) minmax(2.7rem,.46fr)'), '5行共通の行動/DPS/差分/構成比/回数列を持つ');
assert.ok(!css.includes('grid-template-columns:max-content minmax(0,clamp(72px,15vw,146px))'), '行ごとにmax-content解決する旧列定義を残さない');
assert.ok(css.includes('padding:0 5px') && css.includes('gap:var(--fdcp-dps-row-gap) 4px'), '5行チップの上下余白と行間を詰める');
assert.ok(css.includes('font-size:.69rem') && css.includes('font-weight:850'), '構成比と回数を必要以上に小さく細くしない');
assert.match(css, /width:min\(100%,1200px\)[\s\S]*?margin:0 auto/, 'DPS下バーは通常計算と同じ最大幅に収める');
assert.match(css, /border-radius:999px/, '各行をチップ風にする');
assert.ok(css.includes('[data-fdcp-breakdown="basicAttack"]') && css.includes('#64748b 13%') && css.includes('#64748b 38%'), '基本チップは既存tone-basicのslate系を薄い背景・枠線に使う');
assert.ok(css.includes('[data-fdcp-breakdown="enhancedAttack"]') && css.includes('#f97316 13%') && css.includes('#f97316 38%'), '強化チップは既存tone-enhancedのorange系を薄い背景・枠線に使う');
assert.ok(css.includes('[data-fdcp-breakdown="lowSkill"]') && css.includes('#22c55e 13%') && css.includes('#22c55e 38%'), '低学年チップは既存tone-lowのgreen系を薄い背景・枠線に使う');
assert.ok(css.includes('[data-fdcp-breakdown="highSkill"]') && css.includes('#3b82f6 13%') && css.includes('#3b82f6 38%'), '高学年チップは既存tone-highのblue系を薄い背景・枠線に使う');
assert.ok(css.includes('[data-fdcp-breakdown="other"]') && css.includes('#14b8a6 13%') && css.includes('#14b8a6 38%'), 'その他チップは既存tone-extraのteal系を薄い背景・枠線に使う');
assert.ok(css.includes('grid-row:1 / -1'), '全体カードは5行を縦結合する');
assert.match(css, /\.fdcp-dps-primary strong[^\{]*\{[^}]*width:100%; max-width:100%; min-width:0;/, 'DPS全体値は狭いカード内で先頭桁を欠かさず省略する');
assert.match(css, /fdcp-mode-tabs[^\{]*\{[^}]*top:calc\(-1\.7rem - 1px\)[^}]*left:max\([^}]*\)[^}]*display:flex/, '全幅で結果タブを下バー上端の横向き付箋にする');
assert.ok(!css.includes('var(--fdcp-mode-tabs-gutter)') && css.includes('writing-mode:horizontal-tb'), '上端付箋化後は通常/DPS双方にタブ用の横幅gutterを残さない');
assert.ok(css.includes('.fdcp-dps-compare-slot { grid-column:2; }') && css.includes('.fdcp-dps-settings-slot { grid-column:3; }'), 'DPS比較・設定floatは保存の右側2 slotを使う');
assert.ok(css.includes('.fdcp-dps-float-slot { position:relative;') && css.includes('.fdcp-dps-float-slot .fdcp-float-panel { right:0; }'), 'DPS popoverは各toggleのslotをanchorにする');
assert.ok(css.includes('fdc-card-cost-controller') && css.includes('+ .45rem') && css.includes('fdc-result-detail-open'), '左タブ化に伴いcoin・floatを通常の上端余白へ戻す');
assert.ok(!css.includes('.fdcp-dps-drawer') && !css.includes('.fdcp-dps-top') && !css.includes('.fdcp-quick-high') && !css.includes('.fdcp-advanced-controls'), '削除済みDPS DOM専用CSSを残さない');
assert.ok(!html.includes('fdcp-dps-drawer'), '旧fixed drawerをHTMLに残さない');
assert.ok(css.includes('.fdcp-bottom-bar[data-mode="single"] .fdcp-high-mode-note { display:none !important; }') && css.includes('.fdcp-high-mode-note[data-fdcp-high-mode="auto"]'), '高学年付箋はDPS modeだけに表示し、AUTO状態を強調する');
assert.ok(script.includes('highModeQuick') && script.includes('syncHighModeQuickControl') && script.includes("elements.highMode.value = elements.highMode.value === 'auto' ? 'disabled' : 'auto'"), '高学年付箋は既存高学年設定と同じ値を切り替える');
assert.ok(!html.includes('fdcp-advanced-controls'), 'drawerに高度設定を重複して置かない');
assert.ok(html.includes('class="result-card fdc-detail-toggle fdcp-detail-button"'), 'DPS詳細ボタンは通常計算と同じresult-card/fdc-detail-toggle構造を使う');
assert.ok(html.includes('class="fdc-result-detail-head"') && html.includes('class="fdc-result-detail-grid"'), 'DPS詳細は通常計算と同じ詳細シートのhead/gridレイアウトを使う');
assert.ok(script.includes("setDpsDetailOpen(elements.drawer.hidden)") && script.includes("dpsDetailToggle.classList.toggle('is-open', open)"), 'DPS詳細は通常計算と同様に詳細ボタンで開閉し、開いた状態をbuttonへ反映する');
assert.ok(css.includes('--fdcp-detail-column:clamp(2.18rem,6vw,4.6rem)'), '通常/DPSの詳細列幅は共通tokenで定義する');
assert.match(css, /bottom-results-grid[^\{]*\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/, '通常計算の数値カードは詳細列を除いた幅を使う');
assert.match(css, /\.fdcp-result-panel[^\{]*\{[^}]*grid-template-columns:minmax\(118px,\.72fr\) minmax\(0,2\.55fr\)/, 'DPSの数値域は詳細列を除いた幅を使う');
assert.ok(css.includes('grid-template-rows:var(--fdcp-result-card-rows)') && css.includes('padding:var(--fdcp-result-card-padding) !important'), '通常/DPSの詳細ボタンは同じlabel/chevron行とpadding規則を使う');
assert.match(css, /\.fdcp-bottom-bar \.fdc-detail-toggle[^\{]*\{[^}]*display:grid;[^}]*grid-template-rows:var\(--fdcp-result-card-rows\);[^}]*padding:var\(--fdcp-result-card-padding\) !important/, 'DPSの5行結合ボタンも通常と同じ内部カード配置を明示する');
assert.ok(!/\.fdcp-detail-button[^\{]*\{[^}]*font-size/.test(css) && !css.includes('minmax(0,2.55fr) 40px') && !css.includes('minmax(0,2.55fr) 31px') && !css.includes('minmax(0,2.55fr) 28px'), 'DPS固有の詳細幅・文字サイズoverrideを残さない');
assert.ok(css.includes('.fdcp-result-panel { grid-template-columns:minmax(104px,.8fr) minmax(0,2.45fr); width:100%;') , 'mobileのDPS全体カードは9桁表示分の幅を確保する');
assert.ok(css.includes('.fdcp-result-panel { grid-template-columns:minmax(104px,.8fr) minmax(0,2.45fr); }'), '360pxでもDPS全体カードは9桁表示分の幅を確保する');
assert.ok(html.includes('id="fdcp-dps-compare-toggle-label"') && html.includes('fdcp-dps-compare-toggle" class="fdc-compare-float-toggle'), 'DPS比較toggleは通常比較と同じactive表示用のlabel/button構造を持つ');
assert.ok(script.includes("toggle?.classList?.toggle('is-active', hasBaseline)") && script.includes('dataset.fdcpComparison = state'), 'DPS比較の基準保存・差分表示状態をtoggleと下バーdata属性へ同期する');
assert.ok(css.includes('.fdcp-bottom-bar[data-fdcp-comparison="waiting"]') && css.includes('.fdcp-bottom-bar[data-fdcp-comparison="active"]'), '基準保存待機と差分表示中を通常比較と同じactive視覚言語で強調する');
assert.ok(css.includes('body.theme-light .fdcp-result-panel .fdcp-dps-primary') && css.includes('background:linear-gradient(135deg,#fcfdff,#f1f0ff)') && css.includes('body.theme-dark .fdcp-result-panel .fdcp-dps-primary'), 'DPS全体カードはlight/darkで明示的に別配色を持つ');
assert.ok(css.includes('body.theme-light .fdcp-dps-primary canvas { opacity:.15; }') && !css.includes('body.theme-light .fdcp-dps-primary canvas { opacity:.36; }'), 'lightの全体期待DPSカードは白寄りの面と控えめなsparklineを使う');
assert.ok(script.includes('createDpsDamageGraphModel') && script.includes('this.damageGraphModel?.current') && script.includes("strokeStyle = '#87aaff'"),
  'sparklineは共有済みグラフ系列から線だけを重ねる');
assert.ok(css.includes('.fdcp-dps-recalc-spinner') && css.includes('fdcp-dps-recalc-spin') && css.includes('animation:'),
  '全体期待DPSカードに再計算中の回転indicatorを持つ');
assert.ok(script.includes('setRecalculationIndicator') && script.includes('renderRecalculationState') && script.includes('前回の計算結果を表示中'),
  '再計算中は前回結果を残した状態表示を使う');
assert.ok(script.includes('renderDpsExternalInputContent') && script.includes('handleExternalInputChange') && script.includes('externalEvents: snapshot.externalEvents || []'),
  '外部入力は詳細シートの動的controlsからDPS入力へ渡す');
assert.ok(script.includes('renderDpsDamageGraphContent') && script.includes('drawDpsDamageGraph(canvas, this.damageGraphModel)'),
  'ダメージ推移グラフはDPS詳細シートへ動的canvasを描画する');
assert.ok(script.includes('createDpsTimingDetailRows') && script.includes("title: '行動タイミング'"),
  'DPS詳細へ普通攻撃間隔と各モーション硬直の行動タイミングを表示する');
assert.ok(script.includes('createDpsDamageGraphTicks(durationFrames, 10)'),
  '詳細グラフの横軸は10秒刻みのtick生成を使う');
assert.ok(script.includes("window.addEventListener('resize', redrawDpsDamageGraph)") && script.includes("window.addEventListener('trickcal:theme-changed', redrawDpsDamageGraph)"),
  '詳細グラフは表示中のresize・theme変更で再描画する');
const graphPainterSource = script.slice(script.indexOf('function drawDpsDamageGraph'), script.indexOf('function drawSparkline'));
assert.ok(!graphPainterSource.includes('createDpsDamageGraphSeries'), 'グラフの描画処理は系列を再生成せず共有済みmodelだけを描画する');
assert.ok(script.includes('refreshDamageGraphModel()') && script.includes('this.renderDamageGraphs({ detail: false, sparkline: true })'),
  '背景sparklineと詳細グラフは同じキャッシュmodelの更新経路を使う');
assert.ok(css.includes('body.theme-light .fdcp-breakdown > div[data-fdcp-breakdown="basicAttack"] { background:#eff6ff;') && css.includes('body.theme-light .fdcp-breakdown > div[data-fdcp-breakdown="other"] { background:#f0fdfa;'), 'lightでは行動チップを明るい識別色へ分離する');
assert.ok(css.includes('body.theme-light .fdcp-dps-primary .fdcp-total-delta[data-delta-state="positive"]') && css.includes('color:#047857') && css.includes('color:#b91c1c'), 'lightのDPS差分は十分濃い正負色を使う');
assert.ok(!/body\.theme-light[^\{]*\{[^}]*#83f0bb/.test(css) && !/body\.theme-light[^\{]*\{[^}]*#ffaeae/.test(css), 'lightの差分へ旧dark向け低コントラスト色を使わない');
assert.ok(css.includes('body.theme-dark .fdcp-dps-primary .fdcp-total-delta[data-delta-state="positive"]') && css.includes('body.theme-dark #fdcp-baseline-note[data-fdcp-comparison-state="active"]'), 'darkでは既存の明るい差分色と比較状態文を維持する');
assert.ok(html.includes('data-fdcp-mode="single">通常</button>'), '通常計算タブをコンパクトな縦書きラベルにする');
assert.ok(html.includes('data-fdcp-mode="dps">DPS</button>'), 'DPSタブをコンパクトな縦書きラベルにする');
assert.ok(!html.includes('id="fdcp-dps-notice"'), '常時表示のDPS注意文を下バーから除去する');
assert.match(css, /data-mode="single"[\s\S]*?fdcp-result-panel[^\{]*\{ display:none !important/, '通常計算モードではDPS下バーを明示的に隠す');
assert.equal((html.match(/data-fdcp-column="action"/g) || []).length, 5, '5行すべてに行動列を持つ');
assert.equal((html.match(/data-fdcp-column="dps"/g) || []).length, 5, '5行すべてにDPS列を持つ');
assert.equal((html.match(/data-fdcp-column="delta"/g) || []).length, 5, '5行すべてに比較差分の予約列を持つ');
assert.equal((html.match(/data-fdcp-column="share"/g) || []).length, 5, '5行すべてに構成比列を持つ');
assert.equal((html.match(/data-fdcp-column="count"/g) || []).length, 5, '5行すべてに回数列を持つ');
assert.equal((html.match(/data-fdcp-short-label="(?:基|強|低|高|他)"/g) || []).length, 5, 'スマホ用に5行の短縮行動ラベルを持つ');
assert.ok(css.includes('--fdcp-breakdown-columns:minmax(1.4rem,.42fr) minmax(3.7rem,1.3fr) minmax(0,.72fr) minmax(2.75rem,.64fr)') && css.includes('[data-fdcp-column="count"] { display:none; }'), 'スマホでは使用回数列を省略してDPS数値へ幅を回す');
assert.ok(css.includes('[data-fdcp-column="action"]::after') && css.includes('content:attr(data-fdcp-short-label)'), 'スマホの行動ラベルは基/強/低/高/他を表示する');
assert.ok(css.includes('.fdcp-dps-primary strong { overflow-wrap:normal; line-height:1.05; text-overflow:clip; white-space:nowrap; word-break:normal; }'), 'スマホの全体DPSは9桁の数値を折り返さず表示する');
assert.ok(css.includes('.fdc-result-hp-rate { font-size:.49rem; letter-spacing:-.04em; }'), 'スマホの残HP表示はカード内に収まるサイズへ調整する');
assert.ok(css.includes('.fdcp-bottom-bar .fdcp-mode-tabs { top:calc(-1.7rem - 1px);') && css.includes('.fdcp-page .fdc-card-cost-controller,'), 'スマホの結果タブを上端へ移し、コインを上方へ逃がす');
assert.ok(css.includes('.result-card .value:not(.is-compare) { overflow-wrap:anywhere; text-overflow:clip; white-space:normal; }'), 'スマホの通常計算値は長い数値を省略せず折り返す');
assert.ok(css.includes('grid-template-columns:minmax(104px,.8fr) minmax(0,2.45fr);') && css.includes('minmax(2.25rem,.42fr)'), 'スマホの比較差分短縮分を全体DPS枠へ配分する');
assert.ok(html.includes('class="fdcp-detail-controls"') && css.includes('.fdcp-detail-controls { position:absolute;') && css.includes('top:calc(-1.7rem - 1px)'), '詳細操作を下バー上端の独立スロットへ移し、開閉時の位置を固定する');
assert.ok(css.includes('[data-mode="single"] #fdcp-dps-detail') && css.includes('[data-mode="dps"] #fdc-result-detail-toggle'), '通常/DPSで対応する詳細ボタンだけを表示する');
assert.ok(script.includes('formatCompactComparisonDelta(row.percentChange)') && script.includes('formatCompactComparisonDelta(comparison.meanDpsPercent)'), '下バーの比較差分は個別・全体とも割合表示を使う');
assert.ok(!html.includes('比較用DPS β') && !html.includes('構造化効果監査') && !html.includes('単一seed タイムライン'), '詳細から試験・監査用の旧文言を除去する');
assert.ok(html.includes('同じ使徒の設定比較用です。使徒間比較には使用できません。'), 'DPSの比較範囲は設定popoverにだけ簡潔に残す');
assert.ok(!html.includes('使徒同士の性能比較や実戦値保証には使えません'), '詳細内へ長い注意文を常時表示しない');
assert.ok(css.includes('.fdc-dps-effect-audit-panel') && css.includes('.fdc-dps-timeline-panel') && script.includes('renderDpsTimelineContent'), '行動別適用効果とタイムラインは独立DPS画面と同じdetails構造を使う');
assert.ok(html.includes('行動別適用効果') && script.includes('getDpsApplicableActionEffects'), 'snapshotの行動別適用効果を利用者向け詳細へ表示する');
assert.ok(!script.includes('renderAudit()') && !script.includes('renderTimeline()'), '旧監査・旧タイムラインの描画経路を残さない');
assert.ok(html.includes('<meta name="robots" content="noindex,nofollow">'), '試験ページは検索対象にしない');
assert.ok(html.includes('<option value="90" selected>90秒</option>'), '計測時間は90秒が既定値');
assert.ok(html.includes('統計試行数') && html.includes('seed平均'), '統計試行数が複数seed平均であることを設定UIに明示する');
assert.ok(html.includes('id="fdcp-auto-run" type="checkbox" checked'), '自動計算は初期表示でONにする');
assert.ok(html.indexOf('id="fdc-save-menu"') < html.indexOf('id="fdcp-dps-compare-slot"') && html.indexOf('id="fdcp-dps-compare-slot"') < html.indexOf('id="fdcp-dps-settings-slot"'), 'DPSモードのvisible/tab順は保存→DPS比較→DPS設定にする');
assert.ok(html.indexOf('id="fdcp-dps-settings-slot"') < html.indexOf('id="fdc-compare-float-toggle"'), '通常用compare/applyはDPS slotの後ろに置き、通常時は元の順で残す');
assert.ok(!html.includes('rel="canonical"'), '本番ページへのcanonicalを持たない');
assert.ok(!html.includes('property="og:url"'), '本番ページへのOG URLを持たない');
assert.ok(!/iframe|contentWindow/i.test(html), 'prototype HTMLはiframeを含まない');
assert.ok(!/iframe|contentWindow/i.test(script), 'prototype controllerはiframe参照を含まない');
assert.ok(script.includes('createDirectDamageAdapter'), 'direct adapterで単発ページを分離する');
assert.ok(script.includes('createDpsEvaluationInput'), 'DPS入力はsnapshot APIを使う');
assert.ok(script.includes('createInputSnapshot(snapshot = {})') && script.includes('externalEvents: normalizeDpsExternalEvents(this.externalEvents)'), '通常snapshotを変更せず外部入力をDPS実行snapshotへ合成する');
assert.ok(script.includes('axesMatch'), '基準比較に比較軸guardを持つ');
assert.ok(script.includes('applyBaselineComparison({ resultReady: true })'), '正常なDPS計算完了時に基準比較を自動適用する');
assert.ok(!script.includes('compareBaseline()') && !script.includes('baselineCompare'), '手動比較のcontroller参照を残さない');
assert.ok(script.includes('requestAutoRun'), '自動計算のdebounce制御を持つ');
assert.ok(script.includes('dpsModeActive') && script.includes('if (!this.dpsModeActive || this.running) return;'), 'DPSタブ以外からのrun開始をcontroller入口で拒否する');
assert.ok(script.includes('dpsModeActive: this.dpsModeActive') && script.includes('if (currentMode !== \'dps\') return;'), 'auto requestと通常計算由来の変更refreshをDPS modeでgateする');
assert.ok(script.includes("window.addEventListener('trickcal:damage-calculator-rendered'"), '通常計算のrender完了通知で使徒選択後のDPS対応可否を再評価する');
assert.ok(script.includes('refreshAvailability({ render: activeDps })') && script.includes('if (activeDps) controller.requestAutoRun()'), '通常中は対応可否だけ更新し、DPS中だけ自動計算を要求する');
assert.ok(script.includes('getDpsTabAvailability') && script.includes('dpsModeToggle.disabled = state.disabled') && script.includes('setMode(\'single\')'), '未対応使徒はDPS tabをdisabledにし、DPS表示中の切替では通常へ退避する');
assert.ok(script.includes('support?.provisional') && script.includes('provisionalLabel') && script.includes('暫定:'), '選択中の暫定componentをDPSタブ・詳細・下バーに明示する');
assert.ok(script.includes('invalidateForTargetChange') && script.includes('使徒変更のため比較基準を解除しました'), '使徒変更時は旧DPS結果・対象固有の比較基準を安全に解除する');
assert.ok(script.includes('cancelActiveRun') && script.includes('createRunCancellation') && script.includes('runToken'), 'DPSタブ離脱時の予約取消・Worker中止・late result破棄を持つ');
assert.ok(script.includes('singleApplyToggle.hidden = dpsMode') && script.includes('singleCompareToggle.hidden = dpsMode') && script.includes('singleApplyPanel.hidden = true'), 'DPSタブ中は通常比較・通常計算設定floatを閉じて非表示にする');
assert.ok(script.includes('document.body.dataset.fdcpMode = currentMode'), 'DPS modeをbottom bar外のfloatもscopeできるpage属性へ同期する');
assert.ok(script.includes('singleCompareToggle.setAttribute(\'aria-hidden\', String(dpsMode))') && script.includes('elements.settingsSlot.setAttribute(\'aria-hidden\', String(!dpsMode))'), 'mode切替時に通常/DPS floatのアクセシビリティ状態も切り替える');
assert.match(css, /\.fdcp-page\[data-fdcp-mode="dps"\][\s\S]*?#fdc-compare-float-toggle[\s\S]*?#fdc-apply-float-toggle[\s\S]*?#fdc-compare-float-panel[\s\S]*?#fdc-apply-float-panel[\s\S]*?display:none !important/, 'DPS modeは通常比較・通常設定のtoggle/panelをpage stateで強制非表示にする');
assert.match(css, /\.fdcp-page\[data-fdcp-mode="single"\][\s\S]*?#fdcp-dps-compare-slot[\s\S]*?#fdcp-dps-settings-slot[\s\S]*?display:none !important/, '通常modeはDPS比較・設定slotをauthor displayより強く隠す');
assert.ok(script.includes('closeSingleDetail') && script.includes('setDpsDetailOpen(false)'), 'mode切替時に前modeのdetailを確実に閉じる');
assert.ok(script.includes('applyFloatState') && script.includes('saveMenu.open = state.save'), 'float/popover排他制御をcontrollerに持つ');
assert.ok(script.includes('[data-fdcp-column="share"]') && script.includes('[data-fdcp-column="count"]'), '構成比と回数を別DOMへ更新する');
assert.ok(script.includes('runSimulationWorker'), '複数seed集計はworker protocolを使う');
assert.ok(script.includes('exactTrials: true') && script.includes('adaptiveTrials: false'), 'prototype DPSは指定した統計試行数を短縮せず集計へ渡す');
assert.ok(html.indexOf('dps-timing-data.js') < html.indexOf('formation-damage-calc.js'), 'DPS kernelは単発controllerより先に読む');
assert.ok(html.indexOf('formation-damage-calc.js') < html.indexOf('formation-damage-dps-prototype.js'), 'prototype controllerは単発controllerの後に読む');
assert.ok(html.includes('formation-damage-dps-prototype.js?v=20260828h'), 'prototype controllerは最新cache-bustを参照する');
assert.ok(!html.includes('formation-damage-dps-prototype.js?v=20260827al') && !html.includes('formation-damage-dps-prototype.js?v=20260827ak'), 'prototype HTMLに旧controller queryを残さない');
assert.ok(html.includes('formation-damage-dps-prototype.css?v=20260828r'), 'prototype stylesheetは最新cache-bustを参照する');
assert.ok(!html.includes('formation-damage-dps-prototype.css?v=20260827w'), 'prototype HTMLに旧stylesheet queryを残さない');
assert.ok(appCache.includes('formation-damage-dps-prototype.js?v=20260828h'), 'cache manifestも最新controller queryを参照する');
assert.ok(!appCache.includes('formation-damage-dps-prototype.js?v=20260827al') && !appCache.includes('formation-damage-dps-prototype.js?v=20260827ak'), 'cache manifestに旧controller queryを残さない');
assert.ok(html.includes('dps-simulator.js?v=20260827n') && appCache.includes('dps-simulator.js?v=20260827n'), 'DPS kernelのcache-bustをHTMLとmanifestで揃える');
assert.ok(script.includes("dps-simulator-worker.js?v=20260827m") && appCache.includes('dps-simulator-worker.js?v=20260827m'), 'Workerのcache-bustを起動側とmanifestで揃える');
assert.ok(appCache.includes('formation-damage-dps-prototype.css?v=20260828r'), 'cache manifestも最新stylesheet queryを参照する');
assert.ok(!appCache.includes('formation-damage-dps-prototype.css?v=20260827w'), 'cache manifestに旧stylesheet queryを残さない');
assert.ok(html.includes('app-cache.js?v=20260828q'), 'app-cache更新時はprototype HTMLのscript queryも更新する');

const context = {
  window: {
    setTimeout(callback) { callback(); return 1; },
    TRICKCAL_DPS_SIMULATOR: {
      simulate: (_config, workerOptions) => ({ mode: 'single', workerOptions }),
      simulateMany: (_config, workerOptions) => ({
        mode: 'many', workerOptions,
        trials: workerOptions.trials,
        evaluatedTrials: workerOptions.trials,
        trialSeeds: Array.from({ length: workerOptions.trials }, (_, index) => workerOptions.seed + index)
      })
    }
  },
  location: { protocol: 'file:' }
};
vm.createContext(context);
vm.runInContext(script, context, { filename: 'formation-damage-dps-prototype.js' });
const testing = context.window.TRICKCAL_DPS_BOTTOM_BAR_PROTOTYPE_TESTING;
context.document = { querySelector() { return null; } };
const makeElement = () => {
  const classes = new Set();
  return {
    textContent: '', innerHTML: '', hidden: false, disabled: false, dataset: {},
    classList: { toggle(name, active) { if (active) classes.add(name); else classes.delete(name); }, contains(name) { return classes.has(name); } },
    setAttribute() {}, removeAttribute() {}
  };
};
const renderElements = {
  value: makeElement(), total: makeElement(), totalDelta: makeElement(), state: makeElement(), meta: makeElement(),
  provisionalBadge: makeElement(), drawerStatus: makeElement(), detailGrid: makeElement(), sparklineMeta: makeElement(),
  recalcIndicator: makeElement(), sparkline: {}, baselineSave: makeElement(), baselineClear: makeElement(), baselineNote: makeElement(),
  compareToggle: makeElement(), compareToggleLabel: makeElement(), bottomBar: makeElement(), primary: makeElement()
};
const renderController = new testing.PrototypeDpsController({}, renderElements);
renderController.currentInputFingerprint = 'completed-run';
renderController.latest = {
  aggregate: { meanDps: 1234, totalExpectedDamage: 111060, evaluatedTrials: 16, range: { p10: 100000, p90: 120000 }, byAction: {} },
  support: { label: 'テスト使徒', configuration: '通常', provisional: false },
  options: { durationSeconds: 90, seed: 1, trials: 16 }, config: {}, axis: {}, inputFingerprint: 'completed-run',
  single: { seed: 1, damageSeries: [], timeline: [{ frame: 196.9, type: 'runtimeEffectProbability', actionKey: 'basicAttack', actionLabel: '普通攻撃', label: '竜巻ダメージ', effectId: 'Sylla_aside_2_e01', reason: '普通攻撃命中時一定確率', probability: 75, success: true, expectedDamage: 4238181 }] },
  snapshot: { actionEffectAudit: { basicAttack: { rows: [{ label: '通常 / 物理ダメージ', value: '与ダメージ量 +20%', enabled: true }] } } }
};
assert.doesNotThrow(() => renderController.renderLatest(), '計算成功後のrenderLatestは削除済み詳細DOMへ触れず完了する');
assert.match(renderElements.drawerStatus.textContent, /計算済み/, '計算成功後に詳細ヘッダーを計算済みへ更新する');
assert.equal(renderElements.recalcIndicator.hidden, true, '新しい計算結果を適用したら再計算indicatorを隠す');
assert.match(renderElements.detailGrid.innerHTML, /計測情報[\s\S]*行動別適用効果[\s\S]*通常 \/ 物理ダメージ[\s\S]*タイムライン/, '計算成功後の詳細は計測情報・行動別適用効果・タイムラインを表示する');
assert.equal(renderController.latest.aggregate.meanDps, 1234, '詳細描画成功時に集計済みのlatest結果を保持する');
const pendingElements = {
  value: makeElement(), totalDelta: makeElement(), state: makeElement(), meta: makeElement(), provisionalBadge: makeElement(),
  recalcIndicator: makeElement(), drawerStatus: makeElement(), detailGrid: makeElement(), sparkline: {}, sparklineMeta: makeElement(),
  baselineSave: makeElement(), baselineClear: makeElement(), baselineNote: makeElement(), compareToggle: makeElement(), compareToggleLabel: makeElement(),
  bottomBar: makeElement(), primary: makeElement(), run: makeElement(), duration: { value: '90' }, highMode: { value: 'disabled' },
  seed: { value: '1' }, trials: { value: '16' }, autoRun: { checked: true }
};
const pendingController = new testing.PrototypeDpsController({}, pendingElements);
const pendingSnapshot = { targetId: 'chloe', targetName: 'クロエ', apostle: { id: 'chloe' }, scenario: {}, skillLevels: {} };
pendingController.latest = {
  aggregate: { meanDps: 1234, totalExpectedDamage: 111060, evaluatedTrials: 16, range: { p10: 100000, p90: 120000 }, byAction: {} },
  support: { label: 'クロエ', configuration: '通常', provisional: false },
  options: { durationSeconds: 90, seed: 1, trials: 16 }, config: {}, axis: {}, inputFingerprint: 'old-result',
  single: { seed: 1, damageSeries: [], timeline: [] }, snapshot: { actionEffectAudit: {} }
};
pendingElements.value.textContent = '1,234';
pendingController.renderAvailability(pendingSnapshot, { supported: true, label: 'クロエ', configuration: '通常' });
assert.equal(pendingController.latest.aggregate.meanDps, 1234, '再計算待ちでも前回のlatest結果を保持する');
assert.equal(pendingElements.value.textContent, '1,234', '再計算待ちでも全体期待DPSの表示値を保持する');
assert.equal(pendingElements.recalcIndicator.hidden, false, '再計算待ちでは左上indicatorを表示する');
assert.equal(pendingElements.recalcIndicator.dataset.fdcpRecalculation, 'pending', '再計算待ちindicatorの状態を明示する');
assert.match(pendingElements.drawerStatus.textContent, /再計算待ち[\s\S]*前回の計算結果/, '詳細ヘッダーにも前回結果を表示中と示す');
renderController.baseline = { axis: {} };
renderController.comparison = null;
renderController.syncComparisonUi();
assert.equal(renderElements.compareToggle.classList.contains('is-active'), true, '基準保存済みならDPS比較toggleをactiveにする');
assert.equal(renderElements.compareToggleLabel.textContent, '比較中', '基準保存済みならDPS比較toggleの表記を比較中にする');
assert.equal(renderElements.bottomBar.dataset.fdcpComparison, 'waiting', '基準保存済み・差分待機中を下バーへ同期する');
renderController.comparison = { meanDpsDifference: 10 };
renderController.syncComparisonUi();
assert.equal(renderElements.bottomBar.dataset.fdcpComparison, 'active', '差分表示中を下バーへ同期する');
renderController.baseline = null;
renderController.comparison = null;
renderController.syncComparisonUi();
assert.equal(renderElements.compareToggle.classList.contains('is-active'), false, '基準解除時はDPS比較toggleのactiveを外す');
assert.equal(renderElements.bottomBar.dataset.fdcpComparison, 'none', '基準解除時は下バー比較状態を解除する');
assert.equal(testing.createDpsDetailComparisonRows({ baselineDps: 100, currentDps: 110, meanDpsDifference: 10, meanDpsPercent: 10, totalExpectedDamage: { before: 90, after: 100, difference: 10, percentChange: 100 / 9 }, p10: { before: 80, after: 70, difference: -10, percentChange: -12.5 }, p90: { before: 100, after: 100, difference: 0, percentChange: 0 } })[0].className, 'is-comparison-up', '詳細比較差分は正負に応じた既存comparison色classを付ける');
const actionEffects = testing.getDpsApplicableActionEffects({
  basicAttack: {
    rows: [
      { label: '通常 / 物理ダメージ', value: '与ダメージ量 +20%', enabled: true },
      { label: '条件OFFの効果', value: '与ダメージ量 +40%', enabled: false },
      { label: '未対応トリガー', value: '与ダメージ量 +30%', enabled: true, unsupportedRuntimeTrigger: true },
      { label: '編成使徒の行動', value: '与ダメージ量 +10%', enabled: true, externalActionRequired: true },
      { label: '通常 / 物理ダメージ', value: '与ダメージ量 +20%', enabled: true }
    ]
  },
  enhancedAttack: { rows: [{ label: 'アサイド / スキル変更', enabled: true, skillRewrite: true }] },
  lowSkill: { rows: [{ label: '愛用品 / 持続効果', enabled: true, runtimeManaged: true }] }
});
assert.deepEqual(JSON.parse(JSON.stringify(actionEffects.find(item => item.key === 'basicAttack').rows)), [
  { label: '通常 / 物理ダメージ', value: '与ダメージ量 +20%', state: { code: 'on', label: '自動適用' } },
  { label: '条件OFFの効果', value: '与ダメージ量 +40%', state: { code: 'condition', label: 'OFF' } },
  { label: '未対応トリガー', value: '与ダメージ量 +30%', state: { code: 'unsupported', label: 'DPS未対応' } },
  { label: '編成使徒の行動', value: '与ダメージ量 +10%', state: { code: 'external', label: '他使徒の行動待ち' } }
], '行動別適用効果はON/OFF・未対応・外部待ちを区別し、同一状態だけを重複なく表示する');
assert.deepEqual(JSON.parse(JSON.stringify(actionEffects.find(item => item.key === 'enhancedAttack').rows)), [{ label: 'アサイド / スキル変更', value: 'スキル効果を変更', state: { code: 'on', label: '自動適用' } }],
  'スキル書き換えは利用者向け名称・状態で表示する');
assert.deepEqual(JSON.parse(JSON.stringify(actionEffects.find(item => item.key === 'lowSkill').rows)), [{ label: '愛用品 / 持続効果', value: '条件成立時に反映', state: { code: 'runtime', label: 'DPS時系列で反映' } }],
  'runtime管理効果はDPS時系列反映として表示する');
assert.match(testing.renderDpsActionEffectContent({ basicAttack: { rows: [{ label: '<効果>', value: '<値>', enabled: true }] } }), /&lt;効果&gt;[\s\S]*&lt;値&gt;/,
  '行動別適用効果の名称と値はHTML escapeする');
const standaloneDpsAudit = testing.renderDpsActionEffectContent({
  basicAttack: { rows: [{ key: 'shared', label: '共通効果', value: '与ダメージ量 +20%', enabled: true }] },
  enhancedAttack: { rows: [{ key: 'shared', label: '共通効果', value: '与ダメージ量 +20%', enabled: false, reason: '条件不一致' }] }
});
assert.match(standaloneDpsAudit, /<details class="fdc-dps-effect-audit-panel"><summary>行動別適用効果 <span>1効果<\/span><\/summary>[\s\S]*fdc-dps-effect-matrix[\s\S]*基本攻撃[\s\S]*強化攻撃[\s\S]*fdc-dps-effect-state is-on[\s\S]*fdc-dps-effect-state is-off/,
  '行動別適用効果は独立DPS上段と同じ効果行×行動列matrixを使う');
const normalizedExternalEvent = testing.getDpsExternalEvent({ type: 'shieldBreak', seconds: 1.5, intervalSeconds: 2, repeatCount: 3, sourceId: 'enemy-1', value: '50', reason: '' });
assert.deepEqual(JSON.parse(JSON.stringify(normalizedExternalEvent)), {
  id: 'manual:1', type: 'shieldBreak', frame: 90, intervalFrames: 120, repeatCount: 3,
  sourceId: 'enemy-1', value: '50', reason: '手動シールド破壊'
}, '外部イベント入力は秒・間隔をsimulator用frameへ正規化し、既定表示名を補う');
assert.deepEqual(JSON.parse(JSON.stringify(testing.normalizeDpsExternalEvents([
  { type: 'damageTaken', frame: 30 }, { type: '', seconds: 2 }, { type: 'statusApplied', seconds: 3, reason: '状態付与' }
]))), [
  { id: 'manual:1', type: 'damageTaken', frame: 30, intervalFrames: 0, repeatCount: 0, sourceId: '', value: '', reason: '手動被弾' },
  { id: 'manual:3', type: 'statusApplied', frame: 180, intervalFrames: 0, repeatCount: 0, sourceId: '', value: '', reason: '状態付与' }
], '空の外部イベントを除外し、複数行を同じ形式へ正規化する');
const externalInput = testing.getDpsExternalInputContent(
  [{ type: 'shieldBreak', seconds: 1.5, reason: '<手動>' }],
  [{ id: 'candidate-1', label: '候補<1>', basis: '普通攻撃', effectLabels: ['<効果>'] }]
);
assert.match(externalInput, /<details class="fdc-dps-external-events"[\s\S]*外部イベント（手動）[\s\S]*標準OFF[\s\S]*data-fdcp-dps-external-event-add[\s\S]*data-fdc-dps-external-seconds[\s\S]*data-fdc-dps-external-remove/,
  '外部入力は独立DPSと同じdetails・追加ボタン・編集行を持つ');
assert.match(externalInput, /data-fdcp-detail-section="external-candidates"[\s\S]*候補&lt;1&gt;[\s\S]*対象効果: &lt;効果&gt;[\s\S]*data-fdc-dps-formation-event-add="candidate-1"/,
  '編成候補から追加するdetailsと表示値をHTML escapeする');
const graphResult = {
  durationFrames: 120,
  damageSeries: [
    { type: 'hit', frame: 0, expectedDamage: 10 },
    { type: 'statusTick', frame: 60, expectedDamage: 5 },
    { type: 'hit', frame: 90, expectedDamage: 0 }
  ]
};
const graphSeries = testing.createDpsDamageGraphSeries(graphResult);
assert.equal(graphSeries.durationFrames, 120, '詳細グラフ系列は計測frameを保持する');
assert.equal(graphSeries.rawHitCount, 2, '詳細グラフ系列は正のhit/statusTickだけを集計する');
assert.equal(graphSeries.bucketCount, 20, '詳細グラフ系列は6frame単位で最大400点へbinningする');
assert.equal(graphSeries.totalDamage, 15, '詳細グラフ系列の累積総量を保持する');
assert.equal(graphSeries.points[10].yValue, 15, '詳細グラフ系列は時系列順に累積する');
const graphModel = testing.createDpsDamageGraphModel(graphResult, { durationFrames: 120, damageSeries: [{ type: 'hit', frame: 0, expectedDamage: 7 }] });
assert.equal(graphModel.current.totalDamage, 15, '共有グラフmodelへcurrent系列を格納する');
assert.equal(graphModel.baseline.totalDamage, 7, '共有グラフmodelへbaseline系列を格納する');
assert.deepEqual(JSON.parse(JSON.stringify(testing.createDpsDamageGraphTicks(90 * 60).map(tick => tick.seconds))), [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
  '詳細グラフの横軸は90秒なら10秒ごとの目盛りを生成する');
assert.deepEqual(JSON.parse(JSON.stringify(testing.createDpsDamageGraphTicks(35 * 60).map(tick => tick.seconds))), [0, 10, 20, 30, 35],
  '計測時間が10秒の倍数でなくても終点を補助目盛りとして残す');
const timingRows = testing.createDpsTimingDetailRows({
  normalAttackIntervalFrames: 182,
  initialNormalAttackIntervalFrames: 140,
  initialAttackSpeedP: 30,
  actions: {
    basicAttack: { label: '基本攻撃', motionFramesByVariant: { default: 80 } },
    enhancedAttack: { label: '強化攻撃', motionFramesByVariant: { default: 90, A: 120 } },
    lowSkill: { label: '低学年', motionFrames: 130 }
  }
});
assert.deepEqual(JSON.parse(JSON.stringify(timingRows)), [
  ['普通攻撃間隔（補正前）', '182F（3.03秒）'],
  ['普通攻撃間隔（補正後）', '140F（2.33秒） / 開始時攻撃速度+30.0%'],
  ['基本攻撃のモーション硬直', '80F（1.33秒）'],
  ['強化攻撃のモーション硬直', '90F（1.5秒） / A: 120F（2秒）'],
  ['低学年のモーション硬直', '130F（2.17秒）']
], '詳細の行動タイミングは補正前後の普通攻撃間隔と各モーション硬直を表示する');
assert.match(testing.renderDpsDamageGraphContent(), /fdc-dps-damage-graph-panel[\s\S]*fdcp-dps-damage-graph[\s\S]*fdcp-damage-graph-baseline-legend/,
  '詳細グラフは独立DPSと同じcanvas・凡例構造を使う');
assert.ok(!css.includes('.fdc-dps-effect-matrix-wrap') && !css.includes('overflow-x:auto') && !css.includes('min-width:560px') && !css.includes('.fdcp-detail-collapsible') && !css.includes('.fdcp-action-effect-list') && !css.includes('.fdcp-timeline-list') && script.includes('fdc-dps-effect-matrix') && !script.includes('fdc-dps-effect-action-details') && !script.includes('fdc-dps-effect-action-detail'),
  '共有詳細は横scroll用wrap・固定min-width・旧縦action detailsを持たず、幅内matrixを使う');
assert.ok(css.includes('.fdcp-dps-detail-panel .fdc-dps-runtime-settings,') && css.includes('.fdcp-dps-detail-panel .fdc-dps-effect-matrix,') && css.includes('.fdcp-dps-detail-panel .fdc-dps-timeline { display:block; }'),
  '通常詳細シートの汎用divスタイルがDPSの縦セクションへ漏れない');
const runtimeControls = testing.renderDpsRuntimeEffectControls({
  damageBuffEffects: [{ id: 'damage-buff', label: '時系列与ダメージ', maxStacks: 5, runtimeOverrideMode: 'fixed', runtimeFixedStacks: 3 }],
  spRecoveryEffects: [{ id: 'sp-gain', label: 'SP回復', runtimeOverrideMode: 'off' }]
});
assert.match(runtimeControls, /fdc-dps-runtime-settings[\s\S]*時系列効果設定[\s\S]*data-fdc-dps-runtime-mode="damage-buff"[\s\S]*<option value="fixed" selected>固定<\/option>[\s\S]*data-fdc-dps-runtime-stacks="damage-buff"[\s\S]*data-fdc-dps-runtime-mode="sp-gain"[\s\S]*<option value="off" selected>OFF<\/option>/,
  '独立DPSと同じ時系列効果controlsは自動・固定・OFFとスタックinputを出し分ける');
const overrideApplied = testing.applyDpsRuntimeEffectOverrides({
  damageBuffEffects: [{ id: 'damage-buff', maxStacks: 5, triggerActionKeys: ['basicAttack'] }],
  spRecoveryEffects: [{ id: 'sp-gain' }]
}, 'apostle', { apostle: { 'damage-buff': { mode: 'fixed', fixedStacks: 3 }, 'sp-gain': { mode: 'off', fixedStacks: 1 } } });
assert.equal(overrideApplied.display.damageBuffEffects[0].runtimeOverrideMode, 'fixed', 'override表示は同じtargetIdの保存値を読む');
assert.equal(overrideApplied.simulation.damageBuffEffects[0].mode, 'fixed', '固定overrideはDPS simulation configへ適用する');
assert.equal(overrideApplied.simulation.damageBuffEffects[0].fixedStacks, 3, '固定overrideのstack数をDPS simulation configへ適用する');
assert.equal(overrideApplied.simulation.spRecoveryEffects.length, 0, 'OFF overrideはDPS simulationから除外する');
assert.ok(script.includes('handleRuntimeEffectSettingChange') && script.includes('saveDpsRuntimeEffectOverrides(overrides)') && script.includes('this.requestAutoRun()'),
  '時系列効果control変更は共通保存経路を更新し、DPSのみ再計算を要求する');
const auditWithRuntimeAndAdditional = testing.renderDpsActionEffectContent({
  basicAttack: { rows: [{ key: 'runtime-shared', effectId: 'runtime-shared', label: '時系列与ダメージ', value: '与ダメージ量 +20%', enabled: true, runtimeManaged: true }] },
  lowSkill: { rows: [{ key: 'runtime-shared', effectId: 'runtime-shared', label: '時系列与ダメージ', value: '与ダメージ量 +20%', enabled: true, runtimeManaged: true }] },
  highSkill: { rows: [{ key: 'runtime-fixed', effectId: 'runtime-fixed', label: '固定効果', value: '与ダメージ量 +10%', enabled: true, runtimeManaged: true }, { key: 'runtime-off', effectId: 'runtime-off', label: 'OFF効果', value: '与ダメージ量 +5%', enabled: true, runtimeManaged: true }] }
}, {}, {
  damageBuffEffects: [
    { id: 'runtime-shared', modifiers: { lowSkillAddP: 20 }, triggerActionKeys: ['basicAttack'] },
    { id: 'runtime-fixed', runtimeOverrideMode: 'fixed', runtimeFixedStacks: 3, modifiers: { highSkillAddP: 10 } },
    { id: 'runtime-off', runtimeOverrideMode: 'off', modifiers: { highSkillAddP: 5 } }
  ]
}, { timeline: [{ type: 'runtimeBuffApplied', runtimeEffectId: 'runtime-shared' }] }, [{
  effectId: 'sylla-tornado', sourceLabel: 'A2', valueKind: '竜巻ダメージ', baseMultiplier: 75, repeatCount: 2,
  attackCategory: '基本攻撃', ownerActionKeys: ['basicAttack'], actionEffectAudit: { rows: [{ key: 'runtime-shared', effectId: 'runtime-shared', label: '時系列与ダメージ', value: '与ダメージ量 +20%', enabled: true, runtimeManaged: true }] }
}]);
assert.match(auditWithRuntimeAndAdditional, /fdc-dps-effect-matrix[\s\S]*基本攻撃[\s\S]*強化攻撃[\s\S]*低学年[\s\S]*高学年[\s\S]*A2[\s\S]*竜巻ダメージ 75%×2[\s\S]*起点[\s\S]*ONあり[\s\S]*固定×3[\s\S]*OFF/,
  '追加ダメージを含む効果matrixは基本・強化・低・高の横列へ状態を並べ、発生元・種別・倍率・repeatをheaderへ表示する');
assert.match(testing.renderDpsActionEffectContent({ basicAttack: { rows: [{ label: '手動OFF', value: '与ダメージ量 +20%', enabled: false, manualDisabled: true }] } }), /手動OFF[\s\S]*fdc-dps-effect-state is-off[^>]*>OFF/,
  '行動別適用効果は手動OFFを利用者向け状態で表示する');
const timelineLine = testing.formatDpsTimelineEvent({ type: 'runtimeEffectProbability', actionLabel: '普通攻撃', label: '竜巻ダメージ', effectId: 'Sylla_aside_2_e01', reason: '普通攻撃命中時一定確率', probability: 75, success: true, expectedDamage: 4238181 });
assert.match(timelineLine, /普通攻撃[\s\S]*竜巻ダメージ[\s\S]*発動抽選[\s\S]*75% 成功[\s\S]*普通攻撃命中時一定確率[\s\S]*期待 4,238,181/,
  'タイムラインは確率発動の効果名・条件・成否・期待値を判別可能にする');
const timelineCooldownLine = testing.formatDpsTimelineEvent({ type: 'cooldownChanged', label: '高学年', operation: 'multiply', multiplier: 0.8, beforeFrames: 600, afterFrames: 480, ready: false });
assert.match(timelineCooldownLine, /高学年[\s\S]*CT ×0\.8[\s\S]*残り8秒/,
  'タイムラインは試験版と同じクールタイム変更の内容を表示する');
const timelineBuffLine = testing.formatDpsTimelineEvent({ type: 'runtimeBuffApplied', label: '時系列与ダメージ', stackCount: 2, maxStacks: 3, modifiers: { addP: 20, lowSkillAddP: 10 }, durationFrames: 120 });
assert.match(timelineBuffLine, /時系列与ダメージ[\s\S]*2\/3スタック[\s\S]*与ダメージ量 \+20% \/ 低学年スキルダメージ量 \+10%[\s\S]*2秒/,
  'タイムラインは試験版と同じ時系列バフの補正内容を表示する');
const standaloneDpsTimeline = testing.renderDpsTimelineContent({ timeline: [{ frame: 1, type: 'runtimeEffectProbability', label: '<竜巻>', probability: 75, success: true }] });
assert.match(standaloneDpsTimeline, /<details class="fdc-dps-timeline-panel" open><summary>単一seed 行動タイムライン<\/summary>[\s\S]*fdc-dps-timeline-row type-runtimeEffectProbability/,
  'タイムラインは独立DPS画面と同じ初期openのdetails・typed row構造を使う');
assert.match(standaloneDpsTimeline, /&lt;竜巻&gt;/,
  'タイムラインの表示値はHTML escapeする');
const timelineWithMore = testing.renderDpsTimelineContent({ timeline: Array.from({ length: 161 }, (_, index) => ({ frame: index, type: 'actionStart', actionLabel: '基本攻撃' })) });
assert.match(timelineWithMore, /160 \/ 161件を表示[\s\S]*data-fdcp-timeline-more[\s\S]*続きを1件表示/,
  'タイムラインは独立DPS画面と同じ160件表示＋続きを表示する上限を使う');
assert.match(timelineWithMore, /<div class="fdc-dps-timeline">[\s\S]*data-fdcp-timeline-more[\s\S]*<\/div><\/details>/,
  'タイムラインの続きを表示する操作は縦scrollコンテナ内に置く');
const timelineWithOmitted = testing.renderDpsTimelineContent({ timeline: [{ frame: 1, type: 'actionStart', actionLabel: '基本攻撃' }], timelineStats: { total: 3, omitted: 2 } });
assert.match(timelineWithOmitted, /計3件中、2件を省略しています。計算・グラフには影響しません。/,
  'タイムラインは記録上限による省略件数を利用者向けに表示する');
assert.equal(testing.getDpsDetailStatusLabel('snapshot取得エラー'), 'DPS入力を準備できません。通常計算の設定を確認してください。',
  '詳細では内部snapshotエラーを利用者向けの簡潔な状態に言い換える');
const options = { durationSeconds: 60, highSkillMode: 'disabled', initialActionDelayFrames: 60, seed: 1, trials: 16, formationTimelineMode: 'self-only' };
const snapshot = {
  targetId: 'Chloe', apostle: { id: 'chloe' },
  scenario: { capturedAt: 100, savedAt: 50, sessionId: 'first', actors: { self: { stats: { matk: 100 } }, enemy: { stats: { mdef: 80 } } }, cardState: { equipment: ['one'] } },
  skillLevels: { low: 12 }
};
assert.equal(testing.createDpsInputFingerprint(snapshot, options), testing.createDpsInputFingerprint({ skillLevels: { low: 12 }, scenario: { sessionId: 'first', savedAt: 50, capturedAt: 100, cardState: { equipment: ['one'] }, actors: { enemy: { stats: { mdef: 80 } }, self: { stats: { matk: 100 } } } }, apostle: { id: 'chloe' }, targetId: 'Chloe' }, options),
  'key順が違っても同一snapshotは同じfingerprintにする');
const metadataOnlySnapshot = { ...snapshot, scenario: { ...snapshot.scenario, capturedAt: 101, savedAt: 99, sessionId: 'second' } };
assert.equal(testing.createDpsInputFingerprint(snapshot, options), testing.createDpsInputFingerprint(metadataOnlySnapshot, options),
  'capturedAt等の非計算メタデータだけではfingerprintを変えない');
assert.notEqual(testing.createDpsInputFingerprint(snapshot, options), testing.createDpsInputFingerprint({ ...snapshot, scenario: { ...snapshot.scenario, actors: { ...snapshot.scenario.actors, self: { stats: { matk: 101 } } } } }, options),
  '育成ステータス変化をfingerprintで検知する');
assert.notEqual(testing.createDpsInputFingerprint(snapshot, options), testing.createDpsInputFingerprint({ ...snapshot, scenario: { ...snapshot.scenario, cardState: { equipment: ['two'] } } }, options),
  '装備変化をfingerprintで検知する');
assert.notEqual(testing.createDpsInputFingerprint(snapshot, options), testing.createDpsInputFingerprint({ ...snapshot, skillLevels: { low: 13 } }, options),
  'スキルレベル変化をfingerprintで検知する');
assert.notEqual(testing.createDpsInputFingerprint(snapshot, options), testing.createDpsInputFingerprint({ ...snapshot, scenario: { ...snapshot.scenario, actors: { ...snapshot.scenario.actors, enemy: { stats: { mdef: 81 } } } } }, options),
  '敵ステータス変化をfingerprintで検知する');
const externalSnapshot = { ...snapshot, externalEvents: [{ type: 'shieldBreak', frame: 90, reason: '手動' }] };
assert.equal(testing.createDpsInputProjection(externalSnapshot).externalEvents[0].frame, 90,
  'DPS入力projectionへ外部イベントを含める');
assert.notEqual(testing.createDpsInputFingerprint(snapshot, options), testing.createDpsInputFingerprint(externalSnapshot, options),
  '外部イベントの追加・変更をfingerprintで検知する');
assert.equal(testing.getSnapshotFreshness('same', 'same').shouldInvalidate, false,
  'run/mode/detail/baselineクリック相当の同一fingerprintでは最新結果を維持する');
assert.equal(testing.getSnapshotFreshness('before', 'after').shouldInvalidate, true,
  '異なるfingerprintだけを再計算必要にする');
assert.equal(testing.getAutoRunDecision({ autoEnabled: true, fingerprint: 'changed', lastFingerprint: 'old' }), 'schedule',
  '自動計算ONで入力fingerprintが変化したらdebounce対象にする');
assert.equal(testing.getAutoRunDecision({ dpsModeActive: false, autoEnabled: true, fingerprint: 'changed', lastFingerprint: 'old' }), 'none',
  '通常計算タブ中は入力変更があってもDPS自動計算を予約しない');
assert.equal(testing.getAutoRunDecision({ autoEnabled: true, running: true, fingerprint: 'changed', lastFingerprint: 'old' }), 'pending',
  '計算中の入力変更は完了後の1回に保留する');
assert.equal(testing.getAutoRunDecision({ autoEnabled: true, fingerprint: 'same', lastFingerprint: 'same' }), 'none',
  'mode/detail/baselineのような同一入力では自動再計算しない');
const supportedTab = testing.getDpsTabAvailability({ ready: true, support: { supported: true, label: 'クロエ', configuration: '通常' } });
assert.equal(supportedTab.disabled, false, '対応使徒はDPS tabを有効にする');
const unsupportedTab = testing.getDpsTabAvailability({ ready: true, support: { supported: false, reason: '未対応構成です。' } });
assert.equal(unsupportedTab.disabled, true, '未対応使徒はDPS tabをdisabledにする');
assert.match(unsupportedTab.ariaLabel, /未対応構成/, '未対応理由をDPS tabのアクセシブル名へ含める');
assert.equal(testing.getDpsTabAvailability({ ready: false, error: new Error('準備中') }).disabled, false,
  'snapshot API準備中は未対応扱いで永久disableしない');
const activeToUnsupported = testing.getDpsTargetChangeTransition({ previousTargetId: 'chloe', nextTargetId: 'unknown', dpsModeActive: true, supportKnown: true, supported: false, autoEnabled: true });
assert.deepEqual({ ...activeToUnsupported }, { targetChanged: true, clearBaseline: true, cancelRun: true, forceSingle: true, scheduleAuto: false },
  'DPS中に未対応使徒へ変わると基準・実行を破棄して通常へ退避する');
const activeSupportedTargetChange = testing.getDpsTargetChangeTransition({ previousTargetId: 'chloe', nextTargetId: 'barong', dpsModeActive: true, supportKnown: true, supported: true, autoEnabled: true });
assert.deepEqual({ ...activeSupportedTargetChange }, { targetChanged: true, clearBaseline: true, cancelRun: true, forceSingle: false, scheduleAuto: true },
  'DPS中の対応使徒切替は旧基準を解除し、自動計算ONなら再計算対象にする');
const inactiveSupportedTargetChange = testing.getDpsTargetChangeTransition({ previousTargetId: 'unknown', nextTargetId: 'chloe', dpsModeActive: false, supportKnown: true, supported: true, autoEnabled: true });
assert.deepEqual({ ...inactiveSupportedTargetChange }, { targetChanged: true, clearBaseline: true, cancelRun: false, forceSingle: false, scheduleAuto: false },
  '通常表示中の対応可否再評価はDPS modeへの切替・計算を行わない');
assert.equal(testing.getAutoRunCompletionFingerprint('run-fingerprint'), 'run-fingerprint',
  '成功したrunのfingerprintを自動計算の最新値として記録する');
assert.equal(testing.shouldApplyRunResult({ dpsModeActive: true, runToken: 4, currentToken: 4, cancelled: false }), true,
  'DPSタブで同一run tokenの結果だけを適用する');
assert.equal(testing.shouldApplyRunResult({ dpsModeActive: false, runToken: 4, currentToken: 4, cancelled: false }), false,
  '通常タブへ戻った後の遅延結果は適用しない');
assert.equal(testing.shouldApplyRunResult({ dpsModeActive: true, runToken: 4, currentToken: 5, cancelled: false }), false,
  '新しい実行世代がある古い結果は適用しない');
const cancellation = testing.createRunCancellation();
assert.equal(cancellation.cancelled, false, 'run cancellationは初期状態では未中止');
cancellation.cancel();
assert.equal(cancellation.cancelled, true, 'DPSタブ離脱時にrun cancellationを中止状態へできる');
assert.equal(testing.getBaselineComparisonDecision({ hasBaseline: true, hasLatest: true, isFresh: true, axesEqual: true }), 'apply',
  '基準保存後の正常かつfreshなDPS結果は差分を自動適用する');
assert.equal(testing.getBaselineComparisonDecision({ hasBaseline: true, hasLatest: true, isFresh: true, axesEqual: false }), 'axes-mismatch',
  '比較軸不一致の結果は既存差分を消して自動比較しない');
assert.equal(testing.getBaselineComparisonDecision({ hasBaseline: true, hasLatest: false, isFresh: false, axesEqual: false, running: true }), 'running',
  '計算中は既存差分を消したまま完了を待つ');
const dpsFloat = testing.getExclusiveFloatState('dpsSettings');
assert.deepEqual({ ...dpsFloat }, { singleApply: false, singleCompare: false, save: false, dpsSettings: true, dpsCompare: false },
  'DPS設定を開くと他のfloat/popoverを同時に開かない状態にする');
const saveFloat = testing.getExclusiveFloatState('save');
assert.deepEqual({ ...saveFloat }, { singleApply: false, singleCompare: false, save: true, dpsSettings: false, dpsCompare: false },
  '保存popoverを開くとDPS floatを閉じる状態にする');
const nativeApplyOpen = testing.getNativeFloatSyncState(false, 'singleApply');
assert.deepEqual({ ...testing.getExclusiveFloatState(nativeApplyOpen) }, { singleApply: true, singleCompare: false, save: false, dpsSettings: false, dpsCompare: false },
  'native適用floatを開いた後は適用だけを開いた排他状態へ同期する');
const nativeCompareOpen = testing.getNativeFloatSyncState(false, 'singleCompare');
assert.deepEqual({ ...testing.getExclusiveFloatState(nativeCompareOpen) }, { singleApply: false, singleCompare: true, save: false, dpsSettings: false, dpsCompare: false },
  'native比較floatを開いた後は比較だけを開いた排他状態へ同期する');
assert.equal(testing.getNativeFloatSyncState(true, 'singleApply'), 'none',
  'native適用floatを閉じた後は全floatを閉じる状態へ同期する');
assert.equal(testing.getNativeFloatSyncState(true, 'singleCompare'), 'none',
  'native比較floatを閉じた後は全floatを閉じる状態へ同期する');
assert.equal(testing.getDpsFloatOutsideClickAction({ currentMode: 'dps', settingsOpen: true }), 'none',
  'DPS設定panelを開いた状態で外側をclickすると閉じる');
assert.equal(testing.getDpsFloatOutsideClickAction({ currentMode: 'dps', compareOpen: true }), 'none',
  'DPS比較panelを開いた状態で外側をclickすると閉じる');
assert.equal(testing.getDpsFloatOutsideClickAction({ currentMode: 'dps', settingsOpen: true, targetInSettings: true }), null,
  'DPS設定slot内のinput/button操作ではpanelを閉じない');
assert.equal(testing.getDpsFloatOutsideClickAction({ currentMode: 'dps', compareOpen: true, targetInCompare: true }), null,
  'DPS比較slot内のbutton操作ではpanelを閉じない');
const switchedToDpsSettings = testing.getExclusiveFloatState('dpsSettings');
assert.deepEqual({ ...switchedToDpsSettings }, { singleApply: false, singleCompare: false, save: false, dpsSettings: true, dpsCompare: false },
  'DPS比較からDPS設定toggleをclickした場合は排他的に設定panelへ切り替える');
assert.equal(testing.getDpsFloatOutsideClickAction({ currentMode: 'dps', settingsOpen: switchedToDpsSettings.dpsSettings, compareOpen: switchedToDpsSettings.dpsCompare, targetInSettings: true }), null,
  '設定toggle click後にDPS設定panelが開いたstateではdocument handlerが再度閉じず、panel切替を維持する');
assert.equal(testing.getDpsFloatOutsideClickAction({ currentMode: 'single', settingsOpen: true }), null,
  '通常計算modeではDPS float外側click handlerは動作しない');
const breakdown = testing.createDpsBottomBreakdown({
  meanDps: 100,
  byAction: {
    basicAttack: { contributionDps: 20, averageStarts: 10 }, enhancedAttack: { contributionDps: 15, averageStarts: 5 },
    lowSkill: { contributionDps: 25, averageStarts: 2 }, highSkill: { contributionDps: 10, averageStarts: 1 }
  },
  byRuntimeEffect: { tick: { contributionDps: 30, averageTriggers: 4 } }
});
assert.equal(breakdown.length, 5, '4行動とその他の5セルを作る');
assert.equal(breakdown.find(item => item.key === 'other').contributionDps, 30, 'その他は総DPSから4行動を引いた残差にする');
assert.ok(breakdown.every(item => item.contributionDps >= 0), 'その他を含めDPSは非負');
assert.equal(breakdown.reduce((sum, item) => sum + item.contributionDps, 0), 100, '5区分のDPS合計は総DPSと一致する');
assert.equal(breakdown.reduce((sum, item) => sum + item.damageShareP, 0), 100, '5区分の構成比合計は100%になる');
assert.ok(testing.createDpsBottomBreakdown(null).every(item => item.placeholder), '未計算は全セルplaceholderにする');
const trialSummary = testing.getTrialSummary({ trials: 64, seed: 9 }, { evaluatedTrials: 64 });
assert.equal(trialSummary.detail, '統計試行数 64 seed', '指定と実行が一致する時は集計seed数を詳細に表示する');
assert.equal(trialSummary.lastSeed, 72, '詳細は初期seedから実行seed数分の連番範囲を示す');
const truncatedTrialSummary = testing.getTrialSummary({ trials: 256, seed: 1 }, { evaluatedTrials: 64 });
assert.match(truncatedTrialSummary.detail, /指定256 seed \/ 実行64 seed/, 'fallbackで試行数が短縮された時は詳細で指定値と実行値を区別する');
const comparison = testing.createDpsComparison({
  aggregate: { meanDps: 100, totalExpectedDamage: 9000, range: { p10: 8000, p90: 10000 } },
  breakdown: [
    { key: 'basicAttack', contributionDps: 20 }, { key: 'enhancedAttack', contributionDps: 15 },
    { key: 'lowSkill', contributionDps: 25 }, { key: 'highSkill', contributionDps: 10 }, { key: 'other', contributionDps: 30 }
  ]
}, {
  aggregate: { meanDps: 120, totalExpectedDamage: 10800, range: { p10: 9500, p90: 12000 } },
  breakdown: [
    { key: 'basicAttack', contributionDps: 18 }, { key: 'enhancedAttack', contributionDps: 20 },
    { key: 'lowSkill', contributionDps: 30 }, { key: 'highSkill', contributionDps: 12 }, { key: 'other', contributionDps: 40 }
  ]
});
assert.equal(comparison.meanDpsDifference, 20, '全体DPS差分を保持する');
assert.equal(comparison.breakdown.find(item => item.key === 'basicAttack').differenceDps, -2, '個別カテゴリDPS差分を保持する');
assert.ok(Math.abs(comparison.breakdown.find(item => item.key === 'other').percentChange - 100 / 3) < 1e-9, 'その他を含む個別カテゴリの基準比を保持する');
assert.equal(testing.formatSignedDamage(0), '±0', 'ゼロ差分は記号で明示する');
assert.equal(testing.formatSignedDamage(-12), '-12', '負差分は符号で明示する');
assert.equal(testing.formatSignedPercent(10), '+10.0%', '比率差分は符号で明示する');
assert.equal(testing.formatSignedPercent(null), '', '基準DPSが0の比率はゼロと誤表示しない');
assert.equal(testing.formatCompactComparisonDelta(10), '+10.0%', '下バーの比較差分は割合を表示する');
assert.equal(testing.formatCompactComparisonDelta(null), '基準0', '基準DPSが0なら割合なしを短く表示する');
assert.equal(testing.axesMatch({ targetId: 'chloe', enemy: 'same', durationSeconds: 90, highSkillMode: 'disabled', initialActionDelayFrames: 60, seed: 1, trials: 16, formationTimelineMode: 'self-only' }, { targetId: 'chloe', enemy: 'same', durationSeconds: 90, highSkillMode: 'disabled', initialActionDelayFrames: 60, seed: 2, trials: 16, formationTimelineMode: 'self-only' }), false, '初期seedが異なる結果は同じ比較軸として扱わない');

testing.runSimulationWorker({}, { trials: 256, seed: 1, exactTrials: true }, 'aggregate', null, note => {
  assert.match(note, /file:\/\/環境のため同期計算（256 seed）/, 'file protocolでも指定統計試行数を同期集計することを通知する');
}).then(result => {
  assert.equal(result.mode, 'many', 'file protocolではWorkerを作らず同期fallbackで集計する');
  assert.equal(result.workerOptions.trials, 256, 'file fallbackでも指定した統計試行数をそのまま実行値として渡す');
  assert.equal(result.workerOptions.exactTrials, true, 'file fallbackでも実行するseed数を収束短縮しない');
  assert.equal(result.trials, 256, 'file fallbackのaggregate試行数は指定値と一致する');
  assert.equal(result.evaluatedTrials, 256, 'file fallbackのaggregate実行試行数は指定値と一致する');
  assert.equal(new Set(result.trialSeeds).size, 256, 'file fallbackでも各trialは異なるseedを使う');
  console.log('DPS bottom-bar prototype static fixture passed');
}).catch(error => { throw error; });
