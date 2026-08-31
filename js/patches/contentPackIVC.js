/* Content Pack IV C — Branch Sight awakening runtime. */
import './contentPackIVD.js';
import { state } from '../state.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { CP4_BRANCH_SIGHT_AWAKENING,cp4BranchSightProgress,cp4BranchSightActivationForStage } from '../data/contentPackIVC.js';

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}

export function syncCP4BranchSight(){
  const d=world().discoveries,event=CP4_BRANCH_SIGHT_AWAKENING;
  const progress=cp4BranchSightProgress({discoveries:d});
  const contact=d[event.prerequisiteDiscoveryId];
  if(contact)contact.branchSightActive=progress.active;
  const rumor=d['rumor:cp4:deep-green-record-conflict'];
  if(rumor&&progress.state!=='locked'){
    rumor.rumorState=progress.active?'resolved':'tracking';
    rumor.rumorStateLabel=progress.active?'解決済み':'追跡中';
    rumor.hint=progress.active?event.activation:event.intro;
    rumor.nextAction=progress.active?event.next:`深緑の森 ${event.activationStageId} — ${event.label}`;
  }
  return progress;
}

function recordAwakening(stageId,wasReady,result){
  if(!wasReady||!result?.cleared)return null;
  const d=world().discoveries,event=cp4BranchSightActivationForStage(stageId,{discoveries:d});
  if(!event)return null;
  put(event.discoveryId,{
    name:event.name,hint:event.activation,nextAction:event.next,contentPackIV:true,branchSight:true,branchSightActive:true,
    authoredPerceptionState:true,numeric:false,trainable:false,equippable:false,battleBonus:false,
    sourceStageId:stageId,targetChapter:2,revealsAllBranches:false,
  });
  syncCP4BranchSight();state.save();
  return event;
}

state.cp4BranchSightProgress=function(){return syncCP4BranchSight();};
state.hasBranchSight=function(){return Boolean(world().discoveries[CP4_BRANCH_SIGHT_AWAKENING.discoveryId]);};

if(state.rumorNotebook&&!state.rumorNotebook.__cp4c){
  const previous=state.rumorNotebook.bind(state);
  const wrapped=function cp4CNotebook(){syncCP4BranchSight();return previous();};wrapped.__cp4c=true;state.rumorNotebook=wrapped;
}

const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function cp4BranchSightStart(stageId,onEnd,blessingId){
  const before=cp4BranchSightProgress({discoveries:world().discoveries});
  const wasReady=before.ready&&before.nextStageId===stageId;
  const wrappedOnEnd=(result)=>{
    const event=recordAwakening(stageId,wasReady,result);
    if(event){
      this._pushLines?.([
        `知覚安定 — ${event.label}`,
        event.intro,
        ...event.lines,
        `分岐視 / Branch Sight — ${event.activation}`,
        event.next,
      ]);
      this._renderLog?.();
    }
    return onEnd?.(result);
  };
  return previousStart.call(this,stageId,wrappedOnEnd,blessingId);
};

syncCP4BranchSight();
