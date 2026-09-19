# 教主の権能をWebPへ変更（release-source、2026-09-19）

## 変更

`stat-prototype.js` の `getFormationMasterPowerMediaPath()` が権能MP4を返し、`renderFormationMasterPowers()` が未選択時から `preload="metadata"`、選択時は自動再生するvideoを生成していた。権能動画専用のplay/pause/load処理やvideoイベント登録はなかった。

権能カードのアートを、既存 `img/Card/権能_<権能名>.webp` を参照する `img` 要素へ置き換えた。公開runtimeがあれば `assetUrl()` に渡し、source直開きでは既存の相対パスを使う。時刻fragment、autoplay、loop、preload、動画フォールバックはない。カード選択、保存値、チェック、コスト、名称、CT、効果・説明、クリック領域は維持した。CSSは権能アート対象だけを `object-fit:contain` に変更し、コストbadge内のimg寸法は影響させない。

## 削除した動画とバックアップ

以下の正確な6ファイルだけをsourceから削除した。同名WebPは維持している。

| 削除したsource path | SHA-256（削除前） |
|---|---|
| `img/Card/権能_ヌルゲーシールド.mp4` | `180F14E0A76D271B7395BABCDC2B7C10F94A04B0DC11DE26F824A2C22DF70B5D` |
| `img/Card/権能_ポップピンスター.mp4` | `18C8BAC38DF411EA13FC752C53F3DE29D5EA55B74340C210E25768BBCA4DD3BB` |
| `img/Card/権能_ボディブロー.mp4` | `D09D0C99FCC3563D67703D637E655BF3B4CF10D505D12511FD8E312BD88E5718` |
| `img/Card/権能_マジ天罰.mp4` | `8F840C40916A9E54B5F0242115A5DF6E875C2AF369D38DC930FA244681D588B` |
| `img/Card/権能_安心毛布.mp4` | `2E56266A6592181388F71F3A62EC07182049649A2F1A46C60ADEBC23EFD7A64A` |
| `img/Card/権能_急発進.mp4` | `BC192729BB080744EF19A3FA33B989F5533F4916456033C264E85FE32E3ABFBC` |

編集対象と上記6動画の編集前コピーは `D:/Games/etc/trickcal/backups/master-power-webp-20260919-01/release-source-before` に保存し、sourceとのSHA-256一致を確認した。`stat-prototype.js`（`F30A3988C5E9C605A1248357F5077BC73AD3DA2C0067A036B5C6A2A556E4689A`）、`stat-dashboard.css`（`C8DAA30F8EE141CFFB730541FE92A9CD80B98A9D5AC0180E17C912B48B2BC33D`）、作業記録更新前の`GOAL.md`（`C856FC52A7A59C477EA3FFA6F4BB93994715289B05E6E184B6F18FC2039340B8`）と`STATUS.md`（`826AAF0546A6B819A5E7430056A150ADEC5CA32C53815967BC37D144EDA89091`）も保存済み。動画の復元元は同バックアップ内の同一相対パス。

## 参照と生成

- `image-preload.js` に権能動画・権能アートの先読みはない。既存の通常使徒／スキル先読みを変更していない。
- 権能MP4を指す他の動的生成・HTML参照はなく、public manifestは既存の `img/` directory assetをnew／legacy両profileへ含める。個別manifest追加は不要。
- Service Worker生成元に権能MP4の個別参照はなく、directory asset由来の生成キャッシュ一覧から削除対象が除かれる。Service Workerの更新方式・キャッシュ削除は変更していない。
- 既存の生成器で `tmp/public-master-power-webp-20260919` を作成（2,176 files、digest `d50dae89a67951b7f254033ac8a3f114f9f933f6e9300fb4d67b637f89337566`）。newとlegacy双方で6 WebPが含まれ、6 MP4は不在。テストファイルはmanifest／生成artifactへ含まれない。

## 検証結果

- `node --check stat-prototype.js`、`node --check tools/test-formation-master-power-webp-native.js`、`git diff --check` 成功。
- `node tools/test-formation-master-power-webp-native.js` をsource、新生成root、legacy生成rootで実行。隔離・新規Chrome profileにて1280×900と375×844、ライト／ダーク表示を確認した。6画像すべてcompleteかつnaturalWidth=148、権能カードにvideo/sourceなし、選択→解除→再選択→再読み込み後の保存状態が一致、初期表示・編成画面への切替・選択変更・再読込を通じ対象MP4 network requestは0件。
- newの画像URLは `/img/Card/権能_<名前>.webp?v=1132df9a42d35355`、legacyは `/trickcal-manager/img/Card/権能_<名前>.webp?v=1132df9a42d35355`。profile固有asset baseとversion queryが保たれている。
- 共有回帰：`node tools/test-formation-share-image.js`、`node tools/test-formation-share-display-data.js`、`node tools/test-formation-share-assets.js`、`node tools/test-topbar-navigation-native.js` 成功。隔離native検査は指定payloadの共有ページで画像broken 0を確認。共有PNG exportは今回ライブ操作で再確認していない。共有コードは変更していない。
- 画面キャプチャは `tmp/master-power-webp-screenshots-source/`、`tmp/master-power-webp-screenshots-new/`、`tmp/master-power-webp-screenshots-legacy/` にsource/new/legacy別、1280/375幅、light/dark状態で保存した。

## 未確認・後続

- 本番／公開サイト検証はしていない。commit、push、公開、workflow実行なし。
- main側は読み取り確認のみで、`stat-prototype.js` に旧MP4実装が残る。後続main作業ではURL／DOM変更、権能画像CSS、6動画の削除、焦点回帰テストをこの修正範囲だけで反映する。
- 隔離したテーマ見た目状態ではライト／ダーク両方の権能表示を確認した。別途、managerのテーマ操作後にroot theme・body class・保存値が一致しない状態を観測したが、これは本変更外のテーマ同期課題として修正していない。
- `tools/test-versioned-image-cache.js` はこのrelease-sourceに存在しない。代替としてnew／legacy生成後のversion付きasset URLと実画像読込をnative browserで確認した。
- 既存dirtyは保持しており、今回を含むsource変更は未公開のまま。
