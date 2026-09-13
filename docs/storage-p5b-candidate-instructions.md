# U1〜U3レビュー／P5b候補準備の仕上げ

2026-09-14。今回はレビュー・指示作成のみ。P5aのローカル完了は維持し、保存やブラウザ検証を最初からやり直さない。

## レビュー結果

U1の生成SWへのrelease注入、sourceVersionsと最終hashの分離、U2の生成物による転送を確認した。今回public-siteテスト、生成--check、validateを再実行して成功。native report `tmp/storage-transfer-native-1789312302904.json`のok:trueと転送・保存計算保持を確認した。SW実ブラウザ更新はLuna記録を再利用し、今回独立実行したとは扱わない。

U3のstagingは通常出力の抽出に成功している。ただし次の2点は使用・配信前に直す。

1. **[P1] 出力先指定でtmp全体を削除できる。** `tools/prepare-public-site-staging.js:67`のresolveUnderTmpはtmp自身を許し、217付近はoutがsourceの親になる場合を拒否しない。282付近でoutを再帰削除するため、`--out tmp`は入力成果物・他の検証記録まで削除する。実削除は試していない。本番関数を隔離してパス判定だけ実行し、`tmpRootAccepted:true, ancestorRejected:false`を確認した。
2. **[P2] 検査証拠が対象releaseへ必須接続されていない。** readChecksは4個のtrueだけでもokになる。sourceCommit/contentDigest/profile digestは存在する場合だけ比較するため、別成果物の検査結果を流用しても識別できない。fs読取りのみ代替した本番readChecksで`unboundChecksAccepted:true`を確認した。現行dirty/local-only成果物は別のgateで拒否されており、実公開を通過したとは判断しない。

さらに、generatorは常にlocal-only-unpublishedを生成する一方でcandidateはこれを拒否する。これは現在の公開防止として正しいが、cleanな検査済み生成から正式候補を作る入口はまだない。手編集でstatus/dirtyを書き換える運用にせず、次単位で完成させる。現在は「外部承認さえあれば公開できる」とはしない。

## Luna向け実施範囲

親・ManagerのAGENTS.md、GOAL.md、STATUS.md、本書、docs/templates/storage-p5b-local-staging.md、storage-release-contract.mdを読む。本書を最新順とする。対象はstaging／候補検査tools、必要最小限のgenerator接続、焦点テスト、文書。開始時の既存変更境界を記録して未コミット変更を保持する。

### C1：stagingの削除境界と検査証拠（約1単位）

- tmpそのもの、sourceと同じ／親／子になるoutを、削除・コピーより前に拒否する。指定release/build/checks入力も出力削除で失わないことを確認する。削除可能なのは専用staging子ディレクトリだけとし、既存の別用途フォルダを勝手に再利用しない。realpath／junction等は解決済みの対象境界で確認するか、対応外として拒否してよい。
- 検査結果はsourceCommit、contentDigest、new/legacy outputDigestを必須とし、対象releaseと一致しない・欠落した証拠を拒否する。署名基盤等は不要。実検査を実行したコマンドが結果と対象digestを出力する形にし、trueを人手で記入することを正式候補手順にしない。
- 焦点テストは正常な専用出力、不正な出力境界で書込み／削除呼出し0、証拠欠落・別digest拒否だけをまず確認する。tmp全体を実削除して検証せず、隔離fixture／fs spyで同じ入口を通す。汎用ファイル安全検出器へ広げない。

合格条件C1：通常stagingを維持し、広範囲削除と別release証拠の流用を拒否できる。

### C2：検査済み候補の作成入口と引き渡し（約1単位）

- 生成releaseはlocal-onlyのまま保持してよい。clean checkoutと検査成功・期待commit/digestを確認したtoolsが別のcandidate recordを作り、stagingがそれを検証する方式を基本とする。候補作成を公開と同義にせず、公開実施には別承認を要求する。
- 実行時のGit HEAD・dirty状態を確認する。実repoをcommitしない。正常候補の成功とdirty／欠落証拠／版不一致の拒否を一時Git fixtureまたは既存隔離テストで確認し、実checkoutがdirtyであることは未確定のまま正直に報告する。
- candidate recordを生成後にアプリ成果物を変更したらstagingで拒否する。作成した検査記録・候補記録をアプリcontentDigestの自己参照対象にしない。既存hashやprofile台帳を再利用する。
- 手順案を「clean生成→実検査結果→candidate→new/legacy staging→外部承認」の実コマンドへ更新する。既存workflow変更はせず、次回に必要なworkflow差分案と入力項目を文書へ記載する。
- new側／legacy側の公開順、失敗時案内OFF、既存workflow非上書き、データを戻さないrollbackを維持する。外部操作一覧を利用者が行う順に整理する。

合格条件C2：手編集なしで隔離clean fixtureの候補を受理し、不適合を拒否できる。実repoのdirty候補は引き続き拒否し、外部操作に進む前の残件が明確になる。

## 最終確認と停止

各単位の開始前に条件C1/C2と対象を示し、終了後STATUS・受入台帳へ証拠、達成数、未確認、残見積もりを記録する。合格後は次へ進む。目安計2単位。変更JS構文、staging/candidate焦点テスト、影響がある場合だけpublic-site生成check、git diff --checkを確認する。ブラウザ・保存全件の再検証は不要。

終了後はP5a完了を維持した上で、P5b候補準備の判定、実repoの確定commit待ち、外部操作・承認一覧を報告して停止する。新repo作成、token登録、DNS/Pages/CNAME、実workflow変更・起動、実配信、移行案内ON、commit/push、自動実行Goal有効化は禁止。datasheet・ゲーム生成物・保存writer・codecも変更しない。
