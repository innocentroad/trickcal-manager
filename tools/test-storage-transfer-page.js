#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const backup = require('../storage-backup.js');
const pageApi = require('../storage-transfer-page.js');
const transfer = require('../storage-transfer.js');

const OLD_ORIGIN = 'https://old.example.test';
const NEW_ORIGIN = 'https://new.example.test';
const TRANSFER_ID = 'transfer-cccccccccccccccccccccccccccccccc';
const NONCE = 'dddddddddddddddddddddddddddddddd';

function element() {
  return {
    hidden: false,
    disabled: false,
    checked: false,
    value: '',
    files: [],
    href: '',
    download: '',
    textContent: '',
    dataset: {},
    children: [],
    listeners: {},
    replaceChildren() { this.children = []; },
    appendChild(child) { this.children.push(child); return child; },
    addEventListener(type, listener) { this.listeners[type] = listener; },
    click() {},
    remove() {}
  };
}

function createElements() {
  const elements = {};
  [
    'status', 'preview', 'previewSummary', 'previewDatasets', 'includeDisplay',
    'allowAuxiliaryExcludeWrap', 'allowAuxiliaryExclude', 'auxiliaryExcludeNote',
    'plan', 'planSummary', 'planDatasets', 'prepare', 'apply', 'cancel', 'reload',
    'fileButton', 'fileInput', 'backupCurrent', 'savePackage', 'fileNote'
  ].forEach(key => { elements[key] = element(); });
  elements.includeDisplay.checked = true;
  return elements;
}

function createDownloadEnvironment(downloads) {
  const objects = new Map();
  let nextUrl = 0;
  class TestBlob {
    constructor(parts) {
      this.text = parts.map(part => String(part)).join('');
      this.size = Buffer.byteLength(this.text, 'utf8');
    }
  }
  const windowObject = {
    opener: null,
    Blob: TestBlob,
    URL: {
      createObjectURL(blob) {
        const url = `blob:test-${++nextUrl}`;
        objects.set(url, blob);
        return url;
      },
      revokeObjectURL(url) { objects.delete(url); }
    },
    addEventListener() {}
  };
  const document = {
    createElement(tagName) {
      const node = element();
      if (tagName === 'a') {
        node.click = () => {
          const blob = objects.get(node.href);
          downloads.push({ filename: node.download, text: blob?.text || '' });
        };
      }
      return node;
    },
    body: { appendChild() {} }
  };
  return { window: windowObject, document };
}

function createTransferWindowPair() {
  const calls = [];
  let senderHandler = null;
  let receiverHandler = null;
  const oldWindow = {
    postMessage(message, targetOrigin) {
      calls.push({ direction: 'new-to-old', message, targetOrigin });
      assert.equal(targetOrigin, OLD_ORIGIN);
      if (senderHandler) senderHandler({ data: message, origin: NEW_ORIGIN, source: newWindow });
    }
  };
  const newWindow = {
    postMessage(message, targetOrigin) {
      calls.push({ direction: 'old-to-new', message, targetOrigin });
      assert.equal(targetOrigin, NEW_ORIGIN);
      if (receiverHandler) receiverHandler({ data: message, origin: OLD_ORIGIN, source: oldWindow });
    }
  };
  return {
    oldWindow,
    newWindow,
    calls,
    connect(sender, receiver) {
      senderHandler = event => sender.handleMessage(event);
      receiverHandler = event => receiver.handleMessage(event);
    }
  };
}

function createTransferPageEnvironment() {
  const messageListeners = [];
  const windowObject = {
    opener: null,
    location: { reload() {} },
    addEventListener(type, listener) {
      if (type === 'message') messageListeners.push(listener);
    },
    removeEventListener(type, listener) {
      if (type !== 'message') return;
      const index = messageListeners.indexOf(listener);
      if (index >= 0) messageListeners.splice(index, 1);
    }
  };
  const document = {
    createElement() { return element(); },
    body: { appendChild() {} }
  };
  return {
    window: windowObject,
    document,
    messageListeners
  };
}

function loadPreFixPageApi() {
  const sourcePath = path.join(__dirname, '..', 'storage-transfer-page.js');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const oldFileHandler = 'await selectFile(file);';
  assert.equal(source.split(oldFileHandler).length, 2, 'F1のファイル選択境界が一意ではありません');
  const currentReceiverBinding = 'let transferReceiver = getReceiverForPackage(packageDigest);';
  const currentNotificationBinding = 'if (transferReceiver && getReceiverForPackage(packageDigest) === transferReceiver)';
  assert.equal(source.split(currentReceiverBinding).length, 2, 'F1の適用receiver境界が一意ではありません');
  assert.equal(source.split(currentNotificationBinding).length, 3, 'F1の通知receiver境界が2箇所ではありません');
  const preFixSource = source
    .replace(oldFileHandler, 'await decodePackageText(await file.text());')
    .replace(currentReceiverBinding, 'let transferReceiver = receiver;')
    .replaceAll(currentNotificationBinding, 'if (transferReceiver)');
  const legacyModule = { exports: {} };
  vm.runInNewContext(preFixSource, {
    module: legacyModule,
    globalThis: {},
    console
  }, { filename: sourcePath });
  return legacyModule.exports;
}

async function createPackage(sourceRelease = 'transfer-page-test') {
  const result = await backup.createBackupPackageFromEntries({
    'stat.slotStore': JSON.stringify({ schemaVersion: 2, storeRevision: 1, slots: {} }),
    'calc.resultSaves': '[]'
  }, {
    sourceMode: 'current-tab',
    sourceRelease,
    createdAt: '2026-09-13T00:00:00.000Z'
  });
  assert.equal(result.ok, true, JSON.stringify(result));
  return JSON.stringify(result.value);
}

function createControlRuntime(events, options = {}) {
  return {
    beginMaintenance(kind = 'restore') {
      events.beginMaintenance += 1;
      events.maintenanceKinds?.push(kind);
      const maintenance = {
        async export() {
          events.export = (events.export || 0) + 1;
          return { ok: true, value: options.exportValue || JSON.parse(options.exportPackageJson || '{}') };
        },
        async planRestore(decoded) {
          events.planRestore += 1;
          events.plannedDigest = decoded.package.sha256;
          return {
            ok: true,
            value: {
              packageDigest: decoded.package.sha256,
              summary: decoded.summary,
              includeDisplaySettings: true,
              allowAuxiliaryExclusion: false,
              excludedAuxiliaryKeys: [],
              affectedEntryCount: 2,
              datasetKeys: ['stat.slots', 'calc.resultSaves'],
              transactionId: 'restore-page-test'
            }
          };
        },
        async applyRestore(plan) {
          events.applyRestore += 1;
          events.appliedPlan = plan;
          if (options.applyResult) return options.applyResult;
          return { ok: true, value: { phase: 'complete', transactionId: 'restore-page-test' } };
        },
        async cancel() {
          events.cancel += 1;
          return options.cancelResult || { ok: true };
        }
      };
      return Promise.resolve({ ok: true, value: maintenance });
    },
    getState() {
      return { epoch: 'epoch-page-test' };
    }
  };
}

async function runFileSwitchScenario({ legacy = false, delayDirectDecode = false } = {}) {
  const packageAJson = await createPackage('transfer-page-file-A');
  const packageBJson = await createPackage('transfer-page-file-B');
  const packageA = { packageJson: packageAJson, packageDigest: JSON.parse(packageAJson).sha256 };
  const packageB = { packageJson: packageBJson, packageDigest: JSON.parse(packageBJson).sha256 };
  assert.notEqual(packageA.packageDigest, packageB.packageDigest, 'F1のA/B packageが同一です');
  const pair = createTransferWindowPair();
  const environment = createTransferPageEnvironment();
  const elements = createElements();
  const events = {
    beginMaintenance: 0,
    planRestore: 0,
    applyRestore: 0,
    cancel: 0,
    plannedDigest: null,
    appliedPlan: null,
    senderResults: [],
    senderRejects: [],
    receiverRejects: [],
    payloadCount: 0
  };
  let releaseDirectDecode = null;
  let directDecodeStarted = null;
  let startDirectDecode = null;
  if (delayDirectDecode) {
    directDecodeStarted = new Promise(resolve => { startDirectDecode = resolve; });
    const directDecodeGate = new Promise(resolve => { releaseDirectDecode = resolve; });
    events.backup = {
      ...backup,
      async decodeBackupPackage(text) {
        if (text === packageA.packageJson) {
          startDirectDecode();
          await directDecodeGate;
        }
        return backup.decodeBackupPackage(text);
      }
    };
  }
  const controllerApi = legacy ? loadPreFixPageApi() : pageApi;
  let controller = null;
  let receiver = null;
  const directAssociation = { receiver: null, generation: 0 };
  let directPayloadPromise = null;
  receiver = transfer.createReceiver({
    peerWindow: pair.oldWindow,
    peerOrigin: OLD_ORIGIN,
    listeners: {
      payload(value) {
        events.payloadCount += 1;
        const pending = controller.receivePayload(value, directAssociation);
        if (!directPayloadPromise) directPayloadPromise = pending;
      },
      reject(value) { events.receiverRejects.push(value); }
    }
  });
  directAssociation.receiver = receiver;
  const sender = transfer.createSender({
    peerWindow: pair.newWindow,
    peerOrigin: NEW_ORIGIN,
    transferId: TRANSFER_ID,
    nonce: NONCE,
    listeners: {
      result(value) { events.senderResults.push(value); },
      reject(value) { events.senderRejects.push(value); }
    }
  });
  pair.connect(sender, receiver);
  controller = controllerApi.createController({
    window: environment.window,
    document: environment.document,
    backup: events.backup || backup,
    runtime: createControlRuntime(events),
    transferApi: transfer,
    receiver,
    elements
  });
  controller.initialize();
  assert.equal(sender.hello(), true, 'F1の直接転送HELLOを開始できません');
  assert.equal(sender.getState().phase, transfer.phases.READY);
  assert.equal(sender.sendPayload(packageA), true, 'F1のA送信に失敗しました');
  if (delayDirectDecode) {
    await directDecodeStarted;
  } else {
    assert.equal(await directPayloadPromise, true, 'F1のA受信decodeに失敗しました');
  }

  if (legacy) {
    // This is the pre-F1 file-input operation: the old handler decoded B
    // without ending the A receiver association.
    assert.equal(await controller.decodePackageText(packageB.packageJson), true, '修正前B decodeを再現できません');
  } else {
    elements.fileInput.files = [];
    await elements.fileInput.listeners.change();
    assert.equal(environment.messageListeners.length, 1, 'ファイル未選択でdirect listenerを外しました');
    assert.equal(sender.getState().phase, transfer.phases.PAYLOAD_SENT, 'cancelでA転送を終了しました');
    elements.fileInput.files = [{ text: async () => packageB.packageJson }];
    await elements.fileInput.listeners.change();
    assert.equal(environment.messageListeners.length, 0, 'B選択後もdirect listenerが残っています');
  }

  if (delayDirectDecode) {
    assert.equal(controller.getState().packageDigest, packageB.packageDigest, 'Bのpreviewが作成されていません');
    releaseDirectDecode();
    assert.equal(await directPayloadPromise, false, '遅延したAのdecodeを受理しました');
    assert.equal(controller.getState().packageDigest, packageB.packageDigest, '遅延AがBのpreviewを置換しました');
  }
  assert.equal(await controller.prepareRestore(), true, 'Bのplan作成に失敗しました');
  assert.equal(await controller.applyRestore(), true, 'Bの明示applyに失敗しました');
  return {
    packageA,
    packageB,
    senderPhase: sender.getState().phase,
    senderReceipt: sender.getState().receipt,
    senderResults: events.senderResults,
    senderRejects: events.senderRejects,
    receiverRejects: events.receiverRejects,
    plannedDigest: events.plannedDigest,
    appliedDigest: events.appliedPlan?.packageDigest || null,
    applyRestore: events.applyRestore,
    removedListener: environment.messageListeners.length === 0
  };
}

async function testFileSwitchDoesNotReuseDirectTransfer() {
  const preFix = await runFileSwitchScenario({ legacy: true });
  assert.equal(preFix.senderPhase, transfer.phases.COMPLETE, '修正前反例がA成功へ到達しませんでした');
  assert.equal(preFix.senderResults.length, 1, '修正前反例の成功RESULTがありません');
  assert.equal(preFix.senderReceipt.packageDigest, preFix.packageA.packageDigest, '修正前RESULTがAに束縛されていません');
  assert.equal(preFix.plannedDigest, preFix.packageB.packageDigest, '修正前もBのplanを通っていません');

  const fixed = await runFileSwitchScenario({ delayDirectDecode: true });
  assert.equal(fixed.senderPhase, transfer.phases.REJECTED, 'B選択後にsenderがrejectedになっていません');
  assert.equal(fixed.senderResults.length, 0, 'BのapplyでAのRESULTを送信しました');
  assert.equal(fixed.senderRejects[0]?.code, 'file-switch', 'Aの転送終了通知がREJECTではありません');
  assert.equal(fixed.receiverRejects[0]?.code, 'file-switch', 'receiverの転送終了記録がありません');
  assert.equal(fixed.plannedDigest, fixed.packageB.packageDigest, 'Bをplanしていません');
  assert.equal(fixed.appliedDigest, fixed.packageB.packageDigest, 'Bをapplyしていません');
  assert.equal(fixed.applyRestore, 1, 'Bのapplyが一度だけ実行されていません');
  assert.equal(fixed.removedListener, true, 'B選択後のdirect listener解放を確認できません');
  return {
    preFixPhase: preFix.senderPhase,
    preFixResultCount: preFix.senderResults.length,
    fixedPhase: fixed.senderPhase,
    fixedResultCount: fixed.senderResults.length,
    fixedAppliedDigest: fixed.appliedDigest
  };
}

async function testInvalidFileClearsPreviousPackage() {
  const validPackage = await createPackage('transfer-page-f0-valid');
  const environment = createTransferPageEnvironment();
  const elements = createElements();
  const events = {
    beginMaintenance: 0,
    planRestore: 0,
    applyRestore: 0,
    cancel: 0
  };
  const controller = pageApi.createController({
    window: environment.window,
    document: environment.document,
    backup,
    runtime: createControlRuntime(events),
    transferApi: transfer,
    elements
  });
  controller.initialize();
  assert.equal(await controller.decodePackageText(validPackage), true, 'F0の旧A previewを作成できません');
  assert.equal(controller.getState().hasPackage, true);
  let releaseRead;
  let readStartedResolve;
  const readStarted = new Promise(resolve => { readStartedResolve = resolve; });
  const readGate = new Promise(resolve => { releaseRead = resolve; });
  elements.fileInput.files = [{
    text: async () => {
      readStartedResolve();
      await readGate;
      return '{invalid-json';
    }
  }];
  const invalidFileChange = elements.fileInput.listeners.change();
  await readStarted;
  assert.equal(controller.getState().isReadingFile, true, '読込み中状態へ遷移していません');
  assert.equal(controller.getState().hasPackage, false, '読込み中も旧A packageが残っています');
  assert.equal(elements.preview.hidden, true, '読込み中も旧A previewが表示されています');
  assert.equal(elements.prepare.disabled, true, '読込み中もprepareが有効です');
  assert.equal(await controller.prepareRestore(), false, '読込み中にprepareを受け付けました');
  assert.equal(await controller.applyRestore(), false, '読込み中にapplyを受け付けました');
  assert.equal(controller.saveReceivedPackage(), false, '読込み中に旧package保存を受け付けました');
  releaseRead();
  await invalidFileChange;
  assert.equal(controller.getState().hasPackage, false, '不正B後も旧A packageが残っています');
  assert.equal(controller.getState().hasPlan, false, '不正B後も旧A planが残っています');
  assert.equal(elements.preview.hidden, true, '不正B後も旧A previewが表示されています');
  assert.equal(events.planRestore, 0, '不正B後に旧Aのplanへ到達しました');
  assert.equal(events.applyRestore, 0, '不正B後に旧Aのapplyへ到達しました');
}

async function testTransferPipelineAndFileFallback() {
  const packageJson = await createPackage();
  const downloads = [];
  const downloadEnvironment = createDownloadEnvironment(downloads);
  const events = {
    beginMaintenance: 0,
    planRestore: 0,
    applyRestore: 0,
    cancel: 0,
    previews: [],
    applying: [],
    results: [],
    appliedPlan: null
  };
  const receiver = {
    sendPreview(summary) { events.previews.push(summary); return true; },
    sendApplying(value) { events.applying.push(value); return true; },
    sendResult(value) { events.results.push(value); return true; },
    getState() { return { phase: 'ready' }; }
  };
  const elements = createElements();
  const controller = pageApi.createController({
    window: downloadEnvironment.window,
    document: downloadEnvironment.document,
    backup,
    runtime: createControlRuntime(events),
    transferApi: { phases: { READY: 'ready' } },
    receiver,
    elements
  });

  assert.equal(await controller.receivePayload({
    packageJson,
    packageDigest: JSON.parse(packageJson).sha256
  }), true);
  assert.equal(controller.getState().hasPackage, true);
  assert.equal(events.previews.length, 1, '受信payloadがpreviewへ接続されていません');
  assert.equal(events.applyRestore, 0, 'payload受信だけで自動復元しました');
  assert.equal(await controller.prepareRestore(), true);
  assert.equal(events.planRestore, 1, '既存planRestoreへ接続されていません');
  assert.equal(events.applyRestore, 0, 'plan確認だけで復元しました');
  assert.equal(await controller.applyRestore(), true);
  assert.equal(events.applyRestore, 1, '既存applyRestoreへ接続されていません');
  assert.equal(events.applying[0].transactionId, 'restore-page-test');
  assert.equal(events.results[0].committed, true, '保存完了後の成功通知になっていません');
  assert.equal(events.results[0].epoch, 'epoch-page-test');
  assert.equal(controller.saveReceivedPackage(), true, '受信パッケージの保存に失敗しました');
  assert.equal(downloads.at(-1).text, packageJson, '受信パッケージを受信時のJSONのまま保存していません');

  const backupDownloads = [];
  const backupEnvironment = createDownloadEnvironment(backupDownloads);
  const backupEvents = { beginMaintenance: 0, cancel: 0, export: 0, maintenanceKinds: [] };
  const backupController = pageApi.createController({
    window: backupEnvironment.window,
    document: backupEnvironment.document,
    backup,
    runtime: createControlRuntime(backupEvents, { exportPackageJson: packageJson }),
    transferApi: { phases: { READY: 'ready' } },
    elements: createElements()
  });
  assert.equal(await backupController.backupCurrentData(), true, '受信側の適用前バックアップに失敗しました');
  assert.equal(backupEvents.maintenanceKinds[0], 'backup', '適用前バックアップがmaintenance backup経路を使っていません');
  assert.equal(backupEvents.export, 1, '適用前バックアップのexportが一度だけ実行されていません');
  assert.equal((await backup.decodeBackupPackage(backupDownloads.at(-1).text)).ok, true, '適用前バックアップがdecode可能ではありません');

  let resolveApply;
  const deferredApply = new Promise(resolve => { resolveApply = resolve; });
  const lockedEvents = { beginMaintenance: 0, planRestore: 0, applyRestore: 0, cancel: 0, maintenanceKinds: [] };
  const lockedElements = createElements();
  const lockedController = pageApi.createController({
    window: { opener: null, addEventListener() {} },
    document: { createElement: element },
    backup,
    runtime: createControlRuntime(lockedEvents, { applyResult: deferredApply }),
    transferApi: { phases: { READY: 'ready' } },
    elements: lockedElements
  });
  assert.equal(await lockedController.receivePayload({ packageJson, packageDigest: JSON.parse(packageJson).sha256 }), true);
  assert.equal(await lockedController.prepareRestore(), true);
  const applyingPromise = lockedController.applyRestore();
  assert.equal(lockedController.getState().isApplying, true, '適用開始時にロック状態へ遷移していません');
  assert.equal(lockedElements.cancel.disabled, true, '適用中も取消ボタンが有効です');
  assert.equal(lockedElements.fileButton.disabled, true, '適用中もファイル移行UIが有効です');
  assert.equal(await lockedController.cancelRestore(), false, '適用中の取消を受け付けました');
  assert.equal(await lockedController.decodePackageText(packageJson), false, '適用中の別パッケージを受け付けました');
  resolveApply({ ok: true, value: { phase: 'complete', transactionId: 'restore-page-test' } });
  assert.equal(await applyingPromise, true, 'ロックテストの適用完了に失敗しました');

  const recoveryEvents = { beginMaintenance: 0, planRestore: 0, applyRestore: 0, cancel: 0, maintenanceKinds: [] };
  const recoveryElements = createElements();
  const recoveryController = pageApi.createController({
    window: { opener: null, addEventListener() {} },
    document: { createElement: element },
    backup,
    runtime: createControlRuntime(recoveryEvents, { applyResult: { ok: false, code: 'write-failed' }, cancelResult: { ok: false, code: 'recovery-required' } }),
    transferApi: { phases: { READY: 'ready' } },
    elements: recoveryElements
  });
  assert.equal(await recoveryController.receivePayload({ packageJson, packageDigest: JSON.parse(packageJson).sha256 }), true);
  assert.equal(await recoveryController.prepareRestore(), true);
  assert.equal(await recoveryController.applyRestore(), false, '適用失敗を成功として扱いました');
  assert.equal(recoveryController.getState().recoveryBlocked, true, '適用失敗後に復旧要状態を保持していません');
  assert.equal(recoveryElements.cancel.disabled, true, '復旧要状態で取消を許可しました');
  assert.equal(await recoveryController.decodePackageText(packageJson), false, '復旧要状態で別パッケージを受け付けました');

  const fileEvents = { beginMaintenance: 0, planRestore: 0, applyRestore: 0, cancel: 0 };
  const fileElements = createElements();
  const fileController = pageApi.createController({
    window: { opener: null, addEventListener() {} },
    document: { createElement: element },
    backup,
    runtime: createControlRuntime(fileEvents),
    transferApi: { phases: { READY: 'ready' } },
    elements: fileElements
  });
  assert.equal(await fileController.decodePackageText(packageJson), true, 'ファイル代替のdecodeに失敗しました');
  assert.equal(await fileController.prepareRestore(), true, 'ファイル代替が同じplan pipelineを使っていません');
  assert.equal(await fileController.cancelRestore(), true, 'ファイル代替の取消が失敗しました');
  assert.equal(fileEvents.applyRestore, 0, 'ファイル代替の取消で復元しました');
  assert.equal(fileController.getState().hasPackage, false);
}

(async () => {
  await testInvalidFileClearsPreviousPackage();
  const fileSwitch = await testFileSwitchDoesNotReuseDirectTransfer();
  await testTransferPipelineAndFileFallback();
  console.log(`storage transfer page tests passed: F1 pre-fix ${fileSwitch.preFixPhase}/RESULT=${fileSwitch.preFixResultCount}; fixed ${fileSwitch.fixedPhase}/RESULT=${fileSwitch.fixedResultCount}/B-apply, delayed payload guard, decode, preview, explicit plan/apply, receipt, cancel, file fallback`);
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
