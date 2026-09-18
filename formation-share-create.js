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
  const imagePreview = document.getElementById('formation-share-image-preview');
  const imageState = document.getElementById('formation-share-image-state');
  const imageShareButton = document.getElementById('formation-share-image-share');
  const imageCopyButton = document.getElementById('formation-share-image-copy');
  const imageSaveButton = document.getElementById('formation-share-image-save');
  const codec = window.TRICKCAL_FORMATION_SHARE_CODEC;
  const imageApi = window.TRICKCAL_FORMATION_SHARE_IMAGE;
  const imageController = imageApi?.createController?.();
  // 生成工程の依存版入力として保持する。公開共有URLへv queryは付けない。
  const SHARE_PAGE_CACHE_VERSION = '04aa43ae3c38397f';
  const SHARE_PREVIEW_CACHE_VERSION = '20260912b';

  if (!dialog || !openButton || !codec) return;

  let currentUrl = '';
  let currentImageBlob = null;
  let currentImageObjectUrl = '';
  let imageRequestId = 0;

  function setStatus(message, isError = false) {
    status.textContent = message || '';
    status.classList.toggle('is-error', isError);
  }

  function setImageState(message, isError = false) {
    if (!imageState) return;
    imageState.textContent = message || '';
    imageState.classList.toggle('is-error', isError);
  }

  function revokeImageObjectUrl() {
    if (currentImageObjectUrl) URL.revokeObjectURL(currentImageObjectUrl);
    currentImageObjectUrl = '';
  }

  function resetImageState(message = '共有画像を準備しています。') {
    imageRequestId += 1;
    imageController?.cancel();
    currentImageBlob = null;
    revokeImageObjectUrl();
    if (imagePreview) {
      imagePreview.hidden = true;
      imagePreview.removeAttribute('src');
    }
    if (preview) preview.hidden = false;
    [imageShareButton, imageCopyButton, imageSaveButton].forEach(button => {
      if (button) button.disabled = true;
    });
    setImageState(message);
  }

  function getSharePreviewTheme() {
    try {
      const theme = preview?.contentDocument?.documentElement?.dataset?.theme;
      if (theme === 'light' || theme === 'dark') return theme;
    } catch {}
    return getDashboardTheme();
  }

  function getDashboardTheme() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function syncSharePreviewTheme(theme = getDashboardTheme()) {
    try {
      const frameRoot = preview?.contentDocument?.documentElement;
      if (!frameRoot) return false;
      if (frameRoot.dataset.theme !== theme) frameRoot.dataset.theme = theme;
      return true;
    } catch {
      return false;
    }
  }

  function isLocalFileUrl(url) {
    try {
      return new URL(url, document.baseURI).protocol === 'file:';
    } catch {
      return false;
    }
  }

  async function prepareShareImage(url, theme = getSharePreviewTheme()) {
    resetImageState();
    const requestId = imageRequestId;
    if (!imageController) {
      setImageState('共有画像の機能を読み込めませんでした。URLをコピーしてください。', true);
      return;
    }
    if (isLocalFileUrl(url)) {
      setImageState(
        'ローカルファイル（file://）では共有画像を作成できません。HTTPでページを開いてください（例: py -m http.server 8765）。',
        true
      );
      setStatus('共有URLは作成しましたが、ローカルファイルでは画像を生成できません。', true);
      return;
    }
    setImageState('共有画像を作成しています。');
    try {
      const result = await imageController.render(buildPreviewUrl(url), { theme });
      if (requestId !== imageRequestId || url !== currentUrl) return;
      currentImageBlob = result.blob;
      currentImageObjectUrl = URL.createObjectURL(currentImageBlob);
      if (imagePreview) {
        imagePreview.src = currentImageObjectUrl;
        imagePreview.hidden = false;
      }
      if (preview) preview.hidden = true;
      if (imageShareButton) imageShareButton.disabled = false;
      if (imageCopyButton) imageCopyButton.disabled = false;
      if (imageSaveButton) imageSaveButton.disabled = false;
      setImageState(`共有画像を作成しました（${result.width}×${result.height}px）。`);
      setStatus('共有URLと画像を準備しました。');
    } catch (error) {
      if (requestId !== imageRequestId || error?.code === 'stale-generation') return;
      setImageState(error?.message || '共有画像を作成できませんでした。', true);
      setStatus('共有URLは利用できます。画像の作成に失敗しました。', true);
    }
  }

  function buildShareUrl() {
    const engine = window.TRICKCAL_STAT_ENGINE;
    if (!engine || typeof engine.getFormationShareSnapshot !== 'function') {
      throw new Error('編成共有の取得元が準備できていません');
    }
    const snapshot = engine.getFormationShareSnapshot({
      includeGlobalPercent: !!globalToggle.checked
    });
    const baseUrl = new URL(
      window.TRICKCAL_PUBLIC_SITE?.pageUrl?.('share') || 'formation-share.html',
      window.location.href
    );
    const shareUrl = new URL(codec.createUrl(snapshot, { baseUrl: baseUrl.toString() }));
    return shareUrl.toString();
  }

  function buildPreviewUrl(url) {
    const previewUrl = new URL(url);
    previewUrl.searchParams.set('_sharePreview', SHARE_PREVIEW_CACHE_VERSION);
    return previewUrl.toString();
  }

  function updateShare() {
    try {
      const url = buildShareUrl();
      currentUrl = url;
      urlInput.value = url;
      lengthLabel.textContent = url.length + '文字';
      preview.src = buildPreviewUrl(url);
      setStatus('共有時点の編成をプレビューしています。');
      void prepareShareImage(url);
    } catch (error) {
      currentUrl = '';
      resetImageState();
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

  async function copyImage() {
    if (!currentImageBlob) {
      setStatus('先に共有画像を作成してください。', true);
      return;
    }
    try {
      if (!navigator.clipboard?.write || !window.ClipboardItem) throw new Error('Clipboard image API unavailable');
      await navigator.clipboard.write([
        new ClipboardItem({ [currentImageBlob.type || 'image/png']: currentImageBlob })
      ]);
      setStatus('共有画像をコピーしました。');
    } catch {
      setStatus('画像をコピーできませんでした。画像を保存して貼り付けてください。', true);
    }
  }

  function saveImage() {
    if (!currentImageBlob || !currentImageObjectUrl) {
      setStatus('先に共有画像を作成してください。', true);
      return;
    }
    const link = document.createElement('a');
    link.href = currentImageObjectUrl;
    link.download = 'trickcal-formation.png';
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    setStatus('共有画像の保存を開始しました。');
  }

  async function shareImageAndUrl() {
    if (!currentImageBlob || !currentUrl) {
      setStatus('先に共有画像を作成してください。', true);
      return;
    }
    if (typeof navigator.share !== 'function') {
      setStatus('この端末は画像＋URL共有に対応していません。画像保存とURLコピーを利用してください。', true);
      return;
    }
    const file = new File([currentImageBlob], 'trickcal-formation.png', { type: currentImageBlob.type || 'image/png' });
    try {
      const shareData = { title: '編成共有', url: currentUrl, files: [file] };
      if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
        throw new Error('Web Share file API unavailable');
      }
      await navigator.share(shareData);
      setStatus('共有メニューを開きました。送信先を選択してください。');
    } catch (error) {
      if (error?.name === 'AbortError') {
        setStatus('共有をキャンセルしました。');
        return;
      }
      setStatus('画像＋URL共有を開始できませんでした。画像保存とURLコピーを利用してください。', true);
    }
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
  }

  openButton.addEventListener('click', () => {
    if (!dialog.open) dialog.showModal();
    syncSharePreviewTheme(getDashboardTheme());
    updateShare();
  });
  closeButton?.addEventListener('click', closeDialog);
  closeBottomButton?.addEventListener('click', closeDialog);
  updateButton?.addEventListener('click', updateShare);
  globalToggle?.addEventListener('change', updateShare);
  copyButton?.addEventListener('click', copyUrl);
  imageCopyButton?.addEventListener('click', copyImage);
  imageSaveButton?.addEventListener('click', saveImage);
  imageShareButton?.addEventListener('click', shareImageAndUrl);
  preview?.addEventListener('load', () => {
    if (!dialog.open || !currentUrl) return;
    try {
      const frameDocument = preview.contentDocument;
      const frameRoot = frameDocument?.documentElement;
      if (!frameRoot || frameRoot.dataset.shareImageThemeObserved) return;
      const dashboardTheme = getDashboardTheme();
      if (frameRoot.dataset.theme !== dashboardTheme) frameRoot.dataset.theme = dashboardTheme;
      frameRoot.dataset.shareImageThemeObserved = 'true';
      new MutationObserver(records => {
        if (records.some(record => record.attributeName === 'data-theme')) void prepareShareImage(currentUrl);
      }).observe(frameRoot, { attributes: true, attributeFilter: ['data-theme'] });
    } catch {}
  });
  const themeObserver = new MutationObserver(records => {
    if (!dialog.open || !records.some(record => record.attributeName === 'data-theme')) return;
    if (!currentUrl) return;
    try {
      const frameRoot = preview?.contentDocument?.documentElement;
      const dashboardTheme = getDashboardTheme();
      if (frameRoot && frameRoot.dataset.theme !== dashboardTheme) {
        frameRoot.dataset.theme = dashboardTheme;
        return;
      }
    } catch {}
    void prepareShareImage(currentUrl);
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('close', () => resetImageState('共有画像を閉じました。'));
})();
