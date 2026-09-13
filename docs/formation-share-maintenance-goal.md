# Luna向けGoal：編成共有の追加更新工程を整備する

2026-09-12。Astra設計完了、Luna実装完了。第1〜第4スライス完了、残り0スライス。自動実行Goalを設定済み。

## 目的と設計の正

新規使徒・遺物・スペル・権能の追加を通常の生成工程から共有URLとPNGへ反映できるようにし、辞書漏れ・旧URL破壊・資材更新漏れを公開前に検出する。

設計の正は[保守設計のAstra確定事項](formation-share-maintenance-design.md#astra確定事項lunaの実装契約)。共有値固定／最新表示という互換方針を採用する。コード・生成物・実行用テストの変更はLunaが担当する。

## 完了条件

- C1：公開済み番号と既知URLの意味が不変。新規IDの末尾追加、既存番号変更検出、後続追加分のprefix保護が動く。
- C2：Sherum、Barie、artifact_sherum_parchment_scrollの不足を標準工程で解消。全共有対象の漏れを検出し、ID消失を黙って削除しない。
- C3：生成済み表示データで同じ共有本文を描画。新規対象・既存編成・全スペル・画像欠落・両テーマのPNGを確認する。
- C4：共有資材の参照を内容ハッシュで同期。再実行で差分ゼロ、checkは書込ゼロ。古い資材がキャッシュされた環境でも更新した共有内容を表示する。
- C5：標準生成入口と単独の共有更新／検査が使える。push補助とPagesは同じ非変更検査を実行し、不正な候補コミットを配信しない。
- C6：README・Manager AGENTS・仕様・既存生成／TSV skillから参照する接続手順を更新。実行方法、未対応・未検証、各スライスの根拠をSTATUSに記録する。環境提供skill本体は直接変更せず、適用内容をリポジトリ内に残す。

## スライス

| 順 | 実装範囲 | 対応条件 |
| --- | --- | --- |
| 1 | 現行公開番号fixture・既知URL、辞書check/write、追加後互換検査、generate-all接続。不足3IDを解消 | C1・C2 |
| 2 | 表示データ生成と描画参照切替、既存画面／PNG同等性 | C3 |
| 3 | 共有資材ハッシュ同期、単独更新、再実行・旧キャッシュ検証 | C4・C5の生成側 |
| 4 | 候補コミットを検査する公開前入口、push／Pages接続、指示・skill・仕様更新、最終受入 | C1〜C6 |

開始前に次のスライスで行うことと対応完了条件を示す。終了後、達成度・実行した検査と結果・未確認・残りスライス見積もりをSTATUSへ記録する。3スライス連続で実質的な進展がなければ再計画案を提示する。初期見積もり4スライス、第1〜第3スライス完了、残り1スライス。

## 進行記録

第1スライス完了。`tools/sync-formation-share-catalog.js`と`tools/fixtures/formation-share-catalog-v1.json`、`tools/test-formation-share-catalog.js`を追加した。生成データと現行catalogの照合で未登録3件を検出し、`--write`で既存番号を変えずに末尾追記した。`--check`、追記の再実行、公開済みprefix、並べ替え、ID消失の検査を成功させた。第1スライス100%、Goal全体約25%、残り3スライス。

第2スライス完了。`tools/generate-formation-share-display-data.js`と生成済み`formation-share-display-data.js`を追加し、受信ページの表示責任を計算用`statData.js`／`cards.js`から分離した。新規使徒・遺物を含む共有ページ、画像の存在、Node上の生成一致を確認した。第2スライス100%、Goal全体約50%、残り2スライス。

第3スライス完了。共通画像を含む表示画像URLへSHA-256先頭16桁の内容版を付け、`tools/formation-share-asset-manifest.json`と`tools/sync-formation-share-assets.js`で共有HTML・ダッシュボード・先読み・共有ページ生成側の参照を依存順に同期した。`--check`の書込なし、`--write`、再実行差分ゼロ、旧キャッシュに対する版付きURL、実ブラウザPNG生成を確認した。第3スライス100%、Goal全体約75%、残り1スライス。

第4スライス完了。`tools/generate-all.bat`へ共有辞書・表示データ・資材同期・検査を接続し、`tools/validate-formation-share-maintenance.js`へ生成データ鮮度、公開fixture、比較元catalog、内容ハッシュの読み取り専用検査を集約した。push補助とPages workflowは同じ検査入口を呼び、Pagesのpushイベントではbefore SHA、手動実行では親コミットを比較元にする。Manager `AGENTS.md`、README、URL仕様、skill接続メモ、統合テストを追加・更新した。第4スライス100%、Goal全体100%、残り0スライス。xlsxの全生成工程とGitHub Actions実行は、datasheet・公開操作を伴うため未実施として記録する。

## 検証上の注意

新規IDを追加した一時fixtureと公開済み固定fixtureを併用する。既存辞書から毎回期待値を算出するだけのテストを避ける。実ブラウザによるPNG検査はソース文字列検査で代用しない。少なくとも390px・通常PC幅の操作と固定1200px PNG、両テーマを確認する。

CI失敗系はテスト用コピーで検査し、本番mainへ不正データをpushして試さない。公開前検査の設計ではCIでの浅いcheckout、before SHAの取得、workflow_dispatch、候補コミットと未コミット変更の違いを扱う。実際のGitHub実行はpush指示後の確認となるため、ローカル検証と区別して記録する。

アプリ変更が追加更新の範囲に収まるならLunaが最後まで実装する。Astraへ戻す条件は設計書A6以降を参照。

## 対象外

xlsxの直接編集、計算式・DPSの改変、URL v2、旧時点表示の完全保存、廃止／改名の自動移行、全面的なキャッシュ戦略変更、ネイティブ画像＋URL共有の再開、自動commit・push・公開は含めない。既存の未コミット設計変更を維持する。
