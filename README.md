# Trickcal Manager

Trickcalの使徒ステータス、編成、カード、ボード、編成ダメージを管理・計算する静的Webアプリです。
GitHub Pagesで配信することを前提に、ステータス管理画面とダメージ計算画面を別HTMLとして構成しています。

## 画面

- `stat-dashboard.html`: ステータス管理画面
  - 使徒の育成・装備・アサイド・スキル
  - 編成・カード・ボード・研究の管理
  - 状態の保存、読み込み、エクスポート、インポート
- `formation-damage-calc.html`: 編成ダメージ計算画面
  - 自分側・敵側の設定
  - 編成、遺物、スペル、シナジー、ステータス補正を反映したダメージ計算
  - 結果保存、敵プリセット、表示対象の切り替え
- `index.html`: `stat-dashboard.html` へのルート用リダイレクト

2画面は別HTMLですが、ステータスやテーマなどの状態はブラウザの `localStorage` を共有します。
画面遷移時はService Workerと先読み処理で共通データ・スクリプトの再読込を抑えます。

## 主な構成

### 画面・共通処理

- `stat-dashboard.html`, `stat-dashboard.js`: ステータス管理画面の入口と画面固有処理
- `stat-prototype.js`, `stat-prototype.css`: ステータス、編成、カード、ボード等の主要実装
- `formation-damage-calc.html`, `formation-damage-calc.js`: ダメージ計算画面
- `formation-damage-calc.css`: ダメージ計算画面のレイアウトとレスポンシブ表示
- `stat-engine.js`: ステータス計算共通処理
- `app-cache.js`: 画面遷移先のアセット先読み
- `service-worker.js`: 静的アセットのキャッシュとオフライン時のフォールバック
- `shared-topbar.css`, `image-preload.js`: 共通UI・画像先読み

### データ

- `statData.js`: ステータス、装備、アサイド等の生成データ
- `apostles.js`: 使徒・スキルデータ
- `cards.js`: 遺物・スペル・カード効果データ
- `synergy.js`: 性格・種族シナジー
- `enemy-presets.js`: 敵プリセット
- `presets.js`: 画面で利用するプリセット定義

## データの更新

元データは `tools/trickcal_datasheet.xlsx` です。Python 3を用意し、`tools/generate-all.bat` を実行すると、次のデータが更新されます。

- `apostles.js`
- `cards.js`
- `statData.js`

生成前のファイルと元Excelは `backups/generated/<timestamp>/` にバックアップされます。
生成スクリプトを個別に実行する場合は、`tools` ディレクトリから各Pythonスクリプトを実行してください。

## ローカル確認

ビルドツールは使用していないため、静的ファイルをHTTPサーバーで配信して確認します。例えばPythonがある場合は、プロジェクトディレクトリで次を実行します。

```text
python -m http.server 8000
```

その後、`http://localhost:8000/` を開きます。`file://` 直開きではService Workerや一部のブラウザ機能が動作しません。

## GitHub Pages

`.github/workflows/pages.yml` により、`main` ブランチへのpush、またはActionsからの手動実行でGitHub Pagesへデプロイします。
デプロイ対象はこのディレクトリ全体です。

## 注意事項

- `statData.js`、`apostles.js`、`cards.js` は生成物です。元データを更新した場合は生成手順を経て更新してください。
- CSSやJavaScriptの更新時は、HTMLのクエリ付きバージョンと `service-worker.js` の `CACHE_VERSION` も必要に応じて更新します。
- 旧版の `calculator/` はこのディレクトリとは別管理です。
