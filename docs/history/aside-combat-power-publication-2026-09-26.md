# v22アサイド・v29戦闘力と保存移行の対象限定公開（2026-09-26）

## 範囲と差分レビュー

- 公開source commit: `c6ccdaaaa6418286800d764fd5a05cf1ca2d5ee7`。v22アサイド、v29戦闘力、育成値上書き・旧snapshotの安全な再計算、比較スロット保存、使徒データ表示、生成器・対応生成データ、保存台帳・焦点テスト、fix記事1件の計24ファイルを対象限定commit・pushした。
- 前回公開baselineは`c3779e2d1fcad542cec093d5e7308a585ef109c0`（candidate `cf2fa382b2f2a0b1`）。生成差分ログの1,865値変更は、79使徒の戦闘力入力列と40件のアサイド列の移行に限定された。`stat-dashboard.html`の`statData.js`版番号は対応生成物のhashと一致する。
- 未公開の敵研究試作、AssetBundle抽出、research-viewer、xlsx、ジョアン画像差し替えはsource commit／公開artifactへ含めない。保存台帳は敵研究を公開実装とは別のローカル試作として分類するが、試作本体は配信しない。計算用係数を保持した`apostles.js`・`statData.js`は標準生成済みのバイト列を使用し、手編集していない。
- 最終構成の通常`prepare`は生成・manifest・public-site・HTTP検査、candidate・staging照合まで成功。保存系基準テストA/Bと比較スロットの隔離ブラウザ焦点検証は公開前に成功済み。同一構成のxlsx生成は繰り返していない。

## 候補・受信先・run

- bundle: `tmp/publication-20260926075503531.json`、candidate: `a0ab238c6633ffe8`、content digest: `fb78266760df92fe1b960cecdda4bafd5fbbc3c703a07d7ca97ceab2ad9ae1b5`。previous releaseは成功済み`backups/publication-history/latest-new.json`から取得。
- new: 19更新・削除0をdry-run確認。artifact commit `6d451aaeb41b7af260b6eb2e23e7204ed0919b95`、receipt v2 `tmp/delivery-a0ab238c6633ffe8-new-f8e9364888cb.json`、[run 36228415071](https://github.com/innocentroad/trickcal-manager-site/actions/runs/36228415071)。通常承認後にdeploy成功・identity一致。output digest `c9b703cff6b4c5fa`。
- legacy: new成功後、同じcandidateで19更新・削除0をdry-run確認。artifact commit `5cd2d4e87454d37021dac76e0094444560b9923c`、receipt v2 `tmp/delivery-a0ab238c6633ffe8-legacy-d10d9eaf205f.json`、[run 36228574519](https://github.com/innocentroad/trickcal-manager/actions/runs/36228574519)。通常承認後にdeploy成功・identity一致。output digest `c6348a16ef994d21`。
- 配信成功記録は`backups/publication-history/a0ab238c6633ffe8-{new,legacy}.json`と各`latest-*`。転送は所有ファイル台帳の既存手順を使い、receiptとcandidateをindex・完全SHAのcommitへ照合した。

## 公開後の代表確認

- new `https://trickcal.irlab.dev/manager/?view=settings`／`https://trickcal.irlab.dev/calc/`、legacy `https://innocentroad.github.io/trickcal-manager/stat-dashboard.html?view=settings`／`https://innocentroad.github.io/trickcal-manager/formation-damage-calc.html`を一時Chromeプロファイルで確認。実利用の保存領域は使用していない。
- 両profileで管理・計算画面が起動し、キャロット本体Lv1・★3・学年1・A3 Lv4はHP 5,011、内部HP 5,011.02、戦闘力 5,789。比較スロットは79使徒分の版2内訳を保存し、再読込後もrevisionと件数が安定した。
- 版なし旧snapshotの代表fixtureは、管理画面を経由せず計算画面へ直接アクセスすると現行版2・HP 4,362へ再構築され、元の旧保存HP 0と版なし状態は不変。内訳不足のfixtureでは旧HP 99,999を通常結果へ流用せず「—」とし、DPS入力も停止。再設定・再保存の案内を表示した。管理画面での復旧操作は公開前の隔離ブラウザ焦点テストで確認済みで、公開サイトでは繰り返していない。
- 記事`20260926-fix-aside-combat-power`は両profileで2026-09-26の1件。重要なドメイン移行通知のデータ資材は前回版から無変更で、両公開URLから読込可能。`tools/trickcal_datasheet.xlsx`と`enemy-research.js`は両サイトで404であり、公開manifest・stagingにも含まない。
- newの初回ブラウザ読込で既存`Skill_S_Sari.webp`が一度HTTP 503になった。候補・受信repoに同画像が存在し、同じ公開URLの再GETはHTTP 200（4,476 bytes）。今回の変更由来の404・重大な実行時例外は検出していない。瞬間的な配信エラーの全利用者への影響は未確認。

## 保全と残件

- 編集直前dirtyのrepo外バックアップ・SHA-256台帳: `D:/Games/etc/trickcal/backups/aside-combat-publication-20260926-165250/MANIFEST.csv`。対象外の追跡済み6ファイル・未追跡13ファイル・削除状態の画像2点を一時退避し、公開後に復元した。台帳の元状態と全件一致、restore mismatch 0。stash・reset・別cloneは使用していない。
- 戦闘力の非戦闘時攻速補正、RenewaのAwaken実体との対応、ゲーム内全条件の完全再現は未確定。旧保存で育成条件が不足する場合は利用者による確認・再設定が必要。敵研究試作の複数キー保存の原子性は今回の公開保証ではない。sourceへの本記録commitのためだけにサイトを再生成・再公開しない。
