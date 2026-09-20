# 未公開・保留案件の所在台帳

更新日: 2026-09-20。これは移行時に採否未決の案件・資料を追跡する台帳であり、実装開始・branch作成・公開の承認ではない。

## 正式な作業場所と保全先

- 正式な編集場所はrepo直下 `D:/Games/etc/trickcal/trickcal-manager` の `release-source`。通常のxlsx更新もここで行い、保存済みxlsxに対して `tools\generate-all.bat` を一度実行する。通常更新を使徒単位のbranchへ分けない。
- `tmp/release-source` は `safety/unification/unification-20260920-010559/release-source-park` 上の編集禁止の退避worktree。恒常的な第二の編集元ではない。
- mainの既存commitは `safety/unification/unification-20260920-010559/main`（移行時HEAD `92b6df661c34e12b6fee2a20f95f97f15fdea037`）で保全。mainのdirtyは記録付きstash OID `5e226347d201d540b088b168d96ebeefb488a40c` とrepo外backupに保持し、今回のrelease-sourceへ適用していない。
- repo外backup: `D:/Games/etc/trickcal/backups/unification-20260920-010559/`。全保全ファイルの相対pathとSHA-256は `inventory/backup-manifest.csv`、移行path対応は `inventory/migrated-path-map.json`、開始時worktree状態は `inventory/pre-migration-state.json`。復元・参照時はmanifest記載のbase refとhashを照合し、無条件上書きしない。
- main側の元BACKLOG snapshot: `D:/Games/etc/trickcal/backups/unification-20260920-010559/worktrees/main/tracked-working/docs/BACKLOG.md`（SHA-256 `7E639CE1EC293EF8965D39B348FBFAF3193460BA97688AC4A0D56886D6077FC1`）。全項目の最新版とは限らないため、再開時は公開sourceのSTATUS/historyと突合する。

## main側に残した案件

| ID | 案件 | 公開sourceでの現在の扱い | 保全場所・再開条件 |
| --- | --- | --- | --- |
| B01 | 共鳴性格R1〜R4 | main側の`formation-personality.js`とmanager/calc/DPS/share接続を未統合。実データ未確認を隔離fixtureの成功で代用しない。 | main安全refとstash／外部backup。利用者が選択した場合だけ専用topic branchで差分・実データ・計算経路を再確認する。 |
| B02 | 全列使徒 | main側の実装・完了記録を未統合。実データ、manager→calc→DPS、保存／共有の残条件を維持する。 | main安全refのtracked files、stash内patch、外部backupのuntracked・ignored台帳。公開sourceへ一括コピーしない。 |
| B03 | SEO canonical・Search Console所有権確認 | SEO canonicalはnew／legacy双方で公開済み。確認ファイル `google4e94c2b3cb5b1c67.html` はnew専用assetとして公開し、HTTP 200・redirectなし・入力とのバイト一致を確認。legacyには含めず404、sitemapにも不掲載。 | [所有権確認ファイル公開履歴](history/search-console-ownership-asset-publication-2026-09-20.md)、[SEO公開履歴](history/seo-canonical-migration-publication-2026-09-20.md)、[ローカル実装履歴](history/seo-canonical-migration-local-2026-09-20.md)。利用者がSearch Consoleの「確認」を押すまで所有権確認は未完了。確認後もファイルとmanifest登録を保持する。property／sitemap受付、検索エンジン採用canonical、外部被リンクは未確認。公開後robots.txt／sitemap.xmlの直接取得は以前の環境制約による未確認。旧サイト閉鎖・data詳細のindex拡大は別判断。 |
| B14 | manager背景画像404 | 調査・補修候補。公開sourceでの再現・原因は今回未確認。 | main安全ref／元BACKLOG snapshotの記録を保全。現行公開sourceで再現し、原因と対象を特定した後に個別判断する。 |
| B15のmain側差分 | 使徒データ | 使徒データの公開版は現在のrelease-sourceに存在する。main側の別実装・fixtureの差だけを理由に未公開機能とは扱わない。 | main untracked `public/apostle-data.html`／`.css`／`.js`、`tools/test-apostle-data-native.js`、関連design/historyはstashと外部backup `worktrees/main/untracked/`。具体的な公開版との機能差が必要になった場合のみ選択的に比較する。 |

### 採否未決の資料・別worktree

- `tools/trickcal_skillmotion.xlsx`: main側のtracked working copyは `worktrees/main/tracked-working/tools/trickcal_skillmotion.xlsx`（SHA-256 `563341A91C5481F41D4750E81F9C7F999C3227EC44E1A7533D93F89D3B378032`）。関連するignored出力は `ignored/main/outputs/skillmotion-review-20260811/`。通常使徒datasheetとは別資料で、今回編集・生成していない。
- `img/equipicons/Design/`: 56件の未追跡WebPを `worktrees/main/untracked/img/equipicons/Design/` に相対構造・hash付きで保全。採用・公開対象へ含める判断は未実施。
- `.github/workflows/pages.yml` と `tools/git/push.bat`: main側のunstaged差分に保全。workflow、push手順、保護設定は今回変更・移植していない。
- main側の未追跡設計書・履歴・使徒データ試作・焦点test・fixtureはstash補助および `worktrees/main/untracked/` に保全。公開sourceに同機能がある場合も、main版の差分を無確認で上書きしない。
- `release-source-published`: `tmp/release-source-published`、branch同名、移行時HEAD `15944e4f56cf76dea9613e5458525c3fe7bbe682` の別worktreeを維持。使徒データ／statData差分は次の通常データ更新へ自動採用しない。xlsxの採用・再生成は通常データ更新の手順と利用者の保存内容確認に従う。
- detached worktree `tmp/snorky-publish-source-p1`（`b01dc27be8166d75d33b523341e17e4f50778c9d`）と `tmp/snorky-publish-source-p1-lf`（`bea5b20d6469c1fdf259d4adb2dc062673de906d`）は用途未確定の保全対象。通常編集rootにせず、今回解除・統合していない。
- 旧release-sourceの過去bundle/candidate/checks/receiptはparked worktreeの `tmp/` に原状保持し、外部backup `ignored/release-source/tmp-direct-files/` に対応を記録。公開history 16件は新root `backups/publication-history/` へhash照合して引き継いだ。bundle/receipt本文・過去pathは書き換えていない。

詳細なmain-only分類、SEO差分、移行・切り戻し設計は[一本化・SEO引継ぎ](source-worktree-unification-and-seo-handoff.md)、実行証拠は[移行履歴](history/source-worktree-unification-2026-09-20.md)を参照する。ここに列挙した案件・資料は未統合の所在記録であり、現在のbranchへ取り込んだ扱いにはしない。

## 再開ルール

1. 利用者が選んだ案件だけGOALへ設定し、公開sourceのHEAD・差分・最新historyを基準に再評価する。
2. 通常のxlsx更新は正式rootで保存確認後、単一の一括生成として実施する。未保存編集・別生成中は並行実行しない。大きな機能だけ必要な期間、一時topic branch/worktreeへ分離する。
3. ignored資料、画像、公開証拠はbackup manifestとhashを確認してから扱う。秘密情報や巨大生成物を無条件にGitへ追加しない。
4. SEO canonicalはローカル実装済みで、レビュー・対象限定commit/push/公開は別工程。Search Consoleも別途確認する。旧worktree撤去・stash削除は独立判断とする。
