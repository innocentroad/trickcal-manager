# v33計算・研究画面更新の公開準備と結果（2026-09-27）

公開結果は末尾に追記した。以下の「未公開」は公開準備時点の記録であり、最終状態ではない。

## 基準と境界

- `release-source`の確認時HEADは`3061b80520e4077cfb295b2e2b896fe34ca36136`。最新の成功記録`backups/publication-history/latest-new.json`と`latest-legacy.json`はcandidate `a0ab238c6633ffe8`、source `c6ccdaaaa6418286800d764fd5a05cf1ca2d5ee7`。配信設定は`tools/publication-targets.json`のdual／legacy activeを変更しない。
- ジョアン画像の別候補`ffa78e9f3616275a`のnew run `36233993541`は、対象・承認待ち状態を再照合後、利用者の許可に従い指定runだけキャンセルした。GitHub APIの最終状態は`completed/cancelled`（2026-09-27T05:05:46Z）。公開identityは従来の`a0ab238c6633ffe8`のまま。`success:false`の履歴は削除・成功扱いせず、キャンセル結果を同記録に追記した。
- 標準xlsx生成は2026-09-26に1回完了済み。同一入力から再生成していない。現行`statData.js`とHEADのシート値を比較すると、変更は装備効果315行、研究544行、レシピ17行、素材カタログ28行だけ。`generatedAt`の差は別に扱う。研究効果・数量・レシピの原値を無関係に変更した証拠はない。

## source差分の分類

|区分|ファイル・理由|
|---|---|
|公開対象・必須依存|`stat-engine.js`、`formation-damage-calc.js`、`stat-prototype.js`、`stat-dashboard.html`／`.css`、`research-progress.js`、`storage-registry.js`、`statData.js`、`announcement-history-data.js`、`img/Materials/`の28枚。v33計算版4・比較schema 3、旧保存停止／復旧、研究表示・計画・所持数保存、画像、お知らせの実行時依存。|
|source生成・検証の必須依存|`tools/generate-stat-data.py`、`tools/equipment_data.py`、`tools/research_data.py`、`tools/research-material-master.tsv`、`tools/validate-effect-schema.py`、`tools/validate-generated-data.js`、v33・装備・研究・保存関連の焦点テスト、`tools/storage-inventory.json`、研究／v33の仕様・検証記録。これらのtools・docsは配信artifactには入れない。|
|対象外|`enemy-research.*`とその`.bak-*`、`docs/test-pruning-review-2026-09-22.md`、`docs/datasheet-unique-state-schema.md`、`docs/history/joanne-normal-damage-implementation-2026-09-20.md`、`tools/test-joanne-normal-damage-native.js`の別案件変更、分析・抽出資料、目的外の画像。敵研究の保存契約が台帳にあることは、試作本体を公開する意味ではない。|
|同一ファイル内の混在|`tools/trickcal_datasheet.xlsx`には今回の装備倍率・研究縦型の入力と、以前のv22／v29で利用済みだがHEADのxlsxには未反映だった基礎設定／アサイドTier入力が同居する。公開artifactには含まれないが、source commitでの取扱いを差分根拠とともに確定する。`GOAL.md`／`STATUS.md`にも別案件の過去記録があるため、記録の対象範囲を確認する。生成JSの手修正で分離しない。|

公開manifestの`img`ディレクトリはnew／legacy双方で収集する。xlsx、tests、docs、敵研究試作はmanifestの配信資材ではない。生成済みローカルnew／legacyの`img/Materials/`各28枚はsourceとSHA-256一致。対象外ファイルをclean化のために今回移動・stash・削除していない。

公開開始時追補：xlsxの現行版とHEADを読み取り比較し、旧v22／v29入力のsource未反映分と今回の装備倍率・研究縦型入力を確認した。別案件の入力値差分は確認されず、再現用sourceとしてxlsx全体を今回の対象に含める。配信artifactには含めない。対象外dirty 14ファイルは`D:/Games/etc/trickcal/backups/v33-publication-outside-20260927-144500/ledger.tsv`へ編集直前のSHA-256を照合して保全した。

## 最終レビューと検証

- `stat-engine.js`は本体・装備・アサイドを小数の内部合計として最終％まで保持し、表示時に整数化する。比較圧縮schema 3は内部小数を保持する。`formation-damage-calc.js`はHPの戦闘入力だけ整数化し、他の通常計算／DPS入力と戦闘力へ内部値を渡す。旧版は育成条件・内訳を照合できる場合のみ再計算し、足りない場合は停止と再設定／再保存の案内を維持する。ゲーム内の全条件完全一致は未確認。
- 研究計画は需要を素材ごとに集約してから所持数を一度だけ控除し、レシピ完成数で製作回数を切り上げて余りを区別する。所持数保存は研究専用Web Lock内で最新値読込→選択素材の競合確認→書込を実施。待機中の入力・取消・二重保存を抑止し、失敗やロック非対応では下書きと保存済み値を維持する。
- 今回再実行した`tools/test-stat-rounding-v33.js`、`tools/test-research-material-plan.js`、`tools/test-research-stage-ui-native.js`（1280／375px、明暗、別タブがロックを保持する競合）、`tools/test-announcements.js`は成功。研究画面の条件欄・チェック・タブ・所持素材・モーダルは`tmp/research-stage-ui/tabs-*.png`を実画像で確認。前回成功した全体生成・保存基準B・管理→通常計算→DPS回帰は同一入力で再実行しない。
- 公開開始時追補：所持素材の保存台帳に残った旧一括編集・raw全体競合の文言を実コードの素材単位Web Lockへ修正。保存基準Bは20キー・77アクセスで成功。研究UIの焦点テストでは、書き換え時に落ちていた計算画面の敵研究プリセット確認を復帰させ、背景タブの表示更新待機は対象タブを再アクティブ化して判定した。1280／375pxの所持数競合、敵研究プリセットの攻撃値389を含めて成功。お知らせ3件の検査も成功。
- `announcement-history-data.js`へfeature `20260927-feature-research-materials`、fix `20260927-fix-stat-rounding`、feature `20260927-feature-apostle-data`の3件を追加した。日付は公開予定日の2026-09-27で確認済み。既存ID、重要なドメイン移行通知、既読キーは変更していない。公開成功までは未公開として扱う。

## 次の公開工程の前提

1. ジョアン画像の別runの実状態、直近new／legacy成功記録と受信repoの現在状態を照合する。状態不明のrunを重複起動しない。
2. xlsxの過去入力変更をsourceへ含める範囲を確認し、公開対象と対象外dirtyをファイル単位／同一ファイル内で確定する。対象外の一時退避が必要なら、runbookが許す保全・対象限定退避・復元の具体手順と一致検査を先に決める。今回は実行しない。
3. お知らせの公開日と本文を再確認する。対象限定stage／差分確認・commit後、cleanなsourceから通常`prepare`を実行する。dirtyでの`prepare`や今回のローカルcheck出力のcandidate流用はしない。
4. `tools/publication-targets.json`に従い、候補／bundle／receipt／artifact commitを照合してnew成功とidentity一致を確認してからlegacyへ進む。今回、commit・push・公開・承認は未実施。

編集前バックアップ台帳：`D:/Games/etc/trickcal/backups/v33-research-publication-prep-20260927-025517/ledger.txt`。

## 別候補：使徒データ表のコンパクト化（2026-09-27、未公開）

- v33・研究更新とは別のローカル候補。`public/apostle-data.js`／`.css`と`tools/test-apostle-data-native.js`だけを変更。xlsx・生成データ・計算・保存は変更せず、commit・push・公開もしない。
- 基礎設定の列幅・余白を縮め、値は中央揃え、数値は等幅数字にした。使徒列は5ビュー共通で画像の下に小さな名前を2行まで表示し、正式名は画像の代替テキストとセルの説明から確認できる。固定見出し・固定使徒列・内部スクロールは維持。
- 基礎設定の初期SP／毎秒SP回復量、9等級、攻撃速度、戦闘力は実在する画像を利用し、画像の下に短い区分を表示。基礎設定の9等級は単独項目であり、装備タブの複合項目を誤って基本列へ流用していない。
- 見出し画像の説明はホバー・フォーカス・クリックで表示し、外側操作・Escapeで閉じる。画面端でも収まる位置に配置。装備画像の既存詳細操作は維持。
- 変更前後画像：`tmp/apostle-data-before-20260927-1280.png`、`tmp/apostle-data-before-20260927-375.png`、`tmp/apostle-data-after-20260927-1280.png`、`tmp/apostle-data-after-20260927-basic-filter-collapsed-375.png`。右端列と説明は`tmp/apostle-data-after-20260927-basic-right-1280.png`／`tmp/apostle-data-after-20260927-basic-right-help-375.png`。変更後の明色は`tmp/apostle-data-after-20260927-1280-opposite-theme.png`／`tmp/apostle-data-after-20260927-basic-375-opposite-theme.png`。実画像で比較済み。
- `tools/test-apostle-data-native.js`は1280／375pxを含む既存レスポンシブ・5ビュー・画像・装備詳細検査に、使徒縦配置、列名、SP画像、説明操作、画面端、数値整列を追加して成功。公開artifactや本番配信での確認は未実施。編集前保全：`D:/Games/etc/trickcal/backups/apostle-data-compact-20260927-034100/ledger.tsv`。
- 追補：利用者が追加した`img/攻撃速度.webp`と既存の`img/c_pow.webp`を基礎見出しへ接続。列幅は一律にせず、等級・短い区分を狭くし、長い文字・小数を必要幅で残した。`img/攻撃速度.webp`は未追跡の利用者資材なので、後の対象限定source commit時に含める必要がある。変更後画像：`tmp/apostle-data-icons-spacing-20260927-1280.png`／`tmp/apostle-data-icons-spacing-20260927-basic-right-help-375.png`。焦点テスト・構文・差分検査は成功。追補の編集前保全：`D:/Games/etc/trickcal/backups/apostle-data-icons-spacing-20260927-132000/ledger.tsv`。
- 追補：基礎設定の値列を文字・数値とも中央揃えに変更。編集前保全：`D:/Games/etc/trickcal/backups/apostle-data-center-values-20260927-131459/ledger.tsv`。ローカルのみで未公開。
- 追加追補（5ビュー）：使徒名の固定2行分の高さを外し、通常名は1行・長い名前のみ最大2行。captionは読み上げ用に残して視覚的な重複をなくした。装備・ボード・アサイドの見出しにも既存ステータス画像と説明操作を使用し、装備の複合2項目は対応する2画像を重ねた。装備詳細は従来のまま。セルは内容別の必要幅と約4pxの上下paddingへ変更し、基礎設定の中央揃えを維持。
- Rank全体効果は`Rank1to2`〜`Rank9to10`の元データを到達Rank 2〜10の各列へ対応させ、Rank 1は遷移がないため「—」。9遷移×79使徒の2効果を元データと照合し、累積値ではなく増分として表示。効果はステータス画像と元の値を2行で表示。説明で遷移を確認でき、旧Rank切替は撤去。実データに明示0・欠落はないが、表示処理は明示0・未登録・対象外を区別する。
- 375pxの変更前→後は基礎行約80→66px、他タブ約88→66px（Rank約68px）。可視行は基礎6→8、装備・ボード・アサイド5→7、Rank4→7。可視列は装備・ボード・アサイド2→3、基礎4→4、Rank2→3（全11列は内部横スクロール）。1280pxでは基礎7→9行・17→18列、他タブ6→8〜9行。Rankは3→11列を同時表示。固定見出し・使徒列・下バーとの収まりを隔離Chromeで確認。
- 変更前後画像は`tmp/apostle-all-tabs-before-20260927-{view}-{375|1280}-initial.png`と`tmp/apostle-all-tabs-after-20260927-{view}-{375|1280}-initial.png`（view=`equipment`／`board`／`aside`／`rank`）。基礎のPCは同prefixの`basic-1280-initial.png`、375pxは`basic-filter-collapsed-375.png`。変更後の明色も`*-opposite-theme.png`を保存。焦点テスト、構文・対象差分検査は成功。編集前保全：`D:/Games/etc/trickcal/backups/apostle-data-all-tabs-rank-20260927-134000/ledger.tsv`。この追加候補も未commit・未公開。
- 追加追補（アサイド・装備、未公開）：アサイド等級へ魔法防御力の等級・基礎・A1成長列と画像説明を接続。未登録の行／項目／補助値はセルを空欄とし、明示0・対象外・公開制限は区別する。元データ登録40件の魔法防御3値と表示を照合し、未登録39件の空欄、数値並べ替えを検査。装備等級は画像右下の数字背景を外し、等級別の文字色と縁取りへ変更、セルを中央揃えにした。375／1280pxの明暗・通常／補助表示は`tmp/apostle-data-aside-{375|1280}-expanded-magic-defense*.png`および`tmp/apostle-data-equipment-{375|1280}*.png`で確認。焦点テスト・構文・差分検査を実施。編集前保全：`D:/Games/etc/trickcal/backups/apostle-aside-equipment-20260927-134414/ledger.tsv`。xlsx・生成データは変更していない。

## 公開結果（2026-09-27）

- 利用者の追加許可により、先行commit `3061b80520e4077cfb295b2e2b896fe34ca36136`のジョアン画像追加・旧名からのリネーム・`apostle-skill-image-data.js`の参照変更も対象に含めた。同commitは画像3件と対応表のみで、計算・スキル値・性格候補の変更はない。先行候補`ffa78e9f3616275a`のnew run `36233993541`は指定runだけキャンセル済みで、承認・再実行はしていない。
- 公開source commitは`2babb0594f78e6c03193dbfd714408b22cb6ba22`。既存bundle `tmp/publication-20260927051955432.json`、candidate `1e05899775b3aa3e`（contentDigest `784d0ae3d158d762e6932c7785b8be0d4bdf1b87e5d88504059579663dda73d0`）を再利用し、prepareを繰り返していない。
- new：receipt `tmp/delivery-1e05899775b3aa3e-new-f8e9364888cb.json`、artifact commit `a8a1f0fc82c346ac48ff5ae858a7637cad79d8f1`、run `https://github.com/innocentroad/trickcal-manager-site/actions/runs/36297504179`。通常承認後にdeploy成功し、公開identityのcandidate／source／profile／digest一致を確認。
- legacy：new成功後に同じbundleを使用。所有台帳にあるジョアン旧画像2件のみを削除対象とした。receipt `tmp/delivery-1e05899775b3aa3e-legacy-d10d9eaf205f.json`、artifact commit `790e2a37603c8b86923391357d3bd23f3257f321`、run `https://github.com/innocentroad/trickcal-manager/actions/runs/36297672403`。通常承認後にdeploy成功し、公開identity一致を確認。
- 新旧の隔離Chromeで管理・計算・研究・使徒データを表示。計算版4、研究ツリー画像、Rank 1〜10の11列表（79行）を確認。ジョアンの低・高・パッシブ新画像3件は両profileで読込成功、旧ファイル名へのNetwork要求0件、対象資材404・重大なJS例外0件。所持素材の入力・保存・再読込は使い捨てプロファイル内で両サイト成功。代表画像は`tmp/publication-v33-live-20260927/`。お知らせ2026-09-27の3件と重要な移行案内を維持。ゲーム内全条件との完全一致や実利用の保存データの移行は今回再検証していない。
- 配信artifactにxlsx、敵研究試作、テスト、文書は含めていない。対象外dirty 14ファイルは`D:/Games/etc/trickcal/backups/v33-publication-outside-20260927-144500/ledger.tsv`とSHA-256一致で元の場所へ復元済み。公開結果記録だけのcommitではサイト再生成・再公開しない。
