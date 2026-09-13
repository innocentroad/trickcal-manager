# 保存の重大修正のみ：Luna実装Goal

## 最新訂正：R1〜R5補修完了・P4実装待ち（2026-09-13）

再レビューで残ったR1〜R5を限定補修し、制御経路と既存基準回帰を確認した。R1は旧`savedStates`の安全拒否、R2は本番loaderに合わせた日時検査、R3はdigest保持の補助dataset除外、R4はrollback後preview再表示、R5は実apply後保存先rawから新context loaderへの全件比較。R1〜R5は5/5、C2は1/1へ再判定可能。旧形式のcanonical変換と追加nativeは今回の必須にせず、変換不能時は救出／管理画面移行へ案内する。P4/P5、commit/push、自動実行Goal有効化は次の明示依頼まで開始しない。

最新訂正（2026-09-13）：[再レビューR1〜R5](storage-critical-fixes-review-20260913.md)を優先する。以下の3/3完了判定は撤回しC2を未達へ戻す。既存C1/C3証拠は維持。今回は再設計・文書更新のみで、自動実行を再開しない。

2026-09-13。C1〜C3の実装・検証を完了して停止。今回の利用者指示は修正だけであり、P4まで連続実装する旧予定より本書を優先する。

## 最新実施結果

- C1〜C3：3/3達成。既存transaction回帰も制御テストで成功した。
- C1：復元後の新runtimeでsessionを再構成し、旧sessionの保存を拒否する経路を確認した。独立browserの新規tab代表も既存成功証拠として分離記録した。
- C2：canonicalな`slots/current`の採取・再構成、current-tab/stored-onlyのmirror選択、保存計算結果のid/name/savedAt/snapshot全件保持、未対応版・50件超の事前拒否を確認した。新VMの本番loaderと実画面の保存・読込代表を通した。
- C2補修：`calc.settings`／`dps.settings`／`dps.runtimeOverrides`に限る不正datasetを`excluded`として確認画面へ出し、確認なしの復元を拒否、確認ありでは対象キーを変更せず、`calc.resultSaves`を実runtimeのplan→apply→別context本番loaderまで保持する反例を確認した。危険プロパティ・容量超過・必須datasetは除外しない。
- C3：boot・maintenance・flush・Lock取得に依存しない`exportRescueDirect`と復旧ページの直接downloadを追加し、壊れたjournalでもstorage書込みなしで救出できることを制御・native個別checkで確認した。
- native全runnerの終了コード1はfocus/visibility、stat確認、lifecycleの前面状態・タイミング依存であり、C3の`standaloneRescue.ok=true`とは分離した。既知timeoutを反復していない。

このGoalの修正範囲は完了した。P4のT1〜T3、追加native検証、datasheet・生成物・公開設定、commit/push、自動実行Goal有効化には進まない。P4開始は別の明示的な作業として扱う。

## 目的と範囲

育成・編成・保存した計算結果を保護し、復元後の起動と異常時の救出を成立させる。[設計](storage-p4-transfer-design.md)の§1〜2、C1→C2→C3だけを実装する。P4のT1〜T3・転送機能は含めない。

参照：AGENTS.md、GOAL.md、STATUS.md、本書、storage-contract.md、storage-backup-format.md、storage-p4-transfer-design.md。前回の反例とコード位置はstorage-p3-review-20260913.md。既存成功証拠は再利用するが、旧P3完了・残り0を継承しない。

## 固定完了条件

- C1：復元後の空sessionで起動でき、同一タブ再読込・旧タブ復帰が世代制御に従う。古いメモリは保存不可。session再構成失敗時は停止し、local必須データ・無関係キーを保持。実bootの制御確認と独立ブラウザの新規タブ代表を取得。
- C2：slots/currentを確定形式で採取・再構成し、draft/live/legacyの差を正しく扱う。保存計算の全件ID・名前・日時・snapshotを実codec→plan→apply→新contextの実loaderで保持し、実画面で代表保存を開ける。不正・未対応版・50件超は切り捨てず適用前に拒否。補助設定だけの不正は明示確認付きで除外でき、除外先キーと保存snapshotは不変。
- C3：起動失敗・壊れたjournal・Web Locks非対応でも、通常boot/maintenance/flushに依存せず救出ファイルを取得できる。読取失敗を明示し、アプリ保存キーへの書込みゼロ。救出形式と通常backupを区別し、実ダウンロード代表を取得。

3/3と、変更が影響する既存transaction回帰の成功を完了条件とする。計算/DPS補助設定の完全再現や全使徒組合せは必須にしない。保存snapshot内の設定や利用者の敵プリセットは緩和対象ではない。

## 実装境界

候補：storage-runtime.js、storage-backup.js、storage-bootstrap.js、storage-recovery.html、必要最小限の管理画面backup/preview接続、関連テストと記録。資材版同期は変更した読み込み対象に限定する。既存未コミット変更をすべて維持し、開始時に対象と既存差分の境界を記録する。

禁止：P4転送/receipt拡張、P5/P6、DNS/Pages/workflow/公開設定、datasheet/生成データ、計算式・DPSシミュレーション改変、検出器一般化、commit/push。修正と無関係なUI調整もしない。

旧raw形式backupの配布・互換性が判断できない場合は、該当ファイルの取扱いを推測せず確認事項として停止する。既存ファイルを破棄せず、別の形式を曖昧に同一版扱いしない。

## 進め方・停止

各スライス開始前に作業内容・C番号・変更境界を示す。前スライス合格後だけ次へ進む。終了後STATUSに達成条件数（分母3）、証拠、未達・未検証、残見積もりを記録する。受入台帳の関連A/B条件も新しい証拠に結び付ける。

既存反例が修正前に失敗し、修正後は同じ本番経路の検査で成功することを確認する。通常成功だけを合格根拠にしない。変更JS構文、backup/runtime/restoreの関連テスト、差分を確認し、必要なbehavior基準だけ追加する。

nativeは普段使いから分離した既存環境を使用する。制御とnativeを混ぜない。環境阻害は分類して同じtimeoutを反復せず、手動操作・観測値・未達を報告して止める。3スライス連続で進捗がほぼなければ再計画を提示する。

残見積もりは3スライス（C2は複数作業単位の可能性）。終了時は修正結果とP4開始可否を報告するだけで停止。P4設計が存在していても実装へ進まない。本書作成時点では実装・自動実行Goalを開始しない。

## Lunaへの開始指示

```text
AGENTS.md、GOAL.md、STATUS.md、docs/storage-critical-fixes-goal.mdと指定参照仕様を読み、重大修正C1→C2→C3だけを実施してください。
育成・編成・保存計算結果、復元後起動、異常時救出を必須とし、補助計算/DPS設定の完全再現へ広げないでください。
各着手前に対応条件と変更境界、終了後にSTATUSへ達成数・実行証拠・未達・残見積もりを記録してください。既存反例を本番と同じ経路で確認し、制御とnativeを分離してください。
既存未コミット変更を維持し、前スライス未達なら停止してください。C3後は修正結果とP4開始可否を報告して停止し、P4実装、公開設定変更、datasheet/生成物変更、commit/pushへ進まないでください。
```
