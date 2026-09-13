# Luna：最小補修からP5aまで

2026-09-13。今回は指示設定のみ。自動実行Goalは有効化しない。Lunaへ開始指示を渡した後は、下記の合格した単位から次へ連続して進める。

## 目的・範囲

旧サイトの保存データと既存URLを維持し、新ドメイン用の短いURLを持つ公開成果物をローカルで完成させる。P5a＝生成・接続・検証まで。P5b＝実配信準備／外部設定、P6＝公開Origin・実機確認は別作業。P5全体完了や公開済みとは報告しない。

読むもの：親とManagerのAGENTS.md、GOAL.md、STATUS.md、本書。F0ではstorage-p4-file-input-review.md、P5aではpublic-url-design.md、public-url-gate-c-design.md、public-site-future-plan.md、storage-release-contract.md。過去指示のP4後停止は本書で置き換える。保存契約・codec・永続IDの変更は許可しない。

未コミット変更をすべて維持する。着手時に対象ファイルと既存変更境界を記録し、既存のworkflow等の変更を今回の成果と混同しない。

## 実施順と完了条件

### F0：入力切替の最小補修（約0.5〜1単位）

ファイル実選択時に旧decoded/文字列/previewを消し、読込み成功まで復元操作を無効にする。ダイアログ取消と既存適用中ガードは維持。不正B選択後に旧Aをplan/applyできない回帰テストを1件追加する。既存transfer/pageテスト、変更JS構文、差分を確認する。

合格条件F0-1：不正入力の後に旧対象を復元できず、既存正常転送が成功する。複雑な遅延・取消の組合せ検証を追加必須にしない。H1/H2を再実行しない。合格でF1残件を閉じ、P5aへ進む。

### P5a-1：台帳と二profileの生成入口（約1単位）

完了条件P5A-1：単一manifestから旧baseと新baseの入口を生成し、schema・衝突・互換URL検査を通す。

- tools/public-route-manifest.jsonとschema、生成・検査コマンドを整備する。schemaVersion=1、profiles/routes/reservedPaths、未知項目拒否、source/generator排他、profile別publicPath/kind、alias/target、fixture、asset/SW設定を既存Gate Cどおり具現化する。JSONの具体的な入れ子・関数名はLunaで決定して文書化してよい。
- 新側home `/`→静的 `/manager/`転送、manager `/manager/`、damage `/calc/`、share `/share/`、data `/data/`、enemies `/data/enemies/`、board `/data/boards/`、transfer `/transfer/`。復旧ページも独立した保守入口として必要依存ごと保持する。
- 旧側は `/trickcal-manager/` の既存HTML入口を維持し、新Originへ自動転送しない。旧toolsボード互換だけを必要なHTMLとして生成する。旧未公開案のaliasは増やさない。
- 正規routeとそのindex.htmlは同じ生成ファイルであり、二重出力しない。index.htmlからの正規化はpathname完全一致時だけ発動させ、末尾slash入口を転送ループにしない。aliasは一段、search/hashは再serializeせず保持する。
- 出力は検証済みの専用tmp子ディレクトリへ分離する。ソースの全面移動・一括文字列置換・SPA化はしない。明示した公開ページと必要資材だけを含め、docs/xlsx/tests/secrets等を除外する。
- schema違反、alias衝突、生成ファイル衝突、自己転送の代表反例を本番生成検査入口へ通す。検出器を汎用化する作業にはしない。

### P5a-2：ページ・共有・資材版・SW接続（約1〜2単位）

完了条件P5A-2：生成後の両profileで内部リンク・画像・Worker・共有iframeが正しいbaseへ解決し、最終内容に資材版が一致する。

- pageUrl/assetUrlをGate Cの責任範囲で接続する。HTML属性は生成時、CSS/Worker内部は各資材位置に基づいて解決する。新規共有URLのみ短い正式 `/share/#payload`、ローカル画像iframeは同一検証Originを維持する。公開承認前のソース／旧サイトで共有先を先行切替しない。
- data一覧は既存主要ページの上部バー構造・CSSを再利用し、敵・ボードのリンクを置く。manager/calcは同列の主要導線を維持する。全面的な共通UI再設計は不要。
- 版生成順を固定：profile別配置・参照変換→直接資材の版→共有HTMLの版→それを参照するshare-create→app-cache→最終HTML参照→release記録。既存sync-formation-share-assetsの依存順・hash方式を再利用し、必要なら出力root指定を追加する。ソース版を変換後の最終内容hashと偽らない。
- 共有HTMLがapp-cache等を参照して循環する場合、ページ版入力から明示した派生参照の版値だけを正規化除外する等、依存循環を1箇所で断つ。除外規則と再生成安定性をテストし、全資材変更が検査できるよう最終release記録には実ファイルhashを残す。独立した第二の版管理を作らない。
- release記録はsourceCommit/profile/route版/資材版を持つ。dirty作業中はsourceCommitだけで内容同一とせず、入力内容digestとdirty表示を付ける。ローカル成果物を配信可能な確定releaseと誤認させない。自己参照するrelease記録自身はそのhash対象から除く。
- SW登録URL/scope/cache名をprofileに固定。Gate Cどおり待機型更新、既知routeのnetwork-first、所有cacheのみ管理、移行・救出navigation非cacheを接続する。旧保存データ削除、無条件reload、旧から新への強制転送はしない。移行案内・直接転送の公開gateはOFFを維持する。
- アプリHTML/JS/CSS、app-cache/SW、共有資材同期ツールの局所変更は本P5aの許可範囲。datasheet・ゲーム生成データ・共有codec/番号台帳・保存writerは変更禁止。workflow/CNAME/DNS/Pagesは変更しない。

### P5a-3：生成物の代表検証と引き渡し（約1単位）

完了条件P5A-3：両生成物をHTTPで確認し、主要機能・既存URL・共有画像・更新の代表証拠と公開前残件が揃う。

- 既存独立ブラウザ環境を再利用し、新 `/` と旧 `/trickcal-manager/` を別のローカルOriginで配信する。全登録入口のHTTP到達・静的資材・alias/search/hashを機械確認する。ホストのslash正規化の実Pages確認はP6へ残し、ローカル結果を本番証拠と呼ばない。
- 本番生成ページでmanager/calc起動と相互リンク、DPS計算とWorker、敵preset、board apostle/zoom、同じ共有payloadの新旧表示、両テーマのPNG生成を代表確認する。data一覧のPC/スマホ幅も確認する。
- 生成したtransfer入口で既存の正常転送／ファイル復元の代表を再利用・実行する。保存全失敗注入は繰り返さない。受信先URL・依存不足・移行gate OFFを確認する。
- SW更新は旧ページ開放中のwaiting／自動reloadなし、閉じて再起動後の新版、旧alias/offline、他アプリcache保持、transfer非cacheを代表確認する。実公開Origin・モバイル実機はP6残件として分離する。
- 再生成の安定性、版整合、公開不要ファイル混入、変更JS構文、関係する既存共有/transferテスト、git diff --checkを確認する。環境阻害は分類して一度で記録し、同じtimeoutを反復しない。未確認は合格へ加算しない。
- README/必要なAGENTS手順へ台帳更新・生成・ローカル確認を記載する。追加専用skillは今回不要。P5bへ渡すコマンド、出力先、公開承認前の残件、停止・rollback方針を記録する。

## 進行管理と停止

各開始前に作業とF0-1/P5A-1〜3の対応を示す。終了後STATUSと受入台帳へ条件ごとの証拠・未達・残見積もりを記録する。P5A-1〜3はC-T1のローカル受入を分割したもので、C-T2/C-T3や実配信合格へ加算しない。

合格したら次の単位へ進み、毎回別レビュー待ちにはしない。既存契約内の局所不具合はその単位で直す。保存契約変更が必要、外部権限が必要、または単位が未達で安全に進めない場合だけ具体的残件を示して停止する。3単位連続で実質進捗がなければ再計画を提示する。無関係な隅の検証を完了条件へ追加しない。

F0＋P5aの目安は計3.5〜5作業単位。P5a終了後は成果とP5b/P6残件を報告して停止する。新repo作成・token登録・DNS/Pages/workflow/CNAME変更・実配信・移行案内ON・commit/push・自動実行Goal有効化は禁止。
