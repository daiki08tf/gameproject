/* Phase 10.1 — World Tier runtime and combat integration. */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { WORLD_TIERS, worldTier, unlockedWorldTiers } from '../data/worldTiers.js';

const ELITE_HP=1.55,ELITE_ATK=1.25,ELITE_DEF=1.15,ELITE_REWARD=1.60;
function ensure(){
  state.data.worldTierId??='normal';
  const unlocked=unlockedWorldTiers(state.characterLevel);
  if(!unlocked.some(t=>t.id===state.data.worldTierId))state.data.worldTierId=unlocked.at(-1)?.id||'normal';
  return state.data.worldTierId;
}
state.worldTiers=function(){return WORLD_TIERS.map(t=>({...t,unlocked:this.characterLevel>=t.unlockLevel}));};
state.activeWorldTier=function(){return worldTier(ensure());};
state.setWorldTier=function(id){
  const tier=worldTier(id);
  if(this.characterLevel<tier.unlockLevel)return false;
  this.data.worldTierId=tier.id;this.save();return true;
};
state.worldTierUnlocked=function(id){return this.characterLevel>=worldTier(id).unlockLevel;};
state.worldTierDropMult=function(){return this.activeWorldTier().drop;};
state.worldTierItemPowerBonus=function(){return this.activeWorldTier().itemPowerBonus;};

if(!BattleEngine.prototype.__worldTierWrapped){
  BattleEngine.prototype.__worldTierWrapped=true;
  const prevSpawn=BattleEngine.prototype._spawnEnemy;
  BattleEngine.prototype._spawnEnemy=function(type){
    const enemy=prevSpawn.call(this,type);
    if(this.stage?.isAbyss)return enemy;
    const tier=state.activeWorldTier();
    this.worldTier=tier;
    if(tier.rank<=0)return enemy;
    enemy.hp=Math.max(1,Math.round(enemy.hp*tier.enemyHp));enemy.maxHp=enemy.hp;
    enemy.atk=Math.max(1,Math.round(enemy.atk*tier.enemyAtk));
    enemy.def=Math.max(0,Math.round(enemy.def*tier.enemyDef));
    enemy.spd=Math.max(1,Math.round(enemy.spd*tier.enemySpd));
    enemy.xp=Math.max(1,Math.round(enemy.xp*tier.reward));
    enemy.gold=Math.max(0,Math.round(enemy.gold*tier.reward));
    if(!enemy.boss&&!enemy.elite&&Math.random()<tier.eliteChance){
      enemy.elite=true;enemy.hp=Math.round(enemy.hp*ELITE_HP);enemy.maxHp=enemy.hp;
      enemy.atk=Math.round(enemy.atk*ELITE_ATK);enemy.def=Math.round(enemy.def*ELITE_DEF);
      enemy.xp=Math.round(enemy.xp*ELITE_REWARD);enemy.gold=Math.round(enemy.gold*ELITE_REWARD);
    }
    if(enemy.boss){
      for(const key of ['slamTurns','chargeTurns','projectileTurns','summonTurns']){
        if(Number.isFinite(enemy[key]))enemy[key]=Math.max(1,Math.round(enemy[key]*tier.aiHaste));
      }
    }
    enemy.worldTierId=tier.id;
    return enemy;
  };

  const prevDrop=BattleEngine.prototype._rollDrop;
  if(typeof prevDrop==='function')BattleEngine.prototype._rollDrop=function(...args){
    if(this.stage?.isAbyss)return prevDrop.apply(this,args);
    const tier=state.activeWorldTier();
    const oldDrop=this.stage.dropMult,oldIp=this.stage.itemPowerTarget;
    this.stage.dropMult=(Number(oldDrop)||1)*tier.drop;
    if(Number.isFinite(oldIp))this.stage.itemPowerTarget=Math.min(10000,oldIp+tier.itemPowerBonus);
    try{return prevDrop.apply(this,args);}finally{
      if(oldDrop===undefined)delete this.stage.dropMult;else this.stage.dropMult=oldDrop;
      if(oldIp===undefined)delete this.stage.itemPowerTarget;else this.stage.itemPowerTarget=oldIp;
    }
  };
}

ensure();
