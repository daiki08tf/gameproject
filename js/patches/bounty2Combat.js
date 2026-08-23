import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { bountyBaseIdForStage } from '../data/bounty2.js';

const BASE_SCALE={
  'bounty-redfang-varg':{hp:1.45,atk:1.25,def:1.10,spd:1.10},
  'bounty-ash-knight':{hp:1.70,atk:1.30,def:1.35,spd:0.95},
  'bounty-fallen-oracle':{hp:1.80,atk:1.50,def:1.15,spd:1.10},
  'bounty-crownless':{hp:2.05,atk:1.60,def:1.25,spd:1.20},
  'bounty-omega-zero':{hp:2.50,atk:1.75,def:1.45,spd:1.25},
};

const prevSpawn=BattleEngine.prototype._spawnEnemy;
BattleEngine.prototype._spawnEnemy=function bounty2Spawn(type){
  const enemy=prevSpawn.call(this,type);
  const stage=this.stage;
  if(!enemy||!stage?.bounty2)return enemy;
  const base=BASE_SCALE[bountyBaseIdForStage(stage)]||{hp:1,atk:1,def:1,spd:1};
  const extra=stage.bounty2Scale||{hp:1,atk:1,def:1,spd:1};
  const nem=state.bountyNemesisInfo(stage);
  const nemMult=1+Math.min(.50,(nem.level||0)*.05);
  enemy.hp=enemy.maxHp=Math.round(enemy.maxHp*base.hp*extra.hp*nemMult);
  enemy.atk=Math.round(enemy.atk*base.atk*extra.atk*nemMult);
  enemy.def=Math.round(enemy.def*base.def*extra.def*(1+Math.min(.25,(nem.level||0)*.025)));
  enemy.spd=Math.round(enemy.spd*base.spd*extra.spd*(1+Math.min(.20,(nem.level||0)*.02)));
  enemy.xp=Math.round(enemy.xp*extra.hp);
  enemy.gold=Math.round(enemy.gold*extra.hp);
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
  return value;
};

const prevFinish=BattleEngine.prototype._finishBattle;
BattleEngine.prototype._finishBattle=function bounty2Finish(cleared,retreated){
  const stage=this.stage;
  const bounty=!!stage?.bounty;
  const baseId=bounty?bountyBaseIdForStage(stage):null;
  const nemBefore=bounty?state.bountyNemesisInfo(stage).level||0:0;
  prevFinish.call(this,cleared,retreated);
  if(!bounty)return;
  if(!cleared&&!retreated){
    const n=state.recordBountyLoss(stage);
    if(this.finalResult)this.finalResult.bountyNemesis={grew:true,level:n?.level||0,title:state.bountyNemesisTitle(stage)};
    return;
  }
  if(!cleared)return;
  const win=state.recordBountyWin(stage);
  const tier=stage.bounty2Tier;
  const baseMarks=tier==='ex'?8:tier==='variant'?3:1;
  const marks=baseMarks+(win?.bonusLevel||nemBefore)*2;
  state.addBountyMarks(marks);
  if(this.finalResult)this.finalResult.bounty2={baseId,tier:tier||'normal',marks,nemesisDefeated:(win?.bonusLevel||0)>0,totalMarks:state.bountyMarks()};
};
