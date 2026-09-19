#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'storage-bootstrap.js'), 'utf8');

function createHarness({ optional = false, runtime }) {
  const windowListeners = new Map();
  const documentListeners = new Map();
  const html = {
    dataset: optional ? { storageBootMode: 'optional' } : {},
    attributes: new Map(),
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
      if (name.startsWith('data-')) {
        const key = name.slice(5).replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
        this.dataset[key] = String(value);
      }
    }
  };
  const body = {
    classList: { remove() {} },
    attributes: new Map(),
    removeAttribute(name) { this.attributes.delete(name); },
    innerHTML: '<main id="page-content">read-only page</main>'
  };
  const document = {
    readyState: 'complete',
    documentElement: html,
    body,
    addEventListener(type, listener) {
      if (!documentListeners.has(type)) documentListeners.set(type, []);
      documentListeners.get(type).push(listener);
    },
    querySelector() { return null; },
    dispatchEvent(event) {
      (documentListeners.get(event.type) || []).slice().forEach(listener => listener(event));
    }
  };
  const windowObject = {
    document,
    console,
    CustomEvent: class CustomEvent { constructor(type) { this.type = type; } },
    setTimeout() { return 1; },
    clearTimeout() {},
    addEventListener(type, listener) {
      if (!windowListeners.has(type)) windowListeners.set(type, []);
      windowListeners.get(type).push(listener);
    },
    dispatchEvent(event) {
      (windowListeners.get(event.type) || []).slice().forEach(listener => listener(event));
    },
    TRICKCAL_STORAGE_RUNTIME: { createStorageRuntime: () => runtime }
  };
  const context = vm.createContext(windowObject);
  return {
    context,
    document,
    windowObject,
    dispatchWindow(type) { windowObject.dispatchEvent({ type }); },
    dispatchDocument(type) { document.dispatchEvent({ type }); }
  };
}

async function settle() {
  await new Promise(resolve => setImmediate(resolve));
}

async function run() {
  const failedRuntime = {
    async boot() { return { ok: false, code: 'read-failed' }; },
    createStorageFacade() { return null; }
  };
  const optional = createHarness({ optional: true, runtime: failedRuntime });
  vm.runInContext(source, optional.context, { filename: 'storage-bootstrap.js' });
  const failedResult = await optional.windowObject.TRICKCAL_STORAGE_BOOT;
  assert.equal(failedResult.ok, false);
  assert.match(optional.document.body.innerHTML, /read-only page/, '閲覧専用ページの本文はboot失敗で置換しません');
  assert.equal(optional.document.documentElement.dataset.storageBoot, 'read-failed');
  assert.equal(optional.windowObject.TRICKCAL_STORAGE_BOOT_FAILED, true);

  const strict = createHarness({ optional: false, runtime: failedRuntime });
  vm.runInContext(source, strict.context, { filename: 'storage-bootstrap.js' });
  await strict.windowObject.TRICKCAL_STORAGE_BOOT;
  assert.match(strict.document.body.innerHTML, /保存データを確認できませんでした/, '既存の保存必須ページではboot失敗案内を維持します');

  const readyRuntime = {
    async boot() { return { ok: true }; },
    createStorageFacade() {
      return { localStorage: { getItem() { return 'dark'; } }, sessionStorage: { getItem() { return null; } } };
    },
    async resumeAfterPageshow() { return { ok: true }; },
    async resumeParticipants() { return { ok: true }; },
    flushParticipants() { return { ok: true }; },
    async suspendForPagehide() { return { ok: true }; }
  };
  const ready = createHarness({ optional: true, runtime: readyRuntime });
  vm.runInContext(source, ready.context, { filename: 'storage-bootstrap.js' });
  assert.equal((await ready.windowObject.TRICKCAL_STORAGE_BOOT).ok, true);
  assert.equal(ready.document.documentElement.dataset.theme, 'dark');
  let resumedCount = 0;
  ready.windowObject.addEventListener('trickcal-storage-resumed', () => { resumedCount += 1; });
  ready.dispatchWindow('pageshow');
  await settle();
  assert.equal(resumedCount, 1, 'BFCache pageshow後に成功したstorage resumeだけを通知します');
  ready.document.visibilityState = 'visible';
  ready.dispatchDocument('visibilitychange');
  await settle();
  assert.equal(resumedCount, 2, 'visible復帰後に成功したparticipant resumeを通知します');

  console.log('announcement storage bootstrap tests passed');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
