# 公開後レビュー指摘の追加修正・実DOM検証（2026-09-19）

## 範囲

`release-source` の既存dirtyを保持し、アサイド画像先読みテストの将来登録対応と、共通上バーのデータ／一括設定メニューがcalcの攻防フロートより前面に出ることの実DOM検証だけを行った。commit、push、公開、workflow、実装修正の追加は行っていない。

## アサイド先読みテスト

変更：`tools/test-image-preload-aside.js`

- 実データのエピカが未登録であることを期待する固定検査を削除した。
- 未登録、等級のみ、通常効果のみ、特殊効果のみ、公開制限中、制限解除後、alias使徒を隔離fixtureで検査した。
- 同一fixtureで等級のみから通常効果を追加し、次の候補生成へ反映されることを確認した。
- `TRICKCAL_PUBLIC_RELEASE` が未提供の場合も、効果登録を表示側の既定動作どおり候補へ反映する検査を追加した。
- 期待値はfixtureの登録行・公開設定から組み立て、実装内部の判定関数を期待値として再利用していない。
- 実データ、公開条件、画像ファイルは変更していない。

`node tools/test-image-preload-aside.js` と `node --check image-preload.js` は成功した。

## 前面表示の実DOM検証

変更：`tools/test-topbar-overlap-native.js`（新規焦点テスト）

前回から存在する `shared-topbar.css` の共通上バー `z-index:1200` は変更せず、隔離Chrome・一時profile・ローカルHTTPサーバーでcalc画面を確認した。

- 375px／720pxではページ末尾まで実際にスクロールし、浮遊使徒ボタンとデータポップオーバーの交差を確認した。交差点は`elementFromPoint`でデータメニューの`使徒データ`リンクとなり、同座標をCDPの通常マウス押下・解放でクリックして`/public/apostle-data.html`へ遷移した。
- 721px幅・高さ250pxでは、一括設定の`Rank`項目と既存`.fdc-apply-float-controller`が実際に交差した。交差点の`elementFromPoint`は一括設定リンクであり、同座標の物理クリックでmanagerの`global=rank`へ遷移した。
- 1280px、および通常高さの721px相当では、メニューとフロートの矩形が重ならないことも記録した。重なりがないケースを前面確認済みとは扱わず、上記の実交差ケースを別途成立させた。
- 各ケースでEscapeによるメニュー閉鎖後、`#fdc-perspective-toggle`を通常クリックして攻防状態が切り替わり、再クリックで復帰することを確認した。
- 通知ダイアログを隔離状態で開き、上バーがダイアログより不適切に前面へ出ないことを`elementFromPoint`で確認した。

`node --check tools/test-topbar-overlap-native.js`、`node tools/test-topbar-overlap-native.js`、既存の`node tools/test-topbar-navigation-native.js`は成功した。

## 保全・残件

編集前バックアップ：`D:/Games/etc/trickcal/backups/review-followup-20260919-01/release-source-before`

バックアップ対象は`tools/test-image-preload-aside.js`と`STATUS.md`で、編集前のsource／backup SHA-256一致を確認した。編集前ハッシュはそれぞれ`52608BA08EF8CC65B6E50BD283F521EBBC4DA32EC82F337C017CF0156CFB6463`、`9FDC1BEB3437569D73F1C8DDD1DC0E582371D37045FA1614D9EFC792B8D57D52`。既存dirtyは保持している。

通常高さのPC／721pxで一括設定メニューと攻防切替本体の項目交差は発生しなかったため、低い画面高の適用フロート交差で操作を検証した。今回の検証は公開sourceのローカル確認であり、公開環境の再検証は未実施である。
