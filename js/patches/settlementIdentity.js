import { state } from '../state.js';
import { SETTLEMENT_POLICIES,SETTLEMENT_FACTIONS,settlementPolicyAvailable } from '../data/settlementIdentity.js';

const META_KEY='__settlement3';
function ensureMeta(){
 const root=state.data.settlementBuildings??={hall:0,inn:0,market:0,watch:0,ranch:0};
 const meta=root[META_KEY]??={};let changed=false;
 if(!meta.identity||typeof meta.identity!=='object'||Array.isArray(meta.identity)){meta.identity={policy:null,factionStanding:{}};changed=true;}
 if(!meta.identity.factionStanding||typeof meta.identity.factionStanding!=='object'||Array.isArray(meta.identity.factionStanding)){meta.identity.factionStanding={};changed=true;}
 root[META_KEY]=meta;if(changed)state.save();return meta.identity;
}
function hall(){return state.settlementLevel?.('hall')||0;}
function currentPolicy(){const meta=ensureMeta();return SETTLEMENT_POLICIES.find(p=>p.id===meta.policy)||null;}

state.settlementPolicies=function(){const h=hall(),active=currentPolicy();return SETTLEMENT_POLICIES.map(p=>({...p,available:settlementPolicyAvailable(p,h),active:active?.id===p.id}));};
state.setSettlementPolicy=function(id){const p=SETTLEMENT_POLICIES.find(x=>x.id===id);if(!p)return{ok:false,reason:'unknown'};if(!settlementPolicyAvailable(p,hall()))return{ok:false,reason:'locked'};const meta=ensureMeta();meta.policy=id;this.save();return{ok:true,policy:p};};
state.clearSettlementPolicy=function(){const meta=ensureMeta();meta.policy=null;this.save();return{ok:true};};
state.settlementFactions=function(){const meta=ensureMeta(),active=currentPolicy();return SETTLEMENT_FACTIONS.map(f=>({...f,standing:Math.max(0,Math.floor(Number(meta.factionStanding[f.id]||0))),favored:active?.id===f.policy}));};
state.settlementIdentitySummary=function(){const policy=currentPolicy(),factions=this.settlementFactions();return{policy,focus:policy?.focus||null,factions,leading:factions.reduce((best,x)=>!best||x.standing>best.standing?x:best,null)};};
state.recordSettlementFactionActivity=function(factionId,amount=1){const f=SETTLEMENT_FACTIONS.find(x=>x.id===factionId);if(!f)return{ok:false,reason:'unknown'};const meta=ensureMeta(),gain=Math.max(0,Math.floor(Number(amount)||0));meta.factionStanding[factionId]=Math.max(0,Math.floor(Number(meta.factionStanding[factionId]||0)))+gain;this.save();return{ok:true,faction:f,standing:meta.factionStanding[factionId]};};
state.settlementPolicyBias=function(kind){const policy=currentPolicy();return policy?.focus===kind?1:0;};
