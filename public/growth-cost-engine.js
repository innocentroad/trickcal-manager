                                                                                   
(function(root){
  'use strict';
  const FIELDS={gold:'ゴールド',lower:'下級',middle:'中級',upper:'上級',special:'特級',shared:'★1共同教団証',apostle:'使徒証'};
  const STAR={1:{apostle:12,gold:40000},2:{apostle:20,gold:150000},3:{apostle:25,gold:300000}};
  const GROUPS={HP:['HP'],attack:['物理攻撃力','魔法攻撃力'],defense:['物理防御力','魔法防御力'],crit:['会心','会心DMG','会心ダメージ'],resist:['会心抵抗','会心DMG抵抗','会心ダメージ抵抗']};
  const empty=()=>Object.fromEntries(Object.keys(FIELDS).map(k=>[k,0]));
  const key=r=>`${r.ボード階層}:${r.X_pos}:${r.Y_pos}`;
  const add=(a,b)=>Object.keys(FIELDS).forEach(k=>a[k]+=b[k]);
  const normalizeType=v=>String(v||'').replace(/^全体/,'').trim();
  function effects(row,group){
    return [1,2].map(i=>({name:String(row[`効果${i}_type`]||''),value:Number(row[`効果${i}_value`])}))
      .filter(e=>GROUPS[group]?.includes(normalizeType(e.name))&&Number.isFinite(e.value)&&e.value>0);
  }
  function rowCost(row,basic){
    const c=empty();
    for(const [field,column] of Object.entries(FIELDS)){
      const n=Number(row[column]??0);
      if(!Number.isFinite(n)||n<0)throw Error('マス費用を確認できません');
      c[field]=n;
    }
    if(Number(basic.レア度)===1&&Number(row.ボード階層)===2&&row.マス_type==='ゲート'){
      c.shared=5;c.apostle=0;
    }
    return c;
  }
  function filledKeys(rows,apostle,mode){
                                                                                  
    const boards=mode==='planned'&&apostle.plannedBoards ? apostle.plannedBoards : apostle.boards||{};
    return new Set(rows.filter(r=>r.マス_type==='スタート'||boards[String(r.ボード階層)]?.filled?.[key(r)]===true).map(key));
  }
  function entryRow(rows,previous){
    const y=Math.min(...rows.map(r=>Number(r.Y_pos)));
    const first=rows.filter(r=>Number(r.Y_pos)===y).sort((a,b)=>Number(a.X_pos)-Number(b.X_pos));
    if(!previous)return first[0];
    return first.find(r=>Number(r.X_pos)===Number(previous.X_pos))
      || first.sort((a,b)=>Math.abs(Number(a.X_pos)-Number(previous.X_pos))-Math.abs(Number(b.X_pos)-Number(previous.X_pos)))[0];
  }
  function route(rows,filled,target,entry){
    const score=(a,b)=>a.gold-b.gold||a.steps-b.steps;
    const best=new Map(),queue=[];
    for(const r of rows)if(filled.has(key(r))){const q={row:r,gold:0,steps:0,path:[]};best.set(key(r),q);queue.push(q);}
    if(!queue.length&&entry){const q={row:entry,gold:Number(entry.ゴールド||0),steps:1,path:[entry]};best.set(key(entry),q);queue.push(q);}
    while(queue.length){
      queue.sort(score);const current=queue.shift();
      if(score(current,best.get(key(current.row)))>0)continue;
      if(key(current.row)===key(target))return current.path;
      for(const next of rows){
        if(Math.abs(Number(next.X_pos)-Number(current.row.X_pos))+Math.abs(Number(next.Y_pos)-Number(current.row.Y_pos))!==1)continue;
        const paid=filled.has(key(next)),q={row:next,gold:current.gold+(paid?0:Number(next.ゴールド||0)),steps:current.steps+(paid?0:1),path:paid?current.path:current.path.concat(next)};
        if(best.has(key(next))&&score(q,best.get(key(next)))>=0)continue;
        best.set(key(next),q);queue.push(q);
      }
    }
    return null;
  }
  function candidate(basic,rows,apostle,target,options={}){
    const layer=Number(target.ボード階層),selected=effects(target,options.group||'HP');
    const filled=filledKeys(rows,apostle,options.mode),required=[],warnings=[];
                                                                                           
    try{
      if(new Set(rows.map(key)).size!==rows.length)throw Error('重複するマスを確認してください');
      for(const row of rows){
        if(![1,2,3].includes(Number(row.ボード階層))||!Number.isFinite(Number(row.X_pos))||!Number.isFinite(Number(row.Y_pos)))throw Error('マス位置を確認できません');
        rowCost(row,basic);
      }
    }catch(e){warnings.push(e.message);}
    let previous=null;
    for(let current=1;!warnings.length&&current<=layer;current++){
      const board=rows.filter(r=>Number(r.ボード階層)===current);
      const goal=current===layer?target:board.find(r=>r.マス_type==='ゲート');
      if(!goal){warnings.push(`B${current}のゲートを確認できません`);break;}
      const path=route(board,filled,goal,current>1?entryRow(board,previous):null);
      if(!path){warnings.push(`B${current}の経路を確認できません`);break;}
      for(const r of path){required.push(r);filled.add(key(r));}
      previous=goal;
    }
    const targetCosts=empty(),routeCosts=empty(),starCosts=empty();
    try{for(const r of required)add(key(r)===key(target)?targetCosts:routeCosts,rowCost(r,basic));}catch(e){warnings.push(e.message);}
    const initial=Number(basic.レア度),star=Number(apostle.star??initial),requiredStar=[0,1,3,4][layer],starSteps=[];
    if(!Number.isInteger(star)||star<initial||star>5)warnings.push('現在の★を確認できません');
    else if(options.includeStar!==false)for(let s=star;s<requiredStar;s++){
      const cost=STAR[s];if(!cost){warnings.push('スターアップ費用を確認できません');break;}
      starCosts.gold+=cost.gold;starCosts[initial===1?'shared':'apostle']+=cost.apostle;starSteps.push(s+1);
    }
    const costs=empty();[targetCosts,routeCosts,starCosts].forEach(c=>add(costs,c));
    return {id:basic.id,basic,row:target,layer,effects:selected,effectValue:selected.reduce((n,e)=>n+e.value,0),star,requiredStar,starSteps,required,targetCosts,routeCosts,starCosts,costs,warnings};
  }
  function list(data,apostles={},options={}){
    const byId=new Map();for(const row of data.sheets.board||[]){if(!byId.has(row.id))byId.set(row.id,[]);byId.get(row.id).push(row);}
    const result=[];
    for(const basic of data.sheets.basicInfo||[]){
      const eldain=!!String(basic.エルダイン||'').trim();
      if(options.rarity&&options.rarity!=='all'&&(options.rarity==='eldain'?!eldain:eldain||Number(basic.レア度)!==Number(options.rarity)))continue;
      const rows=byId.get(basic.id)||[],a=apostles[basic.id]||{},filled=filledKeys(rows,a,options.mode);
      for(const row of rows){
        if(row.マス_type!=='特殊'||!effects(row,options.group||'HP').length||filled.has(key(row)))continue;
        if(options.layer&&options.layer!=='all'&&Number(options.layer)!==Number(row.ボード階層))continue;
        result.push(candidate(basic,rows,a,row,options));
      }
    }
    const mode=options.sort||'special';
    const value=c=>mode==='gold'?c.costs.gold:mode==='certificate'?c.costs.shared+c.costs.apostle:mode==='efficiency'?c.costs.special/c.effectValue:c.costs.special;
    return result.sort((a,b)=>Number(!!a.warnings.length)-Number(!!b.warnings.length)||value(a)-value(b)||a.costs.gold-b.costs.gold||a.required.length-b.required.length||String(a.basic.使徒名).localeCompare(String(b.basic.使徒名),'ja')||key(a.row).localeCompare(key(b.row)));
  }
  const api=Object.freeze({list,candidate,filledKeys,effects,key,FIELDS});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.TRICKCAL_GROWTH_COST=api;
})(typeof globalThis==='undefined'?this:globalThis);
