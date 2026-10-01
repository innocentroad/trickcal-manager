#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const browser = require('./storage-native-browser-check.js');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'tmp', 'epica-a2-calculator-ui-native');
const mime = {
  '.css':'text/css; charset=utf-8', '.html':'text/html; charset=utf-8',
  '.js':'application/javascript; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml'
};

function seedPage() {
  const state = {
    activeId:'Epica',
    apostles:{ Epica:{ level:120, star:3, grade:1, gradeConfigured:true, rank:1, bond:1,
      asideRank:2, asideLevel:40, skillLevels:{ low:1, high:1, passive:1 }, follow:false,
      equipment:{}, boards:{}, statSnapshots:{} } },
    formation:{ cardKind:'artifact', rows:Array.from({length:3},(_,index)=>({
      apostles:index===1?['Epica','','']:['','',''], resonancePersonalities:[null,null,null],
      artifacts:[['','',''],['','',''],['','','']][index]
    })), spells:[], masterPowers:[], coins:0, coinMode:'manual' },
    research:{}, cards:{}
  };
  const encodedState = JSON.stringify(JSON.stringify(state));
  const settings = JSON.stringify({ targetId:'Epica', perspective:'self', selectedSkillCategory:'基本攻撃', epicaA2EnemyCount:1 });
  return `<!doctype html><meta charset="utf-8"><script>
    localStorage.setItem('trickcal_stat_prototype_v1',${encodedState});
    localStorage.setItem('trickcal_formation_damage_settings_v1',${JSON.stringify(settings)});
    location.replace('/stat-dashboard.html?view=aside&epicaA2UiNative=1');
  </script>`;
}

async function run() {
  fs.mkdirSync(output, { recursive:true });
  const port = await browser.findFreePort();
  const cdpPort = await browser.findFreePort([port]);
  const origin = `http://127.0.0.1:${port}`;
  const server = http.createServer((request,response)=>{
    const url = new URL(request.url,origin);
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    if (relative === '__fixture') {
      response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
      response.end(seedPage()); return;
    }
    const file = path.resolve(root,relative);
    if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404); response.end('Not found'); return;
    }
    response.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
    response.end(fs.readFileSync(file));
  }).listen(port,'127.0.0.1');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(),'trickcal-epica-a2-ui-'));
  let chrome=null, cdp=null, page=null;
  try {
    await browser.waitForHttp(`${origin}/formation-damage-calc.html`);
    chrome=browser.startChild(browser.findChrome(),[
      `--user-data-dir=${profile}`,`--remote-debugging-port=${cdpPort}`,'--remote-debugging-address=127.0.0.1',
      '--no-first-run','--no-default-browser-check','--disable-sync','--disable-extensions',
      '--disable-background-networking','--window-size=1280,900','--new-window','about:blank'
    ],root);
    const version=await browser.waitFor(async()=>{const response=await fetch(`http://127.0.0.1:${cdpPort}/json/version`);return response.ok?response.json():null;},{timeoutMs:30000});
    cdp=new browser.CdpClient(version.webSocketDebuggerUrl); await cdp.connect();
    page=await browser.createPage(cdp,`${origin}/__fixture`);
    await cdp.send('Page.enable',{},page.sessionId);
    await cdp.send('Runtime.enable',{},page.sessionId);
    await browser.waitFor(async()=>browser.evaluate(cdp,page,`document.documentElement.dataset.storageBoot==='ready'
      && !!window.TRICKCAL_STAT_ENGINE
      && document.querySelector('[data-dashboard-panel="aside"]')?.classList.contains('is-active')`),{timeoutMs:30000});
    await browser.evaluate(cdp,page,'document.querySelector("#trickcal-announcements-dialog")?.close()');
    await browser.waitFor(async()=>browser.evaluate(cdp,page,'!document.body.classList.contains("is-booting")'),{timeoutMs:30000});
    const asideRankScreens=[];
    for (const rank of [1,2]) {
      await browser.evaluate(cdp,page,`(() => {const select=document.querySelector('#aside-rank-select');select.value=${JSON.stringify(String(rank))};select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
      await browser.waitFor(async()=>browser.evaluate(cdp,page,`(() => {
        const state=window.TRICKCAL_STAT_ENGINE.getApostleState('Epica');
        return document.querySelector('#aside-rank-select')?.value===${JSON.stringify(String(rank))}
          && state.asideRank===${rank}
          && state.statSnapshots?.current?.calculationVersion===window.TRICKCAL_SHARED_STAT_ENGINE.snapshotCalculationVersion;
      })()`),{timeoutMs:30000});
      const asideFacts=await browser.evaluate(cdp,page,`(() => ({
        rank:Number(document.querySelector('#aside-rank-select')?.value),
        cards:document.querySelectorAll('#aside-info-list .aside-info-card').length,
        images:[...document.querySelectorAll('#aside-info-list img[data-apostle-image]')].map(image=>({src:image.currentSrc||image.src,loaded:image.complete&&image.naturalWidth>0})),
        selectedRank:window.TRICKCAL_STAT_ENGINE.getApostleState('Epica').asideRank
      }))()`);
      assert.equal(asideFacts.rank,rank,`Epica A${rank} manager selector is applied`);
      assert.equal(asideFacts.selectedRank,rank,`Epica A${rank} saved setting is applied`);
      assert.equal(asideFacts.cards,4,'aside name plus all three rank detail cards remain visible');
      assert.equal(asideFacts.images.length,4);
      assert.ok(asideFacts.images.every(image=>image.loaded),`Epica A${rank} aside images load`);
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},page.sessionId);
      const filename=`epica-aside-A${rank}-1280.png`;
      fs.writeFileSync(path.join(output,filename),Buffer.from(shot.data,'base64'));
      asideRankScreens.push({rank,filename,images:asideFacts.images.length});
    }
    await browser.evaluate(cdp,page,'window.TRICKCAL_STAT_ENGINE.refreshSnapshots()');
    await browser.waitFor(async()=>browser.evaluate(cdp,page,`(() => {
      const state=window.TRICKCAL_STAT_ENGINE.getState().apostles?.Epica;
      const snapshot=state?.statSnapshots?.current;
      return snapshot?.calculationVersion===window.TRICKCAL_SHARED_STAT_ENGINE.snapshotCalculationVersion
        && !!snapshot?.internalTotals && !!snapshot?.breakdown;
    })()`),{timeoutMs:30000});
    await cdp.send('Page.navigate',{url:`${origin}/formation-damage-calc.html?epicaA2UiNative=1`},page.sessionId);
    await browser.waitFor(async()=>browser.evaluate(cdp,page,`document.documentElement.dataset.storageBoot==='ready'
      && !!window.TRICKCAL_DAMAGE_CALC
      && window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot()?.scenario?.actors?.self?.id==='Epica'`),{timeoutMs:30000});
    await browser.evaluate(cdp,page,'document.querySelector("#trickcal-announcements-dialog")?.close()');
    await browser.waitFor(async()=>browser.evaluate(cdp,page,'!document.body.classList.contains("is-booting")'),{timeoutMs:30000});

    const normalSelector=await browser.evaluate(cdp,page,`(() => {
      const buttons=[...document.querySelectorAll('#fdc-self-skill-choices [data-fdc-skill-key]')];
      const normal=buttons.find(button=>button.dataset.fdcSkillCategory==='基本攻撃'&&Number(button.dataset.fdcSkillValue)===100);
      return normal ? { selector:'#fdc-self-skill-choices [data-fdc-skill-key='+JSON.stringify(normal.dataset.fdcSkillKey)+']',key:normal.dataset.fdcSkillKey,category:normal.dataset.fdcSkillCategory||'',label:normal.innerText.trim() } : null;
    })()`);
    assert.ok(normalSelector, `画面に普通攻撃の行動選択肢がある: ${JSON.stringify(await browser.evaluate(cdp,page,`(() => ({target:document.querySelector('#fdc-target-preview')?.innerText||'',choices:[...document.querySelectorAll('#fdc-self-skill-choices button')].map(button=>({text:button.innerText.trim(),dataset:{...button.dataset},className:button.className})),container:document.querySelector('#fdc-self-skill-choices')?.innerHTML.slice(0,1600)||''}))()`))}`);
    await browser.clickSelector(cdp,page,normalSelector.selector);
    await browser.waitForSelector(cdp,page,'#fdc-epica-a2-enemy-count');
    const initial=await browser.evaluate(cdp,page,`(() => ({
      target:window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot()?.scenario?.actors?.self?.id,
      asideRank:window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot()?.scenario?.characterState?.apostles?.Epica?.asideRank,
      enemyCount:document.querySelector('#fdc-epica-a2-enemy-count')?.value,
      dpsDisabled:document.querySelector('[data-fdcp-mode="dps"]')?.disabled,
      dpsReason:document.querySelector('[data-fdcp-mode="dps"]')?.title||'',
      dpsAriaLabel:document.querySelector('[data-fdcp-mode="dps"]')?.getAttribute('aria-label')||'',
      visibleReasonControl:!!document.querySelector('#fdcp-dps-unavailable-details:not([hidden]) summary'),
      unavailableReason:document.querySelector('#fdcp-dps-unavailable-reason')?.textContent||'',
      icon:[...document.querySelectorAll('#fdc-target-preview img')].map(image=>({src:image.currentSrc||image.src,loaded:image.complete&&image.naturalWidth>0}))
    }))()`);
    assert.equal(initial.target,'Epica');
    assert.equal(Number(initial.asideRank),2,'A2 is restored from isolated saved state');
    assert.equal(initial.enemyCount,'1','single-enemy premise is the default');
    assert.equal(initial.dpsDisabled,true,'A2+ DPS remains disabled');
    assert.match(initial.dpsReason,/エピカA2以上はDPS未対応/,'DPS tab title exposes its specific unavailable reason');
    assert.match(initial.dpsAriaLabel,/DPS（利用不可:/,'DPS tab accessible name reports unavailable status');
    assert.equal(initial.visibleReasonControl,true,'DPS unavailability has a visible, tappable reason disclosure');
    assert.equal(initial.unavailableReason,initial.dpsReason,'visible reason text matches the disabled tab reason');

    await browser.clickSelector(cdp,page,'#fdc-result-detail-toggle');
    await browser.waitFor(async()=>browser.evaluate(cdp,page,'document.querySelector("#fdc-result-detail-panel")?.hidden===false'));
    const single=await browser.evaluate(cdp,page,`(() => ({
      result:document.querySelector('#fdc-result-normal')?.textContent.trim(),
      details:document.querySelector('#fdc-result-detail-grid')?.innerText||'',
      hit:window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot()?.result?.hitBreakdown,
      unavailable:window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot()?.result?.unavailable||'',
      enemyLabel:document.querySelector('.fdc-epica-a2-hit-setting')?.innerText||''
    }))()`);
    assert.notEqual(single.result,'—',`single-target normal damage is calculated: ${JSON.stringify(single)}`);
    assert.match(single.details,/基本攻撃1発分/,'visible detail separates one-hit damage');
    assert.match(single.details,/同じ敵へ加算|追加命中/,'visible detail identifies the additional hit');
    assert.equal(single.hit?.appliedAdditionalHitCount,1);
    const desktop=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},page.sessionId);
    fs.writeFileSync(path.join(output,'epica-a2-single-1280.png'),Buffer.from(desktop.data,'base64'));

    await browser.evaluate(cdp,page,`(() => {const select=document.querySelector('#fdc-epica-a2-enemy-count');select.value='2';select.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await browser.waitFor(async()=>browser.evaluate(cdp,page,`document.querySelector('#fdc-epica-a2-enemy-count')?.value==='2'
      && window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot()?.result?.hitBreakdown?.appliedAdditionalHitCount===0`));
    const multiple=await browser.evaluate(cdp,page,`(() => ({
      result:document.querySelector('#fdc-result-normal')?.textContent.trim(),
      details:document.querySelector('#fdc-result-detail-grid')?.innerText||'',
      hit:window.TRICKCAL_DAMAGE_CALC.createSingleActionSnapshot()?.result?.hitBreakdown,
      enemyLabel:document.querySelector('.fdc-epica-a2-hit-setting')?.innerText||''
    }))()`);
    assert.equal(multiple.hit?.appliedAdditionalHitCount,0,'multiple enemies do not add the random additional target to the selected target');
    assert.match(multiple.enemyLabel,/2体以上.*選択敵へ加算しない/,'visible control states the multiple-enemy premise');
    assert.match(multiple.enemyLabel,/行動回数・攻撃間隔は変えません/,'visible control states it does not multiply action count or interval');
    const mobile=await cdp.send('Emulation.setDeviceMetricsOverride',{width:375,height:844,deviceScaleFactor:1,mobile:true},page.sessionId);
    await browser.waitFor(async()=>browser.evaluate(cdp,page,'innerWidth===375'),{timeoutMs:5000});
    const mobileImage=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},page.sessionId);
    fs.writeFileSync(path.join(output,'epica-a2-multiple-375.png'),Buffer.from(mobileImage.data,'base64'));
    await browser.clickSelector(cdp,page,'#fdcp-dps-unavailable-details summary');
    await browser.waitFor(async()=>browser.evaluate(cdp,page,'document.querySelector("#fdcp-dps-unavailable-details")?.open===true'));
    const reasonPopover=await browser.evaluate(cdp,page,`(() => {
      const note=document.querySelector('#fdcp-dps-unavailable-reason');
      const rect=note?.getBoundingClientRect();
      return {text:note?.textContent||'',visible:!!rect&&rect.width>0&&rect.height>0,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
    })()`);
    assert.equal(reasonPopover.visible,true,'unsupported reason is visually exposed on mobile after tapping the disclosure');
    assert.match(reasonPopover.text,/強化攻撃発動率\+15%/);
    assert.equal(reasonPopover.scrollWidth<=reasonPopover.viewport,true,'reason popover does not create mobile horizontal overflow');
    const reasonImage=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},page.sessionId);
    fs.writeFileSync(path.join(output,'epica-dps-reason-375.png'),Buffer.from(reasonImage.data,'base64'));
    const final=await browser.evaluate(cdp,page,`(() => ({
      viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      dpsDisabled:document.querySelector('[data-fdcp-mode="dps"]')?.disabled,
      dpsReason:document.querySelector('[data-fdcp-mode="dps"]')?.title||'',
      brokenImages:[...document.images].filter(image=>image.getBoundingClientRect().width>0&&image.complete&&image.naturalWidth===0).map(image=>image.currentSrc||image.src)
    }))()`);
    assert.equal(final.viewport,375);
    assert.equal(final.scrollWidth<=final.viewport,true,'calculator has no horizontal overflow at 375px');
    assert.equal(final.dpsDisabled,true,'DPS remains disabled after enemy-count change');
    assert.deepEqual(final.brokenImages,[],'no visible image failures');
    console.log(JSON.stringify({result:'ok',asideRankScreens,normalOption:normalSelector,single:{result:single.result,hit:single.hit},multiple:{result:multiple.result,hit:multiple.hit},dps:{disabled:final.dpsDisabled,reason:final.dpsReason,mobileReasonVisible:reasonPopover.visible},screenshots:[path.relative(root,path.join(output,'epica-aside-A1-1280.png')),path.relative(root,path.join(output,'epica-aside-A2-1280.png')),path.relative(root,path.join(output,'epica-a2-single-1280.png')),path.relative(root,path.join(output,'epica-a2-multiple-375.png')),path.relative(root,path.join(output,'epica-dps-reason-375.png'))]},null,2));
  } finally {
    try { if(cdp) await cdp.send('Browser.close'); } catch (_) {}
    try { if(cdp) cdp.close(); } catch (_) {}
    try { if(chrome&&chrome.exitCode===null&&!chrome.killed) chrome.kill(); } catch (_) {}
    await new Promise(resolve=>server.close(resolve));
    if(path.resolve(profile).startsWith(`${path.resolve(os.tmpdir())}${path.sep}`)) {
      try { fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100}); } catch (_) {}
    }
  }
}

run().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
