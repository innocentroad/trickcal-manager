(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.TRICKCAL_CRITICAL=api;})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  const KEYS=['crit','critDmg','critRes','critDmgRes'];
  const LABELS={crit:'会心',critDmg:'会心ダメージ',critRes:'会心抵抗',critDmgRes:'会心ダメージ抵抗'};
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const object=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
  function defaults(){return {inputModel:2,side:'self',modes:{self:'direct',enemy:'direct'},ally:{crit:'60000',critDmg:'60000',critRes:'40000',critDmgRes:''},buffs:Object.fromEntries(KEYS.map(k=>[k,'0'])),direct:{self:{rate:'0',damage:'0'},enemy:{rate:'0',damage:'0'}},extra:{self:{rate:'0',damage:'0'},enemy:{rate:'0',damage:'0'}},cards:{card:[],formation:[]},cardDefault:'auto',enemy:{key:'',phase:0,overrides:{}},source:null,formationId:'',memberId:'',statMode:'current',grade:'saved',growth:{enabled:false,fields:Object.fromEntries(KEYS.map(k=>[k,{current:'',next:''}]))}};}
  function numeric(value,{blank=true,min=-1e6,max=1e12}={}){
    if(value===''&&blank)return '';
    if(!['number','string'].includes(typeof value)||String(value).trim()===''||!Number.isFinite(Number(value))||Number(value)<min||Number(value)>max)throw Error('入力の数値が不正です。');
    return String(value);
  }
  function str(v,max=200){if(typeof v!=='string'||v.length>max)throw Error('入力の形式が不正です。');return v;}
  function normalize(value){
    if(!object(value))throw Error('入力データを確認できません。');
    const s=defaults();
    if(value.inputModel!=null&&value.inputModel!==1&&value.inputModel!==2)throw Error('入力形式のバージョンが不正です.');
    const legacy=value.inputModel!==2;
    if(!['self','enemy'].includes(value.side))throw Error('攻守の指定が不正です。');s.side=value.side;
    for(const side of ['self','enemy']){
      if(!['direct','card','formation'].includes(value.modes?.[side]))throw Error('強化方法が不正です。');s.modes[side]=value.modes[side];
      for(const k of ['rate','damage']){s.direct[side][k]=numeric(value.direct?.[side]?.[k]);s.extra[side][k]=numeric(value.extra?.[side]?.[k]);}
      if(legacy&&s.modes[side]!=='direct'){s.direct[side]={...s.extra[side]};s.extra[side]={rate:'0',damage:'0'};}
    }
    for(const k of KEYS){
      s.ally[k]=numeric(value.ally?.[k],{min:0});s.buffs[k]=numeric(value.buffs?.[k],{min:-100});
      s.growth.fields[k]={current:numeric(value.growth?.fields?.[k]?.current,{min:0}),next:numeric(value.growth?.fields?.[k]?.next,{min:0})};
    }
    if(typeof value.growth?.enabled!=='boolean')throw Error('比較条件が不正です。');s.growth.enabled=value.growth.enabled;
    if(!['auto','manager','max'].includes(value.cardDefault))throw Error('カードの初期値指定が不正です。');s.cardDefault=value.cardDefault;
    for(const mode of ['card','formation']){
      const rows=value.cards?.[mode];if(!Array.isArray(rows)||rows.length>128)throw Error('カード数が不正です。');
      s.cards[mode]=rows.map(row=>{
        if(!object(row)||![1,2,3,4,5].includes(row.star)||![0,1,2].includes(row.solder)||!Number.isInteger(row.qty)||row.qty<1||row.qty>99||!object(row.conditions)||Object.keys(row.conditions).length>30)throw Error('カードの強化値が不正です。');
        const conditions={};for(const [key,v]of Object.entries(row.conditions)){str(key);if(typeof v!=='boolean'||['__proto__','constructor','prototype'].includes(key))throw Error('カード条件が不正です。');conditions[key]=v;}
        if(row.slot!=null&&![0,1,2].includes(row.slot))throw Error('遺物スロットの指定が不正です。');
        return {id:str(row.id),qty:row.qty,star:row.star,solder:row.star===5?row.solder:0,conditions,...(row.slot==null?{}:{slot:row.slot})};
      });
      const slotIds=new Set(),byId=new Map();for(const row of s.cards[mode]){if(row.slot!=null){if(slotIds.has(row.slot))throw Error('遺物スロットが重複しています。');slotIds.add(row.slot);}const group=byId.get(row.id)||[];group.push(row);byId.set(row.id,group);}
      for(const group of byId.values())if(group.length>1&&(group.some(row=>row.slot==null||row.qty!==1)||new Set(group.map(row=>row.slot)).size!==group.length))throw Error('同じカードの枚数はまとめてください。');
    }
    if(!object(value.enemy)||!Number.isInteger(value.enemy.phase)||value.enemy.phase<0||value.enemy.phase>100||!object(value.enemy.overrides))throw Error('敵の指定が不正です。');
    s.enemy={key:str(value.enemy.key),phase:value.enemy.phase,overrides:{}};
    for(const k of KEYS)if(own(value.enemy.overrides,k))s.enemy.overrides[k]=numeric(value.enemy.overrides[k],{min:0});
    if(value.source!==null){
      const source=value.source;if(!object(source)||!Number.isInteger(source.grade)||source.grade<1||source.grade>6||!object(source.bases))throw Error('読込元の値が不正です。');
      s.source={id:str(source.id),name:str(source.name),grade:source.grade,bases:{}};
      for(const k of KEYS)if(own(source.bases,k)){
        const b=source.bases[k];if(!object(b))throw Error('全体強化の内訳が不正です。');
        s.source.bases[k]={base:Number(numeric(b.base,{blank:false,min:0})),rate:Number(numeric(b.rate,{blank:false,min:0})),follow:Number(numeric(b.follow,{blank:false,min:0,max:1}))};
      }
    }
    s.formationId=str(value.formationId);s.memberId=str(value.memberId);
    if(!['current','planned'].includes(value.statMode)||!['saved','1','2','3','4','5','6'].includes(value.grade))throw Error('育成条件が不正です。');
    s.statMode=value.statMode;s.grade=value.grade;s.inputModel=2;return s;
  }
  function decode(raw){if(typeof raw!=='string'||new TextEncoder().encode(raw).length>65536)throw Error('入力ファイルが大きすぎます。');let v;try{v=JSON.parse(raw);}catch{throw Error('入力ファイルを読み取れませんでした。');}if(!object(v)||v.format!=='trickcal-critical-input'||v.version!==1)throw Error('この入力ファイルの形式には対応していません。');return normalize(v.settings);}
  function encode(s){const raw=JSON.stringify({format:'trickcal-critical-input',version:1,settings:normalize(s)});if(new TextEncoder().encode(raw).length>65536)throw Error('入力の保存容量を超えました。');return raw;}
  function initialCardState(cards={},preference='auto'){
    const managed=Object.values(cards).some(c=>Number(c?.star)>1||Number(c?.solder)>0);
    const manager=preference==='manager'||preference==='auto'&&managed;
    return {manager,label:manager?'管理の値':'★5／はんだ0',get(id){const c=cards[id]||{};const star=manager?Math.max(1,Math.min(5,Number(c.star)||1)):5;return {star,solder:manager&&star===5?Math.max(0,Math.min(2,Number(c.solder)||0)):0};}};
  }
  function sumMap(a,b,mult=1){for(const k of ['critP','critDmgP','critResP','critDmgResP','critRateP','critDmgAddP','critResAddP','critDmgResAddP'])a[k]=(a[k]||0)+(Number(b?.[k])||0)*mult;return a;}
  function baseBonuses(card,row){const a={};for(const b of [card?.bonusesByStar?.[row.star-1],row.star===5?card?.solderBonuses?.[row.solder]:null]){
    sumMap(a,{critP:b?.critP,critRateP:b?.critRateP,critDmgAddP:(Number(b?.critDmgP)||0)+(Number(b?.critDmgAddP)||0),critResAddP:(Number(b?.critResP)||0)+(Number(b?.critResAddP)||0),critDmgResAddP:(Number(b?.critDmgResP)||0)+(Number(b?.critDmgResAddP)||0)},row.qty);
  }return a;}
  function conditionalBonus(effect,row){const b={...(effect.bonusesByStar?.[row.star-1]||effect.bonuses||{})};const label=effect.shortLabel||effect.label||'';
    if(b.critRateP!=null&&/会心(?!率|DMG|ダメージ|抵抗)/.test(label)){b.critP=(Number(b.critP)||0)+Number(b.critRateP);delete b.critRateP;}
    if(b.critDmgP!=null&&/会心(?:ダメージ量|DMG量)/.test(label)){b.critDmgAddP=(Number(b.critDmgAddP)||0)+Number(b.critDmgP);delete b.critDmgP;}
    return b;
  }
  function cardBonuses(card,row){const a=baseBonuses(card,row);for(const e of card?.conditionalEffects||[])if(row.conditions[e.id])sumMap(a,conditionalBonus(e,row),row.qty);return a;}
  function relevant(card,side){const rows=[...(card.bonusesByStar||[]),...Object.values(card.solderBonuses||{}),...(card.conditionalEffects||[]).flatMap(e=>e.bonusesByStar||[e.bonuses||{}])];
    return rows.some(b=>Object.keys(b||{}).some(k=>side==='self'?['critP','critRateP','critDmgP','critDmgAddP'].includes(k):['critResP','critDmgResP','critResAddP','critDmgResAddP'].includes(k)));}
  function enemyStats(preset,index){const out={};for(const k of KEYS)out[k]=preset?.[k];const phase=preset?.phases?.[index];
    if(phase?.stats){for(const k of KEYS)if(typeof phase.stats[k]==='number'&&Number.isFinite(phase.stats[k])&&phase.stats[k]>=0)out[k]=phase.stats[k];}
    else if(phase)for(const k of KEYS)if(phase.scaleStats?.includes(k))out[k]=Math.round(Number(out[k])*(Number(phase.mult)||1));return out;}
  function calculate(s,preset,index,math,{spellsDisabled=false,changed=false}={}){
    const side=s.side,keys=side==='self'?KEYS.slice(0,2):KEYS.slice(2),opposite=side==='self'?KEYS.slice(2):KEYS.slice(0,2);
    if(!preset)return {error:'敵を選択してください。'};
    const read=(value,label)=>{if(value===''||value==null||!Number.isFinite(Number(value)))throw Error(`${label}を入力してください。`);return Number(value);};
    try{
      const enemy=enemyStats(preset,s.enemy.phase),ally={};let approximate=false;
      for(const k of keys){let v=read(s.ally[k],LABELS[k]);
        if(changed&&s.growth.enabled){const fields=s.growth.fields[k],current=read(fields.current,`${LABELS[k]}の現在の全体強化`),next=read(fields.next,`${LABELS[k]}の変更後の全体強化`),base=s.source?.bases?.[k];
          if(current!==next){if(base&&current===base.rate)v=base.base*(1+next/100+base.follow);else{v=v/(1+current/100)*(1+next/100);approximate=true;}}
        }ally[k]=math.resolveCombatStat(v,Number(s.buffs[k])||0,side==='enemy'?1:0);
      }
      for(const k of opposite)enemy[k]=math.resolveCombatStat(read(own(s.enemy.overrides,k)?s.enemy.overrides[k]:enemy[k],`敵の${LABELS[k]}`),0,side==='self'?1:0);
      let rate=Number(s.direct[side].rate)||0,damage=Number(s.direct[side].damage)||0;const mode=s.modes[side],missing=[];
      if(mode!=='direct')for(const row of s.cards[mode]){const card=own(index,row.id)?index[row.id]:null;if(!card){missing.push(row.id);continue;}if(spellsDisabled&&card.kind==='spell')continue;const b=cardBonuses(card,row);rate+=side==='self'?b.critRateP||0:b.critResAddP||0;damage+=side==='self'?b.critDmgAddP||0:b.critDmgResAddP||0;}
      if(missing.length)return {error:'見つからないカードがあります。選び直してください。'};
      const chance=side==='self'?math.calcRuntimeCritRate(ally.crit,enemy.critRes):math.calcRuntimeCritRate(enemy.crit,ally.critRes);
      const multiplier=side==='self'?math.calcRuntimeCritMultiplier(ally.critDmg,enemy.critDmgRes):math.calcRuntimeCritMultiplier(enemy.critDmg,ally.critDmgRes);
      const rateDelta=side==='self'?rate:-rate;
                                                                                
      const resolvedRate=math.clampCombatCritRate(chance+rateDelta*0.01);
      return {rate:resolvedRate,multiplier:math.clampCombatCritMultiplier(multiplier+(side==='self'?damage:-damage)/100),rateBonus:rate,damageBonus:damage,approximate,ally,enemy};
    }catch(e){return {error:e.message};}
  }
  return {KEYS,LABELS,defaults,normalize,encode,decode,initialCardState,baseBonuses,conditionalBonus,cardBonuses,relevant,enemyStats,calculate};
});
