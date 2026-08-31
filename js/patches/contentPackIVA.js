/* Content Pack IV A — Deep Green contradiction chain runtime. */
import './contentPackIIIB.js';
import './contentPackIVB.js';
import { state } from '../state.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { CP4_DEEP_GREEN_CHAIN,cp4DeepGreenProgress,cp4DeepGreenStepForStage } from '../data/contentPackIVA.js';

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}
function stageCleared(id){return Boolean(state.isStageCleared?.(id));}

export function syncCP4DeepGreen(){
  const d=world().discoveries,chain=CP4_DEEP_GREEN_CHAIN;
  const progress=cp4DeepGreenProgress({discoveries:d,isStageCleared:stageCleared});
  if(progress.state==='locked')return progress;
  const next=chain.steps[progress.step]||null;
  put(`rumor:cp4:${chain.rumor.id}`,{
    name:`噂：${chain.rumor.name}`,rumor:true,rumorId:`cp4:${chain.rumor.id}`,contentPackIV:true,chainId:chain.id,targetChapter:chain.primeChapter,
    rumorState:progress.complete?'resolved':progress.state,
    rumorStateLabel:progress.complete?'解決済み':progress.state==='tracking'?'追跡中':'未解決',
    hint:progress.complete?chain.overlap.text:progress.step===0?chain.rumor.text:(next?.next||chain.overlap.next),
    nextAction:progress.complete?chain.overlap.next:next?`深緑の森 ${next.stageId} — ${next.label}`:chain.overlap.next,
  });
  return progress;
}

function recordStep(stageId,result){
  if(!result?.cleared)return null;
  const d=world().discoveries,chain=CP4_DEEP_GREEN_CHAIN;
  const step=cp4DeepGreenStepForStage(stageId,{discoveries:d,isStageCleared:stageCleared});
  if(!step)return null;
  put(step.discoveryId,{name:`記録不一致：${step.label}`,hint:step.text,contentPackIV:true,historicalConflict:true,chainId:chain.id,sourceStageId:stageId,targetChapter:2});
  const after=cp4DeepGreenProgress({discoveries:d,isStageCleared:stageCleared});
  if(after.step>=chain.steps.length&&!d[chain.overlap.discoveryId]){
    put(chain.overlap.discoveryId,{name:chain.overlap.name,hint:chain.overlap.text,nextAction:chain.overlap.next,contentPackIV:true,historicalConflict:true,overlapCoordinate:true,chainId:chain.id,targetChapter:2});
  }
  syncCP4DeepGreen();state.save();
  return step;
}

state.cp4DeepGreenProgress=function(){return syncCP4DeepGreen();};
state.cp4DeepGreenEvidence=function(){syncCP4DeepGreen();return Object.entries(world().discoveries).filter(([,v])=>v?.contentPackIV&&v?.chainId===CP4_DEEP_GREEN_CHAIN.id).map(([id,v])=>({id,...v}));};

if(state.rumorNotebook&&!state.rumorNotebook.__cp4a){
  const previous=state.rumorNotebook.bind(state);
  const wrapped=function cp4ANotebook(){syncCP4DeepGreen();return previous();};wrapped.__cp4a=true;state.rumorNotebook=wrapped;
}

const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function cp4DeepGreenStart(stageId,onEnd,blessingId){
  const wrappedOnEnd=(result)=>{
    const step=recordStep(stageId,result);
    if(step){
      this._pushLines?.([`記録不一致 — ${step.label}`,step.text]);
      const progress=cp4DeepGreenProgress({discoveries:world().discoveries,isStageCleared:stageCleared});
      if(progress.complete)this._pushLines?.(['三つの記録は互いに矛盾している。それでも同じ座標だけは一致している。','NEXT — 重複座標で観測不一致の原因を調べる。']);
      this._renderLog?.();
    }
    return onEnd?.(result);
  };
  return previousStart.call(this,stageId,wrappedOnEnd,blessingId);
};

syncCP4DeepGreen();
