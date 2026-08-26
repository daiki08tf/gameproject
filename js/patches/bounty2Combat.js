import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { bountyBaseIdForStage } from '../data/bounty2.js';
import { abyssCombatScale } from '../data/abyssEndgame.js';
import { nemesisHuntBonus,nemesisTraitsFor,nemesisWeaknessBonus } from '../data/nemesis3.js';

const BASE_SCALE={
  'bounty-redfang-varg':{hp:1.45,atk:1.25,def:1.10,spd:1.10},
  'bounty-ash-knight':{hp:1.70,atk:1.30,def:1.35,spd:0.95},
  'bounty-fallen-oracle':{hp:1.80,atk:1.50,def:1.15,spd:1.10},
  'bounty-crownless':{hp:2.05,atk:1.60,def:1.25,spd:1.20},
  'bounty-omega-zero':{hp:2.50,atk:1.75,def:1.45,spd:1.25},
};

function traitProduct(traits,key){return traits.reduce((m,t)=>m*(Number(t?.[key])||1),1);}

const prevSpawn=BattleEngine.prototype._spawnEnemy;
BattleEngine.prototype._spawnEnemy=function bounty2Spawn(type){
  const enemy=prevSpawn.call(this,type);
  const stage=this.stage;
  if(!enemy||!stage?.bounty2)return enemy;
  const base=BASE_SCALE[bountyBaseIdForStage(stage)]||{hp:1,atk:1,def:1,spd:1};
  const extra=stage.bounty2Scale||{hp:1,atk:1,def:1,spd:1};
  const nem=state.bountyNemesisInfo(stage),traits=nemesisTraitsFor(nem),hunt=nemesisHuntBonus(nem.huntMode),intel=nemesisWeaknessBonus(nem.intel);
  const nemMult=1+Math.min(.75,(nem.level||0)*.05);
  const era=stage.bounty2Tier==='ex'&&stage.bountyAbyssDepth?abyssCombatScale(stage.bountyAbyssDepth):{hp:1,atk:1,def:1};
  enemy.hp=enemy.maxHp=Math.round(enemy.maxHp*base.hp*extra.hp*era.hp*nemMult*traitProduct(traits,'hp')*(hunt.enemyHp||1));
  enemy.atk=Math.round(enemy.atk*base.atk*extra.atk*era.atk*nemMult*traitProduct(traits,'atk')*(hunt.enemyAtk||1));
  enemy.def=Math.round(enemy.def*base.def*extra.def*era.def*(1+Math.min(.35,(nem.level||0)*.025))*traitProduct(traits,'def')*(hunt.enemyDef||1)*intel.enemyDef);
  enemy.spd=Math.round(enemy.spd*base.spd*extra.spd*(1+Math.min(.30,(nem.level||0)*.02))*traitProduct(traits,'spd')*(hunt.enemySpd||1)*intel.enemySpd);
  enemy.xp=Math.round(enemy.xp*extra.hp*Math.max(1,Math.sqrt(era.hp)));
  enemy.gold=Math.round(enemy.gold*extra.hp);
  enemy.nemesis3={level:nem.level||0,traits:traits.map(t=>t.id),huntMode:nem.huntMode||null,intel:[...(nem.intel||[])]};
  if(nem.level>0) enemy.name=`${state.bountyNemesisTitle(stage)}${enemy.name}`;
  return enemy;
};

const prevEnemyStat=BattleEngine.prototype._effectiveEnemyStat;
BattleEngine.prototype._effectiveEnemyStat=function bounty2Gimmick(enemy,stat){
  let value=prevEnemyStat.call(this,enemy,stat);
  if(!this.stage?.bounty2)return value;
  const id=bountyBaseIdForStage(this.stage);
  const hpRatio=enemy?.maxHp>0?enemy.hp/enemy.maxHp:1;
  const ex=this.stage.bounty2Tier==='ex';
  const power=ex?1.22:1.10;
  if(id==='bounty-redfang-varg'&&hpRatio<=.30){if(stat==='atk')value*=1.40*power;if(stat==='spd')value*=1.30*power;if(stat==='def')value*=.80;}
  if(id==='bounty-ash-knight'&&stat==='def'){const phase=(this.round||1)%3;value*=phase===0?(ex?.42:.50):(ex?1.95:1.78);}
  if(id==='bounty-fallen-oracle'&&stat==='atk'&&(this.round||1)%3===0)value*=ex?2.30:2.05;
  if(id==='bounty-crownless'&&stat==='atk'){const r=this.round||1;if(r>=6)value*=1+Math.min(ex?2.1:1.75,(r-5)*(ex?.30:.25));}
  if(id==='bounty-omega-zero'){if(hpRatio<=.66&&stat==='atk')value*=ex?1.35:1.25;if(hpRatio<=.33){if(stat==='atk')value*=ex?1.55:1.42;if(stat==='spd')value*=ex?1.60:1.48;if(stat==='def')value*=.88;}}
  if(stat==='atk'&&enemy?.nemesis3){
    const traits=nemesisTraitsFor({traits:enemy.nemesis3.traits});
    for(const t of traits){if(t.enrageAtk&&hpRatio<=.30)value*=t.enrageAtk;if(t.roundAtk)value*=1+Math.min(.60,Math.max(0,(this.round||1)-1)*t.roundAtk);}
  }
  return value;
};

const prevFinish=BattleEngine.prototype._finishBattle;
BattleEngine.prototype._finishBattle=function bounty2Finish(cleared,retreated){
  const stage=this.stage;
  const bounty=!!stage?.bounty;
  const baseId=bounty?bountyBaseIdForStage(stage):null;
  const before=bounty?state.bountyNemesisInfo(stage):null;
  const nemBefore=before?.level||0;
  prevFinish.call(this,cleared,retreated);
  if(!bounty)return;
  if(!cleared&&!retreated){
    const n=state.recordBountyLoss(stage);
    if(this.finalResult)this.finalResult.bountyNemesis={grew:true,level:n?.level||0,title:state.bountyNemesisTitle(stage),traits:(n?.traits||[]).map(t=>({id:t.id,name:t.name})),newTrait:(n?.level||0)%3===0?(n?.traits||[]).at(-1)?.name||null:null};
    return;
  }
  if(!cleared)return;
  const win=state.recordBountyWin(stage);
  const tier=stage.bounty2Tier;
  const baseMarks=tier==='ex'?8:tier==='variant'?3:1;
  const hunt=nemesisHuntBonus(win?.huntMode),intel=nemesisWeaknessBonus(win?.intel),traitReward=nemesisTraitsFor({traits:win?.traits}).reduce((m,t)=>m*(t.reward||1),1);
  const rewardMult=(hunt.reward||1)*(intel.reward||1)*traitReward;
  const marks=Math.max(1,Math.round((baseMarks+(win?.bonusLevel||nemBefore)*2)*rewardMult));
  state.addBountyMarks(marks);
  if(this.finalResult)this.finalResult.bounty2={baseId,tier:tier||'normal',marks,nemesisDefeated:(win?.bonusLevel||0)>0,totalMarks:state.bountyMarks(),nemesisLevel:win?.bonusLevel||0,nemesisTraits:(win?.traits||[]),huntMode:win?.huntMode||null,rewardMult};
};
