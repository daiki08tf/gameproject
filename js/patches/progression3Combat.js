import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { DAMAGE_BUCKET, CAPS_LAYER, TEXT_BATTLE_LAYER } from '../data/balance.js';
import { sumPassivePower } from '../data/combatStats.js';

function isMagicEnemy(enemy){
  const text=`${enemy?.type||''} ${enemy?.name||''}`;
  return /(mage|wizard|witch|oracle|seer|spirit|ghost|wraith|element|sorcer|魔|術|霊|星|呪|精霊|予言|魔導|魔法)/i.test(text);
}

const oldEnemyAttackDamage=BattleEngine.prototype._enemyAttackDamage;
BattleEngine.prototype._enemyAttackDamage=function progression3IncomingDamage(atk,opts={}){
  if(!this._incomingMagic) return oldEnemyAttackDamage.call(this,atk,opts);
  const effectiveMdef=Math.max(0,Number(state.getStats().mdef||0));
  const mitigation=Math.min(CAPS_LAYER.DEF_MITIGATION_MAX,effectiveMdef/(effectiveMdef+DAMAGE_BUCKET.MITIGATION_K));
  let dmg=Math.max(1,atk*(1-mitigation));
  if(opts.mult==null){
    dmg*=TEXT_BATTLE_LAYER.NORMAL_ATTACK_DAMAGE_MULT;
  }else{
    dmg*=TEXT_BATTLE_LAYER.NORMAL_ATTACK_DAMAGE_MULT*opts.mult*TEXT_BATTLE_LAYER.TELEGRAPH_MULT_SCALE;
    dmg*=1-Math.min(0.5,sumPassivePower(this.effects,'bossSpecialMitigation'));
    for(const eff of this._effectsOf('passive')){
      if(eff.kind==='mpShield'&&this.player.maxMp>0&&this.player.mp/this.player.maxMp>=eff.threshold) dmg*=1-eff.power;
    }
  }
  if(this.player.guarding){
    dmg*=this.player.guardOverrideMult!=null?this.player.guardOverrideMult:TEXT_BATTLE_LAYER.GUARD_DAMAGE_MULT;
    dmg*=Math.max(0.1,1-sumPassivePower(this.effects,'guardMitigation'));
  }
  return Math.max(1,Math.round(dmg));
};

const oldEnemyTurn=BattleEngine.prototype.performEnemyTurn;
BattleEngine.prototype.performEnemyTurn=function progression3EnemyTurn(enemy){
  const prev=this._incomingMagic;
  this._incomingMagic=isMagicEnemy(enemy);
  try{return oldEnemyTurn.call(this,enemy);}finally{this._incomingMagic=prev;}
};

const oldBossSpecial=BattleEngine.prototype._resolveBossSpecial;
BattleEngine.prototype._resolveBossSpecial=function progression3BossSpecial(enemy,kind,justPhased){
  const prev=this._incomingMagic;
  // projectileは魔法/遠隔エネルギー系としてMDEF、slam/chargeは物理DEF。
  this._incomingMagic=kind==='projectile'||isMagicEnemy(enemy);
  try{return oldBossSpecial.call(this,enemy,kind,justPhased);}finally{this._incomingMagic=prev;}
};
