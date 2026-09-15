(() => {
  'use strict';

  const TARGET_WIDTH = 1200;
  const DEFAULT_TIMEOUT_MS = 12000;
  const DEFAULT_MAX_HEIGHT = 12000;
  const DEFAULT_MAX_AREA = 24 * 1000 * 1000;
  const DEFAULT_MAX_PNG_BYTES = 12 * 1000 * 1000;
  const DEFAULT_MAX_SVG_BYTES = 24 * 1000 * 1000;
  const FRAME_EXTRA_WIDTH = 32;

  class FormationShareImageError extends Error {
    constructor(message, code = 'image-generation-failed') {
      super(message);
      this.name = 'FormationShareImageError';
      this.code = code;
    }
  }

  class StaleFormationShareImageError extends FormationShareImageError {
    constructor() {
      super('古い共有画像の生成結果を破棄しました。', 'stale-generation');
      this.name = 'StaleFormationShareImageError';
    }
  }

  function withTimeout(promise, timeoutMs, message) {
    let timer = 0;
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(new FormationShareImageError(message, 'timeout')), timeoutMs);
    });
    return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
  }

  function nextFrame() {
    return new Promise(resolve => window.requestAnimationFrame(() => resolve()));
  }

  function getAbsoluteUrl(value, baseUrl) {
    try {
      return new URL(value, baseUrl).href;
    } catch {
      return value;
    }
  }

  function getUrlProtocol(value) {
    try {
      return new URL(value, document.baseURI).protocol;
    } catch {
      return '';
    }
  }

  function buildRenderUrl(value, generation) {
    try {
      const renderUrl = new URL(value, document.baseURI);
      renderUrl.searchParams.set('_shareImageGeneration', String(generation));
      return renderUrl.toString();
    } catch {
      return value;
    }
  }

  function assertSupportedShareImageUrl(url) {
    if (getUrlProtocol(url) !== 'file:') return;
    throw new FormationShareImageError(
      'ローカルファイル（file://）では共有画像を作成できません。HTTPでページを開いてください（例: py -m http.server 8765）。',
      'file-url-unsupported'
    );
  }

  function rewriteCssUrls(cssText, baseUrl) {
    return cssText.replace(/url\(\s*(['"]?)([^'"\)]+)\1\s*\)/gi, (match, quote, value) => {
      const trimmed = String(value).trim();
      if (/^(?:data|https?|blob):/i.test(trimmed) || trimmed.startsWith('#')) return match;
      return `url(${quote}${getAbsoluteUrl(trimmed, baseUrl)}${quote})`;
    });
  }

  function getStylesheetText(sourceDocument) {
    const chunks = [];
    for (const sheet of Array.from(sourceDocument.styleSheets || [])) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        chunks.push(rules.map(rule => rule.cssText).join('\n'));
      } catch {
        // The shared page is same-origin in production. A stylesheet that cannot
        // be inspected must not make a valid share image silently appear blank.
      }
    }
    return rewriteCssUrls(chunks.join('\n'), sourceDocument.baseURI);
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), { once: true });
      reader.addEventListener('error', () => reject(reader.error || new Error('画像を読み込めませんでした。')), { once: true });
      reader.readAsDataURL(blob);
    });
  }

  async function resourceToDataUrl(url) {
    const response = await fetch(url, { credentials: 'same-origin', cache: 'force-cache' });
    if (!response.ok) throw new Error(`画像の読み込みに失敗しました（${response.status}）。`);
    return blobToDataUrl(await response.blob());
  }

  async function cloneContentHtml(sourceDocument, content) {
    const clone = content.cloneNode(true);
    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(images.map(async image => {
      const source = image.getAttribute('src');
      if (!source) return;
      const absoluteUrl = getAbsoluteUrl(source, sourceDocument.baseURI);
      try {
        image.setAttribute('src', await resourceToDataUrl(absoluteUrl));
      } catch {
        image.hidden = true;
        const fallback = image.parentElement?.querySelector(
          '.portrait-missing, .card-missing, .power-fallback'
        );
        if (fallback) fallback.hidden = false;
      }
      image.removeAttribute('loading');
      image.setAttribute('decoding', 'sync');
    }));
    return clone.outerHTML.replace(
      /<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(\s[^>]*?)?>/gi,
      (match, tag, attributes = '') => `<${tag}${attributes.replace(/\s*\/\s*$/, '')} />`
    );
  }

  function getTheme(sourceDocument) {
    return sourceDocument.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function getBackgroundColor(sourceDocument) {
    const value = sourceDocument.defaultView?.getComputedStyle(sourceDocument.body).backgroundColor;
    return value && value !== 'rgba(0, 0, 0, 0)' ? value : (getTheme(sourceDocument) === 'light' ? '#edf2f7' : '#11151e');
  }

  async function waitForDocumentReady(frameDocument, content, timeoutMs) {
    const images = Array.from(content.querySelectorAll('img'));
    const imageReady = images.map(image => {
      if (image.complete) return image.decode?.().catch(() => undefined) || Promise.resolve();
      return new Promise(resolve => {
        const finish = () => {
          image.decode?.().catch(() => undefined).finally(resolve) || resolve();
        };
        image.addEventListener('load', finish, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    });
    const fontsReady = frameDocument.fonts?.ready || Promise.resolve();
    await withTimeout(Promise.all([fontsReady, ...imageReady]), timeoutMs, '共有画像の描画準備が時間内に完了しませんでした。');
    await nextFrame();
    await nextFrame();
  }

  function prepareExportDocument(frameDocument) {
    const body = frameDocument.body;
    const shell = frameDocument.querySelector('.share-shell');
    const content = frameDocument.getElementById('share-content');
    if (!body || !shell || !content || content.hidden) {
      throw new FormationShareImageError('共有本文を画像化できませんでした。', 'content-unavailable');
    }
    frameDocument.documentElement.style.width = `${TARGET_WIDTH + FRAME_EXTRA_WIDTH}px`;
    body.style.width = `${TARGET_WIDTH + FRAME_EXTRA_WIDTH}px`;
    body.style.minWidth = '0';
    shell.style.width = `${TARGET_WIDTH}px`;
    shell.style.margin = '0';
    shell.style.padding = '0';
    content.style.width = `${TARGET_WIDTH}px`;
    content.style.maxWidth = `${TARGET_WIDTH}px`;
    content.querySelectorAll('img').forEach(image => {
      image.loading = 'eager';
      image.decoding = 'sync';
    });
    return content;
  }

  async function createSvgMarkup(sourceDocument, content, width, height) {
    const theme = getTheme(sourceDocument);
    const styles = getStylesheetText(sourceDocument)
      .replace(/\bbody\b/g, '.share-export-body')
      .replaceAll(':root', '.share-export-body');
    const background = getBackgroundColor(sourceDocument);
    const contentHtml = await cloneContentHtml(sourceDocument, content);
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `<rect width="${width}" height="${height}" fill="${background}"/>`,
      `<foreignObject x="0" y="0" width="${width}" height="${height}">`,
      `<div xmlns="http://www.w3.org/1999/xhtml" class="share-export-body formation-share-page" data-theme="${theme}" style="width:${width}px;min-height:${height}px;background-color:${background};overflow:hidden">`,
      `<style>${styles}</style>`,
      contentHtml,
      '</div></foreignObject></svg>'
    ].join('');
  }

  function createSvgDataUrl(svg, maxBytes) {
    const bytes = new TextEncoder().encode(svg);
    if (bytes.byteLength > maxBytes) {
      throw new FormationShareImageError(
        `共有画像の変換データが上限（${maxBytes} bytes）を超えています。`,
        'svg-size-limit'
      );
    }
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    return `data:image/svg+xml;base64,${btoa(binary)}`;
  }

  function loadImage(url, timeoutMs) {
    return withTimeout(new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new FormationShareImageError('共有本文を画像へ変換できませんでした。', 'svg-render-failed'));
      image.src = url;
    }), timeoutMs, '共有画像の変換が時間内に完了しませんでした。');
  }

  function canvasToBlob(canvas, timeoutMs) {
    return withTimeout(new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new FormationShareImageError(
        'PNG画像を作成できませんでした。',
        'png-encode-failed'
      )), 'image/png');
    }), timeoutMs, 'PNG画像の保存準備が時間内に完了しませんでした。');
  }

  function assertSafeDimensions(width, height, options) {
    if (!Number.isFinite(height) || height < 1 || height > options.maxHeight) {
      throw new FormationShareImageError(
        `共有画像の高さが上限（${options.maxHeight}px）を超えています。`,
        'height-limit'
      );
    }
    if (width * height > options.maxArea) {
      throw new FormationShareImageError(
        '共有画像が大きすぎるためPNGを作成できません。',
        'area-limit'
      );
    }
  }

  function createController(controllerOptions = {}) {
    const options = {
      width: TARGET_WIDTH,
      timeoutMs: DEFAULT_TIMEOUT_MS,
      maxHeight: DEFAULT_MAX_HEIGHT,
      maxArea: DEFAULT_MAX_AREA,
      maxPngBytes: DEFAULT_MAX_PNG_BYTES,
      maxSvgBytes: DEFAULT_MAX_SVG_BYTES,
      ...controllerOptions
    };
    if (options.width !== TARGET_WIDTH) {
      throw new FormationShareImageError('共有画像の幅は1200pxに固定されています。', 'width-not-supported');
    }
    let generation = 0;
    let frame = null;
    let svgUrl = '';

    const cleanup = () => {
      if (frame) frame.remove();
      frame = null;
      if (svgUrl) URL.revokeObjectURL(svgUrl);
      svgUrl = '';
    };

    const ensureCurrent = expected => {
      if (expected !== generation) throw new StaleFormationShareImageError();
    };

    const render = async (url, renderOptions = {}) => {
      const expected = ++generation;
      cleanup();
      if (!url) throw new FormationShareImageError('共有URLがありません。', 'url-unavailable');
      assertSupportedShareImageUrl(url);
      const frameUrl = buildRenderUrl(url, expected);
      try {
        frame = document.createElement('iframe');
        frame.setAttribute('aria-hidden', 'true');
        frame.tabIndex = -1;
        frame.style.cssText = [
          'position:fixed', 'left:-20000px', 'top:0', 'width:1232px', 'height:1px',
          'border:0', 'visibility:hidden', 'pointer-events:none'
        ].join(';');
        await withTimeout(new Promise((resolve, reject) => {
          const handleLoad = () => {
            if (!frame.contentDocument?.querySelector('.share-shell')) return;
            frame.removeEventListener('load', handleLoad);
            frame.removeEventListener('error', handleError);
            resolve();
          };
          const handleError = () => {
            frame.removeEventListener('load', handleLoad);
            frame.removeEventListener('error', handleError);
            reject(new FormationShareImageError(
            '共有ページを読み込めませんでした。',
            'frame-load-failed'
            ));
          };
          frame.addEventListener('load', handleLoad);
          frame.addEventListener('error', handleError);
          frame.src = frameUrl;
          document.body.appendChild(frame);
        }), options.timeoutMs, '共有ページの読み込みが時間内に完了しませんでした。');
        ensureCurrent(expected);
        const frameDocument = frame.contentDocument;
        if (renderOptions.theme === 'light' || renderOptions.theme === 'dark') {
          frameDocument.documentElement.dataset.theme = renderOptions.theme;
        }
        const content = prepareExportDocument(frameDocument);
        await waitForDocumentReady(frameDocument, content, options.timeoutMs);
        ensureCurrent(expected);
        const rect = content.getBoundingClientRect();
        const width = options.width;
        const height = Math.ceil(Math.max(rect.height, content.scrollHeight));
        assertSafeDimensions(width, height, options);
        const svg = await withTimeout(
          createSvgMarkup(frameDocument, content, width, height),
          options.timeoutMs,
          '共有画像の変換が時間内に完了しませんでした。'
        );
        svgUrl = createSvgDataUrl(svg, options.maxSvgBytes);
        const sourceImage = await loadImage(svgUrl, options.timeoutMs);
        ensureCurrent(expected);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new FormationShareImageError('PNG描画用canvasを作成できませんでした.', 'canvas-unavailable');
        context.fillStyle = getBackgroundColor(frameDocument);
        context.fillRect(0, 0, width, height);
        context.drawImage(sourceImage, 0, 0, width, height);
        const blob = await canvasToBlob(canvas, options.timeoutMs);
        ensureCurrent(expected);
        if (!blob.size || blob.size > options.maxPngBytes) {
          throw new FormationShareImageError(
            `PNG画像がサイズ上限（${options.maxPngBytes} bytes）を超えています。`,
            'png-size-limit'
          );
        }
        return { blob, width, height, generation: expected };
      } finally {
        if (expected === generation) cleanup();
      }
    };

    return {
      render,
      cancel() {
        generation += 1;
        cleanup();
      },
      dispose() {
        generation += 1;
        cleanup();
      },
      getGeneration() {
        return generation;
      },
      options: Object.freeze({ ...options })
    };
  }

  window.TRICKCAL_FORMATION_SHARE_IMAGE = Object.freeze({
    TARGET_WIDTH,
    createController,
    FormationShareImageError,
    StaleFormationShareImageError
  });
})();
