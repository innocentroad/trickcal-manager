# 通常更新の公開手順と設計

2026-09-17。公開用sourceの初回復元は完了済み。毎回復元・clone・受信baseline合成を行わない。
この文書は手順であり、commit・push・公開・承認代行を開始する指示ではない。
実行・レビュー担当向けの共通手順とする。指令・引き継ぎ文を作る担当だけ、[指令作成要綱](publication-task-authoring.md)も参照する。

## 固定する作業場所

- source: `D:/Games/etc/trickcal/trickcal-manager/tmp/release-source`、branch `release-source`。
- new受信repo: `D:/Games/etc/trickcal/trickcal-manager/tmp/minor-data-publish-new-final5`、`innocentroad/trickcal-manager-site` / `main`。
- legacy受信repo: `D:/Games/etc/trickcal/trickcal-manager/tmp/minor-data-publish-legacy-final4`、`innocentroad/trickcal-manager` / `legacy-site-artifact`。
- 初回に指定する前回release: sourceから相対で `../release-source-publish-final7/tmp/public-site/public-site-release.json`。
- 自動公開成功後は `backups/publication-history/latest-new.json` 内のrelease記録をprepareが自動利用する。初回だけ上記previous-releaseを明示する。配信先別に成功を保持し、準備しただけの候補を公開済み扱いしない。

作業開始時にbranch・remote・HEAD・dirtyを一度確認する。古いパス名にfinalが含まれていても、番号を増やしたcloneを毎回作らない。
sourceのcommitは専用branchへ残す。dirtyな元mainを取り込まず、mainへのpushは行わない。

## 入口と境界

`node tools/public-site-publication.js --help` がローカル処理の入口。

- `check`: dirtyな実装の検証用。生成とManager全検査を行うがcandidateを作らない。
- `prepare`: cleanなsourceでのみ、生成→検査・checks記録→candidate→stagingを実行する。
- `transfer`: 既定はdry-run。`--apply`で対象所有ファイルだけ転送、`--stage`も付けると対象限定stageとindex照合を行う。
- `stage --receipt FILE`: 転送済み候補を再コピーせずstage・照合する。中断時の再開入口。
- `verify`: indexまたは完全40桁commitのGit内容を照合。receipt v2を必ず利用し、未指定なら同じ候補・profile・受信先のreceiptを自動解決する。見つからなければ停止し、範囲検査を省略しない。

このコマンドはcommit・push・workflow起動・環境承認を行わない。全変更stage、force push、保護設定変更の機能も持たない。
GitHub側の入口は別の `tools/publish-public-site.js`。既定はローカル検証と実行計画の表示だけ。`--execute`を明示した場合に限り、検証済みartifact commitのpush・既設workflow起動・状態確認へ進む。commit自体は自動作成しない。

NodeからGitを呼べないEPERM等は生成前に停止する。実行環境の通常の承認経路を使って同じworktreeで再実行する。
clone増殖、.git直読みでcleanを偽装、検査成功記録の手作成、dirty判定の書き換えはしない。

## 通常の公開

以下は今回対象へのcommit・push・公開が依頼された場合の手順。コマンド失敗時は後続へ進まない。

1. datasheet更新が必要なら標準生成を一度実行。今回の入力・生成物・画像等の差分を確認し、sourceを対象限定commitする。同一構成で済んだ生成は繰り返さない。
2. `prepare`を一度実行し、結果JSONのbundlePathを保持する。手でdigestを転記しない。

```powershell
$prepared = node tools/public-site-publication.js prepare --previous-release ../release-source-publish-final7/tmp/public-site/public-site-release.json | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'prepare failed' }
$bundle = $prepared.bundlePath
```

3. new受信repoのremote・branch・HEADを確認し、必要なfetchは通常どおり行う。競合や想定外更新を無視して上書きしない。dry-runの差分を確認してから転送する。

```powershell
$receiver = '../minor-data-publish-new-final5'
node tools/public-site-publication.js transfer --bundle $bundle --destination $receiver --profile new
if ($LASTEXITCODE -ne 0) { throw 'dry-run failed' }
$delivery = node tools/public-site-publication.js transfer --bundle $bundle --destination $receiver --profile new --apply --stage | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'transfer/stage verification failed' }
git -C $receiver diff --cached --stat
```

4. 対象限定のindexをcommitする。amendやforce pushを通常の修復手段にしない。commit後に以下で再照合し、成功した同じcommitだけを既設branchへpushする。

```powershell
$artifactCommit = git -C $receiver rev-parse HEAD
if ($LASTEXITCODE -ne 0) { throw 'rev-parse failed' }
$verified = node tools/public-site-publication.js verify --bundle $bundle --destination $receiver --profile new --ref $artifactCommit --receipt $delivery.receiptPath | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'commit verification failed' }
```

5. 以下の公開入口を使う。配信先・branch・remote・完全SHA・receiptを検証する。`--execute`なしではネットワーク操作も行わない。

```powershell
node tools/publish-public-site.js --bundle $bundle --profile new
# 今回の公開と通常deployment承認代行が明示依頼されている場合だけ:
node tools/publish-public-site.js --bundle $bundle --profile new --execute --approve-deployments
```

6. 同じコマンドの再実行は保存したrunを追跡する。running / approval-submittedなら15〜30秒程度後に再確認する。approval-requiredはrun URLと理由を報告し、待機する。自己承認禁止・別reviewer必須を設定変更・別アカウント・bypassで回避しない。
7. publishedはdeploy成功かつ公開identityのcandidateId/sourceCommit/profile/contentDigest/outputDigest一致を意味する。成功記録とrelease JSONは `backups/publication-history/` に配信先別で保存する。tmp掃除で前回releaseが失われない。
8. 移行中のdualモードだけ、同じbundleをlegacy受信repoへ3〜4の手順で投入し、公開入口を `--profile legacy` で実行する。new成功記録と現在のnew公開identity一致を確認できない場合はlegacyを拒否する。旧workflowのartifact_commitには完全40桁SHAを渡す。
9. 有効な配信先がすべてpublishedになったら終了。データだけの更新に全route巡回やDPS起動を追加しない。

### 接続・起動結果不明時

- 認証は既存GH_TOKEN/GITHUB_TOKEN、既存gh認証、既存Git credential helperの順に利用する。トークンはメモリ内だけで使い、出力・記録に含めない。新規ログインや設定変更は自動実行しない。
- 認証を取得できない場合は計画表示に含まれるbrowserUrl・inputsでブラウザ操作へ引き継ぐ。認証経路が整うまで自動公開記録は作らない。ブラウザで起動済みのrunを、追加で起動しない。
- workflow起動前にrequested状態を保存する。通信失敗・応答欠落時はdispatch-unknownとして既存run候補だけ表示し、再起動しない。
- 該当runの入力をGitHubで確認できた場合のみ `--run-id ID --confirm-run-inputs` を同じ公開コマンドへ追加して関連付ける。repo・workflow・起動時刻・workflow commitも照合する。候補がない/曖昧なら停止し、記録を削除して再起動する回避はしない。
- ローカル履歴がないブラウザ起動runも、上記オプションで取り込める。この経路はpush・dispatchを一切行わない。run ID・repo・workflow・branch・現在のworkflow commitを照合し、入力一致は操作者の明示確認を必須とする。ローカル起動時刻が存在しないため、runのcreated_atと取り込み時刻を別々に記録する。workflow branchが既に進んでいる場合は保守的に停止する。
- 同じ履歴ディレクトリを使う公開入口は、候補によらずGitHub配信先repo単位で排他する。履歴確認・pushより前にロックを取得し、競合時はネットワーク操作せず停止する。正常終了・通常例外では解除し、時間切れやPID判定だけで自動解除しない。別マシン・別履歴ディレクトリ・ブラウザ直接操作まで排他する仕組みではないため、公開は固定sourceから一人ずつ行う。
- 強制終了で `backups/publication-history/target-<hash>.lock` が残った場合は、表示された正確なパスとowner.jsonを確認する。所有プロセスの停止とGitHub上の起動状況を確認した後に限り、そのロック内owner.jsonと空のロックディレクトリだけを手動削除する。履歴JSONは削除しない。履歴がないのにrunが存在する場合は必ずrun指定で取り込み、通常の新規起動へ戻さない。
- 未知の環境承認は自動承認しない。run-failedは同じrunの失敗として報告する。再実行・キャンセル機能はこの入口に追加しない。
- identity不一致は同じrunの確認だけを再開し、再deployで解決しようとしない。

## 検査とバイト一致

record-public-site-checksの通常CLIとprepareはManager全検査を実行する。HTTP 200だけでなく、従来の静的参照、route wiring、alias、Service Workerのassertも保持する。
既存の公開siteテストは生成済みの最終出力を読むので、検査のためにサイト全体をもう一度生成しない。schema負例・release versionの小型fixtureは保持する。
その後に旧手順のgenerate --check、validate、test、HTTP、recordを追加で一巡させない。
candidate/staging/転送/Gitは境界ごとの入力が異なるため、既存のintegrity検査は保持する。生成器改修時の関連回帰テストは別途必要。

`suite: artifact`は最小fixtureを扱うライブラリテスト専用。通常CLIは指定できず、公開コマンドはManager checks以外を拒否する。

stagingをbuild順序・legacyのpath対応込みでcandidateのoutputDigestに照合し、そのバイト列からGit blob IDを計算してindex/commitと比較する。
identityもcandidateから生成した内容で比較し、台帳はその結果から再構成した期待値で照合する。転送台帳だけを正としない。
受信repoは既存の `* -text` を維持。生成後の改行変換・HTML修正・台帳hash修正は禁止する。
Windowsのコピーで同サイズ資材の古いstat情報が再利用されないよう、転送後のファイル更新時刻を明示する。内容バイトは変更しない。receiptのbaseCommitを使い、commit後の照合でも無関係な差分混入を拒否する。
一致検査が失敗したらそのindex/commitをpushしない。stageされた対象を残して理由を報告し、勝手にresetしない。

## 再開・時間・記録

- 同じ候補を続けるならbundleとreceiptを使う。source、生成物、checks、candidate、stagingを手加工しない。
- new成功後にlegacyで停止した場合はlegacyから再開する。newを再生成・再公開しない。
- dirtyな受信repoへのapplyは拒否する。転送済み・stage済みで止まった場合はreceiptとverifyを使い、applyを重ねない。
- 転送計画はコピー前にreceipt v2として保存する。失敗時にもphase・receiptパス・stage再開コマンドを表示する。コピー済みだが記録更新前に中断した場合は、ファイル全体と変更範囲が期待どおりと確認できた場合だけstageへ進む。部分転送・無関係なdirtyは停止し、resetしない。
- sourceの変更や検査不一致で新候補が必要なら原因を直して新しいnameでprepareする。既存候補は上書きせず、全工程を理由なくやり直さない。
- 準備のtimingsMsと、受信転送、Actions、承認待ちを分けて記録する。10分以内は未検証の目標であり、検査省略の根拠にしない。
- 完了記録はsource commit、bundle/previous-releaseの場所、新旧artifact commit・run URL、identity確認、残操作だけでよい。

## ドメイン移行完了後

`tools/publication-targets.json` はローカル公開対象の設定であり、GitHub workflow/Pages/DNS設定ではない。
現在はmode=dual、legacyState=active。利用者が移行完了と旧更新停止を明示決定した後だけ、mode=new-only、legacyState=frozenへ変更する。
new-onlyでは旧repoのpush・workflow・承認・公開URL確認・成功記録を新サイト公開の条件にしない。legacy指定自体を拒否する。
旧サイト閉鎖は別案件。閉鎖済みの事実を記録する場合だけlegacyState=closedを使う。この値自体はサイトを閉じず、repo削除・Pages停止・DNS変更・転送設定・保存データ処理を実行しない。
旧Originのバックアップ・移行導線を残す必要性は閉鎖時に判断する。旧配信先とsource repoを混同して削除しない。
初期段階ではローカルのdual生成・検査を保持し、legacy生成処理の撤去は移行完了時の別の限定改修とする。

API仕様参照: [workflow dispatch](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event)、[通常deployment承認](https://docs.github.com/en/rest/actions/workflow-runs#review-pending-deployments-for-a-workflow-run)。workflowや保護設定を変更するAPIは使用しない。

## 今回の初回整合確認

2026-09-17、source eff6ec8067d5385fc68404643c64b950592cf6baから再生成したcontentDigestは、前回candidateと同じ `429e5ee6e00432e0e1fea3a50dd092daffdc32504c826f7236fba781e8fd2b40`。
公開済み受信commitの保持ファイルと比較し、新旧それぞれ1,088ファイル中1,086はバイト一致、残りは改行差だけ。newはmanager/index.html・stat-dashboard.js、legacyはstat-dashboard.html・stat-dashboard.js。欠落・その他内容差分は0。
次回はこれらの混在改行を再現せず生成物のまま投入する。公開済みidentityの一致だけをバイト一致の証拠にしない。

今回の変更は公開ツール・関連テスト・文書のみ。アプリのruntime data、計算、workflow、保護設定は変更しない。
初回改善の変更前バックアップ: `D:/Games/etc/trickcal/backups/publish-streamlining-20260917-133114`（既存14ファイル）。今回のreceipt/再開/GitHub入口改修前バックアップ: `D:/Games/etc/trickcal/backups/publication-followup-20260917-142054`（既存7ファイル）。いずれもコピー後のSHA-256一致確認済み。新規ファイルはバックアップ元なし。
今回、実GitHubへのpush・workflow起動・承認は行わず、GitHub制御は模擬APIで検証する。本番接続での権限・承認可否は実際の公開時に確認し、模擬テスト成功を本番公開済み扱いしない。
