import { state } from '../state.js';
import { SETTLEMENT_DEFENSE_PROJECTS,SETTLEMENT_INVASIONS,settlementDefenseIncidentEligible } from '../data/settlementDefense.js';

const META_KEY='__settlement3';
function ensureMeta(){
 if(!state.data.settlementBuildings)state.data.settlementBuildings={hall:0,inn:0,market:0,watch:0,ranch:0};
 let root=state.data.settlementBuildings[META_KEY];
 if(!root||typeof root!=='object'||Array.isArray(root)){root={};state.data.settlementBuildings[META_KEY]=root;}
 let defense=root.defense;let changed=false;
 if(!defense||typeof defense!=='object'||Array.isArray(defense)){defense={projects:{},cleared:[],attempts:{},pending:null};root.defense=defense;changed=true;}
 if(!defense.projects||typeof defense.projects!=='object'||Array.isArray(defense.projects)){defense.projects={};changed=true;}
 if(!Array.isArray(defense.cleared)){defense.cleared=[];changed=true;}
 if(!defense.attempts||typeof defense.attempts!=='object'||Array.isArray(defense.attempts)){defense.attempts={};changed=true;}
 if(defense.pending!==null&&typeof defense.pending!=='string'){defense.pending=null;changed=true;}
 if(changed)state.save();return defense;
}
function context(){
 const codex=Object.values(state.data.monsterCodex||{});
 const bossKills=codex.reduce((n,x)=>n+((x?.boss||x?.isBoss)?Number(x?.kills||0):0),0);
 const secret=state.settlementSecretQuests?.()||[];
 return{hall:state.settlementLevel?.('hall')||0,watch:state.settlementLevel?.('watch')||0,market:state.settlementLevel?.('market')||0,bossKills,completedSecrets:secret.filter(x=>x.completed).length};
}
function project(id){return SETTLEMENT_DEFENSE_PROJECTS.find(x=>x.id===id)||null;}
function invasion(id){return SETTLEMENT_INVASIONS.find(x=>x.id===id)||null;}

state.settlementDefenseProjects=function(){const meta=ensureMeta();return SETTLEMENT_DEFENSE_PROJECTS.map(p=>({...p,level:Math.max(0,Math.min(p.maxLevel,Math.floor(Number(meta.projects[p.id]||0))))}));};
state.canUpgradeSettlementDefense=function(id){const meta=ensureMeta(),p=project(id);if(!p)return{ok:false,reason:'unknown'};const level=Math.max(0,Math.floor(Number(meta.projects[id]||0)));if(level>=p.maxLevel)return{ok:false,reason:'max'};const cost=p.costs[level];for(const [k,v] of Object.entries(cost||{}))if((this.data.settlementMaterials?.[k]||0)<v)return{ok:false,reason:'materials',cost,level};return{ok:true,cost,level,next:level+1};};
state.upgradeSettlementDefense=function(id){const check=this.canUpgradeSettlementDefense(id);if(!check.ok)return check;for(const [k,v] of Object.entries(check.cost))this.data.settlementMaterials[k]-=v;const meta=ensureMeta();meta.projects[id]=check.next;this.recordSettlementFactionActivity?.('adventurers',1);this.save();return{ok:true,id,level:check.next};};
state.settlementDefenseIncidents=function(){const meta=ensureMeta(),ctx=context(),favored=this.settlementPolicyBias?.('defense')===1;return SETTLEMENT_INVASIONS.map(i=>({...i,available:settlementDefenseIncidentEligible(i,ctx),cleared:meta.cleared.includes(i.id),attempts:Number(meta.attempts[i.id]||0),pending:meta.pending===i.id,policyFavored:favored})).sort((a,b)=>favored?Number(b.pending)-Number(a.pending)||Number(b.available)-Number(a.available)||Number(a.cleared)-Number(b.cleared):0);};
state.settlementDefenseSummary=function(){const projects=this.settlementDefenseProjects(),incidents=this.settlementDefenseIncidents();return{projectLevels:projects.reduce((n,p)=>n+p.level,0),maxProjectLevels:projects.reduce((n,p)=>n+p.maxLevel,0),available:incidents.filter(x=>x.available).length,cleared:incidents.filter(x=>x.cleared).length,total:incidents.length,pending:incidents.find(x=>x.pending)?.id||null};};
state.startSettlementDefense=function(id){const meta=ensureMeta(),i=invasion(id);if(!i)return{ok:false,reason:'unknown'};if(!settlementDefenseIncidentEligible(i,context()))return{ok:false,reason:'locked'};if(meta.pending)return{ok:false,reason:'pending'};meta.pending=id;meta.attempts[id]=Number(meta.attempts[id]||0)+1;this.save();return{ok:true,incident:i,encounter:{...i.encounter,defenseProjects:Object.fromEntries(this.settlementDefenseProjects().map(p=>[p.id,p.level]))}};};
state.resolveSettlementDefense=function(id,cleared){const meta=ensureMeta(),i=invasion(id);if(!i||meta.pending!==id)return{ok:false,reason:'noPending'};meta.pending=null;if(!cleared){this.save();return{ok:true,cleared:false,incident:i,buildingLoss:false};}const first=!meta.cleared.includes(id);if(first)meta.cleared.push(id);const gained=first?(this.addSettlementMaterials?.(i.firstReward||{})||{}):{};if(cleared)this.recordSettlementFactionActivity?.('adventurers',1);this.save();return{ok:true,cleared:true,first,incident:i,gained,buildingLoss:false};};
state.settlementDefenseEncounter=function(){const meta=ensureMeta();const i=invasion(meta.pending);return i?{...i.encounter,incidentId:i.id}:null;};