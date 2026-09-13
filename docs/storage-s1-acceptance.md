# S1受入台帳

> 最終接続レビュー・対象整理（2026-09-14）：R1実Git fixture、共有保守検査、生成check、差分検査は成功。焦点範囲でローカルcommitを妨げる新規問題なし。成果物repo名trickcal-manager-siteは利用者確定（作成未承認）。[133ファイルの統合commit候補](storage-migration-commit-plan.md)を列挙し、実workflowとpush補助の2ファイルは保留・維持する。別clean checkoutで確定commitを検証する方針。今回は文書のみ、git add/commit/push・外部設定・公開は未実施。公開環境検証は残件。

> 最新実施結果（2026-09-14）：R1 1/1。未設置source workflowへ初回／更新のprevious release inputを接続し、専用tmpの実Git fixtureでfresh更新候補の再生成、欠落／別previous／local-only record拒否を確認した。local準備は完了したが、実commit/push・実workflow・外部設定・公開・Goal有効化は未実施で、承認待ちで停止する。

> 最新指示設定（2026-09-14）：P5a/C1の成功を維持。[G1→G4](storage-p5b-git-gate-handoff.md)を4/4完了。Git判定簡素化→配信tools／未設置workflowテンプレート→専用tmpダミー配信代表確認→実repo確定・公開準備の承認資料まで記録した。実repoのcommit/push・実workflow・外部設定・公開・Goal有効化は行わず、承認待ちで停止する。

> 最新完了（2026-09-14）：U1/U2/U3、P5aローカル完了、C1/C2候補準備を維持。C1 1/1、C2 1/1。実repoはdirty/local-onlyで、candidate作成・実配信・外部設定・commit/push・Goal有効化は行わない。

> 最新レビュー（2026-09-14）：U1/U2とP5aローカル完了は維持。U3は通常staging成功だが、出力削除境界と検査証拠のrelease束縛を補修し、手編集不要の候補作成入口を仕上げる。[次回C1→C2](storage-p5b-candidate-instructions.md)はC1 1/2、C2 0/1、残り約1単位。今回は実配信・外部設定・commit/push・Goal有効化を行わない。

> 最新実施結果（2026-09-14）：U1・U2・U3、C1、C2を完了。P5a残件をローカル証拠で閉じ、P5bはclean検査済み候補をlocal stagingへ渡す入口まで。実repoはdirty/local-onlyのため候補は拒否。実配信・外部設定・commit/push・自動実行Goal有効化は禁止のまま。

> 最新レビュー（2026-09-13）：F0と主要機能の成功を維持。P5A-2/3は生成SWのrelease接続・最終版記録・生成transfer往復の残件があり、下記4/4は無条件の公開可判定に使わない。[次回指示](storage-p5-review-next.md)のU1→U2→U3（未着手0/3、約3単位）で限定補修からP5bローカル準備へ進む。今回はレビュー・文書のみ。実配信・外部設定・commit/push・Goal有効化は禁止。

> 最新の実施指示・結果（2026-09-13）：[最小補修→P5a](storage-p5-luna-instructions.md)を正とする。F0 1/1、P5a-1 1/1、P5a-2 1/1、P5a-3 1/1を確認し、P5a 4/4で完了した。未確認は合格へ加算せず、P5b実配信・外部設定・commit/push・自動実行Goal有効化は対象外。下記のP5開始前停止指示は本指示で置換する。

> 旧判定履歴（2026-09-13 F1再レビュー）：Aへの誤成功通知の修正とH1/H2の成功証拠は維持。不正ファイル選択後も旧packageをplan/applyできる反例を本番controller/codec＋代替runtimeで再現したため、F1は部分達成（完了0/1）、P4最終完了を保留する。残りは入力切替の限定補修1作業単位。[レビューと次回指示](storage-p4-file-input-review.md)を最新とし、下記F1完了記録は履歴として扱う。transfer/pageテスト2本は成功したが反例を網羅していない。native追加確認・P5実装・公開・commit/push・Goal有効化は未実施。

> F1着手前レビュー（2026-09-13・履歴）：P4 6/6の無条件継承を保留。転送導線の既定OFF、失敗後再試行、適用中操作の抑止、既存backup代替要件、診断初期化を除いたnative証拠に不足がある。次回は[限定補修指示](storage-p4-review-handoff.md)のH1→H2で再判定する。F1着手前はH1a〜d/H2を0/5、目安2作業単位としていた。P5実装・Goal有効化は開始しない。home/dataの決定は維持する。下記の完了記録は履歴として扱う。

## 最新判定：R1完了・外部承認待ちで停止（2026-09-14）

| 固定ID | 対応条件 | 証拠・未達 | 判定 |
| --- | --- | --- | --- |
| R1 | 初回／更新の生成入力へprevious successful release recordを明示接続し、fresh環境でも同じ更新候補を再生成できること。欠落・別previous・local-only recordは生成前に拒否する | `tools/validate-public-site-release-input.js`を追加し、source workflow templateへ`release_mode` choice、`previous_release_id`、`previous_release_json`の環境変数接続、tmpへのcompact record materialize、更新時だけの`--previous-release`を追加。`node tools/test-public-site-release-input.js`終了コード0で、専用tmp実Git fixtureの初回previousなし、`status=published`／`dirty=false` record、local-only拒否、欠落／ID不一致拒否、同一source＋previousのlocal／fresh checkoutを確認。SW内容、`previousCacheVersion`、contentDigest、sourceCommit、candidateId、profile digestが一致。`node tools/test-public-site-delivery.js`終了コード0、変更helper／testの`node --check`、`git diff --check`成功。実workflow／実配信／外部設定／commit／pushは未実施 | 達成 |

R1は **1/1**。既存G1〜G3、P5a、delivery成功証拠は再利用し、ブラウザ・保存・全画面の再検証は行っていない。R1限定の正確なcommit候補8ファイルと、`.github/workflows/pages.yml`、push補助、tmp生成物、datasheet／ゲーム生成物、保存writer／codec、外部設定等の保留を[`storage-p5b-local-staging.md`](templates/storage-p5b-local-staging.md)へ記録した。現行releaseは`local-only-unpublished`／`dirty:true`で、公開可とは判定しない。残件は前回成功recordの実運用保管、外部workflow／成果物repo／Pages／DNS／HTTPS、new Origin、初回公開と旧案内ONの別承認。ここで停止する。

## 最新判定：G4完了・承認待ちで停止（2026-09-14）

| 固定ID | 対応条件 | 証拠・未達 | 判定 |
| --- | --- | --- | --- |
| G4 | 実repoのdirty変更を機能単位に整理し、commit／push、legacy／new workflow、成果物repo、Pages／DNS、初回公開、旧案内ONを分離した承認資料を作り、次の承認・操作を具体化して停止する | `docs/templates/storage-p5b-local-staging.md`へ、公開サイト source／runtime／manifest、P5b Git gate／受渡し、保存・転送安全性、編成共有・データ保守、記録・設計のcommit候補を分離して記録。`pages.yml`、push補助、`tmp/`生成物、datasheet／xlsx、ゲーム生成データ、保存writer／codecの無関係変更、CNAME／DNS／secret／token、未知変更は除外・保留とした。newは成果物repo root、legacyは現行`/trickcal-manager/`とbackup／recovery維持、未設置source／Pages templateとの差分案を記録。操作順を`確定commit→clean生成／checks／candidate／staging→成果物repo・権限・Pages／DNS準備→初回公開承認→旧案内OFFのnew公開→実Origin確認→旧案内ONの別承認`として固定し、tokenはチャットへ貼らない承認事項を明記した。実repoのcommit／push、実workflow／外部設定／実配信／移行案内ON／Goal有効化は未実施 | 達成 |

G4は **1/1**。G1〜G3各1/1と合わせてG1→G4 **4/4**。local C-T2の準備証拠は揃ったが、実配信可／公開可とは判定しない。現行releaseは`local-only-unpublished`／`dirty:true`のまま。利用者の承認事項は、確定commit対象、成果物repo名・branch・担当、外部workflow／Pages／environment／token権限・期限／DNS・CNAME・HTTPS、new初回公開と旧案内ONの別承認。ここで停止する。

## 最新判定：G3完了・G4着手（2026-09-14）

| 固定ID | 対応条件 | 証拠・未達 | 判定 |
| --- | --- | --- | --- |
| G3 | 専用tmpの実Git送信元／配信先でclean candidate→staging→受渡し→artifact相当rootを同じ処理で確認し、正常new／legacy、同一candidate再実行、版不一致無変更、所有不要file整理、workflow／未知file保持、途中copy失敗停止を代表確認する | `node tools/test-public-site-delivery.js`を実行し終了コード0。source A／Bの実Git commit、new／legacy staging、実Git dummy destination、所有ledgerからのartifact相当root抽出を確認。newはroot、legacyは`trickcal-manager/`なし。B更新で前回所有の`old/index.html`だけを削除し、`CNAME`、`.github/workflows/pages.yml`、未知`keep.txt`を保持。同じB candidate再実行はwrite/delete 0。contentDigest不一致は変更前拒否。成功済みBへのworkspace copy失敗はdestination snapshot、ledger、Git HEAD／statusを維持した。workflow templateのinput／Action／permissions／needs／manual-only trigger参照も静的確認。保存・ブラウザ・実GitHub Actions／Pages／DNS／HTTPS・実配信は未検証 | 達成 |

G3は **1/1**。G1 **1/1**、G2 **1/1**と合わせてG1→G3 **3/4**。これはC-T2のlocal evidenceであり実配信合格ではない。G4では既存local-staging手順を更新し、実repoの確定commit対象・除外／未確認、成果物repo・外部権限・Pages／DNS・初回公開・旧案内ONの承認範囲と順序を具体化して停止する。実workflow・外部設定・commit／push・実配信・移行案内ON・自動実行Goal有効化は行わない。

## 最新判定：G2完了・G3着手（2026-09-14）

| 固定ID | 対応条件 | 証拠・未達 | 判定 |
| --- | --- | --- | --- |
| G2 | 実配信に使う処理とtemplateをローカルで揃え、dry-runを既定にし、今回の適用先を専用tmp内dummy repoへ限定する。candidate／profile／hashを前後照合し、所有外削除・保護ファイル上書き・衝突・失敗を止める | `tools/transfer-public-site-artifact.js`を追加。candidate record、staging report、release／build／checks、profile別staging file一覧・sha256・outputDigest・Service Worker hashを再照合し、new root／legacy base除去、`public-site-deployment.json`（candidateId／sourceCommit／profile／digestのみ）、`.trickcal-public-site-delivery.json`（所有file/hash台帳）を生成する。既定dry-run、専用workspace hash確認、前回所有hashだけの置換／削除、`.git`／`.github`／CNAME／未知file保護、版不一致・同名衝突・symlink・途中copy失敗停止を実装。`docs/templates/storage-p5b-source-delivery.yml`と`storage-p5b-pages-deploy.yml`は未設置templateとして追加し、source manual dispatch／承認environment／受信repo限定Contents token、Pages artifact／deployの`needs`・最小権限を記録。`node tools/test-public-site-delivery.js`終了コード0（専用tmp実Git source／dummy destination、workflow input/action/permission/static reference確認）、G1後の`node tools/test-public-site-staging.js`終了コード0、変更JS構文・`git diff --check`成功。公式確認はPages custom workflow、fine-grained token permission、workflow dispatch/environment。G3の実Git送受渡し代表再判定、G4承認資料は未達 | 達成 |

G2は **1/1**。G1 **1/1**と合わせてG1→G2 **2/4**。G3は同一delivery処理で正常new／legacy、再実行、版不一致、所有不要file削除、保護file保持、途中失敗停止とartifact相当rootを確認する。実workflow・外部設定・実repoのcommit／push・実配信・移行案内ON・自動実行Goal有効化は行わない。

## 最新判定：G1完了・G2着手（2026-09-14）

| 固定ID | 対応条件 | 証拠・未達 | 判定 |
| --- | --- | --- | --- |
| G1 | Gitが保証できないcleanを候補として採用せず、実Gitのclean fixtureを受理する | `tools/public-site-candidate.js`からHEAD／index／ignoreの独自解析fallbackを削除し、`git rev-parse HEAD`と`git status --porcelain --untracked-files=all`の双方の成功をavailable条件に固定。失敗時は`available:false`／`dirty:true`／短い`reason`を返し、candidate入口は理由付きで拒否する。`node tools/test-public-site-staging.js`をsandbox外の専用検証環境で実行し終了コード0。親repo外の実Git fixtureで`git init`→repo-local identity→`git add`→fixture commitを行い、clean candidate受理、`git add`済み未commit変更拒否、`.git`を隠したGit実行失敗拒否・candidate record未作成を同じ入口で確認。既存C1/C2のstaging境界・checks束縛・候補後変更拒否も再利用。変更JS 4本の`node --check`、`git diff --check`は成功。通常sandboxのNode→Git`spawnSync git EPERM`は環境制限として記録し、成功を推定していない。G2の配信tool／未設置workflow template、G3のダミー送受渡し、G4の承認資料は未達 | 達成 |

G1は **1/1**。fixture内のcommit以外に実repoのindex／commit／remoteは触れていない。G2へ進み、G1のclean／staged／Git失敗gateと既存C1/C2証拠を再利用する。実workflow・実配信・外部設定・commit／push・移行案内ON・自動実行Goal有効化は行わない。

## 最新判定：C2完了・P5b候補準備完了（2026-09-14）

| 固定ID | 対応条件 | 証拠・未達 | 判定 |
| --- | --- | --- | --- |
| C2 | clean checkoutで実検査結果と期待commit／digestを確認した別candidate recordを作り、stagingがrecord・現行Git・再生成結果・profile台帳を再照合する。生成後変更、dirty、checks欠落、版不一致を拒否し、公開とは分離する | `node tools/record-public-site-checks.js --source tmp/public-site --manifest tools/public-route-manifest.json --out tmp/public-site-checks-c2.json`が終了コード0。4 checks true、binding.ok、release `875b990b55018c14`、sourceCommit `e22f99d7a1c39eb093430944fb2e9314a0097215`、contentDigest `3cd62b1bc1596be7b88b3f714db5f6f6933e95406dec65c9de517133b2935469`、new／legacy output digest `be85e7ddbae8722e`／`3f56dd68eeafcb9f`を自動記録。`node tools/test-public-site-staging.js`（終了コード0）は隔離clean Git fixtureのchecks→candidate→new／legacy staging受理、candidate後変更・checks欠落・期待digest不一致の拒否、実repo dirty拒否（candidate CLI終了コード2・recordなし）を確認。generatorのlocal-only statusは書換えていない。実repoの確定commit、外部承認・repo／token／Pages／DNS／HTTPS・Origin smoke test・移行gate承認・P6実機は未確認 | 達成 |

C2は **1/1**。C1 **1/1**と合わせてC1/C2 **2/2**。P5bは候補作成・local staging入口までで、実配信可／公開可とは判定しない。外部操作は下記手順の順番で利用者承認後に行う。

## 最新判定：C1完了・C2着手（2026-09-14）

| 固定ID | 対応条件 | 証拠・未達 | 判定 |
| --- | --- | --- | --- |
| C1 | tmp自身、sourceと同じ／親／子になるout、tmp外realpath、symlink／junction、既存の別用途rootを削除・コピー前に拒否する。release／build／checks証拠をout削除へ巻き込まず、sourceCommit、contentDigest、new／legacy outputDigestを対象releaseへ必須束縛する | `tools/prepare-public-site-staging.js`を補修し、tmp直下の専用stagingだけを再作成するよう制限。release／build／manifest／checksを先に解決・読取りし、out配下の入力を拒否。`node tools/test-public-site-staging.js`（終了コード0）で正常専用staging、境界不正時の`rmSync`／`copyFileSync` 0回、out内入力ファイル保持、checks欠落・別contentDigest拒否を確認した。現行dirty/local-only releaseのcandidate拒否とnew／legacy各1076 filesの通常抽出も維持。C2のclean fixture、candidate record、自動checks生成は未達 | 達成 |

C1は **1/1**。C2は、検査コマンドがdigest付き証拠を生成する入口、clean isolated Git fixtureのcandidate record受理、candidate作成後の成果物変更／実repo dirty拒否が残る。実配信・外部設定・workflow・commit／pushは行っていない。

## 最新判定：U3完了・P5bローカル準備完了（2026-09-14）

| 固定ID | 対応条件 | 証拠・未達 | 判定 |
| --- | --- | --- | --- |
| U3 | 二公開先方式を維持し、release／profile台帳からnew／legacyを別staging rootへdry-run抽出する。legacy baseを二重化せず、newへlegacy／tools／docs等を混入させない。clean sourceCommit、check、期待profile／content digestが揃わない候補を拒否し、workflow案・停止／rollback・外部操作／承認を記録する | `tools/prepare-public-site-staging.js`を追加し、現行`tmp/public-site`のrelease／build台帳を照合して`tmp/public-site-staging/new`と`legacy`へ各1076 filesを抽出。contentDigest `3cd62b1bc1596be7b88b3f714db5f6f6933e95406dec65c9de517133b2935469`、new／legacy output digest `be85e7ddbae8722e`／`3f56dd68eeafcb9f`、SW output hash、profile／base path、sourceCommit `e22f99d7a1c39eb093430944fb2e9314a0097215`、check evidenceが一致し、new legacy混入0、禁止file 0、legacy二重base 0。`tmp/public-site-staging/staging-report.json`を保存。現行releaseは`status=local-only-unpublished`／`dirty=true`のため`candidateAccepted:false`、`--candidate`の終了コード2で拒否した。[`docs/templates/storage-p5b-local-staging.md`](templates/storage-p5b-local-staging.md)へnew／legacy受渡し、workflow非上書き、legacy案内OFF、データを戻さない停止／rollback、repo／権限／token／Pages／DNS／公開承認／移行gate承認を記録。実workflow・外部設定・repo／token／Pages／DNS・実配信は未実施 | 達成 |

U3は**1/1**。U1・U2と合わせて、P5aの保留残件（生成SWのrelease接続、最終hash記録、生成二release更新、生成transfer代表確認）はlocal acceptanceとして閉じた。P5bはlocal staging・手順案・外部操作整理までで、実配信可／公開可とは判定しない。P6は公開Origin、DNS／HTTPS、実機確認が残る。P4 H1／H2と元条件6/6を維持し、次の作業は外部操作と明示承認が必要。

## 最新判定：U2完了・U3着手（2026-09-14）

| 固定ID | 対応条件 | 証拠・未達 | 判定 |
| --- | --- | --- | --- |
| U2 | generatorで実際に二releaseを生成し、同一独立local Originで旧tabのwaiting／自動reloadなし→再起動新版を確認する。現行／直前cacheと無関係cache保持、index aliasのquery/hash正規化、未知URL非転送、生成new／legacy 2 Originの直接／file transfer往復を確認する | `node tools/prepare-public-site-update.js`でold `875b990b55018c14`、隔離`app-cache.js`変更後のnew `3c26d70b3138d982`（new previous=old）を生成。Browserの同一Origin確認はold cache作成後に静的root全体をnewへ切替え、旧tabのURL維持・`waiting:true`／`installed`・自動reloadなし、閉じた新tabの`waiting:false`／`activated`、old／new cacheと`u2-unrelated-cache-sentinel`保持を確認した。生成`/calc/index.html?u2=query#keep`→`/calc/?u2=query#keep`、canonical loopなし、未知path HTTP 404／`Not found`を確認。`node tools/storage-transfer-native-check.js`へroot／path指定を追加し、old生成legacy profile→new生成profileの独立2 Originで実クリック、preview／plan無書込み、受信側backup、明示apply、非空slot/current・保存計算一致、無関係キー保持、同一package download→file input→apply、再起動読込みを確認。結果`tmp/storage-transfer-native-1789312302904.json`は`ok:true`、direct／file／reopenedの受入項目がtrue。`node tools/test-public-site.js`、生成check、validate、HTTP、storage transfer/page、変更JS構文、`git diff --check`は終了コード0。未達はU3のlocal staging準備のみ | 達成 |

U2は**1/1**。P5aの旧生成SW／生成transfer残件はU1・U2証拠で閉じる根拠を得たが、P5aの最終再判定とP5b準備判定はU3後に行う。U3残りは約1作業単位。公開gateはOFF、実配信・外部設定・workflow／CNAME／DNS変更・commit／push・自動実行Goal有効化は行っていない。

## 最新判定：U1完了・U2着手（2026-09-13）

| 固定ID | 対応条件 | 証拠・未達 | 判定 |
| --- | --- | --- | --- |
| U1 | 生成入力から安定releaseを作り、生成SWへcurrent／検査済みprevious cacheを接続する。初回previousなしを許し、source版と最終成果物hashを区別し、同一入力安定・資材変更更新・記録整合を実生成入口で確認する | `tools/generate-public-site.js`がmanifest／route／asset sourceの既存sha256から`releaseInputVersion`、`releaseInputDigest`、`releaseId`、`sourceVersions`を生成し、`service-worker.js`のtemplate定数だけをprofile別出力へ注入。通常出力の検査済みrelease自動参照、`--previous-release`明示入力、同一releaseのprevious再利用を実装した。`node tools/test-public-site.js`終了コード0で隔離fixtureの初回previousなし、同一入力安定、`app.js`変更によるrelease／SW変更、previous ID接続、最終SW file sha256とrelease台帳の一致を確認。標準`generate --check`、`validate-public-site`、`test-public-site-http`、変更JS構文、`git diff --check`も終了コード0。現行releaseは`f8b4ffab9b2119b1`、`local-only-unpublished`、`dirty:true`、content digest `b6ff36585ad9c0a1d06dc3589ca55314c5de4cfe8fc791798784966c1be759e9`、初回previousなし。U2へ先行して`/calc/index.html`等の完全一致pathname正規化とquery/hash保持を生成HTMLへ接続した。storage基準テストは既存P5aで削除済みの`CACHE_PREFIX`要求により停止し、保存実装へは広げていない | 達成 |

U1は**1/1**。P5a-2/3の旧4/4完了記録は今回のU1証拠で無条件公開可とは扱わず、U2で生成二releaseの実SW更新・生成transfer往復を確認する。U2残りは約1作業単位、U3は約1作業単位。公開gateはOFF、P5実配信・外部設定・workflow／CNAME／DNS変更・commit／push・自動実行Goal有効化は行っていない。

## 最新判定：P5a-3完了・P5a完了（2026-09-13）

| 固定ID | 対応条件 | 証拠・未達 | 判定 |
| --- | --- | --- | --- |
| P5a-3 | 新／旧profileを別local OriginでHTTP配信し、全登録入口・静的資材・alias／search／hash、manager／calc／DPS Worker、敵preset、board、同一share payloadの新旧表示・両テーマPNG、data desktop／mobile、生成transfer、SW更新／offline境界、再生成安定性・版整合・不要ファイル混入・関連テスト・手順引渡しを確認する | `node tools/test-public-site.js`、生成`--check`、`node tools/validate-public-site.js`、`node tools/test-public-site-http.js`、共有資材`--check`、`node tools/test-formation-share-image.js`が終了コード0。HTTPは2164登録route／asset・2 local Origin・静的参照・alias・SW gateを確認。ブラウザでは新`http://[::1]:8765/`／旧`http://[::1]:8766/trickcal-manager/`でmanager、通常ダメージ`11`、DPS Worker完了値`6`、敵21/21、Board `Amelia`／`120%`、同一shareの新旧表示と両テーマ`1200×886px` PNG、生成transferのbackup`194107 bytes`、offline manager再起動読込みとtransfer非cacheを確認。既存H2`tmp/storage-transfer-native-1789286377160.json`の正常direct/file復元（`ok:true`、`fileTransfer.inputObserved/restored:true`）を再利用した。対象タブ選択後のviewport設定で実ページ`innerWidth/clientWidth/bodyWidth=390`、`innerHeight=844`、見出し・全導線を取得しmobile幅を確認した。さらに一時SW確認サーバーで同一Originの旧SWを開いたまま新版へ切り替え、`waiting:true`／`waitingState:"installed"`、URL維持・`navigationType:"navigate"`を2.5秒後にも確認した。旧tabを閉じて再起動後は`waiting:false`／`activeState:"activated"`、cache `trickcal-manager-new-root-20260913-p5a2-2`を確認した。別の一時Originでは更新前に作成した`unrelated-cache-sentinel`が新版activate後も保持され、検証用新版cache `trickcal-manager-new-root-20260913-p5a2-3`を確認した。テスト用SW応答以外の生成物は変更していない | 達成 |

P5a-3は主要な生成物・HTTP・機能・共有画像・transfer・mobile実効幅・offline代表・SW waiting更新まで実施し、**1/1達成**とした。manifestのBoard fixtureは実データID`Amelia`へ補正し、`README.md`と`AGENTS.md`へ生成・検査・2 Origin・未公開release・停止／rollback手順を記録した。最新releaseは`status: local-only-unpublished`、`dirty:true`、content digest `e9058bb962a71a5d29199fa72d3f76439df929d0283d041048d1485eef478ff9`、assetVersion `0a46ac2432a434c0`、new／legacy routeVersion `72ca28473781bbd6`／`3bbb03733ce5cea0`である。P5b（実配信準備・外部設定）とP6（公開Origin・実機）は未着手で、別Goalへ引き渡す。実配信、外部設定変更、公開gate、commit／push、自動実行Goal有効化は行わない。

## 最新判定：P5a-2完了・P5a-3着手（2026-09-13）

| 固定ID | 対応条件 | 証拠・判定 | 判定 |
| --- | --- | --- | --- |
| P5a-2 | 生成後の新／旧profileで内部route・画像・Worker・共有iframeを正しいbaseへ解決し、直接／派生資材版、app-cache、Service Worker、transfer／recovery除外を接続する | `node tools/test-public-site.js`、共有資材`--check`、共有／storage回帰、関連JS`node --check`、`node tools/generate-public-site.js --check`、`node tools/validate-public-site.js`が終了コード0。最終`tmp/public-site`は2154 files、digest `28ad0cd1e7118710688557ba1286be498fb39fdc0202d5cd7bd23832b83bdc40`。releaseは`local-only-unpublished`、`dirty:true`、new／legacyのprofile版とderived版を記録し、公開`v`なしのshare URL、待機型SW、所有cache限定、transfer／recovery非cacheを確認 | 達成 |

P5a-2は**1/1**。既存dirty変更を維持し、P5a許可範囲のruntime／path wiring／cache／SW／共有同期／生成・検査toolsだけを変更した。datasheet・ゲーム生成データ・共有codec／永続ID・保存writer・workflow／CNAME／DNS・実配信は変更していない。P5a-3はHTTP全入口・静的資材、別local Originのnew／legacy実ページ、主要機能、同一share payloadのlight／dark PNG、dataのdesktop／mobile、transfer／SW代表、README／AGENTS引渡し手順が残り、約1作業単位。P5b／P6へは加算しない。

## 最新判定：P4 F1完了・P4再判定（2026-09-13）

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| F1 | 直接転送Aの受信後にファイルBを選択しても、Bだけをcodec→preview→plan→applyし、Aへ成功RESULTを送らない。遅延A処理をBへ干渉させず、取消・不正ファイル・適用中ロック・通常directを区別する | `node tools/test-storage-transfer-page.js`で、修正前モデルは`pre-fix complete/RESULT=1`（B plan後にA receipt）、修正後は同じdirect fixtureの実file inputで`fixed rejected/RESULT=0/B-apply`。listener解放、`file-switch` REJECT、遅延A decode拒否、B digestのみのplan/apply、未選択取消時のdirect維持をassert。`node tools/test-storage-transfer.js`、backup/restore/runtime/behavior回帰も成功 | F1のA→B切替・遅延raceはnative未実施。H2既存native成功run`tmp/storage-transfer-native-1789286377160.json`（`ok:true`、独立profile・localhost 2 Originの通常direct/file往復・再起動読込み）を別証拠として再利用し、F1制御へ加算していない | 達成 |

F1は**1/1**。実装は`storage-transfer.js`のpre-APPLYING `sendReject`、`storage-transfer-page.js`のdirect世代／listener解放／digest束縛、`tools/test-storage-transfer-page.js`の修正前後同一fixture反例である。H1 **4/4**、H2 **1/1**を維持し、P4の元条件B-T4a〜fを**6/6**へ再判定した。

開始時の変更境界：開始時の`git status --short`で既存の未コミット変更を確認し、維持した。F1の実装・テスト対象は`storage-transfer.js`、`storage-transfer-page.js`、`tools/test-storage-transfer-page.js`、本台帳、`STATUS.md`、`GOAL.md`に限定した。datasheet、生成データ、保存writer、公開設定、P5実装、commit/pushは対象外である。F1の残作業は0。公開Origin・モバイル実機・狭幅表示とP5a実装は未検証／未着手で、P5aは開始可（従来見積もり2〜3作業単位）。

## 最新判定：F0完了・P5a-1着手（2026-09-13）

| 固定ID | 対応条件 | 証拠・開始判定 | 判定 |
| --- | --- | --- | --- |
| F0-1 | 不正B選択後に旧Aのdecoded／preview／plan／applyを残さず、読込み成功まで復元操作を無効化する。取消・既存ロックは維持 | 修正前の同一`node tools/test-storage-transfer-page.js`は`AssertionError: 不正B後も旧A packageが残っています`（`true !== false`）。修正後は終了コード0で、旧A消去、読込み中の対象なし・操作拒否、不正B後のpreview非表示・plan/apply回数0を確認。F1のA→B回帰も維持 | 達成 |

F0は**1/1**。native追加確認は行わず、制御証拠として記録する。開始時のP5a-1変更境界は`STATUS.md`と同じで、既存dirty変更を維持し、manifest／schema／生成・検査toolsと記録文書だけを対象にする。P5a-1は**0/1**、残り見積もり約1作業単位。

## 最新判定：P5a-1完了・P5a-2着手（2026-09-13）

| 固定ID | 対応条件 | 証拠・開始判定 | 判定 |
| --- | --- | --- | --- |
| P5a-1 | 単一manifestとschemaから、新／旧profileの入口、正規route、index alias、互換alias、target、fixture、明示assets、Service Worker設定を生成計画へ変換し、未知フィールド・source／generator排他・自己redirect・route／alias／reserved／出力衝突を拒否する。生成物は専用tmp子ディレクトリだけへ出力し、docs／xlsx／tests／secretsを混入させない | `node tools/test-public-site.js`終了コード0。`node tools/generate-public-site.js --write`終了コード0、`tmp/public-site` 2151 files、digest `3210654ca0e34c2f94cf28ba0428dfb6af4d7c576c680d83fe554fd4532bdd91`。同一`generate-public-site.js`のvalidation／buildPlan／generate経路で代表反例と安定checkを確認 | 達成 |

P5a-1は**1/1**。変更境界は`STATUS.md`に記録した範囲で、既存dirty変更を維持し、P5a-2のpath wiring／cache／release record／Service Worker挙動とP5a-3のHTTP・画面確認へ進む。P5b/P6へは加算しない。

## 最新判定：P4 H2完了・P4再判定（2026-09-13）

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| H2 | H1合格後、独立profile・2 Originでtools専用fixtureだけを許可し、別controller初期化・保存関数直接呼出しなしで、実クリック、preview/plan無書込み、明示restore、非空slot/currentの育成・編成・保存計算比較、実file往復、新規tab読込みを確認。結果は生保存値なしのtmp要約へ保存 | node --check変更JS、node tools/test-storage-transfer.js、node tools/test-storage-transfer-page.js、node tools/test-storage-backup.js、node tools/test-storage-restore.js、node tools/test-storage-runtime.js、node tools/test-storage-behavior-baseline.js、git diff --checkが成功 | node tools/storage-transfer-native-check.js終了コード0。tmp/storage-transfer-native-1789286377160.jsonのok:true。localhost 2 Origin・独立profileで実転送、受信側適用前backup、固定package保存と直接payload digest一致、非空状態比較、file input復元、target再起動後読込みを確認 | 達成 |

H2は**1/1**。H1a〜dは**4/4**のまま。旧P4の元条件は、既存制御証拠のB-T4a〜dと今回H2 native証拠のB-T4e,fを合わせて**6/6へ再判定済み**。公開Origin・モバイル実機・狭幅表示・P5a以降は未検証。P5aは開始可だが本作業では着手せず、P5実装・公開設定変更・commit/push・自動実行Goal有効化も未実施。

## 最新判定：P4 H1完了・H2前（2026-09-13）

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| H1a | 管理画面の直接転送導線と実行入口を既定OFFにし、隔離toolsだけが有効化できる。URL引数で本番を有効化しない | 'stat-dashboard.html'の'#backup-transfer'をhidden化し、'stat-prototype.js'のlocal gateをloopback＋'TRICKCAL_STORAGE_TRANSFER_TEST_ENABLED'へ限定。'node tools/test-storage-transfer.js'でloopback／公開Origin／URL引数のみの判定を確認 | H2未実施 | 達成（制御） |
| H1b | timeout・採取失敗・通信rejectの適用開始前にtimer/listener/sender参照を解放し、明示クリックで再試行できる。APPLYING以後を再適用可能にしない | 'node tools/test-storage-transfer.js'でtimeout後retry、reject後の明示操作なし再HELLO抑止、APPLYING後REJECTのphase非巻戻しを確認。管理画面は適用前終了時にhandshake/listener/maintenanceを解放 | H2未実施 | 達成（制御） |
| H1c | 適用中のcancel/file/decodeをUIとhandlerで拒否し、失敗後はruntimeの復旧結果を正とする | 'node tools/test-storage-transfer-page.js'で適用中cancel・別package拒否、file UI disable、cancel不能時の'recoveryBlocked'保持を確認。'storage-runtime'／restore既存回帰も成功 | H2未実施 | 達成（制御） |
| H1d | 受信側の置換前backup操作と、送信時に固定した同一packageのファイル保存を既存codec/exportへ接続する | 'node tools/test-storage-transfer-page.js'でruntime exportによる新側backupをdecodeし、受信時の元JSONを同一文字列で保存。'stat-prototype.js'は採取時固定の'backupTransferPackageJson'を送信・保存へ共用。新writer／receipt永続化なし | H2未実施 | 達成（制御） |

H1は**4/4**。変更JS構文、transfer/page、backup、restore、runtime、behavior baseline、'git diff --check'が成功した。H2は**0/1**で、実2 Origin・実クリック・実download/file input・新規tab再起動・非空slot/current比較は未検証。H2の現行runnerは受信側適用前backup、固定package保存、tmp要約レポートを含む状態へ更新済み。旧P4 6/6は無条件継承せず、H2後に元条件へ戻して再判定する。

## 最新判定：P4 T3合格・P4完了（2026-09-13）

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| B-T4e | 独立ブラウザの2 Originで、実クリックから転送・preview・plan・明示apply・receipt・再起動復元を確認。実download/file inputも同じ復元経路で扱い、送信元・受信先の対象外キーを保つ | `node tools/test-storage-transfer.js`、`node tools/test-storage-transfer-page.js`、`node tools/test-storage-runtime.js`。通信のreceipt、preview/planの無書込み、既存runtimeの復元条件を制御環境で確認 | `node tools/storage-transfer-native-check.js`（専用一時profile・専用download先、localhost source/target 2 Origin）。statの実`#backup-transfer`クリック、受信preview→plan→apply、送信元採取完了後不変、受信slot／保存計算／無関係キー保持、実export download→file input→apply、target再起動後boot／保存読込みを確認。結果`ok:true` | 達成 |
| B-T4f | 制御証拠とnative証拠を分離し、通信・実保存完了・ファイル経路・再起動の観測を受入台帳へ記録。未検証の公開Origin／モバイル実機を達成扱いしない | 上記制御テスト群と変更JS構文・`git diff --check`を別runで確認。T3中の初期化スコープ、送信message listener、重複READY、epoch受渡し、採取baseline時点の反例を同じ経路で補修・再確認 | 上記native成功runを別証拠として記録。公開DNS／本番Origin、iOS/Android実機、狭幅表示は未検証として分離 | 達成 |

P4は**6/6（B-T4a〜f）**。G0 3/3、T1 2/2、T2 2/2を維持する。P5は実装せず、route／alias／cache等の設計確認だけを行う。commit/push・自動実行Goal有効化は未実施。

## 最新判定：P4 T2合格・T3開始（2026-09-13）

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| B-T4c | 送受信preview、件数・置換・除外確認、取消、明示apply、採取後maintenance解放を既存pipelineへ接続 | `node tools/test-storage-transfer-page.js`で実codec decode→preview→plan→applyと、明示確認前のapplyなし、receiptのepoch/transactionIdを確認。`stat-dashboard.html`に転送導線、`storage-transfer.html`に確認/取消/復元UIを確認 | 未実施。実クリック・実2 Origin未実施 | 達成（制御） |
| B-T4d | ファイル代替が同じcodec→preview→plan→apply pipelineを使い、復元前取消で保存しない | 同テストでファイル相当のpackage文字列を同じdecode/preview/planへ通し、cancel後にapplyが0回、保存writerの追加なしを確認 | 未実施。実file input未実施 | 達成（制御） |

P4 T2は**2/2**。G0 3/3、T1 2/2を維持する。次はT3でB-T4e,fのみを検証し、P5実装へは進まない。

## 最新判定：P4 T1合格・T2開始（2026-09-13）

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| B-T4a | 2 Originの固定Origin／Window／nonce／transferId／段階／digestを検査し、receiptへpackageDigest・選択・内部transactionId・epochを結合。実保存前の成功応答を受理しない | `node tools/test-storage-transfer.js`。`storage-transfer.js`のsender/receiverを接続し、HELLO→READY→PAYLOAD→PREVIEW→APPLYING→RESULTを確認。異Origin／source、digest・receipt不一致、`committed:false`成功を拒否 | 未実施。HTTP 2 Origin/native未実施 | 達成（制御） |
| B-T4b | 重複payload・ACK欠落・完了後再照会で二重適用せず、通信欠落時に自動rollback／再適用しない | 同テストで受信payload callbackが1回、ACK欠落後の同一digest再送を受理、complete済みreceipt再通知・STATUS_QUERYを確認。異digest再送を拒否 | 未実施 | 達成（制御） |

P4 T1は**2/2**。G0は3/3。次はT2で既存保存pipelineへUIを接続し、T2未達のままT3へ進まない。旧R1〜R5 5/5等の履歴判定は今回のT1判定へ繰り上げない。

## 最新判定：G0合格・P4 T1開始（2026-09-13）

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| G0-1 | 補助除外より前にpayload全体の危険キー・深度・ノード数・外形を検査し、combined反例を受理しない | `node tools/test-storage-backup.js`で未知DPS版＋危険キー、補助不正＋深度超過、補助不正＋余計なdataset項目を同じdecode入口へ投入し、`invalid-data`／`oversize`を確認。安全な未知DPS版の除外は維持。実decode診断も危険キーを`invalid-data`で拒否 | 今回native未実施 | 達成 |
| G0-2 | 本番UI関数の拒否→rollback→preview再表示→同意なし拒否→再確認→再適用を動作で確認 | `node tools/test-storage-restore.js`で`stat-prototype.js`の本番preview/prepare/apply関数を隔離VM実行。保留package維持、除外checkbox未選択、再適用成功を確認。静的文字列検査のみではない | 今回native未実施 | 達成 |
| G0-3 | 実apply保存先→新VM本番loader比較と、省略反例を同じ一致assertへ接続 | `node tools/test-storage-restore.js`で3件のid/name/savedAt/snapshotを共通assert比較。保存省略storage・読込み省略実行の両方が同じassertで失敗することを確認 | 今回native未実施 | 達成 |

G0は**3/3**。旧R1〜R5 5/5、旧P4開始可の記録は履歴であり、今回のG0判定へ無条件継承しない。次はP4 T1、未達ならT2へ進まない。P5実装・公開設定・commit/push・自動実行Goal有効化は未実施。

## 最新訂正：P4前G0が必要（2026-09-13）

[次回指示](storage-p4-luna-instructions.md)のG0を優先。実decodeで未知DPS版＋危険キーがexcludedとして受理される反例を再現したためR3完全合格を撤回。R4は静的確認まで、R5は実保存後正常3件比較を保持するが保存省略／読込省略の共通一致assertは不足。下記5/5をP4開始根拠にしない。G0は0/3、合格後P4 B-T4a〜fを別集計する。今回コード変更なし。

## 最新：R1〜R5限定補修完了・C2再判定（2026-09-13）

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| R1 | 旧`savedStates`をslot absentとして正常出力せず、変換不能時は救出案内付きで拒否。拒否時に復元先を変更しない | `node tools/test-storage-backup.js`、`node tools/test-storage-restore.js`。stored-onlyの旧形式を実codecで拒否し、入力・FakeStorageのslot・他領域・set/removeを不変確認 | 旧形式native未実施。既存の独立救出証拠はC3として別管理 | 達成 |
| R2 | 本番loaderで保持できない日時を正常受理せず、数値日時と既存検査を維持 | `node tools/test-storage-backup.js`、`node tools/test-storage-restore.js`。数値50件、ISO／数値文字列反例、version3・51件・容量超過を確認。修正前loader診断のISO→0も保持 | 今回native日時入力なし | 達成 |
| R3 | 正しいdigestのファイル内補助不正だけを明示除外候補化し、外側/digest/危険/容量/必須を緩和しない | `node tools/test-storage-backup.js`。manual digest packageをdecode→summary→planへ通し、元payloadJson/digest保持、確認なし拒否、確認ありスキップ、必須・危険反例拒否を確認 | 今回native file inputの追加なし | 達成 |
| R4 | rollback後に保留packageのpreviewを再表示し、除外同意を自動復元しない | `node tools/test-storage-restore.js`のUI経路静的確認で、apply/recovery rollback両方の再preview、checkbox未選択リセットを確認 | 今回native rollback操作なし | 達成（制御） |
| R5 | 実apply後の保存先rawを新context本番loaderで全件比較し、保存／読込省略を同じ経路で検出 | `node tools/test-storage-restore.js`。FakeStorageのapply後`calc.resultSaves`を再読込し3件のid/name/savedAt/snapshotを比較。rawを省略したloader結果は不一致で失敗 | native未実施 | 達成（制御） |

今回の限定補修はR1〜R5 **5/5**。C2は重大修正条件を**1/1**へ再判定できる。旧C2 0/1、旧C1〜C3 3/3、旧P4開始可の記録はこの表より前の履歴であり、そのまま継承しない。追加nativeは既知timeoutを反復せず、P4実装・commit/push・自動実行Goal有効化は今回の停止範囲外とした。

## 最新：R2完了・R3〜R5未達（2026-09-13）

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| R2-1 | `calc.resultSaves[].savedAt`を本番loaderで保持可能な数値に限定し、失われる旧日時を正常受理しない | `node tools/test-storage-backup.js`で現行writer相当の50件数値日時を正常作成し、ISO日時・数値文字列を同じcreate/validate入口で`invalid-data`拒否。修正前の実loader診断ではISO日時が`0`になることを再現済み | 今回はnative日時入力を実施していない | 達成 |
| R2-2 | 正常な保存計算件数・snapshot検証と既存拒否境界を維持する | 同テスト、`node tools/test-storage-restore.js`、`node --check storage-backup.js`。50件、version3、51件、容量超過を確認 | native未実施 | 達成 |

R2は2/2（Goal上のスライス判定は1/1）。`name`空／`savedAt`欠落は現行loaderの既定値補完を伴うため、互換変換を追加せずraw値とloader後値を分けて扱う残条件とした。R3〜R5は未達で、C2完了・P4開始可とは判定しない。

## 最新：R1完了・R2〜R5未達（2026-09-13）

旧形式の保存枠を`absent`として正常出力する反例を、修正前の本番codec診断で確認した。R1では安全なconverterをbackup側へ推測複製せず、旧形式移行に依存する`legacy.savedStates`がslotStore不在時に存在する場合は通常backupを`recovery-required`で止め、救出形式へ誘導する。

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| R1-1 | slotStore不在・legacy `savedStates`有りを`stat.slots: absent`として正常出力しない | `node tools/test-storage-backup.js`の実`createBackupPackageFromEntries`で`stored-only`入力を同じcodec入口へ通し、`recovery-required`・救出案内を確認。空の`savedStates`のみabsent成功 | 今回は旧形式native入力を実施していない | 達成 |
| R1-2 | 通常backup拒否時に元入力と復元先既存slotを変更しない | `node tools/test-storage-restore.js`で同じ拒否結果を確認し、FakeStorageのslot・他領域不変、`setItem`／`removeItem`試行なしを確認 | 今回はnative復元を実行していない | 達成 |

R1は2/2（Goal上のスライス判定は1/1）。現時点では旧形式をcanonical slotへ変換する機能は提供せず、管理画面の既存移行または独立救出を利用する安全拒否である。R2〜R5は未達のまま保持し、C2完了・P4開始可とは判定しない。

## 最新訂正：C2未達（2026-09-13再レビュー）

[R1〜R5](storage-critical-fixes-review-20260913.md)により下記3/3完了判定を撤回する。C2は旧保存枠の採取欠落、計算日時のloader不一致、ファイル側の補助除外・再試行・実保存後loader証拠が未達。C1/C3既存証拠は維持し今回未再検証。既存達成2/3、限定補修後に再判定する。

## 最新最終判定：重大修正C1〜C3（2026-09-13）

下表を修正限定Goalの最終判定とする。後続のC1「1/3」・C2「2/3」は各スライス終了時点の履歴であり、最終判定へ繰り上げない。制御とnativeの証拠を分離し、native全runnerの終了コードを個別checkの成功へ置き換えていない。

再監査でC1の旧runtime保存不可を追加確認した。`node tools/test-storage-runtime.js`の`testOldRuntimeCannotSaveAfterRestoreEpoch`が、meta世代変更後の本番runtime write入口を`stale`で拒否し、対象保存値を不変に保つことを確認している。C2補修では補助設定の明示除外と、実runtimeのcodec→plan→apply→新context loader経路を追加確認し、下表を更新した。

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| C1 | 復元後sessionの再構成、世代違いのstale保存拒否、local/無関係session保持 | `node tools/test-storage-runtime.js`。旧session、許可キー再構成、無関係キー保持、再構成失敗停止を確認 | 独立profileの新規tab代表でboot=ready、旧session除去、marker再構成を確認 | 達成 |
| C2 | canonical slots/current、mirror選択、運用ID/revision再生成、保存計算結果全件保持、未対応版・50件超拒否、補助設定の明示除外時だけ対象キー不変 | `node tools/test-storage-backup.js`、`node tools/test-storage-restore.js`、`node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-runtime.js`。別VMの本番loader、実runtimeのplan→apply後loader、保存省略・version3・上限超過・補助不正の確認なし／あり反例を確認 | 独立profileでDPS対象A→B→A・再読込・計算結果UI保存/読込、stat backup/apply/reload代表を確認 | 達成 |
| C3 | 起動失敗・壊れたjournal・Lock非依存の独立救出、読取失敗明示、保存キー書込みゼロ、実download | `node tools/test-storage-runtime.js`。boot/maintenance/flushなしの直接救出、壊れたjournal、read-failed、local/session不変を確認 | `standaloneRescue.ok=true`。復旧ページで壊れたjournalを保持し、通常boot未実行、storage不変、救出ファイル実downloadを確認 | 達成 |

修正限定Goalの達成条件：**3/3**。変更影響範囲の既存transaction回帰も制御テストで成功した。最新native全runnerの終了コード1はfocus/visibility、stat確認、lifecycleの前面状態・タイミング依存として未検証欄へ分離し、同じtimeoutは反復していない。P4実装、追加native検証、commit/push、自動実行Goal有効化は本台帳の範囲外。

## 最新追記：重大修正C1（2026-09-13）

修正限定Goalの固定条件はC1〜C3の3条件。旧R4-3完了・P3残り0の記録は履歴であり、今回の判定へ繰り上げない。

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| C1 / A-T6 | 復元後の新runtimeが空marker・世代違いをsession再構成して起動。旧runtimeはstale保存不可。local/無関係sessionを保持 | `node tools/test-storage-runtime.js`。restoreSerial=1の旧session起動、許可3キー削除、無関係キー/local保持、Locksありshared、session削除失敗blocked | 専用runnerの`storageFreshTabAfterRestore`成功。復元→同一tab再読込→別新規tabのboot=ready、marker再構成、旧session固有値除去、stat初期化。全runnerの既知lifecycle timeoutとは分離 | 達成 |

C1は1/3。C2/C3の実装・native確認は未着手。C1 native runner全体終了コードは`storageAppLifecycle`の既知timeoutで1だが、C1個別check成功を全体0へ改変していない。C1のsession再構成失敗nativeは未検証。

## 最新追記：重大修正C2（2026-09-13）

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| C2 / B-T4 | slots/currentをcanonical形式で採取・再構成し、mirrorの選択、運用ID/revision再生成、保存計算結果全件保持、不正・未対応版・50件超拒否を確認 | `node tools/test-storage-backup.js`、`node tools/test-storage-restore.js`、`node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-runtime.js`。6 slot、current-tabのworkspace優先、stored-onlyのlive優先→legacy fallback、slotStore/workspace/live/legacy再構成、保存計算50件の別VM実loader復元、50件超・snapshot version3拒否、保存省略import反例を同じ入口で確認 | 独立profile・localhostの最新runnerで`dpsApplication.ok=true`（DPS起動・対象A→B→A・再読込・計算結果UI保存→読込、snapshot version4）、`statBackup.ok=true`（実backup download/file input、preview/取消不変、canonical backup restore/apply/reload）、`statBrowserQuota.ok=true`、`storageFreshTabAfterRestore.ok=true`、`storageBootGuard.ok=true`。runner全体の終了コード1は既知`storageAppLifecycle` timeoutのみ | 達成 |

C2は2/3。nativeの個別check成功を全体終了コードへ繰り上げていない。保存計算の完全再現はid/name/savedAt/snapshotを必須保護とし、補助DPS設定の意味的完全再現は今回の修正条件外としてraw JSON保護に限定した。C3（独立救出）は未着手。

## 最新判定：R1/R2/R3/R4-1/R4-2/R4-3完了（2026-09-13）

P2全体完了を撤回した状態は維持する。旧成功観測や旧集計は履歴として保持するが、現在の判定は下記のR4-3固定ID記録を含む最新証拠を正とする。最新指示は[storage-p3-luna-goal.md](storage-p3-luna-goal.md)。復元transaction、確認UI、救出、native代表、実ブラウザquota安全停止まで確認済みである。

| ID | 条件 | 現在 |
| --- | --- | --- |
| R1-1 | 起動catch修正・起動前例外監視（A-T3/5） | 達成：実stat script評価とReferenceError反例、変更JS構文を確認 |
| R1-2 | 破損slot保持・不存在と分離（Gate A第2節） | 達成：実load/persist入口でrecovery-required、raw保持、不存在時migration維持を確認 |
| R1-3 | hidden後の再編集をpagehideで保存（A-T2） | 達成：実runtime participant・仮想時計でhidden→visible→再編集→pagehideを確認 |
| R1-4 | DPS読取/保存失敗通知・既存値保持（A-T5） | 達成：DPS prototype/legacyの実load/save入口で失敗結果・通知・raw保持を確認 |
| R2 | P2契約/実入口/証拠の再照合 | 達成：固定R2-1〜R2-3、制御とnativeを分離 |
| R3-1 | backup codec/validator・12 dataset・反例 | 達成：制御 `node tools/test-storage-backup.js` |
| R3-2 | 実ファイル出力・入力・preview・取消・storage不変 | 達成：制御＋native stat backup個別check |
| R3-3 | 6 slot・実計算保存50件・before journalのcodec容量 | 達成：制御測定、quota往復は未検証 |
| R3 | 採取・検証・確認UI・容量（B-T1/2/3） | 達成：R3-1〜R3-3の3/3 |
| R4-1 | 復元transaction・rollback・session-pending recovery（A-T4/5/6） | 達成：制御 `node tools/test-storage-restore.js` |
| R4-2 | restore確認UI・独立復旧入口・取消 | 達成：実装・制御。nativeはR4-3で確認 |
| R4-3-1 | A-T4：prepared/applying/local/meta/commit/session/journal各境界 | 達成：操作×キー別失敗注入、rollback/session-pending/rebootを同じ`applyRestore`入口で確認 |
| R4-3-2 | A-T5：quota/oversize/失敗分類・秘密値保護・早出しなし | 達成：制御のquota/16MiB超journal区別とnative Chrome quota安全停止、失敗UI/ログを確認 |
| R4-3-3 | A-T6：対象外領域・未知キー・control key保護 | 達成：制御・nativeで別slot/別local/session/無関係キー不変を確認 |
| R4-3-4 | B-T1：実UIのpreview/取消/restore/apply/reload・救出形式 | 達成：専用Chromeで実download/file input、preview/取消不変、救出、復元・再読込を確認 |
| R4-3-5 | B-T3：最大容量・readback/reboot・quota安全停止 | 達成：codec容量、制御quota、native Chrome quota、readback/rebootを確認 |
| R4-3-6 | native代表：Lock/lifecycle/boot guardとDPS代表 | 達成：最新runでLock/DPS/boot guard、既存成功runで実アプリlifecycleを確認。fixture timeoutは別管理 |
| R4-3 | quota/各故障注入・救出・native復元 | 達成：R4-3-1〜6の6/6 |
| R4 | 復元・中断復旧・救出（A-T4/5/6、B-T1/3） | 達成：R4-1〜R4-3の必須条件を確認 |

R1達成4/4、R2達成3/3、R3達成3/3、R4-1達成1/1、R4-2達成1/1、R4-3達成6/6。旧G3/P2完了判定や固定条件の旧集計を現在のR4判定へ繰り上げず、今回の実装・制御・native証拠でP3を完了とする。

## R4-3実行記録（2026-09-13）

開始時の変更境界：既存の未コミット変更を維持した。今回の実装・検証対象は`storage-runtime.js`、`tools/test-storage-restore.js`、`tools/storage-native-browser-check.js`、および本台帳・`STATUS.md`・`GOAL.md`・R4関連文書。既存画面writer、datasheet、生成データ、公開設定、P4以降は変更していない。

| 固定ID | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- |
| R4-3-1 / A-T4 | `node tools/test-storage-restore.js`。prepared/applying journal、local各set/readback/final readback、remove、meta、commit、session各書込/削除、journal削除/再試行を操作×キー別に注入。rollback、session-pending、再起動復旧、保存省略反例を確認 | nativeは代表UIで適用・再読込を確認。個別失敗注入は制御で扱う | 達成 |
| R4-3-2 / A-T5 | 同テストで`QuotaExceededError`→`quota`、journal 16MiB超→`oversize`、read/write/remove/unsupported系を区別。成功UI/COMMITTEDの早出しなし、ログにraw/snapshotなし | native statでChromeに4,718,592文字の一時フィラーを書き、`QuotaExceededError`、quota表示、元データ/journal不変、「元の状態へ戻しました」を確認 | 達成 |
| R4-3-3 / A-T6 | 対象外local/session、別slot、無関係キー、control keyを保持。未知ID・保存処理を抜いた反例を同じ入口で拒否 | native statで`native-restore-unrelated-key`、journal、slot/workspaceを確認 | 達成 |
| R4-3-4 / B-T1 | `node tools/test-storage-backup.js`、`node tools/test-storage-runtime.js`で12 dataset、救出形式、plan/applyを確認 | `node tools/storage-native-browser-check.js --summary`の`statBackup`で実download/file input、previewStorageUnchanged、cancelStorageUnchanged、rescue format、restore apply/reload、draft復元を確認 | 達成 |
| R4-3-5 / B-T3 | package 1,861,098 bytes、payload 1,475,105 bytes、before journal 1,473,776 bytes、入力上限、制御quota、readback/rebootを確認 | 実Storageのapply/readback/rebootと、満杯にした隔離OriginでのChrome quota安全停止を確認 | 達成 |
| R4-3-6 / native代表 | 既存runtime/behavior回帰と構文確認 | 最新runでpage/dom/json/download/storageEvent/focus・visibility、stat、Lock、DPS、boot guardが成功。`storageAppLifecycle`は最新runのみtimeoutだが、既存別runの実アプリhidden/visible・pagehide/pageshow成功を再利用 | 達成（個別check） |

最新native runの終了コードは`focusVisibility`と`storageAppLifecycle`の前面/target切替依存だけで1だったが、`statBrowserQuota`を含むR4-3必須個別checkは成功した。個別check成功を全体終了コード0へ改変しておらず、同じtimeoutも反復していない。native lifecycleは既存成功runの証拠を再利用し、quotaは今回の実Chrome検査で補完した。

## R3実行記録（2026-09-13）

開始境界：開始時の既存dirty変更を維持した。R3の実装対象は`storage-backup.js`、`storage-runtime.js`、`stat-dashboard.html`、`stat-prototype.js`、`stat-dashboard.css`、`tools/test-storage-backup.js`、`tools/test-storage-runtime.js`、`tools/storage-native-browser-check.js`と、実施記録を更新する本台帳、`STATUS.md`、`GOAL.md`、`docs/storage-p3-luna-goal.md`、`docs/storage-backup-format.md`、`docs/storage-native-browser-environment.md`。通常保存動作、datasheet、生成物、公開設定、R4復元、commit/pushは変更境界外とした。

| 固定ID | 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| R3-1 | codec/validator、12 dataset、present/absent、source mode、旧形式区別、未知版/型/ID/破損/digest/上限 | `node tools/test-storage-backup.js`。12項目、空配列/0/不在、old slot/rescue形式、危険キー、過大値・過大入力を同じdecode/validate入口で確認。`node tools/test-storage-runtime.js`でruntime export接続も確認 | 直接のnative判定対象ではない。stat backup UIが同じcodecを呼ぶことを本番ページで確認 | 達成 |
| R3-2 | file export/input、確認preview、取消、確認前・取消時の書込ゼロ | `node tools/test-storage-runtime.js`、`node tools/test-storage-behavior-baseline.js`。stored-onlyでdraftを除外し、既存writer回帰を確認 | 専用profile/localhostの`statBackup`個別checkが成功。実download 695,499 bytes、12 dataset preview、previewStorageUnchanged=true、cancelStorageUnchanged=true。全runnerの終了コード1は補助fixture focus/visibilityとlifecycleタイミングの既知失敗を含むため、statBackup個別成功へ繰り上げない | 達成 |
| R3-3 | 最大育成6 slot、設定、計算保存50件、before journalのcodec容量と上限 | `node tools/test-storage-backup.js`。package 1,861,098 bytes、payload 1,475,105 bytes、before journal 1,473,776 bytes。8 MiB package/payload、16 MiB journal上限内。上限超過反例は同じcodec入口で拒否 | ブラウザquota・journal実確保はR4対象でありnative未検証 | 達成（codec測定） |

R3達成3/3。変更JSの構文確認、`node tools/test-storage-backup.js`、`node tools/test-storage-runtime.js`、`node tools/test-storage-behavior-baseline.js`、`git diff --check`が成功した。`git diff --check`の既存CRLF/LF変換警告以外に差分エラーはない。未検証は実Storageへのrestore/readback、再起動後一致、transaction rollback、quota失敗、救出形式出力、公開service-worker cache反映、Origin転送、スマホ実機である。R4ではこれらを別条件として扱う。

## R4-1実行記録（2026-09-13）

| 固定ID | 対応条件 | 制御証拠 | 判定 |
| --- | --- | --- | --- |
| R4-1 | prepared/applying/committed/session-pending/complete、commit前rollback、session-pending再開、対象外キー保護 | `node tools/test-storage-restore.js`。正常適用、meta書込み失敗→rollback、rollback中journal削除失敗→新runtime boot復旧、commit後workspace失敗→session-pending→新runtime boot復旧、壊れたjournal保持・boot停止を実storage入口で確認 | 達成 |

R4-1達成1/1。journalはbefore/after hash/new epoch/receipt/pending workspaceを保持し、phaseを除くdigestをreadbackした。通常保存APIからcontrol keyを直接書き換えず、rollback不能またはsession再構成不能時に成功を返さない。native UI、quota、救出はR4-2/R4-3へ残す。

## R4-2実行記録（2026-09-13）

| 固定ID | 対応条件 | 制御・静的証拠 | native証拠 | 判定 |
| --- | --- | --- | --- | --- |
| R4-2 | restore確認UI、表示設定選択、対象確認後のapply、取消、独立復旧入口 | `stat-dashboard.html`/`stat-prototype.js`の二段階UI、`storage-recovery.html`の通常boot非依存入口。`node tools/test-storage-restore.js`で`inspectPendingRecovery/recoverPendingJournal`を確認。preview/plan/cancelはapply前にユーザーキーを変更しない | nativeの実UI適用・取消・再起動はR4-3で確認 | 達成（実装・制御） |

R4-2達成1/1（実装・制御）。ファイル確認時はpreviewだけを表示し、復元対象確認では対象dataset、上書き/削除、表示設定ON/OFF、下書き扱いを表示する。最終apply完了後だけ成功表示とreload導線を出し、journalが残る失敗では画面を閉じず独立復旧入口を案内する。native UI・quota・救出・公開Originは未検証のままR4-3へ引き継ぐ。

## R2再判定記録（2026-09-13）

| 対応条件 | 制御証拠 | native証拠 | 判定 |
| --- | --- | --- | --- |
| R2-1 / 契約・19キー・全access・boot接続 | `node tools/inspect-storage.js`（19 keys／5 channels／58 accesses）、behavior/runtime基準、変更JS構文 | 本番ページをbootstrap後に起動 | 達成 |
| R2-2 / 部分失敗・epoch/journal・participant/lifecycle | `node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-runtime.js`。read/write/parse、保存順・通知・flush、未知journal・staleを同一入口で確認 | 2タブbusy、hidden保持、pagehide解放、pageshow再boot、未知journal停止 | 達成 |
| R2-3 / 本番代表と証拠分離 | `node tools/storage-native-browser-check.js`の制御対象をnativeへ繰り上げず、検査・behavior・nativeを別記録 | 専用一時profileでstat保存/draft/export/import、slot不変、DPS A→B→A・再読込、Lock/lifecycleを終了コード0で確認 | 達成 |

R2達成3/3。`test-storage-baseline.js`は多数のAST反例を同一入口で反復して長時間無出力となったため、今回のR2合格根拠には採用せず未実行として残す。inspection本体は`inspect-storage.js`で成功している。R3は実backup packageと容量実測を新規証拠として追加する。

## 最新実行記録：G3 / P2後半・接続とnative代表（2026-09-13）

開始時の既存dirty変更は維持し、G3接続対象と検査toolsだけを扱った。datasheet、生成データ、公開設定、P3復元、commit/pushは対象外。制御とnativeの証拠を分け、native全体が終了コード1の場合に個別成功を全体成功へ繰り上げない。

| 対応条件 | 実行証拠 | 判定 |
| --- | --- | --- |
| G3-1 / boot・registry・cache接続 | `node tools/test-storage-baseline.js`（19 keys／5 channels／58 accesses）、`node tools/inspect-storage.js`。7ページの`storage-bootstrap.js`先行読込、registry/runtime/bootstrapのapp-cache登録、service-worker版同期を確認 | 達成（制御／静的） |
| G3-2 / 管理writer・slot・export/import | `node tools/test-storage-behavior-baseline.js`で実save/flush/persist、workspace/live/legacy、revision・通知・保存順・他領域不変。nativeでslot1保存、draft、実export、実file input、slot2適用status、slot1再export一致を確認 | 達成（制御＋native代表） |
| G3-3 / 計算・DPS writer・対象切替 | behavior baselineの実保存・`loadDpsSettingsStore`新context復元、nativeのDPS起動・計算・Momo→Sylla→Momo・設定変更・再読込復元 | 達成（制御＋native代表） |
| G3-4 / 表示設定・読取consumer | 全productionSourcesを本番と反例の共通検査入口で照合し、`node tools/test-storage-baseline.js`・`inspect-storage.js`を成功。enemy/board/share/image-preloadのboot前起動を拒否する順序を確認 | 達成（制御／静的） |
| G3-5 / A-T1 native shared/exclusive | 専用一時Chromeの`statRuntimeLocks`で、2タブshared保持中`beginMaintenance`が`{ok:false,code:'busy'}`、片方終了後exclusive取得、cancel後shared復帰、preflight実Facade flush成功を確認 | 達成（native） |
| G3-6 / A-T2 lifecycle | `storageAppLifecycle`で実アプリのhidden／visible、hidden中exclusive busy、実navigateのpagehide後shared解放・peer exclusive取得・cancel、history復帰後stat pageshow・再bootを確認。fixture focusはrun間で不安定だが、別runの成功証拠とアプリ実経路を分離 | 達成（native） |
| G3-7 / A-T3 boot guard | `storageBootGuard`で未知version journalを実Originへ設定して再読込し、`recovery-required`、error画面、journal保持、`#apostle-select`未起動を確認 | 達成（native） |
| G3-8 / A-T5 failure UI・秘密値保護 | runtime/behavior/baselineで失敗コード分類、保存省略反例、loggerにraw value/snapshotなし、未知参照反例を確認。native console/exception/dialogErrorsは空 | 達成（制御＋native代表） |
| G3-9 / A-T6領域保護 | registry、baseline、runtimeで別slot・別local/session・control key・未知IDの不変／拒否を確認。native statの別slot再export一致とruntime Lockを確認 | 達成（制御＋native代表） |

native全体の直近実行は`node tools/storage-native-browser-check.js`終了コード1だが、失敗は補助fixtureのfocus/visibility一項目のみ。別runではfixtureの実focus/visibilityも成功し、今回の実アプリlifecycleとboot guardは個別checkで成功した。HTTP/CDP/権限/file input/download/dialog/stat/DPS/Lockの阻害はない。G3-1〜4、A-T1〜A-T3、A-T5/A-T6のP2対象条件を達成し、P2を完了判定する。A-T4/P3復元境界、quota、Origin転送、スマホ実機は後続範囲。

## 最新実行記録：G2 / P2前半・保存共通層（2026-09-13）

| 対応条件 | 実行証拠 | 判定 |
| --- | --- | --- |
| G2-1 / Gate A 1：registry・現行19キー照合 | `node tools/test-storage-runtime.js`で`tools/storage-inventory.json`の19 entriesとregistryのid/area/keyを完全照合。control.meta、control.journal、control.sessionEpochの3制御項目、raw-string codec、未知ID拒否も確認 | 達成 |
| G2-2 / Gate A 2：構造化Result・同期raw API | 同テストで`readRaw`／`writeRaw`／`removeRaw`の成功、null読取、文字列型拒否、read/write/remove例外、QuotaExceededError分類を確認。失敗結果はcode／operation／id／retryableを持ち、値を含めない | 達成 |
| G2-3 / Gate A 3：boot・epoch・session marker | Web Locksありの初回meta生成→exclusive解放→shared再取得→readback、既存meta、LockManager拒否時の互換保存、stale epoch／旧session markerを同テストで確認 | 達成（制御） |
| G2-4 / A-T3：未許可書込・journal guard | 未boot、meta破損、journal破損・未知version・存在、session epoch不一致、control key直接書換えを同じruntime経路で拒否。journalを削除・上書きしないことを確認 | 達成（P2制御部分） |
| G2-5 / A-T5：失敗境界 | read failure、write failure、remove failure、quota、flush failure、unsupported、busy、recovery-requiredを狙った入力で別コードへ分岐。loggerにraw value／snapshotを出さないことを確認 | 達成（P2制御部分） |
| G2-6 / A-T6：共有排他・participant | Fake Web Locksでshared同時保持、maintenance exclusiveのbusy→解放後取得、freeze→flush→resume、cancel後shared復帰を確認。未知ID・control ID以外へ領域外アクセスを行わない | 達成（制御） |
| G2-7 / 回帰・反例 | `node tools/test-storage-behavior-baseline.js`、3ファイルの`node --check`、`git diff --check`が成功。正常経路だけでなく各反例を同一runtime APIへ通した | 達成 |

G2は7/7達成。P2前半の成果は保存共通層の単体／制御境界までであり、既存アプリwriterへの接続、実ブラウザLock、pagehide/pageshow、native 2タブ、backup/restore/journal適用は未着手または後続条件である。G3ではfixture・Fake Lockの結果を本番合格へ繰り上げず、管理→計算/DPS→表示/読取consumerの接続とnative A-T1〜3を別証拠として記録する。

## 最新実行記録：G1 / P1b残件解消（2026-09-13）

| 対応条件 | 実行証拠 | 判定 |
| --- | --- | --- |
| G1 / P1B-1 実export/import・旧形式・他領域不変 | 制御は`node tools/test-storage-behavior-baseline.js`で実`saveState→flushPendingStateSave→persistState`、公開担当/visibility分岐、対象slot revision・通知・保存順・他slot/別local/session不変、保存省略反例を同じassertで確認。nativeは専用Chromeで実UI slot1保存→未保存draft→実export→file input→slot2選択→confirm→「スロット2にインポートしました」→slot2 active表示→slot1再export内容一致まで確認 | 達成（制御＋native） |
| G1 / P1B-2 起動fallback・旧形式・他領域 | 制御基準で`loadState()`のworkspace優先、workspaceなし/破損legacy fallback、旧`savedStates`移行、他領域不変を確認。nativeは同一専用Originで実ページを起動 | 達成（制御＋native代表） |
| G1 / P1B-3 DPS起動・対象切替・復元 | 制御は実`PrototypeDpsController.refreshAvailability()`＋新contextの実`loadDpsSettingsStore`、Momo/Sylla独立、読込省略反例を確認。nativeは実UI Momo→Sylla→Momo、Momo 30秒/AUTO、Sylla 90秒/OFF→60秒、Momo切替前/再読込後復元を確認 | 達成（制御＋native代表） |
| G1 / native検証環境 | `node tools/storage-native-browser-check.js`終了コード0。fixture 5項目、stat/DPS本番代表が成功。専用profile・localhost・実file input・実download・実confirmを使用し、検証器側の可視性/座標/前面化/同一ファイル更新検出を補正 | 達成 |

G1達成条件は1/1、P1B-1〜3は3/3。これは旧P1b判定の継承ではなく、上記の補正後経路を一度実行した結果である。未検証はP2共通層/実Lock/全writer接続、P3以降のbackup・quota・Origin転送・スマホ実機。native stat slot2の再読込復元は補足候補として残す。

## 最新実行記録：P1b補修・本番代表確認（2026-09-13）

旧P1bの「制御3/3」をそのままnative合格へ継承しない。P1aのL1〜L3は3/3を維持し、P1bは制御証拠とnative証拠を分離して今回の実行結果から再判定した。

| 対応条件 | 実行証拠 | 判定 |
| --- | --- | --- |
| P1B-1 実export/import・旧形式・他領域不変 | 制御側は実`saveState`→`flushPendingStateSave`→`persistState`を含む実import経路を通し、公開担当・表示状態別のworkspace/live/legacy、対象slot revision、通知・保存順、他slot・別local/sessionキーを確認。保存省略反例も同じassertionで失敗。native側は実UI保存・draft・export・file input・インポート先表示まで成功したが、slot2適用完了は未達 | 達成（制御）／native一部未達 |
| P1B-2 起動fallback・旧savedStates移行 | 同テストで実`loadState()`のworkspace優先、workspaceなし／破損時legacy fallback、明示slot維持、slot storeなしの旧`savedStates`移行を実行。各経路で別local/sessionキー不変をassert | 達成（制御） |
| P1B-3 DPS起動・対象切替 | 制御側は実`PrototypeDpsController.refreshAvailability()`と実`loadDpsSettingsStore`を新contextへ接続し、Momo／Syllaの設定独立・読込省略反例を確認。native側もDPS起動・計算・Momo→Sylla→Momo・再読込後のMomo設定復元を確認 | 達成（制御＋native代表） |

制御証拠は`node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-baseline.js`、変更JSの`node --check`で確認した。native証拠は`tools/storage-native-browser-check.js`の専用Chrome実行に分けた。fixtureは5/5成功、本番DPS代表は成功、本番statは保存・export・file input・import先表示まで成功した。stat slot2適用完了・適用後保存・native別slot不変は、slot2クリック後のnative確認または本番処理が応答せず未達。HTTP／CDP／専用profile／file input投入は成功し、同じタイムアウトは反復していない。

P1b補修後の固定41条件は、今回のnative補足で分母を変更せず、達成31、部分8、未検証0、阻害2を維持する。制御の実import／DPS再起動復元をnative未達へ繰り上げず、逆にnative代表成功を制御条件へ二重計上していない。これは旧25/41や旧P1b 3/3の継承ではない。P2実装・完全backup・quota・Origin転送には進んでいない。

## 最新実行記録：P1a（2026-09-13）

対応条件はL1〜L3の3件、達成3/3。固定41条件の旧集計値を更新根拠にはせず、既存行のnative未検証・部分・阻害を達成へ繰り上げない。

| 条件 | 実行証拠 | 判定 |
| --- | --- | --- |
| L1 実イベント・仮想時計・実保存 | `test-storage-behavior-baseline.js`。実`persistState`、実Storage、仮想119/120ms、実`init`由来のblur/visibilitychange/pagehide/beforeunload callbackを接続。flush後の追加保存なしを実Storageログで確認 | 達成 |
| L2 操作・キー別の独立失敗 | 同テスト。`method:key`の失敗注入でsession workspace write、live read、live write、legacy writeを個別実行。残存値、保存順、revision、通知、戻り値を同一ログで確認 | 達成 |
| L3 全検査入口のコメント・反例 | `test-storage-baseline.js`。本番`inspectStorageProject`でコメントoverlayを成功、動的キー・再代入別名・未知storage引数・動的methodを同じ探索→解析→契約→台帳照合で拒否 | 達成 |

実行済み：`node --check` 3件、`node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-baseline.js`。未検証：nativeイベント、実Lock、quota、実export/import、P1b全入口。今回変更は検査toolsと記録文書のみで、アプリ保存コード・datasheet・生成物・公開設定は変更していない。残りはP1b→P2〜P6で、全体初期目安約10作業単位。P1a終了後は停止し、P1bへ自動で進まない。

> P1a以前の記録：N1〜N3完全合格と下記25/41集計は撤回。DET-1eの全入口でのコメント誤検出、DET-3aの一部反例の未接続、BEH-3/4の実タイマー接続・独立失敗注入不足を残していた。P1aの結果は上の「最新実行記録」に記録し、下表の固定41条件と混同しない。

> P1a以前の記録：[土台修正設計](storage-s1-foundation-plan.md)に基づき、旧25/41・DET-1〜3達成という判定は撤回し、N1→N3後の固定41行を再照合した。P1aの結果は上の「最新実行記録」に記録し、制御テストをnativeブラウザ条件の達成へ繰り上げない。

更新日: 2026-09-13

保存保守・移行ロードマップのC1/C2基準を、重複計上しない固定IDへ展開した受入台帳です。現行の実施指示は[S1再計画・実装指示](storage-s1-closure-instructions.md)。保存動作、datasheet、公開設定はこの台帳の対象外です。

判定は次の意味に固定します。

- **達成**: 指定された実コード入口または本番ブラウザ操作を実行し、期待値をassertionまたは観測記録で確認した。
- **部分**: 条件の一部、または代替境界を含む確認まで。残りを達成へ数えない。
- **静的確認のみ**: ソース・台帳・構造を確認したが、要求された実行経路を通していない。
- **未検証**: 実行証拠がない。
- **阻害**: 検証を試みたが、具体的な環境・入力制約で判定できない。

## 固定条件と現状

| ID | 必須条件 | 実入口・証拠 | 代替境界／未達理由 | 判定 |
| --- | --- | --- | --- | --- |
| DET-1a | 直接・定数・optional/computed・window/globalThis・template実行式を検出 | `test-storage-baseline.js`のfixture、`storage-access-detector.js` | AST解析のみ | 達成 |
| DET-1b | 動的連結・再代入・shadowing・未解決storageを既知値へ丸めず止める | `test-storage-baseline.js`の連結／再代入／shadowing／parameter反例 | 隔離ソース | 達成 |
| DET-1c | storageの引渡し・container格納・return/exportを無検出で通さない | `inspectStorageProject`で正規呼出しを残したstorage引渡し、container、return/default export overlayを検査 | 一般JSの完全な追跡はしない | 達成 |
| DET-1d | clear・動的／unsupported method・IndexedDBの扱いを台帳と一致させる | clear／dynamic method assertion、直接コードと台帳の照合 | IndexedDB不導入は静的確認 | 部分 |
| DET-1e | コメント・HTMLコメント・無関係な同名値を誤検出しない | HTMLコメント／コメント内偽アクセス、`inspectStorageProject`の本番source overlayコメント追加、無関係な同名値 | 隔離fixture | 達成 |
| DET-2a | 登録helperの全直接／単純別名呼出しを列挙する | `storage-inspection.js`のbinding ID照合と正規呼出しを残したhelper overlay | 同一ファイル内の静的範囲 | 達成 |
| DET-2b | helperのキー・保存領域・引数位置を契約照合する | 既知キー別名・動的キー・直接／helper領域違いを共通入口で検査 | 契約外は停止 | 達成 |
| DET-2c | helperのobject格納・call/apply/bind・return/export・未知関数引渡しを止める | object／array／spread、call/apply/bind、return、named export、未知関数の実ファイルoverlay | 参照地点で停止する方式 | 達成 |
| DET-3a | 反例を探索→解析→契約→台帳照合の全入口へ通す | `inspectStorageProject`を本番・overlay・隔離candidateで共用し、動的キー・再代入別名・未知storage引数・動的methodも同じ入口で拒否。正常0／反例診断をassert | N2の参照漏れは別条件として未達保持 | 達成 |
| DET-3b | 台帳から独立した候補探索が未登録候補を検出する | 隔離rootの`new-storage-writer.js`を共通入口で探索し、未登録診断を確認 | 一時ファイルのみ | 達成 |
| DET-3c | Pages除外・本番source・全access siteの照合を維持する | `storage-inspection.js`内でPages除外、source、entry／failureMatrix/access siteを照合 | なし | 達成 |
| INV-1a | 全保存キーとreader/writer/ownerの存在・現行コード根拠を確認する | `storage-inspection.js`のentry・source・key照合と`test-storage-baseline.js`の正常実行 | 台帳と静的コード照合 | 達成 |
| INV-1b | operation・保存領域・access site・関数を一致させる | `storage-inspection.js`のaccess／領域／operation／failureMatrix照合、既知キー新writer反例 | 実行時全分岐ではない | 達成 |
| INV-1c | success/read/write/delete/startup/failure/caller結果を実コードと区別して記録する | `storage-inventory.md`、`test-storage-behavior-baseline.js`の実関数・共通ログ | 一部はVM境界・静的根拠、native入口は未確認 | 部分 |
| BEH-1a | slotを新contextから保存・再読込・削除でき、revisionを確認する | `test-storage-behavior-baseline.js`のstat API | VMのStorage | 達成 |
| BEH-1b | 他slot不変、stale競合と項目削除を確認する | 同テストのslot／stale assertions | Lockはmock | 達成 |
| BEH-1c | slot read/write/delete失敗時の永続値・戻りを確認する | 同テストの失敗注入 | VMのStorage例外 | 達成 |
| BEH-2a | workspaceあり／なし／破損の実load経路を確認する | 実`loadState()`抽出テスト | DOMはVM | 達成 |
| BEH-2b | workspace優先とlegacy fallback、明示slot不変を確認する | 実`loadState()`でworkspace優先、workspaceなし／破損時legacy fallback、明示slot維持、別領域不変を確認 | nativeページ起動ではない | 達成 |
| BEH-3a | 仮想時計119/120msと連続編集のdebounceを確認する | 同テストのclock fixtureと実`persistState`統合fixture。119ms保存なし、120ms実保存を確認 | 実ブラウザ時計ではない | 達成 |
| BEH-3b | pending flush後に二重保存されないことを確認する | 同テストの実Storageログ、flush／解除timer、実イベントcallbackのpending flush | VMの時計・Storage、nativeイベントではない | 達成 |
| BEH-4a | 実persistStateの正常、session/live/legacy各片側失敗を実行する | `test-storage-behavior-baseline.js`。`method:key`でsession write、live read/write、legacy writeを独立注入 | DOM・Storage境界を代替 | 達成 |
| BEH-4b | 残存値・書込順・revision・通知・戻り値／例外を確認する | 同テストのStorage／通知共通連番ログ、live read/write別ケースと保存順変異の反例assertion | 通知・StorageはVM境界 | 達成 |
| BEH-5a | local共有／session別のclean更新とdirty競合保持を確認する | 隔離Origin本番2タブ記録 | native経路を未分離 | 部分 |
| BEH-5b | stale拒否とLock有無を実環境と区別して確認する | staleは一部テスト、Lock代替範囲を記録 | 実Lock・stale実UI未確認 | 部分 |
| BEH-6a | 破損slot・旧形式を実移行処理へ通す | 破損slot→実`migrateSavedStateSlots`書戻し、旧`savedStates`起動移行、旧unwrapped importを確認 | 完全backupの旧版変換はGate B/P3 | 達成 |
| BEH-6b | 生データ書戻しと対象外値保持を確認する | slot移行の書戻しと、import対象slot以外・別local/session・legacy mirrorの不変を本番関数で確認 | 複数キー完全復元は後続範囲 | 部分 |
| BEH-7a | 計算・敵保存の正常／失敗／削除を実関数で確認する | 同テストの計算／敵ケース | UI境界はVM | 達成 |
| BEH-7b | 失敗時の永続値・メモリ・呼出元UI・再読込を実入口で確認する | VMのUI状態と再読込 | 実DOM保存メニュー未確認 | 部分 |
| BEH-8a | DPS起動時refreshAvailabilityの暗黙書込を確認する | 実`PrototypeDpsController.refreshAvailability()`でsnapshot・対応可否・対象別設定保存を起動相当として確認。native実DPSタブ起動・計算・結果表示も確認 | nativeは代表設定・通常DPS、全DPS条件ではない | 達成 |
| BEH-8b | DPS対象A→B→Aで設定保持を確認する | 制御側の実controller＋実`loadDpsSettingsStore`の新context復元、Momo→Sylla→Momo反例を確認。nativeでも同じ対象切替と再読込後Momo設定を確認 | 実Lock・全設定項目のnative確認は後続 | 達成 |
| BEH-9a | 実export/importで保存slotと未保存draftを区別する | 制御側は実export/parser/import/saveState/persistStateを通し、保存slot・未保存workspace・対象slot適用を確認。native側は保存・draft・実export・file input・import先表示まで | native slot2適用完了・保存結果は未達 | 達成（制御） |
| BEH-9b | import時の他領域不変と旧形式代表例を確認する | 制御側で旧unwrapped・未知schema/version・他slot・別local/session・legacy mirror不変を確認。native側はslot2適用完了前で、native別領域不変は未達 | 完全backup形式の旧版はGate B/P3。native import完了待ち | 達成（制御） |
| BEH-10a | comparison session正常往復・未知版の現行正規化を確認する | `combat-scenario.js`公開APIテスト | 未知版拒否はGate B | 達成 |
| BEH-10b | comparison session read/write/remove失敗を確認する | 同テストの失敗注入 | VM Storage | 達成 |
| EVT-1a | 本番2タブのnative storage eventでclean更新を確認する | 隔離Originの本番UIで★4反映 | BroadcastChannelと未分離 | 部分 |
| EVT-1b | 本番2タブのnative storage eventでdirty競合保持を確認する | `storage-s1-native-stat.html`で起動前に`BroadcastChannel`を削除。実2タブでAがslot 2を保存し、dirtyなBが★5と「別タブ更新あり: 2」を保持。両タブの`BroadcastChannel`不在・無警告も確認 | clean側反映はEVT-1aで別判定 | 達成 |
| EVT-2a | native focus復帰後の本番処理結果を確認する | タブ切替を試行 | 両タブvisibleのまま、結果未取得 | 阻害 |
| EVT-2b | native visibility復帰後の本番処理結果を確認する | タブ切替を試行 | `visibilityState`変化なし | 阻害 |
| EVT-3a | pending状態のnative pagehideで本番flushを確認する | 実`init`から抽出したpagehide callbackを実flushへ接続する制御テスト。native離脱復元の既存記録は別扱い | native pagehide、pending書込・イベント・順序は未分離 | 部分 |
| EVT-3b | 離脱復元を個別イベント経路と混同せず記録する | 台帳へ統合結果として訂正記録 | 個別経路の証明は未達 | 達成 |

## 集計

固定総数は41条件。P1b補修後の現行行を再集計し、達成31、部分8、静的確認のみ0、未検証0、阻害2です。これはP1a以前の25/41判定の継承ではない。P1bで実本番関数を通した行は達成へ更新したが、nativeの実DOM操作が必要な補足は別証拠として未達のまま保持している。検出器のアクセス件数64は合格条件ではない。

実行根拠の主な入口:

- `node tools/test-storage-baseline.js`
- `node tools/test-storage-behavior-baseline.js`
- `node tools/inspect-storage.js`
- 隔離Originの本番`stat-dashboard.html` 2タブ操作（詳細は[保存経路台帳](storage-inventory.md)）

P1bの追加証拠:

- `test-storage-behavior-baseline.js`で実`exportStateFile`、実`parseImportedState`、実`applyImportedState`、実`applyStateSnapshot`、実`loadState()`、実`PrototypeDpsController.refreshAvailability()`を実行した。既存import fixture、旧unwrapped形式、未知schema/version、保存slot／workspaceの区別、起動fallback、旧`savedStates`移行、DPS対象別設定を同じ基準テストで確認した。
- 制御側のStorageは`RecordingStorage`だが、slot export/import・起動fallback・DPS対象切替の本番関数を差し替えていない。UI描画・download・snapshot供給などDOM／実計算に依存する境界だけ隔離した。
- native側は、専用一時profile・ローカルHTTP Originで実DOMのexport download、file input投入、DPSタブ起動・結果表示・対象切替・再読込を確認した。stat importはslot2クリック後に完了表示へ進まず、確認ダイアログ／OS前面または本番ページ長時間処理の境界を未達として残した。検証器は同じタイムアウトを反復していない。

スライス2の追加証拠:

- `test-storage-behavior-baseline.js`の実`persistState`、focus／blur handler、DPS保存・対象設定基準。
- 隔離Originの実ページで、DPSタブ選択後の結果表示、Momo→Sylla→Momo、再読込後の対象設定、stat保存・未保存draft・slot export・file input・import先選択UIを確認。
- importのfile input投入は専用Chromeの実`DOM.setFileInputFiles`で成功したが、slot2クリック後の完了表示・適用・保存結果は未達。以前のChrome拡張file URL許可不足とは別の段階であり、native成功へ繰り上げていない。
- スライス3では、起動前に`BroadcastChannel`を削除する`storage-s1-native-stat.html`を使い、両タブの実ページ起動・無警告と、dirty側のnative storage eventによる競合保持を確認した。clean側、focus/visibility、pagehide単独経路は未達のまま。
- N3では、`test-storage-behavior-baseline.js`が実`persistState`を共通Storage／通知ログで観測し、正常・session／live／legacy失敗の保存順・残存値・revision・通知・戻り値をassertした。実`init`からbeforeunload／pagehide／visibilitychange登録を一意に抽出し、実`setupMultiTabStateSync`のfocus／blurと合わせて実保存関数へ接続した。保存順変異の反例は同じログassertionで失敗した。これはnative証拠ではない。

P1aで上記行の証拠を補強したが、固定41条件の総合集計は再計算していない。この台帳はS1の完了を意味しない。BEH-8/9、EVT-2、EVT-3a、DET-1d、INV-1cなどの残条件を閉じ、S1完了時に同じ固定IDで再集計する。実quota上限、複数キー完全復元、Origin転送は後続範囲であり、この分母へ追加しない。
