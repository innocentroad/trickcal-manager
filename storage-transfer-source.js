                                                                                    
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_STORAGE_TRANSFER_SOURCE = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  function createController({ window: win, document: doc, runtime, backup, transferApi }) {
    const el = id => doc.getElementById(id);
    let busy = false, sender = null, messageHandler = null, closeTimer = null;
    let resolveReady = null;
    const status = (text, error = false) => {
      el('transfer-status').textContent = text;
      el('transfer-status').dataset.kind = error ? 'error' : 'normal';
    };
    function sync() {
      el('source-send').disabled = busy || !!sender;
      el('source-export').disabled = busy;
      el('source-rescue').disabled = busy;
    }
    function detach() {
      sender?.stopHandshake();
      if (messageHandler) win.removeEventListener('message', messageHandler);
      if (closeTimer !== null) win.clearInterval(closeTimer);
      messageHandler = null; closeTimer = null; sender = null;
      resolveReady?.(false); resolveReady = null;
      sync();
    }
    function download(value, prefix) {
      const blob = new win.Blob([JSON.stringify(value)], { type: 'application/json' });
      const url = win.URL.createObjectURL(blob), link = doc.createElement('a');
      link.href = url; link.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.json`;
      doc.body.appendChild(link); link.click(); link.remove(); win.URL.revokeObjectURL(url);
    }
    async function readPackage() {
      let maintenance;
      try {
        const begun = await runtime.beginMaintenance('backup');
        if (!begun?.ok) throw new Error(begun?.code || 'not-ready');
        maintenance = begun.value;
        const result = await maintenance.export({ sourceMode: 'stored-only', sourceRelease: backup.getDefaultSourceRelease?.() });
        if (!result?.ok) throw new Error(result?.code || 'invalid-data');
        return result.value;
      } finally {
        if (maintenance) {
          const ended = await maintenance.cancel();
          if (!ended?.ok) throw new Error(ended?.code || 'release-failed');
        }
      }
    }
    function failure(error) {
      const reason = String(error?.message || 'unknown');
      status(`保存データを取得できませんでした（${reason}）。「読み取り可能なデータを救出」または復旧ページを利用してください。`, true);
    }
    async function exportBackup(rescue = false) {
      if (busy) return false;
      busy = true; sync();
      try {
        let value;
        if (rescue) {
          const result = await runtime.exportRescueDirect({ sourceRelease: backup.getDefaultSourceRelease?.() });
          if (!result?.ok) throw new Error(result?.code || 'read-failed');
          value = result.value;
        } else value = await readPackage();
        download(value, rescue ? 'trickcal-manager-rescue' : 'trickcal-manager-backup');
        status(rescue ? '救出ファイルを保存しました。通常の復元には使えません。調査・復旧用として保管してください。' : 'バックアップを保存しました。新サイトの移行ページで選んでください。');
        return true;
      } catch (error) { failure(error); return false; }
      finally { busy = false; sync(); }
    }
    async function send() {
      if (busy || sender) return false;
      const targetOrigin = transferApi.getConfiguredPeerOrigin('target');
      const sourceOrigin = transferApi.getConfiguredPeerOrigin('source');
      if (win.location.origin !== sourceOrigin) { status('このページからは直接転送できません。バックアップ保存を利用してください。', true); return false; }
      const target = new win.URL(win.TRICKCAL_PUBLIC_SITE?.peerPageUrl?.('transfer', targetOrigin) || '/transfer/', targetOrigin);
      if (target.origin !== targetOrigin) { status('転送先を確認できません。', true); return false; }
      const peer = win.open(target.href, '_blank');
      if (!peer) { status('新しいタブを開けませんでした。バックアップ保存を利用してください。', true); return false; }
      busy = true;
      const ready = new Promise(resolve => { resolveReady = resolve; });
      try {
        sender = transferApi.createSender({ peerWindow: peer, peerOrigin: targetOrigin, sourceMode: 'stored-only', listeners: {
          ready() { resolveReady?.(true); resolveReady = null; },
          timeout() { status('接続を確認できませんでした。バックアップ保存を利用してください。', true); detach(); },
          preview() { status('新サイトに内容を送りました。新しいタブで内容を確認してください。'); },
          applying() { status('新サイトで復元しています。完了まで新しいタブを閉じないでください。'); },
          result(result) { status(result?.ok ? '新サイトへの移行が完了しました。旧サイトの保存データも残っています。' : '新サイトでの復元が完了しませんでした。新しいタブの表示を確認してください。', !result?.ok); detach(); },
          reject(_, state) { if (state.phase === transferApi.phases.REJECTED) { status('新サイトで転送を取り消しました。旧サイトの保存データは残っています。'); detach(); } }
        } });
        const active = sender;
        messageHandler = event => active.handleMessage(event);
        win.addEventListener('message', messageHandler);
        closeTimer = win.setInterval(() => {
          if (!peer.closed) return;
          const applying = sender?.getState().phase === transferApi.phases.APPLYING;
          status(applying ? '新しいタブが閉じられたため完了を確認できません。新サイトの保存内容を確認してください。' : '転送先タブが閉じられました。必要ならバックアップ保存を利用してください。', applying);
          detach();
        }, 1000);
        sync(); status('新サイトへの接続を準備しています…');
        if (!sender.startHandshake({ timeoutMs: 10000 })) throw new Error('connection-failed');
        const value = await readPackage();
        if (!await ready || sender !== active) return false;
        if (!active.sendPayload({ packageJson: JSON.stringify(value), packageDigest: value.sha256 })) throw new Error('send-failed');
        status('新サイトへ送信しました。新しいタブで内容を確認して移行してください。');
        return true;
      } catch (error) { failure(error); detach(); return false; }
      finally { busy = false; sync(); }
    }
    function initialize() {
      el('transfer-receiver').hidden = true;
      el('transfer-source').hidden = false;
      el('transfer-title').textContent = '旧サイトの保存データを移行';
      el('transfer-destination-note').textContent = '保存済みのデータを新サイトへ移せます。旧サイトのデータは削除しません。';
      el('transfer-common-note').textContent = '開いたままの旧画面に未保存の編集がある場合は、先にその画面で保存してください。';
      el('source-send').addEventListener('click', () => void send());
      el('source-export').addEventListener('click', () => void exportBackup());
      el('source-rescue').addEventListener('click', () => void exportBackup(true));
      el('source-recovery').href = win.TRICKCAL_PUBLIC_SITE?.pageUrl?.('recovery') || '/trickcal-manager/storage-recovery.html';
      el('source-target').href = win.TRICKCAL_PUBLIC_SITE?.peerPageUrl?.('transfer', transferApi.defaultTargetOrigin) || `${transferApi.defaultTargetOrigin}/transfer/`;
      win.addEventListener('pagehide', detach);
      status('新サイトへ転送するか、バックアップファイルを保存してください。');
      sync();
    }
    return Object.freeze({ initialize, send, exportBackup, dispose: detach, getState: () => ({ busy, phase: sender?.getState().phase || null }) });
  }
  return Object.freeze({ createController });
});
