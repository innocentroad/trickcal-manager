# 保存経路台帳とS1基準挙動

> 現行判定は[S1再計画・実装指示](storage-s1-closure-instructions.md)とSTATUSを参照。storage/helper検出漏れと必須ケース不足が残り、S1未完了。過去の同期・復元結果は保持するが、storage eventやpagehide単独経路の証明ではない。

更新日: 2026-09-12

再レビュー注意: 初版にあった旧DPSのcatch、比較sessionの未知版受入などの誤記は訂正した。検出器の64件・未解決0件も網羅性の保証ではなく、未検証の実ブラウザ挙動は下記の実施結果に分けて記録する。[S1追加補完設計](storage-s1-second-followup-design.md)の判断範囲を超えてA/Bの仕様を確定しない。

保存保守・新ドメイン移行ロードマップのS1成果物。`tools/storage-inventory.json`を機械可読な台帳、本文を運用者向けの説明とする。S1補完まで、アプリ本体の保存処理、保存キー、データ形式、初期化順を変更していない。

## S1の結論

- 正規のステータス保存は `trickcal_stat_slots_v2`。1〜6スロットの全体ストアで、明示保存・削除・インポートに加え、起動時の旧形式移行でも書き込まれる。
- 現在状態は `trickcal_stat_workspace_v2`（同じタブの編集中ドラフト）、`trickcal_stat_live_v2`（別画面へ渡すlive mirror）、`trickcal_stat_prototype_v1`（旧形式互換）の3層に分かれる。
- ダメージ計算設定、名前付き計算保存、カスタム敵プリセット、DPS設定はステータススロットとは別のlocalStorageキーで管理される。
- 比較セッションとダッシュボード再読み込み文脈はsessionStorageであり、別タブ・別Originへはそのまま移らない。
- 現行のステータス書き出しは `schema: trickcal-stat-state`、`version: 2`、`kind: slot` の1スロットだけで、完全バックアップではない。計算設定、DPS設定、敵プリセット、テーマ、他スロットは含まれない。
- Pagesの公開成果物は `tools/` 以外のファイルを基本的に含む。`noindex`のDPS試験版・旧試作ページも配信上は存在し、同じOriginで保存キーを書き得るため、Gate Aでは旧タブ・旧ページを制約として扱う。

## S1補完の実施結果

- `failureMatrix`に19キー全ての成功時挙動、読込失敗、書込失敗、削除、呼出元の結果、起動時書込、access siteを記録した。storageキー自体の削除と、保存オブジェクト内部の項目削除は分けている。
- `tools/storage-access-detector.js`は台帳の`productionSources`を探索入力にせず、Pages工程の除外ディレクトリを使って本番候補のJS/HTMLを独立列挙する。現在は64件のstorageアクセスを検出し、Acorn ASTで定数、直接文字列、optional chaining、computed access、storage alias、HTML inline scriptを検査している。storage aliasの再代入や解析不能な領域は未解決エラーにする。
- 現行コードの関数引数でキーを受ける読取専用helperは、`dynamicAccessExceptions`に2件だけ理由付きで登録した。比較session APIの注入可能なstorage引数は`storageParameterContracts`へ関数・操作・キー・既定領域を登録する。helperの別名呼出し、未知関数への引渡し、return/exportによる流出は契約検査を失敗させる。例外以外の未解決キー、未登録ファイル、台帳外キー、保存領域の不一致も基準テストを失敗させる。コメント内の偽アクセスは検出対象にしない。
- `tools/test-storage-behavior-baseline.js`は保存ロジックを写経せず、現行関数を最小VMへ抽出して実行する。slotの保存／再読込／削除／stale競合／破損fallback、workspace起動選択、実`persistState()`の正常／session失敗／live失敗／legacy失敗、119/120ms debounce、計算・敵・DPS保存失敗と比較sessionのread/write/remove失敗を確認する。`combat-scenario.js`の比較sessionは公開APIそのものを実行する。

構文解析にはtools専用のAcorn 8.18.0（MIT）を使う。`tools/package-lock.json`で固定し、`npm ci --prefix tools`で再現する。Acornが解釈できても完全な実行時データフロー解析は保証しないため、動的生成や追跡不能な汎用aliasは位置・式付きの未解決エラーとして停止する。

## 台帳の読み方

`tools/storage-inventory.json`の各entryは次を表す。

| 項目 | 意味 |
| --- | --- |
| `area` | `localStorage`はOrigin共通、`sessionStorage`はタブ単位。 |
| `category` | slot、current-state、current-draft、dps、calculation、enemy、displayの用途分類。 |
| `role` | 正規状態、ミラー、ユーザー設定、派生表示、旧互換などの責任。 |
| `owner` / `writers` | 読み取りだけの画面と、実際に書き込む実装を区別する。 |
| `writeTriggers` | 明示操作だけでなく、起動・debounce・終了時flush・focus復帰などの暗黙書込も含める。 |
| `migrationDisposition` | S1での候補整理。完全バックアップへの最終採否はGate Bで決める。 |

全キーの詳細、参照元、チャネル、検証用ファイルとの分離は[storage-inventory.json](../tools/storage-inventory.json)を参照する。

## 保存領域の分類

### 1. ステータス管理の正規状態とミラー

`stat-prototype.js`は起動時にまず旧形式 `trickcal_stat_prototype_v1` を読み、旧payloadの `savedStates` を入力として `trickcal_stat_slots_v2` を正規化・必要なら生成する。その後、同じタブの `trickcal_stat_workspace_v2` が有効なら、その `draft` を旧payloadより優先する。スロットストアのsnapshotには、全使徒の育成、研究、カード、編成、保存編成、比較用stat snapshotなどが入る。

通常の `saveState()` は次の動作をする。

1. UIを更新し、通常は120ms後のdebounce保存、`flush`指定時は即時保存を予約する。
2. `persistState()`で `appState.syncRevision` を増やし、workspace draftをsessionStorageへ書く。
3. タブが可視かつlive publisherなら、liveのrevisionを増やして `trickcal_stat_live_v2` と旧形式 `trickcal_stat_prototype_v1` を連続して書く。
4. `beforeunload`、`pagehide`、非表示化、blurではpending保存をflushする。focus・表示復帰ではlive publisherをclaimしてliveを公開する。

明示的なスロット保存・削除は、最新ストアを再読込して対象slotRevisionを確認し、`navigator.locks.request('trickcal-stat-slots-v2')`内でstore全体を書き戻す。期待revisionと現在revisionが違えば、force指定がない限り競合として終了する。`navigator.locks`がない環境の現行fallbackは実ロックではなく、taskをPromiseで実行するだけである。

別タブ同期はBroadcastChannelとstorage eventの二経路を持つ。別タブのスロット更新を受けたとき、現在状態がcleanなら外部snapshotを適用し、dirtyならworkspaceへ競合状態を残して利用者へ通知する。live mirrorはfocus状態とsourceTabInstanceIdを使ってpublisherを抑制するが、全キーを一つのトランザクションとして扱う仕組みではない。

### 2. ダメージ計算とDPS

`formation-damage-calc.js`はステータスの旧currentキーを主に読み、スロットストアは比較対象スロットの一覧取得に使う。対象使徒変更時には旧current payloadの `activeId` を直接更新する経路もある。

- `trickcal_formation_damage_settings_v1`: 計算対象、編成、敵、補正、表示、効果仮定、一時カード状態などを保存する。多数のUI変更から同期的に保存する。
- `trickcal_formation_damage_result_saves_v1`: 名前付き計算snapshotの配列。計算結果だけでなく入力、参照状態、DPS snapshotを含み、書込時に最大50件へ切り詰める。削除も配列全体の書き戻し。
- `trickcal_formation_damage_enemy_presets_v1`: `custom:<generated id>`をキーにした利用者作成敵データ。保存・削除はオブジェクト全体を書き戻す。
- `trickcal:dps-settings:v1`: 現行本体DPS controllerが対象使徒ごとに持つ時間、seed、試行数、高学年・編成推定、外部イベントなどの設定。
- `trickcal:dps-runtime-effect-overrides:v1`: 現行DPS controllerと旧DPS試験controllerが共有する効果binding単位の上書き。両方が同じキーを書けるが、S1時点で共通lockや世代比較はない。

DPSのシミュレーション結果・単一seed結果・複数seed集計のメモリcacheは、確認できる範囲ではlocalStorageへ保存しない。明示的な比較基準だけが `trickcal_combat_comparison_session_v1` としてタブのsessionStorageへ保存される。

### 3. 表示設定と共有試作

テーマは `trickcal_theme`を共通キーとし、`trickcal_stat_theme`、`trickcal_damage_calc_theme`、`trickcal-board-preview-theme`が旧画面用のfallbackまたはミラーとして残る。ボード方向、特殊マスOFF表示方式、公開ボードプレビュー倍率も個別の表示設定キーである。

現行の読み取り専用 `formation-share.html` は共有URLのhashから表示を復元し、保存値へフォールバックしない。一方、配信されている `formation-share-prototype.html` / `.js` はworkspace、live、旧currentを読み、全体強化元の選択を専用キーへ保存する旧試作である。これは共有URLのpayloadではなく、移行対象候補から分離する。

`image-preload.js`はstat currentと計算設定を画像先読み判断のために読むだけで、保存の所有者ではない。Service Workerの `trickcal-manager-*` Cache Storageは表示資材のキャッシュであり、利用者データとは分離する。

## 現行の書き出し境界

ステータス管理のエクスポートは `stat-prototype.js` の `exportStateFile()`が作る次の形である。

```json
{
  "schema": "trickcal-stat-state",
  "version": 2,
  "kind": "slot",
  "exportedAt": "...",
  "sourceSlot": 6,
  "snapshot": {}
}
```

対象は最後に明示保存した1スロットだけで、編集中workspace、他スロット、計算設定、計算保存、敵プリセット、DPS設定、テーマ、比較sessionは入らない。`tools/fixtures/max-growth-verification-state.json`はこの形式の表示検証fixtureであり、全保存領域のバックアップではない。

したがって「現行exportが読める」ことと「新Originへ利用者の全保存を移す」ことは別の完了条件である。Gate Bでは完全バックアップの外側の形式、正規／派生／一時データ、旧version変換を新たに確定する必要がある。

## Origin移行上の重要な制約

localStorageとsessionStorageはOrigin単位で分離される。`innocentroad.github.io/trickcal-manager`と`trickcal.irlab.dev`は同じブラウザで開いても保存領域を直接共有しない。特にworkspaceはタブ単位なので、旧側で現在タブのドラフトを確定・抽出しない限り、新側へ「最新編集中状態」を保証できない。

URL共有hash、PNG、Service Worker cacheは保存データ移行とは別系統である。新URLで旧共有hashを表示する互換性はGate Cで確認し、利用者保存の転送に共有URLやURL queryを流用しない。

## 保存失敗・破損時の現状（コード読解による確認）

以下は現行コードの観測事項であり、今後保証する仕様ではない。詳細は`tools/storage-inventory.json`の`failureMatrix`に全19キー分を記録し、実行済み範囲は`tools/test-storage-behavior-baseline.js`のassertionと対応させる。

| 経路 | 現行挙動 | A/B設計への影響 |
| --- | --- | --- |
| loadSharedStateSlotStore | JSON解析等が失敗すると旧savedStatesから再生成し、同じキーへ書戻しを試みる | 破損生データを救出する前に失う可能性。起動ガードが必要 |
| persistStateWorkspace / persistState | sessionStorage例外を握りつぶし、persistStateはその後live公開へ進める。実4ケースをVMで確認 | draftとmirrorの更新成否を個別に扱う |
| publishLiveState | live、legacyの順で同じtry内に書く。live書込失敗時はlegacyへ進まず、legacy書込失敗時はlive更新後にlive-publishedを通知する | 部分更新・通知と永続化の不一致を扱う |
| writeDamageCalculationSaves | 保存例外をwarnにし、成功結果を返さない。呼出側はメニューを閉じる | 保存成功・失敗をUIへ返す契約が必要 |
| DPS設定保存 | メモリを先に更新し、保存例外後もタブ内設定を維持する | 再読込で失う未保存状態の通知が必要 |

この表は判断しやすい代表例であり、テーマ、ボード表示設定、再読込文脈、敵プリセット、比較session、旧共有試作の失敗境界は`failureMatrix`を正とする。S1では失敗時UIの改善や保存順の変更を行わない。

DPSのrefreshAvailabilityはsyncDpsSettingsForTargetを呼び、起動時の通常モードでも実行される。設定変更だけでなく、この暗黙書込も復旧前ガードの対象となる。

## 基準テスト

`node tools/test-storage-baseline.js`と`node tools/test-storage-behavior-baseline.js`をS1の基準テストとする。どちらも利用者のブラウザ保存領域へは書き込まない。前者は静的・独立探索、後者は現行関数とモックstorageの挙動を検査する。

- 台帳の全キーが現在の本番コードに存在し、参照元ファイルが存在する。
- 本番公開範囲と検証用 `tools/` の分離が台帳上維持される。
- 直接書かれたstorage keyに台帳漏れがなく、`localStorage.clear`、`sessionStorage.clear`、IndexedDBが未導入である。
- ステータスのslot schema、1スロットexport、debounce/flush、期待revision競合、Navigator Lock fallbackの現行契約が変わっていない。
- 計算保存の50件上限、DPS settings schema、共有runtime override、比較session version、表示用Cache Storageの識別子が変わっていない。
- 既存の最大育成表示fixtureが `trickcal-stat-state` version 2 / kind slotとして読み取れる。
- 本番候補を台帳から独立して探索し、検出した64アクセスが登録済みキーまたはhelper契約付きの理由付き動的例外へ解決できる。Acorn ASTで直接／定数／optional／computed／alias／HTML／template実行式／コメント／連結／再代入／shadowing／未登録ファイル／clear fixtureも確認する。
- 現行コードの代表的な正常・失敗・再読込・競合経路を、実コード抽出または既存公開APIで確認する。operation order、session領域のタブ分離、live／legacy片側失敗後の通知も含む。

## S1追加補完の実施結果

2026-09-12に、保存動作を変更せずF1/F2の基準を補完した。検出器は`tools/package-lock.json`で固定したAcorn 8.18.0（MIT）を使い、`npm ci --prefix tools`で再現できる。検出結果の件数増減を合格条件にはせず、解決できない経路を失敗にすることを優先した。

| ケース | 実施方法・結果 | 代替／未検証 |
| --- | --- | --- |
| slot保存・再読込・削除・revision・stale拒否 | `test-storage-behavior-baseline.js`で実コード関数をVM抽出。新context再読込、他slot不変、削除、read／write／delete失敗を確認 | Navigator Lockはmock呼出であり、実排他ではない |
| 起動workspace・legacy fallback | 実`loadState()`でworkspace優先、workspaceなし・破損時のlegacy fallbackを確認。実ページではpagehide後のworkspace復元も確認 | 全ての起動入口は未確認 |
| debounce・flush | 仮想時計で119msでは未実行、120msで1回、連続編集の再予約、flush後の二重保存なしを確認 | 実ブラウザ時計の境界は未確認。実pagehide復元は下記の本番ページ確認で別途記録 |
| workspace/live/legacy | 実`persistState()`で正常、session失敗後のlive継続、live失敗、legacy失敗、通知と書込試行順を確認 | BroadcastChannel実通信は未確認 |
| 複数context・storage event | 隔離Originの本番2タブでclean側の★4反映、dirty側の★5保持を確認 | storageとBroadcastChannelの経路を分離しておらずnative storage経路の証明は未達。stale拒否の実UIも未確認 |
| 破損slot・旧形式 | 実`migrateSavedStateSlots`と実カードID変換を通し、v2 storeへ書戻すことを確認 | 全ての旧形式・大容量payloadは未確認 |
| 計算保存・敵保存 | 計算保存50件上限・読込／書込失敗・削除失敗、敵プリセット正常／破損／読込失敗・保存失敗・削除失敗を実関数で確認。失敗時の永続値とVM上のUI状態を確認 | 実DOMの保存メニュー・削除確認UIは未確認 |
| DPS設定・runtime | 対象Momo→Sylla→Momoの設定分離／復元、現行・旧controllerの保存失敗を確認。隔離Originの実DPSタブ起動で結果・タイムライン表示を確認 | `refreshAvailability`内部の暗黙書込・保存値は実ページ観測未確認 |
| 比較session | 正常往復、sessionStorageのタブ分離、破損・read／write／remove失敗・version:999の現行version 3正規化を確認 | 未知版を将来拒否する仕様はGate Bで決める |
| export/import | export schema/version/kindと現行入口の静的境界、実ページの保存slot選択UIを確認 | export downloadイベントと、importファイル適用は未検証。filechooser投入はChrome拡張のfile URL許可不足で阻害 |
| focus/visibility/pagehide | 本番ページを離脱して戻り、★1と「編集中: 1」が復元されることを確認 | 通常の遅延保存・beforeunload・pagehideを区別していないため個別flush経路は未証明。focus/visibilityの実切替後の本番結果も未検証。fixtureのイベント疎通は代用しない |

実行した基準コマンドは`node tools/test-storage-baseline.js`、`node tools/test-storage-behavior-baseline.js`、両テストと検出器の`node --check`で、全て成功した。実ブラウザ確認は、`node tools/fixtures/storage-http-server.js 8769`でmanagerルートを`http://127.0.0.1:8769/`へ配信し、本番`stat-dashboard.html?view=settings`を同一Originの2タブで操作したほか、同Originの`formation-damage-calc.html?recover=20260912`でDPSタブを起動した。fixtureは`tools/fixtures/storage-http-baseline.html`と同HTTPサーバーを使用するが、本番同期の根拠にはしていない。実quota超過、複数キーの完全復元、Originをまたぐ転送、実export download、実import適用、focus/visibility後のnative本番処理結果は未検証のため、S1を完了扱いにしない。

### スライス3：本番ページ2タブの実施記録

- 実行日時: 2026-09-12。`node tools/fixtures/storage-http-server.js 8768`でmanagerルートを配信し、`http://127.0.0.1:8768/stat-dashboard.html?view=settings`を同一Originの2タブへ開いた。通常のGitHub Pages Originや利用者データは使っていない。HTML・CSS・JS・画像のContent-Typeを実サーバーで返すことも確認した。
- タブAで保存メニューからスロット1を保存し、タブBで同スロットをロードしてclean状態を作った。タブAの★を3→4へ変更して保存すると、タブBは本番UIのステータス「別タブで更新されたスロット1を反映しました」、★4、`読み込み中: 1`になった。
- タブBの★を5へ変更してdirtyにし、タブAの★を2へ変更して保存すると、タブBは本番UIのステータス「スロット1が別タブで更新されました」、`別タブ更新あり: 1`を示し、★5を保持した。スロットボタンのtitleにも「別タブ更新あり / 未保存変更あり」が表示された。clean／dirtyの判定はfixtureではなく、本番`handleExternalStateSlotStore()`の結果を観測した。
- タブAの★を1へ変更した直後にfixtureへ遷移し、同じ本番ページへ戻ると★1と`編集中: 1`が復元され、コンソールのerror/warnはなかった。復元値はUIから確認し、保存領域をブラウザAPIで直接読んでいない。pending状態や保存イベント順を観測していないため、pagehide/beforeunloadのflush確認という旧断定は撤回する。
- focus/visibilityはタブAPIの`tabs.selected`が切替操作後も対象タブへ安定して移らず、両タブの`document.visibilityState`も`visible`のままだった。したがって、本番のfocus claim・visibility復帰処理の結果は成功扱いにせず未検証とする。キーボード／座標による切替を試し、fixtureの合成イベントや独自ログで代用していない。
- 追加の2タブ操作では、Bでstat対象をティグからモモへ変更してslot 1へ保存し、A側がモモへ反映された。これは本番UIの統合同期結果であり、BroadcastChannelとnative storage eventを分離した証拠ではない。DPSページではDPSタブが選択状態となり、全体期待DPS・単一seedタイムライン・詳細ボタンが表示され、再計算待ち表示は残らなかった。
- statの保存メニューでは保存slotを選択してexport操作を実行した。importでは`input[type=file]`へのfilechooserイベントは発火したが、Chrome拡張のfile URL許可不足で`setFiles`が拒否された。実export download、import適用、slotと未保存draftの区別は達成扱いにしない。

### スライス3：BroadcastChannelを分離したnative storage event

- `tools/fixtures/storage-s1-native-stat.html`は、隔離Originの本番`stat-dashboard.html`を読み込む前に`window.BroadcastChannel`を削除する検証専用ラッパーである。アプリの保存処理を複製・変更せず、`tools/`配下なのでPages公開対象外である。
- 2つのラッパータブを`http://127.0.0.1:8769/`で起動し、両方で`BroadcastChannel`が存在しないこと、stat本番UIが起動すること、error/warnがないことを確認した。Aがslot 2を保存した際、dirtyなBは★5を保持し、保存メニューに「別タブ更新あり: 2」を表示した。`stateSyncChannel`を使えない条件での本番UI結果なので、EVT-1bの証拠とした。
- 同条件でclean側を再ロードして反映する操作は、確認ダイアログ処理がタイムアウトして完了しなかった。EVT-1aを達成扱いにしない。focus/visibilityはブラウザ操作APIでnative状態を切り替えられず、pagehideはpending状態と書込順を分離観測できないため、EVT-2とEVT-3aも未達のままとする。
- 追加の2タブ操作では、Bでstat対象をティグからモモへ変更してslot 1へ保存し、A側がモモへ反映された。これは本番UIの統合同期結果であり、BroadcastChannelとnative storage eventを分離した証拠ではない。DPSページではDPSタブが選択状態となり、全体期待DPS・単一seedタイムライン・詳細ボタンが表示され、再計算待ち表示は残らなかった。
- statの保存メニューでは保存slotを選択してexport操作を実行した。importでは`input[type=file]`へのfilechooserイベントは発火したが、Chrome拡張のfile URL許可不足で`setFiles`が拒否された。実export download、import適用、slotと未保存draftの区別は達成扱いにしない。

S1の目的は現行契約を固定してA/Bへ渡すことであり、失敗UI、共通保存層、完全バックアップ、移行実装はS2以降で扱う。

## 設計ゲートA/Bへ渡す判断事項

S1で事実として確定したのは「どこに何があり、いつ書かれるか」までであり、以下は設計ゲートで決める。

### Gate A：保存・排他・中断復旧

1. 既存localStorageの同期書込を共通APIからも維持するか、非同期APIへ移すか。成功・失敗の戻り値、debounceと終了時flushの順序を定義する。
2. slot storeだけでなく、計算設定、敵プリセット、DPS設定、runtime overrideも排他範囲へ含めるか。同じキーを現行／旧DPS controllerが書く場合のlockと世代検査を定義する。
3. 複数キー復元のjournal保存先、各キーの旧値／不存在の記録、commit確定点、途中中断時の再開・ロールバック状態を定義する。
4. 起動時の旧値読込・正規化・暗黙保存より復旧を先に行うための初期化順と、enemy-statusやboard preview等の別入口の扱いを決める。
5. 共通層導入前の旧タブ、休止タブ、noindexの旧DPSページが持つメモリ状態をどの範囲で検出・停止・再読込要求するかを決める。
6. localStorageは適用済みだがsessionStorageの初期化に失敗した場合、journal読込に失敗した場合、利用者確認が途切れた場合を別状態として表示する。

### Gate B：完全バックアップ・長期互換

1. 必須の正規対象を、slot store、現在workspace、live/legacy mirror、計算設定、計算保存、敵プリセット、DPS設定、runtime overrideのどこまでとするか決める。テーマ・表示設定・comparison session・share prototype設定は対象外／任意／再構成のいずれかを確定する。
2. 現行の `trickcal-stat-state` version 2を旧slot形式として残し、全保存用に新しいbackup schemaを設けるかを決める。各領域のschema版、アプリrelease、転送protocol版を分離する。
3. 欠損、空、破損、未知キー、未知version、旧dynamic ID、旧binding、未知の敵フィールドを、拒否・保持・既定値化・警告のどれにするかを項目ごとに決める。保存前に異常値を正常値で上書きしない。
4. live/legacy mirror、revision、workspaceId、TAB_INSTANCE_ID、comparison cacheを復元するか、正規状態から再生成するかを決める。タブ識別子と旧Originのnonceをそのまま持ち込まない。
5. 最大育成fixtureと全スロット／全敵プリセット／全計算保存の実測から、バックアップファイル、展開、journal、受信の上限を決める。
6. 旧公開済みfixtureを新受信側で継続して読める期間と、形式変更時のconverter・validator・回帰テストの責任を決める。

この判断が確定するまで、S2の共通保存層やS3の完全復元を推測で実装しない。
