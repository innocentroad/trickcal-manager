# 保存・排他・復旧契約 v1（P0 / Gate A）

2026-09-12。設計決定。実装担当はLuna。実装・ブラウザ検証済みという意味ではない。バックアップ項目と形式は[Gate B](storage-backup-format.md)、実施順は[再計画](storage-migration-delivery-plan.md)。

## 1. 境界と採用方式

localStorage/sessionStorageと現行保存キーを維持する。状態生成、計算、120ms debounce、slot競合判定は各画面に残す。共通層はアクセス結果、起動許可、復元との排他、復旧を担当する。通常保存を非同期キューへ全面変更しない。

Web Locksの同名shared/exclusiveを使う。通常アプリは起動中sharedを保持し、その保護下で同期保存する。全体バックアップ・復元はexclusiveを取得する。別タブの編集を自動停止して吸い上げる機能は作らず、利用者に他のTrickcalタブを閉じてもらう。

共有ロック同士は同時保持でき、exclusiveとは共存できるものではない。コールバックが返すPromiseで保持期間を制御する。これはWeb Locksの契約に基づく採用方式で、未実装の本アプリでの動作保証ではない。[Web Locks仕様](https://w3c.github.io/web-locks/)、[requestの仕様説明](https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request)。

### 制御用識別子（新設予定）

| 対象 | 識別子・内容 |
| --- | --- |
| Origin内の全体ロック | `trickcal-storage-access-v1`。通常shared、export/restore/recovery exclusive |
| 既存slot操作ロック | `trickcal-stat-slots-v2`。既存どおりexclusive |
| localメタデータ | `trickcal_storage_meta_v1`：`{version:1,epoch:<UUID>,restoreSerial:<整数>,lastRestore:<nullまたはreceipt>}` |
| local復元ジャーナル | `trickcal_storage_journal_v1`。構造は第5節 |
| session世代 | `trickcal_storage_session_epoch_v1`：epoch文字列 |
| 任意の通知 | `trickcal-storage-control-v1`。UI再読込通知用。排他根拠には使わない |

これらをP2/P3で台帳へ追加する。バックアップに含めない。Origin全キーへのclear・prefix一括削除は禁止。同じGitHub Originの他ツールの保存値を対象にしない。

## 2. 共通API

予定モジュール：`storage-registry.js`（項目とcodec）、`storage-runtime.js`（通常アクセスと起動）、`storage-backup.js`（形式と復元）。UMD等の既存パターンでブラウザとNodeから同じ関数を使えるようにする。

| API | 契約 |
| --- | --- |
| `boot({role}) -> Promise<Result>` | `role`はapp/maintenance。復旧・世代照合を終えるまでアプリ初期化を許可しない |
| `readRaw(id) -> Result<string|null>` | 台帳IDからキー/領域を解決。不存在はok+null、アクセス例外はerror。値の正常化はしない |
| `writeRaw(id,string) / remove(id) -> Result` | 同期。起動済み・許可状態・epoch一致・ジャーナルなしを確認してから操作。Storage例外を結果へ変換 |
| `registerParticipant({flush,freeze,resume})` | 画面の保存/編集境界。flushは同期Result、freezeは入力と後続保存を停止し進行中の非同期作業の終了を待てるPromise、resumeは状態不変の場合だけ利用 |
| `beginMaintenance(kind) -> Promise<Result<handle>>` | 同じタブをfreeze→sharedを解放→exclusiveをifAvailableで取得。失敗なら変更なしでsharedを再取得して復帰 |
| `handle.export/planRestore/applyRestore` | exclusive保護下でのみ使用。復元内容を利用者に確認させる前後で対象を再照合 |
| `handle.cancel()` | 適用前だけ可能。epoch不変ならsharedへ戻す。変更後はメモリを再利用せず再起動 |

Resultは`{ok:true,value?}`または`{ok:false,code,operation?,id?,retryable}`。codes：`not-ready`、`busy`、`stale`、`read-failed`、`write-failed`、`remove-failed`、`quota`、`invalid-data`、`unsupported`、`recovery-required`。DOMExceptionはnameで分類し、値・snapshotをログへ出さない。未知例外は握りつぶしてokにせずwrite-failed等として記録する。

通常書込はStorage操作成功までを示す。全体復元は各キーの読戻し一致まで必要。部分成功を一括成功に変換しない。ページの複数書込処理は操作別結果を集約する。

### 意図する現行動作との差

- 正常時のworkspace→live→legacy順と、slotのrevision/Lockは維持する。
- 書込失敗後に「保存済み」、明示削除成功、読み込んだ保存名の解除を確定しない。編集内容は画面に残し、保存失敗と再試行を表示する。
- メモリの変更と永続化を区別する。計算・DPSはメモリ上で継続可。設定が再読込で戻る可能性を通知し、成功扱いしない。
- live読込失敗をrevision 0と同一視しない。read-failedでそのpublishを止める。live-published通知はlive/legacyの両書込が成功した場合だけ送る。session失敗でも現行順にlive保存を試せるが、全体結果はpartial failure。
- 破損slot等の生データを起動時fallbackで上書きしない。読取とparseを区別し、書込停止・生データ救出へ誘導。純粋な不存在時だけ既存legacy移行を行える。

上記はP1の変更前基準と区別し、P2で意図した変更としてassertする。通信通知失敗で永続化成功を取り消さないが、同期状態を別に報告する。

## 3. ロックとライフサイクル

1. appのbootはsharedを取得し、メタデータとジャーナルを読む。初回metaなし、またはjournalありならsharedを解放してexclusiveによる初回設定/復旧へ進む。取得後に状態を再読込する。
2. 初回metaはrestoreSerial=0。既存のタブ内workspaceは維持し、そのepochをsessionへ記録する。journalがあれば先に復旧する。metaなしでjournalありの場合は初回扱いで上書きしない。
3. 通常sharedの取得完了を別のready Promiseで通知し、ロックcallbackはrelease用Promiseを待つ。request自体の完了をboot完了として待ち続ける実装にしない。
4. sharedを保持したまま通常同期write/removeを許可する。slot操作は全体shared→slot exclusiveの順。逆順取得は禁止。sharedは通常タブ同士の同一キー競合を解決しないので、slotの既存競合処理を残す。
5. blur/hiddenでは実flushしてsharedを保持する。隠れたアプリがいるとmaintenanceはbusyとなる。タイマーで他タブのロックを失効させない。
6. pagehideでは各participantの同期flush→書込許可off→shared解放。beforeunloadはflushのみ。pageshow/BFCache復帰はshared再取得とepoch照合を済ませてから入力・保存を再開する。取得待ちのflushを新規非同期保存へ置き換えない。
7. maintenance開始時は入力凍結、進行中のslot操作・snapshot更新等の終了待ち、同期flushをshared保護下で完了してから解放する。遅れて返るWorker等のcallbackには世代/許可を照合させ、書込を漏らさない。
8. exclusiveは`ifAvailable:true`。busyなら他タブ終了を案内し、手動再試行。`steal`・期限切れ推測・無限待ちは使わない。ready待ちの通常bootも取得できなければ「復元処理中」等の再試行画面にする。
9. 復元成功後は新epochにする。旧epochのメモリは保存不可。session marker不一致ならworkspace・比較session・reloadContextを新世代に従って削除/再構成し、アプリを再初期化する。meta.restoreSerial>0でmarkerなしも古いsessionとみなす。削除失敗なら初期化停止。

編集/読取画面も一貫したsnapshotが必要ならsharedを持つ。共有画像の純粋なURL描画iframeは保存非依存としてロック不要。テーマだけの描画は先行read可だがboot前writeは禁止。

Web Locks非対応/取得拒否の環境は、journal/metaを読めてjournalなしの場合に限り通常の互換保存を継続する。全体復元・整合性保証付きexportは使用不可で、読取専用の救出ファイルは利用可。journalが読めない/存在する場合は復旧可能な環境への案内を出し書込停止。file://は受入環境にしない。

P2導入前のタブはこのガードを持たない。移行操作前に旧版を含む他タブを閉じ、最新画面へ再読込することを必須の操作案内とする。検出できない旧タブまで保護できるとは表示しない。P6でこの導入手順を確認する。

## 4. 起動接続と実装対象

保存コードを実行するscriptをboot完了前に起動しない。各HTMLの既存script順を保つ起動ブロックを設け、runtime→boot→既存アプリ起動の順にする。IIFEの前のappState=loadStateも対象。単にDOMContentLoadedへガードを加えるだけでは足りない。

| 接続群 | 対象 |
| --- | --- |
| 管理 | stat-dashboard.html、stat-prototype.js。load/migrate、theme、slot、workspace、publish、イベント、export/import |
| 計算/DPS | formation-damage-calc.html/js、formation-damage-dps-prototype.html/js、formation-dps-calc.html/js、combat-scenario.js。暗黙保存とlegacy activeId同期も含む |
| 表示設定 | enemy-status、public/board-layout-preview、formation-share-prototypeのHTML/JS。theme・scale・共有設定 |
| 読取consumer | image-preload、formation-share、共有試作。中途復元の値を読んで起動しない |
| キャッシュ | app-cache、service-workerはユーザーデータのwriterではない。新bootstrap資材の配信/版同期が必要 |

台帳の全access siteを移設先へ対応付ける。省略されたHTML inlineのwriteも対象。Storage.prototypeを書き換える汎用monkey patchは採用しない。同期APIを使う既存テストはStorage境界を注入する。

## 5. 復元トランザクション

確認画面は対象項目数・上書き/削除・現在ドラフトの扱い・対象外を表示する。対象はGate Bの許可リストだけ。全体置換の利用者確認後に適用する。読み込んだ任意キーを直接setItemへ渡さない。

ジャーナルversion=1：`transactionId`、`phase`（prepared/committed）、`before`（触るlocalキーすべてのraw文字列またはnull。metaも含む）、`afterHashes`、`newEpoch`、`receipt`、`pendingWorkspace`（新session値またはnull）、`createdAt`。phaseを除く内容digestを持つ。beforeとpendingWorkspaceを一つのキーへ保存する。新local値全体は重複格納せず、適用中はメモリに置く。

| 状態 | 処理・失敗時の扱い |
| --- | --- |
| validated | ファイル/項目/版/上限検証、exclusive取得、対象生値の再照合。失敗・取消は変更ゼロ |
| prepared | beforeとpendingWorkspaceをjournalへ保存して同値を読戻す。作れなければユーザーキーへ書かず停止 |
| applying | 許可項目を固定順にset/remove、各readback。metaのnewEpochとreceiptは最後。sessionにはまだ適用しない |
| rollback | applying失敗、または再起動時preparedならbeforeの全項目を逆順で復元し同値確認。繰り返し実行可。全成功後だけjournal削除 |
| committed | 全local readback成功後、journal.phase=committedを永続化・読戻し。これがcommit点。以後は旧値へ自動rollbackしない |
| session-pending | 新workspace・session epochを適用、比較session/reloadContextを削除してreadback。失敗ならjournalを保持し「データ適用済み・再開処理が必要」。成功通知はまだ送らない |
| complete | journal削除と不存在確認→新状態で起動可能。転送COMMITTED応答はここで送る |

commit書込/読戻しで結果不明なら再度journalを確認する。preparedならrollback、committedならsession再開、読めない/壊れた場合はrecovery-required。決め打ちで成功/rollbackしない。

session復元はcommit後なので、別タブが起動復旧する場合も新workspaceをjournalからそのタブへ作れる。session完了後journal削除前にクラッシュしても同じ内容の再適用でよい。新workspaceIdと同期IDは新規生成、localのepoch/receiptは再生成しない。

rollbackの途中失敗・journal破損・未知version・journal削除失敗は通常アプリを起動せず、journalと読める対象生値の救出・再試行画面を出す。容量を空けるためのユーザーキー削除を自動実行しない。ブラウザの保存領域全消去・端末故障への復元保証はファイルバックアップが担当する。

元データのダウンロード退避は確認画面で提供する。journalを退避容量の検証代わりに省略しない。既存値＋journal＋新値で容量不足になる場合も安全停止/rollbackを行う。上限以内でもブラウザに保存できる保証はしない。

## 6. P2/P3受入条件

- A-T1：通常sharedを持つ実2タブがあるとrestore exclusiveはbusy。閉じると取得できる。通常slot競合基準を維持。
- A-T2：実callbackと時計でflush後二重保存なし。pagehide解放→pageshow再取得前の書込拒否。hidden保持によるbusyも確認。
- A-T3：boot前の暗黙writeなし。journal/epoch判定不能時、すべてのページで書込不可。旧sessionの復帰も対象。
- A-T4：prepared保存、各local書込、meta書込、commit、session各書込、journal削除の各境界で例外/中断を注入し、表の次状態と残存値を確認。
- A-T5：unsupported、quota、通信失敗、破損journalを区別し、値を失敗ログへ出さない。成功UI/COMMITTEDを早出ししない。
- A-T6：同一Originの別ツールキー・除外キーが不変。通常コードから制御キーを任意書換えできない。

P1の旧挙動基準を先に確保し、意図した差分だけ更新する。A-T1/2のnative部分は実装前提の検証であり、設計文書の作成だけで達成扱いにしない。
