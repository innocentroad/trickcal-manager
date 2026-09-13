# 公開URLと配信ファイルの管理設計

更新日: 2026-09-13。設計のみ。利用者の「わかりやすく、コンパクトに」を優先し、下表を採用する。詳細責任は[Gate C補足](public-url-gate-c-design.md)を正とする。`/`は当面静的転送、`/data/`は一覧ページとする。実装・DNS・公開変更は未実施。

## 方針と対象

新本体のOriginは https://trickcal.irlab.dev 、配信baseは / とする。他ツールは別サブドメインに配置できるようにする。旧 https://innocentroad.github.io/trickcal-manager/ は引き継ぎ入口を維持する。リポジトリ名は公開URLに含めない。

今回の整理は、利用者向けURL、公開時の配置、URL生成の共通化、旧入口互換を対象とする。開発元のHTML/JS/CSS/画像の大規模移動、SPA化、画面構成の刷新は含めない。保存処理変更と別スライスで検証する。

## ルート台帳案

| 論理ID | 新公開URL | 現在のソース | 互換入口 |
| --- | --- | --- | --- |
| home | / | index.html（当面は`/manager/`への静的転送） | /index.html |
| manager | /manager/ | stat-dashboard.html | /stat-dashboard.html |
| damage | /calc/ | formation-damage-calc.html | formation-damage-calc.html |
| share | /share/ | formation-share.html | formation-share.html |
| data | /data/ | data/index.html（敵・ボード一覧） | /data/index.html |
| enemies | /data/enemies/ | enemy-status.html | /enemy-status.html |
| board | /data/boards/ | public/board-layout-preview.html | /public/board-layout-preview.html、告知済み /tools/board-layout-preview.html |
| transfer | /transfer/ | 引き継ぎ受信ページ（今後実装） | 公開後は維持 |

管理画面内の編成・カード等は既存のqueryで表す。今回、個別のページへ分割しない。DPSは/calc/内のモードを維持し、試験HTMLを新しい公開ルートにしない。復旧専用URLは通常ルートとは別の保守用入口として保持する。

実際に告知済みの旧パスはS5aで列挙し台帳に登録する。tools/board-layout-preview.html等の過去URLは、公開・告知履歴と既存互換対応を確認して追加する。tools配下全体を互換のために公開しない。新Originでの旧ファイル名入口と、旧Origin上の互換入口は役割を分ける。

旧Originの管理/計算入口は保存データ移行のため旧Originで開く。共有・ボード・敵閲覧の移動は対応パスへ限定できるが、保存データの自動移行を要求しない。ルート不明時は404を出し、全URLを管理画面へ転送して欠落を隠さない。

## 公開時の配置

新成果物は/manager/index.html、/calc/index.html、/share/index.html、/data/index.html、/data/enemies/index.html、/data/boards/index.html等を生成し、それぞれを直接開いても動く静的サイトとする。`/index.html`は当面`/manager/`へ一段転送し、`/data/index.html`は敵・ボードへのリンクを持つ一覧とする。data一覧は他の主要ページと同じ上部バー構造・主要導線を残し、保存機能や重い管理・計算処理は持たせない。クライアント側ルーターへの全面切替や404を使ったSPA代替は行わない。

ソースと公開物の関係を一つのルート台帳（実装時の仮称tools/public-route-manifest.json）に記録する。少なくとも論理ID、source、publicPath、aliases、公開先ごとの有効性、検索掲載可否、検証用query/hashケースを持たせる。台帳から配信配置、実行時ルート表、alias、sitemap/canonicalの参照を作る。ページ名称やDOM内容そのものまで汎用フレームワーク化しない。

公開物は一時出力先に生成し、手編集しない。新旧で異なるURL表を使う場合も、同じ台帳から公開先プロファイル別に生成する。ソース直配信のローカル環境でも既存URLで動くことを保持し、正式な検証は生成済み成果物のHTTP配信で行う。file://動作を画像生成の受入条件にはしない。

ページ移動と同時に全資材を/assets/等へ再配置する必要はない。初期はJS/CSS/画像の既存相互位置をなるべく維持し、HTMLと動的参照の基準を明示する。CSS url()はCSSファイル位置、Worker内importScripts等はWorker自身の位置で解決されるため、HTMLの階層だけで一律変換しない。

## URL生成の責任

ページURL、資材URL、公開用絶対URLを分ける。

- pageUrl(routeId, query, hash): 実行環境の配信baseと台帳からページURLを組み立てる。query/hashを保持する。
- assetUrl(path): 当該成果物の資材baseから組み立てる。現在ページの階層に依存させない。
- 公開canonical/OGP/sitemap: 正式Originと正規ルートから生成する。ローカルiframeの参照に本番Originを強制しない。

これらは責任を示す仮API名であり、詳細は設計ゲートCで確定する。HTMLのリンク/script/style等は生成時に明示的に解決する。単なる全文置換でJS文字列や共有hashを加工しない。

<base href="/">の追加だけで対応を済ませない。同一ページの#リンクやdocument.baseURIも変わるため、導入するならゲートCでその挙動まで確認する。既定案はbase要素への依存を増やさず、対象属性と動的生成箇所を接続する方式。

影響が確認できている箇所:

- formation-share-create.js: location.href基準のformation-share.html生成。新しい/share/への変更が必要。
- formation-share-image.js: document.baseURI、iframe、CSS/画像のURL解決。描画iframeは同一Originの対応ページを使用する。
- app-cache.js: ファイル名によるルート判定、先読み一覧、Service Workerの相対登録。/calc/等への接続が必要。
- public/board-layout-preview.html: 同階層CSS/JSと../statData.jsの混在。
- 各HTML、動的リンク、DPS Worker、Worker内依存、favicon、SEO情報、share-page cache版参照。

## 旧リンク・共有URLの互換

正規URLは末尾/付きに統一する。/calc、/calc/、/calc/index.htmlの直接アクセスとquery/hash保持を検証する。

旧ファイル名には台帳由来の静的案内/転送HTMLを生成する。JavaScript有効時は許可された対応先へlocation.replaceでqueryとhashを保持して移動する。単純なmeta refreshだけで共有データを失わないようにする。JavaScript無効時は通常案内を表示し、共有の復元が必要な場合はJavaScriptが必要と説明する。静的HTMLからの転送はHTTP 301を実現したとは扱わない。

既存queryは原則保持。recover、旧資材v等の一時項目の削除・置換は台帳/生成ルールで明示する。敵preset、使徒apostle、zoom、管理画面view/card/global、共有hashを黙って捨てない。転送先をユーザー指定URLから採用しない。

共有codecのv1や永続IDは変更しない。新規生成だけ/share/を使い、旧formation-share.html#...も同じ編成を描画する。画像生成向け一時queryは公開共有URLに混ぜない。URL長の目標比較は新baseで再測定するが、短縮のための別codecは作らない。

## 資材版・配信工程との接続

現行のtools/sync-formation-share-assets.jsはソースHTMLの内容から共有ページ版を計算する。HTMLを配置/変換した後に内容が変わるなら、その版を最終公開物の内容ハッシュとして流用しない。

生成データの検証→公開先別のルート/HTML/資材参照生成→最終公開内容を対象に依存順ハッシュ同期→参照整合・到達性検査→配信、を責任上の順序とする。既存ソース資材同期との接続、ページ版を利用するshare-create/app-cacheの派生順、自己参照回避はゲートCで確定する。ハッシュ方式を二つ独立保守せず、既存の依存順ロジックを再利用/拡張する。

新旧成果物にはそれぞれ元commit、profile、route版、資材版を記録する。同じ元commitでも出力内容が違えばハッシュが違ってよい。再生成で不要な日時差分を出さない。

現行workflowは除外リスト付きでリポジトリ全体をコピーしている。新成果物は公開ページと必要資材を明示する方式へ移し、docs、AGENTS、テスト、xlsx、ローカルfixture、試験ページの混入を検査する。旧成果物の縮小は旧入口の必要依存が欠けないことを確認して行う。

SWは固定のアプリbaseから登録する。/calc/service-worker.jsや/share/service-worker.jsを誤登録しない。ルートscope内で既知のページ/資材だけを扱い、旧パスのキャッシュ、新正規パス、オフライン復帰を検証する。

## 段階と担当

設計ゲートC（AstraまたはSol）で台帳/API、旧新プロファイル、alias、ハッシュ同期順、生成/検証境界を確定する。その後LunaがS5aで実装する。詳細契約未確定のままLunaに任意のルーティング抽象を作らせない。

- S5a: URL台帳、生成工程、リンク/Worker/画像接続、互換入口、成果物検査。公開はしない。ローカルで/と/trickcal-manager/の両baseを試験する。
- S5b: S5aの検査済み成果物を二公開先へ配信する工程、移行案内切替、運用手順。外部操作は許可された範囲で行う。
- S6: 新サイトの一般公開前に正規/互換URLを実環境で確認。移行受信URLの変更がS4に影響するため、S4/S5aの接続試験をここまでに完了する。

## 完了条件と今後の追加手順

- 全正規ページへ直接アクセス・再読込できる。末尾/、旧ファイル名、query/hash付き入口にループや意図しない404がない。
- 静的資材の参照先が生成物に存在する。ブラウザでJSの動的fetch、Worker、画像、iframeまで確認する。
- /share/でURL復元とPNG生成が両テーマで成功。旧共有URLも同じ編成になる。
- URL変更だけで保存キーを変えない。新Originへのデータ移送は既定の引き継ぎ処理を使う。
- 未登録の新ページ、重複ルート、alias衝突、ルート循環、公開不要ファイル、資材版不一致を公開前に検出する。
- ページ追加時は台帳、必要依存、内部リンク、query/hash fixture、検索掲載方針を更新して生成/検証する。URL改名時は旧aliasを残し、使われなくなったように見えるだけでは削除しない。
- READMEに生成済みサイトのローカル確認手順を記載し、AGENTS.mdに台帳更新・生成物手編集禁止・旧URL互換検査を接続する。初版で専用skill追加は不要。

## 参照

- [GitHub Pagesの入口と静的ファイル配信](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [base要素のURL解決への影響](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/base)
