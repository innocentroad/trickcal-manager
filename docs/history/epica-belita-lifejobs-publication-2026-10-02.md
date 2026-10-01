# エピカ・ベリータ／アルバイト公開作業（2026-10-02）

対象はエピカ・ベリータのアサイド、エピカA2の単体普通攻撃追加命中とDPS停止理由、アルバイト素材双方向検索、研究素材モーダル・閲覧段階・素材背景/WebP、Tab/Slot資材と必須依存。

開始sourceは `7c35dd59d6fe568b3a6cba7279680da6144d47db`。GitHub上のnew run `36517890647`、legacy run `36518091137`は成功、先行 `36233993541` はcancelled。Nodeの通常fetchで両実配信identityを確認し、candidate `c33c9bbcb783238c`、同sourceに一致した。今回の配信成功はまだ記録していない。

標準生成済みの入力hashはdatasheet `05C26A7EB9BDA2674CCE5ABF507D98E1F6273C1F0023819AB2A88149651C23F6`、skillmotion `806F9B87F82608107F76F37DD89885C5451D79C049AF25DDC01688ECD6378F39`。検証時から不変。xlsxは再現sourceのみ、配信manifestでは除外。旧資料用シートとskillmotionの空見出し補助列は通常生成の入力にしない。

ローカルManager公開checkは `tmp/publication-20261001212711573-checks.json` の4検査成功を引き継ぐ。エピカ実画面は `tmp/epica-a2-calculator-ui-native/`、アルバイトの新旧profile・PC/375px・明暗は `tmp/life-job-simple-ui-20261002/`。同一入力の標準生成は再実行しない。通常prepareの検査を次に実施する。

お知らせは既存 `20261002-game-data-epica-belita-aside`、`20261002-feature-life-job-material-search` の2件のみ。日付2026-10-02を本日の公開日として使用。DPS対応済みとは記載せず、重要な移行通知を維持する。

dirty全175パスの編集直前コピーとSHA-256台帳は `D:/Games/etc/trickcal/backups/epica-lifejobs-publication-20261002-current/ledger.csv`。対象外は敵研究試作・bak群、古いGOAL/STATUS変更、ジョアンの無関係な2テスト調整と過去文書、廃止済み解析入力TSV/取込スクリプト。対象外の内容は一時退避後、公開完了または中断時にコピー元hashへ復元・照合する。退避一覧は同backupの `parking.csv`。生成JSの手編集は行わない。

候補・commit・run・receiptの結果は公開ツールの既存記録を正とし、途中状態を成功に置き換えない。
