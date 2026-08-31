/* Adventure / World 4.0 — W4 pilot route + W26-W28 Story/Free Adventure integration.
   Canonical Story stages/Bosses remain owned by CHAPTERS. This adapter only wraps
   them as Adventure route nodes and never duplicates battle/reward progression. */
import { CHAPTERS } from './stages.js';
import { normalizeAdventure4Route } from './adventureWorld4Routes.js';
import { CLR1_COMBAT_CHAIN_TAG,adventure4Clr1BattleClearFlag } from './coreLoopClr1.js';

function chapterByNumber(number){return CHAPTERS.find(ch=>Number(ch.num)===Number(number))||CHAPTERS[Number(number)-1]||null;}
function primaryStages(chapter){return (chapter?.stages||[]).filter(stage=>!stage.branch);}
/* Keep the same endpoint rule as the existing World3/World4 Region authorities:
   prefer an authored Boss, otherwise the chapter's final Stage is the canonical
   completion endpoint. Adventure must not invent a separate boss progression. */
function canonicalBoss(chapter){return chapter?.stages?.find(stage=>stage.boss&&!stage.branch)||chapter?.stages?.find(stage=>stage.boss)||chapter?.stages?.at(-1)||null;}
function ownedChapters(region){return (region?.chapterNumbers||[]).map(chapterByNumber).filter(Boolean);}

export function adventure4ShortcutDiscoveryId(regionId){return regionId?`adventure4-shortcut-${regionId}`:null;}

export function adventure4RegionBossEndpoint(region){
  const chapters=ownedChapters(region),chapter=chapters.at(-1)||null,boss=canonicalBoss(chapter);
  if(!boss)return null;
  return Object.freeze({chapterNumber:Number(chapter.num),stageId:boss.id,stageName:boss.name||'地域の強敵'});
}

export function adventure4SecretBossEndpoint({id='secret-boss',name='隠された強敵',stageId,condition}={}){
  if(!stageId)return null;
  return Object.freeze({
    id,type:'boss',name,stageId,next:['return'],hidden:true,
    condition:condition||{allOf:[{flag:'secretBossKnown'},{flag:'mysteryResolved'}]},
    tags:Object.freeze(['secret','boss','optional']),
  });
}

function buildStoryRoute(region,regionState){
  const story=regionState?.routeEntry||null;
  const nodes=[
    {id:'entry',type:'scene',name:`${region.name}への道`,next:['fork'],tags:['major','visible']},
    {id:'fork',type:'event',name:'分かれ道',sceneId:'pilot-fork',next:story?['story','return']:['return'],tags:['choice','visible']},
  ];
  if(story){
    nodes.push({id:'story',type:'battle',name:story.stageName||'物語の戦い',stageId:story.stageId,next:['return'],tags:['story','major']});
  }
  nodes.push({id:'return',type:'camp',name:'帰還路',next:[],tags:['return','visible']});
  return normalizeAdventure4Route({id:`${region.id}-story-route`,regionId:region.id,name:`${region.name}・物語路`,entryNodeId:'entry',nodes,tags:['story','authored']});
}

function freeAdventureStageRefs(region){
  const refs=[];
  for(const chapter of ownedChapters(region)){
    const stages=primaryStages(chapter);
    const first=stages[0],boss=canonicalBoss(chapter);
    if(first)refs.push({chapter:Number(chapter.num),kind:'route',stage:first});
    if(boss&&boss.id!==first?.id)refs.push({chapter:Number(chapter.num),kind:'boss',stage:boss});
  }
  return refs;
}

function buildLegacyFreeAdventureRoute(region,{secretBoss=null}={}){
  const refs=freeAdventureStageRefs(region),bossEndpoint=adventure4RegionBossEndpoint(region);
  const shortcutId=adventure4ShortcutDiscoveryId(region.id);
  const nodes=[
    {id:'entry',type:'scene',name:`${region.name}・自由探索`,next:['crossroads'],tags:['free-adventure','visible']},
    {id:'crossroads',type:'event',name:'探索の分岐',next:['deep-route','shortcut','return'],tags:['choice','dungeon']},
    {id:'deep-route',type:'scene',name:'深部への道',next:['treasure','camp'],tags:['dungeon','branch']},
    {id:'treasure',type:'treasure',name:'探索地点',next:['camp'],tags:['dungeon','treasure']},
    {id:'camp',type:'camp',name:'野営地',next:['boss-gate','return'],tags:['dungeon','camp']},
    {id:'shortcut',type:'scene',name:'既知の近道',next:['boss-gate'],hidden:true,condition:{discovery:shortcutId},tags:['shortcut','permanent']},
    {id:'boss-gate',type:'scene',name:'最深部',next:bossEndpoint?['region-boss','return']:['return'],tags:['dungeon','boss-gate']},
  ];
  if(bossEndpoint)nodes.push({id:'region-boss',type:'boss',name:bossEndpoint.stageName,stageId:bossEndpoint.stageId,next:['return'],tags:['region-boss','canonical']});
  const secret=adventure4SecretBossEndpoint(secretBoss||{});if(secret){nodes.find(n=>n.id==='boss-gate').next.splice(1,0,secret.id);nodes.push({...secret});}
  nodes.push({id:'return',type:'camp',name:'帰還路',next:[],tags:['return','visible']});
  return normalizeAdventure4Route({id:`${region.id}-free-adventure`,regionId:region.id,name:`${region.name}・自由探索`,entryNodeId:'entry',nodes,tags:['free-adventure','dungeon','authored'],stageRefs:refs});
}

/* CLR-1 vertical slice.
   Only the already-cleared frontier Free Adventure is reweighted here. Keeping
   the old node IDs in the graph lets an older suspended session finish safely,
   while every newly-entered session follows the combat-first entry path. */
function buildClr1FrontierFreeAdventureRoute(region,options={}){
  const legacy=buildLegacyFreeAdventureRoute(region,options);
  const bossEndpoint=adventure4RegionBossEndpoint(region);
  const candidates=freeAdventureStageRefs(region).filter(ref=>ref.stage?.id&&ref.stage.id!==bossEndpoint?.stageId);
  const selected=candidates.slice(0,5);
  if(bossEndpoint)selected.push({chapter:bossEndpoint.chapterNumber,kind:'final-boss',stage:{id:bossEndpoint.stageId,name:bossEndpoint.stageName}});
  if(selected.length<4)return legacy;

  const battleIds=selected.map((_,index)=>`clr1-battle-${index+1}`);
  const chainNodes=selected.map((ref,index)=>{
    const id=battleIds[index],previousId=battleIds[index-1]||null,nextId=battleIds[index+1]||null;
    const final=index===selected.length-1;
    return{
      id,
      type:final?'boss':ref.kind==='boss'?'elite':'battle',
      name:final?ref.stage.name||'地域の強敵':`${index+1}戦目：${ref.stage.name||'遭遇戦'}`,
      stageId:ref.stage.id,
      next:nextId?[nextId,'return']:['return'],
      condition:previousId?{flag:adventure4Clr1BattleClearFlag(previousId)}:null,
      tags:['free-adventure',CLR1_COMBAT_CHAIN_TAG,final?'finisher':'combat',ref.kind||'route'],
    };
  });

  const legacyCompatibility=legacy.nodes
    .filter(node=>!['entry','return'].includes(node.id))
    .map(node=>({...node,next:[...(node.next||[])],tags:[...(node.tags||[])],condition:node.condition?{...node.condition}:null}));
  const nodes=[
    {id:'entry',type:'scene',name:`${region.name}・連戦探索`,next:[battleIds[0],'return'],tags:['free-adventure','visible','combat-first']},
    ...chainNodes,
    ...legacyCompatibility,
    {id:'return',type:'camp',name:'帰還路',next:[],tags:['return','visible']},
  ];
  return normalizeAdventure4Route({
    id:`${region.id}-free-adventure`,
    regionId:region.id,
    name:`${region.name}・自由探索`,
    entryNodeId:'entry',
    nodes,
    tags:['free-adventure','dungeon','authored','clr1-combat-first'],
  });
}

function buildFreeAdventureRoute(region,options={}){
  return region.id==='frontier'?buildClr1FrontierFreeAdventureRoute(region,options):buildLegacyFreeAdventureRoute(region,options);
}

export function buildAdventure4PilotRoute(region,regionState,options={}){
  if(!region?.id)return null;
  const storyCleared=regionState?.status==='completed'&&!regionState?.routeEntry;
  return storyCleared?buildFreeAdventureRoute(region,options):buildStoryRoute(region,regionState);
}

export function adventure4PilotPreview(route,currentNodeId,availableNext=null){
  if(!route)return[];
  const current=route.nodes.find(node=>node.id===currentNodeId)||route.nodes.find(node=>node.id===route.entryNodeId)||null;
  if(!current)return[];
  const next=Array.isArray(availableNext)
    ? availableNext.filter(node=>node&&!node.hidden)
    : current.next.map(id=>route.nodes.find(node=>node.id===id)).filter(Boolean).filter(node=>!node.hidden);
  const visible=[{name:current.name,state:'current'},...next.map(node=>({name:node.name,state:'next'}))];
  if(next.some(node=>node.next?.length))visible.push({name:'この先は未詳',state:'unknown'});
  return visible;
}