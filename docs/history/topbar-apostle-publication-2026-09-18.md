# 共通上バー＋使徒データ公開記録（2026-09-18）

## 範囲

公開source `release-source` に、mainから機能単位で次を取り込んだ。対象限定でcommit/pushし、公開は新サイト成功後に旧サイトへ進める。

- 共通上バー本体とCSS、manager/calc/data/enemy/boardへの接続
- managerの既存画面切替API・現在表示との同期、データ選択メニュー、通知ベル・移行告知バー連携
- board-layout-previewの上バー接続・テーマ初期表示同期だけ。ボード本体の下バー化・左端スクロール・背景・B1〜B3・凡例等は対象外
- 使徒データの専用HTML/CSS/JS、5ビュー、基礎設定の9等級列と戦闘力補正値A/B、固定行列、内部スクロール、装備詳細、コンパクト操作帯、初期閉の絞り込みと低い画面での展開
- 公開route/manifest/generator接続と、上記に対応する焦点テスト・隔離fixture

含めていないものは、mainの共鳴性格、共有v2、board-layout-preview本体改修、datasheet/xlsx、workflow/保護設定、shared pageの改行修正、目的外のデータ再生成である。公開済み共有画像URL修正はrelease-sourceの現行実装を保持した。

## 保全

開始時のsource対象ファイルを次へ退避した。

`D:/Games/etc/trickcal/backups/topbar-apostle-publication-20260918-04/release-source-before`

対象一覧とSHA-256照合結果を同フォルダの `sha256.tsv` へ保存し、編集前ファイルとバックアップが一致することを確認した。mainのdirtyは変更していない。

## 検証

最終構成で次を実行した。

- `test-public-site.js`、`test-public-site-http.js`
- `test-public-site-release-input.js`
- `test-public-site-publication.js`、`test-publish-public-site.js`
- `test-announcements.js`
- `test-topbar-navigation-native.js`
- `test-apostle-data-native.js`
- 共有codec/image/asset検査

native browser検査では、manager/calc/dataの共通上バー、manager内部の選択状態、データメニュー3項目（使徒データ・敵データ・ボードプレビュー）、Escape時のフォーカス復帰、PCのボタン寸法、detail pagesの固有操作保持、boardの保存テーマ初期同期を確認した。使徒データは5ビュー、基礎設定の追加列、装備詳細、sticky見出し・使徒列、320/375/低い画面での絞り込み展開と内部スクロール、画像のnaturalWidthを確認した。

次の2件は既存阻害として記録し、今回の範囲外を修正していない。

1. `node tools/test-formation-share-maintenance.js` は現行 `tools/git/push.bat` が古い専用validator呼出しを含むことを固定前提にして失敗する。
2. `node tools/test-public-site-staging.js` は旧sourceの固定 `expectedCommit`/digest/identity 前提で失敗する。現行開始HEAD `3d1d3e62e284739309a02ab2be0c0b9587abab8f` と一致しないことを確認した。

いずれも今回の上バー・使徒データの取り込みを成功扱いにするために隠していない。

## 公開状態

この記録作成時点では、対象限定commit、source push、candidate、配信先へのartifact transfer、workflow実行、通常deployment承認、新旧サイト公開は未実施。対象限定stageと最終差分を確認した後、既存runがあれば重複起動せず、runbookのreceipt再開手順に従う。

## 未公開で残す変更

main側の未公開変更（共鳴性格、board本体の追加改修、その他の全列・共有v2等）はrelease-sourceへ取り込まず、mainに残したままとする。
