import { state } from '../state.js';
import { generateRiftKey, riftDanger, riftReward } from '../data/riftKeys.js';
function ensure(){ if(!Array.isArray(state.data.riftKeys)) state.data.riftKeys=[]; if(!Number.isFinite(state.data.riftKeySeq)) state.data.riftKeySeq=1; }
ensure();
state.riftKeys=function(){ ensure(); return this.data.riftKeys; };
state.addRiftKey=function(depth){ ensure(); const key=generateRiftKey(depth,`${Date.now()}_${this.data.riftKeySeq++}`); this.data.riftKeys.push(key); if(this.data.riftKeys.length>40)this.data.riftKeys.shift(); this.save(); return key; };
state.consumeRiftKey=function(id){ ensure(); const i=this.data.riftKeys.findIndex(k=>k.id===id); if(i<0)return null; const key=this.data.riftKeys.splice(i,1)[0]; this.save(); return key; };
state.riftKeyModifiers=function(key){ const dangers=(key?.dangers||[]).map(riftDanger).filter(Boolean), reward=riftReward(key?.reward); const mult=k=>dangers.reduce((m,d)=>m*(d[k]||1),1); return { enemyHpMult:mult('enemyHpMult'), enemyAtkMult:mult('enemyAtkMult'), enemyDefMult:mult('enemyDefMult'), enemySpeedMult:mult('enemySpeedMult'), healMult:mult('healMult'), reward }; };
