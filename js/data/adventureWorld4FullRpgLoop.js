/* Adventure / World 4.0 — W26-W29 Full RPG Loop contracts.
   Story/Boss/WT/Realm progression remains authoritative elsewhere. */
import { normalizeAdventure4Route } from './adventureWorld4Routes.js';

function primaryStages(chapter){return (chapter?.stages||[]).filter(stage=>!stage.branch);}
function chaptersFor(region,chapters){return (region?.chapterNumbers||[]).map(n=>chapters.find(ch=>Number(ch.num)===Number(n))||chapters[Number(n)-1]).filter(Boolean);}
function storyStages(region,chapters){return chaptersFor(region,chapters).flatMap(primaryStages);}

export function adventure4RegionBossStage(region,chapters){
  const owned=chaptersFor(region,chapters);
  for(let i=owned.length-1;i>=0;i--){
    const stages=owned[i]?.stages||[];
    const boss=[...stages].reverse().find(stage=>stage?.boss&&!stage.branch)||[...stages].reverse().find(stage=>stage?.boss);
    if(boss)return boss;
  }
  return storyStages(region,chapters).at(-1)||null;
}

export function adventure4StoryRouteState(region,chapters,isStageCleared=()=>false){
  const stages=storyStages(region,chapters);
  const remaining=stages.filter(stage=>!isStageCleared(stage.id));
  return Object.freeze({
    regionId:region?.id||null,
    total:stages.length,
    cleared:stages.length-remaining.length,
    complete:stages.length>0&&remaining.length===0,
    nextStageId:remaining[0]?.id||null,
    stages:Object.freeze(stages.map(stage=>Object.freeze({id:stage.id,name:stage.name,recLevel:stage.recLevel,boss:!!stage.boss,cleared:!!isStageCleared(stage.id)}))),
  });
}

export function adventure4WorldMode({dynamicStatus='stable',nemesisHere=false,realmSignals=[],worldTierRank=0}={}){
  const riftKnown=(realmSignals||[]).some(signal=>signal?.id==='rift'&&signal.stage!=='hidden');
  if(riftKnown&&Number(worldTierRank)>=3)return Object.freeze({id:'rift-overrun',name:'Rift Overrun',endgame:true});
  if(nemesisHere)return Object.freeze({id:'nemesis-territory',name:'Nemesis Territory',endgame:true});
  if(['unstable','transformed','corrupted','threatened'].includes(dynamicStatus))return Object.freeze({id:'corrupted',name:'Corrupted',endgame:Number(worldTierRank)>=2});
  return Object.freeze({id:'normal',name:'Normal',endgame:Number(worldTierRank)>=4});
}

export function buildAdventure4StoryRegionRoute(region,chapters,isStageCleared=()=>false){
  if(!region?.id)return null;
  const state=adventure4StoryRouteState(region,chapters,isStageCleared);
  if(state.complete||!state.stages.length)return null;
  const remaining=state.stages.filter(stage=>!stage.cleared);
  const nodes=[{id:'entry',type:'scene',name:`${region.name}・Story Route`,next:[`story-${remaining[0].id}`],tags:['story','region-story']}];
  for(let i=0;i<remaining.length;i++){
    const stage=remaining[i],next=remaining[i+1];
    nodes.push({
      id:`story-${stage.id}`,
      type:stage.boss?'boss':'battle',
      name:stage.name,
      stageId:stage.id,
      next:[next?`story-${next.id}`:'return'],
      condition:i===0?null:{stageCleared:remaining[i-1].id},
      tags:['story','canonical-stage',stage.boss?'region-boss-step':'story-step'],
    });
  }
  nodes.push({id:'return',type:'camp',name:'Story Routeから帰還',next:[],tags:['return','visible']});
  return normalizeAdventure4Route({id:`${region.id}-story-route`,regionId:region.id,name:`${region.name}・Story Route`,entryNodeId:'entry',nodes,tags:['story','w26']});
}

export function buildAdventure4FreeRegionRoute(region,chapters,{shortcutCount=0,worldMode={id:'normal'}}={}){
  if(!region?.id)return null;
  const boss=adventure4RegionBossStage(region,chapters);if(!boss)return null;
  const hasShortcut=Number(shortcutCount)>0;
  const entryNext=hasShortcut?['branch','shortcut']:['branch'];
  const nodes=[
    {id:'entry',type:'scene',name:`${region.name}・Free Adventure`,next:entryNext,tags:['free-adventure','w26',worldMode.id]},
    {id:'branch',type:'event',name:'Dungeon分岐',next:['treasure','camp'],tags:['dungeon','branch','w28']},
    {id:'treasure',type:'treasure',name:'探索区画',next:['boss'],tags:['dungeon','treasure','w28']},
    {id:'camp',type:'camp',name:'中継野営地',next:['boss','return'],tags:['dungeon','camp','w28']},
    {id:'boss',type:'boss',name:`Region Boss：${boss.name}`,stageId:boss.id,next:['return'],tags:['region-boss','canonical-stage','w27',worldMode.id]},
    {id:'return',type:'camp',name:'拠点へ帰還',next:[],tags:['return','visible']},
  ];
  if(hasShortcut)nodes.push({id:'shortcut',type:'scene',name:'発見済みShortcut',next:['boss'],tags:['shortcut','permanent','w28']});
  return normalizeAdventure4Route({id:`${region.id}-free-${worldMode.id}`,regionId:region.id,name:`${region.name}・${worldMode.name}`,entryNodeId:'entry',nodes,tags:['free-adventure','dungeon','w27','w28','w29',worldMode.id]});
}

export function adventure4SecretBossFramework({bossStageId=null,mysteryResolved=false,secretDiscovered=false,nemesisDefeated=false}={}){
  const solutions=[!!mysteryResolved,!!secretDiscovered,!!nemesisDefeated];
  return Object.freeze({
    available:!!bossStageId&&solutions.some(Boolean),
    bossStageId:bossStageId||null,
    satisfiedSolutions:solutions.filter(Boolean).length,
    requiresAnyOf:Object.freeze(['mysteryResolved','secretDiscovered','nemesisDefeated']),
  });
}