# お知らせ更新履歴 ローカル試作（2026-09-19）

## 結果

release-sourceに、既存のお知らせcontrollerを使う表示専用の更新履歴を実装した。commit・push・公開はしていない。本番のお知らせ記事、移行条件、公開設定、利用者の保存状態は変更していない。

- `announcement-history-data.js`にseed原稿の39件を収録（ゲームデータ17・サイト機能19・不具合修正3）。初回公開日を追加していない。検査でseed JSONと項目・入力順の一致を確認した。
- 重要な移行案内は専用IDで先頭へ固定し、履歴を既読数へ加算しない。履歴本文はtext nodeで描画し、既存の移行記事描画・dismiss処理へ流していない。
- 初期表示はゲームデータ1件、サイト更新3件。詳細は独立して開閉し、追加は5件単位。移行記事と履歴一覧を往復した際に表示件数を維持し、ベルから閉じ直して開くと初期件数へ戻す。
- 実ブラウザで移行記事から戻った際、追加済み6件を残したままボタン文言だけが「過去の更新を見る」へ戻る不整合を確認。表示件数が初期数を超えているときは「もっと見る」を再表示するよう直し、回帰テストを追加した。
- 欠落／不正データは履歴領域だけに利用不可を表示し、移行案内とdialogを利用可能に保つ。正常な0件は空表示と区別する。
- `docs/announcement-history-prototype-design.md`へ、実装状態と1件追記時の形の例を記録。seed原稿は凍結し、以降はJSのentriesだけを更新する。追加時はseed一致テストを初期39件と追加分に分けて更新する。

## 対象ファイル

- 新規: `announcement-history-data.js`
- UI: `announcements.js`、`announcements.css`
- 接続: `stat-dashboard.html`、`formation-damage-calc.html`、`formation-share.html`、`enemy-status.html`、`public/apostle-data.html`、`public/board-layout-preview.html`、`tools/fixtures/topbar-browser-fixture.html`
- 生成: `tools/public-route-manifest.json`、`tools/generate-public-site.js`
- 検査: `tools/test-announcements.js`、`tools/test-public-site.js`
- 既存同期ツールが必要と判定した派生版: `stat-dashboard.html`、`formation-share-create.js`。`node tools/sync-formation-share-assets.js --write`で同期し、pageVersion `d2d053fd00a9a1f7` を得た。手編集していない。
- 状況記録: `GOAL.md`、`STATUS.md`、本書、設計書。`docs/announcement-history-seed.md`は入力原稿として読み取りのみ。

## 検証

- 成功: `node tools/test-announcements.js`（seed39件・分類数・順序・不正値拒否・0/1/多数・追加単位・既読状態分離・欠落/不正データ・移行記事往復・focus候補）。最後の修正後にも再実行して成功。
- 成功: `node tools/test-public-site.js`、`node tools/sync-formation-share-assets.js --check`。
- 成功: `node --check announcements.js`、`node --check announcement-history-data.js`、`node --check tools/generate-public-site.js`、`git diff --check`。
- 成功: `node tools/generate-public-site.js --write --out tmp/announcement-history-preview-20260919-01`。new/legacy両profileを含む2178ファイルを生成、digest `3ed46d0681bc2ec6908e48b747c8b180f4145a9ada40ce0ce890959da17e3523`。生成data入口には各profileの履歴データ資材をcontrollerより先に接続。
- 実ブラウザ: 隔離した `http://127.0.0.1:8799` の生成previewでnew `/data/` とlegacy `/trickcal-manager/data/` を開いた。両方で履歴・重要案内を読込。1018×904相当の表示でライト／ダーク、履歴追加と詳細展開、移行記事へ進んで一覧へ戻る操作を確認。追加後6件と「もっと見る」が保持される。Tab／Shift+Tabで履歴summaryへ移動でき、Escapeで閉じて元のベルへfocusが戻ることを確認した。通知状態とテーマ切替は専用local originだけで行い、テスト後はライトへ戻した。

未確認: 1280×800、390×844、844×390の指定viewportを実ブラウザで個別設定した表示、正確なスマホ横はみ出し／低高寸法、実公開先。UIブラウザは1018×904相当で、上記指定寸法での視覚確認とは扱わない。自動focus trap／追加5件の完全走査は焦点テストで確認したが、全39件のスマホ実画面目視はしていない。更新履歴への未読通知は別途判断事項であり、本試作では実装していない。`docs/BACKLOG.md`はrelease-sourceに存在しないため新設していない。

## バックアップ

編集前バックアップ: `D:/Games/etc/trickcal/backups/announcement-history-prototype-20260919-01/release-source-before`。既存17ファイルを相対構造付きで退避し、コピー前後にSHA-256一致を確認した。設計書は実装完了状態・追加例の記載を加える直前に同じbackup rootの`docs/announcement-history-prototype-design.md`へ追加退避し、SHA-256 `3B6B7A87DD23AB5A2968BF87CC4C86379F76B8687DF91FEE8B69E774C8B1BF99` が一致することを再確認した。

既存17ファイルの退避コピーSHA-256:

| ファイル（backup rootからの相対path） | SHA-256 |
|---|---|
| `announcements.js` | `B6B57381FB9ECD339AE730186AD0925CD4059A19A69DB2DC979D776AAFCC9D41` |
| `announcements.css` | `1A7EC52DA567623BE467E5CA024012653225C99D7E449921BEDADDC64D58EACD` |
| `tools/test-announcements.js` | `23BFE6620B7E3EAE7818659AA2F217E216DAFB9D9363942C2482BD2261733DB5` |
| `tools/public-route-manifest.json` | `C6739B6E65125B90B179E1BB8A25CCFC5EF71A04D96698120EB3A67382301409` |
| `tools/generate-public-site.js` | `4B6BFE56CA922AB51121923D0CA49BAA45D6EC32016CB04B6513AD479A2AE228` |
| `stat-dashboard.html` | `666119338DCE73432061C0F856524D23941DF9395A02B4AAF39DCE93A03F00F8` |
| `formation-damage-calc.html` | `9F8C5B866E129876FC4011B9463C9383A523D6DCF272F877C9093740F9CAAB51` |
| `formation-share.html` | `A9A4AE99BCA708975E45403DE4AFD0362AEB3AC7715AE506809E3F860D314B7F` |
| `enemy-status.html` | `1D3057698EB051B76D9072456DE1EEF782E3A23F15404D34C170CDB99386F46A` |
| `public/apostle-data.html` | `D5FD834F5C88A3000257DBCF56F986454840CE4E2BAA90EBC3D2CE22A62B7C53` |
| `public/board-layout-preview.html` | `C578CDF2F25A82CD39B5CD73BA430630C60F97FDC467F96DA9CCEFB5FC7C5CBD` |
| `GOAL.md` | `13B84B2F1777E1DBAF82A1383DFD4C8A0B02C93CEC691F2FD762869163FD2594` |
| `STATUS.md` | `4790440B6D98505760C2B80CB3C2D591BEE7E2A12DCD1CAB86B28044CE5FAD55` |
| `tools/fixtures/topbar-browser-fixture.html` | `5BCDC5136D2B5D558C51D5D5BAEB059CDE5D9BCB9DA19FC074E703690B8D1FD3` |
| `formation-share-create.js` | `05A326612CF5F7460CA1B912966EEFADE410A80DE26388CAB58E5DC812729906` |
| `tools/test-public-site.js` | `6CC05575C92311E30E1F82586D055E63FCACB89C99F99F41A6EB081E1204B26A` |
| `docs/announcement-history-prototype-design.md` | `3B6B7A87DD23AB5A2968BF87CC4C86379F76B8687DF91FEE8B69E774C8B1BF99` |

GOAL/STATUS変更前コピーも上記backup rootに含む。作業前からのrecover query整理および他のdirtyは復元・取り消しせず、そのまま保持した。
