import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { secretJobPhase2 } from '../data/secretJobPhase2.js';

function active(){ const id=state.data.activeSecretJobId; return id?{id,def:secretJobPhase2(id)}:null; }
function mastered(id){ return !!id && state.isMastered?.(id); }
function partyCount(){ const list=state.companionList?.(); return Array.isArray(list)?list.length:Object.keys(state.data.companionInstances||{}).length; }

// Progression 3.0: secret job-specific permanent growth profile.
const baseGrowth=state.getGrowthPerCharacterLevel.bind(state);
state.getGrowthPerCharacterLevel=function secretGrowth(jobId=this.currentJobId){
  const s=secretJobPhase2(jobId)||((jobId===this.data.activeSecretJobId)?secretJobPhase2(this.data.activeSecretJobId):null);
  return s?{...s.growth}:baseGrowth(jobId);
};

// Current-job identity: small active modifiers layered on top of permanent growth.
const baseStats=state.getStats.bind(state);
state.getStats=function secretStats(){
  const out=baseStats(); const a=active(); if(!a?.def)return out;
  const mods={...a.def.statMods};
  if(a.id==='secret_beastlord'&&partyCount()>0){ mods.atk=(mods.atk||0)+a.def.rules.partyBonus; mods.spd=(mods.spd||0)+a.def.rules.partyBonus*0.5; }
  for(const [k,p] of Object.entries(mods)) if(Number.isFinite(out[k])) out[k]=Math.max(1,Math.round(out[k]*(1+p)*10)/10);
  return out;
};

// Battle snapshot.
const baseStart=BattleEngine.prototype.start;
if(baseStart) BattleEngine.prototype.start=function secretJobStart(...args){ const r=baseStart.apply(this,args); const a=active(); this._secretJob=a; this._secretStacks=0; this._secretSpellPrimed=false; return r; };
const baseInit=BattleEngine.prototype.init;
if(baseInit) BattleEngine.prototype.init=function secretJobInit(...args){ const r=baseInit.apply(this,args); const a=active(); this._secretJob=a; this._secretStacks=0; this._secretSpellPrimed=false; return r; };

const baseDamage=BattleEngine.prototype.calculateDamage;
BattleEngine.prototype.calculateDamage=function secretJobDamage(atk,target,opts={}){
  const out=baseDamage.call(this,atk,target,opts); const a=this._secretJob; if(!a?.def)return out;
  const rules=a.def.rules||{}; let mult=1;
  if(a.id==='secret_darkknight'){
    const ratio=this.player?.maxHp?this.player.hp/this.player.maxHp:1;
    if(ratio<=rules.threshold) mult*=1+rules.lowHpBonus+(mastered(a.id)?rules.masterBonus:0);
  }
  if(a.id==='secret_necromancer' && opts?.magic) mult*=1+(this._secretStacks||0)*rules.stackMag+(mastered(a.id)?rules.masterBonus:0);
  if(a.id==='secret_executioner' && target?.boss){
    mult*=1+rules.bossBonus;
    const ratio=target.maxHp?target.hp/target.maxHp:1;
    if(ratio<=rules.threshold) mult*=1+rules.finisherBonus+(mastered(a.id)?rules.masterBonus:0);
  }
  out.damage=Math.max(1,Math.round(out.damage*mult)); return out;
};

const baseTechnique=BattleEngine.prototype._playerTechnique;
BattleEngine.prototype._playerTechnique=function secretJobTechnique(kind,techId,targetId){
  const result=baseTechnique.call(this,kind,techId,targetId);
  if(this._secretJob?.id==='secret_spellblade'&&kind==='spell'&&!result?.blocked) this._secretSpellPrimed=true;
  return result;
};

const baseAttack=BattleEngine.prototype._playerAttack;
BattleEngine.prototype._playerAttack=function secretJobAttack(targetId){
  const target=this._pickTarget?.(targetId); const result=baseAttack.call(this,targetId); const a=this._secretJob; if(!a?.def)return result;
  if(a.id==='secret_spellblade'&&this._secretSpellPrimed&&target&&!target.dead){
    const bonus=(a.def.rules.echo||0)+(mastered(a.id)?a.def.rules.masterBonus:0);
    const extra=Math.max(1,Math.round((this._effectiveMag?.()||state.getStats().mag)*bonus));
    const done=this._applyRawDamageAndReward?.(target,extra);
    result.secretJobExtra={kind:'magicEcho',damage:extra,targetName:target.name,done}; this._secretSpellPrimed=false;
  }
  if(a.id==='secret_darkknight'){
    const heal=Math.max(0,Math.round((result.damage||0)*(a.def.rules.drain||0)));
    if(heal>0&&this.player){ const before=this.player.hp; this.player.hp=Math.min(this.player.maxHp,this.player.hp+heal); result.secretJobHeal=this.player.hp-before; }
  }
  return result;
};

// Generic enemy reward hook: necromancer gains stacks/MP whenever its own attack resolves an enemy.
const baseReward=BattleEngine.prototype._applyRawDamageAndReward;
if(baseReward) BattleEngine.prototype._applyRawDamageAndReward=function secretReward(target,damage,...rest){
  const before=!!target?.dead; const r=baseReward.call(this,target,damage,...rest); const a=this._secretJob;
  if(a?.id==='secret_necromancer'&&!before&&target?.dead){
    const max=(a.def.rules.maxStacks||5)+(mastered(a.id)?2:0); this._secretStacks=Math.min(max,(this._secretStacks||0)+1);
    if(this.player?.maxMp){ const restore=Math.max(1,Math.round(this.player.maxMp*(a.def.rules.mpRestore||0))); this.player.mp=Math.min(this.player.maxMp,this.player.mp+restore); }
  }
  return r;
};

state.getSecretJobPhase2Display=function(id){ const d=secretJobPhase2(id); if(!d)return null; return {...d,mastered:this.isMastered?.(id)||false}; };
