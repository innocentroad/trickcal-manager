# Trickcal Manager 作業目標

更新日: 2026-09-20

## 現在の目標：管理画面カード先読み404修正を新旧公開済み・xlsx復元確認済み（2026-09-20）

- 管理画面カード画像先読みの404をローカル修正。`stat-prototype.js`は`TRICKCAL_PUBLIC_SITE.assetUrl()`でprofile URLを解決してからImageへ設定し、同じ解決済みURLを重複防止キーに使う。runtimeなしは相対pathへfallbackする。
- 回帰は公開site焦点テストへ統合し、new／legacy／runtimeなし、優先24件、idle／timeout、同一URL重複防止を確認。統合check `card-manager-preload-20260920-02` は成功、`localOnly=true`・`publishable=false`。
- 生成後ページを隔離ブラウザーで確認：new `http://127.0.0.1:8871/manager/?card=spell`、legacy `http://127.0.0.1:8872/trickcal-manager/stat-dashboard.html?card=spell`。両方で遺物／スペル切替、各95件のカード画像要求、カード404 0件、誤ったmanager/img path 0件。
- ローカル配信で別途`/favicon.ico`の404あり。カード画像ではなく今回の対象外。実装・焦点テストの編集前backupは `D:/Games/etc/trickcal/backups/card-manager-preload-404-20260920-112432`。
- source commit `22a78aab7cd0690c30407c59eb5a1314b1e09903`を対象限定でpushし、candidate `84f8cbb3aa3e3cdd`をnew／legacyへ通常承認後に公開済み。両profileのidentity一致を確認。公開記録は[`カード画像先読み404修正の公開履歴`](docs/history/card-manager-preload-404-publication-2026-09-20.md)。
- 記録commit `099fe6e750cbe6e35de3229ed824e8e46cab2089` を `release-source` へpush後、stash OID `ce8c8dc98464345ad401e16ce33af075d6ca1d5f`をpopせずapplyした。repo内xlsxはrepo外backupとSHA-256 `70C1B960D2D8A1AEE75200056DE739CFE13E7935EE741D3EF6078E5883CCF78C`で一致し、未commit変更として復元済み。stash・backupは保持する。復元確認も別のdocs-only記録commitでpush済み。サイトは再公開していない。

## Search Console状態（2026-09-20）

- 正式rootは `D:/Games/etc/trickcal/trickcal-manager`、通常branchは `release-source`。SEO canonical移行は先行source commit `4a251c56d2da54c8d14db7ac930144ca34d98b19` で統合・公開済み。
- Search Console確認ファイル `google4e94c2b3cb5b1c67.html` をnew専用manifest assetとして追加し、source commit `a30f74a3a6f011098cd7aaacce162e0220256579` を `release-source` へpushした。candidate `c92151ac342a7116` をdual公開し、new／legacy両run成功・identity一致。
- new URLはHTTP 200、リダイレクトなし、53 bytesで入力とSHA-256一致。legacy生成物にファイルはなく、legacy URLは404。sitemapには含めていない。
- 利用者報告ではSearch Consoleの所有権確認済みで、manager／calcの登録リクエストを送信済み。サイトマップ取得エラーは時間を置いて再確認待ち。今回の作業ではSearch Consoleへアクセス・操作していない。確認ファイルとnew専用manifest登録は削除せず保持する。
- 詳細なsource/artifact commit、bundle、receipt、run、確認証拠は[所有権確認ファイル公開履歴](docs/history/search-console-ownership-asset-publication-2026-09-20.md)。SEO canonicalの公開記録は[SEO公開履歴](docs/history/seo-canonical-migration-publication-2026-09-20.md)。未公開・保留案件は [`docs/BACKLOG.md`](docs/BACKLOG.md) を参照。

SEOローカル実装は[SEOローカル実装履歴](docs/history/seo-canonical-migration-local-2026-09-20.md)、作業場所一本化は[一本化・SEO引継ぎ](docs/source-worktree-unification-and-seo-handoff.md)と[移行履歴](docs/history/source-worktree-unification-2026-09-20.md)を参照。

## 履歴：移行前のGoal詳細（現在の作業指示ではない）

以下はrelease-sourceへ移る前のGoal記録である。内部の「最新」「現在」は各記録当時の表現であり、2026-09-20時点の作業状態や承認を表さない。未達・保留項目の現行所在は [`docs/BACKLOG.md`](docs/BACKLOG.md) を参照する。

### 最新：R1完了・外部承認待ちで停止（2026-09-14）

R1を完了した。未設置の`docs/templates/storage-p5b-source-delivery.yml`へ、`release_mode`（`initial`／`update`）、更新時の`previous_release_id`／`previous_release_json`、環境変数経由の入力検証、tmpへのcompact record materialize、更新時だけの明示的`--previous-release`を接続した。`tools/validate-public-site-release-input.js`は`status=published`、`dirty=false`、40桁sourceCommit、整合したdual-profile release、expected release IDを必須とし、local-only試作・欠落・JSON不正・別previousを生成前に拒否する。

`node tools/test-public-site-release-input.js`は終了コード0。専用tmpの実Git fixtureで、初回previousなし、更新の成功配信record入力、local-only record拒否、欠落／ID不一致拒否、同じsource＋previousからlocal出力とfresh checkout出力を生成し、Service Worker内容、`previousCacheVersion`、contentDigest、sourceCommit、candidateId、profile digestが一致することを確認した。既存delivery回帰の`node tools/test-public-site-delivery.js`も終了コード0で、source templateの入力接続を静的確認した。既存G1〜G3／P5aの成功証拠は再利用し、ブラウザ・保存・全画面・実GitHub配信は再実施していない。

R1は **1/1**。local実装・焦点検証の残件は0。現行実repo／releaseは引き続き`dirty`／`local-only-unpublished`であり、前回成功配信recordの実運用保管・実workflow設置・実配信・成果物repo／Pages／DNS／HTTPS・new Origin確認・旧案内ONは未承認／未実施である。R1の正確なcommit候補は[`storage-p5b-local-staging.md`](docs/templates/storage-p5b-local-staging.md)のR1表に固定し、実commit／push、外部設定、実配信、Goal有効化は行わずここで停止する。

### 最新：G4完了・承認待ちで停止（2026-09-14）

G4を完了した。`docs/templates/storage-p5b-local-staging.md`へ、現行dirty worktreeの機能単位別commit候補、今回以外の変更の除外・未確認、現行`.github/workflows/pages.yml`のmain push公開とcommit／push分離、new root／legacy rootと未設置workflow templateの差分案、承認後の操作順、tokenをチャットへ貼らない運用、初回公開と旧移行案内ONの別承認を記録した。

G1〜G4は **4/4**。local C-T2証拠は揃ったが、実repoの確定commit、成果物repo、外部token／権限、Pages／environment、DNS／CNAME／HTTPS、実workflow／実配信、new Origin確認、旧案内gateは未実施・未承認である。現行releaseはlocal-only／dirtyのまま。ここで停止し、利用者の承認事項（commit対象、成果物repo、外部設定／workflow範囲、初回公開・旧案内ON）を待つ。

### 最新：G3完了・G4着手（2026-09-14）

G3を完了した。G1の実Git fixtureとG2のcandidate→staging→delivery処理を再利用し、専用tmp内でsource A/Bの実Git commit、new／legacy staging、実Git dummy delivery repo、Pages artifact相当rootまで確認した。AからBで廃止した`old/index.html`だけを前回所有ledgerに基づき削除し、`CNAME`、`.github/workflows/pages.yml`、未知`keep.txt`を保持した。同じB candidateの再実行はwrite/delete 0、版不一致は変更なし、成功済みBへのworkspaceコピー失敗はdestination snapshot・ledger・Git HEAD／statusを維持した。newはroot、legacyは`trickcal-manager/`なしのrootとして抽出され、artifact相当rootにはledger所有ファイルと識別JSONだけを入れた。

`node tools/test-public-site-delivery.js`は終了コード0。workflow templateのinput/action/permission/needs、push未設定も同焦点testで確認した。これはC-T2のlocal evidenceであり、実GitHub Actions・Pages・DNS・HTTPS・実配信の合格ではない。G3は **1/1**。G4では既存手順templateを最終更新し、dirty実repoの確定commit候補・除外／未確認、受信repo／権限・Pages／DNS、初回公開・旧案内ONの承認範囲と順序を文書化して停止する。

### 最新：G2完了・G3着手（2026-09-14）

G2を完了した。`tools/transfer-public-site-artifact.js`を追加し、candidate record、staging report、release/build/checksを再照合してprofileごとのstaging file一覧・hash・outputDigest・Service Worker hashを確認する受渡し入口を実装した。既定はdry-runで、`--apply`時も一時workspaceで全ファイルをhash確認してから適用する。前回所有ledgerにない同名、手変更された所有ファイル、版不一致、symlink／保護範囲は変更前に拒否し、`.git`、`.github`、CNAME、未知ファイルを保持する。所有範囲は`.trickcal-public-site-delivery.json`へ、公開側の非機密識別情報は`public-site-deployment.json`へ分離し、後者はcandidateId/sourceCommit/profile/digestだけを含め、contentDigestへ再帰的に含めない。

`docs/templates/storage-p5b-source-delivery.yml`と`docs/templates/storage-p5b-pages-deploy.yml`を未設置templateとして追加した。source側はmanual `workflow_dispatch`、required candidate inputs、承認environment、対象repo限定Contents token、newだけの受渡しを定め、受信側は所有ファイルだけを`.pages-root`へ抽出してPages artifact化し、`needs`付き`deploy-pages`へ接続する。G3ではこの処理を専用tmpの実Git source／dummy delivery repoでnew／legacy、再実行、版不一致、所有ファイル整理、保護ファイル、途中コピー失敗まで確認する。

### 最新：G1完了・G2着手（2026-09-14）

G1を完了した。`tools/public-site-candidate.js`からHEAD／index／ignoreの独自解析fallbackを削除し、`git rev-parse HEAD`と`git status --porcelain --untracked-files=all`の両方が成功した場合だけGit状態をavailableとして返すようにした。Git実行失敗は`available:false`、`dirty:true`、短い`reason`を返し、candidate入口は理由付きで拒否する。staging側のcandidate再照合にも同じ失敗理由を記録する。

`tools/test-public-site-staging.js`のclean fixtureを親repo外の専用一時ディレクトリに移し、実`git init`→repo-local identity設定→`git add`→fixture commitで作成した。`node tools/test-public-site-staging.js`をsandbox外の検証環境で実行し、終了コード0。実Gitのclean candidate受理、`git add`済み未commit変更の拒否、`.git`を隠したGit実行失敗の拒否・candidate record未作成、既存C1/C2 staging境界・版不一致・生成後変更拒否を同じテストで確認した。通常sandboxではNodeからGit子プロセスが`EPERM`となるため、clean証拠はこの専用実行環境で取得し、成功を推定していない。変更JS 4本の`node --check`と`git diff --check`も成功した。

G1は **1/1**。fixture内のcommit以外に実repoのindex／commit／remoteは触れていない。G2では既存candidate／stagingを入力に、dry-run既定・専用tmpダミー配信repo限定の受渡しtool、new／legacy所有台帳とhash照合、保護ファイル・衝突・途中失敗停止、未設置workflowテンプレートを追加する。実workflow、実配信、外部設定、commit／push、移行案内ONは行わない。

### 最新：C2完了・P5b候補準備完了（2026-09-14）

C2を完了した。`tools/record-public-site-checks.js`は生成安定性、manifest、生成file／release hash、2 local Origin HTTP到達を実行し、4つの結果と`sourceCommit`、`contentDigest`、new／legacy `outputDigest`を`tmp/public-site-checks-c2.json`へ自動記録する。`tools/create-public-site-candidate.js`はclean Git HEAD、dirty=false、期待commit/digest、generated output、checks、profile別Service Worker hashを照合し、releaseの`local-only-unpublished`を手編集せず別candidate recordへ固定する。

`tools/prepare-public-site-staging.js --candidate --candidate-record ...`はcandidate record、現在のGit状態、release/build/profile台帳、再生成checkを再照合してnew／legacyを別rootへ抽出する。clean isolated Git fixtureではcandidate record作成とstaging受理を確認し、candidate後のgenerated app変更、checks欠落、期待outputDigest不一致を拒否した。実repoはdirtyのためCLIが終了コード2で停止し、candidate recordを作成していない。

C2は **1/1**。C1 **1/1**と合わせて候補準備を完了した。生成releaseはlocal-onlyのまま、P5bの外部repo／権限／token／Pages／DNS／HTTPS／公開承認、new Origin smoke test、旧側移行案内gate承認、P6実機確認が残る。実workflow・公開設定・実配信・commit／push・自動実行Goal有効化は行わず、ここで停止する。

### 最新：C1完了・C2着手（2026-09-14）

C1を完了した。`tools/prepare-public-site-staging.js`を、`tmp`自身・sourceと同じ／親／子になる`out`、tmp外へ解決されるpath、symlink／junction等のreparse point、既存の専用staging以外のrootを、削除・コピー前に拒否するよう補修した。release／build／manifest／checks入力が`out`配下になる場合も、読み取り・削除前に拒否する。既存の専用staging rootだけを再作成し、`new/`と`legacy/`以外の公開rootは生成しない。

checksは4つのtrueだけでなく、`sourceCommit`、`contentDigest`、`profiles.new`／`profiles.legacy`のoutputDigestを必須として対象releaseとの一致を確認する。不足・別digest・未知profileは候補不適合になる。`node tools/test-public-site-staging.js`は終了コード0で、正常専用staging、境界不正時の`rmSync`／`copyFileSync` 0回、out内入力の保持、checks欠落・別digest拒否を確認した。現行releaseのlocal-only／dirty拒否と1076 filesずつの抽出も維持した。

C1は **1/1**。C2では、検査コマンド自身がdigest付きchecksを生成する入口、clean isolated Git fixtureのcandidate record生成、candidate recordと現行HEAD／成果物の再照合、生成後変更の拒否を実装・検証した。

### 最新：U3完了・P5bローカル準備完了（2026-09-14）

U3を完了した。`tools/prepare-public-site-staging.js`を追加し、release／build台帳からnew／legacyを別rootへ抽出するdry-runを実装した。現行`tmp/public-site`について、dual-output contentDigest、new／legacy outputDigest、profile／base path、生成SW hash、expected sourceCommit、4種のcheck evidenceを照合し、`tmp/public-site-staging/new/`と`legacy/`へ各1076 filesを作成した。newへのlegacy混入、docs／tools／tmp等の禁止file、legacy baseの二重化はいずれも0件。legacy側は`trickcal-manager/`を一度だけ除いて旧Pages artifact rootの中身にした。

現行release `875b990b55018c14`は`contentDigest=3cd62b1bc1596be7b88b3f714db5f6f6933e95406dec65c9de517133b2935469`、profile output digestはnew `be85e7ddbae8722e`／legacy `3f56dd68eeafcb9f`で、構造検査とchecksは一致した。しかし`status=local-only-unpublished`、`dirty=true`のため、実staging reportは`candidateAccepted:false`、`--candidate`は終了コード2で停止した。local-only／dirtyを公開候補へ昇格させていない。

配信手順案を[`docs/templates/storage-p5b-local-staging.md`](docs/templates/storage-p5b-local-staging.md)へ記録した。new／legacyの受渡し、`.git`／`.github`／既存workflow非上書き、失敗時のlegacy案内OFF、保存データを戻さない停止／rollback、repo／権限／token登録／Pages／DNS／公開承認／移行gate承認を明記した。実workflow・外部設定・repo／token／Pages／DNS・実配信は行っていない。

U1〜U3は各 **1/1**。P5aは、旧レビューで保留した生成SWのrelease接続、source／最終hash記録、生成二release更新、生成transfer代表確認をローカル証拠で完了し、「local acceptance完了・公開可ではない」と再判定する。P5bはlocal staging・手順案・外部操作整理まで、P6は公開Origin／DNS／HTTPS／実機確認が残る。P4 H1／H2と元条件6/6は維持する。次は外部操作と明示承認が必要なため、ここで停止する。

### 最新：U2完了・U3着手（2026-09-14）

U2を完了した。`node tools/prepare-public-site-update.js`でmanifest登録入力1066件を隔離source rootへ複製し、old生成release `875b990b55018c14`を作成後、隔離`app-cache.js`を変更してnew生成release `3c26d70b3138d982`を作成した。newの`previousReleaseId`はoldと一致し、実ソース・ゲーム生成データ・canonical `tmp/public-site`はこのfixture変更で編集していない。

一時HTTP serverはold／newの静的生成root全体を切り替えた。同一Originの旧manager tabでURL維持、`waiting:true`／`installed`、自動reloadなしを確認し、閉じて再起動した新tabで`waiting:false`／`activated`、old／new profile cacheと`u2-unrelated-cache-sentinel`保持を確認した。生成`/calc/index.html?u2=query#keep`は`/calc/?u2=query#keep`へ正規化し、canonicalはループせず、未知URLは404でmanagerへ転送しない。

既存native runnerに生成root／path指定を追加し、old生成legacy profileからnew生成profileへの2 Origin transferを実行した。`tmp/storage-transfer-native-1789312302904.json`は`ok:true`で、実クリック、preview／plan無書込み、受信側backup、明示apply、非空状態・保存計算一致、無関係キー保持、同一packageのdownload／file input復元、再起動後読込みを確認した。`test-public-site`、生成check、validate、HTTP、storage transfer/page、変更JS構文、`git diff --check`も成功した。

U2の残条件は0とし、U3ではprofile台帳からnew／legacyを別staging rootへ抽出するdry-run、clean／dirty・digest照合、workflow案・停止／rollback・外部操作／承認一覧を文書化する。U3はP5bのローカル準備だけで、実repo作成、token／Pages／DNS／外部設定、実workflow変更・実配信、公開gate変更、commit／push、自動実行Goal有効化は行わない。

### 最新：U1完了・U2着手（2026-09-13）

U1の対象をgenerator、Service Worker、焦点テスト、記録へ限定して実施した。manifestと生成planのsource hashから`releaseInputVersion`／`releaseInputDigest`／安定`releaseId`／`sourceVersions`を作り、生成SWへcurrent release IDを注入した。前回検査済みreleaseは通常出力から自動参照でき、`--previous-release`で明示もできる。初回はpreviousなし、同一入力は前回recordのpreviousを再利用して再生成を安定化した。profile別release台帳には実SW出力path、current／previous cache、最終SW sha256を記録した。`/calc/index.html`等はcanonicalへ一段だけpathname正規化し、query/hashを保持する。

`node tools/test-public-site.js`、`node tools/generate-public-site.js --check`、`node tools/validate-public-site.js`、`node tools/test-public-site-http.js`、変更JSの`node --check`、`git diff --check`は成功した。現行`tmp/public-site`は2154 files、`releaseId=f8b4ffab9b2119b1`、`previousRelease=null`、`status=local-only-unpublished`、`dirty=true`、content digest `b6ff36585ad9c0a1d06dc3589ca55314c5de4cfe8fc791798784966c1be759e9`。焦点テストは隔離fixtureでapp asset変更→release／SW変更、previous cache接続、最終hash一致、同一入力安定性を確認した。

storage基準テストは既存P5aで削除済みの`CACHE_PREFIX`を要求する検査で停止したため、保存コード・codecへは変更していない。U2ではgeneratorで実際に二releaseを生成し、同一独立local Originのwaiting／再起動／cache保持、生成index aliasの実query/hash、new／legacy生成物の非空fixture直接転送と同一package file復元を確認する。U3のlocal staging準備と配信手順案はU2後に行う。P5a／P5b／P6への加算は各合格条件の証拠取得後に更新し、実配信・外部設定・公開gate・commit／push・自動実行Goal有効化は行わない。

### 最新：P5a-3完了・P5a完了（2026-09-13）

P5a-3の実装後代表検証を実施した。新profileを `http://[::1]:8765/`、旧profileを `http://[::1]:8766/trickcal-manager/` として、生成済み `tmp/public-site` を別Originで配信した。`node tools/test-public-site-http.js` はmanifest登録の2164 route／asset、2 local Origin、静的参照、alias、Service Worker gateを終了コード0で確認した。`node tools/test-public-site.js`、生成 `--check`、`node tools/validate-public-site.js`、共有資材 `--check`、`node tools/test-formation-share-image.js` も成功した。

- 新／旧のmanagerは起動し、profileごとの相互リンクと動的画像を確認した。新側の画像は `/img/Chara/Amelia.webp?v=0a46ac2432a434c0`、旧側は `/trickcal-manager/img/Chara/Amelia.webp?v=0a46ac2432a434c0` へ解決した。
- `/calc/` は通常ダメージ `11`、DPSタブは再計算完了後に全体期待DPS `6` と行動別内訳を表示した。`/data/enemies/` は21/21件とリリ一の敵ステータスを表示し、`/data/boards/?apostle=Amelia&zoom=120` はアメリア選択・`120%`を保持した。fixtureの無効な `10001` は実ID `Amelia` に修正した。
- 同じ `1.z` share payload（先頭 `C3EODm...`）を新／旧で表示し、両Origin・両テーマで `共有画像を作成しました（1200×886px）。` と保存ボタン有効化を確認した。
- `/data/` はPC幅で一覧と全導線を表示した。Browser skillのviewport capabilityを対象タブ選択後に `390x844` へ適用し、実ページで `innerWidth/clientWidth/bodyWidth=390`、`innerHeight=844`、見出しと全導線を取得した。mobile幅を確認済みとして扱う。さらに一時SW確認サーバーで同一Originの旧SWを開いたまま新版へ切り替え、`waiting:true`／`waitingState:"installed"`、URL維持・`navigationType:"navigate"`を2.5秒後にも確認した。旧タブを閉じて再起動すると`waiting:false`／`activeState:"activated"`、cache `trickcal-manager-new-root-20260913-p5a2-2`を確認した。別Originで作成した`unrelated-cache-sentinel`も新版activate後に保持された。
- 生成 `/transfer/` は初期の安全な状態と「新サイトの現在データを保存」操作（194107 bytes）を確認した。ファイル復元／正常転送は既存H2の `tmp/storage-transfer-native-1789286377160.json`（`ok:true`、`fileTransfer.inputObserved/restored:true`）を再利用した。別途、生成managerを温めてlocal HTTP server停止後に新旧managerを新規tabで再読込みでき、transferの一意queryは `ERR_CONNECTION_REFUSED` となることを確認した。
- `README.md` と `AGENTS.md` にmanifest、生成・検査、2 Origin、未公開release、停止／rollback境界を追記した。最新releaseは `status: local-only-unpublished`、`dirty:true`、content digest `e9058bb962a71a5d29199fa72d3f76439df929d0283d041048d1485eef478ff9`、共通assetVersion `0a46ac2432a434c0`、new／legacy routeVersion `72ca28473781bbd6`／`3bbb03733ce5cea0` である。

P5a-3はHTTP、主要画面、共有PNG、transfer入口、mobile実効幅、offline代表、Service Workerのwaiting／restart更新まで実施済みである。P5a全体は **4/4（F0、P5a-1、P5a-2、P5a-3）**、P5a-3は **達成** とする。P5b（実配信準備・外部設定）とP6（公開Origin・実機）は未着手で、別Goalで外部権限・承認を確認してから見積もる。

本単位ではP5b／P6、実配信、外部設定、公開gate変更、commit／push、自動実行Goal有効化へ進まない。

### 最新：P5a-2完了・P5a-3着手（2026-09-13）

P5a-2を完了した。単一manifestから生成した新／旧profileのHTMLについて、生成時のroute／asset参照変換、`public-site-runtime.js`の`pageUrl`／`peerPageUrl`／`assetUrl`、共有iframe・DPS worker・board画像・app-cacheを接続した。新規共有URLは`/share/#payload`のままとし、公開URLへ`v` queryを付けない。Service Workerはprofile別scope／cache、待機型更新、既知navigationのnetwork-first、transfer／recovery非cache、所有cacheだけの管理へ接続した。

`node tools/test-public-site.js`、`node tools/sync-formation-share-assets.js --check`、共有・storage回帰、変更JSの`node --check`、`node tools/generate-public-site.js --check`、`node tools/validate-public-site.js`は終了コード0。最終生成は`tmp/public-site` 2154 files、content digest `28ad0cd1e7118710688557ba1286be498fb39fdc0202d5cd7bd23832b83bdc40`。`public-site-release.json`は`local-only-unpublished`、sourceCommit `e22f99d7a1c39eb093430944fb2e9314a0097215`、`dirty:true`である。

P5a-2の残作業は0。P5a-3ではHTTP全入口・静的資材、manager／calc／worker、敵preset、board、同一共有payloadの新旧表示と両テーマPNG、data一覧のPC／スマホ幅、生成transferの正常／file経路、Service Worker待機／再起動／offline代表を確認する。P5b実配信、外部設定、P6の公開Origin／実機確認、commit/push、自動実行Goal有効化は対象外とする。

### 最新：F0完了・P5a-1着手（2026-09-13）

F0-1を完了した。不正ファイルBの実選択時に旧Aのpackage／preview／planを消去し、読込み成功まで復元操作を無効化する。修正前反例は同じpage controller／codec／runtime経路で失敗し、修正後に終了コード0へ反転した。次は単一manifestから旧base／新baseの入口を生成・検査するP5a-1へ進む。

### 最新：P5a-1完了・P5a-2着手（2026-09-13）

P5a-1を完了した。`tools/public-route-manifest.json`とschemaを追加し、旧`/trickcal-manager/`と新`/`のprofile、`/manager/`、`/calc/`、`/share/`、`/data/`、敵・ボード、`/transfer/`、独立`/recovery/`を単一の生成計画へ束ねた。`node tools/test-public-site.js`は未知フィールド、source／generator排他、route／alias／target自己参照、reserved／出力衝突、index aliasの二重出力防止、明示assetsのみの出力を検査して終了コード0。`node tools/generate-public-site.js --write`で`tmp/public-site`を2151ファイル、digest `3210654ca0e34c2f94cf28ba0428dfb6af4d7c576c680d83fe554fd4532bdd91`として生成した。

P5a-1の残作業は0。次は生成物内のリンク・画像・worker・iframeを`pageUrl`／`assetUrl`へ接続し、cache／release record／transfer・recovery除外を同じローカル生成経路へ組み込むP5a-2へ進む。P5a-3のHTTP・画面・Service Worker確認は未着手で、P5b/P6へは加算しない。

### 最新：P4 F1完了・P4再判定／P5a開始可（停止）（2026-09-13）

`storage-p4-file-switch-fix.md`のF1を完了した。実ファイル選択時に直接転送receiverとmessage listenerを切り離し、旧senderへ`file-switch` REJECTを送る。Aの遅延payload／decode完了は世代検査で破棄し、apply通知は適用package digestと現行direct receiverの一致時だけ送る。

`node tools/test-storage-transfer-page.js`で、修正前モデルは`pre-fix complete/RESULT=1`、修正後は同じdirect fixtureで`fixed rejected/RESULT=0/B-apply`を確認した。listener解放、ファイル取消時のdirect維持、遅延Aの不干渉、Bのみのplan/applyをassertした。H1/H2の既存証拠は再利用し、F1のnative証拠へは繰り上げていない。F1は1/1、P4は6/6。P5aは開始可だが、本GoalではP5実装・公開設定変更・commit/push・自動実行Goal有効化へ進まず停止する。

### 最新：P4 H2完了・P5a開始可（停止）（2026-09-13）

H1a〜dを4/4、H2を1/1で完了した。現行native runnerを独立profile・localhost 2 Originで実行し、非空slot/currentの育成・編成・保存計算比較、実クリック、preview→plan→明示restore、受信側適用前backup、送信時固定packageのdownloadとdigest一致、file input往復、新規tab読込みを確認した。要約はtmp/storage-transfer-native-1789286377160.jsonに保存した。旧P4 B-T4a〜fは6/6へ再判定済み。P5aは開始可だが本作業では開始せず、P5実装、公開設定変更、datasheet・生成物・計算式、commit/push、自動実行Goal有効化は行わない。

### 最新：P4 H1完了・H2実施前（2026-09-13）

H1a〜dの限定補修を完了し、制御証拠を取得した。管理画面の直接転送は既定OFF、timeout/reject後の適用開始前cleanupと明示retry、適用中のcancel/file/decode拒否、受信側の現在データbackup、送信時固定packageの同一JSON保存を実装した。変更JS構文、transfer/page、backup、restore、runtime、behavior baseline、差分検査は成功している。H1は4/4、H2は0/1で、実2 Originのnative確認は未実施。次は現行tools/storage-transfer-native-check.jsを一度実行し、終了後にP4再判定とP5a開始可否だけを報告して停止する。P5実装、公開設定、datasheet・生成物・計算式、commit/push、自動実行Goal有効化は行わない。

### 最新：P4 T3合格・P5設計確認へ（2026-09-13）

P4 T3のB-T4e,fを完了し、P4のB-T4a〜fを6/6として確定した。`tools/storage-transfer-native-check.js`は専用一時profile・専用download先・localhost 2 Originで、statの実転送クリック、受信側preview→plan→明示apply、receipt、送信元不変、受信先のslot／保存計算／無関係キー保持、実download/file input、target再起動後の保存読込みまで確認する。制御テストとnative結果は分離して記録し、T3中に判明した初期化スコープ、message listener、重複READY、epoch受渡し、baseline時点の問題も補修済み。P5は実装せず、設計残件の確認後に停止する。公開Origin・モバイル実機・P5a以降・公開設定・commit/push・自動実行Goal有効化は未実施。

### 最新：P5入口方針確定（2026-09-13）

`/`は当面`/manager/`への静的転送、`/data/`は敵・ボードへの一覧ページとして確定した。data一覧は保存機能を持たず、他の主要ページと同じ上部バー構造・主要導線を維持する。将来の`/`ポータル化はhomeの同一論理ID・URLを保ったまま差し替える。P5aのmanifest・生成・互換入口・資材／Service Worker接続は別Goalで開始する。

### 最新：P4 T2合格・T3 native確認へ（2026-09-13）

P4 T2のB-T4c,dを2/2達成した。`storage-transfer.html`／`storage-transfer-page.js`は受信packageを既存codecで検証し、preview→明示plan→明示applyだけを既存runtimeへ接続する。`stat-prototype.js`にはクリック中の受信タブ起動と採取後maintenance解放を追加した。制御テストでreceipt、取消、ファイル代替、確認前applyなしを確認済み。次はT3の独立ブラウザ実HTTP 2 Origin確認で、合格後にP5設計確認だけを行う。P5実装・公開設定・commit/push・自動実行Goal有効化は未実施。

### 最新：P4 T1合格・T2実装へ（2026-09-13）

G0 3/3に続き、P4 T1のB-T4a,bを2/2達成した。`storage-transfer.js`で固定Origin／Window／nonce／transferId／digest／段階を検査し、receiptを実保存完了後だけ成立させる。`tools/test-storage-transfer.js`で異Origin・偽source・異digest・ACK欠落・重複・実保存前成功・receipt不一致を確認した。次はT2の送受信UIと既存codec→preview→plan→apply接続へ進み、T2合格後だけT3へ進む。P5・公開設定・commit/push・自動実行Goal有効化は未実施。

### 最新：G0合格・P4 T1実装へ（2026-09-13）

`docs/storage-p4-luna-instructions.md`のG0を完了した。G0-1はcodecの危険キー・深度・ノード数・dataset外形検査を補助除外より前へ固定し、combined反例を拒否。G0-2は`stat-prototype.js`本番preview/prepare/apply関数を隔離VMで実行し、拒否・rollback後再表示・同意リセット・明示同意後再適用を確認。G0-3は実apply raw→新VM本番loaderの共通一致assertと保存／読込み省略反例を確認した。達成条件はG0 3/3。次はP4 T1の転送プロトコル・receiptへ進み、T1合格後だけT2へ進む。P5、公開設定、commit/push、自動実行Goal有効化はこのGoalの停止条件として未実施。

### 最新：Luna向けG0→P4指示・開始待ち（2026-09-13）

[次回指示](docs/storage-p4-luna-instructions.md)を実施順の正とする。危険キーが補助除外で検査を通過する反例と残る動作証拠をG0で補修し、合格後T1→T2→T3へ進む。旧R1〜R5 5/5の無条件継承はしない。T3後はP5設計確認を報告して停止。今回実装・自動実行Goalは開始していない。

### 最新：重大修正R1〜R5完了・P4開始判断で停止（2026-09-13）

[重大修正再レビュー](docs/storage-critical-fixes-review-20260913.md)のR1〜R5を限定補修した。旧savedStatesの欠落は明示拒否、loaderで失われる日時は事前拒否、ファイル内補助設定はdigestを保持した明示除外、rollback後previewは再表示、実apply後raw→新context本番loaderは3件全比較まで確認。R1〜R5は5/5、C2は1/1へ再判定可能。P4へ進む判断材料は整ったが、今回のGoalはここで停止し、P4/P5、native追加確認、commit/push、自動実行Goal有効化は行わない。詳細な証拠と未検証はSTATUSと受入台帳を正とする。

### 最新：URL名称確定・将来構成の概略（2026-09-13）

主要URLを`/manager/`と`/calc/`に確定し、URL台帳・Gate C補足・配信契約を同期した。[将来設計・P5/P6概略](docs/public-site-future-plan.md)にトップページ化、互換維持、公開物生成から配信・実機確認までを記録。home/dataの方式は推奨案のまま個別確定待ち。重大修正レビューの残条件は維持し、今回実装・自動実行Goal開始は行わない。

### 最新：重大修正の再レビュー・URL設計更新（2026-09-13）

[再レビュー](docs/storage-critical-fixes-review-20260913.md)で旧保存枠の採取欠落、日時のloader不一致、入力ファイルの補助除外・再試行・証拠接続の不足を確認。以下のC1〜C3 3/3完了とP4開始可の判定は現在の判断に使わない。C2を未達として限定補修後に再判定する。今回は文書更新と隔離診断のみで、自動実行Goalを再開していない。

URLは[公開URL台帳](docs/public-url-design.md)と[Gate C補足](docs/public-url-gate-c-design.md)へ利用者の第一候補を反映。`/`転送方式と`/data/`一覧有無は選択待ち。

### 最新：重大修正Goal C1〜C3完了・停止（2026-09-13）

[修正限定Goal](docs/storage-critical-fixes-goal.md)のC1〜C3を実施し、固定条件3/3と変更影響範囲の回帰を確認した。C1は復元後sessionの再構成、C2はcanonical backup/restoreと保存計算結果の全件保護（補助設定の明示除外を含む）、C3は通常bootに依存しない独立救出を対象とした。制御テストは成功し、nativeは独立profile・localhostでC3救出ダウンロードの個別成功を確認した。

全runnerの終了コード1はfocus/visibility、stat確認、lifecycleの前面状態・タイミング依存の結果として分離記録し、同じtimeoutは反復していない。P4のT1〜T3、追加のnative検証、datasheet・生成物・公開設定、commit/push、自動実行Goal有効化は今回の範囲外で未実施。次はP4を開始する場合だけ別途着手する。

### 最新：重大修正C1〜C3のみ設定・開始待ち（2026-09-13）

[修正限定Goal](docs/storage-critical-fixes-goal.md)を今回の範囲・完了条件・停止条件の正とする。C1復元後起動→C2育成/編成/保存計算保護→C3独立救出の順。3条件合格後に結果を報告して停止し、P4のT1〜T3へは進まない。以下の「修正後にP4まで実装」は今回の許可範囲ではない。文書設定のみで、実装・自動実行Goalは未開始。

### 最新：重大修正＋P4設計済み・実装待ち（2026-09-13）

[重大修正とP4転送設計](docs/storage-p4-transfer-design.md)を最新の実施優先度とする。育成・編成・保存計算結果、起動・失敗保護・救出を必須とし、軽微な計算/DPS設定の完全再現は延期可能。次の実装順はC1→C2→C3合格後にT1→T2→T3。P3完了を再宣言せず、P4の設計のみ先行した。今回は文書更新のみ、自動実行Goalは有効化していない。

### 最新：P3完了判定撤回・修正設計で停止（2026-09-13）

[P3レビュー・修正設計](docs/storage-p3-review-20260913.md)を現在の残条件とする。復元後の新規session起動、Gate B形式と再構成、未知版拒否、起動不能時の救出に問題が残るため、以下のP3完了記録は履歴としてのみ扱う。次はQ1→Q2→Q3を修正・再判定してからP4設計。今回はレビューと文書更新のみで、実装や自動実行Goal有効化は行わない。

### 最新：P3/R4-3完了（2026-09-13）

[P3実施指示と完了条件](docs/storage-p3-luna-goal.md)に沿ってR4-3を検証した。各restore失敗境界、制御quota・journal上限、救出形式、実UIのbackup/restore/apply/reload、実ブラウザquota安全停止、2タブLock、DPS再読込、boot guardを確認した。nativeの`storageAppLifecycle`は最新runでtimeoutだったが、既存成功runの実アプリlifecycle証拠を別に再利用している。R4-3固定6条件を達成し、P3を完了として停止する。P4以降・commit/push・自動実行Goal有効化へは進まない。

### 最新：P3 Luna Goal実施中・R1/R2/R3合格、R4-1/R4-2完了

[実施指示と完了条件](docs/storage-p3-luna-goal.md)を最新の進行方針とする。P2完了判定はレビューで撤回したまま、R1の4件修正、R2のP2再判定、R3のバックアップcodec・確認UI・容量実測、R4-1の復元transaction制御層、R4-2のrestore確認UI・独立復旧入口を完了した。次はR4-3のquota/救出/native代表確認を実施する。quota、救出、native復元、公開Origin確認が未完了のため、P3全体完了とは扱わない。今回はP4以降、datasheet・生成物・公開設定、commit/push、自動実行Goal有効化を行わない。

### 最新：G3接続・P2受入条件確認済み（2026-09-13）

設定済みGoalのG1→G2→G3を実施した。G2は7/7達成し、G3ではstorage-registry/runtime/bootstrapを既存の管理・計算/DPS・表示/読取画面へ接続した。基準テスト、behavior baseline、runtime、inspection、変更JSの構文確認が成功し、nativeでstat／DPS／2タブLockを確認した。

追加した実アプリlifecycle検査でhidden／visible、hidden中busy、pagehide後のshared解放、pageshow後の再bootを確認し、未知journalのboot guardも`recovery-required`・error画面・journal保持まで確認した。fixtureのfocus/visibilityはrunにより不安定だが、別runで成功証拠があり、実アプリlifecycleのnative証拠とは分離して記録済み。G3のP2受入条件は確認済みだが、A-T4/P3以降のjournal transaction・完全backup・Origin転送・スマホ実機は対象外として残す。datasheet、生成物、公開設定、commit/push、自動実行Goal有効化は行わない。

### 最新：G2合格、G3開始（2026-09-13）

G2（P2前半・保存共通層）は7/7達成。`storage-registry.js`／`storage-runtime.js`と焦点テストで、19キー照合、構造化Result、boot/epoch/journal guard、同期API、shared/exclusive、participant、互換・失敗境界を確認した。次は[docs/storage-p2-luna-goal.md](docs/storage-p2-luna-goal.md)のG3として既存writer/consumer接続とnative P2確認へ進む。既存アプリwriter、datasheet、生成物、公開設定、P3 backup/restore、commit/pushはまだ変更していない。

### 最新：Luna連続実装Goal設定済み・実行待ち

[P1b残件→P2完了のGoalと開始指示](docs/storage-p2-luna-goal.md)を次回実施範囲の正とする。LunaはG1合格後にG2→G3へ続行でき、旧P2禁止はこの範囲で置き換える。今回は文書設定のみで自動実行Goalの有効化・実装はしない。P3以降・commit/push・公開設定変更は禁止。技術契約と元必須条件は維持する。

以下は設定前の実績・履歴。進行許可は上記を優先し、達成数は次回に証拠を照合して判断する。

### 最新更新：G1合格、G2着手可能

G1（P1b残件解消）は補正後の検証器で合格した。次は[docs/storage-p2-luna-goal.md](docs/storage-p2-luna-goal.md)のG2保存共通層へ進み、G2合格後にG3既存画面接続へ続行する。P3以降・公開・commit/pushは引き続き対象外。最新の達成判定はSTATUSと受入台帳のG1記録を正とする。

2026-09-13更新：P0の実装仕様を作成した。[保存契約A](docs/storage-contract.md)、[バックアップ形式B](docs/storage-backup-format.md)、[配信契約C](docs/storage-release-contract.md)を共有仕様の正とする。設計項目A1〜A3/B1〜B2/Cの6項目を文書化、B3は入力上限を決定したが全設定・実保存50件の容量実測が残るため部分達成。P0を全条件検証済みとは扱わない。

P1a（L1〜L3）は3/3達成。P1bの制御側は、実importの`saveState→flushPendingStateSave→persistState`、workspace/live/legacy分岐、対象slot revision・通知・保存順・他領域不変、DPS対象別設定の実`loadDpsSettingsStore`再起動復元、各保存／読込省略反例まで確認した。native代表確認ではfixture 5/5、本番DPS起動・Momo→Sylla→Momo・再読込復元、stat保存・draft・export・file input・import先表示まで成功したが、stat slot2適用完了はnative阻害として残る。固定41条件は今回も達成31、部分8、未検証0、阻害2。P2実装には進まず、残るnative import証拠とGate A/B判断材料を保持する。今回アプリ保存コード・公開設定・datasheet・生成物・commit/push・自動実行Goalは変更していない。

以下はP1a開始前の履歴（P0未着手・仕様未作成を含む）。現在の作業状態には使用しない。

実装担当は基本Luna。P0の共有設計はAstra/Solが独立して進め、契約確定後に本体実装をLunaへ渡す。P1bの制御補修とnative代表確認は完了記録を分離し、stat importのnative完了証拠が残条件である。P1b完了を本体保存実装の許可やP0完了とは扱わず、今回の設定ではP2実装・自動実行Goalを開始していない。

進行計画の正は[実装・公開までの再計画](docs/storage-migration-delivery-plan.md)。目的は既存データを保護した完全バックアップ・復元と新ドメインへの移行。P0の保存API・排他・復旧・バックアップ形式・公開構成は設計済み。P1bの変更前基準は制御側を補完し、本番代表nativeはstat import完了だけを残した。残条件を解消後、P2保存共通層→P3バックアップ/復元→P4転送、別単位のP5配信→P6公開確認へ進める。

今回完了したのは再計画文書。P0は未着手、技術契約・実装・公開許可は未確定。N1〜N3完全合格と25/41は再レビューで不足が判明したため進行根拠にしない。旧41条件と証拠は保持し、実施時期は再計画の対応表に従う。自動実行Goalを有効化しない。

以下は再計画前の記録。完了判定・実施順・残見積もりは上記を優先する。

今回の実施は[S1土台修正設計](docs/storage-s1-foundation-plan.md)のN1→N3まで完了。N1で全検査入口を一本化し、N2でbindingに基づくstorage/helper参照漏れを拒否し、N3で実`persistState`・共通ログ・実`init`イベント登録から保存までの制御テストを整備した。終了後はレビューへ渡して停止する。S1の元必須条件は維持し、native検証・その他BEH残条件は別途保持する。固定41条件は旧25/41を使わず、N3後の証拠から再集計する。S2、commit/push、自動実行Goal有効化は行わない。

以下の段落は土台修正設計前の旧記録で、達成判定・実施順・残り見積もりには使用しない。

最新の制御方針: [S1再計画・実装指示](docs/storage-s1-closure-instructions.md)と[S1受入台帳](docs/storage-s1-acceptance.md)を正として未達条件を閉じる。過去の達成数やfocus/visibilityのみという判定は撤回済み。N1→N3の土台修正を完了し、実persistStateの失敗境界・保存順・通知を共通ログで固定したが、native検証・その他BEH残条件は完了扱いにしない。固定41条件の再集計は受入台帳に記録し、S1未完了のままGate A/B判断材料と残条件をレビューへ渡して停止する。S2・commit/push・公開・自動実行Goal有効化には進まない。

以下2段落のS1完了は再レビュー前の実施記録であり、現在の判定には用いない。

レビュー後のS1補完を完了。[S1補完設計](docs/storage-s1-followup-design.md)に沿って、19キーの失敗経路台帳、台帳一覧から独立した本番storageアクセス検出、既存コードを使う正常／失敗／再読込／競合の基準テストを整備した。アプリ本体の保存動作は変更していない。実ブラウザ固有の同期・quota・Origin間転送は未検証としてA/B以降へ引き渡す。

保存保守と新ドメイン移行の実装ロードマップを策定した。[保存保守・移行ロードマップ](docs/storage-migration-roadmap.md)を次の作業計画の正とする。正式Originはhttps://trickcal.irlab.devに確定。[公開URL設計](docs/public-url-design.md)を追加し、S5aのURL整理とS5bの配信に分割したLuna担当7実装スライス、およびAstraまたはSol担当の設計ゲートA/B/Cで進める。S1補完まで完了、詳細契約未確定、アプリの保存実装0%。次はA/Bの設計ゲート確定。今回は自動実行Goalの有効化・保存実装・公開は行わない。

以下は直前の完了作業。

「編成共有の追加更新工程を整備する」のAstra設計に沿ったLuna実装を完了。第1〜第4スライスを完了し、残り0。目的は通常のデータ追加を共有URL／PNGへ反映し、公開前に追加漏れと互換性破壊を検出すること。

設計判断は[保守設計・Astra確定事項](docs/formation-share-maintenance-design.md#astra確定事項lunaの実装契約)、実装の完了条件と4スライスは[Luna向け実装Goal](docs/formation-share-maintenance-goal.md)を正とする。設計100%、第1〜第4スライス実装100%、Goal全体100%、残り0スライス。自動実行Goalは完了。

## 完了済み：編成画像＋URLの共有

Luna向けGoal「編成画像＋URLの共有」は、現行スコープで完了。GitHub Pages運用を維持し、同じ編成のPNG画像と既存共有URLを個別に用意できる状態にした。

設計・完了条件・3スライスの実施内容は[編成画像＋URL共有 実装Goal](docs/formation-share-image-goal.md)を正とする。URL格納形式は既存v1を変更しない。

現行の完了条件は、C1：画像とURLの同一性、C2：判読できるPNG、C3：保存・画像コピー・URLコピー、C5：非同期処理と失敗時の安全性、C6：回帰・文書更新。ネイティブの「画像＋URLを共有」操作は現行UIから一時凍結し、個別操作で代替できる形を採用した。実装・ローカルHTTP／Chrome検証・STATUS更新まで完了。実機での受信とDiscordへの実投稿は後続の任意確認として残す。

上記実装は`e22f99d`としてpush済み。今回の保守設計は未コミット。以下は完了済みの過去Goalであり、そのPNG対象外という記述は当時の範囲に限る。

## 完了したGoal：編成共有URL v1の製品化

### 目的・設計の正

編成画面の作業中編成を、GitHub Pages上の自己完結URLとしてコピーし、別の保存環境で同じ編成・育成状態を閲覧できるようにする。[格納仕様v1](docs/formation-share-url-format.md)を唯一の形式仕様・接続設計として使う。旧設計書は視覚参照と履歴、旧計測ハーネスは比較資料であり製品codecではない。

共有対象は配置、使徒ID・★・A段階、遺物・スペルID・★・はんだ・枚数、権能、任意表示の全体%補正。Lv・Rank・ALv・SLv・タイトル・ステージ/敵ID・共有メモは除外する。

### 完了条件

1. 種別別永続IDと表示マスターv1を固定し、追加・旧版保持の手順を記録する。最新マスターへの暗黙置換を行わない。
2. ブラウザとNodeで同じ製品codecが動作し、固定スナップショットの意味を保って往復できる。既知バイト列・CRCの独立した期待値、固定URLを検証する。圧縮依存の版・設定・ライセンス・配布容量を記録する。
3. 不明値と0/対象外を区別し、未知版・範囲外ID・予約値・参照外・過長varint・破損・末尾余剰・過大入力・過大展開を拒否する。格納仕様の受入ケースを実施し未検証を成功扱いしない。
4. 作業中状態の選択側から同時点の編成・育成を抽出し、全体%補正を重複加算せず固定する。欠損を既定値へ勝手に補完せず、保存状態を書き換えない。除外対象がURL・描画に含まれないことを確認する。
5. 編成画面の共有プレビュー、全体%補正ON/OFF、更新、URLコピー、コピー失敗時の手動取得、文字数表示、読み取り専用受信ページが動く。受信エラー時にサンプルや閲覧者の保存値を表示しない。
6. 既存試作の視覚構造を継承し、360/390/430/1280px・両テーマで配置、★・A段階・はんだ・枚数・全権能・全体補正が判読できる。空き・未知・欠落画像・多数スペルを確認する。権能コストは件数分加算する。
7. 本番辞書・製品codecで代表入力のURL全体長を再計測し、異なる保存状態のブラウザ間でコピーしたリンクを開いて一致を確認する。既存の編成保存・育成・計算の関連回帰、キャッシュ更新、仕様・STATUS更新まで完了する。

### スライス

| スライス | 実施内容 | 完了条件 |
| --- | --- | --- |
| 1 | 固定辞書・表示マスター、同梱圧縮、製品codec、独立期待値と境界テスト、URL長再計測 | 1〜3・7 |
| 2 | 保存モデルからの抽出、全体補正取得、共有描画と受信ページ、旧試作との比較 | 4・6 |
| 3 | 編成画面の共有操作・コピー・更新、端末幅と別保存環境の検証、回帰・文書整理 | 5〜7 |

開始前に次のスライスと対応完了条件を宣言し、終了時にSTATUSへ達成度・根拠・残り見積もりを記載する。見積もり3スライス。3スライス連続で達成度がほぼ増えなければ再計画を提示する。実装経路上で予想外の保存モデル差を見つけたら該当条件を明示して設計へ反映する。

### 範囲・停止条件

PNG出力、取り込み、サーバー、短縮サービス、SNS専用プレビュー、Discordへの実投稿、公開・commit・pushは対象外。PNGは後続要件として保持する。未コミット変更を維持し、datasheetを直接編集・再生成しない。ブラウザ機能の選定・通常の実装判断は設計条件内で進めてよい。現行データが形式の値域・精度に収まらない場合は丸めず公開前に仕様を見直す。

第1スライス完了。formation-share-catalog.jsに固定辞書、formation-share-codec.jsに同梱codec、tools/test-formation-share-codec.jsに境界・CRC・Node zlib互換の検証を固定した。空編成20文字、代表編成82文字、全要素の上限寄り編成307文字（payloadのみ）を本仕様で実測した。固定ベースURL（https://example.test/app/formation-share.html）を含む全体長は70/132/357文字だった。

第2スライス完了。stat-prototype.jsの作業中formation/appStateから共有対象だけを同時点で抽出するAPIを追加し、全体%補正を一度だけ取得するようにした。formation-share.htmlとformation-share.jsはfragmentのみを復元し、保存値・サンプルへフォールバックしない。stat-dashboard.htmlの共有モーダルからプレビュー、全体%補正ON/OFF、更新、URL文字数、コピー／手動コピーを接続した。390px・1024pxの実画面で確認済み。

第3スライス完了。編成画面から生成したURLを受信ページで復元し、360/430/1280pxで横はみ出しなし、ライト／ダークテーマ、サンプル・除外項目の非表示を確認した。共有codec、DPS関連回帰、構文、差分空白の確認を完了し、カードマスターのブラウザ公開はNode検証環境と両立する形へ修正した。仕様書・STATUSを現行実装に更新した。PNG出力、取り込み、公開・commit・pushは後続範囲。

## 過去の状態・Goal2記録

最新追記：任意タイトルも除外。タイトル用ステージID・敵ID・文字列・フラグを格納仕様v1から削除した。以下の任意タイトル付き対象定義は旧記録として扱う。

2026-09-10追記：ALv・SLvを共有対象から除外した[格納仕様v1](docs/formation-share-url-format.md)の設計を完了。実装開始指示待ち。下記Goal2の完了記録にはレビュー訂正がある。辞書参照外拒否・過大展開の境界検証は完了しておらず、461文字は最大タイトル条件の結果ではない。製品化時は新仕様で再検証する。今回の設計スライス100%、製品v1実装0%、残り見積もり約3スライス。

Goal「編成共有URLの圧縮方式比較と長さの実測」は完了した。12ケースでJ/B/Zの往復復元、破損・未知版・過大入力の拒否、文字数と処理時間を確認し、チェックサム付きバイナリをDEFLATE raw圧縮するZ方式を新規生成の推奨とした。固定計測条件では通常9人269文字、全スペル347文字、最大タイトル込み461文字だった。製品画面への接続、公開辞書、ブラウザ圧縮実装、端末間共有は後続Goalとする。下記は完了したGoalの記録である。

## 完了済みGoal：編成共有URLの圧縮方式比較と長さの実測

### 目的と成果物

GitHub Pagesだけで復元でき、Discordへ貼り付ける編成共有URLについて、正確に復元できる圧縮方式と実測文字数を示す。数百文字という目標を未検証の保証にしない。成果物は独立した計測ハーネス、固定した代表入力、方式別の比較結果、採用案と残課題。設計は[編成共有設計](docs/formation-sharing-design.md)の圧縮形式案に従う。

### 対象データ

9使徒と空き位置、各3遺物、スペルと枚数、権能、使徒★・A段階・表示ONのALv/SLv、カード★/はんだ、表示ONの全体%補正、任意タイトル。使徒Lv・Rank、Rank全体・研究・ボード上級の固定値、共有メモ、画像、全セーブは除外する。不明値と0は区別する。

### 完了条件

1. 既存モデルから代表入力を作り、短い整数IDの追記専用辞書と参照版の規則を確定する。配列順を永続IDにしない。計測用辞書は公開済み形式として扱わない。
2. J（固定順配列JSON圧縮）、B（バイナリ）、Z（バイナリ圧縮）を同一入力で比較する。必要な圧縮形式・依存・対応環境を確認し、方式タグを含む仕様を記録する。
3. 各入力を復元し、対象データが元と一致することを機械的に確認する。空き位置、重複枚数、非表示項目、未知値、小数の全体%補正を落とさない。
4. 現行の公開URLのベース部分を含むURL全体の文字数、符号化前後バイト数、処理時間と測定環境、必要な依存コード量をケース別・方式別に記録する。通常値と最大ケースを区別する。
5. 破損入力、未知版、参照外ID、過大な展開の拒否を確認し、既存の保存値へ読み書きしない。アプリ本体・datasheetを変更しない。
6. 採用推奨方式、削減効果と複雑さの比較、目標への到達状況を報告して停止する。目標未達でも正確な計測と判断材料が揃えば本Goalは完了。短縮のために情報を自動削除しない。

### スライス計画（完了）

| スライス | 実施内容 | 対応する完了条件 |
| --- | --- | --- |
| 1 | 対象抽出・代表入力・辞書規則・測定条件を固定し、J方式の往復と基準長を計測 | 1・2・3・4 |
| 2 | B/Z方式、共通値・差分・カード参照を実装し、同じ入力で往復一致と長さを比較 | 2・3・4・5 |
| 3 | 境界入力と結果をレビューし、推奨方式・具体的文字数・製品化の残作業を報告して停止 | 3〜6 |

必須ケースは1/6/9人、9人の通常編成（スペル6種類）、重複遺物多め、全員異なる育成値、全スペル、空き使徒枠に遺物あり、全体%補正あり/なし・小数・不明、ALv/SLv非表示、タイトルなし/最大。比較のため全方式で同じ参照辞書・入力・タイトルを使った。全スペル35種類と権能1枠を現行モデルから確認した。

### 進行と採用判断

各スライス開始前に作業内容と対応する完了条件を明示する。終了後はSTATUS.mdに達成度、実測などの根拠、残り見積もりを記録する。初期見積もり3スライス。3スライス連続で達成度がほぼ増えない場合は継続せず再計画を提示する。

文字数が短いだけで選ばず、復元互換性、依存容量、保守の複雑さを併記する。実測ではZが12ケースすべてで最短だったため、チェックサム付き固定順バイナリ＋DEFLATE rawを推奨する。処理時間は最大ケース1,000回反復でJ/B/Zとも1回0.07ms未満だった。ブラウザ標準の圧縮APIは検証ブラウザで利用できなかったため、製品化時は機能検出と同梱実装の検討が必要である。ユーザーに見せる数値は実測値とし、400〜700文字の過去概算を測定結果へ流用しない。

### 対象外と停止条件

共有ボタン・製品ページへの接続、現在の試作UI変更、PNG保存、公開用辞書の確定配布、サーバー導入、外部短縮サービス、Discordへの投稿、公開・commit・pushは対象外。端末間の貼り付け検証は製品化Goalで行う。本GoalだけでDiscord共有の動作保証や製品化完了とはしない。既存未コミット変更を維持する。

## 完了済みGoalの記録

編成共有画面の試作Goalは完了。独立プレビューの第一案、狭幅・テーマ・代表ケースの確認、結果の文書化まで完了した。URL共有・PNG保存・公開・pushは今回のGoalの後続であり、まだ着手しない。

今回の対応範囲は、親子AGENTSの方針整理、DPS発動経路の現行仕様への訂正、datasheet生成Skillの修正、現在地と履歴の分離。計算コードやdatasheetの変更は含めていない。

上記は前回の文書整備の範囲。今回の新しい計画は以下。

## 完了済み：編成共有画面の試作と表示方針の検証

### 目的と成果物

「今こんな編成だけどどうかな？」と他人へ見せる画面を試作し、編成と育成状況をコンパクトに伝えられる表示方針を決める。成果物は既存保存データを変更しない独立プレビュー、検証用の代表編成、PC・スマホの表示確認記録、採用案と残課題を反映した設計書。詳細は[編成共有設計](docs/formation-sharing-design.md)を参照する。

ゲーム内画像は参考であり、画面上の配置・列数・遺物の上下左右は変更してよい。ただし実際の編成位置、空き位置、使徒と装備の対応を失わない。レイアウトを組み替える場合は列名・位置表示や小さな配置図で元編成を把握できるようにする。

### 完了条件

1. 最大9使徒・各3遺物・スペル・編成権能を確認でき、未選択や空き位置も区別できる。
2. A1〜A3を使徒画像へ重ね、SLvは低・高・Pを明示して目立たせる。使徒★・Lv・Rank・アサイドLv、カード★・はんだ・枚数、愛用の有無と有効Lvが分かる。★は既存画像を用いる。
3. PC幅1280px、スマホ幅360/390/430pxで確認し、数値の見切れ・省略・重なりがない。1画面程度の一覧性を目標とするが、最大編成では縦スクロールや明示的な拡大閲覧を許容する。重要値をタップ詳細に隠すだけで解決しない。
4. 1/6/9使徒、空き枠、A未解放〜A3、長い名前、最大育成、画像欠落、スペル多数を代表データで確認する。ライト・ダーク双方で文字と★・A表示を読める。
5. プレビューは固定した編成・育成データだけで描画する。閲覧側の保存値に混ざらず、既存編成・育成・計算・datasheetを変更しない。試作データは検証用と明示する。
6. 実画面の確認記録と採用候補・残課題を設計書へ記録し、ユーザーが見た目を判断できる状態で提示する。ユーザーの承認を得たと推定せず、ここで一旦停止する。

### スライス計画

| スライス | 次の1スライスで行うこと | 対応する完了条件 |
| --- | --- | --- |
| 1 | 完了：既存データ・素材を使う独立プレビューと代表データを用意し、PC用の第一案を描画する | 1・2・5 |
| 2 | 完了：同じ第一案をスマホへ適応し、配置を組み替えず代表データと両テーマで実画面を確認する | 3・4 |
| 3 | 完了：表示上の残課題を整理し、確認結果・採用候補・後続実装条件を文書化する | 1〜6 |

試作は3スライスで完了した。初めから複数案を並行実装せず、第一案の問題が明確な場合に代案を比較する方針を維持した。次の製品化GoalではURL/PNGを同一スナップショットから生成し、端末間共有と長さ上限を別途検証する。

### 対象外と後続段階

- 今回の試作Goalでは、本体への共有ボタン統合、URL生成・復元、PNG保存、公開・pushは行わない。
- URL共有とPNG保存は削除・断念した要件ではない。表示方針確認後の製品化段階で、同一の固定共有データから両方を生成する。URL長、入力検証、端末間共有、画像・フォント読込と保存を検証する別Goalを設定する。
- 短縮URL用サーバー、ログイン・公開範囲・失効、編成別SNSプレビュー、データ取り込み、厳密なダメージ再現は対象外。
- 現在の未コミット変更を維持し、既存の計算処理やdatasheetへ変更を広げない。実装開始時は最新AGENTSのモデル別承認方針に従う。

## 直近の実装Goal

「DPS発動経路・入力モード統合」は既存の最終報告で必須範囲を完了している。開始時の問題、設計原則、10件の完了条件、制約は[完了済み計画の原文](docs/history/goal-dps-trigger-integration.md)へ保存した。

現行の発動条件・初期方針は[DPS仕様書5.1.1](docs/dps-specification.md)、完了根拠と残る検証事項は[STATUS.md](STATUS.md)を参照する。

## 次のGoalを設定するとき

ユーザーから依頼された目的、成果物、完了条件、対象外、必要な検証をここへ記載する。既存の暫定事項や将来構想を自動的にアクティブGoalへ昇格させない。

作業中の結論と次の一手はSTATUSへ、各スライスの実施内容・検証結果・途中の見積もりは`docs/history/`へ記録する。完了時は計画を履歴へ保存し、本書の現在状態を更新する。
