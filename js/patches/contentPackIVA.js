/* Content Pack IV — CP4-1 deterministic contradiction chain runtime.
   Reuses existing Adventure event history + world2.discoveries. */
import './contentPackIIIB.js';
import './adventureWorld4ContentPackI.js';
import { state } from '../state.js';
import {
  CP4_REQUIRED_STAGE_ID,CP4_REGION_ID,CP4_CHAIN_ID,CP4_RUMOR_ID,
  CP4_OVERLAP_DISCOVERY_ID,CP4_CONTRADICTION_EVENTS,CP4_EVIDENCE,
  cp4ContradictionProgress,cp4ContradictionSceneById,
} from '../data/contentPackIVA.js';

const EVENT_FLAG='contentPackIV:eventId';
const DONE_FLAG='contentPackIV:done';

function world(){state.data.world2??={};state.data.world2.discoveries??={};state.data.world2.eventsSeen??={};state.data.world2.eventChains??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}
function storyComplete(){return Boolean(state.isStageCleared?.(CP4_REQUIRED_STAGE_ID));}
function progress(){return cp4ContradictionProgress({eventsSeen:world().eventsSeen,storyComplete:storyComplete()});}
function patchFlags(manager,changes){const session=manager.adventure4Session?.();if(!session?.active)return null;return manager.checkpointAdventure4?.({temporaryFlags:{...(session.temporaryFlags||{}),...changes}})||null;}

export function syncCP4Contradiction({save=false}={}){
  if(!storyComplete())return null;
  const w=world(),p=progress();
  for(const [eventId,evidence] of Object.entries(CP4_EVIDENCE)){
    if(!w.eventsSeen[eventId])continue;
    put(evidence.id,{name:evidence.name,hint:evidence.hint,contentPackIV:true,cp4Evidence:true,chainId:CP4_CHAIN_ID,targetChapter:2,targetRegionId:CP4_REGION_ID});
  }
  if(p.complete){
    put(CP4_OVERLAP_DISCOVERY_ID,{
      name:'重なりの座標：深緑の森',
      hint:'現在の森、大樹霊が生き続ける森、森そのものが存在しない記録。三つの整合した結果が同じ一点で最も強く重なる。次はこの座標そのものを再調査する。',
      contentPackIV:true,cp4OverlapCoordinate:true,chainId:CP4_CHAIN_ID,targetChapter:2,targetRegionId:CP4_REGION_ID,
    });
  }
  const hints=[
    'Ch35の共観測記録が、深緑の森の旧戦場と同じ座標を示している。まず現在の痕跡を確認する。',
    '現在の記録は矛盾していない。だが別の輪郭が残る。同じ座標を示す古い資料を探す。',
    '大樹霊が生き続ける古記録は内部的に一貫している。機械より古い根脈記憶と照合する。',
    '三つの両立しない記録が同じ一点へ収束した。重なりの座標を特定した。',
  ];
  const next=[
    '開拓辺境を再訪し、深緑の森の旧戦場を調べる',
    '深緑の森と同じ座標を持つ古記録を照合する',
    '深緑の森の根脈記憶を調べる',
    '重なりの座標を再調査する',
  ];
  const rumor=put(`rumor:cp4:${CP4_RUMOR_ID}`,{
    name:'噂：三つある深緑の記録',rumor:true,rumorId:`cp4:${CP4_RUMOR_ID}`,contentPackIV:true,targetChapter:2,targetRegionId:CP4_REGION_ID,
    rumorState:p.complete?'resolved':'tracking',rumorStateLabel:p.complete?'解決済み':'追跡中',
    hint:hints[Math.min(p.step,3)],nextAction:next[Math.min(p.step,3)],chainId:CP4_CHAIN_ID,chainCompleted:p.step,chainTotal:p.total,
  });
  if(p.complete&&!rumor.resolvedAt)rumor.resolvedAt=Date.now();
  if(save)state.save();
  return rumor;
}

state.cp4ContradictionProgress=function(){syncCP4Contradiction();return progress();};
state.cp4ContradictionEvidence=function(){syncCP4Contradiction();return Object.entries(world().discoveries).filter(([,v])=>v?.contentPackIV&&(v?.cp4Evidence||v?.cp4OverlapCoordinate)).map(([id,v])=>({id,...v}));};

if(state.rumorNotebook&&!state.rumorNotebook.__cp4a){
  const previous=state.rumorNotebook.bind(state);
  const wrapped=function cp4ANotebook(){syncCP4Contradiction();return previous();};
  wrapped.__cp4a=true;state.rumorNotebook=wrapped;
}

function cp4EventForSession(manager){
  const session=manager.adventure4Session?.();
  if(!session?.active||session.regionId!==CP4_REGION_ID||!storyComplete())return null;
  const existing=session.temporaryFlags?.[EVENT_FLAG];
  if(existing)return CP4_CONTRADICTION_EVENTS.find(event=>event.id===existing)||null;
  if(session.temporaryFlags?.[DONE_FLAG]||progress().complete)return null;
  const event=manager.rollAdventure4Event?.(CP4_CONTRADICTION_EVENTS,{rng:()=>0,allowRare:false})||null;
  if(event)patchFlags(manager,{[EVENT_FLAG]:event.id});
  return event;
}

const previousScene=state.adventure4ContentPackIScene?.bind(state);
state.adventure4ContentPackIScene=function cp4AContentScene(){
  const event=cp4EventForSession(this);
  if(event)return cp4ContradictionSceneById(event.sceneId);
  return previousScene?previousScene():null;
};

const previousComplete=state.completeAdventure4ContentPackIScene?.bind(state);
state.completeAdventure4ContentPackIScene=function cp4ACompleteScene(){
  const session=this.adventure4Session?.();
  const eventId=session?.temporaryFlags?.[EVENT_FLAG];
  if(!eventId)return previousComplete?previousComplete():{ok:false,reason:'missing_content_scene'};
  const event=CP4_CONTRADICTION_EVENTS.find(item=>item.id===eventId);
  if(!event)return{ok:false,reason:'cp4_event_missing'};
  const recorded=this.recordAdventure4Event?.(event);
  if(!recorded?.ok)return recorded||{ok:false,reason:'cp4_record_failed'};
  syncCP4Contradiction({save:true});
  return patchFlags(this,{[EVENT_FLAG]:null,[DONE_FLAG]:true})||{ok:true,eventId};
};

syncCP4Contradiction({save:false});
