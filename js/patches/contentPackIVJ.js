/* Content Pack IV J — 月蝕の境界 (Ch19) evidence-grant runtime.
   Mirrors contentPackIVG.js/contentPackIVI.js's TextBattleScreen wrap
   pattern, simplified to a single stage-clear -> single discovery grant. */
import { state } from '../state.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { CP4_VEIL_EVIDENCE, cp4VeilEvidenceProgress } from '../data/contentPackIVJ.js';

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}
function stageCleared(id){return Boolean(state.isStageCleared?.(id));}

export function syncCP4VeilEvidence(){
  return cp4VeilEvidenceProgress({discoveries:world().discoveries,isStageCleared:stageCleared});
}

function grantEvidence(stageId,result){
  if(!result?.cleared||stageId!==CP4_VEIL_EVIDENCE.prerequisiteStageId)return null;
  const d=world().discoveries;
  if(d[CP4_VEIL_EVIDENCE.discoveryId])return null;
  put(CP4_VEIL_EVIDENCE.discoveryId,{
    name:`記録不一致：${CP4_VEIL_EVIDENCE.label}`,
    hint:CP4_VEIL_EVIDENCE.text,
    contentPackIV:true,
    historicalConflict:true,
    targetChapter:CP4_VEIL_EVIDENCE.primeChapter,
    nextAction:CP4_VEIL_EVIDENCE.next,
  });
  state.save();
  return CP4_VEIL_EVIDENCE;
}

state.cp4VeilEvidenceProgress=function(){return syncCP4VeilEvidence();};

const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function cp4VeilEvidenceStart(stageId,onEnd,blessingId){
  const wrappedOnEnd=(result)=>{
    const granted=grantEvidence(stageId,result);
    if(granted){
      this._pushLines?.([`記録不一致 — ${granted.label}`,granted.text,granted.next]);
      this._renderLog?.();
    }
    return onEnd?.(result);
  };
  return previousStart.call(this,stageId,wrappedOnEnd,blessingId);
};
