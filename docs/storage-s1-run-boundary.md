# S1再計画の変更境界記録

更新日: 2026-09-13

## 記録上の制約

前回の再計画導入時は、過去の未コミット変更を含む作業ツリーの開始直後に完全なdirty一覧と対象ファイルのハッシュを保存できていなかったため、当時の着手時点の完全な差分・ハッシュ比較は再現不能である。この欠落はS1の達成証拠にしない。既存変更の一括復元・削除は行っていない。今回のN1〜N3については、下記「今回（N1〜N3）着手時の境界」に実装開始前の一覧と対象ハッシュを別途記録した。

## 今回の対象境界

今回の実作業で変更した範囲は、storage検出器、基準テスト、S1受入台帳・保存経路記録、検証用fixture、GOAL/STATUSである。アプリ保存コード、datasheet、公開設定には書き込みを行っていない。作業ツリーの他の未コミット変更は利用者の既存変更として維持し、今回のハッシュ記録だけでそれらとの完全な差分分離を主張しない。

## 終了時SHA-256

開始時値ではなく、2026-09-12の最終検査直前に取得した値である。

| ファイル | SHA-256 |
| --- | --- |
| `GOAL.md` | `FFD8D9A745AF3E1B030015C98B74CA84A696DA2CAB3759665B11FF2D688F5CE8` |
| `STATUS.md` | `BD6BC7FAA3240A513D83F817AFD63666E5ACB54090B7F4CF4B3BE912D2326108` |
| `docs/storage-s1-acceptance.md` | `4F694CA1BFA08217FE037CC14A161506343C9A6969C4DA3EB1595D151E3C3F52` |
| `docs/storage-inventory.md` | `51D4C115A9007A845C4F675CA1B7B903207FF6E7E3EE869934A14ECE2E7748D0` |
| `tools/storage-access-detector.js` | `B4BAEFB1902EBAB09FA8A2CC1F697EE53E94DEDB54C94679FF4F9708C90B351E` |
| `tools/test-storage-baseline.js` | `2065315EC9FCF010E99411C440D3D92F484FF6284F2872783254DBB001605A13` |
| `tools/test-storage-behavior-baseline.js` | `8DB8C4CEAEACAE8462F2BF44C4C799B9265D477A13410DCB280AAFA11ED993E7` |
| `tools/fixtures/storage-s1-import.json` | `284688D25E911454D224008DACCBB64E8C9193786369B4A8D28E243558F653D2` |
| `tools/fixtures/storage-s1-native-stat.html` | `61CF1292B87244416D3F0C198E28148A823B84F1340C9ADA4447705E1571AEF9` |

この記録の不足は、S1受入台帳の固定41条件とは別の作業証跡上の残条件として扱う。

## P1a開始時の境界（2026-09-13）

P1a着手前に`git status --short`で既存のdirty一覧を確認し、既存変更を保持した。P1aの実装対象は次の3つのtoolsで、記録対象をSTATUS・固定41条件台帳・本境界記録に限定した。

| 区分 | ファイル |
| --- | --- |
| L1/L2 | `tools/test-storage-behavior-baseline.js` |
| L3 | `tools/test-storage-baseline.js`、`tools/storage-inspection.js` |
| 証拠記録 | `STATUS.md`、`docs/storage-s1-acceptance.md`、`docs/storage-s1-run-boundary.md` |

着手時の全dirty一覧は直前のN1〜N3境界から変わっていないことを確認した。ただし、このP1a開始直前に対象3toolsのSHA-256を別保存する操作は行っていなかったため、開始時ハッシュの完全な機械比較は主張しない。P1aの終了時は`git diff --check`と対象差分を確認し、既存変更の一括復元・削除は行わない。アプリ保存コード、datasheet、生成物、公開設定は終始対象外である。

## 今回（N1〜N3）着手時の境界

取得日時: 2026-09-12。以下は実装開始前に取得した作業ツリーの一覧である。既存の利用者変更は維持し、対象外ファイルへ書き込まない。対象ツール・台帳・GOAL/STATUSの開始時SHA-256を記録した。

### dirty一覧

```
M .github/workflows/pages.yml
M .gitignore
M GOAL.md
M README.md
M STATUS.md
M app-cache.js
M docs/formation-share-url-format.md
M enemy-status.html
M formation-damage-calc.html
M formation-damage-calc.js
M formation-damage-dps-prototype.html
M formation-dps-calc.html
M formation-share-catalog.js
M formation-share-create.js
M formation-share.html
M formation-share.js
M index.html
M service-worker.js
M stat-dashboard.html
M tools/generate-all.bat
M tools/git/push.bat
M tools/test-formation-share-image.js
?? AGENTS.md
?? docs/domain-migration-design.md
?? docs/domain-rollback-recovery-design.md
?? docs/formation-share-maintenance-design.md
?? docs/formation-share-maintenance-goal.md
?? docs/formation-share-maintenance-skill-integration.md
?? docs/public-url-design.md
?? docs/storage-inventory.md
?? docs/storage-migration-roadmap.md
?? docs/storage-s1-acceptance.md
?? docs/storage-s1-closure-instructions.md
?? docs/storage-s1-followup-design.md
?? docs/storage-s1-foundation-plan.md
?? docs/storage-s1-review-fix-instructions.md
?? docs/storage-s1-run-boundary.md
?? docs/storage-s1-second-followup-design.md
?? formation-share-display-data.js
?? recover-20260912.html
?? tools/fixtures/formation-share-catalog-v1.json
?? tools/fixtures/storage-http-baseline.html
?? tools/fixtures/storage-http-server.js
?? tools/fixtures/storage-s1-import.json
?? tools/fixtures/storage-s1-native-stat.html
?? tools/formation-share-asset-manifest.json
?? tools/generate-formation-share-display-data.js
?? tools/package-lock.json
?? tools/package.json
?? tools/storage-access-detector.js
?? tools/storage-inventory.json
?? tools/sync-formation-share-assets.js
?? tools/sync-formation-share-catalog.js
?? tools/test-domain-rollback-recovery.js
?? tools/test-formation-share-assets.js
?? tools/test-formation-share-catalog.js
?? tools/test-formation-share-display-data.js
?? tools/test-formation-share-maintenance.js
?? tools/test-storage-baseline.js
?? tools/test-storage-behavior-baseline.js
?? tools/validate-formation-share-maintenance.js
```

### 対象ファイルの開始時SHA-256

| ファイル | SHA-256 |
| --- | --- |
| `tools/storage-access-detector.js` | `B4BAEFB1902EBAB09FA8A2CC1F697EE53E94DEDB54C94679FF4F9708C90B351E` |
| `tools/test-storage-baseline.js` | `2065315EC9FCF010E99411C440D3D92F484FF6284F2872783254DBB001605A13` |
| `tools/test-storage-behavior-baseline.js` | `8DB8C4CEAEACAE8462F2BF44C4C799B9265D477A13410DCB280AAFA11ED993E7` |
| `tools/storage-inventory.json` | `8D2FEEC124E9AEA2F85458E226105028CEB99E9F9F68BDCE890F53E2C8DE90E5` |
| `docs/storage-s1-acceptance.md` | `D1A0C90568BA9EF12907CFB137BE2D35655711302B4E30E603474E49DE38BADF` |
| `GOAL.md` | `383781B4D2684D3409151DB385D27A8B2E778957271A955AD64EF1559CE58ECA` |
| `STATUS.md` | `F28E9ED672271F45768076CE6EBC019DB84D4BF0908B8EEE0991BC3DBCB78E28` |

今回の実装差分は上記の保存検査tools、隔離fixture、受入台帳・関連文書に限定する。アプリ保存コード、datasheet、生成物、公開設定は対象外である。

今回のN1〜N3で新規作成したファイルは、`tools/storage-inspection.js`（共通検査本体）と`tools/inspect-storage.js`（CLI）の2ファイルである。その他の今回対象ファイルは、着手時dirty一覧に存在していた既存変更または既存未追跡ファイルを維持した上で更新した。

## 今回（N1〜N3）終了時の確認

最終検査後のSHA-256。開始時ハッシュを記録した対象は開始値との差分を確認し、既存dirty変更は復元・削除していない。`docs/storage-s1-run-boundary.md`自身は、この追記でハッシュが変わるため一覧に含めない。

| ファイル | SHA-256 |
| --- | --- |
| `GOAL.md` | `A13E9E5D6B62295F37E6D46F657464B3447D0A680FA509CD7BCD8D56A16F9EF6` |
| `STATUS.md` | `3004606E992198A9B617A3EA2702BFE0C7C1649039C4E1AB4E62B084E9DC3E53` |
| `docs/storage-s1-acceptance.md` | `A96B4EA27F0817639334383C111D2E39EA71EBF34600CF7A82E954692BBDA0F9` |
| `docs/storage-s1-foundation-plan.md` | `338901F740391E1E1EF19FBBC44065E936A25EA1FF0B7B03A55945753D333467` |
| `tools/storage-access-detector.js` | `FB8C4E16798A95938CC7607D29FB6C6DE785DDFB7AE179E8F9E3D094310B87D7` |
| `tools/storage-inspection.js` | `E5BBBF5904CEB8CC08C1F05C34BBC8B7B703DDC110E56AF5BD56CA4F2059FB50` |
| `tools/inspect-storage.js` | `DC5ACDAC89E3753E625A738ACE3E2AE9568E5B5A5927E072CDAB1F46EA02524F` |
| `tools/test-storage-baseline.js` | `F406480D6AD2499C52F34B56E4D60EFC5A9FAF70D2E80C88449FFE0BC9C0F162` |
| `tools/test-storage-behavior-baseline.js` | `6FC1971D7C6D22F8AF0B3197108518191B29E708367A3ABF557F13885BDB2BCC` |

## P1b開始時の境界（2026-09-13）

着手前に`git status --short`を確認し、P1aからの既存dirty変更を維持した。P1bの対象は、現行保存実入口を本番関数で検証する`tools/test-storage-behavior-baseline.js`、および結果を記録する`STATUS.md`・`docs/storage-s1-acceptance.md`・本記録・`docs/storage-migration-delivery-plan.md`に限定した。アプリ保存コード、datasheet、生成物、公開設定は変更境界外とした。

`tools/test-storage-behavior-baseline.js`はP1aで既に未追跡だったため、P1b開始直前の分離SHA-256は取得していない。この不足を完全な差分分離の証拠にはしない。既存dirty一覧の他ファイルは読み取り・保持し、一括復元・削除は行っていない。

## P1b終了時の確認（2026-09-13）

P1bで実際に変更した実装検証ファイルは`tools/test-storage-behavior-baseline.js`だけである。追加したのはasyncな実関数抽出、export/import、startup/fallback、DPS起動相当・対象切替の制御assertion。記録文書はSTATUS・受入台帳・実施計画へ結果を追記した。対象外のアプリ保存コード、datasheet、生成物、公開設定は変更していない。

制御証拠は、実`exportStateFile`・`parseImportedState`・`applyImportedState`・`applyStateSnapshot`・`loadState()`・`PrototypeDpsController.refreshAvailability()`、`RecordingStorage`、隔離DOM境界で取得した。native実DOMのdownload/file chooserとDPSタブ操作はブラウザ環境阻害のため未取得であり、タイムアウト操作を反復していない。

P1b終了時の対象ハッシュ（文書追記前）：

| ファイル | SHA-256 |
| --- | --- |
| `GOAL.md` | `A5B92077A5A6289F29BC171677EEC7110560F927FB815546A742B633B9BF4D3E` |
| `STATUS.md` | `837C489E76BB13C3F26C9C638C7F45499E8A491C264E3F5EDBD1C14FFDD51CCE` |
| `docs/storage-s1-acceptance.md` | `F10C3D94C213482207E66765455BFF8F919D6F22E833D1D52B2E9D66186778CE` |
| `docs/storage-migration-delivery-plan.md` | `E46B8FA810E0615914AF670B63D7B9479348F60EFB1B472882DACBF038268DD6` |
| `tools/test-storage-behavior-baseline.js` | `EEF3B002EBB9D6D2960C8708C98A9629D5E8C4F02A73EC9BB51953C515855E35` |
