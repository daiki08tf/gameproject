/* Adventure / World 4.0 — W4 pilot route + W26-W28 Story/Free Adventure integration.
   Canonical Story stages/Bosses remain owned by CHAPTERS. This adapter only wraps
   them as Adventure route nodes and never duplicates battle/reward progression. */
import { CHAPTERS } from './stages.js';
import { normalizeAdventure4Route } from './adventureWorld4Routes.js';
import { CLR1_COMBAT_CHAIN_TAG,adventure4Clr1BattleClearFlag } from './coreLoopClr1.js';
import {
  CLR2_AFTERMATH_TAG,
  CLR2_BRANCH_NODE_IDS,
  CLR2_PRESSURE_TAG,
  CLR2_STEADY_TAG,
  adventure4Clr2AftermathNodeId,
} from './coreLoopClr2.js';

const CLR_COMBAT_FIRST_REGIONS=Object.freeze(new Set(['frontier','elemental']));

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

/* CLR combat-first slice.
   CLR-1 supplies the canonical multi-battle expedition. CLR-2 inserts concise
   aftermath checkpoints and one meaningful mid-run route decision. CLR-4
   reuses this exact route adapter in a second cleared Region rather than copying
   battle, reward, or save authorities. */
function buildClrCombatFirstFreeAdventureRoute(region,options={}){
  const legacy=buildLegacyFreeAdventureRoute(region,options);
  const bossEndpoint=adventure4RegionBossEndpoint(region);
  const candidates=freeAdventureStageRefs(region).filter(ref=>ref.stage?.id&&ref.stage.id!==bossEndpoint?.stageId);
  const selected=candidates.slice(0,5);
  if(bossEndpoint)selected.push({chapter:bossEndpoint.chapterNumber,kind:'final-boss',stage:{id:bossEndpoint.stageId,name:bossEndpoint.stageName}});
  if(selected.length<4)return legacy;

  const battleIds=selected.map((_,index)=>`clr1-battle-${index+1}`);
  const aftermathIds=battleIds.map(adventure4Clr2AftermathNodeId);
  const hasMidRunBranch=selected.length>=6;
  const battleNames=['前哨戦','第二遭遇','中枢戦','追加強敵','深部戦'];

  const battleNodes=selected.map((ref,index)=>{
    const id=battleIds[index],final=index===selected.length-1;
    let condition=null;
    if(index>0){
      const prerequisiteIndex=hasMidRunBranch&&index===4?2:index-1;
      condition={flag:adventure4Clr1BattleClearFlag(battleIds[prerequisiteIndex])};
    }
    return{
      id,
      type:final?'boss':ref.kind==='boss'?'elite':'battle',
      name:final?ref.stage.name||'地域の強敵':`${battleNames[index]||`${index+1}戦目`}：${ref.stage.name||'遭遇戦'}`,
      stageId:ref.stage.id,
      next:final?['return']:[aftermathIds[index],'return'],
      condition,
      tags:['free-adventure',CLR1_COMBAT_CHAIN_TAG,final?'finisher':'combat',ref.kind||'route',hasMidRunBranch&&index===3?CLR2_PRESSURE_TAG:''].filter(Boolean),
    };
  });

  const aftermathNodes=[];
  for(let index=0;index<selected.length-1;index++){
    const currentBattleId=battleIds[index];
    let next=[battleIds[index+1],'return'];
    let name='戦果整理：装備と残存戦力を確認';
    if(hasMidRunBranch&&index===2){
      next=[CLR2_BRANCH_NODE_IDS.steady,CLR2_BRANCH_NODE_IDS.pressure,'return'];
      name='戦果整理：この先の狩り方を選ぶ';
    }else if(hasMidRunBranch&&index===3){
      next=[battleIds[4],'return'];
      name='戦果整理：追加強敵を突破';
    }
    aftermathNodes.push({
      id:aftermathIds[index],type:'event',name,next,
      condition:{flag:adventure4Clr1BattleClearFlag(currentBattleId)},
      tags:['free-adventure',CLR2_AFTERMATH_TAG,'choice','combat-aftermath'],
    });
  }

  const branchNodes=hasMidRunBranch?[
    {
      id:CLR2_BRANCH_NODE_IDS.steady,type:'scene',name:'安全路：1戦省いて深部へ',next:[battleIds[4],'return'],
      condition:{flag:adventure4Clr1BattleClearFlag(battleIds[2])},
      tags:['free-adventure','choice',CLR2_STEADY_TAG,'short-route'],
    },
    {
      id:CLR2_BRANCH_NODE_IDS.pressure,type:'scene',name:'圧力路：追加の強敵も狩る',next:[battleIds[3],'return'],
      condition:{flag:adventure4Clr1BattleClearFlag(battleIds[2])},
      tags:['free-adventure','choice',CLR2_PRESSURE_TAG,'extra-combat'],
    },
  ]:[];

  const legacyCompatibility=legacy.nodes
    .filter(node=>!['entry','return'].includes(node.id))
    .map(node=>({...node,next:[...(node.next||[])],tags:[...(node.tags||[])],condition:node.condition?{...node.condition}:null}));
  const nodes=[
    {id:'entry',type:'scene',name:`${region.name}・連戦探索`,next:[battleIds[0],'return'],tags:['free-adventure','visible','combat-first']},
    ...battleNodes,
    ...aftermathNodes,
    ...branchNodes,
    ...legacyCompatibility,
    {id:'return',type:'camp',name:'帰還路',next:[],tags:['return','visible']},
  ];
  return normalizeAdventure4Route({
    id:`${region.id}-free-adventure`,
    regionId:region.id,
    name:`${region.name}・自由探索`,
    entryNodeId:'entry',
    nodes,
    tags:['free-adventure','dungeon','authored','clr1-combat-first','clr2-aftermath-branching','clr4-shared-combat-loop'],
  });
}

function buildFreeAdventureRoute(region,options={}){
  return CLR_COMBAT_FIRST_REGIONS.has(region.id)?buildClrCombatFirstFreeAdventureRoute(region,options):buildLegacyFreeAdventureRoute(region,options);
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