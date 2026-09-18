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

## 公開結果

- source対象限定commit: `e23ee0024c9872a48d43b2c91c7281748ce24042`
- candidate: `857395a26ad71669`
- bundle: `tmp/publication-20260918150244174.json`
- new artifact commit: `665c69787c4477436fbbd8b4173dcb62a5f57305`
- new receipt: `tmp/delivery-857395a26ad71669-new-f8e9364888cb.json`
- new run: `https://github.com/innocentroad/trickcal-manager-site/actions/runs/35360331718`
- new identity: `https://trickcal.irlab.dev/public-site-deployment.json`。candidate/source/profile/digest一致、outputDigest `e137f2acf5ac30b1`。
- legacy artifact commit: `c7ce42f847b77fe473888276d06e690d6d0d1856`
- legacy receipt: `tmp/delivery-857395a26ad71669-legacy-d10d9eaf205f.json`
- legacy run: `https://github.com/innocentroad/trickcal-manager/actions/runs/35360718102`
- legacy identity: `https://innocentroad.github.io/trickcal-manager/public-site-deployment.json`。new成功後に通常承認を実施し、candidate/source/contentDigest一致、profile=legacy、outputDigest `d7d75afc5d24f9cb` を確認した。

両サイトの実ブラウザでmanager/calc/data/enemy/board入口、共通上バーと現在位置、使徒データ78行・画像79件（broken 0）、共有payloadの画像379件（broken 0、`.webp%3Fv%3D` 0）を確認した。隔離native検査で720px以下の2段、使徒データ5ビュー、低い画面の絞り込み展開、装備詳細、通知連携を確認した。

共有ページ先頭の既存文字列 `\\n` は今回の範囲外であるshared page newline fixを含めていないため残っている。ベルは公開ブラウザで確認し、移行バーの実表示は利用者の既存通知状態を変更せず、隔離fixtureで表示条件・連携を確認した。

## 残件・既存阻害

`test-formation-share-maintenance.js` は現行 `tools/git/push.bat` の固定前提不一致、`test-public-site-staging.js` は旧固定identity/digest前提で失敗する。いずれも今回の公開範囲外で、修正せず記録のみとした。mainの共鳴性格・share-v2・board本体の未公開変更は取り込んでいない。

## 未公開で残す変更

main側の未公開変更（共鳴性格、board本体の追加改修、その他の全列・共有v2等）はrelease-sourceへ取り込まず、mainに残したままとする。
