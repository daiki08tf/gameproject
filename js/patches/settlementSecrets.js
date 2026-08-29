import { state } from '../state.js';
import { SETTLEMENT_HIDDEN_FACILITIES,SETTLEMENT_SECRET_QUESTS,settlementSecretFacilityEligible } from '../data/settlementSecrets.js';

const META_KEY='__settlement3';
function ensureMeta(){
 if(!state.data.settlementBuildings)state.data.settlementBuildings={hall:0,inn:0,market:0,watch:0,ranch:0};
 let root=state.data.settlementBuildings[META_KEY];
 if(!root||typeof root!=='object'||Array.isArray(root)){root={};state.data.settlementBuildings[META_KEY]=root;}
 let secret=root.secrets;
 let changed=false;
 if(!secret||typeof secret!=='object'||Array.isArray(secret)){secret={facilities:[],questStage:{},completedQuests:[],pendingEncounters:{}};root.secrets=secret;changed=true;}
 if(!Array.isArray(secret.facilities)){secret.facilities=[];changed=true;}
 if(!secret.questStage||typeof secret.questStage!=='object'||Array.isArray(secret.questStage)){secret.questStage={};changed=true;}
 if(!Array.isArray(secret.completedQuests)){secret.completedQuests=[];changed=true;}
 if(!secret.pendingEncounters||typeof secret.pendingEncounters!=='object'||Array.isArray(secret.pendingEncounters)){secret.pendingEncounters={};changed=true;}
 if(changed)state.save();
 return secret;
}
function context(){
 const exploration=state.settlementExplorationState?.()||{completed:[]};
 const residents=(state.settlementResidents?.()||[]).filter(x=>x.joined).map(x=>x.id);
 const codex=Object.values(state.data.monsterCodex||{});
 const seen=codex.filter(x=>x?.seen).length;
 const bossKills=codex.reduce((n,x)=>n+((x?.boss||x?.isBoss)?Number(x?.kills||0):0),0);
 return{hall:state.settlementLevel?.('hall')||0,completedExploration:exploration.completed||[],residents,codexSeen:seen,bossKills};
}
function syncFacilities(){
 const meta=ensureMeta(),ctx=context();let changed=false;
 for(const facility of SETTLEMENT_HIDDEN_FACILITIES)if(settlementSecretFacilityEligible(facility,ctx)&&!meta.facilities.includes(facility.id)){meta.facilities.push(facility.id);changed=true;}
 if(changed)state.save();return meta;
}

state.settlementHiddenFacilities=function(){const meta=syncFacilities();return SETTLEMENT_HIDDEN_FACILITIES.map(f=>({...f,discovered:meta.facilities.includes(f.id)}));};
state.settlementSecretQuests=function(){const meta=syncFacilities();return SETTLEMENT_SECRET_QUESTS.map(q=>{const unlocked=meta.facilities.includes(q.facilityId),stage=Math.max(0,Math.floor(Number(meta.questStage[q.id]||0))),completed=meta.completedQuests.includes(q.id),pending=meta.pendingEncounters[q.id]||null;return{...q,unlocked,stage,completed,pending,current:unlocked&&!completed?q.stages[Math.min(stage,q.stages.length-1)]||null:null};});};
state.settlementSecretSummary=function(){const facilities=this.settlementHiddenFacilities(),quests=this.settlementSecretQuests();return{facilities:facilities.filter(x=>x.discovered).length,totalFacilities:facilities.length,quests:quests.filter(x=>x.completed).length,totalQuests:quests.length,pendingBosses:quests.filter(x=>x.pending).length};};
state.advanceSettlementSecretQuest=function(id){
 const meta=syncFacilities(),quest=SETTLEMENT_SECRET_QUESTS.find(q=>q.id===id);if(!quest)return{ok:false,reason:'unknown'};
 if(!meta.facilities.includes(quest.facilityId))return{ok:false,reason:'locked'};
 if(meta.completedQuests.includes(id))return{ok:false,reason:'completed'};
 const index=Math.max(0,Math.floor(Number(meta.questStage[id]||0))),step=quest.stages[index];if(!step)return{ok:false,reason:'completed'};
 if(step.encounter){meta.pendingEncounters[id]=step.encounter;state.save();return{ok:true,pendingEncounter:true,quest,step,encounter:step.encounter};}
 meta.questStage[id]=index+1;let gained={};
 if(index+1>=quest.stages.length){meta.completedQuests.push(id);gained=this.addSettlementMaterials?.(step.reward||{})||{};}
 this.refreshSettlementResidents?.();this.save();return{ok:true,quest,step,gained,completed:meta.completedQuests.includes(id)};
};
state.completeSettlementSecretEncounter=function(id){
 const meta=syncFacilities(),quest=SETTLEMENT_SECRET_QUESTS.find(q=>q.id===id),encounter=meta.pendingEncounters[id];if(!quest||!encounter)return{ok:false,reason:'noEncounter'};
 delete meta.pendingEncounters[id];meta.questStage[id]=quest.stages.length;if(!meta.completedQuests.includes(id))meta.completedQuests.push(id);this.save();return{ok:true,quest,encounter};
};
state.settlementSecretEncounter=function(id){const meta=syncFacilities();return meta.pendingEncounters[id]||null;};
