import { state } from '../state.js';
import { uniqueTrialDef } from '../data/uniqueTrials.js';

function ensure(){
  state.data.uniqueTrials ??= {};
  return state.data.uniqueTrials;
}
function slot(itemId){
  const all=ensure();
  all[itemId] ??= {counts:{}, awakened:false, branch:null};
  return all[itemId];
}
state.recordUniqueTrialEvent=function(event, amount=1){
  const equipped=Object.values(this.data.equipped||{}).filter(Boolean);
  let changed=false;
  for(const itemId of equipped){
    const def=uniqueTrialDef(itemId); if(!def) continue;
    const p=slot(itemId); p.counts[event]=(p.counts[event]||0)+amount; changed=true;
  }
  if(changed) this.save();
};
state.getUniqueTrialProgress=function(itemId){
  const def=uniqueTrialDef(itemId); if(!def) return null;
  const p=slot(itemId);
  const trials=def.trials.map(t=>({...t,count:Math.min(t.target,p.counts[t.event]||0),done:(p.counts[t.event]||0)>=t.target}));
  return {...p,def,trials,ready:trials.every(t=>t.done)};
};
state.awakenUnique=function(itemId){
  const p=this.getUniqueTrialProgress(itemId); if(!p?.ready) return false;
  slot(itemId).awakened=true; this.save(); return true;
};
state.uniqueBranchAvailability=function(itemId){
  const def=uniqueTrialDef(itemId), p=slot(itemId); if(!def||!p.awakened) return [];
  return def.branches.map(b=>({...b,ready:b.requirements.every(r=>(p.counts[r.event]||0)>=r.target)}));
};
state.chooseUniqueBranch=function(itemId,branchId){
  const p=slot(itemId); if(p.branch) return false;
  const branch=this.uniqueBranchAvailability(itemId).find(b=>b.id===branchId&&b.ready); if(!branch)return false;
  p.branch=branchId; this.save(); return true;
};
