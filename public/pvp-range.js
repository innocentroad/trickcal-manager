(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else{root.TrickcalPvpRange=api;api.mount(document);}})(globalThis,function(){
  'use strict';
                                                              
  const prefix=new Int32Array(3002);for(let r=1;r<=3000;r++)prefix[r]=prefix[r-1]+(r<=50?70:r<=200?30:r<=500?15:r<=1000?10:8);
  function normalize(value){const rank=Math.floor(Number(value));return Math.max(1,Math.min(3001,Number.isFinite(rank)?rank:3001));}
  function limit(rank){return Math.max(1,Math.floor(rank*(rank>=100?92:35)/100));}
  function reward(current,target,bestRank=current){const upper=Math.min(current,bestRank);return target>=upper?0:Math.floor((prefix[upper-1]-prefix[target-1])/10);}
  function calculate(value){const current=normalize(value),target=limit(current);return {current,target,eliph:reward(current,target)};}
  function plan(value,{mode='reward',bestRank=value}={}){
    const current=normalize(value),best=Math.min(current,normalize(bestRank)),next=new Uint16Array(current+1);
    if(mode==='reward'){
      const gains=new Int32Array(current+1),steps=new Uint16Array(current+1);
      for(let r=2;r<=current;r++){
        let gain=-1,count=Infinity;
        for(let t=limit(r);t<r;t++){
          const candidate=reward(r,t,best)+gains[t],battles=1+steps[t];
          if(candidate>gain||(candidate===gain&&battles<count)){gain=candidate;count=battles;next[r]=t;}
        }
        gains[r]=gain;steps[r]=count;
      }
    }else if(mode==='rank'){for(let r=2;r<=current;r++)next[r]=limit(r);}else throw new Error('Unknown PvP mode');
    const rows=[];let rank=current,total=0;
    while(rank>1){const target=next[rank],eliph=reward(rank,target,best);total+=eliph;rows.push({current:rank,target,eliph,total});rank=target;}
    return {current,bestRank:best,mode,rows,total,battles:rows.length};
  }
  function schedule(battles,free=5){free=Math.max(0,Math.min(5,Math.floor(Number(free)||0)));const purchases=Math.ceil(Math.max(0,battles-free)/5);return {days:battles===0?0:battles<=free?1:1+Math.ceil((battles-free)/5),purchases,cost:purchases*25};}
  function mount(doc){
    const input=doc.getElementById('pvp-rank'),slider=doc.getElementById('pvp-slider'),target=doc.getElementById('pvp-target'),undoButton=doc.getElementById('pvp-undo'),redoButton=doc.getElementById('pvp-redo');if(!input||!slider)return;
    const bestInput=doc.getElementById('pvp-best'),modeInput=doc.getElementById('pvp-mode'),route=doc.getElementById('pvp-route');
    let current=normalize(input.value),bestValue='';const undo=[],redo=[];
    const snapshot=()=>({current,bestValue});
    function render(value,normalizeInput){const result=calculate(value),best=bestValue===''?result.current:Math.min(result.current,normalize(bestValue));if(normalizeInput)input.value=String(result.current);slider.value=String(result.current);target.textContent=result.target.toLocaleString('ja-JP')+'位';target.setAttribute('aria-label',result.target+'位へ進む');target.disabled=result.current===result.target;doc.getElementById('pvp-eliph').textContent=String(reward(result.current,result.target,best));undoButton.disabled=!undo.length;redoButton.disabled=!redo.length;
      if(!route)return;
      const resultPlan=plan(result.current,{mode:modeInput.value,bestRank:best}),timing=schedule(resultPlan.battles,doc.getElementById('pvp-free').value);
      doc.getElementById('pvp-route-summary').textContent=`獲得 ${resultPlan.total.toLocaleString('ja-JP')} エリーフ · ${resultPlan.battles}戦 · 無料で${timing.days}日`;
      doc.getElementById('pvp-one-day-result').hidden=!doc.getElementById('pvp-one-day').checked;
      doc.getElementById('pvp-one-day-result').textContent=`補充 ${timing.purchases}回 · 消費 ${timing.cost} · 差引 ${resultPlan.total-timing.cost} エリーフ（5戦／25）`;
      route.replaceChildren();
      for(const [i,row] of resultPlan.rows.entries()){
        const tr=doc.createElement('tr'),count=doc.createElement('td'),rank=doc.createElement('td'),gain=doc.createElement('td'),sum=doc.createElement('td'),button=doc.createElement('button');
        count.textContent=String(i+1);button.type='button';button.textContent=row.target.toLocaleString('ja-JP')+'位';button.dataset.rank=String(row.target);button.setAttribute('aria-label',row.target+'位から再計算');rank.append(button);gain.textContent='+'+row.eliph;sum.textContent=String(row.total);tr.append(count,rank,gain,sum);route.append(tr);
      }
      doc.getElementById('pvp-route-empty').hidden=!!resultPlan.rows.length;
    }
    function commit(value,nextBest=bestValue){const next=normalize(value);if(next!==current||nextBest!==bestValue){undo.push(snapshot());if(undo.length>100)undo.shift();redo.length=0;current=next;bestValue=nextBest;}if(bestInput)bestInput.value=bestValue;render(current,true);}
    function advance(value){const next=normalize(value);commit(next,bestValue===''?'':String(Math.min(normalize(bestValue),next)));}
    input.addEventListener('input',()=>{if(input.value!==''&&Number.isFinite(input.valueAsNumber))render(input.value,false);});input.addEventListener('change',()=>commit(input.value||current));
    slider.addEventListener('input',()=>render(slider.value,true));slider.addEventListener('change',()=>commit(slider.value));
    target.addEventListener('click',()=>advance(calculate(input.value||current).target));
    function restore(entry){current=entry.current;bestValue=entry.bestValue;if(bestInput)bestInput.value=bestValue;render(current,true);}
    undoButton.addEventListener('click',()=>{if(!undo.length)return;redo.push(snapshot());restore(undo.pop());});
    redoButton.addEventListener('click',()=>{if(!redo.length)return;undo.push(snapshot());restore(redo.pop());});
    if(route){route.addEventListener('click',e=>{const button=e.target.closest('button[data-rank]');if(button){advance(button.dataset.rank);(route.querySelector('button')||modeInput).focus({preventScroll:true});}});bestInput.addEventListener('change',()=>commit(current,bestInput.value===''?'':String(normalize(bestInput.value))));for(const id of ['pvp-mode','pvp-free','pvp-one-day'])doc.getElementById(id).addEventListener('change',()=>{if(id==='pvp-free'){const free=doc.getElementById(id);free.value=String(Math.max(0,Math.min(5,Math.floor(Number(free.value)||0))));}render(input.value||current,true);});}
    render(current,true);
  }
  return {normalize,calculate,plan,schedule,mount};
});
