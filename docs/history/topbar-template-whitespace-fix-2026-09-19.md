# 公開サイト共通上バー下部余白修正（2026-09-19）

## 結論

公開サイトのmanager上バー下部に出ていた余白は、旧操作用 `template` に `.dashboard-top-actions`／`.fdc-top-actions` 系の表示CSSが適用され、template自体が空のinline-flexレイアウトボックスになっていたことが原因だった。共有上バーのruntimeは初期化時に `.topbar-page-row` を削除して実DOMを生成するため、これらのtemplateは現行runtimeの依存ではなかった。

旧templateを4ページから除去した。

- `stat-dashboard.html`
- `formation-damage-calc.html`
- `enemy-status.html`
- `public/board-layout-preview.html`

旧DPS専用ページに残る実DOMの `.fdc-top-actions` は別の旧UIであり、今回の共通上バー余白の対象ではないため変更していない。共通CSSの旧セレクタもこの利用箇所を壊さないため残した。

## 回帰検査

実DOM検査を追加・更新し、次を確認した。

- `tools/test-topbar-navigation-native.js`
  - manager、敵データ、ボードプレビューの旧templateが0件
  - 上バー実高と `--trickcal-topbar-height` の一致
  - 既存のmanager/calc/data/通知/テーマ/メニュー操作
- `tools/test-apostle-data-native.js`
  - 320、375、375×600、720、721、1280pxの旧template 0件
  - 上バー高さ同期、使徒データ表、内部スクロール、低い画面の絞り込み

成功した関連検査：

- `node tools/test-topbar-navigation-native.js`
- `node tools/test-apostle-data-native.js`
- `node tools/test-public-site.js`
- `node tools/test-public-site-http.js`
- `node tools/test-announcements.js`
- `node tools/public-site-publication.js prepare`

sourceのローカル実測では、new/legacy相当のmanager/calcで旧要素0件、上バー実高と同期値一致、720px以下2段・721px以上1段を確認した。隔離通知fixtureでは移行告知バー表示／非表示の双方を確認した。

## 公開証拠

- source commit: `d5e9ad5b138a0464bbb9933f1b85d4154263f526`
- candidate: `95de929a1e205768`
- bundle: `tmp/publication-20260918162507009.json`
- new receipt: `tmp/delivery-95de929a1e205768-new-f8e9364888cb.json`
- legacy receipt: `tmp/delivery-95de929a1e205768-legacy-d10d9eaf205f.json`
- new artifact: `ed50eaea4e1a2b11f0ab51c39b2ca70835d0ed7a`
- legacy artifact: `e95d13656aa9ca1711f2a1879a4a7a573ae81952`
- new run: https://github.com/innocentroad/trickcal-manager-site/actions/runs/35368580717
- legacy run: https://github.com/innocentroad/trickcal-manager/actions/runs/35368835253
- new identity: https://trickcal.irlab.dev/public-site-deployment.json
- legacy identity: https://innocentroad.github.io/trickcal-manager/public-site-deployment.json

両サイトとも通常のdeployment承認を経てpublishedとなり、candidate/source/profile/contentDigestの一致を確認した。公開ページの実測は、両managerで上バー51.875px、`--trickcal-topbar-height` 52px、旧template 0件。現ユーザー通知状態では移行バーは非表示で、利用者の通知状態は変更していない。

## 保全

変更前バックアップ：

`D:/Games/etc/trickcal/backups/topbar-template-whitespace-20260919-01/release-source-before`

HTML 4件、焦点テスト2件、`STATUS.md` を編集前にコピーし、各source/backupのSHA-256一致を確認した。mainのdirtyや未公開案件は取り込んでいない。
