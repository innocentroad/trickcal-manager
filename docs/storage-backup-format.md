# 全体バックアップ・転送形式 v1（P0 / Gate B）

2026-09-13更新。実装契約は維持し、R3のcodec・validator・採取UI・確認preview、R4-1/R4-2のrestore transaction・確認UI・独立復旧入口を実装・代表確認済み。R4-3で各失敗境界、制御quota、救出、native復元/readback/reboot、実ブラウザquotaの安全停止を確認した。排他・commit・復旧は[Gate A](storage-contract.md)、実施順は[再計画](storage-migration-delivery-plan.md)を正とする。

## 1. 形式

### 2026-09-13 C2補修（重大修正Goalの受入条件）

`calc.settings`、`dps.settings`、`dps.runtimeOverrides`だけは、採取時に構文・既知の設定形・対応版を検査する。検査に失敗した場合は、バックアップ全体を捨てずに`{state:"excluded",reason:"invalid-data"|"recovery-required"|"unsupported"}`として確認画面へ出せる。ただし容量超過・危険プロパティ・必須datasetの不正は除外へ変換しない。復元計画は`allowAuxiliaryExclusion:true`の明示確認がない限り拒否し、確認済みの場合だけ該当キーを復元対象から外して復元先の現在値を保持する。`calc.resultSaves`は常に厳格検証・復元対象とし、除外によって保存計算結果を欠落させない。

### 2026-09-13 利用者方針による限定更新

[重大修正とP4転送設計](storage-p4-transfer-design.md)を、計算設定の取扱いとP4契約の最新補足とする。育成・編成・保存計算結果は厳格に保護する。calc.settings / dps.settings / dps.runtimeOverridesに限り、意味検証に失敗したdatasetは確認画面で明示して除外でき、除外キーは復元先で変更しない。外側版・digest・容量・危険プロパティ等の安全検査は緩和しない。この例外は下記の「7 dataset必ず置換」「未知内部版で全体拒否」より優先する。敵プリセットと保存snapshot内の設定は例外に含めない。完全再現の延期を、既に実装済み・検証済みとは扱わない。

UTF-8 JSONファイル。圧縮はv1では行わない。

```json
{"format":"trickcal-manager-backup","version":1,"payloadJson":"<JSON文字列>","sha256":"<payloadJsonのUTF-8バイト列のSHA-256、小文字64桁>"}
```

payloadは`{schemaSet:1,sourceRelease,createdAt,sourceMode,datasets}`。sourceReleaseは資材版文字列、createdAtはISO日時、sourceModeは`current-tab`または`stored-only`。digestは再serializeしたJSONではなく、受け取ったpayloadJsonの正確な文字列から算出する。digestは破損検出であり認証ではない。

外側versionとschemaSetは別物。v1 readerは両方1だけを受け入れる。未知版・未知dataset・欠けたdatasetは適用前に拒否する。将来は明示converterを追加し、旧fixtureを保持する。任意のstorageキーを入力から採用しない。

## 2. 12項目と19キーの対応

datasetはすべて必須フィールドで、各値を`{state:"present",value:...}`または`{state:"absent"}`とする。不在、空配列、0、読取失敗、破損を同一視しない。

| dataset | 元の台帳ID | 復元 |
| --- | --- | --- |
| stat.slots | stat.slotStore | 1〜6の保存slotを全体置換。値は`{slots:{"1":{savedAt,snapshot},...}}` |
| stat.current | stat.workspaceDraft、stat.liveMirror、stat.legacyCurrent | 値は`{activeSlot,snapshot}`。現在ドラフトとlive/legacyを再構成 |
| calc.settings | calc.settings | 置換 |
| calc.resultSaves | calc.resultSaves | 置換。現行上限50件、超過を切り捨てない |
| calc.enemyPresets | calc.enemyPresets | 置換 |
| dps.settings | dps.settings | 置換 |
| dps.runtimeOverrides | dps.runtimeOverrides | 置換 |
| preference.theme | preference.commonTheme、preference.statThemeLegacy、preference.calcThemeLegacy、preference.boardPreviewThemeLegacy | 共通light/darkへ統合し4キーへ同値を再構成 |
| preference.boardShortcutOffMode | 同名台帳ID | node/route |
| preference.boardOrientation | 同名台帳ID | horizontal/vertical |
| preference.boardPreviewScale | 同名台帳ID | 有限数0.6〜1.6 |
| sharePrototype.globalEnhancements | 同名台帳ID | 既存表示設定として保持 |
| 対象外 | stat.reloadContext、comparison.session | 持ち運ばず、復元commit後に対象タブから削除 |

テーマ・board設定・共有表示設定の5 datasetを「表示設定も復元」の一括選択対象とする。初期ON。OFFなら対応する新側のキーは変更しない。それ以外の7 datasetは必ず全体置換し、absentは対応キー削除を意味する。新側の保存と自動マージしない。未知の新側キー・他ツールキーは触らない。

制御用meta/journal/session epochは持ち運ばない。新側の制御形式がreaderより新しければ復元不可。

## 3. 採取・再構成

- current-tab：Gate Aのfreeze・flush後、そのタブの実ドラフトを採取。保存slotへ勝手に反映しない。他タブの未保存編集は含まないと表示する。
- stored-only：管理画面が使えない独立入口用。正しいlive.snapshotを優先、live不存在の場合だけlegacyへfallback。破損・アクセス失敗を不存在にしない。タブ固有の編集は含まない旨を確認させる。
- slotStore不存在時に`legacy.savedStates`へ保存枠が残っている場合、現行backup codecは旧移行処理を推測複製せず通常exportを`recovery-required`で止め、救出または管理画面の既存移行を案内する。保存枠をabsentとして正常出力しない。converterを将来接続する場合も元storageへは書かず、旧fixtureとの一致で別途検証する。
- テーマの採取優先順はcommon→stat→calc→boardPreview。不在だけ次へ進む。既存の不正値は拒否。すべて不在ならabsent。
- snapshotから削る運用フィールドはトップレベルのsavedStates、syncRevision、activeStateSlotのみ。activeStateSlotはstat.current.activeSlotへ分離。その他の正当なデータを縮約しない。
- slotStoreはschemaVersion=2、storeRevision=1（空は0）、各slotRevision=1、savedByは復元transactionIdで生成。savedAtとsnapshotを保持。
- workspaceはworkspaceVersion=2、新workspaceId、activeSlot、対応するbaseSlotRevision、draftを生成。選択slotが空ならbaseSlotRevision=0。ドラフトが保存slotと同一とは仮定しない。
- currentがpresentならliveはschemaVersion=2/revision=1、新sourceTabInstanceId、sourceSlot=activeSlot、publishedAt=復元日時、snapshotから生成。legacyはsnapshotにsyncRevision=1とactiveStateSlotを付与。currentがabsentならlive/legacy/workspaceを削除し、通常の新規状態として起動する。
- local適用順はslotStore→live→legacy→calc.settings→calc.resultSaves→calc.enemyPresets→dps.settings→dps.runtimeOverrides→テーマ4キー→board3キー→共有設定→meta。選択対象外は飛ばす。session適用はGate Aのcommit後。

schemaSet=1の内部形式は既存台帳の現在版を基準とする。slot schema2、workspace2、calc settings enemyCorrectionSchema6、計算snapshot4、DPS settingsVersion2、共有表示version1。明示版のない現行形式は独立validatorを固定する。旧版変換は既存コードから必要な純粋処理を抽出し、変更前fixtureとの一致で検証する。未知の明示版を現行normalizerへ渡さない。

`calc.resultSaves[].savedAt`を保持する場合は、現行`loadDamageCalculationSaves()`が保持できる有限の非負数（現行writerは`Date.now()`の数値）のみ受理する。ISO日時や数値化できない文字列は、loaderが`0`へ変換して元日時を失うため通常backupを事前拒否する。`savedAt`が存在しない項目と空の`name`は現行loaderの既定値補完を伴う旧データとして扱い、受入テストではraw値の一致とloader後の値を分けて記録する。

既知構造の未知ID・追加プロパティは保存値から黙って削らない。対応できず既存起動処理が値を失う場合は、その項目を拒否し理由を出す。JSONの危険なプロパティ名`__proto__`/`constructor`/`prototype`は再帰的に拒否し、prototypeへの代入をしない。

## 4. 容量・入力検証

ファイル全体、payloadJson UTF-8は各8MiB以下。JSON深度64、総ノード100万以下。journalはUTF-8換算16MiBを事前上限とする。上限超過は分割・切捨てをせず拒否。JSON構文、型、版、数値の有限性と既知値域、件数、digestをすべて検査してから確認画面へ進む。

これはアプリの入力上限でありブラウザquotaを保証しない。ジャーナルを実際に確保・読戻しできてから適用する。容量不足なら元データ保持／rollback。自動で保存結果を削除しない。

P0読取専用計測：max-growth-verification-state.jsonのsnapshotを使いJSON compactで算出。

| 内容 | UTF-8 bytes |
| --- | ---: |
| snapshot単体 | 140784 |
| 同じ最大育成snapshotを6slotへ配置 | 845309 |
| 6slot＋現在draft | 986112 |
| 上記＋live＋legacy相当 | 1267742 |

この計測はP0時点のモデル複製であり、ブラウザ保存成功や計算保存50件を含む全体計測ではない。8MiBは暫定安全上限。R3では実`storage-backup.js` codecで、最大育成fixtureの6 slot、実データ相当の設定、計算保存50件、before journalを含む測定を追加した。

| R3実codec測定 | UTF-8 bytes |
| --- | ---: |
| package全体 | 1,861,098 |
| payloadJson | 1,475,105 |
| before journal | 1,473,776 |

package/payloadは8MiB、journalは16MiBの入力上限内だった。これはcodecと入力上限の測定であり、ブラウザquotaへの書込み成功、journalの実確保・読戻し、restore後の再起動一致を保証しない。上限不足が正当な利用データで生じた場合は形式・上限の変更を報告し、黙って丸めない。実Storage・復元の確認はR4で行う。

## 5. 旧形式・救出

既存`trickcal-stat-state`のslot exportは全体形式へ流用しない。既存slotインポートとして判別・案内し、全体を上書きしない。既存入口の互換性はP1基準とP3回帰で維持する。

正常なpackageにできない場合は別形式`trickcal-manager-rescue` version1で、許可リストの読めたraw値、領域、読取失敗一覧、採取可能な現在メモリをファイル出力する。救出形式は通常復元へ直接投入不可。自動補完して正常バックアップと表示しない。中身を外部へ送らず、利用者の端末へ保存する。

## 6. 新旧転送

ファイルと同じpackageをpostMessageで渡し、受信側は同じvalidator/planRestore/applyRestoreを使う。送信元のデータは削除しない。

- 許可Originは`https://innocentroad.github.io`と`https://trickcal.irlab.dev`の固定組。pathだけを信頼境界にしない。同じGitHub Originのページを暗号学的に識別できるとは保証しない。
- 開いたwindowの同一性（event.source）、完全一致origin、protocol=1、ランダム128bit nonce、transactionIdを全messageで照合。targetOriginに`*`を使わない。
- HELLO→READY→PAYLOAD→利用者の対象確認→RESULT。RESULTはCOMMITTED/CANCELLED/FAILED。COMMITTEDはGate Aのcomplete後だけ。
- 初回HELLOには機密情報なし。READY応答でnonceを確認してから送信。10秒で接続できなければファイル代替を案内。適用開始後はタイムアウトだけで再適用・取消しない。
- ACK欠落時はtransactionId/package digestを使って照会する。meta.lastRestoreは両値と完了epochを保持。同一ID・異digestは拒否。同じ復元済みreceiptは再適用せず、journal/session完了を確認して応答。
- v1は同時転送1件だけ。現在sessionのnonce以外は拒否。古いreceiptが上書きされた後の再要求は自動再実行せず新しい利用者確認を必要とする。
- URLのquery/hash、ログ、解析へ保存データを載せない。ポップアップ拒否・画面閉鎖・接続失敗では同じファイルの保存/取込を案内。

## 7. 受入

B-T1：12項目往復、slotと未保存draftの差、absent/空/表示設定OFF、対象外キー不変。
B-T2：未知版/不正型/破損/digest違い/過大入力で書込ゼロ。旧slot形式と救出形式を区別。
B-T3：最大育成6slot＋実設定＋実保存50件のサイズ、quota失敗、読戻し、再起動後も情報欠落なし。
B-T4：2 Originで転送、source/origin/nonce違い、取消、ACK欠落、重複、ファイル代替。送信元不変。
