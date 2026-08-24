/* Monster Ranch 1.6 — discovery, lineage and awakening */
import { state } from '../state.js';
import { MUTATION_DEFS,mutationChance,mutationsForSpecies } from '../data/monsterMutations.js';
function ensure(){state.data.ranchMutations ||= {discovered:{},lineages:{}};state.data.ranchMutations.discovered ||= {};state.data.ranchMutations.lineages ||= {};}
ensure();
function boardComplete(speciesId){const nodes=state.ranchSpeciesBoardNodes||[];const ranks=state.ranchBoardRanks?.(speciesId)||{};return nodes.length>0&&nodes.every(n=>(ranks[n.id]||0)>=n.maxRank);}
function discovered(id){ensure();return !!state.data.ranchMutations.discovered[id];}
function mark(id){ensure();state.data.ranchMutations.discovered[id]=true;state.save();}
function applyMutation(inst,def){inst.mutationId=def.id;inst.mutationName=def.name;inst.mutationTier=def.tier;inst.mutationTrait=def.trait;inst.mutationStatMult={...(def.statMult||{})};mark(def.id);return inst;}
state.ranchMutationDef=id=>MUTATION_DEFS[id]||null;
state.ranchMutationDiscovered=discovered;
state.ranchMutationLineage=function(speciesId){return mutationsForSpecies(speciesId).map(x=>({...x,discovered:discovered(x.id)}));};
state.rollRanchMutation=function(instanceId,{beastDen=false}={}){const inst=this.data.companionInstances?.[instanceId];if(!inst||inst.mutationId)return null;const research=this.ranchResearch?.(inst.speciesId)||{recruited:0};const defs=mutationsForSpecies(inst.speciesId).filter(x=>x.tier==='rare');for(const def of defs){const chance=mutationChance({tier:def.tier,recruited:research.recruited,boardComplete:boardComplete(inst.speciesId),beastDen});if(Math.random()<chance){applyMutation(inst,def);this.save();return{...def,chance};}}return null;};
state.canAwakenRanchMutation=function(instanceId,mutationId){const inst=this.data.companionInstances?.[instanceId],def=MUTATION_DEFS[mutationId];if(!inst||!def||def.baseSpeciesId!==inst.speciesId)return{ok:false,reason:'invalid'};if(def.requiresMutation&&inst.mutationId!==def.requiresMutation)return{ok:false,reason:'lineage'};const bond=Number(inst.bondLevel)||1;if(def.tier==='upper'&&bond<8)return{ok:false,reason:'bond',required:8};if(def.id==='fenrir'){if(bond<10)return{ok:false,reason:'bond',required:10};if((this.ranchResearch?.(inst.speciesId)?.recruited||0)<100)return{ok:false,reason:'mastery',required:100};if(!discovered('forest_white_wolf')||!discovered('forest_black_wolf'))return{ok:false,reason:'lineageKnowledge'};}return{ok:true};};
state.awakenRanchMutation=function(instanceId,mutationId){const check=this.canAwakenRanchMutation(instanceId,mutationId);if(!check.ok)return check;const inst=this.data.companionInstances[instanceId],def=MUTATION_DEFS[mutationId];applyMutation(inst,def);this.save();return{ok:true,mutation:def};};
state.ranchMutationStatMult=function(instanceId){const inst=this.data.companionInstances?.[instanceId];return inst?.mutationStatMult||{};};
