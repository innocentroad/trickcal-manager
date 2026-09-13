# C1/C2レビュー：Git判定の簡素化から確定版準備へ

2026-09-14。今回はレビュー・文書設定のみ。

## レビュー結果

C1の出力削除境界、検査証拠のrelease束縛は修正済み。candidateと生成物の照合、変更後拒否の実装も確認した。`node tools/test-public-site-staging.js`を今回再実行し、終了コード0。P5aおよび以前のSW・転送証拠は維持する。

**[P2] Git失敗時にcleanを推定している。** `tools/public-site-candidate.js`のreadGitStateはgit実行失敗時にHEAD/indexを独自解析する。workingTreeDirtyFromIndexはファイルサイズと秒単位の時刻・独自ignore判定を見るが、indexとHEADの差分を調べない。したがってstaged変更を含む状態をcleanと誤認し得る。`tools/test-public-site-staging.js`のclean fixtureも実Git repoではなく、HEAD/indexを手作成してこのfallbackを通しているため、実Gitでのclean候補成功の証拠にはならない。

これはGit一般の再実装を求める指摘ではない。逆に独自判定を削り、Gitが使えないときは候補作成を拒否することで閉じる。C1は達成維持、C2はこの限定補修待ち。候補生成は公開そのものではなく、現行dirty repoから公開が行われたわけではない。

## 次回Luna指示

親とManagerのAGENTS.md、GOAL.md、STATUS.md、本書を読む。既存未コミット変更を保持し、開始時の変更境界を記録する。

### G1：Git失敗時の推定をやめる（約0.5〜1単位）

- public-site-candidate.jsのreadGitStateはgit rev-parse／status成功を正とする。失敗時はavailable:false／dirty:true等で候補を拒否し、短い理由を返す。HEAD/index/ignoreの独自解析fallbackを廃止する。他の生成ツールの情報表示用fallbackまで一括改修しない。
- clean成功テストを、専用一時ディレクトリの実`git init`／ローカルfixture commitで作る。fixture内だけのcommitは検証操作として許可し、実repoのcommit・indexは触らない。repo-localのテスト用identityを指定し、global Git設定は変更しない。
- 同じ候補判定入口でclean成功、`git add`済み未commitの変更の拒否、Git実行失敗の拒否を確認する。Gitが使えない環境では成功を捏造せず、必要な実行環境だけ報告する。既存staging境界・証拠欠落・変更後拒否テストは再利用する。
- 変更JSの構文、test-public-site-staging、git diff --checkを確認する。保存・ブラウザ・全公開物の検証は繰り返さない。

合格条件G1：Gitが保証できないcleanを候補として採用せず、実Gitのclean fixtureを受理する。

### G2：配信処理とworkflowテンプレート（約1〜2単位）

G1合格後はレビュー待ちで止めず、そのまま進む。詳細契約はstorage-release-contract.md末尾の「ローカル配信準備」を正とする。

- 既存candidate／stagingを入力に、profileごとの成果物を検査して受渡し先へ反映するtoolsを実装する。dry-runを既定とし、今回の書込み先は専用tmp内のダミー配信repoだけに限定する。実remote操作や実repoの変更は行わない。
- 受渡し前後で対象candidate、profile、ファイルhashを照合する。削除対象は前回配信台帳で所有が確認できるファイルだけ。`.git`、`.github`、事前設置workflow、未知の手置きファイルを保護する。候補不適合・同名衝突は変更前に拒否する。
- source側の生成／検査／candidate／staging／受渡しと、受信repo側のPages artifact化／配信のworkflowテンプレートをdocs/templatesへ作る。legacy artifactのbase二重化を避ける。実`.github/workflows`へ設置しない。
- 実workflow化に必要なGitHub Actions・Pages・token・起動方法は、実装時に公式資料で確認する。権限は最小限とし、tokenを成果物・URL・ログへ埋め込まない。テンプレートの起動条件、承認environment、入力commit／digest、失敗時停止を明示する。新側失敗を旧側の公開や案内ONへ連鎖させない。

合格条件G2：実配信に使う処理とテンプレートがローカルで揃い、未承認の実環境に副作用を起こさない。

### G3：ダミー配信先で代表確認（約1単位）

- 専用tmpの実Git fixtureを送信元／配信先として、clean候補→staging→受渡し→配信artifact相当のrootまで本番と同じtoolsで確認する。fixture内のgit init/add/commitは許可する。実repoのindex・commit・remoteは触らない。
- 正常new／legacy抽出、同じ候補の再実行で不要差分なし、版不一致で変更なし、前回所有の不要ファイル削除とworkflow／未知ファイル保持、途中コピー失敗で配信用commit・配信に進まないことを代表確認する。失敗注入の全組合せは不要。
- 作業用の一時コピーで検査してから受渡す。途中失敗時は未完了とし、最後の成功配信を完了扱いで上書きしない。ローカル複数ファイル操作を原子的な配信と称さず、公開の確定は後段の検査済みcommit／Pages deploymentで行う。
- 変更JS構文、関係するcandidate/staging／受渡しテスト、workflowテンプレートの構文・入力参照、差分を確認する。実GitHub実行やDNS/HTTPSは未検証として分離する。保存・ブラウザの再検証は不要。

合格条件G3：正常と主要失敗経路を同じ受渡し処理で確認でき、旧案内OFF／既存workflow保護が維持される。C-T2のローカル証拠であり、実配信合格ではない。

### G4：実repo確定と公開準備の承認資料（文書のみ、約0.5単位）

G3合格後にそのまま進む。既存手順docs/templates/storage-p5b-local-staging.mdを更新し、以下を短くまとめる。新しい検証基盤は不要。

1. 実repoの未コミット変更を機能単位に整理し、確定commitの対象案を提示する。大量の変更に今回以外のものがあるため、無断でgit add/commitせず、除外・未確認も明示する。
2. 現行`.github/workflows/pages.yml`はmain pushで配信されるため、commitとpushを分ける。確定commitのみの承認、実workflow切替／pushに伴う公開の承認を混同しない。旧URL・バックアップ維持を前提に公開物のnew/legacy rootとworkflow差分案を文書で示す。
3. 承認後の順序を「確定commit→clean生成／checks／candidate／staging→成果物repo・権限・Pages/DNS準備→新側案内OFF公開→実Origin確認→旧案内の別承認」とする。公開承認は実配信より前に置く。
4. 利用者への承認事項をまとめる：確定commit対象、成果物repo名、外部設定・workflow範囲、初回公開。tokenは利用者が安全な設定画面へ登録し、チャットへ貼らせない。現在のdirty成果物を承認だけでclean扱いしない。

合格条件G4：利用者が次に何を承認／操作すれば進めるかが具体的で、実装や検証を不必要に続けない状態になる。

## 記録と停止

各開始前にG1〜G4の対応条件を示し、終了後STATUS・受入台帳へ証拠・未達・残見積もりを記録する。合計約3〜4.5単位。各合格後は次へ連続して進み、G4後は承認待ちで停止する。未解決の保存契約変更・外部権限が必要な場合だけ判断事項を報告して停止する。環境阻害や同じtimeoutを反復せず、3単位連続で実質進捗がなければ再計画する。P5a/C1の成功は撤回せず、無関係な検証を追加しない。

実repoのgit add/commit/push、実workflow変更・起動、repo作成、token/DNS/Pages/CNAME設定、実配信、移行案内ON、自動実行Goal有効化は禁止。datasheet・ゲーム生成物・保存writer・codecは変更しない。外部承認がないことを理由に局所検証を追加し続けない。
