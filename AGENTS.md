# Trickcal Manager ローカル指示

親ディレクトリの `AGENTS.md` を優先し、このファイルではManager固有の手順だけを定める。

- `tools/trickcal_datasheet.xlsx` が元データ。datasheetを直接編集せず、TSV作成とExcelへの貼り付けを分ける。
- xlsx更新後の標準入口は `tools\generate-all.bat`。生成済みデータ、編成共有辞書、共有表示データ、共有資材の版同期、公開前検査まで完了させる。
- 共有辞書の既存配列は公開済み番号台帳。既存IDの並べ替え・削除・再利用をせず、新規IDだけを末尾へ追加する。
- 公開前の読み取り専用検査は `node tools/validate-formation-share-maintenance.js`。共有資材の版だけを更新する場合は `node tools/sync-formation-share-assets.js --write` を使い、完了後に検査を再実行する。
- `formation-share-display-data.js` は生成物で、手編集しない。元データを変えた場合は表示データ生成工程を通す。
- 公開サイトのroute／profile／alias／fixture／明示assets／Service Worker設定は `tools/public-route-manifest.json` を唯一の定義とする。`tmp/public-site/` の生成物を手編集せず、`node tools/generate-public-site.js --write` → `--check` → `node tools/validate-public-site.js` → `node tools/test-public-site.js` → `node tools/test-public-site-http.js` の順で確認する。
- 公開生成はmanifestに列挙した資材だけを対象とし、docs、xlsx、tests、secretsを混入させない。新profileの `/` と旧profileの `/trickcal-manager/`、index alias、query/hashを保持し、SPA化や全pathの管理画面転送を追加しない。
- 公開側の新しい共有URLは `/share/#payload` を正規形とし、公開routeへ `v` queryを付加しない。動的画像、iframe、Worker、preload、ページ遷移は `public-site-runtime.js` のprofile-aware helperを使い、個別にbase pathを再実装しない。
- Service Workerはprofileごとにscope／cache namespaceを分離し、待機型更新を維持する。無条件の `skipWaiting`／`clients.claim`、transfer／recovery／unknown navigationのcache、他profileのcache削除を追加しない。
- `public-site-release.json` の `status: local-only-unpublished` または `dirty: true` は未公開・未確定の印である。`sourceCommit` をcleanな公開版の証拠として扱わず、公開設定変更、workflow／CNAME／DNS、commit／pushは明示依頼なしに行わない。
- 公開用の別local Origin検証では新／旧profileを別ポートで配信し、確認終了後に一時HTTPサーバーを停止する。モバイル幅を指定した一時viewportは確認後にresetする。
- 編成共有の永続番号・表示情報・資材同期の仕様は `docs/formation-share-maintenance-design.md`、実装完了条件は `docs/formation-share-maintenance-goal.md`、datasheet skillとの接続は `docs/formation-share-maintenance-skill-integration.md` を参照する。
- 未コミット変更を維持し、`git reset --hard` や `git checkout` による一括復元を行わない。commit／pushは依頼された場合だけ行う。
