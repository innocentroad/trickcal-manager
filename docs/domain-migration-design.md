# 新ドメイン移行設計

更新日: 2026-09-12。設計案。実装・リポジトリ作成・DNS変更・公開は未実施。

レビュー後の進行計画は[保存保守・移行ロードマップ](storage-migration-roadmap.md)を正とする。本書の4スライス案は同ロードマップの7実装スライス（S5a/S5b分割）と設計ゲートA/B/Cに置き換える。特に排他・復元・長期互換・公開の詳細契約は未確定であり、この文書だけで実装を始めない。撤回は保存互換を確認した版を新ドメイン上で再公開することを基本とし、旧サイトへの持帰りは互換確認済みの場合だけとする。

## 目的

GitHub Pages運用を維持し、既存利用者の保存データを引き継いで新ドメインへ移行する。旧URLを長期間開かなかった利用者にも引き継ぎ入口を残す。キャッシュ復旧と保存データ移行は別機能とする。

## 公開構成の推奨案

開発元は現在のtrickcal-managerリポジトリ一つとする。追加するのは新ドメイン向けの公開専用プロジェクトリポジトリ（仮称trickcal-manager-site）。開発ブランチを二重管理しない。

| 公開先 | 役割 | Pages設定 |
| --- | --- | --- |
| innocentroad.github.io/trickcal-manager/ | 旧利用者の引き継ぎ入口、旧共有リンク互換 | 現リポジトリのCustom domainは空欄を維持 |
| trickcal.irlab.dev/ | 新しい本体。Originは利用者指定で確定 | 新しい公開専用リポジトリだけにCustom domainを設定 |

正式Originはhttps://trickcal.irlab.devに確定した。他ツールは別サブドメインで運用できる。以後のOrigin変更は再移行として扱う。/以下の整理は[公開URL設計](public-url-design.md)に従い、保存共通化と独立したS5aで実装する。ルート名は同書の採用案を設計ゲートCで最終固定する。

アカウントのユーザーサイト（innocentroad.github.ioリポジトリ）に独自ドメインを設定すると他のプロジェクトサイトへ継承されるため、この方法は使わない。現行サイトへ独自ドメインを直接付け直す案は、旧Originでデータを読み出す入口を維持しにくいため採用しない。

現行workflowは検査後に静的成果物を配信している。新公開先は、その同じ検査済みコミットから作った公開物だけを受け取る。公開先で生成・手編集しない。受け渡しには公開先限定のGitHub Appまたはfine-grained tokenを使用し、公開先自身のActionsでPagesを配信する。現在のGITHUB_TOKENで別リポジトリを変更できるとは仮定しない。公開物に元コミットと移行プロトコル版を記録する。

初期は同じアプリを両方で公開して移行を試せるようにする。新サイトの検証後、旧サイトは引き継ぎ案内と必要な読出し機能、共有閲覧の互換入口を中心にする。旧URL全体の強制転送はしない。旧入口は終了日を決めず維持する。移行後の旧側編集は新側へ自動同期されないことを案内する。

## 利用者の操作

1. 旧管理画面に小さく「新サイトへ引き継ぐ」を表示する。
2. 押すと、保存スロット数・現在の編集中状態・計算/DPS設定などの引き継ぎ概要を表示する。
3. 「引き継ぐ」で新サイトの受信ページを別タブに開く。ユーザー操作内で開き、非同期処理後のポップアップにしない。
4. 新サイトで受信内容を確認し、「この内容で開始」を押す。
5. 保存と再読込検証が成功したら新管理画面を開く。旧側には完了を通知する。旧データは残す。

新サイトを先に開いた人には「以前のデータを引き継ぐ」を用意し、旧管理画面へ案内する。データが空に見えるだけで消失と表示しない。引き継ぎ済みの新データがある場合は自動実行せず、再取り込みを利用者が選ぶ。

ファイル操作が不要な同一ブラウザ内転送を主導線にする。ポップアップ制限・opener切断・別ブラウザ/別端末に備えて「移行ファイルを保存」「移行ファイルから復元」を併設する。移行ファイルは共有URLとは別の完全バックアップ形式で、既存のスロット単位エクスポートとは区別する。

## データ対象と既存実装への接続

localStorageはOrigin単位であり、新ドメインから旧保存値を直接読めない。対象を明示した移行形式を設ける。trickcalという接頭辞だけで保存領域全体を無差別コピーしない。

| 対象 | 確認した保存キー/接続箇所 |
| --- | --- |
| 保存スロット全件、名称、育成、編成、カード等 | trickcal_stat_slots_v2 / stat-prototype.js |
| 現在の編集状態 | 現タブのpersistCurrentControlsとcreateStateWorkspaceDraftから抽出 |
| 現在状態の互換保存 | trickcal_stat_live_v2、trickcal_stat_prototype_v1。受信時に一貫した状態から再構成 |
| 計算設定、計算結果保存 | trickcal_formation_damage_settings_v1、trickcal_formation_damage_result_saves_v1 |
| 自作敵プリセット | trickcal_formation_damage_enemy_presets_v1 |
| DPS設定、時系列効果設定 | trickcal:dps-settings:v1、trickcal:dps-runtime-effect-overrides:v1 |
| テーマ、ボード表示設定 | trickcal_theme、trickcal_stat_theme、trickcal_damage_calc_theme、trickcal_board_shortcut_off_mode、trickcal_board_orientation |

これは確認済み対象の初期台帳。実装第1スライスで他の本番保存キー・動的キーを棚卸しし、必須/任意/対象外と型を確定する。移行対象外はキャッシュ、Service Worker、検証fixture、履歴操作スタック、タブ識別子、一時UI状態、移行処理自身の作業データ。

重要: trickcal_stat_workspace_v2は現在sessionStorageに保存される。別タブで旧移行ページを開くだけでは、元タブの最新編集状態を保証できない。旧管理画面の現タブからドラフトを抽出する。ほかのタブの未保存編集は対象外と表示する。保存済み内容だけから開始する経路では「このタブの編集中状態は含まれない」と明示する。

新側は旧workspaceId、TAB_INSTANCE_ID、revision等をそのまま利用せず、新しいタブ/同期状態を生成する。取り込んだドラフトとactiveSlot、スロットの基準revisionの整合を既存初期化処理に合わせる。新受信タブにsessionStorageを設定し、同じタブで管理画面へ移る。計算画面だけの未確定入力は、既存の保存済み計算設定と区別する。

## 転送・保存契約

- 形式はformat、version、sourceRelease、createdAt、transferId、対象別payload、整合確認用digestを持つJSON。ファイルとブラウザ転送で同じ検証を使う。digestは破損確認であり認証ではない。
- postMessageでデータを渡す。targetOriginは確定済み新Originに固定。受信側はevent.origin、event.source、操作ごとのランダムnonce、メッセージ種別と版を照合する。送信側の応答も同様に確認する。
- READY → PAYLOAD → 検証/利用者確認 → COMMITTEDの順。完了通知は永続化と読戻し確認後。時間制限・再試行・二重クリック・重複transferIdを扱う。
- URLのクエリ/hash、アクセス解析、ログには保存データを入れない。隠しiframeに旧保存領域を読ませる方式を必須にしない。
- 受信は通常アプリの自動保存処理を起動しない専用画面で行う。未知キー・未対応版・不正な型・過大サイズを拒否し、確認前は本番保存キーへ書かない。上限値は最大育成/全保存スロットの実測後に決める。
- 新側が既に使われている場合は受信データと現状を比較して警告する。初版では自動マージを行わず、現状の退避を完了したうえで全体置換を明示的に選ぶ。何も変えないキャンセルを用意する。
- localStorageの複数キー更新は原子的ではない。書込前に対象キーの旧値と不存在を記録した復元ジャーナルを永続化する。途中中断時は次回のアプリ初期化より前に復元し、自動保存を止める。容量不足でジャーナルを確保できなければ適用しない。
- 受信中に別の新サイトタブが書き込む場合は中断する。別タブ終了案内に加え、移行中フラグと通常保存側のガードを設ける。公開前に多重タブ競合を検証する。
- 旧側は削除も移行中の自動書換えも行わない。移行済みフラグは送信成功時でなくCOMMITTED受信後に付ける。新旧を継続同期する機能は対象外。

## 公開・DNS・リンク

1. 先行する復旧対応を公開し、旧URLで保存データを開けることを確認する。復旧設計に残る301/308再現、保存維持、失敗系の検証を未実施のまま完了扱いしない。
2. 確定済みtrickcal.irlab.devについて、公開先リポジトリ名を確定し、GitHubでドメイン所有権確認を行う。
3. 新しいプロジェクトリポジトリのPagesにだけCustom domainを設定し、Cloudflare DNSを設定する。最初はDNS onlyとし、Cloudflareのプロキシ・転送・追加キャッシュを挟まない。
4. HTTPSと証明書を確認するまで利用者向け移行案内を有効化しない。.devなのでHTTPでの仮運用を前提にしない。
5. 新旧2 Originで転送・書戻し・共有URL/PNG・戻り導線を検証し、新側公開後に旧側の案内を有効にする。

現行はカスタムActions配信なのでCNAMEファイル追加だけで設定できたとは扱わず、Pages設定を確認する。DNS値は実施時のGitHub公式情報を参照する。

旧/trickcal-manager/から新/への相対参照、Worker URL、画像、canonical、OGP、sitemap、共有URL生成、復旧URLを棚卸しする。正式base URLは一箇所で管理し、任意の外部URLを転送先にできないようにする。旧共有URLはhashと必要な既存queryを維持し、新ページで同じ編成を再現する。共有閲覧は保存データ移行を要求しない。

SWのscopeは配信ベース内に限定する。trickcal.irlab.devのルートに登録し、既知ページ/資材をfetch対象にする。他サブドメインのツールとは分離する。アプリキャッシュの削除は当該アプリだけ。旧SWからの更新と移行案内の取得も検証する。共有資材変更時は公開URL設計に従って既存ハッシュ同期/公開前検査を最終成果物へ接続する。

## 撤回手順

新サイトの問題時はまず移行案内を停止し、旧入口を維持する。新サイトで編集した人に旧サイトへ戻るだけと案内しない。新側の完全バックアップを出力して持ち帰る経路を用意する。DNSの切替で保存データが移るとは扱わない。公開済み移行パッケージと移行元リリースは復元可能な期間保持する。

## 完了条件・実装スライス案

| スライス | 実施内容 | 完了の根拠 |
| --- | --- | --- |
| 1 | 保存台帳、移行形式、完全バックアップ/復元、ジャーナル | 全保存スロット/現ドラフト/DPS/敵データが一致。破損・容量不足・途中終了でも元データ復元 |
| 2 | 新旧間転送、競合確認、再実行、利用者UI | 誤Origin/誤source/再送拒否、別タブ競合、ポップアップ不可時のファイル復元 |
| 3 | 二公開先配信、URL/資材/SW対応、DNS手順 | 同一元コミットから配信。旧Originが維持され、新サイトで共有URL/PNGと資材取得成功 |
| 4 | 段階公開と実環境検証 | Chrome・Android・Safari/iOSの可能な実機検証。未実施を明示。旧キャッシュ/既存新データ/失敗系/撤回確認 |

上表は初期の4スライス案。現在は正式Origin確定、実装0%。残りは公開先と詳細契約の確定、およびロードマップの7実装スライス。自動実行Goalは設定しない。

## 参照

- [GitHub Pagesの独自ドメインとプロジェクト継承](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)
- [GitHub Pagesの独自ドメイン設定・Actions配信](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [Cloudflare DNS onlyとプロキシ](https://developers.cloudflare.com/dns/proxy-status/)
