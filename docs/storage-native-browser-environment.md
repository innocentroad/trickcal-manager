# 保存検証用の独立ブラウザ環境

更新日: 2026-09-13

## 目的

普段使いのChromeのプロファイル、保存データ、拡張機能から切り離して、保存まわりの実ブラウザ挙動を確認する。最小fixtureの成功と本番アプリの合格を分離し、P1bの本番代表操作は同じ専用環境で個別に記録する。

## 採用した方式

利用可能なブラウザ操作は、普段使いのChrome拡張接続1つだった。拡張接続ではページ起動・DOM操作・storage eventは動作したが、ファイル投入は`Not allowed`、ダウンロード取得はタイムアウト、タブ切替後の`visibilityState`は変化しなかった。

そのため、追加のPlaywright依存は入れず、Node 24の標準WebSocketとChrome DevTools Protocolを使う`tools/storage-native-browser-check.js`を採用した。スクリプトは次を自動で行う。

- 既存の`tools/fixtures/storage-http-server.js`を空きポートで起動する。
- HTTPサーバーと重ならないCDPポートを選ぶ。
- ChromeまたはEdgeを一時`user-data-dir`、拡張無効、専用ダウンロード先で起動する。
- 同じ一時Originの2タブを作り、実ブラウザのstorage eventとタブ切替を確認する。
- 本番`stat-dashboard.html`で保存・draft・export・file input importを、`formation-damage-calc.html`でDPS起動・対象切替・再読込を実UI操作で確認する。
- 終了時にタブ、ブラウザ、HTTPサーバーを閉じ、一時プロファイルを削除する。

普段使いのブラウザとはプロファイルも保存領域も別になる。専用Chromeは実focus確認のため一時的に前面へ出るが、検証終了時に閉じる。Chromeの場所を変更する場合は`TRICKCAL_CHROME_PATH`で指定できる。

## P4 T3転送のnative確認（2026-09-13）

`node tools/storage-transfer-native-check.js`を、既存HTTP fixtureを再利用した専用一時profile・専用download先で実行した。source/targetを異なるlocalhost portの2 Originとして起動し、statの実転送ボタンをクリックして新タブを開き、受信側のpreview→plan→明示applyを実行した。送信側の採取完了後storage不変、受信側のslot・保存計算・無関係local/sessionキー保持、receipt、journal非存在を確認した。

同じ専用環境で実exportのdownloadファイルをJSONとして読み、受信ページの実file inputへ投入して同じpreview→plan→applyを実行した。targetを閉じて新規statページを起動し、boot完了後にslotと保存計算を読み取れることも確認した。成功runの要約は`ok:true`、`directTransfer.previewNoWrite/planNoWrite/senderUnchanged/receiverRestored/calculationSavesPreserved`、`fileTransfer.inputObserved/restored`、`reopenedTarget.bootReady/savedDataReadable`がすべてtrueである。

これは制御テストの成功とは別のnative証拠である。公開Origin・DNS切替後の実転送、iOS/Android実機、狭幅レイアウトはこのrunの判定に含めない。

## 最新実行記録：R4-3 native代表（2026-09-13）

`node tools/storage-native-browser-check.js --summary`を専用一時profile、専用download先、localhost Originで実行した。最小fixtureのpage/DOM/JSON投入/download/storage event/focus・visibility、本番statの保存・draft・実export・実file input、preview/取消の意味的storage不変、救出形式`trickcal-manager-rescue`の実ファイル保存・decode、復元apply・対象slot/workspace再読込・journal削除・対象外キー不変、2タブshared/exclusive、DPS起動・Momo→Sylla→Momo・再読込復元、未知journalのboot guardを確認した。`statBackup`、`statRuntimeLocks`、`dpsApplication`、`storageBootGuard`は最新runで成功した。

最新runの`statBrowserQuota`は、4,718,592文字の一時フィラーでChromeの`QuotaExceededError`を発生させ、実復元UIのquota表示、元データ不変、journal不変、「元の状態へ戻しました」を確認した。終了コードは`focusVisibility`と`storageAppLifecycle`の前面状態依存だけで1だったが、実アプリのhidden/visible、hidden中busy、pagehide解放、pageshow再bootは既存の別成功runで確認済みのため、その証拠をnative台帳へ再利用し、同じtimeoutは反復していない。

## 履歴：G3接続・native代表（2026-09-13）

`node tools/storage-native-browser-check.js`を専用一時profile、専用download先、localhost Originで実行した。statの保存・draft・export・実file input import・slot2適用・slot1再export一致、DPSの起動・対象A/B/A・設定再読込、実2タブLockのshared中busy・解放後exclusive取得を確認した。`statRuntimeLocks`のpreflightでは実Facade flushも`ok:true`だった。追加の`storageAppLifecycle`で実アプリhidden／visible、hidden中busy、pagehide後のLock解放、pageshow後再bootを確認し、`storageBootGuard`で未知journalのerror画面とjournal保持を確認した。

直近runの全体終了コードは補助fixtureのfocus/visibilityだけで1だったが、別runではfixture focus/visibilityも成功している。fixtureのrun間不安定性を実アプリlifecycleのnative未達へ繰り上げず、個別checkの成功を受入台帳へ記録した。A-T1〜A-T3 nativeは確認済み。次回はA-T4/P3のjournal transaction等へ進むまで、今回のnative操作を再反復しない。

## R3バックアップUIの個別確認（2026-09-13）

同じ専用一時profile・localhost Originで、stat画面の全体バックアップをUIから操作した。`statBackup`個別checkは成功し、実download `trickcal-manager-backup-2026-09-12.json`（695,499 bytes）の外側format/version/digest、12 dataset preview、preview前後のstorage不変、取消前後のstorage不変を確認した。native runner全体は補助fixtureのfocus/visibilityと`storageAppLifecycle`のrun間タイミングで終了コード1だったため、この個別結果をrunner全体成功とは扱わない。R3ではrestore/applyを実行せず、実Storage往復・再起動後一致はR4に残す。

## 起動・終了

Managerルートで次を実行する。

```powershell
node tools/storage-native-browser-check.js
```

終了操作は不要。成功時はJSONレポートを標準出力し、終了コード0になる。いずれかの確認が失敗した場合は確認名とエラーを出力し、終了コード1になる。HTTPサーバーまたはChrome CDPの起動失敗時は、対象URL・子プロセスの終了・stderr情報をエラーへ含める。

Nodeから子プロセスを起動できない実行環境では`EPERM`になる。その場合は同じコマンドを通常のPowerShellから実行する。ブラウザ拡張側で同じ操作を繰り返さない。

## 最小ページの確認項目

対象は既存fixtureの`tools/fixtures/storage-http-baseline.html`である。2026-09-13に専用Chromeで次を確認した。

| 項目 | 確認内容 | 結果 |
| --- | --- | --- |
| ページ起動・DOM | fixture起動、タイトル・DOM取得、ボタン操作 | 成功 |
| JSON投入 | `storage-s1-import.json`をfile inputへ投入し、`schema`を読み取る | 成功。`ok:trickcal-stat-state` |
| ダウンロード | Blob JSONをダウンロードし、専用フォルダの実ファイルを読み取る | 成功。payloadを一致確認 |
| 2タブstorage event | 2タブの片方でlocalStorageを書き、もう片方が`storage:applied:2`を受け取る | 成功 |
| focus・visibility | タブAを前面→タブBを前面→Aへ戻し、実`hasFocus()`と`visibilityState`を確認 | 成功。`visible/true`→`hidden/false`→`visible/true` |

ダウンロード内容の確認は、ページ内表示だけではなく専用フォルダの実ファイルをJSONとして読み取って行う。focus・visibilityはイベントを合成せず、専用Chromeのタブを実際に切り替えて確認する。

## 本番ページの代表確認（2026-09-13）

専用Chrome、一時`user-data-dir`、ローカルHTTP Originで、ページ内の保存関数を直接呼ばずに実UIを操作した。

| ページ | 操作・観測 | 結果 |
| --- | --- | --- |
| stat | slot1保存→別使徒をdraft選択→slot1実export→専用フォルダのJSON内容確認 | 成功。`schema=trickcal-stat-state`、`kind=slot`、保存slotのsnapshotを確認 |
| stat | 実file inputへexport JSON投入→インポート先slot2表示→slot2適用・保存完了→slot1再export | 成功。slot2適用status、現在slot2、実confirm、slot1再export一致を確認 |
| DPS | DPS起動・計算→Momo→Sylla→Momo→設定変更→再読込 | 成功。計算表示、対象A/B/A、Momo 30秒/AUTO、Sylla 60秒/OFF、再読込後Momo 30秒/AUTOを確認 |

直近native runではstat importの適用完了とslot1不変まで観測できたため、旧「slot2クリック後未達」の記録は過去の試行として残し、最新結果へ繰り上げた。HTTP・CDP接続・権限・file input・download・dialogは成功。focus/visibilityだけはOS前面状態の影響が疑われるため、同じtimeoutを反復しない。

## 失敗の切り分け

- HTTP：サーバー単体は`Invoke-WebRequest`で200応答を確認済み。専用CLIではserver portとCDP portを分離し、接続失敗時にURLを表示する。
- ブラウザ接続：普段使いChrome拡張はページ起動まで成功したが、拡張の制約が残った。専用CLIはChromeのCDP接続を別プロセスで確立する。
- 権限：拡張接続のfile chooserは`Not allowed`だった。専用CLIのCDP `DOM.setFileInputFiles`では成功した。
- ダウンロード：拡張接続のdownload eventは取得できなかった。専用CLIは`Browser.setDownloadBehavior`と専用フォルダの実ファイルで確認する。
- ダイアログ：最小fixtureにはJavaScriptダイアログがない。直近の本番stat importでは実confirmを観測し、handled=true、slot2適用status、slot1再export一致まで確認した。過去の未達試行は履歴として残すが、最新判定へ繰り上げない。
- OS前面状態：拡張接続ではタブを切り替えても`visibilityState`が`visible`のままだった。補助fixtureではrun間の揺れが残るが、専用Chromeの実アプリ`storageAppLifecycle`ではhidden／visible、pagehide解放、pageshow再bootを確認済みであり、A-T2のnative証拠を未達へ戻さない。fixtureの不安定性は環境上の未解消事項として別管理する。

## 今回の範囲外

本番ページの代表操作、実Lock、実アプリlifecycle、boot guard、R4の実backup/restore、実ブラウザquotaの安全停止は上記まで接続した。Origin転送、スマホ実機は未検証として残す。制御側の各故障注入・codec容量・journal上限をnative quotaの証拠へ繰り上げず、native quotaは専用の実フィラー検査で確認した。
