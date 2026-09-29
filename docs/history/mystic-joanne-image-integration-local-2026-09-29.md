# ミスティック・ジョアンスペル・追加画像のローカル統合 — 2026-09-29

## 結果と範囲

保存済みxlsxに対して、種族名の移行、ジョアンスペル画像名、現在の画像差分を標準生成・ローカル確認した。ユーザーは生成直前にExcel編集・保存の終了と他の生成停止を確認し、用途未確認の画像群も公開対象と指定した。画像の用途を推測して機能へ接続する変更はしていない。

作業branchは `release-source`、開始HEADは `ecb8460b1c81861c29d01701e0f39679367a386e`。作業ツリーには本件以外の既存dirtyが多数あり、変更・生成結果を選別してcommitしていない。xlsxは編集せず、SHA-256 `5650E2F75C89C775DA84E92B10394649591A9FA530F3394C2990FC8EF8D52028` のまま。

今回の標準生成で、使徒種族、研究種族、カード画像対応とその派生共有表示・資材版を更新した。カードID `spell_joanne_prayer_power`、正式名称「ジョアンの祈りの権能」、効果・数値・共有辞書番号は維持。名称変更は画像ファイル名への対応であり、xlsx上のカード名変更ではない。

## 入力画像の分類

現在の `img/` 差分は96件：82パス追加、8パスの同名内容差し替え、6旧パス削除。内容hashで照合したところ、以下はバイト一致の移動／改名だった。

|旧パス|新パス|SHA-256|
|---|---|---|
|`img/Card/Spell/SpellCardIcon_58.webp`|`img/Card/Spell/ジョアンの祈りの権能.webp`|`E2343B9CD372E43AA47D9E89DB5BE8F6BECBB39BAA8237A8E6AB57D1B1777F87`|
|`img/ItemSlot_1.png`|`img/Slot/ItemSlot_1.png`|`BD063D7A9EC773179435BB03973270C1D05F14E6DF7A857CF8AE25E6EBBAE4E3`|
|`img/ItemSlot_2.png`|`img/Slot/ItemSlot_2.png`|`C45288690AB92C212F7EC5D5488D96ADA48D0033758F8835F6C763A0178A64D0`|
|`img/ItemSlot_3.png`|`img/Slot/ItemSlot_3.png`|`7175308B01D72BA744D5CEE8DD0CD8D6F7E41D81C56BF48C2C789DD03B1530A0`|
|`img/ItemSlot_4.png`|`img/Slot/ItemSlot_4.png`|`0F909E1CEDBF2FAE7EC081CB549C8FA6108C8776E9FE48E609260574CE6D3FBB`|
|`img/ItemSlot_5.png`|`img/Slot/ItemSlot_5.png`|`B500FBBB7D0B7B1423E0A4218D0235617A036EEFB6652F7BAA7DA5FCAE8414E2`|

新しいジョアンスペル画像は `tools/generate-card-data.py` の既存ID限定画像overrideを更新して生成データ・共有表示へ接続した。新画像は19,090 bytes、254×254 RGBA。生成後、旧 `SpellCardIcon_58.webp` の実行時参照はなく、新名の参照だけが共有画面で読み込まれることを確認した。

同じパスの内容差し替え8件（旧hash → 現hash）：

- `img/Card/権能_ヌルゲーシールド.webp`: `E8E89B040E36C2C473026FFB6050553B3AC1E1D92A50677A607DB01B5DC46397` → `CB2311EA06D848461EC1F7FAA0919B798581DD630B560CF4829F81D3A45D8703`
- `img/Card/権能_ボディブロー.webp`: `830D79DDDB0BB5E724D99F22E9FE40D22855C4CBDA918B6624E3AD172E0D7CD3` → `2F73B45413EE68D330AD7EF776254B534A395468202BA9135ACC3197DFF0AB49`
- `img/Card/権能_ポップピンスター.webp`: `D3046BCD0F2E428F91279017862F86B7F60F6DDAB4195E49E1157624817F5C0A` → `3AC257DFD9DE4020BE0A866A822CB86437011AF13BA65122E9D25E76B221D8BE`
- `img/Card/権能_マジ天罰.webp`: `1D6BFE8948FAE17C8E831F49756BE8A891D94D6F92037814FDD0D96CD444D769` → `3C2EADF7C050DE3AFC0FE0AA9D557E4C492A4CADE26F1589405B3F0A0DC757B7`
- `img/Card/権能_安心毛布.webp`: `AB5C1A327B94D5FA39973BFE6AA8EFDE9F16E57BCB88BC808EAF85E41CE61496` → `8B3798349AACAD727A4D49B8A1D40D9479F4386C690FA55290C205E4982E256B`
- `img/Card/権能_急発進.webp`: `79093E72BDA922AE76C07C1F3380E931F91F4A5E1DEAA10FA4ADFB20E6C2233A` → `83A01D4DE763AD14F93CDCBA8B36B867D893731784105BD257354E63B4EB4C4A`
- `img/Chara/null.webp`: `1E3AE3C67CC923F678DF651720CE803A1C7F45B62E77B95E5A7485978867C116` → `2DF97129C0706FC3C7EAEBE869ADFC5D12E9EAD0AA5A3B2CA6E5C760EE2EE5D8`
- `img/性格_なし.webp`: `22A60B0E6A3201F995AF5941683FE9E806B2D93F61308D8D9D5CAAC33DD5D67D` → `15104D1D77D56A1BBDBDF487F6CBB80AD349EEA40438C8F7FF426CB717068523`

新規パス82件の内訳：ジョアンスペル1、カード種別アイコン5、Enemy画像26、Num画像10、Slot画像34（うち上記5件は移動）、その他6（`Tab_Level.png`、性格相性画像2、ミスティック種族画像、`遺物bg_5.png`、`防御力_両.webp`）。新しい `img/種族_ミスティック.webp` は既存 `img/種族_？？？.webp` とSHA-256 `A14694D29DE098D5E91F12EDEE0E1CB6D778A6ABA21B966F7FB5F780BDB579B1` が同一。互換実装は既存画像パスを維持し、新画像名へ推測参照を追加していない。

ソース参照検索で明示的な用途を確認できた今回の追加パスはジョアンスペル画像。Slotの移動分は生成profileの資材収集・Service Worker列挙に含まれるが、追加された他の画像群には現行ソースで直接参照されないものがある。以下を用途未確認資材として一覧化した。個別機能への接続や重複判定による削除はしていない。ユーザー確認によりこれらも将来の公開対象範囲に含めるが、公開は未実施。

- カード分類（5）：`img/Card/カードロック.png`、`img/Card/スペル.png`、`img/Card/愛用.png`、`img/Card/権能.png`、`img/Card/遺物.png`
- Enemy（26）：`img/Enemy/CommonIcon_MonsterBoss.png`、`CommonIcon_MonsterElite.png`、`CommonIcon_MonsterNormal.png`、`CommonIcon_MonsterWorldBoss.png`、`img/Enemy/DimensionCrash/Icon_CrayonKnightCool.png`、`Icon_CrayonKnightGloomy.png`、`Icon_CrayonKnightJolly.png`、`Icon_CrayonKnightMad.png`、`Icon_CrayonKnightNaive.png`、`Icon_CurburusCool.png`、`Icon_CurburusGloomy.png`、`Icon_CurburusJolly.png`、`Icon_CurburusMad.png`、`Icon_CurburusNaive.png`、`Icon_Lil1liCool.png`、`Icon_Lil1liGloomy.png`、`Icon_Lil1liJolly.png`、`Icon_Lil1liMad.png`、`Icon_Lil1liNaive.png`、`img/Enemy/EliasFrontier/Icon_CrayonKnightNone.png`、`Icon_CurburusNone.png`、`Icon_Lil1liNone.png`、`Icon_MEOWNone.png`、`Icon_R41_RenewaNone.png`、`img/Enemy/GTA/Icon_GoldringGloomy.png`、`Icon_GoldringJolly.png`
- Num（10）：`img/Num/02b81f1e780696e08022aac2.png`、`0667e2c972875f704b401ef4.png`、`2b4e0726174b4732e70bc20a.png`、`5217fcf3acda8635be4d2aa9.png`、`a955be04b33eaf331cbdc3dc.png`、`c4f14fb4ab12280ae390b21d.png`、`c9819c15ffa4f04c038540e9.png`、`d204e3d0fb5a0e93a5a3a1be.png`、`d30a63a3b96c040a401df444.png`、`ff2ab91a474ea18f2b42cc9a.png`
- Slot（移動5件を除く29）：`img/Slot/ItemSlotLock.png`、`ItemSlot_Authority.png`、`ItemSlot_BattleGem.png`、`ItemSlot_Blue.png`、`ItemSlot_Border_8080.png`、`ItemSlot_Border_First.png`、`ItemSlot_CardPet_1.png`～`ItemSlot_CardPet_4.png`、`ItemSlot_Empty.png`、`ItemSlot_First.png`、`ItemSlot_Gold.png`、`ItemSlot_Gray.png`、`ItemSlot_Green.png`、`ItemSlot_LightGreen.png`、`ItemSlot_Mint.png`、`ItemSlot_Orange.png`、`ItemSlot_Pink.png`、`ItemSlot_Purple.png`、`ItemSlot_Red.png`、`ItemSlot_Turquoise.png`、`ItemSlot_ValueBase.png`、`ItemSlot_White.png`、`ItemSlot_Yellow.png`、`SelectPet_ItemSlotBg.png`、`SelectPet_ItemSlotDeco.png`、`SelectSkin_ItemSlotBg.png`、`SelectSkin_ItemSlotDeco.png`
- その他（6）：`img/Tab_Level.png`、`img/性格相性LD.png`、`img/性格相性RGB.png`、`img/種族_ミスティック.webp`、`img/遺物bg_5.png`、`img/防御力_両.webp`

`tools/public-route-manifest.json` の既存収集規則は `img/` 全体をnew／legacy両profileへ収録する。ローカル生成物でsourceの全1,128画像を比較し、両profileとも欠落0・hash不一致0を確認した。用途未確認画像も生成物に含まれるが、これはユーザーが公開対象と指定した範囲であり、機能対応済みを意味しない。

## 生成差分

標準入口 `tools/generate-all.bat` を1回実行し成功（14/14）。ログ：`tmp/generate-change-20260929_043435_392_7756.log`。生成器の出力差分は63件：

- `apostles.js`: ヨミの種族 `？？？` → `ミスティック`（1）。
- `statData.js`: 使徒基礎設定のミスティック種族（1）、研究種族（60）。
- `cards.js`: `spell_joanne_prayer_power` の画像ファイル名を新画像へ（1）。名称・ID・効果値は不変。
- 共有表示データ／関連資材版：既存入力から通常生成。共有辞書ID・順序に変更なし。

他の使徒・カードの効果／数値変更は生成差分ログで検出されていない。古い画像パスは共有表示の生成結果にも残っていない。`service-worker.js` の既存テンプレートには旧Slotのパス文字列があるが、通常の公開生成器がmanifestに基づきprofile別出力を書き換える。生成済みnew／legacy双方で新 `img/Slot/ItemSlot_1..5.png` を確認し、旧root `img/ItemSlot_1..5.png` が含まれないことを確認した。Service Workerの更新方式は変更していない。

## 検証と画面

- `py -3 tools/test-joanne-card-image-file-map.py` 成功。ID・名称・通常補正／シールド効果を維持し、新しい画像名と共有画像パスを確認。
- `py -3 tools/test-species-name-generation.py`、`node tools/test-species-name-compat.js`、`node tools/test-research-stage-order.js`、`node tools/test-formation-share-codec.js` 成功。旧／新名の混在、種族集計、未知値、旧共有codec、既存辞書を確認。
- `node tools/test-manager-joanne-options-ui-native.js` 成功。旧共有payloadからジョアンのスペル画像を表示し、新名への要求成功・旧名要求なしを確認。通常の管理／計算UIも通過。
- `node tools/test-manager-two-tone-targeted-ui-native.js` 成功。表示名は「ミスティック」、種族アイコン読込成功、legacy名称を表示しないことを確認。
- `node tools/test-apostle-data-native.js` 成功（320/375/1280px、79行、画像読込、横overflowなし）。
- `node tools/test-board-layout-preview-native.js` 成功。
- `node tools/test-formation-master-power-webp-native.js` を生成済みnew／legacyで実行。1280／375px、ライト／ダークで通過。
- `node tools/public-site-publication.js check --name mystic-joanne-local-20260929-01` 成功。new／legacy両profile、site/manifest/http検査成功。これはlocalOnly checkで、publishableではなく公開candidateではない。

代表画面：

- ミスティック絞り込み（375px）：`tmp/apostle-data-mystic-filter-375.png`
- 管理ピッカー：`tmp/mystic-manager-apostle-picker.png`
- 旧共有payloadに含まれるジョアンスペル：`tmp/share-joanne-old-selection.png`
- new／legacyのマスターパワー表示：`tmp/mystic-joanne-integration-screens/`

## お知らせ（今回の公開候補）

既存記事と重複しない1件を追加した。日付は本候補の公開日で確定する。画像追加・差し替え・リネームはお知らせ本文に含めない。

- ID：`20260929-game-data-mystic-species`
- 日付：`2026-09-29`
- 本文：種族名「？？？」を「ミスティック」に変更しました。

## バックアップと公開状態

- 編集対象・生成上書き対象のrepo外バックアップ、元パス／SHA-256台帳：`D:/Games/etc/trickcal/backups/mystic-joanne-image-integration-20260929-01/ledger.tsv`。コピー内容は台帳hashと照合済み。
- ブラウザーテストの追加入力待機変更に対する追補バックアップ：`D:/Games/etc/trickcal/backups/mystic-joanne-image-integration-20260929-02/ledger.tsv`。
- generated file変更の前内容も第1バックアップに含む。利用者追加画像は復元元で上書きしていない。

この作業ではxlsx編集、commit、push、公開を行っていない。作業ツリーには本件以外のdirtyも残るため、実際の公開時に対象範囲を再確認し、対象限定commitと通常runbookを実施する必要がある。ローカル統合・検証完了を公開済み／公開candidateと扱わない。
