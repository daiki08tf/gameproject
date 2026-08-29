/* Adventure / World 4.0 — W18-W22 Living World data contracts.
   Combat/reward scaling stays authoritative in existing systems. This module
   only describes utility exploration effects and optional content availability. */
import { normalizeAdventure4Scene } from './adventureWorld4Scenes.js';

export const ADVENTURE4_UTILITY_EFFECTS=Object.freeze({
  routeIntel:{id:'routeIntel',name:'道程観測',detail:'直近の経路情報を詳しく読む'},
  traceLens:{id:'traceLens',name:'痕跡読解',detail:'Trace/Nemesisの手掛かりを詳しく読む'},
  campToolkit:{id:'campToolkit',name:'野営支援',detail:'Campで追加の準備択を使う'},
});

export const ADVENTURE4_LIVING_THRESHOLDS=Object.freeze({
  elite:1,
  nemesis:1,
  anomaly:2,
  secret:3,
  endgame:4,
});

export const ADVENTURE4_NEMESIS_REGION_ROUTE=Object.freeze([
  'frontier','elemental','fracture','last-mortal','veil','outer-world','reverse-observation',
]);

export function adventure4UtilitySetFromRegionalGear(items=[],regionId=null){
  const matching=(items||[]).filter(item=>item?.adventure4RegionalGear?.regionId===regionId);
  const count=matching.length;
  return Object.freeze({
    regionId,
    count,
    effects:Object.freeze([
      ...(count>=2?['routeIntel','traceLens']:[]),
      ...(count>=3?['campToolkit']:[]),
    ]),
  });
}

export function adventure4WorldTierAvailability(rank=0){
  const n=Math.max(0,Math.floor(Number(rank)||0));
  return Object.freeze(Object.fromEntries(Object.entries(ADVENTURE4_LIVING_THRESHOLDS).map(([key,need])=>[key,n>=need])));
}

export function adventure4NemesisHuntStage({active=false,intel=[],huntMode=null}={}){
  if(!active)return'inactive';
  const known=new Set(Array.isArray(intel)?intel:[]);
  if(huntMode||known.size>=3)return'located';
  if(known.size>=2)return'clue';
  if(known.size>=1)return'trace';
  return'activity';
}

export function adventure4NemesisRegion(baseId='',progress=0){
  const text=String(baseId||'nemesis');
  const seed=[...text].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
  const offset=Math.max(0,Math.floor(Number(progress)||0));
  return ADVENTURE4_NEMESIS_REGION_ROUTE[(seed+offset)%ADVENTURE4_NEMESIS_REGION_ROUTE.length];
}

export function adventure4LivingWorldFlags({season=null,weather=null,daypart=null,worldEvent=null,worldTierRank=0,utilityEffects=[],nemesisStage='inactive',nemesisRegion=null}={}){
  const flags={};
  if(season)flags[`living:season:${season}`]=true;
  if(weather)flags[`living:weather:${weather}`]=true;
  if(daypart)flags[`living:daypart:${daypart}`]=true;
  if(worldEvent)flags[`living:event:${worldEvent}`]=true;
  for(const effect of utilityEffects||[])flags[`living:utility:${effect}`]=true;
  for(const [key,value] of Object.entries(adventure4WorldTierAvailability(worldTierRank)))if(value)flags[`living:wt:${key}`]=true;
  if(nemesisStage!=='inactive')flags[`living:nemesis:${nemesisStage}`]=true;
  if(nemesisRegion)flags[`living:nemesisRegion:${nemesisRegion}`]=true;
  return flags;
}

export function buildAdventure4LivingWorldScene(ctx={}){
  const regionName=ctx.regionName||'この地域';
  const weather=ctx.weatherName||'穏やかな空';
  const daypart=ctx.daypartName||'昼';
  const choices=[
    {id:'observe',label:'周囲の変化を読む',detail:`${weather} / ${daypart}`,resultText:`${regionName}の空気、足跡、道の状態を確認した。`,consequences:[{scope:'adventure',type:'flag',key:'living:surveyed',value:true}]},
  ];
  if(ctx.utility?.effects?.includes('routeIntel'))choices.push({id:'gear-route',label:'探索装備で経路を測る',detail:'2部位Utility Set',resultText:'装備の計測具で、安全路と迂回路の差を読み取った。',consequences:[{scope:'adventure',type:'flag',key:'living:routeIntelUsed',value:true}]});
  if(ctx.utility?.effects?.includes('campToolkit'))choices.push({id:'gear-camp',label:'野営具を準備する',detail:'3部位Utility Set',resultText:'戦闘力ではなく探索の準備に装備を使い、次の調査手順を整えた。',consequences:[{scope:'adventure',type:'flag',key:'living:campPrepared',value:true}]});
  if(ctx.weatherId==='mist'||ctx.daypartId==='night'||ctx.weatherId==='rain')choices.push({id:'conditions',label:'環境の変化を追う',detail:ctx.weatherId==='mist'?'霧の中だけ浮く輪郭':ctx.weatherId==='rain'?'雨で浮いた足跡':'夜だけ見える反射',resultText:'普段は見えない地形や痕跡の違和感を記録した。',consequences:[{scope:'adventure',type:'flag',key:'living:conditionalTrace',value:true}]});
  if(ctx.worldEvent)choices.push({id:'event',label:'地域の騒ぎを調べる',detail:ctx.worldEvent.name||'World Event',resultText:'現在のWorld Eventが人の流れと脇道の使われ方を変えている。報酬処理そのものは既存World Eventに任せる。',consequences:[{scope:'adventure',type:'flag',key:'living:eventObserved',value:true}]});
  if(ctx.nemesisStage&&ctx.nemesisStage!=='inactive'&&ctx.nemesisHere){
    const located=ctx.nemesisStage==='located'&&ctx.nemesisId;
    choices.push({
      id:'nemesis',
      label:located?'Nemesisの居場所へ踏み込む':'Nemesisの痕跡を追う',
      detail:located?'既存Nemesis戦へ接続':`追跡段階: ${ctx.nemesisStage}`,
      resultText:located?'追跡の末にNemesisを捕捉した。戦闘・難易度・報酬は既存Bounty/Nemesis系へ引き渡す。':'追跡情報を既存Nemesis記録へ接続した。',
      consequences:located
        ?[{scope:'immediate',type:'nemesisBattle',targetId:ctx.nemesisId}]
        :[{scope:'world',type:'nemesisHuntAdvance',targetId:ctx.nemesisId}],
    });
  }
  if(ctx.worldTierAvailability?.anomaly)choices.push({id:'anomaly',label:'異常地点を確認する',detail:'World Tierで出現',resultText:'高いWorld Tierだからこそ現れた異常地点を記録した。敵倍率や報酬倍率はここでは変更しない。',consequences:[{scope:'adventure',type:'flag',key:'living:anomalyObserved',value:true}]});
  return normalizeAdventure4Scene({
    id:`living-world-${ctx.regionId||'region'}`,
    name:'移ろう地域',entryStepId:'observe',tags:['living-world','optional'],
    steps:[{id:'observe',phase:'observation',title:'いつもと違う気配',text:`${regionName}は同じ地図でも、季節・天候・時刻・出来事によって見え方が変わる。`,choices}],
  });
}
