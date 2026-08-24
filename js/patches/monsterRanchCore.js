import { state } from '../state.js';
import { getCompanionSpecies } from '../data/companions.js';
import { godRollProfile,memoryValue,ranchCapacity,researchLevel,researchUnlocked } from '../data/monsterRanch.js';

function ensure(){let changed=false;if(!state.data.ranchResearch){state.data.ranchResearch={};changed=true;}if(!state.data.ranchMemory){state.data.ranchMemory={};changed=true;}for(const inst of Object.values(state.data.companionInstances||{}))if(inst.favorite==null){inst.favorite=false;changed=true;}if(changed)state.save();}
ensure();
state.ranchCapacity=function(){return ranchCapacity(this.settlementLevel?.('ranch')||0);};
state.ranchCount=function(){return Object.keys(this.data.companionInstances||{}).length;};
state.ranchHasSpace=function(){return this.ranchCount()<this.ranchCapacity();};
state.ranchResearch=function(speciesId){ensure();const r=this.data.ranchResearch[speciesId]||{recruited:0,released:0};return{...r,level:researchLevel(r.recruited),mastered:researchUnlocked(r.recruited,'mastered')};};
state.recordRanchRecruit=function(speciesId){ensure();const r=this.data.ranchResearch[speciesId]||(this.data.ranchResearch[speciesId]={recruited:0,released:0});r.recruited++;this.save();return this.ranchResearch(speciesId);};
state.ranchMemory=function(speciesId){ensure();return Math.max(0,Math.floor(this.data.ranchMemory[speciesId]||0));};
state.toggleCompanionFavorite=function(instanceId){ensure();const inst=this.data.companionInstances?.[instanceId];if(!inst)return false;inst.favorite=!inst.favorite;this.save();return inst.favorite;};
state.ranchReleaseCompanion=function(instanceId){ensure();const inst=this.data.companionInstances?.[instanceId];if(!inst||inst.favorite)return{ok:false,reason:inst?.favorite?'favorite':'missing'};const speciesId=inst.speciesId,value=memoryValue(inst);if(!this.releaseCompanion(instanceId))return{ok:false,reason:'release'};this.data.ranchMemory[speciesId]=(this.data.ranchMemory[speciesId]||0)+value;const r=this.data.ranchResearch[speciesId]||(this.data.ranchResearch[speciesId]={recruited:0,released:0});r.released++;this.save();return{ok:true,speciesId,memory:value,total:this.ranchMemory(speciesId)};};
state.ranchCompanionInfo=function(instanceId){const c=this.getCompanion?.(instanceId);if(!c)return null;return{...c,godRoll:godRollProfile(c.instance),research:this.ranchResearch(c.species.id),memory:this.ranchMemory(c.species.id)};};
state.ranchSpeciesSummary=function(speciesId){const species=getCompanionSpecies(speciesId);if(!species)return null;const owned=Object.entries(this.data.companionInstances||{}).filter(([,x])=>x.speciesId===speciesId).map(([id])=>this.ranchCompanionInfo(id)).filter(Boolean);owned.sort((a,b)=>(b.godRoll.score-a.godRoll.score)||b.instance.level-a.instance.level);return{species,research:this.ranchResearch(speciesId),memory:this.ranchMemory(speciesId),owned,best:owned[0]||null};};
