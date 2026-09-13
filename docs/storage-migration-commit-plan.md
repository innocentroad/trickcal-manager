# 移行準備の最終レビューとcommit対象案

2026-09-14。利用者承認は最終レビュー・対象整理と成果物repo名の確定まで。git add/commit/push、外部設定は未実施。

## 結論

成果物repo名は **innocentroad/trickcal-manager-site** に確定。作成・名前取得可否の確認はまだ行っていない。

R1の初回／更新input接続をレビューし、専用tmp実Git fixtureのtest-public-site-release-input.jsを再実行して成功。validate-formation-share-maintenance.jsもGit実行可能な環境で成功（78使徒・52遺物・35スペル・6権能）。生成--checkとgit diff --checkは成功。通常sandboxの共有履歴検査はGit EPERMだったが、権限を分けた読取り専用検査で成功した。

今回の焦点範囲では、ローカル確定commitを妨げる新しい問題は確認していない。全dirty変更の全行を新規に監査したという意味ではなく、これまでの保存・共有・SW・配信レビューと実証を再利用した最終接続確認である。実Actions、公開Origin、実機、成功配信recordの運用保管は公開段階の残件。

## 推奨commit構成

下記133ファイルを一つの「移行準備・保存保守・共有保守」統合commit候補とする。用途別の一覧は説明用であり、各群を単独で動作するcommitと主張しない。stat-prototype.js、app-cache.js、各HTMLは共有保守・保存facade・公開routeをまたいで変更され、R1の8ファイルだけやP5b toolsだけをcommitすると未追跡依存が欠ける。履歴を細分化するための大規模なhunk分割は今回行わない。

tools/generate-all.batは共有表示データ／辞書／資材検査の接続として含めるが、今回は実行せずxlsx・ゲームデータの再生成をしない。combat-scenario.jsの変更はsession storage facade接続であり、式変更ではない。試験ページも現状の保存boot依存を維持するためソース管理へ含めるが、そのこと自体は公開許可や公開manifest追加を意味しない。

この一覧はレビュー時点の実ファイル列挙。commit前に差分を再確認し、以後追加されたファイルを無断で足さない。tmp、node_modules、secretは候補外。

### アプリ・共有・保存の接続（38件）

```text
.gitignore
app-cache.js
combat-scenario.js
dps-simulator-worker.js
enemy-status.html
enemy-status.js
formation-damage-calc.html
formation-damage-calc.js
formation-damage-dps-prototype.html
formation-damage-dps-prototype.js
formation-dps-calc.html
formation-dps-calc.js
formation-share-catalog.js
formation-share-create.js
formation-share-display-data.js
formation-share-prototype.html
formation-share-prototype.js
formation-share.html
formation-share.js
image-preload.js
index.html
public-site-runtime.js
public/board-layout-preview.html
public/board-layout-preview.js
recover-20260912.html
service-worker.js
stat-dashboard.css
stat-dashboard.html
stat-dashboard.js
stat-prototype.js
storage-backup.js
storage-bootstrap.js
storage-recovery.html
storage-registry.js
storage-runtime.js
storage-transfer-page.js
storage-transfer.html
storage-transfer.js
```

### 生成・候補・配信・検証tools（49件）

```text
tools/create-public-site-candidate.js
tools/fixtures/formation-share-catalog-v1.json
tools/fixtures/public-site-update-server.js
tools/fixtures/storage-http-baseline.html
tools/fixtures/storage-http-server.js
tools/fixtures/storage-s1-import.json
tools/fixtures/storage-s1-native-stat.html
tools/formation-share-asset-manifest.json
tools/generate-all.bat
tools/generate-formation-share-display-data.js
tools/generate-public-site.js
tools/inspect-storage.js
tools/package-lock.json
tools/package.json
tools/prepare-public-site-staging.js
tools/prepare-public-site-update.js
tools/public-route-manifest.json
tools/public-route-manifest.schema.json
tools/public-site-candidate.js
tools/record-public-site-checks.js
tools/storage-access-detector.js
tools/storage-inspection.js
tools/storage-inventory.json
tools/storage-native-browser-check.js
tools/storage-transfer-native-check.js
tools/sync-formation-share-assets.js
tools/sync-formation-share-catalog.js
tools/test-domain-rollback-recovery.js
tools/test-formation-share-assets.js
tools/test-formation-share-catalog.js
tools/test-formation-share-display-data.js
tools/test-formation-share-image.js
tools/test-formation-share-maintenance.js
tools/test-public-site-delivery.js
tools/test-public-site-http.js
tools/test-public-site-release-input.js
tools/test-public-site-staging.js
tools/test-public-site.js
tools/test-storage-backup.js
tools/test-storage-baseline.js
tools/test-storage-behavior-baseline.js
tools/test-storage-restore.js
tools/test-storage-runtime.js
tools/test-storage-transfer-page.js
tools/test-storage-transfer.js
tools/transfer-public-site-artifact.js
tools/validate-formation-share-maintenance.js
tools/validate-public-site-release-input.js
tools/validate-public-site.js
```

### 設計・記録・テンプレート（46件）

```text
AGENTS.md
GOAL.md
README.md
STATUS.md
docs/domain-migration-design.md
docs/domain-rollback-recovery-design.md
docs/formation-share-maintenance-design.md
docs/formation-share-maintenance-goal.md
docs/formation-share-maintenance-skill-integration.md
docs/formation-share-url-format.md
docs/public-site-future-plan.md
docs/public-url-design.md
docs/public-url-gate-c-design.md
docs/storage-backup-format.md
docs/storage-contract.md
docs/storage-critical-fixes-goal.md
docs/storage-critical-fixes-review-20260913.md
docs/storage-inventory.md
docs/storage-migration-commit-plan.md
docs/storage-migration-delivery-plan.md
docs/storage-migration-roadmap.md
docs/storage-native-browser-environment.md
docs/storage-p2-luna-goal.md
docs/storage-p3-luna-goal.md
docs/storage-p3-review-20260913.md
docs/storage-p4-file-input-review.md
docs/storage-p4-file-switch-fix.md
docs/storage-p4-luna-instructions.md
docs/storage-p4-review-handoff.md
docs/storage-p4-transfer-design.md
docs/storage-p5-luna-instructions.md
docs/storage-p5-review-next.md
docs/storage-p5b-candidate-instructions.md
docs/storage-p5b-git-gate-handoff.md
docs/storage-p5b-release-input-handoff.md
docs/storage-release-contract.md
docs/storage-s1-acceptance.md
docs/storage-s1-closure-instructions.md
docs/storage-s1-followup-design.md
docs/storage-s1-foundation-plan.md
docs/storage-s1-review-fix-instructions.md
docs/storage-s1-run-boundary.md
docs/storage-s1-second-followup-design.md
docs/templates/storage-p5b-local-staging.md
docs/templates/storage-p5b-pages-deploy.yml
docs/templates/storage-p5b-source-delivery.yml
```

## 保留する既存変更（維持、復元しない）

- .github/workflows/pages.yml：Node導入と共有公開前検査追加の8行。現行main push配信の実workflow変更であり、別承認まで含めない。
- tools/git/push.bat：push前共有検査の接続。push運用変更なので別承認まで含めない。
- tmp配下のrelease/checks/candidate/staging、xlsx、apostles.js/cards.js/statData.js等の今回変更のない元データ・生成物、未追跡secret・資格情報：新規に追加しない。

## 承認後の進め方

1. 上記統合commit範囲の承認を受けた後だけ、実ファイルのdiff・新規secret混入・依存一覧を再確認し、明示ファイルだけstageしてcommitする。git add -Aによる無差別追加はしない。pushしない。
2. 保留2ファイルが元worktreeに残るため、元worktreeをcleanと偽らない。確定commitの別clean checkoutで生成／checks／candidateを作る。元変更をstash/resetして消さない。別checkoutのGit worktree方式が対応外なら通常のローカルcloneを使い、外部pushはしない。
3. このclean checkoutが承認されたsourceCommitを再現できることを確認する。現行dirty出力のcandidateId/digestをそのまま公開用と見なさない。初回はpreviousなしを明示する。
4. workflowテンプレートはdocs/templatesに置いたまま。実設置・main push・新repo作成・Pages/DNS/token・初回公開の承認は別に受ける。repo名の確定は作成許可や公開許可ではない。
5. 新側案内OFF公開と実Origin検証の後で、旧案内ONを別承認する。公開成功recordの保存先・取得方法も実配信開始前に確定する。

## 今回の停止点

対象案とrepo名を文書化して停止。次の利用者承認は「この一覧の統合commitを許可、pushはしない」。本書作成でcommitを実行したとは扱わない。
