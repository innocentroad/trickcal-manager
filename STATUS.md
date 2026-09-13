# Trickcal Manager 現在地

> 最終接続レビュー・対象整理（2026-09-14）：R1実Git fixture、共有保守検査、生成check、差分検査は成功。焦点範囲でローカルcommitを妨げる新規問題なし。成果物repo名trickcal-manager-siteは利用者確定（作成未承認）。[133ファイルの統合commit候補](docs/storage-migration-commit-plan.md)を列挙し、実workflowとpush補助の2ファイルは保留・維持する。別clean checkoutで確定commitを検証する方針。今回は文書のみ、git add/commit/push・外部設定・公開は未実施。公開環境検証は残件。

> 最新実施結果（2026-09-14）：R1 1/1。未設置source workflowへ初回／更新のprevious release inputを接続し、専用tmpの実Git fixtureでfresh更新候補の再生成、欠落／別previous／local-only record拒否を確認した。local準備は完了したが、実commit/push・実workflow・外部設定・公開・Goal有効化は未実施で、承認待ちで停止する。

> 最新指示設定（2026-09-14）：P5a/C1の成功を維持。[G1→G4](docs/storage-p5b-git-gate-handoff.md)を4/4完了。Git判定簡素化→配信tools／未設置workflowテンプレート→専用tmpダミー配信代表確認→実repo確定・公開準備の承認資料まで記録した。実repoのcommit/push・実workflow・外部設定・公開・Goal有効化は行わず、承認待ちで停止する。

> 最新完了（2026-09-14）：U1/U2/U3、P5aローカル完了、C1/C2候補準備を維持。C1 1/1、C2 1/1。実repoはdirty/local-onlyで、candidate作成・実配信・外部設定・commit/push・Goal有効化は行わない。

> 最新レビュー（2026-09-14）：U1/U2とP5aローカル完了は維持。U3の通常stagingで見つかった出力削除境界、検査証拠束縛、candidate入口をC1→C2で補修した。[指示](docs/storage-p5b-candidate-instructions.md)のC1/C2は各1/1。外部操作・実配信・commit/push・Goal有効化は行わない。

> 最新実施結果（2026-09-14）：U1・U2・U3を完了。P5a残件をローカル証拠で閉じ、P5bはlocal stagingと手順案まで。実配信・外部設定・commit/push・自動実行Goal有効化は禁止のまま。

> 最新レビュー（2026-09-13）：F0と主要機能の成功を維持。P5A-2/3は生成SWのrelease接続・最終版記録・生成transfer往復の残件があり、下記4/4は無条件の公開可判定に使わない。[次回指示](docs/storage-p5-review-next.md)のU1→U2→U3（未着手0/3、約3単位）で限定補修からP5bローカル準備へ進む。今回はレビュー・文書のみ。実配信・外部設定・commit/push・Goal有効化は禁止。

> 最新の実施指示・結果（2026-09-13）：[最小補修→P5a](docs/storage-p5-luna-instructions.md)を正とする。F0 1/1、P5a-1 1/1、P5a-2 1/1、P5a-3 1/1を確認し、P5a 4/4で完了した。未確認は合格へ加算せず、P5b実配信・外部設定・commit/push・自動実行Goal有効化は対象外。保存契約・codec・永続IDの変更は許可しない。

> 旧判定履歴（2026-09-13 F1再レビュー）：Aへの誤成功通知の修正とH1/H2の成功証拠は維持。不正ファイル選択後も旧packageをplan/applyできる反例を本番controller/codec＋代替runtimeで再現したため、F1は部分達成（完了0/1）、P4最終完了を保留する。残りは入力切替の限定補修1作業単位。[レビューと次回指示](docs/storage-p4-file-input-review.md)を最新とし、下記F1完了記録は履歴として扱う。transfer/pageテスト2本は成功したが反例を網羅していない。native追加確認・P5実装・公開・commit/push・Goal有効化は未実施。

> F1着手前レビュー（2026-09-13・履歴）：P4 6/6の無条件継承を保留。転送導線の既定OFF、失敗後再試行、適用中操作の抑止、既存backup代替要件、診断初期化を除いたnative証拠に不足がある。次回は[限定補修指示](docs/storage-p4-review-handoff.md)のH1→H2で再判定する。F1着手前はH1a〜d/H2を0/5、目安2作業単位としていた。P5実装・Goal有効化は開始しない。home/dataの決定は維持する。下記の完了記録は履歴として扱う。

更新日: 2026-09-14

### 最新：確定commit・最終clean checkout検証完了（2026-09-14）

- 対象確認：[`docs/storage-migration-commit-plan.md`](docs/storage-migration-commit-plan.md)の133ファイルを機械照合し、target 133件・unique 133件・missing 0件。対象外は`.github/workflows/pages.yml`と`tools/git/push.bat`だけで、いずれもstageせず保留した。commit前のsecret／PIIパターン検査は該当なし、明示対象だけをstageし、staged diff checkも成功した。
- commit：統合commitは`e736a23c5ce6de4385668574c26428824144327c`（`Prepare storage migration and public site delivery`、133 files）。clean checkoutで判明した`test-public-site.js`のdirty固定前提を、clean／dirty双方の実Git状態と照合する限定修正として`b55a4fcbcb9e66cb34a0c72d57545b71f34a3ce4`（`Allow public-site tests in clean checkouts`、`tools/test-public-site.js`のみ）へ追加commitした。いずれもpushしていない。
- clean checkout：`tmp/commit-check-final`のHEADは`b55a4fcbcb9e66cb34a0c72d57545b71f34a3ce4`、`git status --short --untracked-files=all`はclean。`npm ci --prefix tools --ignore-scripts`は成功し、脆弱性0件。最終`node tools/generate-public-site.js --write`は2154 files、content digest `229bea51d6a9c5bc59b7977f8d085f500c3a7502dcef24ec8fdbf8873c0bb40e`を生成した。
- release／profile：release ID `0b5472175046bb39`、`sourceCommit`は最終commit、`dirty:false`、`status: local-only-unpublished`、`previousRelease:null`。new／legacy output digestはそれぞれ`2768c19ce251e32a`／`893c0b1166bb0f24`、両profileの生成Service Worker content hashは`60a6ff9ed466a7d56f4347d41e0246ac45d4c122ccd156eb9fd98c7c72d34b16`。
- 検証：`generate-public-site.js --check`、`validate-public-site.js`、`test-public-site.js`、`test-public-site-http.js`、`record-public-site-checks.js`は最終的に全て終了コード0。checksはgeneration／manifest／public-site／HTTPが全てtrue、bindingもtrue（HTTPは2164 registered paths/assets、2 local origins）。並列実行時の共有tmp競合による一時ENOENTは、validate単独再実行で解消した。
- candidate／staging：candidate作成は`ok:true`、candidate ID `2627fe55a56167a9`。`prepare-public-site-staging.js --candidate`は`ok:true`／`candidateAccepted:true`、new／legacy各1076 files、source content digestとprofile output digestの一致、禁止file 0、legacy二重base falseを確認した。
- 残件／停止：元worktreeは`.github/workflows/pages.yml`と`tools/git/push.bat`の既存保留変更だけを維持し、追加stage・追加生成物commitはない。成果物repo作成、workflow設置／起動、token／Pages／environment／DNS／CNAME／HTTPS設定、new初回実公開、Origin実環境確認、旧移行案内ON、実配信、push、自動実行Goal有効化は未実施。次の外部操作には各承認と安全な設定画面へのtoken登録が必要であり、ここで停止する。

## 現在の状態

### 最新：R1完了・外部承認待ちで停止（2026-09-14）

- 実装：`tools/validate-public-site-release-input.js`を追加し、`release_mode`を`initial`／`update`に限定。初回はprevious inputを禁止し、更新は`PREVIOUS_RELEASE_ID`／`PREVIOUS_RELEASE_JSON`を要求する。recordの`status=published`、`dirty=false`、40桁`sourceCommit`、dual-profile整合、ID一致を検証してから`tmp/previous-public-site-release.json`へcompact recordを書き、source workflowは更新時だけ明示`--previous-release`を渡す。
- テスト：`node tools/test-public-site-release-input.js`は終了コード0。初回previousなし、成功配信record、local-only record拒否、欠落／別ID拒否、同じsource＋previousのlocal／fresh checkout生成を通し、SW内容、`previousCacheVersion`、contentDigest、sourceCommit、candidateId、profile digestの一致をassertした。`node tools/test-public-site-delivery.js`も終了コード0で、workflow input／helper／更新引数の静的接続を確認した。
- 既存証拠の扱い：G1〜G3、P5a、既存deliveryの成功証拠を再利用した。専用tmpのfixture内でのみGit init／commitを実行し、実repoのindex／commit／remote、実workflow、成果物repo、Pages／DNS／CNAME、実配信には触れていない。ブラウザ・保存・全画面検証は行っていない。
- 判定：R1 **1/1**。`node --check tools/validate-public-site-release-input.js`、`node --check tools/test-public-site-release-input.js`、`git diff --check`は実装時点で成功。現行releaseは`local-only-unpublished`／`dirty:true`のままで、公開可の判定へ昇格させていない。
- commit候補：R1限定のファイル単位候補は`tools/validate-public-site-release-input.js`、`tools/test-public-site-release-input.js`、`tools/test-public-site-delivery.js`、`docs/templates/storage-p5b-source-delivery.yml`、`docs/templates/storage-p5b-local-staging.md`、`GOAL.md`、`STATUS.md`、`docs/storage-s1-acceptance.md`。詳細と保留範囲は[`storage-p5b-local-staging.md`](docs/templates/storage-p5b-local-staging.md)へ記録した。既存dirty変更を自動的にこの候補へ加えていない。
- 残件／停止：前回成功配信recordの実運用保管、実workflow設置・起動、成果物repo／branch／権限、Pages／environment、token、DNS／CNAME／HTTPS、new初回公開とOrigin確認、旧案内ONの別承認が残る。実commit／push、外部設定、実配信、Goal有効化は禁止のまま停止する。

### 最新：G4完了・承認待ちで停止（2026-09-14）

- 文書成果：`docs/templates/storage-p5b-local-staging.md`へ、現行dirty worktreeの機能単位別commit候補、今回以外の変更の除外・未確認、現行`.github/workflows/pages.yml`のmain push公開とcommit／push分離、new／legacy rootと未設置workflow templateの差分案、承認後の操作順、tokenをチャットへ貼らない運用、初回new公開と旧移行案内ONの別承認を記録した。
- commit候補：公開サイト source／runtime／manifest、P5b Git gate／受渡し、保存・転送安全性、編成共有・データ保守、記録・設計を機能単位の候補として分離した。現在変更済み`pages.yml`、push補助、`tmp/`生成物、datasheet／xlsx、ゲーム生成データ、保存writer／codecの無関係変更、CNAME／DNS／secret／token、未知変更は自動対象から除外・保留とした。最終ファイル単位の確定は利用者承認後であり、実repoへ`git add`／commitしていない。
- 公開差分案：newは成果物専用repoのrootへ`staging/new/`中身を配置し、受信側Pages templateはledger所有ファイルだけをartifact化する。legacyは現行GitHub Pagesと`/trickcal-manager/`・backup／recovery入口を維持し、必要時だけ`staging/legacy/`のbase除去済み中身へ切り替える。現行`.github/workflows/pages.yml`はmain pushで配信するため、legacy workflow切替・source側受渡し・受信Pages deployは別承認に分ける。
- 操作順・承認：`確定commit→clean生成／checks／candidate／staging→成果物repo・権限・Pages／DNS準備→初回公開承認→旧案内OFFのnew公開→実Origin確認→旧案内ONの別承認`を固定した。失敗時はnew公開／案内を停止し、両側の保存データを保持する。必要な承認は、(1)確定commit対象、(2)成果物repo名・branch・review担当、(3)外部workflow／Pages／environment／token権限・期限・更新担当／Cloudflare DNS・CNAME・HTTPS、(4)new初回公開と旧案内ONである。token値は利用者が安全な設定画面へ登録し、チャット・ログ・成果物へ貼らない。
- 判定：G4 **1/1**。G1〜G3各1/1と合わせてG1→G4 **4/4**。G1〜G3のlocal C-T2証拠は維持するが、実repo確定commit、成果物repo、外部設定、実workflow／実配信、new Origin／HTTPS確認、旧案内gateは未実施・未承認。現行releaseは`local-only-unpublished`／`dirty:true`のまま。
- 停止：G4条件を満たしたため、承認待ちの間に実装・局所テスト・外部操作を追加しない。実repoのcommit／push、workflow編集／起動、repo作成、token／Pages／DNS／CNAME設定、実配信、移行案内ON、自動実行Goal有効化は行っていない。

### 最新：G3完了・G4着手（2026-09-14）

- 開始境界：G1の実Git gate、G2のdelivery tool／未設置workflow template、既存C1/C2のcandidate・staging証拠を再利用した。G3では`tools/test-public-site-delivery.js`と本STATUS・受入台帳・GOALの記録だけを更新し、実`.github/workflows`、storage writer／codec、datasheet、ゲーム生成データ、CNAME／DNS、実repoのindex／commit／remoteは変更していない。
- local source／delivery：親repo外の専用tmpに実Git source A／B（Bで`old` routeを除去）を作り、同じ`generate-public-site`→`record-public-site-checks`→`create-public-site-candidate`→`prepare-public-site-staging`→`transfer-public-site-artifact`を実行した。new destinationとlegacy destinationも実Git dummy repoとして初期化し、artifact相当rootを所有ledgerから抽出した。source／destination fixture内のinit/add/commitだけを行い、実repoのGitには触れていない。
- 正常経路：newはrootへ渡し、legacyは`trickcal-manager/`を一度除いたrootへ渡した。Bの更新ではAで前回所有だった`old/index.html`だけを台帳hash確認後に削除し、`CNAME`、`.github/workflows/pages.yml`、未知`keep.txt`を保持。artifact相当rootは所有ファイルと`public-site-deployment.json`だけを含み、ledger／workflow／CNAME／未知file／legacy二重baseは含めなかった。
- 再実行・失敗：同じB candidateの再実行はwrite/delete 0、unchangedが全desired file、Git status cleanで不要差分なし。contentDigestを壊したcandidateは変更前に拒否しdestination snapshot不変。成功済みBに対するworkspace copy失敗はdestination snapshot、前回ledger、Git HEAD、Git statusを維持し、最後の成功配信を上書きしなかった。
- 検証証拠：`node tools/test-public-site-delivery.js`は終了コード0（変更JSの`node --check`も成功）。同testでworkflow templateのrequired input、Action version、permissions、deploy `needs`、manual-only trigger参照を静的確認した。これらはC-T2のlocal evidenceであり、実GitHub Actions／Pages deployment／DNS／HTTPSの証拠ではない。保存／ブラウザ／既存公開物の再検証は行っていない。
- 判定：G3 **1/1**。G1 **1/1**、G2 **1/1**と合わせてG1→G3 **3/4**。G4は文書のみで、実repoの変更を機能単位に整理し、commit／push・workflow／外部設定・初回公開・移行案内ONを分離した承認資料へ更新する。
- 残件・停止条件：G4で`docs/templates/storage-p5b-local-staging.md`の承認対象・除外・操作順を最終化する。G4後は承認待ちで停止し、実repoのcommit／push、workflow編集／起動、repo／token／Pages／DNS／CNAME、実配信、移行案内ON、自動実行Goal有効化は行わない。

### 最新：G2完了・G3着手（2026-09-14）

- 開始境界：G1のGit gate補修と既存dirty変更を維持した。G2の実装・検証対象は`tools/transfer-public-site-artifact.js`、`tools/test-public-site-delivery.js`、`docs/templates/storage-p5b-source-delivery.yml`、`docs/templates/storage-p5b-pages-deploy.yml`、`docs/templates/storage-p5b-local-staging.md`、本STATUS・受入台帳・GOALに限定し、実`.github/workflows`、storage writer／codec、datasheet、ゲーム生成データ、CNAME／DNS、実repoのindex／commit／remoteは変更していない。
- 受渡しtool：candidate record、staging report、release／build／checksを入力に、profile別のstaging file一覧・各sha256・outputDigest・Service Worker hashを再照合する。`new`はroot、`legacy`は`trickcal-manager/`を除いたrootとして扱い、`public-site-deployment.json`にcandidateId／sourceCommit／profile／digestだけの非機密識別情報を生成する。`contentDigest`へ識別情報を再帰的に含めず、`.trickcal-public-site-delivery.json`にはcandidate／profile／所有ファイルとhashを記録する。
- 安全境界：既定はdry-run。`--apply`でも候補・版・同名衝突・前回所有hash・symlink／root外pathを変更前に検査し、`.git`、`.github`、CNAME、前回台帳にない未知ファイルを変更／削除しない。全ファイルを専用一時workspaceへコピーしhash確認後に反映し、適用中の失敗には復旧処理とledger未更新を接続した。
- workflow template：`storage-p5b-source-delivery.yml`はmanual `workflow_dispatch`、source commit／candidate ID／content digest／new・legacy output digest／成果物repoのrequired input、`public-site-delivery-approval` environment、受信repo限定`TRICKCAL_SITE_CONTENTS_TOKEN` secretを定義し、newだけを受渡す。`storage-p5b-pages-deploy.yml`はmanual inputと所有台帳hash検査を通し、`.pages-root`だけを`configure-pages@v5`→`upload-pages-artifact@v4`→`deploy-pages@v4`へ渡す。deployはbuildへ`needs`し、`github-pages` environment、`pages: write`、`id-token: write`を使う。どちらもpush自動起動を含めず、実`.github/workflows`へ設置していない。
- 検証証拠：`node tools/test-public-site-delivery.js`はsandbox外の専用tmp実Git source／dummy delivery repoで終了コード0。dry-run無変更、new／legacy root抽出、初回受渡し、前回所有の不要file削除、同じcandidateの再実行差分0、`.git`／`.github`／CNAME／未知file保持、candidate／digest版不一致変更なし、workspace途中copy失敗時のdestination／ledger／Git status不変を確認した。workflow templateの入力・参照・Action version・permissions・`needs`・push未設定も同じ焦点testで確認した。G1後の`node tools/test-public-site-staging.js`もsandbox外で終了コード0、変更JSの`node --check`と`git diff --check`は成功。公式参照は[Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows)、[fine-grained token permissions](https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens)、[workflow dispatch／environment](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)である。
- 判定：G2 **1/1**。G1 **1/1**と合わせてG1→G2 **2/4**。G3では同じ専用tmp実Git fixtureでcandidate→staging→new／legacy受渡し→artifact相当rootを再確認し、最後の成功配信を失敗で上書きしない主要経路を検証する。
- 残件・停止条件：G3の代表確認（正常new／legacy、同一candidate再実行、版不一致、所有不要file削除、workflow／未知file保持、途中失敗停止）を上記delivery testで実施する。G4の確定commit対象・成果物repo・外部設定／workflow／Pages／DNS・初回公開・移行案内ONの承認資料はその後に文書のみ更新する。実配信、実workflow変更／起動、commit／push、外部設定、移行案内ON、自動実行Goal有効化は行わない。

### 最新：G1完了・G2着手（2026-09-14）

- 開始境界：開始時の`git status --short`を確認し、既存のtracked変更・untracked資料・`.github/workflows/pages.yml`を含むdirty状態を維持した。G1の実装・テスト対象は`tools/public-site-candidate.js`、`tools/create-public-site-candidate.js`、`tools/prepare-public-site-staging.js`、`tools/test-public-site-staging.js`と本STATUS・受入台帳・GOALに限定し、storage writer／codec、datasheet、ゲーム生成データ、実workflow／CNAME／DNS、実配信は変更していない。
- Git gate補修：`public-site-candidate.js`のHEAD／index／ignore独自解析fallbackを削除し、`git rev-parse HEAD`と`git status --porcelain --untracked-files=all`の双方の成功をavailableの条件に固定した。実行失敗は`available:false`、`dirty:true`、短い`reason`を返し、candidate作成は理由付きで終了コード2、stagingのcandidate再照合も拒否する。生成ツール側の情報表示用fallbackは一括変更していない。
- 実Git fixture：`test-public-site-staging.js`のclean fixtureを親repo外の`os.tmpdir()`専用ディレクトリで作り、実`git init`、repo-local `user.name`／`user.email`、`git add`、fixture内commitを実行した。global Git設定や実repoのindex／commit／remoteは変更していない。clean candidate作成・new／legacy staging受理、`git add`済み未commit変更のcandidate拒否、`.git`を一時的に隠したGit実行失敗のcandidate拒否・record未作成を同じ入口で確認した。
- 検証証拠：`node tools/test-public-site-staging.js`はsandbox外の検証環境で終了コード0（hidden `.git`時のGitエラー表示は失敗注入の期待結果）。変更JS 4本の`node --check`と`git diff --check`も終了コード0。既存のC1削除境界、checks／release束縛、C2の候補後変更・checks欠落・digest不一致・実repo dirty拒否は再利用し、browser／保存全件／公開物の再検証は行っていない。通常sandboxではNodeのGit子プロセスが`spawnSync git EPERM`となるため、実Git証拠を捏造せず、専用検証環境で取得した。
- 判定：G1 **1/1**。G2〜G4は未着手。G2では既存candidate／stagingを入力に、dry-run既定・専用tmp内ダミー配信repo限定の受渡し、profile別所有台帳・hash照合、保護ファイル／同名衝突／途中失敗停止、未設置workflowテンプレートを対象とする。
- 残件・停止条件：G2の配信tool・workflow template、G3の専用tmp実Git送受信元／先代表確認、G4の実repo確定commit対象・承認資料が残る。実repoのcommit／push、workflow編集／起動、repo／token／Pages／DNS／CNAME、実配信、移行案内ON、自動実行Goal有効化は行わない。

### 最新：C2完了・P5b候補準備完了（2026-09-14）

- 開始境界：C1のstaging変更、U1〜U3／P5aの既存dirty変更を維持した。C2の対象は`tools/public-site-candidate.js`、`tools/record-public-site-checks.js`、`tools/create-public-site-candidate.js`、`tools/prepare-public-site-staging.js`、staging焦点テスト、手順・記録文書に限定し、storage writer／codec、datasheet、ゲーム生成データ、実workflow／CNAME／DNS、実配信は変更していない。
- checks生成：`node tools/record-public-site-checks.js --source tmp/public-site --manifest tools/public-route-manifest.json --out tmp/public-site-checks-c2.json`が終了コード0。release `875b990b55018c14`に対して`generationCheck`、`manifestValidate`、`publicSiteTest`、`httpCheck`が全てtrue、`binding.ok:true`。`contentDigest=3cd62b1bc1596be7b88b3f714db5f6f6933e95406dec65c9de517133b2935469`、new／legacy output digest `be85e7ddbae8722e`／`3f56dd68eeafcb9f`、sourceCommit `e22f99d7a1c39eb093430944fb2e9314a0097215`を自動記録した。
- candidate入口：`tools/create-public-site-candidate.js`は期待commit／contentDigest／profile digest、release/buildの生成hash、profile別SW hash、checks束縛、Git HEAD／dirtyを全て確認し、成功時だけ別candidate recordを書き出す。generatorの`status=local-only-unpublished`は書き換えない。
- clean／dirty証拠：`node tools/test-public-site-staging.js`終了コード0。隔離clean Git fixtureで自動checks→candidate record→new／legacy stagingのcandidate受理、candidate後のgenerated app変更拒否、checks欠落、期待outputDigest不一致を確認した。実repoのcandidate CLIは終了コード2で`source repositoryがdirty`／`release recordがdirty`を報告し、`tmp/public-site-candidate-c2-dirty.json`を作成しなかった。
- staging再照合：candidate stagingは現在Git HEAD／dirty、candidateId、release/build/profile台帳、再生成check、new／legacy分離を再検査する。candidate後に成果物が変わった場合はcontentDigest／再生成checkで停止する。C1のtmp／source／out境界、入力保護、checks必須束縛、通常dirty staging拒否も維持した。
- 検証：新規5本の`node --check`、`node tools/test-public-site.js`、`node tools/generate-public-site.js --check`、`node tools/validate-public-site.js`、`node tools/test-public-site-http.js`（2164 registered paths/assets・2 local origins）、`node tools/test-public-site-staging.js`、`git diff --check`は終了コード0。ブラウザ・保存全件は再検証していない。
- 判定：C2 **1/1**。C1 **1/1**と合わせてC1/C2 **2/2**。P5bは「clean検査済み候補をlocal stagingへ渡す入口」までで、実配信可／公開可とは判定しない。
- 残件・停止：実repoの確定commit、候補への外部承認、成果物専用repo作成可否、受渡し権限／branch／fine-grained token登録・期限・更新担当、Pages／environment／workflow設定、DNS／CNAME、new HTTPS／Origin smoke test、保存／共有／転送確認、旧移行案内gateの別承認、P6実機確認が残る。失敗時はnew公開・旧案内をOFFのまま停止し、保存データを戻さない。workflow／外部設定／実配信／commit／push／Goal有効化は行わず停止する。

### 最新：C1完了・C2着手（2026-09-14）

- 開始境界：U1〜U3の既存dirty変更、通常staging、P5a local acceptanceを維持した。C1は`tools/prepare-public-site-staging.js`、新規staging焦点テスト、本STATUS・GOAL・受入台帳を対象にし、storage writer／codec、datasheet、ゲーム生成物、workflow／CNAME／DNS、実配信は変更していない。
- 削除境界：`tmp`自身、sourceと同じ／親／子になる`out`、tmp外へ解決されるpath、symlink／junction等のreparse point、既存の別用途rootを削除・コピー前に拒否する。release／build／manifest／checksが`out`配下にある場合も先に拒否し、入力を読んでから専用staging rootだけを再作成する。
- checks束縛：`readChecks`はgeneration／manifest／public-site／HTTPのtrueに加え、`sourceCommit`、`contentDigest`、new／legacy `outputDigest`の存在とrelease一致を必須化した。build recordの未知profileも拒否する。
- C1証拠：`node --check tools/prepare-public-site-staging.js`、`node --check tools/test-public-site-staging.js`、`node tools/test-public-site-staging.js`は終了コード0。正常専用stagingはnew／legacy各1076 files、source contentDigest一致を維持し、tmp全体・source境界・out内checks入力のケースで`rmSync`／`copyFileSync` 0回、checks欠落・別contentDigestを候補不適合として確認した。
- 判定：C1 **1/1**。C2では、digest付きchecks自動生成、clean isolated Git fixtureのcandidate record、candidateと現行HEAD／成果物の再照合、生成後変更の拒否を完了した。

### 最新：U3完了・P5bローカル準備完了（2026-09-14）

- 開始境界：U1／U2の限定補修と既存dirty変更を維持し、U3ではprofile台帳からのlocal staging抽出、候補gate、手順案・外部操作一覧だけを対象にした。実`.github/workflows`、repo／token／Pages／DNS、CNAME、公開gate、実配信、commit／pushは変更していない。
- staging入口：`tools/prepare-public-site-staging.js`を追加した。`public-site-release.json`と`public-site-build.json`を照合し、source dual-output `contentDigest`、new／legacyの生成順`outputDigest`、profile／base path、生成SW output hash、expected sourceCommit、check evidenceを検査してから、`tmp/public-site-staging/new/`と`legacy/`へ別抽出する。legacyは先頭`trickcal-manager/`を一度だけ除き、newへlegacy一式を渡さない。
- 実行証拠：現行release `875b990b55018c14`に対し、content digest `3cd62b1bc1596be7b88b3f714db5f6f6933e95406dec65c9de517133b2935469`、new／legacy output digest `be85e7ddbae8722e`／`3f56dd68eeafcb9f`、sourceCommit `e22f99d7a1c39eb093430944fb2e9314a0097215`、既存成功check evidenceを照合した。new／legacy各1076 files、new legacy混入0、禁止file 0、legacy二重base 0。`tmp/public-site-staging/staging-report.json`で`sourceContentDigestMatches:true`、両profile `outputDigestMatches:true`、Service Worker hash照合、checks `ok:true`を確認した。
- 候補gate：releaseの`status: local-only-unpublished`と`dirty:true`を理由に`candidateAccepted:false`。`--candidate`は終了コード2で拒否する。構造的stagingが成立しても、clean sourceCommit・全check・期待digestが揃い、local-only／dirtyでないreleaseになるまで配信候補へ進めない。
- 手順案：[`docs/templates/storage-p5b-local-staging.md`](docs/templates/storage-p5b-local-staging.md)に、new／legacy二rootの受渡し、`.git`／`.github`／既存workflow非上書き、失敗時legacy案内OFF、データを戻さない停止／rollback、外部repo／権限／token登録／Pages／DNS／公開承認／移行gate承認の一覧を記録した。実workflowは変更・起動していない。
- 検証：U3入口の変更JS構文、`--help`、実staging dry-run、`git diff --check`は成功。U1／U2で確認した生成check、validate、HTTP、native transfer、Browser SW更新・正規化・cache保持の証拠を再利用し、無関係な全体検証へ広げていない。
- 最終判定：U1 **1/1**、U2 **1/1**、U3 **1/1**。P5aの旧生成SW／最終hash／生成transfer残件はローカル証拠上閉じ、P5aは「local acceptance完了・公開可ではない」と再判定する。P5bは「local staging・手順案・外部操作整理」まで完了、実配信は未着手。P6は公開Origin／DNS／HTTPS／実機確認が残る。P4 H1／H2と元条件6/6の再判定は維持する。
- 停止条件：新repo作成、token／Pages／DNS設定、実workflow・CNAME、実配信、移行案内gate ON、commit／push、自動実行Goal有効化は行わず、ここで停止する。次の実施には外部操作と明示承認が必要。

### 最新：U2完了・U3着手（2026-09-14）

- 開始境界：U1の限定補修と既存dirty変更を維持し、U2では生成更新の隔離fixture／local HTTP／Browser、生成transferのnative runner、必要な検証fixture変更だけを対象にした。storage writer／codec、datasheet、ゲーム生成データ、workflow／CNAME／DNS、実配信は変更していない。
- 二release生成：`node tools/prepare-public-site-update.js`でmanifest登録入力1066件を隔離source rootへコピーし、old release `875b990b55018c14`を生成後、隔離`app-cache.js`だけを変更してnew release `3c26d70b3138d982`を生成した。new releaseの`previousReleaseId`はold ID。実ソースとcanonical生成物は変更せず、二rootは`tmp/public-site-u2/`配下に保持した。
- 同一OriginのSW更新：一時HTTP serverでold rootを配信し、managerをreloadしてold cache `trickcal-manager-new-root-875b990b55018c14`を作成。root全体をnewへ切り替え、旧tabのURL `http://127.0.0.1:8786/manager/?view=settings`を変えず、`waiting:true`／`waitingState:"installed"`／active oldを確認した。旧tabを閉じて新tabを開くと`waiting:false`／`activeState:"activated"`、old＋new cache `trickcal-manager-new-root-3c26d70b3138d982`、`u2-unrelated-cache-sentinel`保持を確認した。SW応答単体の手動差替えは行っていない。
- URL／境界：生成`/calc/index.html?u2=query#keep`は`/calc/?u2=query#keep`へ正規化し、canonical `/calc/?u2=canonical#keep`は同じまま。未知`/u2-unknown-path`はlocal HTTPでstatus 404／body `Not found`となりmanagerへ転送しないことを確認した。
- 生成transfer：既存`tools/storage-transfer-native-check.js`へsource／target root・path指定を追加し、old生成legacy profile（source）とnew生成new profile（target）の独立localhost 2 Originで実行。`tmp/storage-transfer-native-1789312302904.json`は`ok:true`、directのpreviewNoWrite／planNoWrite／receiverBackupBeforeApplySaved／senderUnchanged／receiverRestored／stateFactsMatch／calculationSavesPreserved／unrelatedKeysPreserved、fixed package digest一致、file input observed／restored、reopened target savedDataReadableをすべてtrueと記録した。
- 検証：`node tools/test-public-site.js`、`node tools/generate-public-site.js --check`、`node tools/validate-public-site.js`、`node tools/test-public-site-http.js`、`node tools/test-storage-transfer.js`、`node tools/test-storage-transfer-page.js`、変更JSの`node --check`、`git diff --check`は終了コード0。公開サイト焦点テストはrelease安定、asset変更更新、SW URL安定登録、index alias正規化、最終SW hash記録を維持した。
- 未達・残見積もり：U3のnew／legacy profile台帳から別staging rootへ抽出するdry-run入口、clean／dirty・sourceCommit／digest拒否、workflow案・停止／rollback手順、外部操作・承認一覧は未整備。残り約1作業単位。P5aはU1／U2で旧残件を閉じる証拠を得たが、U3後に再判定する。P5bはローカル準備のみで、実配信・公開gate・外部設定・commit／push・自動実行Goal有効化は行わない。

### 最新：U1完了・U2着手（2026-09-13）

- 開始境界：既存の未コミット変更を保持し、U1の対象を`tools/generate-public-site.js`、`service-worker.js`、`tools/test-public-site.js`と記録文書に限定した。storage writer／codec、datasheet、ゲーム生成データ、workflow／CNAME／DNS、実配信は変更していない。
- 生成版の補修：planのmanifest・route／asset sourceを既存`sha256`で集約し、`releaseInputVersion`、`releaseInputDigest`、安定16桁`releaseId`、明示`sourceVersions`を生成する。生成SWだけへcurrent release IDと、前回検査済みreleaseのIDを注入し、初回は`PREVIOUS_CACHE_VERSION`なしとした。待機型install、scope、network-first／stale-while-revalidate、transfer／recovery非cache、profile別所有cache整理は維持した。
- 前回版と最終hash：通常生成は出力先の検査済み`public-site-release.json`を直前版として扱い、同一入力の再生成ではそのrecordのpreviousを再利用して安定化する。`--previous-release`の明示入力も可能。release台帳のprofile別Service Workerに、出力path、current／previous cache version、生成ファイルのsha256を記録し、最終`contentDigest`／`outputDigest`との参照を固定した。現行生成は`releaseId=f8b4ffab9b2119b1`、`previousRelease=null`、`status=local-only-unpublished`、`dirty=true`、`contentDigest=b6ff36585ad9c0a1d06dc3589ca55314c5de4cfe8fc791798784966c1be759e9`。
- 焦点証拠：`node tools/test-public-site.js`は終了コード0。同一入力の再生成と`--check`、隔離fixtureの`app.js`変更によるrelease ID／生成SW変更、直前release IDの`PREVIOUS_CACHE_VERSION`接続、最終SW hashの台帳一致、`/calc/index.html`等のpathname完全一致正規化とquery/hash保持をassertした。標準順の`node tools/generate-public-site.js --check`、`node tools/validate-public-site.js`、`node tools/test-public-site-http.js`、`git diff --check`、変更JSの`node --check`も終了コード0。
- 未達・残条件：U2のgenerator生成二releaseを同一独立local Originで順次配信するwaiting／再起動・現行／直前cache・無関係cache保持、生成`/calc/index.html`の実ブラウザquery/hash、生成new／legacy 2 Originでの非空fixture直接転送と同一package file復元は未実施。storage基準テストは既存P5aで削除済みの`CACHE_PREFIX`を要求するため失敗しており、保存実装へは広げない。
- 残見積もり：U2約1作業単位、U3約1作業単位。U2終了後にU3のローカルstaging入口・配信手順案へ進み、P5a／P5b／P6の判定を更新する。実配信、外部設定、公開gate、commit／push、自動実行Goal有効化は引き続き行わない。

### 最新：P5a-3完了・P5a完了（2026-09-13）

- 作業境界：F0、P5a-1、P5a-2の既存未コミット変更を維持し、P5a-3ではmanifestのBoard fixture修正（`apostle=10001`→実ID `Amelia`）、README／AGENTSの引渡し手順、検証記録だけを追加・更新した。生成物はgeneratorで再生成し、手編集していない。datasheet、ゲーム生成データ、保存契約、codec、永続ID、workflow／CNAME／DNS、実配信は変更していない。
- HTTP／生成証拠：`node tools/test-public-site.js`、`node tools/generate-public-site.js --check`、`node tools/validate-public-site.js`、`node tools/test-public-site-http.js`、`node tools/sync-formation-share-assets.js --check`、`node tools/test-formation-share-image.js` はすべて終了コード0。HTTP testは2164個のmanifest登録route／asset、2 local Origin、静的参照、route wiring、alias、SW gateを確認した。生成releaseは`tmp/public-site/public-site-release.json`の`status: local-only-unpublished`、`dirty:true`、content digest `e9058bb962a71a5d29199fa72d3f76439df929d0283d041048d1485eef478ff9`、共通assetVersion `0a46ac2432a434c0`、new／legacy routeVersion `72ca28473781bbd6`／`3bbb03733ce5cea0`である。
- manager／calc／DPS：新側`http://[::1]:8765/`と旧側`http://[::1]:8766/trickcal-manager/`でmanagerを起動し、新側`/img/Chara/Amelia.webp?v=0a46ac2432a434c0`、旧側`/trickcal-manager/img/Chara/Amelia.webp?v=0a46ac2432a434c0`の動的画像解決と相互リンクを確認した。`/calc/`は通常ダメージ`11`、DPSタブはWorker計算完了後に全体期待DPS`6`と行動別内訳を表示した。
- 参照系：`/data/enemies/`は21/21件と敵ステータス、`/data/boards/?apostle=Amelia&zoom=120`はアメリア選択・`120%`を表示した。`/data/`はPC幅で全導線を表示した。対象タブを選択してからBrowser skillのviewport capabilityを`390x844`へ適用し、実ページの`innerWidth/clientWidth/bodyWidth=390`、`innerHeight=844`、見出し・全導線を取得したためmobile幅も確認済みとする。
- 共有／transfer：同じ`1.z` payload（先頭`C3EODm...`）を新旧shareで表示し、両Origin・light／darkで`共有画像を作成しました（1200×886px）。`と画像保存ボタン有効化を確認した。生成`/transfer/`は初期非適用状態と現在データbackup保存（194107 bytes）を確認した。file復元・正常転送は既存H2 native証拠`tmp/storage-transfer-native-1789286377160.json`を再利用し、`ok:true`、`directTransfer`の正常復元、`fileTransfer.inputObserved:true`／`restored:true`、再起動後読込みを確認した。
- Service Worker：生成managerを一度読み込んでlocal serverを停止し、新旧managerを閉じた後の新規tabでoffline再読込みできた。transferは一意queryで`ERR_CONNECTION_REFUSED`となり、transfer非cache境界を確認した。Service Workerのprofile別cache、waiting型、network-first、所有cache限定、transfer／recovery非cacheはHTTP／静的gateで確認した。加えて一時SW確認サーバーで同一Originの旧SWを開いたまま新版へ切り替え、`waiting:true`／`waitingState:"installed"`、URL維持・`navigationType:"navigate"`を2.5秒後にも確認した。旧tabを閉じて再起動後は`waiting:false`／`activeState:"activated"`、検証用新版cache `trickcal-manager-new-root-20260913-p5a2-2`を確認した。別の一時Originでは更新前に作成した`unrelated-cache-sentinel`が新版activate後も保持され、検証用新版cache `trickcal-manager-new-root-20260913-p5a2-3`を確認した。テスト用SW応答以外の生成物は変更していない。
- 手順・最終確認：`README.md`と`AGENTS.md`へmanifest、生成・検査、2 Origin、mobile／SW確認境界、未公開release、停止／rollback境界を追記した。関連JS 21本の`node --check`と最終`git diff --check`は終了コード0（GitのLF→CRLF警告のみ）である。
- 判定：P5a-3はHTTP／主要画面／共有PNG／transfer入口／mobile実効幅／offline代表／SW waiting更新まで確認し、**1/1達成**とする。F0 **1/1**、P5a-1 **1/1**、P5a-2 **1/1**、P5a-3 **1/1**、P5a全体は**4/4**。P5b／P6は未着手で、実配信・外部設定・公開gate・commit／push・自動実行Goal有効化へ進まない。

### 最新：P5a-2完了・P5a-3着手（2026-09-13）

- 対応条件：P5A-2。新／旧profileの生成後HTMLで内部route／asset参照をprofile別へ解決し、runtimeの`pageUrl`／`peerPageUrl`／`assetUrl`を共有URL、iframe、動的画像、DPS worker、board preview、preloadへ接続した。data一覧は既存主要ページと同じtopbar構造・導線を持つ。新規共有URLへ公開`v` queryは付けていない。
- Service Worker／cache：profile別の登録URL・scope・cache名、待機型更新（install時の無条件`skipWaiting`／`clients.claim`なし）、既知navigationのnetwork-first、資材のstale-while-revalidate、所有cacheのみの整理、transfer／recoveryとunknown navigationの非cacheを実装した。root profileが旧`/trickcal-manager/`出力を誤って制御しないガードも含む。
- 版整合の証拠：`node tools/sync-formation-share-assets.js --check`は終了コード0（共有同期内容hash `66f50909d0e64a5e`）。`node tools/test-public-site.js`、`node tools/test-formation-share-assets.js`、`node tools/test-formation-share-catalog.js`、`node tools/test-formation-share-display-data.js`、`node tools/test-formation-share-image.js`、`node tools/test-formation-share-maintenance.js`、storage transfer／page／backup／restore／runtime／behavior回帰は終了コード0。
- 生成・検査の証拠：`node tools/generate-public-site.js --write`終了コード0、`tmp/public-site` 2154 files、digest `28ad0cd1e7118710688557ba1286be498fb39fdc0202d5cd7bd23832b83bdc40`。続けて同じ生成入口の`--check`と`node tools/validate-public-site.js`も終了コード0。releaseは`status: local-only-unpublished`、sourceCommit `e22f99d7a1c39eb093430944fb2e9314a0097215`、`dirty:true`。new／legacyのassetVersionは共通`d13c1449a9c11338`、routeVersionはそれぞれ`14fc19e86c6f96e5`／`e1c875b92ab26aa8`、derived versionはformation-share `66f50909d0e64a5e`、share-create `e343d1525a6fd260`、app-cache `29df848628027edc`。
- 構文・変更境界：関連JSの`node --check`、既存共有資材同期後の`--check`を確認した。変更はP5a許可範囲のruntime／HTML path wiring／cache／SW／share sync／生成・検査toolsと記録文書に限定し、datasheet・ゲーム生成データ・共有codec／永続ID・保存writer・workflow／CNAME／DNS・実配信は変更していない。既存dirty変更は維持した。
- 達成条件数：P5a-2 **1/1**。F0 **1/1**、P5a-1 **1/1**、F1 **1/1**、H1 **4/4**、H2 **1/1**、P4 **6/6**は既存証拠を維持する。
- 未達・残条件：P5a-3のHTTP全登録入口／静的資材、new／legacyを別local Originでの実ページ確認、manager／calc／worker／敵preset／board、同一share payloadの新旧表示とlight／dark PNG、dataのdesktop／mobile、生成transferの正常／file、SW waiting／再起動／offline／他cache保持、README／AGENTS引渡し手順、最終`git diff --check`は未確認。P5b／P6へは加算しない。
- 次の境界・残見積もり：P5a-3は約1作業単位。対象は生成物のHTTP・ブラウザ代表確認、安定再生成、台帳／README／AGENTS記録と残件整理に限定する。実配信、外部設定、公開gate ON、commit/push、自動実行Goal有効化は行わない。

### 最新：F0完了・P5a-1着手（2026-09-13）

- 対応条件：F0-1。不正ファイルBの選択後に旧package Aを復元できず、読込み成功まで復元操作を無効にする。ファイル取消、直接転送の既存解除、適用中・復旧要ガードは維持する。
- 開始時の変更境界：開始時の`git status --short`で既存の未コミット変更を確認し、すべて維持する。F0の実装・テスト対象は`storage-transfer-page.js`、`tools/test-storage-transfer-page.js`、および本`STATUS.md`、`GOAL.md`、`docs/storage-s1-acceptance.md`に限定する。P5a、datasheet、生成データ、通常保存writer、公開設定、commit/pushは対象外。
- 修正前証拠（制御）：開始時の`node tools/test-storage-transfer-page.js`は`AssertionError: 不正B後も旧A packageが残っています`（`true !== false`）で失敗した。
- 修正後証拠（制御）：同テストが終了コード0。旧Aの消去、不正B後のpreview非表示・plan/apply回数0、読込み中の`hasPackage=false`・prepare/apply/save拒否を確認した。F1のA→B誤通知回帰も同じテストで維持する。
- 達成条件数：F0 **1/1**。native追加確認は行わず、制御証拠として記録する。F1 **1/1**、H1 **4/4**、H2 **1/1**、P4 **6/6**は既存証拠を維持する。
- 開始時のP5a-1変更境界：F0までの未コミット変更を維持する。P5a-1の対象は`tools/public-route-manifest.json`、manifest schema／生成・検査tools、生成物を検査する焦点テスト、README・STATUS・受入台帳・GOALの手順記録に限定する。既存アプリ本体、datasheet、生成データ、保存writer、workflow／CNAME／DNS、実配信は変更しない。
- P5a-1開始判定：**0/1**。単一manifestから旧base／新baseの入口を生成し、schema・route／alias／target／出力衝突・互換URL反例を同じ本番生成検査入口へ通す。
- 残り見積もり：P5a-1は約1作業単位。合格後にP5a-2へ進み、各単位をC-T1のローカル証拠としてP5b/P6へ加算しない。

### 最新：P5a-1完了・P5a-2着手（2026-09-13）

- 変更境界：F0までの未コミット変更を維持した。P5a-1ではmanifest、schema、生成・検査tools、焦点テスト、手順記録だけを追加・更新し、既存アプリ本体、datasheet、生成データ、保存writer、workflow／CNAME／DNS、実配信は変更していない。
- 生成契約：`tools/public-route-manifest.json`を唯一のroute定義とし、`tools/public-route-manifest.schema.json`で`schemaVersion: 1`、new／legacy profile、routeのsource／generator排他、profile別publicPath／kind、alias／target、fixture、manifest-only asset、Service Worker設定を固定した。`tools/generate-public-site.js`の同じvalidation／buildPlan／generate経路で出力を`tmp/public-site`の専用子ディレクトリへ限定する。
- 焦点テスト：`node tools/test-public-site.js`終了コード0。未知フィールド拒否、source／generator排他、`home.new -> home`自己redirect拒否、route／alias衝突、reserved path衝突、同一routeの`/manager/`と`/manager/index.html`の一出力、旧profile入口、明示assetsだけの出力、docs／xlsx／tests／secrets混入なし、生成安定checkを確認した。
- 実行証拠：`node tools/generate-public-site.js --write`終了コード0、`tmp/public-site` 2151 files、digest `3210654ca0e34c2f94cf28ba0428dfb6af4d7c576c680d83fe554fd4532bdd91`。`git diff --check`も終了コード0。`node tools/validate-public-site.js`はP5a-2接続前の出力確認を別途行う対象として残した。
- 達成条件数：P5a-1 **1/1**。F0 **1/1**、F1 **1/1**、H1 **4/4**、H2 **1/1**、P4 **6/6**は既存証拠を維持する。
- 未達・残条件：生成されたHTMLはP5a-2のpageUrl／assetUrl変換前であり、動的なリンク・画像・worker・iframe、hash/versionの依存順、release record、Service Workerのtransfer／recovery非cacheをまだ確認していない。P5a-3のHTTP 2 profile、desktop／mobile、share PNG、実Service Worker、README／AGENTS手順確認も未着手。P5b/P6への加算はしない。
- 次の境界・見積もり：P5a-2の対象はroute helperと生成時のHTML／CSS／JS path wiring、cache／release record、同期テスト、README・STATUS・台帳・GOALの記録に限定する。P5a-3は約1〜2作業単位。P5b実配信、外部設定変更、commit/push、自動実行Goal有効化は行わない。

### 最新：P4 F1完了・P4再判定／P5a開始可（停止）（2026-09-13）

- 開始時の変更境界：開始時の`git status --short`で既存の未コミット変更を確認し、すべて維持した。今回の実装・テスト対象は`storage-transfer.js`、`storage-transfer-page.js`、`tools/test-storage-transfer-page.js`、および証拠を記録する本`STATUS.md`、`GOAL.md`、`docs/storage-s1-acceptance.md`に限定した。参照文書は読取りのみで、datasheet、生成データ、保存writer、公開設定、P5実装、commit/pushは変更していない。
- F1修正：実ファイル選択の読取り／decode開始前に直接転送の世代を無効化し、receiverの`message` listenerを解放して、旧senderへ既存REJECTプロトコルの`file-switch`を送る。ファイル未選択（ダイアログ取消）では切り替えない。Aの遅延payload／decode完了は世代検査で破棄し、Bのpreviewを置換しない。
- 通知束縛：apply時は現在の直接転送receiverと適用packageのdigestが一致する場合だけ`APPLYING`／`RESULT`を送る。Bのfile restoreではreceiverを切り離すため、Aの成功receiptを送らない。
- 修正前反例（制御）：`node tools/test-storage-transfer-page.js`の隔離pre-F1モデル（ファイルhandlerの旧decode処理と旧receiver通知束縛をメモリ上で再現）は`pre-fix complete/RESULT=1`。Bをplan/applyしてもAの成功RESULTへ到達した。
- 修正後反例（制御）：同じ転送fixtureで実file inputイベントを通し、`fixed rejected/RESULT=0/B-apply`。B選択後のlistener解放、Aの遅延decode拒否、B digestのplan/apply、A RESULTなし、sender非COMPLETEをassertした。ファイル取消はlistenerを維持し、既存の適用中操作ロック・codec拒否回帰も通過した。
- 実行証拠（制御）：`node --check storage-transfer.js`、`node --check storage-transfer-page.js`、`node --check tools/test-storage-transfer-page.js`、`node tools/test-storage-transfer.js`、`node tools/test-storage-transfer-page.js`、`node tools/test-storage-backup.js`、`node tools/test-storage-restore.js`、`node tools/test-storage-runtime.js`、`node tools/test-storage-behavior-baseline.js`がすべて終了コード0。
- nativeとの分離：H2の既存native成功証拠`tmp/storage-transfer-native-1789286377160.json`（`ok:true`、独立profile・localhost 2 Origin、通常direct/file往復・再起動読込み）を再利用した。F1のA→B切替／遅延raceは制御証拠であり、native証拠へ繰り上げていない。
- 達成条件数：F1 **1/1**。H1 **4/4**、H2 **1/1**を維持し、旧P4 B-T4a〜fを**6/6**へ再判定した。`git diff --check`も終了コード0。
- 未検証・残条件：F1固有のA→B切替を公開Origin・モバイル実機・狭幅表示で実施していない。これらはP4完了数へ含めない既存残条件。P5aのmanifest／生成／互換入口等は未実装。
- 残り見積もりと停止点：F1の残作業は0。P5aは開始可（未着手、従来見積もり2〜3作業単位）。本Goalはここで停止し、P5実装、公開設定変更、datasheet・生成物・計算式、commit/push、自動実行Goal有効化へ進まない。

### 最新：P4 H2完了・P4再判定（2026-09-13）

- H2の変更境界：H1補修を維持し、現行tools runnerへ非空slot/currentのfixture投入、実状態比較、受信側適用前backup、送信時固定package保存、tmp要約レポートを追加した。tools専用Origin hookは許可範囲内で使用し、別controllerの手動初期化・保存関数の直接呼出し・公開設定変更は行っていない。
- 実証：node tools/storage-transfer-native-check.jsを独立profile・localhost source/target 2 Originで実行し、終了コード0。statの実#backup-transferクリック、受信previewでの無書込み、受信側現在データの退避、planでの無書込み、明示apply、送信元storage不変、非空の育成・編成・保存計算の内容一致、無関係キー保持、送信完了を確認した。
- ファイル／再起動：送信時点で固定したpackageを実downloadし、そのdigestが直接転送payloadと一致することを確認。固定packageを実file inputへ投入して同じpreview→plan→明示applyを完了し、target新規tabのbootと保存データ読込みも確認した。生保存値はログ／要約レポートへ出力していない。
- H2証拠：tmp/storage-transfer-native-1789286377160.json。ok:true、isolatedProfile:true、directTransferのpreviewNoWrite／planNoWrite／receiverBackupBeforeApplySaved／sourceStateSeeded／senderUnchanged／receiverRestored／stateFactsMatch／calculationSavesPreserved／fixedPackageMatchesDirectDigest、fileTransfer.restored、reopenedTarget.savedDataReadableがtrue。server diagnosticsは空で、Chromeの環境由来stderrは成功判定を阻害していない。
- 達成条件数：H1 4/4、H2 1/1。旧P4の元条件は、既存制御証拠のB-T4a〜dと今回nativeのB-T4e,fを合わせて6/6へ再判定した。変更JS構文、transfer/page、backup、restore、runtime、behavior baseline、git diff --checkも最終確認済み。
- P5a開始可否：P4 6/6の再判定により開始可（未着手）。P5aは別作業としてmanifest／生成／互換入口等の実装前条件を確認してから開始する。本Goalではここで停止する。
- 未検証・残条件：公開Originでの本番導線、iOS/Android実機、狭幅表示、P5a以降は今回の証拠外。P5実装、公開設定変更、datasheet・生成物・計算式、DNS/Pages/workflow/CNAME、commit/push、自動実行Goal有効化は行っていない。

### 最新：P4 H1完了・H2前（2026-09-13）

- 今回の変更境界：既存の未コミット変更を維持し、H1の対象を'storage-transfer.js'、'storage-transfer-page.js'、'storage-transfer.html'、'stat-prototype.js'、'stat-dashboard.html'、関連transferテストと'tools/storage-transfer-native-check.js'に限定した。datasheet、生成データ、ゲーム計算式、公開設定、P5、commit/push、自動実行Goalは変更していない。
- H1a：管理画面の'#backup-transfer'をHTML既定非表示にし、実行入口もloopback＋tools注入の'TRICKCAL_STORAGE_TRANSFER_TEST_ENABLED'だけを許可するlocal gateへ接続した。URL引数だけでは有効化しない。
- H1b：sender timeoutを'failed'で終了しtimerを解放、rejectも適用開始前にhandshakeを停止するよう補修した。管理画面は適用前にlistener・sender参照・maintenanceを解放し、次の明示クリックを可能にした。APPLYING以後の拒否は状態を巻き戻さず、遅延RESULTを待つ。
- H1c：受信ページで適用中・復旧要状態を操作ロックし、cancel/file input/decodeをUIとhandlerの両方で拒否する。apply後の失敗はruntimeのcancel結果を正とし、cancel不能時は復旧要状態を保持する。
- H1d：受信ページに既存runtimeの'beginMaintenance'→'export'を使う新サイト現在データの退避操作を追加し、受信した元JSONを保持してそのまま保存できるようにした。送信元も採取時に固定した'backupTransferPackageJson'を送信・保存へ共用し、新writerやreceipt永続化は追加していない。
- H1達成条件数：**4/4（制御証拠）**。'node --check'（変更JS 4本）、'node tools/test-storage-transfer.js'、'node tools/test-storage-transfer-page.js'、'node tools/test-storage-backup.js'、'node tools/test-storage-restore.js'、'node tools/test-storage-runtime.js'、'node tools/test-storage-behavior-baseline.js'、'git diff --check'が成功した。制御テストではtimeout後再試行、適用開始後拒否の非巻戻し、適用中cancel/file拒否、同一JSON保存、新側backup exportを確認した。
- H2状況：**0/1（未実施）**。現行'tools/storage-transfer-native-check.js'はtools専用Origin hook、受信側適用前backup、固定パッケージdownload、tmp要約レポートへ更新済みだが、独立profile・2 Originの実runはこれからである。
- 未検証・残り見積もり：H2で本番初期化だけの実クリック、非空slot/current・編成・保存計算の転送前後比較、明示restore、固定packageのfile round-trip、新規tab読込みを1単位で確認する。H2未達ならP4再判定とP5a開始可否は未確定のまま停止する。
- 停止条件：H2後に旧P4 6/6を再判定し、P5a開始可否だけを報告する。P5実装、公開設定変更、datasheet・生成物・計算式、DNS/Pages/workflow/CNAME、commit/push、自動実行Goal有効化は行わない。

### 最新：P4 T3合格・P4完了（2026-09-13）

- 着手時の変更境界：G0／T1／T2の既存未コミット変更を維持し、T3では`tools/storage-native-browser-check.js`の再利用可能なexportと`tools/storage-transfer-native-check.js`、本STATUS・受入台帳・独立ブラウザ環境記録だけを対象にした。保存writer、datasheet、生成データ、公開設定、P5実装は変更していない。検証途中の診断出力は成功後に削除し、通常runnerの結果だけを残した。
- B-T4e：`node tools/storage-transfer-native-check.js`を通常のsandbox外で実行し、専用一時`user-data-dir`／専用download先、source/targetのlocalhost 2 Origin、statの実`#backup-transfer`クリック、受信タブのpreview→plan→明示apply、内部receipt、送信元採取完了後storage不変、受信先slot・保存計算・無関係キー保持を確認した。さらに実exportのdownload→実file input→applyと、target新規ページ再起動後のboot／保存データ読込みも成功した。結果JSONは`ok:true`、`directTransfer.previewNoWrite`、`planNoWrite`、`senderUnchanged`、`receiverRestored`、`calculationSavesPreserved`、`fileTransfer.restored`、`reopenedTarget.savedDataReadable`がすべてtrueだった。
- B-T4f：制御証拠（`node tools/test-storage-transfer.js`、`node tools/test-storage-transfer-page.js`、`node tools/test-storage-runtime.js`等）と、上記native実ブラウザ証拠を別欄・別runとして記録した。native runnerの途中失敗原因だった受信ページ初期化スコープ、送信側message listener欠落、重複READYの段階処理、runtime epoch受渡し、採取完了前のbaseline比較を補修し、成功runで再確認した。公開Origin、本番DNS、iOS/Android実機、狭幅表示は今回のnative証拠に含めていない。
- 達成条件数：T3 **2/2（B-T4e,f）**、P4 **6/6（B-T4a〜f）**。G0 3/3、T1 2/2、T2 2/2は前単位の確定値として維持する。変更JSの構文、関連transfer/page/backup/restore/runtimeテスト、`git diff --check`は成功。
- 未検証・残り見積もり：P4の実装条件は完了。P5aのroute manifest／alias・redirect・compatibility page、slash正規化、`assetUrl()`範囲、schema validation／衝突検査、Service Worker旧cache更新は未実装。`/`は当面静的`/manager/`転送、`/data/`は上部バー付き一覧ページと確定したが、公開Originでの転送、モバイル実機、P5b以降は未検証。補助的に実行した旧`node tools/test-storage-baseline.js`は30秒超で1GB級までメモリを使用したため停止し、P4の根拠へ採用していない（P4必須のbehavior baselineは成功）。設計確認1単位の後、別GoalでP5aを開始する。
- 停止条件：P5は実装せず、実装前設計の残判断だけを整理して停止する。datasheet・生成データ・公開設定、commit/push、自動実行Goal有効化は行わない。

### P5実装前設計確認（2026-09-13）

- 確定済み：主要機能は`manager`→`/manager/`、計算は`calc`→`/calc/`。共有は`/share/`、移行は`/transfer/`、参照系は`/data/enemies/`・`/data/boards/`とする。論理IDと公開パスを分離し、共有hash／payload codec／保存キーは変更しない。
- alias／redirect／compatibility pageの責任分離は既存設計で整合している。aliasはmanifest上の別名、redirectはhostのslash正規化または生成静的転送、compatibility pageは旧Originで保存・バックアップ等を提供するページとする。alias間連鎖・任意next URL・全pathの管理画面転送は許可しない。
- slash正規化は`/calc`→`/calc/`等をhostの配信条件として検証し、`/calc/index.html`等の生成入口は既知正規pathへ一段転送する。Service Workerや404を正規化の代替にしない。実Pages／CloudflareのLocation、query/hash保持はP5/P6で確認する。
- `assetUrl()`は同一Originの成果物内asset rootから安全な相対資材だけを解決する責任に限定する。CSS位置、Worker位置、HTML生成時の参照解決、pageUrl、canonical/OGP、SW scope、資材版計算は別責任として台帳・生成工程に残す。
- P5a前に固定する技術契約：`tools/public-route-manifest.json`のschemaVersion 1、profiles/routes/reservedPaths、routeのsourceとgenerator排他、kind enum、profile別publicPath、alias、query/hash fixture、asset/SW情報。JSON Schema検査後に、ID・path・alias・reserved・target循環・自己転送・生成物占有を一つの衝突表で検査する。
- Service Workerは無条件`skipWaiting`／`clients.claim`を採用せず、未保存・転送／復元中のタブを自動reloadしない。known routeはnetwork-first、現行＋直前releaseだけを保持し、transfer/recovery/navigation payloadはcacheしない。これは設計であり、現行SWを変更済みとは扱わない。
- 確定事項：`/`は当面JS無効時のリンクを含む静的`/manager/`転送とし、将来portalへ同一home IDで差し替える。`/data/`は敵・ボードへの小さな一覧ページを置き、主要ページと同じ上部バー構造・主要導線を維持する。P5aではreserved扱いを解除し、manifest・生成・到達性検査へ接続する。
- 外部準備：公開成果物専用repo名の確定、Pages権限、fine-grained token、Cloudflare DNS、公開承認はP5b/P6の開始条件であり、P4完了やP5aローカル生成の阻害ではない。次のP5aはmanifest／生成／互換入口／資材・SW接続と公開前HTTP検査を2〜3単位で見積もる。

### 最新：P4 T2合格・T3着手（2026-09-13）

- T2の変更境界：T1の通信層を維持し、`storage-transfer-page.js`、`storage-transfer.html`、`stat-prototype.js`の転送導線、`stat-dashboard.html`の転送ボタン、`tools/test-storage-transfer-page.js`を対象にした。既存保存writer、datasheet、生成データ、公開設定は変更していない。
- B-T4c：新規受信ページで`PAYLOAD`を既存`storage-backup.js`のdecodeへ通し、件数・dataset・補助除外候補・表示設定をpreview表示する。初回受信ではapplyせず、明示的なplan確認後だけ`storage-runtime`の`planRestore`、さらに利用者の復元操作後だけ`applyRestore`へ進む。復元完了後のruntime epochと内部transactionIdをT1 receiptへ渡す。管理画面の「新サイトへ移す」はクリック中に受信タブを開き、採取後にmaintenanceを解放する。
- B-T4d：`node tools/test-storage-transfer-page.js`で実codecのdecode→preview→plan→apply、明示確認前の保存ゼロ、cancel、receipt、ファイル入力相当のdecode→plan→cancelを動作確認した。ファイル代替は新しい保存writerを使わず同じruntime pipelineへ接続する。UI上の受信側変更は既存runtimeのstale/readback/rollbackに委ねる。
- 達成条件数：T2 **2/2（B-T4c,d）**。`node --check storage-transfer-page.js`、`node --check stat-prototype.js`、`node tools/test-storage-transfer-page.js`は成功。T1 2/2、G0 3/3は前単位の確定値として維持する。
- 未検証・残り見積もり：T2は隔離制御とHTML構造確認までで、実2 OriginのpostMessage、実クリック、実download/file input、新規タブ再起動は未検証。P4 T3のB-T4e,fが未達。P5実装・公開設定・スマホ実機・commit/push・自動実行Goal有効化は対象外。
- 停止条件の更新：T2が合格したためT3へ進む。T3のnativeが環境阻害で再現不能なら同じtimeoutを反復せず、HTTP/CDP/権限/ダイアログ/OS前面状態を分類して停止する。

### 最新：P4 T1合格・T2着手（2026-09-13）

- T1の変更境界：G0の既存変更を維持し、新規対象を`storage-transfer.js`と`tools/test-storage-transfer.js`に限定した。保存writer、runtimeの復元処理、datasheet、生成データ、公開設定、管理画面UIはT1では変更していない。
- B-T4a：`storage-transfer.js`に旧Origin送信側／新Origin受信側の状態機械を追加した。固定http(s) Origin、Window参照、nonce、transferId、protocol/type/stage、packageDigestを各受信入口で検査し、`*`や任意URLを受け付けない。PAYLOADは同じbackup package文字列とdigestを保持し、PREVIEW→APPLYING→RESULTの順でreceiptに元digest・選択・内部transactionId・epochを結合する。成功RESULTは`committed:true`と整合したreceiptがない限り受理しない。
- B-T4b：`node tools/test-storage-transfer.js`で同一payload再送、ACK欠落後の同一digest再送、完了後receipt再通知、異なるdigest、異なるOrigin／Window、実保存前の成功RESULT、receiptのdigest違いを同じ通信検査経路へ通した。受信payload callbackは一度だけで、二重適用を示す再処理は発生しない。STATUS_QUERYは状態・receiptの再照会だけで保存を行わない。
- 達成条件数：T1 **2/2（B-T4a,b）**。`node --check storage-transfer.js`、`node --check tools/test-storage-transfer.js`、`node tools/test-storage-transfer.js`は成功。G0 3/3は前単位の確定値として維持する。
- 未検証・残り見積もり：T1は制御証拠のみで、実HTTP 2 Origin・nativeクリック・実runtime復元は未検証。P4 T2（送受信UI、確認/取消、ファイル代替）とT3（独立ブラウザ2 Origin）が未達。P5実装・公開設定・スマホ実機・commit/push・自動実行Goal有効化は対象外。
- 停止条件の更新：T1が合格したためT2へ進む。T2では通信層を再実装せず、既存codec→preview→planRestore→applyRestoreを接続する。T2未達ならT3へ進まない。

### 最新：G0合格・P4 T1着手（2026-09-13）

- 着手時の変更境界：既存の未コミット変更を維持した。G0の対象は`storage-backup.js`、`tools/test-storage-backup.js`、`tools/test-storage-restore.js`、本`STATUS.md`、`docs/storage-s1-acceptance.md`。保存writer、datasheet、生成データ、公開設定、P4実装はG0開始時点では変更境界外とした。G0-1のcodec補修とG0-2/G0-3の検査補強だけを実施し、通常のアプリ保存入口は変更していない。
- G0-1：payload全体のJSON安全性・深度・ノード数、payload/dataset外形を補助datasetの意味検証より先に通すよう`storage-backup.js`を補修した。正しいdigest付きの「未知DPS版＋危険キー」「補助不正＋深度超過」「補助不正＋余計なdataset項目」は同じ`decodeBackupPackage`入口で`invalid-data`／`oversize`となり、安全な未知DPS版だけは除外候補として維持することを`node tools/test-storage-backup.js`で確認した。別の実decode診断でも危険キーは`invalid-data`となった。
- G0-2：`tools/test-storage-restore.js`で`stat-prototype.js`の本番`renderBackupPreview`／`prepareBackupRestore`／`applyBackupRestore`を隔離VMへ抽出し、UI制御を実行した。明示同意なしのplan拒否、apply失敗時のcancel/rollback、保留previewの再表示、除外同意の未選択リセット、再確認後の明示同意・再適用成功を確認した。旧静的文字列検査は動作証拠として扱っていない。
- G0-3：実apply後のFakeStorage raw→新VM本番loader→共通一致assertを維持し、保存計算3件のid/name/savedAt/snapshot一致を確認した。同じassertへ保存省略storageと読込み省略`null`を通し、両反例が失敗することを確認した。`node tools/test-storage-restore.js`は成功。
- 達成条件数：G0 **3/3**。変更JSの構文、backup/restoreの関連テスト、`git diff --check`はG0終了時点で成功。R1〜R5の旧5/5やP4即開始の履歴は現行判定へ無条件継承しない。
- 未検証・残り見積もり：G0についてnative UIの追加証拠は取得していない。P4 T1の転送プロトコル・receipt、T2の送受信UI、T3の独立2 Origin native確認は未着手。P5実装・公開設定・スマホ実機・commit/push・自動実行Goal有効化は対象外。
- 停止条件の更新：G0の前単位が合格したため、次のT1では`storage-transfer.js`と焦点テストだけを対象に進める。T1未達ならT2へ進まず、P5へも進まない。

### 最新：P4開始条件の再確認・Luna指示作成（2026-09-13）

- 正しいdigest付きの未知DPS版＋危険プロパティを実decodeへ投入し、除外によって危険キー検査を通過する反例を再現。R3完全合格を撤回。R4は静的文字列検査、R5はnull入力との不一致確認までで、再試行実行・保存省略の共通assertが不足。下記5/5とP4即開始可は現行判定に使わない。
- [Luna指示](docs/storage-p4-luna-instructions.md)にG0限定補修→T1〜T3→P5設計確認の順を設定。G0合格後にP4へ続行できる。既存成功証拠は維持し、全体の再検証は求めない。
- 今回は読取り・隔離codec診断・文書更新のみ。実装未変更、Goal未有効化。G0 0/3、P4は今回未実施。残見積もりG0 1単位＋T1〜T3 3単位、P5のhome/data選択等は別判断。

### 最新：R1〜R5限定補修完了・C2再判定（2026-09-13）

- 着手時の変更境界：既存のdirty変更を維持した。今回の補修対象は`storage-backup.js`、`stat-prototype.js`、`tools/test-storage-backup.js`、`tools/test-storage-restore.js`、`docs/storage-backup-format.md`、本`STATUS.md`と受入台帳。通常保存writerの仕様変更、datasheet、生成データ、公開設定、URL実装、P4は対象外。
- R1：slotStore不在で旧`legacy.savedStates`に保存枠がある場合、旧移行処理をbackup側へ推測複製せず、`recovery-required`で通常backupを拒否して救出を案内する。空の旧`savedStates`だけはabsentを維持する。これにより保存枠をabsentとして正常出力する反例を止めた。
- R2：`calc.resultSaves[].savedAt`を本番`loadDamageCalculationSaves()`が保持できる有限の非負数へ限定し、ISO日時・数値文字列を事前拒否する。現行writerの`Date.now()`数値、保存計算の件数・snapshot検査は維持した。
- R3：digest検証済みファイルの補助3datasetだけ、意味検証の失敗を`excluded`候補へ変換する。元`payloadJson`／digestは保持し、明示確認なしのplanを拒否、確認ありは対象キーを変更しない。必須dataset、保存計算、外側形式、digest、危険プロパティ、容量は除外しない。
- R4：apply失敗または復旧rollback後、保留packageからpreviewを再描画する。除外checkboxは未選択へ戻るため、同意を自動復元しない。静的な実UI制御経路確認を追加した。
- R5：実apply後のFakeStorageから`calc.resultSaves` rawを読み、新VMの本番loaderへ渡した。3件のID・名前・数値日時・snapshotを全件比較し、保存キー読込省略は同じ比較で不一致になることを確認した。
- 達成条件数：R1 1/1、R2 1/1、R3 1/1、R4 1/1、R5 1/1。`node tools/test-storage-backup.js`、`node tools/test-storage-restore.js`、`node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-runtime.js`、変更JSの構文確認、`git diff --check`が成功した。正常系だけでなく各レビュー反例を同じcodec／restore／loader／UI制御経路へ接続した。
- 未検証：旧`savedStates`をcanonical slotsへ変換する機能は提供せず、旧形式native入力とrollback再確認のnative操作は追加していない。native既知timeoutの再実行はしていない。R1は管理画面の既存移行または救出が必要、R2の空name／日時欠落は現行loader既定値補完を伴うため互換差として維持する。
- Gate判断：C2の今回の重大欠落条件は1/1へ戻せる証拠が揃い、P4へ進める判断材料は整った。ただし今回の停止条件に従いP4/P5、native追加確認、commit/push、自動実行Goal有効化は開始していない。P4では旧形式拒否時に救出／管理画面移行へ案内する契約を維持する。

### 最新：R1完了・R2着手（2026-09-13）

- 着手時の変更境界：既存のdirty変更を維持した。R1の実装・検証対象は`storage-backup.js`、`tools/test-storage-backup.js`、`tools/test-storage-restore.js`、本`STATUS.md`と受入台帳のみ。管理画面の旧形式移行／通常保存writer、datasheet、生成データ、公開設定、P4は変更していない。
- 対応条件：R1「slotStoreがない旧`legacy.savedStates`を`stat.slots: absent`として正常出力しない」「安全な変換ができない場合は通常backupを拒否して救出へ誘導」「拒否時に入力相当値・復元先の既存slotを変更しない」を確認する。
- 実装：現行の`stat-prototype.js`内の旧slot移行はアプリ状態・カード／編成正規化へ依存するため、backup codecへ推測実装を複製せず、slotStore不在かつlegacy `savedStates`に値がある場合を`recovery-required`で明示拒否する。空の`savedStates`だけは従来どおりslot absentとして扱う。
- 制御証拠：`node tools/test-storage-backup.js`で旧`savedStates`付き`stored-only`入力が通常packageにならず、旧形式・救出の案内を返し、入力値が不変であることを確認。空の旧`savedStates`はabsentとして成功。`node tools/test-storage-restore.js`で同じbackup入口の拒否後に復元先FakeStorageのslot・他領域へ`setItem`／`removeItem`がないことを確認。変更JSの構文も成功。
- 達成条件数：R1 1/1。制御とnativeは混同していない。これは旧C2 0/1や旧C1〜C3 3/3を再利用した判定ではない。
- 未検証・残り見積もり：旧形式を純粋converterで復元する経路、nativeで旧形式を管理画面移行前に採取する経路は今回の安全拒否方針では未対応。R2（日時保持）、R3（ファイル内補助datasetの除外）、R4（rollback後再確認）、R5（実保存先→新context loader）は未達。残り2スライス相当（R2/R3、R4/R5）。
- 停止点：R1の前スライス合格を確認したためR2へ進む。P4実装、native既知timeoutの反復、datasheet／生成データ／公開設定、commit/push、自動実行Goal有効化は行わない。

### 最新：R2完了・R3着手（2026-09-13）

- 対応条件：R2「本番loaderで保持できない計算保存日時を正常受理しない」「現行writerの数値日時を維持し、旧形式は明示変換または事前拒否する」を確認した。保存計算の任意`name`／`savedAt`欠落によるloader既定値補完は仕様差として記録し、今回の必須日時反例は明示した。
- 実装：`storage-backup.js`の`calc.resultSaves[].savedAt`検査を有限の非負数だけに限定した。ISO日時や数値文字列を現行loaderへ渡して`0`化する経路は、正常backup作成時に`invalid-data`で拒否する。現行writerの`Date.now()`数値と既存slot日時の形式は変更していない。
- 制御証拠：`node tools/test-storage-backup.js`で50件の数値日時を含む正常package、ISO日時反例の事前拒否、50件超・snapshot version不一致・容量超過を確認。`node tools/test-storage-restore.js`も再実行成功。`node --check storage-backup.js`成功。既存の実loader診断でISO日時が`0`になることを修正前根拠として維持した。
- 達成条件数：R1 1/1、R2 1/1。R2の日時以外のloader補完（空name／日時欠落）は現行挙動を変えず、テスト上でraw値とloader後値を混同しない残条件として扱う。R3〜R5は未達。
- 未検証・残り見積もり：ファイル入力でpresent補助datasetを除外候補化するcodec経路、rollback後preview、実保存先を読むloader検証が未達。残り2スライス相当（R3、R4/R5）。
- 停止点：R2の前スライス合格を確認したためR3へ進む。native既知timeoutの反復、通常保存writer、datasheet／生成データ／公開設定、P4、commit/push、自動実行Goal有効化は行わない。

### 最新：manager/calc確定・軽量な将来設計（2026-09-13）

- 文書対象：公開URL台帳、Gate C補足、配信契約、将来設計メモ、GOAL/STATUS。公開URLのdamageをcalcへ変更し、ソースHTML名・計算の論理IDとは分けた。
- [将来設計](docs/public-site-future-plan.md)：/のトップページ化で既存深いURLを維持し、P5a生成→P5b配信→P6実Origin/スマホ確認の出口を記録した。名称更新と概略作成の2/2を完了。文書整合・差分確認を行い、アプリ実装は未変更。
- 未決定：home/dataの方式、manifest実schema、最終資材版の依存順。概略設計の残作業0、P5実装前の詳細照合を1設計単位とする。保存C2未達とP4開始前の限定補修条件は従来どおり。実装・公開・自動実行Goalは開始しない。

### 最新：重大修正再レビュー・Gate C補足設計（2026-09-13）

- [再レビュー](docs/storage-critical-fixes-review-20260913.md)のR1〜R5を確認。旧savedStates採取でslot消失、ISO日時が実loaderで0、不正present補助datasetがdecode全体拒否となる反例を本番モジュールで再現した。再試行UIとloaderテスト接続はコード確認。
- 達成数：C2 0/1へ訂正。C1/C3は既存証拠を保持し今回未再検証（既存達成2/3、今回の修正0/5）。以下の3/3・残り0は撤回。P4開始は限定補修後の確認まで保留。
- 変更境界：URL台帳・Gate C補足・配信契約・レビュー・GOAL/STATUS/受入記録のみ。アプリ実装、実行テスト、公開設定は変更していない。未コミット変更を保持。
- URL：manager/damageを主要機能、data配下を参照系、shareを短い共有入口として整理。alias/転送/互換ページ、slash正規化、assetUrl、manifest検査、SW更新責任を補足。`/`の方式と`/data/`一覧有無は利用者選択待ち、Gate C全体未確定。
- 未検証：今回native未実行、slashの本番HTTP挙動、SW更新・新旧成果物、公開Originは後続。残りは重大補修を約2〜3作業単位、Gate Cは2選択の確定と生成/版依存の実装前照合。自動実行Goal再開・P4実装・commit/pushなし。

### 最新：重大修正C2補修合格・C1〜C3停止（2026-09-13）

- 着手時の変更境界：既存の未コミット変更を維持した。今回の補修対象は`storage-backup.js`、`storage-runtime.js`、`stat-dashboard.html`、`stat-prototype.js`、`tools/test-storage-backup.js`、`tools/test-storage-restore.js`、`docs/storage-backup-format.md`、本`STATUS.md`と受入台帳。通常のアプリ保存writer、datasheet、生成物、公開設定、P4は変更していない。
- 対応条件：C2の「補助設定の不正を明示確認付きで除外し、除外先と保存計算結果を保持」および「実codec→plan→apply→新context実loaderを一つの復元経路で確認」。C1の旧runtime保存拒否補強とC3の独立救出は既存合格証拠を再利用した。
- 実装：`calc.settings`／`dps.settings`／`dps.runtimeOverrides`だけを補助datasetとして、既知の型・設定版の検査失敗を`state:"excluded"`へ明示表示できるようにした。容量超過・危険プロパティ・必須datasetは除外へ変換しない。復元計画は`allowAuxiliaryExclusion`が明示されない限り拒否し、許可時は該当キーへ書き込まず現在値を維持する。UIにも除外候補と確認チェックを接続した。
- 制御証拠：`node tools/test-storage-backup.js`で3補助datasetの不正／unsupportedを除外候補化し、確認なし拒否・確認ありスキップ・`calc.resultSaves`保持、危険プロパティ／容量超過の拒否を確認。`node tools/test-storage-restore.js`で同じpackageを実runtimeのplan→applyへ通し、除外先`calc.settings`不変、保存計算結果を実保存した後に別VMの本番`loadDamageCalculationSaves`でid/name/savedAt/snapshot一致を確認した。runtime／behavior基準も成功。
- 達成条件数：C1 1/1、C2 1/1、C3 1/1、合計3/3。C2補修前の0/1監査記録と旧C2 2/3は履歴であり、今回の証拠で訂正した。
- 未検証・残り見積もり：今回の補修について追加native UI証拠は取得していない。既存の独立救出native個別成功はC3の証拠として維持するが、既知のfocus/visibility・stat確認・lifecycle前面状態に依存する全runner終了コード1はnative環境記録として分離する。本Goalの修正範囲は0作業単位。
- 停止点：C3後停止条件を満たした。Gate Aは復元transaction・世代拒否・session再構成・補助除外時の対象キー不変、Gate Bはcanonical backup/restore・必須保存計算結果保護・不正／上限拒否・独立救出の判断材料が揃った。P4、追加native検証、datasheet／生成物／公開設定、commit/push、自動実行Goal有効化へは進まない。

### 再監査：C1補強合格・C2補修着手前（2026-09-13）

- 対応条件：C1の「復元後も稼働中の旧runtimeが保存できない」を追加確認。対象は`tools/test-storage-runtime.js`とSTATUS・受入台帳のみで、保存writer・datasheet・生成物・公開設定は変更していない。
- 証拠：`testOldRuntimeCannotSaveAfterRestoreEpoch`で、boot済み旧runtimeの共有metaを復元後epochへ変更し、同じ`runtime.writeRaw`を実行。`stale`を返し、既存保存値を維持、対象キーへの`setItem`試行なしを確認。`node tools/test-storage-runtime.js`と変更JS構文も成功。
- 達成条件数：C1 1/1（補強後も達成）、C2 0/1（補助設定除外と単一経路証拠が未達）、C3 1/1（既存証拠）。
- 未検証・残り見積もり：補助設定の不正を明示確認で除外する実装・反例、C2の単一実保存経路へのloader接続が未達。1作業単位で補修後に再判定する。P4には進まない。

### 最新：重大修正C1〜C3完了・停止（2026-09-13）

- [修正限定Goal](docs/storage-critical-fixes-goal.md)の固定条件C1〜C3を3/3達成。開始時の既存dirty変更を維持し、通常保存writer、datasheet、生成データ、公開設定、P4、commit/pushは変更境界外とした。
- C1：復元後の空sessionを世代制御に従って再構成し、旧sessionの保存を許可しない。local必須データ・無関係sessionを保持する制御証拠と、独立browser新規tabの個別成功証拠を確認した。
- C2：canonicalな`stat.slots`／`stat.current`を採取・再構成し、current-tabとstored-onlyのmirror選択を分離。workspace/live/legacyの運用ID・revisionを復元先で再生成し、保存計算結果のid/name/savedAt/snapshotを全件保持した。未対応snapshot version・50件超は切り捨てず事前拒否し、別VMの本番loader、DPS対象切替・再読込、実画面の保存・読込代表を確認した。
- C3：`storage-runtime.js`の`exportRescueDirect`と`storage-recovery.html`の直接救出入口を追加。通常boot、maintenance、flush、Lock取得なしで、壊れたjournalを保持したまま救出ファイルを実downloadでき、アプリ保存キーへの書込みがないことを確認した。読取失敗は救出内容へ明示する。
- 制御証拠：`node tools/test-storage-runtime.js`、`node tools/test-storage-backup.js`、`node tools/test-storage-restore.js`、`node tools/test-storage-behavior-baseline.js`が成功。変更JSの構文確認と`git diff --check`も成功。正常系だけでなく、保存省略、未対応版、上限超過、壊れたjournal、読取失敗の反例を同じ検査入口で確認した。
- native証拠（制御と分離）：独立profile・localhostで`standaloneRescue.ok=true`（壊れたjournalの保持、storage不変、通常boot未実行、実救出download）を確認した。全runnerの終了コード1はfocus/visibility、stat確認、lifecycleの前面状態・タイミング依存で、同じtimeoutは反復していない。C3個別成功を全runner成功へ繰り上げていない。
- 未検証・残条件：最新native全runnerの補助checkは一括合格ではないため、focus/visibility・stat確認・lifecycleの再現性は環境課題として残る。P4の転送実装、追加native検証、スマホ実機、datasheet・生成物・公開設定、commit/pushは未実施。補助DPS設定の意味的完全再現は今回の修正条件外でraw JSON保護に限定した。
- 残り見積もり：本Goalの修正範囲は0作業単位。上記の環境課題とP4以降は別Goalとして扱う。
- 停止点：修正Goalを完了として停止。P4は開始可能な設計状態だが、今回の指示では実装へ進まない。

### 最新：C2合格・C3着手（2026-09-13）

- C2（Gate Bのcanonical復元と保存計算結果保護）を2/3達成として確定し、C3（独立救出）の着手境界へ進んだ。対象は`storage-backup.js`、`storage-runtime.js`、`tools/test-storage-backup.js`、`tools/test-storage-restore.js`、`tools/test-storage-behavior-baseline.js`、`tools/storage-native-browser-check.js`、およびSTATUS・受入台帳。既存dirty変更を維持し、通常保存writer、datasheet、生成物、公開設定、P4、commit/pushは対象外。
- C2実装：backup payloadをraw mirror一覧からcanonicalへ変更した。`stat.slots`はslot 1〜6の`savedAt/snapshot`、`stat.current`は`activeSlot/snapshot`、`current-tab`はworkspace優先、`stored-only`はlive優先でlegacyへfallbackする。復元時はslotStoreをschema2・revision1・transactionId付き`savedBy`へ再構成し、workspace/live/legacyのworkspaceId・sourceTabInstanceId・revision・activeStateSlotを復元先で生成する。保存計算結果はid/name/savedAt/snapshotを全件保持し、50件超・snapshot version不一致を切り捨てず事前拒否する。
- 制御証拠：`node tools/test-storage-backup.js`、`node tools/test-storage-restore.js`、`node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-runtime.js`が成功。canonical形式のround-trip、6 slot、current-tab/stored-onlyのmirror選択、保存計算50件、50件超・version3反例、restore transaction/readback/rebootを確認した。別VMの本番`loadDamageCalculationSaves`へ復元rawを渡し、id/name/savedAt/snapshotの全件一致を確認。保存を省いた既存import反例も同じ本番入口のassertionで失敗する。
- native証拠（制御と分離）：独立profile・localhostで最新`node tools/storage-native-browser-check.js --summary`を1回実行。`dpsApplication.ok=true`（DPS起動・Momo→Sylla→Momo・再読込復元・保存計算結果のUI保存→読込、snapshot version4）、`statBackup.ok=true`（実download/file input、preview/取消不変、canonical backupの復元適用・再読込）、`statBrowserQuota.ok=true`、`storageFreshTabAfterRestore.ok=true`、`storageBootGuard.ok=true`。全体終了コード1は`storageAppLifecycle`の既知5秒timeoutのみで、個別成功を全体成功へ繰り上げていない。
- C2未検証：C3の起動失敗・Web Locks非対応を含む独立救出、救出ファイルの実download確認が残る。native lifecycle timeoutは既存成功runを再利用し、同じtimeoutを反復しない。補助DPS設定の意味的な完全再現は今回の必須条件に含めず、raw JSON保護と保存計算結果保護を優先した。
- 残り見積もり：C3を1作業単位。C3終了後にC1〜C3の修正結果とP4開始可否を報告して停止し、P4実装へ進まない。

### 最新：修正のみGoal設定・待機（2026-09-13）

- [修正限定Goal](docs/storage-critical-fixes-goal.md)を作成し、C1〜C3の固定条件・Luna開始指示・C3後停止を設定した。P4実装は今回対象外。
- 実装達成0/3（前回状態から変更なし）。今回は文書のみ更新。既存未コミット変更を維持し、アプリ・実行テストには触れていない。
- 未検証：重大修正後の制御/native証拠すべて。残見積もり3スライス、C2は複数作業単位になり得る。
- 設定完了後に停止。実装・commit/push・自動実行Goal有効化は行わない。

### 最新：C1合格・C2着手（2026-09-13）

- 対応条件C1（復元後の起動継続）を1/3達成。開始境界は`storage-runtime.js`、`tools/test-storage-runtime.js`、`tools/storage-native-browser-check.js`、本STATUSと受入台帳。既存dirty変更、datasheet、生成物、公開設定、P4は維持・対象外。
- 実装：起動時の新runtimeで、復元後の空markerまたは世代違いを検出した場合に`stat.workspaceDraft`、`stat.reloadContext`、`comparison.session`だけをreadback付きで再構成し、session epochを最後に確定する。初回通常起動はmarkerのみ作成する。実行中runtimeのpageshow世代不一致によるstale拒否は維持。
- 制御証拠：`node tools/test-storage-runtime.js`成功。restoreSerial=1の旧sessionから起動成功、3つの許可sessionキー削除、無関係sessionキー保持、local meta保持、Web Locksありのshared保持、session削除失敗時の`remove-failed`・起動blockedを確認。
- native証拠（制御と分離）：専用一時Chromeの`storageFreshTabAfterRestore`個別checkが成功。`statBackup`の復元→同一タブ再読込成功後、別新規tabでboot=ready、error画面なし、stat初期化、marker再構成、workspace/reloadContext/comparison除去を確認。runner全体は既知の`storageAppLifecycle` 5秒timeoutのみで終了コード1、C1個別結果へ繰り上げていない。
- 変更JS構文：`node --check storage-runtime.js`、`node --check tools/test-storage-runtime.js`、`node --check tools/storage-native-browser-check.js`成功。`git diff --check`は既存改行警告のみ。
- 未達：C2（Gate B形式・育成/編成/保存計算結果保護）0、C3（独立救出）0。C1の旧「bootはstaleで停止」反例は、同じruntime入口で修正後成功へ反転した。session再構成read/write各failureのnativeは未検証。
- 残見積もり：C2→C3の2スライス。C2はbackup codec・restore plan/apply・新context loaderの複数作業単位。

### 最新：保護優先度を限定しP4設計作成（2026-09-13）

- [重大修正案とP4設計](docs/storage-p4-transfer-design.md)を作成。設計成果は重大修正案/P4手順・契約の2/2。実装合格数ではない。
- 証拠：既存Gate A/B/C、P3レビュー、実loadDamageCalculationSaves/writeDamageCalculationSavesを照合。保存結果はfilter/sliceによる欠落を事前検証で防ぐ設計。ブラウザAPIの一次資料も確認した。
- F3のDPS設定完全再現は延期可能とした。保存結果・育成/編成への影響、起動不能、失敗時保護は必須のまま。補助設定除外は明示確認・復元先キー不変とする。
- 未達：C1〜C3の実装修正0/3、P4 T1〜T3未着手0/3。実機/公開Originは未検証。前回反例が解消したとは判定していない。
- 残見積もり：重大修正3単位＋P4実装3単位。P5/P6は別。文書のみ変更し既存dirtyを維持。アプリ・テスト・公開設定の変更、commit/push、Goal有効化はなし。

### 最新：P3完了判定をレビューで撤回（2026-09-13）

- [実装レビュー・次の修正設計](docs/storage-p3-review-20260913.md)を参照。P4への進行は保留。
- 今回の変更境界はレビュー文書・STATUS・GOALのみ。既存未コミット変更を維持し、アプリ・実行テスト・datasheet・生成物・公開設定は変更していない。
- 実装上の残条件は4件：F1復元後の新規session起動、F2Gate B正規化/rebuild、F3未知版拒否、F4起動不能/互換環境の救出。今回解決0/4、未達4/4。旧R4-3の6/6・P3残り0は採用しない。他の達成条件の全面再集計は今回未実施。
- 証拠：backup/runtime/restoreの基準テスト3本は成功。一方、実runtimeの空session起動でstale、実backup codecでsettingsVersion=999の受理を再現。F2/F4は契約と実装を照合した。
- 未検証：今回のnative新規タブ・異常時救出ダウンロード。制御結果をnative証拠にしていない。
- 残見積もり：Q1〜Q3の3修正スライス（Q2は複数作業単位の可能性）。P3再合格後にP4設計。今回は設計を残して停止し、実装・commit/push・自動実行Goal有効化はしていない。

### 最新：R4-3完了・P3完了（2026-09-13）

- 開始時の変更境界：既存の未コミット変更を維持した。R4-3の対象は`storage-runtime.js`、`tools/test-storage-restore.js`、`tools/storage-native-browser-check.js`と、結果を記録する`STATUS.md`、`GOAL.md`、`docs/storage-s1-acceptance.md`、`docs/storage-p3-luna-goal.md`、`docs/storage-backup-format.md`、`docs/storage-native-browser-environment.md`。既存の画面writer、datasheet、生成データ、公開設定、P4以降は変更境界外とした。
- 着手条件：A-T4/A-T5/A-T6、B-T1/B-T3。R4-1/R4-2の実装・制御証拠を再利用し、R4-3では不足していた各失敗境界、journal上限、救出、native代表を補った。旧P2完了、旧25/41、旧P1b 3/3は判定に使用していない。
- 制御証拠（A-T4/A-T5/A-T6）：`node tools/test-storage-restore.js`が成功。prepared/applying journalの保存・読戻し、local各set/readback/final readback、remove/readback、meta各境界、commit読戻し、session workspace/readback・reloadContext/comparison削除・epoch、journal削除と再試行を、同じ`applyRestore`入口へ操作×キー別に注入した。失敗時のrollback、commit後session-pending、再起動復旧、journal保持、成功の早出しなし、raw/snapshotをログへ出さないこと、対象外キー不変を確認した。quota例外は`quota`、16MiB超journalは`oversize`として区別し、保存を省いた反例も同じassertionで失敗した。
- 制御証拠（B-T1/B-T3）：`node tools/test-storage-backup.js`で12 datasetと救出形式の区別・decodeを確認し、最大育成fixtureのpackage 1,861,098 bytes、payload 1,475,105 bytes、before journal 1,473,776 bytesを再確認した。`node tools/test-storage-runtime.js`、`node tools/test-storage-behavior-baseline.js`も成功。復元の対象slot、workspace、live/legacy、session再構成、readback、再起動後一致を確認した。
- native証拠（制御と分離）：`node tools/storage-native-browser-check.js --summary`を専用一時Chrome・専用profile・localhost Origin・専用download先で実行した。page/DOM/JSON投入/download/storage event/focus・visibility、stat本番保存・draft・実export・file input、preview/取消の意味的storage不変、救出ファイル`trickcal-manager-rescue`の実保存・decode、復元apply・対象slot/workspace再読込・journal削除・対象外キー不変、2タブshared/exclusive、DPS起動・Momo→Sylla→Momo・再読込復元、boot guardを確認した。追加した`statBrowserQuota`では4,718,592文字の一時フィラーでChromeの`QuotaExceededError`を発生させ、実復元UIのquota表示、元データ不変、journal不変を確認した。`statBackup`、`statBrowserQuota`、`statRuntimeLocks`、`dpsApplication`、`storageBootGuard`は最新runでtrue。`storageAppLifecycle`と補助fixtureのfocus/visibilityは最新runで前面状態依存のtimeout/visible残りだったが、既存の別native runで実アプリhidden/visible、hidden中busy、pagehide解放、pageshow再boot、fixture focus/visibilityの成功証拠があり、既知の環境揺れとして別管理する。
- 実行結果：変更JSの`node --check` 7件、`node tools/test-storage-backup.js`、`node tools/test-storage-runtime.js`、`node tools/test-storage-restore.js`、`node tools/test-storage-behavior-baseline.js`、`git diff --check`が成功。差分検査は既存の改行コード警告のみ。native全体終了コードは前面状態依存の`focusVisibility`/`storageAppLifecycle`だけで1だったため、個別check成功を全体終了コード0へ改変していない。
- 達成条件数：R4-3固定6条件中6件を達成（A-T4、A-T5、A-T6、B-T1、B-T3、native代表）。B-T3はcodec容量、制御quota、実ブラウザquota、復元readback/rebootを確認した。P3/R4-3を完了扱いとする。
- 未検証・残り見積もり：P3必須条件の残りは0。ブラウザ全消去、Origin転送、スマホ実機、P4以降は今回の対象外。前面状態依存の既知timeoutは成功runがあるため同じtimeoutを反復しない。
- Gate A/B判断材料：Gate Aは全restore境界を`prepared→applying→committed→session-pending→complete`で扱い、commit前失敗はrollback、commit後失敗はjournal保持・再起動復旧、journal不明時はboot停止する証拠が揃った。Gate Bは正常backup、救出形式、対象外領域保護、容量上限・codec実測、制御quota、実ブラウザquota安全停止、実UI往復の証拠が揃った。上限以内でもquotaを保証しない契約と、quota時に自動削除せず安全停止する挙動を確認した。
- 停止点：P3完了として停止する。P4以降、datasheet/生成データ/公開設定、commit/push、自動実行Goal有効化は行わない。

### 最新：R4-2完了・R4-3へ進行（2026-09-13）

- 開始境界：R4-2開始時の既存dirty変更を維持した。対象は`storage-runtime.js`、`stat-dashboard.html`、`stat-prototype.js`、`stat-dashboard.css`、`storage-recovery.html`、`tools/test-storage-restore.js`と、`GOAL.md`、`STATUS.md`、`docs/storage-p3-luna-goal.md`、`docs/storage-s1-acceptance.md`。通常保存動作、datasheet、生成物、公開設定、P4転送は変更境界外とした。
- 対応条件と達成数：R4-2（restore確認UI、表示設定選択、対象確認後apply、取消、独立復旧入口）1/1。R4-2は1/1。
- 実装結果：statの既存previewへ対象確認段階と最終apply段階を追加した。previewでは書込せず、planは同じruntimeの再照合を行い、applyはR4-1のjournal transactionを通す。完了後は旧runtimeをblockedにしてreloadを要求し、journalが残る失敗は独立復旧リンクと再試行へ分岐する。`storage-recovery.html`は通常app bootを経由せず、`inspectPendingRecovery/recoverPendingJournal`を使う。
- 制御証拠：`node tools/test-storage-restore.js`が成功し、独立入口のjournal検査・prepared rollbackも確認した。R4-1の正常/失敗回帰、`node tools/test-storage-runtime.js`、`node tools/test-storage-backup.js`、`node tools/test-storage-behavior-baseline.js`も成功。変更JSの構文確認も成功した。
- 未検証：nativeのrestore適用/取消/再起動、各set/remove/readback・commit・session・journal削除の網羅注入、ブラウザquota、救出ファイル、公開Origin、スマホ実機。R4-3へ残す。
- 残り見積もり：R4-2の残作業は0。R4-3は3〜5作業単位の概算。P4以降、datasheet/生成物/公開設定、commit/push、自動実行Goal有効化は対象外。
- 停止点：R4-2の出口を通過し、R4-3へ進む。次の着手条件はnativeで既存UIの確認→apply→reload、取消時のstorage不変を確認し、制御側でquota/全故障点/救出を共通入口へ接続すること。

### R4-1完了・R4-2へ進行（履歴）

- 開始境界：開始時の既存dirty変更をすべて維持した。R4-1の実装対象は`storage-backup.js`、`storage-runtime.js`、`tools/test-storage-restore.js`と、R4の進捗を記録する`GOAL.md`、`STATUS.md`、`docs/storage-p3-luna-goal.md`。既存通常保存入口、datasheet、生成物、公開設定、R4-2 UI、R4-3 quota/救出/native追加は境界外とした。
- 対応条件と達成数：R4-1（prepared/applying/committed/session-pending/complete、commit前rollback、A-T4/A-T5/A-T6制御境界）1/1。R4-1は1/1。
- 実装結果：検証済みbackup packageから固定順のrestore planを作成し、plan中はstorageを書き換えない。journalはbefore、after hash、new epoch、receipt、pending workspaceを保持し、phaseを除くdigestをreadbackする。local適用・meta・session再構成・journal削除を各readback付きで行い、commit前は逆順rollback、commit後はsession-pending再試行へ分岐する。完了後は旧runtimeをblocked/reload-requiredにする。
- 制御証拠：`node tools/test-storage-restore.js`が成功。正常適用、meta書込み失敗→rollback、rollback中断後の新runtime boot復旧、commit後workspace書込み失敗→session-pending→新runtime boot復旧、壊れたjournal保持・boot停止を、同じruntime/storage入口で確認した。`node tools/test-storage-runtime.js`、`node tools/test-storage-backup.js`、`node tools/test-storage-behavior-baseline.js`も成功。変更JSの構文確認も成功した。
- 反例の扱い：plan前後の対象local値不変、meta失敗時の`rolledBack`、rollback失敗時のjournal保持、session-pending失敗時の早期成功なしを確認。未知/壊れたjournalは削除・上書きせず`recovery-required`で停止する。
- 未検証：実UIのrestore確認/取消、独立復旧入口、各set/remove/readback・commit・session・journal削除の網羅注入、実ブラウザquota、救出ファイル、native復元・再起動、公開Origin。R4-2/R4-3へ残す。
- 残り見積もり：R4-1の残作業は0。R4-2は2〜3作業単位、R4-3は3〜5作業単位の概算。P4以降、datasheet/生成物/公開設定、commit/push、自動実行Goal有効化は対象外。
- 停止点：R4-1の出口で停止せず、次のR4-2へ進む。次の着手条件は確認UIがapply前・取消時に書き込まず、同じplan/apply入口を呼ぶこと。

### R3完了・R4未着手（履歴）

- 開始境界：開始時の既存dirty変更をすべて維持した。R3の実装対象は`storage-backup.js`、`storage-runtime.js`、`stat-dashboard.html`、`stat-prototype.js`、`stat-dashboard.css`、`tools/test-storage-backup.js`、`tools/test-storage-runtime.js`、`tools/storage-native-browser-check.js`。記録対象は`GOAL.md`、本`STATUS.md`、`docs/storage-s1-acceptance.md`、`docs/storage-p3-luna-goal.md`、`docs/storage-backup-format.md`、`docs/storage-native-browser-environment.md`。通常保存動作の変更、datasheet、生成物、公開設定、R4復元、commit/pushは境界外とした。
- 対応条件と達成数：R3-1（backup codec/validatorと12 dataset）1/1、R3-2（実ファイル出力・入力・preview・取消）1/1、R3-3（6 slot・計算保存50件・before journalのcodec容量測定）1/1。R3は3/3。
- R3-1の証拠：`node tools/test-storage-backup.js`が成功。12 dataset、present/absent、`current-tab`/`stored-only`、空配列/0/不在、旧slot形式・救出形式の区別、未知版・型・ID・破損・digest・危険キー・過大値・過大入力の反例を、同じcodec/validator入口で確認した。`node tools/test-storage-runtime.js`でruntimeのexport接続も確認した。
- R3-2の証拠：専用一時profile・localhost Originのnative `statBackup`個別checkが成功。実download 695,499 bytes、12 dataset preview、preview前後のstorage不変、取消前後のstorage不変を確認した。control側ではstored-onlyのdraft除外と既存writer回帰を確認した。UIはR4完了までrestore成功を表示しない。
- R3-3の証拠：`node tools/test-storage-backup.js`の実codec測定で、最大育成fixtureの6 slot・計算保存50件・before journalを含め、package 1,861,098 bytes、payload 1,475,105 bytes、before journal 1,473,776 bytes。package/payload 8 MiB、journal 16 MiBの入力上限内で、超過反例は同じ入口で拒否した。
- 検証の分離：`node tools/test-storage-backup.js`、`node tools/test-storage-runtime.js`、`node tools/test-storage-behavior-baseline.js`、変更JSの`node --check`、`git diff --check`が成功。native runner全体の直近終了コードは補助fixtureのfocus/visibilityと`storageAppLifecycle`のrun間タイミングで1だったため、R3のnative合格は`statBackup`個別結果だけに限定した。同じtimeoutは反復していない。
- 未検証：実Storageへのrestore/readback、再起動後一致、journal transaction・rollback・quota失敗、救出形式出力、公開service-worker cache反映、Origin転送、スマホ実機。これらはR4または後続範囲であり、R3の達成数へ含めない。
- 残り見積もり：R3の残作業は0。R4は復元・中断復旧・救出・quotaを3〜5作業単位の概算。P4以降、datasheet/生成物/公開設定、commit/push、自動実行Goal有効化は対象外。
- 停止点：R3出口で停止し、R4へは進まない。Gate BのR3判断材料は揃ったが、Gate Aの復元境界は未達のまま保持する。

### R1完了・R2再判定合格・R3開始（履歴）

- 開始境界：開始時のdirty変更を保持した。今回のR1新規対象は`stat-prototype.js`、`storage-runtime.js`、`formation-damage-dps-prototype.js`、`formation-dps-calc.js`、`tools/test-storage-behavior-baseline.js`、`tools/test-storage-runtime.js`と、R1の証拠を記録する`GOAL.md`、`STATUS.md`、`docs/storage-s1-acceptance.md`、`docs/storage-p3-luna-goal.md`。アプリの他保存コード、datasheet、生成物、公開設定は変更対象外。
- 対応条件・達成数：R1-1（stat起動catchのスコープと実script失敗経路）1/1、R1-2（破損slot/workspaceの保持と不存在分離）1/1、R1-3（hidden→visible後の再編集をpagehideへ保存、不要な二重flushなし）1/1、R1-4（DPS読取/保存失敗を空設定・成功へ変換せず通知）1/1。R1は4/4。
- 根拠：`node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-runtime.js`が成功。基準テストには実`persistState`／`loadDpsSettingsStore`／stat起動scriptを通した正常系と、起動ReferenceError、破損JSON、read/write失敗、保存省略、DPS再読込省略の同一入口反例を追加した。変更JSの`node --check`も全対象で成功した。
- 実装差分：statのparse/read/write失敗を`recovery-required`等へ分離し、破損値のfallback上書きを停止。DPS設定・runtime overrideの例外を握りつぶさず、メモリ計算継続と永続化失敗通知を分離。runtimeはpageshow後にhidden flush済みフラグを再利用せず、再編集後pagehideをflushする。
- R2対応条件・達成数：R2-1（契約・19キー・全access・boot接続の再照合）1/1、R2-2（部分失敗・epoch/journal・participant/lifecycle境界）1/1、R2-3（本番native代表と制御証拠の分離）1/1。R2は3/3。
- R2制御根拠：`node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-runtime.js`、`node tools/inspect-storage.js`が成功。`test-storage-baseline.js`は同じAST検査を多数の隔離反例で反復するため長時間無出力となり、合格証拠には採用していない。inspection本体とbehavior基準で代替せず、未実行として記録する。
- R2 native根拠（制御と別管理）：`node tools/storage-native-browser-check.js`を一時profile・専用Chrome・localhost Originで実行し終了コード0。stat実保存/draft/export/file input/import、対象外slot不変、DPS起動・Momo→Sylla→Momo・再読込、2タブexclusive busy/解放、実hidden/visible・pagehide/pageshow、未知journalの`recovery-required`停止を確認した。補助fixtureのfocus/visibilityを本番証拠へ繰り上げていない。
- R2実装差分：R1で変更した保存入口を含め、HTMLのbootstrap順、Facade経由access、失敗通知、runtime participant、journal/epoch guard、cache資材版を再照合した。R2ではbackup/restoreの実装変更はまだ行っていない。
- 未検証：R3の実codec・実package全体、容量上限・before journal、復元transaction/rollback/session再構成、救出、Origin転送。R1の故障をnativeで直接注入することはブラウザ代表では代替できないため、制御反例を証拠とする。
- 残り見積もり：R3は2〜3作業単位、R4は3〜5の概算。P4以降の転送・実機・公開は別範囲。

### 最新：G3 / P2後半・既存画面接続とnative確認（2026-09-13）

- 開始時境界：開始時の既存dirty変更を維持した。今回の対象はG3接続に必要な`storage-bootstrap.js`、`storage-runtime.js`、`storage-registry.js`、既存保存画面のFacade接続、`tools`の検査・native runner、`app-cache.js`／`service-worker.js`の資材版同期、STATUS・受入台帳。datasheet、生成データ、DNS/Pages公開設定、P3復元実装、commit/pushは対象外とした。
- 対応条件と達成数：G3-1（boot順・registry/cache接続）1/1、G3-2（管理writer）1/1、G3-3（計算/DPS writer・対象切替）1/1、G3-4（表示設定・読取consumer）1/1を制御／静的接続として達成。A-T1 native（実2タブshared中のexclusive busy、片方終了後の取得・cancel復帰）1/1、A-T2 native（hidden保持・visible復帰・pagehide解放・pageshow再boot）1/1、A-T3 native（破損journalのboot guard）1/1を達成。A-T5/A-T6は制御2/2とnative代表観測2/2を確認し、P2受入条件を満たした。A-T4のP3復元境界は対象外。
- 実装根拠：全7ページで`storage-bootstrap.js`→既存アプリscriptの順を固定し、既存writer/consumerをFacadeへ接続。runtimeはparticipant flush中だけ内部保存を許可し、通常のfreezing中書込は拒否する。stat participantの実Facade flushをruntimeテストへ追加し、修正前に再発する境界を固定した。
- 制御証拠：`node tools/test-storage-runtime.js`、`node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-baseline.js`（19 keys／5 channels／58 accesses）、`node tools/inspect-storage.js`が成功。baselineは本番と反例を同じ探索→解析→契約→台帳照合へ通し、boot順、cache版、未知参照、helper流出、保存省略反例を確認した。変更JSの`node --check`も成功。
- native証拠：`node tools/storage-native-browser-check.js`を専用一時Chrome／localhost Origin／専用profileで実行。stat保存、未保存draft、slot1実export、実file input、slot2適用後status、slot1再export一致、実confirmを確認。DPS起動、計算、Momo→Sylla→Momo、Momo 30秒/AUTO、Sylla 90秒/OFF→60秒、Momo設定の再読込復元を確認。`statRuntimeLocks`はpreflight flush成功、busy、解放後exclusive取得・cancel後shared復帰で成功。`storageAppLifecycle`はhidden中busy、visible復帰、pagehide後解放・peer exclusive、pageshow後stat再bootを成功。`storageBootGuard`は`recovery-required`・error画面・journal保持・アプリ入口未起動を成功。
- native結果の分離：直近runの全体終了コードはfixture focus/visibilityだけの失敗で1。ただし別runでfixtureの`visible/true→hidden/false→visible/true`成功を取得し、今回の実アプリlifecycleは成功した。HTTP、CDP接続、権限、file input、download、dialog、stat/DPS/Lock処理には新しい阻害なし。制御証拠をnativeへ繰り上げず、個別checkの結果を採用した。
- 残り見積もり：G3／P2の必須条件は0作業単位。A-T4/P3のjournal transaction、quota、完全backup/restore、Origin転送、スマホ実機、commit/pushは後続範囲。fixture focusのrun間不安定性は環境メモとして残すが、実アプリA-T2を未達へ戻さない。
- 停止点：G3接続・制御回帰・A-T1〜A-T3 native・A-T5/A-T6代表確認を完了し、P2で停止。P3・datasheet/生成物/公開設定変更・commit/push・自動実行Goal有効化へ進まない。

### 最新：G2 / P2前半・保存共通層（2026-09-13）

- 開始境界：開始時の`git status --short`で確認した既存dirty変更を維持した。G2の新規対象は`storage-registry.js`、`storage-runtime.js`、`tools/test-storage-runtime.js`だけで、既存アプリ保存コード、datasheet、生成物、公開設定は変更対象に含めなかった。
- 対応条件：Gate A第1〜3節、A-T3/A-T5/A-T6のP2対象部分。G2条件は7/7達成。19個の現行台帳項目を固定IDへ照合し、meta／journal／session epochの制御項目を追加した。
- 実装：raw-string codec付きregistry、構造化Result、boot、Web Locks shared/exclusive、LockManager拒否時の互換保存、epoch／session marker／journal guard、同期`readRaw`／`writeRaw`／`removeRaw`、participant登録、maintenance freeze→flush→exclusive→cancelを実装した。通常の既存writerへはまだ接続していない。
- 反例証拠：`tools/test-storage-runtime.js`で、未boot、未知ID、制御キー書換え、stale epoch、journal存在・未知版・破損、read/write/remove例外、quota、flush失敗、exclusive busy、LockManager拒否を、同じruntime API／Fake Storage／Fake Locks経路で期待コードへ分岐させた。journalは検査のみで削除していない。loggerにraw value／snapshotが出ないことも確認した。
- 実行証拠：`node --check storage-registry.js`、`node --check storage-runtime.js`、`node --check tools/test-storage-runtime.js`、`node tools/test-storage-runtime.js`、`node tools/test-storage-behavior-baseline.js`、`git diff --check`が成功。既存behavior baselineはstat slot/workspace/live、persistState/startup、export/import、calc/enemy/DPS保存・対象切替、comparison sessionを再確認した。差分検査は既存CRLF警告のみ。
- 未検証：実ブラウザのWeb Locks／2タブbusy、native pagehide/pageshow・hidden保持、既存全writer/consumer接続、実backup/restore、journal transaction、quota実容量。LockManager拒否の互換降格は制御テストのみで、native互換環境は未確認。
- 残り見積もり：G3は管理、計算/DPS、表示設定/読取consumer、必要なbootstrap/cache同期の接続群ごとに複数作業単位。G3完了後にP2を再判定し、P3以降は対象外。

### G3開始：P2後半・既存画面接続（着手時）

- 対応条件：Gate A第4節、A-T1〜3、A-T5/A-T6のP2対象部分。対象は台帳の全writer/consumerを既存画面へ接続し、通常保存順・120ms debounce・slot競合を維持し、native A-T1〜3を確認すること。
- 変更境界：次の小スライスでは管理（`stat-dashboard.html`／`stat-prototype.js`）を対象にする。既存のDPS・計算・表示設定・共有consumer、P3 backup/復旧、datasheet/生成物、DNS/Pages/workflow・公開設定は先に変更しない。
- 必須停止条件：既存保存入口の契約を変える必要がある、またはnative操作に手動確認・新権限が必要な場合は、その具体的な残条件を記録して停止する。検証器のfixture成功を本番接続の合格に繰り上げない。

### 最新：G1 / P1b残件解消（2026-09-13）

- 開始境界：既存dirty変更を維持し、G1では`tools/storage-native-browser-check.js`と記録文書だけを変更対象とした。アプリ保存コード、datasheet、生成物、公開設定は変更していない。
- 対応条件：G1、P1B-1〜3、BEH-8a/b・9a/b。G1は1/1（P1b制御＋native代表）達成。旧31/41や旧P1b 3/3をそのまま継承していない。
- 診断補修：native検証器の可視性・祖先display・実座標・elementFromPoint検査、タブ前面化、statメニュー再表示、DPS設定パネル表示順、既存ファイル更新を含むdownload検出を追加。これにより従来の非表示DPSボタン操作を成功扱いしないようにした。
- 制御証拠：`node tools/test-storage-behavior-baseline.js`成功。実`saveState→flushPendingStateSave→persistState`、workspace/live/legacy分岐、対象slot revision・通知・保存順・他領域不変、DPSの実`loadDpsSettingsStore`新context復元、各保存／読込省略反例を確認済み。基準の詳細は受入台帳へ記録。
- native証拠：`node tools/storage-native-browser-check.js`終了コード0。専用一時Chrome profile・localhost隔離Originで、fixtureのページ/DOM、JSON投入、download内容、2タブstorage event、focus/visibilityを成功。本番statでslot1保存、未保存draft、slot1 export、実file input、slot2 importのconfirm・適用status・active slot2、slot1再export一致を確認。本番DPSでMomo→Sylla→Momo、Momo 30秒/AUTO、Sylla 90秒/OFF→60秒、Momo切替前と再読込後の復元を確認。dialogは`confirm`を実観測しhandled=true、例外・consoleなし。
- 原因訂正：stat import後の失敗は本番import停止ではなく、(1)検証器が閉じた保存メニューのimportボタンを押していた、(2)再exportで同一ファイル名の更新を新規ファイルとして検出していなかった、(3)DPSでhiddenな実行ボタンを押していた、の検証器側問題だった。focus/visibilityはタブ前面化不足も補正した。反証可能な診断値を取得後に修正し、原因未変更のタイムアウトは反復していない。
- 構文：`node --check tools/storage-native-browser-check.js`成功。G1のnative実行結果はJSON標準出力に残り、検証器は終了時にChrome/HTTPサーバー/一時profileを片付けた。
- 未検証：P2の実Lock・共通層・全writer接続、P3の完全backup/復旧/quota、2 Origin転送、スマホ実機。native statでslot2の再読込後復元は今回まだ別assertしていないため、P2接続前の補足候補として残す。G1のP1b停止条件は解消した。
- 残り見積もり：G2（registry/runtimeと拒否境界）1〜2作業単位、G3（管理・計算/DPS・表示/consumer接続とnative回帰）複数作業単位。P3以降は対象外。

### G2開始：P2前半・保存共通層（着手時）

- 対応条件：Gate A第1〜3節、A-T3/A-T5/A-T6のP2対象部分。対象境界は新設予定の`storage-registry.js`、`storage-runtime.js`、焦点テスト、必要な文書のみ。既存アプリwriterはG3まで変更しない。
- 実施内容：現行19キー台帳と契約をregistryへ固定し、storage領域/キーcodecの解決、構造化Result、boot/epoch/journal guard、同期read/write/remove、participant登録、shared/exclusiveの最小runtimeを実装する。Web Locks非対応・失敗注入・未知ID・未boot/stale/journal反例を同一テスト入口で確認する。
- 禁止境界：既存保存入口の接続、backup/復旧適用、Origin転送、datasheet/生成物/公開設定、DNS/Pages変更はG2では行わない。契約変更が必要になったら停止して報告する。

### 最新：Luna向けP1b残件→P2完了Goal設定（実行待ち）

- 成果：docs/storage-p2-luna-goal.mdにG1（基準残件）、G2（共通層）、G3（全画面接続）の合格条件・連続進行・停止条件と開始指示を設定。
- 今回の変更境界は指示文書とGOAL/STATUS/ロードマップだけ。既存未コミット変更を維持。実装・ブラウザ実行・commit/push・自動実行Goal有効化なし。
- 達成：指示設定完了。G1〜3の今回の実行合格は0/3（既存証拠は再利用予定）。旧41条件の達成数は今回未再検証のため更新しない。
- 未達：P1b native import完了と既存証拠の不足照合、P2実装・接続・native回帰。タイムアウト原因は確定扱いせずツール/アプリ/環境を分離する。
- 残見積もり：G1残件＋G2＋接続群別に分割可能なG3。G1終了時に更新。P3復元・P4転送・スマホ実機・公開は後続。
- 次：Lunaで同書の開始指示を実行。各段階合格後のみ続行し、P2完了または具体的阻害で停止する。

以下は過去の実行記録。進行許可は上記Goalを優先する。

### 最新：P1b補修・本番ページ代表確認（2026-09-13）

- 開始時の変更境界：既存dirty変更を維持し、`tools/test-storage-behavior-baseline.js`、`tools/storage-native-browser-check.js`、`tools/fixtures/storage-http-baseline.html`、`STATUS.md`、`docs/storage-s1-acceptance.md`、`docs/storage-native-browser-environment.md`、`docs/storage-migration-delivery-plan.md`、`GOAL.md`だけを対象にした。対応条件はP1B-1〜P1B-3、BEH-8a/b、BEH-9a/b、INV-1c、EVT-1a/bの不足補完とnative代表確認。アプリ保存コード、datasheet、生成物、公開設定、通常Chromeのプロファイル・保存データは対象外とした。
- P1b補修（制御）：importは実`saveState`→`flushPendingStateSave`→`persistState`へ接続し、通常の公開担当・表示状態では`slot→workspace→live→legacy`、非公開／hidden側では`slot→workspace`となる現行分岐を確認した。対象slotのrevision、active state、通知、保存順、他slot・別local/sessionキーの不変をassertし、保存処理を抜いた反例を同じassertionで失敗させた。「import後もworkspace・live・legacyが常に不変」という旧期待値は撤回した。
- P1b補修（制御）：同一controllerのA→B→Aに加え、保存した`trickcal:dps-settings:v1`を新しい隔離実行contextへ渡し、実`loadDpsSettingsStore`からcontrollerへ復元した。MomoとSyllaの設定を独立して確認し、loadを省いた反例を同じ復元assertionで失敗させた。
- 最小fixture（native）：専用Chromeでページ起動・DOM操作、JSON投入、実ダウンロード内容、同一Origin 2タブのstorage event、実focus／visibilityの5/5を再確認した。`visible/true→hidden/false→visible/true`、`storage:applied:2`、`ok:trickcal-stat-state`を確認した。
- 本番stat（native代表）：実UIでslot1保存、未保存draft作成、slot1の実exportファイル（`trickcal-stat-state`／`slot`）確認、実file input投入、インポート先slot2表示まで成功した。slot2クリック後は画面が応答しない状態となり、インポート完了表示・適用後のnative保存結果・別slotのnative再確認は取得できなかった。これは制御側の実import成功とは別のnative未達である。
- 本番DPS（native代表）：実UIでDPS起動・計算（表示値8）、Momo→Sylla→Momoの対象切替、Momo=30秒/AUTO、Sylla=90秒/OFFから変更、Momo設定の切替前復元、再読込後のMomo設定復元を確認した。DPS設定のnative代表確認は成功した。
- 阻害の切り分け：HTTP server、CDP接続、専用一時profile、専用download先、file input投入は成功。stat import完了だけ、slot2の実クリック後にnative確認または本番処理の完了を観測できず、`Page.javascriptDialogOpening`（ページ／ブラウザセッション）と`Page.handleJavaScriptDialog`でも解消しなかった。確認待ち／OS前面状態または本番ページの長時間停止の境界として記録し、同じタイムアウトを反復しない。
- 証拠：`node --check tools/test-storage-behavior-baseline.js`、`node --check tools/storage-native-browser-check.js`、`node tools/test-storage-baseline.js`（19 keys／5 channels／64 accesses）、`node tools/test-storage-behavior-baseline.js`が成功。独立Chrome検証器はfixture 5/5とDPS native代表を成功としてJSON出力し、stat importだけを終了コード1で報告した。最終`git diff --check`も空白エラーなし（既存CRLF警告のみ）。
- 達成度：P1b-1は制御1/1達成・native代表はimport完了未達、P1b-2は制御1/1達成・native起動fallback未実施、P1b-3は制御1/1達成・native代表達成。固定41条件は今回のnative補足で分母を変更せず、達成31、部分8、未検証0、阻害2を維持する。これは旧P1b 3/3の継承ではなく、今回の制御／native証拠を分けた再判定である。
- 未検証・残り見積もり：stat importのslot2完了・適用後保存結果・別slot不変のnative観測が1検証単位残る。実Lock、quota、完全backup、Origin転送、focus／visibility／pagehideの本番全経路は今回の範囲外または後続条件。P2前半はstat native importの残条件を解消するまで開始しない。
- 次の停止点：本番stat importのnative手動確認に必要な操作は、専用Chromeを前面にしてslot2クリック後に表示された確認UIを目視確認・承認し、`スロット2にインポートしました`、現在slot2、別slot1の再export同一、local/session/live/legacyの観測値を記録すること。環境が再現できない場合はその観測値を残し、P2へ進まず停止する。P2、datasheet・生成物・公開設定変更、commit/push、自動実行Goal有効化は行っていない。

### 実施済み：保存検証用の独立ブラウザ環境を整備（2026-09-13）

- 開始時の変更境界：対象は既存の`tools/fixtures/storage-http-server.js`を使う検証fixture、追加の`tools/storage-native-browser-check.js`、`docs/storage-native-browser-environment.md`、このSTATUS記録に限定した。普段使いのChromeプロファイル・保存データは使わず、アプリ保存コード、datasheet、生成物、公開設定は対象外とした。既存の未コミット変更は維持した。
- 方式決定：利用可能なブラウザ操作はChrome拡張接続1つだった。ページ起動・DOM・storage eventは成功したが、file chooserは`Not allowed`、download eventはタイムアウト、拡張APIの評価では`document.hasFocus()`が利用できず、タブ切替後も`visibilityState`が変わらなかった。Playwright依存を追加せず、Node標準WebSocket＋CDPで一時Chromeを起動する方式へ切り替えた。
- 最小確認：専用Chromeでページ起動・DOM操作、JSON投入、実ダウンロードと内容一致、同一Origin 2タブのstorage event、実focus／visibility変化の5/5を成功。`visible/true`→`hidden/false`→`visible/true`、`storage:applied:2`、`ok:trickcal-stat-state`、JSON payloadを確認した。
- 分離条件：HTTP server portとCDP portを別々に確保し、Chromeは拡張無効・一時`user-data-dir`・専用download directoryで起動する。終了時に起動したChrome・HTTP server・一時profileを閉じる。通常Chromeの保存データは変更していない。
- 実行入口：[独立ブラウザ環境手順](docs/storage-native-browser-environment.md)、`node tools/storage-native-browser-check.js`。成功時はJSONと終了コード0、失敗時はチェック名またはHTTP/CDP子プロセス診断と終了コード1を返す。Nodeの子プロセス起動がsandboxで`EPERM`になる場合は通常PowerShellから実行する。
- 未検証（環境整備時点）：最小fixtureにダイアログがないためJavaScriptダイアログと、本番アプリexport/import UI・DPS再起動復元はこの前段記録では未接続だった。後段のP1b代表確認結果は上の最新記録へ分離している。
- 実行証拠（環境整備時点）：専用Chromeでfixture 5/5を確認した。後段の`node tools/storage-native-browser-check.js`はstat import未達を含むため終了コード1であり、成功扱いしない。専用Chromeは`C:\Program Files\Google\Chrome\Application\chrome.exe`、server/CDPは実行ごとの別ポートを使用した。
- 残り見積もり：独立環境の整備は完了。本番stat importのslot2適用完了・保存結果・別slot不変のnative観測が1検証単位残る。focus／visibilityの確認中だけ専用Chromeが前面に出るため、必要ならその短時間はOS前面状態を観測対象として扱う。
- 次の停止点：前段環境の記録はここで停止し、本番代表確認の残条件は上の最新P1b記録とnative環境文書へ引き継ぐ。P2、datasheet・生成物・公開設定変更、commit/push、自動実行Goal有効化は行わない。

### 最新：P1b変更前実入口基準を確保（2026-09-13）

- 開始時の変更境界：対象は`tools/test-storage-behavior-baseline.js`と、結果を記録する`STATUS.md`・`docs/storage-s1-acceptance.md`・`docs/storage-s1-run-boundary.md`・`docs/storage-migration-delivery-plan.md`。P1aから引き継いだdirty変更を維持し、アプリ保存コード、datasheet、生成物、公開設定は対象外とした。P1b対象テストはP1a既存変更を含む未追跡ファイルだったため、P1b開始時の分離ハッシュは取得しておらず、完全な機械的差分分離は主張しない。
- P1a再確認：L1 1/1、L2 1/1、L3 1/1。`node tools/test-storage-behavior-baseline.js`と`node tools/test-storage-baseline.js`を再実行し、既存の反例を含めて成功した。P1aの制御証拠をnative証拠へ繰り上げていない。
- P1b達成条件：P1B-1 export/import 1/1、P1B-2 startup/fallback 1/1、P1B-3 DPS起動/対象切替 1/1、合計3/3（いずれも本番関数を隔離VMで通す制御証拠）。
- P1B-1根拠：実`exportStateFile`で保存slotだけを出力し、実`parseImportedState`、既存`storage-s1-import.json`、旧unwrapped形式、未知schema/version拒否、実`applyImportedState`→実slot writer→実`applyStateSnapshot`を確認。未保存workspaceはexportへ混入せず、対象外slot、別local/sessionキー、legacy mirrorは不変。
- P1B-2根拠：実`loadState()`でworkspace優先、workspaceなし／破損時legacy fallback、slot維持、旧`savedStates`からの実slot移行を確認。各ケースで別local/sessionキーの不変をassertした。
- P1B-3根拠：実`PrototypeDpsController.refreshAvailability()`でDPS起動相当のsnapshot・対応可否・対象別設定保存を通し、Momo→Sylla→MomoでSyllaは既定値、Momoは変更値へ復元することを確認した。
- 固定41条件の再集計：P1bの制御証拠を反映し、達成31、部分8、未検証0、阻害2（計41）。これはP1a以前の25/41判定の継承ではない。部分・未検証・阻害をnative達成へ繰り上げていない。
- 制御／nativeの分離：上記P1b 3/3はNodeの本番関数抽出・実`RecordingStorage`・隔離DOM境界による制御証拠。native側は、実DOMのexport/import UIとDPS画面起動・対象切替を確認できるブラウザ環境が使えず、既存のタイムアウトを反復していない。nativeの成功証拠は0件として扱う。
- 未達時の手動確認：隔離HTTP Origin／クリーンプロファイルでstat画面を開き、保存slotと未保存draftを分けて作成→slot export→JSON再import→対象slot／他slot／別local・sessionキーを確認する。続けてformation damage画面でDPSへ入り、結果表示・対象A→B→Aの設定保持を確認する。これはP2前に必要なnative補足であり、今回自動実行していない。
- 実行証拠：`node --check tools/test-storage-behavior-baseline.js`、`node --check tools/test-storage-baseline.js`、`node --check tools/storage-inspection.js`、`node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-baseline.js`、`git diff --check`が成功。基準結果は`19 keys / 5 channels / 64 accesses`。差分空白はエラーなしで既存CRLF警告のみ。
- 残り見積もり：P1bの制御基準は残り0。native補足は環境が用意できた場合に手動1検証単位、固定41の残りは部分8・未検証0・阻害2。P2前半/後半以降、B3実測、quota、完全復元、Origin転送は未着手。
- 次の停止点：P1bの記録で停止。P2実装、datasheet・生成物・公開設定変更、commit/push、自動実行Goal有効化は行わない。Gate A/Bの判断材料は、slot単位の現行実入口と、完全backupが未実装で他領域を変更しない現在境界として引き継ぐ。

### 最新：P1a完了（2026-09-13）

- 開始時の変更境界：対象は`tools/test-storage-behavior-baseline.js`、`tools/test-storage-baseline.js`、`tools/storage-inspection.js`と、実行証拠を記録する`STATUS.md`・`docs/storage-s1-acceptance.md`・`docs/storage-s1-run-boundary.md`。アプリ保存コード、datasheet、生成物、公開設定は対象外。着手時点の既存dirty変更は維持した。開始境界の詳細は[実行境界記録](docs/storage-s1-run-boundary.md#p1a開始時の境界2026-09-13)を参照。
- スライス達成条件：L1 1/1、L2 1/1、L3 1/1、合計3/3。3スライス連続停滞には該当しない。固定41条件の総合集計を旧25/41へ戻したり、P1aの制御証拠をnative達成へ繰り上げたりしていない。
- L1根拠：`test-storage-behavior-baseline.js`へ仮想timerと実`persistState`・実`RecordingStorage`・実`init`由来イベントcallbackを接続。119ms保存なし、120msの実保存1回、flushの実保存1回、解除timer後の追加保存なしを確認。blur、visibilitychange、pagehide、beforeunloadのflushも同じ実保存ログで確認した。
- L2根拠：`RecordingStorage.failOperations`を追加し、`method:key`でsession workspace write、live read、live write、legacy writeを独立注入。正常・4失敗ケースを同じ連番ログで確認し、live read失敗とlive write失敗を混同しないこと、既存値・保存順・revision・通知・戻り値をassertした。
- L3根拠：`storage-inspection.js`の生テキストstorageキー検査をAST解析結果へ統合し、コメントだけのsource overlayが本番と同じ探索→解析→契約→台帳照合で成功。動的キー、再代入storage別名、未知storage引数、動的methodを同じ全検査入口で拒否した。基準テストは正常例だけでなく狙った反例の診断もassertした。
- 実行証拠：`node --check tools/test-storage-behavior-baseline.js`、`node --check tools/test-storage-baseline.js`、`node --check tools/storage-inspection.js`、`node tools/test-storage-behavior-baseline.js`、`node tools/test-storage-baseline.js`、文書更新後の`git diff --check`が成功。差分空白エラーはなく、既存変更由来のCRLF警告のみ。
- 未検証：nativeブラウザイベント、実Lock、quota、実export/import、P1bの全実入口、P2以降の保存共通層。L1の時計・イベントはVM制御証拠でありnative証拠ではない。アプリ保存動作は今回変更していない。
- 残り見積もり：P1aは完了。次はP1b（変更前の実入口基準）1作業単位、その後P2前半/後半、P3前半/後半、P4、P5前半/後半、P6。全体初期目安はP1bを含む約10作業単位で、P3の完全package実測後に更新する。
- 次の停止点：P1aの依頼範囲で停止し、P1b/P2、nativeブラウザ検証、commit/push、自動実行Goal有効化へ進まない。P1b用のLuna指示は[再計画末尾](docs/storage-migration-delivery-plan.md#p1a終了後にlunaへ渡す指示)にある。

### 最新：P0仕様を作成（2026-09-13）

- 今回のスライス：A1〜A3＝保存API/排他/復旧、B1〜B3＝対象/形式/容量、C＝配信方式を実装契約へ具体化。文書変更のみ。
- 達成：設計項目7件中6件を文書化、B3は部分。これは製品テスト合格数ではない。旧41条件の達成数は増やしていない。P0出口は容量の追加実測が残り、全合格としない。
- 証拠：[保存契約](docs/storage-contract.md)、[バックアップ形式](docs/storage-backup-format.md)、[配信契約](docs/storage-release-contract.md)。既存保存実装・19キー台帳・Pages工程を読取り、Web Locks/GitHub公式仕様を参照した。
- 容量根拠：既存最大育成fixtureから生成した6slot＋draftはcompact JSONのUTF-8で986112 bytes、live/legacy相当も含め1267742 bytes。実codec・全設定・実保存50件・ブラウザquotaの検証ではない。B3残条件はP3で実測し、上限不足を黙って切り捨てない。
- 決定：通常同期保存を維持、アプリ存続中shared/全体操作exclusive、復元journalのcommit前rollbackとcommit後session再開を分離。12論理項目をファイル/転送で共用。新公開成果物専用repoと旧入口保持を採用。
- 未検証：実ロック/ライフサイクル、全writer接続、codec/復旧、完全容量、2 Origin転送、DNS/資格情報/新repo可用性。設計文書だけで保証しない。
- 残り見積もり：P0のB3実測残＋P1〜P6。実装はP1a/P1b、P2共通層/接続、P3形式/復元、P4転送、P5生成/配信、P6確認の約10作業単位が初期目安。ターン数の約束ではなくP3で更新する。
- 次：Lunaで既定P1aを実施しL1〜L3の証拠を報告して停止。P1b/P2の具体的引渡しを再計画へ追記。アプリ・テスト・datasheet・生成物・公開設定は今回変更せず、commit/push/自動実行Goal有効化なし。

以下は更新前の履歴。「P0未着手」「仕様未作成」は現在の状態ではない。

### 最新：Luna担当・P1a開始指示を設定済み

- 実装は基本Luna、未決の共有設計P0はAstra/Sol担当とした。自動切替・自動委譲は設定していない。
- Lunaが先行できるP1aを再計画書へ定義。L1＝実保存/イベント/時計の接続、L2＝操作・キー別の独立失敗注入、L3＝コメント誤検出と既存反例の全入口接続。開始指示・対象・終了条件・停止条件を記載した。
- P0とP1aは未着手。保存契約・バックアップ形式の実装仕様は未作成であり、P2以降の本体実装は契約確定待ち。P1a終了後は成果を引き渡して停止する。
- 次に必要な設計成果：保存API・排他・復旧・バックアップ形式を確定し、P1b/P2の変更対象と検証条件を作る。P1a完了待ちで設計を止める必要はない。
- 今回の成果は担当と実行指示の設定。アプリ・テスト・公開設定は変更せず、実装テスト未実行。製品工程の達成追加なし。残りP0〜P6、実装量はP0終了時に更新する。自動実行Goal・commit/pushは実施していない。

### 最新：移行公開までの再計画作成・P0設計待ち

- 成果物：[実装・公開までの再計画](docs/storage-migration-delivery-plan.md)。P0契約確定、P1変更前基準、P2保存共通層、P3完全バックアップ/復元、P4転送、P5URL/配信、P6公開確認へ整理した。
- 進捗：計画文書作成完了。製品工程P0〜P6は未着手。既存台帳・検査器・実保存テストは再利用する成果であり、移行機能の完成数には数えない。S1は未完了、N1〜N3完全合格・25/41による進行判断を撤回する。
- 根拠：直近レビューで実イベントと仮想時計が未接続、live読込/書込失敗の同時注入、コメントだけの追加で共通検査が失敗、一部反例の全入口未接続を確認した。今回これらの実装修正・再テストはしていない。
- 要件対応：固定41条件を維持し、全IDを新工程へ割り当てた。実施時期を変更し、保存経路を変更する前の基準と、公開前のnative/復元/転送確認の期限を明記した。未達を免除していない。旧表の達成数は最新保証値として使わない。
- 次：P0でAPI・排他・復旧・項目別復元・形式/上限・公開構成の具体的契約を作る。終了条件は実装者が共有仕様を推測せず着手できること。P0設計開始指示を待つ。
- 見積もり：残り7工程（会話数・スライス数ではない）。P0終了時にファイル/接続単位の実装見積もりを更新し、P3終了時に公開までを再評価する。排他と同期flushの接続、起動復旧、実環境検証手段、公開先設定が主な不確実性。
- 未検証：実保存・タイマーの不足、旧入出力・DPS実入口、nativeイベント、完全復元・容量・転送・公開。各未達の実施工程は再計画へ記録した。
- 今回は計画・現行指示への参照を更新。アプリ/テスト実装・datasheet・生成物・公開設定・commit/push・自動実行Goalは変更していない。

### 旧記録：N1→N3実施（完全合格・集計は再レビューで撤回）

- 着手時境界：実装開始前のdirty一覧と対象ツール・台帳・GOAL/STATUSのSHA-256を`docs/storage-s1-run-boundary.md`へ記録した。既存の未コミット変更は維持し、アプリ保存コード、datasheet、生成物、公開設定は変更していない。
- N1完了（N1条件5/5）：`tools/storage-inspection.js`へ探索→AST解析→storage/helper契約→キー／領域／reader・writer・operation・failureMatrix/access site・Pages照合を集約し、`tools/inspect-storage.js`を薄いCLIとして追加した。正常本番root、既知キーの新writer overlay、隔離rootの新規候補を同じ`inspectStorageProject`入口で検査し、正常CLI 0／反例CLI 1と対象診断を確認した。
- N1証拠：`node tools/test-storage-baseline.js`、`node tools/inspect-storage.js`、変更ツールの構文確認、隔離rootのCLI正常／反例実行。検査結果は19 keys／5 channels／64 accesses、反例は`new-storage-writer.js`の`STORAGE_REFERENCE`・`LEDGER_ACCESS`・`FAILURE_LEDGER`を出力した。
- N2完了（N2条件8/8）：helper定義・呼出しと契約storage引数をbinding IDへ結び付け、正規呼出しを残した同じ検査入口で、既知キー別名、object／array／spread、未知関数引渡し、return、`call`／`apply`／`bind`、named export、storageメソッド切出し、契約storage引数流出を狙った反例を拒否した。無関係な同名引数は通過した。
- N2証拠：`node tools/test-storage-baseline.js`、`node tools/inspect-storage.js`、変更ツールの構文確認。named exportは実helper・許可呼出しを残した正常版の後に変異させ、狙った診断を確認した。
- N3完了（N3条件4/4）：`test-storage-behavior-baseline.js`で実`persistState`と実下位関数を使い、正常／session／live／legacy失敗のworkspace・live・legacy・通知を同じ連番ログで比較した。Storage試行・成功／失敗、保存順、既存値、revision、通知payload・回数、実関数の戻り値／例外境界をassertし、保存順をメモリ上で変えた反例が同じログassertionで失敗することを確認した。
- N3イベント証拠：実`setupMultiTabStateSync`のfocus／blurと、実`init`から一意に抽出したbeforeunload／pagehide／visibilitychange登録をVMのDOM境界へ評価し、実callbackから実保存へ接続した。pending timer解除、visible/hidden分岐、flush後の保存順・二重保存なしを確認した。これは制御テストでありnativeブラウザ証拠には加算していない。
- 各スライスの判定：N1 5/5、N2 8/8、N3 4/4。固定41条件は旧25/41・旧DET-1〜3達成を使用せず、最新証拠で再集計し、達成25、部分13、未検証1、阻害2となった。数値が一致していても旧判定の継承ではない。
- 最終検証済み：`node --check tools/storage-access-detector.js`、`node --check tools/storage-inspection.js`、`node --check tools/inspect-storage.js`、`node --check tools/test-storage-baseline.js`、`node --check tools/test-storage-behavior-baseline.js`、`node tools/inspect-storage.js`、`node tools/test-storage-baseline.js`、`node tools/test-storage-behavior-baseline.js`、`git diff --check`が成功した。基準テストは19 keys／5 channels／64 accessesおよびstorage behavior baseline成功。`git diff --check`は既存変更に対するCRLF警告のみで、空白エラーはない。
- 未検証・阻害：native clean storage event、native focus／visibility、本番pending pagehide単独flush、実export/import適用、DPS実起動の暗黙書込、quota、BroadcastChannel単独、実Lock／stale UI、複数キー完全復元、Origin転送。制御テストや既存の離脱復元をnative個別経路の達成へ置き換えない。
- 残り見積もり：N1〜N3の土台修正は完了。S1全体には固定台帳の部分・未検証・阻害条件を閉じる追加検証が残るが、今回の指示範囲では追加作業を行わない。
- Gate A判断材料：実`persistState`のworkspace→live→legacy順、live読取／書込失敗時の停止境界、legacy片側失敗後の通知、明示slot競合・Lock代替、制御イベントのflush結果は確認済み。native clean反映、focus／visibilityの責任、pagehide単独経路、実排他は未確定。
- Gate B判断材料：現行exportはversion 2の保存slot一つで、workspace・他slot・計算／敵／DPS設定・runtime overrideを含まない。実import適用、draft／mirrorの範囲、破損／未知版、他領域不変、容量は未確定。
- 変更境界：今回変更はstorage検出器、検査CLI、基準テスト、隔離fixture、受入台帳・関連文書、GOAL/STATUSに限定した。S2、nativeブラウザ検証、commit/push、自動実行Goal有効化には進んでいない。

### 旧記録：S1再計画・スライス3実施（達成数・残り見積もり撤回）

- 指示: [S1再計画・実装指示](docs/storage-s1-closure-instructions.md)。元設計の必須ケースを維持し、検出漏れ・統合反例・実入口・nativeイベント経路を閉じる。
- 達成判定: 過去の達成数・残りfocus/visibilityのみという判定は撤回済み。固定ID付き[受入台帳](docs/storage-s1-acceptance.md)を作成し、全41条件を再集計した。現時点は達成25、部分13、未検証1、阻害2。スライス3でEVT-1bを達成へ更新したが、部分・未検証・阻害を達成へ数えず、S1は未完了。
- スライス1: DET-1〜3を達成。AST解析結果にstorageEscapesを加え、直接／単純別名／契約済みhelper以外のstorage参照を未対応として失敗させる。helperのobject格納、`.call()`、未知関数引渡し、return/default exportを検出し、`validateStorageAnalyses`で探索→解析→契約→台帳照合を本番・反例で共通化した。
- スライス1の反証: `test-storage-baseline.js`へstorage parameter clear、unknown consumer、object container、storage return/export、helper object/call/default export、直接／helper領域不一致、新規候補ファイル探索を追加。正常fixtureも同じ入口で成功し、`node tools/test-storage-baseline.js`が成功した。
- スライス2: `test-storage-behavior-baseline.js`で現行`setupMultiTabStateSync`のfocus／blur handlerを実`persistState`へ接続して制御検査した。実ページでは隔離Originのstat画面2タブでBの対象変更・slot保存後にAが更新を反映し、DPSタブ起動後に結果・タイムラインを表示した。保存メニューのexport slot選択まで実行し、BEH-8a/BEH-9aは部分へ再判定した。
- スライス2の制約: importは実ページでfilechooserイベント発火まで確認したが、Chrome拡張のfile URL許可不足でfixture投入が拒否された。したがってimport適用、slot/draft区別、他領域不変、旧形式は未達のまま。exportのPlaywright downloadイベントも取得できず、選択UIまでの証拠に限定する。
- スライス3: `tools/fixtures/storage-s1-native-stat.html`で本番`stat-dashboard.html`を起動前に隔離し、`BroadcastChannel`を削除した2タブを作成した。両タブの本番UI起動・無警告を確認し、Aがslot 2を保存したとき、dirtyなBが★5を保持したまま「別タブ更新あり: 2」を表示した。`BroadcastChannel`が両タブで存在しないこともページ評価で確認し、EVT-1bを達成へ更新した。
- スライス3の未達: clean側のnative storage eventを同じ条件で再確認する前に、ロード確認ダイアログの処理がタイムアウトした。focus/visibilityはタブAPIでnative状態を切り替えられず、pagehideはpending書込・イベント・順序を分離できていない。制御テストのfocus/blur委譲は成功したが、native証拠とは別に扱う。
- 維持する証拠: 実persistStateの正常／各領域失敗テスト、本番2タブでの更新反映・競合保持、離脱後復元。レビュー時に基準テスト2本は成功したが、追加反例も通過したため検出完了の証拠にはならない。
- 撤回する推論: 同期成功だけからstorage event、離脱復元だけからpagehide/beforeunloadの個別flush経路を確認したとは断定しない。
- 未達: INV-1c、BEH-2b、BEH-5〜6の一部、BEH-7b、BEH-8b、BEH-9a/9bの一部、EVT-1a、EVT-2、EVT-3aなど、元必須ケースの実入口・native経路。検出器のIndexedDB不導入は静的確認にとどまる。実quota上限・複数キー完全復元・Origin転送は後続範囲。
- 残り見積もり: 追加検証スライス相当。clean storage eventの再実行、実import、focus/visibilityのnative切替、pagehide単独flushの証明が残る。S1の固定条件を達成扱いへ推測で繰り上げず、ここで停止してGate A/Bの判断材料を渡す。3スライス連続で達成度がほぼ増えた場合は再計画条件に従うが、今回はEVT-1bの新規達成があるため再計画条件には該当しない。
- Gate A判断材料: 実`persistState`はworkspace→live→legacyの順で部分失敗時に後続が止まり得る。slot競合はrevision、Lockはmock、nativeではdirty競合保持まで確認済み。clean反映、focus/visibility、pagehide単独flush、旧タブとの排他責任は未確定。
- Gate B判断材料: 現行exportはversion 2の保存slot一つで、workspace・他slot・計算／敵／DPS設定・runtime overrideを含まない。schema境界とimport UIの入口は確認したが、実ファイル適用、破損／未知版／draftと他領域不変、容量は未確定。完全backupの対象範囲と旧形式の扱いを決める必要がある。
- 作業境界: 着手時の完全なdirty一覧・ハッシュを保存できていなかったため、既存変更との完全な機械比較は未証明。終了時の対象ファイルとSHA-256は[変更境界記録](docs/storage-s1-run-boundary.md)へ記載し、アプリ保存コード・datasheet・公開設定は今回変更していない。
- 今回の変更: tools検出器・基準テスト・隔離fixture・受入台帳・判定文書を更新。アプリ保存コード・datasheet・公開設定は変更していない。S1未完了。S2・commit/push・自動実行Goal有効化は行わない。

以下の再レビュー修正スライス1〜3は過去の作業記録。達成数・残り見積もり・イベント経路の断定は上記により訂正し、現行判定に用いない。

### 旧記録：再レビュー修正・スライス3実施（達成判定・経路断定を撤回）

- 達成度: スライス3は4条件中3条件を達成。スライス1・2の9条件と合わせ、累計12/13条件を達成したが、focus/visibilityの本番処理結果が未検証のためF2／S1全体を完了扱いにしない。
- 根拠: `node tools/fixtures/storage-http-server.js 8768`でmanagerルートを隔離Originへ配信し、本番`stat-dashboard.html?view=settings`を2タブで起動。実保存UIによるclean側の更新反映（★4）、dirty側の競合保持（★5）、本番ページ離脱後のpagehide/beforeunloadによる★1復元を確認した。両タブのコンソールerror/warnはなかった。独自fixtureの判定ロジックは使っていない。
- 検査補強: `storage-http-server.js`にポート指定とHTML/CSS/JS/画像等のMIME対応を追加し、独自fixtureには「本番アプリの保存実装を読み込まない」と明記した。ブラウザ手順・URL・期待値・観測値・代替範囲を`docs/storage-inventory.md`へ記録した。
- 未検証: focus claim／visibility復帰後の本番処理結果（タブAPIで安定したアクティブ切替を取得できず）、実ブラウザ時計の119/120ms、実DOMのexport/import・DPS起動、quota、BroadcastChannel単独経路、実排他、複数キー完全復元、Origin転送。検証fixtureの成功を代用しない。
- Gate A/B判断材料: Gate Aはsession→live→legacyの部分失敗、通知順、明示slot競合、workspaceのpagehide復元、clean/dirty同期結果を入力に、排他・通知・中断復旧・focus/visibility時の責任を確定する。Gate Bは現行1スロットexportとslot/workspace/live/legacy/計算/敵/DPSの範囲差、破損・未知版・mirror再構成、容量を確定する。
- 残り見積もり: focus/visibilityの本番結果を確認できる環境があれば追加1検証スライス相当。未検証のままS1を再完了しない。S2・公開・commit/push・自動実行Goal有効化には進まない。

### 旧記録：再レビュー修正・スライス1（完了判定を撤回）

- 達成度: スライス1の5条件を達成（5/5）。F1全体を完了扱いにはしない。今回の実装範囲は検出漏れ、helper契約、保存領域照合、access site照合。
- 根拠: `storage-access-detector.js`を補修し、storage aliasの再代入／未初期化後代入を未解決アクセスとして検出。任意の関数parameterによる`getItem`／`setItem`／`removeItem`と`storage.clear`を識別し、契約外をエラー化した。helperの別名呼出し、未知関数への引渡し、return/exportを契約検査へ追加した。HTMLコメント内のscript偽アクセスをマスクし、AssignmentPatternのparameter解析も訂正した。
- 台帳根拠: `storageParameterContracts`へ比較session APIの3関数を追加。`test-storage-baseline.js`でキー・操作・ファイル・関数・保存領域をentry／failureMatrixと照合し、Pages工程の除外ディレクトリとの集合一致も確認するようにした。
- 反証根拠: 再代入alias、`let store; store = localStorage`、未知storage parameter、helper別名による未登録キー、未知関数へのhelper引渡し、local/session領域不一致、HTMLコメント内scriptを隔離ソースで検査し、各々が失敗または無視されることをassertした。既存本番候補の検査は`19 keys / 5 channels / 64 accesses`で成功。
- 実行済み: `node --check tools/storage-access-detector.js`、`node --check tools/test-storage-baseline.js`、`node tools/test-storage-baseline.js`。保存本体・datasheet・公開設定は変更していない。
- 未検証: 実保存処理を通すF2ケース、本番ページ2タブ、quota、export/import、focus/visibility/pagehide。今回のスライスでは実施していない。
- 残り見積もり: 2スライス。次は実`persistState()`を通す失敗基準と結果表の訂正（スライス2）。

### 旧記録：再レビュー修正・スライス2（必須ケース全体の達成は未再集計）

- 達成度: スライス2の4条件を達成（4/4）。F2全体は未完了。実保存関数の基準化と台帳記録の訂正まで完了し、本番ページ2タブは次スライスへ残す。
- 根拠: `test-storage-behavior-baseline.js`で実`persistState()`と実下位関数を通し、正常／sessionStorage書込失敗／live mirror書込失敗／legacy mirror書込失敗を個別実行した。各ケースでworkspace・live・legacyの既存値、書込試行順、`appState.syncRevision`、live-published通知、同一try内の後続停止をassertした。
- 追加基準: 実`loadState()`のworkspace優先・workspaceなし／破損時legacy fallback、slot他項目不変・read/write/delete失敗、仮想時計119/120ms debounce・flush後二重保存なし、計算保存／敵プリセットの読込・保存・削除失敗、比較sessionのread/write/remove失敗を追加確認した。計算・敵のUIはVM上のUI境界stubであり、実DOMではない。
- 台帳訂正: Acorn AST検出の説明、storage引数契約、テーマ／ボード設定／配列・object fallback、比較sessionの実関数名とaccess siteを現行コードへ合わせた。`test-storage-baseline.js`でaccess siteのファイル・操作・関数・領域を照合する。
- 実行済み: `node tools/test-storage-baseline.js`、`node tools/test-storage-behavior-baseline.js`、変更ツールの`node --check`。両基準テスト成功（19 keys / 5 channels / 64 accesses）。
- 未検証: 本番ページの2タブstorage event、focus/visibility/pagehide、実DOMのexport/import・保存メニュー、DPS refreshAvailability起動、quota、BroadcastChannel実通信、複数キー完全復元、Origin転送。隔離HTTP fixtureは本番保存コードを読み込まないため、本番同期の根拠にはしない。
- 残り見積もり: 1スライス。本番ページを隔離Originで起動できるかを確認し、できなければ未検証として具体的な制約を記録してS1を未完了のまま停止する。

### 旧記録：S1追加補完 F1完了・F2部分完了（下記判定と過大な検証記録は撤回）

- 達成度: 追加補完F1は100%、F2は基準テスト補強と隔離HTTP 2タブの必須イベント確認まで完了したが、実入口・focus/visibility・quota・Origin転送が未検証のため約75%。S1全体は未完了。
- 根拠: tools専用のAcorn依存とlockを追加し、JS/HTML inline scriptをAST解析する検出器へ更新した。optional/computed/template実行式、動的連結、再代入、shadowing、dynamic method、clear、構文エラーを反例fixtureで固定し、既知キーへの誤解決を防いだ。readJson/parseJsonはhelperの関数・引数・許可呼出元・保存領域・キー集合を照合する契約へ変更した。Pages除外、19キーのreader/writer、失敗経路accessSitesを実コードと照合し、旧DPS保存例外と比較session未知version受入も基準化した。
- 実行済み: `node tools/test-storage-baseline.js`、`node tools/test-storage-behavior-baseline.js`、両テストと検出器の構文確認、`git diff --check`が成功。debounce/flush、slot新context再読込、実migration（カードID変換を含む）、敵プリセット正常／破損読込・保存失敗、DPS対象別設定復元、旧DPS保存失敗、比較session version:999を追加確認した。隔離HTTP fixtureのChrome 2タブではclean側のstorage反映、dirty側の競合保持、pagehide相互観測を確認した。
- 未検証: 自動化タブ切替によるfocus/visibility、実DOMのexport/import、DPS refreshAvailabilityからの実起動、実DOM保存メニュー、実quota上限、複数キーの完全復元、Origin転送、BroadcastChannel実通信は未確認。S1必須の未検証を成功扱いしない。
- 残り見積もり: F2の未検証入口を追加で確認できる環境なら1スライス相当。現環境で実入口を安全に隔離できないため、ここでS1を未完了のまま停止し、A/Bへ判断材料を引き渡す。
- 今回はtools・fixture・台帳・基準テスト・関連文書のみ更新。アプリ保存コード、datasheet、公開設定は未変更。S2、commit/push、Goal自動実行化には進まない。

### 再レビュー前の記録：保存保守・新ドメイン移行（S1補完の旧完了判定）

- S1補完達成度: 100%。19キー全てについて成功時挙動、読込失敗・書込失敗・削除・呼出元結果・起動時書込・access siteを`tools/storage-inventory.json`の`failureMatrix`へ記録した。アプリ本体の保存動作、保存形式、datasheetは変更していない。
- 保存アクセス検出: `tools/storage-access-detector.js`で台帳一覧とは独立にPages相当のJS/HTMLを探索し、64アクセスを検出した。直接文字列、定数、optional chaining、computed access、alias、HTML inline script、コメント内偽アクセス、未登録ファイル、未解決動的キーを基準化した。動的helperの例外は理由付き2件に限定した。
- 挙動基準: `node tools/test-storage-behavior-baseline.js`で現行コードを最小VMへ抽出してslot保存・workspace再読込・削除・stale競合・破損fallback、workspace失敗、live／legacy片側失敗、計算保存上限・失敗、DPS保存失敗を実行確認した。`combat-scenario.js`の比較sessionは既存公開APIを直接実行した。
- テスト根拠: `node tools/test-storage-baseline.js`成功（19 keys、5 channels、64 accesses）。`node tools/test-storage-behavior-baseline.js`成功。検出器と基準テストは利用者の実ブラウザ保存領域へ書き込まない。
- 未検証事項: 実ブラウザ2タブのstorage event、focus/visibility/pagehide、実quota超過、複数キーの実復元、旧Originから新Originへの転送、ASTでしか解決できない複雑な動的storageアクセス。未検証を成功扱いしない。
- A/B設計への判断材料: Gate Aは、live／legacy片側失敗後も通知され得ること、workspace失敗後もliveへ進むこと、slot明示保存の例外結果、DPS設定のメモリ先行更新、起動時の暗黙DPS書込を前提に、保存結果・通知・排他・復旧順を確定する。Gate Bは、slot／workspace／live／legacy／計算／敵／DPSの必須範囲、現行1スロットexportとの差、破損生データ救出、ミラー再構成、schema版と容量を確定する。
- 次: S2へは進まない。A/B（必要ならC）の設計ゲートを確定し、S1の証拠を入力に保存API・復元対象・失敗状態を決めてから実装へ移る。
- 残り見積もり: S2〜S6の6実装スライス（S5a/S5b分割）、設計ゲートA/B/C、共有保存部分の重点レビュー1回。

以下はレビュー前の実施記録。テスト成功は静的検査の結果に限定する。

- 目的: 既存保存を維持し、完全バックアップ/復元、新ドメイン引き継ぎ、将来の項目追加と公開保守を整える。
- S1達成度: 100%。`tools/storage-inventory.json`へ19個の保存キーと5個の保存関連チャネルを台帳化し、`docs/storage-inventory.md`へ責任、payload、書込契機、初期化順、タブ同期、公開範囲、現行export境界を整理した。これはロードマップC1（本番保存経路の分類と検証用保存の区別）を満たす。
- 基準テスト: `node tools/test-storage-baseline.js`成功。直接storageキーの台帳漏れ、本番／`tools/`分離、slot export schema、120ms debounce／終了時flush、slot競合、Navigator Lock fallback、計算保存50件制限、DPS schema、比較session、最大育成fixtureを確認した。関連5スクリプトの`node --check`と`git diff --check`も成功（改行コードのGit警告のみ）。
- 既存挙動の結論: `trickcal_stat_slots_v2`がステータスの正規スロット、workspace／live／legacyは用途別のドラフト・ミラー。計算設定、計算結果保存、敵プリセット、DPS設定は別localStorage。比較sessionと再読み込み文脈はsessionStorage。現行exportは`trickcal-stat-state` version 2の1スロットだけで、完全バックアップではない。
- 公開範囲の注意: Pagesは`tools/`を除く成果物を配信するため、noindexのDPS試験版・旧共有試作も同じOriginの保存writerになり得る。DPS runtime overrideは現行／旧controllerが同じキーを使う。新ドメイン移行ではOriginとタブ境界を越えて直接読めない。
- 変更範囲: アプリ本体の保存動作、保存キー、datasheet、生成物、DNS、公開は変更していない。S1は台帳・調査・基準テストのみ。
- 設計ゲートA/B/C未確定。S1後の残り見積もりはS2〜S6の6実装スライス（S5a/S5b分割）＋3設計ゲート＋共有保存の重点レビュー1回。S2/S3開始前にA/Bを確定する。
- 次: AstraまたはSolで、`docs/storage-inventory.md`末尾のGate A/B判断事項を確定する。公開先未確定でもA/B設計は進められる。Cでルート名/API/ハッシュ同期順を固定してからS5aへ進む。

### 最新：編成共有の追加更新工程（第4スライス完了）

- Astra担当のURL互換、永続番号、表示データ責任、資材同期順序、生成／公開の境界を確定し、Luna向け4スライスを開始した。
- 第1〜第4スライス達成度：各100%。Goal全体達成度：100%。`tools/sync-formation-share-catalog.js`を追加し、生成データとの全件照合、公開済みfixtureのprefix保護、不足IDの末尾追記、削除・改名疑いの停止を実装した。
- シェルム、バリエ、シェルムの遺物を辞書へ追記し、現在の照合は`apostles=78 / artifacts=52 / spells=35 / masterPowers=6`で成功。
- `formation-share-display-data.js`を`statData.js`／`cards.js`から生成し、共有受信ページを計算用マスターから分離した。画像・共通アイコンには内容ハッシュを付け、`formation-share-asset-manifest.json`と`tools/sync-formation-share-assets.js`で共有HTML、ダッシュボード、先読みの参照を同期する。
- `tools/test-formation-share-catalog.js`、`tools/test-formation-share-display-data.js`、`tools/test-formation-share-assets.js`、`tools/test-formation-share-maintenance.js`、`tools/test-formation-share-image.js`、`node tools/validate-formation-share-maintenance.js --base-catalog tools/fixtures/formation-share-catalog-v1.json`で検査成功。`--write`再実行は変更なし。
- ローカルHTTP／Chromeで新規使徒・遺物の表示、エラーなし、画像生成1200×573px、ハッシュ付き画像URLを確認。旧ページキャッシュを版付き共有URLで更新できることも確認した。両テーマの既存PNG受け入れ確認は前Goalの記録を維持する。
- `tools/generate-all.bat`へ共有更新工程を接続し、`tools/git/push.bat`とPages workflowから同じ公開前検査を呼ぶようにした。Manager `AGENTS.md`、README、URL仕様、skill接続手順も更新した。残り見積もり0スライス。
- 未確認は、xlsxに差分がないための`generate-all.bat`全工程実行と、push後のGitHub Actions実行。実行すると生成物・バックアップを更新するため今回は行わず、各Node工程・統合文字列・ローカルHTTP／Chrome検証で確認した。環境提供skill本体は直接編集せず、適用手順を`docs/formation-share-maintenance-skill-integration.md`へ残した。
- 元xlsxは変更していない。旧共有画像Goalは完了・push済みのまま維持する。

以下の共有画像実装記録は前Goalの完了根拠。

### 最新：編成画像＋URL共有（現行スコープ完了・画像＋URL共有は一時凍結）

- 目的：GitHub Pagesのまま、同一編成のPNGと共有URLを利用者がDiscord等へ投稿できるようにする。
- 設計・実装スライス達成度100%。固定幅1200pxのPNG生成、共有モーダルの画像プレビュー・保存・画像コピー・URLコピーを接続した。C1〜C3の主要経路とC5の世代管理・待機上限を確認済み。画像＋URL共有の処理は保持するが、現行UIでは一時的に非表示とし、個別操作を現行の完了範囲とする。
- 実装内容：`formation-share-image.js`に共有URLを専用iframeへ読み込むDOM/CSS再利用PNG変換、画像・フォント準備待ち、12秒タイムアウト、12000px高さ・2,400万px面積・12MB PNG上限、世代管理と遅延結果破棄を追加。`stat-dashboard.html`から同梱スクリプトを読み込む。画像化時の共有全体補正は、HP／攻撃／防御／会心／抵抗の5グループへ整理し、内訳を各グループ内に表示する。
- 検証済み：`node --check formation-share.js`、`node --check formation-share-image.js`、`node --check formation-share-create.js`、`node tools/test-formation-share-image.js`、`node tools/test-formation-share-codec.js`、`git diff --check`。いずれも成功（差分空白確認では改行コード警告のみ）。
- ブラウザ確認：ローカルChromeで共有モーダルを開き、実PNG生成成功（通常1200×777px、全スペル35枚1200×1083px）、全体補正5グループ、画像コピーの成功表示、保存操作、ライトテーマとダークテーマの同期を確認した。iframeの`hidden`属性がCSSで上書きされる問題も修正し、生成後はPNGだけを表示する。画像系操作を左、URLコピー・閉じるを右へ配置し、画像＋URL共有は非表示にした。
- 受信確認：ページ版クエリ付きの共有URL（`?v=20260912a#1.z...`）を新しいタブで開き、現行スクリプト、9人、全スペル35枚、権能2件、全体補正のHP／攻撃／防御／会心／抵抗5グループを復元した。ページの横はみ出しはなかった。
- 失敗系確認：一時検証ページで正常生成（1200×777px）、高さ上限超過（`height-limit`）、即時キャンセル（`timeout`）を確認した。生成状態表示は画像外へ移し、全体補正値を覆わないようにした。
- 操作案内：画像＋URL共有に対応しない端末向けに、画像を保存／コピーしてURLを同じ投稿へ貼り付ける手順をモーダルへ追加した。デスクトップ幅で案内とボタンの共存を確認した。
- 狭幅対策：700px以下では共有ダイアログ全体を縦スクロール可能にし、画像・URL・操作ボタンが短い画面高で隠れないCSSへ更新した。実機幅の目視は未実施として残している。
- ローカルファイル対策：`file://`で開いたダッシュボードでは、ブラウザのローカルファイルDOM／画像取得制限によりPNG生成できないため、12秒待ちの一般タイムアウトにせず、HTTP経由で開き直す案内を即時表示する。GitHub Pagesの`https://`とローカルHTTPサーバー経由は対象どおり維持する。
- 操作列整理：画像＋URL共有を一時凍結し、画像コピー・画像保存とURLコピー・閉じるを同じ操作列へ統合した。通常幅は画像系を左、URL操作を右、狭幅は2段へ折り返す。
- 共有ページ操作：`formation-share.html`にも固定下部バーを追加し、画像生成・画像コピー・画像保存・URLコピーを接続した。画像生成は手動開始とし、生成PNGの対象は従来どおり`#share-content`だけで、下部バーは含めない。HTTP画面で生成後の操作有効化、URLコピー、390px幅の横はみ出しなしを確認した。
- 列見出しを調整：`後列・後衛グループ・3/3`の形式からグループ名を外し、`後列 3/3`のように列名の直右へ達成数チップを配置した。文字サイズと枠を少し強調し、共有ページのDOM／CSSをそのままPNG生成へ反映。HTTP画面で3列の表示、旧表記の消失、横はみ出しなし、1200×850pxのPNG生成成功を確認した。共有ページCSS／JSと生成URLのキャッシュバスターを更新した。
- テーマ切替後の共有画像再生成を修正：共有モーダルを閉じている間にライト／ダークを切り替えた場合も、再表示時に現在テーマをプレビューへ同期してから画像化するようにした。画像変換iframeには生成世代ごとの内部クエリを付け、旧テーマのiframe状態を再利用しない。HTTP画面で`light→dark`の「閉じる→テーマ切替→再共有」を実施し、ダーク配色の1200×850px PNG生成を確認。構文・共有画像基盤テスト・codecテスト・`git diff --check`成功。
- 未確認：360／390／430pxの実機表示、欠落画像の実素材ケース、連続更新の目視、画像コピー拒否時、ネイティブ共有の実端末受信、Discordへの実投稿。ブラウザの共有操作は成功表示までで、外部送信は行っていない。
- 後続確認：実機での共有先受信とDiscord投稿確認。現行スコープの実装スライスとローカル検証は完了しており、外部送信は利用者の操作が必要。

### 過去の記録

以下の「最新」表記は当時の記録。現在の優先事項は上記とGOAL.mdの冒頭を正とする。

- 最新：Luna向け「編成共有URL v1の製品化」Goalを完了。固定辞書、共有対象（配置・ID・★・A段階・カード育成・権能・全体%補正）の製品codec、CRC32、境界拒否、Node zlib展開互換、URL長再計測、stat-prototype.jsからの作業中状態抽出、読み取り専用受信ページ、編成画面の共有モーダルを追加した。tools/test-formation-share-codec.js成功、空20文字・代表82文字・全要素307文字（payloadのみ）、固定ベースURLを含む全体長70/132/357文字。編成画面で生成したURLを受信ページで復元し、360/430/1280pxの横はみ出しなし、ライト／ダークテーマ、全体%補正ON/OFF、更新、URLコピー、エラー時のサンプル非表示を確認した。関連DPS回帰・構文・git diff --checkも成功。第1〜第3スライス達成度100%、残り0（PNG・取り込み・公開・commit・pushは対象外）。

- 最新追記：任意タイトルを共有対象から除外。格納仕様v1のタイトル用ステージID・敵ID・文字列を削除し、flagsは全体%補正有無のみ、残りは予約0へ変更。設計修正スライス100%、根拠は対象表・バイト順序・受入条件の整合。製品実装・再計測は未実施、残り見積もり約3スライスを維持。

- 最新（2026-09-10）：ALv・SLvを共有表示・URLから除外し、[格納仕様v1](docs/formation-share-url-format.md)を確定。ID・★・A段階、カード育成、配置、スペル枚数、権能、全体%補正、任意タイトルを保持する。未知値、ビット配置、予約値、入力上限、辞書版、エラー、検証条件を文書化した。設計スライス達成度100%、根拠は同仕様のフィールド表と受入条件。製品v1実装・検証は0%、残り約3スライス（codec検証、保存抽出と表示接続、共有操作と端末検証）。今回は文書のみ変更。
- レビュー訂正：以下のGoal2完了表記は方式比較の実施記録に限定する。旧ハーネスはID 99999を受理し、アサイド不明値を拒否する。辞書参照外拒否・過大展開境界は検証完了していない。461文字は23文字・59バイトのタイトル付き代表例で、最大条件ではない。新仕様のURL長は未計測。

- Goal「編成共有URLの圧縮方式比較と長さの実測」は完了。12ケースのJ/B/Z往復一致、境界拒否、URL全体長、処理時間、検証ブラウザの圧縮API有無を確認し、Z方式（固定順バイナリ＋CRC32＋DEFLATE raw）を新規生成の推奨とした。通常9人269文字、全スペル347文字、最大タイトル込み461文字。製品画面への接続・公開辞書・ブラウザ圧縮実装・端末間共有は後続Goal。

- 直近の実装Goal「DPS発動経路・入力モード統合」は、既存の完了報告では必須範囲を完了している。「編成共有画面の試作と表示方針の検証」は完了し、製品化Goalは未設定。
- 編成共有の表示試作は、今回の情報量調整まで完了した。カード名・役割・攻撃タイプ・愛用情報を主表示から外し、画像中心の相談用表示へ整理した。URL・PNGの製品化Goalは未設定。
- 権能WebP素材の追加を反映し、権能欄を画像＋名前表示へ更新した。動画への依存はない。
- 今回の文書整備では、AGENTS方針の統一、DPS現行仕様の訂正、専用Skillの修正、現在地と履歴の分離を実施した。
- 完了は各作業の依頼範囲についての判定であり、アプリ全体や全使徒のゲーム内再現精度が100%という意味ではない。
- この現在地は既存記録の整理結果。過去のテスト・実画面確認を今回再実行したという意味ではない。

2026-09-09: 全体強化数値の配置誤りを訂正する実装スライスを開始・完了。前回は `stat-dashboard` の下部へ追加していたため、その誤配置を撤去し、編成共有プレビューの最下部へ移植した。共有側では保存済み使徒スナップショットの `breakdown` / `globalPercentRates` を利用し、強化元を選択表示できるようにした。実装達成度100%、残りはPC／スマホ実画面確認の1スライス。
2026-09-09: 全体強化数値のPC／スマホ実画面確認を完了。PC幅は2列、390px幅は1列で表示され、共有画面の横はみ出しなし。表示設定の開閉と項目ON/OFFによる表示カード増減、既存の編成・スペル・権能表示を確認した。node --check と git diff --check も成功。達成度100%、今回の依頼範囲は完了。
2026-09-10: 編成コイン欄の所持／使用アイコンの見た目の大きさを調整。両方の表示枠は維持したまま、素材の余白差で小さく見えていた使用側 `cost.webp` を中央基準で1.1倍に補正した。PC・390px幅で確認し、横はみ出しなし。CSSキャッシュバスター更新済み。達成度100%、今回の依頼範囲は完了。
2026-09-10: 編成共有の全体強化表示を修正。保存時に圧縮された `comparisonStats` から全体%補正を復元し、初期表示をアサイド・特殊マス由来の全体%補正だけに限定した。非全体の好感度・ボード下級・アサイドLv・アサイド発現は候補から除外。表示位置を共有メモの前へ移し、ステータス／補正値の表形式と `+n%` 表記へ変更。PC・390px幅で表示順、9行の表、横はみ出しなしを確認。達成度100%、今回の依頼範囲は完了。
2026-09-10: 編成共有の全体強化表示を微調整。`対象: 編成全体` と説明文を削除し、補正値は100分の1に換算せず、保存された`607`を`+607%`として表示するよう修正。PC・390px幅で対象／説明文0件、9行、横はみ出しなしを確認。`node --check formation-share-prototype.js` と `git diff --check`も成功。達成度100%、今回の依頼範囲は完了。
2026-09-10: 編成共有の通常幅レイアウトを調整。全体強化数値を横一列の独立行から通常のサポートグリッド階層へ戻し、スペル・権能と同じ行のパネルとして配置した。パネルの内容高さによる不自然な引き伸ばしを防ぎ、390px幅では縦1列を維持。PC・スマホで横はみ出しなしと`+607%`表示を確認。達成度100%、今回の依頼範囲は完了。
2026-09-10: 編成共有の狭幅時に遺物だけが拡大する問題を修正。450〜800pxでも使徒＋遺物3枠を最大399pxの4列基準へ揃え、440px以下の既存配置との境界で急拡大しないようにした。360/390/440/450/500/600/700/800pxで使徒画像と遺物画像の実寸、横はみ出しなしを確認。目視確認、`node --check formation-share-prototype.js`、`git diff --check`も成功。達成度100%、今回の依頼範囲は完了。
2026-09-10: 編成共有下部の配置を明示的なレスポンシブ構造へ再設計。通常幅は上段「スペル｜権能」、下段「全体強化数値｜共有メモ」の2列2段とし、右列を220〜300px、左列を残り幅にした。800px以下は同じDOM順の1列へ固定。390/760/800/801/900/1000/1120/1121/1280/1460pxと、全体強化元1件・4件の双方で順序、左右境界、横はみ出しなしを確認し、設計書へ規則を記録した。達成度100%、今回の依頼範囲は完了、残り見積もり0。
2026-09-10: 編成共有から共有メモを削除。URL長の懸念を踏まえ、メモ用パネル・関連スタイル・設計上の共有メモ項目を除外した。通常幅は上段「スペル｜権能」、下段「全体強化数値」の全幅、800px以下は同じ順序の1列へ整理。390/801/1280pxでメモ要素0件、表示順、横はみ出しなしを確認。設計書とCSSキャッシュバスターを更新し、達成度100%、今回の依頼範囲は完了、残り見積もり0。
2026-09-10: 全体強化値の下段全幅表示を維持しつつ、内部リストを最大720pxへ制限。表のステータス名と補正値が離れすぎないようにし、強化元1件・4件の両方で2列構造を確認した。390/801/1280pxで表示順、横はみ出しなし、ステータス／補正値の境界を確認。`node --check formation-share-prototype.js` と `git diff --check`も成功。達成度100%、今回の依頼範囲は完了、残り見積もり0。
2026-09-10: 全体強化値の表を内容幅に変更し、ステータス名と補正値を近接表示。スペル・権能の上段を内容量対応のラッパーへ分離し、スペル0/1/6/7枚でカード数に応じて縮小・折り返しするようにした。390/801/1280pxで上段の詰まり方、全体強化値の下段位置、横はみ出しなしを確認。設計書とCSSキャッシュバスターを更新し、`node --check formation-share-prototype.js` と `git diff --check`も成功。達成度100%、今回の依頼範囲は完了、残り見積もり0。
2026-09-10: スペル枚数による上段の高さ差を調整。通常幅のスペル・権能を全幅2列グリッドへ戻し、同じ行の短いパネルを長い方の高さまで揃えて縦方向の空きを埋めた。幅は全列を維持し、全体強化値は一つ下の段、表の内容幅制限も維持。スペル0/1/6/7枚を390/801/1280pxで確認し、上段の行高、下段位置、横はみ出しなしを確認。設計書・CSSキャッシュバスター更新、`node --check formation-share-prototype.js` と `git diff --check`成功。達成度100%、今回の依頼範囲は完了、残り見積もり0。

## 直近の実装Goalの完了根拠

計画と完了条件の原文は[完了済みGoal](docs/history/goal-dps-trigger-integration.md)、詳細な検証記録は[旧STATUS](docs/history/status-through-2026-09-07.md)の「アクティブGoal完了条件の現在地」と「DPS発動経路最終回帰スライス5の終了報告」にある。

| 完了条件 | 記録上の結果 |
| --- | --- |
| 1: 発動経路監査 | runtime 100行でpolicy未付与0件・発火経路なし0件。編成候補8件を確認 |
| 2: 自動・推定の接続 | 本人時計・既知周期は自動、対応する編成普通・強化・低学年は自動（推定） |
| 3・4: 高学年判定・低高分離 | 構造化された発動元で判定し、低高共有bindingを分離 |
| 5・7: 手動上書き・保存 | 同じbindingの自動推定を手動providerで置換し、旧保存値との互換と比較入力を確認 |
| 6・8・9: 外部条件・共通処理・代表例 | 外部入力待ちを維持し、本体／試験版の共通policyと代表fixtureを確認 |
| 10: 回帰・表示 | 対象テスト、監査、cache、公開文面、PC／スマホ、通常計算詳細を確認 |

監査件数は当時のfixture条件に対する値であり、全条件の網羅数として扱わない。

## その後の完了済み変更

以下は旧STATUSの後続終了報告を反映した現在地。途中の診断で挙がった残作業と区別する。

- アヤの編成凍傷は、反応定義だけの共有から、状態専用providerによるスタック反映と個別設定UIまで進んだ。低学年A2・愛用品は初期AUTO、高学年は個別bindingだけ初期OFF。本人のダメージ・DoTを編成側へ複製しない。設計スライス6～実装スライス10の記録を参照。
- 状態効果の自動表示用語を統一した（スライス11）。
- DPS計算中の再計算予約競合と、ティグ愛用火傷の前提状態が除外される回帰を修正した（スライス12・13）。
- 全体ボードの合計値表示とダークモード配色を改善した（スライス14・15）。
- 高学年の2F移行開始からモーション終了まで、基礎の毎秒SP回復を停止し、残り周期から再開するよう変更した。独立した周期SP回復は停止しない（スライス16）。

## 残る検証事項と対象外

| 区分 | 現在残っていること | 扱い |
| --- | --- | --- |
| ゲーム内検証待ち | 同一フレーム順、丸め、速度別SP位相、効果連鎖の細部 | 暫定規則と根拠を仕様・台帳で管理 |
| 使徒・効果別の精度 | 多段・生成物・敵サイズ別ヒット数、倍率配分、アヤ蝶の戻り命中など | 推定・補完を確定値と混同しない |
| 固有リソース | ランダム消費量、上限／下限で変化しない操作の発動扱い | 未検証事項を残し、確認後に更新 |
| 将来の実装範囲 | 敵AI、被弾・撃破等の自動検出、厳密な編成支援時計、フル編成DPS | 完了済みGoalの必須範囲外。次の実装依頼として自動着手しない |

詳細は[DPS仕様書](docs/dps-specification.md)、[行動タイムライン設計](docs/dps-simulation-design.md)、[効果台帳](docs/dps-effect-inventory.md)、[ロードマップ](docs/dps-implementation-roadmap.md)を参照する。

## 次の作業

2026-09-09: 全体強化下部表示の実装スライスを完了（達成度100%、Goal完了）。既存のステータス`breakdown`を再利用する下部ドックを追加し、Rank全体・研究・ボード下級／上級・好感度・アサイド発現／Lv・全体%補正を選択表示できるようにした。チェック状態は`trickcal_global_bonus_dock_v1`へ保存し、初期設定へのリセットも追加した。固定下部ナビの高さは変更せず、スマホの列折り返しと設定ポップオーバーのはみ出しを調整した。PC／430px／390px、ダーク／ライトで表示・横はみ出しなしを確認し、表示源の切替と再読み込み後の保持を確認。`node --check stat-prototype.js`、`git diff --check`成功。残り見積もりは0。今回pushは行っていない。

2026-09-09: 全体強化下部表示の設計スライスを完了（達成度25%、Goal完了条件「下部表示」と「表示内容選択」）。既存`render()`の`breakdown`と`globalPercentRates`を表示専用ドックへ渡し、ボード・研究・Rank全体・アサイド・好感度・全体補正の値を二重計算せず再利用する方針を確定した。固定下部ナビの高さは変更せず、その直上に表示し、表示源の選択状態は専用localStorageへ保存する。次はHTML／JS／CSSの実装、残り見積もり2スライス。

2026-09-09: 編成共有の凡例・編成情報表示を再確認（達成度100%、再確認スライス）。A2アサイド、はんだ、低／高／P技能の補助凡例が表示されていないこと、編成配置へ編成タイトル・ステージ・敵が表示されることをPC幅と390px幅で確認した。スマホ幅でも横はみ出しなし。既存実装で要件を満たしているため、追加修正は行っていない。残り見積もりは0。今回pushは行っていない。

2026-09-09: 編成共有の凡例整理・タイトル情報表示スライスを完了（達成度100%、今回の表示修正範囲）。A2アサイド、はんだ、低／高／P技能の補助凡例を削除し、各カード・使徒画像・技能アイコン本体の情報だけを残した。編成配置見出しに任意の編成タイトル・ステージ・敵・タグを表示する領域を追加し、URLパラメータ、共有メタデータ、アクティブ保存編成名／タグへ対応した。未設定時は領域を隠す。PC／390px幅で凡例要素0件、メタデータ表示、主見出しの収まり、横はみ出しなしを確認。設計書も凡例なし・コンテキスト表示へ更新。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 編成共有の英字補助ラベル整理スライスを完了（達成度100%、今回の表示修正範囲）。FORMATION SNAPSHOT、FORMATION、SPELLS、MASTER POWER、NOTEを主表示から外し、日本語の主見出し・説明・ブランド表示は残した。ラベル削除後の見出し間隔を詰め、PC／390px幅で余分なラベル0件、主見出しの存在、横はみ出しなしを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: スペル枚数チップの余白縮小スライスを完了（達成度100%、今回の表示修正範囲）。×2チップのpaddingを上下0px・左右2px、角丸3pxへ縮小し、文字に対して背景が大きくなりすぎないようにした。PC／390px幅でチップサイズ、★より上、はんだ非重複、横はみ出しなしを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: スペル枚数表示のチップ化スライスを完了（達成度100%、今回の表示修正範囲）。×2へ半透明の緑背景、角丸、内側余白、薄い枠、影を追加してチップ表示にした。白文字・黒縁、★の上、はんだとの非重複位置は維持した。PC／390px幅で背景rgba、角丸、白文字・黒縁、★より上、横はみ出しなしを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: スペル枚数表示の配色調整スライスを完了（達成度100%、今回の表示修正範囲）。×2を白文字・黒縁・影付きへ変更し、背景なし・★の上・はんだとの非重複位置を維持した。PC／390px幅で白文字、黒縁実効値、★より上、はんだ非重複、見出し色の意図しない変更なし、横はみ出しなしを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: スペル枚数表示位置の調整スライスを完了（達成度100%、今回の表示修正範囲）。×2を右上から★の少し上へ移し、はんだ表示と分離した。背景は付けず、紫文字・白縁取り・影付きにした。PC／390px幅で×2が★より上、はんだと非重複、横はみ出しなし、実効白縁取りを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: スペルカード枠の前面表示修正スライスを完了（達成度100%、今回の表示修正範囲）。画像を枠いっぱいにしたことで隠れていたスペルのレア度枠を画像の上へ移し、★・コスト・はんだ・×2は枠より前面に残した。PC／390px幅で愛用黄・伝説紫・希少青の枠色、各要素のz-index、横はみ出しなしを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 編成列色とスマホ列順の調整スライスを完了（達成度100%、今回の表示修正範囲）。使徒行全体の背景・区切り線を性格色から列色へ統一し、後列を青系へ変更した。性格色は使徒肖像の枠・アイコンへ残した。狭幅ではCSSの表示順を前列→中列→後列へ変更し、通常幅の3列配置は維持した。PC／390px幅で列背景の統一、肖像の性格色保持、前→中→後の実配置、横はみ出しなしを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 使徒育成情報のR表示調整スライスを完了（達成度100%、今回の表示修正範囲）。R6を同一の強調フォントで描画し、Rと数字のフォントサイズ・太さ・色を統一した。Lvは従来どおり控えめなラベル色と数値色を分け、ALvの色分けも維持した。PC／390px幅で実効スタイルと横はみ出しなしを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: スペル画像の内側余白除去スライスを完了（達成度100%、今回の表示修正範囲）。スペル用画像をメディア枠の100%へ広げ、`object-fit: cover`と枠のoverflowで角をクリップできる表示にした。PC／390px幅で画像とメディアの矩形が一致し、余白なし、横はみ出しなしを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: ★重なり表示の調整スライスを完了（達成度100%、今回の表示修正範囲）。使徒・遺物・スペルの★画像を少し拡大し、2pxずつ重ねて右側ほど高いz-indexになるようにした。各★へ個別の影を付け、重なり順で右側の★が前面に出る構造を維持した。PC／390px幅で重なり、前後関係、横はみ出しなしを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: スペルカード重複表示と内側余白の調整スライスを完了（達成度100%、今回の表示修正範囲）。同一スペルの×2表示を星と重ならない画像右上へ移し、紫色・背景なし・影付き文字にした。スペルカード外枠の内側paddingをなくし、外枠54px・画像52pxとして枠と画像の隙間を解消した。case=duplicateをPC／390pxで確認し、×2と星の矩形は分離、背景透明・枠なし・紫色・影付き、横はみ出しなしを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: スペル背景削除スライスを完了（達成度100%、今回の表示修正範囲）。スペルからレア度背景画像だけを外し、レア度枠・愛用品対象時の黄色枠・コスト・★・はんだ・×2表示は維持した。case=duplicateでスペル背景0件、7枚・6種類、×2、390px横はみ出しなしを確認。遺物のレア度背景と権能コストは維持。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 権能コスト・スペル枠・重複サンプルスライスを完了（達成度100%、今回の表示修正範囲）。教主の権能へコスト30のコインを追加し、総合コストにも権能分を加算した。スペルへレア度背景・枠を追加し、対象使徒が編成にいる愛用品スペルだけ黄色の愛用枠へ切り替えた。case=duplicateで同一スペルを2枚採用し、7枚・6種類と×2表示を確認。代表サンプルの総合コストは権能込み728、PC／390pxで横はみ出しなし、権能・スペル画像の読込を確認。遺物枠は伝説紫・希少青・高級緑・愛用品黄へ修正。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 狭幅使徒・性格表示スライスを完了（達成度100%、今回の表示修正範囲）。360／390pxでは使徒肖像と遺物3枠を4等分で揃え、使徒名を非表示にして遺物だけが大きく見える状態を解消した。使徒左上へ性格アイコンを9件表示し、純粋・冷静・狂気・活発・憂鬱ごとに行背景と肖像枠を色分けした。Aバッジ・★・コスト・育成情報を維持し、PC幅では従来の使徒名表示と使徒肖像サイズを維持。横はみ出しなしを確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: コイン18px・内部数字維持スライスを完了（達成度100%、今回の表示修正範囲）。遺物・スペルのコインを18pxへ統一し、内部数字は0.68rem・太字のまま小さくしなかった。390pxで2桁コストが収まり、星・はんだとの干渉なし、横はみ出しなし、コスト画像33件の読込を確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: コインサイズ・数値太さ調整スライスを完了（達成度100%、今回の表示修正範囲）。カード上のコインを21px、スペル上を18pxへ縮小し、数値を相対的に大きく太くした。PC／390pxで2桁コストが枠内に収まり、星・はんだとの干渉なし、横はみ出しなし、コスト画像33件の読込を確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: コスト数値の黒文字・白縁スライスを完了（達成度100%、今回の表示修正範囲）。コイン中央の数値を黒文字へ変更し、白い縁取りと薄い影を付けた。コイン画像の影、背景なし、遺物・スペルの配置は維持し、390pxで横はみ出しなしとコスト画像33件の読込を確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: カードコストのコイン重ね表示スライスを完了（達成度100%、今回の表示修正範囲）。遺物・スペルの左上コストを暗い矩形バッジから背景なしのコイン画像へ変更し、数値をコイン中央へ重ねた。数値には濃い縁取りと影、コイン画像にはドロップシャドウを適用した。PC／390pxでカード上の視認性、背景・枠なし、横はみ出しなし、コスト画像33件の読込を確認。node --check formation-share-prototype.js、git diff --checkも成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 編成共有カードのレア度背景・コスト表示スライスを完了（達成度100%、今回の表示修正範囲）。遺物へ伝説・希少・高級の既存レア度背景を適用し、装備者と愛用品対象が一致する場合は愛用品背景へ切り替えた。遺物・スペルの左上へコストを表示し、編成見出しに遺物・スペルの採用枚数を反映した総合コストを追加した。代表サンプルは総合コスト666、`case=empty`は0、`case=one`は42、`case=six`は507となること、背景27件・コスト33件の画像読み込み、390pxで横はみ出しなしを確認。`node --check formation-share-prototype.js`、`git diff --check`も成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 出力表示項目切替スライスを完了（達成度100%、今回の表示修正範囲）。出力画面に`Lv〜ALv`と`SLv`の個別チェックを追加し、両方ON・Lv〜ALvのみOFF・両方OFFで該当行が切り替わることを確認した。390pxで各状態とも横はみ出しなし、アサイド未発現の補助文言0件を確認。`node --check formation-share-prototype.js`、`git diff --check`も成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: アサイド表記・色分けスライスを完了（達成度100%、今回の表示修正範囲）。画像外のアサイドレベルを`ALv`表記へ変更し、画像上のA1・A2・A3バッジを青・紫・橙で色分けした。代表サンプルでA1 2件／A2 3件／A3 2件、`ALv`表示7件、旧`・Lv`表記0件を確認。`node --check formation-share-prototype.js`、`git diff --check`も成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 使徒★背景透明化スライスを完了（達成度100%、今回の表示修正範囲）。使徒肖像下部の★帯背景を透明にし、カード★と同じく画像へ直接重ねる表示へ統一した。ブラウザで使徒★45件・カード★背景透明を確認し、`node --check formation-share-prototype.js`、`git diff --check`も成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: ★画像復帰・黒影スライスを完了（達成度100%、今回の表示修正範囲）。文字★を廃止して既存の点灯／未点灯★画像へ戻し、画像へ黒い`drop-shadow`を追加した。代表サンプルで画像★210件の欠落0件、遺物カードの5個すべてが枠内、フィルター適用を確認。`node --check formation-share-prototype.js`、`git diff --check`も成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: ★白縁取り調整スライスを完了（達成度100%、今回の表示修正範囲）。文字★の輪郭を白へ変更し、視認性補助として暗い影を維持した。PC実画面で黄色★・白縁取り・影を確認し、`node --check formation-share-prototype.js`、`git diff --check`も成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 文字★置換スライスを完了（達成度100%、今回の表示修正範囲）。使徒・遺物・スペルの★を画像から5枠の文字★へ変更し、点灯を黄色、未点灯を灰色、暗い縁取りと影で表示した。360／390／430pxで画像★0件、各遺物の5個の★が枠内、横はみ出しなしを確認。`node --check formation-share-prototype.js`、`git diff --check`も成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 遺物フレーム色判定スライスを完了（達成度100%、今回の表示修正範囲）。通常の遺物枠を紫系へ統一し、カードの`favoriteCharacter`と装備者名が一致する愛用品だけ黄色系へ変更した。代表サンプルで紫24枠・黄色3枠、旧希少度クラス0件を確認。`node --check formation-share-prototype.js`、`git diff --check`も成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 権能・スペル列幅調整スライスを完了（達成度100%、今回の表示修正範囲）。権能列を内容に必要な167px前後へ縮め、残りをスペル列へ配分した。988pxではスペル762px／権能167px、1280pxではスペル732px／権能167px、390pxでは1列化し横はみ出しなしを確認。`node --check formation-share-prototype.js`、`git diff --check`も成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 権能WebP対応スライスを完了（達成度100%、今回の表示修正範囲）。`img/Card/権能_<権能名>.webp`を権能欄へ表示し、名前を併記した。画像欠落時は「画像なし」へ切り替え、未選択表示と動画非依存を維持。代表サンプルの権能画像・名前表示、`node --check formation-share-prototype.js`、`git diff --check`を確認。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: スペル画像コンパクト化スライスを完了（達成度100%、今回の表示修正範囲）。スペルカードを固定小型枠へ変更し、画像を52pxとして遺物画像の53.5pxと同程度にした。PCでは横並び、390pxでは折り返し、横はみ出しなしを確認。`node --check formation-share-prototype.js`、`git diff --check`も成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: はんだ`+0`非表示スライスを完了（達成度100%、今回の表示修正範囲）。遺物・スペルのはんだバッジを`+1`以上の場合だけ表示し、未強化カードのツールチップからも`はんだ+0`を除外した。代表サンプルでカード33枠中、表示バッジは`+1`以上のみ、`+0`バッジ0件・`はんだ+0`タイトル0件を確認。`node --check formation-share-prototype.js`、`git diff --check`も成功。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 編成共有カード★内側配置スライスを完了（達成度100%、今回の表示修正範囲）。カード★をフレームから4px内側へ移し、遺物カードでは★画像を8pxへ縮小して5個すべてが画像内に収まるようにした。ブラウザの実寸確認で最初と最後の★がカード矩形内にあることを確認。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 編成共有カード★表示の微調整スライスを完了（達成度100%、今回の表示修正範囲）。遺物・スペルの★帯背景を透明化し、画像上へ直接重ねる表示に変更した。使徒★の背景は維持した。根拠はブラウザ実画面と計算スタイル確認で、`.card-stars`は透明、`.member-stars`は従来背景、カード★33件を確認。残り見積もりはこの修正0。今回pushは行っていない。

2026-09-09: 編成共有表示情報量調整スライスを完了（達成度100%、試作Goal完了後の表示改善範囲）。使徒★を肖像画像下部へ重ね、低・高・Pを技能アイコン＋SLvへ変更した。カード名・役割・攻撃タイプ・愛用情報を一覧から外し、遺物・スペルのはんだを画像なしの右上`+n`へ統一した。教主の権能は動画を表示せず名前だけにした。根拠はブラウザ実画面のPC／360・390・430px確認、横はみ出しなし、画像欠落ケースとライトモード、可視カード名0件・はんだ画像0件・権能動画0件、`node --check formation-share-prototype.js`、`git diff --check`。残り見積もりはこのスライス0、カード詳細ボタンの要否・権能WebP・URL/PNG共通スナップショットと共有操作は別Goalで約2〜3スライス。今回pushは行っていない。

2026-09-09: 編成共有試作スライス3を完了（Goal達成度100%、アプリ実装の試作範囲100%）。設計書へ確認結果と採用候補を追記した。1280pxで3位置グループ×3人、360/390/430pxで横はみ出しなし、ライト/ダーク、1/6/9人、空き枠、画像欠落を確認。試作URLの`case`切替で代表ケースを再現でき、表示元の保存状態・代表サンプルを明示する。根拠はブラウザ実画面・DOM・コンソールエラーなし、`node --check formation-share-prototype.js`、`git diff --check`。残りは製品化のURL/PNG共通スナップショット、共有操作、カード名全文確認方法の設計で、別Goalとして約2〜3スライスを見込む。今回pushは行っていない。

2026-09-09: 編成共有試作スライス2を完了（完了条件3・4の確認範囲100%、Goal全体の進捗は約85%）。`case=empty/one/six/missing`を追加し、1/6/9人・全空き・使徒画像欠落・カード画像欠落を切替確認できるようにした。360/390/430pxで`document.documentElement.scrollWidth > innerWidth`がfalse、ライト/ダーク双方を確認。空きケースはスペル・権能未選択を表示。根拠はブラウザDOM確認、コンソール警告/エラー0件。残りは確認結果の設計書反映と最終状態整理（約1スライス）。

2026-09-09: 編成共有試作スライス1を完了（完了条件1・2・5に対する達成度100%、Goal全体の進捗は約50%）。[formation-share-prototype.html](formation-share-prototype.html)・CSS・JSを追加し、保存状態を読み取り専用で利用できる独立プレビューと、空状態用の9人代表サンプルを作成した。1280pxで3列×3人、各使徒と遺物3枠、A1〜A3重ね表示、使徒★・Lv・Rank・SLv、カード★・はんだ・愛用Lv、スペル、権能を確認。390pxでも横はみ出しなし。根拠はブラウザ実画面とDOM確認、`node --check formation-share-prototype.js`、`git diff --check`、コンソールエラーなし。残りは360/390/430px・ライト/ダーク・1/6/9人・空き枠・画像欠落・長名・スペル多数の確認と、必要な表示調整（約2スライス）。URL・PNG・本体統合は対象外。

2026-09-09: Goal設計スライス完了（今回の計画文書化100%、試作の完了条件1〜6は全て未検証・実装0%）。根拠はGOAL.mdに目的・6完了条件・3スライス・対象外・停止条件を記載し、設計案の配置固定条件を最新依頼に合わせて緩和したこと。配置変更は許容するが編成位置と装備対応は保持する。残り見積もりは開始指示後の試作約3スライス、製品化は別途再見積もり。URL・PNGは後続要件として維持。今回は文書のみ変更し、試作・実装・公開・pushを行わず停止する。以下の以前の見積もりより本項を優先する。

2026-09-09: 編成共有の参照画像反映スライス完了（今回の配置設計更新100%、実装0%）。ゲーム内画像を目視確認し、各列3人・各行は使徒の右に遺物3個という構造へ設計案を修正した。使徒名・SLvは行幅を使い、★とはんだは各画像下、A1〜A3は肖像へ重ねる。スマホ全景の縮小だけでは育成値を読めないリスクを明記し、拡大閲覧案を追加した。残りはスマホ用モックでの判読性確認と、実装約3スライス。アプリ変更・実画面検証は未実施。

2026-09-09: 編成共有の設計継続スライスを完了（今回の要件反映100%、実装0%）。URL生成を初期機能へ組み込み、★・はんだは既存画像素材、A1〜A3は使徒画像への重ね表示、使徒と3遺物を一つの配置枠にする方針へ更新した。根拠は既存の編成描画と星・はんだ画像処理の確認。[設計案](docs/formation-sharing-design.md)にURLの固定・復元と狭幅配置も記載した。残り見積もりは実装約3スライスと実画面検証。設計上の画像サイズ・URL長上限は実装時の検証で確定する。

2026-09-09: 編成共有の設計スライスを完了（設計範囲100%、実装0%）。[編成共有カード設計案](docs/formation-sharing-design.md)に、配置を維持した9枠、アサイド・SLv・カード育成の常時表示、PNGとURLの段階導入、共有時点の育成値固定を整理した。根拠は現行の編成正規化・使徒SLv/アサイド表示・カード育成取得処理の確認。実画面のモック検証は未実施。残りは設計案の調整と、実装する場合に約3スライス。今回のアプリ実装変更はない。

今回依頼された編成共有の試作Goalは完了。次の製品化Goalは未設定。残るレビュー指摘のうち、保存仕様の重複整理、READMEの開発手順補足、育成費用表・出典整理は別途対応候補として残る。

2026-09-10: スペルカード複数枚時の`×n`バッジを緑系から紫系へ変更。紫系背景・境界・影へ統一し、白文字と黒縁取りによる視認性、既存の配置を維持。`case=duplicate`の390px/デスクトップ幅でバッジ表示、色、配置、横はみ出しなしを確認。`node --check formation-share-prototype.js`と`git diff --check`成功。達成度100%、今回の依頼範囲は完了、残り見積もり0。

2026-09-10: 全体強化値の強化元カードが2列グリッド幅いっぱいに伸び、ステータス表の右側に生じていた不要な空白を解消。内部リストとカードを内容幅基準へ変更し、通常幅は必要なカード幅で2列、800px以下は内容幅の1列を維持。4強化元を1280/390pxで確認し、表とカードの余白、表示順、横はみ出しなしを確認。`node --check formation-share-prototype.js`と`git diff --check`成功。達成度100%、今回の依頼範囲は完了、残り見積もり0。

2026-09-10: 全体強化元カードを通常幅の最大720px内で横方向へ詰め、収まる場合は4件すべてを1行表示するよう変更。800px以下は従来どおり1列を維持し、1280/801/800/390pxで行数、カード幅、横はみ出しなしを確認。`node --check formation-share-prototype.js`と`git diff --check`成功。達成度100%、今回の依頼範囲は完了、残り見積もり0。

2026-09-10: 編成共有の通常幅で遺物枠だけが使徒肖像より大きくなる問題を修正。通常幅の遺物枠に68px上限を設け、使徒肖像と最大サイズを統一。800px以下の既存の使徒・遺物同一サイズ挙動は維持した。360/390/440/500/800/801/1000/1280/1460pxでサイズ逆転なし、横はみ出しなしを確認。`node --check formation-share-prototype.js`と`git diff --check`成功。達成度100%、今回の依頼範囲は完了、残り見積もり0。

2026-09-10: 編成共有ヒーロー部の公開向け説明文「配置・使徒・遺物・育成状況を、相談用にひとまとめで確認する表示試作です。」を削除。見出し「この編成、どうかな？」、表示元、編成表示は維持し、`sample=1`で説明文0件・横はみ出しなしを確認。達成度100%、今回の依頼範囲は完了、残り見積もり0。

2026-09-10: Goal2第3スライスを完了。チェックサム込みの実測へ更新し、12ケースすべてでJ/B/Zの往復一致と境界拒否を確認した。固定ベースURLを含む全体長は、通常9人がJ404／B323／Z269文字、全スペルがJ493／B439／Z347文字、最大タイトル込みがJ628／B524／Z461文字。最大ケース1,000回反復の1回あたり処理時間はJが符号化0.0619ms・復号0.0335ms、Bが0.0451ms・0.0488ms、Zが0.0615ms・0.0594ms。検証用アプリ内ブラウザではCompressionStream／DecompressionStreamが未定義だったため、製品化では機能検出と同梱DEFLATE raw実装を前提に比較する。`GOAL.md`と`docs/formation-sharing-design.md`へ採用判断・残作業を反映した。第3スライス達成度100%、Goal全体100%、残りは公開辞書・共有ページ接続・端末検証の別Goal。

## 更新方法

2026-09-10: URL圧縮設計を具体化。J（配列JSON圧縮）/B（バイナリ）/Z（バイナリ圧縮）の比較、共通育成・差分・辞書参照、未知値、版管理、展開上限、計測条件を設計書へ記録。設計スライス100%、根拠は既存共有対象との対応と復元条件の明文化。文字数実測・エンコーダー実装は未実施。残り見積もり3〜4スライス（計測1、生成復元1〜2、画面接続と端末検証1）。アプリ変更なし。

2026-09-10: Goal2第1スライス完了。`tools/measure-formation-share-url.js`を追加し、共有対象を短い整数ID・固定順配列JSONへ正規化してJ方式（DEFLATE raw＋Base64url）を計測。one/six/nine/duplicate/all-spells/max/empty-relic/hidden/no-globalの9ケースで往復一致。URL全体は通常9人404文字、全スペル493文字、最大タイトル込み628文字。`cards.js`のスペル35種を含む計測用辞書67件を使用。第1スライス達成度100%、Goal全体約30%、残り2スライス。アプリ本体・datasheet変更なし。

2026-09-10: Goal2第2スライス完了。J（配列JSON圧縮）、B（固定順バイナリ）、Z（バイナリ圧縮）を実装し、共通ALv/SLv、全体%補正の差分、小数、未知値、カード辞書参照を比較。12ケースでJ/B/Zの往復一致を確認し、未知形式版・未知フラグ・末尾余剰・不正Base64url・破損ヘッダー・過大タイトルの拒否も確認。通常9人のURL全体はJ404/B317/Z260、全スペルはJ493/B433/Z336、最大タイトル込みはJ628/B519/Z453。第2スライス達成度100%、Goal全体約65%、残り1スライス。アプリ本体・datasheet変更なし。

2026-09-10: 共有対象縮小の設計を反映。使徒Lv・Rankを除外し、全体強化はアサイド・特殊マス由来の全体%補正のみ。ALv・SLv・★・アサイド段階・カード育成は維持。Discord用途のURL目標を数百文字へ変更（未実測）。設計反映100%、画面・URL実装0%。根拠はユーザー指定と設計書の格納項目・検証条件の更新。残りは計測・実装・端末検証3〜4スライス。

2026-09-10: 共有URL短縮の設計を`docs/formation-sharing-design.md`へ追記。表示対象のみの抽出、永続整数ID、カード育成辞書、固定順配列、圧縮選択、旧版参照、入力上限を整理。設計達成度100%、URL実装0%。根拠は共有プレビューの配置・カード育成・全体強化描画構造の確認。1,500〜2,000文字は未実測の目標。残り見積もりは計測・実装・端末検証で3〜4スライス。アプリ変更なし。

- 本書には現在の結論、完了根拠の要約、未完了事項、次の作業だけを残す。
- 過去の開始宣言・終了報告・途中の見積もりは`docs/history/`へ記録し、本書から参照する。途中の診断結果は後続の解決状況を確認してから残課題へ載せる。
- 新しい作業の範囲・完了条件は[GOAL.md](GOAL.md)へ記載する。完了時は計画を履歴へ保存し、現在の作業があるかを更新する。
- 現行の計算規則は仕様書を更新し、履歴に追記するだけで済ませない。過去の「100%」やテスト成功を新しい変更の検証結果として転用しない。
