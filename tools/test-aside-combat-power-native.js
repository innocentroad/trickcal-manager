#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };

async function run() {
  const port = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([port]);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-aside-power-'));
  const server = http.createServer((request, response) => {
    const relative = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end(); return;
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(fs.readFileSync(file));
  }).listen(port, '127.0.0.1');
  let chrome, cdp;
  try {
    chrome = browser.startChild(browser.findChrome(), [
      `--user-data-dir=${profile}`, `--remote-debugging-port=${cdpPort}`,
      '--remote-debugging-address=127.0.0.1', '--no-first-run', '--no-default-browser-check',
      '--disable-sync', '--disable-extensions', '--disable-background-networking', 'about:blank'
    ], root);
    const version = await browser.waitFor(async () => {
      const response = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
      return response.ok ? response.json() : null;
    }, { timeoutMs: 30000 });
    cdp = new browser.CdpClient(version.webSocketDebuggerUrl);
    await cdp.connect();
    const page = await browser.createPage(cdp, `http://127.0.0.1:${port}/stat-dashboard.html?view=settings`);
    await cdp.send('Page.enable', {}, page.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, page,
      `document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_STAT_ENGINE && !!window.TRICKCAL_STAT_DATA`),
    { timeoutMs: 30000 });
    const result = await browser.evaluate(cdp, page, `(() => {
      const api = window.TRICKCAL_STAT_ENGINE;
      const engine = window.TRICKCAL_SHARED_STAT_ENGINE;
      const data = window.TRICKCAL_STAT_DATA;
      const basic = data.getById('basicInfo', 'Kyarot');
      const grades = [0, 1, 2, 3].map(asideRank => {
        const state = { grade: 1, asideRank, asideLevel: asideRank ? [0, 30, 40, 50][asideRank] : 0,
          skillLevels: { low: 1, high: 1, passive: 1 } };
        const { snapshot } = api.calculateApostleStats('Kyarot', state,
          { combatPowerTotals: true, captureInternalTotals: true });
        const aside = engine.calculateAsideContribution(data, basic, state);
        return { asideRank, power: snapshot.stats.combatPower,
          expectedPower: engine.calculateCombatPower(basic, state, snapshot.internalTotals),
          hp: snapshot.breakdown.asideManifest.hp + snapshot.breakdown.asideLevel.hp,
          expectedHp: aside.total.hp,
          base: snapshot.breakdown.asideManifest.hp,
          growth: snapshot.breakdown.asideLevel.hp,
          rawHp: snapshot.internalTotals.hp, shownHp: snapshot.stats.hp,
          breakdownHp: Object.entries(snapshot.breakdown).filter(([key]) => key !== 'globalPercent')
            .reduce((sum, [, totals]) => sum + Number(totals.hp || 0), 0)
            + Number(snapshot.breakdown.globalPercent?.hp || 0) };
      });
      const state = { level: 1, star: 3, grade: 1, rank: 1, bond: 1,
        asideRank: 3, asideLevel: 1, equipment: {}, skillLevels: { low: 1, high: 1, passive: 1 } };
      const saved = api.calculateApostleStats('Kyarot', state, { captureInternalTotals: true }).snapshot;
      const joanneState = { level: 1, star: 3, grade: 1, rank: 1, bond: 1,
        asideRank: 0, asideLevel: 0, equipment: {}, skillLevels: { low: 1, high: 1, passive: 1 } };
      const joanneSnapshot = api.calculateApostleStats('Joanne', joanneState,
        { captureInternalTotals: true }).snapshot;
      const expected = api.calculateApostleStats('Kyarot', { ...state, asideLevel: 4 }, { captureInternalTotals: true }).snapshot;
      const legacy = JSON.parse(JSON.stringify(saved));
      delete legacy.calculationVersion;
      const legacyMatchesSaved = engine.canRebuildLegacySnapshot(data, basic, state, legacy);
      const legacyRejectsOtherLevel = engine.canRebuildLegacySnapshot(data, basic, { ...state, level: 2 }, legacy);
      const changed = engine.applyApostleOverridesToSnapshot(data, basic, state,
        { snapshot: legacy, overrides: { asideLevel: 4 } });
      const repeated = engine.applyApostleOverridesToSnapshot(data, basic, state,
        { snapshot: changed, overrides: { asideLevel: 4 } });
      const reverted = engine.applyApostleOverridesToSnapshot(data, basic, state,
        { snapshot: changed, overrides: { asideLevel: 1 } });
      const newSlotStats = engine.encodeComparisonStatSnapshots({ Kyarot: { statSnapshots: { current: expected } },
        Joanne: { statSnapshots: { current: joanneSnapshot } } });
      return { grades, title: document.title, legacySnapshot: legacy, newSlotStats,
        joanneState, joanneSnapshot,
        legacyMatchesSaved, legacyRejectsOtherLevel, override: {
        savedHp: saved.stats.hp, expectedHp: expected.stats.hp, changedHp: changed?.stats.hp,
        repeatedHp: repeated?.stats.hp, revertedHp: reverted?.stats.hp,
        crossAsideRankBlocked: engine.applyApostleOverridesToSnapshot(data, basic, state,
          { snapshot: saved, overrides: { asideRank: 2 } }) === null,
        gradeHp: engine.applyGradeOverrideToSnapshot(data, basic, state,
          { snapshot: saved, grade: 2 })?.stats.hp,
        directGradeHp: api.calculateApostleStats('Kyarot', { ...state, grade: 2 }).snapshot.stats.hp
      } };
    })()`);
    for (const grade of result.grades) {
      assert.equal(grade.power, grade.expectedPower, `A${grade.asideRank}: manager/shared power`);
      assert.ok(Math.abs(grade.hp - grade.expectedHp) < 1e-7, `A${grade.asideRank}: manager/shared aside`);
      assert.ok(Math.abs(grade.breakdownHp - grade.rawHp) < 1e-7, `A${grade.asideRank}: complete breakdown is internal HP`);
    }
    assert.equal(result.grades[0].hp, 0, 'unreleased aside');
    assert.ok(result.grades[3].hp > result.grades[2].hp, 'A3 amount');
    assert.ok(result.grades.some(grade => grade.rawHp !== grade.shownHp), 'internal decimals are not display integers');
    assert.equal(result.override.expectedHp, 5011, 'review reproduction direct HP');
    assert.equal(result.legacyMatchesSaved, true, 'matching saved growth settings allow legacy reconstruction');
    assert.equal(result.legacyRejectsOtherLevel, false, 'mismatched saved level blocks automatic migration');
    assert.equal(result.override.changedHp, result.override.expectedHp, 'override equals direct calculation');
    assert.equal(result.override.repeatedHp, result.override.expectedHp, 'repeated override does not drift');
    assert.equal(result.override.revertedHp, result.override.savedHp, 'revert restores saved HP');
    assert.equal(result.override.crossAsideRankBlocked, true, 'A3 party-rate change cannot reuse the old global rate');
    assert.equal(result.override.gradeHp, result.override.directGradeHp, 'grade override keeps fractions');
    await cdp.send('Target.closeTarget', { targetId: page.targetId });
    const seed = await browser.createPage(cdp, `http://127.0.0.1:${port}/enemy-status.html`);
    await browser.waitFor(async () => browser.evaluate(cdp, seed,
      `location.pathname === '/enemy-status.html' && document.readyState === 'complete'`),
    { timeoutMs: 30000 });
    await browser.evaluate(cdp, seed, `(() => {
      const state = { level: 1, star: 3, grade: 1, rank: 1, bond: 1,
        asideRank: 3, asideLevel: 1, equipment: {}, skillLevels: { low: 1, high: 1, passive: 1 } };
      const snapshot = ${JSON.stringify(result.legacySnapshot)};
      snapshot.stats.hp = 0; // A legacy display value must be rebuilt, never trusted.
      const planned = JSON.parse(JSON.stringify(snapshot));
      planned.kind = 'planned';
      planned.breakdown.boardBasic.hp = 1;
      planned.boardDiff = { changed: { 1: { fixture: true } } };
      const saved = { activeId: 'Kyarot', apostles: { Kyarot: { ...state,
        boards: {}, plannedBoards: { 1: { filled: { fixture: true } } },
        statSnapshots: { current: snapshot, planned }, finalStats: snapshot.stats },
        Joanne: { ...${JSON.stringify(result.joanneState)}, statSnapshots: {
          current: ${JSON.stringify(result.joanneSnapshot)} } } },
        formation: { rows: [{ apostles: ['Kyarot', '', ''] }, {},
          { apostles: ['', 'Joanne', ''], resonancePersonalities: [null, '純粋', null] }] } };
      localStorage.setItem('trickcal_stat_prototype_v1', JSON.stringify(saved));
      const oldCompact = [Array(11).fill(99999), Array(10).fill(0), Array(10).fill(0), Array(10).fill(0)];
      const slot = { activeId: 'Kyarot', apostles: { Kyarot: { ...state,
          boards: {}, plannedBoards: { 1: { filled: { fixture: true } } } },
          Joanne: { ...${JSON.stringify(result.joanneState)} } },
        research: {}, formation: saved.formation, cards: {},
        comparisonStats: { v: 1, a: { Kyarot: [oldCompact, oldCompact] } } };
      const currentSlot = { ...slot, apostles: { Kyarot: { ...state, asideLevel: 4 } },
        comparisonStats: ${JSON.stringify(result.newSlotStats)} };
      const missingGrowthSlot = JSON.parse(JSON.stringify(slot));
      delete missingGrowthSlot.apostles.Kyarot.level;
      localStorage.setItem('trickcal_stat_slots_v2', JSON.stringify({ schemaVersion: 2,
        storeRevision: 3, slots: { 1: { snapshot: slot, slotRevision: 1, savedAt: '2026-09-26T00:00:00Z' },
          2: { snapshot: currentSlot, slotRevision: 1, savedAt: '2026-09-26T00:00:00Z' },
          3: { snapshot: missingGrowthSlot, slotRevision: 1, savedAt: '2026-09-26T00:00:00Z' } } }));
      localStorage.setItem('trickcal_formation_damage_result_saves_v1', JSON.stringify([{
        id: 'old-calc', name: '旧計算', savedAt: 1, snapshot: {
          version: 4, view: { targetId: 'Kyarot', statMode: 'current', gradeOverride: 'saved' },
          referenceState: saved, result: { expected: 999999 }, comparison: { dpsSnapshot: {} }
        }
      }]));
      return true;
    })()`);
    await cdp.send('Target.closeTarget', { targetId: seed.targetId });
    const calc = await browser.createPage(cdp, `http://127.0.0.1:${port}/formation-damage-calc.html`);
    await cdp.send('Page.enable', {}, calc.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, calc,
      `document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_DAMAGE_CALC`),
    { timeoutMs: 30000 });
    const loaded = await browser.evaluate(cdp, calc, `(() => {
      const raw = JSON.parse(window.TRICKCAL_STORAGE_FACADE.localStorage.getItem('trickcal_stat_prototype_v1'));
      const working = window.TRICKCAL_DAMAGE_CALC.captureCombatScenario()?.characterState?.apostles?.Kyarot;
      return { version: working?.statSnapshots?.current?.calculationVersion,
        hp: working?.statSnapshots?.current?.stats?.hp,
        power: working?.statSnapshots?.current?.stats?.combatPower,
        plannedVersion: working?.statSnapshots?.planned?.calculationVersion,
        plannedHp: working?.statSnapshots?.planned?.stats?.hp,
        updatedAt: working?.statSnapshots?.current?.updatedAt,
        sourceVersion: raw?.apostles?.Kyarot?.statSnapshots?.current?.calculationVersion,
        target: window.TRICKCAL_DAMAGE_CALC.captureCombatScenario().actors.self.id,
        savedFormationId: raw.formation?.rows?.[0]?.apostles?.[0],
        resonanceSelection: raw.formation?.rows?.[2]?.resonancePersonalities?.[1],
        rawKeys: Object.keys(raw || {}), stateKeys: Object.keys(raw?.apostles?.Kyarot || {}),
        status: document.querySelector('#fdc-result-detail-note')?.textContent };
    })()`);
    assert.equal(loaded.version, 2, `direct calc entry rebuilds old full snapshot in memory: ${JSON.stringify(loaded)}`);
    assert.equal(loaded.sourceVersion, undefined, 'calculator does not overwrite manager state');
    assert.equal(loaded.hp, result.override.savedHp, `legacy display value replaced on direct load: ${JSON.stringify(loaded)}`);
    assert.equal(loaded.power, result.legacySnapshot.stats.combatPower, 'old combat power recalculated from internal values');
    assert.equal(loaded.savedFormationId, 'Kyarot', 'saved formation is preserved');
    assert.equal(loaded.resonanceSelection, '純粋', 'saved resonance choice is preserved');
    assert.equal(loaded.plannedVersion, undefined, 'unverifiable old planned board value remains legacy');
    await browser.clickSelector(cdp, calc, '#fdc-target-preview');
    await browser.clickSelector(cdp, calc, '[data-fdc-member-id="Kyarot"]');
    const plannedUi = await browser.evaluate(cdp, calc, `(() => {
      const select = document.querySelector('#fdc-stat-mode');
      select.value = 'planned';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      const hp = Number(document.querySelector('#fdc-self-hp').value);
      const plannedResult = document.querySelector('#fdc-result-normal')?.textContent;
      const plannedNote = document.querySelector('#fdc-result-detail-note')?.textContent;
      select.value = 'current';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { hp, plannedResult, plannedNote,
        currentHp: Number(document.querySelector('#fdc-self-hp').value) };
    })()`);
    assert.equal(plannedUi.plannedResult, '—', 'unverifiable planned board result is blocked');
    assert.match(plannedUi.plannedNote, /再計算/);
    assert.equal(plannedUi.currentHp, loaded.hp, 'current UI returns to current snapshot');
    const enemy = await browser.evaluate(cdp, calc, `(() => {
      const change = (selector, value) => {
        const node = document.querySelector(selector);
        node.value = value;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      };
      change('#fdc-enemy-source-mode', 'apostle');
      change('#fdc-enemy-apostle', 'Kyarot');
      const savedHp = Number(document.querySelector('#fdc-enemy-hp').value);
      change('[data-fdc-enemy-individual-field="asideLevel"]', '4');
      const changedHp = Number(document.querySelector('#fdc-enemy-hp').value);
      change('[data-fdc-enemy-individual-field="asideLevel"]', '1');
      const revertedHp = Number(document.querySelector('#fdc-enemy-hp').value);
      change('[data-fdc-enemy-individual-field="asideLevel"]', '4');
      return { savedHp, changedHp, revertedHp,
        repeatedHp: Number(document.querySelector('#fdc-enemy-hp').value) };
    })()`);
    assert.equal(enemy.savedHp, result.override.savedHp, 'enemy saved HP');
    assert.equal(enemy.changedHp, result.override.expectedHp, 'actual enemy override HP');
    assert.equal(enemy.revertedHp, enemy.savedHp, 'enemy override revert');
    assert.equal(enemy.repeatedHp, enemy.changedHp, 'enemy override repeated');
    await browser.clickSelector(cdp, calc, '#fdc-compare-float-toggle');
    const slotSelection = await browser.evaluate(cdp, calc, `(() => {
      const source = document.querySelector('#fdc-compare-source');
      const option = [...source.options].find(item => item.value === 'slot:1');
      if (!option) return { available: false };
      source.value = option.value;
      source.dispatchEvent(new Event('change', { bubbles: true }));
      return { available: true, value: source.value };
    })()`);
    assert.equal(slotSelection.available, true, 'legacy slot offered for comparison without deletion');
    await browser.clickSelector(cdp, calc, '#fdc-pinned-compare-save');
    const slotNote = await browser.evaluate(cdp, calc,
      `document.querySelector('#fdc-pinned-compare-note')?.textContent || ''`);
    assert.match(slotNote, /旧形式|再保存/, 'legacy slot cannot masquerade as current values');
    const modernSelection = await browser.evaluate(cdp, calc, `(() => {
      const source = document.querySelector('#fdc-compare-source');
      source.value = 'slot:2';
      source.dispatchEvent(new Event('change', { bubbles: true }));
      return source.value;
    })()`);
    assert.equal(modernSelection, 'slot:2');
    await browser.clickSelector(cdp, calc, '#fdc-pinned-compare-save');
    const modernNote = await browser.evaluate(cdp, calc,
      `document.querySelector('#fdc-pinned-compare-note')?.textContent || ''`);
    assert.doesNotMatch(modernNote, /旧形式|再保存/, 'v2 slot uses its saved snapshot');
    assert.match(modernNote, /スロット2/, 'v2 comparison starts from selected slot');
    const oldCalculation = await browser.evaluate(cdp, calc, `(() => {
      const source = document.querySelector('#fdc-compare-source');
      source.value = 'calc:old-calc';
      source.dispatchEvent(new Event('change', { bubbles: true }));
      return source.value;
    })()`);
    assert.equal(oldCalculation, 'calc:old-calc');
    await browser.clickSelector(cdp, calc, '#fdc-pinned-compare-save');
    const oldCalculationNote = await browser.evaluate(cdp, calc,
      `document.querySelector('#fdc-pinned-compare-note')?.textContent || ''`);
    assert.doesNotMatch(oldCalculationNote, /999,?999/, 'legacy damage result is never reused as baseline');
    assert.match(oldCalculationNote, /旧計算|再計算/, 'legacy damage save is re-evaluated or explicitly blocked');
    const oldPinned = await browser.evaluate(cdp, calc, `(() => {
      const storage = window.TRICKCAL_STORAGE_FACADE.sessionStorage;
      const key = 'trickcal_combat_comparison_session_v1';
      const session = JSON.parse(storage.getItem(key));
      delete session.baseline.scenario.sourceMeta.statCalculationVersion;
      storage.setItem(key, JSON.stringify(session));
      return true;
    })()`);
    assert.equal(oldPinned, true);
    await cdp.send('Page.reload', {}, calc.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, calc,
      `document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_DAMAGE_CALC && !!window.TRICKCAL_STORAGE_FACADE?.sessionStorage`),
    { timeoutMs: 30000 });
    const oldPinnedNote = await browser.evaluate(cdp, calc,
      `document.querySelector('#fdc-pinned-compare-note')?.textContent || ''`);
    assert.doesNotMatch(oldPinnedNote, /期待値/, `legacy pinned result must not appear current: ${oldPinnedNote}`);
    await browser.evaluate(cdp, calc,
      `sessionStorage.removeItem('trickcal_combat_comparison_session_v1')`);
    await cdp.send('Target.closeTarget', { targetId: calc.targetId });
    const reloadedPage = await browser.createPage(cdp, `http://127.0.0.1:${port}/formation-damage-calc.html`);
    await browser.waitFor(async () => browser.evaluate(cdp, reloadedPage,
      `document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_DAMAGE_CALC`),
    { timeoutMs: 30000 });
    const reloaded = await browser.evaluate(cdp, reloadedPage, `(() => {
      const saved = JSON.parse(localStorage.getItem('trickcal_stat_prototype_v1')).apostles.Kyarot;
      return { hp: saved.statSnapshots.current.stats.hp, updatedAt: saved.statSnapshots.current.updatedAt,
        enemyHp: Number(document.querySelector('#fdc-enemy-hp').value), asideRank: saved.asideRank,
        enemyMode: document.querySelector('#fdc-enemy-source-mode')?.value,
        note: document.querySelector('#fdc-result-detail-note')?.textContent };
    })()`);
    assert.equal(reloaded.hp, 0, 'legacy source is left intact until manager resave');
    assert.equal(reloaded.asideRank, 3, 'growth settings preserved');
    assert.equal(reloaded.enemyHp, result.override.expectedHp,
      `saved enemy override survives reload without another action: ${JSON.stringify(reloaded)}`);
    await cdp.send('Target.closeTarget', { targetId: reloadedPage.targetId });
    const incompleteSeed = await browser.createPage(cdp, `http://127.0.0.1:${port}/enemy-status.html`);
    await browser.waitFor(async () => browser.evaluate(cdp, incompleteSeed,
      `location.pathname === '/enemy-status.html' && document.readyState === 'complete'`),
    { timeoutMs: 30000 });
    await browser.evaluate(cdp, incompleteSeed, `(() => {
      const state = JSON.parse(localStorage.getItem('trickcal_stat_prototype_v1'));
      state.apostles.Kyarot.statSnapshots.current = { kind: 'legacyIncomplete', stats: { hp: 99999,
        physicalAtk: 99999, magicAtk: 99999, combatPower: 99999 },
        breakdown: { base: { hp: 2184 }, globalPercent: { hp: 0 } }, globalPercentRates: {} };
      state.apostles.Kyarot.finalStats = { hp: 99999, magicAtk: 99999 };
      localStorage.setItem('trickcal_stat_prototype_v1', JSON.stringify(state));
      return true;
    })()`);
    await cdp.send('Target.closeTarget', { targetId: incompleteSeed.targetId });
    const incompletePage = await browser.createPage(cdp, `http://127.0.0.1:${port}/formation-damage-calc.html`);
    await browser.waitFor(async () => browser.evaluate(cdp, incompletePage,
      `document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_DAMAGE_CALC`),
    { timeoutMs: 30000 });
    await browser.clickSelector(cdp, incompletePage, '#fdc-target-preview');
    await browser.clickSelector(cdp, incompletePage, '[data-fdc-member-id="Kyarot"]');
    await browser.waitFor(async () => browser.evaluate(cdp, incompletePage,
      `/再計算/.test(document.querySelector('#fdc-result-detail-note')?.textContent || '')`),
    { timeoutMs: 10000 });
    const incomplete = await browser.evaluate(cdp, incompletePage, `(() => ({
      result: document.querySelector('#fdc-result-normal')?.textContent,
      note: document.querySelector('#fdc-result-detail-note')?.textContent,
      detail: document.querySelector('#fdc-result-detail-grid')?.textContent?.slice(0, 220),
      scenarioHp: window.TRICKCAL_DAMAGE_CALC.captureCombatScenario()?.characterState?.apostles?.Kyarot?.statSnapshots?.current?.stats?.hp,
      targetId: window.TRICKCAL_DAMAGE_CALC.captureCombatScenario()?.actors?.self?.id,
      dpsState: window.TRICKCAL_DAMAGE_CALC.createDpsEvaluationInput()?.statRecalculationRequired,
      targetStats: window.TRICKCAL_DAMAGE_CALC.createDpsEvaluationInput()?.target?.stats,
      hp: JSON.parse(localStorage.getItem('trickcal_stat_prototype_v1')).apostles.Kyarot.statSnapshots.current.stats.hp
    }))()`);
    assert.match(incomplete.note, /再計算/, JSON.stringify(incomplete));
    assert.equal(incomplete.result, '—', 'incomplete legacy stats are not shown as normal damage');
    assert.equal(incomplete.dpsState, true, 'DPS input is blocked too');
    assert.equal(incomplete.hp, 99999, 'incomplete source remains untouched, not silently normalized');
    const gradeBlocked = await browser.evaluate(cdp, incompletePage, `(() => {
      const select = document.querySelector('#fdc-grade-override');
      select.value = '2';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { result: document.querySelector('#fdc-result-normal')?.textContent,
        note: document.querySelector('#fdc-result-detail-note')?.textContent };
    })()`);
    assert.equal(gradeBlocked.result, '—', 'grade override cannot turn incomplete snapshot into a valid value');
    await cdp.send('Target.closeTarget', { targetId: incompletePage.targetId });
    const managerRecovery = await browser.createPage(cdp, 'about:blank');
    const managerErrors = [];
    await cdp.send('Runtime.enable', {}, managerRecovery.sessionId);
    cdp.on(managerRecovery.sessionId, 'Runtime.exceptionThrown', params => {
      managerErrors.push(params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || '');
    });
    cdp.on(managerRecovery.sessionId, 'Runtime.consoleAPICalled', params => {
      if (params.type === 'error') managerErrors.push((params.args || []).map(arg => arg.description || arg.value || '').join(' '));
    });
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/stat-dashboard.html?view=settings` }, managerRecovery.sessionId);
    await browser.waitFor(async () => browser.evaluate(cdp, managerRecovery,
      `document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_STAT_ENGINE`),
    { timeoutMs: 30000 });
    try {
      await browser.waitFor(async () => browser.evaluate(cdp, managerRecovery,
        `!document.body.classList.contains('is-booting')`), { timeoutMs: 10000 });
    } catch {}
    const managerBoot = await browser.evaluate(cdp, managerRecovery, `({
      className: document.body.className, storageError: document.documentElement.dataset.storageError,
      stateStatus: document.querySelector('#state-status')?.textContent,
      slotStore: localStorage.getItem('trickcal_stat_slots_v2')?.slice(0, 200)
    })`);
    assert.doesNotMatch(managerBoot.className, /is-booting/, JSON.stringify({ managerBoot, managerErrors }));
    await browser.evaluate(cdp, managerRecovery, `(() => {
      window.confirm = () => true;
      document.querySelector('.bottom-save-menu').open = true;
      return true;
    })()`);
    await browser.clickSelector(cdp, managerRecovery, '#load-state-slot');
    await browser.clickSelector(cdp, managerRecovery, '[data-state-slot="1"]');
    await browser.waitFor(async () => browser.evaluate(cdp, managerRecovery, `(() => {
      const state = JSON.parse(localStorage.getItem('trickcal_stat_prototype_v1') || '{}');
      return state.apostles?.Kyarot?.statSnapshots?.current?.calculationVersion === 2;
    })()`), { timeoutMs: 30000 });
    await browser.clickSelector(cdp, managerRecovery, '.bottom-save-menu > summary');
    await browser.clickSelector(cdp, managerRecovery, '#save-state-slot');
    await browser.clickSelector(cdp, managerRecovery, '[data-state-slot="1"]');
    await browser.waitFor(async () => browser.evaluate(cdp, managerRecovery, `(() => {
      const store = JSON.parse(localStorage.getItem('trickcal_stat_slots_v2') || '{}');
      return store.slots?.['1']?.snapshot?.comparisonStats?.v === 2;
    })()`), { timeoutMs: 30000 });
    const recovered = await browser.evaluate(cdp, managerRecovery, `(() => {
      const store = JSON.parse(localStorage.getItem('trickcal_stat_slots_v2'));
      const saved = store.slots['1'].snapshot;
      const state = JSON.parse(localStorage.getItem('trickcal_stat_prototype_v1'));
      return { slotVersion: saved.comparisonStats.v, level: saved.apostles.Kyarot.level,
        formationId: saved.formation.rows[0].apostles[0],
        resonanceSelection: saved.formation.rows[2].resonancePersonalities[1],
        asideRank: saved.apostles.Kyarot.asideRank,
        asideLevel: saved.apostles.Kyarot.asideLevel,
        plannedBoards: saved.apostles.Kyarot.plannedBoards,
        plannedCompact: !!saved.comparisonStats.a?.Kyarot?.[1],
        hp: state.apostles.Kyarot.statSnapshots.current.stats.hp };
    })()`);
    assert.equal(recovered.slotVersion, 2);
    assert.equal(recovered.level, 1);
    assert.equal(recovered.formationId, 'Kyarot');
    assert.equal(recovered.resonanceSelection, '純粋');
    assert.equal(recovered.asideRank, 3);
    assert.equal(recovered.asideLevel, 1);
    assert.deepEqual(recovered.plannedBoards, { 1: { filled: { fixture: true } } });
    assert.equal(recovered.plannedCompact, true, 'planned snapshot remains distinct after manager resave');
    assert.equal(recovered.hp, loaded.hp);
    await cdp.send('Target.closeTarget', { targetId: managerRecovery.targetId });
    const afterRecovery = await browser.createPage(cdp, `http://127.0.0.1:${port}/formation-damage-calc.html`);
    await browser.waitFor(async () => browser.evaluate(cdp, afterRecovery,
      `document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_DAMAGE_CALC`),
    { timeoutMs: 30000 });
    await browser.clickSelector(cdp, afterRecovery, '#fdc-compare-float-toggle');
    await browser.evaluate(cdp, afterRecovery, `(() => {
      const source = document.querySelector('#fdc-compare-source');
      source.value = 'slot:1'; source.dispatchEvent(new Event('change', { bubbles: true }));
      return source.value;
    })()`);
    await browser.clickSelector(cdp, afterRecovery, '#fdc-pinned-compare-save');
    const recoveryNote = await browser.evaluate(cdp, afterRecovery,
      `document.querySelector('#fdc-pinned-compare-note')?.textContent || ''`);
    assert.match(recoveryNote, /スロット1/, 'manager resave restores comparison slot');
    assert.doesNotMatch(recoveryNote, /不足|旧形式|再保存/, 'recovered slot is usable');
    const beforeInvalidation = await browser.evaluate(cdp, afterRecovery,
      `({ result: document.querySelector('#fdc-result-normal')?.textContent || '',
        note: document.querySelector('#fdc-result-detail-note')?.textContent || '',
        target: window.TRICKCAL_DAMAGE_CALC.captureCombatScenario()?.actors?.self?.id,
        formation: window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot()?.scenario?.formationState?.formation?.rows?.map(row => ({ apostles: row.apostles, resonancePersonalities: row.resonancePersonalities })) })`);
    assert.notEqual(beforeInvalidation.result, '—', `a valid result is visible before external invalidation: ${JSON.stringify(beforeInvalidation)}`);
    let boundaryCalc = await browser.createPage(cdp, `http://127.0.0.1:${port}/formation-damage-calc.html`);
    await browser.waitFor(async () => browser.evaluate(cdp, boundaryCalc,
      `document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_DAMAGE_CALC`),
    { timeoutMs: 30000 });
    const asideBoundary = async rank => {
      await browser.evaluate(cdp, boundaryCalc, `(() => {
      const source = document.querySelector('#fdc-enemy-source-mode');
      source.value = 'apostle'; source.dispatchEvent(new Event('change', { bubbles: true }));
      const apostle = document.querySelector('#fdc-enemy-apostle');
      apostle.value = 'Kyarot'; apostle.dispatchEvent(new Event('change', { bubbles: true }));
      const aside = document.querySelector('[data-fdc-enemy-individual-field="asideRank"]');
      aside.value = '${rank}'; aside.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
      await browser.waitFor(async () => browser.evaluate(cdp, boundaryCalc,
        `document.querySelector('#fdc-result-normal')?.textContent === '—' &&
         document.querySelector('#fdc-result-detail-note')?.textContent?.includes('A3の全体補正率')`),
      { timeoutMs: 10000 });
      return browser.evaluate(cdp, boundaryCalc, `({ result: document.querySelector('#fdc-result-normal')?.textContent,
        note: document.querySelector('#fdc-result-detail-note')?.textContent,
        dpsBlocked: window.TRICKCAL_DAMAGE_CALC.createDpsEvaluationInput()?.statRecalculationRequired })`);
    };
    const downStop = await asideBoundary(2);
    assert.equal(downStop.result, '—');
    assert.match(downStop.note, /A3の全体補正率.*ステータス管理/);
    assert.equal(downStop.dpsBlocked, true);
    const boundaryManager = await browser.createPage(cdp, `http://127.0.0.1:${port}/stat-dashboard.html?view=settings`);
    await browser.waitFor(async () => browser.evaluate(cdp, boundaryManager,
      `document.documentElement.dataset.storageBoot === 'ready' && !document.body.classList.contains('is-booting')`),
    { timeoutMs: 30000 });
    const setManagerAsideRank = async rank => {
      await cdp.send('Target.activateTarget', { targetId: boundaryManager.targetId });
      await browser.evaluate(cdp, boundaryManager, `(() => {
        const select = document.querySelector('#aside-rank-select');
        select.value = '${rank}'; select.dispatchEvent(new Event('change', { bubbles: true }));
        return select.value;
      })()`);
      if (!await browser.evaluate(cdp, boundaryManager, `document.querySelector('.bottom-save-menu')?.open`)) {
        await browser.clickSelector(cdp, boundaryManager, '.bottom-save-menu > summary');
      }
      await browser.clickSelector(cdp, boundaryManager, '#save-state-slot');
      await browser.clickSelector(cdp, boundaryManager, '[data-state-slot="1"]');
      await browser.waitFor(async () => browser.evaluate(cdp, boundaryManager,
        `(() => { const state = JSON.parse(localStorage.getItem('trickcal_stat_prototype_v1') || '{}');
          return state.apostles?.Kyarot?.asideRank === ${rank}
            && state.apostles.Kyarot.statSnapshots?.current?.calculationVersion === 2; })()`),
      { timeoutMs: 30000 }).catch(async error => {
        const observed = await browser.evaluate(cdp, boundaryManager, `(() => {
          const state = JSON.parse(localStorage.getItem('trickcal_stat_prototype_v1') || '{}');
          return { selected: document.querySelector('#aside-rank-select')?.value,
            saved: state.apostles?.Kyarot?.asideRank,
            snapshotVersion: state.apostles?.Kyarot?.statSnapshots?.current?.calculationVersion,
            status: document.querySelector('#state-status')?.textContent };
        })()`);
        throw new Error(`${error.message}: ${JSON.stringify(observed)}`);
      });
    };
    await setManagerAsideRank(2);
    await cdp.send('Target.closeTarget', { targetId: boundaryCalc.targetId });
    boundaryCalc = await browser.createPage(cdp, `http://127.0.0.1:${port}/formation-damage-calc.html`);
    await browser.waitFor(async () => browser.evaluate(cdp, boundaryCalc,
      `document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_DAMAGE_CALC`),
    { timeoutMs: 30000 });
    await browser.evaluate(cdp, boundaryCalc, `(() => {
      const source = document.querySelector('#fdc-enemy-source-mode');
      source.value = 'apostle'; source.dispatchEvent(new Event('change', { bubbles: true }));
      const apostle = document.querySelector('#fdc-enemy-apostle');
      apostle.value = 'Kyarot'; apostle.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await browser.waitFor(async () => browser.evaluate(cdp, boundaryCalc,
      `document.querySelector('#fdc-result-normal')?.textContent !== '—'`), { timeoutMs: 10000 });
    const downRecovered = await browser.evaluate(cdp, boundaryCalc,
      `({result: document.querySelector('#fdc-result-normal')?.textContent,
        note: document.querySelector('#fdc-result-detail-note')?.textContent})`);
    assert.doesNotMatch(downRecovered.note, /再計算|補正率/);
    const upStop = await asideBoundary(3);
    assert.equal(upStop.result, '—');
    assert.match(upStop.note, /A3の全体補正率.*ステータス管理/);
    assert.equal(upStop.dpsBlocked, true);
    await setManagerAsideRank(3);
    await cdp.send('Target.closeTarget', { targetId: boundaryCalc.targetId });
    boundaryCalc = await browser.createPage(cdp, `http://127.0.0.1:${port}/formation-damage-calc.html`);
    await browser.waitFor(async () => browser.evaluate(cdp, boundaryCalc,
      `document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_DAMAGE_CALC`),
    { timeoutMs: 30000 });
    await browser.evaluate(cdp, boundaryCalc, `(() => {
      const source = document.querySelector('#fdc-enemy-source-mode');
      source.value = 'apostle'; source.dispatchEvent(new Event('change', { bubbles: true }));
      const apostle = document.querySelector('#fdc-enemy-apostle');
      apostle.value = 'Kyarot'; apostle.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await browser.waitFor(async () => browser.evaluate(cdp, boundaryCalc,
      `document.querySelector('#fdc-result-normal')?.textContent !== '—'`), { timeoutMs: 10000 });
    await cdp.send('Target.closeTarget', { targetId: boundaryCalc.targetId });
    await cdp.send('Target.closeTarget', { targetId: boundaryManager.targetId });
    const externalTab = await browser.createPage(cdp, `http://127.0.0.1:${port}/enemy-status.html`);
    await browser.waitFor(async () => browser.evaluate(cdp, externalTab,
      `document.readyState === 'complete'`), { timeoutMs: 30000 });
    await browser.evaluate(cdp, externalTab, `(() => {
      const key = 'trickcal_stat_prototype_v1';
      const state = JSON.parse(localStorage.getItem(key));
      state.externalMarker = 'newer-tab';
      state.apostles.Kyarot.statSnapshots.current = {
        stats: { hp: 99999, physicalAtk: 99999, magicAtk: 99999 },
        breakdown: { base: { hp: 2184 } }, globalPercentRates: {}
      };
      localStorage.setItem(key, JSON.stringify(state));
      return true;
    })()`);
    await browser.waitFor(async () => browser.evaluate(cdp, afterRecovery,
      `document.querySelector('#fdc-result-normal')?.textContent === '—'`),
    { timeoutMs: 10000 });
    const stoppedAfterSuccess = await browser.evaluate(cdp, afterRecovery, `(() => ({
      result: document.querySelector('#fdc-result-normal')?.textContent,
      note: document.querySelector('#fdc-result-detail-note')?.textContent,
      pinned: document.querySelector('#fdc-pinned-compare-note')?.textContent,
      dpsRequired: window.TRICKCAL_DAMAGE_CALC.createDpsEvaluationInput()?.statRecalculationRequired,
      marker: JSON.parse(localStorage.getItem('trickcal_stat_prototype_v1')).externalMarker
    }))()`);
    assert.match(stoppedAfterSuccess.note, /再計算/);
    assert.doesNotMatch(stoppedAfterSuccess.pinned, /期待値/, 'old pinned result is not shown as valid');
    assert.equal(stoppedAfterSuccess.dpsRequired, true);
    assert.equal(stoppedAfterSuccess.marker, 'newer-tab', 'calculator never overwrites a newer-tab update');
    await cdp.send('Target.closeTarget', { targetId: externalTab.targetId });
    await cdp.send('Target.closeTarget', { targetId: afterRecovery.targetId });
    const missingManager = await browser.createPage(cdp, `http://127.0.0.1:${port}/stat-dashboard.html?view=settings`);
    await browser.waitFor(async () => browser.evaluate(cdp, missingManager,
      `document.documentElement.dataset.storageBoot === 'ready' && !document.body.classList.contains('is-booting')`),
    { timeoutMs: 30000 });
    await browser.evaluate(cdp, missingManager, `(() => { window.confirm = () => true;
      document.querySelector('.bottom-save-menu').open = true; return true; })()`);
    await browser.clickSelector(cdp, missingManager, '#load-state-slot');
    await browser.clickSelector(cdp, missingManager, '[data-state-slot="3"]');
    const missingLoad = await browser.evaluate(cdp, missingManager, `(() => {
      const slot = JSON.parse(localStorage.getItem('trickcal_stat_slots_v2')).slots['3'].snapshot;
      return { status: document.querySelector('#state-status')?.textContent,
        storedLevel: slot.apostles.Kyarot.level, shownLevel: document.querySelector('#level-select')?.value };
    })()`);
    assert.match(missingLoad.status, /スロット3.*Lv.*再設定/);
    assert.equal(missingLoad.storedLevel, undefined, 'loading must not silently rewrite the original slot');
    await browser.evaluate(cdp, missingManager, `(() => { const select = document.querySelector('#level-select');
      select.value = '2'; select.dispatchEvent(new Event('change', { bubbles: true })); return select.value; })()`);
    await browser.clickSelector(cdp, missingManager, '.bottom-save-menu > summary');
    await browser.clickSelector(cdp, missingManager, '#save-state-slot');
    await browser.clickSelector(cdp, missingManager, '[data-state-slot="3"]');
    await browser.waitFor(async () => browser.evaluate(cdp, missingManager, `(() => {
      const slot = JSON.parse(localStorage.getItem('trickcal_stat_slots_v2')).slots['3'].snapshot;
      return slot.apostles.Kyarot.level === 2 && slot.comparisonStats?.v === 2;
    })()`), { timeoutMs: 30000 });
    const missingRecovered = await browser.evaluate(cdp, missingManager, `(() => {
      const slot = JSON.parse(localStorage.getItem('trickcal_stat_slots_v2')).slots['3'].snapshot;
      const all = window.TRICKCAL_STAT_ENGINE.getState().apostles;
      const live = all.Joanne?.statSnapshots?.current;
      return { level: slot.apostles.Kyarot.level, asideRank: slot.apostles.Kyarot.asideRank,
        plannedBoards: slot.apostles.Kyarot.plannedBoards, formation: slot.formation.rows[2].resonancePersonalities[1],
        joanneComplete: window.TRICKCAL_SHARED_STAT_ENGINE.hasCompleteBreakdown(live),
        snapshotCount: Object.values(all).filter(state => !!state.statSnapshots?.current).length,
        basicCount: window.TRICKCAL_STAT_DATA.sheets.basicInfo.length };
    })()`);
    assert.equal(missingRecovered.level, 2);
    assert.equal(missingRecovered.asideRank, 3);
    assert.equal(missingRecovered.formation, '純粋');
    assert.deepEqual(missingRecovered.plannedBoards, { 1: { filled: { fixture: true } } });
    assert.equal(missingRecovered.joanneComplete, true, 'slot save must finish all members before compacting');
    assert.equal(missingRecovered.snapshotCount, missingRecovered.basicCount, 'slot save must finish the pending refresh');
    await cdp.send('Target.closeTarget', { targetId: missingManager.targetId });
    const missingCalc = await browser.createPage(cdp, `http://127.0.0.1:${port}/formation-damage-calc.html`);
    await browser.waitFor(async () => browser.evaluate(cdp, missingCalc,
      `document.documentElement.dataset.storageBoot === 'ready' && !!window.TRICKCAL_DAMAGE_CALC`),
    { timeoutMs: 30000 });
    await browser.clickSelector(cdp, missingCalc, '#fdc-compare-float-toggle');
    await browser.evaluate(cdp, missingCalc, `(() => { const source = document.querySelector('#fdc-compare-source');
      source.value = 'slot:3'; source.dispatchEvent(new Event('change', { bubbles: true })); return source.value; })()`);
    await browser.clickSelector(cdp, missingCalc, '#fdc-pinned-compare-save');
    const missingRecoveryNote = await browser.evaluate(cdp, missingCalc,
      `document.querySelector('#fdc-pinned-compare-note')?.textContent || ''`);
    const missingSlotEvidence = await browser.evaluate(cdp, missingCalc, `(() => {
      const slot = JSON.parse(localStorage.getItem('trickcal_stat_slots_v2')).slots['3'].snapshot;
      return { ids: Object.keys(slot.apostles || {}), compactIds: Object.keys(slot.comparisonStats?.a || {}),
        joanneState: slot.apostles?.Joanne,
        decodedJoanne: window.TRICKCAL_SHARED_STAT_ENGINE.decodeComparisonStatSnapshots(slot.comparisonStats)?.Joanne?.current?.calculationVersion };
    })()`);
    assert.match(missingRecoveryNote, /スロット3/);
    assert.doesNotMatch(missingRecoveryNote, /不足|旧形式|再保存/,
      JSON.stringify({ missingSlotEvidence, missingRecovered }));
    await cdp.send('Target.closeTarget', { targetId: missingCalc.targetId });
    const safetyManager = await browser.createPage(cdp, `http://127.0.0.1:${port}/stat-dashboard.html?view=settings`);
    await browser.waitFor(async () => browser.evaluate(cdp, safetyManager,
      `document.documentElement.dataset.storageBoot === 'ready' && !document.body.classList.contains('is-booting')`),
    { timeoutMs: 30000 });
    await browser.clickSelector(cdp, safetyManager, '.bottom-save-menu > summary');
    await browser.clickSelector(cdp, safetyManager, '#save-state-slot');
    const slotBeforeFailure = await browser.evaluate(cdp, safetyManager,
      `localStorage.getItem('trickcal_stat_slots_v2')`);
    await browser.evaluate(cdp, safetyManager, `(() => {
      const original = Storage.prototype.setItem;
      window.__restoreSlotWrite = () => { Storage.prototype.setItem = original; };
      Storage.prototype.setItem = function(key, value) {
        if (key === 'trickcal_stat_slots_v2') throw new DOMException('injected slot failure', 'QuotaExceededError');
        return original.call(this, key, value);
      };
    })()`);
    await browser.clickSelector(cdp, safetyManager, '[data-state-slot="3"]');
    await browser.waitFor(async () => browser.evaluate(cdp, safetyManager,
      `document.querySelector('#state-status')?.textContent?.includes('保存処理を完了できませんでした')`),
    { timeoutMs: 10000 });
    const failedSave = await browser.evaluate(cdp, safetyManager, `(() => {
      window.__restoreSlotWrite();
      return { raw: localStorage.getItem('trickcal_stat_slots_v2'),
        status: document.querySelector('#state-status')?.textContent,
        slotEnabled: !document.querySelector('[data-state-slot="3"]')?.disabled };
    })()`);
    assert.equal(failedSave.raw, slotBeforeFailure, 'failed persistent write must retain the original slot');
    assert.equal(failedSave.slotEnabled, true, 'save controls must recover after failure');
    if (await browser.evaluate(cdp, safetyManager,
      `getComputedStyle(document.querySelector('.bottom-save-popover')).display === 'none'`)) {
      await browser.clickSelector(cdp, safetyManager, '.bottom-save-menu > summary');
    }
    await browser.clickSelector(cdp, safetyManager, '#save-state-slot');
    await browser.evaluate(cdp, safetyManager, `(() => {
      const sheets = window.TRICKCAL_STAT_DATA.sheets;
      const rows = sheets.basicInfo;
      window.__restoreSnapshotRows = () => { sheets.basicInfo = rows; };
      sheets.basicInfo = new Proxy(rows, { get(target, property, receiver) {
        if (property === 'forEach') return callback => Array.prototype.forEach.call(target, (row, index) => {
          if (index === 10 && !window.__snapshotRefreshFailed) {
            window.__snapshotRefreshFailed = true;
            throw new Error('injected mid-refresh failure');
          }
          callback(row, index);
        });
        return Reflect.get(target, property, receiver);
      }});
    })()`);
    await browser.clickSelector(cdp, safetyManager, '[data-state-slot="3"]');
    await browser.waitFor(async () => browser.evaluate(cdp, safetyManager,
      `document.querySelector('#state-status')?.textContent?.includes('保存処理を完了できませんでした')`),
    { timeoutMs: 10000 });
    const failedRefresh = await browser.evaluate(cdp, safetyManager, `(() => {
      window.__restoreSnapshotRows();
      return { injected: !!window.__snapshotRefreshFailed,
        raw: localStorage.getItem('trickcal_stat_slots_v2'),
        slotEnabled: !document.querySelector('[data-state-slot="3"]')?.disabled };
    })()`);
    assert.equal(failedRefresh.injected, true, 'refresh must fail after processing some apostles');
    assert.equal(failedRefresh.raw, slotBeforeFailure, 'partial refresh must not replace the existing slot');
    assert.equal(failedRefresh.slotEnabled, true);
    await browser.evaluate(cdp, safetyManager, `(() => {
      window.__slotHold = { active: false };
      void navigator.locks.request('trickcal-stat-slots-v2', async () => {
        window.__slotHold.active = true;
        await new Promise(resolve => { window.__slotHold.release = resolve; });
      });
    })()`);
    await browser.waitFor(async () => browser.evaluate(cdp, safetyManager,
      `window.__slotHold?.active === true`), { timeoutMs: 10000 });
    const beforeDouble = await browser.evaluate(cdp, safetyManager, `(() => {
      const entry = JSON.parse(localStorage.getItem('trickcal_stat_slots_v2')).slots['3'];
      return { revision: entry.slotRevision, level: entry.snapshot.apostles.Kyarot.level,
        compact: JSON.stringify(entry.snapshot.comparisonStats.a.Kyarot) };
    })()`);
    if (await browser.evaluate(cdp, safetyManager,
      `getComputedStyle(document.querySelector('.bottom-save-popover')).display === 'none'`)) {
      await browser.clickSelector(cdp, safetyManager, '.bottom-save-menu > summary');
    }
    await browser.clickSelector(cdp, safetyManager, '#save-state-slot');
    await browser.clickSelector(cdp, safetyManager, '[data-state-slot="3"]');
    const pendingSave = await browser.evaluate(cdp, safetyManager,
      `({ status: document.querySelector('#state-status')?.textContent,
        disabled: document.querySelector('[data-state-slot="3"]')?.disabled })`);
    assert.equal(pendingSave.disabled, true);
    assert.match(pendingSave.status, /保存中/);
    await browser.evaluate(cdp, safetyManager,
      `document.querySelector('[data-state-slot="3"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
    await browser.evaluate(cdp, safetyManager, `(() => {
      const level = document.querySelector('#level-select');
      level.value = '3'; level.dispatchEvent(new Event('change', { bubbles: true }));
      window.__slotHold.release();
    })()`);
    await browser.waitFor(async () => browser.evaluate(cdp, safetyManager,
      `JSON.parse(localStorage.getItem('trickcal_stat_slots_v2')).slots['3'].slotRevision === ${beforeDouble.revision + 1}`),
    { timeoutMs: 30000 });
    const afterDouble = await browser.evaluate(cdp, safetyManager, `(() => {
      const entry = JSON.parse(localStorage.getItem('trickcal_stat_slots_v2')).slots['3'];
      return { revision: entry.slotRevision, level: entry.snapshot.apostles.Kyarot.level,
        compact: JSON.stringify(entry.snapshot.comparisonStats.a.Kyarot),
        slotEnabled: !document.querySelector('[data-state-slot="3"]')?.disabled };
    })()`);
    assert.equal(afterDouble.level, beforeDouble.level, 'pending UI edit must not mix into the captured slot');
    assert.equal(afterDouble.compact, beforeDouble.compact, 'saved calculation values must match the captured growth settings');
    assert.equal(afterDouble.slotEnabled, true);
    await cdp.send('Target.closeTarget', { targetId: safetyManager.targetId });
    console.log(JSON.stringify({ loaded, enemy, slotNote, modernNote, oldCalculationNote,
      incomplete, recovered, recoveryNote, stoppedAfterSuccess, missingLoad, missingRecovered, missingRecoveryNote,
      failedSave: { status: failedSave.status, preserved: failedSave.raw === slotBeforeFailure },
      failedRefresh: { injected: failedRefresh.injected, preserved: failedRefresh.raw === slotBeforeFailure }, pendingSave,
      beforeDouble: { revision: beforeDouble.revision, level: beforeDouble.level },
      afterDouble: { revision: afterDouble.revision, level: afterDouble.level, slotEnabled: afterDouble.slotEnabled } }));
    console.log(JSON.stringify({ ok: true, grades: result.grades }));
  } finally {
    try { await cdp?.disconnect(); } catch {}
    try { chrome?.kill(); } catch {}
    await new Promise(resolve => server.close(resolve));
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch {}
  }
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
