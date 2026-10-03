# 召喚ユニット移行のローカル実装

## 結論

新しいxlsx構造の生成と独立個体の実行基盤を実装した。モモの実データでのDPS再開は未完了。未確定タイミング・選択的能力継承を主人のダメージや0Fで補完しない。

## 入力と生成

- `tools/trickcal_skillmotion.xlsx` は読み取りのみ。前後SHA-256は `61F6805E58D4FD9FB1C7181DD04F7261363BADE1B7FEC667DC40756F73F6DC50`。
- 新シート「召喚ユニット行動」2行、実行方式、行動ID、記録用途を接続した。末尾のFALSEだけの行は既存の空行判定で除外される。
- `tools/generate-dps-timing-data.bat` を1回実行して成功。タイミングschema 9、Simulator 29、対応判定4。
- モモの低学年観測4件・高学年観測1件は保持するが予約に使わない。行動内命中2件・個体別初回開始5件の空欄はそのまま不足理由へ変換した。
- 生成前退避物との比較で、モモ以外の使徒データの実値差分は0。追加の実行方式／行動／記録用途の既定フィールドとschema・summary更新は構造差分として分離した。生成警告0件。
- datasheet更新はないためgenerate-allは繰り返していない。xlsx・生成JSを手編集していない。

## 実行基盤

同じ戦闘tick上に召喚ごとのモーション進行・行動開始待ち・寿命・個体状態を置く。モーション速度は個体の供給処理から更新し、行動開始時の待機は途中で再計算しない。待機0は同tickに次行動へ進み、余計なtickを加えない。主人の攻速・SP・命中効果・ダメージprofileは流用しない。

命中入力は `resolveSummonUnit` が返す個体専用adapterの `getHitInput` から共通命中計算へ渡す。ダメージの帰属は召喚元actionとする。adapterはfixtureで接続した実行境界で、UI/Workerのモモ継承処理はまだ接続していない。callbackの保存・Worker転送は実装していない。

対応判定とsimulateは不足を拒否する。旧イベント式反復とスキルの直接ダメージfallbackへ戻らない。他のイベント式生成物は既存方式を維持する。

## 検証

成功した焦点検査:

- `test-summon-unit-generation.py`: 小さい独立入力で行動ID参照、不正モーション・時刻・実行方式・記録用途を検査。
- `test-summon-unit-runtime.js`: 独立ダメージ、複数個体状態、主人加速非継承、途中の加速と待機保持、待機0、寿命境界、観測非実行、不足時停止、設定済み主人SP命中効果の非発動、fast-forward設定との一致。
- `test-generated-attack-speed-base.py`、`test-generate-dps-timing-data.py`、`test-momo-generated-speed.js`、`test-dps-support-registry.js`。
- `test-dps-runtime-effects.js`、`test-dps-trigger-policy.js`、`test-dps-main-integration.js`、`test-damage-hit-rounding.js`、`test-epica-a2-dps-timing.js`。
- JS構文、Python compile、CRLFを認識した対象diff検査。

実ブラウザ・現行ゲーム実測は今回は未検証。fixtureの成功をモモの実測一致や全面DPS対応として扱わない。

## 残作業

1. 時刻入力は下記追補で完了。初回行動開始5件は利用者合意の0F、行動内命中2件は20Fを暫定入力済み。
2. 選択的能力・状態継承とダメージ分類を、個体専用の純データ入力としてUI/Worker経路へ接続。
3. 終了時自爆・状態効果、被弾終了、主人とのSP／会心／命中フックの共有を、確認できた根拠に限定して対応。
4. 実xlsxによる召喚タイムラインと画面、ゲームの条件固定記録を照合して再開判断。

編集前dirty込みの保全先は親trickcalの `backups/summon-unit-runtime-20261003-01/ledger.tsv`。既存dirtyを保持し、commit・push・公開は行っていない。

## 20F命中入力の反映（2026-10-03追補）

- 利用者編集済みxlsxを読み取り、保存・編集終了と他生成停止の返答後に `tools/generate-dps-timing-data.bat` を1回実行した。generate-allは実行していない。
- 入力SHA-256: `16A5DA2555C99B4A0F28530E7731D1A48EEA343726CA1D0A781A33A97855EA3F`。
- 低／高学年の共通行動をAttack1_1・58ゲームF、行動内命中を20ゲームF・暫定として生成した。攻撃イベント発生＝命中の利用者指定で、飛翔時間は加算しない。A2専用アセットへの同値流用は未確認の暫定仮定である。
- モモ以外の使徒生成データは退避版とのJSON比較で不変。基礎攻速150・反復121Fの観測値・初回命中の観測記録は保持した。
- 生成の不足理由から命中時刻2件は解消したが、初回行動開始5件は未確定のまま。UI/Workerの選択的能力継承も未接続のため、実モモのDPS停止は解除しない。
- 独立ランタイムfixtureでは初回行動開始を0Fと明示した上で、基礎攻速150・モーション58F・命中20Fから20/140/260Fに命中することを検査する。実xlsxの空欄を0Fで埋めた検査ではない。
- 編集前dirtyを含む6ファイルを `backups/momo-event-hit-integration-20261003-01/` へコピーし、SHA-256一致を確認した。xlsxは読み取りのみ。commit・push・公開はしていない。

## 初回開始0Fの反映（2026-10-03追補）

- 利用者編集済み「生成物タイミング」52～55・57行を確認した。生成後の行動開始0F、調査状態は暫定。旧観測行を置換せず、移動・索敵の実測一致も意味しない。
- 入力SHA-256は `0F474FB9BDDE6028B847A8671CB5212C4EE100A11C65F49F76D282D9B5F78F04`。保存・編集終了、他生成停止の返答後にスキルモーション専用の通常生成を1回実行した。
- 生成後の初回開始は低学年4件・高学年1件がすべて0F、executionIssuesは両方空。モモ以外の使徒データは退避版とのJSON比較で不変。
- 対応判定の理由は時刻不足の「入力待ち」から能力継承の「実装待ち」へ変更した。simulateにも未接続の停止が残る。対応済みへの昇格・主人ダメージの流用はしていない。
- 能力継承の残設計: 現在の集約済み主人profileではWorldRule/Augment等の除外を復元できない。供給元付きの効果内訳を保持して召喚時snapshotを組み立て、Workerへ純データとして渡す責務・形式を決める必要がある。関連: formation-damage-calc.js/createComparableDamageResult、formation-damage-dps-prototype.js/singleOptions・aggregateOptions、dps-simulator.js/resolveSummonUnit。共通計算境界を変えるため、推測による局所的コピーはせず、Solで設計判断を解決することを推奨する。自動委任はしていない。
- 編集前dirty込み7ファイルの保全先は `backups/momo-initial-zero-integration-20261003-01/SHA256SUMS.tsv`。xlsx直接編集・commit・push・公開なし。
