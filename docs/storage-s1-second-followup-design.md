# S1追加補完設計・Luna実施指示

> 現行指示は[S1再計画・実装指示](storage-s1-closure-instructions.md)。本書の必須条件は維持する。以下の「focus/visibilityだけが残る」などの進捗記述は旧判定であり、検出漏れ・実入口基準・nativeイベント経路の未達を含めて再集計する。下部の旧貼り付け指示は現行指示で置き換える。

2026-09-12。F1完了判定は再レビューで撤回し、F1/F2とも未完了。最新の実施指示は[再レビュー修正指示](storage-s1-review-fix-instructions.md)。本書の必須条件は維持し、旧完了記録より優先する。追加補完のスライス1〜3は実施済みだが、focus/visibility後の本番処理結果が未検証のためS1全体は未完了である。

## 目的と現在地

保存保守・移行ロードマップC1の台帳の正確性と、C2の変更前挙動基準を整える。前回のテスト2本は成功するが、レビューで検出漏れ・台帳誤記・未実行ケースが見つかったため、S1完了判定を撤回する。既存成果物は利用する。追加設計とスライス1〜3の作業を実施済みだが、focus/visibility後の本番処理結果が未検証のためS1全体は未完了とする。

実施対象はtools内の検出器・基準テスト・検証依存・fixtureと保存関連文書。アプリの保存コード、キー、形式、同期、計算、datasheet、公開設定は変更しない。commit/push、S2着手、自動実行Goal有効化は含まない。検出器はtools/package-lock.jsonでAcorn 8.18.0（MIT）を固定し、`npm ci --prefix tools`で再現する。スライス1・2と、本番`stat-dashboard.html`を隔離Originの2タブで確認するスライス3を実施済み。focus/visibility後の本番処理結果は未検証のため、S1全体は未完了のままとする。

## レビューの再現と解決条件

| ID | 再現した問題 | 解決条件 |
| --- | --- | --- |
| R1 | optional computed、windowのcomputed storage、template内の実行式が検出0件。文字列連結の先頭を既知キーとして誤解決 | 実アクセスを検出し、解決不能は位置・式付きエラー。誤って既知キーにしない |
| R2 | image-preloadのreadJson呼出元を未登録キーに変更してもerrors=[] | helperの全呼出元を追跡し、キー集合・保存領域を照合。不明な呼出し・helper流出はエラー |
| R3 | 旧DPSのcatchを「例外伝播」、比較sessionの未知版受入を「拒否」と記載 | 実コードで反証テストを固定し、全writerとreaderを再照合 |
| R4 | stale revision単独テストをタブ競合の代表とし、必須基準の不足を残して100% | 下記ケース表を実行済み／静的確認／未検証へ分類。必須ケース未実行ならS1未完了 |

## R1/R2：保存アクセス検出の契約

既存の手製トークン走査は、JavaScriptの構文とスコープを扱う開発用AST解析へ置き換える。依存が未導入であることを機能削減の理由にしない。Lunaは既存ツール構成に合わせてparserを1つ選定し、版・lock・ライセンス・再現可能な導入コマンドを記録する。依存はtools配下に隔離し、アプリの実行時依存や配信物に含めない。導入できなければ原因と代案を報告し、検出機能を黙って狭めない。

- JSは構文として解析する。HTMLはinline scriptを抽出し、文書内の行位置を維持する。通常文字列・HTML本文・コメント内の偽アクセスは無視し、templateの${...}内の実行式は探索する。解析エラーは失敗にする。
- localStorage/sessionStorage、window/globalThis経由、通常／optional／computed member、getItem/setItem/removeItem/clearを対象とする。staticなproperty名は解決し、storageオブジェクトへの不明なcomputed操作・未対応の使い方は未解決として報告する。
- 定数はスコープと初期化式全体で判断する。再代入、shadowing、動的連結を先頭文字列へ丸めない。完全に静的と証明できる式だけキーへ解決する。
- aliasの宣言・代入とhelperのstorage引数を追う。動的なproperty、未知関数への引渡し、返却やexportによる解析範囲外への流出は、無検出で通さず未解決として扱う。任意JSの完全解析は保証しないが、認識したstorage参照の未対応経路を隠さない。
- 現行readJson/parseJsonの例外は、file＋operation＋argumentだけの免除から、helperの識別位置、storage引数位置、key引数位置、許可領域とキー集合、理由・根拠を持つ契約へ置き換える。全呼出元を検査し、追加キー・追加領域・動的引数・未使用契約・呼出元不明は失敗とする。
- 本番候補探索はproductionSourcesから独立させる。除外条件はPages工程と照合し、不一致を検出する。noindex/prototypeは除外しない。検出結果のfile・area・key・operationを各entryのreader/writer/operationsとも照合し、既知キーを新writerが使う場合も台帳更新を要求する。API consumerと直接アクセス元は区別する。
- 64件・19キーという前回件数を合格条件にしない。増減の理由、未解決とhelper経由の件数を分けて報告する。

受入fixtureは直接／定数／alias／optional computed／window computed／template実行式／連結／再代入／shadowing／HTML／コメント／helper新キー・動的引数／未知writer／clearを含む。新規本番候補ファイルの追加を隔離した一時ディレクトリで再現し、探索から検査失敗までを通す。ソース変更はメモリまたは一時fixtureだけで行い、本番コードを書き換えない。検出器単体の成功で終えず、基準テスト全体でもコメント追加は成功、未登録の実アクセス追加は失敗することを示す。

## R3：台帳の照合

全entryの成功・read/write/remove例外・起動時書込と、各writerの呼出元結果を実コードに照合する。返り値、catch範囲、DOM更新順、メモリ更新順、他キーへの書込、通知の有無を分ける。未確認は推測で断定せず未確認とする。readers/writersとaccessSitesの誤登録・欠落も修正する。

特に旧DPSは保存例外をcatchする。比較sessionはmode/baseline等の構造を検査するが、version:999も現行version 3へ正規化する。この挙動を既存APIでテストし、未知版拒否はGate Bで決める将来仕様として分ける。テーマの読込例外を「既定値へ戻る」と一括記載せず、catchのない入口を明示する。起動時保存は条件付き（例: URL zoom）を含める。

## R4：基準テストと完了判定

既存公開APIか、既存ソースから取得した関数・クラス・初期化経路を実行する。保存処理をテストに写経しない。VMでDOMや時計を代替する場合は代替範囲を記録し、検証対象の判断関数をstubにしない。現在のmigrateSavedStateSlots恒等stubでは移行互換を検証できないため、実移行処理を通すケースを別途設ける。

| ケース | S1追加補完の必須確認 |
| --- | --- |
| slot保存・再読込・削除 | 新しいcontextから再読込、他スロット不変、revision、項目削除、read/write失敗 |
| 起動時workspace選択 | workspaceあり／なし／破損の実load経路とlegacy fallback。明示slot不変 |
| debounce・flush | 仮想時計で連続編集、119/120ms、pending flush後の二重保存なし |
| workspace/live/legacy | persistState全体を通し、session失敗後の継続、live失敗とlegacy失敗を別々に注入。残存値・通知・返り値 |
| 複数context | local共有・session別でclean更新適用、dirty競合、stale拒否。Lock有無を区別しmock lockを実排他保証と呼ばない |
| 破損slot・旧形式 | 実移行処理と生データ書戻しの現状。正常化をstubで置換しない |
| 計算保存・敵保存・DPS | 保存／削除失敗時の永続値・メモリ・呼出元UI、再読込後の値。既知の失敗握りつぶしは観測テストとして明示 |
| DPS起動・対象切替 | refreshAvailabilityからの暗黙書込と、対象A→B→Aの設定保持 |
| export/import | 実入口で保存済みslotと未保存draftを区別し、他領域不変、旧形式代表例 |
| 比較session | 正常往復、未知版の現行受入、read/write/remove失敗 |
| HTTPの実ページ2タブ | storage eventとclean/dirty、focus・visibility・pagehide経路を隔離環境で確認。実行操作と観測値を記録 |

ケース表をdocs/storage-inventory.mdへ実施結果付きで残す。実行した関数／入口、fixture、期待値、実行方法、結果、代替部分を示す。ブラウザ機能が利用できず必須確認ができない場合は、実行済み成果を保持してS1未完了と報告する。実quota上限、複数キー復元、Origin転送は後続範囲であり、この未検証をS1必須のイベント確認と混同しない。

S1再完了にはR1〜R4の解決と上記必須ケースの実行が必要。C2全体の達成ではなく、共通化前の基準整備である。A/Bは判断材料の報告までとし、最終契約を推測で決めない。

## スライスと引渡し

| スライス | 作業 | 対応条件 |
| --- | --- | --- |
| F1 Luna max | AST検出・helper契約・反証fixture・全writer台帳照合 | R1/R2/R3、C1 |
| F2 Luna max | 必須挙動基準と実2タブ検証、結果表、S1再判定 | R4、C2変更前基準 |

各開始前に作業と対応条件を明示し、終了後にSTATUSへ達成度・根拠・未検証・残り見積もりを記録する。F1/F2は必須条件が残れば100%にしない。初期見積もり追加2スライス。環境構築や閉包ハーネスが膨らむ場合は残りを再見積もりし、3スライス連続で進捗がほぼ増えなければ再計画案を報告して停止する。

基本検証は検出器fixture、storage基準2本、変更したJSの構文、差分空白検査。追加依存がある場合はクリーン導入で再現する。アプリ本体の変更がないことは着手時との差分で確認し、既存未コミット変更と混同しない。

終了時にGate Aへ失敗結果・部分更新・通知・暗黙書込・旧タブ制約、Gate Bへ未知版受入・破損生値・export範囲・mirror/draftの選択を報告する。S2には進まず停止する。

## Lunaへの貼り付け指示

```text
AGENTS.md、GOAL.md、STATUS.md、docs/storage-s1-second-followup-design.mdを読み、S1追加補完のF1→F2を実施してください。同設計を前回のS1完了記録より優先してください。

保存動作は変更せず、ASTベースの保存アクセス検出、helper呼出元のキー・領域照合、失敗経路台帳の訂正、既存コードを使った必須挙動基準と隔離HTTPの2タブ検証を整備してください。レビューの反例が検査全体で失敗することを確認してください。

各スライス開始前に対応完了条件を示し、終了後にSTATUS.mdへ達成度・根拠・未検証事項・残り見積もりを記録してください。必須ケース未実行ならS1を完了扱いせず、環境制約と残作業を報告してください。既存未コミット変更を維持し、datasheet・アプリ保存コード・公開設定は変更しないでください。

A/B設計への判断材料を報告して停止してください。S2、commit/push、自動実行Goalの有効化は行わないでください。
```
