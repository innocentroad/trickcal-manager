# 重大修正とP4転送設計

2026-09-13。利用者の最新方針を反映した設計。実装・公開・自動実行Goalの有効化は行わない。P3レビューの事実は維持するが、計算設定の完全再現をP4の阻害条件にしない。本書は旧Q1〜Q3の実施優先度とP4開始条件を更新する。Gate Aの排他・journal・commit・救出契約は維持する。

## 1. 保護するものと許容するもの

| 区分 | 内容 | 扱い |
| --- | --- | --- |
| 必須 | stat.slots、stat.current内の育成・編成・カード等、保存計算結果calc.resultSaves | 欠落・丸め・暗黙初期化を禁止。不正/未知版なら適用を止め元データを保持 |
| 必須 | 起動、復元失敗時の保護、旧タブからの上書き防止、救出 | P4実装開始前に修正・確認 |
| 補助 | calc.settings、dps.settings、dps.runtimeOverrides | 完全再現は後回し。安全に読めないdatasetを除外し、確認画面に明示して続行可 |
| 従来どおり | calc.enemyPresets、表示設定、共有表示設定 | 敵プリセット等の利用者作成データを設定緩和に含めない。既存契約を維持 |

補助設定を除外した場合は、その復元先キーを変更しない（削除/初期化を自動実行しない）。新側に値がなければ既存アプリの初期値となる。既に新側にある壊れた設定で起動不能になる場合は軽微な差異ではないため停止し、救出後の明示リセットを別途案内する。

除外はdataset全体単位。unknown versionや不正型を「現行版扱い」で通さない。packageの外側版・digest・容量・危険なプロパティ・未知datasetの検査は緩和しない。補助datasetの意味検証失敗のみwarningと除外候補に変換し、利用者が確認してからplanを作る。正常な設定は従来どおり復元する。

## 2. 重大修正案（P3最小出口）

### C1：復元後に使い続けられる（旧F1 / A-T6）

対象：storage-runtime.js、storage-bootstrap.js、runtime/restoreテスト。

- fresh bootでepochが違う/markerがない場合、Gate Aに従い古いsession workspace・比較・reloadContextだけを破棄・再構成。正常なlocalのcurrentからworkspaceを作り、readback成功後にmarkerを更新する。
- journalが残る場合は先に既存の復旧処理。破損/削除失敗を無視しない。
- 起動済み旧メモリは保存不可を維持し、再初期化を要求する。単にmarkerを合わせない。
- 合格：空sessionの新規起動、同一タブ再読込、旧タブ復帰で起動/保存の正否を確認。local必須データ・他キー不変。新規タブはnative代表1例も取得。

### C2：育成・編成・保存計算を欠落させない（旧F2/F3の重大部分 / B-T1/B-T2）

対象：storage-backup.js、storage-runtime.jsのplan接続、backup/restoreテスト。本番計算式は変更しない。

- slots/currentはGate Bのsnapshot形式に合わせ、draft/live/legacyを混同せず復元先の運用ID/revisionを再生成する。stored-onlyはlive優先・不存在時のみlegacy。生rawコピーで済ませない。
- 保存計算はid/name/savedAt/snapshotを保持。現行loadDamageCalculationSavesが項目をfilterし、writeDamageCalculationSavesが50件へsliceするため、配列であるだけの検証を合格にしない。50件超、不正snapshot、未対応版は事前拒否し、切り捨てない。
- 保存snapshot内の設定は独立した補助設定ではない。補助設定除外を理由に保存snapshotの中身を削らない。
- 実codec→plan→apply→新contextの実loaderで全件のID・名前・日時・snapshot一致を確認する。実画面で代表保存を開く。計算式更新による将来の再計算値一致を保証する作業へは広げない。
- 補助設定の不正だけで必須データが止まらないよう、§1の除外をpreviewとplanに接続。除外キー不変と保存計算不変を確認する。
- 既に現行raw形式の全体バックアップを配布しているかは未確認。破棄しない。互換readerが必要なら明示converterを加え、契約形式との曖昧な自動判別はしない。

### C3：失敗時に救出できる（旧F4 / A-T4）

対象：storage-runtime.js、storage-recovery.html、storage-bootstrap.js、焦点テスト。

- ready/maintenance/flushを要求しない読取専用救出APIを独立入口へ接続する。allowlistのraw、journal、読取失敗を救出形式に格納。取得不能なメモリを取得済みと表示しない。
- 通常起動のエラー画面から救出へ案内。壊れたslot/journal、Web Locks非対応でダウンロードを可能にする。復元や正常backupが非対応であることとは分ける。
- 合格：救出によるアプリ保存キーの書込みゼロ、読取失敗明示、通常backupとの形式区別、実ダウンロード代表。救出ファイルは自動復元可能と表示しない。

C1/C2/C3の合格と既存transaction回帰の維持をP4実装開始条件にする。設計は今回先行する。旧P3全条件を無条件に達成へ繰り上げず、補助設定の完全再現は延期として記録する。テーマの磨き込みやDPS各使徒の細かな設定互換を新たな停止条件にしない。

## 3. P4の利用者操作

1. 旧管理画面で「新サイトへデータを移す」を押す。現在タブのドラフトを含むこと、他タブの未保存編集は含まないことを表示。
2. クリック処理中に新側の受信タブを開く。非同期採取を待ってから開かない。採取は既存freeze/flush/backup処理を使い、送信データを固定したら旧側のmaintenanceを終了する。確認待ち中ずっと排他を保持しない。
3. 新側で「保存枠n件・現在の編成・保存計算n件」、除外する補助設定、新側既存データの置換警告を表示。新側のバックアップ保存操作も置く。初回受信で自動適用しない。
4. 利用者が復元を確認してから既存plan/applyを実行。確認待ちの間に新側を更新できるので、適用直前に排他取得と新側状態の再照合を行う。変更があればpreviewをやり直す。
5. complete確認後に完了表示・新サイトを開く。旧側データは削除しない。これは採取時点のコピーであり、以後の双方向同期ではない。

転送ボタンが作る新側受信ページはstorageの起動前復旧ガードを使うが、通常アプリの編集participantは起動しない。管理画面からはcurrent-tab、独立送信入口からはstored-onlyを使用する。後者を「現在の未保存編集も含む」と表示しない。

## 4. 転送契約

- 本番は旧`https://innocentroad.github.io/trickcal-manager/`→新`https://trickcal.irlab.dev/transfer/`の一方向。新旧リポジトリ・DNS構成はGate Cを変更しない。
- ファイルと同じpackage文字列を送る。転送専用の保存writerを作らず、validator→preview→planRestore→applyRestoreを共通利用。
- 共通message項目はprotocol=1、type、128bit以上の暗号学的乱数nonce、transferId。PAYLOAD以降はpackageDigestも必須。転送IDとruntime内部transactionIdの対応をreceiptへ保持する。内部transactionIdを無理に外部IDへ置換しない。
- HELLO（機密なし）→READY→PAYLOAD→PREVIEW→利用者確認→APPLYING→RESULT。別にSTATUS_QUERY/STATUS_RESPONSEを設け、再照会は書込みを行わない。
- event.origin完全一致、event.sourceが開いたWindow、nonce/ID/protocol/type/段階を毎回確認。targetOriginは固定値、`*`禁止。任意のURLパラメータから送受信先を採用しない。
- 最初のHELLOは受信側で許可Originとopener一致を確認してnonce/IDを1件だけ束縛する。以後別nonceは拒否。接続10秒で機密送信を諦めファイルを案内する。受信UIの確認には10秒制限をかけない。
- DATAの再送は同じID/digestのみ。同じIDで違うdigestは拒否。適用中の重複は状態応答だけ。complete済みならjournal/sessionが完了していることを確認してreceiptから応答し、再適用しない。
- APPLYING以降の通信途絶は「完了未確認」。タイムアウトでrollbackや再適用を行わない。STATUSでreceipt/journalを照会。committed/session-pendingは完了扱いしない。古いreceiptが置換済み等で不明なら、新側の確認と新しい明示操作を要求する。
- receiptはtransferId、元packageDigest、適用選択（表示設定/補助除外）、内部transactionId、epochを結び付ける。同じ転送の再照会で適用選択を変えない。元packageは除外のために改変しない。
- 適用開始前の取消は新側保存書込みゼロ。適用開始後は通信UIの取消を無効にし、既存transactionの復旧規則に委ねる。
- データはquery/hash・ログ・解析・サーバーへ送らない。旧Origin内の別ページをpathで隔離できるという保証はしない。

Window参照、origin/source検証、固定targetOriginの根拠：[MDN postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)。クリック中の起動とポップアップ制限：[MDN window.open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)。2026-09-13確認。実際の公開ヘッダーやスマホ動作は未確認。

## 5. スマホとファイル代替

- iframe常駐や第三者storageへの依存を避け、トップレベルの新タブで受信する。ポップアップ拒否、opener分断、旧タブ停止等はファイル導線へ。セキュリティヘッダーを弱めて通信を強行しない。
- 旧側で「バックアップを保存」、新側で「ファイルから移す」。自動転送用に固定した同じpackageを保存できるようにする。保存成功を検知できない環境で「ファイル保存済み」と断言しない。
- 片手幅でも件数・警告・復元/取消を縦に表示。閉じる前に新側の確認を案内。iOS SafariとAndroid ChromeはP6実機確認に残し、デスクトップ狭幅だけで実機合格にしない。
- Locks非対応ではP3の制約を維持し、安全な復元は非対応と案内。ファイルにすると排他要件まで回避できるとは扱わない。

## 6. 実装単位と出口

| 単位 | 実装予定 | 固定出口 |
| --- | --- | --- |
| T1 | storage-transfer.js（新規）と焦点テスト、receiptの限定拡張 | B-T4a：2 Originプロトコル、origin/source/nonce/ID違いで書込みゼロ。B-T4b：重複/ACK欠落で二重適用なし |
| T2 | storage-transfer.html（新規）、管理画面導線、共通preview/restore UI接続 | B-T4c：確認/取消/新側変更再確認、保存計算件数と内容保持。B-T4d：ファイル代替が同じpipelineを使用 |
| T3 | 独立ブラウザrunnerへ必要最小限を追加 | B-T4e：ローカル2 Originで実クリック→転送→復元→新規タブ起動。送信元の採取後データ不変、他キー不変、ファイル往復。B-T4f：制御とnative・実機未検証を分けた引渡し |

送信元のfreeze/flushに伴う通常保存と、転送が行う削除/上書きは区別する。「送信元不変」は採取完了を基準とし、通常の利用者編集は禁止しない。

ローカルは既存HTTP fixtureサーバーを2ポートで起動しOriginを分け、専用プロファイルを再利用。テストOrigin設定はtools側の隔離構成に限定し、本番のallowlistをURLで緩めない。資材追加は必要なページ読み込みだけとし、公開prefix生成・workflow/DNS/案内ONはP5/P6へ残す。

各開始前に対応ID・変更境界を示し、終了後STATUSへ証拠・未達・残見積もりを記録。前単位未達なら次へ進まない。C1〜C3＋T1〜T3の6作業単位が目安で、ターン数の約束ではない。検出器一般化、既存quota試験の無目的な反復、設定の全組合せ検証はしない。

## 7. 停止点

今は修正案とP4設計を作成して停止。次の実装依頼ではC1→C2→C3を通過してからT1→T2→T3まで進められる。raw形式ファイルの配布状況など互換性判断が必要になった場合はその部分で確認する。P4ローカル合格は新ドメインへの本番移行完了ではない。P5/P6、commit/push、DNS・Pages変更、公開案内有効化には別の指示が必要。
