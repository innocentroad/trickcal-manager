# Search Console所有権確認ファイル：対象限定dual公開記録

更新日: 2026-09-20。所有権確認ファイルを通常のnew profile生成・公開へ組み込み、対象限定commit／push、new／legacy公開、HTTP本文確認を記録する。Search Console自体は操作しておらず、所有権確認完了の記録ではない。

## source変更とcandidate

- 入力 `C:/Users/innoc/Downloads/google4e94c2b3cb5b1c67.html` は53 bytes、SHA-256 `9C7E05887A3E2FC9FE76786BB607AD4146C66AAF0B0B6377096A0878972FBD1E`。repo直下の同名ファイルをバイト照合して配置し、manifestへ `kind: file`, `profiles: ["new"]` の明示assetとして登録した。
- route／sitemap、canonical、共通上バー、script等には接続していない。generator後の焦点回帰検査を `tools/test-public-site.js` に追加し、new出力のbyte equality、legacy出力からの不在、sitemap不掲載を確認する。
- `node --check tools/test-public-site.js`、`node tools/test-public-site.js`、`git diff --check` が成功。公開runbookのclean sourceから `prepare` を一度実施し、candidate `c92151ac342a7116`、release `904929f2eacece12`、content digest `8493662c17b34ff67f44def1d6bd33fb7d11e30d3630cb4efdf14f8b2e972113` を得た。new output digest `83474b58b5a7f9d7`、legacy output digest `25853bd69ed50979`。
- source commit `a30f74a3a6f011098cd7aaacce162e0220256579`（`feat: include Search Console verification asset`）を `release-source` へpush。manifest・焦点test・確認ファイルの3ファイルのみを対象とし、別機能やxlsxを含めていない。
- bundle: `tmp/publication-20260920013103128.json`。staging: `tmp/public-site-staging-20260920013103128/`。生成物のnewに対象ファイルが53 bytesで存在し、SHA-256一致。legacyにはファイルがなく、new sitemapにも含まれない。

## 配信先結果

同一candidateをdual設定の順に配信し、newのdeploy成功・identity一致後にlegacyへ進んだ。どちらも既設workflowの通常deployment承認を経てpublishedとなった。mode・workflow・保護設定は変更していない。

| profile | artifact commit | output digest | receipt v2 | run / 結果 |
| --- | --- | --- | --- | --- |
| new | `9f55704c0258ee5d0730b3631035d27fdd3620fb` | `83474b58b5a7f9d7` | `tmp/delivery-c92151ac342a7116-new-f8e9364888cb.json` | [35481810870](https://github.com/innocentroad/trickcal-manager-site/actions/runs/35481810870) — published、identity一致 |
| legacy | `c9bb84bec4d722086763d2bd6d96fd4bb5149770` | `25853bd69ed50979` | `tmp/delivery-c92151ac342a7116-legacy-d10d9eaf205f.json` | [35482131893](https://github.com/innocentroad/trickcal-manager/actions/runs/35482131893) — published、identity一致 |

両profileの公開identityはcandidate `c92151ac342a7116`、source commit `a30f74a3a6f011098cd7aaacce162e0220256579`、content digest `8493662c17b34ff67f44def1d6bd33fb7d11e30d3630cb4efdf14f8b2e972113` と一致。profile別output digestも上表どおり。配信記録は `backups/publication-history/c92151ac342a7116-new.json` と `backups/publication-history/c92151ac342a7116-legacy.json`。

## 公開URLの確認と残操作

- new `https://trickcal.irlab.dev/google4e94c2b3cb5b1c67.html` は直接GETでHTTP 200、リダイレクトなし（`Location`なし）。本文53 bytesで入力とバイト一致し、公開本文・入力のSHA-256はいずれも `9C7E05887A3E2FC9FE76786BB607AD4146C66AAF0B0B6377096A0878972FBD1E`。ブラウザー表示も元のverification textと一致。
- legacy `https://innocentroad.github.io/trickcal-manager/google4e94c2b3cb5b1c67.html` はHTTP 404。legacy生成物と転送planにも対象ファイルはなく、legacy資材から当該ファイルの削除は発生していない。
- Search Consoleへのログイン・「確認」操作・sitemap送信はしていない。利用者がSearch Consoleの「確認」を実行するまで所有権確認は未完了として扱う。確認後もこのHTMLとmanifest登録を削除せず、通常公開で残す。

## 編集前バックアップ

- source既存ファイル `tools/public-route-manifest.json` と `tools/test-public-site.js`: `D:/Games/etc/trickcal/backups/search-console-ownership-20260920-102845/`。各コピーのSHA-256は編集前と一致。
- GOAL／STATUS／BACKLOGを含む記録更新前backup: `D:/Games/etc/trickcal/backups/search-console-ownership-records-20260920-102952/`。各コピーのSHA-256は編集前と一致。
- 今回の公開結果を反映した記録の更新前backup: `D:/Games/etc/trickcal/backups/search-console-ownership-publication-records-20260920-104712/`。GOAL、STATUS、BACKLOGの編集前SHA-256一致を確認。
