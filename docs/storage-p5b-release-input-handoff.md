# G1〜G4レビュー／公開前の最後の入力接続

2026-09-14。今回の停止は予定した承認待ちであり、作業不能ではない。P5a、Git gate、所有ファイル保護、ローカル受渡しの成功証拠を維持する。

## レビュー

Gitの独自clean推定は削除され、取得不能を拒否している。delivery toolはcandidate/staging/hash照合、保護ファイル維持、dry-run既定を実装している。今回`node tools/test-public-site-delivery.js`を再実行し、通常sandboxではGit子プロセスEPERM、許可された専用fixture環境では終了コード0。環境阻害と実装失敗を混同しない。実repoのGit・公開設定は変更していない。

**[P2] 更新配信の前回releaseがworkflowへ渡らない。** `docs/templates/storage-p5b-source-delivery.yml`の生成stepはclean checkoutへ毎回生成するが、`--previous-release`の入力がない。一方generatorは前回recordによってSWのPREVIOUS_CACHE_VERSIONを変え、最終contentDigest／candidateIdも変わる。ローカルで前回版を指定した更新候補を承認しても、fresh runnerではpreviousなしで再生成してdigest不一致になる。初回はpreviousなしで成立するが、更新配信には接続が必要。差分拒否は安全側なので、保存破損や誤公開が発生したとは扱わない。

G1とローカル受渡しは合格維持。G2のworkflowは更新時入力の限定補修待ち。既存テストを全てやり直さず、下記1単位を終えたら承認に進む。

## Lunaへの次回指示（R1、約1単位）

親・ManagerのAGENTS.md、GOAL.md、STATUS.md、本書を読む。既存dirty変更を維持する。対象は未設置source workflow template、必要な入力検証helper／焦点テスト、承認文書のみ。実workflowは触らない。

1. 初回／更新を明示する入力と、更新時のprevious release record入力を追加する。最小案はworkflow_dispatchのJSON文字列inputを環境変数経由で検証・tmpファイル化し、`--previous-release`へ渡す方式。JSONをshell本文へ直接埋め込まず、token等は含めない。初回のみpreviousなしを許し、更新で欠落・不正なら生成前に拒否する。
2. previousは承認対象候補を作ったときと同じ、前回成功配信のrecordに固定する。出力先に偶然残ったローカル試作recordを実配信の前回版と見なさない。ローカル候補作成手順にも同じ入力を明記し、初回／更新でsourceCommit・candidateId・contentDigestが揃うようにする。
3. 同じsource＋previousからローカル生成とfreshな一時出力生成を行い、SW内容／previousCacheVersion／contentDigest／candidateIdが一致する代表テストを追加する。異なるpreviousまたは欠落を拒否する1例も確認する。実GitHub配信はせず、初回の既存成功を再利用する。
4. 対象JS構文、入力接続の焦点テスト、関連deliveryテスト、差分を確認する。ブラウザ・保存・全画面の再検証は不要。
5. 承認資料をファイル単位の確定commit対象案まで具体化する。既存変更と依存関係を見て、実装に必要な未追跡ファイルを落とさず、workflow／push補助／不明変更の保留を明記する。分類名だけではcommit対象確定としない。git add/commitはしない。

## 合格と停止

R1合格は、初回と更新の生成入力がテンプレートに接続され、fresh環境でも承認候補を再現できること。STATUS・受入台帳へ証拠・残件・見積もりを記録する。公開可の判定ではなく、公開前ローカル準備完了として扱う。

合格後は新しい局所作業を追加せず、次の承認を利用者へ提示して停止する：

- 実repoの確定commit対象（pushしない）。
- 成果物repo名とbranch、実workflow設置・外部設定の対象。
- 新側の案内OFF初回公開と実Origin確認。旧側移行案内ONはさらに別承認。

今回のユーザー依頼はレビューと指示作成であり、上記の承認そのものではない。実repoのadd/commit/push、repo作成、token/Pages/DNS/CNAME、実workflow・実配信・案内ON・Goal有効化は禁止。datasheet、ゲーム生成物、保存writer/codecは変更しない。
