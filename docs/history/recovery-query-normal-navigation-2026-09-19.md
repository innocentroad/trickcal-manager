# 通常遷移のrecover query整理（2026-09-19）

## 結論

通常の公開ページ遷移には固定`recover=20260912`を追加しない形に整理した。過去の専用回避策は通常ナビゲーションと分離し、履歴復旧入口・現行storage recovery・保存処理・Service Workerの方針は変更していない。

作業場所は`tmp/release-source`、branchは`release-source`。開始時HEADは`004d6c9a52b7690666f7ceaf4d6ae553bde1bd63`、既存dirtyは`STATUS.md`だけだった。変更したSTATUSの直前公開記録は本ファイルと既存履歴のもとで保持した。commit・push・公開は行っていない。

## 原因と修正

独自ドメイン設定の取り消し後、通常の静的リンク・上バー生成・一括設定リンク・敵データへの動的リンク・prefetch・indexの転送先・公開route検証fixtureにも固定復旧queryが広く付与されていた。これは一度限りの旧転送cache回避を、通常のページ遷移へ残している状態だった。

- `shared-topbar.js`から固定queryの新規付与を取り除いた。通常route属性に過去の同じ固定値が引き継がれた場合も、通常リンク生成時にその値だけを除去し、他のquery/hashと相対・profile-aware pathを保持する。
- manager/calc/share/enemy/apostle/board HTMLのroute・戻りリンク、calcと公開DPS prototypeのprefetch/ナビ、calcの敵データ動的リンクから固定queryを除いた。
- `index.html`は固定queryを付加せず、受け取った`location.search`とhashをそのままmanagerへ引き継ぐ。受信URLを整理する`replaceState`や新規redirectは追加していない。
- `tools/public-route-manifest.json`の通常ページfixtureから固定queryを除いた。元の`view=settings`／`view=formation`は保持した。
- `stat-dashboard.html`編集で必要になった共有資材版同期は既存`tools/sync-formation-share-assets.js --write`で行った。派生hash値を`formation-share-create.js`へ、対応するscript参照版を`stat-dashboard.html`へ同期した。生成hashの手編集はしていない。
- 通常遷移テストを実DOM・実クリックへ拡張し、固定値のみを取り除き、別の`recover`値・`preset`・`phase`・hashが残るfixtureを加えた。

## 復旧入口の境界

- `recover-20260912.html`の明示的な復旧後リンクと`recover` queryは維持。公開route manifestには含めず、今回再公開もしない。
- 公開中の`storage-recovery.html`と`/recovery/`、legacy `/trickcal-manager/storage-recovery.html` routeは維持。
- 旧`formation-dps-calc.html`には同じ文字列が残るが、現在の`tools/public-route-manifest.json`にsource routeとして登録されていない。公開生成物にも含まれないことを確認し、対象外として編集しなかった。manifest掲載中の`formation-damage-dps-prototype.html`は通常遷移として修正済み。
- 旧recover付きmanager URLは通常ページとして読み込める。ページ初期化時にqueryを消す処理はない。
- 本変更は古い外部HTTP redirect cacheを消去しない。全利用者のcache・転送状態が解消したとは扱わない。

## 検証

- `node tools/test-domain-rollback-recovery.js` 成功。専用復旧query／入口維持、現行storage recovery route、通常HTML・manifest fixtureの固定値不在を検査。
- `node tools/test-public-site.js` 成功。new/legacy生成HTML、manager/calc/DPS/enemy/data/share routeとalias、通常リンクqueryを確認。
- `node tools/test-public-site-http.js` 成功。2 profileで2,187件の生成route・asset HEAD到達、route wiring、aliasを確認。
- `node tools/test-topbar-navigation-native.js` 成功。隔離Chromeでindexのquery/hash転送、旧recover付きmanager URLの直接表示・再読込、上バー／data／bulk遷移、旧固定値だけの除去と他query/hash保持、calc敵プリセット・phaseの実クリック引き継ぎを確認。
- `node tools/sync-formation-share-assets.js --check`、`git diff --check`、関連JavaScriptの`node --check`成功。
- 既存`test-domain-rollback-recovery.js`には、現在のService Workerキャッシュ版を別の古い固定値と比較し、計算JSの版参照を`app-cache.js`内で探す古い前提があった。現行`service-worker.js`／`app-cache.js`は今回変更しておらず、テストだけを現在の役割に合わせて改めた。専用復旧処理のエンドツーエンド再検証は今回の範囲外。
- 公開URL・外部browser profile・利用者の保存状態／cacheは操作していない。ローカル生成以外の本番公開確認は未実施。

## 対象ファイルと保全

通常リンク実装：`shared-topbar.js`、`index.html`、`stat-dashboard.html`、`formation-damage-calc.html`、`formation-damage-calc.js`、`formation-damage-dps-prototype.html`、`formation-share.html`、`enemy-status.html`、`public/apostle-data.html`、`public/board-layout-preview.html`。

公開生成・検査：`tools/public-route-manifest.json`、`tools/test-domain-rollback-recovery.js`、`tools/test-public-site.js`、`tools/test-topbar-navigation-native.js`、`tools/fixtures/topbar-browser-fixture.html`。派生同期は`formation-share-create.js`。記録は`docs/domain-rollback-recovery-design.md`、`GOAL.md`、`STATUS.md`および本ファイル。

変更前バックアップ（18ファイル、SHA-256一致）は
`D:/Games/etc/trickcal/backups/recovery-query-normal-navigation-20260919-01/release-source-before`（19ファイル）。
ハッシュ一覧は同フォルダの`SHA256SUMS.txt`。

## 残件

- release-sourceの対象限定公開待ち。
- mainには局所差分が未反映。後続で通常リンク・上バー／calc動的URL・route fixture・関連テストと必要な共有資材版同期を反映する。
- 公開後のnew/legacy URL確認は未実施。本番公開の前後を問わず、利用者全体の古い転送cache解消を保証するものではない。
