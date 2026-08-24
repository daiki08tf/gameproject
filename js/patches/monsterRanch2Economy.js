/* Monster Ranch 2.0 — research economy bridge */
import { state } from '../state.js';
const previousRelease=state.ranchReleaseCompanion?.bind(state);
if(previousRelease)state.ranchReleaseCompanion=function(instanceId){const result=previousRelease(instanceId);if(!result?.ok)return result;const mult=Math.max(1,Number(this.ranchFacilityEffects?.().memoryMult)||1),bonus=Math.max(0,Math.round(result.memory*(mult-1)));if(bonus>0){this.data.ranchMemory[result.speciesId]=(this.data.ranchMemory[result.speciesId]||0)+bonus;this.save();}return{...result,memory:result.memory+bonus,total:this.ranchMemory(result.speciesId),researchLabBonus:bonus};};
