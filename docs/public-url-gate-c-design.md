# 公開URL：Gate C補足設計

2026-09-13。文書設計のみ。ルートは利用者の第一候補を採用し、以下の技術契約で実装を準備する。`/`の当面の転送と`/data/`一覧は確定済みだが、Gate Cの実装・配信検査は未完了のまま保持する。

## ルートと名称

正式Originは`https://trickcal.irlab.dev`。主要機能は`manager`→`/manager/`、`damage`→`/calc/`で、上部バーから相互移動できる同列のページとする。閲覧系は`enemies`→`/data/enemies/`、`board`→`/data/boards/`。共有は`share`→`/share/`、移行は`transfer`→`/transfer/`を維持する。論理IDはURL階層と独立させる。旧設計のdashboard IDは公開URLの互換対象ではなく、実装時に呼出箇所をmanagerへ統一する。

新規共有URLは`https://trickcal.irlab.dev/share/#<既存payload>`。公開用のv query、画像生成オプション、転送用の中継パスを付けない。codecと永続IDは維持する。`/`は将来の案内ページ用IDとしてmanagerと分けて確保する。

## alias、redirect、compatibility page

| 用語 | 責任 | 初期用途 |
| --- | --- | --- |
| alias | 正規ルートへの別名を台帳に宣言する。HTTP応答方式そのものではない | 新Originの旧HTML名、各routeのindex.html |
| redirect | URLを別の正規URLへ移す動作。HTTPと静的JS転送を区別して記録 | slash正規化はホスト、HTML別名は生成した静的転送ページ |
| compatibility page | 旧Originで必要機能を提供するページ。新Originへの転送だけで置き換えない | 旧管理・計算の保存読出し、バックアップ、移行案内 |

新Originの`/stat-dashboard.html`→`/manager/`、`/formation-damage-calc.html`→`/calc/`、`/formation-share.html`→`/share/`、`/enemy-status.html`→`/data/enemies/`、`/public/board-layout-preview.html`と告知済み`/tools/board-layout-preview.html`→`/data/boards/`を静的aliasとする。toolsディレクトリ全体を公開せず、互換HTML一枚を生成する。

旧Originの`/trickcal-manager/`、`index.html`、`stat-dashboard.html`、`formation-damage-calc.html`は旧Originで維持する。参照・共有の旧URLも初期移行では既存ページを維持し、過去toolsボード入口は同じ旧Origin内のpublicボード入口へ接続する。新旧移動をURL正規化へ混ぜない。旧Originに新側CNAMEを設定しない。

未公開の旧設計案`/enemies/`、`/board/`、`/dashboard/`は告知済みURLとは扱わない。公開履歴が判明したものだけaliasへ追加する。末尾index.htmlはルート生成規則から自動登録し、個別の二重台帳を作らない。

## 正規化とquery/hash

正規パスは末尾`/`付き。`/calc`→`/calc/`等のディレクトリ正規化はGitHub Pagesホストが担う配信条件とし、P5/P6で実HTTPのLocation・query保持・ブラウザhash保持を確認する。ローカルサーバーの成功だけを本番証拠にしない。期待挙動が得られない場合はCloudflareルール等の変更を別判断し、404やSWで黙って代替しない。

`/calc/index.html`等は実ページの起動前に既知の同一ルートへ`location.replace`で正規化する。HTML名aliasも許可済みrouteへの一段転送にし、alias間連鎖は禁止。JS無効時には行き先リンクを表示する。共有hash復元にJSが必要な点は明記する。

queryとhashは`location.search`／`location.hash`をそのまま保持する。未知query、重複query、percent encodingも互換入口で再serializeしない。古いvやrecoverを削る必要があれば個別ルールとfixtureを先に追加する。任意のnext/redirect URLは受理しない。新規共有URL生成時の一時query除外と旧URL転送時の保持は別責任とする。

## URL APIと資材

- `pageUrl(routeId, query, hash)`：profile別ルートとappBaseからページURLを作る。呼出し側は階層やHTML名を組み立てない。正式共有リンクは正式Originを指定する公開URL生成入口を使う。
- `assetUrl(path)`：成果物内の資材rootから同一OriginのURLを作る。画像、動的fetch、Workerの起動URL等が対象。引数は台帳で把握した相対資材パスで、scheme、protocol-relative、絶対path、`..`、逆スラッシュを拒否する。既存のdata/blob URLは呼出し側がそのまま扱い、この関数へ渡さない。
- HTMLのscript/link/img等は生成工程、CSSのurl/importはCSS位置、Worker内部のimportScripts/import/fetchはWorker位置に基づいて解決する。assetUrlはCSSやJS全文を書き換える機能ではない。
- 外部リンク、pageUrl、保存キー、共有codec、canonical/OGP、SW scope、内容hash計算はassetUrlの担当外。版付き資材は生成された資材表から解決し、関数内で独立の版判定をしない。

新側appBase `/`、旧側 `/trickcal-manager/`、ソース検証profileの既存HTML位置を分ける。iframeによる画像生成は現在の検証Originを維持し、ローカル描画を本番ページへ飛ばさない。

## manifestと検査

`tools/public-route-manifest.json`（未実装）を正とする。schemaVersion=1、profiles、routes、reservedPathsを必須とし、未知フィールド・未知enumを拒否するJSON Schemaを用意する。routeは一意id、sourceまたはgenerator、profile別publicPath/kind、aliases、indexable、URL fixtureを持つ。kindはpage/static-redirect/compatibility、redirectはtargetRouteIdのみを参照する。sourceとgeneratorは排他。profileのOrigin、appBase、assetBase、SW script/scopeを固定する。homeは当面静的転送、dataは一覧ページとしてroutesへ登録し、未使用の将来パスだけをreservedPathsに置く。

JSON Schemaの後に意味検査を行う：ID重複、存在しないsource/target、自己転送・循環、profileをまたぐ意図しないtarget、path/alias重複、routeと資材のファイル/ディレクトリ衝突を拒否。`/calc/`と`/calc/index.html`は同じ出力ファイルとして扱い、正規ページ自身によるindex別名だけ許す。重複はroute/alias/予約/生成物を一つの占有表で照合する。URLパスは小文字ASCII・固定slugとし、query/hash、dot segment、percent encoding、二重slash、逆スラッシュを台帳pathでは禁止する。

最終成果物検査では全到達先、HTML資材、動的Worker/iframe、共有hash fixture、sourceCommit/profile/route版/資材版を確認する。未登録の公開ページ、docs/xlsx/test混入を拒否する。schemaだけの合格で配信合格にしない。

## Service Workerと更新

profile固定のservice-worker.jsをappBase scopeで登録する。新旧Originのcacheは互いに共有されない。同一OriginのCacheStorageはscopeで自動隔離されないため、cache名はアプリID・profile・appBase識別子・releaseを含める。既知の旧cache名だけを移行台帳へ列挙し、他アプリのcacheをprefixの広い一致で削除しない。

新設計では通常installの無条件skipWaiting/clients.claimを採用しない。既存ページが閉じるまでwaitingを使い、未保存状態を持つタブを自動reloadしない。手動更新を設ける場合も保存成功確認が前提で、復元/転送transaction中は更新操作を抑止する。現行SWの無条件skipWaiting・広いprefix削除はP5の変更対象として残し、設計済みを実装済みと扱わない。

既知routeのHTMLはnetwork-first、offlineは同一URL・対応releaseのcacheだけを使用する。aliasを開いても別の管理HTMLを返さない。旧release資材を新release資材へ代替せず、版付き資材とHTMLの整合を検査する。activate後は新releaseと直前releaseを保持し、それより古い所有cacheを削除する。旧クライアントが無期限に動く場合の完全offline動作までは保証せず、資材がないときは再接続を案内する。

移行受信・救出はnavigationと機密データをcacheしない。未知pathや非GET、別Originは処理しない。SWもHTTPも共有payloadを受け取らない（hashはブラウザ内で復元）。旧Originの復旧用SWは旧base scopeを維持し、新Originへ強制移動させない。cache掃除とlocal/session保存データ削除は分離する。

更新受入は「旧ページを開いたまま新release」「閉じて再起動」「旧aliasに残るcache」「offline」「壊れたcacheから復旧」「転送/復元中」「他アプリcache保持」を代表確認する。旧配信SWの初回移行は現行skipWaitingの影響も含め実環境で確認する。

## 利用者確定事項

1. `/`：当面は静的`index.html`から`location.replace('/manager/' + search + hash)`で転送し、JS無効時は`/manager/`へのリンクを表示する。これはHTTP 301とは呼ばない。将来ポータル化するときは同じhome ID・URLの通常HTMLへ差し替える。GitHub Pagesの成果物だけで任意HTTP redirectを実装したとは扱わない。
2. `/data/`：敵・ボードへのリンクだけを持つ小さな`data/index.html`一覧を生成する。保存機能やアプリ状態を持たせず、他の主要ページと同じ上部バー構造・主要導線を維持する。directory listingに依存せず、一覧から`/data/enemies/`・`/data/boards/`へ明示リンクする。

上記2点は利用者方針として確定した。P5aで生成・schema・HTTP到達性を実装検査する。P4の受信先`/transfer/`は今回変更なし。

## 根拠

- [GitHub Pages](https://docs.github.com/en/pages)：静的配信を維持する前提。
- [Service Worker lifecycle](https://developer.chrome.com/docs/workbox/service-worker-lifecycle)：更新待機、skipWaitingによる既存クライアントへの影響。
- [MDN Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)：install/activate、cache更新。実配信の正規化・cache挙動はP5/P6の受入で検証する。
