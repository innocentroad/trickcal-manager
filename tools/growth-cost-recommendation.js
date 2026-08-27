(() => {
  'use strict';
  const DATA = window.TRICKCAL_STAT_DATA;
  const $ = id => document.getElementById(id);
  const state = { filter:'HP', mode:'current', layer:'all', rarity:'all', sort:'special', includeStar:true, showUnreachable:false, apostles:{} };
  const statMatchers = {
    HP: /HP/,
    '攻撃力': /攻撃力/,
    '防御力': /防御力/,
    '会心系': /会心(?!抵抗)/,
    '会心抵抗系': /会心抵抗|会心DMG抵抗/
  };
  const icons = { gold:'../img/ゴールド.webp', lower:'../img/下級くれよん.webp', middle:'../img/中級くれよん.webp', upper:'../img/上級くれよん.webp', special:'../img/特級くれよん.webp', shared:'../img/★1共同教団証.webp', apostle:'../img/使徒証.webp' };
  const starCosts = { 1:{apostle:12,gold:40000}, 2:{apostle:20,gold:150000}, 3:{apostle:25,gold:300000}, 4:{apostle:50,gold:700000} };
  const emptyCosts = () => ({gold:0,lower:0,middle:0,upper:0,special:0,shared:0,apostle:0});
  const add = (a,b) => Object.keys(a).forEach(key => { a[key] += Number(b?.[key]) || 0; });
  const key = row => `${row.ボード階層}:${row.X_pos}:${row.Y_pos}`;
  const num = value => Number(value) || 0;
  const fmt = value => Number(value || 0).toLocaleString('ja-JP');
  const rowsFor = id => (DATA.getById('board', id) || []).slice();
  const basicFor = id => DATA.getById('basicInfo', id) || {};

  function safeJson(value) { try { return JSON.parse(value); } catch { return null; } }
  function extractState(value) {
    if (!value || typeof value !== 'object') return null;
    if (value.apostles && typeof value.apostles === 'object') return value;
    for (const child of ['current','state','workspace','live','data']) {
      const found = extractState(value[child]);
      if (found) return found;
    }
    return null;
  }
  function loadState() {
    const sources = ['trickcal_stat_live_v2','trickcal_stat_workspace_v2','trickcal_stat_prototype_v1'];
    const parsed = sources.map(name => extractState(safeJson(localStorage.getItem(name)))).find(Boolean);
    state.apostles = parsed?.apostles || {};
    $('state-note').textContent = parsed ? '保存済みの使徒状態を読み込みました。未登録の使徒は初期★・未解放ボードとして計算します。' : '保存状態が見つからないため、初期★・未解放ボードとして計算します。';
  }
  function apostleState(id) { const basic = basicFor(id); const value = state.apostles[id] || {}; return { ...value, star:num(value.star) || num(basic.レア度) || 1, boards:value.boards || {}, plannedBoards:value.plannedBoards || {} }; }
  function filledMap(id, mode) {
    const source = apostleState(id); const result = {};
    const merge = boards => Object.entries(boards || {}).forEach(([layer, board]) => Object.keys(board?.filled || {}).forEach(tile => { result[`${layer}:${tile.split(':').slice(1).join(':')}`] = true; }));
    merge(source.boards); if (mode === 'planned') merge(source.plannedBoards);
    rowsFor(id).filter(row => row.マス_type === 'スタート').forEach(row => { result[key(row)] = true; });
    return result;
  }
  function rowCost(row, basic) {
    const cost = { gold:num(row.ゴールド), lower:num(row.下級), middle:num(row.中級), upper:num(row.上級), special:num(row.特級), shared:0, apostle:num(row.使徒証) };
    const rare1Board3Gate = num(basic.レア度) === 1 && num(row.ボード階層) === 2 && row.マス_type === 'ゲート';
    if (rare1Board3Gate) { cost.shared = 5; cost.apostle = 0; } else cost.shared = num(row['★1共同教団証']);
    return cost;
  }
  function statText(row) { return [row.効果1_type,row.効果2_type].filter(Boolean).join(' / '); }
  function matchesStat(row) { return row.マス_type === '特殊' && statMatchers[state.filter].test(statText(row)); }
  function matchesRarity(basic) {
    if (state.rarity === 'all') return true;
    if (state.rarity === 'eldain') return Boolean(basic.エルダイン);
    return !basic.エルダイン && num(basic.レア度) === num(state.rarity);
  }
  function neighbors(rows, row) { const x=num(row.X_pos), y=num(row.Y_pos); return rows.filter(other => Math.abs(num(other.X_pos)-x)+Math.abs(num(other.Y_pos)-y) === 1); }
  function pathCost(rows, filled, target, sources) {
    const known = new Set(Object.keys(filled));
    const rowByKey = new Map(rows.map(row => [key(row), row]));
    const startRows = rows.filter(row => sources.has(key(row)) || known.has(key(row)));
    const virtualStarts = [...sources].filter(sourceKey => !rowByKey.has(sourceKey)).map(sourceKey => {
      const [layer, x, y] = sourceKey.split(':');
      return { ボード階層: layer, X_pos: x, Y_pos: y, __virtual: true };
    });
    const starts = [...startRows, ...virtualStarts];
    const queue = starts.map(row => ({ row, gold:0, count:0, path:[] })); const best = new Map(starts.map(row => [key(row), { gold:0, count:0 }]));
    while (queue.length) {
      queue.sort((a,b) => a.gold-b.gold || a.count-b.count); const current = queue.shift();
      if (key(current.row) === key(target)) return current.path;
      for (const next of neighbors(rows,current.row)) {
        const nextKey = key(next); const nextFilled = known.has(nextKey); const cost = nextFilled ? 0 : num(next.ゴールド); const candidate = { gold:current.gold+cost, count:current.count+(nextFilled?0:1) };
        const previous = best.get(nextKey); if (previous && (previous.gold < candidate.gold || (previous.gold === candidate.gold && previous.count <= candidate.count))) continue;
        best.set(nextKey,candidate); queue.push({ row:next, gold:candidate.gold, count:candidate.count, path:current.path.concat(nextFilled ? [] : [next]) });
      }
    }
    return null;
  }
  function ensureLayerPath(id, working, layer) {
    const rows = rowsFor(id).filter(row => num(row.ボード階層) === layer); const previous = rowsFor(id).find(row => num(row.ボード階層) === layer-1 && row.マス_type === 'ゲート');
    const gate = rows.find(row => row.マス_type === 'ゲート'); if (!gate) return { rows:[], warning:'' };
    const sources = new Set(rows.filter(row => working[key(row)]).map(key));
    if (layer > 1 && previous) {
      // 前段ゲートは次ボードの入口（通常はX=4,Y=1）の一つ手前に接続する。
      // 前段と次段では座標系が別なので、前段ゲートの座標をそのまま隣接判定には使わない。
      const entry = rows.find(row => num(row.X_pos) === 4 && num(row.Y_pos) === 1) || rows.slice().sort((a,b) => num(a.Y_pos)-num(b.Y_pos))[0];
      if (entry) sources.add(`${layer}:${num(entry.X_pos)}:${num(entry.Y_pos)-1}`);
    }
    const path = pathCost(rows,working,gate,sources); if (!path) return { rows:[], warning:`B${layer}ゲートまでの経路を確定できません` };
    path.forEach(row => { working[key(row)] = true; });
    return { rows:path, warning:'' };
  }
  function requiredPath(candidate) {
    const id=candidate.id, working=filledMap(id,state.mode), allRows=rowsFor(id), path=[]; let warning='';
    for(let layer=1; layer<=candidate.layer; layer++) {
      if(layer < candidate.layer || layer > 1) { const result=ensureLayerPath(id,working,layer); path.push(...result.rows); warning ||= result.warning; }
      if(layer === candidate.layer) {
        const rows=allRows.filter(row=>num(row.ボード階層)===layer); const sources=new Set(rows.filter(row=>working[key(row)]).map(key)); const previous=allRows.find(row=>num(row.ボード階層)===layer-1 && row.マス_type==='ゲート'); if(layer>1&&previous){const entry=rows.find(row=>num(row.X_pos)===4&&num(row.Y_pos)===1)||rows.slice().sort((a,b)=>num(a.Y_pos)-num(b.Y_pos))[0];if(entry)sources.add(`${layer}:${num(entry.X_pos)}:${num(entry.Y_pos)-1}`);} const targetPath=pathCost(rows,working,candidate.row,sources); if(!targetPath) warning ||= `B${layer}の対象までの経路を確定できません`; else { targetPath.forEach(row=>{working[key(row)]=true;}); path.push(...targetPath); }
      }
    }
    return { path, warning };
  }
  function candidateFor(id,row) {
    const basic=basicFor(id), layer=num(row.ボード階層), current=apostleState(id), working=filledMap(id,state.mode), result=requiredPath({id,row,layer}); const costs=emptyCosts(); result.path.forEach(item=>add(costs,rowCost(item,basic)));
    const requiredStar=layer===1?1:layer===2?3:4; const starSteps=[]; if(state.includeStar && current.star<requiredStar) for(let star=current.star;star<requiredStar;star++){const c=starCosts[star];if(c){starSteps.push(star+1);const useShared=num(basic.レア度)===1;costs[useShared?'shared':'apostle']+=c.apostle;costs.gold+=c.gold;}}
    const effectValue=[row.効果1_value,row.効果2_value].map(num).filter(Boolean).reduce((a,b)=>a+b,0); const total=Object.values(costs).reduce((a,b)=>a+b,0);
    return {id,row,layer,basic,costs,warning:result.warning,requiredStar,currentStar:current.star,starSteps,effectValue,total};
  }
  function getCandidates() { const candidates=[]; DATA.sheets.basicInfo.filter(matchesRarity).forEach(basic=>rowsFor(basic.id).filter(matchesStat).forEach(row=>{if(state.layer!=='all'&&String(row.ボード階層)!==state.layer)return; const filled=filledMap(basic.id,state.mode);if(filled[key(row)])return;candidates.push(candidateFor(basic.id,row));})); return candidates.filter(item=>state.showUnreachable||!item.warning); }
  function sortCandidates(items) { const compare={special:(a,b)=>a.costs.special-b.costs.special||a.costs.gold-b.costs.gold, gold:(a,b)=>a.costs.gold-b.costs.gold||a.costs.special-b.costs.special, certificate:(a,b)=>(a.costs.shared+a.costs.apostle)-(b.costs.shared+b.costs.apostle)||a.costs.gold-b.costs.gold, efficiency:(a,b)=>(a.costs.special/Math.max(.01,a.effectValue))-(b.costs.special/Math.max(.01,b.effectValue))}; return items.sort((a,b)=>(compare[state.sort]||compare.special)(a,b)||a.basic.使徒名.localeCompare(b.basic.使徒名,'ja')); }
  function costChip(key,label,value) { if(!value)return ''; return `<span class="cost"><img src="${icons[key]}" alt="${label}"><strong>${fmt(value)}</strong></span>`; }
  function render() { const items=sortCandidates(getCandidates()); $('result-count').textContent=`${items.length}件`; const best=items[0]; $('summary').innerHTML=[['候補数',items.length,'件'],['最安 特級',best?.costs.special||0,'個'],['最安 ゴールド',best?.costs.gold||0,''],['最安 効果',best?`B${best.layer} ${best.effectValue}%`:'—','']].map(item=>`<article class="summary-card"><small>${item[0]}</small><strong>${typeof item[1]==='number'?fmt(item[1]):item[1]}${item[2]}</strong></article>`).join(''); $('results').innerHTML=items.length?items.map((item,index)=>renderCandidate(item,index===0)).join(''):'<p class="empty">対象ステータスの未取得特殊マスはありません。</p>'; }
  function renderCandidate(item,recommended) { const row=item.row,c=item.costs; const detail=[`経路${item.row.マス_type==='特殊'?item.layer:''} / 追加${item.requiredStar>item.currentStar?`★${item.currentStar}→★${item.requiredStar}`:'スターアップ不要'}`,`効果1%あたり特級 ${ (c.special/Math.max(.01,item.effectValue)).toFixed(2) }`]; if(item.warning)detail.push(item.warning); return `<article class="candidate ${recommended?'recommended':''}"><div><div class="candidate-title"><img class="portrait" src="../img/Chara/${item.id}.webp" onerror="this.style.visibility='hidden'" alt=""><div><h3>${item.basic.使徒名} <span class="meta">B${item.layer} / ${item.basic.レア度}★</span></h3><p class="meta">現在★${item.currentStar} / 必要★${item.requiredStar}</p><p class="effect">${statText(row)} +${item.effectValue}%</p></div></div></div><div><div class="costs">${costChip('gold','ゴールド',c.gold)}${costChip('lower','下級くれよん',c.lower)}${costChip('middle','中級くれよん',c.middle)}${costChip('upper','上級くれよん',c.upper)}${costChip('special','特級くれよん',c.special)}${costChip('shared','★1共同教団証',c.shared)}${costChip('apostle','使徒証',c.apostle)}</div><p class="detail">${detail.join(' / ')}</p></div><div class="candidate-actions"><button type="button" data-show-detail="${item.id}:${key(row)}">内訳</button></div></article>`; }
  function bind() { $('stat-filter').addEventListener('change',e=>{state.filter=e.target.value;render();}); $('board-mode').addEventListener('change',e=>{state.mode=e.target.value;render();}); $('layer-filter').addEventListener('change',e=>{state.layer=e.target.value;render();}); $('rarity-filter').addEventListener('change',e=>{state.rarity=e.target.value;render();}); $('sort-filter').addEventListener('change',e=>{state.sort=e.target.value;render();}); $('include-star').addEventListener('change',e=>{state.includeStar=e.target.checked;render();}); $('show-unreachable').addEventListener('change',e=>{state.showUnreachable=e.target.checked;render();}); $('reload-state').addEventListener('click',()=>{loadState();render();}); $('theme-toggle').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('trickcal_theme',next);}); $('results').addEventListener('click',e=>{const button=e.target.closest('[data-show-detail]');if(!button)return;const [id,...parts]=button.dataset.showDetail.split(':');const row=rowsFor(id).find(item=>key(item)===parts.join(':'));const item=candidateFor(id,row);alert(`${item.basic.使徒名} B${item.layer}\n${statText(row)} +${item.effectValue}%\n\n経路: ${item.costs.gold?'ゴールド '+fmt(item.costs.gold):'なし'}\nスターアップ: ${item.starSteps.length?item.starSteps.join('→'):'不要'}\n\n${item.warning||'経路計算OK'}`);}); }
  if (!DATA) { document.body.innerHTML='<p class="empty">statData.jsを読み込めませんでした。</p>'; return; }
  loadState(); bind(); render();
})();
