(async()=>{
  'use strict';
  const $=id=>document.getElementById(id),engine=window.TRICKCAL_GROWTH_COST,data=window.TRICKCAL_STAT_DATA;
  const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const asset=p=>window.TRICKCAL_PUBLIC_SITE?.assetUrl(p)||`../${p}`;
  const fmt=n=>Number(n).toLocaleString('ja-JP');
  const portraitAliases={ED:'Ed',Cuee:'Kyuri',Kyui:'Kyuri',Kyuui:'Kyuri',Kiwi:'Kyuri',Lazy:'Layze',Razy:'Layze',Reizy:'Layze',Rudd:'Rude',Selline:'Selene',Shady:'Shaydi',RenewaAwaken:'Renewa',Sion:'Xion',sion:'Xion',xion:'Xion',xXionx:'Xion'};
  const icons={gold:'ゴールド.webp',lower:'下級くれよん.webp',middle:'中級くれよん.webp',upper:'上級くれよん.webp',special:'特級くれよん.webp',shared:'★1共同教団証.webp',apostle:'使徒証.webp'};
  let apostles={},readError=false,currentCandidates=[],routeOrientation='horizontal';
  const options=()=>({group:$('stat-filter').value,mode:$('board-mode').value,layer:$('layer-filter').value,rarity:$('rarity-filter').value,sort:$('sort-filter').value,includeStar:$('include-star').checked});
  function costs(c){return Object.keys(engine.FIELDS).filter(k=>c[k]>0).map(k=>`<span class="cost" title="${escape(engine.FIELDS[k])}"><img src="${escape(asset('img/'+icons[k]))}" alt="${escape(engine.FIELDS[k])}"><strong>${fmt(c[k])}</strong></span>`).join('')||'<span class="meta">なし</span>';}
  function routeDiagram(c){
    const rows=data.getById('board',c.id)||[],required=new Set(c.required.map(engine.key));
    const filled=engine.filledKeys(rows,apostles[c.id]||{},options().mode);
    const layers=[...new Set(c.required.map(r=>Number(r.ボード階層)))].sort((a,b)=>a-b);
    if(!layers.length)return '<p class="meta">経路の追加なし</p>';
    const boards=layers.map(layer=>{
      const board=rows.filter(r=>Number(r.ボード階層)===layer);
      const minX=Math.min(...board.map(r=>Number(r.X_pos))),minY=Math.min(...board.map(r=>Number(r.Y_pos)));
      const maxX=Math.max(...board.map(r=>Number(r.X_pos))),maxY=Math.max(...board.map(r=>Number(r.Y_pos)));
                                                                                  
      const vertical=routeOrientation==='vertical';
      const point=r=>vertical
        ? {x:18+(maxX-Number(r.X_pos))*26,y:18+(maxY-Number(r.Y_pos))*26}
        : {x:18+(Number(r.Y_pos)-minY)*26,y:18+(maxX-Number(r.X_pos))*26};
      const active=r=>required.has(engine.key(r))||filled.has(engine.key(r));
      const edges=[];
      for(let i=0;i<board.length;i++)for(let j=i+1;j<board.length;j++){
        const a=board[i],b=board[j];
        if(Math.abs(Number(a.X_pos)-Number(b.X_pos))+Math.abs(Number(a.Y_pos)-Number(b.Y_pos))!==1)continue;
        const p=point(a),q=point(b),route=active(a)&&active(b)&&(required.has(engine.key(a))||required.has(engine.key(b)));
        edges.push(`<line class="${route?'route-edge':'board-edge'}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`);
      }
      const nodes=board.map(r=>{
        const p=point(r),k=engine.key(r),target=k===engine.key(c.row);
        const status=required.has(k)?'追加':filled.has(k)?'取得済み':'未取得';
        const label=({'上級':'上','特殊':'★','ゲート':'門','スタート':'始'})[r.マス_type]||'';
        return `<g class="route-node ${required.has(k)?'is-required':filled.has(k)?'is-filled':''} ${target?'is-target':''}" data-route-key="${escape(k)}"><title>B${layer} (${r.X_pos},${r.Y_pos}) ${escape(r.マス_type)}・${status}${target?'・対象':''}</title><rect x="${p.x-9}" y="${p.y-9}" width="18" height="18" rx="${r.マス_type==='通常'?5:2}"/><text x="${p.x}" y="${p.y}" dy=".35em">${label}</text>${target?`<circle class="target-ring" cx="${p.x}" cy="${p.y}" r="13"/>`:''}</g>`;
      });
      const width=36+(vertical?maxX-minX:maxY-minY)*26,height=36+(vertical?maxY-minY:maxX-minX)*26;
      return `<figure class="route-board"><figcaption>B${layer} · 追加${board.filter(r=>required.has(engine.key(r))).length}マス${layer===c.layer?' · 対象ボード':' · ゲートまで'}</figcaption><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="B${layer}の取得経路。青が追加するマス、緑が取得済み、金の丸が対象。"><g>${edges.join('')}${nodes.join('')}</g></svg></figure>`;
    });
    const switcher=`<div class="route-orientation" role="group" aria-label="ボードの表示方向">${[['horizontal','横'],['vertical','縦']].map(([value,label])=>`<button type="button" data-route-orientation="${value}" aria-pressed="${routeOrientation===value}">${label}</button>`).join('')}</div>`;
    return `${switcher}<p class="route-legend"><span class="legend-required">■ 追加するマス</span><span class="legend-filled">■ 取得済み</span><span class="legend-target">◎ 対象</span><span>上：上級 / ★：特殊 / 門：ゲート</span></p><div class="route-boards" data-orientation="${routeOrientation}">${boards.join('<span class="route-next" aria-label="次のボードへ">→</span>')}</div>`;
  }
  function render(){
    if(readError){$('results').innerHTML='<p class="empty">保存状態を確認できません。再読込してください。</p>';$('result-count').textContent='';return;}
    const items=engine.list(data,apostles,options());
    currentCandidates=items;
    $('result-count').textContent=`${items.length}件`;
    $('results').innerHTML=items.map((c,index)=>{
      const effect=c.effects.map(e=>`${escape(e.name)} +${fmt(e.value)}%`).join(' / ');
      const section=(title,value)=>`<div><label>${title}</label><div class="costs">${costs(value)}</div></div>`;
      const query=new URLSearchParams({view:'board',apostle:c.id,board:String(c.layer),boardMode:options().mode==='planned'?'plan':'current'}).toString();
      const boardUrl=window.TRICKCAL_PUBLIC_SITE?.pageUrl('manager',query)||`../stat-dashboard.html?${query}`;
      const title=`${c.basic.使徒名}の個別ボード B${c.layer}を開く`;
      return `<article class="candidate"><div class="candidate-title"><a href="${escape(boardUrl)}" aria-label="${escape(title)}" title="${escape(title)}"><img class="portrait" loading="lazy" src="${escape(asset('img/Chara/'+(portraitAliases[c.id]||c.id)+'.webp'))}" alt=""></a><div><a class="name candidate-board-link" href="${escape(boardUrl)}" title="${escape(title)}">${escape(c.basic.使徒名)}</a> <span class="meta">B${c.layer}</span><p class="effect">${effect}</p><p class="meta">現在★${c.star} / 必要★${c.requiredStar}${!options().includeStar&&c.star<c.requiredStar?'（スターアップ費用を除外）':''}</p></div></div>
        <div class="costs">${c.warnings.length?'<span class="warning">費用未確定</span>':costs(c.costs)}</div>
        <details data-route-index="${index}"><summary>内訳 · 追加${c.required.length}マス</summary><div class="breakdown">${section('対象マス',c.targetCosts)}${section('経路・ゲート',c.routeCosts)}${section('スターアップ',c.starCosts)}</div><div class="route-map"></div>${c.warnings.map(w=>`<p class="warning">${escape(w)}</p>`).join('')}</details></article>`;
    }).join('')||'<p class="empty">対象の未取得特殊マスはありません。</p>';
  }
  function read(){
    try{
      const store=window.TRICKCAL_STORAGE_FACADE?.localStorage;
      if(!store)throw Error('Storage unavailable');
      const raw=store.getItem('trickcal_stat_prototype_v1'),parsed=raw?JSON.parse(raw):null;
      if(parsed&&(!parsed.apostles||typeof parsed.apostles!=='object'||Array.isArray(parsed.apostles)))throw Error('Invalid state');
      apostles=parsed?.apostles||{};readError=false;
      $('state-note').textContent=raw?'管理画面の保存済み状態を使用。予定がない使徒は現在ボードを使用します。':'保存状態なし：初期★・未取得ボードを基準に計算します。';
    }catch{readError=true;$('state-note').textContent='保存状態の読込に失敗しました。';}
    render();
  }
  if(!data||!engine){$('results').textContent='データを読み込めませんでした。';return;}
  const boot=await window.TRICKCAL_STORAGE_BOOT;
  if(!boot?.ok){readError=true;render();return;}
  for(const id of ['stat-filter','board-mode','layer-filter','rarity-filter','sort-filter','include-star'])$(id).addEventListener('change',render);
  $('reload-state').addEventListener('click',read);
  $('results').addEventListener('click',event=>{
    const button=event.target.closest('[data-route-orientation]');
    if(!button)return;
    routeOrientation=button.dataset.routeOrientation;
    $('results').querySelectorAll('details[open][data-route-index]').forEach(detail=>{
      const c=currentCandidates[Number(detail.dataset.routeIndex)];
      if(c)detail.querySelector('.route-map').innerHTML=routeDiagram(c);
    });
  });
  $('results').addEventListener('toggle',event=>{
    const detail=event.target;
    if(!detail.matches('details[data-route-index]')||!detail.open)return;
    const map=detail.querySelector('.route-map'),c=currentCandidates[Number(detail.dataset.routeIndex)];
    if(c&&!map.children.length)map.innerHTML=routeDiagram(c);
  },true);
  window.addEventListener('storage',e=>{if(e.key==='trickcal_stat_prototype_v1'||e.key===null)read();});
  window.addEventListener('trickcal-storage-resumed',read);
  read();
})();
