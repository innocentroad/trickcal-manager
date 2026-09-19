# お知らせ更新履歴レビュー指摘の追加修正

2026-09-19、`tmp/release-source` のローカル試作。commit・push・公開は行っていない。先行dirtyとrecover query整理は保持。全体ボードの配色には触れていない。

## 修正

- `announcements.js` は `TRICKCAL_STORAGE_BOOT` と既存storage facadeの両方が正常な場合だけ初期化する。保存不能時はベルを無効化し、閲覧ページには説明を出す。`windowObject`経由でstorageを参照し、通知状態は既存registry key `trickcal_notice_state_v1`だけを使用。
- 書込み前に保存値を再読込し、read・auto acknowledgement・dismiss・restoreの対象IDのみ更新する。不正保存値を空状態で上書きしない。`storage` eventとstorage runtimeの正常復帰通知で状態・未読点・バー・表示設定を同期する。復帰時に自動案内を再実行しない。
- 通知を利用する既存share・apostle-data・生成data indexと隔離topbar fixtureへ既存`storage-registry.js`→`storage-runtime.js`→`storage-bootstrap.js`を追加。data/share/apostleの任意起動はboot失敗でも本文を保持し、通知操作を使えないことを明示する。strict起動ページの失敗画面は変更しない。
- `tools/generate-public-site.js`のprofile-aware生成接続により、new/legacy data入口でstorage bootと`announcement-history-data.js`をcontrollerより前にロード。生成後HTMLは編集せず、generatorから再生成した。
- `tools/test-announcements.js`はseed39件の固定検査をfixture内に限定。運用dataではschema／ID一意性を検査し、未来日追加・通常の文面修正が通ること、不正date・重複ID等が拒否されることを確認。hidden／disabled／inert／閉じたdetails内を除外する共通focus候補、moreを使い切った際の最初の追加summaryへの移動もテスト。
- 一覧を閉じるheader、重要な移行枠、ゲーム／サイト履歴を含む1つのscroll領域に分離。通常高では重要枠を固定し、600px以下の低高では重要枠も含む本文全体をscroll可能にする。初期追加後の状態を記事から一覧へ戻った際に保持し、閉じて開き直すと初期件数へ戻す。
- `tools/test-public-site.js`へnew/legacyのshare・apostle・生成data indexのprofile-awareなstorage/data script順序確認を追加。既存の`tools/sync-formation-share-assets.js --write`で派生同期したのは`stat-dashboard.html`と`formation-share-create.js`の2ファイル（pageVersion `d2d053fd00a9a1f7`）。同期前に両方をバックアップ済み。

履歴seedは初期39件の出典として維持し、以後の公開済み追加・訂正先は`announcement-history-data.js`のみ。履歴追加をベルの未読件数へ反映する仕様は未決定のまま。通知既読・自動確認・非表示は従来どおり別状態。

## 検証

成功した焦点検査:

- `node tools/test-announcements.js`
- `node tools/test-announcement-storage-bootstrap.js`
- `node tools/test-public-site.js`
- `node tools/sync-formation-share-assets.js --check`
- `node --check announcements.js`, `node --check storage-bootstrap.js`, `node --check tools/generate-public-site.js`, `node --check tools/test-announcements.js`
- `git diff --check`

`tools/generate-public-site.js --write --out tmp/announcement-history-review-site-20260919`で最終ローカル生成。2,178ファイル、output digest `aac636e40e4d24bee9278291be080ff0703e98fa831545ea6219931ed1fbc328`。new/legacyページを別port (`127.0.0.1:8892` / `:8893`) で確認し、履歴data読込、profile別移行文面、managerからの既読操作後に同一originのdata別タブで未読点が消えることを確認。履歴一覧を開くだけでは未読を変えない。

ブラウザ表示は幅・高を指定したiframe viewportで確認。390×844と844×390は等倍、1280×800は実ページのCSS viewportを保ったまま画面キャプチャ可能幅へ縮尺表示した。各viewportでライト／ダークを確認。1280×800ではゲームデータ・サイト更新の追加表示を全件まで進め、長文記事展開、重要枠が履歴スクロールと独立して表示されることを確認。390×844では開閉と初期一覧、844×390では低高fallbackで重要枠を含む本文をスクロールして一覧末尾と追加操作へ到達し、閉じるheaderが残ることを確認。記事から一覧へ戻った後も8件のsite履歴が残り、追加ボタンが維持された。Tabで閉じる→重要案内→記事summaryを進み、Enterで記事を展開、Escapeで閉じて元ベルへフォーカス復帰することを確認。

Shift+Tabを隔離ブラウザで試したが、iframe内のフォーカス先をアクセシビリティ出力から確定できなかったため、実画面での逆方向focus循環は未確認として残す。unit focus testは成功。

このローカル生成確認は公開サイトや本番の保存状態を変更しない。`tmp/public-site`に残っていた古い生成物は確認に使用せず、今回のfresh outputを使った。

## 未確認・境界

- 実公開先のnew／legacyは未確認。本番お知らせ記事・保存状態は変更していない。
- 実ブラウザでstorage拒否／不正値によるboot failureとBFCache復帰そのものは未実施。boot failure分岐とlifecycle通知は隔離fixtureで検査。
- 全39件を390×844および844×390の各表示で一件ずつ展開して目視してはいない。低高でスクロール操作と追加導線は確認し、全件追加と長文展開は1280×800で確認。
- 1280px表示はCSS viewportを持つiframeであり、物理ウィンドウを1280pxへ拡げたスクリーンショットではない。
- commit、push、公開、workflow、全体ボード配色変更は行っていない。先行recover query修正を含む他のdirtyは保持。

## バックアップ

編集前バックアップ（別フォルダ）:
`D:/Games/etc/trickcal/backups/announcement-history-review-fixes-20260919-01/release-source-before`

以下14既存ファイルを相対パスのまま退避し、編集前sourceとのSHA-256一致を確認した。`tools/test-announcement-storage-bootstrap.js`と本履歴文書は新規作成のため既存コピーなし。

| 相対パス | SHA-256 |
|---|---|
| `announcements.css` | `111C919BD4ED97CC00A22027721F0C21188E5FC8C4AF878A6982346F94771B3D` |
| `announcements.js` | `D6F1A2BCE824D6AF8B85299C588F49E3BD6625CBA0619342E105DD3FDDC15D7B` |
| `docs/announcement-history-prototype-design.md` | `7447EDA7821AF7ED60C63E426D82125A23FC2505A4B8ADB438EE487FE3ABF10F` |
| `formation-share-create.js` | `654499CBA013A9FB3CE1AC0E1674F0B0A1DB25D07231D12424C7DDBA6C179F28` |
| `formation-share.html` | `D2D053FD00A9A1F7F0A23EB082D96B64A69AB67E5AA4AC6E37BE5271E7D50358` |
| `GOAL.md` | `85DF244664D2A28A8F5A8DF5F6A4ABB374176D32DCA4019F244F68B058A85A65` |
| `public/apostle-data.html` | `5760723802E0845CB82B30C08CE5A348EE094D2C0FC1E152BC2F2314B891DE66` |
| `stat-dashboard.html` | `E19DEF0607D9ED9DB3063AB62FAAF137C06805391AE467E445D9967C739FD912` |
| `STATUS.md` | `D46B49257E65D9D86C73435B95F99B316B8DC48E99332939A9DCF7E0FFFDAE2F` |
| `storage-bootstrap.js` | `93F74A0810783990B3C3B4A0335B268C71DE586999BF6136906F2A084B88863D` |
| `tools/fixtures/topbar-browser-fixture.html` | `5BAC32E1F6F9088190BD3CFA4C38A63A94B2B7699765B23F6F7673F5FD7AEA6E` |
| `tools/generate-public-site.js` | `F866692998CA08137714C2C07237D8E5B7D18300060189DB5C8E3823611B3E3A` |
| `tools/test-announcements.js` | `3A1F9BCA927702FCB33D53764295327F7E0DB6403421FD5D59B20BEF2FE3B7D1` |
| `tools/test-public-site.js` | `E7B99A6BAA5933C069C968DC97AAF1850767AE12DF99F0C0105DD4CBA6252525` |
