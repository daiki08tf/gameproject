/* Phase 9.5 — Eighth Key progression bridge. */
import { state } from '../state.js';
import { EIGHTH_KEY_STAGES, eighthKeyProgress } from '../data/phase9EighthKey.js';

state.phase9EighthKeyProgress=function(){
  const gateOpen=!!this.phase9NextWorldUnlocked?.();
  const progress=eighthKeyProgress(id=>this.isStageCleared(id));
  return{...progress,gateOpen,stages:EIGHTH_KEY_STAGES.map(def=>({...def,unlocked:gateOpen&&(!def.requires||this.isStageCleared(def.requires)),cleared:this.isStageCleared(def.id)}))};
};

state.phase9EighthKeyStageUnlocked=function(stageId){
  const progress=this.phase9EighthKeyProgress();
  return !!progress.stages.find(s=>s.id===stageId)?.unlocked;
};

state.phase9MachineWorldUnlocked=function(){
  return !!this.phase9EighthKeyProgress().open;
};

// World 3 realm rendering already consumes world2.flags. Expose live getters here
// instead of storing a second copy of the Phase 9 progression state.
state.data.world2 ||= {flags:{}};
state.data.world2.flags ||= {};
for(const [key,get] of Object.entries({
  phase9EighthKeyObserved:()=>!!state.phase9NextWorldUnlocked?.(),
  phase9MachineWorldOpen:()=>!!state.phase9MachineWorldUnlocked?.(),
})){
  try{Object.defineProperty(state.data.world2.flags,key,{configurable:true,enumerable:true,get});}catch{}
}
