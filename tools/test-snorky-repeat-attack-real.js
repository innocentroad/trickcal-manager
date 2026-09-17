#!/usr/bin/env node
'use strict';

// 現行生成物をそのまま配信する、スノキー実データ接続の隔離UI検査。
// fixtureでapostles.js / dps-timing-data.js / 効果値を差し替えない。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const browser = require('./storage-native-browser-check.js');

const ROOT = path.resolve(__dirname, '..');
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function startRootServer(port) {
  return http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    let relative = pathname.replace(/^\/+/, '') || 'index.html';
    if (relative === 'calc' || relative === 'calc/') relative = 'formation-damage-calc.html';
    else if (relative.startsWith('calc/')) relative = relative.slice('calc/'.length);
    let file = path.resolve(ROOT, relative);
    if (file.startsWith(`${ROOT}${path.sep}`) && fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, 'index.html');
    }
    if (!file.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(file).pipe(response);
  }).listen(port, '127.0.0.1');
}

function launch(command, args) {
  return spawn(command, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
}

async function createChrome(cdpPort, profileRoot) {
  const chrome = launch(browser.findChrome(), [
    `--user-data-dir=${profileRoot}`,
    `--remote-debugging-port=${cdpPort}`,
    '--remote-debugging-address=127.0.0.1',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-sync',
    '--disable-extensions',
    '--disable-background-networking',
    '--window-size=1280,900',
    '--new-window',
    'about:blank'
  ]);
  const version = await browser.waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
    return response.ok ? response.json() : null;
  }, { timeoutMs: 30000 });
  const cdp = new browser.CdpClient(version.webSocketDebuggerUrl);
  await cdp.connect();
  return { chrome, cdp };
}

async function click(cdp, page, selector) {
  await browser.clickSelector(cdp, page, selector);
  await browser.sleep(120);
}

async function selectSnorky(cdp, page) {
  await click(cdp, page, '#fdc-target-preview');
  await browser.waitForSelector(cdp, page, '#fdc-formation-picker');
  await click(cdp, page, '[data-fdc-picker-mode="all"]');
  await browser.waitForSelector(cdp, page, '[data-fdc-member-id="Snorky"]');
  await click(cdp, page, '[data-fdc-member-id="Snorky"]');
  const slot = await browser.evaluate(cdp, page, `document.querySelector('[data-fdc-temp-member-slot]')?.getAttribute('data-fdc-temp-member-slot') || ''`);
  assert.ok(slot, '実データのスノキー配置先がありません');
  await click(cdp, page, `[data-fdc-temp-member-slot="${slot}"]`);
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
    const input = window.TRICKCAL_DAMAGE_CALC?.createDpsEvaluationInput?.();
    return input?.targetId === 'Snorky' && input?.placementRequired !== true;
  })()`));
}

function evaluateRealSnapshot(cdp, page, extra = {}) {
  const duration = Number(extra.duration || 30);
  const seed = Number(extra.seed || 119);
  const source = `(() => {
    const input = window.TRICKCAL_DAMAGE_CALC.createDpsEvaluationInput();
    const timing = window.DPS_TIMING_DATA.apostles[String(input.targetId).toLowerCase()];
    const simulator = window.TRICKCAL_DPS_SIMULATOR;
    const config = simulator.buildCombatantConfig(input.apostle, timing, {
      scenario: input.scenario,
      skillLevels: input.skillLevels,
      skillOverrides: input.dpsSkillOverrides,
      timingBranches: input.dpsTimingBranches,
      runtimeEffects: input.dpsRuntimeSimulationEffects || input.runtimeEffects,
      externalEvents: input.externalEvents || []
    });
    const options = {
      durationSeconds: ${duration},
      initialActionDelayFrames: timing.initialActionDelayFrames || 0,
      highSkillMode: 'disabled',
      seed: ${seed},
      damageProfiles: input.actionDamageProfiles || {},
      statusDamageProfiles: input.statusDamageProfiles || {},
      recordTimeline: true,
      recordDamageSeries: true,
      enableFastForward: false,
      externalEvents: input.externalEvents || []
    };
    const run = simulator.simulate(config, options);
    const starts = (run.timeline || []).filter(event => event.type === 'actionStart');
    const enhancedStarts = starts.filter(event => event.actionKey === 'enhancedAttack');
    const repeatRolls = (run.timeline || []).filter(event => event.type === 'enhancedRepeatProbability');
    const lowStarts = starts.filter(event => event.actionKey === 'lowSkill');
    const damageLogs = (run.timeline || []).filter(event => event.type === 'hit');
    const enhancedDamageLogs = damageLogs.filter(event => event.actionKey === 'enhancedAttack');
    const favoriteStunLogs = (run.timeline || []).filter(event => (
      event.type === 'effect' && event.effectId === 'Snorky_favorite_1_e02'
    ));
    const enhancedDamageByEffect = Object.fromEntries(
      enhancedDamageLogs.reduce((counts, event) => {
        const effectId = event.effectId || '(none)';
        counts.set(effectId, (counts.get(effectId) || 0) + 1);
        return counts;
      }, new Map())
    );
    const eventTypes = [...new Set((run.timeline || []).map(event => event.type))];
    const compactStart = event => ({ actionKey: event.actionKey, repeatIndex: event.repeatIndex, frame: event.frame });
    return {
      targetId: input.targetId,
      targetName: input.apostle?.name || '',
      artifactIds: input.target?.artifactIds || [],
      favoriteOverride: Object.keys(input.dpsSkillOverrides || {}).includes('enhancedAttack'),
      timing: {
        normalAttackIntervalFrames: timing.normalAttackIntervalFrames,
        statuses: timing.implementationStatuses,
        actions: Object.fromEntries(Object.entries(timing.actions || {}).map(([key, action]) => [key, {
          motionFrames: action.motionFrames,
          researchStatus: action.researchStatus,
          timingEvents: (action.timingEvents || []).map(row => ({ branch: row.branch || '', effectId: row.effectId, frame: row.frame, status: row.researchStatus }))
        }]))
      },
      skillRows: (input.apostle?.skills || []).filter(skill => /普通攻撃_強化/.test(skill.skillType || '')).flatMap(skill => (skill.effects || []).filter(effect => /^Snorky_(?:enhanced|favorite_1)_e0[123]$/.test(effect.effectId || '')).map(effect => ({ id: effect.effectId, kind: effect.valueKind, value: effect.fixedValue }))),
      config: {
        enhancedSkillId: config.actions.enhancedAttack?.skillId || '',
        repeatPolicy: config.actions.enhancedAttack?.repeatPolicy || null,
        variants: Object.fromEntries(Object.entries(config.actions.enhancedAttack?.variants || {}).map(([name, events]) => [name, events.map(event => ({
          type: event.type,
          effectId: event.effectId,
          effectValueKind: event.effectValueKind || '',
          hitCount: event.hitCount || 0,
          status: event.statusApplication?.status || ''
        }))])),
        warnings: config.warnings || []
      },
      profiles: {
        enhanced: Object.fromEntries(Object.entries(input.actionDamageProfiles?.enhancedAttack?.variants || {}).map(([name, profile]) => [name, { totalExpectedDamage: profile.totalExpectedDamage, effects: Object.values(profile.effects || {}).map(effect => ({
          effectId: effect.effectId,
          multiplier: effect.multiplier,
          expectedDamage: effect.expectedDamage,
          isAdditionalDamage: effect.isAdditionalDamage === true
        })) }])),
        basic: Object.fromEntries(Object.entries(input.actionDamageProfiles?.basicAttack?.variants || {}).map(([name, profile]) => [name, { totalExpectedDamage: profile.totalExpectedDamage, effects: Object.keys(profile.effects || {})}]))
      },
      runtime: {
        runtimeEffectIds: (input.runtimeEffects?.eventEffects || []).map(effect => effect.id || effect.effectId).filter(Boolean),
        dpsRuntimeEffectIds: (input.dpsRuntimeSimulationEffects?.eventEffects || []).map(effect => effect.id || effect.effectId).filter(Boolean),
        selectedSkillOptions: (input.selectedSkillOptions || []).map(option => ({ sourceKey: option.sourceKey, effectId: option.effectId, skillRewrite: option.skillRewrite }))
      },
      run: {
        totalDamage: run.totalDamage,
        dps: run.dps,
        enhancedDamageEventCount: enhancedDamageLogs.length,
        enhancedDamageTotal: enhancedDamageLogs.reduce((sum, event) => sum + Number(event.expectedDamage || 0), 0),
        enhancedDamageByEffect,
        favoriteStunEventCount: favoriteStunLogs.length,
        eventTypes,
        starts: starts.slice(0, 40).map(compactStart),
        enhancedStarts: enhancedStarts.slice(0, 30).map(compactStart),
        lowStarts: lowStarts.map(compactStart),
        repeatRolls: repeatRolls.map(event => ({ frame: event.frame, probability: event.probability, success: event.success, roll: event.roll })),
        finalStateKeys: Object.keys(run.finalState || run.state || {}),
        finalState: run.finalState || run.state || null,
        lastEvents: (run.timeline || []).slice(-12)
      }
    };
  })()`;
  return browser.evaluate(cdp, page, source);
}

async function applyFavorite(cdp, page) {
  await click(cdp, page, '[data-fdcp-mode="single"]');
  await click(cdp, page, '[data-fdc-temp-artifact-row="target"][data-fdc-temp-artifact-slot="0"]');
  await browser.waitForSelector(cdp, page, '[data-fdc-temp-artifact-value="artifact_snorky_fedora"]');
  await click(cdp, page, '[data-fdc-temp-artifact-value="artifact_snorky_fedora"]');
  const afterCardClick = await browser.evaluate(cdp, page, `(() => ({
    slot: document.querySelector('[data-fdc-temp-artifact-row="target"][data-fdc-temp-artifact-slot="0"]')?.outerHTML || '',
    selected: Array.from(document.querySelectorAll('[data-fdc-temp-artifact-value]')).filter(el => !el.hidden).map(el => el.getAttribute('data-fdc-temp-artifact-value')).slice(0, 5),
    text: document.body.textContent?.includes('スノキーのフェドーラ') || false,
    input: (() => { const value = window.TRICKCAL_DAMAGE_CALC?.createDpsEvaluationInput?.(); return { target: value?.target, targetId: value?.targetId, scenarioCards: value?.scenario?.cardState?.tempArtifacts, artifactIds: value?.scenario?.actors?.self?.artifactIds, overrides: Object.keys(value?.dpsSkillOverrides || {}) }; })()
  }))()`);
  if (!afterCardClick.input.overrides.includes('enhancedAttack')) process.stderr.write(`favorite-ui-state=${JSON.stringify(afterCardClick)}\n`);
  await browser.sleep(250);
}

async function runDpsUi(cdp, page) {
  await click(cdp, page, '[data-fdcp-mode="dps"]');
  const settings = await browser.evaluate(cdp, page, 'document.querySelector("#fdcp-dps-settings-panel")?.hidden === true');
  if (settings) await click(cdp, page, '#fdcp-dps-settings-toggle');
  await browser.waitFor(async () => browser.evaluate(cdp, page, 'document.querySelector("#fdcp-dps-run")?.disabled === false'));
  await click(cdp, page, '#fdcp-dps-run');
  await browser.waitFor(async () => browser.evaluate(cdp, page, `(() => {
    const button = document.querySelector('#fdcp-dps-run');
    const state = document.querySelector('#fdcp-dps-state')?.textContent || '';
    return button?.disabled === false && !/計算中|集計中/.test(state);
  })()`), { timeoutMs: 60000 });
  return browser.evaluate(cdp, page, `({
    state: document.querySelector('#fdcp-dps-state')?.textContent?.trim() || '',
    result: document.querySelector('#fdcp-dps-result')?.textContent?.trim() || '',
    errors: Array.from(document.querySelectorAll('[role="alert"], .error, .fdcp-error')).map(el => el.textContent?.trim()).filter(Boolean)
  })`);
}

async function findLowResume(cdp, page) {
  return browser.evaluate(cdp, page, `(() => {
    const input = window.TRICKCAL_DAMAGE_CALC.createDpsEvaluationInput();
    const timing = window.DPS_TIMING_DATA.apostles[String(input.targetId).toLowerCase()];
    const sim = window.TRICKCAL_DPS_SIMULATOR;
    const config = sim.buildCombatantConfig(input.apostle, timing, {
      scenario: input.scenario,
      skillLevels: input.skillLevels,
      skillOverrides: input.dpsSkillOverrides,
      timingBranches: input.dpsTimingBranches,
      runtimeEffects: input.dpsRuntimeSimulationEffects || input.runtimeEffects,
      externalEvents: input.externalEvents || []
    });
    for (let seed = 1; seed <= 300; seed += 1) {
      const result = sim.simulate(config, {
        durationSeconds: 90,
        initialActionDelayFrames: timing.initialActionDelayFrames || 0,
        highSkillMode: 'disabled',
        seed,
        damageProfiles: input.actionDamageProfiles || {},
        statusDamageProfiles: input.statusDamageProfiles || {},
        recordTimeline: true,
        recordDamageSeries: false,
        enableFastForward: false
      });
      const starts = (result.timeline || []).filter(event => event.type === 'actionStart');
      const lowIndex = starts.findIndex((event, index) => (
        event.actionKey === 'lowSkill'
        && index > 0
        && index + 1 < starts.length
        && starts[index - 1].actionKey === 'enhancedAttack'
        && starts[index + 1].actionKey === 'enhancedAttack'
        && Number(starts[index - 1].repeatIndex) > 0
        && Number(starts[index + 1].repeatIndex) === Number(starts[index - 1].repeatIndex) + 1
      ));
      if (lowIndex >= 0) {
        return {
          seed,
          sequence: starts.slice(Math.max(0, lowIndex - 1), lowIndex + 2).map(event => ({
            actionKey: event.actionKey,
            repeatIndex: event.repeatIndex,
            frame: event.frame
          }))
        };
      }
    }
    return null;
  })()`);
}

async function run() {
  const port = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([port]);
  const origin = `http://127.0.0.1:${port}`;
  const profileRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'trickcal-snorky-repeat-real-'));
  let server = null;
  let chrome = null;
  let cdp = null;
  let page = null;
  try {
    server = startRootServer(port);
    await browser.waitForHttp(`${origin}/calc/`);
    ({ chrome, cdp } = await createChrome(cdpPort, profileRoot));
    page = await browser.createPage(cdp, `${origin}/calc/?snorkyRepeatNative=real`);
    await browser.waitFor(async () => browser.evaluate(cdp, page, 'document.documentElement.dataset.storageBoot === "ready"'));
    await browser.waitForSelector(cdp, page, '#fdc-target-preview');
    await selectSnorky(cdp, page);

    const normal = await evaluateRealSnapshot(cdp, page, { duration: 30, seed: 119 });
    assert.equal(normal.targetId, 'Snorky', '実生成データのtargetIdがSnorkyではありません');
    assert.equal(normal.favoriteOverride, false, '通常経路に愛用overrideが混入しています');
    assert.equal(normal.timing.normalAttackIntervalFrames, 134, '実生成timingの通常攻撃間隔が一致しません');
    assert.deepEqual(normal.timing.statuses, { normal: '済', aside: '済', favorite: '済' }, '実生成timing/supportの済状態が一致しません');
    assert.deepEqual(normal.config.repeatPolicy, {
      initialProbabilityP: 70,
      decrementPoints: 20,
      sourceEffectIds: ['Snorky_enhanced_e02', 'Snorky_enhanced_e03'],
      estimated: true,
      maxActions: 5
    }, '実生成データから70/20 repeatPolicyを接続できません');
    assert.ok(normal.profiles.enhanced.default.effects.some(effect => effect.effectId === 'Snorky_enhanced_e01'), '通常DPS profileに基礎強化ダメージがありません');
    assert.ok(!normal.profiles.enhanced.default.effects.some(effect => /e02|e03$/.test(effect.effectId)), '通常DPS profileへ70/20がダメージ行として混入しています');
    assert.deepEqual(
      Object.values(normal.config.variants).flat().filter(event => event.type === 'damage').map(event => event.effectId),
      ['Snorky_enhanced_e01'],
      '通常DPSのtimingへ愛用または70/20のdamage eventが混入しています'
    );
    assert.deepEqual(
      normal.run.enhancedDamageByEffect,
      { Snorky_enhanced_e01: normal.run.enhancedDamageEventCount },
      '通常DPSの実damageへ70/20行が混入しています'
    );
    assert.equal(normal.run.repeatRolls.length > 0, true, '通常DPS実行で連鎖抽選が記録されません');
    const normalUi = await runDpsUi(cdp, page);
    assert.equal(normalUi.errors.length, 0, '通常DPS UIにエラーがあります');
    assert.notEqual(normalUi.result, '', '通常DPS UIの結果が空です');
    const normalSameSeedA = await evaluateRealSnapshot(cdp, page, { duration: 30, seed: 119 });
    const normalSameSeedB = await evaluateRealSnapshot(cdp, page, { duration: 30, seed: 119 });
    assert.deepEqual(normalSameSeedA.run.repeatRolls, normalSameSeedB.run.repeatRolls, '通常実データの同seed連鎖抽選が再現しません');
    assert.deepEqual(normalSameSeedA.run.starts, normalSameSeedB.run.starts, '通常実データの同seed行動系列が再現しません');
    const normalLowResume = await findLowResume(cdp, page);
    assert.ok(normalLowResume, '通常実データの低学年優先→連鎖再開ケースを本番simulatorで確認できません');

    await applyFavorite(cdp, page);
    const favorite = await evaluateRealSnapshot(cdp, page, { duration: 30, seed: 119 });
    assert.ok(favorite.artifactIds.includes('artifact_snorky_fedora'), '愛用カードが実DPS入力へ反映されていません');
    assert.deepEqual(favorite.config.repeatPolicy, normal.config.repeatPolicy, '愛用置換後に基礎repeatPolicyが変質しています');
    assert.equal(favorite.run.repeatRolls.length > 0, true, '愛用DPS実行で70/20連鎖抽選が記録されません');
    const favoriteUi = await runDpsUi(cdp, page);
    assert.equal(favoriteUi.errors.length, 0, '愛用DPS UIにエラーがあります');
    assert.notEqual(favoriteUi.result, '', '愛用DPS UIの結果が空です');
    const favoriteVariantEvents = favorite.config.variants['スノキーのフェドーラ'] || [];
    assert.deepEqual(
      favoriteVariantEvents.filter(event => event.type === 'damage').map(event => event.effectId),
      ['Snorky_favorite_1_e01'],
      '愛用DPSのdamage eventが700%置換variantへ切り替わっていません'
    );
    assert.ok(
      favoriteVariantEvents.some(event => event.type === 'effect'
        && event.effectId === 'Snorky_favorite_1_e02'
        && event.effectValueKind === '気絶'
        && event.status === '気絶'),
      '愛用e02の気絶がdamageではなく状態付与eventとして接続されていません'
    );
    assert.deepEqual(
      favorite.profiles.enhanced.default.effects,
      [{ effectId: 'Snorky_favorite_1_e01', multiplier: 700, expectedDamage: favorite.profiles.enhanced.default.effects[0]?.expectedDamage, isAdditionalDamage: false }],
      '愛用enhanced profileへ基礎350%または追加ダメージが混在しています'
    );
    assert.equal(
      favorite.profiles.enhanced.default.totalExpectedDamage,
      favorite.profiles.enhanced.default.effects[0].expectedDamage,
      '愛用700%のprofile合計が単一の実ダメージ行と一致しません'
    );
    assert.ok(!favorite.runtime.runtimeEffectIds.includes('Snorky_favorite_1_e01'), '愛用e01がruntime追加ダメージとして二重接続されています');
    assert.equal(favorite.run.enhancedDamageEventCount, favorite.run.enhancedStarts.length, '愛用強化攻撃の実発生回数とdamage event数が一致しません');
    assert.ok(favorite.run.enhancedDamageTotal > 0, '愛用700%の実damage合計が0です');
    assert.ok(favorite.run.favoriteStunEventCount > 0, '愛用e02の気絶状態付与eventが実行されていません');

    const favoriteLowResume = await findLowResume(cdp, page);
    assert.ok(favoriteLowResume, '愛用実データの低学年優先→連鎖再開ケースを本番simulatorで確認できません');

    const sameSeedA = await evaluateRealSnapshot(cdp, page, { duration: 30, seed: 119 });
    const sameSeedB = await evaluateRealSnapshot(cdp, page, { duration: 30, seed: 119 });
    assert.deepEqual(sameSeedA.run.repeatRolls, sameSeedB.run.repeatRolls, '同seedで連鎖抽選が再現しません');
    assert.deepEqual(sameSeedA.run.starts, sameSeedB.run.starts, '同seedで行動系列が再現しません');

    // 1秒刻みで、実timing・実SP回復のまま測定終端に近い予約状態を探索する。
    const boundary = await browser.evaluate(cdp, page, `(() => {
      const input = window.TRICKCAL_DAMAGE_CALC.createDpsEvaluationInput();
      const timing = window.DPS_TIMING_DATA.apostles[String(input.targetId).toLowerCase()];
      const sim = window.TRICKCAL_DPS_SIMULATOR;
      const config = sim.buildCombatantConfig(input.apostle, timing, { scenario: input.scenario, skillLevels: input.skillLevels, skillOverrides: input.dpsSkillOverrides, timingBranches: input.dpsTimingBranches, runtimeEffects: input.dpsRuntimeSimulationEffects || input.runtimeEffects });
      for (const durationSeconds of [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) {
        const result = sim.simulate(config, { durationSeconds, initialActionDelayFrames: timing.initialActionDelayFrames || 0, highSkillMode: 'disabled', seed: 119, damageProfiles: input.actionDamageProfiles || {}, statusDamageProfiles: input.statusDamageProfiles || {}, recordTimeline: true, recordDamageSeries: false, enableFastForward: false });
        const pending = (result.timeline || []).filter(event => /pending|予約|repeat/i.test(JSON.stringify(event)) && /repeat|連続|予約/i.test(JSON.stringify(event)));
        const lastAction = (result.timeline || []).filter(event => event.type === 'actionStart').at(-1) || null;
        if (pending.length) return { durationSeconds, pending: pending.slice(-3), lastAction, finalState: result.finalState || result.state || null };
      }
      return null;
    })()`);

    console.log(JSON.stringify({
      ok: true,
      source: 'current generated apostles.js + dps-timing-data.js + production UI/simulator path',
      normal: { timing: normal.timing, policy: normal.config.repeatPolicy, profiles: normal.profiles, runtime: normal.runtime, ui: normalUi, run: { dps: normal.run.dps, enhancedDamageEventCount: normal.run.enhancedDamageEventCount, enhancedDamageTotal: normal.run.enhancedDamageTotal, enhancedDamageByEffect: normal.run.enhancedDamageByEffect, lowStarts: normal.run.lowStarts, finalState: normal.run.finalState, rolls: normal.run.repeatRolls.slice(0, 8), enhancedStarts: normal.run.enhancedStarts.slice(0, 12) } },
      favorite: { policy: favorite.config.repeatPolicy, variants: favorite.config.variants, profiles: favorite.profiles, runtime: favorite.runtime, ui: favoriteUi, run: { dps: favorite.run.dps, enhancedDamageEventCount: favorite.run.enhancedDamageEventCount, enhancedDamageTotal: favorite.run.enhancedDamageTotal, enhancedDamageByEffect: favorite.run.enhancedDamageByEffect, favoriteStunEventCount: favorite.run.favoriteStunEventCount, lowStarts: favorite.run.lowStarts, finalState: favorite.run.finalState, rolls: favorite.run.repeatRolls.slice(0, 8), enhancedStarts: favorite.run.enhancedStarts.slice(0, 12) } },
      lowResume: { normal: normalLowResume, favorite: favoriteLowResume },
      sameSeed: true,
      measurementBoundary: boundary
    }, null, 2));
  } finally {
    try { if (page && cdp) await cdp.send('Target.closeTarget', { targetId: page.targetId }); } catch (_) {}
    try { if (cdp) await cdp.send('Browser.close'); } catch (_) {}
    if (cdp) cdp.close();
    if (chrome && chrome.exitCode === null && !chrome.killed) chrome.kill();
    if (server && server.close) await new Promise(resolve => server.close(resolve));
    try { fs.rmSync(profileRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch (_) {}
  }
}

if (require.main === module) {
  run().catch(error => {
    process.stderr.write(`${error.stack || error}\n`);
    process.exitCode = 1;
  });
}

module.exports = { run, startRootServer };
