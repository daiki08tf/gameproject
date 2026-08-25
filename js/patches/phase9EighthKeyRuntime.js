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
