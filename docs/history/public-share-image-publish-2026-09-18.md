# 共有画像URL修正の新旧公開（2026-09-18）

## 公開結果

明示許可された今回の共有画像URL修正だけを`release-source`から対象限定でcommit・push・公開した。新サイト成功確認後に旧サイトへ進み、両方で通常のdeployment承認を実行した。workflow、保護設定、DNS、Pages設定は変更していない。

- source branch: `release-source`
- source commit: `48518aed9eb08f026060c8f61375fd9ff3854051`
- candidate: `e96bb03a2721a1d1`
- contentDigest: `90705d0735ad665a16a516971e20d54c544702f9c14f812f2e26e909ce6b30d0`
- bundle: `tmp/publication-20260918043524766.json`
- checks: `tmp/publication-20260918043524766-checks.json`

### new

- receiver commit: `50e169a9eb439cae37f13ac88f2f661f6a6c449f`
- outputDigest: `ce47cbf6c9f8e8bb`
- repository/branch: `innocentroad/trickcal-manager-site` / `main`
- workflow/run: `pages-deploy.yml` / [35307707779](https://github.com/innocentroad/trickcal-manager-site/actions/runs/35307707779)
- result: `published`
- delivery receipt: `tmp/delivery-e96bb03a2721a1d1-new-f8e9364888cb.json`
- success record: `backups/publication-history/e96bb03a2721a1d1-new.json`

### legacy

- receiver commit: `05ba0bc820e14797548f038cf353c6cac4263f45`
- outputDigest: `694161ad238d1e2c`
- repository/branch: `innocentroad/trickcal-manager` / `legacy-site-artifact`
- workflow/run: `pages.yml` / [35307921820](https://github.com/innocentroad/trickcal-manager/actions/runs/35307921820)
- result: `published`
- delivery receipt: `tmp/delivery-e96bb03a2721a1d1-legacy-d10d9eaf205f.json`
- success record: `backups/publication-history/e96bb03a2721a1d1-legacy.json`

## identity確認

公開後にidentity URLを読み取り、次の値を確認した。

- new `https://trickcal.irlab.dev/public-site-deployment.json`: HTTP 200、candidate/source/profile/contentDigest/outputDigestがnew成功記録と一致。
- legacy `https://innocentroad.github.io/trickcal-manager/public-site-deployment.json`: HTTP 200、candidate/source/profile/contentDigest/outputDigestがlegacy成功記録と一致。
- 両方の`candidateId`は`e96bb03a2721a1d1`、`sourceCommit`は`48518aed9eb08f026060c8f61375fd9ff3854051`、`contentDigest`は`90705d0735ad665a16a516971e20d54c544702f9c14f812f2e26e909ce6b30d0`。

## 公開後の画面確認

ユーザー指定payloadで、次の共有ページを隔離ブラウザで開いた。

- new: `https://trickcal.irlab.dev/share/#1.z.C3EODmBkZBSS1WN2kHWVZZLlZtaWVZPVkOXlYxVlZWTlZBVjZWKVZJVlVWBVZxViFmRiZmVkYgYiFlY2dnYONk4WLi5uHl5eblZOBgYGARZWRkZWJg5WJj5eJl5WJn5WRjlWJh5WJhFeJllWJhleJiagcaxMUrxMXKxMikDFbAwMyfeZnzJn5ji4MbMxSHFpWgMA`
- legacy: `https://innocentroad.github.io/trickcal-manager/formation-share.html#1.z.C3EODmBkZBSS1WN2kHWVZZLlZtaWVZPVkOXlYxVlZWTlZBVjZWKVZJVlVWBVZxViFmRiZmVkYgYiFlY2dnYONk4WLi5uHl5eblZOBgYGARZWRkZWJg5WJj5eJl5WJn5WRjlWJh5WJhFeJllWJhleJiagcaxMUrxMXKxMikDFbAwMyfeZnzJn5ji4MbMxSHFpWgMA`

結果はnew/legacyとも次のとおり。

- 画像数379、`complete=true`かつ`naturalWidth>0`が379件、失敗0件。
- `\.webp%3Fv%3D`を含む画像URLは0件。
- 使徒、遺物、スペル、性格、Grade／星、権能の代表画像URLを確認。
- new代表例：`https://trickcal.irlab.dev/img/Chara/Kyarot.webp?v=93e2e029a39a4d4a`
- legacy代表例：`https://innocentroad.github.io/trickcal-manager/img/Chara/Kyarot.webp?v=93e2e029a39a4d4a`
- new/legacyの実ブラウザスクリーンショットを取得した。

管理画面は`https://trickcal.irlab.dev/manager/?recover=20260912&view=formation`を新規ブラウザタブで開いた。利用者の通常保存状態を使わず、recover fixtureから共有ダイアログを開いた。

- 共有プレビュー生成成功。
- PNG previewは`1200x850`、`naturalWidth=1200`、完全表示。
- 編成、遺物、スペル、権能が欠落していないことをスクリーンショットで目視確認。
- 保存／コピーの実操作は行っていないため未確認。

## 訂正した制約

`formation-share-display-data.js`を読み取り、画像参照193件のpathnameに`%xx`形式のエンコード済みパスが0件であることを確認した。runtimeの`%41`は`%2541`になるため、このケースと正規化の重複適用は今回の成功条件に含めていない。共通runtimeの再設計は後続課題であり、今回の公開には含めていない。

## 保全と範囲

- 現ターン編集前バックアップ: `D:/Games/etc/trickcal/backups/public-share-image-publish-20260918-01`。対象7ファイルをコピーし、各SHA-256一致を確認。
- 前段の修正バックアップ: `D:/Games/etc/trickcal/backups/public-share-image-url-fix-20260918-01`。
- main、上バー試作、共鳴、全列、datasheetは変更していない。
- 旧サイトは公開対象として更新したが、停止・閉鎖は行っていない。
