# 二公開先の配信契約（P0 / Gate C）

2026-09-12。設計のみ。リポジトリ作成・資格情報登録・DNS・Pages設定・公開は未実施、別途利用者承認が必要。

## 配信方式

- 開発元は既存`innocentroad/trickcal-manager`のmainを維持。旧Pagesは`https://innocentroad.github.io/trickcal-manager/`のまま、カスタムドメインを付けない。
- 新側は公開成果物専用リポジトリ`innocentroad/trickcal-manager-site`を作る方式を採用。2026-09-14に利用者が名前を確定。取得可否の確認・実作成は未実施であり、別途承認を得る。利用不可なら設定値だけ変更し、ソース構成は変更しない。
- 新側の正式Originは`https://trickcal.irlab.dev`。DNS/CNAMEは新側だけに設定。旧側から強制redirectしない。
- 既存ソースから旧prefix `/trickcal-manager/`、新prefix `/`の2成果物を生成。同じsourceCommitと資材版をrelease manifestに格納。手作業の二重編集は禁止。
- ソース側workflowが検査済み新成果物を新リポジトリの配信用branchへcommit。新側の事前設置workflowがPagesへ配信する。転送対象から`.git`、`.github`、tools、tmp、backups、secretを除外。workflow自体を成果物で上書きしない。
- 新側書込には新リポジトリだけのContents writeを付けたfine-grained tokenをsource側secretへ登録する。値は文書・ログへ記録しない。管理者が受信workflowとPagesを初期設定し、tokenにWorkflows writeを付けない。有効期限と更新担当を運用台帳へ記録する。

[GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[token管理](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)を実施時にも確認する。

## URL・公開順

[公開URL設計](public-url-design.md)と[Gate C補足](public-url-gate-c-design.md)の`/`（当面は`/manager/`への静的転送）、`/manager/`、`/calc/`、`/share/`、`/data/`一覧、`/data/enemies/`、`/data/boards/`、`/transfer/`を新入口とする。既存html入口はprofile別のalias/compatibilityとして維持しquery/hashを保持する。資材を一斉移動せず、prefix対応した生成入口を用いる。共有URLのpayload形式は変更しない。

1. 検査・資材版同期→二成果物生成→manifest確認。
2. 新側を案内OFFで配信。実Originの主要入口、共有hash、PNG、Worker scope、ファイル復元・転送を確認。
3. 新側manifestと期待sourceCommitの一致を確認した後、利用者承認を得て旧側の移行案内を有効化。workflow成功だけを新側確認の代わりにしない。
4. 新側失敗時は旧側案内OFFを維持。公開後の不具合は案内/転送開始を停止し、両側の保存データを保持。旧側への逆自動転送はしない。

旧側の読出し・バックアップ入口は恒久保持。将来廃止する場合は別承認。新側のキャッシュは旧側へ影響させず、cache名・scope・生成prefixを検査する。

## 実施前に必要な外部入力

新リポジトリ作成承認、管理権限、token登録と更新担当、Pages設定、Cloudflare DNS設定、公開時の利用者承認。これらはP5実配信/P6の開始条件で、P1〜P4のローカル実装を止めない。

C-T1：二成果物で入口・相対資材・alias/query/hash・共有PNG・manifest一致。
C-T2：配信失敗/版不一致時に案内が有効にならず、停止手順でデータを消さない。
C-T3：実OriginでDNS/HTTPS/Worker/復元/転送を確認後だけ案内公開。

## ローカル配信準備（2026-09-14追加）

実施順は[G1〜G4指示](storage-p5b-git-gate-handoff.md)。実配信承認前でも、Git判定補修、受渡しtools、未設置workflowテンプレート、専用tmp内ダミー配信まで連続実施する。実設定を変えずに完成できる部分を先に揃える。

### 入力と所有範囲

- 入力は検査済みcandidateと、それに束縛されたrelease/build/checksおよびnew/legacy staging。受渡し時にもhashとprofileを再照合し、受渡し対象に任意の作業ツリー全体を指定しない。
- newはroot、legacyは既存Pagesのartifact rootとして一度baseを除いた中身を渡す。source上の/trickcal-manager/付き生成物を二重prefixで公開しない。
- 配信管理台帳はcandidateId/sourceCommit/profile/contentDigestと実際に渡すファイル一覧・hashを記録する。受信側の所有ファイルだけを置換・整理し、前回台帳にないファイルを一括削除しない。初回の未知ファイル衝突は明示拒否する。
- .git/.github、受信workflow、既存CNAME等の環境管理ファイルは資材所有範囲から除外する。新側CNAMEの必要性・管理方法は外部設定段階で確定し、旧側へ追加しない。
- 公開後に期待版を照合できるよう、非機密のprofile別配信識別情報を固定JSON入口へ含める。candidateId/sourceCommit/profile/digestだけとし、ローカル絶対path、checksログ、token、保存データを含めない。この識別情報自身をcontentDigestへ再帰的に含めない。既存release記録から生成して台帳を二重管理しない。

### 受渡しと失敗処理

既定は差分計画のみ。適用は専用出力先・所有台帳確認後に明示操作する。今回の適用先は専用tmpのダミーrepoに限る。コピーとhash確認は一時領域で先に行い、検査失敗を配信成功と記録しない。実環境へのcommit/push/Pages起動は別承認の後段処理であり、ローカルのコピー完了を公開完了と呼ばない。

再実行は同じcandidateなら実質差分を生まない。途中失敗時に次のcommit/配信へ進まない。最後に成功した配信記録・保護ファイルを維持する。公開rollbackは保存データの巻戻しではなく、互換な検査済み成果物への戻しまたは案内停止とする。

### workflowテンプレートと承認境界

source側の検査・candidate化・profile分離・new受渡しと、受信側の検査済みrootのPages配信をdocs/templatesへ作る。旧Pagesの切替案もテンプレート内に留める。具体的なActions版や起動権限は作成時に公式資料で確認する。

実repoの確定commit、実workflow設置／push、成果物repo作成・token・Pages/DNS/CNAME、初回公開、移行案内ONはそれぞれ承認範囲を示す。main pushは既存公開を起動し得るので、commit承認をpush承認と解釈しない。新側の版・Origin確認前に旧案内をONにしない。

G4で必要な承認と操作順を報告したら停止し、承認待ちの間に局所テストを増やし続けない。
