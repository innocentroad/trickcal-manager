# 作業ソース一本化・SEO再開の調査と移行案

2026-09-19作成、2026-09-20移行実行・最終追補。設計作成後、利用者承認に基づくローカル一本化を実行した。正式な編集場所はrepo直下 `D:/Games/etc/trickcal/trickcal-manager` の `release-source`。旧 `tmp/release-source` は編集禁止のparked worktreeとして残す。生成済みnew／legacy profileの代表画面確認は完了した。全画像のnaturalWidth総点検などは未実施。実行証拠・確認URLは[移行実行記録](history/source-worktree-unification-2026-09-20.md)、未公開案件・資料の所在は[BACKLOG](BACKLOG.md)を参照する。旧worktree撤去・SEO実装/公開・main-only変更の統合は未実施。

## 結論と運用方針

正式な作業場所は `D:/Games/etc/trickcal/trickcal-manager`、使用branchは `release-source`。公開sourceの履歴をrepo直下へ切替済み。通常の編集用worktreeはこの1か所だけにする。

- 公開済みの基準branchは `release-source` とする。通常の作業ではこのbranch、またはそこから切った未公開feature branchを同じrepo直下で切り替える。
- 未公開機能は `topic/<feature>` 等のbranchに分離する。mainの複合差分を一括merge/copyせず、機能ごとに比較・選別して移す。
- 並行編集が必要な期間だけ、明示した目的・担当・終了条件のある追加worktreeを使う。並行作業終了後は差分をbranchへ戻し、Gitのworktree手順で登録を解除する。`tmp/release-source` を恒常的な第二の編集元として残さない。
- 公開先repo、generated output、bundle/receipt、historyは編集sourceと別物として保全する。新旧配信モードや配信先は変更しない。
- 通常のxlsx更新は、一本化後の正式な作業場所で完結させる。使徒単位のbranch分割や、この通常運用に対する追加承認工程は設けない。詳しい手順は「datasheet・生成物・共有辞書」を参照。
- 今回確認したmain-onlyの未公開featureは、利用者が選択するまでtopic branch化も取り込みもしない。保留・未検証を完了扱いにしない。

移行後に追跡する案件と資料の復元先は[新rootのBACKLOG](BACKLOG.md)へ記録した。記録は所在確認用で、main差分の取り込み承認ではない。

## 調査時点のGit配置

両パスは別cloneではなく、同じGit common directory (`D:/Games/etc/trickcal/trickcal-manager/.git`) に接続したlinked worktreeである。remotesはいずれも `origin = https://github.com/innocentroad/trickcal-manager.git`。

| worktree | branch / HEAD | remoteとの関係・状態 | 扱い |
| --- | --- | --- | --- |
| `D:/Games/etc/trickcal/trickcal-manager` | `main` / `92b6df6` | `origin/main` より6 commit先行。多数のtracked変更・未追跡ファイルがある | 現在のdirtyを機能ごとに保全・仕分ける。公開基準として丸ごと移さない |
| `.../tmp/release-source` | `release-source` / `4668637` | `origin/release-source` と同一。調査時clean | 公開済み内容の基準。4668637は公開結果を記録する文書commitで、配信source commitではない |
| `.../tmp/release-source-published` | `release-source-published` / `15944e4` | local branch。`apostles.js`、`cards.js`、`statData.js`、`stat-dashboard.html`、datasheetにdirtyあり | 目的・生成物の正当性が未確定。消去・統合せず、個別に判断する |
| `.../tmp/snorky-publish-source-p1` | detached `b01dc27` | clean | 一時公開検証worktreeと見られるが、現用途を確定していない。保全対象 |
| `.../tmp/snorky-publish-source-p1-lf` | detached `bea5b20` | clean | 上記と別HEADの一時worktree。保全対象 |

`main` と `release-source` のmerge-baseは `15944e4`。mainの6 commitは `e736a23`（公開・保存移行基盤）、`b55a4fc`（clean checkout用test調整）、`15944e4`（検証記録）、`56ff5a9`（複数featureを含む集約commit）、`7295d20`・`92b6df6`（commit/backup記録）。特に `56ff5a9` は機能横断のため、commit単位でmergeせず機能境界を再確認する。

mainは変更中のtrack済みファイルに加え、使徒データ設計・履歴、共通上バー、使徒データUI、fixture/test等の未追跡物を持つ。`GOAL.md`、`STATUS.md`、`BACKLOG.md`はmain側の記録で、最終更新時点が公開sourceの2026-09-19公開記録より前の箇所がある。現状・公開有無の判定では両worktreeの記録を突き合わせる必要がある。

## 公開sourceとmain-only差分の分類

### 公開sourceに既にある／別の実装で反映済み

公開sourceの履歴では、共通上バー・使徒データが `e23ee00`、上バー・ボード・権能WebP等が `004d6c9`、お知らせ履歴・全体ボード・通常recover query整理が `0e9a3bf` で公開済み。直近の公開結果記録commitは `4668637`。

したがって、次は「mainとの差分があるから未公開」と判定せず、公開sourceの実装を維持する。

- 上バー、通知、データ入口、敵データ、使徒データ5表示と操作帯、低い画面の絞り込み。
- ボードプレビュー下バー・使徒画像・表示変更・低い画面対応。
- 教主の権能のWebP化、対象動画削除。
- お知らせ更新履歴、recover query整理、全体ボードの素材表示。
- 公開済み共有画像URL修正、共有ページ上部と改行修正。

main内の `public/board-layout-preview.js` と `public/apostle-data.js` は調査時点で公開sourceと同一hashだった。一方、上記以外の同名ファイルには多数の差がある。機能が公開済みでも、異なる公開sourceのファイルへmain版を上書きする根拠にはならない。

### main側で未公開として残す候補

| 機能・記録 | 状態と扱い |
| --- | --- |
| B01 共鳴性格R1〜R4 | mainの `formation-personality.js`、manager/calc/DPS/share接続があるが、公開sourceに `formation-personality.js` はない。隔離fixtureでの完了と実データ未確認を分け、明示選択後に専用topic branchへ。 |
| B02 全列使徒 | main側の完了記録と残条件がある。実データ・manager→calc→DPS→保存/共有等の保留確認を維持し、公開sourceへ一括投入しない。 |
| B03 SEO canonical移行 | mainにローカル実装があるが、公開sourceは旧manager/calc canonicalを維持。後述の比較設計で別topic branchへ。 |
| B14 manager画像背景404等 | mainのBACKLOGに調査・補修候補として残る。公開sourceで再現・原因・必要範囲を確認してから別判断。 |
| mainの未公開ページ差分・設計/fixture/test | 使徒データ、ボード、上バー等の履歴は多くが公開済み機能と重複。現行公開版とファイル単位で照合してから、未反映の具体的な挙動だけをtopic branchへ移す。 |
| `tools/trickcal_skillmotion.xlsx`、`img/equipicons/Design/`、`.github/workflows/pages.yml`、`tools/git/push.bat` | データ出典・未確定画像・workflow/ローカルpush補助の別差分。今回のSEO・source一本化に混ぜない。所有者の判断と個別検証が必要。 |

未追跡の設計書・テスト・画像fixtureは、関連するfeatureを選んだ場合に限りそのbranchへ付随させる。公開artifactにtest、backup、文書を混入させない。

## datasheet・生成物・共有辞書

### 一本化後の通常更新

通常の使徒・カード等のデータ更新は、正式な作業場所（repo直下の `release-source`）で行う。

1. 利用者が `tools/trickcal_datasheet.xlsx` をExcelで編集・保存する。エージェントに更新を依頼する場合も、この正式なworktreeのxlsxを入力として扱う。
2. Excel上で保存完了を確認し、編集中・保存中ではないこと、別の `generate-all.bat` 等が実行中でないことを確認する。これらの状態では生成を並行起動しない。
3. 利用者が `tools/generate-all.bat` を実行するか、エージェントへ標準生成を依頼する。xlsx、`apostles.js`／`cards.js`／`statData.js`、共有catalog/display-data、必要なasset hash同期と検証を、同じ正式worktreeで一つのデータ更新単位として扱う。生成物を手編集しない。
4. 通常のデータ更新を使徒ごとにbranch分割しない。追加のデータ専用承認段階も設けず、既存のレビュー・公開手順に沿って更新一式を扱う。

`tools/trickcal_datasheet.xlsx` はGit追跡ファイルであり、branch切替によりcheckout中の版が変わり得る。通常データ更新の未commit差分がある状態ではfeature branchへ切り替えない。正式な `release-source` 上で生成・検証を完了し、通常更新として同branchへ記録してから切り替えるか、記録・切替が可能になるまでfeature作業を延期する。更新を一時stashしてfeature branchで再適用したり、通常更新をfeature branchだけに残したりしない。データ更新が未commitのままなら、作業場所を切り替えずに完了させる。

大きな未公開機能を並行開発するときは、通常データ更新が安定したcommitになった後、その機能だけを一時worktreeのtopic branchへ分ける。xlsxを機能branchの作業対象に含めず、通常データ更新は正式worktreeの `release-source` で続ける。並行作業が終わったら機能差分だけをレビューして統合し、一時worktreeをGit管理下で閉じる。恒常的な第二の編集元にはしない。

### 今回の移行時に限るデータ候補照合

標準生成入口 `tools/generate-all.bat` はdatasheetから `apostles.js`、`cards.js`、`statData.js` を生成し、共有catalog/display-data生成、asset hash同期、検証へ続く。既存の共有配列は公開済み番号台帳であり、IDの並べ替え・削除・再利用をしない。

読み取り比較では、main worktreeとrelease-sourceの `tools/trickcal_datasheet.xlsx` は同一SHA-256（先頭16桁 `FCCB7713269B410A`）だが、mainのHEADに対してdatasheetはdirty。mainとrelease-sourceの `apostles.js`／`cards.js` は同一hash、`statData.js` は異なる。別worktree `release-source-published` では同じ現在datasheet hashに対し `apostles.js` にHEAD比354行の実質差、`statData.js` に1行差があり、`cards.js` は行末差のみだった。生成の正当性・採用予定・ゲーム内容はこの調査では検証していない。

この差は今回の移行時だけの照合作業であり、通常更新をfeature branchへ分割する理由ではない。移行時には各worktreeのxlsxのHEAD版・作業版をSHA-256付きで並べ、Excelで最後に保存された利用者編集の候補と生成物の状態を別々に示す。生成物の差だけを根拠にxlsxを古い版へ戻さない。xlsxの採用候補を一意に判断できない場合は、worktree名・branch/HEAD・xlsxのhash・dirty状態を具体的に提示して利用者へ確認し、回答前は生成・採用を止める。xlsxを確定する前に生成を実行しない。

したがって、xlsxの一致を生成物一致・公開済みデータ一致とみなさない。今回の差分を解決する目的だけで生成を走らせず、採用された正式xlsxで通常の一括生成を行う段階は、移行後の別途確認事項として扱う。xlsxだけ／生成JSだけの片側採用や共有辞書の並べ替えはしない。`trickcal_skillmotion.xlsx` は別入力として扱い、依存する生成物が特定されるまで保留する。

## ignored・外部保全対象

ignoredの内容値・秘密情報は読まず、パス分類とサイズ集計だけを行った。移行時は以下を一括削除せず、先にrepo外バックアップへ対象一覧・SHA-256を採取する。

- main側 `backups/`: 406 files / 約514.2 MiB。generated、既存feature backup、PVP試験等を含む。`outputs/`: 14 files / 約5.1 MiB。mainの `tmp/` はローカルfixture・生成結果・参照worktree等を含むため、release-sourceのtmpと統合・上書きしない。`tools/node_modules`、npm cache、Python cache、`tools/tmp/verification` は再生成可能な作業cacheだが、移行完了確認までは保持する。
- release-source側 `backups/`: 44 files / 約24.0 MiB。`tmp/`: 54,663 files / 約1,008.4 MiB。public-site、staging、candidate/check/bundle、転送receipt、publication history参照、スクリーンショット、debug生成物が混在する。完了済み候補と将来の再開に必要な途中候補を区別し、sourceを移す前に全体の一覧を保全する。
- `release-source-published` worktreeにもignored `backups/` と `tmp/generated/` がある。サイズ・役割の全件棚卸しは未完了。別worktreeとして保全する。
- 受信repoはpublication targetで指定された `tmp/minor-data-publish-new-final5` と `tmp/minor-data-publish-legacy-final4`。source worktreeとは別repoであり、今回そのdirty/HEADを検査・変更していない。移行時も別repoとして維持する。

直近の公開はsource内容commit `0e9a3bf`、candidate `1911a1521fe85b27`。new artifact/runは `b56826effca590cc21efae6d57e66ffd02d29aaa` / run `35446212223`、legacy artifact/runは `fb99535062cc2c40f7b63c83f82824d3788adeae` / run `35446591655`。成功記録はrelease-sourceの `backups/publication-history/1911a1521fe85b27-{new,legacy}.json`、bundleは `tmp/publication-announcement-board-recover-20260919-01.json`。これらは履歴証拠として保全し、旧パスを書き換えて過去記録を偽装しない。

## SEO差分の判定

根拠はmainのB03と `docs/seo-canonical-migration-roadmap.md`、公開sourceのmanifest/generator/runbook、2026-09-19の公開STATUS/履歴および依頼文の直前公開確認。Search Consoleはアクセス・確認していない。

| 項目 | 現在の判定 | 次の扱い |
| --- | --- | --- |
| new manager/calcの自己canonical、new robots/sitemapのnew domain整合 | 直前の公開確認で整合済み。公開sourceは `robots.txt` と `sitemap.xml` をnew profileだけへ生成し、new sitemapをindexable routeから作る。 | 維持。Search Consoleの採用canonicalや登録状態とは別。 |
| legacy manager/calc canonicalをnewの対応URLへ向ける | 直前の公開確認では旧URLのまま。未反映。mainのmanifestにはindexableなmanager/calc/share/dataの `seo.canonicalProfile: new` とcanonical helper/検査がある。公開source側のrouteには指定がなく、canonical helperはprofileごとにfallbackするため、legacyも自己canonicalとなる。 | canonical指定だけを公開sourceの現行schema/validator/helperへ移植する設計が必要。4 routeそれぞれの公開要否は生成出力で確認する。 |
| data詳細ページのnoindex | 公開sourceのroute manifestで詳細routeは`indexable:false`。変更対象にしない。 | 検索対象拡大をしない。 |
| canonicalと通常route/asset/保存導線の分離 | 公開sourceの `updateCanonicalMetadata` にはlegacy `sourceUrl` をHTML全体へ `replaceAll` する処理があり、canonical変更がJSON-LD等の別用途まで及び得る。mainの実装はrouteのcanonical targetを選ぶhelperを持つ。 | `sourceUrl`全体置換を移植・拡大しない。roadmapに従い、canonical用絶対URLだけを更新。navigation、asset、form、backup/transfer、query/hashは各profileの既存runtimeを維持。og:url／structured dataは前回方針を再確認し、許可なしに一括更新しない。 |
| mainの生成・検査差分 | main HEADには4 routeのcanonicalProfile、schema validation、canonical解決、sitemap生成/robots検査がある。現作業treeのgenerator差分にはdata入口/使徒route連携等も混在し、公開source版と同一ではない。 | generator全体を上書きしない。SEO機能の必要最小差分とtestだけを機能単位で適応する。 |
| Search Console | 現在値は不明。今回未確認。 | S2公開とは別のS3で、権限・プロパティを確認してから利用者主体で確認/送信。Googleの採用canonical・検索順位の保証はしない。 |

### SEO再開手順（一本化後・別承認）

1. 新rootの `release-source` から `topic/seo-canonical-migration` を作り、manifestの現indexable routeだけを対象にする。index aliasはcanonical routeへ統一し、noindex routeやdata detailを増やさない。
2. manifest検証とcanonical helperを現行generatorへ最小適応する。canonicalはprofile-awareなnavigation/asset resolverと分離する。legacyの通常リンク・共有payload/hash・保存/backup/transfer導線がlegacyに留まる回帰検査を追加する。旧→新の強制redirectはしない。
3. new/legacyの生成HTMLでmanager/calcを必須確認し、scope承認に応じてshare/dataを確認する。各HTMLのcanonicalが意図したnew absolute URLで正確に1件、query/hashなしであること、new sitemap/robots整合、noindex保持、link/asset profile保持を焦点検査する。生成HTMLやhashは手編集しない。
4. S1のローカル検証を終えてレビュー待ちで停止。公開は対象限定commit/push/deployを別途明示承認されたときだけS2として実施する。
5. 公開後のSearch Console確認はS3の別作業。新旧の既存プロパティ、sitemap送信状況、manager/calc URL検査、外部リンク更新可否を確認し、旧利用・保存導線を保つ。旧→新強制転送、旧サイト停止、データ詳細のindex拡大は別判断。

## 一本化の移行手順（設計・実行記録）

この節は承認前に作成した安全手順・切り戻し設計を保持する。2026-09-20に開始条件を再確認し、外部backup・safety refs・記録付きstashを作成したうえで、`release-source`をrepo直下へ切替えた。実行証拠は[移行実行記録](history/source-worktree-unification-2026-09-20.md)。旧worktreeはpark branch上に残り、削除・登録解除は行っていない。

### 0. 作業開始条件と停止ゲート

この文書は移行承認ではない。移行時点のbranch・HEAD・remote・index・tracked/untracked/ignored・全worktreeを再調査し、前回公開以降のrun/receipt/candidate状態と受信repoのdirtyを確認する。候補ファイルの存在だけで停止せず、下表で分類する。過去bundle/receiptは移転先に合わせて書き換えない。現在の証拠をそのまま将来へ流用しない。

| 公開作業の分類 | 移行の扱い |
| --- | --- |
| 実行中・承認待ち・転送途中・stage済み未完了・再開予定 | 移行を停止。同じbundle/receiptを使う既存手順で、承認済み範囲の作業を解決してから移行する。移行承認だけで公開・承認代行・キャンセルを実行しない。 |
| dispatch結果不明・所有者不明のlock・candidateと実runの対応不明・受信repoに由来不明のdirty | 移行を停止。既存記録と必要なGitHubの読み取り確認で実態を特定する。古い日時だけを理由に休止・不採用と断定せず、記録削除・再dispatchで解決しない。 |
| 公開完了・identity照合済み | 履歴証拠として保全し、移行可能。完了済みrunの再公開は不要。 |
| 過去の試作・不採用・置換済み候補で、未解決の転送や実runがなく再開予定もない | 移行可能。candidate ID、旧保管先、関連run/receiptの有無、根拠、不採用理由、移行後保管先を別の移行台帳へ記録する。元candidateのstatusや内容は変更せず、公開して完了させる必要もない。 |

分類の根拠が不足する候補だけ利用者へ確認する。全履歴の公開し直し・キャンセルは行わない。停止対象が解消されたかは、branch切替直前と旧worktree撤去前に再確認する。

移行中の一意な識別子を `unification-YYYYMMDD-HHMMSS` とし、以下のref・外部backup・manifest名に同じIDを使う。各worktreeのHEAD・branch・remote・statusとxlsx候補を照合し、xlsxがExcelで保存済みか、候補を一意に選べるかを確認する。選択できない場合は、候補のパス・branch/HEAD・SHA-256・dirty状態を提示して停止する。

### 1. repo外保全と識別子

repo外の日時付き `D:/Games/etc/trickcal/backups/source-unification-<ID>/` を作り、worktreeごとに `inventory/`、`patches/`、`untracked/`、`ignored/` を分ける。source・root・公開artifact内にbackupを置かない。manifestにはworktree path、branch/HEAD、index tree、staged/unstaged状態、元の相対path、SHA-256、保管先、復元状態を記録する。

- **既存commit:** `main`を含む各worktreeの現HEADを、`safety/unification/<ID>/<worktree-key>` の保全branch/refに記録する。特にmain HEAD `92b6df6`、旧release-source HEAD `4668637`、release-source-published HEAD `15944e4`、detached HEAD `b01dc27`／`bea5b20`は移行時に再確認して識別する。保全refはdirty内容を含まない基点なので、下記patch/ファイルbackupと一組で保持する。元の `main` branchも維持する。
- **staged／unstaged:** 各worktreeのHEADを基点として `git diff --cached --binary` と `git diff --binary` を別々に外部保存する。元worktree固有のGit indexファイルもrepo外へ複製し、そのpath・SHA-256・index tree OIDを記録する。復元時は同じbase HEADとworktreeを確認し、staged patchをindex/worktree双方へ、続いてunstaged patchをworktreeへ適用してstatus・index tree・hashを照合する。conflict stageや特殊index flagがあり通常patchで一致しない場合はindex snapshotを照合して手順を止め、上書きで合わせない。baseが異なる場合も適用せず停止する。
- **未追跡:** repo相対構造を保ったまま同backupの `untracked/<worktree-key>/` へコピーし、一覧とSHA-256を記録する。復元時は元pathに同名・新しいファイルがないか先に確認し、競合があれば上書きせず `restore-conflicts/` へ分離して判断を待つ。
- **ignored:** xlsx関連資料、利用者作成画像、重要なbackup、bundle/candidate/receipt/publication history等の再作成不能または証拠性のあるものを `ignored/<worktree-key>/` へrepo外保管し、相対path・hash・用途を記録する。秘密情報は値を記録せず、アクセス制限された暗号化保管だけを使う。巨大でも再生成可能なcache/outputはGitへ無条件commitせず、保管・再生成の別を記録する。古いworktreeを保持している間は元ファイルを残し、移行後の再生成とhash/identity確認が済むまでは削除・worktree撤去しない。
- **一時stash:** rootの切替に必要な場合に限り、上記のrepo外patch・ファイルcopy・SHA検証の後で `git stash push -u` を補助的に使う。ignoredはstash対象外。stash OIDと用途をmanifestに記録し、pop/dropしない。stashだけを最終保管にしない。

この文書は移行前に旧release-source worktreeで未追跡だったため、移行時点の最新版hashを外部保全して新rootへ個別コピーした。その後、この新rootの写しへ実行結果を追記している。元worktree側の写しはparked worktree内にそのまま残し、編集しない。

### 2. mainのdirtyを安全に退避し、旧release-sourceを先にparkする

1. すべての外部backupと各SHA-256を照合し、staged/unstaged patch、未追跡・ignoredの復元情報、main safety refが揃ったことを確認する。必要なら既存runbookに従った `stash -u` を記録付きで作成し、stash OIDも読み戻して確認する。ここで失敗・不一致があればbranch/worktreeを変更せず停止する。
2. `tmp/release-source` が切替可能な状態であることを再確認する。未追跡の本書を含む変更はすべてrepo外へコピー・hash照合し、変更後はこのworktreeを読み取り専用の退避元として扱う。
3. 旧worktreeで `release-source` から専用park branch `safety/unification/<ID>/release-source-park` を作成・checkoutする。これにより旧worktree登録とファイルを保ったままbranch名 `release-source` を解放する。park branchは旧HEAD `4668637` を保持する一時退避refであり、第二の編集branchとして使わない。
4. main rootの作業ツリーを安全に切替可能な状態にする。外部backup検証済みのmain差分に限り補助stashを作る場合も、main branchとpatch backupを保持し、stash OIDを記録する。ignored衝突候補は別途保全し、無断削除しない。
5. その後初めてrepo直下で `git switch release-source` を行う。旧 `tmp/release-source` のworktree登録は解除しない。checkout拒否・衝突・想定外のファイル変更があれば再試行や強制操作をせず、その場で停止する。

### 3. 新配置を検証してからpath設定を合わせる

まずrepo直下のbranch/HEAD、tracked file、datasheet/generated hash、manifestのroute/asset解決、docs/entry pointを確認する。本書など選別済みの未追跡文書は、外部backupの最新版hashと一致するものだけを個別にコピーする。旧worktreeを残した状態で新配置が期待通りか検証する。

現在のpublication toolは `__dirname` からrepoRootを決め、target destinationは `path.resolve(ROOT, target.destination)` で解決する。旧source root `.../tmp/release-source` の `../minor-data-publish-new-final5`／`../minor-data-publish-legacy-final4` はrepo内の `tmp/minor-data-publish-new-final5`／`tmp/minor-data-publish-legacy-final4` を指す。新root `.../trickcal-manager` では同じ相対値が別場所へ解決されるため、変更前後の絶対pathを比較し、同じ受信repoへ解決する `tmp/minor-data-publish-...` 等へ必要最小限のpathだけを修正する。配信mode・repo・branch・新旧active状態は変更しない。

`docs/publication-runbook.md` のsource固定path、previous-release `../release-source-publish-final7/...`、prepare例、AGENTSのsource/worktree説明、README、GOAL/STATUS/BACKLOGの現行リンク、publication task authoringの作業pathも参照箇所を棚卸ししてから更新する。previous-releaseの新root相対先は `tmp/release-source-publish-final7/...` となる想定だが、移行時に実在pathを解決し、受信済みrelease JSONと同一ファイル・同一hash/identityであることを確認する。見つからない、別ファイルへ解決する、dirtyがある場合は修正前に停止する。

publication runnerのbundleはrepoRoot・source/output/staging・checks/candidate/release/build pathを記録する。過去bundle/receiptは不変の証拠としてそのまま保管し、pathを書き換えない。完了済みhistoryはread-onlyで引き継ぎ、`latest-new.json` を含め欠落・上書きがないことを照合する。bundlePathが旧pathを指す履歴は、その参照を変えず旧/新保管先の対応表だけを追加する。「0. 作業開始条件と停止ゲート」の停止対象が見つかった場合は移行を止める。不採用と確認済みの過去候補は保全だけでよい。

#### 相対パスの照合基準

移行台帳では相対文字列だけでなく「基準ディレクトリ＋設定値＋解決した絶対path」を一組で記録する。

- 旧root: `D:/Games/etc/trickcal/trickcal-manager/tmp/release-source`
- 新root: `D:/Games/etc/trickcal/trickcal-manager`
- 例: new受信先は、旧root＋`../minor-data-publish-new-final5`と、新root＋`tmp/minor-data-publish-new-final5`が同じ絶対pathを指すことを検査する。legacyも同様。
- `publication-targets.json`のdestinationはツールのROOT基準。CLIの明示previous-release引数は実行時のcwd基準なので、コマンド実行場所も台帳へ記録する。
- 通常prepareの前回releaseは新rootの`backups/publication-history/latest-new.json`から継承する。移管前後の記録と内包releaseのhash/identityを照合し、通常更新で古い初回用previous-releaseへ戻さない。初回用の説明例は現行運用と区別する。
- 切り戻しでは旧設定を旧root基準で検査する。旧相対値を新rootで解決して受信先一致を要求しない。新rootの切替途中に旧相対値が存在しても、その設定で公開ツールを起動しない。
- 移行・切り戻し中はpush・dispatch・承認・transferを実行しない。ローカル生成/検査は新rootのpath整合確認後だけ行い、切り戻しに入ったら停止する。旧rootでの公開運用再開はbranch・設定・historyの復旧確認後、別の公開依頼の範囲で行う。

`tools/generate-all.bat` とmanifestのroot相対参照も確認するが、整理のためだけのxlsx再生成はしない。通常データ更新が必要な場合は前節の保存確認・非並行生成ルールに従い、採用xlsxが確定してから正式rootで一回の更新単位として行う。

### 4. ローカル検証と、段階別の停止・切り戻し

各段階で想定外差分・hash不一致・target identity不一致・復元競合が出たら、次へ進まず停止する。新たに生じたファイルや差分を最初に同じ外部backupへ追加し、既存backupを上書きしない。`reset --hard`、force checkout、無条件restore/copy、branch強制移動は使わない。

| 段階 | 停止条件 | 切り戻し順序 |
| --- | --- | --- |
| repo直下のbranch切替前 | backup/hash不一致、xlsx候補未決、開始条件で定義した停止対象の公開作業、main stash/ref不一致 | 何もcheckoutしない。park branchへ切替済みなら、rootで `release-source` が未checkoutであることを確認して旧worktreeを `release-source` へ戻す。stash作成済みならmainのbase/差分を照合後 `git stash apply --index <OID>` し、pop/dropせずhashを確認する。 |
| 切替後・path設定変更前 | repo直下のbranch/HEAD/data/hashが記録と不一致、想定外dirty | root側の新規差分・未追跡・ignoredをまず別名backupへ保全する。rootをmainへ戻す前にstash/patchでclean化できるか検査し、適用競合なら停止する。安全に戻せる場合だけrootをmainへ切替え、stashを `--index` で適用してstage/unstaged/untracked/hashを検証する。その後、空いたbranch `release-source` を旧worktreeへ戻す。 |
| path設定変更後・ローカル検証失敗 | absolute destination、previous-release identity、route/asset解決、runbook参照が移行台帳の期待値と不一致 | 公開系操作を停止し、新rootのpath設定を含む全新規差分を別途保全する。直前段階と同じ手順でrootをmainへ戻して元dirtyを復元し、release-sourceが空いた後に旧worktreeを復帰する。旧worktree内の設定を旧root基準で解決し、受信先絶対pathと前回release/historyのhash・identityを台帳と照合する。新rootへ旧相対値だけを書き戻して公開ツールを動かさない。receipt/bundleは変更しない。 |
| 旧worktree撤去前 | 新rootのローカル検証・切り戻し準備・受信先path照合・history確認が一つでも未完了 | 撤去しない。旧worktreeはpark branch上の読み取り専用退避元として保持する。新rootの問題はpath値を局所復元し、上記の順でmain rootを復帰する。 |
| 旧worktree撤去後 | 撤去後に重大な不一致が判明 | まず新rootのdirty・ignoredを別backupし、上書きせず保全する。old pathへ戻すなら `git worktree add <old-path> safety/unification/<ID>/release-source-park` で保存HEADのread-only worktreeを再作成する。main復帰が必要ならrootの新差分をstash/外部patchで保全してrootをmainへ戻し、branchが空いた後で旧worktreeを再登録する。release-sourceに新commitがある場合は巻き戻さず、新commitをrefで保持したままpark branchを復旧元とする。mainのstage/unstaged/untracked/ignoredは各manifestの手順で照合復元し、hash不一致・既存path競合時は別場所へ分離して判断を待つ。 |

切り戻し時はxlsxの保存済み候補をmanifestのpath/hashと照合し、利用者の移行後編集を古いコピーで上書きしない。元の生成物・画像・公開記録は対応するbackupまたはparked worktreeから復元し、生成物差分だけを理由にxlsxを戻さない。publication targetの旧値は旧worktreeで維持・復元し、旧root基準の絶対pathが同じ受信repoを指すことを確認する。publication history・bundle・receiptは保管先とhash/identityを照合して戻すだけで、内容やpath参照を書き換えない。

mainの復元では、`main`本来のbranch tipと `safety/unification/<ID>/main` を保持する。stashはpatch backupを検査するための便宜であり、復元hashが全件一致し、未追跡・ignoredを含む対象の復旧可否を確認してから初めて削除候補とする。stash dropは別途全件照合と明示判断後に限る。

### 5. 新rootの完了判定と旧worktreeの別工程撤去

新rootでbranch/HEAD/remotes、main safety ref、feature refs、datasheet・生成物hash、publication targetの絶対path、previous-release identity、history、manifest route/asset解決、通常の起動・焦点検証を確認する。通知・公開手順の検証は実際の構成に必要な範囲に限定し、無変更なら再公開しない。通常運用でxlsxを更新する場合は前節の通常手順を使い、移行検証のためだけに生成しない。

この検証と復元手順の準備を完了しても、旧worktreeの撤去は利用者の別承認後に行う独立工程とする。この文書や新rootの検証成功だけでは撤去を許可しない。新rootが正式な唯一の編集場所として確認された後、旧worktreeの最新状態・未追跡・ignoredを再inventoryし、必要な全ファイルを外部backupおよび新root/所定保管先へコピーしてhash照合する。通常の `git worktree remove` が要求するclean状態を満たすため、未追跡ファイルは個別に保全・照合した後でのみ旧worktree外へ移す。必要な未追跡資料が未移管、またはignoredファイルの保存・再生成確認が未完了なら撤去しない。候補/run/historyを再確認し、旧worktreeに未保全dirtyがないことを確認してから通常の `git worktree remove <old-path>` を用いる。Explorer等によるフォルダ削除、`git clean`、`--force` は使わない。parking safety branchとrepo外backupは、利用者が採否未決変更の一覧を確認し、復元検証が終わるまで残す。

切替後はrepo直下を通常編集の唯一の場所とする。機能開発はtopic branch、並行作業に必要な間だけ一時worktreeを使う。SEOは一本化後に別のtopic・検証・対象限定公開として再開し、配信mode変更や整理だけを理由とする再公開はしない。

## 利用者判断が必要な残件

通常のxlsx編集・一括生成を正式な作業場所の `release-source` で行う運用は確定しており、更新ごとの使徒別branchや追加承認は不要。今回の移行時は、保存済みmain作業版と公開sourceの `tools/trickcal_datasheet.xlsx` がSHA-256 `FCCB7713…` で一致し、採用版の曖昧さは解消した。移行時の比較証拠は[移行実行記録](history/source-worktree-unification-2026-09-20.md)に記録した。

1. B01/B02/SEO/B14のうち、一本化後にtopic branchとして継続する案件と、保留/退避のままとする案件。
2. `release-source-published` の354行規模のapostle data差分とstatData差分を意図した次期データ更新とみなすか。生成の再現性・データ承認なしに取り込まない。
3. 更新済み `trickcal_skillmotion.xlsx` と `img/equipicons/Design/` を将来の対象に含めるか、workflow/push補助のdirtyをどう扱うか。
4. detached snorky worktreeを用途確認後にいつ終了するか。並行作業を継続する限りはtemporary worktreeとして扱い、恒常sourceにはしない。
5. SEOは既存roadmapどおりcanonical/sitemapに限定し、OG metadataやstructured dataを現行公開版でどう扱うかを公開source上の生成テストで確認する。Search Console操作は権限・実施者を含め別途合意する。

## 調査時点の未実施事項と移行後の現在地

初回調査時点ではbranch/worktree変更、datasheet編集・生成、publication target変更、実生成/テスト、公開先への接続、Search Console確認/書込み、workflow/DNS/protection設定変更を行っていなかった。2026-09-20に承認範囲のbackup・safety ref・記録付きstash・旧worktree park・repo直下branch切替・局所path修正・local-only生成checkを実行し、生成済みnew／legacy profileの管理・計算・使徒データ・編成共有と共通上バーの代表操作をローカル確認した。証拠・URL・限界は[移行履歴](history/source-worktree-unification-2026-09-20.md)を参照する。本変更は一本化の対象限定記録commitに含め、push／公開は別途扱う。Search Console操作、workflow/DNS/protection変更、旧worktree撤去、stash削除、SEO実装は未実施。
