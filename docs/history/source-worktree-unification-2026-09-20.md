# 作業ソース一本化の実行記録

最終更新日: 2026-09-20。これはローカル移行と依頼範囲の画面確認証拠を記録する。本記録は移行関連の対象限定commit `f59ffaa98f2bc04b713f636713c2bad39aa09cb` に含まれている。旧worktree撤去・push・公開は含まない。

## 到達状態

- 正式root: `D:/Games/etc/trickcal/trickcal-manager`
- 使用branch: `release-source`
- 移行時HEAD: `46686377d0902e828d5d03ea821f9dd3d85542f9`
- repo直下のworktree登録は `release-source`。通常の編集場所はここ1か所とし、通常xlsx更新もここで行う。
- 旧 `tmp/release-source` は `safety/unification/unification-20260920-010559/release-source-park`、HEAD `46686377d0902e828d5d03ea821f9dd3d85542f9` で保持。読み取り用の退避元であり編集禁止。worktreeの登録解除・削除は行っていない。
- 元mainの履歴・未公開変更をrelease-sourceへmerge/copyしていない。

## 保全・退避

- migration ID: `unification-20260920-010559`
- repo外backup: `D:/Games/etc/trickcal/backups/unification-20260920-010559/`
- manifestには881個の保全copyとSHA-256を記録し、コピーと元のhash照合を完了。主な台帳は `inventory/backup-manifest.csv`、開始時状態は `inventory/pre-migration-state.json`、新旧保管対応は `inventory/migrated-path-map.json`。
- main safety ref: `safety/unification/unification-20260920-010559/main`、移行前HEAD `92b6df661c34e12b6fee2a20f95f97f15fdea037`。元の `main` refも維持。
- mainのstaged差分は0、unstaged patchはmanifest記録上2,535,598 bytes。未追跡資料・画像も個別hash付きで保全。補助stash OID `5e226347d201d540b088b168d96ebeefb488a40c`（`source-unification-unification-20260920-010559-main-dirty`）を記録し、pop/drop/applyしていない。ignored資料はstashではなくmanifest記録の外部backupに保全。
- 保存済みmain workbookとrelease-source workbookのSHA-256は `FCCB7713269B410ADC8EDBFB94693BE1CD3912A603825ABC0F4FA7676CDE4F34` で一致。新rootの `tools/trickcal_datasheet.xlsx` は編集していない。`tools/generate-all.bat`も実行していない。
- release-source切替前のGOAL/STATUS等のtracked baselineは `backups/unification-20260920-010559/worktrees/release-source/tracked-baseline/` に保管。main側の候補・資料は [`docs/BACKLOG.md`](../BACKLOG.md) から追跡できる。

## worktree切替と参照path

- 切替前に旧 `tmp/release-source` を専用park branchへ移した後、repo直下を `release-source` に切替。旧worktree登録は保持。
- publication targetのdestinationを新root基準へ修正し、変更前後で受信先の絶対pathが同一であることを確認。modeはdual、legacy activeを維持し、repo／branch／workflowは変更していない。
- publication history 16ファイルを旧sourceから新rootの `backups/publication-history/` へコピーし、hash一致を確認。latest-new identityはcandidate `1911a1521fe85b27`、source `0e9a3bf1655cb9bc02613ca66df80d9f9d39f885`、new artifact `b56826effca590cc21efae6d57e66ffd02d29aaa`、run `35446212223`。
- 過去bundle/candidate/checks/receiptは旧parked worktreeの `tmp/` に原状保持。対応copyは外部backup `ignored/release-source/tmp-direct-files/` に記録し、内部path・identityを書き換えていない。
- 新root用参照へ更新した既存ファイルは `AGENTS.md`、`README.md`、`docs/publication-runbook.md`、`docs/publication-task-authoring.md`、`tools/publication-targets.json`。handoffは旧worktreeから最新版を個別にhash照合してコピー後、現在地へ更新した。

## 公開candidate状態とlocal check

- migration開始時に確認した6 candidateはnew/legacy双方のreceiptがあり、各stateはknown・成功・confirmedAt。active lockや未解決run/candidateは確認されなかった。再dispatch・再転送は行っていない。
- latest成功配信identityは上記の2026-09-19公開記録と一致。旧/new receiver repoに対する書込みはしていない。
- `node tools/public-site-publication.js check --name source-unification-20260920-local` は `ok:true`、`localOnly:true`、`publishable:false`。出力は `tmp/publication-source-unification-20260920-local-output/`、checksは `tmp/publication-source-unification-20260920-local-checks.json`。このcheckはサイト生成とManager公開検査であり、xlsxからのデータ生成ではない。

## ローカル画面確認（2026-09-20）

既存の生成物 `tmp/publication-source-unification-20260920-local-output` と稼働中のローカルserverを使用した。追加のserver起動・停止、再生成、xlsx処理はしていない。

| profile | 画面 | 確認URL | 結果 |
| --- | --- | --- | --- |
| new | 管理 | <http://127.0.0.1:53963/manager/?view=settings> | 移行案内の詳細を閉じた後、編成・ステータス本文と共通上バーを表示。目立つ崩れなし。 |
| new | 計算 | <http://127.0.0.1:53963/calc/> | 計算UI・結果領域・共通上バーを表示。上バーから遷移し、目立つ崩れなし。 |
| new | 使徒データ | <http://127.0.0.1:53963/data/apostles/> | 78/78件。表、下部view切替、表示範囲内の使徒画像を確認。上バーからの画面遷移も確認。 |
| new | 編成共有 | <http://127.0.0.1:53963/share/#1.z.C3EODmBkZBSS1WN2kHWVZZLlZtaWVZPVkOXlYxVlZWTlZBVjZWKVZJVlVWBVZxViFmRiZmVkYgYiFlY2dnYONk4WLi5uHl5eblZOBgYGARZWRkZWJg5WJj5eJl5WJn5WRjlWJh5WJhFeJllWJhleJiagcaxMUrxMXKxMikDFbAwMyfeZnzJn5ji4MbMxSHFpWgMA> | 既存payloadを復号し、使徒・遺物・スペル・権能等の編成内容と表示範囲内の画像を確認。エラー表示や明らかな画像欠落なし。 |
| legacy | 管理 | <http://127.0.0.1:53965/trickcal-manager/stat-dashboard.html?view=settings> | 移行案内の詳細を閉じた後、管理画面と共通上バーを表示。目立つ崩れなし。 |
| legacy | 計算 | <http://127.0.0.1:53965/trickcal-manager/formation-damage-calc.html> | 計算UI・結果領域を表示し、上バー遷移を確認。目立つ崩れなし。 |
| legacy | 使徒データ | <http://127.0.0.1:53965/trickcal-manager/public/apostle-data.html> | 78/78件。表、表示範囲内の使徒画像、共通上バーを確認。 |
| legacy | 編成共有 | <http://127.0.0.1:53965/trickcal-manager/formation-share.html#1.z.C3EODmBkZBSS1WN2kHWVZZLlZtaWVZPVkOXlYxVlZWTlZBVjZWKVZJVlVWBVZxViFmRiZmVkYgYiFlY2dnYONk4WLi5uHl5eblZOBgYGARZWRkZWJg5WJj5eJl5WJn5WRjlWJh5WJhFeJllWJhleJiagcaxMUrxMXKxMikDFbAwMyfeZnzJn5ji4MbMxSHFpWgMA> | 既存payloadを復号し、使徒・遺物・スペル・権能等の内容と表示範囲内の画像を確認。エラー表示や明らかな画像欠落なし。 |

共通上バーの確認：new／legacy双方でデータメニューを開き、使徒データへ移動。calc等の代表遷移も確認した。一括設定メニューは双方で開き、「研究」を選ぶと正しいmanager URL（new: `/manager/?global=research`、legacy: `/trickcal-manager/stat-dashboard.html?global=research`）へ遷移し、研究項目はOFFのまま表示された。お知らせベルから一覧を開閉でき、閉じた後はベルへフォーカスが戻った。使徒データ画面でライト／ダークを切り替え、両profileとも最終表示をダークへ戻した。

移行案内の詳細ダイアログは、利用者が確認専用環境で許可した閉じる操作のみ行った。「今後表示しない」等の明示設定は選択せず、告知バーは表示状態を維持。共有payloadの保存・取り込み、画像生成・保存・コピー、管理の編成／育成変更、インポート、リセットは行っていない。初回のnew管理画面では詳細ダイアログが前面に出たため、そのまま未確認とはせず、許可された閉じる操作後に本文を目視した。

確認はブラウザー上の代表viewportでの目視とアクセシビリティ表示による。表示範囲の画像は描画されていたが、全画像の通信件数・`naturalWidth`を機械的に総点検していない。全viewport・全機能の網羅、PNG生成・保存・コピー、計算精度、公開サイトの再検証も行っていない。画面上は今回範囲で明らかな異常を認めなかった。

ローカルserverは既存のPID 14916（new/53963）、PID 24712（legacy/53965）を利用し、この確認で起動・停止していない。確認中にブラウザー操作の状態取得が一度遅延したが、画面を再確認して完了し、同じ失敗を連続反復していない。共有URLの初回入力誤りは直後に正しい履歴payload URLで開き直しており、最終確認は正しいpayloadで行った。

## 完了状態と別途保留

- **正式rootへの一本化と必要なローカル確認は完了し、移行記録commit `f59ffaa98f2bc04b713f636713c2bad39aa09cb` を作成済み。** push・公開は別途扱う。GOAL／STATUSもこの状態へ更新した。
- 旧worktreeのpark保管、mainの安全ref・stash・repo外backupは従前どおり保持。これらの保管継続は画面確認の未完了を意味しない。
- 旧worktree撤去、stash削除、main-only変更の取り込み、SEOのcommit／公開、Search Console、xlsx編集／再生成、workflow／DNS／保護設定変更は未実施。SEOのローカル実装は `topic/seo-canonical-migration` で完了し、レビュー待ち（詳細は[SEOローカル実装履歴](seo-canonical-migration-local-2026-09-20.md)）。
- 通常のxlsx更新は正式rootで保存後、他の生成と競合しない状態で `tools\generate-all.bat` を実行する。今回、生成を再実行していない。
