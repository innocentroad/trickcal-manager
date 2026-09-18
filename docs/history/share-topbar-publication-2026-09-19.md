# 編成共有ページの共通上バー統一・公開（2026-09-19）

## 原因と修正

共有ページには、共通上バーへ移行済みの他ページと異なり、旧 `share-topbar` と旧テーマボタンが残っていた。さらに、公開生成器のcanonical/OG URL挿入処理が `additions.join('\\n  ')` を使っていたため、生成HTMLのbody先頭付近に改行ではなく文字列 `\\n  ` が現れていた。

今回の局所修正は次のとおり。

- `formation-share.html` の旧ヘッダーを既存 `shared-topbar.js`／`shared-topbar.css` に置換し、共有ページ識別を `data-shared-topbar-page="share"` とした。管理ページの現在位置は点灯させず、profile-awareなリンク解決を維持した。
- 共有本文の冒頭にコンパクトな `編成共有` 見出しを残し、旧テーマ操作・空の旧操作要素を除去した。
- `formation-share.js` の旧テーマ初期化・イベント登録を除去し、保存済みテーマと共通テーマボタンを一本化した。
- `formation-share-prototype.css` の共有ページ余白を共通上バー／既存告知バーの実高変数へ接続した。
- `tools/generate-public-site.js` の挿入区切りを実改行 `\n` に修正した。生成済みHTMLは手編集していない。
- 版付き参照は既存の `sync-formation-share-assets.js` で同期した。payload、codec、保存schema、画像URL修正、画像生成対象、告知条件は変更していない。

## 焦点検査

成功：

- `node tools/test-formation-share-image.js`
- `node tools/test-formation-share-assets.js`
- `node tools/test-public-site.js`
- `node tools/test-public-site-http.js`（生成site、HTTP 200、静的参照・route wiring・alias・SW gate）
- `node tools/test-formation-share-codec.js`
- `node tools/test-announcements.js`
- `node tools/test-topbar-navigation-native.js`
- `git diff --check`、対象JS構文検査

`node tools/test-formation-share-maintenance.js` は今回変更前から、`tools/git/push.bat` の固定パス／固定前提が現行検査の期待と一致しないため失敗している。共有ページ上部修正とは無関係なので修正せず、成功扱いにもしていない。

## 公開証拠

- source commit: `c7668d48730074dd8278412d8901e9d537428f3b`
- source branch: `release-source`（originへpush済み）
- candidate: `9fa9315c737e7713`
- bundle: `tmp/publication-20260918185638537.json`
- checks: `tmp/publication-20260918185638537-checks.json`
- contentDigest: `2cd343ccb62e6609f2485468a39e8b3004b6138a8a53e6e8c6c53822e6556e2b`

### new

- artifact commit: `a42c654d7c414dbd0ad3d97224b979976a99d0ee`
- outputDigest: `12f9bd010a976083`
- run: [35383358780](https://github.com/innocentroad/trickcal-manager-site/actions/runs/35383358780)
- receipt: `tmp/delivery-9fa9315c737e7713-new-f8e9364888cb.json`
- success record: `backups/publication-history/9fa9315c737e7713-new.json`
- identity: [trickcal.irlab.dev/public-site-deployment.json](https://trickcal.irlab.dev/public-site-deployment.json)

### legacy

- artifact commit: `5ea2173946788df3bcf6ba46918ad4ed4521e9d6`
- outputDigest: `d22e4030f1cef544`
- run: [35383951521](https://github.com/innocentroad/trickcal-manager/actions/runs/35383951521)
- receipt: `tmp/delivery-9fa9315c737e7713-legacy-d10d9eaf205f.json`
- success record: `backups/publication-history/9fa9315c737e7713-legacy.json`
- identity: [innocentroad.github.io/trickcal-manager/public-site-deployment.json](https://innocentroad.github.io/trickcal-manager/public-site-deployment.json)

new成功後にlegacyへ進み、両runで通常のdeployment承認を実行した。両identityはcandidate/source/profile/contentDigest/outputDigestが各成功記録と一致した。

## 公開後の実画面確認

指定payloadを次で確認した。

- new: `https://trickcal.irlab.dev/share/#1.z.C3EODmBkZBSS1WN2kHWVZZLlZtaWVZPVkOXlYxVlZWTlZBVjZWKVZJVlVWBVZxViFmRiZmVkYgYiFlY2dnYONk4WLi5uHl5eblZOBgYGARZWRkZWJg5WJj5eJl5WJn5WRjlWJh5WJhFeJllWJhleJiagcaxMUrxMXKxMikDFbAwMyfeZnzJn5ji4MbMxSHFpWgMA`
- legacy: `https://innocentroad.github.io/trickcal-manager/formation-share.html#1.z.C3EODmBkZBSS1WN2kHWVZZLlZtaWVZPVkOXlYxVlZWTlZBVjZWKVZJVlVWBVZxViFmRiZmVkYgYiFlY2dnYONk4WLi5uHl5eblZOBgYGARZWRkZWJg5WJj5eJl5WJn5WRjlWJh5WJhFeJllWJhleJiagcaxMUrxMXKxMikDFbAwMyfeZnzJn5ji4MbMxSHFpWgMA`

new/legacyとも、共有本文の画像379件は全件 `complete=true`・`naturalWidth>0`、失敗0件。共通上バーのnote画像を含むページ全体のimg要素は380件だった。旧 `.share-topbar` は0件、body直下に文字列 `\\n` は0件、画像URLの `.webp%3Fv%3D` は0件だった。newは1280pxと375px、legacyは375pxで、上バー・本文見出し・画像を目視確認した。

テーマは保存済みdarkの初期表示から1クリックでlight、もう1クリックでdarkへ戻り、aria-label／aria-pressedも追従した。データメニューの既存route、ベル一覧・未読点・Escape／閉じるを確認した。共有ページでは既存通知条件どおり移行告知バーは表示されなかったため、条件を変更していない。payloadなし／不正payloadでも共通上バーを保ったまま既存エラー案内が表示された。

旧サイトで `画像を生成` を実行し、`共有画像を作成しました（1200×850px）。` を確認した。画像生成処理は本文領域を対象としており、今回の上バー・告知バーを生成対象へ追加していない。保存／コピー操作は今回実行していない。

## 保全と残件

変更前バックアップ：

`D:/Games/etc/trickcal/backups/public-share-topbar-20260919-01/release-source-before`

STATUS編集前バックアップ：

`D:/Games/etc/trickcal/backups/public-share-topbar-publication-20260919-01/release-source-before`

各バックアップのsourceとのSHA-256一致を確認した。mainの未公開変更は取り込んでいない。残件は、今回の対象外であるmaintenance検査の固定前提不一致と、保存／コピーの実操作未確認。旧サイトの停止・閉鎖、workflow・保護設定・公開設定の変更は行っていない。
