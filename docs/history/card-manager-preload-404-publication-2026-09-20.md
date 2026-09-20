# 管理画面カード画像先読み404修正の対象限定公開（2026-09-20）

## 対象とsource

- 対象は `stat-prototype.js` の `warmCardManagerImages()` における画像URL解決、`tools/test-public-site.js` の焦点回帰、GOAL／STATUSと本履歴のみ。既存の統合check `card-manager-preload-20260920-02` は成功済みの証拠を再利用し、clean sourceから通常の `prepare` を実行した。
- source commit `22a78aab7cd0690c30407c59eb5a1314b1e09903`（`fix: resolve card manager preload asset URLs`）を `release-source` に対象限定commit・pushした。xlsxや生成データはstage対象外。
- 変更前ファイルとxlsxのSHA-256台帳は `D:/Games/etc/trickcal/backups/card-preload-publication-20260920-140351`。ジョアン仮データ入り `tools/trickcal_datasheet.xlsx` の退避前SHA-256は `70C1B960D2D8A1AEE75200056DE739CFE13E7935EE741D3EF6078E5883CCF78C`。

## Candidate・receipt・公開

- candidate `84f8cbb3aa3e3cdd`、source commit上のcontent digest `227c1438519c8b63bc87a0d3f655014bc1bd9e27de60834777456e0a1f69ea1a`、bundle `tmp/publication-card-manager-preload-20260920-03.json`。
- new receipt v2 `tmp/delivery-84f8cbb3aa3e3cdd-new-f8e9364888cb.json`。artifact commit `df5c0697b27da2a825be9c7b418f4b3d8eeac267`、output digest `17417f68042902f0`、通常deployment承認後に成功した [run 35491038493](https://github.com/innocentroad/trickcal-manager-site/actions/runs/35491038493)。
- legacy receipt v2 `tmp/delivery-84f8cbb3aa3e3cdd-legacy-d10d9eaf205f.json`。同じcandidateのartifact commit `a4e336e91fd15be3ffd711945a8e71a8f3cd1a2a`、output digest `f40d612e716124fe`、new成功後に通常deployment承認を経て成功した [run 35491218676](https://github.com/innocentroad/trickcal-manager/actions/runs/35491218676)。
- 両profileの公開identityでcandidate、source commit、profile、content digest、release ID `f2dec5453f1c187e` が一致。配信記録は `backups/publication-history/84f8cbb3aa3e3cdd-new.json` と `backups/publication-history/84f8cbb3aa3e3cdd-legacy.json`。
- prepare結果、両recipientの転送dry-run・staged一覧・v2 receipt照合から、ジョアン仮データのxlsxおよび生成データが公開candidateへ含まれていないことを確認した。

## 公開確認

- new: manager `https://trickcal.irlab.dev/manager/?card=spell`、deployment identity `https://trickcal.irlab.dev/public-site-deployment.json`。
- legacy: manager `https://innocentroad.github.io/trickcal-manager/stat-dashboard.html?card=spell`、deployment identity `https://innocentroad.github.io/trickcal-manager/public-site-deployment.json`。
- 確認専用ブラウザーで両profileの遺物・スペル画面とカテゴリ切替を表示し、カード画像が描画されることを確認。両profileのmanagerページと代表カード画像・レア度枠は、profile固有の正しい `/img/Card/...` URLでHTTP 200・リダイレクトなし。公開ページのidentityもcandidateと一致した。
- 公開前の隔離ローカルNetwork検査では各profile 95件のカード要求を確認し、カード404および誤った `/manager/img/` または `/trickcal-manager/manager/img/` 要求は0件。今回の公開後はDevToolsの詳細Networkログを取得していないため、公開画面の実描画とHTTP probeをNetwork全要求の証明とは扱わない。既知のfavicon 404はカード画像修正の対象外。

## ジョアン仮データxlsxの保全・復元

- xlsxのみをstashし、OID `ce8c8dc98464345ad401e16ce33af075d6ca1d5f` を記録した。stash内容は `tools/trickcal_datasheet.xlsx` だけで、stash blobと退避前blobは一致。stashはapply後も保全用に残す。
- repo外backupは `D:/Games/etc/trickcal/backups/card-preload-publication-20260920-140351`。`before/` に作業前のxlsx・GOAL・STATUS、`before-publication-result-record/` に公開結果記録前のGOAL・STATUSを保管し、SHA-256一致を記録した。
- 公開結果記録commit `099fe6e750cbe6e35de3229ed824e8e46cab2089` のpush後、repo内xlsxに変更がなくcleanであることを再確認し、stash OID `ce8c8dc98464345ad401e16ce33af075d6ca1d5f`を `git stash apply` で適用した（popではない）。復元後のrepo内xlsxと外部backupはともにSHA-256 `70C1B960D2D8A1AEE75200056DE739CFE13E7935EE741D3EF6078E5883CCF78C`。現在の未commit変更はxlsxのみ。stashとbackupは保持する。

## Search Consoleと残件

- Search Consoleの操作はしていない。利用者報告の状態は、所有権確認済み、manager／calcの登録リクエスト送信済み、サイトマップ取得エラーは時間を置いて再確認待ち。
- 公開結果記録commitは `099fe6e750cbe6e35de3229ed824e8e46cab2089`。xlsx復元確認をGOAL／STATUS・本履歴へ追記する対象限定記録commitを別途pushするが、公開は再実行しない。xlsx編集・再生成、他機能、mainへのpushは行っていない。
