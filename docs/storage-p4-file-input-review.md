# P4 F1再レビュー・Lunaへの次回指示

2026-09-13。レビューと指示作成のみ。実装・公開・自動実行Goalの開始はしていない。

## 判定と根拠

元の問題（Bを復元してAへ成功通知）は修正されている。receiver/listener解除、直接転送世代の検査、適用package digestとの通知束縛を確認した。transfer/pageの2テストは今回も成功した。H1/H2の既存証拠は維持する。

**[P1] 不正ファイル選択後に以前のpackageを復元できる。** `storage-transfer-page.js`の`selectFile`は直接転送を解除するが、`pendingDecoded`と旧previewを消さない。`decodePackageText`が不正ファイルを拒否しても、旧データへのprepare/applyが可能なままである。読み取り中にも旧previewが残る。同じ入力切替境界の未完了であり、別の保存基盤設計は不要。

本番controller/codecと既存テストhelper・代替runtimeによる隔離診断で、正常Aを表示→実file input changeへ不正JSON→prepare→applyを通した結果：

```json
{"invalidFileError":"バックアップの形式または内容を確認できません。","oldPackageRetained":true,"previewVisible":true,"plan":true,"applied":true,"applyCalls":1}
```

これは実保存/nativeの証拠ではなく、誤った適用要求がruntimeまで到達する制御証拠。実利用者の保存データは使用・変更していない。現在のテスト成功はこのケースを網羅していない。F1の元条件3と「元preview/planを流用しない」が未達のため、F1 1/1とP4無条件完了を保留する。成功部分を最初から検証し直さない。

## 次回：F1残件の限定補修（1作業単位）

親とManagerのAGENTS.md、GOAL.md、STATUS.md、本書を読む。元条件はstorage-p4-file-switch-fix.mdを維持し、本書を最新実施順とする。

対象は原則`storage-transfer-page.js`と`tools/test-storage-transfer-page.js`、証拠文書のみ。既存未コミット変更を維持し、開始時に変更境界とF1の対応条件を記録する。

1. ファイルの実選択が受理された時点で、読取り前に旧package文字列・decoded・preview・適用可能状態を無効化する。直接転送の解除は既存修正を維持する。ダイアログ取消では旧状態を維持し、既存の適用中・復旧要・maintenanceのガードを弱めない。
2. 読取り・decode中は旧対象をprepare/apply/save-packageできないようにする。最新の有効入力が検証成功した後だけpreview→明示plan→明示applyを可能にする。読取り失敗、不正JSON、救出形式、codec拒否では対象なしを維持する。
3. 読取り中は操作を無効にする簡単な対応でよい。複雑な連続選択・取消・遅延競合の網羅や、新しい世代管理の導入を今回の追加完了条件にしない。既存の直接転送ガードは維持する。

### 焦点検証

- 正常Aのpreviewから不正Bを実file input handlerへ渡す。失敗後hasPackage=false、旧preview非表示、prepare/apply不可、runtimeのplan/apply増加なしを確認する。まず現行コードでこの期待が失敗することを記録し、同じ経路で修正後に成功させる。
- 新規回帰テストは上記の不正B選択の1件を必須とする。読取り中の旧対象無効化はコードと同テストの入力境界で確認する。遅延・取消・連続入力の組合せテストを追加必須にしない。
- ファイル選択取消は旧previewとdirect接続を維持する。正常Bは新しい明示確認で復元可能。F1のA成功RESULT=0、遅延A拒否、既存applyロックは維持する。
- 本番controller/codec・既存runtime helperを再利用する。新しい保存writerや独立の模擬実装を作らない。native全件再実行は不要。制御証拠をnativeと呼ばない。
- `node --check storage-transfer-page.js`、`node --check tools/test-storage-transfer-page.js`、`node tools/test-storage-transfer.js`、`node tools/test-storage-transfer-page.js`、`git diff --check`を実行する。保存runtime/codecを変更しない限り全保存検査へ広げない。

## 終了と次段階

STATUSと受入台帳へ、F1元条件に対する達成・証拠・未検証・残り見積もりを記録する。今回の反例が残る間はF1を達成へ戻さない。H1/H2の成功数を撤回したり、全検証環境を再構築したりしない。目安は補修と焦点検証の1作業単位。

利用者の最新指示により、最小補修に合格したら[補修→P5aの連続実施指示](storage-p5-luna-instructions.md)へ進む。旧指示の「補修後に停止」は今回置き換える。

アプリ保存writer、datasheet、ゲーム生成物、計算式、公開設定、commit/push、自動実行Goal有効化は禁止。P5aのローカル実装・成果物生成は新指示の範囲で許可し、P5b実配信は別承認とする。
