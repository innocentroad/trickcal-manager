# Trickcal Manager

Trickcalの使徒ステータス、編成、カード、ボード、編成ダメージを管理・計算する静的Webアプリです。
GitHub Pagesで配信することを前提に、ステータス管理画面とダメージ計算画面を別HTMLとして構成しています。

## 画面

- `stat-dashboard.html`: ステータス管理画面
  - 使徒の育成・装備・アサイド・スキル
  - 編成・カード・クレヨンボード・研究の管理
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

## データの更新

元データは `tools/trickcal_datasheet.xlsx` です。Python 3を用意し、`tools/generate-all.bat` を実行すると、次のデータが更新されます。

- `apostles.js`
- `cards.js`
- `statData.js`

生成前のファイルと元Excelは `backups/generated/<timestamp>/` にバックアップされます。
生成スクリプトを個別に実行する場合は、`tools` ディレクトリから各Pythonスクリプトを実行してください。

シート内容を検索・検証する場合は、Excelを一度だけTSVへ展開できます。出力先の `tmp/` はGit管理外です。

```text
py -3 tools/export-datasheet-tsv.py --input tools/trickcal_datasheet.xlsx --output-dir tmp/datasheet-tsv
```

効果シートの既存条件文と同一効果内の持続時間・クールタイム行から、DPS用の発動条件・適用条件・処理グループを候補変換する場合は次を実行します。元Excelと展開元TSVは変更せず、変換結果と要確認一覧を `tmp/effect-runtime-candidates/` に出力します。教主の権能効果に残る旧列配置も候補側だけで補正します。ぬいぐるみの意志・睡眠・巨大化・演奏は固有状態として扱い、候補側で状態付与行と持続時間行へ分割します。

```text
py -3 tools/convert-effect-runtime-columns.py
```

全候補は `変換候補.tsv`、曖昧な複合条件などは `要確認.tsv` で確認し、確定後に必要な行だけdatasheetへ反映します。

## GitHubへのpush

コミット済みの変更を現在のブランチへpushする場合は、`tools/git/push.bat` を実行します。

```text
tools\git\push.bat
```

未コミットの変更をすべてステージしてからcommit・pushまで行う場合は、コミットメッセージを指定します。

```text
tools\git\push.bat --commit "変更内容"
```

### 敵プリセットの追加

`enemy-presets.js` の敵名は `name` に純粋な名前だけを記述し、コンテンツと段階は `content` で分けます。

```js
{
    name: "M.E.O.W",
    content: { type: "eliasFrontier", stage: 6 }
}
```

`type` は英語版のコンテンツ名に由来するIDを使用します。ダンジョンだけは `type: "dungeon"` とし、`mode` に `secretBakery`、`goldThiefAttack`、`sugarFree`、`getYourCrayon`、`cloneFactory` のいずれかを指定します。

進軍は難易度・World・ステージを別々に指定します。`difficulty` は `mild`（微辛）、`medium`（中辛）、`hot`（激辛）です。

```js
{
    name: "敵名",
    content: { type: "crusade", difficulty: "medium", world: 12, stage: 7 }
}
```

```js
{
    name: "バンク蔵-憂鬱",
    content: { type: "dungeon", mode: "goldThiefAttack", stage: 24 }
}
```

エーリアスフロンティアの `stage` は微辛1・微辛2・小辛1・小辛2・中辛1・中辛2・麻辣1・麻辣2の順に1～8です。将来用の表示定義として、9を激辛1、10を激辛2に割り当てています。旧IDの `dimension`、`ef`、`gta` と、名前に分類を含めた旧形式も読み込み時に変換されます。

敵の詳細では正式なコンテンツ名を表示し、敵選択リストでは次元の衝突を「次元」、エーリアスフロンティアを「EF」と省略します。
ダンジョンは内部の親分類としてのみ扱い、選択リストと分類欄にはGTAなどの各`mode`名を表示します。
敵の性格は名前に含めず、プリセット直下の `personality` に「純粋」「冷静」「狂気」「活発」「憂鬱」のいずれかを指定します。

コンテンツ固有ルールは `ENEMY_PRESET_CONTENTS` 側に定義します。エーリアスフロンティアはシナジー無効・4年生固定、次元の衝突はスペル使用不可・6年生固定です。次元の衝突の遺物上限はstageを3で割った余りが1なら5、2なら9、0なら13です。

状態異常ダメージ弱点は `weakness.statusDamage.otherP` にその他倍率の加算値を記述します。ケルベロスは火傷・毒・苦痛・凍傷の行動選択時のみ、その他倍率へ1000%を加算します。

特定の状態異常中に被ダメージ量が増える弱点は `weakness.statusTakenDamage` に `{ status: "感電", add: 30 }` の形式で記述します。ダメージ計算では防御側の状態を選択した場合のみ被ダメージ量へ加算します。

敵の攻撃で防御側へ付くスタック式デバフは `modifiers.targetDebuffs` に記述します。R41リニュアの破壊は `breakTakenDmg: { perStack: 5, maxStacks: 9 }` とし、1スタックごとに自キャラの被ダメージ量を5%増加させます。

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
