/* Phase 8 — Skill + Fusion Constellation runtime. */
import { state } from '../state.js';
import { constellationTreeFor, constellationNode } from '../data/jobConstellationTrees.js';
import { fusionConstellationFor } from '../data/fusionConstellation.js';
import { getFusionJobById, fusionRegistryAudit } from '../data/jobFusionRegistry.js';
import { TIER_INFO } from '../data/jobs.js';
import { CAPS_LAYER } from '../data/balance.js';
import { chainMethod } from './patchUtils.js';

function ensure(target=state){target.data.jobConstellation||={};target.data.fusionConstellation||={};target.data.activeFusionId||=null;target.data.fusionConstellationVersion||=2;return target.data;}
const BASIC_MASTER=TIER_INFO.basic.masteryLv||15;
state.constellationPointsEarned=function(jobId){return Math.max(0,this.jobProgress(jobId).level-1);};
state.constellationPurchased=function(jobId){return new Set(ensure(this).jobConstellation[jobId]||[]);};
state.constellationPointsSpent=function(jobId){const b=this.constellationPurchased(jobId);return constellationTreeFor(jobId).reduce((s,n)=>s+(b.has(n.id)?n.cost:0),0);};
state.constellationPointsAvailable=function(jobId){return Math.max(0,this.constellationPointsEarned(jobId)-this.constellationPointsSpent(jobId));};
state.constellationNodeStatus=function(jobId,nodeId){const n=constellationNode(jobId,nodeId);if(!n)return{exists:false,bought:false,canBuy:false};const b=this.constellationPurchased(jobId),prereq=n.requires.every(id=>b.has(id)),masteryOk=n.kind!=='master'||this.isMastered(jobId),canBuy=!b.has(n.id)&&prereq&&masteryOk&&this.constellationPointsAvailable(jobId)>=n.cost;return{exists:true,bought:b.has(n.id),prereq,masteryOk,canBuy,node:n};};
state.buyConstellationNode=function(jobId,nodeId){const s=this.constellationNodeStatus(jobId,nodeId);if(!s.canBuy)return false;const d=ensure(this).jobConstellation;d[jobId]||=[];d[jobId].push(nodeId);this.save();return true;};
state.activeConstellationNodes=function(jobId=this.currentJobId){const b=this.constellationPurchased(jobId);return constellationTreeFor(jobId).filter(n=>b.has(n.id));};

state.isFusionDiscovered=function(fusionId){const f=getFusionJobById(fusionId);return !!(f&&f.parents.every(id=>this.isMastered(id)));};
state.fusionPointsEarned=function(fusionId){const f=getFusionJobById(fusionId);if(!f||!this.isFusionDiscovered(fusionId))return 0;return 1+f.parents.reduce((s,id)=>s+Math.floor(Math.max(0,this.jobProgress(id).level-BASIC_MASTER)/5),0);};
state.fusionPurchased=function(fusionId){return new Set(ensure(this).fusionConstellation[fusionId]||[]);};
state.fusionPointsSpent=function(fusionId){const b=this.fusionPurchased(fusionId);return fusionConstellationFor(fusionId).reduce((s,n)=>s+(b.has(n.id)?n.cost:0),0);};
state.fusionPointsAvailable=function(fusionId){return Math.max(0,this.fusionPointsEarned(fusionId)-this.fusionPointsSpent(fusionId));};
state.fusionNodeStatus=function(fusionId,nodeId){const nodes=fusionConstellationFor(fusionId),n=nodes.find(x=>x.id===nodeId);if(!n)return{exists:false,bought:false,canBuy:false};const b=this.fusionPurchased(fusionId),requires=(n.requires||[]).every(id=>b.has(id)),requiresAny=!n.requiresAny?.length||n.requiresAny.some(id=>b.has(id));let exclusiveOk=true;if(n.exclusiveGroup)exclusiveOk=!nodes.some(x=>x.id!==n.id&&x.exclusiveGroup===n.exclusiveGroup&&b.has(x.id));const prereq=requires&&requiresAny&&exclusiveOk,discovered=this.isFusionDiscovered(fusionId),canBuy=discovered&&!b.has(n.id)&&prereq&&this.fusionPointsAvailable(fusionId)>=n.cost;return{exists:true,bought:b.has(n.id),prereq,requires,requiresAny,exclusiveOk,discovered,canBuy,node:n};};
state.buyFusionNode=function(fusionId,nodeId){const s=this.fusionNodeStatus(fusionId,nodeId);if(!s.canBuy)return false;const d=ensure(this).fusionConstellation;d[fusionId]||=[];d[fusionId].push(nodeId);this.save();return true;};
state.resetFusionConstellation=function(fusionId){if(!getFusionJobById(fusionId))return false;ensure(this).fusionConstellation[fusionId]=[];this.save();return true;};
state.setActiveFusion=function(fusionId){if(fusionId!==null&&!this.isFusionDiscovered(fusionId))return false;ensure(this).activeFusionId=fusionId;this.save();return true;};
state.activeFusionId=function(){const id=ensure(this).activeFusionId;return id&&this.isFusionDiscovered(id)?id:null;};
state.activeFusionNodes=function(){const id=this.activeFusionId();if(!id)return[];const b=this.fusionPurchased(id);return fusionConstellationFor(id).filter(n=>b.has(n.id));};
state.fusionBuildSummary=function(fusionId){const f=getFusionJobById(fusionId);if(!f)return null;const nodes=fusionConstellationFor(fusionId),b=this.fusionPurchased(fusionId),path=nodes.find(n=>n.kind==='fusionSpecialization'&&b.has(n.id));return{id:f.id,name:f.name,discovered:this.isFusionDiscovered(fusionId),active:this.activeFusionId()===fusionId,path:path?.name||null,points:this.fusionPointsAvailable(fusionId),purchased:[...b]};};

function applyStats(stats,n){for(const[key,m]of Object.entries(n.statMult||{})){if(key==='spd')stats.spd=Math.max(.1,Math.round(stats.spd*m*10)/10);else if(stats[key]!=null)stats[key]=Math.max(1,Math.round(stats[key]*m));}for(const[key,a]of Object.entries(n.statAdd||{})){if(key==='critPct')stats.critPct=Math.min(CAPS_LAYER.CRIT_PCT_MAX,stats.critPct+a);else if(key==='armorPen')stats.armorPen=Math.min(CAPS_LAYER.ARMOR_PEN_MAX,(stats.armorPen||0)+a);else if(key==='evasion')stats.evasion=Math.min(CAPS_LAYER.EVASION_MAX,(stats.evasion||0)+a);}}
chainMethod(state,'getStats',(previous)=>function constellationStats(){const stats=previous();for(const n of [...this.activeConstellationNodes(),...this.activeFusionNodes()])applyStats(stats,n);return stats;});
const previousEffects=state.getEquippedEffects.bind(state);
state.getEquippedEffects=function constellationEffects(){const effects=previousEffects();for(const n of [...this.activeConstellationNodes(),...this.activeFusionNodes()])for(const effect of n.effects||[])effects.push({...effect,__constellation:n.id});return effects;};
state.auditFusionRuntime=function(){const registry=fusionRegistryAudit();const invalid=[];for(const[id,purchased]of Object.entries(ensure(this).fusionConstellation)){if(!getFusionJobById(id)){invalid.push({id,reason:'unknown_fusion'});continue;}const valid=new Set(fusionConstellationFor(id).map(n=>n.id));for(const nodeId of purchased||[])if(!valid.has(nodeId))invalid.push({id,nodeId,reason:'unknown_node'});}return{ok:registry.ok&&invalid.length===0,registry,invalid};};
ensure();
