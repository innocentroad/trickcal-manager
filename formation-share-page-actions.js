(() => {
  'use strict';

  const bar = document.getElementById('share-action-bar');
  const content = document.getElementById('share-content');
  const state = document.getElementById('share-image-state');
  const generateButton = document.getElementById('share-image-generate');
  const copyButton = document.getElementById('share-image-copy');
  const saveButton = document.getElementById('share-image-save');
  const urlButton = document.getElementById('share-url-copy');
  const imageApi = window.TRICKCAL_FORMATION_SHARE_IMAGE;

  if (!bar || !content || !generateButton || !copyButton || !saveButton || !urlButton) return;

  let imageController = null;
  let currentImageBlob = null;
  let currentImageObjectUrl = '';
  let requestId = 0;

  function setState(message, isError = false) {
    state.textContent = message || '';
    state.classList.toggle('is-error', isError);
  }

  function revokeImageObjectUrl() {
    if (currentImageObjectUrl) URL.revokeObjectURL(currentImageObjectUrl);
    currentImageObjectUrl = '';
  }

  function resetImage(message = '画像は未生成です。') {
    requestId += 1;
    imageController?.cancel();
    currentImageBlob = null;
    revokeImageObjectUrl();
    generateButton.disabled = false;
    copyButton.disabled = true;
    saveButton.disabled = true;
    setState(message);
  }

  function getPublicShareUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('_sharePreview');
    return url.toString();
  }

  function getCurrentTheme() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function updateBarVisibility() {
    bar.hidden = content.hidden;
  }

  async function generateImage() {
    resetImage('共有画像を作成しています。');
    const currentRequestId = requestId;
    if (!imageApi?.createController) {
      setState('共有画像の機能を読み込めませんでした。', true);
      return;
    }
    if (!window.location.hash) {
      setState('共有URLがないため画像を作成できません。', true);
      return;
    }
    imageController ||= imageApi.createController();
    generateButton.disabled = true;
    try {
      const result = await imageController.render(getPublicShareUrl(), { theme: getCurrentTheme() });
      if (currentRequestId !== requestId) return;
      currentImageBlob = result.blob;
      currentImageObjectUrl = URL.createObjectURL(currentImageBlob);
      copyButton.disabled = false;
      saveButton.disabled = false;
      setState(`共有画像を作成しました（${result.width}×${result.height}px）。`);
    } catch (error) {
      if (currentRequestId !== requestId || error?.code === 'stale-generation') return;
      setState(error?.message || '共有画像を作成できませんでした。', true);
    } finally {
      if (currentRequestId === requestId) generateButton.disabled = false;
    }
  }

  async function copyImage() {
    if (!currentImageBlob) {
      setState('先に画像を生成してください。', true);
      return;
    }
    try {
      if (!navigator.clipboard?.write || !window.ClipboardItem) throw new Error('Clipboard image API unavailable');
      await navigator.clipboard.write([
        new ClipboardItem({ [currentImageBlob.type || 'image/png']: currentImageBlob })
      ]);
      setState('共有画像をコピーしました。');
    } catch {
      setState('画像をコピーできませんでした。画像を保存して貼り付けてください。', true);
    }
  }

  function saveImage() {
    if (!currentImageBlob || !currentImageObjectUrl) {
      setState('先に画像を生成してください。', true);
      return;
    }
    const link = document.createElement('a');
    link.href = currentImageObjectUrl;
    link.download = 'trickcal-formation.png';
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    setState('共有画像の保存を開始しました。');
  }

  async function copyUrl() {
    try {
      const url = getPublicShareUrl();
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard text API unavailable');
      await navigator.clipboard.writeText(url);
      setState('共有URLをコピーしました。');
    } catch {
      setState('URLをコピーできませんでした。ブラウザのURL欄からコピーしてください。', true);
    }
  }

  generateButton.addEventListener('click', generateImage);
  copyButton.addEventListener('click', copyImage);
  saveButton.addEventListener('click', saveImage);
  urlButton.addEventListener('click', copyUrl);
  window.addEventListener('hashchange', () => {
    resetImage('編成が変わりました。画像を再生成してください。');
    updateBarVisibility();
  });
  const themeObserver = new MutationObserver(records => {
    if (!records.some(record => record.attributeName === 'data-theme')) return;
    if (currentImageBlob || generateButton.disabled) {
      resetImage('テーマが変わりました。画像を再生成してください。');
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  updateBarVisibility();
})();
