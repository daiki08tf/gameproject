import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { uniqueBranchEffect } from '../data/uniqueBranchEffects.js';
import { chainMethod } from './patchUtils.js';

function equippedBranch(itemId){
  const p=state.getUniqueTrialProgress?.(itemId);
  if(!p?.branch) return null;
  return uniqueBranchEffect(itemId,p.branch);
}
function activeBranches(){
  const out=[];
  for(const id of Object.values(state.data.equipped||{})){
    if(!id) continue;
    const e=equippedBranch(id);
    if(e) out.push({itemId:id,...e});
  }
  return out;
}
function effects(engine,kind){ return (engine._uniqueBranchEffects||[]).flatMap(b=>b.effects||[]).filter(e=>e.kind===kind); }

// ---------- Stats ----------
chainMethod(state, 'getStats', (originalGetStats) => function getStatsWithUniqueBranches(){
  const s=originalGetStats();
  for(const b of activeBranches()){
    const x=b.stats||{};
    if(x.hpPct) s.hp=Math.round(s.hp*(1+x.hpPct));
    if(x.mpPct) s.mp=Math.round(s.mp*(1+x.mpPct));
    if(x.atkPct) s.atk=Math.round(s.atk*(1+x.atkPct));
    if(x.defPct) s.def=Math.round(s.def*(1+x.defPct));
    if(x.magPct) s.mag=Math.round(s.mag*(1+x.magPct));
    if(x.spdPct) s.spd=Math.round(s.spd*(1+x.spdPct)*10)/10;
    if(x.crit) s.critPct=Math.min(100,(s.critPct||0)+x.crit);
  }
  return s;
});

// BattleEngine構築後に現在の分岐を固定。戦闘中の装備変更はないため毎hit再探索しない。
const originalInit=BattleEngine.prototype.init;
if(originalInit){
  BattleEngine.prototype.init=function uniqueBranchInit(...args){
    const r=originalInit.apply(this,args); this._uniqueBranchEffects=activeBranches(); return r;
  };
}
const originalStart=BattleEngine.prototype.start;
if(originalStart){
  BattleEngine.prototype.start=function uniqueBranchStart(...args){
    const r=originalStart.apply(this,args); this._uniqueBranchEffects=activeBranches(); return r;
  };
}

// ---------- Damage rules ----------
const originalCalculateDamage=BattleEngine.prototype.calculateDamage;
BattleEngine.prototype.calculateDamage=function uniqueBranchDamage(atk,target,opts={}){
  const out=originalCalculateDamage.call(this,atk,target,opts);
  const hpRatio=this.player?.maxHp?this.player.hp/this.player.maxHp:1;
  const mpRatio=this.player?.maxMp?this.player.mp/this.player.maxMp:1;
  let mult=1;
  for(const e of effects(this,'lowHpDamage')) if(hpRatio<=e.threshold) mult*=1+e.power;
  for(const e of effects(this,'highHpDamage')) if(hpRatio>=e.threshold) mult*=1+e.power;
  for(const e of effects(this,'bossDamage')) if(target?.boss) mult*=1+e.power;
  for(const e of effects(this,'executeDamage')) if(target?.boss&&target.maxHp>0&&target.hp/target.maxHp<=e.threshold) mult*=1+e.power;
  for(const e of effects(this,'mpReserveDamage')) if(mpRatio>=e.threshold) mult*=1+e.power;
  if(this._uniqueNoRepeatStacks>0) for(const e of effects(this,'noRepeatDamage')) mult*=1+e.power*this._uniqueNoRepeatStacks;
  out.damage=Math.max(1,Math.round(out.damage*mult));
  return out;
};

// ---------- Guard branches ----------
const originalEnemyDamage=BattleEngine.prototype._enemyAttackDamage;
BattleEngine.prototype._enemyAttackDamage=function uniqueBranchGuardDamage(atk,opts={}){
  let dmg=originalEnemyDamage.call(this,atk,opts);
  if(this.player?.guarding){
    for(const e of effects(this,'guardFortress')) dmg=Math.max(1,Math.round(dmg*(1-e.power)));
    const charge=effects(this,'hurtCharge')[0];
    if(charge) this._uniqueHurtCharge=Math.min(charge.max,(this._uniqueHurtCharge||0)+charge.power);
  }
  return dmg;
};

const originalPlayerAttack=BattleEngine.prototype._playerAttack;
BattleEngine.prototype._playerAttack=function uniqueBranchAttack(targetId){
  const wasGuarding=!!this.player?.guarding;
  const target=this._pickTarget(targetId);
  const result=originalPlayerAttack.call(this,targetId);

  // 灰城/報復盾：ガード後の反撃強化。
  if(wasGuarding&&target&&!target.dead){
    let bonus=0;
    for(const e of effects(this,'guardCounter')) bonus=Math.max(bonus,e.power);
    if(this._uniqueHurtCharge){ bonus+=this._uniqueHurtCharge; this._uniqueHurtCharge=0; }
    if(bonus>0){
      const extra=Math.max(1,Math.round((result.damage||this._effectiveAtk())*bonus));
      const kill=this._applyRawDamageAndReward(target,extra);
      result.uniqueBranchExtra={kind:'guardCounter',damage:extra,targetName:target.name,kill};
    }
  }

  // フェンリル：瀕死時に確率追撃。
  const hpRatio=this.player?.maxHp?this.player.hp/this.player.maxHp:1;
  for(const e of effects(this,'lowHpExtraHit')){
    if(hpRatio<=e.threshold&&target&&!target.dead&&Math.random()<e.chance){
      const {damage}=this.calculateDamage(this._effectiveAtk(),target);
      const kill=this._applyRawDamageAndReward(target,damage);
      result.uniqueBranchExtra={kind:'fenrirExtra',damage,targetName:target.name,kill};
    }
  }

  // 真祖グラム：通常攻撃ダメージに応じて吸血。
  for(const e of effects(this,'lifesteal')){
    const heal=Math.max(0,Math.round((result.damage||0)*e.power));
    if(heal>0){ const before=this.player.hp; this.player.hp=Math.min(this.player.maxHp,this.player.hp+heal); result.uniqueBranchHeal=this.player.hp-before; }
  }

  // アストラ：既存の星追撃をさらに増幅（既に与えた追撃との差分を追加）。
  if(result.uniqueStarStrike&&target&&!target.dead){
    for(const e of effects(this,'starStrikeBoost')){
      const extra=Math.max(1,Math.round(result.uniqueStarStrike.damage*e.power));
      const kill=this._applyRawDamageAndReward(target,extra);
      result.uniqueBranchExtra={kind:'astraBoost',damage:extra,targetName:target.name,kill};
    }
    this._uniqueStarCount=(this._uniqueStarCount||0)+1;
    for(const e of effects(this,'starfallEvery')) if(this._uniqueStarCount%e.count===0&&target&&!target.dead){
      const {damage}=this.calculateDamage(this._effectiveMag()*e.power,target);
      const kill=this._applyRawDamageAndReward(target,damage);
      result.uniqueBranchBurst={kind:'starfall',damage,targetName:target.name,kill};
    }
  }
  return result;
};

// ---------- Spell economy ----------
const originalTechnique=BattleEngine.prototype._playerTechnique;
BattleEngine.prototype._playerTechnique=function uniqueBranchTechnique(kind,techId,targetId){
  const beforeMp=this.player?.mp||0;
  const result=originalTechnique.call(this,kind,techId,targetId);
  if(kind==='spell'&&!result.blocked){
    const spent=Math.max(0,beforeMp-(this.player?.mp||0));
    for(const e of effects(this,'spellMpRefund')) if(spent>0&&Math.random()<e.chance){
      const refund=Math.max(1,Math.round(spent*e.power));
      this.player.mp=Math.min(this.player.maxMp,this.player.mp+refund); result.uniqueMpRefund=refund;
    }
  }
  return result;
};

// ---------- Omega branches / Tyrant momentum ----------
const originalAdvanceTurn=BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn=function uniqueBranchTurn(command){
  const type=command?.type;
  if(type){
    const noRepeat=effects(this,'noRepeatDamage')[0];
    if(noRepeat){
      if(this._uniqueLastAction&&this._uniqueLastAction!==type) this._uniqueNoRepeatStacks=Math.min(noRepeat.maxStacks,(this._uniqueNoRepeatStacks||0)+1);
      else if(this._uniqueLastAction===type) this._uniqueNoRepeatStacks=0;
      this._uniqueLastAction=type;
    }
    const seq=effects(this,'sequenceMode')[0];
    if(seq&&['attack','skill','spell'].includes(type)){
      this._uniqueSequence=this._uniqueSequence||[];
      this._uniqueSequence.push(type); if(this._uniqueSequence.length>3)this._uniqueSequence.shift();
      if(this._uniqueSequence.length===3&&new Set(this._uniqueSequence).size===3){
        this._setBuff('atk',seq.power,seq.turns); this._setBuff('mag',seq.power,seq.turns); this._setBuff('spd',seq.power,seq.turns);
        this._uniqueSequence=[];
      }
    }
  }
  return originalAdvanceTurn.call(this,command);
};

// 表示用API
state.getUniqueEvolutionDisplay=function(itemId){
  const p=this.getUniqueTrialProgress?.(itemId); if(!p?.branch)return null;
  return uniqueBranchEffect(itemId,p.branch);
};
