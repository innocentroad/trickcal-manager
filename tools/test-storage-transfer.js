#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const backup = require('../storage-backup.js');
const transfer = require('../storage-transfer.js');

const OLD_ORIGIN = 'https://old.example.test';
const NEW_ORIGIN = 'https://new.example.test';
const TRANSFER_ID = 'transfer-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const NONCE = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

function createWindowPair() {
  const calls = [];
  let oldHandler = null;
  let newHandler = null;
  let dropNextAck = false;
  const oldWindow = {
    postMessage(message, targetOrigin) {
      calls.push({ direction: 'new-to-old', message, targetOrigin });
      assert.equal(targetOrigin, OLD_ORIGIN, 'receiverが固定old origin以外へ送信しました');
      if (newHandler) newHandler({ data: message, origin: NEW_ORIGIN, source: newWindow });
    }
  };
  const newWindow = {
    postMessage(message, targetOrigin) {
      calls.push({ direction: 'old-to-new', message, targetOrigin });
      assert.equal(targetOrigin, NEW_ORIGIN, 'senderが固定new origin以外へ送信しました');
      if (dropNextAck && message.type === transfer.messageTypes.PAYLOAD_ACK) {
        dropNextAck = false;
        return;
      }
      if (oldHandler) oldHandler({ data: message, origin: OLD_ORIGIN, source: oldWindow });
    }
  };
  return {
    oldWindow,
    newWindow,
    calls,
    connect(sender, receiver) {
      oldHandler = event => receiver.handleMessage(event);
      newHandler = event => sender.handleMessage(event);
    },
    dropNextPayloadAck() {
      dropNextAck = true;
    }
  };
}

function createSession(pair, events = {}) {
  const sender = transfer.createSender({
    peerWindow: pair.newWindow,
    peerOrigin: NEW_ORIGIN,
    transferId: TRANSFER_ID,
    nonce: NONCE,
    sourceMode: 'current-tab',
    listeners: events.sender || {}
  });
  const receiver = transfer.createReceiver({
    peerWindow: pair.oldWindow,
    peerOrigin: OLD_ORIGIN,
    listeners: events.receiver || {}
  });
  pair.connect(sender, receiver);
  return { sender, receiver };
}

async function createPackage() {
  const created = await backup.createBackupPackageFromEntries({
    'calc.resultSaves': '[]',
    'stat.slotStore': JSON.stringify({
      schemaVersion: 2,
      storeRevision: 1,
      slots: {}
    })
  }, {
    sourceMode: 'current-tab',
    sourceRelease: 'transfer-test',
    createdAt: '2026-09-13T00:00:00.000Z'
  });
  assert.equal(created.ok, true, JSON.stringify(created));
  return {
    packageJson: JSON.stringify(created.value),
    packageDigest: created.value.sha256
  };
}

function testLocalTransferGateAndHandoffWiring() {
  assert.equal(transfer.isLocalTestTransferEnabled({
    location: { hostname: '127.0.0.1' },
    TRICKCAL_STORAGE_TRANSFER_TEST_ENABLED: true
  }), true, 'loopbackのツール用転送フックが有効になりません');
  assert.equal(transfer.isLocalTestTransferEnabled({
    location: { hostname: '127.0.0.1', search: '?native=storage-transfer' },
    TRICKCAL_STORAGE_TRANSFER_TEST_ENABLED: false
  }), false, 'URLパラメータだけで転送フックが有効になりました');
  assert.equal(transfer.isLocalTestTransferEnabled({
    location: { hostname: 'trickcal.irlab.dev' },
    TRICKCAL_STORAGE_TRANSFER_TEST_ENABLED: true
  }), false, '公開Originでツール用転送フックが有効になりました');

  const statHtml = fs.readFileSync(path.join(__dirname, '..', 'stat-dashboard.html'), 'utf8');
  const statSource = fs.readFileSync(path.join(__dirname, '..', 'stat-prototype.js'), 'utf8');
  const transferPage = fs.readFileSync(path.join(__dirname, '..', 'storage-transfer-page.js'), 'utf8');
  const transferHtml = fs.readFileSync(path.join(__dirname, '..', 'storage-transfer.html'), 'utf8');
  const nativeRunner = fs.readFileSync(path.join(__dirname, 'storage-transfer-native-check.js'), 'utf8');
  assert.match(statHtml, /id="backup-transfer" hidden/, '送信ボタンがデフォルト非表示ではありません');
  assert.match(statSource, /storageTransfer\?\.isLocalTestTransferEnabled\?\.\(\) === true/, '送信UIがlocal test gateを利用していません');
  assert.match(statSource, /backupTransferPackageJson\s*=\s*JSON\.stringify\(result\.value\)/, '送信時点パッケージを固定保存していません');
  assert.match(statSource, /packageJson:\s*backupTransferPackageJson/, '送信時点の固定パッケージを送信していません');
  assert.match(statSource, /function saveBackupTransferPackage/, '送信パッケージ保存UIがありません');
  assert.match(transferPage, /isApplyingRestore|recoveryBlocked/, '適用中・復旧要のロック状態がありません');
  assert.match(transferPage, /function backupCurrentData/, '受信側の適用前バックアップがありません');
  assert.match(transferPage, /function saveReceivedPackage/, '受信パッケージの保存処理がありません');
  assert.match(transferHtml, /id="transfer-backup-current"/, '受信側の適用前バックアップボタンがありません');
  assert.match(transferHtml, /id="transfer-save-package"/, '受信側の受信パッケージ保存ボタンがありません');
  assert.match(nativeRunner, /TRICKCAL_STORAGE_TRANSFER_TEST_ENABLED = true/, 'native runnerがtools専用フックを注入していません');
}

async function testHandshakeTimeoutCanRetry() {
  let timeoutCount = 0;
  let helloCount = 0;
  const sender = transfer.createSender({
    peerWindow: { postMessage(message) { if (message.type === transfer.messageTypes.HELLO) helloCount += 1; } },
    peerOrigin: NEW_ORIGIN,
    transferId: TRANSFER_ID,
    nonce: NONCE,
    listeners: { timeout() { timeoutCount += 1; } }
  });
  assert.equal(sender.startHandshake({ intervalMs: 10, timeoutMs: 35 }), true);
  await new Promise(resolve => setTimeout(resolve, 90));
  assert.equal(sender.getState().phase, transfer.phases.FAILED, 'timeout後にsenderが失敗状態になりません');
  assert.equal(timeoutCount, 1, 'timeout callbackが一度だけ発火していません');
  assert.equal(sender.startHandshake({ intervalMs: 10, timeoutMs: 35 }), true, 'timeout後の明示再試行を受け付けません');
  await new Promise(resolve => setTimeout(resolve, 90));
  assert.equal(sender.getState().phase, transfer.phases.FAILED, '再試行のtimeout後に失敗状態になりません');
  assert.equal(timeoutCount, 2, '再試行のtimeout callbackが発火していません');
  assert.equal(helloCount >= 2, true, '再試行でHELLOを再送していません');
}

async function testRejectStopsHandshakeUntilExplicitRetry() {
  let helloCount = 0;
  const peerWindow = {
    postMessage(message) {
      if (message.type === transfer.messageTypes.HELLO) helloCount += 1;
    }
  };
  const sender = transfer.createSender({
    peerWindow,
    peerOrigin: NEW_ORIGIN,
    transferId: TRANSFER_ID,
    nonce: NONCE
  });
  assert.equal(sender.startHandshake({ intervalMs: 10, timeoutMs: 500 }), true);
  assert.equal(sender.handleMessage({
    data: {
      protocol: transfer.protocol,
      type: transfer.messageTypes.REJECT,
      stage: transfer.phases.HELLO,
      transferId: TRANSFER_ID,
      nonce: NONCE,
      code: 'not-ready'
    },
    origin: NEW_ORIGIN,
    source: peerWindow
  }), true);
  await new Promise(resolve => setTimeout(resolve, 90));
  assert.equal(sender.getState().phase, transfer.phases.REJECTED, 'reject後にrejected状態を保持していません');
  assert.equal(helloCount, 1, 'reject後に明示操作なしでHELLOを再送しました');
}

async function testHandshakePayloadReceiptAndValidation() {
  const pair = createWindowPair();
  const callbacks = {
    payload: 0,
    applying: 0,
    result: 0,
    status: 0,
    rejects: []
  };
  const session = createSession(pair, {
    sender: {
      applying() { callbacks.applying += 1; },
      result() { callbacks.result += 1; },
      status() { callbacks.status += 1; },
      reject(value) { callbacks.rejects.push(value); }
    },
    receiver: {
      payload() { callbacks.payload += 1; },
      'applying-sent'() { callbacks.applying += 1; },
      'result-sent'() { callbacks.result += 1; },
      reject(value) { callbacks.rejects.push(value); }
    }
  });
  const { sender, receiver } = session;
  assert.equal(sender.hello(), true);
  assert.equal(sender.getState().phase, transfer.phases.READY);
  assert.equal(receiver.getState().phase, transfer.phases.READY);

  const payload = await createPackage();
  assert.equal(sender.sendPayload(payload), true);
  assert.equal(callbacks.payload, 1, '初回payloadが一度だけ受信されていません');
  assert.equal(sender.getState().phase, transfer.phases.PAYLOAD_SENT);
  assert.equal(receiver.getState().phase, transfer.phases.PAYLOAD_RECEIVED);
  assert.ok(pair.calls.some(call => call.message.type === transfer.messageTypes.PAYLOAD_ACK));
  const duplicateReady = pair.calls.find(call => call.message.type === transfer.messageTypes.READY).message;
  assert.equal(sender.handleMessage({
    data: duplicateReady,
    origin: NEW_ORIGIN,
    source: pair.newWindow
  }), true, 'payload送信後の重複READYを拒否しました');
  assert.equal(sender.getState().phase, transfer.phases.PAYLOAD_SENT, '重複READYでpayload段階が巻き戻りました');

  assert.equal(receiver.sendPreview({ presentDatasets: 2, totalDatasets: 12 }), true);
  assert.equal(sender.getState().phase, transfer.phases.PREVIEW);
  assert.equal(receiver.sendApplying({
    selection: { includeDisplaySettings: true, allowAuxiliaryExclusion: false },
    transactionId: 'restore-transfer-test-1'
  }), true);
  assert.equal(sender.getState().phase, transfer.phases.APPLYING);
  assert.equal(callbacks.applying, 2, 'APPLYINGが送受信callbackへ届いていません');

  assert.equal(sender.handleMessage({
    data: {
      protocol: transfer.protocol,
      type: transfer.messageTypes.REJECT,
      stage: transfer.phases.APPLYING,
      transferId: TRANSFER_ID,
      nonce: NONCE,
      code: 'communication-lost'
    },
    origin: NEW_ORIGIN,
    source: pair.newWindow
  }), true, '適用開始後の通信拒否を処理できません');
  assert.equal(sender.getState().phase, transfer.phases.APPLYING, '適用開始後の拒否で再適用可能状態へ戻りました');

  const applyingMessage = pair.calls.at(-1).message;
  const forgedUncommittedResult = {
    ...applyingMessage,
    type: transfer.messageTypes.RESULT,
    stage: transfer.phases.APPLYING,
    ok: true,
    committed: false,
    packageDigest: payload.packageDigest,
    receipt: {
      transferId: TRANSFER_ID,
      packageDigest: payload.packageDigest,
      selection: { includeDisplaySettings: true, allowAuxiliaryExclusion: false },
      transactionId: 'restore-transfer-test-1',
      epoch: 'epoch-1',
      status: 'complete'
    }
  };
  assert.equal(sender.handleMessage({
    data: forgedUncommittedResult,
    origin: NEW_ORIGIN,
    source: pair.newWindow
  }), false, '実保存前の成功RESULTを受理しました');
  assert.equal(sender.getState().phase, transfer.phases.APPLYING);

  assert.equal(receiver.sendResult({
    ok: true,
    committed: true,
    transactionId: 'restore-transfer-test-1',
    epoch: 'epoch-1'
  }), true);
  assert.equal(sender.getState().phase, transfer.phases.COMPLETE);
  assert.equal(receiver.getState().phase, transfer.phases.COMPLETE);
  assert.equal(sender.getState().receipt.transactionId, 'restore-transfer-test-1');
  assert.equal(sender.getState().receipt.packageDigest, payload.packageDigest);

  const payloadMessage = pair.calls.find(call => call.message.type === transfer.messageTypes.PAYLOAD).message;
  assert.equal(receiver.handleMessage({
    data: payloadMessage,
    origin: OLD_ORIGIN,
    source: pair.oldWindow
  }), true, '同一payloadの再送を受理できません');
  assert.equal(callbacks.payload, 1, '同一payload再送で復元処理callbackが二重実行されました');
  assert.equal(callbacks.result >= 2, true, 'complete済みreceiptの再通知がありません');

  const statusBefore = callbacks.status;
  assert.equal(sender.sendStatusQuery(), true);
  assert.equal(callbacks.status, statusBefore + 1, 'STATUS_QUERYが書込みなしの応答を受けません');
  assert.equal(receiver.getState().phase, transfer.phases.COMPLETE);

  const differentDigest = { ...payload, packageDigest: 'c'.repeat(64), packageJson: `${payload.packageJson} ` };
  assert.equal(sender.sendPayload(differentDigest), false, '完了済み転送へ別digestを送信できました');
  assert.equal(callbacks.payload, 1);
}

async function testAckLossAndOriginDigestRejection() {
  const pair = createWindowPair();
  const payloadCount = { value: 0 };
  const session = createSession(pair, {
    receiver: { payload() { payloadCount.value += 1; } }
  });
  const { sender, receiver } = session;
  assert.equal(sender.hello(), true);
  const payload = await createPackage();
  pair.dropNextPayloadAck();
  assert.equal(sender.sendPayload(payload), true);
  assert.equal(payloadCount.value, 1, 'ACK欠落テストの初回payloadが届きません');
  assert.equal(sender.getState().phase, transfer.phases.PAYLOAD_SENT);
  assert.equal(sender.sendPayload(payload), true, '同一digest再送を許可できません');
  assert.equal(payloadCount.value, 1, 'ACK欠落時の同一digest再送でpayload処理が二重化しました');

  const invalidOrigin = {
    data: pair.calls.find(call => call.message.type === transfer.messageTypes.PAYLOAD).message,
    origin: 'https://attacker.example.test',
    source: pair.newWindow
  };
  assert.equal(receiver.handleMessage(invalidOrigin), false, '異なるOriginのpayloadを受理しました');
  assert.equal(payloadCount.value, 1);

  const invalidSource = {
    data: invalidOrigin.data,
    origin: OLD_ORIGIN,
    source: {}
  };
  assert.equal(receiver.handleMessage(invalidSource), false, '異なるWindow sourceのpayloadを受理しました');
  assert.equal(payloadCount.value, 1);

  const differentPayload = {
    ...invalidOrigin.data,
    packageDigest: 'd'.repeat(64),
    packageJson: `${payload.packageJson} `
  };
  assert.equal(receiver.handleMessage({
    data: differentPayload,
    origin: OLD_ORIGIN,
    source: pair.oldWindow
  }), false, '同一transferIdの異なるdigestを受理しました');
  assert.equal(payloadCount.value, 1);

  const badSenderPair = createWindowPair();
  const badSender = transfer.createSender({
    peerWindow: badSenderPair.newWindow,
    peerOrigin: NEW_ORIGIN,
    transferId: TRANSFER_ID,
    nonce: NONCE
  });
  assert.throws(
    () => transfer.createSender({ peerWindow: badSenderPair.newWindow, peerOrigin: '*', transferId: TRANSFER_ID, nonce: NONCE }),
    error => error?.code === 'invalid-data',
    'wildcard target originを拒否しません'
  );
  assert.equal(badSender.handleMessage({
    data: { protocol: transfer.protocol, type: transfer.messageTypes.READY, stage: transfer.phases.READY, transferId: TRANSFER_ID, nonce: NONCE },
    origin: NEW_ORIGIN,
    source: {}
  }), false, '異なるsourceのREADYを受理しました');
}

async function testInvalidHandshakeAndReceiptBinding() {
  const pair = createWindowPair();
  const session = createSession(pair);
  const payload = await createPackage();
  const hello = {
    protocol: transfer.protocol,
    type: transfer.messageTypes.HELLO,
    stage: transfer.phases.HELLO,
    transferId: TRANSFER_ID,
    nonce: NONCE
  };
  assert.equal(session.receiver.handleMessage({ data: hello, origin: 'https://wrong.example.test', source: pair.oldWindow }), false);
  assert.equal(session.receiver.getState().phase, transfer.phases.IDLE);
  assert.equal(session.sender.hello(), true);
  assert.equal(session.sender.sendPayload(payload), true);
  assert.equal(session.receiver.sendPreview({ ok: true }), true);
  assert.equal(session.receiver.sendApplying({ selection: {}, transactionId: 'tx-1' }), true);
  const lastApplying = pair.calls.at(-1).message;
  const badReceipt = {
    ...lastApplying,
    type: transfer.messageTypes.RESULT,
    stage: transfer.phases.COMPLETE,
    ok: true,
    committed: true,
    packageDigest: payload.packageDigest,
    receipt: {
      transferId: TRANSFER_ID,
      packageDigest: 'e'.repeat(64),
      selection: {},
      transactionId: 'tx-1',
      epoch: 'epoch-1',
      status: 'complete'
    }
  };
  assert.equal(session.sender.handleMessage({ data: badReceipt, origin: NEW_ORIGIN, source: pair.newWindow }), false);
  assert.equal(session.sender.getState().phase, transfer.phases.APPLYING);
}

(async () => {
  assert.equal(transfer.protocol, 1);
  assert.equal(transfer.messageTypes.PAYLOAD, 'PAYLOAD');
  assert.equal(transfer.phases.COMPLETE, 'complete');
  assert.equal(transfer.createNonce().length >= 32, true);
  assert.match(transfer.createTransferId(), /^transfer-[0-9a-f]{32}$/);
  testLocalTransferGateAndHandoffWiring();
  await testHandshakeTimeoutCanRetry();
  await testRejectStopsHandshakeUntilExplicitRetry();
  await testHandshakePayloadReceiptAndValidation();
  await testAckLossAndOriginDigestRejection();
  await testInvalidHandshakeAndReceiptBinding();
  console.log('storage transfer tests passed: local gate, timeout retry, origin/source binding, nonce, digest, receipt, duplicate, ack-loss, no auto-apply');
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
