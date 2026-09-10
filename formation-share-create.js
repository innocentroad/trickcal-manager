(() => {
  'use strict';

  const dialog = document.getElementById('formation-share-dialog');
  const openButton = document.getElementById('formation-share-open');
  const closeButton = document.getElementById('formation-share-close');
  const closeBottomButton = document.getElementById('formation-share-close-bottom');
  const updateButton = document.getElementById('formation-share-update');
  const copyButton = document.getElementById('formation-share-copy');
  const globalToggle = document.getElementById('formation-share-global-percent');
  const preview = document.getElementById('formation-share-preview');
  const urlInput = document.getElementById('formation-share-url');
  const lengthLabel = document.getElementById('formation-share-url-length');
  const status = document.getElementById('formation-share-status');
  const codec = window.TRICKCAL_FORMATION_SHARE_CODEC;

  if (!dialog || !openButton || !codec) return;

  function setStatus(message, isError = false) {
    status.textContent = message || '';
    status.classList.toggle('is-error', isError);
  }

  function buildShareUrl() {
    const engine = window.TRICKCAL_STAT_ENGINE;
    if (!engine || typeof engine.getFormationShareSnapshot !== 'function') {
      throw new Error('編成共有の取得元が準備できていません');
    }
    const snapshot = engine.getFormationShareSnapshot({
      includeGlobalPercent: !!globalToggle.checked
    });
    const baseUrl = new URL('formation-share.html', window.location.href).toString();
    return codec.createUrl(snapshot, { baseUrl });
  }

  function updateShare() {
    try {
      const url = buildShareUrl();
      urlInput.value = url;
      lengthLabel.textContent = url.length + '文字';
      preview.src = url;
      setStatus('共有時点の編成をプレビューしています。');
    } catch (error) {
      urlInput.value = '';
      lengthLabel.textContent = '';
      preview.removeAttribute('src');
      setStatus(error?.message || '共有URLを作成できませんでした。', true);
    }
  }

  async function copyUrl() {
    const url = urlInput.value;
    if (!url) {
      setStatus('先に共有URLを作成してください。', true);
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(url);
      setStatus('共有URLをコピーしました。');
    } catch {
      urlInput.focus();
      urlInput.select();
      setStatus('自動コピーできませんでした。選択されたURLを手動でコピーしてください。', true);
    }
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
  }

  openButton.addEventListener('click', () => {
    if (!dialog.open) dialog.showModal();
    updateShare();
  });
  closeButton?.addEventListener('click', closeDialog);
  closeBottomButton?.addEventListener('click', closeDialog);
  updateButton?.addEventListener('click', updateShare);
  globalToggle?.addEventListener('change', updateShare);
  copyButton?.addEventListener('click', copyUrl);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
})();
