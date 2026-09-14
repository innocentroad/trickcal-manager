// storage-transfer.htmlの送受信UI。保存処理はstorage-runtimeへ委譲し、
// codec→preview→plan→applyの既存経路を再利用する。
(function initStorageTransferPage(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_STORAGE_TRANSFER_PAGE = api;
  if (!root?.document || typeof module === 'object' && module.exports) return;

  const start = () => {
    const boot = root.TRICKCAL_STORAGE_BOOT || Promise.resolve({ ok: true });
    Promise.resolve(boot).then(result => {
      if (!result?.ok) return;
      const controller = api.createController({
        window: root,
        document: root.document,
        backup: root.TRICKCAL_STORAGE_BACKUP,
        runtime: root.TRICKCAL_STORAGE_RUNTIME_INSTANCE,
        transferApi: root.TRICKCAL_STORAGE_TRANSFER
      });
      root.TRICKCAL_STORAGE_TRANSFER_PAGE_CONTROLLER = controller;
      controller.initialize();
    }).catch(error => {
      console.error(error);
      const status = root.document.getElementById('transfer-status');
      if (status) status.textContent = '転送ページを初期化できませんでした。ファイル移行を利用してください。';
    });
  };
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})(typeof globalThis !== 'undefined' ? globalThis : this, function createStorageTransferPageApi(root) {
  'use strict';

  function createElements(document) {
    return {
      status: document.getElementById('transfer-status'),
      destinationNote: document.getElementById('transfer-destination-note'),
      preview: document.getElementById('transfer-preview'),
      previewSummary: document.getElementById('transfer-preview-summary'),
      previewDetails: document.getElementById('transfer-preview-details'),
      previewDatasets: document.getElementById('transfer-preview-datasets'),
      includeDisplay: document.getElementById('transfer-include-display'),
      allowAuxiliaryExcludeWrap: document.getElementById('transfer-allow-auxiliary-exclude-wrap'),
      allowAuxiliaryExclude: document.getElementById('transfer-allow-auxiliary-exclude'),
      auxiliaryExcludeNote: document.getElementById('transfer-auxiliary-exclude-note'),
      plan: document.getElementById('transfer-plan'),
      planSummary: document.getElementById('transfer-plan-summary'),
      planDetails: document.getElementById('transfer-plan-details'),
      planDatasets: document.getElementById('transfer-plan-datasets'),
      prepare: document.getElementById('transfer-prepare'),
      apply: document.getElementById('transfer-apply'),
      cancel: document.getElementById('transfer-cancel'),
      reload: document.getElementById('transfer-reload'),
      fileButton: document.getElementById('transfer-file-button'),
      fileInput: document.getElementById('transfer-file-input'),
      backupCurrent: document.getElementById('transfer-backup-current'),
      savePackage: document.getElementById('transfer-save-package'),
      completeActions: document.getElementById('transfer-complete-actions'),
      openManager: document.getElementById('transfer-open-manager'),
      recoveryActions: document.getElementById('transfer-recovery-actions'),
      openRecovery: document.getElementById('transfer-open-recovery'),
      fileNote: document.getElementById('transfer-file-note')
    };
  }

  function failureMessage(result, fallback = '転送を処理できませんでした。') {
    const messages = {
      busy: '別の保存操作が実行中です。少し待ってから再試行してください。',
      'not-ready': '保存機能の準備が完了していません。再読み込みして再試行してください。',
      quota: '保存領域の上限に達しました。',
      'read-failed': '保存データを読み取れませんでした。',
      'write-failed': '保存データを書き込めませんでした。',
      'remove-failed': '保存データの削除確認に失敗しました。',
      stale: '新サイトの保存状態が変わりました。内容を再確認してください。',
      'recovery-required': '保存データの確認が必要です。独立復旧入口を確認してください。',
      'invalid-data': 'バックアップの形式または内容を確認できません。',
      unsupported: 'この環境では転送を利用できません。ファイル移行を利用してください。'
    };
    return messages[result?.code] || fallback;
  }

  const DATASET_LABELS = Object.freeze({
    'stat.slots': '編成・育成データ',
    'stat.current': '現在の編成状態',
    'calc.settings': '計算設定',
    'calc.resultSaves': '保存した計算結果',
    'calc.enemyPresets': '敵プリセット',
    'dps.settings': 'DPS設定',
    'dps.runtimeOverrides': 'DPS補正',
    'preference.theme': '表示設定',
    'preference.boardShortcutOffMode': 'ボード操作設定',
    'preference.boardOrientation': 'ボード向き設定',
    'preference.boardPreviewScale': 'ボード表示倍率',
    'sharePrototype.globalEnhancements': '共有表示の全体強化設定'
  });

  function datasetDisplayLabel(dataset) {
    const key = String(dataset?.key || '');
    const label = DATASET_LABELS[key] || 'その他の保存データ';
    if (key === 'stat.slots' && Array.isArray(dataset?.entries) && dataset.entries.length) {
      return `${label}（${dataset.entries.length}件）`;
    }
    return label;
  }

  function previewSummaryText(summary) {
    const present = (summary?.datasets || []).filter(dataset => dataset.state === 'present');
    const excluded = (summary?.datasets || []).filter(dataset => dataset.state === 'excluded');
    if (!present.length && !excluded.length) return '保存データを含まないバックアップです。';
    const labels = present.map(datasetDisplayLabel);
    const presentText = labels.length ? `${labels.join('、')}を含むバックアップです。` : '保存データはありません。';
    return excluded.length
      ? `${presentText}一部の補助設定は確認が必要です。`
      : presentText;
  }

  function createController(options = {}) {
    const windowObject = options.window || root;
    const document = options.document || windowObject.document;
    const backup = options.backup;
    const runtime = options.runtime;
    const transferApi = options.transferApi;
    const elements = options.elements || createElements(document);
    let receiver = options.receiver || null;
    let receiverMessageHandler = null;
    let directTransferGeneration = 0;
    let directTransferAssociation = receiver
      ? { receiver, generation: directTransferGeneration }
      : null;
    let directTransferPackageDigest = null;
    let pendingDecoded = null;
    let pendingPackageText = '';
    let pendingMaintenance = null;
    let pendingPlan = null;
    let isApplyingRestore = false;
    let recoveryBlocked = false;
    let isBackupExporting = false;
    let isReadingFile = false;
    let initialized = false;

    function setStatus(message, isError = false, kind = 'normal') {
      if (!elements.status) return;
      elements.status.textContent = message;
      elements.status.dataset.kind = isError ? 'error' : kind;
    }

    function isCurrentDirectTransfer(association) {
      return !!association
        && association.receiver === receiver
        && association.generation === directTransferGeneration
        && !!directTransferAssociation
        && directTransferAssociation.receiver === association.receiver
        && directTransferAssociation.generation === association.generation;
    }

    function bindReceiverMessageListener() {
      const directReceiver = receiver;
      if (!directReceiver?.handleMessage || typeof windowObject.addEventListener !== 'function') return false;
      const association = directTransferAssociation || {
        receiver: directReceiver,
        generation: directTransferGeneration
      };
      directTransferAssociation = association;
      receiverMessageHandler = event => {
        if (!isCurrentDirectTransfer(association)) return;
        directReceiver.handleMessage(event);
      };
      windowObject.addEventListener('message', receiverMessageHandler);
      return true;
    }

    function detachDirectTransfer(reason = 'file-switch') {
      const directReceiver = receiver;
      if (!directReceiver && !receiverMessageHandler) return false;
      directTransferGeneration += 1;
      receiver = null;
      directTransferAssociation = null;
      directTransferPackageDigest = null;
      if (receiverMessageHandler && typeof windowObject.removeEventListener === 'function') {
        windowObject.removeEventListener('message', receiverMessageHandler);
      }
      receiverMessageHandler = null;
      if (directReceiver?.sendReject) {
        try {
          directReceiver.sendReject(reason, {
            message: 'direct transfer ended before restore'
          });
        } catch (error) {
          console.error(error);
        }
      }
      return true;
    }

    function getReceiverForPackage(packageDigest) {
      if (!packageDigest || !receiver || !directTransferAssociation
        || !isCurrentDirectTransfer(directTransferAssociation)
        || directTransferPackageDigest !== packageDigest) return null;
      const receiverDigest = receiver.getState?.().packageDigest;
      if (receiverDigest && receiverDigest !== packageDigest) return null;
      return receiver;
    }

    function isOperationLocked() {
      return isApplyingRestore || recoveryBlocked || isBackupExporting || isReadingFile;
    }

    function isPackageInteractionLocked() {
      return isOperationLocked() || !!pendingMaintenance;
    }

    function lockedStatusMessage() {
      if (recoveryBlocked) return '復旧処理が必要です。画面を閉じず、独立復旧入口を確認してください。';
      if (isApplyingRestore) return '復元を適用中です。完了確認まで操作できません。';
      if (isBackupExporting) return 'バックアップを保存中です。完了までお待ちください。';
      if (isReadingFile) return 'バックアップファイルを読み込んでいます。完了までお待ちください。';
      return '復元対象を確認中です。完了または取消してから操作してください。';
    }

    function syncOperationControls() {
      const operationLocked = isOperationLocked();
      const packageLocked = isPackageInteractionLocked();
      if (elements.prepare && !elements.prepare.hidden) elements.prepare.disabled = operationLocked;
      if (elements.apply && !elements.apply.hidden) elements.apply.disabled = operationLocked;
      if (elements.includeDisplay) elements.includeDisplay.disabled = packageLocked;
      if (elements.allowAuxiliaryExclude) elements.allowAuxiliaryExclude.disabled = packageLocked;
      if (elements.cancel) elements.cancel.disabled = operationLocked;
      if (elements.fileButton) elements.fileButton.disabled = packageLocked;
      if (elements.fileInput) elements.fileInput.disabled = packageLocked;
      if (elements.backupCurrent) elements.backupCurrent.disabled = packageLocked;
      if (elements.savePackage) {
        elements.savePackage.hidden = !pendingDecoded;
        elements.savePackage.disabled = packageLocked || !pendingPackageText;
      }
      if (elements.recoveryActions) elements.recoveryActions.hidden = !recoveryBlocked;
      if (elements.openRecovery) elements.openRecovery.hidden = !recoveryBlocked;
    }

    function resetPlanControls() {
      isApplyingRestore = false;
      recoveryBlocked = false;
      isBackupExporting = false;
      if (elements.plan) elements.plan.hidden = true;
      if (elements.previewDetails) elements.previewDetails.open = false;
      if (elements.planDetails) elements.planDetails.open = false;
      if (elements.planSummary) elements.planSummary.textContent = '';
      elements.planDatasets?.replaceChildren();
      if (elements.prepare) {
        elements.prepare.hidden = false;
        elements.prepare.disabled = false;
      }
      if (elements.apply) {
        elements.apply.hidden = true;
        elements.apply.disabled = false;
      }
      if (elements.cancel) {
        elements.cancel.hidden = false;
        elements.cancel.disabled = false;
      }
      if (elements.reload) elements.reload.hidden = true;
      if (elements.completeActions) elements.completeActions.hidden = true;
      if (elements.openManager) {
        elements.openManager.hidden = true;
        elements.openManager.href = '#';
      }
      if (elements.includeDisplay) elements.includeDisplay.disabled = false;
      if (elements.allowAuxiliaryExclude) {
        elements.allowAuxiliaryExclude.checked = false;
        elements.allowAuxiliaryExclude.disabled = false;
      }
      if (elements.allowAuxiliaryExcludeWrap) elements.allowAuxiliaryExcludeWrap.hidden = true;
      if (elements.auxiliaryExcludeNote) elements.auxiliaryExcludeNote.hidden = true;
      syncOperationControls();
    }

    function clearPendingPackage() {
      pendingDecoded = null;
      pendingPackageText = '';
      pendingPlan = null;
      if (elements.preview) elements.preview.hidden = true;
      if (elements.previewSummary) elements.previewSummary.textContent = '';
      elements.previewDatasets?.replaceChildren();
      resetPlanControls();
    }

    function renderPreview(decoded) {
      const summary = decoded?.summary || {};
      const excluded = (summary.datasets || []).filter(dataset => dataset.state === 'excluded');
      if (elements.previewSummary) {
        elements.previewSummary.textContent = previewSummaryText(summary);
      }
      elements.previewDatasets?.replaceChildren();
      (summary.datasets || []).forEach(dataset => {
        const item = document.createElement('li');
        const source = dataset.entries?.length ? `（${dataset.entries.join('・')}）` : '';
        const state = dataset.state === 'present' ? 'あり' : dataset.state === 'excluded' ? '除外候補' : 'なし';
        item.textContent = `${datasetDisplayLabel(dataset)}: ${state}${source}`;
        elements.previewDatasets?.appendChild(item);
      });
      resetPlanControls();
      if (excluded.length) {
        if (elements.allowAuxiliaryExcludeWrap) elements.allowAuxiliaryExcludeWrap.hidden = false;
        if (elements.auxiliaryExcludeNote) elements.auxiliaryExcludeNote.hidden = false;
      }
      if (elements.preview) elements.preview.hidden = false;
      if (elements.previewDetails) elements.previewDetails.open = false;
    }

    function renderPlan(plan) {
      const summary = plan?.summary || {};
      if (elements.planSummary) {
        const display = plan?.includeDisplaySettings ? '表示設定も復元' : '表示設定は維持';
        const excluded = plan?.excludedAuxiliaryKeys?.length
          ? `・補助設定${plan.excludedAuxiliaryKeys.length}件は現在値を維持`
          : '';
        elements.planSummary.textContent = `${plan?.affectedEntryCount || 0}項目を適用（${display}）${excluded}`;
      }
      elements.planDatasets?.replaceChildren();
      (summary.datasets || [])
        .filter(dataset => plan?.datasetKeys?.includes(dataset.key))
        .forEach(dataset => {
          const item = document.createElement('li');
          const source = dataset.entries?.length ? `（${dataset.entries.join('・')}）` : '';
          const state = dataset.state === 'present' ? '上書き' : dataset.state === 'excluded' ? '現在値を維持（除外）' : '削除';
          item.textContent = `${datasetDisplayLabel(dataset)}: ${state}${source}`;
          elements.planDatasets?.appendChild(item);
        });
      if (elements.plan) elements.plan.hidden = false;
      if (elements.planDetails) elements.planDetails.open = false;
      if (elements.completeActions) elements.completeActions.hidden = true;
      if (elements.openManager) elements.openManager.hidden = true;
      if (elements.prepare) elements.prepare.hidden = true;
      if (elements.apply) {
        elements.apply.hidden = false;
        elements.apply.disabled = false;
      }
      if (elements.includeDisplay) elements.includeDisplay.disabled = true;
      if (elements.allowAuxiliaryExclude) elements.allowAuxiliaryExclude.disabled = true;
      syncOperationControls();
    }

    async function decodePackageText(text, expectedDigest = '', options = {}) {
      const association = options?.association || null;
      const expectedGeneration = Number.isInteger(options?.generation)
        ? options.generation
        : association?.generation;
      if (association && !isCurrentDirectTransfer(association)) return false;
      if (Number.isInteger(expectedGeneration) && expectedGeneration !== directTransferGeneration) return false;
      const allowWhileReading = options?.allowWhileReading === true;
      if (isPackageInteractionLocked() && !allowWhileReading) {
        setStatus(lockedStatusMessage(), true);
        return false;
      }
      if (!backup?.decodeBackupPackage) {
        setStatus('バックアップ機能を読み込めませんでした。', true);
        return false;
      }
      if (backup.isRescuePackage?.(text)) {
        setStatus('これは救出形式のファイルです。通常の復元には使用できません。', true);
        return false;
      }
      const decoded = await backup.decodeBackupPackage(text);
      if (association && !isCurrentDirectTransfer(association)) return false;
      if (Number.isInteger(expectedGeneration) && expectedGeneration !== directTransferGeneration) return false;
      if (!decoded?.ok) {
        setStatus(failureMessage(decoded), true);
        return false;
      }
      if (expectedDigest && decoded.value.package.sha256 !== expectedDigest) {
        setStatus('転送されたバックアップのdigestが一致しません。', true);
        return false;
      }
      pendingDecoded = decoded.value;
      pendingPackageText = text;
      renderPreview(pendingDecoded);
      setStatus('内容を確認しました。移行内容を確認するまで保存データは変更していません。');
      return true;
    }

    async function receivePayload(payload, association = null) {
      const activeAssociation = association || directTransferAssociation;
      if (activeAssociation && !isCurrentDirectTransfer(activeAssociation)) return false;
      if (isPackageInteractionLocked()) {
        setStatus(lockedStatusMessage(), true);
        return false;
      }
      if (!payload?.packageJson || !payload.packageDigest) return false;
      const received = await decodePackageText(payload.packageJson, payload.packageDigest, {
        association: activeAssociation,
        generation: activeAssociation?.generation
      });
      if (!received || (activeAssociation && !isCurrentDirectTransfer(activeAssociation))) return false;
      if (activeAssociation) directTransferPackageDigest = pendingDecoded.package.sha256;
      if (activeAssociation?.receiver?.sendPreview) {
        activeAssociation.receiver.sendPreview(pendingDecoded.summary);
      }
      return received;
    }

    async function prepareRestore() {
      if (!pendingDecoded || pendingMaintenance || isOperationLocked() || !runtime?.beginMaintenance) return false;
      if (elements.prepare) elements.prepare.disabled = true;
      setStatus('復元対象を再確認しています。新サイトの保存状態を保護します…');
      let maintenance = null;
      try {
        const begun = await runtime.beginMaintenance('restore');
        if (!begun?.ok) {
          setStatus(failureMessage(begun), true);
          return false;
        }
        maintenance = begun.value;
        const planned = await maintenance.planRestore(pendingDecoded, {
          includeDisplaySettings: elements.includeDisplay?.checked !== false,
          allowAuxiliaryExclusion: elements.allowAuxiliaryExclude?.checked === true
        });
        if (!planned?.ok) {
          const cancelled = await maintenance.cancel();
          if (!cancelled?.ok) setStatus(failureMessage(cancelled), true);
          setStatus(failureMessage(planned), true);
          return false;
        }
        pendingMaintenance = maintenance;
        pendingPlan = planned.value;
        renderPlan(pendingPlan);
        setStatus('復元対象を確認しました。最終ボタンを押すまで保存データは置き換えません。');
        return true;
      } catch (error) {
        console.error(error);
        if (maintenance) await maintenance.cancel();
        setStatus('復元対象を確認できませんでした。', true);
        return false;
      } finally {
        if (elements.prepare && !pendingMaintenance) elements.prepare.disabled = false;
      }
    }

    async function applyRestore() {
      if (!pendingMaintenance || !pendingPlan || isOperationLocked()) return false;
      isApplyingRestore = true;
      syncOperationControls();
      if (elements.apply) elements.apply.disabled = true;
      if (elements.prepare) elements.prepare.disabled = true;
      setStatus('移行しています…完了確認までお待ちください。');
      const maintenance = pendingMaintenance;
      const plan = pendingPlan;
      const packageDigest = pendingDecoded?.package?.sha256 || '';
      let transferReceiver = getReceiverForPackage(packageDigest);
      try {
        if (transferReceiver && !transferReceiver.sendApplying({
          selection: {
            includeDisplaySettings: plan.includeDisplaySettings,
            allowAuxiliaryExclusion: plan.allowAuxiliaryExclusion
          },
          transactionId: plan.transactionId
        })) transferReceiver = null;
        const result = await maintenance.applyRestore(plan);
        if (result?.ok) {
          pendingMaintenance = null;
          pendingPlan = null;
          isApplyingRestore = false;
          if (elements.prepare) elements.prepare.hidden = true;
          if (elements.apply) elements.apply.hidden = true;
          if (elements.cancel) elements.cancel.hidden = true;
          if (elements.plan) elements.plan.hidden = true;
          if (elements.completeActions) elements.completeActions.hidden = false;
          const copy = applyProfileCopy();
          if (elements.openManager) {
            elements.openManager.href = getCurrentManagerUrl();
            elements.openManager.hidden = false;
          }
          if (transferReceiver && getReceiverForPackage(packageDigest) === transferReceiver) {
            const epoch = result.value?.epoch || runtime?.getState?.()?.epoch || '';
            transferReceiver.sendResult({
              ok: true,
              committed: true,
              transactionId: result.value?.transactionId || plan.transactionId,
              epoch
            });
          }
          syncOperationControls();
          setStatus(copy.success, false, 'success');
          return true;
        }
        if (transferReceiver && getReceiverForPackage(packageDigest) === transferReceiver) {
          transferReceiver.sendResult({ ok: false, errorCode: result?.code, errorMessage: failureMessage(result) });
        }
        const cancelled = await maintenance.cancel();
        if (cancelled?.ok) {
          pendingMaintenance = null;
          pendingPlan = null;
          isApplyingRestore = false;
          renderPreview(pendingDecoded);
          setStatus(`${failureMessage(result)} 元の状態へ戻しました。`, true);
        } else {
          isApplyingRestore = false;
          recoveryBlocked = true;
          applyProfileCopy();
          syncOperationControls();
          setStatus(`${failureMessage(result)} 復旧処理が必要です。復旧ページを開いて確認してください。`, true);
        }
        return false;
      } catch (error) {
        console.error(error);
        isApplyingRestore = false;
        recoveryBlocked = true;
        applyProfileCopy();
        syncOperationControls();
        setStatus('復元結果を確認できません。復旧処理が必要です。復旧ページを開いて確認してください。', true);
        return false;
      } finally {
        isApplyingRestore = false;
        syncOperationControls();
      }
    }

    async function cancelRestore() {
      if (isApplyingRestore || recoveryBlocked || isBackupExporting) {
        setStatus(lockedStatusMessage(), true);
        return false;
      }
      if (pendingMaintenance) {
        const cancelled = await pendingMaintenance.cancel();
        if (!cancelled?.ok) {
          setStatus('復元処理を閉じられません。独立復旧入口で確認してください。', true);
          return false;
        }
        pendingMaintenance = null;
        pendingPlan = null;
      }
      pendingDecoded = null;
      pendingPackageText = '';
      if (elements.preview) elements.preview.hidden = true;
      if (elements.fileInput) elements.fileInput.value = '';
      setStatus('転送確認を取り消しました。保存データは変更されていません。');
      resetPlanControls();
      syncOperationControls();
      return true;
    }

    function getCurrentProfileKind() {
      const location = windowObject.location || {};
      const hostname = String(location.hostname || '').toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]' || !hostname) {
        return 'localhost';
      }
      const configuredProfile = String(windowObject.TRICKCAL_PUBLIC_SITE?.profile || '').toLowerCase();
      if (configuredProfile === 'legacy' || String(location.pathname || '').startsWith('/trickcal-manager/')) {
        return 'legacy';
      }
      if (configuredProfile === 'new' || configuredProfile === 'source') return 'new';
      return 'current';
    }

    function getProfileUiCopy() {
      switch (getCurrentProfileKind()) {
        case 'new':
          return {
            destination: '旧サイトで保存したバックアップファイルを選び、新サイトへ移行します。',
            success: '新サイトへの移行が完了しました。新サイトを開いて確認してください。',
            managerLabel: '新サイトを開く'
          };
        case 'legacy':
          return {
            destination: '保存済みのバックアップファイルを選び、この旧サイトへ復元します。',
            success: '旧サイトへの復元が完了しました。旧サイトを開いて確認してください。',
            managerLabel: '旧サイトを開く'
          };
        case 'localhost':
          return {
            destination: '保存済みのバックアップファイルを選び、この現在のサイトへ復元します。',
            success: '現在のサイトへの復元が完了しました。現在のサイトを開いて確認してください。',
            managerLabel: '現在のサイトを開く'
          };
        default:
          return {
            destination: '保存済みのバックアップファイルを選び、この現在のサイトへ復元します。',
            success: '現在のサイトへの復元が完了しました。現在のサイトを開いて確認してください。',
            managerLabel: '現在のサイトを開く'
          };
      }
    }

    function getCurrentRouteUrl(routeId, fallbackPath) {
      const location = windowObject.location || {};
      const origin = String(location.origin || '');
      let path = '';
      try {
        path = windowObject.TRICKCAL_PUBLIC_SITE?.pageUrl?.(routeId) || '';
      } catch (error) {
        console.warn(`profile-aware ${routeId} link unavailable`, error);
      }
      if (!path) path = fallbackPath;
      try {
        return new URL(path, origin || 'http://localhost/').href;
      } catch {
        return path || fallbackPath;
      }
    }

    function getCurrentManagerUrl() {
      return getCurrentRouteUrl(
        'manager',
        getCurrentProfileKind() === 'legacy'
          ? '/trickcal-manager/stat-dashboard.html'
          : '/manager/'
      );
    }

    function getCurrentRecoveryUrl() {
      return getCurrentRouteUrl(
        'recovery',
        getCurrentProfileKind() === 'legacy'
          ? '/trickcal-manager/storage-recovery.html'
          : '/recovery/'
      );
    }

    function applyProfileCopy() {
      const copy = getProfileUiCopy();
      if (elements.destinationNote) elements.destinationNote.textContent = copy.destination;
      if (elements.openManager) elements.openManager.textContent = copy.managerLabel;
      if (elements.openRecovery) elements.openRecovery.href = getCurrentRecoveryUrl();
      return copy;
    }

    function downloadPackageText(packageText, filenamePrefix, statusMessage) {
      const BlobConstructor = windowObject.Blob || (typeof Blob === 'function' ? Blob : null);
      const urlApi = windowObject.URL || (typeof URL !== 'undefined' ? URL : null);
      if (!BlobConstructor || !urlApi?.createObjectURL || !urlApi?.revokeObjectURL || !document?.createElement) {
        setStatus('ファイル保存を利用できません。ファイル移行を手動で行ってください。', true);
        return false;
      }
      const blob = new BlobConstructor([packageText], { type: 'application/json' });
      const url = urlApi.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `${filenamePrefix}-${date}.json`;
      document.body?.appendChild(link);
      link.click?.();
      link.remove?.();
      urlApi.revokeObjectURL(url);
      setStatus(`${statusMessage}（${blob.size} bytes）`);
      return true;
    }

    function saveReceivedPackage() {
      if (isPackageInteractionLocked()) {
        setStatus(lockedStatusMessage(), true);
        return false;
      }
      if (!pendingDecoded || !pendingPackageText) {
        setStatus('受信したバックアップはまだありません。', true);
        return false;
      }
      return downloadPackageText(
        pendingPackageText,
        'trickcal-manager-transfer',
        '受信したバックアップを保存しました'
      );
    }

    async function backupCurrentData() {
      if (pendingMaintenance || isOperationLocked()) {
        setStatus(lockedStatusMessage(), true);
        return false;
      }
      if (!runtime?.beginMaintenance || !backup?.createBackupPackageFromEntries) {
        setStatus('バックアップ機能を読み込めませんでした。', true);
        return false;
      }
      isBackupExporting = true;
      syncOperationControls();
      setStatus('新サイトの現在データをバックアップしています…');
      let maintenance = null;
      try {
        const begun = await runtime.beginMaintenance('backup');
        if (!begun?.ok) {
          setStatus(failureMessage(begun), true);
          return false;
        }
        maintenance = begun.value;
        const result = await maintenance.export({
          sourceMode: 'stored-only',
          sourceRelease: backup.getDefaultSourceRelease?.()
        });
        if (!result?.ok) {
          setStatus(failureMessage(result), true);
          return false;
        }
        return downloadPackageText(
          JSON.stringify(result.value),
          'trickcal-manager-current-backup',
          '新サイトのバックアップを保存しました'
        );
      } catch (error) {
        console.error(error);
        setStatus('新サイトのバックアップを作成できませんでした。', true);
        return false;
      } finally {
        if (maintenance) {
          const cancelled = await maintenance.cancel();
          if (!cancelled?.ok) setStatus(failureMessage(cancelled), true);
        }
        isBackupExporting = false;
        syncOperationControls();
      }
    }

    async function selectFile(file) {
      if (isPackageInteractionLocked()) {
        setStatus(lockedStatusMessage(), true);
        return false;
      }
      if (!file) return false;
      // A real file selection is a new restore source. End the direct transfer
      // before reading or decoding it so an in-flight direct payload cannot
      // replace the file preview or receive a later apply notification.
      detachDirectTransfer('file-switch');
      isReadingFile = true;
      clearPendingPackage();
      syncOperationControls();
      try {
        return await decodePackageText(await file.text(), '', { allowWhileReading: true });
      } catch (error) {
        console.error(error);
        setStatus('バックアップファイルを確認できません。', true);
        return false;
      } finally {
        isReadingFile = false;
        syncOperationControls();
      }
    }

    function initialize() {
      if (initialized) return;
      initialized = true;
      applyProfileCopy();
      resetPlanControls();
      if (elements.preview) elements.preview.hidden = true;
      if (!receiver && windowObject.opener && transferApi?.createReceiver) {
        try {
          const generation = directTransferGeneration;
          let association = null;
          const directReceiver = transferApi.createReceiver({
            peerWindow: windowObject.opener,
            peerOrigin: transferApi.getConfiguredPeerOrigin?.('source') || transferApi.defaultSourceOrigin,
            listeners: {
              payload(value) {
                if (!association || !isCurrentDirectTransfer(association)) return;
                void receivePayload(value, association);
              },
              reject() {
                if (association && isCurrentDirectTransfer(association)) {
                  setStatus('送信元との通信を確認できません。ファイル移行を利用してください。', true);
                }
              }
            }
          });
          association = { receiver: directReceiver, generation };
          receiver = directReceiver;
          directTransferAssociation = association;
        } catch (error) {
          console.error(error);
          setStatus('転送接続を開始できません。ファイル移行を利用してください。', true);
        }
      }
      if (receiver) {
        if (!directTransferAssociation) {
          directTransferAssociation = {
            receiver,
            generation: directTransferGeneration
          };
        }
        bindReceiverMessageListener();
        setStatus('送信元からのバックアップを待っています。届かない場合はファイル移行を利用してください。');
      } else {
        setStatus('ファイルからバックアップを選択できます。');
      }
      elements.fileButton?.addEventListener('click', () => {
        if (isPackageInteractionLocked()) {
          setStatus(lockedStatusMessage(), true);
          return;
        }
        elements.fileInput?.click();
      });
      elements.fileInput?.addEventListener('change', async () => {
        if (isPackageInteractionLocked()) {
          elements.fileInput.value = '';
          setStatus(lockedStatusMessage(), true);
          return;
        }
        const file = elements.fileInput.files?.[0];
        if (!file) return;
        try {
          await selectFile(file);
        } finally {
          elements.fileInput.value = '';
        }
      });
      elements.prepare?.addEventListener('click', () => void prepareRestore());
      elements.apply?.addEventListener('click', () => void applyRestore());
      elements.cancel?.addEventListener('click', () => void cancelRestore());
      elements.reload?.addEventListener('click', () => windowObject.location.reload());
      elements.backupCurrent?.addEventListener('click', () => void backupCurrentData());
      elements.savePackage?.addEventListener('click', () => saveReceivedPackage());
      syncOperationControls();
    }

    function getState() {
      return {
        hasPackage: !!pendingDecoded,
        packageDigest: pendingDecoded?.package?.sha256 || null,
        hasMaintenance: !!pendingMaintenance,
        hasPlan: !!pendingPlan,
        isApplying: isApplyingRestore,
        isReadingFile,
        recoveryBlocked,
        receiverReady: receiver?.getState?.().phase === transferApi?.phases?.READY
      };
    }

    return Object.freeze({
      initialize,
      receivePayload,
      decodePackageText,
      prepareRestore,
      applyRestore,
      cancelRestore,
      backupCurrentData,
      saveReceivedPackage,
      getState
    });
  }

  return Object.freeze({ createController });
});
