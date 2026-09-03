# DPS実装 Status

更新日: 2026-09-03

## 今回の確認（全体ボード下部アイコン）

- 達成度: 100%。全体ボード下部の「合計」表で原寸表示になっていた行見出しアイコンを25pxへ固定した。
- 根拠: `stat-prototype.css`のアイコン配置変更時に、旧来の`tbody th img`サイズ指定が失われ、実表示で5個のステータスアイコンが310pxになっていた。`tbody th > img`へ限定して幅・高さ・中央寄せを復元したため、上側の全体効果値や下部の種別／コストアイコンには影響しない。
- 検証: ローカル実画面のcomputed sizeで、下部合計表の行アイコン25px、種別アイコン18px、コストアイコン25pxを確認。`node tools/test-dps-main-integration.js`、`node tools/test-dps-bottom-bar-prototype.js`、`git diff --check`が成功した。回帰防止の静的検査も追加した。
- キャッシュ: `stat-prototype.css`を`20260903o`へ更新し、`app-cache.js`を`20260903h`へ同期。datasheetとDPS計算処理は変更していない。
- 残り見積もり: なし。必要なら公開環境反映後に同じ箇所を目視確認する。

## 現在地

達成度: 100%（発動経路の監査、共通policy分類、低高binding分割、推定provider接続、設定カードの能力表示、旧保存値の互換読み込み、候補からruntimeまでのbinding接続、保存・cache・公開文面・実画面・回帰テスト確認を完了）

フェーズ: DPS発動経路・入力モード統合Goal完了（ゲーム内未検証部分は暫定／対象外）

旧Goalでbinding、編成候補、自動推定イベント、外部イベント入力の基盤までは実装済みである。一方、再監査で、編成低学年などに効果ごとの自動選択がなく全体設定も初期OFFであること、高学年判定が自由文を拾って竜光剣・エレナ等を誤って初期OFFにすること、低高共有効果が全体OFFになることを確認した。今回の実装ではこれらを使徒固有分岐ではなく共通policy・binding・providerで接続した。旧Goalの100%記録は履歴として残し、新Goalでは最終UI・実画面・全代表fixture確認までを残課題とする。

## 今回の追補タスク（愛用品・アサイド重複防止／アヤ凍傷）

### スライス1: 愛用品・アサイドによる重複処理回避

- 達成度: 100%。編成側のスキル効果収集にも、選択中本人と同じ愛用品スキル置換判定を適用した。愛用品の「スキル変更」は対象行動の置換宣言として扱い、アサイドの追加攻撃回数などは置換と誤認しない。
- 根拠: `formation-damage-calc.js`で編成側の通常スキルを置換対象から除外し、効果ラベルへ置換後スキル名・対象行動・由来タグを付与した。キャロットの実データfixtureで`Kyarot_low_*`が監査に残らず、`Kyarot_favorite_1_e02`が`キャロット / 急成長の樹液発射 [低][愛] / 攻撃力増加`として1行だけ残ることを確認した。
- 検証: `node --check formation-damage-calc.js`、`node tools/test-fdc-action-scoped-addp.js`が成功。

### スライス2: アヤ凍傷の自動発動経路

- 開始宣言: アヤの低学年蝶命中・高学年・愛用品の凍傷付与を実データの構造化runtimeへ接続し、同じ凍傷スタック枠と冷静被ダメージ+8%/スタックを二重計上なしで確認する。ゲーム内未検証部分は既存の暫定タイミングを利用し、datasheetは変更しない。
- 効く完了条件: アヤ凍傷対応、愛用品・アサイド・通常スキルの重複防止、冷静反応の単一登録、暫定処理の明示。
- 達成度: 100%。A2蝶命中・愛用品10秒周期・高学年の凍傷が実データ経路へ接続され、共通スタック枠へ統合された。
- 根拠: `tools/test-fdc-action-scoped-addp.js`で、A2の`Aya_aside_2_e06/e07`を`Aya_low_butterfly`へ結び付け、10秒持続・最大9スタック・`凍傷:stack:9`を確認した。愛用品`Aya_favorite_1_e04/e05`は10秒周期で同じスタック枠へ入り、A2とは別runtimeイベントとして保持した。高学年`Aya_high_e03/e04`は通常行動のstatus定義として同じスタック枠へ入り、冷静の被ダメージ増加は`builtin:frostbite-calm-taken-damage` 1件だけである。
- 実行検証: 同fixtureから`createDpsRuntimeEffects`→`buildCombatantConfig`→`simulate`を通し、低学年の行動とA2蝶命中時の凍傷適用を確認した。`test-fdc-action-scoped-addp`、`test-dps-runtime-effects`、`test-dps-trigger-policy`、`test-dps-main-integration`、`test-dps-bottom-bar-prototype`、`test-dps-audit-state`、`test-dps-support-registry`、`test-public-release-config`、`test-fdc-info-text`が成功した。
- キャッシュ: `formation-damage-calc.js`を`20260903f`、`app-cache.js`参照を`20260903g`へ同期した。datasheetは変更していない。
- 残り見積もり: 今回の追補タスクは完了。ゲーム内でしか確定できないアヤ蝶の復路ヒット数・同一フレーム順・高学年と愛用品の対象重なりは、既存の暫定タイミング／単一seed仕様の範囲に残す。

### スライス3: アヤ凍傷の編成横断表示・適用の確認

- 開始宣言: アヤを編成に置いたまま別の使徒を選択した場合に、アヤの低学年蝶・高学年・愛用品による凍傷付与と、冷静使徒への凍傷被ダメージ増加が表示・runtimeへ届くかを切り分ける。今回は調査のみとし、実装変更は行わない。
- 効く完了条件: アヤ凍傷の自動発動経路、編成効果の表示経路、外部イベント候補への接続状態を単体経路と編成横断経路に分け、未対応範囲を特定する。
- 達成度: 100%（診断スライス）。アヤ単体の対応と、編成内の別使徒へ共有される対応が別であることを確定した。
- 根拠: `createDpsStructuredRuntimeEvents`は選択中使徒の`apostle`だけを構造化し、`buildFormationSkillEffectOptions`はダメージ補正を持たない状態付与行を除外する。そのためアヤの凍傷付与行は、アヤ以外を選択した場合のaudit・runtime・編成イベント候補へ届かない。`dps-simulator.js`の`builtin:frostbite-calm-taken-damage`は存在するが、別使徒へ凍傷スタックを付与するイベントがないため、それだけでは発動しない。
- 検証: `node tools/test-fdc-action-scoped-addp.js`が成功したが、既存fixtureは`members: [aya]`の単体ケースで、アヤを含む別使徒選択の回帰を含まない。`git diff --check`も成功した。
- 残り見積もり: 実装する場合は、編成所有者アヤの凍傷イベントを選択対象のruntime・表示へ共有し、A2・高学年・愛用品を同一スタック枠で重複なく扱う回帰テストを追加する1〜2スライスが必要。

### スライス4: アヤ凍傷反応の編成横断共有

- 開始宣言: 前スライスで特定した未対応範囲のうち、編成内の別使徒へ凍傷のダメージ増加反応だけを共有する。アヤの低学年・高学年・愛用品による凍傷付与イベントは選択中本人へ複製しない。
- 効く完了条件: アヤ凍傷の自動発動経路と編成横断経路を分離し、既存の冷静反応を同一IDで1件だけruntime／シミュレータへ渡す。
- 達成度: 100%。アヤを含む編成で別の冷静使徒を選択した場合だけ、`builtin:frostbite-calm-taken-damage` の定義をruntimeへ追加する経路を実装した。冷静以外、またはアヤ不在の編成には追加しない。
- 根拠: `createDpsFormationStatusReactions`で対象の性格と編成内アヤを確認し、`createDpsRuntimeEffects`で既存の`statusReactions`とID重複を除いて統合する。シミュレータの既存組み込み反応も同じIDを確認してから追加するため、アヤ単体・別使徒のどちらも1件になる。凍傷付与イベントは`createDpsStructuredRuntimeEvents`の選択中本人経路だけに残した。
- 検証: `node --check formation-damage-calc.js`、`node tools/test-fdc-action-scoped-addp.js`、`node tools/test-dps-runtime-effects.js`、`node tools/test-dps-main-integration.js`、`node tools/test-dps-bottom-bar-prototype.js`、`git diff --check`が成功した。テストではアヤA2・高学年・愛用品の重複なし、シーラへの共有1件、シミュレータ組み込み反応との二重登録なしを確認した。
- 残り見積もり: 今回の依頼分は完了。凍傷スタック自体がない場合は反応を適用せず、別使徒へアヤの凍傷付与まで共有すること、蝶の復路ヒット数・同一フレーム順は別課題として残す。

### スライス5: 凍傷スタック適用確認

- 開始宣言: 前スライスの編成横断反応共有が、凍傷スタックの付与・期限・上限・ダメージ補正と矛盾しないかを確認する。今回は確認のみとし、実装変更は行わない。
- 効く完了条件: アヤ単体の凍傷スタック処理と、別編成使徒へ共有した反応定義の適用範囲を切り分ける。
- 達成度: 100%（確認スライス）。アヤ単体ではA2・高学年・愛用品が`凍傷:stack:9`へ入り、最大9スタック・個別期限・有効スタック数×8%の冷静被ダメージ増加へ接続されることを確認した。
- 根拠: `dps-simulator.js`の状態定義・`applyStatusApplication`・`getStatusReactionTakenDmgP`が、同じstackGroupIdの凍傷を積み上げ、期限切れを除外し、直接攻撃とDoT tickの評価へ反応補正を渡す。別編成使徒へは反応定義だけを共有し、アヤの付与イベントは共有しないため、凍傷スタックがなければ補正は発生しない。
- 検証: `node tools/test-fdc-action-scoped-addp.js`、`node tools/test-dps-runtime-effects.js`は成功済み。構造化runtimeでA2・愛用品の凍傷付与、高学年の状態定義、編成横断反応1件を確認した。
- 残り見積もり: 今回の確認は完了。別編成使徒のタイムラインへアヤ由来の凍傷スタックまで共有する場合は、今回の「ダメージアップ効果のみ」から範囲を広げる別設計が必要。

## アクティブGoal完了条件の現在地

- 条件1: 完了。生成スキル98行、カード由来34行、編成側76発動元fixtureをread-only監査し、runtime 100行でpolicy未付与0件・発火経路なし0件を確認した。編成候補は8件で全件に分類とbindingを持つ。
- 条件2: 完了。本人効果・既知周期を自動処理し、編成の普通・強化・低学年は`自動（推定）`へ接続した。周期候補7件に間隔欠落はなく、手動指定時は自動推定を止める。
- 条件3・4: 完了。構造化された高学年判定、低高共有bindingの分割、高学年側初期OFF、明示AUTO/OFFの優先を実装し、合成fixtureと実データ監査で回帰した。
- 条件5・7: 完了。周期候補の発動秒・間隔・回数をbinding単位で手動上書きでき、設定schema v2、旧保存値の互換読み込み、比較fingerprintへの一時イベント合成、候補追加時のbinding一致を確認した。
- 条件6・8・9: 完了。真の外部条件を外部入力待ちとして保持し、本体と試験版で共通policy/providerを使用する。竜光剣、エレナ強化ドローン、ロレット低学年、キャロット低学年、低高共有、キャロットA2を代表fixture／監査で確認した。
- 条件10: 完了。構文、代表回帰、監査、cache参照、公開文面、PC／スマホ表示、通常計算詳細を確認した。main公開文面の内部ID・デバッグ／試験用文面は0件、下バー高さは86pxを維持した。
- 次のスライス: なし。ゲーム内検証が必要な敵AI・被弾・命中・撃破・同フレーム順序などは、仕様書と台帳に暫定／対象外として残す。

## 旧Goal完了条件ごとの進捗（履歴）

- 条件1: 完了（現行ゴールの暫定範囲）
  - 根拠: 行動、モーション、攻撃速度、SP、CT、状態、リソース、追加効果、公開タイムラインの基盤に加え、状態付与・更新・終了、リソース増減、低学年／高学年命中・終了・最終ヒット、最大スタック消費の共通フックが `dps-simulator.js` にある。実データのシオン低学年で直接リソース行と構造化イベントの二重発火を検出し、1回へ統合した。VIVI／Gabia／キャロット／スノーキーの外部条件も同じ共通時計の入力境界へ接続した。同一フレーム順、多段・生成物の細部、ゲーム内丸めは暫定規則として仕様書・台帳に残し、根拠なく自動推測しない。
- 条件2: 完了
  - 根拠: 行動別適用効果、単一seedタイムライン、ダメージ推移、外部イベント、モーション情報の表示実装があり、タイムラインへ暫定・補完・外部指定の表示を追加した。実画面のモバイル／デスクトップで、詳細パネル内の縦スクロール、効果とタイムラインの縦配置、横方向のはみ出しなし、通常攻撃間隔・モーション硬直表示を確認した。非ゼログラフ、0〜90秒・10秒刻み軸、基準線、非ゼロ比較差分も確認済み。
- 条件3: 完了
  - 根拠: DPS計算設定フロート、外部イベント入力、比較表示、再計算中表示、通常計算との統合がある。モバイル／デスクトップで設定フロートの開閉と幅を確認し、外部イベントの追加・削除でフロートが閉じないこと、閉じて再開しても設定値が保持されることを確認した。再計算中スピナー、0→0時の`±0`、狭い幅の詳細展開、攻撃力変更による非ゼロ差分も確認済み。
- 条件4: 完了（暫定記録を含む）
  - 根拠: `docs/dps-specification.md`、`docs/dps-simulation-design.md`、`docs/dps-effect-inventory.md`、`docs/dps-implementation-roadmap.md` に暫定タイミングと検証待ち項目があり、状態／リソース／境界イベント、範囲消費、ID統合、直接行との二重処理防止、最終ヒット・最大スタック消費、外部発生のみ条件の自動適用境界を対象ID単位で台帳へ追記した。タイムラインの品質区分、外部待ち、発動元ID省略時の扱い、キャロットA2・スノーキーの実データ確認も記録した。敵側イベントの自動検出やゲーム内未検証の処理順は、完了扱いにせず次段階として明示している。
- 条件5: 完了
  - 根拠: 下バー、main integration、runtime effects、trigger policy、FDC実データ、audit state、support registry、public release、info text、max-growth、各構文、`git diff --check` が今回の差分込みで成功した。複数の非ゼロ構造化外部イベント、通常計算詳細、公開本文、cache参照を監査し、fixtureは検証後に復元した。
- 条件6: 完了
  - 根拠: datasheetの直接変更はなく、既存の未コミット変更を維持している。`GOAL.md` と `STATUS.md` の正本は `trickcal-manager` 内に置き、変更したポリシー・詳細controller・simulator・app-cacheのキャッシュバスターを揃えた。未知イベントのfallback表示から内部ラベルを除外し、外部イベントの発動元ID省略時と候補追加時の絞り込みを仕様書・テストへ残した。最終差分と引き継ぎ状態を確認済み。

## 実装済み・試験実装

- DPS詳細への行動別適用効果、単一seed行動タイムライン、外部イベント、ダメージ推移表示。
- 再計算中も下バーを残す表示、公開タイムラインへの状態遷移統合。
- 攻撃速度・リソース変化の共通状態ログと内部IDを隠した公開表示。
- 状態付与・更新・終了、リソース獲得・消費、低学年／高学年スキル命中・終了を起点にした効果連鎖の共通フック。
- 範囲指定の固有リソース消費を単一seedで抽選し、暫定フラグと変更根拠を保持する処理。
- skillmotionの直接リソース／状態行と構造化イベントの同一ステップを照合し、二重発火を防止する処理。
- 複数ダメージイベントの最後だけを対象にする最終ヒット条件と、明示された最大スタック消費の処理。
- ピラの輝く名刺の所有者単位スタック分離。
- 状態発動・回復・生成物生成・対象変更・戦闘不能・シールド終了など、外部発生のみ条件を外部入力なしで自動発火しない共通ポリシー。
- 本人・編成のシールド終了効果を外部イベント待ちへ接続し、発動元IDなしの手動イベントと候補追加イベントを共通ランタイムへ渡す処理。
- VIVIのシールド終了防御低下、Gabiaのシールド終了ダメージ、キャロットA2のシールド破壊時SP回復、スノーキーのシールド終了物理防御低下を実データ経路で監査・回帰する処理。
- タイムラインの暫定時刻・終了時補完・外部指定・初期対象仮定の利用者向け表示と、未知イベントfallbackの内部ID除去。

## 暫定・検証待ち

- ゲーム内の同一フレーム処理順、フレーム丸め、状態終了直後の派生効果の順序。
- リソースのランダム消費量、上限/下限で実際の増減がない操作の発動扱い、リソースIDの対応。
- 範囲消費のseed抽選値、状態・リソースの同一フレーム順、実データでのID別効果連鎖は未検証。現在は実際の増減のみを起点にする安全側の暫定処理。
- 低学年/高学年の命中・終了を起点にする効果、効果連鎖、状態付与者の扱い。
- 編成全体の被弾、撃破、敵行動、対象変更などの外部イベント発生時刻。
- 多段攻撃・生成物・対象数による発生回数と倍率分配。
- 状態発動・回復・生成物生成などの発生元を編成全体タイムラインへ接続すること。
- シールド終了以外の外部条件、敵側タイムライン、フル編成DPSは次段階。現行ゴールではゲーム内でしか確定できない発動順・丸め・多段／生成物の細部とともに、推測発火せず暫定台帳へ残す。

## スライス0の終了報告

- 達成度: ゴールと完了条件を現行のDPS残実装へ再定義し、実装順・暫定処理ルール・非目標を明文化した。
- 根拠: `GOAL.md` を更新し、既存実装・仕様書・検証待ち項目を条件1〜6へ対応付けた。
- 残り見積もり: 実装スライス4〜6回、最後にUI実画面確認・仕様書/台帳整理・キャッシュ整合・対象テスト一式。

## スライス1の終了報告

- 達成度: 約50%。状態付与・更新・終了、リソース増減、低学年／高学年の命中・終了を共通時計へ接続し、範囲消費の暫定情報とID統合を実装した。
- 根拠: `dps-simulator.js` の共通遷移フック、`formation-damage-calc.js` の構造化イベント／runtime effect変換、`dps-trigger-policy.js` の分類、台帳追記、対象テスト一式の成功。
- 残り見積もり: 実装スライス3〜5回。次は実データでの構造化イベント接続と監査、その後に詳細・設定・比較の実画面確認、最終テストと公開漏れ確認を行う。

## スライス2の終了報告

- 達成度: 約55%。実データのFDC構造化イベントを対象ID・発動条件・処理順で監査し、シオン低学年の魔弾二重発火を修正した。ピラの`Pira_wealth`と1〜30範囲消費も確認した。
- 根拠: `tools/test-fdc-action-scoped-addp.js` にシオン／ピラの実データ経路テストを追加し、FDC変換、シミュレーター、下バー、本体統合、通常計算回帰、構文、差分検査がすべて成功した。台帳へ直接行と構造化行の二重処理防止を追記した。
- 残り見積もり: 実装スライス2〜4回。効果連鎖の未対応パターン、暫定表示、編成全体イベント、詳細・設定・比較の実画面確認を残している。

## スライス3の終了報告

- 達成度: 約60%。低学年／高学年の最終ヒット条件を最後のダメージイベントへ限定し、クロエの最大スタック到達後の明示消費を構造化イベントへ反映した。
- 根拠: `tools/test-dps-runtime-effects.js` で複数ヒットの最終イベント境界を確認し、`tools/test-fdc-action-scoped-addp.js` でヘイリーの最終ヒット変換とクロエの最大スタック消費を実データ確認した。対象テスト一式、構文、統合、差分検査が成功した。
- 残り見積もり: 実装スライス1〜3回。安全に自動化できる生成物／状態発動の棚卸し、暫定表示、編成全体イベント、詳細・設定・比較の実画面確認を残している。

## スライス4の終了報告

- 達成度: 約63%。外部イベント候補として分類できる条件のうち、単体時計だけでは発生を決められない条件を共通ポリシーへ明示し、外部入力指定がない本人効果を周期・行動境界へ推測接続しないようにした。
- 根拠: `dps-trigger-policy.js` に外部発生のみ条件の判定を追加し、シールド終了、状態発動、回復、生成物生成、対象変更、味方戦闘不能などについて自動適用と外部委譲を別々に検査した。`docs/dps-effect-inventory.md` の実装境界・候補分類も更新し、simulator、FDC実データ、下バー、main integration、通常計算回帰、構文、差分検査が成功した。
- 残り見積もり: 実装スライス2〜3回。編成全体イベントのモデル化は推測せず候補として維持し、次は暫定注記・公開表示と詳細／設定／比較の実画面確認へ進む。

## スライス5の終了報告

- 達成度: 約66%。単一seedタイムラインの表示境界で、暫定時刻・終了時補完・外部指定・初期対象仮定を利用者向け文言へ変換し、未知イベントの内部ラベルを公開しないようにした。詳細の行動別適用効果・タイムライン・「続きを表示」の構造は維持した。
- 根拠: `formation-damage-dps-prototype.js` の表示関数へ品質サフィックスとfallbackラベルの公開変換を追加し、`tools/test-dps-bottom-bar-prototype.js` で各品質表示、details構造、内部ID非表示を確認した。ポリシー境界、DPSランタイム、実データFDC監査、main integration、通常計算回帰、構文、差分検査も成功した。変更したポリシー・controller・app-cacheのqueryを`20260901c`へ揃えた。
- 残り見積もり: 実装スライス1〜2回。実画面の開閉・狭幅・通常詳細回帰、比較表示と設定保持を確認し、最後に公開漏れ・差分・台帳を整理する。

## スライス6の終了報告

- 達成度: 約70%。本体DPS下バー詳細をモバイル／デスクトップで開き、行動別適用効果と単一seedタイムラインが縦に並び、タイムラインが縦スクロールできること、通常攻撃間隔（補正前／補正後）と各モーション硬直が表示されることを確認した。DPS計算フロートは外部イベントの追加・削除、閉じて再開する操作でも開いた状態と設定値を維持した。通常タブへ戻した後も通常計算詳細を開閉できた。
- 根拠: ブラウザの実画面計測で、モバイル390px幅の詳細パネルは横スクロールなし、タイムラインも横スクロールなし、デスクトップでも詳細パネルとタイムラインの横幅が収まることを確認した。`node --check`（simulator／DPS本体）、下バー、main integration、runtime effects、trigger policy、実データFDC、`git diff --check` がすべて成功した。現fixtureのDPS結果が0のため、グラフは非ゼロ軸・比較線の目視までは未完了だが、グラフ領域のレイアウトは詳細内に収まっている。
- 残り見積もり: 実装スライス1回程度。非ゼロ結果でグラフ・比較・再計算中表示を確認し、内部ID／試験文面の最終漏れ、差分と仕様書・台帳を整理する。

## スライス7の終了報告

- 達成度: 約73%。本体ページのDPS詳細を開いた状態で公開文面を監査し、内部ID・デバッグ／試験用文面が表示されていないことを確認した。DPS設定フロートの再開保持、外部イベント追加・削除後のフロート保持、通常計算詳細への復帰は前スライスの実画面確認と合わせて完了した。
- 根拠: `formation-damage-calc.html` をブラウザで読み込み、通常表示とDPS詳細表示の `body.innerText` および表示要素を監査した結果、`__exclusive`、内部favorite ID、`デバッグ`、`試験用`、`試験版` は該当なしだった。DPS詳細・タイムライン・グラフ領域の横幅も実測し、モバイル／デスクトップで横方向のはみ出しはなかった。対象構文・下バー・main integration・runtime effects・trigger policy・実データFDC・差分検査は再度成功した。
- 残り見積もり: 実装スライス1回程度。DPS結果が0にならない既存fixtureで、比較差分・再計算中スピナー・10秒軸の非ゼログラフを目視し、最終差分と仕様書・台帳を整理する。

## スライス8の終了報告

- 達成度: 約78%。既存の最大育成表示検証fixtureを一時適用して攻撃側の非ゼロDPSを取得し、詳細内のダメージ推移グラフを目視確認した。横軸は0〜90秒を10秒刻みで表示し、ラベルは水平のまま収まり、基準保存後の基準線・基準値表示も確認した。再計算中は直前のDPSを残したまま、全体期待DPSカード左上のスピナーが回転することを確認した。
- 根拠: ブラウザ実画面で非ゼロDPS（44,838）、グラフの発生点、縦方向タイムライン、通常攻撃間隔・モーション硬直を確認した。0→0比較では`±0`、`基準比 ±0.0%（差分 ±0 DPS）`を確認した。詳細展開中にDPS設定フロートを開いてもデスクトップ／390px幅で画面外へ出ず、外部イベントの追加・削除後もフロートが開いたままになることを確認した。原因となった展開時のポップオーバー位置をCSSで修正し、本体・prototype・app-cache・静的テストのcache-bustを`20260902`版へ揃えた。fixtureと攻撃側表示は検証後に復元した。
- 検査: `node --check formation-damage-dps-prototype.js`、下バー、main integration、runtime effects、trigger policy、実データFDC、`git diff --check` が成功した。
- 残り見積もり: 実装スライス1〜2回。非ゼロ条件差分の比較表示を追加確認し、最終差分・仕様書・台帳・公開画面を整理する。ゲーム内検証が必要な共通時計の順序、編成全体イベント、多段・生成物の発生回数は暫定扱いを維持する。

## 次の1スライス開始宣言

- 次の1スライスで行うこと: 非ゼロ条件差分の比較表示を可能な既存操作で追加確認し、仕様書・台帳・キャッシュ・未コミット差分を最終監査する。追加の実装が必要な場合は、暫定処理の範囲を越えない局所修正に限定する。
- 効く完了条件: 条件2、条件3、条件4、条件5、条件6。

## スライス9の終了報告

- 達成度: 約81%。DPS比較軸へ自キャラの全入力が混入し、攻撃力などの変更を「比較軸不一致」として拒否していた不具合を修正した。敵側入力だけを比較軸へ残し、同じ使徒・同じ敵条件で自キャラ設定の差分を比較できるようにした。
- 根拠: `formation-damage-dps-prototype.js` に比較軸生成と敵入力抽出を追加し、`tools/test-dps-bottom-bar-prototype.js` で自キャラ攻撃力変更は同一軸、敵防御力変更は軸不一致になることを検査した。ブラウザでは表示検証fixtureを一時適用し、ヴィヴィの攻撃力`19,476`→`20,000`で全体`15,095`→`15,669`、全体差分`+3.8%`・`+574 DPS`、基本／強化も`+3.8%`を確認した。検証後はfixtureを復元し、通常画面・元の攻撃力`110`・通常モードへ戻した。
- 仕様・キャッシュ: `docs/dps-specification.md` の比較軸ルールを更新し、本体・試験版・cache manifest・静的テストのcontroller queryを`20260902c`へ統一した。datasheetは変更していない。
- 検査: `node --check formation-damage-dps-prototype.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-dps-main-integration.js`、`node tools/test-dps-runtime-effects.js`、`node tools/test-dps-trigger-policy.js`、`node tools/test-fdc-action-scoped-addp.js`、`git diff --check` が成功した。
- 残り見積もり: 実装スライス1回程度。効果連鎖・編成全体イベント・ゲーム内未検証の時計順序は暫定扱いを維持し、最終公開文面、仕様書・台帳、未コミット差分、通常計算回帰を要件単位で監査して引き継ぎ状態を確定する。

## 次の1スライス開始宣言

- 次の1スライスで行うこと: 完了条件1〜6を現行コード・テスト・実画面・仕様書・台帳に照合し、未実装または根拠不足の項目を追加実装せず明示的に整理する。公開画面へ内部ID／試験文面が漏れていないことと、通常計算詳細の回帰を最終確認する。
- 効く完了条件: 条件1、条件2、条件3、条件4、条件5、条件6。

## スライス10の終了報告

- 達成度: 約82%。完了条件1〜6を現行のコード・テスト・実画面・仕様書・台帳へ照合し、比較・表示・キャッシュ・通常詳細について不足していた差分を解消した。ゴール全体は、共通時計の効果連鎖網羅と編成全体イベントが残るため継続とした。
- 根拠: 公開本体で通常計算詳細を開閉し、元に戻ること、公開本文に内部ID／デバッグ／試験用文面がないことを確認した。`formation-damage-dps-prototype.js` の比較軸修正に対する自キャラ／敵条件テスト、全対象テスト、構文検査、`git diff --check` が成功した。`formation-dps-calc.html` と`stat-dashboard.html`の`app-cache.js`参照も最新化した。
- 残り見積もり: 実装スライス2〜3回。実データで安全に接続できる状態・リソース・生成物・多段効果の未対応パターンを1つずつ選び、共通時計・公開タイムライン・効果監査・回帰テストへ接続する。ゲーム内でしか確定できない順序・丸め・編成全体イベントは暫定台帳へ残す。

## 次の1スライス開始宣言

- 次の1スライスで行うこと: VIVI以外のシールド終了系実データ（Gabiaの終了ダメージ、Snorkyの防御低下、Kyarotの破壊時回復など）から1件を選び、今回の外部イベント境界で構造化効果が同じタイムラインへ届くかを実データ経路で検証し、不足する変換だけを追加する。
- 効く完了条件: 条件1、条件2、条件4、条件5、条件6。

## スライス11の終了報告

- 達成度: 約85%。シールド終了・破壊などの外部発生条件を、選択中本人も含めて外部イベント入力待ちとしてDPSランタイムへ接続した。発動元IDを知らない手動イベントは同種トリガーのワイルドカードとして扱い、編成候補追加時は発動元情報を保持する境界を追加した。
- 根拠: `formation-damage-calc.js` の外部条件判定・監査・ダメージ補正変換、`dps-simulator.js` の外部イベント／構造化イベント照合を更新した。実データFDCテストでVIVI低学年のシールド終了行を監査へ保持し、`externalTimed`・40%防御低下・120Fの手動シールド終了を確認した。シミュレータ単体では発動元IDなしのシールド終了イベントから状態連鎖が起動することを確認した。
- 仕様・台帳: `docs/dps-specification.md`、`docs/dps-simulation-design.md`、`docs/dps-effect-inventory.md` を更新し、本人／編成の外部待ち、ID省略時の扱い、候補追加時の絞り込み、VIVI・Snorky系の暫定状態を記録した。datasheetは変更していない。
- 検査: `node --check formation-damage-calc.js`、`node --check dps-simulator.js`、下バー、main integration、runtime effects、trigger policy、FDC実データ、audit state、support registry、public release、info text、max-growth、`git diff --check` がすべて成功した。
- 残り見積もり: 実装スライス2〜3回。外部イベントの実データ構造化効果を追加で1〜2件確認し、編成全体イベント・自動検出・ゲーム内未検証の時計順序は暫定台帳へ残す。最後に公開差分とSTATUS／仕様書の整合を確認する。

## スライス12の終了報告

- 達成度: 約88%。VIVIの防御低下に続き、Gabiaのシールド終了時ダメージを外部イベント入力から構造化攻撃効果へ接続した。シールド自体の状態付与と、シールド終了／破壊時に発生するダメージを分類上も分離し、選択中本人の外部条件を監査・ランタイムへ残せる状態を維持した。
- 根拠: `formation-damage-calc.js` のシールド終了／破壊ダメージ分類、`dps-simulator.js` の外部イベント発動元照合、`tools/test-fdc-action-scoped-addp.js` の実データGabiaイベント・120F手動イベント・単発ダメージ確認、`tools/test-dps-runtime-effects.js` の発動元IDなし入力確認が成功した。発動元IDなしは同種イベントのワイルドカード、候補由来イベントは発動元で絞り込む仕様を維持している。
- 仕様・キャッシュ: `docs/dps-specification.md`、`docs/dps-simulation-design.md`、`docs/dps-effect-inventory.md` を更新し、VIVI／Gabiaの外部イベント境界と暫定扱いを記録した。`dps-simulator.js` は`20260902d`、`formation-damage-calc.js` は`20260902f`へ参照を統一し、静的テストの期待値も同期した。datasheetは変更していない。
- 検査: 下バー、main integration、runtime effects、trigger policy、FDC実データ、audit state、support registry、public release、info text、max-growth、各構文、`git diff --check` が成功した。旧キャッシュ参照の検索結果も該当なしだった。
- 残り見積もり: 実装スライス1〜2回。シールド破壊時のSP回復など、リソースへ直接つながる外部イベントを1件追加確認し、編成全体イベント・自動検出・ゲーム内未検証の時計順序は暫定台帳へ残す。最後に公開差分とSTATUS／仕様書の整合を確認する。

## 次の1スライス開始宣言

- 次の1スライスで行うこと: キャロットのシールド破壊時SP回復を候補効果・外部イベント・共通リソース更新へ接続できるか監査し、既存のSP回復処理へ重複なく接続する。意味が確定できない部分は実装せず暫定台帳へ残す。
- 効く完了条件: 条件1、条件2、条件4、条件5、条件6。

## スライス13の終了報告

- 達成度: 約90%。キャロットA2のシールド破壊時SP回復を実データ経路で確認した。新しい変換処理を増やさず、既存の`spRecoveryEffects`外部モードが監査行を共通SP更新へ接続し、周期SP回復や構造化イベントとの二重登録を避けていることをテストで固定した。
- 根拠: `tools/test-fdc-action-scoped-addp.js` でA2段階2、`Kyarot_aside_2_e03`、45SP、外部条件待ち、発動元IDなしの120Fイベント、`spRecoveryEvent` 1件、最終要求量45を確認した。キャロットのA2効果を編成候補の周期へ誤推定せず、イベント駆動型として扱う境界も確認した。
- 仕様・台帳: `docs/dps-effect-inventory.md` にキャロットA2の独立SP回復を追加し、`docs/dps-specification.md` と `docs/dps-simulation-design.md` に毎秒SP回復との分離、外部入力時の共通SP加算、発動元ID省略時の扱いを記録した。datasheetは変更していない。
- 検査: FDC実データ、runtime effects、main integration、下バー、trigger policy、audit state、`git diff --check` が成功した。
- 残り見積もり: 実装スライス1〜2回。同じシールド破壊系のスノーキー敵防御低下を追加確認し、最後に未接続パターン・編成全体イベント・自動検出・ゲーム内未検証の時計順序を暫定台帳へ整理して、最終回帰と引き継ぎ状態を確定する。

## 次の1スライス開始宣言

- 次の1スライスで行うこと: スノーキー低学年のシールド終了時物理防御低下を、VIVIの外部時限ダメージ補正と同じ経路で実データ監査・ランタイム・手動イベントまで確認する。状態付与と終了時デバフの重複発火がないことも検査する。
- 効く完了条件: 条件1、条件2、条件4、条件5、条件6。

## スライス14の終了報告

- 達成度: 約93%。スノーキー低学年のシールド終了時物理防御低下を実データ経路で確認し、VIVI・Gabia・キャロットと合わせて、外部イベント入力を必要とする本人効果の代表的なダメージ／デバフ／SP回復を監査・ランタイムへ接続した。外部入力がない場合の推測発火、状態付与と終了時効果の二重発火は発生させない。
- 根拠: `tools/test-fdc-action-scoped-addp.js` でスノーキー低学年の`Snorky_low_e03/e04`を1行へ統合し、`externalTimed`、物理防御低下50%、発動元IDなしの120Fシールド終了イベント、`runtimeBuffApplied`を確認した。キャロットA2のSP回復テストも同じ回帰で成功した。
- 最終監査: `GOAL.md`の完了条件1〜6をコード、テスト、実画面確認記録、仕様書、台帳、cache、未コミット状態へ照合した。DPS下バー詳細、設定フロート、通常計算詳細、比較、再計算中表示、狭幅表示は既存の実画面確認記録で根拠を保持している。今回の全対象テスト、構文、`git diff --check`は成功し、旧cache参照は該当なし、datasheet変更もない。
- 残り見積もり: 現行ゴールの必須作業は完了。敵行動・被弾・撃破の自動検出、フル編成DPS、ゲーム内でしか確定できない同一フレーム順・丸め・多段／生成物の細部は、`GOAL.md`の非目標または次段階の検証台帳として残す。これらを根拠なく拡張実装しない。

## スライス15の開始宣言

- 次の1スライスで行うこと: ギデオンA2の追加攻撃回数を元の低学年倍率へ上書きせず、元の低学年候補を残したまま、遺物数0〜3のA2別候補として表示する。DPSプロファイルへ表示用候補を混入させない。
- 効く完了条件: 条件1、条件2、条件5、条件6。

## スライス15の終了報告

- 達成度: 約93%を維持。ギデオンA2の単発表示を、元の低学年分岐とA2別分岐へ分離した。元の`600/900/1200/1500%`を保持し、A2は1回の物理ダメージを基準に遺物数0〜3で`1200/1500/1800/2100%`（4〜7回）を生成する。
- 根拠: `formation-damage-calc.js` で追加攻撃回数を元候補へ適用しない経路と、A2等の別候補生成を追加した。A2別候補は`excludeFromDps`としてDPSプロファイルから除外し、DPSは既存の行動タイミング側のヒット数だけを利用する。`tools/test-fdc-action-scoped-addp.js` で元候補保持、A2候補4件、4〜7回、A2未解放時の非表示、DPS二重計上防止を確認した。
- 検査: `node --check formation-damage-calc.js`、FDC実データ、main integration、runtime effects、下バー、`git diff --check` が成功した。datasheetは変更していない。ブラウザによる今回の表示確認はローカルファイルURLがブラウザ側のURLポリシーで拒否されたため未実施。
- 残り見積もり: 今回の局所修正に残作業なし。ゲーム内でしか確定できない同一フレーム順・丸め・多段／生成物の細部、敵行動・被弾・撃破の自動検出、フル編成DPSは従来どおり暫定台帳または次段階として残す。

## スライス16の開始宣言

- 次の1スライスで行うこと: 現在の時系列効果設定をバックアップし、設定UIへ出る効果、ランタイムだけが持つ効果、外部イベント待ち、初期方針、保存値、検証品質の境界を棚卸しする。実装は変更せず、設計と次期Goal案を作る。
- 効く完了条件: 条件4、条件6、および次期Goalの完了条件定義。

## スライス16の終了報告

- 達成度: 現行Goalは約93%を維持。今回の設計スライスは100%。高学年関連の時系列効果を使徒・効果単位で初期OFFにし、明示AUTOを保存する現状を`9716b59`として`origin/main`へバックアップした。その後、ランタイム挙動を変えずに不足分類と次期Goal案を作成した。
- 根拠: `docs/dps-runtime-effect-settings-design.md` に、現在の全collectionと設定UIの対応、AUTOと外部入力待ちの混同、未表示の`spRegenEffects`・状態・リソース、表示文言ヒューリスティック、保存値と初期値の境界を記録した。発動能力・初期方針・利用者設定・検証品質を分離するモデル、実装前のread-only監査、6件の完了条件と推奨スライスを定義した。`docs/dps-effect-inventory.md` の標準設定説明も、現在の高学年関連初期OFFと明示AUTO保存へ合わせた。datasheetは変更していない。
- 残り見積もり: 次期Goalを採用する場合は6スライス程度。最初の1スライスで全効果の対象母数と未分類件数を確定し、その結果に応じて実装対象を調整する。現時点では次期Goalは未アクティブで、ランタイム挙動の変更もない。

## 新Goal スライス1の開始宣言

- 次の1スライスで行うこと: 全76使徒の生成スキル効果を、通常／強化／低学年／高学年の各行動からread-only監査し、ランタイムcollection別の対象母数、設定UI漏れ、外部入力待ち、条件メタデータ欠落を確定する。実装挙動とdatasheetは変更しない。
- 効く完了条件: 新Goalの条件1、条件2、条件3。

## 新Goal スライス1の終了報告

- 達成度: 新Goalは約15%。スライス1を完了し、全76使徒の生成スキル効果を基準に、ランタイム98行の棚卸しを終えた。
- 根拠: `tools/audit-dps-runtime-effect-settings.js`を追加して実行した。collection内訳は攻撃速度20、ダメージ補正34、毎秒SP補正4、SP回復20、CT3、イベント17。合成条件内のeffect ID重複は0件、外部入力待ちは4件、発動条件欄が空の行は35件だった。設定UIは6collection中5collectionで、`spRegenEffects`が未表示。`initialTargetStatuses`、`statusReactions`、`statusDamageWeaknessP`、`resources`は補助ランタイム情報で、今回の条件では存在使徒数が1、0、0、2だった。監査開始時点で98件すべてに未付与だったpolicyメタデータは、スライス2の共通resolver追加後の再監査で未付与0件になった。
- 設計反映: `docs/dps-runtime-effect-settings-design.md`へ監査条件・結果・優先順位を追記し、次のスライスの基準母数を確定した。高学年関連の初期OFFと明示AUTO保存を含む実装バックアップ`9716b59`は既に`origin/main`へpush済み。datasheetと既存ランタイム挙動は変更していない。
- 残り見積もり: 新Goalは約5スライス。次はpolicyメタデータと実効状態resolverの設計・実装を、本体DPSとDPS試験版で共通利用できる形へ接続する。カード・編成効果は生成スキル効果と母数を分けて追加監査する。

## 新Goal スライス2の開始宣言

- 次の1スライスで行うこと: 発動能力、初期モード、発動ドメイン、固定対応、品質、理由を返す共通policy resolverを追加し、本体DPSとDPS試験版の高学年判定・初期モード判定を置き換える。FDCの各ランタイムcollectionへ監査用メタデータを付与する。既存の計算結果と外部イベントの発火経路は維持する。
- 効く完了条件: 新Goalの条件1、条件2、条件3。

## 新Goal スライス2の終了報告

- 達成度: 新Goalは約30%。共通policy resolverの接続を完了した。高学年関連の初期OFF・明示AUTO保存は従来どおり維持し、通常の自動効果の既存動作も変更していない。
- 根拠: `dps-trigger-policy.js`へ`getRuntimeEffectPolicy`と高学年関連判定を追加し、`formation-damage-dps-prototype.js`と`formation-dps-calc.js`の重複判定を共通API呼び出しへ置き換えた。`formation-damage-calc.js`では6つのランタイムcollectionへpolicy情報を付与した。監査スクリプトを再実行し、98件すべてにpolicyメタデータがあり、未付与は0件になった。
- 検査: `node tools/test-dps-trigger-policy.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-dps-main-integration.js`、`node tools/test-dps-runtime-effects.js`、`node tools/test-fdc-action-scoped-addp.js`、`node tools/test-dps-audit-state.js`、`node tools/test-dps-support-registry.js`、各`node --check`、`git diff --check`が成功した。HTML・app-cacheの関連cache-busterも`20260903b/d`へ同期した。datasheetは変更していない。
- 残り見積もり: 新Goalは約4スライス。次は設定UIを効果状態・理由・品質の表示へ拡張し、未表示の`spRegenEffects`と別形式の状態・リソースを「設定対象」か「読み取り専用監査対象」かに分ける。

## 新Goal スライス3の開始宣言

- 次の1スライスで行うこと: 共通policy resolverの能力・理由・品質を、本体DPSとDPS試験版の時系列効果カードへ表示する。外部入力待ち・初期OFF・未対応・固定・OFFを現在モードと混同しない表示にし、`spRegenEffects`は計算を変えず読み取り専用監査対象として一覧へ加える。
- 効く完了条件: 新Goalの条件3、条件5、および条件6のUI／監査根拠。

## 新Goal スライス3の終了報告

- 達成度: 新Goalは約45%。本体DPSとDPS試験版の時系列効果設定へ、共通policy resolverに基づく状態・理由・品質表示を接続した。外部入力待ち、初期OFF、未対応、固定、OFF、自動をカード上で区別し、`spRegenEffects`は個別操作を許可せず監査のみとして表示した。
- 根拠: `dps-trigger-policy.js`へ状態表示変換を追加し、両DPS画面のカードへ状態バッジ、理由、品質、読み取り専用表示を追加した。`tools/audit-dps-runtime-effect-settings.js`の再監査結果はランタイム98行、policy欠落0、設定UI漏れ0、読み取り専用collectionは`spRegenEffects`のみ。補助ランタイム情報は引き続き別対象として報告している。
- 検査: `node tools/test-dps-trigger-policy.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-dps-main-integration.js`、`node tools/test-dps-runtime-effects.js`、`node tools/test-fdc-action-scoped-addp.js`、`node tools/test-dps-audit-state.js`、`node tools/test-dps-support-registry.js`、対象`node --check`、`git diff --check`が成功した。datasheetは変更していない。
- 残り見積もり: 新Goalは約3スライス。補助ランタイム情報の読み取り専用監査表示、外部イベントと対象効果の対応表示、カード・編成効果を含む母数監査を順に進める。ゲーム内未検証の時刻・順序・丸めは暫定扱いを維持する。

## 新Goal スライス4の開始宣言

- 次の1スライスで行うこと: `initialTargetStatuses`、`statusReactions`、`statusDamageWeaknessP`、`resources`を、DPS設定へ渡るが個別モード設定を持たない補助ランタイム情報として、本体DPSとDPS試験版へ読み取り専用表示する。内部IDやゲーム内未検証の発動時刻は表示・推測しない。
- 効く完了条件: 新Goalの条件3、条件5、および条件6の表示／監査根拠。

## 新Goal スライス4の終了報告

- 達成度: 新Goalは約60%。初期対象状態、状態反応、状態異常弱点補正、固有リソースを「補助ランタイム（監査のみ）」として両DPS画面へ表示し、設定可能な効果collectionと区別した。値がない場合も「なし」として表示し、非表示のまま残る補助入力をなくした。
- 根拠: `formation-dps-calc.js`と`formation-damage-dps-prototype.js`へ補助監査表示を追加し、`formation-damage-dps-prototype.css`と`formation-dps-calc.css`へ狭幅で折り返す表示規則を追加した。本体DPS設定フロートを実画面で展開し、時系列効果の状態バッジ、理由、品質、補助監査欄が表示されることと、フロート内の横はみ出しがないことを確認した。画面幅を直接変更するブラウザ機能は利用できなかったため、モバイルは既存静的テストとCSSの`minmax(0,1fr)`／`overflow-wrap:anywhere`で補完確認した。
- 検査: `node tools/test-dps-trigger-policy.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-dps-main-integration.js`、`node tools/test-dps-runtime-effects.js`、`node tools/test-fdc-action-scoped-addp.js`、`node tools/test-dps-audit-state.js`、`node tools/test-dps-support-registry.js`、`node tools/audit-dps-runtime-effect-settings.js`、対象`node --check`、`git diff --check`が成功した。cache-busterはpolicy／本体controller／試験版controller／本体DPS CSS／試験版CSSを`20260903c`へ同期し、datasheetは変更していない。
- 残り見積もり: 新Goalは約2スライス。外部イベントと対象効果の対応表示・移動導線、カード・編成効果を含む母数監査を進める。ゲーム内未検証の時刻・順序・丸めは暫定扱いを維持する。

## 新Goal スライス5の開始宣言

- 次の1スライスで行うこと: 外部入力待ちの効果と設定済み外部イベントを共通policyで対応付け、「対応イベントあり／待機中」を本体DPSとDPS試験版のカードへ表示する。発動元ID省略時のワイルドカードと、発動元不一致時の非対応を維持し、イベント操作・シミュレーション経路は変更しない。
- 効く完了条件: 新Goalの条件1、条件3、条件4、および条件6。

## 新Goal スライス5の終了報告

- 達成度: 新Goalは約75%。外部入力待ち効果について、設定済みイベントが対応する場合を「外部入力あり / 対応件数」、未設定・種別不一致・発動元不一致を「外部入力待ち / 対応イベントなし」として両DPS画面へ表示した。短縮イベント値の正規化と発動元ワイルドカードも共通policyへ集約した。
- 根拠: `dps-trigger-policy.js`へ外部イベント種別aliasと`getRuntimeExternalEventMatchState`を追加し、`formation-damage-dps-prototype.js`と`formation-dps-calc.js`へ設定済みイベントを渡してカード表示へ反映した。既存の外部イベント追加・削除、保存、シミュレーション照合は変更していない。
- 検査: `node tools/test-dps-trigger-policy.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-dps-main-integration.js`、`node tools/test-dps-runtime-effects.js`、`node tools/test-fdc-action-scoped-addp.js`、`node tools/test-dps-audit-state.js`、`node tools/test-dps-support-registry.js`、`node tools/audit-dps-runtime-effect-settings.js`、対象`node --check`、`git diff --check`が成功した。ローカル実画面を更新後、本体DPS設定フロートを展開し、状態表示・補助監査欄・横幅を再確認し、ブラウザの警告／エラーは0件だった。datasheetは変更していない。
- 残り見積もり: 新Goalは約1スライス。カード・編成効果を含む母数監査と最終仕様／台帳／公開表示／cache整合を確認する。ゲーム内未検証の時刻・順序・丸めは暫定扱いを維持する。

## 新Goal スライス6の開始宣言

- 次の1スライスで行うこと: カード単体・スペル・編成遺物を含むread-only監査fixtureを追加し、runtime collection、policy未付与、重複、設定UI漏れ、発火経路なしを生成スキル側と分けて確定する。
- 効く完了条件: 新Goalの条件2（全runtime効果の監査）、条件5（全collectionの設定対象／監査のみ定義）、条件6（検証・文書・cache整合）。未検証のカード条件は推測でruntimeへ追加しない。

## 新Goal スライス6の終了報告

- 達成度: 約88%。遺物51・スペル35の条件効果75件を、★5／はんだ+2、物理・魔法、対象装備・編成遺物・スペルの274fixtureでread-only監査できるようにした。カード条件行332件を監査し、runtimeへ渡るカード由来行34件（対象装備24、編成遺物4、スペル6）をcollection別に記録した。
- 根拠: `tools/audit-dps-runtime-effect-settings.js`の監査結果で、カード由来行のpolicy未付与0、重複ID0、設定UI漏れ0、発火経路なし0。空trigger欄14件は`missingTriggerMetadata` 8件と決定的経路保持6件に分類した。生成スキル側も空trigger欄35件を理由コード別に列挙し、発火経路なし0、policy未付与0だった。`docs/dps-runtime-effect-settings-design.md`と`docs/dps-effect-inventory.md`へ母数・fixture範囲・未検証境界を追記した。
- 検証: `node --check`（監査スクリプト、policy、DPS本体、試験版）、`test-dps-trigger-policy`、`test-dps-bottom-bar-prototype`、`test-dps-main-integration`、`test-dps-runtime-effects`、`test-fdc-action-scoped-addp`、`test-dps-audit-state`、`test-dps-support-registry`、`audit-dps-runtime-effect-settings`、`git diff --check`が成功した。datasheetは変更していない。
- 残り見積もり: 実装上の必須スライスは完了。Goalを完了扱いにする前に、既存の実画面確認結果と最終差分／cache参照を一度だけ再点検し、未検証項目を暫定台帳へ残す。

## 新Goal 最終確認

- 達成度: 100%。最終確認スライスとして、Goalの完了条件1〜6、公開側のpolicy／DPS controller／CSS cache参照、datasheet非変更、監査の再現性を点検した。
- 根拠: `node tools/audit-dps-runtime-effect-settings.js`で生成スキル98行とカード由来runtime34行を再監査し、policy未付与0、発火経路なし0、重複ID0、設定UI漏れ0、エラー0を確認した。カード監査は遺物51・スペル35を物理／魔法、対象装備／編成遺物／スペルの274fixtureで走査している。外部入力待ち・高学年初期OFF・監査のみcollectionの表示、設定保存、PC／スマホの詳細表示は既存の実画面確認結果を含めて仕様書と台帳へ固定した。
- 検証: 対象構文検査、DPS policy／下バー／main integration／runtime effects／FDC実データ／audit state／support registryの回帰テスト、監査スクリプト、`git diff --check`が成功した。cache参照は`20260903c`（既存のFDC本体は`20260903d`）で整合し、datasheetは変更していない。
- 残り見積もり: 0。ゲーム内未検証の順序・丸め・敵イベント時刻・全配置のカード条件は、完了条件の非目標／暫定台帳として残る。次に実機検証結果が得られた場合は、別Goalまたは台帳更新として扱う。

## 後続設計スライス開始宣言

- 次の1スライスで行うこと: 時系列効果設定と外部イベントの統合範囲を定義し、自動・推定・周期指定・発生秒指定・真の外部条件を同じ画面で誤認なく扱うUI、保存形式、二重発火防止規則を設計する。
- 効く完了条件: 旧Goal条件1、3、4、6、および後続設計の「外部条件を残す」「対応能力を表示する」「統合可能な行動・周期だけを移す」という新しい完了条件。

## 後続設計スライス終了報告

- 達成度: 設計100%、実装0%。外部イベントを廃止せず、同じDPS計算フロート内で`時系列効果・発動タイミング`と`外部条件イベント`を分ける方針を確定した。
- 根拠: `docs/dps-runtime-effect-settings-design.md`へ、論理効果・発動条件binding・occurrence providerの三層、発動方法、移動対象と残存対象、対応能力と現在状態の表示、共有schedule、保存互換、アヤ・凍傷の扱い、実装順、完了条件を追記した。シールド破壊・被弾・HP閾値などは外部条件として残し、普通・強化・低学年・既知周期・内部の未調査時刻は時系列効果側へ移す。`外部入力対応`は関連効果を起動できる意味であり、敵AIやシールド残量の完全再現ではないことも明記した。
- 設計判断: 手動周期は同じbindingのAUTO／推定を置き換え、加算しない。複数効果が同じ発動条件を共有する場合はscheduleを一つにする。選択中本人の高学年周期上書きは、ダメージ・SP・モーションと効果を分離しない実装ができるまで解放しない。
- 検証: 文書差分を読み直し、移動表、行動発動境界、完了条件で選択中本人の高学年の扱いが矛盾しないよう修正した。計算コードとdatasheetは変更していない。
- 残り見積もり: 実装4スライス程度。順に、(1)binding／発動能力のread-only監査、(2)同一フロート内の二セクションUIと対応表示、(3)共有周期・発生秒providerと編成低学年推定、(4)旧外部候補整理・保存移行・二重発火／PC／スマホ回帰を行う。

## 後続実装スライス1の開始宣言

- 次の1スライスで行うこと: 共通policyへbinding key、行動連動／外部条件の判定、周期指定・外部入力の対応能力を追加し、本体DPSとDPS試験版が同じ分類を利用できるようにする。既存のシミュレーション発火経路は変更しない。
- 効く完了条件: 後続設計の「責務分離」「対応能力表示」「外部イベントを残す」に加え、完了条件1の共通分類と完了条件6の回帰検証。

## 後続実装スライス1の終了報告

- 達成度: 後続Goalは約15%。共通policyの実装を完了した。効果ごとの安定したbinding key、行動連動／システム時計／外部条件の分類、`自動対応`・`周期推定`・`周期指定対応`・`外部入力対応`・`未対応`の能力表示を共通APIで取得できる。
- 根拠: `dps-trigger-policy.js`へ`getRuntimeEffectBindingKey`、`getRuntimeEffectSchedulePolicy`、`getDpsFormationCandidateSchedulePolicy`を追加した。編成低学年などの周期候補は外部条件へ誤分類せず、シールド破壊は外部入力対応として残る。既存の`getRuntimeEffectPolicy`の戻り値と計算経路は変更していない。
- 検証: `node --check dps-trigger-policy.js`、`node tools/test-dps-trigger-policy.js`、`git diff --check`が成功した。追加テストで、行動連動候補・シールド破壊候補・binding key・周期／外部分類を確認した。
- 残り見積もり: 約3〜4スライス。次は本体DPSと試験版の同一設定フロートに周期候補を移し、外部条件候補は外部イベント欄へ残したまま、対応能力と初期推定値を表示する。

## 後続実装スライス2の開始宣言

- 次の1スライスで行うこと: 本体DPSとDPS試験版の設定UIを、時系列効果・周期設定と外部条件イベントの縦並びに分ける。周期候補・外部候補・追加済み行を共通分類で振り分け、対応能力と推定初期値を利用者向けに表示する。
- 効く完了条件: 後続設計の「統合可能な行動・周期だけを移す」「外部条件を残す」「対応能力を表示する」「detailsで閉じる」「通常計算非破壊」に加え、完了条件3のUI接続。

## 後続実装スライス2の終了報告

- 達成度: 後続Goalは約35%。本体DPS設定フロートとDPS試験版を、時系列効果・行動連動の周期設定と外部条件イベントの縦並びへ分離した。周期型の編成候補・追加済み周期行は時系列効果側へ移し、シールド破壊・被弾・HP閾値・状態遷移などの候補と手動イベントは外部条件側へ残した。
- 根拠: `formation-damage-dps-prototype.js`へ周期候補／周期イベントのrendererと共通分類filterを追加し、`formation-dps-calc.js`も同じ分類APIで二つの候補欄・二つのイベントhostを扱うようにした。`formation-damage-calc.html`と`formation-damage-dps-prototype.html`では時系列効果hostを外部イベントcontrolより前に配置し、`formation-dps-calc.html`では対応するdetailsを追加した。技術項目・candidate metadata・保存配列は従来形式を維持している。
- 検証: `node --check formation-dps-calc.js`、`node --check formation-damage-dps-prototype.js`、`node tools/test-dps-trigger-policy.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-dps-main-integration.js`が成功した。追加テストで周期候補の移動、周期行の保持、外部候補の残存、周期の外部欄への重複表示なしを確認した。datasheetとシミュレーション計算経路は変更していない。
- 残り見積もり: 約2〜3スライス。次はbinding単位の周期／発生秒設定を共通保存値として扱う境界を確認し、既定推定値・手動上書きの置換関係と二重発火防止をテストする。

## 後続実装スライス3の開始宣言

- 次の1スライスで行うこと: 周期候補へbinding keyを付与し、周期設定の再追加・旧保存値・異なる外部イベントの扱いを一意化する。効果カードにも自動／周期指定／外部入力などの対応能力を表示し、既存のシミュレーション発火経路は変えない。
- 効く完了条件: 後続設計の「binding単位」「保存互換」「手動周期は同じbindingを置換」「二重発火防止」「対応能力表示」に加え、完了条件4の外部イベント互換。

## 後続実装スライス3の終了報告

- 達成度: 後続Goalは約50%。編成候補と追加済み周期行へbinding keyを付与し、周期行の再追加を同一candidate／bindingの置換として扱うようにした。保存値の正規化でも周期bindingだけを一意化し、独立したシールド破壊・被弾などの外部イベントは複数行を維持する。効果カードには共通policyの対応能力を併記した。
- 根拠: `formation-damage-calc.js`の編成候補生成に共通binding keyを追加し、`formation-damage-dps-prototype.js`の候補metadata、保存正規化、再追加処理、周期／外部欄のfilterへ接続した。`formation-dps-calc.js`にも同じmetadataとDOM側の重複除去を実装した。bindingが保存されていない旧周期行はcandidate IDで置換対象として認識する。
- 検証: `node --check formation-damage-calc.js`、`node --check formation-damage-dps-prototype.js`、`node --check formation-dps-calc.js`、`node tools/test-dps-trigger-policy.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-fdc-action-scoped-addp.js`、`git diff --check`が成功した。周期同一bindingの重複除去、独立外部イベントの複数保持、候補binding、効果カードの対応能力表示を追加テストで確認した。
- 残り見積もり: 約2スライス。次は既存の`formationTimelineMode`と周期候補を実行providerへ接続するか、まず設定値だけで自動／推定を切り替えるかを既存シミュレーターの責務範囲内で実装する。高学年は初期OFFを維持し、選択中本人の行動置換を伴う周期上書きは解放しない。

## 後続実装スライス4の開始宣言

- 次の1スライスで行うこと: 既存の`formationTimelineMode`をDPS実行snapshotへ接続し、`自動（推定）`時だけ周期候補から一時的な外部イベントを生成する。同じcandidate／bindingの手動周期がある場合は自動分を抑止し、高学年初期OFFと真の外部条件イベントを維持する。本体DPSとDPS試験版へ同じ規則を接続する。
- 効く完了条件: 後続設計の「自動・推定・周期をbinding単位で扱う」「手動周期は自動を置換する」「二重発火を防ぐ」「本体DPS／試験版共通化」、および完了条件3、5、7、8。

## 後続実装スライス4の終了報告

- 達成度: 後続Goalは約68%。`formationTimelineMode = 自動（推定）`を本体DPSとDPS試験版の実行入力へ接続した。周期候補は初回秒・間隔・回数を一時的なイベントへ変換し、保存値へ書き戻さない。同じcandidate／bindingの手動周期行がある場合は自動生成を止める。
- 根拠: `formation-damage-dps-prototype.js`と`formation-dps-calc.js`に共通形の周期providerを追加し、DPS実行snapshot・config・fingerprintへだけ推定イベントを合成した。候補カードへ`自動（推定）`、`周期設定済み`、`初期OFF`、`時刻入力待ち`を表示し、対応能力の`周期指定対応`と分離した。`formation-damage-calc.html`、`formation-damage-dps-prototype.html`、`formation-dps-calc.html`で推定モードを選択可能にした。高学年は`formationHighSkillMode = auto`でない限り自動生成せず、シールド破壊・被弾・HP閾値など`timingMode: event`は外部条件欄に残している。
- 検証: `node --check formation-damage-dps-prototype.js`、`node --check formation-dps-calc.js`、`node tools/test-dps-trigger-policy.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-dps-main-integration.js`、`node tools/test-dps-runtime-effects.js`、`node tools/test-dps-audit-state.js`、`node tools/test-dps-support-registry.js`、`node tools/test-fdc-action-scoped-addp.js`、`git diff --check`が成功した。追加テストで、推定イベントのフレーム変換、OFF時の無生成、手動bindingによる抑止、高学年初期OFFを確認した。datasheetは変更していない。
- 残り見積もり: 約1〜2スライス。実行時のbinding一致とイベント種別・発動元一致を実シミュレーションで確認し、旧保存値・比較基準・更新後保持、公開文面、cache-busterを最終整理する。本人高学年の行動全体置換とフル編成ダメージは引き続き対象外・暫定扱いとする。

## 後続実装スライス5の開始宣言

- 次の1スライスで行うこと: 自動推定イベントを最小シミュレーターへ渡し、イベント種別・発動元・bindingに一致する効果へ一度ずつ届くことを確認する。本体／試験版の比較経路が同じ実効イベントを使い、手動イベント保存へ推定イベントを書き戻さないことをテストで固定する。
- 効く完了条件: 後続設計の「二重発火防止」「外部イベント互換」「比較結果の一貫性」、および完了条件5、7、8。

## 後続実装スライス5の終了報告

- 達成度: 後続Goalは約76%。自動推定イベントを実シミュレーターへ投入し、指定した編成低学年のbindingへフレーム60・180で一度ずつ効果が届くことを確認した。外部イベントの発生元・条件照合経路は既存のまま維持し、周期候補の手動行がある場合の自動抑止も既存テストで確認した。
- 根拠: `tools/test-dps-runtime-effects.js`へ自動推定相当の周期イベントと`triggerSourceId`一致fixtureを追加し、`externalEvent`と対応`statusApplied`が同じ2フレームで出ることを確認した。`formation-damage-dps-prototype.js`は推定イベントを`createInputSnapshot()`の実行用snapshotへだけ合成し、`formation-dps-calc.js`も同じくeffective snapshot/config/fingerprintへだけ合成する。手動イベントは引き続き`externalEvents`の保存・編集対象である。
- 検証: `node tools/test-dps-runtime-effects.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-dps-main-integration.js`、`node tools/test-dps-trigger-policy.js`、`node tools/test-fdc-action-scoped-addp.js`、対象`node --check`、`git diff --check`が成功した。datasheetは変更していない。
- 残り見積もり: 約1スライス。provider重複を共通policyへ寄せ、旧保存値・比較基準・公開文面・cache-busterを最終点検する。ゲーム内未検証の時刻・同一フレーム順序・フル編成ダメージは暫定／対象外のまま残す。

## 後続実装スライス6の開始宣言

- 次の1スライスで行うこと: 共通policy provider、本体DPS／DPS試験版の実効イベント合成、保存値との境界、外部条件の残存、公開cache参照を最終点検する。あわせて本体DPS設定フロートをPC幅・スマホ幅で実画面確認する。
- 効く完了条件: 後続設計の「本体DPS／試験版共通化」「手動周期による自動置換」「外部イベントを残す」「PC／スマホ表示」、および完了条件1、3、4、5、6、7、8。

## 後続実装スライス6の終了報告

- 達成度: 後続Goalは100%。共通policyのbinding／候補／推定イベントproviderを本体DPSとDPS試験版へ接続し、手動イベントを保存対象として保持したまま、`自動（推定）`時だけ実行snapshot・比較fingerprintへ一時イベントを合成する境界を確定した。高学年は初期OFF、シールド破壊・被弾・HP閾値・状態遷移などは外部条件欄に残る。
- 根拠: 同一candidate／bindingの手動周期がある場合に推定を抑止し、推定イベントが対応効果へ届くことをruntime testで確認した。本体DPSの設定フロートでは時系列効果設定と外部イベントが同一フロート内で縦に並び、周期候補の効果内容・対応能力・状態表示と補助ランタイム監査欄を確認した。PC幅と390px幅で横方向の文書はみ出しがなく、推定モード切替後に`自動（推定）`が表示されることを確認した。
- 検証: `node --check`（policy／本体DPS／試験版）、`test-dps-trigger-policy`、`test-dps-bottom-bar-prototype`、`test-dps-main-integration`、`test-dps-runtime-effects`、`test-fdc-action-scoped-addp`、`test-dps-audit-state`、`test-dps-support-registry`、`test-public-release-config`、`audit-dps-runtime-effect-settings`、`git diff --check`が成功した。`stat-dashboard.html`のpolicy prefetchを`20260903d`へ揃え、関連app-cacheは`20260903e`、controllerは`20260903d`、共有CSSは`20260903c`で整合している。datasheetは変更していない。
- 残り見積もり: 0。ゲーム内未検証の編成行動時刻、敵AI・被弾・撃破時刻、同一フレーム順序、全編成ダメージ加算は暫定／対象外として設計書と検証台帳に残る。実測値が得られた場合は別Goalまたは台帳更新で扱う。

## DPS発動経路・入力モード統合Goal 設計スライス終了報告

- 達成度: 0%。Goal設計とレビューは完了したが、計算コード・UI・テストの実装は開始していない。
- 根拠: `GOAL.md`を、発動条件binding単位の分類、自動／推定の既定ON、高学年発動元だけの初期OFF、低高共有経路の分離、その場での周期・発生秒上書き、真の外部条件の維持、保存移行、代表fixtureを含む10件の完了条件へ更新した。`docs/dps-runtime-effect-settings-design.md`へ、旧Goal完了判定と利用者要件の乖離、表示変更だけでは解決しない理由、既存基盤の再利用範囲を追記した。
- レビュー結果: キャロット固有修正ではなく共通schedule policyの再分類として実装すれば、編成内別使徒の普通・強化・低学年に汎用適用できる。自由文の高学年判定、旧全体OFFの移行、低高共有binding、真の外部条件との境界を完了条件へ入れたため、今回確認した問題を取りこぼしにくい。敵AI・フル編成DPSは非目標に維持し、スコープの過大化を避けた。
- 検証: `GOAL.md`、`STATUS.md`、既存設計、現行policy・候補生成・UI表示経路を照合した。計算コードとdatasheetは変更していない。
- 残り見積もり: 5スライス程度。順に、(1)read-only発動経路監査、(2)構造化分類と高学年判定、(3)低高binding分割とprovider統合、(4)個別UI・保存移行、(5)回帰・PC／スマホ・文書・cache確認を行う。

## DPS発動経路監査スライス1の終了報告

- 達成度: 約15%。生成スキル98行、カード由来34行、全76使徒を編成側発動元とした候補fixtureをread-only監査し、次の分類修正へ渡す母数と代表ケースを確定した。
- 根拠: `tools/audit-dps-runtime-effect-settings.js`へ編成候補監査、構造化発動元と現行高学年判定の比較、代表policy fixtureを追加した。高学年誤判定は5行・ユニーク3効果、低高混在は2効果、編成候補は8件（周期7・イベント1）だった。キャロット低学年は周期推定値を持つが、現行policy能力が`external`となることを再現した。
- 検証: `node --check tools/audit-dps-runtime-effect-settings.js`と`node tools/audit-dps-runtime-effect-settings.js`が成功し、エラー0件だった。対象計算コードとdatasheetは変更していない。対象条件の全組み合わせは未監査として設計書へ明記した。
- 残り見積もり: 約4スライス。次は自由文を使わない構造化分類と高学年初期OFF判定を共通policyへ実装し、代表fixtureを回帰テストへ昇格する。

## DPS発動経路分類スライス2の終了報告

- 達成度: 約18%。`dps-trigger-policy.js`の発動能力を`exact`／`estimated`／`external`／`unsupported`へ再分類し、編成の普通・強化・低学年・高学年に連動する行を真の外部条件から分離した。高学年判定は発動元の構造化キーだけを参照し、効果対象・表示文の「高学年」では初期OFFにしない。
- 根拠: `getStructuredTriggerActionKeys`、`getStructuredTriggerGrade`、`isExternalRuntimeCondition`を共通APIへ追加し、`getRuntimeEffectPolicy`、schedule policy、外部イベント照合、編成候補の高学年判定へ接続した。低高共有旧bindingは低学年を止めない`auto`として検出し、後続スライスでbinding分割する前提を固定した。
- 検証: `node --check dps-trigger-policy.js`、`node tools/test-dps-trigger-policy.js`、`node tools/audit-dps-runtime-effect-settings.js`が成功し、監査上の構造化判定による高学年誤判定は0行、低高混在は2効果、編成候補は周期7・イベント1を確認した。datasheetと計算本体の発火処理はまだ変更していない。
- 残り見積もり: 約3〜4スライス。次は低高共有bindingを個別scheduleへ分割し、推定周期・手動周期・外部イベントを同じ実行境界で置換関係にする。

## DPS発動経路binding/provider接続スライス3の終了報告

- 達成度: 約38%。低学年／高学年共有効果をaction bindingへ分割し、高学年側だけを初期OFFにした。編成周期候補はbinding単位の明示`auto`／`fixed`／`off`を参照し、手動周期がある間は推定providerを停止する。本体DPSとDPS試験版の両方へ同じbinding mode解決を接続した。
- 根拠: `formation-damage-calc.js`で分割行に`runtimeBaseEffectId`とaction別`bindingKey`を保持し、`formation-damage-dps-prototype.js`で旧共有effectIdの保存値を分割行へフォールバックした。`formation-dps-calc.js`も保存済みbinding modeを推定イベントproviderへ渡すようにした。旧schemaの全体`formationTimelineMode: off`は新版の既定自動へ移行し、新版で明示された個別OFFは維持する。
- 検証: `node --check`（policy／本体DPS／DPS試験版）、`node tools/test-dps-trigger-policy.js`、`node tools/test-fdc-action-scoped-addp.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-dps-main-integration.js`、`node tools/test-dps-runtime-effects.js`、`node tools/audit-dps-runtime-effect-settings.js`が成功した。合成fixtureで旧共有AUTOの継承、分割後の明示OFF優先、binding mode providerへの伝達を固定した。datasheetは変更していない。
- 残り見積もり: 約2〜3スライス。設定カードでの能力表示・周期／発生秒上書きの確認、候補追加から実効果までの代表fixture検証、保存・比較・公開文面・cache・PC／スマホ実画面の最終確認を残す。

## 次の1スライス開始宣言

- 次の1スライスで行うこと: 本体DPSとDPS試験版の設定カード／周期設定表示を確認し、`exact`・`自動（推定）`・`初期OFF`・`外部入力待ち`・`未対応`が現在モードと混同されないよう表示と保存再読込の不足を補う。低学年候補の追加、手動周期上書き、高学年の初期OFFが同じbinding規則で表示されることをテストへ追加する。
- 効く完了条件: 条件2、条件3、条件5、条件6、条件7、条件8、条件10。

## DPS発動経路設定UI・代表binding検証スライス4の終了報告

- 達成度: 約50%。設定カードでは推定型を`自動（推定）`、未対応を操作不可の`未対応`として表示し、true externalは外部入力待ちのまま残した。本体DPSとDPS試験版の候補providerへ同じbinding modeを渡す経路を確認した。
- 根拠: 編成低学年の代表fixtureで、候補のbinding key、runtime effectのbinding key、自動推定イベントのbinding keyが一致するよう修正した。runtime側が外部イベント照合用に`ownerId`を使う一方、候補側が`sourceId`を使って別キーになる汎用的不一致を、候補bindingでも`externalSourceId`を優先することで解消した。キャロット固有の分岐は追加していない。
- 検証: `node tools/test-fdc-action-scoped-addp.js`、`node tools/test-dps-trigger-policy.js`、`node tools/test-dps-runtime-effects.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-dps-main-integration.js`、`node tools/audit-dps-runtime-effect-settings.js`が成功した。監査はruntime policy未付与0件、発火経路なし0件、編成候補8件（周期7・イベント1）、周期候補の間隔0件を維持した。`datasheet`は変更していない。
- 残り見積もり: 約1スライス。保存・比較fingerprint・cache-buster・公開文面、本体／試験版のPC・スマホ表示、通常計算詳細回帰を最終確認する。ゲーム内未検証の行動時刻・敵AI・同一フレーム順は暫定／対象外のまま維持する。

## 次の1スライス開始宣言

- 次の1スライスで行うこと: 最終回帰として、設定値の更新後保持・比較入力・自動推定イベントの一時合成境界、公開画面の内部ID／試験文面漏れ、PC／スマホの設定カード、通常計算詳細を確認する。最後にcache-buster、仕様書・台帳、未コミット差分を整合させる。
- 効く完了条件: 条件5、条件7、条件8、条件10。

## DPS発動経路最終回帰スライス5の終了報告

- 達成度: 100%。保存値、比較fingerprint、自動推定イベントの一時合成境界、公開文面、cache参照、PC／スマホ表示、通常計算詳細を確認した。
- 根拠: 本体設定で期間90→60秒・seed 1→7を変更して再読み込み後も保持されることを確認し、最後に90秒・seed 1へ戻した。390pxでは文書幅375／スクロール幅375、詳細幅375、タイムライン幅319で縦スクロールを確認した。デスクトップでは文書幅1226／スクロール幅1226、タイムラインは縦スクロール、下バー高さ86pxを確認した。「続きを表示」は行数160→205へ追加表示された。公開本体の表示文面に`__exclusive`・`デバッグ`・`試験用`は0件だった。
- 生成データ同期: 現行の`dps-timing-data.js`に合わせてsupport registryの期待値を更新し、最大育成fixtureを再生成した。datasheetは今回編集していない（`tools/trickcal_skillmotion.xlsx`の既存未コミット変更は維持）。
- cache: 本体／試験版のpolicy・controller・CSSとHTML、`app-cache.js`の参照を同期し、今回の実装を参照するcache-busterを確認した。
- 検証: `node --check`（policy／本体DPS／DPS試験版）、`node tools/test-dps-trigger-policy.js`、`node tools/test-dps-runtime-effects.js`、`node tools/test-fdc-action-scoped-addp.js`、`node tools/test-dps-bottom-bar-prototype.js`、`node tools/test-dps-main-integration.js`、`node tools/test-dps-audit-state.js`、`node tools/test-dps-support-registry.js`、`node tools/test-public-release-config.js`、`node tools/test-fdc-info-text.js`、`node tools/test-max-growth-state.js`、`node tools/audit-dps-runtime-effect-settings.js`、`git diff --check`がすべて成功した。監査はruntime 100行、policy未付与0件、発火経路なし0件、編成候補8件（周期7・イベント1）、周期間隔欠落0件だった。
- 残り見積もり: 0スライス。ゲーム内検証が必要な敵AI・被弾・命中・撃破・同一フレーム順序などは、仕様書と台帳に暫定／対象外として残す。

## アヤ凍傷編成横断反映 設計スライス6の終了報告

- 達成度: 100%（設計スライス）。実装Goal全体の達成ではなく、別編成使徒へアヤの凍傷ダメージ補正を反映するための実装境界を確定した。
- 根拠: 凍傷の`statusReaction`（冷静被ダメージ+8%／スタック）と、アヤが生成する凍傷スタックの発生providerを分離する設計を`docs/dps-runtime-effect-settings-design.md`へ追記した。編成側はダメージ・モーション・SPを複製せず、低学年A2・高学年・愛用品を状態専用bindingとして実効イベントへ一時合成する。低学年は敵サイズ別スタック数を低学年SP周期でまとめて付与し、高学年は個別bindingの初期OFFを維持する。
- 二重発火防止: 選択中アヤは本人経路のみ、別使徒選択時だけ編成状態providerを作る。同じbindingの手動入力は自動providerを置換し、reactionは選択中冷静使徒へ一度だけ登録する。共通`凍傷:stack:9`、`statusStackCount`、個別期限・上限9を既存状態処理へ接続する方針とした。
- 暫定事項: 低学年の敵サイズ別値は小型2・中型4・大型5・超大型8（未検証の戻り命中を含む推定）。同一フレーム順序は、当面は効果時刻の次フレームへ置き、ゲーム内実測後にphaseへ置換可能とする。datasheet・計算コードは変更していない。
- 残り見積もり: 約3スライス。候補providerと敵サイズresolver、`statusStackCount`を実装するスライス、設定UI・保存移行・手動置換を実装するスライス、本体／試験版・数値・表示の回帰検証を残す。
