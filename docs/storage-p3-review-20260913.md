# P3実装レビューと修正設計

最新補足：[重大修正とP4転送設計](storage-p4-transfer-design.md)。利用者方針により、計算設定の完全再現は延期可能。以下のレビュー事実は維持するが、F3のDPS未知版だけをP4阻害条件にせず、安全な除外を認める。P4設計は先行済み、実装は重大条件C1〜C3合格後とする。

2026-09-13。実装状況の確認。アプリ・実行テストは変更せず、既存未コミット変更を維持した。P4設計への進行は保留する。既存Gate A/Bを変更して現在の実装を追認しない。

## 判定

P3完了・必須条件残り0という判定は撤回する。以下4件は検査器の細部ではなく、復元後の利用継続、保存内容の意味、異常時の救出に直結する。

### F1 / P1：復元後の新規セッションが起動できない

`storage-runtime.js`の`validateSessionMarker`はrestoreSerial>0かつsession markerなしをstaleで拒否するが、Gate A §3.9のsession削除・再構成・再初期化が接続されていない。通常bootと互換bootに共通。`storage-bootstrap.js`の再読み込み案内だけではmarkerなしを解消できない。

実runtimeにrestoreSerial=1のmeta、空sessionStorage、locks=nullを渡した制御確認で、bootは`{ok:false,code:"stale",operation:"boot",id:"control.sessionEpoch",retryable:false}`。新規タブ等の空sessionを再現したもので、nativeの新規タブ確認は今回未実施。

### F2 / P1：バックアップがGate Bの正規化形式になっていない

`storage-backup.js`の`createDatasetValue`は各storage rawをentriesに格納し、`buildRestoreEntries`がそのまま戻す。runtimeのplanもdesiredRawに転記する。Gate B §2–3が定めるslots/currentのsnapshot形式、live/legacy再構成、新workspace・同期ID・revision生成、テーマ4キー統一を実装していない。

特にstored-onlyはworkspaceをabsentにするだけで、live優先のcanonical currentへの変換ではない。元データ内のdraft/live/legacy差異や古い運用IDを持ち越す。rawコピーの一致を確かめても契約上の復元確認にはならない。

### F3 / P1：未知の明示版を受け入れる

`validateRawEntry`はDPS等を浅いobject検査で受理する。実`createBackupPackageFromEntries`に`dps.settings`のrawとして`{"settingsVersion":999}`を渡すと`ok:true`。Gate B §3/B-T2の未知版拒否に反する。対応範囲は確定仕様にあるdatasetと版・構造だけとし、汎用validator開発へ広げない。

### F4 / P1：起動不能時・互換環境で救出経路を利用できない

管理画面の`exportRescueBackup`は`beginMaintenance`成功を要求する。その入口はready以外と互換環境を拒否するため、起動失敗やWeb Locks非対応のときに救出できない。独立`storage-recovery.html`もjournal再試行のみでraw救出UIがない。Gate A §3互換動作/§5が要求する読み取り専用救出への接続が必要。

## 証拠と限界

- このレビューで`node tools/test-storage-backup.js`、`node tools/test-storage-runtime.js`、`node tools/test-storage-restore.js`はいずれも成功した。
- F1/F3は本番モジュールを使った短いNode制御確認で再現。F2/F4は実装と確定契約の照合。今回native検証・故障注入追加は実施していない。
- 旧R4-3の成功証拠は破棄しないが、4件の反証を打ち消す材料にはしない。最新native全体終了コード1を全体成功に言い換えない。

## 次の修正設計（実装未着手）

### Q1：復元後の起動を成立させる（F1 / A-T6）

- fresh boot時に確定epochとsessionを照合し、許可されたworkspace/comparison/reloadContextだけを削除・再構成する。session markerは必要な処理とreadback成功の後に更新する。
- 古いメモリを保持する実行中runtimeは保存不可のまま再初期化させる。markerだけを合わせて古いメモリの保存を許可しない。
- 復元後の空session、新旧marker、session操作失敗を実boot経路で検証。local canonicalと無関係なsessionキーは不変。最後に独立ブラウザで新規タブの起動を1例確認する。

### Q2：Gate Bどおりの採取・復元と検証（F2/F3 / B-T1/B-T2）

- 確定済みdataset形式とcurrent-tab/stored-only選択規則にcodecを合わせる。復元時に運用フィールドとmirrorを再構成する。
- 既存旧形式converterは必要部分だけ再利用し、対応版以外を正規化で握りつぶさない。現実装raw形式のファイルを正常な契約v1と黙認しない。既に配布済みファイルがある場合は互換方針を決めてから変更する。
- draft/live/legacyが異なる例、themeが異なる例、運用ID/revision再生成、未知版の拒否・書込ゼロを同じcodec→plan→apply経路で確認。raw一致ではなく新しい実load側が読む意味を確認する。

### Q3：独立した救出を接続しP3を再判定（F4 / A-T4/B-T1）

- 通常boot/maintenance成功を前提にしない、allowlist限定の読取専用救出入口を用意。flushや自動修復書込みを行わず、読めたraw・読取失敗・journal等を契約の救出形式として扱う。
- 独立復旧画面から明示操作でダウンロード可能にし、boot失敗画面から案内する。正常復元用ファイルと混同させない。
- 壊れた保存値、壊れたjournal、Locks非対応で救出可能か確認し、対象データへの書込みゼロを検証。実ダウンロードの代表例を確認する。
- Q1〜Q3と既存証拠からP3条件を再集計する。既存quota/native成功証拠は再利用し、無関係な検出器拡張や前面timeout反復はしない。

各スライスの合格後に次へ進む。見積もりは3スライス（Q2は複数作業単位になり得る）。未達なら具体的な反例と残条件で停止する。P4はP3再合格後にOrigin転送だけを設計する。今回は実装、commit/push、公開設定変更、自動実行Goal有効化を行わない。
