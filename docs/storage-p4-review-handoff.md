# P4レビューと次回Luna指示

2026-09-13。今回の作業はレビュー・指示確定のみ。次回は下記H1→H2を実施して停止する。旧P4 6/6を無条件に引き継がない。P5のURL方針は確定済みで、変更しない。

## レビュー結果

- H1a／公開導線：`stat-dashboard.html:664`の転送ボタンは常時表示され、`stat-prototype.js:startBackupTransfer`に公開有効化の検査がない。通常配信で未準備の新サイトへ誘導できる。案内OFFという既存要件を満たすため、表示と実行入口の両方を既定OFFにする。隔離検証ではtoolsからのみ有効化する。URL引数で本番公開を有効化しない。
- H1b／終了と再試行：`storage-transfer.js:startHandshake`のtimeoutは通知のみでphaseがHELLOに残る。`stat-prototype.js:startBackupTransfer`の進行中判定で次の試行が拒否される。採取失敗・通信reject時も同様の状態残留がある。適用開始前の終了ではtimer/listener/送信参照を解放し、新しい明示クリックで再試行できるようにする。APPLYING以後の不明状態を再適用可能に丸めない。
- H1c／適用中の操作：`storage-transfer-page.js:applyRestore`はapply/prepareのみdisableし、cancelとfile inputを操作できる。適用中にcancelや別ファイルが割り込まないようUIとhandlerの両方で拒否する。失敗後の復旧規則はruntimeを正とする。
- H1d／既存設計の代替経路：受信ページには新側の置換前backup操作がなく、送信失敗後のbackup操作は再採取となる。元のP4設計に従い、新側データのbackupと、送信時に固定した同じpackageをファイル保存する操作を既存codec/exportで接続する。新しい保存writerやreceipt永続化基盤は追加しない。
- H2／native証拠：前回成功runには診断用の別`createController().initialize()`が含まれていた（前回実行・削除記録による）。削除は単なるログ整理ではなく動作変更なので、削除後に構文確認だけでは証拠を継承できない。現行runnerを一度実行し、本番初期化のみで転送できることを確認する。
- P5への接続：現行送信先は`/storage-transfer.html`固定。P5aで`/transfer/`のroute参照へ接続する。STATUSにある論理ID `calc`はURL台帳と不一致なので、論理IDは既存設計の`damage`、公開URLは`/calc/`に統一する。

上記はコードと既存実行記録のレビューであり、今回の不具合再現テストやnative実行は行っていない。G0等の無関係な成功証拠は維持する。P4の再確定に必要な範囲だけを修正する。

## 次回実施順

開始時に親とManagerのAGENTS.md、GOAL.md、STATUS.md、本書、storage-p4-transfer-design.md、storage-contract.md、storage-backup-format.md、storage-native-browser-environment.mdを読む。最新範囲・停止点は本書を正とする。

1. H1：上記a〜dの限定補修。対象は転送JS/HTML、管理画面の転送導線、関連toolsテスト。開始時のgit statusと対象差分を記録し、既存変更を維持する。明示操作前に書込みなし、timeout後の新規試行成功、apply中のcancel/file拒否、同一package/digestのファイル保存、新側backup内容を本番関数の動作テストで確認する。
2. H2：H1合格後に独立profile・2 Originで現行`tools/storage-transfer-native-check.js`を実行する。toolsからのOrigin／公開導線設定とfixture投入は許可するが、別controller初期化や保存関数の直接呼出しで本番UIを代行しない。非空のslot/currentを用い、転送前後の育成・編成内容と保存計算を比較する。単なるstorageキー存在だけで合格にしない。実クリック、明示復元、ファイル往復、新規タブでの読込みを確認し、結果をtmpの要約レポートに保存する（生保存値をログ出力しない）。

各開始前に作業と対応IDを示し、終了後STATUS・受入台帳にH1a〜d/H2の達成数、証拠、未検証、残り見積もりを記録する。今回の5条件は旧分母の置換ではなくレビュー修正の集計。P4の元条件へ戻して再判定する。未達なら次へ進まず具体的な残件を報告する。環境阻害は原因を分類し、同じtimeoutを反復しない。

変更JS構文、transfer/pageテスト、backup/restore/runtime/behaviorの変更影響範囲、差分を確認する。旧storage-baseline全体の長時間実行・検出器一般化は今回へ追加しない。検証のために削除した動作コードがある場合、影響する成功経路を再確認する。

H2後にP4再判定とP5a開始可否を報告して停止する。P5実装、datasheet・ゲーム生成物、計算式、DNS/Pages/workflow/CNAME、commit/push、自動実行Goal有効化は禁止。

## P5に維持する決定

`/`は新Originのみ当面`/manager/`への静的転送。旧Originの管理入口は維持する。`/data/`は敵・ボード一覧で、既存ページの上部バー構造・テーマ切替・レスポンシブ挙動を踏襲する。独自の育成保存は追加せず、既存の表示設定は利用できる。論理ID `damage`→`/calc/`、`share`→`/share/`、`transfer`→`/transfer/`。

P5aの実装指示は、manifestの具体schemaと最終生成物の資材版依存順を固定してから作る。旧新profileで内容が違えば資材版も異なってよい。共通sourceCommitとprofile別資材版を記録する。新側生成で既存ソースindexや旧側を転送へ置き換えない。

## 新チャットへの開始文

```text
作業場所は D:\Games\etc\trickcal\trickcal-manager です。
AGENTS.md、GOAL.md、STATUS.md、docs/storage-p4-review-handoff.mdと指定参照文書を読み、H1→H2を実施してください。
最新指示を優先し、旧P4 6/6を無条件継承しないでください。
各開始前に対応IDと変更境界、終了後にSTATUS・受入台帳へ証拠・達成数・未検証・残見積もりを記録してください。
未コミット変更を維持してください。H2後はP4再判定とP5a開始可否を報告して停止してください。
P5実装、datasheet・ゲーム生成物・計算式・公開設定変更、commit/push、自動実行Goal有効化は行わないでください。
```
