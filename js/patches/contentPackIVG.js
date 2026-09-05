/* Content Pack IV G — 灼熱の火山 (Ch5) evidence-grant runtime.
   Mirrors contentPackIVA.js's TextBattleScreen wrap pattern, simplified to a
   single stage-clear -> single discovery grant (no multi-step chain). */
import { state } from '../state.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { CP4_VOLCANO_EVIDENCE, cp4VolcanoEvidenceProgress } from '../data/contentPackIVG.js';

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}
function stageCleared(id){return Boolean(state.isStageCleared?.(id));}

export function syncCP4VolcanoEvidence(){
  return cp4VolcanoEvidenceProgress({discoveries:world().discoveries,isStageCleared:stageCleared});
}

function grantEvidence(stageId,result){
  if(!result?.cleared||stageId!==CP4_VOLCANO_EVIDENCE.prerequisiteStageId)return null;
  const d=world().discoveries;
  if(d[CP4_VOLCANO_EVIDENCE.discoveryId])return null;
  put(CP4_VOLCANO_EVIDENCE.discoveryId,{
    name:`記録不一致：${CP4_VOLCANO_EVIDENCE.label}`,
    hint:CP4_VOLCANO_EVIDENCE.text,
    contentPackIV:true,
    historicalConflict:true,
    targetChapter:CP4_VOLCANO_EVIDENCE.primeChapter,
    nextAction:CP4_VOLCANO_EVIDENCE.next,
  });
  state.save();
  return CP4_VOLCANO_EVIDENCE;
}

state.cp4VolcanoEvidenceProgress=function(){return syncCP4VolcanoEvidence();};

const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function cp4VolcanoEvidenceStart(stageId,onEnd,blessingId){
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
