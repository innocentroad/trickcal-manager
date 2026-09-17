// 各ページの保存アクセスを開始する前にruntimeをbootする共通入口。
// app scriptはTRICKCAL_STORAGE_BOOTのthen後に初期化し、boot前の暗黙read/writeを防ぐ。
(function initStorageBootstrap(root) {
  'use strict';

  const runtimeApi = root?.TRICKCAL_STORAGE_RUNTIME;
  const runtime = typeof runtimeApi?.createStorageRuntime === 'function'
    ? runtimeApi.createStorageRuntime()
    : null;
  root.TRICKCAL_STORAGE_RUNTIME_INSTANCE = runtime;
  const lifecycleRuntimes = new WeakSet();

  // managerだけに、bootの長い待機が排他中の可能性を説明する受動的な案内を出す。
  // これは表示用タイマーであり、boot・保存runtime・lockの状態や順序は変更しない。
  function createManagerBootWaitGuidance() {
    const document = root.document;
    if (document?.documentElement?.dataset?.storageBootGuidance !== 'manager') return null;

    const state = {
      due: false,
      settled: false,
      domReady: document.readyState !== 'loading',
      timer: null
    };
    const getElement = () => document.querySelector?.('[data-storage-boot-wait-guidance]') || null;
    const hide = () => {
      const element = getElement();
      if (!element) return;
      element.hidden = true;
      element.setAttribute?.('aria-hidden', 'true');
    };
    const render = () => {
      const element = getElement();
      if (!element) return;
      if (state.due && !state.settled && state.domReady) {
        element.hidden = false;
        element.removeAttribute?.('aria-hidden');
      } else {
        hide();
      }
    };
    const onDomReady = () => {
      state.domReady = true;
      render();
    };
    if (state.domReady) render();
    else document.addEventListener?.('DOMContentLoaded', onDomReady, { once: true });

    state.timer = root.setTimeout?.(() => {
      state.due = true;
      render();
    }, 3000) ?? null;

    return {
      settle() {
        state.settled = true;
        if (state.timer !== null) root.clearTimeout?.(state.timer);
        state.timer = null;
        hide();
      }
    };
  }

  const managerBootWaitGuidance = createManagerBootWaitGuidance();

  function showBootFailure(result) {
    const render = () => {
      if (!root.document?.body) return;
      root.document.body.classList.remove('is-booting');
      root.document.body.removeAttribute('aria-busy');
      root.document.body.innerHTML = '<main class="storage-boot-error"><h1>保存データを確認できませんでした</h1><p>このページを再読み込みして、もう一度お試しください。</p></main>';
    };
    if (root.document?.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', render, { once: true });
    } else {
      render();
    }
    root.document?.documentElement?.setAttribute('data-storage-boot', result?.code || 'failed');
  }

  function showLifecycleFailure(result) {
    if (!result?.ok) {
      root.document?.documentElement?.setAttribute('data-storage-error', result.code || 'failed');
    }
  }

  function installLifecycle(runtime) {
    const document = root.document;
    const windowObject = root;
    if (!document || !windowObject || lifecycleRuntimes.has(runtime)) return;
    lifecycleRuntimes.add(runtime);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        showLifecycleFailure(runtime.flushParticipants?.());
        return;
      }
      Promise.resolve(runtime.resumeParticipants?.()).catch(error => {
        console.error(error);
        showLifecycleFailure({ ok: false, code: 'write-failed' });
      });
    });
    windowObject.addEventListener('beforeunload', () => {
      showLifecycleFailure(runtime.flushParticipants?.());
    });
    windowObject.addEventListener('pagehide', () => {
      Promise.resolve(runtime.suspendForPagehide?.()).then(showLifecycleFailure).catch(error => {
        console.error(error);
        showLifecycleFailure({ ok: false, code: 'write-failed' });
      });
    });
    windowObject.addEventListener('pageshow', () => {
      Promise.resolve(runtime.resumeAfterPageshow?.()).then(showLifecycleFailure).catch(error => {
        console.error(error);
        showLifecycleFailure({ ok: false, code: 'stale' });
      });
    });
  }

  root.TRICKCAL_STORAGE_BOOT = (async () => {
    if (!runtime) {
      const result = { ok: false, code: 'unsupported', operation: 'boot', retryable: false };
      showBootFailure(result);
      return result;
    }
    let result;
    try {
      result = await runtime.boot({ role: 'app' });
    } catch {
      result = { ok: false, code: 'unsupported', operation: 'boot', retryable: true };
    }
    if (!result?.ok) {
      showBootFailure(result);
      return result;
    }
    const facade = runtime.createStorageFacade();
    if (!facade) {
      const failure = { ok: false, code: 'not-ready', operation: 'boot', retryable: true };
      showBootFailure(failure);
      return failure;
    }
    root.TRICKCAL_STORAGE_FACADE = facade;
    installLifecycle(runtime);
    try {
      const theme = facade.localStorage.getItem('trickcal_theme')
        || facade.localStorage.getItem('trickcal_stat_theme')
        || 'dark';
      root.document?.documentElement?.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    } catch {
      const failure = { ok: false, code: 'read-failed', operation: 'boot', retryable: true };
      showBootFailure(failure);
      return failure;
    }
    root.document?.documentElement?.setAttribute('data-storage-boot', 'ready');
    return result;
  })();
  root.TRICKCAL_STORAGE_BOOT?.then(
    () => managerBootWaitGuidance?.settle(),
    () => managerBootWaitGuidance?.settle()
  );
})(typeof globalThis !== 'undefined' ? globalThis : this);
