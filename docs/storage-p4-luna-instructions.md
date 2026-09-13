# Luna：P4開始前補修から転送実装まで

2026-09-13。今回は指示作成のみ。実装・自動実行Goal・公開は開始しない。

## 開始判定

直前のR1〜R5 5/5を無条件に継承しない。`decodeBackupPackage`へ正しいdigest付きで`dps.settings.value={settingsVersion:999,"__proto__":{x:1}}`を渡すと、`ok:true`・excluded/unsupportedとなることを本番codecで再現した。意味検証が先に例外を出し、元の危険プロパティが除外で消えるため。危険プロパティ検査を緩和しない契約に反する。R4は文字列検査のみ、R5の省略反例はnull入力とのnotDeepEqualであり、要求した再試行実行と保存省略の共通assertには不足する。

この局所補修をG0として合格後、P4 T1→T2→T3へ続行できる。既存C1/C3と正常復元の証拠は再利用する。全検証のやり直しや検出器一般化へ広げない。

## G0：入力安全性と残る動作証拠

- G0-1：元payload全体の危険プロパティ・深度・ノード数と、payload/datasetの外形を、補助意味検証による除外より先に検査する。余計なdatasetフィールドを除外で消して受理しない。正しいdigest付きの「未知DPS版＋危険キー」「補助不正＋深度超過」「補助不正＋余計なフィールド」は同じdecode入口で拒否。安全な未知DPS版だけは従来の除外候補として受理。元package/digestを保持する。
- G0-2：本番preview/prepare/apply/recovery関数を既存の隔離制御環境で実行し、書込み失敗→rollback→除外チェック再表示かつ未選択→同意なし拒否→再確認→再適用成功を確認する。文字列一致だけを動作証拠にしない。既存runtime失敗注入を再利用する。
- G0-3：実apply後storage→新VM本番loaderの3件比較を維持。同じ一致assertを共通化し、保存を省略したstorageと読込みを省略した実行で、そのassertが失敗することを確認。比較期待値は正当なwriter形式の元項目とし、期待値側の補完で差異を隠さない。
- R1の旧形式安全拒否は維持。利用者向け失敗表示にも救出導線が伝わることを確認し、codecのmessageだけを根拠にしない。旧converter追加は必須にしない。

G0は上記3条件の実行証拠と案内確認で判定。未達なら具体的な残条件を報告して停止。合格時は今回の指示によりT1へ続行する。

## P4：T1→T2→T3

詳細は`storage-p4-transfer-design.md`第3〜6節と保存契約・backup形式を正とする。

1. T1 / B-T4a,b：転送プロトコルとreceiptを実装。origin/source/nonce/transferId/段階を検査し、元packageDigest・適用選択・内部transactionIdを関連付ける。重複・異なるdigest・応答欠落を確認し、complete以前に成功応答しない。通信断で再適用・rollbackを自動実行しない。
2. T2 / B-T4c,d：送受信UI、件数・置換確認、除外確認、取消、ファイル代替を既存codec→preview→plan→applyへ接続。クリック中に受信タブを開く。採取完了後は送信側maintenanceを解放する。待機中の受信先更新を適用前に再照合。旧保存は削除しない。管理画面への本番移行案内は公開有効化せず、隔離環境で操作可能な形にする。
3. T3 / B-T4e,f：既存独立ブラウザ・HTTP環境を2 Originで再利用。実クリックから転送・明示復元・新規タブ起動、ファイル往復、保存枠・保存計算・無関係キーの保持を代表確認。送信元不変は採取完了時点を基準にする。native阻害は分類し、同じtimeoutを反復しない。スマホ狭幅とiOS/Android実機の証拠は区別する。

各単位合格後だけ次へ進む。保存writerの別実装を作らない。テストOriginの注入はtools側の隔離構成に限り、URL入力で本番allowlistを変更しない。T3のnativeが未達ならP4完了とせず、必要な操作と観測値を残す。

## P5以降への引渡し

T3合格後はP5a実装前の設計確認だけ行う。`public-site-future-plan.md`、`public-url-design.md`、`public-url-gate-c-design.md`、`storage-release-contract.md`を照合し、manifest schema/衝突検査・資材版生成順・旧URL互換・SW更新の残判断を簡潔に報告する。

確定名称は`/manager/`と`/calc/`。`/`の静的転送と`/data/`一覧は推奨案で個別確定待ち。利用者の決定なしに公開実装へ固定しない。P5a実装、P5b配信、P6公開・スマホ実機、DNS/Pages/workflow/移行案内有効化は別の指示で扱う。

## 実施・記録・禁止事項

開始時にAGENTS.md、GOAL.md、STATUS.md、本書、重大修正レビュー、保存契約、backup形式、P4設計、独立ブラウザ環境文書を読む。最新の本書を実施順の正とし、元の保護条件を維持する。

対象ファイルと既存変更境界を記録。各開始前に作業と対応IDを示し、終了後STATUS・受入台帳へ実行証拠、達成条件数、未達・未検証、残見積もりを記録。G0は3条件、P4はB-T4a〜fの6条件を別集計する。3スライス連続で進捗がほぼなければ再計画を提示して停止。

変更JS構文、関連backup/runtime/restore/behavior/transferテストと差分を確認。既存未コミット変更を維持し、datasheet・ゲーム生成データ・計算式・公開設定を変更しない。commit/push、自動実行Goal有効化は行わない。終了時にP4実装結果とP5a開始に残る判断を報告して停止する。
