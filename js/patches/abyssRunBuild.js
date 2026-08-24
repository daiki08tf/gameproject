/* ============================================================
   Abyss 3.0 — Run Build runtime
   ============================================================ */
import { state } from '../state.js';
import { abyssRunBoon, abyssRunBoonChoices, abyssRunSynergies, aggregateAbyssRunEffects } from '../data/abyssRunBuild.js';

function ensure(){
  if(!state.data.abyssRun || typeof state.data.abyssRun!=='object') state.data.abyssRun={active:false,startDepth:0,lastDepth:0,clears:0,picks:0,ranks:{}};
  const r=state.data.abyssRun;
  if(!r.ranks||typeof r.ranks!=='object')r.ranks={};
  r.active=!!r.active;r.startDepth=Math.max(0,Math.floor(Number(r.startDepth)||0));r.lastDepth=Math.max(0,Math.floor(Number(r.lastDepth)||0));r.clears=Math.max(0,Math.floor(Number(r.clears)||0));r.picks=Math.max(0,Math.floor(Number(r.picks)||0));
  return r;
}

state.abyssRun=function(){return ensure();};
state.abyssRunStart=function(depth){const r=ensure();if(!r.active){r.active=true;r.startDepth=Math.max(1,Math.floor(Number(depth)||1));r.lastDepth=r.startDepth-1;r.clears=0;r.picks=0;r.ranks={};this.save();}return r;};
state.abyssRunEnd=function(){const old={...ensure(),ranks:{...ensure().ranks}};this.data.abyssRun={active:false,startDepth:0,lastDepth:0,clears:0,picks:0,ranks:{}};this.save();return old;};
state.abyssRunRecordClear=function(depth){const r=this.abyssRunStart(depth);const d=Math.max(1,Math.floor(Number(depth)||1));if(d>r.lastDepth){r.lastDepth=d;r.clears+=1;this.save();return true;}return false;};
state.abyssRunChoices=function(depth){const r=ensure();return abyssRunBoonChoices(depth,r.picks,r.ranks);};
state.abyssRunPick=function(id){const r=ensure(),b=abyssRunBoon(id);if(!r.active||!b)return null;const rank=r.ranks[id]||0;if(rank>=b.maxRank)return null;r.ranks[id]=rank+1;r.picks+=1;this.save();return{boon:b,rank:r.ranks[id],synergies:abyssRunSynergies(r.ranks)};};
state.abyssRunEffects=function(){return aggregateAbyssRunEffects(ensure().ranks);};
state.abyssRunSynergies=function(){return abyssRunSynergies(ensure().ranks);};

const oldGetStats=state.getStats.bind(state);
state.getStats=function abyssRunStats(){const s=oldGetStats();const r=ensure();if(!r.active)return s;const e=this.abyssRunEffects();return{...s,hp:Math.max(1,Math.round(s.hp*(1+e.hpMultAdd))),mp:Math.max(1,Math.round(s.mp*(1+e.mpMultAdd))),atk:Math.max(1,Math.round(s.atk*(1+e.atkMultAdd))),def:Math.max(0,Math.round(s.def*(1+e.defMultAdd))),mag:Math.max(1,Math.round(s.mag*(1+e.magMultAdd))),spd:Math.max(1,Math.round(s.spd*(1+e.spdMultAdd)*10)/10),critPct:Math.min(100,(s.critPct||0)+e.critAdd),evasion:Math.min(.75,(s.evasion||0)+e.evasionAdd)};};

const oldEffects=state.getEquippedEffects.bind(state);
state.getEquippedEffects=function abyssRunEffectsBridge(){const effects=oldEffects();const r=ensure();if(!r.active)return effects;const e=this.abyssRunEffects();if(e.damageAdd)effects.push({trigger:'passive',kind:'dmgBonusAdd',power:e.damageAdd,__abyssRun:true});if(e.spellDamageAdd)effects.push({trigger:'passive',kind:'spellDmgAdd',power:e.spellDamageAdd,__abyssRun:true});if(e.healOnKill)effects.push({trigger:'onKill',kind:'healOnKill',power:e.healOnKill,__abyssRun:true});if(e.critExtraChance)effects.push({trigger:'onCrit',kind:'critExtraAttack',chance:e.critExtraChance,power:.55,perActionCap:1,__abyssRun:true});return effects;};

export { ensure as ensureAbyssRun };
