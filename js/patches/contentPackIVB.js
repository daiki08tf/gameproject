/* Content Pack IV B — Parallax Core first-contact runtime. */
import './contentPackIVC.js';
import { state } from '../state.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { CP4_PARALLAX_CONTACT,cp4ParallaxProgress,cp4ParallaxContactForStage } from '../data/contentPackIVB.js';

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}

export function syncCP4Parallax(){
  const d=world().discoveries,event=CP4_PARALLAX_CONTACT;
  const progress=cp4ParallaxProgress({discoveries:d});
  const rumor=d['rumor:cp4:deep-green-record-conflict'];
  if(rumor&&progress.state!=='locked'){
    rumor.rumorState=progress.complete?'resolved':'tracking';
    rumor.rumorStateLabel=progress.complete?'解決済み':'追跡中';
    rumor.hint=progress.complete?event.collapse:event.intro;
    rumor.nextAction=progress.complete?event.next:`深緑の森 ${event.investigationStageId} — ${event.label}`;
  }
  return progress;
}

function recordContact(stageId,wasReady){
  if(!wasReady)return null;
  const d=world().discoveries,event=cp4ParallaxContactForStage(stageId,{discoveries:d});
  if(!event)return null;
  put(event.discoveryId,{
    name:event.name,hint:event.collapse,nextAction:event.next,contentPackIV:true,parallaxCore:true,firstContact:true,
    historicalConflict:true,sourceStageId:stageId,targetChapter:2,perceptionChangedMomentarily:true,branchSightActive:false,
  });
  syncCP4Parallax();state.save();
  return event;
}

state.cp4ParallaxProgress=function(){return syncCP4Parallax();};
state.cp4ParallaxContact=function(){return world().discoveries[CP4_PARALLAX_CONTACT.discoveryId]||null;};

if(state.rumorNotebook&&!state.rumorNotebook.__cp4b){
  const previous=state.rumorNotebook.bind(state);
  const wrapped=function cp4BNotebook(){syncCP4Parallax();return previous();};wrapped.__cp4b=true;state.rumorNotebook=wrapped;
}

const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function cp4ParallaxStart(stageId,onEnd,blessingId){
  const before=cp4ParallaxProgress({discoveries:world().discoveries});
  const wasReady=before.ready&&before.nextStageId===stageId;
  const out=previousStart.call(this,stageId,onEnd,blessingId);
  const event=recordContact(stageId,wasReady);
  if(event){
    this._pushLines?.([
      `重複座標 — ${event.label}`,
      event.intro,
      `${event.core.name} — ${event.core.description}`,
      ...event.perceptions,
      event.collapse,
      event.next,
    ]);
  }
  return out;
};

syncCP4Parallax();
