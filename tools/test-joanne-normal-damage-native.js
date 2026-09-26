#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const ROOT = path.resolve(__dirname, '..');
const MIME = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp'
};

function startServer(port) {
  return http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    const relative = pathname.replace(/^\/+/, '') || 'index.html';
    let file = path.resolve(ROOT, relative);
    const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : `${ROOT}${path.sep}`;
    if (file.startsWith(rootPrefix) && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (file !== ROOT && !file.startsWith(rootPrefix)) { response.writeHead(404); response.end('Not found'); return; }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(fs.readFileSync(file));
  }).listen(port, '127.0.0.1');
}

async function launchChrome(cdpPort, profileRoot) {
  const chrome = browser.startChild(browser.findChrome(), [
    `--user-data-dir=${profileRoot}`, `--remote-debugging-port=${cdpPort}`,
    '--remote-debugging-address=127.0.0.1', '--no-first-run', '--no-default-browser-check',
    '--disable-sync', '--disable-extensions', '--disable-background-networking',
    '--window-size=1280,900', '--new-window', 'about:blank'
  ], ROOT);
  const version = await browser.waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
    return response.ok ? response.json() : null;
  }, { timeoutMs: 30000 });
  const cdp = new browser.CdpClient(version.webSocketDebuggerUrl);
  await cdp.connect();
  return { chrome, cdp };
}

async function openPage(cdp, url, width = 1280, height = 900) {
  const page = await browser.createPage(cdp, url);
  await cdp.send('Page.enable', {}, page.sessionId);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, page.sessionId);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `innerWidth === ${width}`), { timeoutMs: 5000 });
  return page;
}

async function waitReady(cdp, page, expression) {
  return browser.waitFor(
    async () => browser.evaluate(cdp, page, `document.documentElement.dataset.storageBoot === 'ready' && !!(${expression})`),
    { timeoutMs: 30000 }
  );
}

async function closeAnnouncements(cdp, page) {
  await browser.evaluate(cdp, page, `document.querySelector('#trickcal-announcements-dialog')?.close()`);
}

async function managerPick(cdp, page, rowIndex, lineIndex, id) {
  await browser.clickSelector(cdp, page, `[data-formation-apostle-row="${rowIndex}"][data-formation-line="${lineIndex}"]`);
  await browser.waitForSelector(cdp, page, '#formation-picker-dialog[open]');
  await browser.waitForSelector(cdp, page, `#formation-picker-grid [data-formation-picker-value="${id}"]`);
  await browser.clickSelector(cdp, page, `#formation-picker-grid [data-formation-picker-value="${id}"]`);
  if (id === 'Joanne') {
    await browser.waitForSelector(cdp, page, '#formation-picker-dialog.is-personality-mode[open]');
    await browser.clickSelector(cdp, page, '#formation-picker-grid [data-formation-picker-value="冷静"]');
  }
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `window.TRICKCAL_STAT_ENGINE.getState().formation.rows[${rowIndex}].apostles[${lineIndex}] === ${JSON.stringify(id)}`));
}

async function managerSetPersonality(cdp, page, rowIndex, lineIndex, value) {
  await browser.clickSelector(cdp, page, `[data-formation-personality-row="${rowIndex}"][data-formation-personality-line="${lineIndex}"]`);
  await browser.waitForSelector(cdp, page, '#formation-picker-dialog[open]');
  await browser.waitForSelector(cdp, page, `#formation-picker-grid [data-formation-picker-value="${value}"]`);
  await browser.clickSelector(cdp, page, `#formation-picker-grid [data-formation-picker-value="${value}"]`);
  const expected = value || null;
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `window.TRICKCAL_STAT_ENGINE.getState().formation.rows[${rowIndex}].resonancePersonalities[${lineIndex}] === ${JSON.stringify(expected)}`));
}

async function saveFormation(cdp, page, name) {
  await browser.clickSelector(cdp, page, '#formation-save-current');
  await browser.waitForSelector(cdp, page, '#formation-save-editor:not([hidden])');
  await browser.evaluate(cdp, page, `(() => {
    const input = document.querySelector('#formation-save-name');
    input.value = ${JSON.stringify(name)};
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await browser.clickSelector(cdp, page, '#formation-save-confirm');
  return browser.waitFor(async () => browser.evaluate(cdp, page,
    `window.TRICKCAL_STAT_ENGINE.getState().savedFormations.find(item => item.name === ${JSON.stringify(name)}) || null`));
}

async function clickVisiblePoint(cdp, page, selector) {
  const selectorLiteral = JSON.stringify(selector);
  const candidate = await browser.evaluate(cdp, page, `(() => {
    const element = document.querySelector(${selectorLiteral});
    if (!element || ('disabled' in element && element.disabled)) return null;
    element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    const rect = element.getBoundingClientRect();
    const left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
    const top = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
    if (right <= left || bottom <= top) return { rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, points: [] };
    const points = [
      [left + (right - left) * 0.5, top + (bottom - top) * 0.5],
      [left + (right - left) * 0.25, top + (bottom - top) * 0.5],
      [left + (right - left) * 0.75, top + (bottom - top) * 0.5],
      [left + (right - left) * 0.5, top + (bottom - top) * 0.25],
      [left + (right - left) * 0.5, top + (bottom - top) * 0.75]
    ];
    return {
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      points: points.map(([x, y]) => {
        const hit = document.elementFromPoint(x, y);
        return { x, y, hit: hit ? { tagName: hit.tagName, id: hit.id || '', className: String(hit.className || '') } : null,
          targetMatches: !!hit && (hit === element || element.contains(hit)) };
      })
    };
  })()`);
  const point = candidate?.points?.find(item => item.targetMatches);
  if (!point) {
    const overlap = await browser.evaluate(cdp, page, `(() => {
      const target = document.querySelector(${selectorLiteral});
      const summary = document.querySelector('#formation-synergy-summary');
      const rect = element => {
        if (!element) return null;
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return { rect: { x: box.x, y: box.y, width: box.width, height: box.height }, position: style.position,
          zIndex: style.zIndex, overflow: style.overflow, scroll: { top: element.scrollTop, left: element.scrollLeft } };
      };
      return { target: rect(target), targetParent: rect(target?.parentElement), summary: rect(summary),
        summaryParent: rect(summary?.parentElement), pageScroll: { x: scrollX, y: scrollY },
        detailsOpen: target?.closest('details')?.open ?? null };
    })()`);
    await capture(cdp, page, 'joanne-load-button-overlap.png');
    assert.fail(`要素に実際に届くクリック位置がありません: ${selector}; geometry=${JSON.stringify(candidate)}; overlap=${JSON.stringify(overlap)}`);
  }
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y, button: 'none' }, page.sessionId);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1, buttons: 1 }, page.sessionId);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1, buttons: 0 }, page.sessionId);
  return point;
}

async function loadFormation(cdp, page, preset) {
  const selector = `[data-formation-preset-load="${preset.id}"]`;
  const detailsOpen = await browser.evaluate(cdp, page,
    `document.querySelector(${JSON.stringify(selector)})?.closest('details')?.open === true`);
  if (!detailsOpen) {
    await browser.clickSelector(cdp, page, '#formation-save-list .formation-preset-details > summary');
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      `document.querySelector(${JSON.stringify(selector)})?.closest('details')?.open === true`));
  }
  await clickVisiblePoint(cdp, page, selector);
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `window.TRICKCAL_STAT_ENGINE.getState().activeFormationPresetId === ${JSON.stringify(preset.id)}`));
  const state = await browser.evaluate(cdp, page, 'window.TRICKCAL_STAT_ENGINE.getState()');
  assert.deepEqual(state.formation.rows.map(row => row.resonancePersonalities), preset.formation.rows.map(row => row.resonancePersonalities), `${preset.name}: 読込後の性格状態`);
}

async function readCalc(cdp, page) {
  return browser.evaluate(cdp, page, `(() => {
    const api = window.TRICKCAL_DAMAGE_CALC;
    const dps = api.createDpsEvaluationInput();
    const single = api.createSingleActionSnapshot();
    return {
      targetId: single.scenario?.actors?.self?.id || '',
      dpsTargetId: dps.targetId,
      perspective: single.scenario?.battleConditions?.perspective || '',
      personality: single.scenario?.actors?.self?.personality ?? null,
      position: single.scenario?.actors?.self?.position || '',
      required: !!dps.resonanceSelectionRequired,
      dpsDisabled: (() => { const button = document.querySelector('[data-fdcp-mode="dps"]'); return !button || button.disabled || button.getAttribute('aria-disabled') === 'true'; })(),
      dpsAriaLabel: document.querySelector('[data-fdcp-mode="dps"]')?.getAttribute('aria-label') || '',
      dpsTitle: document.querySelector('[data-fdcp-mode="dps"]')?.title || '',
      normalText: document.querySelector('#fdc-result-normal')?.textContent.trim() || '',
      unavailable: single.result?.unavailable || '',
      result: single.result,
      actionCategory: single.scenario?.battleConditions?.actionCategory || '',
      selectedSkillCategory: single.scenario?.battleConditions?.selectedSkillCategory || '',
      selectedSkillOptionKey: single.scenario?.battleConditions?.selectedSkillOptionKey || '',
      normalAttackAddP: single.result?.summary?.normalAttackAddP ?? null,
      activeChoices: [...document.querySelectorAll('#fdc-self-skill-choices [data-fdc-skill-key].is-active')].map(button => ({ key: button.dataset.fdcSkillKey, value: button.dataset.fdcSkillValue, category: button.dataset.fdcSkillCategory, text: button.innerText.trim() })),
      formation: single.scenario?.formationState?.formation || null,
      choices: [...document.querySelectorAll('#fdc-self-skill-choices [data-fdc-skill-value]')].map(button => ({
        key: button.dataset.fdcSkillKey || '',
        value: Number(button.dataset.fdcSkillValue), category: button.dataset.fdcSkillCategory || '',
        action: button.querySelector('.fdc-skill-choice-action')?.textContent.trim() || '',
        active: button.classList.contains('is-active')
      })),
      legacyJoanneToggleCount: document.querySelectorAll('[data-fdc-joanne-state-toggle]').length,
      legacyScenarioKeys: Object.keys(single.scenario?.effectAssumptions?.conditionalEffectEnabled || {}).filter(key => key.startsWith('Joanne_dream_form:') || key.startsWith('Joanne_disperse:')),
      selfSkillEffectKeys: Object.keys(single.scenario?.effectAssumptions?.selfSkillEffectEnabled || {}),
      inlinePersonalitySelectCount: document.querySelectorAll('.fdc-resonance-personality-control, .fdc-picker-member-choice select').length,
      resonanceMarkCount: document.querySelectorAll('.fdc-resonance-mark').length,
      dpsDispersionKeys: Object.keys(dps.scenario?.effectAssumptions?.selfSkillEffectEnabled || {}).filter(key => key.startsWith('Joanne:formation-dispersion:')),
      skillEffectText: document.querySelector('#fdc-self-skill-effects')?.innerText || '',
      skillEffectRows: [...document.querySelectorAll('#fdc-self-skill-effects .fdc-automatic-effect-row, #fdc-self-skill-effects .fdc-skill-effect-toggle')]
        .map(node => ({ className: node.className, text: node.innerText, key: node.querySelector('[data-fdc-self-skill-effect]')?.dataset.fdcSelfSkillEffect || node.querySelector('[data-fdc-skill-effect-info]')?.dataset.fdcSkillEffectInfo || '' })),
      storedCalc: (() => {
        try {
          const saved = JSON.parse(window.TRICKCAL_STORAGE_FACADE.localStorage.getItem('trickcal_formation_damage_settings_v1') || '{}');
          return { targetId: saved.targetId, perspective: saved.perspective, selectedSkillOptionKey: saved.selectedSkillOptionKey,
            legacy: Object.keys(saved.conditionalEffectEnabled || {}).filter(key => key.startsWith('Joanne_dream_form:') || key.startsWith('Joanne_disperse:')) };
        } catch { return null; }
      })()
    };
  })()`);
}

async function waitForRestoredFocus(cdp, page, selector, label) {
  const selectorLiteral = JSON.stringify(selector);
  try {
    await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
      const target = document.querySelector(${selectorLiteral});
      return !!target && document.activeElement === target;
    })()`), { timeoutMs: 5000, intervalMs: 25 });
  } catch (error) {
    const diagnostics = await browser.evaluate(cdp, page, `(() => {
      const target = document.querySelector(${selectorLiteral});
      const rect = target?.getBoundingClientRect();
      const style = target ? getComputedStyle(target) : null;
      return {
        dialogOpen: document.querySelector('#fdc-resonance-personality-dialog')?.open ?? null,
        activeElement: document.activeElement ? {
          tag: document.activeElement.tagName,
          id: document.activeElement.id || '',
          dataset: { ...document.activeElement.dataset },
          html: document.activeElement.outerHTML?.slice(0, 240) || ''
        } : null,
        target: target ? {
          connected: target.isConnected,
          hidden: target.hidden || !!target.closest('[hidden]'),
          disabled: !!target.disabled,
          tabIndex: target.tabIndex,
          rect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null,
          display: style?.display || '',
          visibility: style?.visibility || '',
          clientRects: target.getClientRects().length
        } : null
      };
    })()`);
    throw new Error(`${label}: focus return did not complete; ${JSON.stringify(diagnostics)}; ${error.message}`);
  }
  return browser.evaluate(cdp, page, `(() => {
    const target = document.querySelector(${selectorLiteral});
    const rect = target?.getBoundingClientRect();
    const style = target ? getComputedStyle(target) : null;
    return {
      activeId: document.activeElement?.id || '',
      activeMatchesTarget: !!target && document.activeElement === target,
      visible: !!target && target.isConnected && !target.hidden && !target.closest('[hidden]')
        && !!target.getClientRects().length && style?.display !== 'none' && style?.visibility !== 'hidden',
      disabled: !!target?.disabled,
      rect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null
    };
  })()`);
}

async function setFdcPersonality(cdp, page, slotKey, value) {
  const selector = `[data-fdc-resonance-personality-slot="${slotKey}"]`;
  if (await browser.evaluate(cdp, page, 'document.querySelector("#fdc-formation-picker")?.hidden !== false')) {
    await browser.clickSelector(cdp, page, '#fdc-target-preview');
  }
  await browser.waitForSelector(cdp, page, `#fdc-formation-picker:not([hidden]) ${selector}`);
  await browser.clickSelector(cdp, page, `#fdc-formation-picker ${selector}`);
  await browser.waitForSelector(cdp, page, '#fdc-resonance-personality-dialog[open]');
  if (value) {
    await browser.clickSelector(cdp, page, `#fdc-resonance-personality-dialog [data-fdc-resonance-personality-option="${value}"]`);
  } else {
    await browser.clickSelector(cdp, page, '#fdc-resonance-personality-dialog [data-fdc-resonance-personality-clear]');
  }
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    'document.querySelector("#fdc-resonance-personality-dialog")?.open === false'));
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
    const input = window.TRICKCAL_DAMAGE_CALC.createDpsEvaluationInput();
    return !!input.resonanceSelectionRequired === ${JSON.stringify(!value)};
  })()`));
}

async function pressKey(cdp, page, key, code = key) {
  const virtualKeyCode = key === 'Escape' ? 27 : key === 'Enter' ? 13 : undefined;
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown', key, code,
    ...(virtualKeyCode ? { windowsVirtualKeyCode: virtualKeyCode, nativeVirtualKeyCode: virtualKeyCode } : {})
  }, page.sessionId);
  if (key === 'Enter') {
    await cdp.send('Input.dispatchKeyEvent', {
      type: 'char', key, code, text: '\r', unmodifiedText: '\r',
      windowsVirtualKeyCode: virtualKeyCode, nativeVirtualKeyCode: virtualKeyCode
    }, page.sessionId);
  }
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyUp', key, code,
    ...(virtualKeyCode ? { windowsVirtualKeyCode: virtualKeyCode, nativeVirtualKeyCode: virtualKeyCode } : {})
  }, page.sessionId);
}

async function setCalcTheme(cdp, page, theme) {
  const current = await browser.evaluate(cdp, page,
    'document.body.classList.contains("theme-light") ? "light" : "dark"');
  if (current !== theme) await browser.clickSelector(cdp, page, '#fdc-theme-toggle');
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `document.body.classList.contains("theme-light") === ${JSON.stringify(theme === 'light')}`));
}

async function readDpsActionProfiles(cdp, page) {
  return browser.evaluate(cdp, page,
    'JSON.stringify(window.TRICKCAL_DAMAGE_CALC.createDpsEvaluationInput().actionDamageProfiles)');
}

async function placeUnplacedJoanneWithCancellation(cdp, page) {
  if (await browser.evaluate(cdp, page, 'document.querySelector("#fdc-formation-picker")?.hidden !== false')) {
    await browser.clickSelector(cdp, page, '#fdc-target-preview');
  }
  await browser.clickSelector(cdp, page, '#fdc-formation-picker [data-fdc-picker-mode="all"]');
  const before = await readCalc(cdp, page);
  await browser.clickSelector(cdp, page, '#fdc-formation-picker [data-fdc-member-id="Joanne"]');
  await browser.waitForSelector(cdp, page, '#fdc-formation-picker .fdc-picker-placement');
  const selectedWithoutPlacement = await readCalc(cdp, page);
  assert.equal(selectedWithoutPlacement.targetId, before.targetId, '全列使徒を一覧で選んだだけでは配置列・対象を推定しない');
  assert.equal(JSON.stringify(selectedWithoutPlacement.formation), JSON.stringify(before.formation), '配置先選択前は編成不変');
  const targetSlot = await browser.evaluate(cdp, page, `(() => {
    const slots = [...document.querySelectorAll('#fdc-formation-picker [data-fdc-temp-member-slot]:not(:disabled)')];
    const slot = slots.find(item => item.classList.contains('is-empty')) || slots[0];
    return slot?.dataset.fdcTempMemberSlot || '';
  })()`);
  assert.ok(targetSlot, '全列使徒の配置先候補');
  await browser.clickSelector(cdp, page, `#fdc-formation-picker [data-fdc-temp-member-slot="${targetSlot}"]`);
  await browser.waitForSelector(cdp, page, '#fdc-resonance-personality-dialog[open]');
  const pendingBeforeCancel = await browser.evaluate(cdp, page, `({
    targetId: window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot().scenario.actors.self.id,
    pendingText: document.querySelector('#fdc-formation-picker .fdc-picker-placement')?.innerText || ''
  })`);
  await browser.clickSelector(cdp, page, '#fdc-resonance-personality-dialog [data-fdc-resonance-dialog-cancel]');
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    'document.querySelector("#fdc-resonance-personality-dialog")?.open === false'));
  await waitForRestoredFocus(cdp, page,
    `#fdc-formation-picker [data-fdc-temp-member-slot="${targetSlot}"]`, '配置キャンセル');
  const afterCancel = await browser.evaluate(cdp, page, `({
    formation: JSON.stringify(window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot().scenario.formationState.formation),
    targetId: window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot().scenario.actors.self.id,
    focusSlot: document.activeElement?.dataset?.fdcTempMemberSlot || ''
  })`);
  assert.equal(afterCancel.formation, JSON.stringify(before.formation), '性格モーダルのキャンセルで編成枠・既存メンバー・性格を変更しない');
  assert.equal(afterCancel.targetId, pendingBeforeCancel.targetId, 'キャンセルで対象使徒を切り替えない');
  assert.equal(afterCancel.focusSlot, targetSlot, '配置キャンセル後は元の配置先へフォーカス復帰');
  assert.ok(pendingBeforeCancel.pendingText.includes('ジョアン'), 'キャンセル後も配置先選択中の使徒を保持');

  const confirmationSlot = await browser.evaluate(cdp, page, `(() => {
    const slots = [...document.querySelectorAll('#fdc-formation-picker [data-fdc-temp-member-slot]:not(:disabled)')];
    const slot = slots.find(item => item.classList.contains('is-empty')) || slots[0];
    return slot?.dataset.fdcTempMemberSlot || '';
  })()`);
  assert.ok(confirmationSlot, 'キャンセル後に配置先を選び直せる');
  await browser.clickSelector(cdp, page, `#fdc-formation-picker [data-fdc-temp-member-slot="${confirmationSlot}"]`);
  await browser.waitForSelector(cdp, page, '#fdc-resonance-personality-dialog[open]');
  await browser.clickSelector(cdp, page, '#fdc-resonance-personality-dialog [data-fdc-resonance-personality-option="冷静"]');
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
    const snapshot = window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot();
    return snapshot.scenario.actors.self.id === 'Joanne'
      && snapshot.scenario.actors.self.personality === '冷静'
      && !snapshot.result.unavailable;
  })()`));
  assert.equal(await browser.evaluate(cdp, page,
    'document.querySelector("#fdc-resonance-personality-dialog")?.open === true'), false, '確定後に選択モーダルを閉じる');
  const restoredFocus = await waitForRestoredFocus(cdp, page, '#fdc-target-preview', '配置確定後');
  assert.equal(restoredFocus.activeId, 'fdc-target-preview', '配置確定後に対象カードへフォーカス復帰');
  assert.equal(restoredFocus.visible, true, '配置確定後のフォーカス先は表示中');
  assert.equal(restoredFocus.disabled, false, '配置確定後のフォーカス先は操作可能');
  return confirmationSlot;
}

async function displaceJoanneForUnplacedTest(cdp, page, slotKey = '2:0') {
  if (await browser.evaluate(cdp, page, 'document.querySelector("#fdc-formation-picker")?.hidden !== false')) {
    await browser.clickSelector(cdp, page, '#fdc-target-preview');
  }
  if (await browser.evaluate(cdp, page,
    'document.querySelector("#fdc-formation-picker [data-fdc-picker-mode=all]")?.classList.contains("is-active") !== true')) {
    await browser.clickSelector(cdp, page, '#fdc-formation-picker [data-fdc-picker-mode="all"]');
  }
  const candidates = await browser.evaluate(cdp, page, `(() => {
    const formationState = window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot().scenario.formationState;
    const placed = new Set([
      ...(formationState.formation.rows || []).flatMap(row => row.apostles || []).filter(Boolean),
      ...Object.values(formationState.tempMembers || {}).filter(Boolean)
    ]);
    return [...document.querySelectorAll('#fdc-formation-picker .fdc-picker-all-grid [data-fdc-member-id]')]
      .filter(card => card.dataset.fdcMemberId !== 'Joanne' && !card.classList.contains('is-resonance') && !placed.has(card.dataset.fdcMemberId))
      .map(card => card.dataset.fdcMemberId);
  })()`);
  assert.ok(candidates.length, 'ジョアンを一時的に置き換える未配置の通常使徒候補');
  for (const id of candidates) {
    await browser.clickSelector(cdp, page, `#fdc-formation-picker .fdc-picker-all-grid [data-fdc-member-id="${id}"]`);
    await browser.waitForSelector(cdp, page, '#fdc-formation-picker .fdc-picker-placement');
    const slot = await browser.evaluate(cdp, page, `(() => {
      const candidate = document.querySelector('#fdc-formation-picker [data-fdc-temp-member-slot="${slotKey}"]:not(:disabled)');
      return candidate?.dataset.fdcTempMemberSlot || '';
    })()`);
    if (slot) {
      await browser.clickSelector(cdp, page, `#fdc-formation-picker [data-fdc-temp-member-slot="${slot}"]`);
      await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
        const formationState = window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot().scenario.formationState;
        const rows = formationState.formation.rows || [];
        const tempMembers = formationState.tempMembers || {};
        return !rows.some((row, rowIndex) => (row.apostles || []).some((id, lineIndex) => {
          const key = String(rowIndex) + ':' + String(lineIndex);
          const effectiveId = Object.prototype.hasOwnProperty.call(tempMembers, key) ? tempMembers[key] : id;
          return effectiveId === 'Joanne';
        }));
      })()`));
      return id;
    }
    await browser.clickSelector(cdp, page, '#fdc-formation-picker [data-fdc-temp-member-cancel]');
    await browser.clickSelector(cdp, page, '#fdc-formation-picker [data-fdc-picker-mode="all"]');
  }
  assert.fail(`指定枠 ${slotKey} へ配置可能な通常使徒候補がありません`);
}

async function selectApostleForCalc(cdp, page, apostleId) {
  if (await browser.evaluate(cdp, page, 'document.querySelector("#fdc-formation-picker")?.hidden !== false')) {
    await browser.evaluate(cdp, page, 'document.querySelector("#fdc-target-preview")?.scrollIntoView({ block: "center" })');
    await browser.clickSelector(cdp, page, '#fdc-target-preview');
  }
  if (await browser.evaluate(cdp, page,
    'document.querySelector("#fdc-formation-picker [data-fdc-picker-mode=all]")?.classList.contains("is-active") !== true')) {
    await browser.clickSelector(cdp, page, '#fdc-formation-picker [data-fdc-picker-mode="all"]');
  }
  await browser.waitForSelector(cdp, page, `#fdc-formation-picker .fdc-picker-all-grid [data-fdc-member-id="${apostleId}"]`);
  await browser.clickSelector(cdp, page, `#fdc-formation-picker .fdc-picker-all-grid [data-fdc-member-id="${apostleId}"]`);
  if (await browser.evaluate(cdp, page, '!!document.querySelector("#fdc-formation-picker .fdc-picker-placement")')) {
    const targetSlot = await browser.evaluate(cdp, page, `(() => {
      const formation = window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot().scenario.formationState.formation;
      const joanneSlot = (formation.rows || []).flatMap((row, rowIndex) => (row.apostles || []).map((id, lineIndex) => id === 'Joanne' ? String(rowIndex) + ':' + String(lineIndex) : '')).find(Boolean) || '';
      const slots = [...document.querySelectorAll('#fdc-formation-picker [data-fdc-temp-member-slot]:not(:disabled)')];
      const usable = slots.filter(slot => slot.dataset.fdcTempMemberSlot !== joanneSlot);
      const slot = usable.find(item => item.classList.contains('is-empty')) || usable[0];
      return slot?.dataset.fdcTempMemberSlot || '';
    })()`);
    assert.ok(targetSlot, `${apostleId}の一時配置先`);
    await browser.clickSelector(cdp, page, `#fdc-formation-picker [data-fdc-temp-member-slot="${targetSlot}"]`);
    if (await browser.evaluate(cdp, page, 'document.querySelector("#fdc-resonance-personality-dialog")?.open === true')) {
      await browser.clickSelector(cdp, page, '#fdc-resonance-personality-dialog [data-fdc-resonance-personality-option="冷静"]');
    }
  }
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot().scenario.actors.self.id === ${JSON.stringify(apostleId)}`));
  await closeFormationPicker(cdp, page);
}

async function injectLegacyJoanneCalcChoices(cdp, page) {
  const data = await browser.evaluate(cdp, page, `(() => {
    const settingsKey = 'trickcal_formation_damage_settings_v1';
    const storage = window.TRICKCAL_STORAGE_FACADE?.localStorage || localStorage;
    const saved = JSON.parse(storage.getItem(settingsKey) || '{}');
    const normal = [...document.querySelectorAll('#fdc-self-skill-choices [data-fdc-skill-key]')]
      .find(button => button.querySelector('.fdc-skill-choice-action')?.textContent.trim() === '普通攻撃'
        && Number(button.dataset.fdcSkillValue) === 200);
    if (!normal) return null;
    saved.targetId = 'Joanne';
    saved.perspective = 'self';
    saved.selectedSkillCategory = '普通攻撃';
    saved.selectedSkillOptionKey = normal.dataset.fdcSkillKey;
    saved.conditionalEffectEnabled = {
      ...(saved.conditionalEffectEnabled || {}),
      'Joanne_dream_form:self:Joanne': true,
      'Joanne_dream_form:enemy:Joanne': true,
      'Joanne_disperse:Joanne:self:Joanne': true,
      'Joanne_disperse:Joanne:enemy:Joanne': true
    };
    saved.selfSkillEffectEnabled = { ...(saved.selfSkillEffectEnabled || {}) };
    delete saved.selfSkillEffectEnabled['Joanne:formation-dispersion:Joanne:all'];
    storage.setItem(settingsKey, JSON.stringify(saved));
    return { settingsKey, normalKey: normal.dataset.fdcSkillKey };
  })()`);
  assert.ok(data, 'レガシー条件テスト用の通常攻撃選択肢');
  const previousDocumentTimeOrigin = await browser.evaluate(cdp, page, 'performance.timeOrigin');
  await cdp.send('Page.reload', { ignoreCache: true }, page.sessionId);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `performance.timeOrigin !== ${previousDocumentTimeOrigin}
    && document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_DAMAGE_CALC`), { timeoutMs: 30000 });
  await closeAnnouncements(cdp, page);
  const migrated = await readCalc(cdp, page);
  assert.equal(migrated.targetId, 'Joanne', '旧設定の対象を復元');
  assert.equal(migrated.choices.find(choice => choice.action === '普通攻撃〈夢幻の化身〉')?.active, true,
    `旧夢幻ONを排他的な500%攻撃選択へ移行: ${JSON.stringify({ selected: migrated.selectedSkillOptionKey, category: migrated.selectedSkillCategory, perspective: migrated.perspective, choices: migrated.choices, storedCalc: migrated.storedCalc, normalKey: data.normalKey })}`);
  assert.equal(migrated.result.detail.mods.skillP, 500, '旧夢幻ONを500%だけへ移行');
  assert.deepEqual(migrated.legacyScenarioKeys, [], '新UIから使われない旧夢幻／分散状態をシナリオから除去');
  assert.equal(migrated.legacyJoanneToggleCount, 0, '旧チェック要素を再生成しない');
  const dispersion = await readSupportRows(cdp, page, '/分散中：攻撃力増加・被ダメージ量減少/');
  assert.equal(dispersion.length, 1, '旧分散ONを新しい編成スキル条件1件へ移行');
  assert.equal(dispersion[0].checked, true, `対応可能な旧分散値だけを新条件へ引継ぎ: ${JSON.stringify({ dispersion, keys: migrated.selfSkillEffectKeys, storedCalc: migrated.storedCalc })}`);
  assert.ok(migrated.selfSkillEffectKeys.includes('Joanne:formation-dispersion:Joanne:all'), `新しい対象別条件キーで保存: ${JSON.stringify(migrated.selfSkillEffectKeys)}`);
  return { ...migrated, normalKey: data.normalKey };
}

async function closeFormationPicker(cdp, page) {
  if (await browser.evaluate(cdp, page, 'document.querySelector("#fdc-formation-picker")?.hidden === false')) {
    await browser.clickSelector(cdp, page, '#fdc-formation-picker [data-fdc-picker-close]');
  }
}

async function moveJoanne(cdp, page, slotKey) {
  if (await browser.evaluate(cdp, page, 'document.querySelector("#fdc-formation-picker")?.hidden !== false')) {
    await browser.clickSelector(cdp, page, '#fdc-target-preview');
  }
  await browser.waitForSelector(cdp, page, '#fdc-formation-picker:not([hidden]) [data-fdc-picker-mode="all"]');
  await browser.clickSelector(cdp, page, '#fdc-formation-picker [data-fdc-picker-mode="all"]');
  await browser.waitForSelector(cdp, page, '#fdc-formation-picker:not([hidden]) [data-fdc-member-id="Joanne"]');
  await browser.clickSelector(cdp, page, '#fdc-formation-picker [data-fdc-member-id="Joanne"]');
  await new Promise(resolve => setTimeout(resolve, 250));
  const placementFacts = await browser.evaluate(cdp, page, `(() => {
    const picker = document.querySelector('#fdc-formation-picker');
    return { hidden: picker?.hidden, placement: picker?.querySelector('.fdc-picker-placement')?.innerText || '',
      slots: [...picker?.querySelectorAll('[data-fdc-temp-member-slot]') || []].map(node => ({ key: node.dataset.fdcTempMemberSlot, disabled: node.disabled, text: node.innerText })),
      bodyClass: picker?.querySelector('.fdc-picker-body')?.className || '',
      joanneButtons: [...picker?.querySelectorAll('[data-fdc-member-id="Joanne"]') || []].map(node => ({ title: node.title, disabled: node.disabled, rect: (() => { const r = node.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; })() }) ) };
  })()`);
  const resolvedSlotKey = Number.isInteger(slotKey)
    ? placementFacts.slots.find(slot => slot.key.startsWith(`${slotKey}:`) && !slot.disabled)?.key
    : slotKey;
  if (!placementFacts.slots.some(slot => slot.key === resolvedSlotKey && !slot.disabled)) await capture(cdp, page, 'joanne-placement-picker-failure.png');
  assert.ok(placementFacts.slots.some(slot => slot.key === resolvedSlotKey && !slot.disabled), `配置先が表示されない: ${slotKey}; ${JSON.stringify(placementFacts)}`);
  await browser.waitForSelector(cdp, page, `#fdc-formation-picker:not([hidden]) [data-fdc-temp-member-slot="${resolvedSlotKey}"]`);
  await browser.clickSelector(cdp, page, `#fdc-formation-picker [data-fdc-temp-member-slot="${resolvedSlotKey}"]`);
  if (await browser.evaluate(cdp, page, 'document.querySelector("#fdc-resonance-personality-dialog")?.open === true')) {
    await browser.clickSelector(cdp, page, '#fdc-resonance-personality-dialog [data-fdc-resonance-personality-option="冷静"]');
  }
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot().scenario.actors.self.id === 'Joanne'`));
  assert.equal(await browser.evaluate(cdp, page,
    'document.querySelector("#fdc-resonance-personality-dialog")?.open === true'), false, '配置済み性格の移動では選択モーダルを再表示しない');
  return resolvedSlotKey;
}

async function selectSkill(cdp, page, predicateSource) {
  const choice = await browser.evaluate(cdp, page, `(() => {
    const buttons = [...document.querySelectorAll('#fdc-self-skill-choices [data-fdc-skill-value]')];
    const button = buttons.find(candidate => (${predicateSource})(candidate));
    if (!button) return null;
    return { value: button.dataset.fdcSkillValue, category: button.dataset.fdcSkillCategory, key: button.dataset.fdcSkillKey };
  })()`);
  assert.ok(choice, `スキル候補が見つかりません: ${predicateSource}`);
  const selector = `#fdc-self-skill-choices [data-fdc-skill-key=${JSON.stringify(choice.key)}]`;
  await browser.clickSelector(cdp, page, selector);
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `document.querySelector(${JSON.stringify(selector)})?.classList.contains('is-active') === true`));
  return Number(choice.value);
}

async function setAsideRank(cdp, page, value) {
  const selector = '#fdc-self-skill-choices select[data-fdc-skill-level="asideRank"]';
  await browser.waitForSelector(cdp, page, selector);
  await browser.evaluate(cdp, page, `(() => {
    const select = document.querySelector(${JSON.stringify(selector)});
    select.value = ${JSON.stringify(String(value))};
    select.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `document.querySelector(${JSON.stringify(selector)})?.value === ${JSON.stringify(String(value))}`));
}

async function setEnemyDamageType(cdp, page, value) {
  await browser.evaluate(cdp, page, `(() => {
    const select = document.querySelector('#fdc-enemy-damage-type');
    select.value = ${JSON.stringify(String(value))};
    select.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await browser.waitFor(async () => browser.evaluate(cdp, page,
    `document.querySelector('#fdc-enemy-damage-type')?.value === ${JSON.stringify(String(value))}`));
}

async function readSupportRows(cdp, page, expression) {
  return browser.evaluate(cdp, page, `(() => [...document.querySelectorAll('#fdc-self-skill-effects [data-fdc-self-skill-effect]')]
    .map(input => ({ checked: input.checked, disabled: input.disabled, text: input.closest('.fdc-skill-effect-toggle')?.innerText || '' }))
    .filter(row => (${expression}).test(row.text)))()`);
}

async function clickSupportRow(cdp, page, expression) {
  const key = await browser.evaluate(cdp, page, `(() => [...document.querySelectorAll('#fdc-self-skill-effects [data-fdc-self-skill-effect]')]
    .find(input => (${expression}).test(input.closest('.fdc-skill-effect-toggle')?.innerText || ''))?.dataset.fdcSelfSkillEffect || '' )()`);
  assert.ok(key, `支援効果行が見つかりません: ${expression}`);
  await browser.clickSelector(cdp, page, `#fdc-self-skill-effects [data-fdc-self-skill-effect=${JSON.stringify(key)}]`);
}

async function capture(cdp, page, filename) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png' }, page.sessionId);
  fs.mkdirSync(path.join(ROOT, 'tmp'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'tmp', filename), Buffer.from(result.data, 'base64'));
}

async function run() {
  const serverPort = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([serverPort]);
  const origin = `http://127.0.0.1:${serverPort}`;
  const server = startServer(serverPort);
  const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-joanne-native-'));
  const pages = [];
  let chrome = null;
  let cdp = null;
  try {
    await browser.waitForHttp(`${origin}/stat-dashboard.html`);
    ({ chrome, cdp } = await launchChrome(cdpPort, profileRoot));

    const manager = await openPage(cdp, `${origin}/stat-dashboard.html?view=formation&joanneNative=1`);
    pages.push(manager);
    await waitReady(cdp, manager, '!!window.TRICKCAL_STAT_ENGINE');
    await cdp.send('Network.enable', {}, manager.sessionId);
    const requests = [];
    cdp.on(manager.sessionId, 'Network.requestWillBeSent', params => requests.push(params.request.url));
    await cdp.send('Page.reload', { ignoreCache: true }, manager.sessionId);
    await waitReady(cdp, manager, '!!window.TRICKCAL_STAT_ENGINE');
    await closeAnnouncements(cdp, manager);
    await browser.waitFor(async () => browser.evaluate(cdp, manager,
      `document.querySelector('[data-dashboard-panel="formation"]')?.classList.contains('is-active') === true`));
    await browser.waitForSelector(cdp, manager, '[data-formation-apostle-row="2"][data-formation-line="0"]');

    await managerPick(cdp, manager, 2, 0, 'Joanne');
    await managerSetPersonality(cdp, manager, 2, 0, '');
    const joanneBasic = await browser.evaluate(cdp, manager, `(() => {
      const data = window.TRICKCAL_STAT_DATA;
      const row = data?.getById?.('basicInfo', 'Joanne') || data?.sheets?.basicInfo?.find(item => item.id === 'Joanne');
      return row ? { name: row.使徒名, personality: row.性格, race: row.種族, role: row.役割, position: row.配置列, attackType: row.攻撃タイプ } : null;
    })()`);
    assert.deepEqual(joanneBasic, { name: 'ジョアン', personality: '共鳴', race: '妖精', role: '支援', position: '全列', attackType: '物理' }, 'ジョアン基礎データ/マスター性格');
    const asideSnapshots = await browser.evaluate(cdp, manager, `(() => {
      const api = window.TRICKCAL_STAT_ENGINE;
      const data = window.TRICKCAL_STAT_DATA?.sheets;
      const tier = data?.asideTiers?.find(item => item.id === 'Joanne');
      const globalRows = (data?.asideStatEffects || []).filter(item => item.id === 'Joanne' && Number(item.SLv) === 3 && String(item.ステ適用 || '').includes('全体'));
      const specialEffects = (data?.asideSpecialEffects || []).filter(item => item.id === 'Joanne')
        .map(item => ({ rank: Number(item.SLv) || 0, kind: String(item.値の種類 || ''), valueClass: String(item.値分類 || ''), value: Number(item.固定値) || 0, effectId: String(item.effectId || '') }));
      const globalRates = {};
      const statKeys = { HP: 'hp', 物理攻撃力: 'physicalAtk', 魔法攻撃力: 'magicAtk', 物理防御力: 'physicalDef', 魔法防御力: 'magicDef', 会心: 'crit', 会心DMG: 'critDmg', 会心抵抗: 'critRes', 会心DMG抵抗: 'critDmgRes' };
      globalRows.forEach(row => {
        const key = statKeys[String(row.ステ能力値 || '').replace(/全体/g, '').trim()];
        if (key) globalRates[key] = (globalRates[key] || 0) + (Number(row['上昇%']) || 0);
      });
      const variants = [[0, 0], [1, 30], [2, 1], [3, 1]].map(([asideRank, asideLevel]) => {
        const result = api.calculateApostleStats('Joanne', {
          rank: 1, level: 60, star: 3, asideRank, asideLevel
        }, { boards: {}, kind: 'joanne-aside-regression' });
        return {
          asideRank: result?.state?.asideRank,
          asideLevel: result?.state?.asideLevel,
          manifest: result?.snapshot?.breakdown?.asideManifest,
          level: result?.snapshot?.breakdown?.asideLevel,
          globalPercentRates: result?.snapshot?.globalPercentRates
        };
      });
      return { tier, globalRates, specialEffects, variants };
    })()`);
    assert.ok(asideSnapshots.tier && asideSnapshots.variants.every(item => Number.isInteger(item.asideRank)), '既存stat engineのジョアンA0〜A3 snapshotを生成');
    const [aside0, aside1, aside2, aside3] = asideSnapshots.variants;
    const expectedManifest = {
      hp: Number(asideSnapshots.tier.HP基礎値 ?? asideSnapshots.tier.HP発現値),
      patk: Number(asideSnapshots.tier.物理攻撃力基礎値 ?? asideSnapshots.tier.物理攻撃力発現値),
      pdef: Number(asideSnapshots.tier.物理防御力基礎値 ?? asideSnapshots.tier.物理防御力発現値),
      mdef: Number(asideSnapshots.tier.魔法防御力基礎値 ?? asideSnapshots.tier.魔法防御力発現値)
    };
    for (const [key, value] of Object.entries(expectedManifest)) {
      assert.equal(aside0.manifest[key], 0, `A0ではアサイド発現を加算しない: ${key}`);
      assert.equal(aside1.manifest[key], value, `A1発現値をシート値で一度だけ適用: ${key}`);
      assert.ok(Math.abs(aside2.manifest[key] - value * 1.03) < 1e-8, `A2は基礎値にも段階倍率を一度だけ適用: ${key}`);
      assert.ok(Math.abs(aside3.manifest[key] - value * 1.06) < 1e-8, `A3は基礎値にも段階倍率を一度だけ適用: ${key}`);
    }
    const expectedA1Growth = {
      hp: (Number(asideSnapshots.tier.HP_A1成長値) || 0) * 29,
      patk: (Number(asideSnapshots.tier.物理攻撃力_A1成長値) || 0) * 29,
      pdef: (Number(asideSnapshots.tier.物理防御力_A1成長値) || 0) * 29,
      mdef: (Number(asideSnapshots.tier.魔法防御力_A1成長値) || 0) * 29
    };
    for (const [key, value] of Object.entries(expectedA1Growth)) {
      assert.equal(aside1.level[key], value, `A1の29成長段階はA1成長値から一度だけ算出: ${key}`);
      assert.equal(aside2.level[key], 0, `A2 Lv1に固定星上昇を加えない: ${key}`);
      assert.equal(aside3.level[key], 0, `A3 Lv1に固定星上昇を加えない: ${key}`);
    }
    for (const [key, value] of Object.entries(asideSnapshots.globalRates)) {
      const a3Rate = Number(aside3.globalPercentRates[key]) || 0;
      const a0Rate = Number(aside0.globalPercentRates[key]) || 0;
      assert.equal(a3Rate - a0Rate, value, `A3の全体補正は効果データ分だけ適用: ${key}`);
    }
    const unsetDraft = await browser.evaluate(cdp, manager, 'window.TRICKCAL_STAT_ENGINE.getState().formation');
    assert.equal(unsetDraft.rows[2].resonancePersonalities[0], null, '性格クリア後の共鳴下書きは未選択');
    const unsetPreset = await saveFormation(cdp, manager, 'native-joanne-unselected');

    await managerSetPersonality(cdp, manager, 2, 0, '冷静');
    const coldPreset = await saveFormation(cdp, manager, 'native-joanne-cold');
    await managerSetPersonality(cdp, manager, 2, 0, '狂気');
    const madPreset = await saveFormation(cdp, manager, 'native-joanne-mad');
    await loadFormation(cdp, manager, coldPreset);
    assert.equal((await browser.evaluate(cdp, manager, 'window.TRICKCAL_STAT_ENGINE.getFormationShareSnapshot()')).resonancePersonalities?.[6], '冷静', '共有snapshotへ編成性格を反映');
    await capture(cdp, manager, 'joanne-manager-formation-1280.png');

    await browser.clickSelector(cdp, manager, '#formation-share-open');
    await browser.waitForSelector(cdp, manager, '#formation-share-dialog[open]');
    await new Promise(resolve => setTimeout(resolve, 500));
    const shareOpenFacts = await browser.evaluate(cdp, manager, `(() => ({
      dialogOpen: document.querySelector('#formation-share-dialog')?.open === true,
      url: document.querySelector('#formation-share-url')?.value || '',
      previewSrc: document.querySelector('#formation-share-preview')?.getAttribute('src') || '',
      status: document.querySelector('#formation-share-status')?.innerText || '',
      codecReady: !!window.TRICKCAL_FORMATION_SHARE_CODEC,
      displayDataReady: !!window.TRICKCAL_FORMATION_SHARE_DISPLAY_DATA,
      snapshotReady: (() => { try { return !!window.TRICKCAL_STAT_ENGINE?.getFormationShareSnapshot?.(); } catch (error) { return error.message; } })()
    }))()`);
    assert.ok(shareOpenFacts.url && shareOpenFacts.previewSrc, `共有プレビュー生成: ${JSON.stringify(shareOpenFacts)}`);
    const shareFrameFacts = await browser.waitFor(async () => browser.evaluate(cdp, manager, `(() => {
      const doc = document.querySelector('#formation-share-preview')?.contentDocument;
      if (!doc || !doc.querySelector('body')?.innerText.trim()) return null;
      const images = [...doc.querySelectorAll('img')];
      if (images.some(image => !image.complete || image.naturalWidth <= 0)) return null;
      return {
        title: doc.title,
        coldBadge: !!doc.querySelector('img[alt="冷静"]'),
        text: doc.body.innerText.slice(0, 120),
        imageCount: images.length,
        failedImages: images.filter(image => !image.complete || image.naturalWidth <= 0).map(image => image.src)
      };
    })()`), { timeoutMs: 30000 });
    assert.equal(shareFrameFacts.coldBadge, true, '共有プレビューに選択済み性格を表示');
    assert.equal(shareFrameFacts.failedImages.length, 0, '共有プレビュー画像');
    await browser.clickSelector(cdp, manager, '#formation-share-close');
    await browser.waitFor(async () => browser.evaluate(cdp, manager, 'document.querySelector("#formation-share-dialog")?.open === false'));

    await loadFormation(cdp, manager, madPreset);
    assert.equal((await browser.evaluate(cdp, manager, 'window.TRICKCAL_STAT_ENGINE.getState()')).formation.rows[2].resonancePersonalities[0], '狂気', '編成切替で独立性格');
    await loadFormation(cdp, manager, unsetPreset);
    assert.equal((await browser.evaluate(cdp, manager, 'window.TRICKCAL_STAT_ENGINE.getState()')).formation.rows[2].resonancePersonalities[0], null, '未選択下書きを再読込');

    const calc = await openPage(cdp, `${origin}/formation-damage-calc.html?joanneNative=1`);
    pages.push(calc);
    await waitReady(cdp, calc, '!!window.TRICKCAL_DAMAGE_CALC');
    await closeAnnouncements(cdp, calc);
    const displacedForPlacement = await displaceJoanneForUnplacedTest(cdp, calc, '2:0');
    const placedJoanneSlot = await placeUnplacedJoanneWithCancellation(cdp, calc);
    assert.notEqual(displacedForPlacement, 'Joanne', '新規配置fixtureでは別の通常使徒を置換');
    let calcState = await readCalc(cdp, calc);
    assert.equal(calcState.targetId, 'Joanne', '計算対象ジョアン');
    assert.equal(calcState.personality, '冷静', '新規配置はモーダルで選んだ性格と確定');
    assert.equal(calcState.required, false, '性格選択で通常/DPS計算制限を解除');
    const selectedTargetBadge = await browser.evaluate(cdp, calc, `(() => {
      const target=document.querySelector('#fdc-target-preview');
      const wrap=target?.closest('.fdc-target-preview-wrap');
      const trigger=wrap?.querySelector('.fdc-target-resonance-trigger');
      const icon=trigger?.querySelector('img');
      return {sibling:!!trigger && trigger.parentElement===wrap && !target.contains(trigger),
        icon:icon?.getAttribute('src') || '',loaded:!!icon?.complete && icon.naturalWidth>0,
        label:trigger?.getAttribute('aria-label') || ''};
    })()`);
    assert.equal((await readCalc(cdp, calc)).targetId, 'Joanne', '選択中対象はジョアン');
    assert.equal(selectedTargetBadge.sibling, true, '対象カード性格操作を親ボタンから分離');
    assert.match(selectedTargetBadge.icon, /性格_冷静\.webp/, '選択中対象に選択性格アイコン');
    assert.equal(selectedTargetBadge.loaded, true, '選択中対象の性格アイコンを読み込む');
    await browser.clickSelector(cdp, calc, '.fdc-target-resonance-trigger');
    await browser.waitForSelector(cdp, calc, '#fdc-resonance-personality-dialog[open]');
    assert.equal((await readCalc(cdp, calc)).targetId, 'Joanne', '対象性格アイコン操作で対象を変更しない');
    await pressKey(cdp, calc, 'Escape', 'Escape');
    await browser.waitFor(async () => browser.evaluate(cdp, calc,
      'document.querySelector("#fdc-resonance-personality-dialog")?.open === false'));
    assert.equal(await browser.evaluate(cdp, calc,
      'document.activeElement?.matches(".fdc-target-resonance-trigger") === true'), true,
    '対象性格ダイアログのEscape後に操作アイコンへ復帰');
    await browser.evaluate(cdp, calc, `(() => {
      const preview=document.querySelector('#fdc-target-preview');
      const bottom=preview?.getBoundingClientRect().bottom || 0;
      window.scrollTo({top:Math.max(181, window.scrollY + bottom - 10), behavior:'instant'});
    })()`);
    await browser.waitFor(async () => browser.evaluate(cdp, calc, `(() => {
      const target=document.querySelector('#fdc-floating-target');
      const trigger=document.querySelector('#fdc-floating-resonance-trigger');
      return !!target && target.classList.contains('is-visible') && !!trigger && !trigger.hidden;
    })()`));
    const floatingTargetResonance = await browser.evaluate(cdp, calc, `(() => {
      const target=document.querySelector('#fdc-floating-target');
      const trigger=document.querySelector('#fdc-floating-resonance-trigger');
      const icon=trigger?.querySelector('img');
      const r=trigger?.getBoundingClientRect();
      const hit=r ? document.elementFromPoint(r.left+r.width/2,r.top+r.height/2) : null;
      return {sibling:!!trigger && trigger.parentElement===target.parentElement && !target.contains(trigger),
        targetId:window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot().scenario.actors.self.id,icon:icon?.getAttribute('src')||'',
        loaded:!!icon?.complete&&icon.naturalWidth>0,hidden:!!trigger?.hidden,
        rect:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null,
        hitTrigger:!!hit&&(hit===trigger||trigger.contains(hit))};
    })()`);
    assert.equal(floatingTargetResonance.targetId, 'Joanne', 'フロート性格操作前の対象はジョアン');
    assert.equal(floatingTargetResonance.sibling, true, 'フロート性格操作を親カードから分離');
    assert.match(floatingTargetResonance.icon, /性格_冷静\.webp/, 'フロートに選択済み性格アイコン');
    assert.equal(floatingTargetResonance.loaded, true, 'フロート性格アイコンを読み込む');
    assert.equal(floatingTargetResonance.hitTrigger, true, 'フロート重なり位置の最前面は独立性格ボタン');
    await capture(cdp, calc, 'joanne-calc-resonance-floating-target-1280.png');
    await browser.clickSelector(cdp, calc, '#fdc-floating-resonance-trigger');
    await browser.waitForSelector(cdp, calc, '#fdc-resonance-personality-dialog[open]');
    assert.equal((await readCalc(cdp, calc)).targetId, 'Joanne', 'フロート性格アイコンで対象変更しない');
    await pressKey(cdp, calc, 'Escape', 'Escape');
    await browser.waitFor(async () => browser.evaluate(cdp, calc,
      'document.querySelector("#fdc-resonance-personality-dialog")?.open === false'));
    await browser.waitFor(async () => browser.evaluate(cdp, calc,
      'document.activeElement?.id === "fdc-floating-resonance-trigger"'));
    for (const personality of ['活発', '冷静']) {
      await browser.clickSelector(cdp, calc, '#fdc-floating-resonance-trigger');
      await browser.waitForSelector(cdp, calc, '#fdc-resonance-personality-dialog[open]');
      await browser.clickSelector(cdp, calc,
        `#fdc-resonance-personality-dialog [data-fdc-resonance-personality-option="${personality}"]`);
      await browser.waitFor(async () => (await readCalc(cdp, calc)).personality === personality);
      const updatedTargetIcons = await browser.evaluate(cdp, calc, `(() => ({
        statePersonality:window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot().scenario.actors.self.personality,
        targetIcon:document.querySelector('.fdc-target-resonance-trigger img')?.getAttribute('src')||'',
        floatingIcon:document.querySelector('#fdc-floating-resonance-trigger img')?.getAttribute('src')||'',
        targetLoaded:!!document.querySelector('.fdc-target-resonance-trigger img')?.naturalWidth,
        floatingLoaded:!!document.querySelector('#fdc-floating-resonance-trigger img')?.naturalWidth
      }))()`);
      assert.equal(updatedTargetIcons.statePersonality, personality, `フロートから性格変更: ${personality}`);
      assert.match(updatedTargetIcons.targetIcon, new RegExp(`性格_${personality}\\.webp`), '通常対象表示の性格アイコンを同期');
      assert.match(updatedTargetIcons.floatingIcon, new RegExp(`性格_${personality}\\.webp`), 'フロート表示の性格アイコンを同期');
      assert.equal(updatedTargetIcons.targetLoaded, true, '通常対象アイコンを読み込む');
      assert.equal(updatedTargetIcons.floatingLoaded, true, 'フロートアイコンを読み込む');
    }
    await browser.evaluate(cdp, calc, 'window.scrollTo({top:0,behavior:"instant"})');
    await browser.waitFor(async () => browser.evaluate(cdp, calc,
      'document.querySelector("#fdc-floating-target")?.hidden === true'));
    await setFdcPersonality(cdp, calc, placedJoanneSlot, '');
    calcState = await readCalc(cdp, calc);
    assert.equal(calcState.personality || null, null, '保存済み未選択状態は自動補完しない');
    assert.equal(calcState.required, true, '未選択で通常/DPS計算停止');
    assert.equal(calcState.unavailable, 'resonance-selection-required', '通常計算の未選択結果');
    assert.equal(calcState.normalText, '—', '未選択中は通常計算結果を表示しない');
    assert.equal(calcState.dpsDisabled, true, '未選択中はDPS計算停止');
    if (placedJoanneSlot !== '1:0') await moveJoanne(cdp, calc, '1:0');

    if (await browser.evaluate(cdp, calc, 'document.querySelector("#fdc-formation-picker")?.hidden !== false')) {
      await browser.clickSelector(cdp, calc, '#fdc-target-preview');
    }
    await browser.clickSelector(cdp, calc, '#fdc-formation-picker [data-fdc-picker-mode="all"]');
    const alignedCards = await browser.evaluate(cdp, calc, `(() => {
      const reso = document.querySelector('#fdc-formation-picker .fdc-picker-slot.is-resonance');
      const normal = document.querySelector('#fdc-formation-picker .fdc-picker-slot:not(.is-resonance):not(.is-empty)');
      const rect = element => { const r = element?.getBoundingClientRect(); return r ? { width: r.width, height: r.height } : null; };
      const icon = reso?.parentElement?.querySelector('[data-fdc-resonance-personality-trigger]');
      const allRows = [...document.querySelectorAll('#fdc-formation-picker .fdc-picker-slot.is-filled')]
        .flatMap(card => [...card.querySelectorAll('.fdc-position-badge')])
        .filter(image => image.getAttribute('src')?.endsWith('配置列_全列.webp'));
      return {
        resonance: rect(reso), normal: rect(normal),
        wrapper: rect(reso?.parentElement), normalWrapper: rect(normal?.parentElement),
        iconSibling: !!icon && icon.parentElement === reso.parentElement && !reso.contains(icon),
        inlineSelects: document.querySelectorAll('.fdc-resonance-personality-control, .fdc-picker-member-choice select').length,
        resonanceLabels: [...document.querySelectorAll('.fdc-picker-slot.is-resonance')].some(card => /共鳴/.test(card.innerText)),
        aria: icon?.getAttribute('aria-label') || '', title: icon?.title || '',
        allRowIcon: allRows[0]?.getAttribute('src') || '', allRowIconLoaded: !!allRows[0]?.complete && allRows[0].naturalWidth > 0,
        allRowTextBadges: document.querySelectorAll('#fdc-formation-picker .fdc-position-text-badge').length
      };
    })()`);
    assert.ok(alignedCards.resonance && alignedCards.normal, `通常使徒・共鳴使徒のカードを表示: ${JSON.stringify(alignedCards)}`);
    assert.deepEqual(alignedCards.resonance, alignedCards.normal, '一覧カード外寸を通常使徒と共鳴使徒で統一');
    assert.deepEqual(alignedCards.wrapper, alignedCards.normalWrapper, 'カードラッパー寸法を統一');
    assert.equal(alignedCards.iconSibling, true, '性格ボタンはカードの兄弟要素でbutton入れ子なし');
    assert.equal(alignedCards.inlineSelects, 0, '一覧からカード下の性格selectを撤去');
    assert.equal(alignedCards.resonanceLabels, false, '共鳴の常設文字ラベルを撤去');
    assert.match(alignedCards.aria, /ジョアン.*共鳴性格/);
    assert.ok(alignedCards.title, '性格アイコンにツールチップ');
    assert.match(alignedCards.allRowIcon, /配置列_全列\.webp/, '未配置の全列使徒に既存全列画像');
    assert.equal(alignedCards.allRowIconLoaded, true, '全列画像をブラウザーで読み込む');
    assert.equal(alignedCards.allRowTextBadges, 0, '全列の文字代替を表示しない');
    await browser.clickSelector(cdp, calc, '#fdc-formation-picker [data-fdc-picker-mode="formation"]');

    const initialDarkVisual = await browser.evaluate(cdp, calc, `(() => {
      const card = document.querySelector('#fdc-formation-picker [data-fdc-resonance-personality-slot="1:0"]')?.closest('.fdc-picker-member-choice')?.querySelector('.fdc-picker-slot');
      const style = card ? getComputedStyle(card) : null;
      return { theme: document.body.classList.contains('theme-dark') ? 'dark' : 'light', background: style?.backgroundImage || '', border: style?.borderColor || '' };
    })()`);
    assert.equal(initialDarkVisual.theme, 'dark', '確認専用環境の初期保存テーマはダーク');
    assert.equal(initialDarkVisual.border, 'rgb(255, 255, 255)', '初期未選択枠は白');
    assert.ok(/linear-gradient/.test(initialDarkVisual.background), '初期ダーク虹背景');
    await capture(cdp, calc, 'joanne-calc-resonance-unselected-dark-1280.png');
    await setCalcTheme(cdp, calc, 'light');
    const lightVisual = await browser.evaluate(cdp, calc, `(() => {
      const card = document.querySelector('#fdc-formation-picker [data-fdc-resonance-personality-slot="1:0"]')?.closest('.fdc-picker-member-choice')?.querySelector('.fdc-picker-slot');
      const style = card ? getComputedStyle(card) : null;
      return { theme: document.body.classList.contains('theme-light') ? 'light' : 'dark', background: style?.backgroundImage || '', border: style?.borderColor || '', frame: style?.getPropertyValue('--fdc-resonance-frame-color').trim() || '', width: card?.getBoundingClientRect().width || 0, height: card?.getBoundingClientRect().height || 0 };
    })()`);
    assert.equal(lightVisual.theme, 'light', 'ライトを操作で切替');
    assert.equal(lightVisual.border, 'rgb(255, 255, 255)', `未選択共鳴カードは白枠: ${JSON.stringify(lightVisual)}`);
    assert.ok(/linear-gradient/.test(lightVisual.background), 'ライト専用のパステル虹背景');
    await capture(cdp, calc, 'joanne-calc-resonance-light-1280.png');
    const unselectedTargetBadge = await browser.evaluate(cdp, calc, `(() => {
      const target=document.querySelector('#fdc-target-preview');
      const icon=document.querySelector('.fdc-target-resonance-trigger img');
      return {resonance:target?.classList.contains('is-resonance'),unselected:target?.classList.contains('is-resonance-unselected'),
        icon:icon?.getAttribute('src') || '',loaded:!!icon?.complete && icon.naturalWidth>0};
    })()`);
    assert.equal(unselectedTargetBadge.resonance, true, '未選択後も対象の共鳴判定を維持');
    assert.equal(unselectedTargetBadge.unselected, true, '未選択対象を区別');
    assert.match(unselectedTargetBadge.icon, /性格_共鳴\.webp/, '未選択対象に共鳴アイコン');
    assert.equal(unselectedTargetBadge.loaded, true, '共鳴アイコン画像を読み込む');
    const iconSelector = '#fdc-formation-picker [data-fdc-resonance-personality-slot="1:0"]';
    if (await browser.evaluate(cdp, calc, 'document.querySelector("#fdc-formation-picker")?.hidden !== false')) {
      await browser.clickSelector(cdp, calc, '#fdc-target-preview');
    }
    if (await browser.evaluate(cdp, calc,
      'document.querySelector("#fdc-formation-picker [data-fdc-picker-mode=formation]")?.classList.contains("is-active") !== true')) {
      await browser.clickSelector(cdp, calc, '#fdc-formation-picker [data-fdc-picker-mode="formation"]');
    }
    await browser.clickSelector(cdp, calc, iconSelector);
    await browser.waitForSelector(cdp, calc, '#fdc-resonance-personality-dialog[open]');
    await pressKey(cdp, calc, 'Escape', 'Escape');
    await browser.waitFor(async () => browser.evaluate(cdp, calc,
      'document.querySelector("#fdc-resonance-personality-dialog")?.open === false'));
    await browser.waitFor(async () => browser.evaluate(cdp, calc,
      'document.activeElement?.dataset?.fdcResonancePersonalitySlot === "1:0"'));
    assert.equal(await browser.evaluate(cdp, calc, 'document.activeElement?.dataset?.fdcResonancePersonalitySlot || ""'), '1:0', 'Escapeキャンセル後に性格アイコンへフォーカス復帰');
    await browser.clickSelector(cdp, calc, iconSelector);
    await browser.waitForSelector(cdp, calc, '#fdc-resonance-personality-dialog[open]');
    await browser.waitFor(async () => browser.evaluate(cdp, calc,
      'document.activeElement?.matches("[data-fdc-resonance-personality-option]") === true'));
    await browser.evaluate(cdp, calc, `(() => {
      const dialog = document.querySelector('#fdc-resonance-personality-dialog');
      window.__joanneKeyProbe = [];
      ['keydown', 'keyup', 'click'].forEach(type => dialog.addEventListener(type, event => window.__joanneKeyProbe.push({ type, key: event.key || '', trusted: event.isTrusted, target: event.target?.outerHTML?.slice(0, 100) || '' }), { once: false }));
      return true;
    })()`);
    await pressKey(cdp, calc, 'Enter', 'Enter');
    const enterProbe = JSON.parse(await browser.evaluate(cdp, calc, `JSON.stringify({
      open: document.querySelector('#fdc-resonance-personality-dialog')?.open,
      active: document.activeElement?.outerHTML?.slice(0, 160) || '',
      probe: window.__joanneKeyProbe
    })`));
    assert.equal(enterProbe.open, false, `Enterでモーダル選択を確定: ${JSON.stringify(enterProbe)}`);
    assert.ok(enterProbe.probe.some(event => event.type === 'click' && event.trusted), 'Enterは実ブラウザのボタンactivateを発生させる');
    assert.equal((await readCalc(cdp, calc)).personality, '純粋', 'Enterでモーダルの初期候補を選択');
    await browser.clickSelector(cdp, calc, iconSelector);
    await browser.waitForSelector(cdp, calc, '#fdc-resonance-personality-dialog[open]');
    await pressKey(cdp, calc, 'Escape', 'Escape');
    await browser.waitFor(async () => browser.evaluate(cdp, calc,
      'document.querySelector("#fdc-resonance-personality-dialog")?.open === false'));
    assert.equal((await readCalc(cdp, calc)).personality, '純粋', '配置済み性格のモーダルをキャンセルすると現在値を維持');
    assert.equal(await browser.evaluate(cdp, calc,
      'document.activeElement?.matches("[data-fdc-resonance-personality-slot=\\\"1:0\\\"]") === true'), true, '性格変更キャンセル後に元アイコンへフォーカス復帰');

    const personalityFrames = [];
    for (const personality of ['純粋', '冷静', '狂気', '活発', '憂鬱']) {
      await setFdcPersonality(cdp, calc, '1:0', personality);
      personalityFrames.push(await browser.evaluate(cdp, calc, `(() => {
        const card = document.querySelector('#fdc-formation-picker [data-fdc-resonance-personality-slot="1:0"]')?.closest('.fdc-picker-member-choice')?.querySelector('.fdc-picker-slot');
        const style = card ? getComputedStyle(card) : null;
        return { personality: ${JSON.stringify(personality)}, border: style?.borderColor || '', frame: style?.getPropertyValue('--fdc-resonance-frame-color').trim() || '', background: style?.backgroundImage || '', outline: style?.outlineStyle || '' };
      })()`));
    }
    assert.equal(new Set(personalityFrames.map(item => item.border)).size, 5, `5性格の枠色が異なる: ${JSON.stringify(personalityFrames)}`);
    assert.ok(personalityFrames.every(item => item.outline === 'solid' && item.background.includes('gradient')), '操作強調outlineと性格枠・虹背景が共存');
    await capture(cdp, calc, 'joanne-calc-resonance-selected-light-1280.png');
    await setCalcTheme(cdp, calc, 'dark');
    const darkVisual = await browser.evaluate(cdp, calc, `(() => {
      const card = document.querySelector('#fdc-formation-picker [data-fdc-resonance-personality-slot="1:0"]')?.closest('.fdc-picker-member-choice')?.querySelector('.fdc-picker-slot');
      const style = card ? getComputedStyle(card) : null;
      return { theme: document.body.classList.contains('theme-dark') ? 'dark' : 'light', background: style?.backgroundImage || '', border: style?.borderColor || '' };
    })()`);
    assert.equal(darkVisual.theme, 'dark', 'ダークへ再読込なしで切替');
    assert.notEqual(darkVisual.background, lightVisual.background, 'ライト／ダークで異なる虹グラデーション');
    await capture(cdp, calc, 'joanne-calc-resonance-selected-dark-1280.png');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 844, deviceScaleFactor: 1, mobile: true }, calc.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, calc, 'innerWidth === 375'), { timeoutMs: 5000 });
    if (await browser.evaluate(cdp, calc, 'document.querySelector("#fdc-formation-picker")?.hidden !== false')) {
      await browser.clickSelector(cdp, calc, '#fdc-target-preview');
    }
    await browser.clickSelector(cdp, calc, '#fdc-formation-picker [data-fdc-picker-mode="all"]');
    const mobileCards = await browser.evaluate(cdp, calc, `(() => {
      const resonance = document.querySelector('#fdc-formation-picker .fdc-picker-slot.is-resonance');
      const normal = document.querySelector('#fdc-formation-picker .fdc-picker-slot:not(.is-resonance):not(.is-empty)');
      const rect = element => { const box = element?.getBoundingClientRect(); return box ? { width: box.width, height: box.height } : null; };
      return { theme: document.body.classList.contains('theme-dark') ? 'dark' : 'light', resonance: rect(resonance), normal: rect(normal), icon: !!resonance?.parentElement?.querySelector('[data-fdc-resonance-personality-trigger]') };
    })()`);
    assert.equal(mobileCards.theme, 'dark', 'スマホ幅でもテーマ状態を維持');
    assert.deepEqual(mobileCards.resonance, mobileCards.normal, '375pxでも通常／共鳴カード寸法を統一');
    assert.equal(mobileCards.icon, true, '375pxでも性格アイコン操作が見える');
    await capture(cdp, calc, 'joanne-calc-resonance-selected-dark-375.png');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, calc.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, calc, 'innerWidth === 1280'), { timeoutMs: 5000 });
    await browser.clickSelector(cdp, calc, '#fdc-formation-picker [data-fdc-picker-mode="formation"]');
    await setFdcPersonality(cdp, calc, '1:0', '冷静');

    await closeFormationPicker(cdp, calc);
    calcState = await readCalc(cdp, calc);
    assert.equal(calcState.personality, '冷静', 'calcで冷静を選択');
    assert.equal(calcState.required, false, '選択完了で計算停止を解除');
    assert.notEqual(calcState.normalText, '—', '選択後に通常計算結果を更新');
    assert.equal(calcState.dpsDisabled, true, '選択後もジョアンはDPS未対応のまま');
    assert.match(calcState.dpsAriaLabel, /利用不可|未対応/, 'DPS未対応をタブの状態通知へ反映');
    await browser.clickSelector(cdp, calc, '#fdc-target-preview');
    await setFdcPersonality(cdp, calc, '1:0', '狂気');
    calcState = await readCalc(cdp, calc);
    assert.equal(calcState.personality, '狂気', 'calc選択後の性格変更');
    await setFdcPersonality(cdp, calc, '1:0', '');
    calcState = await readCalc(cdp, calc);
    assert.equal(calcState.required, true, '選択→未選択で計算を再停止');
    assert.equal(calcState.normalText, '—', '選択→未選択で結果を消去');
    assert.equal(calcState.dpsDisabled, true, '選択→未選択でDPSを再停止');
    await setFdcPersonality(cdp, calc, '1:0', '冷静');
    await closeFormationPicker(cdp, calc);

    for (const [rowIndex, expectedPosition] of [[0, '後列'], [1, '中列'], [2, '前列']]) {
      const slot = await moveJoanne(cdp, calc, rowIndex);
      const moved = await readCalc(cdp, calc);
      const lineIndex = Number(slot.split(':')[1]);
      assert.equal(moved.formation.rows[rowIndex].apostles[lineIndex], 'Joanne', `${expectedPosition}: 一時配置`);
      assert.equal(moved.formation.rows[rowIndex].resonancePersonalities[lineIndex], '冷静', `${expectedPosition}: 性格を一緒に移動`);
      assert.equal(moved.position, expectedPosition, `${expectedPosition}: 実配置列を計算へ反映`);
    }

    const savedManagerState = await browser.evaluate(cdp, manager, `(() => {
      const state = window.TRICKCAL_STAT_ENGINE.getState();
      return state.savedFormations.map(item => ({ id: item.id, formation: item.formation }));
    })()`);
    const savedSourceBeforeEffects = JSON.stringify(savedManagerState);

    const hasUnavailablePassiveRequest = () => requests.some(url => /Skill_P_Joanne\.webp(?:\?|$)/i.test(url));
    assert.equal(hasUnavailablePassiveRequest(), false, '未提供パッシブ画像を要求しない');
    const joanneImages = await browser.evaluate(cdp, manager, `(() => [...document.querySelectorAll('img[src*="Joanne"]')]
      .map(image => ({ src: image.currentSrc || image.src, complete: image.complete, naturalWidth: image.naturalWidth })))()`);
    assert.ok(joanneImages.length > 0 && joanneImages.every(image => image.complete && image.naturalWidth > 0), '提供済みジョアン画像を読み込む');

    await setAsideRank(cdp, calc, 0);
    await selectSkill(cdp, calc, `candidate => Number(candidate.dataset.fdcSkillValue) === 200 && candidate.querySelector('.fdc-skill-choice-action')?.textContent.trim() === '普通攻撃'`);
    calcState = await readCalc(cdp, calc);
    assert.equal(calcState.result.detail.mods.skillP, 200, '通常攻撃倍率200%');
    assert.equal(calcState.legacyJoanneToggleCount, 0, '夢幻状態専用チェックなし');
    assert.equal(calcState.choices.some(choice => choice.value === 200 && choice.action === '普通攻撃'), true, '通常攻撃200%候補を表示');
    assert.equal(calcState.choices.some(choice => choice.value === 500 && choice.action === '普通攻撃〈夢幻の化身〉'), true, '夢幻中500%候補を通常攻撃と同時表示');
    assert.equal(calcState.choices.filter(choice => choice.active).length, 1, '通常／夢幻攻撃候補は一つだけ選択');

    const asideBonusKeyByKind = {
      最大HP増加: 'hpP',
      物理防御力増加: 'physicalDefP',
      魔法防御力増加: 'magicDefP',
      会心抵抗増加: 'critResP',
      会心ダメージ抵抗増加: 'critDmgResP',
      与ダメージ量増加: 'addP',
      被ダメージ量減少: 'takenDmgP'
    };
    const a1AsideExpected = Object.create(null);
    asideSnapshots.specialEffects
      .filter(effect => effect.rank === 1 && effect.valueClass === '倍率')
      .forEach(effect => {
        const key = asideBonusKeyByKind[effect.kind];
        if (key) a1AsideExpected[key] = (a1AsideExpected[key] || 0) + effect.value;
    });
    assert.equal(Object.keys(a1AsideExpected).length, 5, '生成データにあるA1の5種類の倍率補正を照合');
    const asideSummary = () => readCalc(cdp, calc).then(state => state.result.summary || {});
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    await setEnemyDamageType(cdp, calc, 'physical');
    const basePhysicalDefense = (await readCalc(cdp, calc)).result.detail.mods.defenseP;
    await setEnemyDamageType(cdp, calc, 'magic');
    const baseMagicDefense = (await readCalc(cdp, calc)).result.detail.mods.defenseP;
    const asideRank0Summary = await asideSummary();
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    await setAsideRank(cdp, calc, 1);
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    const asideRank1Summary = await asideSummary();
    for (const [key, value] of Object.entries(a1AsideExpected)) {
      assert.ok(Math.abs(((Number(asideRank1Summary[key]) || 0) - (Number(asideRank0Summary[key]) || 0)) - value) < 0.0001,
        `A1補正を通常計算へ一度適用: ${key} ${asideRank0Summary[key] || 0} -> ${asideRank1Summary[key] || 0}`);
    }
    await setEnemyDamageType(cdp, calc, 'physical');
    const a1PhysicalDefense = (await readCalc(cdp, calc)).result.detail.mods.defenseP;
    await setEnemyDamageType(cdp, calc, 'magic');
    const a1MagicDefense = (await readCalc(cdp, calc)).result.detail.mods.defenseP;
    assert.ok(Math.abs((a1PhysicalDefense - basePhysicalDefense) - (a1AsideExpected.physicalDefP || 0)) < 0.0001,
      'A1物理防御補正は物理攻撃へ一度だけ適用');
    assert.ok(Math.abs((a1MagicDefense - baseMagicDefense) - (a1AsideExpected.magicDefP || 0)) < 0.0001,
      'A1魔法防御補正は魔法攻撃へ一度だけ適用');
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    await setAsideRank(cdp, calc, 2);
    const asideRank2AttackSummary = await asideSummary();
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    const asideRank2Summary = await asideSummary();
    const a1AndA2MaxHpExpected = asideSnapshots.specialEffects
      .filter(effect => effect.rank <= 2 && effect.valueClass === '倍率' && effect.kind === '最大HP増加')
      .reduce((total, effect) => total + effect.value, 0);
    assert.ok(Math.abs(((Number(asideRank2Summary.hpP) || 0) - (Number(asideRank0Summary.hpP) || 0)) - a1AndA2MaxHpExpected) < 0.0001,
      `A1/A2最大HP効果がデータ通り累積し、二重計上しない: ${asideRank0Summary.hpP || 0} -> ${asideRank2Summary.hpP || 0}`);
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    await setAsideRank(cdp, calc, 3);
    const asideRank3AttackSummary = await asideSummary();
    const a3BattleExpected = Object.create(null);
    asideSnapshots.specialEffects
      .filter(effect => effect.rank === 3 && effect.valueClass === '倍率')
      .forEach(effect => {
        const key = asideBonusKeyByKind[effect.kind];
        if (key) a3BattleExpected[key] = (a3BattleExpected[key] || 0) + effect.value;
      });
    assert.ok((a3BattleExpected.addP || 0) > 0, 'A3の与ダメージ増加データを取得');
    assert.ok(Math.abs(((Number(asideRank3AttackSummary.addP) || 0) - (Number(asideRank2AttackSummary.addP) || 0)) - a3BattleExpected.addP) < 0.0001,
      'A3の味方与ダメージ増加を通常攻撃計算へ一度適用');
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    const asideRank3Summary = await asideSummary();
    const a3TakenDamageExpected = a3BattleExpected.takenDmgP || 0;
    assert.ok(a3TakenDamageExpected > 0, 'A3の被ダメージ減少データを取得');
    assert.ok(Math.abs(((Number(asideRank3Summary.takenDmgP) || 0) - (Number(asideRank2Summary.takenDmgP) || 0)) - a3TakenDamageExpected) < 0.0001,
      `A3の被ダメージ減少を通常計算へ一度適用: ${asideRank2Summary.takenDmgP || 0} -> ${asideRank3Summary.takenDmgP || 0}`);
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    await setAsideRank(cdp, calc, 0);
    await setEnemyDamageType(cdp, calc, 'auto');

    await selectSkill(cdp, calc, `candidate => Number(candidate.dataset.fdcSkillValue) === 500 && candidate.querySelector('.fdc-skill-choice-action')?.textContent.trim() === '普通攻撃〈夢幻の化身〉'`);
    calcState = await readCalc(cdp, calc);
    assert.equal(calcState.result.detail.mods.skillP, 500, '夢幻中は通常200%を500%へ置換');
    assert.notEqual(calcState.result.detail.mods.skillP, 700, '通常200%へ夢幻500%を加算しない');

    await selectSkill(cdp, calc, `candidate => Number(candidate.dataset.fdcSkillValue) === 200 && candidate.querySelector('.fdc-skill-choice-action')?.textContent.trim() === '普通攻撃'`);
    calcState = await readCalc(cdp, calc);
    assert.equal(calcState.result.detail.mods.skillP, 200, '通常状態へ戻る');
    const highSkillValue = await selectSkill(cdp, calc, `candidate => /高学年/.test(candidate.querySelector('.fdc-skill-choice-action')?.textContent || '')`);
    calcState = await readCalc(cdp, calc);
    assert.equal(calcState.legacyJoanneToggleCount, 0, '高学年選択用の隠れた夢幻トグルなし');
    assert.equal(calcState.result.detail.mods.skillP, highSkillValue, '高学年ダメージを別行動として計算');
    assert.equal(calcState.choices.filter(choice => choice.active).length, 1, '高学年選択時も攻撃候補は単一選択');

    await setAsideRank(cdp, calc, 0);
    await selectSkill(cdp, calc, `candidate => Number(candidate.dataset.fdcSkillValue) === 200 && /普通|通常|基本/.test(candidate.innerText)`);
    await moveJoanne(cdp, calc, '1:0');
    const middleEffectsAfterMove = await readSupportRows(cdp, calc, '/普通攻撃ダメージ量増加/');
    assert.equal(middleEffectsAfterMove.length, 1, '中列支援効果は現在列の1件だけ');
    assert.match(middleEffectsAfterMove[0].text, /20/);
    assert.equal(middleEffectsAfterMove[0].checked, false, '支援は配置だけで常時ONにならない');
    const normalBeforeSupport = (await readCalc(cdp, calc)).result.detail.mods.rawAddRate;
    await clickSupportRow(cdp, calc, '/普通攻撃ダメージ量増加/');
    let normalAfterSupport = (await readCalc(cdp, calc)).result.detail.mods.rawAddRate;
    const middleSupportDiagnostic = await readCalc(cdp, calc);
    assert.ok(Math.abs((normalAfterSupport - normalBeforeSupport) - 0.2) < 0.0001, `中列の普通攻撃補正20%のみ適用: ${normalBeforeSupport} -> ${normalAfterSupport}; ${JSON.stringify({ actionCategory: middleSupportDiagnostic.actionCategory, selectedSkillCategory: middleSupportDiagnostic.selectedSkillCategory, selectedSkillOptionKey: middleSupportDiagnostic.selectedSkillOptionKey, normalAttackAddP: middleSupportDiagnostic.normalAttackAddP, activeChoices: middleSupportDiagnostic.activeChoices, detailMods: middleSupportDiagnostic.result?.detail?.mods })}`);
    await setAsideRank(cdp, calc, 2);
    const middleEffectsA2 = await readSupportRows(cdp, calc, '/普通攻撃ダメージ量増加/');
    assert.equal(middleEffectsA2.length, 1, 'A2で通常効果を重複表示しない');
    assert.match(middleEffectsA2[0].text, /40/);
    assert.equal(middleEffectsA2[0].checked, false, 'A2の支援も手動選択');
    const normalBeforeA2Support = (await readCalc(cdp, calc)).result.detail.mods.rawAddRate;
    await clickSupportRow(cdp, calc, '/普通攻撃ダメージ量増加/');
    normalAfterSupport = (await readCalc(cdp, calc)).result.detail.mods.rawAddRate;
    assert.ok(Math.abs((normalAfterSupport - normalBeforeA2Support) - 0.4) < 0.0001, `A2は通常20%を40%へ置換: ${normalBeforeA2Support} -> ${normalAfterSupport}`);

    await selectSkill(cdp, calc, `candidate => Number(candidate.dataset.fdcSkillValue) === 200 && /普通|通常|基本/.test(candidate.innerText)`);
    const unscopedNormal = (await readCalc(cdp, calc)).result.detail.mods.rawAddRate;
    assert.ok(Math.abs(unscopedNormal - normalBeforeA2Support) < 0.0001, '選択行動の変更時に普通攻撃支援をスキルへ重ねない');

    await moveJoanne(cdp, calc, '0:0');
    await setAsideRank(cdp, calc, 0);
    const highSkillValueRear = await selectSkill(cdp, calc, `candidate => /高学年/.test(candidate.querySelector('.fdc-skill-choice-action')?.textContent || '')`);
    const rearEffects = await readSupportRows(cdp, calc, '/スキルダメージ量増加/');
    assert.equal(rearEffects.length, 1, '後列スキル支援は現在列の1件だけ');
    assert.match(rearEffects[0].text, /20/);
    assert.equal(rearEffects[0].checked, false, '後列の通常支援は配置だけでONにならない');
    const skillBeforeSupport = (await readCalc(cdp, calc)).result.detail.mods.rawAddRate;
    await clickSupportRow(cdp, calc, '/スキルダメージ量増加/');
    let skillAfterSupport = (await readCalc(cdp, calc)).result.detail.mods.rawAddRate;
    assert.ok(Math.abs((skillAfterSupport - skillBeforeSupport) - 0.2) < 0.0001, `後列のスキル補正20%: ${skillBeforeSupport} -> ${skillAfterSupport}`);
    await setAsideRank(cdp, calc, 2);
    const rearEffectsA2 = await readSupportRows(cdp, calc, '/スキルダメージ量増加/');
    assert.equal(rearEffectsA2.length, 1, '後列A2で通常効果を重複表示しない');
    assert.match(rearEffectsA2[0].text, /40/);
    assert.equal(rearEffectsA2[0].checked, false, '後列A2支援は手動選択');
    const skillBeforeA2Support = (await readCalc(cdp, calc)).result.detail.mods.rawAddRate;
    await clickSupportRow(cdp, calc, '/スキルダメージ量増加/');
    skillAfterSupport = (await readCalc(cdp, calc)).result.detail.mods.rawAddRate;
    assert.ok(Math.abs((skillAfterSupport - skillBeforeA2Support) - 0.4) < 0.0001, `後列/A2のスキル補正40%: ${skillBeforeA2Support} -> ${skillAfterSupport}`);
    assert.ok(highSkillValueRear >= 700, '後列検証に高学年スキルを使用');

    await moveJoanne(cdp, calc, 2);
    await selectSkill(cdp, calc, `candidate => Number(candidate.dataset.fdcSkillValue) === 200 && /普通|通常|基本/.test(candidate.innerText)`);
    await setAsideRank(cdp, calc, 0);
    await browser.evaluate(cdp, calc, `(() => {
      const input = document.querySelector('#fdc-enemy-atk');
      input.value = '1200';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    const frontEffectsBase = await readSupportRows(cdp, calc, '/ジョアンが前列に配置/');
    assert.equal(frontEffectsBase.length, 1, `前列通常効果を1件表示: ${JSON.stringify(frontEffectsBase)}`);
    assert.match(frontEffectsBase[0].text, /15/);
    assert.equal(frontEffectsBase[0].checked, false, '前列通常支援は手動選択');
    const incomingBaseBefore = (await readCalc(cdp, calc)).result.normal;
    await clickSupportRow(cdp, calc, '/ジョアンが前列に配置/');
    const incomingBaseAfter = (await readCalc(cdp, calc)).result.normal;
    assert.ok(incomingBaseAfter < incomingBaseBefore, `前列の被ダメージ減少15%を適用: ${incomingBaseBefore} -> ${incomingBaseAfter}`);
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    await setAsideRank(cdp, calc, 2);
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    const frontEffects = await readSupportRows(cdp, calc, '/ジョアンが前列に配置/');
    assert.equal(frontEffects.length, 1, '前列被ダメージ効果を1件表示');
    assert.match(frontEffects[0].text, /30/);
    assert.doesNotMatch(frontEffects[0].text, /15%/);
    assert.equal(frontEffects[0].checked, false, '前列支援を配置だけでONにしない');
    const incomingBefore = (await readCalc(cdp, calc)).result.normal;
    await clickSupportRow(cdp, calc, '/ジョアンが前列に配置/');
    const incomingAfter = (await readCalc(cdp, calc)).result.normal;
    assert.ok(incomingAfter < incomingBefore, `前列の被ダメージ減少が受けるダメージへ適用: ${incomingBefore} -> ${incomingAfter}`);
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');

    await selectSkill(cdp, calc, `candidate => /高学年/.test(candidate.querySelector('.fdc-skill-choice-action')?.textContent || '')`);
    await selectSkill(cdp, calc, `candidate => Number(candidate.dataset.fdcSkillValue) === 500 && candidate.querySelector('.fdc-skill-choice-action')?.textContent.trim() === '普通攻撃〈夢幻の化身〉'`);
    const automaticEffectsSummary = '#fdc-self-skill-effects .fdc-automatic-effect-details > summary';
    await browser.clickSelector(cdp, calc, automaticEffectsSummary);
    calcState = await readCalc(cdp, calc);
    assert.equal(calcState.result.detail.mods.skillP, 500, '選択した夢幻攻撃だけを適用し高学年から状態を進行させない');
    assert.match(calcState.skillEffectText, /攻撃速度増加[\s\S]*125/);
    assert.doesNotMatch(calcState.skillEffectText, /分散.*(?:90|配分)/, '未確定の分散配分を効果値として出さない');

    await selectSkill(cdp, calc, `candidate => Number(candidate.dataset.fdcSkillValue) === 200 && candidate.querySelector('.fdc-skill-choice-action')?.textContent.trim() === '普通攻撃'`);
    const dispersionRows = await readSupportRows(cdp, calc, '/分散中：攻撃力増加・被ダメージ量減少/');
    assert.equal(dispersionRows.length, 1, `分散の確定効果を編成スキル効果へ1行だけ表示: ${JSON.stringify({ dispersionRows, state: await readCalc(cdp, calc) })}`);
    assert.equal(dispersionRows[0].checked, false, '分散中の条件は初期OFF');
    assert.equal(dispersionRows[0].disabled, false, '編成スキルが有効なら手動選択できる');
    assert.match(dispersionRows[0].text, /25/);
    assert.match(dispersionRows[0].text, /10/);
    const dispersionBeforeState = await readCalc(cdp, calc);
    const dispersionBefore = dispersionBeforeState.result.summary.atkP || 0;
    const dispersionTakenBefore = dispersionBeforeState.result.summary.takenDmgP || 0;
    await clickSupportRow(cdp, calc, '/分散中：攻撃力増加・被ダメージ量減少/');
    const dispersionAfterState = await readCalc(cdp, calc);
    const dispersionAfter = dispersionAfterState.result.summary.atkP || 0;
    assert.equal(dispersionAfter - dispersionBefore, 25, `生成された低学年Lv値の攻撃補正を一度適用: ${dispersionBefore} -> ${dispersionAfter}`);
    assert.equal((dispersionAfterState.result.summary.takenDmgP || 0) - dispersionTakenBefore, 10, '被ダメージ量減少の生成値10%を同じ行へ統合');
    assert.equal(dispersionAfterState.legacyJoanneToggleCount, 0, '分散専用チェックを生成しない');
    assert.ok(!((await readCalc(cdp, calc)).result.additionalDamageComponents || []).some(item => /分散|90%/.test(JSON.stringify(item))), '分散配分・終了時回復を単発追加ダメージへ生成しない');

    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');
    const dispersedIncoming = (await readCalc(cdp, calc)).result.normal;
    await clickSupportRow(cdp, calc, '/分散中：攻撃力増加・被ダメージ量減少/');
    const undistributedIncoming = (await readCalc(cdp, calc)).result.normal;
    assert.ok(dispersedIncoming < undistributedIncoming, `防御側でも被ダメージ減少を適用: ${dispersedIncoming} < ${undistributedIncoming}`);
    await clickSupportRow(cdp, calc, '/分散中：攻撃力増加・被ダメージ量減少/');

    const formationSourceToggle = '#fdc-self-skill-effects [data-fdc-category-source="formationSkill"]';
    await browser.clickSelector(cdp, calc, formationSourceToggle);
    const disabledDispersion = await readSupportRows(cdp, calc, '/分散中：攻撃力増加・被ダメージ量減少/');
    assert.equal(disabledDispersion.length, 1, '編成スキルOFFでも行は表示');
    assert.equal(disabledDispersion[0].disabled, true, '編成スキルOFFでは分散補正を操作不可');
    assert.equal((await readCalc(cdp, calc)).result.summary.atkP || 0, dispersionBefore, '編成スキルOFFで分散補正も通常結果から除外');
    await browser.clickSelector(cdp, calc, formationSourceToggle);
    await browser.clickSelector(cdp, calc, '#fdc-perspective-toggle');

    const legacyMigrationFacts = await injectLegacyJoanneCalcChoices(cdp, calc);
    const legacyDispersionValue = await readCalc(cdp, calc);
    assert.equal(legacyDispersionValue.result.summary.atkP, 25, '旧分散ONを復元後も通常計算へ一度だけ適用');

    await selectApostleForCalc(cdp, calc, 'Amelia');
    await browser.clickSelector(cdp, calc, '#fdc-target-preview');
    const joanneSlotKey = await browser.evaluate(cdp, calc, `(() => {
      const rows = window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot().scenario.formationState.formation.rows || [];
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        const lineIndex = (rows[rowIndex].apostles || []).indexOf('Joanne');
        if (lineIndex >= 0) return String(rowIndex) + ':' + String(lineIndex);
      }
      return '';
    })()`);
    assert.ok(joanneSlotKey, '混在編成中のジョアン枠');
    const targetBeforeIcon = await readCalc(cdp, calc);
    const formationBeforeIcon = JSON.stringify(targetBeforeIcon.formation);
    const personalityIconSelector = `#fdc-formation-picker [data-fdc-resonance-personality-slot="${joanneSlotKey}"]`;
    await browser.clickSelector(cdp, calc, personalityIconSelector);
    await browser.waitForSelector(cdp, calc, '#fdc-resonance-personality-dialog[open]');
    const targetAfterIcon = await readCalc(cdp, calc);
    assert.equal(targetAfterIcon.targetId, 'Amelia', '別使徒の性格アイコン押下で親カード対象を切り替えない');
    assert.equal(JSON.stringify(targetAfterIcon.formation), formationBeforeIcon, '性格アイコン押下だけで配置を変更しない');
    await pressKey(cdp, calc, 'Escape', 'Escape');
    await browser.waitFor(async () => browser.evaluate(cdp, calc,
      'document.querySelector("#fdc-resonance-personality-dialog")?.open === false'));
    assert.equal((await readCalc(cdp, calc)).targetId, 'Amelia', '性格モーダルを閉じても元の計算対象を維持');

    const mixedFormation = await readCalc(cdp, calc);
    assert.ok(mixedFormation.formation.rows.some(row => (row.apostles || []).includes('Joanne')), '既存DPS使徒とジョアンの混在編成を維持');
    assert.equal(await browser.evaluate(cdp, calc, '!!window.DPS_TIMING_DATA?.apostles?.amelia'), true, '照合対象アメリアは既存DPSタイミング登録済み');
    const ameliaDpsBefore = JSON.parse(await readDpsActionProfiles(cdp, calc));
    assert.ok(Object.keys(ameliaDpsBefore).length, 'ジョアン同席時にも既存DPS使徒の行動プロファイルを生成');
    const ameliaDispersionRow = await readSupportRows(cdp, calc, '/分散中：攻撃力増加・被ダメージ量減少/');
    assert.equal(ameliaDispersionRow.length, 1, 'ジョアン同席時、他の計算対象にも個別の分散条件を表示');
    assert.equal(ameliaDispersionRow[0].checked, false, '別計算対象の分散条件は個別に初期OFF');
    const ameliaAtkBefore = (await readCalc(cdp, calc)).result.summary.atkP || 0;
    await clickSupportRow(cdp, calc, '/分散中：攻撃力増加・被ダメージ量減少/');
    const ameliaEnabled = await readCalc(cdp, calc);
    assert.equal((ameliaEnabled.result.summary.atkP || 0) - ameliaAtkBefore, 25, '分散補正は現在の計算対象へ適用');
    const ameliaDpsAfter = JSON.parse(await readDpsActionProfiles(cdp, calc));
    assert.deepEqual(ameliaDpsAfter, ameliaDpsBefore, '通常計算の分散選択を既存DPS行動プロファイルへ混入させない');
    assert.deepEqual(ameliaEnabled.dpsDispersionKeys, [], 'DPSシナリオに通常限定の分散キーを含めない');
    await clickSupportRow(cdp, calc, '/分散中：攻撃力増加・被ダメージ量減少/');

    const replacedJoanneBy = await displaceJoanneForUnplacedTest(cdp, calc, joanneSlotKey);
    assert.notEqual(replacedJoanneBy, 'Amelia', 'ジョアン除外fixtureはDPS対象と別の使徒を使用');
    await selectApostleForCalc(cdp, calc, 'Amelia');
    const noJoanneRows = await readSupportRows(cdp, calc, '/分散中：攻撃力増加・被ダメージ量減少/');
    assert.equal(noJoanneRows.length, 0, 'ジョアン不在の編成では分散行を表示しない');
    assert.ok(Object.keys(JSON.parse(await readDpsActionProfiles(cdp, calc))).length, 'ジョアン除外後も既存DPS使徒の入力を維持');

    const savedManagerAfterCalc = await browser.evaluate(cdp, manager, `(() => {
      const state = window.TRICKCAL_STAT_ENGINE.getState();
      return state.savedFormations.map(item => ({ id: item.id, formation: item.formation }));
    })()`);
    assert.equal(JSON.stringify(savedManagerAfterCalc), savedSourceBeforeEffects, 'calcの性格・配置・一時効果が保存済みmanager編成を変更しない');
    assert.ok(!hasUnavailablePassiveRequest(), 'パッシブ画像404要求なし');
    await capture(cdp, calc, 'joanne-calc-normal-damage-1280.png');

    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 844, deviceScaleFactor: 1, mobile: true }, calc.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, calc, 'innerWidth === 375'), { timeoutMs: 5000 });
    await capture(cdp, calc, 'joanne-calc-normal-damage-375.png');

    const result = {
      ok: true,
      browser: 'Chrome CDP / isolated profile',
      manager: ['マスター性格共鳴の維持', '初期未選択の下書き保存', '冷静/狂気の編成独立', '共有snapshot/プレビューの性格', '選択使徒画像読込'],
      calculator: ['通常対象・フロートの共鳴性格アイコン、独立操作、変更後同期、Escape後のフォーカス復帰', '未選択通常/DPS停止', '全列使徒の配置先選択と性格モーダルキャンセル', '性格変更キャンセル・確定後のフォーカス', 'PC/375pxカード整列・明暗テーマ配色', '一時性格の選択・変更・解除で結果更新', '一時性格を維持した前中後列移動', 'ジョアンのDPS未対応維持', '夢幻500%が通常200%を置換', '旧チェック値を攻撃選択／新条件へ安全移行', '高学年選択で状態を自動進行しない', '前/中/後列支援の15→30・20→40置換', '普通攻撃/スキルの適用先分離', '分散ON/OFF・編成スキルOFF・ジョアン不在', '通常計算分散選択の既存DPS対象からの分離', 'manager保存編成の不変'],
      images: { joanne: joanneImages.length, unavailablePassiveRequests: requests.filter(url => /Skill_P_Joanne\.webp(?:\?|$)/i.test(url)).length },
      screenshots: ['tmp/joanne-manager-formation-1280.png', 'tmp/joanne-calc-resonance-unselected-dark-1280.png', 'tmp/joanne-calc-resonance-light-1280.png', 'tmp/joanne-calc-resonance-selected-light-1280.png', 'tmp/joanne-calc-resonance-selected-dark-1280.png', 'tmp/joanne-calc-resonance-selected-dark-375.png', 'tmp/joanne-calc-resonance-floating-target-1280.png', 'tmp/joanne-calc-normal-damage-1280.png', 'tmp/joanne-calc-normal-damage-375.png'],
      presets: [unsetPreset.name, coldPreset.name, madPreset.name],
      legacyMigration: { target: legacyMigrationFacts.targetId, skillOption: legacyMigrationFacts.selectedSkillOptionKey, normalKey: legacyMigrationFacts.normalKey },
      share: shareFrameFacts
    };
    console.log(JSON.stringify(result));
  } finally {
    for (const page of pages) {
      try { if (cdp) await cdp.send('Target.closeTarget', { targetId: page.targetId }); } catch (_) {}
    }
    try { if (cdp) await cdp.send('Browser.close'); } catch (_) {}
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    await new Promise(resolve => server.close(resolve));
    await browser.sleep(200);
    try { fs.rmSync(profileRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch (_) {}
  }
}

if (require.main === module) {
  run().catch(error => {
    process.stderr.write(`${error.stack || error}\n`);
    process.exitCode = 1;
  });
}

module.exports = { run };
