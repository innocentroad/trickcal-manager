# SEO canonical移行：対象限定統合・dual公開記録

更新日: 2026-09-20。ローカル実装・焦点検査は[SEOローカル実装履歴](seo-canonical-migration-local-2026-09-20.md)を参照。本記録はその後のcommit、release-source統合、new／legacy公開、公開後確認を記録する。

## sourceと公開candidate

- 開始時のsourceは `topic/seo-canonical-migration`。レビュー済み対象を明示stageしてsource commit `4a251c56d2da54c8d14db7ac930144ca34d98b19`（`feat: migrate canonical URLs to new profile`）を作成し、cleanな状態で `release-source` へfast-forward統合した。mainや別案件は含めていない。
- source commit `4a251c56d2da54c8d14db7ac930144ca34d98b19` は `origin/release-source` へpush済み。一本化commit `f59ffaa98f2bc04b713f636713c2bad39aa09cb` を履歴に含む。
- `release-source` のcleanな統合後sourceから既存の公開入口でprepareを一度実行。candidate `be9009c3d14f909a`、bundle `tmp/publication-20260920000640402.json`、source contentDigest `6f42490c0e65e3d38242651cf4f181f33364d37e2fa1f3340382b1922e08e70c`。
- SEO対象実装・検査・作業文書に限定。通常の公開統合検査、candidate／staging／receipt照合をrunbookどおり実施し、生成物・hash・receiptを手編集していない。

## 配信先別結果

同一candidate/source/contentDigestを使い、dual設定の順にnew成功を確認してからlegacyを公開した。両runとも通常のReview deployments承認を経て成功。公開履歴JSONとrelease identityを照合済み。

| profile | artifact commit | outputDigest | receipt v2 | run / 結果 |
| --- | --- | --- | --- | --- |
| new | `e0da6dfba84ec9206daa0c359a909f5ac62330cd` | `f99b4fc40ee719bc` | `tmp/delivery-be9009c3d14f909a-new-f8e9364888cb.json` | [35478118808](https://github.com/innocentroad/trickcal-manager-site/actions/runs/35478118808) — deploy成功、identity一致 |
| legacy | `7732004a19f79df041e2a7ea08011a2235322e9f` | `009647bbaf26cce2` | `tmp/delivery-be9009c3d14f909a-legacy-d10d9eaf205f.json` | [35478300622](https://github.com/innocentroad/trickcal-manager/actions/runs/35478300622) — deploy成功、identity一致 |

両方のcandidate IDは `be9009c3d14f909a`、sourceCommitは `4a251c56d2da54c8d14db7ac930144ca34d98b19`、contentDigestは `6f42490c0e65e3d38242651cf4f181f33364d37e2fa1f3340382b1922e08e70c`。配信先別成功記録は `backups/publication-history/be9009c3d14f909a-new.json` と `backups/publication-history/be9009c3d14f909a-legacy.json`、newのlatest成功参照も更新済み。

legacy転送dry-runは15 write／2 delete／conflict 0。削除対象は所有台帳管理下の `robots.txt` と `sitemap.xml` のみで、legacy profileのmanifest指定どおり新専用SEO資材を旧Pages rootから除外した。ホスト直下や他プロジェクトには触れていない。

## 公開後のページ確認

公開ページを新旧各profileで読み取り確認した。manager、calc、share、dataの各HTMLにcanonicalが1件だけあり、対応するnew URLを指し、query/hashを含まない。

| profile | manager | calc | share | data |
| --- | --- | --- | --- | --- |
| new | `https://trickcal.irlab.dev/manager/` | `https://trickcal.irlab.dev/calc/` | `https://trickcal.irlab.dev/share/` | `https://trickcal.irlab.dev/data/` |
| legacy | `https://innocentroad.github.io/trickcal-manager/stat-dashboard.html` | `https://innocentroad.github.io/trickcal-manager/formation-damage-calc.html` | `https://innocentroad.github.io/trickcal-manager/formation-share.html` | `https://innocentroad.github.io/trickcal-manager/data/` |

- new／legacyの8ページでcanonical targetはそれぞれ対応する上段のnew route URL。OG URLは各profileのページURLを保持。
- legacy managerは `?view=settings` を含め旧URLに留まり、旧profile内のmanager遷移もlegacy URL。強制転送なしを確認した。
- legacy managerのセーブ／ロードを開き、全体バックアップ、バックアップ保存、ファイル確認、読み取り可能データの救出の入口が表示されることを確認。これらの実行、利用者データの保存・復元・importは行っていない。
- shareをpayloadなしで開いたとき既存の案内状態を確認。共有payloadの取込み・保存は行っていない。

## 未確認・保留

- 公開Origin上の `robots.txt` と `sitemap.xml` は直接取得できず、ライブ内容の目視確認は未完了。ブラウザーは両text/XML endpointを `ERR_BLOCKED_BY_CLIENT` とし、シェル取得はTLS credential acquisition errorとなった。安全制約を回避する別経路は試していない。
- 一方、統合後sourceの公開生成・焦点／HTTP検査とcandidateのprofile outputDigest／receipt照合は成功済み。生成仕様はnew sitemapを現行indexable 4 URLだけ、new robotsのSitemapをそのnew sitemapとし、legacy生成から両ファイルを除外する。これは生成・artifact証拠であり、公開URLからの直接応答確認とは区別する。
- Search Consoleのproperty、sitemap受付、URL検査、検索エンジン採用canonical、外部被リンクは未確認。Search Console操作、旧サイト停止・noindex一括指定・強制転送、DNS／workflow／保護設定の変更は行っていない。
- main-only機能、xlsx・再生成、旧worktree／stash／backup削除は対象外で未実施。

## 記録更新

本公開結果を反映する記録更新は、公開済みsource commitの後続にある別の記録用source commitへ含める。記録だけの変更ではcandidateを再生成・再公開しない。
