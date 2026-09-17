# Trickcal Manager ローカル指示

親ディレクトリの `AGENTS.md` を優先し、このファイルではManager固有の手順だけを定める。

- `tools/trickcal_datasheet.xlsx` が元データ。datasheetを直接編集せず、TSV作成とExcelへの貼り付けを分ける。
- xlsx更新後の標準入口は `tools\generate-all.bat`。生成済みデータ、編成共有辞書、共有表示データ、共有資材の版同期、公開前検査まで完了させる。
- 共有辞書の既存配列は公開済み番号台帳。既存IDの並べ替え・削除・再利用をせず、新規IDだけを末尾へ追加する。
- 公開前の読み取り専用検査は `node tools/validate-formation-share-maintenance.js`。共有資材の版だけを更新する場合は `node tools/sync-formation-share-assets.js --write` を使い、完了後に検査を再実行する。
- `formation-share-display-data.js` は生成物で、手編集しない。元データを変えた場合は表示データ生成工程を通す。
- 公開サイトのroute／profile／alias／fixture／明示assets／Service Worker設定は `tools/public-route-manifest.json` を唯一の定義とする。通常公開の入口は `node tools/public-site-publication.js prepare --previous-release FILE`。生成・Manager全検査・checks・candidate・stagingをまとめて行う。旧来の個別公開検査をその後に重ねて実行しない。詳細は `docs/publication-runbook.md`。
- 公開生成はmanifestに列挙した資材だけを対象とし、docs、xlsx、tests、secretsを混入させない。新profileの `/` と旧profileの `/trickcal-manager/`、index alias、query/hashを保持し、SPA化や全pathの管理画面転送を追加しない。
- 公開側の新しい共有URLは `/share/#payload` を正規形とし、公開routeへ `v` queryを付加しない。動的画像、iframe、Worker、preload、ページ遷移は `public-site-runtime.js` のprofile-aware helperを使い、個別にbase pathを再実装しない。
- Service Workerはprofileごとにscope／cache namespaceを分離し、待機型更新を維持する。無条件の `skipWaiting`／`clients.claim`、transfer／recovery／unknown navigationのcache、他profileのcache削除を追加しない。
- `public-site-release.json` の `status: local-only-unpublished` または `dirty: true` は未公開・未確定の印である。`sourceCommit` をcleanな公開版の証拠として扱わず、公開設定変更、workflow／CNAME／DNS、commit／pushは明示依頼なしに行わない。
- 公開用の別local Origin検証では新／旧profileを別ポートで配信し、確認終了後に一時HTTPサーバーを停止する。モバイル幅を指定した一時viewportは確認後にresetする。
- 編成共有の永続番号・表示情報・資材同期の仕様は `docs/formation-share-maintenance-design.md`、実装完了条件は `docs/formation-share-maintenance-goal.md`、datasheet skillとの接続は `docs/formation-share-maintenance-skill-integration.md` を参照する。
- 未コミット変更を維持し、`git reset --hard` や `git checkout` による一括復元を行わない。commit／pushは依頼された場合だけ行う。

## 役割別の参照先

- 共通の安全条件・モデル選択は適用されるAGENTS.mdに従う。モデル別に公開手順を複製しない。
- 公開に関する指令・引き継ぎ文を作る場合だけ `docs/publication-task-authoring.md` を読む。指令作成の依頼自体では実装・公開を開始しない。
- 公開を実行・レビューする場合は `docs/publication-runbook.md` を参照する。指令作成を兼ねない実行担当に作成用要綱の追加読了を要求しない。

## 通常公開の最短経路

- 継続sourceはこの `release-source` worktree。初回復元handoffやdirtyな元mainから毎回合成しない。通常データ更新の標準生成を実行済みなら、同一入力への再生成・個別データテストを追加しない。
- 開発中は `public-site-publication.js check`。dirtyなsourceで検証できるが公開candidateは作らない。prepareにはcleanなsource commitと前回公開releaseが必要。
- Git子プロセスのEPERMは実行環境の承認経路で対処し、cloneを増やさない。clean判定・checksを偽装しない。
- 生成後の改行調整・内容編集・台帳hash書換えは禁止。転送は既存のbyte copyを使い、対象限定stage後とcommit後にcandidate対Git照合を行う。失敗時はpushしない。
- 公開承認がある場合だけ対象限定commit/pushする。移行中のdualでは新サイト成功・identity確認→同じ候補の旧サイト。移行完了の明示判断後はpublication-targets.jsonをnew-only/frozenとし、旧サイトを通常公開の条件から外す。設定値の変更だけで閉鎖・削除・DNS変更をしない。
- GitHub入口は `tools/publish-public-site.js`。既定は計画のみ、公開実行は `--execute` が必要。通常deployment承認代行は当該runに明示依頼がある場合のみ `--approve-deployments` を使う。自己承認禁止等は報告して停止し、設定変更・迂回をしない。dispatch結果不明なら再起動せずrunを確認する。
- verifyはreceipt v2必須（未指定なら自動解決）。途中停止は表示された `stage --receipt FILE` から再開し、再生成・再転送しない。成功記録はbackups/publication-historyに配信先別保存、prepareは前回new成功のrelease記録を利用する。
- 新規スキル、永続検査キャッシュ、汎用再開基盤は追加しない。既存bundleとreceiptで停止工程から再開する。
