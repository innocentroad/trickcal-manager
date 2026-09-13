# Luna実装Goal：P1b残件からP2完了まで

> レビュー後のP2完了判定は撤回。次回の進行指示は[レビュー修正→P3 Goal](storage-p3-luna-goal.md)を優先する。本書は過去の実施記録として保持する。

2026-09-13設定。現在G3/P2後半を実行中。自動実行Goalは有効化しない。

## 最新実行記録：G3接続・native A-T1〜A-T3確認（2026-09-13）

G2の共通層を既存画面へ接続し、制御回帰と独立Chromeの代表確認を実施した。`storage-registry.js`、`storage-runtime.js`、`storage-bootstrap.js`を7ページへ読み込み、各アプリの保存領域をFacade経由へ接続した。nativeではstatの保存・draft・export・実file input import・slot2適用・slot1不変、DPSの起動・対象A/B/A・設定保存・再読込復元、実2タブのshared保持中exclusive busyと解放後の再取得を確認した。

追加した`storageAppLifecycle`で、実アプリのhidden／visible、hidden中のexclusive busy、実navigateによるpagehide後のshared解放・peer exclusive取得、history復帰後のstatページ自身のpageshow・再bootを確認した。`storageBootGuard`では実Originへ未知version journalを設定して再読込し、`recovery-required`、error画面、journal保持、アプリ保存入口未起動を確認した。A-T1〜A-T3のnative残条件は解消した。

native runner全体の終了コードは、補助fixtureのfocus/visibilityが一回のrunで`visible`のままだったため1だった。ただしfixtureは別runで`visible/true→hidden/false→visible/true`の成功証拠があり、今回の実アプリlifecycleは成功している。fixtureの不安定なOS前面状態をアプリnative証拠へ繰り上げず、検査結果は個別check単位で台帳へ記録する。G3の接続・制御回帰・A-T1〜A-T3を完了し、P2を受入判定できる状態とする。

## 目的と権限

既存データを保護する保存共通層を作り、各画面へ接続する。実装担当はLuna。最新の実施範囲・停止条件は本書、技術契約はstorage-contract.mdとstorage-backup-format.mdを正とする。

次回Luna開始後は、旧「P1b後停止・P2禁止」を、G1合格後のG2→G3連続進行許可へ置き換える。P1b中のアプリ保存コード変更禁止は維持し、P2で契約内の変更を許可する。元必須条件を免除しない。モデルの自動切替・委譲を行わず、Astra/Solの実装承認を意味しない。

移行UXはボタン操作による自動転送を主経路、JSONファイル保存・復元を予備兼退避とする。同じ形式・復元pipelineを使い、旧データは削除しない。これらの実装はP3/P4。スマホはiPhone Safari/Android Chrome実機でタブ切替・画面ロック・中断再試行を後続確認し、PC狭幅を代用証拠にしない。今回は全面再設計をしない。

## 開始時

親とrepoのAGENTS.md、GOAL.md、STATUS.md、本書、storage-migration-delivery-plan.md末尾、storage-contract.md、storage-backup-format.md、storage-native-browser-environment.md、storage-s1-acceptance.mdを読む。

git statusと対象の既存差分を確認し、対象ファイル・変更境界をSTATUSへ記録する。未コミット変更を維持する。既存証拠は再利用し、旧P1b 3/3や31/41等を実行範囲の照合なしで継承しない。41条件を製品全体の完成率にしない。

## G1：P1bの不足だけを閉じる

対応：P1B-1〜3、BEH-8a/b・9a/bの既存条件。主対象はtools/test-storage-behavior-baseline.js、tools/storage-native-browser-check.js、既存fixtureと記録。

- import未完了を検証ツール／アプリ／環境に切り分ける。診断式が実行され値を返すか、クリック対象の可視性・位置・重なり、ダイアログ発生有無を先に確認する。空の診断値やタイムアウトだけでアプリ停止・OS阻害と断定しない。
- 実UIの保存slotと未保存draft、実export、import後の適用・永続化・他slotと無関係キー不変を確認する。ページ内保存関数呼出しでUIを代用しない。
- 実saveState→flush→persistState、公開担当とvisibilityの必要分岐、保存省略反例の既存証拠を点検し、不足だけ補う。DPSは少なくとも2対象に異なる非既定設定を保存し、実loadから新contextへの復元を識別可能にする。読込省略反例を維持する。
- 起動fallback・旧形式の基準を維持する。旧「workspace/live/legacy常に不変」等の矛盾した記録は該当箇所を訂正する。
- 現在利用可能なbrowser skill/toolの制約を確認して方式を選び、一時profile・隔離Originを使う。通常ブラウザのデータへ触らない。制御とnativeを分け、原因未変更の同一タイムアウトを反復しない。

合格：上記の変更前証拠を記録し、関連基準テストと狙った反例が期待どおりになる。手動確認が必要なら操作・入力・観測値・未達条件を示して停止する。本番不具合が判明した場合は修正案と基準への影響を報告し、この段階で無断修正せず停止する。

## G2：P2前半・保存共通層

G1合格後に続行。対応：Gate A第1〜3節、A-T3/5/6のP2対象部分。

storage-registry.js/storage-runtime.jsと焦点を絞ったテストを整備する。通常同期API、構造化した成功/失敗、boot、shared/exclusive、epoch、participantを契約どおり実装する。

未boot・stale・journalあり/不明・アクセス例外・未知IDでの書込拒否、非対応環境の契約分岐を検証する。未知journalは削除しない。実復旧はP3のため安全に起動停止する。完全backup codec・転送・架空の復旧成功は実装しない。

合格：共通処理の正常/失敗/拒否テストと反例、変更JS構文が成功。APIや共有契約の変更が必要なら最小判断事項を報告して停止する。

## G3：P2後半・既存画面接続

G2合格後に続行。対応：Gate A第4節、A-T1〜3、A-T5/6のP2対象部分、旧台帳の該当回帰条件。

- Gate A第4節の全writer/consumerを台帳access siteと対応付ける。管理→計算/DPS→表示設定/読取画面の小スライスに分割可能。
- 正常保存順・120ms debounce・slot競合を維持する。保存失敗の誤成功表示、live読込失敗、破損fallback等は契約の意図的変更として新旧基準を区別する。
- boot前暗黙write、遅延callback、pagehide/pageshow、旧sessionを保護する。無関係な計算式・DPS意味論は変更しない。
- 新モジュール読込に必要なHTML参照とapp-cache.js/service-worker.jsのローカル資材登録・版同期だけ許可する。DNS・CNAME・Pages設定・workflow・公開先・URL再配置は変更しない。
- 隔離実ページで実2タブのsharedとmaintenance exclusiveのbusy/解放、hidden保持、pagehide/pageshow再開を確認する。P3復元UIは作らず必要最小限の隔離検証入口を使う。合成イベントをnative証拠にしない。

合格：全接続対応表、正常回帰・意図的差分、P2対象A-T1〜3/5/6の証拠がある。A-T4〜6のP3復元部分は後続未達として明示。変更JS構文・関連テスト・差分を確認し、通常保存/slot/export/import/DPS対象切替と再読込が動く。未検証を合格に繰り上げない。

## 進捗・終了・除外

各スライス開始前に作業・対応条件ID・変更境界を示す。終了後STATUSと受入台帳へ達成数/分母、証拠（コマンドと結果、UI入力と観測、反例）、未検証、残見積もりを記録する。G1〜3と旧41条件は別集計とする。

合格なら定型的な承認待ちを挟まず次へ続行する。失敗は同じスライス内で原因を限定して修正できるが、未達で次段階へ進まない。手動操作・新権限・契約判断が必要、または3スライス連続で実質進捗なしなら具体的残条件と再計画を報告して停止する。自動Goal継続時も同じ環境失敗を反復しない。

検出器の一般化、無関係な品質改善、全リポジトリ網羅検査へ広げない。既存反例を維持し、変更した検査経路は正常/反例を確認する。変更なしで高コスト検査を繰り返さない。

P2完了後、成果・根拠・P3以降の残条件を報告して停止。P3〜P6、datasheet/生成データ、公開設定、commit/pushは対象外。残量はG1残件＋G2＋G3（接続群別の複数スライス）。回数は確約せずG1終了時に更新する。

## Lunaへの開始指示

```text
AGENTS.md、GOAL.md、STATUS.md、docs/storage-p2-luna-goal.mdと同書指定の契約・台帳を読み、設定済みGoalのG1→G2→G3を実施してください。
LunaでP1bの不足を解消し、合格後にP2前半・後半まで連続で進めてください。最新の進行許可は同書を正とし、旧P2禁止はその範囲で置き換えます。
開始時に既存変更境界、各着手前に対応条件を示し、終了後にSTATUSと受入台帳へ証拠・達成数・未検証・残見積もりを記録してください。
実UIの未達をfixtureや制御証拠で代用せず、原因未変更のタイムアウトを反復しないでください。手動操作・契約変更・新権限が必要なら具体的残条件を報告して停止してください。
未コミット変更を維持し、検出器の一般化や無関係な作業へ広げないでください。P2完了で停止し、P3以降、datasheet/生成データ/公開設定変更、commit/pushは行わないでください。
```
