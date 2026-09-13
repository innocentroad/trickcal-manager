# S1レビュー補完設計

2026-09-12。初回補完の実施記録。再レビューで下記の完了判定を撤回した。現行の実施契約は[S1追加補完設計・Luna指示](storage-s1-second-followup-design.md)を正とする。検出器の方式、必須挙動確認、完了条件は追加設計に従う。

## 目的と完了条件

S1の19キー台帳を出発点に、保存失敗の現状、未登録アクセス検出、実動作の基準を補完する。ロードマップC1と、C2の変更前比較基準に対応する。既存の静的検査成功を保存挙動の検証成功とは扱わない。

次の1スライスをS1補完（Luna high、必要ならmax）とする。次の3項目が揃った時点でS1完了を再判定し、A/B設計へ引き渡して停止する。

1. 全writerについて成功・読込失敗・書込失敗・削除・起動時書込を台帳に記録する。
2. 台帳外のファイル、定数キー、optional chaining、未解決の動的アクセスを検出し、意図的に追加した検査用ケースで失敗することを示す。
3. 実際の既存コードを使った正常・失敗・再読込・タブ競合の代表ケースを固定し、未検証範囲を残す。

## 実施結果

- `tools/storage-inventory.json`へ`productionDiscovery`、理由付き`dynamicAccessExceptions`、19キー分の`failureMatrix`を追加した。失敗行列は成功時挙動、読込、書込、削除、呼出元結果、起動時書込、access siteを持つ。
- `tools/storage-access-detector.js`を追加し、台帳の`productionSources`とは独立にPages相当のJS/HTMLを列挙した。現在の本番候補から64件を検出し、定数・直接文字列・optional chaining・computed access・alias・HTML inline scriptを検査した。
- `tools/test-storage-baseline.js`へ、未登録ファイル・未登録キー・未解決動的キーを失敗させるfixtureと、コメント内偽アクセスを無視するfixtureを追加した。現行コードの動的helperは2件のみ例外台帳へ登録し、未使用例外も失敗させる。
- `tools/test-storage-behavior-baseline.js`は保存ロジックを写経せず、現行`stat-prototype.js`／`formation-damage-calc.js`／`formation-damage-dps-prototype.js`の関数を最小VMへ抽出して実行し、`combat-scenario.js`は公開APIを直接実行する。slot保存・workspace再読込・削除・stale競合・破損fallback、live／legacy片側失敗、計算保存、DPS保存、比較sessionの正常／失敗境界を固定した。
- acorn、espree、@babel/parserが環境に存在しなかったため、実行時依存は追加せず、コメント・文字列を除外する依存なしトークン検出器を採用した。完全なAST解析ではないことを未検証事項として台帳とSTATUSへ残した。

## 台帳の補完

各entryに対応する`failureMatrix`へsuccessBehavior、readFailure、writeFailure、callerOutcome、startupWrites、accessSitesを記録した。accessSitesはファイル・関数・操作・キー解決方法・根拠を持ち、storageキーの削除と、保存オブジェクト内部の項目削除を区別する。読取専用consumerとAPI経由consumerも区別する。

不足や破損を空データへ置換する経路は明示する。19という件数を保証値にせず、検出結果から増減をレビューする。表示設定の誤ったreader登録も各ファイルで再照合する。

## 検出器の範囲

本番候補ファイルの探索を台帳のproductionSourcesから独立させる。現行Pages工程の除外ディレクトリを照合したうえで、配信対象JSとHTML内inline scriptを探索する。noindexやprototypeという名前だけで除外しない。将来S5aの公開manifestができたら探索入力を接続する。

getItem/setItem/removeItem/clear、通常・optional・computed access、定数参照、storage aliasを調べる。既存の構文解析ライブラリ（acorn、espree、@babel/parser）が使えるか確認したが環境に存在しなかったため、開発時依存を増やさないトークン検出器を選定した。実行時アプリへ依存を追加しない。ASTでしか判定できない複雑な実行時生成は未検証として残す。

任意のJavaScriptを完全に静的解決できるとは保証しない。動的キーやstorage引数が解決不能なら、ファイル・位置・式を未解決一覧へ出して失敗させる。関数引数経由は呼出元のキー集合を明示し、限定した例外登録に理由と根拠を付ける。ファイル単位の無条件除外は禁止する。

検出器自身のfixtureでは、直接文字列、定数、optional chaining、alias、HTML、新規ファイル、動的キー、コメント内の偽アクセスを検証する。未登録の実アクセス追加で検査が失敗し、コメントでは誤検出しないことを受入条件とする。

## 挙動基準の作り方

保存ロジックをテストへ写経しない。既存の公開API・既存ハーネスを優先し、閉包内処理は隔離ブラウザで実ページを起動するか、読込時だけテスト用に露出する最小限のVM変換を使う。VM変換の抽出に失敗した場合は停止し、別のモック実装へ置換しない。共通層導入のための本体リファクタリングはS2へ残す。

storageモックはキーの不存在と文字列を区別し、操作順を記録し、指定したread/write/removeの境界で例外を発生させる。local領域はタブ間で共有、session領域はタブごとに独立させる。ブラウザ特有のstorage event、focus、終了時flushは隔離したHTTP環境の2タブで確認する。利用者の既存ブラウザデータをfixtureにしない。

| ケース | 比較する結果 |
| --- | --- |
| 保存・再読込・削除 | 値、slotRevision、他スロット不変、削除がstore内項目の除去であること |
| workspaceあり／なし | 同タブdraft優先とlegacy fallback、明示スロットを暗黙更新しないこと |
| debounceとflush | 連続編集の最終値、120ms境界、pagehide/非表示での操作順 |
| 別タブ更新 | clean時の適用、dirty時の競合、stale revision拒否、Lock非対応時の保証範囲 |
| 破損slot JSON | 旧savedStatesからの再生成・書戻しを現行の既知問題として記録 |
| workspace保存失敗 | sessionが更新されない場合のlive書込継続と通知 |
| live／legacy片側失敗 | 各書込境界の残存値、通知有無、呼出元への結果 |
| 計算保存・敵保存・DPS保存失敗 | 永続値とメモリの差、メニューや通知の状態、再読込後の値 |
| DPS起動と対象切替 | 通常モードのavailability確認を含む暗黙書込、対象別設定保持 |
| 1スロットexport/import | 保存済み値と未保存draftの区別、他領域不変、旧形式代表例 |

既存最大育成fixtureは版・出典を保持し、現在の全使徒最大を保証するものと扱わない。検出fixtureと失敗注入用の合成入力を追加した。保存データ本体をログへ出さず、期待値比較の結果と操作順を記録する。

## 現状維持と意図した改善

正常保存の互換テストと、既知の問題を観測するテストを分ける。後者には「S2で改善予定」と明示し、不具合の維持を恒久条件にしない。Aで合意した失敗通知・破損値保全の改善だけを、対応する期待値変更として記録する。

## S1補完の判定と残課題

上記3条件を満たしたため、S1補完を完了と判定する。基準コマンドは次の2つで、いずれも利用者の実保存領域へ書き込まない。

```text
node tools/test-storage-baseline.js
node tools/test-storage-behavior-baseline.js
```

実ブラウザ2タブのstorage event、focus/visibility/pagehide、実quota超過、複数キーの実復元、旧Originから新Originへの転送は未検証である。これはS1の保存動作を変更せずにA/Bの判断材料を固定する範囲を越えるため、S2以降の受入条件へ渡す。S2の共通保存層、失敗UI、完全バックアップ、移行実装へは進まない。

Gate Aでは全writerの共通制御、復旧を起動前に行う境界、失敗結果とUI通知、旧タブ制約を決める。Gate Bでは破損生データの救出と正常バックアップの区別、ミラー不整合時の選択、形式互換・容量を決める。S1補完結果が揃うまでA/Bの最終確定は保留するが、設計案の検討は並行可能。

完了報告には検出件数、未解決件数、ケース別結果、未検証端末、コード変更範囲、残り見積もりを含める。検証環境構築だけで1スライスを超える見込みなら、完了率を上げず最小ハーネス案を再提示する。
