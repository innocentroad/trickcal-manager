# Luna実装Goal：レビュー修正→P2再判定→P3完了

2026-09-13更新。R1は4/4、R2は3/3、R3は3/3、R4-1は1/1、R4-2は1/1、R4-3は6/6達成。実ブラウザquotaの安全停止まで確認できたため、P3を完了として停止する。P4以降と自動実行Goal有効化は行わない。

## 目的・進行権限

既存データを保護した全体バックアップ・復元を完成させる。実装担当はLuna。実施順と停止点は本書、保存・復旧仕様はstorage-contract.md、データ形式はstorage-backup-format.mdを正とする。元の必須条件は維持する。旧P2完了判定はレビューにより撤回し、R1→R2→R3→R4の順に各出口合格後だけ続行する。開始後はこの範囲の旧P3禁止を置き換える。

親/repoのAGENTS.md、GOAL.md、STATUS.md、本書、storage-contract.md、storage-backup-format.md、storage-native-browser-environment.md、storage-s1-acceptance.md、storage-migration-delivery-plan.mdを読む。旧G1〜G3の証拠は再利用し、旧達成数を引き継いで合格としない。

## 作業境界・記録

開始時にgit statusと対象差分を確認し、既存変更と今回の変更境界をSTATUSへ記録する。未コミット変更を保持する。対象は保存共通層、接続画面、バックアップ/復旧入口、必要な資材キャッシュ同期、関連テスト・文書。datasheet、生成データ、DNS/Pages/workflowなど公開設定、P4のOrigin転送、P5/P6、commit/pushは対象外。

各小スライス開始前に作業と対応条件IDを示す。終了後はSTATUSと受入台帳へ達成条件数、コマンド・観測・反例、未達/未検証、残り作業単位を記録する。下記R条件と元A/B条件を対応付け、二重計上しない。正常系だけでなく狙った反例が同じ実装入口・assertionで失敗することを確認する。

3スライス連続で必須条件の達成がほぼ増えなければ再計画案を提示して停止する。契約変更・新権限・手動操作が必要なら具体的判断/操作/観測値を報告して停止する。検出器の一般化、無関係な品質改善、同じ原因のtimeout反復へ広げない。

## R1：レビュー修正（A-T2/3/5）

- R1-1：stat-prototype.js末尾のcatchから参照できないreportStorageFailureのスコープを修正。実script全体の起動・失敗通知を確認する。native監視はabout:blankへの接続と監視登録後に本番URLへ遷移し、起動例外を捕捉する。既知の起動例外を同じ検査経路が検出する反例も必要。
- R1-2：loadSharedStateSlotStore等で読取失敗・parse失敗・不存在を区別。破損slotを空slot/legacy移行で上書きしない。正常な不存在時の既存移行は維持し、破損値を保持して書込停止・救出案内へ接続する。P3救出が未完成の時点で救出済みとは表示しない。
- R1-3：hiddenFlushedによる古いflush成功の再利用を修正。実callbackと仮想時計でhidden→visible→再編集→pagehide（beforeunloadなし）、hidden後の更新、120ms debounce、pageshow前書込拒否を確認する。最新編集の保存と不要な二重保存を両方確認。
- R1-4：DPS設定/効果設定のread/write例外を空設定や成功へ変換しない。メモリで計算は継続でき、永続化失敗を表示する。2使徒の設定保持、再試行、read失敗後に既存保存値を空データで上書きしないことを確認する。

出口：4/4。修正前の反例が検査で失敗し、修正後に合格。構文・runtime/behavior基準の関連回帰成功。実装の一部だけを抽出した検査で起動全体の合格を代用しない。

## R2：P2再判定（Gate A第2〜4節、A-T1/2/3/5/6）【完了】

R1合格後、契約から本番入口と証拠へ対応表を作り不足だけ補修する。特に部分保存失敗の結果・通知、全writer/consumerの起動保護、participant freezeで進行中slot/snapshot処理を待つこと、失敗/取消時の復帰、pagehideの保存順を照合する。4件修正だけで全契約を達成したとしない。

独立profile・ローカルOriginでstat保存/import/export、DPS対象切替・再読込、2タブbusy、実lifecycle、boot guardの必要な代表確認を行う。制御とnativeを分け、補助fixture成功を本番成功へ繰り上げない。起動例外やアプリ必須check失敗を無視しない。環境が使えなければ操作手順と残条件を記録して停止。

出口：P2対象のA-T1/2/3/5/6と第2〜4節の対応表に必須未達なし。既存behavior/runtime基準、inspection、変更JS構文・差分が成功し、native代表の終了コード0も確認した。AST反例を多数含む`test-storage-baseline.js`は長時間無出力のためR2証拠へ採用せず、inspection本体の`inspect-storage.js`成功とbehavior基準を分離して記録した。journalの実復旧と復元後session再構成はR4へ明示的に割り当てる。

## R3：バックアップ採取・検証・確認UI（B-T1/2、B-T3容量）【完了】

storage-backup等の共通codec/validatorを実装し、ファイルと将来の転送が同じ復元pipelineを使える入口にする。12 dataset、present/absent、current-tab/stored-only、slotと未保存draft、表示設定ON/OFF、既存slot形式との区別、未知版/型/ID/破損/digest/入力上限はGate Bどおり。

利用者が操作できるファイル保存・投入・対象確認・取消UIを用意する。確認前や取消でユーザーキーを書き換えない。適用機能はR4完成まで成功扱いしない。純粋な変換は既存形式fixtureと照合し、値を黙って欠落・丸めない。

実codecで最大育成6slot、別draft、実設定、実計算保存50件、before journalを計測する。モデル複製のみでB-T3実測合格にしない。上限不足があれば実測値と設計判断を報告して停止。

出口：B-T1/2のcodec/計画段階、実ファイル出力・入力・取消の代表確認、容量実測を完了した。実Storageへの復元往復、再起動後一致、journal transaction、quota実測、rollback・救出はR4へ残す。

R3実施結果：`storage-backup.js`で12 dataset、present/absent、`current-tab`/`stored-only`、旧slot形式・救出形式の識別、未知版/型/ID/破損/digest/入力上限を検証した。statの全体バックアップUIは実ファイル出力、file input投入、12項目preview、取消を実装し、preview/取消前後のstorage不変を専用native環境で確認した。最大育成fixtureを用いた実codec測定では、6 slot・計算保存50件・before journalを含め、package 1,861,098 bytes、payload 1,475,105 bytes、before journal 1,473,776 bytesだった。アプリquotaやR4復元成功はこの出口の証拠に含めない。

## R4：復元・中断復旧・救出（A-T4/5/6、B-T1/3）【実施中】

### R4-1：復元transactionの共通runtime（A-T4/A-T5/A-T6）【完了】

`storage-runtime.js`のrestore maintenance APIを、R3の検証済みbackup packageだけを受ける形で実装した。plan時は読み取りと対象再照合だけを行い、apply時に`prepared→applying→committed→session-pending→complete`をjournalへ記録する。local user keyの適用は固定順・各readback付き、metaは新epoch/receiptを最後に更新し、commit前の失敗はbeforeを逆順に戻す。commit後はlocal after-hashを確認してworkspace、除外session、session epochを再構成し、journalを消せない場合は成功扱いにしない。完了後の旧runtimeは保存不可・reload requiredとする。

`tools/test-storage-restore.js`で、正常適用、meta書込み失敗とrollback、rollback中のjournal削除失敗、再起動時prepared/applying rollback、commit後session-pendingの再起動復旧、壊れたjournalの保持・boot停止を同じruntime/storage入口で確認した。R4-2ではUIと独立復旧入口、R4-3では各故障点・quota・救出・native代表を追加する。

### R4-2：確認UIと独立復旧入口（B-T1/B-T2、A-T3/A-T5）【完了】

statのバックアップpreviewを「ファイル確認→復元対象確認→最終適用」の二段階にし、対象dataset、上書き/削除、表示設定の選択、下書き扱いを表示する。確認だけではユーザーキーを変更せず、最終applyのcomplete後だけ成功表示とreload導線を出す。journalが残る失敗では閉じず、同じmaintenance handleの再試行または`storage-recovery.html`へ案内する。独立入口は通常のapp bootを呼ばず、許可されたjournalだけをexclusive下でrollback/session再構成し、破損・未知journalは保持して停止する。

Gate A第5節のprepared→applying→committed→session-pending→completeを実装する。commit前はrollback、commit後はsession再開。各set/remove/readback、meta、commit、session、journal削除に独立した失敗/中断を注入し、新しい実行環境のbootから復旧を確認する。exclusive保護、epoch更新、旧sessionの再構成、成功通知の時点、対象外キー不変を維持する。

容量不足時の元データ保持/rollback、未知/破損journalの保持、救出ファイル、再試行、正常バックアップと救出形式の区別を実装する。独立した復旧入口を用意し、通常アプリがboot停止しても利用できるようにする。

独立ブラウザで実UIのバックアップ→変更→復元→再読込、取消、2タブbusy、代表的中断からの復旧を確認する。全故障点は制御テストで網羅し、native代表で代用しない。旧slot入出力互換も確認する。

出口：A-T4/5/6、B-T1/2/3のP3条件を達成。既存保存回帰と重点自己レビューに未解決のデータ損失・誤成功通知の問題なし。B3容量実測を残したままP3完了にしない。スマホ実機・B-T4転送・公開は後続条件として残す。

### R4-3実施結果（2026-09-13）【完了】

`storage-runtime.js`のjournal直列化にUTF-8 16MiB上限と、journal削除後の読戻し再確認を追加した。`tools/test-storage-restore.js`では、prepared/applying/local/meta/commit/session/journalの各保存境界を操作×キー別に失敗注入し、quota、oversize、rollback、session-pending、再起動復旧、journal保持、秘密値非出力、対象外キー不変を同じrestore入口で確認した。`node tools/test-storage-backup.js`の実codec容量はpackage 1,861,098 bytes、payload 1,475,105 bytes、before journal 1,473,776 bytesだった。

専用一時Chromeの`node tools/storage-native-browser-check.js --summary`では、statの実export/file input、preview/取消の意味的storage不変、救出ファイル、復元apply・再読込・draft復元・journal削除、2タブLock、DPS対象切替・再読込、boot guardを確認した。追加のquota検査では4,718,592文字の一時フィラーでChromeの`QuotaExceededError`を発生させ、実復元UIのquota表示、元データ不変、journal不変、「元の状態へ戻しました」を確認した。最新runの`storageAppLifecycle`と補助fixture focus/visibilityは前面状態依存でtimeoutだったが、別の成功runで実アプリlifecycleとfixture focus/visibilityを確認済みであり、同じtimeoutは反復していない。

R4-3固定IDは、A-T4、A-T5、A-T6、B-T1、B-T3、native代表の6件を達成した。制御のlocal書込quota rollbackと、nativeのjournal書込quota安全停止を分けて確認し、制御証拠をnativeへ繰り上げていない。R4/P3の残条件は0で、P4以降・Origin転送・スマホ実機・commit/pushには進まない。

## 停止・引継ぎ

P3完了で停止する。完了できない場合は現在の条件ID、再現証拠、必要な判断/手動操作、残見積もりを報告する。自動実行Goalを利用する場合も未検証を完了へ繰り上げず、ツールの停止規則に従う。

開始指示：

```text
AGENTS.md、GOAL.md、STATUS.md、docs/storage-p3-luna-goal.mdと指定契約・台帳を読み、LunaでR1→R2→R3→R4を実施してください。各出口合格後だけ次へ進み、P2完了の旧判定は使用しないでください。開始時に既存変更境界、各着手前に対応ID、終了後にSTATUSと受入台帳へ証拠・達成数・未達・残見積もりを記録してください。狙った反例を実入口で検証し、制御とnativeを分けてください。契約判断・新権限・手動操作が必要なら停止し、3スライス進捗停滞なら再計画してください。未コミット変更を維持し、P3完了で停止。P4以降、datasheet/生成データ/公開設定、commit/pushへ進まないでください。
```
