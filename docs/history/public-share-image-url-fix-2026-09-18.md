# 公開共有画像URL修正（2026-09-18）

## 結論

`release-source`だけに、共有ページで版付き画像URLが壊れる不具合のローカル修正を行った。本番公開はしていないため、公開サイトの不具合は継続中である。

## 原因

`formation-share-display-data.js`の共有画像辞書には、例えば次のような画像ごとの版番号付きパスが含まれている。

```text
img/Chara/Kyarot.webp?v=版番号
```

`formation-share.js`の`shareAssetPath`がこの値全体を`publicSite.assetUrl`へ渡していた。`public-site-runtime.js`の既存契約は、パス本体を受け取り、必要に応じて共通`assetVersion`を付与するものなので、queryまでpathnameの一部としてエンコードし、次のようなURLを生成していた。

```text
img/Chara/Kyarot.webp%3Fv%3D版番号?v=共通版番号
```

公開サイトを読み取り確認したところ、共有表示は復号できる一方、379画像中この形式の画像で`naturalWidth=0`が発生した。これはユーザー提供の共有URLでも再現した。

## 修正

`formation-share.js`に共有側の局所的な参照分解を追加した。

- pathname、query、hashを分離する。
- 既存の`assetUrl(path, {query, hash})`契約を利用する。
- 共有側で共通版番号を追加しない。runtimeが選択した版番号を1つだけ使う。
- 日本語・空白・既存のエンコードをパス本体のままruntimeに委ねる。
- `http(s)`、`data`、`blob`、`//`、hash-onlyの参照は既存runtimeへ渡し、無条件decodeや危険な相対パス許可を行わない。
- new/legacyの`assetBasePath`は変更しない。

派生参照は既存の同期ツールで更新した。

```text
node tools/sync-formation-share-assets.js --write
```

同期対象は`stat-dashboard.html`、`formation-share.html`、`formation-share-create.js`。生成済み表示データ、payload形式、保存schema、画像cacheやService Workerの設計は変更していない。

## 修正前後の代表URL

修正前の公開実例（読み取り確認）：

```text
https://trickcal.irlab.dev/img/Chara/Kyarot.webp%3Fv%3Dec42f5b4f181dfbe?v=51b8b6e688a76db4
```

修正後のローカル生成結果（new profile）：

```text
http://127.0.0.1:8767/img/Chara/Kyarot.webp?v=93e2e029a39a4d4a
```

legacy profileでは同じ画像が次のbase pathで解決した。

```text
http://127.0.0.1:8767/trickcal-manager/img/Chara/Kyarot.webp?v=93e2e029a39a4d4a
```

## テスト

### URL処理

新規`tools/test-formation-share-asset-urls.js`で、実際の`public-site-runtime.js`と`formation-share.js`をVM上で実行して確認した。

- 版なし、既存query/hash、版付きqueryの分離
- 日本語・空白を含む未エンコードのパス
- new/legacyのbase path
- エンコード済みパスはruntimeが`%41`を`%2541`へ二重エンコードする制約を確認
- 正規化の重複適用は未対応・未検証であることを確認
- 絶対URL、data、blob
- 空、絶対path、親相対、backslash、double slashの拒否
- `%3F`を含む壊れたURLのHTTP 404
- 修正URLの実ファイルHTTP 200

サポート対象の未エンコードパスはnew/legacyとも成功し、修正URLはHTTP 200、壊れた形式はHTTP 404だった。エンコード済みpathnameと正規化の重複適用は成功扱いにしていない。実際の`formation-share-display-data.js`を読み取り、画像参照193件のpathnameに`%xx`形式は0件だった。

既知の後続課題として、共有側または共通runtimeで既存エンコードを保持する設計を別途検討する必要がある。今回の緊急修正では共通runtimeの再設計を行わない。

### 既存焦点検査

成功：

- `node --check formation-share.js`
- `node --check tools/test-formation-share-asset-urls.js`
- `node tools/test-formation-share-asset-urls.js`
- `node tools/test-formation-share-image.js`
- `node tools/test-formation-share-display-data.js`
- `node tools/test-formation-share-assets.js`
- `node tools/public-site-publication.js check`（`localOnly=true`、`publishable=false`）

`test-public-site.js`単独実行は、今回の修正前からのdirty sourceにより`release.sourceCommit`が40桁でないという既存前提で停止した。`test-formation-share-maintenance.js`は、今回変更していない既存`tools/git/push.bat`が期待される生成ステップを持たないため停止した。いずれも画像URL修正の回帰失敗とは区別している。

### ブラウザ確認

生成済みlocal-only outputを一時HTTP serverで配信し、new/legacyの共有ページを実ブラウザで確認した。

- 共有ページ：各379画像が`complete=true`かつ`naturalWidth>0`
- new/legacyとも画像URLに`%3F`なし
- 使徒、遺物、スペル、権能、性格、星、背景を表示確認
- CSS背景画像：壊れた`url()`リソースなし。共有ページの背景はグラデーション中心で、壊れたCSS画像は確認されなかった
- 管理画面の共有プレビュー：隔離recover状態から開き、画像生成成功、PNGプレビュー`1200x745`かつ`naturalWidth=1200`
- PNGの保存・クリップボードコピー：ボタン有効化までは確認したが、実ファイル保存とclipboard送信は未実施
- 代表スクリーンショット：new/legacy共有ページ、管理画面のPNGプレビューを実ブラウザで取得した

管理画面は隔離したrecover queryで起動し、利用者の保存データは変更していない。ローカルサーバーと生成物は検証後に停止・整理する。

## バックアップと境界

編集前バックアップは次の場所に保存し、対象ファイルとのSHA-256一致を確認した。

```text
D:/Games/etc/trickcal/backups/public-share-image-url-fix-20260918-01
```

対象は`formation-share.js`、焦点テスト、`STATUS.md`、派生同期前の3ファイル。mainは変更していない。mainへ反映する場合は、mainの現行差分を保持したまま別途バックアップ、差分確認、既存同期を行う必要がある。今回、mainへの移植、commit、push、公開、workflow起動、公開設定変更、datasheet編集は行っていない。

公開サイトは未修正であり、公開指示を待って停止する。
