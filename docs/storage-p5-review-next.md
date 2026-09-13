# P5aレビューと次回Luna指示

2026-09-13。今回はレビュー・文書設定のみ。実装、公開、Goal有効化はしていない。

## レビュー

F0の旧入力破棄は合格。今回`test-storage-transfer-page.js`、`validate-public-site.js`、`test-public-site-http.js`、生成`--check`を再実行して成功した。生成物の2164登録パス／資材の検査と再生成整合を確認した。Lunaの主要画面・PNG・モバイル幅の証拠は再利用し、今回ブラウザで独立再実行したとは扱わない。

### [P2] 更新用SWがreleaseに接続していない

`service-worker.js:2`のCACHE_VERSIONとPREVIOUS_CACHE_VERSIONは固定値。`tools/generate-public-site.js:635`付近ではassetをそのままコピーし、manifestのSW情報を実SWへ生成接続していない。生成SWとソースSWはbyte単位で同一だった。アプリだけ変更して再生成してもSW本体は変わらず、releaseごとのcache分離／直前release保持を満たさない。Lunaの手動変更したテスト用SWのwaiting成功はブラウザ機構の証拠として有効だが、通常の二回の生成で更新できる証拠ではない。

### [P2] derivedVersionsが最終成果物でなくソース版

`tools/generate-public-site.js:504`付近でソースをhashし、release記録へ格納する。診断ではformation-share.htmlの記録版とソース版が`66f50909d0e64a5e`、新側生成HTMLの正規化hashは`e796026612612187`だった。contentDigest自体は最終成果物を対象にしているため全面的な版管理破損とは判断しないが、最終版として誤読される記録は修正する。dependencyOrderの文字列だけで依存順同期を実施済みとは扱わない。

### 公開前残件（上記の修正以外で作業を膨らませない）

- index.html別名は正規ファイルと同一出力だが、正規化処理は未接続。`/calc/index.html`等は表示可能なので重大障害とはしない。下記URL代表確認時にpathname完全一致の一段正規化を追加し、query/hashを保持する。
- 生成transferで確認したのは起動とbackupまで。旧ソースページのH2正常転送は再利用可能だが、生成URLでの往復を確認したことにはならない。下記で1例だけ補う。

判定：F0完了、P5aの主要機能・生成の成功は維持。P5A-2の更新版接続とP5A-3のその実証が部分達成。P5a無条件完了／即配信可とはしない。保存基盤検証のやり直しは不要。

## Luna実施指示

親・ManagerのAGENTS.md、GOAL.md、STATUS.md、本書、storage-release-contract.mdを読む。URL/SW契約はpublic-url-gate-c-design.mdを必要部分だけ参照する。本書を次の実施順とし、既存未コミット変更を保持する。

### U1：更新版と生成記録の限定補修（約1単位）

対象はgenerator、SW、必要なmanifest/検査、記録文書。保存writer・codec・datasheet・ゲームデータは変更しない。

- 生成入力に基づく安定release識別子を生成SWへ注入する。自分自身をhashする循環は避け、テンプレート／入力内容から算出する。通常のアプリ資材変更→生成でSWも変わるようにする。既存待機・scope・非cache・所有cache限定を維持する。
- 直前releaseは前回の検査済みrelease情報を明示入力する等、実際に保持する版を根拠付きで決める。固定の仮previous値を残さない。初回はpreviousなしを許す。ソース検証と生成profileの設定を区別し、台帳のSW情報と実SWの二重管理を避ける。
- source由来の版はsourceVersions等と明示し、最終成果物の版／hashと区別する。既存contentDigest・profile outputDigestを活用し、最終ファイルhashの記録と参照の整合を確認する。不要な第二のhash基盤は作らない。
- 同じ入力の再生成は安定、アプリ資材変更でrelease/SWが変わる、最終記録と出力が一致する焦点テストを実生成入口へ追加する。アプリ資材の変更は隔離fixture内に限定し、ゲーム生成物を編集しない。

合格条件U1：通常生成だけで更新を識別でき、cache現行／直前の根拠と最終版記録が整合する。合格後U2へ進む。

### U2：変更した経路の代表確認（約1単位）

- generatorから生成した実際の二releaseを同一の独立local Originで順に配信し、旧タブ中のwaiting／自動reloadなし→閉じて再起動後に新版を確認する。SW応答だけを手動で差し替えて代用しない。現行＋直前cacheと無関係cache保持を確認する。
- `/calc/index.html`等の正規化を生成時に接続し、canonical自身をループさせず、代表query/hashを保持することを確認する。未知URLを管理へ転送しない。
- 新旧生成物の独立2 Originで、非空の既存fixtureを使った直接転送1例と同一packageのファイル復元1例を確認する。tools専用gateで実クリック→preview→明示apply→再読込み、保存計算保持を既存runnerで確認する。公開gateはOFFのまま。以前の失敗注入全件は繰り返さない。
- 変更JS構文、生成check、公開validate/HTTP、変更に関係するpublic-siteとtransferテスト、差分を確認する。画像や全画面の再検証は当該経路に変更がなければ既存証拠を再利用する。

合格条件U2：生成更新と生成転送の代表証拠が得られ、P5a残条件が閉じる。環境阻害なら同じtimeoutを反復せず未達を明示する。合格後U3へ進む。

### U3：P5bのローカル配信準備（約1単位、実配信なし）

- storage-release-contractの二公開先方式を維持。new成果物とlegacy成果物をprofile台帳から別のstaging rootへ抽出するdry-run入口を整備する。旧Pagesのartifact rootには`trickcal-manager/`を二重に入れず、旧baseの中身を渡す。new側へlegacy一式やtools/docsを混入させない。
- cleanなcommit、検査結果、期待profile/content digestを照合できない成果物を配信候補として拒否する。local-only/dirty成果物の扱いを明示する。確認のためcommitせず、clean/dirtyの受入は隔離fixtureで検査してよい。
- 配信workflowの案はdocs配下の文書／テンプレートとして作る。実`.github/workflows`は変更・起動しない。新側への受渡しで既存workflowや.gitを上書きしない手順、失敗時に旧側案内OFFを維持する条件、sourceCommit/profile/digest照合、案内停止とデータを戻さないrollback手順を記載する。
- 実施時に必要な新repo作成、権限、token登録、DNS/Pages、公開承認を一覧にする。値や資格情報を取得・出力しない。外部サービスの現行仕様に依存するworkflow詳細を確定する場合だけ公式資料で確認する。

合格条件U3：ローカルstaging検査と配信手順案が揃い、利用者が行う外部操作・承認範囲が具体的になる。これはC-T2の準備であり、実配信失敗テストやP5b全完了とはしない。

## 記録・停止

各開始前にU1〜U3の対象条件と変更境界を示す。終了後STATUSと受入台帳へ成功証拠・未達・残見積もりを記録する。見積もり計3単位。合格後は次へ進み、無関係な細部を出口条件に追加しない。

U3後にP5a判定、P5b外部準備、P6残条件を報告して停止。repo作成・token/DNS/Pages設定・実workflow変更・実配信・移行案内ON・commit/push・自動実行Goal有効化は行わない。保存API変更が必要なら推測実装せず停止する。
