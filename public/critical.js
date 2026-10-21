(async function(){
  'use strict';
  const boot=await window.TRICKCAL_STORAGE_BOOT;
  const storageReady=boot?.ok===true&&!!window.TRICKCAL_STORAGE_FACADE;
  const core=window.TRICKCAL_CRITICAL,math=window.TRICKCAL_DPS_SIMULATOR,$=id=>document.getElementById(id);
  const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
  const critMultiplierLower=math.clampCombatCritMultiplier(Number.NEGATIVE_INFINITY),critMultiplierUpper=math.clampCombatCritMultiplier(Number.POSITIVE_INFINITY);
  const multiplierLimit=value=>{if(!Number.isFinite(value))return '';if(Math.abs(value-critMultiplierLower)<1e-9)return '下限';if(Math.abs(value-critMultiplierUpper)<1e-9)return '上限';return '';};
  const measureResult=()=>document.documentElement.style.setProperty('--critical-result-height',$('critical-results').getBoundingClientRect().height+'px');
  new ResizeObserver(measureResult).observe($('critical-results'));
  const fitViewport=()=>{document.documentElement.style.setProperty('--critical-keyboard-offset',Math.max(0,innerHeight-(window.visualViewport?.height||innerHeight)-(window.visualViewport?.offsetTop||0))+'px');measureResult();};
  window.visualViewport?.addEventListener('resize',fitViewport);window.visualViewport?.addEventListener('scroll',fitViewport);window.addEventListener('resize',fitViewport);fitViewport();
  const positionHelp=details=>{const popup=details.querySelector(':scope > p'),anchor=details.querySelector(':scope > summary');if(!details.open||!popup||!anchor)return;const margin=8,viewportHeight=window.visualViewport?.height||innerHeight;popup.style.left=margin+'px';popup.style.top=margin+'px';const anchorRect=anchor.getBoundingClientRect(),popupRect=popup.getBoundingClientRect(),left=Math.max(margin,Math.min(anchorRect.left,innerWidth-margin-popupRect.width));let top=anchorRect.bottom+4;if(top+popupRect.height>viewportHeight-margin)top=anchorRect.top-popupRect.height-4;if(top<margin)top=margin;popup.style.left=left+'px';popup.style.top=top+'px';details.dataset.helpPositioned='true';};
  const helpItems=[...document.querySelectorAll('.boost-help')];helpItems.forEach(details=>details.addEventListener('toggle',()=>{if(details.open)positionHelp(details);else{delete details.dataset.helpPositioned;const popup=details.querySelector(':scope > p');if(popup){popup.style.left='';popup.style.top='';}}}));
  const repositionOpenHelp=()=>helpItems.filter(details=>details.open).forEach(positionHelp);window.addEventListener('resize',repositionOpenHelp);window.addEventListener('scroll',repositionOpenHelp,true);window.visualViewport?.addEventListener('resize',repositionOpenHelp);
  const KEY='trickcal_tool_critical_settings_v1',LOCK='trickcal-tool-critical-input-v1',writer=crypto.randomUUID();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const asset=p=>window.TRICKCAL_PUBLIC_SITE?.assetUrl(p)||'../'+p;
  const nfmt=(v,d=2)=>Number(v).toLocaleString('ja-JP',{maximumFractionDigits:d});
  const percent=v=>nfmt(v*100)+'%';
  const boosts=()=>s.side==='self'?['会心率アップ','会心ダメージ量アップ']:['会心抵抗アップ','会心ダメージ抵抗アップ'];
  const activeKeys=()=>s.side==='self'?core.KEYS.slice(0,2):core.KEYS.slice(2);
  const oppositeKeys=()=>s.side==='self'?core.KEYS.slice(2):core.KEYS.slice(0,2);
  let s=core.defaults(),revision=null,timer=null,dirty=false,blocked=false,frozen=false,epoch=0,manager={},cardIndex={},cardLibrary=null;
  let leaseHeld=false,leaseRelease=null,leasePending=null;
  const loads=new Map();
  function loadScript(file){if(!loads.has(file))loads.set(file,new Promise((resolve,reject)=>{const e=document.createElement('script');e.src=asset(file);e.onload=resolve;e.onerror=()=>{loads.delete(file);reject(Error('データを読み込めませんでした。再度お試しください。'));};document.head.append(e);}));return loads.get(file);}
  async function ensureCards(){if(cardLibrary)return;await loadScript('cards.js');cardIndex=window.TRICKCAL_CARD_INDEX;cardLibrary=window.TRICKCAL_CARD_LIBRARY;}
  async function ensureStats(){await loadScript('statData.js');await loadScript('public-release-config.js');await loadScript('stat-engine.js');}
  function readManager(){try{if(!storageReady)throw Error();const raw=window.TRICKCAL_STORAGE_FACADE.localStorage.getItem('trickcal_stat_prototype_v1');manager=raw?JSON.parse(raw):{};if(!manager||typeof manager!=='object'||Array.isArray(manager))throw Error();if(typeof migrateCardStateMap==='function')manager.cards=migrateCardStateMap(manager.cards||{});return manager;}catch{throw Error('管理の保存値を読み込めませんでした。');}}
  const cardById=id=>Object.prototype.hasOwnProperty.call(cardIndex,id)?cardIndex[id]:null;
  const preset=()=>Object.prototype.hasOwnProperty.call(ENEMY_PRESETS,s.enemy.key)?ENEMY_PRESETS[s.enemy.key]:null;
  const metadata=()=>preset()?getEnemyPresetMetadata(preset(),s.enemy.key):null;
  const rules=()=>metadata()?.rules||{};
  const mode=()=>s.modes[s.side];
  const cardRows=()=>s.cards[mode()]||[];
  const activeCardRows=()=>mode()==='direct'?[]:cardRows();
  const result=changed=>core.calculate(s,preset(),cardIndex,math,{spellsDisabled:rules().disabledEffectSources?.includes('spell'),changed});
  function status(message=''){const e=$('save-status');e.hidden=!message;e.querySelector('span').textContent=message;}
  function error(e){$('calculation-note').textContent=e.message||String(e);$('calculation-note').classList.add('error');}
  function storedEnvelope(raw){if(raw==null)return null;const v=JSON.parse(raw);if(v.version!==1||!Number.isSafeInteger(v.revision)||v.revision<1||typeof v.writer!=='string')throw Error('保存形式を確認できません。書き出しか初期化を選んでください。');core.encode(v.settings);return {revision:v.revision,writer:v.writer,settings:core.normalize(v.settings)};}
  async function hydrate(){clearTimeout(timer);timer=null;epoch++;if(!storageReady)return;try{const v=storedEnvelope(window.TRICKCAL_STORAGE_FACADE.localStorage.getItem(KEY));revision=v?.revision??null;s=v?.settings||core.defaults();if(s.enemy.key){s.enemy.key=resolveEnemyPresetKey(s.enemy.key);s.enemy.key=ENEMY_PRESETS[s.enemy.key]?.selectionAliasOf||s.enemy.key;}
      if(Object.values(s.modes).some(v=>v!=='direct'))await ensureCards();if(cardLibrary)for(const rows of Object.values(s.cards)){for(const row of rows)row.id=resolveCardIdAlias(row.id);normalizeArtifactSlots(rows);}
      dirty=false;blocked=false;status();await prepareMode();render();
    }catch(e){blocked=true;status(e.message||'保存内容を確認できません。');render();}}
  function acquireLease(){
    if(leaseHeld)return Promise.resolve(true);if(leasePending)return leasePending;if(!navigator.locks)return Promise.resolve(false);
    const requestEpoch=epoch;
    leasePending=new Promise(resolve=>{
      navigator.locks.request(LOCK,{ifAvailable:true},async lock=>{
        if(!lock||requestEpoch!==epoch){resolve(false);return;}
        leaseHeld=true;let release;const held=new Promise(r=>release=r);leaseRelease=release;resolve(true);await held;leaseHeld=false;leaseRelease=null;
      }).catch(()=>resolve(false));
    }).then(value=>{leasePending=null;return value;});return leasePending;
  }
  function saveNow(force=false){
    clearTimeout(timer);timer=null;if(!dirty)return {ok:true};
    if(!storageReady||!leaseHeld){status('別タブを閉じて再保存するか、入力を書き出してください。');return {ok:false,code:'busy'};}
    if(blocked&&!force)return {ok:false,code:'busy'};
    try{
      const raw=window.TRICKCAL_STORAGE_FACADE.localStorage.getItem(KEY);let old;try{old=storedEnvelope(raw);}catch(e){blocked=true;status(e.message);return {ok:false,code:'invalid-data'};}
      if(!force&&(old?.revision??null)!==revision){blocked=true;status('別タブで更新されました。読込か、この内容で保存を選べます。');return {ok:false,code:'busy'};}
      const settings=JSON.parse(core.encode(s)).settings,next=(old?.revision||0)+1;
      window.TRICKCAL_STORAGE_FACADE.localStorage.setItem(KEY,JSON.stringify({version:1,revision:next,writer,settings}));revision=next;dirty=false;blocked=false;status();return {ok:true};
    }catch(e){status('未保存：入力を書き出すか、保存を再試行してください。');return {ok:false,code:e.result?.code||'write-failed'};}
  }
  async function save(force=false){const requestEpoch=epoch;if(frozen)return {ok:false,code:'busy'};await acquireLease();if(requestEpoch!==epoch)return {ok:true};return saveNow(force);}
  function changed(){dirty=true;clearTimeout(timer);if(!blocked&&!frozen)timer=setTimeout(()=>save(),500);renderResult();}
  function inputField(label,value,attributes=''){return `<label>${esc(label)}<input type="number" step="any" inputmode="decimal" value="${esc(value)}" ${attributes}></label>`;}
  function growthDelta(fields){if(fields.current===''||fields.next===''||!Number.isFinite(Number(fields.current))||!Number.isFinite(Number(fields.next)))return '';return String(Number((Number(fields.next)-Number(fields.current)).toPrecision(15)));}
  function growthNumber(value){return String(Number(Number(value).toPrecision(15)));}
  function updateGrowthProjection(key,{clearDelta=false}={}){
    const row=$('growth-fields').querySelector(`[data-growth-row="${key}"]`),current=row?.querySelector('[data-growth-field="current"]'),delta=row?.querySelector('[data-growth-field="delta"]'),sign=row?.querySelector('[data-growth-sign]'),preview=row?.querySelector('[data-growth-preview]'),feedback=row?.querySelector('[data-growth-feedback]'),fields=s.growth.fields[key];
    if(!row||!current||!delta||!sign||!preview||!feedback)return;
    if(clearDelta){delta.value='';}
    delta.disabled=current.value==='';
    sign.textContent=delta.value!==''&&Number(delta.value)>=0?'+':'';
    feedback.textContent='';feedback.classList.remove('error');
    if(current.value===''){fields.next='';feedback.textContent='現在値を入力';return;}
    if(delta.value===''||!Number.isFinite(Number(current.value))||!Number.isFinite(Number(delta.value))){fields.next='';if(delta.value==='')feedback.textContent='変更量を入力';return;}
    const target=Number(current.value)+Number(delta.value);
    if(!Number.isFinite(target)||target<0){fields.next='';feedback.textContent='変更後の合計は0%以上にしてください。';feedback.classList.add('error');return;}
    fields.next=growthNumber(target);preview.textContent=`（${nfmt(target)}%）`;
  }
  function normalizeArtifactSlots(rows){
    const used=new Set();
    for(const row of rows){if(cardById(row.id)?.kind!=='artifact'){delete row.slot;continue;}if(Number.isInteger(row.slot)&&row.slot>=0&&row.slot<3&&!used.has(row.slot)){used.add(row.slot);continue;}const free=[0,1,2].find(slot=>!used.has(slot));if(free==null){delete row.slot;continue;}row.slot=free;used.add(free);}
  }
  function cardTotals(rows){return rows.reduce((a,row)=>{const card=cardById(row.id);if(!card||rules().disabledEffectSources?.includes('spell')&&card.kind==='spell')return a;const b=core.cardBonuses(card,row);a[0]+=s.side==='self'?b.critRateP||0:b.critResAddP||0;a[1]+=s.side==='self'?b.critDmgAddP||0:b.critDmgResAddP||0;return a;},[0,0]);}
  function displayedBoosts(){const active=cardTotals(activeCardRows());return [0,1].map(i=>Number((Number(s.direct[s.side][i?'damage':'rate']||0)+active[i]).toFixed(6)));}
  function buildFields(){
    $('ally-inputs').innerHTML=activeKeys().map(k=>inputField(core.LABELS[k],s.ally[k],`min="0" data-ally="${k}"`)).join('');
    $('stat-buffs').innerHTML=activeKeys().map(k=>inputField(core.LABELS[k]+'（%）',s.buffs[k],`min="-100" data-buff="${k}"`)).join('');
    const fields=boosts().map((label,i)=>inputField(label+'（%）',displayedBoosts()[i],`data-direct="${i?'damage':'rate'}"`)).join('');
    $('direct-inputs').innerHTML=fields;
    const enemy=core.enemyStats(preset(),s.enemy.phase);
    $('enemy-overrides').innerHTML=oppositeKeys().map(k=>inputField(core.LABELS[k],s.enemy.overrides[k]??'',`min="0" data-enemy-stat="${k}" placeholder="${esc(enemy[k]??'未設定')}"`)).join('');
    $('enemy-stat-display').innerHTML=oppositeKeys().map(k=>{const value=own(s.enemy.overrides,k)?s.enemy.overrides[k]:enemy[k];return `<div class="enemy-stat"><span>${esc(core.LABELS[k])}</span><strong>${value==null||value===''?'—':esc(nfmt(value,2))}</strong></div>`;}).join('');
    const keys=activeKeys();
    $('growth-fields').innerHTML=`<div class="growth-table" role="table" aria-label="全体強化値の比較"><div class="growth-row growth-header" role="row"><span role="columnheader">項目</span><span role="columnheader">現在合計（%）</span><span role="columnheader">変更量（%）</span></div>${keys.map(k=>{const fields=s.growth.fields[k],delta=growthDelta(fields),preview=fields.current!==''&&fields.next!==''?`（${nfmt(fields.next)}%）`:'';return `<div class="growth-row" role="row" data-growth-row="${k}"><span class="growth-name" role="rowheader">${esc(core.LABELS[k])}</span><label class="growth-input-cell" role="cell"><span class="visually-hidden">${esc(core.LABELS[k])}の現在合計（%）</span><input type="number" min="0" step="any" inputmode="decimal" value="${esc(fields.current)}" data-growth="${k}" data-growth-field="current" aria-label="${esc(core.LABELS[k])}の現在合計（%）"></label><div class="growth-delta-cell" role="cell"><label class="growth-input-cell"><span class="visually-hidden">${esc(core.LABELS[k])}の変更量（%）</span><span class="growth-delta-input"><span data-growth-sign aria-hidden="true">${delta!==''&&Number(delta)>=0?'+':''}</span><input type="number" step="any" inputmode="decimal" value="${esc(delta)}" data-growth="${k}" data-growth-field="delta" aria-label="${esc(core.LABELS[k])}の変更量（%）"${fields.current===''?' disabled':''}><span data-growth-preview aria-label="変更後の合計">${preview}</span></span></label><small data-growth-feedback role="status">${fields.current===''?'現在値を入力':fields.next===''?'変更量を入力':''}</small></div></div>`;}).join('')}</div>`;
  }
  function render(){
    document.documentElement.dataset.criticalReady='true';$('direction').textContent=s.side==='self'?'味方 → 敵 ⇄':'敵 → 味方 ⇄';$('direction').setAttribute('aria-label',s.side==='self'?'敵から味方への会心計算に切り替える':'味方から敵への会心計算に切り替える');
    $('source-note').hidden=!s.source;$('source-note').textContent=s.source?`${s.source.name}・管理の値（${s.source.grade}年生）。戦闘中に変わる分は調整してください。`:'';
    const p=preset(),meta=metadata();enemyOptions();
    $('phase-wrap').hidden=!(p?.phases?.length);$('enemy-phase').innerHTML=(p?.phases||[]).map((v,i)=>`<option value="${i}">${esc(v.name||v.label||'Phase '+i)}</option>`).join('');$('enemy-phase').value=String(s.enemy.phase);
    const notes=[meta?.rules.disabledEffectSources?.includes('spell')?'この敵ではスペル効果は適用されません':''].filter(Boolean);$('content-note').textContent=notes.join(' / ');$('content-note').hidden=!notes.length;
    $('growth-enabled').checked=s.growth.enabled;
    buildFields();renderPresetSummary();renderFormation();renderResult();
  }
  function renderResult(){
    const r=result(false),comp=s.growth.enabled?result(true):null;
    $('chance-label').textContent=s.side==='self'?'会心率':'受ける攻撃の会心率';
    $('chance').textContent=r.error?'—':percent(r.rate);$('multiplier').textContent=r.error?'—':percent(r.multiplier);
    $('chance').dataset.value=r.error?'':String(r.rate);$('multiplier').dataset.value=r.error?'':String(r.multiplier);
    $('chance-change').textContent='';$('multiplier-note').textContent=r.error?'':multiplierLimit(r.multiplier);
    if(!r.error&&r.rate>=1)$('chance-change').textContent='上限';
    if(comp&&!r.error&&!comp.error){
      $('chance-change').textContent=`→ ${percent(comp.rate)}（${nfmt((comp.rate-r.rate)*100)}pt）`;
      const baseLimit=multiplierLimit(r.multiplier),changedLimit=multiplierLimit(comp.multiplier),limits=[baseLimit&&`現在${baseLimit}`,changedLimit&&`変更後${changedLimit}`].filter(Boolean);
      $('multiplier-note').textContent=[`→ ${percent(comp.multiplier)}（${nfmt((comp.multiplier-r.multiplier)*100)}pt）${comp.approximate?' · 概算':''}`, ...limits].join(' · ');
    }
    $('calculation-note').textContent=r.error||comp?.error||'';$('calculation-note').classList.toggle('error',!!(r.error||comp?.error));
  }
  const options=(max,value,prefix)=>Array.from({length:max},(_,i)=>`<option value="${i+1}"${value===i+1?' selected':''}>${prefix}${i+1}</option>`).join('');
  function cardImage(card){return asset(`img/Card/${card.kind==='spell'?'Spell':'Artifact'}/${card.name}.webp`);}
  function bonusText(card,row){const b=core.cardBonuses(card,row),v=s.side==='self'?[b.critRateP,b.critDmgAddP]:[b.critResAddP,b.critDmgResAddP];return v.map((value,i)=>value?`${boosts()[i]} +${nfmt(value)}%`:'').filter(Boolean).join(' / ')||'この方向の率・倍率への補正なし';}
  function spellEffectChips(card,row){const b=core.cardBonuses(card,{...row,qty:1}),effects=s.side==='self'?[[b.critRateP,'会心','img/会心.webp','critRateP'],[b.critDmgAddP,'会心DMG','img/会心ダメージ.webp','critDmgAddP']]:[[b.critResAddP,'会心抵抗','img/会心抵抗.webp','critResAddP'],[b.critDmgResAddP,'会心DMG抵抗','img/会心DMG抵抗.webp','critDmgResAddP']];return effects.filter(([value])=>Number.isFinite(Number(value))&&Number(value)!==0).map(([raw,label,icon,key])=>{const value=Number(raw),formatted=`${value>0?'+':''}${nfmt(value)}%`;return `<span class="spell-effect-chip" data-spell-bonus="${key}" data-bonus-value="${value}" title="${esc(`${label} ${formatted}（1枚あたり）`)}"><img src="${esc(asset(icon))}" alt=""><b>${formatted}</b></span>`;}).join('');}
  let modalRows=null;
  let modalKind='artifact';
  let artifactPickerOpen=false;
  let artifactTargetSlot=null;
  let modalSpellDrafts=new Map();
  function cardInfo(card,row){return `<button type="button" class="card-image-button" data-card-info="${esc(card.id)}" data-card-star="${row.star}" data-card-solder="${row.solder}" data-card-qty="${row.qty}" aria-label="${esc(card.name)}の効果を表示"><img src="${esc(cardImage(card))}" alt=""></button>`;}
  function initializeSpellDrafts(){
    modalSpellDrafts=new Map();const defaults=core.initialCardState(manager.cards||{},s.cardDefault);
    for(const card of Object.values(cardIndex).filter(item=>item.kind==='spell')){
      const existing=modalRows.find(row=>row.id===card.id),initial=defaults.get(card.id);
      modalSpellDrafts.set(card.id,existing||{id:card.id,...initial,qty:0,conditions:{}});
    }
  }
  function artifactSlotRow(slot,entry){
    const label=`遺物${slot+1}`;
    if(!entry)return `<div class="artifact-equip-slot empty" data-artifact-slot-row="${slot}"><button type="button" class="artifact-equip-icon" data-artifact-slot-open="${slot}" aria-label="${label}を選ぶ"><span>＋</span></button><div class="artifact-equip-main"><strong>${label}</strong><small>未装備</small></div><button type="button" class="artifact-equip-select" data-artifact-slot-open="${slot}">選ぶ</button></div>`;
    const {row,index}=entry,card=cardById(row.id);
    if(!card)return `<div class="artifact-equip-slot" data-artifact-slot-row="${slot}"><span class="artifact-equip-icon">${slot+1}</span><div class="artifact-equip-main"><strong>${label}</strong><small>カードを確認できません</small></div><button type="button" data-remove="${index}" aria-label="${label}を解除">×</button></div>`;
    return `<div class="artifact-equip-slot filled" data-artifact-slot-row="${slot}"><div class="artifact-equip-icon">${cardInfo(card,row)}</div><div class="artifact-equip-main"><div class="artifact-equip-heading"><strong>${label}</strong><span title="${esc(card.name)}">${esc(card.name)}</span></div><div class="artifact-equip-growth"><label>★<select data-artifact-slot="${slot}" data-artifact-field="star">${options(5,row.star,'★')}</select></label><label>はんだ<select data-artifact-slot="${slot}" data-artifact-field="solder"${row.star<5?' disabled':''}>${[0,1,2].map(v=>`<option value="${v}"${row.solder===v?' selected':''}>+${v}</option>`).join('')}</select></label></div></div><div class="artifact-equip-actions"><button type="button" data-artifact-slot-open="${slot}" aria-label="${label}を変更" title="変更">↻</button><button type="button" data-remove-slot="${slot}" aria-label="${label}を解除" title="解除">×</button></div></div>`;
  }
  function renderPresetRows(){
    const rows=modalRows||[];
    const artifacts=rows.map((row,i)=>({row,i})).filter(v=>cardById(v.row.id)?.kind==='artifact');
    $('selected-artifacts').innerHTML=Array.from({length:3},(_,slot)=>artifactSlotRow(slot,artifacts.find(v=>v.row.slot===slot))).join('');
    const overflow=artifacts.filter(v=>!Number.isInteger(v.row.slot)||v.row.slot<0||v.row.slot>2);$('artifact-overflow').hidden=!overflow.length;$('artifact-overflow').innerHTML=overflow.length?`<p>以前の保存内容に3枠を超える遺物があります。不要なものを外してください。</p>${overflow.map(({row,i})=>`<div class="artifact-overflow-row"><span>${esc(cardById(row.id)?.name||'遺物')}</span><button type="button" data-remove="${i}" aria-label="${esc(cardById(row.id)?.name||'遺物')}を外す">×</button></div>`).join('')}`:'';
    $('selected-cards').innerHTML=Object.values(cardIndex).filter(card=>card.kind==='spell'&&core.relevant(card,s.side)).map(card=>{
      const row=modalSpellDrafts.get(card.id)||{id:card.id,qty:0,star:5,solder:0,conditions:{}},selected=row.qty>0,disabled=rules().disabledEffectSources?.includes('spell');
      return `<article class="spell-option${selected?' selected':''}" data-spell-option="${esc(card.id)}"><span class="spell-card-art">${cardInfo(card,row)}<b>★${row.star}</b><span class="spell-effect-chips">${spellEffectChips(card,row)}</span></span><strong class="spell-card-name" title="${esc(card.name)}">${esc(card.name)}</strong><div class="spell-growth-controls"><label><span>★</span><select data-spell-field="star" data-spell-id="${esc(card.id)}">${options(5,row.star,'★')}</select></label><label><span>はんだ</span><select data-spell-field="solder" data-spell-id="${esc(card.id)}"${row.star<5?' disabled':''}>${[0,1,2].map(v=>`<option value="${v}"${v===row.solder?' selected':''}>+${v}</option>`).join('')}</select></label></div><div class="spell-quantity" aria-label="${esc(card.name)}の枚数"><span class="quantity-stepper"><button type="button" class="qty-step" data-spell-step="-1" aria-label="${esc(card.name)}を1枚減らす"${row.qty<=0?' disabled':''}>−</button><input type="number" min="0" max="99" step="1" value="${row.qty}" data-spell-qty="${esc(card.id)}" aria-label="${esc(card.name)}の枚数"><button type="button" class="qty-step" data-spell-step="1" aria-label="${esc(card.name)}を1枚増やす"${row.qty>=99?' disabled':''}>＋</button></span></div>${disabled?'<small class="spell-disabled-note">この敵では適用されません</small>':''}</article>`;
    }).join('')||'<p class="hint">該当するスペルはありません。</p>';
    renderPresetSummary(rows,false);
  }
  function renderPresetSummary(rows=activeCardRows(),updateMain=true){const artifacts=rows.filter(row=>cardById(row.id)?.kind==='artifact'&&Number.isInteger(row.slot)&&row.slot>=0&&row.slot<3),spells=rows.filter(row=>cardById(row.id)?.kind==='spell'),artifactCount=`${Math.min(3,artifacts.length)}/3`,counts=`遺物 ${artifactCount}・スペル ${spells.length}`;if(updateMain)$('preset-counts').textContent=counts;$('artifact-count').textContent=artifactCount;$('spell-count').textContent=String(spells.length);}
  function commitPresetDraft(){if(!modalRows)return;s.cards.card=structuredClone(modalRows);s.modes[s.side]='card';changed();render();}
  function syncSpellQtyControls(id){const option=[...document.querySelectorAll('.spell-option')].find(item=>item.querySelector('[data-spell-qty]')?.dataset.spellQty===id),row=modalSpellDrafts.get(id);if(!option||!row)return;const input=option.querySelector('[data-spell-qty]'),qty=Math.max(0,Math.min(99,Math.trunc(Number(row.qty)||0)));row.qty=qty;input.value=String(qty);option.querySelector('[data-spell-step="-1"]').disabled=qty<=0;option.querySelector('[data-spell-step="1"]').disabled=qty>=99;option.classList.toggle('selected',qty>0);const index=modalRows.findIndex(item=>item.id===id);if(qty>0&&index<0)modalRows.push(row);else if(qty===0&&index>=0)modalRows.splice(index,1);renderPresetSummary(modalRows,false);}
  function renderCatalog(){
    const rows=modalRows||[];
    if(modalKind!=='artifact'||!artifactPickerOpen||!Number.isInteger(artifactTargetSlot)||artifactTargetSlot<0||artifactTargetSlot>2){ $('card-catalog').replaceChildren();return; }
    $('card-catalog').innerHTML=Object.values(cardIndex).filter(card=>card.kind==='artifact'&&core.relevant(card,s.side)).map(card=>{
      const selected=rows.some(row=>row.id===card.id&&row.slot===artifactTargetSlot&&cardById(row.id)?.kind==='artifact');
      return `<div class="catalog-card${selected?' selected':''}"><button type="button" class="artifact-choice" data-add="${esc(card.id)}" aria-label="${esc(card.name)}を${selected?'選択中':'選ぶ'}"><img src="${esc(cardImage(card))}" alt=""><span>${esc(card.name)}</span></button></div>`;
    }).join('')||'<p class="hint">該当するカードはありません。</p>';
  }
  function setPresetKind(kind){modalKind=kind;artifactPickerOpen=false;$('artifact-management').hidden=kind!=='artifact';$('spell-management').hidden=kind!=='spell';$('clear-selected-cards').textContent=kind==='artifact'?'遺物全解除':'スペル全解除';document.querySelectorAll('[data-preset-kind]').forEach(button=>{button.setAttribute('aria-selected',String(button.dataset.presetKind===kind));});renderPresetRows();renderCatalog();}
  function formations(){return [{id:'',name:'現在の編成',formation:manager.formation||{}},...(manager.savedFormations||[]).filter(v=>v&&typeof v.id==='string'&&v.formation)];}
  function selectedFormation(){return formations().find(v=>v.id===s.formationId)?.formation||null;}
  function renderFormation(){
    $('formation-select').innerHTML=formations().map(v=>`<option value="${esc(v.id)}">${esc(v.name||v.label||'保存編成')}</option>`).join('');$('formation-select').value=s.formationId;
    const f=selectedFormation(),ids=[...new Set((f?.rows||[]).flatMap(r=>r.apostles||[]).filter(Boolean))],data=window.TRICKCAL_STAT_DATA;
    const basics=data?.sheets?.basicInfo||[];$('member-select').innerHTML='<option value="">使徒を選択</option>'+ids.map(id=>`<option value="${esc(id)}">${esc(basics.find(b=>b.id===id)?.使徒名||'使徒')}</option>`).join('');$('member-select').value=s.memberId;$('load-member').disabled=!ids.includes(s.memberId);
  }
  async function prepareMode(){if(Object.values(s.modes).some(value=>value!=='direct')){await ensureCards();try{readManager();}catch(e){error(e);}for(const rows of Object.values(s.cards))normalizeArtifactSlots(rows);}if(mode()==='formation')await ensureStats();}
  async function loadMember(){
    await ensureStats();await ensureCards();readManager();const f=selectedFormation(),id=s.memberId,basic=window.TRICKCAL_STAT_DATA.sheets.basicInfo.find(b=>b.id===id),unit=manager.apostles?.[id];
    if(!basic||!unit||(f?.rows||[]).every(r=>!r.apostles?.includes(id)))throw Error('管理の使徒と編成を選び直してください。');
    const grade=Number($('grade').value);if(!Number.isInteger(grade)||grade<1||grade>6)throw Error('読み込む学年を選択してください。');s.grade=String(grade);s.statMode=$('stat-mode').value;
    let snapshot=unit.statSnapshots?.[s.statMode]||(s.statMode==='planned'?unit.statSnapshots?.current:null);
    if(!snapshot?.stats)throw Error('保存されたステータスがありません。管理で保存するか、戦闘時の数値を入力してください。');
    const engine=window.TRICKCAL_SHARED_STAT_ENGINE;
    if(!engine.hasCompleteBreakdown(snapshot))throw Error('ステータスの内訳が不足しています。管理で保存し直すか、戦闘時の数値を入力してください。');
    if(Number(snapshot.calculationVersion)!==engine.snapshotCalculationVersion){
      if(!engine.canRebuildLegacySnapshot(window.TRICKCAL_STAT_DATA,basic,unit,snapshot,{mode:s.statMode,research:manager.research}))throw Error('古いステータスを再計算できません。管理で保存し直すか、戦闘時の数値を入力してください。');
      snapshot=engine.applyApostleOverridesToSnapshot(window.TRICKCAL_STAT_DATA,basic,unit,{snapshot,mode:s.statMode});if(!snapshot)throw Error('管理のステータスを再計算できませんでした。');
    }
    if(Number(snapshot.overrideState?.grade||unit.grade||1)!==grade){
      snapshot=engine.applyGradeOverrideToSnapshot(window.TRICKCAL_STAT_DATA,basic,unit,{snapshot,mode:s.statMode,grade});if(!snapshot)throw Error('学年を合わせたステータスを取得できません。戦闘時の値を入力してください。');
    }
    const values={};for(const key of core.KEYS){const v=snapshot.internalTotals?.[key]??snapshot.stats[key];if(typeof v!=='number'||!Number.isFinite(v)||v<0)throw Error('保存された会心系ステータスを確認できません。');values[key]=String(v);}
    s.ally=values;s.source={id,name:basic.使徒名,grade,bases:{}};
    for(const k of core.KEYS){const rate=snapshot.globalPercentRates?.[k],increase=snapshot.breakdown?.globalPercent?.[k],base=Number(values[k])-increase,follow=engine.followFraction(snapshot.overrideState||unit,k);
      if(typeof rate==='number'&&Number.isFinite(rate)&&rate>=0&&typeof increase==='number'&&Number.isFinite(increase)&&base>=0){s.source.bases[k]={base,rate,follow};s.growth.fields[k]={current:String(rate),next:String(rate)};}
    }
    const row=(f.rows||[]).find(r=>r.apostles?.includes(id)),formationSlot=row.apostles.indexOf(id),ids=[...(row.artifacts?.[formationSlot]||[]),...(f.spells||[])].filter(Boolean).map(resolveCardIdAlias),counts=new Map();for(const cardId of ids)counts.set(cardId,(counts.get(cardId)||0)+1);
    const artifactCopies=[...counts].reduce((total,[id,qty])=>total+(cardById(id)?.kind==='artifact'?qty:0),0);if(artifactCopies>3)throw Error('この編成の遺物が3枠を超えているため、自動読込できません。強化プリセットから遺物を選び直してください。');
    const init=core.initialCardState(manager.cards||{},s.cardDefault);let nextSlot=0;s.cards.formation=[...counts].flatMap(([cardId,qty])=>{const card=cardById(cardId),growth=init.get(cardId);if(card?.kind==='artifact')return Array.from({length:qty},()=>({id:cardId,qty:1,...growth,conditions:{},slot:nextSlot++}));return [{id:cardId,qty,...growth,conditions:{}}];});s.modes[s.side]='formation';changed();render();$('formation-dialog').close();
  }
  const entries=Object.entries(ENEMY_PRESETS).filter(([k,p])=>!p.hideInSelection&&!p.selectionAliasOf&&!ENEMY_PRESET_CONTENTS[getEnemyPresetMetadata(p,k).type]?.hideInSelection).sort(compareEnemyPresetEntries);
  const group=(k,p)=>{const m=getEnemyPresetMetadata(p,k);return m.type+':'+m.mode;};
  const stageKey=(k,p)=>{const m=getEnemyPresetMetadata(p,k);return JSON.stringify([m.difficulty,m.world,m.stage,m.personality]);};
  let pendingGroup='',pendingStage='';
  function enemyOptions(){
    const groups=new Map(entries.map(([k,p])=>{const m=getEnemyPresetMetadata(p,k);return [group(k,p),m.modeLabel||m.contentLabel||'その他'];}));
    if(preset()){pendingGroup=group(s.enemy.key,preset());pendingStage=stageKey(s.enemy.key,preset());}
    $('enemy-content').innerHTML='<option value="">選択</option>'+[...groups].map(([k,v])=>`<option value="${esc(k)}">${esc(v)}</option>`).join('');$('enemy-content').value=pendingGroup;stageOptions();
  }
  function stageOptions(){
    const candidates=entries.filter(([k,p])=>group(k,p)===pendingGroup),stages=new Map(candidates.map(([k,p])=>{const m=getEnemyPresetMetadata(p,k);return [stageKey(k,p),[m.difficultyLabel,m.worldLabel,m.stageLabel,m.personality].filter(Boolean).join(' / ')||'通常'];}));
    if(!stages.has(pendingStage))pendingStage=stages.keys().next().value||'';
    $('enemy-stage').innerHTML=[...stages].map(([k,label])=>`<option value="${esc(k)}">${esc(label)}</option>`).join('');$('enemy-stage').value=pendingStage;$('enemy-stage').disabled=!candidates.length;nameOptions();
  }
  function nameOptions(){const candidates=entries.filter(([k,p])=>group(k,p)===pendingGroup&&stageKey(k,p)===pendingStage);
    $('enemy-name').innerHTML='<option value="">敵を選択</option>'+candidates.map(([k,p])=>`<option value="${esc(k)}">${esc(getEnemyPresetMetadata(p,k).name)}</option>`).join('');$('enemy-name').value=candidates.some(([k])=>k===s.enemy.key)?s.enemy.key:'';$('enemy-name').disabled=!candidates.length;
  }
  function editPresetCard(el){const i=Number(el.dataset.cardIndex),row=modalRows?.[i];if(!row)return;const key=el.dataset.cardField;row[key]=Math.max(key==='solder'?0:1,Math.min(key==='star'?5:key==='solder'?2:99,Math.trunc(Number(el.value)||0)));if(row.star<5)row.solder=0;renderPresetRows();renderCatalog();commitPresetDraft();}
  function editArtifactSlot(el){const slot=Number(el.dataset.artifactSlot),row=modalRows?.find(item=>cardById(item.id)?.kind==='artifact'&&item.slot===slot);if(!row)return;const key=el.dataset.artifactField;row[key]=Math.max(key==='solder'?0:1,Math.min(key==='star'?5:2,Math.trunc(Number(el.value)||0)));if(row.star<5)row.solder=0;renderPresetRows();renderCatalog();commitPresetDraft();}
  document.querySelector('main').addEventListener('input',e=>{
    const t=e.target;if(t.dataset.ally){s.ally[t.dataset.ally]=t.value;s.source=null;$('source-note').hidden=true;}
    else if(t.dataset.buff)s.buffs[t.dataset.buff]=t.value;
    else if(t.dataset.direct){const index=t.dataset.direct==='rate'?0:1,cardBonus=cardTotals(activeCardRows())[index];s.direct[s.side][t.dataset.direct]=String((Number(t.value)||0)-cardBonus);}
    else if(t.dataset.enemyStat)s.enemy.overrides[t.dataset.enemyStat]=t.value;
    else if(t.dataset.growth){const key=t.dataset.growth,field=t.dataset.growthField,values=s.growth.fields[key];if(field==='current'){values.current=t.value;updateGrowthProjection(key,{clearDelta:t.value===''});}else if(field==='delta')updateGrowthProjection(key);changed();return;}
    else return;changed();
  });
  $('card-dialog').addEventListener('change',e=>{
    const target=e.target;
    if(target.dataset.artifactSlot!==undefined){editArtifactSlot(target);return;}
    if(target.dataset.cardIndex!==undefined){editPresetCard(target);return;}
    if(target.dataset.spellId){const row=modalSpellDrafts.get(target.dataset.spellId);if(!row)return;if(target.dataset.spellField==='star'){row.star=Math.max(1,Math.min(5,Math.trunc(Number(target.value)||1)));if(row.star<5)row.solder=0;}else if(target.dataset.spellField==='solder')row.solder=row.star===5?Math.max(0,Math.min(2,Math.trunc(Number(target.value)||0))):0;renderPresetRows();if(modalRows.includes(row))commitPresetDraft();return;}
    if(target.dataset.spellQty){const row=modalSpellDrafts.get(target.dataset.spellQty);if(row){const wasSelected=modalRows.includes(row);row.qty=Math.max(0,Math.min(99,Math.trunc(Number(target.value)||0)));syncSpellQtyControls(row.id);if(wasSelected||row.qty>0)commitPresetDraft();}}
  });
  $('card-dialog').addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;
    if(button.dataset.spellStep){const option=button.closest('.spell-option'),input=option?.querySelector('[data-spell-qty]'),id=input?.dataset.spellQty,row=id&&modalSpellDrafts.get(id);if(!row)return;const wasSelected=modalRows.includes(row);row.qty=Math.max(0,Math.min(99,row.qty+Number(button.dataset.spellStep)));syncSpellQtyControls(id);if(wasSelected||row.qty>0)commitPresetDraft();return;}
    if(button.dataset.presetKind){setPresetKind(button.dataset.presetKind);return;}
    if(button.dataset.artifactSlotOpen!==undefined){if(modalKind!=='artifact')return;artifactTargetSlot=Number(button.dataset.artifactSlotOpen);if(!Number.isInteger(artifactTargetSlot)||artifactTargetSlot<0||artifactTargetSlot>2)return;$('artifact-picker-title').textContent=`遺物${artifactTargetSlot+1}を選ぶ`;artifactPickerOpen=true;renderCatalog();$('artifact-picker-dialog').showModal();return;}
    if(button.dataset.removeSlot!==undefined){const slot=Number(button.dataset.removeSlot);modalRows=modalRows.filter(row=>!(cardById(row.id)?.kind==='artifact'&&row.slot===slot));renderPresetRows();renderCatalog();commitPresetDraft();return;}
    if(button.dataset.remove!==undefined){modalRows.splice(Number(button.dataset.remove),1);renderPresetRows();renderCatalog();commitPresetDraft();}
  });
  $('direction').onclick=async()=>{s.side=s.side==='self'?'enemy':'self';try{await prepareMode();changed();render();}catch(e){error(e);}};
  function changeEnemyFilter(){const oldName=metadata()?.name;const next=entries.find(([k,p])=>group(k,p)===pendingGroup&&stageKey(k,p)===pendingStage&&getEnemyPresetMetadata(p,k).name===oldName);s.enemy={key:next?.[0]||'',phase:0,overrides:{}};changed();render();}
  $('enemy-content').onchange=()=>{pendingGroup=$('enemy-content').value;pendingStage='';stageOptions();changeEnemyFilter();};
  $('enemy-stage').onchange=()=>{pendingStage=$('enemy-stage').value;nameOptions();changeEnemyFilter();};
  $('enemy-name').onchange=()=>{s.enemy={key:$('enemy-name').value,phase:0,overrides:{}};changed();render();};
  $('enemy-phase').onchange=()=>{s.enemy.phase=Number($('enemy-phase').value);s.enemy.overrides={};changed();render();};
  $('reset-enemy').onclick=()=>{s.enemy.overrides={};changed();render();};
  $('open-presets').onclick=async()=>{try{await ensureCards();try{readManager();}catch{}modalRows=structuredClone(cardRows());normalizeArtifactSlots(modalRows);initializeSpellDrafts();artifactPickerOpen=false;$('preset-warning').textContent='';setPresetKind('artifact');$('card-dialog').showModal();}catch(e){error(e);}};
  $('artifact-picker-dialog').addEventListener('click',e=>{const button=e.target.closest('button');if(!button?.dataset.add)return;const id=button.dataset.add,card=cardById(id),slot=artifactTargetSlot;if(card?.kind!=='artifact'||!Number.isInteger(slot)||slot<0||slot>2)return;const existingIndex=modalRows.findIndex(row=>cardById(row.id)?.kind==='artifact'&&row.slot===slot),existing=existingIndex>=0?modalRows[existingIndex]:null;if(existing?.id===id)return;const growth=core.initialCardState(manager.cards||{},s.cardDefault).get(id);const replacement={id,...growth,qty:1,conditions:{},slot};if(existingIndex>=0)modalRows.splice(existingIndex,1,replacement);else modalRows.push(replacement);$('preset-warning').textContent='';renderPresetRows();renderCatalog();commitPresetDraft();});
  document.addEventListener('click',e=>{const button=e.target.closest('[data-card-info]');if(!button)return;const card=cardById(button.dataset.cardInfo);if(!card)return;const row={id:card.id,qty:Number(button.dataset.cardQty)||1,star:Number(button.dataset.cardStar)||5,solder:Number(button.dataset.cardSolder)||0,conditions:{}};$('card-info-name').textContent=card.name;$('card-info-kind').textContent=card.kind==='artifact'?'遺物':'スペル';$('card-info-effect').textContent=bonusText(card,row);$('card-info-dialog').showModal();});
  $('clear-selected-cards').onclick=()=>{if(modalKind==='spell')for(const row of modalSpellDrafts.values())row.qty=0;modalRows=modalRows.filter(row=>cardById(row.id)?.kind!==modalKind);renderPresetRows();renderCatalog();commitPresetDraft();};
  $('bulk-star').onchange=()=>{if(!$('bulk-star').value)return;for(const row of modalRows)if(cardById(row.id)?.kind===modalKind){row.star=Number($('bulk-star').value);if(row.star<5)row.solder=0;}renderPresetRows();renderCatalog();commitPresetDraft();};
  $('bulk-solder').onchange=()=>{if($('bulk-solder').value==='')return;for(const row of modalRows)if(cardById(row.id)?.kind===modalKind&&row.star===5)row.solder=Number($('bulk-solder').value);renderPresetRows();renderCatalog();commitPresetDraft();};
  $('formation-fab').onclick=async()=>{try{await ensureStats();readManager();renderFormation();$('grade').value='';$('formation-dialog').showModal();}catch(e){error(e);}};
  $('formation-select').onchange=()=>{s.formationId=$('formation-select').value;s.memberId='';changed();renderFormation();};$('member-select').onchange=()=>{s.memberId=$('member-select').value;changed();renderFormation();};
  $('stat-mode').onchange=()=>{s.statMode=$('stat-mode').value;};$('grade').onchange=()=>{s.grade=$('grade').value;};$('load-member').onclick=()=>loadMember().catch(error);
  $('growth-enabled').onchange=()=>{s.growth.enabled=$('growth-enabled').checked;changed();};
  $('link-growth').onclick=()=>{const [a,b]=activeKeys();s.growth.fields[b]={...s.growth.fields[a]};changed();buildFields();};
  $('export-input').onclick=()=>{try{const blob=new Blob([core.encode(s)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='trickcal-critical-input.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){error(e);}};
  $('import-input').onclick=()=>$('input-file').click();$('input-file').onchange=async()=>{const file=$('input-file').files[0];if(!file)return;try{if(file.size>65536)throw Error('入力ファイルが大きすぎます。');const imported=core.decode(await file.text());if(!confirm('会心チェックの入力を、ファイルの内容で置き換えますか？'))return;epoch++;clearTimeout(timer);s=imported;await prepareMode();changed();render();}catch(e){error(e);}finally{$('input-file').value='';}};
  $('reset-input').onclick=async()=>{if(!confirm('会心チェックの入力だけを初期化しますか？'))return;if(storageReady&&!await acquireLease()){status('別タブを閉じてから初期化してください。');return;}epoch++;clearTimeout(timer);s=core.defaults();dirty=false;blocked=false;try{if(storageReady){window.TRICKCAL_STORAGE_FACADE.localStorage.removeItem(KEY);revision=null;}status();}catch{status('初期化を保存できませんでした。');}render();};
  $('retry-save').onclick=()=>{dirty=true;save(true);};$('reload-input').onclick=async()=>{if(dirty&&!confirm('編集中の入力を保存済みの内容へ戻しますか？'))return;await hydrate();};
  for(const dialog of [$('card-dialog'),$('artifact-picker-dialog'),$('formation-dialog'),$('card-info-dialog')]){dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.querySelector('[data-cancel]')?.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{if(dialog.open)return;if(dialog.id==='card-dialog'){if($('artifact-picker-dialog').open)$('artifact-picker-dialog').close();modalRows=null;}if(dialog.id==='artifact-picker-dialog'){artifactPickerOpen=false;artifactTargetSlot=null;$('card-catalog').replaceChildren();}});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
  if(boot?.ok){try{readManager();}catch{}await hydrate();await acquireLease();
    window.TRICKCAL_STORAGE_RUNTIME_INSTANCE?.registerParticipant({flush:()=>saveNow(),freeze(){clearTimeout(timer);epoch++;frozen=true;return {ok:true};},async resume(){frozen=false;await hydrate();await acquireLease();return {ok:true};}});
  }else{render();status('自動保存は利用できません。入力を書き出して保管できます。');}
  window.addEventListener('storage',e=>{if(e.key!==KEY&&e.key!==null)return;if(dirty){blocked=true;clearTimeout(timer);status('別タブで更新されました。読込か、この内容で保存を選べます。');}else hydrate();});
  window.addEventListener('pagehide',()=>{saveNow();epoch++;clearTimeout(timer);leaseRelease?.();});
})();
