# お知らせ履歴・全体ボード表示・recover整理の公開記録

日付: 2026-09-19
source branch: `release-source`
配信モード: `dual`（new → legacy、legacy active）

## 対象とsource

利用者が列挙した3系統と必要なHTML接続、生成・manifest・共有資材同期、検査、作業記録だけを対象にした。main側の無関係な変更、xlsx・使徒データ更新、新機能は含めていない。

- お知らせ更新履歴：承認済み39件、重要な移行案内、ゲームデータ最新1件、サイト更新最新3件、詳細展開・追加表示・内部スクロール、既存storage facade経由の同一Origin内共有、focus候補修正。
- 全体ボード：全体効果値マスに金／紫くれよんを重ね、ライト／ダークで控えめな背景色、見出し・集計値を通常文字／補助文字色へ整理。
- 通常遷移の固定`recover=20260912`を除去。機能query/hash、profile route、旧URL互換と専用復旧入口／処理は維持。

対象限定source commit: `0e9a3bf1655cb9bc02613ca66df80d9f9d39f885`
`origin/release-source`へpush済み。公開後にGOAL／STATUSとこの履歴を更新するため、別途ドキュメント専用commitを追加した（公開artifactのsource identityは上記source commitのまま）。

## Candidate・bundle・検査

- candidate: `1911a1521fe85b27`
- release ID: `1ecf8d1027c1a3d3`
- content digest: `895119ad05b0c45355bcfdeaa282273e0e15cfbd9a0fd8c3f49ae76bd9c2d0f6`
- bundle: `tmp/publication-announcement-board-recover-20260919-01.json`
- new output digest: `405d2e1d6c225baf`
- legacy output digest: `cd73ef4cf3557a4a`

公開手順の最終生成・統合検査は成功。generation、manifest、public-site、HTTP checksはいずれもtrue。new／legacyはそれぞれ1,089ファイルで、profile別route／asset構成を維持。対象限定stage、受信先dry-run、staged差分検査、artifact verifyは成功し、生成物・hash・成功記録の手編集はない。テスト、バックアップ、作業文書は配信artifactへ含まない。今回の配信で所有台帳上の削除は0件。

レビューで成功済みの同一入力検査は重複実行せず、最終candidateに対する統合生成・公開必須検査、focus実ブラウザ確認、共有資材checkを利用した。

## Deploy・identity

### New

- 配信先: `https://trickcal.irlab.dev/`
- artifact commit: `b56826effca590cc21efae6d57e66ffd02d29aaa`
- output digest: `405d2e1d6c225baf`
- run: [35446212223](https://github.com/innocentroad/trickcal-manager-site/actions/runs/35446212223)
- receipt: `tmp/delivery-1911a1521fe85b27-new-f8e9364888cb.json`
- 結果: 通常のReview deployments承認後に成功。公開記録`backups/publication-history/1911a1521fe85b27-new.json`はsuccess=trueで、candidate、source commit、profile=new、content/output digestが一致。

### Legacy

- 配信先: `https://innocentroad.github.io/trickcal-manager/`
- artifact commit: `fb99535062cc2c40f7b63c83f82824d3788adeae`
- output digest: `cd73ef4cf3557a4a`
- run: [35446591655](https://github.com/innocentroad/trickcal-manager/actions/runs/35446591655)
- receipt: `tmp/delivery-1911a1521fe85b27-legacy-d10d9eaf205f.json`
- 結果: newの成功・identity一致後、同じcandidateを通常のReview deployments承認後に公開。公開記録`backups/publication-history/1911a1521fe85b27-legacy.json`はsuccess=trueで、candidate、source commit、profile=legacy、content/output digestが一致。

## 公開画面の確認

隔離Chrome sessionで確認し、利用者の通常ブラウザ保存状態は使っていない。

- New managerのお知らせから重要な移行案内を表示。履歴一覧はゲームデータ17/17・サイト更新22/22（計39件）、初期表示はゲーム最新1件・サイト最新3件で、追加表示と詳細展開を確認。
- managerで記事を開いた後に同一Originの`/data/`へ移動し、同じ通知controllerと記事状態が反映された一覧を再表示。新旧Origin間の既読同期は対象外で、相互同期を主張しない。
- New managerの全体ボードで特殊（金）／上級（紫）の合成アイコン・表を確認。保存テーマに沿う初期表示、実ボタンによるdark→light切替、再読み込み後の選択保持を確認。
- Legacy managerの全体ボードで同じ合成アイコン・表を確認し、実ボタン操作でdark→lightへ切替。
- 両Originで通常のmanager／calc／dataリンクとprofile routeを確認。calc／board等の通常遷移URLに固定`recover=20260912`が付かない。旧URLの互換性および専用復旧入口は公開前テストで維持を確認。
- 公開手順runnerのsuccess recordで両配信先の公開identityをcandidate/source/content/profile output digestまで照合。利用者の旧HTTP転送cache全体が解消したとは保証しない。

## 残条件

本件の公開・identity・代表操作に関する残条件なし。通常通知保存はOriginごとに独立。公開sourceの変更はmainへ自動反映していないため、main側の後続取り込みは別作業。旧サイト停止・閉鎖や移行設定変更は行っていない。
