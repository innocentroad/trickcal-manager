# 重大修正C1〜C3の再レビュー

2026-09-13。読み取りと本番モジュールによる隔離Node診断、文書更新のみ。アプリ実装・実行テストファイルは変更していない。既存の3/3完了を再利用せず、C2を未達へ戻す。P4実装開始は保留。

## 指摘と最小修正

### R1 / P1：旧保存枠を含むデータが正常backupから欠落する

`storage-backup.js:439`はslotStoreがなければstat.slotsをabsentにする。一方`normalizeBackupSnapshot`（316行）はlegacy.savedStatesを削除する。旧形式からの純粋converterが接続されていない。

本番createBackupPackageFromEntriesへ、slotStoreなし・legacyCurrent内savedStatesのslot1にMomo rank6があるデータをstored-onlyで渡した。結果はok:true、stat.slots={state:'absent'}、currentからもsavedStatesが消えた。復元のabsentは枠全削除を意味する。古い形式の利用者が管理画面による移行前に独立採取した場合に保存枠を失う。

対処：既存旧形式移行から純粋変換を再利用してcanonical slotsへ採取する。すぐ対応できなければ旧savedStates検出時に通常backupを拒否し救出へ誘導する。少なくとも保存枠なしと偽って正常出力しない。元storageへ書かず、旧枠付きfixtureを実codec→plan→applyで確認する。

### R2 / P2：受理した計算保存の日時が本番loaderで0になる

`storage-backup.js:259`のvalidatorはISO文字列savedAtを受け入れるが、`formation-damage-calc.js:2193`はNumber(savedAt)||0。ISO日時でpackage作成→decode→restore entry→隔離した本番loaderを実行し、元の2026-09-13T00:00:00.000Zが0になることを再現した。表示日時・ソート順の保護条件を満たさない。

対処：現行writerの数値日時を基準に、対応する旧日時を明示変換して実loaderが保持するか、対応不能として事前拒否する。保存日時が欠けたものや空nameも既存loaderで補完されるため、厳密保持の受入fixtureに含める。現行writerの正当な数値日時の成功も維持する。

### R3 / P2：ファイル内の不正な補助設定を除外確認できない

採取側createDatasetValueはexcludedを作るが、decodeBackupPackageはpresentな不正補助datasetで全体拒否する。正しいdigest付きpackageにdps.settings={state:'present',value:{settingsVersion:999}}を入れ、本番decodeでunsupportedになることを再現した。新しいexportがexcludedへ変換したファイルにしか除外UIを使えない。

対処：外側・digest・危険プロパティ・容量の検査を維持し、入力packageを改変せず補助意味検証の結果をpreviewへ渡す。元package/digestを保持し、明示確認したdatasetだけplan対象から外す。ファイル入力経路の反例を使う。P4の元digest/receipt契約とも整合させる。

### R4 / P2：復元失敗から戻ると除外確認が消える

`stat-prototype.js:3419`等でrollback後にresetBackupRestoreControlsを呼ぶと、除外checkboxを未選択・非表示にする。pendingBackupPackageは残るが、除外UIを再表示するrenderBackupPreviewは呼ばれない。同じファイルを再選択するまで除外確認できず、再度planが拒否される。

対処：取消/rollbackからの再確認ではpending packageからpreviewを再描画する。確認は再取得し、自動で同意済みに戻さない。失敗→rollback→再確認→再適用の1例を既存UI制御経路へ追加する。

### R5 / P2：追加した実保存後loaderテストが保存先を読んでいない

`tools/test-storage-restore.js:428`はloadProductionCalculationSaves(afterEntries['calc.resultSaves'])と入力値を渡している。直前に保存raw一致のassertはあるので保存検証が全くないわけではないが、報告の「保存先→新context実loader」の直接接続にはなっていない。この追加例は1件で、50件のcodec容量fixtureは別経路。

対処：実apply後のstorageを新しい環境へ渡して本番loaderを起動する。実writer相当の複数保存または50件で全件比較し、保存省略や読込省略が同じassertで落ちることを確認する。検出器の拡張や全native再実行は不要。

## 判定と範囲

R1は保存枠欠落、R2〜R4は必須契約・実利用経路、R5は今回追加証拠の接続修正である。C2の完了判定を撤回し、C1/C3は今回新たな一括合格判定をしない。既存証拠は維持する。C1のsession再構成が実装上は削除＋legacy fallbackである点、C3救出にjournal rawが含まれない点は参照設計との差として残し、今回さらに汎用化する作業へ広げない。

実行したのは本番codec/loaderの日時反例、正しいdigest付き不正補助packageのdecode、旧savedStates採取反例。nativeは実行していない。既存テスト群の成功は上記反例を打ち消さない。

次は保存枠欠落防止→日時と入力除外→再試行と実保存後loaderの限定補修。P4開始はその確認後に再判定する。URL設計は独立して進められる。
