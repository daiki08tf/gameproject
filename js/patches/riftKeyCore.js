import { state } from '../state.js';
import { generateRiftKey, riftDanger, riftReward } from '../data/riftKeys.js';
function ensure(){ if(!state.data||typeof state.data!=='object')throw new Error('Rift Key requires initialized state.data'); if(!Array.isArray(state.data.riftKeys)) state.data.riftKeys=[]; if(!Number.isSafeInteger(state.data.riftKeySeq)||state.data.riftKeySeq<1)state.data.riftKeySeq=1; }
ensure();
state.riftKeys=function(){ ensure(); return this.data.riftKeys; };
state.addRiftKey=function(depth){ ensure(); const n=Number(depth); if(!Number.isFinite(n)||n<1)return null; const key=generateRiftKey(n,`${Date.now()}_${this.data.riftKeySeq++}`); this.data.riftKeys.push(key); if(this.data.riftKeys.length>40)this.data.riftKeys.splice(0,this.data.riftKeys.length-40); this.save(); return key; };
state.consumeRiftKey=function(id){ ensure(); if(!id)return null; const i=this.data.riftKeys.findIndex(k=>k?.id===id); if(i<0)return null; const key=this.data.riftKeys.splice(i,1)[0]; this.save(); return key; };
state.riftKeyModifiers=function(key){ const dangers=(Array.isArray(key?.dangers)?key.dangers:[]).map(riftDanger).filter(Boolean), reward=riftReward(key?.reward); const mult=k=>dangers.reduce((m,d)=>m*(Number.isFinite(d[k])?d[k]:1),1); return { enemyHpMult:mult('enemyHpMult'), enemyAtkMult:mult('enemyAtkMult'), enemyDefMult:mult('enemyDefMult'), enemySpeedMult:mult('enemySpeedMult'), healMult:mult('healMult'), reward }; };
