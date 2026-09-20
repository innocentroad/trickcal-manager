# SEO canonical移行：ローカル実装・検証記録

更新日: 2026-09-20。正式root一本化commit `f59ffaa98f2bc04b713f636713c2bad39aa09cb` を基点に、`topic/seo-canonical-migration` で行ったローカル変更を記録する。SEO差分は未commit・未push・未公開で、レビュー待ち。

## 実装範囲

- 現在 `indexable: true` の `manager`、`calc`、`share`、`data` だけに `seo.canonicalProfile: "new"` を追加した。canonicalは同じroute IDのnew profile絶対URL、HTML内1件、query/hashなし。index aliasは対応canonical routeと同じ出力を使う。
- `updateCanonicalMetadata()`でcanonical用URLと提供中profileのpage URLを分離した。`rel=canonical`だけがnewへ向き、`og:url`、OG fallback、本文内source URL置換およびJSON-LD/通常リンクは提供中profileを維持する。既存new profileの変換は維持。
- `buildPlan()`のasset出力でmanifestの`asset.profiles`を尊重するよう局所修正した。既存生成器がこの指定を無視し、new専用のsitemap／robotsをlegacyにも出していたためであり、legacyへnew専用assetを出さない回帰検査を追加した。
- sitemapは現行4 indexable routeのnew URLだけ。alias、旧URL、noindex route、query/hash、根拠のない`lastmod`は含めない。new robotsのSitemap行もnew sitemapと一致する。noindex、profile別通常遷移、旧サイト利用可能性、保存／バックアップ導線、Service Workerのscope・更新方式は変更していない。
- 旧ページからの強制転送、旧ページ一括noindex、クロール遮断、index対象route追加、Search Console・外部リンク・配信設定変更は行っていない。

## 変更ファイル

- `tools/public-route-manifest.json`
- `tools/generate-public-site.js`
- `tools/test-public-site.js`
- `tools/test-public-site-http.js`
- `tools/test-seo-canonical-migration.js`（新規）
- `GOAL.md`、`STATUS.md`、`docs/BACKLOG.md`
- `docs/source-worktree-unification-and-seo-handoff.md`
- `docs/history/source-worktree-unification-2026-09-20.md`
- 本記録

## 検証

- `node tools/test-seo-canonical-migration.js` 成功。new／legacyのcanonical・OG URL・通常リンク保持、alias/profile URL、canonical重複拒否、未知profile・対応route欠落拒否を確認。
- `node --check`を変更した各JSへ実施し成功。`git diff --check`成功。
- `node tools/public-site-publication.js check --name seo-canonical-local-20260920-r3` 成功。結果は`ok: true`、`localOnly: true`、`publishable: false`。生成・manifest検証・public-site test・HTTP検査がすべて成功。検査JSON: `tmp/publication-seo-canonical-local-20260920-r3-checks.json`。出力: `tmp/publication-seo-canonical-local-20260920-r3-output/`。source commitは一本化commitのまま。bundle、receipt、candidate、dispatchは作成していない。
- 先行する統合checkは、legacyでnew Originを全面禁止する旧HTTP期待値、およびXML宣言を誤ってquery検出するsitemap検査期待値で失敗した。期待値をcanonicalと各sitemap `<loc>`へ限定して修正した。また実際の生成物から`asset.profiles`無視を発見し、manifest指定を尊重する修正とlegacy不出力検査を追加した。最終の同一統合入口checkは上記r3で成功しており、失敗を成功扱いにはしていない。
- 生成後ページは新規のlocalhost originで確認し、実サイトや利用者保存データには触れていない。

| profile | URL | 確認 |
| --- | --- | --- |
| new manager | <http://127.0.0.1:53967/manager/?view=settings> | 本文・共通上バー・表示範囲の画像を確認。canonicalは`https://trickcal.irlab.dev/manager/`。 |
| legacy manager | <http://127.0.0.1:53969/trickcal-manager/stat-dashboard.html?view=settings> | URLはlegacy pathのまま。canonicalだけnew manager、OG URLはlegacy。通知詳細を閉じた後に本文を確認。セーブ／ロード内の全体バックアップ・バックアップ保存等の入口が表示されることを確認したが、保存・復元・importは実行していない。 |
| new calc | <http://127.0.0.1:53967/calc/> | 本文・共通上バーを確認。 |
| legacy calc | <http://127.0.0.1:53969/trickcal-manager/formation-damage-calc.html> | legacy pathに留まること、canonicalはnew calc、OG URL・共通上バーの通常routeはlegacyのままであること、読込完了後の画像が`naturalWidth > 0`で破損なしであることを確認。 |

ブラウザ確認用に今回起動したPID 27068/port 53967とPID 26796/port 53969のサーバーは停止し、両portのlistenがないことを確認した。最初のサーバー起動試行で生じたPID 20496は同じ作業中に停止済み。無関係なNode/Pythonプロセスは終了していない。

未確認: 実本番の応答、公開後のcanonical採用、Search Consoleのproperty／sitemap状態・アクセス権、検索順位、全route・全画像の網羅確認。公開は別承認の工程。

## 編集前バックアップ

変更前の既存ファイルをrepo外へ相対パスを維持してコピーし、SHA-256一致を確認した。今回新規作成したテストと本履歴は編集前既存ファイルではないため対象外。

場所: `D:/Games/etc/trickcal/backups/seo-canonical-migration-20260920-072904/`

| 相対パス | 編集前SHA-256 |
| --- | --- |
| `tools/public-route-manifest.json` | `E968B772E401EE79F8C191C374F613128CA974730828C840521C0C1F19046354` |
| `tools/generate-public-site.js` | `BD2F864A02D9EBF9546078F6F40D8B568BDE7A8F6425CF037A27DD0651F377CE` |
| `tools/test-public-site.js` | `7C6A99E20B7DA48B4AAEDEE6A4CA41093F245F4751E2E4A031473F476571D033` |
| `tools/test-public-site-http.js` | `27A22DCFC83CC2ABC3736988391CBB167E38E2DF1832B7E3D6E869DBF1C91BA5` |
| `GOAL.md` | `BF8CB8A3C663A7238357CD7742A0E3C3BA4859EF53B8EF684E557E2F116267B8` |
| `STATUS.md` | `FF6B9C0D0B9B2AF092CDBD7E236E7EAA60B9A737860DC0B5B094D62AA374E353` |
| `docs/BACKLOG.md` | `F38AB4F52B67C11D33A6C4DB88E8BCA7728A21A61E07E22BB9DAF5A8DE3563F3` |
| `docs/history/source-worktree-unification-2026-09-20.md` | `F354C098B7665A1BEE82D0B08E7A6E974CCB6B7B952D002C9A118B22354B494C` |
| `docs/source-worktree-unification-and-seo-handoff.md` | `8C2D3D5814B3C5C83296AF780C3E88E8ACF7D0B91F85F0093C046CD33F4DC6E4` |

## 次の工程

現状はローカル実装済み・レビュー待ち。対象限定commit／push／公開は別途承認後に既存publication runbookで行う。公開後にSearch Consoleの既存property、sitemap読込、代表URL検査を別途確認する。旧Originの通常利用と保存・バックアップ導線は維持する。
