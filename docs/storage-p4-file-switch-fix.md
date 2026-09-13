# Luna：P4ファイル切替時の誤成功通知を修正

2026-09-13。最新の実施範囲は本書。今回は指示作成のみ。H1/H2の既存成功証拠を維持し、追加修正F1の1件を完了して停止する。

## 原因と修正方針

直接転送Aを受信したページでファイルBを選ぶと、`storage-transfer-page.js:decodePackageText`がpendingDecodedをBへ置き換える一方、receiverはAのpackageDigestを保持する。applyRestoreはBを復元し、receiverからAの成功receiptを返す。レビューの隔離診断で、本番codec/controller/通信層とテスト用runtimeを接続し、選択digestと成功receipt digestの不一致を再現した。実ブラウザや実保存の反例としてはまだ確認していない。

ファイル入力は独立した復元操作とする。直接転送との関連付けを明示的に解除し、Bの復元をAの成功として通知しない。同じ内容のファイルを選んだ場合も同じ切替規則を使う。共有保存writer、codec、receipt永続化の新設は不要。

## 実装範囲

親とManagerのAGENTS.md、GOAL.md、STATUS.md、本書を読み、必要箇所だけstorage-p4-transfer-design.mdと既存H1/H2テストを参照する。

主対象はstorage-transfer-page.jsとtools/test-storage-transfer-page.js。既存通信APIで切断通知・listener解除ができない場合だけstorage-transfer.js、送信側の表示・終了処理が必要な場合だけstat-prototype.jsと対応テストを限定変更する。

- ファイルの実選択後、読取り／decodeを開始する前に直接転送から切り離す。ファイル選択ダイアログを取り消しただけなら切り替えない。適用中・復旧要状態は既存ガードで切替を拒否する。
- 解除したreceiverのmessage listenerを外し、そのreceiverから遅れて届くpayload/decode完了がファイルのpreviewや状態を更新しないようにする。必要な最小限の世代チェックでよく、汎用状態管理基盤へ広げない。
- 元の直接転送previewとplanをファイルBに流用しない。Bを既存codecで検証し、新たなpreview→明示plan→明示applyを要求する。不正ファイルなら適用せず、直接転送Aの成功も通知しない。
- 元の送信元へは既存プロトコルの中止／拒否通知を利用して「直接転送は終了、復元完了は未確認」と分かるようにする。成功RESULTは送らない。適用前の終了として既存の再試行・listener解放規則へ接続する。
- 復元時の通信通知は、直接転送の有効な関連付けが残り、適用するpackageと一致する場合だけ行う。receiverが存在するだけで成功通知しない。

## F1の完了条件と検証

既存の本番controller・codec・sender/receiverを接続する焦点テストを追加する。通信を全てstubにして通知内容を自己申告させない。runtimeは既存のテスト用代替を利用してよいが、planへ渡したBとapply対象の対応をassertする。

1. 直接転送A受信→ファイルB選択→Bの明示復元で、適用内容はB、Aの成功RESULTは0件、元送信元はCOMPLETEにならない。
2. 切替後にAの遅延payload／decode完了が来てもBを置き換えず、Aの通知も再開しない。
3. ファイル不正／選択取消／適用中切替を区別し、保存なし・既存ガードを維持する。
4. 正常な直接転送A→A成功receipt、独立ファイル復元、H1の操作ロック・固定package保存が引き続き成功する。

最初に修正前のA→B反例が同じ検証経路で失敗することを確認し、修正後に成功させる。変更JSの構文、transfer/pageテスト、git diff --checkを実行する。保存runtime/codec自体を変更しない限り全保存テストの再走査は不要。

H2の既存native正常転送レポートは維持する。この反例の制御証拠をnative証拠と呼ばない。native追加が必要なら同じ独立環境のA→ファイルBだけへ限定し、全検証器の反復や普段使いプロファイル操作をしない。

## 記録と停止

開始前にF1の作業と変更境界を示す。終了後STATUS・受入台帳へF1 0/1→1/1の判定、実行証拠、未検証、残見積もりを記録し、元B-T4c/dへの対応を示す。H1/H2を最初からやり直さない。目安は限定修正＋焦点検証の1作業単位。

終了後はP4再判定とP5aの設計へ進めるか報告して停止。P5実装、datasheet・ゲーム生成物・計算式・公開設定変更、commit/push、自動実行Goal有効化は禁止。既存未コミット変更を維持する。
