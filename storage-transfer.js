// 旧Originから新Originへ、検証済みbackup packageを明示操作で渡す通信層。
// 保存・復元は行わず、postMessageの相手検証と転送状態・receiptだけを扱う。
(function initStorageTransfer(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_STORAGE_TRANSFER = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createStorageTransferApi(root) {
  'use strict';

  const PROTOCOL = 1;
  const MAX_PACKAGE_BYTES = 8 * 1024 * 1024;
  const MAX_JSON_DEPTH = 32;
  const MAX_JSON_NODES = 10000;
  const DEFAULT_SOURCE_ORIGIN = 'https://innocentroad.github.io';
  const DEFAULT_TARGET_ORIGIN = 'https://trickcal.irlab.dev';
  const LOCAL_TEST_HOSTNAMES = new Set(['127.0.0.1', 'localhost']);
  const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
  const MESSAGE_TYPES = Object.freeze({
    HELLO: 'HELLO',
    READY: 'READY',
    PAYLOAD: 'PAYLOAD',
    PAYLOAD_ACK: 'PAYLOAD_ACK',
    PREVIEW: 'PREVIEW',
    APPLYING: 'APPLYING',
    RESULT: 'RESULT',
    STATUS_QUERY: 'STATUS_QUERY',
    STATUS_RESPONSE: 'STATUS_RESPONSE',
    REJECT: 'REJECT'
  });
  const PHASES = Object.freeze({
    IDLE: 'idle',
    HELLO: 'hello',
    READY: 'ready',
    PAYLOAD_SENT: 'payload-sent',
    PAYLOAD_RECEIVED: 'payload-received',
    PREVIEW: 'preview',
    APPLYING: 'applying',
    COMPLETE: 'complete',
    FAILED: 'failed',
    REJECTED: 'rejected'
  });

  function utf8ByteLength(value) {
    const text = String(value);
    if (typeof TextEncoder === 'function') return new TextEncoder().encode(text).byteLength;
    if (typeof Buffer !== 'undefined') return Buffer.byteLength(text, 'utf8');
    return unescape(encodeURIComponent(text)).length;
  }

  function randomHex(byteLength = 16) {
    const bytes = new Uint8Array(byteLength);
    const cryptoObject = root?.crypto;
    if (typeof cryptoObject?.getRandomValues === 'function') {
      cryptoObject.getRandomValues(bytes);
      return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    if (typeof require === 'function') {
      try {
        const nodeCrypto = require('node:crypto');
        if (typeof nodeCrypto.randomBytes === 'function') {
          return nodeCrypto.randomBytes(byteLength).toString('hex');
        }
      } catch {
        // Unsupported host. Do not silently downgrade a transfer identifier.
      }
    }
    throw new Error('cryptographic randomness is unavailable');
  }

  function createNonce() {
    return randomHex(16);
  }

  function createTransferId() {
    return `transfer-${randomHex(16)}`;
  }

  function isNonEmptyString(value, maxLength = 256) {
    return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
  }

  function isValidOrigin(value) {
    if (!isNonEmptyString(value, 512) || value === '*') return false;
    try {
      const parsed = new URL(value);
      return ['http:', 'https:'].includes(parsed.protocol)
        && parsed.origin === value
        && !parsed.username
        && !parsed.password;
    } catch {
      return false;
    }
  }

  function getConfiguredPeerOrigin(kind) {
    const defaultOrigin = kind === 'source' ? DEFAULT_SOURCE_ORIGIN : DEFAULT_TARGET_ORIGIN;
    const hostname = String(root?.location?.hostname || '');
    if (!['127.0.0.1', 'localhost'].includes(hostname)) return defaultOrigin;
    const candidate = kind === 'source'
      ? root?.TRICKCAL_STORAGE_TRANSFER_TEST_SOURCE_ORIGIN
      : root?.TRICKCAL_STORAGE_TRANSFER_TEST_TARGET_ORIGIN;
    if (isValidOrigin(candidate)) return candidate;
    // The local two-origin runner may open this page with a local opener before
    // it can inject a page variable. This fallback is limited to loopback and
    // never changes the production allowlist or reads a URL parameter.
    if (kind === 'source' && root?.document?.referrer) {
      try {
        const referrerOrigin = new URL(root.document.referrer).origin;
        if (new URL(referrerOrigin).hostname === hostname && isValidOrigin(referrerOrigin)) {
          return referrerOrigin;
        }
      } catch {
        // Keep the fixed production origin when the local referrer is absent.
      }
    }
    return defaultOrigin;
  }

  function isLocalTestTransferEnabled(environment = root) {
    const hostname = String(environment?.location?.hostname || '').toLowerCase();
    return LOCAL_TEST_HOSTNAMES.has(hostname)
      && environment?.TRICKCAL_STORAGE_TRANSFER_TEST_ENABLED === true;
  }

  function isValidNonce(value) {
    return typeof value === 'string' && /^[0-9a-f]{32,}$/.test(value);
  }

  function isValidTransferId(value) {
    return typeof value === 'string'
      && /^transfer-[A-Za-z0-9_-]{32,128}$/.test(value);
  }

  function isValidDigest(value) {
    return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
  }

  function assertSafeJson(value, path = '$', depth = 0, counter = { value: 0 }) {
    if (depth > MAX_JSON_DEPTH) throw new Error(`JSON depth exceeded at ${path}`);
    counter.value += 1;
    if (counter.value > MAX_JSON_NODES) throw new Error(`JSON node count exceeded at ${path}`);
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) throw new Error(`non-finite number at ${path}`);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => assertSafeJson(item, `${path}[${index}]`, depth + 1, counter));
      return;
    }
    if (!value || typeof value !== 'object') throw new Error(`unsupported JSON value at ${path}`);
    Object.keys(value).forEach(key => {
      if (DANGEROUS_KEYS.has(key)) throw new Error(`dangerous JSON key at ${path}.${key}`);
      assertSafeJson(value[key], `${path}.${key}`, depth + 1, counter);
    });
  }

  function cloneSafeJson(value, label) {
    try {
      assertSafeJson(value);
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      const wrapped = new Error(`${label || 'value'} is not safe JSON`);
      wrapped.code = 'invalid-data';
      wrapped.cause = error;
      throw wrapped;
    }
  }

  function validateCommonMessage(message, expectedTransferId, expectedNonce) {
    if (!message || typeof message !== 'object' || Array.isArray(message)) return 'invalid-message';
    if (message.protocol !== PROTOCOL) return 'protocol-mismatch';
    if (!Object.values(MESSAGE_TYPES).includes(message.type)) return 'invalid-message';
    if (!isValidTransferId(message.transferId) || message.transferId !== expectedTransferId) return 'transfer-mismatch';
    if (!isValidNonce(message.nonce) || message.nonce !== expectedNonce) return 'nonce-mismatch';
    if (!isNonEmptyString(message.stage, 64)) return 'invalid-stage';
    return '';
  }

  function requireWindow(value, label) {
    if (!value || typeof value.postMessage !== 'function') {
      const error = new Error(`${label} window is unavailable`);
      error.code = 'unsupported';
      throw error;
    }
    return value;
  }

  function requireOptions(options, role) {
    const peerWindow = requireWindow(options.peerWindow, 'peer');
    if (!isValidOrigin(options.peerOrigin)) {
      const error = new Error(`${role} peerOrigin must be an exact http(s) origin`);
      error.code = 'invalid-data';
      throw error;
    }
    const transferId = options.transferId || createTransferId();
    const nonce = options.nonce || createNonce();
    if (!isValidTransferId(transferId) || !isValidNonce(nonce)) {
      const error = new Error(`${role} transfer identifiers are invalid`);
      error.code = 'invalid-data';
      throw error;
    }
    return { peerWindow, peerOrigin: options.peerOrigin, transferId, nonce };
  }

  function createBaseState(values, role) {
    return {
      role,
      phase: PHASES.IDLE,
      transferId: values.transferId,
      nonce: values.nonce,
      peerOrigin: values.peerOrigin,
      packageDigest: null,
      packageJson: null,
      selection: null,
      internalTransactionId: null,
      epoch: null,
      receipt: null,
      lastRejectCode: null
    };
  }

  function createSender(options = {}) {
    const values = requireOptions(options, 'sender');
    const state = createBaseState(values, 'sender');
    const listeners = options.listeners || {};
    let handshakeTimer = null;

    function emit(name, value) {
      if (typeof listeners[name] === 'function') listeners[name](value, getState());
    }

    function post(type, fields = {}, stage = state.phase) {
      const message = {
        protocol: PROTOCOL,
        type,
        stage,
        transferId: state.transferId,
        nonce: state.nonce,
        ...fields
      };
      values.peerWindow.postMessage(message, values.peerOrigin);
      return message;
    }

    function reject(code, details = {}) {
      state.lastRejectCode = code;
      emit('reject', { code, ...details });
      return false;
    }

    function validateEvent(event) {
      if (!event || event.origin !== values.peerOrigin || event.source !== values.peerWindow) {
        return reject('origin-or-source-mismatch');
      }
      const code = validateCommonMessage(event.data, state.transferId, state.nonce);
      if (code) return reject(code);
      return true;
    }

    function hello() {
      if (![PHASES.IDLE, PHASES.HELLO, PHASES.FAILED, PHASES.REJECTED].includes(state.phase)) return false;
      state.phase = PHASES.HELLO;
      post(MESSAGE_TYPES.HELLO, { sourceMode: options.sourceMode || 'current-tab' }, PHASES.HELLO);
      emit('hello');
      return true;
    }

    function startHandshake({ intervalMs = 500, timeoutMs = 10000 } = {}) {
      if (handshakeTimer
        || ![PHASES.IDLE, PHASES.HELLO, PHASES.FAILED, PHASES.REJECTED].includes(state.phase)) return false;
      const startedAt = Date.now();
      if (!hello()) return false;
      handshakeTimer = setInterval(() => {
        if ([PHASES.READY, PHASES.PREVIEW, PHASES.APPLYING, PHASES.COMPLETE].includes(state.phase)
          || Date.now() - startedAt >= timeoutMs) {
          clearInterval(handshakeTimer);
          handshakeTimer = null;
          if (state.phase !== PHASES.READY && ![PHASES.PREVIEW, PHASES.APPLYING, PHASES.COMPLETE].includes(state.phase)) {
            state.phase = PHASES.FAILED;
            emit('timeout', { code: 'connection-timeout' });
          }
          return;
        }
        hello();
      }, Math.max(50, Number(intervalMs) || 500));
      return true;
    }

    function stopHandshake() {
      if (!handshakeTimer) return false;
      clearInterval(handshakeTimer);
      handshakeTimer = null;
      return true;
    }

    function sendPayload({ packageJson, packageDigest }) {
      if (![PHASES.READY, PHASES.PAYLOAD_SENT, PHASES.PAYLOAD_RECEIVED, PHASES.PREVIEW].includes(state.phase)) {
        return reject('invalid-stage');
      }
      if (!isValidDigest(packageDigest) || typeof packageJson !== 'string'
        || utf8ByteLength(packageJson) > MAX_PACKAGE_BYTES) {
        return reject('invalid-data');
      }
      if (state.packageDigest && (state.packageDigest !== packageDigest || state.packageJson !== packageJson)) {
        return reject('digest-mismatch');
      }
      state.packageDigest = packageDigest;
      state.packageJson = packageJson;
      state.phase = PHASES.PAYLOAD_SENT;
      post(MESSAGE_TYPES.PAYLOAD, { packageDigest, packageJson }, PHASES.PAYLOAD_SENT);
      emit('payload-sent', { packageDigest });
      return true;
    }

    function sendStatusQuery() {
      post(MESSAGE_TYPES.STATUS_QUERY, {
        ...(state.packageDigest ? { packageDigest: state.packageDigest } : {})
      });
      return true;
    }

    function handleMessage(event) {
      if (!validateEvent(event)) return false;
      const message = event.data;
      if (message.type === MESSAGE_TYPES.READY) {
        if (message.stage !== PHASES.READY) return reject('invalid-stage');
        if ([PHASES.HELLO, PHASES.READY].includes(state.phase)) {
          state.phase = PHASES.READY;
          stopHandshake();
          emit('ready');
          return true;
        }
        // Multiple HELLO messages may already be in flight when the first
        // READY stops the handshake timer. A late duplicate READY is valid
        // for this bound transfer and must not reject or rewind the payload.
        if ([PHASES.PAYLOAD_SENT, PHASES.PAYLOAD_RECEIVED, PHASES.PREVIEW,
          PHASES.APPLYING, PHASES.COMPLETE, PHASES.FAILED].includes(state.phase)) return true;
        return reject('invalid-stage');
      }
      if (message.type === MESSAGE_TYPES.PAYLOAD_ACK) {
        if (!isValidDigest(message.packageDigest) || message.packageDigest !== state.packageDigest) return reject('digest-mismatch');
        emit('payload-ack', { packageDigest: message.packageDigest });
        return true;
      }
      if (message.type === MESSAGE_TYPES.PREVIEW) {
        if (!isValidDigest(message.packageDigest) || message.packageDigest !== state.packageDigest
          || ![PHASES.PAYLOAD_SENT, PHASES.PREVIEW].includes(state.phase)) return reject('digest-or-stage-mismatch');
        state.phase = PHASES.PREVIEW;
        emit('preview', { summary: cloneSafeJson(message.summary || {}, 'preview summary') });
        return true;
      }
      if (message.type === MESSAGE_TYPES.APPLYING) {
        if (!isValidDigest(message.packageDigest) || message.packageDigest !== state.packageDigest
          || ![PHASES.PREVIEW, PHASES.APPLYING].includes(state.phase)) return reject('digest-or-stage-mismatch');
        const selection = cloneSafeJson(message.selection || {}, 'apply selection');
        if (state.selection && JSON.stringify(state.selection) !== JSON.stringify(selection)) return reject('selection-mismatch');
        state.selection = selection;
        state.internalTransactionId = message.transactionId || state.internalTransactionId;
        state.phase = PHASES.APPLYING;
        emit('applying', { selection, transactionId: state.internalTransactionId });
        return true;
      }
      if (message.type === MESSAGE_TYPES.RESULT) {
        if (!isValidDigest(message.packageDigest) || message.packageDigest !== state.packageDigest
          || ![PHASES.APPLYING, PHASES.COMPLETE, PHASES.FAILED].includes(state.phase)) return reject('digest-or-stage-mismatch');
        if (message.ok === true && message.committed !== true) return reject('uncommitted-success');
        if (message.ok === true) {
          const receipt = cloneSafeJson(message.receipt, 'receipt');
          if (receipt.transferId !== state.transferId || receipt.packageDigest !== state.packageDigest) return reject('receipt-mismatch');
          state.receipt = receipt;
          state.phase = PHASES.COMPLETE;
        } else {
          state.phase = PHASES.FAILED;
        }
        emit('result', cloneSafeJson(message, 'result'));
        return true;
      }
      if (message.type === MESSAGE_TYPES.STATUS_RESPONSE) {
        if (message.packageDigest && message.packageDigest !== state.packageDigest) return reject('digest-mismatch');
        emit('status', cloneSafeJson(message, 'status response'));
        return true;
      }
      if (message.type === MESSAGE_TYPES.REJECT) {
        state.lastRejectCode = String(message.code || 'rejected');
        const rejection = cloneSafeJson(message, 'reject response');
        // Once APPLYING has started, a communication rejection is not proof
        // that the restore did not commit. Keep the state indeterminate so a
        // later click cannot silently start a second application. COMPLETE
        // likewise remains terminal and must not be rewound.
        if (![PHASES.APPLYING, PHASES.COMPLETE].includes(state.phase)) {
          stopHandshake();
          state.phase = PHASES.REJECTED;
        }
        emit('reject', rejection);
        return true;
      }
      return reject('unexpected-message');
    }

    function getState() {
      return cloneSafeJson({ ...state }, 'sender state');
    }

    return Object.freeze({
      role: 'sender',
      hello,
      startHandshake,
      stopHandshake,
      sendPayload,
      sendStatusQuery,
      handleMessage,
      getState
    });
  }

  function createReceiver(options = {}) {
    if (!isValidOrigin(options.peerOrigin)) {
      const error = new Error('receiver peerOrigin must be an exact http(s) origin');
      error.code = 'invalid-data';
      throw error;
    }
    const peerWindow = requireWindow(options.peerWindow, 'peer');
    const initialTransferId = options.transferId || null;
    const initialNonce = options.nonce || null;
    if ((initialTransferId && !isValidTransferId(initialTransferId))
      || (initialNonce && !isValidNonce(initialNonce))) {
      const error = new Error('receiver transfer identifiers are invalid');
      error.code = 'invalid-data';
      throw error;
    }
    const values = {
      peerWindow,
      peerOrigin: options.peerOrigin,
      transferId: initialTransferId,
      nonce: initialNonce
    };
    const state = createBaseState({
      peerOrigin: values.peerOrigin,
      transferId: values.transferId || 'transfer-placeholder-00000000000000000000000000000000',
      nonce: values.nonce || '00000000000000000000000000000000'
    }, 'receiver');
    const listeners = options.listeners || {};

    function emit(name, value) {
      if (typeof listeners[name] === 'function') listeners[name](value, getState());
    }

    function post(type, fields = {}, stage = state.phase) {
      if (!values.transferId || !values.nonce) return false;
      const message = {
        protocol: PROTOCOL,
        type,
        stage,
        transferId: values.transferId,
        nonce: values.nonce,
        ...fields
      };
      peerWindow.postMessage(message, values.peerOrigin);
      return message;
    }

    function reject(code, details = {}) {
      state.lastRejectCode = code;
      if (values.transferId && values.nonce) {
        post(MESSAGE_TYPES.REJECT, { code, ...details }, PHASES.REJECTED);
      }
      emit('reject', { code, ...details });
      return false;
    }

    function validatePeer(event) {
      if (!event || event.origin !== values.peerOrigin || event.source !== values.peerWindow) {
        return reject('origin-or-source-mismatch');
      }
      return true;
    }

    function bindHandshake(message) {
      if (!isValidTransferId(message.transferId) || !isValidNonce(message.nonce)) return reject('invalid-handshake');
      if (values.transferId || values.nonce) {
        if (values.transferId !== message.transferId || values.nonce !== message.nonce) return reject('handshake-mismatch');
      } else {
        values.transferId = message.transferId;
        values.nonce = message.nonce;
        state.transferId = message.transferId;
        state.nonce = message.nonce;
      }
      return true;
    }

    function sendPreview(summary) {
      if (![PHASES.PAYLOAD_RECEIVED, PHASES.PREVIEW].includes(state.phase) || !state.packageDigest) return reject('invalid-stage');
      const safeSummary = cloneSafeJson(summary || {}, 'preview summary');
      state.phase = PHASES.PREVIEW;
      post(MESSAGE_TYPES.PREVIEW, { packageDigest: state.packageDigest, summary: safeSummary }, PHASES.PREVIEW);
      emit('preview-sent', { summary: safeSummary });
      return true;
    }

    function sendApplying({ selection = {}, transactionId } = {}) {
      if (![PHASES.PREVIEW, PHASES.APPLYING].includes(state.phase) || !state.packageDigest) return reject('invalid-stage');
      const safeSelection = cloneSafeJson(selection, 'apply selection');
      const safeTransactionId = String(transactionId || state.internalTransactionId || '');
      if (!isNonEmptyString(safeTransactionId, 256)) return reject('invalid-data');
      if (state.selection && JSON.stringify(state.selection) !== JSON.stringify(safeSelection)) return reject('selection-mismatch');
      if (state.internalTransactionId && state.internalTransactionId !== safeTransactionId) return reject('transaction-mismatch');
      state.selection = safeSelection;
      state.internalTransactionId = safeTransactionId;
      state.phase = PHASES.APPLYING;
      post(MESSAGE_TYPES.APPLYING, {
        packageDigest: state.packageDigest,
        selection: safeSelection,
        transactionId: safeTransactionId
      }, PHASES.APPLYING);
      emit('applying-sent', { selection: safeSelection, transactionId: safeTransactionId });
      return true;
    }

    function sendResult({ ok, committed = false, transactionId, epoch, errorCode, errorMessage } = {}) {
      if (state.phase === PHASES.COMPLETE && state.receipt && ok === true) {
        post(MESSAGE_TYPES.RESULT, {
          packageDigest: state.packageDigest,
          ok: true,
          committed: true,
          receipt: cloneSafeJson(state.receipt, 'receipt')
        }, PHASES.COMPLETE);
        return true;
      }
      if (state.phase !== PHASES.APPLYING || !state.packageDigest) return reject('invalid-stage');
      if (ok === true) {
        if (committed !== true) return reject('uncommitted-success');
        const safeTransactionId = String(transactionId || state.internalTransactionId || '');
        const safeEpoch = String(epoch || '');
        if (!isNonEmptyString(safeTransactionId, 256) || !isNonEmptyString(safeEpoch, 256)) return reject('invalid-data');
        if (state.internalTransactionId && state.internalTransactionId !== safeTransactionId) return reject('transaction-mismatch');
        const receipt = cloneSafeJson({
          transferId: state.transferId,
          packageDigest: state.packageDigest,
          selection: state.selection || {},
          transactionId: safeTransactionId,
          epoch: safeEpoch,
          status: 'complete'
        }, 'receipt');
        state.internalTransactionId = safeTransactionId;
        state.epoch = safeEpoch;
        state.receipt = receipt;
        state.phase = PHASES.COMPLETE;
        post(MESSAGE_TYPES.RESULT, {
          packageDigest: state.packageDigest,
          ok: true,
          committed: true,
          receipt
        }, PHASES.COMPLETE);
        emit('result-sent', { ok: true, receipt });
        return true;
      }
      state.phase = PHASES.FAILED;
      post(MESSAGE_TYPES.RESULT, {
        packageDigest: state.packageDigest,
        ok: false,
        committed: false,
        ...(errorCode ? { errorCode: String(errorCode) } : {}),
        ...(errorMessage ? { errorMessage: String(errorMessage).slice(0, 512) } : {})
      }, PHASES.FAILED);
      emit('result-sent', { ok: false, errorCode });
      return true;
    }

    function sendReject(code = 'rejected', details = {}) {
      if (![PHASES.READY, PHASES.PAYLOAD_RECEIVED, PHASES.PREVIEW].includes(state.phase)) return false;
      state.phase = PHASES.REJECTED;
      return reject(String(code || 'rejected'), details);
    }

    function sendStatusResponse() {
      post(MESSAGE_TYPES.STATUS_RESPONSE, {
        ...(state.packageDigest ? { packageDigest: state.packageDigest } : {}),
        phase: state.phase,
        ...(state.receipt ? { receipt: cloneSafeJson(state.receipt, 'receipt') } : {})
      }, state.phase);
      return true;
    }

    function handleMessage(event) {
      if (!validatePeer(event)) return false;
      const message = event.data;
      if (message.type === MESSAGE_TYPES.HELLO) {
        if (message.stage !== PHASES.HELLO || !bindHandshake(message)) return false;
        if (state.phase === PHASES.COMPLETE && state.packageDigest) {
          post(MESSAGE_TYPES.READY, {}, PHASES.READY);
          sendStatusResponse();
          return true;
        }
        state.phase = PHASES.READY;
        post(MESSAGE_TYPES.READY, {}, PHASES.READY);
        emit('ready');
        return true;
      }
      if (!values.transferId || !values.nonce) return reject('handshake-required');
      const commonCode = validateCommonMessage(message, values.transferId, values.nonce);
      if (commonCode) return reject(commonCode);
      if (message.type === MESSAGE_TYPES.PAYLOAD) {
        if (!isValidDigest(message.packageDigest) || typeof message.packageJson !== 'string'
          || utf8ByteLength(message.packageJson) > MAX_PACKAGE_BYTES) return reject('invalid-data');
        if (state.packageDigest) {
          if (state.packageDigest !== message.packageDigest || state.packageJson !== message.packageJson) return reject('digest-mismatch');
          post(MESSAGE_TYPES.PAYLOAD_ACK, { packageDigest: state.packageDigest }, state.phase);
          if (state.phase === PHASES.COMPLETE && state.receipt) {
            post(MESSAGE_TYPES.RESULT, {
              packageDigest: state.packageDigest,
              ok: true,
              committed: true,
              receipt: cloneSafeJson(state.receipt, 'receipt')
            }, PHASES.COMPLETE);
          }
          return true;
        }
        if (![PHASES.READY, PHASES.PAYLOAD_RECEIVED].includes(state.phase)) return reject('invalid-stage');
        state.packageDigest = message.packageDigest;
        state.packageJson = message.packageJson;
        state.phase = PHASES.PAYLOAD_RECEIVED;
        post(MESSAGE_TYPES.PAYLOAD_ACK, { packageDigest: state.packageDigest }, PHASES.PAYLOAD_RECEIVED);
        emit('payload', { packageDigest: state.packageDigest, packageJson: state.packageJson });
        return true;
      }
      if (message.type === MESSAGE_TYPES.STATUS_QUERY) {
        if (message.packageDigest && message.packageDigest !== state.packageDigest) return reject('digest-mismatch');
        sendStatusResponse();
        return true;
      }
      return reject('unexpected-message');
    }

    function getState() {
      return cloneSafeJson({ ...state }, 'receiver state');
    }

    function getPackageJson() {
      return state.packageJson;
    }

    return Object.freeze({
      role: 'receiver',
      sendPreview,
      sendApplying,
      sendResult,
      sendReject,
      sendStatusResponse,
      handleMessage,
      getState,
      getPackageJson
    });
  }

  return Object.freeze({
    protocol: PROTOCOL,
    maxPackageBytes: MAX_PACKAGE_BYTES,
    defaultSourceOrigin: DEFAULT_SOURCE_ORIGIN,
    defaultTargetOrigin: DEFAULT_TARGET_ORIGIN,
    messageTypes: MESSAGE_TYPES,
    phases: PHASES,
    createNonce,
    createTransferId,
    getConfiguredPeerOrigin,
    isLocalTestTransferEnabled,
    createSender,
    createReceiver
  });
});
