# P5b ローカルstaging／配信手順案

2026-09-14。これはローカル準備用の手順案であり、実workflow・repo・Pages・DNSを変更しない。二公開先方式は[配信契約](../storage-release-contract.md)に従う。

## 初回／更新のrelease input

初回と更新を同じ生成入口へ渡すが、previousは暗黙探索しない。初回は`RELEASE_MODE=initial`として`PREVIOUS_RELEASE_ID`／`PREVIOUS_RELEASE_JSON`を空にする。更新は、前回の成功配信後に保存したrelease recordだけを`PREVIOUS_RELEASE_JSON`へ渡し、その`releaseId`を`PREVIOUS_RELEASE_ID`へ重ねて指定する。recordは`status=published`、`dirty=false`、40桁の`sourceCommit`、dual-profileのdigest／Service Worker情報を持たなければならない。現行の`tmp/public-site/public-site-release.json`が`local-only-unpublished`または`dirty=true`ならpreviousには使わない。

JSONはworkflow／local shellの本文へ埋め込まず環境変数からhelperへ渡す。helperは更新時だけ`tmp/previous-public-site-release.json`へ検証済みのcompact recordを書き、生成時にだけ明示的な`--previous-release`へ渡す。初回はprevious fileを作らず、更新の入力欠落・JSON不正・成功配信status不在・ID不一致は生成前に終了コード2で止める。

```text
# 初回
$env:RELEASE_MODE = 'initial'
$env:PREVIOUS_RELEASE_ID = ''
$env:PREVIOUS_RELEASE_JSON = ''
node tools/validate-public-site-release-input.js --mode $env:RELEASE_MODE --out tmp/previous-public-site-release.json
node tools/generate-public-site.js --write --manifest tools/public-route-manifest.json --out tmp/public-site

# 更新。recordは承認済み前回配信の保管元から読み、tmp/public-siteのlocal試作を参照元にしない。
$env:RELEASE_MODE = 'update'
$env:PREVIOUS_RELEASE_ID = '<previous-release-id>'
$env:PREVIOUS_RELEASE_JSON = Get-Content -Raw '<approved-previous-release-record.json>'
node tools/validate-public-site-release-input.js --mode $env:RELEASE_MODE --out tmp/previous-public-site-release.json
node tools/generate-public-site.js --write --previous-release tmp/previous-public-site-release.json --manifest tools/public-route-manifest.json --out tmp/public-site
```

初回／更新とも、生成後に`record-public-site-checks.js`→`create-public-site-candidate.js`→`prepare-public-site-staging.js --candidate`を同じsource commitへ束縛する。更新でpreviousを差し替えた場合は`contentDigest`、Service Workerの`previousCacheVersion`、candidateIdが別候補になるため、承認済みcandidateの入力を使い回さない。

## clean生成から候補stagingまで

生成releaseは`local-only-unpublished`のまま保持する。clean checkoutで生成し、検査コマンドが対象releaseのdigest付きchecksを作り、candidate toolが別のcandidate recordを作成してから、staging toolへ渡す。checks／candidateはgenerated sourceの外に置き、成果物のcontentDigestへ含めない。

```text
node tools/record-public-site-checks.js \
  --repo-root . \
  --source tmp/public-site \
  --release tmp/public-site/public-site-release.json \
  --build tmp/public-site/public-site-build.json \
  --manifest tools/public-route-manifest.json \
  --out tmp/public-site-checks.json

<clean-source-commit> = $(git rev-parse HEAD)
<dual-output-content-digest> = release.contentDigest
<new-output-digest> / <legacy-output-digest> = release.profiles[*].outputDigest

node tools/create-public-site-candidate.js \
  --repo-root . \
  --source tmp/public-site \
  --release tmp/public-site/public-site-release.json \
  --build tmp/public-site/public-site-build.json \
  --manifest tools/public-route-manifest.json \
  --checks-file tmp/public-site-checks.json \
  --expected-commit <clean-source-commit> \
  --expected-content-digest <dual-output-content-digest> \
  --expected-profile-digests new=<new-output-digest>,legacy=<legacy-output-digest> \
  --out tmp/public-site-candidate.json

node tools/prepare-public-site-staging.js \
  --repo-root . \
  --source tmp/public-site \
  --release tmp/public-site/public-site-release.json \
  --build tmp/public-site/public-site-build.json \
  --checks-file tmp/public-site-checks.json \
  --candidate-record tmp/public-site-candidate.json \
  --expected-commit <clean-source-commit> \
  --expected-content-digest <dual-output-content-digest> \
  --expected-profile-digests new=<new-output-digest>,legacy=<legacy-output-digest> \
  --out tmp/public-site-staging \
  --candidate
```

`record-public-site-checks.js`は生成安定性、manifest、生成file／release hash、2 local OriginのHTTP到達を実行し、4つの結果と`sourceCommit`、`contentDigest`、new／legacy `outputDigest`を自動出力する。利用者がtrueを手編集して正式候補にする手順はない。`create-public-site-candidate.js`はGit HEAD／dirty状態、期待digest、生成物、checksを照合し、成功時だけcandidate recordを書き、失敗時は終了コード2でrecordを作らない。

`prepare-public-site-staging.js`は`--out`の下に`new/`と`legacy/`を別々に作り、検査結果を公開root外の`staging-report.json`へ保存する。`--candidate`はcandidate record、現在のGit状態、再生成checkまで通らない限り終了コード2で止まる。生成releaseが`local-only-unpublished`でも、cleanで束縛済みのcandidate recordを経たlocal stagingだけを受理し、公開可とは扱わない。

## profile rootの対応

| staging root | 入れる内容 | 禁止する状態 |
| --- | --- | --- |
| `new/` | release build ledgerで`profile=new`のoutputだけを、生成出力のroot相対のままコピー | `trickcal-manager/`、`docs/`、`tools/`、`tmp/`、`backups/`、`outputs/`、tests、xlsx、secretの混入 |
| `legacy/` | `profile=legacy`のoutputから先頭の`trickcal-manager/`だけを除き、旧Pages artifact rootの中身としてコピー | `trickcal-manager/trickcal-manager/`の二重化、base prefix欠落、上記の除外対象 |

旧Pagesへ渡すのは`legacy/`の中身であり、`legacy/trickcal-manager/`をさらに作らない。new側へはlegacy一式を渡さない。release／build台帳はstaging検査の根拠として使い、公開rootへ手作業で追加しない。

## 候補受入gate

staging入口は、sourceのdual-output `contentDigest`、profileごとの生成順`outputDigest`、releaseのprofile／Service Worker hash、指定された`sourceCommit`、check evidence、candidate recordを照合する。checksの`sourceCommit`、`contentDigest`、new／legacy `outputDigest`は必須で、不一致・欠落、未知profile、禁止ファイル、root外pathは候補を拒否する。出力先はtmp直下の`public-site-staging*`という専用rootだけを許可し、sourceとの同一／親子、tmp自身、symlink／junction、既存別用途root、out配下の入力を削除前に拒否する。

candidate recordがない通常dry-runでは、`status: local-only-unpublished`または`dirty: true`のreleaseを候補として拒否する。cleanなsourceCommitと、生成check・manifest validate・public-site焦点test・HTTP checkがすべてtrueのcheck evidenceを候補の前提とする。candidate作成後にアプリ生成物を変更するとcontentDigest／再生成checkで拒否し、Git dirty化も拒否する。clean／dirtyの受入差は実repoへcommitせず、隔離fixtureで検査できる。

## 配信workflow template（未設置）

1. clean checkoutでmanifest同期、二profile生成を行い、`record-public-site-checks.js`を実行してchecksを作る。
2. 同じrelease／build／checks／期待commit・digestを`create-public-site-candidate.js`へ渡し、candidate recordを作る。
3. `prepare-public-site-staging.js --candidate --candidate-record ...`でcurrent Git、再生成、profile root分離を照合する。版不一致、check不足、候補作成後の変更ならstagingから先へ進めない。
4. 外部承認後、[`storage-p5b-source-delivery.yml`](storage-p5b-source-delivery.yml)をsource側へ設置する。このtemplateは`workflow_dispatch`だけを起動条件とし、`release_mode`（`initial`／`update`）をrequired choice inputにする。更新では`previous_release_id`と`previous_release_json`を環境変数経由のhelperで検証し、成功配信済みrecordをtmpへ materializeして`--previous-release`へ渡す。source commit／candidate ID／content digest／profile digest／成果物repo名もrequired inputとする。`public-site-delivery-approval` environmentの承認後、clean生成→checks→candidate→staging→new rootの受渡しを順に行う。
5. 受け渡し先の`.git/`、`.github/`、事前設置workflow、CNAME、未知ファイルを保護したまま、`transfer-public-site-artifact.js --apply`がcandidate／profile／staging file hashを再照合する。受け渡し先のclean確認後に、所有ledgerに記録されたファイルだけをcommit／pushする。legacy rootは既存Pages側の旧baseの中身として別に扱う。
6. 成果物repoには[`storage-p5b-pages-deploy.yml`](storage-p5b-pages-deploy.yml)を未設置templateとして渡す。ledgerの所有ファイルだけを一時`.pages-root`へhash検査付きで抽出し、`actions/configure-pages@v5`→`actions/upload-pages-artifact@v4`→`actions/deploy-pages@v4`へ接続する。deploy jobはbuild jobへ`needs`し、`pages: write`／`id-token: write`と`github-pages` environment（required reviewers設定）を使う。
7. new側の実Origin確認、保存／共有／転送確認、版照合が終わるまで旧側の移行案内gateはOFFのままにする。案内の有効化は別の明示承認を得る。新側失敗をlegacy公開・案内ONへ連鎖させない。

source側のContents writeは、受信repoだけを対象にしたfine-grained tokenを`TRICKCAL_SITE_CONTENTS_TOKEN` secretへ登録する前提で、templateには値を記録しない。source jobの`GITHUB_TOKEN`はcontents readだけ、Pages deploy jobは公式Pages要件の`pages: write`／`id-token: write`だけを持たせる。受信workflowはpush自動起動を有効にせず、初回はrequired inputと承認environmentを通す手動起動を正とする。実workflowへ設置しない限り、これらは実行されない。

Actions／Pagesのtemplateは、GitHub公式のcustom workflow例・artifact上限／symlink制約・deploy jobの`needs`／`github-pages` environment／`pages`・`id-token`権限を参照して固定した。実施時には公式資料を再確認する。

## 失敗時と停止／rollback

- staging、版照合、Pages artifact、Origin確認のどこかで失敗したらnew側の公開と移行案内を停止し、legacy側の案内OFFを維持する。
- 失敗した成果物はstaging root単位で破棄・再生成できるが、公開保存領域の削除やstorageの逆転送は行わない。new／legacy双方の利用者データを保持する。
- rollbackは配信候補・公開案内の停止と旧側維持を意味し、アプリの保存データを以前の値へ戻す操作ではない。旧側へ自動で逆転送しない。
- この手順案の実施時も、token値・secret値・DNS値・個人データをログや記録へ出力しない。

## 実施時に必要な外部操作と承認

次の項目はP5b local stagingの外部前提であり、今回の作業では実施していない。

利用者が行う順序は次の通りとする。

1. 実repoを確定commitへ揃え、clean生成→`record-public-site-checks.js`→`create-public-site-candidate.js`→`prepare-public-site-staging.js --candidate`を実行してcandidate recordとnew／legacy rootをレビューする。dirty／版不一致ならここで停止する。
2. 成果物専用repo `innocentroad/trickcal-manager-site` の作成可否・名前確定と管理者承認を得る。
3. source repoからそのrepoへ成果物を渡す権限、branch／review運用、受け渡し用fine-grained tokenの登録・期限・更新担当を確定する。token値は記録しない。
4. Pagesの公開source／environment／workflow設定と、`trickcal.irlab.dev`のDNS／CNAME設定・管理権限・HTTPSを確定する。
5. 承認済みnew rootを配信用branchへ受け渡し、Pages artifactの内容とmanifest／releaseを照合する。旧側の移行案内gateはOFFのままにする。
6. new側の初回公開、実Origin smoke test、保存／共有／転送確認への公開承認を得て実施する。失敗時はnew公開を停止し、legacy案内をONにしない。
7. new側の全確認後に、旧側の移行案内gateをONにする別承認を得る。公開順はnew確認→旧案内で固定する。

repo作成、token登録、Pages／DNS変更、実workflow編集・起動、実配信、公開gate変更、commit／pushはこの準備では行わない。

## G4 確定repo・公開準備の承認資料（2026-09-14）

これは現行dirty worktreeを承認なしに確定扱いしないための整理である。開始時の`git status --short`で確認した変更を維持し、以下はcommit候補の提案であって、`git add`／commitを実行した記録ではない。

### 確定commit候補と保留範囲

| 機能単位 | 対象案 | 現在の扱い |
| --- | --- | --- |
| 公開サイト source／runtime／manifest | `public-route-manifest*`、`generate-public-site.js`、`validate-public-site.js`、P5aで変更したprofile-aware HTML／JS／CSS／SW、`public-site-runtime.js`、共有表示生成物と焦点test | 公開candidateに含める案。ただし生成物はgeneratorで作り、最終diff・clean commitで再確認する |
| P5b Git gate／受渡し | `public-site-candidate.js`、`create-public-site-candidate.js`、`prepare-public-site-staging.js`、`record-public-site-checks.js`、`transfer-public-site-artifact.js`、`test-public-site-staging.js`、`test-public-site-delivery.js`、関連fixture、本文書と未設置template | G1〜G3のlocal証拠に対応する候補。実workflowへは含めず、受信repoへの受渡しtoolとして別レビューする |
| 保存・転送安全性 | `storage-*.js`／`storage-*.html`、`stat-prototype.js`／`stat-dashboard.*`、storage関連test／fixture／設計文書 | 今回のP5b commitへ無断混載しない。公開サイトが参照する範囲を含め、機能単位の依存を確認して別commit候補または明示除外とする |
| 編成共有・データ保守 | `formation-share-*`、共有catalog／display data、同期・生成・検査tools、`tools/generate-all.bat`、`tools/git/push.bat` | 既存変更を維持するが、datasheet貼付・全生成・push運用の承認がないため確定対象は未決定 |
| 記録・設計 | `AGENTS.md`、`GOAL.md`、`STATUS.md`、`docs/`、`docs/templates/` | この作業の証拠と手順。commit候補へ含めるかは上記機能単位のレビュー後に決める |

次のものは自動的なcommit候補から除外する：現在変更済みの`.github/workflows/pages.yml`、`tools/git/push.bat`のpush操作、`tmp/`の生成release／checks／candidate／staging、datasheet／xlsx、ゲーム生成データ、保存writer／codecの無関係変更、CNAME／DNS／secret／token、一覧にない未知の作業tree変更。`pages.yml`は現状main pushを起動条件にしているため、commitの承認とpush・既存legacy公開の承認を分ける。最終的なファイル単位の確定は、利用者が候補commit範囲を承認した後にだけ行う。

### R1のファイル単位候補（commit前の確定案）

R1の入力接続だけを機能単位として切り出す場合、候補は次の8ファイルに限定する。これは`git add`／commit済みの一覧ではなく、利用者承認後に再度diffと依存を確認するための正確な候補案である。

| 対象 | 役割 |
| --- | --- |
| `tools/validate-public-site-release-input.js` | 初回／更新inputのmode・previous record・ID・成功配信status／cleanを検証し、更新時だけcompact recordをtmpへmaterialize |
| `tools/test-public-site-release-input.js` | workflow接続、初回／更新、欠落／別previous拒否、local／fresh生成のSW・previousCacheVersion・digest・candidateId一致を確認 |
| `tools/test-public-site-delivery.js` | 既存専用tmp delivery回帰へR1 source template input接続の静的検査を追加 |
| `docs/templates/storage-p5b-source-delivery.yml` | 未設置source workflow templateへ`release_mode`、previous input、helper、更新時`--previous-release`を接続 |
| `docs/templates/storage-p5b-local-staging.md` | local候補作成時の初回／更新inputと承認範囲を記録 |
| `GOAL.md` | R1の実施結果、残条件、停止条件の記録 |
| `STATUS.md` | R1の検証証拠と外部承認待ちの記録 |
| `docs/storage-s1-acceptance.md` | R1固定IDの受入台帳記録 |

このR1候補へ、`.github/workflows/pages.yml`、`tools/git/push.bat`、`tmp/`生成物、datasheet／xlsx、ゲーム生成データ、保存writer／codec、`CNAME`／DNS／secret／token、一覧外のdirty変更を追加しない。既存の公開サイト本体・共有資材・保存関連変更は別機能単位として、このR1の承認に含めない。

### new／legacy rootとworkflow差分案

- new側は成果物専用repo `innocentroad/trickcal-manager-site`（2026-09-14利用者確定、実作成は別承認）のrootへ、`staging/new/`の中身を渡す。`public-site-deployment.json`でcandidateId／sourceCommit／profile／digestを照合し、`.trickcal-public-site-delivery.json`はPages artifactへ含めない。
- legacy側は現行 `https://innocentroad.github.io/trickcal-manager/` と保存・backup・recovery入口を維持する。渡す場合は`staging/legacy/`の中身を旧Pages artifact rootへ置き、`trickcal-manager/`を再付加しない。旧側の案内はnew側の確認までOFFとする。
- 現行`.github/workflows/pages.yml`は本作業で変更・設置しない。現状は`main` push／manualを起動し、既存の広いsource treeからPages artifactを作るため、legacy artifactを生成`legacy/` rootへ切り替える場合のworkflow差分は別承認の提案に留める。
- new側のsource templateはmanual `workflow_dispatch`でcommit／candidate／digestを入力し、承認environment後にclean生成・checks・candidate・staging・new受渡しを行う。受信側templateはmanual inputを検査してledger所有ファイルだけをPages artifact化し、`configure-pages@v5`→`upload-pages-artifact@v4`→`deploy-pages@v4`をbuild／deployの`needs`境界と`github-pages`承認environmentで実行する。両templateとも実`.github/workflows`へ未設置である。

### 承認後の操作順

1. 利用者が確定commitの対象ファイルと除外範囲を承認する。承認後にだけ実repoを確定commitへ揃える。commitだけではpush・公開を承認したことにしない。
2. 確定commitからclean生成→checks→candidate→new／legacy stagingを行い、candidateId／sourceCommit／digestとfile hashをレビューする。dirty／版不一致なら停止する。
3. 成果物repo名、受渡しbranch、Contents writeだけのfine-grained token、更新担当、Pages／environment、Cloudflare DNS／CNAME／HTTPSを準備する。token値は利用者が安全な設定画面へ登録し、チャット・ログ・成果物へ貼らない。
4. 初回new公開の明示承認を得てから、旧側の移行案内をOFFのままnew成果物を受渡し、受信workflowを手動起動する。new側の失敗をlegacy公開・案内ONへ連鎖させない。
5. 実Origin `https://trickcal.irlab.dev`でroot、主要入口、共有hash、PNG、Worker scope、保存／転送／復元、sourceCommit／digestを確認する。workflow成功だけをOrigin確認の代わりにしない。
6. new側の全確認が成功した後、旧側の移行案内gateをONにする別の明示承認を得る。失敗時はnew公開・案内を停止し、旧側と両側の保存データを保持する。rollbackは成果物／案内の停止または検査済み互換版への戻しであり、保存データの巻戻しではない。

### 利用者に確認する承認事項

1. 確定commitに含める機能単位と、今回除外する未確認変更。
2. 成果物repo名、受渡しbranch、review／environmentの担当。
3. 外部workflow設置・起動、Pages、token権限／期限／更新担当、Cloudflare DNS／CNAME／HTTPSの変更範囲。
4. new側初回公開の承認、実Origin確認の実施、確認後に旧移行案内をONにする別承認。

現在の生成releaseは`local-only-unpublished`／`dirty:true`であり、承認だけでcleanや公開済みへ昇格しない。R1のlocal入力接続・fresh再生成条件を満たしたため、ここから先は承認が揃うまで実装・局所テスト・外部操作を追加せず停止する。
